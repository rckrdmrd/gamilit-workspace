# TRACKING DE DELEGACION PARALELA

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Aplica a:** sesiones con múltiples subagentes.

---

## Ubicación

- Archivos de sesión: `orchestration/tracking/SESSION-TRACKING-{uuid}.yml`
- Plantilla base: `orchestration/templates/03-por-proceso/session-tracking/SESSION-TRACKING-TEMPLATE.yml`

## Flujo mínimo

1. Crear archivo de tracking al iniciar Fase E paralela.
2. Registrar cada subagente delegado y su subtarea.
3. Actualizar estado al finalizar cada grupo.
4. Consolidar resultados antes de cerrar Fase E.
5. Referenciar evidencia en trazas de la tarea principal.

## Estados recomendados

- `activa`
- `completada`
- `fallida`
- `pausada`

## Regla operativa

No avanzar al siguiente grupo paralelo si el grupo actual tiene subtareas bloqueantes en estado `fallido` sin decisión explícita del orquestador.
