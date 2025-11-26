/**
 * DEPRECATED: EmailVerificationPage
 *
 * This page is deprecated as email verification is no longer required.
 * All user accounts are now automatically verified upon registration.
 *
 * This page is kept for backward compatibility with old email links
 * and displays an informational message to users.
 *
 * @deprecated Since 2025-10 - Email verification disabled
 */

import { useNavigate } from 'react-router-dom';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Target, CheckCircle2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmailVerificationPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-detective-bg to-detective-bg-secondary p-4">
      <DetectiveCard className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Target className="h-12 w-12 text-detective-orange" />
            <h1 className="text-4xl font-bold text-detective-orange">GAMILIT</h1>
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-8 text-center"
        >
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-detective-success" />

          <h2 className="text-detective-title mb-4 text-detective-text">
            Verificación No Requerida
          </h2>

          <p className="text-detective-body mb-6 text-detective-text-secondary">
            La verificación de email ya no es necesaria. Todas las cuentas están automáticamente
            verificadas.
          </p>

          {/* Info Notice */}
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
            <p className="text-left text-detective-sm text-blue-700">
              Puedes iniciar sesión directamente con tu cuenta. Ya no es necesario verificar tu
              email.
            </p>
          </div>

          <DetectiveButton variant="primary" onClick={() => navigate('/login')} className="w-full">
            Ir al Login
          </DetectiveButton>

          <button
            onClick={() => navigate('/dashboard')}
            className="mt-3 w-full text-detective-text-secondary transition-colors hover:text-detective-text"
          >
            Ir al Dashboard
          </button>
        </motion.div>
      </DetectiveCard>
    </div>
  );
}

/*
 * LEGACY CODE (Preserved for reference - can be removed in future cleanup)
 * -----------------------------------------------------------------------
 *
 * Previous implementation included:
 * - Token-based email verification
 * - Resend verification email functionality
 * - Error handling for verification failures
 *
 * This functionality is no longer needed as:
 * 1. Users are automatically verified on registration
 * 2. Backend endpoints are deprecated
 * 3. Email verification flow is disabled
 */
