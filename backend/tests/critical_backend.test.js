const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../index");

// Import modeli do bezpośredniego przygotowania bazy (seedowania)
const User = require("../models/User");
const Parking = require("../models/Parking");
const Pojazd = require("../models/Pojazd");
const Rezerwacja = require("../models/Rezerwacja");
const Raport = require("../models/Raport");

jest.setTimeout(30000);

let klientToken;
let adminToken;
let klientId;
let adminId;

// Statyczne identyfikatory ułatwiające powiązania relacji w bazie
const mockParkingId = "111111111111111111111111";
const mockPojazdId = "222222222222222222222222";

beforeAll(async () => {
  const testDbURI = 'mongodb://mikolajfili_db_user:LzxSdAqTTUfrnp8@ac-tk18nj2-shard-00-00.zfkbmjv.mongodb.net:27017,ac-tk18nj2-shard-00-01.zfkbmjv.mongodb.net:27017,ac-tk18nj2-shard-00-02.zfkbmjv.mongodb.net:27017/test_db?ssl=true&replicaSet=atlas-eadype-shard-0&authSource=admin&appName=Cluster0';
  await mongoose.connect(testDbURI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Czyszczenie bazy przed każdym testem
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  // 1. Rejestracja i logowanie zwykłego klienta
  await request(app).post("/api/auth/register").send({
    email: "klient@test.pl",
    haslo: "Klient123!",
    rola: "klient"
  });
  const loginKlient = await request(app).post("/api/auth/login").send({
    email: "klient@test.pl",
    haslo: "Klient123!"
  });
  klientToken = loginKlient.body.token;
  klientId = loginKlient.body.user.id;

  // 2. Rejestracja i logowanie administratora
  await request(app).post("/api/auth/register").send({
    email: "admin@test.pl",
    haslo: "Admin123!",
    rola: "admin"
  });
  const loginAdmin = await request(app).post("/api/auth/login").send({
    email: "admin@test.pl",
    haslo: "Admin123!"
  });
  adminToken = loginAdmin.body.token;
  adminId = loginAdmin.body.user.id;

  // 3. Wstawienie podstawowego parkingu testowego (1 miejsce, cena 10 PLN)
  await Parking.collection.insertOne({
    _id: new mongoose.Types.ObjectId(mockParkingId),
    nazwa: "Parking Centralny",
    adres: "ul. Marszałkowska 1",
    miasto: "Warszawa",
    liczbaMiejsc: 1,
    cenaZaGodzine: 10,
    lat: 52.23,
    lng: 21.01
  });

  // 4. Wstawienie pojazdu należącego do klienta
  await Pojazd.collection.insertOne({
    _id: new mongoose.Types.ObjectId(mockPojazdId),
    marka: "Ford",
    model: "Focus",
    numer_rejestracyjny: "WI99999",
    wlascicielId: new mongoose.Types.ObjectId(klientId)
  });
});

// ============================================================================
// 1. TESTY TRAS: AUTH & USER MANAGEMENT
// ============================================================================
describe("AUTH & USER API", () => {
  
  it("Rejestracja: nie pozwala na duplikację adresów email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "klient@test.pl", haslo: "NoweHaslo123!" });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Użytkownik o takim adresie już istnieje");
  });

  it("Zabezpieczenia Admina: Blokuje zwykłemu klientowi dostęp do listy użytkowników", async () => {
    const res = await request(app)
      .get("/api/auth/users")
      .set("Authorization", `Bearer ${klientToken}`);
    
    expect(res.status).toBe(403); // Forbidden dla nie-admina
  });

  it("Zarządzanie Admina: Pozwala adminowi pobrać listę użytkowników", async () => {
    const res = await request(app)
      .get("/api/auth/users")
      .set("Authorization", `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Sprawdzamy czy hasła zostały wycięte przez .select('-haslo')
    expect(res.body[0]).not.toHaveProperty("haslo");
  });
});

// ============================================================================
// 2. TESTY TRAS: PARKINGI
// ============================================================================
describe("PARKINGI API", () => {

  it("Pobieranie parkingów: Zwraca listę z wyliczoną liczbą wolnych miejsc", async () => {
    const res = await request(app).get("/api/parkingi");
    
    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty("wolneMiejsca");
    expect(res.body[0].wolneMiejsca).toBe(1); // Mamy 1 miejsce wolne
  });

  it("Tworzenie parkingu: Pozwala Adminowi dodać nowy obiekt", async () => {
    const res = await request(app)
      .post("/api/parkingi")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nazwa: "Nowy Parking",
        adres: "Testowa 5",
        miasto: "Warszawa", // ZMIANA: Dodano wymagane pole miasto
        liczbaMiejsc: 50,
        cenaZaGodzine: 5
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
  });
});

// ============================================================================
// 3. TESTY TRAS: POJAZDY
// ============================================================================
describe("POJAZDY API", () => {

  it("Dodawanie pojazdu: Blokuje dodanie auta o istniejącej już rejestracji", async () => {
    const res = await request(app)
      .post("/api/pojazdy")
      .set("Authorization", `Bearer ${klientToken}`)
      .send({
        marka: "Opel",
        model: "Astra",
        rejestracja: "WI99999" // Taka sama jak w beforeEach
      });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Pojazd o takiej rejestracji jest już w bazie");
  });

  it("Relacje bazy: Blokuje usunięcie pojazdu posiadającego aktywną rezerwację", async () => {
    // Tworzymy aktywną rezerwację dla tego auta (przyszłość: rok 2030)
    await Rezerwacja.collection.insertOne({
      uzytkownikId: new mongoose.Types.ObjectId(klientId),
      pojazdId: new mongoose.Types.ObjectId(mockPojazdId),
      parkingId: new mongoose.Types.ObjectId(mockParkingId),
      dataOd: new Date("2030-05-01T10:00:00"),
      dataDo: new Date("2030-05-01T12:00:00"),
      status: "aktywna"
    });

    const res = await request(app)
      .delete(`/api/pojazdy/${mockPojazdId}`)
      .set("Authorization", `Bearer ${klientToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Nie można usunąć pojazdu");
  });
});

// ============================================================================
// 4. TESTY TRAS: REZERWACJE
// ============================================================================
describe("REZERWACJE API", () => {

  it("Tworzenie rezerwacji: Poprawnie oblicza koszt całkowity (2h * 10 PLN = 20 PLN)", async () => {
    const res = await request(app)
      .post("/api/rezerwacje")
      .set("Authorization", `Bearer ${klientToken}`)
      .send({
        parkingId: mockParkingId,
        pojazdId: mockPojazdId,
        dataOd: "2030-06-01T10:00:00",
        dataDo: "2030-06-01T12:00:00"
      });

    expect(res.status).toBe(201);
    expect(res.body.koszt).toBe(20);
    expect(res.body.status).toBe("aktywna");
  });

  it("Algorytm zajętości: Blokuje rezerwację, gdy limit miejsc na parkingu został wyczerpany", async () => {
    // Zajmujemy jedyne wolne miejsce na tym parkingu w tym przedziale czasu
    await Rezerwacja.collection.insertOne({
      uzytkownikId: new mongoose.Types.ObjectId(adminId), // inny użytkownik zajął miejsce
      pojazdId: new mongoose.Types.ObjectId(),
      parkingId: new mongoose.Types.ObjectId(mockParkingId),
      dataOd: new Date("2030-07-01T10:00:00"),
      dataDo: new Date("2030-07-01T12:00:00"),
      status: "aktywna"
    });

    // Klient próbuje wbić się w to samo okno czasowe
    const res = await request(app)
      .post("/api/rezerwacje")
      .set("Authorization", `Bearer ${klientToken}`)
      .send({
        parkingId: mockParkingId,
        pojazdId: mockPojazdId,
        dataOd: "2030-07-01T11:00:00",
        dataDo: "2030-07-01T13:00:00"
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Brak wolnych miejsc");
  });
});

// ============================================================================
// 5. TESTY TRAS: RAPORTY
// ============================================================================
describe("RAPORTY API", () => {

  it("Generowanie PDF: Tworzy rekord w bazie i zwraca poprawny plik binarny PDF", async () => {
    const res = await request(app)
      .post("/api/raporty/generuj")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ parkingId: mockParkingId });

    expect(res.status).toBe(200);
    // Sprawdzamy czy Express prawidłowo ustawił nagłówek Content-Type dla PDFKit
    expect(res.headers["content-type"]).toBe("application/pdf");
    
    // Sprawdzamy, czy w bazie zapisał się ślad po wygenerowanym dokumencie
    const zapisanyRaport = await Raport.findOne({ parkingId: mockParkingId });
    expect(zapisanyRaport).not.toBeNull();
    expect(zapisanyRaport.dane).toContain("Przewidywany dochód");
  });
});