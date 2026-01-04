import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../models/pokemon/pokemon';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonListStore } from '../../services/pokemon-list-store/pokemon-list-store';
import { PokemonList } from '../../components/pokemon-list/pokemon-list';

import { Team as TeamService } from '../../services/team/team';
import { Team as TeamModel } from '../../models/team/team';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, PokemonList],
  templateUrl: './team-detail.html',
  styleUrls: ['./team-detail.css'],
})
export class TeamDetail implements OnInit {
  private teamService = inject(TeamService);
  private route = inject(ActivatedRoute);
  private pokemonListStore = inject(PokemonListStore);
  private router = inject(Router);

  team: TeamModel | null = null;
  teamPokemons: Pokemon[] = [];
  allPokemons: Pokemon[] = [];
  selectedPokemonToReplace: Pokemon | null = null;
  errorMessage: string | null = null;

  ngOnInit() {
    // Leer queryParams primero
    this.route.queryParams.subscribe((params) => {
      const idParam = params['teamId'] ?? params['equipoId'];
      const teamId = +idParam;

      if (!teamId) {
        alert('No teamId provided');
        this.router.navigate(['/team-builder']);
        return;
      }

      // Cargar todos los pokemons
      this.pokemonListStore.getList().subscribe({
        next: (data: any) => {
          this.allPokemons = data as Pokemon[];

          // Una vez tenemos los pokemons, cargar el equipo
          this.teamService.getById(teamId).subscribe({
            next: (team: any) => {
              this.team = team as TeamModel;

              if (!this.team) {
                alert('Team not found');
                this.router.navigate(['/team-builder']);
                return;
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
  }

  onReplacePokemon(newPokemon: Pokemon) {
    if (!this.team || !this.selectedPokemonToReplace) return;

    const oldId = this.selectedPokemonToReplace.id;
    const idx = this.team.pokemons.findIndex((id) => id === oldId);
    if (idx === -1) return;

    const previousIds = [...this.team.pokemons];
    const previousTeamPokemons = [...this.teamPokemons];
    const updatedIds = [...this.team.pokemons];
    updatedIds[idx] = newPokemon.id;

    this.teamService.put(this.team.id, { ...this.team, pokemons: updatedIds } as any).subscribe({
      next: (response: any) => {
        this.team = response as TeamModel;
        this.teamPokemons = [...previousTeamPokemons];
        this.teamPokemons[idx] = newPokemon;
        this.selectedPokemonToReplace = null;
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'No se pudo actualizar el equipo';
        this.team!.pokemons = previousIds;
        this.selectedPokemonToReplace = null;
      },
    });
  }

  onGoBack() {
    this.router.navigate(['/team-builder']);
  }
}
