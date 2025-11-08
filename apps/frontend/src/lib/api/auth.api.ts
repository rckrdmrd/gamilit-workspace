import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  first_name?: string;
  last_name?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  status: string;
  email_verified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: UserResponse;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
    }
    return data;
  },

  register: async (userData: RegisterData) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', userData);
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
    }
    return data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  getProfile: async () => {
    const { data } = await apiClient.get<UserResponse>('/auth/profile');
    return data;
  },

  refreshToken: async (refreshToken: string) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
    }
    return data;
  },
};
