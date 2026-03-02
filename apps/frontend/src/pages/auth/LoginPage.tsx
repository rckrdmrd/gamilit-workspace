/**
 * LoginPage Component - Detective Theme
 * Authentication page for user login with detective theme styling
 *
 * Features:
 * - Detective-themed gradient background (orange tones)
 * - Detective emoji and branding
 * - LoginForm component integration
 * - Responsive mobile-first design
 * - Framer Motion animations
 *
 * @example
 * ```tsx
 * <Route path="/login" element={<LoginPage />} />
 * ```
 */

import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginForm from '@/features/auth/components/LoginForm';
import { BrandingContext } from '@/app/providers/BrandingProvider';
import { DEFAULT_BRANDING } from '@/shared/types/branding.types';

/**
 * LoginPage Component
 */
export const LoginPage = () => {
  const branding = useContext(BrandingContext);
  const platformName = branding?.config?.platformName ?? DEFAULT_BRANDING.platformName;
  const logoUrl = branding?.config?.logoUrl ?? DEFAULT_BRANDING.logoUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Detective Theme */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-8 text-center relative overflow-hidden">
            {/* Decorative overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

            {/* Detective Emoji */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="relative inline-block p-4 bg-white/10 backdrop-blur-sm rounded-full mb-4"
            >
              {logoUrl ? (
                <img src={logoUrl} alt={platformName} className="h-60 w-60 object-contain" />
              ) : (
                <span className="text-9xl">🕵️‍♂️</span>
              )}
            </motion.div>

            {/* Slogan */}
            <p className="relative text-sm font-medium text-white/80">LEE Y GANA</p>
          </div>

          {/* Form Container */}
          <div className="p-8">
            <LoginForm
              redirectTo="/dashboard"
              showRememberMe={true}
              showForgotPassword={true}
            />
          </div>
        </div>

        {/* Registration Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-gray-700">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-orange-600 hover:text-orange-700 focus:outline-none focus:underline transition-colors"
            >
              Regístrate gratis
            </Link>
          </p>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
            <a
              href="/terms"
              className="hover:text-orange-600 focus:outline-none focus:underline transition-colors"
            >
              Términos
            </a>
            <span>&bull;</span>
            <a
              href="/privacy"
              className="hover:text-orange-600 focus:outline-none focus:underline transition-colors"
            >
              Privacidad
            </a>
            <span>&bull;</span>
            <a
              href="/help"
              className="hover:text-orange-600 focus:outline-none focus:underline transition-colors"
            >
              Ayuda
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
