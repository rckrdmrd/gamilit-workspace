# Componentes de Layout - Frontend GAMILIT

**Proyecto:** GAMILIT Platform v2
**Módulo:** Componentes Compartidos - Layout y Navegación
**Ubicación:** `src/shared/components/layout/`
**Fecha:** 2025-11-01
**Versión:** 1.0

---

## RFC-0001 Header

```yaml
id: FRONTEND-COMPONENTES-LAYOUT-003
título: Componentes de Layout y Navegación
estado: Implementado
fecha_creación: 2025-10-27
última_actualización: 2025-11-01
autor: Equipo Frontend GAMILIT
```

**Historial de Cambios:**
- **2025-11-01:** Modularización desde COMPONENTES-COMPARTIDOS.md
- **2025-10-27:** Creación inicial

---

## 1. Resumen Ejecutivo

Este documento describe los **componentes de layout y navegación** del frontend de GAMILIT, incluyendo header, sidebar, containers y componentes especializados.

### Componentes de Layout (7+):

1. **GamifiedHeader** - Header principal con stats
2. **GamilitSidebar** - Navegación lateral
3. **DetectiveContainer** - Container responsive
4. **DetectiveFooter** - Footer base
5. **DetectiveGrid** - Grid layout
6. **AchievementCard** - Cards de logros
7. **ModuleCard** - Cards de módulos

### Componentes Especializados:

- **Gamification Components** - Componentes de gamificación
- **Social Components** - Componentes sociales
- **Educational Components** - Componentes educativos

---

## 2. Componentes de Layout Principal

### 2.1 GamifiedHeader

**Responsabilidad:** Header principal con estadísticas del usuario gamificado.

**Ubicación:** `src/shared/components/layout/GamifiedHeader.tsx`

**Props:**
```typescript
interface GamifiedHeaderProps {
  user: User;
  xp: number;
  mlCoins: number;
  rank: MayaRank;
  notifications?: number;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  role: 'student' | 'admin_teacher' | 'super_admin';
}
```

**Implementación:**
```tsx
import React from 'react';
import { Zap, Coins, Bell, User as UserIcon } from 'lucide-react';
import { RankBadge } from '../base/RankBadge';

export const GamifiedHeader: React.FC<GamifiedHeaderProps> = ({
  user,
  xp,
  mlCoins,
  rank,
  notifications = 0,
  onProfileClick,
  onNotificationsClick,
}) => {
  return (
    <header className="gamified-header bg-white shadow-card border-b-4 border-detective-orange">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y Título */}
          <div className="header-left flex items-center gap-4">
            <div className="w-12 h-12 bg-detective-orange rounded-detective flex items-center justify-center">
              <span className="text-2xl font-bold text-white">G</span>
            </div>
            <h1 className="text-detective-2xl font-bold text-detective-text">
              GAMILIT Platform
            </h1>
          </div>

          {/* Stats Center */}
          <div className="header-center flex items-center gap-6">
            {/* XP Badge */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full">
              <Zap className="w-5 h-5 text-purple-600" />
              <div className="flex flex-col">
                <span className="text-xs text-detective-text-secondary">XP</span>
                <span className="text-lg font-bold text-purple-600">{xp.toLocaleString()}</span>
              </div>
            </div>

            {/* ML Coins Badge */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-2 rounded-full">
              <Coins className="w-5 h-5 text-detective-gold" />
              <div className="flex flex-col">
                <span className="text-xs text-detective-text-secondary">ML Coins</span>
                <span className="text-lg font-bold text-detective-gold">{mlCoins.toLocaleString()}</span>
              </div>
            </div>

            {/* Rank Badge */}
            <RankBadge rank={rank} size="md" showName />
          </div>

          {/* Right Actions */}
          <div className="header-right flex items-center gap-4">
            {/* Notifications */}
            <button
              onClick={onNotificationsClick}
              className="relative p-2 hover:bg-detective-bg rounded-full transition-all"
            >
              <Bell className="w-6 h-6 text-detective-text-secondary" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-detective-danger text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Menu */}
            <button
              onClick={onProfileClick}
              className="flex items-center gap-2 hover:bg-detective-bg px-3 py-2 rounded-detective transition-all"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-detective-orange rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-detective-base font-medium text-detective-text">
                {user.name}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
```

---

### 2.2 GamilitSidebar

**Responsabilidad:** Navegación lateral con menú por rol.

**Ubicación:** `src/shared/components/layout/GamilitSidebar.tsx`

**Props:**
```typescript
interface GamilitSidebarProps {
  userRole: 'student' | 'admin_teacher' | 'super_admin';
  currentPath: string;
  onNavigate?: (path: string) => void;
  collapsed?: boolean;
}
```

**Implementación:**
```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Trophy,
  ShoppingBag,
  Users,
  Eye,
  ClipboardList,
  BarChart,
  Settings,
} from 'lucide-react';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const STUDENT_MENU: MenuItem[] = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Aprender', path: '/learning' },
  { icon: Trophy, label: 'Logros', path: '/achievements' },
  { icon: ShoppingBag, label: 'Tienda', path: '/shop' },
  { icon: Users, label: 'Social', path: '/social' },
];

const TEACHER_MENU: MenuItem[] = [
  { icon: Home, label: 'Dashboard', path: '/teacher/dashboard' },
  { icon: Eye, label: 'Monitoreo', path: '/teacher/monitoring' },
  { icon: ClipboardList, label: 'Tareas', path: '/teacher/assignments' },
  { icon: BarChart, label: 'Analytics', path: '/teacher/analytics' },
];

const ADMIN_MENU: MenuItem[] = [
  { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Usuarios', path: '/admin/users' },
  { icon: Settings, label: 'Configuración', path: '/admin/settings' },
  { icon: BarChart, label: 'Monitoreo', path: '/admin/monitoring' },
];

export const GamilitSidebar: React.FC<GamilitSidebarProps> = ({
  userRole,
  currentPath,
  onNavigate,
  collapsed = false,
}) => {
  const navigate = useNavigate();

  const menu =
    userRole === 'student'
      ? STUDENT_MENU
      : userRole === 'admin_teacher'
      ? TEACHER_MENU
      : ADMIN_MENU;

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <aside
      className={`
        gamilit-sidebar bg-white border-r border-detective-border-light
        ${collapsed ? 'w-20' : 'w-64'}
        transition-all duration-300 h-screen sticky top-0
      `}
    >
      <nav className="p-4">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-detective
                transition-all duration-200 mb-2
                ${
                  isActive
                    ? 'bg-detective-orange text-white shadow-orange'
                    : 'text-detective-text-secondary hover:bg-detective-bg hover:text-detective-orange'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
```

---

### 2.3 DetectiveContainer

**Responsabilidad:** Container responsive con padding y max-width.

**Ubicación:** `src/shared/components/layout/DetectiveContainer.tsx`

**Props:**
```typescript
interface DetectiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}
```

**Implementación:**
```tsx
export const DetectiveContainer: React.FC<DetectiveContainerProps> = ({
  children,
  className = '',
  maxWidth = '7xl',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`detective-container ${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {children}
    </div>
  );
};
```

---

### 2.4 DetectiveGrid

**Responsabilidad:** Grid layout responsive para contenido.

**Ubicación:** `src/shared/components/layout/DetectiveGrid.tsx`

**Props:**
```typescript
interface DetectiveGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 2 | 4 | 6 | 8;
  className?: string;
}
```

**Implementación:**
```tsx
export const DetectiveGrid: React.FC<DetectiveGridProps> = ({
  children,
  cols = 3,
  gap = 6,
  className = '',
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div className={`grid ${colsClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};
```

---

## 3. Componentes Especializados

### 3.1 Componentes de Gamificación

#### EconomyDisplay

**Responsabilidad:** Mostrar balance y transacciones recientes.

**Ubicación:** `src/shared/components/specialized/gamification/EconomyDisplay.tsx`

```tsx
interface EconomyDisplayProps {
  balance: number;
  transactions: Transaction[];
  compact?: boolean;
}

export const EconomyDisplay: React.FC<EconomyDisplayProps> = ({
  balance,
  transactions,
  compact = false,
}) => {
  return (
    <div className="economy-display bg-gradient-to-br from-yellow-50 to-amber-100 rounded-detective p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-detective-xl font-bold text-detective-text">
          Balance ML Coins
        </h3>
        <span className="text-detective-3xl font-bold text-detective-gold">
          {balance.toLocaleString()}
        </span>
      </div>

      {!compact && (
        <div className="transactions">
          <h4 className="text-detective-base font-medium text-detective-text-secondary mb-2">
            Transacciones Recientes
          </h4>
          {transactions.slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2 border-b border-amber-200"
            >
              <span className="text-detective-sm text-detective-text">
                {tx.description}
              </span>
              <span
                className={`font-bold ${
                  tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {tx.amount > 0 ? '+' : ''}
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### RankProgressCard

**Responsabilidad:** Mostrar progreso de rango y nivel.

```tsx
interface RankProgressCardProps {
  currentRank: MayaRank;
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  multiplier: number;
}

export const RankProgressCard: React.FC<RankProgressCardProps> = ({
  currentRank,
  currentLevel,
  currentXP,
  xpToNextLevel,
  multiplier,
}) => {
  const progress = (currentXP / xpToNextLevel) * 100;

  return (
    <div className="rank-progress-card bg-white rounded-detective shadow-card p-6">
      <div className="flex items-center gap-4 mb-4">
        <RankBadge rank={currentRank} size="lg" />
        <div>
          <h3 className="text-detective-2xl font-bold text-detective-text">
            Nivel {currentLevel}
          </h3>
          <p className="text-detective-sm text-detective-text-secondary">
            Multiplicador: x{multiplier}
          </p>
        </div>
      </div>

      <ProgressBar
        value={currentXP}
        max={xpToNextLevel}
        showLabel
        label="Progreso al siguiente nivel"
        variant="xp"
        animated
      />
    </div>
  );
};
```

---

### 3.2 Componentes Sociales

#### AchievementCard

**Responsabilidad:** Mostrar logros desbloqueados/bloqueados.

**Ubicación:** `src/shared/components/specialized/social/AchievementCard.tsx`

```tsx
interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  showProgress?: boolean;
  onClick?: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: number;
  maxProgress?: number;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked,
  showProgress = false,
  onClick,
}) => {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-orange-400 to-orange-600',
    legendary: 'from-yellow-400 to-amber-600',
  };

  return (
    <div
      className={`
        achievement-card rounded-detective p-4 cursor-pointer
        transition-all duration-200 hover:shadow-card-hover
        ${isUnlocked ? 'bg-white' : 'bg-gray-100 opacity-60'}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            bg-gradient-to-br ${rarityColors[achievement.rarity]}
            text-white text-2xl
          `}
        >
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-detective-text">{achievement.title}</h4>
          <p className="text-detective-sm text-detective-text-secondary">
            {achievement.description}
          </p>
        </div>
      </div>

      {showProgress && achievement.progress !== undefined && (
        <ProgressBar
          value={achievement.progress}
          max={achievement.maxProgress || 100}
          showLabel
          size="sm"
        />
      )}
    </div>
  );
};
```

---

### 3.3 Componentes Educativos

#### ModuleCard

**Responsabilidad:** Card de módulo educativo con progreso.

**Ubicación:** `src/shared/components/specialized/educational/ModuleCard.tsx`

```tsx
interface ModuleCardProps {
  module: Module;
  progress: number;
  isLocked: boolean;
  onClick?: () => void;
}

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
  totalExercises: number;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  progress,
  isLocked,
  onClick,
}) => {
  const difficultyColors = {
    facil: 'bg-green-100 text-green-800',
    medio: 'bg-yellow-100 text-yellow-800',
    dificil: 'bg-orange-100 text-orange-800',
    experto: 'bg-red-100 text-red-800',
  };

  return (
    <DetectiveCard
      title={module.title}
      subtitle={module.description}
      icon={<BookOpen />}
      variant={isLocked ? 'default' : 'orange'}
      hoverable={!isLocked}
      onClick={isLocked ? undefined : onClick}
      className={isLocked ? 'opacity-50' : ''}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-sm ${difficultyColors[module.difficulty]}`}>
          {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
        </span>
        <span className="text-detective-sm text-detective-text-secondary">
          {module.totalExercises} ejercicios
        </span>
      </div>

      <ProgressBar
        value={progress}
        max={100}
        showLabel
        label="Progreso"
        variant="default"
      />

      {isLocked && (
        <div className="mt-3 flex items-center gap-2 text-detective-text-secondary">
          <span className="text-2xl">🔒</span>
          <span className="text-sm">Desbloquea el módulo anterior</span>
        </div>
      )}
    </DetectiveCard>
  );
};
```

---

## 4. Hooks de Layout

### 4.1 useNavigation

**Ubicación:** `src/shared/hooks/useNavigation.ts`

```typescript
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';

export const useNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const goToDashboard = () => {
    const path =
      user?.role === 'student'
        ? '/dashboard'
        : user?.role === 'admin_teacher'
        ? '/teacher/dashboard'
        : '/admin/dashboard';
    navigate(path);
  };

  const goToModule = (moduleId: string) => {
    navigate(`/learning/${moduleId}`);
  };

  const goBack = () => navigate(-1);

  return { goToDashboard, goToModule, goBack, navigate };
};
```

---

## 5. Mejores Prácticas

### 5.1 Responsividad

- **Mobile-first** approach
- Breakpoints consistentes (sm, md, lg, xl, 2xl)
- Layouts fluidos con grid y flexbox

### 5.2 Performance

- Lazy loading de componentes pesados
- Memoización de componentes complejos
- Virtualización para listas largas

### 5.3 Accesibilidad

- Navegación por teclado
- ARIA labels en menús
- Contraste de colores adecuado

---

## 6. Referencias

- **Archivo Original:** `COMPONENTES-COMPARTIDOS.md` (líneas 186-451)
- **Componentes UI:** Ver `Componentes-UI.md`
- **Componentes de Forms:** Ver `Componentes-Forms.md`
- **README Principal:** Ver `componentes/README.md`

---

**Documento generado:** 2025-11-01
**Versión:** 1.0
**Total de Componentes de Layout:** 7+
