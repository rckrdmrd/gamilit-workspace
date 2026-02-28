---
titulo: Guia de Design Patterns Aplicados a NestJS
version: 2.0.0
fecha_creacion: 2026-02-14
fecha_modificacion: 2026-02-28
tags: [patrones, gof, nestjs, typescript]
aplica_a: [backend, frontend]
estado: vigente
tipo: hub
---

# Guia de Design Patterns Aplicados a NestJS

> **Aplica a:** `apps/backend/src/` y `apps/frontend/src/` | **Stack:** NestJS 11, TypeORM 0.3.x, React 19, TypeScript 5.x

---

## Indice de Patrones

| # | Patron | Categoria GoF | Uso Principal en gamilit |
|---|--------|--------------|--------------------------|
| 1 | Factory | Creacional | Providers con `useFactory`, modulos dinamicos |
| 2 | Strategy | Comportamiento | Guards (`CanActivate`), estrategias de autenticacion |
| 3 | Adapter | Estructural | TypeORM repositories, Redis adapter |
| 4 | Decorator | Estructural | Decoradores custom (`@Roles`, `@CurrentUser`) |
| 5 | Observer | Comportamiento | Eventos de dominio, comunicacion entre modulos |
| 6 | Builder | Creacional | TypeORM QueryBuilder, consultas complejas |
| 7 | Singleton | Creacional | Providers NestJS, scope por defecto |
| 8 | Template Method | Comportamiento | Base services con hooks abstractos |
| 9 | Repository | Estructural | TypeORM repositories (ver 03-repository-pattern.md) |
| 10 | Frontend Patterns | Varios | Compound Components, Custom Hooks, Zustand |

---

## Documentos de Detalle

Los patrones estan organizados en 5 archivos bajo `design-patterns/`:

| Archivo | Categoria | Patrones Incluidos |
|---------|-----------|--------------------|
| [design-patterns/01-CREATIONAL.md](design-patterns/01-CREATIONAL.md) | Creacional | Factory (1), Builder (6), Singleton (7) |
| [design-patterns/02-STRUCTURAL.md](design-patterns/02-STRUCTURAL.md) | Estructural | Adapter (3), Decorator (4) |
| [design-patterns/03-BEHAVIORAL.md](design-patterns/03-BEHAVIORAL.md) | Comportamiento | Strategy (2), Observer (5), Template Method (8) |
| [design-patterns/04-DATA-ACCESS.md](design-patterns/04-DATA-ACCESS.md) | Acceso a Datos | Repository (9) |
| [design-patterns/05-FRONTEND-RESUMEN.md](design-patterns/05-FRONTEND-RESUMEN.md) | Frontend + Resumen | Compound Components, Custom Hooks, Zustand, React Query, Matriz general |

**Indice de directorio:** [design-patterns/_INDEX.md](design-patterns/_INDEX.md)

---

## Referencias Relacionadas

- `docs/40-standards/backend-profesional/03-repository-pattern.md` — Repository Pattern en detalle
- `docs/90-adr/ADR-045-clean-architecture.md` — Arquitectura limpia y puertos/adaptadores
- `docs/90-adr/ADR-013-react-query.md` — Decision de uso de React Query
