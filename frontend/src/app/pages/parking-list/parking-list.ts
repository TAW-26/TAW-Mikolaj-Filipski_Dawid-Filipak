import { Component, ChangeDetectorRef, afterNextRender, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

declare var L: any;

@Component({
  selector: 'app-parking-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parking-list.html',
  styleUrls: ['./parking-list.scss']
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
        this.parkingi = Array.isArray(data) ? data : [];
        this.cdr.detectChanges(); 
      })
      .catch(err => console.error('Błąd pobierania danych:', err));
  }

  przelaczWidokMapy() {
    this.widokMapy = !this.widokMapy;
    this.cdr.detectChanges();

    if (this.widokMapy && this.isBrowser && !this.mapaZainicjowana) {
      setTimeout(() => this.inicjujMape(), 100);
    }
  }

  inicjujMape() {
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
    if (typeof L === 'undefined' || this.mapaZainicjowana) return;

    const map = L.map('parking-map').setView([49.62, 20.70], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap autorzy'
    }).addTo(map);

    this.parkingi.forEach(p => {
      if (p.lat && p.lng) {
        const marker = L.marker([p.lat, p.lng]).addTo(map);
        
        marker.bindPopup(`
          <div style="text-align: center; min-width: 160px; font-family: sans-serif;">
            <strong style="display: block; font-size: 16px; margin-bottom: 5px; color: #1e293b;">${p.nazwa}</strong>
            <div style="margin-bottom: 8px;">
              <span style="background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${p.typ}</span>
            </div>
            <span style="color: #2563eb; font-weight: bold; font-size: 14px;">${p.cenaZaGodzine} PLN / h</span>
            <p style="margin: 8px 0; color: ${p.wolneMiejsca > 0 ? '#16a34a' : '#dc2626'}; font-weight: bold;">
              Wolne: ${p.wolneMiejsca} / ${p.liczbaMiejsc}
            </p>
            <button id="btn-${p._id}" style="background: #2563eb; color: white; border: none; padding: 8px 12px; border-radius: 6px; width: 100%; cursor: pointer; font-weight: bold; transition: background 0.2s;">
              Zarezerwuj
            </button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-${p._id}`);
          btn?.addEventListener('click', () => this.sprawdzLogowanieIPrzejdz(p._id));
        });
      }
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