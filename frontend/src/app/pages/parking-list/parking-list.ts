import { Component, ChangeDetectorRef, afterNextRender, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Globalna zmienna dla wstrzykniętej mapy Leaflet
declare var L: any;

@Component({
  selector: 'app-parking-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parking-list.html'
})
export class ParkingListComponent {
  parkingi: any[] = [];
  widokMapy: boolean = false;
  mapaZainicjowana: boolean = false;
  private isBrowser: boolean;

  constructor(
    private router: Router, 
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    afterNextRender(() => {
      this.pobierzParkingi();
    });
  }

  pobierzParkingi() {
    fetch('http://localhost:3000/api/parkingi')
      .then(res => {
        if (!res.ok) throw new Error('Błąd HTTP: ' + res.status);
        return res.json();
      })
      .then(data => {
        // Dodajemy symulowane pozycje X/Y (Dla Nowego Sącza), ponieważ Twoja baza jeszcze ich nie posiada.
        // Dzięki temu mapa ma od razu na czym pracować.
        this.parkingi = (Array.isArray(data) ? data : []).map((p: any) => ({
          ...p,
          lat: p.lat || (49.62 + (Math.random() * 0.04 - 0.02)), 
          lng: p.lng || (20.70 + (Math.random() * 0.04 - 0.02))
        }));
        this.cdr.detectChanges(); 
      })
      .catch(err => console.error('Błąd pobierania danych:', err));
  }

  przelaczWidokMapy() {
    this.widokMapy = true;
    this.cdr.detectChanges();
    if (this.isBrowser && !this.mapaZainicjowana) {
      // Dajemy ułamek sekundy na wyrenderowanie kontenera <div id="map">
      setTimeout(() => this.inicjujMape(), 100);
    }
  }

  inicjujMape() {
    // Dynamiczne wstrzyknięcie darmowej biblioteki OpenStreetMap (Leaflet)
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link');
      css.id = 'leaflet-css';
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => this.rysujZnaczniki();
      document.head.appendChild(script);
    } else {
      this.rysujZnaczniki();
    }
  }

  rysujZnaczniki() {
    if (typeof L === 'undefined') return;

    // Współrzędne centrum (Nowy Sącz)
    const map = L.map('parking-map').setView([49.62, 20.70], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    this.parkingi.forEach(p => {
      const marker = L.marker([p.lat, p.lng]).addTo(map);
      
      // Chmurka z informacjami i przyciskiem, która pojawia się po kliknięciu w pinezkę
      marker.bindPopup(`
        <div style="text-align: center; min-width: 150px;">
          <strong style="display: block; font-size: 16px; margin-bottom: 5px;">${p.nazwa}</strong>
          <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 12px;">${p.cenaZaGodzine} PLN / h</span>
          <p style="margin: 8px 0; color: #16a34a; font-weight: bold; font-size: 14px;">Wolne: ${p.wolneMiejsca} / ${p.liczbaMiejsc}</p>
          <button onclick="window.location.href='/parking/${p._id}'" 
                  style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; width: 100%; cursor: pointer; font-weight: bold;">
            Zarezerwuj
          </button>
        </div>
      `);
    });

    this.mapaZainicjowana = true;
  }

  sprawdzLogowanieIPrzejdz(parkingId: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Musisz być zalogowany, aby dokonać rezerwacji!');
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/parking', parkingId]);
    }
  }
}