import { Move } from '../move/move';

export class PokeMoves {
  _id?: string;
  moves!: Move[];

  constructor(init?: Partial<PokeMoves>) {
    if (init) Object.assign(this, init);
  }
}
