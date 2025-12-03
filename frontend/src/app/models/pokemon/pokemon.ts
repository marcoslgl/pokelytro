export class Pokemon {
  id!: number;
  name!: string;
  generation!: number;
  pokemon_type!: string[];

  // Game Dex numbers
  RBYFRLG?: number;
  LGPE?: number;
  GSC?: number;
  HGSS?: number;
  RSE?: number;
  ORAS?: number;
  DPBDSP?: number;
  Pt?: number;
  BW?: number;
  B2W2?: number;
  XY_Central?: number;
  XY_Coastal?: number;
  XY_Mount?: number;
  SM_Alola?: number;
  SM_Melemele?: number;
  SM_Akala?: number;
  SM_Ulaula?: number;
  SM_Poni?: number;
  USUM_Alola?: number;
  USUM_Melemele?: number;
  USUM_Akala?: number;
  USUM_Ulaula?: number;
  USUM_Poni?: number;
  SwSh_Galar?: number;
  SwSh_Isle?: number;
  SwSh_Crown?: number;
  LA?: number;
  SV_Paldea?: number;
  SV_Kitakami?: number;
  SV_Blueberry?: number;

  // Stats
  hp!: number;
  attack!: number;
  defense!: number;
  special_attack!: number;
  special_defense!: number;
  speed!: number;
  total!: number;

  // Types & abilities
  type1!: string;
  type2?: string;
  ability1!: string;
  ability2?: string;
  hidden_ability?: string;

  // Physical
  height!: number;
  weight!: number;

  // EVs
  HP_EVs?: number;
  Attack_EVs?: number;
  Defense_EVs?: number;
  Special_Attack_EVs?: number;
  Special_Defense_EVs?: number;
  Speed_EVs?: number;

  // Other
  experience_value!: number;
  catch_rate!: number;
  experience_growth!: string;
  base_friendship!: number;
  pokedex_color!: string;
  gender_ratio!: string;
  egg_cycles!: number;
  egg_group1!: string;
  egg_group2?: string;
  evolution_method?: string;

  constructor(init?: Partial<Pokemon>) {
    if (init) Object.assign(this, init);
  }
}

