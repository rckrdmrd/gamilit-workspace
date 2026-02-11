---
id: "US-VAL-001"
title: "Environment Setup"
type: "User Story"
status: "Pendiente"
priority: "Alta"
epic: "EPIC-GAM-F4-VALIDATION"
story_points: 8
sprint: "Sprint-15"
created_date: "2026-02-10"
updated_date: "2026-02-10"
---

# US-VAL-001: Environment Setup

**Epica:** EPIC-GAM-F4-VALIDATION — Validacion Integral
**Sprint:** Sprint 15 | **SP:** 8 | **Prioridad:** Alta | **Estado:** Pendiente

---

## Descripcion

**Como** QA engineer
**Quiero** verificar que el entorno de desarrollo (WSL, PostgreSQL, Redis, npm builds) funciona correctamente
**Para** tener una base confiable sobre la cual ejecutar las validaciones de integracion

## Criterios de Aceptacion

### CA-01: Servicios Infraestructura
**Dado** que WSL Ubuntu-24.04 esta instalado
**Cuando** inicio los servicios
**Entonces** PostgreSQL responde en puerto 5432 y Redis en puerto 6379

### CA-02: Base de Datos
**Dado** que los DDL estan actualizados (post-auditoria F5)
**Cuando** ejecuto unified-recreate-db.sh gamilit --drop
**Entonces** se crean 18 schemas y 171 tablas sin errores

### CA-03: Seeds
**Dado** que la BD esta recreada
**Cuando** se ejecutan los seeds (fase 16.0-16.9 de create-database.sh)
**Entonces** los datos dev se cargan correctamente (auth, gamification, educational)

### CA-04: Backend Build
**Dado** que las dependencias estan instaladas
**Cuando** ejecuto npm run build en apps/backend
**Entonces** la compilacion TypeScript es exitosa con 0 errores

### CA-05: Frontend Build
**Dado** que las dependencias estan instaladas
**Cuando** ejecuto npm run build en apps/frontend
**Entonces** el build Vite es exitoso con 0 errores

## Tasks

| Task | Titulo | Capa |
|------|--------|------|
| [TASK-VAL-001-F0-INFRA](TASK-VAL-001-F0-INFRA/) | Verificar WSL + PostgreSQL + Redis | Infra |
| [TASK-VAL-001-F0-DATABASE](TASK-VAL-001-F0-DATABASE/) | Recrear BD gamilit | Database |
| [TASK-VAL-001-F0-DATABASE-SEEDS](TASK-VAL-001-F0-DATABASE-SEEDS/) | Verificar seeds dev | Database |
| [TASK-VAL-001-F0-BACKEND](TASK-VAL-001-F0-BACKEND/) | Build backend | Backend |
| [TASK-VAL-001-F0-FRONTEND](TASK-VAL-001-F0-FRONTEND/) | Build frontend | Frontend |

---

*Actualizado: 2026-02-10*
