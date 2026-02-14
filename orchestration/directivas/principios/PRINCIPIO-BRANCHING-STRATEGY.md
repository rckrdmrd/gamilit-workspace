---
version: "1.0.0"
created: "2026-02-11"
updated: "2026-02-11"
tipo: ssot-normativo
nivel: 3-completo
es_ssot: true
references:
  - orchestration/directivas/simco/SIMCO-GIT.md
  - orchestration/directivas/simco/SIMCO-GIT-WORKFLOW.md
  - orchestration/directivas/principios/PRINCIPIO-CAPVED.md
  - docs/40-standards/ESTANDAR-GIT.md
  - CLAUDE.md (RC1, RC4)
aliases:
  - "@BRANCHING-STRATEGY"
  - "@TRUNK-BASED"
  - "@MAIN-BRANCH"
---

# PRINCIPIO: Estrategia de Branching

**Version:** 1.0.0
**Fecha:** 2026-02-11
**Tipo:** Principio Fundamental - HERENCIA OBLIGATORIA - **SSOT**
**Aplica a:** TODOS los agentes sin excepcion
**Alias:** @BRANCHING-STRATEGY, @TRUNK-BASED

---

## INTRODUCCION

### Por que es necesaria una estrategia de branching

```
+==============================================================================+
|                                                                              |
|   gamilit es un MONOREPO STANDALONE con 22 modulos, 899 endpoints           |
|   y 4 portales activos en produccion.                                       |
|                                                                              |
|   Sin una estrategia clara de branching:                                    |
|                                                                              |
|   - Los agentes IA crean branches innecesarios                              |
|   - El historial se vuelve inmanejable                                      |
|   - Los merge conflicts se multiplican                                      |
|   - El trabajo de multiples agentes se descoordina                          |
|   - El deploy a produccion se complica                                      |
|                                                                              |
|   SOLUCION: Trunk-Based Development con commits directos a main             |
|                                                                              |
+==============================================================================+
```

### Beneficios de esta estrategia

| Beneficio | Descripcion |
|-----------|-------------|
| Simplicidad | Un branch principal, menos complejidad |
| Integracion continua | Cambios pequenos integrados frecuentemente |
| Menos conflictos | Menos divergencia = menos merge conflicts |
| Trazabilidad | Historial lineal y facil de seguir |
| Deploy rapido | main siempre deployable a produccion |
| Coordinacion | Agentes trabajan sobre la misma base |

---

## ESTRATEGIA PRINCIPAL: Trunk-Based Development

### Concepto Base

```
+==============================================================================+
|                                                                              |
|   TRUNK-BASED DEVELOPMENT                                                    |
|                                                                              |
|   "Todos los desarrolladores trabajan sobre un unico branch principal       |
|    (main). Los feature branches, si existen, son de muy corta duracion      |
|    (< 1 dia) y se integran frecuentemente."                                 |
|                                                                              |
|   master ----*----*----*----*----*----*----*----*----*---> tiempo             |
|              ^      ^      ^      ^      ^                                   |
|              |      |      |      |      |                                   |
|           commit commit commit commit commit                                 |
|                                                                              |
+==============================================================================+
```

### Principios Fundamentales

```yaml
PRINCIPIOS_TRUNK_BASED:
  master_es_la_verdad:
    - master es SIEMPRE deployable (produccion activa)
    - Todos los cambios se integran a master
    - No hay branches de larga duracion
    - Build y tests deben pasar antes de push

  commits_directos_permitidos:
    - Cambios pequenos (< 50 lineas)
    - Fixes menores
    - Actualizacion de documentacion
    - Tareas que se completan en < 2 horas
    - Hotfixes de produccion

  feature_branches_cuando:
    - Cambio grande (> 200 lineas)
    - Cambio que requiere revision
    - Trabajo experimental o spike
    - Refactor arquitectonico
    - DURACION MAXIMA: 1 dia laboral

  integracion_frecuente:
    - Push al menos cada 2 horas
    - Commits atomicos y frecuentes
    - No acumular trabajo sin pushear
    - Validar build antes de cada push
```

### Flujo Tipico

```
TAREA PEQUENA (< 50 lineas, < 2h):
+-----------------------------------------------------------------------+
|  1. git fetch origin && git pull                                       |
|  2. Hacer cambios en master                                            |
|  3. npm run build && npm run lint (backend o frontend)                 |
|  4. git add {archivos especificos}                                     |
|  5. git commit -m "[GAM-XXX] tipo: descripcion"                        |
|  6. git push origin master                                               |
+-----------------------------------------------------------------------+

TAREA GRANDE (> 50 lineas, >= 2h):
+-----------------------------------------------------------------------+
|  1. git fetch origin && git pull                                       |
|  2. git checkout -b feature/{ticket}-{desc}                            |
|  3. Hacer cambios incrementales con commits frecuentes                 |
|  4. npm run build && npm run lint                                      |
|  5. Al completar: git checkout master && git pull                      |
|  6. git merge feature/{ticket}-{desc}                                  |
|  7. npm run build && npm run lint (verificar merge)                    |
|  8. git push origin master                                             |
|  9. git branch -d feature/{ticket}-{desc}                              |
+-----------------------------------------------------------------------+

HOTFIX DE PRODUCCION (urgente):
+-----------------------------------------------------------------------+
|  1. git fetch origin && git pull                                       |
|  2. Hacer cambio directo en main                                       |
|  3. npm run build && npm run lint                                      |
|  4. git commit -m "[GAM-HOTFIX] fix: descripcion urgente"              |
|  5. git push origin master                                             |
|  6. Deploy inmediato: SSH a servidor -> pull -> build -> pm2 restart   |
+-----------------------------------------------------------------------+
```

---

## CONVENCIONES DE NOMBRES

### Branch Principal

| Branch | Proposito | Uso |
|--------|-----------|-----|
| `master` | Produccion y desarrollo activo | Branch por defecto, siempre deployable |

**Nota:** gamilit usa `master` como branch principal. Este es el branch activo del repositorio.

### Feature Branches (corta duracion)

```yaml
PATRON: {tipo}/{ticket}-{descripcion-corta}

TIPOS:
  feature:  Nueva funcionalidad
  fix:      Correccion de bug
  hotfix:   Correccion urgente de produccion
  refactor: Mejora de codigo sin cambio funcional
  docs:     Solo documentacion
  spike:    Investigacion/prototipo
  test:     Solo tests

EJEMPLOS:
  - feature/GAM-042-tabla-projects
  - fix/GAM-015-validacion-duplicados
  - hotfix/GAM-SEC-001-xss-injection
  - refactor/GAM-008-extract-components
  - docs/GAM-001-actualizar-readme
  - spike/GAM-ML-003-evaluar-nlp
  - test/GAM-020-coverage-analytics

REGLAS:
  - Todo en minusculas
  - Usar guiones, no underscores
  - Maximo 50 caracteres
  - Incluir SIEMPRE el ticket/tarea con prefijo GAM-
  - Descripcion corta y clara
```

### Convencion de Commits

```
[{TAREA-ID}] {tipo}: {descripcion}

PREFIJOS VALIDOS:
  GAM-XXX:    Tareas de desarrollo (features, fixes)
  GAM-DB:     Cambios de base de datos (DDL, migrations)
  GAM-BE:     Backend especifico
  GAM-FE:     Frontend especifico
  GAM-DOCS:   Documentacion
  GAM-DEPLOY: Deploy y configuracion
  GAM-HOTFIX: Fixes urgentes de produccion
  GAM-REFACTOR: Refactorizacion
  GAM-TEST:   Tests

TIPOS DE COMMIT:
  feat:     Nueva funcionalidad
  fix:      Correccion de bug
  refactor: Refactorizacion sin cambio funcional
  docs:     Solo documentacion
  test:     Solo tests
  chore:    Mantenimiento, dependencias
  perf:     Mejora de rendimiento
  style:    Formato, lint
  build:    Cambios en build/deploy

EJEMPLOS:
  [GAM-DB-042] feat: Crear tabla projects con geometria PostGIS
  [GAM-BE-015] fix: Corregir validacion de codigo unico en modules
  [GAM-FE-023] feat: Agregar modal de confirmacion en dashboard
  [GAM-DOCS] docs: Actualizar CLAUDE.md con nuevos endpoints
  [GAM-HOTFIX] fix: Corregir XSS en input de estudiantes
  [GAM-DEPLOY] chore: Actualizar ecosystem.config.js para PM2
  [GAM-REFACTOR] refactor: Extraer utilidades de auth a core
  [GAM-TEST] test: Agregar coverage para gamification module

CO-AUTHORED-BY (cuando aplique):
  [GAM-XXX] feat: Descripcion

  Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## FLUJO PARA AGENTES IA

### Regla Principal

```
+==============================================================================+
|                                                                              |
|   AGENTES IA: TRABAJAR SIEMPRE EN MASTER (Trunk-Based)                      |
|                                                                              |
|   Los agentes IA NO deben crear feature branches a menos que:               |
|   - El usuario lo solicite explicitamente                                   |
|   - La tarea requiera mas de 1 dia de trabajo                               |
|   - Se necesite revision antes de integrar                                  |
|   - Sea un refactor arquitectonico significativo                            |
|                                                                              |
|   Por defecto: commits directos a master con push inmediato                 |
|                                                                              |
+==============================================================================+
```

### Protocolo Obligatorio (RC1 + RC4)

```yaml
ANTES_DE_CADA_OPERACION:
  # RC1: Fetch obligatorio
  - git fetch origin
  - git log HEAD..origin/master --oneline
  - Si hay output: git pull
  - git status
  - Verificar branch actual: master

DESPUES_DE_CADA_TAREA:
  # RC4: Commit + Push obligatorio (monorepo)
  - git add {archivos especificos}  # NUNCA "git add -A" o "git add ."
  - git commit -m "[GAM-XXX] tipo: descripcion"
  - git push origin master
  - Verificar: git status = "working tree clean"
  - Verificar: git log origin/master..HEAD = vacio (todo pusheado)

VALIDACION_PRE_COMMIT:
  backend:
    - cd apps/backend && npm run build && npm run lint
  frontend:
    - cd apps/frontend && npm run build && npm run lint && npm run typecheck
  database:
    - Validar sintaxis SQL si hay cambios DDL
    - Documentar cambios en MASTER_INVENTORY.yml
```

### Reglas Especificas para Agentes

```yaml
COMMITS:
  - Atomicos: un cambio logico por commit
  - Frecuentes: cada 30-45 minutos maximo
  - Funcionales: build debe pasar
  - Descriptivos: mensaje con [GAM-XXX] y tipo
  - Especificos: agregar archivos por nombre, NO usar "git add ."
  - Coherentes: mantener sincronizacion DDL -> Entity -> Endpoints

BRANCHES:
  - NO crear sin autorizacion explicita del usuario
  - Si se crea: duracion maxima 1 dia
  - Nombrar con convencion: {tipo}/{GAM-XXX}-{desc}
  - Eliminar inmediatamente despues de merge
  - NUNCA dejar branches huerfanos

PROHIBIDO:
  - git push --force (sin autorizacion explicita)
  - git reset --hard origin/master (destructivo)
  - Crear branches de larga duracion
  - Dejar trabajo sin push al finalizar sesion
  - git add -A o git add . (puede incluir secretos/.env)
  - Commits vacios o sin validacion

MONOREPO_WORKFLOW:
  descripcion: "TODO el codigo en mismo repo GitHub"
  estructura:
    - apps/backend  (NestJS 11)
    - apps/frontend (React 19)
    - apps/database (PostgreSQL 15 DDL)
    - apps/devops   (Scripts deploy)
  remoto: "git@github.com:rckrdmrd/gamilit-workspace.git"
  branch_principal: "master"
  NO_usar:
    - git submodule (no aplica, es monorepo)
    - workflow de multi-repo
    - commits separados por subdirectorio
```

---

## FLUJO DE DEPLOY A PRODUCCION

### Ambiente de Produccion

```yaml
SERVIDOR: 74.208.126.102
USUARIO: isem
REPOSITORIO: git@github.com:rckrdmrd/gamilit-workspace.git
BRANCH: master

SERVICIOS:
  backend:
    puerto: 3006
    proceso: PM2 fork mode
    build: "npm install && npm run build"
    restart: "pm2 restart gamilit-backend"

  frontend:
    puerto: 3005
    proceso: PM2 fork mode
    build: "npm install && npm run build"
    restart: "pm2 restart gamilit-frontend"

NGINX:
  proxy: "443 -> backend:3006, frontend:3005"
  ssl: "Certbot (Let's Encrypt)"
```

### Workflow de Deploy

```bash
# 1. Push a master (dev local)
git add {archivos}
git commit -m "[GAM-DEPLOY] tipo: descripcion"
git push origin master

# 2. SSH a servidor
ssh isem@74.208.126.102

# 3. Pull cambios
cd ~/gamilit-workspace
git fetch origin && git pull origin master

# 4. Backup DB (si hay cambios DDL)
pg_dump -U gamilit_user -d gamilit_platform > backup_$(date +%F).sql

# 5. Build (backend y frontend)
cd apps/backend && npm install && npm run build
cd ../frontend && npm install && npm run build

# 6. Restart PM2
pm2 restart ecosystem.config.js

# 7. Smoke tests
curl https://74.208.126.102/api/health
curl https://74.208.126.102/

# 8. Verificar logs
pm2 logs gamilit-backend --lines 50
pm2 logs gamilit-frontend --lines 50
```

Ver: `@PERFIL-DEPLOY` para workflow completo automatizado.

---

## CASOS ESPECIALES

### Release Tags

```yaml
ESTRATEGIA_TAGS:
  patron: "v{major}.{minor}.{patch}"
  ejemplos:
    - v1.0.0  (MVP inicial)
    - v1.1.0  (nuevo modulo)
    - v1.1.1  (bugfix)

  cuando_crear:
    - Milestone completado
    - Deploy mayor a produccion
    - Version estable verificada

  proceso:
    - git tag -a v1.0.0 -m "Release MVP 1.0.0"
    - git push origin v1.0.0
    - Documentar en CHANGELOG.md
```

### Pull Requests (opcional)

```yaml
USO_DE_PRS:
  descripcion: "Opcional para gamilit (trunk-based por defecto)"
  cuando_usar:
    - Cambios arquitectonicos mayores
    - Refactor de multiples modulos
    - Usuario solicita revision explicita

  proceso:
    - Crear feature branch
    - Push a GitHub
    - gh pr create --title "titulo" --body "descripcion"
    - Revision (manual o CI)
    - Merge a master
    - Eliminar branch

  NO_obligatorio: "Por defecto commits directos a master"
```

### Rollback de Emergencia

```bash
# Si un push a main rompe produccion:

# 1. Identificar commit problematico
git log --oneline -n 10

# 2. Revert (NO reset)
git revert {commit-hash}
git push origin master

# 3. Deploy rollback
ssh isem@74.208.126.102
cd ~/gamilit-workspace
git pull origin master
npm run build && pm2 restart ecosystem.config.js

# 4. Documentar incidente
# Crear TASK en orchestration/work-items/
```

---

## CHECKLIST DE VERIFICACION

### Antes de Iniciar Trabajo

```markdown
[ ] git fetch origin ejecutado
[ ] git log HEAD..origin/master revisado (si hay output, hacer pull)
[ ] git status muestra "On branch master" y working tree clean
[ ] Branch actual verificado: git branch --show-current = master
[ ] Validar contexto: revisar PROJECT-CONTEXT.md y PROXIMA-ACCION.md
```

### Durante el Trabajo

```markdown
[ ] Commits atomicos cada cambio logico
[ ] Build pasa antes de cada commit (npm run build && npm run lint)
[ ] Mensajes siguen formato: [GAM-XXX] tipo: descripcion
[ ] Push realizado (no acumular mas de 2h de trabajo)
[ ] Archivos agregados especificamente (NO "git add .")
[ ] Validar coherencia DDL -> Entity -> Endpoints si aplica
```

### Al Finalizar Tarea

```markdown
[ ] Todos los archivos commiteados
[ ] Push realizado a origin master
[ ] git status muestra "working tree clean"
[ ] git log origin/master..HEAD esta vacio (todo pusheado)
[ ] Build final exitoso (backend + frontend)
[ ] Tests pasan (npm run test)
[ ] Inventarios actualizados (MASTER_INVENTORY.yml si aplica)
[ ] PROXIMA-ACCION.md actualizado
[ ] Documentacion actualizada (si aplica)
```

### Verificacion de Branch Correcto

```bash
# Verificar branch actual
git branch --show-current
# Esperado: master

# Verificar que no hay branches olvidados
git branch -a
# Solo debe haber master (y remotes/origin/master)

# Verificar tracking correcto
git branch -vv
# Debe mostrar [origin/master] para el branch local

# Verificar estado remoto
git log origin/master..HEAD
# Debe estar vacio (todo pusheado)
```

---

## DIAGRAMA DE DECISION

```
+----------------------+
| Inicio de tarea      |
+----------+-----------+
           |
           v
+----------+-----------+
| git fetch && pull    |
+----------+-----------+
           |
           v
+----------+-----------+
| Tarea < 2h y         |
| < 50 lineas?         |
+----------+-----------+
     |           |
    SI          NO
     |           |
     v           v
+---------+  +------------------+
| Trabajar|  | Usuario autorizo |
| en      |  | feature branch?  |
| master  |  +--------+---------+
+---------+       |         |
     |           SI        NO
     |            |         |
     |            v         v
     |       +----------+  +----------+
     |       | Crear    |  | Trabajar |
     |       | feature/ |  | en       |
     |       | GAM-XXX  |  | master   |
     |       +----+-----+  | de todas |
     |            |        | formas   |
     |            |        +----+-----+
     |            |             |
     v            v             v
+----------+-----------+-----------+
| Build && Lint                    |
+----------+-----------+-----------+
           |
           v
+----------+-----------+
| Commit + Push master |
| (merge si hubo br.)  |
+----------+-----------+
           |
           v
+----------+-----------+
| Verificar estado OK  |
| (RC1 + RC4)          |
+----------------------+
```

---

## ERRORES COMUNES Y SOLUCIONES

| Error | Consecuencia | Solucion |
|-------|--------------|----------|
| Crear branch sin necesidad | Complejidad innecesaria | Trabajar en master por defecto |
| Feature branch > 1 dia | Merge conflicts | Integrar frecuentemente |
| No hacer push al terminar | Trabajo perdido/desincronizado | Push obligatorio (RC4) |
| No verificar fetch antes | Estado desactualizado | Fetch obligatorio (RC1) |
| git add . o git add -A | Puede incluir .env, secretos | Agregar archivos especificamente |
| Push force sin autorizacion | Perdida de trabajo | NUNCA push force |
| Build no pasa antes de push | Produccion rota | Validar build siempre |
| Commits con gaps DDL-Entity | Inventarios inconsistentes | Mantener coherencia (RC2) |
| No actualizar PROXIMA-ACCION | Perdida de contexto | Actualizar al finalizar tarea |

---

## INTEGRACION CON SIMCO

### Ciclo CAPVED y Branching

```yaml
CAPVED_Y_GIT:
  C_Contexto:
    - git fetch && git log HEAD..origin/master
    - Revisar PROJECT-CONTEXT y PROXIMA-ACCION
    - Identificar archivos afectados

  A_Analisis:
    - Determinar si cambio es < 50 lineas (master directo)
    - O > 50 lineas (considerar feature branch)
    - Analizar dependencias (DDL -> Entity -> Endpoints)

  P_Planificacion:
    - Definir commits atomicos
    - Planificar validaciones (build, lint, tests)
    - Identificar archivos a modificar

  V_Validacion:
    - npm run build && npm run lint
    - npm run test (si hay tests)
    - Verificar coherencia inventarios

  E_Ejecucion:
    - git add {archivos especificos}
    - git commit -m "[GAM-XXX] tipo: desc"
    - git push origin master

  D_Documentacion:
    - Actualizar PROXIMA-ACCION.md
    - Actualizar inventarios (MASTER_INVENTORY.yml)
    - Documentar en ADR si aplica
```

### Modos de Ejecucion

| Modo | Branching Strategy |
|------|--------------------|
| FULL | Commits atomicos con validacion completa (build + lint + tests) |
| QUICK | Commit directo a master (typos, docs menores) |
| ANALYSIS | Solo lectura (NO commits) |

**Nota:** PROPAGATION no aplica (gamilit es standalone).

---

## REFERENCIAS

| Alias | Documento |
|-------|-----------|
| @SIMCO-GIT | orchestration/directivas/simco/SIMCO-GIT.md |
| @SIMCO-GIT-WORKFLOW | orchestration/directivas/simco/SIMCO-GIT-WORKFLOW.md |
| @CAPVED | orchestration/directivas/principios/PRINCIPIO-CAPVED.md |
| @VALIDACION-OBLIGATORIA | orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md |
| @ESTANDAR-GIT | docs/40-standards/ESTANDAR-GIT.md |
| @RC1-FETCH | CLAUDE.md - Regla Critica 1 |
| @RC4-MONOREPO | CLAUDE.md - Regla Critica 4 |
| @PERFIL-DEPLOY | orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md |
| @AMBIENTES | docs/20-architecture/AMBIENTES-DEV-PROD.md |
| @MASTER-INVENTORY | orchestration/inventarios/MASTER_INVENTORY.yml |

---

## RESUMEN EJECUTIVO

```yaml
GAMILIT_BRANCHING_STRATEGY:
  tipo: "Trunk-Based Development"
  branch_principal: "master"
  repositorio: "git@github.com:rckrdmrd/gamilit-workspace.git"

  reglas_oro:
    1. "Trabajar en master por defecto"
    2. "Commits atomicos y frecuentes"
    3. "Build + Lint antes de push"
    4. "Feature branches solo si > 2h trabajo"
    5. "Push obligatorio al terminar tarea"
    6. "Agregar archivos especificamente (NO git add .)"
    7. "Mantener coherencia DDL -> Entity -> Endpoints"

  validaciones:
    - "npm run build && npm run lint"
    - "git fetch origin antes de operar"
    - "git status = working tree clean al finalizar"

  deploy:
    - "master siempre deployable"
    - "Servidor: 74.208.126.102"
    - "PM2 fork mode (backend:3006, frontend:3005)"

  NO_aplica:
    - "Submodulos (es monorepo)"
    - "Multi-repo workflow"
    - "Propagacion (es standalone)"
    - "Feature branches largos"
```

---

**Este principio es OBLIGATORIO y NO puede ser ignorado por ningun agente.**

---

## Ver tambien

- [ESTANDAR-GIT](../../../docs/40-standards/ESTANDAR-GIT.md) - Estandar de convenciones Git (commits, branches, pull requests)

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 + NEXUS v4.1 | **Tipo:** Principio Fundamental
