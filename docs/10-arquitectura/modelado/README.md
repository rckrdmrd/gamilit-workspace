# 05-Modelado: GAMILIT

**Proyecto:** GAMILIT - Plataforma de Gamificacion Educativa
**Ultima actualizacion:** 2026-01-24

---

## Descripcion

Documentacion de modelado de datos, diagramas de entidades y arquitectura del sistema GAMILIT.

---

## Contenido

### Recursos de Modelado

| Recurso | Ubicacion | Descripcion |
|---------|-----------|-------------|
| Catalogo de Entidades | `../_SSOT/ENTITIES-CATALOG.md` | Catalogo completo de entities TypeORM |
| Trazabilidad | `./trazabilidad/TRACEABILITY-MASTER.yml` | Mapa de trazabilidad de requerimientos |
| Esquemas de Base de Datos | Ver DATABASE_INVENTORY.yml | 16 schemas PostgreSQL |

### Schemas de Base de Datos

GAMILIT utiliza 16 schemas PostgreSQL:

1. **auth_management** - Gestion de autenticacion y usuarios
2. **gamification_system** - Sistema de gamificacion (logros, misiones, ML Coins)
3. **educational_content** - Contenido educativo (modulos, ejercicios)
4. **progress_tracking** - Tracking de progreso de estudiantes
5. **social_features** - Caracteristicas sociales (aulas, equipos, amistades)
6. **content_management** - Gestion de contenido (templates, media)
7. **admin_dashboard** - Dashboard administrativo
8. **system_configuration** - Configuracion del sistema
9. **notifications** - Sistema de notificaciones multicanal
10. **communication** - Comunicacion (mensajes)
11. **audit_logging** - Logs de auditoria
12. **lti_integration** - Integracion LTI
13. **parent_portal** - Portal de padres (EXT-011)
14. **teacher_portal** - Portal de maestros
15. **analytics** - Analytics avanzado
16. **gamilit** - Funciones de utilidad (timezone, helpers)

### Documentacion Relacionada

| Documento | Ubicacion |
|-----------|-----------|
| DATABASE_INVENTORY.yml | `../../orchestration/inventarios/DATABASE_INVENTORY.yml` |
| BACKEND_INVENTORY.yml | `../../orchestration/inventarios/BACKEND_INVENTORY.yml` |
| DDL Completo | `../../apps/database/ddl/` |

---

## Diagramas

### Diagrama de Alto Nivel

```
                    ┌─────────────────────────────────────────────────────┐
                    │                   GAMILIT PLATFORM                   │
                    └─────────────────────────────────────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
    ┌────▼────┐                         ┌─────▼─────┐                        ┌─────▼─────┐
    │ FRONTEND│                         │  BACKEND  │                        │ DATABASE  │
    │ (React) │ ◄────────────────────── │ (NestJS)  │ ◄───────────────────── │(PostgreSQL│
    └─────────┘                         └───────────┘                        └───────────┘
         │                                    │                                    │
    ┌────┴────────┐                    ┌──────┴──────┐                      ┌──────┴──────┐
    │             │                    │             │                      │             │
 Student      Teacher               Auth        Gamification           16 Schemas    137 Tablas
 Portal       Portal              Module         Module                  RLS          32 Policies
    │             │                    │             │
 Admin       Parent                Progress      Social
 Portal      Portal                Module        Module
```

### Relaciones Principales

```
User (auth_management.users)
  │
  ├── Profile (auth_management.profiles)
  │     └── School (social_features.schools)
  │
  ├── UserStats (gamification_system.user_stats)
  │     ├── ML Coins balance
  │     ├── XP total
  │     └── Streaks
  │
  ├── ModuleProgress (progress_tracking.module_progress)
  │     └── Module (educational_content.modules)
  │           └── Exercise (educational_content.exercises)
  │
  └── ClassroomMember (social_features.classroom_members)
        └── Classroom (social_features.classrooms)
              └── School (social_features.schools)
```

---

## Referencias

- **Inventario de BD:** `@INV_DB` (orchestration/inventarios/DATABASE_INVENTORY.yml)
- **Inventario Backend:** `@INV_BE` (orchestration/inventarios/BACKEND_INVENTORY.yml)
- **Catalogo Entidades:** `@SSOT` (docs/_SSOT/ENTITIES-CATALOG.md)

---

*Documentacion GAMILIT v2.4.0*
