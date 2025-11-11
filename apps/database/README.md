# Database - GAMILIT

Proyecto de base de datos PostgreSQL para la plataforma GAMILIT

## Estructura

```
apps/database/
├── ddl/                     # Definiciones DDL (schemas, tablas, funciones, etc.)
│   ├── 00-prerequisites.sql # Schemas + ENUMs base (ejecutar primero)
│   └── schemas/             # 14 schemas con todos los objetos
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

### Opción 3: Drop y Recrear (Testing de Carga Limpia)

```bash
# ADVERTENCIA: Elimina TODOS los datos
# Para testing de carga limpia desde cero (drop + create automático)
export DATABASE_URL="postgresql://usuario:password@localhost:5432/gamilit"

# Ejecuta drop, recreate y create-database en un solo comando
./drop-and-recreate-database.sh "$DATABASE_URL"
```

**Nota**: Este script ahora ejecuta automáticamente `create-database.sh` después del drop,
centralizando todo el proceso en un solo comando.

### Opción 4: Recrear con Seeds

```bash
# ADVERTENCIA: Elimina TODOS los datos
./scripts/recreate-database.sh --env dev
```

## Orden de Ejecución DDL

El script `create-database.sh` ejecuta los archivos DDL en este orden:

1. **Prerequisites** - Schemas y ENUMs base
2. **Gamilit Schema** - Funciones y vistas compartidas (utilities)
3. **Auth Schema** - Autenticación Supabase
4. **Storage Schema** - Storage Supabase
5. **Auth Management** - Gestión de usuarios
6. **Educational Content** - Contenido educativo
7. **Gamification System** - Sistema de gamificación
8. **Progress Tracking** - Seguimiento de progreso
9. **Social Features** - Características sociales
9.5. **FK Constraints Diferidos** - Resolución de dependencias circulares
10. **Content Management** - Gestión de contenido
11. **Audit Logging** - Auditoría
12. **System Configuration** - Configuración
13. **Admin Dashboard** - Dashboard administrativo (vistas analíticas)
14. **LTI Integration** - Learning Tools Interoperability 1.3
15. **Public Schema** - Deshabilitado (reservado para PostgreSQL core)
16. **Seed Data** - Carga de datos iniciales de producción (33 archivos PROD)

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
- **prod/**: Datos completos de producción (33 archivos, 27 ejercicios educativos)

### Seeds de Producción Detallados

**Estructura por schema:**

| Schema | Archivos | Contenido |
|--------|----------|-----------|
| `auth_management/` | 4 archivos | Tenants, auth providers, perfiles demo |
| `educational_content/` | 6 archivos | 5 módulos + 27 ejercicios (mecánicas completas) |
| `gamification_system/` | 9 archivos | Categorías, leaderboards, rangos Maya, achievements |
| `system_configuration/` | 3 archivos | Settings, feature flags, notificaciones |

**Ejercicios por módulo:**
- **Module 1** (Historiador Detective): 6 mecánicas con JSONB completo
- **Module 2** (Detective Textual): 5 mecánicas con análisis de textos
- **Module 3** (Científico Pensamiento Crítico): 6 mecánicas con evaluación
- **Module 4** (Creador Digital): 5 mecánicas con producción multimedia
- **Module 5** (Video Carta): 5 mecánicas con producción creativa (835 líneas JSONB)

## Correcciones Aplicadas

### v2.3.5 - Seeds Gamification UTF-8 + UUIDs Fixed (2025-11-11) 🆕

**Estado:** ✅ DB-100 completado

#### Problemas Corregidos:

**1. Encoding UTF-8 (P0):**
- ✅ `seeds/prod/gamification_system/07-ml_coins_transactions.sql` - Convertido a UTF-8
- ✅ `seeds/prod/gamification_system/08-user_achievements.sql` - Convertido a UTF-8
- ✅ `seeds/prod/gamification_system/09-comodines_inventory.sql` - Convertido a UTF-8
- **Problema resuelto:** Caracteres especiales (ó, ñ, á, é, í) corruptos → UTF-8 válido
- **Resultado:** 0 errores de encoding en ejecución

**2. UUIDs Inválidos (P0):**
- ✅ 5 UUIDs inválidos reemplazados con válidos
- **UUIDs corregidos:** Caracteres no-hexadecimales (g, h, i) reemplazados
- **Archivos:** 08-user_achievements.sql (5 UUIDs), 09-comodines_inventory.sql (5 UUIDs)
- **Resultado:** 0 errores de UUID en ejecución

**3. Validación Completa:**
- ✅ create-database.sh ejecuta 100% sin errores de encoding/UUIDs
- ✅ 16/16 fases completadas
- ✅ Seeds gamification técnicamente correctos (sin errores de sintaxis)

**Documentación:**
- 📄 Ver `orchestration/database/DB-100/` para detalles completos
- 📄 Ver `orchestration/TRAZA-TAREAS-DATABASE.md` (DB-098, DB-099, DB-100)

---

### v2.3.2 - Seeds Production-Ready + Modelo JSONB Puro (2025-11-11)

**Estado:** ✅ Fase 1-2 completadas (DB-095, DB-096)

#### Fase 1: Correcciones P0 - Seeds Production-Ready

**1. Expansión Module 5 (CORR-001):**
- ✅ `seeds/prod/educational_content/06-exercises-module5.sql`
- **Cambio:** 97 líneas → 835 líneas (+861%)
- **Contenido agregado:**
  - 3 templates completos (Diario, Científico, Carta)
  - 5 prompts detallados por ejercicio
  - 4 rúbricas de evaluación con criterios y pesos
  - JSONB estructura completa para producción creativa

**2. Migración Seeds DEV → PROD (CORR-002):**
- ✅ Creados 5 archivos nuevos de exercises:
  - `02-exercises-module1.sql` (6 mecánicas)
  - `03-exercises-module2.sql` (5 mecánicas)
  - `04-exercises-module3.sql` (6 mecánicas)
  - `05-exercises-module4.sql` (5 mecánicas)
  - `06-exercises-module5.sql` (5 mecánicas)
- **Total:** 27 ejercicios listos para producción
- **Incremento:** 10 ejercicios → 27 ejercicios (+170%)
- **Completitud:** 36% → 100% (+64 puntos)

**3. Eliminación Modelo Dual (CORR-003):**
- ✅ Removidas tablas legacy `assignment_answers` y `assignment_resources`
- ✅ Consolidado en modelo JSONB puro
- **Decisión arquitectónica:** Mantener flexibilidad JSONB sin normalización
- **Resultado:** Reducción de 16 → 14 tablas en educational_content

#### Fase 2: Actualización de Inventarios

**4. DATABASE_INVENTORY.yml actualizado (CORR-004):**
- ✅ seeds_produccion: 31 → 33 archivos
- ✅ educational_content.tables: 16 → 14 (eliminadas 2 legacy)
- ✅ Métricas actualizadas al 2025-11-11

**5. SEEDS_INVENTORY.yml creado (CORR-005):**
- ✅ Archivo NUEVO: 650+ líneas
- ✅ 67 seeds documentados (DEV + PROD)
- ✅ Metadata completa: líneas, registros, dependencias
- ✅ Grupos lógicos por schema y propósito

**Documentación:**
- 📄 Ver `orchestration/TRAZA-CORRECCIONES.md` para detalles completos
- 📄 Ver `orchestration/TRAZA-TAREAS-DATABASE.md` (DB-095, DB-096)
- 📄 Ver `orchestration/04-inventarios/database/SEEDS_INVENTORY.yml`

---

### v2.3.1 - Carga Limpia Exitosa (2025-11-11)

### Dependencia Circular Resuelta (DEP-001)

**Problema:** profiles.school_id FK creaba dependencia circular con schools tabla.

**Solución aplicada:**
- ✅ Comentada constraint en `ddl/schemas/auth_management/tables/03-profiles.sql`
- ✅ Creado FK diferido en `ddl/schemas/auth_management/fk-constraints/01-profiles-school-fk.sql`
- ✅ Agregada Fase 9.5 en `create-database.sh` para ejecutar FK constraints diferidos

**Resultado:** Script ahora ejecuta limpiamente en BD nueva sin errores.

### Seeds de Producción Corregidos (v2.0)

**Problemas identificados:**
- ❌ Uso de STRING en lugar de UUID (3 archivos)
- ❌ Columnas faltantes o con nombres incorrectos (5 archivos)
- ❌ Uso de NOW() en lugar de gamilit.now_mexico() (todos)

**Archivos reescritos (100% alineados con DDL):**
1. ✅ `seeds/prod/auth_management/01-tenants.sql` - v2.0
   - Convertido STRING → UUID
   - Agregada columna `slug` (NOT NULL requerida)
   - Agregadas 7 columnas faltantes

2. ✅ `seeds/prod/auth_management/02-auth_providers.sql` - v2.0
   - Convertido STRING → ENUM auth_provider
   - Estructura alineada con DDL completo

3. ✅ `seeds/prod/educational_content/01-modules.sql` - v2.0
   - Convertido STRING → UUID (5 módulos)
   - Agregadas columnas del schema completo

4. ✅ `seeds/prod/system_configuration/01-system_settings.sql` - v2.0
   - Corregidos nombres: `key` → `setting_key`, etc.
   - 7 configuraciones esenciales

5. ✅ `seeds/prod/system_configuration/02-feature_flags.sql` - v2.0
   - Corregidos nombres: `key` → `feature_key`, etc.
   - 6 feature flags básicos

**Ver detalles:** `REPORTE-CORRECCIONES-CARGA-LIMPIA-2025-11-11.md`

---

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

**Última actualización:** 2025-11-11 (Seeds Production-Ready v2.3.2 - DB-095/DB-096)
**Versión del proyecto:** 2.3.2
