import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Quiz } from './pages/quiz/quiz';
import { Showdown } from './pages/showdown/showdown';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'quiz', component: Quiz },
  { path: 'showdown', component: Showdown },
  { path: 'about', component: About },
  { path: '**', redirectTo: '' },
];
