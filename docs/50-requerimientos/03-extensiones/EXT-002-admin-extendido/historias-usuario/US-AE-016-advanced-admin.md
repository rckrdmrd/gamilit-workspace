---
id: "US-AE-016"
title: "Administracion Avanzada del Sistema"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-002"
story_points: 12
budget: "$4,800 MXN"
sprint: "Sprint P2-B"
labels: ["admin-extendido", "feature-flags", "ab-testing", "interventions", "advanced"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
completed_date: "2025-12-05"
---

# US-AE-016: Administracion Avanzada del Sistema

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-016 |
| **Epica** | EXT-002 - Admin Extendido |
| **Titulo** | Administracion Avanzada del Sistema |
| **Prioridad** | Alta (P1) |
| **Story Points** | 12 SP |
| **Estado** | Done |
| **Sprint** | Sprint P2-B |
| **Fecha Implementacion** | 2025-12-05 |

---

## Historia de Usuario

**Como** super admin del sistema GAMILIT
**Quiero** gestionar configuraciones avanzadas del sistema (feature flags, A/B testing, intervenciones estudiantiles)
**Para** controlar el despliegue gradual de funcionalidades, experimentar con mejoras de UX, y monitorear alertas de intervencion para estudiantes en riesgo

---

## Descripcion

AdminAdvancedPage es una pagina de administracion avanzada que consolida herramientas de nivel experto para super administradores. La pagina incluye multiples subsistemas:

1. **Feature Flags Panel** - Gestion completa de feature flags para despliegue gradual de funcionalidades
2. **A/B Testing Dashboard** - Panel para crear, gestionar y analizar experimentos A/B
3. **Gestion de Tenants** - Configuracion multi-tenant (placeholder, coming soon)
4. **Herramientas Economicas** - Ajustes de economia del juego (placeholder, coming soon)

El controlador de intervenciones estudiantiles (`AdminInterventionsController`) proporciona endpoints para gestionar alertas de estudiantes en riesgo, aunque la UI correspondiente aun no esta integrada en esta pagina.

---

## Endpoints API

### Feature Flags Controller (9 endpoints)

**Base Route:** `/admin/feature-flags`
**Guards:** `JwtAuthGuard`, `AdminGuard` (super_admin only)

| Metodo | Endpoint | DTO Entrada | DTO Salida | Descripcion |
|--------|----------|-------------|------------|-------------|
| GET | `/admin/feature-flags` | `FeatureFlagQueryDto` | `FeatureFlag[]` | Lista feature flags con filtros opcionales por status y categoria |
| GET | `/admin/feature-flags/:key` | - | `FeatureFlag` | Obtiene feature flag por key unico |
| POST | `/admin/feature-flags/:key/check` | `CheckFeatureFlagDto` | `FeatureFlagCheckResultDto` | Verifica si feature esta habilitada para usuario/contexto |
| POST | `/admin/feature-flags` | `CreateFeatureFlagDto` | `FeatureFlag` | Crea nueva feature flag con configuracion de rollout |
| PUT | `/admin/feature-flags/:key` | `UpdateFeatureFlagDto` | `FeatureFlag` | Actualiza configuracion de feature flag existente |
| POST | `/admin/feature-flags/:key/enable` | - | `FeatureFlag` | Habilita feature flag globalmente |
| POST | `/admin/feature-flags/:key/disable` | - | `FeatureFlag` | Deshabilita feature flag globalmente |
| PUT | `/admin/feature-flags/:key/rollout` | `{ percentage: number }` | `FeatureFlag` | Actualiza porcentaje de rollout para despliegue gradual |
| DELETE | `/admin/feature-flags/:key` | - | `void` | Elimina feature flag del sistema |

### Interventions Controller (5 endpoints)

**Base Route:** `/admin/interventions`
**Guards:** `JwtAuthGuard`, `AdminGuard` (SUPER_ADMIN o ADMIN_TEACHER)

| Metodo | Endpoint | DTO Entrada | DTO Salida | Descripcion |
|--------|----------|-------------|------------|-------------|
| GET | `/admin/interventions` | `ListInterventionsDto` | `PaginatedInterventionsDto` | Lista alertas con filtros por severidad, status, tipo, estudiante, aula, rango de fechas |
| GET | `/admin/interventions/:id` | - | `InterventionAlertDto` | Obtiene detalle de alerta incluyendo datos de estudiante, aula e historial |
| PATCH | `/admin/interventions/:id/acknowledge` | `AcknowledgeInterventionDto` | `InterventionAlertDto` | Marca alerta como reconocida (admin aware) |
| PATCH | `/admin/interventions/:id/resolve` | `ResolveInterventionDto` | `InterventionAlertDto` | Resuelve alerta con notas obligatorias (min 10 chars) |
| DELETE | `/admin/interventions/:id/dismiss` | - | `InterventionAlertDto` | Descarta alerta (falso positivo o no accionable) |

---

## Criterios de Aceptacion

### AC-1: Panel de Feature Flags

**DADO** que soy super admin autenticado
**CUANDO** accedo a la pagina de Administracion Avanzada
**ENTONCES** veo el panel de Feature Flags con:
- Lista de todos los feature flags del sistema
- Estadisticas: Total, Habilitados, Deshabilitados
- Filtros por estado (All, Enabled, Disabled)
- Busqueda por nombre, key o descripcion
- Toggle rapido para habilitar/deshabilitar cada flag
- Indicador visual de porcentaje de rollout
- Roles target asignados a cada flag

### AC-2: CRUD de Feature Flags

**DADO** que estoy en el panel de Feature Flags
**CUANDO** uso las opciones de gestion
**ENTONCES** puedo:
- Crear nuevo feature flag con: key, nombre, descripcion, estado inicial, rollout %, roles target
- Editar feature flag existente (nombre, descripcion, configuracion)
- Eliminar feature flag con confirmacion
- Toggle rapido que llama al endpoint enable/disable

### AC-3: Dashboard de A/B Testing

**DADO** que soy super admin
**CUANDO** accedo al dashboard de A/B Testing
**ENTONCES** veo:
- Estadisticas: Running, Paused, Completed, Total Users
- Lista de experimentos con estado visual
- Detalles de experimento seleccionado: variantes, traffic split, metricas
- Resultados con: usuarios, conversiones, tasa de conversion, engagement promedio
- Opcion de declarar ganador y finalizar experimento
- Indicador de nivel de confianza estadistica

### AC-4: Control de Experimentos

**DADO** que estoy en el dashboard de A/B Testing
**CUANDO** gestiono un experimento
**ENTONCES** puedo:
- Iniciar experimento (draft -> running)
- Pausar experimento activo
- Reanudar experimento pausado
- Declarar variante ganadora con confirmacion

### AC-5: Gestion de Intervenciones (Backend)

**DADO** que existe el endpoint de intervenciones
**CUANDO** se genera una alerta de estudiante en riesgo
**ENTONCES** el sistema permite:
- Listar alertas filtradas por severidad (low, medium, high, critical)
- Filtrar por status (active, acknowledged, resolved, dismissed)
- Ver detalle de alerta con info de estudiante y aula
- Reconocer alerta (acknowledge) con nota opcional
- Resolver alerta con notas obligatorias (min 10 caracteres)
- Descartar alerta como falso positivo

### AC-6: Placeholders para Funcionalidades Futuras

**DADO** que accedo a la pagina Advanced Admin
**CUANDO** veo las secciones de Gestion de Tenants y Herramientas Economicas
**ENTONCES** veo cards con badges "Under Construction" y "Coming Soon" respectivamente

---

## Especificacion Tecnica

### Frontend

**Pagina:** `AdminAdvancedPage.tsx`
**Ubicacion:** `apps/frontend/src/apps/admin/pages/`

**Componentes:**
- `FeatureFlagsPanel` - Panel principal de feature flags con lista, filtros y estadisticas
- `FeatureFlagEditor` - Modal para crear/editar feature flags
- `RolloutSlider` - Slider para configurar porcentaje de rollout
- `TargetingConfig` - Configuracion de roles target
- `FeatureFlagControls` - Controles de toggle y acciones
- `ABTestingDashboard` - Dashboard completo de A/B testing con lista y detalles
- `TenantManagementPanel` - Placeholder para gestion multi-tenant
- `EconomicInterventionPanel` - Placeholder para herramientas economicas

**Hooks:**
- `useFeatureFlags` - CRUD de feature flags con manejo de estados y errores

### Backend

**Controladores:**
- `feature-flags.controller.ts` - Gestion de feature flags
- `admin-interventions.controller.ts` - Gestion de alertas de intervencion

**Ubicacion:** `apps/backend/src/modules/admin/controllers/`

**Servicios:**
- `FeatureFlagsService` - Logica de negocio para feature flags
- `AdminInterventionsService` - Logica de alertas de intervencion

**DTOs Feature Flags:**
- `CreateFeatureFlagDto` - Datos para crear flag
- `UpdateFeatureFlagDto` - Datos para actualizar flag
- `FeatureFlagQueryDto` - Filtros de busqueda
- `CheckFeatureFlagDto` - Verificar si flag habilitado
- `FeatureFlagCheckResultDto` - Resultado de verificacion

**DTOs Interventions:**
- `ListInterventionsDto` - Filtros de paginacion y busqueda
- `PaginatedInterventionsDto` - Respuesta paginada
- `InterventionAlertDto` - Detalle de alerta
- `AcknowledgeInterventionDto` - Datos para reconocer alerta
- `ResolveInterventionDto` - Datos para resolver alerta (notes requeridas)

### Base de Datos

**Entities:**
- `FeatureFlag` - Entity para feature flags

**Tablas/Vistas:**
- `feature_flags` - Tabla de feature flags
- `student_intervention_alerts` - Tabla de alertas de intervencion (schema: progress_tracking)

**Funcion DB:**
- `generate_student_alerts()` - Genera alertas automaticamente basado en actividad estudiantil

---

## Modelo de Datos

### FeatureFlag

```typescript
interface FeatureFlag {
  id: string;
  key: string;                    // Identificador unico (snake_case)
  name: string;                   // Nombre legible
  description: string;            // Descripcion del flag
  isEnabled: boolean;             // Estado global
  rolloutPercentage: number;      // 0-100 para despliegue gradual
  targetRoles: string[];          // Roles a los que aplica
  targetUsers: string[];          // Usuarios especificos
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}
```

### InterventionAlert

```typescript
interface InterventionAlert {
  id: string;
  student_id: string;
  classroom_id?: string;
  alert_type: 'no_activity' | 'low_score' | 'declining_trend' | string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  generated_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  acknowledgment_note?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  // Joined data
  student_name?: string;
  student_email?: string;
  classroom_name?: string;
}
```

---

## Notas de Implementacion

### Consideraciones

- Feature Flags Panel esta **completamente implementado** (FE-ADMIN-011-016)
- A/B Testing Dashboard usa **datos mock** - backend no implementado
- Panel de Intervenciones **no tiene UI** - solo backend disponible
- Gestion de Tenants y Herramientas Economicas son **placeholders**
- Hook `useFeatureFlags` puede usar datos mock via `FEATURE_FLAGS.USE_MOCK_DATA`
- La pagina esta **oculta del menu** de navegacion (ver GamilitSidebar.tsx)
- La ruta `/admin/advanced` permanece activa para acceso directo

### Dependencias

- `JwtAuthGuard` - Autenticacion JWT requerida
- `AdminGuard` - Solo super_admin o admin_teacher segun endpoint
- `FeatureFlagsService` - Backend service para feature flags
- `AdminInterventionsService` - Backend service para intervenciones
- `student_intervention_alerts` table - Generada por funcion DB

### Estado de Implementacion por Modulo

| Modulo | Frontend | Backend | Estado |
|--------|----------|---------|--------|
| Feature Flags Panel | Implementado | Implementado | Completo |
| A/B Testing Dashboard | Implementado (mock) | No implementado | UI Only |
| Intervenciones | No implementado | Implementado | Backend Only |
| Gestion Tenants | Placeholder | No implementado | Pendiente |
| Herramientas Economicas | Placeholder | No implementado | Pendiente |

---

## Testing

### Casos de Prueba

| ID | Descripcion | Resultado Esperado |
|----|-------------|--------------------|
| TC-01 | Listar feature flags | Lista con estadisticas y datos de cada flag |
| TC-02 | Crear feature flag | Flag creado con key unico, aparece en lista |
| TC-03 | Toggle feature flag | Estado cambia, UI refleja cambio |
| TC-04 | Editar feature flag | Cambios guardados, fecha updated actualizada |
| TC-05 | Eliminar feature flag | Flag removido tras confirmacion |
| TC-06 | Filtrar por estado | Solo flags del estado seleccionado visibles |
| TC-07 | Buscar flags | Resultados filtrados por nombre/key/descripcion |
| TC-08 | Ver experimentos A/B | Lista de experimentos con estados |
| TC-09 | Iniciar experimento | Status cambia a running, fecha inicio asignada |
| TC-10 | Declarar ganador | Experimento completed, winner registrado |
| TC-11 | Listar intervenciones (API) | Response 200 con array paginado |
| TC-12 | Acknowledge intervencion (API) | Status cambia a acknowledged |
| TC-13 | Resolve intervencion (API) | Status resolved con notas registradas |
| TC-14 | Resolver sin notas (API) | Error 400, notas requeridas (min 10 chars) |

---

## Trazabilidad

### Archivos Creados/Modificados

**Frontend:**
- `apps/frontend/src/apps/admin/pages/AdminAdvancedPage.tsx` - 142 LOC
- `apps/frontend/src/apps/admin/components/advanced/FeatureFlagsPanel.tsx` - 353 LOC
- `apps/frontend/src/apps/admin/components/advanced/FeatureFlagEditor.tsx`
- `apps/frontend/src/apps/admin/components/advanced/RolloutSlider.tsx`
- `apps/frontend/src/apps/admin/components/advanced/TargetingConfig.tsx`
- `apps/frontend/src/apps/admin/components/advanced/FeatureFlagControls.tsx`
- `apps/frontend/src/apps/admin/components/advanced/ABTestingDashboard.tsx` - 466 LOC
- `apps/frontend/src/apps/admin/components/advanced/TenantManagementPanel.tsx`
- `apps/frontend/src/apps/admin/components/advanced/EconomicInterventionPanel.tsx`
- `apps/frontend/src/apps/admin/components/advanced/index.ts` - Barrel exports
- `apps/frontend/src/apps/admin/hooks/useFeatureFlags.ts` - 269 LOC

**Backend:**
- `apps/backend/src/modules/admin/controllers/feature-flags.controller.ts` - 234 LOC
- `apps/backend/src/modules/admin/controllers/admin-interventions.controller.ts` - 257 LOC
- `apps/backend/src/modules/admin/services/feature-flags.service.ts`
- `apps/backend/src/modules/admin/services/admin-interventions.service.ts`
- `apps/backend/src/modules/admin/dto/feature-flags/` - DTOs de feature flags
- `apps/backend/src/modules/admin/dto/interventions/` - DTOs de intervenciones
- `apps/backend/src/modules/admin/entities/feature-flag.entity.ts`

---

## Referencias

- Epica: [EXT-002 Admin Extendido](../README.md)
- Sprint: FE-ADMIN-011-016 (Sprint P2-B)
- Documentacion: 2025-12-05
- Best Practices: [ADMIN-PORTAL-BEST-PRACTICES.md](../guias/ADMIN-PORTAL-BEST-PRACTICES.md)

---

**Creado por:** Technical Writer Agent
**Fecha creacion:** 2026-01-20
**Ultima actualizacion:** 2026-01-20
