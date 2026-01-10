import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for authentication
 * Provides access to auth state and actions
 *
 * IMPORTANT: Uses Zustand selectors to prevent unnecessary re-renders.
 * Each property is selected individually so components only re-render
 * when the specific properties they use change.
 */
export const useAuth = () => {
  // State selectors - only re-render when these specific values change
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  // Action selectors - these are stable references (functions don't change)
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const register = useAuthStore((state) => state.register);
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const clearError = useAuthStore((state) => state.clearError);
  const checkSession = useAuthStore((state) => state.checkSession);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    refreshSession,
    clearError,
    checkSession
  };
};
