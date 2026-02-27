# 40 - Estandares

> Guias de estilo, convenciones de codigo y estandares de calidad.

---

## Archivos Generales

| Archivo | Descripcion |
|---------|-------------|
| [README.md](./README.md) | Entrada y navegacion rapida de estandares |

## Tabla de Contenidos (31 Estandares Activos)

### Estandares Generales (21)

| # | Estandar | Proposito |
|---|----------|-----------|
| 1 | ESTANDAR-API.md | Convenciones RESTful, Swagger, seguridad de endpoints |
| 2 | ESTANDAR-BACKEND-PROFESIONAL.md | Redirect a backend-profesional/ (8 modulos SOLID/DDD) |
| 3 | ESTANDAR-CODIGO.md | Convenciones generales de codigo |
| 4 | ESTANDAR-CROSS-SCHEMA-REFERENCES.md | FKs cross-schema, cross-datasource entities, RLS functions |
| 5 | ESTANDAR-DATABASE-PROFESIONAL.md | PostgreSQL 15, DDL, RLS, triggers |
| 6 | ESTANDAR-DIAGRAMAS-ER.md | Convenciones para diagramas ER |
| 7 | ESTANDAR-DOCUMENTACION.md | Documentacion del proyecto |
| 8 | ESTANDAR-FRONTEND-PROFESIONAL.md | React 19, TypeScript, componentes |
| 9 | ESTANDAR-GIT.md | Commits, branching, PRs |
| 10 | ESTANDAR-MEMORIA-TOKENS.md | Gestion de ventana de contexto IA |
| 11 | ESTANDAR-METADATA-ITEMS.md | Contrato JSONB metadata para shop_items visuales |
| 12 | ESTANDAR-NOMENCLATURA.md | Nomenclatura general |
| 13 | ESTANDAR-NOMENCLATURA-API.md | snake_case/camelCase entre capas |
| 14 | ESTANDAR-OBSERVABILIDAD.md | OpenTelemetry, Prometheus, tracing, SLOs |
| 15 | ESTANDAR-PERFORMANCE.md | Optimizacion y rendimiento |
| 16 | ESTANDAR-SEGURIDAD.md | Indice de seguridad + Checklist pre-deploy |
| 17 | ESTANDAR-SEGURIDAD-WEB.md | OWASP Web Top 10 (2021) + Auth + Secrets + Headers |
| 18 | ESTANDAR-SEGURIDAD-API.md | OWASP API Security Top 10 (2023) |
| 19 | ESTANDAR-SKILLS.md | [MOVED] a `orchestration/agents/SKILL-STANDARD.md` |
| 20 | ESTANDAR-TESTING.md | Indice de testing (cobertura + checklists) + links a sub-archivos |
| 20a | ESTANDAR-TESTING-UNIT.md | Unit tests, naming, mocking, test data |
| 20b | ESTANDAR-TESTING-INTEGRATION.md | Integration tests (backend, frontend, DB) |
| 20c | ESTANDAR-TESTING-E2E.md | E2E tests + visual regression con Playwright |
| 20d | ESTANDAR-TESTING-ARCHITECTURE.md | Architecture tests (ts-arch, circular deps) |
| 21 | ESTANDAR-12-FACTOR-APP.md | Checklist 12-Factor App compliance |

### Estandares Frontend Especificos (6)

| # | Estandar | Proposito |
|---|----------|-----------|
| 20 | ESTANDAR-FRONTEND-API.md | APIs frontend: ubicacion canonica, React Query, error handling |
| 21 | ESTANDAR-FRONTEND-COMPONENT.md | Componentes: exports, props typing, React imports, file naming |
| 22 | ESTANDAR-FRONTEND-IMPORTS.md | Import order, path aliases, barrels, icon imports |
| 23 | ESTANDAR-FRONTEND-RESPONSIVE.md | Responsive design patterns (ADR-050) |
| 24 | ESTANDAR-FRONTEND-TYPES.md | Jerarquia de tipos, anti-duplicados, inline types, any policy |
| 25 | ESTANDAR-FRONTEND-UX-PATTERNS.md | Error/Loading/Empty states, toasts, forms, confirmation dialogs |

## Subdirectorio: backend-profesional/ (8 modulos)

| # | Modulo | Tema |
|---|--------|------|
| 1 | 01-principios-solid.md | Principios SOLID aplicados a NestJS |
| 2 | 02-clean-architecture.md | Clean Architecture patterns |
| 3 | 03-repository-pattern.md | Repository pattern con TypeORM |
| 4 | 04-domain-driven-design.md | DDD aplicado al proyecto |
| 5 | 05-manejo-errores.md | Error handling centralizado |
| 6 | 06-validacion-datos.md | Validacion con class-validator |
| 7 | 07-testing-patterns.md | Patrones de testing backend |
| 8 | 08-referencias.md | Referencias y recursos |

---

*Ultima actualizacion: 2026-02-27*
