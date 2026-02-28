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

Los siguientes documentos fueron archivados por redundancia. Se mantienen como referencia historica en `_archived/`.

| Archivo | Estado | Razon |
|---------|--------|-------|
| [DEPLOYMENT-MASTER.md](./_archived/DEPLOYMENT-MASTER.md) | [ARCHIVED] | Consolidado en AMBIENTES-DEV-PROD.md |
| [GUIA-ACTUALIZACION-PRODUCCION.md](./_archived/GUIA-ACTUALIZACION-PRODUCCION.md) | [ARCHIVED] | Redundante con GUIA-VALIDACION-PRODUCCION |
| [GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md](./_archived/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md) | [ARCHIVED] | Redundante con AMBIENTES-DEV-PROD + validacion |
| [_archived/README.md](./_archived/README.md) | [ARCHIVED] | Indice de 8 documentos historicos adicionales |
