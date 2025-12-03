import { Component } from '@angular/core';
import { PokemonList } from '../../components/pokemon-list/pokemon-list';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [PokemonList],
  templateUrl: './pokedex.html',
  styleUrls: ['./pokedex.css'],
})
export class Pokedex {

}
