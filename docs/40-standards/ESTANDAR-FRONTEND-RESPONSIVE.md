---
titulo: Estandar Frontend - Responsive Design Patterns
tipo: estandar-proyecto
version: 1.0.0
fecha_creacion: 2026-02-26
ultima_actualizacion: 2026-02-27
---

# ESTANDAR-FRONTEND-RESPONSIVE: Responsive Design Patterns

**Version:** 1.0.0
**Date:** 2026-02-26
**ADR:** ADR-050 (Responsive Design Strategy)
**Stack:** Tailwind CSS 4 + React 19

## 1. Breakpoint System

### CSS Breakpoints (Tailwind — mobile-first)

| Token | Min-width | Target |
|-------|-----------|--------|
| (base) | 0px | Mobile (320-639px) |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets portrait |
| `lg:` | 1024px | Tablets landscape / laptops |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Wide desktop |

### JavaScript Breakpoints (useResponsiveLayout)

```tsx
import { useResponsiveLayout, BREAKPOINTS } from '@shared/hooks/useResponsiveLayout';

const { isMobile, isTablet, isDesktop, isWide, breakpoint } = useResponsiveLayout();
// BREAKPOINTS: { mobile: 768, tablet: 1024, desktop: 1400 }
```

---

## 2. Core Patterns

### 2.1 Width Constraints

```tsx
// PROHIBITED: fixed width without mobile floor
<div className="w-80">

// CORRECT: responsive width
<div className="w-full sm:w-80">

// CORRECT: viewport-safe fixed width
<div className="w-[min(320px,calc(100vw-2rem))]">
```

### 2.2 Typography Scaling

```tsx
// PROHIBITED
<h1 className="text-3xl">

// CORRECT
<h1 className="text-xl sm:text-2xl md:text-3xl">
```

| Element | Base | `sm:` | `md:` |
|---------|------|-------|-------|
| Page title | `text-xl` | `text-2xl` | `text-3xl` |
| Section heading | `text-lg` | `text-xl` | `text-2xl` |
| Card heading | `text-base` | `text-lg` | — |

### 2.3 Padding Responsive

```tsx
// PROHIBITED: fixed large padding
<div className="p-8">

// CORRECT: responsive padding
<div className="p-4 sm:p-6 md:p-8">
```

### 2.4 Grid Collapse

```tsx
// PROHIBITED: fixed grid on mobile
<div className="grid grid-cols-3 gap-6">

// CORRECT: mobile-first collapse
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
```

### 2.5 Gap/Spacing Responsive

```tsx
// PROHIBITED: large gap without scaling
<div className="flex gap-6">

// CORRECT: responsive gap
<div className="flex gap-3 sm:gap-4 md:gap-6">
```

---

## 3. Modal Pattern

All modals using `shared/components/common/Modal.tsx` automatically receive:
- Viewport-safe max-width: `max-w-[calc(100vw-2rem)]` on mobile
- Responsive content height: `max-h-[calc(100vh-120px)]` mobile, `max-h-[calc(100vh-200px)]` desktop
- 44x44px close button tap target

Custom modals must follow the same patterns:

```tsx
// Modal padding
<div className="p-4 sm:p-6 md:p-8">

// Button stacking
<div className="flex flex-col-reverse sm:flex-row gap-3">

// Close button
<button className="flex items-center justify-center rounded-full p-2 min-w-[44px] min-h-[44px] touch-manipulation">
  <X size={24} />
</button>
```

---

## 4. Touch Targets (WCAG 2.5.5)

All interactive elements must be at least **44x44px**:

```tsx
// Icon buttons
<button className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation">

// CSS utility class
<button className="touch-target">
```

---

## 5. Inline Styles Prohibited

```tsx
// PROHIBITED: inline maxHeight
<div style={{ maxHeight: '260px' }}>

// CORRECT: Tailwind classes
<div className="max-h-[40vh] sm:max-h-[260px]">
```

---

## 6. JavaScript Responsive

```tsx
// PROHIBITED: direct window access
if (window.innerWidth >= 1024) { ... }

// CORRECT: reactive hook
const { isDesktop } = useResponsiveLayout();
if (isDesktop) { ... }
```

---

## 7. Anti-patterns Checklist

| Anti-pattern | Fix |
|-------------|-----|
| `w-80` without responsive | `w-full sm:w-80` |
| `p-8` alone | `p-4 sm:p-6 md:p-8` |
| `text-2xl` alone on headings | `text-lg sm:text-xl md:text-2xl` |
| `grid-cols-3` without collapse | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| `gap-6` alone | `gap-3 sm:gap-4 md:gap-6` |
| `style={{ maxHeight }}` | Tailwind `max-h-[...]` classes |
| `window.innerWidth` | `useResponsiveLayout()` |
| Close button <44px | `min-w-[44px] min-h-[44px] p-2` |
| `space-x-6` alone | `gap-3 sm:gap-4 md:gap-6` (flex + gap) |

---

## 8. CSS Utility Classes

Available in `shared/styles/detective-theme.css`:

| Class | Purpose |
|-------|---------|
| `.touch-target` | 44x44px minimum with centering and `touch-action: manipulation` |
| `.responsive-padding` | `1rem` → `1.5rem` (sm) → `2rem` (md) |
| `.modal-content-responsive` | `calc(100vh-120px)` → `calc(100vh-200px)` (sm) |

---

## 9. Testing Checklist

Test all responsive changes at these viewports:

| Device | Width | Priority |
|--------|-------|----------|
| iPhone SE | 375px | Critical |
| iPhone 14 | 390px | High |
| iPad Mini | 768px | High |
| iPad Pro | 1024px | Medium |
| Laptop | 1280px | Medium |
| Desktop | 1920px | Low |

---

**References:**
- ADR-050: Responsive Design Strategy
- `shared/hooks/useResponsiveLayout.ts` — Canonical hook
- `shared/components/common/Modal.tsx` — Base modal
- `shared/styles/detective-theme.css` — CSS utilities
