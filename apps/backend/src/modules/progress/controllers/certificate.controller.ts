import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  NotFoundException,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CertificateService } from '../services/certificate.service';
import {
  GenerateCertificateDto,
  RevokeCertificateDto,
  CertificateResponseDto,
  CertificateVerificationDto,
  GetCertificatesQueryDto,
} from '../dto/certificate.dto';
import { CertificateStatus } from '../enums/certificate.enums';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { Public } from '@shared/decorators/public.decorator';
import { GamilityRoleEnum } from '@shared/constants';

/**
 * CertificateController
 *
 * @description Gestión de certificados digitales para estudiantes.
 * Permite generar, verificar, descargar y revocar certificados.
 *
 * Security:
 * - Requiere autenticación JWT (excepto verificación pública)
 * - Endpoints sensibles requieren rol admin_teacher o super_admin
 * - El endpoint verify/:code es público para verificación QR
 *
 * @route /api/v1/certificates
 *
 * @see EPIC 10.2 - Digital Certificates System
 */
@ApiTags('Certificates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  /**
   * Genera un certificado de completación de módulo
   *
   * @param dto - Datos para generar el certificado
   * @returns Certificado generado con código de verificación
   *
   * @example
   * POST /api/v1/certificates/generate
   * Request: {
   *   "user_id": "550e8400-e29b-41d4-a716-446655440000",
   *   "module_id": "660e8400-e29b-41d4-a716-446655440000"
   * }
   */
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate module completion certificate',
    description:
      'Genera un certificado digital cuando un estudiante completa un módulo. ' +
      'Incluye código QR para verificación, métricas de desempeño y PDF descargable.',
  })
  @ApiResponse({
    status: 201,
    description: 'Certificado generado exitosamente',
    type: CertificateResponseDto,
    schema: {
      example: {
        id: '990e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        module_id: '660e8400-e29b-41d4-a716-446655440000',
        certificate_type: 'module_completion',
        title: 'Certificado de Completación',
        student_name: 'Juan Pérez García',
        achievement_name: 'Comprensión Literal - Nivel 1',
        verification_code: 'CERT-ABCD-1234-EFGH',
        verification_url: 'https://gamilit.com/verify/CERT-ABCD-1234-EFGH',
        final_score: 92.5,
        total_xp_earned: 500,
        total_ml_coins_earned: 250,
        status: 'issued',
        issued_at: '2025-01-15T10:00:00Z',
        pdf_url: 'https://storage.gamilit.com/certificates/cert-123.pdf',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o módulo no completado',
    schema: {
      example: {
        statusCode: 400,
        message: 'Module is not completed yet',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o módulo no encontrado',
  })
  async generateCertificate(
    @Body() dto: GenerateCertificateDto,
  ): Promise<CertificateResponseDto> {
    const certificate = await this.certificateService.generateModuleCertificate(
      dto.user_id,
      dto.module_id,
      dto.tenant_id,
      dto.classroom_id,
    );
    return certificate as unknown as CertificateResponseDto;
  }

  /**
   * Verifica la autenticidad de un certificado
   *
   * @param code - Código de verificación (CERT-XXXX-XXXX-XXXX)
   * @returns Resultado de la verificación con datos del certificado
   *
   * @security Este endpoint es PÚBLICO para permitir verificación por QR
   *
   * @example
   * GET /api/v1/certificates/verify/CERT-ABCD-1234-EFGH
   */
  @Get('verify/:code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify certificate authenticity',
    description:
      'Verifica si un certificado es auténtico usando su código de verificación. ' +
      'Útil para validar certificados escaneando el código QR.',
  })
  @ApiParam({
    name: 'code',
    description: 'Código de verificación del certificado (formato: CERT-XXXX-XXXX-XXXX)',
    type: String,
    required: true,
    example: 'CERT-ABCD-1234-EFGH',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la verificación',
    type: CertificateVerificationDto,
    schema: {
      example: {
        is_valid: true,
        certificate: {
          id: '990e8400-e29b-41d4-a716-446655440000',
          student_name: 'Juan Pérez García',
          achievement_name: 'Comprensión Literal - Nivel 1',
          final_score: 92.5,
          status: 'issued',
          issued_at: '2025-01-15T10:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Certificado no encontrado',
  })
  async verifyCertificate(
    @Param('code') code: string,
  ): Promise<CertificateVerificationDto> {
    return this.certificateService.verifyCertificate(code);
  }

  /**
   * Obtiene los certificados de un usuario
   *
   * @param userId - ID del usuario (UUID)
   * @param query - Parámetros de filtrado y paginación
   * @returns Lista de certificados del usuario
   *
   * @example
   * GET /api/v1/certificates/users/550e8400-e29b-41d4-a716-446655440000?status=issued
   */
  @Get('users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user certificates',
    description:
      'Obtiene todos los certificados de un usuario con opciones de filtrado por estado y tipo.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario en formato UUID',
    type: String,
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'status',
    description: 'Filtrar por estado del certificado',
    enum: CertificateStatus,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Límite de resultados (1-100)',
    type: Number,
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset para paginación',
    type: Number,
    required: false,
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de certificados obtenida exitosamente',
    type: [CertificateResponseDto],
    schema: {
      example: [
        {
          id: '990e8400-e29b-41d4-a716-446655440000',
          student_name: 'Juan Pérez García',
          achievement_name: 'Comprensión Literal - Nivel 1',
          verification_code: 'CERT-ABCD-1234-EFGH',
          final_score: 92.5,
          status: 'issued',
          issued_at: '2025-01-15T10:00:00Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getUserCertificates(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: GetCertificatesQueryDto,
  ): Promise<CertificateResponseDto[]> {
    const certificates = await this.certificateService.getUserCertificates(
      userId,
      query.status,
    );
    return certificates as unknown as CertificateResponseDto[];
  }

  /**
   * Obtiene un certificado por ID
   *
   * @param id - ID del certificado (UUID)
   * @returns Datos completos del certificado
   *
   * @example
   * GET /api/v1/certificates/990e8400-e29b-41d4-a716-446655440000
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get certificate by ID',
    description: 'Obtiene los datos completos de un certificado específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del certificado en formato UUID',
    type: String,
    required: true,
    example: '990e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Certificado obtenido exitosamente',
    type: CertificateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Certificado no encontrado',
  })
  async getCertificateById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CertificateResponseDto> {
    const certificate = await this.certificateService.getCertificateById(id);
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
    return certificate as unknown as CertificateResponseDto;
  }

  /**
   * Descarga el PDF de un certificado
   *
   * @param id - ID del certificado (UUID)
   * @param res - Response object para streaming
   * @returns PDF del certificado
   *
   * @example
   * GET /api/v1/certificates/990e8400-e29b-41d4-a716-446655440000/download
   */
  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Download certificate PDF',
    description: 'Descarga el PDF del certificado. El PDF incluye código QR para verificación.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del certificado en formato UUID',
    type: String,
    required: true,
    example: '990e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF del certificado',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Certificado no encontrado',
  })
  async downloadCertificate(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const certificate = await this.certificateService.getCertificateById(id);
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    // Generate PDF buffer
    const pdfBuffer = await this.certificateService.getCertificatePdfBuffer(id);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate-${certificate.verification_code}.pdf"`,
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  }

  /**
   * Revoca un certificado
   *
   * @param id - ID del certificado (UUID)
   * @param dto - Razón de la revocación
   * @returns Certificado revocado
   *
   * @security Requiere rol admin_teacher o super_admin
   *
   * @example
   * POST /api/v1/certificates/990e8400-e29b-41d4-a716-446655440000/revoke
   * Request: { "reason": "El estudiante fue removido del curso" }
   */
  @Post(':id/revoke')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke certificate',
    description:
      'Revoca un certificado previamente emitido. ' +
      'El certificado ya no será válido para verificación.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del certificado en formato UUID',
    type: String,
    required: true,
    example: '990e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Certificado revocado exitosamente',
    type: CertificateResponseDto,
    schema: {
      example: {
        id: '990e8400-e29b-41d4-a716-446655440000',
        status: 'revoked',
        revoked_at: '2025-01-20T10:00:00Z',
        revocation_reason: 'El estudiante fue removido del curso',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Certificado no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'El certificado ya está revocado',
  })
  async revokeCertificate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RevokeCertificateDto,
  ): Promise<CertificateResponseDto> {
    const certificate = await this.certificateService.revokeCertificate(
      id,
      dto.reason,
    );
    return certificate as unknown as CertificateResponseDto;
  }

  /**
   * Obtiene estadísticas de certificados de una organización
   *
   * @param tenantId - ID del tenant (UUID)
   * @returns Estadísticas de certificados
   *
   * @security Requiere rol admin_teacher o super_admin
   *
   * @example
   * GET /api/v1/certificates/tenant/770e8400-e29b-41d4-a716-446655440000/stats
   */
  @Get('tenant/:tenantId/stats')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get tenant certificate statistics',
    description: 'Obtiene estadísticas de certificados emitidos por una organización.',
  })
  @ApiParam({
    name: 'tenantId',
    description: 'ID del tenant en formato UUID',
    type: String,
    required: true,
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        tenant_id: '770e8400-e29b-41d4-a716-446655440000',
        total_certificates: 150,
        issued_certificates: 145,
        revoked_certificates: 5,
        pending_certificates: 0,
        certificates_by_type: {
          module_completion: 120,
          course_completion: 20,
          achievement: 10,
        },
        average_final_score: 87.5,
        total_xp_awarded: 75000,
      },
    },
  })
  async getTenantStats(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
  ): Promise<Record<string, unknown>> {
    return this.certificateService.getTenantCertificateStats(tenantId);
  }
}
