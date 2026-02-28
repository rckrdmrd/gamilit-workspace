---
titulo: "Plan de Desarrollo: EPIC-GAM-F3-LTI"
tipo: plan
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Plan de Desarrollo: EPIC-GAM-F3-LTI

**Version:** 1.2.0 | **Fecha:** 2026-02-17
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 40
**Estado:** Backlog (40% implementado)

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-LTI-001 | OIDC Login Flow | 13 | F1-AUTH | Sprint 25 |
| 2 | US-LTI-004 | Platform Configuration UI | 8 | US-LTI-001 | Sprint 25 |
| 3 | US-LTI-002 | Grade Passback (AGS) | 10 | US-LTI-001, F1-GAMIFICATION | Sprint 26 |
| 4 | US-LTI-003 | Deep Linking | 10 | US-LTI-001, F1-EXERCISES | Sprint 26 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 15 / React 19 / LTI 1.3 (IMS Global)
- **Base de datos:** Schema `auth_management` (tablas lti_consumers, lti_sessions, lti_grade_passbacks)
- **Patron:** LTI 1.3 standard (OIDC + AGS + Deep Linking), JWT RSA-256, multi-tenant isolation

## Estrategia de Testing
- **Unit:** lti-oidc.service, grade-passback.service, deep-linking.service (Jest)
- **Integration:** /api/v1/lti/* (30 endpoints) (supertest)
- **E2E:** Login desde Canvas/Moodle, sincronizar calificacion, seleccionar contenido (LTI Advantage Validator)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Compatibilidad multi-LMS | Alta | Alto | Priorizar Canvas+Moodle, sandbox testing |
| OIDC token security | Media | Alto | RSA-256, state+nonce CSRF, httpOnly cookies |
| Grade passback reliability | Media | Alto | Retry automatico, queue persistente, audit log |
| Dependencia de contratos enterprise | Alta | Alto | Feature flag, deploy independiente |


---

*Generado: 2026-02-10 | ADR-0020*
