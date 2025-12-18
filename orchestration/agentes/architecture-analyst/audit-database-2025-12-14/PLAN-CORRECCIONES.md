# PLAN DE CORRECCIONES - POST-AUDITORÍA

**ID:** AUDIT-DB-001-CORRECCIONES
**Proyecto:** GAMILIT
**Fecha:** 2025-12-14
**Origen:** Auditoría Completa de Base de Datos

---

## RESUMEN

| Prioridad | Cantidad | Esfuerzo Total | Deadline |
|-----------|----------|----------------|----------|
| **P0 (Crítico)** | 3 | 18 horas | Antes de producción |
| **P1 (Importante)** | 5 | 64 horas | Q1 2025 |
| **P2 (Menor)** | 5 | 40 horas | Q2 2025 |
| **Total** | 13 | 122 horas | - |

---

## P0 - CRÍTICO (Antes de Producción)

### P0-001: Habilitar RLS en auth_management

```yaml
id: P0-001
titulo: "Habilitar Row Level Security en auth_management"
severidad: CRÍTICO
impacto: "Datos de usuarios expuestos sin protección"
esfuerzo: 8 horas
responsable: Database-Agent
deadline: "Antes de producción"

tablas_afectadas:
  - auth_management.profiles (109 FKs dependen de esta tabla)
  - auth_management.user_sessions
  - auth_management.email_verification_tokens
  - auth_management.password_reset_tokens
  - auth_management.user_preferences
  - auth_management.memberships
  - auth_management.user_suspensions

solucion: |
  Las policies YA EXISTEN. Solo ejecutar:

  ALTER TABLE auth_management.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE auth_management.user_sessions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE auth_management.email_verification_tokens ENABLE ROW LEVEL SECURITY;
  ALTER TABLE auth_management.password_reset_tokens ENABLE ROW LEVEL SECURITY;
  ALTER TABLE auth_management.user_preferences ENABLE ROW LEVEL SECURITY;
  ALTER TABLE auth_management.memberships ENABLE ROW LEVEL SECURITY;
  ALTER TABLE auth_management.user_suspensions ENABLE ROW LEVEL SECURITY;

validacion:
  - Verificar que usuario anónimo no puede leer profiles de otros
  - Verificar que usuario solo ve sus propias sessions
  - Verificar que tokens solo son accesibles por el usuario dueño
  - Ejecutar tests de integración de auth
```

### P0-002: Habilitar RLS en communication.messages

```yaml
id: P0-002
titulo: "Habilitar RLS en mensajes privados"
severidad: CRÍTICO
impacto: "Mensajes privados completamente expuestos"
esfuerzo: 4 horas
responsable: Database-Agent
deadline: "Antes de producción"

tablas_afectadas:
  - communication.messages

solucion: |
  1. Crear archivo: ddl/schemas/communication/rls-policies/01-messages-policies.sql
  2. Definir policy:
     - Usuarios pueden ver mensajes donde son sender_id o recipient_id
     - Solo sender puede eliminar mensaje
  3. Habilitar RLS:
     ALTER TABLE communication.messages ENABLE ROW LEVEL SECURITY;

validacion:
  - Usuario A no puede leer mensajes entre Usuario B y C
  - Usuario puede leer sus propios mensajes enviados/recibidos
```

### P0-003: Habilitar RLS en notifications

```yaml
id: P0-003
titulo: "Habilitar RLS en sistema de notificaciones"
severidad: CRÍTICO
impacto: "Notificaciones personales expuestas"
esfuerzo: 4 horas
responsable: Database-Agent
deadline: "Antes de producción"

tablas_afectadas:
  - notifications.notifications
  - notifications.notification_preferences
  - notifications.notification_logs

solucion: |
  1. Crear policies para cada tabla
  2. Usuarios solo ven sus propias notificaciones
  3. Habilitar RLS en las 3 tablas

validacion:
  - Usuario solo ve notificaciones donde user_id = auth.uid()
  - Preferencias solo editables por el usuario dueño
```

---

## P1 - IMPORTANTE (Q1 2025)

### P1-001: Corregir FK mission_templates.created_by

```yaml
id: P1-001
titulo: "Corregir Foreign Key inválida en mission_templates"
severidad: IMPORTANTE
impacto: "Integridad referencial rota"
esfuerzo: 2 horas
responsable: Database-Agent

problema: |
  FK: mission_templates.created_by → auth_management.users
  Pero: auth_management.users NO EXISTE (es auth_management.profiles)

solucion: |
  Modificar ddl/schemas/gamification_system/tables/XX-mission_templates.sql:

  -- ANTES
  REFERENCES auth_management.users(id)

  -- DESPUÉS
  REFERENCES auth_management.profiles(id)

validacion:
  - Ejecutar drop-and-recreate-database.sh
  - Verificar que FK se crea correctamente
```

### P1-002: Agregar Validadores @Min/@Max

```yaml
id: P1-002
titulo: "Agregar validadores numéricos faltantes en DTOs"
severidad: IMPORTANTE
impacto: "Violación potencial de CHECK constraints DDL"
esfuerzo: 4 horas
responsable: Backend-Agent

archivos_afectados:
  - src/modules/educational/dto/create-module.dto.ts
  - src/modules/educational/dto/create-exercise.dto.ts
  - src/modules/gamification/dto/create-shop-item.dto.ts

solucion: |
  Agregar decoradores que correspondan a CHECK constraints en DDL:

  // Ejemplo:
  @IsNumber()
  @Min(0)
  @Max(10)
  difficulty_level: number;

validacion:
  - npm run build
  - npm run test
  - Verificar que validación frontend coincide
```

### P1-003: Documentar Sistemas de Notificaciones

```yaml
id: P1-003
titulo: "Documentar diferencia entre sistemas de notificaciones"
severidad: IMPORTANTE
impacto: "Confusión arquitectónica"
esfuerzo: 2 horas
responsable: Documentation

archivos_a_crear:
  - docs/architecture/notifications-architecture.md

contenido:
  - Explicar gamification_system.notifications vs notifications.notifications
  - Diagramar flujo de cada sistema
  - Indicar cuándo usar cada uno
```

### P1-004: Implementar Entities Parental Control

```yaml
id: P1-004
titulo: "Implementar entities para control parental"
severidad: IMPORTANTE
impacto: "Funcionalidad no disponible"
esfuerzo: 40 horas
responsable: Backend-Agent

tablas_ddl_existentes:
  - auth_management.parent_accounts
  - auth_management.parent_student_links
  - auth_management.parent_notifications

entregables:
  - ParentAccountEntity
  - ParentStudentLinkEntity
  - ParentNotificationEntity
  - DTOs correspondientes (Create, Update, Response)
  - ParentControlService
  - ParentControlController
  - Tests unitarios
```

### P1-005: Implementar Entity Friend Requests

```yaml
id: P1-005
titulo: "Implementar entity para solicitudes de amistad"
severidad: IMPORTANTE
impacto: "Sistema social incompleto"
esfuerzo: 16 horas
responsable: Backend-Agent

tabla_ddl_existente:
  - social_features.friend_requests

entregables:
  - FriendRequestEntity
  - DTOs (Create, Response)
  - FriendRequestService
  - FriendRequestController
  - Tests unitarios
```

---

## P2 - MENOR (Q2 2025)

### P2-001: Estandarizar @MaxLength en DTOs

```yaml
id: P2-001
titulo: "Estandarizar uso de @MaxLength en todos los DTOs"
esfuerzo: 12 horas
responsable: Backend-Agent

descripcion: |
  Agregar @MaxLength a todos los campos string que tienen
  VARCHAR(n) en DDL para prevenir truncamiento.
```

### P2-002: Migrar Types a api-types.ts

```yaml
id: P2-002
titulo: "Migrar types manuales a generación automática"
esfuerzo: 24 horas
responsable: Frontend-Agent

descripcion: |
  Re-exportar types desde api-types.ts generado en lugar de
  mantener types manuales duplicados.
```

### P2-003: Renombrar Services para Claridad

```yaml
id: P2-003
titulo: "Renombrar services con nombres ambiguos"
esfuerzo: 4 horas
responsable: Backend-Agent

cambios:
  - gamification/user-stats.service.ts → student-gamification-stats.service.ts
  - admin/user-stats.service.ts → admin-user-metrics.service.ts
```

### P2-004: Configurar Generación en CI/CD

```yaml
id: P2-004
titulo: "Automatizar generación de api-types en CI/CD"
esfuerzo: 4 horas
responsable: DevOps

descripcion: |
  Agregar step en GitHub Actions para regenerar api-types.ts
  cuando cambian DTOs del backend.
```

### P2-005: Evaluar Consolidación Notification Entity

```yaml
id: P2-005
titulo: "Evaluar consolidación de entities de notificaciones"
esfuerzo: 4 horas
responsable: Architecture-Analyst

descripcion: |
  Analizar si notification.entity.ts simple puede deprecarse
  en favor de multichannel/notification.entity.ts
```

---

## CRONOGRAMA

```
SEMANA 1 (Antes de Producción)
├── [ ] P0-001: RLS auth_management (8h)
├── [ ] P0-002: RLS communication.messages (4h)
└── [ ] P0-003: RLS notifications (4h)
         Total: 16 horas

SEMANA 2
├── [ ] P1-001: Corregir FK mission_templates (2h)
├── [ ] P1-002: Validadores @Min/@Max (4h)
└── [ ] P1-003: Documentar notificaciones (2h)
         Total: 8 horas

Q1 2025 - SPRINT 1-2
├── [ ] P1-004: Parental Control (40h)
└── [ ] P1-005: Friend Requests (16h)
         Total: 56 horas

Q2 2025 - SPRINT 3-4
├── [ ] P2-001: Estandarizar @MaxLength (12h)
├── [ ] P2-002: Migrar types (24h)
├── [ ] P2-003: Renombrar services (4h)
├── [ ] P2-004: CI/CD api-types (4h)
└── [ ] P2-005: Consolidar notification entity (4h)
         Total: 48 horas
```

---

## CHECKLIST DE VERIFICACIÓN

### Antes de Producción

- [ ] P0-001 completado y validado
- [ ] P0-002 completado y validado
- [ ] P0-003 completado y validado
- [ ] Tests de seguridad ejecutados
- [ ] Recreación limpia exitosa

### Q1 2025

- [ ] P1-001 a P1-005 completados
- [ ] Tests unitarios pasando
- [ ] Documentación actualizada

### Q2 2025

- [ ] P2-001 a P2-005 completados
- [ ] Inventarios actualizados
- [ ] Auditoría de seguimiento programada

---

**Plan Creado:** 2025-12-14
**Responsable:** Architecture-Analyst
**Próxima Revisión:** Al completar P0
