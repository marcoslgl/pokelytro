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

  ngOnInit(): void {
    this.pokemonService
      .get()
      .pipe(
        tap((data: any) => {
          this.pokemons = data;
          console.log('Number of pokemons:', data.length);
        })
      )
      .subscribe();
  }
}
