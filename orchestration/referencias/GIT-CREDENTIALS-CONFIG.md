---
version: "1.0.0"
fecha: "2026-01-07"
tipo: referencia
categoria: infraestructura
autor: "Claude Code (Opus 4.5)"
tags: [git, credentials, gitea, repositorios, infraestructura]
---

# Configuración de Credenciales Git

## Resumen

Este documento define la configuración de credenciales para acceso a repositorios remotos del workspace. **TODOS** los proyectos excepto `gamilit` utilizan el servidor Gitea interno.

---

## 1. Servidor Gitea (Proyectos Internos)

### 1.1 Datos del Servidor

| Campo | Valor |
|-------|-------|
| **Servidor** | 72.60.226.4 |
| **Puerto Web** | 3000 |
| **Puerto SSH** | 22 |
| **URL Base HTTP** | `http://72.60.226.4:3000/rckrdmrd/` |
| **URL Base SSH** | `git@gitea-server:rckrdmrd/` |
| **Usuario** | `rckrdmrd` |

### 1.2 Credenciales de Acceso

```yaml
GITEA_CREDENTIALS:
  servidor: "72.60.226.4:3000"
  usuario: "rckrdmrd"
  password: "AfcItz2391,."
  token_admin: "a87cf9ba455874ebc712652d51344cb5417098fe"
  token_descripcion: "Token administrativo para operaciones API y git"
```

### 1.3 Archivo de Credenciales Local

Las credenciales están almacenadas en:

```bash
# Ubicación
~/.git-credentials

# Contenido (formato git credential store)
http://rckrdmrd:a87cf9ba455874ebc712652d51344cb5417098fe@72.60.226.4:3000
```

### 1.4 Configuración Git Global

```bash
# Habilitar credential store
git config --global credential.helper store

# Verificar configuración
git config --global --get credential.helper
# Output esperado: store
```

---

## 2. GitHub (Proyecto Gamilit)

### 2.1 Datos del Servidor

| Campo | Valor |
|-------|-------|
| **Servidor** | github.com |
| **URL SSH** | `git@github.com:rckrdmrd/gamilit-workspace.git` |
| **Método Auth** | SSH Key |

### 2.2 Configuración SSH

```bash
# ~/.ssh/config
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
```

---

## 3. Configuración SSH para Gitea

```bash
# ~/.ssh/config
Host gitea-server
    HostName 72.60.226.4
    Port 22
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
```

---

## 4. Matriz de Proyectos y Servidores

### 4.1 Proyectos en Gitea (Credenciales Internas)

| Proyecto | Remote URL |
|----------|------------|
| workspace-v1 | `http://72.60.226.4:3000/rckrdmrd/workspace-v1.git` |
| erp-suite | `http://72.60.226.4:3000/rckrdmrd/erp-suite.git` |
| erp-core | `http://72.60.226.4:3000/rckrdmrd/erp-core.git` |
| erp-construccion | `http://72.60.226.4:3000/rckrdmrd/erp-construccion.git` |
| erp-clinicas | `http://72.60.226.4:3000/rckrdmrd/erp-clinicas.git` |
| erp-retail | `http://72.60.226.4:3000/rckrdmrd/erp-retail.git` |
| erp-mecanicas-diesel | `http://72.60.226.4:3000/rckrdmrd/erp-mecanicas-diesel.git` |
| erp-vidrio-templado | `http://72.60.226.4:3000/rckrdmrd/erp-vidrio-templado.git` |
| trading-platform | `http://72.60.226.4:3000/rckrdmrd/trading-platform.git` |
| betting-analytics | `http://72.60.226.4:3000/rckrdmrd/betting-analytics.git` |
| inmobiliaria-analytics | `http://72.60.226.4:3000/rckrdmrd/inmobiliaria-analytics.git` |
| platform_marketing_content | `http://72.60.226.4:3000/rckrdmrd/platform_marketing_content.git` |
| michangarrito | `http://72.60.226.4:3000/rckrdmrd/michangarrito.git` |
| template-saas | `http://72.60.226.4:3000/rckrdmrd/template-saas.git` |
| clinica-dental | `http://72.60.226.4:3000/rckrdmrd/clinica-dental.git` |
| clinica-veterinaria | `http://72.60.226.4:3000/rckrdmrd/clinica-veterinaria.git` |

### 4.2 Proyectos en GitHub (SSH Key)

| Proyecto | Remote URL |
|----------|------------|
| gamilit | `git@github.com:rckrdmrd/gamilit-workspace.git` |

---

## 5. Operaciones Comunes

### 5.1 Verificar Credenciales

```bash
# Verificar acceso a Gitea
curl -s -H "Authorization: token a87cf9ba455874ebc712652d51344cb5417098fe" \
  http://72.60.226.4:3000/api/v1/user | jq .login

# Verificar acceso SSH a GitHub
ssh -T git@github.com
```

### 5.2 Crear Repositorio en Gitea (API)

```bash
GITEA_TOKEN="a87cf9ba455874ebc712652d51344cb5417098fe"
REPO_NAME="nuevo-proyecto"

curl -X POST "http://72.60.226.4:3000/api/v1/user/repos" \
  -H "Authorization: token ${GITEA_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"${REPO_NAME}\", \"private\": false}"
```

### 5.3 Clonar Proyecto

```bash
# Proyecto Gitea (credenciales automáticas)
git clone http://72.60.226.4:3000/rckrdmrd/[PROYECTO].git

# Proyecto GitHub (SSH)
git clone git@github.com:rckrdmrd/gamilit-workspace.git
```

### 5.4 Push a Repositorio

```bash
# Gitea (credenciales del store)
git push origin main

# Si las credenciales no están configuradas, configurar primero:
git config --global credential.helper store
echo "http://rckrdmrd:a87cf9ba455874ebc712652d51344cb5417098fe@72.60.226.4:3000" > ~/.git-credentials
chmod 600 ~/.git-credentials
```

---

## 6. Troubleshooting

### 6.1 Error: Authentication Failed

```bash
# Verificar que el credential store esté configurado
git config --global credential.helper

# Si está vacío, configurar:
git config --global credential.helper store

# Recrear archivo de credenciales
echo "http://rckrdmrd:a87cf9ba455874ebc712652d51344cb5417098fe@72.60.226.4:3000" > ~/.git-credentials
chmod 600 ~/.git-credentials
```

### 6.2 Error: Permission Denied (SSH)

```bash
# Verificar configuración SSH
cat ~/.ssh/config

# Verificar permisos de key
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub

# Probar conexión
ssh -vT git@gitea-server
ssh -vT git@github.com
```

### 6.3 Error: Repository Not Found

```bash
# Verificar que el repositorio exista
curl -s -H "Authorization: token a87cf9ba455874ebc712652d51344cb5417098fe" \
  http://72.60.226.4:3000/api/v1/repos/rckrdmrd/[PROYECTO]

# Si no existe, crear:
curl -X POST "http://72.60.226.4:3000/api/v1/user/repos" \
  -H "Authorization: token a87cf9ba455874ebc712652d51344cb5417098fe" \
  -H "Content-Type: application/json" \
  -d '{"name": "[PROYECTO]", "private": false}'
```

---

## 7. Notas de Seguridad

1. **Token de Gitea**: El token tiene permisos administrativos. NO compartir públicamente.
2. **Archivo ~/.git-credentials**: Debe tener permisos 600 (solo lectura/escritura para el usuario).
3. **SSH Keys**: Las claves privadas nunca deben ser compartidas o expuestas.
4. **Rotación**: Se recomienda rotar el token de Gitea periódicamente.

---

## 8. Referencias

- `SUBREPOSITORIOS.md` - Lista completa de repositorios y estructura
- `orchestration/directivas/simco/SIMCO-ESTRUCTURA-REPOS.md` - Estructura de repositorios
- `scripts/create-gitea-repos-api.sh` - Script para crear repositorios

---

*Generado por NEXUS v4.0 - Sistema de Orquestación*
