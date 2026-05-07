import { MoveModel } from '../../services/move/move';

export type SortOption = 'name' | 'power' | 'accuracy' | 'pp';

export interface MovePickerState {
  activePokemonId: number | null;
  replacingMoveId: string | null;
  searchTerm: string;
  selectedType: string;
  selectedDamageClass: string;
  sortBy: SortOption;
  page: number;
  pageSize: number;
  totalPages: number;
  compatibleMoves: MoveModel[];
  filteredMoves: MoveModel[];
  pagedMoves: MoveModel[];
}

export const INITIAL_MOVE_PICKER_STATE: MovePickerState = {
  activePokemonId: null,
  replacingMoveId: null,
  searchTerm: '',
  selectedType: '',
  selectedDamageClass: '',
  sortBy: 'name',
  page: 1,
  pageSize: 32,
  totalPages: 1,
  compatibleMoves: [],
  filteredMoves: [],
  pagedMoves: [],
};