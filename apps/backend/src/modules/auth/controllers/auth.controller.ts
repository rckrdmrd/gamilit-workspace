import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Get,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService, SessionManagementService, SecurityService, EmailVerificationService, PasswordRecoveryService, TwoFactorAuthService } from '../services';
import {
  RegisterUserDto,
  UserResponseDto,
  LoginDto,
  RefreshTokenDto,
  UpdateProfileDto,
  UserSessionResponseDto,
  VerifyEmailDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
} from '../dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthRequest } from '@shared/types';

/**
 * AuthController
 *
 * @description Controlador de autenticación.
 *
 * @endpoints
 * - POST /api/auth/register - Registro de usuario
 * - POST /api/auth/login - Autenticación con email/password
 * - POST /api/auth/logout - Cerrar sesión
 * - POST /api/auth/refresh - Renovar access token
 * - GET /api/auth/profile - Obtener perfil del usuario autenticado
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionManagementService,
    private readonly securityService: SecurityService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordRecoveryService: PasswordRecoveryService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  /**
   * Registro de nuevo usuario
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario con auto-login' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente con tokens de autenticación',
    schema: {
      properties: {
        user: { type: 'object' },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  @ApiBody({ type: RegisterUserDto })
  async register(
    @Body() dto: RegisterUserDto,
      @Request() req: AuthRequest,
  ): Promise<{ user: UserResponseDto; accessToken: string; refreshToken: string }> {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.register(dto, ip, userAgent);
  }

  /**
   * Login de usuario
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autenticación de usuario',
    description: 'Rate limiting: 5 intentos fallidos por email en 15 minutos',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa',
    schema: {
      properties: {
        user: { type: 'object' },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos fallidos' })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() dto: LoginDto,
      @Request() req: AuthRequest,
  ): Promise<{ user: UserResponseDto; accessToken: string; refreshToken: string }> {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // 1. Verificar rate limiting
    const rateLimit = await this.securityService.checkRateLimit(dto.email, ip);
    if (rateLimit.isBlocked) {
      throw new UnauthorizedException(rateLimit.reason);
    }

    // 2. Autenticar
    return this.authService.login(dto.email, dto.password, ip, userAgent);
  }

  /**
   * Logout de usuario
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión de usuario' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async logout(@Request() req: AuthRequest): Promise<{ message: string }> {
    // Extraer userId y sessionId del token JWT
    const userId = req.user!.id;
    const sessionId = req.user!.sessionId || 'current-session';

    await this.authService.logout(userId, sessionId);
    return { message: 'Sesión cerrada exitosamente' };
  }

  /**
   * Renovar access token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token con refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token renovado exitosamente',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(
    @Body() dto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getProfile(@Request() req: AuthRequest): Promise<UserResponseDto> {
    // Extraer userId del token JWT
    const userId = req.user!.id;
    const user = await this.authService.validateUser(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // FIX BUG-005: Usar toUserResponse para incluir campos derivados (emailVerified, isActive)
    return this.authService.toUserResponse(user);
  }

  /**
   * Actualizar perfil del usuario autenticado
   */
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(
    @Request() req: AuthRequest,
      @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    // Extraer userId del token JWT
    const userId = req.user!.id;

    // Actualizar perfil usando el servicio de auth
    const updatedUser = await this.authService.updateUserProfile(userId, dto);

    if (!updatedUser) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // FIX BUG-005: Usar toUserResponse para incluir campos derivados (emailVerified, isActive)
    return this.authService.toUserResponse(updatedUser);
  }

  /**
   * Verificar email del usuario
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar email del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Email verificado exitosamente',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ message: string; verified: boolean }> {
    // P1-002: Conectado al EmailVerificationService
    return this.emailVerificationService.verifyEmail(dto);
  }

  /**
   * Solicitar reseteo de contraseña
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar reseteo de contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Email de reseteo enviado',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiBody({ type: RequestPasswordResetDto })
  async forgotPassword(@Body() dto: RequestPasswordResetDto): Promise<{ message: string }> {
    // P1-003: Conectado al PasswordRecoveryService
    return this.passwordRecoveryService.requestReset(dto);
  }

  /**
   * Resetear contraseña
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resetear contraseña con token' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña reseteada exitosamente',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    // P1-003: Conectado al PasswordRecoveryService
    return this.passwordRecoveryService.resetPassword(dto);
  }

  /**
   * Cambiar contraseña (usuario autenticado)
   */
  @Put('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña cambiada exitosamente',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 400, description: 'Contraseña actual incorrecta' })
  @ApiBody({
    schema: {
      properties: {
        currentPassword: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
  })
  async changePassword(
    @Request() req: AuthRequest,
      @Body('currentPassword') currentPassword: string,
      @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    const userId = req.user!.id;
    // P1-012: Conectado al AuthService.changePassword
    return this.authService.changePassword(userId, currentPassword, newPassword);
  }

  /**
   * Obtener sesiones activas del usuario
   */
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener sesiones activas del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de sesiones activas con información de dispositivo',
    type: UserSessionResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getSessions(@Request() req: AuthRequest): Promise<UserSessionResponseDto[]> {
    const userId = req.user!.id;
    return this.sessionService.getSessions(userId);
  }

  /**
   * Revocar sesión específica
   */
  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revocar sesión específica',
    description: 'Cierra una sesión activa del usuario autenticado. Solo puede cerrar sus propias sesiones.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada correctamente',
    schema: {
      properties: {
        message: { type: 'string', example: 'Sesión cerrada correctamente' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada o no pertenece al usuario' })
  async revokeSession(
    @Request() req: AuthRequest,
      @Param('sessionId') sessionId: string,
  ): Promise<{ message: string }> {
    const userId = req.user!.id;
    return this.sessionService.revokeSession(sessionId, userId);
  }

  /**
   * Revocar todas las sesiones excepto la actual
   */
  @Delete('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revocar todas las sesiones excepto la actual',
    description: 'Cierra todas las sesiones activas del usuario excepto la sesión desde la que se hace la solicitud.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesiones cerradas correctamente',
    schema: {
      properties: {
        message: { type: 'string', example: 'Sesiones cerradas correctamente' },
        count: { type: 'number', example: 3, description: 'Cantidad de sesiones cerradas' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async revokeAllSessions(@Request() req: AuthRequest): Promise<{ message: string; count: number }> {
    const userId = req.user!.id;
    const currentSessionId = req.user!.sessionId || 'unknown';
    return this.sessionService.revokeAllSessions(userId, currentSessionId);
  }

  // ============================================================================
  // TWO-FACTOR AUTHENTICATION ENDPOINTS (GAP-P0-001)
  // ============================================================================

  /**
   * Get 2FA status
   */
  @Get('2fa/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estado de 2FA' })
  @ApiResponse({
    status: 200,
    description: 'Estado de 2FA del usuario',
    schema: {
      properties: {
        enabled: { type: 'boolean' },
        method: { type: 'string', nullable: true },
      },
    },
  })
  async get2FAStatus(@Request() req: AuthRequest): Promise<{ enabled: boolean; method: string | null }> {
    const userId = req.user!.id;
    return this.twoFactorAuthService.getStatus(userId);
  }

  /**
   * Setup 2FA (initiate)
   */
  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar configuración de 2FA' })
  @ApiResponse({
    status: 200,
    description: 'Código de verificación enviado',
    schema: {
      properties: {
        message: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBody({
    schema: {
      properties: {
        method: { type: 'string', enum: ['email', 'sms', 'authenticator'] },
      },
    },
  })
  async setup2FA(
    @Request() req: AuthRequest,
    @Body('method') method: 'email' | 'sms' | 'authenticator',
  ): Promise<{ message: string; expiresAt: Date }> {
    const userId = req.user!.id;
    return this.twoFactorAuthService.setup2FA(userId, method || 'email');
  }

  /**
   * Verify 2FA setup (complete setup)
   */
  @Post('2fa/setup/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar y completar configuración de 2FA' })
  @ApiResponse({
    status: 200,
    description: '2FA habilitado, retorna códigos de respaldo',
    schema: {
      properties: {
        message: { type: 'string' },
        backupCodes: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiBody({
    schema: {
      properties: {
        code: { type: 'string', example: '123456' },
      },
    },
  })
  async verifySetup2FA(
    @Request() req: AuthRequest,
    @Body('code') code: string,
  ): Promise<{ message: string; backupCodes?: string[] }> {
    const userId = req.user!.id;
    return this.twoFactorAuthService.verifySetup(userId, code);
  }

  /**
   * Verify 2FA code (for login)
   */
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar código 2FA durante login' })
  @ApiResponse({
    status: 200,
    description: 'Código válido',
    schema: {
      properties: {
        valid: { type: 'boolean' },
      },
    },
  })
  @ApiBody({
    schema: {
      properties: {
        userId: { type: 'string' },
        code: { type: 'string' },
      },
    },
  })
  async verify2FA(
    @Body('userId') userId: string,
    @Body('code') code: string,
  ): Promise<{ valid: boolean }> {
    return this.twoFactorAuthService.verifyLoginOTP(userId, code);
  }

  /**
   * Disable 2FA
   */
  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deshabilitar 2FA' })
  @ApiResponse({
    status: 200,
    description: '2FA deshabilitado',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiBody({
    schema: {
      properties: {
        password: { type: 'string', description: 'Contraseña actual para confirmar' },
      },
    },
  })
  async disable2FA(
    @Request() req: AuthRequest,
    @Body('password') password: string,
  ): Promise<{ message: string }> {
    const userId = req.user!.id;
    // TODO: Validate password using AuthService before disabling
    return this.twoFactorAuthService.disable2FA(userId, password);
  }

  /**
   * Resend 2FA code
   */
  @Post('2fa/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenviar código 2FA' })
  @ApiResponse({
    status: 200,
    description: 'Código reenviado',
    schema: {
      properties: {
        message: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBody({
    schema: {
      properties: {
        userId: { type: 'string' },
      },
    },
  })
  async resend2FACode(
    @Body('userId') userId: string,
  ): Promise<{ message: string; expiresAt: Date }> {
    return this.twoFactorAuthService.resendOTP(userId);
  }
}
