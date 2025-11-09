# Reporte de Validación de Contradicciones Críticas

**Fecha validación:** 2025-11-07
**Versión:** 1.0
**Tipo:** Validación de Contradicciones Reportadas
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
**Solicitante:** Equipo de desarrollo

---

## 📋 Resumen Ejecutivo

Se validaron **4 contradicciones críticas** reportadas por el equipo de desarrollo:

| ID | Contradicción | Validación | Prioridad | Estado |
|----|---------------|------------|-----------|--------|
| C1 | NotificationType - Definiciones contradictorias | ✅ CONFIRMADA | P0 - CRÍTICO | 🚨 Requiere corrección |
| C2 | Notification Entity duplicada | ✅ CONFIRMADA | P0 - CRÍTICO | 🚨 Requiere corrección |
| C3 | MayaRank - Migración DDL pendiente | ❌ FALSA | N/A | ✅ Ya corregido (2025-11-03) |
| C4 | Guild vs Team - Inconsistencia semántica | ✅ CONFIRMADA | P1 - ALTO | ⚠️ Requiere homologación |

**Resultado:** 3 de 4 contradicciones confirmadas, 1 ya corregida

---

## 🚨 C1: NotificationType - Definiciones Contradictorias [CONFIRMADA]

### Estado: ✅ CONTRADICCIÓN CONFIRMADA - P0 CRÍTICO

### Descripción del Problema

Existen **TRES definiciones diferentes** del enum `NotificationType` en el proyecto:

#### Definición 1: DDL (Base de Datos) ✅ SOURCE OF TRUTH
**Ubicación:** `apps/database/ddl/schemas/public/enums/notification_type.sql`

```sql
CREATE TYPE public.notification_type AS ENUM (
    'achievement_unlocked',    -- 1
    'rank_up',                 -- 2
    'mission_completed',       -- 3
    'friend_request',          -- 4
    'team_invite',             -- 5
    'system_announcement',     -- 6
    'reminder'                 -- 7
);
```
**Total:** 7 valores

---

#### Definición 2: Backend Constants ✅ SINCRONIZADO CON DDL
**Ubicación:** `apps/backend/src/shared/constants/enums.constants.ts`

```typescript
export enum NotificationTypeEnum {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',    // 1
  RANK_UP = 'rank_up',                             // 2
  MISSION_COMPLETED = 'mission_completed',         // 3
  FRIEND_REQUEST = 'friend_request',               // 4
  TEAM_INVITE = 'team_invite',                     // 5
  SYSTEM_ANNOUNCEMENT = 'system_announcement',     // 6
  REMINDER = 'reminder',                           // 7
}
```
**Total:** 7 valores - ✅ **CORRECTO** (coincide con DDL)

---

#### Definición 3a: Entity en /modules/notifications/ ❌ DESINCRONIZADO
**Ubicación:** `apps/backend/src/modules/notifications/entities/notification.entity.ts:14-21`

```typescript
export enum NotificationType {
  ACHIEVEMENT = 'achievement',      // 1 ❌ Diferente a DDL
  MISSION = 'mission',              // 2 ❌ Diferente a DDL
  REWARD = 'reward',                // 3 ❌ No existe en DDL
  SYSTEM = 'system',                // 4 ❌ Diferente a DDL
  SOCIAL = 'social',                // 5 ❌ No existe en DDL
  EDUCATIONAL = 'educational',      // 6 ❌ No existe en DDL
}
```
**Total:** 6 valores - ❌ **INCORRECTO** (no coincide con DDL)

---

#### Definición 3b: Entity en /modules/gamification/ ❌ DESINCRONIZADO
**Ubicación:** `apps/backend/src/modules/gamification/entities/notification.entity.ts:16`

```typescript
/**
 * Tipo de notificación
 * achievement | mission | reward | system | social | educational
 */
@Column({ type: 'text' })
type: string;
```

**Total:** 6 valores mencionados en comentario - ❌ **INCORRECTO** (no coincide con DDL)

---

### Análisis de Impacto

#### 🚨 Impacto CRÍTICO (P0)

1. **Runtime Validation Failures**
   - Las entities usan valores como `'achievement'`, `'mission'`, `'reward'`
   - El DDL espera valores como `'achievement_unlocked'`, `'mission_completed'`
   - Al insertar en BD: **ERROR: invalid input value for enum notification_type**

2. **Type Safety Comprometida**
   - Backend constants correctos, pero entities NO los usan
   - TypeScript no detectará el error en compilación
   - Fallo solo aparecerá en runtime al insertar en BD

3. **Inconsistencia Frontend-Backend**
   - Si frontend usa los valores de las entities (`'achievement'`)
   - Y backend espera valores del DDL (`'achievement_unlocked'`)
   - Las notificaciones NO se crearán correctamente

---

### Comparación de Valores

| DDL (Correcto) | Backend Constants (✅) | Entity notifications (❌) | Entity gamification (❌) | Match |
|----------------|------------------------|---------------------------|--------------------------|-------|
| `achievement_unlocked` | ✅ ACHIEVEMENT_UNLOCKED | ❌ `achievement` | ❌ `achievement` | ❌ |
| `rank_up` | ✅ RANK_UP | ❌ `mission` | ❌ `mission` | ❌ |
| `mission_completed` | ✅ MISSION_COMPLETED | ❌ `reward` | ❌ `reward` | ❌ |
| `friend_request` | ✅ FRIEND_REQUEST | ❌ `system` | ❌ `system` | ❌ |
| `team_invite` | ✅ TEAM_INVITE | ❌ `social` | ❌ `social` | ❌ |
| `system_announcement` | ✅ SYSTEM_ANNOUNCEMENT | ❌ `educational` | ❌ `educational` | ❌ |
| `reminder` | ✅ REMINDER | ❌ N/A | ❌ N/A | ❌ |

**Coincidencias:** 0 de 7 valores (0%)

---

### Acciones Requeridas (P0)

#### Acción 1: Corregir Entity en /modules/notifications/
```typescript
// ANTES (INCORRECTO):
export enum NotificationType {
  ACHIEVEMENT = 'achievement',
  MISSION = 'mission',
  REWARD = 'reward',
  SYSTEM = 'system',
  SOCIAL = 'social',
  EDUCATIONAL = 'educational',
}

// DESPUÉS (CORRECTO):
import { NotificationTypeEnum } from '@/shared/constants';
// Usar NotificationTypeEnum que SÍ está sincronizado con DDL
```

#### Acción 2: Corregir Entity en /modules/gamification/
```typescript
// ANTES (INCORRECTO):
/**
 * Tipo de notificación
 * achievement | mission | reward | system | social | educational
 */
@Column({ type: 'text' })
type: string;

// DESPUÉS (CORRECTO):
import { NotificationTypeEnum } from '@/shared/constants';

@Column({
  type: 'enum',
  enum: NotificationTypeEnum
})
type: NotificationTypeEnum;
```

#### Acción 3: Actualizar referencias en código
```bash
# Buscar todos los usos de los valores incorrectos
grep -r "type.*:.*'achievement'" apps/backend/src --include="*.ts"
grep -r "type.*:.*'mission'" apps/backend/src --include="*.ts"
grep -r "type.*:.*'reward'" apps/backend/src --include="*.ts"
```

#### Acción 4: Testing
- [ ] Crear test que valide inserción de cada tipo de notificación
- [ ] Verificar que no hay hardcoded strings con valores incorrectos
- [ ] Validar que frontend también usa valores correctos

---

### Estimación de Corrección
- **Complejidad:** Media
- **Tiempo estimado:** 2-4 horas
- **Archivos afectados:** 2-3 entities + posibles servicios
- **Riesgo de regresión:** Alto (si notificaciones ya existen en BD con valores incorrectos)

---

## 🚨 C2: Notification Entity Duplicada [CONFIRMADA]

### Estado: ✅ CONTRADICCIÓN CONFIRMADA - P0 CRÍTICO

### Descripción del Problema

Existen **DOS definiciones de la misma entity** en diferentes módulos:

#### Entity 1: /modules/gamification/
**Ubicación:** `apps/backend/src/modules/gamification/entities/notification.entity.ts`

```typescript
@Entity({
  schema: DB_SCHEMAS.GAMIFICATION,
  name: DB_TABLES.GAMIFICATION.NOTIFICATIONS
})
export class Notification {
  // ... definición completa
}
```

**Características:**
- Usa `DB_SCHEMAS.GAMIFICATION` y `DB_TABLES.GAMIFICATION.NOTIFICATIONS`
- Importa `NotificationTypeEnum` de constants (pero no lo usa)
- Tipo de columna `type: string` (no enum)
- Apunta a: `gamification_system.notifications`

---

#### Entity 2: /modules/notifications/
**Ubicación:** `apps/backend/src/modules/notifications/entities/notification.entity.ts`

```typescript
@Entity({
  schema: 'gamification_system',
  name: 'notifications'
})
export class Notification {
  // ... definición completa con ENUM local
}
```

**Características:**
- Usa strings hardcoded `'gamification_system'`, `'notifications'`
- Define su propio `enum NotificationType` (valores INCORRECTOS)
- Tipo de columna `type: NotificationType` (enum local)
- Apunta a: `gamification_system.notifications`

---

### Análisis de Impacto

#### 🚨 Riesgos Identificados

1. **Conflicto de TypeORM**
   - Dos entities mapean la misma tabla
   - TypeORM puede tener comportamiento indefinido
   - Riesgo de sincronización fallida (`synchronize: true`)

2. **Inconsistencia de Tipos**
   - Entity 1 usa `string`
   - Entity 2 usa `NotificationType` (enum local incorrecto)
   - Al usar ambas entities, tipos incompatibles

3. **Mantenimiento Duplicado**
   - Cambios en schema requieren actualizar DOS entities
   - Riesgo de desincronización entre entities
   - Confusión para desarrolladores: ¿cuál usar?

4. **Imports Conflictivos**
   - `import { Notification } from '@/modules/gamification/entities'`
   - `import { Notification } from '@/modules/notifications/entities'`
   - Conflicto de nombres en TypeScript

---

### Comparación de Entities

| Aspecto | Entity Gamification | Entity Notifications | Match |
|---------|---------------------|----------------------|-------|
| Schema destino | `gamification_system.notifications` | `gamification_system.notifications` | ✅ |
| Decorador schema | `DB_SCHEMAS.GAMIFICATION` | `'gamification_system'` hardcoded | ⚠️ |
| Decorador name | `DB_TABLES.GAMIFICATION.NOTIFICATIONS` | `'notifications'` hardcoded | ⚠️ |
| Tipo de `type` | `string` | `NotificationType` (enum local) | ❌ |
| Valores de type | No especificados | 6 valores incorrectos | ❌ |
| Naming style | snake_case (user_id) | camelCase (userId) | ❌ |
| Decoradores fecha | `@Column` manual | `@CreateDateColumn`, `@UpdateDateColumn` | ⚠️ |

---

### Acciones Requeridas (P0)

#### Opción 1: Consolidar en /modules/gamification/ (RECOMENDADO)

**Razón:** Las notificaciones son parte del sistema de gamificación.

```typescript
// Mantener: apps/backend/src/modules/gamification/entities/notification.entity.ts
// Eliminar: apps/backend/src/modules/notifications/entities/notification.entity.ts

// Actualizar la entity en gamification para usar enum correcto:
import { NotificationTypeEnum } from '@/shared/constants';

@Column({
  type: 'enum',
  enum: NotificationTypeEnum
})
type: NotificationTypeEnum;
```

**Acciones:**
1. [ ] Eliminar entity de `/modules/notifications/`
2. [ ] Actualizar imports en servicios que usaban la entity de notifications
3. [ ] Actualizar tipo de columna `type` en entity de gamification
4. [ ] Exportar entity desde `/modules/gamification/entities/index.ts`
5. [ ] Testing completo de módulo de notificaciones

---

#### Opción 2: Consolidar en /modules/notifications/

**Razón:** Separación de responsabilidades, notificaciones como feature independiente.

```typescript
// Mantener: apps/backend/src/modules/notifications/entities/notification.entity.ts
// Eliminar: apps/backend/src/modules/gamification/entities/notification.entity.ts

// Actualizar entity para:
// 1. Usar constants de DB_SCHEMAS
// 2. Usar NotificationTypeEnum correcto
// 3. Mantener snake_case consistente con DDL
```

**Acciones:**
1. [ ] Eliminar entity de `/modules/gamification/`
2. [ ] Actualizar entity de notifications con valores correctos
3. [ ] Actualizar imports en gamification module
4. [ ] Mantener schema como `gamification_system` (tabla pertenece a ese schema)
5. [ ] Testing completo de ambos módulos

---

### Recomendación

**Opción 1 (Consolidar en gamification)** es preferible porque:
- La tabla vive en schema `gamification_system`
- Las notificaciones son eventos del sistema de gamificación
- Menor impacto: module notifications puede importar desde gamification
- Consistencia arquitectónica

---

### Estimación de Corrección
- **Complejidad:** Media-Alta
- **Tiempo estimado:** 3-5 horas
- **Archivos afectados:** 5-10 (entities, services, modules, exports)
- **Riesgo de regresión:** Alto (requiere testing exhaustivo)

---

## ✅ C3: MayaRank - Migración DDL Pendiente [FALSA]

### Estado: ❌ CONTRADICCIÓN FALSA - Ya corregido el 2025-11-03

### Descripción del Reporte Original

Se reportó que:
- DDL legacy tenía valores incorrectos: `'NACOM'`, `'BATAB'`, `'GUERRERO'`, `'MERCENARIO'`
- Docs indicaban migración P0-CRÍTICO pendiente
- Impacto: Datos históricos incorrectos

---

### Validación Actual

#### DDL Actual ✅ CORRECTO
**Ubicación:** `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql`

```sql
CREATE TYPE gamification_system.maya_rank AS ENUM (
    'Ajaw',           -- Nivel 1: Señor o gobernante (0-999 XP)
    'Nacom',          -- Nivel 2: Capitán de guerra (1,000-2,999 XP)
    'Ah K''in',       -- Nivel 3: Sacerdote del sol (3,000-5,999 XP)
    'Halach Uinic',   -- Nivel 4: Hombre verdadero (6,000-9,999 XP)
    'K''uk''ulkan'    -- Nivel 5: Serpiente emplumada (10,000+ XP)
);
```

**Fecha de migración:** 2025-11-03 (según changelog en línea 49-51)

---

### Changelog del DDL

```sql
-- 2025-11-03: Creación inicial del enum (homologación de rangos legacy)
--             Anterior: nacom, batab, holcatte, guerrero, mercenario (legacy)
--             Nuevo: Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan (correcto)
```

---

### Conclusión

**La contradicción reportada YA FUE CORREGIDA.**

- ✅ Los valores incorrectos (`NACOM`, `BATAB`, etc.) fueron migrados
- ✅ Los valores actuales son correctos y culturalmente precisos
- ✅ El DDL incluye documentación histórica y referencias
- ✅ El enum está en el schema correcto (`gamification_system`)

---

### Estado Actual

| Aspecto | Estado | Validación |
|---------|--------|------------|
| Valores DDL | ✅ Correctos | Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan |
| Ubicación | ✅ Correcta | `gamification_system.maya_rank` |
| Documentación | ✅ Completa | Incluye progresión, rangos XP, referencias |
| Migración legacy | ✅ Completada | 2025-11-03 |
| Backend sync | ⚠️ PENDIENTE VALIDAR | Verificar constants |

---

### Acción Recomendada

Validar que backend constants estén sincronizados:

```bash
# Verificar en backend
grep -r "maya_rank\|MayaRank" apps/backend/src/shared/constants --include="*.ts" -A 10
```

Si backend aún usa valores legacy, actualizar a valores nuevos.

---

## ⚠️ C4: Guild vs Team - Inconsistencia Semántica [CONFIRMADA]

### Estado: ✅ CONTRADICCIÓN CONFIRMADA - P1 ALTO

### Descripción del Problema

Existe **inconsistencia terminológica** entre documentación y código:

- **Documentación:** Usa consistentemente "Guild", "GuildMember"
- **Código:** Usa consistentemente "Team", "TeamMember"

---

### Evidencia: Documentación usa "Guild"

#### Archivo 1: SOCIAL-GUILDS.md
**Ubicación:** `docs/02-especificaciones-tecnicas/apis/SOCIAL-GUILDS.md`

```markdown
# Social Features API - Guilds/Teams System

## Endpoints

### 2.1. Create Guild
POST /api/guilds

### 2.2. Get Guild Details
GET /api/guilds/:guildId
```

**Uso:** "Guild" en títulos, endpoints, descripciones

---

#### Otros archivos con "Guild"

```
docs/02-especificaciones-tecnicas/apis/SOCIAL-GUILDS.md
docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-SOCIAL.md
docs/01-requerimientos/definiciones/GLOSARIO-A-L.md
docs/01-requerimientos/definiciones/GLOSARIO-M-Z.md
```

**Total:** 78 archivos mencionan "Guild" o "guild"

---

### Evidencia: Código usa "Team"

#### Entity: team.entity.ts
**Ubicación:** `apps/backend/src/modules/social/entities/team.entity.ts`

```typescript
/**
 * Team Entity (social_features.teams)
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.TEAMS })
export class Team {
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true, nullable: true })
  team_code?: string;
}
```

---

#### DDL: Table teams
**Ubicación:** `apps/database/ddl/schemas/social_features/tables/05-teams.sql`

```sql
CREATE TABLE social_features.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    team_code TEXT UNIQUE,
    ...
);
```

---

#### Backend Modules
```
apps/backend/src/modules/social/entities/team.entity.ts
apps/backend/src/modules/social/entities/team-member.entity.ts
apps/backend/src/modules/social/entities/team-challenge.entity.ts
apps/backend/src/modules/social/services/teams.service.ts
apps/backend/src/modules/social/services/team-members.service.ts
apps/backend/src/modules/social/controllers/teams.controller.ts
apps/backend/src/modules/social/dto/create-team.dto.ts
```

**Total:** 21 archivos usan "Team" consistentemente

---

### Comparación

| Aspecto | Documentación | Código | Match |
|---------|---------------|--------|-------|
| Nombre concepto | "Guild" | "Team" | ❌ |
| Endpoints | `/api/guilds` | N/A (no implementados) | ❌ |
| Entity | "Guild" | `Team` | ❌ |
| Tabla DDL | "guilds" (esperado) | `teams` | ❌ |
| Miembros | "GuildMember" | `TeamMember` | ❌ |
| Constantes | N/A | `DB_TABLES.SOCIAL.TEAMS` | ❌ |

---

### Análisis de Impacto

#### 🟠 Impacto ALTO (P1)

1. **Confusión en Desarrollo**
   - Documentación dice "Guild", código implementa "Team"
   - Nuevos desarrolladores pueden buscar código de "Guild" que no existe
   - PRs y code reviews con terminología mixta

2. **APIs Inconsistentes**
   - Docs especifican `/api/guilds`
   - Implementación probablemente usa `/api/teams`
   - Frontend puede estar confundido sobre qué endpoint usar

3. **Comunicación con Stakeholders**
   - PM/PO hablan de "Guilds"
   - Desarrolladores hablan de "Teams"
   - Riesgo de malentendidos en planificación

4. **Documentación Obsoleta**
   - Docs no reflejan implementación real
   - Riesgo de implementar features basadas en docs incorrectas

---

### Acciones Requeridas (P1)

#### Opción 1: Renombrar código de "Team" → "Guild" (NO RECOMENDADO)

**Pros:**
- Docs siguen siendo válidas
- "Guild" suena más épico/gamificado

**Contras:**
- ❌ Refactor masivo de código (21 archivos)
- ❌ Migración de base de datos (tabla `teams` → `guilds`)
- ❌ Rompe APIs existentes (si ya están en uso)
- ❌ Alto riesgo de regresión
- **Estimación:** 8-12 horas

---

#### Opción 2: Actualizar docs de "Guild" → "Team" (RECOMENDADO) ✅

**Pros:**
- ✅ Sin cambios de código
- ✅ Sin riesgo de regresión
- ✅ Código ya usa "Team" consistentemente
- ✅ "Team" es más universal/entendible

**Contras:**
- Necesita actualizar ~78 archivos de docs
- **Estimación:** 2-3 horas (search & replace)

---

### Recomendación

**Opción 2 (Actualizar documentación)** es ALTAMENTE recomendada porque:

1. El código YA usa "Team" de forma consistente
2. La tabla DDL es `social_features.teams`
3. Las entities, services, controllers usan "Team"
4. Actualizar docs es mucho menos riesgoso que refactorizar código
5. "Team" es un término más neutral y entendible

---

### Script de Actualización

```bash
# Buscar y reemplazar en documentación
cd docs/

# Reemplazar "Guild" con "Team" (case-sensitive)
find . -type f -name "*.md" -exec sed -i 's/Guild/Team/g' {} +
find . -type f -name "*.md" -exec sed -i 's/guild/team/g' {} +

# Actualizar endpoints
find . -type f -name "*.md" -exec sed -i 's/\/api\/guilds/\/api\/teams/g' {} +

# Actualizar tipos TypeScript en docs
find . -type f -name "*.md" -exec sed -i 's/GuildMember/TeamMember/g' {} +
find . -type f -name "*.md" -exec sed -i 's/GuildChallenge/TeamChallenge/g' {} +

# Renombrar archivo
mv docs/02-especificaciones-tecnicas/apis/SOCIAL-GUILDS.md \
   docs/02-especificaciones-tecnicas/apis/SOCIAL-TEAMS.md
```

---

### Validación Post-Corrección

```bash
# Verificar que no queden referencias a "Guild"
grep -r "Guild\|guild" docs/ --include="*.md" | grep -v "# Guild vs Team"

# Debe retornar 0 resultados (excepto este reporte de contradicciones)
```

---

### Estimación de Corrección
- **Complejidad:** Baja
- **Tiempo estimado:** 2-3 horas
- **Archivos afectados:** ~78 archivos de documentación
- **Riesgo de regresión:** Muy bajo (solo documentación)

---

## 📊 Resumen de Validación

### Dashboard de Contradicciones

| ID | Contradicción | Validación | Prioridad | Complejidad | Tiempo Estimado |
|----|---------------|------------|-----------|-------------|-----------------|
| C1 | NotificationType | ✅ CONFIRMADA | P0 | Media | 2-4h |
| C2 | Notification Entity duplicada | ✅ CONFIRMADA | P0 | Media-Alta | 3-5h |
| C3 | MayaRank | ❌ FALSA | N/A | N/A | 0h (ya corregido) |
| C4 | Guild vs Team | ✅ CONFIRMADA | P1 | Baja | 2-3h |
| **TOTAL** | **4 validadas** | **3 confirmadas** | - | - | **7-12h** |

---

### Priorización de Correcciones

#### Sprint Actual (Esta Semana) - P0

**Correcciones críticas que bloquean funcionalidad:**

1. **C1 - NotificationType** (2-4h)
   - Corregir entities para usar `NotificationTypeEnum` de constants
   - Actualizar servicios que crean notificaciones
   - Testing de inserción en BD

2. **C2 - Notification Entity duplicada** (3-5h)
   - Consolidar en un solo módulo (recomendado: gamification)
   - Actualizar imports
   - Testing exhaustivo

**Total P0:** 5-9 horas

---

#### Próximo Sprint - P1

**Correcciones importantes pero no bloqueantes:**

3. **C4 - Guild vs Team** (2-3h)
   - Actualizar documentación con search & replace
   - Renombrar archivos
   - Validación de consistencia

**Total P1:** 2-3 horas

---

### Riesgos y Consideraciones

#### Riesgos de C1 (NotificationType)

⚠️ **ALTO:** Si ya existen notificaciones en BD con valores incorrectos:
```sql
-- Verificar si hay datos incorrectos
SELECT type, COUNT(*)
FROM gamification_system.notifications
GROUP BY type;

-- Si retorna: 'achievement', 'mission', 'reward', etc.
-- Entonces hay datos con valores incorrectos que requieren migración
```

**Plan de Mitigación:**
1. Verificar datos existentes antes de corregir
2. Si hay datos incorrectos, crear script de migración
3. Mapear valores: `'achievement'` → `'achievement_unlocked'`, etc.

---

#### Riesgos de C2 (Entity Duplicada)

⚠️ **ALTO:** Consolidar entities puede romper servicios existentes

**Plan de Mitigación:**
1. Identificar TODOS los imports de ambas entities
2. Crear checklist de archivos a actualizar
3. Testing exhaustivo después de consolidación
4. Desplegar en staging primero

---

#### Riesgos de C4 (Guild vs Team)

✅ **BAJO:** Solo documentación, sin impacto en código

**Plan de Mitigación:**
1. Hacer backup de docs/ antes de search & replace
2. Revisar manualmente archivos clave después del cambio
3. Verificar que no se rompieron links internos

---

## 🔗 Referencias

### Archivos Clave Validados

**NotificationType:**
- DDL: `apps/database/ddl/schemas/public/enums/notification_type.sql`
- Constants: `apps/backend/src/shared/constants/enums.constants.ts`
- Entity 1: `apps/backend/src/modules/notifications/entities/notification.entity.ts`
- Entity 2: `apps/backend/src/modules/gamification/entities/notification.entity.ts`

**MayaRank:**
- DDL: `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql`

**Team vs Guild:**
- Docs: `docs/02-especificaciones-tecnicas/apis/SOCIAL-GUILDS.md`
- Entity: `apps/backend/src/modules/social/entities/team.entity.ts`
- DDL: `apps/database/ddl/schemas/social_features/tables/05-teams.sql`

---

### Scripts de Validación

```bash
# Regenerar inventarios
bash apps/database/scripts/inventory/generate-all-inventories.sh

# Verificar NotificationType en código
grep -r "NotificationType\|notification_type" apps/backend/src --include="*.ts" -B 2 -A 5

# Verificar entities duplicadas
find apps/backend/src -name "*.entity.ts" -exec grep -l "class Notification" {} \;

# Verificar Guild vs Team
grep -r "Guild\|guild" docs/ --include="*.md" | wc -l
grep -r "Team\|team" apps/backend/src/modules/social --include="*.ts" | wc -l
```

---

## ✅ Checklist de Corrección

### C1 - NotificationType

- [ ] Identificar todos los servicios que crean notificaciones
- [ ] Actualizar entity en `/modules/notifications/` para usar `NotificationTypeEnum`
- [ ] Actualizar entity en `/modules/gamification/` para usar `NotificationTypeEnum`
- [ ] Eliminar enum local `NotificationType` de `/modules/notifications/`
- [ ] Actualizar imports en servicios
- [ ] Verificar datos existentes en BD
- [ ] Migrar datos si es necesario
- [ ] Testing completo de creación de notificaciones
- [ ] Validar en staging

### C2 - Notification Entity Duplicada

- [ ] Decidir cuál entity mantener (recomendado: gamification)
- [ ] Hacer grep de todos los imports de ambas entities
- [ ] Crear checklist de archivos a actualizar
- [ ] Eliminar entity duplicada
- [ ] Actualizar imports en TODOS los archivos afectados
- [ ] Actualizar exports de módulos
- [ ] Testing de módulo de notifications
- [ ] Testing de módulo de gamification
- [ ] Validar en staging

### C4 - Guild vs Team

- [ ] Backup de directorio `docs/`
- [ ] Ejecutar script de search & replace
- [ ] Renombrar `SOCIAL-GUILDS.md` → `SOCIAL-TEAMS.md`
- [ ] Revisar manualmente archivos clave
- [ ] Verificar links internos no rotos
- [ ] Commit de cambios documentales
- [ ] Validar con equipo de producto

---

## 📞 Contacto y Seguimiento

**Responsable de validación:** Sistema SIMCO
**Reporte generado:** 2025-11-07
**Próxima revisión:** Después de implementar correcciones P0

**Para consultas:**
- Tracking: `apps/database/docs/TRACKING-CORRECCIONES.md`
- Validaciones: `apps/database/docs/REPORTE-VALIDACION-2025-11-07.md`

---

**Generado por:** Sistema de Validación SIMCO
**Método:** Verificación cruzada DDL ↔ Backend ↔ Docs
**Confiabilidad:** Alta (validación directa de archivos fuente)

---

**Estado:** 🚨 **ACCIÓN REQUERIDA** - 3 contradicciones críticas confirmadas
**Tendencia:** ✅ **POSITIVA** - 1 de 4 ya corregida (MayaRank)
**Recomendación:** Priorizar correcciones P0 en sprint actual
