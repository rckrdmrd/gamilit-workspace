# F1: ANALISIS INICIAL - TAREA-003 GAMIFICATION_SYSTEM

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-003 |
| **Modulo** | gamification_system |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Agente** | @PERFIL_ORQUESTADOR |

---

## 1. OBJETIVO

Realizar analisis inicial del modulo de gamificacion para identificar alcance, archivos y dependencias antes del analisis detallado (F2).

---

## 2. RESUMEN EJECUTIVO

### 2.1 Metricas por Capa

| Capa | Objetos | Estado |
|------|---------|--------|
| **Base de Datos** | 20 tablas, 8 enums, 21 funciones, 13 triggers, 4 materialized views | Produccion |
| **Backend** | 18 entities, 10 services, 10 controllers, 45+ DTOs | Produccion |
| **Frontend** | 5 stores, 5+ APIs, 15+ types, 50+ components | Produccion |

### 2.2 Subsistemas de Gamificacion

| Subsistema | Tablas | Descripcion |
|------------|--------|-------------|
| **User Stats & Ranks** | 3 | Progresion XP, niveles, rangos Maya |
| **Achievements** | 3 | Logros con categorias y progreso |
| **ML Coins Economy** | 2 | Economia virtual (ganar/gastar) |
| **Missions** | 3 | Misiones diarias/semanales/especiales |
| **Comodines (Power-ups)** | 3 | Inventario y uso de comodines |
| **Shop** | 4 | Tienda virtual con items y compras |
| **Leaderboards** | 1 + 4 MVs | Rankings globales/classroom/weekly |
| **Active Boosts** | 1 | Multiplicadores temporales |

---

## 3. CAPA 1: BASE DE DATOS (Schema gamification_system)

### 3.1 Tablas (20 Activas)

| # | Tabla | Columnas | Proposito |
|---|-------|----------|-----------|
| 1 | user_stats | 32 | Estadisticas de usuario (XP, nivel, ML Coins, streaks) |
| 2 | user_ranks | 15 | Progresion de rangos Maya |
| 3 | maya_ranks | 14 | Definiciones de rangos (Ajaw → K'uk'ulkan) |
| 4 | achievements | 17 | Catalogo de logros |
| 5 | user_achievements | 11 | Progreso de logros por usuario |
| 6 | achievement_categories | 7 | Categorias de logros |
| 7 | ml_coins_transactions | 14 | Historial de transacciones ML Coins |
| 8 | missions | 15 | Misiones de usuario |
| 9 | mission_templates | 15 | Templates para generar misiones |
| 10 | classroom_missions | 16 | Misiones asignadas a classrooms |
| 11 | comodines_inventory | 20 | Inventario de power-ups |
| 12 | comodin_usage_log | 10 | Log de uso de comodines |
| 13 | comodin_usage_tracking | 9 | Tracking por ejercicio |
| 14 | active_boosts | 8 | Multiplicadores temporales |
| 15 | leaderboard_metadata | 4 | Metadata de materialized views |
| 16 | shop_items | 20 | Catalogo de items de tienda |
| 17 | shop_categories | 7 | Categorias de tienda |
| 18 | user_purchases | 14 | Historial de compras |
| 19 | inventory_transactions | 6 | Log de transacciones de inventario |
| 20 | notifications | - | DEPRECATED |

### 3.2 Enums (8)

| Enum | Valores | Uso |
|------|---------|-----|
| maya_rank | Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan | 5 rangos de progresion |
| achievement_category | progress, streak, completion, social, special, mastery, exploration, collection, hidden | 9 categorias |
| comodin_type | pistas, vision_lectora, segunda_oportunidad | 3 power-ups |
| transaction_type | 14 tipos (earned_*, spent_*, admin_*) | Transacciones ML Coins |
| shop_item_category | cosmetics, profile, guild, social, consumable | Categorias tienda |
| achievement_type | - | Tipos de logros |
| notification_priority | - | Prioridades (deprecated) |
| notification_type | - | Tipos (deprecated) |

### 3.3 Funciones (21 Activas)

**Rangos & Progresion:**
- calculate_user_rank, update_user_rank, check_rank_promotion
- promote_to_next_rank, get_rank_multiplier, get_user_rank_progress

**Achievements:**
- check_and_award_achievements, claim_achievement_reward

**ML Coins:**
- award_ml_coins, apply_xp_boost

**Comodines:**
- consume_comodin, get_user_comodines, get_user_inventory_summary

**Otros:**
- calculate_level_from_xp, process_exercise_completion

### 3.4 Materialized Views (4)

| Vista | Refresh | Proposito |
|-------|---------|-----------|
| mv_global_leaderboard | Hourly | Ranking global XP |
| mv_classroom_leaderboard | 30 min | Ranking por classroom |
| mv_weekly_leaderboard | Hourly + Monday reset | Ranking semanal |
| mv_mechanic_leaderboard | 2 hours | Por tipo de mision (unused) |

### 3.5 Dependencias Externas

| Schema Externo | Referencias |
|----------------|-------------|
| auth_management.profiles | 15 FKs (user_id) |
| auth_management.tenants | 6 FKs (tenant_id) |
| social_features.classrooms | 1 FK (classroom_missions) |
| educational_content.difficulty_level | 1 ENUM ref |

---

## 4. CAPA 2: BACKEND

### 4.1 Entities (18)

| Entity | Tabla DDL | Campos Clave |
|--------|-----------|--------------|
| UserStats | user_stats | level, total_xp, current_rank, ml_coins, streaks |
| UserRank | user_ranks | current_rank, rank_progress_percentage |
| MayaRank | maya_ranks | name, xp_required, multiplier |
| Achievement | achievements | name, category, conditions, rewards |
| UserAchievement | user_achievements | progress, is_completed |
| AchievementCategory | achievement_categories | name, icon |
| MLCoinsTransaction | ml_coins_transactions | amount, transaction_type |
| Mission | missions | objectives, status, progress |
| MissionTemplate | mission_templates | type, rewards, target_value |
| ClassroomMission | classroom_missions | bonus_xp, bonus_coins |
| ComodinesInventory | comodines_inventory | pistas_available, vision_lectora_available |
| ComodinUsageLog | comodin_usage_log | comodin_type, context |
| ShopItem | shop_items | price, category, rarity |
| ShopCategory | shop_categories | name, icon |
| UserPurchase | user_purchases | quantity, price_paid, status |
| InventoryTransaction | inventory_transactions | type, item_id |
| ActiveBoost | active_boosts | boost_type, multiplier, expires_at |
| LeaderboardMetadata | leaderboard_metadata | view_name, last_refresh_at |

### 4.2 Services (10)

| Service | Metodos Clave |
|---------|---------------|
| UserStatsService | findByUserId, validateProfileExists |
| AchievementsService | CRUD, progress tracking, condition validation |
| MLCoinsService | getBalance, addCoins, spendCoins |
| MissionsService | daily/weekly generation, claimRewards |
| MissionTemplatesService | CRUD, selection logic |
| ClassroomMissionsService | assign, configure bonuses |
| ComodinesService | purchase, use, inventory |
| ShopService | browse, purchase, inventory |
| RanksService | progression, promotion |
| LeaderboardService | getData, calculate rankings |

### 4.3 Controllers (10)

| Controller | Base Path |
|------------|-----------|
| UserStatsController | /api/v1/gamification/users/:userId |
| AchievementsController | /api/v1/gamification/achievements |
| MLCoinsController | /api/v1/gamification/users/:userId/ml-coins |
| MissionsController | /api/v1/gamification/missions |
| MissionTemplatesController | /api/v1/gamification/mission-templates |
| ClassroomMissionsController | /api/v1/gamification/classroom-missions |
| ComodinesController | /api/v1/gamification/comodines |
| ShopController | /api/v1/gamification/shop |
| RanksController | /api/v1/gamification/ranks |
| LeaderboardController | /api/v1/gamification/leaderboard |

### 4.4 DTOs (45+)

Por subsistema:
- UserStats: Create, Update, Response, Summary
- UserRank: Create, Update, Response
- Achievement: Create, Update, Response, Status
- Mission: Create, Update, Response, Stats, Progress
- MLCoins: Transaction, Response
- Comodines: Purchase, Use, Inventory
- Shop: Item, Purchase, Category
- Leaderboard: Entry

---

## 5. CAPA 3: FRONTEND

### 5.1 Stores (Zustand) - 5

| Store | State Clave | Actions |
|-------|-------------|---------|
| economyStore | balance, transactions, cart, inventory | addCoins, spendCoins, purchaseItem |
| ranksStore | userProgress, prestigeProgress, multiplierBreakdown | addXP, checkRankUp, prestige |
| achievementsStore | achievements, stats, recentUnlocks | unlockAchievement, updateProgress |
| powerUpsStore | powerUps, inventory | purchasePowerUp, applyPowerUp |
| leaderboardsStore | currentLeaderboard, selectedType | setLeaderboardType |

### 5.2 Types (15+)

| Archivo | Types Definidos |
|---------|-----------------|
| economyTypes.ts | TransactionTypeEnum, ShopCategory, MLCoinsBalance, Transaction, ShopItem |
| ranksTypes.ts | MayaRank, RankDefinition, UserRankProgress, PrestigeProgress, MultiplierBreakdown |
| achievementsTypes.ts | AchievementCategory, AchievementRarity, AchievementProgress |
| powerUpsTypes.ts | PowerUpType, PowerUp, ActivePowerUp, PowerUpInventory |
| missionsTypes.ts | MissionType, MissionStatus, Mission, MissionStats |

### 5.3 APIs (5+)

| API | Funciones Clave |
|-----|-----------------|
| gamificationAPI | getUserStats, getUserRank, getDailyMissions, getCoinBalance |
| economyAPI | getBalance, earnCoins, spendCoins, purchaseItem |
| ranksAPI | getRanksConfig, getCurrentRank, getMultipliers |
| achievementsAPI | getAllAchievements, getUserAchievements, updateProgress |
| comodinesAPI | purchase, use, getInventory |

### 5.4 Componentes (50+)

Por subsistema:
- **Economy**: CoinWallet, ShopLayout, ShopItem, ShoppingCart, UserInventory
- **Ranks**: RankProgressBar, RankBadgeAdvanced, PrestigeSystem, RankUpModal
- **Achievements**: AchievementCard, AchievementsList, TrophyRoom, ProgressTreeVisualizer
- **Power-ups**: PowerUpCard, PowerUpInventory, PowerUpShop, CooldownTimer
- **Leaderboards**: GlobalLeaderboard, ClassroomLeaderboard, LeaderboardPodium
- **Missions**: MissionCard, MissionGrid, ActiveMissionTracker

---

## 6. MATRIZ DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────────┐
│                 DEPENDENCIAS GAMIFICATION_SYSTEM                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   TABLAS INTERNAS:                                                  │
│   user_stats ──┬─> user_ranks (1:N)                                 │
│                ├─> user_achievements (1:N)                          │
│                ├─> ml_coins_transactions (1:N)                      │
│                ├─> missions (1:N)                                   │
│                └─> comodines_inventory (1:1)                        │
│                                                                      │
│   achievements → user_achievements (1:N)                            │
│   achievement_categories → achievements (1:N)                       │
│   mission_templates → missions (1:N)                                │
│   mission_templates → classroom_missions (1:N)                      │
│   shop_categories → shop_items (1:N)                                │
│   shop_items → user_purchases (1:N)                                 │
│                                                                      │
│   DEPENDENCIAS EXTERNAS:                                            │
│   auth_management.profiles ←── 15+ FKs (user_id en todas tablas)   │
│   auth_management.tenants ←── 6 FKs (multi-tenancy)                │
│   social_features.classrooms ←── classroom_missions                 │
│   educational_content.difficulty_level ←── achievements            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. PUNTOS DE INTEGRACION CRITICOS

| Integracion | Capas | Estado | Riesgo |
|-------------|-------|--------|--------|
| DDL → Entity (20 tablas) | DB → Backend | Por validar | MEDIO |
| Entity → DTO (18 entities) | Backend | Por validar | BAJO |
| DTO → Type (45+ DTOs) | Backend → Frontend | Por validar | ALTO |
| Enums (8 tipos) | Todas | Por validar | MEDIO |
| Maya Ranks (5 niveles) | Todas | Por validar | ALTO |
| Comodin Types (3 tipos) | Todas | Por validar | BAJO |

---

## 8. INCONSISTENCIAS PRELIMINARES

### 8.1 Potenciales Brechas

| # | Capa | Descripcion | Severidad |
|---|------|-------------|-----------|
| 1 | Frontend | MayaRank valores pueden diferir de DDL | ALTA |
| 2 | Frontend | AchievementCategory 4 vs 9 backend | MEDIA |
| 3 | API | ranksAPI.addXP() marcado como "Not Implemented" | MEDIA |
| 4 | API | prestige() sin implementar en backend | BAJA |
| 5 | Stores | economyStore vs MLCoins naming inconsistency | BAJA |

### 8.2 Notas de Arquitectura

- **Materialized Views**: mv_mechanic_leaderboard marcada como unused
- **Notifications table**: DEPRECATED
- **Prestige System**: Frontend tiene UI, backend no implementado

---

## 9. CRITERIOS DE EXITO PARA F2

- [ ] Validacion 20 tablas DDL vs 18 entities
- [ ] Alineacion enums DDL vs Backend vs Frontend
- [ ] Verificacion MayaRank valores (XP thresholds)
- [ ] Verificacion ComodinType costs y disponibilidad
- [ ] Mapeo DTOs (45+) vs Frontend Types (15+)
- [ ] Validacion category mappings (9 backend → 4 frontend)

---

## 10. PROXIMOS PASOS

1. **F2**: Analisis detallado campo por campo
2. **F3**: Plan de correcciones priorizadas
3. **F4**: Validacion del plan
4. **F5**: Refinamiento
5. **F6**: Ejecucion
6. **F7**: Validacion final

---

## 11. ARCHIVOS RELACIONADOS

### Base de Datos
- `/apps/database/ddl/schemas/gamification_system/` (70+ archivos DDL)

### Backend
- `/apps/backend/src/modules/gamification/`

### Frontend
- `/apps/frontend/src/features/gamification/`

---

**Documento generado por:** @PERFIL_ORQUESTADOR
**Fecha:** 2026-01-10
**Version:** 1.0.0
**Siguiente fase:** F2 - Analisis Detallado
