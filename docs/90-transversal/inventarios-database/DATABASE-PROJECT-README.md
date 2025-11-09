# Database - GAMILIT

**Fecha actualización:** 2025-11-07
**Versión:** 2.1 - Inventario Completo
**Estado:** 🚧 **DOCUMENTACIÓN COMPLETA** - Correcciones en paralelo
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)

---

## 📊 Estadísticas Actuales

### Objetos de Base de Datos

| Tipo | Cantidad | Documentado | Estado |
|------|----------|-------------|--------|
| **Schemas** | 13 | 10 | ⚠️ 3 sin documentar |
| **Tablas** | 64 | 48 | ⚠️ +16 no documentadas |
| **ENUMs** | 35 | 24 | 🚨 **31 mal ubicados** (✅ 2 corregidos) |
| **Funciones** | 61 | 0 | 📝 Sin documentar |
| **Triggers** | 52 | 0 | 📝 Sin documentar |
| **RLS Policies** | 24 | 0 | 📝 Sin documentar |
| **Índices** | 74 | 0 | 🚨 **64 mal ubicados** |
| **Vistas** | 16 | 12 | ⚠️ +4 no documentadas |
| **Seeds** | 47 | 32 | ⚠️ +15 no documentados |
| **TOTAL** | **386** | **126** | **260 requieren acción** |

---

## 🚨 Problemas Críticos Identificados

### Problema P0: Schema public Sobrecargado

**128+ objetos mal ubicados en public:**
- 31 ENUMs (89% del total) - ✅ 2 corregidos
- 9 Tablas
- 21 Triggers
- 64 Índices (86% del total)
- 7 Funciones
- 3 Vistas

**Impacto:** Rompe arquitectura modular, dificulta mantenimiento

### Problema P0: Duplicaciones

- **3 tablas duplicadas:** `classrooms`, `classroom_members`, `notifications` ⚠️ PENDIENTE
- **2 ENUMs duplicados:** ~~`maya_rank`, `rango_maya`~~ ✅ CORREGIDO (2025-11-07)
- **10 triggers duplicados** ⚠️ PENDIENTE

**Impacto:** Riesgo de inconsistencia de datos

---

## 📂 Estructura

```
apps/database/
├── ddl/                        # Definiciones de esquema
│   ├── schemas/                # 13 schemas implementados
│   │   ├── auth/              # Autenticación base
│   │   ├── auth_management/   # Gestión de usuarios (12 tablas)
│   │   ├── gamilit/           # Utilidades (13 funciones)
│   │   ├── gamification_system/  # Sistema de rangos maya (12 tablas)
│   │   ├── educational_content/  # Contenido educativo (4 tablas)
│   │   ├── progress_tracking/    # Seguimiento (5 tablas)
│   │   ├── content_management/   # Gestión de contenido (5 tablas)
│   │   ├── social_features/      # Social (7 tablas)
│   │   ├── system_configuration/ # Configuración (3 tablas)
│   │   ├── audit_logging/        # Auditoría (6 tablas)
│   │   ├── admin_dashboard/      # Dashboard admin (4 vistas) ⚠️ NO DOC
│   │   ├── storage/              # Storage (1 ENUM) ⚠️ NO DOC
│   │   └── public/               # 🚨 130+ objetos MAL UBICADOS
│   ├── functions/
│   └── views/
│
├── seeds/                      # 47 seeds
│   ├── dev/                    # 34 seeds de desarrollo
│   ├── prod/                   # 5 seeds de producción
│   ├── staging/                # 5 seeds de staging
│   └── production/             # 3 seeds de producción
│
├── scripts/                    # Scripts operacionales
│   ├── inventory/              # ✅ 8 scripts de inventario (NUEVOS)
│   └── ...
│
└── docs/                       # 📚 DOCUMENTACIÓN (NUEVO)
    ├── inventarios/            # Inventarios detallados
    │   ├── 01-SCHEMAS-INVENTORY.md       (✅ 22 KB)
    │   ├── 02-TABLES-INVENTORY.md        (✅ 17 KB)
    │   ├── 03-ENUMS-INVENTORY.md         (✅ 25 KB)
    │   └── INVENTORY-MASTER-REPORT.md    (✅ 19 KB)
    │
    ├── TRACKING-CORRECCIONES.md  # 🎯 Tracking de 142 correcciones
    ├── PLAN-ACTUALIZACION-DOCUMENTACION.md  # Plan maestro
    ├── PLAN-VALIDACION-COMPLETO.md
    └── CRITERIOS-VALIDACION.md
```

---

## 📚 Documentación

### Inventarios Completos (Sistema SIMCO)

#### ✅ Generados (83 KB de documentación)

1. **[01-SCHEMAS-INVENTORY.md](./docs/inventarios/01-SCHEMAS-INVENTORY.md)** (22 KB)
   - 13 schemas catalogados
   - Análisis topológico de dependencias
   - 3 schemas sin documentar identificados

2. **[02-TABLES-INVENTORY.md](./docs/inventarios/02-TABLES-INVENTORY.md)** (17 KB)
   - 64 tablas por schema
   - Duplicaciones identificadas
   - ERD relationships

3. **[03-ENUMS-INVENTORY.md](./docs/inventarios/03-ENUMS-INVENTORY.md)** (25 KB)
   - 37 ENUMs con valores
   - 🚨 **33 ENUMs mal ubicados** (plan de migración incluido)
   - Matriz de correcciones

4. **[INVENTORY-MASTER-REPORT.md](./docs/inventarios/INVENTORY-MASTER-REPORT.md)** (19 KB)
   - Consolidación de todos los inventarios
   - Hallazgos críticos
   - Plan de acción priorizado

#### 📝 Pendientes (a crear después de correcciones)

5. **04-FUNCTIONS-INVENTORY.md** - 61 funciones detalladas
6. **05-TRIGGERS-INVENTORY.md** - 52 triggers detallados
7. **06-RLS-POLICIES-INVENTORY.md** - 24 policies detalladas
8. **07-INDEXES-INVENTORY.md** - 74 índices detallados
9. **08-VIEWS-INVENTORY.md** - 16 vistas detalladas
10. **09-SEEDS-INVENTORY.md** - 47 seeds detallados

### Documento Maestro de Tracking

**[TRACKING-CORRECCIONES.md](./docs/TRACKING-CORRECCIONES.md)** 🎯
- **142 correcciones identificadas**
- Dashboard de progreso
- Checklist por prioridad (P0, P1, P2)
- Templates de actualización
- Búsqueda rápida: `[PENDIENTE]`, `[EN-PROGRESO]`, `[COMPLETADO]`

---

## 🎯 Estado de Correcciones

### Dashboard de Progreso

| Tipo | Total | Pendiente | En Progreso | Completado | % |
|------|-------|-----------|-------------|------------|---|
| Schemas faltantes | 3 | 3 | 0 | 0 | 0% |
| Duplicaciones | 13 | 11 | 0 | 2 | 15% |
| ENUMs mal ubicados | 33 | 31 | 0 | 2 | 6% |
| Tablas mal ubicadas | 9 | 9 | 0 | 0 | 0% |
| Triggers duplicados | 10 | 10 | 0 | 0 | 0% |
| Índices mal ubicados | 64 | 64 | 0 | 0 | 0% |
| Funciones mal ubicadas | 7 | 7 | 0 | 0 | 0% |
| Vistas mal ubicadas | 3 | 3 | 0 | 0 | 0% |
| **TOTAL** | **142** | **140** | **0** | **2** | **1.4%** |

**Ver detalles:** [TRACKING-CORRECCIONES.md](./docs/TRACKING-CORRECCIONES.md)
**Última validación:** [REPORTE-VALIDACION-2025-11-07.md](./docs/REPORTE-VALIDACION-2025-11-07.md)

---

## 🚀 Quick Start

### Para Desarrolladores

#### Consultar Inventarios

```bash
# Ver todos los schemas
cat docs/inventarios/01-SCHEMAS-INVENTORY.md

# Ver tablas por schema
cat docs/inventarios/02-TABLES-INVENTORY.md

# Ver ENUMs mal ubicados
cat docs/inventarios/03-ENUMS-INVENTORY.md

# Ver reporte maestro
cat docs/inventarios/INVENTORY-MASTER-REPORT.md
```

#### Regenerar Inventarios

```bash
# Regenerar todos los inventarios raw
bash scripts/inventory/generate-all-inventories.sh

# Regenerar inventario específico
bash scripts/inventory/list-tables.sh
bash scripts/inventory/list-enums.sh
bash scripts/inventory/list-functions.sh
```

#### Buscar Correcciones Pendientes

```bash
# Ver todas las correcciones pendientes
grep "\[PENDIENTE\]" docs/TRACKING-CORRECCIONES.md

# Ver solo correcciones críticas (P0)
grep -A 2 "P0\|CRÍTICO" docs/TRACKING-CORRECCIONES.md
```

### Para Arquitectos/Tech Leads

1. **Revisar estado actual:**
   ```bash
   cat docs/inventarios/INVENTORY-MASTER-REPORT.md
   ```

2. **Ver plan de correcciones:**
   ```bash
   cat docs/TRACKING-CORRECCIONES.md
   ```

3. **Consultar plan maestro:**
   ```bash
   cat docs/PLAN-ACTUALIZACION-DOCUMENTACION.md
   ```

---

## 📋 Planes y Criterios

### Documentos de Planificación

- **[PLAN-ACTUALIZACION-DOCUMENTACION.md](./PLAN-ACTUALIZACION-DOCUMENTACION.md)**
  - Plan completo de 5 fases
  - Cronograma estimado (24 horas)
  - Entregables por fase

- **[PLAN-VALIDACION-COMPLETO.md](./PLAN-VALIDACION-COMPLETO.md)**
  - 12 fases de validación
  - Análisis topológico de dependencias
  - Scripts de validación

- **[CRITERIOS-VALIDACION.md](./CRITERIOS-VALIDACION.md)**
  - 115 criterios de validación
  - 5 tipos de validación
  - Plantillas de reportes

---

## 🔧 Scripts Disponibles

### Scripts de Inventario (en `scripts/inventory/`)

| Script | Propósito | Uso |
|--------|-----------|-----|
| `list-tables.sh` | Lista tablas por schema | `bash scripts/inventory/list-tables.sh` |
| `list-enums.sh` | Lista ENUMs por schema | `bash scripts/inventory/list-enums.sh` |
| `list-functions.sh` | Lista funciones por schema | `bash scripts/inventory/list-functions.sh` |
| `list-triggers.sh` | Lista triggers por schema | `bash scripts/inventory/list-triggers.sh` |
| `list-rls.sh` | Lista RLS policies por schema | `bash scripts/inventory/list-rls.sh` |
| `list-indexes.sh` | Lista índices por schema | `bash scripts/inventory/list-indexes.sh` |
| `list-views.sh` | Lista vistas por schema | `bash scripts/inventory/list-views.sh` |
| `list-seeds.sh` | Lista seeds por environment | `bash scripts/inventory/list-seeds.sh` |
| `generate-all-inventories.sh` | Genera todos los inventarios | `bash scripts/inventory/generate-all-inventories.sh` |

---

## 📎 Referencias SIMCO

**Este proyecto usa el sistema SIMCO (Sistema Indexado Modular por Contexto)**

### Documentación Principal
- **Schemas:** `docs/03-desarrollo/base-de-datos/schemas/`
- **Inventarios:** `apps/database/docs/inventarios/`
- **Tracking:** `apps/database/docs/TRACKING-CORRECCIONES.md`

### Backend
- **Constants:** `apps/backend/src/shared/constants/`
- **Entities:** `apps/backend/src/modules/*/entities/`
- **Sync ENUMs:** `apps/devops/scripts/sync-enums.ts`

### Monorepo
- **Plan Maestro:** `apps/database/PLAN-ACTUALIZACION-DOCUMENTACION.md`
- **Scripts Validación:** `apps/database/scripts/validation/`

---

## ⚠️ Importante - Trabajo en Paralelo

**Estado actual:** Documentación completa + Correcciones en paralelo

### Flujo de Trabajo

1. **✅ COMPLETADO:** Documentación del estado actual (con problemas marcados)
2. **🔧 EN CURSO:** Equipo corrige problemas en BD (en paralelo)
3. **📝 PRÓXIMO:** Actualizar documentación conforme se corrigen problemas

### Cómo Usar

1. **Buscar qué corregir:** Ver [TRACKING-CORRECCIONES.md](./docs/TRACKING-CORRECCIONES.md)
2. **Corregir en BD:** Aplicar migrations SQL
3. **Actualizar tracking:** Cambiar `[PENDIENTE]` → `[COMPLETADO]`
4. **Validar:** Regenerar inventarios y verificar cambios

---

## 📞 Contacto

**Preguntas sobre:**
- Arquitectura de BD: Ver inventarios en `docs/inventarios/`
- Correcciones pendientes: Ver `docs/TRACKING-CORRECCIONES.md`
- Plan de trabajo: Ver `PLAN-ACTUALIZACION-DOCUMENTACION.md`

---

**Última actualización:** 2025-11-07 (Post-validación de correcciones)
**Sistema de documentación:** SIMCO v1.0
**Estado:** 🚧 Documentación completa - Correcciones en progreso (2/142 completadas - 1.4%)
