---
title: Portal Student - Arquitectura
status: activo
last_updated: "2026-03-01"
---

# Portal Student - Arquitectura

[<-- Volver al Hub](../PORTAL-STUDENT-GUIDE.md) | Siguiente: [02-MODULOS-NAVEGACION.md](./02-MODULOS-NAVEGACION.md)

---

## 1. Visión General

### 1.1 Propósito

El Portal Student es la interfaz principal para estudiantes en GAMILIT. Es una plataforma educativa gamificada con temática de detective e inspiración Maya que proporciona:

- **Aprendizaje Interactivo:** Módulos educativos con ejercicios de comprensión lectora
- **Gamificación Completa:** Sistema de rangos Maya, achievements, misiones y ML Coins
- **Progreso Personalizado:** Dashboard con métricas de desempeño y actividades recientes
- **Economía Virtual:** Tienda de power-ups, comodines y items cosméticos
- **Social:** Leaderboards, guilds, friends y competencia sana
- **Notificaciones:** Sistema de alertas y celebraciones por logros

### 1.2 Usuarios Objetivo

| Rol | Acceso | Funcionalidades |
|-----|--------|-----------------|
| Student | Completo | Todas las funcionalidades del portal |
| Teacher | Supervisión | Vista de progreso de estudiantes |
| Admin | Monitoreo | Vista de todas las métricas y configuración |

### 1.3 Temática y Narrativa

**Tema Principal:** Detective educativo con elementos de cultura Maya

- **Rangos:** Jerarquía Maya (Ajaw → Nacom → Ah K'in → Halach Uinic → K'uk'ulkan)
- **Moneda:** ML Coins (Marie Learning Coins)
- **Narrativa:** Estudiante como "Detective" que resuelve "casos" (ejercicios)
- **Iconografía:** Lupa, expediente, evidencias, rango Maya

---

## 2. Arquitectura del Portal

### 2.1 Estructura de Carpetas

#### Frontend (apps/frontend/src/apps/student/)

```
student/
├── pages/                              # 27 páginas principales
│   ├── DashboardComplete.tsx           # ⭐ Dashboard principal
│   ├── ExercisePage.tsx                # ⭐ Ejercicios interactivos (mecánicas)
│   ├── GamificationPage.tsx            # ⭐ Hub de gamificación
│   ├── ModuleDetailPage.tsx            # Detalle de módulo educativo
│   ├── AchievementsPage.tsx            # Logros desbloqueados
│   ├── ShopPage.tsx                    # Tienda ML Coins
│   ├── LeaderboardPage.tsx             # Rankings globales
│   ├── MissionsPage.tsx                # Misiones activas
│   ├── InventoryPage.tsx               # Inventario de comodines
│   ├── FriendsPage.tsx                 # Sistema de amigos
│   ├── GuildsPage.tsx                  # Guilds/clanes
│   ├── EnhancedProfilePage.tsx         # Perfil de usuario
│   ├── SettingsPage.tsx                # Configuración
│   ├── NotificationsPage.tsx           # Centro de notificaciones
│   ├── AssignmentsPage.tsx             # Tareas del teacher
│   ├── LoginPage.tsx                   # Autenticación
│   ├── RegisterPage.tsx                # Registro
│   ├── PasswordRecoveryPage.tsx        # Recuperación contraseña
│   └── ...
├── components/                         # Componentes organizados por dominio
│   ├── dashboard/                      # Componentes del dashboard
│   │   ├── BottomNavigation.tsx        # ⭐ Navegación móvil (6 tabs)
│   │   ├── EnhancedStatsGrid.tsx       # Estadísticas detective
│   │   ├── RankProgressWidget.tsx      # Widget de rango Maya + cosméticos equipados (frame, badge) [useEquippedVisuals]
│   │   ├── EnhancedStatsGrid.tsx       # Estadísticas detective + cosméticos (frame, badge) [useEquippedVisuals]
│   │   ├── MLCoinsWidget.tsx           # Balance de ML Coins
│   │   ├── MissionsPanel.tsx           # Misiones activas
│   │   ├── ModulesSection.tsx          # Grid de módulos
│   │   ├── RecentActivityPanel.tsx     # Actividades recientes
│   │   ├── QuickActionsWidget.tsx      # Acciones rápidas
│   │   ├── AchievementMilestones.tsx   # Hitos de logros
│   │   └── ...
│   ├── exercise/                       # Componentes de ejercicios
│   │   ├── ExercisePageHeader.tsx      # Header con timer y score
│   │   └── ...
│   ├── gamification/                   # Componentes de gamificación
│   │   ├── AchievementsPreview.tsx     # Preview de logros
│   │   └── ...
│   ├── shop/                           # Tienda (Phase 2)
│   │   ├── ShopItemCard.tsx            # Card de item
│   │   ├── PurchaseModal.tsx           # Modal de confirmación
│   │   └── ShopIcon.tsx               # Iconos por categoría
│   ├── inventory/                      # Inventario (Phase 2)
│   │   ├── InventoryItemCard.tsx       # Card de item
│   │   ├── PowerUpModal.tsx            # Modal de activación
│   │   ├── EmptyInventory.tsx          # Estado vacío
│   │   ├── InventoryHeader.tsx         # Header con stats
│   │   └── InventoryFilters.tsx        # Filtros por categoría
│   ├── module/                         # Módulo educativo (Phase 2)
│   │   ├── ExerciseCard.tsx            # Card de ejercicio
│   │   └── ModuleMetaSections.tsx      # Secciones de metadata
│   ├── profile/                        # Perfil (Phase 2)
│   │   ├── ProfileHero.tsx             # Hero section perfil + avatar/frame/background/title/badge cosméticos
│   │   ├── ProfileStatsTab.tsx         # Tab de estadísticas
│   │   ├── ProfileAchievementsTab.tsx  # Tab de logros
│   │   └── ProfileActivityTab.tsx      # Tab de actividad
│   ├── leaderboard/                    # Leaderboard (Phase 3)
│   │   ├── UserPositionCard.tsx        # Posición del usuario
│   │   ├── LeaderboardStatsGrid.tsx    # Grid de stats
│   │   ├── LeaderboardTable.tsx        # Tabla de ranking
│   │   ├── CategoryBreakdownPanel.tsx  # Desglose por categoría
│   │   └── PodiumDisplay.tsx           # Top 3 podio
│   ├── friends/                        # Amigos (Phase 3)
│   │   ├── FriendsListTab.tsx          # Lista de amigos
│   │   ├── PendingRequestsTab.tsx      # Solicitudes pendientes
│   │   ├── DiscoverTab.tsx             # Buscar amigos
│   │   ├── BlockedUsersTab.tsx         # Usuarios bloqueados
│   │   └── FriendCard.tsx              # Card de amigo
│   ├── guilds/                         # Guilds (Phase 3)
│   │   ├── MyGuildTab.tsx              # Mi guild
│   │   ├── DiscoverGuildsTab.tsx       # Explorar guilds
│   │   ├── GuildMissionsTab.tsx        # Misiones de guild
│   │   ├── GuildCard.tsx               # Card de guild
│   │   └── CreateGuildModal.tsx        # Modal de creación
│   ├── learning/                       # Aprendizaje (Phase 4)
│   │   └── ModuleCard.tsx              # Card de módulo educativo
│   ├── notifications/                  # Notificaciones y celebraciones
│   │   ├── AchievementToast.tsx        # Toast de logro desbloqueado
│   │   └── CelebrationModal.tsx        # Modal de celebración
│   ├── interactions/                   # Interacciones gestuales
│   │   └── SwipeableContainer.tsx      # Swipe para móvil
│   └── PowerUpBar.tsx                  # Barra de power-ups activos
├── hooks/                              # 13 custom hooks (student portal)
│   ├── useDashboardData.ts             # ⭐ Dashboard data + React Query
│   ├── useUserModules.ts               # Módulos del usuario
│   ├── useRecentActivities.ts          # Actividades recientes
│   ├── useAchievementsEnhanced.ts      # Achievements con filtros
│   ├── useProfileData.ts              # ⭐ Agrega 4 stores (Phase 4)
│   ├── useAvatarUpdate.ts             # ⭐ Optimistic avatar update (Phase 4)
│   ├── useExerciseState.ts             # Estado de ejercicio
│   ├── useExerciseAutoSave.ts          # Auto-save de progreso
│   ├── useExercisePowerUps.ts          # Power-ups en ejercicios
│   ├── useUserClassroom.ts             # Classroom del usuario
│   ├── useSwipeGesture.ts              # Gestos táctiles
│   ├── useResponsiveLayout.ts          # Responsive breakpoints
│   └── index.ts                        # Barrel export
└── types/
    └── index.ts                        # 40+ interfaces/types
```

#### Backend - Módulos Principales

```
apps/backend/src/modules/
├── progress/                           # Sistema de progreso
│   ├── controllers/
│   │   ├── exercise-submission.controller.ts
│   │   ├── exercise-attempt.controller.ts
│   │   ├── module-progress.controller.ts
│   │   └── learning-session.controller.ts
│   ├── services/
│   │   ├── exercise-submission.service.ts
│   │   ├── module-progress.service.ts
│   │   └── learning-session.service.ts
│   ├── entities/
│   │   ├── exercise-submission.entity.ts
│   │   ├── module-progress.entity.ts
│   │   └── learning-session.entity.ts
│   └── dto/
│       ├── create-exercise-submission.dto.ts
│       └── exercise-submission-response.dto.ts
├── gamification/                       # Sistema de gamificación
│   ├── controllers/
│   │   ├── achievements.controller.ts
│   │   ├── missions.controller.ts
│   │   ├── ml-coins.controller.ts
│   │   ├── ranks.controller.ts
│   │   ├── leaderboard.controller.ts
│   │   └── comodines.controller.ts
│   ├── services/
│   │   ├── achievements.service.ts
│   │   ├── missions.service.ts
│   │   ├── ml-coins.service.ts
│   │   ├── ranks.service.ts
│   │   └── user-stats.service.ts
│   └── entities/
│       ├── achievement.entity.ts
│       ├── user-achievement.entity.ts
│       ├── mission.entity.ts
│       ├── user-rank.entity.ts
│       ├── ml-coins-transaction.entity.ts
│       └── user-stats.entity.ts
├── educational/                        # Contenido educativo
│   ├── controllers/
│   │   ├── modules.controller.ts
│   │   ├── exercises.controller.ts
│   │   └── media.controller.ts
│   ├── services/
│   │   ├── modules.service.ts
│   │   └── exercises.service.ts
│   └── entities/
│       ├── module.entity.ts
│       └── exercise.entity.ts
└── social/                             # Características sociales
    ├── controllers/
    │   ├── friendships.controller.ts
    │   ├── teams.controller.ts
    │   └── peer-challenges.controller.ts
    └── services/
        ├── friendships.service.ts
        └── teams.service.ts
```

### 2.2 Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                     STUDENT PORTAL                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Dashboard   │───►│  Modules     │───►│  Exercise    │      │
│  │  Complete    │    │  (Learning)  │    │  Page        │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                    │                    │              │
│         │                    │                    │              │
│         ▼                    ▼                    ▼              │
│  ┌──────────────────────────────────────────────────────┐       │
│  │          Custom Hooks Layer (React Query)            │       │
│  │  - useDashboardData()    - useUserModules()          │       │
│  │  - useExerciseState()    - useGamificationData()     │       │
│  └──────────────────────────────────────────────────────┘       │
│         │                    │                    │              │
│         │                    │                    │              │
│         ▼                    ▼                    ▼              │
│  ┌──────────────────────────────────────────────────────┐       │
│  │           API Services Layer (Axios)                 │       │
│  │  - progressAPI    - gamificationAPI                  │       │
│  │  - educationalAPI - socialAPI                        │       │
│  └──────────────────────────────────────────────────────┘       │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                          HTTP/REST
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                        BACKEND API                                │
├──────────────────────────────────────────────────────────────────┤
│  Controllers ──► Services ──► Repositories ──► Database          │
│       │             │                                            │
│       │             ├──► Gamification Module                     │
│       │             ├──► Progress Module                         │
│       │             ├──► Educational Module                      │
│       │             └──► Social Module                           │
└──────────────────────────────────────────────────────────────────┘
```

### 2.3 Pipeline de Cosméticos Equipados

Los items cosméticos de la tienda se renderizan en 4 componentes del portal estudiante via el hook centralizado `useEquippedVisuals()`.

**Flujo de datos:**

```
DB (shop_items.metadata + effect_data)
  → mergeVisualConfig() [backend runtime utility]
    → GET /gamification/inventory/equipped [API response]
      → useEquipment() [React Query, 5min stale]
        → useEquippedVisuals() [useMemo extraction]
          → 4 consumer components
```

**5 categorías visuales:**

| Categoría | Tipo metadata | Props extraídas | Consumidores |
|-----------|--------------|-----------------|--------------|
| Avatar | `avatar` | `src`, `glowColor` | EnhancedProfilePage → ProfileHero, GamifiedHeader → AvatarDisplay |
| Frame | `profile_frame` | `borderColor`, `cssClass`, `assetUrl` | Todos (4 componentes) |
| Background | `profile_background` | `assetUrl` | EnhancedProfilePage → ProfileHero |
| Title | `title` | `text`, `color`, `name` | EnhancedProfilePage → ProfileHero |
| Badge | `badge` | `assetUrl`, `name` | EnhancedProfilePage → ProfileHero, RankProgressWidget, EnhancedStatsGrid |

**Prioridad de renderizado de frame (patron AvatarDisplay):**

1. SVG overlay (`frame.assetUrl`) → `<img>` overlay absoluto posicionado
2. CSS class (`frame.cssClass`) → clase Tailwind en container
3. Border color (`frame.borderColor`) → inline style border
4. Default → clase border por defecto del componente

> **Ref:** `docs/20-architecture/gamificacion/DISENO-SISTEMA-EQUIPAMIENTO.md` para arquitectura backend completa.

### 2.4 Subsistema Comodines (Consumibles)

Arquitectura del sistema de comodines para uso en ejercicios:

```
Frontend                                    Backend
┌──────────────────────────┐               ┌──────────────────────────────┐
│ ConsumablesPanel.tsx      │── POST /use ─>│ ComodinesController          │
│ (exercises/components/)   │               │   └─> ComodinesService       │
│                           │<─ inventory ──│       - getCatalog()         │
│ ShopItemCard.tsx          │               │       - purchase()           │
│ (student/components/shop/)│── POST /shop  │       - use()                │
│                           │   /purchase ─>│       - incrementFromShop    │
│ useExerciseComodines      │               │         Purchase() [bridge]  │
│ (exercises/hooks/)        │               │                              │
└──────────────────────────┘               │  DB:                          │
                                            │  ┌─ comodines_inventory ────┐│
                                            │  │  (wide table, 1 row/user)││
                                            │  └─────────────────────────┘│
                                            │  ┌─ inventory_transactions ─┐│
                                            │  │  (audit, item_id VARCHAR)││
                                            │  └─────────────────────────┘│
                                            └──────────────────────────────┘
```

**Rutas de compra duales:**
1. **Directa:** `POST /gamification/comodines/purchase` → `ComodinesService.purchase()` (deduce ML Coins + incrementa inventario)
2. **Via Tienda:** `POST /gamification/shop/purchase` → `ShopService` → `ComodinesService.incrementFromShopPurchase()` (bridge non-blocking, solo incrementa inventario — ML Coins ya deducidos por shop)

---

[<-- Volver al Hub](../PORTAL-STUDENT-GUIDE.md) | Siguiente: [02-MODULOS-NAVEGACION.md](./02-MODULOS-NAVEGACION.md)
