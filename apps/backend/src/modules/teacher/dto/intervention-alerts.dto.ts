import {
  IsUUID,
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  InterventionAlertType,
  InterventionAlertSeverity,
  InterventionAlertStatus,
} from '@shared/types/intervention-alerts.types';

/**
 * Alias para compatibilidad con código existente
 * @deprecated Use InterventionAlertType from @shared/types
 */
export const AlertType = InterventionAlertType;
export type AlertType = InterventionAlertType;

/**
 * Alias para compatibilidad con código existente
 * @deprecated Use InterventionAlertSeverity from @shared/types
 */
export const AlertSeverity = InterventionAlertSeverity;
export type AlertSeverity = InterventionAlertSeverity;

/**
 * Alias para compatibilidad con código existente
 * @deprecated Use InterventionAlertStatus from @shared/types
 */
export const AlertStatus = InterventionAlertStatus;
export type AlertStatus = InterventionAlertStatus;

/**
 * DTO para consultar alertas con filtros y paginación
 *
 * @description Query parameters para GET /teacher/alerts
 */
export class GetAlertsQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por classroom específico' })
  @IsOptional()
  @IsUUID()
    classroom_id?: string;

  @ApiPropertyOptional({ enum: AlertType, description: 'Filtrar por tipo de alerta' })
  @IsOptional()
  @IsEnum(AlertType)
    alert_type?: AlertType;

  @ApiPropertyOptional({
    enum: AlertSeverity,
    description: 'Filtrar por nivel de severidad',
  })
  @IsOptional()
  @IsEnum(AlertSeverity)
    severity?: AlertSeverity;

  @ApiPropertyOptional({ enum: AlertStatus, description: 'Filtrar por estado de la alerta' })
  @IsOptional()
  @IsEnum(AlertStatus)
    status?: AlertStatus;

  @ApiPropertyOptional({ description: 'Búsqueda por texto (título, descripción, nombre estudiante)' })
  @IsOptional()
  @IsString()
    search?: string;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 20,
    description: 'Número de resultados por página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
    limit?: number = 20;

  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
    description: 'Desplazamiento para paginación',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
    offset?: number = 0;

  @ApiPropertyOptional({
    default: false,
    description: 'Incluir alertas descartadas (dismissed)',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
    include_dismissed?: boolean = false;
}

/**
 * DTO para reconocer (acknowledge) una alerta
 *
 * @description Body para PATCH /teacher/alerts/:id/acknowledge
 * @note No requiere cuerpo, solo la acción PATCH
 */
export class AcknowledgeAlertDto {
  // No body needed, just PATCH action
}

/**
 * DTO para resolver una alerta de intervención con notas
 *
 * @description Body para PATCH /teacher/alerts/:id/resolve
 * @note Renombrado de ResolveAlertDto a ResolveInterventionAlertDto para evitar
 *       conflicto con admin/dto/alerts/resolve-alert.dto.ts
 */
export class ResolveInterventionAlertDto {
  @ApiProperty({
    description: 'Notas de resolución describiendo las acciones tomadas',
    example: 'Contacté al estudiante y su representante. Se acordó tutorías dos veces por semana.',
  })
  @IsString()
  @IsNotEmpty()
    resolution_notes!: string;
}

/**
 * DTO para descartar (dismiss) una alerta
 *
 * @description Body para PATCH /teacher/alerts/:id/dismiss
 */
export class DismissAlertDto {
  @ApiPropertyOptional({
    description: 'Razón opcional para descartar la alerta',
    example: 'Falso positivo, el estudiante estaba de vacaciones',
  })
  @IsOptional()
  @IsString()
    reason?: string;
}

/**
 * DTO de respuesta para una alerta de intervención individual
 *
 * @description Response DTO para endpoints de alertas de intervención de estudiantes
 * @note Renombrado de AlertResponseDto a InterventionAlertResponseDto para evitar
 *       conflicto con admin/dto/alerts/alert-response.dto.ts (alertas de sistema)
 */
export class InterventionAlertResponseDto {
  @ApiProperty({ description: 'ID único de la alerta' })
    id!: string;

  @ApiProperty({ description: 'ID del estudiante afectado' })
    student_id!: string;

  @ApiProperty({ description: 'Nombre del estudiante' })
    student_name!: string;

  @ApiProperty({ description: 'ID del classroom relacionado', required: false })
    classroom_id?: string | null;

  @ApiProperty({ description: 'Nombre del classroom', required: false })
    classroom_name?: string | null;

  @ApiProperty({ enum: AlertType, description: 'Tipo de alerta' })
    alert_type!: AlertType;

  @ApiProperty({ enum: AlertSeverity, description: 'Nivel de severidad' })
    severity!: AlertSeverity;

  @ApiProperty({ description: 'Título de la alerta' })
    title!: string;

  @ApiProperty({ description: 'Descripción detallada', required: false })
    description?: string | null;

  @ApiProperty({
    description: 'Métricas específicas de la alerta',
    required: false,
    example: { days_inactive: 7, last_activity: '2025-11-17' },
  })
    metrics?: Record<string, unknown> | null;

  @ApiProperty({ enum: AlertStatus, description: 'Estado actual de la alerta' })
    status!: AlertStatus;

  @ApiProperty({ description: 'Fecha de generación (ISO 8601)' })
    generated_at!: string;

  @ApiProperty({ description: 'Fecha de reconocimiento (ISO 8601)', required: false })
    acknowledged_at?: string | null;

  @ApiProperty({ description: 'Nombre del teacher que reconoció', required: false })
    acknowledged_by_name?: string | null;

  @ApiProperty({ description: 'Fecha de resolución (ISO 8601)', required: false })
    resolved_at?: string | null;

  @ApiProperty({ description: 'Nombre del teacher que resolvió', required: false })
    resolved_by_name?: string | null;

  @ApiProperty({ description: 'Notas de resolución', required: false })
    resolution_notes?: string | null;
}

/**
 * DTO de respuesta para listado paginado de alertas de intervención
 *
 * @description Response DTO para GET /teacher/alerts
 */
export class InterventionAlertsListResponseDto {
  @ApiProperty({ type: [InterventionAlertResponseDto], description: 'Array de alertas de intervención' })
    data!: InterventionAlertResponseDto[];

  @ApiProperty({ description: 'Total de alertas que cumplen los filtros' })
    total!: number;

  @ApiProperty({ description: 'Límite de resultados por página' })
    limit!: number;

  @ApiProperty({ description: 'Desplazamiento actual' })
    offset!: number;
}

/**
 * DTO de respuesta para generación manual de alertas
 *
 * @description Response DTO para POST /teacher/alerts/generate
 */
export class GenerateAlertsResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Alertas generadas exitosamente',
  })
    message!: string;
}
