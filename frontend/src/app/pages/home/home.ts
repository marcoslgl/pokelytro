import { Component, DestroyRef, ElementRef, ViewChild, afterNextRender, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Pokemon as PokemonService } from '../../services/pokemon/pokemon';

type CarouselPokemon = {
  id: number;
  name: string;
};

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly maxPokemonId = 1025;
  private readonly totalCards = 12;
  private readonly cardGapPx = 12;

  private readonly destroyRef = inject(DestroyRef);
  private readonly pokemonApi = inject(PokemonService);
  private readonly nameCache = new Map<number, string>();
  private readonly nameLoading = new Set<number>();

  private isNarrow = false;
  private isSmall = false;
  private mql?: MediaQueryList;
  private mqlListener?: () => void;
  private mqlSmall?: MediaQueryList;
  private mqlSmallListener?: () => void;
  private autoEnabled = true;
  private stepPx = 0;
  private pendingDirection: 'next' | 'prev' | null = null;

  @ViewChild('carouselViewport') private carouselViewport?: ElementRef<HTMLElement>;

  pokemonIds: number[] = [];
  startIndex = 0;

  renderedPokemons: CarouselPokemon[] = [];
  isAnimating = false;
  trackTransform = 'translateX(0px)';

  constructor() {
    this.reshuffle();
    this.setupResponsiveVisibleCount();

    afterNextRender(() => {
      if (typeof window === 'undefined') return;
      this.updateStepPx();
      this.rebuildRendered();
      this.setTrackOffset(1, false);
      this.startAutoAdvance();
      window.addEventListener('resize', this.onWindowResize, { passive: true });
    });

    this.destroyRef.onDestroy(() => {
      this.autoEnabled = false;

      if (this.mql && this.mqlListener) {
        this.mql.removeEventListener('change', this.mqlListener);
      }

      if (this.mqlSmall && this.mqlSmallListener) {
        this.mqlSmall.removeEventListener('change', this.mqlSmallListener);
      }

      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', this.onWindowResize);
      }
    });
  }

  private readonly onWindowResize = () => {
    this.updateStepPx();
    this.setTrackOffset(1, false);
  };

  private startAutoAdvance(): void {
    if (typeof window === 'undefined') return;
    this.scheduleNextAutoStep();
  }

  private scheduleNextAutoStep(): void {
    if (typeof window === 'undefined') return;
    if (!this.autoEnabled) return;
    if (this.isAnimating) return;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!this.autoEnabled) return;
        if (this.isAnimating) return;
        this.slideNext();
      });
    });
  }

  private setupResponsiveVisibleCount(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    this.mql = window.matchMedia('(max-width: 1299px)');
    this.mqlSmall = window.matchMedia('(max-width: 520px)');
    const apply = () => {
      this.isNarrow = !!this.mql?.matches;
      this.isSmall = !!this.mqlSmall?.matches;
      this.onVisibleCountChanged();
    };
    apply();

    this.mqlListener = () => apply();
    this.mql.addEventListener('change', this.mqlListener);

    this.mqlSmallListener = () => apply();
    this.mqlSmall.addEventListener('change', this.mqlSmallListener);
  }

  get visibleCount(): number {
    if (this.isSmall) return 2;
    return this.isNarrow ? 3 : 5;
  }

  private onVisibleCountChanged(): void {
    if (typeof window === 'undefined') return;
    this.updateStepPx();
    this.rebuildRendered();
    this.setTrackOffset(1, false);
  }


  private get visiblePokemonIds(): number[] {
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
    this.slidePrev();
  }

  next(): void {
    this.slideNext();
  }

  slidePrev(): void {
    if (this.pokemonIds.length === 0) return;
    if (this.isAnimating) return;
    if (this.stepPx <= 0) return;

    this.rebuildRendered();
    this.pendingDirection = 'prev';
    this.setTrackOffset(0, true);
  }

  slideNext(): void {
    if (this.pokemonIds.length === 0) return;
    if (this.isAnimating) return;
    if (this.stepPx <= 0) return;

    this.rebuildRendered();
    this.pendingDirection = 'next';
    this.setTrackOffset(2, true);
  }

  onTrackTransitionEnd(): void {
    if (!this.pendingDirection) return;
    if (this.pokemonIds.length === 0) return;

    const len = this.pokemonIds.length;
    if (this.pendingDirection === 'next') {
      this.startIndex = (this.startIndex + 1) % len;
    } else {
      this.startIndex = (this.startIndex - 1 + len) % len;
    }

    this.pendingDirection = null;
    this.rebuildRendered();
    this.setTrackOffset(1, false);

    this.scheduleNextAutoStep();
  }

  reshuffle(): void {
    const picked = new Set<number>();
    while (picked.size < this.totalCards) {
      picked.add(1 + Math.floor(Math.random() * this.maxPokemonId));
    }
    this.pokemonIds = Array.from(picked);
    this.startIndex = 0;
    this.rebuildRendered();
    this.setTrackOffset(1, false);
  }

  private rebuildRendered(): void {
    if (this.pokemonIds.length === 0) {
      this.renderedPokemons = [];
      return;
    }

    const len = this.pokemonIds.length;
    const prevId = this.pokemonIds[(this.startIndex - 1 + len) % len];
    const nextId = this.pokemonIds[(this.startIndex + this.visibleCount) % len];
    const ids = [prevId, ...this.visiblePokemonIds, nextId];
    this.ensureNames(ids);
    this.renderedPokemons = ids.map((id) => ({ id, name: this.nameCache.get(id) ?? `#${id}` }));
  }

  private ensureNames(ids: number[]): void {
    for (const id of ids) {
      if (this.nameCache.has(id)) continue;
      if (this.nameLoading.has(id)) continue;

      this.nameLoading.add(id);
      this.pokemonApi
        .getById(id)
        .pipe(
          catchError(() => of(null)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((pokemon) => {
          this.nameLoading.delete(id);
          const name = pokemon?.name ? String(pokemon.name) : `#${id}`;
          this.nameCache.set(id, name);
          this.rebuildRendered();
        });
    }
  }

  private updateStepPx(): void {
    if (typeof window === 'undefined') return;
    const viewport = this.carouselViewport?.nativeElement;
    if (!viewport) return;

    const viewportWidth = viewport.clientWidth;
    if (viewportWidth <= 0) return;

    this.stepPx = viewportWidth / this.visibleCount + this.cardGapPx / this.visibleCount;
  }

  private setTrackOffset(offset: number, animate: boolean): void {
    if (this.stepPx <= 0) {
      this.trackTransform = 'translateX(0px)';
      this.isAnimating = false;
      return;
    }

    this.isAnimating = animate;
    this.trackTransform = `translateX(-${this.stepPx * offset}px)`;
  }
}
