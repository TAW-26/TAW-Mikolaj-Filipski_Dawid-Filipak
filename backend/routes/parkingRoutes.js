const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Pobierz wszystkie parkingi
router.get('/', async (req, res) => {
    res.json({ message: "Endpoint: Pobieranie listy parkingów" });
});

// Pobierz szczegóły jednego parkingu
router.get('/:id', async (req, res) => {
    res.json({ message: `Endpoint: Szczegóły parkingu ${req.params.id}` });
});

// Sprawdź dostępność parkingu
router.get('/:id/dostepnosc', async (req, res) => {
    res.json({ message: `Endpoint: Sprawdzanie dostępności parkingu ${req.params.id}` });
});

// Dodaj nowy parking (Tylko Admin)
router.post('/', auth, async (req, res) => {
    res.json({ message: "Endpoint: Dodawanie parkingu (Admin)" });
});

// Aktualizuj dane parkingu (Admin i zmiana ilości miejsc)
router.put('/:id', auth, async (req, res) => {
    res.json({ message: `Endpoint: Aktualizacja parkingu ${req.params.id}` });
});



module.exports = router;