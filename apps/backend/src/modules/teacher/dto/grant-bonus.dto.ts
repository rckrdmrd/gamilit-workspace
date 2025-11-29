import { IsNumber, IsString, IsNotEmpty, Min, Max, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para otorgar bonus de ML Coins a un estudiante
 *
 * @description
 * Permite a un teacher dar ML Coins adicionales como recompensa
 * por buen comportamiento, participación, o logros especiales.
 */
export class GrantBonusDto {
  /**
   * Cantidad de ML Coins a otorgar (1-1000)
   */
  @ApiProperty({
    description: 'Cantidad de ML Coins a otorgar como bonus',
    example: 50,
    minimum: 1,
    maximum: 1000,
  })
  @IsNotEmpty({ message: 'La cantidad de ML Coins es requerida' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'El bonus debe ser al menos 1 ML Coin' })
  @Max(1000, { message: 'El bonus no puede exceder 1000 ML Coins' })
    amount!: number;

  /**
   * Razón o motivo del bonus (mínimo 10 caracteres)
   */
  @ApiProperty({
    description: 'Razón o motivo del bonus (mínimo 10 caracteres)',
    example: 'Excelente participación en clase y ayuda a compañeros',
    minLength: 10,
  })
  @IsNotEmpty({ message: 'La razón del bonus es requerida' })
  @IsString({ message: 'La razón debe ser un texto' })
  @MinLength(10, { message: 'La razón debe tener al menos 10 caracteres' })
    reason!: string;
}

/**
 * Response DTO al otorgar bonus
 */
export class GrantBonusResponseDto {
  @ApiProperty({ description: 'Confirmación de éxito', example: true })
    success!: boolean;

  @ApiProperty({ description: 'Nuevo balance de ML Coins', example: 250 })
    newBalance!: number;

  @ApiProperty({ description: 'Mensaje descriptivo', example: 'Bonus otorgado exitosamente' })
    message!: string;

  @ApiProperty({ description: 'Cantidad de ML Coins otorgadas', example: 50 })
    amountGranted!: number;

  @ApiProperty({ description: 'Razón del bonus', example: 'Excelente participación en clase' })
    reason!: string;
}
