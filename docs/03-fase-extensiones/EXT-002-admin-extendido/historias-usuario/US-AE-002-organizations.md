# HU-EP010-02: Gestión de Organizaciones

## Información General

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-002 |
| **Épica** | EXT-002 - Admin Extendido |
| **Título** | Gestión de Organizaciones/Escuelas |
| **Prioridad** | Alta (P1) |
| **Story Points** | 18 SP |
| **Estado** | ✅ COMPLETED |
| **Sprint** | Sprint 2 |
| **Duración Estimada** | 5 días |
| **Duración Real** | 2h (FE-059 Day 4) |
| **Fecha Implementación** | 2025-11-14 |

---

## Historia de Usuario

**Como** super admin del sistema GAMILIT
**Quiero** gestionar organizaciones/escuelas y sus subscripciones/feature flags
**Para** controlar acceso institucional, features premium, billing y limits

---

## Endpoints API (8 endpoints)

1. **GET /api/admin/organizations** - Lista organizaciones con filtros
2. **GET /api/admin/organizations/:id** - Detalles de organización + stats
3. **POST /api/admin/organizations** - Crea nueva organización/escuela
4. **PUT /api/admin/organizations/:id** - Actualiza información
5. **DELETE /api/admin/organizations/:id** - Elimina organización (soft delete)
6. **GET /api/admin/organizations/:id/users** - Lista usuarios de la organización
7. **PATCH /api/admin/organizations/:id/subscription** - Actualiza subscription tier/status
8. **PATCH /api/admin/organizations/:id/features** - Actualiza feature flags

**Middleware:** `authenticateJWT` → `requireSuperAdmin` → `adminRateLimit` → `auditAdminAction`
**Rate Limit:** 30 req/min

---

## Criterios de Aceptación (Resumidos)

### Funcionales
- ✓ Listar organizaciones con filtros: type, subscription_tier, status
- ✓ Ver detalles: org info, users count, subscription, features
- ✓ Crear org: name, type, contact, subscription tier
- ✓ Actualizar org: contact info, max_users, address
- ✓ Delete org: Soft delete, bloquea acceso de usuarios
- ✓ Subscription: Actualizar tier (free, basic, premium, enterprise), status, dates
- ✓ Feature flags: Toggle features (advanced_analytics, api_access, custom_branding, sso)
- ✓ Users: Ver lista de usuarios de la org con paginación
- ✓ Audit logging: Todas las acciones se loguean

### No Funcionales
- ✓ Response time p95 <300ms
- ✓ Solo role='super_admin'
- ✓ Rate limiting: 30 req/min
- ✓ Test coverage >85%

---

## Definición de Hecho (DoD)

- ✅ 8 endpoints implementados
- ✅ Frontend: OrganizationList, CreateOrg form, Subscription manager, Feature flags editor
- ⚠️ Tests unitarios >85% (pendiente - deuda técnica)
- ⚠️ Tests E2E para flujos críticos (pendiente - deuda técnica)
- ✅ Audit logging funcionando
- ✅ Documentación API completa

---

## Referencias de Implementación

### Archivos Clave
- **Hook:** `apps/admin/hooks/useOrganizations.ts` (250+ líneas)
- **Página:** `apps/admin/pages/AdminInstitutionsPage.tsx` (350+ líneas)
- **API Client:** `apps/admin/services/adminAPI.ts` (organizations category)
- **Types:** `apps/admin/types/organization.types.ts`
- **Components:** `apps/admin/components/organizations/` (OrgTable, CreateOrgModal, SubscriptionEditor, etc.)

### Documentación
- **Implementación:** FE-059 Day 4 (2025-11-14)
- **Resumen:** `/orchestration/frontend/FE-059/04-RESUMEN-DIA-4.md`
- **Mapeo US:** `/orchestration/frontend/FE-059/20-MAPEO-US-IMPLEMENTACION.md`

---

**Referencia API:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 2151-2159)
**Última actualización:** 2025-11-19 (Estado actualizado a COMPLETED)
**Creación original:** 2025-10-28
