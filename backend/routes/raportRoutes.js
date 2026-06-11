const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Raport = require('../models/Raport');
const Rezerwacja = require('../models/Rezerwacja');
const Parking = require('../models/Parking');

// [POST] Generowanie raportu PDF dla konkretnego parkingu (Tylko Admin)
router.post('/generuj', [auth, admin], async (req, res) => {
    try {
        const { parkingId } = req.body;

        if (!parkingId) {
            return res.status(400).json({ message: 'Podaj ID parkingu do wygenerowania raportu.' });
        }

        const parking = await Parking.findById(parkingId);
        if (!parking) {
            return res.status(404).json({ message: 'Nie znaleziono parkingu.' });
        }

        const rezerwacje = await Rezerwacja.find({ parkingId: parking._id });

        const calkowityDochod = rezerwacje.reduce((suma, rez) => suma + (rez.cenaCalkowita || rez.koszt || 0), 0);
        
        const tekstRaportu = `Wygenerowano raport dla parkingu "${parking.nazwa}". Całkowita liczba rezerwacji: ${rezerwacje.length}. Przewidywany dochód: ${calkowityDochod} PLN.`;
        const nowyRaport = new Raport({
            administratorId: req.user.id,
            parkingId: parking._id,
            dane: tekstRaportu
        });
        await nowyRaport.save();

        const doc = new PDFDocument({ margin: 50 });

        // Ustawiamy nagłówki odpowiedzi
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=raport_${parking.nazwa.replace(/\s+/g, '_')}.pdf`);

        doc.pipe(res);

        if (fs.existsSync('./Roboto-Regular.ttf')) {
            doc.font('./Roboto-Regular.ttf');
        }

        // Rysujemy po pliku PDF
        doc.fontSize(24).text('Raport Parkingu', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(16).text(`Nazwa parkingu: ${parking.nazwa}`);
        doc.fontSize(12).text(`Lokalizacja: ${parking.lokalizacja}`);
        doc.text(`Data wygenerowania: ${new Date().toLocaleString('pl-PL')}`);
        doc.moveDown(2);

        // Proste podsumowanie
        doc.fontSize(16).text('Statystyki całkowite', { underline: true });
        doc.moveDown();
        doc.fontSize(14).text(`Liczba wszystkich rezerwacji: ${rezerwacje.length}`);
        doc.text(`Całkowity przychód z rezerwacji: ${calkowityDochod.toFixed(2)} PLN`);
        doc.moveDown(2);

        doc.fontSize(10).fillColor('gray').text(`Wygenerowano przez system (ID Administratora: ${req.user.id})`, { align: 'center' });

        // Kończymy i zamykamy dokument
        doc.end();

    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Błąd podczas generowania raportu PDF' });
        }
    }
});

// [GET] Pobieranie historii (listy) raportów z bazy danych (Tylko Admin)
router.get('/', [auth, admin], async (req, res) => {
    try {
        const raporty = await Raport.find()
            .populate('administratorId', 'email')
            .populate('parkingId', 'nazwa')
            .sort({ dataUtworzenia: -1 }); // Od najnowszych
            
        res.json(raporty);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas pobierania listy raportów' });
    }
});

module.exports = router;