import { Component, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  activeTab = 'rezerwacje'; // Domyślna wartość
  rezerwacje: any[] = [];
  pojazdy: any[] = [];
  
  nowyPojazd = { marka: '', model: '', rejestracja: '' };

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router
  ) {
    afterNextRender(() => {
      // Pobieramy ostatnio otwartą zakładkę z pamięci przeglądarki
      const zapisanaZakladka = localStorage.getItem('aktywnaZakladkaPanelu');
      if (zapisanaZakladka) {
        this.activeTab = zapisanaZakladka;
        this.cdr.detectChanges(); // Odświeżenie widoku na właściwą zakładkę
      }

      this.pobierzDane();
    });
  }

  // Funkcja, która zmienia zakładkę i od razu zapisuje ją w przeglądarce
  zmienZakladke(tab: string) {
    this.activeTab = tab;
    localStorage.setItem('aktywnaZakladkaPanelu', tab);
  }

  getHeaders(): Record<string, string> {
    const token = localStorage.getItem('token') || '';
    return {
      'Content-Type': 'application/json',
      'x-auth-token': token,
      'Authorization': `Bearer ${token}`
    };
  }

  pobierzDane() {
    const headers = this.getHeaders();
    
    // Pobierz rezerwacje
    fetch('http://localhost:3000/api/rezerwacje/moje', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Błąd HTTP');
        return res.json();
      })
      .then(data => {
        this.rezerwacje = Array.isArray(data) ? data : [];
        this.cdr.detectChanges(); 
      })
      .catch(err => console.error('Błąd pobierania rezerwacji:', err));
    
    // Pobierz pojazdy
    fetch('http://localhost:3000/api/pojazdy', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Błąd HTTP');
        return res.json();
      })
      .then(data => {
        this.pojazdy = Array.isArray(data) ? data : [];
        this.cdr.detectChanges(); 
      })
      .catch(err => console.error('Błąd pobierania pojazdów:', err));
  }

  async dodajPojazd() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Twoja sesja wygasła lub nie jesteś zalogowany. Zaloguj się ponownie.');
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
      console.error('Błąd wysyłania zapytania:', err);
      alert('Błąd połączenia z serwerem.');
    }
  }

  async usunPojazd(id: string) {
    if (!confirm('Czy na pewno chcesz usunąć ten pojazd?')) {
      return; 
    }

    try {
      const res = await fetch(`http://localhost:3000/api/pojazdy/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (res.ok) {
        alert('Pojazd został pomyślnie usunięty!');
        this.pobierzDane(); 
      } else {
        const error = await res.json();
        alert(error.message || 'Błąd podczas usuwania pojazdu');
      }
    } catch (err) {
      console.error('Błąd zapytania usuwania:', err);
      alert('Wystąpił błąd podczas usuwania.');
    }
  }

  formatDate(d: string) { 
    if (!d) return 'Brak danych';
    return new Date(d).toLocaleString(); 
  }
}