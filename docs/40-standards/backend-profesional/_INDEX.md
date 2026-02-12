---
tipo: estandar-workspace
scope: workspace
version: 1.0.0
herencia: |
  Este estandar aplica a nivel WORKSPACE.
  Los proyectos pueden EXTENDER (no contradecir) con estandares locales.
  Ejemplo: workspace-projects/projects/{proyecto}/docs/BACKEND-STANDARDS.md para APIs especificas.
actualizado: 2026-02-02
tags:
  - backend
  - nestjs
  - solid
  - clean-architecture
  - ddd
  - typescript
---

# Estandar Backend Profesional

> Patrones arquitectonicos, principios de diseno y mejores practicas para desarrollo backend con NestJS

---

## Tabla de Contenidos

| # | Seccion | Archivo | Descripcion |
|---|---------|---------|-------------|
| 1 | Principios SOLID Aplicados a NestJS | [01-principios-solid.md](./01-principios-solid.md) | SRP, OCP, LSP, ISP, DIP aplicados a NestJS |
| 2 | Clean Architecture en NestJS | [02-clean-architecture.md](./02-clean-architecture.md) | Capas, regla de dependencias, estructura de carpetas |
| 3 | Repository Pattern | [03-repository-pattern.md](./03-repository-pattern.md) | Interfaces, implementacion TypeORM, inyeccion de dependencias |
| 4 | Domain-Driven Design (DDD) Basico | [04-domain-driven-design.md](./04-domain-driven-design.md) | Entities, Value Objects, Aggregates, Domain Services |
| 5 | Manejo de Errores | [05-manejo-errores.md](./05-manejo-errores.md) | Jerarquia de excepciones, filters, codigos estandarizados |
| 6 | Validacion de Datos | [06-validacion-datos.md](./06-validacion-datos.md) | Class-Validator, custom validators, pipeline |
| 7 | Testing Patterns | [07-testing-patterns.md](./07-testing-patterns.md) | Unit tests, integration tests, mocks, builders |
| 8 | Referencias | [08-referencias.md](./08-referencias.md) | Links a documentacion y estandares relacionados |

---

## Navegacion

- **Anterior:** [ESTANDAR-CODIGO.md](../ESTANDAR-CODIGO.md)
- **Padre:** [docs/40-standards/](../README.md)
