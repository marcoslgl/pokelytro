import { MoveModel } from '../services/move/move';
import { Pokemon as PokemonModel } from '../models/pokemon/pokemon';
import { TypeModel as TypeEffectivenessRow } from '../services/type/type';

const IV = 31;
const EV = 0;

// ── Stat formulas ──────────────────────────────────────────────────────────

/** PS = floor(((2*Base + IV + EV/4) * Nivel) / 100 + Nivel + 10) */
export function calcHp(base: number, level: number): number {
  const hp = (((2 * (Number(base) || 0) + IV + EV / 4) * level) / 100) + level + 10;
  return Math.max(1, Math.floor(hp));
}

/** Stat no-PS = floor(((2*Base + IV + EV/4) * Nivel) / 100 + 5) */
export function calcStat(base: number, level: number): number {
  const stat = (((2 * (Number(base) || 0) + IV + EV / 4) * level) / 100) + 5;
  return Math.max(1, Math.floor(stat));
}

// ── Type helpers ───────────────────────────────────────────────────────────

export function normalizeTypeName(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

function findMultiplier(rows: TypeEffectivenessRow[], atk: string, def: string): number {
  if (!atk || !def) return 1;
  const row = rows.find((r) => r.attacking_type === atk && r.defender_type === def);
  const m = Number(row?.multiplier);
  return Number.isFinite(m) ? m : 1;
}

export function getEffectiveness(
  attackingType: string,
  defender: PokemonModel,
  typeRows: TypeEffectivenessRow[],
): number {
  const atk = normalizeTypeName(attackingType);
  const d1 = normalizeTypeName(defender?.type1);
  const d2 = defender?.type2 ? normalizeTypeName(defender.type2) : '';
  return findMultiplier(typeRows, atk, d1) * (d2 ? findMultiplier(typeRows, atk, d2) : 1);
}

export function hasStab(attacker: PokemonModel, move: MoveModel): boolean {
  const moveType = normalizeTypeName(move?.type);
  return (
    moveType === normalizeTypeName(attacker?.type1) ||
    moveType === normalizeTypeName(attacker?.type2)
  );
}

// ── Damage formula ─────────────────────────────────────────────────────────

export type DamageResult = {
  damage: number;
  crit: boolean;
  roll: number;
  stab: number;
  effectiveness: number;
};

export function computeDamage(
  attacker: PokemonModel,
  defender: PokemonModel,
  move: MoveModel,
  level: number,
  typeRows: TypeEffectivenessRow[],
): DamageResult {
  const power = Math.max(0, Number(move.power) || 0);
  const dmgClass = String(move.damage_class ?? '').toLowerCase();
  const isPhysical = dmgClass === 'physical';
  const isSpecial = dmgClass === 'special';

  const attackBase = isSpecial ? attacker.special_attack : attacker.attack;
  const defenseBase = isSpecial ? defender.special_defense : defender.defense;

  const A = Math.max(1, calcStat(attackBase, level));
  const D = Math.max(1, calcStat(defenseBase, level));

  const crit = Math.random() < 0.0417;
  const roll = +(Math.random() * (1.0 - 0.85) + 0.85).toFixed(2);
  const stab = hasStab(attacker, move) ? 1.5 : 1;
  const effectiveness = getEffectiveness(move.type, defender, typeRows);

  const base = ((((2 * level) / 5) + 2) * power * (A / D)) / 50 + 2;
  const raw = base * (crit ? 1.5 : 1) * roll * stab * effectiveness;

  return { damage: Math.max(1, Math.floor(raw)), crit, roll, stab, effectiveness };
}

// ── Formatting ─────────────────────────────────────────────────────────────

export function formatMoveName(name: string | null | undefined): string {
  if (!name) return '';
  return name.replace(/-/g, ' ');
}

export function formatEffectiveness(mult: number): string {
  const m = Number(mult);
  if (!Number.isFinite(m)) return 'x1';
  const map: Record<number, string> = { 0: 'x0', 0.25: 'x¼', 0.5: 'x½', 1: 'x1', 2: 'x2', 4: 'x4' };
  return map[m] ?? `x${m}`;
}

// ── Move helpers ───────────────────────────────────────────────────────────

export function isDamagingMove(move: MoveModel): boolean {
  const power = Number(move?.power);
  if (!Number.isFinite(power) || power <= 0) return false;
  return String(move?.damage_class ?? '').toLowerCase() !== 'status';
}

export function pickRandomUnique<T>(list: T[], count: number): T[] {
  if (count <= 0) return [];
  const copy = [...list];
  const result: T[] = [];
  while (copy.length > 0 && result.length < count) {
    const idx = Math.floor(Math.random() * copy.length);
    const [picked] = copy.splice(idx, 1);
    if (picked !== undefined) result.push(picked);
  }
  return result;
}

export function pickRandomMove(moves: MoveModel[] | null | undefined): MoveModel | null {
  const list = (moves ?? []).filter(Boolean);
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)] ?? null;
}