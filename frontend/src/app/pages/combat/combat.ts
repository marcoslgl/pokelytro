import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { MoveModel } from '../../services/move/move';
import { Pokemon as PokemonModel } from '../../models/pokemon/pokemon';
import { PokemonPickerDialog } from '../../components/pokemon-picker-dialog/pokemon-picker-dialog';

import { CombatDataFacade } from '../../facades/combat-data.facade';
import { BattleFacade, BattlePokemon, BattleActionLog } from '../../facades/battle.facade';
import { formatMoveName, formatEffectiveness } from '../../utils/damage-calculator';

@Component({
  selector: 'app-combat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './combat.html',
  styleUrls: ['./combat.css'],
  providers: [CombatDataFacade, BattleFacade],
})
export class Combat implements OnInit {
  protected data = inject(CombatDataFacade);
  protected battle = inject(BattleFacade);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.data.load((yourId, enemyId) => this._setupBattle(yourId, enemyId));
  }

  // ── Team / Pokemon selection ───────────────────────────────────────────────
  onSelectTeam(teamId: string): void {
    this.data.selectTeam(teamId, (yourId, enemyId) => this._setupBattle(yourId, enemyId));
  }

  onSelectPokemon(pokemonId: number | null): void {
    if (!pokemonId || !Number.isFinite(pokemonId)) return;
    this.data.selectPokemon(pokemonId);
    this._setupBattle(pokemonId, this.data.selectedEnemyId());
  }

  openEnemyPicker(): void {
    const dialogRef = this.dialog.open(PokemonPickerDialog, {
      data: {
        title: 'Elegir enemigo',
        subtitle: 'Selecciona el Pokémon enemigo para el combate:',
        actionLabel: 'Elegir',
      },
      width: '980px',
      maxWidth: '96vw',
    });

    dialogRef.afterClosed().subscribe((picked: PokemonModel | null) => {
      if (!picked?.id) return;
      this.data.setEnemyId(picked.id);
      this._setupBattle(this.data.selectedPokemonId(), picked.id);
    });
  }

  // ── Battle actions ─────────────────────────────────────────────────────────
  useMove(move: MoveModel): void {
    this.battle.useMove(move, this.data.typeRows());
  }

  resetBattle(): void {
    this._setupBattle(this.data.selectedPokemonId(), this.data.selectedEnemyId());
  }

  // ── Formatting (delegated to pure utils) ──────────────────────────────────
  formatMoveName(name: string | null | undefined): string {
    return formatMoveName(name);
  }

  formatEffectiveness(mult: number): string {
    return formatEffectiveness(mult);
  }

  hpPct(p: BattlePokemon | null): number {
    return this.battle.hpPct(p);
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private _setupBattle(yourPokemonId: number | null, enemyPokemonId: number | null): void {
    this.data.loading.set(true);
    this.data.error.set(null);

    const yourPokemon = this.data.teamPokemons().find((p) => p.id === yourPokemonId);
    if (!yourPokemon) {
      this.data.loading.set(false);
      this.data.error.set('Selecciona un Pokémon válido.');
      return;
    }

    const enemyId = Number(enemyPokemonId);
    if (!Number.isFinite(enemyId) || enemyId <= 0) {
      this.data.loading.set(false);
      this.data.error.set('Selecciona un enemigo válido.');
      return;
    }

    this.data.loadEnemyPokemon(
      enemyId,
      (enemyPokemon) => {
        const yourMoves = this.data.resolveMovesForTeamPokemon(yourPokemon.id);
        const enemyMoves = this.data.randomDamagingMoves(enemyPokemon.id, 4);
        this.battle.setup(yourPokemon, enemyPokemon, yourMoves, enemyMoves);
        this.data.loading.set(false);
      },
      () => {
        this.data.loading.set(false);
        this.data.error.set('No se pudo cargar el Pokémon enemigo.');
      },
    );
  }

  get battleResult(): 'won' | 'lost' | 'draw' {
    const you = this.battle.you();
    const enemy = this.battle.enemy();
    if (!you || !enemy) return 'draw';
    if (enemy.hpCurrent <= 0 && you.hpCurrent > 0) return 'won';
    if (you.hpCurrent <= 0 && enemy.hpCurrent > 0) return 'lost';
    return 'draw';
  }

  // ── Alias de signals ──────────────
  readonly loading           = this.data.loading;
  readonly error             = this.data.error;
  readonly teams             = this.data.teams;
  readonly selectedTeamId    = this.data.selectedTeamId;
  readonly teamPokemons      = this.data.teamPokemons;
  readonly selectedPokemonId = this.data.selectedPokemonId;
  readonly allMoves          = this.data.allMoves;

  readonly you               = this.battle.you;
  readonly enemy             = this.battle.enemy;
  readonly yourMoves         = this.battle.yourMoves;
  readonly enemyMoves        = this.battle.enemyMoves;
  readonly log               = this.battle.log;
  readonly isReady           = this.battle.isReady;
  readonly isFinished        = this.battle.isFinished;
}