import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';
import { EquipItemDto } from '../dto/inventory/equip-item.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthRequest } from '@shared/types';

@ApiTags('Gamification Inventory')
@Controller('gamification/inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('equipped/batch')
  @ApiOperation({ summary: 'Get equipped items for multiple users (batch)' })
  @ApiResponse({ status: 200, description: 'Map of userId -> equipped items by category' })
  async getEquippedBatch(@Query('userIds') userIds: string) {
    const ids = userIds?.split(',').filter(Boolean).slice(0, 50);
    if (!ids?.length) {
      return {};
    }
    return this.inventoryService.getEquippedItemsMapBatch(ids);
  }

  @Get('equipped')
  @ApiOperation({ summary: 'Get all currently equipped items (skins)' })
  @ApiResponse({ status: 200, description: 'List of equipped items with details' })
  async getEquipped(@Req() req: AuthRequest) {
    return this.inventoryService.getEquippedItems(req.user!.id);
  }

  @Post('equip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Equip a cosmetic item' })
  @ApiResponse({ status: 200, description: 'Item successfully equipped' })
  @ApiResponse({ status: 403, description: 'User does not own the item' })
  @ApiResponse({ status: 400, description: 'Item is not equippable (consumable)' })
  async equip(@Req() req: AuthRequest, @Body() dto: EquipItemDto) {
    return this.inventoryService.equipItem(req.user!.id, dto);
  }

  @Post('unequip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unequip a cosmetic item' })
  @ApiResponse({ status: 200, description: 'Item unequipped' })
  @ApiResponse({ status: 404, description: 'Item was not equipped' })
  async unequip(@Req() req: AuthRequest, @Body() dto: EquipItemDto) {
    return this.inventoryService.unequipItem(req.user!.id, dto.item_id);
  }
}
