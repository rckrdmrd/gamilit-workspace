---
title: Administracion Avanzada - Feature Flags
category: admin
id: FL-ADM-21
version: 1.0.0
last_updated: 2026-02-27
---

# FL-ADM-21 - Administracion Avanzada - Feature Flags

**ID:** FL-ADM-21
**Version:** 1.0.0
**Fecha:** 2026-02-27
**Estado:** Activo
**Portal:** Admin
**Prioridad:** P3

---

## 1. Resumen

Flujo de la pagina `/admin/advanced` donde el super_admin gestiona feature flags y experimenta con A/B testing. La pagina implementa el panel de Feature Flags (habilitado) y un dashboard basico de A/B Testing (beta). Los feature flags controlan la activacion de funcionalidades en la plataforma, incluyendo los modulos condicionales (ETL, ML, Visualization via `ENABLE_DATA_WAREHOUSE`). El admin puede crear, editar, habilitar/deshabilitar y eliminar flags, asi como configurar el porcentaje de rollout para despliegues graduales. La pagina esta marcada como beta y actualmente oculta del menu de navegacion principal del sidebar, aunque la ruta permanece activa.

---

## 2. Precondiciones

- Usuario autenticado con rol `super_admin`.
- Sesion activa con JWT valido.
- La ruta esta accesible pero oculta del menu principal del sidebar.

---

## 3. Diagrama Mermaid

```mermaid
flowchart TD
    A[Admin navega a /admin/advanced] --> B[AdminAdvancedPage monta]
    B --> C[FeatureFlagsPanel carga]
    B --> D[ABTestingDashboard carga]

    C --> E[GET /admin/feature-flags]
    E --> F[Lista de feature flags con estado actual]

    F --> G{Filtros?}
    G -- Por estado --> H[GET /admin/feature-flags?enabled=true/false]
    G -- Por categoria --> I[GET /admin/feature-flags?category=...]

    F --> J{Acciones sobre flag?}
    J -- Toggle enable/disable --> K{Estado actual?}
    K -- enabled --> L[POST /admin/feature-flags/:key/disable]
    K -- disabled --> M[POST /admin/feature-flags/:key/enable]
    L --> N[Flag deshabilitado globalmente]
    M --> O[Flag habilitado globalmente]

    J -- Ver detalle --> P[GET /admin/feature-flags/:key]
    P --> Q[Modal con config completa del flag]

    J -- Editar rollout --> R[PUT /admin/feature-flags/:key/rollout { percentage: N }]
    R --> S[Rollout actualizado: N% de usuarios ve la feature]

    J -- Editar flag --> T[PUT /admin/feature-flags/:key { name, description, enabled, rollout }]
    T --> U[Flag actualizado]

    J -- Eliminar --> V[DELETE /admin/feature-flags/:key]
    V --> W[Flag removido permanentemente]

    F --> X{Crear nuevo flag?}
    X -- Si --> Y[POST /admin/feature-flags { key, name, description, enabled, rolloutPercentage, category }]
    Y --> Z{Key duplicado?}
    Z -- Si --> AA[409: Feature flag with this key already exists]
    Z -- No --> AB[Flag creado]

    J -- Verificar si habilitado para usuario --> AC[POST /admin/feature-flags/:key/check { userId }]
    AC --> AD[Retorna { enabled: bool, reason: '...' }]
```

---

## 4. Secuencia FE -> BE -> DB

```
=== Carga de feature flags ===
1. FE: AdminAdvancedPage monta -> FeatureFlagsPanel
2. FE: GET /api/v1/admin/feature-flags
3. BE: FeatureFlagsController.findAll(query)
4. BE: FeatureFlagsService.findAll(query) -> lista todos los flags con filtros opcionales
5. DB: SELECT FROM admin_dashboard.feature_flags (o tabla dedicada)
        WHERE [enabled=:bool] [AND category=:cat]
6. BE: Retorna FeatureFlag[] { key, name, description, enabled, rolloutPercentage,
        category, createdAt, updatedAt, createdBy }
7. FE: FeatureFlagsPanel renderiza lista con toggles

=== Habilitar/deshabilitar flag ===
8. FE: Admin toggle -> determina estado actual
9a. Si habilitado: POST /api/v1/admin/feature-flags/:key/disable
9b. Si deshabilitado: POST /api/v1/admin/feature-flags/:key/enable
10. BE: FeatureFlagsService.enable(key, adminId) / .disable(key, adminId)
11. DB: UPDATE feature_flags SET enabled = :bool, updated_by = :adminId, updated_at = NOW()
        WHERE key = :key
12. BE: Retorna FeatureFlag actualizado
13. FE: Toggle actualizado visualmente

=== Actualizar rollout percentage ===
14. FE: Admin modifica slider/input de porcentaje -> PUT /api/v1/admin/feature-flags/:key/rollout
        { percentage: 50 }
15. BE: FeatureFlagsService.updateRollout(key, percentage, adminId)
16. DB: UPDATE feature_flags SET rollout_percentage = :percentage WHERE key = :key
17. BE: Retorna flag actualizado
18. FE: Indicador de rollout actualizado (ej: "50% de usuarios")

=== Crear nuevo feature flag ===
19. FE: Admin completa formulario -> POST /api/v1/admin/feature-flags
        { key: 'ENABLE_NEW_FEATURE', name: '...', description: '...', enabled: false,
          rolloutPercentage: 0, category: 'experimental' }
20. BE: FeatureFlagsController.create(dto, req)
21. BE: FeatureFlagsService.create(dto, adminId)
22. BE: Verifica key unico -> si duplicado lanza ConflictException
23. DB: INSERT INTO feature_flags (key, name, description, enabled, rollout_percentage,
        category, created_by, created_at)
24. BE: Retorna FeatureFlag creado
25. FE: Nueva flag aparece en lista

=== Verificar flag para usuario especifico ===
26. FE: POST /api/v1/admin/feature-flags/:key/check { userId: 'uuid' }
27. BE: FeatureFlagsService.isEnabled(key, userId)
28. BE: Evalua: enabled global + rollout percentage + whitelist de userId si existe
29. BE: Retorna FeatureFlagCheckResultDto { enabled: bool, reason: 'globally_enabled' | 'rollout' | 'disabled' }
30. FE: Muestra resultado de evaluacion para ese usuario

=== Eliminar feature flag ===
31. FE: Admin confirma eliminacion -> DELETE /api/v1/admin/feature-flags/:key
32. BE: FeatureFlagsService.remove(key)
33. DB: DELETE FROM feature_flags WHERE key = :key
34. BE: 200 OK (void)
35. FE: Flag removido de la lista
```

---

## 5. Componentes y artefactos implicados

### Frontend

| Tipo | Archivo |
|------|---------|
| Pagina | `apps/frontend/src/apps/admin/pages/AdminAdvancedPage.tsx` |
| Panel feature flags | `apps/frontend/src/apps/admin/components/advanced/FeatureFlagsPanel.tsx` |
| Dashboard A/B | `apps/frontend/src/apps/admin/components/advanced/ABTestingDashboard.tsx` |
| Layout | `apps/frontend/src/apps/admin/components/shared/AdminPageShell.tsx` |

### Backend

| Tipo | Archivo |
|------|---------|
| Controller | `apps/backend/src/modules/admin/controllers/feature-flags.controller.ts` |
| Service | `apps/backend/src/modules/admin/services/feature-flags.service.ts` |
| Entity | `apps/backend/src/modules/admin/entities/feature-flag.entity.ts` |
| DTOs | `apps/backend/src/modules/admin/dto/feature-flags/` |

---

## 6. Reglas y validaciones

| Regla | Capa | Descripcion |
|-------|------|-------------|
| Solo super_admin | BE | JwtAuthGuard + AdminGuard |
| Key unico | BE | ConflictException si key duplicado |
| Rollout 0-100 | BE | Validacion de rango en DTO |
| Auditoria de cambios | BE | created_by, updated_by registran adminId |
| Enable/Disable no eliminan | BE | Solo cambian estado, preservan historial |
| Pagina oculta del menu | FE | GamilitSidebar.tsx no incluye la ruta |

---

## 7. Manejo de errores

| Escenario | Capa | Codigo HTTP | Comportamiento |
|-----------|------|-------------|----------------|
| Token JWT expirado | BE | 401 | Redirige a login |
| Rol insuficiente | BE | 403 | ForbiddenException |
| Flag no encontrado | BE | 404 | NotFoundException |
| Key duplicado al crear | BE | 409 | ConflictException |
| Rollout fuera de rango | BE | 400 | BadRequestException |
| Error al eliminar | BE | 500 | Toast error en FE |

---

## 8. Trazabilidad cruzada

| Capa | Archivo | Evidencia |
|------|---------|-----------|
| Frontend Pagina | `apps/frontend/src/apps/admin/pages/AdminAdvancedPage.tsx` | Panel Feature Flags + A/B Testing |
| Frontend Componente | `apps/frontend/src/apps/admin/components/advanced/FeatureFlagsPanel.tsx` | CRUD de feature flags |
| Backend Controller | `apps/backend/src/modules/admin/controllers/feature-flags.controller.ts` | 10 endpoints feature flags |
| Backend Service | `apps/backend/src/modules/admin/services/feature-flags.service.ts` | Logica evaluacion flags |
| Backend Entity | `apps/backend/src/modules/admin/entities/feature-flag.entity.ts` | Entidad FeatureFlag |

---

## 9. Referencias

- Flujo configuracion sistema: [FL-ADM-12](./FLUJO-CONFIGURACION-AJUSTES.md)
- Flujo monitoreo sistema: [FL-ADM-04](./FLUJO-MONITOREO-SISTEMA.md)
- Feature flag ENABLE_DATA_WAREHOUSE: controla carga condicional de modulos ETL/ML/Viz
