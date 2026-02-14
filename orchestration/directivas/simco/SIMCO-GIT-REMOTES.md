# SIMCO-GIT-REMOTES

**Version:** 1.0.0
**Fecha:** 2026-02-13
**Aplica a:** Todos los agentes que operen con git
**Criticidad:** OBLIGATORIA
**Tipo:** Directiva Operacional
**Alias:** @GIT-REMOTES
**Depende de:** SIMCO-GIT.md, SIMCO-DEPLOY-PRODUCTION.md

---

## 1. Proposito

Estandarizar las operaciones con repositorios remotos de gamilit, incluyendo GitHub (codigo fuente) y el servidor de produccion (74.208.126.102). Define credenciales, workflows y troubleshooting.

---

## 2. Repositorio Remoto

### 2.1 Configuracion

```yaml
remote:
  nombre: origin
  url_ssh: "git@github.com:rckrdmrd/gamilit-workspace.git"
  url_https: "https://github.com/rckrdmrd/gamilit-workspace.git"
  branch_principal: master
  tipo: monorepo
  submodules: false  # NO usa submodules (.gitmodules NO existe)
```

### 2.2 Verificacion de Conectividad

```bash
# Verificar SSH
ssh -T git@github.com

# Verificar remote configurado
git remote -v
# Esperado:
# origin  git@github.com:rckrdmrd/gamilit-workspace.git (fetch)
# origin  git@github.com:rckrdmrd/gamilit-workspace.git (push)

# Si no esta configurado:
git remote add origin git@github.com:rckrdmrd/gamilit-workspace.git
```

---

## 3. Operaciones Estandar

### 3.1 Fetch Obligatorio (RC1 de CLAUDE.md)

```bash
# ANTES de cualquier operacion:
git fetch origin && git log HEAD..origin/master --oneline
# Si hay output:
git pull origin master
# Luego:
git status
```

**REGLA BLOQUEANTE:** Sin fetch = estado incompleto. Todo agente DEBE ejecutar fetch antes de operar.

### 3.2 Pull (Actualizar Local)

```bash
# Pull estandar (fast-forward preferido)
git pull origin master --ff-only

# Si hay conflictos:
git pull origin master
# Resolver conflictos manualmente
# NUNCA usar: git checkout --theirs . (destruye cambios locales)
```

### 3.3 Push (Enviar Cambios)

```bash
# Push estandar
git push origin master

# Si rechazado (remote tiene commits nuevos):
git fetch origin
git pull origin master  # Resolver si hay conflictos
git push origin master

# NUNCA usar:
# git push --force origin master  (PROHIBIDO en master)
# git push --force-with-lease     (solo con autorizacion explicita)
```

### 3.4 Commit (Monorepo Workflow)

```bash
# Formato de commit (CLAUDE.md Regla 4)
git add [archivos especificos]
git commit -m "[GAM-XXX] descripcion del cambio"
git push origin master

# Verificar estado limpio:
git status  # Debe mostrar "working tree clean"
```

---

## 4. Servidor de Produccion

### 4.1 Configuracion del Servidor

```yaml
servidor:
  host: 74.208.126.102
  usuario: isem
  acceso: SSH (key-based)
  directorio: "/home/isem/gamilit-workspace"
  backend_puerto: 3006
  frontend_puerto: 3005
  proceso_manager: PM2 (fork mode)
  ssl: Nginx + Certbot
```

### 4.2 Acceso SSH al Servidor

```bash
# Conectar al servidor
ssh isem@74.208.126.102

# Verificar estado del proyecto
cd /home/isem/gamilit-workspace
git status
pm2 status
```

### 4.3 Deploy Workflow (Resumen)

```bash
# En el servidor (74.208.126.102):
cd /home/isem/gamilit-workspace

# 1. Actualizar codigo
git pull origin master

# 2. Instalar dependencias (si cambiaron)
cd apps/backend && npm install
cd ../frontend && npm install

# 3. Build
cd apps/backend && npm run build
cd ../frontend && npm run build

# 4. Restart procesos
pm2 restart ecosystem.config.js

# 5. Verificar
pm2 status
curl -s https://74.208.126.102/api/health | jq .
```

**Para deploy completo:** Ver `@SIMCO-DEPLOY-PRODUCTION` y `@PERFIL-DEPLOY`.

---

## 5. Ambientes y Branches

### 5.1 Estrategia de Branch

```yaml
branches:
  master:
    rol: "Branch principal y de produccion"
    proteccion: "NO force-push"
    deploy: "Automatico via PM2 (despues de pull)"

  # No se usan feature branches formalmente
  # El workflow es trunk-based: commit directo a master
```

### 5.2 Ambientes

| Ambiente | Branch | Host | Puerto BE | Puerto FE |
|----------|--------|------|-----------|-----------|
| Dev (Windows) | master | localhost | 3006 | 3005 |
| Prod (Linux) | master | 74.208.126.102 | 3006 | 3005 |

---

## 6. Troubleshooting

### 6.1 Error: Permission denied (publickey)

```bash
# Verificar que la key SSH esta cargada
ssh-add -l

# Si no hay keys:
ssh-add ~/.ssh/id_rsa

# Verificar acceso a GitHub
ssh -T git@github.com
# Esperado: "Hi rckrdmrd! You've been authenticated..."
```

### 6.2 Error: Remote rejected (non-fast-forward)

```bash
# El remote tiene commits que no tienes localmente
git fetch origin
git log HEAD..origin/master --oneline  # Ver que hay de nuevo
git pull origin master                 # Integrar cambios
git push origin master                 # Reintentar push
```

### 6.3 Error: Connection refused (servidor prod)

```bash
# Verificar que el servidor esta accesible
ping 74.208.126.102

# Verificar SSH
ssh -v isem@74.208.126.102

# Verificar PM2
ssh isem@74.208.126.102 "pm2 status"
```

### 6.4 Error: Merge conflict

```bash
# NO resolver con --theirs o --ours automaticamente
# Resolver manualmente:
git status                    # Ver archivos en conflicto
# Editar cada archivo, resolver <<<< ==== >>>> markers
git add [archivos resueltos]
git commit -m "[GAM-FIX] resolve merge conflict in [archivos]"
git push origin master
```

---

## 7. Seguridad

### 7.1 Reglas de Seguridad

```yaml
prohibido:
  - "Commitear archivos .env con credenciales reales"
  - "Commitear archivos con passwords en texto plano"
  - "Push --force a master"
  - "Modificar git config user.email/user.name sin autorizacion"

permitido:
  - "Archivos .env.example con placeholders"
  - "Credenciales en CLAUDE.md (dev only, documentadas)"
```

### 7.2 Archivos Excluidos (.gitignore)

```
node_modules/
dist/
.env
*.log
coverage/
```

---

## 8. Referencias

| Directiva | Relacion |
|-----------|---------|
| SIMCO-GIT.md | Operaciones git generales |
| SIMCO-DEPLOY-PRODUCTION.md | Workflow completo de deploy |
| SIMCO-MONOREPO.md | Estructura monorepo |
| PERFIL-DEPLOY-SERVER.md | Perfil de agente de deploy |
| CLAUDE.md RC1 | Fetch obligatorio |
| CLAUDE.md RC4 | Monorepo single git repo |
| CLAUDE.md RC6 | Deployment servidor produccion |

---

**Creado por:** TASK-2026-02-13-ANALISIS-MEJORAS-INTEGRABLES
**Basado en:** workspace-arch/SIMCO-GIT-REMOTES.md (adaptado para GitHub + monorepo standalone)
