# Types Mapping - Database → Backend → Frontend

**Version**: 3.0 - CORREGIDO
**Fecha**: 2025-11-02
**Stack**: PostgreSQL 16 → TypeScript 5.8+ → TypeScript 5.9.3
**Estado**: ✅ SINCRONIZADO CON DECISION-LOG-006

---

## ⚠️ ADVERTENCIA IMPORTANTE

**Este archivo fue completamente reescrito el 2025-11-02** para corregir errores críticos (P0-CRÍTICO VAL-TYPES-P0-002).

**Versiones anteriores contenían:**
- ❌ Mapeo erróneo de rangos Maya (Ajaw → 'nacom')
- ❌ Enum PostgreSQL desactualizado con rangos legacy
- ❌ Inconsistencias que causaban incompatibilidad backend-frontend

**Versión actual sincronizada con:**
- ✅ DECISION-LOG-006 (Sistema de seed data como fuente de verdad)
- ✅ Rangos oficiales: Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan
- ✅ DDL PostgreSQL actualizado

---

## Vision General

Este documento describe el mapeo completo de tipos desde la base de datos PostgreSQL, pasando por el backend Node.js, hasta el frontend React. Asegura **type safety end-to-end** y consistencia en toda la aplicación.

---

## Estrategia de Tipos

```
┌──────────────────┐
│   PostgreSQL     │  Custom types (ENUM, JSONB, arrays)
│   Database       │  44 tables, 600+ columns
└────────┬─────────┘
         │ Type Generation
         ▼
┌──────────────────┐
│   Backend        │  TypeScript interfaces
│   Node.js API    │  Generated from DB schema
└────────┬─────────┘
         │ API Contract
         ▼
┌──────────────────┐
│   Frontend       │  TypeScript types
│   React SPA      │  Shared with backend
└──────────────────┘
```

---

## 1. ENUMs Mapping

### 1.1 gamilit_role

**PostgreSQL:**
```sql
CREATE TYPE gamilit_role AS ENUM (
    'student',
    'admin_teacher',
    'super_admin'
);
```

**Backend TypeScript:**
```typescript
export type GamilaRole = 'student' | 'admin_teacher' | 'super_admin';

export enum GamilaRoleEnum {
  STUDENT = 'student',
  ADMIN_TEACHER = 'admin_teacher',
  SUPER_ADMIN = 'super_admin'
}
```

**Frontend TypeScript:**
```typescript
export type UserRole = 'student' | 'admin_teacher' | 'super_admin';

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'admin_teacher',
  ADMIN: 'super_admin'
} as const;
```

---

### 1.2 maya_rank (SISTEMA OFICIAL - Title Case)

**PostgreSQL (ACTUALIZADO):**
```sql
-- ⚠️ IMPORTANTE: Aplicar migración para actualizar de rangos legacy
CREATE TYPE maya_rank AS ENUM (
    'Ajaw',           -- Rank 1: Señor/Gobernante (Iniciado)
    'Nacom',          -- Rank 2: Capitán de Guerra (Explorador)
    'Ah K''in',       -- Rank 3: Sacerdote del Sol (Analítico)
    'Halach Uinic',   -- Rank 4: Hombre Verdadero (Crítico)
    'K''uk''ulkan'    -- Rank 5: Serpiente Emplumada (Maestro)
);
```

**Backend TypeScript:**
```typescript
export type MayaRank = 'Ajaw' | 'Nacom' | 'Ah K\'in' | 'Halach Uinic' | 'K\'uk\'ulkan';

export enum MayaRankEnum {
  Ajaw = 'Ajaw',
  Nacom = 'Nacom',
  AhKin = 'Ah K\'in',
  HalachUinic = 'Halach Uinic',
  Kukulkan = 'K\'uk\'ulkan'
}

// Mapeo directo 1:1 (NO HAY TRANSFORMACIÓN)
export const MAYA_RANKS = {
  Ajaw: 'Ajaw',
  Nacom: 'Nacom',
  'Ah K\'in': 'Ah K\'in',
  'Halach Uinic': 'Halach Uinic',
  'K\'uk\'ulkan': 'K\'uk\'ulkan'
} as const;
```

**Frontend TypeScript:**
```typescript
export type RangoMaya = 'Ajaw' | 'Nacom' | 'Ah K\'in' | 'Halach Uinic' | 'K\'uk\'ulkan';

// Metadata para UI
export const RANK_METADATA = {
  'Ajaw': {
    level: 1,
    xpRequired: 0,
    multiplier: 1.0,
    mlCoins: 50,
    label: 'Ajaw - Señor/Gobernante',
    description: 'Iniciado en el camino del aprendizaje'
  },
  'Nacom': {
    level: 2,
    xpRequired: 1000,
    multiplier: 1.25,
    mlCoins: 75,
    label: 'Nacom - Capitán de Guerra',
    description: 'Explorador de nuevos conocimientos'
  },
  'Ah K\'in': {
    level: 3,
    xpRequired: 3000,
    multiplier: 1.5,
    mlCoins: 100,
    label: 'Ah K\'in - Sacerdote del Sol',
    description: 'Analítico en el pensamiento crítico'
  },
  'Halach Uinic': {
    level: 4,
    xpRequired: 6000,
    multiplier: 1.75,
    mlCoins: 125,
    label: 'Halach Uinic - Hombre Verdadero',
    description: 'Crítico y reflexivo en el análisis'
  },
  'K\'uk\'ulkan': {
    level: 5,
    xpRequired: 10000,
    multiplier: 2.0,
    mlCoins: 150,
    label: 'K\'uk\'ulkan - Serpiente Emplumada',
    description: 'Maestro del conocimiento'
  }
} as const;
```

**Decisión Oficial:** Según DECISION-LOG-006 (2025-11-02), el sistema de seed data es la fuente de verdad. **Title Case** es la capitalización oficial.

---

### 1.3 difficulty_level

**PostgreSQL:**
```sql
CREATE TYPE difficulty_level AS ENUM (
    'very_easy',
    'easy',
    'beginner',
    'intermediate',
    'medium',
    'advanced',
    'hard',
    'very_hard'
);
```

**Backend/Frontend TypeScript:**
```typescript
export type DifficultyLevel =
  | 'very_easy'
  | 'easy'
  | 'beginner'
  | 'intermediate'
  | 'medium'
  | 'advanced'
  | 'hard'
  | 'very_hard';

export enum DifficultyLevelEnum {
  VERY_EASY = 'very_easy',
  EASY = 'easy',
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  MEDIUM = 'medium',
  ADVANCED = 'advanced',
  HARD = 'hard',
  VERY_HARD = 'very_hard'
}

// Mapeo para UI labels
export const DIFFICULTY_LABELS = {
  'very_easy': 'Muy Fácil',
  'easy': 'Fácil',
  'beginner': 'Principiante',
  'intermediate': 'Intermedio',
  'medium': 'Medio',
  'advanced': 'Avanzado',
  'hard': 'Difícil',
  'very_hard': 'Muy Difícil'
} as const;
```

---

## 2. Convenciones de Naming

### snake_case (PostgreSQL) ↔ camelCase (TypeScript)

**Estrategia de transformación:**

```typescript
// Backend: Transformación automática en capa de API
function toCamelCase(obj: Record<string, any>): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = obj[key];
    return acc;
  }, {} as Record<string, any>);
}

function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = obj[key];
    return acc;
  }, {} as Record<string, any>);
}
```

**Ejemplos:**

| PostgreSQL (DB) | Backend (Entity) | Frontend (DTO) |
|-----------------|------------------|----------------|
| `created_at` | `created_at` | `createdAt` |
| `updated_at` | `updated_at` | `updatedAt` |
| `current_streak` | `current_streak` | `currentStreak` |
| `maya_rank` | `maya_rank` | `mayaRank` |
| `user_id` | `user_id` | `userId` |

---

## 3. Tipos Especiales

### JSONB Mapping

**PostgreSQL:**
```sql
exercise_data JSONB
```

**TypeScript:**
```typescript
export interface ExerciseData {
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  hints?: string[];
  metadata?: Record<string, unknown>;
}

// En entity
exercise_data: ExerciseData;
```

### Arrays Mapping

**PostgreSQL:**
```sql
tags TEXT[]
```

**TypeScript:**
```typescript
tags: string[];
```

### Timestamps

**PostgreSQL:**
```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
```

**TypeScript:**
```typescript
created_at: Date; // Backend
createdAt: string; // Frontend (ISO 8601 string)
```

---

## 4. Validación con Zod

### Schema Completo para MayaRank

```typescript
import { z } from 'zod';

export const mayaRankSchema = z.enum([
  'Ajaw',
  'Nacom',
  'Ah K\'in',
  'Halach Uinic',
  'K\'uk\'ulkan'
]);

export type MayaRankZod = z.infer<typeof mayaRankSchema>;
```

### Schema Completo para DifficultyLevel

```typescript
export const difficultyLevelSchema = z.enum([
  'very_easy',
  'easy',
  'beginner',
  'intermediate',
  'medium',
  'advanced',
  'hard',
  'very_hard'
]);

export type DifficultyLevelZod = z.infer<typeof difficultyLevelSchema>;
```

---

## 5. Migración de Datos Legacy

### Script de Migración para maya_rank

```sql
-- Paso 1: Crear tipo temporal con nuevos valores
CREATE TYPE maya_rank_new AS ENUM (
  'Ajaw',
  'Nacom',
  'Ah K''in',
  'Halach Uinic',
  'K''uk''ulkan'
);

-- Paso 2: Agregar columna temporal
ALTER TABLE gamification_system.user_stats
  ADD COLUMN current_rank_new maya_rank_new;

-- Paso 3: Migrar datos con mapeo
UPDATE gamification_system.user_stats
SET current_rank_new = CASE current_rank::TEXT
  WHEN 'NACOM' THEN 'Ajaw'::maya_rank_new
  WHEN 'BATAB' THEN 'Nacom'::maya_rank_new
  WHEN 'HOLCATTE' THEN 'Ah K''in'::maya_rank_new
  WHEN 'GUERRERO' THEN 'Halach Uinic'::maya_rank_new
  WHEN 'MERCENARIO' THEN 'K''uk''ulkan'::maya_rank_new
  ELSE 'Ajaw'::maya_rank_new -- Default para valores desconocidos
END;

-- Paso 4: Eliminar columna antigua
ALTER TABLE gamification_system.user_stats
  DROP COLUMN current_rank;

-- Paso 5: Renombrar columna nueva
ALTER TABLE gamification_system.user_stats
  RENAME COLUMN current_rank_new TO current_rank;

-- Paso 6: Eliminar tipo antiguo
DROP TYPE maya_rank CASCADE;

-- Paso 7: Renombrar tipo nuevo
ALTER TYPE maya_rank_new RENAME TO maya_rank;

-- Paso 8: Actualizar default
ALTER TABLE gamification_system.user_stats
  ALTER COLUMN current_rank SET DEFAULT 'Ajaw'::maya_rank;
```

---

## 6. Referencias

- **DECISION-LOG-006:** Unificación final sistema de rangos Maya
- **TYPES-GAMIFICATION.md:** Definiciones completas de tipos de gamificación
- **01-RANGOS-MAYA.md:** Especificación canónica de rangos Maya
- **Seed data oficial:** `/projects/gamilit-deployment-scripts/database/.../03-seed-maya-ranks.sql`

---

## 7. Historial de Cambios

### v3.0 (2025-11-02) - CORRECCIÓN CRÍTICA
- ✅ Corregido mapeo erróneo de rangos Maya (P0-002)
- ✅ Actualizado enum PostgreSQL a Title Case
- ✅ Agregado DifficultyLevel con todos los 8 valores
- ✅ Sincronizado con DECISION-LOG-006
- ✅ Agregado script de migración de datos

### v2.0 (Octubre 2025) - LEGACY INCORRECTO
- ❌ Contenía mapeo erróneo: Ajaw → 'nacom'
- ❌ Enum PostgreSQL desactualizado: 'NACOM', 'BATAB', etc.
- ❌ Causaba incompatibilidad P0-CRÍTICO

---

**Última actualización:** 2025-11-02
**Estado:** ✅ CORREGIDO - Sincronizado con sistema oficial
**Mantenido por:** Backend Team
