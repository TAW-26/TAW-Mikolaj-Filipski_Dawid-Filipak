const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios'); // Dodano do obsługi zapytań do API map

const auth = require('./middleware/auth');
const User = require('./models/User');
const Parking = require('./models/Parking'); 
const Pojazd = require('./models/Pojazd');
const Raport = require('./models/Raport');
const Rezerwacja = require('./models/Rezerwacja');

app.use(express.json());

// --- 1. KONFIGURACJA CORS ---
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

app.use(session({
  secret: 'bezpieczny_klucz_sesji_123',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, secure: false }
}));

const handleGeocoding = async (request) => {
  const { payload, method } = request;

  if (method === 'post' && payload.adres && payload.miasto) {
    const query = `${payload.adres}, ${payload.miasto}`;
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 1
        },
        headers: { 
          'User-Agent': 'SystemParkingowyAdmin/1.0' 
        }
      });

      if (response.data && response.data.length > 0) {
        payload.lat = parseFloat(response.data[0].lat);
        payload.lng = parseFloat(response.data[0].lon);
        console.log(`[Geocoding] Sukces: ${query} -> [${payload.lat}, ${payload.lng}]`);
      } else {
        console.warn(`[Geocoding] Nie znaleziono współrzędnych dla: ${query}`);
      }
    } catch (error) {
      console.error('[Geocoding] Błąd API:', error.message);
    }
  }
  return request;
};
const startAdmin = async () => {
  try {
    const { default: AdminJS } = await import('adminjs');
    const AdminJSExpress = await import('@adminjs/express');
    const AdminJSMongoose = await import('@adminjs/mongoose');

    const mongooseAdapter = AdminJSMongoose.default || AdminJSMongoose;
    AdminJS.registerAdapter(mongooseAdapter);

    const adminOptions = {
      resources: [
        { resource: User, options: { navigation: { name: 'Użytkownicy', icon: 'User' } } },
        { 
          resource: Parking, 
          options: { 
            navigation: { name: 'Zarządzanie', icon: 'Map' },
            actions: {
              new: { before: [handleGeocoding] },
              edit: { before: [handleGeocoding] }
            },
            properties: {
              lat: { isVisible: { list: true, edit: false, filter: true, show: true } },
              lng: { isVisible: { list: true, edit: false, filter: true, show: true } }
            }
          } 
        },
        { resource: Rezerwacja, options: { navigation: { name: 'Zarządzanie', icon: 'Calendar' } } },
        { resource: Pojazd, options: { navigation: { name: 'Zarządzanie', icon: 'Car' } } },
        { resource: Raport, options: { navigation: { name: 'Dane', icon: 'Document' } } },
      ],
      rootPath: '/admin',
      branding: {
        companyName: 'Parking Admin',
        softwareBrothers: false,
      }
    };

    const admin = new AdminJS(adminOptions);
    const expressAdapter = AdminJSExpress.default || AdminJSExpress;

    const adminRouter = expressAdapter.buildAuthenticatedRouter(admin, {
      authenticate: async (email, password) => {
        const user = await User.findOne({ email });
        
        if (user) {
          if (user.rola !== 'admin') {
            console.log(`Próba nieautoryzowanego dostępu: ${email}`);
            return false;
          }
          const isPasswordValid = await bcrypt.compare(password, user.haslo);
          if (isPasswordValid) {
            return { email: user.email, title: user.email };
          }
        }
        return null;
      },
      cookiePassword: 'haslo-do-szyfrowania-ciasteczek-123',
    }, null, {
      resave: false, 
      saveUninitialized: true,
    });

    app.use(admin.options.rootPath, adminRouter);
    console.log('Panel AdminJS dostępny pod /admin');

    app.get('/', auth, (req, res) => res.send('Backend działa!'));
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/parkingi', require('./routes/parkingRoutes'));
    app.use('/api/rezerwacje', require('./routes/rezerwacjaRoutes'));
    app.use('/api/raporty', require('./routes/raportRoutes'));
    app.use('/api/pojazdy', require('./routes/pojazdRoutes'));

    app.listen(3000, () => {
      console.log('Serwer Express działa na http://localhost:3000');
    });

  } catch (error) {
    console.error('Błąd krytyczny podczas startu AdminJS:', error);
  }
};

const dbURI = 'mongodb://mikolajfili_db_user:LzxSdAqTTUfrnp8@ac-tk18nj2-shard-00-00.zfkbmjv.mongodb.net:27017,ac-tk18nj2-shard-00-01.zfkbmjv.mongodb.net:27017,ac-tk18nj2-shard-00-02.zfkbmjv.mongodb.net:27017/?ssl=true&replicaSet=atlas-eadype-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(dbURI)
  .then(() => {
    console.log('Połączono z MongoDB Atlas');
    startAdmin();
  })
  .catch(err => {
    console.error('Błąd połączenia z bazą:', err);
    process.exit(1);
  });