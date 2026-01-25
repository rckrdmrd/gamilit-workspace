# TEMPLATE: CONTEXTO DE PROYECTO

**Versión:** 1.1.0
**Sistema:** SIMCO + Catálogo
**Propósito:** Template para crear el archivo CONTEXTO-PROYECTO.md en cada proyecto

---

## INSTRUCCIONES DE USO

1. Copiar este template a: `projects/{proyecto}/orchestration/00-guidelines/CONTEXTO-PROYECTO.md`
2. Reemplazar todos los `{PLACEHOLDER}` con valores reales del proyecto
3. Eliminar secciones que no apliquen
4. Este archivo es la fuente de verdad para resolver aliases en el proyecto

---

# CONTEXTO: {PROJECT_NAME}

**Proyecto:** {PROJECT_NAME}
**Descripción:** {Descripción breve del proyecto}
**Fecha creación:** {YYYY-MM-DD}
**Última actualización:** {YYYY-MM-DD}
**Versión:** 1.0.0

---

## INFORMACIÓN GENERAL

```yaml
Proyecto:
  nombre: "{PROJECT_NAME}"
  descripcion: "{Descripción del proyecto}"
  tipo: "standalone | multi-vertical | monorepo"
  estado: "desarrollo | staging | producción"

Equipo:
  tech_lead: "{nombre o sistema}"
  repository: "{URL del repositorio}"

Stack:
  database: "PostgreSQL {versión}"
  backend: "NestJS {versión}"
  frontend: "React {versión}"
  otros: []
```

---

## VARIABLES DEL PROYECTO (ALIAS RESUELTOS)

### Database

```yaml
# Variables para @DDL, @SEEDS, etc.
DB_NAME: "{nombre_base_datos}"
DB_DDL_PATH: "{ruta}/ddl"
DB_SCRIPTS_PATH: "{ruta}"
DB_SEEDS_PATH: "{ruta}/seeds"
RECREATE_CMD: "{script_recreacion}.sh"

# Schemas del proyecto
SCHEMAS:
  - name: "{schema_1}"
    descripcion: "{propósito}"
  - name: "{schema_2}"
    descripcion: "{propósito}"
```

**Ejemplo resuelto:**
```yaml
DB_NAME: "gamilit_platform"
DB_DDL_PATH: "apps/database/ddl"
DB_SCRIPTS_PATH: "apps/database"
DB_SEEDS_PATH: "apps/database/seeds"
RECREATE_CMD: "drop-and-recreate-database.sh"

SCHEMAS:
  - name: "auth_management"
    descripcion: "Autenticación y usuarios"
  - name: "gamification_system"
    descripcion: "Sistema de gamificación"
```

### Backend

```yaml
# Variables para @BACKEND, @BACKEND_ROOT, etc.
BACKEND_ROOT: "{ruta_backend}"
BACKEND_SRC: "{ruta_backend}/src"
BACKEND_TESTS: "{ruta_backend}/tests"
BACKEND_PORT: "{puerto}"

# Módulos principales
MODULES:
  - name: "{modulo_1}"
    descripcion: "{propósito}"
  - name: "{modulo_2}"
    descripcion: "{propósito}"
```

**Ejemplo resuelto:**
```yaml
BACKEND_ROOT: "apps/backend"
BACKEND_SRC: "apps/backend/src"
BACKEND_TESTS: "apps/backend/tests"
BACKEND_PORT: "3000"

MODULES:
  - name: "auth"
    descripcion: "Autenticación JWT"
  - name: "users"
    descripcion: "Gestión de usuarios"
  - name: "gamification"
    descripcion: "Sistema de puntos y badges"
```

### Frontend

```yaml
# Variables para @FRONTEND, @FRONTEND_ROOT, etc.
FRONTEND_ROOT: "{ruta_frontend}"
FRONTEND_SRC: "{ruta_frontend}/src"
FRONTEND_PORT: "{puerto}"
API_BASE_URL: "{url_api}"

# Apps del frontend
APPS:
  - name: "{app_1}"
    descripcion: "{propósito}"
    ruta: "{path}"
```

**Ejemplo resuelto:**
```yaml
FRONTEND_ROOT: "apps/frontend/web"
FRONTEND_SRC: "apps/frontend/web/src"
FRONTEND_PORT: "5173"
API_BASE_URL: "http://localhost:3000/api"

APPS:
  - name: "main"
    descripcion: "Aplicación principal"
    ruta: "/"
  - name: "admin"
    descripcion: "Panel de administración"
    ruta: "/admin"
```

---

## ALIAS RESUELTOS PARA ESTE PROYECTO

Copia de `@ALIASES` con valores concretos:

```yaml
# ═══════════════════════════════════════════════════════════════
# ALIAS RESUELTOS - {PROJECT_NAME}
# ═══════════════════════════════════════════════════════════════

# Código
@DDL:           "{DB_DDL_PATH}/schemas/"
@DDL_ROOT:      "{DB_DDL_PATH}/"
@SEEDS:         "{DB_SEEDS_PATH}/"
@SEEDS_DEV:     "{DB_SEEDS_PATH}/dev/"
@SEEDS_PROD:    "{DB_SEEDS_PATH}/prod/"
@DB_SCRIPTS:    "{DB_SCRIPTS_PATH}/"

@BACKEND:       "{BACKEND_SRC}/modules/"
@BACKEND_ROOT:  "{BACKEND_ROOT}/"
@BACKEND_SHARED: "{BACKEND_SRC}/shared/"

@FRONTEND:      "{FRONTEND_SRC}/apps/"
@FRONTEND_ROOT: "{FRONTEND_ROOT}/"
@FRONTEND_SHARED: "{FRONTEND_SRC}/shared/"

# Orchestration
@ORCH:          "orchestration/"
@INVENTORY:     "orchestration/inventarios/MASTER_INVENTORY.yml"
@INV_DB:        "orchestration/inventarios/DATABASE_INVENTORY.yml"
@INV_BE:        "orchestration/inventarios/BACKEND_INVENTORY.yml"
@INV_FE:        "orchestration/inventarios/FRONTEND_INVENTORY.yml"
@TRAZA_DB:      "orchestration/trazas/TRAZA-TAREAS-DATABASE.md"
@TRAZA_BE:      "orchestration/trazas/TRAZA-TAREAS-BACKEND.md"
@TRAZA_FE:      "orchestration/trazas/TRAZA-TAREAS-FRONTEND.md"

# Documentación
@DOCS:          "docs/"
@GUIAS:         "docs/95-guias-desarrollo/"
@ADR:           "docs/97-adr/"
```

**Ejemplo resuelto para GAMILIT:**
```yaml
@DDL:           "apps/database/ddl/schemas/"
@DDL_ROOT:      "apps/database/ddl/"
@SEEDS:         "apps/database/seeds/"
@DB_SCRIPTS:    "apps/database/"

@BACKEND:       "apps/backend/src/modules/"
@BACKEND_ROOT:  "apps/backend/"
@BACKEND_SHARED: "apps/backend/src/shared/"

@FRONTEND:      "apps/frontend/web/src/apps/"
@FRONTEND_ROOT: "apps/frontend/web/"

@INVENTORY:     "orchestration/inventarios/MASTER_INVENTORY.yml"
# ... etc
```

---

## COMANDOS FRECUENTES

```yaml
# Database
recrear_db: "cd {DB_SCRIPTS_PATH} && ./{RECREATE_CMD}"
crear_db: "cd {DB_SCRIPTS_PATH} && ./create-database.sh"
psql_connect: "psql -d {DB_NAME}"

# Backend
build_be: "cd {BACKEND_ROOT} && npm run build"
lint_be: "cd {BACKEND_ROOT} && npm run lint"
test_be: "cd {BACKEND_ROOT} && npm run test"
start_be: "cd {BACKEND_ROOT} && npm run start:dev"

# Frontend
build_fe: "cd {FRONTEND_ROOT} && npm run build"
lint_fe: "cd {FRONTEND_ROOT} && npm run lint"
start_fe: "cd {FRONTEND_ROOT} && npm run dev"
```

---

## ESTRUCTURA DEL PROYECTO

```
{PROJECT_NAME}/
├── apps/
│   ├── database/
│   │   ├── ddl/
│   │   │   ├── 00-init.sql
│   │   │   └── schemas/
│   │   │       └── {schema}/
│   │   ├── seeds/
│   │   │   ├── dev/
│   │   │   └── prod/
│   │   ├── create-database.sh
│   │   └── {RECREATE_CMD}
│   │
│   ├── backend/
│   │   ├── src/
│   │   │   ├── shared/
│   │   │   └── modules/
│   │   │       └── {modulo}/
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── frontend/
│       └── web/
│           ├── src/
│           │   ├── apps/
│           │   └── shared/
│           └── package.json
│
├── docs/
│   ├── 00-vision-general/
│   ├── 01-fase-*/
│   ├── 95-guias-desarrollo/
│   ├── 97-adr/
│   └── README.md
│
├── orchestration/
│   ├── 00-guidelines/
│   │   └── CONTEXTO-PROYECTO.md    ← ESTE ARCHIVO
│   ├── inventarios/
│   │   ├── MASTER_INVENTORY.yml
│   │   ├── DATABASE_INVENTORY.yml
│   │   ├── BACKEND_INVENTORY.yml
│   │   └── FRONTEND_INVENTORY.yml
│   ├── trazas/
│   │   ├── TRAZA-TAREAS-DATABASE.md
│   │   ├── TRAZA-TAREAS-BACKEND.md
│   │   └── TRAZA-TAREAS-FRONTEND.md
│   └── PROXIMA-ACCION.md
│
└── README.md
```

---

## REFERENCIAS A CORE/ORCHESTRATION

Este proyecto usa el sistema SIMCO definido en:

```yaml
SIMCO:
  indice: "core/orchestration/directivas/simco/_INDEX.md"
  principios: "core/orchestration/directivas/principios/"
  aliases_globales: "core/orchestration/referencias/ALIASES.yml"
  perfiles: "core/orchestration/agents/perfiles/"

# 🆕 CATÁLOGO DE FUNCIONALIDADES REUTILIZABLES
CATALOGO:
  indice: "shared/catalog/CATALOG-INDEX.yml"
  reutilizar: "core/orchestration/directivas/simco/SIMCO-REUTILIZAR.md"
  funcionalidades:
    - auth: "shared/catalog/auth/"
    - session: "shared/catalog/session-management/"
    - rate-limiting: "shared/catalog/rate-limiting/"
    - notifications: "shared/catalog/notifications/"
    - multi-tenancy: "shared/catalog/multi-tenancy/"
    - feature-flags: "shared/catalog/feature-flags/"
    - websocket: "shared/catalog/websocket/"
    - payments: "shared/catalog/payments/"
```

---

## 🆕 FUNCIONALIDADES DEL CATÁLOGO USADAS EN ESTE PROYECTO

```yaml
# Marcar las funcionalidades que este proyecto usa del catálogo global
funcionalidades_del_catalogo:
  - nombre: "{funcionalidad}"
    version: "{version del catálogo}"
    adaptaciones: "{cambios específicos del proyecto}"
    fecha_implementacion: "{YYYY-MM-DD}"
```

---

## NOTAS ESPECÍFICAS DEL PROYECTO

{Agregar notas específicas, decisiones de arquitectura locales, particularidades del proyecto, etc.}

---

**Creado:** {YYYY-MM-DD}
**Autor:** {nombre}
**Basado en:** TEMPLATE-CONTEXTO-PROYECTO.md v1.0.0
