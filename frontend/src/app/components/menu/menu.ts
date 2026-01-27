import { Component } from '@angular/core'
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
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
