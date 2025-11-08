/**
 * Auth Validation Schemas
 * Zod schemas for authentication form validation
 *
 * These schemas enforce:
 * - Email format validation
 * - Password complexity requirements
 * - Password confirmation matching
 * - Terms acceptance
 *
 * @requires zod - Install with: npm install zod @hookform/resolvers
 */

import { z } from 'zod';

/**
 * Password validation regex patterns
 */
const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*(),.?":{}|<>]/,
};

/**
 * Login Schema
 * Validates user login credentials
 *
 * Fields:
 * - email: Must be a valid email format
 * - password: Minimum 8 characters (no complexity required for login)
 *
 * @example
 * ```typescript
 * const formData = loginSchema.parse({
 *   email: "user@example.com",
 *   password: "password123"
 * });
 * ```
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

/**
 * Register Schema
 * Validates new user registration data with password complexity rules
 *
 * Fields:
 * - email: Valid email format, required
 * - password: Min 8 chars, must contain uppercase, lowercase, number, and special char
 * - confirmPassword: Must match password
 * - full_name: Optional, min 2 characters if provided
 * - role: Optional, must be one of: student, admin_teacher, super_admin
 * - terms_accepted: Must be true (required checkbox)
 *
 * @example
 * ```typescript
 * const formData = registerSchema.parse({
 *   email: "user@example.com",
 *   password: "SecurePass123!",
 *   confirmPassword: "SecurePass123!",
 *   full_name: "John Doe",
 *   role: "student",
 *   terms_accepted: true
 * });
 * ```
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        PASSWORD_REGEX.uppercase,
        'Password must contain at least one uppercase letter'
      )
      .regex(
        PASSWORD_REGEX.lowercase,
        'Password must contain at least one lowercase letter'
      )
      .regex(
        PASSWORD_REGEX.number,
        'Password must contain at least one number'
      )
      .regex(
        PASSWORD_REGEX.special,
        'Password must contain at least one special character (!@#$%^&*...)'
      ),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),

    full_name: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .optional()
      .or(z.literal('')),

    role: z
      .enum(['student', 'admin_teacher', 'super_admin'], {
        errorMap: () => ({ message: 'Please select a valid role' }),
      })
      .optional(),

    terms_accepted: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must accept the terms and conditions',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Forgot Password Schema
 * Validates email for password reset requests
 *
 * @example
 * ```typescript
 * const formData = forgotPasswordSchema.parse({
 *   email: "user@example.com"
 * });
 * ```
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

/**
 * Reset Password Schema
 * Validates new password and confirmation for password reset
 *
 * @example
 * ```typescript
 * const formData = resetPasswordSchema.parse({
 *   password: "NewSecurePass123!",
 *   confirmPassword: "NewSecurePass123!"
 * });
 * ```
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        PASSWORD_REGEX.uppercase,
        'Password must contain at least one uppercase letter'
      )
      .regex(
        PASSWORD_REGEX.lowercase,
        'Password must contain at least one lowercase letter'
      )
      .regex(
        PASSWORD_REGEX.number,
        'Password must contain at least one number'
      )
      .regex(
        PASSWORD_REGEX.special,
        'Password must contain at least one special character'
      ),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Type exports for form data
 * Use these types with React Hook Form
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Password strength calculator
 * Returns strength level and score for password validation feedback
 *
 * @param password - The password to evaluate
 * @returns Object with strength level and score (0-4)
 *
 * @example
 * ```typescript
 * const strength = calculatePasswordStrength("MyPass123!");
 * // Returns: { strength: "strong", score: 4 }
 * ```
 */
export const calculatePasswordStrength = (
  password: string
): { strength: 'weak' | 'medium' | 'strong'; score: number } => {
  let score = 0;

  if (!password) return { strength: 'weak', score: 0 };

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexity checks
  if (PASSWORD_REGEX.uppercase.test(password)) score++;
  if (PASSWORD_REGEX.lowercase.test(password)) score++;
  if (PASSWORD_REGEX.number.test(password)) score++;
  if (PASSWORD_REGEX.special.test(password)) score++;

  // Determine strength level
  if (score <= 2) return { strength: 'weak', score };
  if (score <= 4) return { strength: 'medium', score };
  return { strength: 'strong', score };
};
