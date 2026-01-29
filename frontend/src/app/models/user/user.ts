export interface User {
  _id: string;
  username: string;
  email: string;
  favorites: number[];
  createdAt?: string;
  updatedAt?: string;
}
