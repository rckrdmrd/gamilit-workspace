# HU-EP010-03: Gestión de Contenido

## Información General

| Campo | Valor |
|-------|-------|
| **ID** | HU-EP010-03 |
| **Épica** | EP010 - Admin Portal |
| **Título** | Gestión y Moderación de Contenido |
| **Prioridad** | Media (P2) |
| **Story Points** | 16 SP |
| **Estado** | NOT STARTED |
| **Sprint** | Sprint 3 |
| **Duración Estimada** | 4 días |

---

## Historia de Usuario

**Como** super admin o content moderator
**Quiero** revisar, aprobar y rechazar contenido creado por profesores/comunidad
**Para** mantener calidad y seguridad del contenido de la plataforma

---

## Endpoints API (6 endpoints)

1. **GET /api/admin/content/exercises/pending** - Lista ejercicios pendientes de aprobación
2. **POST /api/admin/content/exercises/:id/approve** - Aprueba ejercicio
3. **POST /api/admin/content/exercises/:id/reject** - Rechaza ejercicio (requiere reason)
4. **GET /api/admin/content/media** - Lista archivos multimedia del sistema
5. **DELETE /api/admin/content/media/:id** - Elimina archivo multimedia
6. **POST /api/admin/content/version** - Crea versión de contenido (rollback/versioning)

**Middleware:** `authenticateJWT` → `requireSuperAdmin` → `adminRateLimit` → `auditAdminAction`
**Rate Limit:** 30 req/min

---

## Criterios de Aceptación (Resumidos)

### Funcionales
- ✓ Listar pending: Ejercicios/lessons creados por teachers esperando aprobación
- ✓ Ver preview: Renderizar ejercicio completo antes de aprobar
- ✓ Approve: Cambiar status a 'approved', publicar en catálogo
- ✓ Reject: Cambiar status a 'rejected', requiere rejection_reason, notificar creator
- ✓ Media list: Ver archivos (images, videos) con size, uploader, date
- ✓ Delete media: Remover archivos inapropiados/duplicados
- ✓ Versioning: Crear snapshots de contenido para rollback
- ✓ Audit logging: Todas las acciones se loguean

### No Funcionales
- ✓ Response time p95 <400ms (preview puede ser pesado)
- ✓ Solo role='super_admin' o 'content_moderator'
- ✓ Rate limiting: 30 req/min
- ✓ Test coverage >85%

---

## Definición de Hecho (DoD)

- [ ] 6 endpoints implementados
- [ ] Frontend: ContentModerationQueue, ExercisePreview, Approve/Reject modals, MediaGallery
- [ ] Tests unitarios >85%
- [ ] Tests E2E para flujos de moderación
- [ ] Audit logging funcionando
- [ ] Documentación API completa

---

**Referencia API:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 2161-2167)
**Última actualización:** 2025-10-28
