# Database - GAMILIT

Proyecto de base de datos PostgreSQL para la plataforma GAMILIT

## Estructura

```
apps/database/
├── ddl/                     # Definiciones DDL (schemas, tablas, funciones, etc.)
│   ├── 00-prerequisites.sql # Schemas + ENUMs base (ejecutar primero)
│   └── schemas/             # 13 schemas con todos los objetos
├── scripts/                 # Scripts operacionales
│   ├── init-database.sh     # Inicializar BD completa
│   ├── recreate-database.sh # Recrear BD desde cero
│   ├── reset-database.sh    # Reset BD manteniendo usuario
│   ├── inventory/           # Scripts para generar inventarios
│   └── ...                  # Otros scripts de gestión
├── seeds/                   # Datos iniciales por ambiente
│   ├── dev/                 # Datos de desarrollo
│   ├── staging/             # Datos de staging
│   └── prod/                # Datos de producción
├── migrations/              # Migraciones SQL para actualizar BD
└── create-database.sh       # Script maestro de creación
```

## Quick Start

### Opción 1: Crear Base de Datos Nueva (Recomendado)

```bash
# Configurar DATABASE_URL
export DATABASE_URL="postgresql://usuario:password@localhost:5432/gamilit"

# Ejecutar script maestro
./create-database.sh
```

### Opción 2: Inicializar con Usuario y Seeds

```bash
# Desarrollo
./scripts/init-database.sh --env dev

# Producción
./scripts/init-database.sh --env prod
```

### Opción 3: Recrear Completamente

```bash
# ADVERTENCIA: Elimina TODOS los datos
./scripts/recreate-database.sh --env dev
```

## Orden de Ejecución DDL

El script `create-database.sh` ejecuta los archivos DDL en este orden:

1. **Prerequisites** - Schemas y ENUMs base
2. **Gamilit Functions** - Funciones compartidas
3. **Auth Schema** - Autenticación Supabase
4. **Storage Schema** - Storage Supabase
5. **Auth Management** - Gestión de usuarios
6. **Educational Content** - Contenido educativo
7. **Gamification System** - Sistema de gamificación
8. **Progress Tracking** - Seguimiento de progreso
9. **Social Features** - Características sociales
10. **Content Management** - Gestión de contenido
11. **Audit Logging** - Auditoría
12. **System Configuration** - Configuración
13. **Admin Dashboard** - Dashboard administrativo

## Documentación Completa

La documentación detallada del proyecto de base de datos está en:

- **Inventarios de objetos DB**: `docs/90-transversal/inventarios-database/`
- **Guía de creación**: `docs/95-guias-desarrollo/GUIA-CREAR-BASE-DATOS.md`
- **Guía de referencias**: `docs/95-guias-desarrollo/GUIA-REFERENCIAS-SIMCO.md`
- **Guía de carga de usuarios**: `docs/GUIA-CARGA-USUARIOS-Y-PERFILES.md` ⭐ NUEVO

## Usuarios de Prueba

Para cargar usuarios de prueba en ambientes de desarrollo/staging:

```bash
# Opción 1: Cargar usuarios automáticamente (recomendado)
./scripts/load-users-and-profiles.sh

# Opción 2: Verificar usuarios existentes
./scripts/verify-users.sh

# Opción 3: Corregir tablas faltantes (si hay errores)
./scripts/fix-missing-gamification-tables.sh
```

**Credenciales disponibles después de la carga:**

| Tipo | Email | Password | Cantidad |
|------|-------|----------|----------|
| Super Admin | admin@gamilit.com | Test1234 | 2 |
| Teacher | teacher@gamilit.com | Test1234 | 2 |
| Student | student@gamilit.com | Test1234 | 4 |

**Total:** 8 usuarios de prueba

📖 **Documentación completa:** Ver `docs/GUIA-CARGA-USUARIOS-Y-PERFILES.md` para detalles sobre problemas conocidos y soluciones.

## Scripts Disponibles

### Gestión de Base de Datos

| Script | Descripción |
|--------|-------------|
| `create-database.sh` | Crea BD nueva ejecutando todos los DDL |
| `init-database.sh` | Inicializa BD con usuario y seeds |
| `recreate-database.sh` | Elimina y recrea BD completamente |
| `reset-database.sh` | Reset BD manteniendo usuario |
| `manage-secrets.sh` | Gestión de credenciales |
| `update-env-files.sh` | Actualiza archivos .env |

### Usuarios y Perfiles ⭐ NUEVO

| Script | Descripción |
|--------|-------------|
| `load-users-and-profiles.sh` | Carga usuarios y perfiles de prueba (8 usuarios) |
| `verify-users.sh` | Verifica usuarios y perfiles cargados |
| `fix-missing-gamification-tables.sh` | Crea tablas de gamificación faltantes |

### Inventarios y Utilidades

| Script | Descripción |
|--------|-------------|
| `inventory/list-tables.sh` | Lista todas las tablas |
| `inventory/list-enums.sh` | Lista todos los ENUMs |
| `inventory/list-functions.sh` | Lista todas las funciones |
| `inventory/generate-all-inventories.sh` | Genera todos los inventarios |

Ver más detalles en [scripts/README.md](scripts/README.md)

## Migraciones

Las migraciones en `migrations/` se aplican a bases de datos existentes:

```bash
# Aplicar migración específica
psql "$DATABASE_URL" -f migrations/2025-11-08-migrate-auth-provider-enum.sql
```

## Seeds

Los seeds están organizados por ambiente:

- **dev/**: Datos completos de desarrollo (usuarios demo, ejercicios, etc.)
- **staging/**: Datos de staging
- **prod/**: Datos mínimos de producción (configuración, providers)

## Troubleshooting

### Error: "psql: command not found"

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql
```

### Error: "connection refused"

```bash
# Verificar PostgreSQL está corriendo
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Verificar DATABASE_URL
echo $DATABASE_URL
```

### Ver logs de creación

Cada ejecución de `create-database.sh` genera un log:

```bash
cat apps/database/create-database-YYYYMMDD_HHMMSS.log
```

## Mantenimiento

- **Backups**: Los scripts de backup están en `orchestration/06-respaldos/`
- **Validaciones**: Scripts de validación en `scripts/inventory/`
- **Correcciones**: Scripts de corrección en `orchestration/scripts-correccion/database/`

## Soporte

Para problemas o preguntas:

1. Revisar este README y los logs
2. Consultar documentación en `docs/90-transversal/inventarios-database/`
3. Revisar scripts específicos en `scripts/README.md`

---

**Última actualización:** 2025-11-08 (Post-purga)
**Versión del proyecto:** 2.0
