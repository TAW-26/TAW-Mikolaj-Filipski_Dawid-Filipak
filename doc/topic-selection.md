# System Zarządzania Parkingiem Miejskim

## Opis Projektu
Celem projektu jest opracowanie aplikacji webowej wspierającej zarządzanie miejskimi parkingami oraz informowanie kierowców o dostępnych miejscach w czasie rzeczywistym. System będzie obsługiwał zarówno użytkowników szukających wolnych miejsc, jak i pracowników miejskich odpowiedzialnych za kontrolę infrastruktury parkingowej.

Aplikacja ma pełnić funkcję centralnej platformy, która pozwoli użytkownikom sprawdzać dostępność miejsc, ceny i możliwość rezerwacji, a administratorom zarządzać parkingami i monitorować obłożenie. Użytkownicy będą mogli wyszukiwać miejsca według lokalizacji, typu parkingu czy czasu parkowania, natomiast administratorzy będą mieli narzędzia do edycji danych i nadzorowania systemu.

System będzie działał w modelu klient–serwer i dostępny przez przeglądarkę internetową, a jego interfejs zostanie zaprojektowany tak, aby był prosty i intuicyjny dla wszystkich użytkowników.

## Cel Projektu
Projekt ma na celu:
- Ułatwienie kierowcom odnalezienia wolnych miejsc w mieście
- Zapewnienie możliwości rezerwacji miejsc parkingowych
- Efektywne zarządzanie miejską przestrzenią parkingową
- Centralizację informacji o parkingach
- Zwiększenie przejrzystości i kontroli nad dostępnością miejsc

## Zakres Funkcjonalny

### Dla użytkowników niezalogowanych
- Przeglądanie dostępnych parkingów
- Wyszukiwanie według lokalizacji, typu, ceny lub liczby wolnych miejsc
- Podgląd szczegółów parkingu, takich jak liczba miejsc, stawki czy godziny otwarcia

### Dla użytkowników zalogowanych
- Tworzenie konta i logowanie
- Rezerwacja miejsc parkingowych
- Przegląd historii rezerwacji

### Dla administratorów miejskich
- Dodawanie, edytowanie i usuwanie parkingów
- Zarządzanie liczbą i dostępnością miejsc
- Monitorowanie obłożenia parkingów w czasie rzeczywistym
- Ustalanie stawek i zasad parkowania
- Generowanie raportów dotyczących wykorzystania i przychodów

### Funkcje administracyjne systemu
- Zarządzanie kontami użytkowników i administratorów
- Moderowanie nieaktualnych lub błędnych danych
- Analiza statystyk korzystania z systemu

## Technologie

| Warstwa           | Technologia                           |
|------------------|--------------------------------------|
| Frontend         | Angular                               |
| Backend          | Node.js                               |
| Baza Danych      | MongoDB                               |
| Autentykacja     | JWT (JSON Web Token)                  |
| Autoryzacja      | OAuth2                                |

