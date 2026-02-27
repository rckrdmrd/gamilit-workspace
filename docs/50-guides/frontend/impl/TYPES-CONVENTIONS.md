# Convenciones de Types - Frontend GAMILIT

**Fecha de creación:** 2025-11-29
**Versión:** 1.0
**Estado:** VIGENTE
**Contexto:** P2-001 Consolidación de Types

---

## 1. Principios Fundamentales

### 1.1 Single Source of Truth (SSOT)

**Regla:** Cada tipo de dato tiene UNA SOLA ubicación canónica (SSOT). Todas las demás ubicaciones deben importar desde el SSOT o re-exportar.

**Violación de esta regla = Deuda técnica crítica**

### 1.2 No Duplicación

**Prohibido:**
- Definir el mismo type/interface en múltiples archivos
- Copiar definiciones de types entre features
- Crear tipos "simplificados" que dupliquen campos

**Permitido:**
- Re-exportar desde SSOT
- Extender interfaces cuando sea necesario (`extends`)
- Crear tipos derivados (`Pick<T, K>`, `Omit<T, K>`, `Partial<T>`)

---

## 2. Fuentes de Verdad (SSOT) por Categoría

### 2.1 Types Compartidos

| Categoría | SSOT | Contiene |
|-----------|------|----------|
| Achievement | `/shared/types/achievement.types.ts` | Achievement, UserAchievement, AchievementCategory |
| Gamification | `/shared/types/gamification.types.ts` | UserStats, UserRank, MLCoinsBalance |
| Educational | `/shared/types/educational.types.ts` | Exercise, Module |
| Progress | `/shared/types/progress.types.ts` | ModuleProgress, ExerciseAttempt |
| Social | `/shared/types/social.types.ts` | Classroom, Team, Friendship |
| Profile | `/shared/types/profile.types.ts` | Profile, UserPreferences |
| Content | `/shared/types/content.types.ts` | MediaFile, ContentTemplate |
| Leaderboard | `/shared/types/leaderboard.types.ts` | LeaderboardEntry |

### 2.2 Constants (Enums y Configuración)

| Categoría | SSOT | Contiene |
|-----------|------|----------|
| MayaRank (enum) | `/shared/constants/ranks.constants.ts` | MayaRank enum, RankConfig, helpers |

### 2.3 Types de Features

| Feature | SSOT | Contiene |
|---------|------|----------|
| Auth | `/features/auth/types/auth.types.ts` | User, AuthState, Session |
| Missions | `/features/gamification/missions/types/missionsTypes.ts` | Mission, UserMission |

---

## 3. Reglas de Importación

### 3.1 Imports Correctos

```typescript
// ✅ CORRECTO - Importar desde barrel principal
import { Achievement, UserStats, UserRank } from '@shared/types';

// ✅ CORRECTO - Importar enum desde constants
import { MayaRank } from '@shared/constants/ranks.constants';

// ✅ CORRECTO - Importar tipos específicos de admin
import type { MayaRankConfig } from '@shared/types/admin';

// ✅ CORRECTO - Importar desde feature cuando es específico de esa feature
import { Mission } from '@features/gamification/missions/types/missionsTypes';
```

### 3.2 Imports Incorrectos

```typescript
// ❌ INCORRECTO - Importar desde API
import { Achievement } from '@features/gamification/api/gamificationAPI';

// ❌ INCORRECTO - Importar con ruta relativa profunda
import { UserStats } from '../../../shared/types/gamification.types';

// ❌ INCORRECTO - Importar duplicado
import { MayaRank } from '@shared/types/gamification.types';
// Debe ser: import { MayaRank } from '@shared/constants/ranks.constants';
```

---

## 4. Convenciones de Naming

### 4.1 Campos de Base de Datos (snake_case)

Los types que mapean directamente a entidades de base de datos usan **snake_case**:

```typescript
interface UserStats {
  user_id: string;           // ✅ snake_case
  total_xp: number;          // ✅ snake_case
  current_rank: MayaRank;    // ✅ snake_case
  created_at?: string;       // ✅ snake_case
}
```

### 4.2 Campos de UI/Computed (camelCase)

Los types específicos de UI o campos calculados usan **camelCase**:

```typescript
interface AchievementFilter {
  searchQuery?: string;      // ✅ camelCase (UI-only)
  sortBy?: string;           // ✅ camelCase (UI-only)
}
```

### 4.3 Interfaces vs Types

- **`interface`**: Para objetos con estructura definida
- **`type`**: Para uniones, intersecciones, aliases

```typescript
// ✅ Interface para objetos
interface Achievement {
  id: string;
  name: string;
}

// ✅ Type para uniones
type AchievementCategory = 'progress' | 'streak' | 'completion';

// ✅ Type para alias
type AchievementId = string;
```

---

## 5. Estructura de Archivos de Types

### 5.1 Archivo de Types Estándar

```typescript
/**
 * [Nombre] Types
 *
 * SSOT para [categoría] types.
 * @see Backend: [ruta a entity/dto]
 * @see Database: [tabla]
 */

// 1. Enums/Constants (si son específicos de este archivo)
export enum SomeEnum { ... }

// 2. Interfaces base
export interface BaseType { ... }

// 3. Interfaces derivadas
export interface DerivedType extends BaseType { ... }

// 4. DTOs (si aplica)
export interface CreateTypeDto { ... }
export interface UpdateTypeDto { ... }

// 5. Constantes de UI (colores, labels)
export const TYPE_COLORS: Record<...> = { ... };
```

### 5.2 Barrel Export (index.ts)

```typescript
// /shared/types/index.ts
export * from './achievement.types';
export * from './gamification.types';
export * from './educational.types';
// ... etc

// NO re-exportar MayaRank aquí si ya está en gamification.types
// MayaRank SSOT está en /shared/constants/ranks.constants.ts
```

---

## 6. Proceso para Agregar Nuevos Types

### 6.1 Checklist Pre-Creación

1. [ ] ¿El type ya existe en algún SSOT?
2. [ ] ¿Hay un type similar que pueda extenderse?
3. [ ] ¿Pertenece a shared o a una feature específica?
4. [ ] ¿Mapea a base de datos o es solo UI?

### 6.2 Ubicación por Tipo

| Tipo de Type | Ubicación |
|--------------|-----------|
| Mapea a tabla DB | `/shared/types/[dominio].types.ts` |
| Específico de feature | `/features/[feature]/types/` |
| Solo UI/temporal | Dentro del componente o hook |
| Configuración/Enum global | `/shared/constants/` |

### 6.3 Documentación Requerida

Todo nuevo type debe incluir:
```typescript
/**
 * [Nombre del Type]
 * [Descripción breve]
 *
 * @see Backend: [ruta si aplica]
 * @see Database: [tabla si aplica]
 */
export interface MyNewType { ... }
```

---

## 7. Política de No Conflicto de Nombres

### 7.1 Nombres Reservados

Los siguientes nombres tienen significado específico y NO deben usarse para otros propósitos:

| Nombre | Significado | SSOT |
|--------|-------------|------|
| `MayaRank` | Enum de 5 rangos Maya | `ranks.constants.ts` |
| `Achievement` | Definición de logro | `achievement.types.ts` |
| `UserStats` | Estadísticas completas | `gamification.types.ts` |
| `UserRank` | Progresión de rango | `gamification.types.ts` |

### 7.2 Sufijos para Variantes

Si necesitas una variante, usa sufijos descriptivos:

```typescript
// ✅ CORRECTO
interface MayaRankConfig { ... }    // Configuración de rank
interface AchievementFilter { ... } // Filtros de achievement
interface UserStatsUpdate { ... }   // DTO de update

// ❌ INCORRECTO
interface MayaRank { ... }  // Conflicto con enum MayaRank
```

---

## 8. Mantenimiento y Auditoría

### 8.1 Revisión Periódica

- **Frecuencia:** Cada sprint o PR grande
- **Herramienta:** Grep para detectar duplicados
- **Responsable:** Revisor de PR

### 8.2 Comandos de Auditoría

```bash
# Buscar duplicados de MayaRank
grep -r "enum MayaRank" apps/frontend/src/

# Buscar definiciones de Achievement interface
grep -r "interface Achievement" apps/frontend/src/

# Verificar imports correctos
grep -r "from '@shared/types'" apps/frontend/src/ | wc -l
```

### 8.3 Métricas de Salud

| Métrica | Objetivo |
|---------|----------|
| % imports desde @shared/types | > 95% |
| Definiciones duplicadas | 0 |
| Conflictos de nombre | 0 |

---

## 9. Sincronizacion con Backend

### 9.1 Fuentes de Verdad

| Capa | SSOT | Descripcion |
|------|------|-------------|
| Database | DDL en `/apps/database/ddl/` | Schemas, tablas, enums |
| Backend | Entities + DTOs | Estructura de datos y validaciones |
| Frontend | Types generados + manuales | Consumo de API |

### 9.2 Herramientas de Sincronizacion

**Scripts disponibles (desde raiz del monorepo):**

```bash
# Sincronizar enums Backend -> Frontend (automatico en postinstall)
npm run sync:enums

# Generar types desde OpenAPI spec
npm run generate:api-types

# Validar constantes no hardcodeadas
npm run validate:constants

# Validar contrato de API
npm run validate:api-contract

# Ejecutar todas las validaciones
npm run validate:all
```

### 9.3 Uso de Types Generados

**Ubicacion:** `/src/generated/api-types.ts` (24K+ lineas)

**Cuando usar types generados:**
- Respuestas de API exactas
- Parametros de endpoints
- Schemas de validacion

**Cuando usar types manuales:**
- UI-only types (estados locales)
- Types extendidos con campos calculados
- Simplificaciones para componentes

```typescript
// Importar desde generados
import type { paths, components } from '@/generated/api-types';

// Usar schema de componente
type UserResponse = components['schemas']['UserResponseDto'];

// Usar path operation
type GetUsersParams = paths['/v1/users']['get']['parameters']['query'];
```

### 9.4 Flujo de Sincronizacion

```
1. Backend cambia DTO/Entity
         |
2. Backend actualiza OpenAPI annotations (@ApiProperty, etc)
         |
3. Frontend ejecuta: npm run generate:api-types
         |
4. Types en /generated/api-types.ts se actualizan
         |
5. Componentes que usan types generados se actualizan automaticamente
```

### 9.5 Proceso para Agregar Type Compartido

1. **Backend define primero:**
   - Crear/modificar Entity en backend
   - Crear DTOs con decoradores Swagger
   - Verificar que OpenAPI spec se genera correctamente

2. **Frontend sincroniza:**
   ```bash
   npm run generate:api-types
   ```

3. **Frontend decide tipo de uso:**
   - Si es exacto al backend: usar de `@/generated/api-types`
   - Si necesita extension: crear en `/shared/types/` e importar de generado

   ```typescript
   // Extender type generado
   import type { components } from '@/generated/api-types';

   type BaseAchievement = components['schemas']['AchievementResponseDto'];

   // Extender con campos de UI
   export interface Achievement extends BaseAchievement {
     isNew?: boolean;  // Campo UI-only
     displayColor?: string;  // Campo calculado
   }
   ```

---

## 10. Referencias

- **Estandar de tipos (canonica):** [`docs/40-standards/ESTANDAR-FRONTEND-TYPES.md`](../../../40-standards/ESTANDAR-FRONTEND-TYPES.md) -- Jerarquia de tipos, anti-duplicados, inline types, any policy
- **Estandar de imports:** [`docs/40-standards/ESTANDAR-FRONTEND-IMPORTS.md`](../../../40-standards/ESTANDAR-FRONTEND-IMPORTS.md) -- Import order y path aliases
- **Analisis inicial:** `TYPES-CONSOLIDATION-ANALYSIS.md`
- **Plan de consolidacion:** `TYPES-CONSOLIDATION-PLAN.md`
- **Estructura de features:** `ESTRUCTURA-FEATURES.md`
- **Backend entities:** `/apps/backend/src/modules/*/entities/`
- **Backend DTOs:** `/apps/backend/src/modules/*/dto/`
- **DTO Conventions:** `../backend/DTO-CONVENTIONS.md`
- **Database DDL:** `/apps/database/ddl/schemas/`
- **Scripts DevOps:** `/apps/devops/scripts/`

---

## 11. Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-29 | Creación inicial como parte de P2-001 |
