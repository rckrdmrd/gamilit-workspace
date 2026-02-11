# EPIC-GAM-DATABASE: Esquema BD Gamilit

| Campo | Valor |
|-------|-------|
| **Proyecto** | gamilit |
| **Wave** | wave_3 (High Priority P1) |
| **Story Points** | 21 |
| **Estado** | completed |
| **Prioridad** | P1 |

**ADR:** [ADR-0019](../../../../../../../docs/90-adr/ADR-0019-ssot-documentacion-producto-en-proyecto.md)

---

## Descripcion

Implementacion completa del esquema de base de datos PostgreSQL 16 para la plataforma educativa gamilit. Abarca 18 schemas modulares que cubren desde autenticacion y multi-tenancy hasta los 5 modulos educativos, el sistema de gamificacion maya, y los portales de maestros y padres. El diseno incluye Row Level Security (RLS) con 282 politicas para aislamiento multi-tenant, 128 funciones SQL para logica de negocio critica, y 49 triggers para automatizacion de eventos como calculo de XP y actualizacion de rangos maya.

## Alcance

- 18 schemas creados con todas sus tablas (auth, users, tenants, modules, exercises, content, gamification, leaderboard, missions, store, achievements, social, teachers, parents, analytics, reports, notifications, settings)
- 171 tablas con DDL completo (CREATE TABLE, constraints, defaults, comments)
- 282 RLS policies para multi-tenancy seguro
- 128 funciones SQL (calculo XP, evaluacion ejercicios, ranking, estadisticas)
- 49 triggers (auto-update timestamps, gamification events, notification dispatch)
- 36 ENUMs sincronizados entre DDL y backend
- 13 views + 7 materialized views (leaderboards, estadisticas agregadas)
- 299 foreign keys con integridad referencial
- Seeds de datos de prueba para desarrollo

## Componentes Afectados

| Capa | Componentes |
|------|-------------|
| Database | 18 schemas, 171 tablas, 282 RLS, 128 funciones, 49 triggers, 36 ENUMs, 13 views, 7 MVs, 299 FKs |
| Backend | TypeORM entities (141) deben sincronizar con DDL |
| Frontend | N/A (indirectamente via API) |
| DevOps | Script unified-recreate-db.sh para recreacion automatizada en WSL |

## Dependencias

**Depende de:** EPIC-GAM-ARCHITECTURE
**Bloquea:** EPIC-GAM-BACKEND

## User Stories

> Detalle en: [../user-stories/](../user-stories/) (27 US L3)

## Definition of Done

- [ ] 171 tablas creadas en 18 schemas con DDL completo y sin errores de ejecucion
- [ ] 282 RLS policies aplicadas y verificadas con multi-tenant queries
- [ ] Seeds de datos ejecutados exitosamente en WSL con unified-recreate-db.sh
- [ ] Documentacion actualizada
- [ ] Inventarios sincronizados

## Tracking

**YAML:** [EPIC-GAM-DATABASE.yml](../../../../orchestration/work-items/epics/EPIC-GAM-DATABASE.yml)

---
*Generado: 2026-02-07 | SSOT: ADR-0019 | Template: TEMPLATE-EPICA.md v2.0.0*
