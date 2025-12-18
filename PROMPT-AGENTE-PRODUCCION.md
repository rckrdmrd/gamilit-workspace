# PROMPT PARA AGENTE EN PRODUCCION - GAMILIT

**Usar este prompt cuando necesites que el agente ejecute un deployment en produccion.**

---

## PROMPT ESTANDAR

Copia y pega este prompt para el agente:

```
Eres el agente de deployment de GAMILIT en el servidor de produccion (74.208.126.102).

Tu tarea es ejecutar un deployment completo siguiendo el procedimiento estandarizado.

## DOCUMENTACION OBLIGATORIA
Antes de ejecutar CUALQUIER comando, lee la guia completa en:
docs/95-guias-desarrollo/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md

## PROCEDIMIENTO A SEGUIR

1. **BACKUP** (OBLIGATORIO antes de cualquier cambio):
   - Base de datos: pg_dump a /home/gamilit/backups/TIMESTAMP/database/
   - Configuraciones: .env.production de backend y frontend a /home/gamilit/backups/TIMESTAMP/config/
   - Logs actuales: copiar a /home/gamilit/backups/TIMESTAMP/logs/

2. **DETENER SERVICIOS**:
   - pm2 stop all

3. **PULL DEL REPOSITORIO**:
   - git fetch origin
   - git reset --hard origin/main

4. **RESTAURAR CONFIGURACIONES**:
   - Copiar .env.production desde el backup recien creado

5. **RECREAR BASE DE DATOS**:
   - cd apps/database && ./create-database.sh

6. **INSTALAR Y BUILD**:
   - npm install y npm run build en backend y frontend

7. **INICIAR SERVICIOS**:
   - pm2 start ecosystem.config.js --env production

8. **VALIDAR**:
   - Ejecutar ./scripts/diagnose-production.sh
   - Verificar health checks
   - Verificar CORS y HTTPS funcionando

## VARIABLES DE ENTORNO REQUERIDAS
Verificar que existan antes de empezar:
- DB_PASSWORD
- JWT_SECRET
- SESSION_SECRET
- DATABASE_URL
- CORS_ORIGIN

## ESTRUCTURA DE BACKUPS
/home/gamilit/backups/YYYYMMDD_HHMMSS/
├── database/gamilit_TIMESTAMP.sql.gz
├── config/
│   ├── backend.env.production
│   └── frontend.env.production
└── logs/

## HTTPS/CORS
Si HTTPS no esta configurado, seguir seccion de certbot en la guia.
CORS_ORIGIN debe incluir el dominio con https://

## EN CASO DE ERROR
Ejecutar rollback usando el ultimo backup en /home/gamilit/backups/latest/

Confirma que has leido la documentacion y procede con el deployment paso a paso, mostrando el output de cada comando.
```

---

## PROMPT CORTO (Para deployments de rutina)

```
Ejecuta el deployment de GAMILIT siguiendo el procedimiento en docs/95-guias-desarrollo/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md

Resumen:
1. Backup BD y configs a /home/gamilit/backups/
2. pm2 stop all
3. git reset --hard origin/main
4. Restaurar configs
5. Recrear BD con create-database.sh
6. npm install && npm run build (backend y frontend)
7. pm2 start ecosystem.config.js
8. Validar con diagnose-production.sh

Ejecuta paso a paso mostrando outputs.
```

---

## PROMPT PARA SOLO VALIDACION

```
Ejecuta el diagnostico de produccion de GAMILIT.

1. Lee docs/95-guias-desarrollo/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md
2. Ejecuta ./scripts/diagnose-production.sh
3. Verifica:
   - PM2 status
   - Health check backend: curl https://gamilit.com/api/health
   - Frontend status: curl -I https://gamilit.com
   - Conexion a BD
   - Espacio en disco
   - Logs recientes: pm2 logs --lines 50

Reporta cualquier problema encontrado.
```

---

## PROMPT PARA SOLO BACKUP

```
Ejecuta un backup completo de GAMILIT sin hacer deployment.

Estructura de backup:
/home/gamilit/backups/YYYYMMDD_HHMMSS/
├── database/gamilit_TIMESTAMP.sql.gz
├── config/ (todos los .env.production)
└── logs/

Comandos:
1. TIMESTAMP=$(date +%Y%m%d_%H%M%S)
2. mkdir -p /home/gamilit/backups/$TIMESTAMP/{database,config,logs}
3. pg_dump con gzip a database/
4. cp .env.production files a config/
5. cp logs/ a logs/
6. ln -sfn al symlink 'latest'

Muestra el contenido del backup creado.
```

---

## PROMPT PARA ROLLBACK

```
Ejecuta un rollback de GAMILIT al ultimo backup.

1. pm2 stop all
2. Restaurar BD desde /home/gamilit/backups/latest/database/
3. Restaurar configs desde /home/gamilit/backups/latest/config/
4. Rebuild si es necesario
5. pm2 start ecosystem.config.js
6. Validar con diagnose-production.sh

Usa la guia en docs/95-guias-desarrollo/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md seccion ROLLBACK.
```

---

## PROMPT PARA CONFIGURAR HTTPS (Primera vez)

```
Configura HTTPS para GAMILIT usando certbot y nginx.

Sigue la seccion de HTTPS en docs/95-guias-desarrollo/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md

Pasos:
1. Instalar certbot: sudo apt install certbot python3-certbot-nginx
2. Obtener certificado: sudo certbot --nginx -d gamilit.com -d www.gamilit.com
3. Configurar nginx como reverse proxy (ver guia para configuracion completa)
4. Actualizar .env.production con HTTPS:
   - Backend: CORS_ORIGIN=https://gamilit.com
   - Frontend: VITE_API_PROTOCOL=https, VITE_WS_PROTOCOL=wss
5. Reiniciar servicios
6. Validar HTTPS funcionando

Reemplaza gamilit.com con el dominio real.
```

---

## NOTAS IMPORTANTES

1. **Siempre hacer backup ANTES de cualquier cambio**
2. **Siempre leer la documentacion antes de ejecutar**
3. **Nunca ejecutar comandos destructivos sin backup**
4. **Verificar variables de entorno antes de empezar**
5. **El symlink 'latest' siempre apunta al ultimo backup**

---

*Prompts creados para GAMILIT Production Agent*
*Ultima actualizacion: 2025-12-18*
