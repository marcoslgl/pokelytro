import { Component, OnInit } from '@angular/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Pokemon as PokemonService } from '../../services/pokemon/pokemon';
import { Pokemon } from '../../models/pokemon/pokemon';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [RouterLink, RouterLinkActive],
})
export class Home implements OnInit {
  randomPokemons: Pokemon[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    this.loadRandomPokemons();
  }

  loadRandomPokemons(): void {
    this.pokemonService.get().subscribe({
      next: (pokemons) => {
        this.randomPokemons = this.getRandomPokemons(pokemons, 10);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error =
          (typeof err?.error?.message === 'string' && err.error.message) ||
          (typeof err?.message === 'string' && err.message) ||
          'Failed to load pokémon carousel.';
      }
    });
  }

  private getRandomPokemons(pokemons: Pokemon[], count: number): Pokemon[] {
    const shuffled = [...pokemons].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
