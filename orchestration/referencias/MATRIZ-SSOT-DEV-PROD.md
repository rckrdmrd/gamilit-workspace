# MATRIZ SSOT - DEV/PROD (OPERACION DOCUMENTAL)

**Fecha:** 2026-02-24  
**Version:** 1.0.0  
**Estado:** Vigente

---

## 1) Proposito

Definir una **fuente de verdad unica (SSOT)** para los temas operativos de ambientes, deploy, SSL y base de datos, y establecer reglas de precedencia cuando exista conflicto documental entre `docs/` y `orchestration/`.

---

## 2) SSOT por dominio

| Dominio | SSOT primario | SSOT secundario | Regla |
|---|---|---|---|
| Ambientes Dev/Prod | `docs/20-architecture/AMBIENTES-DEV-PROD.md` | `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md` | Arquitectura y contrato de ambiente se define en `docs`; operación paso a paso en `orchestration`. |
| Deploy Producción | `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md` | `docs/50-guides/deployment/GUIA-VALIDACION-PRODUCCION.md` | Para ejecutar en servidor manda `PERFIL-DEPLOY-SERVER`. |
| SSL/Nginx/HTTPS | `docs/50-guides/deployment/GUIA-SSL-NGINX-PRODUCCION.md` | `docs/20-architecture/AMBIENTES-DEV-PROD.md` | Nginx/certificados se documentan en guía SSL; ambientes consume esa definición. |
| Recreación DB + Seeds | `orchestration/directivas/simco/SIMCO-RECREAR-BD.md` | `docs/20-architecture/DB-OPERACION-AMBIENTES-DECISION.md` | Comando operativo canónico: `apps/database/scripts/recreate-database.sh --env ...`. |
| Política de normalización documental | `orchestration/directivas/simco/SIMCO-NORMALIZACION-DOCUMENTAL.md` | N/A | Convenciones y desduplicación de documentación. |

---

## 3) Reglas de precedencia (cuando hay conflicto)

1. **Regla A (operación crítica):** si hay conflicto en comandos de deploy/DB, prevalece `orchestration` (`PERFIL-DEPLOY-SERVER` y `SIMCO-RECREAR-BD`).
2. **Regla B (arquitectura de ambientes):** si hay conflicto de modelado Dev/Prod (HTTP/HTTPS, puertos, CORS), prevalece `docs/20-architecture/AMBIENTES-DEV-PROD.md`.
3. **Regla C (SSL/Nginx):** para certificados y reverse proxy, prevalece `docs/50-guides/deployment/GUIA-SSL-NGINX-PRODUCCION.md`.
4. **Regla D (scripts DB):** se considera legacy cualquier guía que use `create-database.sh` o `drop-and-recreate-database.sh` como flujo principal de producción.
5. **Regla E (histórico):** contenido en `_archived`/`_archive` o marcado `DEPRECATED` nunca se usa para operación.

---

## 4) Baseline canónico Dev/Prod (resumen)

| Tema | Dev | Prod |
|---|---|---|
| Protocolo externo | `http` | `https` |
| Backend interno | `http://localhost:3006` | `http://localhost:3006` (tras Nginx) |
| Frontend interno | `http://localhost:3005` | `http://localhost:3005` (tras Nginx) |
| Exposición externa | directo local | Nginx `:443` |
| Health oficial | `/api/v1/health` | `/api/v1/health` |
| DB script canónico | `apps/database/scripts/recreate-database.sh --env dev --force` | `apps/database/scripts/recreate-database.sh --env prod --password \"$DB_PASSWORD\" --force` |
| CORS | policy de dev | whitelist estricta en backend |
| CORS en Nginx | no aplica | prohibido duplicar headers CORS |

---

## 5) Comandos canónicos (normalizados)

```bash
# Deploy - servidor prod
cd /home/isem/gamilit-workspace
git fetch origin && git pull origin master
cd apps/backend && npm ci --production=false && npm run build && cd ../..
cd apps/frontend && npm ci && npm run build && cd ../..
pm2 restart ecosystem.config.js --env production
pm2 save

# Health checks
curl -f http://localhost:3006/api/v1/health
curl -f http://localhost:3005
```

```bash
# DB recreate - prod
cd /home/isem/gamilit-workspace
DB_PASSWORD=$(grep '^DB_PASSWORD=' apps/backend/.env.production | cut -d'=' -f2- | tr -d '"' | tr -d "'")
bash apps/database/scripts/recreate-database.sh --env prod --password "$DB_PASSWORD" --force
```

---

## 6) Referencias cruzadas obligatorias

- `docs/50-guides/deployment/DEPLOYMENT-MASTER.md` debe referenciar esta matriz y marcarse como consolidado/deprecated si no se mantiene sincronizado.
- `docs/50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` debe referenciar esta matriz y evitar duplicar comandos legacy.
- `docs/50-guides/deployment/GUIA-GITHUB-ACTIONS-CICD.md` y `GUIA-PIPELINE-MIGRACIONES.md` deben usar rutas actuales del workspace.

