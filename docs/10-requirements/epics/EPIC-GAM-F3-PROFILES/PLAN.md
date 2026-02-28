---
titulo: "Plan de Desarrollo: EPIC-GAM-F3-PROFILES"
tipo: plan
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Plan de Desarrollo: EPIC-GAM-F3-PROFILES

**Version:** 1.2.0 | **Fecha:** 2026-02-17
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 35
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-PERF-001 | Personalizacion Perfil | 8 | F1-AUTH | Sprint 15 |
| 2 | US-PERF-002 | Seguridad Cuenta | 5 | US-PERF-001 | Sprint 15 |
| 3 | US-PERF-003 | Accesibilidad Gamificacion | 5 | US-PERF-001, F1-GAMIFICATION | Sprint 16 |
| 4 | US-PERF-005 | Personalizacion Dashboard | 5 | US-PERF-001 | Sprint 16 |
| 5 | US-PERF-004 | Interacciones Sociales | 8 | US-PERF-001 | Sprint 16 |
| 6 | US-PERF-006 | Showcasing Logros | 5 | US-PERF-003, F1-GAMIFICATION | Sprint 17 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 15 / React 19 / S3 (avatares)
- **Base de datos:** Schema `auth_management` (extension de users con profile_settings, avatars, badges_showcase)
- **Patron:** Profile micro-service, avatar upload con S3/Cloudinary, dashboard widgets configurables

## Estrategia de Testing
- **Unit:** profile.service, avatar-upload, badge-showcase (Jest)
- **Integration:** /api/v1/profiles/*, /api/v1/avatars/* (supertest)
- **E2E:** Editar perfil, cambiar avatar, configurar dashboard, ver logros (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Upload de archivos maliciosos | Media | Alto | Validacion MIME, antivirus scan, size limits |
| Privacidad de perfiles menores | Alta | Alto | Privacidad por defecto, control parental |
| Customizacion excesiva del dashboard | Baja | Bajo | Widgets predefinidos, layout limitado |


---

*Generado: 2026-02-10 | ADR-0020*
