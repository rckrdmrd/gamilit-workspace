# Directivas SIMCO

Sistema de directivas por operación para el workspace.

## Estructura

| Carpeta | Contenido | Cantidad |
|---------|-----------|----------|
| `principios/` | 7 principios fundamentales | CAPVED, Doc-Primero, Anti-Dup, etc. |
| `simco/` | 35+ directivas por operación | SIMCO-TAREA, SIMCO-GIT, etc. |
| `modos/` | Modos de ejecución | FULL, QUICK, ANALYSIS, PROPAGATION |
| `triggers/` | Triggers automáticos | Anti-duplicación, coherencia, etc. |
| `politicas/` | Políticas de excepción | ENV compartido, etc. |
| `procedimientos/` | Procedimientos operacionales | - |

## Archivos Clave

- **Punto de entrada:** `simco/SIMCO-TAREA.md`
- **Git obligatorio:** `simco/SIMCO-GIT.md`
- **Edición segura:** `simco/SIMCO-EDICION-SEGURA.md`
- **Ciclo CAPVED:** `principios/PRINCIPIO-CAPVED.md`

## Índice Completo

Ver: `orchestration/INDICE-DIRECTIVAS-WORKSPACE.yml`

## Uso

```
1. Identificar operación (crear, modificar, validar, DDL, backend, frontend)
2. Cargar SIMCO correspondiente: directivas/simco/SIMCO-{operación}.md
3. Seguir checklist del SIMCO
```
