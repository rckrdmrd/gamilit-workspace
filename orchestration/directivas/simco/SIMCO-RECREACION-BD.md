# SIMCO-RECREACION-BD - Directiva de Recreacion de Base de Datos

**Version:** 1.0.0
**Fecha:** 2026-01-18
**Aplica a:** Proyecto GAMILIT
**Responsable:** @PERFIL_DBA, @PERFIL_DEVENV

---

## PROPOSITO

Esta directiva define el proceso oficial para recrear la base de datos de GAMILIT, garantizando la sincronizacion de credenciales entre todos los archivos de configuracion y el respaldo adecuado de credenciales anteriores.

---

## CUANDO APLICAR

- Recreacion completa de la base de datos
- Cambio de credenciales (rotacion)
- Nuevo setup de desarrollo
- Recuperacion de estado limpio

---

## PREREQUISITOS

1. Acceso sudo para operar como usuario postgres
2. PostgreSQL corriendo en puerto **5432**
3. Permisos de escritura en:
   - `apps/database/`
   - `apps/backend/`

---

## FLUJO OFICIAL DE RECREACION

### Opcion A: Recreacion Completa (Usuario + BD)

```bash
# Desde apps/database/scripts/
./force-recreate-all.sh
```

Este script automaticamente:
1. Respalda credenciales anteriores en `credentials-backups/`
2. Obtiene password de `.env` existente o genera uno nuevo
3. Elimina BD y usuario existentes
4. Crea nuevo usuario y BD
5. Actualiza TODOS los archivos .env
6. Valida conexion con nuevas credenciales

### Opcion B: Recreacion Solo BD (Mantener Usuario)

```bash
# Desde apps/database/scripts/
./reset-database.sh --env dev
```

### Opcion C: Recreacion con dotenv-vault (Recomendado para Produccion)

```bash
# Paso 1: Generar nuevos secrets
./manage-secrets.sh generate --env prod

# Paso 2: Sincronizar a archivos
./manage-secrets.sh sync --env prod

# Paso 3: Inicializar BD
./init-database-v3.sh --env prod
```

---

## ARCHIVOS SINCRONIZADOS

Al recrear la BD, DEBEN actualizarse estos archivos:

| Archivo | Contenido |
|---------|-----------|
| `apps/database/database-credentials-dev.txt` | Host, puerto, user, password, connection string |
| `apps/backend/.env` | DB_HOST, DB_PORT, DB_USER, DB_PASSWORD |
| `apps/database/.env.database` | Variables de BD para scripts |

---

## RESPALDO DE CREDENCIALES

### Ubicacion de Respaldos

```
apps/database/credentials-backups/
├── database-credentials-dev.20260118_093456.txt
├── backend-env.20260118_093456
├── env-database.20260118_093456
└── ...
```

### Politica de Retencion

- Se mantienen los **ultimos 10 respaldos**
- Respaldos mas antiguos se eliminan automaticamente
- Para respaldos permanentes, copiar a ubicacion externa

---

## VALIDACION POST-RECREACION

El script DEBE validar:

1. **Conexion exitosa** con nuevas credenciales
2. **Archivos actualizados** con password correcto
3. **Permisos** de archivos (600 para archivos sensibles)

### Validacion Manual

```bash
# Verificar conexion
PGPASSWORD='password' psql -h localhost -p 5432 -U gamilit_user -d gamilit_platform -c "SELECT 1;"

# Verificar archivos sincronizados
grep "DB_PASSWORD" apps/backend/.env
grep "Password:" apps/database/database-credentials-dev.txt
```

---

## PROHIBICIONES

1. **NUNCA** hardcodear passwords en scripts
2. **NUNCA** commitear archivos .env con passwords reales
3. **NUNCA** recrear BD en produccion sin aprobacion
4. **NUNCA** omitir el paso de respaldo

---

## COORDINACION CON OTROS AGENTES

| Agente | Notificar Cuando |
|--------|------------------|
| @PERFIL_DEVENV | Cambio de puerto o host |
| @PERFIL_SECRETS_MANAGER | Rotacion de credenciales |
| @PERFIL_BACKEND | Actualizacion de .env |

---

## CHECKLIST PRE-RECREACION

- [ ] Verificar que no hay conexiones activas importantes
- [ ] Confirmar que hay respaldo reciente de datos (si aplica)
- [ ] Verificar permisos sudo
- [ ] Confirmar ambiente (dev/staging/prod)

## CHECKLIST POST-RECREACION

- [ ] Conexion validada exitosamente
- [ ] Archivos .env actualizados
- [ ] Backend puede conectarse
- [ ] Credenciales respaldadas
- [ ] Inventario actualizado (si cambio puerto/host)

---

## ERRORES COMUNES

### Error: "password authentication failed"

**Causa:** Desincronizacion entre password en BD y archivos .env

**Solucion:**
```bash
# Verificar password actual en BD vs archivos
grep "DB_PASSWORD" apps/backend/.env
# Comparar con el usado al crear usuario
```

### Error: "connection refused"

**Causa:** Puerto incorrecto (5432 vs 5432)

**Solucion:**
```bash
# Verificar puerto de PostgreSQL
sudo lsof -i:5432
# Actualizar DB_PORT en archivos .env
```

---

## REFERENCIAS

- Script principal: `apps/database/scripts/force-recreate-all.sh`
- Gestion de secrets: `apps/database/scripts/manage-secrets.sh`
- Inicializacion v3: `apps/database/scripts/init-database-v3.sh`
- Inventario de entorno: `orchestration/environment/ENVIRONMENT-INVENTORY.yml`

---

*Directiva creada: 2026-01-18*
*Ultima actualizacion: 2026-01-18*
