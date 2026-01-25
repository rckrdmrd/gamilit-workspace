---
version: "1.0.0"
fecha: "2026-01-07"
tipo: directiva
categoria: operaciones
autor: "Claude Code (Opus 4.5)"
tags: [git, remotes, push, pull, gitea, operaciones]
aplica_a: [agentes, subagentes]
---

# SIMCO-GIT-REMOTES: Operaciones con Repositorios Remotos

## Propósito

Define el protocolo para operaciones git con repositorios remotos. **OBLIGATORIO** consultar antes de cualquier operación push/pull/clone.

---

## 1. Regla Principal

```yaml
REGLA_SERVIDORES:
  gitea:
    aplica_a: "TODOS los proyectos EXCEPTO gamilit"
    servidor: "72.60.226.4:3000"
    credenciales: "~/.git-credentials (token)"

  github:
    aplica_a: "SOLO gamilit"
    servidor: "github.com"
    credenciales: "SSH key (~/.ssh/id_ed25519)"
```

---

## 2. Antes de Operaciones Remotas

### 2.1 Checklist Pre-Operación

```yaml
VERIFICAR:
  - [ ] Identificar si es gamilit (GitHub) u otro proyecto (Gitea)
  - [ ] Verificar que credenciales estén configuradas
  - [ ] Confirmar que el repositorio remoto existe
  - [ ] Verificar rama actual y estado de cambios
```

### 2.2 Verificar Credenciales Gitea

```bash
# Verificar credential helper
git config --global credential.helper
# Debe retornar: store

# Si no está configurado:
git config --global credential.helper store
echo "http://rckrdmrd:a87cf9ba455874ebc712652d51344cb5417098fe@72.60.226.4:3000" > ~/.git-credentials
chmod 600 ~/.git-credentials
```

### 2.3 Verificar SSH para GitHub (solo gamilit)

```bash
ssh -T git@github.com
# Debe retornar: Hi rckrdmrd! You've successfully authenticated...
```

---

## 3. Credenciales de Referencia

### 3.1 Gitea (Proyectos Internos)

| Campo | Valor |
|-------|-------|
| Servidor | `72.60.226.4:3000` |
| Usuario | `rckrdmrd` |
| Password | `AfcItz2391,.` |
| Token Admin | `a87cf9ba455874ebc712652d51344cb5417098fe` |
| URL Base | `http://72.60.226.4:3000/rckrdmrd/` |

### 3.2 GitHub (Solo Gamilit)

| Campo | Valor |
|-------|-------|
| Servidor | `github.com` |
| Repositorio | `rckrdmrd/gamilit-workspace` |
| Auth | SSH Key |

---

## 4. Operaciones por Tipo de Proyecto

### 4.1 Proyectos Gitea (Mayoría)

```bash
# Clone
git clone http://72.60.226.4:3000/rckrdmrd/[PROYECTO].git

# Push (credenciales automáticas del store)
git push origin [RAMA]

# Pull
git pull origin [RAMA]

# Agregar remote
git remote add origin http://72.60.226.4:3000/rckrdmrd/[PROYECTO].git
```

### 4.2 Proyecto Gamilit (GitHub)

```bash
# Clone
git clone git@github.com:rckrdmrd/gamilit-workspace.git

# Push
git push origin [RAMA]

# Pull
git pull origin [RAMA]

# El remote ya está configurado como submodule
```

---

## 5. Crear Nuevo Repositorio en Gitea

### 5.1 Via API (Recomendado)

```bash
GITEA_TOKEN="a87cf9ba455874ebc712652d51344cb5417098fe"
REPO_NAME="nombre-repositorio"

# Crear repositorio principal
curl -X POST "http://72.60.226.4:3000/api/v1/user/repos" \
  -H "Authorization: token ${GITEA_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"${REPO_NAME}\", \"private\": false, \"description\": \"Descripción del proyecto\"}"
```

### 5.2 Crear Subrepositorios

```bash
# Para proyecto con subrepos (ej: michangarrito)
for SUBREPO in backend frontend database; do
  curl -X POST "http://72.60.226.4:3000/api/v1/user/repos" \
    -H "Authorization: token ${GITEA_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"${REPO_NAME}-${SUBREPO}\", \"private\": false}"
done
```

---

## 6. Troubleshooting Rápido

### 6.1 Authentication Failed

```bash
# Reconfigurar credenciales
git config --global credential.helper store
echo "http://rckrdmrd:a87cf9ba455874ebc712652d51344cb5417098fe@72.60.226.4:3000" > ~/.git-credentials
chmod 600 ~/.git-credentials

# Reintentar operación
git push origin [RAMA]
```

### 6.2 Repository Not Found

```bash
# Verificar existencia
curl -s -H "Authorization: token a87cf9ba455874ebc712652d51344cb5417098fe" \
  "http://72.60.226.4:3000/api/v1/repos/rckrdmrd/[PROYECTO]" | jq .name

# Si no existe, crear (ver sección 5)
```

### 6.3 Permission Denied (SSH - gamilit)

```bash
# Verificar key
ssh-add -l

# Si no hay keys, agregar
ssh-add ~/.ssh/id_ed25519

# Verificar conexión
ssh -T git@github.com
```

---

## 7. Matriz de Decisión

```
¿Qué proyecto es?
│
├─ gamilit ──────────────────────> Usar GitHub (SSH)
│                                  git@github.com:rckrdmrd/gamilit-workspace.git
│
└─ Cualquier otro proyecto ──────> Usar Gitea (HTTP + Token)
                                   http://72.60.226.4:3000/rckrdmrd/[PROYECTO].git
```

---

## 8. Referencias

- `@GIT_CREDENTIALS`: orchestration/referencias/GIT-CREDENTIALS-CONFIG.md
- `@SUBREPOSITORIOS`: SUBREPOSITORIOS.md
- `@ESTRUCTURA_REPOS`: orchestration/directivas/simco/SIMCO-ESTRUCTURA-REPOS.md

---

## 9. Ejemplo de Flujo Completo

```yaml
FLUJO_PUSH_PROYECTO:
  paso_1_identificar:
    proyecto: "michangarrito"
    servidor: "Gitea (no es gamilit)"

  paso_2_verificar_credenciales:
    comando: "git config --global credential.helper"
    esperado: "store"
    si_falla: "Configurar credential store"

  paso_3_verificar_remote:
    comando: "git remote -v"
    esperado: "origin http://72.60.226.4:3000/rckrdmrd/michangarrito.git"

  paso_4_ejecutar:
    comando: "git push origin master"
    resultado: "Push exitoso"
```

---

*SIMCO v1.0 - Single Instruction Matrix by Context and Operation*
