import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ShopService } from '../services/shop.service';
import { CreatePurchaseDto, PurchaseResponseDto } from '../dto/shop';
import { ShopCategory } from '../entities/shop-category.entity';
import { ShopItem } from '../entities/shop-item.entity';
import { UserPurchase } from '../entities/user-purchase.entity';
import { JwtAuthGuard } from '@/modules/auth/guards';

/**
 * ShopController
 *
 * @description Controlador REST para gestión de la tienda (shop) del sistema de gamificación
 *
 * Endpoints:
 * - GET /categories - Obtener categorías de la tienda
 * - GET /items - Obtener items con filtros
 * - GET /items/:id - Obtener item por ID
 * - POST /purchase - Comprar item con ML Coins
 * - GET /purchases/:userId - Obtener compras del usuario
 * - GET /owned/:userId/:itemId - Verificar si usuario posee item
 *
 * @route /api/v1/gamification/shop*
 * @security JWT Bearer Token
 *
 * @see Service: ShopService
 * @see Entities: ShopCategory, ShopItem, UserPurchase
 */
@ApiTags('Gamification - Shop')
@Controller('gamification/shop')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  /**
   * Obtiene las categorías activas de la tienda
   *
   * @description Retorna todas las categorías activas ordenadas por display_order
   *
   * @returns Array de categorías
   *
   * @example
   * GET /api/v1/gamification/shop/categories
   * Authorization: Bearer <token>
   *
   * Response 200:
   * [
   *   {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "name": "cosmetics",
   *     "display_name": "Cosméticos",
   *     "description": "Avatares, marcos y efectos visuales",
   *     "icon": "package",
   *     "color": "purple",
   *     "display_order": 0,
   *     "is_active": true
   *   },
   *   ...
   * ]
   */
  @Get('categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get active shop categories',
    description: 'Retorna todas las categorías activas de la tienda',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categorías obtenidas exitosamente',
    type: [ShopCategory],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
  })
  async getCategories(): Promise<ShopCategory[]> {
    return this.shopService.getCategories();
  }

  /**
   * Obtiene items de la tienda con filtros opcionales
   *
   * @description Retorna items que cumplen con los filtros especificados
   *
   * @param category - Filtrar por categoría (opcional)
   * @param rarity - Filtrar por rareza (opcional)
   * @param available - Filtrar por disponibilidad (opcional)
   * @returns Array de items
   *
   * @example
   * GET /api/v1/gamification/shop/items?category=cosmetics&available=true
   * Authorization: Bearer <token>
   *
   * Response 200:
   * [
   *   {
   *     "id": "660e8400-e29b-41d4-a716-446655440000",
   *     "name": "Avatar Maya Warrior",
   *     "description": "Avatar exclusivo de guerrero maya",
   *     "category": "cosmetics",
   *     "rarity": "epic",
   *     "price": 500,
   *     "is_available": true
   *   },
   *   ...
   * ]
   */
  @Get('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get shop items with filters',
    description: 'Retorna items de la tienda con filtros opcionales',
  })
  @ApiQuery({
    name: 'category',
    type: String,
    required: false,
    description: 'Filtrar por categoría',
    example: 'cosmetics',
  })
  @ApiQuery({
    name: 'rarity',
    type: String,
    required: false,
    description: 'Filtrar por rareza',
    example: 'epic',
  })
  @ApiQuery({
    name: 'available',
    type: Boolean,
    required: false,
    description: 'Filtrar por disponibilidad',
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Items obtenidos exitosamente',
    type: [ShopItem],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
  })
  async getItems(
    @Query('category') category?: string,
    @Query('rarity') rarity?: string,
    @Query('available') available?: boolean,
  ): Promise<ShopItem[]> {
    return this.shopService.getItems({ category, rarity, available });
  }

  /**
   * Obtiene un item por ID
   *
   * @description Retorna los detalles completos de un item específico
   *
   * @param id - ID del item (UUID)
   * @returns Item encontrado
   * @throws NotFoundException si el item no existe
   *
   * @example
   * GET /api/v1/gamification/shop/items/660e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer <token>
   *
   * Response 200:
   * {
   *   "id": "660e8400-e29b-41d4-a716-446655440000",
   *   "name": "Avatar Maya Warrior",
   *   "description": "Avatar exclusivo de guerrero maya",
   *   "category": "cosmetics",
   *   "rarity": "epic",
   *   "price": 500,
   *   "discount_price": 350,
   *   "is_available": true,
   *   "stock": 100
   * }
   */
  @Get('items/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get shop item by ID',
    description: 'Retorna los detalles de un item específico',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Item UUID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item obtenido exitosamente',
    type: ShopItem,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Item no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
  })
  async getItemById(@Param('id') id: string): Promise<ShopItem> {
    return this.shopService.getItemById(id);
  }

  /**
   * Compra un item de la tienda con ML Coins
   *
   * @description Realiza la compra de un item validando requisitos, stock y balance
   *
   * VALIDACIONES:
   * - Item existe y está disponible
   * - Stock suficiente (si aplica)
   * - No excede max_per_user (si aplica)
   * - Usuario cumple requisitos (rank, level, achievement)
   * - Balance de ML Coins suficiente
   *
   * PROCESO:
   * - Deduce ML Coins del balance del usuario
   * - Crea transacción de ML Coins
   * - Crea registro de compra
   * - Reduce stock (si aplica)
   * - Retorna nuevo balance
   *
   * @param dto - Datos de compra (user_id, item_id, quantity)
   * @returns Respuesta con detalles de la compra
   * @throws BadRequestException si no se cumplen validaciones
   * @throws NotFoundException si usuario o item no existen
   *
   * @example
   * POST /api/v1/gamification/shop/purchase
   * Authorization: Bearer <token>
   * Body:
   * {
   *   "user_id": "550e8400-e29b-41d4-a716-446655440000",
   *   "item_id": "660e8400-e29b-41d4-a716-446655440000",
   *   "quantity": 1
   * }
   *
   * Response 201:
   * {
   *   "success": true,
   *   "purchase_id": "770e8400-e29b-41d4-a716-446655440000",
   *   "item": {
   *     "id": "660e8400-e29b-41d4-a716-446655440000",
   *     "name": "Avatar Maya Warrior",
   *     "price": 500
   *   },
   *   "price_paid": 500,
   *   "new_balance": 1250,
   *   "message": "Successfully purchased 1x Avatar Maya Warrior"
   * }
   */
  @Post('purchase')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Purchase shop item with ML Coins',
    description: 'Compra un item de la tienda con ML Coins',
  })
  @ApiBody({ type: CreatePurchaseDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Item comprado exitosamente',
    type: PurchaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validación fallida (saldo insuficiente, stock, requisitos, etc)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario o item no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
  })
  async purchaseItem(@Body() dto: CreatePurchaseDto): Promise<PurchaseResponseDto> {
    const { user_id, item_id, quantity = 1 } = dto;
    return this.shopService.purchaseItem(user_id, item_id, quantity);
  }

  /**
   * Obtiene las compras de un usuario
   *
   * @description Retorna el historial completo de compras del usuario
   *
   * @param userId - ID del usuario (UUID)
   * @returns Array de compras ordenadas por fecha descendente
   *
   * @example
   * GET /api/v1/gamification/shop/purchases/550e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer <token>
   *
   * Response 200:
   * [
   *   {
   *     "id": "770e8400-e29b-41d4-a716-446655440000",
   *     "user_id": "550e8400-e29b-41d4-a716-446655440000",
   *     "item_id": "660e8400-e29b-41d4-a716-446655440000",
   *     "quantity": 1,
   *     "price_paid": 500,
   *     "status": "completed",
   *     "purchased_at": "2025-11-29T10:30:00Z"
   *   },
   *   ...
   * ]
   */
  @Get('purchases/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user purchases',
    description: 'Retorna el historial de compras del usuario',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Compras obtenidas exitosamente',
    type: [UserPurchase],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
  })
  async getUserPurchases(@Param('userId') userId: string): Promise<UserPurchase[]> {
    return this.shopService.getUserPurchases(userId);
  }

  /**
   * Verifica si el usuario posee un item
   *
   * @description Verifica si el usuario ha comprado y posee actualmente un item
   *
   * @param userId - ID del usuario (UUID)
   * @param itemId - ID del item (UUID)
   * @returns Objeto con propiedad 'owned'
   *
   * @example
   * GET /api/v1/gamification/shop/owned/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer <token>
   *
   * Response 200:
   * {
   *   "owned": true
   * }
   */
  @Get('owned/:userId/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check if user owns item',
    description: 'Verifica si el usuario posee un item específico',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'itemId',
    type: String,
    description: 'Item UUID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verificación exitosa',
    schema: {
      type: 'object',
      properties: {
        owned: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
  })
  async checkOwnership(
    @Param('userId') userId: string,
    @Param('itemId') itemId: string,
  ): Promise<{ owned: boolean }> {
    const owned = await this.shopService.userOwnsItem(userId, itemId);
    return { owned };
  }
}
