# 20 - Arquitectura

> Documentacion de arquitectura del sistema GAMILIT: stack tecnologico, modelo de datos, esquemas de base de datos, gamificacion y ambientes.

---

## Archivos Root (12)

| Archivo | Descripcion |
|---------|-------------|
| [README.md](README.md) | Introduccion a la arquitectura |
| [STACK-TECNOLOGICO.md](STACK-TECNOLOGICO.md) | NestJS 11 + React 19 + PostgreSQL 15 + Redis + Socket.IO |
| [MODELO-DATOS.md](MODELO-DATOS.md) | Modelo de datos conceptual (18 schemas) |
| [AMBIENTES-DEV-PROD.md](AMBIENTES-DEV-PROD.md) | Configuracion de ambientes dev (WSL) y prod (74.208.126.102) |
| [ARQUITECTURA-GAMIFICACION.md](ARQUITECTURA-GAMIFICACION.md) | Sistema de gamificacion (XP, rangos maya, logros, ML Coins) |
| [MECANICAS-GAMIFICACION-V6.md](MECANICAS-GAMIFICACION-V6.md) | Indice legacy de mecanicas (segmentado) |
| [gamificacion/README.md](gamificacion/README.md) | Estructura canonica de gamificacion por subtema |
| [DATOS-GAMIFICACION.md](DATOS-GAMIFICACION.md) | Datos y flujos de gamificacion |
| [COHERENCE-ENTITIES-DDL.md](COHERENCE-ENTITIES-DDL.md) | Coherencia DDL ↔ Entities TypeORM |
| [TRACEABILITY-US-SCHEMAS.md](TRACEABILITY-US-SCHEMAS.md) | Trazabilidad User Stories ↔ Schemas |
| [SCHEMA-REFERENCE.md](SCHEMA-REFERENCE.md) | Indice de referencia de schemas |
| [DB-OPERACION-AMBIENTES-DECISION.md](DB-OPERACION-AMBIENTES-DECISION.md) | Decision operativa de BD por ambiente (dev vs prod) |

## Subdirectorios

### schema-reference/ (22 archivos)

Documentacion detallada por schema de base de datos:

| Archivo | Schema |
|---------|--------|
| [01-auth.md](schema-reference/01-auth.md) | auth_management |
| [02-tenants.md](schema-reference/02-tenants.md) | Tenants / multi-tenancy |
| [03-education.md](schema-reference/03-education.md) | educational_content |
| [04-gamification.md](schema-reference/04-gamification.md) | gamification_system |
| [05-social.md](schema-reference/05-social.md) | social_features |
| [06-classrooms.md](schema-reference/06-classrooms.md) | Classrooms |
| [07-analytics.md](schema-reference/07-analytics.md) | Analytics |
| [08-reports.md](schema-reference/08-reports.md) | Reports |
| [09-notifications.md](schema-reference/09-notifications.md) | notifications |
| [10-store.md](schema-reference/10-store.md) | Store |
| [11-missions.md](schema-reference/11-missions.md) | Missions |
| [12-leaderboard.md](schema-reference/12-leaderboard.md) | Leaderboard |
| [13-content.md](schema-reference/13-content.md) | content_management |
| [14-parents.md](schema-reference/14-parents.md) | Parents |
| [15-settings.md](schema-reference/15-settings.md) | system_configuration |
| [16-audit.md](schema-reference/16-audit.md) | audit_logging |
| [17-data-warehouse.md](schema-reference/17-data-warehouse.md) | data_warehouse |
| [18-admin-dashboard.md](schema-reference/18-admin-dashboard.md) | admin_dashboard |
| [19-communication.md](schema-reference/19-communication.md) | communication |
| [20-gamilit-utility.md](schema-reference/20-gamilit-utility.md) | gamilit (utility) |
| [17-18-placeholder.md](schema-reference/17-18-placeholder.md) | Placeholder (legacy) |
| [99-utilities.md](schema-reference/99-utilities.md) | Utilidades transversales |

### gamificacion/ (10 archivos)

| Archivo | Cobertura |
|---------|-----------|
| [README.md](gamificacion/README.md) | Indice de segmentacion |
| [_INDEX.md](gamificacion/_INDEX.md) | Tabla de contenidos local |
| [_MAP.md](gamificacion/_MAP.md) | Navegacion rapida por subtema |
| [RANGOS-MAYA.md](gamificacion/RANGOS-MAYA.md) | Jerarquia y umbrales de XP |
| [ECONOMIA-VIRTUAL.md](gamificacion/ECONOMIA-VIRTUAL.md) | ML Coins, bonus y usos |
| [MODULO-1-MECANICAS.md](gamificacion/MODULO-1-MECANICAS.md) | Comprension literal |
| [MODULO-2-MECANICAS.md](gamificacion/MODULO-2-MECANICAS.md) | Comprension inferencial |
| [MODULO-3-MECANICAS.md](gamificacion/MODULO-3-MECANICAS.md) | Comprension critica |
| [MODULO-4-MECANICAS.md](gamificacion/MODULO-4-MECANICAS.md) | Lectura digital |
| [MODULO-5-MECANICAS.md](gamificacion/MODULO-5-MECANICAS.md) | Produccion y expresion |

---

**Total:** 12 archivos root + 22 schema-reference + 8 gamificacion + _INDEX.md
