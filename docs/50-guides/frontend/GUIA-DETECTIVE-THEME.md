---
titulo: Guia del Sistema de Tema Detective
version: 1.1.0
fecha_creacion: 2026-02-20
fecha_actualizacion: 2026-02-20
tags: [frontend, css, tailwind, tema, detective, design-system]
aplica_a: [frontend]
estado: vigente
---

# GUIA-DETECTIVE-THEME.md — Sistema de Tema Detective

**Version:** 1.1.0 | **Fecha:** 2026-02-20

---

## 1. Arquitectura del Tema

El tema Detective de GAMILIT se construye en tres capas que trabajan juntas:

1. **CSS custom properties (`--detective-*`)** — Definidas en `:root` dentro de `index.css`. Son las variables de bajo nivel que alimentan tanto las clases CSS como las utilidades Tailwind.
2. **Tailwind config (`tailwind.config.js`)** — Extiende `theme.extend.colors` con tokens `detective-*` y `rank-*` que mapean a los mismos valores hex. Esto genera utilidades como `bg-detective-orange`, `text-detective-text`, etc.
3. **detective-theme.css** — Clases CSS puras (`.btn-detective`, `.detective-card`, `.rank-badge-*`, etc.) que consumen las custom properties y proveen estilos compuestos que no se expresan facilmente como utilidades Tailwind.

### Orden de importacion en `index.css`

```css
@import "tailwindcss";              /* 1. Base, components, utilities de Tailwind */
@config "../../../tailwind.config.js"; /* 2. Config con tokens detective */
@import "./detective-theme.css";     /* 3. Clases compuestas del tema */

:root {
  /* 4. CSS custom properties (--detective-*, --rank-*, --shadow-*) */
}
```

**Especificidad:** Las clases de `detective-theme.css` se cargan despues de Tailwind, por lo que prevalecen cuando hay conflicto en la misma propiedad. Esto es intencional: las clases `.btn-detective` y `.detective-card` definen estilos completos que no deben ser sobreescritos accidentalmente por utilidades Tailwind.

### Componentes React Wrapper

El tema tiene componentes React que encapsulan las clases CSS:

| Componente | Ruta | Proposito |
|------------|------|-----------|
| `DetectiveButton` | `@shared/components/base/DetectiveButton.tsx` | Botones con variantes, tamanos, iconos y estado loading |
| `DetectiveCard` | `@shared/components/base/DetectiveCard.tsx` | Cards con variantes, padding controlado y hover animado |
| `InputDetective` | `@shared/components/base/InputDetective.tsx` | Inputs con label, validacion, iconos y helper text |
| `ProgressBar` | `@shared/components/base/ProgressBar.tsx` | Barras de progreso animadas con variantes detective/xp |
| `RankBadge` | `@shared/components/base/RankBadge.tsx` | Badge de rango maya con gradiente y animacion |
| `LoadingOverlay` | `@shared/components/loading/LoadingOverlay.tsx` | Overlay de carga (full/inline) con spinner |
| `Skeleton*` | `@shared/components/loading/SkeletonCard.tsx` | 8 variantes de skeleton loading |

---

## 2. Variables CSS

Todas las variables se definen en `:root` dentro de `index.css` y se replican como colores Tailwind en `tailwind.config.js`.

### Colores Principales

| Variable CSS | Tailwind Utility | Valor | Uso |
|-------------|-----------------|-------|-----|
| `--detective-orange` | `bg-detective-orange` | `#f97316` | Color primario, CTAs |
| `--detective-orange-dark` | `bg-detective-orange-dark` | `#ea580c` | Hover del primario |
| `--detective-blue` | `bg-detective-blue` | `#1e3a8a` | Acento secundario, headers |
| `--detective-gold` | `bg-detective-gold` | `#f59e0b` | XP, logros, premios |

### Tonos Naranja Adicionales (solo Tailwind)

| Tailwind Utility | Valor | Uso |
|-----------------|-------|-----|
| `bg-detective-orange-300` | `#fdba74` | Fondos suaves naranja |
| `bg-detective-orange-400` | `#fb923c` | Naranja intermedio |
| `bg-detective-orange-700` | `#c2410c` | Naranja oscuro, pressed states |
| `text-detective-yellow` | `#fbbf24` | Estrellas, destacados |

### Fondos

| Variable CSS | Tailwind Utility | Valor | Uso |
|-------------|-----------------|-------|-----|
| `--detective-bg` | `bg-detective-bg` | `#fffbeb` | Fondo principal de pagina |
| `--detective-bg-secondary` | `bg-detective-bg-secondary` | `#fef3c7` | Fondo de secciones alternas |
| — | `bg-detective-bg-tertiary` | `#fff7ed` | Fondo terciario |

### Texto

| Variable CSS | Tailwind Utility | Valor | Uso |
|-------------|-----------------|-------|-----|
| `--detective-text` | `text-detective-text` | `#1f2937` | Texto principal (gray-800) |
| `--detective-text-secondary` | `text-detective-text-secondary` | `#6b7280` | Texto secundario (gray-500) |

### Estados

| Variable CSS | Tailwind Utility | Valor | Uso |
|-------------|-----------------|-------|-----|
| `--detective-success` | `text-detective-success` | `#10b981` | Exito (emerald-500) |
| `--detective-danger` | `text-detective-danger` | `#ef4444` | Error (red-500) |
| `--detective-neutral` | `text-detective-neutral` | `#6b7280` | Neutral (gray-500) |

### Card y Bordes

| Tailwind Utility | Valor | Uso |
|-----------------|-------|-----|
| `bg-detective-card` | `#ffffff` | Fondo de card |
| `border-detective-border` | `#e5e7eb` | Borde generico |
| `border-detective-border-light` | `#f3f4f6` | Borde suave |
| `border-detective-border-medium` | `#e5e7eb` | Borde medio |
| `border-detective-border-strong` | `#d1d5db` | Borde fuerte |

### Rangos Maya

| Variable CSS | Tailwind Utility | Valor | Rango |
|-------------|-----------------|-------|-------|
| `--rank-detective-from` | `bg-rank-detective-from` | `#60a5fa` | AJAW (Nivel 1 - Detective Novato) |
| `--rank-detective-to` | `bg-rank-detective-to` | `#2563eb` | |
| `--rank-sargento-from` | `bg-rank-sargento-from` | `#4ade80` | NACOM (Nivel 2 - Sargento) |
| `--rank-sargento-to` | `bg-rank-sargento-to` | `#16a34a` | |
| `--rank-teniente-from` | `bg-rank-teniente-from` | `#fb923c` | AH K'IN (Nivel 3 - Teniente) |
| `--rank-teniente-to` | `bg-rank-teniente-to` | `#ea580c` | |
| `--rank-capitan-from` | `bg-rank-capitan-from` | `#a78bfa` | HALACH UINIC (Nivel 4 - Capitan) |
| `--rank-capitan-to` | `bg-rank-capitan-to` | `#7c3aed` | |
| `--rank-comisario-from` | `bg-rank-comisario-from` | `#f59e0b` | K'UK'ULKAN (Nivel 5 - Comisario) |
| `--rank-comisario-to` | `bg-rank-comisario-to` | `#d97706` | |

### Rareza de Achievements (solo Tailwind)

| Tailwind Utility | Valor | Rareza |
|-----------------|-------|--------|
| `bg-rarity-common` | `#9ca3af` | Comun |
| `bg-rarity-rare` | `#3b82f6` | Raro |
| `bg-rarity-epic` | `#f97316` | Epico |
| `bg-rarity-legendary` | `#f59e0b` | Legendario |

### Sombras (CSS custom properties)

| Variable CSS | Valor |
|-------------|-------|
| `--shadow-detective` | `0 4px 14px 0 rgba(30, 58, 138, 0.25)` |
| `--shadow-gold` | `0 4px 14px 0 rgba(245, 158, 11, 0.25)` |
| `--shadow-orange` | `0 4px 14px 0 rgba(249, 115, 22, 0.25)` |
| `--shadow-card` | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` |
| `--shadow-card-hover` | `0 20px 25px -5px rgba(0, 0, 0, 0.15)` |

### Sombras Tailwind (via config)

| Utilidad | Uso |
|----------|-----|
| `shadow-detective` / `shadow-detective-lg` | Sombra azul detective |
| `shadow-gold` / `shadow-gold-lg` | Sombra dorada |
| `shadow-orange` / `shadow-orange-lg` | Sombra naranja |
| `shadow-card` / `shadow-card-hover` | Sombra generica de card |
| `shadow-card-detective` / `shadow-card-detective-hover` | Sombra de card detective |
| `shadow-glow` / `shadow-glow-strong` | Glow naranja |
| `shadow-gold-glow` / `shadow-gold-glow-strong` | Glow dorado |

---

## 3. Botones (.btn-*)

### Forma preferida: Componente `DetectiveButton`

```tsx
import { DetectiveButton } from '@shared/components/base/DetectiveButton';

// Boton primario (naranja)
<DetectiveButton variant="primary" size="md">
  Iniciar Mision
</DetectiveButton>

// Boton con icono y loading
<DetectiveButton variant="blue" size="lg" leftIcon={<Search />} loading={isLoading}>
  Buscar
</DetectiveButton>

// Variante outline (sin fondo)
<DetectiveButton variant="outline">Cancelar</DetectiveButton>

// Variante ghost (solo texto)
<DetectiveButton variant="ghost">Ver mas</DetectiveButton>
```

**Variantes disponibles:** `primary`, `secondary`, `gold`, `blue`, `green`, `purple`, `danger`, `outline`, `ghost`

**Tamanios:** `sm` (py-1.5 px-3), `md` (py-2 px-4), `lg` (py-3 px-6)

### Clases CSS directas

Cuando se necesita usar la clase CSS directamente (formularios, tablas, componentes legacy):

| Clase | Background | Hover | Uso |
|-------|-----------|-------|-----|
| `.btn-detective` | `linear-gradient(→BR, --detective-orange, --detective-orange-dark)` | `scale(1.05)` + sombra | Accion primaria |
| `.btn-gold` | `#ea580c` | `#f97316` + `scale(1.05)` | Accion secundaria gold |
| `.btn-blue` | `#3b82f6` | `#2563eb` + `scale(1.05)` | Acciones informativas |
| `.btn-green` | `#10b981` | `#059669` + `scale(1.05)` | Confirmaciones, exito |
| `.btn-purple` | `#a855f7` | `#9333ea` + `scale(1.05)` | Acciones especiales |
| `.btn-danger` | `#ef4444` | `#dc2626` + `scale(1.05)` | Acciones destructivas |

### Estados compartidos

- **`:hover`** — `transform: scale(1.05)` + sombra aumentada
- **`:active`** — `transform: scale(0.98)` (solo `.btn-detective` y `.btn-danger`)
- **`:disabled`** — `opacity: 0.5`, `cursor: not-allowed`, `transform: none !important`

### Ejemplo de uso directo de clase CSS

```tsx
// Uso directo en tabla de respuestas
<button
  className="btn-detective inline-flex items-center gap-1 rounded-lg text-sm font-semibold"
  onClick={handleReview}
>
  Revisar
</button>
```

> **IMPORTANTE:** Los botones `.btn-*` definen su propio `padding: 0.5rem 1rem`. NO agregues utilidades Tailwind de padding (`px-*`, `py-*`) cuando uses estas clases directamente, ya que se duplicaria el padding. Si necesitas un padding diferente, usa el componente `DetectiveButton` con la prop `size`.

---

## 4. Cards (.detective-card, .card-*)

### Forma preferida: Componente `DetectiveCard`

```tsx
import { DetectiveCard } from '@shared/components/base/DetectiveCard';

// Card default con padding medio (p-6)
<DetectiveCard>
  <h3>Titulo</h3>
  <p>Contenido</p>
</DetectiveCard>

// Card gold con padding pequenio
<DetectiveCard variant="gold" padding="sm">
  <span>+50 XP</span>
</DetectiveCard>

// Card exercise (hover translateY -4px)
<DetectiveCard variant="exercise" onClick={handleStart}>
  <h3>Sopa de Letras</h3>
</DetectiveCard>

// Card sin hover y sin padding
<DetectiveCard hoverable={false} padding="none">
  <table>...</table>
</DetectiveCard>

// Card estatica (stats dashboard, sin animacion motion.div)
<DetectiveCard hoverable={false} padding="sm">
  <span className="text-detective-2xl font-bold">1,234</span>
  <span className="text-detective-text-secondary">Ejercicios completados</span>
</DetectiveCard>
```

### Variantes de card

| Variante | Clase CSS | Background | Borde | Hover |
|----------|-----------|-----------|-------|-------|
| `default` | `.detective-card` | `white` | `1px solid #fde68a` (amber-200) | `translateY(-2px)` + sombra |
| `gold` | `.card-gold` | `white` | `1px solid #fef3c7` (amber-100) | `translateY(-2px)` + sombra |
| `exercise` | `.card-exercise` | `white` | `2px solid #bfdbfe` (blue-200) | `translateY(-4px)` + borde `#60a5fa` |
| `mystery` | `.card-mystery` | `linear-gradient(145deg, #f8fafc, #e2e8f0)` | `1px solid #cbd5e1` (slate-300) | `translateY(-2px)` + borde `#94a3b8` |
| `info` | `.detective-card` | (igual a default) | | |
| `success` | `.detective-card` | (igual a default) | | |
| `danger` | `.detective-card` | (igual a default) | | |

### Props del componente `DetectiveCard`

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `variant` | `'default' \| 'gold' \| 'exercise' \| 'mystery' \| 'info' \| 'success' \| 'danger'` | `'default'` | Estilo visual |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Padding interno |
| `hoverable` | `boolean` | `true` | Habilita animacion hover via framer-motion |
| `onClick` | `function` | — | Hace la card clickeable (agrega `cursor-pointer`, `role="button"`, `tabIndex=0`) |
| `className` | `string` | — | Clases adicionales |

### Mapeo de padding

| Valor | Clase Tailwind | Tamano |
|-------|---------------|--------|
| `none` | `p-0` | 0 |
| `sm` | `p-4` | 1rem |
| `md` | `p-6` | 1.5rem |
| `lg` | `p-8` | 2rem |
| `xl` | `p-10` | 2.5rem |

> **IMPORTANTE:** Las clases CSS de card (`.detective-card`, `.card-gold`, etc.) NO definen padding. El padding es manejado exclusivamente por el componente `DetectiveCard` via su prop `padding`. Esto permite control granular sin conflictos de especificidad CSS.

---

## 5. Rank Badges (.rank-badge-*)

### Forma preferida: Componente `RankBadge`

```tsx
import { RankBadge } from '@shared/components/base/RankBadge';

<RankBadge rank="detective_novato" />           // Badge azul "Detective Novato"
<RankBadge rank="comisario" size="lg" />         // Badge dorado grande "Comisario"
<RankBadge rank="teniente" animated />           // Badge naranja con pulso
<RankBadge rank="capitan" showIcon={false} />    // Sin icono de corona
```

### Clases CSS

Cada badge es un `inline-flex` con `border-radius: 9999px` (pill), fondo en gradiente y texto blanco.

| Clase | Gradiente | Rango Maya |
|-------|----------|------------|
| `.rank-badge-detective` | `#60a5fa` → `#2563eb` (azul) | AJAW — Detective Novato |
| `.rank-badge-sargento` | `#4ade80` → `#16a34a` (verde) | NACOM — Sargento |
| `.rank-badge-teniente` | `#fb923c` → `#ea580c` (naranja) | AH K'IN — Teniente |
| `.rank-badge-capitan` | `#a78bfa` → `#7c3aed` (morado) | HALACH UINIC — Capitan |
| `.rank-badge-comisario` | `#f59e0b` → `#d97706` (dorado) | K'UK'ULKAN — Comisario |

Los badges `.rank-badge-detective` y `.rank-badge-comisario` incluyen `box-shadow` adicional para destacar los rangos inicial y maximo.

---

## 6. Progress Bars (.progress-*)

### `.progress-detective` (barras genericas)

```html
<div class="progress-detective">
  <div class="progress-fill" style="width: 65%"></div>
</div>
```

- **Contenedor:** fondo `#d1d5db` (gray-300), altura `0.75rem`, border-radius full
- **Fill:** gradiente `#f97316` → `#ea580c` (naranja), transicion `width 0.3s`

### `.progress-xp` (barras de experiencia)

```html
<div class="progress-xp">
  <div class="progress-fill" style="width: 42%"></div>
</div>
```

- **Contenedor:** fondo `#fde68a` (amber-200), altura `0.75rem`, border-radius full
- **Fill:** gradiente `var(--detective-gold)` → `var(--rank-comisario-to)` (dorado), transicion `width 0.5s`

### Componente React `ProgressBar`

**Archivo:** `shared/components/base/ProgressBar.tsx`

Wrapper React con animacion de llenado via `framer-motion`, label opcional y variantes tematicas.

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `progress` | `number` | — | Valor 0-100 (clamp automatico) |
| `variant` | `'detective' \| 'xp'` | `'detective'` | Estilo visual |
| `showLabel` | `boolean` | `false` | Muestra etiqueta y porcentaje encima de la barra |
| `label` | `string` | `'Progreso'` | Texto de la etiqueta |
| `height` | `'sm' \| 'md' \| 'lg'` | `'md'` | Altura: `h-1.5` / `h-2.5` / `h-3` |
| `animated` | `boolean` | `true` | Animacion de llenado con framer-motion |

```tsx
import { ProgressBar } from '@shared/components/base';

// Barra de progreso de modulo con label
<ProgressBar progress={75} variant="detective" showLabel label="Modulo 1" />

// Barra XP grande sin label
<ProgressBar progress={45} variant="xp" height="lg" />

// Barra sin animacion (para renders frecuentes)
<ProgressBar progress={100} animated={false} height="sm" />
```

Incluye atributos ARIA automaticos: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`.

---

## 7. Input Fields (.input-detective)

### Uso basico

```tsx
<input className="input-detective" placeholder="Buscar..." />
<input className="input-detective input-detective-sm" placeholder="Pequenio" />
<input className="input-detective input-detective-lg" placeholder="Grande" />
<textarea className="input-detective w-full resize-vertical" rows={4} />
```

### Tamanios

| Clase | Padding | Font size |
|-------|---------|-----------|
| `.input-detective` (base) | `0.75rem 1rem` | 1rem |
| `.input-detective-sm` | `0.5rem 0.75rem` | 0.875rem |
| `.input-detective-md` | `0.75rem 1rem` | 1rem |
| `.input-detective-lg` | `1rem 1.25rem` | 1.125rem |

### Estados de validacion

| Clase | Borde | Focus ring |
|-------|-------|-----------|
| (normal) | `#d1d5db` (gray-300) | naranja `rgba(249, 115, 22, 0.1)` |
| `.input-detective-error` | `#ef4444` (red-500) | rojo `rgba(239, 68, 68, 0.1)` |
| `.input-detective-success` | `#22c55e` (green-500) | verde `rgba(34, 197, 94, 0.1)` |
| `.input-detective-warning` | `#eab308` (yellow-500) | amarillo `rgba(234, 179, 8, 0.1)` |

### Estado deshabilitado

```css
.input-detective:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f3f4f6; /* gray-100 */
}
```

### Componente React `InputDetective`

**Archivo:** `shared/components/base/InputDetective.tsx`

Wrapper React que encapsula las clases CSS con soporte para label, validacion visual, icono y helper text. Incluye accesibilidad automatica (`aria-invalid`, `aria-describedby`).

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `label` | `string` | — | Label visible asociada al input via `htmlFor` |
| `error` | `string` | — | Mensaje de error (activa borde rojo automaticamente) |
| `success` | `string` | — | Mensaje de exito (activa borde verde) |
| `helperText` | `string` | — | Texto de ayuda debajo del input |
| `icon` | `ReactNode` | — | Icono posicionado a la izquierda (agrega `pl-10` automaticamente) |
| `inputSize` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamano del input |
| `variant` | `'default' \| 'error' \| 'success' \| 'warning'` | `'default'` | Variante visual (auto-detectada si `error` o `success` estan presentes) |

```tsx
import { InputDetective } from '@shared/components/base';
import { Search } from 'lucide-react';

// Con label, icono y helper text
<InputDetective
  label="Buscar ejercicio"
  icon={<Search className="h-4 w-4" />}
  placeholder="Escribe aqui..."
  helperText="Busca por nombre o tema"
/>

// Con validacion de error
<InputDetective
  label="Correo electronico"
  error={errors.email?.message}
  inputSize="lg"
/>
```

### Ejemplo real del codebase

```tsx
{/* FeatureFlagEditor.tsx */}
<input
  className={`input-detective font-mono ${isEditMode ? 'cursor-not-allowed opacity-60' : ''}`}
  value={flagKey}
  disabled={isEditMode}
/>
```

---

## 8. State Utilities (.detective-state-*)

Clases para indicar estados contextuales en contenedores (alertas, badges de estado, notificaciones).

| Clase | Background | Texto | Borde |
|-------|-----------|-------|-------|
| `.detective-state-success` | `rgba(16, 185, 129, 0.1)` | `#10b981` (emerald-500) | `rgba(16, 185, 129, 0.2)` |
| `.detective-state-error` | `rgba(239, 68, 68, 0.1)` | `#ef4444` (red-500) | `rgba(239, 68, 68, 0.2)` |
| `.detective-state-warning` | `rgba(245, 158, 11, 0.1)` | `#1f2937` (gray-800) | `rgba(245, 158, 11, 0.2)` |
| `.detective-state-info` | `rgba(30, 58, 138, 0.1)` | `#1e3a8a` (blue-900) | `rgba(30, 58, 138, 0.2)` |

Todas incluyen `border-radius: 0.5rem` y `border: 1px solid`.

```tsx
<div className="detective-state-success p-4">
  Ejercicio completado exitosamente
</div>
```

---

## 9. Typography (.text-detective-*)

### Clases CSS (detective-theme.css)

| Clase | Font Size | Line Height | Weight | Color |
|-------|-----------|-------------|--------|-------|
| `.text-detective-title` | 1.5rem | 2rem | 700 (bold) | `var(--detective-text)` |
| `.text-detective-subtitle` | 1.125rem | 1.75rem | 600 (semibold) | `var(--detective-text)` |
| `.text-detective-body` | 1rem | 1.5rem | normal | `var(--detective-text)` |
| `.text-detective-small` | 0.875rem | 1.25rem | normal | `var(--detective-text-secondary)` |

### Utilidades Tailwind (tailwind.config.js)

Para mayor granularidad, el config define font sizes adicionales:

| Utilidad | Font Size | Line Height |
|----------|-----------|-------------|
| `text-detective-xs` | 0.75rem | 1rem |
| `text-detective-sm` | 0.875rem | 1.25rem |
| `text-detective-small` | 0.8125rem | 1.125rem |
| `text-detective-base` | 1rem | 1.5rem |
| `text-detective-subtitle` | 0.9375rem | 1.375rem |
| `text-detective-lg` | 1.125rem | 1.75rem |
| `text-detective-xl` | 1.25rem | 1.75rem |
| `text-detective-2xl` | 1.5rem | 2rem |
| `text-detective-3xl` | 1.875rem | 2.25rem |

**Nota:** La utilidad Tailwind `text-detective-subtitle` (0.9375rem) tiene un tamano diferente a la clase CSS `.text-detective-subtitle` (1.125rem). La clase CSS es la que se usa para subtitulos visibles; la utilidad Tailwind es un tamano intermedio entre `sm` y `base`.

---

## 10. Layout & Backgrounds

### `.detective-container`

Contenedor responsivo con max-width y padding adaptable:

```css
.detective-container {
  max-width: 80rem;        /* 1280px */
  margin: 0 auto;
  padding: 0 1rem;         /* mobile: 16px */
}
/* sm (640px+): padding 1.5rem (24px) */
/* lg (1024px+): padding 2rem (32px) */
```

### Gradientes de fondo

| Clase | Gradiente | Uso |
|-------|----------|-----|
| `.bg-detective-gradient` | `→BR: #fff7ed → #ffffff → #fffbeb` | Fondo principal de pagina |
| `.bg-detective-gradient-secondary` | `135deg: #fef3c7 → #fed7aa` | Secciones destacadas |
| `.bg-detective-card-gradient` | `145deg: #ffffff → #fffbeb` | Fondo interior de cards |
| `.bg-gold-gradient` | `135deg: #f59e0b → #d97706` | Badges, premios, CTA gold |

### `.detective-header-gradient`

Header con gradiente azul-naranja para secciones de ejercicio:

```css
.detective-header-gradient {
  background: linear-gradient(to right, #1e3a8a, #f97316);
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem 0.5rem 0 0;
  padding: 1rem;
}
```

---

## 11. Animations & Utilities

### Skeleton Loading

```tsx
<div className="skeleton h-4 w-3/4 rounded" />  /* Shimmer animation, 2s loop */
```

El shimmer usa un gradiente `#f3f4f6 → #e5e7eb → #f3f4f6` que se desplaza horizontalmente.

### Badge Pulse

```tsx
<RankBadge rank="comisario" animated />  /* Aplica .badge-pulse */
```

Pulso suave: opacidad oscila entre 1.0 y 0.7 cada 2 segundos.

### Hover Utilities

| Clase | Efecto | Uso |
|-------|--------|-----|
| `.hover-lift:hover` | `translateY(-2px)` | Cards, elementos elevables |
| `.hover-scale:hover` | `scale(1.05)` | Botones, iconos |
| `.hover-lift-exercise:hover` | `translateY(-4px)` | Cards de ejercicio (mas pronunciado) |
| `.hover-scale-sm:hover` | `scale(1.02)` | Elementos con escala sutil |

### Module Lock States

| Clase | Efecto | Uso |
|-------|--------|-----|
| `.module-locked` | `grayscale(100%)` + `opacity: 0.6` | Modulo no desbloqueado |
| `.module-lock-overlay` | Overlay blanco al 80% con flexbox centrado | Capa sobre modulo bloqueado |
| `.module-completed-badge` | Circulo dorado posicionado top-right | Indicador de modulo completado |

```tsx
{/* ModuleCard.tsx pattern */}
<div className={cn('relative', isLocked && 'module-locked')}>
  {isLocked && (
    <div className="module-lock-overlay">
      <Lock className="w-8 h-8 text-gray-400" />
    </div>
  )}
  {isCompleted && (
    <div className="module-completed-badge">
      <Check className="w-4 h-4 text-white" />
    </div>
  )}
</div>
```

### Loading Overlay

```tsx
{isLoading && (
  <div className="loading-overlay">
    <div className="loading-modal">
      <Spinner />
      <p>Cargando...</p>
    </div>
  </div>
)}
```

- `.loading-overlay` — fixed fullscreen, `bg-black/50`, `backdrop-blur(8px)`, `z-index: 9999`
- `.loading-modal` — white card centrada, `border-radius: 1rem`, `padding: 2rem`, `min-width: 200px`

### Animaciones Tailwind (via config)

| Utilidad | Efecto | Duracion |
|----------|--------|----------|
| `animate-fade-in` | Opacity 0 → 1 | 0.5s ease-in-out |
| `animate-slide-up` | translateY(20px) + opacity 0 → 0 + 1 | 0.3s ease-out |
| `animate-scale-in` | scale(0.95) + opacity 0 → 1 + 1 | 0.2s ease-out |
| `animate-detective-glow` | Box-shadow azul pulsante | 2s infinite alternate |
| `animate-gold-shine` | Box-shadow dorado pulsante | 3s infinite |

---

## 12. Achievement Badges (.achievement-*)

| Clase | Fondo | Texto | Uso |
|-------|-------|-------|-----|
| `.achievement-common` | `#f3f4f6` (gray-100) | `#6b7280` (gray-500) | Logros comunes |
| `.achievement-rare` | Gradiente `#3b82f6 → #1d4ed8` (azul) | blanco | Logros raros |
| `.achievement-epic` | Gradiente `--detective-orange → --detective-orange-dark` | blanco | Logros epicos |
| `.achievement-legendary` | Gradiente `--detective-gold → --rank-comisario-to` | blanco | Logros legendarios |

Todos comparten: `inline-flex`, `padding: 0.25rem 0.5rem`, `border-radius: 0.25rem`, `font-size: 0.75rem`, `font-weight: 500`.

---

## 13. Loading Components

**Directorio:** `shared/components/loading/`

El tema detective incluye un sistema completo de loading states que usan tokens detective para consistencia visual.

### `LoadingOverlay`

**Archivo:** `shared/components/loading/LoadingOverlay.tsx`

Overlay de carga con dos variantes: pantalla completa (modal con backdrop blur) e inline (centrado en contenedor).

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `isVisible` | `boolean` | — | Controla visibilidad (con AnimatePresence) |
| `message` | `string` | `'Cargando...'` | Mensaje mostrado |
| `variant` | `'full' \| 'inline'` | `'full'` | `full` = overlay fijo, `inline` = centrado en parent |

- Usa clases CSS `loading-overlay` y `loading-modal` de `detective-theme.css`.
- El spinner usa `text-detective-orange` y el texto usa `text-detective-text`.

```tsx
import { LoadingOverlay } from '@shared/components/loading';

// Overlay completo
<LoadingOverlay isVisible={isLoading} message="Guardando progreso..." />

// Inline (dentro de un contenedor)
<LoadingOverlay isVisible={isLoading} variant="inline" message="Cargando datos..." />
```

### Skeleton Family

**Archivo:** `shared/components/loading/SkeletonCard.tsx` (exporta 8 variantes)

Todos los skeletons usan `bg-detective-bg-secondary` para el fondo y `bg-detective-border` para los placeholder internos.

| Componente | Props principales | Descripcion |
|------------|------------------|-------------|
| `Skeleton` | `width`, `height`, `rounded` | Primitiva base: bloque animado con `animate-pulse` |
| `SkeletonText` | `lines` (default 3) | Multiples lineas de texto placeholder |
| `SkeletonAvatar` | `size` (default 40px) | Circulo animado |
| `SkeletonCard` | `count`, `variant`, `showAvatar`, `lines` | Card con header y body |
| `SkeletonStats` | `count` (default 4) | Tarjeta de estadisticas |
| `SkeletonList` | `count` (default 5) | Lista con avatar y texto |
| `SkeletonTable` | `rows`, `columns` | Tabla con header y filas |
| `SkeletonAchievement` | — | Achievement card con icono, titulo y barra |

```tsx
import { SkeletonCard, SkeletonStats, SkeletonTable } from '@shared/components/loading';

// Mientras cargan las cards
{isLoading ? <SkeletonCard count={3} variant="medium" /> : <Cards />}

// Skeleton de estadisticas del dashboard
<SkeletonStats count={4} />

// Skeleton de tabla
<SkeletonTable rows={10} columns={5} />
```

---

## 14. Patron de Opacidad (Tailwind v4)

La utilidad `bg-opacity-*` fue **removida en Tailwind v4**. El proyecto usa la sintaxis de barra (`/`) para opacidad.

### Migracion

```tsx
// INCORRECTO (Tailwind v3, ya no funciona)
<div className="bg-black bg-opacity-50" />
<div className="bg-detective-orange bg-opacity-20" />

// CORRECTO (Tailwind v4, sintaxis de barra)
<div className="bg-black/50" />
<div className="bg-detective-orange/20" />
```

### Patrones comunes en el codebase

```tsx
// Overlay de modal
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" />

// Fondo con opacidad parcial
<DetectiveCard className="border-detective-orange/30 bg-detective-orange/10">

// Hover con opacidad
<button className="bg-white/10 hover:bg-white/20 transition-colors" />

// Estado activo con opacidad
<span className={isActive && 'bg-detective-orange/20 text-detective-orange'} />
```

---

## 15. Buenas Practicas

### Usar componentes React, no clases CSS directas

```tsx
// CORRECTO
<DetectiveCard variant="gold" padding="sm">...</DetectiveCard>
<DetectiveButton variant="primary" size="md">Guardar</DetectiveButton>
<RankBadge rank="comisario" />

// EVITAR (solo usar cuando un componente wrapper no es viable)
<div className="detective-card p-4">...</div>
<button className="btn-detective">Guardar</button>
```

### No duplicar padding en botones

```tsx
// INCORRECTO — btn-detective ya define padding: 0.5rem 1rem
<button className="btn-detective px-6 py-3">Guardar</button>

// CORRECTO — usar DetectiveButton con size prop
<DetectiveButton size="lg">Guardar</DetectiveButton>
```

### Usar variables del tema, no colores hardcoded

```tsx
// INCORRECTO
<div className="bg-[#f97316] text-[#1f2937]" />

// CORRECTO
<div className="bg-detective-orange text-detective-text" />
```

### Siempre usar sintaxis de barra para opacidad

```tsx
// INCORRECTO (Tailwind v3 legacy)
<div className="bg-black bg-opacity-50" />

// CORRECTO (Tailwind v4)
<div className="bg-black/50" />
```

### Preferir utilidades Tailwind del tema sobre CSS inline

```tsx
// INCORRECTO
<div style={{ boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.25)' }} />

// CORRECTO
<div className="shadow-gold" />
```

### Focus states ya estan cubiertos

El tema define focus rings naranjas para `button:focus-visible` y `a:focus-visible`. No necesitas agregarlos manualmente a menos que el componente requiera un ring diferente (como el azul del outline variant).

---

## 16. Accesibilidad y Contraste

### Ratios de Contraste

Los colores detective cumplen WCAG 2.1 AA en la mayoria de combinaciones. A continuacion los ratios estimados:

| Combinacion | Ratio | Cumple AA (texto normal) | Cumple AA (texto grande) |
|-------------|-------|--------------------------|--------------------------|
| `--detective-text` (#1f2937) sobre blanco | ~12.6:1 | Si | Si |
| `--detective-text-secondary` (#6b7280) sobre blanco | ~4.6:1 | Si | Si |
| Blanco sobre `--detective-orange` (#f97316) | ~3.1:1 | No | Si |
| Blanco sobre `--detective-orange-dark` (#ea580c) | ~3.6:1 | No | Si |
| Blanco sobre `--detective-blue` (#1e3a8a) | ~9.4:1 | Si | Si |
| Blanco sobre `--detective-gold` (#f59e0b) | ~2.4:1 | No | No |
| `--detective-text` (#1f2937) sobre `--detective-bg` (#fffbeb) | ~11.8:1 | Si | Si |

### Recomendaciones

- **Texto sobre fondo naranja/dorado:** Usar siempre `text-white` con `font-semibold` o superior. El ratio de 3.1:1 es suficiente para texto grande (>=18px o >=14px bold), que es el caso de todos los botones `btn-*`.
- **Texto pequeno principal:** Usar `text-detective-text` (gray-800), nunca naranja sobre fondo claro para texto de parrafo.
- **Indicadores visuales:** No depender solo del color. Los estados de `InputDetective` complementan el color de borde con mensajes de texto (`error`, `success`).
- **Focus rings:** El tema define `box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.3)` para `button:focus-visible` y `a:focus-visible`. Los inputs usan `box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1)`.
- **ARIA automatico:** `DetectiveCard` con `onClick` agrega `role="button"`, `tabIndex=0` y manejo de teclado (Enter/Space). `DetectiveButton` incluye `aria-busy`, `aria-disabled`, `aria-label` automatico para icon-only buttons. `InputDetective` genera `aria-invalid` y `aria-describedby`. `ProgressBar` incluye `role="progressbar"` con `aria-valuenow`.

### Dorado sobre fondos claros

El token `--detective-gold` (#f59e0b) tiene ratio insuficiente (~2.4:1) contra blanco para texto. Usarlo solo para:
- Fondos solidos con texto blanco en tamano grande (`bg-detective-gold text-white text-lg font-bold`)
- Iconos decorativos donde el significado no depende del color
- Bordes y gradientes decorativos

---

## 17. Guia de Migracion

Para convertir un componente que usa Tailwind generico al tema detective.

### Paso 1: Reemplazar colores y estructura de cards

```tsx
// ANTES (Tailwind generico)
<div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
  <h3 className="text-gray-800 text-lg font-bold">Titulo</h3>
  <p className="text-gray-500 text-sm">Descripcion</p>
  <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
    Accion
  </button>
</div>

// DESPUES (Tema detective)
<DetectiveCard variant="default">
  <h3 className="text-detective-title">Titulo</h3>
  <p className="text-detective-small">Descripcion</p>
  <DetectiveButton variant="primary">Accion</DetectiveButton>
</DetectiveCard>
```

### Paso 2: Reemplazar inputs

```tsx
// ANTES
<label>Email</label>
<input
  className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring"
/>
{error && <span className="text-red-500 text-sm">{error}</span>}

// DESPUES
<InputDetective label="Email" error={error} />
```

### Paso 3: Reemplazar barras de progreso

```tsx
// ANTES
<div className="bg-gray-200 rounded-full h-2">
  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }} />
</div>

// DESPUES
<ProgressBar progress={75} variant="detective" height="md" />
```

### Paso 4: Reemplazar colores inline

```tsx
// ANTES
<span className="text-gray-800">Titulo</span>
<span className="text-gray-500">Subtitulo</span>
<div className="bg-orange-500">...</div>

// DESPUES
<span className="text-detective-text">Titulo</span>
<span className="text-detective-text-secondary">Subtitulo</span>
<div className="bg-detective-orange">...</div>
```

### Paso 5: Verificar

1. Los colores son consistentes con la paleta detective (no `orange-500` generico sino `detective-orange`).
2. Los hover states funcionan (lift, scale, cambio de sombra).
3. Los focus states muestran ring naranja (`focus:ring-detective-orange` o focus-visible automatico del tema).
4. Los estados disabled reducen opacidad a 0.5.
5. Los textos mantienen contraste AA contra su fondo.
6. Los loading states usan skeletons con `bg-detective-bg-secondary`.

### Errores comunes en migracion

| Error | Solucion |
|-------|----------|
| Usar `bg-orange-500` en vez de `bg-detective-orange` | Siempre preferir tokens detective para consistencia |
| Crear clases CSS custom para botones | Usar `DetectiveButton` con la variante apropiada |
| Agregar padding a elementos con `btn-detective` | La clase ya define `padding: 0.5rem 1rem`. Usar `DetectiveButton` con `size` |
| Hardcodear colores hex en `className` o `style` | Usar variables CSS o tokens Tailwind del tema |
| Usar `bg-opacity-*` (Tailwind v3) | Usar sintaxis de barra: `bg-detective-orange/20` |
| Olvidar `aria-label` en icon-only buttons | `DetectiveButton` lo genera automaticamente |

---

## Archivos de Referencia

| Archivo | Ruta |
|---------|------|
| CSS del tema | `apps/frontend/src/shared/styles/detective-theme.css` |
| Tailwind config | `apps/frontend/tailwind.config.js` |
| Variables CSS | `apps/frontend/src/shared/styles/index.css` |
| DetectiveCard | `apps/frontend/src/shared/components/base/DetectiveCard.tsx` |
| DetectiveButton | `apps/frontend/src/shared/components/base/DetectiveButton.tsx` |
| InputDetective | `apps/frontend/src/shared/components/base/InputDetective.tsx` |
| ProgressBar | `apps/frontend/src/shared/components/base/ProgressBar.tsx` |
| RankBadge | `apps/frontend/src/shared/components/base/RankBadge.tsx` |
| LoadingOverlay | `apps/frontend/src/shared/components/loading/LoadingOverlay.tsx` |
| Skeleton Family | `apps/frontend/src/shared/components/loading/SkeletonCard.tsx` |
| Base barrel export | `apps/frontend/src/shared/components/base/index.ts` |

### Patrones Responsivos (Mobile-First)

**Breakpoint principal:** `sm:` (640px) — cubre todos los telefonos en portrait.

**Patron estandar aplicado en 38 archivos de ejercicios + componentes compartidos:**

| Tipo | Mobile (base) | Desktop (sm:) | Ejemplo |
|------|---------------|---------------|---------|
| Padding grande | `p-3` | `sm:p-6` | Contenedores de ejercicio, cards |
| Padding medio | `p-2` | `sm:p-4` | Sub-secciones, botones de opcion |
| Texto titulo | `text-xl` | `sm:text-2xl` | Headers de ejercicio, titulos |
| Texto grande | `text-3xl` | `sm:text-6xl` | Contadores, timers prominentes |
| Gaps | `gap-2` | `sm:gap-4` | Flex/grid containers |
| Gaps grandes | `gap-3` | `sm:gap-6` | Grids de perspectivas, cards |
| Grids | `grid-cols-1` | `sm:grid-cols-3` | FeedbackModal stats, score grids |
| Heights fijos | `h-[400px]` | `sm:h-[600px]` | Chat containers, canvas |
| Min-heights | `min-h-[350px]` | `sm:min-h-[600px]` | Comic canvas, areas de dibujo |
| Sidebars | `w-full` | `sm:w-80` | QuizTikTok sidebar |
| Botones grandes | `px-4 py-2` | `sm:px-8 sm:py-4` | Submit, CTA buttons |
| Iconos | `h-8 w-8` | `sm:h-10 sm:w-10` | Header icons, avatars |

**Reglas:**
1. **Solo cambios CSS** — nunca modificar logica TypeScript para responsividad
2. **Nunca eliminar clases** — solo agregar prefijos `sm:`
3. **Inline styles → Tailwind** — convertir `style={{ height: '600px' }}` a `h-[400px] sm:h-[600px]`
4. **cn() utility** de `@shared/utils/cn` soporta merge condicional de clases responsivas

**Viewports de prueba:** 375px (iPhone SE), 414px (iPhone Plus), 768px (tablet)

---

### Alcance de uso en el codebase

| Patron | Archivos que lo usan | Ocurrencias totales |
|--------|---------------------|---------------------|
| Tokens Tailwind (`text-detective-*`, `bg-detective-*`, etc.) | ~414 archivos | ~2,200+ |
| Clases CSS detective-theme (`btn-detective`, `detective-card`, etc.) | ~19 archivos | ~30 |
| Tokens de color/sombra Tailwind (`detective-gold`, `shadow-detective`, etc.) | ~151 archivos | ~480 |
| Tipografia detective (`text-detective-sm`, etc.) | ~97 archivos | ~835 |
