# PROMPT BACKEND-AGENT - EXTENSIÓN GAMILIT

**Versión:** 2.0.0
**Fecha:** 2025-12-05
**Tipo:** Extensión de prompt global
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa

---

## HERENCIA

```yaml
EXTIENDE: core/orchestration/agents/PROMPT-BACKEND-AGENT.md
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
{BACKEND_ROOT}:    apps/backend
{BACKEND_SRC}:     apps/backend/src
{BACKEND_TESTS}:   apps/backend/tests
{DB_NAME}:         gamilit_platform
{AUTH_SCHEMA}:     auth_management
{FRONTEND_ROOT}:   apps/frontend
{DB_DDL_PATH}:     apps/database/ddl
{DB_SEEDS_PATH}:   apps/database/seeds
```

---

## MÓDULOS DEL PROYECTO GAMILIT

Este proyecto requiere los siguientes módulos NestJS alineados con los schemas de BD:

| Módulo | Schema BD | Propósito | Estado |
|--------|-----------|-----------|--------|
| `auth` | `auth_management` | Autenticación, usuarios, roles, tenants | Pendiente |
| `gamification` | `gamification_system` | Puntos, niveles, badges, challenges | Pendiente |
| `content` | `educational_content` | Módulos, lecciones, ejercicios | Pendiente |
| `progress` | `progress_tracking` | Progreso estudiantil, estadísticas | Pendiente |
| `academic` | `academic_management` | Instituciones, cursos, estudiantes | Pendiente |
| `guilds` | `guild_management` | Guildas, rankings | Pendiente |
| `notifications` | `notification_management` | Notificaciones, alertas | Pendiente |
| `admin` | `admin_dashboard` | Dashboard administrativo | Pendiente |
| `cms` | `content_management` | Gestión de contenido | Pendiente |
| `social` | `social_features` | Features sociales | Pendiente |
| `storage` | `storage` | Almacenamiento de archivos | Pendiente |
| `audit` | `audit_logging` | Logs de auditoría | Pendiente |
| `config` | `system_configuration` | Configuración del sistema | Pendiente |
| `lti` | `lti_integration` | Integración LTI con LMS | Pendiente |

---

## RUTAS DE TRABAJO GAMILIT

```bash
# Backend
apps/backend/src/modules/{modulo}/
apps/backend/src/modules/{modulo}/entities/*.entity.ts
apps/backend/src/modules/{modulo}/services/*.service.ts
apps/backend/src/modules/{modulo}/controllers/*.controller.ts
apps/backend/src/modules/{modulo}/dto/*.dto.ts

# Shared
apps/backend/src/shared/config/
apps/backend/src/shared/guards/
apps/backend/src/shared/decorators/
apps/backend/src/shared/constants/

# Tests
apps/backend/test/

# Inventarios
orchestration/inventarios/MASTER_INVENTORY.yml
orchestration/inventarios/BACKEND_INVENTORY.yml

# Trazas
orchestration/trazas/TRAZA-TAREAS-BACKEND.md
```

---

## DIRECTIVAS ESPECÍFICAS GAMILIT

Además de las directivas globales, consultar:

```yaml
Directivas del proyecto:
  - orchestration/directivas/ESTANDARES-API-ROUTES.md
  - orchestration/directivas/GUIA-NOMENCLATURA-COMPLETA.md

Documentación de diseño:
  - docs/01-fase-alcance-inicial/ (especificaciones de módulos)
  - docs/95-guias-desarrollo/backend/ (convenciones de código)
  - docs/97-adr/ (decisiones arquitectónicas)
```

---

## EXTENSIONES ESPECÍFICAS (si difieren del global)

### Sistema Multi-tenant

GAMILIT implementa multi-tenancy a nivel de aplicación:

```typescript
// Todas las entities principales incluyen tenant_id
@Entity({ schema: 'auth_management', name: 'users' })
export class UserEntity {
    @Column({ type: 'uuid' })
    tenantId: string;  // FK a auth_management.tenants

    @ManyToOne(() => TenantEntity)
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;
}

// Guards deben validar tenant del usuario
@Injectable()
export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const tenantId = request.params.tenantId || request.body.tenantId;
        return user.tenantId === tenantId;
    }
}
```

### Sistema de Gamificación

El módulo `gamification` es central en GAMILIT:

```typescript
// Rangos basados en cultura Maya
// Ajaw (Rey), Ahau, Batab, Nacom, Chilam, Ah Kin, etc.
// Ver: gamification_system.levels para definiciones

// Entities principales de gamificación:
// - UserPointsEntity (puntos del usuario)
// - UserLevelEntity (nivel actual)
// - UserBadgeEntity (badges obtenidos)
// - UserChallengeEntity (challenges activos)
```

### Integración LTI

GAMILIT se integra con LMS externos vía LTI:

```typescript
// Módulo lti maneja:
// - LTI 1.3 launch
// - Deep linking
// - Assignment and Grade Services (AGS)
// - Names and Role Provisioning Services (NRPS)
```

---

## FLUJO DE INICIO

Cuando el usuario diga "lee el prompt de Backend Agent para GAMILIT":

1. **Leer prompt global:** `core/orchestration/agents/PROMPT-BACKEND-AGENT.md`
2. **Leer este archivo:** Para resolver variables y ver extensiones
3. **Leer contexto:** `orchestration/00-guidelines/CONTEXTO-PROYECTO.md`
4. **Listo para recibir tarea**

---

**Nota:** Cualquier mejora a las directivas generales se hace en `core/orchestration/agents/PROMPT-BACKEND-AGENT.md` y se refleja automáticamente en todos los proyectos.
