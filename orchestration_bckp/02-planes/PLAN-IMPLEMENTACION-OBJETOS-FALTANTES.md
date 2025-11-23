# Plan de Implementación: Migración de 513 Objetos Faltantes

**Documento:** Plan Operacional de Implementación
**Creado por:** SA-DB-007 (Planificador de Implementación)
**Fecha:** 2025-11-02
**Versión:** 1.0
**Estado:** Aprobado para Ejecución

---

## Resumen Ejecutivo

### Alcance del Proyecto

- **Total objetos a implementar:** 513
- **Microciclos planificados:** 4 (P0, P1, P2, P3)
- **Subagentes totales asignados:** 34
- **Tiempo estimado total:** 28-38 horas laborables
- **Duración estimada:** 5 días laborables
- **Complejidad:** Alta (objetos con dependencias cruzadas)

### Distribución de Objetos por Prioridad

| Prioridad | Descripción | Objetos | % Total | Microciclo |
|-----------|-------------|---------|---------|------------|
| **P0** | ENUMs + Tablas base | 44 | 8.6% | 4 |
| **P1** | Índices | 278 | 54.2% | 5 |
| **P2** | Functions, Views, Types, MVIEWs | 99 | 19.3% | 6 |
| **P3** | Triggers, RLS Policies | 92 | 17.9% | 7 |
| **TOTAL** | | **513** | **100%** | |

### Distribución de Objetos por Tipo

| Tipo | Cantidad | Prioridad | Carpeta Destino |
|------|----------|-----------|-----------------|
| ENUM | 27 | P0 | `schemas/{schema}/enums/` |
| TABLE | 17 | P0 | `schemas/{schema}/tables/` |
| INDEX | 278 | P1 | `schemas/{schema}/indexes/` |
| FUNCTION | 57 | P2 | `schemas/{schema}/functions/` |
| VIEW | 12 | P2 | `schemas/{schema}/views/` |
| TYPE | 20 | P2 | `schemas/{schema}/types/` |
| MATERIALIZED_VIEW | 10 | P2 | `schemas/{schema}/materialized-views/` |
| TRIGGER | 72 | P3 | `schemas/{schema}/triggers/` |
| POLICY | 20 | P3 | `schemas/{schema}/rls-policies/` |

---

## Distribución Global por Schema

### Tabla de Objetos Faltantes por Schema

| Schema | P0 | P1 | P2 | P3 | Total | % Completitud Actual |
|--------|----|----|----|----|-------|---------------------|
| **public** | 34 | 268 | 30 | 41 | **373** | ~5% |
| **gamification_system** | 0 | 4 | 34 | 13 | **51** | ~15% |
| **auth_management** | 3 | 2 | 6 | 7 | **18** | 31% |
| **progress_tracking** | 0 | 2 | 7 | 5 | **14** | ~25% |
| **gamilit** | 0 | 0 | 13 | 0 | **13** | N/A (nuevo) |
| **social_features** | 0 | 0 | 1 | 11 | **12** | ~20% |
| **content_management** | 2 | 2 | 0 | 4 | **8** | 27% |
| **educational_content** | 0 | 0 | 2 | 6 | **8** | ~30% |
| **admin_dashboard** | 0 | 0 | 4 | 0 | **4** | N/A (nuevo) |
| **audit_logging** | 1 | 0 | 1 | 2 | **4** | 56% |
| **system_configuration** | 1 | 0 | 0 | 3 | **4** | ~35% |
| **auth** | 2 | 0 | 1 | 0 | **3** | 25% |
| **storage** | 1 | 0 | 0 | 0 | **1** | N/A (enum) |
| **TOTAL** | **44** | **278** | **99** | **92** | **513** | 8.8% |

### Análisis de Carga por Schema

**Schemas Críticos (>50 objetos):**
- `public`: 373 objetos (73% del total) - Requiere atención especial
- `gamification_system`: 51 objetos (10% del total)

**Schemas Moderados (10-50 objetos):**
- `auth_management`, `progress_tracking`, `gamilit`, `social_features`

**Schemas Ligeros (<10 objetos):**
- Resto de schemas

---

## Estrategia de Paralelización

### Criterios de Distribución de Trabajo

1. **Balanceo de Carga:**
   - Objetivo: 5-15 objetos por subagente
   - Evitar asignaciones desequilibradas
   - Considerar complejidad (líneas de código) además de cantidad

2. **Agrupación por Schema:**
   - Priorizar mantener objetos del mismo schema juntos
   - Facilita validaciones y coherencia
   - Reduce dependencias cruzadas entre subagentes

3. **Agrupación por Tipo:**
   - Objetos del mismo tipo comparten estructura similar
   - Facilita reutilización de patrones
   - Simplifica validaciones

4. **Gestión de Dependencias:**
   - P0 antes que P1-P3 (dependencias críticas)
   - ENUMs antes que TABLEs
   - TABLEs/Functions antes que Triggers/Policies
   - Validar dependencias dentro de cada microciclo

### Modelo de Ejecución

- **Ejecución por Microciclo:** Secuencial (un microciclo completo antes del siguiente)
- **Ejecución dentro de Microciclo:** Paralela (todos los subagentes ejecutan simultáneamente)
- **Validación:** Al finalizar cada microciclo (criterio de paso al siguiente)

---

## MICROCICLO 4: Implementar P0 (44 objetos)

### Objetivos

- Implementar **27 ENUMs** (tipos enumerados)
- Implementar **17 TABLEs** (tablas base sin dependencias complejas)
- **Tiempo estimado:** 4-6 horas
- **Criterio de éxito:** 44 objetos creados, 0 errores de sintaxis

### Estrategia de Implementación

1. **Fase 1:** Implementar todos los ENUMs (pueden ejecutarse en paralelo)
2. **Fase 2:** Implementar todas las TABLEs (verificar que ENUMs estén creados)
3. **Validación:** Verificar que todos los objetos existen en base de datos destino

### Distribución de Schemas

- **public:** 34 objetos (24 ENUMs + 10 TABLEs)
- **auth:** 2 ENUMs
- **auth_management:** 3 TABLEs
- **content_management:** 2 TABLEs
- **audit_logging:** 1 TABLE
- **storage:** 1 ENUM
- **system_configuration:** 1 TABLE

### Subagentes Asignados

---

#### SA-DB-008: ENUMs del Schema Public

**Responsabilidad:** Implementar 24 tipos enumerados del schema público

**Objetos asignados (24):**

1. `public.achievement_category`
2. `public.achievement_type`
3. `public.aggregation_period`
4. `public.alert_severity`
5. `public.attempt_result`
6. `public.classroom_role`
7. `public.comodin_type`
8. `public.content_status`
9. `public.content_type`
10. `public.difficulty_level`
11. `public.exercise_type`
12. `public.gamilit_role`
13. `public.maya_rank`
14. `public.media_type`
15. `public.metric_type`
16. `public.module_status`
17. `public.notification_channel`
18. `public.notification_type`
19. `public.processing_status`
20. `public.progress_status`
21. `public.rango_maya`
22. `public.social_event_type`
23. `public.transaction_type`
24. `public.user_status`

**Tareas:**

1. Crear carpeta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/public/enums/`
2. Para cada ENUM:
   - Localizar archivo fuente (usar información de matriz-gaps.json)
   - Copiar archivo a destino con nombre `{nombre_enum}.sql`
   - Validar sintaxis SQL
3. Crear archivo `_MAP.md` en carpeta `enums/` documentando los 24 ENUMs

**Rutas:**
- **Destino Base:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/public/enums/`
- **Fuentes:** Según matriz-gaps (múltiples fuentes: SA-DB-002, SA-DB-004, SA-DB-005)

**Validaciones:**

```sql
-- Verificar que los 24 ENUMs existen
SELECT typname
FROM pg_type
WHERE typtype = 'e'
  AND typnamespace = 'public'::regnamespace
  AND typname IN (
    'achievement_category', 'achievement_type', 'aggregation_period',
    'alert_severity', 'attempt_result', 'classroom_role',
    -- ... resto de ENUMs
  );
-- Debe retornar: 24 filas
```

**Criterio de éxito:**
- 24 archivos SQL creados
- 24 ENUMs listados en `_MAP.md`
- Sintaxis SQL válida en todos los archivos
- 0 errores de compilación

**Tiempo estimado:** 60 minutos

---

#### SA-DB-009: Tablas del Schema Public

**Responsabilidad:** Implementar 10 tablas base del schema público

**Objetos asignados (10):**

1. `public.assignment_classrooms`
2. `public.assignment_exercises`
3. `public.assignment_students`
4. `public.assignment_submissions`
5. `public.assignments`
6. `public.classroom_students`
7. `public.classrooms`
8. `public.for` *(verificar nombre - posible error)*
9. `public.notifications`
10. `public.teacher_notes`

**Tareas:**

1. Crear carpeta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/public/tables/`
2. Para cada tabla:
   - Localizar archivo fuente (usar información de matriz-gaps.json)
   - Copiar archivo a destino con nombre `{nombre_tabla}.sql`
   - Validar sintaxis SQL
   - Verificar que ENUMs referenciados existen (dependencia de SA-DB-008)
3. Crear archivo `_MAP.md` documentando las 10 tablas

**Dependencias:**
- **BLOQUEANTE:** Requiere que SA-DB-008 complete los ENUMs de public

**Rutas:**
- **Destino Base:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/public/tables/`
- **Fuentes:** Según matriz-gaps (SA-DB-004 principalmente)

**Validaciones:**

```sql
-- Verificar que las 10 tablas existen
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'assignment_classrooms', 'assignment_exercises', 'assignment_students',
    'assignment_submissions', 'assignments', 'classroom_students',
    'classrooms', 'for', 'notifications', 'teacher_notes'
  );
-- Debe retornar: 10 filas

-- Verificar estructura de tabla ejemplo
\d public.assignments
```

**Criterio de éxito:**
- 10 archivos SQL creados
- 10 tablas documentadas en `_MAP.md`
- Sintaxis SQL válida
- Dependencias de ENUMs resueltas
- 0 errores de creación

**Tiempo estimado:** 75 minutos

---

#### SA-DB-010: ENUMs de Auth y Storage

**Responsabilidad:** Implementar 3 ENUMs de schemas auth y storage

**Objetos asignados (3):**

1. `auth.aal_level`
2. `auth.code_challenge_method`
3. `storage.buckettype`

**Tareas:**

1. Crear carpetas destino:
   - `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth/enums/`
   - `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/storage/enums/`
2. Para cada ENUM:
   - Localizar archivo fuente
   - Copiar a carpeta correspondiente
   - Validar sintaxis
3. Crear `_MAP.md` en cada carpeta

**Rutas:**
- **Destino Auth:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth/enums/`
- **Destino Storage:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/storage/enums/`

**Validaciones:**

```sql
-- Verificar ENUMs de auth
SELECT typname FROM pg_type
WHERE typtype = 'e' AND typnamespace = 'auth'::regnamespace;
-- Debe retornar: aal_level, code_challenge_method

-- Verificar ENUM de storage
SELECT typname FROM pg_type
WHERE typtype = 'e' AND typnamespace = 'storage'::regnamespace;
-- Debe retornar: buckettype
```

**Criterio de éxito:**
- 3 archivos SQL creados
- 2 carpetas con `_MAP.md` creados
- Sintaxis válida
- 0 errores

**Tiempo estimado:** 30 minutos

---

#### SA-DB-011: Tablas de Auth Management

**Responsabilidad:** Implementar 3 tablas del schema auth_management

**Objetos asignados (3):**

1. `auth_management.memberships`
2. `auth_management.user_sessions`
3. `auth_management.user_suspensions`

**Tareas:**

1. Verificar que carpeta existe: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/`
2. Para cada tabla:
   - Localizar archivo fuente (backup-ddl/gamilit_platform/schemas/auth_management/tables/)
   - Copiar archivo a destino
   - Validar sintaxis SQL
3. Actualizar `_MAP.md` si existe, o crear uno nuevo

**Rutas:**
- **Destino:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/`
- **Fuente:** `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/`

**Validaciones:**

```sql
-- Verificar tablas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'auth_management'
  AND table_name IN ('memberships', 'user_sessions', 'user_suspensions');
-- Debe retornar: 3 filas

-- Verificar estructura
\d auth_management.memberships
```

**Criterio de éxito:**
- 3 archivos SQL creados/actualizados
- Sintaxis válida
- Tablas creables sin errores

**Tiempo estimado:** 45 minutos

---

#### SA-DB-012: Tablas de Content Management y Audit Logging

**Responsabilidad:** Implementar 3 tablas de 2 schemas diferentes

**Objetos asignados (3):**

1. `content_management.content_versions`
2. `content_management.flagged_content`
3. `audit_logging.user_activity`

**Tareas:**

1. Para `content_management`:
   - Verificar carpeta `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/tables/`
   - Copiar 2 archivos desde backup-ddl
2. Para `audit_logging`:
   - Verificar carpeta `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/tables/`
   - Copiar 1 archivo
3. Validar sintaxis de los 3 archivos

**Rutas:**
- **Destino Content:** `/.../schemas/content_management/tables/`
- **Destino Audit:** `/.../schemas/audit_logging/tables/`
- **Fuentes:** Según matriz-gaps

**Validaciones:**

```sql
-- Verificar tablas content_management
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'content_management'
  AND table_name IN ('content_versions', 'flagged_content');

-- Verificar tabla audit_logging
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'audit_logging'
  AND table_name = 'user_activity';
```

**Criterio de éxito:**
- 3 archivos SQL creados
- Sintaxis válida
- 0 errores

**Tiempo estimado:** 40 minutos

---

#### SA-DB-013: Tabla de System Configuration

**Responsabilidad:** Implementar 1 tabla del schema system_configuration

**Objetos asignados (1):**

1. `system_configuration.settings`

**Tareas:**

1. Verificar carpeta: `/.../schemas/system_configuration/tables/`
2. Copiar archivo `settings.sql` desde fuente
3. Validar sintaxis SQL
4. Actualizar `_MAP.md`

**Rutas:**
- **Destino:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/system_configuration/tables/`

**Validaciones:**

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'system_configuration'
  AND table_name = 'settings';
-- Debe retornar: 1 fila
```

**Criterio de éxito:**
- 1 archivo SQL creado
- Sintaxis válida
- Tabla creable

**Tiempo estimado:** 20 minutos

---

### Validación Final Microciclo 4

**Acciones post-implementación:**

1. **Re-ejecutar inventario destino:**
   ```bash
   python3 scripts/generar-inventario-destino.py
   ```

2. **Comparar con inventario anterior:**
   - Verificar incremento de 44 objetos (27 ENUMs + 17 TABLEs)

3. **Validación SQL:**
   ```sql
   -- Contar ENUMs nuevos
   SELECT COUNT(*) FROM pg_type WHERE typtype = 'e';
   -- Esperado: +27 ENUMs

   -- Contar tablas nuevas en schemas relevantes
   SELECT table_schema, COUNT(*)
   FROM information_schema.tables
   WHERE table_schema IN ('public', 'auth', 'auth_management',
                          'content_management', 'audit_logging',
                          'system_configuration')
   GROUP BY table_schema;
   -- Esperado: +17 tablas distribuidas
   ```

4. **Verificar sintaxis:**
   ```bash
   # Ejecutar validador SQL en todos los archivos nuevos
   find schemas/ -name "*.sql" -newer /tmp/microciclo4_start -exec psql -f {} --dry-run \;
   ```

5. **Actualizar matriz de gaps:**
   - Marcar 44 objetos P0 como implementados
   - Recalcular porcentaje de completitud

**Criterios de Paso al Microciclo 5:**

- ✅ 44 objetos implementados (verificado en BD)
- ✅ 0 errores de sintaxis
- ✅ 0 referencias rotas
- ✅ Todos los archivos en carpetas correctas
- ✅ Documentación (_MAP.md) actualizada

**Tiempo total estimado Microciclo 4:** 4-6 horas

---

## MICROCICLO 5: Implementar P1 (278 índices)

### Objetivos

- Implementar **278 índices**
- Mejorar performance de queries en tablas existentes
- **Tiempo estimado:** 6-8 horas
- **Criterio de éxito:** 278 índices creados correctamente

### Estrategia de Implementación

1. **Validación previa:** Verificar que todas las tablas referenciadas existen
2. **Ejecución paralela:** 10 subagentes trabajando simultáneamente
3. **Organización:** Crear carpeta `indexes/` en cada schema
4. **Validación:** Verificar existencia de índices y ausencia de duplicados

### Distribución de Schemas

- **public:** 268 índices (96.4%)
- **gamification_system:** 4 índices
- **auth_management:** 2 índices
- **content_management:** 2 índices
- **progress_tracking:** 2 índices

### Subagentes Asignados

---

#### SA-DB-014 a SA-DB-021: Índices de Public (268 índices en 8 grupos)

**Estrategia de División:** Dividir 268 índices en 8 subagentes (~34 índices por subagente)

**SA-DB-014:** Índices de public (grupo 1/8) - 34 índices
- Índices 1-34 (alfabéticamente ordenados)
- Enfoque: índices de tablas que comienzan con 'a' a 'audit_*'

**SA-DB-015:** Índices de public (grupo 2/8) - 34 índices
- Índices 35-68
- Enfoque: tablas 'c' a 'e' (classrooms, content, exercises)

**SA-DB-016:** Índices de public (grupo 3/8) - 34 índices
- Índices 69-102
- Enfoque: tablas 'f' a 'l' (friendships, leaderboard)

**SA-DB-017:** Índices de public (grupo 4/8) - 34 índices
- Índices 103-136
- Enfoque: tablas 'm' a 'p' (missions, modules, performance)

**SA-DB-018:** Índices de public (grupo 5/8) - 34 índices
- Índices 137-170
- Enfoque: tablas 'r' a 's' (rankings, statistics)

**SA-DB-019:** Índices de public (grupo 6/8) - 34 índices
- Índices 171-204
- Enfoque: tablas 's' a 't' (system, teachers)

**SA-DB-020:** Índices de public (grupo 7/8) - 34 índices
- Índices 205-238
- Enfoque: tablas 'u' a 'user_*'

**SA-DB-021:** Índices de public (grupo 8/8) - 30 índices
- Índices 239-268
- Enfoque: índices restantes (user_*, analytics)

**Tareas comunes para SA-DB-014 a SA-DB-021:**

1. Crear carpeta destino: `/.../schemas/public/indexes/` (si no existe)
2. Para cada índice asignado:
   - Localizar archivo fuente (usar matriz-gaps.json)
   - Copiar archivo a destino con nombre `{nombre_indice}.sql`
   - Validar que tabla referenciada existe
   - Validar sintaxis CREATE INDEX
3. Crear/actualizar `_MAP.md` con lista de índices implementados
4. Generar archivo `_TABLAS_INDEXADAS.md` listando tablas y sus índices

**Rutas:**
- **Destino:** `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/public/indexes/`
- **Fuentes:** Principalmente SA-DB-004 (migraciones) y backup-ddl

**Validaciones (cada subagente):**

```sql
-- Verificar índices creados (ejemplo para SA-DB-014)
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN ('idx_achievements_active', 'idx_achievements_category', ...);
-- Debe retornar: 34 filas (para SA-DB-014)

-- Verificar que no hay índices duplicados
SELECT indexname, COUNT(*)
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY indexname
HAVING COUNT(*) > 1;
-- Debe retornar: 0 filas
```

**Criterio de éxito (cada subagente):**
- Archivos SQL creados (34 o 30 según grupo)
- Sintaxis válida
- Tablas referenciadas existen
- No hay duplicados

**Tiempo estimado por subagente:** 45-60 minutos

---

#### SA-DB-022: Índices de Auth Management y Gamification System

**Responsabilidad:** Implementar 6 índices de 2 schemas

**Objetos asignados (6):**

**content_management (2):**
1. `idx_marie_content_grade_levels_gin`
2. `idx_marie_content_keywords_gin`

**progress_tracking (2):**
3. `idx_module_progress_analytics_gin`
4. `idx_scheduled_missions_mission`

**gamification_system (2):**
5. `idx_achievements_metadata_gin` (primeros 2)
6. `idx_active_boosts_user` (primeros 2)

**Tareas:**

1. Para cada schema:
   - Crear carpeta `indexes/` si no existe
   - Copiar archivos de índices desde backup-ddl
   - Validar sintaxis y tablas referenciadas
2. Crear `_MAP.md` en cada carpeta

**Rutas:**
- **Destino Content:** `/.../schemas/content_management/indexes/`
- **Destino Progress:** `/.../schemas/progress_tracking/indexes/`
- **Destino Gamification:** `/.../schemas/gamification_system/indexes/`

**Validaciones:**

```sql
-- Por cada schema
SELECT schemaname, indexname FROM pg_indexes
WHERE schemaname IN ('content_management', 'progress_tracking', 'gamification_system')
ORDER BY schemaname, indexname;
-- Debe incluir los 6 índices
```

**Criterio de éxito:**
- 6 archivos SQL creados
- 3 carpetas indexes/ creadas
- Sintaxis válida
- 0 errores

**Tiempo estimado:** 45 minutos

---

#### SA-DB-023: Índices de Auth Management y Gamification System (resto)

**Responsabilidad:** Implementar 4 índices restantes

**Objetos asignados (4):**

**auth_management (2):**
1. `idx_user_preferences_theme`
2. `idx_user_roles_permissions_gin`

**gamification_system (2 restantes):**
3. `idx_achievement_categories_active`
4. `idx_inventory_transactions_user`

**Tareas:** Similares a SA-DB-022

**Rutas:**
- **Destino Auth Mgmt:** `/.../schemas/auth_management/indexes/`
- **Destino Gamification:** `/.../schemas/gamification_system/indexes/`

**Validaciones:**

```sql
SELECT schemaname, indexname FROM pg_indexes
WHERE schemaname IN ('auth_management', 'gamification_system')
  AND indexname IN ('idx_user_preferences_theme',
                    'idx_user_roles_permissions_gin',
                    'idx_achievement_categories_active',
                    'idx_inventory_transactions_user');
-- Debe retornar: 4 filas
```

**Criterio de éxito:**
- 4 archivos SQL creados
- Sintaxis válida
- 0 errores

**Tiempo estimado:** 40 minutos

---

### Validación Final Microciclo 5

**Acciones post-implementación:**

1. **Contar índices totales:**
   ```sql
   SELECT schemaname, COUNT(*) as total_indexes
   FROM pg_indexes
   WHERE schemaname IN ('public', 'auth_management', 'content_management',
                        'gamification_system', 'progress_tracking')
   GROUP BY schemaname
   ORDER BY total_indexes DESC;
   ```

2. **Verificar incremento:**
   - Comparar con inventario pre-microciclo
   - Esperado: +278 índices

3. **Detectar índices duplicados:**
   ```sql
   SELECT indexname, schemaname, COUNT(*)
   FROM pg_indexes
   GROUP BY indexname, schemaname
   HAVING COUNT(*) > 1;
   -- Debe retornar: 0 filas
   ```

4. **Verificar índices GIN/GIST:**
   ```sql
   SELECT indexname, pg_get_indexdef(indexrelid) as definition
   FROM pg_indexes
   WHERE indexname LIKE '%_gin' OR indexname LIKE '%_gist';
   -- Verificar sintaxis correcta de índices especiales
   ```

5. **Actualizar documentación:**
   - Generar `INDEXES_SUMMARY.md` con lista completa
   - Documentar índices por tabla

**Criterios de Paso al Microciclo 6:**

- ✅ 278 índices creados
- ✅ 0 duplicados
- ✅ Todas las tablas referenciadas existen
- ✅ Sintaxis válida en todos los CREATE INDEX
- ✅ Carpetas indexes/ creadas en 5 schemas
- ✅ Documentación _MAP.md completa

**Tiempo total estimado Microciclo 5:** 6-8 horas

---

## MICROCICLO 6: Implementar P2 (99 objetos)

### Objetivos

- Implementar **57 funciones (PL/pgSQL)**
- Implementar **12 vistas**
- Implementar **20 tipos (composite types)**
- Implementar **10 vistas materializadas**
- **Tiempo estimado:** 10-14 horas
- **Criterio de éxito:** 99 objetos funcionales, sintaxis PL/pgSQL válida

### Estrategia de Implementación

1. **Orden de creación:**
   - TYPEs primero (dependencias)
   - FUNCTIONs después
   - VIEWs y MVIEWs al final
2. **Validación intensiva:** Sintaxis PL/pgSQL, dependencias de tablas/funciones
3. **Organización por carpetas:** `functions/`, `views/`, `types/`, `materialized-views/`
4. **Ejecución paralela:** 10 subagentes

### Distribución de Schemas

- **gamification_system:** 34 objetos (20 functions, 10 mviews, 4 views)
- **public:** 30 objetos (7 functions, 20 types, 3 views)
- **gamilit:** 13 functions
- **auth_management:** 6 functions
- **progress_tracking:** 7 objetos (6 functions, 1 view)
- **admin_dashboard:** 4 views
- **Otros schemas:** 5 objetos (functions dispersas)

### Subagentes Asignados

---

#### SA-DB-024: Functions de Gamification System (1/2)

**Responsabilidad:** Implementar primeras 10 funciones de gamification_system

**Objetos asignados (10):**

1. `apply_xp_boost`
2. `award_ml_coins`
3. `calculate_level_from_xp`
4. `calculate_user_rank`
5. `check_and_award_achievements`
6. `claim_achievement_reward`
7. `consume_comodin`
8. `get_user_comodines`
9. `get_user_current_rank`
10. `get_user_inventory`

**Tareas:**

1. Crear carpeta: `/.../schemas/gamification_system/functions/`
2. Para cada función:
   - Copiar desde backup-ddl
   - Validar sintaxis PL/pgSQL
   - Verificar dependencias de tablas (user_stats, achievements, inventory, etc.)
   - Verificar dependencias de otras funciones
3. Crear `_MAP.md` documentando funciones

**Rutas:**
- **Destino:** `/.../schemas/gamification_system/functions/`
- **Fuente:** `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/functions/`

**Validaciones:**

```sql
-- Verificar funciones creadas
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'gamification_system'
  AND routine_name IN ('apply_xp_boost', 'award_ml_coins', ...);
-- Debe retornar: 10 filas

-- Validar sintaxis de una función
\df+ gamification_system.apply_xp_boost
```

**Criterio de éxito:**
- 10 archivos SQL creados
- Sintaxis PL/pgSQL válida
- Dependencias resueltas
- Funciones compilables

**Tiempo estimado:** 90-120 minutos

---

#### SA-DB-025: Functions de Gamification System (2/2)

**Responsabilidad:** Implementar segundas 10 funciones de gamification_system

**Objetos asignados (10):**

11. `get_user_inventory_summary`
12. `get_user_rank_progress`
13. `get_user_rank_requirements`
14. `grant_achievement`
15. `process_exercise_completion`
16. `redeem_comodin`
17. `update_leaderboard_coins`
18. `update_leaderboard_global`
19. `update_leaderboard_streaks`
20. `update_user_rank`

**Tareas:** Similares a SA-DB-024

**Rutas:** Idénticas a SA-DB-024

**Validaciones:** Idénticas a SA-DB-024 (verificar estos 10)

**Criterio de éxito:**
- 10 archivos SQL creados
- Sintaxis válida
- Funciones compilables

**Tiempo estimado:** 90-120 minutos

---

#### SA-DB-026: Materialized Views de Gamification System

**Responsabilidad:** Implementar 10 vistas materializadas

**Objetos asignados (10):**

1. `99-refresh-schedule` *(verificar - nombre inusual)*
2. `CREATE` *(verificar - palabra reservada)*
3. `check-mv-freshness` *(verificar sintaxis)*
4. `leaderboard_coins_mv`
5. `leaderboard_global_mv`
6. `leaderboard_streaks_mv`
7. `user_inventory_summary_mv`
8. `user_rank_progress_mv`
9. `user_stats_summary_mv`
10. `achievement_completion_stats_mv`

**Tareas:**

1. Crear carpeta: `/.../schemas/gamification_system/materialized-views/`
2. Para cada MVIEW:
   - Copiar desde backup-ddl
   - Validar sintaxis CREATE MATERIALIZED VIEW
   - Verificar dependencias de tablas/views
3. Crear archivo `_REFRESH_SCHEDULE.md` documentando estrategia de refresh
4. Crear `_MAP.md`

**NOTA IMPORTANTE:** Algunos nombres parecen incorrectos (CREATE, 99-refresh-schedule). Verificar en fuente antes de implementar.

**Rutas:**
- **Destino:** `/.../schemas/gamification_system/materialized-views/`
- **Fuente:** `/.../backup-ddl/gamilit_platform/schemas/gamification_system/materialized-views/`

**Validaciones:**

```sql
-- Verificar MVIEWs creadas
SELECT matviewname
FROM pg_matviews
WHERE schemaname = 'gamification_system';
-- Debe retornar: ~10 filas (verificar nombres correctos)

-- Verificar que se pueden refrescar
REFRESH MATERIALIZED VIEW gamification_system.leaderboard_coins_mv;
```

**Criterio de éxito:**
- 10 archivos SQL creados (nombres verificados)
- Sintaxis válida
- MVIEWs creables y refrescables
- Documentación de refresh

**Tiempo estimado:** 90 minutos

---

#### SA-DB-027: Views de Gamification System

**Responsabilidad:** Implementar 4 vistas regulares

**Objetos asignados (4):**

1. `leaderboard_coins`
2. `leaderboard_global`
3. `leaderboard_streaks`
4. `user_inventory_summary`

**Tareas:**

1. Crear carpeta: `/.../schemas/gamification_system/views/`
2. Para cada vista:
   - Copiar desde backup-ddl
   - Validar sintaxis CREATE VIEW
   - Verificar dependencias
3. Crear `_MAP.md`

**Rutas:**
- **Destino:** `/.../schemas/gamification_system/views/`

**Validaciones:**

```sql
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'gamification_system'
  AND table_name IN ('leaderboard_coins', 'leaderboard_global',
                     'leaderboard_streaks', 'user_inventory_summary');
-- Debe retornar: 4 filas
```

**Criterio de éxito:**
- 4 archivos SQL creados
- Vistas creables
- Sintaxis válida

**Tiempo estimado:** 45 minutos

---

#### SA-DB-028: Functions de Gamilit (1/2)

**Responsabilidad:** Implementar primeras 7 funciones del schema gamilit

**Objetos asignados (7):**

1. `audit_profile_changes`
2. `get_current_user_id`
3. `get_current_user_role`
4. `handle_new_user`
5. `is_classroom_teacher`
6. `is_student_in_classroom`
7. `log_user_login`

**Tareas:**

1. Crear carpeta: `/.../schemas/gamilit/functions/`
2. Copiar funciones desde backup-ddl
3. Validar sintaxis PL/pgSQL
4. Crear `_MAP.md`

**Rutas:**
- **Destino:** `/.../schemas/gamilit/functions/`
- **Fuente:** `/.../backup-ddl/gamilit_platform/schemas/gamilit/functions/`

**Validaciones:**

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'gamilit'
  AND routine_name IN ('audit_profile_changes', 'get_current_user_id', ...);
-- Debe retornar: 7 filas
```

**Criterio de éxito:**
- 7 archivos SQL creados
- Sintaxis válida
- Funciones compilables

**Tiempo estimado:** 75 minutos

---

#### SA-DB-029: Functions de Gamilit (2/2)

**Responsabilidad:** Implementar últimas 6 funciones del schema gamilit

**Objetos asignados (6):**

8. `now_mexico`
9. `set_profile_defaults`
10. `update_classroom_member_count`
11. `update_user_last_login`
12. `validate_email_format`
13. `validate_username`

**Tareas:** Similares a SA-DB-028

**Validaciones:** Similares a SA-DB-028 (verificar estos 6)

**Criterio de éxito:**
- 6 archivos SQL creados
- Sintaxis válida
- Funciones compilables

**Tiempo estimado:** 60 minutos

---

#### SA-DB-030: Types de Public

**Responsabilidad:** Implementar 20 tipos compuestos del schema public

**Objetos asignados (20):**

1. `achievement_category`
2. `achievement_type`
3. `alert_severity`
4. `attempt_result`
5. `classroom_role`
6. `content_status`
7. `content_type`
8. `difficulty_level`
9. `exercise_type`
10. `gamilit_role`
11. `maya_rank`
12. `media_type`
13. `metric_type`
14. `module_status`
15. `notification_channel`
16. `notification_type`
17. `processing_status`
18. `progress_status`
19. `social_event_type`
20. `transaction_type`

**NOTA:** Verificar si estos son TYPEs (composite) o ENUMs. Si son ENUMs, ya deberían estar en P0.

**Tareas:**

1. Crear carpeta: `/.../schemas/public/types/`
2. Para cada tipo:
   - Verificar en fuente si es TYPE o ENUM
   - Si es TYPE: copiar archivo
   - Si es ENUM: reportar duplicado con P0
3. Validar sintaxis CREATE TYPE
4. Crear `_MAP.md`

**Rutas:**
- **Destino:** `/.../schemas/public/types/`

**Validaciones:**

```sql
-- Verificar tipos compuestos (no ENUMs)
SELECT typname, typtype
FROM pg_type
WHERE typnamespace = 'public'::regnamespace
  AND typtype = 'c'  -- 'c' = composite type
  AND typname IN ('achievement_category', ...);
```

**Criterio de éxito:**
- 20 archivos SQL creados (verificar que son TYPEs no ENUMs)
- Sintaxis válida
- No duplicados con P0

**Tiempo estimado:** 60 minutos

---

#### SA-DB-031: Functions y Views de Public

**Responsabilidad:** Implementar 10 objetos del schema public (7 functions + 3 views)

**Objetos asignados (10):**

**Functions (7):**
1. `cleanup_old_system_logs`
2. `cleanup_old_user_activity`
3. `is_feature_enabled`
4. `log_system_event`
5. `send_notification`
6. `update_feature_flag`
7. `validate_date_range`

**Views (3):**
8. `assignment_submission_stats`
9. `classroom_overview`
10. `for` *(verificar nombre - posible error)*

**Tareas:**

1. Crear carpetas: `/.../schemas/public/functions/` y `/.../schemas/public/views/`
2. Copiar 7 funciones
3. Copiar 3 vistas (verificar nombre "for")
4. Validar sintaxis
5. Crear `_MAP.md` en cada carpeta

**Rutas:**
- **Destino Functions:** `/.../schemas/public/functions/`
- **Destino Views:** `/.../schemas/public/views/`

**Validaciones:**

```sql
-- Functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('cleanup_old_system_logs', ...);
-- Debe retornar: 7 filas

-- Views
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('assignment_submission_stats', 'classroom_overview', 'for');
-- Debe retornar: 3 filas
```

**Criterio de éxito:**
- 10 archivos SQL creados (nombres verificados)
- Sintaxis válida
- Objetos creables

**Tiempo estimado:** 90 minutos

---

#### SA-DB-032: Functions de Auth Management y Progress Tracking

**Responsabilidad:** Implementar 12 funciones de 2 schemas

**Objetos asignados (12):**

**auth_management (6):**
1. `assign_role_to_user`
2. `get_user_role`
3. `hash_token`
4. `remove_role_from_user`
5. `update_user_preferences`
6. `verify_user_permission`

**progress_tracking (6):**
7. `calculate_module_progress`
8. `check_mechanic_completion`
9. `get_classroom_analytics`
10. `get_user_progress`
11. `record_exercise_attempt`
12. `update_mission_progress`

**Tareas:**

1. Crear carpetas de funciones en ambos schemas
2. Copiar 12 archivos desde backup-ddl
3. Validar sintaxis PL/pgSQL
4. Crear `_MAP.md` en cada schema

**Rutas:**
- **Destino Auth:** `/.../schemas/auth_management/functions/`
- **Destino Progress:** `/.../schemas/progress_tracking/functions/`

**Validaciones:**

```sql
-- Auth Management
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'auth_management';
-- Debe retornar: 6 funciones

-- Progress Tracking
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'progress_tracking';
-- Debe retornar: 6 funciones
```

**Criterio de éxito:**
- 12 archivos SQL creados
- Sintaxis válida
- Funciones compilables

**Tiempo estimado:** 120 minutos

---

#### SA-DB-033: Views y Functions Restantes (Varios Schemas)

**Responsabilidad:** Implementar 10 objetos dispersos en 6 schemas diferentes

**Objetos asignados (10):**

**admin_dashboard (4 views):**
1. `moderation_queue`
2. `organization_stats_summary`
3. `recent_admin_actions`
4. `system_health_dashboard`

**audit_logging (1 function):**
5. `log_audit_event`

**auth (1 function):**
6. `get_current_user_id`

**educational_content (2 functions):**
7. `calculate_learning_path`
8. `get_recommended_missions`

**progress_tracking (1 view):**
9. `user_progress_summary`

**social_features (1 function):**
10. `cleanup_old_notifications`

**Tareas:**

1. Para cada schema:
   - Crear carpetas `functions/` o `views/` según corresponda
   - Copiar archivos desde fuentes respectivas
2. Validar sintaxis de cada objeto
3. Crear `_MAP.md` en cada carpeta

**Rutas:**
- **Destino Base:** `/.../schemas/{schema_name}/{functions|views}/`
- **Fuentes:** Según matriz-gaps (múltiples fuentes)

**Validaciones:**

```sql
-- Verificar views de admin_dashboard
SELECT table_name FROM information_schema.views
WHERE table_schema = 'admin_dashboard';
-- Debe retornar: 4 filas

-- Verificar funciones dispersas
SELECT routine_schema, routine_name
FROM information_schema.routines
WHERE (routine_schema = 'audit_logging' AND routine_name = 'log_audit_event')
   OR (routine_schema = 'auth' AND routine_name = 'get_current_user_id')
   OR (routine_schema = 'educational_content')
   OR (routine_schema = 'social_features' AND routine_name = 'cleanup_old_notifications');
-- Debe retornar: 6 funciones
```

**Criterio de éxito:**
- 10 archivos SQL creados en 6 schemas diferentes
- Carpetas organizadas correctamente
- Sintaxis válida
- Objetos creables

**Tiempo estimado:** 100 minutos

---

### Validación Final Microciclo 6

**Acciones post-implementación:**

1. **Contar objetos por tipo:**
   ```sql
   -- Functions
   SELECT routine_schema, COUNT(*)
   FROM information_schema.routines
   WHERE routine_type = 'FUNCTION'
   GROUP BY routine_schema;
   -- Esperado: +57 funciones

   -- Views
   SELECT table_schema, COUNT(*)
   FROM information_schema.views
   WHERE table_schema != 'information_schema'
   GROUP BY table_schema;
   -- Esperado: +12 vistas

   -- Materialized Views
   SELECT schemaname, COUNT(*)
   FROM pg_matviews
   GROUP BY schemaname;
   -- Esperado: +10 MVIEWs

   -- Types
   SELECT typnamespace::regnamespace, COUNT(*)
   FROM pg_type
   WHERE typtype = 'c'
   GROUP BY typnamespace;
   -- Esperado: +20 tipos
   ```

2. **Validar sintaxis PL/pgSQL:**
   ```bash
   # Intentar compilar todas las funciones
   psql -c "SELECT proname FROM pg_proc WHERE prokind = 'f'" \
   | xargs -I {} psql -c "SELECT pg_get_functiondef('{}'::regproc)"
   ```

3. **Verificar dependencias:**
   ```sql
   -- Detectar funciones con dependencias rotas
   SELECT p.proname, p.pronamespace::regnamespace as schema
   FROM pg_proc p
   WHERE p.prokind = 'f'
     AND NOT pg_function_is_visible(p.oid);
   -- Debe retornar: 0 filas
   ```

4. **Verificar MVIEWs refresheables:**
   ```sql
   DO $$
   DECLARE
     mv RECORD;
   BEGIN
     FOR mv IN SELECT schemaname, matviewname FROM pg_matviews LOOP
       EXECUTE format('REFRESH MATERIALIZED VIEW %I.%I', mv.schemaname, mv.matviewname);
       RAISE NOTICE 'Refreshed: %.%', mv.schemaname, mv.matviewname;
     END LOOP;
   END $$;
   ```

5. **Generar documentación:**
   - `FUNCTIONS_CATALOG.md`: Catálogo completo de funciones
   - `VIEWS_CATALOG.md`: Catálogo de vistas
   - `TYPES_CATALOG.md`: Catálogo de tipos

**Criterios de Paso al Microciclo 7:**

- ✅ 57 funciones creadas y compilables
- ✅ 12 vistas creables
- ✅ 20 tipos creados
- ✅ 10 MVIEWs creables y refresheables
- ✅ 0 dependencias rotas
- ✅ Sintaxis PL/pgSQL válida
- ✅ Documentación completa

**Tiempo total estimado Microciclo 6:** 10-14 horas

---

## MICROCICLO 7: Implementar P3 (92 objetos)

### Objetivos

- Implementar **72 triggers**
- Implementar **20 RLS policies**
- **Tiempo estimado:** 8-10 horas
- **Criterio de éxito:** 92 objetos funcionales, triggers operativos, RLS activo

### Estrategia de Implementación

1. **Orden de creación:**
   - Funciones de trigger primero (si no existen en P2)
   - Triggers después
   - RLS policies al final
2. **Validación intensiva:**
   - Verificar que funciones de trigger existen
   - Probar triggers con INSERT/UPDATE de prueba
   - Validar que RLS policies no bloquean acceso legítimo
3. **Organización:** Carpetas `triggers/` y `rls-policies/` en cada schema
4. **Ejecución paralela:** 8 subagentes

### Distribución de Schemas

- **public:** 41 triggers (solo triggers)
- **gamification_system:** 13 objetos (7 triggers + 6 policies)
- **social_features:** 11 objetos (5 triggers + 6 policies)
- **auth_management:** 7 objetos (6 triggers + 1 policy)
- **educational_content:** 6 objetos (4 triggers + 2 policies)
- **progress_tracking:** 5 objetos (3 triggers + 2 policies)
- **content_management:** 4 objetos (3 triggers + 1 policy)
- **system_configuration:** 3 objetos (2 triggers + 1 policy)
- **audit_logging:** 2 objetos (1 trigger + 1 policy)

### Subagentes Asignados

---

#### SA-DB-034 a SA-DB-037: Triggers de Public (41 triggers en 4 grupos)

**Estrategia de División:** Dividir 41 triggers en 4 subagentes (~11, 11, 11, 8)

**SA-DB-034:** Triggers de public (grupo 1/4) - 11 triggers
- Triggers 1-11 (alfabéticamente ordenados)
- Enfoque: triggers de tablas 'a' a 'c'

**SA-DB-035:** Triggers de public (grupo 2/4) - 11 triggers
- Triggers 12-22
- Enfoque: triggers de tablas 'd' a 'm'

**SA-DB-036:** Triggers de public (grupo 3/4) - 11 triggers
- Triggers 23-33
- Enfoque: triggers de tablas 'n' a 't'

**SA-DB-037:** Triggers de public (grupo 4/4) - 8 triggers
- Triggers 34-41
- Enfoque: triggers restantes (tablas 'u' a 'z')

**Tareas comunes para SA-DB-034 a SA-DB-037:**

1. Crear carpeta: `/.../schemas/public/triggers/`
2. Para cada trigger:
   - Verificar que existe función de trigger asociada (ej: `trg_updated_at_function`)
   - Si no existe función: copiar primero la función a `/functions/`
   - Copiar archivo trigger desde backup-ddl
   - Validar sintaxis CREATE TRIGGER
   - Verificar que tabla referenciada existe
3. Crear `_MAP.md` con lista de triggers
4. Crear `_TRIGGER_FUNCTIONS.md` listando funciones de trigger compartidas

**NOTA:** Muchos triggers usan funciones comunes como:
- `set_updated_at()`: Actualiza campo `updated_at`
- `log_change()`: Registra cambios en audit log
- `validate_data()`: Validaciones de negocio

**Rutas:**
- **Destino Triggers:** `/.../schemas/public/triggers/`
- **Destino Functions:** `/.../schemas/public/functions/` (si aplica)
- **Fuente:** `/.../backup-ddl/gamilit_platform/schemas/public/triggers/`

**Validaciones (cada subagente):**

```sql
-- Verificar triggers creados
SELECT tgname, tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgrelid::regclass::text LIKE 'public.%'
  AND tgname IN ('trg_achievements_updated_at', ...);
-- Debe retornar: 11 (o 8) filas según grupo

-- Verificar funciones de trigger
SELECT proname FROM pg_proc
WHERE proname LIKE '%_trigger%' OR proname LIKE 'trg_%';

-- Probar trigger (ejemplo)
UPDATE public.some_table SET updated_at = NOW() WHERE id = 1;
-- Verificar que trigger ejecutó correctamente
```

**Criterio de éxito (cada subagente):**
- Archivos SQL creados (11 o 8 según grupo)
- Funciones de trigger existen
- Triggers creables y ejecutables
- Sintaxis válida

**Tiempo estimado por subagente:** 75-90 minutos

---

#### SA-DB-038: Triggers y Policies de Gamification System

**Responsabilidad:** Implementar 13 objetos del schema gamification_system

**Objetos asignados (13):**

**Triggers (7):**
1. `missions_updated_at`
2. `notifications_updated_at`
3. `trg_achievements_updated_at`
4. `trg_comodines_updated_at`
5. `trg_inventory_transactions_updated_at`
6. `trg_user_stats_updated_at`
7. `trg_validate_achievement_reward`

**Policies (6):**
8. `achievements_all_admin`
9. `achievements_read_public`
10. `comodines_read_own`
11. `inventory_read_own`
12. `user_stats_read_own`
13. `user_stats_update_system`

**Tareas:**

1. Crear carpetas:
   - `/.../schemas/gamification_system/triggers/`
   - `/.../schemas/gamification_system/rls-policies/`
2. Implementar 7 triggers:
   - Verificar funciones de trigger
   - Copiar archivos
   - Validar sintaxis
3. Implementar 6 policies:
   - Verificar que tablas tienen RLS habilitado: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
   - Copiar archivos de policies
   - Validar sintaxis CREATE POLICY
4. Crear `_MAP.md` en cada carpeta
5. Crear `_RLS_ENABLED_TABLES.md` listando tablas con RLS activo

**Rutas:**
- **Destino Triggers:** `/.../schemas/gamification_system/triggers/`
- **Destino Policies:** `/.../schemas/gamification_system/rls-policies/`

**Validaciones:**

```sql
-- Triggers
SELECT tgname FROM pg_trigger
WHERE tgrelid::regclass::text LIKE 'gamification_system.%';
-- Debe retornar: 7 triggers

-- Policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'gamification_system';
-- Debe retornar: 6 policies

-- Verificar RLS habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'gamification_system' AND rowsecurity = true;
-- Debe incluir tablas con policies
```

**Criterio de éxito:**
- 7 triggers creados y funcionales
- 6 policies creadas
- RLS habilitado en tablas correspondientes
- Sintaxis válida

**Tiempo estimado:** 90-110 minutos

---

#### SA-DB-039: Triggers y Policies de Auth Management

**Responsabilidad:** Implementar 7 objetos del schema auth_management

**Objetos asignados (7):**

**Triggers (6):**
1. `trg_audit_profile_changes`
2. `trg_initialize_user_stats`
3. `trg_memberships_updated_at`
4. `trg_profiles_updated_at`
5. `trg_user_preferences_updated_at`
6. `trg_user_roles_updated_at`

**Policies (1):**
7. `profiles_read_own`

**Tareas:** Similares a SA-DB-038

**Rutas:**
- **Destino Triggers:** `/.../schemas/auth_management/triggers/`
- **Destino Policies:** `/.../schemas/auth_management/rls-policies/`

**Validaciones:**

```sql
-- Triggers
SELECT tgname FROM pg_trigger
WHERE tgrelid::regclass::text LIKE 'auth_management.%';
-- Debe retornar: 6 triggers

-- Policies
SELECT policyname FROM pg_policies
WHERE schemaname = 'auth_management';
-- Debe retornar: 1 policy (profiles_read_own)
```

**Criterio de éxito:**
- 6 triggers creados
- 1 policy creada
- RLS habilitado en tabla profiles
- Sintaxis válida

**Tiempo estimado:** 75 minutos

---

#### SA-DB-040: Triggers y Policies de Social Features y Educational Content

**Responsabilidad:** Implementar 17 objetos de 2 schemas

**Objetos asignados (17):**

**social_features (11):**
- **Triggers (5):**
  1. `trg_classroom_members_updated_at`
  2. `trg_classrooms_updated_at`
  3. `trg_schools_updated_at`
  4. `trg_teacher_notes_updated_at`
  5. `trg_validate_classroom_capacity`

- **Policies (6):**
  6. `classroom_members_manage_teacher`
  7. `classroom_members_read_student`
  8. `classrooms_read_student`
  9. `classrooms_write_teacher`
  10. `schools_read_all`
  11. `teacher_notes_manage_own`

**educational_content (6):**
- **Triggers (4):**
  12. `trg_assessment_rubrics_updated_at`
  13. `trg_exercises_updated_at`
  14. `trg_media_resources_updated_at`
  15. `trg_modules_updated_at`

- **Policies (2):**
  16. `exercises_all_admin`
  17. `modules_read_published`

**Tareas:**

1. Crear carpetas en ambos schemas (triggers/ y rls-policies/)
2. Implementar triggers y policies de social_features
3. Implementar triggers y policies de educational_content
4. Validar sintaxis
5. Crear documentación en cada carpeta

**Rutas:**
- **Destino Social:** `/.../schemas/social_features/{triggers|rls-policies}/`
- **Destino Educational:** `/.../schemas/educational_content/{triggers|rls-policies}/`

**Validaciones:**

```sql
-- Social features
SELECT 'triggers' as type, COUNT(*) FROM pg_trigger
WHERE tgrelid::regclass::text LIKE 'social_features.%'
UNION ALL
SELECT 'policies', COUNT(*) FROM pg_policies
WHERE schemaname = 'social_features';
-- Debe retornar: triggers=5, policies=6

-- Educational content
SELECT 'triggers' as type, COUNT(*) FROM pg_trigger
WHERE tgrelid::regclass::text LIKE 'educational_content.%'
UNION ALL
SELECT 'policies', COUNT(*) FROM pg_policies
WHERE schemaname = 'educational_content';
-- Debe retornar: triggers=4, policies=2
```

**Criterio de éxito:**
- 17 objetos creados (9 triggers + 8 policies)
- Sintaxis válida
- RLS habilitado en tablas con policies
- Triggers funcionales

**Tiempo estimado:** 120 minutos

---

#### SA-DB-041: Triggers y Policies Restantes (Varios Schemas)

**Responsabilidad:** Implementar 14 objetos dispersos en 4 schemas

**Objetos asignados (14):**

**audit_logging (2):**
- Trigger: `trg_system_alerts_updated_at`
- Policy: `audit_logs_select_admin`

**content_management (4):**
- Triggers (3):
  1. `trg_content_templates_updated_at`
  2. `trg_marie_curie_content_updated_at`
  3. `trg_media_files_updated_at`
- Policy: `marie_content_all_admin`

**progress_tracking (5):**
- Triggers (3):
  4. `exercise_submissions_updated_at`
  5. `trg_module_progress_updated_at`
  6. `trg_update_user_stats_on_exercise`
- Policies (2):
  7. `exercise_attempts_insert_own`
  8. `module_progress_read_own`

**system_configuration (3):**
- Triggers (2):
  9. `trg_feature_flags_updated_at`
  10. `trg_system_settings_updated_at`
- Policy: `system_settings_all_admin`

**Tareas:**

1. Para cada schema:
   - Crear carpetas triggers/ y rls-policies/ si no existen
   - Copiar archivos correspondientes
   - Validar sintaxis
2. Crear `_MAP.md` en cada carpeta
3. Documentar políticas de seguridad RLS

**Rutas:**
- **Destinos:** `/.../schemas/{schema_name}/{triggers|rls-policies}/`

**Validaciones:**

```sql
-- Verificar por schema
SELECT
  COALESCE(tg.schemaname, pol.schemaname) as schema,
  COUNT(DISTINCT tg.trigger_name) as triggers,
  COUNT(DISTINCT pol.policyname) as policies
FROM
  (SELECT n.nspname as schemaname, t.tgname as trigger_name
   FROM pg_trigger t
   JOIN pg_class c ON t.tgrelid = c.oid
   JOIN pg_namespace n ON c.relnamespace = n.oid) tg
FULL OUTER JOIN pg_policies pol
  ON tg.schemaname = pol.schemaname
WHERE COALESCE(tg.schemaname, pol.schemaname) IN
  ('audit_logging', 'content_management', 'progress_tracking', 'system_configuration')
GROUP BY COALESCE(tg.schemaname, pol.schemaname);
```

**Criterio de éxito:**
- 14 objetos creados (9 triggers + 5 policies)
- Sintaxis válida
- RLS configurado correctamente
- Triggers funcionales

**Tiempo estimado:** 90 minutos

---

### Validación Final Microciclo 7

**Acciones post-implementación:**

1. **Contar triggers totales:**
   ```sql
   SELECT n.nspname as schema, COUNT(*) as total_triggers
   FROM pg_trigger t
   JOIN pg_class c ON t.tgrelid = c.oid
   JOIN pg_namespace n ON c.relnamespace = n.oid
   WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
   GROUP BY n.nspname
   ORDER BY total_triggers DESC;
   -- Esperado: +72 triggers
   ```

2. **Contar policies totales:**
   ```sql
   SELECT schemaname, COUNT(*) as total_policies
   FROM pg_policies
   GROUP BY schemaname
   ORDER BY total_policies DESC;
   -- Esperado: +20 policies
   ```

3. **Verificar RLS habilitado:**
   ```sql
   SELECT schemaname, tablename
   FROM pg_tables
   WHERE rowsecurity = true
     AND schemaname NOT IN ('pg_catalog', 'information_schema')
   ORDER BY schemaname, tablename;
   -- Debe incluir todas las tablas con policies
   ```

4. **Probar triggers:**
   ```sql
   -- Crear tabla de prueba temporal
   CREATE TEMP TABLE trigger_test AS
   SELECT schemaname || '.' || tablename as full_table_name
   FROM pg_tables
   WHERE schemaname IN ('public', 'gamification_system', 'auth_management', etc.);

   -- Probar actualización (updated_at debería cambiar)
   DO $$
   DECLARE
     tbl RECORD;
   BEGIN
     FOR tbl IN SELECT full_table_name FROM trigger_test LOOP
       BEGIN
         EXECUTE format('UPDATE %s SET updated_at = updated_at WHERE false', tbl.full_table_name);
       EXCEPTION WHEN OTHERS THEN
         RAISE NOTICE 'Error en %: %', tbl.full_table_name, SQLERRM;
       END;
     END LOOP;
   END $$;
   ```

5. **Probar RLS policies:**
   ```sql
   -- Verificar que policies permiten acceso legítimo
   SET ROLE authenticated; -- o rol apropiado
   SELECT * FROM auth_management.profiles WHERE id = current_user_id() LIMIT 1;
   -- Debe retornar datos propios

   RESET ROLE;
   ```

6. **Generar documentación:**
   - `TRIGGERS_CATALOG.md`: Catálogo completo de triggers
   - `RLS_POLICIES_CATALOG.md`: Catálogo de políticas RLS
   - `SECURITY_MATRIX.md`: Matriz de seguridad por tabla y rol

**Criterios de Finalización Completa:**

- ✅ 72 triggers creados y funcionales
- ✅ 20 RLS policies creadas
- ✅ RLS habilitado en tablas correspondientes
- ✅ Triggers responden a eventos correctamente
- ✅ Policies permiten acceso autorizado y bloquean no autorizado
- ✅ 0 errores de ejecución
- ✅ Documentación completa

**Tiempo total estimado Microciclo 7:** 8-10 horas

---

## Gestión de Riesgos

### Riesgos por Microciclo

#### Microciclo 4 - Riesgos P0

**Riesgo 1:** ENUMs referenciados por tablas no existen aún
- **Probabilidad:** Media
- **Impacto:** Alto (bloquea creación de tablas)
- **Mitigación:** Implementar TODOS los ENUMs ANTES de crear tablas
- **Plan B:** Crear tablas sin constraints de ENUM, agregar constraints después

**Riesgo 2:** Tablas con dependencias circulares (foreign keys)
- **Probabilidad:** Baja
- **Impacto:** Alto
- **Mitigación:** Crear tablas sin FKs primero, luego `ALTER TABLE ADD CONSTRAINT`
- **Plan B:** Usar `SET CONSTRAINTS ALL DEFERRED`

**Riesgo 3:** Conflicto de nombres con objetos existentes
- **Probabilidad:** Baja (inventario ya validado)
- **Impacto:** Medio
- **Mitigación:** Verificar inventario destino antes de iniciar
- **Plan B:** Renombrar objeto existente con sufijo `_old`

**Riesgo 4:** Archivos fuente corruptos o no encontrados
- **Probabilidad:** Baja
- **Impacto:** Medio
- **Mitigación:** Validar que archivo fuente existe antes de copiar
- **Plan B:** Regenerar DDL desde base de datos fuente

---

#### Microciclo 5 - Riesgos P1

**Riesgo 1:** Tablas referenciadas por índices no existen
- **Probabilidad:** Media (si P0 no completó correctamente)
- **Impacto:** Alto (índices no se pueden crear)
- **Mitigación:** Validación obligatoria post-P0 antes de iniciar P1
- **Plan B:** Posponer índices de tablas faltantes a microciclo posterior

**Riesgo 2:** Índices duplicados (ya existen)
- **Probabilidad:** Baja
- **Impacto:** Bajo (solo genera warning)
- **Mitigación:** Usar `CREATE INDEX IF NOT EXISTS`
- **Plan B:** Ignorar error y continuar

**Riesgo 3:** Índices GIN/GIST con sintaxis incorrecta
- **Probabilidad:** Media
- **Impacto:** Medio
- **Mitigación:** Validar sintaxis de índices especiales antes de ejecutar
- **Plan B:** Corregir sintaxis manualmente

**Riesgo 4:** Creación de índices muy lenta (bloquea tablas grandes)
- **Probabilidad:** Alta
- **Impacto:** Medio (afecta performance)
- **Mitigación:** Usar `CREATE INDEX CONCURRENTLY` cuando sea posible
- **Plan B:** Ejecutar creación de índices en horario de baja actividad

---

#### Microciclo 6 - Riesgos P2

**Riesgo 1:** Funciones con dependencias de otras funciones no creadas
- **Probabilidad:** Alta
- **Impacto:** Alto
- **Mitigación:** Analizar dependencias y crear funciones en orden correcto
- **Plan B:** Crear funciones stub primero, luego reemplazar con implementación real

**Riesgo 2:** Sintaxis PL/pgSQL incompatible entre versiones de PostgreSQL
- **Probabilidad:** Media
- **Impacto:** Alto
- **Mitigación:** Verificar versión de PostgreSQL destino y ajustar sintaxis
- **Plan B:** Reescribir funciones con sintaxis compatible

**Riesgo 3:** TYPEs que en realidad son ENUMs (duplicados con P0)
- **Probabilidad:** Media (detectado en análisis)
- **Impacto:** Bajo
- **Mitigación:** Verificar cada TYPE antes de crear
- **Plan B:** Marcar como ya implementado en P0

**Riesgo 4:** Vistas materializadas con queries muy lentos
- **Probabilidad:** Media
- **Impacto:** Medio
- **Mitigación:** Crear MVIEWs vacías primero, refresh manual después
- **Plan B:** Convertir a vistas regulares temporalmente

**Riesgo 5:** Nombres de objetos inválidos (ej: "for", "CREATE")
- **Probabilidad:** Alta (ya detectado)
- **Impacto:** Alto
- **Mitigación:** Revisar y corregir nombres en fuente antes de implementar
- **Plan B:** Usar nombres quoted identifiers: `"for"`, `"CREATE"`

---

#### Microciclo 7 - Riesgos P3

**Riesgo 1:** Funciones de trigger no existen (no creadas en P2)
- **Probabilidad:** Media
- **Impacto:** Alto (triggers no se pueden crear)
- **Mitigación:** Verificar que funciones de trigger existen; crearlas si faltan
- **Plan B:** Crear función de trigger genérica primero

**Riesgo 2:** Triggers causan loops infinitos (trigger llama a trigger)
- **Probabilidad:** Baja
- **Impacto:** Crítico (puede corromper datos)
- **Mitigación:** Revisar lógica de triggers antes de activar
- **Plan B:** Deshabilitar triggers problemáticos: `ALTER TABLE ... DISABLE TRIGGER`

**Riesgo 3:** RLS policies bloquean acceso legítimo (demasiado restrictivas)
- **Probabilidad:** Media
- **Impacto:** Alto (aplicación no funciona)
- **Mitigación:** Probar policies con diferentes roles antes de activar
- **Plan B:** Deshabilitar RLS temporalmente: `ALTER TABLE ... DISABLE ROW LEVEL SECURITY`

**Riesgo 4:** RLS policies con performance deficiente
- **Probabilidad:** Media
- **Impacto:** Medio
- **Mitigación:** Crear índices específicos para policies
- **Plan B:** Simplificar lógica de policies

---

### Estrategias Globales de Mitigación

1. **Checkpoints entre fases:**
   - Validación completa al finalizar cada microciclo
   - No avanzar al siguiente hasta que todos los criterios se cumplan

2. **Rollback plan:**
   - Backup de base de datos antes de cada microciclo
   - Scripts de rollback preparados para cada tipo de objeto
   - Tiempo estimado de rollback: 15-30 minutos por microciclo

3. **Testing incremental:**
   - Probar objetos críticos inmediatamente después de crear
   - No esperar al final del microciclo para validar

4. **Documentación de problemas:**
   - Registrar todo error encontrado en `/orchestration/04-logs/microciclo-{N}-errores.log`
   - Incluir: timestamp, objeto, error, solución aplicada

5. **Comunicación:**
   - Cada subagente reporta progreso cada 30 minutos
   - Bloqueos o errores críticos se reportan inmediatamente

---

## Validaciones Obligatorias

### Validaciones Pre-Microciclo (antes de iniciar)

**Antes de Microciclo 4 (P0):**

```sql
-- Verificar que schemas existen
SELECT schema_name FROM information_schema.schemata
WHERE schema_name IN ('public', 'auth', 'auth_management',
                      'content_management', 'audit_logging',
                      'storage', 'system_configuration');
-- Debe retornar: 7 schemas

-- Verificar espacio en disco
SELECT pg_size_pretty(pg_database_size(current_database()));
-- Debe tener al menos 1GB libre
```

**Antes de Microciclo 5 (P1):**

```sql
-- Verificar que P0 completó (44 objetos)
SELECT
  (SELECT COUNT(*) FROM pg_type WHERE typtype = 'e') as enums,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema IN ('public', 'auth_management', 'content_management',
                          'audit_logging', 'system_configuration')) as tables;
-- Debe retornar: enums >= 27, tables >= 17 (más tablas existentes)
```

**Antes de Microciclo 6 (P2):**

```sql
-- Verificar que P1 completó (278 índices)
SELECT schemaname, COUNT(*) as indexes
FROM pg_indexes
WHERE schemaname IN ('public', 'auth_management', 'content_management',
                     'gamification_system', 'progress_tracking')
GROUP BY schemaname;
-- public debe tener ~268+ índices
```

**Antes de Microciclo 7 (P3):**

```sql
-- Verificar que P2 completó (99 objetos)
SELECT
  (SELECT COUNT(*) FROM information_schema.routines
   WHERE routine_type = 'FUNCTION') as functions,
  (SELECT COUNT(*) FROM information_schema.views) as views,
  (SELECT COUNT(*) FROM pg_matviews) as mviews,
  (SELECT COUNT(*) FROM pg_type WHERE typtype = 'c') as types;
-- Debe retornar: functions >= 57, views >= 12, mviews >= 10, types >= 20
```

---

### Validaciones Post-Microciclo (después de completar)

**Post-Microciclo 4:**

```sql
-- Archivo: /orchestration/05-validaciones/validacion-microciclo-4.sql

-- 1. Contar ENUMs creados
SELECT COUNT(*) as total_enums
FROM pg_type
WHERE typtype = 'e'
  AND typnamespace IN (
    SELECT oid FROM pg_namespace
    WHERE nspname IN ('public', 'auth', 'storage')
  );
-- Esperado: >= 27

-- 2. Contar tablas creadas
SELECT table_schema, COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema IN ('public', 'auth_management', 'content_management',
                       'audit_logging', 'system_configuration')
  AND table_type = 'BASE TABLE'
GROUP BY table_schema;
-- Esperado: total >= 17 (distribuidas)

-- 3. Verificar sintaxis de ENUMs
SELECT typname, array_agg(enumlabel ORDER BY enumsortorder) as values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typnamespace = 'public'::regnamespace
GROUP BY typname
LIMIT 5;
-- Debe retornar valores válidos

-- 4. Verificar que tablas tienen PKs
SELECT table_schema, table_name
FROM information_schema.tables t
WHERE table_schema IN ('public', 'auth_management', 'content_management')
  AND table_type = 'BASE TABLE'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.table_schema = t.table_schema
      AND tc.table_name = t.table_name
      AND tc.constraint_type = 'PRIMARY KEY'
  );
-- Debe retornar: 0 filas (todas tienen PK)

-- 5. Detectar errores de sintaxis
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname IN ('public', 'auth_management', 'content_management')
  AND NOT has_table_privilege(schemaname || '.' || tablename, 'SELECT');
-- Debe retornar: 0 filas
```

**Post-Microciclo 5:**

```sql
-- Archivo: /orchestration/05-validaciones/validacion-microciclo-5.sql

-- 1. Contar índices por schema
SELECT schemaname, COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname IN ('public', 'auth_management', 'content_management',
                     'gamification_system', 'progress_tracking')
GROUP BY schemaname
ORDER BY total_indexes DESC;
-- public debe tener >= 268

-- 2. Detectar índices duplicados
SELECT indexname, schemaname, COUNT(*)
FROM pg_indexes
GROUP BY indexname, schemaname
HAVING COUNT(*) > 1;
-- Debe retornar: 0 filas

-- 3. Verificar índices GIN
SELECT schemaname, indexname, indexdef
FROM pg_indexes
WHERE indexdef LIKE '%USING gin%';
-- Debe retornar índices GIN válidos

-- 4. Verificar que índices referencian tablas existentes
SELECT i.schemaname, i.indexname, i.tablename
FROM pg_indexes i
LEFT JOIN pg_tables t
  ON i.schemaname = t.schemaname AND i.tablename = t.tablename
WHERE t.tablename IS NULL;
-- Debe retornar: 0 filas

-- 5. Verificar tamaño de índices
SELECT schemaname, indexname, pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname IN ('public', 'gamification_system')
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 10;
-- Verificar que tamaños son razonables
```

**Post-Microciclo 6:**

```sql
-- Archivo: /orchestration/05-validaciones/validacion-microciclo-6.sql

-- 1. Contar funciones por schema
SELECT routine_schema, COUNT(*) as total_functions
FROM information_schema.routines
WHERE routine_type = 'FUNCTION'
  AND routine_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY routine_schema;
-- Esperado: >= 57 funciones totales

-- 2. Verificar funciones compilables
SELECT routine_schema, routine_name
FROM information_schema.routines r
WHERE routine_type = 'FUNCTION'
  AND NOT EXISTS (
    SELECT 1 FROM pg_proc p
    WHERE p.proname = r.routine_name
      AND p.pronamespace::regnamespace::text = r.routine_schema
  );
-- Debe retornar: 0 filas

-- 3. Verificar vistas
SELECT table_schema, COUNT(*) as total_views
FROM information_schema.views
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY table_schema;
-- Esperado: >= 12 vistas

-- 4. Verificar MVIEWs
SELECT schemaname, COUNT(*) as total_mviews
FROM pg_matviews
GROUP BY schemaname;
-- gamification_system debe tener ~10 MVIEWs

-- 5. Refrescar MVIEWs (validar que son refresheables)
DO $$
DECLARE
  mv RECORD;
  error_count INT := 0;
BEGIN
  FOR mv IN SELECT schemaname, matviewname FROM pg_matviews LOOP
    BEGIN
      EXECUTE format('REFRESH MATERIALIZED VIEW %I.%I', mv.schemaname, mv.matviewname);
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      RAISE WARNING 'Error refreshing %.%: %', mv.schemaname, mv.matviewname, SQLERRM;
    END;
  END LOOP;

  IF error_count > 0 THEN
    RAISE EXCEPTION '% MVIEWs failed to refresh', error_count;
  END IF;
END $$;
-- Debe completar sin errores

-- 6. Verificar tipos compuestos
SELECT typname, typtype
FROM pg_type
WHERE typtype = 'c'
  AND typnamespace = 'public'::regnamespace;
-- Esperado: >= 20 tipos (o verificar que son ENUMs en P0)
```

**Post-Microciclo 7:**

```sql
-- Archivo: /orchestration/05-validaciones/validacion-microciclo-7.sql

-- 1. Contar triggers por schema
SELECT n.nspname as schema, COUNT(*) as total_triggers
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND NOT t.tgisinternal
GROUP BY n.nspname;
-- Esperado: >= 72 triggers

-- 2. Contar policies por schema
SELECT schemaname, COUNT(*) as total_policies
FROM pg_policies
GROUP BY schemaname;
-- Esperado: >= 20 policies

-- 3. Verificar RLS habilitado en tablas con policies
SELECT DISTINCT p.schemaname, p.tablename, t.rowsecurity
FROM pg_policies p
LEFT JOIN pg_tables t ON p.schemaname = t.schemaname AND p.tablename = t.tablename
WHERE t.rowsecurity = false OR t.rowsecurity IS NULL;
-- Debe retornar: 0 filas (RLS habilitado en todas)

-- 4. Verificar funciones de trigger existen
SELECT DISTINCT
  n.nspname as schema,
  p.proname as trigger_function
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE NOT EXISTS (
  SELECT 1 FROM pg_proc WHERE oid = p.oid
);
-- Debe retornar: 0 filas

-- 5. Probar triggers (updated_at)
CREATE TEMP TABLE trigger_test_results (
  schema_name TEXT,
  table_name TEXT,
  trigger_works BOOLEAN,
  error_message TEXT
);

DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN ('public', 'gamification_system', 'auth_management')
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = schemaname
          AND table_name = tablename
          AND column_name = 'updated_at'
      )
  LOOP
    BEGIN
      -- Intentar update (sin realmente modificar datos)
      EXECUTE format('UPDATE %I.%I SET updated_at = updated_at WHERE false',
                     tbl.schemaname, tbl.tablename);

      INSERT INTO trigger_test_results VALUES (tbl.schemaname, tbl.tablename, true, NULL);
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO trigger_test_results VALUES (tbl.schemaname, tbl.tablename, false, SQLERRM);
    END;
  END LOOP;
END $$;

SELECT * FROM trigger_test_results WHERE NOT trigger_works;
-- Debe retornar: 0 filas (todos los triggers funcionan)

-- 6. Probar RLS policies (acceso legítimo)
SET ROLE authenticated; -- Ajustar según rol configurado

SELECT schemaname, tablename, COUNT(*) as rows_accessible
FROM (
  SELECT 'auth_management' as schemaname, 'profiles' as tablename,
         (SELECT COUNT(*) FROM auth_management.profiles LIMIT 1) as cnt
  UNION ALL
  SELECT 'gamification_system', 'user_stats',
         (SELECT COUNT(*) FROM gamification_system.user_stats LIMIT 1)
  -- Agregar más tablas según policies
) subq
GROUP BY schemaname, tablename;

RESET ROLE;
-- Verificar que queries no fallan (RLS permite acceso)
```

---

### Métricas a Medir

**Al finalizar cada microciclo:**

1. **Completitud:**
   ```
   % Completitud = (Objetos implementados / Objetos totales) * 100
   ```

2. **Tasa de éxito:**
   ```
   % Éxito = (Objetos sin errores / Objetos implementados) * 100
   ```

3. **Tiempo de implementación:**
   ```
   Tiempo promedio por objeto = Tiempo total / Objetos implementados
   ```

4. **Errores encontrados:**
   ```
   Tasa de errores = (Objetos con errores / Objetos implementados) * 100
   ```

5. **Cobertura de validación:**
   ```
   % Cobertura = (Objetos validados / Objetos implementados) * 100
   ```

**Métricas objetivo:**

- Completitud: 100%
- Tasa de éxito: >= 95%
- Tiempo promedio por objeto: <= 15 minutos
- Tasa de errores: <= 5%
- Cobertura de validación: 100%

---

## Cronograma Propuesto

### Calendario de Ejecución

| Día | Microciclo | Prioridad | Objetos | Subagentes | Inicio | Fin | Duración |
|-----|------------|-----------|---------|------------|--------|-----|----------|
| **1** | **4** | P0 | 44 | 6 | 09:00 | 14:00 | 5h |
| 1 | - | *Validación M4* | - | - | 14:00 | 15:00 | 1h |
| **2** | **5** | P1 | 278 | 10 | 09:00 | 17:00 | 8h |
| 2 | - | *Validación M5* | - | - | 17:00 | 18:00 | 1h |
| **3** | **6 (parte 1)** | P2 | 50 | 10 | 09:00 | 16:00 | 7h |
| **4** | **6 (parte 2)** | P2 | 49 | 10 | 09:00 | 16:00 | 7h |
| 4 | - | *Validación M6* | - | - | 16:00 | 18:00 | 2h |
| **5** | **7** | P3 | 92 | 8 | 09:00 | 17:00 | 8h |
| 5 | - | *Validación M7* | - | - | 17:00 | 19:00 | 2h |
| **5** | - | **Validación Final** | - | - | 19:00 | 20:00 | 1h |

### Detalle por Día

**DÍA 1: Microciclo 4 (P0)**
- 09:00-09:30: Setup inicial, verificación de rutas fuente
- 09:30-10:30: SA-DB-008 implementa 24 ENUMs de public
- 09:30-10:00: SA-DB-010 implementa 3 ENUMs de auth/storage
- 10:30-12:00: SA-DB-009 implementa 10 tablas de public
- 10:30-11:30: SA-DB-011 implementa 3 tablas de auth_management
- 10:30-11:30: SA-DB-012 implementa 3 tablas de content_mgmt/audit
- 11:30-12:00: SA-DB-013 implementa 1 tabla de system_configuration
- 12:00-13:00: Validación parcial, corrección de errores
- 13:00-14:00: Validación final, actualización de inventario
- 14:00-15:00: **Validación obligatoria M4, checkpoint**

**DÍA 2: Microciclo 5 (P1)**
- 09:00-09:30: Verificación pre-P1, confirmación P0 completo
- 09:30-11:30: SA-DB-014 a SA-DB-021 (8 subagentes) implementan 268 índices de public
- 09:30-10:30: SA-DB-022 implementa 6 índices multi-schema
- 09:30-10:30: SA-DB-023 implementa 4 índices restantes
- 11:30-13:00: Continuación implementación (índices grandes)
- 13:00-14:00: Validación parcial
- 14:00-17:00: Creación de índices CONCURRENTLY (no bloquear tablas)
- 17:00-18:00: **Validación obligatoria M5, checkpoint**

**DÍA 3: Microciclo 6 - Parte 1 (P2)**
- 09:00-09:30: Verificación pre-P2, confirmación P1 completo
- 09:30-11:30: SA-DB-024, SA-DB-025 implementan 20 functions gamification
- 09:30-11:00: SA-DB-028, SA-DB-029 implementan 13 functions gamilit
- 09:30-11:00: SA-DB-030 implementa 20 types de public
- 11:00-13:00: Continuación funciones, validación sintaxis PL/pgSQL
- 13:00-14:00: SA-DB-026 implementa 10 MVIEWs gamification
- 14:00-16:00: Validación parcial, corrección de errores de compilación
- 16:00-17:00: Buffer para resolver dependencias

**DÍA 4: Microciclo 6 - Parte 2 (P2)**
- 09:00-10:00: SA-DB-027 implementa 4 views gamification
- 09:00-11:00: SA-DB-031 implementa 10 functions/views de public
- 09:00-11:00: SA-DB-032 implementa 12 functions auth_mgmt/progress
- 09:00-11:00: SA-DB-033 implementa 10 objetos multi-schema
- 11:00-14:00: Validación de todas las funciones, vistas, MVIEWs
- 14:00-16:00: Refresh de MVIEWs, validación de queries
- 16:00-18:00: **Validación obligatoria M6, checkpoint extendido**

**DÍA 5: Microciclo 7 (P3) y Validación Final**
- 09:00-09:30: Verificación pre-P3, confirmación P2 completo
- 09:30-11:30: SA-DB-034 a SA-DB-037 (4 subagentes) implementan 41 triggers de public
- 09:30-11:00: SA-DB-038 implementa 13 triggers/policies gamification
- 09:30-11:00: SA-DB-039 implementa 7 triggers/policies auth_mgmt
- 11:00-13:00: SA-DB-040 implementa 17 triggers/policies social/educational
- 11:00-13:00: SA-DB-041 implementa 14 triggers/policies multi-schema
- 13:00-15:00: Validación de triggers, pruebas de ejecución
- 15:00-17:00: Validación de RLS policies, pruebas de seguridad
- 17:00-19:00: **Validación obligatoria M7, checkpoint**
- 19:00-20:00: **Validación final global, generación de reportes**

---

### Hitos Clave

**Hito 1: Fundamentos Completados (Día 1, 15:00)**
- ✅ 44 objetos P0 implementados
- ✅ ENUMs y tablas base disponibles
- ✅ Validación exitosa

**Hito 2: Performance Optimizado (Día 2, 18:00)**
- ✅ 278 índices creados
- ✅ Queries optimizadas
- ✅ Validación exitosa

**Hito 3: Lógica de Negocio Implementada (Día 4, 18:00)**
- ✅ 99 objetos P2 implementados
- ✅ Funciones, vistas, types operativos
- ✅ Validación exhaustiva completada

**Hito 4: Seguridad y Auditoría Activa (Día 5, 19:00)**
- ✅ 92 objetos P3 implementados
- ✅ Triggers y RLS policies funcionales
- ✅ Validación de seguridad exitosa

**Hito Final: Migración Completa (Día 5, 20:00)**
- ✅ 513 objetos implementados (100%)
- ✅ 0 errores críticos
- ✅ Todas las validaciones pasadas
- ✅ Documentación actualizada
- ✅ Sistema listo para producción

---

## Criterios de Éxito Global

### Criterios Técnicos

1. **Completitud:**
   - ✅ 513 objetos implementados (44 P0 + 278 P1 + 99 P2 + 92 P3)
   - ✅ Porcentaje de completitud: 100%
   - ✅ 0 objetos faltantes en matriz de gaps

2. **Calidad:**
   - ✅ 0 errores de sintaxis SQL
   - ✅ 0 errores de compilación PL/pgSQL
   - ✅ 0 dependencias rotas
   - ✅ 0 índices duplicados
   - ✅ 0 triggers con loops infinitos

3. **Performance:**
   - ✅ Todos los índices creados CONCURRENTLY
   - ✅ MVIEWs refresheables en <5 minutos
   - ✅ Queries de validación responden en <2 segundos

4. **Seguridad:**
   - ✅ RLS habilitado en todas las tablas con policies
   - ✅ Policies permiten acceso autorizado
   - ✅ Policies bloquean acceso no autorizado
   - ✅ 0 vulnerabilidades de seguridad detectadas

5. **Organización:**
   - ✅ Archivos en carpetas correctas (enums/, tables/, indexes/, etc.)
   - ✅ Nomenclatura consistente
   - ✅ Documentación _MAP.md completa en cada carpeta
   - ✅ Rutas absolutas documentadas

### Criterios de Validación

6. **Validaciones SQL:**
   - ✅ Todas las queries de validación post-microciclo pasan
   - ✅ Recuento de objetos coincide con esperado
   - ✅ Sintaxis validada en PostgreSQL destino

7. **Validaciones Funcionales:**
   - ✅ Triggers responden a eventos (INSERT/UPDATE/DELETE)
   - ✅ Funciones ejecutables sin errores
   - ✅ Vistas retornan datos correctos
   - ✅ MVIEWs refresheables sin errores
   - ✅ RLS policies funcionan correctamente

8. **Validaciones de Inventario:**
   - ✅ Inventario destino actualizado
   - ✅ Matriz de gaps recalculada: 0 objetos faltantes
   - ✅ Porcentaje de completitud actualizado a 100%

### Criterios de Documentación

9. **Documentación Técnica:**
   - ✅ _MAP.md creado en cada carpeta de schema
   - ✅ CATALOG.md generado para funciones, vistas, triggers
   - ✅ SECURITY_MATRIX.md documenta RLS policies
   - ✅ Índices documentados por tabla

10. **Logs y Trazabilidad:**
    - ✅ Logs de ejecución por cada subagente
    - ✅ Errores registrados con timestamp y solución
    - ✅ Métricas de tiempo y éxito registradas
    - ✅ Reporte final de implementación generado

### Criterios de Entrega

11. **Estructura de Directorios:**
    ```
    /apps/database/ddl/schemas/
    ├── public/
    │   ├── enums/
    │   │   ├── _MAP.md
    │   │   └── *.sql (24 archivos)
    │   ├── tables/
    │   │   ├── _MAP.md
    │   │   └── *.sql (10 archivos)
    │   ├── indexes/
    │   │   ├── _MAP.md
    │   │   └── *.sql (268 archivos)
    │   ├── functions/
    │   ├── views/
    │   ├── types/
    │   └── triggers/
    ├── gamification_system/
    │   ├── functions/
    │   ├── views/
    │   ├── materialized-views/
    │   ├── indexes/
    │   ├── triggers/
    │   └── rls-policies/
    └── [otros schemas...]
    ```

12. **Reportes Finales:**
    - ✅ `REPORTE-IMPLEMENTACION-COMPLETA.md` generado
    - ✅ `METRICAS-FINALES.json` con estadísticas
    - ✅ `OBJETOS-IMPLEMENTADOS.csv` con lista completa
    - ✅ `VALIDACION-FINAL.log` con resultados de todas las validaciones

---

## Rutas de Referencia

### Rutas Fuente

**Fuente Principal (backup-ddl):**
```
/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/
├── auth/
├── auth_management/
├── audit_logging/
├── content_management/
├── educational_content/
├── gamification_system/
├── gamilit/
├── progress_tracking/
├── social_features/
└── system_configuration/
```

**Fuentes Alternativas:**
- SA-DB-002, SA-DB-003, SA-DB-004, SA-DB-005 (ver matriz-gaps.json para rutas específicas)
- Migraciones: `/home/isem/workspace/projects/glit/database/migrations/`

### Rutas Destino

**Destino Principal (proyecto gamilit):**
```
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/
├── public/ (crear)
├── auth/ (existe)
├── auth_management/ (existe)
├── audit_logging/ (existe)
├── content_management/ (existe)
├── educational_content/ (existe)
├── gamification_system/ (existe)
├── gamilit/ (crear)
├── progress_tracking/ (existe)
├── social_features/ (existe)
├── storage/ (crear)
├── system_configuration/ (existe)
└── admin_dashboard/ (crear)
```

### Rutas de Orchestration

**Planificación y Control:**
```
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/
├── 02-planes/
│   ├── PLAN-IMPLEMENTACION-OBJETOS-FALTANTES.md (este documento)
│   └── asignaciones-detalladas.json
├── 04-logs/
│   ├── microciclo-4-ejecucion.log
│   ├── microciclo-5-ejecucion.log
│   ├── microciclo-6-ejecucion.log
│   └── microciclo-7-ejecucion.log
├── 05-validaciones/
│   ├── validacion-microciclo-4.sql
│   ├── validacion-microciclo-5.sql
│   ├── validacion-microciclo-6.sql
│   └── validacion-microciclo-7.sql
├── analisis/
│   └── matriz-gaps.json (fuente de verdad)
└── inventarios/
    ├── inventario-destino-pre-migracion.json
    └── inventario-destino-post-migracion.json
```

---

## Instrucciones de Uso

### Para el Coordinador (Orquestador)

1. **Antes de iniciar:**
   - Revisar este plan completo
   - Validar que todas las rutas fuente existen
   - Crear backup de base de datos destino
   - Ejecutar validaciones pre-microciclo 4

2. **Durante ejecución:**
   - Asignar subagentes según este plan
   - Monitorear progreso cada 30 minutos
   - Ejecutar validaciones al finalizar cada microciclo
   - Registrar métricas y errores en logs

3. **Al finalizar:**
   - Ejecutar validación final global
   - Generar reportes de implementación
   - Actualizar inventario destino
   - Recalcular matriz de gaps

### Para Subagentes

1. **Leer sección específica asignada** en este plan
2. **Verificar rutas fuente y destino** antes de copiar
3. **Seguir tareas paso a paso** según instrucciones
4. **Validar cada objeto** antes de marcarlo como completo
5. **Reportar errores inmediatamente** al coordinador
6. **Actualizar _MAP.md** en carpeta correspondiente
7. **Ejecutar validaciones SQL** listadas en su sección

### Comandos Útiles

**Crear backup antes de iniciar:**
```bash
pg_dump -Fc -f backup_pre_migracion_$(date +%Y%m%d_%H%M%S).dump gamilit_db
```

**Validar sintaxis SQL sin ejecutar:**
```bash
psql -f archivo.sql --set=ON_ERROR_STOP=on --dry-run
```

**Contar objetos por tipo:**
```bash
find schemas/ -name "*.sql" | xargs grep -l "CREATE TABLE" | wc -l
find schemas/ -name "*.sql" | xargs grep -l "CREATE INDEX" | wc -l
```

**Ejecutar validaciones:**
```bash
psql -f /orchestration/05-validaciones/validacion-microciclo-4.sql > validacion-m4.log
```

---

## Notas Finales

### Consideraciones Importantes

1. **Nombres Sospechosos:**
   - `public.for` (tabla) - Verificar si nombre es correcto o error de extracción
   - `CREATE` (MVIEW) - Palabra reservada, probablemente error
   - `99-refresh-schedule` (MVIEW) - Verificar sintaxis
   - Revisar estos objetos en fuente antes de implementar

2. **Tipos vs ENUMs:**
   - Algunos objetos en P2 listados como TYPEs podrían ser ENUMs ya implementados en P0
   - Verificar en fuente para evitar duplicados

3. **Performance:**
   - Creación de 268 índices en public puede tomar varias horas
   - Usar `CREATE INDEX CONCURRENTLY` cuando sea posible
   - Considerar ejecutar en horario de baja actividad

4. **Seguridad:**
   - RLS policies pueden bloquear acceso si no se configuran correctamente
   - Probar exhaustivamente antes de activar en producción
   - Mantener acceso de superusuario para emergencias

5. **Dependencias:**
   - Funciones pueden depender de otras funciones (analizar antes de crear)
   - Triggers dependen de funciones de trigger (crear funciones primero)
   - Vistas pueden depender de otras vistas (verificar orden)

### Próximos Pasos Después de Implementación

1. **Testing Funcional:**
   - Probar aplicación completa con objetos nuevos
   - Ejecutar suite de tests automatizados
   - Validar que features funcionan correctamente

2. **Optimización:**
   - Analizar performance de queries con nuevos índices
   - Ajustar MVIEWs refresh schedule
   - Optimizar funciones lentas

3. **Documentación:**
   - Generar documentación de API de funciones
   - Documentar políticas de seguridad RLS
   - Actualizar diagramas de base de datos

4. **Monitoreo:**
   - Configurar alertas para triggers fallidos
   - Monitorear uso de índices (detectar índices no usados)
   - Revisar logs de errores de RLS

---

**FIN DEL PLAN DE IMPLEMENTACIÓN**

---

**Aprobaciones:**

- [ ] Coordinador General: ________________ Fecha: ________
- [ ] Líder de Base de Datos: ________________ Fecha: ________
- [ ] Arquitecto de Software: ________________ Fecha: ________

**Historial de Cambios:**

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-02 | SA-DB-007 | Creación inicial del plan |

---
