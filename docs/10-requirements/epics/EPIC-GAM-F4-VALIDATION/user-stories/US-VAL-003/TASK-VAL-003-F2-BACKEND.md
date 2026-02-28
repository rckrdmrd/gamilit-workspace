---
titulo: "TASK-VAL-003-F2-BACKEND: Health check endpoint"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-003-F2-BACKEND: Health check endpoint

**US:** US-VAL-003 | **Tipo:** Backend | **Estado:** Pendiente | **SP:** 1

## Descripcion
Iniciar el backend en modo dev y verificar el health endpoint.

## Acciones
1. `cd apps/backend && npm run dev`
2. `curl http://localhost:3006/health`
3. Verificar 200 OK y datasources conectadas

## Criterio Pass
- 200 OK
- Todas las datasources conectadas
