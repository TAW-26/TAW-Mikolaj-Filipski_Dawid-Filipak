# System Zarządzania Parkingiem Miejskim 🚗

## Opis Projektu
Celem projektu jest opracowanie aplikacji webowej wspierającej zarządzanie miejskimi parkingami oraz informowanie kierowców o dostępnych miejscach w czasie rzeczywistym. System obsługuje zarówno użytkowników szukających wolnych miejsc, jak i pracowników miejskich odpowiedzialnych za kontrolę infrastruktury parkingowej.

Aplikacja pełni funkcję centralnej platformy, która pozwala użytkownikom sprawdzać dostępność miejsc, ceny i możliwość rezerwacji, a administratorom – zarządzać parkingami i monitorować obłożenie. Działa w architekturze klient–serwer, a intuicyjny interfejs zapewnia łatwy dostęp przez przeglądarkę internetową.

## Cel Projektu
- Ułatwienie kierowcom odnalezienia wolnych miejsc w mieście.
- Zapewnienie możliwości rezerwacji miejsc parkingowych.
- Efektywne zarządzanie miejską przestrzenią parkingową.
- Centralizacja informacji o parkingach.
- Zwiększenie przejrzystości i kontroli nad dostępnością miejsc.

## Zakres Funkcjonalny

### Użytkownicy Niezalogowani
- Przeglądanie dostępnych parkingów.
- Wyszukiwanie według lokalizacji, typu, ceny lub liczby wolnych miejsc.
- Podgląd szczegółów parkingu (liczba miejsc, stawki).

### Użytkownicy Zalogowani
- Tworzenie konta i logowanie.
- Rezerwacja miejsc parkingowych.
- Przegląd historii rezerwacji.
- Dodawanie pojazdów

### Administratorzy (Pracownicy Miejscy)
- Dodawanie, edytowanie i usuwanie parkingów.
- Zarządzanie liczbą i dostępnością miejsc.
- Monitorowanie obłożenia parkingów w czasie rzeczywistym.
- Ustalanie stawek i zasad parkowania.
- Generowanie raportów dotyczących wykorzystania i przychodów.
- Zarządzanie kontami użytkowników, moderowanie danych i analiza statystyk.

## Technologie

## Technologie i Infrastruktura

| Warstwa | Technologia | Komentarz / Przeznaczenie |
| :--- | :--- | :--- |
| **Frontend (Klient)** | Angular | Aplikacja webowa dla użytkowników końcowych (kierowców). |
| **Backend API** | Node.js (Express.js) | Główna logika biznesowa, REST API oraz obsługa generowania PDF. |
| **Panel Administratora** | AdminJS | System back-office zintegrowany jako middleware w Express.js. |
| **Baza Danych** | Mongoose | NoSQL-owa baza danych. |
| **Autentykacja** | JWT / Express Session | **JWT:** Dla Angulara (`x-auth-token`).<br>**Session-based:** Dla AdminJS (ciasteczka + bcrypt). |
| **Autoryzacja** | RBAC (Role-Based Access Control) | Kontrola dostępu oparta na rolach (`admin` / `user`) w middleware Expressa. |
| **Konteneryzacja** | Docker & Docker Compose | Architektura wielokontenerowa (`backend`, `frontend`, `mongodb`) separująca środowiska. |
| **Monitorowanie** | Prometheus & Grafana | Zbieranie i wizualizacja metryk aplikacji (endpoint `/metrics`). |

### Opis architektury środowiska

Aplikacja została zaprojektowana w architekturze kontenerowej i jest zarządzana przy użyciu narzędzia **Docker Compose**. Środowisko uruchomieniowe zostało podzielone na niezależne kontenery:
* `frontend_container` – obsługujący aplikację kliencką w Angularze,
* `backend_container` – proces Node.js wraz z panelem AdminJS i logiką biznesową,
* `mongodb_container` – lokalna instancja bazy danych (z możliwością przełączenia na MongoDB Atlas w środowisku produkcyjnym).


## Struktura Repozytorium
- `/frontend` - Kod źródłowy aplikacji klienckiej (Angular)
- `/backend` - Kod źródłowy API (Node.js)

## Jak uruchomić projekt produkcyjnie?

### Wymagania wstępne
Do uruchomienia całego środowiska wymagane jest posiadanie zainstalowanego:
- **Docker** - **Docker Compose** (w wersji zintegrowanej z Docker Desktop lub jako samodzielna wtyczka)

---

### Szybki start (Docker)

1. **Klonowanie i wejście do katalogu głównego projektu:**
   Upewnij się, że znajdujesz się w folderze, w którym znajduje się plik `docker-compose.yml`.

2. **Uruchomienie wszystkich usług (Frontend, Backend, DB):**
   Wpisz w terminalu poniższe polecenie. Pobierze ono niezbędne obrazy bazowe, zbuduje kontenery i uruchomi je w tle:
   ```bash
   docker compose up -d --build