const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const Parking = require('../models/Parking');
const Rezerwacja = require('../models/Rezerwacja');

const countReservations = async (parkingId, start = null, end = null) => {
  const now = new Date();

  const query = {
    parkingId,
    status: { $nin: ['anulowana', 'zakonczona'] }
  };

  if (start && end) {
    query.dataOd = { $lt: end };
    query.dataDo = { $gt: start };
  } 
  else {
    query.dataOd = { $lt: now };
    query.dataDo = { $gt: now };
  }

  return Rezerwacja.countDocuments(query);
};

//GET / - lista parkingów + wolne miejsca (TERAZ)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';

    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { nazwa: { $regex: search, $options: 'i' } },
            { adres: { $regex: search, $options: 'i' } },
            { miasto: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const total = await Parking.countDocuments(query);

    const parkingi = await Parking.find(query)
      .select('nazwa adres miasto cenaZaGodzine liczbaMiejsc lat lng')
      .skip(skip)
      .limit(limit);

    const parkingiZDostepnoscia = await Promise.all(
      parkingi.map(async (parking) => {
        const zajete = await countReservations(parking._id);

        const wolne = parking.liczbaMiejsc - zajete;

        return {
          ...parking._doc,
          wolneMiejsca: Math.max(wolne, 0)
        };
      })
    );

    res.json({
      data: parkingiZDostepnoscia,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.error('Błąd pobierania parkingów:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// GET /:id - szczegóły parkingu
router.get('/:id', async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);

    if (!parking) {
      return res.status(404).json({ message: 'Nie znaleziono takiego parkingu' });
    }

    res.json(parking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera podczas pobierania parkingu' });
  }
});

// GET /:id/dostepnosc - dostępność w czasie
router.get('/:id/dostepnosc', async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);

    if (!parking) {
      return res.status(404).json({ message: 'Nie znaleziono takiego parkingu' });
    }

    const start = req.query.start
      ? new Date(req.query.start)
      : new Date();

    const end = req.query.end
      ? new Date(req.query.end)
      : new Date(start.getTime() + 60 * 60 * 1000); // domyślnie 1h

    const zajete = await countReservations(parking._id, start, end);

    const wolne = parking.liczbaMiejsc - zajete;

    res.json({
      parkingId: parking._id,
      nazwa: parking.nazwa,
      calkowitaLiczbaMiejsc: parking.liczbaMiejsc,
      zajeteMiejsca: zajete,
      wolneMiejsca: Math.max(wolne, 0)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd podczas sprawdzania dostępności parkingu' });
  }
});

// POST / - dodaj parking (ADMIN)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { nazwa, adres, miasto, liczbaMiejsc, cenaZaGodzine } = req.body;

    if (!nazwa || !adres || !miasto || !liczbaMiejsc || !cenaZaGodzine) {
      return res.status(400).json({ message: 'Wypełnij wszystkie wymagane pola' });
    }

    const nowy = new Parking({
      nazwa,
      adres,
      miasto,
      liczbaMiejsc,
      cenaZaGodzine
    });

    const zapisany = await nowy.save();

    res.status(201).json(zapisany);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd podczas zapisywania parkingu' });
  }
});

//PUT /:id - aktualizacja (ADMIN)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const updated = await Parking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Parking nie istnieje' });
    }

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd podczas aktualizacji parkingu' });
  }
});

//DELETE /:id - usunięcie (ADMIN)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const deleted = await Parking.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Parking nie istnieje' });
    }

    res.json({ message: 'Parking został usunięty' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd podczas usuwania parkingu' });
  }
});

module.exports = router;