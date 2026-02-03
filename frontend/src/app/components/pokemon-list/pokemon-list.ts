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
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../models/pokemon/pokemon';
import { tap } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PokemonListStore } from '../../services/pokemon-list-store/pokemon-list-store';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

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
  private authService = inject(AuthService);
  //  Pokemon list

  pokemons!: Pokemon[];
  searchTerm = '';
  selectedType = '';
  selectedGen = '';
  onlyFavorites = false;
  types: string[] = [];
  generations: number[] = [];
  showFilters = false;
  page = 1;
  pageSize = 32;
  totalPages = 1;

  private favorites = signal<Set<number>>(new Set<number>());
  public favoritesLoading = signal<boolean>(false);
  @Input() teamBuilding = false;
  @Input() teamDetails = false;
  @Input() currentTeam: Pokemon[] = [];
  @Output() addPokemon = new EventEmitter<Pokemon>();

  @Input() replacePokemon = false;
  @Output() onReplacePokemon = new EventEmitter<Pokemon>();

  @ViewChild('filtersPanel') filtersPanel?: ElementRef<HTMLElement>;
  @ViewChild('filterButton') filterButton?: ElementRef<HTMLElement>;

  private SyncToUrl(): boolean {
    return true;
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
    if (!this.SyncToUrl()) return;

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
      const matchesFavorites = !this.onlyFavorites || this.isFavorite(p);
      return matchesSearch && matchesType && matchesGen && matchesFavorites;
    });
    return list;
  }

  get pagedPokemons(): Pokemon[] {
    const list = this.filteredPokemons;
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    if (this.SyncToUrl()) {
      this.restoreFromUrl();
    }

    this.loadUserFavorites();

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
            new Set<number>(data.map((p: Pokemon) => p.generation)),
          ).sort((a, b) => a - b);
          this.recomputeTotalPages();
          if (this.page > this.totalPages) this.page = this.totalPages;
          if (this.page < 1) this.page = 1;
          this.syncUrl();
          console.log('Number of pokemons:', data.length);
        }),
      )
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Error loading pokemons:', err);
        },
      });
  }

  private loadUserFavorites(): void {
    const current = this.authService.currentUser();

    if (current?._id) {
      this.favoritesLoading.set(true);
      this.authService
        .getFavorites(current._id)
        .pipe(finalize(() => this.favoritesLoading.set(false)))
        .subscribe({
          next: (favorites) => {
            this.favorites.set(new Set<number>(favorites ?? []));

            const updatedUser = this.authService.currentUser();
            if (updatedUser) {
              this.authService.currentUser.set({ ...updatedUser, favorites: favorites ?? [] });
            }
          },
          error: (err) => {
            console.error('Error loading favorites:', err);
          },
        });
      return;
    }

    // Si hay token pero no hay usuario cargado aún, intentamos recuperar el perfil
    const token = this.authService.getToken();
    if (token) {
      this.favoritesLoading.set(true);
      this.authService
        .getProfile()
        .pipe(finalize(() => this.favoritesLoading.set(false)))
        .subscribe({
          next: (profile) => {
            this.authService.currentUser.set(profile);
            this.authService.isAuthenticated.set(true);
            this.favorites.set(new Set<number>(profile?.favorites ?? []));
          },
          error: () => {
            // Si el token es inválido, AuthService ya acabará cerrando sesión en otros flujos
          },
        });
    }
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

  onFavoritesChange(value: boolean): void {
    this.onlyFavorites = value;
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
    this.onlyFavorites = false;
    this.page = 1;
    this.recomputeTotalPages();
    this.syncUrl();
  }

  private recomputeTotalPages(): void {
    const count = this.filteredPokemons.length;
    this.totalPages = Math.max(1, Math.ceil(count / this.pageSize));
  }

  get isUserLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  isFavorite(pokemon: Pokemon): boolean {
    return this.favorites().has(pokemon.id);
  }

  toggleFavorite(pokemon: Pokemon): void {
    const user = this.authService.currentUser();
    if (!user?._id) {
      this.router.navigate(['/login']);
      return;
    }

    const pokemonId = pokemon.id;
    const currentlyFav = this.favorites().has(pokemonId);

    const request$ = currentlyFav
      ? this.authService.removeFavorite(user._id, pokemonId)
      : this.authService.addFavorite(user._id, pokemonId);

    request$.subscribe({
      next: (favorites) => {
        this.favorites.set(new Set<number>(favorites ?? []));
        const updated = this.authService.currentUser();
        if (updated) {
          this.authService.currentUser.set({ ...updated, favorites: favorites ?? [] });
        }
      },
      error: (err) => {
        console.error('Error toggling favorite:', err);
      },
    });
  }
}
