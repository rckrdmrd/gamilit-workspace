/**
 * PurchaseModal - Confirmation dialog for shop purchases.
 *
 * @module apps/student/components/shop/PurchaseModal
 */

import { Coins } from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ShopIcon } from './ShopIcon';
import { getRarityGradient } from '@shared/utils/rarityColors';
import { cn } from '@shared/utils/cn';
import type { ShopItem } from '@/features/gamification/economy/types/economyTypes';

interface PurchaseModalProps {
  item: ShopItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPurchasing: boolean;
  userBalance: number;
}

export function PurchaseModal({
  item,
  isOpen,
  onClose,
  onConfirm,
  isPurchasing,
  userBalance,
}: PurchaseModalProps) {
  if (!item) return null;

  const canAfford = userBalance >= item.price;
  const balanceAfter = userBalance - item.price;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Compra">
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-lg bg-detective-bg p-4">
          <div
            className={cn(
              'flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br',
              getRarityGradient(item.rarity),
            )}
          >
            <ShopIcon name={item.icon} className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-detective-text">{item.name}</h3>
            <p className="text-sm text-detective-text-secondary">{item.description}</p>
          </div>
        </div>

        {/* Price Summary */}
        <div className="space-y-2 rounded-lg bg-detective-bg p-4">
          <div className="flex items-center justify-between">
            <span className="text-detective-text">Precio:</span>
            <span className="flex items-center gap-1 font-bold text-detective-text">
              <Coins className="h-4 w-4 text-detective-gold" />
              {item.price}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-detective-text">Saldo actual:</span>
            <span className="flex items-center gap-1 font-bold text-detective-text">
              <Coins className="h-4 w-4 text-detective-gold" />
              {userBalance}
            </span>
          </div>
          <hr className="border-detective-bg" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-detective-text">Saldo después:</span>
            <span
              className={cn(
                'flex items-center gap-1 font-bold',
                canAfford ? 'text-green-600' : 'text-red-600',
              )}
            >
              <Coins className="h-4 w-4 text-detective-gold" />
              {balanceAfter}
            </span>
          </div>
        </div>

        {!canAfford && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            ML Coins insuficientes. ¡Completa más ejercicios para ganar monedas!
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <DetectiveButton
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isPurchasing}
            className="flex-1"
          >
            Cancelar
          </DetectiveButton>
          <DetectiveButton
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={!canAfford || isPurchasing}
            loading={isPurchasing}
            className="flex-1"
          >
            {isPurchasing ? 'Comprando...' : 'Confirmar Compra'}
          </DetectiveButton>
        </div>
      </div>
    </Modal>
  );
}
