const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Raport = require('../models/Raport');
const Rezerwacja = require('../models/Rezerwacja');
const Parking = require('../models/Parking');

// ==================== GENEROWANIE RAPORTU PDF ====================
router.post('/generuj', [auth, admin], async (req, res) => {
    try {
        const { parkingId } = req.body;
        if (!parkingId) return res.status(400).json({ message: 'Brak parkingId' });

        const parking = await Parking.findById(parkingId);
        if (!parking) return res.status(404).json({ message: 'Parking nie znaleziony' });

        const rezerwacje = await Rezerwacja.find({ parkingId })
            .populate('pojazdId', 'marka model nrRejestracyjny')
            .sort({ dataOd: -1 });

        const calkowityDochod = rezerwacje.reduce((sum, r) => sum + (r.cenaCalkowita || r.koszt || 0), 0);

        const nowyRaport = new Raport({
            administratorId: req.user.id,
            parkingId: parking._id,
            dane: `Raport dla ${parking.nazwa} - ${rezerwacje.length} rezerwacji, dochód: ${calkowityDochod} PLN`,
            typ: 'pdf'
        });
        await nowyRaport.save();

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=raport_${parking.nazwa.replace(/\s+/g, '_')}_${Date.now()}.pdf`);

        doc.pipe(res);

        if (fs.existsSync('./Roboto-Regular.ttf')) doc.font('./Roboto-Regular.ttf');

        doc.fontSize(26).text('RAPORT PARKINGU', { align: 'center' });
        doc.moveDown();

        doc.fontSize(18).text(parking.nazwa, { align: 'center' });
        doc.fontSize(12).text(`${parking.adres}, ${parking.miasto}`);
        doc.text(`Wygenerowano: ${new Date().toLocaleString('pl-PL')}`);
        doc.moveDown(2);

        doc.fontSize(16).text('Podsumowanie', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(14).text(`Liczba rezerwacji: ${rezerwacje.length}`);
        doc.text(`Całkowity dochód: ${calkowityDochod.toFixed(2)} PLN`);

        doc.moveDown();

        if (rezerwacje.length > 0) {
            doc.fontSize(14).text('Ostatnie rezerwacje:');
            doc.moveDown(0.5);

            rezerwacje.slice(0, 15).forEach((rez, i) => {  // max 15 na raporcie
                const od = new Date(rez.dataOd).toLocaleDateString('pl-PL');
                const dod = new Date(rez.dataDo).toLocaleDateString('pl-PL');
                const pojazd = rez.pojazdId ? `${rez.pojazdId.marka} ${rez.pojazdId.model} (${rez.pojazdId.nrRejestracyjny})` : 'Brak danych';
                
                doc.fontSize(11).text(`${i+1}. ${od} - ${dod} | ${pojazd} | ${rez.cenaCalkowita || rez.koszt} PLN`);
            });
        }

        doc.moveDown(2);
        doc.fontSize(10).fillColor('gray').text(`Wygenerowano przez: ${req.user.email || req.user.id}`, { align: 'center' });

        doc.end();

    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Błąd generowania raportu' });
        }
    }
});

// [GET] Pobieranie historii (listy) raportów z bazy danych (Tylko Admin)
router.get('/', [auth, admin], async (req, res) => {
    try {
        const raporty = await Raport.find()
            .populate('administratorId', 'email')
            .populate('parkingId', 'nazwa')
            .sort({ dataUtworzenia: -1 });
            
        res.json(raporty);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Błąd podczas pobierania listy raportów' });
    }
});

module.exports = router;