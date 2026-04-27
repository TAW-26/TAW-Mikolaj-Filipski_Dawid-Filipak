import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  rezerwacje: any[] = [];
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    // Sprawdzamy, czy kod uruchamia się w przeglądarce
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    // Zapytanie wykonujemy tylko w przeglądarce, bo tylko tam mamy token w localStorage
    if (this.isBrowser) {
      const token = localStorage.getItem('token') || '';

      fetch('http://localhost:3000/api/rezerwacje/moje', {
        headers: { 'x-auth-token': token }
      })
        .then(res => {
          if (!res.ok) throw new Error('Błąd autoryzacji lub serwera');
          return res.json();
        })
        .then(data => this.rezerwacje = data)
        .catch(err => console.error('Błąd pobierania rezerwacji:', err));
    }
  }

  formatDate(dateStr: string) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  }
}