import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Quiz } from './pages/quiz/quiz';
import { Showdown } from './pages/showdown/showdown';
import { Pokedex } from './pages/pokedex/pokedex';
import { TeamBuilder } from './pages/team-builder/team-builder';
import { TeamDetail } from './pages/team-detail/team-detail';
import { Pokemon } from './pages/pokemon/pokemon';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'pokedex', component: Pokedex },
  { path: 'pokedex/:id', component: Pokemon },
  { path: 'team-builder', component: TeamBuilder },
  { path: 'team-detail', component: TeamDetail },
  { path: 'quiz', component: Quiz },
  { path: 'showdown', component: Showdown },
  { path: 'about', component: About },
  { path: '**', redirectTo: '' },
];
