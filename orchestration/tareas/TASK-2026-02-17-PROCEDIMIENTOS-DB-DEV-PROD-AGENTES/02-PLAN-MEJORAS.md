# TASK-2026-02-17-PROCEDIMIENTOS-DB-DEV-PROD-AGENTES - Plan de Mejoras

## Acciones implementadas

1. Alinear deploy prod a flujo DDL-first (sin migrations incrementales).
2. Unificar ruta productiva a `/home/isem/gamilit-workspace`.
3. Reforzar recreacion prod con lectura segura de `DB_PASSWORD`.
4. Agregar post-recreate para recarga de funciones cuando aplique.
5. Crear wrappers por ambiente:
   - `recreate-database-dev.sh`
   - `recreate-database-prod.sh`
6. Crear perfil dedicado:
   - `PERFIL-DB-DEV-WSL.md`

## Resultado esperado

Procedimiento claro para agentes en ambos ambientes, reduciendo errores operativos y manteniendo coherencia documental.
