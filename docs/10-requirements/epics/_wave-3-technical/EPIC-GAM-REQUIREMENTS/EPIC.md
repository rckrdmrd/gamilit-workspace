# EPIC-GAM-REQUIREMENTS: Requerimientos Gamilit

| Campo | Valor |
|-------|-------|
| **Proyecto** | gamilit |
| **Wave** | wave_3 (High Priority P1) |
| **Story Points** | 13 |
| **Estado** | completed |
| **Prioridad** | P1 |

**ADR:** [ADR-039](../../../../90-adr/ADR-039-ssot-docs-en-proyecto.md)

---

## Descripcion

Definicion completa de requerimientos funcionales y no funcionales para la plataforma educativa gamificada gamilit. Incluye la especificacion de los 5 modulos de comprension lectora (literal, inferencial, critica, digital/multimodal, produccion), los 23 tipos de ejercicios interactivos, los 4 portales diferenciados (estudiante, maestro, administrador, padres), y el sistema completo de gamificacion basado en cultura maya con XP, rangos, logros, misiones y economia virtual (ML Coins). Se generaron user stories L3 con formato Given/When/Then y se priorizaron por sprint.

## Alcance

- Requerimientos funcionales RF-01 a RF-08 (modulos educativos, gamificacion, portales, analytics)
- Requerimientos no funcionales RNF-01 a RNF-06 (rendimiento, seguridad, escalabilidad, accesibilidad)
- Definicion de 5 modulos educativos con progresion literal a critica
- Especificacion de 23 tipos de ejercicios interactivos
- Especificacion de 4 portales con funcionalidad diferenciada por rol
- Definicion del sistema de gamificacion maya (XP, rangos, logros, ML Coins, misiones)

## Componentes Afectados

| Capa | Componentes |
|------|-------------|
| Database | Modelo conceptual de 18 schemas |
| Backend | Especificacion de 23 modulos y 912 endpoints |
| Frontend | Wireframes de 4 portales, 70 paginas, 23 tipos de ejercicio |
| DevOps | N/A |

## Dependencias

**Depende de:** EPIC-GAM-SCAFFOLD
**Bloquea:** EPIC-GAM-ARCHITECTURE

## User Stories

> Detalle en: [../user-stories/](../user-stories/) (27 US L3)

## Definition of Done

- [ ] User stories L3 completas con Given/When/Then para todos los modulos
- [ ] Requerimientos funcionales y no funcionales documentados y priorizados
- [ ] Especificacion de los 5 modulos educativos y 23 tipos de ejercicios aprobada
- [ ] Documentacion actualizada
- [ ] Inventarios sincronizados

## Tracking

**YAML:** [EPIC-GAM-REQUIREMENTS.yml](../../../../../orchestration/work-items/epics/EPIC-GAM-REQUIREMENTS.yml)

---
*Generado: 2026-02-07 | SSOT: ADR-039 | Template: TEMPLATE-EPICA.md v2.0.0*
