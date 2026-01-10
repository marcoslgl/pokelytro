import { NgFor } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [NgFor, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnDestroy {
  private readonly maxPokemonId = 1025;
  private readonly totalCards = 12;
  private isNarrow = false;
  private mql?: MediaQueryList;
  private mqlListener?: () => void;

  pokemonIds: number[] = [];
  startIndex = 0;

  constructor() {
    this.reshuffle();
    this.setupResponsiveVisibleCount();
  }

  private setupResponsiveVisibleCount(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    this.mql = window.matchMedia('(max-width: 1299px)');
    const apply = () => {
      this.isNarrow = !!this.mql?.matches;
    };
    apply();

    this.mqlListener = () => apply();
    this.mql.addEventListener('change', this.mqlListener);
  }

  private get visibleCount(): number {
    return this.isNarrow ? 3 : 5;
  }

  ngOnDestroy(): void {
    if (this.mql && this.mqlListener) {
      this.mql.removeEventListener('change', this.mqlListener);
    }
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
