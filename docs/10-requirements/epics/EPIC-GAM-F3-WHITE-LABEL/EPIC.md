---
titulo: "EXT-008: White-label System (Tier 1)"
tipo: epic
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# EXT-008: White-label System (Tier 1)

> **STATUS: BACKLOG - FUERA DEL MVP**
>
> Esta epica esta **parcialmente implementada (50%)** y **NO forma parte del MVP actual**.
> Razon: Depende de contratos enterprise.
> Ver: [Epics Index](../_INDEX.md)

**Version:** 2.0
**Fecha de creacion:** 2025-11-07
**Ultima actualizacion:** 2026-01-27
**Prioridad:** P2 (Promovida desde P3)
**Story Points:** 35 SP
**Presupuesto:** $5,000 USD
**Timeline:** v1.5 (Semanas 25-32)
**Estado:** EN PROGRESO (50% implementado)

---

## Progreso de Implementacion

| Especificacion | Titulo | Completitud |
|----------------|--------|-------------|
| [ET-WL-001](./specifications/ET-WL-001-theming.md) | Theming System | 55% |
| [ET-WL-002](./specifications/ET-WL-002-tenant-customization.md) | Tenant Customization | 45% |
| [ET-WL-003](./specifications/ET-WL-003-asset-management.md) | Asset Management | 35% |
| [ET-WL-004](./specifications/ET-WL-004-css-runtime-variables.md) | CSS Runtime Variables | 50% |

**Checklist completo:** [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md)

### Componentes Completos
- Tenant Entity con logo_url y settings JSONB
- TenantConfiguration Entity
- CSS Variables base (:root)
- detective-theme.css
- theme-light.ts / theme-dark.ts
- DDL tables (tenants, tenant_configurations)

### Componentes Faltantes
- BrandingModule (Controller, Service)
- BrandingAssetService (logo/favicon upload)
- BrandingProvider (Frontend)
- Admin UI (ColorPicker, LogoUploader, etc.)

---

## 📋 Descripción

Sistema de personalización de marca (white-label) **Tier 1 Básico** que permite a instituciones enterprise personalizar la plataforma GAMILIT con su propia identidad visual: logo, colores corporativos, nombre de plataforma y favicon.

**Tiers del sistema completo:**
- **Tier 1 (Básico):** Logo, colores, nombre, favicon - **20h (Esta épica)**
- Tier 2 (Avanzado): Dominio custom, emails, login page - 40h adicionales (v2.0+)
- Tier 3 (Completo): Fonts, CSS custom, ocultar branding GAMILIT- 60h adicionales (v2.0+)

---

## 🎯 Objetivos de Negocio

### Problema a Resolver
Instituciones enterprise requieren que la plataforma refleje su identidad corporativa:
- Logo institucional (no logo GAMILIT
- Colores de la universidad/colegio
- Nombre personalizado ("Portal Educativo Universidad X" vs "GAMILIT Platform")

### Valor Esperado
- **Enterprise pricing:** 3-5x vs plan institucional estándar
- **Churn reduction:** -15% (mayor apropiación institucional)
- **ARR incremental:** +$12,000/año
- **ROI:** 400% en año 1

### Pricing
- **Plan Pro:** $1,500/mes (Tier 1 white-label incluido)
- **Plan Enterprise:** $5,000/mes (Tier 1 + 2 + 3)

### Métricas de Éxito
- **Adoption:** >30% instituciones grandes usan white-label
- **Upgrade rate:** 20% instituciones básicas → Pro
- **Churn:** <8% (vs 10% plan básico)

---

## 🏗️ Arquitectura Técnica

### Componentes

1. **Tenant Branding Table (DB)**
   - Schema: `system_configuration.tenant_branding`
   - Almacena configuración por tenant

2. **Branding Service (Backend)**
   - API para CRUD de configuración
   - Endpoint público para obtener branding por domain

3. **WhiteLabelProvider (Frontend)**
   - React Context Provider
   - Aplica branding dinámicamente en carga

4. **Logo Storage**
   - S3 / Cloudinary para archivos
   - URLs públicas para logos/favicons

### Stack Tecnológico

**Backend:**
- NestJS + TypeScript
- PostgreSQL (tabla `tenant_branding`)
- S3/Cloudinary SDK para uploads

**Frontend:**
- React Context API
- CSS Variables para theming
- Dynamic `<title>` y `<link rel="icon">`

---

## 👥 User Stories

| ID | Historia | Esfuerzo | Prioridad |
|----|----------|----------|-----------|
| [US-WL-001](./historias/US-WL-001-branding-config.md) | Tenant Branding Configuration | 8h | P1 |
| [US-WL-002](./historias/US-WL-002-logo-colors.md) | Logo and Colors Upload | 6h | P1 |
| [US-WL-003](./historias/US-WL-003-platform-name.md) | Platform Name Customization | 6h | P2 |

**Total:** 20 horas ($3,000 USD)

---

## 🗄️ Modelo de Datos

### Schema: `system_configuration`

```sql
CREATE TABLE system_configuration.tenant_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES auth_management.tenants(id),

  -- Tier 1 (Básico) - 20h
  platform_name VARCHAR(100) DEFAULT 'GAMILIT Platform',
  logo_url TEXT, -- S3/Cloudinary URL
  favicon_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
  secondary_color VARCHAR(7) DEFAULT '#10B981',

  -- Tier 2 (Avanzado) - 40h adicionales (v2.0+)
  custom_domain VARCHAR(255), -- e.g., portal.universidad.edu
  email_from_name VARCHAR(100),
  login_page_background_url TEXT,

  -- Tier 3 (Completo) - 60h adicionales (v2.0+)
  custom_font_url TEXT,
  custom_css TEXT,
  hide_glit_branding BOOLEAN DEFAULT false,

  -- Metadata
  tier VARCHAR(20) DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenant_branding_tenant ON system_configuration.tenant_branding(tenant_id);
CREATE INDEX idx_tenant_branding_domain ON system_configuration.tenant_branding(custom_domain);
```

---

## 🔗 Dependencias

### Bloqueado por
- Multi-tenant architecture funcionando
- S3/Cloudinary configurado para file uploads

### Bloquea
- Tier 2 white-label (v2.0+)
- Enterprise onboarding (requiere white-label)

---

## 🚀 Plan de Implementación

### Sprint 25 (Semana 25) - 12h
- **US-WL-001:** Tenant Branding Configuration backend (8h)
- **US-WL-002:** Logo upload (4h)

### Sprint 26 (Semana 26) - 8h
- **US-WL-002:** Colors UI (2h)
- **US-WL-003:** Platform Name Customization (6h)

---

## 🧪 Testing

### Test Cases Críticos
1. **Multi-tenant Isolation:**
   - Tenant A config no afecta Tenant B
   - Logo Tenant A no visible para Tenant B

2. **CSS Variables:**
   - Primary color aplicado en botones, links
   - Secondary color en highlights, badges

3. **Dynamic Updates:**
   - Admin cambia logo → refleja sin reload
   - Color change → CSS variables actualizadas

---

## 📊 KPIs

### Post-Lanzamiento (3 meses)
- **Adoption:** >10 instituciones usando white-label
- **Upgrade to Pro:** >5 instituciones
- **ARR:** +$12,000

---

## 📚 Referencias

### Documentación Interna
- [ANALISIS-FEATURES-P3-ESTRATEGICAS.md](../features/ANALISIS-FEATURES-P3-ESTRATEGICAS.md) - Sección White-label
- [FEATURES-PENDIENTES.md](../features/FEATURES-PENDIENTES.md) - F-P2-020

---

**Creado:** 2025-11-07
**Responsable:** Full-stack Team
