# PROMPTS DE SPRINT 2 (VALIDACIÓN + PURGA)

**Tarea:** TASK-2026-02-03-ANALISIS-FRONTEND-UXUI
**Fecha:** 2026-02-03
**Sprint:** 2 (FASE-4, FASE-5)

---

## SUBAGENTE SA-7: Mapear Stores vs Schemas (ST-4.1)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-4.1
- **Fase:** FASE-4

### Prompt Enviado

```
Map Zustand stores to PostgreSQL schemas in GAMILIT.

Frontend Stores Location: apps/frontend/src/features/*/stores/
Database Schemas Location: apps/database/ddl/schemas/

Store → Schema mapping to verify:
1. authStore → auth_management
2. economyStore → gamification_system
3. ranksStore → gamification_system
4. achievementsStore → gamification_system
5. friendsStore → social_features
6. guildsStore → social_features
7. leaderboardsStore → gamification_system
8. notificationsStore → notifications
9. parentStore → auth_management
10. missionsStore → gamification_system
11. studentAssignmentsStore → progress_tracking
12. battleStore → social_features

For each store:
- List state properties
- Compare against table columns in schema
- Calculate coherence percentage
- Identify missing fields in frontend
- Identify extra fields in frontend

Return:
- Store list with schema mapping
- Coherence % per store
- Global coherence %
- List of gaps
```

### Contexto Proporcionado

```yaml
subtask_id: ST-4.1
fase: FASE-4
dependencia: ST-1.10 (stores auditados)
inventarios_referencia:
  - DATABASE_INVENTORY.yml
  - FRONTEND_INVENTORY.yml
```

### Resultado Obtenido

- 93.8% coherencia global
- 14 stores mapeados
- Gaps identificados:
  - Sin educationalContentStore
  - missionsStore deprecado
  - Progress parcial (50% cobertura)

---

## SUBAGENTE SA-8: Mapear API vs Endpoints (ST-4.2)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-4.2
- **Fase:** FASE-4

### Prompt Enviado

```
Map frontend API services to backend endpoints in GAMILIT.

Frontend APIs: apps/frontend/src/services/api/
Backend Controllers: apps/backend/src/modules/*/controllers/

Domains to map:
1. Admin APIs vs admin endpoints
2. Teacher APIs vs teacher endpoints
3. Student/Educational APIs vs content endpoints
4. Gamification APIs vs gamification endpoints
5. Social APIs vs social endpoints
6. Progress APIs vs progress endpoints
7. Auth APIs vs auth endpoints
8. Notifications APIs vs notification endpoints
9. LTI APIs vs lti endpoints

For each domain:
- Count frontend service functions
- Count backend endpoints (from controllers or Swagger)
- Calculate coverage %
- List endpoints without frontend consumer
- List frontend calls to non-existent endpoints

CRITICAL: Check ETL/ML/Visualization endpoints - suspected 0% coverage.

Return:
- Domain-by-domain coverage matrix
- Global coverage %
- Critical gaps (0% or low coverage areas)
- Recommended actions
```

### Contexto Proporcionado

```yaml
subtask_id: ST-4.2
fase: FASE-4
dependencia: ST-1.11 (servicios API auditados)
backend_endpoints_total: 850
frontend_functions_estimated: 600
```

### Resultado Obtenido

- 64% cobertura global
- ETL/ML/Visualization: 0% (CRÍTICO)
- Social: 49% (Bajo)
- Content: 41% (Bajo)
- ~155 endpoints sin consumir

---

## SUBAGENTE SA-9: Tablas sin UI (ST-4.3)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-4.3
- **Fase:** FASE-4

### Prompt Enviado

```
Identify database tables without frontend UI in GAMILIT.

Database Tables: apps/database/ddl/schemas/*/tables/
Frontend Components: apps/frontend/src/

Process:
1. List all tables from DDL (140 expected)
2. For each table, search if there's:
   - A component that displays/manages it
   - An API service that consumes it
   - A store that caches it
3. Categorize tables:
   - Full UI: Component + API + Display
   - Partial UI: Only API or only display
   - No UI: Backend-only table
   - Admin-only: Only in admin portal

Focus on CRITICAL tables likely needing student/teacher UI:
- discussion_threads (social_features)
- content_approvals (educational_content)
- social_interactions (social_features)
- content_tags (educational_content)
- user_follows (social_features)
- teacher_classrooms (social_features)

Return:
- Table count by category
- List of critical tables without UI
- Recommended UI components to create
- Story points estimate
```

### Contexto Proporcionado

```yaml
subtask_id: ST-4.3
fase: FASE-4
tablas_total: 169
tablas_esperadas_con_ui: 87
```

### Resultado Obtenido

- 169 tablas totales
- 87 con UI completa (51.5%)
- 12 tablas críticas sin UI
- Estimación: 170 SP para UI crítica

---

## SUBAGENTE SA-10: Tareas Archivables (ST-5.1)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-5.1
- **Fase:** FASE-5

### Prompt Enviado

```
Identify archivable tasks in GAMILIT orchestration.

Location: orchestration/tareas/

Criteria for archivable:
1. Status = "completada" or "cancelada"
2. Completed more than 3 days ago
3. No active references in ROADMAP
4. Not related to ongoing work

Check task folders:
- Look for METADATA.yml in each task folder
- Check estado.actual field
- Check temporalidad.fecha_fin
- Check if task has subtasks still in progress

Return:
- List of task folders
- Count of archivable vs keep
- Space that would be recovered
- Any tasks with inconsistent state
```

### Contexto Proporcionado

```yaml
subtask_id: ST-5.1
fase: FASE-5
ubicacion: orchestration/tareas/
criterio_dias_archivable: 3
```

### Resultado Obtenido

- 13 tareas encontradas
- 9 archivables
- 4 a mantener (incluyendo esta tarea)
- ~16.5 MB espacio recuperable

---

## SUBAGENTE SA-11: ET Files Obsoletos (ST-5.2)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-5.2
- **Fase:** FASE-5

### Prompt Enviado

```
Identify obsolete or outdated ET files in GAMILIT.

Location: docs/50-requerimientos/*/especificaciones/

Criteria for obsolete:
1. References components that no longer exist
2. References routes that have been renamed/removed
3. Not updated in more than 60 days
4. Marked as DRAFT with no recent activity
5. Duplicated content with another ET file

Process:
1. List all ET-*.md files
2. Check last modified date
3. Grep for component names and verify they exist
4. Check for duplicate IDs (ET-XXX-001.md patterns)
5. Verify against FRONTEND_INVENTORY components

Return:
- Total ET files count
- Vigentes (up to date)
- A actualizar (need updates)
- Duplicados (need consolidation)
- Deprecated (can be removed)
- Any critical duplicates found
```

### Contexto Proporcionado

```yaml
subtask_id: ST-5.2
fase: FASE-5
ubicacion: docs/50-requerimientos/
dependencias:
  - FASE-1 resultados
  - FASE-2 resultados
  - FASE-3 resultados
```

### Resultado Obtenido

- 92 ET files totales
- 57 vigentes (62%)
- 22 a actualizar (24%)
- 2 duplicados
- 1 deprecated
- Duplicado crítico: ET-SYS-001

---

## MÉTRICAS DE SPRINT 2

| Subagente | Subtask | Tiempo | Éxito |
|-----------|---------|--------|-------|
| SA-7 | ST-4.1 | ~5 min | ✅ |
| SA-8 | ST-4.2 | ~6 min | ✅ |
| SA-9 | ST-4.3 | ~4 min | ✅ |
| SA-10 | ST-5.1 | ~3 min | ✅ |
| SA-11 | ST-5.2 | ~4 min | ✅ |

**Total tiempo paralelo:** ~6 minutos (5 en paralelo)

---

**Documentado:** 2026-02-04
**Sistema:** SIMCO v4.3.0
