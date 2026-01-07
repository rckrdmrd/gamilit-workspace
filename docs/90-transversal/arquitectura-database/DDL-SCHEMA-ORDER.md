# Orden de Carga de Schemas - GAMILIT Database

Documentación del orden de ejecución de DDL y Seeds en la base de datos.

## Orden de Schemas DDL

El script `init-database.sh` carga los schemas en el siguiente orden:

| # | Schema | Propósito |
|---|--------|-----------|
| 1 | `auth` | Autenticación base (Supabase compatible) |
| 2 | `auth_management` | Perfiles, tenants, sesiones, tokens |
| 3 | `gamilit` | Funciones y utilidades compartidas |
| 4 | `storage` | Almacenamiento de archivos |
| 5 | `admin_dashboard` | Dashboard administrativo |
| 6 | `system_configuration` | Feature flags, rate limits, configuración |
| 7 | `gamification_system` | XP, ML Coins, rangos, logros, misiones |
| 8 | `educational_content` | Módulos, ejercicios, assignments |
| 9 | `content_management` | Plantillas, recursos multimedia |
| 10 | `social_features` | Escuelas, classrooms, equipos |
| 11 | `progress_tracking` | Progreso, intentos, submissions |
| 12 | `audit_logging` | Logs, auditoría, métricas |
| 13 | `communication` | Mensajería entre usuarios |
| 14 | `lti_integration` | Integración LTI |
| 15 | `notifications` | Sistema de notificaciones |
| 16 | `public` | Extensiones PostgreSQL |

## Orden de Ejecución DDL

Dentro de cada schema, los objetos se cargan en este orden:

1. **Prerequisites** (`00-prerequisites.sql`) - ENUMs globales, extensiones
2. **ENUMs** (`schemas/*/enums/`) - Tipos enumerados por schema
3. **Tables** (`schemas/*/tables/`) - Tablas ordenadas por número
4. **Permissions** (`99-post-ddl-permissions.sql`) - Grants y permisos
5. **Functions** (`schemas/*/functions/`) - Funciones PL/pgSQL
6. **Views** (`schemas/*/views/`) - Vistas regulares
7. **Materialized Views** (`schemas/*/materialized-views/`) - Vistas materializadas
8. **Indexes** (`schemas/*/indexes/`) - Índices
9. **Triggers** (`schemas/*/triggers/`) - Triggers
10. **RLS Policies** (`schemas/*/rls-policies/`) - Políticas Row Level Security

## Fases de Seeds

Los seeds se cargan en 10 fases:

| Fase | Contenido |
|------|-----------|
| 1 | Auth Base (tenants, users demo) |
| 2 | Profiles (admin profiles, roles) |
| 3 | System Configuration (settings, feature flags, notifications) |
| 4 | Gamification Base (ranks, categories, achievements) |
| 5 | Gamification Avanzado (shop, missions) |
| 6 | Educational Content (modules, exercises) |
| 7 | Content Management (templates, media) |
| 8 | Social Features (schools, classrooms) |
| 9 | Progress & Audit (demo progress, audit config) |
| 10 | Integraciones (LTI - opcional) |

## Dependencias Críticas

### Foreign Keys

```
auth.users
    ↓
auth_management.profiles (user_id → users.id, profiles.id = users.id)
    ↓
├── gamification_system.user_stats (user_id → profiles.id)
├── gamification_system.user_ranks (user_id → profiles.id)
├── gamification_system.comodines_inventory (user_id → profiles.id)
├── progress_tracking.module_progress (user_id → profiles.id)
└── social_features.classroom_members (student_id → profiles.id)
```

### Triggers de Inicialización

Al crear un `profile` con rol `student`, se disparan:

1. `gamilit.initialize_user_stats()` → Crea user_stats, comodines, ranks, module_progress
2. `gamilit.assign_default_classroom()` → Asigna al classroom default
3. `gamilit.audit_profile_changes()` → Audita cambios de rol/status

Todos incluyen EXCEPTION handling para no bloquear la creación.

## Verificación de Orden

```sql
-- Verificar schemas creados
SELECT nspname FROM pg_namespace
WHERE nspname NOT LIKE 'pg_%'
ORDER BY nspname;

-- Verificar tablas por schema
SELECT schemaname, count(*)
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
GROUP BY schemaname
ORDER BY schemaname;
```

---

**Última actualización:** 2025-12-27
**Script versión:** init-database.sh v3.8
