import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../services/item/item';
import { Item } from '../../services/item/item';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginationControls } from '../../components/pagination-controls/pagination-controls';
import { FilterPanel } from '../../components/filter-panel/filter-panel';

type SortOption = 'name' | 'gen';

@Component({
  selector: 'app-item',
  imports: [CommonModule, FormsModule, PaginationControls, FilterPanel],
  templateUrl: './item.html',
  styleUrl: './item.css',
})
export class Items implements OnInit {
  private itemService = inject(ItemService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  items: Item[] = [];
  filteredItems: Item[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  selectedGen = '';
  sortBy: SortOption = 'name';
  generations: string[] = [];
  page = 1;
  pageSize = 32;
  totalPages = 1;

  @ViewChild(FilterPanel) filterPanel?: FilterPanel;

  ngOnInit() {
    this.restoreFromUrl();
    this.itemService.get().subscribe({
      next: (data: Item[]) => {
        this.items = data;
        this.extractGenerations();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading items';
        this.loading = false;
      },
    });
  }

  private extractGenerations(): void {
    const genSet = new Set<string>();
    for (const item of this.items) {
      if (item.gen) {
        genSet.add(item.gen);
      }
    }
    this.generations = Array.from(genSet).sort((a, b) => Number(a) - Number(b));
  }

  get pagedItems(): Item[] {
    return PaginationControls.getPagedItems(this.filteredItems, this.page, this.pageSize);
  }

  private restoreFromUrl(): void {
    const qp = this.route.snapshot.queryParamMap;
    const page = Number(qp.get('page'));
    const pageSize = Number(qp.get('pageSize'));
    const q = qp.get('q');
    const gen = qp.get('gen');
    const sort = qp.get('sort');

    if (Number.isFinite(page) && page >= 1) this.page = page;
    if (Number.isFinite(pageSize) && pageSize >= 1) this.pageSize = pageSize;
    if (typeof q === 'string') this.searchTerm = q;
    if (typeof gen === 'string') this.selectedGen = gen;
    if (typeof sort === 'string' && (sort === 'name' || sort === 'gen')) this.sortBy = sort;
  }

  private syncUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.page,
        pageSize: this.pageSize === 32 ? null : this.pageSize,
        q: this.searchTerm ? this.searchTerm : null,
        gen: this.selectedGen ? this.selectedGen : null,
        sort: this.sortBy !== 'name' ? this.sortBy : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private applyFilters(): void {
    const q = this.searchTerm.trim().toLowerCase();
    let filtered = this.items.filter((item) => {
      const matchesSearch = !q || item.name.toLowerCase().includes(q);
      const matchesGen = !this.selectedGen || item.gen === this.selectedGen;
      return matchesSearch && matchesGen;
    });

    // Aplicar ordenamiento
    if (this.sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'gen') {
      filtered.sort((a, b) => {
        const genA = Number(a.gen);
        const genB = Number(b.gen);
        return genA !== genB ? genA - genB : a.name.localeCompare(b.name);
      });
    }

    this.filteredItems = filtered;
    this.recomputeTotalPages();
  }

  private recomputeTotalPages(): void {
    const count = this.filteredItems.length;
    this.totalPages = PaginationControls.calculateTotalPages(count, this.pageSize);
    this.page = PaginationControls.normalizePage(this.page, this.totalPages);
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.page = 1;
    this.applyFilters();
    this.syncUrl();
  }

  onGenChange(gen: string): void {
    this.selectedGen = gen;
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
    this.selectedGen = '';
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
