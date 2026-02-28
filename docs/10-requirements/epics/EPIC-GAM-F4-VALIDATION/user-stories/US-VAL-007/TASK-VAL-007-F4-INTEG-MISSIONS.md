---
titulo: "TASK-VAL-007-F4-INTEG-MISSIONS: Missions generation + completion"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-007-F4-INTEG-MISSIONS: Missions generation + completion

**US:** US-VAL-007 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar que misiones daily/weekly se generan y pueden completarse, incluyendo 9 trigger wrappers.

## Acciones
1. Verificar misiones daily generadas para usuario
2. Verificar misiones weekly generadas
3. Completar una mision (cumplir sus condiciones)
4. Verificar mision marcada como completed
5. Verificar reward otorgado (XP + coins)
6. Verificar 9 mission trigger wrappers funcionan (ddl/schemas/gamilit/functions/51-*.sql)

## Criterio Pass
- Daily/weekly missions generadas
- Completion funciona
- 9 trigger wrappers ejecutan correctamente
