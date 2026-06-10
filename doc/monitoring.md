# Instrukcja Uruchomienia Monitoringu (Prometheus & Grafana)

Ten plik opisuje proces uruchamiania oraz konfiguracji systemu monitoringu. Dzięki zastosowaniu mechanizmu provisioningu, cały proces jest w pełni zautomatyzowany.

## Uruchamianie

Wszystkie usługi (Frontend, Backend, Baza danych, Prometheus oraz Grafana) są spięte w jednym środowisku Docker Compose. Aby uruchomić środowisko, wykonaj v terminalu w głównym katalogu projektu poniższą komendę:

    docker compose up --build


Po wykonaniu tej komendy automatycznie nastąpi:
1. **Podpięcie Prometheusa:** Prometheus zacznie automatycznie pobierać metryki wydajnościowe bezpośrednio z endpointu backendu (`http://backend:3000/metrics`).
2. **Konfiguracja Grafany (Provisioning):**
   * Grafana automatycznie zarejestruje lokalnego Prometheusa jako domyślne źródło danych (*Data Source*).
   * Grafana automatycznie zaimportuje przygotowany plik dashboardu JSON z katalogu konfiguracji.



---

## Dane do logowania (Grafana)

Otwórz przeglądarkę i przejdź pod poniższy adres:

* **URL:** http://localhost:3001

Użyj następujących danych, aby się zalogować:

* **Użytkownik:** admin
* **Hasło:** admin
