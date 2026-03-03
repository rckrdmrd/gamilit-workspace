---
titulo: Deployment Index
tipo: indice
fecha_creacion: 2025-10-01
ultima_actualizacion: 2026-02-28
estado: activo
---

# _INDEX - Deployment

> Indice de guias de despliegue y operaciones.

## SSOT

- **Configuracion de ambientes (dev/prod):** [AMBIENTES-DEV-PROD.md](../../20-architecture/AMBIENTES-DEV-PROD.md)
- **Guia operativa principal:** [GUIA-VALIDACION-PRODUCCION.md](./GUIA-VALIDACION-PRODUCCION.md) -- checklist post-deploy y validacion

## Guias Activas

| Archivo | Descripcion |
|---------|-------------|
| [DEV-SERVERS.md](./DEV-SERVERS.md) | Servidores de desarrollo |
| [GUIA-CORS-PRODUCCION.md](./GUIA-CORS-PRODUCCION.md) | CORS en produccion |
| [GUIA-DOCKER-MULTISTAGE.md](./GUIA-DOCKER-MULTISTAGE.md) | Docker multistage builds |
| [GUIA-GITHUB-ACTIONS-CICD.md](./GUIA-GITHUB-ACTIONS-CICD.md) | Pipeline CI/CD |
| [GUIA-PIPELINE-MIGRACIONES.md](./GUIA-PIPELINE-MIGRACIONES.md) | Pipeline de migraciones BD |
| [GUIA-SSL-AUTOFIRMADO.md](./GUIA-SSL-AUTOFIRMADO.md) | SSL autofirmado (dev) |
| [GUIA-SSL-NGINX-PRODUCCION.md](./GUIA-SSL-NGINX-PRODUCCION.md) | SSL/Nginx en produccion |
| [GUIA-VALIDACION-PRODUCCION.md](./GUIA-VALIDACION-PRODUCCION.md) | Validacion operativa post-deploy |

## Archivados

Los siguientes documentos fueron eliminados el 2026-03-03 (eran redundantes con documentos activos).

| Archivo | Razon de eliminacion |
|---------|---------------------|
| DEPLOYMENT-MASTER.md | Consolidado en AMBIENTES-DEV-PROD.md |
| GUIA-ACTUALIZACION-PRODUCCION.md | Redundante con GUIA-VALIDACION-PRODUCCION |
| GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md | Redundante con AMBIENTES-DEV-PROD + validacion |
| (+8 historicos adicionales) | Eliminados junto con _archived/ |
