# ACCIONES CORRECTIVAS - VALIDACIÓN CARGA LIMPIA

**Fecha:** 2025-11-23
**Responsable:** Database-Agent
**Tiempo estimado total:** 60 minutos
**Prioridad:** ALTA

---

## FASE 1: CORRECCIÓN INMEDIATA (30 minutos)

### Acción 1.1: Eliminar Carpetas Migrations ⏱️ 5 min

**Objetivo:** Eliminar todas las carpetas migrations/ detectadas

**Comandos:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit

# Crear carpeta para documentación histórica
mkdir -p apps/database/docs/historical-migrations

# Mover archivo migration a históricos
mv apps/database/scripts/migrations/DB-125-add-pedagogical-columns.sql \
   apps/database/docs/historical-migrations/

# Eliminar carpetas migrations
rm -rf apps/database/ddl/migrations
rm -rf apps/database/migrations
rm -rf apps/database/scripts/migrations

# Agregar a .gitignore
echo "" >> .gitignore
echo "# Migrations no permitidas (Política de Carga Limpia)" >> .gitignore
echo "apps/database/migrations/" >> .gitignore
echo "apps/database/ddl/migrations/" >> .gitignore
echo "apps/database/scripts/migrations/" >> .gitignore
```

**Validación:**
```bash
# Verificar que no hay carpetas migrations
find apps/database -type d -name "migrations"
# Esperado: output vacío

# Verificar que archivo histórico se movió
ls -la apps/database/docs/historical-migrations/
# Esperado: DB-125-add-pedagogical-columns.sql
```

**Checklist:**
- [ ] Carpeta docs/historical-migrations creada
- [ ] Archivo DB-125 movido a históricos
- [ ] Carpeta ddl/migrations eliminada
- [ ] Carpeta migrations/ eliminada
- [ ] Carpeta scripts/migrations/ eliminada
- [ ] .gitignore actualizado

---

### Acción 1.2: Agregar Seed a create-database.sh ⏱️ 10 min

**Objetivo:** Incluir 05-assignments.sql en script de creación

**Archivo a editar:** `apps/database/create-database.sh`

**Ubicación:** Línea ~517 (después de 04-exercises-module3.sql)

**Cambio requerido:**
```bash
# ANTES (líneas 516-518)
execute_sql "$SEEDS_DIR/educational_content/04-exercises-module3.sql" "Seeds: Module 3 - Crítica (5 exercises)"
# execute_sql "$SEEDS_DIR/educational_content/05-exercises-module4.sql" "Seeds: Module 4 - Digital (9 exercises)"
# execute_sql "$SEEDS_DIR/educational_content/06-exercises-module5.sql" "Seeds: Module 5 - Creativo (3 exercises)"

# DESPUÉS (agregar línea)
execute_sql "$SEEDS_DIR/educational_content/04-exercises-module3.sql" "Seeds: Module 3 - Crítica (5 exercises)"
execute_sql "$SEEDS_DIR/educational_content/05-assignments.sql" "Seeds: assignments (12 demo for Teacher Portal - commit db82449)"
# execute_sql "$SEEDS_DIR/educational_content/05-exercises-module4.sql" "Seeds: Module 4 - Digital (9 exercises)"
# execute_sql "$SEEDS_DIR/educational_content/06-exercises-module5.sql" "Seeds: Module 5 - Creativo (3 exercises)"
```

**Comando con sed (alternativa):**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database

# Hacer backup
cp create-database.sh create-database.sh.backup.20251123

# Agregar línea con sed
sed -i '516a execute_sql "$SEEDS_DIR/educational_content/05-assignments.sql" "Seeds: assignments (12 demo for Teacher Portal - commit db82449)"' create-database.sh
```

**Validación:**
```bash
# Verificar que línea se agregó
grep -n "05-assignments" apps/database/create-database.sh
# Esperado: línea ~517 con execute_sql
```

**Checklist:**
- [ ] Backup de create-database.sh creado
- [ ] Línea 517 agregada con execute_sql
- [ ] Línea agregada después de 04-exercises-module3.sql
- [ ] Línea agregada antes de comentarios de módulos 4-5
- [ ] Validación grep confirma cambio

---

### Acción 1.3: Re-ejecutar Recreación y Validar ⏱️ 5 min

**Objetivo:** Confirmar que seed se carga correctamente

**Comandos:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database

# Ejecutar recreación completa
./drop-and-recreate-database.sh \
  "postgresql://gamilit_user:3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q@localhost:5432/gamilit_platform"

# Validar assignments cargados
psql "postgresql://gamilit_user:3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q@localhost:5432/gamilit_platform" \
  -c "SELECT COUNT(*) as total_assignments
      FROM educational_content.assignments
      WHERE teacher_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';"

# Esperado: 12
```

**Validaciones adicionales:**
```bash
# Validar distribución por classroom
psql "postgresql://gamilit_user:3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q@localhost:5432/gamilit_platform" \
  -c "SELECT
        c.name AS classroom,
        COUNT(ac.id) AS total_assignments
      FROM social_features.classrooms c
      LEFT JOIN social_features.assignment_classrooms ac ON c.id = ac.classroom_id
      LEFT JOIN educational_content.assignments a ON ac.assignment_id = a.id
      WHERE a.teacher_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
      GROUP BY c.id, c.name
      ORDER BY c.name;"

# Esperado:
# 5to A - Comprensión Lectora: 6
# 5to B - Lectura Digital: 3
# 6to A - Producción de Textos: 3
```

**Checklist:**
- [ ] Recreación ejecuta sin errores
- [ ] 12 assignments cargados
- [ ] Distribución por classroom correcta (6+3+3)
- [ ] Todas las FK válidas (classroom_id, exercise_id, teacher_id)
- [ ] Queries de validación del seed ejecutan correctamente

---

### Acción 1.4: Verificar Ausencia de Migrations ⏱️ 2 min

**Objetivo:** Confirmar que no quedan archivos/carpetas prohibidos

**Comandos:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit

# Verificar carpetas migrations
find apps/database -type d -name "migrations"
# Esperado: output vacío

# Verificar archivos fix/patch/hotfix
find apps/database -name "fix-*.sql" -o -name "patch-*.sql" -o -name "hotfix-*.sql"
# Esperado: output vacío
```

**Checklist:**
- [ ] No hay carpetas migrations/
- [ ] No hay archivos fix-*.sql
- [ ] No hay archivos patch-*.sql
- [ ] No hay archivos hotfix-*.sql

---

## FASE 2: DOCUMENTACIÓN (20 minutos)

### Acción 2.1: Actualizar MASTER_INVENTORY.yml ⏱️ 10 min

**Objetivo:** Documentar seed 05-assignments.sql en inventario principal

**Archivo:** `orchestration/inventarios/MASTER_INVENTORY.yml`

**Sección:** `database.seeds.educational_content`

**Entrada a agregar:**
```yaml
    # Assignments (Teacher Portal)
    - file: apps/database/seeds/prod/educational_content/05-assignments.sql
      description: "12 demo assignments para Teacher Portal (US-AE-007)"
      lines: 618
      tables_affected:
        - educational_content.assignments (12 inserts)
        - social_features.assignment_classrooms (12 inserts)
        - educational_content.assignment_exercises (12 inserts)
      data_summary:
        - "6 assignments para Classroom 1 (5to A - Comprensión Lectora)"
        - "3 assignments para Classroom 2 (5to B - Lectura Digital)"
        - "3 assignments para Classroom 3 (6to A - Producción de Textos)"
        - "Tipos: 6 practice, 1 quiz, 2 exam, 3 homework"
        - "Teacher: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb (teacher@gamilit.com)"
      created: 2025-11-23
      commit: db82449
      task: "Tarea 2 - Seeds de Asignaciones"
      validation_queries:
        - "SELECT COUNT(*) FROM educational_content.assignments WHERE teacher_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';"
      expected_result: 12
```

**Checklist:**
- [ ] Entrada agregada en sección correcta
- [ ] Metadata completa (file, description, lines, tables_affected)
- [ ] Resumen de datos incluido
- [ ] Fecha y commit documentados
- [ ] Queries de validación incluidas

---

### Acción 2.2: Actualizar TRAZA-TAREAS-DATABASE.md ⏱️ 10 min

**Objetivo:** Documentar la tarea de creación del seed

**Archivo:** `orchestration/trazas/TRAZA-TAREAS-DATABASE.md`

**Sección:** Al final del archivo (agregar nueva entrada)

**Entrada a agregar:**
```markdown
---

## [DB-XXX] Seed de Assignments para Teacher Portal
**Fecha:** 2025-11-23
**Estado:** ✅ Completado (con correcciones posteriores)
**Commit:** db82449
**Relacionado con:** US-AE-007 (UI Classroom-Teacher)

### Descripción
Creación de seed con 12 asignaciones demo para el portal de Teacher. Los assignments se distribuyen en 3 classrooms y referencian ejercicios de módulos 1-3.

### Archivos Creados
- `apps/database/seeds/prod/educational_content/05-assignments.sql` (618 líneas)

### Contenido del Seed
- 12 assignments (teacher: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb)
- 12 relaciones assignment-classroom
- 12 relaciones assignment-exercise

**Distribución:**
- Classroom 1 (5to A - Comprensión Lectora): 6 assignments
- Classroom 2 (5to B - Lectura Digital): 3 assignments
- Classroom 3 (6to A - Producción de Textos): 3 assignments

**Tipos:**
- practice: 6
- quiz: 1
- exam: 2
- homework: 3

### Cambios DDL
Ninguno (tabla assignments ya existía).

### Validación
```sql
-- Total assignments
SELECT COUNT(*) FROM educational_content.assignments
WHERE teacher_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
-- Esperado: 12

-- Distribución por classroom
SELECT c.name, COUNT(ac.id) as total
FROM social_features.classrooms c
LEFT JOIN social_features.assignment_classrooms ac ON c.id = ac.classroom_id
LEFT JOIN educational_content.assignments a ON ac.assignment_id = a.id
WHERE a.teacher_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
GROUP BY c.name;
-- Esperado: 5to A (6), 5to B (3), 6to A (3)
```

### Correcciones Posteriores (2025-11-23)
- ✅ Seed agregado a create-database.sh (línea 517)
- ✅ Documentado en MASTER_INVENTORY.yml
- ✅ Validación de carga limpia ejecutada

### Política de Carga Limpia
- [x] DDL actualizado (no aplica - tabla ya existía)
- [x] Seed en create-database.sh (corregido 2025-11-23)
- [x] Recreación completa funciona
- [x] Documentación actualizada

### Referencias
- Seed: apps/database/seeds/prod/educational_content/05-assignments.sql
- DDL tabla: apps/database/ddl/schemas/educational_content/tables/05-assignments.sql
- Reporte validación: orchestration/agentes/database/validacion-carga-limpia-2025-11-23/
```

**Checklist:**
- [ ] Entrada agregada al final del archivo
- [ ] Metadata completa (fecha, estado, commit)
- [ ] Descripción detallada incluida
- [ ] Archivos creados listados
- [ ] Distribución de datos documentada
- [ ] Queries de validación incluidas
- [ ] Correcciones posteriores documentadas
- [ ] Checklist de Política de Carga Limpia completado

---

## FASE 3: VALIDACIÓN FINAL (10 minutos)

### Acción 3.1: Ejecutar Checklist de Cumplimiento ⏱️ 5 min

**Objetivo:** Confirmar que todos los problemas se resolvieron

**Checklist de Política de Carga Limpia:**
```markdown
- [ ] NO existen archivos en carpeta migrations/
  └─ Comando: find apps/database -type d -name "migrations"
  └─ Esperado: output vacío

- [ ] NO existen archivos fix-*.sql, patch-*.sql, hotfix-*.sql
  └─ Comando: find apps/database -name "fix-*.sql" -o -name "patch-*.sql"
  └─ Esperado: output vacío

- [ ] Todos los cambios en BD están en archivos DDL
  └─ Comando: grep -E "(objective|how_to_solve)" apps/database/ddl/.../02-exercises.sql
  └─ Esperado: columnas pedagógicas en DDL

- [ ] El script drop-and-recreate-database.sh funciona correctamente
  └─ Comando: ./drop-and-recreate-database.sh
  └─ Esperado: exit code 0, 119 tablas creadas

- [ ] Seed 05-assignments.sql se carga correctamente
  └─ Comando: psql -c "SELECT COUNT(*) FROM assignments WHERE ..."
  └─ Esperado: 12

- [ ] MASTER_INVENTORY.yml actualizado
  └─ Comando: grep "05-assignments" orchestration/inventarios/MASTER_INVENTORY.yml
  └─ Esperado: entrada completa

- [ ] TRAZA-TAREAS-DATABASE.md actualizado
  └─ Comando: grep -A 20 "DB-XXX.*Assignments" orchestration/trazas/TRAZA-TAREAS-DATABASE.md
  └─ Esperado: entrada completa
```

**Checklist de Validación del Seed:**
```markdown
- [ ] Seed ubicado en ruta correcta
  └─ apps/database/seeds/prod/educational_content/05-assignments.sql

- [ ] Seed tiene estructura correcta
  └─ Headers, comentarios, queries de validación

- [ ] Datos son válidos
  └─ 12 assignments, FKs correctos

- [ ] Nomenclatura correcta
  └─ 05-assignments.sql (numérico + descriptivo)

- [ ] Seed se carga en create-database.sh
  └─ Línea 517 agregada

- [ ] No hay errores de FK o constraints
  └─ Recreación completa sin errores
```

---

### Acción 3.2: Generar Reporte de Cierre ⏱️ 5 min

**Objetivo:** Documentar que todas las correcciones se aplicaron

**Archivo a crear:** `orchestration/agentes/database/validacion-carga-limpia-2025-11-23/CIERRE.md`

**Contenido:**
```markdown
# CIERRE - VALIDACIÓN DE POLÍTICA DE CARGA LIMPIA

**Fecha validación:** 2025-11-23 22:37
**Fecha cierre:** [FECHA_ACTUAL]
**Responsable:** Database-Agent

## Resumen
Todas las acciones correctivas se aplicaron exitosamente.

## Problemas Resueltos
1. ✅ Carpetas migrations eliminadas
2. ✅ Seed 05-assignments.sql agregado a create-database.sh
3. ✅ Documentación actualizada (MASTER_INVENTORY, TRAZA-TAREAS)

## Validación Final
- ✅ Recreación completa: exitosa
- ✅ Assignments cargados: 12/12
- ✅ Carpetas migrations: 0
- ✅ Archivos fix/patch: 0
- ✅ Documentación: completa

## Estado Final
**✅ CUMPLIMIENTO COMPLETO** (100%)

## Firma
Database-Agent
[FECHA_ACTUAL]
```

**Checklist:**
- [ ] Archivo CIERRE.md creado
- [ ] Resumen de correcciones incluido
- [ ] Validación final documentada
- [ ] Estado final actualizado a 100%
- [ ] Fecha y firma incluidas

---

## RESUMEN DE FASES

| Fase | Duración | Acciones | Estado |
|------|----------|----------|--------|
| 1. Corrección Inmediata | 30 min | 4 acciones | ⏳ Pendiente |
| 2. Documentación | 20 min | 2 acciones | ⏳ Pendiente |
| 3. Validación Final | 10 min | 2 acciones | ⏳ Pendiente |
| **TOTAL** | **60 min** | **8 acciones** | **⏳ Pendiente** |

---

## PRÓXIMOS PASOS

1. ✅ Ejecutar Fase 1 (correcciones críticas)
2. ✅ Ejecutar Fase 2 (documentación)
3. ✅ Ejecutar Fase 3 (validación final)
4. ✅ Crear archivo CIERRE.md
5. ✅ Notificar a Tech Lead que validación está completa

---

**Última actualización:** 2025-11-23 22:55 CST
**Estado:** ⏳ LISTO PARA EJECUTAR
