export class Team {
  _id?: string;
  name!: string;
  pokemons!: number[]; // Array of Pokemon IDs
  userId!: string; // ID of the user who owns the team

  constructor(init?: Partial<Team>) {
    if (init) Object.assign(this, init);
  }
}
