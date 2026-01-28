# EXT-008 White Label - Implementation Checklist

**Epic:** EXT-008 - White Label System (Tier 1)
**Version:** 1.0
**Fecha:** 2026-01-27
**Estado:** 50% Implementado
**Estimacion Total Restante:** 80 horas

---

## Resumen Ejecutivo

El sistema White Label Tier 1 permite a tenants personalizar:
- Logo y favicon
- Colores primarios y secundarios
- Nombre de plataforma

**Progreso actual:** 50% (infraestructura base completa, features faltantes)

---

## Estado por Especificacion Tecnica

| ET | Titulo | Completitud | Horas Restantes |
|----|--------|-------------|-----------------|
| [ET-WL-001](./especificaciones/ET-WL-001-theming.md) | Theming System | 55% | 26h |
| [ET-WL-002](./especificaciones/ET-WL-002-tenant-customization.md) | Tenant Customization | 45% | 22h |
| [ET-WL-003](./especificaciones/ET-WL-003-asset-management.md) | Asset Management | 35% | 17h |
| [ET-WL-004](./especificaciones/ET-WL-004-css-runtime-variables.md) | CSS Runtime Variables | 50% | 15h |

**Total:** 80 horas restantes

---

## Componentes Implementados (Completos)

### Backend

| Componente | Ubicacion | Estado |
|------------|-----------|--------|
| Tenant Entity | `apps/backend/src/modules/auth/entities/tenant.entity.ts` | COMPLETO |
| TenantConfiguration Entity | `apps/backend/src/modules/admin/entities/tenant-configuration.entity.ts` | COMPLETO |
| MediaStorageService (base) | `apps/backend/src/modules/educational/services/media-storage.service.ts` | COMPLETO |
| StorageService (base) | `apps/backend/src/modules/teacher/services/storage.service.ts` | COMPLETO |
| SubscriptionTierEnum | `apps/backend/src/shared/constants/enums.constants.ts` | COMPLETO |

### Frontend

| Componente | Ubicacion | Estado |
|------------|-----------|--------|
| CSS Variables (:root) | `apps/frontend/src/shared/styles/index.css` | COMPLETO |
| Detective Theme CSS | `apps/frontend/src/shared/styles/detective-theme.css` | COMPLETO |
| theme-light.ts | `apps/frontend/src/shared/themes/theme-light.ts` | COMPLETO |
| theme-dark.ts | `apps/frontend/src/shared/themes/theme-dark.ts` | COMPLETO |

### Database

| Componente | Ubicacion | Estado |
|------------|-----------|--------|
| tenants table | `apps/database/ddl/schemas/auth_management/tables/01-tenants.sql` | COMPLETO |
| tenant_configurations table | `apps/database/ddl/schemas/system_configuration/tables/tenant_configurations.sql` | COMPLETO |

---

## Componentes Faltantes (Por Implementar)

### Backend - Alta Prioridad

#### 1. BrandingModule

```
apps/backend/src/modules/branding/
├── branding.module.ts
├── controllers/
│   └── branding.controller.ts
├── services/
│   ├── branding.service.ts
│   └── branding-asset.service.ts
└── dto/
    ├── branding-response.dto.ts
    ├── update-branding.dto.ts
    └── upload-logo.dto.ts
```

#### 2. ImageProcessingService

```
apps/backend/src/shared/services/
└── image-processing.service.ts
```

### Frontend - Alta Prioridad

#### 3. BrandingProvider & Hook

```
apps/frontend/src/providers/
└── BrandingProvider.tsx

apps/frontend/src/hooks/
├── useBranding.ts
└── useFavicon.ts
```

#### 4. Admin Branding Components

```
apps/frontend/src/features/admin/branding/
├── BrandingSettingsPage.tsx
├── components/
│   ├── ColorPicker.tsx
│   ├── LogoUploader.tsx
│   ├── FaviconUploader.tsx
│   └── BrandingPreview.tsx
└── services/
    └── branding.service.ts
```

---

## Checklist de Tareas con CAPVED

### FASE 1: Backend - BrandingModule (26h)

#### TASK-WL-001: BrandingController (8h)

**C - Contexto:**
- Necesitamos endpoints para CRUD de configuracion de branding
- Endpoints publicos y privados (admin)

**A - Analisis:**
- Archivos existentes: TenantConfiguration entity
- Dependencias: AuthModule, AdminModule
- Riesgo: Bajo

**P - Plan:**
1. Crear modulo `branding.module.ts`
2. Crear DTOs de request/response
3. Implementar endpoints:
   - `GET /branding/:tenantId` (public)
   - `GET /branding/domain/:domain` (public)
   - `PATCH /branding/:tenantId` (admin)
4. Agregar tests unitarios

**V - Verificacion:**
```bash
cd apps/backend && npm run build && npm run test branding
```

**E - Ejecucion:**
- [ ] Crear `branding.module.ts`
- [ ] Crear `branding-response.dto.ts`
- [ ] Crear `update-branding.dto.ts`
- [ ] Crear `branding.controller.ts`
- [ ] Agregar rutas en Swagger
- [ ] Escribir tests

**D - Documentacion:**
- Actualizar API docs
- Agregar ejemplos en Swagger

---

#### TASK-WL-002: BrandingService (6h)

**C - Contexto:**
- Servicio para logica de negocio de branding

**A - Analisis:**
- Usa TenantConfiguration repository
- Necesita cache para performance

**P - Plan:**
1. Crear servicio con inyeccion de repositorio
2. Implementar metodos CRUD
3. Agregar validacion de colores hex
4. Implementar cache (Redis o in-memory)

**V - Verificacion:**
```bash
npm run test branding.service
```

**E - Ejecucion:**
- [ ] Crear `branding.service.ts`
- [ ] Implementar `getBranding(tenantId)`
- [ ] Implementar `getBrandingByDomain(domain)`
- [ ] Implementar `updateBranding(tenantId, dto)`
- [ ] Implementar `validateColor(color)`
- [ ] Agregar cache layer
- [ ] Escribir tests

---

#### TASK-WL-003: BrandingAssetService - Logo/Favicon Upload (8h)

**C - Contexto:**
- Subir y procesar imagenes de logo y favicon por tenant

**A - Analisis:**
- Reutilizar MediaStorageService como base
- Necesita procesamiento de imagen (sharp)
- Estructura: `uploads/branding/{tenantId}/`

**P - Plan:**
1. Instalar sharp para procesamiento
2. Crear servicio con upload/delete
3. Implementar resize y optimizacion
4. Crear endpoints POST/DELETE

**V - Verificacion:**
```bash
npm run test branding-asset
# Test manual: subir imagen PNG de 5MB, verificar resize
```

**E - Ejecucion:**
- [ ] `npm install sharp @types/sharp`
- [ ] Crear `branding-asset.service.ts`
- [ ] Implementar `uploadLogo(tenantId, file)`
- [ ] Implementar `uploadFavicon(tenantId, file)`
- [ ] Implementar `deleteAsset(tenantId, type)`
- [ ] Implementar image processing (resize, optimize)
- [ ] Agregar endpoints en controller
- [ ] Escribir tests

---

#### TASK-WL-004: ImageProcessingService (4h)

**C - Contexto:**
- Servicio reutilizable para procesar imagenes

**A - Analisis:**
- Usar sharp (ya necesario para logos)
- Operaciones: resize, optimize, convert

**P - Plan:**
1. Crear servicio generico
2. Exponer metodos de procesamiento
3. Manejar formatos: PNG, JPG, SVG

**E - Ejecucion:**
- [ ] Crear `image-processing.service.ts`
- [ ] Implementar `resize(buffer, width, height)`
- [ ] Implementar `optimize(buffer, format)`
- [ ] Implementar `generateVersions(buffer, sizes)`
- [ ] Escribir tests

---

### FASE 2: Frontend - Providers & Hooks (15h)

#### TASK-WL-005: BrandingProvider (4h)

**C - Contexto:**
- Context provider para branding en toda la app

**A - Analisis:**
- Similar a AuthProvider existente
- Necesita cargar branding al init
- Aplicar CSS variables dinamicamente

**P - Plan:**
1. Crear provider con context
2. Hook `useBranding()`
3. Funcion `applyBranding()` para CSS vars

**V - Verificacion:**
```bash
npm run typecheck
npm run test BrandingProvider
```

**E - Ejecucion:**
- [ ] Crear `BrandingProvider.tsx`
- [ ] Crear `useBranding.ts` hook
- [ ] Implementar `applyBranding(config)`
- [ ] Integrar en App.tsx
- [ ] Escribir tests

---

#### TASK-WL-006: Branding Service Frontend (2h)

**C - Contexto:**
- Cliente HTTP para endpoints de branding

**A - Analisis:**
- Usar apiClient existente
- Tipado con BrandingConfig

**E - Ejecucion:**
- [ ] Crear `branding.service.ts` en frontend
- [ ] Implementar `getBranding(tenantId)`
- [ ] Implementar `updateBranding(tenantId, data)`
- [ ] Implementar `uploadLogo(tenantId, file)`
- [ ] Implementar `uploadFavicon(tenantId, file)`

---

#### TASK-WL-007: Color Utilities (2h)

**C - Contexto:**
- Utilidades para validar y manipular colores

**E - Ejecucion:**
- [ ] Crear `color.utils.ts`
- [ ] Implementar `isValidHexColor(color)`
- [ ] Implementar `hexToRgb(hex)`
- [ ] Implementar `getLuminance(hex)`
- [ ] Implementar `getContrastTextColor(bg)`
- [ ] Escribir tests

---

#### TASK-WL-008: useFavicon Hook (1h)

**C - Contexto:**
- Hook para cambiar favicon dinamicamente

**E - Ejecucion:**
- [ ] Crear `useFavicon.ts`
- [ ] Implementar cambio de favicon via DOM
- [ ] Integrar en BrandingProvider

---

#### TASK-WL-009: CSS Variables Migration (3h)

**C - Contexto:**
- Migrar colores hardcodeados a CSS variables

**A - Analisis:**
- Revisar detective-theme.css
- Identificar todos los hex literals
- Reemplazar por var(--brand-*)

**E - Ejecucion:**
- [ ] Auditar `detective-theme.css` por hardcoded colors
- [ ] Crear nuevas variables `--brand-primary`, `--brand-secondary`
- [ ] Migrar `.btn-detective` y otros componentes
- [ ] Migrar `.progress-detective`
- [ ] Verificar sin regresiones visuales

---

#### TASK-WL-010: Dark Mode + Branding (3h)

**C - Contexto:**
- Asegurar que branding funciona con dark mode

**E - Ejecucion:**
- [ ] Definir comportamiento de brand colors en dark mode
- [ ] Actualizar CSS variables para `.dark`
- [ ] Testear combinaciones light/dark + brand colors

---

### FASE 3: Frontend - Admin UI (22h)

#### TASK-WL-011: BrandingSettingsPage (6h)

**C - Contexto:**
- Pagina completa de configuracion de branding

**A - Analisis:**
- Ruta: `/admin/settings/branding`
- Usar componentes existentes + nuevos

**E - Ejecucion:**
- [ ] Crear `BrandingSettingsPage.tsx`
- [ ] Layout: Logo section, Colors section, Preview
- [ ] Integrar LogoUploader
- [ ] Integrar FaviconUploader
- [ ] Integrar ColorPicker
- [ ] Agregar BrandingPreview
- [ ] Botones guardar/cancelar
- [ ] Manejo de errores
- [ ] Loading states

---

#### TASK-WL-012: ColorPicker Component (3h)

**C - Contexto:**
- Selector de color con preview

**A - Analisis:**
- Usar react-colorful (ligero)
- Input manual + picker visual

**E - Ejecucion:**
- [ ] `npm install react-colorful`
- [ ] Crear `ColorPicker.tsx`
- [ ] Picker visual con HexColorPicker
- [ ] Input manual con HexColorInput
- [ ] Colores preset sugeridos
- [ ] Validacion de input

---

#### TASK-WL-013: LogoUploader Component (4h)

**C - Contexto:**
- Componente para subir logo con drag & drop

**A - Analisis:**
- Usar react-dropzone o similar
- Preview antes de confirmar
- Validacion de formato y tamano

**E - Ejecucion:**
- [ ] Crear `LogoUploader.tsx`
- [ ] Drag & drop zone
- [ ] Click to select
- [ ] Preview de imagen
- [ ] Validacion cliente (format, size)
- [ ] Progress bar durante upload
- [ ] Error handling

---

#### TASK-WL-014: FaviconUploader Component (3h)

**C - Contexto:**
- Similar a LogoUploader pero para favicon

**E - Ejecucion:**
- [ ] Crear `FaviconUploader.tsx`
- [ ] Validacion especifica (ICO, PNG 32x32)
- [ ] Preview pequeno
- [ ] Upload con progress

---

#### TASK-WL-015: BrandingPreview Component (4h)

**C - Contexto:**
- Preview en tiempo real de cambios de branding

**A - Analisis:**
- Mockup de la UI con colores seleccionados
- Logo en navbar simulado
- Botones con colores

**E - Ejecucion:**
- [ ] Crear `BrandingPreview.tsx`
- [ ] Mini navbar con logo
- [ ] Botones de ejemplo con colores
- [ ] Cards de ejemplo
- [ ] Actualizacion en tiempo real

---

#### TASK-WL-016: Platform Name Editor (2h)

**C - Contexto:**
- Input para cambiar nombre de plataforma

**E - Ejecucion:**
- [ ] Crear `PlatformNameEditor.tsx`
- [ ] Input con validacion (max 100 chars)
- [ ] Preview en title simulado
- [ ] Auto-save o save button

---

### FASE 4: Testing & Polish (12h)

#### TASK-WL-017: Unit Tests Backend (4h)

**E - Ejecucion:**
- [ ] Tests para BrandingService
- [ ] Tests para BrandingController
- [ ] Tests para BrandingAssetService
- [ ] Tests para ImageProcessingService
- [ ] Coverage > 80%

---

#### TASK-WL-018: Unit Tests Frontend (4h)

**E - Ejecucion:**
- [ ] Tests para BrandingProvider
- [ ] Tests para useBranding hook
- [ ] Tests para ColorPicker
- [ ] Tests para LogoUploader
- [ ] Tests para color utilities

---

#### TASK-WL-019: E2E Tests (2h)

**E - Ejecucion:**
- [ ] Test: Admin cambia logo -> visible en navbar
- [ ] Test: Admin cambia colores -> UI actualizada
- [ ] Test: Multi-tenant isolation

---

#### TASK-WL-020: Documentation & Polish (2h)

**E - Ejecucion:**
- [ ] Actualizar README con feature
- [ ] Documentar API en Swagger
- [ ] Actualizar _MAP.md del epic
- [ ] Screenshots para docs

---

## Dependencias Entre Tareas

```
TASK-WL-001 (Controller) ─┬─→ TASK-WL-002 (Service)
                          │
                          └─→ TASK-WL-003 (AssetService) ─→ TASK-WL-004 (ImageProc)
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │ Backend Completado    │
                          └───────────────────────┘
                                      │
                                      ▼
TASK-WL-005 (Provider) ─┬─→ TASK-WL-006 (Service FE)
                        │
                        ├─→ TASK-WL-007 (Color Utils)
                        │
                        └─→ TASK-WL-008 (Favicon Hook)
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │ Providers Completados │
                          └───────────────────────┘
                                      │
                                      ▼
TASK-WL-011 (Page) ─┬─→ TASK-WL-012 (ColorPicker)
                    │
                    ├─→ TASK-WL-013 (LogoUploader)
                    │
                    ├─→ TASK-WL-014 (FaviconUploader)
                    │
                    └─→ TASK-WL-015 (Preview)
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │ UI Admin Completada   │
                          └───────────────────────┘
                                      │
                                      ▼
                    TASK-WL-017/18/19/20 (Tests & Docs)
```

---

## Timeline Estimado

| Fase | Tareas | Horas | Semana |
|------|--------|-------|--------|
| 1 - Backend | WL-001 a WL-004 | 26h | S1 |
| 2 - Providers | WL-005 a WL-010 | 15h | S2 |
| 3 - Admin UI | WL-011 a WL-016 | 22h | S2-S3 |
| 4 - Testing | WL-017 a WL-020 | 12h | S3 |

**Total:** 75h (~2-3 sprints de 40h)

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Sharp incompatible en Windows | Media | Alto | Usar Docker o alternativa |
| Performance carga branding | Baja | Medio | Implementar cache agresivo |
| CORS en assets | Media | Medio | Configurar headers en backend |
| Contrast accessibility | Media | Medio | Validar WCAG en ColorPicker |

---

## Criterios de Done para el Epic

- [ ] Admin puede subir logo PNG/JPG/SVG
- [ ] Admin puede subir favicon ICO/PNG
- [ ] Admin puede cambiar colores primario/secundario
- [ ] Admin puede cambiar nombre de plataforma
- [ ] Cambios se reflejan en toda la UI sin reload
- [ ] Preview en tiempo real funciona
- [ ] Multi-tenant isolation verificado
- [ ] Tests con coverage > 80%
- [ ] Documentacion actualizada
- [ ] No regresiones en UI existente

---

## Referencias

- [ET-WL-001: Theming](./especificaciones/ET-WL-001-theming.md)
- [ET-WL-002: Tenant Customization](./especificaciones/ET-WL-002-tenant-customization.md)
- [ET-WL-003: Asset Management](./especificaciones/ET-WL-003-asset-management.md)
- [ET-WL-004: CSS Variables](./especificaciones/ET-WL-004-css-runtime-variables.md)
- [US-WL-001: Branding Config](./historias-usuario/US-WL-001-branding-config.md)
- [US-WL-002: Logo Colors](./historias-usuario/US-WL-002-logo-colors.md)
- [US-WL-003: Platform Name](./historias-usuario/US-WL-003-platform-name.md)

---

*Documento: IMPLEMENTATION-CHECKLIST.md*
*Generado: 2026-01-27*
*Sistema: SIMCO v4.0.0 + CAPVED*
