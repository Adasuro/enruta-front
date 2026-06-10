import api from '../../../config/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  city_id?: string;
  businesses?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/logout');
    localStorage.removeItem('enruta_token');
    localStorage.removeItem('enruta_user');
  },

  getUser: async (): Promise<User> => {
    const response = await api.get<User>('/user');
    return response.data;
  }
};
