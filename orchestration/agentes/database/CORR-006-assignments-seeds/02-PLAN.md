# PLAN DE IMPLEMENTACIÓN: CORR-006 - Crear Seeds de Assignments

**Fecha:** 2025-11-24
**Agente:** Database-Agent
**Tarea ID:** CORR-006
**Estimación:** 1.5 SP (~4 horas)

---

## Objetivos del Plan

1. ✅ Reescribir archivo de seeds `05-assignments.sql` con estructura correcta
2. ✅ Asegurar que todos los campos coincidan con DDL real
3. ✅ Incluir validaciones y mensajes informativos
4. ✅ Actualizar comentarios en `create-database.sh`
5. ⏳ Ejecutar validación de carga limpia
6. ⏳ Documentar tarea completada

---

## Archivos a Crear/Modificar

### 1. Seeds de Assignments (REESCRIBIR)
**Archivo:** `apps/database/seeds/prod/educational_content/05-assignments.sql`
**Acción:** Reescritura completa
**Razón:** Archivo v1.0 tiene referencias a tablas inexistentes

**Estructura nueva:**
```sql
-- Header con descripción
-- SET search_path
-- DELETE assignments existentes del teacher demo
-- DO $$ block con:
  -- DECLARE v_teacher_id UUID
  -- SELECT teacher_id FROM auth.users
  -- Validación con RAISE EXCEPTION si no existe
  -- INSERT de 9 assignments
  -- Validaciones con RAISE NOTICE
-- END $$;
```

**Campos a insertar:**
- id: gen_random_uuid()
- teacher_id: v_teacher_id (obtenido dinámicamente)
- title: Descriptivo (ej. "Tarea 1.1: Crucigrama Científico")
- description: Explicación detallada (150-300 caracteres)
- assignment_type: 'homework'|'quiz'|'practice'|'exam'
- due_date: gamilit.now_mexico() +/- INTERVAL 'X days'
- total_points: 50-300 (variado)
- is_published: true|false (8 true, 1 false)
- created_at: gamilit.now_mexico() - INTERVAL 'X days'
- updated_at: igual a created_at

### 2. Script de Carga
**Archivo:** `apps/database/create-database.sh`
**Acción:** Actualizar comentario
**Línea:** 517
**Cambio:**
```bash
# Antes:
execute_sql "$SEEDS_DIR/educational_content/05-assignments.sql" "Seeds: assignments (12 demo for Teacher Portal - commit db82449)"

# Después:
execute_sql "$SEEDS_DIR/educational_content/05-assignments.sql" "Seeds: assignments (9 demo for Teacher Portal - CORR-006)"
```

---

## Orden de Ejecución

### Fase 1: Preparación ✅
- [x] Backup del archivo original
  - Comando: `cp 05-assignments.sql 05-assignments.sql.backup.$(date +%Y%m%d_%H%M%S)`
  - Ubicación: `seeds/prod/educational_content/`

### Fase 2: Implementación ✅
- [x] Reescribir `05-assignments.sql` con estructura correcta
- [x] Actualizar comentario en `create-database.sh`

### Fase 3: Validación ⏳
- [ ] Ejecutar carga limpia completa
  ```bash
  cd apps/database
  ./drop-and-recreate-database.sh
  ```
- [ ] Validar que 9 assignments fueron creados
  ```sql
  SELECT COUNT(*) FROM educational_content.assignments;
  -- Resultado esperado: 9
  ```
- [ ] Validar distribución de estados
  ```sql
  SELECT
    CASE
      WHEN due_date < NOW() AND is_published THEN 'OVERDUE'
      WHEN due_date < NOW() + INTERVAL '3 days' AND due_date > NOW() THEN 'SOON'
      WHEN NOT is_published THEN 'DRAFT'
      ELSE 'FUTURE'
    END AS urgency,
    COUNT(*) AS qty
  FROM educational_content.assignments
  GROUP BY urgency
  ORDER BY urgency;
  ```

### Fase 4: Documentación ⏳
- [ ] Crear `03-EJECUCION.md`
- [ ] Crear `04-VALIDACION.md`
- [ ] Crear `05-DOCUMENTACION.md`
- [ ] Actualizar `TRAZA-TAREAS-DATABASE.md`

---

## Detalles de Implementación

### Assignments a Crear (9 total)

#### Módulo 1: Comprensión Literal
1. **Homework** - "Tarea 1.1: Crucigrama y Vocabulario Científico"
   - Points: 100
   - Due: hace 7 días (OVERDUE)
   - Published: true

2. **Quiz** - "Quiz 1.2: Línea de Tiempo de Marie Curie"
   - Points: 50
   - Due: en 2 días (SOON)
   - Published: true

3. **Practice** - "Práctica 1.3: Mapa Conceptual - Descubrimientos"
   - Points: 75
   - Due: en 10 días (FUTURE)
   - Published: true

#### Módulo 2: Comprensión Inferencial
4. **Homework** - "Tarea 2.1: Relaciones Causa-Efecto"
   - Points: 120
   - Due: hace 3 días (OVERDUE)
   - Published: true

5. **Quiz** - "Quiz 2.2: Rueda de Inferencias"
   - Points: 100
   - Due: en 5 días (ACTIVE)
   - Published: true

6. **Practice** - "Práctica 2.3: Análisis de Decisiones"
   - Points: 150
   - Due: en 15 días (FUTURE)
   - Published: true

#### Módulo 3: Comprensión Crítica
7. **Homework** - "Tarea 3.1: Ensayo Crítico - Rol de la Mujer en Ciencia"
   - Points: 200
   - Due: en 7 días (ACTIVE)
   - Published: true

8. **Quiz** - "Quiz 3.2: Evaluación Crítica Express"
   - Points: 50
   - Due: en 3 días (SOON)
   - Published: true

9. **Exam** - "Proyecto Final: Presentación Multimedia sobre Marie Curie"
   - Points: 300
   - Due: en 30 días (FUTURE)
   - Published: false (DRAFT)

---

## Validaciones Incluidas

### Validación Pre-INSERT
```sql
-- Validar que existe teacher@gamilit.com
IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Teacher "teacher@gamilit.com" no encontrado. Ejecutar primero seed de auth/users.';
END IF;
```

### Validación Post-INSERT
```sql
-- Contar assignments totales
-- Contar publicados vs borradores
-- Contar por estado (OVERDUE, SOON, FUTURE, DRAFT)
-- Listar todos los assignments con su estado
```

---

## Criterios de Aceptación

- [x] Archivo `05-assignments.sql` creado con estructura correcta
- [x] 9 assignments definidos con datos realistas
- [x] Distribuidos en 3 módulos conceptuales
- [x] Fechas variadas (past, present, future)
- [x] Status variados (8 published, 1 draft)
- [x] Tipos variados (homework, quiz, practice, exam)
- [x] Validaciones incluidas (RAISE EXCEPTION y RAISE NOTICE)
- [x] Comentario actualizado en create-database.sh
- [ ] Carga limpia ejecuta sin errores
- [ ] Query de validación retorna 9 registros
- [ ] Portal Teacher puede mostrar assignments en listas

---

## Riesgos y Mitigaciones

### Riesgo 1: Función gamilit.now_mexico() no disponible
**Mitigación:** Validar que la función existe en DDL antes de ejecutar
**Status:** ✅ Función existe en `ddl/schemas/gamilit/functions/`

### Riesgo 2: Teacher user no existe al momento de carga
**Mitigación:** Seed incluye validación con RAISE EXCEPTION
**Status:** ✅ Implementado

### Riesgo 3: Conflictos en múltiples ejecuciones
**Mitigación:** DELETE antes de INSERT en mismo bloque DO $$
**Status:** ✅ Implementado

---

## Estimación de Tiempo

| Fase | Estimación | Status |
|------|------------|--------|
| Análisis | 1 hora | ✅ Completado |
| Plan | 0.5 horas | ✅ Completado |
| Implementación | 1 hora | ✅ Completado |
| Validación | 1 hora | ⏳ Pendiente |
| Documentación | 0.5 horas | ⏳ Pendiente |
| **TOTAL** | **4 horas** | **75% completado** |

---

## Notas Adicionales

### Diferencias con Seed v1.0
- ❌ v1.0 intentaba insertar en `assignment_classrooms` (no existe)
- ❌ v1.0 intentaba insertar en `assignment_exercises` (no existe)
- ❌ v1.0 usaba UUIDs hardcodeados
- ❌ v1.0 tenía 12 assignments
- ✅ v2.0 usa solo columnas que existen en DDL
- ✅ v2.0 usa gen_random_uuid()
- ✅ v2.0 tiene 9 assignments (más manejable para demos)
- ✅ v2.0 incluye validaciones robustas

### Compatibilidad
- ✅ Compatible con Política de Carga Limpia
- ✅ No requiere migrations incrementales
- ✅ Puede ejecutarse múltiples veces (idempotente con DELETE previo)

---

**Siguiente paso:** Ejecutar validación completa (03-EJECUCION.md)
