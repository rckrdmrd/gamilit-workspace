import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopCategory } from '../entities/shop-category.entity';
import { ShopItem } from '../entities/shop-item.entity';
import { UserPurchase } from '../entities/user-purchase.entity';
import { UserStats } from '../entities/user-stats.entity';
import { MLCoinsTransaction } from '../entities/ml-coins-transaction.entity';
import { MLCoinsService } from './ml-coins.service';
import { PurchaseResponseDto } from '../dto/shop/purchase-response.dto';
import { ShopItemResponseDto } from '../dto/shop/shop-item-response.dto';
import { TransactionTypeEnum } from '@shared/constants/enums.constants';

/**
 * ShopService
 *
 * @description Servicio para gestión de la tienda (shop) del sistema de gamificación
 *
 * Funcionalidades:
 * - Obtener categorías y items de la tienda
 * - Compra de items con ML Coins
 * - Validación de requisitos (rank, level, achievement)
 * - Validación de stock y límites por usuario
 * - Gestión de compras y tracking de ownership
 *
 * @see Entity: ShopCategory, ShopItem, UserPurchase
 * @see DDL: gamification_system.shop_categories, shop_items, user_purchases
 */
@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  constructor(
    @InjectRepository(ShopItem, 'gamification')
    private readonly shopItemRepository: Repository<ShopItem>,
    @InjectRepository(ShopCategory, 'gamification')
    private readonly categoryRepository: Repository<ShopCategory>,
    @InjectRepository(UserPurchase, 'gamification')
    private readonly purchaseRepository: Repository<UserPurchase>,
    @InjectRepository(UserStats, 'gamification')
    private readonly userStatsRepository: Repository<UserStats>,
    @InjectRepository(MLCoinsTransaction, 'gamification')
    private readonly transactionRepository: Repository<MLCoinsTransaction>,
    private readonly mlCoinsService: MLCoinsService,
  ) {}

  /**
   * Obtiene categorías activas de la tienda
   *
   * @returns Array de categorías ordenadas por display_order
   *
   * @example
   * const categories = await service.getCategories();
   * // [{ id: '...', name: 'cosmetics', display_name: 'Cosméticos', ... }]
   */
  async getCategories(): Promise<ShopCategory[]> {
    return this.categoryRepository.find({
      where: { is_active: true },
      order: { display_order: 'ASC' },
    });
  }

  /**
   * Obtiene items de la tienda con filtros opcionales
   *
   * @param filters - Filtros opcionales (category, rarity, available)
   * @returns Array de items que cumplen los filtros
   *
   * @example
   * const items = await service.getItems({ category: 'cosmetics', available: true });
   */
  async getItems(filters?: {
    category?: string;
    rarity?: string;
    available?: boolean;
  }): Promise<ShopItem[]> {
    const queryBuilder = this.shopItemRepository.createQueryBuilder('item');

    if (filters?.category) {
      queryBuilder.andWhere('item.category = :category', { category: filters.category });
    }

    if (filters?.rarity) {
      queryBuilder.andWhere('item.rarity = :rarity', { rarity: filters.rarity });
    }

    if (filters?.available !== undefined) {
      queryBuilder.andWhere('item.is_available = :available', {
        available: filters.available,
      });
    }

    return queryBuilder.orderBy('item.price', 'ASC').getMany();
  }

  /**
   * Obtiene un item por ID
   *
   * @param itemId - ID del item
   * @returns Item encontrado
   * @throws NotFoundException si el item no existe
   *
   * @example
   * const item = await service.getItemById(itemId);
   */
  async getItemById(itemId: string): Promise<ShopItem> {
    const item = await this.shopItemRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    return item;
  }

  /**
   * Compra un item de la tienda
   *
   * LÓGICA PRINCIPAL:
   * 1. Validar que item existe y está disponible
   * 2. Validar stock si aplica
   * 3. Validar max_per_user (contar compras previas)
   * 4. Validar requisitos (rank, level, achievement)
   * 5. Obtener balance actual de ML Coins del usuario
   * 6. Validar saldo suficiente
   * 7. Crear transacción de ML Coins (tipo: 'spent_powerup')
   * 8. Actualizar balance del usuario en user_stats
   * 9. Crear registro en user_purchases
   * 10. Reducir stock si aplica
   * 11. Retornar respuesta con nuevo balance
   *
   * @param userId - ID del usuario comprador
   * @param itemId - ID del item a comprar
   * @param quantity - Cantidad a comprar (default: 1)
   * @returns Respuesta con detalles de la compra
   * @throws BadRequestException si no se cumplen las validaciones
   * @throws NotFoundException si el usuario o item no existen
   *
   * @example
   * const purchase = await service.purchaseItem(userId, itemId, 1);
   * // { success: true, purchase_id: '...', price_paid: 500, new_balance: 1250, ... }
   */
  async purchaseItem(
    userId: string,
    itemId: string,
    quantity: number = 1,
  ): Promise<PurchaseResponseDto> {
    // 1. Validar que item existe y está disponible
    const item = await this.getItemById(itemId);

    if (!item.is_available) {
      throw new BadRequestException(`Item ${item.name} is not available for purchase`);
    }

    // 2. Validar stock si aplica
    if (
      item.stock !== null &&
      item.stock !== undefined &&
      item.stock < quantity
    ) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${item.stock}, Requested: ${quantity}`,
      );
    }

    // 3. Validar max_per_user (contar compras previas)
    if (
      item.max_per_user !== null &&
      item.max_per_user !== undefined
    ) {
      const previousPurchases = await this.purchaseRepository.count({
        where: {
          user_id: userId,
          item_id: itemId,
          status: 'completed',
        },
      });

      if (previousPurchases >= item.max_per_user) {
        throw new BadRequestException(
          `Maximum purchases per user reached (${item.max_per_user})`,
        );
      }
    }

    // 4. Validar requisitos (rank, level, achievement)
    await this.validateRequirements(userId, item);

    // 5. Obtener balance actual de ML Coins del usuario
    const balance = await this.mlCoinsService.getBalance(userId);

    // 6. Validar saldo suficiente
    const currentPrice = item.getCurrentPrice();
    const totalCost = currentPrice * quantity;

    if (balance < totalCost) {
      throw new BadRequestException(
        `Insufficient ML Coins. Required: ${totalCost}, Available: ${balance}`,
      );
    }

    // 7. Crear transacción de ML Coins (tipo: 'spent_powerup')
    const userStats = await this.userStatsRepository.findOne({
      where: { user_id: userId },
    });

    if (!userStats) {
      throw new NotFoundException(`User stats not found for ${userId}`);
    }

    const balanceBefore = userStats.ml_coins;
    const balanceAfter = balanceBefore - totalCost;

    // Crear transacción
    const transaction = this.transactionRepository.create({
      user_id: userId,
      amount: -totalCost,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      transaction_type: TransactionTypeEnum.SPENT_POWERUP,
      description: `Purchased ${quantity}x ${item.name}`,
      reason: 'shop_purchase',
      reference_id: itemId,
      reference_type: 'powerup',
      metadata: {
        item_id: itemId,
        item_name: item.name,
        quantity: quantity,
        unit_price: currentPrice,
        discount_applied: item.hasActiveDiscount(),
      },
    });

    await this.transactionRepository.save(transaction);

    // 8. Actualizar balance del usuario en user_stats
    userStats.ml_coins = balanceAfter;
    userStats.ml_coins_spent_total += totalCost;
    await this.userStatsRepository.save(userStats);

    // 9. Crear registro en user_purchases
    // discount_applied is the discount amount in ML Coins (integer)
    const discountAmount = item.hasActiveDiscount() && item.discount_price
      ? (item.price - item.discount_price) * quantity
      : 0;

    const purchase = this.purchaseRepository.create({
      user_id: userId,
      item_id: itemId,
      quantity: quantity,
      price_paid: currentPrice,
      discount_applied: discountAmount,
      transaction_id: transaction.id,
      status: 'completed',
      is_active: true,
      metadata: {
        item_name: item.name,
        category: item.category,
        rarity: item.rarity,
      },
    });

    const savedPurchase = await this.purchaseRepository.save(purchase);

    // 10. Reducir stock si aplica
    if (
      item.stock !== null &&
      item.stock !== undefined
    ) {
      item.stock -= quantity;
      await this.shopItemRepository.save(item);
    }

    this.logger.log(
      `User ${userId} purchased ${quantity}x ${item.name} for ${totalCost} ML Coins`,
    );

    // 11. Retornar respuesta con nuevo balance
    return {
      success: true,
      purchase_id: savedPurchase.id,
      item: this.mapToResponseDto(item),
      price_paid: totalCost,
      new_balance: balanceAfter,
      message: `Successfully purchased ${quantity}x ${item.name}`,
    };
  }

  /**
   * Valida requisitos de desbloqueo de un item
   *
   * @param userId - ID del usuario
   * @param item - Item a validar
   * @throws BadRequestException si no se cumplen los requisitos
   */
  private async validateRequirements(userId: string, item: ShopItem): Promise<void> {
    const userStats = await this.userStatsRepository.findOne({
      where: { user_id: userId },
    });

    if (!userStats) {
      throw new NotFoundException(`User stats not found for ${userId}`);
    }

    // Validar rank requerido (usa rank_order para >= comparacion)
    if (item.required_rank) {
      // Consulta directa para obtener rank_order de ambos ranks
      const rankQuery = `
        SELECT rank_name, rank_order
        FROM gamification_system.maya_ranks
        WHERE rank_name IN ($1, $2) AND is_active = true
      `;

      try {
        const ranks = await this.userStatsRepository.query(rankQuery, [
          item.required_rank,
          userStats.current_rank,
        ]);

        const requiredRank = ranks.find(
          (r: { rank_name: string; rank_order: number }) =>
            r.rank_name === item.required_rank,
        );
        const userRank = ranks.find(
          (r: { rank_name: string; rank_order: number }) =>
            r.rank_name === userStats.current_rank,
        );

        if (!requiredRank || !userRank) {
          this.logger.warn(
            `Rank validation skipped: requiredRank=${item.required_rank}, userRank=${userStats.current_rank}`,
          );
        } else if (userRank.rank_order < requiredRank.rank_order) {
          // Usuario necesita rank igual o superior (mayor rank_order = rank superior)
          throw new BadRequestException(
            `Required rank: ${item.required_rank} (or higher). Current rank: ${userStats.current_rank}`,
          );
        }
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        this.logger.error(`Failed to validate rank requirement: ${error}`);
      }
    }

    // Validar level requerido
    if (item.required_level !== null && item.required_level !== undefined) {
      if (userStats.level < item.required_level) {
        throw new BadRequestException(
          `Required level: ${item.required_level}. Current level: ${userStats.level}`,
        );
      }
    }

    // Validar achievement requerido
    // Nota: Para implementar completamente, inyectar AchievementsService
    if (item.required_achievement_id) {
      this.logger.warn(
        `Achievement validation not implemented for item ${item.id}, required achievement: ${item.required_achievement_id}`,
      );
    }
  }

  /**
   * Obtiene las compras de un usuario
   *
   * @param userId - ID del usuario
   * @returns Array de compras del usuario
   *
   * @example
   * const purchases = await service.getUserPurchases(userId);
   */
  async getUserPurchases(userId: string): Promise<UserPurchase[]> {
    return this.purchaseRepository.find({
      where: { user_id: userId },
      order: { purchased_at: 'DESC' },
    });
  }

  /**
   * Verifica si el usuario ya posee un item
   *
   * @param userId - ID del usuario
   * @param itemId - ID del item
   * @returns true si el usuario posee el item
   *
   * @example
   * const owns = await service.userOwnsItem(userId, itemId);
   */
  async userOwnsItem(userId: string, itemId: string): Promise<boolean> {
    const count = await this.purchaseRepository.count({
      where: {
        user_id: userId,
        item_id: itemId,
        status: 'completed',
        is_active: true,
      },
    });

    return count > 0;
  }

  /**
   * Mapea ShopItem a ShopItemResponseDto
   */
  private mapToResponseDto(item: ShopItem): ShopItemResponseDto {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      icon: item.icon,
      image_url: item.image_url,
      category: item.category,
      rarity: item.rarity,
      tags: item.tags,
      price: item.price,
      discount_price: item.discount_price,
      is_available: item.is_available,
      stock: item.stock,
      is_consumable: item.is_consumable,
      requirements: {
        rank: item.required_rank,
        level: item.required_level,
        achievement: item.required_achievement_id,
      },
    };
  }
}
