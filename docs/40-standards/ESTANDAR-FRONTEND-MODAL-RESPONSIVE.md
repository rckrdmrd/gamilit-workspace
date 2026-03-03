---
title: "Estandar Frontend - Modal Responsive"
tipo: estandar-proyecto
version: "1.0.0"
fecha_creacion: 2026-03-01
ultima_actualizacion: 2026-03-01
estado: activo
category: frontend-standards
related:
  - ESTANDAR-FRONTEND-RESPONSIVE.md
  - ADR-050
---

# ESTANDAR-FRONTEND-MODAL: Modal Responsive Design

**Version:** 1.0.0
**Date:** 2026-03-01
**ADR:** ADR-050 (Responsive Design Strategy)
**Stack:** Tailwind CSS 4 + React 19
**Related:** [ESTANDAR-FRONTEND-RESPONSIVE.md](./ESTANDAR-FRONTEND-RESPONSIVE.md)

## Proposito

Garantizar que TODOS los modales/dialogs sean usables en pantallas pequenas (320px+), cumpliendo con WCAG 2.5.5 touch targets y evitando overflow de contenido. Este estandar completa las reglas generales de responsive design del sistema con patrones especificos para modales.

---

## 1. Scroll Wrapper Obligatorio (Regla 1)

Todo modal con `contentClassName="custom"` DEBE proveer su propio scroll wrapper en el div de contenido mas externo:

```tsx
// CORRECTO — scroll wrapper explícito
<Modal contentClassName="custom" title="Ejemplo" isOpen={isOpen} onClose={onClose}>
  <div className="max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto">
    {/* contenido — puede ser largo sin quebrar layout */}
  </div>
</Modal>

// INCORRECTO — sin protección de scroll, contenido puede desbordarse
<Modal contentClassName="custom" title="Ejemplo" isOpen={isOpen} onClose={onClose}>
  <div className="p-6">
    {/* contenido largo desborda el modal */}
  </div>
</Modal>
```

**Razon:** El componente base `Modal.tsx` provee scroll wrapper built-in para casos estandar, pero cuando se usa `contentClassName="custom"`, el padding/styling customizado bypasea las protecciones por defecto. Sin scroll wrapper explícito, contenido largo puede salir del viewport en pantallas pequenas.

**Base modal default:** `max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-200px)]`

---

## 2. Grids Responsive en Modales (Regla 2)

Todo `grid grid-cols-{N}` (N>=3) dentro de un modal DEBE tener breakpoint responsive que colapse a 1-2 columnas en mobile:

```tsx
// CORRECTO — grid responsive, 1 col mobile → 3 cols en sm
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>

// CORRECTO — grid 2-col mobile, 4 cols en sm (para stats/badges)
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  {stats.map(stat => <StatTile key={stat.id} {...stat} />)}
</div>

// INCORRECTO — 4 columnas fijas en 320px causa horizontal scroll
<div className="grid grid-cols-4 gap-3">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>

// INCORRECTO — 3 columnas fijas sin breakpoint
<div className="grid grid-cols-3 gap-4">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>
```

**Excepcion:** Grids de avatares/iconos donde multi-columna intencional en mobile:
- AvatarSelectionModal: grid-cols-3 base es aceptable (24-32px avatares, 3 cols = ~96px + gaps)
- IconPickerModal: grid-cols-4 base es aceptable (16-20px iconos)

**Regla de oro:** Si item width (content + padding) * column_count > 300px en 320px viewport → agregar breakpoint.

---

## 3. Touch Targets WCAG 2.5.5 (Regla 3)

Todo boton interactivo dentro de un modal (close, nav, toggle, submit) DEBE tener minimo **44x44px** de area tactil:

```tsx
// CORRECTO — close button con tap target 44x44px
<button
  onClick={onClose}
  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation"
  aria-label="Cerrar"
>
  <X className="h-5 w-5" />
</button>

// CORRECTO — navigation buttons en footer
<div className="flex gap-3">
  <button className="px-4 py-2 min-h-[44px] flex items-center justify-center rounded-lg">
    Cancelar
  </button>
  <button className="px-4 py-2 min-h-[44px] flex items-center justify-center rounded-lg bg-blue-600">
    Aceptar
  </button>
</div>

// INCORRECTO — solo 20px de area tactil en close button
<button onClick={onClose} className="p-1">
  <X className="h-5 w-5" />
</button>

// INCORRECTO — solo 32px height en boton
<button className="px-3 py-1 rounded text-sm">
  Cancelar
</button>
```

**Verificacion:** `min-w` + `min-h` + `p-` deben sumar minimo 44px en ambas dimensiones.

**Utilities:**
- `.touch-target` — 44x44px built-in (verficiar en detective-theme.css)
- Add `touch-manipulation` para desabilitar 300ms tap delay en mobile

---

## 4. Tamaños Fijos Responsive (Regla 4)

Iconos y elementos decorativos grandes (>=48px) DEBEN tener breakpoint responsive para no dominar pantallas pequenas:

```tsx
// CORRECTO — icono responsive
<CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />

// CORRECTO — imagen avatar responsive
<img src={avatar} className="w-8 h-8 sm:w-12 sm:h-12 rounded-full" alt="Avatar" />

// INCORRECTO — 64px fijo en mobile (23% del width en 320px)
<CheckCircle className="w-16 h-16" />

// INCORRECTO — 96px fijo
<LargeIcon className="w-24 h-24" />
```

**Heuristica:** Icons >=48px en mobile son aceptables solo si son:
- Centro de attention (hero icon en success modal)
- Decorativos (no 100% del layout)

**Recommended:**
- 320px viewport: 12-16px (text), 24-32px (icons), 48px (hero)
- 640px viewport: 16-20px (text), 32-40px (icons), 64px (hero)
- 768px viewport: 20-24px (text), 40-48px (icons), 80px (hero)

---

## 5. Modales showCloseButton={false} (Regla 5)

Modales con `showCloseButton={false}` y wrapper `-mx-6 -my-4` (para full-bleed content) DEBEN agregar constraints al wrapper:

```tsx
// CORRECTO — wrapper con protecciones
<Modal
  showCloseButton={false}
  contentClassName="!p-0"
  isOpen={isOpen}
  onClose={onClose}
>
  <div className="-mx-6 -my-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
    <DetectiveCard>
      {/* full-bleed content */}
    </DetectiveCard>
  </div>
</Modal>

// INCORRECTO — sin max-height ni scroll
<Modal showCloseButton={false} contentClassName="!p-0" isOpen={isOpen} onClose={onClose}>
  <div className="-mx-6 -my-4">
    <DetectiveCard>
      {/* puede desbordarse */}
    </DetectiveCard>
  </div>
</Modal>
```

**Nota:** `max-h-[calc(100vh-4rem)]` = modal position offset (42-48px top/bottom) para dejar espacio.

---

## 6. CSS Utilities Disponibles

Verificar en `apps/frontend/src/shared/styles/detective-theme.css`:

| Utility | Purpose | Responsive |
|---------|---------|------------|
| `.touch-target` | 44x44px minimum + centering + touch-manipulation | No |
| `.modal-scroll-mobile` | max-h + overflow-y-auto (if exists) | Yes |
| `.modal-grid-responsive-2` | grid-cols-1 sm:grid-cols-2 (if exists) | Yes |
| `.modal-grid-responsive-3` | grid-cols-1 sm:grid-cols-3 (if exists) | Yes |
| `.modal-grid-responsive-4` | grid-cols-2 sm:grid-cols-4 (if exists) | Yes |
| `.modal-content-responsive` | Hereda de base modal (if exists) | Yes |

> **Nota:** Si utilities no existen, usar inline Tailwind classes (clase 1 + 2 no son problematicas si son cortas).

---

## 7. Modal Title Responsive (Bonus)

Titulos en modales deben escalar como headings en otros contextos:

```tsx
// CORRECTO
<Modal title="Titulo del Modal">
  {/* title internally uses text-lg sm:text-xl */}
</Modal>

// Si titulo es customizado:
<div className="text-base sm:text-lg font-semibold">
  Mi Titulo
</div>

// INCORRECTO — fixed text-2xl
<div className="text-2xl font-semibold">
  Mi Titulo (demasiado grande en mobile)
</div>
```

---

## 8. Content Padding Responsive en Full-Bleed (Bonus)

Si modal tiene contenido full-bleed (ej: DetectiveCard, AccordionCard):

```tsx
// CORRECTO — padding responsive en contenedor interno
<Modal contentClassName="!p-0">
  <div className="p-4 sm:p-6 md:p-8">
    <Card>{/* content */}</Card>
  </div>
</Modal>

// CORRECTO — si Card maneja su padding, no duplicar
<Modal contentClassName="!p-0">
  <DetectiveCard>{/* DetectiveCard ya tiene padding */}</DetectiveCard>
</Modal>
```

---

## 9. Checklist de Verificacion

Para TODA creacion/modificacion de modal, verificar:

- [ ] Modal con `contentClassName="custom"` tiene scroll wrapper (`max-h-[calc(100vh-...)] overflow-y-auto`)
- [ ] Grids N>=3 tienen breakpoint responsive (`grid-cols-1 sm:grid-cols-{N}`)
- [ ] Close/nav/submit buttons tienen `min-w-[44px] min-h-[44px]` O usan `.touch-target`
- [ ] Iconos decorativos >=48px tienen breakpoint responsive (`w-12 h-12 sm:w-16 sm:h-16`)
- [ ] `showCloseButton={false}` wrappers tienen `max-h-[calc(100vh-...)] overflow-y-auto`
- [ ] Titulo modal no es `text-2xl+` directamente (herada de Modal base o responsive)
- [ ] No hay inline `style={{ maxHeight, width, padding }}` — usar Tailwind
- [ ] Tested en 320px, 375px, 768px, 1024px viewports (inspector device emulation)

---

## 10. Testing Checklist

Viewport criticos para modales:

| Device | Width | Test Focus | Priority |
|--------|-------|------------|----------|
| iPhone SE | 375px | Grid collapse, button sizing, scroll | Critical |
| iPhone 14 | 390px | Touch targets, padding | High |
| iPad Mini | 768px | Column expansion | High |
| iPad Pro | 1024px | Full-width modal width | Medium |

---

## 11. Anti-patterns Modal

| Anti-pattern | Fix |
|-------------|-----|
| `contentClassName="custom"` sin scroll wrapper | Agregar `<div className="max-h-[calc(100vh-120px)] overflow-y-auto">` |
| `grid grid-cols-4` fijo | `grid grid-cols-2 sm:grid-cols-4` |
| Close button `p-1` | `p-2 min-w-[44px] min-h-[44px]` |
| Icon 64px fijo | `w-16 h-16 sm:w-20 sm:h-20` |
| `showCloseButton={false}` sin max-h | Agregar `max-h-[calc(100vh-4rem)]` |
| Title `text-2xl` | Usar `.text-lg sm:text-xl` |
| Padding `-mx-6 -my-4` sin proteccion | Agregar `max-h-[...] overflow-y-auto` |

---

## 12. Referencias y Dependencias

- **ADR-050:** [Responsive Design Strategy](../../90-adr/ADR-050-responsive-design-strategy.md)
- **ESTANDAR-FRONTEND-RESPONSIVE.md:** [Estandar general responsive](./ESTANDAR-FRONTEND-RESPONSIVE.md)
- **Base Component:** `apps/frontend/src/shared/components/common/Modal.tsx`
- **Responsive Hook:** `apps/frontend/src/shared/hooks/useResponsiveLayout.ts`
- **CSS Utilities:** `apps/frontend/src/shared/styles/detective-theme.css`
- **WCAG 2.5.5:** [Target Size (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/target-size-enhanced)

---

## 13. Adopcion Gradual

Este estandar se aplica a:

1. **NEW modales** (100% compliance requerido)
2. **Modales existentes modificados** (100% compliance requerido)
3. **Modales legacy sin cambio** (no requieren refactoring — backlog futuro)

**Ejemplo legacy que seguir:**
- `ConfirmModal` — Ya compliant (built-in scroll, touch targets)
- `AvatarSelectionModal` — Ya compliant (grid-cols-3 intencional)

---

## 14. Regla R-MODAL-06: Content-Fit Mobile

Modales con contenido rico (score, rewards, stats, achievements) DEBEN usar valores compactos en mobile con preservación desktop via `sm:`.

### Patrón

| Elemento | Mobile (base) | Desktop (`sm:`) |
|----------|--------------|-----------------|
| DetectiveCard padding | `padding="sm"` | (built-in `sm:p-6`) |
| max-h offset | `calc(100vh-80px)` | `calc(100vh-200px)` |
| Iconos principales | `w-8 h-8` | `sm:w-16 sm:h-16` |
| Títulos | `text-lg` | `sm:text-2xl` |
| Mensajes | `text-sm` | `sm:text-base` |
| Secciones padding | `p-3` | `sm:p-6` |
| Valores numéricos | `text-xl` | `sm:text-3xl` |
| Gaps entre secciones | `space-y-2` | `sm:space-y-4` |
| Márgenes inferiores | `mb-3` | `sm:mb-6` |
| Botones | `size="md"` | (responde nativamente) |

### Referencia canónica

- `FeedbackModal.tsx` — modal de completion usado por las 29 mecánicas de ejercicio
- `CompletionModalSections.tsx` — 6 subcomponentes (ScoreDisplay, Rewards, Stats, RankUp, Streak, Achievements)

### Budget de altura (iPhone SE: 375×667px)

- Flex container: `667px - 40px offset = 627px`
- Button footer (flex-shrink-0): `96px` (2 buttons 88px + pt-2 8px)
- Scroll area disponible: `627px - 96px = 531px`
- Contenido tipico (icon + title + msg + score + rewards + stats): ~464-484px — **margen 47-67px**
- Escenario maximo (+ rank-up + streak + achievements): usa overflow-y-auto — botones siempre visibles (R-MODAL-06b)

---

## 15. Regla R-MODAL-06b: Sticky Button Footer

Cuando los botones de accion consumen >80px del budget de scroll, moverlos FUERA del scroll container usando flex-column:

| Capa | Clases | Proposito |
|------|--------|-----------|
| Flex container | `flex flex-col max-h-[calc(100vh-{offset})]` | Restriccion de altura + layout columna |
| Scroll area | `flex-1 min-h-0 overflow-y-auto` | Contenido scrolleable, se encoge al espacio disponible |
| Button footer | `flex-shrink-0 pt-2 sm:pt-3` | Posicion fija debajo del scroll |

**Estructura:**

```tsx
<Card padding="sm">
  <div className="flex flex-col max-h-[calc(100vh-40px)] sm:max-h-[calc(100vh-80px)]">
    <div className="flex-1 min-h-0 overflow-y-auto">
      {/* Contenido scrolleable */}
    </div>
    <div className="flex-shrink-0 pt-2 sm:pt-3">
      {/* Botones — siempre visibles */}
    </div>
  </div>
</Card>
```

**Calculo de offset:**
- Mobile: card padding (p-2=16px) + card border (2px) + safety (~22px) = 40px
- Desktop: card padding (sm:p-4=32px) + card border (2px) + buffer (~46px) = 80px

**Cuando aplicar:** Modales con score + rewards + stats + botones donde el contenido total excede ~500px en iPhone SE. Sintoma: scroll aparece con margen <40px.

**Clave tecnica:** `min-h-0` en el scroll area es CRITICO — sin esto, flex items no se encogen por debajo del content size y `overflow-y-auto` no se activa.

**Referencia canonica:** `FeedbackModal.tsx`

---

## Versionado

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-03-03 | Added Regla R-MODAL-06b: Sticky Button Footer — structural fix for buttons outside scroll |
| 1.1.0 | 2026-03-03 | Added Regla R-MODAL-06: Content-Fit Mobile pattern for rich modals (FeedbackModal canonical reference) |
| 1.0.0 | 2026-03-01 | Initial release: 5 core rules + CSS utilities + checklist |
