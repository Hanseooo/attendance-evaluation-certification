export interface User {
  pk: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  isEmailVerified: boolean;
  role: string;
}

export interface LoginResponse {
  key: string;   // auth token
  user: User;
}

export interface LoginPayload {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password1: string;
  password2: string;
}
