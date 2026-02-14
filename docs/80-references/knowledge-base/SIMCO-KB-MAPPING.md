---
titulo: Mapeo SIMCO -> Knowledge Base -> Estandares -> Guias
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [knowledge-base, simco, navegacion]
estado: vigente
---

# Mapeo SIMCO -> Knowledge Base

## Proposito

Este documento mapea cada directiva SIMCO relevante a los estandares, guias y recursos
correspondientes en la documentacion de gamilit. Permite a los agentes encontrar rapidamente
la documentacion apropiada para cada tipo de operacion.

---

## Mapeo por Dominio

### Backend (NestJS)

| Directiva SIMCO | Estandar | Guias Relacionadas |
|-----------------|----------|-------------------|
| SIMCO-BACKEND.md | ESTANDAR-BACKEND-PROFESIONAL.md | backend-profesional/ (8 modulos) |
| SIMCO-BACKEND.md | ESTANDAR-SEGURIDAD.md | GUIA-ROTACION-SECRETOS.md |
| SIMCO-BACKEND.md | ESTANDAR-OBSERVABILIDAD.md | GUIA-OPENTELEMETRY-NESTJS.md |
| SIMCO-CREAR.md | ESTANDAR-CODIGO.md | GUIA-DEPENDENCY-RULES.md, GUIA-DESIGN-PATTERNS-NESTJS.md |
| SIMCO-VALIDAR.md | ESTANDAR-TESTING.md | GUIA-COVERAGE-TESTING.md, GUIA-ARCHITECTURE-TESTING.md, GUIA-E2E-PLAYWRIGHT.md |

### Database (PostgreSQL)

| Directiva SIMCO | Estandar | Guias Relacionadas |
|-----------------|----------|-------------------|
| SIMCO-DDL.md | ESTANDAR-DATABASE-PROFESIONAL.md | GUIA-RUNBOOK-POSTGRESQL.md, GUIA-EXPAND-CONTRACT-MIGRATIONS.md |
| SIMCO-MIGRACIONES-BD.md | ESTANDAR-DATABASE-PROFESIONAL.md | GUIA-PIPELINE-MIGRACIONES.md, GUIA-CREAR-BASE-DATOS.md |
| SIMCO-SINCRONIZACION-BD.md | -- | GUIA-EXPAND-CONTRACT-MIGRATIONS.md |

### Frontend (React)

| Directiva SIMCO | Estandar | Guias Relacionadas |
|-----------------|----------|-------------------|
| SIMCO-FRONTEND.md | ESTANDAR-FRONTEND-PROFESIONAL.md | GUIA-WCAG-ACCESSIBILITY.md |
| SIMCO-VALIDAR.md | ESTANDAR-TESTING.md | GUIA-E2E-PLAYWRIGHT.md |

### DevOps / Deployment

| Directiva SIMCO | Estandar | Guias Relacionadas |
|-----------------|----------|-------------------|
| SIMCO-GIT.md | ESTANDAR-GIT.md | GUIA-GITHUB-ACTIONS-CICD.md |
| -- | ESTANDAR-12-FACTOR-APP.md | GUIA-DOCKER-MULTISTAGE.md |
| -- | -- | GUIA-PIPELINE-MIGRACIONES.md, PERFIL-DEPLOY-SERVER.md |

### Seguridad

| Directiva SIMCO | Estandar | Guias/Politicas Relacionadas |
|-----------------|----------|----------------------------|
| SIMCO-BACKEND.md (sec) | ESTANDAR-SEGURIDAD.md | POLITICA-SUPPLY-CHAIN.md, GUIA-ROTACION-SECRETOS.md |
| -- | -- | CHECKLIST-SECURITY-SUPPLY-CHAIN.md |

---

## Ruta de Implementacion

### Para crear un modulo nuevo completo

Seguir esta secuencia:

1. Leer `SIMCO-BACKEND.md` -- entender el proceso
2. Consultar `ESTANDAR-BACKEND-PROFESIONAL.md` -- ver patrones
3. Verificar `02-clean-architecture.md` -- mapeo hexagonal
4. Aplicar `GUIA-DEPENDENCY-RULES.md` -- import boundaries
5. Usar `GUIA-DESIGN-PATTERNS-NESTJS.md` -- patrones GoF
6. Validar con `ESTANDAR-TESTING.md` + `GUIA-ARCHITECTURE-TESTING.md`
7. Documentar con `SIMCO-DOCUMENTAR.md`
8. Verificar seguridad con `ESTANDAR-SEGURIDAD.md` (OWASP API 2023)

### Para deploy a produccion

1. Verificar `CHECKLIST-SECURITY-SUPPLY-CHAIN.md`
2. Seguir `GUIA-PIPELINE-MIGRACIONES.md` (si hay DDL changes)
3. Ejecutar workflow de `PERFIL-DEPLOY-SERVER.md`
4. Validar `ESTANDAR-12-FACTOR-APP.md` compliance

### Para migraciones de base de datos

1. Leer `SIMCO-DDL.md` -- proceso de modificacion DDL
2. Consultar `ESTANDAR-DATABASE-PROFESIONAL.md` -- convenciones
3. Aplicar `GUIA-EXPAND-CONTRACT-MIGRATIONS.md` -- patron expand/contract
4. Ejecutar `GUIA-PIPELINE-MIGRACIONES.md` -- pipeline automatizado
5. Verificar con `GUIA-RUNBOOK-POSTGRESQL.md` -- operaciones de BD

### Para testing y calidad

1. Revisar `ESTANDAR-TESTING.md` -- piramide 70-20-10
2. Aplicar `GUIA-COVERAGE-TESTING.md` -- cobertura minima 80%
3. Implementar `GUIA-ARCHITECTURE-TESTING.md` -- tests de arquitectura
4. Configurar `GUIA-E2E-PLAYWRIGHT.md` -- tests end-to-end
5. Validar `TRIGGER-QUALITY-GATE.md` -- gate de calidad automatico

---

## Indice de Rutas por Archivo

| Archivo | Ruta Completa |
|---------|---------------|
| SIMCO-BACKEND.md | orchestration/directivas/simco/SIMCO-BACKEND.md |
| SIMCO-FRONTEND.md | orchestration/directivas/simco/SIMCO-FRONTEND.md |
| SIMCO-DDL.md | orchestration/directivas/simco/SIMCO-DDL.md |
| SIMCO-CREAR.md | orchestration/directivas/simco/SIMCO-CREAR.md |
| SIMCO-VALIDAR.md | orchestration/directivas/simco/SIMCO-VALIDAR.md |
| SIMCO-GIT.md | orchestration/directivas/simco/SIMCO-GIT.md |
| SIMCO-DOCUMENTAR.md | orchestration/directivas/simco/SIMCO-DOCUMENTAR.md |
| SIMCO-MIGRACIONES-BD.md | orchestration/directivas/simco/SIMCO-MIGRACIONES-BD.md |
| SIMCO-SINCRONIZACION-BD.md | orchestration/directivas/simco/SIMCO-SINCRONIZACION-BD.md |
| ESTANDAR-BACKEND-PROFESIONAL.md | docs/40-standards/ESTANDAR-BACKEND-PROFESIONAL.md |
| ESTANDAR-SEGURIDAD.md | docs/40-standards/ESTANDAR-SEGURIDAD.md |
| ESTANDAR-OBSERVABILIDAD.md | docs/40-standards/ESTANDAR-OBSERVABILIDAD.md |
| ESTANDAR-TESTING.md | docs/40-standards/ESTANDAR-TESTING.md |
| ESTANDAR-12-FACTOR-APP.md | docs/40-standards/ESTANDAR-12-FACTOR-APP.md |
| ESTANDAR-CODIGO.md | docs/40-standards/ESTANDAR-CODIGO.md |
| ESTANDAR-DATABASE-PROFESIONAL.md | docs/40-standards/ESTANDAR-DATABASE-PROFESIONAL.md |
| ESTANDAR-FRONTEND-PROFESIONAL.md | docs/40-standards/ESTANDAR-FRONTEND-PROFESIONAL.md |
| ESTANDAR-GIT.md | docs/40-standards/ESTANDAR-GIT.md |
| GUIA-ROTACION-SECRETOS.md | docs/50-guides/backend/GUIA-ROTACION-SECRETOS.md |
| GUIA-DEPENDENCY-RULES.md | docs/50-guides/backend/GUIA-DEPENDENCY-RULES.md |
| GUIA-DESIGN-PATTERNS-NESTJS.md | docs/50-guides/backend/GUIA-DESIGN-PATTERNS-NESTJS.md |
| GUIA-RUNBOOK-POSTGRESQL.md | docs/50-guides/backend/GUIA-RUNBOOK-POSTGRESQL.md |
| GUIA-OPENTELEMETRY-NESTJS.md | docs/50-guides/backend/GUIA-OPENTELEMETRY-NESTJS.md |
| GUIA-EXPAND-CONTRACT-MIGRATIONS.md | docs/50-guides/backend/GUIA-EXPAND-CONTRACT-MIGRATIONS.md |
| GUIA-CREAR-BASE-DATOS.md | docs/50-guides/backend/GUIA-CREAR-BASE-DATOS.md |
| GUIA-COVERAGE-TESTING.md | docs/50-guides/testing/GUIA-COVERAGE-TESTING.md |
| GUIA-ARCHITECTURE-TESTING.md | docs/50-guides/testing/GUIA-ARCHITECTURE-TESTING.md |
| GUIA-E2E-PLAYWRIGHT.md | docs/50-guides/testing/GUIA-E2E-PLAYWRIGHT.md |
| GUIA-GITHUB-ACTIONS-CICD.md | docs/50-guides/deployment/GUIA-GITHUB-ACTIONS-CICD.md |
| GUIA-DOCKER-MULTISTAGE.md | docs/50-guides/deployment/GUIA-DOCKER-MULTISTAGE.md |
| GUIA-PIPELINE-MIGRACIONES.md | docs/50-guides/deployment/GUIA-PIPELINE-MIGRACIONES.md |
| GUIA-WCAG-ACCESSIBILITY.md | docs/50-guides/frontend/GUIA-WCAG-ACCESSIBILITY.md |
| POLITICA-SUPPLY-CHAIN.md | orchestration/directivas/politicas/POLITICA-SUPPLY-CHAIN.md |
| CHECKLIST-SECURITY-SUPPLY-CHAIN.md | orchestration/_definitions/checklists/CHECKLIST-SECURITY-SUPPLY-CHAIN.md |
| TRIGGER-QUALITY-GATE.md | orchestration/directivas/triggers/TRIGGER-QUALITY-GATE.md |
| PERFIL-DEPLOY-SERVER.md | orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md |

---

*Ultima actualizacion: 2026-02-14*
