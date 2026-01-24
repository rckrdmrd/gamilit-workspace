# ANÁLISIS: CORR-006 - Crear Seeds de Assignments para Portal Teacher

**Fecha:** 2025-11-24
**Agente:** Database-Agent
**Tarea ID:** CORR-006
**Prioridad:** P0

---

## Contexto de la Tarea

### Módulo de GAMILIT
Portal Teacher - Sistema de gestión de asignaciones

### Objetivo
Crear seeds de datos de ejemplo para la tabla `educational_content.assignments` que permitan al Portal Teacher mostrar asignaciones de ejemplo durante demos y desarrollo.

### Problema Identificado
- El Portal Teacher mostraba listas vacías de assignments
- Backend tiene endpoints funcionales (`/api/teacher/assignments`)
- Frontend consume APIs correctamente
- Base de datos NO tenía datos de ejemplo
- El archivo seed existente (`05-assignments.sql`) tenía referencias a tablas inexistentes

### Entidades de Negocio
- **assignments**: Tareas/asignaciones creadas por profesores para estudiantes

---

## Inventario Consultado

- [x] MASTER_INVENTORY.yml revisado
- [x] DDL de tabla assignments analizado
- [x] Seeds existentes de educational_content revisados
- [x] No existen objetos duplicados
- [x] Identificadas inconsistencias en seed anterior

---

## Análisis de Estructura DDL

### Tabla: educational_content.assignments

**Ubicación DDL:** `apps/database/ddl/schemas/educational_content/tables/05-assignments.sql`

**Columnas existentes:**
```sql
- id UUID PRIMARY KEY
- teacher_id UUID (FK a auth.users)
- title VARCHAR(255)
- description TEXT
- assignment_type VARCHAR(50) ('practice', 'quiz', 'exam', 'homework')
- due_date TIMESTAMP WITH TIME ZONE
- total_points INTEGER
- is_published BOOLEAN
- created_at TIMESTAMP WITH TIME ZONE
- updated_at TIMESTAMP WITH TIME ZONE
```

**Problema detectado en seed anterior:**
El archivo `05-assignments.sql` v1.0 (commit db82449) intentaba insertar en tablas que NO EXISTEN:
- `social_features.assignment_classrooms` ❌ NO EXISTE en DDL
- `educational_content.assignment_exercises` ❌ NO EXISTE en DDL

Esto causaba que el seed fallara silenciosamente y no se insertaran assignments.

---

## Diseño Propuesto

### Estructura de Seeds

**9 assignments distribuidos en 3 módulos conceptuales:**

1. **Módulo 1 - Comprensión Literal (3 assignments)**
   - Homework vencido (hace 7 días) - Crucigrama
   - Quiz activo (vence en 2 días) - Línea de Tiempo
   - Practice pendiente (vence en 10 días) - Mapa Conceptual

2. **Módulo 2 - Comprensión Inferencial (3 assignments)**
   - Homework OVERDUE (vencido hace 3 días) - Causa-Efecto
   - Quiz activo (vence en 5 días) - Rueda de Inferencias
   - Practice pendiente (vence en 15 días) - Análisis de Decisiones

3. **Módulo 3 - Comprensión Crítica (3 assignments)**
   - Homework activo (vence en 7 días) - Ensayo Crítico
   - Quiz activo URGENTE (vence en 3 días) - Evaluación Express
   - Exam borrador (vence en 30 días) - Proyecto Final

### Distribución de Fechas

| Estado | Cantidad | Descripción |
|--------|----------|-------------|
| OVERDUE | 2 | Vencidos (hace 7 y 3 días) |
| SOON | 2 | Vencen en menos de 3 días |
| ACTIVE | 3 | Vencen entre 3-15 días |
| FUTURE | 1 | Vence en más de 15 días |
| DRAFT | 1 | No publicado aún |

### Tipos de Assignment

| Tipo | Cantidad | Points Range |
|------|----------|--------------|
| homework | 3 | 100-200 pts |
| quiz | 3 | 50-100 pts |
| practice | 2 | 75-150 pts |
| exam | 1 | 300 pts |

---

## Validación Anti-Duplicación

✅ **No existe seed productivo anterior funcional**
- El seed v1.0 fallaba por referencias a tablas inexistentes
- Esta es una corrección completa del seed

✅ **No hay tablas duplicadas**
- Solo existe `educational_content.assignments` en DDL

✅ **Funcionalidad nueva**
- Los assignments son datos de ejemplo necesarios para Portal Teacher

---

## Análisis de Impacto

### Cambios Requeridos
- **Archivos modificados:** 2
  - `seeds/prod/educational_content/05-assignments.sql` (reescrito)
  - `create-database.sh` (comentario actualizado)

### Tablas afectadas
- `educational_content.assignments` (INSERT de 9 registros)

### Dependencias
- Requiere: `auth.users` (teacher@gamilit.com debe existir)
- Requiere: función `gamilit.now_mexico()` para timestamps

### Sin dependencias circulares
- ✅ No hay dependencias circulares
- ✅ Orden de carga correcto en create-database.sh (línea 517)

---

## Riesgos Identificados

### Riesgo 1: Función gamilit.now_mexico() no disponible
**Probabilidad:** Baja
**Impacto:** Alto
**Mitigación:** La función ya existe en DDL (gamilit schema functions)

### Riesgo 2: Teacher user no existe
**Probabilidad:** Baja
**Impacto:** Alto
**Mitigación:** Seed valida existencia con RAISE EXCEPTION si no existe

### Riesgo 3: Timestamps relativos pueden causar inconsistencias
**Probabilidad:** Media
**Impacto:** Bajo
**Mitigación:** Los timestamps son relativos (NOW() +/- INTERVAL) para que funcionen en cualquier fecha de carga

---

## Decisiones de Diseño

### ✅ Usar gen_random_uuid() en lugar de UUIDs hardcodeados
**Razón:** Evita conflictos en múltiples ejecuciones y sigue política de carga limpia

### ✅ Usar fechas relativas (gamilit.now_mexico() +/- INTERVAL)
**Razón:** Los assignments siempre tendrán fechas relevantes respecto a la fecha de carga

### ✅ Incluir variedad de estados (OVERDUE, SOON, FUTURE, DRAFT)
**Razón:** Portal Teacher puede demostrar todas las funcionalidades de gestión de assignments

### ✅ Eliminar referencias a tablas inexistentes
**Razón:** El seed v1.0 fallaba por intentar insertar en assignment_classrooms y assignment_exercises

### ✅ Incluir bloques de validación con RAISE NOTICE
**Razón:** Facilita debugging y confirma que los seeds se cargaron correctamente

---

## Conclusión del Análisis

✅ **Tarea viable y necesaria**
✅ **Diseño alineado con DDL real**
✅ **Sin riesgos críticos identificados**
✅ **Corrige problema crítico del seed v1.0**
✅ **Permite al Portal Teacher mostrar datos de ejemplo**

**Siguiente paso:** Crear plan de implementación (02-PLAN.md)
