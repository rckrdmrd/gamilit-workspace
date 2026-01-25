# Estructura de Repositorios - Workspace V2

**Version:** 2.0.0
**Fecha:** 2026-01-16
**Sistema:** SIMCO v4.0.0
**Arquitectura:** Multi-Repo con Submodulos Anidados

---

## 1. Vision General

El workspace-v2 utiliza una arquitectura multi-repositorio de 3 niveles donde cada componente es un repositorio Git independiente vinculado mediante submodulos.

```
workspace-v2/                          # NIVEL 0 - Repositorio principal
├── .git/
├── .gitmodules                        # Define 17 proyectos como submodulos
├── orchestration/                     # Sistema SIMCO
├── shared/                            # Recursos compartidos
├── docs/                              # Documentacion de usuario
└── projects/
    ├── template-saas/                 # NIVEL 1 - Submodulo proyecto
    │   ├── .git/
    │   ├── .gitmodules                # Define backend, database, frontend
    │   ├── backend/                   # NIVEL 2 - Submodulo componente
    │   ├── database/                  # NIVEL 2 - Submodulo componente
    │   └── frontend/                  # NIVEL 2 - Submodulo componente
    ├── erp-core/                      # NIVEL 1
    │   ├── backend/                   # NIVEL 2
    │   ├── database/                  # NIVEL 2
    │   └── frontend/                  # NIVEL 2
    ├── gamilit/                       # NIVEL 1 (monorepo, sin nivel 2)
    └── ... (17 proyectos total)
```

---

## 2. Niveles de Repositorios

### NIVEL 0: Workspace Root (1 repositorio)

| Campo | Valor |
|-------|-------|
| Repositorio | workspace-v2 |
| Path | /home/isem/workspace-v2 |
| Remote | git@gitea-server:rckrdmrd/workspace-v2.git |
| Branch | main |
| Contiene | orchestration/, shared/, docs/, projects/ |

### NIVEL 1: Proyectos (17 repositorios)

Cada proyecto es un submodulo de workspace-v2 con su propio repositorio.

| Proyecto | Remote | Submodulos N2 |
|----------|--------|---------------|
| template-saas | template-saas-v2 | 3 (b/d/f) |
| erp-core | erp-core-v2 | 3 (b/d/f) |
| erp-construccion | erp-construccion-v2 | 3 (b/d/f) |
| erp-mecanicas-diesel | erp-mecanicas-diesel-v2 | 3 (b/d/f) |
| erp-retail | erp-retail-v2 | 3 (b/d/f) |
| erp-clinicas | erp-clinicas-v2 | 3 (b/d/f) |
| erp-suite | erp-suite-v2 | 3 (b/d/f) |
| erp-vidrio-templado | erp-vidrio-templado-v2 | 3 (b/d/f) |
| clinica-dental | clinica-dental-v2 | 3 (b/d/f) |
| clinica-veterinaria | clinica-veterinaria-v2 | 3 (b/d/f) |
| gamilit | gamilit-workspace (GitHub) | 0 |
| trading-platform | trading-platform-v2 | 12 |
| michangarrito | michangarrito-v2 | 6 |
| miinventario | miinventario-v2 | 3 |
| betting-analytics | betting-analytics-v2 | 3 |
| inmobiliaria-analytics | inmobiliaria-analytics-v2 | 3 |
| platform_marketing_content | platform-marketing-content-v2 | 3 (b/d/f) |

**Leyenda:** b=backend, d=database, f=frontend

### NIVEL 2: Subrepositorios (61 repositorios)

Cada proyecto tiene subrepositorios para sus componentes:

| Componente | Proposito | Convencion de nombre |
|------------|-----------|----------------------|
| backend | API NestJS | {proyecto}-backend-v2 |
| database | DDL PostgreSQL | {proyecto}-database-v2 |
| frontend | React/Next.js | {proyecto}-frontend-v2 |
| mobile | React Native | {proyecto}-mobile-v2 |
| mcp-* | Microservicios MCP | {proyecto}-mcp-{nombre}-v2 |

---

## 3. Servidores Remotos

### Gitea Server (Principal)

| Campo | Valor |
|-------|-------|
| URL Web | http://72.60.226.4:3000 |
| Usuario | rckrdmrd |
| URL SSH | git@gitea-server:rckrdmrd/{repo}.git |
| URL HTTP | http://72.60.226.4:3000/rckrdmrd/{repo}.git |

### GitHub (gamilit)

| Campo | Valor |
|-------|-------|
| URL Web | https://github.com |
| Usuario | rckrdmrd |
| Repositorio | gamilit-workspace |
| URL SSH | git@github.com:rckrdmrd/gamilit-workspace.git |

---

## 4. Convencion de Nombres

```yaml
# Workspace
workspace-v2

# Proyectos (Nivel 1)
{proyecto}-v2

# Subrepositorios (Nivel 2)
{proyecto}-{componente}-v2

# Ejemplos
erp-core-v2              # Proyecto
erp-core-backend-v2      # Backend del proyecto
erp-core-database-v2     # Database del proyecto
erp-core-frontend-v2     # Frontend del proyecto
```

---

## 5. Estrategia de Branches

| Branch | Proposito |
|--------|-----------|
| main | Produccion estable (default) |
| develop | Integracion (si aplica) |
| feature/* | Desarrollo de features |
| hotfix/* | Fixes urgentes |
| migration/* | Migraciones entre versiones |

---

## 6. Comandos de Gestion

### Clonar workspace completo

```bash
git clone --recurse-submodules git@gitea-server:rckrdmrd/workspace-v2.git
cd workspace-v2
```

### Actualizar todos los submodulos

```bash
git pull --recurse-submodules
git submodule update --init --recursive
```

### Verificar estado de submodulos

```bash
git submodule status --recursive
```

### Actualizar un submodulo especifico

```bash
cd projects/{proyecto}
git pull origin main
cd ../..
git add projects/{proyecto}
git commit -m "Update {proyecto} submodule"
```

### Sincronizar todos los submodulos al branch main

```bash
git submodule foreach --recursive 'git checkout main 2>/dev/null || git checkout master'
git submodule foreach --recursive 'git pull origin $(git rev-parse --abbrev-ref HEAD)'
```

---

## 7. SSH Config

```bash
# ~/.ssh/config

Host gitea-server
    HostName 72.60.226.4
    User git
    IdentityFile ~/.ssh/id_ed25519

Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
```

---

## 8. Flujo de Trabajo

### Hacer cambios en un subrepositorio

```bash
# 1. Navegar al subrepositorio
cd projects/erp-core/backend

# 2. Hacer checkout del branch
git checkout main

# 3. Hacer cambios y commit
git add .
git commit -m "feat: Add new feature"
git push origin main

# 4. Actualizar referencia en proyecto padre
cd ..  # projects/erp-core
git add backend
git commit -m "Update backend submodule"
git push origin main

# 5. Actualizar referencia en workspace
cd ../..  # workspace-v2
git add projects/erp-core
git commit -m "Update erp-core submodule"
git push origin main
```

### Agregar nuevo submodulo

```bash
# En el proyecto padre
git submodule add git@gitea-server:rckrdmrd/{proyecto}-{componente}-v2.git {componente}
git commit -m "Add {componente} submodule"
```

---

## 9. Resumen de Totales

| Nivel | Cantidad | Descripcion |
|-------|----------|-------------|
| 0 | 1 | Workspace root |
| 1 | 17 | Proyectos |
| 2 | 61 | Subrepositorios |
| **Total** | **79** | **Repositorios** |

---

## 10. Referencias

- **Inventario completo:** `orchestration/inventarios/REPO-VALIDATION-STATUS.yml`
- **Directiva SIMCO:** `orchestration/directivas/simco/SIMCO-ESTRUCTURA-REPOS.md`
- **Instrucciones de creacion:** `orchestration/INSTRUCCIONES-CREAR-REPOSITORIOS-V2.md`
- **CLAUDE.md:** Reglas de comportamiento del workspace

---

**Actualizado:** 2026-01-16
**Version:** 2.0.0
