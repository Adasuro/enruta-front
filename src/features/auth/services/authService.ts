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

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_type: 'b2c' | 'b2b';
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', { email, password });
    return response.data;
  },

  register: async (data: RegisterDTO): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/register', data);
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
