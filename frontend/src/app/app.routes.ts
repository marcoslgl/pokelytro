import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Quiz } from './pages/quiz/quiz';
import { Showdown } from './pages/showdown/showdown';
import { Pokedex } from './pages/pokedex/pokedex';
import { TeamBuilder } from './pages/team-builder/team-builder';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'pokedex', component: Pokedex },
  { path: 'quiz', component: Quiz },
  { path: 'showdown', component: Showdown },
  { path: 'about', component: About },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },

  {
    path: 'team builder',
    component: TeamBuilder,
    canActivate: [authGuard]
  },

  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },


  { path: '**', redirectTo: '' }
];