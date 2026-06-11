const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

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


// Endpoint do pobierania wszystkich użytkowników (Tylko Admin)
router.get('/users', [auth, admin], async (req, res) => {
    try {
        const users = await User.find().select('-haslo');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Błąd podczas pobierania użytkowników' });
    }
});

// Endpoint do zmiany roli użytkownika (Tylko Admin)
router.put('/users/:id/rola', [auth, admin], async (req, res) => {
    try {
        const { rola } = req.body;
        if (!['klient', 'admin'].includes(rola)) {
            return res.status(400).json({ message: 'Nieprawidłowa rola' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { rola }, 
            { new: true }
        ).select('-haslo');

        if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
        res.json({ message: 'Rola zaktualizowana', user });
    } catch (err) {
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

// Endpoint do usuwania użytkownika (Tylko Admin)
router.delete('/users/:id', [auth, admin], async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
        
        res.json({ message: 'Użytkownik został usunięty' });
    } catch (err) {
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

module.exports = router;