/**
 * Auth Feature Barrel Export
 * Exporta todos los módulos relacionados con autenticación
 */

// Store
export { useAuthStore } from './store/authStore';

// Hooks
export {
  useAuth,
  useUser,
  useSession,
  usePermissions,
  useRole
} from './hooks';

// Providers — canonical AuthProvider is at app/providers/AuthContext.tsx
// Feature-scoped AuthProvider was removed (CORR-FE-002, 0 external importers)

// API
export { apiClient, authAPI } from './api';

// Types
export type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  SessionInfo
} from './types/auth.types';

// Components (if they exist)
export * from './components';

// Schemas (if they exist)
export * from './schemas/authSchemas';

// Mocks (if they exist)
export * from './mocks/authMocks';
