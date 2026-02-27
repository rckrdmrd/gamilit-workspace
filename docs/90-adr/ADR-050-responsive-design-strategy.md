---
titulo: "ADR-050: Responsive Design Strategy"
tipo: adr
fecha_creacion: "2026-02-26"
ultima_actualizacion: "2026-02-27"
estado: aceptada
---

# ADR-050: Responsive Design Strategy

**Estado:** Aceptada
**Date:** 2026-02-26
**Deciders:** Frontend Team
**Tags:** frontend, responsive, mobile, ux, accessibility, tailwind, breakpoints

---

## Context

### Situacion Anterior

The GAMILIT frontend (575 production components, 72 pages, 4 portals, 30 exercise mechanics) was built with a desktop-first approach. While Tailwind CSS provides responsive utilities, their usage was inconsistent:

1. **No shared responsive infrastructure:** The `useResponsiveLayout` hook existed only in the student portal (`apps/student/hooks/`), unavailable to admin, teacher, and parent portals.

2. **Hardcoded dimensions:** Multiple components used fixed widths (`w-80`, `min-w-[300px]`) and inline heights (`style={{ maxHeight: '260px' }}`) that overflow on screens <384px.

3. **Direct window access:** ~9 files used `window.innerWidth`/`window.innerHeight` directly instead of reactive hooks, causing stale values and no SSR compatibility.

4. **Modal accessibility:** Close buttons were ~26px tap targets (WCAG 2.5.5 requires 44x44px minimum). Modal content areas used fixed max-height that didn't adapt to mobile viewports.

5. **No responsive documentation:** No ADR, no standard, no testing guide existed for responsive patterns.

6. **Non-responsive padding/typography:** Components used `p-8`, `text-2xl`, `gap-6` without mobile variants, causing overflow on narrow screens.

### Problemas Identificados

- **P0 (blocks mobile):** ExerciseSidebar `w-80` overflow, `maxHeight: '260px'` inline, PowerUpEffects `min-w-[300px]`, modal close buttons <44px
- **P1 (affects most devices):** 6+ modals with `p-8` no responsive, grid layouts without mobile collapse, typography without scaling
- **P2 (polish):** Badge sizing, avatar grid breakpoints, inconsistent gaps

---

## Decision

**Mobile-first responsive design using Tailwind CSS breakpoints, a shared `useResponsiveLayout` hook, and WCAG 2.5.5 compliant touch targets.**

### Regla 1: Breakpoint System

Use Tailwind CSS default breakpoints for CSS (mobile-first — styles apply from that breakpoint UP):

| Token | Min-width | Target |
|-------|-----------|--------|
| (base) | 0px | Mobile phones (320-639px) |
| `sm:` | 640px | Large phones / small tablets |
| `md:` | 768px | Tablets portrait |
| `lg:` | 1024px | Tablets landscape / small laptops |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Wide desktop |

For JavaScript breakpoint detection (via `useResponsiveLayout`):

| Breakpoint | Range | Hook value |
|------------|-------|------------|
| mobile | <768px | `isMobile: true` |
| tablet | 768-1023px | `isTablet: true` |
| desktop | 1024-1399px | `isDesktop: true` |
| wide | >=1400px | `isWide: true` |

### Regla 2: Touch Target Minimum (WCAG 2.5.5)

All interactive elements must have a minimum touch target of **44x44px**:

```tsx
// Close buttons
<button
  onClick={onClose}
  className="rounded-full p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
  aria-label="Cerrar"
>
  <X size={24} />
</button>
```

Use `touch-manipulation` to prevent 300ms delay on mobile browsers.

### Regla 3: Modal Responsive Pattern

All modals must:
- Add `max-w-[calc(100vw-2rem)]` floor to prevent overflow on screens <384px
- Use responsive padding: `p-4 sm:p-6 md:p-8` (not `p-8` alone)
- Use responsive content height: `max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-200px)]`
- Stack action buttons on mobile: `flex flex-col-reverse sm:flex-row gap-3`
- Close button: 44x44px minimum tap target

### Regla 4: Width Constraints

Never use fixed widths without a viewport-relative floor:

```tsx
// BAD
<div className="w-80">

// GOOD
<div className="w-full sm:w-80">

// GOOD (when exact width needed)
<div className="w-[min(320px,calc(100vw-2rem))] sm:w-80">
```

### Regla 5: Typography Scaling

Headings must scale with breakpoints:

| Element | Mobile (base) | Tablet (`sm:`) | Desktop (`md:`) |
|---------|---------------|----------------|-----------------|
| Page title | `text-xl` | `text-2xl` | `text-3xl` |
| Section heading | `text-lg` | `text-xl` | `text-2xl` |
| Card heading | `text-base` | `text-lg` | — |
| Body text | `text-sm` | `text-base` | — |

### Regla 6: Grid Collapse Pattern

All grids must collapse on mobile:

```tsx
// BAD
<div className="grid grid-cols-3 gap-6">

// GOOD
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
```

### Regla 7: Shared Hook for JS Breakpoints

Use `useResponsiveLayout` from `@shared/hooks/useResponsiveLayout` for JavaScript-based responsive logic. Never use `window.innerWidth` or `window.innerHeight` directly:

```tsx
// BAD
if (window.innerWidth >= 1024) { ... }

// GOOD
const { isDesktop } = useResponsiveLayout();
if (isDesktop) { ... }
```

### Regla 8: Inline Styles for Layout Prohibited

Never use inline `style={{ maxHeight: ... }}` or `style={{ height: ... }}` for responsive layout. Use Tailwind classes:

```tsx
// BAD
<div style={{ maxHeight: '260px' }}>

// GOOD
<div className="max-h-[40vh] sm:max-h-[260px]">
```

---

## Alternatives Considered

### Alternativa 1: Custom CSS Breakpoint System

Define custom breakpoints via Tailwind config that differ from defaults.

**Pros:** Could match exact device targets.
**Cons:** Breaks developer familiarity, increases learning curve, incompatible with Tailwind documentation examples.

**Decision:** Rejected. Tailwind defaults are well-tested and widely understood.

### Alternativa 2: Container Queries Only

Use CSS `@container` queries instead of viewport breakpoints.

**Pros:** Component-based responsive behavior.
**Cons:** Limited browser support in target audience (schools), harder to reason about, doesn't solve JS breakpoint needs.

**Decision:** Rejected for now. May adopt incrementally in future.

### Alternativa 3: Separate Mobile App

Build a separate mobile-optimized app instead of making the web app responsive.

**Pros:** Optimal mobile experience.
**Cons:** Doubles codebase, doubles maintenance, contradicts monorepo strategy.

**Decision:** Rejected. Responsive web is the appropriate approach for this educational platform.

---

## Consequences

### Positivas

1. **Consistent mobile experience:** All 4 portals share the same responsive infrastructure and patterns.
2. **WCAG compliance:** 44x44px touch targets meet accessibility requirements for mobile users.
3. **Developer clarity:** Single hook, clear breakpoint rules, documented patterns reduce decision fatigue.
4. **No viewport overflow:** Width floor pattern (`calc(100vw-2rem)`) prevents horizontal scrolling on any screen size.
5. **Progressive enhancement:** Mobile-first means base styles work on all devices, breakpoints add complexity upward.

### Negativas

1. **Migration effort:** ~50-70 files need modifications to adopt new patterns.
2. **Slightly more verbose Tailwind classes:** `p-4 sm:p-6 md:p-8` vs `p-8` adds characters.
3. **Hook overhead:** `useResponsiveLayout` adds a resize listener per consuming component (mitigated by debounce).

---

## Dependencies

| Dependencia | Tipo | Estado | Descripcion |
|-------------|------|--------|-------------|
| ADR-048 | Relacionado | Accepted | Component Sharing Strategy — hook promotion follows sharing pattern |
| ADR-049 | Relacionado | Accepted | ConfirmDialog consolidation — button stacking pattern applies |
| Tailwind CSS 4 | Dependencia | Activo | Breakpoint system and utility classes |
| shared/hooks/useResponsiveLayout | Entregable | Creado | Shared responsive hook with debounce |
| ESTANDAR-FRONTEND-RESPONSIVE.md | Entregable | Creado | Responsive design standard document |

---

## References

- `apps/frontend/src/shared/hooks/useResponsiveLayout.ts` — Shared responsive hook
- `apps/frontend/src/shared/components/common/Modal.tsx` — Base modal with responsive improvements
- `docs/40-standards/ESTANDAR-FRONTEND-RESPONSIVE.md` — Responsive design standard
- [WCAG 2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)

---

**Estado:** Aceptada
**Date Created:** 2026-02-26
**Last Updated:** 2026-02-26
**Supersedes:** N/A
**Superseded by:** N/A
