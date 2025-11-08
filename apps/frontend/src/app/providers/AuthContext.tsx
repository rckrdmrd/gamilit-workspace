import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api/auth.api';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthContextType,
} from '@/shared/types/auth.types';

/**
 * AuthContext
 * Manages authentication state and provides auth methods throughout the application
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider Component
 * Wraps the application to provide authentication context
 *
 * Features:
 * - Persists authentication state across page refreshes
 * - Automatically loads user profile on mount if token exists
 * - Handles login, register, logout operations
 * - Provides error handling for auth operations
 * - Supports user profile refresh
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user profile on component mount
   * Checks for existing token and fetches user data
   */
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getProfile();
        setUser(userData);
        setError(null);
      } catch (err) {
        // Token is invalid or expired, clear storage
        console.error('Failed to load user profile:', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login user with credentials
   *
   * @param credentials - Email and password
   * @throws Error with message if login fails
   *
   * @example
   * ```tsx
   * const { login } = useAuth();
   * await login({ email: 'user@example.com', password: 'password123' });
   * ```
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login(credentials);

      // If the API returns user data, use it; otherwise fetch profile
      if (response.user) {
        setUser(response.user);
      } else {
        const userData = await authApi.getProfile();
        setUser(userData);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   *
   * @param userData - Registration data including email, password, and optional names
   * @throws Error with message if registration fails
   *
   * @example
   * ```tsx
   * const { register } = useAuth();
   * await register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   first_name: 'John',
   *   last_name: 'Doe'
   * });
   * ```
   */
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.register(userData);

      // Auto-login after successful registration
      if (response.user) {
        setUser(response.user);
      } else {
        const userProfile = await authApi.getProfile();
        setUser(userProfile);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout current user
   * Clears user state and removes tokens from storage
   *
   * @example
   * ```tsx
   * const { logout } = useAuth();
   * await logout();
   * ```
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  };

  /**
   * Refresh user profile from server
   * Useful after profile updates or to sync latest data
   *
   * @throws Error if profile fetch fails
   *
   * @example
   * ```tsx
   * const { refreshUser } = useAuth();
   * await refreshUser();
   * ```
   */
  const refreshUser = async (): Promise<void> => {
    try {
      setError(null);
      const userData = await authApi.getProfile();
      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to refresh user profile.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Clear error state
   * Useful for dismissing error messages in UI
   *
   * @example
   * ```tsx
   * const { error, clearError } = useAuth();
   * if (error) {
   *   <Alert onClose={clearError}>{error}</Alert>
   * }
   * ```
   */
  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * Custom hook to access authentication context
 *
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType with user state and auth methods
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <LoginForm onLogin={login} />;
 *   }
 *
 *   return <div>Welcome, {user.email}!</div>;
 * }
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

/**
 * Export AuthContext for advanced use cases
 * (e.g., testing, custom consumers)
 */
export { AuthContext };
