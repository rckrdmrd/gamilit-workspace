# REFERENCIA: Deployment en Produccion

**Ubicacion de Documentacion Completa:**

La documentacion completa para el agente de produccion se encuentra en el **workspace de produccion** (VIEJO), ya que es donde se ejecuta el deployment.

## Archivos en Workspace de Produccion

```
~/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/
├── PROMPT-AGENTE-PRODUCCION.md          # Prompts para usar con el agente
├── PRODUCTION-UPDATE.md                  # Instrucciones rapidas post-pull
├── docs/50-guides/
│   └── GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md  # Guia completa de deployment
└── scripts/
    ├── update-production.sh              # Script automatizado de deployment
    └── diagnose-production.sh            # Script de diagnostico
```

## Resumen del Proceso

1. **Backup**: BD + configs a `/home/gamilit/backups/TIMESTAMP/`
2. **Pull**: `git reset --hard origin/master`
3. **Restaurar**: Configs desde backup
4. **Recrear BD**: `./create-database.sh`
5. **Build**: `npm install && npm run build`
6. **Deploy**: `pm2 start ecosystem.config.js`
7. **HTTPS**: Certbot + Nginx (si aplica)
8. **Validar**: `./scripts/diagnose-production.sh`

## Prompt Basico para Agente

```
Ejecuta el deployment de GAMILIT siguiendo el procedimiento en
docs/50-guides/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md

1. Backup BD y configs
2. pm2 stop all
3. git reset --hard origin/master
4. Restaurar configs
5. Recrear BD
6. Build backend y frontend
7. pm2 start
8. Validar

Ejecuta paso a paso mostrando outputs.
```

## Ver Documentacion Completa

Para ver la guia completa, acceder al workspace de produccion:
```bash
cat ~/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/50-guides/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md
```

---

*Este archivo es solo una referencia. La documentacion real esta en el workspace de produccion.*
