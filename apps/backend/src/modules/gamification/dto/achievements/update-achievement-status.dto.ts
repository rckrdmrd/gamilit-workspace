import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * UpdateAchievementStatusDto
 *
 * @description DTO específico para actualizar el estado activo/inactivo de un logro.
 *              Se utiliza para el toggle de activación desde el panel de administración.
 */
export class UpdateAchievementStatusDto {
  /**
   * Estado del logro (activo/inactivo)
   * @example true
   */
  @ApiProperty({
    description: 'Estado del logro - true: activo, false: inactivo',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
    is_active!: boolean;
}
