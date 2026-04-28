import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.checkLoginStatus();
      
      // Nasłuchujemy zmian stron, by pasek odświeżał się sam po logowaniu/wylogowaniu
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.checkLoginStatus();
        }
      });
    }
  }

  checkLoginStatus() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}