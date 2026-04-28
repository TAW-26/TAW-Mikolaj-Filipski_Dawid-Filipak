import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      return true; // Wpuszczamy
    }
  }
  
  router.navigate(['/login']); // Wyrzucamy na logowanie
  return false;
};