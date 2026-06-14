import { Component, ChangeDetectorRef, afterNextRender, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare var L: any;

@Component({
  selector: 'app-parking-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './parking-list.html',
  styleUrls: ['./parking-list.scss']
})
export class ParkingListComponent {
  parkingi: any[] = [];

  widokMapy = false;
  mapaZainicjowana = false;
  mapa: any;
  layerGroup: any;

  search = '';

  page = 1;
  limit = 12;
  totalPages = 1;

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

  // 🔎 FETCH z paginacją + search
  pobierzParkingi() {
    const url = `http://localhost:3000/api/parkingi?page=${this.page}&limit=${this.limit}&search=${encodeURIComponent(this.search)}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('HTTP error ' + res.status);
        return res.json();
      })
      .then(res => {
        this.parkingi = res.data || [];
        this.totalPages = res.pages || 1;

        this.cdr.detectChanges();

        if (this.widokMapy) {
          setTimeout(() => this.rysujZnaczniki());
        }
      })
      .catch(err => console.error('Błąd pobierania:', err));
  }

  // 🔍 SEARCH
  onSearch() {
    this.page = 1;
    this.pobierzParkingi();
  }

  // 📄 PAGINACJA
  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.pobierzParkingi();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.pobierzParkingi();
    }
  }

  // 🗺 MAPA
  przelaczWidokMapy() {
    this.widokMapy = !this.widokMapy;
    this.cdr.detectChanges();

    if (this.widokMapy && this.isBrowser) {
      setTimeout(() => this.inicjujMape(), 100);
    }
  }

  inicjujMape() {
    if (!this.mapaZainicjowana) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

      script.onload = () => {
        this.utworzMape();
        this.rysujZnaczniki();
      };

      document.head.appendChild(script);

      this.mapaZainicjowana = true;
    } else {
      this.rysujZnaczniki();
    }
  }

  utworzMape() {
    this.mapa = L.map('parking-map').setView([49.62, 20.70], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.mapa);

    this.layerGroup = L.layerGroup().addTo(this.mapa);
  }

  // 📍 MARKERY (POPRAWIONE - czyści stare)
  rysujZnaczniki() {
    if (!this.mapa) return;

    this.layerGroup.clearLayers();

    this.parkingi.forEach(p => {
      if (p.lat && p.lng) {
        const marker = L.marker([p.lat, p.lng]).addTo(this.layerGroup);

        marker.bindPopup(`
          <div style="text-align:center;min-width:160px">
            <strong>${p.nazwa}</strong><br/>
            <span>${p.cenaZaGodzine} PLN/h</span><br/>
            <b style="color:${p.wolneMiejsca > 0 ? 'green' : 'red'}">
              Wolne: ${p.wolneMiejsca}
            </b><br/><br/>
            <button id="btn-${p._id}" style="background:#2563eb;color:white;padding:6px 10px;width:100%">
              Rezerwuj
            </button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-${p._id}`);
          btn?.addEventListener('click', () => this.sprawdzLogowanieIPrzejdz(p._id));
        });
      }
    });
  }

  // 🔐 LOGOWANIE
  sprawdzLogowanieIPrzejdz(parkingId: string) {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Musisz być zalogowany!');
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/parking', parkingId]);
    }
  }
}