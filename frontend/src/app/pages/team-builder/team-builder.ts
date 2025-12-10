import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipoService, EquipoGuardado } from '../../services/equipo/equipo';
import { Pokemon as PokemonService } from '../../services/pokemon/pokemon';
import { Pokemon } from '../../models/pokemon/pokemon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-builder.html',
  styleUrl: './team-builder.css',
})
export class TeamBuilder implements OnInit {
  private equipoService = inject(EquipoService);
  private pokemonService = inject(PokemonService);
  private router = inject(Router);

  equipos: EquipoGuardado[] = [];
  equipo: Pokemon[] = [];
  allPokemons: Pokemon[] = [];
  error: string | null = null;

  ngOnInit(): void {
    this.equipo = this.equipoService.getEquipo();
    this.equipos = this.equipoService.getEquipos();
    this.pokemonService.get().subscribe((data: any) => {
      this.allPokemons = data;
    });
  }

  trackByPokemon(index: number, pokemon: Pokemon) {
    return pokemon.id;
  }

  onAddPokemon(pokemon: Pokemon) {
    const message = this.equipoService.addPokemon(pokemon);
    if (message && message !== 'Pokémon añadido al equipo correctamente.') {
      this.error = message;
      setTimeout(() => (this.error = null), 3000);
    }
    this.equipo = this.equipoService.getEquipo();
  }

  onRemoveFromTeam(pokemon: Pokemon) {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${pokemon.name} del equipo?`)) {
    this.equipoService.removePokemon(pokemon.id);
    this.equipo = this.equipoService.getEquipo();
    }
  }

  onSaveTeam() {
    this.equipoService.saveEquipo();
    this.equipo = this.equipoService.getEquipo();
    this.equipos = this.equipoService.getEquipos();
  }

  onSelectEquipo(equipoId: number) {
    this.router.navigate(['/team-detail'], {
      queryParams: {
        equipoId: equipoId,
      },
    });
  }
}
