# DELEGACIÓN: Tarea 2 - Crear Seeds de Assignments

**Fecha:** 2025-11-23
**Delegado por:** Architecture-Analyst
**Delegado a:** Database-Agent
**Prioridad:** P0 - CRÍTICA para MVP
**Estimación:** 4 horas
**Estado:** INICIADO

---

## 📋 CONTEXTO

El análisis arquitectónico reveló que el **Portal Teacher** tiene backend funcional (7 endpoints para assignments) y frontend básico, pero **NO tiene datos de ejemplo en la base de datos**.

### Situación Actual

- **Backend:** 7 endpoints de assignments YA implementados (US-AE-007)
- **Frontend:** `TeacherAssignmentsPage.tsx` está implementado pero muestra listas vacías
- **Database:** Tabla `educational_content.assignments` existe pero NO tiene seeds
- **Impacto:** Teacher Portal no puede ser demostrado sin datos de ejemplo

**Reporte de Análisis:** `/orchestration/reportes/REPORTE-CONSOLIDADO-PORTALES-ADMIN-TEACHER-2025-11-23.md`

**Plan Completo:** `/orchestration/agentes/architecture-analyst/integracion-apis-2025-11-23/PLAN-DETALLADO-INTEGRACION-APIS.md`

---

## 🎯 OBJETIVO DE LA TAREA

Crear archivo de seed SQL con **12 assignments de ejemplo** distribuidos en 3 classrooms, con variedad de estados (active, pending, completed, overdue) para demostrar funcionalidad completa del Teacher Portal.

---

## 📂 ARCHIVO A CREAR

### Archivo Nuevo (1)

**`apps/database/seeds/prod/educational_content/05-assignments.sql`**

- **Contenido:** 12 INSERTs de assignments
- **Classrooms:**
  - `5to A - Comprensión Lectora` (6 assignments)
  - `5to B - Lectura Digital` (3 assignments)
  - `6to A - Producción de Textos` (3 assignments)
- **Estados:**
  - 6 active (activas)
  - 3 pending (pendientes, futuras)
  - 1 completed (completada)
  - 2 overdue (vencidas)
- **Variedades:**
  - Diferentes módulos (1, 2, 3)
  - Diferentes dificultades (easy, medium, hard)
  - Diferentes puntos (50-200)
  - Diferentes intentos permitidos (1-5)
  - Con metadata variada (bonus, proyectos, evaluaciones)

---

## 📝 CONTENIDO COMPLETO DEL SEED

**Ver sección 2.1 del plan detallado** (líneas 1189-1642) para el código SQL completo.

**Características del SQL:**

```sql
-- PREREQUISITOS
-- 1. Classrooms: dddddddd..., eeeeeeee..., ffffffff...
-- 2. Exercises: códigos MOD1-EX1-CRUCIGRAMA, etc.
-- 3. Teacher: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb (teacher@gamilit.com)
-- 4. Students: de demo users

-- LIMPIAR DATOS EXISTENTES
DELETE FROM educational_content.assignments WHERE created_by = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- 12 INSERTS con variedad de:
-- - due_date: NOW() + INTERVAL '7 days', NOW() - INTERVAL '3 days', etc.
-- - status: 'active', 'pending', 'completed', 'overdue'
-- - points: 50, 100, 150, 200
-- - max_attempts: 1, 2, 3, 5
-- - show_feedback: true/false
-- - metadata: difficulty, module, exercise_number, is_bonus, is_project, etc.

-- VALIDACIÓN
SELECT classroom, COUNT(*) FROM assignments GROUP BY classroom;
```

---

## 🛠️ PASOS DE IMPLEMENTACIÓN

### Paso 1: Leer Documentación (30 min)

```bash
# Leer plan detallado sección 2.1
# Leer esquema de base de datos
# apps/database/schema/educational_content/assignments.sql
```

**Validar:**
- Estructura de la tabla `educational_content.assignments`
- Campos requeridos vs opcionales
- Tipos de datos
- Constraints (FK a classrooms, exercises, users)

---

### Paso 2: Verificar Prerequisitos (30 min)

```bash
# Conectar a BD
export PGPASSWORD='3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q'
psql -U gamilit_user -h localhost -d gamilit_platform

# Verificar classrooms existen
SELECT id, name FROM social_features.classrooms WHERE name LIKE '%5to%' OR name LIKE '%6to%';

# Verificar exercises existen
SELECT code, title, module_id FROM educational_content.exercises WHERE code LIKE 'MOD1-%' OR code LIKE 'MOD2-%' OR code LIKE 'MOD3-%' LIMIT 20;

# Verificar teacher existe
SELECT id, email FROM public.users WHERE email = 'teacher@gamilit.com';
```

**Resultado Esperado:**
- Al menos 3 classrooms
- Al menos 12 exercises con códigos MOD1-*, MOD2-*, MOD3-*
- Teacher con ID bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb

**Si faltan datos:** Escalar a Architecture-Analyst (posible que otros seeds no estén aplicados)

---

### Paso 3: Crear Archivo de Seed (2 horas)

```bash
# Crear archivo
touch apps/database/seeds/prod/educational_content/05-assignments.sql
```

**Copiar el SQL completo de la sección 2.1 del plan detallado (líneas 1197-1641)**

**Estructura del archivo:**
1. Header con metadata
2. Prerequisitos comentados
3. DELETE de datos existentes (solo demo)
4. 12 INSERTs organizados por classroom
5. Query de validación al final

---

### Paso 4: Aplicar Seed en BD (30 min)

```bash
# Navegar a carpeta
cd apps/database

# Aplicar seed
export PGPASSWORD='3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q'
psql -U gamilit_user -h localhost -d gamilit_platform -f seeds/prod/educational_content/05-assignments.sql

# Verificar datos insertados
psql -U gamilit_user -h localhost -d gamilit_platform -c "
SELECT
  COUNT(*) as total_assignments,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue
FROM educational_content.assignments
WHERE created_by = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
"
```

**Resultado Esperado:**
```
total_assignments | active | pending | completed | overdue
------------------+--------+---------+-----------+---------
               12 |      6 |       3 |         1 |       2
```

---

### Paso 5: Validar en Frontend (30 min)

```bash
# 1. Iniciar backend
cd apps/backend
npm run dev

# 2. Iniciar frontend
cd apps/frontend
npm run dev

# 3. Login como teacher@gamilit.com / Test1234

# 4. Navegar a Teacher → Asignaciones
```

**Validaciones en UI:**

- [ ] Se muestran 12 assignments en la lista
- [ ] Se muestran por classroom correctamente
- [ ] Estados (badges) se muestran correctamente: active, pending, completed, overdue
- [ ] Fechas due_date se muestran correctamente
- [ ] Puntos se muestran correctamente
- [ ] Metadata (módulo, dificultad) se muestra correctamente

**Verificar en DevTools → Network:**

- [ ] Se hace llamada a `/api/teacher/assignments`
- [ ] Respuesta tiene 12 assignments
- [ ] Status 200

---

### Paso 6: Testing de Integridad (30 min)

```sql
-- Verificar FKs válidas
SELECT
  a.id,
  a.title,
  c.name AS classroom_name,
  e.code AS exercise_code,
  u.email AS created_by_email
FROM educational_content.assignments a
JOIN social_features.classrooms c ON a.classroom_id = c.id
JOIN educational_content.exercises e ON a.exercise_id = e.id
JOIN public.users u ON a.created_by = u.id
WHERE a.created_by = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
ORDER BY c.name, a.created_at;

-- Verificar no hay NULLs inesperados
SELECT
  COUNT(*) FILTER (WHERE classroom_id IS NULL) as null_classrooms,
  COUNT(*) FILTER (WHERE exercise_id IS NULL) as null_exercises,
  COUNT(*) FILTER (WHERE title IS NULL) as null_titles,
  COUNT(*) FILTER (WHERE status IS NULL) as null_status
FROM educational_content.assignments
WHERE created_by = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Resultado esperado: todos en 0

-- Verificar distribución por módulo
SELECT
  metadata->>'module' AS module,
  COUNT(*) AS count
FROM educational_content.assignments
WHERE created_by = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
GROUP BY metadata->>'module'
ORDER BY module;

-- Resultado esperado:
-- module | count
-- -------+-------
-- 1      |   5
-- 2      |   4
-- 3      |   3
```

---

## 📊 CRITERIOS DE ACEPTACIÓN

### Funcionales

1. ✅ Archivo `05-assignments.sql` creado en la ruta correcta
2. ✅ 12 assignments insertados exitosamente
3. ✅ Distribución correcta: 6 active, 3 pending, 1 completed, 2 overdue
4. ✅ 3 classrooms tienen assignments
5. ✅ Todas las FK (classroom_id, exercise_id, created_by) son válidas
6. ✅ TeacherAssignmentsPage muestra los 12 assignments en frontend
7. ✅ Metadata JSON es válida y contiene campos requeridos

### Técnicos

1. ✅ SQL ejecuta sin errores
2. ✅ No hay conflictos de IDs (UUIDs únicos)
3. ✅ Validación al final del seed retorna resultados esperados
4. ✅ Integridad referencial 100% válida
5. ✅ Código SQL bien comentado y organizado
6. ✅ DELETE inicial solo afecta datos de demo (no producción)

---

## 🚨 PUNTOS CRÍTICOS

### ⚠️ NO hacer

1. **NO modificar tablas existentes** - Solo INSERT en assignments
2. **NO eliminar datos reales** - El DELETE solo afecta created_by = 'bbbb...'
3. **NO usar IDs hardcodeados para exercises** - Usar SELECT con WHERE code = 'MOD1-EX1-CRUCIGRAMA'
4. **NO crear exercises nuevos** - Usar solo los existentes
5. **NO modificar esquema** - Solo datos (seeds)

### ✅ Sí hacer

1. **SÍ verificar prerequisitos** antes de crear seed
2. **SÍ usar UUIDs únicos** (formato aaaaaaaa-0001-0000-0000-000000000001 a 000000000012)
3. **SÍ usar SELECTs para obtener IDs** de classrooms/exercises dinámicamente
4. **SÍ incluir query de validación** al final del seed
5. **SÍ hacer commit atómico** (un solo commit para este seed)

---

## 📝 COMMIT SUGERIDO

```bash
git add apps/database/seeds/prod/educational_content/05-assignments.sql
git commit -m "feat(database): add assignments seed for Teacher portal demo

- Add 12 assignments across 3 classrooms
- Distribution: 6 active, 3 pending, 1 completed, 2 overdue
- Modules 1-3 with varying difficulty (easy/medium/hard)
- Points range: 50-200
- Includes metadata for bonus, projects, evaluations

Enables Teacher portal demonstration with real data

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 🔍 VALIDACIÓN DE CALIDAD

### Checklist de Datos

- [ ] 12 assignments totales
- [ ] 3 classrooms diferentes
- [ ] 6 módulos diferentes (MOD1: 5, MOD2: 4, MOD3: 3)
- [ ] 4 estados diferentes (active, pending, completed, overdue)
- [ ] 3 niveles de dificultad (easy, medium, hard)
- [ ] Puntos variados (50, 100, 150, 200)
- [ ] Intentos variados (1, 2, 3, 5)
- [ ] Fechas variadas (NOW() + 7 days, - 3 days, + 30 days, etc.)
- [ ] Metadata JSON válida en todas
- [ ] Títulos descriptivos y únicos
- [ ] Descripciones claras y educativas

### Checklist Técnico

- [ ] SQL sintácticamente correcto
- [ ] Todos los IDs son UUIDs válidos
- [ ] No hay duplicados de ID
- [ ] SELECTs para FKs funcionan correctamente
- [ ] DELETE es seguro (solo demo data)
- [ ] Query de validación retorna valores esperados
- [ ] Archivo tiene header con metadata
- [ ] Comentarios explican cada sección

---

## 📚 RECURSOS DE REFERENCIA

### Documentación

- **Plan Detallado (Sección 2.1):** Líneas 1189-1682 del archivo `PLAN-DETALLADO-INTEGRACION-APIS.md`
- **Reporte de Análisis:** `/orchestration/reportes/REPORTE-CONSOLIDADO-PORTALES-ADMIN-TEACHER-2025-11-23.md`

### Esquemas de Base de Datos

- **Tabla Assignments:** `apps/database/schema/educational_content/assignments.sql`
- **Tabla Classrooms:** `apps/database/schema/social_features/classrooms.sql`
- **Tabla Exercises:** `apps/database/schema/educational_content/exercises.sql`

### Seeds Existentes (para referencia)

- **Classrooms:** `apps/database/seeds/prod/educational_content/02-classrooms.sql` (si existe)
- **Exercises:** `apps/database/seeds/prod/educational_content/02-exercises-module1.sql`
- **Users:** `apps/database/seeds/prod/01-demo-users.sql` (si existe)

### Backend Existente

- **Controller:** `apps/backend/src/modules/teacher/controllers/assignments.controller.ts`
- **Service:** `apps/backend/src/modules/teacher/services/assignments.service.ts`

### Frontend Existente

- **Página:** `apps/frontend/src/apps/teacher/pages/TeacherAssignmentsPage.tsx`

---

## ⏱️ TIMELINE DETALLADO

| Hora | Actividad | Entregable |
|------|-----------|------------|
| 0-0.5h | Leer documentación + esquema | Entendimiento completo |
| 0.5-1h | Verificar prerequisitos en BD | Confirmación de datos existentes |
| 1-3h | Crear archivo SQL 05-assignments.sql | Archivo completo |
| 3-3.5h | Aplicar seed en BD desarrollo | 12 assignments insertados |
| 3.5-4h | Validar en frontend + testing SQL | Validación completa |

**Total: 4 horas**

---

## 🎯 PRÓXIMOS PASOS POST-TAREA-2

Una vez completada la Tarea 2, se procederá con:

1. **Tarea 3:** UI Classroom-Teacher (3 días) - Frontend-Agent
2. **Tarea 4:** Fix Wrappers (4 horas) - Frontend-Agent
3. **Validación Final:** Testing de integración completa

**NO iniciar otras tareas hasta que Tarea 2 esté completa y validada.**

---

## 📞 CONTACTO Y SOPORTE

**Delegado por:** Architecture-Analyst
**Para dudas:** Consultar plan detallado o escalar a Architecture-Analyst
**Validación:** Architecture-Analyst revisará al completar

---

## 🎯 DEFINICIÓN DE DONE

La tarea se considera COMPLETA cuando:

1. ✅ Archivo `05-assignments.sql` existe y tiene contenido correcto
2. ✅ SQL ejecuta sin errores en BD desarrollo
3. ✅ Query de validación retorna: 12 total, 6 active, 3 pending, 1 completed, 2 overdue
4. ✅ TeacherAssignmentsPage muestra 12 assignments en frontend
5. ✅ Commit creado y pusheado
6. ✅ No hay errores de FK o integridad
7. ✅ Architecture-Analyst valida y aprueba

---

**FIN DE LA DELEGACIÓN**

**Fecha:** 2025-11-23
**Estado:** INICIADO - Esperando ejecución de Database-Agent
**Próxima Revisión:** Al completar validación en frontend
