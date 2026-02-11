# Funciones de Validación de BD Sin Uso Directo desde Backend

## Descripción

Este documento cataloga las funciones de validación en el schema `educational_content` que no son llamadas directamente desde el backend NestJS. Estas funciones fueron diseñadas para validación a nivel de base de datos pero la lógica de validación se implementó en el backend con TypeScript/Zod.

## Estado

**Fecha de documentación:** 2025-12-28
**Motivo:** Análisis de integración Database→Backend
**Decisión:** MANTENER para uso futuro o migración a validación en BD

---

## Funciones Catalogadas

### Schema: educational_content

| Función | Archivo | Propósito | Uso Actual |
|---------|---------|-----------|------------|
| `validate_answer` | `functions/validate_answer.sql` | Validación genérica de respuestas | Sin uso directo |
| `validate_true_false` | `functions/validate_true_false.sql` | Validación Verdadero/Falso | Sin uso directo |
| `validate_multiple_choice` | `functions/validate_multiple_choice.sql` | Validación selección múltiple | Sin uso directo |
| `validate_fill_blanks` | `functions/validate_fill_blanks.sql` | Validación completar espacios | Sin uso directo |
| `validate_ordering` | `functions/validate_ordering.sql` | Validación ordenamiento | Sin uso directo |
| `validate_matching` | `functions/validate_matching.sql` | Validación emparejamiento | Sin uso directo |
| `validate_drag_drop` | `functions/validate_drag_drop.sql` | Validación arrastrar/soltar | Sin uso directo |
| `calculate_exercise_score` | `functions/calculate_exercise_score.sql` | Cálculo de puntuación | Sin uso directo |

---

## Razón de No Uso

1. **Validación en Frontend:** Los schemas Zod validan las respuestas en el cliente
2. **Validación en Backend:** Los DTOs de NestJS validan estructura y tipos
3. **Procesamiento en Backend:** `exercise-validator.service.ts` procesa las respuestas
4. **Performance:** Evita round-trip adicional a la BD para validación simple

---

## Casos de Uso Potencial

Estas funciones podrían activarse en los siguientes escenarios:

1. **Migración a validación en BD:** Si se decide mover la lógica de validación a stored procedures
2. **Validación redundante:** Como capa adicional de seguridad
3. **Reportes analíticos:** Para recalcular scores en bulk
4. **Triggers de auditoría:** Para validar datos insertados directamente

---

## Recomendación

**Mantener** las funciones en el DDL con las siguientes acciones:

1. ✅ Documentar en este archivo (completado)
2. ⚠️ Agregar comentario en cada función indicando "Reserved for future use"
3. ⚠️ Evaluar en sprint futuro si migrar validación a BD para M4-M5 creativos

---

## Referencias

- `apps/database/ddl/schemas/educational_content/functions/`
- `apps/backend/src/modules/progress/services/exercise-validator.service.ts`
- `apps/frontend/src/features/mechanics/*/schemas/*.ts`
- `orchestration/agentes/requirements-analyst/PLAN-VALIDACION-INTEGRACION-2025-12-28.md`
