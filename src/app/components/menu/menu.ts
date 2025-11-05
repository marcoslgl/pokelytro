import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule, NgFor],
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
  navActive = false;

  togglenav() {
    this.navActive = !this.navActive;
    document.body.classList.toggle('menu-open', this.navActive);
  }

  closenav() {
    this.navActive = false;
    document.body.classList.remove('menu-open');
  }
}
