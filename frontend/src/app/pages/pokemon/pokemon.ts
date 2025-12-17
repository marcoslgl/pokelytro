import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Pokemon as PokemonModel } from '../../models/pokemon/pokemon';
import { Pokemon as PokemonService } from '../../services/pokemon/pokemon';

@Component({
  selector: 'app-pokemon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon.html',
  styleUrls: ['./pokemon.css'],
})
export class Pokemon implements OnInit {
  private route = inject(ActivatedRoute);
  private pokemonService = inject(PokemonService);

  pokemon?: PokemonModel;
  id?: number;


  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.id = idParam ? Number(idParam) : undefined;
      if (this.id !== undefined) {
          this.pokemonService.getById(this.id).subscribe((pokemon: any) => {
            this.pokemon = pokemon as PokemonModel;
          });
      }
    });
  }
}
