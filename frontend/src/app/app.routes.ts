import { Routes } from '@angular/router';
import { ParkingListComponent } from './pages/parking-list/parking-list';
import { ParkingDetailsComponent } from './pages/parking-details/parking-details';
import { DashboardComponent } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: ParkingListComponent },           // Strona główna z listą
  { path: 'parking/:id', component: ParkingDetailsComponent }, // Szczegóły konkretnego parkingu
  { path: 'panel', component: DashboardComponent }         // Panel użytkownika
];