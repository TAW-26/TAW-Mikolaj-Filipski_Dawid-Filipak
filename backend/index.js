const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');

const auth = require('./middleware/auth');
const User = require('./models/User');
const Parking = require('./models/Parking'); 
const Pojazd = require('./models/Pojazd');
const Raport = require('./models/Raport');
const Rezerwacja = require('./models/Rezerwacja');

app.use(express.json());

// ZAKTUALIZOWANA KONFIGURACJA CORS (Dodano 'PATCH')
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // <-- TUTAJ JEST PATCH
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

app.use(session({
  secret: 'bezpieczny_klucz_sesji_123',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, secure: false }
}));

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
        { resource: Parking, options: { navigation: { name: 'Zarządzanie', icon: 'Map' } } },
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

// --- 6. POŁĄCZENIE Z BAZĄ DANYCH ---
const dbURI = 'mongodb://mikolajfili_db_user:LzxSdAqTTUfrnp8@ac-tk18nj2-shard-00-00.zfkbmjv.mongodb.net:27017,ac-tk18nj2-shard-00-01.zfkbmjv.mongodb.net:27017,ac-tk18nj2-shard-00-02.zfkbmjv.mongodb.net:27017/?ssl=true&replicaSet=atlas-eadype-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(dbURI)
  .then(() => {
    console.log('Połączono z MongoDB Atlas');
    startAdmin(); // Startujemy wszystko po udanym połączeniu z bazą
  })
  .catch(err => {
    console.error('Błąd połączenia z bazą:', err);
    process.exit(1);
  });