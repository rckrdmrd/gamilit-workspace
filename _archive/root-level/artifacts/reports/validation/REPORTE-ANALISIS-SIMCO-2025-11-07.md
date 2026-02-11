# Reporte de Análisis del Sistema SIMCO - Gamilit

**Fecha:** 2025-11-07
**Versión:** 1.0
**Tipo:** Validación de cumplimiento SIMCO
**Responsable:** Análisis automatizado

---

## 📋 Resumen Ejecutivo

Este reporte evalúa el cumplimiento del workspace Gamilit con los criterios del sistema **SIMCO (Sistema Indexado Modular por Contexto)**, enfocado en:

1. **Modularización**: Archivos de definición organizados en estructura coherente
2. **Mapeo**: Archivos `_MAP.md` que indexan contenido de carpetas
3. **Linkeo**: Referencias bidireccionales entre archivos
4. **Trazabilidad**: Path completo desde raíz del workspace
5. **Navegabilidad**: Búsqueda efectiva de información específica

---

## 🎯 Criterios de Evaluación SIMCO

### Criterios Definidos

1. ✅ **Modularización**: Archivos organizados en carpetas por contexto/dominio
2. ⚠️ **Mapeo**: 80% de carpetas deben tener `_MAP.md` (Actual: ~30%)
3. ⚠️ **Referencias**: Todas las definiciones deben citar referencias con path completo
4. ⚠️ **Path desde raíz**: Referencias deben empezar desde `gamilit/projects/gamilit/` o usar path relativo
5. ✅ **Trazabilidad completa**: Docs → DDL → Backend → Frontend (Parcialmente implementado)

---

## 📊 Métricas Actuales

### Cobertura de _MAP.md

| Nivel | Descripción | Actual | Esperado | Estado |
|-------|-------------|--------|----------|--------|
| **Nivel 0** | Raíz del workspace | 1/1 (100%) | 100% | ✅ Completo |
| **Nivel 1** | Carpetas principales | 4/6 (67%) | 100% | 🟡 Bueno |
| **Nivel 2** | Subcarpetas | ~35% | 80% | 🔴 Insuficiente |
| **Nivel 3+** | Profundidad | ~20% | 80% | 🔴 Crítico |
| **GLOBAL** | Todo el workspace | **~30%** | **80%** | 🔴 **Insuficiente** |

### Distribución de _MAP.md por Área

| Área | Archivos _MAP.md | Cobertura | Evaluación |
|------|------------------|-----------|------------|
| **apps/database/** | 61 | 85% | 🟢 Ejemplar |
| **apps/backend/** | 1 | 5% | 🔴 Crítico |
| **apps/frontend/** | 1 | 5% | 🔴 Crítico |
| **docs/** | 2 | 10% | 🔴 Insuficiente |
| **orchestration/** | 7 | 40% | 🟡 Aceptable |
| **artifacts/** | 4 | 60% | 🟡 Bueno |
| **.claude/** | 6 | 80% | 🟢 Muy bueno |

---

## ✅ Fortalezas Identificadas

### 1. Database Schema Ejemplar

**Área:** `apps/database/ddl/schemas/`

**Buenas Prácticas:**
- 61 archivos `_MAP.md` con cobertura del 85%
- Referencias cruzadas explícitas entre tablas, ENUMs, funciones
- Dependencias documentadas en cada `_MAP.md`
- Números de línea específicos en referencias

**Ejemplo de referencia excelente:**

Archivo: `apps/database/ddl/schemas/gamification_system/enums/_MAP.md:50-51`

```markdown
**Referencias:**
- Docs: `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md:28-70`
- Backend: `apps/backend/src/shared/constants/enums.constants.ts` (MayaRank)
```

**Por qué es ejemplar:**
- Path completo desde raíz (`gamilit/projects/gamilit/`)
- Número de línea específico (`:28-70`)
- Referencias bidireccionales (Docs ↔ DDL ↔ Backend)

---

### 2. Documentación de Requerimientos con Trazabilidad 4 Capas

**Área:** `docs/01-requerimientos/02-gamificacion/`

**Buenas Prácticas:**
- Trazabilidad completa: **Docs → DDL → Backend → Frontend**
- Referencias con paths completos
- Iconos para legibilidad (🗄️ DDL, 💻 Backend, 🎨 Frontend)

**Ejemplo de referencia excelente:**

Archivo: `docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md:24-26`

```markdown
**achievement_type:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:51-54`
- **Tipo:** `gamification_system.achievement_type`
- **Valores:** `badge`, `milestone`, `special`, `rank_promotion`
```

**Trazabilidad completa:**

```
RF-GAM-001-achievements.md (Requerimiento)
    ↓
apps/database/ddl/00-prerequisites.sql:51-54 (DDL)
    ↓
apps/backend/src/modules/gamification/enums/achievement-type.enum.ts (Backend)
    ↓
apps/frontend/src/types/gamification.types.ts (Frontend)
```

---

### 3. _MAP.md Raíz Profesional

**Archivo:** `_MAP.md` (raíz)

**Buenas Prácticas:**
- Visión completa del monorepo
- Métricas cuantificables
- Interdependencias documentadas
- Próximos pasos claros
- Referencias a documentación completa

---

## 🔴 Gaps Críticos Identificados

### 1. Backend sin Mapeo (P0 - Crítico)

**Problema:**
- 13 módulos principales en `apps/backend/src/modules/` **sin `_MAP.md`**
- No hay índice de servicios, controllers, DTOs, entities
- Difícil para agentes de IA navegar el código
- No hay documentación de endpoints

**Módulos afectados:**
```
apps/backend/src/modules/
├── auth/                 ❌ Sin _MAP.md
├── gamification/         ❌ Sin _MAP.md
├── progress/             ❌ Sin _MAP.md
├── educational/          ❌ Sin _MAP.md
├── social/               ❌ Sin _MAP.md
├── content/              ❌ Sin _MAP.md
├── admin/                ❌ Sin _MAP.md
├── teacher/              ❌ Sin _MAP.md
├── notifications/        ❌ Sin _MAP.md
├── missions/             ❌ Sin _MAP.md
├── powerups/             ❌ Sin _MAP.md
├── audit/                ❌ Sin _MAP.md
└── websocket/            ❌ Sin _MAP.md
```

**Impacto:**
- Agentes de IA no pueden mapear estructura de módulos
- Desarrolladores nuevos tardan más en orientarse
- Difícil encontrar qué endpoints expone cada módulo
- No hay trazabilidad Backend → Frontend

**Esfuerzo de remediación:** 10-12 horas (13 archivos × 45 min c/u)

---

### 2. Frontend sin Mapeo (P0 - Crítico)

**Problema:**
- Features principales (student, teacher, admin) sin `_MAP.md`
- 180+ componentes sin índice
- No hay mapeo de componentes por portal
- No hay referencias a endpoints backend consumidos

**Áreas afectadas:**
```
apps/frontend/src/
├── features/
│   ├── student/          ❌ Sin _MAP.md
│   ├── teacher/          ❌ Sin _MAP.md
│   └── admin/            ❌ Sin _MAP.md
├── shared/components/    ❌ Sin _MAP.md (180+ componentes)
└── services/             ❌ Sin _MAP.md
```

**Impacto:**
- Difícil saber qué componentes existen
- No hay trazabilidad Frontend → Backend
- Agentes de IA no pueden mapear estructura de portales

**Esfuerzo de remediación:** 6-8 horas

---

### 3. Documentación sin Mapeo Completo (P1 - Alto)

**Problema:**
- Subcarpetas en `docs/01-requerimientos/` sin `_MAP.md`
- Subcarpetas en `docs/02-especificaciones-tecnicas/` sin `_MAP.md`
- Difícil encontrar specs específicas

**Áreas afectadas:**
```
docs/01-requerimientos/
├── 03-contenido-educativo/        ❌ Sin _MAP.md
├── 04-progreso-seguimiento/       ❌ Sin _MAP.md
├── 05-caracteristicas-sociales/   ❌ Sin _MAP.md
├── 06-notificaciones/             ❌ Sin _MAP.md
├── 07-contenido-media/            ❌ Sin _MAP.md
└── 08-auditoria-configuracion/    ❌ Sin _MAP.md
```

**Impacto:**
- Búsqueda de requerimientos específicos toma más tiempo
- No hay índice rápido de RFs por módulo

**Esfuerzo de remediación:** 8-10 horas

---

### 4. Referencias Inconsistentes (P1 - Alto)

**Problema 4.1: Paths Legacy Absolutos**

**Encontrado en:** `docs/01-requerimientos/modulos/RESUMEN-DOCUMENTACION-MECANICAS.md`

```markdown
❌ MAL:
- Código fuente: `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/features/mechanics/`

✅ BIEN:
- Código fuente: `apps/frontend/src/features/mechanics/`
```

**Impacto:**
- Referencias rotas (repo antiguo ya no existe)
- No portable entre máquinas

---

**Problema 4.2: Referencias Vagas**

**Encontrado en:** Varios `_MAP.md`

```markdown
❌ MAL:
**Backend:** Consume DDL de database/
**Frontend:** Usa API endpoints

✅ BIEN:
**Backend:**
- Consume: `apps/database/ddl/schemas/auth_management/tables/`
- Constants: `apps/backend/src/shared/constants/database.constants.ts`

**Frontend:**
- API Client: `apps/frontend/src/services/api/auth.service.ts:45`
- Types: `apps/frontend/src/types/auth.types.ts`
```

---

**Problema 4.3: SQL sin Referencias a Docs**

**Encontrado en:** ~90% de archivos `.sql`

```sql
❌ MAL:
-- Table: auth_management.tenants
-- Description: Tenants para soporte multi-tenancy
-- Dependencies: None

✅ BIEN:
-- Table: auth_management.tenants
-- Description: Tenants para soporte multi-tenancy
-- Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-004-multi-tenancy.md
-- Especificación: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-004-tenants.md
-- Backend Entity: apps/backend/src/modules/auth/entities/tenant.entity.ts
-- Dependencies: None
```

**Impacto:**
- Difícil trazar de DDL → Docs
- No se sabe qué requerimiento justifica la tabla

**Esfuerzo de remediación:** 4-5 horas (50 archivos principales)

---

### 5. Gap Backend ↔ Frontend (P1 - Alto)

**Problema:**
- No hay mapeo de qué componentes frontend usan qué endpoints backend
- No hay documentación de tipos compartidos
- Solo script `sync-enums.ts` hace sincronización automática

**Necesidad:**

Crear documento maestro de trazabilidad:

```markdown
# docs/03-desarrollo/TRAZABILIDAD-FRONTEND-BACKEND.md

## Módulo: Autenticación

| Endpoint | Backend Controller | Frontend Service | Frontend Component |
|----------|-------------------|------------------|-------------------|
| POST /api/v1/auth/login | auth.controller.ts:45 | auth.service.ts:25 | LoginForm.tsx:120 |
| GET /api/v1/auth/me | auth.controller.ts:80 | auth.service.ts:50 | UserProfile.tsx:45 |

## Types Sincronizados

| Backend DTO | Frontend Type | Sync Status |
|-------------|---------------|-------------|
| LoginDto | LoginRequest | ✅ Sync |
| UserDto | User | ✅ Sync |
```

**Esfuerzo:** 6-8 horas

---

## 📐 Patrones de Referencia Identificados

### Patrón 1: Referencias Relativas desde Archivo Actual ✅

**Usado en:** `_MAP.md` de nivel 1 y 2

```markdown
# En apps/_MAP.md
[Documentación](../../docs/03-desarrollo/backend/)

# En docs/01-requerimientos/02-gamificacion/_MAP.md
[ET-AUTH-001](../../02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md)
```

**Ventajas:**
- Links clicables en Markdown
- Funciona en GitHub/GitLab
- No se rompe al mover workspace

**Desventajas:**
- Complejo calcular niveles `../`
- Menos legible para humanos

**Recomendación:** ✅ **Usar para `_MAP.md` (links clicables)**

---

### Patrón 2: Paths desde Raíz del Workspace ✅

**Usado en:** Archivos de documentación detallada

```markdown
- DDL: `apps/database/ddl/00-prerequisites.sql:30-32`
- Backend: `apps/backend/src/shared/enums/gamilit-role.enum.ts`
- Frontend: `apps/frontend/src/types/auth.types.ts`
```

**Ventajas:**
- Muy legible
- Fácil buscar con grep/find
- Consistente
- Funciona con VSCode "Go to File"

**Desventajas:**
- No son links clicables en Markdown
- Asume raíz en `gamilit/`

**Recomendación:** ✅ **Usar para documentación detallada (trazabilidad completa)**

---

### Patrón 3: Paths Absolutos con `/home/...` ❌

**Encontrado en:** Archivos legacy

```markdown
❌ NO USAR:
/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/...
```

**Problemas:**
- Path absoluto específico de máquina
- NO portable
- Referencias a repos antiguos

**Recomendación:** ❌ **Remover y reemplazar con Patrón 2**

---

## 🎯 Plan de Acción Recomendado

### Fase 1: Fundamentos (1 semana) - P0

**Objetivo:** Cobertura básica en apps principales (50%)

#### Tarea 1.1: Crear _MAP.md en Módulos Backend
**Archivos:** 13 `_MAP.md` en `apps/backend/src/modules/`
**Esfuerzo:** 10-12 horas
**Template:** Ver sección "Templates Recomendados"

**Módulos:**
- auth, gamification, progress, educational, social, content
- admin, teacher, notifications, missions, powerups
- audit, websocket

#### Tarea 1.2: Crear _MAP.md en Features Frontend
**Archivos:** 4 `_MAP.md` en `apps/frontend/src/`
**Esfuerzo:** 4-5 horas

**Ubicaciones:**
- `features/student/_MAP.md`
- `features/teacher/_MAP.md`
- `features/admin/_MAP.md`
- `shared/components/_MAP.md`

#### Tarea 1.3: Agregar Referencias en SQL
**Archivos:** 50 archivos `.sql` principales
**Esfuerzo:** 4-5 horas

**Template:**
```sql
-- Requerimiento: docs/01-requerimientos/.../RF-XXX-xxx.md
-- Especificación: docs/02-especificaciones-tecnicas/.../ET-XXX-xxx.md
-- Backend Entity: apps/backend/src/modules/.../entities/xxx.entity.ts
```

#### Tarea 1.4: Limpiar Referencias Legacy
**Archivos:** ~15 archivos `.md` con paths absolutos
**Esfuerzo:** 2-3 horas

**Buscar y reemplazar:**
```bash
# Buscar paths legacy
grep -r "/home/isem/workspace" docs/

# Reemplazar con paths desde raíz
sed -i 's|/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/||g' archivo.md
```

**Total Fase 1:** 20-25 horas
**Resultado:** Cobertura sube de 30% a 50%

---

### Fase 2: Profundidad (2 semanas) - P1

**Objetivo:** Cobertura 60-70% SIMCO

#### Tarea 2.1: _MAP.md Nivel 3 en Backend
**Archivos:** 30+ `_MAP.md`
**Esfuerzo:** 8-10 horas

**Ubicaciones:**
- `modules/*/services/_MAP.md`
- `modules/*/entities/_MAP.md`
- `modules/*/dto/_MAP.md`

#### Tarea 2.2: _MAP.md en Docs
**Archivos:** 20+ `_MAP.md`
**Esfuerzo:** 6-8 horas

**Ubicaciones:**
- Subcarpetas de `docs/01-requerimientos/`
- Subcarpetas de `docs/02-especificaciones-tecnicas/`

#### Tarea 2.3: Documento Maestro de Trazabilidad
**Archivo:** `docs/03-desarrollo/TRAZABILIDAD-FRONTEND-BACKEND.md`
**Esfuerzo:** 6-8 horas

**Contenido:**
- Mapeo de endpoints Backend → Frontend
- Types sincronizados
- Componentes por endpoint

#### Tarea 2.4: Script de Validación SIMCO
**Archivo:** `apps/devops/scripts/validate-simco.ts`
**Esfuerzo:** 4-6 horas

**Funcionalidad:**
- Detectar carpetas sin `_MAP.md`
- Validar links rotos
- Verificar referencias inconsistentes

**Total Fase 2:** 24-32 horas
**Resultado:** Cobertura sube de 50% a 70%

---

### Fase 3: Excelencia (1 mes) - P2

**Objetivo:** Cobertura 80%+ SIMCO + Automatización

#### Tarea 3.1: _MAP.md en Tests
#### Tarea 3.2: Referencias Bidireccionales Completas
#### Tarea 3.3: CI/CD Validation
#### Tarea 3.4: Dashboard de Cobertura SIMCO

**Total Fase 3:** 15-20 horas
**Resultado:** Cobertura sube de 70% a 80%+

---

## 📋 Templates Recomendados

### Template 1: _MAP.md para Módulos Backend

```markdown
# _MAP: apps/backend/src/modules/[nombre]/

**Última actualización:** [YYYY-MM-DD]
**Propósito:** [Descripción breve del módulo]
**Responsable:** @backend-team
**Estado:** [Activo/En desarrollo]

---

## 📁 Estructura

```
[nombre]/
├── services/           # Lógica de negocio
├── controllers/        # API endpoints
├── entities/           # TypeORM entities
├── dto/                # Data Transfer Objects
├── guards/             # Guards de autorización
├── listeners/          # Event listeners
└── __tests__/          # Unit & integration tests
```

---

## 🔌 Endpoints

### GET /api/v1/[module]/[resource]
**Controller:** `controllers/[name].controller.ts:45`
**Service:** `services/[name].service.ts:120`
**Frontend:** `apps/frontend/src/services/api/[module].service.ts:25`
**Tests:** `__tests__/[name].controller.spec.ts:80`

### POST /api/v1/[module]/[resource]
[...]

---

## 🗄️ Dependencias Database

**Schema:** `apps/database/ddl/schemas/[schema]/`

**Tablas utilizadas:**
- `[schema].[table1]` → Entity: `entities/[name].entity.ts`
- `[schema].[table2]` → Entity: `entities/[name].entity.ts`

**ENUMs utilizados:**
- `[schema].[enum_type]` → `../../shared/enums/[name].enum.ts`

---

## 🔗 Interdependencias

**Consume de otros módulos:**
- `../auth/services/auth.service.ts` - Validación de tokens
- `../audit/services/audit.service.ts` - Logging de acciones

**Consumido por:**
- `../admin/` - Panel de administración
- Frontend: `apps/frontend/src/features/[portal]/`

---

## 📚 Documentación

**Requerimientos:**
- [RF-XXX-nombre](../../../docs/01-requerimientos/[modulo]/RF-XXX-nombre.md)

**Especificaciones técnicas:**
- [ET-XXX-nombre](../../../docs/02-especificaciones-tecnicas/[modulo]/ET-XXX-nombre.md)

**Guías de desarrollo:**
- [Guía del módulo](../../../docs/03-desarrollo/backend/MODULO-[NOMBRE].md)

---

## ✅ Testing

**Coverage:** [XX%]
**Tests:** `__tests__/`

**Archivos de test:**
- `[name].controller.spec.ts` - Tests de endpoints
- `[name].service.spec.ts` - Tests de lógica de negocio
- `[name].integration.spec.ts` - Tests de integración

---

## ⚠️ Issues Conocidos

- [ ] Issue #123: [Descripción]
- [ ] Issue #456: [Descripción]
```

---

### Template 2: Comentarios en Archivos SQL

```sql
-- =====================================================
-- Table: [schema].[table]
-- Description: [Descripción breve]
-- Version: [version]
-- =====================================================
-- TRAZABILIDAD
-- Requerimiento: docs/01-requerimientos/[modulo]/RF-XXX-[nombre].md
-- Especificación: docs/02-especificaciones-tecnicas/[modulo]/ET-XXX-[nombre].md
-- Backend Entity: apps/backend/src/modules/[modulo]/entities/[nombre].entity.ts
-- Frontend Type: apps/frontend/src/types/[modulo].types.ts
-- =====================================================
-- DEPENDENCIES
-- Foreign Keys:
--   - [column] → [schema].[parent_table]([parent_column])
-- ENUMs:
--   - [column] uses [schema].[enum_type]
-- Indexes:
--   - idx_[name] on ([columns])
-- =====================================================

CREATE TABLE [schema].[table] (
  -- Columnas
);
```

---

## 📊 Métricas de Éxito

### Cobertura SIMCO

| Fase | Nivel 1 | Nivel 2 | Nivel 3+ | Global | Fecha Objetivo |
|------|---------|---------|----------|--------|----------------|
| **Actual** | 67% | 35% | 20% | **30%** | - |
| **Fase 1** | 100% | 50% | 25% | **50%** | +1 semana |
| **Fase 2** | 100% | 80% | 50% | **70%** | +2 semanas |
| **Fase 3** | 100% | 90% | 70% | **80%** | +1 mes |

---

### Calidad de Referencias

| Métrica | Actual | Meta Fase 1 | Meta Final |
|---------|--------|-------------|------------|
| % archivos .sql con referencias a docs | 10% | 50% | 80% |
| % módulos backend con _MAP.md | 0% | 100% | 100% |
| % links válidos en _MAP.md | ~90% | 95% | 100% |
| Tiempo promedio buscar referencia | ~3 min | ~1 min | ~30 seg |

---

## 🎓 Conclusiones

### Fortalezas del Sistema SIMCO Actual

1. ✅ **Database ejemplar:** 61 `_MAP.md` con dependencias explícitas (85% cobertura)
2. ✅ **Documentación de requerimientos:** Trazabilidad 4 capas (Docs → DDL → Backend → Frontend)
3. ✅ **_MAP.md raíz:** Profesional y completo
4. ✅ **Patrones mayormente consistentes:** Referencias desde raíz en docs

### Debilidades Críticas (P0)

1. 🔴 **Backend sin mapeo:** 13 módulos principales sin `_MAP.md`
2. 🔴 **Frontend sin mapeo:** Features y componentes sin estructura
3. 🔴 **Referencias legacy:** Paths absolutos a repos antiguos
4. 🔴 **Gap Backend ↔ Frontend:** Sin trazabilidad de endpoints

### Prioridad Inmediata

**Crear 17 _MAP.md críticos:**
- 13 en `apps/backend/src/modules/`
- 4 en `apps/frontend/src/`

**Esfuerzo:** 14-17 horas
**Impacto:** Cobertura sube de 30% a 50%
**ROI:** Alto (estructura crítica para agentes de IA y desarrolladores)

---

## 📎 Anexos

### A1. Lista Completa de Carpetas sin _MAP.md (P0)

```
apps/backend/src/modules/auth/
apps/backend/src/modules/gamification/
apps/backend/src/modules/progress/
apps/backend/src/modules/educational/
apps/backend/src/modules/social/
apps/backend/src/modules/content/
apps/backend/src/modules/admin/
apps/backend/src/modules/teacher/
apps/backend/src/modules/notifications/
apps/backend/src/modules/missions/
apps/backend/src/modules/powerups/
apps/backend/src/modules/audit/
apps/backend/src/modules/websocket/
apps/frontend/src/features/student/
apps/frontend/src/features/teacher/
apps/frontend/src/features/admin/
apps/frontend/src/shared/components/
```

### A2. Comando para Detectar Carpetas sin _MAP.md

```bash
# Encuentra carpetas sin _MAP.md en apps/
find apps/ -type d ! -path "*/node_modules/*" -exec sh -c \
  'test ! -f "$1/_MAP.md" && echo "$1"' _ {} \;
```

### A3. Script de Validación Rápida

```bash
#!/bin/bash
# apps/devops/scripts/quick-simco-check.sh

echo "=== SIMCO Quick Check ==="
echo

# Count total directories
TOTAL_DIRS=$(find . -type d ! -path "*/node_modules/*" ! -path "*/.git/*" | wc -l)

# Count directories with _MAP.md
MAP_DIRS=$(find . -name "_MAP.md" -type f | wc -l)

# Calculate coverage
COVERAGE=$(echo "scale=2; ($MAP_DIRS / $TOTAL_DIRS) * 100" | bc)

echo "Total directorios: $TOTAL_DIRS"
echo "Directorios con _MAP.md: $MAP_DIRS"
echo "Cobertura: $COVERAGE%"
echo

# Target
TARGET=80
if (( $(echo "$COVERAGE >= $TARGET" | bc -l) )); then
  echo "✅ Objetivo alcanzado ($TARGET%)"
else
  MISSING=$(echo "scale=0; ($TOTAL_DIRS * $TARGET / 100) - $MAP_DIRS" | bc)
  echo "⚠️ Faltan ~$MISSING _MAP.md para alcanzar $TARGET%"
fi
```

---

**Fin del Reporte**

**Próximos pasos:**
1. Revisar y aprobar el plan de acción
2. Asignar responsables para Fase 1
3. Ejecutar tareas 1.1 a 1.4
4. Validar cobertura post-Fase 1
