# _MAP: apps/database/

**Última actualización:** 2025-11-07
**Estado:** 🟢 Estructura completa y documentada
**Versión:** 2.0

---

## 📋 Propósito

Esquema completo de PostgreSQL, DDL, migrations y seeds para GAMILIT. Sistema de archivos DDL modular con 85+ _MAP.md.

**Audiencia:** DBAs, Backend Developers, Tech Leads

---

## 🗂️ Estructura

```
database/
├── ddl/                    # Definiciones de esquema (DDL)
│   ├── schemas/            # 9 schemas con objetos DB
│   │   ├── auth_management/      # 12 tablas + índices + funciones + triggers + RLS
│   │   │   ├── tables/_MAP.md
│   │   │   ├── indexes/_MAP.md
│   │   │   ├── functions/_MAP.md
│   │   │   ├── triggers/_MAP.md
│   │   │   └── rls-policies/_MAP.md
│   │   ├── educational_content/  # Contenido educativo
│   │   ├── gamification_system/  # ML Coins, rangos, achievements
│   │   ├── progress_tracking/    # Progress tracking
│   │   ├── social_features/      # Social
│   │   ├── content_management/   # CMS
│   │   ├── audit_logging/        # Auditoría
│   │   ├── system_configuration/ # Config sistema
│   │   └── public/               # Schema público
│   ├── base-schema.sql           # Schema base inicial
│   └── README.md
├── migrations/             # Migraciones versionadas
│   ├── 001_initial_schema.sql
│   ├── 002_add_rls_policies.sql
│   └── ...
├── seeds/                  # Datos de prueba
│   ├── dev/                # Seeds para desarrollo
│   └── test/               # Seeds para testing
├── reportes/               # Reportes de validación y análisis
│   └── 2025-11-07-validacion/    # ✅ Validación completa (A+)
│       ├── _MAP.md
│       ├── README.md
│       ├── 00-CONSOLIDADO-FINAL.md
│       ├── historicos/
│       └── analisis-especificos/
├── scripts/                # Scripts de mantenimiento
│   ├── backup.sh
│   ├── restore.sh
│   └── migrate.sh
└── docs/                   # Documentación adicional (análisis, informes)
```

---

## 📊 Esquema DB

| Componente | Cantidad | Estado |
|------------|----------|--------|
| **Schemas** | 13 | ✅ Completo |
| **Tablas** | 62 | ✅ Completo |
| **Índices** | 279+ | ✅ Completo |
| **Funciones** | 61 | ✅ Completo |
| **Triggers** | 49 | ✅ Completo |
| **RLS Policies** | 18 archivos | 🟡 Validar |
| **Views** | 15+ | ✅ Completo |
| **Materialized Views** | 5+ | ✅ Completo |
| **Enums** | 53 únicos (60 definiciones) | ⚠️ 24 duplicados |
| **Foreign Keys** | 94 | ✅ Mapeadas |

### 📑 Database Inventory Master (DIM)

**Fuente de verdad única:** `orchestration/05-validaciones/consolidacion/DATABASE-INVENTORY-MASTER-2025-11-07.md`

El DIM contiene:
- Inventario completo de objetos DDL
- Mapeo funcional (documentación → implementación)
- Dependencias entre objetos (FKs, triggers, functions, RLS)
- Detección de duplicados por función (no solo por nombre)
- Plan de acción para resolver duplicados

---

## 🎯 Schemas Principales

### auth_management
Autenticación, usuarios, perfiles, roles, sesiones

**Tablas:** 12
- users, profiles, roles, sessions, auth_attempts, etc.

### gamification_system
ML Coins, rangos maya, achievements, power-ups, leaderboards

**Tablas:** 10
- ml_coins_ledger, ranking_history, achievements, power_ups_inventory, etc.

### educational_content
Módulos educativos, ejercicios (27 mecánicas), contenido

**Tablas:** 8
- modules, exercises, exercise_types, content, etc.

### progress_tracking
Progress de estudiantes, intentos, sesiones, analytics

**Tablas:** 6
- module_progress, exercise_attempts, sessions, analytics, etc.

---

## 🌟 Sistema SIMCO Ejemplar

Esta carpeta tiene la **mejor implementación de SIMCO** del workspace:

- ✅ 85+ _MAP.md (uno por cada tipo de objeto DB)
- ✅ Cada schema con estructura completa mapeada
- ✅ Referencias claras entre objetos
- ✅ Orden de ejecución documentado

**Ejemplo:**
```
auth_management/
├── tables/_MAP.md          # Lista de 12 tablas
├── indexes/_MAP.md         # Índices
├── functions/_MAP.md       # Funciones PL/pgSQL
├── triggers/_MAP.md        # Triggers
├── rls-policies/_MAP.md    # RLS policies
└── views/_MAP.md           # Vistas
```

---

## 🚨 Issues Conocidos

### P0 (Crítico - Bloquea operaciones)

- **P0-001:** ⚠️ **Enum `public.gamilit_role` NO EXISTE**
  - 11 archivos lo referencian
  - **Impacto:** 3 tablas no pueden crearse, 7 RLS policies fallan, 1 función falla
  - **Causa raíz:** Enum correcto es `auth_management.gamilit_role`
  - **Acción:** Cambiar todas las referencias al enum correcto
  - **Esfuerzo:** 3 horas
  - **Plan:** `orchestration/05-validaciones/consolidacion/PLAN-CONSOLIDACION-ENUM-GAMILIT-ROLE-2025-11-07.md`

- **P0-002:** Enum `auth_provider` con valores diferentes
  - 00-prerequisites.sql: 4 valores (falta 'apple')
  - auth_providers.sql: 5 valores (incluye 'apple')
  - **Impacto:** Si prerequisites ejecuta después, se pierde valor 'apple'
  - **Acción:** Actualizar prerequisites para incluir 'apple'
  - **Esfuerzo:** 15 minutos

### P1 (Alto)

- **P1-001:** 24 ENUMs duplicados detectados
  - 23 con definiciones idénticas (confusión, mantenimiento)
  - 1 con valores diferentes (auth_provider - ver P0-002)
  - **Acción:** Consolidar definiciones (mantener solo en 00-prerequisites.sql)
  - **Esfuerzo:** 2 horas
  - **Detalle completo:** `orchestration/05-validaciones/consolidacion/REPORTE-COMPLETO-ENUMS-2025-11-07.md`

- **P1-002:** RLS Policies incompletas
  - 18 archivos de políticas
  - **Esfuerzo:** 10-15 horas

- **P1-003:** Sin tests de integridad referencial
  - **Esfuerzo:** 4-6 horas

---

## 🚀 Scripts

```bash
# Backup
./scripts/backup.sh

# Restore
./scripts/restore.sh database_backup.sql

# Migrate
./scripts/migrate.sh

# Ejecutar DDL
psql -U postgres -d gamilit_platform -f ddl/schemas/auth_management/tables/01-users.sql
```

---

## 🔗 Interdependencias

- **Backend (apps/backend/):** Consume DDL, constants referencian schemas/tablas
- **Docs:** [docs/03-desarrollo/base-de-datos/](../../docs/03-desarrollo/base-de-datos/)

---

## 📚 Documentación

- [ESQUEMA-COMPLETO.md](../../docs/03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md)
- [RLS-POLICIES.md](../../docs/03-desarrollo/base-de-datos/RLS-POLICIES.md)
- [MIGRACIONES.md](../../docs/03-desarrollo/base-de-datos/MIGRACIONES.md)

---

**Generado:** 2025-11-07
**Método:** Sistema SIMCO - Fase 3
**Versión:** 1.0.0
