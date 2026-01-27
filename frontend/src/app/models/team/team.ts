export class Team {
  _id?: string;
  name!: string;
  pokemons!: number[]; // Array of Pokemon IDs

  constructor(init?: Partial<Team>) {
    if (init) Object.assign(this, init);
  }
}
