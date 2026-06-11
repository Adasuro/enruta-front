import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type User } from '../features/auth/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  getUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicializar desde localStorage
    const storedToken = localStorage.getItem('enruta_token');
    const storedUser = localStorage.getItem('enruta_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('enruta_token', newToken);
    localStorage.setItem('enruta_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    try {
        await authService.logout();
    } catch(e) {
        console.error("Logout failed on server, clearing local state", e);
        localStorage.removeItem('enruta_token');
        localStorage.removeItem('enruta_user');
    }
  };

  const getUser = async () => {
    try {
      const freshUser = await authService.getUser();
      setUser(freshUser);
      localStorage.setItem('enruta_user', JSON.stringify(freshUser));
    } catch (error) {
      console.error("Failed to fetch fresh user data", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, getUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
