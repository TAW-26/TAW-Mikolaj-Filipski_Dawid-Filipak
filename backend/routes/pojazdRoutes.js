const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

//Pobierz listę aut użytkownika
router.get('/', auth, async (req, res) => {
    res.json({ message: "Endpoint: Pobieranie listy Twoich pojazdów" });
});

// Pobierz szczegóły jednego pojazdu
router.get('/:id', auth, async (req, res) => {
    res.json({ message: `Endpoint: Pobieranie szczegółów pojazdu o ID: ${req.params.id}` });
});

// Dodaj nowy pojazd (metoda dodajPojazd)
router.post('/', auth, async (req, res) => {
    res.json({ message: "Endpoint: Dodawanie nowego pojazdu" });
});

// Usuń pojazd (pamiętaj, że pojazd można usunąć tylko wtedy, gdy nie jest aktualnie używany w żadnej rezerwacji)
router.delete('/:id', auth, async (req, res) => {
    res.json({ message: `Endpoint: Usuwanie pojazdu o ID: ${req.params.id}` });
});

module.exports = router;