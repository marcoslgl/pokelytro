import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../models/pokemon/pokemon';
import { Router } from '@angular/router';
import { PokemonList } from '../../components/pokemon-list/pokemon-list';
import { PokemonListStore } from '../../services/pokemon-list-store/pokemon-list-store';

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
  private pokemonListStore = inject(PokemonListStore);
  private router = inject(Router);

  teams: TeamModel[] = [];
  currentTeam: Pokemon[] = [];
  allPokemons: Pokemon[] = [];
  pokemonMap = new Map<number, Pokemon>();
  isSaving: boolean = false;
  showSavedTeams: boolean = false;

  ngOnInit(): void {
    this.pokemonListStore.getList().subscribe((data: any) => {
      this.allPokemons = data as Pokemon[];
      this.pokemonMap = new Map(this.allPokemons.map((p) => [p.id, p]));
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
      alert('The team already has 6 Pokémon.');
      return;
    }
    if (this.currentTeam.some((p) => p.id === pokemon.id)) {
      alert('This Pokémon is already in the team.');
      return;
    }
    this.currentTeam = [...this.currentTeam, pokemon];
  }

  onRemoveFromTeam(pokemon: Pokemon) {
    this.currentTeam = this.currentTeam.filter((p) => p.id !== pokemon.id);
  }

  onSaveTeam() {
    if (this.currentTeam.length < 6) {
      alert('The team must have 6 Pokémon to save it.');
      return;
    }

    this.isSaving = true;

    // Generar el siguiente ID disponible
    const nextId = this.teams.length > 0 ? Math.max(...this.teams.map((t) => t._id || 0)) + 1 : 1;

    const payload = new TeamModel({
      _id: nextId,
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
    if (confirm(`Are you sure you want to delete the team: "${equipo.name}"?`)) {
      this.teamService.delete(equipo._id!).subscribe({
        next: () => {
          this.refreshTeams();
        },
      });
    }
  }

  pokemonName(id: number): string {
    return this.pokemonMap.get(id)?.name ?? `#${id}`;
  }
}
