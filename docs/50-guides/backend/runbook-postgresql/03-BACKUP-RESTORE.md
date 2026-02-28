---
title: "Runbook PostgreSQL — Backup y Restore"
status: activo
last_updated: "2026-02-28"
---

# Runbook PostgreSQL — Backup y Restore

**Proyecto:** GAMILIT
**Version:** 1.0.0
**Fecha:** 2026-02-14
**Aplica a:** PostgreSQL 15 — Base de datos gamilit_platform

---

## 5. Backup y Restore

### 5.1 Backup logico con pg_dump

```bash
# Backup completo en formato custom (comprimido, mas flexible para restore)
pg_dump -h localhost -U postgres -d gamilit_platform \
  -Fc -f /backup/gamilit_platform_$(date +%Y%m%d_%H%M%S).dump

# Backup solo estructura (DDL) — util para comparar con DDL en repo
pg_dump -h localhost -U postgres -d gamilit_platform \
  --schema-only -f /backup/gamilit_schema_$(date +%Y%m%d).sql

# Backup de un schema especifico
pg_dump -h localhost -U postgres -d gamilit_platform \
  -n gamification_system \
  -Fc -f /backup/gamification_$(date +%Y%m%d).dump

# Backup solo datos (sin estructura)
pg_dump -h localhost -U postgres -d gamilit_platform \
  --data-only -Fc -f /backup/gamilit_data_$(date +%Y%m%d).dump
```

### 5.2 Backup fisico con pg_basebackup

```bash
# Backup fisico completo (para PITR)
pg_basebackup -h localhost -U postgres \
  -D /backup/base_$(date +%Y%m%d) \
  -Ft -z -P --checkpoint=fast

# Verificar backup
pg_verifybackup /backup/base_$(date +%Y%m%d)
```

### 5.3 Restore desde dump

```bash
# Restore completo desde formato custom
pg_restore -h localhost -U postgres \
  -d gamilit_platform \
  --clean --if-exists \
  /backup/gamilit_platform_20260214_120000.dump

# Restore de un schema especifico
pg_restore -h localhost -U postgres \
  -d gamilit_platform \
  -n gamification_system \
  /backup/gamilit_platform_20260214_120000.dump

# Restore solo estructura
pg_restore -h localhost -U postgres \
  -d gamilit_platform \
  --schema-only \
  /backup/gamilit_platform_20260214_120000.dump

# Restore solo datos
pg_restore -h localhost -U postgres \
  -d gamilit_platform \
  --data-only \
  /backup/gamilit_platform_20260214_120000.dump
```

### 5.4 Point-in-Time Recovery (PITR) con WAL

**Configuracion en `postgresql.conf`:**

```ini
# Habilitar WAL archiving
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal_archive/%f'
```

**Procedimiento de recovery:**

1. Detener PostgreSQL
2. Copiar base backup a data directory
3. Crear `recovery.signal` en data directory
4. Configurar en `postgresql.conf`:
   ```ini
   restore_command = 'cp /backup/wal_archive/%f %p'
   recovery_target_time = '2026-02-14 12:00:00'
   ```
5. Iniciar PostgreSQL
6. Verificar que recovery fue exitoso
7. Ejecutar `SELECT pg_wal_replay_resume();` si esta en pause

### 5.5 Rotacion de backups

```bash
#!/bin/bash
# Script de rotacion: retener los ultimos 7 backups
BACKUP_DIR="/backup"
RETENTION_DAYS=7

# Backup diario
pg_dump -h localhost -U postgres -d gamilit_platform \
  -Fc -f "${BACKUP_DIR}/gamilit_$(date +%Y%m%d).dump"

# Eliminar backups mas antiguos que $RETENTION_DAYS dias
find "${BACKUP_DIR}" -name "gamilit_*.dump" -mtime +${RETENTION_DAYS} -delete

# Log
echo "$(date): Backup completado, backups antiguos eliminados" >> "${BACKUP_DIR}/backup.log"
```

**Programar con cron (produccion):**

```bash
# Backup diario a las 2:00 AM
0 2 * * * /scripts/backup-gamilit.sh >> /var/log/gamilit-backup.log 2>&1
```
