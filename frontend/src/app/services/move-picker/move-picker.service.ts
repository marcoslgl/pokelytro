import { Injectable, signal, computed } from '@angular/core';
import { MoveModel } from '../../services/move/move';
import { Pokemon } from '../../models/pokemon/pokemon';
import { INITIAL_MOVE_PICKER_STATE, MovePickerState, SortOption } from '../../models/poke_moves/move-picker-state';
import {
  extractMoveDamageClasses,
  extractMoveTypes,
  filterAndSortMoves,
  formatMoveName,
  getCompatibleMoves,
  paginateMoves,
} from '../../utils/move.utils';
import { PaginationControls } from '../../components/pagination-controls/pagination-controls';

@Injectable()
export class MovePickerService {
  private _state = signal<MovePickerState>({ ...INITIAL_MOVE_PICKER_STATE });

  readonly state = this._state.asReadonly();

  readonly isOpen = computed(() => this._state().activePokemonId !== null);
  readonly moveTypes = signal<string[]>([]);
  readonly moveDamageClasses = signal<string[]>([]);

  initFilterValues(allMoves: MoveModel[]): void {
    this.moveTypes.set(extractMoveTypes(allMoves));
    this.moveDamageClasses.set(extractMoveDamageClasses(allMoves));
  }

  open(pokemon: Pokemon, allMoves: MoveModel[], currentMoveIds: string[], replacingMoveId: string | null = null): boolean {
    const usedMoveIds = new Set(currentMoveIds.filter((id) => id !== replacingMoveId));
    const compatibleMoves = getCompatibleMoves(allMoves, pokemon.id, usedMoveIds);

    if (compatibleMoves.length === 0) return false;

    const baseState: MovePickerState = {
      ...INITIAL_MOVE_PICKER_STATE,
      activePokemonId: pokemon.id,
      replacingMoveId,
      compatibleMoves,
    };

    this._state.set(this._computeFilteredState(baseState));
    return true;
  }

  close(): void {
    this._state.set({ ...INITIAL_MOVE_PICKER_STATE });
  }

  setSearch(term: string): void {
    this._updateAndRefilter({ searchTerm: term, page: 1 });
  }

  setType(type: string): void {
    this._updateAndRefilter({ selectedType: type, page: 1 });
  }

  setDamageClass(damageClass: string): void {
    this._updateAndRefilter({ selectedDamageClass: damageClass, page: 1 });
  }

  setSort(sortBy: SortOption): void {
    this._updateAndRefilter({ sortBy, page: 1 });
  }

  clearFilters(): void {
    this._updateAndRefilter({
      searchTerm: '',
      selectedType: '',
      selectedDamageClass: '',
      sortBy: 'name',
      page: 1,
    });
  }

  nextPage(): void {
    const { page, totalPages } = this._state();
    const next = PaginationControls.getNextPage(page, totalPages);
    if (next !== undefined) this._goToPage(next);
  }

  prevPage(): void {
    const prev = PaginationControls.getPrevPage(this._state().page);
    if (prev !== undefined) this._goToPage(prev);
  }

  goToPage(target: number): void {
    if (!Number.isFinite(target)) return;
    this._goToPage(target);
  }

  private _goToPage(page: number): void {
    const current = this._state();
    const { paged, normalizedPage } = paginateMoves(current.filteredMoves, page, current.pageSize);
    this._state.set({ ...current, page: normalizedPage, pagedMoves: paged });
  }

  private _updateAndRefilter(patch: Partial<MovePickerState>): void {
    const merged = { ...this._state(), ...patch };
    this._state.set(this._computeFilteredState(merged));
  }

  private _computeFilteredState(state: MovePickerState): MovePickerState {
    const filteredMoves = filterAndSortMoves(
      state.compatibleMoves,
      state.searchTerm,
      state.selectedType,
      state.selectedDamageClass,
      state.sortBy,
    );

    const { paged, totalPages, normalizedPage } = paginateMoves(
      filteredMoves,
      state.page,
      state.pageSize,
    );

    return { ...state, filteredMoves, pagedMoves: paged, totalPages, page: normalizedPage };
  }
}