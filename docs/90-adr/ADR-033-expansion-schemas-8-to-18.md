# ADR-033: Expansion de Schemas de 8 a 18

**Estado:** Accepted
**Fecha:** 2026-02-06
**Contexto:** TASK-2026-02-06-ANALISIS-INTEGRAL-DOCUMENTACION

## Contexto

GAMILIT originally launched with 8 database schemas (auth_management, student_learning, gamification_system, content_management, social_interaction, admin_tools, notifications_system, audit_logs). As features expanded through Phases 1-3, the schema count grew to 18.

## Decision

Expand from 8 to 18 schemas to support new feature domains while maintaining domain-driven separation:

### Original 8 Schemas (Phase 1)
1. auth_management
2. student_learning → renamed to educational_content
3. gamification_system
4. content_management
5. social_interaction → renamed to social_features
6. admin_tools → renamed to admin_dashboard
7. notifications_system → renamed to notifications
8. audit_logs → renamed to audit_logging

### Added 10 Schemas (Phases 2-3)
9. gamilit (utility functions, timezone helpers)
10. progress_tracking (extracted from student_learning)
11. system_configuration (feature flags, settings)
12. communication (messages, conversations)
13. lti_integration (LTI 1.3 platform integration)
14. parent_portal (parent accounts, child linking)
15. teacher_portal (teacher-specific data)
16. analytics (advanced analytics, data warehouse)
17. public (PostgreSQL default, placeholder)
18. storage (file storage metadata, placeholder)

## Rationale
- Better separation of concerns per domain
- Enables independent RLS policy management per schema
- Supports modular development (each schema = 1 team boundary)
- Renamed schemas reflect actual content more accurately

## Consequences
- 171 tables distributed across 18 schemas
- 282 RLS policies (per-schema management)
- DDL execution order requires dependency resolution (create-database.sh 16-phase)
- ARCHITECTURE.md, _MAP.md, and other docs required updates (completed Sprint 1)
- 82.5% DDL-Backend coherence (target: 100%)

## Related
- ADR-0001: Monorepo Architecture
- ADR-007: Schemas sin Tablas (explains placeholder schemas)
- ADR-018: Removal of Migrations (manual DDL management)
- TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD (verified counts)
