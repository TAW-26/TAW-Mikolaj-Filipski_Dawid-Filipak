const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); // Nasz nowy middleware do sprawdzania uprawnień
const Parking = require('../models/Parking');
const Rezerwacja = require('../models/Rezerwacja'); // Potrzebne do obliczania dostępności

// [GET] Pobierz wszystkie parkingi (Dostępne dla każdego)
router.get('/', async (req, res) => {
    try {
        const parkingi = await Parking.find();
        res.json(parkingi);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera podczas pobierania parkingów' });
    }
});

// [GET] Pobierz szczegóły jednego parkingu (Dostępne dla każdego)
router.get('/:id', async (req, res) => {
    try {
        const parking = await Parking.findById(req.params.id);
        if (!parking) {
            return res.status(404).json({ message: 'Nie znaleziono takiego parkingu' });
        }
        res.json(parking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera podczas pobierania szczegółów parkingu' });
    }
});

// [GET] Sprawdź dostępność parkingu "na teraz" (Dostępne dla każdego)
router.get('/:id/dostepnosc', async (req, res) => {
    try {
        const parking = await Parking.findById(req.params.id);
        if (!parking) {
            return res.status(404).json({ message: 'Nie znaleziono takiego parkingu' });
        }

        // Pobieramy obecny czas, by sprawdzić, ile aut aktualnie stoi na parkingu
        const teraz = new Date();
        const zajeteMiejsca = await Rezerwacja.countDocuments({
            parkingId: req.params.id,
            dataOd: { $lte: teraz },  // Rezerwacja już się zaczęła...
            dataDo: { $gt: teraz },   // ...ale jeszcze się nie skończyła
            status: { $ne: 'anulowana' } // Opcjonalnie: pomijamy anulowane, jeśli dodacie takie pole
        });

        const wolneMiejsca = parking.liczbaMiejsc - zajeteMiejsca;

        res.json({
            parkingId: parking._id,
            nazwa: parking.nazwa,
            calkowitaLiczbaMiejsc: parking.liczbaMiejsc,
            zajeteMiejsca: zajeteMiejsca,
            wolneMiejsca: wolneMiejsca > 0 ? wolneMiejsca : 0
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas sprawdzania dostępności parkingu' });
    }
});

// [POST] Dodaj nowy parking (Tylko Admin)
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { nazwa, adres, liczbaMiejsc, cenaZaGodzine } = req.body;

        if (!nazwa || !adres || !liczbaMiejsc || !cenaZaGodzine) {
            return res.status(400).json({ message: 'Wypełnij wszystkie wymagane pola' });
        }

        const nowyParking = new Parking({
            nazwa,
            adres,
            liczbaMiejsc,
            cenaZaGodzine
        });

        const zapisanyParking = await nowyParking.save();
        res.status(201).json(zapisanyParking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas zapisywania parkingu' });
    }
});

// [PUT] Aktualizuj dane parkingu (Tylko Admin)
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const zaktualizowanyParking = await Parking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Zwraca nowy obiekt i sprawdza typy danych
        );

        if (!zaktualizowanyParking) {
            return res.status(404).json({ message: 'Parking nie istnieje' });
        }
        res.json(zaktualizowanyParking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas aktualizacji parkingu' });
    }
});

// [DELETE] Usuń parking całkowicie (Tylko Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const usunietyParking = await Parking.findByIdAndDelete(req.params.id);
        if (!usunietyParking) {
            return res.status(404).json({ message: 'Parking nie istnieje' });
        }
        res.json({ message: 'Parking został całkowicie usunięty' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas usuwania parkingu' });
    }
});

module.exports = router;