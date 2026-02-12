# FLUJO DE CARGA LIMPIA - GAMILIT DATABASE

**Fecha:** 2025-12-18
**Version:** 1.0
**Cumple con:** DIRECTIVA-POLITICA-CARGA-LIMPIA.md

---

## RESUMEN

Este documento describe los 3 escenarios de inicializacion de base de datos y que script usar en cada caso.

---

## ESCENARIOS Y SCRIPTS

### Escenario 1: INSTALACION NUEVA (Usuario y BD no existen)

**Usar:** `init-database.sh` o `init-database-v3.sh`

**Ubicacion:** `apps/database/scripts/`

```bash
cd apps/database/scripts  # desde raiz del proyecto

# Opcion A: Con password manual
./init-database.sh --env dev --password "tu_password_seguro"

# Opcion B: Con dotenv-vault (recomendado para produccion)
./manage-secrets.sh generate --env prod
./manage-secrets.sh sync --env prod
./init-database-v3.sh --env prod
```

**Que hace:**
1. Crea usuario PostgreSQL `gamilit_user`
2. Crea base de datos `gamilit_platform`
3. Ejecuta todos los DDL (16 fases)
4. Carga todos los Seeds (38+ archivos)
5. Genera archivo de credenciales
6. Actualiza .env de backend/frontend

---

### Escenario 2: RECREACION COMPLETA (Usuario existe, BD se resetea)

**Usar:** `drop-and-recreate-database.sh`

**Ubicacion:** `apps/database/`

```bash
cd apps/database  # desde raiz del proyecto

# Con DATABASE_URL
export DATABASE_URL="postgresql://gamilit_user:password@localhost:5432/gamilit_platform"
./drop-and-recreate-database.sh

# O pasando como argumento
./drop-and-recreate-database.sh "postgresql://gamilit_user:password@localhost:5432/gamilit_platform"
```

**Que hace:**
1. Desconecta usuarios activos
2. DROP DATABASE gamilit_platform
3. CREATE DATABASE gamilit_platform
4. Llama a `create-database.sh` automaticamente

---

### Escenario 3: SOLO DDL + SEEDS (BD limpia ya existe)

**Usar:** `create-database.sh`

**Ubicacion:** `apps/database/`

```bash
cd apps/database  # desde raiz del proyecto

export DATABASE_URL="postgresql://gamilit_user:password@localhost:5432/gamilit_platform"
./create-database.sh
```

**Que hace:**
1. Habilita extensiones (pgcrypto, uuid-ossp)
2. Ejecuta DDL en 16 fases ordenadas
3. Carga Seeds de produccion (38+ archivos)
4. Genera reporte de objetos creados

---

## DIAGRAMA DE DECISION

```
¿Existe el usuario gamilit_user?
│
├── NO ──► Escenario 1: ./scripts/init-database.sh --env dev
│
└── SI ──► ¿Necesitas eliminar TODOS los datos?
           │
           ├── SI ──► Escenario 2: ./drop-and-recreate-database.sh
           │
           └── NO ──► ¿La BD esta vacia (recien creada)?
                      │
                      ├── SI ──► Escenario 3: ./create-database.sh
                      │
                      └── NO ──► Escenario 2: ./drop-and-recreate-database.sh
```

---

## COMANDOS RAPIDOS POR AMBIENTE

### Desarrollo (primera vez)

```bash
cd apps/database/scripts
./init-database.sh --env dev --password "dev_password_123"
```

### Desarrollo (recrear BD)

```bash
cd apps/database
export DATABASE_URL="postgresql://gamilit_user:dev_password_123@localhost:5432/gamilit_platform"
./drop-and-recreate-database.sh
```

### Produccion (primera vez)

```bash
cd apps/database/scripts
./manage-secrets.sh generate --env prod
./manage-secrets.sh sync --env prod
./init-database-v3.sh --env prod
```

### Produccion (recrear BD)

```bash
cd apps/database
export DATABASE_URL="postgresql://gamilit_user:$DB_PASSWORD@localhost:5432/gamilit_platform"
./drop-and-recreate-database.sh
```

---

## VALIDACION POST-CARGA

Despues de cualquier escenario, validar con:

```bash
# Verificar conteo de objetos
psql "$DATABASE_URL" -c "
SELECT
    (SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog','information_schema','pg_toast')) as schemas,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema')) as tables,
    (SELECT COUNT(*) FROM pg_type WHERE typcategory = 'E') as enums
;"

# Verificar datos criticos
psql "$DATABASE_URL" -c "
SELECT 'tenants' as tabla, COUNT(*) FROM auth_management.tenants
UNION ALL SELECT 'users', COUNT(*) FROM auth.users
UNION ALL SELECT 'modules', COUNT(*) FROM educational_content.modules
UNION ALL SELECT 'maya_ranks', COUNT(*) FROM gamification_system.maya_ranks
UNION ALL SELECT 'feature_flags', COUNT(*) FROM system_configuration.feature_flags;
"
```

**Valores esperados:**
- Schemas: 15+
- Tablas: 60+
- ENUMs: 35+
- Tenants: 14+
- Users: 20+
- Modules: 5
- Maya Ranks: 5
- Feature Flags: 26+

---

## SCRIPTS DISPONIBLES

| Script | Ubicacion | Proposito |
|--------|-----------|-----------|
| `init-database.sh` | scripts/ | Crear usuario + BD + DDL + Seeds |
| `init-database-v3.sh` | scripts/ | Igual pero con dotenv-vault |
| `drop-and-recreate-database.sh` | ./ | Drop BD + Recrear + DDL + Seeds |
| `create-database.sh` | ./ | Solo DDL + Seeds (BD debe existir) |
| `reset-database.sh` | scripts/ | Reset BD (mantiene usuario) |
| `recreate-database.sh` | scripts/ | Drop completo (usuario + BD) |
| `manage-secrets.sh` | scripts/ | Gestionar passwords con vault |

---

## CUMPLIMIENTO DE DIRECTIVA

Este flujo cumple con DIRECTIVA-POLITICA-CARGA-LIMPIA.md:

- ✅ DDL es fuente de verdad
- ✅ BD es resultado de ejecutar DDL
- ✅ No se usan migrations
- ✅ Recreacion completa en cualquier momento
- ✅ Un comando = BD lista

---

**Ultima actualizacion:** 2025-12-18
