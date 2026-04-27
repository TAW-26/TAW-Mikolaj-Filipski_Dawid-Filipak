import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  activeTab = 'rezerwacje'; // Domyślna zakładka
  rezerwacje: any[] = [];
  pojazdy: any[] = [];
  nowyPojazd = { marka: '', model: '', nrRejestracyjny: '' };
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.pobierzDane();
    }
  }

  pobierzDane() {
    const token = localStorage.getItem('token') || '';
    // Pobierz rezerwacje
    fetch('http://localhost:3000/api/rezerwacje/moje', { headers: { 'x-auth-token': token } })
      .then(res => res.json()).then(data => this.rezerwacje = data);
    
    // Pobierz pojazdy
    fetch('http://localhost:3000/api/pojazdy', { headers: { 'x-auth-token': token } })
      .then(res => res.json()).then(data => this.pojazdy = data);
  }

  async dodajPojazd() {
    const token = localStorage.getItem('token') || '';
    const res = await fetch('http://localhost:3000/api/pojazdy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify(this.nowyPojazd)
    });
    if (res.ok) {
      this.pobierzDane();
      this.nowyPojazd = { marka: '', model: '', nrRejestracyjny: '' };
    }
  }

  formatDate(d: string) { return new Date(d).toLocaleString(); }
}