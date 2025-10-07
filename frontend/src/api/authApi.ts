import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/login`, { email, password });
    console.log('Login response:', response.data); // Debug log
    const { token, user } = response.data;
    
    // Ensure token exists before storing
    if (!token) {
      throw new Error('No token received from server');
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    console.log('Token stored:', localStorage.getItem('token')); // Debug log
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Login failed');
  }
};

export const signupUser = async (fullName: string, email: string, password: string): Promise<User> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/signup`, { fullName, email, password });
    console.log('Signup response:', response.data); // Debug log
    const { token, user } = response.data;
    
    // Ensure token exists before storing
    if (!token) {
      throw new Error('No token received from server');
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    console.log('Token stored:', localStorage.getItem('token')); // Debug log
    return user;
  } catch (error) {
    console.error('Signup error:', error);
    throw new Error('Signup failed');
  }
};