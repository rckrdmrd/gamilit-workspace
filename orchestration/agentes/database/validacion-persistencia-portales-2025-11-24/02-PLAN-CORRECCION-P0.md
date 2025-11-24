# PLAN DE CORRECCIÓN P0: GAPS DE PERSISTENCIA PORTALES

**Agente:** Database-Agent
**Fecha:** 2025-11-24
**Estimación Total:** 6 horas
**Prioridad:** P0 (MVP)

---

## 🎯 OBJETIVO

Corregir 2 gaps menores identificados en la validación de persistencia de datos para portales Admin y Teacher:
1. Vista `recent_activity` rota (usa tabla inexistente)
2. Seeds de assignments ausentes

---

## 📋 TAREAS

### Tarea 1: Corregir Vista `recent_activity`

**ID:** DB-130-FIX-001
**Estimación:** 2 horas
**Prioridad:** P0
**Severidad:** MEDIA
**Impacto:** Dashboard admin no puede mostrar actividad reciente

#### Problema
Vista `admin_dashboard.recent_activity` referencia tabla `audit_logging.activity_log` que **NO EXISTE**.

```sql
-- QUERY ACTUAL (ROTA)
SELECT
  al.id,
  al.user_id,
  u.email,
  p.first_name,
  p.last_name,
  al.action_type,
  al.description,
  al.metadata,
  al.created_at
FROM audit_logging.activity_log al  -- ❌ TABLA NO EXISTE
LEFT JOIN auth.users u ON al.user_id = u.id
LEFT JOIN auth_management.profiles p ON u.id = p.user_id
ORDER BY al.created_at DESC
LIMIT 100;
```

#### Tablas Reales Disponibles
- ✅ `audit_logging.user_activity_logs` (40+ campos)
- ✅ `audit_logging.user_activity` (campos simplificados)
- ✅ `audit_logging.audit_logs` (logs de auditoría)

#### Solución Propuesta
Actualizar vista para usar `user_activity_logs` que es la tabla más completa.

```sql
-- QUERY CORREGIDA
CREATE OR REPLACE VIEW admin_dashboard.recent_activity AS
SELECT
  ual.id,
  ual.user_id,
  u.email,
  p.first_name,
  p.last_name,
  ual.activity_type as action_type,
  ual.action_detail as description,
  ual.metadata,
  ual.created_at
FROM audit_logging.user_activity_logs ual
LEFT JOIN auth.users u ON ual.user_id = u.id
LEFT JOIN auth_management.profiles p ON u.id = p.user_id
ORDER BY ual.created_at DESC
LIMIT 100;
```

#### Pasos de Implementación

1. **Backup del archivo original** (5 min)
   ```bash
   cp apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql \
      apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql.backup.20251124
   ```

2. **Actualizar vista** (15 min)
   - Editar archivo: `apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql`
   - Cambiar `audit_logging.activity_log` → `audit_logging.user_activity_logs`
   - Mapear columnas: `action_type`, `action_detail` → `description`
   - Actualizar comentarios de documentación

3. **Validar con recreación completa** (30 min)
   ```bash
   cd apps/database
   ./drop-and-recreate-database.sh
   ```

4. **Verificar vista funciona** (15 min)
   ```bash
   psql -d gamilit_platform -c "SELECT * FROM admin_dashboard.recent_activity LIMIT 5;"
   ```

5. **Validar backend puede consumirla** (15 min)
   - Verificar endpoint `/api/admin/dashboard` funciona
   - Verificar query no arroja errores

6. **Documentar cambio** (15 min)
   - Actualizar comentarios SQL
   - Agregar nota en TRAZA-TAREAS-DATABASE.md
   - Commit con mensaje descriptivo

7. **Testing final** (15 min)
   - Cargar portal admin
   - Verificar sección "Recent Activity" muestra datos
   - Validar formato de datos es correcto

#### Archivos a Modificar
- `apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql`

#### Validación de Éxito
- ✅ Script `create-database.sh` ejecuta sin errores
- ✅ Vista `recent_activity` existe en schema `admin_dashboard`
- ✅ Query `SELECT * FROM admin_dashboard.recent_activity` retorna datos
- ✅ Backend endpoint `/api/admin/dashboard` funciona
- ✅ Portal admin muestra actividad reciente

---

### Tarea 2: Crear Seeds de Assignments

**ID:** DB-130-FIX-002
**Estimación:** 4 horas
**Prioridad:** P0
**Severidad:** ALTA
**Impacto:** Portal Teacher muestra listas vacías en demos

#### Problema
No existen seeds de assignments en producción. Portal Teacher no tiene datos de ejemplo para mostrar en asignaciones.

**Archivo faltante:** `apps/database/seeds/prod/educational_content/05-assignments.sql`

#### Solución Propuesta
Crear seeds con 10-15 assignments distribuidos en classrooms existentes.

#### Datos de Referencia (de seeds existentes)

**Classrooms disponibles:**
```sql
-- classroom_id, name, teacher_id
-- 11111111-1111-1111-1111-111111111111, "Grupo 6A Matutino", bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- 22222222-2222-2222-2222-222222222222, "Grupo 6B Vespertino", bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- 33333333-3333-3333-3333-333333333333, "Grupo 7A Matutino", bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- 44444444-4444-4444-4444-444444444444, "Grupo 7B Vespertino", bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- 55555555-5555-5555-5555-555555555555, "Grupo 8A Matutino", bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
```

**Teacher ID:** `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`

**Ejercicios disponibles (M1-M3):**
- Módulo 1: 5 ejercicios (Sopa de Letras, Crucigrama, etc.)
- Módulo 2: 6 ejercicios (Detective Textual, Rueda de Inferencias, etc.)
- Módulo 3: 5 ejercicios (Tribunal de Opiniones, Debate Digital, etc.)

#### Estructura de Assignments

```sql
-- Tabla: educational_content.assignments
-- Campos: id, teacher_id, title, description, assignment_type, due_date, total_points, is_published
```

#### Pasos de Implementación

1. **Crear archivo de seeds** (60 min)
   - Crear: `apps/database/seeds/prod/educational_content/05-assignments.sql`
   - 10-15 assignments con UUIDs únicos
   - Distribuir en 5 classrooms (2-3 por classroom)
   - Vincular con ejercicios de módulos 1-3
   - Fechas variadas:
     - 3 asignaciones pasadas (completed)
     - 5 asignaciones presentes (in_progress)
     - 4 asignaciones futuras (pending)
   - Tipos variados: practice, quiz, exam, homework

2. **Agregar al script create-database.sh** (15 min)
   - Editar: `apps/database/create-database.sh`
   - Agregar línea en sección de seeds educativos (después de exercises)
   ```bash
   echo "Loading assignments seeds..."
   psql -U $DB_USER -d $DB_NAME -f "$SEEDS_DIR/prod/educational_content/05-assignments.sql"
   ```

3. **Validar seeds con recreación** (45 min)
   ```bash
   cd apps/database
   ./drop-and-recreate-database.sh
   ```

4. **Verificar datos cargados** (30 min)
   ```bash
   # Contar assignments
   psql -d gamilit_platform -c "SELECT COUNT(*) FROM educational_content.assignments;"

   # Ver assignments por classroom
   psql -d gamilit_platform -c "
   SELECT c.name, COUNT(a.id) as assignments_count
   FROM educational_content.assignments a
   JOIN social_features.assignment_classrooms ac ON a.id = ac.assignment_id
   JOIN social_features.classrooms c ON ac.classroom_id = c.id
   GROUP BY c.name;"

   # Ver tipos de assignment
   psql -d gamilit_platform -c "
   SELECT assignment_type, COUNT(*)
   FROM educational_content.assignments
   GROUP BY assignment_type;"
   ```

5. **Validar backend puede consumir** (30 min)
   - Verificar endpoint `/api/teacher/assignments` retorna datos
   - Verificar submissions asociadas se crean correctamente

6. **Testing en Portal Teacher** (45 min)
   - Login como teacher (bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb)
   - Verificar listado de assignments muestra datos
   - Verificar filtros funcionan (por status, tipo, classroom)
   - Verificar vista detalle de assignment muestra info completa

7. **Documentar** (15 min)
   - Actualizar DATABASE_INVENTORY.yml
   - Agregar nota en TRAZA-TAREAS-DATABASE.md
   - Commit con mensaje descriptivo

#### Template de Assignment Seed

```sql
-- =====================================================
-- SEEDS: Assignments para Portal Teacher
-- =====================================================
-- Descripción: 12 assignments demo distribuidos en 5 classrooms
-- Vinculados: Ejercicios de módulos 1-3
-- Teacher: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- Fecha: 2025-11-24
-- =====================================================

-- Assignment 1: Módulo 1 - Sopa de Letras (Classroom 6A)
INSERT INTO educational_content.assignments
(id, teacher_id, title, description, assignment_type, due_date, total_points, is_published, created_at, updated_at)
VALUES
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Práctica: Sopa de Letras Marie Curie',
  'Completa la sopa de letras con términos relacionados a la vida de Marie Curie',
  'practice',
  NOW() + INTERVAL '7 days',
  100,
  true,
  NOW(),
  NOW()
);

-- ... (repetir para 11 assignments más)
```

#### Distribución Propuesta

| Classroom | Assignments | Tipos | Fechas |
|-----------|-------------|-------|--------|
| 6A Matutino | 3 | 1 practice, 1 quiz, 1 homework | 1 pasada, 1 presente, 1 futura |
| 6B Vespertino | 2 | 1 practice, 1 exam | 1 presente, 1 futura |
| 7A Matutino | 3 | 1 quiz, 1 homework, 1 exam | 1 pasada, 1 presente, 1 futura |
| 7B Vespertino | 2 | 1 practice, 1 quiz | 2 presentes |
| 8A Matutino | 2 | 1 homework, 1 exam | 1 pasada, 1 futura |

#### Archivos a Crear/Modificar
- **Crear:** `apps/database/seeds/prod/educational_content/05-assignments.sql`
- **Modificar:** `apps/database/create-database.sh` (agregar línea de carga)

#### Validación de Éxito
- ✅ Archivo seed creado y sintácticamente correcto
- ✅ Script `create-database.sh` carga assignments sin errores
- ✅ Query `SELECT COUNT(*) FROM assignments` retorna 10-15
- ✅ Assignments distribuidos en 5 classrooms
- ✅ Backend endpoint `/api/teacher/assignments` retorna datos
- ✅ Portal Teacher muestra listado de assignments

---

## 🎯 ORDEN DE EJECUCIÓN

### Recomendación: Ejecutar en paralelo si hay 2 personas
- **Persona 1:** Tarea 1 (Vista recent_activity) - 2 horas
- **Persona 2:** Tarea 2 (Seeds assignments) - 4 horas

### Recomendación: Ejecutar secuencialmente si hay 1 persona
1. **Tarea 2 primero** (Seeds assignments) - 4 horas
   - Más crítica para Portal Teacher
   - Más tiempo de implementación

2. **Tarea 1 después** (Vista recent_activity) - 2 horas
   - Menos crítica para MVP
   - Corrección más rápida

---

## ✅ CHECKLIST DE VALIDACIÓN FINAL

### Pre-corrección
- [ ] Backup de archivos a modificar
- [ ] Branch git creado: `fix/db-130-persistencia-portales`

### Tarea 1 (Vista recent_activity)
- [ ] Archivo DDL actualizado
- [ ] Vista referencia tabla correcta (`user_activity_logs`)
- [ ] Recreación BD exitosa
- [ ] Query `SELECT * FROM recent_activity` funciona
- [ ] Backend endpoint funciona
- [ ] Portal admin muestra datos

### Tarea 2 (Seeds assignments)
- [ ] Archivo seed creado
- [ ] 10-15 assignments con UUIDs válidos
- [ ] Script create-database.sh actualizado
- [ ] Recreación BD exitosa
- [ ] Assignments cargados en DB
- [ ] Backend endpoint retorna datos
- [ ] Portal teacher muestra listado

### Post-corrección
- [ ] Commits creados con mensajes descriptivos
- [ ] TRAZA-TAREAS-DATABASE.md actualizado
- [ ] DATABASE_INVENTORY.yml actualizado
- [ ] Testing completo en ambos portales
- [ ] Documentación de cambios generada

---

## 📚 REFERENCIAS

- **Reporte de validación:** `orchestration/agentes/database/validacion-persistencia-portales-2025-11-24/01-REPORTE-VALIDACION-PERSISTENCIA-DATOS.yml`
- **Resumen ejecutivo:** `orchestration/agentes/database/validacion-persistencia-portales-2025-11-24/00-RESUMEN-EJECUTIVO.md`
- **Reporte consolidado previo:** `orchestration/reportes/REPORTE-CONSOLIDADO-PORTALES-ADMIN-TEACHER-2025-11-23.md`
- **Política de Carga Limpia:** `orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md`

---

**Fecha de creación:** 2025-11-24
**Agente:** Database-Agent
**Estado:** ✅ PLAN LISTO PARA EJECUCIÓN
**Estimación total:** 6 horas
**Prioridad:** P0 (MVP)
