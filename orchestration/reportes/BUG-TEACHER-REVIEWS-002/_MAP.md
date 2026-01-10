# BUG-TEACHER-REVIEWS-002 - Mapa de Documentación

**Bug:** Ejercicio No Aparece en Teacher/Reviews
**Prioridad:** P0
**Estado:** ✅ COMPLETADO
**Fecha:** 2026-01-07

---

## Documentos en esta carpeta

| # | Archivo | Propósito | Estado |
|---|---------|-----------|--------|
| 1 | [01-ANALISIS.md](./01-ANALISIS.md) | Análisis de causa raíz y dependencias | ✅ Completado |
| 2 | [02-PLAN.md](./02-PLAN.md) | Plan de ejecución por ciclos | ✅ Completado |
| 3 | [03-EJECUCION.md](./03-EJECUCION.md) | Reporte de implementación | ✅ Completado |
| 4 | [04-VALIDACION.md](./04-VALIDACION.md) | Checklist y pruebas de validación | ✅ Completado |

---

## Resumen del Bug

**Causa Raíz:**
El trigger `trg_create_manual_review_on_submission` solo se ejecutaba en AFTER INSERT. Cuando hay auto-save previo (draft), el envío se hace via UPDATE, lo cual no disparaba el trigger.

**Solución:**
Crear trigger adicional AFTER UPDATE que se ejecute cuando status cambia a 'submitted'.

---

## Archivos Creados en la BD

| Archivo | Ubicación |
|---------|-----------|
| Trigger UPDATE | `apps/database/ddl/schemas/progress_tracking/triggers/17-trg_create_manual_review_on_update.sql` |
| Script Migración | `apps/database/scripts/fix-missing-manual-reviews.sql` |

---

## Validación Completada

**Fecha de validación:** 2026-01-07 20:17

**Pasos ejecutados:**
1. ✅ Trigger UPDATE ejecutado en PostgreSQL
2. ✅ Verificados ambos triggers en information_schema
3. ✅ Script de migración ejecutado (1 submission corregida)
4. ✅ 0 submissions sin manual_review

**Evidencia:**
```
trg_create_manual_review_on_submission        | INSERT | AFTER
trg_create_manual_review_on_submission_update | UPDATE | AFTER
```

---

**Última actualización:** 2026-01-07 20:17
**Responsable:** Database-Agent
