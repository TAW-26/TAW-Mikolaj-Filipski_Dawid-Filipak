const mongoose = require('mongoose');

const raportSchema = new mongoose.Schema({
  administratorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
  dane: { type: String, required: true },
  dataUtworzenia: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Raport', raportSchema);