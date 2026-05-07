import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { Pokemon } from '../../models/pokemon/pokemon';
import { PaginationControls } from '../../components/pagination-controls/pagination-controls';
import { FilterPanel } from '../../components/filter-panel/filter-panel';
import { PokemonPickerDialog } from '../../components/pokemon-picker-dialog/pokemon-picker-dialog';

import { TeamDetailFacade } from '../../facades/team-detail.facade';
import { MovePickerService } from '../../services/move-picker/move-picker.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatDialogModule, MatButtonModule, PaginationControls, FilterPanel],
  templateUrl: './team-detail.html',
  styleUrls: ['./team-detail.css'],
  providers: [TeamDetailFacade, MovePickerService],
})
export class TeamDetail implements OnInit {
  protected facade = inject(TeamDetailFacade);
  protected movePicker = inject(MovePickerService);

  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  router = inject(Router);
  moveSlots = [0, 1, 2, 3];

  @ViewChild(FilterPanel) moveFilterPanel?: FilterPanel;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const teamId = params['teamId'] as string;

      if (!teamId) {
        alert('No teamId provided');
        this.router.navigate(['/team-builder']);
        return;
      }

      this.facade.load(teamId);
    });
  }

  // ── Pokemon ────────────────────────────────────────────────────────────────
  onUpdatePokemon(pokemon: Pokemon): void {
    const dialogRef = this.dialog.open(PokemonPickerDialog, {
      data: {
        title: 'Replace Pokemon',
        subtitle: `Replace "${pokemon.name}" with a new Pokemon:`,
        actionLabel: 'Replace',
      },
      width: '980px',
      maxWidth: '96vw',
      panelClass: 'team-detail-dialog-panel',
    });

    dialogRef.afterClosed().subscribe((result: Pokemon | null) => {
      if (result) this.facade.replacePokemon(pokemon, result);
    });
  }

  // ── Name editing ───────────────────────────────────────────────────────────
  onEditName(): void { this.facade.startEditName(); }
  onSaveName(): void { this.facade.saveName(this.facade.newTeamName()); }
  cancelEditName(): void { this.facade.cancelEditName(); }

  // ── Move picker ────────────────────────────────────────────────────────────
  onOpenMovePicker(pokemon: Pokemon): void {
    const currentMoves = this.facade.getCurrentMovesForPokemon(pokemon.id);

    if (!this.movePicker.state().replacingMoveId && currentMoves.length >= 4) {
      this._notify('This Pokemon already has 4 moves');
      return;
    }

    const opened = this.movePicker.open(pokemon, this.facade.allMoves(), currentMoves);
    if (!opened) this._notify('No available moves for this Pokemon');

    this.movePicker.initFilterValues(this.facade.allMoves());
  }

  onAddMoveToPokemon(moveId: string): void {
    const { activePokemonId, replacingMoveId } = this.movePicker.state();
    if (!activePokemonId || !moveId) return;

    if (replacingMoveId) {
      this.facade.replaceMove(activePokemonId, replacingMoveId, moveId);
    } else {
      this.facade.addMove(activePokemonId, moveId);
    }

    this.movePicker.close();
  }

  closeMovePicker(): void { this.movePicker.close(); }

  // ── Move slot editor ───────────────────────────────────────────────────────
  onOpenMoveEditor(pokemon: Pokemon, slotIndex: number): void {
    const moveId = this.facade.getMoveIdForSlot(pokemon.id, slotIndex);
    if (!moveId) return;
    this.facade.editingMoveSlot.set({ pokemonId: pokemon.id, slotIndex });
  }

  onDeleteMove(): void { this.facade.deleteMove(); }

  onReplaceMove(): void {
    const slot = this.facade.editingMoveSlot();
    if (!slot) return;

    const moveId = this.facade.getMoveIdForSlot(slot.pokemonId, slot.slotIndex);
    if (!moveId) return;

    const pokemon = this.facade.teamPokemons().find((p) => p.id === slot.pokemonId)!;
    const currentMoves = this.facade.getCurrentMovesForPokemon(slot.pokemonId);

    this.movePicker.open(pokemon, this.facade.allMoves(), currentMoves, moveId);
    this.movePicker.initFilterValues(this.facade.allMoves());
    this.facade.editingMoveSlot.set(null);
  }

  // ── Template helpers ───────────────────────────────────────────────────────
  getMoveNameForSlot(pokemonId: number, slotIndex: number): string {
    return this.facade.getMoveNameForSlot(pokemonId, slotIndex, this.facade.allMoves());
  }

  getActiveMovePickerPokemonName(): string {
    const id = this.movePicker.state().activePokemonId;
    if (!id) return '';
    return this.facade.teamPokemons().find((p) => p.id === id)?.name || `#${id}`;
  }

  getEditingMove() {
    return this.facade.getEditingMove(this.facade.allMoves());
  }

  getEditingPokemonName(): string {
    const slot = this.facade.editingMoveSlot();
    if (!slot) return '';
    return this.facade.teamPokemons().find((p) => p.id === slot.pokemonId)?.name || `#${slot.pokemonId}`;
  }

  // ── Move picker filters (delegated) ───────────────────────────────────────
  onMoveSearch(term: string): void { this.movePicker.setSearch(term); }
  onMoveTypeChange(type: string): void { this.movePicker.setType(type); }
  onMoveDamageClassChange(dc: string): void { this.movePicker.setDamageClass(dc); }
  onMoveSortChange(sort: any): void { this.movePicker.setSort(sort); }

  clearMoveFilters(): void {
    this.movePicker.clearFilters();
    this.moveFilterPanel?.closeFilters();
  }

  nextMovePage(): void { this.movePicker.nextPage(); }
  prevMovePage(): void { this.movePicker.prevPage(); }
  goToMovePage(target: number): void { this.movePicker.goToPage(target); }

  private _notify(message: string): void {
    this.facade['_notify']?.(message);
  }

  // ── Getters de compatibilidad con el HTML existente ───────────────────────

  get team() { return this.facade.team(); }
  get teamPokemons() { return this.facade.teamPokemons(); }
  get isLoading() { return this.facade.isLoading(); }
  get errorMessage() { return this.facade.errorMessage(); }
  get isEditingName() { return this.facade.isEditingName(); }

  get newTeamName() { return this.facade.newTeamName(); }
  set newTeamName(value: string) { this.facade.newTeamName.set(value); }

  get editingMoveSlot() { return this.facade.editingMoveSlot(); }
  set editingMoveSlot(value: { pokemonId: number; slotIndex: number } | null) {
    this.facade.editingMoveSlot.set(value);
  }

  get activeMovePickerPokemonId() { return this.movePicker.state().activePokemonId; }
  get movesSearchTerm() { return this.movePicker.state().searchTerm; }
  set movesSearchTerm(value: string) { this.movePicker.setSearch(value); }

  get selectedMoveType() { return this.movePicker.state().selectedType; }
  set selectedMoveType(value: string) { this.movePicker.setType(value); }

  get selectedMoveDamageClass() { return this.movePicker.state().selectedDamageClass; }
  set selectedMoveDamageClass(value: string) { this.movePicker.setDamageClass(value); }

  get moveSortBy() { return this.movePicker.state().sortBy; }
  set moveSortBy(value: any) { this.movePicker.setSort(value); }

  get movePage() { return this.movePicker.state().page; }
  get moveTotalPages() { return this.movePicker.state().totalPages; }
  get moveTypes() { return this.movePicker.moveTypes(); }
  get moveDamageClasses() { return this.movePicker.moveDamageClasses(); }
  get availableMovesForSelectedPokemon() { return this.movePicker.state().pagedMoves; }

  getMoveIdForSlot(pokemonId: number, slotIndex: number): string | null {
    return this.facade.getMoveIdForSlot(pokemonId, slotIndex);
  }

  formatMoveName(name: string | null | undefined): string {
    if (!name) return '';
    return name.replace(/-/g, ' ');
  }
}