# Mapa de Documentacion - Estandares

## Ubicacion

`docs/40-standards/`

## Descripcion

Estandares tecnicos del proyecto GAMILIT. Convenciones, patrones y reglas obligatorias para todo el equipo de desarrollo.

---

## Documentos

### Estandares Generales

| Documento | Descripcion | Estado |
|-----------|-------------|--------|
| [ESTANDAR-API.md](./ESTANDAR-API.md) | Estandar de diseno de APIs REST | Vigente |
| [ESTANDAR-BACKEND-PROFESIONAL.md](./ESTANDAR-BACKEND-PROFESIONAL.md) | Estandar completo de backend NestJS (SOLID, DDD, testing) | Vigente |
| [ESTANDAR-CODIGO.md](./ESTANDAR-CODIGO.md) | Convenciones generales de codigo | Vigente |
| [ESTANDAR-CROSS-SCHEMA-REFERENCES.md](./ESTANDAR-CROSS-SCHEMA-REFERENCES.md) | FKs cross-schema, cross-datasource entities, RLS functions | Vigente |
| [ESTANDAR-DATABASE-PROFESIONAL.md](./ESTANDAR-DATABASE-PROFESIONAL.md) | Estandar de base de datos PostgreSQL | Vigente |
| [ESTANDAR-DIAGRAMAS-ER.md](./ESTANDAR-DIAGRAMAS-ER.md) | Convenciones para diagramas entidad-relacion | Vigente |
| [ESTANDAR-DOCUMENTACION.md](./ESTANDAR-DOCUMENTACION.md) | Estandar de documentacion del proyecto | Vigente |
| [ESTANDAR-FRONTEND-PROFESIONAL.md](./ESTANDAR-FRONTEND-PROFESIONAL.md) | Estandar completo de frontend React | Vigente |
| [ESTANDAR-GIT.md](./ESTANDAR-GIT.md) | Convenciones de commits, branching, PRs | Vigente |
| [ESTANDAR-MEMORIA-TOKENS.md](./ESTANDAR-MEMORIA-TOKENS.md) | Gestion de ventana de contexto para agentes IA | Vigente |
| [ESTANDAR-METADATA-ITEMS.md](./ESTANDAR-METADATA-ITEMS.md) | Contrato JSONB metadata para shop_items visuales | Vigente |
| [ESTANDAR-NOMENCLATURA.md](./ESTANDAR-NOMENCLATURA.md) | Nomenclatura general del proyecto | Vigente |
| [ESTANDAR-NOMENCLATURA-API.md](./ESTANDAR-NOMENCLATURA-API.md) | Nomenclatura snake_case/camelCase entre capas | Vigente |
| [ESTANDAR-OBSERVABILIDAD.md](./ESTANDAR-OBSERVABILIDAD.md) | OpenTelemetry, Prometheus, tracing, SLOs | Vigente |
| [ESTANDAR-PERFORMANCE.md](./ESTANDAR-PERFORMANCE.md) | Estandar de rendimiento y optimizacion | Vigente |
| [ESTANDAR-SEGURIDAD.md](./ESTANDAR-SEGURIDAD.md) | Estandar de seguridad (RLS, JWT, rate limiting) | Vigente |
| [ESTANDAR-SKILLS.md](./ESTANDAR-SKILLS.md) | Estandar para skills/comandos de agentes | Vigente |
| [ESTANDAR-TESTING.md](./ESTANDAR-TESTING.md) | Estandar de testing (unit, integration, e2e) | Vigente |
| [ESTANDAR-12-FACTOR-APP.md](./ESTANDAR-12-FACTOR-APP.md) | Checklist 12-Factor App compliance | Vigente |

### Estandares Frontend Especificos

| Documento | Descripcion | Estado |
|-----------|-------------|--------|
| [STANDARD-API.md](./STANDARD-API.md) | APIs frontend: ubicacion canonica, React Query, error handling | Vigente |
| [STANDARD-COMPONENT.md](./STANDARD-COMPONENT.md) | Componentes: exports, props typing, React imports, file naming | Vigente |
| [STANDARD-IMPORTS.md](./STANDARD-IMPORTS.md) | Import order, path aliases, barrels, icon imports | Vigente |
| [STANDARD-TYPES.md](./STANDARD-TYPES.md) | Jerarquia de tipos, anti-duplicados, inline types, any policy | Vigente |
| [STANDARD-UX-PATTERNS.md](./STANDARD-UX-PATTERNS.md) | Error/Loading/Empty states, toasts, forms, confirmation dialogs | Vigente |

## Subdirectorios

| Directorio | Contenido | Estado |
|------------|-----------|--------|
| [guias/](./guias/README.md) | REDIRECT - Contenido migrado a `docs/50-guides/` y `docs/60-portals/` | Migrado |

---

## Relacionados

- [`docs/50-guides/`](../50-guides/) - Guias de implementacion por dominio
- [`docs/60-portals/`](../60-portals/) - Documentacion de portales
- `orchestration/directivas/` - Directivas operacionales SIMCO

---

*Actualizado: 2026-02-20*
