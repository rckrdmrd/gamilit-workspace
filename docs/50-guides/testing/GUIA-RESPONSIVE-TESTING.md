---
titulo: Guía de Testing Responsive
tipo: guia
dominio: testing
ultima_actualizacion: 2026-02-27
---

# Guía de Testing Responsive — gamilit Frontend

**Versión:** 1.0.0
**Fecha:** 2026-02-26
**Referencia:** ADR-050, ESTANDAR-FRONTEND-RESPONSIVE.md

---

## Dispositivos de Prueba

### Dispositivos Mínimos Requeridos

| Dispositivo | Resolución | Breakpoint Tailwind | Prioridad |
|-------------|------------|---------------------|-----------|
| iPhone SE | 375×667 | default (< sm) | P0 |
| iPhone 14 | 390×844 | default (< sm) | P0 |
| iPad Mini | 768×1024 | md | P1 |
| Desktop HD | 1280×720 | xl | P1 |
| Narrow Mobile | 320×568 | default (< sm) | P2 |
| Small Desktop | 1024×768 | lg | P2 |
| Desktop FHD | 1920×1080 | 2xl | P2 |

### Breakpoints Tailwind CSS

| Breakpoint | Min-Width | Uso Principal |
|------------|-----------|---------------|
| default | 0px | Mobile-first base |
| sm | 640px | Landscape phones |
| md | 768px | Tablets |
| lg | 1024px | Small desktops |
| xl | 1280px | Desktop HD |
| 2xl | 1536px | Desktop FHD+ |

---

## Flujos Críticos de Prueba

### 1. Flujo Estudiante (P0)
1. Login → Dashboard
2. Dashboard → Seleccionar módulo → Detalle del módulo
3. Iniciar ejercicio → Completar → Modal de completado
4. Verificar sidebar de ejercicios (colapso mobile)
5. Misiones → Detalle de misión → Reclamar recompensa
6. Logros → Filtros → Detalle de logro

### 2. Flujo Maestro (P1)
1. Login → Dashboard del maestro
2. Asignaciones → Crear asignación
3. Panel de revisión → Evaluar respuesta
4. Progreso de clase → Detalle de estudiante
5. Reportes → Generar reporte

### 3. Flujo Admin (P1)
1. Login → Panel de administración
2. Gestión de usuarios → Crear/editar usuario
3. Gestión de contenido → Crear ejercicio
4. Gamificación → Editar parámetros → Preview impacto
5. Configuración del sistema

### 4. Flujo Padres (P2)
1. Login → Dashboard de padres
2. Progreso del estudiante vinculado
3. Notificaciones

---

## Checklist de Verificación por Componente

### Modales
- [ ] Se abre correctamente en 375px sin overflow horizontal
- [ ] Botón de cierre tiene mínimo 44×44px de área táctil
- [ ] Contenido con scroll si excede viewport
- [ ] Padding responsive (más compacto en mobile)
- [ ] Botones de acción se apilan verticalmente en mobile
- [ ] Confetti/animaciones no causan scroll horizontal

### Layouts (PortalLayout, ExerciseLayout)
- [ ] Sidebar colapsa como overlay en < 1024px
- [ ] Contenido principal ocupa 100% width cuando sidebar cerrado
- [ ] Botón hamburguesa visible en mobile, oculto en desktop
- [ ] Header no causa overflow horizontal
- [ ] BottomNavigation visible solo en mobile (estudiante)

### Formularios y Entradas
- [ ] Inputs al 100% width en mobile
- [ ] Labels visibles sin truncamiento
- [ ] Botones submit accesibles (no ocultos por teclado virtual)
- [ ] Grids de opciones colapsan (3→2→1 columnas)

### Tarjetas y Grids
- [ ] Grids colapsan apropiadamente por breakpoint
- [ ] Tarjetas no desbordan su contenedor
- [ ] Texto no se trunca en información esencial
- [ ] Gaps se reducen en mobile

### Tipografía
- [ ] Títulos de página escalan (text-2xl sm:text-3xl)
- [ ] Títulos de sección escalan (text-xl sm:text-2xl)
- [ ] Texto body legible sin zoom (min 14px)
- [ ] No hay truncamiento inesperado

---

## Herramientas de Testing

### 1. Chrome DevTools (Manual)
```
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
- Seleccionar dispositivo del dropdown
- Verificar orientación portrait y landscape
- Simular throttling para conexiones lentas
```

### 2. Test Utilities (Automatizado)
```typescript
import { setDevicePreset, mockMatchMedia, DEVICE_PRESETS } from '@shared/utils/__tests__/responsive.test-utils';

// Simular viewport en tests
setDevicePreset('iPhone SE');

// Mock media queries
const cleanup = mockMatchMedia(375);
// ... run test
cleanup();
```

### 3. Responsive Test Pattern
```typescript
import { RESPONSIVE_TEST_WIDTHS, setViewport, mockMatchMedia } from '@shared/utils/__tests__/responsive.test-utils';

describe('MyComponent responsive', () => {
  RESPONSIVE_TEST_WIDTHS.forEach(width => {
    it(`renders correctly at ${width}px`, () => {
      const cleanup = mockMatchMedia(width);
      setViewport(width, 768);
      // render component and assert
      cleanup();
    });
  });
});
```

---

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Overflow horizontal en mobile | Ancho fijo (`w-80`, `min-w-[300px]`) | Usar `w-[min(320px,calc(100vw-2rem))]` |
| Modal desaparece en pantallas pequeñas | `max-w-sm` sin floor | Agregar `max-w-[calc(100vw-2rem)]` |
| Botones inaccessibles | Tap target < 44px | `min-w-[44px] min-h-[44px] touch-manipulation` |
| Texto desborda tarjeta | `text-3xl` sin escalado | `text-2xl sm:text-3xl` |
| Sidebar empuja contenido en mobile | `ml-80` sin condicional | `${isSidebarOpen ? 'lg:ml-80' : ''}` |
| Confetti scroll horizontal | `window.innerWidth` stale | Usar `useResponsiveLayout()` |

---

## Proceso de Revisión

1. **Antes de PR:** Ejecutar `npm run build && npm run typecheck` — sin errores
2. **Review visual:** Verificar en Chrome DevTools a 375px y 1024px mínimo
3. **Checklist:** Completar las secciones relevantes del checklist arriba
4. **Regressions:** Verificar que componentes existentes no se rompan

---

*Generado para gamilit v4.0.0 — Responsive Design Audit Sprint*
