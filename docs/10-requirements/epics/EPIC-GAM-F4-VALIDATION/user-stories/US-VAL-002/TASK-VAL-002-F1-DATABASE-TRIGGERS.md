---
titulo: "TASK-VAL-002-F1-DATABASE-TRIGGERS: Test trigger cascade"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-002-F1-DATABASE-TRIGGERS: Test trigger cascade

**US:** US-VAL-002 | **Tipo:** Database | **Estado:** Pendiente | **SP:** 3

## Descripcion
Probar que INSERT en user profile dispara 15 inserts automaticos via triggers.

## Acciones
1. INSERT INTO auth_management.users (test user)
2. Verificar que triggers crearon: user_stats, rank assignment, coins wallet, preferences, 5 module_progress, classroom_member, audit_log
3. Contar registros automaticos: esperar 15
4. Verificar orden de ejecucion de 4 triggers

## Criterio Pass
- 4 triggers disparan en orden correcto
- 15 records auto-creados
