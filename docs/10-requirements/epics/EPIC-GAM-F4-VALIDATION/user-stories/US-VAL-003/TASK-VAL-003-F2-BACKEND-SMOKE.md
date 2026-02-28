---
titulo: "TASK-VAL-003-F2-BACKEND-SMOKE: Smoke test 23 modulos"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-003-F2-BACKEND-SMOKE: Smoke test 23 modulos

**US:** US-VAL-003 | **Tipo:** Backend | **Estado:** Pendiente | **SP:** 5

## Descripcion
Ejecutar 1 endpoint smoke test por cada uno de los 23 modulos del backend.

## Acciones
1. Obtener JWT valido via /auth/login
2. Para cada modulo: GET /api/v1/{modulo} con JWT
3. Verificar status code correcto (200 o 403 si no autorizado)
4. Documentar resultado por modulo

## Modulos (23)
auth, users, tenants, organizations, classrooms, students, teachers, parents, exercises, submissions, grading, xp, ranks, coins, achievements, missions, leaderboards, shop, inventory, comodines, notifications, analytics

## Criterio Pass
- 23/23 modulos responden
- Status codes correctos
