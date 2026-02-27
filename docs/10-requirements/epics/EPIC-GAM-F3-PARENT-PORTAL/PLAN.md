# Plan de Desarrollo: EPIC-GAM-F3-PARENT-PORTAL

**Version:** 1.3.0 | **Fecha:** 2026-02-17
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 20
**Estado:** Backlog (35% implementado)

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-PP-001 | Modelo de datos y relaciones de padres | 7 | F1-AUTH | Sprint 20 |
| 2 | US-PP-002 | Vinculacion padre-estudiante (FL-PRN-01) | 4 | US-PP-001 | Sprint 20 |
| 3 | US-PP-003 | Seguimiento de progreso (FL-PRN-02) | 6 | US-PP-002 | Sprint 21 |
| 4 | US-PP-004 | Notificaciones escuela-familia (FL-PRN-03) | 3 | US-PP-002, F3-NOTIFICATIONS | Sprint 21 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 15 / React 19 / Vite 6.x
- **Base de datos:** Schema `parents` (parent_student_links), `auth_management.profiles`, `progress_tracking.*`, `analytics.*`, `notifications.*`, `communication.*`
- **Patron:** Portal separado con acceso via codigo, dashboard read-only de progreso con validacion de vinculacion

## Procesos y Diagramas de Flujo
- **FL-PRN-01:** Vinculacion padre-estudiante → `docs/30-ux-ui/flujos/parents/FLUJO-VINCULACION-PADRE-ESTUDIANTE.md`
- **FL-PRN-02:** Seguimiento de progreso → `docs/30-ux-ui/flujos/parents/FLUJO-SEGUIMIENTO-PROGRESO.md`
- **FL-PRN-03:** Notificaciones escuela-familia → `docs/30-ux-ui/flujos/parents/FLUJO-NOTIFICACIONES-PADRES.md`
- **Matriz de cobertura:** `docs/30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md` (FL-PRN-01..03)

## Estrategia de Testing
- **Unit:** parent-account.service, parent-link.service (Jest)
- **Integration:** /api/v1/parents/links/*, /api/v1/parents/students/:id/progress, /api/v1/parents/notifications/* (supertest)
- **E2E:** Login padre con codigo, ver dashboard progreso hijo, recibir notificacion (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Vinculacion padre-hijo incorrecta | Media | Alto | Verificacion por institucion, codigo unico |
| Acceso a progreso sin vinculacion activa | Media | Alto | Validacion obligatoria en ParentsProgressService |
| Privacidad datos menores (COPPA) | Alta | Alto | Consentimiento previo, datos minimos |


---

*Generado: 2026-02-10 | ADR-0020*
