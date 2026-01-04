import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { EmailInput } from '@features/auth/components/EmailInput';
import { FormErrorDisplay } from '@features/auth/components/FormErrorDisplay';
import {
  passwordRecoverySchema,
  PasswordRecoveryFormData,
} from '@features/auth/schemas/authSchemas';
import { passwordAPI } from '@/services/api/passwordAPI';
import { Target, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PasswordRecoveryFormData>({
    resolver: zodResolver(passwordRecoverySchema),
    mode: 'onChange',
  });

  const watchedEmail = watch('email', '');

  const onSubmit = async (data: PasswordRecoveryFormData) => {
    setLoading(true);
    setServerError('');

    try {
      await passwordAPI.requestPasswordReset(data.email);
      setEmailSent(true);
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message ||
        'Error al enviar el email. Intenta nuevamente.';
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar mensaje de éxito
  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-detective-bg to-detective-bg-secondary p-4">
        <DetectiveCard className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-detective-success" />
            <h2 className="text-detective-title mb-3 text-detective-success">Email Enviado</h2>
            <p className="text-detective-body mb-6 text-detective-text-secondary">
              Si el email existe en nuestro sistema, recibirás un enlace de recuperación en breve.
            </p>
            <p className="mb-6 text-detective-sm text-detective-text-secondary">
              Revisa tu bandeja de entrada y la carpeta de spam.
            </p>
            <DetectiveButton
              variant="primary"
              onClick={() => navigate('/login')}
              icon={<ArrowLeft className="h-5 w-5" />}
            >
              Volver al Login
            </DetectiveButton>
          </motion.div>
        </DetectiveCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-detective-bg to-detective-bg-secondary p-4">
      <DetectiveCard className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Target className="h-12 w-12 text-detective-orange" />
            <h1 className="text-4xl font-bold text-detective-orange">GAMILIT</h1>
          </div>
          <h2 className="text-detective-subtitle mb-2 text-detective-text">Recuperar Contraseña</h2>
          <p className="text-detective-text-secondary">
            Ingresa tu email y te enviaremos un enlace de recuperación
          </p>
        </div>

        {/* Server Errors */}
        {serverError && (
          <FormErrorDisplay errors={[serverError]} onDismiss={() => setServerError('')} />
        )}

        {/* Info Notice */}
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
          <p className="text-detective-sm text-blue-700">
            El enlace de recuperación será válido por 15 minutos
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-6">
            <EmailInput
              label="Email"
              placeholder="detective@glit.com"
              {...register('email')}
              value={watchedEmail}
              error={errors.email?.message}
              showValidation={true}
            />
          </div>

          <DetectiveButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!isValid || loading}
            className="mb-4 w-full"
            icon={<Mail className="h-5 w-5" />}
          >
            {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
          </DetectiveButton>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex w-full items-center justify-center gap-2 text-detective-text-secondary transition-colors hover:text-detective-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al login
          </button>
        </form>
      </DetectiveCard>
    </div>
  );
}
