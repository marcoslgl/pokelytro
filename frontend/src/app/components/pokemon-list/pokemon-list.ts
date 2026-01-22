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

  private pokemonService = inject(PokemonService);

  pokemons!: Pokemon[];
  page = 1;
  pageSize = 24;
  totalPages = 1;

  get pagedPokemons(): Pokemon[] {
    if (!this.pokemons) return [];
    const start = (this.page - 1) * this.pageSize;
    return this.pokemons.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.pokemonService
      .get()
      .pipe(
        tap((data: any) => {
          this.pokemons = data;
          this.totalPages = Math.max(1, Math.ceil(this.pokemons.length / this.pageSize));
          console.log('Number of pokemons:', data.length);
        })
      )
      .subscribe({
        next: () => { },
        error: (err) => {
          console.error('Error loading pokemons:', err);
        }
      });
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
    this.totalPages = Math.max(1, Math.ceil((this.pokemons?.length ?? 0) / this.pageSize));
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
}
