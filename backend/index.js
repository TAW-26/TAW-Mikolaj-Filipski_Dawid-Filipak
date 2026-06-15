const express = require('express');
const app = express();
require('./cron/reservationCron');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios'); 

const auth = require('./middleware/auth');
const User = require('./models/User');
const Parking = require('./models/Parking'); 
const Pojazd = require('./models/Pojazd');
const Raport = require('./models/Raport');
const Rezerwacja = require('./models/Rezerwacja');

const { register } = require('./metrics/index');
const metricsMiddleware = require('./metrics/metricsMiddleware');

app.use(express.json());
app.use(metricsMiddleware);

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost';
app.use(cors({
  origin: allowedOrigin,
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
        params: { q: query, format: 'json', limit: 1 },
        headers: { 'User-Agent': 'SystemParkingowyAdmin/1.0' }
      });
      if (response.data && response.data.length > 0) {
        payload.lat = parseFloat(response.data[0].lat);
        payload.lng = parseFloat(response.data[0].lon);
        console.log(`[Geocoding] Sukces: ${query} -> [${payload.lat}, ${payload.lng}]`);
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

            properties: {
              lat: { isVisible: { list: true, edit: false, filter: true, show: true } },
              lng: { isVisible: { list: true, edit: false, filter: true, show: true } },

              wolneMiejsca: {
                isVisible: { list: true, show: true, edit: false, filter: false },
                isVirtual: true
              }
            },

            actions: {
              list: {
                after: async (response) => {
                  const Rezerwacja = require('./models/Rezerwacja');
                  const now = new Date();

                  await Promise.all(
                    response.records.map(async (record) => {

                      const parkingId = record.params._id;

                      const zajete = await Rezerwacja.countDocuments({
                        parkingId,
                        status: { $nin: ['anulowana', 'zakonczona'] },
                        dataOd: { $lt: now },
                        dataDo: { $gt: now }
                      });

                      const liczbaMiejsc = record.params.liczbaMiejsc || 0;

                      record.params.wolneMiejsca = Math.max(liczbaMiejsc - zajete, 0);
                    })
                  );

                  return response;
                }
              },
              generujRaport: {
                actionType: 'record',
                icon: 'Document',
                label: 'Zapisz raport',

                handler: async (request, response, context) => {
                  try {
                    const { record, currentAdmin } = context;

                    if (!currentAdmin) {
                      throw new Error('Brak autoryzacji');
                    }

                    const parkingId = record.params._id;

                    const Parking = require('./models/Parking');
                    const Rezerwacja = require('./models/Rezerwacja');
                    const Raport = require('./models/Raport');
                    const User = require('./models/User');

                    const parking = await Parking.findById(parkingId);
                    if (!parking) throw new Error('Parking nie znaleziony');

                    const rezerwacje = await Rezerwacja.find({ parkingId });

                    const calkowityDochod = rezerwacje.reduce(
                      (sum, r) => sum + (r.cenaCalkowita || r.koszt || 0),
                      0
                    );

                    const adminUser = await User.findOne({ email: currentAdmin.email });
                    if (!adminUser) throw new Error('Nie znaleziono admina');
                    
                    await Raport.create({
                      administratorId: adminUser._id,
                      parkingId: parking._id,
                      dane: `Raport: ${rezerwacje.length} rezerwacji, szacowany dochód całkowity: ${calkowityDochod.toFixed(2)} PLN`,
                      typ: 'pdf'
                    });

                    return {
                      record: record.toJSON(),
                      notice: {
                        message: `Raport dla "${parking.nazwa}" został zapisany.`,
                        type: 'success'
                      }
                    };

                  } catch (error) {
                    console.error('Błąd zapisu raportu:', error);

                    return {
                      record: record.toJSON(),
                      notice: {
                        message: error.message || 'Błąd zapisu raportu',
                        type: 'error'
                      }
                    };
                  }
                }
              }
            }
          }
        },
        { resource: Rezerwacja, options: { navigation: { name: 'Zarządzanie', icon: 'Calendar' } } },
        { resource: Pojazd, options: { navigation: { name: 'Zarządzanie', icon: 'Car' } } },
        { resource: Raport, options: { navigation: { name: 'Dane', icon: 'Document' } } },
      ],
      rootPath: '/admin',
      branding: { companyName: 'Parking Admin', softwareBrothers: false }
    };

    const admin = new AdminJS(adminOptions);
    const expressAdapter = AdminJSExpress.default || AdminJSExpress;

    const adminRouter = expressAdapter.buildAuthenticatedRouter(admin, {
      authenticate: async (email, password) => {
        const user = await User.findOne({ email });
        if (user) {
          if (user.rola !== 'admin') return false;
          const isPasswordValid = await bcrypt.compare(password, user.haslo);
          if (isPasswordValid) return { email: user.email, title: user.email };
        }
        return null;
      },
      cookiePassword: 'haslo-do-szyfrowania-ciasteczek-123',
    }, null, { resave: false, saveUninitialized: true });

    app.use(admin.options.rootPath, adminRouter);
    console.log('Panel AdminJS dostępny pod /admin');

  } catch (error) {
    console.error('Błąd krytyczny podczas startu AdminJS:', error);
  }
};

app.get('/', auth, (req, res) => res.send('Backend działa!'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/parkingi', require('./routes/parkingRoutes'));
app.use('/api/rezerwacje', require('./routes/rezerwacjaRoutes'));
app.use('/api/raporty', require('./routes/raportRoutes'));
app.use('/api/pojazdy', require('./routes/pojazdRoutes'));

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use((err, req, res, next) => {
  const errorLog = {
    czas_wystapienia: new Date().toISOString(),
    typ_bledu: err.name || 'RuntimeError',
    kontekst: {
      wiadomosc: err.message,
      metoda_http: req.method,
      sciezka: req.originalUrl,
      body_zapytania: req.body, 
      stack_trace: err.stack    
    }
  };

  console.error('------- WYSTĄPIŁ BŁĄD SERWERA -------');
  console.error(JSON.stringify(errorLog, null, 2));
  console.error('-------------------------------------');

  res.status(500).json({ success: false, message: 'Wystąpił błąd wewnętrzny serwera.' });
});

const fallbackDB = 'mongodb://mikolajfili_db_user:LzxSdAqTTUfrnp8@ac-tk18nj2-shard-00-00.zfkbmjv.mongodb.net:27017,ac-tk18nj2-shard-00-01.zfkbmjv.mongodb.net:27017,ac-tk18nj2-shard-00-02.zfkbmjv.mongodb.net:27017/?ssl=true&replicaSet=atlas-eadype-shard-0&authSource=admin&appName=Cluster0';
const dbURI = process.env.MONGO_URI || fallbackDB;

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(dbURI)
    .then(async () => {
      if (dbURI.includes('mongo-db')) {
        console.log('Połączono z lokalnym MongoDB w kontenerze Docker');
      } else {
        console.log('Połączono z zewnętrznym MongoDB Atlas');
      }
      await startAdmin();
      app.listen(3000, () => {
        console.log('Serwer Express działa na porcie 3000');
      });
    })
    .catch(err => {
      console.error('Błąd połączenia z bazą:', err);
      process.exit(1);
    });
}

module.exports = { app };