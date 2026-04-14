const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Generowanie raportu
router.post('/generuj', auth, async (req, res) => {
    res.json({ message: "Endpoint: Generowanie raportu PDF" });
});

// Pobieranie listy raportów
router.get('/', auth, async (req, res) => {
    res.json({ message: "Endpoint: Lista raportów" });
});

module.exports = router;