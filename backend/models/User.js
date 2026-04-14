const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  haslo: { type: String, required: true },
  rola: { type: String, enum: ['klient', 'admin', 'obsluga'], default: 'klient' }
});

module.exports = mongoose.model('User', userSchema);