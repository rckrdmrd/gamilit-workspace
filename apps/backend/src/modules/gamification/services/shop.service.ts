import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ShopCategory } from '../entities/shop-category.entity';
import { ShopItem } from '../entities/shop-item.entity';
import { UserPurchase } from '../entities/user-purchase.entity';
import { UserStats } from '../entities/user-stats.entity';
import { MLCoinsTransaction } from '../entities/ml-coins-transaction.entity';
import { UserAchievement } from '../entities/user-achievement.entity';
import { PurchaseResponseDto } from '../dto/shop/purchase-response.dto';
import { ShopItemResponseDto } from '../dto/shop/shop-item-response.dto';
import { ComodinTypeEnum, TransactionTypeEnum } from '@shared/constants/enums.constants';
import { ComodinesService } from './comodines.service';
import {
  ShopItemNotFoundError,
  UserStatsNotFoundError,
  ItemNotAvailableError,
  InsufficientStockError,
  MaxPurchasesReachedError,
  InsufficientCoinsError,
  InsufficientRankError,
  InsufficientLevelError,
  RequiredAchievementMissingError,
  InvalidQuantityError,
} from '../errors/gamification.errors';
import { NotificationService } from '../../notifications/services/notification.service';
import { mergeVisualConfig } from '../utils/visual-config.util';

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

  /**
   * Mapping de effect_data.type de shop items a ComodinTypeEnum.
   * Solo tipos que corresponden a comodines de ejercicio; boosts (xp_boost,
   * coins_boost) se excluyen intencionalmente — no sincronizan inventario.
   */
  private static readonly SHOP_EFFECT_TO_COMODIN: Record<string, string> = {
    hint: 'PISTAS',
    highlight: 'VISION_LECTORA',
    retry: 'SEGUNDA_OPORTUNIDAD',
  };

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
    @InjectRepository(UserAchievement, 'gamification')
    private readonly userAchievementRepository: Repository<UserAchievement>,
    private readonly notificationService: NotificationService,
    private readonly comodinesService: ComodinesService,
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

    const items = await queryBuilder.orderBy('item.price', 'ASC').getMany();

    for (const item of items) {
      mergeVisualConfig(item);
    }

    return items;
  }

  /**
   * Obtiene un item por ID
   *
   * @param itemId - ID del item
   * @returns Item encontrado
   * @throws ShopItemNotFoundError si el item no existe
   *
   * @example
   * const item = await service.getItemById(itemId);
   */
  async getItemById(itemId: string): Promise<ShopItem> {
    const item = await this.shopItemRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new ShopItemNotFoundError(itemId);
    }

    mergeVisualConfig(item);

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
   * @throws InvalidQuantityError|ItemNotAvailableError|InsufficientStockError|MaxPurchasesReachedError|InsufficientCoinsError si no se cumplen las validaciones
   * @throws ShopItemNotFoundError|UserStatsNotFoundError si el usuario o item no existen
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
    if (quantity <= 0) {
      throw new InvalidQuantityError();
    }

    // Captured inside the transaction and used after it commits for comodines sync
    let item_is_consumable = false;
    let effect_type: string | undefined;

    const purchaseResult = await this.shopItemRepository.manager.transaction(async (manager) => {
      const itemRepo = manager.getRepository(ShopItem);
      const purchaseRepo = manager.getRepository(UserPurchase);
      const userStatsRepo = manager.getRepository(UserStats);
      const transactionRepo = manager.getRepository(MLCoinsTransaction);

      // 1. Validar que item existe y está disponible (dentro de transacción)
      const item = await itemRepo.findOne({
        where: { id: itemId },
      });

      if (!item) {
        throw new ShopItemNotFoundError(itemId);
      }

      if (!item.is_available) {
        throw new ItemNotAvailableError(item.name);
      }

      // 2. Validar stock si aplica
      if (
        item.stock !== null &&
        item.stock !== undefined &&
        item.stock < quantity
      ) {
        throw new InsufficientStockError(item.stock, quantity);
      }

      // 3. Validar max_per_user (contar compras previas)
      if (
        item.max_per_user !== null &&
        item.max_per_user !== undefined
      ) {
        const previousPurchases = await purchaseRepo.count({
          where: {
            user_id: userId,
            item_id: itemId,
            status: 'completed',
          },
        });

        if (previousPurchases >= item.max_per_user) {
          throw new MaxPurchasesReachedError(item.max_per_user);
        }
      }

      const userStats = await userStatsRepo.findOne({
        where: { user_id: userId },
      });

      if (!userStats) {
        throw new UserStatsNotFoundError(userId);
      }

      // 4. Validar requisitos (rank, level, achievement)
      await this.validateRequirements(userId, item, userStats, manager);

      // 5. Validar saldo suficiente
      const currentPrice = item.getCurrentPrice();
      const totalCost = currentPrice * quantity;
      const balanceBefore = userStats.ml_coins;

      if (balanceBefore < totalCost) {
        throw new InsufficientCoinsError(totalCost, balanceBefore);
      }

      const balanceAfter = balanceBefore - totalCost;

      // 6. Crear transacción de ML Coins
      const transaction = transactionRepo.create({
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

      await transactionRepo.save(transaction);

      // 7. Actualizar balance del usuario en user_stats
      userStats.ml_coins = balanceAfter;
      userStats.ml_coins_spent_total += totalCost;
      await userStatsRepo.save(userStats);

      // 8. Crear registro en user_purchases
      const discountAmount = item.hasActiveDiscount() && item.discount_price
        ? (item.price - item.discount_price) * quantity
        : 0;

      const purchase = purchaseRepo.create({
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

      const savedPurchase = await purchaseRepo.save(purchase);

      // 9. Reducir stock si aplica
      if (
        item.stock !== null &&
        item.stock !== undefined
      ) {
        item.stock -= quantity;
        await itemRepo.save(item);
      }

      this.logger.log(
        `User ${userId} purchased ${quantity}x ${item.name} for ${totalCost} ML Coins`,
      );

      // Capture consumable metadata for post-transaction comodines sync
      item_is_consumable = item.is_consumable;
      effect_type = typeof item.effect_data?.type === 'string'
        ? item.effect_data.type
        : undefined;

      return {
        success: true,
        purchase_id: savedPurchase.id,
        item: this.mapToResponseDto(item),
        price_paid: totalCost,
        new_balance: balanceAfter,
        message: `Successfully purchased ${quantity}x ${item.name}`,
      };
    });

    // Sync consumable shop purchase to comodines inventory (non-blocking)
    if (purchaseResult && item_is_consumable && effect_type) {
      const comodinType = ShopService.SHOP_EFFECT_TO_COMODIN[effect_type];
      if (comodinType) {
        try {
          await this.comodinesService.incrementFromShopPurchase(
            userId,
            comodinType as ComodinTypeEnum,
            quantity,
            purchaseResult.purchase_id,
          );
          this.logger.log(
            `Synced ${quantity}x ${comodinType} to comodines inventory for user ${userId}`,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to sync comodines inventory for user ${userId}: ${error}`,
          );
          // Non-blocking: shop purchase already succeeded
        }
      }
    }

    // Notificación no bloqueante para historial in-app de compras.
    try {
      await this.notificationService.create(
        {
          userId,
          type: 'shop_purchase',
          title: 'Compra realizada',
          message: `Compraste ${quantity}x ${purchaseResult.item.name} por ${purchaseResult.price_paid} ML Coins.`,
          data: {
            purchaseId: purchaseResult.purchase_id,
            itemId,
            quantity,
            pricePaid: purchaseResult.price_paid,
            newBalance: purchaseResult.new_balance,
          },
          channels: ['in_app'],
        },
        { skipRateLimit: true },
      );
    } catch (error) {
      this.logger.warn(
        `Failed to create shop purchase notification for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return purchaseResult;
  }

  /**
   * Valida requisitos de desbloqueo de un item
   *
   * @param userId - ID del usuario
   * @param item - Item a validar
   * @throws InsufficientRankError|InsufficientLevelError|RequiredAchievementMissingError si no se cumplen los requisitos
   */
  private async validateRequirements(
    userId: string,
    item: ShopItem,
    userStats: UserStats,
    manager?: EntityManager,
  ): Promise<void> {
    const dataManager = manager ?? this.userStatsRepository.manager;

    // Validar rank requerido (usa rank_order para >= comparacion)
    if (item.required_rank) {
      // Consulta directa para obtener rank_order de ambos ranks
      const rankQuery = `
        SELECT rank_name, rank_order
        FROM gamification_system.maya_ranks
        WHERE rank_name IN ($1, $2) AND is_active = true
      `;

      try {
        const ranks = await dataManager.query(rankQuery, [
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
          throw new InsufficientRankError(item.required_rank, userStats.current_rank);
        }
      } catch (error) {
        if (error instanceof InsufficientRankError) {
          throw error;
        }
        this.logger.error(`Failed to validate rank requirement: ${error}`);
      }
    }

    // Validar level requerido
    if (item.required_level !== null && item.required_level !== undefined) {
      if (userStats.level < item.required_level) {
        throw new InsufficientLevelError(item.required_level, userStats.level);
      }
    }

    // Validar achievement requerido
    if (item.required_achievement_id) {
      const userAchievementRepo = manager
        ? manager.getRepository(UserAchievement)
        : this.userAchievementRepository;

      const hasRequiredAchievement = await userAchievementRepo.exist({
        where: {
          user_id: userId,
          achievement_id: item.required_achievement_id,
          is_completed: true,
        },
      });

      if (!hasRequiredAchievement) {
        throw new RequiredAchievementMissingError(item.required_achievement_id);
      }
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
    const purchases = await this.purchaseRepository.find({
      where: { user_id: userId },
      relations: ['item'],
      order: { purchased_at: 'DESC' },
    });

    for (const purchase of purchases) {
      // TypeORM 0.3.x dual mapping: @Column item_id + @ManyToOne @JoinColumn({ name: 'item_id' })
      // When relations are loaded, item_id can be undefined. Backfill from the loaded relation.
      if (!purchase.item_id && purchase.item?.id) {
        purchase.item_id = purchase.item.id;
      }
      mergeVisualConfig(purchase.item);
    }

    return purchases;
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
      max_per_user: item.max_per_user ?? undefined,
      duration_days: item.duration_days ?? undefined,
      effect_data: item.effect_data ?? undefined,
      metadata: item.metadata ?? undefined,
      requirements: {
        rank: item.required_rank,
        level: item.required_level,
        achievement: item.required_achievement_id,
      },
    };
  }
}
