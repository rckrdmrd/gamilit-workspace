# _MAP: apps/database/

**Ultima actualizacion:** 2026-01-13
**Estado:** Produccion
**Version:** 1.1
**Proposito:** Base de datos PostgreSQL multi-schema para plataforma GAMILIT

---

## Proposito de esta Carpeta

Esta carpeta contiene la **definicion completa de la base de datos** PostgreSQL para GAMILIT, incluyendo DDL (schemas, tablas, funciones, triggers), seeds de datos, y scripts operacionales.

**Audiencia:**
- Database Administrators
- Backend Developers
- DevOps Engineers
- Arquitectos de software

---

## Estructura Principal

```
apps/database/
├── ddl/                          # Data Definition Language
│   ├── 00-prerequisites.sql      # Schemas + ENUMs base (ejecutar primero)
│   ├── 99-post-ddl-permissions.sql
│   └── schemas/                  # 16 schemas organizados
├── seeds/                        # Datos iniciales
│   ├── dev/                      # Ambiente desarrollo
│   └── prod/                     # Ambiente produccion (32 archivos validados)
├── scripts/                      # Scripts operacionales (23 scripts)
│   ├── init-database.sh
│   ├── recreate-database.sh
│   ├── reset-database.sh
│   ├── inventory/                # Generadores de inventario
│   └── validations/              # Validaciones de integridad
├── _deprecated/                  # Archivos obsoletos (historico)
├── create-database.sh            # Script maestro de creacion
├── drop-and-recreate-database.sh # Drop + recreate automatico
└── README.md                     # Documentacion principal
```

---

## Schemas de Base de Datos (16)

| Schema | Proposito | Tablas | Funciones | Triggers |
|--------|-----------|--------|-----------|----------|
| **gamilit** | Funciones compartidas y utilities | - | 16 | - |
| **auth** | Autenticacion base (Supabase) | 1 | - | - |
| **auth_management** | Usuarios, roles, sesiones, tenants | 15 | 6 | 9 |
| **educational_content** | Modulos, ejercicios, rubricas, assignments | 15 | 22 | 5 |
| **gamification_system** | Rangos Maya, logros, ML Coins | 15 | 21 | 10 |
| **progress_tracking** | Progreso de modulos, intentos | 17 | 12 | 13 |
| **social_features** | Escuelas, aulas, equipos, amistades | 17 | 2 | 6 |
| **content_management** | Templates, media, Marie Curie | 8 | 1 | 3 |
| **audit_logging** | Logs y auditoria del sistema | 8 | 6 | 1 |
| **system_configuration** | Feature flags, settings | 8 | 2 | 2 |
| **notifications** | Sistema multi-canal | 6 | 3 | - |
| **lti_integration** | Learning Tools Interoperability | 5 | 2 | 2 |
| **admin_dashboard** | Vistas analiticas | 3 | 1 | - |
| **communication** | Mensajeria maestro-estudiante | 2 | - | - |
| **storage** | ENUMs de almacenamiento | - | - | - |
| **public** | Reservado PostgreSQL (no usar) | - | - | - |

**Totales aproximados:** ~280 tablas, ~120 funciones, ~61 triggers, ~100+ indices

---

## Scripts Operacionales

### Gestion de Base de Datos

| Script | Version | Descripcion | Uso |
|--------|---------|-------------|-----|
| `create-database.sh` | - | Crea BD completa desde DDL (16 fases) | `./create-database.sh` |
| `init-database.sh` | **v3.10-TCP** | Inicializa BD + usuario + seeds | `./scripts/init-database.sh --env dev` |
| `recreate-database.sh` | **v1.1-TCP** | Elimina y recrea BD | `./scripts/recreate-database.sh --env dev --force` |
| `drop-and-recreate-database.sh` | - | Drop automatico + recreate | `./drop-and-recreate-database.sh` |

#### Modos de Conexion (v3.10-TCP / v1.1-TCP)

Los scripts soportan multiples modos de conexion:

1. **TCP con gamilit_user** (Prioridad 1) - Usa CREATEDB privilege, ideal para WSL2
2. **TCP con postgres** (Prioridad 2) - Requiere PGPASSWORD para postgres
3. **sudo -u postgres** (Prioridad 3) - Socket local, requiere sudo

```bash
# Modo TCP automatico (lee password de backend/.env)
./scripts/recreate-database.sh --env dev --force

# Verificar modo de conexion
# El script muestra: "Conectado a PostgreSQL (TCP con gamilit_user)"
```

### Inventarios

| Script | Descripcion |
|--------|-------------|
| `scripts/inventory/list-tables.sh` | Lista tablas por schema |
| `scripts/inventory/list-functions.sh` | Lista funciones |
| `scripts/inventory/list-triggers.sh` | Lista triggers |
| `scripts/inventory/list-indexes.sh` | Lista indices |
| `scripts/inventory/generate-all-inventories.sh` | Genera todos |

### Validaciones

| Script | Descripcion |
|--------|-------------|
| `scripts/validations/validate_integrity.py` | Validacion exhaustiva |
| `scripts/validate-ddl-organization.sh` | Valida estructura DDL |
| `scripts/validate-ddl-coverage.sh` | Valida cobertura |

---

## Orden de Ejecucion DDL

El script `create-database.sh` ejecuta 16 fases en orden:

1. **Prerequisites** - Schemas + ENUMs base
2. **Gamilit** - Funciones compartidas
3. **Auth** - Autenticacion base
4. **Storage** - ENUMs almacenamiento
5. **Auth Management** - Usuarios, roles, tenants
6. **Educational Content** - Modulos, ejercicios
7. **Notifications** - Sistema multi-canal (antes de gamification)
8. **Gamification System** - Rangos, logros, ML Coins
9. **Progress Tracking** - Seguimiento de progreso
10. **Social Features** - Aulas, equipos, amistades
11. **FK Constraints Diferidos** - Resolucion de ciclos
12. **Content Management** - Templates, media
13. **Audit Logging** - Auditoria
14. **System Configuration** - Feature flags
15. **Admin Dashboard** - Vistas analiticas
16. **LTI Integration** - Integracion LMS

**Nota:** El orden es critico debido a dependencias entre schemas.

---

## Caracteristicas Clave

### Row-Level Security (RLS)
- 30+ politicas activas
- Aislamiento por tenant
- Control granular por rol

### Vistas Materializadas
- `mv_global_leaderboard` - Ranking global
- `mv_classroom_leaderboard` - Por aula
- `mv_weekly_leaderboard` - Semanal
- `mv_mechanic_leaderboard` - Por tipo de ejercicio

### Triggers Automaticos
- `trg_initialize_user_stats` - Inicializa gamificacion al crear usuario
- `trg_ensure_profile_name` - Valida nombre de perfil
- `trg_updated_at` - Actualiza timestamps automaticamente

---

## Metricas

| Metrica | Valor | Verificado |
|---------|-------|------------|
| Archivos DDL | 410 | - |
| Schemas | 16 | 2026-01-13 |
| Tablas | 129 | 2026-01-13 |
| Vistas Materializadas | 4 | 2026-01-13 |
| Vistas | 15 | 2026-01-13 |
| Funciones | 219 | 2026-01-13 |
| Triggers | 105 | 2026-01-13 |
| RLS Policies | 214 | 2026-01-13 |
| Indices | 852 | 2026-01-13 |
| Seeds DEV | 40 archivos | 2026-01-13 |
| Seeds PROD | 34 archivos | - |
| Scripts operacionales | 23 | - |

---

## Interdependencias

### Esta Carpeta Alimenta A:
- `apps/backend/src/modules/` - Entidades TypeORM
- `docs/90-transversal/arquitectura-database/` - Documentacion BD
- `docs/02-fase-robustecimiento/EMR-001-migracion-bd/` - Migracion

### Esta Carpeta Consume De:
- `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` - Especificaciones

---

## Quick Start

```bash
# Opcion 1: Crear BD nueva
export DATABASE_URL="postgresql://usuario:password@localhost:5432/gamilit"
./create-database.sh

# Opcion 2: Drop y recrear (testing)
./drop-and-recreate-database.sh

# Opcion 3: Inicializar con seeds
./scripts/init-database.sh --env dev
```

---

## Documentacion Relacionada

- [README.md](./README.md) - Documentacion principal (713 lineas)
- [ddl/schemas/*/\_MAP.md](./ddl/schemas/) - Mapas por schema (16 archivos)
- [scripts/README.md](./scripts/README.md) - Guia de scripts
- [FLUJO-CARGA-LIMPIA.md](./FLUJO-CARGA-LIMPIA.md) - Politica de carga limpia

---

## Cambios Recientes

| Fecha | Cambio | Documento |
|-------|--------|-----------|
| 2026-01-13 | Scripts TCP (v3.10-TCP, v1.1-TCP) | `TAREA-CAPVED-SCRIPTS-TCP-2026-01-13.md` |
| 2026-01-13 | Correcciones CORR-002,003,004 | `VALIDACION-CAPVED-2026-01-13.md` |
| 2026-01-13 | BD recreada via scripts | Verificado |

---

**Actualizado:** 2026-01-13
**Mantenido por:** Database Team
