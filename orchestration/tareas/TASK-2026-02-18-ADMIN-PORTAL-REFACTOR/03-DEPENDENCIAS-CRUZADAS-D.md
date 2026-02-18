# Dependencias Cruzadas -- Grupo D: Analytics + Reports + Progress + Assignments

**Agente:** D
**Fecha:** 2026-02-18

---

## 1. Componentes/Hooks Compartidos con Otros Grupos

### 1.1 Dependencias que Grupo D CONSUME (de otros grupos)

| Dependencia | Ubicacion | Usado Por (Grupo D) | Grupo Propietario |
|-------------|-----------|---------------------|-------------------|
| `useAuth` | `@features/auth/hooks/useAuth` | 4 paginas | Grupo A (Auth/Dashboard) |
| `useUserGamification` | `@shared/hooks/useUserGamification` | 4 paginas | Grupo B (Gamification) |
| `AdminLayout` | `../layouts/AdminLayout` | 4 paginas | Grupo A (Dashboard) |
| `DetectiveCard` | `@shared/components/base/DetectiveCard` | 13 archivos | Shared (ninguno) |
| `DetectiveButton` | `@shared/components/base/DetectiveButton` | 7 archivos | Shared (ninguno) |
| `ToastContainer` + `useToast` | `@shared/components/base/Toast` | AdminAssignmentsPage | Shared (ninguno) |
| `adminAPI` | `@/services/api/adminAPI` | 3 hooks | Shared API layer |
| `apiClient` | `@/services/api/apiClient` | useAdminAssignments | Shared API layer |
| `API_ENDPOINTS` | `@/config/api.config` | useAdminAssignments | Shared Config |
| `adminTypes` | `@/services/api/adminTypes` | 3 hooks + 8 componentes | Shared Types |

### 1.2 Dependencias que Grupo D PROVEE (a otros grupos)

| Export | Ubicacion | Consumido Por |
|--------|-----------|---------------|
| `useProgress` | `admin/hooks/index.ts` | Potencialmente Dashboard (Grupo A) |
| `useClassroomsList` | `admin/hooks/index.ts` | Potencialmente ClassroomTeacher pages (Grupo C) |

### 1.3 Dependencias SOLO dentro de Grupo D

| Dependencia | Usado Por |
|-------------|-----------|
| `useAnalytics` | Solo AdminAnalyticsPage |
| `useReports` | Solo AdminReportsPage |
| `useAdminAssignments` (y sub-hooks) | Solo AdminAssignmentsPage |
| `OverviewTab`, `EngagementTab`, `GamificationTab`, `RetentionTab` | Solo AdminAnalyticsPage |
| `ReportGenerationForm`, `ReportsList`, `BetaBanner` | Solo AdminReportsPage |
| `OverviewView`, `ClassroomsView`, `StudentDetailView`, `ClassroomSelector`, `StudentSearch` | Solo AdminProgressPage |
| `AssignmentsTable`, `AssignmentFilters`, `AssignmentDetailModal` | Solo AdminAssignmentsPage |

---

## 2. Patrones Comunes que Necesitan Solucion Cross-Cutting

### 2.1 Boilerplate Admin Page (CRITICO -- afecta TODOS los grupos)

**Patron:** Todas las admin pages (estimado 15-18 paginas total) repiten:
```tsx
const { user, logout } = useAuth();
const { gamificationData } = useUserGamification(user?.id);
const displayGamificationData = gamificationData || { /* fallback */ };
const handleLogout = () => { logout(); window.location.href = '/login'; };
<AdminLayout user={user} gamificationData={displayGamificationData} onLogout={handleLogout}>
```

**Propuesta D:** Hook `useAdminPage()` o wrapper `AdminPageShell`.
**Impacto en otros agentes:**
- Grupo A: Dashboard + Users + Organizations (~3-4 paginas)
- Grupo B: Gamification + Content + Settings (~3-4 paginas)
- Grupo C: ClassroomTeacher + LTI + SystemLogs (~3-4 paginas)
- Grupo D: Analytics + Reports + Progress + Assignments (4 paginas)

**Riesgo de conflicto:** ALTO si multiples agentes crean soluciones diferentes. **Recomendacion: Un solo agente (sugerencia: Grupo A como propietario del AdminLayout) crea la solucion y los demas la consumen.**

---

### 2.2 Toast Inconsistencia (afecta TODOS los grupos)

**Estado actual en Grupo D:**
- AdminAssignmentsPage: `useToast` (correcto)
- AdminAnalyticsPage: manual `useState` (incorrecto)
- AdminReportsPage: manual `useState` + SVGs inline (peor caso)
- AdminProgressPage: sin toast (usa clearError)

**Pregunta para Grupo A/E:** Cual es el patron canonico? `useToast` de `@shared/components/base/Toast` parece ser el correcto pero solo 2 paginas del portal entero lo usan.

**Riesgo de conflicto:** BAJO si se acuerda que `useToast` es canonico. Solo es refactor en cada grupo.

---

### 2.3 React Query vs Manual useState Hooks

**Estado en Grupo D:**
- React Query: `useAdminAssignments` (5 hooks), `useClassroomsList` (1 hook)
- Manual: `useAnalytics`, `useReports`, `useProgress`

**Pregunta para otros grupos:** Los hooks de otros grupos (useAdminDashboard, useSystemMetrics, useUserManagement, etc.) usan React Query o manual useState?

**Riesgo de conflicto:** NINGUNO. Cada hook se puede migrar independientemente. Pero la migracion de `useProgress` podria afectar a Grupo A si el Dashboard consume ese hook.

---

### 2.4 CSV Export Utility (afecta potencialmente TODOS los grupos)

**Patron duplicado en Grupo D (3 hooks):**
```tsx
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
// ... download logic ...
window.URL.revokeObjectURL(url);
```

**Propuesta:** `shared/utils/downloadBlob.ts`
**Riesgo de conflicto:** BAJO. Ningun otro grupo deberia tener su propia version. La utilidad vive en `shared/`.

---

### 2.5 Table Sorting Hook

**Duplicado en Grupo D:** `ClassroomsView` y `AssignmentsTable`
**Posible duplicado en otros grupos:** Cualquier componente de tabla con sorting (UserTable, AuditLogsTable, etc.)

**Propuesta:** `shared/hooks/useTableSort.ts`
**Riesgo de conflicto:** BAJO. Es additive (nuevo archivo en shared/).

---

### 2.6 AdminStatCard Component

**Duplicado en Grupo D:** 5+ componentes
**Posible duplicado en otros grupos:** Dashboard stats cards, System Monitoring cards

**Propuesta:** `admin/components/shared/AdminStatCard.tsx`
**Riesgo de conflicto:** BAJO. El `StatCard` de `OverviewTab` es local y no se importa por otros archivos.

---

## 3. Potenciales Conflictos entre Agentes

### 3.1 CONFLICTO ALTO: AdminLayout Modifications

**Situacion:** Si Grupo A propone cambios al `AdminLayout` (como integrar el boilerplate), eso afecta todas las paginas de todos los grupos.

**Mitigacion:** Grupo A deberia crear el wrapper/hook PRIMERO. Grupos B, C, D aplican despues.

### 3.2 CONFLICTO MEDIO: `admin/hooks/index.ts`

**Situacion:** El archivo index.ts re-exporta hooks de multiples grupos. Si Grupo C agrega un hook y Grupo D tambien, pueden conflictar en merge.

**Mitigacion:** Cada agente deberia documentar sus cambios al index.ts y no hacer rewrite completo.

### 3.3 CONFLICTO MEDIO: `adminTypes.ts` Shared Types

**Situacion:** Todos los hooks de Grupo D importan types de `@/services/api/adminTypes`. Si Grupo B modifica este archivo (e.g., para Content Management types), puede conflictar.

**Mitigacion:** Tipos son additive. No deberia haber conflicto si nadie elimina tipos existentes.

### 3.4 CONFLICTO BAJO: `shared/utils/` and `shared/hooks/`

**Situacion:** Grupo D propone crear `downloadBlob.ts` y `useTableSort.ts` en shared/. Si otro grupo propone lo mismo con nombre diferente, duplicacion.

**Mitigacion:** Revisar propuestas de todos los agentes antes de implementar. Primera pasada gana.

---

## 4. Resumen de Acciones Coordinadas Necesarias

| # | Accion | Responsable Sugerido | Afecta a |
|---|--------|---------------------|----------|
| 1 | Crear `useAdminPage` hook o `AdminPageShell` | Grupo A | Todos |
| 2 | Confirmar `useToast` como patron canonico | Grupo E (orchestration) | Todos |
| 3 | Crear `shared/utils/downloadBlob.ts` | Grupo D (primera necesidad) | A, B, C si lo usan |
| 4 | Crear `shared/hooks/useTableSort.ts` | Grupo D (primera necesidad) | A, C si tienen tablas |
| 5 | Documentar patron React Query como estandar para admin hooks | Grupo E | B, C si tienen hooks manuales |
| 6 | Coordinar orden de merge en `admin/hooks/index.ts` | Grupo E | Todos |

---

## 5. Dependencias Externas del Grupo D

### Bibliotecas externas usadas:
- `recharts` -- solo en analytics/ componentes (PieChart, BarChart, LineChart, etc.)
- `@tanstack/react-query` -- useAdminAssignments, useClassroomsList
- `lucide-react` -- todos los componentes

### APIs backend consumidas (9 endpoint groups):
1. `GET /admin/analytics/*` (7 endpoints) -- useAnalytics
2. `GET/POST/DELETE /admin/reports/*` (5 endpoints) -- useReports
3. `GET /admin/progress/*` (6 endpoints) -- useProgress
4. `GET /admin/assignments/*` (5 endpoints) -- useAdminAssignments
5. `GET /admin/classrooms` (1 endpoint) -- useClassroomsList
6. `GET /admin/organizations` (1 endpoint) -- ReportGenerationForm (direct import)
7. `classroomTeacherApi.listClassroomsForDropdown` -- ReportGenerationForm

### Nota sobre ReportGenerationForm
Este componente importa directamente de 2 API sources (`getOrganizations` y `classroomTeacherApi`) en vez de usar hooks. Si se migra a React Query, esos fetches se moverian a hooks propios o reutilizarian `useOrganizations` y `useClassroomsList` que ya existen en `admin/hooks/`.
