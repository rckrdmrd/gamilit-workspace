---
titulo: "TASK-VAL-005-F4-INTEG-RBAC: RBAC verification"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-005-F4-INTEG-RBAC: RBAC verification

**US:** US-VAL-005 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar que cada rol solo accede a recursos autorizados.

## Acciones
1. Login como student → GET /api/v1/admin → esperar 403
2. Login como teacher → GET /api/v1/admin → esperar 403
3. Login como admin → GET /api/v1/admin → esperar 200
4. Login como parent → GET /api/v1/classrooms → verificar solo ve sus hijos
5. Verificar que student no puede crear ejercicios

## Criterio Pass
- RBAC funciona correctamente
- Student no accede a admin
- Teacher no accede a admin
- Parent solo ve datos de sus hijos
