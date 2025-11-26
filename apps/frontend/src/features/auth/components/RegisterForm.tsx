/**
 * RegisterForm Component
 * User registration form with comprehensive validation
 *
 * Features:
 * - Email, password, and confirm password fields
 * - Password strength indicator (weak/medium/strong)
 * - Full name and role selection (optional)
 * - Terms & conditions checkbox (required)
 * - Real-time validation feedback
 * - Show/hide password toggles
 * - Auto-login and redirect after registration
 * - Accessible form with ARIA labels
 *
 * @requires react-hook-form, zod, @hookform/resolvers
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import {
  registerSchema,
  type RegisterFormData,
  calculatePasswordStrength,
} from '@/shared/schemas/auth.schemas';

interface RegisterFormProps {
  /**
   * Callback fired after successful registration (optional)
   */
  onSuccess?: () => void;

  /**
   * Custom redirect path after registration (default: '/dashboard')
   */
  redirectTo?: string;

  /**
   * Show role selection field (default: false)
   */
  showRoleSelection?: boolean;
}

/**
 * RegisterForm Component
 *
 * @example
 * ```tsx
 * <RegisterForm
 *   redirectTo="/onboarding"
 *   showRoleSelection={true}
 *   onSuccess={() => console.log('Registration successful')}
 * />
 * ```
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  redirectTo = '/dashboard',
  showRoleSelection = false,
}) => {
  const navigate = useNavigate();
  const { register: registerUser, error: authError, clearError, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    strength: 'weak' | 'medium' | 'strong';
    score: number;
  }>({ strength: 'weak', score: 0 });

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      role: 'student',
      terms_accepted: false,
    },
  });

  // Watch password field for strength calculation
  const password = watch('password');

  // Update password strength in real-time
  useEffect(() => {
    if (password) {
      const strength = calculatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ strength: 'weak', score: 0 });
    }
  }, [password]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();

      // Prepare registration data for API
      // Backend only expects: email, password, first_name (optional), last_name (optional)
      const registrationData: any = {
        email: data.email,
        password: data.password,
        // Split full_name into first_name and last_name if provided
        ...(data.full_name && {
          first_name: data.full_name.split(' ')[0] || '',
          last_name: data.full_name.split(' ').slice(1).join(' ') || '',
        }),
      };

      // Attempt registration
      await registerUser(registrationData);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Navigate to redirect path
      navigate(redirectTo);
    } catch (err: any) {
      // Error is already set in AuthContext
      setError('root', {
        message: err.message || 'El registro falló. Por favor, intenta nuevamente.',
      });
    }
  };

  /**
   * Get password strength color classes
   */
  const getStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  /**
   * Get password strength width percentage
   */
  const getStrengthWidth = () => {
    return `${(passwordStrength.score / 6) * 100}%`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Global Error Alert */}
      {(authError || errors.root) && (
        <div
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">{authError || errors.root?.message}</p>
          </div>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={`
            w-full rounded-lg border px-4 py-3
            transition-colors duration-200 focus:border-transparent focus:outline-none
            focus:ring-2 focus:ring-orange-500
            ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
          `}
          placeholder="tu@ejemplo.com"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          disabled={isSubmitting}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Full Name Field (Optional) */}
      <div>
        <label htmlFor="full_name" className="mb-2 block text-sm font-medium text-gray-700">
          Nombre Completo <span className="text-xs text-gray-400">(opcional)</span>
        </label>
        <input
          id="full_name"
          type="text"
          autoComplete="name"
          className={`
            w-full rounded-lg border px-4 py-3
            transition-colors duration-200 focus:border-transparent focus:outline-none
            focus:ring-2 focus:ring-orange-500
            ${errors.full_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
          `}
          placeholder="Juan Pérez"
          aria-invalid={errors.full_name ? 'true' : 'false'}
          aria-describedby={errors.full_name ? 'full-name-error' : undefined}
          disabled={isSubmitting}
          {...register('full_name')}
        />
        {errors.full_name && (
          <p id="full-name-error" className="mt-2 text-sm text-red-600" role="alert">
            {errors.full_name.message}
          </p>
        )}
      </div>

      {/* Role Selection (Optional) */}
      {showRoleSelection && (
        <div>
          <label htmlFor="role" className="mb-2 block text-sm font-medium text-gray-700">
            Rol
          </label>
          <select
            id="role"
            className={`
              w-full rounded-lg border px-4 py-3
              transition-colors duration-200 focus:border-transparent focus:outline-none
              focus:ring-2 focus:ring-orange-500
              ${errors.role ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
            `}
            aria-invalid={errors.role ? 'true' : 'false'}
            aria-describedby={errors.role ? 'role-error' : undefined}
            disabled={isSubmitting}
            {...register('role')}
          >
            <option value="student">Estudiante</option>
            <option value="admin_teacher">Profesor/Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          {errors.role && (
            <p id="role-error" className="mt-2 text-sm text-red-600" role="alert">
              {errors.role.message}
            </p>
          )}
        </div>
      )}

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={`
              w-full rounded-lg border px-4 py-3 pr-12
              transition-colors duration-200 focus:border-transparent focus:outline-none
              focus:ring-2 focus:ring-orange-500
              ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
            `}
            placeholder="Crea una contraseña segura"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : 'password-strength'}
            disabled={isSubmitting}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:text-gray-700 focus:outline-none"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            disabled={isSubmitting}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div id="password-strength" className="mt-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-gray-600">Fortaleza de la contraseña:</span>
              <span
                className={`text-xs font-medium ${
                  passwordStrength.strength === 'weak'
                    ? 'text-red-600'
                    : passwordStrength.strength === 'medium'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }`}
              >
                {passwordStrength.strength === 'weak'
                  ? 'Débil'
                  : passwordStrength.strength === 'medium'
                    ? 'Media'
                    : 'Fuerte'}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                style={{ width: getStrengthWidth() }}
              />
            </div>
          </div>
        )}

        {errors.password && (
          <p id="password-error" className="mt-2 text-sm text-red-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
          Confirmar Contraseña
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={`
              w-full rounded-lg border px-4 py-3 pr-12
              transition-colors duration-200 focus:border-transparent focus:outline-none
              focus:ring-2 focus:ring-orange-500
              ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
            `}
            placeholder="Vuelve a ingresar tu contraseña"
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            disabled={isSubmitting}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:text-gray-700 focus:outline-none"
            aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            disabled={isSubmitting}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="mt-2 text-sm text-red-600" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms & Conditions Checkbox */}
      <div>
        <div className="flex items-start">
          <input
            id="terms_accepted"
            type="checkbox"
            className={`
              mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-orange-600 focus:ring-orange-500
              ${errors.terms_accepted ? 'border-red-500' : ''}
            `}
            aria-invalid={errors.terms_accepted ? 'true' : 'false'}
            aria-describedby={errors.terms_accepted ? 'terms-error' : undefined}
            disabled={isSubmitting}
            {...register('terms_accepted')}
          />
          <label
            htmlFor="terms_accepted"
            className="ml-2 block cursor-pointer text-sm text-gray-700"
          >
            Acepto los{' '}
            <a
              href="/terms"
              className="text-orange-600 underline hover:text-orange-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Términos y Condiciones
            </a>{' '}
            y la{' '}
            <a
              href="/privacy"
              className="text-orange-600 underline hover:text-orange-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Política de Privacidad
            </a>
          </label>
        </div>
        {errors.terms_accepted && (
          <p id="terms-error" className="mt-2 text-sm text-red-600" role="alert">
            {errors.terms_accepted.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="
          flex w-full items-center justify-center gap-2
          rounded-lg bg-orange-600 px-4 py-3 font-medium text-white
          transition-colors duration-200 hover:bg-orange-700 focus:outline-none focus:ring-2
          focus:ring-orange-500 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:bg-gray-400
        "
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Creando cuenta...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-5 w-5" />
            <span>Crear Cuenta</span>
          </>
        )}
      </button>
    </form>
  );
};

export default RegisterForm;
