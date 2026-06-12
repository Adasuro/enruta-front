import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type User } from '../features/auth/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeBusinessId: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  getUser: () => Promise<void>;
  switchBusiness: (businessId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicializar desde localStorage
    const storedToken = localStorage.getItem('enruta_token');
    const storedUser = localStorage.getItem('enruta_user');
    const storedBusinessId = localStorage.getItem('enruta_active_business');

    if (storedToken && storedUser) {
      setToken(storedToken);
      const parsedUser = JSON.parse(storedUser) as User;
      setUser(parsedUser);
      
      if (storedBusinessId && parsedUser.businesses?.some(b => b.id === storedBusinessId)) {
        setActiveBusinessId(storedBusinessId);
      } else if (parsedUser.businesses && parsedUser.businesses.length > 0) {
        setActiveBusinessId(parsedUser.businesses[0].id);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('enruta_token', newToken);
    localStorage.setItem('enruta_user', JSON.stringify(newUser));
    
    if (newUser.businesses && newUser.businesses.length > 0) {
      setActiveBusinessId(newUser.businesses[0].id);
      localStorage.setItem('enruta_active_business', newUser.businesses[0].id);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setActiveBusinessId(null);
    try {
        await authService.logout();
    } catch(e) {
        console.error("Logout failed on server, clearing local state", e);
        localStorage.removeItem('enruta_token');
        localStorage.removeItem('enruta_user');
        localStorage.removeItem('enruta_active_business');
    }
  };

  const getUser = async () => {
    try {
      const freshUser = await authService.getUser();
      setUser(freshUser);
      localStorage.setItem('enruta_user', JSON.stringify(freshUser));
      
      // Asegurar que haya un negocio activo válido
      const currentActiveId = localStorage.getItem('enruta_active_business');
      if (currentActiveId && freshUser.businesses?.some(b => b.id === currentActiveId)) {
        setActiveBusinessId(currentActiveId);
      } else if (freshUser.businesses && freshUser.businesses.length > 0) {
        setActiveBusinessId(freshUser.businesses[0].id);
        localStorage.setItem('enruta_active_business', freshUser.businesses[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch fresh user data", error);
    }
  };

  const switchBusiness = (businessId: string) => {
    if (user?.businesses?.some(b => b.id === businessId)) {
      setActiveBusinessId(businessId);
      localStorage.setItem('enruta_active_business', businessId);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, activeBusinessId, login, logout, getUser, switchBusiness, isLoading }}>
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

