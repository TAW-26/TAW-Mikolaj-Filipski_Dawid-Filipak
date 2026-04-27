import { Routes } from '@angular/router';
import { ParkingListComponent } from './pages/parking-list/parking-list';
import { ParkingDetailsComponent } from './pages/parking-details/parking-details';
import { DashboardComponent } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: ParkingListComponent },
  { path: 'parking/:id', component: ParkingDetailsComponent },
  { path: 'panel', component: DashboardComponent }
];