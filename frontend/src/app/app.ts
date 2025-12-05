import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Menu } from './components/menu/menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Menu],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('pokelytro');
}
