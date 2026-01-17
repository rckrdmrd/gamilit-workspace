import { PartialType } from '@nestjs/swagger';
import { CreateLtiConsumerDto } from './create-lti-consumer.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * UpdateLtiConsumerDto
 *
 * @description DTO para actualizar un LTI consumer existente
 */
export class UpdateLtiConsumerDto extends PartialType(CreateLtiConsumerDto) {
  @ApiPropertyOptional({
    description: 'Estado activo del consumer',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Estado de verificación del consumer',
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}
