const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Pojazd = require('../models/Pojazd');
const Rezerwacja = require('../models/Rezerwacja'); // Potrzebne do blokady usuwania

// [GET] Pobierz listę aut zalogowanego użytkownika
router.get('/', auth, async (req, res) => {
    try {
        const pojazdy = await Pojazd.find({ wlascicielId: req.user.id });
        res.json(pojazdy);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas pobierania pojazdów' });
    }
});

// [GET] Pobierz szczegóły jednego pojazdu
router.get('/:id', auth, async (req, res) => {
    try {
        const pojazd = await Pojazd.findOne({ _id: req.params.id, wlascicielId: req.user.id });
        if (!pojazd) {
            return res.status(404).json({ message: 'Pojazd nie istnieje lub brak uprawnień' });
        }
        res.json(pojazd);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas pobierania pojazdu' });
    }
});

// [POST] Dodaj nowy pojazd
router.post('/', auth, async (req, res) => {
    try {
        const { marka, model, rejestracja } = req.body;

        if (!marka || !model || !rejestracja) {
            return res.status(400).json({ message: 'Wypełnij wszystkie dane pojazdu' });
        }

        const istniejacyPojazd = await Pojazd.findOne({ numer_rejestracyjny: rejestracja });
        if (istniejacyPojazd) {
            return res.status(400).json({ message: 'Pojazd o takiej rejestracji jest już w bazie' });
        }

        const nowyPojazd = new Pojazd({
            marka,
            model,
            numer_rejestracyjny: rejestracja,
            wlascicielId: req.user.id
        });

        const zapisanyPojazd = await nowyPojazd.save();
        res.status(201).json(zapisanyPojazd);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas dodawania pojazdu' });
    }
});

// [PUT] Edytuj pojazd (Dodatkowy, przydatny endpoint)
router.put('/:id', auth, async (req, res) => {
    try {
        const zaktualizowanyPojazd = await Pojazd.findOneAndUpdate(
            { _id: req.params.id, wlascicielId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!zaktualizowanyPojazd) {
            return res.status(404).json({ message: 'Pojazd nie istnieje lub brak uprawnień' });
        }
        res.json(zaktualizowanyPojazd);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas aktualizacji pojazdu' });
    }
});

// [DELETE] Usuń pojazd (Z blokadą dla aktywnych rezerwacji)
router.delete('/:id', auth, async (req, res) => {
    try {
        const pojazd = await Pojazd.findOne({ _id: req.params.id, wlascicielId: req.user.id });
        if (!pojazd) {
            return res.status(404).json({ message: 'Pojazd nie istnieje lub brak uprawnień' });
        }

        const aktywneRezerwacje = await Rezerwacja.findOne({
            pojazdId: req.params.id,
            dataDo: { $gte: new Date() },
            status: { $nin: ['anulowana', 'zakonczona'] }
        });

        if (aktywneRezerwacje) {
            return res.status(400).json({ 
                message: 'Nie można usunąć pojazdu, który jest przypisany do trwającej lub przyszłej rezerwacji.' 
            });
        }

        await Pojazd.findByIdAndDelete(req.params.id);
        res.json({ message: 'Pojazd został pomyślnie usunięty' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas usuwania pojazdu' });
    }
});

module.exports = router;