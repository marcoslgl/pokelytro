import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon as PokemonService } from '../../services/pokemon/pokemon';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-list.html',
  styleUrls: ['./pokemon-list.css'],
})
export class PokemonList implements OnInit {
  private pokemonService = inject(PokemonService);

  pokemons: any[] = [];

  ngOnInit(): void {
    this.pokemonService.get().subscribe(
      (data: any) => {
        console.log('Number of pokemons:', data.length);
        this.pokemons = data;
      },
      (error: any) => {
        console.error('Error:', error);
      }
    );
  }

}
