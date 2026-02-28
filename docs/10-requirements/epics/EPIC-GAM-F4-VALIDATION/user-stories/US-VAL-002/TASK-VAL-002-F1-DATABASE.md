---
titulo: "TASK-VAL-002-F1-DATABASE: Query schemas + tables count"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-002-F1-DATABASE: Query schemas + tables count

**US:** US-VAL-002 | **Tipo:** Database | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar que la BD tiene exactamente 18 schemas y 173 tablas.

## Acciones
1. `SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog','information_schema','pg_toast')`
2. `SELECT count(*) FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema NOT IN (...)`
3. Comparar con DDL esperados

## Criterio Pass
- 18 schemas exactos
- 173 tablas exactas
