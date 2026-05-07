import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  public authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;

  isAuthPage(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/register' || url === '/profile';
  }

  getProfileImageUrl(): string {
    const user = this.currentUser();
    if (user?.profileImage) {
      return `/profiles/${user.profileImage}.png`;
    }
    return `/profiles/1.png`;
  }
}
