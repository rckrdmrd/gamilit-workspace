import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional, Matches } from 'class-validator';

// UUID regex that matches any UUID format
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * CreatePurchaseDto
 *
 * @description DTO para crear una compra en el shop
 * Usado en endpoint POST /api/v1/gamification/shop/purchase
 */
export class CreatePurchaseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del usuario comprador',
  })
  @IsString({ message: 'user_id debe ser un string' })
  @Matches(UUID_REGEX, { message: 'user_id debe tener formato UUID válido' })
  user_id!: string;

  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440000',
    description: 'ID del item a comprar',
  })
  @IsString({ message: 'item_id debe ser un string' })
  @Matches(UUID_REGEX, { message: 'item_id debe tener formato UUID válido' })
  item_id!: string;

  @ApiProperty({
    example: 1,
    description: 'Cantidad a comprar (default: 1)',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
