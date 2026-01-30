import { Component, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { signal, effect } from '@angular/core';
import { Pokemon as PokemonModel } from '../../models/pokemon/pokemon';
import { Pokemon as PokemonService } from '../../services/pokemon/pokemon';
import { PokemonListStore } from '../../services/pokemon-list-store/pokemon-list-store';
import { AuthService } from '../../services/auth.service';
import { Type as TypeService, TypeModel as TypeEffectivenessRow } from '../../services/type/type';
import { finalize } from 'rxjs/operators';

type TypeDefenseCell = {
  type: string;
  abbr: string;
  multiplier: number;
  label: string;
  typeClass: string;
  effectClass: string;
};

@Component({
  selector: 'app-pokemon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pokemon.html',
  styleUrls: ['./pokemon.css'],
})
export class Pokemon implements OnInit {
  private route = inject(ActivatedRoute);
  private pokemonService = inject(PokemonService);
  private pokemonListStore = inject(PokemonListStore);
  private typeService = inject(TypeService);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);
  private router = inject(Router);

  pokemon?: PokemonModel;
  id?: number;

  typeDefenses: TypeDefenseCell[] = [];
  private typeRows: TypeEffectivenessRow[] = [];

  private favorites = signal<Set<number>>(new Set<number>());
  public favoritesLoading = signal<boolean>(false);

  private readonly typeOrder = [
    'Normal',
    'Fire',
    'Water',
    'Electric',
    'Grass',
    'Ice',
    'Fighting',
    'Poison',
    'Ground',
    'Flying',
    'Psychic',
    'Bug',
    'Rock',
    'Ghost',
    'Dragon',
    'Dark',
    'Steel',
    'Fairy',
  ];

  private readonly typeAbbr: Record<string, string> = {
    Normal: 'NOR',
    Fire: 'FIR',
    Water: 'WAT',
    Electric: 'ELE',
    Grass: 'GRA',
    Ice: 'ICE',
    Fighting: 'FIG',
    Poison: 'POI',
    Ground: 'GRO',
    Flying: 'FLY',
    Psychic: 'PSY',
    Bug: 'BUG',
    Rock: 'ROC',
    Ghost: 'GHO',
    Dragon: 'DRA',
    Dark: 'DAR',
    Steel: 'STE',
    Fairy: 'FAI',
  };

  private baseIdToIds = new Map<number, number[]>();
  private sortedBaseIds: number[] = [];

  private getCurrentNavId(): number | null {
    const rawId = this.pokemon?.id ?? this.id;
    const parsed = Number(rawId);
    if (!Number.isFinite(parsed)) return null;
    return parsed;
  }

  private getFallbackPrevId(): number | null {
    const currentId = this.getCurrentNavId();
    if (currentId === null) return null;
    const baseId = Math.trunc(currentId);
    if (baseId <= 1) return null;
    return baseId - 1;
  }

  private getFallbackNextId(maxId = 1025): number | null {
    const currentId = this.getCurrentNavId();
    if (currentId === null) return null;
    const baseId = Math.trunc(currentId);
    if (baseId >= maxId) return null;
    return baseId + 1;
  }

  private findPrevBaseId(baseId: number): number | null {
    if (this.sortedBaseIds.length === 0) return null;
    const idx = this.sortedBaseIds.indexOf(baseId);
    if (idx > 0) return this.sortedBaseIds[idx - 1];
    if (idx === 0) return null;

    let candidate: number | null = null;
    for (const b of this.sortedBaseIds) {
      if (b < baseId) candidate = b;
      else break;
    }
    return candidate;
  }

  private findNextBaseId(baseId: number): number | null {
    if (this.sortedBaseIds.length === 0) return null;
    const idx = this.sortedBaseIds.indexOf(baseId);
    if (idx !== -1) {
      return idx < this.sortedBaseIds.length - 1 ? this.sortedBaseIds[idx + 1] : null;
    }

    for (const b of this.sortedBaseIds) {
      if (b > baseId) return b;
    }
    return null;
  }

  navPrevId(): number | null {
    const currentId = this.getCurrentNavId();
    if (currentId === null) return null;

    if (this.baseIdToIds.size === 0) return this.getFallbackPrevId();

    const baseId = Math.trunc(currentId);
    const group = this.baseIdToIds.get(baseId);
    if (!group || group.length === 0) return this.getFallbackPrevId();

    const idx = group.indexOf(currentId);
    if (idx > 0) return group[idx - 1];

    const prevBase = this.findPrevBaseId(baseId);
    if (prevBase === null) return null;
    const prevGroup = this.baseIdToIds.get(prevBase);
    return prevGroup && prevGroup.length > 0 ? prevGroup[prevGroup.length - 1] : prevBase;
  }

  navNextId(): number | null {
    const currentId = this.getCurrentNavId();
    if (currentId === null) return null;

    if (this.baseIdToIds.size === 0) return this.getFallbackNextId();

    const baseId = Math.trunc(currentId);
    const group = this.baseIdToIds.get(baseId);
    if (!group || group.length === 0) return this.getFallbackNextId();

    const idx = group.indexOf(currentId);
    if (idx !== -1 && idx < group.length - 1) return group[idx + 1];

    const nextBase = this.findNextBaseId(baseId);
    if (nextBase === null) return null;
    const nextGroup = this.baseIdToIds.get(nextBase);
    return nextGroup && nextGroup.length > 0 ? nextGroup[0] : nextBase;
  }

  private loadUserFavorites(): void {
    const current = this.authService.currentUser();

    if (current?._id) {
      this.favoritesLoading.set(true);
      this.authService
        .getFavorites(current._id)
        .pipe(finalize(() => this.favoritesLoading.set(false)))
        .subscribe({
          next: (favorites) => {
            this.favorites.set(new Set<number>(favorites ?? []));

            const updatedUser = this.authService.currentUser();
            if (updatedUser) {
              this.authService.currentUser.set({ ...updatedUser, favorites: favorites ?? [] });
            }
          },
          error: (err) => {
            console.error('Error loading favorites:', err);
          },
        });
      return;
    }

    // Si hay token pero no hay usuario cargado aún, intentamos recuperar el perfil
    const token = this.authService.getToken();
    if (token) {
      this.favoritesLoading.set(true);
      this.authService
        .getProfile()
        .pipe(finalize(() => this.favoritesLoading.set(false)))
        .subscribe({
          next: (profile) => {
            this.authService.currentUser.set(profile);
            this.authService.isAuthenticated.set(true);
            this.favorites.set(new Set<number>(profile?.favorites ?? []));
          },
          error: () => {
            // Si el token es inválido, AuthService ya acabará cerrando sesión en otros flujos
          },
        });
    }
  }

  statBarWidth(value?: number, max = 200): number {
    const safeValue = typeof value === 'number' && Number.isFinite(value) ? value : 0;
    const safeMax = typeof max === 'number' && Number.isFinite(max) && max > 0 ? max : 1;
    const raw = (safeValue / safeMax) * 100;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }

  statBarClass(
    value?: number,
    max = 255,
  ): 'stat-very-low' | 'stat-low' | 'stat-mid' | 'stat-high' | 'stat-very-high' {
    const pct = this.statBarWidth(value, max);
    if (pct >= 55) return 'stat-very-high';
    if (pct >= 35) return 'stat-high';
    if (pct >= 25) return 'stat-mid';
    if (pct >= 14) return 'stat-low';
    return 'stat-very-low';
  }

  ngOnInit(): void {
    this.loadUserFavorites();

    this.pokemonListStore.getList().subscribe((list: PokemonModel[]) => {
      const map = new Map<number, number[]>();
      for (const p of list ?? []) {
        const id = Number((p as any)?.id);
        if (!Number.isFinite(id)) continue;
        const base = Math.trunc(id);
        if (base < 1) continue;
        const arr = map.get(base);
        if (arr) arr.push(id);
        else map.set(base, [id]);
      }

      for (const [base, ids] of map.entries()) {
        const uniqueSorted = Array.from(new Set(ids)).sort((a, b) => a - b);
        map.set(base, uniqueSorted);
      }

      this.baseIdToIds = map;
      this.sortedBaseIds = Array.from(map.keys()).sort((a, b) => a - b);
    });

    this.typeService.get().subscribe((rows: any[]) => {
      this.typeRows = (rows ?? [])
        .map((r) => this.normalizeTypeRow(r))
        .filter((r): r is TypeEffectivenessRow => r !== null);
      this.recomputeTypeDefenses();
    });

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.id = idParam ? Number(idParam) : undefined;
      if (this.id !== undefined) {
        this.pokemonService.getById(this.id).subscribe((pokemon: any) => {
          this.pokemon = pokemon as PokemonModel;
          this.recomputeTypeDefenses();
        });
      }
    });
  }

  private recomputeTypeDefenses(): void {
    if (!this.pokemon || this.typeRows.length === 0) {
      this.typeDefenses = [];
      return;
    }

    const defender1 = this.toApiTypeName(this.pokemon.type1);
    const defender2 = this.pokemon.type2 ? this.toApiTypeName(this.pokemon.type2) : undefined;

    const multiplierFor = (attacking: string, defender: string): number => {
      const row = this.typeRows.find(
        (r) => r.attacking_type === attacking && r.defender_type === defender,
      );
      return typeof row?.multiplier === 'number' ? row.multiplier : 1;
    };

    this.typeDefenses = this.typeOrder.map((uiType) => {
      const attacking = this.toApiTypeName(uiType);
      const m1 = multiplierFor(attacking, defender1);
      const m2 = defender2 ? multiplierFor(attacking, defender2) : 1;
      const m = m1 * m2;

      return {
        type: uiType,
        abbr: this.typeAbbr[uiType] ?? uiType.substring(0, 3).toUpperCase(),
        multiplier: m,
        label: this.formatMultiplierLabel(m),
        typeClass: uiType,
        effectClass: this.effectClass(m),
      };
    });
  }

  private normalizeTypeRow(row: any): TypeEffectivenessRow | null {
    if (!row || typeof row !== 'object') return null;

    const attacking =
      row.attacking_type ?? row.attackingType ?? row.atacante ?? row.attacker ?? row.attacking;

    const defender =
      row.defender_type ?? row.defenderType ?? row.defensor ?? row.defender ?? row.defending;

    const multiplier =
      row.multiplier ?? row.multiplicador ?? row.effectiveness ?? row.efectividad ?? row.mult;

    if (typeof attacking !== 'string' || typeof defender !== 'string') return null;
    const m = Number(multiplier);
    if (!Number.isFinite(m)) return null;

    return {
      _id: row._id,
      attacking_type: attacking.trim().toUpperCase(),
      defender_type: defender.trim().toUpperCase(),
      multiplier: m,
    };
  }

  private toApiTypeName(value: string): string {
    return (value ?? '').trim().toUpperCase();
  }

  private formatMultiplierLabel(multiplier: number): string {
    const approx = (a: number, b: number) => Math.abs(a - b) < 1e-9;
    if (approx(multiplier, 0.25)) return 'x0.25';
    if (approx(multiplier, 0.5)) return 'x0.5';
    if (approx(multiplier, 1)) return 'x1';
    if (approx(multiplier, 2)) return 'x2';
    if (approx(multiplier, 4)) return 'x4';

    const cleaned = Number.isInteger(multiplier)
      ? `${multiplier}`
      : `${multiplier}`.replace(/\.0+$/, '');
    return `x${cleaned}`;
  }

  private effectClass(multiplier: number): string {
    const approx = (a: number, b: number) => Math.abs(a - b) < 1e-9;
    if (approx(multiplier, 0)) return 'eff-immune';
    if (multiplier > 1) return 'eff-weak';
    if (multiplier < 1) return 'eff-resist';
    return 'eff-neutral';
  }
  formatId(id: any): string {
    if (id == null) return '';
    const str = id.toString();
    const [intPart, decPart] = str.split('.');
    return decPart ? intPart.padStart(4, '0') + '.' + decPart : intPart.padStart(4, '0');
  }

  get isUserLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  isFavorite(pokemon: PokemonModel | undefined): boolean {
    if (!pokemon) return false;
    return this.favorites().has(pokemon.id);
  }

  toggleFavorite(pokemon: PokemonModel | undefined): void {
    if (!pokemon) return;

    const user = this.authService.currentUser();
    if (!user?._id) {
      this.router.navigate(['/login']);
      return;
    }

    const pokemonId = pokemon.id;
    const currentlyFav = this.favorites().has(pokemonId);

    const request$ = currentlyFav
      ? this.authService.removeFavorite(user._id, pokemonId)
      : this.authService.addFavorite(user._id, pokemonId);

    request$.subscribe({
      next: (favorites) => {
        this.favorites.set(new Set<number>(favorites ?? []));
        const updated = this.authService.currentUser();
        if (updated) {
          this.authService.currentUser.set({ ...updated, favorites: favorites ?? [] });
        }
      },
      error: (err) => {
        console.error('Error toggling favorite:', err);
      },
    });
  }

  formatGenderRate(rate: string): SafeHtml {
    if (!rate || rate.toLowerCase() === 'genderless') {
      return this.sanitizer.bypassSecurityTrustHtml('Genderless');
    }
    if (rate.toLowerCase() === 'neutral') {
      return this.sanitizer.bypassSecurityTrustHtml(
        "<span class='male-text'>Male</span> 50% / <span class='female-text'>Female</span> 50% ",
      );
    }
    const mMatch = rate.match(/m\s*[\(]?\s*(\d+(?:\.\d+)?)%[\)]?/i);
    const fMatch = rate.match(/f\s*[\(]?\s*(\d+(?:\.\d+)?)%[\)]?/i);
    let male = 0,
      female = 0;
    if (mMatch) {
      male = parseFloat(mMatch[1]);
      female = 100 - male;
    } else if (fMatch) {
      female = parseFloat(fMatch[1]);
      male = 100 - female;
    } else {
      const num = parseFloat(rate);
      if (!isNaN(num)) {
        female = num;
        male = 100 - num;
      } else {
        return this.sanitizer.bypassSecurityTrustHtml(rate);
      }
    }
    const maleStr = Math.round(male * 10) / 10;
    const femaleStr = Math.round(female * 10) / 10;
    return this.sanitizer.bypassSecurityTrustHtml(
      `<span class='male-text'>Male</span> ${maleStr}% / <span class='female-text'>Female</span> ${femaleStr}%`,
    );
  }

  getAndFormatDexNumbers(): string {
    if (!this.pokemon) return '';
    const dexNumbers: string[] = [];
    const gameDexMap: { [key: string]: string } = {
      RBYFRLG: '(Red/Blue/Yellow/FireRed/LeafGreen)',
      LGPE: "(Let's Go Pikachu/Eevee)",
      GSC: '(Gold/Silver/Crystal)',
      HGSS: '(HeartGold/SoulSilver)',
      RSE: '(Ruby/Sapphire/Emerald)',
      ORAS: '(Omega Ruby/Alpha Sapphire)',
      DPBDSP: '(Diamond/Pearl/Brilliant Diamond/Shining Pearl)',
      Pt: '(Platinum)',
      BW: '(Black/White)',
      B2W2: '(Black 2/White 2)',
      XY_Central: '(X/Y Central Kalos)',
      XY_Coastal: '(X/Y Coastal Kalos)',
      XY_Mount: '(X/Y Mountain Kalos)',
      SM_Alola: '(Sun/Moon Alola)',
      SM_Melemele: '(Sun/Moon Melemele Island)',
      SM_Akala: '(Sun/Moon Akala Island)',
      SM_Ulaula: "(Sun/Moon Ula'ula Island)",
      SM_Poni: '(Sun/Moon Poni Island)',
      USUM_Alola: '(Ultra Sun/Ultra Moon Alola)',
      USUM_Melemele: '(Ultra Sun/Ultra Moon Melemele Island)',
      USUM_Akala: '(Ultra Sun/Ultra Moon Akala Island)',
      USUM_Ulaula: "(Ultra Sun/Ultra Moon Ula'ula Island)",
      USUM_Poni: '(Ultra Sun/Ultra Moon Poni Island)',
      SwSh_Galar: '(Sword/Shield Galar)',
      SwSh_Isle: '(Sword/Shield Isle of Armor)',
      SwSh_Crown: '(Sword/Shield Crown Tundra)',
      LA: '(Legends: Arceus)',
      SV_Paldea: '(Scarlet/Violet Paldea)',
      SV_Kitakami: '(Scarlet/Violet Kitakami)',
      SV_Blueberry: '(Scarlet/Violet Blueberry Academy)',
    };
    for (const [key, label] of Object.entries(gameDexMap)) {
      const value = (this.pokemon as any)[key];
      if (value !== undefined && value !== null && value !== 0 && value !== '') {
        dexNumbers.push(`<b>${value}</b> ${label}`);
      }
    }
    return dexNumbers.map((d) => `<div>${d}</div>`).join('');
  }
}
