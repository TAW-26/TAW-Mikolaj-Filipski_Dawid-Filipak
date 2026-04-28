import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-parking-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './parking-details.html'
})
export class ParkingDetailsComponent implements OnInit {
  parking: any = null;
  pojazdy: any[] = [];
  formData = { pojazdId: '', dataOd: '', dataDo: '' };
  id: string | null = '';
  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object // Narzędzie do sprawdzania, czy to serwer czy przeglądarka
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    // 1. Pobieramy szczegóły parkingu ZAWSZE (żeby F5 działało błyskawicznie)
    fetch(`http://localhost:3000/api/parkingi/${this.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Błąd HTTP');
        return res.json();
      })
      .then(data => {
        this.parking = data;
        this.cdr.detectChanges(); // Odświeżamy widok, znika "Ładowanie..."
      })
      .catch(err => {
        console.error('Błąd pobierania parkingu:', err);
      });

    // 2. Pobieramy pojazdy TYLKO jeśli jesteśmy w przeglądarce (chroni przed crashem na serwerze)
    if (this.isBrowser) {
      this.pobierzPojazdy();
    }
  }

  // Nasza sprawdzona funkcja z Panelu
  getHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      'Content-Type': 'application/json',
      'x-auth-token': token,
      'Authorization': `Bearer ${token}`
    };
  }

  pobierzPojazdy() {
    const token = localStorage.getItem('token');
    if (!token) return; // Jeśli nie zalogowany, nawet nie próbujemy pobierać

    fetch('http://localhost:3000/api/pojazdy', {
      headers: this.getHeaders()
    })
      .then(res => res.json())
      .then(data => {
        this.pojazdy = Array.isArray(data) ? data : [];
        this.cdr.detectChanges(); // Wymuszamy pojawienie się aut na liście
      })
      .catch(err => console.error('Błąd pobierania pojazdów:', err));
  }

  async handleSubmit() {
    if (!this.isBrowser) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Sesja wygasła. Zaloguj się ponownie!');
        this.router.navigate(['/login']);
        return;
      }

      const response = await fetch('http://localhost:3000/api/rezerwacje', {
        method: 'POST',
        headers: this.getHeaders(), // Używamy kuloodpornych nagłówków
        body: JSON.stringify({
          parkingId: this.id,
          ...this.formData
        })
      });

      if (response.ok) {
        alert('Sukces! Miejsce zarezerwowane.');
        this.router.navigate(['/panel']);
      } else {
        const error = await response.json();
        alert(error.message || 'Błąd rezerwacji');
      }
    } catch (err) {
      console.error('Błąd wysyłania rezerwacji:', err);
      alert('Błąd połączenia z serwerem');
    }
  }
}