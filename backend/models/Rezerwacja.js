const mongoose = require('mongoose');

const rezerwacjaSchema = new mongoose.Schema({
  uzytkownikId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
  pojazdId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pojazd', required: true },
  dataOd: { type: Date, required: true },
  dataDo: { type: Date, required: true },
  koszt: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['aktywna', 'anulowana', 'zakonczona'], 
    default: 'aktywna' 
  }
});

module.exports = mongoose.model('Rezerwacja', rezerwacjaSchema);