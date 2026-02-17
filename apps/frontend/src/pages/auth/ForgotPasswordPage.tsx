/**
 * ForgotPasswordPage Component
 * Password reset request page
 *
 * Features:
 * - Simple email input form
 * - Email validation using Zod schema
 * - Success/error feedback
 * - Link back to login
 * - Responsive design
 *
 * Note: This is UI only for now. API integration will be added later.
 *
 * @example
 * ```tsx
 * // In App.tsx or router config
 * <Route path="/forgot-password" element={<ForgotPasswordPage />} />
 * ```
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/shared/schemas/auth.schemas';
import { passwordAPI } from '@/services/api/passwordAPI';

/**
 * ForgotPasswordPage Component
 */
export const ForgotPasswordPage: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  /**
   * Handle form submission
   * Integrates with real backend API endpoint
   */
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);

      // Call real API endpoint
      await passwordAPI.requestPasswordReset(data.email);

      setIsSuccess(true);
    } catch (err: unknown) {
      const errorPayload =
        err && typeof err === 'object'
          ? (err as { response?: { data?: { message?: string } }; message?: string })
          : {};
      const errorMessage =
        errorPayload.response?.data?.message ||
        errorPayload.message ||
        'Failed to send reset link. Please try again.';
      setError(errorMessage);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Check Your Email</h2>
            <p className="mb-6 text-gray-600">
              We've sent a password reset link to your email address. Please check your inbox and
              follow the instructions to reset your password.
            </p>
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
            </div>
            <Link
              to="/login"
              className="
                inline-flex w-full items-center justify-center
                gap-2 rounded-lg bg-orange-600 px-4 py-3 font-medium text-white
                transition-colors duration-200 hover:bg-orange-700 focus:outline-none focus:ring-2
                focus:ring-orange-500 focus:ring-offset-2
              "
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {/* Main Card */}
        <div className="mb-6 rounded-2xl bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Error Alert */}
            {error && (
              <div
                className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
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
                placeholder="you@example.com"
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
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 focus:underline focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
