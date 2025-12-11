import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../models/pokemon/pokemon';
import { ActivatedRoute, Router } from '@angular/router';
import { Pokemon as PokemonService } from '../../services/pokemon/pokemon';

import { Team as TeamService } from '../../services/team/team';
import { Team as TeamModel } from '../../models/team/team';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-detail.html',
  styleUrls: ['./team-detail.css'],
})
export class TeamDetail implements OnInit {
  private teamService = inject(TeamService);
  private route = inject(ActivatedRoute);
  private pokemonService = inject(PokemonService);
  private router = inject(Router);

  team: TeamModel | null = null;
  teamPokemons: Pokemon[] = [];
  allPokemons: Pokemon[] = [];
  availablePokemons: Pokemon[] = [];
  selectedPokemonToReplace: Pokemon | null = null;

  // Paginado
  page = 1;
  pageSize = 24;
  totalPages = 1;

  get pagedAvailablePokemons(): Pokemon[] {
    if (!this.availablePokemons) return [];
    const start = (this.page - 1) * this.pageSize;
    return this.availablePokemons.slice(start, start + this.pageSize);
  }

  ngOnInit() {
    // Leer queryParams primero
    this.route.queryParams.subscribe((params) => {
      const idParam = params['teamId'] ?? params['equipoId'];
      const teamId = +idParam;

      if (!teamId) {
        alert('No teamId provided');
        this.router.navigate(['/team-builder']);
      }

      // Cargar todos los pokemons
      this.pokemonService.get().subscribe({
        next: (data: any) => {
          this.allPokemons = data as Pokemon[];

          // Una vez tenemos los pokemons, cargar el equipo
          this.teamService.getById(teamId).subscribe({
            next: (team: any) => {
              this.team = team as TeamModel;

              if (!this.team) {
                alert('Team not found');
                this.router.navigate(['/team-builder']);
              }

              // Mapear IDs a objetos Pokemon
              const map = new Map(this.allPokemons.map((p) => [p.id, p]));
              this.teamPokemons = (this.team.pokemons || [])
                .map((id) => map.get(id)!)
                .filter(Boolean);
            },
          });
        },
      });
    });
  }

  onUpdatePokemon(pokemon: Pokemon) {
    this.selectedPokemonToReplace = pokemon;

    const usedIds = new Set<number>(this.team?.pokemons || []);
    this.availablePokemons = this.allPokemons.filter((p) => !usedIds.has(p.id));
    this.totalPages = Math.max(1, Math.ceil(this.availablePokemons.length / this.pageSize));
    this.page = 1;
  }

  onReplacePokemon(newPokemon: Pokemon) {
    const oldId = this.selectedPokemonToReplace!.id;
    const idx = this.team?.pokemons.findIndex((id) => id === oldId);

    // Actualizar IDs en el modelo y objetos en la vista
    this.team!.pokemons[idx!] = newPokemon.id;
    this.teamPokemons[idx!] = newPokemon;

    this.teamService.put(this.team!.id, this.team as any).subscribe({
      next: (response) => {
        this.selectedPokemonToReplace = null;
        this.availablePokemons = [];
      },
    });
  }

  onGoBack() {
    this.router.navigate(['/team-builder']);
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  setPageSize(size: number | string): void {
    this.pageSize = Number(size);
    this.totalPages = Math.max(1, Math.ceil((this.availablePokemons?.length ?? 0) / this.pageSize));
    this.page = 1;
  }

  goToPage(target: number | string): void {
    const desired = Number(target);
    if (!Number.isFinite(desired)) return;
    if (desired < 1) {
      this.page = 1;
    } else if (desired > this.totalPages) {
      this.page = this.totalPages;
    } else {
      this.page = desired;
    }
  }
}
