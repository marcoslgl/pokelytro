import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  imports: [RouterModule, CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  menuItems = [
    { label: 'Home', link: '/', exact: true },
    { label: 'Quiz', link: '/quiz' },
    { label: 'Showdown', link: '/showdown' },
    { label: 'About', link: '/about' },
  ];
}
