import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon as PokemonService } from '../../services/pokemon/pokemon';
import { Pokemon } from '../../models/pokemon/pokemon';
import { tap } from 'rxjs';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-list.html',
  styleUrls: ['./pokemon-list.css'],
})
export class PokemonList implements OnInit {
  // Inject the Pokemon service
  private pokemonService = inject(PokemonService);
  //  Pokemon list

  pokemons!: Pokemon[];
  searchTerm = '';
  page = 1;
  pageSize = 24;
  totalPages = 1;

  get filteredPokemons(): Pokemon[] {
    if (!this.pokemons) return [];
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.pokemons;
    return this.pokemons.filter((p) => p.name.toLowerCase().includes(q));
  }

  get pagedPokemons(): Pokemon[] {
    const list = this.filteredPokemons;
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.pokemonService
      .get()
      .pipe(
        tap((data: any) => {
          this.pokemons = data;
          this.recomputeTotalPages();
          console.log('Number of pokemons:', data.length);
        })
      )
      .subscribe();
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  setPageSize(size: number | string): void {
    this.pageSize = Number(size);
    this.recomputeTotalPages();
    this.page = 1;
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
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.page = 1;
    this.recomputeTotalPages();
  }

  private recomputeTotalPages(): void {
    const count = this.filteredPokemons.length;
    this.totalPages = Math.max(1, Math.ceil(count / this.pageSize));
  }
}
