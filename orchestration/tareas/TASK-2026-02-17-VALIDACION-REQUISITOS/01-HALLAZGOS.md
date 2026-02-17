# 01-HALLAZGOS: Validacion Integral de Requisitos, Documentacion y Configuracion

**Tarea:** TASK-2026-02-17-VALIDACION-REQUISITOS
**Fecha:** 2026-02-17
**Version:** 1.0.0
**Agentes:** 5 paralelos (A: Docs, B: Orchestration, C: Config, D: BD, E: Trazabilidad)
**Total hallazgos:** 41 (3 P0, 11 P1, 16 P2, 11 P3)
**Confirmados OK:** 35 items

---

## Resumen por Prioridad

| Prioridad | Cantidad | Descripcion |
|-----------|----------|-------------|
| **P0 - Critico** | 3 | Bloquean funcionamiento o init de BD |
| **P1 - Alto** | 11 | Gaps de requisitos, metricas desactualizadas en docs clave |
| **P2 - Medio** | 16 | Normalizacion, duplicados, limpieza de archivos |
| **P3 - Bajo** | 11 | Cosmeticos, comentarios, mejoras menores |

---

## P0 - CRITICOS (Bloquean Funcionamiento)

### H-ENV-01 | P0 | Puertos en ecosystem.config.js (4006/4005 en vez de 3006/3005)

**Agente:** C
**Descripcion:** PM2 config usa PORT=4006 (backend) y --port 4005 (frontend) en todas las variantes de env. Todos los demas archivos del proyecto (CLAUDE.md, .env, frontend config, deploy script, docs) usan 3006/3005. Cuando PM2 arranca, inyecta PORT=4006 sobreescribiendo .env.production.
**Archivos afectados:**
- `ecosystem.config.js` lineas 57, 61, 92
**Correccion:** Cambiar 4006→3006 (lineas 57, 61) y 4005→3005 (linea 92)
**Impacto:** Health check de deploy falla (curl a :3006 pero backend escucha en :4006), deploy hace rollback innecesario.

---

### H-DB-01 | P0 | Schema `auth` falta en execute_functions() de init-database.sh

**Agente:** D
**Descripcion:** El array de schemas en `execute_functions()` (lineas 695-710) NO incluye `auth`. La funcion `auth.uid()` definida en `schemas/auth/functions/01-uid.sql` nunca se crea durante init fresco. ~190 politicas RLS y ~24 triggers referencian `auth.uid()` — todas quedan rotas.
**Archivos afectados:**
- `apps/database/scripts/init-database.sh` lineas 695-710
- `apps/database/ddl/schemas/auth/functions/01-uid.sql`
**Correccion:** Agregar `"auth"` al array despues de `"gamilit"` (auth.uid() depende de gamilit.get_current_user_id())
**Impacto:** Init fresca de BD deja ~190 RLS policies y ~24 triggers en estado roto.

---

### H-ORC-01 | P0 | PROJECT-CONTEXT.md tiene 10+ metricas desactualizadas

**Agente:** B
**Descripcion:** PROJECT-CONTEXT.md v3.0.0 es contexto L1 cargado por cada agente. Referencia MASTER_INVENTORY v9.0.0 (actual: v10.0.0). Metricas inline incorrectas: RLS 207 (correcto: 227), endpoints 899 (901), services 170 (171), modules 22 (23), ENUMs 40 (42), componentes 474 (480), hooks 101 (102), API services 51 (52).
**Archivos afectados:**
- `orchestration/PROJECT-CONTEXT.md` lineas 96, 124, 127-133
**Correccion:** Actualizar todas las metricas inline y referenciar MASTER_INVENTORY v10.0.0.
**Impacto:** Todos los agentes reciben metricas incorrectas via L1 context.

---

## P1 - ALTA PRIORIDAD (Gaps de Requisitos y Docs Clave)

### H-DOC-01 | P1 | README.md de overview tiene 8+ metricas desactualizadas

**Agente:** A
**Descripcion:** `docs/00-overview/README.md` referencia MASTER_INVENTORY v7.0.0 (actual: v10.0.0). Multiples metricas incorrectas dispersas en ~15 lineas: modules 22→23, endpoints 899→901, RLS 207→227, services 170→171, components 475→480, ENUMs 40→42.
**Archivos afectados:** `docs/00-overview/README.md` (lineas 6, 75, 104, 112, 273, 285-321, 440, 515-521, 596)
**Correccion:** Actualizar todas las metricas. Cambiar refs a MASTER_INVENTORY v10.0.0.

### H-DOC-04 | P1 | Falta User Story para flujo de defaults (registro automatico)

**Agente:** A
**Descripcion:** Requisito clave del usuario: "1 institucion default, 1 salon default, 1 maestro default, 1 clase default; todos los alumnos se registran a esos defaults; admin redistribuye despues". Implementado en BD (trigger assign_default_classroom + seeds) pero NO documentado como User Story formal en `docs/10-requirements/`.
**Archivos afectados:**
- `docs/10-requirements/README.md` (falta US)
- `docs/10-requirements/epics/EPIC-GAM-F1-AUTH/requirements/RF-INIT-001-inicializacion-automatica-usuario.md` (scope gap — cubre 4 componentes pero no classroom assignment)
**Correccion:** Crear US-GAM-DEFAULTS-01 o extender RF-INIT-001 con 5to componente: assign_default_classroom().

### H-DOC-05 | P1 | Referencia rota: FLUJO-INICIALIZACION-USUARIO.md no existe

**Agente:** A
**Descripcion:** 3 archivos referencian `docs/80-references/transversal/arquitectura/FLUJO-INICIALIZACION-USUARIO.md` que nunca fue creado. El directorio `arquitectura/` no existe.
**Archivos afectados:**
- `docs/80-references/transversal/README.md` linea 49
- `docs/80-references/transversal/_MAP.md` linea 104
- `docs/10-requirements/epics/EPIC-GAM-F1-AUTH/requirements/RF-INIT-001-inicializacion-automatica-usuario.md` linea 433
**Correccion:** Crear el archivo documentando flujo completo de registro, o remover las 3 referencias rotas.

### H-DOC-07 | P1 | Contradiccion de puertos entre capas de documentacion

**Agente:** A
**Descripcion:** Docs de overview dicen "mismos puertos dev/prod: 3006/3005". Config operacional (ecosystem.config.js + PERFIL-DEPLOY) usa 4006/4005 internamente con Nginx proxy. Ademas, comentario en ecosystem.config.js linea 10 dice "2 instancias en cluster" pero config real es fork mode, 1 instancia.
**Archivos afectados:**
- `ecosystem.config.js` linea 10 (comentario incorrecto)
- `docs/20-architecture/AMBIENTES-DEV-PROD.md` (no documenta puertos internos)
- `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md` lineas 192, 204-205
**Correccion:** Despues de fix P0 (puertos→3006/3005), actualizar PERFIL-DEPLOY y AMBIENTES-DEV-PROD.

### H-ORC-02 | P1 | README overview: metricas desactualizadas (duplicado de H-DOC-01)

**Agente:** B (complementa A)
**Nota:** Mismos hallazgos que H-DOC-01 con lineas adicionales identificadas. Consolidado con H-DOC-01.

### H-ORC-03 | P1 | CONTEXT-MAP.yml metricas info_proyecto desactualizadas

**Agente:** B
**Descripcion:** Bloque `info_proyecto.metricas` (lineas 243-249) tiene: endpoints 899 (901), rls_policies 207 (227), funciones 249 (debe ser 183 DDL, no runtime sin label).
**Archivos afectados:** `orchestration/CONTEXT-MAP.yml` lineas 245-248
**Correccion:** Actualizar endpoints→901, rls→227, funciones→183 con nota "DDL source (249 runtime)".

### H-ORC-10 | P1 | Violacion DRY sistemica: metricas duplicadas en 6 archivos

**Agente:** B
**Descripcion:** Mismas metricas hardcodeadas en: CLAUDE.md (OK), MASTER_INVENTORY.yml (OK), PROJECT-CONTEXT.md (stale), docs/overview/README.md (stale), CONTEXT-MAP.yml (stale), MAPA-DOCUMENTACION.yml (severamente stale). Solo 2 de 6 correctos.
**Correccion:** Patron "fuente unica + punteros": MASTER_INVENTORY es SSOT, CLAUDE.md se mantiene sincronizado, los demas archivos referencian al SSOT en vez de duplicar numeros.

### H-ENV-03 | P1 | DB_HOST inconsistente entre backend y database .env

**Agente:** C
**Descripcion:** backend/.env usa DB_HOST=WSL2 IP (auto-updated); database/.env.* usan localhost. Scripts de DB que corren desde Windows fallan con ECONNRESET.
**Archivos afectados:** `apps/database/.env.database`, `apps/database/.env.dev`
**Correccion:** Documentar que scripts de BD DEBEN correr dentro de WSL, o tener update-wsl-ip.sh actualice tambien estos archivos.

### H-ENV-10 | P1 | Health check de deploy usa puerto equivocado

**Agente:** C
**Descripcion:** deploy-production.sh hace curl a :3006 pero PM2 arranca backend en :4006. Health check falla → rollback automatico de deploy funcional.
**Archivos afectados:** `apps/devops/scripts/deploy-production.sh` linea 427
**Correccion:** Se resuelve automaticamente con H-ENV-01 (fix puertos ecosystem.config.js).

### H-DB-02 | P1 | 16 funciones duplicadas en schema communication (tables/ y functions/)

**Agente:** D
**Descripcion:** 16 funciones definidas en archivos de tablas Y en directorio functions/. Riesgo de mantenimiento: editar una copia sin saber que la otra la sobreescribe.
**Archivos afectados:** 7 archivos SQL en `communication/tables/` y `communication/functions/`
**Correccion:** Remover definiciones inline de los 3 archivos de tablas; mantener solo las copias en functions/.

### H-DB-03 | P1 | 4 triggers duplicados en schema communication

**Agente:** D
**Descripcion:** Mismo patron que H-DB-02 pero con triggers: definidos inline en tables/ y en triggers/01-triggers.sql.
**Archivos afectados:** 3 archivos de tablas + `communication/triggers/01-triggers.sql`
**Correccion:** Remover triggers inline de archivos de tablas.

---

## P2 - MEDIA PRIORIDAD (Normalizacion y Limpieza)

### H-DOC-02 | P2 | MODULOS.md: modules 22→23, RLS 207→227

**Agente:** A
**Archivos:** `docs/00-overview/MODULOS.md` lineas 5, 65

### H-DOC-03 | P2 | VISION-ALCANCE.md: endpoints 899→901, modules 22→23

**Agente:** A
**Archivos:** `docs/10-requirements/VISION-ALCANCE.md` linea 21

### H-DOC-06 | P2 | Inconsistencia .env.prod vs .env.production en docs

**Agente:** A
**Archivos:** `docs/20-architecture/AMBIENTES-DEV-PROD.md` linea 86

### H-DOC-08 | P2 | Falta politica de no-duplicacion entre schemas

**Agente:** A
**Correccion:** Agregar seccion a MODELO-DATOS.md o COHERENCE-ENTITIES-DDL.md.

### H-DOC-09 | P2 | Default teacher/class no formalizados como requisitos

**Agente:** A
**Correccion:** Incluir en US-GAM-DEFAULTS-01 (junto con H-DOC-04).

### H-ORC-04 | P2 | MAPA-DOCUMENTACION.yml severamente desactualizado (~20 paths fantasma)

**Agente:** B
**Descripcion:** Estructura de directorios legacy (docs/00-vision-general/, orchestration/agentes/, etc.). Refs a workspace-v2. Metricas: 135 tablas (169), 612 endpoints (901).
**Archivos:** `orchestration/MAPA-DOCUMENTACION.yml`
**Correccion:** Eliminar archivo. Su proposito ya lo cumplen CONTEXT-MAP.yml y _INDEX.yml.

### H-ORC-05 | P2 | ALIASES.yml: conteo inflado y fuente canonica ambigua

**Agente:** B
**Archivos:** `orchestration/referencias/ALIASES.yml`, `orchestration/agents/ALIASES.yml`
**Correccion:** Reconciliar conteo real, designar una como canonica.

### H-ORC-06 | P2 | CONTEXT-MAP.yml referencia docs/_MAP.md que no existe

**Agente:** B
**Archivos:** `orchestration/CONTEXT-MAP.yml` linea 155

### H-ENV-04 | P2 | database/.env.dev tiene JWT_SECRET (no pertenece a BD)

**Agente:** C
**Archivos:** `apps/database/.env.dev` lineas 20-31

### H-ENV-05 | P2 | database .env files referencian workspace-v2 SSOT path

**Agente:** C
**Archivos:** `apps/database/.env.database` linea 7, `apps/database/.env.dev` linea 7

### H-ENV-06 | P2 | database .env.database y .env.dev son redundantes

**Agente:** C
**Correccion:** Determinar cual usan los scripts, eliminar el otro.

### H-ENV-08 | P2 | frontend/.env.example tiene vars Firebase obsoletas

**Agente:** C
**Archivos:** `apps/frontend/.env.example` lineas 44-54

### H-ENV-09 | P2 | frontend/.env.example tiene credenciales de test hardcodeadas

**Agente:** C
**Archivos:** `apps/frontend/.env.example` lineas 61-62

### H-DB-04 | P2 | gamilit.now_mexico() definida en 2 lugares (bootstrap intencional)

**Agente:** D
**Correccion:** Agregar comentario documentando el patron bootstrap.

### H-DB-05 | P2 | 21+ funciones inline en archivos de tablas sin ON_ERROR_STOP

**Agente:** D
**Correccion:** Extraer a functions/ o documentar en init-database.sh.

### H-TRZ-04 | P2 | Frontend multiplierMap hardcodeado diverge del SSOT de BD

**Agente:** E
**Descripcion:** Frontend muestra multiplicadores inflados (hasta 2.0x vs DB max 1.25x). Backend RankMetadataDto no expone xp_multiplier.
**Archivos:** `apps/frontend/src/features/gamification/ranks/hooks/useRanksConfig.ts`, `apps/backend/src/modules/gamification/controllers/ranks.controller.ts`
**Nota:** Requiere cambio de codigo (fuera de alcance docs/orchestration).

---

## P3 - BAJA PRIORIDAD (Mejoras y Cosmeticos)

### H-ENV-02 | P3 | Comentario en ecosystem.config.js dice "2 instancias cluster" (es fork mode x1)
### H-ENV-07 | P3 | Backend .env dual naming DB_DATABASE/DB_NAME (intencional)
### H-ORC-07 | P3 | principios/_INDEX.md version header 1.0.0 vs footer 1.1.0
### H-ORC-08 | P3 | triggers/_INDEX.md incluye phantoms en diagramas de flujo
### H-ORC-09 | P3 | TRIGGER-ANTI-DUPLICACION y PRINCIPIO refs a workspace-era catalog
### H-ORC-11 | P3 | MASTER_INVENTORY.yml features dice 22 modules (metricas dice 23)
### H-DOC-10 | P3 | TRACEABILITY cubre 7/18 schemas pero dice "100% cobertura"
### H-DOC-11 | P3 | Section heading modules 22 en README y CLAUDE.md
### H-DB-06 | P2→P3 | read -p bloquea sin --force (by design para safety)
### H-DB-07 | P2 | Phase 2 table batch sin ON_ERROR_STOP=1
### H-DB-08 | P3 | Seeds error detection usa grep fragil
### H-DB-09 | P3 | Seed file numbering collisions
### H-TRZ-02 | P3 | DDL ENUM maya_rank.sql comentarios con XP ranges pre-v2.1
### H-TRZ-03 | P3 | Backend MayaRank enum comentarios XP stale
### H-TRZ-06 | P3 | DDL ENUM exercise_type tiene 4 tipos deprecados sin marcar

---

## CONFIRMADOS OK (35 Items)

| # | Categoria | Descripcion |
|---|-----------|-------------|
| 1 | Docs | Proposito de plataforma documentado comprehensivamente |
| 2 | Docs | Defaults (institucion/salon/maestro) implementados correctamente en BD |
| 3 | Docs | Ambientes DEV/PROD documentados con tablas comparativas |
| 4 | Docs | Script recreacion BD existe, non-interactive con --force |
| 5 | Docs | Archivos .env bien documentados, .env.production.example comprehensivo |
| 6 | Docs | Aliases CLAUDE.md comprehensivos (30+) para navegacion de agentes |
| 7 | Docs | Design patterns, principios y best practices documentados |
| 8 | Docs | Deploy profile comprehensivo (11 pasos + rollback) |
| 9 | Docs | COHERENCE-ENTITIES-DDL.md existe y actualizado (v2.0.0) |
| 10 | Docs | TRACEABILITY-US-SCHEMAS.md existe (v1.0.0) |
| 11 | Docs | MODELO-DATOS.md RLS = 227 (correcto) |
| 12 | Docs | Schema reference documenta assign_default_classroom() |
| 13 | Docs | RF-INIT-001 thorough (455 lineas, 6 sub-requisitos) |
| 14 | Docs | Single tenant design decision documentada en seed |
| 15 | ORC | MASTER_INVENTORY.yml (v10.0.0) metricas principales correctas |
| 16 | ORC | CLAUDE.md metricas correctas y sincronizadas |
| 17 | ORC | CONTEXT-MAP.yml aliases (13 spot-checked) resuelven correctamente |
| 18 | ORC | CONTEXT-MAP.yml L2 paths SIMCO confirmados existentes |
| 19 | ORC | ALIASES.yml path targets (20+ verificados) existen |
| 20 | ORC | PRINCIPIO-ANTI-DUPLICACION.md bien estructurado |
| 21 | ORC | PRINCIPIO-DRY.md comprehensivo (722 lineas) |
| 22 | ORC | TRIGGER-ANTI-DUPLICACION.md existe con 4-step flow |
| 23 | ORC | TRIGGER-COHERENCIA-CAPAS.md existe con coherence matrix |
| 24 | ENV | env.validation.ts type annotations correctas |
| 25 | ENV | database.config.ts localhost warning implementado |
| 26 | ENV | update-wsl-ip.sh funciona correctamente |
| 27 | ENV | Backend port resolution chain limpia (3006 default) |
| 28 | ENV | Frontend API URL construction correcta |
| 29 | ENV | Deploy script estructura correcta (7 pasos + rollback) |
| 30 | ENV | CORS defaults consistentes |
| 31 | ENV | .env.production.example comprehensivo (47 vars) |
| 32 | DB | sudo -S -v usage WSL-safe |
| 33 | DB | --force flag para modo non-interactive |
| 34 | DB | DDL runs como postgres superuser |
| 35 | DB | grant_all_permissions() posicionado despues de DDL |
| 36 | DB | .TEST.sql exclusion implementada |
| 37 | DB | assign_default_classroom bien definido y wired |
| 38 | DB | recreate-database.sh es wrapper funcional |
| 39 | DB | 00-prerequisites.sql estructura verificada |
| 40 | DB | Seed ordering respeta FK dependencies |
| 41 | DB | No trigger names duplicados cross-schema |
| 42 | TRZ | Registration flow trazado end-to-end completo |
| 43 | TRZ | XP→Rank calculation flow completamente trazado |
| 44 | TRZ | 7 exercise DDL tables tienen entities correspondientes |
| 45 | TRZ | Entity count verificado: 153 @Entity en 152 files |
| 46 | TRZ | 16 data_warehouse tables DDL-only documentados |
| 47 | TRZ | 3 schemas sin tablas (utility-only) correctos |
