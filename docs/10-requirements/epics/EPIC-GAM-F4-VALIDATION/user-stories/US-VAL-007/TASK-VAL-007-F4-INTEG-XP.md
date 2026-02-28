---
titulo: "TASK-VAL-007-F4-INTEG-XP: XP calculation"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-007-F4-INTEG-XP: XP calculation

**US:** US-VAL-007 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar que XP se calcula correctamente por nivel de dificultad y se acumula en user_stats.

## Acciones
1. Submit ejercicio facil → verificar XP base (ej: 10 XP)
2. Submit ejercicio medio → verificar XP medio (ej: 25 XP)
3. Submit ejercicio dificil → verificar XP alto (ej: 50 XP)
4. Query user_stats → verificar XP acumulado correcto
5. Verificar XP multiplier por streak

## Criterio Pass
- Montos XP correctos por dificultad
- Acumulado correcto en user_stats
