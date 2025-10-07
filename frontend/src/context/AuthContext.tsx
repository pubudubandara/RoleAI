import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { loginUser, signupUser } from '../api/authApi';

interface User {
  id: number;
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add axios interceptor to handle token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token is invalid or expired - clear auth data and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          toast.error('Session expired. Please login again.');
          // Redirect to home page
          window.location.replace('/');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Set the authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Parse and validate stored user data
          const userData = JSON.parse(storedUser);
          if (userData && userData.id && userData.email) {
            setUser(userData);
          } else {
            throw new Error('Invalid user data');
          }
        } catch (error) {
          // Token or user data is invalid, clear stored data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          console.log('Stored auth data is invalid, cleared');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      toast.success('Login successful! Welcome back.');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const userData = await signupUser(username, email, password);
      setUser(userData);
      toast.success('Account created successfully! Please check your email for verification.');
    } catch (error) {
      toast.error('Signup failed. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    // Redirect to home page
    window.location.replace('/');
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};