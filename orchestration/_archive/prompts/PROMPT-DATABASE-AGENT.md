# PROMPT DATABASE-AGENT - EXTENSIÓN GAMILIT

**Versión:** 2.0.0
**Fecha:** 2025-12-05
**Tipo:** Extensión de prompt global
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa

---

## HERENCIA

```yaml
EXTIENDE: core/orchestration/agents/PROMPT-DATABASE-AGENT.md
CONTEXTO: orchestration/00-guidelines/CONTEXTO-PROYECTO.md
```

**IMPORTANTE:** Este archivo NO duplica el prompt global. Solo contiene:
1. Resolución de variables para GAMILIT
2. Extensiones específicas del proyecto (si las hay)

---

## RESOLUCIÓN DE VARIABLES PARA GAMILIT

Al leer el prompt global, resolver estos placeholders:

```yaml
{PROJECT_NAME}:    GAMILIT
{DB_NAME}:         gamilit_platform
{DB_DDL_PATH}:     apps/database/ddl
{DB_SCRIPTS_PATH}: apps/database
{DB_SEEDS_PATH}:   apps/database/seeds
{RECREATE_CMD}:    drop-and-recreate-database.sh
{AUTH_SCHEMA}:     auth_management
```

---

## SCHEMAS DEL PROYECTO GAMILIT

Este proyecto usa los siguientes schemas PostgreSQL:

| Schema | Propósito | Tablas aprox. |
|--------|-----------|---------------|
| `auth_management` | Autenticación, usuarios, roles, tenants | 11 |
| `gamification_system` | Puntos, niveles, badges, challenges | 12 |
| `educational_content` | Módulos, lecciones, ejercicios | 8 |
| `progress_tracking` | Progreso estudiantil, estadísticas | 10 |
| `academic_management` | Instituciones, cursos, estudiantes | - |
| `guild_management` | Guildas, rankings | - |
| `notification_management` | Notificaciones, alertas | - |
| `admin_dashboard` | Dashboard administrativo | 6 |
| `content_management` | Gestión de contenido | 7 |
| `social_features` | Features sociales | 8 |
| `storage` | Almacenamiento | 5 |
| `audit_logging` | Logs de auditoría | 6 |
| `system_configuration` | Configuración del sistema | 4 |
| `lti_integration` | Integración LTI | 5 |

---

## RUTAS DE TRABAJO GAMILIT

```bash
# DDL
apps/database/ddl/schemas/{schema}/tables/*.sql
apps/database/ddl/schemas/{schema}/functions/*.sql
apps/database/ddl/schemas/{schema}/triggers/*.sql

# Seeds
apps/database/seeds/dev/{schema}/*.sql
apps/database/seeds/prod/{schema}/*.sql

# Scripts
apps/database/create-database.sh
apps/database/drop-and-recreate-database.sh

# Inventarios
orchestration/inventarios/MASTER_INVENTORY.yml
orchestration/inventarios/DATABASE_INVENTORY.yml

# Trazas
orchestration/trazas/TRAZA-TAREAS-DATABASE.md
```

---

## DIRECTIVAS ESPECÍFICAS GAMILIT

Además de las directivas globales, consultar:

```yaml
Directivas del proyecto:
  - orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md
  - orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md

Estándares del proyecto:
  - orchestration/directivas/ESTANDARES-API-ROUTES.md
  - orchestration/directivas/GUIA-NOMENCLATURA-COMPLETA.md
```

---

## EXTENSIONES ESPECÍFICAS (si difieren del global)

### Convención de Rangos Maya

GAMILIT usa un sistema de rangos basado en la cultura Maya:

```sql
-- Rangos de nivel para gamificación
-- Ajaw (Rey), Ahau, Batab, Nacom, Chilam, Ah Kin, etc.
-- Ver: gamification_system.levels
```

### Política Multi-tenant

```sql
-- Todas las tablas principales tienen tenant_id
-- RLS policies filtran por tenant del usuario actual
-- Ver: auth_management.tenants
```

---

## FLUJO DE INICIO

Cuando el usuario diga "lee el prompt de Database Agent para GAMILIT":

1. **Leer prompt global:** `core/orchestration/agents/PROMPT-DATABASE-AGENT.md`
2. **Leer este archivo:** Para resolver variables y ver extensiones
3. **Leer contexto:** `orchestration/00-guidelines/CONTEXTO-PROYECTO.md`
4. **Listo para recibir tarea**

---

**Nota:** Cualquier mejora a las directivas generales se hace en `core/orchestration/agents/PROMPT-DATABASE-AGENT.md` y se refleja automáticamente en todos los proyectos.
