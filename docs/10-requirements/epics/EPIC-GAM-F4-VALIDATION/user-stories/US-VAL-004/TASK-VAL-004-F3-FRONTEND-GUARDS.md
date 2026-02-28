---
titulo: "TASK-VAL-004-F3-FRONTEND-GUARDS: Route guards + tests"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-004-F3-FRONTEND-GUARDS: Route guards + tests

**US:** US-VAL-004 | **Tipo:** Frontend | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar ProtectedRoute y role guards redirigen correctamente, ejecutar tests.

## Acciones
1. Acceder ruta admin como student → verificar redireccion
2. Acceder ruta teacher como parent → verificar redireccion
3. Acceder ruta protegida sin login → verificar redireccion a /login
4. `npm run test:run` — ejecutar test suite frontend

## Criterio Pass
- Redirecciones correctas por rol
- Tests pasan
