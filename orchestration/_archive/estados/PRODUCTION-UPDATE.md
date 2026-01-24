# ACTUALIZACION DE PRODUCCION - GAMILIT

**LEER ESTE ARCHIVO DESPUES DE HACER `git pull`**

---

## INSTRUCCIONES RAPIDAS

```bash
# 1. Configurar password de base de datos
export DB_PASSWORD="tu_password"

# 2. Hacer scripts ejecutables
chmod +x scripts/*.sh

# 3. Ejecutar actualizacion completa
./scripts/update-production.sh
```

---

## QUE HACE EL SCRIPT

El script `update-production.sh` ejecuta automaticamente:

1. Detiene PM2
2. Respalda configuraciones (.env) a `/home/gamilit/backups/`
3. Respalda base de datos completa (pg_dump)
4. Restaura configuraciones despues del pull
5. Recrea base de datos limpia con todos los seeds
6. Instala dependencias (npm install)
7. Build de aplicaciones (npm run build)
8. Inicia servicios (pm2 start)
9. Valida el deployment

---

## DOCUMENTACION COMPLETA

Si necesitas mas detalles o algo falla, lee estas guias:

| Guia | Path |
|------|------|
| Actualizacion paso a paso | `docs/95-guias-desarrollo/GUIA-ACTUALIZACION-PRODUCCION.md` |
| Validacion y troubleshooting | `docs/95-guias-desarrollo/GUIA-VALIDACION-PRODUCCION.md` |
| Despliegue completo | `docs/95-guias-desarrollo/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` |

---

## SI ALGO FALLA

### Diagnostico rapido
```bash
./scripts/diagnose-production.sh
```

### Reparar datos faltantes
```bash
./scripts/repair-missing-data.sh
```

### Rollback
Los backups estan en `/home/gamilit/backups/YYYYMMDD_HHMMSS/`

```bash
# Ver backups disponibles
ls -la /home/gamilit/backups/

# Restaurar base de datos
gunzip -c /home/gamilit/backups/YYYYMMDD_HHMMSS/database/gamilit_*.sql.gz | psql "$DATABASE_URL"

# Restaurar configuraciones
cp /home/gamilit/backups/YYYYMMDD_HHMMSS/config/* apps/backend/
cp /home/gamilit/backups/YYYYMMDD_HHMMSS/config/* apps/frontend/
```

---

## COMANDOS PM2

```bash
pm2 list              # Ver procesos
pm2 logs              # Ver logs
pm2 restart all       # Reiniciar todo
pm2 monit             # Monitor en tiempo real
```

---

**Fecha:** 2025-12-18
**Servidor:** 74.208.126.102
**Backend:** Puerto 3006
**Frontend:** Puerto 3005
**Base de datos:** PostgreSQL puerto 5432, database gamilit_platform
