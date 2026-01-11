import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../models/pokemon/pokemon';
import { tap } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PokemonListStore } from '../../services/pokemon-list-store/pokemon-list-store';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pokemon-list.html',
  styleUrls: ['./pokemon-list.css'],
})
export class PokemonList implements OnInit {
  private pokemonListStore = inject(PokemonListStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  //  Pokemon list

  pokemons!: Pokemon[];
  searchTerm = '';
  selectedType = '';
  selectedGen = '';
  types: string[] = [];
  generations: number[] = [];
  showFilters = false;
  page = 1;
  pageSize = 32;
  totalPages = 1;
  @Input() teamBuilding = false;
  @Input() teamDetails = false;
  @Input() currentTeam: Pokemon[] = [];
  @Output() addPokemon = new EventEmitter<Pokemon>();

  @Input() replacePokemon= false;
  @Output() onReplacePokemon = new EventEmitter<Pokemon>();


  @ViewChild('filtersPanel') filtersPanel?: ElementRef<HTMLElement>;
  @ViewChild('filterButton') filterButton?: ElementRef<HTMLElement>;

  private shouldSyncToUrl(): boolean {
    // Only sync when used as the main Pokédex page.
    return !this.teamBuilding && !this.teamDetails;
  }

  private restoreFromUrl(): void {
    const qp = this.route.snapshot.queryParamMap;

    const page = Number(qp.get('page'));
    const pageSize = Number(qp.get('pageSize'));
    const q = qp.get('q');
    const type = qp.get('type');
    const gen = qp.get('gen');

    if (Number.isFinite(page) && page >= 1) this.page = page;
    if (Number.isFinite(pageSize) && pageSize >= 1) this.pageSize = pageSize;
    if (typeof q === 'string') this.searchTerm = q;
    if (typeof type === 'string') this.selectedType = type;
    if (typeof gen === 'string') this.selectedGen = gen;
  }

  private syncUrl(): void {
    if (!this.shouldSyncToUrl()) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.page,
        pageSize: this.pageSize === 32 ? null : this.pageSize,
        q: this.searchTerm ? this.searchTerm : null,
        type: this.selectedType ? this.selectedType : null,
        gen: this.selectedGen ? this.selectedGen : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  get filteredPokemons(): Pokemon[] {
    if (!this.pokemons) return [];
    const q = this.searchTerm.trim().toLowerCase();
    const list = this.pokemons.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q);
      const matchesType =
        !this.selectedType || p.type1 === this.selectedType || p.type2 === this.selectedType;
      const genNum = this.selectedGen ? Number(this.selectedGen) : undefined;
      const matchesGen = !genNum || p.generation === genNum;
      return matchesSearch && matchesType && matchesGen;
    });
    return list;
  }

  get pagedPokemons(): Pokemon[] {
    const list = this.filteredPokemons;
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    if (this.shouldSyncToUrl()) {
      this.restoreFromUrl();
    }

    this.pokemonListStore
      .getList()
      .pipe(
        tap((data: any) => {
          this.pokemons = data;
          // Build filter options
          const typeSet = new Set<string>();
          for (const p of data as Pokemon[]) {
            if (p.type1) typeSet.add(p.type1);
            if (p.type2) typeSet.add(p.type2);
          }
          this.types = Array.from(typeSet).sort();
          this.generations = Array.from(
            new Set<number>(data.map((p: Pokemon) => p.generation))
          ).sort((a, b) => a - b);
          this.recomputeTotalPages();
          if (this.page > this.totalPages) this.page = this.totalPages;
          if (this.page < 1) this.page = 1;
          this.syncUrl();
          console.log('Number of pokemons:', data.length);
        })
      )
      .subscribe();
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.syncUrl();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.syncUrl();
    }
  }

  setPageSize(size: number | string): void {
    this.pageSize = Number(size);
    this.recomputeTotalPages();
    this.page = 1;
    this.syncUrl();
  }

  goToPage(target: number | string): void {
    const desired = Number(target);
    if (!Number.isFinite(desired)) return;
    if (desired < 1) {
      this.page = 1;
    } else if (desired > this.totalPages) {
      this.page = this.totalPages;
    } else {
      this.page = desired;
    }
    this.syncUrl();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.page = 1;
    this.recomputeTotalPages();
    this.syncUrl();
  }

  onTypeChange(type: string): void {
    this.selectedType = type;
    this.page = 1;
    this.recomputeTotalPages();
    this.syncUrl();
  }

  onGenChange(gen: string): void {
    this.selectedGen = gen;
    this.page = 1;
    this.recomputeTotalPages();
    this.syncUrl();
  }

  onAddPokemon(pokemon: Pokemon): void {
    this.addPokemon.emit(pokemon);
  }

  onReplacePokemonClick(pokemon: Pokemon): void {
    this.onReplacePokemon.emit(pokemon);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showFilters) return;
    const target = event.target as Node | null;
    const panel = this.filtersPanel?.nativeElement;
    const button = this.filterButton?.nativeElement;
    if (target && (panel?.contains(target) || button?.contains(target))) {
      return;
    }
    this.showFilters = false;
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedGen = '';
    this.page = 1;
    this.recomputeTotalPages();
    this.syncUrl();
  }

  private recomputeTotalPages(): void {
    const count = this.filteredPokemons.length;
    this.totalPages = Math.max(1, Math.ceil(count / this.pageSize));
  }
}
