/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSession } from '../hooks/useSession';

/**
 * Auth context value interface
 */
interface AuthContextValue {
  isInitialized: boolean;
}

/**
 * Auth context
 */
const AuthContext = createContext<AuthContextValue>({ isInitialized: false });

/**
 * Hook to access auth context
 */
export const useAuthContext = () => useContext(AuthContext);

/**
 * Auth Provider Component
 * Initializes authentication state and manages session
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const checkSession = useAuthStore((state) => state.checkSession);

  // Initialize auth on mount
  useEffect(() => {
    // Check if there's a valid session in storage
    checkSession();
    setIsInitialized(true);
  }, [checkSession]);

  // Use session hook for periodic checks
  useSession();

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Cargando autenticación...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ isInitialized }}>{children}</AuthContext.Provider>;
};
