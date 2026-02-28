---
titulo: "TASK-VAL-005-F4-INTEG-PARENT: Parent linking"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-005-F4-INTEG-PARENT: Parent linking

**US:** US-VAL-005 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 1

## Descripcion
Registrar parent, vincular a student, verificar dashboard.

## Acciones
1. POST /api/v1/auth/register con rol parent
2. POST /api/v1/parents/link-student — vincular a student existente
3. GET /api/v1/parents/dashboard — verificar progreso del estudiante visible
4. Verificar FKs parent↔student en DB

## Criterio Pass
- Parent ve progreso del estudiante vinculado
- FKs correctos en DB
