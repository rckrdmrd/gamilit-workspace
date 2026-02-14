# SIMCO: Gestion de Proyectos Monorepo

**Version:** 1.0.0
**Fecha:** 2026-02-02
**Tipo:** Directiva SIMCO
**Aplica a:** Proyectos con estructura monorepo
**Alias:** @MONOREPO, @SIMCO-MONOREPO

---

## 1. INTRODUCCION

### 1.1 Que es un Monorepo vs Polyrepo

```
+==============================================================================+
|                                                                              |
|   MONOREPO                              POLYREPO                             |
|   --------                              --------                             |
|   Un repositorio que contiene           Multiples repositorios separados,   |
|   multiples proyectos/aplicaciones      uno por proyecto/aplicacion.        |
|   relacionados.                                                              |
|                                                                              |
|   proyecto/                             proyecto-backend/                    |
|     apps/                                 .git                               |
|       backend/                            src/                               |
|       frontend/                                                              |
|     packages/                           proyecto-frontend/                   |
|       shared/                             .git                               |
|     .git (unico)                          src/                               |
|                                                                              |
|   VENTAJAS MONOREPO:                    VENTAJAS POLYREPO:                   |
|   - Codigo compartido facil             - Repositorios independientes        |
|   - Refactoring atomico                 - CI/CD mas simple                   |
|   - Versionado sincronizado             - Permisos granulares                |
|   - Una fuente de verdad                - Clones mas rapidos                 |
|                                                                              |
+==============================================================================+
```

### 1.2 Cuando Usar Monorepo

```yaml
USAR_MONOREPO_CUANDO:
  - Multiples aplicaciones comparten codigo significativo (>30%)
  - Backend y Frontend usan tipos/interfaces compartidos
  - Se requiere refactoring atomico entre capas
  - El equipo trabaja en multiples apps simultaneamente
  - Se necesita versionado coordinado

NO_USAR_MONOREPO_CUANDO:
  - Proyectos completamente independientes
  - Equipos separados sin comunicacion
  - Tecnologias muy diferentes sin codigo compartido
  - Repositorio resultante seria >5GB
```

---

## 2. ESTRUCTURA ESTANDAR DE MONOREPO

### 2.1 Estructura Recomendada

```
proyecto-monorepo/
|-- apps/                    # Aplicaciones independientes deployables
|   |-- backend/             # API/Backend principal
|   |-- frontend/            # Aplicacion web/SPA
|   |-- mobile/              # Aplicacion movil (opcional)
|   `-- _MAP.md              # Mapa de aplicaciones
|
|-- packages/                # Codigo compartido (librerias internas)
|   |-- shared/              # Tipos, interfaces, DTOs compartidos
|   |-- types/               # Definiciones TypeScript
|   |-- utils/               # Utilidades comunes
|   `-- ui-components/       # Componentes UI reutilizables (si aplica)
|
|-- database/                # DDL y seeds
|   |-- ddl/                 # Scripts DDL ordenados (SSOT)
|   |-- seeds/
|   `-- archive/             # Scripts historicos (no ejecutables)
|
|-- docs/                    # Documentacion del proyecto
|   |-- api/
|   |-- architecture/
|   `-- guides/
|
|-- orchestration/           # Tareas y directivas locales
|   |-- tareas/
|   `-- inventarios/
|
|-- scripts/                 # Scripts de utilidad
|   |-- build.sh
|   |-- dev.sh
|   `-- test.sh
|
|-- config/                  # Configuraciones compartidas
|   |-- eslint/
|   |-- jest/
|   `-- typescript/
|
|-- package.json             # Root con workspaces definidos
|-- tsconfig.json            # Config TypeScript base
|-- .gitignore
`-- README.md
```

### 2.2 Variantes Aceptadas

```yaml
VARIANTE_APPS_DIRECTO:
  # Si solo hay backend/frontend sin mas apps
  proyecto/
    apps/
      backend/
      frontend/
      database/
    # Sin packages/ si el shared esta dentro de apps/

VARIANTE_CON_SERVICES:
  # Para microservicios
  proyecto/
    apps/
      api-gateway/
      service-auth/
      service-users/
      service-payments/
    packages/
      shared-types/
      shared-utils/
```

---

## 3. GESTION DE DEPENDENCIAS

### 3.1 NPM/Yarn/PNPM Workspaces

```json
// package.json raiz
{
  "name": "proyecto-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "lint": "npm run lint --workspaces",
    "test": "npm run test --workspaces",
    "dev:backend": "npm run dev --workspace=apps/backend",
    "dev:frontend": "npm run dev --workspace=apps/frontend"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### 3.2 Dependencias Compartidas vs Especificas

```yaml
DEPENDENCIAS_EN_ROOT:
  # Herramientas de desarrollo compartidas
  - typescript
  - eslint
  - prettier
  - jest
  - husky
  - lint-staged

DEPENDENCIAS_EN_CADA_APP:
  # Framework y librerias especificas
  backend:
    - @nestjs/core
    - typeorm
    - class-validator
  frontend:
    - react
    - react-dom
    - tailwindcss
    - axios

DEPENDENCIAS_EN_PACKAGES:
  # Solo las necesarias para la libreria
  shared-types:
    - Solo devDependencies (typescript)
  shared-utils:
    - lodash (si se usa)
```

### 3.3 Versionado Sincronizado

```yaml
ESTRATEGIA_VERSIONADO:
  opcion_a_version_unica:
    descripcion: "Todas las apps comparten version"
    uso: "Proyectos con deploy atomico"
    ejemplo: "v3.2.1 = backend + frontend + database"

  opcion_b_versiones_independientes:
    descripcion: "Cada app tiene su propia version"
    uso: "Microservicios con deploys independientes"
    ejemplo: "gateway v1.2.0, inference-engine v2.0.1"

RECOMENDACION:
  - Para SaaS monolitico: version unica
  - Para microservicios: versiones independientes
```

---

## 4. FLUJO DE TRABAJO

### 4.1 Commits Atomicos Multi-App

```bash
# CORRECTO: Cambio que afecta backend y shared types
git add apps/backend/src/users/users.dto.ts
git add packages/shared-types/src/user.interface.ts
git commit -m "[TASK-001] feat: Add user role to UserDTO

- Updated User interface in shared-types
- Updated UserDTO in backend to match
- Both apps use same type definition

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# INCORRECTO: Commits separados que rompen consistencia
git commit -m "Update backend"  # Backend roto hasta siguiente commit
git commit -m "Update shared"   # Ventana de inconsistencia
```

### 4.2 Orden de Build

```yaml
BUILD_ORDER:
  # Siempre construir dependencias primero
  1_packages:
    - packages/shared-types
    - packages/shared-utils
    - packages/ui-components

  2_apps:
    - apps/backend   # Puede correr en paralelo con frontend
    - apps/frontend  # Si no dependen entre si

SCRIPT_BUILD_ORDENADO:
  ```bash
  # scripts/build.sh
  #!/bin/bash
  set -e

  echo "Building packages..."
  npm run build --workspace=packages/shared-types
  npm run build --workspace=packages/shared-utils

  echo "Building apps..."
  npm run build --workspace=apps/backend &
  npm run build --workspace=apps/frontend &
  wait

  echo "Build complete"
  ```
```

### 4.3 Estrategia de Testing

```yaml
TESTING_POR_CAPA:
  unit_tests:
    ubicacion: "Dentro de cada app/package"
    comando: "npm run test --workspace=apps/backend"
    responsabilidad: "Testear logica interna"

  integration_tests:
    ubicacion: "apps/backend/test/integration"
    comando: "npm run test:e2e --workspace=apps/backend"
    responsabilidad: "Testear integracion DB, servicios"

  e2e_tests:
    ubicacion: "tests/ en root o apps/e2e"
    comando: "npm run test:e2e"
    responsabilidad: "Testear flujos completos backend+frontend"

EJECUCION_CI:
  # En CI, ejecutar en orden
  1. npm run lint --workspaces
  2. npm run build --workspaces
  3. npm run test --workspaces
  4. npm run test:e2e (si existe)
```

### 4.4 CI/CD Pipelines

```yaml
# .github/workflows/ci.yml
name: CI Monorepo

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build packages
        run: |
          npm run build --workspace=packages/shared-types
          npm run build --workspace=packages/shared-utils

      - name: Lint all
        run: npm run lint --workspaces

      - name: Test all
        run: npm run test --workspaces

      - name: Build apps
        run: |
          npm run build --workspace=apps/backend
          npm run build --workspace=apps/frontend
```

---

## 5. CASO: GAMILIT

### 5.1 Estructura Actual

```
gamilit/
|-- apps/
|   |-- backend/           # NestJS API
|   |   |-- src/
|   |   |   |-- modules/   # 22 modulos de negocio
|   |   |   |-- common/
|   |   |   `-- config/
|   |   |-- test/
|   |   `-- package.json
|   |
|   |-- frontend/          # React + Vite
|   |   |-- src/
|   |   |   |-- components/  # 474 componentes
|   |   |   |-- pages/
|   |   |   |-- hooks/
|   |   |   `-- services/
|   |   `-- package.json
|   |
|   |-- database/          # DDL PostgreSQL
|   |   |-- ddl/
|   |   `-- seeds/
|   |
|   |-- devops/            # Configuraciones de deploy
|   `-- _MAP.md            # Documentacion de estructura
|
|-- docs/                  # Documentacion del proyecto
|-- orchestration/         # Tareas locales
|-- scripts/               # Scripts de utilidad
|-- package.json           # Root workspaces
`-- README.md
```

### 5.2 Metricas del Proyecto

```yaml
BACKEND_NESTJS:
  modulos: 22
  entidades: 152
  controladores: 107
  servicios: 170
  lineas_codigo: ~50000

FRONTEND_REACT:
  componentes: 475
  paginas: 68
  hooks_custom: 102
  servicios_api: 52
  lineas_codigo: ~120000

DATABASE_POSTGRESQL:
  tablas: 169
  indices: 200+
  funciones: 183
  triggers: 67
```

### 5.3 Flujo de Desarrollo en Gamilit

```bash
# 1. Actualizar desde remoto
git fetch origin && git pull origin master

# 2. Desarrollo
# Modificar backend
vim apps/backend/src/modules/users/users.service.ts

# Modificar frontend que depende del cambio
vim apps/frontend/src/services/userService.ts

# 3. Validar
npm run build --workspace=apps/backend
npm run build --workspace=apps/frontend
npm run lint --workspaces

# 4. Commit atomico
git add apps/backend apps/frontend
git commit -m "[GAM-XXX] feat: Add user preferences endpoint

- Backend: new endpoint GET /users/:id/preferences
- Frontend: integrate preferences in user profile

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# 5. Push
git push origin master
```

---

## 6. CHECKLIST DE VALIDACION

### 6.1 Antes de Crear Monorepo

```markdown
[ ] Evaluar si monorepo es la estructura correcta
[ ] Definir estructura de directorios (apps/, packages/)
[ ] Configurar workspaces en package.json
[ ] Crear tsconfig.json base con paths
[ ] Configurar eslint/prettier compartido
[ ] Documentar estructura en README.md
[ ] Crear scripts de build ordenado
```

### 6.2 Durante Desarrollo

```markdown
[ ] Cambios que afectan multiples apps en commit atomico
[ ] Build de packages antes que apps
[ ] Lint pasa en todos los workspaces
[ ] Tests pasan en workspaces afectados
[ ] No hay dependencias circulares
[ ] Tipos compartidos actualizados si cambia API
```

### 6.3 Al Hacer Commit/Push

```markdown
[ ] git fetch origin ejecutado
[ ] Todos los archivos relacionados en mismo commit
[ ] Build completo pasa: npm run build --workspaces
[ ] Lint completo pasa: npm run lint --workspaces
[ ] Mensaje de commit describe cambio en todas las apps afectadas
[ ] Push completado
```

---

## 7. ANTI-PATRONES A EVITAR

### 7.1 Dependencias Circulares

```yaml
PROBLEMA:
  # packages/a depende de packages/b
  # packages/b depende de packages/a
  # Resultado: build falla o comportamiento impredecible

SOLUCION:
  - Extraer codigo comun a packages/shared
  - Invertir dependencia usando interfaces
  - Refactorizar para eliminar ciclo
```

### 7.2 Builds Lentos

```yaml
PROBLEMA:
  # Build de todo el monorepo toma 10+ minutos
  # CI se vuelve cuello de botella

SOLUCIONES:
  - Usar cache de node_modules entre builds
  - Build incremental (solo lo que cambio)
  - Paralelizar builds independientes
  - Considerar herramientas como Nx o Turborepo
```

### 7.3 Acoplamiento Excesivo

```yaml
PROBLEMA:
  # Cambio en backend SIEMPRE requiere cambio en frontend
  # No se puede deployar uno sin el otro
  # Tests de backend fallan sin frontend corriendo

SOLUCIONES:
  - Definir contratos/interfaces claros (API contracts)
  - Tests unitarios que no dependen de otros servicios
  - Mocks para dependencias externas
  - Evaluar si deberia ser polyrepo
```

### 7.4 Monorepo Gigante

```yaml
PROBLEMA:
  # Repositorio >5GB
  # git clone toma minutos
  # IDE se vuelve lento

SOLUCIONES:
  - git sparse-checkout para clonar solo lo necesario
  - Mover assets grandes a LFS o CDN
  - Evaluar division en multiples monorepos
  - Limpiar historial si tiene binarios grandes
```

### 7.5 Ignorar Orden de Build

```yaml
PROBLEMA:
  # npm run build --workspaces falla intermitentemente
  # A veces funciona, a veces no

CAUSA:
  - Packages se construyen en orden aleatorio
  - App se construye antes que sus dependencias

SOLUCION:
  - Script de build explicito con orden
  - Usar --if-present para scripts opcionales
  - Herramientas que detectan dependencias (Nx, Turborepo)
```

---

## 8. REFERENCIAS

| Alias | Documento |
|-------|-----------|
| @SIMCO-GIT | orchestration/directivas/simco/SIMCO-GIT.md |
| @CAPVED | orchestration/directivas/principios/PRINCIPIO-CAPVED.md |
| @SIMCO-VALIDAR | orchestration/directivas/simco/SIMCO-VALIDAR.md |

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Directiva Normativa
