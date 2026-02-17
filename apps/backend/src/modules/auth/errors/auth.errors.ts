import { UnauthorizedError, NotFoundError, ConflictError, ValidationError } from '@shared/exceptions';

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
