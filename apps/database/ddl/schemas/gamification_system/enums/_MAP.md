# Mapa de ENUMs del Schema gamification_system

**Total de ENUMs:** 6
**Última actualización:** 2025-11-08
**Migrados desde public:** 4 (maya_rank, achievement_category, achievement_type, comodin_type)
**Creados:** 2 (transaction_type v2.0, notification_priority v1.0)

---

## Resumen

Este directorio contiene todos los tipos enumerados (ENUMs) del schema `gamification_system`. Estos ENUMs son específicos del sistema de gamificación (rangos mayas, logros, transacciones de ML Coins).

---

## Lista de ENUMs

| # | Nombre | Archivo | Descripción | Valores | Estado | Versión |
|---|--------|---------|-------------|---------|--------|---------|
| 1 | maya_rank | maya_rank.sql | Rangos jerárquicos mayas del sistema | 5 valores | ✅ Correcto | v2.0 (2025-11-03) |
| 2 | achievement_category | achievement_category.sql | Categorías de logros desbloqueables | 7 valores | ✅ Migrado | v1.0 (2025-11-07) |
| 3 | achievement_type | achievement_type.sql | Tipos de achievements | 4 valores | ✅ Migrado | v1.0 (2025-11-07) |
| 4 | transaction_type | transaction_type.sql | Tipos de transacciones de ML Coins | 14 valores | ✅ Actualizado | v2.0 (2025-11-08) |
| 5 | notification_priority | notification_priority.sql | Prioridad de notificaciones (urgencia) | 3 valores | ✅ Creado | v1.0 (2025-11-08) |
| 6 | comodin_type | comodin_type.sql | Tipos de comodines (power-ups) | 3 valores | ✅ Migrado | v1.0 (2025-11-08) |

---

## Valores Detallados por ENUM

### 1. maya_rank (5 valores)
**Descripción:** Rangos jerárquicos mayas del sistema de gamificación

**Valores:**
- `'Ajaw'` - Nivel 1: Señor, líder supremo (0-999 XP)
- `'Nacom'` - Nivel 2: Capitán de guerra (1,000-2,999 XP)
- `'Ah K''in'` - Nivel 3: Sacerdote del sol (3,000-5,999 XP)
- `'Halach Uinic'` - Nivel 4: Hombre verdadero (6,000-9,999 XP)
- `'K''uk''ulkan'` - Nivel 5: Serpiente emplumada (10,000+ XP)

**Usado en:**
- `gamification_system.user_ranks` (columna: `rank`)
- `educational_content.modules` (columna: `min_rank_required`)

**Migración:**
- ✅ Migrado de `public.maya_rank` el 2025-11-03
- ✅ Eliminado `public.rango_maya` (legacy)

**Referencias:**
- Docs: `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md:28-70`
- Backend: `apps/backend/src/shared/constants/enums.constants.ts` (MayaRank)

---

### 2. achievement_category (7 valores)
**Descripción:** Categorías de logros/achievements

**Valores:**
- `'progress'` - Logros de progreso
- `'streak'` - Logros de racha
- `'completion'` - Logros de completitud
- `'social'` - Logros sociales
- `'special'` - Logros especiales
- `'mastery'` - Logros de maestría
- `'exploration'` - Logros de exploración

**Usado en:**
- `gamification_system.achievements` (columna: `category`)

**Migración:**
- ✅ Migrado de `public.achievement_category` el 2025-11-07
- ✅ Migration: `2025-11-07-fix-achievement-enums-schema.sql`

**Referencias:**
- Docs: `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md:145-186`
- Backend: `apps/backend/src/shared/constants/enums.constants.ts` (AchievementCategoryEnum)

---

### 3. achievement_type (4 valores)
**Descripción:** Tipos de achievements

**Valores:**
- `'badge'` - Insignia
- `'milestone'` - Hito
- `'special'` - Especial
- `'rank_promotion'` - Promoción de rango

**Usado en:**
- Actualmente NO usado en tablas (reservado para futuro)

**Migración:**
- ✅ Migrado de `public.achievement_type` el 2025-11-07
- ✅ Migration: `2025-11-07-fix-achievement-enums-schema.sql`

**Referencias:**
- Docs: `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md:145-186`
- Backend: `apps/backend/src/shared/constants/enums.constants.ts` (AchievementTypeEnum)

---

### 4. transaction_type (14 valores) ⭐ ACTUALIZADO
**Descripción:** Tipos de transacciones de ML Coins (Maya Learning Coins)

**Valores:**

**EARNED (Ingresos - 7 tipos):**
- `'earned_exercise'` - Ganado por completar ejercicio (+5-50 coins)
- `'earned_module'` - Ganado por completar módulo (+100-300 coins)
- `'earned_achievement'` - Ganado por desbloquear logro (+50-500 coins)
- `'earned_rank'` - Ganado por subir de rango (+100-1000 coins)
- `'earned_streak'` - Ganado por racha de días (+10-100 coins)
- `'earned_daily'` - Ganado por login diario (+50 coins)
- `'earned_bonus'` - Bonus especial por eventos

**SPENT (Gastos - 3 tipos):**
- `'spent_powerup'` - Gastado en power-ups/comodines (-15 a -40 coins)
- `'spent_hint'` - Gastado en pistas (-10 coins)
- `'spent_retry'` - Gastado en reintento (-20 coins)

**ADMIN/SISTEMA (4 tipos):**
- `'admin_adjustment'` - Ajuste manual por admin (+ o -)
- `'refund'` - Devolución de coins
- `'bonus'` - Bonus general del sistema
- `'welcome_bonus'` - Bonus de bienvenida (+100 coins)

**Usado en:**
- `gamification_system.ml_coins_transactions` (columna: `transaction_type`)

**Actualización v2.0 (2025-11-08):**
- ✅ DDL actualizado con 14 valores oficiales (2025-11-07)
- ✅ Backend constants actualizado: TransactionTypeEnum (2025-11-08)
- ✅ Services actualizados: ranks.service.ts usa EARNED_RANK (2025-11-08)
- ✅ Migration creado: `2025-11-08-sync-transaction-type-enum.sql`

**Migración de valores legacy:**
- `earned_daily_bonus` → `earned_daily`
- `earned_rank_promotion` → `earned_rank`
- `spent_unlock_content` → `spent_powerup`
- `spent_customization` → `spent_powerup`
- `gift` → `bonus`

**Referencias:**
- Docs: `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md:210-300`
- DDL: `apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql`
- Backend: `apps/backend/src/shared/constants/enums.constants.ts` (TransactionTypeEnum)
- Entity: `apps/backend/src/modules/gamification/entities/ml-coins-transaction.entity.ts`

---

### 5. notification_priority (3 valores) ⭐ NUEVO
**Descripción:** Prioridad de notificaciones para ordenar por urgencia

**Valores:**
- `'low'` - Prioridad baja: Notificaciones informativas, sin urgencia
- `'medium'` - Prioridad media: Notificaciones estándar (DEFAULT)
- `'high'` - Prioridad alta: Notificaciones urgentes que requieren atención inmediata

**Usado en:**
- `gamification_system.notifications` (columna: `priority`, DEFAULT: 'medium')

**Creación v1.0 (2025-11-08):**
- ✅ DDL creado: `notification_priority.sql` (2025-11-08)
- ✅ Columna agregada a tabla notifications (v3.0)
- ✅ Backend constants: NotificationPriorityEnum creado
- ✅ Entity actualizado: notification.entity.ts (v3.0)
- ✅ Migration: `2025-11-08-add-notification-priority.sql`
- ✅ public.notification_priority eliminado (tenía 4 valores legacy con 'critical')

**Categorización sugerida (NOTIFICATION_PRIORITY_BY_TYPE):**
- **high**: system_announcement, message_received
- **medium**: achievement_unlocked, rank_up, mission_completed, guild_invitation, friend_request
- **low**: level_up, ml_coins_earned, streak_milestone, exercise_feedback

**Referencias:**
- Docs: `docs/02-especificaciones-tecnicas/trazabilidad/05-realtime-notifications.md:240`
- DDL: `apps/database/ddl/schemas/gamification_system/enums/notification_priority.sql`
- Backend: `apps/backend/src/shared/constants/enums.constants.ts` (NotificationPriorityEnum, NOTIFICATION_PRIORITY_BY_TYPE)
- Entity: `apps/backend/src/modules/notifications/entities/notification.entity.ts`

---

### 6. comodin_type (3 valores) ⭐ MIGRADO
**Descripción:** Tipos de comodines (power-ups) para ayuda en ejercicios

**Valores:**
- `'pistas'` - Pistas Contextuales: Ayudas sobre el ejercicio (15 ML Coins)
- `'vision_lectora'` - Visión Lectora: Revela parte del texto clave (25 ML Coins)
- `'segunda_oportunidad'` - Segunda Oportunidad: Permite reintento del ejercicio (40 ML Coins)

**Usado en:**
- `educational_content.exercises` (columna: `comodines_allowed` - ARRAY type: `comodin_type[]`)

**Migración v1.0 (2025-11-08):**
- ✅ Migrado de public.comodin_type a gamification_system.comodin_type
- ✅ Tabla exercises actualizada (ARRAY type conversion)
- ✅ Backend constants: ComodinTypeEnum actualizado
- ✅ Entity actualizado: exercise.entity.ts
- ✅ Migration: `2025-11-08-migrate-comodin-type-enum.sql`
- ✅ Complejidad MEDIA: Maneja ARRAY type en exercises.comodines_allowed

**Default en tabla:**
```sql
DEFAULT ARRAY['pistas'::gamification_system.comodin_type,
              'vision_lectora'::gamification_system.comodin_type,
              'segunda_oportunidad'::gamification_system.comodin_type]
```

**Referencias:**
- Docs: `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md`
- DDL: `apps/database/ddl/schemas/gamification_system/enums/comodin_type.sql`
- Tabla: `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql:46`
- Backend: `apps/backend/src/shared/constants/enums.constants.ts` (ComodinTypeEnum)
- Entity: `apps/backend/src/modules/educational/entities/exercise.entity.ts:255`

---

## Orden de Creación Recomendado

Los ENUMs de gamification_system deben crearse antes que las tablas que los referencian:

1. **maya_rank** - Requerido por user_ranks, modules
2. **achievement_category** - Requerido por achievements
3. **achievement_type** - Opcional (no usado actualmente)
4. **transaction_type** - Requerido por ml_coins_transactions
5. **notification_priority** - Requerido por notifications
6. **comodin_type** - Requerido por exercises (educational_content schema)

```bash
# Ejecutar en orden:
psql -f maya_rank.sql
psql -f achievement_category.sql
psql -f achievement_type.sql
psql -f transaction_type.sql
psql -f notification_priority.sql
psql -f comodin_type.sql
```

---

## Referencias Cruzadas

### Tablas que usan estos ENUMs

**gamification_system:**
- `user_ranks` → maya_rank
- `achievements` → achievement_category
- `ml_coins_transactions` → transaction_type
- `notifications` → notification_priority

**educational_content:**
- `modules` → maya_rank (min_rank_required)
- `exercises` → comodin_type (comodines_allowed - ARRAY type)

### Backend Entities

- `apps/backend/src/modules/gamification/entities/user-rank.entity.ts` → maya_rank
- `apps/backend/src/modules/gamification/entities/achievement.entity.ts` → achievement_category
- `apps/backend/src/modules/gamification/entities/ml-coins-transaction.entity.ts` → transaction_type
- `apps/backend/src/modules/notifications/entities/notification.entity.ts` → notification_priority
- `apps/backend/src/modules/educational/entities/exercise.entity.ts` → comodin_type

---

## Historial de Migraciones

| Fecha | ENUM | Acción | Migration | Estado |
|-------|------|--------|-----------|--------|
| 2025-11-03 | maya_rank | Migrado de public | - | ✅ |
| 2025-11-07 | achievement_category | Migrado de public | 2025-11-07-fix-achievement-enums-schema.sql | ✅ |
| 2025-11-07 | achievement_type | Migrado de public | 2025-11-07-fix-achievement-enums-schema.sql | ✅ |
| 2025-11-08 | transaction_type | Actualizado v2.0 | 2025-11-08-sync-transaction-type-enum.sql | ✅ |
| 2025-11-08 | notification_priority | Creado v1.0 | 2025-11-08-add-notification-priority.sql | ✅ |
| 2025-11-08 | comodin_type | Migrado de public | 2025-11-08-migrate-comodin-type-enum.sql | ✅ |

---

## Notas Importantes

### ENUMs Futuros a Migrar a gamification_system

Según `TRACKING-CORRECCIONES.md` y `PLAN-MIGRACION-ENUMS-FASE1.md`, los siguientes ENUMs están en `public` pero deberían estar en `gamification_system`:

- ✅ `comodin_type` (3 valores) - P1 - **MIGRADO 2025-11-08** (complejidad MEDIA - ARRAY type)
- ⏳ `metric_type` (7 valores) - P2 - Pendiente
- ⏳ `aggregation_period` (5 valores) - P2 - Pendiente
- ⏳ `social_event_type` (5 valores) - P2 - Pendiente

**Ver:** `apps/database/docs/PLAN-MIGRACION-ENUMS-FASE1.md` para plan completo de migraciones FASE 1

---

## Comandos de Validación

```bash
# Verificar ENUMs en BD
psql -d gamilit_platform -c "
SELECT n.nspname as schema, t.typname as enum_name, e.enumlabel as value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'gamification_system'
ORDER BY enum_name, e.enumsortorder;
"

# Verificar qué columnas usan transaction_type
psql -d gamilit_platform -c "
SELECT c.table_schema, c.table_name, c.column_name, c.udt_schema, c.udt_name
FROM information_schema.columns c
WHERE c.udt_name = 'transaction_type';
"

# Contar valores por tipo
psql -d gamilit_platform -c "
SELECT transaction_type, COUNT(*)
FROM gamification_system.ml_coins_transactions
GROUP BY transaction_type
ORDER BY COUNT(*) DESC;
"
```

---

**Generado:** 2025-11-08
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
**Versión:** 1.2
**Última migración:** comodin_type v1.0 migrado de public (2025-11-08) - Complejidad MEDIA (ARRAY type)
