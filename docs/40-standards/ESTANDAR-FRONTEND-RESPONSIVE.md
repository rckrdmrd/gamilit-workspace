---
titulo: Estandar Frontend - Responsive Design Patterns
tipo: estandar-proyecto
version: 1.2.0
fecha_creacion: 2026-02-26
ultima_actualizacion: 2026-03-03
---

# ESTANDAR-FRONTEND-RESPONSIVE: Responsive Design Patterns

**Version:** 1.2.0
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

> **Ver tambien:** [ESTANDAR-FRONTEND-MODAL-RESPONSIVE.md](./ESTANDAR-FRONTEND-MODAL-RESPONSIVE.md) para reglas especificas de modales responsive, incluyendo scroll wrappers, grid collapse, y patrones de full-bleed content.

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

// CORRECT: reactive hook (viewport-based)
const { isDesktop } = useResponsiveLayout();
if (isDesktop) { ... }
```

### 6.1 Element-Dimension Sizing (Container Queries)

For components that must fit within a specific container (e.g., grid-based exercise mechanics),
use `useContainerSize` instead of `useResponsiveLayout`:

```tsx
import { useContainerSize } from '@/shared/hooks';

const [containerRef, containerSize] = useContainerSize<HTMLDivElement>();
const cellSize = Math.max(MIN, Math.min(MAX, Math.floor((containerSize.width - gaps) / numCols)));

// Attach ref to the measured container + add min-w-0 to allow shrinking
<div ref={containerRef} className="lg:col-span-2 min-w-0">
  <div className={gridNeedsScroll ? 'overflow-x-auto' : ''}>
    <Grid cellSize={cellSize} />
  </div>
</div>
```

| Hook | Measures | Use Case |
|------|----------|----------|
| `useResponsiveLayout` | Viewport width | Layout decisions (show/hide sidebar, stack columns) |
| `useContainerSize` | Element dimensions (ResizeObserver) | Dynamic cell/item sizing within a container |

**Consumers:** CrucigramaExercise, SopaLetrasExercise (grid cell sizing)

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

## 10. Breakpoints Consolidados del Proyecto

Tabla maestra unificada. Los tres sistemas coexisten con propositos distintos.

### Tabla Maestra

| Nivel | Sistema | Token / API | Valor | Uso Tipico |
|-------|---------|-------------|-------|------------|
| Mobile base | Tailwind CSS | (sin prefijo) | 0px+ | Estilos default mobile-first |
| Large phone | Tailwind CSS | `sm:` | 640px+ | Stack a horizontal, fuente +1 size |
| Tablet portrait | Tailwind CSS | `md:` | 768px+ | Grid 2-cols, padding mayor |
| Laptop / tablet landscape | Tailwind CSS | `lg:` | 1024px+ | Grid 3-cols, sidebar visible |
| Desktop | Tailwind CSS | `xl:` | 1280px+ | Layout completo |
| Wide desktop | Tailwind CSS | `2xl:` | 1536px+ | Espaciado extra, max-width contenedor |
| Mobile (JS) | useResponsiveLayout | `isMobile` | < 768px | Renderizado condicional de componentes |
| Tablet (JS) | useResponsiveLayout | `isTablet` | 768-1023px | Layouts alternativos |
| Desktop (JS) | useResponsiveLayout | `isDesktop` | 1024-1399px | Features de escritorio |
| Wide (JS) | useResponsiveLayout | `isWide` | >= 1400px | Paneles expandidos |
| Container | useContainerSize | `containerSize` | dinamico | Sizing interno de celdas/grids |

### Diferencia Intencional entre CSS y JS

Los breakpoints JS (`useResponsiveLayout`) difieren de Tailwind intencionalmente:

```yaml
RAZON_DIFERENCIA:
  tailwind: "Define ESTILOS — opera en CSS, no necesita re-render"
  js_hook: "Define RENDERIZADO CONDICIONAL — controla que componentes montar"

  ejemplo:
    tailwind: "Ocultar sidebar con hidden lg:block"
    js_hook: "Montar <DesktopSidebar> vs <MobileDrawer> (distinto DOM)"

  NO_HACER: "Duplicar logica CSS en JS o viceversa"
  HACER: "CSS para estilos responsive, JS para renderizado condicional"
```

### Breakpoints NO Personalizados en Tailwind Config

El archivo `tailwind.config.js` usa breakpoints DEFAULT de Tailwind (no hay override en `theme.extend.screens`). Las customizaciones del proyecto son solo colores, sombras, fuentes y animaciones.

---

## 11. Cross-References con Otros Estandares

Este estandar define los PATRONES BASE de responsive design. Estandares especializados extienden estas reglas:

| Estandar | Archivo | Que cubre | Como extiende este estandar |
|----------|---------|-----------|----------------------------|
| Modal Responsive | `ESTANDAR-FRONTEND-MODAL-RESPONSIVE.md` | Scroll wrappers, grid collapse, touch targets en modales | Reglas 1-5 para Modal.tsx consumers |
| Card Truncation | `ESTANDAR-FRONTEND-CARD-TRUNCATION.md` | `line-clamp-N` + `title=` tooltip en cards | Extiende Seccion 2.2 (Typography) |

### Jerarquia de Aplicacion

```
ESTANDAR-FRONTEND-RESPONSIVE.md     <- BASE (este documento)
  +-- ESTANDAR-FRONTEND-MODAL-RESPONSIVE.md   <- Para modales
  +-- ESTANDAR-FRONTEND-CARD-TRUNCATION.md    <- Para cards
```

En caso de conflicto, el estandar especializado tiene precedencia para su dominio.

---

## 12. Integracion con detective-theme.css

**Archivo:** `apps/frontend/src/shared/styles/detective-theme.css`

Clases CSS que implementan patrones de este estandar como utilidades reutilizables:

### Clases Disponibles

| Clase CSS | Patron que implementa | Equivalente Tailwind |
|-----------|-----------------------|-----------------------|
| `.touch-target` | Touch targets WCAG 2.5.5 (Sec. 4) | `min-w-[44px] min-h-[44px] inline-flex items-center justify-center` |
| `.responsive-padding` | Padding responsive (Sec. 2.3) | `p-4 sm:p-6 md:p-8` |
| `.modal-content-responsive` | Modal scroll height (Sec. 3) | `max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto` |

### Clases Referenciadas en Modal Standard (Pendientes en CSS)

Las siguientes clases estan en `ESTANDAR-FRONTEND-MODAL-RESPONSIVE.md` pero aun no implementadas en `detective-theme.css`. Usar Tailwind inline hasta que se agreguen:

| Clase (futura) | Equivalente Tailwind actual |
|----------------|-----------------------------|
| `.modal-scroll-mobile` | `max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto` |
| `.modal-grid-responsive-2` | `grid grid-cols-1 sm:grid-cols-2 gap-4` |
| `.modal-grid-responsive-3` | `grid grid-cols-1 sm:grid-cols-3 gap-4` |
| `.modal-grid-responsive-4` | `grid grid-cols-2 sm:grid-cols-4 gap-4` |

---

**References:**
- ADR-050: Responsive Design Strategy
- `shared/hooks/useResponsiveLayout.ts` — Viewport-based responsive hook
- `shared/hooks/useContainerSize.ts` — Element-dimension sizing hook (ResizeObserver)
- `shared/components/common/Modal.tsx` — Base modal
- `shared/styles/detective-theme.css` — CSS utilities
- `docs/40-standards/ESTANDAR-FRONTEND-MODAL-RESPONSIVE.md` — Modal-specific responsive rules
- `docs/40-standards/ESTANDAR-FRONTEND-CARD-TRUNCATION.md` — Card text truncation standard
