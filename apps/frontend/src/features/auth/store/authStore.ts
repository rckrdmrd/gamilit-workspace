import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, RegisterData, AuthResponse } from '../types/auth.types';
import * as authAPI from '../api/authAPI';

/**
 * Auth State Interface
 * Based on state-management.md and EPIC-002 specifications
 */
interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiresAt: number | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  checkSession: () => boolean;

  // Password recovery
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}


/**
 * Auth Store using Zustand with persistence
 * Implements authentication state management with JWT tokens
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpiresAt: null,

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Call real API
          const response = await authAPI.login({ email, password });

          // Save tokens to localStorage for API client
          localStorage.setItem('auth-token', response.token);
          localStorage.setItem('refresh-token', response.refreshToken);

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            sessionExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            error: error.message || 'Error al iniciar sesión',
            isLoading: false,
            isAuthenticated: false
          });
          throw error;
        }
      },

      // Register action
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          // Call real API - returns AuthResponse
          const response = await authAPI.register(data);

          // Save tokens to localStorage for API client
          localStorage.setItem('auth-token', response.token);
          localStorage.setItem('refresh-token', response.refreshToken);

          // Update state with registered user data
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            sessionExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            error: error.message || 'Error al registrar usuario',
            isLoading: false
          });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        try {
          // Call real API to invalidate session on backend
          await authAPI.logout();
        } catch (error) {
          // Continue with local logout even if API call fails
          console.error('Logout API call failed:', error);
        } finally {
          // Clear tokens from localStorage
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');

          // Clear state
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            sessionExpiresAt: null,
            error: null,
            isLoading: false
          });
        }
      },

      // Refresh session
      refreshSession: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          throw new Error('No hay token de refresco disponible');
        }

        try {
          // Call real API to refresh token
          const response = await authAPI.refreshToken(refreshToken);

          // Update token in localStorage for API client
          localStorage.setItem('auth-token', response.token);

          // Update state with new token
          set({
            token: response.token,
            sessionExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
          });
        } catch (error) {
          // If refresh fails, logout user
          await get().logout();
          throw error;
        }
      },

      // Update user
      updateUser: (updates: Partial<User>) => {
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Check session validity
      checkSession: () => {
        const { sessionExpiresAt, isAuthenticated } = get();

        if (!isAuthenticated || !sessionExpiresAt) {
          return false;
        }

        const isValid = Date.now() < sessionExpiresAt;

        if (!isValid) {
          get().logout();
        }

        return isValid;
      },

      // Password recovery
      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          // Call real API to request password reset
          await authAPI.requestPasswordReset({ email });
          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({
            error: error.message || 'Error al solicitar recuperación',
            isLoading: false
          });
          throw error;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          // Call real API to reset password
          await authAPI.resetPassword({ token, newPassword });
          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({
            error: error.message || 'Error al restablecer contraseña',
            isLoading: false
          });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        sessionExpiresAt: state.sessionExpiresAt
      })
    }
  )
);
