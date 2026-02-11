# Reporte de Cumplimiento SIMCO - Gamilit

**Fecha:** 2025-11-07
**Versión:** 2.0 (Corregido)
**Tipo:** Validación de Sistema Indexado Modular por Contexto
**Responsable:** Análisis automatizado

---

## 📋 Resumen Ejecutivo

Este reporte evalúa el cumplimiento del workspace Gamilit con los criterios del sistema **SIMCO (Sistema Indexado Modular por Contexto)**, con enfoque correcto en:

### Principios SIMCO Aplicados

1. **Mapeo estricto (_MAP.md)** SOLO en:
   - ✅ Workspace (raíz, orchestration, artifacts)
   - ✅ Documentación (docs/)
   - ✅ Archivos de definición DDL (apps/database/ddl/)

2. **Código de desarrollo (apps/backend/src, apps/frontend/src)** NO debe tener _MAP.md
   - ✅ Solo comentarios con referencias a docs
   - ✅ Debe estar REFERENCIADO desde docs/

3. **Referencias bidireccionales:**
   - ➡️ **Docs → Apps**: Documentación debe citar implementación con paths completos
   - ⬅️ **Apps → Docs**: Código debe tener comentarios referenciando requerimientos/specs

---

## 🎯 Criterios de Evaluación SIMCO

| Criterio | Descripción | Estado Actual | Meta |
|----------|-------------|---------------|------|
| **Mapeo en Workspace** | _MAP.md en raíz, orchestration, artifacts | 🟢 100% | 100% |
| **Mapeo en Docs** | _MAP.md en docs/ (80% de carpetas) | 🔴 1.6% | 80% |
| **Mapeo en DDL** | _MAP.md en apps/database/ddl/ | 🟢 85% | 80% |
| **NO mapeo en código** | Sin _MAP.md en apps/backend/src, apps/frontend/src | ✅ Correcto | N/A |
| **Referencias Docs → Apps** | Docs citan implementación | 🔴 11% excelente | 80% |
| **Referencias Apps → Docs** | Código cita requerimientos | 🔴 ~5% | 50% |

---

## 📊 Métricas Actuales

### 1. Cobertura de _MAP.md (Solo donde debe haberlos)

#### Workspace y Estructura General
| Área | Archivos _MAP.md | Cobertura | Evaluación |
|------|------------------|-----------|------------|
| **Raíz** | 1/1 | 100% | 🟢 Perfecto |
| **orchestration/** | 7/8 | 87% | 🟢 Excelente |
| **artifacts/** | 4/5 | 80% | 🟢 Muy bueno |
| **.claude/** | 6/7 | 85% | 🟢 Muy bueno |

#### Documentación (CRÍTICO)
| Área | Archivos _MAP.md | Total dirs | Cobertura | Estado |
|------|------------------|------------|-----------|--------|
| **docs/** (GLOBAL) | 2 | 121 | **1.6%** | 🔴 **CRÍTICO** |
| docs/01-requerimientos/ | 2 | 18 | 11% | 🔴 Insuficiente |
| docs/02-especificaciones-tecnicas/ | 0 | 15 | 0% | 🔴 Crítico |
| docs/03-desarrollo/ | 0 | 8 | 0% | 🔴 Crítico |
| docs/04-planificacion/ | 0 | 9 | 0% | 🔴 Crítico |

#### Archivos de Definición DDL (Correcto tener _MAP.md)
| Área | Archivos _MAP.md | Cobertura | Evaluación |
|------|------------------|-----------|------------|
| **apps/database/ddl/** | 61 | 85% | 🟢 Ejemplar |
| apps/database/reportes/ | 1 | 100% | 🟢 Perfecto |

#### Código de Desarrollo (Correcto NO tener _MAP.md)
| Área | _MAP.md en src/ | Estado | Evaluación |
|------|-----------------|--------|------------|
| **apps/backend/src/** | 0 | ✅ Sin _MAP.md | 🟢 Correcto |
| **apps/frontend/src/** | 0 | ✅ Sin _MAP.md | 🟢 Correcto |

**Nota:** apps/backend/_MAP.md y apps/frontend/_MAP.md existen pero son de nivel OVERVIEW (descripción general), no profundizan en src/. Esto es correcto.

---

### 2. Calidad de Referencias Bidireccionales

#### Referencias Docs → Apps (Documentación cita implementación)

| Calidad | Documentos | % | Descripción |
|---------|------------|---|-------------|
| ⭐⭐⭐⭐⭐ **Excelente** | 6 | 11% | Trazabilidad completa DDL→Backend→Frontend |
| ⭐⭐⭐ **Básico** | 10 | 18% | Referencias parciales o inconsistentes |
| ❌ **Sin referencias** | 39 | 71% | No citan implementación |

**Total analizado:** 55 documentos en docs/01-requerimientos/ y docs/02-especificaciones-tecnicas/

#### Referencias Apps → Docs (Código cita requerimientos)

| Área | Archivos con referencias | Total archivos | % | Estado |
|------|--------------------------|----------------|---|--------|
| **apps/database/ddl/** | ~10 | ~200 | ~5% | 🔴 Bajo |
| **apps/backend/src/** | 3 | ~450 | <1% | 🔴 Crítico |
| **apps/frontend/src/** | 6 | ~350 | ~2% | 🔴 Muy bajo |

---

## ✅ Fortalezas Identificadas

### 1. Mapeo en Database/DDL - EJEMPLAR 🟢

**Área:** `apps/database/ddl/schemas/`

**Cobertura:** 61 archivos _MAP.md (85%)

**Buenas prácticas:**
- ✅ _MAP.md en cada schema con listado completo de tablas/funciones/triggers
- ✅ Dependencias entre tablas documentadas
- ✅ Referencias cruzadas a ENUMs
- ✅ Números de línea específicos

**Ejemplo de _MAP.md excelente:**
```
apps/database/ddl/schemas/gamification_system/enums/_MAP.md:

### 1. maya_rank (5 valores)
**Usado en:**
- `gamification_system.user_ranks` (columna: `rank`)
- `educational_content.modules` (columna: `min_rank_required`)

**Referencias:**
- Docs: `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md:28-70`
- Backend: `apps/backend/src/shared/constants/enums.constants.ts` (MayaRank)
```

---

### 2. Documentos con Trazabilidad Completa - EJEMPLARES 🟢

**Total:** 6 documentos (11%) establecen el estándar de calidad

**Ejemplos de excelencia:**

#### RF-GAM-001-achievements.md ⭐⭐⭐⭐⭐
Archivo: `docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md`

**Por qué es ejemplar:**
```markdown
### Implementación DDL
🗄️ **ENUMs Canónicos:**
**achievement_type:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:51-54`
- **Tipo:** `gamification_system.achievement_type`
- **Valores:** `badge`, `milestone`, `special`, `rank_promotion`

🗄️ **Tablas:**
1. `gamification_system.achievements` → `apps/database/ddl/schemas/gamification_system/tables/01-achievements.sql`

### Backend
💻 **Implementación:**
- **Service:** `apps/backend/src/modules/gamification/services/achievement.service.ts`
- **Listeners:** `apps/backend/src/modules/gamification/listeners/achievement.listener.ts`

### Frontend
🎨 **Componentes:**
- `apps/frontend/src/components/gamification/AchievementGallery.tsx`
- `apps/frontend/src/components/gamification/AchievementCard.tsx`
```

**Fortalezas:**
- ✅ Paths completos desde raíz (`apps/...`)
- ✅ Números de línea en DDL (`:51-54`)
- ✅ Cobertura 3 capas (DDL → Backend → Frontend)
- ✅ Emojis para identificación visual
- ✅ Propósito de cada componente documentado

#### RF-AUTH-001-roles.md ⭐⭐⭐⭐⭐
Archivo: `docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md`

Similar calidad a RF-GAM-001, con trazabilidad completa DDL→Backend→Frontend.

**Otros documentos excelentes:**
- RF-GAM-002-comodines.md
- RF-AUTH-002-estados-cuenta.md
- RF-AUTH-003-oauth.md
- ET-AUTH-001-rbac.md

---

### 3. Referencias en DDL - BUENAS PERO ESCASAS

**Encontrados:** ~10 archivos SQL con referencias a docs (~5% del total)

**Ejemplo de comentario bien hecho:**
```sql
-- =====================================================================================
-- Table: gamification_system.achievements
-- Description: Catálogo de logros y achievements del sistema de gamificación
-- Version: 2.0 (2025-11-07)
-- Source of Truth: docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md
-- =====================================================================================
```

**Bien hecho:**
- ✅ Usa `-- Source of Truth:` como marcador claro
- ✅ Path completo desde raíz (`docs/...`)
- ✅ Referencia a especificación técnica (no requerimiento)

**Mejorable:**
- ⚠️ Solo ~5% de archivos SQL tienen estas referencias
- ⚠️ No incluye número de línea en docs
- ⚠️ No referencia RF (requerimiento funcional), solo ET (especificación técnica)

---

### 4. Workspace Root - PROFESIONAL 🟢

**Archivo:** `_MAP.md` (raíz)

**Calidad:** Excelente

**Contenido:**
- ✅ Visión completa del monorepo
- ✅ Métricas cuantificables (3,500+ archivos, 2,269 markdown, 96 _MAP.md)
- ✅ Interdependencias documentadas
- ✅ Issues conocidos con prioridades (P0, P1, P2)
- ✅ Próximos pasos claros
- ✅ Scripts NPM documentados
- ✅ Criterios de validación

---

## 🔴 Gaps Críticos Identificados

### GAP #1: Documentación sin Mapeo (P0 - CRÍTICO)

**Problema:**
- docs/ tiene 121 directorios pero solo 2 _MAP.md (**1.6% cobertura**)
- Subcarpetas de requerimientos y especificaciones técnicas sin índice
- Difícil para agentes de IA navegar y encontrar información específica

**Carpetas sin _MAP.md (Alta prioridad):**

```
docs/01-requerimientos/
├── 03-contenido-educativo/        ❌ Sin _MAP.md
├── 04-progreso-seguimiento/       ❌ Sin _MAP.md
├── 05-caracteristicas-sociales/   ❌ Sin _MAP.md
├── 06-notificaciones/             ❌ Sin _MAP.md
├── 07-contenido-media/            ❌ Sin _MAP.md
├── 08-auditoria-configuracion/    ❌ Sin _MAP.md
├── admin-portal/                  ❌ Sin _MAP.md
├── teacher-portal/                ❌ Sin _MAP.md
├── casos-uso/                     ❌ Sin _MAP.md
├── interfaces/                    ❌ Sin _MAP.md
└── modulos/                       ❌ Sin _MAP.md (27 archivos de mecánicas)

docs/02-especificaciones-tecnicas/
├── 01-autenticacion-autorizacion/ ❌ Sin _MAP.md
├── 02-gamificacion/               ❌ Sin _MAP.md
├── 03-contenido-educativo/        ❌ Sin _MAP.md
├── 04-progreso-seguimiento/       ❌ Sin _MAP.md
├── 05-caracteristicas-sociales/   ❌ Sin _MAP.md
├── 06-notificaciones/             ❌ Sin _MAP.md
├── 07-contenido-media/            ❌ Sin _MAP.md
├── 08-auditoria-configuracion/    ❌ Sin _MAP.md
├── adr/                           ❌ Sin _MAP.md
├── apis/                          ❌ Sin _MAP.md
├── arquitectura/                  ❌ Sin _MAP.md
├── frontend/                      ❌ Sin _MAP.md
├── monitoring/                    ❌ Sin _MAP.md
├── seguridad/                     ❌ Sin _MAP.md
├── testing-strategy/              ❌ Sin _MAP.md
└── tipos-compartidos/             ❌ Sin _MAP.md

docs/03-desarrollo/
├── backend/                       ❌ Sin _MAP.md
├── base-de-datos/                 ❌ Sin _MAP.md
├── database/                      ❌ Sin _MAP.md
├── deployment/                    ❌ Sin _MAP.md
├── frontend/                      ❌ Sin _MAP.md
├── integraciones/                 ❌ Sin _MAP.md
└── testing/                       ❌ Sin _MAP.md

docs/04-planificacion/
├── 01-alcance-inicial/            ❌ Sin _MAP.md
├── 02-migracion-robustecimiento/  ❌ Sin _MAP.md
├── 03-extensiones/                ❌ Sin _MAP.md
├── 04-futuras-extensiones/        ❌ Sin _MAP.md
├── correcciones/                  ❌ Sin _MAP.md
├── features/                      ❌ Sin _MAP.md
├── metricas/                      ❌ Sin _MAP.md
├── roadmap/                       ❌ Sin _MAP.md
└── sprints/                       ❌ Sin _MAP.md
```

**Total:** ~40 carpetas críticas sin _MAP.md

**Impacto:**
- 🔴 Agentes de IA no pueden construir mapa mental de documentación
- 🔴 Desarrolladores tardan más en encontrar specs específicas
- 🔴 No hay índice de RFs por módulo
- 🔴 Difícil saber qué está documentado y qué falta

**Esfuerzo de remediación:** 15-20 horas (40 carpetas × 25 min c/u)

---

### GAP #2: Referencias Docs → Apps Insuficientes (P0 - CRÍTICO)

**Problema:**
- Solo 11% de documentos tienen referencias excelentes a implementación
- 71% de documentos NO citan dónde está implementado el requerimiento
- Rompe trazabilidad Requerimiento → Implementación

**Documentos sin referencias a implementación (Alta prioridad):**

**Teacher Portal (6 documentos):**
```
docs/01-requerimientos/teacher-portal/
├── REQ-TEACHER-CLASSROOMS.md       ❌ Lista endpoints, no implementación
├── REQ-TEACHER-ANALYTICS.md        ❌ Sin referencias
├── REQ-TEACHER-ASSIGNMENTS.md      ❌ Sin referencias
├── REQ-TEACHER-GRADING-PROGRESS.md ❌ Sin referencias
└── REQUERIMIENTOS-TEACHER-PORTAL.md ❌ Sin referencias
```

**Admin Portal (5 documentos):**
```
docs/01-requerimientos/admin-portal/
├── REQ-ADMIN-CONTENIDO.md          ❌ Sin referencias
├── REQ-ADMIN-USUARIOS.md           ❌ Sin referencias
├── REQ-ADMIN-ORGANIZACIONES.md     ❌ Sin referencias
├── REQ-ADMIN-SISTEMA.md            ❌ Sin referencias
└── REQUERIMIENTOS-ADMIN-PORTAL.md  ❌ Sin referencias
```

**Mecánicas Educativas (10 documentos):**
```
docs/01-requerimientos/modulos/
├── MODULOS-EDUCATIVOS.md           ❌ 200+ líneas, sin referencias
├── MECANICA-DEBATE-DIGITAL.md      ❌ Menciona types, no componentes
├── MECANICAS-MODULO-3-CRITICA.md   ❌ Sin referencias
├── MECANICAS-MODULO-4-LECTURA-DIGITAL.md ❌ Sin referencias
└── (6 documentos más sin referencias)
```

**Ejemplo de lo que FALTA en MODULOS-EDUCATIVOS.md:**

```markdown
# ❌ ACTUAL (sin referencias)
### Mecánica: linea_tiempo
Tipo: `linea_tiempo`
Descripción: Organizar eventos en orden cronológico

# ✅ DEBE TENER (con referencias)
### Mecánica: linea_tiempo

**Frontend:**
- Componente: `apps/frontend/src/components/mechanics/TimelineMechanic.tsx`
- Hook: `apps/frontend/src/hooks/useMechanicState.ts`
- Types: `apps/frontend/src/types/mechanics.types.ts:LineaTiempoContent`

**Backend:**
- Validator: `apps/backend/src/modules/mechanics/validators/timeline.validator.ts`
- Scoring: `apps/backend/src/modules/mechanics/scoring/timeline-scoring.service.ts`

**Database:**
- Tabla: `educational_content.exercises` (mechanic_type = 'linea_tiempo')
- Schema: `mechanic_config` JSONB con estructura de eventos
```

**Impacto:**
- 🔴 Imposible trazar RF → Implementación
- 🔴 Difícil saber si requerimiento está implementado
- 🔴 Desarrolladores no saben dónde buscar código relacionado
- 🔴 Agentes de IA no pueden validar consistencia entre RF y código

**Esfuerzo de remediación:** 12-15 horas (39 documentos × 20 min c/u)

---

### GAP #3: Referencias Apps → Docs Muy Bajas (P1 - ALTO)

**Problema:**
- Solo ~5% de archivos DDL tienen `-- Source of Truth:` comentarios
- Solo 3 archivos backend tienen referencias a docs (<1%)
- Solo 6 archivos frontend tienen referencias a docs (~2%)

**Archivos que DEBERÍAN tener referencias pero no las tienen:**

**Database DDL:**
```sql
# ❌ ACTUAL (90% de archivos SQL)
-- Table: auth_management.tenants
-- Description: Tenants para soporte multi-tenancy
-- Dependencies: None

# ✅ DEBE TENER
-- Table: auth_management.tenants
-- Description: Tenants para soporte multi-tenancy
-- Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-004-multi-tenancy.md
-- Especificación: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-004-tenants.md
-- Backend Entity: apps/backend/src/modules/auth/entities/tenant.entity.ts
-- Dependencies: None
```

**Backend TypeScript:**
```typescript
// ❌ ACTUAL (99% de archivos)
export class AchievementService {
  async unlockAchievement(userId: string, achievementId: string) {
    // ...
  }
}

// ✅ DEBE TENER
/**
 * Achievement Service
 *
 * Implementa el sistema de logros del módulo de gamificación.
 *
 * @see RF-GAM-001 docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
 * @see ET-GAM-001 docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md
 */
export class AchievementService {
  /**
   * Desbloquea un achievement para un usuario
   *
   * @see RF-GAM-001.3 Validación de condiciones de desbloqueo
   */
  async unlockAchievement(userId: string, achievementId: string) {
    // ...
  }
}
```

**Frontend React:**
```tsx
// ❌ ACTUAL
export const AchievementCard: React.FC<Props> = ({ achievement }) => {
  // ...
};

// ✅ DEBE TENER
/**
 * AchievementCard Component
 *
 * Muestra la tarjeta visual de un achievement individual.
 *
 * @see RF-GAM-001 docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
 * @see Diseño: docs/01-requerimientos/interfaces/WIREFRAMES-GAMIFICATION.md
 */
export const AchievementCard: React.FC<Props> = ({ achievement }) => {
  // ...
};
```

**Impacto:**
- 🔴 Desarrollador no sabe QUÉ requerimiento cumple el código
- 🔴 Al leer código, no hay forma de ir a documentación relevante
- 🔴 Difícil validar si implementación cumple RF
- 🔴 Code review menos efectivo

**Esfuerzo de remediación:**
- SQL: 4-5 horas (50 archivos × 5 min c/u)
- Backend: 6-8 horas (100 archivos críticos × 4 min c/u)
- Frontend: 4-6 horas (80 componentes críticos × 3 min c/u)
- **Total:** 14-19 horas

---

### GAP #4: Referencias Legacy y Paths Absolutos (P2 - MEDIO)

**Problema:**
- Algunos documentos tienen paths absolutos a repos antiguos
- Referencias a `/home/isem/workspace/...` (no portable)

**Ejemplo encontrado:**
```markdown
# ❌ MAL (en RESUMEN-DOCUMENTACION-MECANICAS.md)
- Código fuente: /home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/features/mechanics/

# ✅ BIEN
- Código fuente: `apps/frontend/src/features/mechanics/`
```

**Impacto:**
- 🟡 Referencias rotas (repo antiguo ya no existe)
- 🟡 No portable entre máquinas
- 🟡 Confusión para nuevos desarrolladores

**Esfuerzo de remediación:** 2-3 horas (buscar y reemplazar)

---

## 📐 Patrones de Referencia Recomendados

### Patrón 1: Referencias en _MAP.md (Links Clicables)

**Uso:** Archivos _MAP.md en docs/

**Formato:** Referencias relativas desde archivo actual

```markdown
# En docs/01-requerimientos/02-gamificacion/_MAP.md

### Requerimientos Funcionales
1. [RF-GAM-001: Achievements](./RF-GAM-001-achievements.md)
2. [RF-GAM-002: Comodines](./RF-GAM-002-comodines.md)

### Especificaciones Técnicas
- [ET-GAM-001: Sistema de Achievements](../../02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md)
```

**Ventajas:**
- ✅ Links clicables en GitHub/GitLab
- ✅ Funciona en editores locales
- ✅ No se rompe al mover workspace

**Cuándo usar:** Solo en archivos _MAP.md para navegación entre documentos

---

### Patrón 2: Referencias a Implementación (Docs → Apps)

**Uso:** Documentos RF/ET citando implementación

**Formato:** Paths completos desde raíz del workspace

```markdown
## 🔗 Referencias a Implementación

### Database
🗄️ **ENUMs:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:51-54`
- **Tipo:** `gamification_system.achievement_type`

🗄️ **Tablas:**
- `gamification_system.achievements` → `apps/database/ddl/schemas/gamification_system/tables/01-achievements.sql`

🗄️ **Funciones:**
- `check_and_unlock_achievement()` → `apps/database/ddl/schemas/gamification_system/functions/check_achievement.sql`

### Backend
💻 **Services:**
- `apps/backend/src/modules/gamification/services/achievement.service.ts`

💻 **Controllers:**
- `apps/backend/src/modules/gamification/controllers/achievement.controller.ts`

💻 **DTOs:**
- `apps/backend/src/modules/gamification/dto/unlock-achievement.dto.ts`

### Frontend
🎨 **Componentes:**
- `apps/frontend/src/components/gamification/AchievementGallery.tsx`
- `apps/frontend/src/components/gamification/AchievementCard.tsx`

🎨 **Hooks:**
- `apps/frontend/src/hooks/useAchievements.ts`

🎨 **Types:**
- `apps/frontend/src/types/gamification.types.ts`
```

**Ventajas:**
- ✅ Muy legible
- ✅ Fácil buscar con grep/find
- ✅ Funciona con VSCode "Go to File" (Cmd+P)
- ✅ Paths consistentes

**Cuándo usar:** Documentos RF/ET que describen implementación

---

### Patrón 3: Referencias en Código SQL (Apps → Docs)

**Uso:** Archivos .sql, .pgsql

**Formato:** Comentarios con paths completos

```sql
-- =====================================================================================
-- Table: gamification_system.achievements
-- Description: Catálogo de logros y achievements del sistema
-- Version: 2.0 (2025-11-07)
-- =====================================================================================
-- TRAZABILIDAD
-- Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
-- Especificación: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md
-- Backend Entity: apps/backend/src/modules/gamification/entities/achievement.entity.ts
-- Frontend Type: apps/frontend/src/types/gamification.types.ts
-- =====================================================================================
-- DEPENDENCIES
-- ENUMs:
--   - achievement_type (gamification_system.achievement_type)
--   - achievement_category (gamification_system.achievement_category)
-- Foreign Keys:
--   - created_by → auth.users(id)
-- Indexes:
--   - idx_achievements_type_category
-- =====================================================================================

CREATE TABLE gamification_system.achievements (
  -- ...
);
```

**Ventajas:**
- ✅ Trazabilidad completa en el archivo DDL
- ✅ Desarrollador sabe QUÉ RF implementa
- ✅ Fácil navegar a documentación desde DDL

**Cuándo usar:** Todos los archivos DDL (tablas, funciones, triggers, views)

---

### Patrón 4: Referencias en Código TypeScript (Apps → Docs)

**Uso:** Archivos .ts, .tsx (services, controllers, componentes)

**Formato:** JSDoc comments con @see

```typescript
/**
 * Achievement Service
 *
 * Implementa el sistema de logros del módulo de gamificación.
 * Gestiona el desbloqueo de achievements, validación de condiciones,
 * otorgamiento de recompensas (XP, ML Coins).
 *
 * @see RF-GAM-001 docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
 * @see ET-GAM-001 docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md
 * @module gamification/achievement
 */
export class AchievementService {

  /**
   * Desbloquea un achievement para un usuario
   *
   * Valida condiciones de desbloqueo (progreso, acciones, tiempo),
   * registra en DB, otorga recompensas, emite evento para notificación.
   *
   * @see RF-GAM-001.3 Validación de condiciones
   * @see ET-GAM-001.2 Algoritmo de desbloqueo
   *
   * @param userId - UUID del usuario
   * @param achievementId - UUID del achievement
   * @throws AchievementAlreadyUnlockedException
   * @throws AchievementConditionsNotMetException
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    // ...
  }
}
```

**Ventajas:**
- ✅ JSDoc estándar (IDEs muestran en tooltips)
- ✅ Navegación a docs desde código
- ✅ Code review más informado
- ✅ Validación de cumplimiento de RF

**Cuándo usar:**
- Services (lógica de negocio)
- Controllers (endpoints)
- Componentes React principales
- Validators
- Entities (si modelan concepto de RF)

---

## 🎯 Plan de Acción Recomendado

### Fase 1: Mapeo de Documentación (2 semanas) - P0

**Objetivo:** Cobertura 80% de _MAP.md en docs/

#### Tarea 1.1: Crear _MAP.md en Requerimientos
**Carpetas:** 11 carpetas en docs/01-requerimientos/
**Esfuerzo:** 5-6 horas

**Ubicaciones prioritarias:**
```
docs/01-requerimientos/
├── 03-contenido-educativo/_MAP.md
├── 04-progreso-seguimiento/_MAP.md
├── 05-caracteristicas-sociales/_MAP.md
├── 06-notificaciones/_MAP.md
├── 07-contenido-media/_MAP.md
├── 08-auditoria-configuracion/_MAP.md
├── admin-portal/_MAP.md
├── teacher-portal/_MAP.md
├── casos-uso/_MAP.md
├── interfaces/_MAP.md
└── modulos/_MAP.md
```

**Template:** Ver Anexo A1

#### Tarea 1.2: Crear _MAP.md en Especificaciones Técnicas
**Carpetas:** 16 carpetas en docs/02-especificaciones-tecnicas/
**Esfuerzo:** 6-8 horas

**Ubicaciones prioritarias:**
```
docs/02-especificaciones-tecnicas/
├── 01-autenticacion-autorizacion/_MAP.md
├── 02-gamificacion/_MAP.md
├── 03-contenido-educativo/_MAP.md
├── 04-progreso-seguimiento/_MAP.md
├── 05-caracteristicas-sociales/_MAP.md
├── 06-notificaciones/_MAP.md
├── 07-contenido-media/_MAP.md
├── 08-auditoria-configuracion/_MAP.md
├── adr/_MAP.md
├── apis/_MAP.md
├── arquitectura/_MAP.md
├── frontend/_MAP.md
├── monitoring/_MAP.md
├── seguridad/_MAP.md
├── testing-strategy/_MAP.md
└── tipos-compartidos/_MAP.md
```

#### Tarea 1.3: Crear _MAP.md en Desarrollo
**Carpetas:** 7 carpetas en docs/03-desarrollo/
**Esfuerzo:** 3-4 horas

```
docs/03-desarrollo/
├── backend/_MAP.md
├── base-de-datos/_MAP.md
├── deployment/_MAP.md
├── frontend/_MAP.md
├── integraciones/_MAP.md
└── testing/_MAP.md
```

#### Tarea 1.4: Crear _MAP.md en Planificación
**Carpetas:** 9 carpetas en docs/04-planificacion/
**Esfuerzo:** 3-4 horas

```
docs/04-planificacion/
├── 01-alcance-inicial/_MAP.md
├── 02-migracion-robustecimiento/_MAP.md
├── 03-extensiones/_MAP.md
├── 04-futuras-extensiones/_MAP.md
├── correcciones/_MAP.md
├── features/_MAP.md
├── metricas/_MAP.md
├── roadmap/_MAP.md
└── sprints/_MAP.md
```

**Total Fase 1:** 17-22 horas
**Resultado:** Cobertura docs/ sube de 1.6% a 80%+

---

### Fase 2: Referencias Docs → Apps (2 semanas) - P0

**Objetivo:** 80% de documentos RF/ET con referencias a implementación

#### Tarea 2.1: Actualizar Documentos Teacher Portal
**Archivos:** 6 documentos
**Esfuerzo:** 2-3 horas

**Agregar sección "Referencias a Implementación" en:**
```
- REQ-TEACHER-CLASSROOMS.md
- REQ-TEACHER-ANALYTICS.md
- REQ-TEACHER-ASSIGNMENTS.md
- REQ-TEACHER-GRADING-PROGRESS.md
- REQUERIMIENTOS-TEACHER-PORTAL.md
```

#### Tarea 2.2: Actualizar Documentos Admin Portal
**Archivos:** 5 documentos
**Esfuerzo:** 2-3 horas

```
- REQ-ADMIN-CONTENIDO.md
- REQ-ADMIN-USUARIOS.md
- REQ-ADMIN-ORGANIZACIONES.md
- REQ-ADMIN-SISTEMA.md
- REQUERIMIENTOS-ADMIN-PORTAL.md
```

#### Tarea 2.3: Actualizar Documentos de Mecánicas
**Archivos:** 10 documentos
**Esfuerzo:** 4-5 horas

```
- MODULOS-EDUCATIVOS.md (CRÍTICO - 200+ líneas)
- MECANICA-DEBATE-DIGITAL.md
- MECANICAS-MODULO-3-CRITICA.md
- MECANICAS-MODULO-4-LECTURA-DIGITAL.md
- (6 documentos más)
```

#### Tarea 2.4: Actualizar Especificaciones Técnicas
**Archivos:** 15 documentos
**Esfuerzo:** 5-6 horas

```
- ET-* sin referencias completas
- Specs de APIs
- Documentos de arquitectura
```

**Total Fase 2:** 13-17 horas
**Resultado:** Referencias docs → apps suben de 11% a 80%

---

### Fase 3: Referencias Apps → Docs (3 semanas) - P1

**Objetivo:** 50% de archivos críticos con referencias a docs

#### Tarea 3.1: Agregar Referencias en DDL
**Archivos:** 50 archivos SQL críticos
**Esfuerzo:** 4-5 horas

**Template:**
```sql
-- Requerimiento: docs/01-requerimientos/.../RF-XXX-xxx.md
-- Especificación: docs/02-especificaciones-tecnicas/.../ET-XXX-xxx.md
-- Backend Entity: apps/backend/src/modules/.../entities/xxx.entity.ts
```

**Archivos prioritarios:**
- Tablas principales de cada schema
- Funciones complejas (scoring, validaciones)
- Triggers importantes

#### Tarea 3.2: Agregar JSDoc en Backend
**Archivos:** 100 archivos críticos (services, controllers)
**Esfuerzo:** 6-8 horas

**Template:**
```typescript
/**
 * @see RF-XXX docs/01-requerimientos/.../RF-XXX-xxx.md
 * @see ET-XXX docs/02-especificaciones-tecnicas/.../ET-XXX-xxx.md
 */
```

**Archivos prioritarios:**
- Services de cada módulo
- Controllers principales
- Validators

#### Tarea 3.3: Agregar JSDoc en Frontend
**Archivos:** 80 componentes críticos
**Esfuerzo:** 4-6 horas

**Componentes prioritarios:**
- Componentes de mecánicas
- Componentes de gamificación
- Componentes de portales (teacher, admin)

**Total Fase 3:** 14-19 horas
**Resultado:** Referencias apps → docs suben de ~2% a 50%

---

### Fase 4: Validación y Limpieza (1 semana) - P2

**Objetivo:** Referencias consistentes, sin legacy

#### Tarea 4.1: Limpiar Referencias Legacy
**Esfuerzo:** 2-3 horas

- Buscar paths absolutos `/home/isem/...`
- Reemplazar con paths desde raíz `apps/...`
- Actualizar referencias a repos antiguos

#### Tarea 4.2: Crear Script de Validación
**Esfuerzo:** 4-6 horas

**Script:** `apps/devops/scripts/validate-simco.ts`

**Funcionalidad:**
- Detectar carpetas docs/ sin _MAP.md
- Validar links rotos en _MAP.md
- Verificar que RFs tengan referencias a implementación
- Detectar archivos SQL sin `-- Requerimiento:`

#### Tarea 4.3: Crear Documento Template
**Esfuerzo:** 2-3 horas

**Archivo:** `docs/_TEMPLATES/RF-TEMPLATE.md`

Basado en RF-GAM-001-achievements.md

**Total Fase 4:** 8-12 horas

---

### Resumen de Esfuerzo Total

| Fase | Tareas | Esfuerzo | Resultado |
|------|--------|----------|-----------|
| **Fase 1** | Mapeo docs/ | 17-22h | Cobertura _MAP.md: 1.6% → 80% |
| **Fase 2** | Referencias docs→apps | 13-17h | Referencias: 11% → 80% |
| **Fase 3** | Referencias apps→docs | 14-19h | Referencias: 2% → 50% |
| **Fase 4** | Validación | 8-12h | Limpieza y automatización |
| **TOTAL** | | **52-70h** | **SIMCO Compliant** |

**Distribución sugerida:**
- **Sprint 1 (2 semanas):** Fase 1 (22h)
- **Sprint 2 (2 semanas):** Fase 2 (17h)
- **Sprint 3 (3 semanas):** Fase 3 (19h)
- **Sprint 4 (1 semana):** Fase 4 (12h)

**Total:** 8 semanas de trabajo (~9h/semana)

---

## 📋 Templates Recomendados

### Template A1: _MAP.md para Carpetas de Docs

```markdown
# _MAP: docs/[ruta]/

**Última actualización:** [YYYY-MM-DD]
**Propósito:** [Descripción breve de qué documenta esta carpeta]
**Audiencia:** [Desarrolladores/Product Owners/Tech Leads/etc.]
**Estado:** [Completo/En desarrollo/Planeado]

---

## 📁 Contenido de esta Carpeta

### Requerimientos Funcionales

| ID | Título | Archivo | Estado | Prioridad |
|----|--------|---------|--------|-----------|
| RF-XXX-001 | [Nombre] | [nombre.md](./nombre.md) | ✅ Implementado | Alta |
| RF-XXX-002 | [Nombre] | [nombre.md](./nombre.md) | 🟡 En desarrollo | Media |

### Especificaciones Técnicas

| ID | Título | Archivo | Estado |
|----|--------|---------|--------|
| ET-XXX-001 | [Nombre] | [nombre.md](./nombre.md) | ✅ Completo |

---

## 🔗 Interdependencias

### Módulos Relacionados
- [Módulo Y](../modulo-y/) - Integración con...
- [Módulo Z](../modulo-z/) - Dependencia de...

### Referencias Externas
- [Especificaciones Técnicas](../../02-especificaciones-tecnicas/[modulo]/)
- [Desarrollo](../../03-desarrollo/[area]/)

---

## 📊 Métricas

- **Total documentos:** [N]
- **RFs completos:** [N/Total]
- **ETs completos:** [N/Total]
- **Cobertura implementación:** [XX%]

---

## ⚠️ Issues Conocidos

- [ ] Issue #123: [Descripción]
- [ ] Issue #456: [Descripción]

---

## 🚀 Próximos Pasos

1. [ ] Completar RF-XXX-003
2. [ ] Actualizar ET-XXX-001 con...
3. [ ] Validar implementación de...
```

---

### Template A2: Sección de Referencias en RF/ET

```markdown
## 🔗 Referencias a Implementación

### Especificación Técnica
📐 [ET-XXX-001: Nombre](../../02-especificaciones-tecnicas/[modulo]/ET-XXX-001-nombre.md)

### Database
🗄️ **ENUMs Canónicos:**

**[enum_name]:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:[linea-inicio]-[linea-fin]`
- **Tipo:** `[schema].[enum_name]`
- **Valores:** `valor1`, `valor2`, `valor3`

🗄️ **Tablas:**
1. `[schema].[tabla]` → `apps/database/ddl/schemas/[schema]/tables/[archivo].sql`
   - **Propósito:** [Descripción breve]
   - **Columnas clave:** [lista]

🗄️ **Funciones:**
- `[schema].[funcion()]` → `apps/database/ddl/schemas/[schema]/functions/[archivo].sql`
  - **Propósito:** [Descripción]

🗄️ **Triggers:**
- `[trigger_name]` → Ejecuta cuando [evento]

### Backend
💻 **Controllers:**
- `apps/backend/src/modules/[modulo]/controllers/[nombre].controller.ts`
  - Endpoints: [lista de endpoints]

💻 **Services:**
- `apps/backend/src/modules/[modulo]/services/[nombre].service.ts`
  - **Propósito:** [Lógica de negocio principal]

💻 **DTOs:**
- `apps/backend/src/modules/[modulo]/dto/[nombre].dto.ts`

💻 **Validators:**
- `apps/backend/src/modules/[modulo]/validators/[nombre].validator.ts`

💻 **Enums:**
- `apps/backend/src/shared/enums/[nombre].enum.ts`
- `apps/backend/src/modules/[modulo]/enums/[nombre].enum.ts`

### Frontend
🎨 **Componentes:**
- `apps/frontend/src/components/[categoria]/[Componente].tsx`
  - **Propósito:** [Descripción]

🎨 **Hooks:**
- `apps/frontend/src/hooks/[useNombre].ts`

🎨 **Types:**
- `apps/frontend/src/types/[categoria].types.ts`

🎨 **Services:**
- `apps/frontend/src/services/api/[nombre].service.ts`

🎨 **Stores/Context:**
- `apps/frontend/src/store/[nombre].store.ts`

### Mapeo Completo
📊 [Ver mapeo detallado](../../03-desarrollo/[area]/MAPEO-[NOMBRE].md)

---

## 📚 Documentación Relacionada

- [RF relacionados](../[carpeta]/)
- [Casos de uso](../../casos-uso/[archivo].md)
- [Wireframes](../../interfaces/[archivo].md)
```

---

### Template A3: Comentarios SQL

```sql
-- =====================================================
-- [TYPE]: [schema].[nombre]
-- Description: [Descripción breve]
-- Version: [version]
-- Created: [YYYY-MM-DD]
-- Last Modified: [YYYY-MM-DD]
-- =====================================================
-- TRAZABILIDAD
-- Requerimiento: docs/01-requerimientos/[modulo]/RF-XXX-[nombre].md
-- Especificación: docs/02-especificaciones-tecnicas/[modulo]/ET-XXX-[nombre].md
-- Backend Entity: apps/backend/src/modules/[modulo]/entities/[nombre].entity.ts
-- Frontend Type: apps/frontend/src/types/[categoria].types.ts:[TypeName]
-- =====================================================
-- DEPENDENCIES
-- ENUMs:
--   - [columna] uses [schema].[enum_type]
-- Foreign Keys:
--   - [columna] → [schema].[parent_table]([parent_column])
-- Indexes:
--   - [index_name] on ([columnas])
-- Triggers:
--   - [trigger_name] - [descripción]
-- Used By:
--   - [otra_tabla] (FK: [columna])
-- =====================================================

CREATE TABLE [schema].[tabla] (
  -- Columnas
);

-- =====================================================
-- NOTES
-- [Notas adicionales, consideraciones, TODOs]
-- =====================================================
```

---

### Template A4: JSDoc para Backend/Frontend

```typescript
/**
 * [Nombre del Service/Controller/Componente]
 *
 * [Descripción detallada de propósito y responsabilidades]
 *
 * @see RF-XXX-YYY docs/01-requerimientos/[modulo]/RF-XXX-[nombre].md
 * @see ET-XXX-YYY docs/02-especificaciones-tecnicas/[modulo]/ET-XXX-[nombre].md
 *
 * @module [modulo]/[submodulo]
 * @category [Backend|Frontend]/[categoria]
 * @since [version]
 */
export class [Nombre] {

  /**
   * [Descripción del método]
   *
   * [Explicación detallada de lógica, algoritmo, validaciones]
   *
   * @see RF-XXX.N Sección específica del requerimiento
   * @see ET-XXX.M Algoritmo detallado en especificación
   *
   * @param [param1] - [descripción]
   * @param [param2] - [descripción]
   * @returns [descripción del retorno]
   * @throws {ErrorType} [cuándo se lanza]
   *
   * @example
   * ```typescript
   * const result = await service.metodo(param1, param2);
   * ```
   */
  async metodo(param1: Type1, param2: Type2): Promise<ReturnType> {
    // Implementación
  }
}
```

---

## 📊 Métricas de Éxito

### Objetivo Final (Post-Fase 4)

| Métrica | Actual | Meta | Estado |
|---------|--------|------|--------|
| **Cobertura _MAP.md en docs/** | 1.6% | 80% | 🔴 |
| **Referencias Docs → Apps (Excelentes)** | 11% | 80% | 🔴 |
| **Referencias Apps → Docs (DDL)** | ~5% | 50% | 🔴 |
| **Referencias Apps → Docs (Backend)** | <1% | 50% | 🔴 |
| **Referencias Apps → Docs (Frontend)** | ~2% | 50% | 🔴 |
| **Links rotos en _MAP.md** | ~10% | 0% | 🟡 |
| **Tiempo promedio buscar referencia** | ~3 min | <30 seg | 🔴 |

### KPIs por Fase

**Post-Fase 1:**
- ✅ 40 _MAP.md nuevos en docs/
- ✅ Cobertura docs/ sube a 80%
- ✅ Agentes IA pueden navegar docs/

**Post-Fase 2:**
- ✅ 35+ documentos con referencias excelentes (de 6 a 41+)
- ✅ Trazabilidad RF → Implementación en 80% de docs
- ✅ Desarrolladores saben dónde buscar código

**Post-Fase 3:**
- ✅ 150+ archivos con referencias a docs
- ✅ 50% de archivos críticos con JSDoc/@see
- ✅ Code review más efectivo

**Post-Fase 4:**
- ✅ 0 referencias legacy
- ✅ Script de validación en CI/CD
- ✅ Template oficial para nuevos documentos

---

## 🎓 Conclusiones

### Fortalezas del Sistema Actual

1. ✅ **Database DDL ejemplar:** 61 _MAP.md con 85% cobertura
2. ✅ **6 documentos modelo:** RF-GAM-001, RF-AUTH-001 establecen estándar de calidad
3. ✅ **_MAP.md raíz profesional:** Visión completa del monorepo
4. ✅ **Arquitectura correcta:** Código sin _MAP.md (como debe ser)
5. ✅ **Algunos archivos SQL con referencias:** Patrón `-- Source of Truth:` bien implementado

### Debilidades Críticas

1. 🔴 **Documentación sin mapeo:** Solo 1.6% de docs/ tiene _MAP.md (vs 80% meta)
2. 🔴 **Referencias insuficientes Docs → Apps:** 71% de documentos sin referencias a implementación
3. 🔴 **Referencias muy bajas Apps → Docs:** <2% de código cita requerimientos
4. 🔴 **Trazabilidad rota:** Difícil navegar RF → Implementación → Código

### Causa Raíz

- **No existe estándar documentado** para incluir referencias
- **Documentos antiguos** creados antes de implementar SIMCO
- **6 documentos recientes** (RF-GAM-*, RF-AUTH-*) muestran calidad esperada
- **Falta template oficial** y checklist de calidad

### Prioridad Inmediata

**Fase 1 + Fase 2 (4 semanas):**
1. Crear 40 _MAP.md en docs/ (17-22h)
2. Agregar referencias en 35 documentos RF/ET (13-17h)

**Esfuerzo total:** 30-39 horas
**Impacto:**
- Cobertura _MAP.md: 1.6% → 80%
- Referencias docs→apps: 11% → 80%
- **ROI:** Muy alto (estructura crítica para navegación)

---

## 📎 Anexos

### A1. Script de Validación Rápida

```bash
#!/bin/bash
# apps/devops/scripts/quick-simco-check.sh

echo "=== SIMCO Quick Check ==="
echo

# Cobertura _MAP.md en docs/
TOTAL_DOCS_DIRS=$(find docs/ -type d | wc -l)
DOCS_MAPS=$(find docs/ -name "_MAP.md" -type f | wc -l)
DOCS_COV=$(echo "scale=1; ($DOCS_MAPS / $TOTAL_DOCS_DIRS) * 100" | bc)

echo "📁 Documentación:"
echo "  Total carpetas: $TOTAL_DOCS_DIRS"
echo "  Con _MAP.md: $DOCS_MAPS"
echo "  Cobertura: $DOCS_COV%"
echo

# Cobertura _MAP.md en database/ddl/
TOTAL_DDL_DIRS=$(find apps/database/ddl/ -type d | wc -l)
DDL_MAPS=$(find apps/database/ddl/ -name "_MAP.md" -type f | wc -l)
DDL_COV=$(echo "scale=1; ($DDL_MAPS / $TOTAL_DDL_DIRS) * 100" | bc)

echo "🗄️  Database DDL:"
echo "  Total carpetas: $TOTAL_DDL_DIRS"
echo "  Con _MAP.md: $DDL_MAPS"
echo "  Cobertura: $DDL_COV%"
echo

# Verificar que código NO tenga _MAP.md
BACKEND_SRC_MAPS=$(find apps/backend/src/ -name "_MAP.md" -type f 2>/dev/null | wc -l)
FRONTEND_SRC_MAPS=$(find apps/frontend/src/ -name "_MAP.md" -type f 2>/dev/null | wc -l)

echo "💻 Código de desarrollo:"
echo "  _MAP.md en backend/src/: $BACKEND_SRC_MAPS (debe ser 0)"
echo "  _MAP.md en frontend/src/: $FRONTEND_SRC_MAPS (debe ser 0)"

if [ "$BACKEND_SRC_MAPS" -eq 0 ] && [ "$FRONTEND_SRC_MAPS" -eq 0 ]; then
  echo "  ✅ Correcto (código sin _MAP.md)"
else
  echo "  ❌ ADVERTENCIA: Código tiene _MAP.md (remover)"
fi
echo

# Meta
TARGET_DOCS=80
if (( $(echo "$DOCS_COV >= $TARGET_DOCS" | bc -l) )); then
  echo "✅ docs/ alcanza objetivo ($TARGET_DOCS%)"
else
  MISSING=$(echo "scale=0; ($TOTAL_DOCS_DIRS * $TARGET_DOCS / 100) - $DOCS_MAPS" | bc)
  echo "⚠️  Faltan ~$MISSING _MAP.md en docs/ para alcanzar $TARGET_DOCS%"
fi
```

### A2. Comando para Detectar Docs sin Referencias

```bash
# Encuentra documentos RF/ET sin sección de referencias
grep -L "Referencias a Implementación\|🔗 Referencias" docs/01-requerimientos/**/*.md docs/02-especificaciones-tecnicas/**/*.md
```

### A3. Comando para Detectar SQL sin Trazabilidad

```bash
# Encuentra archivos .sql sin comentario de requerimiento
find apps/database/ddl/schemas/ -name "*.sql" -type f -exec sh -c \
  'grep -L "^-- Requerimiento:\|^-- Source of Truth:" "$1"' _ {} \;
```

### A4. Comando para Detectar Paths Legacy

```bash
# Busca paths absolutos legacy
grep -r "/home/isem/workspace" docs/
grep -r "gamilit-platform-web\|gamilit-platform-backend" docs/
```

---

**Fin del Reporte**

**Próximos pasos:**
1. Revisar y aprobar el plan de acción
2. Asignar responsables para Fase 1
3. Crear primer lote de _MAP.md (docs/01-requerimientos/)
4. Actualizar 6 documentos teacher/admin portal con referencias
5. Validar con script quick-simco-check.sh

**Fecha próxima revisión:** Post-Fase 1 (2 semanas)
