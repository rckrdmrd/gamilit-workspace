# Reporte: Documentación como Fuente de Verdad

**Fecha:** 2025-11-07
**Versión:** 1.0
**Principio:** La documentación oficial es la fuente de verdad
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)

---

## 🎯 Objetivo

Alinear el código, base de datos y entities con las **especificaciones oficiales de la documentación**.

**Principio fundamental:** Cuando existe contradicción entre documentación y código, la **documentación es autoritativa** y el código debe corregirse.

---

## 📊 Resumen de Contradicciones

| ID | Contradicción | Fuente de Verdad | Requiere Corrección | Prioridad |
|----|---------------|------------------|---------------------|-----------|
| **C1** | NotificationType | 📘 Docs: 11 valores | ✅ DDL + Backend + Entities | P0 - CRÍTICO |
| **C2** | Notification Entity ubicación | 📘 Docs: module notifications | ✅ Eliminar de gamification | P0 - CRÍTICO |
| **C3** | MayaRank DDL | ✅ Ya corregido en DDL | 📘 Actualizar docs (warning obsoleto) | P2 - BAJO |
| **C4** | Guild vs Team | 📘 Docs: "Guild" | ✅ Renombrar Team → Guild en código | P1 - ALTO |

**Total acciones:** 3 correcciones críticas en código/DDL + 1 actualización de docs

---

## 🚨 C1: NotificationType - CÓDIGO DEBE ALINEARSE A DOCS

### Fuente de Verdad: Documentación

**Documento oficial:** `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md:27-39`

```typescript
enum NotificationType {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',    // 1
  RANK_UP = 'rank_up',                             // 2
  FRIEND_REQUEST = 'friend_request',               // 3
  GUILD_INVITATION = 'guild_invitation',           // 4 ← Nota: usa "GUILD"
  MISSION_COMPLETED = 'mission_completed',         // 5
  LEVEL_UP = 'level_up',                           // 6
  MESSAGE_RECEIVED = 'message_received',           // 7
  SYSTEM_ANNOUNCEMENT = 'system_announcement',     // 8
  ML_COINS_EARNED = 'ml_coins_earned',             // 9
  STREAK_MILESTONE = 'streak_milestone',           // 10
  EXERCISE_FEEDBACK = 'exercise_feedback',         // 11
}
```

**Total:** 11 valores oficiales

---

### Estado Actual (Desalineado)

#### DDL Actual ❌ INCORRECTO (7 valores)
**Ubicación:** `apps/database/ddl/schemas/public/enums/notification_type.sql`

```sql
CREATE TYPE public.notification_type AS ENUM (
    'achievement_unlocked',     -- ✅
    'rank_up',                  -- ✅
    'mission_completed',        -- ✅
    'friend_request',           -- ✅
    'team_invite',              -- ❌ Debería ser 'guild_invitation'
    'system_announcement',      -- ✅
    'reminder'                  -- ❌ No está en docs, sobra
);
-- FALTAN: 'level_up', 'message_received', 'ml_coins_earned',
--         'streak_milestone', 'exercise_feedback'
```

#### Backend Constants ❌ INCORRECTO (7 valores)
**Ubicación:** `apps/backend/src/shared/constants/enums.constants.ts`

```typescript
export enum NotificationTypeEnum {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',    // ✅
  RANK_UP = 'rank_up',                             // ✅
  MISSION_COMPLETED = 'mission_completed',         // ✅
  FRIEND_REQUEST = 'friend_request',               // ✅
  TEAM_INVITE = 'team_invite',                     // ❌ Debería ser 'guild_invitation'
  SYSTEM_ANNOUNCEMENT = 'system_announcement',     // ✅
  REMINDER = 'reminder',                           // ❌ No está en docs
}
// FALTAN: 'level_up', 'message_received', 'ml_coins_earned',
//         'streak_milestone', 'exercise_feedback'
```

#### Entity notifications ❌ COMPLETAMENTE INCORRECTO (6 valores)
**Ubicación:** `apps/backend/src/modules/notifications/entities/notification.entity.ts:14-21`

```typescript
export enum NotificationType {
  ACHIEVEMENT = 'achievement',       // ❌ Debería ser 'achievement_unlocked'
  MISSION = 'mission',               // ❌ Debería ser 'mission_completed'
  REWARD = 'reward',                 // ❌ No existe en docs
  SYSTEM = 'system',                 // ❌ Debería ser 'system_announcement'
  SOCIAL = 'social',                 // ❌ No existe en docs
  EDUCATIONAL = 'educational',       // ❌ No existe en docs
}
```

#### Entity gamification ❌ COMENTARIO INCORRECTO
**Ubicación:** `apps/backend/src/modules/gamification/entities/notification.entity.ts:16`

```typescript
/**
 * Tipo de notificación
 * achievement | mission | reward | system | social | educational
 */
@Column({ type: 'text' })
type: string;
```

---

### Comparación Completa

| Valor en Docs (Fuente de Verdad) | DDL | Constants | Entity notifications | Entity gamification |
|-----------------------------------|-----|-----------|----------------------|---------------------|
| `achievement_unlocked` ✅ | ✅ | ✅ | ❌ `achievement` | ❌ `achievement` |
| `rank_up` ✅ | ✅ | ✅ | ❌ `mission` | ❌ `mission` |
| `friend_request` ✅ | ✅ | ✅ | ❌ `reward` | ❌ `reward` |
| `guild_invitation` ✅ | ❌ `team_invite` | ❌ `team_invite` | ❌ `system` | ❌ `system` |
| `mission_completed` ✅ | ✅ | ✅ | ❌ `social` | ❌ `social` |
| `level_up` ✅ | ❌ FALTA | ❌ FALTA | ❌ `educational` | ❌ `educational` |
| `message_received` ✅ | ❌ FALTA | ❌ FALTA | - | - |
| `system_announcement` ✅ | ✅ | ✅ | - | - |
| `ml_coins_earned` ✅ | ❌ FALTA | ❌ FALTA | - | - |
| `streak_milestone` ✅ | ❌ FALTA | ❌ FALTA | - | - |
| `exercise_feedback` ✅ | ❌ FALTA | ❌ FALTA | - | - |
| N/A | ❌ `reminder` | ❌ `reminder` | - | - |

**Coincidencias con docs:**
- DDL: 5 de 11 (45%)
- Constants: 5 de 11 (45%)
- Entity notifications: 0 de 11 (0%)
- Entity gamification: 0 de 11 (0%)

---

### ✅ Acción Correctiva 1: DDL

**Archivo:** `apps/database/ddl/schemas/public/enums/notification_type.sql`

```sql
-- =====================================================================================
-- Enum: notification_type
-- Schema: public
-- Description: Tipos de notificaciones del sistema
-- Versión: 2.0 (2025-11-07) - Alineado con documentación oficial
-- Fuente de Verdad: docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md
-- =====================================================================================

DROP TYPE IF EXISTS public.notification_type CASCADE;

CREATE TYPE public.notification_type AS ENUM (
    'achievement_unlocked',
    'rank_up',
    'friend_request',
    'guild_invitation',      -- Cambiado de 'team_invite' para alinearse con docs
    'mission_completed',
    'level_up',              -- NUEVO
    'message_received',      -- NUEVO
    'system_announcement',
    'ml_coins_earned',       -- NUEVO
    'streak_milestone',      -- NUEVO
    'exercise_feedback'      -- NUEVO
);

COMMENT ON TYPE public.notification_type IS
    'Tipos de notificaciones del sistema (v2.0 - 2025-11-07). '
    'Alineado con documentación oficial en TYPES-NOTIFICATIONS.md. '
    '11 tipos: achievement_unlocked, rank_up, friend_request, guild_invitation, '
    'mission_completed, level_up, message_received, system_announcement, '
    'ml_coins_earned, streak_milestone, exercise_feedback.';

-- =====================================================================================
-- Migration Notes
-- =====================================================================================
--
-- Cambios de v1.0 a v2.0:
-- - Eliminado: 'reminder' (no está en especificación oficial)
-- - Renombrado: 'team_invite' → 'guild_invitation' (alineado con docs)
-- - Agregados: 'level_up', 'message_received', 'ml_coins_earned',
--              'streak_milestone', 'exercise_feedback'
--
-- ⚠️ IMPORTANTE: Si existen notificaciones con valores antiguos, ejecutar migración:
--
-- UPDATE gamification_system.notifications
-- SET type = 'guild_invitation'
-- WHERE type = 'team_invite';
--
-- =====================================================================================
```

---

### ✅ Acción Correctiva 2: Backend Constants

**Archivo:** `apps/backend/src/shared/constants/enums.constants.ts`

```typescript
/**
 * NotificationTypeEnum
 *
 * Tipos de notificaciones del sistema.
 *
 * @version 2.0 (2025-11-07) - Alineado con documentación oficial
 * @source docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md
 *
 * Cambios de v1.0 a v2.0:
 * - Eliminado: REMINDER (no en especificación oficial)
 * - Renombrado: TEAM_INVITE → GUILD_INVITATION (alineado con docs)
 * - Agregados: LEVEL_UP, MESSAGE_RECEIVED, ML_COINS_EARNED,
 *              STREAK_MILESTONE, EXERCISE_FEEDBACK
 */
export enum NotificationTypeEnum {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RANK_UP = 'rank_up',
  FRIEND_REQUEST = 'friend_request',
  GUILD_INVITATION = 'guild_invitation',        // Cambiado de TEAM_INVITE
  MISSION_COMPLETED = 'mission_completed',
  LEVEL_UP = 'level_up',                        // NUEVO
  MESSAGE_RECEIVED = 'message_received',        // NUEVO
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  ML_COINS_EARNED = 'ml_coins_earned',         // NUEVO
  STREAK_MILESTONE = 'streak_milestone',        // NUEVO
  EXERCISE_FEEDBACK = 'exercise_feedback',      // NUEVO
}

/**
 * Tipo derivado del enum para uso en TypeScript
 */
export type NotificationType = `${NotificationTypeEnum}`;

/**
 * Array de todos los tipos de notificación (útil para validaciones)
 */
export const NOTIFICATION_TYPES = Object.values(NotificationTypeEnum);

/**
 * Categorización de notificaciones por urgencia
 */
export const NOTIFICATION_PRIORITY = {
  HIGH: ['system_announcement', 'message_received'],
  MEDIUM: ['achievement_unlocked', 'rank_up', 'mission_completed', 'guild_invitation'],
  LOW: ['level_up', 'ml_coins_earned', 'streak_milestone', 'exercise_feedback', 'friend_request'],
} as const;
```

---

### ✅ Acción Correctiva 3: Entity en /modules/notifications/

**Archivo:** `apps/backend/src/modules/notifications/entities/notification.entity.ts`

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { NotificationTypeEnum } from '@/shared/constants/enums.constants';

/**
 * Interface para data JSONB
 *
 * @source docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md:53-71
 */
export interface NotificationData {
  achievement_id?: string;
  achievement_name?: string;
  achievement_icon?: string;
  rank?: string;
  previous_rank?: string;
  friend_id?: string;
  friend_name?: string;
  guild_id?: string;          // ← Usa "guild"
  guild_name?: string;        // ← Usa "guild"
  mission_id?: string;
  mission_name?: string;
  level?: number;
  coins_amount?: number;
  current_streak?: number;
  exercise_id?: string;
  reference_url?: string;
  [key: string]: any;
}

/**
 * Notification Entity
 *
 * Mapea a la tabla: gamification_system.notifications
 *
 * @description Notificaciones de usuario para eventos del sistema
 * @source docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md
 * @source docs/02-especificaciones-tecnicas/trazabilidad/05-realtime-notifications.md
 * @version 2.0 (2025-11-07) - Alineado con documentación oficial
 */
@Entity({ schema: 'gamification_system', name: 'notifications' })
@Index(['user_id'])
@Index(['type'])
@Index(['user_id', 'read'])
@Index(['created_at'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  /**
   * Tipo de notificación
   *
   * IMPORTANTE: Usa NotificationTypeEnum que está sincronizado con:
   * - DDL: public.notification_type
   * - Docs: TYPES-NOTIFICATIONS.md
   */
  @Column({
    type: 'enum',
    enum: NotificationTypeEnum,
  })
  type: NotificationTypeEnum;

  @Column('text')
  title: string;

  @Column('text')
  message: string;

  @Column('jsonb', { nullable: true })
  data: NotificationData | null;

  @Column('boolean', { default: false })
  read: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relación con User (Profile)
  // @ManyToOne(() => Profile)
  // @JoinColumn({ name: 'user_id' })
  // user: Profile;
}
```

---

### ✅ Acción Correctiva 4: Eliminar Entity de /modules/gamification/

**Archivo a ELIMINAR:** `apps/backend/src/modules/gamification/entities/notification.entity.ts`

**Razón:**
- La entity correcta ya está en `/modules/notifications/`
- La documentación de trazabilidad (`05-realtime-notifications.md`) indica que las notificaciones se gestionan desde `backend/modules/notifications/`
- Tener dos entities mapeando la misma tabla causa conflictos en TypeORM

**Pasos:**
1. Buscar imports de esta entity: `grep -r "from.*gamification.*notification.entity" apps/backend/src`
2. Reemplazar imports por: `import { Notification } from '@/modules/notifications/entities'`
3. Eliminar archivo: `rm apps/backend/src/modules/gamification/entities/notification.entity.ts`
4. Actualizar `apps/backend/src/modules/gamification/entities/index.ts` para remover export

---

### ✅ Acción Correctiva 5: Migration Script

**Archivo:** `apps/database/migrations/XXXX-align-notification-type-with-docs.sql`

```sql
-- =====================================================================================
-- Migration: Align notification_type with documentation
-- Created: 2025-11-07
-- Purpose: Sincronizar enum notification_type con especificación oficial
-- Source: docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md
-- =====================================================================================

BEGIN;

-- 1. Migrar datos existentes con valores antiguos
UPDATE gamification_system.notifications
SET type = 'guild_invitation'::text
WHERE type = 'team_invite';

-- Verificar si existen valores 'reminder' (no está en docs)
-- Si existen, decidir mapeo apropiado o eliminarlos
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM gamification_system.notifications
        WHERE type = 'reminder'
    ) THEN
        RAISE NOTICE 'ADVERTENCIA: Existen notificaciones con type=reminder. Revisar manualmente.';
    END IF;
END $$;

-- 2. Crear nuevo enum con valores de documentación
CREATE TYPE public.notification_type_new AS ENUM (
    'achievement_unlocked',
    'rank_up',
    'friend_request',
    'guild_invitation',
    'mission_completed',
    'level_up',
    'message_received',
    'system_announcement',
    'ml_coins_earned',
    'streak_milestone',
    'exercise_feedback'
);

-- 3. Actualizar columna type en tabla notifications
ALTER TABLE gamification_system.notifications
    ALTER COLUMN type TYPE text;

-- 4. Eliminar enum antiguo
DROP TYPE IF EXISTS public.notification_type;

-- 5. Renombrar nuevo enum
ALTER TYPE public.notification_type_new RENAME TO notification_type;

-- 6. Actualizar columna a usar nuevo enum
ALTER TABLE gamification_system.notifications
    ALTER COLUMN type TYPE public.notification_type USING type::public.notification_type;

-- 7. Agregar comment
COMMENT ON TYPE public.notification_type IS
    'Tipos de notificaciones del sistema (v2.0 - 2025-11-07). '
    'Alineado con documentación oficial en TYPES-NOTIFICATIONS.md.';

COMMIT;

-- =====================================================================================
-- Validación post-migración
-- =====================================================================================

-- Verificar distribución de tipos después de migración
SELECT type, COUNT(*) as count
FROM gamification_system.notifications
GROUP BY type
ORDER BY count DESC;

-- Verificar que no haya valores NULL
SELECT COUNT(*) as null_types
FROM gamification_system.notifications
WHERE type IS NULL;
```

---

### Estimación de Corrección

- **Complejidad:** Media-Alta
- **Tiempo estimado:** 4-6 horas
- **Archivos afectados:**
  - 1 DDL (enum)
  - 1 Migration SQL
  - 1 Constants file
  - 2 Entities (1 actualizar, 1 eliminar)
  - 5-10 Services que usan las entities
- **Riesgo de regresión:** Alto (requiere testing exhaustivo)
- **Testing requerido:**
  - [ ] Inserción de cada tipo de notificación
  - [ ] Validación de enum en BD
  - [ ] WebSocket emit con nuevos tipos
  - [ ] Frontend rendering de nuevos tipos

---

## 🚨 C2: Notification Entity - CONSOLIDAR EN /modules/notifications/

### Fuente de Verdad: Documentación de Arquitectura

**Documento oficial:** `docs/02-especificaciones-tecnicas/trazabilidad/05-realtime-notifications.md:115-137`

```typescript
// backend/modules/notifications/notifications.service.ts
async createNotification(dto: CreateNotificationDto): Promise<Notification> {
  const notification = await notificationsRepository.create({
    userId: dto.userId,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    data: dto.data,
    priority: dto.priority || 'medium',
    isRead: false,
  });
  ...
}
```

**Decisión oficial:** La entity `Notification` pertenece al módulo `notifications`, no a `gamification`.

---

### Estado Actual (Duplicación)

✅ **Entity correcta (MANTENER):**
`apps/backend/src/modules/notifications/entities/notification.entity.ts`

❌ **Entity duplicada (ELIMINAR):**
`apps/backend/src/modules/gamification/entities/notification.entity.ts`

---

### ✅ Acción Correctiva

**Ya cubierta en C1 - Acción Correctiva 4**

---

## ✅ C3: MayaRank - DOCUMENTACIÓN DEBE ACTUALIZARSE

### Fuente de Verdad: DDL Actual (Ya Corregido)

**Estado DDL:** `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql`

```sql
CREATE TYPE gamification_system.maya_rank AS ENUM (
    'Ajaw',           -- Nivel 1
    'Nacom',          -- Nivel 2
    'Ah K''in',       -- Nivel 3
    'Halach Uinic',   -- Nivel 4
    'K''uk''ulkan'    -- Nivel 5
);

-- Changelog:
-- 2025-11-03: Creación inicial del enum (homologación de rangos legacy)
--             Anterior: nacom, batab, holcatte, guerrero, mercenario (legacy)
--             Nuevo: Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan (correcto)
```

✅ **El DDL ya está corregido desde el 2025-11-03**

---

### Estado Documentación (Desactualizada)

**Documento:** `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md:50-75`

```typescript
**PostgreSQL DDL (ACTUALIZACIÓN REQUERIDA - P0-CRÍTICO):**
```sql
-- ⚠️ IMPORTANTE: El DDL actual en la base de datos está DESACTUALIZADO
-- DDL ACTUAL (LEGACY - INCORRECTO):
-- CREATE TYPE maya_rank AS ENUM ('NACOM', 'BATAB', 'HOLCATTE', 'GUERRERO', 'MERCENARIO');
...
```

❌ **Este warning es OBSOLETO**, el DDL ya fue corregido.

---

### ✅ Acción Correctiva: Actualizar Documentación

**Archivo:** `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md`

**Sección a actualizar:** Líneas 50-75

**ANTES (líneas 50-75):**
```typescript
**PostgreSQL DDL (ACTUALIZACIÓN REQUERIDA - P0-CRÍTICO):**
```sql
-- ⚠️ IMPORTANTE: El DDL actual en la base de datos está DESACTUALIZADO
-- DDL ACTUAL (LEGACY - INCORRECTO):
-- CREATE TYPE maya_rank AS ENUM ('NACOM', 'BATAB', 'HOLCATTE', 'GUERRERO', 'MERCENARIO');

-- DDL CORRECTO (DEBE SER APLICADO):
DROP TYPE IF EXISTS maya_rank CASCADE;
CREATE TYPE maya_rank AS ENUM (
  'Ajaw',
  'Nacom',
  'Ah K''in',
  'Halach Uinic',
  'K''uk''ulkan'
);

-- Migración de datos existentes:
-- 1. Crear tipo temporal con nuevos valores
-- 2. Actualizar registros existentes con mapeo:
--    'NACOM' → 'Ajaw'
--    'BATAB' → 'Nacom'
--    'HOLCATTE' → 'Ah K''in'
--    'GUERRERO' → 'Halach Uinic'
--    'MERCENARIO' → 'K''uk''ulkan'
-- 3. Aplicar CASCADE para actualizar todas las tablas dependientes
```

**DESPUÉS (corrección):**
```typescript
**PostgreSQL DDL (✅ IMPLEMENTADO - 2025-11-03):**
```sql
-- ✅ IMPLEMENTADO: El DDL fue actualizado el 2025-11-03
-- DDL ACTUAL (CORRECTO):
CREATE TYPE gamification_system.maya_rank AS ENUM (
  'Ajaw',           -- Nivel 1: Señor o gobernante (0-999 XP)
  'Nacom',          -- Nivel 2: Capitán de guerra (1,000-2,999 XP)
  'Ah K''in',       -- Nivel 3: Sacerdote del sol (3,000-5,999 XP)
  'Halach Uinic',   -- Nivel 4: Hombre verdadero (6,000-9,999 XP)
  'K''uk''ulkan'    -- Nivel 5: Serpiente emplumada (10,000+ XP)
);

-- Changelog:
-- 2025-11-03: Migración de rangos legacy completada
--             Anterior: 'NACOM', 'BATAB', 'HOLCATTE', 'GUERRERO', 'MERCENARIO'
--             Actual: 'Ajaw', 'Nacom', 'Ah K'in', 'Halach Uinic', 'K'uk'ulkan'
--             Nota: Migración de datos históricos completada con mapeo 1:1

COMMENT ON TYPE gamification_system.maya_rank IS
    'Rangos del sistema de gamificación Maya (V1.0 - 2025-11-03). '
    'Progresión: Ajaw (inicial) → K''uk''ulkan (máximo). '
    'Basado en la jerarquía militar maya histórica con valor pedagógico cultural.';
```

**Referencias:**
- **DDL Source:** `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql`
- **Decisión Oficial:** DECISION-LOG-006 (2025-11-02)
- **Fuente de verdad para valores:** Sistema de seed data
```

---

### Estimación de Corrección

- **Complejidad:** Baja
- **Tiempo estimado:** 15-30 minutos
- **Archivos afectados:** 1 archivo de documentación
- **Riesgo de regresión:** Ninguno (solo documentación)

---

## 🚨 C4: Guild vs Team - CÓDIGO DEBE USAR "GUILD"

### Fuente de Verdad: Documentación

**Documentos oficiales:**

1. **TYPES-NOTIFICATIONS.md:31** - `GUILD_INVITATION = 'guild_invitation'`
2. **TYPES-NOTIFICATIONS.md:61-62** - `guild_id?: string; guild_name?: string;`
3. **TYPES-GAMIFICATION.md:524** - `'guild_joined'` en ObjectiveType
4. **SOCIAL-GUILDS.md** - Todo el archivo usa "Guild"
5. **Trazabilidad** - Referencias consistentes a "Guild"

**Decisión oficial:** El término correcto es **"Guild"**, no "Team".

---

### Estado Actual (Inconsistencia)

❌ **Código usa "Team" (21 archivos):**
- `apps/backend/src/modules/social/entities/team.entity.ts`
- `apps/backend/src/modules/social/entities/team-member.entity.ts`
- `apps/backend/src/modules/social/entities/team-challenge.entity.ts`
- `apps/backend/src/modules/social/services/teams.service.ts`
- `apps/backend/src/modules/social/controllers/teams.controller.ts`
- `apps/database/ddl/schemas/social_features/tables/05-teams.sql`
- ... y 15 archivos más

---

### ✅ Acción Correctiva: Refactoring Code de Team → Guild

#### Fase 1: Renombrar Tablas DDL

**Archivo:** `apps/database/migrations/XXXX-rename-teams-to-guilds.sql`

```sql
-- =====================================================================================
-- Migration: Rename teams to guilds
-- Created: 2025-11-07
-- Purpose: Alinear terminología con documentación oficial
-- Source: docs/02-especificaciones-tecnicas/apis/SOCIAL-GUILDS.md
-- =====================================================================================

BEGIN;

-- 1. Renombrar tablas
ALTER TABLE social_features.teams RENAME TO guilds;
ALTER TABLE social_features.team_members RENAME TO guild_members;
ALTER TABLE social_features.team_challenges RENAME TO guild_challenges;

-- 2. Renombrar constraints (Primary Keys)
ALTER TABLE social_features.guilds
    RENAME CONSTRAINT teams_pkey TO guilds_pkey;

ALTER TABLE social_features.guild_members
    RENAME CONSTRAINT team_members_pkey TO guild_members_pkey;

ALTER TABLE social_features.guild_challenges
    RENAME CONSTRAINT team_challenges_pkey TO guild_challenges_pkey;

-- 3. Renombrar Foreign Keys
ALTER TABLE social_features.guild_members
    RENAME CONSTRAINT team_members_team_id_fkey TO guild_members_guild_id_fkey;

-- 4. Renombrar columnas que referencian "team"
ALTER TABLE social_features.guild_members
    RENAME COLUMN team_id TO guild_id;

-- 5. Renombrar índices
ALTER INDEX social_features.idx_teams_classroom
    RENAME TO idx_guilds_classroom;

ALTER INDEX social_features.idx_teams_leader
    RENAME TO idx_guilds_leader;

ALTER INDEX social_features.idx_teams_xp
    RENAME TO idx_guilds_xp;

ALTER INDEX social_features.idx_teams_active
    RENAME TO idx_guilds_active;

ALTER INDEX social_features.idx_teams_classroom_active_xp
    RENAME TO idx_guilds_classroom_active_xp;

-- 6. Renombrar columnas internas
ALTER TABLE social_features.guilds
    RENAME COLUMN team_code TO guild_code;

-- 7. Actualizar comments
COMMENT ON TABLE social_features.guilds IS
    'Guilds colaborativos de estudiantes (anteriormente teams). '
    'Alineado con terminología de documentación oficial desde 2025-11-07.';

COMMIT;

-- =====================================================================================
-- Validación post-migración
-- =====================================================================================

-- Verificar que tablas existen con nuevos nombres
SELECT tablename FROM pg_tables
WHERE schemaname = 'social_features'
AND tablename LIKE '%guild%';

-- Verificar integridad de FKs
SELECT COUNT(*) FROM social_features.guild_members;
```

---

#### Fase 2: Actualizar DB Constants

**Archivo:** `apps/backend/src/shared/constants/database.constants.ts`

```typescript
export const DB_TABLES = {
  // ... otros schemas

  SOCIAL: {
    SCHOOLS: 'schools',
    CLASSROOMS: 'classrooms',
    CLASSROOM_MEMBERS: 'classroom_members',
    GUILDS: 'guilds',                      // Cambiado de TEAMS
    GUILD_MEMBERS: 'guild_members',        // Cambiado de TEAM_MEMBERS
    GUILD_CHALLENGES: 'guild_challenges',  // Cambiado de TEAM_CHALLENGES
    FRIENDSHIPS: 'friendships',
  },

  // ... otros schemas
};
```

---

#### Fase 3: Refactoring de Entities

**Archivo:** `apps/backend/src/modules/social/entities/guild.entity.ts` (renombrado de team.entity.ts)

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * Guild Entity (social_features.guilds)
 *
 * @description Guilds colaborativos de estudiantes
 * @schema social_features
 * @table guilds
 * @source docs/02-especificaciones-tecnicas/apis/SOCIAL-GUILDS.md
 * @version 2.0 (2025-11-07) - Renombrado de Team a Guild para alinearse con docs
 *
 * Changelog:
 * - 2025-11-07: Renombrado de Team → Guild (alineación con documentación oficial)
 * - Anterior: Table name era 'teams', ahora 'guilds'
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.GUILDS })
@Index('idx_guilds_classroom', ['classroom_id'])
@Index('idx_guilds_leader', ['leader_id'])
@Index('idx_guilds_xp', ['total_xp'], { synchronize: false })
@Index('idx_guilds_active', ['is_active'], { where: 'is_active = true' })
@Index('idx_guilds_classroom_active_xp', ['classroom_id', 'is_active', 'total_xp'], {
  where: 'is_active = true',
})
export class Guild {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  classroom_id?: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  motto?: string;

  // ... resto de campos igual, solo cambiando team_code → guild_code

  /**
   * Código único de invitación al guild
   */
  @Column({ type: 'text', unique: true, nullable: true })
  guild_code?: string;  // Cambiado de team_code

  // ... resto de campos
}
```

**Archivos a renombrar:**
- `team.entity.ts` → `guild.entity.ts`
- `team-member.entity.ts` → `guild-member.entity.ts`
- `team-challenge.entity.ts` → `guild-challenge.entity.ts`

---

#### Fase 4: Refactoring de Services

**Archivo:** `apps/backend/src/modules/social/services/guilds.service.ts` (renombrado de teams.service.ts)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guild } from '../entities/guild.entity';

@Injectable()
export class GuildsService {
  constructor(
    @InjectRepository(Guild)
    private guildsRepository: Repository<Guild>,
  ) {}

  async create(createGuildDto: CreateGuildDto): Promise<Guild> {
    const guild = this.guildsRepository.create(createGuildDto);
    return await this.guildsRepository.save(guild);
  }

  // ... resto de métodos con naming actualizado
}
```

---

#### Fase 5: Refactoring de Controllers

**Archivo:** `apps/backend/src/modules/social/controllers/guilds.controller.ts` (renombrado de teams.controller.ts)

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GuildsService } from '../services/guilds.service';
import { CreateGuildDto } from '../dto/create-guild.dto';

@Controller('guilds')  // Cambiado de 'teams'
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  @Post()
  create(@Body() createGuildDto: CreateGuildDto) {
    return this.guildsService.create(createGuildDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guildsService.findOne(id);
  }

  // ... resto de endpoints
}
```

---

#### Fase 6: Refactoring de DTOs

**Archivos a renombrar:**
- `create-team.dto.ts` → `create-guild.dto.ts`
- `team-response.dto.ts` → `guild-response.dto.ts`
- `create-team-member.dto.ts` → `create-guild-member.dto.ts`
- ... etc

**Contenido ejemplo:**
```typescript
// create-guild.dto.ts (antes create-team.dto.ts)
export class CreateGuildDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  // ... resto de campos
}
```

---

#### Fase 7: Actualizar Module

**Archivo:** `apps/backend/src/modules/social/social.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from './entities/guild.entity';
import { GuildMember } from './entities/guild-member.entity';
import { GuildChallenge } from './entities/guild-challenge.entity';
import { GuildsService } from './services/guilds.service';
import { GuildsController } from './controllers/guilds.controller';
// ... otros imports

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Guild,           // Cambiado de Team
      GuildMember,     // Cambiado de TeamMember
      GuildChallenge,  // Cambiado de TeamChallenge
      // ... otros
    ]),
  ],
  controllers: [
    GuildsController,  // Cambiado de TeamsController
    // ... otros
  ],
  providers: [
    GuildsService,     // Cambiado de TeamsService
    // ... otros
  ],
  exports: [
    GuildsService,
  ],
})
export class SocialModule {}
```

---

### Estimación de Corrección

- **Complejidad:** Alta
- **Tiempo estimado:** 8-12 horas
- **Archivos afectados:**
  - 3 tablas DDL
  - 1 Migration SQL
  - 1 Constants file
  - 3 Entities (renombrar)
  - 3 Services (renombrar + refactor)
  - 3 Controllers (renombrar + refactor)
  - ~10 DTOs (renombrar)
  - 1 Module (actualizar imports)
  - Frontend (si usa endpoints /teams)
- **Riesgo de regresión:** Muy Alto
- **Breaking Changes:** Sí (endpoints cambian de /teams a /guilds)

---

## 📊 Resumen de Acciones Requeridas

### Prioridad P0 - CRÍTICO (Esta Semana)

| Acción | Archivos | Tiempo | Riesgo |
|--------|----------|--------|--------|
| **C1: Actualizar NotificationType** | DDL + Constants + 2 Entities + Services | 4-6h | Alto |
| **C2: Consolidar Notification Entity** | 1 Entity (eliminar) + actualizar imports | 1-2h | Medio |

**Total P0:** 5-8 horas

### Prioridad P1 - ALTO (Próximo Sprint)

| Acción | Archivos | Tiempo | Riesgo |
|--------|----------|--------|--------|
| **C4: Refactoring Team → Guild** | 3 DDL + 21+ archivos backend + frontend | 8-12h | Muy Alto |

**Total P1:** 8-12 horas

### Prioridad P2 - BAJO (Cuando sea posible)

| Acción | Archivos | Tiempo | Riesgo |
|--------|----------|--------|--------|
| **C3: Actualizar docs MayaRank** | 1 archivo .md | 0.5h | Ninguno |

**Total P2:** 0.5 horas

---

## ✅ Checklist General

### Antes de Empezar
- [ ] Backup completo de base de datos
- [ ] Backup de código (git commit)
- [ ] Crear branch de feature: `feat/align-with-documentation`
- [ ] Reunión con equipo para coordinar cambios

### C1: NotificationType
- [ ] Actualizar DDL enum
- [ ] Crear migration script
- [ ] Actualizar backend constants
- [ ] Actualizar entity en /notifications/
- [ ] Eliminar entity de /gamification/
- [ ] Actualizar todos los imports
- [ ] Actualizar servicios que crean notificaciones
- [ ] Testing: inserción de cada tipo
- [ ] Testing: WebSocket con nuevos tipos
- [ ] Validar en staging
- [ ] Desplegar en producción

### C2: Notification Entity
- [ ] Verificar que no hay imports desde /gamification/
- [ ] Actualizar imports a /notifications/
- [ ] Eliminar archivo de entity duplicada
- [ ] Testing completo
- [ ] Validar en staging

### C3: MayaRank Docs
- [ ] Actualizar TYPES-GAMIFICATION.md
- [ ] Eliminar warning obsoleto
- [ ] Agregar nota de implementación completada
- [ ] Commit de docs

### C4: Team → Guild
- [ ] Crear migration SQL para renombrar tablas
- [ ] Actualizar DB constants
- [ ] Renombrar entities (3 archivos)
- [ ] Renombrar services (3 archivos)
- [ ] Renombrar controllers (3 archivos)
- [ ] Renombrar DTOs (~10 archivos)
- [ ] Actualizar module imports
- [ ] Actualizar frontend API calls
- [ ] Testing exhaustivo
- [ ] Actualizar documentación de API
- [ ] Validar en staging
- [ ] Comunicar breaking changes
- [ ] Desplegar en producción

---

## 🎯 Recomendación Final

**Orden de ejecución recomendado:**

1. **Semana 1 (P0):**
   - C1: NotificationType (2-3 días)
   - C2: Consolidar Entity (medio día)
   - C3: Actualizar docs MayaRank (30 min)

2. **Semana 2-3 (P1):**
   - C4: Team → Guild (requiere planificación cuidadosa)
   - Comunicar breaking changes con 1 semana de anticipación
   - Coordinar con equipo frontend
   - Despliegue gradual (staging → producción)

---

## 📞 Contacto y Referencias

**Documentos de Fuente de Verdad:**
- `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md`
- `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md`
- `docs/02-especificaciones-tecnicas/apis/SOCIAL-GUILDS.md`
- `docs/02-especificaciones-tecnicas/trazabilidad/05-realtime-notifications.md`

**Tracking:**
- Este reporte: `apps/database/docs/REPORTE-FUENTE-DE-VERDAD-2025-11-07.md`
- Contradicciones: `apps/database/docs/REPORTE-CONTRADICCIONES-CRITICAS-2025-11-07.md`
- Validación general: `apps/database/docs/REPORTE-VALIDACION-2025-11-07.md`

---

**Generado por:** Sistema de Validación SIMCO
**Principio:** Documentación es fuente de verdad
**Fecha:** 2025-11-07
**Estado:** 🚨 **ACCIÓN REQUERIDA** - 3 correcciones críticas + 1 actualización docs
