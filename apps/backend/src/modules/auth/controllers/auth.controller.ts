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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService, SessionManagementService, SecurityService } from '../services';
import {
  RegisterUserDto,
  UserResponseDto,
  LoginDto,
  RefreshTokenDto,
} from '../dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

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
  ) {}

  /**
   * Registro de nuevo usuario
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  @ApiBody({ type: RegisterUserDto })
  async register(
    @Body() dto: RegisterUserDto,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    return await this.authService.register(dto, ip, userAgent);
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
    @Request() req: any,
  ): Promise<{ user: UserResponseDto; accessToken: string; refreshToken: string }> {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // 1. Verificar rate limiting
    const rateLimit = await this.securityService.checkRateLimit(dto.email, ip);
    if (rateLimit.isBlocked) {
      throw new UnauthorizedException(rateLimit.reason);
    }

    // 2. Autenticar
    return await this.authService.login(dto.email, dto.password, ip, userAgent);
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
  async logout(@Request() req: any): Promise<{ message: string }> {
    // Extraer userId y sessionId del token JWT
    const userId = req.user?.id;
    const sessionId = req.user?.sessionId || 'current-session';

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
    return await this.authService.refreshToken(dto.refreshToken);
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
  async getProfile(@Request() req: any): Promise<UserResponseDto> {
    // Extraer userId del token JWT
    const userId = req.user?.id;
    const user = await this.authService.validateUser(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Convertir a UserResponseDto (sin password)
    const { encrypted_password, ...userResponse } = user;
    return userResponse as UserResponseDto;
  }
}
