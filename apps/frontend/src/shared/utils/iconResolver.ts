import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  Compass,
  Crown,
  Dumbbell,
  Flame,
  Gift,
  GraduationCap,
  Key,
  Layers,
  Link,
  Lock,
  Puzzle,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  award: Award,
  'book-open': BookOpen,
  brain: Brain,
  calendar: Calendar,
  'check-circle': CheckCircle,
  clock: Clock,
  coins: Coins,
  compass: Compass,
  crown: Crown,
  dumbbell: Dumbbell,
  flame: Flame,
  gift: Gift,
  'graduation-cap': GraduationCap,
  key: Key,
  layers: Layers,
  link: Link,
  lock: Lock,
  puzzle: Puzzle,
  search: Search,
  shield: Shield,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  timer: Timer,
  'trending-up': TrendingUp,
  trophy: Trophy,
  users: Users,
  zap: Zap,
};

const aliases: Record<string, string> = {
  book_open: 'book-open',
  check_circle: 'check-circle',
  graduation_cap: 'graduation-cap',
  trending_up: 'trending-up',
  user: 'users',
};

function normalizeIconName(iconName?: string): string {
  if (!iconName) return '';
  const normalized = iconName.trim().toLowerCase().replace(/\s+/g, '-');
  return aliases[normalized] || normalized;
}

export function resolveLucideIcon(
  iconName: string | undefined,
  fallbackName: string = 'target',
): LucideIcon {
  const normalized = normalizeIconName(iconName);
  const fallbackNormalized = normalizeIconName(fallbackName) || 'target';

  return iconMap[normalized] || iconMap[fallbackNormalized] || Target;
}
