import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  credentials = { email: '', haslo: '' };

  constructor(private router: Router) {}

  async handleLogin() {
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.credentials)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        this.router.navigate(['/']);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Nie można połączyć się z serwerem!');
    }
  }
}