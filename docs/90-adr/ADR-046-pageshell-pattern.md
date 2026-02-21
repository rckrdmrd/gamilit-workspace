# ADR-046: PageShell Pattern Replaces HOC Layout Wrappers

**Status:** Accepted
**Date:** 2026-02-19
**Deciders:** Frontend Team
**Tags:** frontend, architecture, patterns, portals, layout

---

## Context

### Situacion Anterior

The Teacher portal originally used a Higher-Order Component (HOC) called `withTeacherLayout` to wrap page components with the portal layout. This HOC was applied in `App.tsx` during lazy loading:

```typescript
// App.tsx — HOC wrapping at the route level
const TeacherDashboard = lazy(() =>
  import('./pages/TeacherDashboard').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
```

The `withTeacherLayout` HOC injected `useAuth()`, `useUserGamification()`, and `TeacherLayout` around each page, hiding this from the page component itself.

### Problemas Identificados

1. **Disconnect between page and its layout:** Pages did not control their own layout. The wrapping happened externally in `App.tsx`, making it non-obvious which layout a page used.
2. **Complex lazy loading:** The `.then(m => ({ default: withTeacherLayout(m.default) }))` pattern added boilerplate and confusion in the router configuration.
3. **Testing difficulty:** Testing a page in isolation required mocking the HOC or reproducing its behavior in the test harness.
4. **Inconsistency across portals:** The Admin portal had already migrated to `AdminPageShell` (a component wrapping pattern inside each page). The Student portal adopted `StudentPageShell`. Only the Teacher portal still used the HOC approach.
5. **Hidden dependencies:** The HOC pattern obscured which hooks and context each page consumed, making dependency tracing harder.

### Patron Existente en Admin Portal

The Admin portal had already adopted the PageShell pattern where each page wraps its own content:

```typescript
// AdminSomePage.tsx — page controls its own layout
export default function AdminSomePage() {
  return (
    <AdminPageShell>
      <h1>Page Content</h1>
    </AdminPageShell>
  );
}
```

This pattern proved successful: pages were self-contained, App.tsx was simplified, and testing required no HOC mocking.

---

## Decision

**All portals use the PageShell pattern.** Each page wraps its own content with `<PortalPageShell>`. The HOC pattern (`withTeacherLayout`) is deprecated.

### Implementacion

Three PageShell components exist, one per portal:

| Portal | Component | Location |
|--------|-----------|----------|
| Admin | `AdminPageShell` | `apps/frontend/src/apps/admin/components/shared/AdminPageShell.tsx` |
| Teacher | `TeacherPageShell` | `apps/frontend/src/apps/teacher/components/shared/TeacherPageShell.tsx` |
| Student | `StudentPageShell` | `apps/frontend/src/apps/student/components/shared/StudentPageShell.tsx` |

Each PageShell:
1. Calls the portal-specific `usePortalPageSetup()` hook (which centralizes auth, gamification data, and logout logic).
2. Renders the portal-specific layout component (`AdminLayout`, `TeacherLayout`, `GamifiedHeader`).
3. Renders `children` inside the layout.

### Patron de Uso

```typescript
// TeacherDashboard.tsx — page controls its own layout
import { TeacherPageShell } from '../components/shared/TeacherPageShell';

export default function TeacherDashboard() {
  const { stats, isLoading } = useTeacherDashboard();

  return (
    <TeacherPageShell>
      {isLoading ? <Skeleton /> : <DashboardContent stats={stats} />}
    </TeacherPageShell>
  );
}
```

```typescript
// App.tsx — simple lazy imports, no HOC wrapping
const TeacherDashboard = lazy(() => import('./apps/teacher/pages/TeacherDashboard'));

<Route path="/teacher/dashboard" element={<TeacherDashboard />} />
```

### Deprecacion del HOC

The `withTeacherLayout` HOC was removed in the Teacher Portal Audit (2026-02-20). All 19 pages now use `TeacherPageShell`. The file `withTeacherLayout.tsx` no longer exists in the codebase.

---

## Alternatives Considered

### Alternativa 1: Keep HOC Pattern

**Pros:**
- No migration effort.
- Pages remain "pure" (no layout awareness).

**Cons:**
- Inconsistent with Admin and Student portals that already use PageShell.
- Complex lazy loading transforms in App.tsx.
- Pages cannot customize their layout (no conditional header, no page-specific layout props).
- Testing requires HOC mocking.

**Decision:** Rejected. Consistency across portals outweighs the migration cost.

### Alternativa 2: Layout Routes (React Router Outlet)

**Pros:**
- Layout defined once at the route level.
- Pages remain layout-unaware.

**Cons:**
- Requires restructuring the entire route tree.
- Less flexible for pages that need conditional layouts (e.g., StudentPageShell's `showHeader` prop).
- Does not align with existing codebase patterns.

**Decision:** Rejected. Too disruptive for marginal benefit.

### Alternativa 3: PageShell Component Pattern (Chosen)

**Pros:**
- Pages are self-contained and explicit about their layout.
- App.tsx is simplified (plain lazy imports).
- Easy to test pages in isolation (mock or render the PageShell).
- Consistent pattern across all 3 portals.
- Flexible: pages can pass props to the shell (e.g., `showHeader`).

**Cons:**
- Every page must import and use the PageShell (slight boilerplate).
- Migration required for existing Teacher pages.

**Decision:** CHOSEN for consistency, testability, and simplicity.

---

## Consequences

### Positivas

1. **Pages are self-contained:** Each page explicitly declares its layout. No external wrapping needed in App.tsx or route definitions.
2. **Consistent pattern across all 3 portals:** Admin, Teacher, and Student portals all use the same PageShell approach, reducing cognitive load for developers working across portals.
3. **Easier to test pages in isolation:** Tests render the page directly without needing to mock or reproduce HOC behavior.
4. **App.tsx is simplified:** Route definitions use plain lazy imports without `.then()` transforms.
5. **Flexible customization:** Pages can pass props to the PageShell (e.g., `StudentPageShell`'s `showHeader` prop) for per-page layout variations.
6. **Transparent dependency chain:** Reading a page file shows exactly what hooks and context it uses, since the PageShell is visible in the JSX tree.

### Negativas

1. **Migration effort:** All 19 Teacher pages required updating from HOC to PageShell (one-time cost, completed).
2. **Repeated import:** Every page must `import { TeacherPageShell }` and wrap its content. This is minimal boilerplate (~3 lines per page).
3. ~~**Temporary coexistence:**~~ Migration completed and `withTeacherLayout` was removed (Teacher Portal Audit 2026-02-20). No coexistence period remains.

---

## Dependencies

| Dependencia | Tipo | Estado | Descripcion |
|-------------|------|--------|-------------|
| ADR-030 | Relacionado | Amended | Convencion de nombres de paginas — sufijo "Page" canonico (v2.0.0, enmienda 2026-02-19) |
| AdminPageShell | Precedente | Completado | Patron establecido primero en Admin portal |
| useTeacherPageSetup | Pre-requisito | Completado | Hook que centraliza auth/gamification para Teacher portal |
| useStudentPageSetup | Pre-requisito | Completado | Hook que centraliza auth/gamification para Student portal |
| useAdminPageSetup | Pre-requisito | Completado | Hook que centraliza auth/gamification para Admin portal |

---

## References

- `apps/frontend/src/apps/admin/components/shared/AdminPageShell.tsx` -- Admin PageShell implementation
- `apps/frontend/src/apps/teacher/components/shared/TeacherPageShell.tsx` -- Teacher PageShell implementation
- `apps/frontend/src/apps/student/components/shared/StudentPageShell.tsx` -- Student PageShell implementation
- ~~`apps/frontend/src/apps/teacher/components/withTeacherLayout.tsx`~~ -- **Removed** (eliminado en Teacher Portal Audit 2026-02-20). Migration to TeacherPageShell completed for all 19 pages.
- [ADR-030: Convencion de Nombres de Paginas](./ADR-030-convencion-nombres-paginas.md)

---

**Status:** Accepted
**Date Created:** 2026-02-19
**Last Updated:** 2026-02-19
**Supersedes:** N/A
**Superseded by:** N/A
