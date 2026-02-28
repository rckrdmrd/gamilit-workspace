---
title: "Runbook PostgreSQL — Procedimientos de Emergencia"
status: activo
last_updated: "2026-02-28"
---

# Runbook PostgreSQL — Procedimientos de Emergencia

**Proyecto:** GAMILIT
**Version:** 1.0.0
**Fecha:** 2026-02-14
**Aplica a:** PostgreSQL 15 — Base de datos gamilit_platform

---

## 10. Procedimientos de Emergencia

### 10.1 Base de datos no responde

```bash
# 1. Verificar que PostgreSQL esta corriendo
sudo systemctl status postgresql

# 2. Verificar logs
sudo tail -100 /var/log/postgresql/postgresql-15-main.log

# 3. Verificar espacio en disco
df -h

# 4. Verificar conexiones (desde otra terminal)
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 5. Si hay demasiadas conexiones, terminar idle
psql -U postgres -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'idle'
    AND now() - state_change > interval '10 minutes'
    AND pid != pg_backend_pid();"

# 6. Si nada funciona, reiniciar (ultimo recurso)
sudo systemctl restart postgresql
```

### 10.2 Disco lleno

```bash
# 1. Verificar que consume espacio
du -sh /var/lib/postgresql/15/main/*

# 2. Limpiar WAL antiguos (si archive_mode esta activo)
# CUIDADO: solo si los backups estan confirmados
pg_archivecleanup /backup/wal_archive $(pg_controldata | grep "Latest checkpoint's REDO WAL file" | awk '{print $NF}')

# 3. Verificar tablas con bloat
psql -U postgres -d gamilit_platform -c "
  SELECT schemaname || '.' || tablename AS t,
         pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
  FROM pg_tables
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
  LIMIT 5;"

# 4. VACUUM (sin FULL, no requiere espacio extra)
psql -U postgres -d gamilit_platform -c "VACUUM;"
```

### 10.3 Recrear base de datos desde DDL

Si la base de datos esta corrupta o se necesita una reconstruccion completa, usar el script del repositorio:

```bash
# Recrear desde DDL (ELIMINA todos los datos)
cd apps/database
bash scripts/init-database.sh

# O el script de recreacion completo
bash scripts/recreate-database.sh
```

**Nota:** Esto ejecuta los archivos DDL en orden:
1. `00-prerequisites.sql` — Schemas y ENUMs
2. `schemas/*/tables/*.sql` — Tablas por schema
3. `schemas/*/functions/*.sql` — Funciones
4. `schemas/*/triggers/*.sql` — Triggers
5. `schemas/*/views/*.sql` — Views
6. `07-enable-rls.sql` + `07b` + `07c` + `07d` — Politicas RLS
7. `99-post-ddl-permissions.sql` — Permisos finales

---

## Referencias

- `apps/database/ddl/` — Archivos DDL del proyecto
- `apps/database/scripts/init-database.sh` — Script de inicializacion de BD
- `docs/50-guides/backend/_archived/GUIA-CREAR-BASE-DATOS.md` — Guia de creacion de BD [ARCHIVED]
- `docs/50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` — Guia de deploy (incluye backup)
- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/) — Documentacion oficial
- [pg_stat_statements](https://www.postgresql.org/docs/15/pgstatstatements.html) — Extension de monitoreo
- [pgstattuple](https://www.postgresql.org/docs/15/pgstattuple.html) — Extension de analisis de bloat
