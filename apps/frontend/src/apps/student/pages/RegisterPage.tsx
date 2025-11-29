import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { InputDetective } from '@shared/components/base/InputDetective';
import { EmailInput } from '@features/auth/components/EmailInput';
import { PasswordInput } from '@features/auth/components/PasswordInput';
import { FormErrorDisplay } from '@features/auth/components/FormErrorDisplay';
import { registerSchema, RegisterFormData } from '@features/auth/schemas/authSchemas';
import { useAuthStore } from '@features/auth/store/authStore';
import { schoolsAPI, School } from '@/services/api/schoolsAPI';
import { Target, UserPlus, User, CheckCircle2, School as SchoolIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const watchedFullName = watch('fullName', '');
  const watchedEmail = watch('email', '');
  const watchedPassword = watch('password', '');
  const watchedConfirmPassword = watch('confirmPassword', '');

  // Fetch schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoadingSchools(true);
        const schoolsList = await schoolsAPI.getSchools();
        setSchools(schoolsList);
      } catch (error) {
        console.error('Error loading schools:', error);
        // Don't block registration if schools fail to load
      } finally {
        setLoadingSchools(false);
      }
    };

    fetchSchools();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setServerError('');

    try {
      // Use real API via authStore instead of mockRegister
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: true,
        schoolId: data.schoolId, // Include selected school if any
      });

      setRegistrationSuccess(true);
      // Auto-redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error de conexión. Intenta nuevamente.';
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar mensaje de éxito
  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-detective-bg to-detective-bg-secondary p-4">
        <DetectiveCard className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-detective-success" />
            <h2 className="text-detective-title mb-3 text-detective-success">Cuenta Creada</h2>
            <p className="text-detective-body mb-4 text-detective-text-secondary">
              Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión.
            </p>
            <p className="text-detective-sm text-detective-text-secondary">
              Redirigiendo a inicio de sesión...
            </p>
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
          <p className="text-detective-text-secondary">Únete a la academia de detectives</p>
        </div>

        {/* Server Errors */}
        {serverError && (
          <FormErrorDisplay errors={[serverError]} onDismiss={() => setServerError('')} />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <InputDetective
              type="text"
              label="Nombre Completo"
              placeholder="Marie Curie"
              {...register('fullName')}
              value={watchedFullName}
              error={errors.fullName?.message}
              icon={<User className="h-5 w-5" />}
            />
          </div>

          <div className="mb-4">
            <EmailInput
              label="Email"
              placeholder="detective@glit.com"
              {...register('email')}
              value={watchedEmail}
              error={errors.email?.message}
              showValidation={true}
            />
          </div>

          <div className="mb-4">
            <PasswordInput
              label="Contraseña"
              placeholder="••••••••"
              {...register('password')}
              value={watchedPassword}
              error={errors.password?.message}
              showStrengthMeter={true}
              showCriteria={true}
            />
          </div>

          <div className="mb-4">
            <PasswordInput
              label="Confirmar Contraseña"
              placeholder="••••••••"
              {...register('confirmPassword')}
              value={watchedConfirmPassword}
              error={errors.confirmPassword?.message}
              showStrengthMeter={false}
            />
          </div>

          {/* School Selection - Optional */}
          <div className="mb-4">
            <label htmlFor="schoolId" className="text-detective-body mb-2 block font-medium">
              Escuela (Opcional)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-detective-text-secondary">
                <SchoolIcon className="h-5 w-5" />
              </div>
              <select
                id="schoolId"
                {...register('schoolId')}
                disabled={loadingSchools}
                className="input-detective input-detective-md w-full appearance-none bg-white pl-10"
              >
                <option value="">
                  {loadingSchools ? 'Cargando escuelas...' : 'Selecciona tu escuela (opcional)'}
                </option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name} {school.city ? `- ${school.city}` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-detective-text-secondary">
                <svg
                  className="h-4 w-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {errors.schoolId && (
              <p className="mt-1 text-detective-sm text-detective-danger">
                {errors.schoolId.message}
              </p>
            )}
            <p className="mt-1 text-detective-sm text-detective-text-secondary">
              Puedes seleccionar tu escuela ahora o agregarla más tarde en tu perfil
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-6">
            <label className="flex cursor-pointer items-start gap-2 text-sm text-detective-text">
              <input
                type="checkbox"
                {...register('acceptTerms')}
                className="mt-0.5 flex-shrink-0 rounded border-amber-200 text-detective-orange focus:ring-detective-orange"
              />
              <span>
                Acepto los{' '}
                <button
                  type="button"
                  className="text-detective-orange underline hover:text-detective-orange-dark"
                  onClick={() => window.open('/terms', '_blank')}
                >
                  términos y condiciones
                </button>{' '}
                y la{' '}
                <button
                  type="button"
                  className="text-detective-orange underline hover:text-detective-orange-dark"
                  onClick={() => window.open('/privacy', '_blank')}
                >
                  política de privacidad
                </button>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="mt-1 text-detective-sm text-detective-danger">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          <DetectiveButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!isValid || loading}
            className="w-full"
            icon={<UserPlus className="h-5 w-5" />}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </DetectiveButton>

          <div className="mt-6 text-center">
            <p className="text-sm text-detective-text-secondary">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-semibold text-detective-orange transition-colors hover:text-detective-orange-dark"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </form>
      </DetectiveCard>
    </div>
  );
}
