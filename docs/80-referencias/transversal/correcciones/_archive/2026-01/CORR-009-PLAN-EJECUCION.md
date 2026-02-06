# PLAN DE EJECUCIÓN: CORR-009 - Vista teacher_pending_reviews DDL Errors

**Agente:** Orchestrator-Agent
**Tipo de tarea:** Corrección
**Prioridad:** P1
**Fecha creación:** 2026-01-07
**Relacionado con:** [CORR-M3-001-002], [GAP-VIEW-001]

---

## OBJETIVO

Corregir los errores de DDL en la vista `progress_tracking.teacher_pending_reviews` para que se cree correctamente durante la recreación de la base de datos.

**Criterios de Aceptación:**
- [x] Vista DDL corregida con columnas válidas
- [x] Vista se crea sin errores en BD
- [x] Función helper se crea correctamente
- [ ] Script create-database.sh ejecuta sin errores
- [ ] Documentación actualizada

---

## ANÁLISIS PREVIO

### Contexto
- **Por qué es necesario?** Vista no existe en BD por errores DDL
- **Qué problema resuelve?** Permite al portal Teacher ver submissions pendientes
- **Qué valor aporta?** Completa integración del sistema de evaluaciones manuales

### Estado Actual
- Archivo DDL existe pero tiene 10 errores de columnas
- Vista no existe en BD
- Función helper tampoco existe (depende de vista)

### Anti-Duplicación
```bash
# Verificación realizada
ls -la ddl/schemas/progress_tracking/views/
# Resultado: 02-teacher_pending_reviews.sql EXISTE (a modificar)
```

---

## DISEÑO DE SOLUCIÓN

### Approach Seleccionado
Corregir el DDL existente mapeando columnas correctas según estructura actual de tablas.

**Alternativas consideradas:**
1. Agregar columnas faltantes a tablas - Descartado: complejidad innecesaria
2. Crear vista nueva - Descartado: ya existe archivo, solo corregir

### Componentes a Crear/Modificar

**Database:**
- [ ] Schema: N/A
- [ ] Tablas: N/A
- [ ] Funciones: N/A (se crea con la vista)
- [ ] Triggers: N/A
- [x] Vistas: `02-teacher_pending_reviews.sql` (modificar)

---

## CICLOS DE EJECUCIÓN

### Ciclo 1: Corrección DDL Vista
**Duración estimada:** 10 minutos
**Objetivo:** Corregir todas las columnas incorrectas

**Tareas:**
1. Cambiar `p.username` → `p.email`
2. Remover `e.mechanic_type` (usar solo exercise_type)
3. Cambiar `m.module_order` → `m.order_index AS module_order`
4. Cambiar `es.time_spent` → `es.time_spent_seconds`
5. Cambiar `es.attempts` → `es.attempt_number`
6. Cambiar `es.answers` → `es.answer_data`
7. Remover `es.graded_by`, `es.metadata`, `es.tenant_id`
8. Simplificar WHERE a `requires_manual_grading = true`

**Artefactos generados:**
- Archivo: `ddl/schemas/progress_tracking/views/02-teacher_pending_reviews.sql` (modificado)

**Validación:**
```bash
# Ejecutar DDL directamente
psql -f ddl/schemas/progress_tracking/views/02-teacher_pending_reviews.sql
```

**Criterios de éxito:**
- [x] DDL ejecuta sin errores
- [x] Vista creada en BD
- [x] Función helper creada

---

### Ciclo 2: Validación Script create-database.sh
**Duración estimada:** 5 minutos
**Objetivo:** Verificar que el script incluye el archivo

**Tareas:**
1. Verificar que `create-database.sh` incluye directorio de vistas
2. Verificar orden de ejecución correcto

**Validación:**
```bash
grep -n "progress_tracking.*views" create-database.sh
# Debe mostrar línea que ejecuta archivos de vistas
```

**Criterios de éxito:**
- [ ] Script referencia directorio de vistas
- [ ] Orden de ejecución es correcto (vistas después de tablas/funciones)

---

### Ciclo 3: Recreación Base de Datos
**Duración estimada:** 15 minutos
**Objetivo:** Validar creación completa de BD con vista corregida

**Tareas:**
1. Ejecutar script de recreación
2. Verificar vista existe en BD
3. Verificar función helper existe

**Validación:**
```bash
# Recrear BD
./scripts/drop-and-recreate-database.sh

# Verificar vista
psql -c "\dv progress_tracking.teacher_pending_reviews"

# Verificar función
psql -c "\df progress_tracking.get_teacher_pending_reviews_count"

# Probar vista
psql -c "SELECT * FROM progress_tracking.teacher_pending_reviews LIMIT 1"
```

**Criterios de éxito:**
- [ ] Recreación sin errores
- [ ] Vista existe en BD
- [ ] Función helper existe
- [ ] Query a vista funciona

---

### Ciclo 4: Documentación Final
**Duración estimada:** 10 minutos
**Objetivo:** Actualizar documentación

**Tareas:**
1. Crear documento VALIDACION
2. Actualizar _MAP.md con referencias a documentos
3. Agregar comentarios en DDL

**Criterios de éxito:**
- [ ] VALIDACION creada
- [ ] _MAP.md actualizado
- [ ] Documentación completa

---

## DEPENDENCIAS

### Depende de:
- [DDL-tables]: Tablas `exercises`, `profiles`, `exercise_submissions`, `modules` → COMPLETADO
- [DDL-functions]: Función `create_manual_review_on_submission` → COMPLETADO

### Bloquea:
- Portal Teacher: Dashboard pending reviews

### Requerimientos externos:
- Ninguno

---

## RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| DDL tiene más errores | Baja | Medio | Iterar correcciones |
| Recreación BD falla | Baja | Alto | Verificar tablas fuente primero |
| Script no incluye archivo | Baja | Alto | Verificar grep antes de ejecutar |

---

## ESTIMACIONES

**Tiempo total estimado:** 40 minutos

**Desglose:**
- Ciclo 1 (Corrección DDL): 10 min (COMPLETADO)
- Ciclo 2 (Verificar script): 5 min
- Ciclo 3 (Recreación BD): 15 min
- Ciclo 4 (Documentación): 10 min

**Recursos necesarios:**
- Agentes: Orchestrator-Agent
- Herramientas: Edit, Bash, Read

---

## CRITERIOS DE ÉXITO GLOBALES

La tarea se considera **COMPLETADA** cuando:

- [x] Vista DDL corregida
- [x] Vista ejecuta sin errores (individual)
- [ ] Script create-database.sh incluye archivo
- [ ] Recreación BD completa sin errores
- [ ] Vista existe post-recreación
- [ ] Documentación completa

---

**Version:** 1.0
**Ultima actualizacion:** 2026-01-07
**Aprobado para ejecución:** Sí
