# Herencia SIMCO - GAMILIT

**Sistema:** SIMCO v2.3.0 + CAPVED + CCA Protocol
**Fecha:** 2025-12-18

---

## Configuración del Proyecto

| Propiedad | Valor |
|-----------|-------|
| **Proyecto** | GAMILIT - Plataforma EdTech Gamificada |
| **Nivel** | STANDALONE |
| **Padre** | core/orchestration |
| **SIMCO Version** | 2.3.0 |
| **CAPVED** | Habilitado |
| **CCA Protocol** | Habilitado |

## Jerarquía de Herencia

```
Nivel 0: workspace/orchestration/               ← WORKSPACE (directivas globales)
    │
Nivel 1: core/orchestration/                    ← CORE (76 docs SIMCO)
    │
    └── STANDALONE: gamilit/orchestration/      ← ESTE PROYECTO
                    gamilit/docs/00-vision-general/directivas/  ← DIRECTIVAS ESPECIFICAS
```

**Regla:** Las directivas locales pueden EXTENDER las de core, nunca REDUCIRLAS.

**Estado del Proyecto:** MVP 75% completado

---

## Directivas Heredadas de WORKSPACE (OBLIGATORIAS)

Ubicación: `workspace/orchestration/`

| Alias | Archivo | Propósito |
|-------|---------|-----------|
| `@CARGA-CONTEXTO` | `directivas/DIRECTIVA-CARGA-CONTEXTO.md` | Como cargar contexto segun nivel |
| `@INDICE` | `INDICE-DIRECTIVAS-WORKSPACE.yml` | Indice maestro de directivas |

---

## Directivas Heredadas de CORE (OBLIGATORIAS)

Ubicación: `core/orchestration/`

### 1. Ciclo de Vida - USAR SIEMPRE

| Alias | Archivo | Propósito |
|-------|---------|-----------|
| `@TAREA` | `directivas/simco/SIMCO-TAREA.md` | Punto de entrada para toda HU |
| `@CAPVED` | `directivas/principios/PRINCIPIO-CAPVED.md` | Ciclo de 6 fases |
| `@INICIALIZACION` | `directivas/simco/SIMCO-INICIALIZACION.md` | Bootstrap de agentes |
| `@DOC-DEFINITIVA` | `directivas/DIRECTIVA-DOCUMENTACION-DEFINITIVA.md` | Docs como estado final |

### 2. Operaciones Universales

| Alias | Archivo | Propósito |
|-------|---------|-----------|
| `@CREAR` | `SIMCO-CREAR.md` | Crear archivos nuevos |
| `@MODIFICAR` | `SIMCO-MODIFICAR.md` | Modificar existentes |
| `@VALIDAR` | `SIMCO-VALIDAR.md` | Validar código |
| `@DOCUMENTAR` | `SIMCO-DOCUMENTAR.md` | Documentar trabajo |
| `@BUSCAR` | `SIMCO-BUSCAR.md` | Buscar información |
| `@DELEGAR` | `SIMCO-DELEGACION.md` | Delegar a subagentes |

### 3. Catálogo de Funcionalidades

| Alias | Archivo | Propósito |
|-------|---------|-----------|
| `@CATALOG` | `catalog/` | Funcionalidades reutilizables |
| `@CATALOG_INDEX` | `catalog/CATALOG-INDEX.yml` | Índice |
| `@REUTILIZAR` | `SIMCO-REUTILIZAR.md` | Antes de implementar |
| `@CONTRIBUIR` | `SIMCO-CONTRIBUIR-CATALOGO.md` | Después de crear |

**Funcionalidades del catálogo usadas por GAMILIT:**

| Funcionalidad | Uso |
|---------------|-----|
| `auth` | JWT + 5 proveedores OAuth |
| `session-management` | Sesiones de usuario |
| `notifications` | Sistema de notificaciones |
| `feature-flags` | Features graduales |

### 4. Principios Fundamentales (5)

| Alias | Resumen |
|-------|---------|
| `@CAPVED` | Toda tarea pasa por 6 fases |
| `@DOC_PRIMERO` | Consultar docs/ antes de implementar |
| `@ANTI_DUP` | Verificar que no existe antes de crear |
| `@VALIDACION` | Build y lint DEBEN pasar |
| `@TOKENS` | Desglosar tareas grandes |

---

## Directivas por Dominio Técnico

| Alias | Aplica | Notas |
|-------|--------|-------|
| `@OP_DDL` | **SÍ** | 16 schemas, 123 tablas |
| `@OP_BACKEND` | **SÍ** | NestJS, 417 endpoints |
| `@OP_FRONTEND` | **SÍ** | React 19, Zustand |
| `@OP_MOBILE` | NO | (futuro) |
| `@OP_ML` | NO | - |

---

## Patrones Heredados (OBLIGATORIOS)

| Patrón | Uso en GAMILIT |
|--------|----------------|
| `MAPEO-TIPOS-DDL-TYPESCRIPT.md` | 14 schemas ↔ Entities |
| `PATRON-VALIDACION.md` | class-validator en DTOs |
| `PATRON-EXCEPTION-HANDLING.md` | Filtros NestJS |
| `PATRON-TESTING.md` | Jest + e2e tests |
| `PATRON-LOGGING.md` | Winston estructurado |
| `PATRON-CONFIGURACION.md` | @nestjs/config |
| `PATRON-SEGURIDAD.md` | JWT, RBAC, Guards |
| `PATRON-PERFORMANCE.md` | Query optimization |
| `PATRON-TRANSACCIONES.md` | TypeORM transactions |
| `ANTIPATRONES.md` | Evitar siempre |
| `NOMENCLATURA-UNIFICADA.md` | Consistencia |

---

## Directivas Específicas de GAMILIT

### Ubicación Principal: `docs/00-vision-general/directivas/`

| Directiva | Propósito | Estado |
|-----------|-----------|--------|
| `_INDEX.md` | Índice de directivas específicas | Activo |
| `DIRECTIVA-GAMILIT-EJERCICIOS.md` | Estructura de ejercicios | Pendiente |
| `DIRECTIVA-GAMILIT-GAMIFICACION.md` | Sistema de gamificación | Pendiente |

### Ubicación Secundaria: `orchestration/directivas/`

| Directiva Local | Extiende | Propósito |
|-----------------|----------|-----------|
| `DIRECTIVA-DISENO-BASE-DATOS.md` | `@OP_DDL` | 16 schemas PostgreSQL |
| `DIRECTIVA-POLITICA-CARGA-LIMPIA.md` | `@OP_DDL` | DDL-first, sin migraciones |
| `ESTANDARES-API-ROUTES.md` | `@OP_BACKEND` | Convenciones de rutas |
| `ESTANDARES-TESTING-API.md` | `@PATRON-TESTING` | Testing de API |
| `PITFALLS-API-ROUTES.md` | `@ANTIPATRONES` | Errores a evitar |
| `GUIA-NOMENCLATURA-COMPLETA.md` | `@NOMENCLATURA` | Nomenclatura específica |

---

## Variables de Contexto CCA

```yaml
# Identificación del Proyecto
PROJECT_NAME: "gamilit"
PROJECT_LEVEL: "STANDALONE"
PROJECT_ROOT: "/home/isem/workspace/projects/gamilit"

# Rutas principales
APPS_ROOT: "apps"
DOCS_ROOT: "docs"
ORCHESTRATION: "orchestration"

# Base de Datos
DB_NAME: "gamilit_platform"
DB_DDL_PATH: "apps/database/ddl"
DB_SCRIPTS_PATH: "apps/database"
DB_SEEDS_PATH: "apps/database/seeds"
RECREATE_CMD: "drop-and-recreate-database.sh"

# Backend (NestJS)
BACKEND_ROOT: "apps/backend"
BACKEND_SRC: "apps/backend/src"
BACKEND_TESTS: "apps/backend/tests"
BACKEND_FRAMEWORK: "NestJS"
ORM: "TypeORM"

# Frontend (React)
FRONTEND_ROOT: "apps/frontend"
FRONTEND_SRC: "apps/frontend/src"
FRONTEND_TESTS: "apps/frontend/tests"
FRONTEND_FRAMEWORK: "React"
STATE_MANAGEMENT: "Zustand"
BUILD_TOOL: "Vite"

# Auth
AUTH_SCHEMA: "auth_management"
AUTH_PROVIDERS: "Google, Facebook, Apple, GitHub, Email"

# Inventarios
MASTER_INVENTORY: "orchestration/inventarios/MASTER_INVENTORY.yml"
DATABASE_INVENTORY: "orchestration/inventarios/DATABASE_INVENTORY.yml"
BACKEND_INVENTORY: "orchestration/inventarios/BACKEND_INVENTORY.yml"
FRONTEND_INVENTORY: "orchestration/inventarios/FRONTEND_INVENTORY.yml"
```

---

## Schemas de Base de Datos (14)

| Schema | Descripción | Tablas |
|--------|-------------|--------|
| `auth_management` | Autenticación, OAuth | ~10 |
| `user_management` | Usuarios, perfiles | ~8 |
| `gamification_system` | XP, ML Coins, logros | ~15 |
| `maya_ranks` | Rangos Maya | ~5 |
| `learning_content` | Contenido educativo | ~12 |
| `progress_tracking` | Progreso del estudiante | ~10 |
| `challenge_system` | Desafíos, misiones | ~8 |
| `reward_system` | Recompensas | ~6 |
| `social_features` | Social, leaderboards | ~8 |
| `parent_portal` | Portal de padres | ~5 |
| `teacher_tools` | Herramientas docentes | ~6 |
| `analytics` | Analíticas | ~4 |
| `notifications` | Notificaciones | ~3 |
| `system_config` | Configuración | ~3 |

**Total:** 101 tablas

---

## Stack Tecnológico Detallado

### Backend
- **Framework:** NestJS 11.x
- **Lenguaje:** TypeScript 5.3
- **ORM:** TypeORM 0.3.x
- **Auth:** JWT + Passport (5 proveedores OAuth)
- **API:** 125+ endpoints REST
- **Validación:** class-validator, class-transformer
- **Docs:** Swagger/OpenAPI

### Frontend
- **Framework:** React 19.x
- **Lenguaje:** TypeScript 5.3
- **State:** Zustand 5.x
- **Styling:** Tailwind CSS 4.x
- **Build:** Vite
- **Routing:** React Router

### Database
- **Engine:** PostgreSQL 15
- **Extensiones:** uuid-ossp, pg_trgm

---

## Flujo de Trabajo para Desarrollo

```yaml
# PASO 1: Cargar contexto (CCA)
CARGAR:
  - @TAREA
  - @CAPVED
  - @INICIALIZACION
  - ./CONTEXTO-PROYECTO.md

# PASO 2: Verificar catálogo
VERIFICAR:
  - @CATALOG_INDEX
  - @REUTILIZAR

# PASO 3: Seleccionar operación
OPERACION:
  - @OP_DDL         # 14 schemas
  - @OP_BACKEND     # NestJS
  - @OP_FRONTEND    # React

# PASO 4: Aplicar patrones
PATRONES:
  - @PATRON-VALIDACION
  - @PATRON-EXCEPTION-HANDLING
  - @PATRON-SEGURIDAD

# PASO 5: Validar
VALIDAR:
  - npm run build
  - npm run lint
  - npm run test

# PASO 6: Documentar
CIERRE:
  - @DOCUMENTAR
  - Actualizar inventarios
```

---

## Mapeo: Directivas Antiguas → SIMCO

| Directiva Antigua | Reemplazada Por | Alias |
|-------------------|-----------------|-------|
| `DIRECTIVA-FLUJO-5-FASES.md` | `SIMCO-TAREA.md` + `PRINCIPIO-CAPVED.md` | @TAREA, @CAPVED |
| `DIRECTIVA-VALIDACION-SUBAGENTES.md` | `SIMCO-VALIDAR.md` | @VALIDAR |
| `POLITICAS-USO-AGENTES.md` | `SIMCO-DELEGACION.md` | @DELEGAR |
| `DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md` | `SIMCO-DOCUMENTAR.md` | @DOCUMENTAR |
| `DIRECTIVA-CALIDAD-CODIGO.md` | `ANTIPATRONES.md` | @ANTIPATRONES |

---

## Perfiles de Agentes más usados

| Perfil | Especialización | Frecuencia |
|--------|-----------------|------------|
| `PERFIL-DATABASE.md` | PostgreSQL, 14 schemas | Alta |
| `PERFIL-BACKEND.md` | NestJS, TypeORM | Alta |
| `PERFIL-FRONTEND.md` | React, Zustand | Alta |
| `PERFIL-CODE-REVIEWER.md` | Revisión de código | Media |
| `PERFIL-BUG-FIXER.md` | Corrección de bugs | Media |

---

**Sistema:** SIMCO v2.2.0 + CAPVED + CCA Protocol
**Nivel:** STANDALONE
**Última actualización:** 2025-12-08
