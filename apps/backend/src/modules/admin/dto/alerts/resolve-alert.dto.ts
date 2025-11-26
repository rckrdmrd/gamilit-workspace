import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for resolving an alert
 */
export class ResolveAlertDto {
  @ApiProperty({ description: 'Resolution note (minimum 10 characters)', minLength: 10 })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  resolution_note!: string;
}
