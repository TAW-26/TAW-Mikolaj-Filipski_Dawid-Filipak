const mongoose = require('mongoose');

const pojazdSchema = new mongoose.Schema({
  wlascicielId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  marka: { type: String, required: true },
  model: { type: String, required: true },
  numer_rejestracyjny: { type: String, required: true, uppercase: true, unique: true }
});

module.exports = mongoose.model('Pojazd', pojazdSchema);