# Plan Sprint Testing - GAMILIT

**Proyecto:** GAMILIT - Sistema de Gamificacion Educativa
**Sprint:** Testing Sprint Post-Auditoria
**Fecha:** 2026-01-10
**Duracion Estimada:** 44 horas (H-001: 20h, H-006: 16h, H-009: 8h)
**Estado:** EN PROGRESO

---

## Objetivos del Sprint

Resolver los hallazgos pendientes de la auditoria de documentacion relacionados con testing:

| ID | Descripcion | Horas | Prioridad |
|----|-------------|-------|-----------|
| H-001 | Tests backend M04 Analytics | 20h | P0 |
| H-006 | Tests frontend M07/M09 (Portal Admin/Extensiones) | 16h | P0 |
| H-009 | Integracion CI/CD completa | 8h | P0 |

---

## Estado Actual de Testing

### Infraestructura Existente

| Componente | Framework | Archivos Test | Threshold | CI/CD |
|------------|-----------|---------------|-----------|-------|
| Backend | Jest | 46 | 30% | GitHub Actions |
| Frontend | Vitest | 41 | 60% | GitHub Actions |
| E2E | Playwright | 7 | - | GitHub Actions |

### Gaps Identificados

#### Backend - Servicios sin Tests

| Servicio | Ubicacion | Lineas | Estado |
|----------|-----------|--------|--------|
| admin-analytics.service.ts | modules/admin/services/ | ~200 | SIN TEST |
| admin-analytics.controller.ts | modules/admin/controllers/ | ~150 | SIN TEST |
| admin-dashboard.service.ts | modules/admin/services/ | ~180 | SIN TEST |
| admin-dashboard.controller.ts | modules/admin/controllers/ | ~120 | SIN TEST |
| teacher/analytics.service.ts | modules/teacher/services/ | ~250 | SIN TEST |

#### Frontend - Modulos sin Tests

| Modulo | Ubicacion | Componentes | Estado |
|--------|-----------|-------------|--------|
| Portal Admin (M07) | apps/admin/ | ~15 | 2 tests |
| Teacher Portal | apps/teacher/ | ~12 | 0 tests |
| Extensiones (M09) | features/ | ~8 | 0 tests |

---

## Plan de Ejecucion

### Semana 1: H-001 - Backend Analytics Tests (20h)

#### Dia 1-2: Analytics Service Tests (8h)

**Archivo a crear:** `admin/__tests__/admin-analytics.service.spec.ts`

```typescript
// Tests a implementar:
describe('AdminAnalyticsService', () => {
  describe('getOverview', () => ... });
  describe('getEngagementMetrics', () => ... });
  describe('getRetentionAnalytics', () => ... });
  describe('getGamificationStats', () => ... });
  describe('getTopUsers', () => ... });
  describe('getActivityTimeline', () => ... });
  describe('exportAnalytics', () => ... });
});
```

**Cobertura esperada:**
- Happy path para cada metodo
- Error handling
- Edge cases (datos vacios, fechas invalidas)
- Mocking de repositorios

#### Dia 3: Analytics Controller Tests (4h)

**Archivo a crear:** `admin/__tests__/admin-analytics.controller.spec.ts`

```typescript
// Tests a implementar:
describe('AdminAnalyticsController', () => {
  describe('GET /admin/analytics/overview', () => ... });
  describe('GET /admin/analytics/engagement', () => ... });
  describe('GET /admin/analytics/retention', () => ... });
  describe('GET /admin/analytics/gamification', () => ... });
  describe('GET /admin/analytics/top-users', () => ... });
  describe('GET /admin/analytics/timeline', () => ... });
  describe('POST /admin/analytics/export', () => ... });
});
```

#### Dia 4: Dashboard Service Tests (4h)

**Archivo a crear:** `admin/__tests__/admin-dashboard.service.spec.ts`

```typescript
describe('AdminDashboardService', () => {
  describe('getDashboardMetrics', () => ... });
  describe('getQuickStats', () => ... });
  describe('getRecentActivity', () => ... });
  describe('getSystemHealth', () => ... });
});
```

#### Dia 5: Teacher Analytics Tests (4h)

**Archivo a crear:** `teacher/__tests__/analytics.service.spec.ts`

```typescript
describe('TeacherAnalyticsService', () => {
  describe('getClassroomAnalytics', () => ... });
  describe('getStudentProgress', () => ... });
  describe('getEngagementReport', () => ... });
  describe('exportClassroomData', () => ... });
});
```

---

### Semana 2: H-006 - Frontend Tests (16h)

#### Dia 1-2: Portal Admin Tests (8h)

**Archivos a crear:**

1. `apps/admin/pages/__tests__/DashboardPage.test.tsx`
2. `apps/admin/pages/__tests__/AnalyticsPage.test.tsx`
3. `apps/admin/pages/__tests__/UsersPage.test.tsx`
4. `apps/admin/components/__tests__/AdminSidebar.test.tsx`
5. `features/admin/hooks/__tests__/useAdminAnalytics.test.ts`

**Cobertura:**
- Renderizado de componentes
- Interacciones de usuario
- Llamadas a API (mocked)
- Estados de carga y error

#### Dia 3-4: Teacher Portal Tests (8h)

**Archivos a crear:**

1. `apps/teacher/pages/__tests__/TeacherDashboard.test.tsx`
2. `apps/teacher/pages/__tests__/ClassroomPage.test.tsx`
3. `apps/teacher/components/__tests__/StudentList.test.tsx`
4. `apps/teacher/hooks/__tests__/useTeacherData.test.ts`
5. `features/teacher/hooks/__tests__/useClassroomAnalytics.test.ts`

---

### Semana 2: H-009 - CI/CD Integration (8h)

#### Dia 5: CI/CD Improvements

**Tareas:**

1. **Remover continue-on-error de tests criticos**
   - Archivo: `.github/workflows/backend-ci.yml`
   - Archivo: `.github/workflows/frontend-ci.yml`

2. **Agregar quality gates**
   - Threshold minimo de coverage
   - Bloqueo de merge si tests fallan

3. **Agregar test reports**
   - JUnit XML para backend
   - HTML reports para frontend

4. **Configurar branch protection**
   - Requerir tests passing
   - Requerir coverage threshold

---

## Metricas de Exito

| Metrica | Actual | Objetivo |
|---------|--------|----------|
| Backend test files | 46 | 51 (+5) |
| Backend coverage | ~30% | >50% |
| Frontend test files | 41 | 51 (+10) |
| Frontend coverage | ~60% | >70% |
| CI blocking tests | No | Si |

---

## Dependencias

### Backend

```json
// Ya instalados
"jest": "^29.x",
"@nestjs/testing": "^10.x",
"jest-mock-extended": "^3.x"
```

### Frontend

```json
// Ya instalados
"vitest": "^1.x",
"@testing-library/react": "^14.x",
"@testing-library/user-event": "^14.x"
```

---

## Riesgos

| Riesgo | Probabilidad | Mitigacion |
|--------|--------------|------------|
| Servicios con muchas dependencias | Alta | Usar mocks extensivos |
| Datos de test complejos | Media | Crear factories/fixtures |
| CI lento con mas tests | Baja | Paralelizar ejecucion |

---

## Entregables

1. 5+ archivos de test backend para analytics
2. 10+ archivos de test frontend para admin/teacher
3. CI/CD actualizado con quality gates
4. Reporte de coverage actualizado
5. Documentacion de tests creados

---

**Creado:** 2026-01-10
**Agente:** Architecture-Analyst
