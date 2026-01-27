import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Pokemon as PokemonService } from '../pokemon/pokemon';
import { Pokemon } from '../../models/pokemon/pokemon';

@Injectable({
  providedIn: 'root',
})
export class PokemonListStore {
  private pokemonService = inject(PokemonService);

  private list$?: Observable<Pokemon[]>;

  getList(options?: { force?: boolean }): Observable<Pokemon[]> {
    const force = options?.force === true;
    if (force || !this.list$) {
      this.list$ = this.pokemonService.get().pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.list$!;
  }

  clearCache(): void {
    this.list$ = undefined;
  }
}
