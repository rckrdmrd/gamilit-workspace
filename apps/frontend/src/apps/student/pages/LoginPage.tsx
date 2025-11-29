import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { EmailInput } from '@features/auth/components/EmailInput';
import { PasswordInput } from '@features/auth/components/PasswordInput';
import { FormErrorDisplay } from '@features/auth/components/FormErrorDisplay';
import { loginSchema, LoginFormData } from '@features/auth/schemas/authSchemas';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useAuthStore } from '@features/auth/store/authStore';
import { Lock, AlertTriangle, Wifi, WifiOff, Ban, Clock } from 'lucide-react';
import { AccountInactiveError, AccountSuspendedError } from '@services/api/apiErrorHandler';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading: authLoading, error: authError } = useAuth();
  const [serverError, setServerError] = useState<string>('');
  const [accountStatusError, setAccountStatusError] = useState<{
    type: 'inactive' | 'suspended' | null;
    message: string;
    suspensionDetails?: {
      isPermanent: boolean;
      suspendedUntil?: string;
      reason?: string;
    };
  }>({ type: null, message: '' });
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const watchedEmail = watch('email', '');
  const watchedPassword = watch('password', '');

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    setAccountStatusError({ type: null, message: '' });

    try {
      // CRITICAL: Clear logout flag if present (user is now logging in)
      localStorage.removeItem('is_logging_out');

      // Use real authentication
      await login(data.email, data.password);

      // Login exitoso - Get user from store after successful login
      console.log('Login exitoso');

      // Get user from the auth store (now it should be populated)
      const { user: loggedInUser } = useAuthStore.getState();

      // Get user role from the store
      const userRole = loggedInUser?.role || 'student';

      console.log('🔍 Login exitoso - User role:', userRole);
      console.log('🔍 User object:', loggedInUser);

      // Redirect based on role (roles from database: 'student', 'admin_teacher', 'super_admin')
      switch (userRole) {
        case 'admin_teacher':
        case 'teacher': // Also handle 'teacher' as alias
          console.log('➡️ Redirigiendo a Teacher Dashboard');
          navigate('/teacher/dashboard');
          break;
        case 'super_admin':
        case 'admin': // Also handle 'admin' as alias
          console.log('➡️ Redirigiendo a Admin Dashboard');
          navigate('/admin/dashboard');
          break;
        case 'student':
        default:
          console.log('➡️ Redirigiendo a Student Dashboard');
          navigate('/dashboard');
          break;
      }
    } catch (error: unknown) {
      // Check for specific account status errors
      if (error instanceof AccountInactiveError) {
        setAccountStatusError({
          type: 'inactive',
          message:
            error.message || 'Tu cuenta ha sido desactivada. Por favor, contacta a tu maestro.',
        });
        return; // Don't count as failed login attempt
      }

      if (error instanceof AccountSuspendedError) {
        setAccountStatusError({
          type: 'suspended',
          message: error.message || 'Tu cuenta ha sido suspendida.',
          suspensionDetails: error.suspensionDetails,
        });
        return; // Don't count as failed login attempt
      }

      // Login fallido - other errors
      const errorMessage =
        error instanceof Error ? error.message : authError || 'Error de autenticación';
      setServerError(errorMessage);

      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      // Mostrar CAPTCHA después de 3 intentos fallidos
      if (newAttempts >= 3) {
        setShowCaptcha(true);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-4">
      {/* Connection Status Badge - Top Right */}
      <div className="absolute right-4 top-4">
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium shadow-lg ${
            isOnline
              ? 'border-2 border-green-200 bg-green-50 text-green-700'
              : 'border-2 border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {isOnline ? (
            <>
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <Wifi className="h-4 w-4" />
              <span>Conectado</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <WifiOff className="h-4 w-4" />
              <span>Sin conexión</span>
            </>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Login Card with enhanced shadow */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header with gradient background */}
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-orange-700 p-8 text-center">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="relative mb-4 inline-block rounded-full bg-white/10 p-4 backdrop-blur-sm"
            >
              <span className="text-5xl">🕵️‍♂️</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative mb-2 text-3xl font-bold text-white"
            >
              GAMILIT Detective Platform
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative text-orange-100"
            >
              Resuelve misterios mientras aprendes
            </motion.p>
          </div>

          {/* Form Container */}
          <div className="p-8">
            {/* Account Inactive Error */}
            {accountStatusError.type === 'inactive' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg border-2 border-amber-400 bg-amber-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <Ban className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-amber-900">Cuenta Desactivada</h3>
                    <p className="mb-2 text-sm text-amber-800">{accountStatusError.message}</p>
                    <p className="text-xs text-amber-700">
                      Si crees que esto es un error, contacta a tu maestro o al administrador del
                      sistema.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Account Suspended Error */}
            {accountStatusError.type === 'suspended' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg border-2 border-red-400 bg-red-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <Clock className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-red-900">
                      {accountStatusError.suspensionDetails?.isPermanent
                        ? 'Cuenta Suspendida Permanentemente'
                        : 'Cuenta Suspendida Temporalmente'}
                    </h3>
                    {accountStatusError.suspensionDetails?.suspendedUntil && (
                      <p className="mb-1 text-sm text-red-800">
                        Suspendida hasta:{' '}
                        <strong>
                          {new Date(
                            accountStatusError.suspensionDetails.suspendedUntil,
                          ).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </strong>
                      </p>
                    )}
                    {accountStatusError.suspensionDetails?.reason && (
                      <p className="mb-2 text-sm text-red-800">
                        <strong>Razón:</strong> {accountStatusError.suspensionDetails.reason}
                      </p>
                    )}
                    <p className="text-xs text-red-700">
                      {accountStatusError.suspensionDetails?.isPermanent
                        ? 'Para más información, contacta al soporte técnico.'
                        : 'Podrás acceder a tu cuenta una vez que finalice el período de suspensión.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rate Limiting Warning */}
            {failedAttempts > 0 && failedAttempts < 3 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                <p className="text-detective-sm text-amber-700">
                  {3 - failedAttempts} {failedAttempts === 2 ? 'intento' : 'intentos'} restantes
                  antes del bloqueo temporal
                </p>
              </motion.div>
            )}

            {/* Server Errors */}
            {serverError && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <FormErrorDisplay errors={[serverError]} onDismiss={() => setServerError('')} />
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-4"
              >
                <EmailInput
                  label="Email"
                  placeholder="detective@gamilit.com"
                  {...register('email')}
                  value={watchedEmail}
                  error={errors.email?.message}
                  showValidation={true}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mb-4"
              >
                <PasswordInput
                  label="Contraseña"
                  placeholder="••••••••"
                  {...register('password')}
                  value={watchedPassword}
                  error={errors.password?.message}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6 flex items-center justify-between"
              >
                <label className="flex cursor-pointer items-center gap-2 text-sm text-detective-text transition-colors hover:text-detective-orange">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="rounded border-amber-200 text-detective-orange focus:ring-2 focus:ring-detective-orange"
                  />
                  Recordarme
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/password-recovery')}
                  className="text-sm font-medium text-detective-orange transition-colors hover:text-detective-orange-dark"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </motion.div>

              {/* CAPTCHA Placeholder */}
              {showCaptcha && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 rounded-lg border border-gray-300 bg-gray-100 p-4 text-center"
                >
                  <p className="text-detective-sm text-detective-text-secondary">
                    [CAPTCHA Placeholder - Integrar en producción]
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <DetectiveButton
                  type="submit"
                  variant="primary"
                  loading={authLoading}
                  disabled={!isValid || authLoading}
                  className="w-full shadow-lg transition-shadow hover:shadow-xl"
                  icon={<Lock className="h-5 w-5" />}
                >
                  {authLoading ? 'Verificando...' : 'Iniciar Sesión'}
                </DetectiveButton>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-detective-text-secondary">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="font-semibold text-detective-orange transition-colors hover:text-detective-orange-dark"
                  >
                    Únete al equipo
                  </button>
                </p>
              </motion.div>
            </form>

            {/* Test Credentials Helper (solo desarrollo) */}
            {import.meta.env.DEV && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4"
              >
                <p className="mb-2 text-detective-sm font-semibold text-blue-800">
                  🔑 Credenciales de prueba (Backend real):
                </p>
                <div className="space-y-2 text-detective-xs text-blue-700">
                  <div className="rounded bg-white/60 p-2">
                    <strong>👨‍🎓 Alumno:</strong>
                    <br />
                    Email: student@gamilit.com
                    <br />
                    Password: Test1234
                  </div>
                  <div className="rounded bg-white/60 p-2">
                    <strong>👩‍🏫 Maestro:</strong>
                    <br />
                    Email: teacher@gamilit.com
                    <br />
                    Password: Test1234
                  </div>
                  <div className="rounded bg-white/60 p-2">
                    <strong>🔐 Admin:</strong>
                    <br />
                    Email: admin@gamilit.com
                    <br />
                    Password: Test1234
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          © 2025 Gamilit Platform. Todos los derechos reservados.
        </motion.p>
      </motion.div>
    </div>
  );
}
