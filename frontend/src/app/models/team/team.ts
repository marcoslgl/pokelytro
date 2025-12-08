export class Team {
  id!: number;
  pokemons!: number[]; // Array of Pokemon IDs

  constructor(init?: Partial<Team>) {
    if (init) Object.assign(this, init);
  }
}
