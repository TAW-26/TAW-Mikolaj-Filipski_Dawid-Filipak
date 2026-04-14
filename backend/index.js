const express = require('express');
const app = express();

//middleware
app.use(express.json());

//baza danych
const mongoose = require('mongoose');
const auth = require('./middleware/auth');

mongoose.connect('mongodb+srv://mikolajfili_db_user:4FEKAIfJYnJO5xKa@cluster0.zfkbmjv.mongodb.net/?appName=Cluster0')
  .then(() => console.log('Połączono z MongoDB!'))
  .catch(err => console.error('Błąd połączenia:', err));

//routes
app.get('/', auth, (req, res) => res.send('Backend działa!'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/parkingi', require('./routes/parkingRoutes'));
app.use('/api/rezerwacje', require('./routes/rezerwacjaRoutes'));
app.use('/api/raporty', require('./routes/raportRoutes'));
app.use('/api/pojazdy', require('./routes/pojazdRoutes'));

app.listen(3000, () => console.log('Serwer startuje na porcie 3000'));