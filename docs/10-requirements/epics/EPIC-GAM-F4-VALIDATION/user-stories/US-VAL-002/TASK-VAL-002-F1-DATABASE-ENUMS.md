---
titulo: "TASK-VAL-002-F1-DATABASE-ENUMS: Comparar ENUMs DDL vs TS"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-002-F1-DATABASE-ENUMS: Comparar ENUMs DDL vs TS

**US:** US-VAL-002 | **Tipo:** Database | **Estado:** Pendiente | **SP:** 1

## Descripcion
Comparar los 42 tipos ENUM definidos en DDL con las enums en entidades TypeScript.

## Acciones
1. `SELECT typname FROM pg_type WHERE typtype='e'` — listar ENUMs en DB
2. grep enums en entities TypeScript del backend
3. Comparar nombres y valores

## Criterio Pass
- 42 ENUMs coinciden
- 0 mismatches en valores
