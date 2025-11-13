import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';

import { Menu } from './components/menu/menu';
import { Home } from './pages/home/home';
import { Pokedex } from './pages/pokedex/pokedex';
import { TeamBuilder } from './pages/team-builder/team-builder';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Menu, Pokedex, TeamBuilder],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('pokelytro');
}
