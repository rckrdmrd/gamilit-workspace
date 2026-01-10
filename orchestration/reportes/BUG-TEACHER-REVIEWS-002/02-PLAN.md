# PLAN DE EJECUCIÓN: BUG-TEACHER-REVIEWS-002 - Ejercicio No Aparece en Teacher/Reviews

**Agente:** Database-Agent
**Tipo de tarea:** Bug
**Prioridad:** P0
**Fecha creación:** 2026-01-07
**Relacionado con:** [TP-001], [CORR-010], [M3-M5-FIX]

---

## OBJETIVO

Corregir el bug donde ejercicios enviados después de un auto-save no aparecen en `/teacher/reviews` debido a que el trigger solo se ejecuta en INSERT, no en UPDATE.

**Criterios de Aceptación:**
- [x] Trigger AFTER UPDATE creado
- [x] Script de migración para submissions existentes
- [ ] Recreación de BD exitosa
- [ ] Trigger aparece en information_schema.triggers
- [ ] Submissions existentes tienen manual_review

---

## ANÁLISIS PREVIO

### Contexto
El flujo auto-save crea submissions con status='draft'. Al enviar, se hace UPDATE a 'submitted'. El trigger original solo se dispara en INSERT.

### Estado Actual
- Trigger INSERT: Existe y funciona
- Trigger UPDATE: No existe (causa del bug)
- Función: Existe con ON CONFLICT DO NOTHING

### Anti-Duplicación
```bash
# Verificación de triggers existentes
ls apps/database/ddl/schemas/progress_tracking/triggers/*manual_review*
# Resultado: 16-trg_create_manual_review.sql (solo INSERT)
# ✅ No existe trigger UPDATE duplicado
```

---

## DISEÑO DE SOLUCIÓN

### Approach Seleccionado
Crear trigger adicional AFTER UPDATE que reutiliza la función existente.

### Componentes a Crear/Modificar

**Database:**
- [x] Trigger: 17-trg_create_manual_review_on_update.sql
- [x] Script: fix-missing-manual-reviews.sql

**Backend:**
- Ninguno (no requiere cambios)

**Frontend:**
- Ninguno (no requiere cambios)

---

## CICLOS DE EJECUCIÓN

### Ciclo 1: Crear Trigger AFTER UPDATE
**Duración estimada:** 10 min
**Objetivo:** Crear trigger que complemente al INSERT

**Tareas:**
1. Crear archivo 17-trg_create_manual_review_on_update.sql
2. Verificar que reutiliza función existente
3. Agregar comentarios de documentación

**Artefactos generados:**
- Archivo: apps/database/ddl/schemas/progress_tracking/triggers/17-trg_create_manual_review_on_update.sql

**Validación:**
```bash
# Verificar sintaxis SQL
cat apps/database/ddl/schemas/progress_tracking/triggers/17-trg_create_manual_review_on_update.sql
```

**Criterios de éxito:**
- [x] Archivo creado con sintaxis correcta
- [x] Condición: NEW.status = 'submitted' AND OLD.status != 'submitted'
- [x] Reutiliza función create_manual_review_on_submission()

---

### Ciclo 2: Crear Script de Migración
**Duración estimada:** 10 min
**Objetivo:** Script para arreglar submissions existentes sin manual_review

**Tareas:**
1. Crear script fix-missing-manual-reviews.sql
2. Identificar submissions afectadas
3. Crear manual_reviews faltantes

**Artefactos generados:**
- Archivo: apps/database/scripts/fix-missing-manual-reviews.sql

**Validación:**
```sql
-- Query para verificar submissions sin review (debe retornar 0 después del fix)
SELECT COUNT(*) FROM exercise_submissions es
WHERE es.status = 'submitted' AND es.graded_at IS NULL
AND NOT EXISTS (SELECT 1 FROM manual_reviews mr WHERE mr.submission_id = es.id);
```

**Criterios de éxito:**
- [x] Script creado
- [x] Identifica submissions afectadas
- [x] NOT EXISTS evita duplicados

---

### Ciclo 3: Validación - Recrear Base de Datos
**Duración estimada:** 15 min
**Objetivo:** Validar que el trigger se crea correctamente

**Validaciones:**
```bash
# Database - Recreación
cd /home/isem/workspace-v1/projects/gamilit/apps/database
./scripts/recreate-database.sh --env dev --force
# Debe ejecutar sin errores

# Verificar triggers creados
psql $DATABASE_URL -c "SELECT trigger_name, event_manipulation FROM information_schema.triggers WHERE trigger_name LIKE '%manual_review%';"
# Debe mostrar 2 triggers: INSERT y UPDATE
```

**Checklist de Validación:**
- [ ] Recreación ejecuta sin errores
- [ ] Trigger INSERT existe
- [ ] Trigger UPDATE existe
- [ ] Ambos usan la misma función
- [ ] Documentación actualizada

---

## DEPENDENCIAS

### Depende de:
- [TP-001]: Trigger INSERT existente → Completado
- Función create_manual_review_on_submission → Existe

### Bloquea:
- Evaluación de ejercicios M3-M5 (12 ejercicios)

### Requerimientos externos:
- PostgreSQL disponible para recreación

---

## RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Duplicación de manual_reviews | Baja | Bajo | ON CONFLICT DO NOTHING |
| Error en recreación | Baja | Alto | Rollback disponible |
| Regresión INSERT | Baja | Alto | No se modifica trigger existente |

---

## ESTIMACIONES

**Tiempo total estimado:** 1 hora

**Desglose:**
- Análisis: 15 min (completado)
- Desarrollo: 20 min (completado)
- Testing: 15 min (pendiente - recreación BD)
- Documentación: 10 min (en progreso)

**Recursos necesarios:**
- Agentes: Database-Agent
- Herramientas: psql, recreate-database.sh

---

## DOCUMENTACIÓN A GENERAR

**Durante ejecución:**
- [x] 01-ANALISIS.md
- [x] 02-PLAN.md
- [ ] 03-EJECUCION.md
- [ ] 04-VALIDACION.md

**Post-ejecución:**
- [ ] Actualización de TRAZA-TAREAS-DATABASE.md

---

## CRITERIOS DE ÉXITO

La tarea se considera **COMPLETADA** cuando:

- [x] Trigger AFTER UPDATE creado
- [x] Script de migración creado
- [ ] Recreación de BD exitosa
- [ ] Ambos triggers aparecen en information_schema
- [ ] Documentación estandarizada completa
- [ ] Sin errores de compilación

---

## REFERENCIAS

**Archivos creados:**
- apps/database/ddl/schemas/progress_tracking/triggers/17-trg_create_manual_review_on_update.sql
- apps/database/scripts/fix-missing-manual-reviews.sql

**Archivos de referencia:**
- 16-trg_create_manual_review.sql (template)
- 16-create_manual_review_on_submission.sql (función reutilizada)

---

**Versión:** 1.0
**Última actualización:** 2026-01-07
**Aprobado para ejecución:** Sí
