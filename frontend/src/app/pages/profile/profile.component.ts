import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user/user';
import { Router, RouterModule } from '@angular/router';
import { Observable, catchError, of, map } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Team as TeamModel } from '../../models/team/team';
import { Team as TeamService } from '../../services/team/team';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);
  public isLoading = signal<boolean>(true);
  public userProfile$: Observable<User | null> = of(null);
  public currentUserBasic = this.authService.currentUser;
  private teamService = inject(TeamService);
  public teams: TeamModel[] = [];

  ngOnInit(): void {
    this.userProfile$ = this.authService.getProfile().pipe(
      tap((profile) => {
        this.authService.currentUser.set(profile);
        if (profile?._id) {
          this.refreshTeams(profile._id);
        } else {
          this.teams = [];
        }
      }),
      catchError((error) => {
        console.error('Error al cargar el perfil. Token inválido o expirado.', error);
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return of(null);
      }),
      map((data) => {
        this.isLoading.set(false);
        return data;
      }),
    );
  }

  onSelectEquipo(teamId: string) {
    this.router.navigate(['/team-detail'], {
      queryParams: { teamId },
    });
  }

  onDeleteEquipo(equipo: TeamModel) {
    const teamId = equipo._id;
    if (confirm(`Are you sure you want to delete the team: "${equipo.name}"?`)) {
      this.teamService.delete(teamId!).subscribe({
        next: () => {
          const currentUser = this.authService.currentUser();
          if (currentUser?._id) this.refreshTeams(currentUser._id);
        },
      });
    }
  }

  private refreshTeams(userId: string) {
    this.teamService.getByUserId(userId).subscribe({
      next: (teams: any) => {
        this.teams = teams as TeamModel[];
      },
      error: (err) => {
        console.error('Error loading teams for user', err);
        this.teams = [];
      },
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
