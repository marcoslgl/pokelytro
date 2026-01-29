import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Menu } from './components/menu/menu';
import { Pokemon as PokemonService } from './services/pokemon/pokemon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Menu],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('pokelytro');
  private pokemonService = inject(PokemonService);

  ngOnInit(): void {
    // Pre-cargar datos de pokémon en background para mejor rendimiento
    this.pokemonService.get().subscribe();
  }
}
