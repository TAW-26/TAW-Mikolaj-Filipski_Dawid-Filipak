import { Routes } from '@angular/router';
import { ParkingListComponent } from './pages/parking-list/parking-list';
import { ParkingDetailsComponent } from './pages/parking-details/parking-details';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { authGuard } from './auth.guard'; // <-- DODANO IMPORT

export const routes: Routes = [
  { path: '', component: ParkingListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'parking/:id', component: ParkingDetailsComponent },
  
  // <-- DODANO ZABEZPIECZENIE canActivate
  { path: 'panel', component: DashboardComponent, canActivate: [authGuard] }, 
  
  { path: '**', redirectTo: '' }
];