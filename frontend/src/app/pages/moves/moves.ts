import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoveService, MoveModel } from '../../services/move/move';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginationControls } from '../../components/pagination-controls/pagination-controls';
import { FilterPanel } from '../../components/filter-panel/filter-panel';

type SortOption = 'name' | 'power' | 'accuracy' | 'pp';

@Component({
  selector: 'app-moves',
  imports: [CommonModule, FormsModule, PaginationControls, FilterPanel],
  templateUrl: './moves.html',
  styleUrl: './moves.css',
})
export class Moves implements OnInit {
  private moveService = inject(MoveService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  moves: MoveModel[] = [];
  filteredMoves: MoveModel[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  selectedType = '';
  selectedDamageClass = '';
  sortBy: SortOption = 'name';
  types: string[] = [];
  damageClasses: string[] = [];
  page = 1;
  pageSize = 32;
  totalPages = 1;

  @ViewChild(FilterPanel) filterPanel?: FilterPanel;

  ngOnInit() {
    this.restoreFromUrl();
    this.moveService.get().subscribe({
      next: (data: MoveModel[]) => {
        this.moves = data;
        this.extractFilterValues();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading moves';
        this.loading = false;
      },
    });
  }

  private extractFilterValues(): void {
    const typeSet = new Set<string>();
    const damageClassSet = new Set<string>();

    for (const move of this.moves) {
      if (move.type) {
        typeSet.add(move.type);
      }
      if (move.damage_class) {
        damageClassSet.add(move.damage_class);
      }
    }

    this.types = Array.from(typeSet).sort((a, b) => a.localeCompare(b));
    this.damageClasses = Array.from(damageClassSet).sort((a, b) => a.localeCompare(b));
  }

  get pagedMoves(): MoveModel[] {
    return PaginationControls.getPagedItems(this.filteredMoves, this.page, this.pageSize);
  }

  private restoreFromUrl(): void {
    const qp = this.route.snapshot.queryParamMap;
    const page = Number(qp.get('page'));
    const pageSize = Number(qp.get('pageSize'));
    const q = qp.get('q');
    const type = qp.get('type');
    const damageClass = qp.get('damageClass');
    const sort = qp.get('sort');

    if (Number.isFinite(page) && page >= 1) this.page = page;
    if (Number.isFinite(pageSize) && pageSize >= 1) this.pageSize = pageSize;
    if (typeof q === 'string') this.searchTerm = q;
    if (typeof type === 'string') this.selectedType = type;
    if (typeof damageClass === 'string') this.selectedDamageClass = damageClass;
    if (
      typeof sort === 'string' &&
      (sort === 'name' || sort === 'power' || sort === 'accuracy' || sort === 'pp')
    ) {
      this.sortBy = sort;
    }
  }

  private syncUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.page,
        pageSize: this.pageSize === 32 ? null : this.pageSize,
        q: this.searchTerm ? this.searchTerm : null,
        type: this.selectedType ? this.selectedType : null,
        damageClass: this.selectedDamageClass ? this.selectedDamageClass : null,
        sort: this.sortBy !== 'name' ? this.sortBy : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private applyFilters(): void {
    const q = this.searchTerm.trim().toLowerCase();
    let filtered = this.moves.filter((move) => {
      const matchesSearch = !q || move.name.toLowerCase().includes(q);
      const matchesType = !this.selectedType || move.type === this.selectedType;
      const matchesDamageClass =
        !this.selectedDamageClass || move.damage_class === this.selectedDamageClass;

      return matchesSearch && matchesType && matchesDamageClass;
    });

    if (this.sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'power') {
      filtered.sort((a, b) => b.power - a.power || a.name.localeCompare(b.name));
    } else if (this.sortBy === 'accuracy') {
      filtered.sort((a, b) => b.accuracy - a.accuracy || a.name.localeCompare(b.name));
    } else if (this.sortBy === 'pp') {
      filtered.sort((a, b) => b.pp - a.pp || a.name.localeCompare(b.name));
    }

    this.filteredMoves = filtered;
    this.recomputeTotalPages();
  }

  private recomputeTotalPages(): void {
    const count = this.filteredMoves.length;
    this.totalPages = PaginationControls.calculateTotalPages(count, this.pageSize);
    this.page = PaginationControls.normalizePage(this.page, this.totalPages);
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.page = 1;
    this.applyFilters();
    this.syncUrl();
  }

  onTypeChange(type: string): void {
    this.selectedType = type;
    this.page = 1;
    this.applyFilters();
    this.syncUrl();
  }

  onDamageClassChange(damageClass: string): void {
    this.selectedDamageClass = damageClass;
    this.page = 1;
    this.applyFilters();
    this.syncUrl();
  }

  onSortChange(sort: SortOption): void {
    this.sortBy = sort;
    this.page = 1;
    this.applyFilters();
    this.syncUrl();
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedDamageClass = '';
    this.sortBy = 'name';
    this.searchTerm = '';
    this.page = 1;
    this.applyFilters();
    this.syncUrl();
    this.filterPanel?.closeFilters();
  }

  nextPage(): void {
    const nextPage = PaginationControls.getNextPage(this.page, this.totalPages);
    if (nextPage !== undefined) {
      this.page = nextPage;
      this.syncUrl();
    }
  }

  prevPage(): void {
    const prevPage = PaginationControls.getPrevPage(this.page);
    if (prevPage !== undefined) {
      this.page = prevPage;
      this.syncUrl();
    }
  }

  goToPage(target: number): void {
    if (!Number.isFinite(target)) return;
    this.page = PaginationControls.normalizePage(target, this.totalPages);
    this.syncUrl();
  }
}
