import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/login`, { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return user;
  } catch (error) {
    throw new Error('Login failed');
  }
};

export const signupUser = async (username: string, email: string, password: string): Promise<User> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/signup`, { username, email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return user;
  } catch (error) {
    throw new Error('Signup failed');
  }
};