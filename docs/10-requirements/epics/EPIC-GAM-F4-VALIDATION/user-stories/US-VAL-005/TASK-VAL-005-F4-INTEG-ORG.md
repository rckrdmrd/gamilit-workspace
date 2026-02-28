---
titulo: "TASK-VAL-005-F4-INTEG-ORG: Organization chain"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-005-F4-INTEG-ORG: Organization chain

**US:** US-VAL-005 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 2

## Descripcion
Crear cadena Org → classroom → teacher → student y verificar FKs.

## Acciones
1. POST /api/v1/organizations — crear org
2. POST /api/v1/classrooms — crear classroom vinculado a org
3. Asignar teacher a classroom
4. Registrar student en classroom
5. Verificar FKs intactos y membership correcta

## Criterio Pass
- Cadena completa creada
- FKs intactos
- Membership correcta
