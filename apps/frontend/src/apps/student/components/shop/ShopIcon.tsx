/**
 * ShopIcon - Resolves icon name strings to Lucide components.
 *
 * @module apps/student/components/shop/ShopIcon
 */

import {
  Award,
  BookOpen,
  Coins,
  Compass,
  Flag,
  Image,
  Package,
  Shield,
  ShieldCheck,
  Smile,
  Sparkles,
  Square,
  Sticker,
  UserCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const SHOP_ICON_MAP: Record<string, LucideIcon> = {
  award: Award,
  'book-open': BookOpen,
  coins: Coins,
  compass: Compass,
  flag: Flag,
  image: Image,
  shield: Shield,
  'shield-check': ShieldCheck,
  smile: Smile,
  sparkles: Sparkles,
  square: Square,
  sticker: Sticker,
  'user-circle': UserCircle,
  zap: Zap,
};

export function getShopIcon(iconName: string): LucideIcon {
  return SHOP_ICON_MAP[iconName?.toLowerCase()] || Package;
}

export function ShopIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = getShopIcon(name);
  return <IconComponent className={className} />;
}
