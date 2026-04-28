import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-parking-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parking-list.html'
})
export class ParkingListComponent implements OnInit {
  parkingi: any[] = [];

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Odpalamy pobieranie danych od razu - zadziała i przy F5 (na serwerze) i przy klikaniu w menu (w przeglądarce)
    this.pobierzParkingi();
  }

  pobierzParkingi() {
    fetch('http://localhost:3000/api/parkingi')
      .then(res => {
        if (!res.ok) throw new Error('Błąd HTTP: ' + res.status);
        return res.json();
      })
      .then(data => {
        this.parkingi = Array.isArray(data) ? data : [];
        this.cdr.detectChanges(); // Powiadamiamy Angulara, że są nowe dane
      })
      .catch(err => {
        console.error('Błąd pobierania danych:', err);
      });
  }

  sprawdzLogowanieIPrzejdz(parkingId: string) {
    // Ta funkcja odpala się tylko po kliknięciu przycisku, więc bezpiecznie możemy użyć localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Musisz być zalogowany, aby dokonać rezerwacji!');
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/parking', parkingId]);
    }
  }
}