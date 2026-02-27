---
titulo: "ADR-048: Component Sharing Strategy"
tipo: adr
fecha_creacion: "2026-02-21"
ultima_actualizacion: "2026-02-27"
estado: aceptada
---

# ADR-048: Component Sharing Strategy

**Estado:** Aceptada
**Date:** 2026-02-21
**Deciders:** Frontend Team
**Tags:** frontend, architecture, components, shared, portals, design-system

---

## Context

### Situacion Actual

GAMILIT has 4 portals (Student, Teacher, Admin, Parent) implemented as separate sub-applications under `apps/frontend/src/apps/`. Each portal has its own `components/`, `hooks/`, and `pages/` directories. Cross-portal reusable components live in `apps/frontend/src/shared/components/`.

The current shared components directory has grown organically:

```
shared/components/
  base/           -- 11 primitives (DetectiveCard, DetectiveButton, TabBar, StatsCardGrid, ...)
  common/         -- 7 composites (Modal, DataTable, ConfirmDialog, FormField, FeatureBadge, ...)
  feedback/       -- 3 feedback components (EmptyState, ErrorMessage, SaveButton)
  layout/         -- GamifiedHeader, GamilitSidebar
  mechanics/      -- Exercise-specific shared components
  media/          -- VideoPlayer
  profile/        -- AvatarSelectionModal
  celebrations/   -- CelebrationModal, confetti effects
  loading/        -- Skeleton loaders
  settings/       -- Settings-related shared components
  timeline/       -- Timeline display components
  exercises/      -- Shared exercise components
  + 20 standalone files at root level (AvatarDisplay, Button, Card, ...)
```

### Problemas Identificados

1. **Duplication across portals:** Common UI patterns were reimplemented independently in each portal. Examples:
   - **StatsGrid:** The Admin portal has `DashboardStatsGrid`, the Student portal has `EnhancedStatsGrid`, and the Teacher portal has inline stats cards — all displaying the same pattern (icon + label + value in a grid). A shared `StatsCardGrid` now exists in `base/` but adoption is incomplete.
   - **Empty states:** Multiple portals use inline "No data" messages with varying styles instead of the shared `EmptyState` component.
   - **Confirmation dialogs:** Native `window.confirm()` calls were used in 20+ places across all portals instead of the themed `ConfirmDialog` component (see ADR-049).

2. **Flat root directory:** The 20 standalone `.tsx` files at the root of `shared/components/` (Button, Card, Input, Avatar, etc.) lack categorization, making discoverability difficult.

3. **Unclear ownership boundaries:** When a component is used by only 2 of 4 portals, it is unclear whether it belongs in `shared/` or should remain portal-specific.

4. **Inconsistent import paths:** Some portals import from `shared/components/base/DetectiveCard` while others duplicate similar card components locally.

---

## Decision

**Shared components follow a three-tier hierarchy in `shared/components/`. Portal-specific components live in their portal's `components/` directory and may wrap shared components with portal-specific data.**

### Tier 1: `base/` — Design System Primitives

Atomic, unstyled-logic components that implement the detective/maya design language. These have no business logic and accept data via props.

| Component | Purpose |
|-----------|---------|
| `DetectiveCard` | Themed card with detective aesthetic |
| `DetectiveButton` | Themed button with variants |
| `ColorfulCard` | Gradient card for gamification elements |
| `EnhancedCard` | Card with hover effects and badges |
| `InputDetective` | Themed text input |
| `TabBar` | Tab navigation component |
| `StatsCardGrid` | Grid of icon + label + value stat cards |
| `ProgressBar` | Themed progress bar |
| `StatusBadge` | Status indicator badge |
| `RankBadge` | Maya rank display badge |
| `Toast` | Toast notification component |

**Rule:** If a component is purely visual and has no data-fetching or business logic, it belongs in `base/`.

### Tier 2: `common/` — Composite Components

Components that combine base primitives with interaction patterns (modals, tables, forms). These may manage their own local state (open/closed, pagination) but do not fetch data.

| Component | Purpose |
|-----------|---------|
| `Modal` | Accessible modal dialog with focus trapping |
| `ConfirmDialog` | Themed confirmation dialog with variants (see ADR-049) |
| `DataTable` | Sortable, paginated data table |
| `FormField` | Label + input + error message wrapper |
| `FeatureBadge` | Feature flag indicator |

**Rule:** If a component manages interaction state (modals, pagination, selection) but not server data, it belongs in `common/`.

### Tier 3: `feedback/` — User Feedback Components

Components that communicate system state to the user: loading, empty, error, success.

| Component | Purpose |
|-----------|---------|
| `EmptyState` | "No data" illustration with message and optional CTA |
| `ErrorMessage` | Error display with retry option |
| `SaveButton` | Button with loading/success/error states |

**Rule:** If a component's primary purpose is communicating state feedback to the user, it belongs in `feedback/`.

### Specialized Directories

The remaining directories serve specific domains:

| Directory | Purpose | Scope |
|-----------|---------|-------|
| `layout/` | Portal layout shells (GamifiedHeader, GamilitSidebar) | Cross-portal |
| `mechanics/` | Exercise rendering components (ExerciseContentRenderer, FeedbackModal, RubricEvaluator) | Exercise system |
| `media/` | Media playback (VideoPlayer) | Cross-portal |
| `profile/` | Profile-related UI (AvatarSelectionModal) | Cross-portal |
| `celebrations/` | Reward celebrations (confetti, modals) | Gamification |
| `loading/` | Skeleton loaders | Cross-portal |

### Ownership Rules

1. **Used by 3+ portals or 2+ portals with high likelihood of a third:** Goes in `shared/components/`.
2. **Used by exactly 2 portals:** Evaluate. If the component is generic (no portal-specific logic baked in), promote to `shared/`. If it contains portal-specific assumptions, keep in the portal that owns it and let the other portal import from there (or duplicate if the cost is low).
3. **Used by 1 portal only:** Stays in that portal's `components/` directory.
4. **Portal-specific wrappers:** A portal may create a thin wrapper around a shared component that pre-fills portal-specific props. Example: `AdminStatsGrid` wraps `StatsCardGrid` with admin-specific icons and labels.

### Root-Level Files Migration

The 20 standalone files at the root of `shared/components/` (Button, Card, Input, Avatar, etc.) should be incrementally migrated into the appropriate tier directory:

| File | Target |
|------|--------|
| `Button.tsx` | `base/` |
| `Card.tsx` | `base/` |
| `Input.tsx` | `base/` |
| `Avatar.tsx`, `AvatarDisplay.tsx`, `AvatarUpload.tsx`, `CosmeticAvatar.tsx` | `profile/` |
| `Header.tsx`, `Footer.tsx`, `Sidebar.tsx` | `layout/` |
| `ProtectedRoute.tsx` | `layout/` (auth boundary) |
| `ErrorBoundary.tsx` | `feedback/` |
| `Pagination.tsx` | `common/` |
| `LeaderboardTable.tsx`, `LeaderboardTabs.tsx` | Evaluate: if used by 2+ portals, stay in shared; otherwise move to gamification feature |
| `ProgressCard.tsx`, `ProgressFilter.tsx` | Evaluate per ownership rules |
| `StatsOverview.tsx`, `UserStatsCard.tsx` | Evaluate: consolidate with `StatsCardGrid` or keep if semantically distinct |
| `UnderConstruction.tsx` | `feedback/` |
| `ExerciseAttemptCard.tsx` | `mechanics/` or `exercises/` |

This migration is incremental and should be done when files are touched for other reasons, not as a big-bang refactor.

---

## Alternatives Considered

### Alternativa 1: Monolithic Shared Library

All shared components in a flat `shared/components/` directory with no subdirectories.

**Pros:**
- Simple structure, no categorization decisions.

**Cons:**
- Poor discoverability with 50+ components in one directory.
- No clear distinction between a primitive (Button) and a composite (DataTable).
- Encourages dumping everything into shared, even portal-specific components.

**Decision:** Rejected. Does not scale with 575+ components across 4 portals.

### Alternativa 2: External Design System Package

Extract shared components into a separate npm package (e.g., `@gamilit/ui`).

**Pros:**
- Clear boundary between shared and portal-specific.
- Versioned, independently testable.

**Cons:**
- Significant overhead for a single-team monorepo project.
- Version management adds friction to development.
- Components evolve rapidly during MVP — package publishing slows iteration.

**Decision:** Rejected. Premature for current project scale and team size. May be reconsidered post-MVP if multiple frontend apps emerge.

### Alternativa 3: Three-Tier Hierarchy in shared/ (Chosen)

Organize shared components into `base/`, `common/`, `feedback/`, and domain-specific directories.

**Pros:**
- Clear categorization aids discoverability.
- Ownership rules prevent shared directory bloat.
- Incremental migration — no big-bang refactor required.
- Portal wrappers allow customization without polluting shared components.

**Cons:**
- Categorization requires judgment calls (is a SaveButton `base/` or `feedback/`?).
- Root-level migration creates a transition period with inconsistent locations.

**Decision:** CHOSEN as the best balance of structure and pragmatism.

---

## Consequences

### Positivas

1. **Reduced duplication:** Common patterns (stats grids, empty states, confirmation dialogs) are implemented once and reused across all 4 portals.
2. **Consistent UX:** Users experience the same interaction patterns regardless of which portal they are in — same modal behavior, same confirmation flow, same empty state appearance.
3. **Faster development:** New features check `shared/` first, finding ready-made components instead of building from scratch.
4. **Clear discoverability:** The three-tier structure (base/common/feedback) tells developers exactly where to look for a given type of component.
5. **Design system foundation:** The `base/` tier forms the nucleus of a design system that can be extracted into a package if needed in the future.

### Negativas

1. **Categorization overhead:** Developers must decide which tier a new shared component belongs in. The rules above mitigate this, but edge cases will arise.
2. **Transition period:** The 20 root-level files will coexist with the organized tiers until they are incrementally migrated. Import paths will change for consumers during migration.
3. **Over-sharing risk:** There is a temptation to put everything in `shared/` "just in case." The ownership rules (3+ portals threshold) guard against this, but require code review discipline.
4. **Portal wrapper boilerplate:** Creating thin wrappers like `AdminStatsGrid` around `StatsCardGrid` adds files, though each wrapper is typically 10-15 lines.

---

## Dependencies

| Dependencia | Tipo | Estado | Descripcion |
|-------------|------|--------|-------------|
| ADR-046 | Relacionado | Accepted | PageShell pattern — each portal's PageShell uses shared layout components |
| ADR-049 | Relacionado | Accepted | ConfirmDialog consolidation — specific instance of this sharing strategy |
| TailwindCSS | Dependencia | Activo | All shared components use Tailwind for styling |
| Lucide React | Dependencia | Activo | Icon library used across all shared components |

---

## References

- `apps/frontend/src/shared/components/` -- Shared components root directory
- `apps/frontend/src/shared/components/base/` -- Tier 1: Design system primitives (11 components)
- `apps/frontend/src/shared/components/common/` -- Tier 2: Composite components (7 components)
- `apps/frontend/src/shared/components/feedback/` -- Tier 3: Feedback components (3 components)
- `apps/frontend/src/apps/admin/components/` -- Admin portal-specific components
- `apps/frontend/src/apps/teacher/components/` -- Teacher portal-specific components
- `apps/frontend/src/apps/student/components/` -- Student portal-specific components
- [ADR-046: PageShell Pattern](./ADR-046-pageshell-pattern.md)
- [ADR-049: ConfirmDialog Consolidation](./ADR-049-confirm-dialog-consolidation.md)
- CLAUDE.md -- 575 production .tsx components, 4 portals, 70 pages

---

**Estado:** Aceptada
**Date Created:** 2026-02-21
**Last Updated:** 2026-02-21
**Supersedes:** N/A
**Superseded by:** N/A
