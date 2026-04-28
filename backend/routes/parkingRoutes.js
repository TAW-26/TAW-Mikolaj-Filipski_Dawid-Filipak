const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Parking = require('../models/Parking');
const Rezerwacja = require('../models/Rezerwacja');

// [GET] Pobierz wszystkie parkingi (Dostępne dla każdego) - WRAZ Z DOSTĘPNOŚCIĄ
router.get('/', async (req, res) => {
    try {
        const parkingi = await Parking.find().select('nazwa adres cenaZaGodzine liczbaMiejsc');
        const teraz = new Date();

        const parkingiZDostepnoscia = await Promise.all(parkingi.map(async (parking) => {
            const zajeteMiejsca = await Rezerwacja.countDocuments({
                parkingId: parking._id,
                dataOd: { $lte: teraz },
                dataDo: { $gt: teraz },
                status: { $nin: ['anulowana', 'zakonczona'] }
            });

            const wolne = parking.liczbaMiejsc - zajeteMiejsca;

            return {
                ...parking._doc,
                wolneMiejsca: wolne > 0 ? wolne : 0
            };
        }));

        res.json(parkingiZDostepnoscia);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera podczas pobierania parkingów' });
    }
});

// [GET] Pobierz szczegóły jednego parkingu
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

// [GET] Sprawdź dostępność parkingu "na teraz"
router.get('/:id/dostepnosc', async (req, res) => {
    try {
        const parking = await Parking.findById(req.params.id);
        if (!parking) {
            return res.status(404).json({ message: 'Nie znaleziono takiego parkingu' });
        }

        const teraz = new Date();
        const zajeteMiejsca = await Rezerwacja.countDocuments({
            parkingId: req.params.id,
            dataOd: { $lte: teraz },
            dataDo: { $gt: teraz },
            status: { $nin: ['anulowana', 'zakonczona'] }
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

        const nowyParking = new Parking({ nazwa, adres, liczbaMiejsc, cenaZaGodzine });
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
            { new: true, runValidators: true }
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