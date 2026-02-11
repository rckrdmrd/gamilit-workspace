# SPEC-ACHIEVEMENTS - Student Portal Achievements System

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** Claude Code (Auditoría Automatizada)
**Estado:** COMPLETO

---

## 1. Vision General

El sistema de logros proporciona reconocimiento gamificado del progreso del estudiante:
- **9 categorías** de logros organizados por tipo
- **4 niveles de rareza** con visualización distintiva
- **Sistema de notificaciones** para desbloqueos
- **Filtrado y búsqueda** avanzados
- **Estadísticas** de progreso

---

## 2. Páginas Relacionadas

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Achievements (implícito) | Via GamificationPage | Integrado en hub de gamificación |

---

## 3. Componentes

### 3.1 Componentes de Achievements

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| AchievementGrid | `components/achievements/AchievementGrid.tsx` | Grid responsivo de logros |
| AchievementFilters | `components/achievements/AchievementFilters.tsx` | Barra de filtros |
| AchievementDetailModal | `components/achievements/AchievementDetailModal.tsx` | Modal de detalle |
| AchievementStatistics | `components/achievements/AchievementStatistics.tsx` | Panel de estadísticas |
| AchievementsPageHeader | `components/achievements/AchievementsPageHeader.tsx` | Header con progreso circular |

### 3.2 Componentes de Notificación

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| AchievementToast | `components/notifications/AchievementToast.tsx` | Toast de desbloqueo (5s) |
| CelebrationModal | `components/notifications/CelebrationModal.tsx` | Modal de celebración con confetti |

---

## 4. Hooks

| Hook | Archivo | Descripción |
|------|---------|-------------|
| useAchievementsEnhanced | `hooks/useAchievementsEnhanced.ts` | Hook principal con filtros |
| useAchievementsStore | `features/gamification/social/store/achievementsStore` | Zustand store |

---

## 5. APIs Consumidas

### 5.1 Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gamification/users/{userId}/achievements` | GET | Lista de achievements del usuario |

### 5.2 Response Type

```typescript
interface AchievementWithProgress {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  mlCoinsReward: number;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  isHidden?: boolean;
  progress?: {
    current: number;
    required: number;
    percentage?: number;
  };
  requirements?: AchievementRequirements;
  rewardsClaimed?: boolean;
}
```

---

## 6. Categorías de Logros

| Categoría | Descripción | Mapping Backend |
|-----------|-------------|-----------------|
| progress | Progreso en cursos | educational, progress |
| mastery | Dominio de skills | mastery, skill |
| social | Interacción social | social |
| hidden | Logros secretos | hidden, special |
| streak | Rachas diarias | (derivado) |
| completion | Módulos/ejercicios | (derivado) |
| exploration | Descubrimiento | (derivado) |
| collection | Acumulación | (derivado) |

---

## 7. Sistema de Rarezas

### 7.1 Niveles

| Rareza | Color | Glow | Distribución |
|--------|-------|------|--------------|
| Common | Gray | `shadow-gray-200` | 75% |
| Rare | Green | `shadow-green-300` | 15-20% |
| Epic | Purple | `shadow-purple-300` | 5-10% |
| Legendary | Gold | `shadow-gold-400` | <5% |

### 7.2 Gradientes

```typescript
const rarityGradients: Record<string, string> = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-green-400 to-green-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-detective-gold'
};
```

---

## 8. Sistema de Filtros

### 8.1 Filtros Disponibles

```typescript
interface AchievementFiltersState {
  category: AchievementCategory | 'all';
  rarity: AchievementRarity | 'all';
  status: 'all' | 'unlocked' | 'locked' | 'in_progress';
  searchQuery: string;
  sortBy: 'recent' | 'alphabetical' | 'rarity' | 'progress';
}
```

### 8.2 Ordenamiento

| Tipo | Descripción |
|------|-------------|
| recent | Por unlockedAt descendente |
| alphabetical | Por title (localeCompare) |
| rarity | legendary > epic > rare > common |
| progress | % completación descendente |

---

## 9. Notificaciones

### 9.1 Toast de Desbloqueo

- **Duración:** 5 segundos auto-close
- **Stack:** Hasta 3 simultáneos
- **Posición:** top-20 right-4
- **Animaciones:** spring stiffness: 300, damping: 30

### 9.2 Modal de Celebración

- **Confetti:** 30 partículas
- **Duración:** 2-4 segundos de caída
- **Tipos:** module, rank, achievement
- **Acciones:** Compartir (Twitter, Facebook), Continuar

---

## 10. Estadísticas

```typescript
interface AchievementStatisticsData {
  total: number;
  unlocked: number;
  locked: number;
  inProgress: number;
  completionRate: number;  // 0-100
  pointsEarned: number;
  mlCoinsEarned: number;
  byRarity: Record<AchievementRarity, number>;
  byCategory: Record<AchievementCategory, number>;
  recentUnlocks: Achievement[];
  rarestUnlocked: Achievement[];
}
```

---

## 11. Estados del Logro

```
LOCKED (isUnlocked: false, progress.current = 0)
   ↓
IN_PROGRESS (isUnlocked: false, progress.current > 0)
   ↓
UNLOCKED (isUnlocked: true)
   ↓
CLAIMED (rewardsClaimed: true)
```

---

## 12. Gaps Conocidos

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| GAP-P1-008 | API fragmentada (achievementsAPI vs gamificationApi) | Media | Pendiente |
| GAP-P2-008 | Colores de rarity duplicados | Baja | Pendiente |
| GAP-P2-009 | Sin error boundary en componentes | Media | Pendiente |

---

## 13. Referencias

- **Hooks:** `STUDENT-HOOKS-SPEC.md`
- **Store:** `features/gamification/social/store/achievementsStore.ts`
- **Gaps:** `orchestration/analisis/GAPS-STUDENT-PORTAL.yml`

---

*Generado: 2026-01-24*
*Sistema SIMCO v4.3.0*
