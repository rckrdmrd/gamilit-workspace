---
id: US-PP-001
title: Data Model & Relations
epic: EXT-011
status: Done
story_points: 7
priority: P3
created: 2025-11-20
updated: 2026-01-04
---

# US-PP-001: Data Model & Relations

## Historia de Usuario

**Como** arquitecto de datos
**Quiero** definir el modelo de datos para padres de familia
**Para** soportar la relacion padre-estudiante en el sistema

## Criterios de Aceptacion

- [x] Tabla parent_accounts creada con campos necesarios
- [x] Tabla parent_student_links para relacion N:M
- [x] Entities NestJS creadas
- [x] Migracion aplicada en BD

## Implementacion

### Tablas Creadas

**parent_accounts:**
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- full_name (VARCHAR)
- phone (VARCHAR, nullable)
- created_at, updated_at

**parent_student_links:**
- id (UUID, PK)
- parent_id (FK -> parent_accounts)
- student_id (FK -> student_accounts)
- relationship (ENUM: 'father', 'mother', 'guardian')
- verified (BOOLEAN)
- created_at

## Trazabilidad

- DDL: `apps/database/ddl/schemas/auth/tables/parent_accounts.sql`
- DDL: `apps/database/ddl/schemas/auth/tables/parent_student_links.sql`
- Entity: `apps/backend/src/auth/entities/parent-account.entity.ts`

---

**Estado:** Done
