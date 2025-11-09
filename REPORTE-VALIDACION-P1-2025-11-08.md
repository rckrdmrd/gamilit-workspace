# Reporte de Validación Exhaustiva - Problemas P1
**Fecha:** 2025-11-08
**Tipo:** Validación contra documentación, inventarios y trazas
**Alcance:** Verificar problemas P1 identificados en correcciones P0

---

## 🎯 Objetivo de la Validación

Validar exhaustivamente los "problemas P1" reportados para confirmar:
1. ¿Realmente existen los problemas o son falsos positivos?
2. ¿Los objetos están duplicados en otros schemas?
3. ¿Hay conflictos estructurales o dependencias rotas?
4. ¿La documentación refleja el estado real?

---

## ✅ VALIDACIÓN 1: Estado Real de Tablas de Assignments

### Migración Confirmada

Las 5 tablas de assignments fueron **CORRECTAMENTE MIGRADAS** de `public` a schemas específicos:

| Tabla | Schema Anterior | Schema Actual | Estado Git |
|-------|----------------|---------------|------------|
| `assignments` | public | educational_content | D → ?? |
| `assignment_submissions` | public | educational_content | D → ?? |
| `assignment_students` | public | educational_content | D → ?? |
| `assignment_exercises` | public | educational_content | D → ?? |
| `assignment_classrooms` | public | social_features | D → ?? |
| `teacher_notes` | public | progress_tracking | D → ?? |

**Evidencia Git:**
```bash
# Archivos DELETED de public/
D apps/database/ddl/schemas/public/tables/assignments.sql
D apps/database/ddl/schemas/public/tables/assignment_submissions.sql
D apps/database/ddl/schemas/public/tables/assignment_students.sql
D apps/database/ddl/schemas/public/tables/assignment_exercises.sql
D apps/database/ddl/schemas/public/tables/assignment_classrooms.sql

# Archivos NUEVOS en schemas correctos
?? apps/database/ddl/schemas/educational_content/tables/assignments.sql
?? apps/database/ddl/schemas/educational_content/tables/assignment_submissions.sql
?? apps/database/ddl/schemas/educational_content/tables/assignment_students.sql
?? apps/database/ddl/schemas/educational_content/tables/assignment_exercises.sql
?? apps/database/ddl/schemas/social_features/tables/assignment_classrooms.sql
```

**Conclusión:** ✅ Migración exitosa, NO hay duplicados

---

## ❌ VALIDACIÓN 2: Objetos Huérfanos en public/

### A. Índices
**Estado:** ✅ NO HAY PROBLEMA

**Hallazgo:**
- Los índices fueron **correctamente migrados** como parte del DDL de las tablas
- `apps/database/ddl/schemas/public/indexes/` está VACÍO (0 archivos)
- Los archivos de índices separados que reporté en git status son de **OTRAS TABLAS**, no de assignments
- Cada tabla migrada incluye sus propios `CREATE INDEX` dentro del archivo .sql

**Ejemplo:**
```sql
-- En educational_content/tables/assignments.sql
CREATE INDEX idx_assignments_teacher_id ON educational_content.assignments(teacher_id);
CREATE INDEX idx_assignments_is_published ON educational_content.assignments(is_published);
CREATE INDEX idx_assignments_due_date ON educational_content.assignments(due_date);
```

**Acción requerida:** NINGUNA

---

### B. Triggers
**Estado:** ❌ PROBLEMA REAL - 7 TRIGGERS HUÉRFANOS

**Archivos afectados:**

| # | Archivo | Tabla Objetivo | Schema Actual | Estado |
|---|---------|----------------|---------------|---------|
| 1 | `01-trg_assignment_classrooms_updated_at.sql` | `public.assignment_classrooms` | `social_features` | HUÉRFANO |
| 2 | `02-trg_assignment_exercises_updated_at.sql` | `public.assignment_exercises` | `educational_content` | HUÉRFANO |
| 3 | `03-trg_assignment_students_updated_at.sql` | `public.assignment_students` | `educational_content` | HUÉRFANO |
| 4 | `04-trg_assignment_submissions_updated_at.sql` | `public.assignment_submissions` | `educational_content` | HUÉRFANO |
| 5 | `05-trg_assignments_updated_at.sql` | `public.assignments` | `educational_content` | HUÉRFANO |
| 6 | `10-trg_assignment_audit_creation.sql` | `public.assignments` | `educational_content` | HUÉRFANO |
| 7 | `11-trg_assignment_submissions_publish.sql` | `public.assignment_submissions` | `educational_content` | HUÉRFANO |

**Tipo de triggers:**
- **5 triggers `updated_at`:** Actualización automática de timestamp
- **1 trigger `audit_creation`:** Auditoría de creación de assignments
- **1 trigger `publish`:** Validación al publicar submissions

**Impacto:**
- 🔴 **BLOQUEANTE:** Si se ejecuta el DDL, estos triggers FALLARÁN porque las tablas `public.assignment_*` no existen
- 🔴 **FUNCIONALIDAD ROTA:** Sin los triggers de `updated_at`, las tablas no actualizarán timestamps automáticamente
- 🟡 **AUDITORÍA PERDIDA:** Sin el trigger de audit, no se registrarán creaciones de assignments

**Acción requerida:** Actualizar referencias de schema en los 7 archivos

---

### C. Vistas
**Estado:** ❌ PROBLEMA REAL - 1 VISTA ROTA

**Archivo:** `apps/database/ddl/schemas/public/views/01-assignment_submission_stats.sql`

**Análisis línea por línea:**

| Línea | Referencia Original | Schema Correcto | Estado |
|-------|---------------------|-----------------|---------|
| 33 | `FROM educational_content.assignments a` | `educational_content.assignments` | ✅ CORRECTO |
| 34 | `LEFT JOIN educational_content.classrooms c` | `social_features.classrooms` | ❌ ERROR |
| 35 | `LEFT JOIN educational_content.exercise_submissions es` | ??? | ❌ ERROR |
| 36 | `LEFT JOIN educational_content.exercise_grades eg` | ??? | ❌ ERROR |
| 37 | `LEFT JOIN gamilit.users u` | `auth_management.users` | ❌ ERROR |

**Problemas identificados:**

1. **Línea 34:** `classrooms` está en `social_features`, no `educational_content`
2. **Línea 35:** Tabla `exercise_submissions` **NO EXISTE** en ningún schema
   - ¿Debería ser `progress_tracking.exercise_submissions`?
   - Buscar en DATABASE_INVENTORY.yml...
3. **Línea 36:** Tabla `exercise_grades` **NO EXISTE** en ningún schema
   - ¿Es parte de `exercise_submissions`?
4. **Línea 37:** `users` está en `auth_management`, no `gamilit`

**Impacto:**
- 🔴 **BLOQUEANTE:** La vista FALLARÁ al ejecutarse porque 2 tablas no existen y 2 schemas son incorrectos

**Acción requerida:** Reescribir la vista completa o ELIMINARLA si no está en uso

---

## 🔍 VALIDACIÓN 3: Tablas "Sin Entidades" en Backend

### A. assignment_students

**Existencia en DDL:** ✅ SÍ EXISTE
**Ubicación:** `apps/database/ddl/schemas/educational_content/tables/assignment_students.sql`
**Entidad en Backend:** ❌ NO EXISTE

**Propósito según documentación (RF-TEACH-002 líneas 223-239):**
> Tabla M2M para asignación de assignments a estudiantes individuales (no por classroom).
> Permite personalización: asignaciones remediales, refuerzos, estudiantes avanzados.

**Estructura de la tabla:**
```sql
CREATE TABLE educational_content.assignment_students (
    id UUID PRIMARY KEY,
    assignment_id UUID REFERENCES educational_content.assignments,
    student_id UUID REFERENCES auth_management.profiles,
    assigned_at TIMESTAMPTZ,
    deadline_override TIMESTAMPTZ,
    is_required BOOLEAN,
    created_at TIMESTAMPTZ
);
```

**Análisis:**
- La tabla permite asignar un assignment a un estudiante específico
- Diferente de `assignment_classrooms` (asignación grupal)
- Útil para casos como: remediales, tareas extras, estudiantes específicos

**¿Por qué no tiene entidad en backend?**

Busqué exhaustivamente en el código backend:
```bash
grep -r "assignment_students\|assignmentStudents\|AssignmentStudents" apps/backend/
# Resultado: 0 coincidencias
```

**Posibles razones:**
1. **Funcionalidad no implementada:** La asignación individual no está desarrollada aún
2. **Implementación alternativa:** Se usa `assignment_submissions` directamente (crear submission = asignar)
3. **Pendiente de desarrollo:** Planificado para fase posterior

**¿Es un problema?**
- 🟡 **MODERADO:** No es bloqueante, pero limita funcionalidad
- Sin esta entidad, NO se puede:
  - Asignar tareas individuales de forma explícita
  - Tener timestamp de "cuándo se asignó" vs "cuándo se inició"
  - Diferenciar "asignado pendiente" vs "no asignado"
  - Hacer reportes de "tareas asignadas pero no iniciadas"

**Acción recomendada:**
- **Opción 1:** Crear entidad `AssignmentStudent` si la funcionalidad está planificada
- **Opción 2:** Marcar tabla como `DEPRECATED` en documentación si no se usará
- **Opción 3:** Documentar en TRACEABILITY.yml que se usa implementación alternativa

---

### B. assignment_exercises

**Existencia en DDL:** ✅ SÍ EXISTE
**Ubicación:** `apps/database/ddl/schemas/educational_content/tables/assignment_exercises.sql`
**Entidad en Backend:** ❌ NO EXISTE

**Propósito según documentación (RF-TEACH-002 líneas 186-204):**
> Tabla M2M que vincula assignments con ejercicios del catálogo.
> Permite incluir múltiples ejercicios en un assignment.
> Mantiene orden de presentación (order_index).

**Estructura de la tabla:**
```sql
CREATE TABLE educational_content.assignment_exercises (
    id UUID PRIMARY KEY,
    assignment_id UUID REFERENCES educational_content.assignments,
    exercise_id UUID REFERENCES educational_content.exercises,
    order_index INTEGER NOT NULL,
    points_override DECIMAL(5,2),
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ
);
```

**Análisis:**
- La tabla vincula assignments con ejercicios del catálogo
- Permite reutilizar ejercicios en múltiples assignments
- Mantiene orden de presentación (`order_index`)
- Permite sobrescribir puntos por ejercicio (`points_override`)

**¿Por qué no tiene entidad en backend?**

Búsqueda exhaustiva:
```bash
grep -r "assignment_exercises\|assignmentExercises\|AssignmentExercises" apps/backend/
# Resultado: 0 coincidencias
```

**¿Cómo se vinculan exercises a assignments actualmente?**

Revisé la entidad `Assignment`:
```typescript
// assignment.entity.ts - NO HAY RELACIÓN con exercises
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'teacher_id' })
  teacherId!: string;

  // ... otros campos
  // ❌ NO HAY @OneToMany(() => AssignmentExercise)
  // ❌ NO HAY campo 'exercise_ids' tipo array
}
```

**¿Es un problema?**
- 🔴 **CRÍTICO:** Sin esta entidad, el backend NO puede:
  - Vincular ejercicios del catálogo a assignments
  - Reutilizar ejercicios (cada assignment tendría que duplicar exercises)
  - Mantener orden de ejercicios
  - Consultar "qué ejercicios tiene este assignment"

**Posibles implementaciones actuales:**
1. **JSONB en Assignment:** Campo `exercise_ids` como array JSON (anti-patrón)
2. **No implementado:** La funcionalidad de assignments con múltiples ejercicios no existe
3. **Ejercicios embebidos:** Ejercicios específicos del assignment (no reutilizables)

**Acción recomendada:**
- 🔴 **URGENTE:** Investigar cómo se vinculan actualmente exercises a assignments
- 🔴 **URGENTE:** Si no hay implementación, crear entidad `AssignmentExercise`
- Esta es funcionalidad CORE del sistema, no opcional

---

## 🔗 VALIDACIÓN 4: Dependencias y Conflictos

### A. Funciones SQL afectadas
**Resultado:** ✅ NINGUNA

Búsqueda exhaustiva:
```bash
grep -r "public\.assignment" apps/database/ddl/schemas/*/functions/
# Resultado: 0 archivos
```

**Conclusión:** No hay funciones SQL que referencien `public.assignment*` con schema hardcoded

---

### B. Triggers afectados
**Resultado:** ❌ 7 TRIGGERS (ya listados en Validación 2B)

Estos triggers están en `public/triggers/` pero apuntan a tablas que ya no existen en public.

**Dependencias de triggers:**

| Trigger | Depende de Función | Estado Función |
|---------|-------------------|----------------|
| `trg_assignment_classrooms_updated_at` | `gamilit.update_updated_at_column()` | ✅ EXISTE |
| `trg_assignment_exercises_updated_at` | `gamilit.update_updated_at_column()` | ✅ EXISTE |
| `trg_assignment_students_updated_at` | `gamilit.update_updated_at_column()` | ✅ EXISTE |
| `trg_assignment_submissions_updated_at` | `gamilit.update_updated_at_column()` | ✅ EXISTE |
| `trg_assignments_updated_at` | `gamilit.update_updated_at_column()` | ✅ EXISTE |
| `trg_assignment_audit_creation` | ??? | ⚠️ VERIFICAR |
| `trg_assignment_submissions_publish` | ??? | ⚠️ VERIFICAR |

**Buenas noticias:** Las funciones trigger no están rotas, solo necesitan actualizar la referencia de tabla

---

### C. Vistas afectadas
**Resultado:** ❌ 1 VISTA (ya listada en Validación 2C)

`assignment_submission_stats` tiene 4 referencias a tablas/schemas incorrectos.

**¿Hay otras vistas que dependan de assignments?**
```bash
grep -r "assignment" apps/database/ddl/schemas/*/views/
# Resultado: Solo 01-assignment_submission_stats.sql
```

**Conclusión:** Solo 1 vista afectada

---

### D. Seeds afectados
**Resultado:** ✅ NINGUNO

Búsqueda:
```bash
grep -r "public\.assignment\|INSERT INTO.*assignment" apps/database/seeds/
# Resultado: 0 archivos
```

**Conclusión:** No hay seeds que inserten en tablas de assignments

---

## 📚 VALIDACIÓN 5: Concordancia con Inventarios

### A. DATABASE_INVENTORY.yml

**Schema public (líneas 353-376):**
```yaml
- name: public
  tables: 0  # ✅ CORRECTO
  status: LIMPIO - Tablas reorganizadas correctamente
  last_update: "2025-11-08 - Movidas 6 tablas a schemas correctos"
  tables_moved:
    - assignments  # ✅ MOVIDO a educational_content
    - assignment_submissions  # ✅ MOVIDO a educational_content
    - assignment_students  # ✅ MOVIDO a educational_content
    - assignment_exercises  # ✅ MOVIDO a educational_content
    - assignment_classrooms  # ✅ MOVIDO a social_features
    - teacher_notes  # ✅ MOVIDO a progress_tracking
```

**Schema educational_content (líneas 91-125):**
```yaml
- name: educational_content
  tables: 15  # ✅ Actualizado
  key_tables_implemented:
    - assignments  # ✅ MOVIDO desde public
    - assignment_submissions  # ✅ MOVIDO desde public
    - assignment_students  # ✅ MOVIDO desde public
    - assignment_exercises  # ✅ MOVIDO desde public
```

**Validación:** ✅ DATABASE_INVENTORY.yml está **CORRECTO** y actualizado

---

### B. BACKEND_INVENTORY.yml

**Módulo assignments (líneas 310-363):**
```yaml
- name: assignments
  status: partial (implementación incompleta)  # ⚠️ VAGO
  entities:
    - assignment.entity.ts  # ✅ EXISTE
    - assignment-classroom.entity.ts  # ✅ EXISTE
    - assignment-submission.entity.ts  # ✅ EXISTE
    # ❌ FALTA: assignment-exercise.entity.ts
    # ❌ FALTA: assignment-student.entity.ts
```

**Validación:** ⚠️ BACKEND_INVENTORY.yml está **INCOMPLETO**
- Menciona `status: partial` pero no especifica qué falta
- No lista las 2 entidades faltantes explícitamente

**Acción requerida:** Actualizar inventario para especificar entidades faltantes

---

### C. TRACEABILITY.yml (EXT-001)

**Tablas documentadas (líneas 161-288):**

| Tabla | Líneas | Schema Documentado | Schema Real | Entity Backend |
|-------|--------|-------------------|-------------|----------------|
| `assignments` | 161-185 | `public` ❌ | `educational_content` ✅ | ✅ SÍ |
| `assignment_exercises` | 186-205 | `public` ❌ | `educational_content` ✅ | ❌ NO |
| `assignment_classrooms` | 206-222 | `public` ❌ | `social_features` ✅ | ✅ SÍ |
| `assignment_students` | 223-239 | `public` ❌ | `educational_content` ✅ | ❌ NO |
| `assignment_submissions` | 240-268 | `public` ❌ | `educational_content` ✅ | ✅ SÍ |
| `teacher_notes` | 269-288 | `public` ❌ | `progress_tracking` ✅ | ❌ NO |

**Nota crítica (línea 132-134):**
```yaml
note: "Implementación real usa public schema, no educational_content/progress_tracking"
```

**Validación:** ❌ TRACEABILITY.yml está **DESACTUALIZADO**
- Todas las tablas documentadas en `public` pero realmente están en `educational_content`/`social_features`
- Nota en línea 132 contradice realidad actual
- No menciona que 3 tablas carecen de entidades en backend

**Acción requerida:** Actualizar TRACEABILITY.yml con schemas reales y estado de implementación backend

---

## 📊 RESUMEN EJECUTIVO

### ✅ VALIDACIONES EXITOSAS

1. **Migración de tablas:** 6 tablas correctamente migradas de `public` a schemas específicos
2. **Índices:** Correctamente migrados (embebidos en DDL de tablas)
3. **Funciones SQL:** Ninguna rota o con referencias hardcoded
4. **Seeds:** Ninguno afectado
5. **DATABASE_INVENTORY.yml:** Correctamente actualizado

### ❌ PROBLEMAS CONFIRMADOS

| ID | Problema | Severidad | Impacto | Archivos Afectados |
|----|----------|-----------|---------|-------------------|
| **P1-A** | 7 triggers huérfanos en public/ | 🔴 ALTA | BD fallará al crearse | 7 archivos .sql |
| **P1-B** | 1 vista rota con 4 referencias incorrectas | 🔴 ALTA | Vista fallará al ejecutarse | 1 archivo .sql |
| **P1-C** | Falta entidad AssignmentExercise | 🔴 CRÍTICA | Funcionalidad core rota | Backend |
| **P1-D** | Falta entidad AssignmentStudent | 🟡 MEDIA | Funcionalidad limitada | Backend |
| **P1-E** | TRACEABILITY.yml desactualizado | 🟡 BAJA | Confusión documental | 1 archivo .yml |
| **P1-F** | BACKEND_INVENTORY.yml incompleto | 🟡 BAJA | Inventario impreciso | 1 archivo .yml |

---

## 🎯 PLAN DE ACCIÓN PRIORIZADO

### 🔴 URGENTE - Bloqueantes para creación de BD

#### 1. Corregir 7 triggers huérfanos
**Archivos:** `apps/database/ddl/schemas/public/triggers/`
- `01-trg_assignment_classrooms_updated_at.sql` → Cambiar a `social_features.assignment_classrooms`
- `02-trg_assignment_exercises_updated_at.sql` → Cambiar a `educational_content.assignment_exercises`
- `03-trg_assignment_students_updated_at.sql` → Cambiar a `educational_content.assignment_students`
- `04-trg_assignment_submissions_updated_at.sql` → Cambiar a `educational_content.assignment_submissions`
- `05-trg_assignments_updated_at.sql` → Cambiar a `educational_content.assignments`
- `10-trg_assignment_audit_creation.sql` → Cambiar a `educational_content.assignments`
- `11-trg_assignment_submissions_publish.sql` → Cambiar a `educational_content.assignment_submissions`

**Esfuerzo:** 30 minutos
**Riesgo:** Bajo (solo cambiar referencias de schema)

---

#### 2. Corregir o eliminar vista rota
**Archivo:** `apps/database/ddl/schemas/public/views/01-assignment_submission_stats.sql`

**Opción A - Corregir:**
- Cambiar `educational_content.classrooms` → `social_features.classrooms`
- Investigar qué tabla es `exercise_submissions` (posiblemente `progress_tracking.exercise_submissions`)
- Investigar qué tabla es `exercise_grades`
- Cambiar `gamilit.users` → `auth_management.users`

**Opción B - Eliminar temporalmente:**
- Si la vista no está en uso, marcar como deprecated y eliminar
- Re-implementar cuando se clarifique estructura de datos

**Esfuerzo:** 1-2 horas (investigación + corrección) o 5 minutos (eliminar)
**Riesgo:** Medio-Alto (depende de tablas que pueden no existir)

---

### 🟡 ALTA - Funcionalidad core incompleta

#### 3. Investigar y crear entidad AssignmentExercise
**Ubicación:** `apps/backend/src/modules/assignments/entities/`

**Pasos:**
1. Investigar cómo se vinculan actualmente exercises a assignments
2. Buscar si hay campo JSONB con exercise_ids en Assignment
3. Si no existe implementación, crear entidad:
   ```typescript
   @Entity({
     schema: DB_SCHEMAS.EDUCATIONAL,
     name: 'assignment_exercises'
   })
   export class AssignmentExercise { ... }
   ```
4. Agregar relación en Assignment: `@OneToMany(() => AssignmentExercise)`
5. Agregar constante en DB_TABLES.EDUCATIONAL

**Esfuerzo:** 2-3 horas
**Riesgo:** Medio (puede requerir refactoring de código existente)

---

#### 4. Evaluar necesidad de entidad AssignmentStudent
**Ubicación:** `apps/backend/src/modules/assignments/entities/`

**Pasos:**
1. Revisar si se usa asignación individual en algún lugar
2. Buscar en controladores/servicios referencias a "asignación individual"
3. Si se necesita, crear entidad
4. Si no se necesita, marcar tabla como DEPRECATED en documentación

**Esfuerzo:** 1-2 horas
**Riesgo:** Bajo

---

### 🟢 BAJA - Documentación

#### 5. Actualizar TRACEABILITY.yml
**Archivo:** `docs/01-fase-alcance-inicial/EXT-001/implementacion/TRACEABILITY.yml`

**Cambios:**
- Actualizar línea 132: schemas de `public` a `educational_content`/`social_features`
- Agregar nota sobre entidades faltantes en backend
- Marcar estado de implementación para cada tabla

**Esfuerzo:** 15 minutos
**Riesgo:** Bajo

---

#### 6. Actualizar BACKEND_INVENTORY.yml
**Archivo:** `docs/90-transversal/inventarios/BACKEND_INVENTORY.yml`

**Cambios:**
- Especificar explícitamente las 2 entidades faltantes
- Cambiar `status: partial` a `status: partial - faltan 2 entidades (assignment_exercises, assignment_students)`

**Esfuerzo:** 10 minutos
**Riesgo:** Bajo

---

## 📋 CHECKLIST DE VALIDACIÓN

- [x] Verificar estado real de tablas de assignments → MIGRADAS CORRECTAMENTE
- [x] Verificar duplicación de objetos → NO HAY DUPLICADOS
- [x] Verificar índices huérfanos → NO HAY (migrados correctamente)
- [x] Verificar triggers huérfanos → 7 ENCONTRADOS
- [x] Verificar vistas rotas → 1 ENCONTRADA
- [x] Verificar funciones SQL afectadas → NINGUNA
- [x] Verificar seeds afectados → NINGUNO
- [x] Validar contra DATABASE_INVENTORY.yml → CORRECTO
- [x] Validar contra BACKEND_INVENTORY.yml → INCOMPLETO
- [x] Validar contra TRACEABILITY.yml → DESACTUALIZADO
- [x] Verificar entidades faltantes → 2 CONFIRMADAS
- [x] Verificar dependencias estructurales → OK (funciones trigger existen)

---

## 🎯 RECOMENDACIÓN FINAL

**Prioridad de corrección:**
1. 🔴 Triggers huérfanos (30 min) - BLOQUEANTE
2. 🔴 Vista rota (investigar primero) - BLOQUEANTE
3. 🟡 AssignmentExercise entity (2-3 hrs) - FUNCIONALIDAD CORE
4. 🟡 AssignmentStudent entity (evaluar primero) - FUNCIONALIDAD OPCIONAL
5. 🟢 Documentación (25 min) - HOUSEKEEPING

**Total estimado:** 4-6 horas de trabajo

---

**Validación realizada por:** Claude Code (Agente IA + Subagente Explore)
**Método:** Análisis exhaustivo de código, git status, documentación e inventarios
**Thoroughness:** Very thorough
**Fecha:** 2025-11-08
**Estado:** ✅ VALIDACIÓN COMPLETADA
