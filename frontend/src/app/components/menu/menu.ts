import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  private authService = inject(AuthService);

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;

  navActive = false;

  togglenav() {
    this.navActive = !this.navActive;
    document.body.classList.toggle('menu-open', this.navActive);
  }

  closenav() {
    this.navActive = false;
    document.body.classList.remove('menu-open');
  }

  onLogout() {
    this.authService.logout();
    this.closenav();
  }
}