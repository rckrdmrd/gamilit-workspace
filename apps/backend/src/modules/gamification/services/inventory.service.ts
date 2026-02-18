import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { UserEquippedItem } from '../entities/user-equipped-item.entity';
import { UserPurchase } from '../entities/user-purchase.entity';
import { ShopItem } from '../entities/shop-item.entity';
import { EquipItemDto } from '../dto/inventory/equip-item.dto';

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
    return this.equippedRepo.find({
      where: { user_id: userId },
      relations: ['item', 'category'],
    });
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
    const { itemId } = dto;

    // 1. Validar existencia del item y categoría
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: ['category'], // Necesitamos la categoría para la unicidad
    });

    if (!item) {
      throw new NotFoundException(`Item ${itemId} not found`);
    }

    if (item.is_consumable) {
      throw new BadRequestException('Cannot equip consumable items. Use them from inventory.');
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
      throw new ForbiddenException('You do not own this item');
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
      throw new NotFoundException('Item not currently equipped');
    }

    this.logger.log(`User ${userId} unequipped item ${itemId}`);
  }
}
