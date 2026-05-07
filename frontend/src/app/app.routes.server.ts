import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'register', renderMode: RenderMode.Client },
  { path: 'profile', renderMode: RenderMode.Client },
  { path: 'team-builder', renderMode: RenderMode.Client },
  { path: 'team-detail', renderMode: RenderMode.Client },
  { path: 'items', renderMode: RenderMode.Client },
  { path: 'type-chart', renderMode: RenderMode.Client },
  { path: 'pokedex', renderMode: RenderMode.Client },
  { path: 'pokedex/:id', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
