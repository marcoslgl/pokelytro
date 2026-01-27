import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Pokemon } from '../models/pokemon/pokemon';
import { PokemonListStore } from '../services/pokemon-list-store/pokemon-list-store';

export const pokemonListResolver: ResolveFn<Pokemon[]> = () => {
  return inject(PokemonListStore).getList();
};
