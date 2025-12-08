import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../models/pokemon/pokemon';
import { EquipoService, EquipoGuardado } from '../../services/equipo/equipo';
import { ActivatedRoute, Router } from '@angular/router';
import { Pokemon as PokemonService } from '../../services/pokemon/pokemon';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule], // AÑADIDO CommonModule
  templateUrl: './team-detail.html',
  styleUrls: ['./team-detail.css'],
})
export class TeamDetail implements OnInit {
  private equipoService = inject(EquipoService);
  private route = inject(ActivatedRoute);
  private pokemonService = inject(PokemonService);
  private router = inject(Router);

  selectedEquipo: EquipoGuardado | null = null;
  selectedPokemonToReplace: Pokemon | null = null; // RENOMBRADO para claridad
  showPokemons: boolean = false;
  pokemons: Pokemon[] = [];
  allPokemons: Pokemon[] = []; // AÑADIDO para guardar todos los pokémons

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.selectedEquipo = this.equipoService.getEquipoById(+params['equipoId']);
      if (!this.selectedEquipo) {
        this.router.navigate(['/team-builder']);
      }
    });

    // Guardamos todos los pokémons disponibles
    this.pokemonService.get().subscribe((data: any) => {
      this.allPokemons = data;
    });
  }

  onUpdatePokemon(pokemon: Pokemon) {
    // Guardamos el pokémon del equipo que queremos reemplazar
    this.selectedPokemonToReplace = pokemon;

    // Filtramos los pokémons del equipo actual
    const equipoIds = new Set(this.selectedEquipo!.pokemons.map((p) => p.id));
    this.pokemons = this.allPokemons.filter((p) => !equipoIds.has(p.id));

    this.showPokemons = true;
  }

  onReplacePokemon(newPokemon: Pokemon) {
    if (this.selectedEquipo && this.selectedPokemonToReplace) {
      this.equipoService.replacePokemonInEquipo(
        this.selectedEquipo,
        newPokemon,
        this.selectedPokemonToReplace.id // Usamos el ID del pokémon que queremos reemplazar
      );
      this.selectedPokemonToReplace = null;
      this.showPokemons = false;
    }
  }

  onGoBack() {
    this.router.navigate(['/team-builder']);
  }
}
