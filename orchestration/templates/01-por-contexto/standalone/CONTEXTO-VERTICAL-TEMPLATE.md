# Contexto del Proyecto - {NOMBRE_PROYECTO}

## Identificacion

| Campo | Valor |
|-------|-------|
| **Nombre** | {NOMBRE_PROYECTO} |
| **Tipo** | Vertical ERP - {INDUSTRIA} |
| **Estado** | {En desarrollo | MVP | Produccion} |
| **Version** | {VERSION} |
| **Fecha Creacion** | {FECHA} |

---

## Descripcion

{Descripcion detallada del proyecto y su proposito}

---

## VARIABLES PARA DIRECTIVAS GLOBALES

```yaml
# Identificacion del Proyecto
PROJECT:             {nombre_lowercase}
PROJECT_NAME:        {NOMBRE_PROYECTO}
PROJECT_LEVEL:       STANDALONE

# Paths Principales (WORKSPACE-V1)
WORKSPACE_ROOT:      ~/workspace-v1
PROJECT_ROOT:        ~/workspace-v1/projects/{nombre_lowercase}
APPS_ROOT:           ~/workspace-v1/projects/{nombre_lowercase}/apps
DOCS_ROOT:           ~/workspace-v1/projects/{nombre_lowercase}/docs
ORCHESTRATION:       ~/workspace-v1/projects/{nombre_lowercase}/orchestration

# Herencia de ERP-Core
ERP_CORE_ROOT:       ~/workspace-v1/projects/erp-core
HERENCIA_DOC:        orchestration/00-guidelines/HERENCIA-ERP-CORE.md

# Base Orchestration (Directivas y Perfiles)
DIRECTIVAS_PATH:     ~/workspace-v1/orchestration/directivas
PERFILES_PATH:       ~/workspace-v1/orchestration/agents/perfiles
CATALOG_PATH:        ~/workspace-v1/shared/catalog

# Base de Datos
DB_NAME:             {nombre_db}
DB_DDL_PATH:         ~/workspace-v1/projects/{nombre_lowercase}/apps/database/ddl
DB_SCRIPTS_PATH:     ~/workspace-v1/projects/{nombre_lowercase}/apps/database
DB_SEEDS_PATH:       ~/workspace-v1/projects/{nombre_lowercase}/apps/database/seeds

# Backend
BACKEND_ROOT:        ~/workspace-v1/projects/{nombre_lowercase}/apps/backend
BACKEND_SRC:         ~/workspace-v1/projects/{nombre_lowercase}/apps/backend/src

# Frontend
FRONTEND_ROOT:       ~/workspace-v1/projects/{nombre_lowercase}/apps/frontend
FRONTEND_SRC:        ~/workspace-v1/projects/{nombre_lowercase}/apps/frontend/src
```

---

## HERENCIA Y DEPENDENCIAS

### Tipo de Proyecto

```yaml
NIVEL: "STANDALONE"
TIPO: "Proyecto independiente"
HEREDA_DE: "erp-core"
```

### Herencia de ERP-Core

```yaml
herencia:
  tipo: "EXTIENDE"
  base: "projects/erp-core"
  version: "1.2.0"
  documento: "orchestration/00-guidelines/HERENCIA-ERP-CORE.md"

  schemas_heredados:
    - auth_management (26 tablas)
    - core_management (12 tablas)
    - financial_management (15 tablas)
    - inventory_management (20 tablas)
    - purchasing_management (8 tablas)
    - sales_management (10 tablas)
    - projects_management (10 tablas)
    - analytics_management (7 tablas)
    - system_management (13 tablas)
    - hr_management (6 tablas)
```

### Dependencias Externas

```yaml
dependencias:
  erp_core:
    documento: "orchestration/referencias/DEPENDENCIAS-ERP-CORE.yml"

  shared_modules:
    documento: "orchestration/referencias/DEPENDENCIAS-SHARED.yml"
```

---

## STACK TECNOLOGICO

| Capa | Tecnologia |
|------|------------|
| Backend | Node.js 20+, Express.js, TypeScript 5.3+, TypeORM |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Base de Datos | PostgreSQL 15+ con RLS |
| Autenticacion | JWT + bcrypt |

---

## SCHEMAS DE BASE DE DATOS

### Heredados de ERP-Core

(Ver HERENCIA-ERP-CORE.md)

### Propios de Este Proyecto

| Schema | Proposito |
|--------|-----------|
| `{schema_1}_management` | {descripcion} |
| `{schema_2}_management` | {descripcion} |

---

## MODULOS DEL PROYECTO

### Fase 1: Foundation (Heredados)

- Autenticacion (de erp-core)
- Usuarios y Roles (de erp-core)
- Multi-Tenancy (de erp-core)

### Fase 2: Negocio Especifico

| Modulo | Descripcion | Estado |
|--------|-------------|--------|
| {modulo_1} | {descripcion} | {%} |
| {modulo_2} | {descripcion} | {%} |

---

## CONVENCIONES

### Base de Datos

- Schemas: `{dominio}_management`
- Tablas: `snake_case`
- Indices: `idx_{tabla}_{columnas}`
- FKs: `fk_{origen}_to_{destino}`
- Variable RLS: `app.current_tenant_id`

### Backend

- Archivos: `kebab-case.tipo.ts`
- Clases: `PascalCase`
- Metodos: `camelCase`

### Frontend

- Componentes: `PascalCase.tsx`
- Hooks: `use{Nombre}.ts`
- Stores: `{nombre}.store.ts`

---

## DOCUMENTACION RELACIONADA

- HERENCIA-ERP-CORE.md - Que heredamos del core
- DEPENDENCIAS-ERP-CORE.yml - Detalle de dependencias
- DEPENDENCIAS-SHARED.yml - Modulos de catalogo usados

---

**Nivel:** STANDALONE | **Sistema:** SIMCO v3.4 + CAPVED
