# DISCREPANCIAS ENCONTRADAS: Sistema de Assignments

**Fecha:** 2025-11-08
**Tarea:** FASE 2 - TASK 2.3
**Issue:** ISSUE-008
**Epic:** EXT-001 - Portal de Maestros

---

## 📋 Resumen

Durante la documentación del sistema de assignments, se encontraron **discrepancias significativas** entre el diseño inicial documentado en `TRACEABILITY.yml` y la implementación real en la base de datos.

---

## 🔍 Discrepancias Identificadas

### 1. Schema Incorrecto en Documentación

**Diseño documentado (TRACEABILITY.yml original):**
- `educational_content.assignments`
- `educational_content.assignment_submissions`
- `progress_tracking.teacher_notes`

**Implementación real:**
- `public.assignments`
- `public.assignment_submissions`
- `public.teacher_notes`
- `public.assignment_classrooms`
- `public.assignment_exercises`
- `public.assignment_students`

**Impacto:** 🔴 ALTO
- Cualquier query basado en la documentación fallaría
- Backend/frontend deben usar schema `public`, no `educational_content`

---

### 2. Tablas Faltantes en Documentación

**Documentado:** 3 tablas
- assignments
- assignment_submissions
- teacher_notes

**Real:** 6 tablas
- assignments ✅
- assignment_classrooms ❌ NO DOCUMENTADA
- assignment_exercises ❌ NO DOCUMENTADA
- assignment_students ❌ NO DOCUMENTADA
- assignment_submissions ✅
- teacher_notes ✅

**Impacto:** 🟡 MEDIO
- 3 tablas M2M completamente sin documentar
- Sistema real más completo que diseño inicial

---

### 3. Diseño de Almacenamiento de Ejercicios

**Diseño documentado:**
```yaml
columns:
  - content_refs (JSONB) - Referencias a módulos/ejercicios
```

**Implementación real:**
```sql
CREATE TABLE public.assignment_exercises (
    assignment_id UUID REFERENCES public.assignments(id),
    exercise_id UUID REFERENCES educational_content.exercises(id),
    order_index INTEGER,
    UNIQUE(assignment_id, exercise_id)
);
```

**Ventajas de la implementación real:**
- ✅ Mejor normalización (vs JSONB)
- ✅ Integridad referencial con FK
- ✅ Indexes optimizados para queries
- ✅ Más fácil de consultar (JOIN vs JSON parsing)

**Impacto:** 🟢 POSITIVO
- Implementación real es superior al diseño inicial

---

### 4. Columnas Diferentes en `assignments`

**Diseño documentado:**
```yaml
columns:
  - classroom_id (UUID, FK a classrooms)
  - priority (VARCHAR(20))
  - content_refs (JSONB)
```

**Implementación real:**
```sql
CREATE TABLE public.assignments (
    -- NO tiene classroom_id (relación es M2M en assignment_classrooms)
    -- NO tiene priority
    -- NO tiene content_refs (usa assignment_exercises M2M)
    assignment_type VARCHAR(50) CHECK (assignment_type IN ('practice', 'quiz', 'exam', 'homework')),
    total_points INTEGER DEFAULT 100,
    is_published BOOLEAN DEFAULT false
);
```

**Diferencias:**
- ❌ `classroom_id`: Removido (M2M permite asignar a múltiples classrooms)
- ❌ `priority`: No implementado (usa `assignment_type` en su lugar)
- ❌ `content_refs`: Removido (usa M2M normalizado)
- ✅ `assignment_type`: Agregado (practice/quiz/exam/homework)
- ✅ `total_points`: Agregado (control de puntuación)
- ✅ `is_published`: Agregado (draft vs published workflow)

**Impacto:** 🟡 MEDIO
- Diseño real más flexible y completo
- Permite asignación a múltiples classrooms simultáneamente

---

### 5. Columnas Diferentes en `assignment_submissions`

**Diseño documentado:**
```yaml
status: pending/submitted/graded
grade: NUMERIC(5,2)
```

**Implementación real:**
```sql
status VARCHAR(50) CHECK (status IN ('not_started', 'in_progress', 'submitted', 'graded')),
score NUMERIC(5,2)
```

**Diferencias:**
- ✅ Estado `not_started` agregado (tracking antes de inicio)
- ✅ Estado `in_progress` agregado (tracking durante trabajo)
- 🔄 `grade` renombrado a `score` (más claro)

**Impacto:** 🟢 POSITIVO
- Mejor granularidad en tracking de estado

---

### 6. Columnas Diferentes en `teacher_notes`

**Diseño documentado:**
```yaml
columns:
  - classroom_id (UUID, FK a classrooms, nullable)
  - is_alert (BOOLEAN) - Si requiere seguimiento
  - updated_at (TIMESTAMPTZ)
```

**Implementación real:**
```sql
CREATE TABLE public.teacher_notes (
    -- NO tiene classroom_id
    -- NO tiene is_alert
    -- NO tiene updated_at
    is_private BOOLEAN DEFAULT true
);
```

**Diferencias:**
- ❌ `classroom_id`: No implementado (notas son por student, no por classroom)
- ❌ `is_alert`: No implementado (simplificado)
- ❌ `updated_at`: No implementado (solo created_at)
- ✅ `is_private`: Agregado (control de privacidad)

**Impacto:** 🟢 NEUTRAL
- Implementación más simple pero funcional

---

## 📊 Análisis Comparativo

| Aspecto | Diseño Documentado | Implementación Real | Evaluación |
|---------|-------------------|---------------------|------------|
| **Schemas** | educational_content, progress_tracking | public | ❌ Documentación incorrecta |
| **Tablas** | 3 tablas | 6 tablas | ⚠️ Falta documentar 3 tablas |
| **Normalización** | JSONB para ejercicios | M2M normalizado | ✅ Mejora significativa |
| **Asignación** | 1 classroom por assignment | M2M múltiples classrooms | ✅ Más flexible |
| **Estados submission** | 3 estados | 4 estados | ✅ Mejor granularidad |
| **Teacher notes** | Más complejo | Simplificado | 🔄 Trade-off aceptable |

---

## ✅ Correcciones Realizadas

### 1. RF-TEACH-002 Creado
**Archivo:** `docs/03-fase-extensiones/EXT-001-portal-maestros/requerimientos/RF-TEACH-002-assignment-system.md`

**Contenido:**
- ✅ Documentación completa de las 6 tablas reales
- ✅ Schemas correctos (`public.*`)
- ✅ Columnas reales con tipos y constraints
- ✅ Índices documentados
- ✅ Triggers documentados
- ✅ Relaciones entre tablas
- ✅ Casos de uso
- ✅ Flujos de trabajo
- ✅ Métricas y analytics
- ✅ Validaciones y RLS
- ✅ Nota sobre discrepancias encontradas

---

### 2. TRACEABILITY.yml Actualizado
**Archivo:** `docs/03-fase-extensiones/EXT-001-portal-maestros/implementacion/TRACEABILITY.yml`

**Cambios:**
```yaml
# Antes:
schemas_used:
  - name: educational_content
    tables_new: 2
  - name: progress_tracking
    tables_new: 1

# Después:
schemas_used:
  - name: public
    tables_new: 6
    note: "Implementación real usa public schema"
```

**Tablas actualizadas:**
- ✅ Agregadas 3 tablas M2M faltantes
- ✅ Schemas corregidos a `public.*`
- ✅ Columnas actualizadas según implementación real
- ✅ Índices y triggers documentados
- ✅ Referencias a RF-TEACH-002 agregadas
- ✅ Notas sobre discrepancias incluidas

---

## 🎯 Estado Actual

### Antes de Corrección
- ❌ Schema incorrecto (educational_content vs public)
- ❌ 3 tablas sin documentar
- ❌ Diseño JSONB documentado (no implementado)
- ❌ Columnas incorrectas/faltantes

### Después de Corrección
- ✅ Schema correcto (`public`)
- ✅ 6 tablas completamente documentadas
- ✅ Diseño M2M normalizado documentado
- ✅ Todas las columnas reales documentadas
- ✅ RF-TEACH-002 creado (17+ KB de docs)
- ✅ TRACEABILITY.yml actualizado

---

## 💡 Lecciones Aprendidas

### 1. Documentación vs Implementación
**Problema:** Diseño inicial cambió durante implementación, documentación no se actualizó

**Solución:**
- Validar implementación vs documentación periódicamente
- Actualizar docs cuando implementación diverge del diseño
- Usar TRACEABILITY para mantener coherencia

---

### 2. Schemas Flexibles
**Observación:** Tablas colocadas en `public` en vez de schemas específicos

**Ventajas:**
- Menos dependencias entre schemas
- Más fácil de refactorizar

**Desventajas:**
- Menos organización lógica
- Schema `public` puede volverse sobrecargado

**Recomendación:**
- Considerar mover a schema dedicado `teacher_portal` en futuro
- Por ahora, mantener en `public` (no breaking change)

---

### 3. Normalización vs JSONB
**Decisión correcta:** Usar M2M en vez de JSONB para `assignment_exercises`

**Beneficios observados:**
- Integridad referencial garantizada
- Queries más simples y eficientes
- Mejor uso de índices
- Más fácil de reportear/analizar

**Cuándo usar JSONB:**
- Datos verdaderamente flexibles/variables
- Sin necesidad de joins frecuentes
- Datos no críticos para integridad

**Cuándo usar M2M:**
- Relaciones entre entidades existentes
- Necesidad de integridad referencial
- Queries/reportes frecuentes

---

## 🔄 Próximos Pasos

### Inmediato (Completado)
- ✅ Crear RF-TEACH-002
- ✅ Actualizar TRACEABILITY.yml
- ✅ Documentar discrepancias (este archivo)

### Futuro (Recomendado)
- 📋 Validar que backend use schemas correctos (`public.*`)
- 📋 Validar que frontend queries referencien tablas correctas
- 📋 Considerar migración a schema dedicado `teacher_portal`
- 📋 Documentar funciones faltantes:
  - `assign_to_classroom()` (mencionada en TRACEABILITY pero no encontrada)
  - `calculate_classroom_progress()` (mencionada en TRACEABILITY pero no encontrada)
  - `get_grading_queue()` (mencionada en TRACEABILITY pero no encontrada)

---

## 📈 Impacto de las Correcciones

### Cobertura de Documentación
- **Antes:** 50% (3/6 tablas documentadas)
- **Después:** 100% (6/6 tablas documentadas)
- **Mejora:** +50% ✅

### Precisión de TRACEABILITY
- **Antes:** Schemas incorrectos, columnas incorrectas
- **Después:** Schemas correctos, columnas reales documentadas
- **Calidad:** CRÍTICO → COMPLETO ✅

### Usabilidad para Desarrolladores
- **Antes:** Docs llevarían a errores (schema incorrecto)
- **Después:** Docs reflejan implementación real
- **Impacto:** 🔴 CRÍTICO → 🟢 FUNCIONAL ✅

---

## 📝 Conclusión

Las discrepancias encontradas eran **significativas y críticas**:
- Schema incorrecto habría causado errores de implementación
- Tablas M2M no documentadas dejaban funcionalidad sin explicar
- Diseño JSONB vs M2M mostraba divergencia importante

**Estado actual:** ✅ RESUELTO
- Documentación ahora refleja implementación real
- 6 tablas completamente documentadas en RF-TEACH-002
- TRACEABILITY.yml actualizado con datos correctos
- Discrepancias identificadas y explicadas

**Issue ISSUE-008:** ✅ COMPLETADO

---

**Generado:** 2025-11-08
**Tarea:** FASE 2 - TASK 2.3
**Estado:** ✅ COMPLETADA
**Archivos creados/modificados:** 3
- RF-TEACH-002-assignment-system.md (NUEVO, 17KB)
- TRACEABILITY.yml (ACTUALIZADO)
- DISCREPANCIAS-ASSIGNMENTS-ENCONTRADAS.md (NUEVO, este archivo)
