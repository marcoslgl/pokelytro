import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Pokedex } from './pages/pokedex/pokedex';
import { TeamBuilder } from './pages/team-builder/team-builder';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { ProfileComponent } from './pages/profile/profile';
import { TeamDetail } from './pages/team-detail/team-detail';
import { Pokemon } from './pages/pokemon/pokemon';
import { pokemonListResolver } from './resolvers/pokemon-list.resolver';
import { Types } from './pages/types/types';
import { Items } from './pages/item/item';
import { Moves } from './pages/moves/moves';
import { Combat } from './pages/combat/combat';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'pokedex', component: Pokedex, resolve: { pokemonList: pokemonListResolver } },
  { path: 'pokedex/:id', component: Pokemon },
  { path: 'combat', component: Combat, canActivate: [authGuard] },
  {
    path: 'team-builder',
    component: TeamBuilder,
    resolve: { pokemonList: pokemonListResolver },
    canActivate: [authGuard],
  },
  {
    path: 'team-detail',
    component: TeamDetail,
    resolve: { pokemonList: pokemonListResolver },
    canActivate: [authGuard],
  },
  { path: 'type-chart', component: Types },
  { path: 'about', component: About },
  { path: 'items', component: Items },
  { path: 'moves', component: Moves },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
