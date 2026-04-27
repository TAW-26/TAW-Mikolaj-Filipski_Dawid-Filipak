import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
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
    @Inject(PLATFORM_ID) platformId: Object // Sprawdzanie czy to przeglądarka
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    // 1. Pobierz szczegóły parkingu (pełny URL)
    fetch(`http://localhost:3000/api/parkingi/${this.id}`)
      .then(res => res.json())
      .then(data => this.parking = data)
      .catch(err => console.error('Błąd pobierania parkingu:', err));

    // 2. Pobierz pojazdy (tylko jeśli jesteśmy w przeglądarce)
    if (this.isBrowser) {
      const token = localStorage.getItem('token') || '';
      fetch('http://localhost:3000/api/pojazdy', {
        headers: { 'x-auth-token': token }
      })
        .then(res => res.json())
        .then(data => this.pojazdy = data)
        .catch(err => console.error('Błąd pobierania pojazdów:', err));
    }
  }

  async handleSubmit() {
    if (!this.isBrowser) return;

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch('http://localhost:3000/api/rezerwacje', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          parkingId: this.id,
          ...this.formData
        })
      });

      if (response.ok) {
        alert('Rezerwacja przebiegła pomyślnie!');
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