import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
export class Home implements AfterViewInit, OnInit {
  @ViewChild('homeVideo') videoElement?: ElementRef<HTMLVideoElement>;
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

  ngAfterViewInit(): void {
    // Solo ejecutar en el navegador, no en SSR
    if (isPlatformBrowser(this.platformId) && this.videoElement?.nativeElement) {
      this.videoElement.nativeElement.play().catch((err) => {
        console.error('Error al reproducir video:', err);
      });
    }
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
