import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User, Team } from '../../models/user/user';
import { Router, RouterModule } from '@angular/router';
import { Observable, catchError, of, map } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  public isLoading = this.authService.isAuthenticated;
  public userProfile$: Observable<User | null> = of(null);
  public currentUserBasic = this.authService.currentUser;


  ngOnInit(): void {
    this.userProfile$ = this.authService.getProfile().pipe(
      tap(profile => this.authService.currentUser.set(profile)),
      catchError(error => {
        console.error('Error al cargar el perfil. Token inválido o expirado.', error);
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return of(null);
      }),
      map(data => {
        this.isLoading.set(false);
        return data;
      })
    );
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}