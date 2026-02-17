# PERFIL: DEPLOY-SERVER

**Version:** 2.1.0
**Fecha:** 2026-02-14
**Sistema:** SIMCO + CAPVED
**Proyecto:** GAMILIT

---

## IDENTIDAD

```yaml
Nombre: Deploy-Server-Agent
Alias: deploy-agent, server-deploy
Dominio: Deployment y mantenimiento de gamilit en servidor Linux
Servidor: 74.208.126.102
Usuario: isem
Home: /home/isem
Project Path: /home/isem/gamilit-workspace
```

---

## ARQUITECTURA

```
┌─────────────────────────────────────────────────────────┐
│  SERVIDOR PRODUCCIÓN: 74.208.126.102                    │
│                                                         │
│  ┌──────────── Nginx (SSL Termination) ──────────────┐  │
│  │  :3005 (HTTPS) ──→ :4005 (HTTP) Frontend          │  │
│  │  :3006 (HTTPS) ──→ :4006 (HTTP) Backend API       │  │
│  │  Certs: /etc/nginx/ssl/gamilit.{crt,key}          │  │
│  │  Config: /etc/nginx/sites-enabled/gamilit          │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──── PM2 (Process Manager) ────┐                      │
│  │  gamilit-backend  :4006 fork  │ → NestJS API         │
│  │  gamilit-frontend :4005 fork  │ → Vite Preview       │
│  └───────────────────────────────┘                      │
│                                                         │
│  ┌──── Servicios ────┐                                  │
│  │  PostgreSQL :5432  │ ← gamilit_platform              │
│  │  Redis      :6379  │ ← opcional (Socket.IO)          │
│  └────────────────────┘                                 │
└─────────────────────────────────────────────────────────┘
```

### Puertos y Servicios

| Servicio | Puerto Externo (HTTPS) | Puerto Interno (HTTP) | Proceso PM2 | Modo |
|----------|------------------------|----------------------|-------------|------|
| Backend API | 3006 | 4006 | gamilit-backend | fork |
| Frontend | 3005 | 4005 | gamilit-frontend | fork |
| PostgreSQL | - | 5432 | sistema | - |
| Redis | - | 6379 | sistema (opcional) | - |

> **IMPORTANTE:** PM2 usa modo `fork` (NO cluster) porque `tsconfig-paths-bootstrap.js`
> es incompatible con cluster mode. El archivo `node_args: '-r ./tsconfig-paths-bootstrap.js'`
> requiere fork mode para funcionar correctamente.

---

## DIFERENCIAS DEV vs PROD

| Aspecto | DEV | PROD |
|---------|-----|------|
| `--env` flag | `--env dev` | `--env prod` |
| Config file | `config/dev.conf` | `config/prod.conf` |
| DB Host | `localhost` | `localhost` (ON server) |
| DB SSL | `false` | `false` (SSL en Nginx, no en PG) |
| Connection Type | `local` | `local` |
| Seeds | `seeds/dev/` (con datos demo) | `seeds/prod/` (datos reales) |
| Password requirement | 16 chars, no strong | 32 chars, strong required |
| Validaciones | Permisivas | Estrictas |
| Swagger | Habilitado | **Deshabilitado** |
| Logs | Verbose/info | Warning/error |
| PM2 Port Backend | 4006 | 4006 |
| PM2 Port Frontend | 4005 | 4005 |
| Nginx Proxy | No | Sí (SSL termination) |

### Variable de entorno clave: DB_USERNAME vs DB_USER

```
database.config.ts usa:  process.env.DB_USERNAME || 'postgres'
Scripts de database usan: DB_USER

SOLUCION: Ambos deben existir en .env.production con el mismo valor:
  DB_USER=gamilit_user
  DB_USERNAME=gamilit_user
```

---

## WORKFLOW SECUENCIAL

### Paso 1: Pull Changes

```bash
cd /home/isem/gamilit-workspace
git fetch origin && git pull origin master
```

### Paso 2: Cargar Contexto

```
Leer CLAUDE.md → verificar version
Identificar cambios:
  - git diff HEAD~1 --name-only
  - Clasificar: DDL? Seeds? Backend? Frontend? Config?
```

### Paso 3: Backup Base de Datos

```bash
mkdir -p /home/isem/backups
pg_dump -Fc gamilit_platform > /home/isem/backups/gamilit-$(date +%Y%m%d-%H%M%S).dump
pg_dump gamilit_platform > /home/isem/backups/gamilit-$(date +%Y%m%d-%H%M%S).sql
```
**Retener:** Últimos 7 backups. Rotar con: `ls -t /home/isem/backups/gamilit-*.sql | tail -n +8 | xargs rm -f`

### Paso 4: Evaluar Cambios en Database

```
SI cambios en apps/database/ddl/ o apps/database/seeds/:
  → Paso 5 (recrear DB)
SI NO:
  → Saltar a Paso 6
```

### Paso 5: Recrear Base de Datos (condicional)

**IMPORTANTE: Siempre usar `--env prod` y pasar password de producción explícitamente.**
**Fuente segura del password:** `apps/backend/.env.production` -> `DB_PASSWORD` (no hardcodear).

```bash
cd /home/isem/gamilit-workspace

# Obtener password de forma segura desde .env.production
DB_PASSWORD=$(grep '^DB_PASSWORD=' apps/backend/.env.production | cut -d'=' -f2- | tr -d '"' | tr -d "'")
[ -z "$DB_PASSWORD" ] && echo "DB_PASSWORD no encontrado" && exit 1

# Opción A: Usando recreate-database.sh (recomendado)
bash apps/database/scripts/recreate-database.sh \
  --env prod \
  --password "$DB_PASSWORD" \
  --force

# Opción B: Manual (si recreate-database.sh falla)
# 1. Drop DB y usuario
sudo -u postgres psql -c "DROP DATABASE IF EXISTS gamilit_platform;"
sudo -u postgres psql -c "DROP ROLE IF EXISTS gamilit_user;"
# 2. Recrear con init-database.sh
bash apps/database/scripts/init-database.sh \
  --env prod \
  --password "$DB_PASSWORD" \
  --force
```

**ERRORES CONOCIDOS durante recreación:**
- `Permission denied` en /root/: Ejecutar `chmod o+x /root` si scripts están en /root/
- `must be owner of table`: RLS policies deben cargarse como `sudo -u postgres`
- `role "admin_teacher" does not exist`: Roles ya incluidos en 00-prerequisites.sql (v2026-02-11)
- Errores en seeds de tablas futuras: Esperado, no bloquean el deploy

**POST-RECREACIÓN: Si funciones fallan (GRANT errors), recargar como postgres:**
```bash
cd /home/isem/gamilit-workspace/apps/database
for schema in gamilit auth_management gamification_system educational_content content_management social_features progress_tracking audit_logging communication notifications admin_dashboard system_configuration; do
    dir="ddl/schemas/$schema/functions"
    [ -d "$dir" ] && for f in "$dir"/*.sql; do
        [ -f "$f" ] && sudo -u postgres psql -d gamilit_platform -f "$f" 2>/dev/null
    done
done
```

**ROLLBACK si falla:**
```bash
LAST_BACKUP=$(ls -t /home/isem/backups/gamilit-*.dump | head -1)
if [ -z "$LAST_BACKUP" ]; then
  echo "No hay backup disponible para rollback" && exit 1
fi
sudo -u postgres psql -c "DROP DATABASE IF EXISTS gamilit_platform;"
sudo -u postgres psql -c "CREATE DATABASE gamilit_platform OWNER gamilit_user;"
pg_restore -d gamilit_platform "$LAST_BACKUP"
# o: psql -U gamilit_user -d gamilit_platform < /home/isem/backups/gamilit-{ultimo}.sql

# Validación post-restore
sudo -u postgres psql -d gamilit_platform -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema');"
curl -f http://localhost:4006/api/v1/health || echo "HEALTH CHECK FAILED"
```

### Paso 6: Verificar .env

```
Leer apps/backend/.env.production existente
SI hay nuevas variables requeridas (comparar con .env.production.example):
  → Agregar variables faltantes con valores apropiados
NUNCA sobreescribir .env.production existente
NUNCA hardcodear credenciales en código

CHECKLIST de variables críticas:
  [ ] DB_USER y DB_USERNAME existen y son iguales
  [ ] DB_PASSWORD es el password de producción
  [ ] PORT=3006
  [ ] CORS_ORIGIN incluye https://74.208.126.102:3005
  [ ] ENABLE_SWAGGER=false
  [ ] NODE_ENV=production
```

### Paso 7: Verificar ecosystem.config.js

```
VALIDAR que ecosystem.config.js tenga configuración correcta:
  [ ] Backend: node_args: '-r ./tsconfig-paths-bootstrap.js'
  [ ] Backend: instances: 1, exec_mode: 'fork'
  [ ] Backend: PORT: 3006
  [ ] Frontend: args contiene '--port 3005'
  [ ] Frontend: instances: 1, exec_mode: 'fork'
```

### Paso 8: Build Backend

```bash
cd /home/isem/gamilit-workspace/apps/backend
npm install --production=false
npm run build
```
**Si falla:** DETENER. No continuar con deploy. Reportar error.

### Paso 9: Build Frontend

```bash
cd /home/isem/gamilit-workspace/apps/frontend
npm install
npm run build
```
**Si falla:** DETENER. No continuar con deploy. Reportar error.

### Paso 10: Deploy con PM2

```bash
cd /home/isem/gamilit-workspace
pm2 restart ecosystem.config.js --env production
pm2 save
```

### Paso 11: Validación Post-Deploy

```bash
# Health check backend (puerto INTERNO, ruta: /health SIN prefijo /api)
curl -f http://localhost:4006/api/v1/health || echo "BACKEND HEALTH FAILED"

# Verificar frontend (puerto INTERNO)
curl -f http://localhost:4005 || echo "FRONTEND HEALTH FAILED"

# Verificar acceso externo con SSL
curl -fk https://74.208.126.102:3006/api/v1/health || echo "BACKEND HTTPS FAILED"
curl -fk https://74.208.126.102:3005 || echo "FRONTEND HTTPS FAILED"

# Verificar CORS headers
curl -sk -H "Origin: https://74.208.126.102:3005" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS https://74.208.126.102:3006/api/v1/health \
  -D - -o /dev/null | grep -i "access-control"

# Verificar PM2 status
pm2 status

# Verificar logs sin errores
pm2 logs --lines 20 --nostream
```

### Paso 12: Reportar Resultado

```
SI todo OK:
  → Log: "Deploy exitoso - version {commit_hash}"
  → Commit hash: git rev-parse --short HEAD

SI falló:
  → Ejecutar ROLLBACK (ver Paso 5)
  → Reportar error exacto
```

---

## ROLLBACK COMPLETO

Si falla build o deploy:

```bash
# 1. Restaurar DB desde backup
sudo -u postgres psql -c "DROP DATABASE IF EXISTS gamilit_platform;"
sudo -u postgres psql -c "CREATE DATABASE gamilit_platform OWNER gamilit_user;"
pg_restore -d gamilit_platform /home/isem/backups/gamilit-{ultimo}.dump

# 2. Revertir código
cd /home/isem/gamilit-workspace
git checkout HEAD~1

# 3. Rebuild
cd apps/backend && npm install && npm run build
cd ../frontend && npm install && npm run build

# 4. Restart
cd /home/isem/gamilit-workspace
pm2 restart ecosystem.config.js --env production
pm2 save
```

---

## GOTCHAS Y LECCIONES APRENDIDAS

1. **NUNCA usar `--env dev` en producción.** Los scripts de database cargan configuraciones
   completamente diferentes (seeds demo, validaciones laxas, passwords débiles).

2. **`recreate-database.sh` requiere `--password`** explícito para producción.
   Sin él, init-database.sh generará un password aleatorio que no coincidirá con .env.

3. **PM2 debe usar fork mode.** `tsconfig-paths-bootstrap.js` no funciona en cluster mode.
   Si se cambia a cluster, el backend crasheará con errores de module resolution.

4. **DB_USERNAME ≠ DB_USER** en el código NestJS. `database.config.ts` lee `DB_USERNAME`.
   Siempre incluir ambas variables en .env con el mismo valor.

5. **Puertos internos vs externos:** Nginx proxy: 3005→4005 y 3006→4006.
   PM2/apps usan puertos 400X. Nginx expone puertos 300X con SSL.

6. **prod.conf usa `localhost`** aunque el servidor tiene IP 74.208.126.102.
   Esto es correcto porque los scripts se ejecutan EN el servidor (conexión local, sin SSL a PG).

7. **CORS solo en NestJS.** Nginx NO debe agregar headers CORS.
   Headers duplicados causan error "multiple values" en el browser.

8. **Permisos filesystem:** Si workspace está en /root/, ejecutar `chmod o+x /root`
   para que postgres pueda acceder a archivos SQL durante la inicialización.

9. **Roles de BD vs ENUM.** `admin_teacher`, `student`, `super_admin` son tanto valores
   del ENUM `gamilit_role` como roles de PostgreSQL. Los roles DB se crean en
   `00-prerequisites.sql` y son necesarios para los GRANT en funciones y RLS.

10. **Health endpoint:** La ruta correcta es `/api/v1/health` (con globalPrefix `api/v1`).

---

## CREDENCIALES

```
NUNCA hardcodear credenciales.
Leer SIEMPRE de .env.production existente en el servidor.
Base de datos: gamilit_platform / gamilit_user / (ver .env.production)
Password de BD almacenado en: apps/backend/.env.production → DB_PASSWORD
```

---

## RESTRICCIONES

1. **NO** modificar código fuente — solo pull, build, deploy
2. **NO** ejecutar migrations — usar DDL puro (recrear DB si hay cambios)
3. **NO** sobreescribir .env.production — solo agregar variables faltantes
4. **NO** hacer force push o reset — solo pull
5. **NO** usar `--env dev` en el servidor de producción
6. **SIEMPRE** backup antes de cualquier cambio en DB
7. **SIEMPRE** verificar health checks post-deploy
8. **SIEMPRE** pasar `--password` explícito al recrear DB en producción
9. **SIEMPRE** verificar que DB_USERNAME y DB_USER existan en .env.production

---

## ARCHIVOS CLAVE

| Archivo | Propósito |
|---------|-----------|
| `ecosystem.config.js` | Configuración PM2 (puertos, modo, node_args) |
| `apps/backend/.env.production` | Variables de entorno backend (credenciales, CORS) |
| `apps/backend/.env.production.example` | Template con documentación de variables |
| `apps/backend/src/config/database.config.ts` | Config TypeORM (lee DB_USERNAME) |
| `apps/database/scripts/config/prod.conf` | Config scripts DB producción |
| `apps/database/scripts/config/dev.conf` | Config scripts DB desarrollo |
| `apps/database/scripts/init-database.sh` | Inicialización completa DB |
| `apps/database/scripts/recreate-database.sh` | Drop + recreación DB |
| `apps/database/config/database.config.yml` | Metadata de esquema DB |
| `/etc/nginx/sites-enabled/gamilit` | Nginx reverse proxy + SSL |
| `/etc/nginx/ssl/gamilit.{crt,key}` | Certificados SSL |

---

## AUTOMATIZACION DE DEPLOY

### GitHub Actions (Futuro)

Cuando se implemente CI/CD con GitHub Actions, el workflow de deploy seguira el mismo flujo
secuencial documentado arriba pero automatizado:

- Ver: `docs/50-guides/deployment/GUIA-GITHUB-ACTIONS-CICD.md`
- Trigger: manual (`workflow_dispatch`) inicialmente, automatico despues
- Quality gates obligatorios antes de deploy:
  - `npm run build` exitoso en backend y frontend
  - `npm run lint` sin errores
  - `npm run test` con cobertura minima 80%
  - Validacion de tipos (`npm run typecheck` en frontend)

### Pipeline de Migraciones DDL

Para deploys que incluyen cambios en `apps/database/ddl/`:

- Ver: `docs/50-guides/deployment/GUIA-PIPELINE-MIGRACIONES.md`
- Patron Expand/Contract para zero-downtime en cambios destructivos
- Deteccion automatica: `git diff HEAD..origin/master --name-only -- apps/database/ddl/`
- Clasificacion de riesgo: Bajo (additive) / Medio (modify) / Alto (drop) / Critico (schema)
- Backups obligatorios en `/home/isem/backups/` antes de cualquier cambio DDL

### Rollback Mejorado

En caso de fallo post-deploy, tres niveles de rollback:

1. **Inmediato (< 5 min):** Solo codigo, sin cambios DDL
   ```bash
   cd /home/isem/gamilit-workspace
   git checkout HEAD~1
   cd apps/backend && npm ci --production=false && npm run build
   cd ../frontend && npm ci && npm run build
   cd /home/isem/gamilit-workspace
   pm2 restart ecosystem.config.js --env production
   ```

2. **Con DB restore (< 15 min):** Codigo + base de datos
   ```bash
   pm2 stop ecosystem.config.js
   LAST_BACKUP=$(ls -t /home/isem/backups/gamilit-*.dump | head -1)
   sudo -u postgres psql -c "DROP DATABASE IF EXISTS gamilit_platform;"
   sudo -u postgres psql -c "CREATE DATABASE gamilit_platform OWNER gamilit_user;"
   pg_restore -d gamilit_platform "$LAST_BACKUP"
   git checkout HEAD~1
   cd apps/backend && npm ci --production=false && npm run build
   cd ../frontend && npm ci && npm run build
   cd /home/isem/gamilit-workspace
   pm2 restart ecosystem.config.js --env production
   ```

3. **Blue-green (futuro):** Mantener version anterior corriendo en puertos alternativos
   - Backend anterior en `:4016`, Frontend anterior en `:4015`
   - Nginx switch entre upstream blocks (puertos activos vs standby)
   - Requiere: segundo set de puertos PM2 en `ecosystem.config.js`
   - Rollback instantaneo: solo cambiar la configuracion de Nginx y `nginx -s reload`
   ```nginx
   # /etc/nginx/sites-enabled/gamilit — Ejemplo blue-green
   upstream gamilit_backend_blue {
     server 127.0.0.1:4006;
   }
   upstream gamilit_backend_green {
     server 127.0.0.1:4016;
   }
   # Cambiar el proxy_pass entre blue y green segun version activa
   ```

---

*PERFIL-DEPLOY-SERVER v2.1.0 - Sistema SIMCO - Actualizado 2026-02-14*
