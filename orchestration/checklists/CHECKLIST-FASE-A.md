# CHECKLIST-FASE-A: Gate de Analisis

**Version:** 1.0.0
**Actualizado:** 2026-01-18
**Alias:** `@CHK-ANALISIS`

## Proposito

Validar que el analisis de impacto y dependencias esta completo antes de planificar.

---

## Checklist

### Analisis de Dependencias

- [ ] Identificados archivos que IMPORTAN los archivos a modificar (dependientes)
- [ ] Identificados archivos que los archivos a modificar IMPORTAN (dependencias)
- [ ] Evaluado impacto del cambio en dependientes
- [ ] Si hay cambios breaking: incluidos en el alcance

### Analisis de Codigo Existente

- [ ] Leido y entendido el codigo actual a modificar
- [ ] Identificados patrones existentes a seguir
- [ ] Identificados anti-patrones a evitar
- [ ] Documentado estado actual (si es complejo)

### Analisis de Riesgos

- [ ] Riesgos tecnicos identificados
- [ ] Riesgos de integracion identificados
- [ ] Plan de mitigacion para riesgos altos
- [ ] Riesgos documentados en METADATA.yml o SUBTASKS.yml

### Validacion de Alcance

- [ ] Alcance claramente definido (que SI y que NO incluye)
- [ ] Criterios de aceptacion identificados
- [ ] Entregables esperados listados

### Dependencias de Tareas

- [ ] Tareas previas requeridas identificadas
- [ ] Tareas bloqueadas por esta identificadas
- [ ] Si hay bloqueantes: documentados y plan de resolucion

---

## Criterios de Paso

**PASA** si:
- Dependencias de codigo mapeadas
- Riesgos identificados (aunque sea "sin riesgos significativos")
- Alcance definido

**NO PASA** si:
- No se leyó el codigo existente
- Cambios breaking no identificados
- Riesgos no evaluados

---

## Siguiente Fase

Si PASA: Continuar a **Fase P: Plan**
Si NO PASA: Completar analisis faltante

---

## Referencias

- Trigger Analisis Dependencias: `orchestration/directivas/triggers/TRIGGER-ANALISIS-DEPENDENCIAS.md`
- DEPENDENCY-GRAPH: `orchestration/trazabilidad/DEPENDENCY-GRAPH-VISUAL.yml`
