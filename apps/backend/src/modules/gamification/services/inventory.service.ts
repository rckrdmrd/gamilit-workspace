import { Injectable, Logger } from '@nestjs/common';
import {
  ItemNotFoundError,
  ConsumableItemEquipError,
  ItemNotOwnedError,
  ItemNotEquippedError,
} from '../errors/gamification.errors';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { UserEquippedItem } from '../entities/user-equipped-item.entity';
import { UserPurchase } from '../entities/user-purchase.entity';
import { ShopItem } from '../entities/shop-item.entity';
import { EquipItemDto } from '../dto/inventory/equip-item.dto';
import { mergeVisualConfig } from '../utils/visual-config.util';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(UserEquippedItem, 'gamification')
    private readonly equippedRepo: Repository<UserEquippedItem>,
    @InjectRepository(UserPurchase, 'gamification')
    private readonly purchaseRepo: Repository<UserPurchase>,
    @InjectRepository(ShopItem, 'gamification')
    private readonly itemRepo: Repository<ShopItem>,
  ) {}

  /**
   * Obtiene todos los items equipados por un usuario
   * @param userId UUID del usuario
   * @returns Lista de items equipados con relaciones cargadas
   */
  async getEquippedItems(userId: string): Promise<UserEquippedItem[]> {
    const equipped = await this.equippedRepo.find({
      where: { user_id: userId },
      relations: ['item', 'category'],
    });

    for (const entry of equipped) {
      if (entry.item) {
        mergeVisualConfig(entry.item);
      }
    }

    return equipped;
  }

  /**
   * Obtiene mapa de items equipados para perfil rápido (Auth Service)
   * @param userId UUID del usuario
   * @returns Objeto { categoryName: itemData }
   */
  async getEquippedItemsMap(userId: string): Promise<Record<string, any>> {
    const equipped = await this.getEquippedItems(userId);
    const map: Record<string, any> = {};

    equipped.forEach((entry) => {
      if (entry.category && entry.item) {
        map[entry.category.name] = {
          itemId: entry.item.id,
          name: entry.item.name,
          assetUrl: entry.item.metadata?.asset_url,
          type: entry.item.metadata?.type,
          data: entry.item.metadata,
        };
      }
    });

    return map;
  }

  /**
   * Equipa un item cosmético
   *
   * Reglas:
   * 1. El item debe existir.
   * 2. El usuario debe poseer el item (compra completed).
   * 3. El item no debe ser consumible (solo cosméticos persistentes).
   * 4. Reemplaza cualquier item previo de la misma categoría.
   */
  async equipItem(userId: string, dto: EquipItemDto): Promise<UserEquippedItem> {
    const { item_id: itemId } = dto;

    // 1. Validar existencia del item (category_id is a plain column, no relation needed)
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new ItemNotFoundError(itemId);
    }

    if (item.is_consumable) {
      throw new ConsumableItemEquipError();
    }

    // 2. Validar propiedad (Ownership)
    const purchase = await this.purchaseRepo.findOne({
      where: {
        user_id: userId,
        item_id: itemId,
        status: 'completed',
      },
    });

    if (!purchase) {
      throw new ItemNotOwnedError();
    }

    // 3. Ejecutar equipamiento (UPSERT logic via Transaction)
    // Usamos transaction para garantizar atomicidad
    return this.equippedRepo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(UserEquippedItem);

      // Buscar si ya hay algo equipado en esta categoría
      const existing = await repo.findOne({
        where: {
          user_id: userId,
          category_id: item.category_id,
        },
      });

      if (existing) {
        // Actualizar existente
        existing.item_id = itemId;
        existing.equipped_at = new Date();
        this.logger.log(`User ${userId} swapped ${existing.category_id} to item ${itemId}`);
        return await repo.save(existing);
      } else {
        // Crear nuevo
        const newEquipped = repo.create({
          user_id: userId,
          category_id: item.category_id,
          item_id: itemId,
        });
        this.logger.log(`User ${userId} equipped new ${item.category_id}: ${itemId}`);
        return await repo.save(newEquipped);
      }
    });
  }

  /**
   * Get equipped items for multiple users in a single query.
   * Returns a map of userId -> { categoryName: itemData }.
   * Used by leaderboard, friends list, etc. to avoid N+1 queries.
   */
  async getEquippedItemsMapBatch(
    userIds: string[],
  ): Promise<Record<string, Record<string, { itemId: string; name: string; assetUrl?: string; type?: string; data: Record<string, unknown> }>>> {
    if (!userIds.length) return {};

    const equipped = await this.equippedRepo.find({
      where: { user_id: In(userIds) },
      relations: ['item', 'category'],
    });

    const result: Record<string, Record<string, { itemId: string; name: string; assetUrl?: string; type?: string; data: Record<string, unknown> }>> = {};

    for (const eq of equipped) {
      if (!eq.category || !eq.item) continue;

      mergeVisualConfig(eq.item);

      if (!result[eq.user_id]) {
        result[eq.user_id] = {};
      }
      result[eq.user_id][eq.category.name] = {
        itemId: eq.item.id,
        name: eq.item.name,
        assetUrl: eq.item.metadata?.asset_url as string | undefined,
        type: eq.item.metadata?.type as string | undefined,
        data: eq.item.metadata || {},
      };
    }

    return result;
  }

  /**
   * Desequipa un item
   * @param userId UUID del usuario
   * @param itemId UUID del item a quitar
   */
  async unequipItem(userId: string, itemId: string): Promise<void> {
    const result = await this.equippedRepo.delete({
      user_id: userId,
      item_id: itemId,
    });

    if (result.affected === 0) {
      throw new ItemNotEquippedError();
    }

    this.logger.log(`User ${userId} unequipped item ${itemId}`);
  }
}
