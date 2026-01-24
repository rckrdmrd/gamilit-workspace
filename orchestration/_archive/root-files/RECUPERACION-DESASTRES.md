# RECUPERACION-DESASTRES.md
# Plan de Recuperación ante Desastres - Gamilit

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Última revisión:** N/A

---

## CLASIFICACIÓN DE INCIDENTES

| Nivel | Descripción | SLA Recuperación |
|-------|-------------|------------------|
| **P0** | Sistema completamente caído | 1 hora |
| **P1** | Funcionalidad crítica afectada | 4 horas |
| **P2** | Funcionalidad secundaria afectada | 24 horas |
| **P3** | Problema menor, workaround disponible | 72 horas |

---

## ESCENARIO 1: BASE DE DATOS CORRUPTA

### Detección
- Backend no responde
- Errores de conexión a BD
- Logs muestran errores PostgreSQL

### Recuperación

```bash
# 1. Detener aplicación
pm2 stop all

# 2. Verificar estado de PostgreSQL
sudo systemctl status postgresql

# 3. Si PostgreSQL no inicia, revisar logs
sudo tail -100 /var/log/postgresql/postgresql-16-main.log

# 4. Restaurar desde backup
# Listar backups disponibles
ls -la /var/backups/gamilit/

# Restaurar último backup
sudo -u postgres dropdb gamilit
sudo -u postgres createdb gamilit
sudo -u postgres psql gamilit < /var/backups/gamilit/backup_YYYYMMDD.sql

# 5. Reiniciar aplicación
pm2 start ecosystem.config.js
```

### Verificación
```bash
curl http://localhost:3000/api/v1/health
```

---

## ESCENARIO 2: SERVIDOR NO RESPONDE

### Detección
- No hay respuesta a ping
- SSH no conecta
- Servicios web no responden

### Recuperación

```bash
# 1. Desde panel de proveedor cloud, reiniciar servidor

# 2. Si no funciona, acceder vía consola de emergencia

# 3. Una vez con acceso, verificar servicios
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# 4. Reiniciar servicios en orden
sudo systemctl start postgresql
sudo systemctl start nginx
pm2 start ecosystem.config.js

# 5. Verificar logs
pm2 logs --lines 50
```

---

## ESCENARIO 3: CÓDIGO CORRUPTO / BUG EN PRODUCCIÓN

### Detección
- Errores 500 masivos
- Comportamiento inesperado
- Logs muestran excepciones no capturadas

### Recuperación (Rollback)

```bash
# 1. Identificar última versión estable
git log --oneline -10

# 2. Detener aplicación
pm2 stop all

# 3. Rollback a versión estable
git checkout <commit-hash-estable>

# 4. Reinstalar dependencias si es necesario
npm install

# 5. Rebuild
cd apps/backend && npm run build
cd ../frontend && npm run build

# 6. Reiniciar
pm2 start ecosystem.config.js

# 7. Verificar
curl http://localhost:3000/api/v1/health
```

---

## ESCENARIO 4: PÉRDIDA DE DATOS DE USUARIO

### Detección
- Usuarios reportan datos faltantes
- Queries devuelven resultados vacíos inesperados

### Investigación

```bash
# 1. Verificar integridad de datos
psql -h localhost -U gamilit_user -d gamilit

# 2. Contar registros en tablas críticas
SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

# 3. Buscar eliminaciones recientes en audit log
SELECT * FROM audit.action_logs
WHERE action_type = 'DELETE'
AND created_at > NOW() - INTERVAL '24 hours';
```

### Recuperación Selectiva

```bash
# 1. Restaurar backup a base de datos temporal
sudo -u postgres createdb gamilit_recovery
sudo -u postgres psql gamilit_recovery < /var/backups/gamilit/backup_YYYYMMDD.sql

# 2. Identificar datos a recuperar
psql -d gamilit_recovery -c "SELECT * FROM tabla WHERE condicion;"

# 3. Copiar datos específicos a producción
pg_dump -t tabla_especifica gamilit_recovery | psql gamilit

# 4. Eliminar base temporal
sudo -u postgres dropdb gamilit_recovery
```

---

## ESCENARIO 5: CERTIFICADO SSL EXPIRADO

### Detección
- Navegadores muestran error de certificado
- Conexiones HTTPS fallan

### Recuperación

```bash
# 1. Verificar estado del certificado
sudo certbot certificates

# 2. Renovar certificado
sudo certbot renew

# 3. Reiniciar nginx
sudo systemctl restart nginx

# 4. Verificar
curl -I https://yourdomain.com
```

---

## PROCEDIMIENTOS DE BACKUP

### Backup Automático (Cron)

```bash
# /etc/cron.d/gamilit-backup
0 2 * * * root /opt/gamilit/scripts/backup.sh >> /var/log/gamilit-backup.log 2>&1
```

### Script de Backup (/opt/gamilit/scripts/backup.sh)

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/gamilit"

# Backup base de datos
pg_dump -h localhost -U gamilit_user -d gamilit > $BACKUP_DIR/db_$DATE.sql

# Backup archivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/gamilit/uploads

# Eliminar backups mayores a 30 días
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completado: $DATE"
```

---

## CONTACTOS DE EMERGENCIA

| Rol | Contacto | Responsabilidad |
|-----|----------|-----------------|
| DevOps Lead | - | Infraestructura |
| Backend Lead | - | API y servicios |
| DBA | - | Base de datos |

---

## CHECKLIST POST-RECUPERACIÓN

- [ ] Servicios corriendo (pm2 status)
- [ ] Health check OK
- [ ] Logs sin errores críticos
- [ ] Base de datos accesible
- [ ] Frontend cargando
- [ ] Auth funcionando
- [ ] Datos de prueba verificados
- [ ] Notificar a stakeholders

---

*Generado: 2026-01-16 | Sistema: SIMCO v4.0.0*
