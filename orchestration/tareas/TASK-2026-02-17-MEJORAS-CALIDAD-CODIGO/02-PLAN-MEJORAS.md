# 02-PLAN-MEJORAS.md - Plan de Ejecucion Priorizado

**Tarea:** TASK-2026-02-17-MEJORAS-CALIDAD-CODIGO
**Fecha:** 2026-02-17
**Version:** 1.0.0
**Sistema:** SIMCO v4.0.0

---

## Resumen de Fases

| Fase | Prioridad | Periodo | Items | Esfuerzo Total |
|------|-----------|---------|-------|----------------|
| A | P0 | Inmediato (1-2 dias) | MQ-001 | S |
| B | P1 | 1-2 semanas | MQ-002, MQ-003, MQ-004, CORR-03, CORR-04 | XL |
| C | P2 | 2-4 semanas | MQ-005, MQ-006, MQ-007, MQ-008, MQ-009, CORR-05 | XL |
| D | P3 | Backlog | MQ-010 | L |

---

## Fase A: P0 — Inmediato (1-2 dias)

### MQ-001: Resolver contradiccion test coverage

- **Esfuerzo:** S (Small, 1-2 horas)
- **Dependencias:** Ninguna
- **Responsable:** Cualquier agente
- **Descripcion:**
  Alinear el valor de coverage entre jest.config.js y CLAUDE.md. Dos opciones:
  1. **Opcion A (recomendada):** Actualizar CLAUDE.md a "50% actual, objetivo 80%" y crear ADR documentando plan gradual de incremento
  2. **Opcion B:** Subir jest.config.js a 80% (rompera CI hasta alcanzar coverage)
- **Acceptance Criteria:**
  - [ ] jest.config.js y CLAUDE.md reflejan el mismo valor o documentan explicitamente la brecha con plan
  - [ ] Si se elige Opcion A, ADR creado (ADR-042-test-coverage-strategy.md)
  - [ ] MEMORY.md actualizado con decision

---

## Fase B: P1 — 1-2 semanas

### MQ-002: Crear jerarquia de errores de dominio

- **Esfuerzo:** L (Large, 3-5 dias)
- **Dependencias:** Ninguna
- **Responsable:** @PERFIL-BACKEND-NESTJS
- **Descripcion:**
  Crear estructura de errores de dominio en `apps/backend/src/common/errors/`:
  - `domain-error.base.ts` — clase base abstracta
  - `not-found.error.ts` — recurso no encontrado (dominio)
  - `business-rule.error.ts` — violacion de regla de negocio
  - `authorization.error.ts` — error de autorizacion de dominio
  - `validation.error.ts` — error de validacion de dominio
  - `domain-error.filter.ts` — filtro NestJS que mapea errores de dominio a HTTP
- **Acceptance Criteria:**
  - [ ] Jerarquia de errores creada con tests unitarios
  - [ ] DomainErrorFilter registrado globalmente
  - [ ] Al menos 3 servicios migrados como ejemplo
  - [ ] Documentacion en backend-profesional/05-manejo-errores.md actualizada
  - [ ] Build y tests pasan

### MQ-003: Crear 4 skills P1 faltantes

- **Esfuerzo:** M (Medium, 2-3 dias)
- **Dependencias:** Ninguna
- **Responsable:** @PERFIL-ORQUESTADOR
- **Descripcion:**
  Crear en `orchestration/skills/`:
  1. `simco-git-workflow.md` — workflow estandar de git para monorepo
  2. `simco-ddl-management.md` — gestion de cambios DDL con validacion
  3. `simco-validation-coherence.md` — validacion de coherencia entre capas
  4. `simco-agent-delegation.md` — protocolo de delegacion entre agentes
- **Acceptance Criteria:**
  - [ ] 4 archivos de skill creados siguiendo ESTANDAR-SKILLS.md
  - [ ] Cada skill tiene: proposito, triggers, pasos, validacion, ejemplo
  - [ ] SKILLS-REGISTRY.yml actualizado
  - [ ] Referenciados desde perfiles de agente correspondientes

### MQ-004: Vincular tareas a EPICs

- **Esfuerzo:** M (Medium, 2-3 dias)
- **Dependencias:** Ninguna
- **Responsable:** @PERFIL-ORQUESTADOR
- **Descripcion:**
  Agregar campo `epic_ref` a cada tarea en orchestration/tareas/ y crear indice de trazabilidad.
  Revisar las 15+ tareas existentes y asignar EPIC correspondiente.
- **Acceptance Criteria:**
  - [ ] Todas las tareas en orchestration/tareas/ tienen referencia a EPIC
  - [ ] Indice de trazabilidad creado (tareas/_INDEX.yml actualizado)
  - [ ] BACKLOG.yml refleja las tareas asociadas

### CORR-03: Corregir errores DDL cascade

- **Esfuerzo:** L (Large, 3-5 dias)
- **Dependencias:** Ninguna
- **Responsable:** @PERFIL-DATABASE-POSTGRESQL
- **Descripcion:**
  Corregir 3 problemas en DDL:
  1. Trigger 28 (trg_update_missions_on_use_comodines) — referencia a tabla incorrecta
  2. Orden de ejecucion de funciones — dependencias circulares o forward references
  3. Seed de tenants — depende de objetos creados en fases posteriores del init
- **Acceptance Criteria:**
  - [ ] `bash apps/database/scripts/recreate-database.sh` ejecuta sin errores de DDL
  - [ ] Trigger 28 referencia tabla correcta
  - [ ] Funciones se crean en orden correcto
  - [ ] Seed de tenants funciona en init limpio

### CORR-04: Resolver deficit RLS (195 vs 227)

- **Esfuerzo:** M (Medium, 2-3 dias)
- **Dependencias:** CORR-03
- **Responsable:** @PERFIL-DATABASE-POSTGRESQL
- **Descripcion:**
  Identificar las 32 politicas RLS que no se aplican durante init y corregir.
  Puede ser por: tablas no creadas cuando se aplica RLS, errores silenciosos en script, o politicas condicionales.
- **Acceptance Criteria:**
  - [ ] `SELECT count(*) FROM pg_policies` retorna 227 post-init
  - [ ] Todas las politicas se aplican sin error
  - [ ] Log de init muestra 0 errores en fase RLS

---

## Fase C: P2 — 2-4 semanas

### MQ-005: Evaluar e implementar Repository pattern

- **Esfuerzo:** XL (Extra Large, 5+ dias)
- **Dependencias:** MQ-006 (decision arquitectonica primero)
- **Responsable:** @PERFIL-BACKEND-NESTJS
- **Descripcion:**
  Evaluar si Repository pattern justifica su complejidad adicional dado el estado del proyecto (MVP 98%).
  Si se aprueba: implementar en 3 modulos piloto (auth, gamification, educational).
  Crear ADR con decision.
- **Acceptance Criteria:**
  - [ ] ADR creado con decision (adoptar/rechazar/posponer)
  - [ ] Si se adopta: patron implementado en 3 modulos piloto
  - [ ] Si se rechaza: documentar justificacion pragmatica

### MQ-006: ADR de Clean Architecture pragmatica

- **Esfuerzo:** S (Small, 1-2 horas)
- **Dependencias:** Ninguna
- **Responsable:** @PERFIL-ORQUESTADOR
- **Descripcion:**
  Crear ADR-043 que documente la decision de adopcion pragmatica de Clean Architecture,
  justificando las desviaciones actuales y estableciendo que patrones se adoptan y cuales no.
- **Acceptance Criteria:**
  - [ ] ADR-043-clean-architecture-pragmatica.md creado
  - [ ] Documenta que se adopta y que no
  - [ ] Referenciado desde CLAUDE.md o docs/90-adr/README.md

### MQ-007: Reducir warnings no-explicit-any

- **Esfuerzo:** XL (Extra Large, 5+ dias, puede ser incremental)
- **Dependencias:** Ninguna
- **Responsable:** @PERFIL-BACKEND-NESTJS
- **Descripcion:**
  Reducir los 911 warnings de `@typescript-eslint/no-explicit-any` de forma incremental:
  1. Categorizar por modulo (cuantos por modulo)
  2. Priorizar modulos criticos (auth, gamification, educational)
  3. Reemplazar `any` por tipos correctos
  Meta: reducir a <200 en Fase C, <50 en Fase D.
- **Acceptance Criteria:**
  - [ ] Warnings reducidos a <200
  - [ ] Modulos auth, gamification, educational con 0 any
  - [ ] Script de tracking creado para monitorear regresiones

### MQ-008: Crear skill simco-apply-backend-standard

- **Esfuerzo:** S (Small, 2-3 horas)
- **Dependencias:** MQ-003 (patron de skills establecido)
- **Responsable:** @PERFIL-ORQUESTADOR
- **Descripcion:**
  Crear skill que automatice la aplicacion de estandares backend a un modulo dado.
- **Acceptance Criteria:**
  - [ ] Skill creado en orchestration/skills/
  - [ ] SKILLS-REGISTRY.yml actualizado
  - [ ] Probado en al menos 1 modulo

### MQ-009: Sincronizar XP multiplierMap FE con SSOT

- **Esfuerzo:** M (Medium, 1-2 dias)
- **Dependencias:** Ninguna
- **Responsable:** @PERFIL-FRONTEND-REACT
- **Descripcion:**
  Reemplazar valores hardcodeados de multiplicadores XP en frontend por valores obtenidos
  del backend via API o configuracion compartida.
- **Acceptance Criteria:**
  - [ ] Frontend obtiene multiplicadores de backend/config
  - [ ] No hay valores XP hardcodeados en frontend
  - [ ] Test que valide sincronizacion

### CORR-05: Corregir 30 seed errors

- **Esfuerzo:** L (Large, 3-5 dias)
- **Dependencias:** CORR-03, CORR-04
- **Responsable:** @PERFIL-DATABASE-POSTGRESQL
- **Descripcion:**
  Corregir los 30 errores en scripts de seed que fallan por FK violations,
  orden incorrecto, y columnas/tablas renombradas.
- **Acceptance Criteria:**
  - [ ] `recreate-database.sh` ejecuta seeds sin errores
  - [ ] Datos de seed verificables via queries
  - [ ] Log limpio post-ejecucion

---

## Fase D: P3 — Backlog

### MQ-010: Value Objects en modulos criticos

- **Esfuerzo:** L (Large, 3-5 dias)
- **Dependencias:** MQ-005, MQ-006 (decisiones arquitectonicas)
- **Responsable:** @PERFIL-BACKEND-NESTJS
- **Descripcion:**
  Introducir Value Objects para conceptos de dominio criticos:
  - `XP` — puntos de experiencia (non-negative integer)
  - `MLCoins` — moneda virtual (non-negative decimal)
  - `TenantId` — identificador de tenant (UUID validated)
  - `UserId` — identificador de usuario (UUID validated)
  Implementar en modulos gamification y auth como piloto.
- **Acceptance Criteria:**
  - [ ] Value Objects creados con validacion en constructor
  - [ ] Al menos 2 modulos migrados
  - [ ] Tests unitarios para cada Value Object
  - [ ] ADR documenta patron adoptado

---

## Diagrama de Dependencias

```
MQ-001 (P0) -----> Independiente

MQ-002 (P1) -----> Independiente
MQ-003 (P1) -----> Independiente
MQ-004 (P1) -----> Independiente
CORR-03 (P1) ----> Independiente
CORR-04 (P1) ----> CORR-03

MQ-005 (P2) -----> MQ-006
MQ-006 (P2) -----> Independiente
MQ-007 (P2) -----> Independiente
MQ-008 (P2) -----> MQ-003
MQ-009 (P2) -----> Independiente
CORR-05 (P2) ----> CORR-03, CORR-04

MQ-010 (P3) -----> MQ-005, MQ-006
```

---

*Generado por: Claude Code | Fecha: 2026-02-17*
