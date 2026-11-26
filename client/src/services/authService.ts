import api from './api';
import type { LoginCredentials, AuthResponse, UserRole } from '../types';

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  grade?: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const registerUser = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logoutUser = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
