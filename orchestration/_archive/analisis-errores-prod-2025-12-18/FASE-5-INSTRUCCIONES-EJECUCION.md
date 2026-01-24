# FASE 5: Instrucciones de Ejecución

**Fecha:** 2025-12-18
**Proyecto:** Gamilit
**Ambiente:** Producción (74.208.126.102)

---

## 1. ARCHIVOS GENERADOS

```
orchestration/analisis-errores-prod-2025-12-18/
├── SCRIPT-CORRECCION-PRODUCCION.sql    # Script SQL principal
├── ejecutar-correccion.sh               # Script bash auxiliar
├── FASE-5-INSTRUCCIONES-EJECUCION.md   # Este documento
└── [otros documentos de análisis]
```

---

## 2. OPCIÓN A: Ejecución con Script Bash

### 2.1 Copiar archivos al servidor

```bash
# Desde tu máquina local
scp orchestration/analisis-errores-prod-2025-12-18/SCRIPT-CORRECCION-PRODUCCION.sql user@74.208.126.102:/tmp/
scp orchestration/analisis-errores-prod-2025-12-18/ejecutar-correccion.sh user@74.208.126.102:/tmp/
```

### 2.2 Ejecutar en el servidor

```bash
# Conectar al servidor
ssh user@74.208.126.102

# Ir al directorio
cd /tmp

# Ejecutar
./ejecutar-correccion.sh 74.208.126.102 5432 gamilit_platform gamilit_user
```

---

## 3. OPCIÓN B: Ejecución Manual con psql

### 3.1 Copiar archivo SQL

```bash
scp SCRIPT-CORRECCION-PRODUCCION.sql user@74.208.126.102:/tmp/
```

### 3.2 Ejecutar en servidor

```bash
# Conectar al servidor
ssh user@74.208.126.102

# Crear backup primero
pg_dump -U gamilit_user -d gamilit_platform \
    --schema=gamification_system \
    --schema=progress_tracking \
    --schema=educational_content \
    -f backup_$(date +%Y%m%d_%H%M%S).sql

# Ejecutar corrección
psql -U gamilit_user -d gamilit_platform -f /tmp/SCRIPT-CORRECCION-PRODUCCION.sql
```

---

## 4. OPCIÓN C: Ejecutar Directamente desde Local

Si tienes acceso directo a la BD de producción:

```bash
# Desde el directorio del proyecto
cd orchestration/analisis-errores-prod-2025-12-18/

# Ejecutar
PGPASSWORD=<tu_password> psql \
    -h 74.208.126.102 \
    -p 5432 \
    -U gamilit_user \
    -d gamilit_platform \
    -f SCRIPT-CORRECCION-PRODUCCION.sql
```

---

## 5. VERIFICACIÓN POST-EJECUCIÓN

### 5.1 Verificar tablas creadas

```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE (table_schema = 'gamification_system'
       AND table_name IN ('user_stats', 'user_ranks', 'notifications',
                          'mission_templates', 'missions', 'maya_ranks'))
   OR (table_schema = 'progress_tracking' AND table_name = 'module_progress')
   OR (table_schema = 'educational_content' AND table_name = 'modules')
ORDER BY table_schema, table_name;
```

### 5.2 Verificar seeds

```sql
SELECT 'mission_templates' as tabla, COUNT(*) FROM gamification_system.mission_templates
UNION ALL SELECT 'maya_ranks', COUNT(*) FROM gamification_system.maya_ranks
UNION ALL SELECT 'modules', COUNT(*) FROM educational_content.modules
UNION ALL SELECT 'user_stats', COUNT(*) FROM gamification_system.user_stats
UNION ALL SELECT 'user_ranks', COUNT(*) FROM gamification_system.user_ranks;
```

### 5.3 Verificar trigger

```sql
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'trg_initialize_user_stats';
```

---

## 6. REINICIAR BACKEND

Después de ejecutar el script SQL:

```bash
# En el servidor de producción
pm2 restart gamilit-backend

# O si hay múltiples instancias
pm2 restart all
```

---

## 7. PRUEBAS FUNCIONALES

### 7.1 Registrar nuevo usuario

1. Ir a https://74.208.126.102:3005/register
2. Crear cuenta nueva
3. Verificar que el dashboard carga sin errores

### 7.2 Probar endpoints

```bash
# Obtener token de autenticación primero
TOKEN="<jwt_token_del_usuario>"

# Probar notificaciones
curl -k https://74.208.126.102:3006/api/v1/notifications/unread-count \
    -H "Authorization: Bearer $TOKEN"

# Probar misiones
curl -k https://74.208.126.102:3006/api/v1/gamification/missions/daily \
    -H "Authorization: Bearer $TOKEN"

# Probar ranks
curl -k https://74.208.126.102:3006/api/v1/gamification/ranks/current \
    -H "Authorization: Bearer $TOKEN"

# Probar módulos
curl -k https://74.208.126.102:3006/api/v1/educational/modules/user/<user_id> \
    -H "Authorization: Bearer $TOKEN"
```

---

## 8. ROLLBACK (si es necesario)

Si algo falla, restaurar desde el backup:

```bash
# Restaurar backup
psql -U gamilit_user -d gamilit_platform -f backup_YYYYMMDD_HHMMSS.sql

# O si necesitas eliminar los objetos creados
psql -U gamilit_user -d gamilit_platform -c "
DROP TABLE IF EXISTS gamification_system.missions CASCADE;
DROP TABLE IF EXISTS gamification_system.mission_templates CASCADE;
DROP TABLE IF EXISTS gamification_system.user_ranks CASCADE;
DROP TABLE IF EXISTS gamification_system.user_stats CASCADE;
DROP TABLE IF EXISTS gamification_system.notifications CASCADE;
DROP TABLE IF EXISTS gamification_system.maya_ranks CASCADE;
DROP TABLE IF EXISTS progress_tracking.module_progress CASCADE;
DROP TABLE IF EXISTS educational_content.modules CASCADE;
"
```

---

## 9. CHECKLIST DE EJECUCIÓN

### Pre-ejecución
- [ ] Acceso SSH al servidor verificado
- [ ] Credenciales de BD disponibles
- [ ] Archivos SQL copiados al servidor
- [ ] Backup creado

### Ejecución
- [ ] Script SQL ejecutado sin errores
- [ ] Verificación de tablas OK
- [ ] Verificación de seeds OK
- [ ] Trigger activo verificado

### Post-ejecución
- [ ] Backend reiniciado
- [ ] Nuevo usuario registrado correctamente
- [ ] Dashboard carga sin errores
- [ ] Endpoints responden correctamente

---

## 10. RESULTADO ESPERADO

Después de ejecutar la corrección:

| Error Original | Estado Esperado |
|---------------|-----------------|
| 500 - notifications does not exist | ✅ 200 OK |
| 500 - module_progress does not exist | ✅ 200 OK |
| 500 - modules does not exist | ✅ 200 OK |
| 404 - ranks/current | ✅ 200 OK |
| 404 - ml-coins | ✅ 200 OK |
| 400 - missions/daily | ✅ 200 OK |
| 400 - missions/weekly | ✅ 200 OK |

---

**Documentación de Fase 5 completada.**
