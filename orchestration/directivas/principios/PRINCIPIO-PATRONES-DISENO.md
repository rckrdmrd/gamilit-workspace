# PRINCIPIO: PATRONES DE DISENO

**Version:** 1.0.0
**Fecha:** 2026-02-11
**Aplica a:** Gamilit (NestJS 11 + React 19 + PostgreSQL 15)

---

## PATRONES BACKEND (NestJS)

| Patron | Uso en Gamilit |
|--------|----------------|
| **Repository Pattern** | TypeORM entities con DataSource injection |
| **Service Layer** | Logica de negocio en services, controllers delgados |
| **DTO Pattern** | Validacion de entrada con class-validator |
| **Guard Pattern** | Autenticacion JWT + RBAC con guards NestJS |
| **Interceptor Pattern** | RLS, Audit logging, Response transformation |
| **Module Pattern** | 22 modulos NestJS con boundaries claros |
| **Strategy Pattern** | Tipos de ejercicio (23 strategies) |
| **Observer Pattern** | Event emitters para gamificacion |

## PATRONES FRONTEND (React)

| Patron | Uso en Gamilit |
|--------|----------------|
| **Component Composition** | Componentes atomicos reutilizables |
| **Custom Hooks** | 101 hooks para logica compartida |
| **Zustand Stores** | 14 stores con slices por dominio |
| **Feature-based Structure** | Organizacion por feature, no por tipo |
| **Lazy Loading** | Routes con React.lazy para code splitting |
| **Error Boundaries** | Componentes resilientes a fallos |

## PATRONES DATABASE (PostgreSQL)

| Patron | Uso en Gamilit |
|--------|----------------|
| **Schema Separation** | 18 schemas modulares |
| **Row Level Security** | 207 politicas RLS para multi-tenancy |
| **Materialized Views** | 7 views para reportes de rendimiento |
| **Trigger-based Audit** | 67 triggers para audit logging |
| **Function Encapsulation** | 183 funciones (DDL) para logica compleja |

## ANTI-PATRONES A EVITAR

1. **God Service** - Services con >500 lineas -> dividir en sub-services
2. **Anemic Entity** - Entities sin logica -> agregar metodos de dominio
3. **Prop Drilling** - >3 niveles de props -> usar Zustand store
4. **N+1 Queries** - Queries en loop -> usar relations/joins
5. **Mixed Concerns** - Controllers con logica -> mover a services

## REFERENCIAS

- `@PRINCIPIO-SOLID` - Principios SOLID
- `@PRINCIPIO-CLEAN-ARCH` - Clean Architecture
- `@PRINCIPIO-DRY` - Don't Repeat Yourself
- `@PRINCIPIO-KISS` - Keep It Simple
- `@ESTANDAR-BACKEND` - Estandar backend profesional

## Ver tambien

- [ESTANDAR-BACKEND-PROFESIONAL](../../../docs/40-standards/ESTANDAR-BACKEND-PROFESIONAL.md) - Estandar backend profesional (Repository, DDD, Testing patterns)

---

**Version:** 1.0.0 | **Tipo:** Principio
