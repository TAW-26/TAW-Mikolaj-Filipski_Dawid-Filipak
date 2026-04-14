const mongoose = require('mongoose');

const pojazdSchema = new mongoose.Schema({
  uzytkownik: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  numer_rejestracyjny: { type: String, required: true, uppercase: true }
});

module.exports = mongoose.model('Pojazd', pojazdSchema);