---
id: "RF-ETC-003"
title: "Alineacion Entities DDL-TypeORM"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "backend, database"
epic: "ETC-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# RF-ETC-003: Alineacion Entities DDL-TypeORM

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-ETC-003 |
| Modulo | Backend (Entities) / Database (DDL) |
| Status | Done |
| EPIC | ETC-001 - Consolidacion Tecnica |

## Descripcion

Garantizar coherencia completa entre las tablas definidas en DDL y las entities TypeORM del backend. La auditoria identifico 18 gaps de cobertura (tablas sin entity y entities huerfanas sin tabla DDL), con schemas como social_features al 53% de cobertura. La meta es alcanzar al menos 95% de coherencia DB-Backend.

## Requerimiento Funcional

- **RF-ETC-003.1:** Crear entities TypeORM para tablas DDL sin representacion en backend: `gamification_system.achievement_categories`, `social_features.user_activities`, `social_features.user_follows`, y demas tablas identificadas en la auditoria.
- **RF-ETC-003.2:** Resolver entities huerfanas (`ContentVersion`, `MediaAttachment`, `TeacherReport`) creando las tablas DDL correspondientes o eliminando las entities si fueron deprecadas.
- **RF-ETC-003.3:** Completar la cobertura del schema `social_features` de 53% a minimo 95%, creando entities para todas las tablas operativas.
- **RF-ETC-003.4:** Validar que los campos de cada entity coincidan exactamente con las columnas de su tabla DDL (tipos de datos, nullability, defaults).

## Criterios de Aceptacion

- [ ] AC-001: Coherencia DB-Backend >= 98% (desde 89.8%)
- [ ] AC-002: Gaps reducidos de 18 a menos de 5
- [ ] AC-003: Schema social_features con cobertura >= 95%
- [ ] AC-004: Cero entities huerfanas sin tabla DDL correspondiente
- [ ] AC-005: Build del backend compila sin errores de tipos en entities

## Referencias

- **User Story:** HU-ETC-003 - Alineacion Entities-Tablas
- **EPIC:** ETC-001 - Consolidacion Tecnica y Validacion de Integracion
- **Inventario:** DATABASE_INVENTORY.yml, BACKEND_INVENTORY.yml
- **Dependencia:** EMR-001 Migracion BD completada
