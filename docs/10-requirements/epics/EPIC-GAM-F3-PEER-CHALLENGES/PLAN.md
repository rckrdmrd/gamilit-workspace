# Plan de Desarrollo: EPIC-GAM-F3-PEER-CHALLENGES

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 25
**Estado:** Backlog (50% implementado)

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-PEER-001 | Challenge Creation and Matching | 10 | F1-GAMIFICATION, F3-SOCIAL-GAMIFICATION | Sprint 24 |
| 2 | US-PEER-002 | 1v1 Challenge Execution | 8 | US-PEER-001 | Sprint 24 |
| 3 | US-PEER-003 | Scoring and ML Coins Wagering | 7 | US-PEER-002 | Sprint 25 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 15 / React 19 / Socket.IO 4.8+ / Redis
- **Base de datos:** Schema `social_features` (tablas peer_challenges, challenge_attempts)
- **Patron:** Real-time WebSocket para matchmaking y battle updates, wager system con transacciones atomicas

## Estrategia de Testing
- **Unit:** challenge.service, matchmaking.service, wager.service (Jest)
- **Integration:** /api/v1/challenges/* + WebSocket events (supertest + socket.io-client)
- **E2E:** Crear challenge, aceptar, competir, verificar scoring y coins (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| WebSocket latency en challenges real-time | Alta | Alto | Redis pub/sub, server-side validation |
| Wagering economy abuse | Media | Alto | Limites diarios, anti-collusion checks |
| Cheating (respuestas rapidas) | Media | Alto | Server-side timing, randomized questions |
| Challenge abandonment | Alta | Medio | Timeout automatico, penalizacion leve |

---

*Generado: 2026-02-10 | ADR-0020*
