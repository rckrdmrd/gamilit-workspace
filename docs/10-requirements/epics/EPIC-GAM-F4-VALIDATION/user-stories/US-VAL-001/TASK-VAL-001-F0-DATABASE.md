---
titulo: "TASK-VAL-001-F0-DATABASE: Recrear BD gamilit"
tipo: tarea
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# TASK-VAL-001-F0-DATABASE: Recrear BD gamilit

**US:** US-VAL-001 | **Tipo:** Database | **Estado:** Pendiente | **SP:** 2

## Descripcion
Ejecutar unified-recreate-db.sh para recrear la base de datos gamilit desde DDL puro.

## Acciones
1. `cd workspace-projects/scripts/database`
2. `./unified-recreate-db.sh gamilit --drop`
3. Verificar 18 schemas creados
4. Verificar 173 tablas creadas
5. Verificar 0 errores en output

## Criterio Pass
- 18 schemas, 173 tablas, 0 errores
