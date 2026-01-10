import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [NgFor, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly maxPokemonId = 1025;
  private readonly totalCards = 12;
  readonly visibleCount = 3;

  pokemonIds: number[] = [];
  startIndex = 0;

  constructor() {
    this.reshuffle();
  }

  get visiblePokemonIds(): number[] {
    if (this.pokemonIds.length === 0) return [];

    const visible: number[] = [];
    for (let i = 0; i < this.visibleCount; i++) {
      visible.push(this.pokemonIds[(this.startIndex + i) % this.pokemonIds.length]);
    }
    return visible;
  }

  imgSrc(id: number): string {
    return `/images/${id}.png`;
  }

  prev(): void {
    if (this.pokemonIds.length === 0) return;
    this.startIndex = (this.startIndex - 1 + this.pokemonIds.length) % this.pokemonIds.length;
  }

  next(): void {
    if (this.pokemonIds.length === 0) return;
    this.startIndex = (this.startIndex + 1) % this.pokemonIds.length;
  }

  reshuffle(): void {
    const picked = new Set<number>();
    while (picked.size < this.totalCards) {
      picked.add(1 + Math.floor(Math.random() * this.maxPokemonId));
    }
    this.pokemonIds = Array.from(picked);
    this.startIndex = 0;
  }
}
