import { UnauthorizedError, NotFoundError, ConflictError, ValidationError, ForbiddenError } from '@shared/exceptions';

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Credenciales invalidas', 'INVALID_CREDENTIALS');
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(identifier?: string) {
    super('Usuario', identifier);
  }
}

export class ProfileNotFoundError extends NotFoundError {
  constructor(identifier?: string) {
    super('Perfil', identifier);
  }
}

export class EmailAlreadyExistsError extends ConflictError {
  constructor(email?: string) {
    super(email ? `Email ${email} ya registrado` : 'Email ya registrado', 'EMAIL_ALREADY_EXISTS');
  }
}

export class SessionExpiredError extends UnauthorizedError {
  constructor() {
    super('Sesion expirada', 'SESSION_EXPIRED');
  }
}

export class InvalidRefreshTokenError extends UnauthorizedError {
  constructor() {
    super('Refresh token invalido o expirado', 'INVALID_REFRESH_TOKEN');
  }
}

export class WeakPasswordError extends ValidationError {
  constructor(reason: string = 'La nueva contrasena debe tener al menos 8 caracteres') {
    super(reason, 'WEAK_PASSWORD');
  }
}

export class SamePasswordError extends ValidationError {
  constructor() {
    super('La nueva contrasena debe ser diferente a la actual', 'SAME_PASSWORD');
  }
}

export class InactiveUserError extends UnauthorizedError {
  constructor() {
    super('Usuario no activo', 'INACTIVE_USER');
  }
}

export class NoActiveTenantError extends ValidationError {
  constructor() {
    super('No hay tenants activos en el sistema. Contacte al administrador.', 'NO_ACTIVE_TENANT');
  }
}

export class EmailAlreadyVerifiedError extends ConflictError {
  constructor() {
    super('Email ya verificado', 'EMAIL_ALREADY_VERIFIED');
  }
}

export class InvalidTokenError extends ValidationError {
  constructor(reason: string = 'Token invalido') {
    super(reason, 'INVALID_TOKEN');
  }
}

export class ExpiredTokenError extends ValidationError {
  constructor() {
    super('Token expirado', 'TOKEN_EXPIRED');
  }
}

export class UsedTokenError extends ValidationError {
  constructor() {
    super('Token ya usado', 'TOKEN_ALREADY_USED');
  }
}

export class InvalidPasswordError extends ValidationError {
  constructor(reason: string = 'Contrasena actual incorrecta') {
    super(reason, 'INVALID_PASSWORD');
  }
}

export class TwoFactorAlreadyEnabledError extends ConflictError {
  constructor() {
    super('2FA ya esta habilitado. Desactivalo primero para cambiar el metodo.', 'TWO_FACTOR_ALREADY_ENABLED');
  }
}

export class TwoFactorNotEnabledError extends ValidationError {
  constructor() {
    super('2FA no esta habilitado', 'TWO_FACTOR_NOT_ENABLED');
  }
}

export class TwoFactorPendingSetupNotFoundError extends NotFoundError {
  constructor() {
    super('Configuracion de 2FA pendiente');
  }
}

export class TwoFactorLockedError extends ForbiddenError {
  constructor(minutes: number) {
    super(`Demasiados intentos. Intenta de nuevo en ${minutes} minutos.`, 'TWO_FACTOR_LOCKED');
  }
}

export class TwoFactorInvalidCodeError extends UnauthorizedError {
  constructor() {
    super('Codigo incorrecto', 'TWO_FACTOR_INVALID_CODE');
  }
}

export class TwoFactorCodeExpiredError extends ValidationError {
  constructor() {
    super('El codigo ha expirado. Solicita uno nuevo.', 'TWO_FACTOR_CODE_EXPIRED');
  }
}

export class TwoFactorRateLimitError extends ValidationError {
  constructor() {
    super('Espera 1 minuto antes de solicitar otro codigo', 'TWO_FACTOR_RATE_LIMIT');
  }
}

export class SessionNotFoundError extends NotFoundError {
  constructor() {
    super('Sesion');
  }
}

export class ProfileSessionNotFoundError extends UnauthorizedError {
  constructor() {
    super('Perfil no encontrado', 'PROFILE_NOT_FOUND');
  }
}

export class EmailInUseError extends ConflictError {
  constructor() {
    super('Email ya esta en uso', 'EMAIL_IN_USE');
  }
}
