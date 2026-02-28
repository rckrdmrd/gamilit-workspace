---
title: Branding e Identidad Institucional
category: admin
id: FL-ADM-20
version: 1.0.0
last_updated: 2026-02-27
---

# FL-ADM-20 - Branding e Identidad Institucional

**ID:** FL-ADM-20
**Version:** 1.0.0
**Fecha:** 2026-02-27
**Estado:** Activo
**Portal:** Admin
**Prioridad:** P2

---

## 1. Resumen

Flujo de la pagina `/admin/settings/branding` donde el super_admin personaliza la identidad visual de la plataforma para el tenant (sistema White Label - EXT-008). Permite: cargar logo (PNG/JPG/WEBP/GIF, max 5MB), cargar favicon (PNG/ICO/JPG, max 1MB), personalizar colores (primario, secundario, acento) con selectores y presets, y cambiar el nombre de la plataforma. La pagina muestra una vista previa en tiempo real de los cambios antes de guardar. Los cambios son persistidos por `BrandingController` y afectan inmediatamente la apariencia del sistema via `BrandingProvider`. Las CSS variables se generan automaticamente y son cargadas como stylesheet por la aplicacion.

---

## 2. Precondiciones

- Usuario autenticado con rol `super_admin`.
- Sesion activa con JWT valido.
- Tenant configurado con ID valido.
- Permisos de escritura en el sistema de almacenamiento para logos y favicons.

---

## 3. Diagrama Mermaid

```mermaid
flowchart TD
    A[Admin navega a /admin/settings/branding] --> B[BrandingSettingsPage monta]
    B --> C[useAuth -> obtiene tenantId]
    B --> D[useBranding -> carga config actual]
    D --> E[GET /tenants/:tenantId/branding]
    E --> F[Renderizar formulario con valores actuales]

    F --> G[ThemePreview muestra preview en tiempo real]

    F --> H{Acciones del admin?}

    H -- Cambiar nombre plataforma --> I[React Hook Form actualiza platformName]
    I --> G

    H -- Cambiar colores --> J[ColorPicker actualiza primaryColor/secondaryColor/accentColor]
    J --> G

    H -- Subir logo --> K[LogoUploader -> selecciona archivo]
    K --> L[POST /tenants/:tenantId/branding/logo multipart/form-data]
    L --> M{Validacion archivo?}
    M -- Error tipo/tamanio --> N[Toast error: formato invalido]
    M -- OK --> O[URL del logo guardada]
    O --> G

    H -- Subir favicon --> P[FaviconUploader -> selecciona archivo]
    P --> Q[POST /tenants/:tenantId/branding/favicon multipart/form-data]
    Q --> R[URL del favicon guardada]

    H -- Guardar configuracion --> S[handleSubmit React Hook Form]
    S --> T[PATCH /tenants/:tenantId/branding { platformName, primaryColor, ... }]
    T --> U{Exito?}
    U -- Si --> V[Toast exito + BrandingProvider.refreshBranding()]
    U -- Error --> W[Toast error]

    H -- Resetear cambios --> X[reset() React Hook Form a valores originales]

    H -- Eliminar assets --> Y[DELETE /tenants/:tenantId/branding/assets?type=logo]
    Y --> Z[Asset eliminado, preview actualizado]
```

---

## 4. Secuencia FE -> BE -> DB

```
=== Carga configuracion actual ===
1. FE: BrandingSettingsPage monta -> useAuth().user.tenant_id
2. FE: GET /api/v1/tenants/:tenantId/branding
3. BE: BrandingController.getBranding(tenantId) [endpoint publico, sin auth requerida]
4. BE: BrandingService.getBrandingConfig(tenantId)
5. DB: SELECT FROM tenant_branding WHERE tenant_id = :tenantId
6. BE: Retorna BrandingConfigDto { platformName, logoUrl, faviconUrl,
        primaryColor, secondaryColor, accentColor, customCss }
7. FE: React Hook Form.reset() con valores actuales

=== Subir logo ===
8. FE: Admin selecciona archivo PNG/JPG/WEBP/GIF
9. FE: Validacion frontend: tipo MIME + tamanio <= 5MB
10. FE: POST /api/v1/tenants/:tenantId/branding/logo (multipart/form-data, field: 'file')
11. BE: BrandingController.uploadLogo(tenantId, file)
12. BE: BrandingService.uploadLogo() -> valida formato + tamanio
13. BE: Procesa imagen a multiples tamanios (thumbnail, normal, retina)
14. BE: Guarda en sistema de archivos o storage
15. DB: UPDATE tenant_branding SET logo_url = :url WHERE tenant_id = :tenantId
16. BE: Retorna { url: 'https://...', message: 'Logo uploaded successfully' }
17. FE: ThemePreview actualiza imagen del logo

=== Actualizar configuracion de colores y nombre ===
18. FE: Admin modifica campos y click "Guardar"
19. FE: PATCH /api/v1/tenants/:tenantId/branding
        { platformName: '...', primaryColor: '#...', secondaryColor: '#...', accentColor: '#...' }
20. BE: BrandingController.updateBranding(tenantId, updateDto)
21. BE: BrandingService.updateBrandingConfig(tenantId, dto)
22. DB: UPDATE tenant_branding SET platform_name = :name, primary_color = :color, ...
23. BE: Retorna BrandingConfigDto actualizado
24. FE: useBranding.refreshBranding() -> recarga CSS variables
25. FE: GET /api/v1/tenants/:tenantId/branding/css
26. BE: BrandingService.generateCssVariables(config) -> genera :root { --primary: #...; }
27. FE: CSS variables actualizadas -> la UI cambia de color en tiempo real

=== Eliminar asset ===
28. FE: Admin click "Eliminar logo" -> DELETE /api/v1/tenants/:tenantId/branding/assets?type=logo
29. BE: BrandingController.deleteAssets(tenantId, 'logo')
30. BE: BrandingService.deleteAsset() -> elimina archivo + limpia URL en BD
31. DB: UPDATE tenant_branding SET logo_url = NULL WHERE tenant_id = :tenantId
32. FE: Preview muestra placeholder de logo
```

---

## 5. Componentes y artefactos implicados

### Frontend

| Tipo | Archivo |
|------|---------|
| Pagina | `apps/frontend/src/features/admin/branding/BrandingSettingsPage.tsx` |
| Componente color | `apps/frontend/src/features/admin/branding/components/ColorPicker.tsx` |
| Componente logo | `apps/frontend/src/features/admin/branding/components/LogoUploader.tsx` |
| Componente favicon | `apps/frontend/src/features/admin/branding/components/FaviconUploader.tsx` |
| Componente preview | `apps/frontend/src/features/admin/branding/components/ThemePreview.tsx` |
| API branding | `apps/frontend/src/services/api/branding/brandingAPI.ts` |
| Provider | `apps/frontend/src/app/providers/BrandingProvider.tsx` |
| Layout | `apps/frontend/src/apps/admin/layouts/AdminLayout.tsx` |

### Backend

| Tipo | Archivo |
|------|---------|
| Controller | `apps/backend/src/modules/admin/controllers/branding.controller.ts` |
| Service | `apps/backend/src/modules/admin/services/branding.service.ts` |
| DTO branding config | `apps/backend/src/modules/admin/dto/branding/branding-config.dto.ts` |
| DTO update branding | `apps/backend/src/modules/admin/dto/branding/update-branding.dto.ts` |

---

## 6. Reglas y validaciones

| Regla | Capa | Descripcion |
|-------|------|-------------|
| GET branding es publico | BE | Sin auth para carga inicial de paginas |
| PATCH/POST/DELETE requieren admin | BE | JwtAuthGuard + AdminGuard |
| Logo: max 5MB | BE | FileInterceptor + validacion en BrandingService |
| Logo: formatos PNG/JPG/WEBP/GIF | BE | Validacion MIME type |
| Favicon: max 1MB | BE | Validacion tamanio |
| Favicon: formatos PNG/ICO/JPG | BE | Validacion MIME type |
| CSS variables cacheadas 1h | BE | Cache-Control: public, max-age=3600 |
| Colores: formato hex valido | FE | Validacion en ColorPicker |

---

## 7. Manejo de errores

| Escenario | Capa | Codigo HTTP | Comportamiento |
|-----------|------|-------------|----------------|
| Token JWT expirado | BE | 401 | Redirige a login |
| Rol insuficiente | BE | 403 | ForbiddenException |
| Tenant no encontrado | BE | 404 | NotFoundException |
| Archivo muy grande | BE | 400 | "File too large" |
| Formato invalido | BE | 400 | "Invalid file format" |
| Error al guardar config | BE | 500 | Toast error en FE |
| Error al subir logo | FE | N/A | Toast error, preview no cambia |

---

## 8. Trazabilidad cruzada

| Capa | Archivo | Evidencia |
|------|---------|-----------|
| Frontend Pagina | `apps/frontend/src/features/admin/branding/BrandingSettingsPage.tsx` | EXT-008 White Label |
| Frontend Provider | `apps/frontend/src/app/providers/BrandingProvider.tsx` | CSS variables en tiempo real |
| Backend Controller | `apps/backend/src/modules/admin/controllers/branding.controller.ts` | 6 endpoints branding |
| Backend Service | `apps/backend/src/modules/admin/services/branding.service.ts` | Logica de branding |

---

## 9. Referencias

- Flujo configuracion sistema: [FL-ADM-12](./FLUJO-CONFIGURACION-AJUSTES.md)
- Flujo instituciones: [FL-ADM-10](./FLUJO-INSTITUCIONES-ROLES.md)
- ADR-050 Responsive: `docs/90-adr/ADR-050-responsive-design.md`
