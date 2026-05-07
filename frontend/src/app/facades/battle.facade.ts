import { Injectable, signal, computed } from '@angular/core';

import { MoveModel } from '../services/move/move';
import { TypeModel as TypeEffectivenessRow } from '../services/type/type';
import { Pokemon as PokemonModel } from '../models/pokemon/pokemon';
import {
  calcHp,
  calcStat,
  computeDamage,
  pickRandomMove,
} from '../utils/damage-calculator';

export type BattlePokemon = {
  pokemon: PokemonModel;
  level: number;
  hpMax: number;
  hpCurrent: number;
};

export type BattleActionLog = {
  actor: 'you' | 'enemy';
  moveName: string;
  damage: number;
  crit: boolean;
  roll: number;
  effectiveness: number;
  stab: number;
};

const LEVEL = 50;

@Injectable()
export class BattleFacade {
  // ── Battle state ───────────────────────────────────────────────────────────
  readonly you = signal<BattlePokemon | null>(null);
  readonly enemy = signal<BattlePokemon | null>(null);
  readonly yourMoves = signal<MoveModel[]>([]);
  readonly enemyMoves = signal<MoveModel[]>([]);
  readonly log = signal<BattleActionLog[]>([]);

  readonly isReady = computed(() => !!this.you() && !!this.enemy());
  readonly isFinished = computed(() => {
    const you = this.you();
    const enemy = this.enemy();
    if (!you || !enemy) return false;
    return you.hpCurrent <= 0 || enemy.hpCurrent <= 0;
  });

  // ── Setup ──────────────────────────────────────────────────────────────────
  setup(yourPokemon: PokemonModel, enemyPokemon: PokemonModel, yourMoves: MoveModel[], enemyMoves: MoveModel[]): void {
    this.you.set(this._makeBattlePokemon(yourPokemon));
    this.enemy.set(this._makeBattlePokemon(enemyPokemon));
    this.yourMoves.set(yourMoves);
    this.enemyMoves.set(enemyMoves);
    this.log.set([]);
  }

  reset(): void {
    const you = this.you();
    const enemy = this.enemy();
    if (!you || !enemy) return;

    this.you.set({ ...you, hpCurrent: you.hpMax });
    this.enemy.set({ ...enemy, hpCurrent: enemy.hpMax });
    this.log.set([]);
  }

  // ── Turn execution ─────────────────────────────────────────────────────────
  useMove(move: MoveModel, typeRows: TypeEffectivenessRow[]): void {
    if (!this.you() || !this.enemy() || this.isFinished()) return;

    const enemyMove = pickRandomMove(this.enemyMoves());
    if (!enemyMove) return;

    const youGoFirst = this._goesFirst();

    if (youGoFirst) {
      this._performAttack('you', move, typeRows);
      if ((this.enemy()?.hpCurrent ?? 0) <= 0) return;
      this._performAttack('enemy', enemyMove, typeRows);
    } else {
      this._performAttack('enemy', enemyMove, typeRows);
      if ((this.you()?.hpCurrent ?? 0) <= 0) return;
      this._performAttack('you', move, typeRows);
    }
  }

  // ── HP helper ──────────────────────────────────────────────────────────────
  hpPct(p: BattlePokemon | null): number {
    if (!p || p.hpMax <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((p.hpCurrent / p.hpMax) * 100)));
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private _goesFirst(): boolean {
    const yourSpeed = calcStat(this.you()!.pokemon.speed, LEVEL);
    const enemySpeed = calcStat(this.enemy()!.pokemon.speed, LEVEL);
    return yourSpeed > enemySpeed || (yourSpeed === enemySpeed && Math.random() < 0.5);
  }

  private _performAttack(actor: 'you' | 'enemy', move: MoveModel, typeRows: TypeEffectivenessRow[]): void {
    const attackerState = actor === 'you' ? this.you() : this.enemy();
    const defenderState = actor === 'you' ? this.enemy() : this.you();
    if (!attackerState || !defenderState) return;
    if (attackerState.hpCurrent <= 0 || defenderState.hpCurrent <= 0) return;

    const result = computeDamage(
      attackerState.pokemon,
      defenderState.pokemon,
      move,
      attackerState.level,
      typeRows,
    );

    const dmg = Math.min(defenderState.hpCurrent, result.damage);
    const updated: BattlePokemon = { ...defenderState, hpCurrent: defenderState.hpCurrent - dmg };

    if (actor === 'you') this.enemy.set(updated);
    else this.you.set(updated);

    this.log.update((prev) => [{
      actor,
      moveName: move.name,
      damage: dmg,
      crit: result.crit,
      roll: result.roll,
      effectiveness: result.effectiveness,
      stab: result.stab,
    }, ...prev]);
  }

  private _makeBattlePokemon(pokemon: PokemonModel): BattlePokemon {
    const hpMax = calcHp(pokemon.hp, LEVEL);
    return { pokemon, level: LEVEL, hpMax, hpCurrent: hpMax };
  }
}