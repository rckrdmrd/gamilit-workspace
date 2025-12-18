import { ApiProperty } from '@nestjs/swagger';
import { ShopItemCategoryEnum } from '@shared/constants/enums.constants';

/**
 * ShopItemResponseDto
 *
 * @description DTO para respuesta de items del shop
 * Usado en endpoints GET /api/v1/gamification/shop/items
 */
export class ShopItemResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del item',
  })
    id!: string;

  @ApiProperty({
    example: 'Avatar Maya Warrior',
    description: 'Nombre del item',
  })
    name!: string;

  @ApiProperty({
    example: 'Avatar exclusivo de guerrero maya con animación especial',
    description: 'Descripción del item',
    required: false,
  })
    description?: string;

  @ApiProperty({
    example: '🎭',
    description: 'Icono del item',
  })
    icon!: string;

  @ApiProperty({
    example: 'https://cdn.gamilit.com/shop/items/maya-warrior.png',
    description: 'URL de imagen del item',
    required: false,
  })
    image_url?: string;

  @ApiProperty({
    enum: ShopItemCategoryEnum,
    example: ShopItemCategoryEnum.COSMETICS,
    description: 'Categoría del item',
  })
    category!: ShopItemCategoryEnum;

  @ApiProperty({
    example: 'epic',
    description: 'Rareza del item',
    enum: ['common', 'rare', 'epic', 'legendary'],
  })
    rarity!: string;

  @ApiProperty({
    example: ['avatar', 'maya', 'limited'],
    description: 'Tags del item',
    type: [String],
  })
    tags!: string[];

  @ApiProperty({
    example: 500,
    description: 'Precio en ML Coins',
  })
    price!: number;

  @ApiProperty({
    example: 350,
    description: 'Precio con descuento (si aplica)',
    required: false,
  })
    discount_price?: number;

  @ApiProperty({
    example: true,
    description: 'Si el item está disponible para compra',
  })
    is_available!: boolean;

  @ApiProperty({
    example: 100,
    description: 'Stock disponible (null = ilimitado)',
    required: false,
  })
    stock?: number;

  @ApiProperty({
    example: false,
    description: 'Si el item es consumible',
  })
    is_consumable!: boolean;

  @ApiProperty({
    example: {
      rank: 'Nacom',
      level: 10,
      achievement_id: null,
    },
    description: 'Requisitos para comprar el item',
    required: false,
  })
    requirements?: {
    rank?: string;
    level?: number;
    achievement?: string;
  };
}
