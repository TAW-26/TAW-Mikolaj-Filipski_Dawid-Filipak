const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
  nazwa: { type: String, required: true },
  opis: { type: String },
  adres: { type: String, required: true },
  typ: { type: String, enum: ['podziemny', 'naziemny', 'wielopoziomowy'], default: 'naziemny' },
  cenaZaGodzine: { type: Number, required: true },
  status: { type: String, enum: ['otwarty', 'zamknięty', 'pełny'], default: 'otwarty' },
  liczbaMiejsc: { type: Number, required: true }
});

module.exports = mongoose.model('Parking', parkingSchema);