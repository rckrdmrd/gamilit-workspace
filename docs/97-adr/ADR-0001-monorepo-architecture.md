# ADR-0001: Adopción de Arquitectura Monorepo

**Status:** ✅ Accepted
**Date:** 2025-11-01
**Deciders:** Tech Lead, Backend Team, Frontend Team
**Tags:** architecture, repository-structure, devops

---

## Context

### Situación Inicial

GAMILIT Platform originalmente estaba organizado en **4 repositorios separados**:

1. **gamilit-docs** (~2,000 archivos markdown)
   - Documentación del proyecto
   - Especificaciones técnicas
   - ADRs y RFCs
   - Guías de desarrollo

2. **gamilit-platform-backend** (~400 archivos TypeScript)
   - API REST NestJS
   - 13 módulos funcionales
   - ~470 endpoints

3. **gamilit-platform-web** (~200 archivos TSX)
   - Frontend React 19
   - 33 mecánicas educativas
   - 180+ componentes

4. **gamilit-deployment-scripts** (~50 archivos shell/yaml)
   - Scripts de deployment
   - Configuración PM2
   - Workflows CI/CD

### Problemas Identificados

#### 1. Sincronización Manual Compleja

- **Cambios cross-repo:** Una feature que afectaba backend + frontend requería:
  - 2 PRs separados en repos diferentes
  - Coordinación manual de merges
  - Riesgo de desincronización (backend mergeado pero frontend no)

- **Ejemplo real:** Agregar nuevo endpoint `/api/v1/gamification/achievements`
  - Paso 1: PR en backend (crear endpoint)
  - Paso 2: PR en frontend (consumir endpoint)
  - **Problema:** Si frontend se mergea antes que backend → 404 errors en production

#### 2. Gestión de Versiones Fragmentada

- **4 sistemas de versionado independientes**
  - Backend: v1.5.3
  - Frontend: v2.1.0
  - Docs: Sin versiones
  - Scripts: Sin versiones

- **Problema:** Imposible saber qué versión de frontend es compatible con qué versión de backend

#### 3. Duplicación de Configuración

```
gamilit-platform-backend/
├── .eslintrc.js          # Config ESLint
├── .prettierrc           # Config Prettier
├── tsconfig.json         # Config TypeScript
└── .github/workflows/    # CI/CD

gamilit-platform-web/
├── .eslintrc.js          # ❌ DUPLICADO
├── .prettierrc           # ❌ DUPLICADO
├── tsconfig.json         # ❌ DUPLICADO
└── .github/workflows/    # ❌ DUPLICADO
```

**Impacto:**
- Cambiar regla de linting → Editar 2 archivos
- Actualizar workflow CI → Editar 2 archivos
- Riesgo de inconsistencias

#### 4. Onboarding Complejo

Nuevo desarrollador debe:
1. Clonar 4 repositorios diferentes
2. Setup de 4 entornos independientes
3. Configurar 4 .env files
4. Ejecutar 4 comandos de install separados
5. Coordinar 4 workflows de Git

**Tiempo de onboarding:** 4-6 horas (vs. 2-3 horas con monorepo)

#### 5. Búsqueda Global Imposible

- **Imposible buscar en todo el codebase** con un solo comando
- Buscar "ML_COINS" requería:
  ```bash
  cd gamilit-platform-backend && grep -r "ML_COINS" .
  cd ../gamilit-platform-web && grep -r "ML_COINS" .
  cd ../gamilit-docs && grep -r "ML_COINS" .
  ```

#### 6. Refactoring Cross-Repo Riesgoso

**Ejemplo:** Renombrar `mlCoins` → `ml_coins` en toda la plataforma

Con repos separados:
1. ✅ Refactor backend (PR #123)
2. ✅ Refactor frontend (PR #456)
3. ❌ **Problema:** Entre merges, producción está rota

Con monorepo:
1. ✅ Refactor backend + frontend + docs en **1 PR atómico**
2. ✅ Tests CI validan ambos lados antes de merge

---

## Decision

**Adoptamos arquitectura de Monorepo** consolidando los 4 repos en una estructura unificada.

### Estructura Elegida

```
gamilit/projects/gamilit/
├── apps/                      # Código de aplicaciones
│   ├── backend/               # NestJS backend
│   ├── frontend/              # React frontend
│   ├── database/              # PostgreSQL DDL/migrations
│   └── devops/                # Scripts DevOps
│
├── docs/                      # Documentación
│   ├── 00-overview/
│   ├── 01-requerimientos/
│   ├── 02-especificaciones-tecnicas/
│   ├── 03-desarrollo/
│   ├── 04-planificacion/
│   ├── QUICK-REFERENCE/
│   ├── adr/                   # Architecture Decision Records
│   └── standards/             # Estándares de código
│
├── orchestration/             # Orquestación de agentes IA
│   ├── 01-analisis/
│   ├── 02-planes/
│   ├── 03-subagentes/
│   ├── 04-logs/
│   └── 05-validaciones/
│
├── artifacts/                 # Artefactos generados
│   ├── diagrams/
│   ├── changelogs/
│   └── reports/
│
├── package.json               # Root package.json
├── .eslintrc.js               # Shared ESLint config
├── .prettierrc                # Shared Prettier config
├── tsconfig.json              # Base TypeScript config
└── .github/                   # Single CI/CD workflow
    └── workflows/
```

### Principios Aplicados

1. **Single Source of Truth**
   - Un solo repo → Una sola fuente de verdad
   - Una sola versión del proyecto

2. **Atomic Changes**
   - Cambios cross-app en un solo commit
   - Tests CI validan toda la plataforma antes de merge

3. **Shared Tooling**
   - Configuraciones compartidas (ESLint, Prettier, TS)
   - Scripts compartidos (build, test, deploy)

4. **Clear Boundaries**
   - Carpetas separadas por propósito (`apps/`, `docs/`, `orchestration/`)
   - Cada app mantiene su independencia dentro del monorepo

---

## Alternatives Considered

### Alternativa 1: Mantener Repos Separados

**Pros:**
- ✅ Repos más pequeños (menos commits/history)
- ✅ Permisos granulares por repo
- ✅ CI/CD más rápido (solo testea repo modificado)

**Cons:**
- ❌ Sincronización manual compleja
- ❌ Refactoring cross-repo riesgoso
- ❌ Duplicación de configuración
- ❌ Onboarding complejo

**Decisión:** **Rechazada** - Los cons superan los pros

---

### Alternativa 2: Monorepo con Workspaces (Lerna/Nx)

**Pros:**
- ✅ Herramientas especializadas (Nx, Lerna, Turborepo)
- ✅ Build caching inteligente
- ✅ Dependency graph management
- ✅ Soporte para shared packages

**Cons:**
- ❌ Complejidad adicional de setup
- ❌ Learning curve de Nx/Lerna
- ❌ Overhead para proyecto pequeño-mediano (2 apps)

**Decisión:** **Pospuesta para Fase 2** - Consideraremos Nx cuando tengamos 5+ apps

---

### Alternativa 3: Monorepo Simple (RFC-0001)

**Pros:**
- ✅ Setup simple sin herramientas adicionales
- ✅ Estructura clara basada en carpetas
- ✅ Fácil de entender y mantener
- ✅ Suficiente para 2-3 apps

**Cons:**
- ⚠️ Sin build caching automático
- ⚠️ CI/CD debe testear todo siempre

**Decisión:** **✅ ELEGIDA** - Balance perfecto simplicidad/funcionalidad

---

## Consequences

### Positivas ✅

#### 1. Cambios Atómicos Cross-App

**Antes:**
```bash
# 2 PRs separados
cd gamilit-platform-backend
git checkout -b feature/new-endpoint
# ... hacer cambios ...
git push # PR #123

cd ../gamilit-platform-web
git checkout -b feature/consume-endpoint
# ... hacer cambios ...
git push # PR #456
```

**Ahora:**
```bash
# 1 PR atómico
cd gamilit/projects/gamilit
git checkout -b feature/new-endpoint
# Editar apps/backend/ y apps/frontend/
git add apps/backend apps/frontend
git commit -m "feat: add achievements endpoint + UI"
git push # PR único, tests validan ambos lados
```

#### 2. Búsqueda Global

```bash
# Buscar en TODO el codebase
grep -r "ML_COINS" .

# Buscar solo en código
grep -r "ML_COINS" apps/

# Buscar solo en docs
grep -r "ML_COINS" docs/
```

#### 3. Refactoring Seguro

**Ejemplo:** Renombrar constante

```bash
# 1. Buscar todas las ocurrencias
grep -r "OLD_NAME" apps/

# 2. Reemplazar en todo el monorepo
find apps/ -type f -exec sed -i 's/OLD_NAME/NEW_NAME/g' {} +

# 3. Commit atómico
git add apps/
git commit -m "refactor: rename OLD_NAME to NEW_NAME across platform"

# 4. CI testa backend + frontend juntos
# Si algo falla, el commit no se mergea
```

#### 4. Configuración Compartida

**Un solo .eslintrc.js:**
```json
{
  "extends": ["../../.eslintrc.js"],  // Hereda config root
  "rules": {
    // Overrides específicos si necesario
  }
}
```

**Beneficio:** Cambiar regla de linting → Editar 1 archivo, afecta todo el repo

#### 5. Onboarding Simplificado

**Antes (4 repos):**
```bash
git clone repo1 && cd repo1 && npm install
git clone repo2 && cd repo2 && npm install
git clone repo3 && cd repo3 && npm install
git clone repo4 && cd repo4 && npm install
```

**Ahora (monorepo):**
```bash
git clone gamilit
cd gamilit/projects/gamilit
npm install  # Install root + workspaces
npm run dev  # Start todo
```

#### 6. Versionado Unificado

**Un solo package.json root:**
```json
{
  "name": "gamilit-monorepo",
  "version": "2.0.0",  // Version única del proyecto
  "workspaces": [
    "apps/backend",
    "apps/frontend"
  ]
}
```

### Negativas ⚠️

#### 1. Repo Más Grande

**Tamaño total:** ~130 MB (vs. 4 repos de ~30 MB cada uno)

**Mitigación:**
- Git LFS para archivos grandes
- .gitignore agresivo (node_modules, dist, logs)
- Shallow clones en CI: `git clone --depth 1`

#### 2. CI/CD Más Lento

**Problema:** Cambio en frontend → CI testea también backend (innecesario)

**Mitigación (Fase 2):**
```yaml
# .github/workflows/ci.yml
- name: Check changes
  run: |
    if git diff --name-only HEAD~1 | grep "^apps/backend"; then
      echo "Backend changed, run backend tests"
    fi
```

#### 3. Permisos Menos Granulares

**Problema:** No se puede dar acceso solo a "docs" sin dar acceso a "apps"

**Mitigación:**
- Branch protection rules
- CODEOWNERS file:
  ```
  /apps/backend/     @backend-team
  /apps/frontend/    @frontend-team
  /docs/             @tech-writer @tech-lead
  ```

#### 4. Git History Más Complejo

**Problema:** `git log` muestra commits de todas las apps mezclados

**Mitigación:**
```bash
# Ver solo commits de backend
git log -- apps/backend/

# Ver solo commits de frontend
git log -- apps/frontend/

# Conventional commits ayudan a filtrar
git log --grep="^feat(backend)"
```

---

## Implementation Plan

### Fase 1: Migración (✅ Completada - 2025-11-01)

- [x] Crear estructura RFC-0001
- [x] Migrar gamilit-docs → `docs/`
- [x] Migrar gamilit-platform-backend → `apps/backend/`
- [x] Migrar gamilit-platform-web → `apps/frontend/`
- [x] Migrar gamilit-deployment-scripts → `apps/devops/`
- [x] Setup de workspaces en root package.json
- [x] Compartir configs (ESLint, Prettier, TS)
- [x] Actualizar CI/CD workflows

### Fase 2: Optimización (Planeada - Q1 2025)

- [ ] Evaluar Nx/Turborepo para caching
- [ ] Implementar selective CI (solo testear apps modificadas)
- [ ] Setup de Git LFS para assets grandes
- [ ] Mejorar CODEOWNERS granularity

---

## Metrics

### Before (4 Repos)

| Métrica | Valor |
|---------|-------|
| **Repos totales** | 4 |
| **Tiempo onboarding** | 4-6 horas |
| **PRs para cambio cross-app** | 2-4 PRs |
| **Riesgo de desincronización** | Alto |
| **Búsqueda global** | Imposible |
| **Config duplicada** | Sí (4x) |

### After (Monorepo)

| Métrica | Valor |
|---------|-------|
| **Repos totales** | 1 |
| **Tiempo onboarding** | 2-3 horas ✅ |
| **PRs para cambio cross-app** | 1 PR ✅ |
| **Riesgo de desincronización** | Bajo ✅ |
| **Búsqueda global** | `grep -r` ✅ |
| **Config duplicada** | No ✅ |

---

## Lessons Learned

### ✅ Qué funcionó bien

1. **Migración gradual:** Migrar un repo a la vez en sprints separados redujo riesgo
2. **RFC-0001 como guía:** Tener estructura definida antes de migrar fue clave
3. **Conventional commits:** Ayudaron a mantener history limpio durante migración
4. **CODEOWNERS:** Permitió mantener ownership claro post-migración

### ⚠️ Qué mejorar

1. **CI time:** Actualmente testa todo siempre, necesitamos selective testing
2. **Docs discovery:** Con 2,000+ archivos, navigation puede ser compleja → SIMCO helps
3. **Build scripts:** Necesitamos scripts de build más inteligentes

---

## References

- [RFC-0001: Estructura de Monorepo](../standards/RFC-0001-monorepo-structure.md)
- [Monorepos in Git (Martin Fowler)](https://martinfowler.com/bliki/MonorepoPattern.html)
- [Why Google Stores Billions of Lines in a Single Repository](https://cacm.acm.org/magazines/2016/7/204032-why-google-stores-billions-of-lines-of-code-in-a-single-repository/fulltext)
- [Monorepo Tools: Lerna, Nx, Turborepo Comparison](https://monorepo.tools/)

---

**Status:** ✅ Accepted and Implemented
**Date Created:** 2025-11-01
**Last Updated:** 2025-11-07
**Supersedes:** N/A (primera ADR)
**Superseded by:** N/A

**Revisión:** Esta decisión se revisará en Q2 2025 para evaluar migración a Nx/Turborepo si el proyecto crece a 5+ apps.
