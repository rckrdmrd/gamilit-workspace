# 01-ANALISIS.md - Mejoras de Calidad de Codigo

**Tarea:** TASK-2026-02-17-MEJORAS-CALIDAD-CODIGO
**Fecha:** 2026-02-17
**Version:** 1.0.0
**Sistema:** SIMCO v4.0.0

---

## 1. Gaps de Calidad Identificados

| ID | Prioridad | Gap | Descripcion | Standard Aplicable |
|----|-----------|-----|-------------|-------------------|
| MQ-001 | P0 | Contradiccion test coverage | jest.config.js=50% vs CLAUDE.md=80% — valor oficial contradictorio entre configuracion real y documentacion de gobernanza | ESTANDAR-TESTING + jest.config.js |
| MQ-002 | P1 | Sin jerarquia de errores de dominio | Backend usa excepciones NestJS genericas (HttpException, NotFoundException, etc.), sin errores de dominio custom que permitan distinguir logica de negocio de errores de infraestructura | backend-profesional/05-manejo-errores.md |
| MQ-003 | P1 | 4 skills P1 sin crear | simco-git-workflow, simco-ddl-management, simco-validation-coherence, simco-agent-delegation — definidos en ESTANDAR-SKILLS como P1 pero no implementados | ESTANDAR-SKILLS.md Section 3.2 |
| MQ-004 | P1 | Tareas no vinculadas a EPICs | Tareas en orchestration/tareas/ sin referencia formal a EPICs del backlog — rompe trazabilidad vertical | ESTANDAR-DOCUMENTACION |
| MQ-005 | P2 | Sin Repository pattern | Servicios acceden directamente a TypeORM repos (@InjectRepository) sin capa de abstraccion, acoplando logica de negocio a ORM | backend-profesional/03-repository-pattern.md |
| MQ-006 | P2 | Clean Architecture no aplicada | No existe ADR que documente la decision de adopcion pragmatica de Clean Architecture ni que justifique desviaciones | PRINCIPIO-CLEAN-ARCHITECTURE |
| MQ-007 | P2 | 911 warnings no-explicit-any | TypeScript `any` types distribuidos en todo el backend — reduce type safety y dificulta refactoring | ESTANDAR-CODIGO |
| MQ-008 | P2 | Sin skill simco-apply-backend-standard | No existe skill especifico para aplicar estandares backend de forma automatizada por agentes | ESTANDAR-SKILLS.md |
| MQ-009 | P2 | Divergencia XP multiplierMap FE vs SSOT | Frontend tiene valores de multiplicadores XP hardcodeados que pueden divergir de la configuracion backend/BD | PRINCIPIO-VALIDACION-OBLIGATORIA |
| MQ-010 | P3 | Sin Value Objects en modulos criticos | Se usan tipos primitivos (string, number) donde deberian existir Value Objects de dominio (XP, MLCoins, TenantId, UserId) | backend-profesional/04-domain-driven-design.md |

---

## 2. Correcciones Tecnicas Pendientes

| ID | Prioridad | Descripcion | Estado | Dependencias |
|----|-----------|-------------|--------|-------------|
| CORR-01 | P0 | env.validation.ts types — validacion de tipos en variables de entorno | COMPLETADO | Ninguna |
| CORR-02 | P0 | lint no-case-declarations — fix de warnings en switch statements | COMPLETADO | Ninguna |
| CORR-03 | P1 | DDL cascade errors — trigger 28 referencia tabla incorrecta (gamification_system.user_comodines vs nombre real), orden de ejecucion de funciones genera dependencias rotas, seed de tenants depende de objetos no creados aun | Pendiente | Ninguna |
| CORR-04 | P1 | RLS deficit 195 vs 227 — 32 politicas RLS definidas en DDL no se aplican correctamente durante init-database.sh, resultado runtime muestra 195 en vez de 227 | Pendiente | CORR-03 |
| CORR-05 | P2 | 30 seed errors — scripts de seed fallan por dependencias de FK, orden de insercion incorrecto, y tablas/columnas renombradas sin actualizar seeds | Pendiente | CORR-03, CORR-04 |

---

## 3. Analisis de Impacto

### MQ-001 (P0) — Contradiccion Test Coverage
- **Impacto:** Gobernanza contradictoria genera confusion en agentes y desarrolladores
- **Riesgo:** Medio — no afecta funcionalidad, pero afecta confianza en documentacion
- **Resolucion propuesta:** Alinear CLAUDE.md al valor real (50%) o subir jest.config.js a 80% con plan gradual

### MQ-002 (P1) — Error Hierarchy
- **Impacto:** Errores de dominio indistinguibles de errores de framework
- **Riesgo:** Alto en mantenimiento a largo plazo
- **Archivos afectados:** ~171 services

### MQ-003 (P1) — Skills Faltantes
- **Impacto:** Agentes no tienen workflows automatizados para operaciones criticas
- **Riesgo:** Medio — operaciones manuales propensas a error

### CORR-03 (P1) — DDL Cascade Errors
- **Impacto:** Base de datos no puede recrearse limpiamente desde DDL
- **Riesgo:** Alto — bloquea CORR-04 y CORR-05, afecta deployments

### CORR-04 (P1) — RLS Deficit
- **Impacto:** 32 politicas de seguridad no aplicadas = datos potencialmente accesibles sin autorizacion
- **Riesgo:** Critico en produccion si las tablas afectadas contienen datos sensibles

---

## 4. Evidencia

- jest.config.js: `coverageThreshold.global.branches = 50`
- CLAUDE.md: "Minimo 80% test coverage objetivo"
- Backend lint: `npm run lint` reporta 911 warnings de `@typescript-eslint/no-explicit-any`
- init-database.sh: Ejecucion limpia reporta 195 RLS policies vs 227 en DDL source
- Seed errors: 30 errores en log de `recreate-database.sh`

---

*Generado por: Claude Code | Fecha: 2026-02-17*
