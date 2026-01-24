# Fase A - Análisis

**Tarea:** TASK-001 - Estandarización orchestration gamilit
**Fecha:** 2026-01-24

---

## Comportamiento Deseado

Consolidar la estructura de orchestration/ siguiendo el estándar:
- 10 archivos root obligatorios
- 5 carpetas obligatorias (00-guidelines, inventarios, trazas, directivas, tareas)
- 1 carpeta _archive para contenido histórico

## Estado Actual vs Deseado

| Aspecto | Actual | Deseado |
|---------|--------|---------|
| Carpetas | 41 | 6 |
| Archivos root | 18 | 10 |
| Estructura | Dispersa | Estandarizada |

## Objetos Impactados

| Capa | Impacto |
|------|---------|
| Orchestration | 41 carpetas → 6 carpetas |
| Archivos root | 18 → 10 |
| Documentación | _MAP.md actualizado |

## Carpetas a Archivar (35 total)

- 10 carpetas analisis-* (históricos)
- agentes, agents-gamilit (duplicado)
- 4 carpetas *-redundancia
- environment, errores, estados
- prompts, reportes, roadmap
- scrum, scripts, templates
- migracion-*, referencias

## Archivos Root a Archivar

- CHANGELOG-SISTEMA-SUBAGENTES.md
- README-*.md (5 archivos)
- SPRINT-*.yml (2 archivos)

## Dependencias

- No bloquea otras tareas
- No depende de otras tareas

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Pérdida de contenido | Mover a _archive, no eliminar |
| Referencias rotas | Actualizar _MAP.md |

---

*Fase A completada: 2026-01-24*
