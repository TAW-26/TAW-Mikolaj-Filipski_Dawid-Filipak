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

  // NOWE ZMIENNE DO DOSTĘPNOŚCI NA ŻYWO:
  wolneMiejscaWybranyTermin: number | null = null;
  sprawdzamDostepnosc: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    fetch(`http://localhost:3000/api/parkingi/${this.id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        this.parking = data;
        this.cdr.detectChanges();
      })
      .catch(err => console.error('Błąd pobierania parkingu:', err));

    if (this.isBrowser) {
      this.pobierzPojazdy();
    }
  }

  getHeaders(): Record<string, string> {
    const token = localStorage.getItem('token') || '';
    return {
      'Content-Type': 'application/json',
      'x-auth-token': token,
      'Authorization': `Bearer ${token}`
    };
  }

  pobierzPojazdy() {
    const token = localStorage.getItem('token');
    if (!token) return; 

    fetch('http://localhost:3000/api/pojazdy', { headers: this.getHeaders() })
      .then(res => res.json())
      .then(data => {
        this.pojazdy = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      })
      .catch(err => console.error('Błąd pobierania pojazdów:', err));
  }

  // --- NOWA FUNKCJA DO SPRAWDZANIA MIEJSC NA ŻYWO ---
  sprawdzDostepnosc() {
    if (!this.formData.dataOd || !this.formData.dataDo || !this.isBrowser) {
      this.wolneMiejscaWybranyTermin = null;
      return;
    }

    const start = new Date(this.formData.dataOd);
    const koniec = new Date(this.formData.dataDo);

    // Jeśli ktoś wpisał bzdurne daty (koniec przed startem), ignorujemy
    if (start >= koniec) {
      this.wolneMiejscaWybranyTermin = null;
      return;
    }

    this.sprawdzamDostepnosc = true;
    this.cdr.detectChanges();

    // Wysyłamy ciche zapytanie z parametrami URL
    fetch(`http://localhost:3000/api/parkingi/${this.id}/dostepnosc?start=${this.formData.dataOd}&end=${this.formData.dataDo}`)
      .then(res => res.json())
      .then(data => {
        this.wolneMiejscaWybranyTermin = data.wolneMiejsca;
        this.sprawdzamDostepnosc = false;
        this.cdr.detectChanges();
      })
      .catch(err => {
        console.error('Błąd sprawdzania dostępności:', err);
        this.sprawdzamDostepnosc = false;
        this.cdr.detectChanges();
      });
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
        headers: this.getHeaders(),
        body: JSON.stringify({ parkingId: this.id, ...this.formData })
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