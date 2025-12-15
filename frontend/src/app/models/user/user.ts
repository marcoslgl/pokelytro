export interface User {
    _id: string;
    username: string;
    email: string;
    favorites: number[];
    teams: Team[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Team {
    name: string;
    pokemons: number[];
}