# Requerimientos Admin Portal - Gestión de Organizaciones

**Proyecto:** Gamilit Platform
**Portal:** Admin
**Archivo original:** REQUERIMIENTOS-ADMIN-PORTAL.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Tabla de Contenidos

1. [Gestión de Organizaciones](#gestión-de-organizaciones)
2. [Matriz de Permisos](#matriz-de-permisos)
3. [Reglas de Negocio](#reglas-de-negocio)
4. [Casos de Uso](#casos-de-uso)
5. [Referencias](#referencias)

---

## Gestión de Organizaciones

### RF-002: Gestión de Organizaciones

**Prioridad:** ALTA
**Historia:** HU-EP010-02
**Story Points:** 18 SP

#### RF-002.1: Listado de Organizaciones
- **Descripción:** Super admin debe poder listar todas las organizaciones/escuelas
- **Criterios:**
  - Filtros por: tipo (school, district, enterprise), subscription_tier (free, basic, premium, enterprise), status (active, suspended, cancelled)
  - Búsqueda por nombre
  - Paginación: 10, 25, 50, 100 items
  - Información mostrada: id, nombre, tipo, subscription tier, status, número de usuarios, fecha de creación
- **Endpoint:** GET /api/admin/organizations

#### RF-002.2: Detalles de Organización
- **Descripción:** Ver información completa de una organización
- **Criterios:**
  - Información básica: nombre, tipo, contacto (email, teléfono), dirección
  - Subscription: tier, status, fecha de inicio, fecha de fin, max_users
  - Feature flags activos
  - Estadísticas: usuarios totales, usuarios activos, profesores, estudiantes
  - Usuarios asociados (lista resumida)
- **Endpoint:** GET /api/admin/organizations/:id

#### RF-002.3: Creación de Organización
- **Descripción:** Crear nueva organización/escuela en el sistema
- **Criterios:**
  - Campos requeridos: nombre, tipo, contact_email
  - Campos opcionales: contact_phone, dirección, subscription_tier (default: free)
  - Validación de email único
  - Inicializar feature_flags según tier
  - Registro en audit log
- **Endpoint:** POST /api/admin/organizations

#### RF-002.4: Actualización de Organización
- **Descripción:** Actualizar información de organización
- **Criterios:**
  - Campos editables: nombre, tipo, contacto, dirección, max_users
  - NO editable por este endpoint: subscription (usar endpoint específico)
  - Registro en audit log con old_values y new_values
- **Endpoint:** PUT /api/admin/organizations/:id

#### RF-002.5: Eliminación de Organización
- **Descripción:** Eliminar organización (soft delete)
- **Criterios:**
  - Soft delete: campo is_active = false
  - Bloquear acceso de todos los usuarios de la organización
  - Preservar datos para auditoría
  - Confirmación obligatoria
  - Registro en audit log
- **Endpoint:** DELETE /api/admin/organizations/:id

#### RF-002.6: Usuarios de Organización
- **Descripción:** Listar usuarios asociados a una organización
- **Criterios:**
  - Información mostrada: user id, nombre, email, rol en organización, fecha de ingreso
  - Filtros por rol (admin, teacher, student)
  - Paginación
  - Ordenamiento por nombre, fecha de ingreso
- **Endpoint:** GET /api/admin/organizations/:id/users

#### RF-002.7: Gestión de Subscription
- **Descripción:** Actualizar subscription tier y status de organización
- **Criterios:**
  - Campos editables: subscription_tier, subscription_status, subscription_start_date, subscription_end_date, max_users
  - Tiers disponibles: free, basic, premium, enterprise
  - Status disponibles: active, suspended, cancelled
  - Actualizar feature_flags automáticamente según tier
  - Registro en audit log
- **Endpoint:** PATCH /api/admin/organizations/:id/subscription

#### RF-002.8: Gestión de Feature Flags
- **Descripción:** Actualizar feature flags de organización
- **Criterios:**
  - Features disponibles:
    - advanced_analytics: Acceso a analytics avanzados
    - api_access: Acceso a API externa
    - custom_branding: Branding personalizado
    - sso_integration: Single Sign-On
    - unlimited_storage: Storage ilimitado
    - priority_support: Soporte prioritario
  - Toggle individual de cada feature
  - Validar features según subscription tier
  - Registro en audit log
- **Endpoint:** PATCH /api/admin/organizations/:id/features

---

## Matriz de Permisos

### Permisos de Organization Management

| Acción | super_admin | content_moderator | system_operator | admin | teacher | student |
|--------|-------------|-------------------|-----------------|-------|---------|---------|
| Listar organizaciones | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Ver detalles org | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Crear organización | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Actualizar organización | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Eliminar organización | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Ver usuarios org | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Gestionar subscription | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Gestionar feature flags | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## Reglas de Negocio

### RN-002: Gestión de Organizaciones

#### RN-002.1: Subscription Tiers
- **free:** max_users = 20, no feature flags
- **basic:** max_users = 100, advanced_analytics = true
- **premium:** max_users = 500, advanced_analytics + api_access + custom_branding = true
- **enterprise:** max_users = ilimitado, todas las features = true

#### RN-002.2: Feature Flags según Tier
- Feature flags se actualizan automáticamente al cambiar tier
- No permitir activar features no incluidas en tier
- Downgrade de tier desactiva features automáticamente

#### RN-002.3: Límite de Usuarios
- Organización no puede superar max_users de su tier
- Al alcanzar límite, bloquear registro de nuevos usuarios
- Upgrade de tier aumenta límite inmediatamente

---

## Casos de Uso

### CU-ADM-002: Gestionar Subscription de Organización

**Actor Principal:** Super Admin
**Objetivo:** Actualizar subscription tier de una organización/escuela

**Precondiciones:**
- Super admin autenticado
- Organización existe en el sistema

**Flujo Principal:**
1. Super admin navega a "Organizations"
2. Super admin selecciona organización de la lista
3. Sistema muestra detalles de organización incluyendo subscription actual
4. Super admin hace clic en botón "Manage Subscription"
5. Sistema muestra modal con opciones de subscription:
   - Subscription tier (free, basic, premium, enterprise)
   - Subscription status (active, suspended, cancelled)
   - Start date y end date
   - Max users
6. Super admin selecciona nuevo tier (ej. premium)
7. Super admin ajusta max_users según tier
8. Super admin confirma cambios
9. Sistema valida permisos y datos
10. Sistema actualiza subscription en base de datos
11. Sistema actualiza feature_flags automáticamente según tier:
    - free: No features adicionales
    - basic: advanced_analytics
    - premium: advanced_analytics, api_access, custom_branding
    - enterprise: Todas las features
12. Sistema registra cambios en admin_audit_log (old_values, new_values)
13. Sistema envía email de notificación al admin de la organización
14. Sistema muestra mensaje de éxito
15. Super admin ve subscription actualizada en UI

**Postcondiciones:**
- Subscription tier actualizado
- Feature flags actualizados según tier
- Límite de usuarios aplicado
- Email de notificación enviado
- Acción registrada en audit log

**Flujos Alternativos:**
- **A1 - Tier no permite cambio:** Si organización tiene más usuarios que max_users del nuevo tier, sistema muestra error
- **A2 - Downgrade requiere confirmación:** Si downgrade (ej. premium → basic), sistema solicita confirmación adicional

---

## 🔗 Referencias a Implementación

### Database
🗄️ **Tablas:**
- `auth.organizations` → `apps/database/ddl/schemas/auth/tables/organizations.sql`
  - **Propósito:** Tabla de organizaciones/escuelas
  - **Columnas clave:** `id`, `name`, `type`, `contact_email`, `contact_phone`, `address`, `subscription_tier`, `subscription_status`, `subscription_start_date`, `subscription_end_date`, `max_users`, `feature_flags`, `is_active`, `created_at`
- `auth.organization_users` → `apps/database/ddl/schemas/auth/tables/organization_users.sql`
  - **Propósito:** Relación muchos-a-muchos entre organizaciones y usuarios
  - **Columnas clave:** `organization_id`, `user_id`, `role_in_org`, `joined_at`

🗄️ **ENUMs:**
- `organization_type` → `apps/database/ddl/00-prerequisites.sql` (school, district, enterprise)
- `subscription_tier` → `apps/database/ddl/00-prerequisites.sql` (free, basic, premium, enterprise)
- `subscription_status` → `apps/database/ddl/00-prerequisites.sql` (active, suspended, cancelled)
- `organization_role` → `apps/database/ddl/00-prerequisites.sql` (admin, teacher, student)

🗄️ **Foreign Keys:**
- `organization_users.organization_id` → `organizations(id)`
- `organization_users.user_id` → `users(id)`

🗄️ **Indexes:**
- `organizations` índices en: (name), (type), (subscription_tier), (subscription_status), (is_active), (contact_email UNIQUE)
- `organization_users` índices en: (organization_id, user_id UNIQUE), (user_id)

🗄️ **JSON Columns:**
- `organizations.feature_flags` - JSONB con estructura:
  ```json
  {
    "advanced_analytics": boolean,
    "api_access": boolean,
    "custom_branding": boolean,
    "sso_integration": boolean,
    "unlimited_storage": boolean,
    "priority_support": boolean
  }
  ```

### Backend
💻 **Controllers:**
- `apps/backend/src/modules/admin/controllers/organization-management.controller.ts`
  - **Endpoints implementados:**
    - GET /api/admin/organizations - Listar organizaciones con filtros
    - GET /api/admin/organizations/:id - Detalles de organización
    - POST /api/admin/organizations - Crear organización
    - PUT /api/admin/organizations/:id - Actualizar organización
    - DELETE /api/admin/organizations/:id - Soft delete organización
    - GET /api/admin/organizations/:id/users - Listar usuarios de organización
    - PATCH /api/admin/organizations/:id/subscription - Actualizar subscription
    - PATCH /api/admin/organizations/:id/features - Actualizar feature flags

💻 **Services:**
- `apps/backend/src/modules/admin/services/organization-management.service.ts`
  - **Métodos:** listOrganizations(), getOrganizationDetails(), createOrganization(), updateOrganization(), deleteOrganization()
  - **Métodos adicionales:** getOrganizationUsers()
- `apps/backend/src/modules/admin/services/subscription-management.service.ts`
  - **Métodos:** updateSubscription(), getSubscriptionDetails(), validateMaxUsers()
  - **Lógica:** Actualiza feature_flags automáticamente según tier
- `apps/backend/src/modules/admin/services/feature-flags.service.ts`
  - **Métodos:** updateFeatureFlags(), validateFeaturesForTier(), getFeaturesForTier()
  - **Validación:** Features permitidas según subscription tier
- `apps/backend/src/modules/admin/services/organization-limits.service.ts`
  - **Métodos:** checkUserLimit(), canAddUser(), getUserCount()
  - **Propósito:** Validar límite de usuarios según tier

💻 **DTOs:**
- `apps/backend/src/modules/admin/dto/create-organization.dto.ts`
  - **Validación:** name, type, contact_email (unique), subscription_tier (default: free)
- `apps/backend/src/modules/admin/dto/update-organization.dto.ts`
  - **Validación:** name, type, contact_email, contact_phone, address, max_users
- `apps/backend/src/modules/admin/dto/update-subscription.dto.ts`
  - **Validación:** subscription_tier, subscription_status, start_date, end_date, max_users
- `apps/backend/src/modules/admin/dto/update-feature-flags.dto.ts`
  - **Validación:** feature flags válidos según tier
- `apps/backend/src/modules/admin/dto/list-organizations-query.dto.ts`
  - **Filtros:** type, subscription_tier, subscription_status, search (nombre), page, limit

💻 **Entities:**
- `apps/backend/src/modules/auth/entities/organization.entity.ts`
- `apps/backend/src/modules/auth/entities/organization-user.entity.ts`

💻 **Guards:**
- `apps/backend/src/shared/guards/super-admin.guard.ts`
  - **Propósito:** Verifica que user.role === 'super_admin'
  - **Aplicado en:** Todos los endpoints de /api/admin/organizations

💻 **Email Templates:**
- `apps/backend/src/modules/notifications/templates/organization-created.email.ts`
  - **Contenido:** Notificación de nueva organización
- `apps/backend/src/modules/notifications/templates/subscription-updated.email.ts`
  - **Contenido:** Notificación de cambio de subscription con feature flags actualizadas

💻 **Utils:**
- `apps/backend/src/shared/utils/subscription-tiers.util.ts`
  - **Métodos:** getTierFeatures(), getTierMaxUsers(), validateTierChange()
  - **Constants:** Definición de features por tier
- `apps/backend/src/shared/utils/feature-flags-calculator.util.ts`
  - **Métodos:** calculateFeaturesForTier(), mergeFeaturesWithDefaults()

### Frontend
🎨 **Componentes Organization Management:**
- `apps/frontend/src/features/admin/components/OrganizationList.tsx`
  - **Propósito:** Lista paginada de organizaciones con filtros (type, tier, status)
- `apps/frontend/src/features/admin/components/OrganizationCard.tsx`
  - **Propósito:** Tarjeta de organización con info básica y stats (usuarios count)
- `apps/frontend/src/features/admin/components/OrganizationDetailsPanel.tsx`
  - **Propósito:** Panel de detalles completos con tabs (Info, Subscription, Users, Audit)
- `apps/frontend/src/features/admin/components/CreateOrganizationModal.tsx`
  - **Propósito:** Modal para crear nueva organización
- `apps/frontend/src/features/admin/components/OrganizationUsersTable.tsx`
  - **Propósito:** Tabla de usuarios de organización con roles

🎨 **Componentes Subscription:**
- `apps/frontend/src/features/admin/components/SubscriptionManager.tsx`
  - **Propósito:** Panel para gestionar subscription (tier, status, dates, max_users)
- `apps/frontend/src/features/admin/components/SubscriptionTierCard.tsx`
  - **Propósito:** Card visual de tier con features incluidas
- `apps/frontend/src/features/admin/components/SubscriptionUpgradeModal.tsx`
  - **Propósito:** Modal para cambiar tier con confirmación de downgrade

🎨 **Componentes Feature Flags:**
- `apps/frontend/src/features/admin/components/FeatureFlagsPanel.tsx`
  - **Propósito:** Panel con toggles de feature flags
- `apps/frontend/src/features/admin/components/FeatureFlagToggle.tsx`
  - **Propósito:** Toggle individual de feature con tooltip explicativo
- `apps/frontend/src/features/admin/components/FeatureFlagsComparison.tsx`
  - **Propósito:** Tabla comparativa de features por tier

🎨 **Hooks:**
- `apps/frontend/src/features/admin/hooks/useOrganizations.ts`
  - **Métodos:** useGetOrganizations (con filtros), useGetOrganizationDetails
- `apps/frontend/src/features/admin/hooks/useOrganizationManagement.ts`
  - **Métodos:** useCreateOrganization, useUpdateOrganization, useDeleteOrganization
- `apps/frontend/src/features/admin/hooks/useSubscription.ts`
  - **Métodos:** useUpdateSubscription, useGetSubscriptionDetails
- `apps/frontend/src/features/admin/hooks/useFeatureFlags.ts`
  - **Métodos:** useUpdateFeatureFlags, useGetFeaturesForTier
- `apps/frontend/src/features/admin/hooks/useOrganizationUsers.ts`
  - **Métodos:** useGetOrganizationUsers

🎨 **Types:**
- `apps/frontend/src/types/organization.types.ts`
  - **Interfaces:** Organization, OrganizationDetails, Subscription, FeatureFlags, OrganizationUser
  - **Enums:** OrganizationType, SubscriptionTier, SubscriptionStatus, OrganizationRole

🎨 **Services:**
- `apps/frontend/src/services/api/admin/organization-management.service.ts`
  - **Métodos API:** getOrganizations(), getOrganizationDetails(), createOrganization(), updateOrganization(), deleteOrganization()
  - **Métodos subscription:** updateSubscription(), updateFeatureFlags()
  - **Métodos users:** getOrganizationUsers()

🎨 **Utils:**
- `apps/frontend/src/utils/subscription-helpers.ts`
  - **Métodos:** getTierLabel(), getTierColor(), getTierMaxUsers(), getTierFeatures()
- `apps/frontend/src/utils/feature-flags-helpers.ts`
  - **Métodos:** getFeatureName(), getFeatureIcon(), isFeatureAvailableForTier()

🎨 **Constants:**
- `apps/frontend/src/constants/subscription-tiers.ts`
  - **Definiciones:** Mapeo de tiers a features y límites

---

## Referencias

### Documentación de Épica
- **README Épica:** `/docs/04-planificacion/epicas/EP010-admin-portal/README.md`
- **Historia HU-EP010-02:** `/docs/04-planificacion/epicas/EP010-admin-portal/historias/HU-EP010-02-organizations.md`
- **API Reference:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 2131-2187)
- **Database Schema:** `/docs/03-desarrollo/base-de-datos/schemas/`

### Endpoints API (8 endpoints)
1. GET /api/admin/organizations
2. GET /api/admin/organizations/:id
3. POST /api/admin/organizations
4. PUT /api/admin/organizations/:id
5. DELETE /api/admin/organizations/:id
6. GET /api/admin/organizations/:id/users
7. PATCH /api/admin/organizations/:id/subscription
8. PATCH /api/admin/organizations/:id/features

---

**Última actualización:** 2025-11-01
**Versión:** 2.0 (RFC-0001)
**Estado:** APROBADO
