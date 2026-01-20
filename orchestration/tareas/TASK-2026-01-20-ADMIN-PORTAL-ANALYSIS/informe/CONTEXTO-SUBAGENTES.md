# Contexto y Prompts de Subagentes
## TASK-2026-01-20-ADMIN-PORTAL-ANALYSIS

Este documento registra los prompts utilizados para cada subagente, permitiendo análisis de efectividad y reutilización en tareas similares.

---

## 1. SUBAGENTES DE EXPLORACIÓN (Perfil: Explore)

### 1.1 Exploración Frontend API Calls (T3.1a)

**Perfil:** Explore
**Propósito:** Documentar TODAS las llamadas API del frontend admin

```markdown
**PERFIL:** Explorador de Código Frontend

**TAREA T3.1a:** Analizar llamadas API del frontend admin de GAMILIT

**OBJETIVO:** Documentar TODAS las llamadas API que hace el frontend admin, incluyendo:
1. Endpoints consumidos
2. Métodos HTTP usados
3. Hooks que los invocan
4. Páginas que los usan

**ARCHIVOS A EXPLORAR:**
- `apps/frontend/src/apps/admin/hooks/` - Todos los hooks
- `apps/frontend/src/apps/admin/pages/` - Todas las páginas
- `apps/frontend/src/services/api/` - Servicios API (adminApi.ts, etc.)

**FORMATO DE SALIDA:**
Para cada endpoint encontrado, reporta:
```
ENDPOINT: [método] [ruta]
ARCHIVO_FRONTEND: [path al archivo que lo llama]
HOOK/FUNCIÓN: [nombre del hook o función]
PÁGINA: [página que lo usa]
```

**IMPORTANTE:** Busca patrones como:
- `axios.get`, `axios.post`, `axios.put`, `axios.delete`
- `api.get`, `api.post`, `api.put`, `api.delete`
- `/api/admin/*` paths
- Funciones `fetch*`, `create*`, `update*`, `delete*`, `export*`

Sé exhaustivo - necesito una lista COMPLETA de todos los endpoints que consume el frontend admin.
```

**Resultado:** 105+ endpoints documentados con ubicación exacta en código.

---

### 1.2 Exploración Backend Endpoints (T3.1b)

**Perfil:** Explore
**Propósito:** Documentar TODOS los endpoints del módulo admin backend

```markdown
**PERFIL:** Explorador de Código Backend

**TAREA T3.1b:** Documentar TODOS los endpoints del módulo admin de GAMILIT

**OBJETIVO:** Crear inventario completo de endpoints backend en el módulo admin

**ARCHIVOS A EXPLORAR:**
- `apps/backend/src/modules/admin/controllers/` - Todos los controllers
- Buscar decoradores: `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`

**FORMATO DE SALIDA:**
Para cada endpoint encontrado, reporta:
```
ENDPOINT: [método] [ruta completa incluyendo /api/admin/...]
CONTROLLER: [nombre del archivo]
MÉTODO: [nombre del método en el controller]
DECORADORES: [Guards, ApiTags, etc.]
DTO_REQUEST: [si tiene body/query]
DTO_RESPONSE: [si está documentado]
```

**IMPORTANTE:**
1. Incluir el prefijo del controller en la ruta (ej: @Controller('admin/users') + @Get(':id') = GET /api/admin/users/:id)
2. Documentar guards aplicados (@JwtAuthGuard, @AdminGuard, etc.)
3. Incluir parámetros de query si los hay

Sé exhaustivo - necesito una lista COMPLETA de todos los endpoints disponibles en el backend admin.
```

**Resultado:** 185+ endpoints documentados con DTOs y guards.

---

### 1.3 Exploración Entities Backend (T3.2)

**Perfil:** Explore
**Propósito:** Documentar TODAS las entities del módulo admin y validar vs DDL

```markdown
**PERFIL:** Explorador de Código Backend

**TAREA T3.2:** Documentar TODAS las entities del módulo admin de GAMILIT y sus relaciones con tablas de base de datos

**OBJETIVO:** Crear inventario de entities y verificar coherencia con DDL

**ARCHIVOS A EXPLORAR:**
1. `apps/backend/src/modules/admin/entities/` - Entities del módulo admin
2. `apps/backend/src/entities/` - Entities generales que usa admin
3. `apps/backend/src/modules/**/entities/` - Entities de otros módulos referenciados por admin
4. `ddl/` - Scripts de DDL para verificar tablas

**PARA CADA ENTITY, REPORTAR:**
```
ENTITY: [Nombre]
ARCHIVO: [path]
TABLA: [nombre de tabla - decorador @Entity('nombre')]
COLUMNAS: [lista de columnas con @Column]
RELACIONES: [ManyToOne, OneToMany, ManyToMany con otras entities]
DATASOURCE: [si tiene @Entity({ database: 'X' })]
```

**IMPORTANTE:**
1. Buscar decoradores: @Entity, @Column, @PrimaryGeneratedColumn, @ManyToOne, @OneToMany, @ManyToMany
2. Identificar si las entities usan el datasource 'progress' o 'default'
3. Listar cualquier entity que NO tenga tabla correspondiente en DDL

Sé exhaustivo - necesito una lista COMPLETA de todas las entities usadas por el admin.
```

**Resultado:** 17 entities documentadas con 350+ campos, 100% coherencia con DDL.

---

## 2. SUBAGENTES DE DOCUMENTACIÓN (Perfil: general-purpose)

### 2.1 Template para User Stories (T1.1-T1.7)

**Perfil:** general-purpose
**Propósito:** Crear User Story documentando una página admin existente

```markdown
**PERFIL:** Documentador de User Stories

**TAREA:** Crear User Story US-AE-0XX para la página Admin[Nombre]Page

**CONTEXTO:**
- Épica: EXT-002 - Admin Extendido
- Proyecto: GAMILIT
- La página ya está IMPLEMENTADA, solo falta documentación formal

**ARCHIVOS DE REFERENCIA:**
- Página frontend: `apps/frontend/src/apps/admin/pages/Admin[Nombre]Page.tsx`
- Hooks relacionados: `apps/frontend/src/apps/admin/hooks/use[Nombre].ts`
- Controller backend: `apps/backend/src/modules/admin/controllers/admin-[nombre].controller.ts`
- User Stories existentes (formato): `docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/US-AE-001-user-management.md`

**INSTRUCCIONES:**
1. Leer la página frontend para entender funcionalidades
2. Identificar hooks y endpoints consumidos
3. Verificar controller backend correspondiente
4. Crear User Story siguiendo el formato de US existentes

**FORMATO REQUERIDO:**
```yaml
---
id: "US-AE-0XX"
title: "[Título descriptivo]"
type: "User Story"
status: "Done"
priority: "[Alta/Media]"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-002"
story_points: [X]
budget: "$[X,XXX] MXN"
sprint: "Sprint-2"
labels: ["admin-extendido", "[etiquetas-relevantes]"]
created_date: "[fecha-original-si-conocida]"
updated_date: "2026-01-20"
completed_date: "[fecha-implementacion]"
---
```

**SECCIONES REQUERIDAS:**
- Información General (tabla)
- Historia de Usuario (Como/Quiero/Para)
- Endpoints API (lista numerada con métodos y rutas)
- Criterios de Aceptación (Funcionales y No Funcionales)
- Definición de Hecho (DoD)
- Referencias de Implementación (paths a archivos)
- Trazabilidad (tabla de artefactos)

**OUTPUT:** Archivo markdown completo listo para guardar.
```

**Variaciones por subtarea:**
- T1.1: AdminRolesPage → US-AE-012 (6 SP)
- T1.2: AdminAlertsPage → US-AE-013 (8 SP)
- T1.3: AdminAnalyticsPage → US-AE-014 (10 SP)
- T1.4: AdminProgressPage → US-AE-015 (10 SP)
- T1.5: AdminAdvancedPage → US-AE-016 (12 SP)
- T1.6: AdminNotificationsPage → US-AE-017 (6 SP)
- T1.7: AdminNotificationPreferencesPage → US-AE-018 (4 SP)

---

### 2.2 Template para Especificaciones Técnicas (T2.1-T2.3)

**Perfil:** general-purpose
**Propósito:** Crear especificación técnica de un sistema transversal

```markdown
**PERFIL:** Arquitecto de Documentación Técnica

**TAREA:** Crear especificación técnica ET-[NOMBRE]-SYSTEM

**CONTEXTO:**
- Proyecto: GAMILIT
- Épica: EXT-002 - Admin Extendido
- Sistema a documentar: [Bulk Operations / Export / Reports]

**ARCHIVOS DE REFERENCIA:**
- Controllers: `apps/backend/src/modules/admin/controllers/admin-*.controller.ts`
- Services: `apps/backend/src/modules/admin/services/admin-*.service.ts`
- DTOs: `apps/backend/src/modules/admin/dto/`
- Entities: `apps/backend/src/modules/admin/entities/`
- Frontend hooks: `apps/frontend/src/apps/admin/hooks/`

**INSTRUCCIONES:**
1. Identificar todos los endpoints relacionados con el sistema
2. Documentar el flujo de datos completo (FE → BE → DB)
3. Incluir diagramas de secuencia si aplica
4. Documentar DTOs de request y response
5. Incluir ejemplos de uso

**FORMATO REQUERIDO:**
```yaml
---
id: "ET-[NOMBRE]-SYSTEM"
title: "[Título del Sistema]"
type: "Technical Specification"
version: "1.0.0"
status: "Implemented"
created_date: "2026-01-20"
author: "Claude (Architecture Analyst)"
epic: "EXT-002"
---
```

**SECCIONES REQUERIDAS:**
1. Resumen Ejecutivo
2. Arquitectura del Sistema
3. Endpoints API (detallados)
4. Modelos de Datos (DTOs, Entities)
5. Flujos de Operación
6. Seguridad y Permisos
7. Consideraciones de Performance
8. Referencias de Implementación

**OUTPUT:** Archivo markdown completo (~20-30 KB) con documentación exhaustiva.
```

**Variaciones por subtarea:**
- T2.1: Sistema de Operaciones Bulk (BullMQ, async, polling)
- T2.2: Sistema de Exportación (CSV, streaming, filtros)
- T2.3: Sistema de Reportes (PDF, Excel, scheduling)

---

## 3. SUBAGENTES DE VALIDACIÓN (Perfil: Explore)

### 3.1 Validación de Coherencia Docs

**Perfil:** Explore
**Propósito:** Validar documentación a nivel proyecto

```markdown
**PERFIL:** Validador de Documentación

**TAREA:** Validar que la documentación del TASK-2026-01-20-ADMIN-PORTAL-ANALYSIS está correctamente integrada en el proyecto GAMILIT.

**VERIFICAR EN `/home/isem/workspace-v2/projects/gamilit/`:**

1. **docs/03-fase-extensiones/EXT-002-admin-extendido/_MAP.md**
   - ¿Incluye las 7 nuevas User Stories (US-AE-012 a US-AE-018)?
   - ¿Estados correctos (Done)?
   - ¿Métricas actualizadas?

2. **docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/**
   - ¿Existen los 7 archivos nuevos?
   - ¿Formato correcto con frontmatter YAML?

3. **docs/03-fase-extensiones/EXT-002-admin-extendido/especificaciones/**
   - ¿Existen los 3 archivos nuevos (ET-BULK-OPERATIONS, ET-EXPORT-SYSTEM, ET-REPORTS-SYSTEM)?

4. **orchestration/tareas/TASK-2026-01-20-ADMIN-PORTAL-ANALYSIS/**
   - ¿Existe METADATA.yml con información completa?
   - ¿Existe PLAN-MAESTRO-ANALISIS.md?
   - ¿Existe _INDEX.md?
   - ¿Existen entregables (REPORTE-VALIDACION-COHERENCIA.md, RESUMEN-EJECUTIVO.md)?

**FORMATO DE SALIDA:**
```
ARCHIVO: [path]
EXISTE: Si/No
CONTENIDO_VALIDO: Si/No/Parcial
PROBLEMAS: [lista de problemas si los hay]
```

Sé exhaustivo en la validación.
```

---

### 3.2 Validación de Gobernanza Workspace

**Perfil:** Explore
**Propósito:** Validar cumplimiento de directivas SIMCO

```markdown
**PERFIL:** Validador de Gobernanza

**TAREA:** Validar que la tarea TASK-2026-01-20-ADMIN-PORTAL-ANALYSIS cumple con las directivas de gobernanza del workspace según CLAUDE.md.

**VERIFICAR EN `/home/isem/workspace-v2/`:**

1. **orchestration/tareas/_INDEX.yml**
   - ¿La tarea TASK-2026-01-20-ADMIN-PORTAL-ANALYSIS está registrada?
   - Si no existe el archivo, indicarlo como GAP

2. **orchestration/agents/trazas/**
   - ¿Existe traza del agente que ejecutó la tarea?
   - Si no, indicarlo como GAP

3. **Según CLAUDE.md Regla 7 (Gobernanza de Documentación):**
   - ¿Carpeta de tarea creada? (orchestration/tareas/TASK-{YYYY-MM-DD}-{NNN}/)
   - ¿METADATA.yml completado?
   - ¿Fases CAPVED documentadas?
   - ¿_INDEX actualizado?

**FORMATO DE SALIDA:**
```
REQUISITO: [nombre del requisito]
ESTADO: CUMPLE/NO_CUMPLE/PARCIAL
UBICACION: [path del archivo]
ACCION_REQUERIDA: [si no cumple, qué hacer]
```

Identifica todos los GAPS de gobernanza.
```

---

## 4. ANÁLISIS DE EFECTIVIDAD

### 4.1 Métricas de Prompts

| Prompt | Subagente | Tokens Est. | Resultado | Efectividad |
|--------|-----------|-------------|-----------|-------------|
| Exploración FE API | Explore | ~500 | 105+ endpoints | Alta |
| Exploración BE API | Explore | ~450 | 185+ endpoints | Alta |
| Exploración Entities | Explore | ~400 | 17 entities | Alta |
| User Story Template | general-purpose | ~600 | 7 US creadas | Alta |
| Spec Técnica Template | general-purpose | ~500 | 3 ET creadas | Alta |
| Validación Docs | Explore | ~400 | Gaps identificados | Alta |
| Validación Gobernanza | Explore | ~350 | 4 GAPS críticos | Alta |

### 4.2 Patrones Exitosos

1. **Estructura clara de secciones** - Usar headers y listas para organizar instrucciones
2. **Ejemplos de formato de salida** - Proporcionar template del output esperado
3. **Paths explícitos** - Incluir rutas absolutas a archivos de referencia
4. **Alcance definido** - Especificar qué incluir y qué excluir
5. **Verificación exhaustiva** - Pedir ser "exhaustivo" cuando se requiere cobertura completa

### 4.3 Áreas de Mejora

1. **Validación de persistencia** - Agregar instrucción de verificar que los cambios se guardaron
2. **Manejo de conflictos** - Incluir qué hacer si hay archivos modificados externamente
3. **Contexto de dependencias** - Incluir información sobre subtareas previas completadas

---

## 5. PLANTILLAS REUTILIZABLES

### 5.1 Plantilla Base para Exploración

```markdown
**PERFIL:** [Explorador de Código Frontend/Backend/Database]

**TAREA:** [Descripción corta]

**OBJETIVO:** [Qué se quiere lograr]

**ARCHIVOS A EXPLORAR:**
- [Lista de paths con glob patterns si aplica]

**FORMATO DE SALIDA:**
```
[Template del formato esperado]
```

**IMPORTANTE:**
- [Instrucciones específicas]
- [Qué buscar]
- [Qué incluir/excluir]

Sé exhaustivo - necesito una lista COMPLETA.
```

### 5.2 Plantilla Base para Documentación

```markdown
**PERFIL:** [Documentador/Arquitecto]

**TAREA:** [Crear/Actualizar documento X]

**CONTEXTO:**
- Proyecto: [nombre]
- Épica/Módulo: [referencia]
- Estado actual: [implementado/pendiente]

**ARCHIVOS DE REFERENCIA:**
- [Lista de archivos a consultar]

**INSTRUCCIONES:**
1. [Paso 1]
2. [Paso 2]
...

**FORMATO REQUERIDO:**
```yaml
---
[frontmatter template]
---
```

**SECCIONES REQUERIDAS:**
- [Lista de secciones]

**OUTPUT:** [Descripción del entregable]
```

---

**Generado:** 2026-01-20
**Propósito:** Análisis y reutilización de prompts
**Versión:** 1.0.0
