import { PokeMoves } from '../poke_moves/poke_moves';

export type TeamPokemonSlot = {
  pokemonId: number;
  moves: string[];
};

export class Team {
  _id?: string;
  name!: string;
  pokemons!: TeamPokemonSlot[];
  userId!: string; // ID of the user who owns the team

  constructor(init?: Partial<Team>) {
    if (init) Object.assign(this, init);
  }
}
