export class Item {
  name!: string;
  gen!: string;
  desc!: string;

  constructor(init?: Partial<Item>) {
    if (init) Object.assign(this, init);
  }
}
