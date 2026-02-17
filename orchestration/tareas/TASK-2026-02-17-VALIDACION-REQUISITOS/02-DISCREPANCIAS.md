# 02-DISCREPANCIAS: Tabla de Discrepancias entre Fuentes

**Tarea:** TASK-2026-02-17-VALIDACION-REQUISITOS
**Fecha:** 2026-02-17
**Version:** 1.0.0

---

## 1. Discrepancias de Metricas entre Archivos

SSOT: `orchestration/inventarios/MASTER_INVENTORY.yml` v10.0.0

| Metrica | MASTER_INV (SSOT) | CLAUDE.md | PROJECT-CONTEXT | overview/README | CONTEXT-MAP | MAPA-DOC |
|---------|:-----------------:|:---------:|:---------------:|:---------------:|:-----------:|:--------:|
| Modules | **23** | 23 | ~~22~~ | ~~22~~ | -- | ~~17~~ |
| Endpoints | **901** | 901 | ~~899~~ | ~~899~~ | ~~899~~ | ~~612~~ |
| Services | **171** | 171 | ~~170~~ | ~~170~~ | -- | -- |
| RLS Policies | **227** | 227 | ~~207~~ | ~~207~~ | ~~207~~ | -- |
| ENUMs | **42** | 42 | ~~40~~ | ~~40~~ | 42 | -- |
| Components | **480** | 480 | ~~474~~ | ~~475~~ | -- | ~~327~~ |
| Hooks | **102** | 102 | ~~101~~ | 102 | -- | -- |
| API Files | **52** | 52 | ~~51~~ | 52 | -- | -- |
| Pages | **68** | 68 | -- | 68 | -- | ~~74~~ |
| Tables | **169** | 169 | 169 | 169 | 169 | ~~135~~ |
| Functions (DDL) | **183** | 183 | 183 | 183 | ~~249~~ | -- |
| Schemas | **18** | 18 | 18 | 18 | 18 | ~~16~~ |
| INV Version Ref | **v10.0.0** | -- | ~~v9.0.0~~ | ~~v7.0.0~~ | -- | -- |
| Coherencia DDL-BE | **90.5%** | -- | -- | ~~89%~~ | -- | -- |

**Leyenda:** ~~valor~~ = incorrecto. -- = no mencionado.

**Diagnostico:** Solo CLAUDE.md y MASTER_INVENTORY.yml estan 100% correctos. Los otros 4 archivos acumulan drift por falta de sincronizacion tras Sprint P0-P1 (2026-02-16).

---

## 2. Discrepancias de Puertos

| Archivo | Backend Port | Frontend Port | Estado |
|---------|:-----------:|:------------:|:------:|
| **CLAUDE.md** (RC6) | **3006** | **3005** | CANONICAL |
| ecosystem.config.js env_production L57 | ~~4006~~ | -- | WRONG |
| ecosystem.config.js env_development L61 | ~~4006~~ | -- | WRONG |
| ecosystem.config.js frontend args L92 | -- | ~~4005~~ | WRONG |
| ecosystem.config.js comment L10 | 3006 | 3005 | OK (comment) |
| backend/.env L9 | 3006 | -- | OK |
| backend/.env.production.example L12 | 3006 | -- | OK |
| backend/config/env.config.ts L5 | 3006 | -- | OK |
| backend/config/env.validation.ts L34 | 3006 | -- | OK |
| backend/main.ts L121 | 3006 | -- | OK |
| backend/main.ts L28 CORS | 3006 | 3005 | OK |
| backend/config/app.config.ts L37 | -- | 3005 | OK |
| frontend/.env L12,18 | 3006 (target) | -- | OK |
| frontend/.env.example L12 | 3006 (target) | -- | OK |
| frontend/.env.production.example L20 | 3006 (target) | -- | OK |
| frontend/vite.config.ts L32,36 | 3006 (proxy) | 3005 (dev) | OK |
| deploy-production.sh L427 | 3006 (fallback) | -- | OK |
| AMBIENTES-DEV-PROD.md | 3006 | 3005 | OK |
| PERFIL-DEPLOY-SERVER.md L192,204 | ~~4006~~ | ~~4005~~ | STALE (after fix) |

**Diagnostico:** Solo ecosystem.config.js (3 lineas) tiene puertos incorrectos. PERFIL-DEPLOY necesita actualizacion despues del fix.

---

## 3. Discrepancias de Archivos .env

### 3a. Redundancia de Variables DB

| Variable | backend/.env | backend/.env.dev | db/.env.database | db/.env.dev |
|----------|:-----------:|:----------------:|:----------------:|:-----------:|
| DB_HOST | WSL IP | WSL IP | localhost | localhost |
| DB_PORT | 5432 | 5432 | 5432 | 5432 |
| DB_NAME | yes | yes | yes | yes |
| DB_USER | yes | yes | yes | yes |
| DB_PASSWORD | yes | yes | yes | yes |

**Inconsistencia:** backend usa WSL2 IP (dinamico), database usa localhost (statico para WSL interno).

### 3b. Variables Fuera de Scope

| Variable | Presente en db/.env.dev | Pertenece a BD? |
|----------|:-----------------------:|:---------------:|
| JWT_SECRET | Si (real value!) | NO |
| JWT_REFRESH_SECRET | Si (real value!) | NO |
| VITE_JWT_SECRET | Si (real value!) | NO (frontend!) |
| JWT_EXPIRES_IN | Si | NO |
| JWT_REFRESH_EXPIRES_IN | Si | NO |
| NODE_ENV | Si | NO |
| APP_ENV | Si | NO |

### 3c. Naming de .env en Documentacion

| Documento | Nombre usado | Nombre real |
|-----------|:------------:|:-----------:|
| AMBIENTES-DEV-PROD.md L86 | .env.prod | .env.production |
| PERFIL-DEPLOY-SERVER.md L183 | .env.production | .env.production |
| ecosystem.config.js L65 | .env.production | .env.production |
| README overview | .env.production | .env.production |

**Inconsistencia:** Solo AMBIENTES-DEV-PROD.md usa el nombre incorrecto ".env.prod".

### 3d. Firebase vs VAPID Push Notifications

| Archivo | Tecnologia Push | Estado |
|---------|:--------------:|:------:|
| frontend/.env.example | ~~Firebase~~ (7 VITE_FIREBASE_* vars) | STALE |
| frontend/.env | (ninguna var push) | OK |
| frontend/.env.production.example | (ninguna var push) | OK |
| backend/.env.production.example | **VAPID nativo** (3 vars) | CANONICAL |

**Inconsistencia:** frontend/.env.example aun tiene vars Firebase; el stack real usa VAPID nativo.

---

## 4. Discrepancias de Informacion Duplicada (docs vs orchestration vs CLAUDE.md)

| Informacion | CLAUDE.md | PROJECT-CONTEXT | overview/README | Recomendacion |
|-------------|:---------:|:---------------:|:---------------:|:-------------:|
| Metricas DB/BE/FE | Inline (correct) | Inline (stale) | Inline (stale) | Punteros a SSOT |
| Lista de modulos | Tabla detallada | Tabla detallada | Tabla detallada | CLAUDE.md canonical, otros punteros |
| Stack tecnologico | 1 linea | Seccion completa | Seccion completa | overview canonical, otros ref |
| Estado completitud | Per-module % | Per-module % | Per-module % | overview canonical |
| Estructura dirs | Tree completo | Tree parcial | Tree completo | CLAUDE.md canonical |

**Diagnostico:** Informacion de metricas y modulos esta triplicada. Patron recomendado: MASTER_INVENTORY como SSOT numerico; CLAUDE.md mantiene copia para agents; PROJECT-CONTEXT y README referencian al SSOT.

---

## 5. Discrepancias en Ranking XP Multipliers

| Rango | DB Seeds (SSOT) | Backend Service | Frontend Hardcoded | Frontend MockData |
|-------|:--------------:|:---------------:|:------------------:|:-----------------:|
| Ajaw | 1.00 | 1.00 | 1.0 | 1.0 |
| Nacom | 1.10 | 1.10 | 1.1 | 1.25 |
| Ah K'in | 1.15 | 1.15 | **1.25** | **1.5** |
| Halach Uinic | 1.20 | 1.20 | **1.5** | 1.75 |
| K'uk'ulkan | 1.25 | 1.25 | **2.0** | **2.0** |

**Impacto funcional:** Usuarios ven multiplicadores inflados en la UI. Backend calcula correctamente.

---

## 6. Discrepancias en XP Ranges (Comentarios)

| Rango | DB Seeds v2.1 (SSOT) | DDL ENUM Comment | Backend Enum Comment |
|-------|:--------------------:|:----------------:|:-------------------:|
| Ajaw | 0-499 | ~~0-999~~ | 0-499 |
| Nacom | 500-999 | ~~1,000-2,999~~ | 500-999 |
| Ah K'in | 1,000-1,499 | ~~3,000-5,999~~ | 1,000-1,499 |
| Halach Uinic | 1,500-1,899 | ~~6,000-9,999~~ | ~~1,500-2,249~~ |
| K'uk'ulkan | 1,900+ | ~~10,000+~~ | ~~2,250+~~ |

**Impacto:** Solo cosmetic (comentarios). Valores funcionales son correctos en todos los layers.

---

## 7. References a Legacy Paths (workspace-v2)

| Archivo | Linea(s) | Referencia Legacy | Path Real |
|---------|----------|-------------------|-----------|
| MAPA-DOCUMENTACION.yml | 11-14, 310-374 | workspace-v2/orchestration/ | orchestration/ |
| database/.env.database | 7 | workspace-v2/orchestration/inventarios/ | orchestration/inventarios/ |
| database/.env.dev | 7 | workspace-v2/orchestration/inventarios/ | orchestration/inventarios/ |
| TRIGGER-ANTI-DUPLICACION.md | 55-56, 71-85 | shared/catalog/ | No existe |
| PRINCIPIO-ANTI-DUPLICACION.md | 43-55, 57-66 | @CATALOG_INDEX, @REUTILIZAR | No existe |

**Diagnostico:** 5 archivos aun referencian paths de la era workspace-v2. El proyecto es STANDALONE (RC3).
