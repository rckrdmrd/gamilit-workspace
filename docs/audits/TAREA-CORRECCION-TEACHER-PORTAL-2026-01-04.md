# Tarea Técnica: Correcciones Portal Teacher Post-Auditoría

**ID:** TT-TEACHER-001
**Fecha:** 2026-01-04
**Prioridad:** P0 (Crítico)
**Estado:** ✅ COMPLETADO
**Detectado en:** Validación post-auditoría AUDIT-002
**Completado:** 2026-01-04

---

## Resumen Ejecutivo

Durante la validación de las correcciones de base de datos contra backend/frontend del Portal Teacher, se detectaron **discrepancias críticas** entre la Entity `Message` y su DDL correspondiente. Estas discrepancias pueden causar errores en runtime y deben ser corregidas antes de cualquier despliegue.

---

## Issues Detectados

### ISS-SYNC-001: Entity Message desalineada con DDL [P0 - ✅ COMPLETADO]

**Archivo afectado:**
- `apps/backend/src/modules/teacher/entities/message.entity.ts`

**DDL de referencia:**
- `apps/database/ddl/schemas/communication/tables/01-messages.sql`

**Discrepancias corregidas:**

| # | Entity (anterior) | DDL (actual) | Corrección Aplicada |
|---|-----------------|----------------|---------------|
| 1 | `type` | `message_type` | ✅ Renombrado a `messageType` |
| 2 | `conversationId` | `thread_id` | ✅ Renombrado a `threadId` |
| 3 | `attachmentUrl` (string) | `attachments` (JSONB) | ✅ Cambiado a JSONB array |
| 4 | `tenantId` | - | ✅ Eliminado (no existe en DDL) |
| 5 | `assignmentId` | - | ✅ Eliminado (usa metadata) |
| 6 | - | `recipient_id` | ✅ Agregado `recipientId` |
| 7 | - | `priority` | ✅ Agregado con tipo MessagePriority |
| 8 | - | `is_pinned` | ✅ Agregado `isPinned` |
| 9 | - | `is_archived` | ✅ Agregado `isArchived` |
| 10 | - | `reactions` (JSONB) | ✅ Agregado como JSONB |
| 11 | - | `moderation_status` | ✅ Agregado `moderationStatus` |
| 12 | - | `metadata` (JSONB) | ✅ Agregado como JSONB |
| 13 | - | `edited_at`, `edit_count` | ✅ Agregados `editedAt`, `editCount` |

**Archivos modificados:**
- `apps/backend/src/modules/teacher/entities/message.entity.ts` - Entity completamente reescrita
- `apps/backend/src/modules/teacher/services/teacher-messages.service.ts` - Actualizado para usar nuevos campos
- `apps/backend/src/modules/notifications/services/notification-queue.service.ts` - Estados alineados con DDL

**Estado:** ✅ COMPLETADO (2026-01-04)

---

### ISS-SYNC-002: Seed message_participants faltante [P1 - ✅ COMPLETADO]

**Descripción:**
La tabla `communication.message_participants` fue creada en ISS-DB-001 pero no tenía seed de datos de ejemplo.

**Archivos creados:**
- `apps/database/seeds/dev/communication/02-message_participants.sql`
- `apps/database/seeds/prod/communication/02-message_participants.sql`

**Script actualizado:**
- `apps/database/scripts/init-database.sh` - Agregada FASE 12: Communication

**Contenido del seed:**
- Participante sender (teacher) del mensaje de bienvenida
- Participantes recipients (estudiantes del classroom DEFAULT)

**Estado:** ✅ COMPLETADO (2026-01-04)

---

### ISS-SYNC-003: Backend - Import incorrecto corregido [P1 - COMPLETADO]

**Descripción:**
Se encontró y corrigió un import incorrecto en el controlador de notificaciones.

**Archivo corregido:**
- `apps/backend/src/modules/notifications/controllers/notification-multichannel.controller.ts`

**Cambio aplicado:**
```typescript
// ANTES (incorrecto):
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';

// DESPUÉS (correcto):
import { CurrentUser } from '@shared/decorators/current-user.decorator';
```

**Estado:** ✅ COMPLETADO

---

## Seeds del Portal Teacher - Estado Actual

### Seeds Existentes (OK)

| Seed | Archivo | Registros | Estado |
|------|---------|-----------|--------|
| Schools | `00-schools-default.sql` | 1 (SYSTEM-UNASSIGNED) | ✅ OK |
| Classrooms | `02-classrooms.sql` | 1 (DEFAULT) | ✅ OK |
| Classroom Members | `03-classroom-members.sql` | Variable | ✅ OK |
| Teacher Reports | `05-teacher-reports.sql` | Variable | ✅ OK |
| Assignments | `05-assignments.sql` | 9 demo | ✅ OK |
| Messages | `01-system-messages.sql` | 1 bienvenida | ✅ OK |

### Seeds Faltantes

| Seed | Archivo Requerido | Prioridad |
|------|-------------------|-----------|
| Message Participants | `02-message_participants.sql` | P1 |

---

## Plan de Corrección

### Fase 1: Corrección Entity Message [P0]

1. **Actualizar Message Entity**
   - Agregar columnas faltantes
   - Renombrar columnas (`type` → usar `message_type` internamente)
   - Cambiar tipos de datos (`attachmentUrl` → `attachments` JSONB)
   - Eliminar columnas que no existen en DDL

2. **Actualizar MessageParticipant Entity**
   - Verificar alineación (parece OK pero validar)

3. **Actualizar DTOs**
   - CreateMessageDto
   - UpdateMessageDto
   - MessageResponseDto

4. **Actualizar Services**
   - TeacherMessagesService
   - Cualquier servicio que use Message entity

5. **Validar con build**
   - `npm run build` sin errores

### Fase 2: Seeds Faltantes [P1]

1. **Crear seed message_participants**
   - Participantes para mensaje de bienvenida
   - Roles: sender (teacher), recipients (students en DEFAULT classroom)

2. **Actualizar script de BD**
   - Agregar referencia en `init-database.sh` si no existe

### Fase 3: Validación Final [P1]

1. **Recrear base de datos**
   - Ejecutar `drop-and-recreate-database.sh`
   - Verificar todos los seeds

2. **Probar endpoints del Portal Teacher**
   - GET /teacher/messages
   - POST /teacher/messages
   - GET /teacher/messages/unread-count

---

## Métricas de Impacto

| Métrica | Valor |
|---------|-------|
| Archivos a modificar | ~5-8 |
| Entidades afectadas | 1 (Message) |
| Seeds a crear | 1 |
| Prioridad global | P0 (bloqueante para mensajería) |
| Esfuerzo estimado | 2-4 horas |

---

## Dependencias

- DDL de `communication.messages` (ya creado)
- DDL de `communication.message_participants` (ya creado)
- Seeds de `auth_management.profiles` (ya existe)
- Seeds de `social_features.classrooms` (ya existe)

---

## Validaciones Requeridas

- [x] Backend compila sin errores ✅
- [x] Entity Message coincide con DDL ✅
- [x] Entity MessageParticipant coincide con DDL ✅
- [x] Seed message_participants creado ✅
- [x] Scripts actualizados (init-database.sh, create-database.sh) ✅
- [ ] Base de datos recreada exitosamente (requiere credenciales postgres)
- [ ] Endpoints de mensajería funcionan (pendiente pruebas post-recreación)

## Instrucciones para Recreación de BD

La base de datos actual está incompleta (17/140 tablas). Para completar la validación:

```bash
cd /home/isem/workspace-v2/projects/gamilit/apps/database/scripts
./recreate-database.sh --env dev --force
```

**Requisitos:**
- Credenciales de usuario `postgres` para DROP/CREATE de BD y usuario
- O ejecutar como superusuario de PostgreSQL

---

## Resumen de Correcciones Ejecutadas

| Issue | Prioridad | Estado | Descripción |
|-------|-----------|--------|-------------|
| ISS-SYNC-001 | P0 | ✅ COMPLETADO | Entity Message alineada con DDL (13 discrepancias corregidas) |
| ISS-SYNC-002 | P1 | ✅ COMPLETADO | Seed message_participants creado (dev + prod) |
| ISS-SYNC-003 | P1 | ✅ COMPLETADO | Import incorrecto corregido en notifications |

**Archivos modificados totales:** 8
- `apps/backend/src/modules/teacher/entities/message.entity.ts` - Entity completamente reescrita
- `apps/backend/src/modules/teacher/services/teacher-messages.service.ts` - Campos actualizados
- `apps/backend/src/modules/notifications/services/notification-queue.service.ts` - Estados alineados
- `apps/backend/src/modules/notifications/controllers/notification-multichannel.controller.ts` - Import corregido
- `apps/database/seeds/dev/communication/02-message_participants.sql` (nuevo)
- `apps/database/seeds/prod/communication/02-message_participants.sql` (nuevo)
- `apps/database/scripts/init-database.sh` - FASE 12: Communication agregada
- `apps/database/create-database.sh` - Seed message_participants agregado

---

**Generado por:** Claude Code (Orquestador)
**Fecha:** 2026-01-04
**Última actualización:** 2026-01-04
