const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { email, haslo, rola } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Użytkownik o takim adresie już istnieje" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(haslo, salt);

    user = new User({
      email,
      haslo: hashedPassword,
      rola: rola || 'klient'
    });

    await user.save();

    res.status(201).json({ message: "Użytkownik zarejestrowany!" });
  } catch (err) {
    res.status(500).json({ message: "Błąd rejestracji", error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, haslo } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Nieprawidłowe dane logowania" });
    }

    const isMatch = await bcrypt.compare(haslo, user.haslo);
    if (!isMatch) {
      return res.status(400).json({ message: "Nieprawidłowe dane logowania" });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        rola: user.rola 
      }, 
      process.env.JWT_SECRET || 'super_tajne_haslo',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        rola: user.rola
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Błąd serwera", error: err.message });
  }
});

// Endpoint do pobierania danych zalogowanego użytkownika
router.get('/me', auth, async (req, res) => {
    res.json({message: `Endpoint: Dane zalogowanego użytkownika (ID: ${req.user.id}, Rola: ${req.user.rola})`});
});

// Endpoint do pobierania danych użytkownika
router.get('/id', auth, async (req, res) => {
    res.json({ message: `Endpoint: Pobieranie użytkownika: ${req.user.id}` });
});
module.exports = router;