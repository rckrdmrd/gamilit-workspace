# _MAP: EXT-008 - White Label

**Epica:** EXT-008
**Nombre:** White Label / Multi-Tenancy Avanzado
**Fase:** 3 - Extensiones (Alcance v2 EXTENSIONES)
**Presupuesto Total:** $5,000 USD (~100,000 MXN)
**Story Points Total:** 35 SP
**Estado:** EN PROGRESO - 50% IMPLEMENTADA (17.5 SP impl, 17.5 SP pend)
**Ultima actualizacion:** 2026-01-27

---

## Proposito

Permitir personalizacion completa de branding por organizacion (white label) para modelo B2B.

**Impacto:** **MEDIO-ALTO** - Diferenciador competitivo B2B

---

## Especificaciones Tecnicas (4 total)

| ID | Titulo | Completitud | Horas Restantes |
|----|--------|-------------|-----------------|
| [ET-WL-001](./especificaciones/ET-WL-001-theming.md) | Theming System | 55% | 26h |
| [ET-WL-002](./especificaciones/ET-WL-002-tenant-customization.md) | Tenant Customization | 45% | 22h |
| [ET-WL-003](./especificaciones/ET-WL-003-asset-management.md) | Asset Management | 35% | 17h |
| [ET-WL-004](./especificaciones/ET-WL-004-css-runtime-variables.md) | CSS Runtime Variables | 50% | 15h |

**Total restante:** 80 horas

---

## User Stories (3 total - Tier 1)

| ID | Titulo | SP | Prioridad | Estado |
|----|--------|----|-----------|--------|
| [US-WL-001](./historias-usuario/US-WL-001-branding-config.md) | Branding Configuration | 8 | P1 | Parcial (50%) |
| [US-WL-002](./historias-usuario/US-WL-002-logo-colors.md) | Logo and Colors Upload | 6 | P1 | Pendiente |
| [US-WL-003](./historias-usuario/US-WL-003-platform-name.md) | Platform Name Customization | 6 | P2 | Parcial (30%) |

**Total:** 17.5/35 SP implementados (50%)

---

## Implementacion Actual

### Completo
- **Database:** `auth_management.tenants` con logo_url, settings JSONB
- **Database:** `system_configuration.tenant_configurations`
- **Backend:** Tenant Entity, TenantConfiguration Entity
- **Backend:** MediaStorageService (base para uploads)
- **Frontend:** CSS Variables en :root (index.css)
- **Frontend:** detective-theme.css con variables
- **Frontend:** theme-light.ts, theme-dark.ts

### Parcial
- **Frontend:** ThemeProvider (estructura lista, falta branding)

### Pendiente
- **Backend:** BrandingModule (Controller, Service, DTOs)
- **Backend:** BrandingAssetService (logo/favicon upload)
- **Backend:** ImageProcessingService (resize, optimize)
- **Frontend:** BrandingProvider
- **Frontend:** Admin UI (ColorPicker, LogoUploader, etc.)

---

## Checklist de Implementacion

Ver: [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md)

---

## Archivos Clave Existentes

### Backend
| Archivo | Path |
|---------|------|
| Tenant Entity | `apps/backend/src/modules/auth/entities/tenant.entity.ts` |
| TenantConfiguration Entity | `apps/backend/src/modules/admin/entities/tenant-configuration.entity.ts` |
| MediaStorageService | `apps/backend/src/modules/educational/services/media-storage.service.ts` |

### Frontend
| Archivo | Path |
|---------|------|
| CSS Variables | `apps/frontend/src/shared/styles/index.css` |
| Detective Theme | `apps/frontend/src/shared/styles/detective-theme.css` |
| Theme Light | `apps/frontend/src/shared/themes/theme-light.ts` |
| Theme Dark | `apps/frontend/src/shared/themes/theme-dark.ts` |

### Database
| Archivo | Path |
|---------|------|
| Tenants DDL | `apps/database/ddl/schemas/auth_management/tables/01-tenants.sql` |
| TenantConfigs DDL | `apps/database/ddl/schemas/system_configuration/tables/tenant_configurations.sql` |

---

**Generado:** 2026-01-27
**Sistema:** SIMCO v4.0.0 + CAPVED
