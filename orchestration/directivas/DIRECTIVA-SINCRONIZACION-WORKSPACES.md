# DIRECTIVA: Sincronizacion de Workspaces GAMILIT

**Version:** 1.0
**Fecha:** 2025-12-18
**Estado:** ACTIVA
**Aplica a:** Todos los agentes que trabajen en GAMILIT

---

## RESUMEN EJECUTIVO

GAMILIT tiene **DOS workspaces** con propositos diferentes. Esta directiva define como mantenerlos sincronizados y que debe existir en cada uno.

---

## WORKSPACES

### Workspace NUEVO (Prioridad Desarrollo)

```
Path: ~/workspace/projects/gamilit
Remote: http://72.60.226.4:3000/rckrdmrd/workspace.git (Gitea local)
```

**Proposito:**
- Desarrollo activo de nuevas features
- Manejo de agentes y orquestacion
- Documentacion tecnica y directivas
- Prioridad para todo desarrollo nuevo

**Contiene:**
- Codigo fuente completo (backend, frontend, database)
- Sistema de orquestacion y agentes
- Directivas y prompts
- Documentacion tecnica

### Workspace VIEJO (Produccion Cliente)

```
Path: ~/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit
Remote: git@github.com:rckrdmrd/gamilit-workspace.git (GitHub)
```

**Proposito:**
- Despliegue en servidor de produccion (74.208.126.102)
- Codigo estable para cliente
- Scripts de produccion y automatizacion
- Documentacion operativa para agente productivo

**Contiene:**
- Codigo deployado en produccion
- Scripts de deployment (`scripts/`)
- Guias de produccion (HTTPS, PM2, Certbot)
- Configuraciones especificas del servidor

---

## REGLAS DE SINCRONIZACION

### 1. Codigo de Desarrollo

| Elemento | Workspace Prioridad | Accion |
|----------|---------------------|--------|
| Nuevas features | NUEVO | Desarrollar aqui primero |
| Bug fixes | NUEVO | Desarrollar y luego sincronizar al viejo |
| Refactoring | NUEVO | Solo en nuevo, migrar cuando este estable |

**Flujo:**
```
NUEVO (desarrollo) → Estable → VIEJO (produccion) → Deploy
```

### 2. Configuraciones de Produccion

Estos archivos deben existir en **AMBOS** workspaces:

| Archivo | Proposito |
|---------|-----------|
| `apps/backend/.env.production` | CORS, JWT, puertos, BD |
| `apps/frontend/.env.production` | API host, protocolos |
| `ecosystem.config.js` | Configuracion PM2 |

**Regla:** Si se modifica en uno, sincronizar al otro.

### 3. Scripts de Produccion

Estos archivos solo existen en el **VIEJO**:

| Archivo | Proposito |
|---------|-----------|
| `scripts/update-production.sh` | Actualizacion automatizada |
| `scripts/diagnose-production.sh` | Diagnostico del servidor |
| `scripts/repair-missing-data.sh` | Reparar datos faltantes |
| `PRODUCTION-UPDATE.md` | Guia rapida post-pull |

**Razon:** Son especificos para el agente del servidor productivo.

### 4. Documentacion de Produccion

| Documento | Ubicacion |
|-----------|-----------|
| Guias de despliegue completo | VIEJO: `docs/95-guias-desarrollo/GUIA-DESPLIEGUE-*.md` |
| Validacion produccion | VIEJO: `docs/95-guias-desarrollo/GUIA-VALIDACION-PRODUCCION.md` |
| HTTPS/Certbot | VIEJO: documentado en guias de despliegue |

**En NUEVO:** Solo referencia a que existe en el viejo.

### 5. Base de Datos

| Elemento | Regla |
|----------|-------|
| DDL (schemas, tables, functions) | Deben ser **IDENTICOS** |
| Seeds de produccion | Deben ser **IDENTICOS** |
| `create-database.sh` | Debe ser **IDENTICO** |
| Scripts de migracion | Solo en VIEJO si son para produccion |

---

## ANTES DE SINCRONIZAR

### Checklist Obligatorio

```
[ ] 1. Identificar que workspace es origen
[ ] 2. Verificar que no hay conflictos de merge
[ ] 3. Listar archivos a sincronizar
[ ] 4. Verificar que configuraciones sensibles no se sobreescriban
[ ] 5. Despues de sincronizar, validar build en destino
```

### Archivos que NUNCA sincronizar

```
.env                    # Configuracion local
.env.local              # Configuracion local
node_modules/           # Dependencias
dist/                   # Builds
*.log                   # Logs
.git/                   # Repositorio git (son diferentes!)
```

---

## COMANDOS DE SINCRONIZACION

### Sincronizar archivo especifico (NUEVO → VIEJO)

```bash
# Desde workspace NUEVO
SOURCE=~/workspace/projects/gamilit
DEST=~/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit

# Ejemplo: sincronizar un archivo
cp "$SOURCE/apps/backend/src/modules/auth/auth.service.ts" "$DEST/apps/backend/src/modules/auth/"
```

### Sincronizar carpeta completa (NUEVO → VIEJO)

```bash
# Sincronizar modulo completo (sin node_modules, sin .git)
rsync -av --exclude='node_modules' --exclude='.git' --exclude='dist' \
    "$SOURCE/apps/backend/src/modules/gamification/" \
    "$DEST/apps/backend/src/modules/gamification/"
```

### Sincronizar DDL y Seeds

```bash
# Base de datos debe ser identica
rsync -av "$SOURCE/apps/database/ddl/" "$DEST/apps/database/ddl/"
rsync -av "$SOURCE/apps/database/seeds/" "$DEST/apps/database/seeds/"
```

---

## SERVIDOR DE PRODUCCION

### Configuracion

| Aspecto | Valor |
|---------|-------|
| IP | 74.208.126.102 |
| Backend | Puerto 3006 (2 instancias cluster) |
| Frontend | Puerto 3005 (1 instancia) |
| PostgreSQL | Puerto 5432, database `gamilit_platform` |
| PM2 | Gestor de procesos |

### Workflow de Deployment

```
1. Desarrollo en NUEVO
2. Pruebas locales
3. Sincronizar a VIEJO
4. Commit y push a GitHub
5. En servidor: git pull
6. Ejecutar ./scripts/update-production.sh
```

### Referencia a Documentacion de Produccion

Para documentacion completa de produccion, ver en workspace VIEJO:

```
docs/95-guias-desarrollo/
├── GUIA-ACTUALIZACION-PRODUCCION.md   # Post-pull workflow
├── GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md
├── GUIA-VALIDACION-PRODUCCION.md
└── DEPLOYMENT-GUIDE.md

scripts/
├── update-production.sh
├── diagnose-production.sh
└── repair-missing-data.sh
```

---

## CONFIGURACIONES HTTPS/CORS

### Backend (.env.production)

```bash
# CORS - Produccion
CORS_ORIGIN=http://74.208.126.102:3005,https://74.208.126.102:3005

# Para HTTPS con dominio:
# CORS_ORIGIN=https://gamilit.example.com

# Puerto
APP_PORT=3006

# Database
DATABASE_URL=postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform
```

### Frontend (.env.production)

```bash
# API Host
VITE_API_HOST=74.208.126.102
VITE_API_PORT=3006
VITE_API_PROTOCOL=http
VITE_WS_PROTOCOL=ws

# Para HTTPS:
# VITE_API_PROTOCOL=https
# VITE_WS_PROTOCOL=wss
```

### PM2 (ecosystem.config.js)

```javascript
module.exports = {
  apps: [
    {
      name: 'gamilit-backend',
      cwd: './apps/backend',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        APP_PORT: 3006
      }
    },
    {
      name: 'gamilit-frontend',
      cwd: './apps/frontend',
      script: 'npm',
      args: 'run preview -- --port 3005 --host',
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};
```

---

## CUANDO APLICAR ESTA DIRECTIVA

1. **Al iniciar trabajo en GAMILIT** - Verificar en cual workspace trabajar
2. **Al completar una feature** - Evaluar si debe sincronizarse
3. **Antes de deployment** - Asegurar que VIEJO tiene cambios
4. **Al modificar configuraciones** - Sincronizar a ambos workspaces
5. **Al modificar DDL/Seeds** - Sincronizar obligatoriamente

---

## ERRORES COMUNES

### Error 1: Desarrollar en workspace equivocado

**Problema:** Feature nueva desarrollada en VIEJO
**Solucion:** Mover cambios a NUEVO, luego sincronizar

### Error 2: Sobreescribir configuraciones de produccion

**Problema:** Copiar .env de desarrollo a produccion
**Solucion:** Siempre respaldar antes de sincronizar

### Error 3: DDL desincronizado

**Problema:** Tablas diferentes entre workspaces
**Solucion:** Sincronizar DDL y recrear BD en ambos

### Error 4: Olvidar push al remote correcto

**Problema:** Push a Gitea cuando deberia ser GitHub
**Solucion:** Verificar remote antes de push

---

**Ultima actualizacion:** 2025-12-18
**Mantenedor:** @tech-lead
