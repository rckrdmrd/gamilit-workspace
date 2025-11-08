# Requerimientos Admin Portal - Gestión de Contenido

**Proyecto:** Gamilit Platform
**Portal:** Admin
**Archivo original:** REQUERIMIENTOS-ADMIN-PORTAL.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Tabla de Contenidos

1. [Gestión de Contenido](#gestión-de-contenido)
2. [Matriz de Permisos](#matriz-de-permisos)
3. [Reglas de Negocio](#reglas-de-negocio)
4. [Casos de Uso](#casos-de-uso)
5. [Referencias](#referencias)

---

## Gestión de Contenido

### RF-003: Gestión de Contenido

**Prioridad:** MEDIA
**Historia:** HU-EP010-03
**Story Points:** 16 SP

#### RF-003.1: Cola de Moderación
- **Descripción:** Listar contenido pendiente de aprobación
- **Criterios:**
  - Tipos de contenido: ejercicios, lessons, quizzes creados por profesores/comunidad
  - Filtros por: tipo de contenido, fecha de creación, creator
  - Ordenamiento por: fecha de creación (más antiguos primero)
  - Información mostrada: id, título, tipo, creator, fecha de creación, preview
  - Paginación
- **Endpoint:** GET /api/admin/content/exercises/pending

#### RF-003.2: Aprobación de Contenido
- **Descripción:** Aprobar contenido para publicación
- **Criterios:**
  - Cambiar status de 'pending' a 'approved'
  - Publicar en catálogo visible para estudiantes
  - Notificar al creator por email
  - Registrar reviewer_id y reviewed_at
  - Registro en audit log
- **Endpoint:** POST /api/admin/content/exercises/:id/approve

#### RF-003.3: Rechazo de Contenido
- **Descripción:** Rechazar contenido inapropiado o de baja calidad
- **Criterios:**
  - Rejection_reason obligatorio (mínimo 20 caracteres)
  - Cambiar status de 'pending' a 'rejected'
  - NO publicar en catálogo
  - Notificar al creator por email con reason
  - Registrar reviewer_id, reviewed_at, rejection_reason
  - Registro en audit log
- **Endpoint:** POST /api/admin/content/exercises/:id/reject

#### RF-003.4: Gestión de Media
- **Descripción:** Listar archivos multimedia del sistema
- **Criterios:**
  - Tipos de archivos: imágenes (jpg, png, gif), videos (mp4, webm), audio (mp3, wav)
  - Información mostrada: id, filename, file type, size, uploader, upload_date, URL
  - Filtros por: tipo, uploader, fecha de subida
  - Búsqueda por filename
  - Paginación
  - Preview de imágenes
- **Endpoint:** GET /api/admin/content/media

#### RF-003.5: Eliminación de Media
- **Descripción:** Eliminar archivos multimedia inapropiados o duplicados
- **Criterios:**
  - Verificar si archivo está en uso (referencias en contenido)
  - Si está en uso, mostrar warning y solicitar confirmación
  - Eliminar archivo del storage (S3/filesystem)
  - Eliminar registro de base de datos
  - Confirmación obligatoria
  - Registro en audit log
- **Endpoint:** DELETE /api/admin/content/media/:id

#### RF-003.6: Versionamiento de Contenido
- **Descripción:** Crear snapshot de contenido para rollback/historial
- **Criterios:**
  - Crear versión inmutable de contenido actual
  - Almacenar contenido completo en JSONB
  - Registrar version_number, created_by, created_at
  - Permitir restaurar versión anterior
  - Registro en audit log
- **Endpoint:** POST /api/admin/content/version

---

## Matriz de Permisos

### Permisos de Content Management

| Acción | super_admin | content_moderator | system_operator | admin | teacher | student |
|--------|-------------|-------------------|-----------------|-------|---------|---------|
| Ver cola moderación | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Aprobar contenido | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Rechazar contenido | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Listar media | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Eliminar media | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Crear versión contenido | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |

### Nota sobre Permisos
- **content_moderator:** Solo acceso a Content Management (aprobar/rechazar contenido)
- **super_admin:** Acceso completo a todas las funciones

---

## Reglas de Negocio

### RN-003: Gestión de Contenido

#### RN-003.1: Moderación de Contenido
- Contenido creado por profesores debe estar en status 'pending' hasta aprobación
- Solo super_admin o content_moderator pueden aprobar/rechazar
- Rejection_reason obligatorio al rechazar (mínimo 20 caracteres)
- Email de notificación obligatorio al aprobar/rechazar

#### RN-003.2: Eliminación de Media
- Verificar si archivo está en uso antes de eliminar
- Si en uso, solicitar confirmación adicional
- Eliminar archivo del storage (S3/filesystem) y registro de BD

---

## Casos de Uso

### CU-ADM-003: Aprobar Ejercicio de Profesor

**Actor Principal:** Super Admin o Content Moderator
**Objetivo:** Revisar y aprobar ejercicio creado por profesor para publicación

**Precondiciones:**
- Super admin autenticado
- Ejercicio en status 'pending'

**Flujo Principal:**
1. Super admin navega a "Content Moderation"
2. Sistema muestra lista de ejercicios pendientes ordenados por antigüedad
3. Super admin selecciona ejercicio de la lista
4. Sistema muestra preview completo del ejercicio:
   - Título y descripción
   - Contenido completo
   - Mecánica educativa utilizada
   - Respuestas esperadas
   - Difficulty level
   - Creator info
5. Super admin revisa contenido verificando:
   - Calidad educativa
   - Contenido apropiado (sin lenguaje inapropiado, errores gramaticales graves)
   - Funcionamiento correcto de mecánica
6. Super admin hace clic en botón "Approve"
7. Sistema solicita confirmación
8. Super admin confirma aprobación
9. Sistema actualiza status del ejercicio a 'approved'
10. Sistema registra reviewer_id y reviewed_at
11. Sistema publica ejercicio en catálogo (visible para estudiantes)
12. Sistema registra acción en admin_audit_log
13. Sistema envía email de notificación al creator (profesor)
14. Sistema muestra mensaje de éxito
15. Sistema remueve ejercicio de cola de moderación

**Postcondiciones:**
- Ejercicio aprobado y publicado
- Visible en catálogo para estudiantes
- Creator notificado por email
- Acción registrada en audit log

**Flujos Alternativos:**
- **A1 - Rechazar ejercicio:** Si contenido no cumple estándares:
  1. Super admin hace clic en "Reject"
  2. Sistema solicita rejection_reason (mínimo 20 caracteres)
  3. Super admin ingresa reason detallado
  4. Sistema actualiza status a 'rejected'
  5. Sistema registra rejection_reason
  6. Sistema envía email al creator con reason
  7. Ejercicio NO se publica

---

## 🔗 Referencias a Implementación

### Database
🗄️ **Tablas:**
- `educational_content.exercises` → `apps/database/ddl/schemas/educational_content/tables/exercises.sql`
  - **Propósito:** Ejercicios con status de moderación
  - **Columnas clave:** `id`, `title`, `type`, `creator_id`, `status`, `reviewer_id`, `reviewed_at`, `rejection_reason`, `is_published`
- `storage.media_files` → `apps/database/ddl/schemas/storage/tables/media_files.sql`
  - **Propósito:** Archivos multimedia (imágenes, videos, audio)
  - **Columnas clave:** `id`, `filename`, `file_type`, `size`, `uploader_id`, `storage_url`, `upload_date`, `is_active`
- `educational_content.content_versions` → `apps/database/ddl/schemas/educational_content/tables/content_versions.sql`
  - **Propósito:** Versionamiento de contenido para rollback
  - **Columnas clave:** `id`, `content_id`, `content_type`, `version_number`, `content_snapshot`, `created_by`, `created_at`

🗄️ **ENUMs:**
- `content_status` → `apps/database/ddl/00-prerequisites.sql` (pending, approved, rejected, draft)
- `media_file_type` → `apps/database/ddl/00-prerequisites.sql` (image, video, audio, document)
- `content_type_enum` → `apps/database/ddl/00-prerequisites.sql` (exercise, lesson, quiz, assignment)

🗄️ **Foreign Keys:**
- `exercises.creator_id` → `users(id)`
- `exercises.reviewer_id` → `users(id)`
- `media_files.uploader_id` → `users(id)`
- `content_versions.created_by` → `users(id)`

### Backend
💻 **Controllers:**
- `apps/backend/src/modules/admin/controllers/content-moderation.controller.ts`
  - **Endpoints implementados:**
    - GET /api/admin/content/exercises/pending - Cola de moderación
    - POST /api/admin/content/exercises/:id/approve - Aprobar contenido
    - POST /api/admin/content/exercises/:id/reject - Rechazar contenido
- `apps/backend/src/modules/admin/controllers/media-management.controller.ts`
  - **Endpoints implementados:**
    - GET /api/admin/content/media - Listar archivos multimedia
    - DELETE /api/admin/content/media/:id - Eliminar media
- `apps/backend/src/modules/admin/controllers/content-versioning.controller.ts`
  - **Endpoints implementados:**
    - POST /api/admin/content/version - Crear snapshot de versión

💻 **Services:**
- `apps/backend/src/modules/admin/services/content-moderation.service.ts`
  - **Métodos:** getPendingContent(), approveContent(), rejectContent()
  - **Validaciones:** validateRejectionReason() (mínimo 20 chars)
- `apps/backend/src/modules/admin/services/media-management.service.ts`
  - **Métodos:** listMedia(), deleteMedia(), checkMediaReferences()
  - **Storage:** Integración con S3 o filesystem local
- `apps/backend/src/modules/admin/services/content-versioning.service.ts`
  - **Métodos:** createVersion(), restoreVersion(), getVersionHistory()
  - **Propósito:** Crear snapshots inmutables de contenido

💻 **DTOs:**
- `apps/backend/src/modules/admin/dto/approve-content.dto.ts`
- `apps/backend/src/modules/admin/dto/reject-content.dto.ts`
  - **Validación:** rejection_reason (mínimo 20 caracteres, obligatorio)
- `apps/backend/src/modules/admin/dto/list-pending-content-query.dto.ts`
  - **Filtros:** content_type, creator, date_range, page, limit
- `apps/backend/src/modules/admin/dto/create-version.dto.ts`

💻 **Entities:**
- `apps/backend/src/modules/educational-content/entities/exercise.entity.ts`
- `apps/backend/src/modules/storage/entities/media-file.entity.ts`
- `apps/backend/src/modules/educational-content/entities/content-version.entity.ts`

💻 **Guards:**
- `apps/backend/src/shared/guards/content-moderator.guard.ts`
  - **Propósito:** Verifica que user.role in ['super_admin', 'content_moderator']
  - **Aplicado en:** Todos los endpoints de moderación

💻 **Email Templates:**
- `apps/backend/src/modules/notifications/templates/content-approved.email.ts`
  - **Contenido:** Notificación de aprobación de contenido
- `apps/backend/src/modules/notifications/templates/content-rejected.email.ts`
  - **Contenido:** Notificación de rechazo con rejection_reason

💻 **Storage:**
- `apps/backend/src/shared/storage/s3-storage.service.ts`
  - **Métodos:** uploadFile(), deleteFile(), getFileUrl()
- `apps/backend/src/shared/storage/local-storage.service.ts`
  - **Métodos:** Fallback para desarrollo local

### Frontend
🎨 **Componentes Content Moderation:**
- `apps/frontend/src/features/admin/components/ContentModerationQueue.tsx`
  - **Propósito:** Cola de contenido pendiente con filtros (tipo, fecha, creator)
- `apps/frontend/src/features/admin/components/ContentPreviewCard.tsx`
  - **Propósito:** Card de preview de contenido con botones approve/reject
- `apps/frontend/src/features/admin/components/ApproveContentModal.tsx`
  - **Propósito:** Confirmación de aprobación
- `apps/frontend/src/features/admin/components/RejectContentModal.tsx`
  - **Propósito:** Modal para rechazar con campo rejection_reason (mín 20 chars)

🎨 **Componentes Media Management:**
- `apps/frontend/src/features/admin/components/MediaFilesList.tsx`
  - **Propósito:** Lista de archivos multimedia con preview de imágenes
- `apps/frontend/src/features/admin/components/MediaFileCard.tsx`
  - **Propósito:** Card de archivo con info (size, type, uploader, upload date)
- `apps/frontend/src/features/admin/components/DeleteMediaModal.tsx`
  - **Propósito:** Confirmación de eliminación con warning si archivo en uso

🎨 **Componentes Versioning:**
- `apps/frontend/src/features/admin/components/ContentVersionHistory.tsx`
  - **Propósito:** Timeline de versiones de contenido
- `apps/frontend/src/features/admin/components/RestoreVersionModal.tsx`
  - **Propósito:** Confirmación de restauración de versión anterior

🎨 **Hooks:**
- `apps/frontend/src/features/admin/hooks/useContentModeration.ts`
  - **Métodos:** useGetPendingContent, useApproveContent, useRejectContent
- `apps/frontend/src/features/admin/hooks/useMediaManagement.ts`
  - **Métodos:** useGetMedia, useDeleteMedia
- `apps/frontend/src/features/admin/hooks/useContentVersioning.ts`
  - **Métodos:** useCreateVersion, useRestoreVersion, useGetVersionHistory

🎨 **Types:**
- `apps/frontend/src/types/content-moderation.types.ts`
  - **Interfaces:** PendingContent, ContentReview, RejectContentDto
  - **Enums:** ContentStatus, ContentType
- `apps/frontend/src/types/media.types.ts`
  - **Interfaces:** MediaFile, MediaFileDetails
  - **Enums:** MediaFileType

🎨 **Services:**
- `apps/frontend/src/services/api/admin/content-moderation.service.ts`
  - **Métodos API:** getPendingContent(), approveContent(), rejectContent()
- `apps/frontend/src/services/api/admin/media-management.service.ts`
  - **Métodos API:** getMedia(), deleteMedia()

---

## Referencias

### Documentación de Épica
- **README Épica:** `/docs/04-planificacion/epicas/EP010-admin-portal/README.md`
- **Historia HU-EP010-03:** `/docs/04-planificacion/epicas/EP010-admin-portal/historias/HU-EP010-03-content-management.md`
- **API Reference:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 2131-2187)
- **Database Schema:** `/docs/03-desarrollo/base-de-datos/schemas/`

### Endpoints API (6 endpoints)
1. GET /api/admin/content/exercises/pending
2. POST /api/admin/content/exercises/:id/approve
3. POST /api/admin/content/exercises/:id/reject
4. GET /api/admin/content/media
5. DELETE /api/admin/content/media/:id
6. POST /api/admin/content/version

---

**Última actualización:** 2025-11-01
**Versión:** 2.0 (RFC-0001)
**Estado:** APROBADO
