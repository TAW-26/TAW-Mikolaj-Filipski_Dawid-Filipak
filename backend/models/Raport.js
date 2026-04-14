const mongoose = require('mongoose');

const raportSchema = new mongoose.Schema({
  administrator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
  dane: { type: String, required: true },
  data_utworzenia: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Raport', raportSchema);