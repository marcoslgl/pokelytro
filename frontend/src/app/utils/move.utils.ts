import { MoveModel } from '../services/move/move';
import { SortOption } from '../models/poke_moves/move-picker-state';
import { PaginationControls } from '../components/pagination-controls/pagination-controls';

export function formatMoveName(name: string | null | undefined): string {
  if (!name) return '';
  return name.replace(/-/g, ' ');
}

export function extractMoveTypes(moves: MoveModel[]): string[] {
  return Array.from(new Set(moves.filter((m) => m.type).map((m) => m.type!))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function extractMoveDamageClasses(moves: MoveModel[]): string[] {
  return Array.from(
    new Set(moves.filter((m) => m.damage_class).map((m) => m.damage_class!)),
  ).sort((a, b) => a.localeCompare(b));
}

export function filterAndSortMoves(
  moves: MoveModel[],
  searchTerm: string,
  selectedType: string,
  selectedDamageClass: string,
  sortBy: SortOption,
): MoveModel[] {
  const q = searchTerm.trim().toLowerCase();

  const filtered = moves.filter((move) => {
    const matchesSearch = !q || move.name.toLowerCase().includes(q);
    const matchesType = !selectedType || move.type === selectedType;
    const matchesDamageClass = !selectedDamageClass || move.damage_class === selectedDamageClass;
    return matchesSearch && matchesType && matchesDamageClass;
  });

  const sorted = [...filtered];
  if (sortBy === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'power') {
    sorted.sort((a, b) => (b.power || 0) - (a.power || 0) || a.name.localeCompare(b.name));
  } else if (sortBy === 'accuracy') {
    sorted.sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0) || a.name.localeCompare(b.name));
  } else if (sortBy === 'pp') {
    sorted.sort((a, b) => (b.pp || 0) - (a.pp || 0) || a.name.localeCompare(b.name));
  }

  return sorted;
}

export function getCompatibleMoves(
  allMoves: MoveModel[],
  pokemonId: number,
  usedMoveIds: Set<string>,
): MoveModel[] {
  return allMoves.filter(
    (move) => move.learned_by_ids?.includes(pokemonId) && !usedMoveIds.has(move._id),
  );
}

export function paginateMoves(
  moves: MoveModel[],
  page: number,
  pageSize: number,
): { paged: MoveModel[]; totalPages: number; normalizedPage: number } {
  const totalPages = PaginationControls.calculateTotalPages(moves.length, pageSize);
  const normalizedPage = PaginationControls.normalizePage(page, totalPages);
  const paged = PaginationControls.getPagedItems(moves, normalizedPage, pageSize);
  return { paged, totalPages, normalizedPage };
}