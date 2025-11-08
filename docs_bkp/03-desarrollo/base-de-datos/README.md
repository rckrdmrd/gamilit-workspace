# Documentación de Base de Datos - GAMILIT Platform

**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
**Base de datos:** PostgreSQL 14+
**Última actualización:** 2025-11-02

---

## 📍 **Ubicación del Código**

Todos los archivos DDL, seeds, scripts y migraciones están en:

```
/apps/database/
├── ddl/                 # ✅ DDL completo (48 tablas, 11 schemas)
├── seeds/               # ✅ Seeds completos (32 archivos, 100%)
├── migrations/          # Migraciones futuras
└── scripts/             # Scripts de utilidad
```

**Fuente única de verdad:** `/apps/database/`

---

## 📚 Documentos Principales

### 1. [ESQUEMA-COMPLETO.md](./ESQUEMA-COMPLETO.md)
**Esquema completo de base de datos - 11 schemas, 48 tablas**

Contenido:
- Resumen ejecutivo de la arquitectura
- Descripción detallada de los 11 schemas
- Todas las 48 tablas con DDL y columnas clave
- Diagrama ERD en formato ASCII
- Relaciones entre tablas
- Patrones de diseño implementados

**Ideal para:** Comprender la estructura completa de la base de datos.

---

### 2. [TIPOS-Y-ENUMS.md](./TIPOS-Y-ENUMS.md)
**Tipos y ENUMs - 24 tipos enumerados**

Contenido:
- Listado completo de los 24 ENUMs
- Valores y descripciones de cada ENUM
- `rango_maya` - Sistema de rangos Maya (Ajaw → K'uk'ulkan)
- `exercise_type` - 27 tipos de ejercicios
- `comodin_type` - 3 power-ups (Pistas, Visión Lectora, Segunda Oportunidad)
- `achievement_category` - 7 categorías de logros
- Guía de uso y validación

**Ideal para:** Entender los tipos de datos y valores válidos en la plataforma.

---

### 3. [INDICES-Y-OPTIMIZACION.md](./INDICES-Y-OPTIMIZACION.md)
**Índices y optimización - 150+ índices**

Contenido:
- Listado completo de índices por schema y tabla
- Justificación de cada índice
- Índices compuestos para queries complejos
- Índices parciales para filtros frecuentes
- Índices GIN para JSONB y arrays
- Full-text search en español
- Vista materializada de leaderboards
- Estrategias de monitoreo y mantenimiento

**Ideal para:** Optimización de queries y performance tuning.

---

### 4. [TRIGGERS-Y-FUNCIONES.md](./TRIGGERS-Y-FUNCIONES.md)
**Triggers y funciones - 30 triggers, 26 funciones**

Contenido:
- Funciones utilitarias (timestamps, zona horaria México)
- 22 triggers de actualización automática de `updated_at`
- Triggers de lógica de negocio:
  - Inicialización de gamificación para nuevos usuarios
  - Actualización de stats al completar ejercicios
  - Recálculo automático de niveles
  - Auditoría de cambios críticos
- Funciones de gamificación:
  - `award_ml_coins()` - Con multiplicador de rango
  - `spend_ml_coins()` - Con validación de fondos
  - `calculate_level_from_xp()` - Fórmula de niveles
- Funciones de progreso y cleanup

**Ideal para:** Entender la lógica automática de la base de datos.

---

### 5. [MIGRACIONES.md](./MIGRACIONES.md)
**Historial de migraciones**

Contenido:
- Listado cronológico de migraciones
- Descripción detallada de cada migración
- Migration 011: Fix crítico de ENUMs
- Migration 013: Security hardening de refresh tokens
- Patches críticos aplicados
- Estrategia de rollback
- Orden de ejecución para setup desde cero

**Ideal para:** Entender la evolución de la base de datos y aplicar migraciones.

---

### 6. [DATOS-SEED.md](./DATOS-SEED.md)
**Datos seed - RFC-0001 (32 archivos, 100% completo)**

Contenido:
- **RFC-0001:** Nueva estructura de seeds (`/apps/database/seeds/dev/`)
- 11 schemas completos con seeds
- 45 achievements predefinidos
- 21 system settings + 5 feature flags
- 8 módulos educativos de Marie Curie
- 27 ejercicios interactivos completos
- 3 escuelas, 7 aulas, 4 equipos (social features)
- 4 biografías, 13 media files, 49 tags (content management)
- Datos de tracking y auditoría (progress_tracking, audit_logging)
- Usuarios demo y datos realistas

**Ideal para:** Inicializar base de datos con contenido base completo.

---

## 📊 Resumen de la Base de Datos

### Métricas Clave
- **Schemas:** 9
- **Tablas:** 48
- **ENUMs:** 24
- **Funciones:** 26
- **Triggers:** 30
- **Índices:** 150+
- **Vistas materializadas:** 1
- **Seeds:** 32 archivos (10,525 líneas SQL)

### Schemas Principales
1. **auth** - Usuarios base (1 tabla)
2. **auth_management** - Autenticación (9 tablas)
3. **gamification_system** - Gamificación (12 tablas)
4. **educational_content** - Contenido educativo (4 tablas)
5. **progress_tracking** - Seguimiento de progreso (5 tablas)
6. **social_features** - Features sociales (7 tablas)
7. **content_management** - Gestión de contenido (3 tablas)
8. **system_configuration** - Configuración (2 tablas)
9. **audit_logging** - Auditoría y logs (5 tablas)

### Características Destacadas
- **Multi-tenancy:** Soporte completo vía `tenant_id`
- **Gamificación robusta:** ML Coins, rangos Maya, achievements, power-ups
- **27 tipos de ejercicios:** Desde multiple choice hasta simulaciones
- **Full-text search:** En español para módulos y ejercicios
- **Auditoría completa:** Logs de cambios, actividad y seguridad
- **Optimización avanzada:** 150+ índices, vistas materializadas, índices GIN

---

## 🗂️ Estructura del Proyecto Database

### Ubicación Principal: `/apps/database/`

```
/apps/database/
├── ddl/
│   ├── schemas/
│   │   ├── auth/                  (1 tabla)
│   │   ├── auth_management/       (9 tablas)
│   │   ├── gamification_system/   (12 tablas)
│   │   ├── educational_content/   (4 tablas)
│   │   ├── content_management/    (3 tablas)
│   │   ├── social_features/       (7 tablas)
│   │   ├── progress_tracking/     (5 tablas)
│   │   ├── audit_logging/         (5 tablas)
│   │   └── system_configuration/  (2 tablas)
│   ├── functions/
│   ├── triggers/
│   └── types/
│
├── seeds/
│   ├── dev/                       (32 archivos, 100% completo)
│   │   ├── auth/                  (1 archivo,  107 líneas)
│   │   ├── auth_management/       (7 archivos, ~800 líneas)
│   │   ├── gamification_system/   (4 archivos, ~1,030 líneas)
│   │   ├── educational_content/   (7 archivos, 3,189 líneas)
│   │   ├── content_management/    (3 archivos, 1,734 líneas)
│   │   ├── social_features/       (4 archivos, 1,321 líneas)
│   │   ├── progress_tracking/     (2 archivos, 958 líneas)
│   │   ├── audit_logging/         (2 archivos, 1,198 líneas)
│   │   └── system_configuration/  (2 archivos, 469 líneas)
│   ├── staging/
│   └── production/
│
├── migrations/
└── scripts/
```

**Ver detalles completos:** `/apps/database/seeds/dev/README.md`

---

## 🚀 Guías Rápidas

### Setup desde Cero

```bash
cd /apps/database

# 1. Ejecutar DDL
psql -d glit_dev -f ddl/setup.sql

# 2. Ejecutar seeds (orden correcto)
cd seeds/dev

# Orden de dependencias:
psql -d glit_dev -f auth/01-demo-users.sql
for f in auth_management/*.sql; do psql -d glit_dev -f "$f"; done
for f in system_configuration/*.sql; do psql -d glit_dev -f "$f"; done
for f in gamification_system/*.sql; do psql -d glit_dev -f "$f"; done
for f in educational_content/*.sql; do psql -d glit_dev -f "$f"; done
for f in content_management/*.sql; do psql -d glit_dev -f "$f"; done
for f in social_features/*.sql; do psql -d glit_dev -f "$f"; done
for f in progress_tracking/*.sql; do psql -d glit_dev -f "$f"; done
for f in audit_logging/*.sql; do psql -d glit_dev -f "$f"; done
```

**Ver script automatizado:** `/apps/database/seeds/dev/README.md`

---

### Consultas Útiles

```sql
-- Ver todos los schemas
SELECT schema_name FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema');

-- Contar tablas por schema
SELECT table_schema, COUNT(*) as tables
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY table_schema;

-- Ver ENUMs
SELECT typname, enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
ORDER BY typname, e.enumsortorder;

-- Tamaño de base de datos
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Verificar seeds cargados
SELECT 'auth.users' as tabla, COUNT(*) FROM auth.users
UNION ALL
SELECT 'educational_content.modules', COUNT(*) FROM educational_content.modules
UNION ALL
SELECT 'gamification_system.achievements', COUNT(*) FROM gamification_system.achievements
UNION ALL
SELECT 'social_features.schools', COUNT(*) FROM social_features.schools;
```

---

## 📖 Glosario

### Términos Clave

**ML Coins:** Moneda virtual de la plataforma (ML = Marie Literaria)

**Rangos Maya:** Sistema de progresión Ajaw → Nacom → Ah K'in → Halach Uinic → K'uk'ulkan

**Comodines:** Power-ups (Pistas 15ML, Visión Lectora 25ML, Segunda Oportunidad 40ML)

**Achievements:** Logros desbloqueables (7 categorías: progress, streak, completion, social, special, mastery, exploration)

**Exercise Types:** 27 mecánicas de ejercicios diferentes

**Tenant:** Organización en el sistema multi-tenant

---

## 🔍 Búsqueda Rápida

### Por Concepto

**Autenticación:**
- Ver: ESQUEMA-COMPLETO.md → Schema auth_management
- Tablas: profiles, user_sessions, auth_attempts
- Seeds: `/apps/database/seeds/dev/auth/` + `/apps/database/seeds/dev/auth_management/`

**Gamificación:**
- Ver: ESQUEMA-COMPLETO.md → Schema gamification_system
- Ver: TRIGGERS-Y-FUNCIONES.md → award_ml_coins()
- Tablas: user_stats, user_ranks, achievements
- Seeds: `/apps/database/seeds/dev/gamification_system/`

**Ejercicios:**
- Ver: ESQUEMA-COMPLETO.md → Schema educational_content
- Ver: TIPOS-Y-ENUMS.md → exercise_type
- Tablas: modules, exercises
- Seeds: `/apps/database/seeds/dev/educational_content/` (8 módulos, 27 ejercicios)

**Configuración:**
- Ver: ESQUEMA-COMPLETO.md → Schema system_configuration
- Tablas: system_settings, feature_flags
- Seeds: `/apps/database/seeds/dev/system_configuration/` (21 settings, 5 flags)

**Features Sociales:**
- Ver: ESQUEMA-COMPLETO.md → Schema social_features
- Tablas: schools, classrooms, teams
- Seeds: `/apps/database/seeds/dev/social_features/` (3 escuelas, 7 aulas)

**Optimización:**
- Ver: INDICES-Y-OPTIMIZACION.md → Sección completa
- Índices por tabla y justificación

**Migraciones:**
- Ver: MIGRACIONES.md → Historial completo
- Orden de ejecución y rollbacks

**Datos Iniciales:**
- Ver: DATOS-SEED.md → RFC-0001 completo
- Ubicación: `/apps/database/seeds/dev/`
- 32 archivos, 10,525 líneas SQL, 11/11 schemas

---

## 📝 Mantenimiento

### Actualizar Documentación

Cuando se realicen cambios en la base de datos:

1. Actualizar el archivo correspondiente:
   - Nuevas tablas → ESQUEMA-COMPLETO.md
   - Nuevos ENUMs → TIPOS-Y-ENUMS.md
   - Nuevos índices → INDICES-Y-OPTIMIZACION.md
   - Nuevos triggers/funciones → TRIGGERS-Y-FUNCIONES.md
   - Nuevas migraciones → MIGRACIONES.md
   - Nuevos seeds → DATOS-SEED.md + `/apps/database/seeds/dev/`

2. Actualizar este README.md con la fecha

3. Actualizar métricas en el resumen

4. **Fuente de verdad:** `/apps/database/` (NO documentación)

---

## 🗃️ Historia de Migración

### FASE 5A-5C Completadas (2025-11-02)

**Migración completa de seeds a nueva estructura:**
- ✅ 32 archivos seeds creados (10,525 líneas SQL)
- ✅ 11/11 schemas con seeds (100% completitud)
- ✅ Sistema funcional al 100%

**Cambios:**
- ❌ Eliminada carpeta `/docs/03-desarrollo/base-de-datos/backup-ddl/` (285 archivos legacy)
- ✅ Nueva ubicación única: `/apps/database/`
- ✅ RFC-0001: Estructura seeds por schema
- ✅ Idempotencia garantizada en todos los seeds

**Ver reportes:**
- `/docs-analysis/.../REPORTE-FASE-5A-COMPLETADO.md` (Seeds críticos)
- `/docs-analysis/.../REPORTE-FASE-5B-COMPLETADO.md` (Seeds importantes)
- `/docs-analysis/.../REPORTE-FASE-5C-COMPLETADO.md` (Seeds opcionales)

---

## 🤝 Contribución

Esta documentación referencia:
- **Código SQL en:** `/apps/database/`
- **Documentación:** `/docs/03-desarrollo/base-de-datos/`

Para sugerencias o correcciones, contactar al equipo de Database Engineering.

---

**Generado:** 2025-10-27
**Actualizado:** 2025-11-02 (Migración FASE 5A-5C completa)
**Versión de PostgreSQL:** 14+
**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
