# TRIGGER: Credenciales Sincronizadas

**ID:** TRIGGER-CRED-SYNC
**Version:** 1.0.0
**Tipo:** Validacion Post-Accion
**Aplica a:** Operaciones de recreacion de BD, rotacion de credenciales

---

## ACTIVACION

Este trigger se activa AUTOMATICAMENTE cuando:

1. Se ejecuta `force-recreate-all.sh`
2. Se ejecuta `manage-secrets.sh rotate`
3. Se modifica manualmente `DB_PASSWORD` en cualquier archivo
4. Se ejecuta `init-database-v3.sh` con `--password`

---

## VERIFICACIONES

### 1. Sincronizacion de Password

**Objetivo:** Todos los archivos deben tener el MISMO password

```bash
# Archivos a verificar
FILES=(
    "apps/backend/.env"
    "apps/database/.env.database"
    "apps/database/database-credentials-dev.txt"
)

# Extraer passwords
for file in "${FILES[@]}"; do
    grep -E "^DB_PASSWORD=|^Password:" "$file" 2>/dev/null
done
```

**Criterio:** TODOS los passwords deben coincidir

### 2. Sincronizacion de Puerto

**Objetivo:** Todos los archivos deben apuntar al puerto correcto (5432)

```bash
# Verificar puerto
grep -E "^DB_PORT=|:5432|:5432" apps/backend/.env apps/database/.env.database
```

**Criterio:** Puerto debe ser 5432 en todos los archivos

### 3. Conexion Funcional

**Objetivo:** Las credenciales deben permitir conexion

```bash
# Test de conexion
source apps/backend/.env
PGPASSWORD="$DB_PASSWORD" psql -h localhost -p $DB_PORT -U $DB_USER -d gamilit_platform -c "SELECT 1;"
```

**Criterio:** Conexion exitosa

### 4. Respaldo Existente

**Objetivo:** Debe existir respaldo de credenciales anteriores

```bash
# Verificar respaldos recientes (ultimas 24h)
find apps/database/credentials-backups/ -mtime -1 -type f | head -5
```

**Criterio:** Al menos 1 respaldo en ultimas 24h si hubo recreacion

---

## ACCION EN FALLO

### Si passwords no coinciden:

```
⚠️ TRIGGER-CRED-SYNC: Passwords desincronizados

   ACCION REQUERIDA:
   1. Identificar password correcto (el de la BD actual)
   2. Actualizar archivos desincronizados
   3. Validar conexion

   Ejecutar: ./force-recreate-all.sh --password "PASSWORD_CORRECTO"
   O manualmente actualizar cada archivo
```

### Si puerto incorrecto:

```
⚠️ TRIGGER-CRED-SYNC: Puerto incorrecto detectado

   ACCION REQUERIDA:
   Actualizar DB_PORT=5432 en:
   - apps/backend/.env
   - apps/database/.env.database
```

### Si conexion falla:

```
⚠️ TRIGGER-CRED-SYNC: Conexion a BD fallida

   DIAGNOSTICO:
   1. Verificar que PostgreSQL esta corriendo: sudo lsof -i:5432
   2. Verificar usuario existe: sudo -u postgres psql -c "\\du gamilit_user"
   3. Verificar password: Comparar .env con ALTER USER ejecutado
```

---

## INTEGRACION CON FLUJO CAPVED

| Fase | Verificacion |
|------|--------------|
| Pre-Ejecucion | Verificar respaldo existente de credenciales actuales |
| Post-Ejecucion | Ejecutar todas las verificaciones de este trigger |
| Documentacion | Registrar cambio de credenciales en traza si aplica |

---

## COMANDOS UTILES

### Script de Verificacion Rapida

```bash
#!/bin/bash
# verify-credentials-sync.sh

echo "=== Verificando Sincronizacion de Credenciales ==="

# Extraer passwords
BACKEND_PASS=$(grep "^DB_PASSWORD=" apps/backend/.env 2>/dev/null | cut -d= -f2)
DB_PASS=$(grep "^DB_PASSWORD=" apps/database/.env.database 2>/dev/null | cut -d= -f2)
CRED_PASS=$(grep "^Password:" apps/database/database-credentials-dev.txt 2>/dev/null | awk '{print $2}')

echo "Backend .env:     ${BACKEND_PASS:0:8}..."
echo ".env.database:    ${DB_PASS:0:8}..."
echo "credentials.txt:  ${CRED_PASS:0:8}..."

# Verificar sincronizacion
if [ "$BACKEND_PASS" = "$CRED_PASS" ]; then
    echo "✓ Passwords sincronizados"
else
    echo "✗ Passwords DESINCRONIZADOS"
    exit 1
fi

# Test conexion
if PGPASSWORD="$BACKEND_PASS" psql -h localhost -p 5432 -U gamilit_user -d gamilit_platform -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✓ Conexion exitosa"
else
    echo "✗ Conexion FALLIDA"
    exit 1
fi

echo "=== Sincronizacion OK ==="
```

---

## REFERENCIAS

- Directiva: `SIMCO-RECREACION-BD.md`
- Script principal: `apps/database/scripts/force-recreate-all.sh`
- Perfil responsable: `@PERFIL_DEVENV`, `@PERFIL_SECRETS_MANAGER`

---

*Trigger creado: 2026-01-18*
