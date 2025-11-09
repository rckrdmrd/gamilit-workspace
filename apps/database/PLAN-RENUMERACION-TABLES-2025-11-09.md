# Plan de Renumeración de Tables

**Fecha:** 2025-11-09
**Objetivo:** Numerar 30 archivos de tables sin numeración y corregir gaps
**Esfuerzo:** 1-2 días
**Prioridad:** ALTA

---

## Resumen

- **Archivos sin numerar:** 30
- **Gaps a corregir:** 2 (auth_management, social_features)
- **Total operaciones:** 36 renombrados

---

## 1. Corrección de Gaps (6 archivos)

### 1.1. auth_management/tables

**Problema:** Secuencia 01-12, luego 14-16 (falta 13)

```bash
# Renombrar en orden inverso para evitar conflictos
mv 16-parent_notifications.sql 15-parent_notifications.sql
mv 15-parent_student_links.sql 14-parent_student_links.sql
mv 14-parent_accounts.sql 13-parent_accounts.sql
```

**Resultado:** Secuencia 01-15 continua

### 1.2. social_features/tables

**Problema:** Secuencia 01-07, luego 11-13 (faltan 08-10)

```bash
# Renombrar en orden inverso
mv 13-challenge_results.sql 10-challenge_results.sql
mv 12-challenge_participants.sql 09-challenge_participants.sql
mv 11-peer_challenges.sql 08-peer_challenges.sql
```

**Resultado:** Secuencia 01-10 continua

---

## 2. Numeración de Tables Sin Numerar (30 archivos)

### 2.1. content_management/tables (3 archivos)

**Estado actual:**
- 01-05: Numerados ✓
- Sin numerar: 3

**Plan:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/tables

# Analizar dependencias primero
# Verificar FKs en cada archivo

# Renombrar según orden lógico
mv content_categories.sql 06-content_categories.sql
mv content_authors.sql 07-content_authors.sql
mv media_metadata.sql 08-media_metadata.sql
```

**Criterio de orden:**
- 06: Categories (referencia base)
- 07: Authors (puede referenciar users)
- 08: Media metadata (puede referenciar media_files)

---

### 2.2. educational_content/tables (11 archivos)

**Estado actual:**
- 01-04: Numerados ✓
- Sin numerar: 11

**Plan:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/tables

# GRUPO 1: Core educativo (continúa después de media_resources)
mv module_dependencies.sql 05-module_dependencies.sql
mv taxonomies.sql 06-taxonomies.sql
mv content_metadata.sql 07-content_metadata.sql
mv content_tags.sql 08-content_tags.sql
mv content_approvals.sql 09-content_approvals.sql

# GRUPO 2: Exercises detalle
mv exercise_options.sql 10-exercise_options.sql
mv exercise_answers.sql 11-exercise_answers.sql

# GRUPO 3: Assignments (dependen de exercises)
mv assignments.sql 12-assignments.sql
mv assignment_exercises.sql 13-assignment_exercises.sql
mv assignment_students.sql 14-assignment_students.sql
mv assignment_submissions.sql 15-assignment_submissions.sql
```

**Criterio de orden:**
1. **05-09:** Metadata y estructura (dependencies, taxonomies, tags, approvals)
2. **10-11:** Ejercicios detalle (options, answers)
3. **12-15:** Assignments (dependen de ejercicios y estudiantes)

**Dependencias clave:**
- `assignments` → `exercises`, `classrooms`
- `assignment_exercises` → `assignments`, `exercises`
- `assignment_students` → `assignments`, `profiles`
- `assignment_submissions` → `assignments`, `assignment_students`

---

### 2.3. progress_tracking/tables (8 archivos)

**Estado actual:**
- 01-05: Numerados ✓
- Sin numerar: 8

**Plan:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/tables

# GRUPO 1: Learning paths (estructura)
mv learning_paths.sql 06-learning_paths.sql
mv user_learning_paths.sql 07-user_learning_paths.sql

# GRUPO 2: Tracking avanzado
mv mastery_tracking.sql 08-mastery_tracking.sql
mv module_completion_tracking.sql 09-module_completion_tracking.sql
mv skill_assessments.sql 10-skill_assessments.sql

# GRUPO 3: Métricas y notas
mv engagement_metrics.sql 11-engagement_metrics.sql
mv progress_snapshots.sql 12-progress_snapshots.sql
mv teacher_notes.sql 13-teacher_notes.sql
```

**Criterio de orden:**
1. **06-07:** Learning paths (base)
2. **08-10:** Tracking específico (mastery, completion, skills)
3. **11-13:** Métricas y observaciones (engagement, snapshots, notes)

---

### 2.4. social_features/tables (5 archivos)

**Estado actual:**
- 01-07: Numerados ✓
- 08-10: Renumerados de 11-13 ✓
- Sin numerar: 5

**Plan:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/tables

# GRUPO 1: Social interactions
mv social_interactions.sql 11-social_interactions.sql
mv user_follows.sql 12-user_follows.sql
mv discussion_threads.sql 13-discussion_threads.sql

# GRUPO 2: Classroom management
mv teacher_classrooms.sql 14-teacher_classrooms.sql
mv assignment_classrooms.sql 15-assignment_classrooms.sql
```

**Criterio de orden:**
1. **11-13:** Interacciones sociales generales
2. **14-15:** Gestión de classrooms por roles

---

### 2.5. system_configuration/tables (3 archivos)

**Estado actual:**
- 01-03: Numerados ✓
- Sin numerar: 3

**Plan:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/system_configuration/tables

# Orden por scope
mv environment_config.sql 04-environment_config.sql
mv tenant_configurations.sql 05-tenant_configurations.sql
mv api_configuration.sql 06-api_configuration.sql
```

**Criterio de orden:**
1. **04:** Environment (global)
2. **05:** Tenant (por cliente)
3. **06:** API (específico)

---

## 3. Script de Ejecución

### 3.1. Script Completo (Bash)

```bash
#!/bin/bash

BASE_DIR="/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas"

echo "============================================"
echo "RENUMERACIÓN DE TABLES - FASE 1: GAPS"
echo "============================================"
echo ""

# --- FASE 1: Corregir Gaps ---

echo "1. Corrigiendo gap en auth_management..."
cd "$BASE_DIR/auth_management/tables"
[ -f "16-parent_notifications.sql" ] && mv 16-parent_notifications.sql 15-parent_notifications.sql && echo "  ✓ 16→15: parent_notifications"
[ -f "15-parent_student_links.sql" ] && mv 15-parent_student_links.sql 14-parent_student_links.sql && echo "  ✓ 15→14: parent_student_links"
[ -f "14-parent_accounts.sql" ] && mv 14-parent_accounts.sql 13-parent_accounts.sql && echo "  ✓ 14→13: parent_accounts"
echo ""

echo "2. Corrigiendo gap en social_features..."
cd "$BASE_DIR/social_features/tables"
[ -f "13-challenge_results.sql" ] && mv 13-challenge_results.sql 10-challenge_results.sql && echo "  ✓ 13→10: challenge_results"
[ -f "12-challenge_participants.sql" ] && mv 12-challenge_participants.sql 09-challenge_participants.sql && echo "  ✓ 12→09: challenge_participants"
[ -f "11-peer_challenges.sql" ] && mv 11-peer_challenges.sql 08-peer_challenges.sql && echo "  ✓ 11→08: peer_challenges"
echo ""

echo "============================================"
echo "FASE 2: NUMERAR ARCHIVOS SIN NUMERACIÓN"
echo "============================================"
echo ""

# --- FASE 2: Numerar archivos ---

echo "3. Numerando content_management (3 archivos)..."
cd "$BASE_DIR/content_management/tables"
[ -f "content_categories.sql" ] && mv content_categories.sql 06-content_categories.sql && echo "  ✓ 06: content_categories"
[ -f "content_authors.sql" ] && mv content_authors.sql 07-content_authors.sql && echo "  ✓ 07: content_authors"
[ -f "media_metadata.sql" ] && mv media_metadata.sql 08-media_metadata.sql && echo "  ✓ 08: media_metadata"
echo ""

echo "4. Numerando educational_content (11 archivos)..."
cd "$BASE_DIR/educational_content/tables"
[ -f "module_dependencies.sql" ] && mv module_dependencies.sql 05-module_dependencies.sql && echo "  ✓ 05: module_dependencies"
[ -f "taxonomies.sql" ] && mv taxonomies.sql 06-taxonomies.sql && echo "  ✓ 06: taxonomies"
[ -f "content_metadata.sql" ] && mv content_metadata.sql 07-content_metadata.sql && echo "  ✓ 07: content_metadata"
[ -f "content_tags.sql" ] && mv content_tags.sql 08-content_tags.sql && echo "  ✓ 08: content_tags"
[ -f "content_approvals.sql" ] && mv content_approvals.sql 09-content_approvals.sql && echo "  ✓ 09: content_approvals"
[ -f "exercise_options.sql" ] && mv exercise_options.sql 10-exercise_options.sql && echo "  ✓ 10: exercise_options"
[ -f "exercise_answers.sql" ] && mv exercise_answers.sql 11-exercise_answers.sql && echo "  ✓ 11: exercise_answers"
[ -f "assignments.sql" ] && mv assignments.sql 12-assignments.sql && echo "  ✓ 12: assignments"
[ -f "assignment_exercises.sql" ] && mv assignment_exercises.sql 13-assignment_exercises.sql && echo "  ✓ 13: assignment_exercises"
[ -f "assignment_students.sql" ] && mv assignment_students.sql 14-assignment_students.sql && echo "  ✓ 14: assignment_students"
[ -f "assignment_submissions.sql" ] && mv assignment_submissions.sql 15-assignment_submissions.sql && echo "  ✓ 15: assignment_submissions"
echo ""

echo "5. Numerando progress_tracking (8 archivos)..."
cd "$BASE_DIR/progress_tracking/tables"
[ -f "learning_paths.sql" ] && mv learning_paths.sql 06-learning_paths.sql && echo "  ✓ 06: learning_paths"
[ -f "user_learning_paths.sql" ] && mv user_learning_paths.sql 07-user_learning_paths.sql && echo "  ✓ 07: user_learning_paths"
[ -f "mastery_tracking.sql" ] && mv mastery_tracking.sql 08-mastery_tracking.sql && echo "  ✓ 08: mastery_tracking"
[ -f "module_completion_tracking.sql" ] && mv module_completion_tracking.sql 09-module_completion_tracking.sql && echo "  ✓ 09: module_completion_tracking"
[ -f "skill_assessments.sql" ] && mv skill_assessments.sql 10-skill_assessments.sql && echo "  ✓ 10: skill_assessments"
[ -f "engagement_metrics.sql" ] && mv engagement_metrics.sql 11-engagement_metrics.sql && echo "  ✓ 11: engagement_metrics"
[ -f "progress_snapshots.sql" ] && mv progress_snapshots.sql 12-progress_snapshots.sql && echo "  ✓ 12: progress_snapshots"
[ -f "teacher_notes.sql" ] && mv teacher_notes.sql 13-teacher_notes.sql && echo "  ✓ 13: teacher_notes"
echo ""

echo "6. Numerando social_features (5 archivos)..."
cd "$BASE_DIR/social_features/tables"
[ -f "social_interactions.sql" ] && mv social_interactions.sql 11-social_interactions.sql && echo "  ✓ 11: social_interactions"
[ -f "user_follows.sql" ] && mv user_follows.sql 12-user_follows.sql && echo "  ✓ 12: user_follows"
[ -f "discussion_threads.sql" ] && mv discussion_threads.sql 13-discussion_threads.sql && echo "  ✓ 13: discussion_threads"
[ -f "teacher_classrooms.sql" ] && mv teacher_classrooms.sql 14-teacher_classrooms.sql && echo "  ✓ 14: teacher_classrooms"
[ -f "assignment_classrooms.sql" ] && mv assignment_classrooms.sql 15-assignment_classrooms.sql && echo "  ✓ 15: assignment_classrooms"
echo ""

echo "7. Numerando system_configuration (3 archivos)..."
cd "$BASE_DIR/system_configuration/tables"
[ -f "environment_config.sql" ] && mv environment_config.sql 04-environment_config.sql && echo "  ✓ 04: environment_config"
[ -f "tenant_configurations.sql" ] && mv tenant_configurations.sql 05-tenant_configurations.sql && echo "  ✓ 05: tenant_configurations"
[ -f "api_configuration.sql" ] && mv api_configuration.sql 06-api_configuration.sql && echo "  ✓ 06: api_configuration"
echo ""

echo "============================================"
echo "RENUMERACIÓN COMPLETADA"
echo "============================================"
echo ""
echo "Total operaciones: 36"
echo "  - Gaps corregidos: 6"
echo "  - Archivos numerados: 30"
echo ""
echo "Verificar con: git status"
```

### 3.2. Verificación Post-Renumeración

```bash
#!/bin/bash

BASE_DIR="/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas"

echo "=== VERIFICACIÓN DE NUMERACIÓN ==="
echo ""

for schema in auth_management content_management educational_content progress_tracking social_features system_configuration; do
    echo "Schema: $schema"
    cd "$BASE_DIR/$schema/tables"

    # Contar archivos
    total=$(ls -1 *.sql 2>/dev/null | wc -l)
    numerados=$(ls -1 [0-9][0-9]-*.sql 2>/dev/null | wc -l)
    sin_numerar=$(ls -1 *.sql 2>/dev/null | grep -v "^[0-9][0-9]-" | wc -l)

    echo "  Total: $total | Numerados: $numerados | Sin numerar: $sin_numerar"

    # Listar secuencia
    secuencia=$(ls -1 [0-9][0-9]-*.sql 2>/dev/null | sed 's/-.*//' | xargs)
    echo "  Secuencia: $secuencia"

    # Detectar gaps
    if [ $numerados -gt 0 ]; then
        min=$(ls -1 [0-9][0-9]-*.sql | sed 's/-.*//' | sort -n | head -1)
        max=$(ls -1 [0-9][0-9]-*.sql | sed 's/-.*//' | sort -n | tail -1)
        esperados=$(seq -s' ' $min $max)

        if [ "$secuencia" != "$esperados" ]; then
            echo "  ⚠ GAPS detectados"
        else
            echo "  ✓ Secuencia completa"
        fi
    fi

    echo ""
done

echo "=== ARCHIVOS SIN NUMERAR RESTANTES ==="
for schema in auth_management content_management educational_content progress_tracking social_features system_configuration; do
    cd "$BASE_DIR/$schema/tables"
    sin_num=$(ls -1 *.sql 2>/dev/null | grep -v "^[0-9][0-9]-")
    if [ ! -z "$sin_num" ]; then
        echo "$schema:"
        echo "$sin_num" | sed 's/^/  - /'
        echo ""
    fi
done
```

---

## 4. Checklist Pre-Renumeración

Antes de ejecutar el script:

- [ ] **Backup:** Crear branch git para renumeración
  ```bash
  git checkout -b fix/renumerar-tables-ddl
  ```

- [ ] **Verificar estado limpio:**
  ```bash
  git status
  # Debería estar limpio antes de empezar
  ```

- [ ] **Revisar dependencias:**
  - Verificar que no haya scripts de migración que referencien nombres viejos
  - Verificar imports en código backend si usan nombres de archivos

- [ ] **Tener editores cerrados:**
  - VSCode u otros IDEs pueden causar conflictos

---

## 5. Checklist Post-Renumeración

Después de ejecutar el script:

- [ ] **Verificar numeración:**
  ```bash
  bash verificar_numeracion.sh
  ```

- [ ] **Revisar cambios en git:**
  ```bash
  git status
  git diff --name-status
  ```

- [ ] **Verificar sintaxis SQL:**
  ```bash
  # Verificar que archivos no se corrompieron
  for file in $(git diff --name-only | grep ".sql$"); do
    echo "Checking $file..."
    head -1 "$file" | grep "^--" || echo "⚠ Sin header: $file"
  done
  ```

- [ ] **Actualizar referencias:**
  - Buscar referencias a nombres viejos en:
    - `init-database.sh`
    - Documentación
    - Scripts de testing

- [ ] **Commit:**
  ```bash
  git add -A
  git commit -m "refactor(database): Renumerar tables DDL para secuencia continua

  - Corrige gaps en auth_management (13) y social_features (08-10)
  - Numera 30 archivos sin numeración estándar
  - Mejora consistencia de estructura DDL

  Schemas afectados:
  - auth_management: 3 archivos renumerados
  - social_features: 8 archivos renumerados
  - content_management: 3 archivos numerados
  - educational_content: 11 archivos numerados
  - progress_tracking: 8 archivos numerados
  - system_configuration: 3 archivos numerados

  Total: 36 operaciones de renombrado
  Numeración DDL: 73.5% → 100%"
  ```

---

## 6. Notas Importantes

### Orden de Ejecución

1. **PRIMERO:** Corregir gaps (evita conflictos)
2. **DESPUÉS:** Numerar archivos sin numerar

### Consideraciones de Git

- Git detecta renombrados si contenido es >50% igual
- Usar `git mv` NO es necesario, `mv` es suficiente
- `git status` mostrará: `renamed: old.sql -> new.sql`

### Rollback

Si algo sale mal:
```bash
git checkout .
# o
git reset --hard HEAD
```

### Testing

Después de renumerar, ejecutar:
```bash
# Verificar que init-database.sh funciona
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
bash scripts/init-database.sh --dry-run
```

---

## 7. Impacto en Otros Archivos

### Archivos que NO necesitan cambios

- ✓ `init-database.sh` - Usa wildcards `*.sql`
- ✓ Backend - No referencia nombres de archivos DDL
- ✓ Documentación - Usa nombres de tablas, no archivos

### Archivos a revisar después

- [ ] `README.md` - Si menciona ejemplos específicos
- [ ] `docs/` - Documentación técnica
- [ ] Scripts custom de deployment

---

## Resumen

**Operaciones totales:** 36 renombrados
**Esfuerzo:** 1-2 horas (incluyendo testing)
**Riesgo:** BAJO (solo renombrados, sin cambios de contenido)
**Beneficio:** Estructura 100% consistente y mantenible

**Siguiente paso:** Ejecutar script y hacer commit.
