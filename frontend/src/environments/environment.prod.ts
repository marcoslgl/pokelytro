export const environment = {
  production: true,
  apiUrl: typeof window !== 'undefined' && window.location.origin.includes('vercel')
    ? 'https://https://pokelytro-backend.vercel.app/'
    : 'http://localhost:3000',
  api: {
    users: '/api/users',
    pokemons: '/api/pokemons',
    teams: '/api/teams',
    types: '/api/types'
  }
};
