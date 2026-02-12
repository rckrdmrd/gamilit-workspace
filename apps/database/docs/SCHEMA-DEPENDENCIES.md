# SCHEMA-DEPENDENCIES.md

**Ultima actualizacion:** 2026-01-14
**Version:** 1.0.0
**Generado desde:** _MAP.md de cada schema

---

## Grafo de Dependencias

```
                           ┌─────────────┐
                           │    auth     │  (Schema Raiz)
                           │  (Core)     │
                           └──────┬──────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
         ┌──────────────────┐        ┌──────────────────┐
         │  auth_management │        │     storage      │
         │    (Core/RBAC)   │        │   (Reservado)    │
         └────────┬─────────┘        └──────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────────┬───────────────┐
    │             │             │                 │               │
    ▼             ▼             ▼                 ▼               ▼
┌─────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ ┌─────────────┐
│ gamilit │ │system_config│ │audit_logging│ │lti_integr │ │notifications│
│(Utilities)│(System)    │ │(Observ)     │ │(LMS)      │ │(Messaging)  │
└────┬────┘ └─────────────┘ └─────────────┘ └───────────┘ └─────────────┘
     │
     │    ┌─────────────────────────────────────────────────────────┐
     │    │                                                         │
     │    ▼                                                         │
     │  ┌─────────────────┐                                         │
     │  │educational_     │                                         │
     │  │content (Domain) │◄──────────────────────────────────────┐ │
     │  └────────┬────────┘                                       │ │
     │           │                                                │ │
     │           │   ┌─────────────────┐                          │ │
     │           │   │content_management│                         │ │
     │           │   │(Domain/Content)  │                         │ │
     │           │   └─────────────────┘                          │ │
     │           │                                                │ │
     │           ▼                                                │ │
     │  ┌─────────────────┐      ┌─────────────────┐              │ │
     │  │gamification_    │◄─────│social_features  │              │ │
     │  │system (Domain)  │      │(Domain/Social)  │              │ │
     │  └────────┬────────┘      └────────┬────────┘              │ │
     │           │                        │                       │ │
     │           │   ┌────────────────────┘                       │ │
     │           │   │                                            │ │
     │           ▼   ▼                                            │ │
     │  ┌─────────────────┐      ┌─────────────────┐              │ │
     │  │progress_tracking│      │communication    │              │ │
     │  │(Domain/Progress)│      │(Integration)    │              │ │
     │  └────────┬────────┘      └─────────────────┘              │ │
     │           │                                                │ │
     │           │                                                │ │
     │           ▼                                                │ │
     │  ┌─────────────────┐                                       │ │
     │  │admin_dashboard  │───────────────────────────────────────┘ │
     │  │(Terminal)       │◄────────────────────────────────────────┘
     │  └─────────────────┘
     │
     └─────────────────────► (funciones compartidas usadas por todos)
```

---

## Matriz de Dependencias

| Schema | Depende de | Dependientes |
|--------|------------|--------------|
| `auth` | - | auth_management |
| `storage` | - | - (reservado) |
| `public` | - | - (vacio) |
| `auth_management` | auth | gamilit, system_configuration, audit_logging, educational_content, gamification_system, progress_tracking, social_features, communication, notifications, lti_integration, content_management, admin_dashboard |
| `gamilit` | auth_management | (funciones usadas por todos los schemas de dominio) |
| `system_configuration` | auth_management | - |
| `audit_logging` | auth_management | admin_dashboard |
| `educational_content` | auth_management | gamification_system, progress_tracking, admin_dashboard |
| `content_management` | auth_management | - |
| `gamification_system` | auth_management, educational_content | progress_tracking, notifications |
| `progress_tracking` | auth_management, educational_content, gamification_system, social_features | admin_dashboard |
| `social_features` | auth_management | communication, progress_tracking, admin_dashboard |
| `communication` | auth_management, social_features | - |
| `notifications` | auth_management | gamification_system (triggers) |
| `lti_integration` | auth_management | - |
| `admin_dashboard` | auth_management, educational_content, social_features, progress_tracking, audit_logging | - (terminal) |

---

## Orden de Creacion (create-database.sh)

El orden de creacion en `create-database.sh` respeta las dependencias:

| Fase | Schema(s) | Razon |
|------|-----------|-------|
| 1 | auth | Schema raiz de autenticacion |
| 2 | auth_management | Extiende auth con profiles/RBAC |
| 3 | gamilit | Funciones utilitarias compartidas |
| 4 | storage | Schema reservado (futuro) |
| 5 | system_configuration | Configuracion del sistema |
| 6 | educational_content | Contenido educativo base |
| 6.5 | notifications | Sistema canonico de notificaciones |
| 7 | gamification_system | Depende de educational_content |
| 8 | progress_tracking | Depende de educational + gamification |
| 9 | social_features | Estructuras sociales |
| 10 | communication | Depende de social_features |
| 11 | content_management | Gestion de contenido |
| 12 | audit_logging | Logging (puede referenciar cualquier schema) |
| 13 | admin_dashboard | Schema terminal (depende de todos) |
| 14 | lti_integration | Integracion externa |

---

## Tipos de Dependencias

### 1. Foreign Keys Directas
Dependencias via FK constraints:
- `auth_management.profiles.id` → `auth.users.id`
- `social_features.classroom_members.user_id` → `auth_management.profiles.id`
- `gamification_system.user_stats.user_id` → `auth_management.profiles.id`

### 2. Funciones Compartidas
Funciones de `gamilit` usadas por triggers en otros schemas:
- `gamilit.update_updated_at_column()` - Trigger generico
- `gamilit.initialize_user_stats()` - Inicializa gamificacion
- `gamilit.update_mission_progress()` - Sistema de misiones

### 3. Cross-Schema Triggers
Triggers que insertan en otros schemas:
- `gamification_system` triggers → insertan en `notifications.notifications`
- `progress_tracking` triggers → actualizan `gamification_system.user_stats`

### 4. Views Cross-Schema
Vistas que consultan multiples schemas:
- `admin_dashboard.recent_activity` → consulta varios schemas
- `admin_dashboard.classroom_overview` → social_features + progress_tracking

---

## Schemas por Categoria

| Categoria | Schemas | Descripcion |
|-----------|---------|-------------|
| **Core** | auth, auth_management | Autenticacion y autorizacion |
| **Domain** | educational_content, gamification_system, progress_tracking, social_features, content_management | Logica de negocio |
| **Integration** | communication, notifications, lti_integration, admin_dashboard, audit_logging | Comunicacion y observabilidad |
| **System** | system_configuration, storage, public | Configuracion y reservados |
| **Utilities** | gamilit | Funciones compartidas |

---

## Notas de Arquitectura

1. **auth_management es el hub central**: Casi todos los schemas dependen de el
2. **admin_dashboard es terminal**: Solo consume, no es dependencia de nadie
3. **gamilit provee funciones**: No tiene tablas propias, solo funciones
4. **notifications es canonico**: gamification_system.notifications esta DEPRECATED

---

**Referencia:**
- `create-database.sh` - Orden de ejecucion
- `DATABASE_INVENTORY.yml` - Inventario completo
- `ddl/schemas/*/\_MAP.md` - Documentacion por schema

---

**Mantenido por:** Database Team
**Version:** 1.0.0
