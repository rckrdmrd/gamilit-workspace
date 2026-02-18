import apiClient from '@/services/api/apiClient';
import { EquippedItem, EquipItemPayload } from '../types/inventory.types';

const BASE_URL = '/gamification/inventory';
const SHOP_URL = '/gamification/shop';

/**
 * Obtiene los items equipados actualmente
 */
export const getEquippedItems = async (): Promise<EquippedItem[]> => {
  const response = await apiClient.get(`${BASE_URL}/equipped`);
  return response.data;
};

/**
 * Obtiene todos los items comprados por el usuario
 */
export const getPurchasedItems = async (userId: string): Promise<any[]> => {
  const response = await apiClient.get(`${SHOP_URL}/purchases/${userId}`);
  return response.data;
};

/**
 * Equipa un item cosmético
 */
export const equipItem = async (payload: EquipItemPayload): Promise<EquippedItem> => {
  const response = await apiClient.post(`${BASE_URL}/equip`, payload);
  return response.data;
};

/**
 * Desequipa un item cosmético
 */
export const unequipItem = async (payload: EquipItemPayload): Promise<void> => {
  await apiClient.post(`${BASE_URL}/unequip`, payload);
};
