# TASK-VAL-003-F2-BACKEND: Health check endpoint

**US:** US-VAL-003 | **Tipo:** Backend | **Estado:** Pendiente | **SP:** 1

## Descripcion
Iniciar el backend en modo dev y verificar el health endpoint.

## Acciones
1. `cd apps/backend && npm run dev`
2. `curl http://localhost:3000/health`
3. Verificar 200 OK y datasources conectadas

## Criterio Pass
- 200 OK
- Todas las datasources conectadas
