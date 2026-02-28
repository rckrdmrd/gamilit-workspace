---
title: Student Portal Hooks — UI/UX
status: activo
last_updated: "2026-02-28"
---

## Categoria: UI/UX

### useResponsiveLayout

**Archivo:** `hooks/useResponsiveLayout.ts`
**Proposito:** Detecta breakpoints y orientacion de pantalla para layouts responsivos.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| - | - | - | No recibe parametros |

#### Retorno

```typescript
interface ResponsiveLayoutState {
  breakpoint: Breakpoint;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  width: number;
  height: number;
}

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';
type Orientation = 'portrait' | 'landscape';
```

#### Breakpoints

```typescript
const BREAKPOINTS = {
  mobile: 768,    // < 768px
  tablet: 1024,   // 768px - 1023px
  desktop: 1400,  // 1024px - 1399px
  // wide: >= 1400px
};
```

#### Ejemplo de uso

```typescript
const { isMobile, isTablet, breakpoint, orientation } = useResponsiveLayout();

return (
  <Layout
    sidebar={!isMobile}
    columns={isMobile ? 1 : isTablet ? 2 : 3}
  >
    {isMobile && <MobileNav />}
    {!isMobile && <DesktopNav />}
  </Layout>
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| - | - | Solo usa window.innerWidth/innerHeight |

#### Dependencias

- React hooks: `useState`, `useEffect`
- `window.addEventListener('resize')`

---

### useMediaQuery

**Archivo:** `hooks/useResponsiveLayout.ts`
**Proposito:** Evalua una media query CSS y retorna si coincide.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| query | `string` | Si | Media query CSS |

#### Retorno

```typescript
boolean // true si la media query coincide
```

#### Ejemplo de uso

```typescript
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
const isLargeScreen = useMediaQuery('(min-width: 1200px)');
const hasHover = useMediaQuery('(hover: hover)');

return (
  <ThemeProvider theme={prefersDark ? darkTheme : lightTheme}>
    <App />
  </ThemeProvider>
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| - | - | Solo usa window.matchMedia |

#### Dependencias

- React hooks: `useState`, `useEffect`
- `window.matchMedia`

---

### useKeyboardShortcuts

**Archivo:** `hooks/useResponsiveLayout.ts`
**Proposito:** Registra y maneja atajos de teclado con soporte para secuencias de 2 teclas.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| shortcuts | `Record<string, () => void>` | Si | Mapa de atajos a callbacks |

#### Retorno

```typescript
void // No retorna nada, solo registra listeners
```

#### Ejemplo de uso

```typescript
useKeyboardShortcuts({
  'escape': () => closeModal(),
  'enter': () => submitForm(),
  'g d': () => navigateTo('/dashboard'),  // Secuencia: g + d
  'g m': () => navigateTo('/modules'),     // Secuencia: g + m
});
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| - | - | Solo usa window.addEventListener('keydown') |

#### Dependencias

- React hooks: `useEffect`
- `window.addEventListener('keydown')`

#### Notas importantes

- Soporta secuencias de hasta 2 teclas
- La secuencia se resetea despues de 1 segundo
- Previene el comportamiento default del evento

---

### useSwipeGesture / useSwipeableElement

**Archivo:** `hooks/useSwipeGesture.ts`
**Proposito:** Detecta gestos de swipe en dispositivos tactiles.

#### useSwipeGesture - Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| onSwipeLeft | `() => void` | No | Callback swipe izquierda |
| onSwipeRight | `() => void` | No | Callback swipe derecha |
| onSwipeUp | `() => void` | No | Callback swipe arriba |
| onSwipeDown | `() => void` | No | Callback swipe abajo |
| threshold | `number` | No | Pixeles minimos (default: 50) |

#### useSwipeGesture - Retorno

```typescript
interface UseSwipeGestureReturn {
  isSwiping: boolean;
  handleTouchStart: (e: TouchEvent) => void;
  handleTouchMove: (e: TouchEvent) => void;
  handleTouchEnd: () => void;
}
```

#### useSwipeableElement - Retorno

```typescript
interface UseSwipeableElementReturn {
  elementRef: RefObject<HTMLDivElement>;
  isSwiping: boolean;
}
```

#### Ejemplo de uso

```typescript
// Opcion 1: useSwipeGesture (manual)
const gesture = useSwipeGesture({
  onSwipeLeft: () => nextSlide(),
  onSwipeRight: () => prevSlide(),
  threshold: 100
});

<div
  onTouchStart={gesture.handleTouchStart}
  onTouchMove={gesture.handleTouchMove}
  onTouchEnd={gesture.handleTouchEnd}
>
  {slides[currentIndex]}
</div>

// Opcion 2: useSwipeableElement (automatico)
const { elementRef, isSwiping } = useSwipeableElement({
  onSwipeLeft: () => nextSlide(),
  onSwipeRight: () => prevSlide()
});

<div ref={elementRef} className={isSwiping ? 'swiping' : ''}>
  {slides[currentIndex]}
</div>
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| - | - | Solo usa Touch events |

#### Dependencias

- React hooks: `useState`, `useEffect`, `useRef`
- Touch events API

---
