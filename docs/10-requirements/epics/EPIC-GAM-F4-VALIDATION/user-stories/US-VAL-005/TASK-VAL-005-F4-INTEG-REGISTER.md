---
titulo: "TASK-VAL-005-F4-INTEG-REGISTER: Student registration cascade"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-005-F4-INTEG-REGISTER: Student registration cascade

**US:** US-VAL-005 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 3

## Descripcion
Registrar student via API y verificar que triggers crean 15 records automaticamente.

## Acciones
1. POST /api/v1/auth/register con rol student
2. Query DB: verificar user_stats creado
3. Query DB: verificar rank assignment (Ajaw)
4. Query DB: verificar coins wallet (balance 0)
5. Query DB: verificar preferences
6. Query DB: verificar 5 module_progress records
7. Query DB: verificar classroom_member (si aplicable)
8. Query DB: verificar audit_log entry

## Criterio Pass
- 15 records auto-created
- Todos con FKs correctos al user
