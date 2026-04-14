const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Utwórz nową rezerwację
router.post('/', auth, async (req, res) => {
    res.json({ message: "Endpoint: Tworzenie nowej rezerwacji" });
});

// Pobierz rezerwacje zalogowanego użytkownika
router.get('/moje', auth, async (req, res) => {
    res.json({ message: "Endpoint: Lista Twoich rezerwacji" });
});

// Przedłuż rezerwację
router.patch('/:id/przedluz', auth, async (req, res) => {
    res.json({ message: `Endpoint: Przedłużanie rezerwacji ${req.params.id}` });
});

// Zakończ rezerwację
router.patch('/:id/zakoncz', auth, async (req, res) => {
    res.json({ message: `Endpoint: Kończenie rezerwacji ${req.params.id}` });
});

module.exports = router;