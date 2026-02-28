---
titulo: "TASK-VAL-003-F2-BACKEND-TENANCY: Multi-tenancy verification"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-003-F2-BACKEND-TENANCY: Multi-tenancy verification

**US:** US-VAL-003 | **Tipo:** Backend | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar que multi-tenancy funciona: sin X-Tenant-ID se rechaza, con header se filtra por tenant.

## Acciones
1. GET /api/v1/users sin X-Tenant-ID → esperar 401
2. GET /api/v1/users con X-Tenant-ID: tenant-1 → esperar 200
3. Verificar que solo se ven datos del tenant-1
4. Verificar con tenant-2 que datos son diferentes

## Criterio Pass
- Sin header → 401
- Con header → 200
- RLS filtra correctamente por tenant
