const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email jest wymagany'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Niepoprawny adres email'
    ]
  },

  haslo: {
    type: String,
    required: [true, 'Hasło jest wymagane'],
    minlength: [8, 'Hasło musi mieć minimum 8 znaków']
  },

  rola: {
    type: String,
    enum: ['klient', 'admin', 'obsluga'],
    default: 'klient'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);