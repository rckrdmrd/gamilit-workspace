import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
// import { UsersService } from '../users/users.service'; // TODO: Implementar UsersService
import { LoginDto, RefreshTokenDto } from './dto';
// import { RegisterDto } from './dto'; // TODO: RegisterDto no exportado
// import { TokenResponse, AuthResponse } from './types'; // TODO: Crear archivo types

// Interfaces temporales hasta crear ./types
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthResponse {
  user: any;
  tokens: TokenResponse;
}

/**
 * Auth Service
 *
 * ISSUE: #9 (P1) - Implementar Refresh Token
 * FECHA: 2025-11-04
 * SPRINT: Sprint 0 - Día 2
 *
 * Gestiona autenticación con JWT (access + refresh tokens)
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {}

  /**
   * Registro de nuevo usuario
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Verificar si email ya existe
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Crear usuario
    const user = await this.usersService.create({
      ...dto,
      password: passwordHash
    });

    // Generar tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  /**
   * Login de usuario
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    // Buscar usuario
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Actualizar last_login
    await this.usersService.updateLastLogin(user.id);

    // Generar tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  /**
   * Refresh Token - NUEVO ✅
   *
   * Permite renovar el access token usando un refresh token válido
   * sin requerir re-autenticación.
   */
  async refreshToken(dto: RefreshTokenDto): Promise<TokenResponse> {
    try {
      // Verificar refresh token
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      });

      // Buscar usuario
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.is_active) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generar nuevos tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout - Invalida tokens (client-side)
   */
  async logout(userId: string): Promise<{ message: string }> {
    // TODO: Implementar blacklist de tokens en Redis (opcional)
    // Por ahora, el logout es client-side (eliminar tokens de localStorage)

    return { message: 'Logged out successfully' };
  }

  /**
   * Validar usuario (usado por JWT Strategy)
   */
  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Generar Access Token y Refresh Token
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: string
  ): Promise<TokenResponse> {
    const payload = { sub: userId, email, role };

    // Access Token (15 minutos)
    const jwtExpiration = this.configService.get<string>('JWT_EXPIRATION') || '15m';
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: jwtExpiration as any
    });

    // Refresh Token (7 días)
    const jwtRefreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: jwtRefreshExpiration as any
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 minutos en segundos
    };
  }

  /**
   * Remover campos sensibles del usuario
   */
  private sanitizeUser(user: any) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
