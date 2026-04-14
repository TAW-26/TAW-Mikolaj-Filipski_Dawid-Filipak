const mongoose = require('mongoose');

const rezerwacjaSchema = new mongoose.Schema({
  uzytkownik: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking' },
  status: { type: String, default: 'aktywna' },
  data_start: { type: Date, default: Date.now },
  data_zakonczenia: { type: Date },
  cena_calkowita: { type: Number },
  numer_rejestracyjny: { type: String }
});

module.exports = mongoose.model('Rezerwacja', rezerwacjaSchema);