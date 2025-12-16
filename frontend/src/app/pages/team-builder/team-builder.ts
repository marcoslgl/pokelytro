import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon as PokemonService } from '../../services/pokemon/pokemon';
import { Pokemon } from '../../models/pokemon/pokemon';
import { Router } from '@angular/router';
import { PokemonList } from '../../components/pokemon-list/pokemon-list';

import { Team as TeamService } from '../../services/team/team';
import { Team as TeamModel } from '../../models/team/team';

@Component({
  selector: 'app-team-builder',
  standalone: true,
  imports: [CommonModule, PokemonList],
  templateUrl: './team-builder.html',
  styleUrl: './team-builder.css',
})
export class TeamBuilder implements OnInit {
  private teamService = inject(TeamService);
  private pokemonService = inject(PokemonService);
  private router = inject(Router);

  teams: TeamModel[] = [];
  currentTeam: Pokemon[] = [];
  allPokemons: Pokemon[] = [];
  pokemonMap = new Map<number, Pokemon>();
  isSaving: boolean = false;

  // Paginado
  page = 1;
  pageSize = 24;
  totalPages = 1;

  get pagedPokemons(): Pokemon[] {
    if (!this.allPokemons) return [];
    const start = (this.page - 1) * this.pageSize;
    return this.allPokemons.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.pokemonService.get().subscribe((data: any) => {
      this.allPokemons = data as Pokemon[];
      this.pokemonMap = new Map(this.allPokemons.map((p) => [p.id, p]));
      this.totalPages = Math.max(1, Math.ceil(this.allPokemons.length / this.pageSize));
    });

    this.refreshTeams();
  }

  private refreshTeams() {
    this.teamService.get().subscribe({
      next: (teams: any) => {
        this.teams = teams as TeamModel[];
      },
    });
  }

  trackByPokemon(index: number, pokemon: Pokemon) {
    return pokemon.id;
  }

  onAddPokemon(pokemon: Pokemon) {
    if (this.currentTeam.length >= 6) {
      alert('El equipo ya tiene 6 Pokémon.');
      return;
    }
    if (this.currentTeam.some((p) => p.id === pokemon.id)) {
      alert('Este Pokémon ya está en el equipo.');
      return;
    }
    this.currentTeam = [...this.currentTeam, pokemon];
  }

  onRemoveFromTeam(pokemon: Pokemon) {
    this.currentTeam = this.currentTeam.filter((p) => p.id !== pokemon.id);
  }

  onSaveTeam() {
    if (this.currentTeam.length < 6) {
      alert('El equipo debe tener 6 Pokémon para guardarlo.');
      return;
    }

    this.isSaving = true;

    // Generar el siguiente ID disponible
    const nextId = this.teams.length > 0 ? Math.max(...this.teams.map((t) => t.id || 0)) + 1 : 1;

    const payload = new TeamModel({
      id: nextId,
      name: `Team ${nextId}`,
      pokemons: this.currentTeam.map((p) => p.id),
    });

    this.teamService.post(payload as any).subscribe({
      next: () => {
        this.currentTeam = [];
        this.isSaving = false;
        this.refreshTeams();
      },
    });
  }

  onSelectEquipo(teamId: number) {
    this.router.navigate(['/team-detail'], {
      queryParams: { teamId },
    });
  }

  onDeleteEquipo(equipo: TeamModel) {
    if (confirm('¿Estás seguro de que deseas eliminar el equipo: "' + equipo.name + '"?')) {
      this.teamService.delete(equipo.id).subscribe({
        next: () => {
          this.refreshTeams();
        },
      });
    }
  }


  pokemonName(id: number): string {
    return this.pokemonMap.get(id)?.name ?? `#${id}`;
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
    this.totalPages = Math.max(1, Math.ceil((this.allPokemons?.length ?? 0) / this.pageSize));
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
