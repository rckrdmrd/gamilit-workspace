# US-ETC-002: Limpieza de Codigo Backend

**Historia de Usuario ID:** US-ETC-002
**EPIC:** ETC-001 - Consolidacion Tecnica
**Sprint:** 2
**Story Points:** 5
**Estado:** Planificada

---

## Historia

**Como** desarrollador backend
**Quiero** eliminar codigo obsoleto y duplicado
**Para** mantener el codebase limpio y evitar confusion

---

## Contexto

El analisis de duplicidades identifico codigo obsoleto y redundante en el backend:

| Tipo | Archivo | Problema |
|------|---------|----------|
| Service obsoleto | `auth/auth.service.ts` | Version stub de 145 lineas, produccion en `auth/services/auth.service.ts` |
| DTOs redundantes | notification DTOs | 3 capas de re-exports innecesarios |
| Naming conflict | recent-activity.dto.ts | 2 versiones con nombres similares pero propositos distintos |

---

## Tareas

### TASK-001: Eliminar auth.service.ts obsoleto
**Estimacion:** 30min

1. Verificar que ningun archivo importe de `auth/auth.service.ts`
2. Confirmar que `auth/services/auth.service.ts` tiene toda la funcionalidad
3. Eliminar archivo obsoleto
4. Verificar build

**Archivo a eliminar:**
- `apps/backend/src/modules/auth/auth.service.ts`

**Archivo a mantener:**
- `apps/backend/src/modules/auth/services/auth.service.ts` (801 lineas, produccion)

### TASK-002: Limpiar re-exports de notification DTOs
**Estimacion:** 1h

1. Identificar los 6 archivos de re-export
2. Verificar que todos apuntan a `@shared/dto/notifications/`
3. Actualizar imports directos desde shared
4. Eliminar re-exports intermedios

**Archivos a limpiar:**
- `modules/notifications/dto/create-notification.dto.ts`
- `modules/notifications/dto/notifications/create-notification.dto.ts`
- `modules/gamification/dto/notifications/create-notification.dto.ts`
- `modules/notifications/dto/notification-response.dto.ts`
- `modules/notifications/dto/notifications/notification-response.dto.ts`
- `modules/gamification/dto/notifications/notification-response.dto.ts`

### TASK-003: Resolver naming conflict en Activity DTOs
**Estimacion:** 2h

1. Analizar `progress/dto/recent-activity.dto.ts` (progress tracking)
2. Analizar `admin/dto/dashboard/recent-activity.dto.ts` (admin actions)
3. Renombrar admin version a `admin-activity.dto.ts`
4. Actualizar imports afectados
5. Verificar que no haya conflictos de tipos

### TASK-004: Eliminar paginas auth duplicadas en frontend
**Estimacion:** 1h

1. Verificar que `pages/auth/LoginPage.tsx` es la version canonica
2. Verificar que App.tsx usa la version correcta
3. Eliminar `apps/student/pages/LoginPage.tsx`
4. Eliminar `apps/student/pages/RegisterPage.tsx`
5. Actualizar imports si es necesario

**Archivos a eliminar:**
- `apps/frontend/src/apps/student/pages/LoginPage.tsx`
- `apps/frontend/src/apps/student/pages/RegisterPage.tsx`

---

## Criterios de Aceptacion

- [ ] 0 archivos obsoletos en backend
- [ ] 0 re-exports redundantes
- [ ] 0 naming conflicts en DTOs
- [ ] Build exitoso
- [ ] Tests pasando

---

## Definition of Done

- [ ] Archivos obsoletos eliminados
- [ ] Imports actualizados
- [ ] `npm run build` exitoso en backend
- [ ] `npm run lint` sin errores
- [ ] BACKEND_INVENTORY.yml actualizado
- [ ] Commit descriptivo

---

**Creado:** 2026-01-16
**Asignado:** NEXUS-BACKEND
