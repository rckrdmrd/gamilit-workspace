# Guía de Estilos - Frontend GAMILIT

**Proyecto:** GAMILIT Platform v2
**Módulo:** Tema y Estilos - Índice General
**Framework:** Tailwind CSS v3.4.0
**Fecha:** 2025-11-01
**Versión:** 1.0

---

## RFC-0001 Header

```yaml
id: FRONTEND-ESTILOS-INDEX-000
título: Guía de Estilos - Índice General
estado: Activo
fecha_creación: 2025-11-01
última_actualización: 2025-11-01
autor: Equipo Frontend GAMILIT
```

---

## 1. Resumen Ejecutivo

Este directorio contiene la documentación modular del **sistema de estilos y tema Detective** del frontend de GAMILIT Platform v2, basado en Tailwind CSS con personalización extensa.

### Estructura de Documentación:

```
estilos/
├── README.md                    # Este archivo (índice)
├── Tema-Configuracion.md       # Configuración base (~300 líneas)
├── Estilos-Componentes.md      # Estilos de componentes (~250 líneas)
└── Estilos-Utilidades.md       # Utilidades y helpers (~116 líneas)
```

---

## 2. Índice de Documentos

### 2.1 Tema y Configuración Base

**Archivo:** `Tema-Configuracion.md`

**Contenido:**
- Configuración de Tailwind CSS (`tailwind.config.js`)
- Paleta de colores completa (Detective theme)
- Tipografía personalizada
- Sombras (box-shadow)
- Animaciones y keyframes
- Border radius personalizado
- Responsive design (breakpoints)
- Preparación para Dark Mode

**Ver detalles:** [`Tema-Configuracion.md`](./Tema-Configuracion.md)

---

### 2.2 Estilos de Componentes

**Archivo:** `Estilos-Componentes.md`

**Contenido:**
- Estilos de botones (`DetectiveButton`)
- Estilos de cards (`DetectiveCard`)
- Progress bars
- Inputs de formulario
- Badges de rango
- Layouts (Container, Flexbox, Grid)
- Estados interactivos (hover, focus, active, disabled)
- Transiciones
- Diseño responsive

**Ver detalles:** [`Estilos-Componentes.md`](./Estilos-Componentes.md)

---

### 2.3 Utilidades y Helpers

**Archivo:** `Estilos-Utilidades.md`

**Contenido:**
- Helper `classNames()` para clases condicionales
- Helper `getRankGradient()` para gradientes de rango
- Helper `getRarityColor()` para colores de rareza
- Helper `getDifficultyColor()` para dificultades
- Utilidades Tailwind custom
- Hooks de estilos (`useTheme`, `useMediaQuery`)
- Configuración de iconos (Lucide React)
- Constantes de estilos

**Ver detalles:** [`Estilos-Utilidades.md`](./Estilos-Utilidades.md)

---

## 3. Paleta de Colores Detective

### 3.1 Colores Principales

| Color | Variable | Hex | Uso |
|-------|----------|-----|-----|
| **Detective Orange** | `detective-orange` | `#f97316` | Color primario, botones principales |
| **Detective Blue** | `detective-blue` | `#1e3a8a` | Color secundario, header |
| **Detective Gold** | `detective-gold` | `#f59e0b` | Acento, ML Coins, premium |

### 3.2 Colores de Rangos Maya

| Rango | Nombre | From → To |
|-------|--------|-----------|
| Ajaw | Detective Novato | `#60a5fa` → `#2563eb` (Azul) |
| Nacom | Sargento | `#4ade80` → `#16a34a` (Verde) |
| Ah K'in | Teniente | `#fb923c` → `#ea580c` (Naranja) |
| Halach Uinic | Capitán | `#a78bfa` → `#7c3aed` (Púrpura) |
| K'uk'ulkan | Comisario | `#f59e0b` → `#d97706` (Dorado) |

### 3.3 Colores de Rareza

| Rareza | Variable | Hex |
|--------|----------|-----|
| Common | `rarity-common` | `#9ca3af` (Gris) |
| Rare | `rarity-rare` | `#3b82f6` (Azul) |
| Epic | `rarity-epic` | `#f97316` (Naranja) |
| Legendary | `rarity-legendary` | `#f59e0b` (Dorado) |

---

## 4. Guía Rápida de Uso

### 4.1 Aplicar Tema Detective

```tsx
// Botón primario
<button className="bg-detective-orange hover:bg-detective-orange-dark text-white px-6 py-3 rounded-detective shadow-orange hover:shadow-orange-lg transition-all">
  Continuar
</button>

// Card con tema
<div className="bg-white rounded-detective shadow-card hover:shadow-card-hover p-6">
  <h3 className="text-detective-2xl font-bold text-detective-text">Título</h3>
  <p className="text-detective-text-secondary">Contenido</p>
</div>

// Badge de rango
<div className="bg-gradient-to-r from-rank-teniente-from to-rank-teniente-to w-16 h-16 rounded-full flex items-center justify-center text-white font-bold">
  T
</div>
```

### 4.2 Usar Helpers

```tsx
import { classNames, getRankGradient } from '@shared/utils/styleHelpers';

// Clases condicionales
<div className={classNames(
  'base-class px-4 py-2',
  isActive && 'bg-detective-orange text-white',
  isDisabled && 'opacity-50'
)}>
  Contenido
</div>

// Gradiente de rango dinámico
<div className={`${getRankGradient(userRank)} p-6 rounded-detective`}>
  Rango: {userRank}
</div>
```

### 4.3 Responsive Design

```tsx
// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Texto responsive
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Título Responsive
</h1>

// Mostrar/Ocultar
<div className="hidden md:block">Visible en tablets+</div>
<div className="block md:hidden">Visible solo en mobile</div>
```

---

## 5. Componentes con Estilos

### 5.1 Buttons

```tsx
// Primario
<button className="bg-detective-orange hover:bg-detective-orange-dark text-white px-6 py-3 rounded-detective transition-all">
  Primario
</button>

// Secundario
<button className="bg-detective-blue hover:bg-blue-800 text-white px-6 py-3 rounded-detective transition-all">
  Secundario
</button>

// Outline
<button className="border-2 border-detective-orange text-detective-orange hover:bg-detective-orange hover:text-white px-6 py-3 rounded-detective transition-all">
  Outline
</button>
```

### 5.2 Cards

```tsx
// Card básica
<div className="bg-white rounded-detective shadow-card hover:shadow-card-hover transition-shadow p-6">
  Contenido
</div>

// Card gold
<div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-detective shadow-gold p-6">
  Premium
</div>

// Card con gradiente de rango
<div className={`${getRankGradient('Ah K'in')} rounded-detective p-6 text-white`}>
  Teniente
</div>
```

### 5.3 Inputs

```tsx
<input
  type="text"
  className="w-full px-4 py-2 border-2 border-detective-border-medium rounded-detective focus:outline-none focus:ring-2 focus:ring-detective-orange focus:border-detective-orange"
  placeholder="Escribe aquí..."
/>
```

---

## 6. Animaciones

### 6.1 Predefinidas

```tsx
// Fade in
<div className="animate-fade-in">Aparece con fade</div>

// Slide up
<div className="animate-slide-up">Sube desde abajo</div>

// Scale in
<div className="animate-scale-in">Escala desde pequeño</div>

// Glow infinito
<div className="animate-detective-glow">Brillo pulsante</div>
<div className="animate-gold-shine">Brillo dorado</div>
```

### 6.2 Transiciones

```tsx
// Transición suave de todo
<div className="transition-all duration-200">Elemento</div>

// Solo colores
<button className="transition-colors duration-300">Botón</button>

// Solo sombras
<div className="transition-shadow duration-200">Card</div>

// Solo transform
<div className="transition-transform duration-200 hover:scale-105">Hover</div>
```

---

## 7. Breakpoints Responsive

| Breakpoint | Min Width | Uso Típico |
|------------|-----------|------------|
| `sm` | 640px | Tablets |
| `md` | 768px | Tablets landscape |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

**Ejemplo:**
```tsx
<div className="p-4 sm:p-6 md:p-8 lg:p-12">
  Padding que crece con el viewport
</div>
```

---

## 8. Herramientas y Recursos

### 8.1 Iconos

**Biblioteca:** Lucide React

```bash
npm install lucide-react
```

```tsx
import { Search, User, Settings } from 'lucide-react';

<Search className="w-5 h-5 text-detective-orange" />
```

### 8.2 Fuentes

**Stack del Sistema:**
- San Francisco (macOS/iOS)
- Segoe UI (Windows)
- Roboto (Android)
- Helvetica Neue (fallback)

### 8.3 Herramientas de Desarrollo

- **Tailwind CSS IntelliSense** (VS Code extension)
- **Prettier** con plugin de Tailwind
- **PostCSS** para procesamiento

---

## 9. Mejores Prácticas

### 9.1 Consistencia

✅ **Usar clases del tema:**
```tsx
<div className="bg-detective-orange">Detective Orange</div>
```

❌ **Evitar colores hardcodeados:**
```tsx
<div style={{ backgroundColor: '#f97316' }}>Orange</div>
```

### 9.2 Spacing

✅ **Múltiplos de 4px:**
```tsx
<div className="p-4 gap-6 mb-8">Spacing consistente</div>
```

❌ **Valores arbitrarios:**
```tsx
<div className="p-[13px] gap-[17px]">Spacing inconsistente</div>
```

### 9.3 Responsive

✅ **Mobile-first:**
```tsx
<div className="text-base md:text-lg lg:text-xl">Responsive</div>
```

❌ **Desktop-first:**
```tsx
<div className="text-xl lg:text-lg md:text-base">Mal orden</div>
```

---

## 10. Navegación entre Documentos

### Documentos de Estilos:

- **Configuración del Tema:** [`Tema-Configuracion.md`](./Tema-Configuracion.md)
- **Estilos de Componentes:** [`Estilos-Componentes.md`](./Estilos-Componentes.md)
- **Utilidades y Helpers:** [`Estilos-Utilidades.md`](./Estilos-Utilidades.md)

### Otros Módulos Frontend:

- **Componentes:** [`../componentes/README.md`](../componentes/README.md)
- **Estados:** [`../estados/README.md`](../estados/README.md)
- **Routing:** [`../routing/README.md`](../routing/README.md)
- **Features:** [`../features/README.md`](../features/README.md)
- **Mecánicas:** [`../mecanicas/README.md`](../mecanicas/README.md)

### Documentos Originales:

- **Backup Original:** [`../.backup/TEMA-Y-ESTILOS.md.backup`](../.backup/TEMA-Y-ESTILOS.md.backup)

---

## 11. Estadísticas

### Por Documento:

| Documento | Líneas Aprox. | Contenido |
|-----------|---------------|-----------|
| `Tema-Configuracion.md` | ~300 | Config Tailwind, colores, tipografía |
| `Estilos-Componentes.md` | ~250 | Estilos de componentes UI |
| `Estilos-Utilidades.md` | ~116 | Helpers y utilidades |
| **TOTAL** | **~666** | - |

---

## 12. Changelog

### 2025-11-01
- **Creado:** Modularización de `TEMA-Y-ESTILOS.md`
- **Dividido en:**
  - `Tema-Configuracion.md` (300 líneas aprox.)
  - `Estilos-Componentes.md` (250 líneas aprox.)
  - `Estilos-Utilidades.md` (116 líneas aprox.)
- **Creado:** Este archivo `README.md` como guía

### 2025-10-27
- **Original:** Creación de `TEMA-Y-ESTILOS.md` (666 líneas)

---

## 13. Contacto y Soporte

Para preguntas o mejoras a la documentación de estilos:

- **Equipo:** Frontend GAMILIT
- **Documentación:** `/docs/03-desarrollo/frontend/estilos/`
- **Configuración:** `/tailwind.config.js`

---

**Documento generado:** 2025-11-01
**Versión:** 1.0
**Framework:** Tailwind CSS v3.4.0
