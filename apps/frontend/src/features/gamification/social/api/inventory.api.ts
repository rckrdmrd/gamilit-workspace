import apiClient from '@/services/api/apiClient';
import { handleAPIError } from '@/services/api/apiErrorHandler';
import { EquippedItem, EquipItemPayload } from '../types/inventory.types';

const BASE_URL = '/gamification/inventory';
const SHOP_URL = '/gamification/shop';

/**
 * Obtiene los items equipados actualmente
 */
export const getEquippedItems = async (): Promise<EquippedItem[]> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/equipped`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Error al obtener items equipados');
  }
};

/**
 * Obtiene mapa de items equipados para multiples usuarios (batch).
 * Retorna { userId: { categoryName: itemData } }
 */
export const getEquippedItemsBatch = async (
  userIds: string[],
): Promise<Record<string, Record<string, { itemId: string; name: string; assetUrl?: string; type?: string; data: Record<string, unknown> }>>> => {
  if (!userIds.length) return {};
  try {
    const response = await apiClient.get(`${BASE_URL}/equipped/batch`, {
      params: { userIds: userIds.join(',') },
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Error al obtener items equipados en batch');
  }
};

/**
 * Obtiene todos los items comprados por el usuario
 */
export const getPurchasedItems = async (userId: string): Promise<Record<string, unknown>[]> => {
  try {
    const response = await apiClient.get(`${SHOP_URL}/purchases/${userId}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Error al obtener compras del usuario');
  }
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Equipa un item cosmético
 */
export const equipItem = async (payload: EquipItemPayload): Promise<EquippedItem> => {
  if (!payload.itemId || !UUID_REGEX.test(payload.itemId)) {
    throw new Error(`Invalid item_id for equip: expected UUID, got "${String(payload.itemId)}" (${typeof payload.itemId})`);
  }
  try {
    const response = await apiClient.post(`${BASE_URL}/equip`, {
      item_id: payload.itemId,
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Error al equipar item');
  }
};

/**
 * Desequipa un item cosmético
 */
export const unequipItem = async (payload: EquipItemPayload): Promise<void> => {
  if (!payload.itemId || !UUID_REGEX.test(payload.itemId)) {
    throw new Error(`Invalid item_id for unequip: expected UUID, got "${String(payload.itemId)}" (${typeof payload.itemId})`);
  }
  try {
    await apiClient.post(`${BASE_URL}/unequip`, {
      item_id: payload.itemId,
    });
  } catch (error) {
    throw handleAPIError(error, 'Error al desequipar item');
  }
};
