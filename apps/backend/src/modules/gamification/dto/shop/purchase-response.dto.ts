import { ApiProperty } from '@nestjs/swagger';
import { ShopItemResponseDto } from './shop-item-response.dto';

/**
 * PurchaseResponseDto
 *
 * @description DTO para respuesta después de realizar una compra
 * Usado en endpoint POST /api/v1/gamification/shop/purchase
 */
export class PurchaseResponseDto {
  @ApiProperty({
    example: true,
    description: 'Si la compra fue exitosa',
  })
    success!: boolean;

  @ApiProperty({
    example: '770e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la compra creada',
  })
    purchase_id!: string;

  @ApiProperty({
    type: ShopItemResponseDto,
    description: 'Item comprado',
  })
    item!: ShopItemResponseDto;

  @ApiProperty({
    example: 500,
    description: 'Precio total pagado en ML Coins',
  })
    price_paid!: number;

  @ApiProperty({
    example: 1250,
    description: 'Nuevo balance de ML Coins del usuario',
  })
    new_balance!: number;

  @ApiProperty({
    example: 'Item purchased successfully',
    description: 'Mensaje de confirmación',
  })
    message!: string;
}
