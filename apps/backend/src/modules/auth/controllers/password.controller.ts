import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { PasswordRecoveryService, EmailVerificationService } from '../services';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ChangePasswordDto,
} from '../dto';
import { API_ROUTES, extractBasePath } from '@/shared/constants';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';

/**
 * PasswordController
 *
 * @description Controlador de recuperación de contraseña y verificación de email.
 *
 * @endpoints
 * - POST /auth/reset-password/request - Solicitar reset de password
 * - POST /auth/reset-password - Resetear password con token
 * - PUT /auth/change-password - Cambiar contraseña (usuario autenticado)
 * - POST /auth/verify-email - Verificar email con token
 * - POST /auth/verify-email/resend - Reenviar email de verificación
 * - GET /auth/verify-email/status - Consultar estado de verificación
 */
@ApiTags('Authentication')
@Controller(extractBasePath(API_ROUTES.AUTH.BASE))
export class PasswordController {
  constructor(
    private readonly passwordRecoveryService: PasswordRecoveryService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Solicitar reset de contraseña
   */
  @Post('reset-password/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar reset de contraseña',
    description: 'Envía email con token de recuperación. Siempre retorna 200 (no revela si email existe)',
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado si el correo existe en el sistema',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiBody({ type: RequestPasswordResetDto })
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    return this.passwordRecoveryService.requestReset(dto);
  }

  /**
   * Resetear contraseña con token
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resetear contraseña con token',
    description: 'Valida token y actualiza contraseña. Invalida todas las sesiones.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.passwordRecoveryService.resetPassword(dto);
  }

  /**
   * Cambiar contraseña (usuario autenticado)
   *
   * @description
   * Permite a un usuario autenticado cambiar su contraseña.
   * Requiere JWT válido y proporcionar contraseña actual.
   *
   * @requires JwtAuthGuard - Usuario debe estar autenticado
   *
   * @param req - Request object con user.id del JWT
   * @param dto - ChangePasswordDto con current_password y new_password
   *
   * @returns Mensaje de confirmación
   *
   * @throws UnauthorizedException - No autenticado o usuario no encontrado
   * @throws BadRequestException - Contraseña actual incorrecta
   * @throws BadRequestException - Nueva contraseña inválida
   */
  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar contraseña (usuario autenticado)',
    description: 'Cambia la contraseña del usuario actual. Requiere autenticación JWT y contraseña actual.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada correctamente',
    schema: {
      properties: {
        message: { type: 'string', example: 'Contraseña actualizada correctamente' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Contraseña actual incorrecta o nueva contraseña inválida' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Request() req: any,
      @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // Extraer userId del token JWT
    const userId = req.user?.id;
    return this.authService.changePassword(
      userId,
      dto.current_password,
      dto.new_password,
    );
  }

  /**
   * Verificar email con token
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar email con token',
    description: 'Valida token y marca email como verificado',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verificado exitosamente',
    schema: {
      properties: {
        message: { type: 'string' },
        verified: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Token inválido, expirado o ya usado' })
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
  ): Promise<{ message: string; verified: boolean }> {
    return this.emailVerificationService.verifyEmail(dto);
  }

  /**
   * Reenviar email de verificación
   */
  @Post('verify-email/resend')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reenviar email de verificación',
    description: 'Genera nuevo token y envía email de verificación',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de verificación enviado',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 409, description: 'Email ya verificado' })
  async resendVerification(@Request() req: any): Promise<{ message: string }> {
    // Extraer userId del token JWT
    const userId = req.user?.id;
    return this.emailVerificationService.resendVerification(userId);
  }

  /**
   * Consultar estado de verificación
   */
  @Get('verify-email/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar estado de verificación de email',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de verificación',
    schema: {
      properties: {
        verified: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async checkVerificationStatus(@Request() req: any): Promise<{ verified: boolean }> {
    // Extraer userId del token JWT
    const userId = req.user?.id;
    return this.emailVerificationService.checkVerificationStatus(userId);
  }
}
