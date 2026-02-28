---
titulo: MAPA DE NAVEGACION - System Flows
tipo: mapa-navegacion
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# MAPA DE NAVEGACION - System Flows

> Flujos de nivel sistema organizados por dominio.

## Por Dominio

### Progress / Ejercicios
- [FL-SYS-02: Exercise Submission Pipeline](./FL-SYS-02-EXERCISE-SUBMISSION-PIPELINE.md)

### Gamification
- [FL-SYS-03: Gamification Reward Chain](./FL-SYS-03-GAMIFICATION-REWARD-CHAIN.md)

### Seguridad / Auth
- [FL-SYS-04: Two-Factor Authentication](./FL-SYS-04-TWO-FACTOR-AUTHENTICATION.md)

### Multi-tenancy
- [FL-SYS-05: Multi-tenant Onboarding](./FL-SYS-05-MULTI-TENANT-ONBOARDING.md)

## Dependencias entre flujos

- FL-SYS-02 depende de FL-SYS-03 (rewards se distribuyen post-grading)
- FL-SYS-04 se integra en flujo de login (auth/)
- FL-SYS-05 establece contexto de tenant para todos los demas flujos (RLS)
