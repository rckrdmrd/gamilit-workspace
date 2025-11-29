# PLAN DE CORRECCIONES - PROYECTO GAMILIT

**Fecha:** 2025-11-29
**Analista:** Architecture-Analyst
**Basado en:** REPORTE-ANALISIS-PROFUNDO-2025-11-29.md
**Version:** 1.0.0
**Estado:** FASE 4 EN PROGRESO - EJECUCION PARCIAL

---

## RESUMEN DEL PLAN

Este documento define el plan de correcciones basado en el analisis profundo del proyecto GAMILIT. Las tareas estan priorizadas por impacto y urgencia, con asignacion de agentes especializados.

### Metricas del Plan

| Prioridad | Tareas | Esfuerzo Est. | Impacto |
|-----------|--------|---------------|---------|
| **P0 - Critico** | 2 | 4 horas | Funcionalidad core |
| **P1 - Alto** | 4 | 16 horas | Sincronizacion |
| **P2 - Medio** | 3 | 8 horas | Mantenibilidad |
| **P3 - Bajo** | 2 | 4 horas | Limpieza |
| **TOTAL** | 11 | 32 horas | Coherencia 100% |

---

## PRIORIDAD P0 - CRITICO (Ejecucion Inmediata)

### TAREA P0-001: Corregir Inconsistencia Formula XP/Nivel

**Problema Detectado:**
La formula de calculo de nivel difiere entre Database y Backend:
- **DB (SQL):** `FLOOR(SQRT(p_xp / 100.0)) + 1` (cuadratica)
- **Backend (TS):** `Math.floor(100 * Math.pow(1.1, level - 1))` (exponencial)

**Impacto:** Mismo XP produce diferentes niveles segun donde se calcule.

**Objetivo:** Unificar formula usando el patron DB como fuente de verdad (ADR-016).

| Campo | Valor |
|-------|-------|
| **ID** | P0-001 |
| **Tipo** | Sincronizacion Logica |
| **Objetos Afectados** | Backend: user-stats.service.ts |
| **Dependencias** | Ninguna |
| **Agente Asignado** | backend-agent |
| **Prompt a Usar** | PROMPT-BACKEND-AGENT.md |
| **Esfuerzo Estimado** | 2 horas |
| **Criterio Aceptacion** | Formula en backend coincide con DB |

**Subtareas:**
1. Localizar calculo de nivel en user-stats.service.ts
2. Reemplazar formula exponencial por cuadratica
3. Verificar que tests de gamification pasen
4. Documentar cambio en ADR-016

---

### TAREA P0-002: Validar Seeds Criticos Existentes

**Problema Detectado:**
El reporte menciono seeds faltantes, pero verificacion muestra que existen en create-database.sh:
- `social_features/01-schools.sql` (linea 525)
- `social_features/02-classrooms.sql` (linea 526)
- `social_features/03-classroom-members.sql` (linea 527)
- `progress_tracking/01-module_progress.sql` (linea 548)

**Objetivo:** Verificar que los seeds cargan correctamente y crean datos validos.

| Campo | Valor |
|-------|-------|
| **ID** | P0-002 |
| **Tipo** | Validacion Database |
| **Objetos Afectados** | Seeds: social_features, progress_tracking |
| **Dependencias** | Base de datos recreada |
| **Agente Asignado** | database-agent |
| **Prompt a Usar** | PROMPT-DATABASE-AGENT.md |
| **Esfuerzo Estimado** | 1 hora |
| **Criterio Aceptacion** | Queries de validacion retornan datos esperados |

**Subtareas:**
1. Ejecutar queries de validacion post-recreacion
2. Verificar FK integrity entre profiles -> schools
3. Verificar classroom_members tiene relaciones validas
4. Confirmar module_progress inicializado para usuarios demo

---

## PRIORIDAD P1 - ALTO (Esta Semana)

### TAREA P1-001: Crear Entities Backend para Tablas Faltantes

**Problema Detectado:**
10 tablas DDL no tienen entity correspondiente en backend.

**Objetivo:** Crear entities TypeORM para tablas que se usan activamente.

| Campo | Valor |
|-------|-------|
| **ID** | P1-001 |
| **Tipo** | Desarrollo Backend |
| **Objetos Afectados** | Ver lista de tablas abajo |
| **Dependencias** | P0-002 completada |
| **Agente Asignado** | backend-agent |
| **Prompt a Usar** | PROMPT-BACKEND-AGENT.md |
| **Esfuerzo Estimado** | 6 horas |
| **Criterio Aceptacion** | Entities creadas y TypeORM las reconoce |

**Tablas a procesar (priorizadas):**

| Tabla | Schema | Prioridad | Razon |
|-------|--------|-----------|-------|
| `maya_ranks` | gamification_system | Alta | Tabla de configuracion activa |
| `comodin_usage_log` | gamification_system | Alta | Auditoría uso comodines |
| `difficulty_criteria` | educational_content | Media | Parametros de dificultad |
| `content_metadata` | educational_content | Baja | Metadata opcional |
| `module_dependencies` | educational_content | Baja | Prerrequisitos |
| `taxonomies` | educational_content | Baja | Clasificacion |
| `content_tags` | educational_content | Baja | Etiquetado |

**Excluir (FUTURE):**
- `parent_accounts` (EXT-010 - Portal Padres)
- `parent_student_links` (EXT-010)
- `parent_notifications` (EXT-010)

**Subtareas:**
1. Crear entity `maya-rank.entity.ts` en gamification/entities
2. Crear entity `comodin-usage-log.entity.ts` en gamification/entities
3. Crear entity `difficulty-criteria.entity.ts` en educational/entities
4. Registrar entities en modulos correspondientes
5. Verificar sincronizacion con `npm run typeorm:schema:log`

---

### TAREA P1-002: Implementar Componentes Student Portal para Assignments

**Problema Detectado:**
El portal Student no tiene componentes para:
- Ver tareas asignadas por el teacher
- Ver calificaciones y feedback de submissions

**Objetivo:** Crear componentes faltantes para flujo Student-Teacher.

| Campo | Valor |
|-------|-------|
| **ID** | P1-002 |
| **Tipo** | Desarrollo Frontend |
| **Objetos Afectados** | apps/frontend/src/features/student/ |
| **Dependencias** | Endpoints de assignments existen |
| **Agente Asignado** | frontend-agent |
| **Prompt a Usar** | PROMPT-FRONTEND-AGENT.md |
| **Esfuerzo Estimado** | 6 horas |
| **Criterio Aceptacion** | Student puede ver assignments y feedback |

**Subtareas:**
1. Crear pagina `MyAssignmentsPage.tsx` en student portal
2. Crear componente `AssignmentCard.tsx` con estado y deadline
3. Crear componente `AssignmentDetail.tsx` con ejercicios
4. Crear componente `GradeFeedback.tsx` para ver calificaciones
5. Agregar rutas al router del portal student
6. Integrar con assignmentsStore existente

---

### TAREA P1-003: Implementar Endpoints Admin Faltantes

**Problema Detectado:**
30 endpoints admin estan pendientes de implementacion.

**Objetivo:** Implementar endpoints criticos para el portal admin.

| Campo | Valor |
|-------|-------|
| **ID** | P1-003 |
| **Tipo** | Desarrollo Backend |
| **Objetos Afectados** | modules/admin/controllers, services |
| **Dependencias** | P1-001 completada |
| **Agente Asignado** | backend-agent |
| **Prompt a Usar** | PROMPT-BACKEND-AGENT.md |
| **Esfuerzo Estimado** | 8 horas (parcial) |
| **Criterio Aceptacion** | Endpoints documentados en Swagger |

**Endpoints prioritarios:**
1. Analytics: /admin/analytics/engagement
2. Analytics: /admin/analytics/retention
3. Monitoring: /admin/system/health/detailed
4. Monitoring: /admin/system/metrics/history
5. Content: /admin/content/approval/pending
6. Content: /admin/content/versions

**Subtareas:**
1. Implementar admin-analytics.controller.ts
2. Implementar admin-analytics.service.ts
3. Agregar DTOs para respuestas analytics
4. Documentar con decoradores Swagger

---

### TAREA P1-004: Activar Relaciones TypeORM Comentadas

**Problema Detectado:**
60% de las relaciones entre entities estan comentadas.

**Objetivo:** Descomentar relaciones de forma incremental para entities estables.

| Campo | Valor |
|-------|-------|
| **ID** | P1-004 |
| **Tipo** | Refactoring Backend |
| **Objetos Afectados** | Todas las entities con relaciones comentadas |
| **Dependencias** | P1-001 completada |
| **Agente Asignado** | backend-agent |
| **Prompt a Usar** | PROMPT-BACKEND-AGENT.md |
| **Esfuerzo Estimado** | 4 horas |
| **Criterio Aceptacion** | TypeORM valida schema sin errores |

**Estrategia incremental:**
1. Identificar entities con relaciones ya estables (User, Profile, Tenant)
2. Descomentar relaciones OneToMany y ManyToOne
3. Ejecutar validacion TypeORM
4. Si falla, analizar y ajustar
5. Repetir para siguiente grupo

**Grupos de activacion:**
- Grupo 1: auth_management (User, Profile, UserRole)
- Grupo 2: gamification_system (UserStats, UserRank, Achievement)
- Grupo 3: progress_tracking (ModuleProgress, ExerciseSubmission)

---

## PRIORIDAD P2 - MEDIO (Proxima Semana)

### TAREA P2-001: Consolidar Types Duplicados Frontend

**Problema Detectado:**
Tipos duplicados en multiples ubicaciones:
- Achievement: 7+ definiciones
- UserStats: 3 definiciones
- UserRank: 3 definiciones

**Objetivo:** Centralizar types en shared/types y re-exportar.

| Campo | Valor |
|-------|-------|
| **ID** | P2-001 |
| **Tipo** | Refactoring Frontend |
| **Objetos Afectados** | shared/types, features/*/types |
| **Dependencias** | Ninguna |
| **Agente Asignado** | frontend-agent |
| **Prompt a Usar** | PROMPT-FRONTEND-AGENT.md |
| **Esfuerzo Estimado** | 3 horas |
| **Criterio Aceptacion** | Un solo export por tipo |

**Subtareas:**
1. Crear archivo `shared/types/gamification.types.ts` consolidado
2. Mover Achievement, UserStats, UserRank a shared
3. Actualizar imports en features/gamification
4. Eliminar definiciones duplicadas
5. Verificar que TypeScript compile sin errores

---

### TAREA P2-002: Documentar Patrones de Diseno

**Problema Detectado:**
Patrones identificados no estan documentados formalmente.

**Objetivo:** Crear ADRs para patrones de diseno identificados.

| Campo | Valor |
|-------|-------|
| **ID** | P2-002 |
| **Tipo** | Documentacion |
| **Objetos Afectados** | docs/decisions/ |
| **Dependencias** | Ninguna |
| **Agente Asignado** | architecture-analyst (yo) |
| **Prompt a Usar** | N/A (directa) |
| **Esfuerzo Estimado** | 2 horas |
| **Criterio Aceptacion** | ADRs creados y en docs/ |

**ADRs a crear:**
1. ADR-020: Multi-tenancy Pattern (tenant_id en tablas)
2. ADR-021: Audit Fields Pattern (created_at, updated_at, etc.)
3. ADR-022: JSONB Flexible Fields (config, content, metadata)
4. ADR-023: Feature-Based Frontend Organization

---

### TAREA P2-003: Actualizar Inventarios

**Problema Detectado:**
Inventarios desactualizados o incompletos:
- MASTER_INVENTORY.yml parcial
- 6 inventarios detallados faltantes

**Objetivo:** Actualizar inventarios principales.

| Campo | Valor |
|-------|-------|
| **ID** | P2-003 |
| **Tipo** | Documentacion |
| **Objetos Afectados** | orchestration/inventarios/ |
| **Dependencias** | P1-001, P1-002 completadas |
| **Agente Asignado** | workspace-manager |
| **Prompt a Usar** | PROMPT-WORKSPACE-MANAGER.md |
| **Esfuerzo Estimado** | 3 horas |
| **Criterio Aceptacion** | Inventarios reflejan estado actual |

**Subtareas:**
1. Actualizar DATABASE_INVENTORY.yml a v3.0.0
2. Actualizar BACKEND_INVENTORY.yml a v2.5.0
3. Actualizar FRONTEND_INVENTORY.yml a v2.4.0
4. Sincronizar MASTER_INVENTORY.yml

---

## PRIORIDAD P3 - BAJO (Backlog)

### TAREA P3-001: Deprecar Seeds Duplicados

**Problema Detectado:**
Seeds duplicados identificados:
- profiles aparece 2 veces
- exercises aparece 2 veces

**Objetivo:** Limpiar y consolidar seeds.

| Campo | Valor |
|-------|-------|
| **ID** | P3-001 |
| **Tipo** | Limpieza |
| **Objetos Afectados** | apps/database/seeds/ |
| **Dependencias** | P0-002 completada |
| **Agente Asignado** | database-agent |
| **Prompt a Usar** | PROMPT-DATABASE-AGENT.md |
| **Esfuerzo Estimado** | 2 horas |
| **Criterio Aceptacion** | Seeds sin duplicados |

---

### TAREA P3-002: Crear Inventarios Detallados Faltantes

**Problema Detectado:**
6 inventarios detallados no existen:
- FUNCTIONS_INVENTORY.yml
- TRIGGERS_INVENTORY.yml
- RLS_INVENTORY.yml
- INDEXES_INVENTORY.yml
- VIEWS_INVENTORY.yml
- SEEDS_INVENTORY.yml

**Objetivo:** Crear inventarios para objetos de base de datos.

| Campo | Valor |
|-------|-------|
| **ID** | P3-002 |
| **Tipo** | Documentacion |
| **Objetos Afectados** | orchestration/inventarios/ |
| **Dependencias** | P2-003 completada |
| **Agente Asignado** | database-agent |
| **Prompt a Usar** | PROMPT-DATABASE-AGENT.md |
| **Esfuerzo Estimado** | 4 horas |
| **Criterio Aceptacion** | Inventarios creados con objetos actuales |

---

## ORDEN DE EJECUCION

```
FASE 1: CRITICOS (P0) - Paralelo hasta 2 agentes
├── P0-001: Formula XP (backend-agent)
└── P0-002: Validar Seeds (database-agent)

FASE 2: ALTOS (P1) - Secuencial por dependencias
├── P1-001: Entities Faltantes (backend-agent)
│   └── Depende de: P0-002
├── P1-002: Student Components (frontend-agent)
│   └── Depende de: Ninguna (paralelo con P1-001)
├── P1-003: Endpoints Admin (backend-agent)
│   └── Depende de: P1-001
└── P1-004: Relaciones TypeORM (backend-agent)
    └── Depende de: P1-001

FASE 3: MEDIOS (P2) - Paralelo hasta 3 agentes
├── P2-001: Types Consolidados (frontend-agent)
├── P2-002: ADRs Patrones (architecture-analyst)
└── P2-003: Inventarios (workspace-manager)

FASE 4: BAJOS (P3) - Cuando haya capacidad
├── P3-001: Seeds Duplicados (database-agent)
└── P3-002: Inventarios Detallados (database-agent)
```

---

## ASIGNACION DE AGENTES POR FASE

### Fase de Ejecucion 1 (P0)

| Agente | Tarea | Prompt |
|--------|-------|--------|
| backend-agent | P0-001 | PROMPT-BACKEND-AGENT.md |
| database-agent | P0-002 | PROMPT-DATABASE-AGENT.md |

### Fase de Ejecucion 2 (P1)

| Agente | Tareas | Prompt |
|--------|--------|--------|
| backend-agent | P1-001, P1-003, P1-004 | PROMPT-BACKEND-AGENT.md |
| frontend-agent | P1-002 | PROMPT-FRONTEND-AGENT.md |

### Fase de Ejecucion 3 (P2)

| Agente | Tarea | Prompt |
|--------|-------|--------|
| frontend-agent | P2-001 | PROMPT-FRONTEND-AGENT.md |
| architecture-analyst | P2-002 | Directa |
| workspace-manager | P2-003 | PROMPT-WORKSPACE-MANAGER.md |

### Fase de Ejecucion 4 (P3)

| Agente | Tareas | Prompt |
|--------|--------|--------|
| database-agent | P3-001, P3-002 | PROMPT-DATABASE-AGENT.md |

---

## CRITERIOS DE VALIDACION

### Por cada tarea completada:

1. **Codigo funciona:** Build y tests pasan
2. **Documentacion actualizada:** CHANGELOG, inventarios
3. **Sin regresiones:** Funcionalidad existente no afectada
4. **Revision de coherencia:** Cambio alineado con arquitectura

### Validacion final (FASE 5):

1. Recrear base de datos limpia
2. Ejecutar test suite completo
3. Verificar portales funcionan E2E
4. Actualizar reporte de coherencia a 95%+

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Romper relaciones existentes | Media | Alto | Backup antes de cambios |
| TypeORM schema mismatch | Alta | Medio | Validar antes de commit |
| Tests fallando | Media | Medio | Ejecutar suite antes de PR |
| Dependencias circulares | Baja | Alto | Analisis previo de imports |

---

## NOTAS ADICIONALES

1. **Maximo 5 agentes en paralelo** segun restriccion del orquestador
2. **Commits atomicos** - Un commit por subtarea completada
3. **Documentar decisiones** - Todo cambio mayor en ADR
4. **Notificar bloqueos** - Si una tarea bloquea a otra, escalar

---

**Generado por:** Architecture-Analyst
**Fecha:** 2025-11-29
**Version:** 1.0.0
**Estado:** FASE 2 COMPLETADA - Listo para Validacion
