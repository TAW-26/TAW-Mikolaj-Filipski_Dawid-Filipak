import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Jeśli kod działa na serwerze (podczas odświeżania F5), 
  // przepuszczamy go tymczasowo, żeby uniknąć błędnego przekierowania.
  if (!isPlatformBrowser(platformId)) {
    return true; 
  }

  // Jesteśmy w przeglądarce - sprawdzamy token
  const token = localStorage.getItem('token');
  if (token) {
    return true; // Użytkownik zalogowany - wpuszczamy
  }

  // Brak tokenu - wyrzucamy do logowania
  router.navigate(['/login']);
  return false;
};