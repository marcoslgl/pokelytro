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
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);
  public isLoading = signal<boolean>(true);
  public userProfile$: Observable<User | null> = of(null);
  public currentUserBasic = this.authService.currentUser;
  private teamService = inject(TeamService);
  public teams: TeamModel[] = [];
  public isUpdatingProfileImage = signal<boolean>(false);
  public profileImageOptions = Array.from({ length: 20 }, (_, i) => i + 1);
  public showProfileImageSelector = signal<boolean>(false);

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

  getPokemonId(entry: number | { pokemonId?: number | string }): number {
    if (typeof entry === 'number') return entry;
    return Number(entry?.pokemonId);
  }

  private refreshTeams(userId: string) {
    this.teamService.getByUserId(userId).subscribe({
      next: (teams: any) => {
        this.teams = teams as TeamModel[];
      },
      error: (err) => {
      },
    });
  }

  toggleProfileImageSelector(): void {
    this.showProfileImageSelector.update(val => !val);
  }

  selectProfileImage(imageNumber: number): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser?._id) {
      return;
    }

    // Guardar estado anterior por si hay que revertir
    const previousUser = { ...currentUser };
    const updatedUser = { ...currentUser, profileImage: imageNumber };

    // Actualizar de forma optimista en el frontend
    this.authService.currentUser.set(updatedUser);
    this.isUpdatingProfileImage.set(true);

    // Actualizar en el backend
    this.authService.updateProfileImage(currentUser._id, imageNumber).subscribe({
      next: (response) => {
        this.isUpdatingProfileImage.set(false);
        // Cerrar el selector solo si fue exitosa la actualización
        this.showProfileImageSelector.set(false);
      },
      error: (err) => {
        this.isUpdatingProfileImage.set(false);
      },
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
