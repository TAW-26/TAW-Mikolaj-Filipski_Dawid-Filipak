import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-parking-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parking-list.html'
})
export class ParkingListComponent implements OnInit {
  parkingi: any[] = [];

  ngOnInit() {
    fetch('http://localhost:3000/api/parkingi')
      .then(res => res.json())
      .then(data => this.parkingi = data)
      .catch(err => console.error('Błąd:', err));
  }
}