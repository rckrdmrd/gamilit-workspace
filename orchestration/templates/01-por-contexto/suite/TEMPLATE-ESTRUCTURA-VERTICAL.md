# Template: Estructura de Vertical

**Version:** 1.0.0
**Fecha:** 2026-01-03
**Aplica a:** Creacion de nuevos verticales en suites multi-vertical
**Relacionado:** SIMCO-ESTRUCTURA-REPOS.md, SIMCO-NIVELES.md

---

## Proposito

Este template define la estructura completa para crear un nuevo vertical dentro de una suite (como erp-suite). Seguir esta estructura garantiza consistencia, herencia correcta del suite-core, y compatibilidad con el sistema SIMCO.

---

## Estructura de Directorios

```
projects/{suite}/apps/verticales/{vertical}/
|
+-- database/
|   +-- ddl/
|   |   +-- schemas/
|   |   |   +-- {vertical}_management/
|   |   |       +-- 00-schema.sql
|   |   |       +-- tables/
|   |   |       |   +-- 01-{tabla1}.sql
|   |   |       |   +-- 02-{tabla2}.sql
|   |   |       +-- functions/
|   |   |       +-- triggers/
|   |   |       +-- indexes/
|   |   +-- seeds/
|   |   +-- migrations/
|   +-- scripts/
|       +-- recreate-db.sh
|       +-- load-seeds.sh
|
+-- backend/
|   +-- src/
|   |   +-- modules/
|   |   |   +-- {modulo1}/
|   |   |   |   +-- entities/
|   |   |   |   +-- dto/
|   |   |   |   +-- {modulo1}.service.ts
|   |   |   |   +-- {modulo1}.controller.ts
|   |   |   |   +-- {modulo1}.module.ts
|   |   |   +-- {modulo2}/
|   |   +-- app.module.ts
|   +-- test/
|   +-- package.json
|   +-- tsconfig.json
|   +-- nest-cli.json
|
+-- frontend/
|   +-- src/
|   |   +-- pages/
|   |   +-- components/
|   |   +-- hooks/
|   |   +-- services/
|   |   +-- types/
|   +-- package.json
|   +-- tsconfig.json
|   +-- vite.config.ts
|
+-- docs/
|   +-- 00-vision-general/
|   |   +-- README.md
|   +-- 01-especificaciones/
|   +-- 02-arquitectura/
|
+-- orchestration/
    +-- 00-guidelines/
    |   +-- CONTEXTO-PROYECTO.md          # Contexto del vertical
    |   +-- HERENCIA-SIMCO.md             # Herencia de directivas
    |   +-- HERENCIA-ERP-CORE.md          # Herencia del suite-core
    +-- inventarios/
    |   +-- MASTER_INVENTORY.yml
    |   +-- DATABASE_INVENTORY.yml
    |   +-- BACKEND_INVENTORY.yml
    |   +-- FRONTEND_INVENTORY.yml
    +-- trazas/
    |   +-- TRAZA-TAREAS-DATABASE.md
    |   +-- TRAZA-TAREAS-BACKEND.md
    |   +-- TRAZA-TAREAS-FRONTEND.md
    +-- referencias/
    |   +-- DEPENDENCIAS-CORE.yml         # Que usa del suite-core
    |   +-- DEPENDENCIAS-EXTERNAS.yml     # Que usa de otros verticales
    +-- PROXIMA-ACCION.md
```

---

## Archivos Obligatorios

### 1. CONTEXTO-PROYECTO.md

```markdown
# Contexto del Vertical: {VERTICAL_NAME}

**Suite:** {SUITE_NAME}
**Vertical:** {VERTICAL_NAME}
**Nivel:** 2B.2 (VERTICAL)
**Estado:** {en_desarrollo | produccion}
**Fecha:** {FECHA}

---

## Identificacion

| Campo | Valor |
|-------|-------|
| Nombre | {VERTICAL_NAME} |
| Tipo | VERTICAL |
| Suite Padre | {SUITE_NAME} |
| Ruta Base | projects/{suite}/apps/verticales/{vertical}/ |
| Hereda de | Suite-Core, Suite, Core |

---

## Variables del Proyecto

### Database
```yaml
DB_NAME: "{suite}_{vertical}"
DB_SCHEMA_PREFIX: "{vertical}_"
DDL_PATH: "database/ddl/"
SEEDS_PATH: "database/ddl/seeds/"
```

### Backend
```yaml
BACKEND_ROOT: "backend/"
BACKEND_SRC: "backend/src/"
BACKEND_PORT: {puerto}
API_PREFIX: "/api/v1"
```

### Frontend
```yaml
FRONTEND_ROOT: "frontend/"
FRONTEND_SRC: "frontend/src/"
FRONTEND_PORT: {puerto}
```

---

## Herencia

### Del Suite-Core
- Schemas: {lista de schemas heredados}
- Modulos Backend: {lista de modulos}
- Componentes Frontend: {lista de componentes}

### Del Core Global
- Directivas SIMCO
- Perfiles de agentes
- Templates

---

## Propagacion

Al completar tareas en este vertical, propagar a:
1. Suite: `projects/{suite}/orchestration/`
2. Workspace: `orchestration/`
```

### 2. HERENCIA-SIMCO.md

```markdown
# Herencia SIMCO: {VERTICAL_NAME}

**Version:** 1.0.0
**Nivel:** 2B.2 (VERTICAL)

---

## Cadena de Herencia

```
Workspace (NIVEL 0)
    |
    +-- Core (NIVEL 1)
    |
    +-- Suite: {SUITE_NAME} (NIVEL 2B)
        |
        +-- Suite-Core (NIVEL 2B.1)
        |
        +-- Este Vertical (NIVEL 2B.2) <-- ESTAS AQUI
```

---

## Directivas Activas

### Principios (heredados de Core)
- [x] PRINCIPIO-CAPVED.md
- [x] PRINCIPIO-DOC-PRIMERO.md
- [x] PRINCIPIO-ANTI-DUPLICACION.md
- [x] PRINCIPIO-VALIDACION-OBLIGATORIA.md
- [x] PRINCIPIO-ECONOMIA-TOKENS.md
- [x] PRINCIPIO-NO-ASUMIR.md

### SIMCO por Operacion
- [x] SIMCO-TAREA.md
- [x] SIMCO-CREAR.md
- [x] SIMCO-MODIFICAR.md
- [x] SIMCO-VALIDAR.md
- [x] SIMCO-DOCUMENTAR.md

### SIMCO por Dominio
- [x] SIMCO-DDL.md
- [x] SIMCO-BACKEND.md
- [x] SIMCO-FRONTEND.md

### SIMCO de Arquitectura
- [x] SIMCO-ESTRUCTURA-REPOS.md
- [x] SIMCO-NIVELES.md
- [x] SIMCO-PROPAGACION.md
```

### 3. HERENCIA-ERP-CORE.md

```markdown
# Herencia ERP-Core: {VERTICAL_NAME}

**Version:** {ERP_CORE_VERSION}
**Suite:** {SUITE_NAME}

---

## Schemas Heredados

| Schema | Tablas | Uso en Vertical |
|--------|--------|-----------------|
| auth_management | 26 | Autenticacion |
| core_management | 12 | Entidades base |
| ... | ... | ... |

---

## Modulos Backend Heredados

```typescript
// Importar desde suite-core
import { AuthModule } from '@erp-core/auth';
import { CoreModule } from '@erp-core/core';
```

---

## Reglas de Extension

1. **NO modificar** codigo del suite-core
2. **Extender** mediante herencia o composicion
3. **Usar FK** hacia tablas del core
4. **Mantener RLS** con app.current_tenant_id

---

## Schemas Propios del Vertical

| Schema | Descripcion |
|--------|-------------|
| {vertical}_management | {descripcion} |
```

### 4. DEPENDENCIAS-CORE.yml

```yaml
# Dependencias del Suite-Core
# Vertical: {VERTICAL_NAME}

version: "1.0.0"
fecha: "{FECHA}"

schemas_heredados:
  - schema: "auth_management"
    tablas_usadas:
      - "users"
      - "roles"
      - "permissions"
  - schema: "core_management"
    tablas_usadas:
      - "organizations"
      - "organization_members"

modulos_backend:
  - modulo: "AuthModule"
    import: "@erp-core/auth"
    funcionalidades:
      - "Guards"
      - "JWT"
      - "Decorators"

componentes_frontend:
  - componente: "Layout"
    import: "@erp-core/ui"
```

---

## Comandos de Inicializacion

### Crear Estructura Base

```bash
# Desde la raiz del workspace
SUITE="erp-suite"
VERTICAL="{nombre_vertical}"
BASE_PATH="projects/$SUITE/apps/verticales/$VERTICAL"

# Crear directorios
mkdir -p $BASE_PATH/{database/ddl/{schemas,seeds,migrations},backend/src/modules,frontend/src/{pages,components},docs,orchestration/{00-guidelines,inventarios,trazas,referencias}}

# Crear archivos base
touch $BASE_PATH/orchestration/00-guidelines/{CONTEXTO-PROYECTO.md,HERENCIA-SIMCO.md,HERENCIA-ERP-CORE.md}
touch $BASE_PATH/orchestration/inventarios/{MASTER_INVENTORY.yml,DATABASE_INVENTORY.yml,BACKEND_INVENTORY.yml,FRONTEND_INVENTORY.yml}
touch $BASE_PATH/orchestration/trazas/{TRAZA-TAREAS-DATABASE.md,TRAZA-TAREAS-BACKEND.md,TRAZA-TAREAS-FRONTEND.md}
touch $BASE_PATH/orchestration/referencias/{DEPENDENCIAS-CORE.yml,DEPENDENCIAS-EXTERNAS.yml}
touch $BASE_PATH/orchestration/PROXIMA-ACCION.md
```

---

## Checklist de Creacion

```markdown
## Vertical: {VERTICAL_NAME}

### Estructura Base
- [ ] Directorio creado en apps/verticales/{vertical}/
- [ ] Subdirectorios: database/, backend/, frontend/, docs/, orchestration/

### Orchestration
- [ ] 00-guidelines/CONTEXTO-PROYECTO.md
- [ ] 00-guidelines/HERENCIA-SIMCO.md
- [ ] 00-guidelines/HERENCIA-ERP-CORE.md
- [ ] inventarios/*.yml (4 archivos)
- [ ] trazas/*.md (3 archivos)
- [ ] referencias/DEPENDENCIAS-CORE.yml
- [ ] PROXIMA-ACCION.md

### Database
- [ ] Schema {vertical}_management creado
- [ ] Tablas base creadas
- [ ] Scripts recreate-db.sh

### Backend
- [ ] package.json configurado
- [ ] tsconfig.json con paths a suite-core
- [ ] nest-cli.json
- [ ] Al menos 1 modulo base

### Frontend
- [ ] package.json configurado
- [ ] tsconfig.json con paths
- [ ] vite.config.ts

### Suite
- [ ] Registrado en VERTICALES-INDEX.yml de la suite
- [ ] Registrado en SUITE_MASTER_INVENTORY.yml

### Validacion
- [ ] npm run build pasa en backend
- [ ] npm run build pasa en frontend
- [ ] Carga de DB limpia funciona
```

---

## Ejemplo: Vertical "clinicas"

```
projects/erp-suite/apps/verticales/clinicas/
+-- database/
|   +-- ddl/schemas/clinicas_management/
|       +-- 00-schema.sql
|       +-- tables/
|           +-- 01-pacientes.sql
|           +-- 02-citas.sql
|           +-- 03-historias_clinicas.sql
+-- backend/src/modules/
|   +-- pacientes/
|   +-- citas/
|   +-- historias/
+-- frontend/src/
|   +-- pages/
|       +-- pacientes/
|       +-- citas/
+-- orchestration/
    +-- 00-guidelines/
        +-- CONTEXTO-PROYECTO.md
        +-- HERENCIA-SIMCO.md
        +-- HERENCIA-ERP-CORE.md
```

---

**Template Version:** 1.0.0 | **Sistema:** SIMCO | **Nivel:** 2B.2
