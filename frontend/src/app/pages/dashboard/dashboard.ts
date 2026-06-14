import { Component, ChangeDetectorRef, afterNextRender, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  activeTab = 'rezerwacje';
  rezerwacje: any[] = [];
  pojazdy: any[] = [];
  
  nowyPojazd = { marka: '', model: '', rejestracja: '' };
  private isBrowser: boolean;

  showProlongModal = false;
  selectedReservation: any = null;
  nowaDataDo: string = '';

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    afterNextRender(() => {
      // Przywracanie ostatniej zakładki
      const zapisanaZakladka = localStorage.getItem('aktywnaZakladkaPanelu');
      if (zapisanaZakladka) {
        this.activeTab = zapisanaZakladka;
        this.cdr.detectChanges(); 
      }
      this.pobierzDane();
    });
  }

  zmienZakladke(tab: string) {
    this.activeTab = tab;
    if (this.isBrowser) {
      localStorage.setItem('aktywnaZakladkaPanelu', tab);
    }
  }

  // Wymuszony typ by TypeScript był zadowolony
  getHeaders(): Record<string, string> {
    const token = this.isBrowser ? (localStorage.getItem('token') || '') : '';
    return {
      'Content-Type': 'application/json',
      'x-auth-token': token,
      'Authorization': `Bearer ${token}`
    };
  }

  pobierzDane() {
    if (!this.isBrowser) return;

    const headers = this.getHeaders();
    
    // Pobieranie rezerwacji
    fetch('http://localhost:3000/api/rezerwacje/moje', { headers })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        this.rezerwacje = Array.isArray(data) ? data : [];
        this.cdr.detectChanges(); 
      })
      .catch(err => console.error('Błąd pobierania rezerwacji:', err));
    
    // Pobieranie pojazdów
    fetch('http://localhost:3000/api/pojazdy', { headers })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        this.pojazdy = Array.isArray(data) ? data : [];
        this.cdr.detectChanges(); 
      })
      .catch(err => console.error('Błąd pobierania pojazdów:', err));
  }

  // --- LOGIKA STATUSÓW I ANULOWANIA ---

  okreslStatus(r: any): string {
    if (r.status === 'anulowana') return 'anulowana';
    if (r.status === 'zakonczona') return 'zakonczona';
    
    // Jeśli czas wyjazdu minął, wizualnie wymuszamy status "zakończona"
    if (new Date(r.dataDo) < new Date()) return 'zakonczona';
    
    return 'aktywna';
  }

  czyMoznaAnulowac(r: any): boolean {
    // Można anulować tylko aktywne rezerwacje, które jeszcze się nie zaczęły
    if (this.okreslStatus(r) !== 'aktywna') return false;
    return new Date(r.dataOd) > new Date();
  }

  async anulujRezerwacje(id: string) {
    if (!this.isBrowser) return;
    if (!confirm('Czy na pewno chcesz anulować tę rezerwację? Pieniądze zostaną zwrócone.')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/rezerwacje/${id}/anuluj`, {
        method: 'PATCH',
        headers: this.getHeaders()
      });

      if (res.ok) {
        alert('Rezerwacja została pomyślnie anulowana.');
        this.pobierzDane(); // Odśwież listę po anulowaniu
      } else {
        // Bezpieczne pobranie błędu (chroni przed awarią gdy serwer zwraca HTML zamiast JSON)
        const errorText = await res.text();
        try {
          const error = JSON.parse(errorText);
          alert(error.message || 'Błąd podczas anulowania');
        } catch (e) {
          console.error('Surowa odpowiedź serwera:', errorText);
          if (res.status === 404) {
            alert('Błąd 404: Nie znaleziono ścieżki! Upewnij się, że zrestartowałeś serwer Node.js.');
          } else {
            alert(`Serwer zwrócił błąd ${res.status}. Zobacz konsolę (F12).`);
          }
        }
      }
    } catch (err) {
      console.error('Błąd funkcji fetch:', err);
      alert('Całkowity błąd połączenia! Serwer jest wyłączony lub blokuje zapytanie.');
    }
  }

  // --- POJAZDY ---

  async dodajPojazd() {
    if (!this.isBrowser) return;

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/pojazdy', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(this.nowyPojazd)
      });
      
      if (res.ok) {
        alert('Pojazd dodany pomyślnie!');
        this.pobierzDane(); 
        this.nowyPojazd = { marka: '', model: '', rejestracja: '' }; 
      } else {
        const error = await res.json();
        alert(error.message || 'Błąd dodawania pojazdu');
      }
    } catch (err) {
      console.error('Błąd:', err);
    }
  }

  async usunPojazd(id: string) {
    if (!this.isBrowser) return;
    if (!confirm('Czy na pewno chcesz usunąć ten pojazd?')) return; 

    try {
      const res = await fetch(`http://localhost:3000/api/pojazdy/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (res.ok) {
        this.pobierzDane(); 
      } else {
        const error = await res.json();
        alert(error.message || 'Błąd podczas usuwania pojazdu');
      }
    } catch (err) {
      console.error('Błąd:', err);
    }
  }

  formatDate(d: string) { 
    if (!d) return 'Brak danych';
    return new Date(d).toLocaleString(); 
  }

  otworzModalPrzedluzenia(r: any) {
    this.selectedReservation = r;
    // Formatujemy obecną datę końcową do formatu akceptowanego przez <input type="datetime-local">
    const date = new Date(r.dataDo);
    // Korekta strefy czasowej do ISO string (YYYY-MM-DDTHH:mm)
    const tzOffset = date.getTimezoneOffset() * 60000;
    this.nowaDataDo = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    this.showProlongModal = true;
  }

  zamknijModal() {
    this.showProlongModal = false;
    this.selectedReservation = null;
    this.nowaDataDo = '';
  }

  async przedluzRezerwacje() {
    if (!this.isBrowser || !this.selectedReservation) return;

    const nowaData = new Date(this.nowaDataDo); // Data utworzona z inputa (lokalna)
    const staraData = new Date(this.selectedReservation.dataDo);

    if (nowaData <= staraData) {
      alert('Nowa data zakończenia musi być późniejsza niż obecna.');
      return;
    }

    const isoDataDoBackendu = nowaData.toISOString();

    try {
      const res = await fetch(`http://localhost:3000/api/rezerwacje/${this.selectedReservation._id}/przedluz`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ nowaDataDo: isoDataDoBackendu })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'Rezerwacja przedłużona pomyślnie!');
        this.zamknijModal();
        this.pobierzDane(); 
      } else {
        alert(data.message || 'Błąd podczas przedłużania rezerwacji.');
      }
    } catch (err) {
      console.error('Błąd połączenia:', err);
      alert('Błąd połączenia z serwerem.');
    }
  }

}