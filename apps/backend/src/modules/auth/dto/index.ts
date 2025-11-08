/**
 * Auth DTOs - Barrel Exports
 *
 * @description Exporta todos los DTOs del módulo auth
 * @usage import { RegisterUserDto, UserResponseDto, CreateProfileDto, UpdateProfileDto, ProfileResponseDto, AssignRoleDto, UserRoleResponseDto, CreateAuthProviderDto, AuthProviderResponseDto, CreateMembershipDto, UpdateMembershipDto, MembershipResponseDto } from '@/modules/auth/dto';
 */

export * from './register-user.dto';
export * from './user-response.dto';
export * from './login.dto';
export * from './refresh-token.dto';
export * from './create-profile.dto';
export * from './update-profile.dto';
export * from './profile-response.dto';
export * from './user-preferences.schema';
export * from './assign-role.dto';
export * from './user-role-response.dto';
export * from './create-auth-provider.dto';
export * from './auth-provider-response.dto';
export * from './create-membership.dto';
export * from './update-membership.dto';
export * from './membership-response.dto';

// AuthAttempt DTOs
export * from './create-auth-attempt.dto';
export * from './auth-attempt-response.dto';

// UserSession DTOs
export * from './create-user-session.dto';
export * from './update-user-session.dto';
export * from './user-session-response.dto';

// EmailVerificationToken DTOs
export * from './create-email-verification-token.dto';
export * from './verify-email.dto';
export * from './email-verification-token-response.dto';

// PasswordResetToken DTOs
export * from './create-password-reset-token.dto';
export * from './reset-password.dto';
export * from './request-password-reset.dto';
export * from './password-reset-token-response.dto';
