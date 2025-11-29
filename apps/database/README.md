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
├── _deprecated/             # Archivos obsoletos (histórico)
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

### Opción 3: Drop y Recrear (Testing de Carga Limpia) ⭐ VALIDADO DB-111

```bash
# ADVERTENCIA: Elimina TODOS los datos
# Para testing de carga limpia desde cero (drop + create automático)
export DATABASE_URL="postgresql://usuario:password@localhost:5432/gamilit_db"

# Ejecuta drop, recreate y create-database en un solo comando
./drop-and-recreate-database.sh
```

**Características (v2.3.7 - DB-111):**
- ✅ Desconecta automáticamente usuarios activos
- ✅ DROP DATABASE completo
- ✅ CREATE DATABASE automático
- ✅ Ejecuta create-database.sh automáticamente
- ✅ Carga 32 seeds PROD (100% de válidos)
- ✅ Reporta éxito/error con códigos de salida

**Validado:** DB-111 (2025-11-11) - Scripts 100% funcionales

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
9.7. **Notifications** - Sistema de notificaciones multi-canal ⭐ NUEVO
10. **Content Management** - Gestión de contenido
11. **Audit Logging** - Auditoría
12. **System Configuration** - Configuración
13. **Admin Dashboard** - Dashboard administrativo (vistas analíticas)
14. **LTI Integration** - Learning Tools Interoperability 1.3
15. **Public Schema** - Deshabilitado (reservado para PostgreSQL core)
16. **Seed Data** - Carga de datos iniciales de producción (34 archivos PROD) ⭐ ACTUALIZADO 2025-11-18

## Documentación Completa

La documentación detallada del proyecto de base de datos está en:

- **Inventarios de objetos DB**: `docs/90-transversal/inventarios-database/`
- **Guía de creación**: `docs/95-guias-desarrollo/GUIA-CREAR-BASE-DATOS.md`
- **Guía de referencias**: `docs/95-guias-desarrollo/GUIA-REFERENCIAS-SIMCO.md`
- **Guía de carga de usuarios**: `docs/GUIA-CARGA-USUARIOS-Y-PERFILES.md` ⭐ NUEVO
- **CHANGELOG de Database**: `docs/database/CHANGELOG.md` ⭐ NUEVO (2025-11-24)
- **Funciones Gamilit**: `ddl/schemas/gamilit/functions/README.md` ⭐ NUEVO (2025-11-24)

## Flujo de Registro de Usuario ⭐ NUEVO

### Inicialización Automática de Gamificación

Al crear un nuevo usuario, el sistema inicializa automáticamente las estadísticas de gamificación mediante el trigger `initialize_user_stats()`.

**Trigger:** `auth_management.profiles.trg_initialize_user_stats`
**Función:** `gamilit.initialize_user_stats()`
**Evento:** AFTER INSERT en `auth_management.profiles`

**Tablas Inicializadas (4):**

| Tabla | Propósito | Valores Iniciales |
|-------|-----------|-------------------|
| `gamification_system.user_stats` | Estadísticas XP/ML Coins | 100 ML Coins (bono bienvenida) |
| `gamification_system.comodines_inventory` | Inventario de comodines | Vacío (0 de cada tipo) |
| `gamification_system.user_ranks` | Rango Maya | Ajaw (nivel inicial) |
| `progress_tracking.module_progress` | Progreso de módulos | not_started, 0% para todos los módulos publicados |

**Flujo Completo:**

```
1. Backend: INSERT auth.users (email, password_hash)
2. Backend: INSERT auth_management.profiles (user_id, role, tenant_id)
3. Trigger: trg_initialize_user_stats se dispara automáticamente
4. Función: initialize_user_stats() ejecuta 4 INSERT en paralelo
5. Usuario listo con gamificación completa
```

**Roles con Gamificación:**
- `student` - Estudiantes (gamificación completa)
- `admin_teacher` - Maestros (gamificación completa)
- `super_admin` - Administradores (gamificación completa)

**Documentación Detallada:**
- Ver: `ddl/schemas/gamilit/functions/README.md` - Sección "initialize_user_stats()"
- Ver: `docs/database/CHANGELOG.md` - [2.5.2] 2025-11-24 (5 bug fixes)

---

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

## Política de Carga Limpia

Este proyecto utiliza **Política de Carga Limpia** (Clean Load Policy):

- ✅ **DDL es la fuente de verdad** - Todos los cambios se realizan en archivos DDL
- ✅ **Sin migrations** - No se utilizan scripts de migración incremental
- ✅ **Recreación completa** - La BD se puede recrear desde cero en cualquier momento

Para más detalles, consultar: `orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md`

**Referencia:** [ADR-018 - Eliminación de Carpetas Migrations](docs/97-adr/ADR-018-removal-migrations-folders.md)

## Seeds ⭐ VALIDADO Y COMPLETADO DB-111

Los seeds están organizados por ambiente:

- **dev/**: Datos completos de desarrollo (usuarios demo, ejercicios, etc.)
- **staging/**: Datos de staging
- **prod/**: **32 archivos validados** (100% de seeds válidos) - 27 ejercicios educativos

### Seeds de Producción Detallados (v2.3.7 - DB-111)

**Estado:** ✅ 100% de cobertura - Todos los schemas tienen seeds necesarios

**Estructura por schema:**

| Schema | Archivos | Contenido | Estado |
|--------|----------|-----------|--------|
| `audit_logging/` | 1 archivo | Configuración por defecto | ✅ Agregado DB-111 |
| `auth/` | 1 archivo | Usuarios testing y demo | ✅ Validado |
| `auth_management/` | 3 archivos | Tenants, providers, 26 perfiles | ✅ Validado |
| `content_management/` | 1 archivo | Templates de contenido | ✅ Agregado DB-111 |
| `educational_content/` | 8 archivos | 5 módulos + 27 ejercicios + rubrics | ✅ Validado |
| `gamification_system/` | 9 archivos | Categorías, leaderboards, rangos Maya, achievements | ✅ Validado |
| `lti_integration/` | 1 archivo | Consumidores LTI | ✅ Agregado DB-111 |
| `progress_tracking/` | 1 archivo | Progreso inicial de módulos | ✅ Agregado DB-111 |
| `social_features/` | 3 archivos | Escuelas, aulas, miembros demo | ✅ Agregado DB-111 |
| `system_configuration/` | 4 archivos | Settings, flags, notificaciones, rate limits | ✅ Completado DB-111 |

**Total:** 32 seeds PROD ejecutándose (100% de válidos)

**Seeds Legacy (deprecated):**
- `auth_management/03-profiles.sql` → Reemplazado por `04-profiles-complete.sql` (v2.0)

**Ejercicios por módulo:**
- **Module 1** (Historiador Detective): 5 mecánicas con JSONB completo ✅ IMPLEMENTADO
- **Module 2** (Detective Textual): 5 mecánicas con análisis de textos ✅ IMPLEMENTADO
- **Module 3** (Científico Pensamiento Crítico): 5 mecánicas con evaluación ✅ IMPLEMENTADO
- **Module 4** (Creador Digital): 5 mecánicas con producción multimedia ⚠️ BACKLOG
- **Module 5** (Video Carta): 3 mecánicas con producción creativa ⚠️ BACKLOG

**Nota:** Módulos 4 y 5 están en backlog (ver sección "Módulos en Backlog" más abajo)

## Correcciones Aplicadas

### v2.3.7 - Validación y Seeds Completos (2025-11-11) 🆕 DB-111

**Estado:** ✅ Validación exhaustiva + 100% seeds PROD

#### Validación y Corrección de Documentación (FASE 1.7)

**Problema:** Discrepancias entre documentación y DDL físico

**Correcciones aplicadas:**

1. **DATABASE_INVENTORY.yml** - 7 propiedades corregidas
   - ✅ content_management: `tables: 6 → 8`
   - ✅ content_management: `functions: 3 → 0` (no existe directorio)
   - ✅ content_management: `triggers: 2 → 3`
   - ✅ content_management: `indexes: 4 → 2`
   - ✅ content_management: `rls_policies: 2 → 1`
   - ✅ Agregada lista explícita de 8 tablas

2. **CONTENT_MANAGEMENT_TRACEABILITY.yml** - Trazabilidad completa
   - ✅ Eliminadas 3 "tablas fantasma" (no existían físicamente)
   - ✅ Agregadas 3 tablas no documentadas:
     - `content_authors.sql` (12 columnas, 5 índices)
     - `content_categories.sql` (jerárquica, self-referential)
     - `media_metadata.sql`
   - ✅ 8 tablas completas documentadas con todos sus atributos

**Resultado:** ✅ 100% sincronización DDL ↔ Documentación

#### Seeds PROD Completos (FASE 1.8)

**Problema:** 9 seeds PROD (27%) no ejecutándose en create-database.sh

**Correcciones aplicadas:**

3. **Seed Legacy Identificado:**
   - ✅ `03-profiles.sql` (v1.0) movido a `_deprecated/`
   - ✅ Reemplazado por `04-profiles-complete.sql` (v2.0, 26 perfiles)

4. **8 Seeds Agregados a create-database.sh:**
   - ✅ `audit_logging/01-default-config.sql`
   - ✅ `system_configuration/04-rate_limits.sql`
   - ✅ `content_management/01-default-templates.sql`
   - ✅ `social_features/01-schools.sql`
   - ✅ `social_features/02-classrooms.sql`
   - ✅ `social_features/03-classroom-members.sql`
   - ✅ `progress_tracking/01-module_progress.sql`
   - ✅ `lti_integration/01-lti_consumers.sql`

**Resultado:**
- ✅ Seeds ejecutados: 24 → 32 (100% de válidos)
- ✅ 10 schemas con 100% cobertura
- ✅ Orden de dependencias validado

**Documentación:** Ver `orchestration/database/DB-111/` para reportes completos

---

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

## 📦 Módulos en Backlog (Fase 4)

**Fecha:** 2025-11-19 (DB-126)
**Estado:** BACKLOG - Evaluación manual/IA requerida

Los siguientes módulos están definidos en la estructura de datos pero marcados como **BACKLOG** (Fase 4) por requerir evaluación manual o con IA:

### Módulo 4: Lectura Digital (5 ejercicios) ⚠️ BACKLOG

- `verificador_fake_news` - Verificador de noticias falsas
- `infografia_interactiva` - Creación de infografía interactiva
- `quiz_tiktok` - Quiz estilo TikTok
- `navegacion_hipertextual` - Navegación hipertextual
- `analisis_memes` - Análisis de memes educativos

**Razón:** Requieren validación con IA (análisis de imágenes, verificación de fuentes, análisis multimodal)

### Módulo 5: Producción Lectora (3 ejercicios) ⚠️ BACKLOG

- `diario_multimedia` - Diario interactivo multimedia
- `comic_digital` - Resumen visual progresivo
- `video_carta` - Cápsula del tiempo digital

**Razón:** Requieren rúbricas de evaluación creativa y revisión humana/IA

### Estado de Implementación

- ✅ **Tipos definidos** en ENUM `exercise_type` (compatibilidad futura)
- ✅ **Seeds disponibles** en `_backlog/` (no se cargan por defecto)
- ❌ **Validadores SQL:** NO implementados (intencionado)
- ❌ **No auto-evaluables:** `auto_gradable = false`

**Roadmap:** Ver `docs/04-fase-backlog/` para plan de implementación (P1: Validadores parciales, P2: Revisión manual, P3: IA multimodal)

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

## Guía de Uso de Scripts (DB-111) ⭐ NUEVO

### Variables de Ambiente Requeridas

```bash
# Variable principal (REQUERIDA)
export DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Ejemplo desarrollo local
export DATABASE_URL="postgresql://gamilit_user:gamilit_password@localhost:5432/gamilit_db"

# Ejemplo producción
export DATABASE_URL="postgresql://prod_user:secure_pass@prod-host:5432/gamilit_prod"
```

### Workflow Recomendado

#### 1. Primera Instalación (Base de Datos Nueva)

```bash
# 1. Configurar variable de ambiente
export DATABASE_URL="postgresql://user:pass@localhost:5432/gamilit_db"

# 2. Crear base de datos (si no existe)
createdb gamilit_db

# 3. Ejecutar script de creación
cd apps/database
./create-database.sh
```

**Resultado esperado:**
- 16 fases DDL ejecutadas
- 32 seeds PROD cargados
- 0 errores
- Tiempo: ~30-60 segundos

#### 2. Desarrollo/Testing (Recreación Frecuente)

```bash
# Un solo comando que hace todo
export DATABASE_URL="postgresql://user:pass@localhost:5432/gamilit_db"
cd apps/database
./drop-and-recreate-database.sh
```

**Resultado esperado:**
- Base de datos eliminada y recreada
- DDL completo ejecutado
- Seeds cargados
- Tiempo: ~30-60 segundos

#### 3. Validación Post-Carga

```bash
# Verificar conteos de objetos
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema');"

# Verificar seeds cargados
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM auth_management.profiles;"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM educational_content.modules;"
```

**Resultado esperado:**
- ~99 tablas
- 26 perfiles
- 5 módulos

### Orden de Ejecución de Seeds (Importante)

Los seeds se ejecutan en orden de dependencias:

```
1. audit_logging (sin dependencias)
2. system_configuration (sin dependencias)
3. auth_management/tenants
4. auth_management/auth_providers
5. auth/users
6. auth_management/profiles (depende de users)
7. content_management (depende de users, tenants)
8. social_features (depende de users, profiles)
9. educational_content (depende de tenants)
10. progress_tracking (depende de educational_content, users)
11. lti_integration (depende de system_configuration)
12. gamification_system (depende de users)
```

**⚠️ No ejecutar seeds individualmente fuera de orden**

### Verificación de Integridad

```bash
# Verificar que todos los schemas existen
psql "$DATABASE_URL" << EOF
SELECT nspname FROM pg_namespace
WHERE nspname IN (
  'auth', 'auth_management', 'content_management',
  'educational_content', 'gamification_system', 'progress_tracking',
  'social_features', 'audit_logging', 'system_configuration',
  'lti_integration', 'admin_dashboard', 'storage', 'gamilit'
) ORDER BY nspname;
EOF
```

**Resultado esperado:** 13 schemas listados

### Script de Validación Exhaustiva

Para validar la integridad completa de la base de datos (útil después de migraciones o cambios):

```bash
# Ejecutar validación exhaustiva
cd apps/database
python3 scripts/validate_integrity.py
```

**Características del script:**
- ✅ Valida que todas las Foreign Keys apunten a tablas existentes
- ✅ Verifica que todos los ENUMs usados en tablas estén definidos
- ✅ Detecta funciones con referencias a tablas inexistentes
- ✅ Valida que triggers llamen a funciones válidas
- ✅ Identifica ENUMs duplicados en diferentes schemas
- ✅ Reporta problemas por severidad (CRÍTICO, ALTO, MEDIO, BAJO)

**Uso recomendado:**
- Después de aplicar migraciones
- Antes de despliegues a producción
- Para diagnóstico de problemas de integridad referencial

**Ubicación:** `apps/database/scripts/validate_integrity.py`

## Troubleshooting

### Error: "password authentication failed"

```bash
# Verificar que DATABASE_URL es correcta
echo $DATABASE_URL

# Verificar que PostgreSQL acepta la autenticación
psql -h localhost -U gamilit_user -d postgres -c "SELECT 1;"

# Si falla, revisar pg_hba.conf
# Debe tener: host all all 127.0.0.1/32 md5
```

### Error: "database already exists"

```bash
# Opción 1: Usar drop-and-recreate-database.sh
./drop-and-recreate-database.sh

# Opción 2: Drop manual + create
psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS gamilit_db;"
./create-database.sh
```

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

## Historial de Cambios Recientes

### 2025-11-24 - Correcciones Críticas + Documentación

**Funciones Corregidas:**
- ✅ `initialize_user_stats()` - 5 bug fixes críticos (ver CHANGELOG.md)
  - BUG FIX #1: Agregada inicialización de module_progress (CRÍTICO)
  - BUG FIX #2: Corrección de errores de clave duplicada en user_ranks
  - BUG FIX #3: Comentada función no implementada
  - Documentación de FKs clarificada

**Documentación Creada:**
- ✅ `docs/database/CHANGELOG.md` - Historial de cambios de BD
- ✅ `ddl/schemas/gamilit/functions/README.md` - Documentación de 16 funciones
- ✅ README.md actualizado - Flujo de registro de usuario documentado

**Validación:**
- ✅ Carga limpia exitosa (34 segundos)
- ✅ Tests de integración: 100% pasados
- ✅ Documentación 100% sincronizada con código

### 2025-11-11 - Validación Completa + Seeds 100% v2.3.7 - DB-111

Ver secciones anteriores para detalles de DB-111, DB-100, DB-099, etc.

---

**Última actualización:** 2025-11-24 (Correcciones Críticas + Documentación Completa)
**Versión del proyecto:** 2.5.2
