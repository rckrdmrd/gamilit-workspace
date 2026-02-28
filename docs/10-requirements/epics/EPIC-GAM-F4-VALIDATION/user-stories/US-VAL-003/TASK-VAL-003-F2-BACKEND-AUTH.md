---
titulo: "TASK-VAL-003-F2-BACKEND-AUTH: Auth flow completo"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-003-F2-BACKEND-AUTH: Auth flow completo

**US:** US-VAL-003 | **Tipo:** Backend | **Estado:** Pendiente | **SP:** 3

## Descripcion
Probar flujo completo de autenticacion: register → login → refresh → logout.

## Acciones
1. POST /api/v1/auth/register — crear usuario test
2. POST /api/v1/auth/login — obtener JWT
3. POST /api/v1/auth/refresh — refrescar token
4. POST /api/v1/auth/logout — invalidar sesion
5. Verificar trigger side-effects en DB

## Criterio Pass
- JWT valido generado
- Refresh funciona
- Logout invalida sesion
- Trigger side-effects verificados en DB
