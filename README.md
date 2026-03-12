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
- Podgląd szczegółów parkingu (liczba miejsc, stawki, godziny otwarcia).

### Użytkownicy Zalogowani
- Tworzenie konta i logowanie.
- Rezerwacja miejsc parkingowych.
- Przegląd historii rezerwacji.

### Administratorzy (Pracownicy Miejscy)
- Dodawanie, edytowanie i usuwanie parkingów.
- Zarządzanie liczbą i dostępnością miejsc.
- Monitorowanie obłożenia parkingów w czasie rzeczywistym.
- Ustalanie stawek i zasad parkowania.
- Generowanie raportów dotyczących wykorzystania i przychodów.
- Zarządzanie kontami użytkowników, moderowanie danych i analiza statystyk.

## Technologie

| Warstwa          | Technologia                          |
|------------------|--------------------------------------|
| **Frontend** | Angular                              |
| **Backend** | Node.js (Express)                    |
| **Baza Danych** | MongoDB                              |
| **Autentykacja** | JWT (JSON Web Token)                 |
| **Autoryzacja** | OAuth2                               |

## Struktura Repozytorium
- `/frontend` - Kod źródłowy aplikacji klienckiej (Angular)
- `/backend` - Kod źródłowy API (Node.js)

## Jak uruchomić projekt lokalnie?

### Wymagania wstępne
- Node.js (v18+)
- Angular CLI
- Działająca instancja MongoDB (lokalna lub np. MongoDB Atlas)

### Uruchomienie Backendu
1. Przejdź do folderu `/backend`
2. Zainstaluj zależności: `npm install`
3. Uruchom serwer: `node index.js` (plik wejściowy do utworzenia w kolejnych etapach)

### Uruchomienie Frontendu
1. Przejdź do folderu `/frontend`
2. Zainstaluj zależności: `npm install`
3. Uruchom aplikację: `ng serve`
4. Wejdź na `http://localhost:4200/` w przeglądarce.git add README.md