import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Team as TeamService } from '../services/team/team';
import { Pokemon as PokemonService } from '../services/pokemon/pokemon';
import { MoveService, MoveModel } from '../services/move/move';
import { Team as TeamModel, TeamPokemonSlot } from '../models/team/team';
import { Pokemon } from '../models/pokemon/pokemon';

@Injectable()
export class TeamDetailFacade {
  private teamService = inject(TeamService);
  private pokemonService = inject(PokemonService);
  private moveService = inject(MoveService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // ── State ──────────────────────────────────────────────────────────────────
  readonly team = signal<TeamModel | null>(null);
  readonly allPokemons = signal<Pokemon[]>([]);
  readonly allMoves = signal<MoveModel[]>([]);
  readonly teamEntries = signal<TeamPokemonSlot[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isEditingName = signal(false);
  readonly newTeamName = signal('');
  readonly editingMoveSlot = signal<{ pokemonId: number; slotIndex: number } | null>(null);

  readonly teamPokemons = computed<Pokemon[]>(() => {
    const map = new Map(this.allPokemons().map((p) => [p.id, p]));
    return this.teamEntries()
      .map((entry) => map.get(entry.pokemonId)!)
      .filter(Boolean);
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  load(teamId: string): void {
    this.teamService.getById(teamId).subscribe({
      next: (team) => {
        if (!team) {
          alert('Team not found');
          this.router.navigate(['/team-builder']);
          return;
        }

        this.team.set(team);
        this._syncEntries(team);

        const pokemonIds = (team.pokemons ?? [])
          .map((e) => e.pokemonId)
          .filter((id) => Number.isFinite(id));

        if (pokemonIds.length > 0) {
          this.pokemonService.getByIds(pokemonIds).subscribe({
            next: (pokemons) => this.allPokemons.set(pokemons),
          });
        }

        this.moveService.get().subscribe({
          next: (moves) => {
            this.allMoves.set(moves);
            this.isLoading.set(false);
          },
        });
      },
    });
  }

  // ── Name editing ───────────────────────────────────────────────────────────
  startEditName(): void {
    this.isEditingName.set(true);
    this.newTeamName.set(this.team()?.name || '');
  }

  cancelEditName(): void {
    this.isEditingName.set(false);
    this.newTeamName.set('');
  }

  saveName(name: string): void {
    const team = this.team();
    if (!team || !name.trim()) {
      this.errorMessage.set('Team name cannot be empty');
      return;
    }

    this.teamService.put(team._id!, { ...team, name }).subscribe({
      next: (response) => {
        this.team.set(response);
        this.cancelEditName();
        this.errorMessage.set(null);
        this._notify('Team name updated successfully!');
      },
      error: (err) => this.errorMessage.set(err?.error?.message || 'Could not update the team name'),
    });
  }

  // ── Pokemon replacement ────────────────────────────────────────────────────
  replacePokemon(oldPokemon: Pokemon, newPokemon: Pokemon): void {
    const team = this.team();
    const entries = this.teamEntries();
    if (!team) return;

    const idx = entries.findIndex((e) => e.pokemonId === oldPokemon.id);
    if (idx === -1) return;

    const previousEntries = [...entries];
    const updatedEntries = [...entries];
    updatedEntries[idx] = { pokemonId: newPokemon.id, moves: [] };

    this.teamService.put(team._id!, { ...team, pokemons: updatedEntries }).subscribe({
      next: (response) => {
        this.team.set(response);
        this._syncEntries(response);

        const hadNewPokemon = this.allPokemons().some((p) => p.id === newPokemon.id);
        if (!hadNewPokemon) {
          this.allPokemons.update((list) =>
            list.filter((p) => p.id !== oldPokemon.id).concat(newPokemon),
          );
        }

        this.errorMessage.set(null);
        this._notify('Pokemon replaced successfully!');
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Could not update the team');
        this._syncEntries({ ...team, pokemons: previousEntries });
      },
    });
  }

  // ── Move operations ────────────────────────────────────────────────────────
  addMove(pokemonId: number, moveId: string): void {
    const team = this.team();
    if (!team?._id) return;

    this.teamService.addMove(team._id, pokemonId, moveId).subscribe({
      next: (response) => {
        this.team.set(response);
        this._syncEntries(response);
        this.errorMessage.set(null);
        this._notify('Move added successfully!');
      },
      error: (err) => this.errorMessage.set(err?.error?.message || 'Could not add move'),
    });
  }

  replaceMove(pokemonId: number, oldMoveId: string, newMoveId: string): void {
    const team = this.team();
    if (!team?._id) return;

    this.teamService.replaceMove(team._id, pokemonId, oldMoveId, newMoveId).subscribe({
      next: (response) => {
        this.team.set(response);
        this._syncEntries(response);
        this.errorMessage.set(null);
        this._notify('Move replaced successfully!');
      },
      error: (err) => this.errorMessage.set(err?.error?.message || 'Could not replace move'),
    });
  }

  deleteMove(): void {
    const slot = this.editingMoveSlot();
    const team = this.team();
    if (!slot || !team?._id) return;

    const moveId = this.getMoveIdForSlot(slot.pokemonId, slot.slotIndex);
    if (!moveId) return;

    this.teamService.removeMove(team._id, slot.pokemonId, moveId).subscribe({
      next: (response) => {
        this.team.set(response);
        this._syncEntries(response);
        this.editingMoveSlot.set(null);
        this.errorMessage.set(null);
        this._notify('Move deleted successfully!');
      },
      error: (err) => this.errorMessage.set(err?.error?.message || 'Could not delete move'),
    });
  }

  // ── Move slot helpers ──────────────────────────────────────────────────────
  getMoveIdForSlot(pokemonId: number, slotIndex: number): string | null {
    const entry = this.teamEntries().find((item) => item.pokemonId === pokemonId);
    return entry?.moves[slotIndex] || null;
  }

  getMoveNameForSlot(pokemonId: number, slotIndex: number, allMoves: MoveModel[]): string {
    const moveId = this.getMoveIdForSlot(pokemonId, slotIndex);
    if (!moveId) return '+';
    const name = allMoves.find((m) => m._id === moveId)?.name || 'Unknown move';
    return name.replace(/-/g, ' ');
  }

  getEditingMove(allMoves: MoveModel[]): MoveModel | undefined {
    const slot = this.editingMoveSlot();
    if (!slot) return undefined;
    const moveId = this.getMoveIdForSlot(slot.pokemonId, slot.slotIndex);
    return allMoves.find((m) => m._id === moveId);
  }

  getCurrentMovesForPokemon(pokemonId: number): string[] {
    return this.teamEntries().find((e) => e.pokemonId === pokemonId)?.moves ?? [];
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private _syncEntries(team: TeamModel): void {
    this.teamEntries.set((team.pokemons ?? []) as TeamPokemonSlot[]);
  }

  private _notify(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000, verticalPosition: 'top' });
  }
}