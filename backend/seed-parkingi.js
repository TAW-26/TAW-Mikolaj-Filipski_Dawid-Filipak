const mongoose = require('mongoose');
const Parking = require('./models/Parking');

const miasta = [
  { miasto: 'Kraków', lat: 50.0647, lng: 19.9450 },
  { miasto: 'Warszawa', lat: 52.2297, lng: 21.0122 },
  { miasto: 'Wrocław', lat: 51.1079, lng: 17.0385 },
  { miasto: 'Poznań', lat: 52.4064, lng: 16.9252 },
  { miasto: 'Gdańsk', lat: 54.3520, lng: 18.6466 },
];

const typy = ['podziemny', 'naziemny', 'wielopoziomowy'];

const ulice = [
  'ul. Główna 12',
  'ul. Słoneczna 5',
  'ul. Polna 8',
  'ul. Kwiatowa 21',
  'ul. Leśna 3',
  'ul. Krótka 10',
  'ul. Długa 44',
  'ul. Ogrodowa 7',
  'ul. Nowa 15',
  'ul. Wesoła 9'
];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice() {
  return Math.floor(Math.random() * 8 + 3); // 3–10 PLN
}

function randomPlaces() {
  return Math.floor(Math.random() * 80 + 20); // 20–100
}

function randomOffset() {
  return (Math.random() - 0.5) * 0.05; // małe przesunięcie
}

async function seed() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/twoja_baza_danych';

  try {
    console.log('Łączenie z MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Połączono z bazą');

    await Parking.deleteMany(); // ⚠️ czyści kolekcję

    const parkingi = [];

    for (let i = 0; i < 20; i++) {
      const m = random(miasta);

      parkingi.push({
        nazwa: `Parking ${m.miasto} #${i + 1}`,
        opis: 'Automatycznie wygenerowany parking testowy',
        adres: `${random(ulice)}, ${m.miasto}`,
        miasto: m.miasto,
        typ: random(typy),
        cenaZaGodzine: randomPrice(),
        status: 'otwarty',
        liczbaMiejsc: randomPlaces(),
        lat: m.lat + randomOffset(),
        lng: m.lng + randomOffset()
      });
    }

    await Parking.insertMany(parkingi);

    console.log('==================================================');
    console.log('  UTWORZONO 20 PARKINGÓW TESTOWYCH');
    console.log('==================================================');
    console.log(' Miasta: Kraków, Warszawa, Wrocław, Poznań, Gdańsk');
    console.log('==================================================');

  } catch (err) {
    console.error('Błąd seedowania:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();