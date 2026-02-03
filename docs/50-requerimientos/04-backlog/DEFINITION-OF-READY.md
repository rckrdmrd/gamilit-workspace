# Definition of Ready (DoR) - GAMILIT

**Proyecto:** GAMILIT - Plataforma de Gamificacion Educativa
**Ultima actualizacion:** 2026-01-04

---

## Proposito

El Definition of Ready (DoR) define los criterios que un item del backlog debe cumplir antes de que pueda ser trabajado en un Sprint.

---

## Criterios Generales

Un item del backlog esta "Ready" cuando:

### 1. Claridad

- [ ] El titulo es claro y descriptivo
- [ ] La descripcion del problema/necesidad esta documentada
- [ ] Los criterios de aceptacion estan definidos
- [ ] No hay ambiguedades en los requisitos

### 2. Alcance

- [ ] El scope esta claramente delimitado
- [ ] Las dependencias estan identificadas
- [ ] Los items bloqueantes estan resueltos
- [ ] El item es lo suficientemente pequeno para un Sprint

### 3. Estimacion

- [ ] El equipo ha estimado story points
- [ ] La complejidad tecnica esta evaluada
- [ ] Los riesgos estan identificados

### 4. Documentacion

- [ ] Existe RF (Requerimiento Funcional) asociado
- [ ] Existe ET (Especificacion Tecnica) si aplica
- [ ] Los mockups/wireframes estan disponibles (si aplica)

---

## Checklist por Tipo de Item

### User Story

- [ ] Formato "Como [rol], quiero [funcionalidad], para [beneficio]"
- [ ] Criterios de aceptacion en formato Given-When-Then o checklist
- [ ] RF relacionado identificado
- [ ] Story points estimados
- [ ] Sin bloqueos activos

### Bug Fix

- [ ] Pasos para reproducir documentados
- [ ] Comportamiento esperado vs actual documentado
- [ ] Severidad/Prioridad asignada
- [ ] Ambiente donde se reproduce identificado

### Technical Task

- [ ] Objetivo tecnico claro
- [ ] Impacto en el sistema documentado
- [ ] Criterios de completitud definidos
- [ ] Rollback plan si aplica

---

## Criterios de Prioridad

| Prioridad | Descripcion |
|-----------|-------------|
| P0 - Critical | Bloqueante para produccion, seguridad |
| P1 - High | Funcionalidad core, deadline cercano |
| P2 - Medium | Mejoras importantes, puede esperar |
| P3 - Low | Nice-to-have, mejoras menores |

---

## Notas

- Items que no cumplan DoR no entran al Sprint
- El PO es responsable de asegurar que el backlog este "Ready"
- El equipo puede rechazar items que no cumplan DoR en Planning

---

**Basado en:** Estandar SCRUM + SIMCO (Sistema Indexado Modular por Contexto)
