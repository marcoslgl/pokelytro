export interface User {
  _id: string;
  username: string;
  email: string;
  favorites: number[];
  profileImage?: number;
  createdAt?: string;
  updatedAt?: string;
}
