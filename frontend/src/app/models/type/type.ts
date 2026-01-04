export class Type {
attacking!: string;
defending!: string;
multiplier!: number;

constructor(init?: Partial<Type>) {
    if (init) Object.assign(this, init);
  }
}


