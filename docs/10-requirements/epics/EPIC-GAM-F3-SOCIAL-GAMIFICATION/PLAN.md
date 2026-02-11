# Plan de Desarrollo: EPIC-GAM-F3-SOCIAL-GAMIFICATION

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 39
**Estado:** Backlog

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-GAM-010 | Sistema de Amigos | 8 | F1-GAMIFICATION | Sprint 22 |
| 2 | US-GAM-011 | Multiplicador ML Coins por Rango | 5 | F1-GAMIFICATION | Sprint 22 |
| 3 | US-GAM-012 | Leaderboard de Amigos | 5 | US-GAM-010 | Sprint 23 |
| 4 | US-GAM-013 | Sistema de Gremios | 8 | US-GAM-010 | Sprint 23 |
| 5 | US-GAM-014 | Misiones de Gremio | 8 | US-GAM-013 | Sprint 24 |
| 6 | US-GAM-015 | Gestion de Miembros Gremio | 5 | US-GAM-013 | Sprint 24 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 16 / React 19 / Socket.IO 4.8+ / Redis
- **Base de datos:** Schema `social_features` (7 tablas: friendships, friend_requests, guilds, guild_members, guild_join_requests, guild_missions, guild_mission_contributions)
- **Patron:** Social graph con friendship model, guild system con roles (lider, oficial, miembro), misiones colaborativas event-driven

## Estrategia de Testing
- **Unit:** friends.service, guilds.service, guild-missions.service, multiplier-calculator (Jest)
- **Integration:** /api/v1/friends/*, /api/v1/guilds/*, /api/v1/leaderboards/friends (supertest)
- **E2E:** Agregar amigo, crear gremio, completar mision grupal, verificar multiplicador (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Cyberbullying via sistema social | Media | Alto | Reportes, moderacion, bloqueo |
| Gremios inactivos acumulados | Alta | Bajo | Cleanup automatico, merge sugerido |
| Spam de solicitudes de amistad | Media | Bajo | Rate limiting, cooldown period |
| Multiplicador inflacionario | Media | Alto | Caps por rango, revision periodica de economia |

---

*Generado: 2026-02-10 | ADR-0020*
