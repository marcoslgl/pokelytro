import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, switchMap } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { Team as TeamService } from '../services/team/team';
import { Pokemon as PokemonService } from '../services/pokemon/pokemon';
import { MoveService, MoveModel } from '../services/move/move';
import { Type as TypeService, TypeModel as TypeEffectivenessRow } from '../services/type/type';
import { Pokemon as PokemonModel } from '../models/pokemon/pokemon';
import { Team as TeamModel, TeamPokemonSlot } from '../models/team/team';
import { normalizeTypeName, isDamagingMove, pickRandomUnique } from '../utils/damage-calculator';

@Injectable()
export class CombatDataFacade {
  private authService = inject(AuthService);
  private teamService = inject(TeamService);
  private pokemonService = inject(PokemonService);
  private moveService = inject(MoveService);
  private typeService = inject(TypeService);

  // ── State ──────────────────────────────────────────────────────────────────
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly teams = signal<TeamModel[]>([]);
  readonly selectedTeamId = signal<string>('');
  readonly teamEntries = signal<TeamPokemonSlot[]>([]);
  readonly teamPokemons = signal<PokemonModel[]>([]);
  readonly selectedPokemonId = signal<number | null>(null);
  readonly selectedEnemyId = signal<number>(1);

  readonly allMoves = signal<MoveModel[]>([]);
  readonly typeRows = signal<TypeEffectivenessRow[]>([]);

  // ── Init ───────────────────────────────────────────────────────────────────
  load(onReady: (yourId: number | null, enemyId: number) => void): void {
    this.loading.set(true);
    this.error.set(null);

    const currentUser = this.authService.currentUser();
    if (!currentUser?._id) {
      this.loading.set(false);
      this.error.set('Necesitas iniciar sesión para combatir.');
      return;
    }

    // forkJoin lanza moves y types en paralelo, cuando ambos terminan
    // switchMap encadena la carga de equipos secuencialmente
    forkJoin({
      moves: this.moveService.get(),
      rows: this.typeService.get(),
    }).pipe(
      switchMap(({ moves, rows }) => {
        this.allMoves.set(moves ?? []);
        this.typeRows.set(
          (rows ?? [])
            .map((r) => this._normalizeTypeRow(r))
            .filter((r): r is TypeEffectivenessRow => r !== null)
        );
        return this.teamService.getByUserId(currentUser._id);
      }),
    ).subscribe({
      next: (teams) => {
        const teamList = teams ?? [];
        this.teams.set(teamList);

        const firstTeamId = teamList[0]?._id ?? '';
        if (!firstTeamId) {
          this.loading.set(false);
          this.error.set('No tienes equipos guardados. Crea uno en Team Builder.');
          return;
        }

        this.selectTeam(firstTeamId, onReady);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error al cargar los datos iniciales.');
      },
    });
  }

  // ── Team / Pokemon selection ───────────────────────────────────────────────
  selectTeam(teamId: string, onReady: (yourId: number | null, enemyId: number) => void): void {
    if (!teamId) return;
    this.selectedTeamId.set(teamId);

    const team = this.teams().find((t) => t?._id === teamId);
    const entries = (team?.pokemons ?? []) as TeamPokemonSlot[];
    this.teamEntries.set(entries);

    this.pokemonService.getByIds(entries.map((e) => e.pokemonId)).subscribe({
      next: (pokemons) => {
        this.teamPokemons.set(pokemons ?? []);
        const defaultId = pokemons?.[0]?.id ?? null;
        this.selectedPokemonId.set(defaultId);
        onReady(defaultId, this.selectedEnemyId());
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los Pokémon del equipo.');
      },
    });
  }

  selectPokemon(pokemonId: number): void {
    this.selectedPokemonId.set(pokemonId);
  }

  setEnemyId(id: number): void {
    this.selectedEnemyId.set(id);
  }

  // ── Move resolution ────────────────────────────────────────────────────────
  resolveMovesForTeamPokemon(pokemonId: number): MoveModel[] {
    const entry = this.teamEntries().find((e) => e.pokemonId === pokemonId);
    const savedIds = new Set((entry?.moves ?? []).map(String));
    const allMoves = this.allMoves();

    const savedMoves = allMoves.filter((m) => savedIds.has(String(m._id)) && isDamagingMove(m));
    const filled = [...savedMoves];
    if (filled.length >= 4) return filled.slice(0, 4);

    const candidates = allMoves.filter(
      (m) => isDamagingMove(m) && (m.learned_by_ids ?? []).includes(pokemonId) && !savedIds.has(String(m._id)),
    );
    filled.push(...pickRandomUnique(candidates, 4 - filled.length));
    return filled.slice(0, 4);
  }

  randomDamagingMoves(pokemonId: number, count: number): MoveModel[] {
    const candidates = this.allMoves().filter(
      (m) => isDamagingMove(m) && (m.learned_by_ids ?? []).includes(pokemonId),
    );
    const result = pickRandomUnique(candidates, count);
    if (result.length > 0) return result;
    return pickRandomUnique(this.allMoves().filter(isDamagingMove), count);
  }

  loadEnemyPokemon(enemyId: number, onLoaded: (p: PokemonModel) => void, onError: () => void): void {
    this.pokemonService.getById(enemyId).subscribe({
      next: (p) => { if (p) onLoaded(p); else onError(); },
      error: onError,
    });
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private _normalizeTypeRow(row: any): TypeEffectivenessRow | null {
    if (!row || typeof row !== 'object') return null;
    const m = Number(row.multiplicador);
    if (typeof row.atacante !== 'string' || typeof row.defensor !== 'string' || !Number.isFinite(m)) return null;
    return {
      _id: row._id,
      attacking_type: normalizeTypeName(row.atacante),
      defender_type: normalizeTypeName(row.defensor),
      multiplier: m,
    };
  }
}