const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); // Dla podglądu wszystkich rezerwacji
const Rezerwacja = require('../models/Rezerwacja');
const Parking = require('../models/Parking');
const Pojazd = require('../models/Pojazd');

// [POST] Utwórz nową rezerwację
router.post('/', auth, async (req, res) => {
    try {
        const { parkingId, pojazdId, dataOd, dataDo } = req.body;
        
        const start = new Date(dataOd);
        const koniec = new Date(dataDo);
        
        if (start >= koniec) return res.status(400).json({ message: 'Data zakończenia musi być późniejsza niż data rozpoczęcia.' });
        if (start < new Date()) return res.status(400).json({ message: 'Nie można rezerwować miejsc w przeszłości.' });

        // Sprawdzenie, czy pojazd należy do użytkownika
        const pojazd = await Pojazd.findOne({ _id: pojazdId, wlascicielId: req.user.id });
        if (!pojazd) return res.status(404).json({ message: 'Nie znaleziono pojazdu przypisanego do Twojego konta.' });

        const parking = await Parking.findById(parkingId);
        if (!parking) return res.status(404).json({ message: 'Nie znaleziono takiego parkingu.' });

        // Sprawdzenie wolnych miejsc
        const nakladajaceSieRezerwacje = await Rezerwacja.countDocuments({
            parkingId: parkingId,
            status: { $ne: 'anulowana' },
            $or: [
                { dataOd: { $lt: koniec }, dataDo: { $gt: start } }
            ]
        });

        if (nakladajaceSieRezerwacje >= parking.liczbaMiejsc) {
            return res.status(400).json({ message: 'Brak wolnych miejsc w wybranym terminie.' });
        }

        // Obliczenie kosztu
        const czasWGodzinach = Math.ceil((koniec - start) / (1000 * 60 * 60));
        const kosztCalkowity = czasWGodzinach * parking.cenaZaGodzine;

        const nowaRezerwacja = new Rezerwacja({
            uzytkownikId: req.user.id,
            pojazdId,
            parkingId,
            dataOd: start,
            dataDo: koniec,
            koszt: kosztCalkowity,
            status: 'aktywna'
        });

        const zapisana = await nowaRezerwacja.save();
        res.status(201).json(zapisana);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd serwera podczas tworzenia rezerwacji' });
    }
});

// [GET] Pobierz rezerwacje zalogowanego użytkownika
router.get('/moje', auth, async (req, res) => {
    try {
        // .populate ładuje szczegóły powiązanych obiektów zamiast pokazywać samo ID
        const rezerwacje = await Rezerwacja.find({ uzytkownikId: req.user.id })
            .populate('parkingId', 'nazwa adres')
            .populate('pojazdId', 'marka model rejestracja')
            .sort({ dataOd: -1 }); // Sortowanie od najnowszych
            
        res.json(rezerwacje);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas pobierania Twoich rezerwacji' });
    }
});

// [PATCH] Przedłuż rezerwację
router.patch('/:id/przedluz', auth, async (req, res) => {
    try {
        const { nowaDataDo } = req.body;
        const nowaDataKoniec = new Date(nowaDataDo);

        const rezerwacja = await Rezerwacja.findOne({ _id: req.params.id, uzytkownikId: req.user.id });
        if (!rezerwacja) return res.status(404).json({ message: 'Nie znaleziono rezerwacji' });
        if (rezerwacja.status === 'zakonczona' || rezerwacja.status === 'anulowana') {
            return res.status(400).json({ message: 'Nie można przedłużyć zakończonej lub anulowanej rezerwacji' });
        }
        if (nowaDataKoniec <= rezerwacja.dataDo) {
            return res.status(400).json({ message: 'Nowa data zakończenia musi być późniejsza niż obecna.' });
        }

        const parking = await Parking.findById(rezerwacja.parkingId);

        // Sprawdzamy, czy parking ma miejsca w "dodatkowym" czasie
        const kolizje = await Rezerwacja.countDocuments({
            parkingId: parking._id,
            _id: { $ne: rezerwacja._id }, // Pomijamy naszą obecną rezerwację
            status: { $ne: 'anulowana' },
            dataOd: { $lt: nowaDataKoniec }, 
            dataDo: { $gt: rezerwacja.dataDo }
        });

        if (kolizje >= parking.liczbaMiejsc) {
            return res.status(400).json({ message: 'Brak miejsc na parkingu, nie można przedłużyć.' });
        }

        // Przeliczanie dopłaty
        const dodatkoweGodziny = Math.ceil((nowaDataKoniec - rezerwacja.dataDo) / (1000 * 60 * 60));
        const doplata = dodatkoweGodziny * parking.cenaZaGodzine;

        rezerwacja.dataDo = nowaDataKoniec;
        rezerwacja.koszt += doplata;
        
        await rezerwacja.save();
        res.json({ message: 'Rezerwacja przedłużona', rezerwacja });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas przedłużania rezerwacji' });
    }
});

// [PATCH] Zakończ rezerwację (wyjazd z parkingu)
router.patch('/:id/zakoncz', auth, async (req, res) => {
    try {
        const rezerwacja = await Rezerwacja.findOne({ _id: req.params.id, uzytkownikId: req.user.id });
        if (!rezerwacja) return res.status(404).json({ message: 'Nie znaleziono rezerwacji' });
        
        if (rezerwacja.status !== 'aktywna') {
            return res.status(400).json({ message: 'Ta rezerwacja nie jest już aktywna.' });
        }

        rezerwacja.status = 'zakonczona';
        // Opcjonalnie: możemy nadpisać dataDo aktualnym czasem wyjazdu
        // rezerwacja.dataDo = new Date(); 
        
        await rezerwacja.save();
        res.json({ message: 'Rezerwacja zakończona pomyślnie', rezerwacja });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas kończenia rezerwacji' });
    }
});


// [GET] Pobierz WSZYSTKIE rezerwacje w systemie (Tylko Admin)
router.get('/', [auth, admin], async (req, res) => {
    try {
        const rezerwacje = await Rezerwacja.find()
            .populate('uzytkownikId', 'email')
            .populate('parkingId', 'nazwa')
            .populate('pojazdId', 'rejestracja');
        res.json(rezerwacje);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas pobierania wszystkich rezerwacji' });
    }
});

// [PATCH] Anuluj rezerwację (Klient swoją, Admin każdą)
router.patch('/:id/anuluj', auth, async (req, res) => {
    try {
        const rezerwacja = await Rezerwacja.findById(req.params.id);
        if (!rezerwacja) return res.status(404).json({ message: 'Nie znaleziono rezerwacji' });

        // Sprawdzamy uprawnienia
        if (rezerwacja.uzytkownikId.toString() !== req.user.id && req.user.rola !== 'admin') {
            return res.status(403).json({ message: 'Brak uprawnień do anulowania' });
        }

        if (new Date() > new Date(rezerwacja.dataOd)) {
            return res.status(400).json({ message: 'Nie można anulować rezerwacji, która już się zaczęła.' });
        }

        rezerwacja.status = 'anulowana';
        await rezerwacja.save();

        res.json({ message: 'Rezerwacja została anulowana', rezerwacja });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas anulowania' });
    }
});

module.exports = router;