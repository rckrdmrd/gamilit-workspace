# Guia de Validacion y Troubleshooting - Produccion GAMILIT

> **Version:** 1.0.0
> **Fecha:** 2025-12-18
> **Servidor:** 74.208.126.102
> **Proposito:** Validar carga correcta de BD y resolver errores comunes

---

## Indice

1. [Validacion Rapida Post-Despliegue](#1-validacion-rapida-post-despliegue)
2. [Validacion Completa de Base de Datos](#2-validacion-completa-de-base-de-datos)
3. [Errores Comunes y Soluciones](#3-errores-comunes-y-soluciones)
4. [Scripts de Diagnostico](#4-scripts-de-diagnostico)
5. [Procedimiento de Recuperacion](#5-procedimiento-de-recuperacion)

---

## 1. Validacion Rapida Post-Despliegue

### 1.1 Checklist de Validacion (5 minutos)

Ejecutar estos comandos inmediatamente despues de desplegar:

```bash
# Definir conexion
export DATABASE_URL="postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform"

# 1. Verificar conexion a BD
psql "$DATABASE_URL" -c "SELECT version();"

# 2. Verificar schemas creados (deben ser 17+)
psql "$DATABASE_URL" -c "SELECT COUNT(*) as schemas FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');"

# 3. Verificar tenant principal (CRITICO)
psql "$DATABASE_URL" -c "SELECT id, name, slug, is_active FROM auth_management.tenants WHERE slug = 'gamilit-prod';"

# 4. Verificar usuarios cargados
psql "$DATABASE_URL" -c "SELECT COUNT(*) as usuarios FROM auth.users;"

# 5. Verificar health del backend
curl -s http://localhost:3006/api/health | head -20
```

### 1.2 Resultados Esperados

| Validacion | Resultado Esperado | Accion si Falla |
|------------|-------------------|-----------------|
| Conexion BD | Version PostgreSQL 16+ | Verificar credenciales |
| Schemas | 17 o mas | Ejecutar `create-database.sh` |
| Tenant Principal | 1 fila con `is_active=true` | Ver seccion 3.1 |
| Usuarios | 48 o mas | Ejecutar seeds de auth |
| Health Backend | `{"status":"ok"}` | Ver logs PM2 |

---

## 2. Validacion Completa de Base de Datos

### 2.1 Script de Validacion Completa

Crear y ejecutar este script para validacion exhaustiva:

```bash
#!/bin/bash
# validate-production-db.sh

DATABASE_URL="${DATABASE_URL:-postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform}"

echo "=============================================="
echo "VALIDACION COMPLETA - BASE DE DATOS GAMILIT"
echo "=============================================="
echo ""

# Funcion para ejecutar query y mostrar resultado
run_check() {
    local description="$1"
    local query="$2"
    local expected="$3"

    result=$(psql "$DATABASE_URL" -t -c "$query" 2>/dev/null | tr -d ' ')

    if [ "$result" == "$expected" ] || [ -z "$expected" ]; then
        echo "✅ $description: $result"
    else
        echo "❌ $description: $result (esperado: $expected)"
    fi
}

echo "=== 1. SCHEMAS ==="
run_check "Total Schemas" "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');"

echo ""
echo "=== 2. TABLAS POR SCHEMA ==="
psql "$DATABASE_URL" -c "
SELECT
    table_schema as schema,
    COUNT(*) as tablas
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  AND table_type = 'BASE TABLE'
GROUP BY table_schema
ORDER BY table_schema;
"

echo ""
echo "=== 3. TENANTS (CRITICO) ==="
psql "$DATABASE_URL" -c "SELECT id, name, slug, is_active, subscription_tier FROM auth_management.tenants ORDER BY created_at;"

echo ""
echo "=== 4. USUARIOS ==="
run_check "Usuarios en auth.users" "SELECT COUNT(*) FROM auth.users;"
run_check "Perfiles en auth_management.profiles" "SELECT COUNT(*) FROM auth_management.profiles;"

echo ""
echo "=== 5. CONTENIDO EDUCATIVO ==="
run_check "Modulos" "SELECT COUNT(*) FROM educational_content.modules;"
run_check "Ejercicios" "SELECT COUNT(*) FROM educational_content.exercises;"

echo ""
echo "=== 6. GAMIFICACION ==="
run_check "Rangos Maya" "SELECT COUNT(*) FROM gamification_system.maya_ranks;"
run_check "Logros" "SELECT COUNT(*) FROM gamification_system.achievements;"
run_check "Categorias Tienda" "SELECT COUNT(*) FROM gamification_system.shop_categories;"
run_check "Items Tienda" "SELECT COUNT(*) FROM gamification_system.shop_items;"

echo ""
echo "=== 7. SOCIAL ==="
run_check "Escuelas" "SELECT COUNT(*) FROM social_features.schools;"
run_check "Aulas" "SELECT COUNT(*) FROM social_features.classrooms;"

echo ""
echo "=== 8. CONFIGURACION ==="
run_check "Feature Flags" "SELECT COUNT(*) FROM system_configuration.feature_flags;"
run_check "Parametros Gamificacion" "SELECT COUNT(*) FROM system_configuration.gamification_parameters;"

echo ""
echo "=============================================="
echo "VALIDACION COMPLETADA"
echo "=============================================="
```

### 2.2 Valores Esperados Post-Carga

| Entidad | Tabla | Cantidad Minima |
|---------|-------|-----------------|
| **Tenants** | `auth_management.tenants` | 14 (1 principal + 13 usuarios) |
| **Usuarios** | `auth.users` | 48 |
| **Perfiles** | `auth_management.profiles` | 48 |
| **Modulos** | `educational_content.modules` | 5 |
| **Ejercicios** | `educational_content.exercises` | 23 |
| **Rangos Maya** | `gamification_system.maya_ranks` | 5 |
| **Logros** | `gamification_system.achievements` | 30 |
| **Categorias Tienda** | `gamification_system.shop_categories` | 5 |
| **Items Tienda** | `gamification_system.shop_items` | 20 |
| **Escuelas** | `social_features.schools` | 2 |
| **Aulas** | `social_features.classrooms` | 4 |
| **Feature Flags** | `system_configuration.feature_flags` | 26 |

---

## 3. Errores Comunes y Soluciones

### 3.1 ERROR: "No hay tenants activos en el sistema"

**Sintoma:**
```
POST /api/v1/auth/register → 500 Internal Server Error
"No hay tenants activos en el sistema. Contacte al administrador."
```

**Causa:** La tabla `auth_management.tenants` esta vacia o no tiene tenants con `is_active=true`.

**Diagnostico:**
```bash
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM auth_management.tenants WHERE is_active = true;"
```

**Solucion Rapida (SQL directo):**
```sql
-- Conectar a la BD
psql "$DATABASE_URL"

-- Insertar tenant principal
INSERT INTO auth_management.tenants (
    id, name, slug, domain, logo_url, subscription_tier,
    max_users, max_storage_gb, is_active, settings, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'GAMILIT Platform',
    'gamilit-prod',
    'gamilit.com',
    '/assets/logo-gamilit.png',
    'enterprise',
    10000,
    100,
    true,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "features": {"analytics_enabled": true, "gamification_enabled": true, "social_features_enabled": true}}'::jsonb,
    '{"environment": "production", "version": "2.0"}'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    is_active = true,
    updated_at = NOW();

-- Verificar
SELECT id, name, slug, is_active FROM auth_management.tenants;
```

**Solucion Completa (Seeds):**
```bash
cd /path/to/gamilit/apps/database
psql "$DATABASE_URL" -f seeds/prod/auth_management/01-tenants.sql
psql "$DATABASE_URL" -f seeds/prod/auth_management/02-tenants-production.sql
```

### 3.2 ERROR: "relation does not exist"

**Sintoma:**
```
ERROR: relation "auth_management.tenants" does not exist
```

**Causa:** El DDL no se ejecuto correctamente.

**Solucion:**
```bash
cd /path/to/gamilit/apps/database
./create-database.sh "$DATABASE_URL"
```

### 3.3 ERROR: "password authentication failed"

**Sintoma:**
```
FATAL: password authentication failed for user "gamilit_user"
```

**Solucion:**
```bash
# Como usuario postgres
sudo -u postgres psql

# Resetear password
ALTER USER gamilit_user WITH PASSWORD 'nueva_password_segura';

# Verificar
\du gamilit_user
```

### 3.4 ERROR: "CORS blocked"

**Sintoma:**
```
Access to fetch at 'http://74.208.126.102:3006/api' from origin 'http://74.208.126.102:3005' has been blocked by CORS policy
```

**Diagnostico:**
```bash
grep CORS_ORIGIN apps/backend/.env.production
```

**Solucion:**
```bash
# Editar apps/backend/.env.production
CORS_ORIGIN=http://74.208.126.102:3005,http://74.208.126.102,https://74.208.126.102

# Reiniciar backend
pm2 restart gamilit-backend
```

### 3.5 ERROR: "Cannot find module"

**Sintoma:**
```
Error: Cannot find module '/path/to/dist/main.js'
```

**Solucion:**
```bash
cd apps/backend
npm install
npm run build
pm2 restart gamilit-backend
```

---

## 4. Scripts de Diagnostico

### 4.1 Script: Diagnostico Completo del Sistema

Guardar como `diagnose-production.sh`:

```bash
#!/bin/bash
# diagnose-production.sh - Diagnostico completo del sistema GAMILIT

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DATABASE_URL="${DATABASE_URL:-postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform}"
BACKEND_URL="http://localhost:3006"
FRONTEND_URL="http://localhost:3005"

echo "=============================================="
echo "   DIAGNOSTICO SISTEMA GAMILIT PRODUCCION"
echo "=============================================="
echo ""

# 1. PM2 Status
echo -e "${YELLOW}=== 1. ESTADO PM2 ===${NC}"
pm2 list 2>/dev/null || echo -e "${RED}PM2 no disponible${NC}"
echo ""

# 2. Backend Health
echo -e "${YELLOW}=== 2. HEALTH BACKEND ===${NC}"
health=$(curl -s "$BACKEND_URL/api/health" 2>/dev/null)
if [ -n "$health" ]; then
    echo -e "${GREEN}Backend respondiendo:${NC}"
    echo "$health" | head -5
else
    echo -e "${RED}Backend NO responde${NC}"
fi
echo ""

# 3. Frontend
echo -e "${YELLOW}=== 3. FRONTEND ===${NC}"
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)
if [ "$frontend_status" == "200" ]; then
    echo -e "${GREEN}Frontend OK (HTTP $frontend_status)${NC}"
else
    echo -e "${RED}Frontend ERROR (HTTP $frontend_status)${NC}"
fi
echo ""

# 4. Database Connection
echo -e "${YELLOW}=== 4. CONEXION BASE DE DATOS ===${NC}"
db_version=$(psql "$DATABASE_URL" -t -c "SELECT version();" 2>/dev/null | head -1)
if [ -n "$db_version" ]; then
    echo -e "${GREEN}BD conectada:${NC} $db_version"
else
    echo -e "${RED}No se puede conectar a la BD${NC}"
fi
echo ""

# 5. Critical Tables
echo -e "${YELLOW}=== 5. TABLAS CRITICAS ===${NC}"

check_table() {
    local table=$1
    local count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
    if [ -n "$count" ] && [ "$count" -gt 0 ]; then
        echo -e "${GREEN}✅ $table: $count registros${NC}"
    else
        echo -e "${RED}❌ $table: VACIO o ERROR${NC}"
    fi
}

check_table "auth_management.tenants"
check_table "auth.users"
check_table "auth_management.profiles"
check_table "educational_content.modules"
check_table "educational_content.exercises"
check_table "gamification_system.maya_ranks"
check_table "gamification_system.achievements"
echo ""

# 6. Tenant Principal
echo -e "${YELLOW}=== 6. TENANT PRINCIPAL (CRITICO) ===${NC}"
tenant=$(psql "$DATABASE_URL" -t -c "SELECT slug, is_active FROM auth_management.tenants WHERE slug = 'gamilit-prod';" 2>/dev/null)
if [ -n "$tenant" ]; then
    echo -e "${GREEN}Tenant encontrado:${NC} $tenant"
else
    echo -e "${RED}❌ TENANT PRINCIPAL NO EXISTE - REGISTRO NO FUNCIONARA${NC}"
    echo -e "${YELLOW}Ejecutar: psql \$DATABASE_URL -f seeds/prod/auth_management/01-tenants.sql${NC}"
fi
echo ""

# 7. Disk Space
echo -e "${YELLOW}=== 7. ESPACIO EN DISCO ===${NC}"
df -h / | tail -1
echo ""

# 8. Memory
echo -e "${YELLOW}=== 8. MEMORIA ===${NC}"
free -h | head -2
echo ""

echo "=============================================="
echo "   DIAGNOSTICO COMPLETADO"
echo "=============================================="
```

### 4.2 Script: Reparar Datos Faltantes

Guardar como `repair-missing-data.sh`:

```bash
#!/bin/bash
# repair-missing-data.sh - Reparar datos faltantes en produccion

set -e

DATABASE_URL="${DATABASE_URL:-postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$SCRIPT_DIR/../apps/database"

echo "=============================================="
echo "   REPARACION DE DATOS FALTANTES"
echo "=============================================="

# 1. Verificar y reparar tenants
echo ""
echo "=== Verificando Tenants ==="
tenant_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM auth_management.tenants WHERE is_active = true;" | tr -d ' ')

if [ "$tenant_count" -eq 0 ]; then
    echo "❌ No hay tenants activos. Cargando seeds..."
    psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/auth_management/01-tenants.sql"
    psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/auth_management/02-tenants-production.sql"
    echo "✅ Tenants cargados"
else
    echo "✅ Tenants OK ($tenant_count activos)"
fi

# 2. Verificar modulos
echo ""
echo "=== Verificando Modulos ==="
module_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM educational_content.modules;" | tr -d ' ')

if [ "$module_count" -lt 5 ]; then
    echo "❌ Modulos incompletos ($module_count). Cargando..."
    psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/educational_content/01-modules.sql"
    echo "✅ Modulos cargados"
else
    echo "✅ Modulos OK ($module_count)"
fi

# 3. Verificar rangos maya
echo ""
echo "=== Verificando Rangos Maya ==="
rank_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM gamification_system.maya_ranks;" | tr -d ' ')

if [ "$rank_count" -lt 5 ]; then
    echo "❌ Rangos Maya incompletos ($rank_count). Cargando..."
    psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/gamification_system/03-maya_ranks.sql"
    echo "✅ Rangos Maya cargados"
else
    echo "✅ Rangos Maya OK ($rank_count)"
fi

# 4. Verificar feature flags
echo ""
echo "=== Verificando Feature Flags ==="
flag_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM system_configuration.feature_flags;" | tr -d ' ')

if [ "$flag_count" -lt 20 ]; then
    echo "❌ Feature flags incompletos ($flag_count). Cargando..."
    psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/system_configuration/01-feature_flags_seeds.sql"
    echo "✅ Feature flags cargados"
else
    echo "✅ Feature flags OK ($flag_count)"
fi

echo ""
echo "=============================================="
echo "   REPARACION COMPLETADA"
echo "=============================================="
echo ""
echo "Reiniciar backend para aplicar cambios:"
echo "  pm2 restart gamilit-backend"
```

---

## 5. Procedimiento de Recuperacion

### 5.1 Recuperacion Completa (Reset Total)

Si la base de datos esta corrupta o incompleta, seguir estos pasos:

```bash
# 1. Detener aplicaciones
pm2 stop all

# 2. Ir al directorio de database
cd /path/to/gamilit/apps/database

# 3. Configurar conexion
export DATABASE_URL="postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform"

# 4. OPCION A: Drop y recrear (ELIMINA TODO)
./drop-and-recreate-database.sh "$DATABASE_URL"

# 4. OPCION B: Solo recrear estructura (si BD nueva)
./create-database.sh "$DATABASE_URL"

# 5. Reiniciar aplicaciones
pm2 start all

# 6. Verificar
curl http://localhost:3006/api/health
```

### 5.2 Recuperacion Parcial (Solo Seeds)

Si el DDL esta correcto pero faltan datos:

```bash
cd /path/to/gamilit/apps/database
export DATABASE_URL="postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform"

# Cargar seeds en orden
# 1. System Configuration (sin dependencias)
psql "$DATABASE_URL" -f seeds/prod/system_configuration/01-system_settings.sql
psql "$DATABASE_URL" -f seeds/prod/system_configuration/01-feature_flags_seeds.sql
psql "$DATABASE_URL" -f seeds/prod/system_configuration/02-gamification_parameters_seeds.sql

# 2. Auth Management (tenants y auth_providers)
psql "$DATABASE_URL" -f seeds/prod/auth_management/01-tenants.sql
psql "$DATABASE_URL" -f seeds/prod/auth_management/02-tenants-production.sql
psql "$DATABASE_URL" -f seeds/prod/auth_management/02-auth_providers.sql

# 3. Auth (usuarios)
psql "$DATABASE_URL" -f seeds/prod/auth/01-demo-users.sql
psql "$DATABASE_URL" -f seeds/prod/auth/02-production-users.sql

# 4. Educational Content (modulos ANTES de profiles)
psql "$DATABASE_URL" -f seeds/prod/educational_content/01-modules.sql

# 5. Profiles (dispara trigger initialize_user_stats)
psql "$DATABASE_URL" -f seeds/prod/auth_management/04-profiles-complete.sql
psql "$DATABASE_URL" -f seeds/prod/auth_management/06-profiles-production.sql

# 6. Social Features
psql "$DATABASE_URL" -f seeds/prod/social_features/00-schools-default.sql
psql "$DATABASE_URL" -f seeds/prod/social_features/01-schools.sql
psql "$DATABASE_URL" -f seeds/prod/social_features/02-classrooms.sql

# 7. Educational Content (ejercicios)
psql "$DATABASE_URL" -f seeds/prod/educational_content/02-exercises-module1.sql
psql "$DATABASE_URL" -f seeds/prod/educational_content/03-exercises-module2.sql
psql "$DATABASE_URL" -f seeds/prod/educational_content/04-exercises-module3.sql
psql "$DATABASE_URL" -f seeds/prod/educational_content/05-exercises-module4.sql
psql "$DATABASE_URL" -f seeds/prod/educational_content/06-exercises-module5.sql

# 8. Gamification
psql "$DATABASE_URL" -f seeds/prod/gamification_system/01-achievement_categories.sql
psql "$DATABASE_URL" -f seeds/prod/gamification_system/03-maya_ranks.sql
psql "$DATABASE_URL" -f seeds/prod/gamification_system/04-achievements.sql
psql "$DATABASE_URL" -f seeds/prod/gamification_system/12-shop_categories.sql
psql "$DATABASE_URL" -f seeds/prod/gamification_system/13-shop_items.sql
```

### 5.3 Orden de Carga de Seeds (Dependencias)

```
                    ORDEN DE CARGA DE SEEDS

    ┌─────────────────────────────────────────────────┐
    │ 1. system_configuration (sin dependencias)       │
    │    - system_settings                            │
    │    - feature_flags                              │
    │    - gamification_parameters                    │
    └─────────────────────┬───────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │ 2. auth_management/tenants                      │
    │    - 01-tenants.sql (tenant principal)          │
    │    - 02-tenants-production.sql (usuarios)       │
    └─────────────────────┬───────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │ 3. auth/users                                   │
    │    - 01-demo-users.sql                          │
    │    - 02-production-users.sql                    │
    └─────────────────────┬───────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │ 4. educational_content/modules                   │
    │    - 01-modules.sql (ANTES de profiles!)        │
    └─────────────────────┬───────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │ 5. auth_management/profiles                     │
    │    - 04-profiles-complete.sql                   │
    │    - 06-profiles-production.sql                 │
    │    (Dispara trigger initialize_user_stats)      │
    └─────────────────────┬───────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │ 6. social_features                              │
    │    - schools → classrooms → members             │
    └─────────────────────┬───────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │ 7. educational_content/exercises                │
    │    - exercises-module1 a module5                │
    └─────────────────────┬───────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │ 8. gamification_system                          │
    │    - maya_ranks, achievements, shop             │
    └─────────────────────────────────────────────────┘
```

---

## Apendice: Queries de Verificacion Rapida

```sql
-- Verificar tenant principal
SELECT id, name, slug, is_active
FROM auth_management.tenants
WHERE slug = 'gamilit-prod';

-- Contar entidades principales
SELECT
    (SELECT COUNT(*) FROM auth_management.tenants) as tenants,
    (SELECT COUNT(*) FROM auth.users) as users,
    (SELECT COUNT(*) FROM auth_management.profiles) as profiles,
    (SELECT COUNT(*) FROM educational_content.modules) as modules,
    (SELECT COUNT(*) FROM educational_content.exercises) as exercises,
    (SELECT COUNT(*) FROM gamification_system.maya_ranks) as ranks,
    (SELECT COUNT(*) FROM gamification_system.achievements) as achievements;

-- Verificar usuarios por rol
SELECT role, COUNT(*)
FROM auth_management.profiles
GROUP BY role;

-- Verificar ejercicios por modulo
SELECT m.name, COUNT(e.id) as exercises
FROM educational_content.modules m
LEFT JOIN educational_content.exercises e ON e.module_id = m.id
GROUP BY m.name
ORDER BY m.order_index;
```

---

## Contacto

Para problemas no cubiertos en esta guia:
1. Revisar logs: `pm2 logs`
2. Consultar `GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md`
3. Revisar `docs/DEPLOYMENT.md`

---

> **Ultima actualizacion:** 2025-12-18
> **Version:** 1.0.0
