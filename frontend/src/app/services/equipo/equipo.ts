import { Injectable } from '@angular/core';
import { Pokemon } from '../../models/pokemon/pokemon';

export interface EquipoGuardado {
  id: number;
  pokemons: Pokemon[];
}

@Injectable({
  providedIn: 'root',
})
export class EquipoService {
  private equipos: EquipoGuardado[] = [];
  private equipo: Pokemon[] = [];
  private equipoCounter: number = 1;

  getEquipo(): Pokemon[] {
    return this.equipo;
  }

  getEquipoById(id: number): EquipoGuardado | null {
    return this.equipos.find((e) => e.id === id) || null;
  }

  getEquipos(): EquipoGuardado[] {
    return this.equipos;
  }

  addPokemon(pokemon: Pokemon): string | null {
    if (this.equipo.length >= 6) {
      return 'El equipo ya tiene 6 Pokémon.';
    }

    if (this.equipo.find((p) => p.id === pokemon.id)) {
      return 'Este Pokémon ya está en el equipo.';
    }

    this.equipo.push(pokemon);
    return 'Pokémon añadido al equipo correctamente.';
  }

  removePokemon(pokemonId: number): void {
    this.equipo = this.equipo.filter((p) => p.id !== pokemonId);
  }

  saveEquipo(): void {
    if (this.equipo.length < 6) {
      alert('El equipo debe tener 6 Pokémon para guardarlo.');
    } else {
      this.equipos.push({
        id: this.equipoCounter++,
        pokemons: [...this.equipo],
      });
      this.equipo = [];
    }
  }

  replacePokemonInEquipo(equipo: EquipoGuardado, newPokemon: Pokemon, oldPokemonId: number): void {
    const index = equipo.pokemons.findIndex((p) => p.id === oldPokemonId);
    if (index !== -1) {
      equipo.pokemons[index] = newPokemon;
    }
  }
}
