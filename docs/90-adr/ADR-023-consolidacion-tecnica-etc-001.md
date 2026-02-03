# ADR-023: Consolidacion Tecnica ETC-001

**Estado:** Aceptado
**Fecha:** 2026-01-16
**EPIC:** ETC-001
**Autores:** NEXUS v4.0 + Claude Code

---

## Contexto

Despues de las fases de implementacion (Fase 1 - Alcance Inicial y Fase 3 - Extensiones), se identificaron multiples duplicidades y inconsistencias en el codebase:

- **47 archivos duplicados** detectados en auditoria integral
- **3 versiones de gamificationAPI** con funciones solapadas
- **2 versiones de adminAPI** (una sin uso)
- **2 versiones de educationalAPI** (legacy vs canonica)
- **Re-exports innecesarios** de DTOs de notificaciones
- **Codigo obsoleto** (auth.service.ts con stubs)
- **Paginas duplicadas** (LoginPage, RegisterPage)

El score global de calidad era 93.1% con oportunidades de mejora claras.

---

## Decision

Se ejecuto la EPIC ETC-001 con 5 Historias de Usuario para consolidar tecnicamente el codebase:

### 1. Consolidacion de APIs Frontend (HU-ETC-001)

**Ejecutado:**
- Eliminado `features/admin/api/adminAPI.ts` (0 imports)
- Consolidado `lib/api/educational.api.ts` → `services/api/educationalAPI.ts`
- Actualizados imports en `ModuleDetailsPage.tsx` y `MyProgressPage.tsx`

**Bloqueado:**
- `gamificationAPI`: 3 versiones con funciones unicas activas
- Requiere decision de PO/Tech Lead sobre estandarizacion de endpoints backend

**Documentado:**
- `progressAPI`: Identificado como APIs complementarias (no duplicadas)
  - `lib/api/progress.api.ts` → Progress tracking
  - `features/progress/api/progressAPI.ts` → Exercise mechanics

### 2. Limpieza de Codigo Backend (HU-ETC-002)

- Eliminado `modules/auth/auth.service.ts` (145 lineas de stubs obsoletos)
- Eliminados 6 archivos re-export de notification DTOs
- Actualizados 5 archivos para importar directamente de `@shared/dto/notifications`

### 3. Alineacion Entities-Tablas (HU-ETC-003)

- Creada `user-follow.entity.ts` para tabla `social_features.user_follows`
- Verificado que AchievementCategory y UserActivity ya existian
- Confirmada cobertura de 94% (125/133 tablas con entity)
- 8 tablas auxiliares intencionalmente sin entity (relaciones, tracking)

### 4. Validacion de Integracion (HU-ETC-004)

- Backend build: PASSED
- Frontend build: PASSED
- Lint de archivos modificados: PASSED (sin errores nuevos)
- Tests: 500 failures preexistentes (documentados en TASK-S2-001)

### 5. Actualizacion de Documentacion (HU-ETC-005)

- MASTER_INVENTORY.yml actualizado a v4.4.0
- BACKEND_INVENTORY.yml actualizado a v3.9.0
- FRONTEND_INVENTORY.yml actualizado a v4.5.0
- _MAP.md de ETC-001 actualizado con progreso

---

## Consecuencias

### Positivas

- **11 archivos eliminados** (codigo muerto/duplicado)
- **1 entity creada** (UserFollow)
- **8 imports actualizados** a fuentes canonicas
- **Mejor mantenibilidad**: ubicaciones canonicas claras para APIs
- **Reduccion de confusion**: menos archivos duplicados
- **Documentacion sincronizada**: inventarios reflejan estado real

### Negativas

- **Tests preexistentes**: 500 failures no relacionados con consolidacion (documentados en TASK-S2-001)

---

## Metricas

| Metrica | Antes | Despues | Delta |
|---------|-------|---------|-------|
| Archivos duplicados | 47 | 34 | -13 |
| Backend entities | 124 | 125 | +1 |
| Backend DTOs | 337 | 331 | -6 |
| API services frontend | 26 | 23 | -3 |
| Build status | PASSED | PASSED | = |

---

## Archivos Afectados

### Eliminados (13)

**Backend:**
1. `modules/auth/auth.service.ts`
2. `modules/notifications/dto/create-notification.dto.ts`
3. `modules/notifications/dto/notification-response.dto.ts`
4. `modules/notifications/dto/notifications/create-notification.dto.ts`
5. `modules/notifications/dto/notifications/notification-response.dto.ts`
6. `modules/gamification/dto/notifications/create-notification.dto.ts`
7. `modules/gamification/dto/notifications/notification-response.dto.ts`

**Frontend:**
8. `features/admin/api/adminAPI.ts`
9. `apps/student/pages/LoginPage.tsx`
10. `apps/student/pages/RegisterPage.tsx`
11. `lib/api/educational.api.ts`
12. `services/api/gamificationAPI.ts` (V1 - consolidado en V3)
13. `features/gamification/api/gamificationAPI.ts` (V2 - 0 imports)

### Creados (1)

1. `modules/social/entities/user-follow.entity.ts`

### Modificados (11)

**Backend:**
1. `modules/social/entities/index.ts`
2. `modules/social/social.module.ts`
3. `modules/gamification/dto/index.ts`
4. `modules/notifications/dto/notifications/index.ts`
5. `modules/notifications/dto/paginated-notifications.dto.ts`
6. `modules/notifications/controllers/notifications.controller.ts`
7. `modules/notifications/index.ts`

**Frontend:**
8. `pages/ModuleDetailsPage.tsx`
9. `pages/MyProgressPage.tsx`
10. `shared/hooks/useUserGamification.ts` (import actualizado a V3)
11. `lib/api/gamification.api.ts` (consolidado con funciones de V1)

---

## Resolucion gamificationAPI (2026-01-16)

**Problema original:** 3 versiones con funciones solapadas.

**Solucion implementada:**
- **V2** (`features/gamification/api/gamificationAPI.ts`): Eliminado - 0 imports detectados
- **V1** (`services/api/gamificationAPI.ts`): Eliminado - funciones consolidadas en V3
- **V3** (`lib/api/gamification.api.ts`): **Version canonica** - funciones de V1 incorporadas

**Cambios:**
1. Agregado `UserGamificationSummary` interface a V3
2. Agregado `getUserGamificationSummary` function a V3
3. Actualizado `useUserGamification.ts` para importar de V3
4. Validacion de build exitosa

---

## Referencias

- [ETC-001 README](../../02-fase-robustecimiento/ETC-001-consolidacion-tecnica/README.md)
- [AUDITORIA-INTEGRAL-2026-01-16.md](../../../orchestration/reportes/AUDITORIA-INTEGRAL-2026-01-16.md)
- [MASTER_INVENTORY.yml](../../../orchestration/inventarios/MASTER_INVENTORY.yml)
- [SPRINT-2-BACKLOG.yml](../../../orchestration/SPRINT-2-BACKLOG.yml)

---

**Creado:** 2026-01-16
**Sistema:** NEXUS v4.0 + SIMCO
