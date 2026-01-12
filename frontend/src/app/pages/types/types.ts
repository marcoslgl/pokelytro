import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Type as TypeService, TypeModel as TypeEffectivenessRow } from '../../services/type/type';

type ArrowRow = {
  type: string;
  weak: string[];
  strong: string[];
};

@Component({
  selector: 'app-types',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './types.html',
  styleUrls: ['./types.css'],
})
export class Types implements OnInit {
  private typeService = inject(TypeService);

  loading = true;
  error: string | null = null;

  view: 'matrix' | 'arrows' = 'matrix';

  grid: number[][] = [];
  arrows: ArrowRow[] = [];

  readonly types = [
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

  ngOnInit(): void {
    this.typeService.get().subscribe({
      next: (rows: any[]) => {
        const normalized = (rows ?? [])
          .map((r) => this.normalizeRow(r))
          .filter((r): r is TypeEffectivenessRow => r !== null);

        this.grid = this.makeGrid(normalized);
        this.arrows = this.makeArrows(this.grid);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error =
          (typeof err?.error?.message === 'string' && err.error.message) ||
          (typeof err?.message === 'string' && err.message) ||
          'Failed to load type chart.';
      },
    });
  }

  abbr(uiType: string): string {
    return this.typeAbbr[uiType] ?? uiType.substring(0, 3).toUpperCase();
  }

  m(atkIndex: number, defIndex: number): number {
    return this.grid?.[atkIndex]?.[defIndex] ?? 1;
  }

  label(multiplier: number): string {
    const approx = (a: number, b: number) => Math.abs(a - b) < 1e-9;
    if (approx(multiplier, 0)) return '0';
    if (approx(multiplier, 0.25)) return '¼';
    if (approx(multiplier, 0.5)) return '½';
    if (approx(multiplier, 1)) return '1';
    if (approx(multiplier, 2)) return '2';
    if (approx(multiplier, 4)) return '4';

    const cleaned = Number.isInteger(multiplier)
      ? `${multiplier}`
      : `${multiplier}`.replace(/\.0+$/, '');
    return cleaned;
  }

  cell(multiplier: number): string {
    const approx = (a: number, b: number) => Math.abs(a - b) < 1e-9;
    if (approx(multiplier, 0)) return 'cell immune';
    if (multiplier > 1) return 'cell weak';
    if (multiplier < 1) return 'cell resist';
    return 'cell neutral';
  }

  private makeArrows(grid: number[][]): ArrowRow[] {
    return this.types.map((type, typeIndex) => {
      const weak: string[] = [];
      const strong: string[] = [];

      for (let i = 0; i < this.types.length; i++) {
        const incoming = grid?.[i]?.[typeIndex] ?? 1; // attacker i -> defender type
        if (incoming > 1) weak.push(this.types[i]);

        const outgoing = grid?.[typeIndex]?.[i] ?? 1; // attacker type -> defender i
        if (outgoing > 1) strong.push(this.types[i]);
      }

      return { type, weak, strong };
    });
  }

  private makeGrid(rows: TypeEffectivenessRow[]): number[][] {
    const key = (a: string, d: string) => `${a}__${d}`;
    const map = new Map<string, number>();
    for (const r of rows) {
      map.set(key(r.attacking_type, r.defender_type), r.multiplier);
    }

    const n = this.types.length;
    const matrix: number[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => 1));
    for (let i = 0; i < n; i++) {
      const atk = this.toApi(this.types[i]);
      for (let j = 0; j < n; j++) {
        const def = this.toApi(this.types[j]);
        const m = map.get(key(atk, def));
        matrix[i][j] = typeof m === 'number' && Number.isFinite(m) ? m : 1;
      }
    }

    return matrix;
  }

  private normalizeRow(row: any): TypeEffectivenessRow | null {
    if (!row || typeof row !== 'object') return null;

    const attacking =
      row.attacking_type ??
      row.attackingType ??
      row.atacante ??
      row.attacker ??
      row.attacking;

    const defender =
      row.defender_type ??
      row.defenderType ??
      row.defensor ??
      row.defender ??
      row.defending;

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

  private toApi(value: string): string {
    return (value ?? '').trim().toUpperCase();
  }
}
