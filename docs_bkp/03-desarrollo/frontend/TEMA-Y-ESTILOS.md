# Tema y Estilos - Frontend GAMILIT Platform v2

**Proyecto:** GAMILIT Platform v2
**Fecha:** 2025-10-27
**Framework:** Tailwind CSS v3.4.0
**Tema:** Detective (Naranja/Azul/Dorado)

---

## 1. Resumen Ejecutivo

GAMILIT Platform implementa un **tema visual Detective** basado en una paleta de colores naranja, azul y dorado, con Tailwind CSS como framework de estilos y personalización extensa del theme.

### Características:

- **Tailwind CSS**: Utility-first framework
- **Detective Theme**: Colores personalizados
- **Dark Mode**: Soporte (futuro)
- **Responsive**: Mobile-first
- **Animations**: Transiciones suaves
- **Typography**: Escalas personalizadas

---

## 2. Configuración Tailwind

### 2.1 tailwind.config.js

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales Detective
        'detective-orange-300': '#fdba74',
        'detective-orange-400': '#fb923c',
        'detective-orange': '#f97316',
        'detective-orange-dark': '#ea580c',
        'detective-orange-700': '#c2410c',

        'detective-blue': '#1e3a8a',
        'detective-gold': '#f59e0b',

        // Fondos
        'detective-bg': '#fffbeb',
        'detective-bg-secondary': '#fef3c7',

        // Texto
        'detective-text': '#1f2937',
        'detective-text-secondary': '#6b7280',

        // Estados
        'detective-success': '#10b981',
        'detective-danger': '#ef4444',
        'detective-neutral': '#6b7280',

        // Borders
        'detective-border-light': '#f3f4f6',
        'detective-border-medium': '#e5e7eb',
        'detective-border-strong': '#d1d5db',

        // Rangos Maya
        'rank-detective-from': '#60a5fa',
        'rank-detective-to': '#2563eb',
        'rank-sargento-from': '#4ade80',
        'rank-sargento-to': '#16a34a',
        'rank-teniente-from': '#fb923c',
        'rank-teniente-to': '#ea580c',
        'rank-capitan-from': '#a78bfa',
        'rank-capitan-to': '#7c3aed',
        'rank-comisario-from': '#f59e0b',
        'rank-comisario-to': '#d97706',

        // Rareza de achievements
        'rarity-common': '#9ca3af',
        'rarity-rare': '#3b82f6',
        'rarity-epic': '#f97316',
        'rarity-legendary': '#f59e0b',
      },

      fontSize: {
        'detective-xs': ['0.75rem', { lineHeight: '1rem' }],
        'detective-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'detective-base': ['1rem', { lineHeight: '1.5rem' }],
        'detective-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'detective-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'detective-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'detective-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },

      boxShadow: {
        'detective': '0 4px 14px 0 rgba(30, 58, 138, 0.25)',
        'detective-lg': '0 8px 20px 0 rgba(30, 58, 138, 0.3)',
        'gold': '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
        'gold-lg': '0 8px 20px 0 rgba(245, 158, 11, 0.3)',
        'orange': '0 4px 14px 0 rgba(249, 115, 22, 0.25)',
        'orange-lg': '0 8px 20px 0 rgba(249, 115, 22, 0.3)',
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 16px 0 rgba(0, 0, 0, 0.15)',
        'card-detective': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'card-detective-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(249, 115, 22, 0.3)',
        'glow-strong': '0 0 30px rgba(249, 115, 22, 0.5)',
        'gold-glow': '0 0 20px rgba(245, 158, 11, 0.3)',
        'gold-glow-strong': '0 0 30px rgba(245, 158, 11, 0.5)',
      },

      borderRadius: {
        'detective': '0.75rem',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'detective-glow': 'detectiveGlow 2s ease-in-out infinite alternate',
        'gold-shine': 'goldShine 3s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        detectiveGlow: {
          '0%': { boxShadow: '0 0 5px rgba(30, 58, 138, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(30, 58, 138, 0.8)' },
        },
        goldShine: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(245, 158, 11, 0.5)' },
          '50%': { boxShadow: '0 0 25px rgba(245, 158, 11, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
```

---

## 3. Paleta de Colores

### 3.1 Colores Principales

```css
/* Detective Orange - Color primario */
--detective-orange-300: #fdba74;  /* Lightest */
--detective-orange-400: #fb923c;
--detective-orange: #f97316;      /* Principal */
--detective-orange-dark: #ea580c;
--detective-orange-700: #c2410c;  /* Darkest */

/* Detective Blue - Color secundario */
--detective-blue: #1e3a8a;

/* Detective Gold - Color de acento */
--detective-gold: #f59e0b;
```

**Uso:**
```tsx
<div className="bg-detective-orange text-white">
  Botón principal
</div>

<div className="bg-detective-blue text-white">
  Header
</div>

<div className="text-detective-gold">
  ML Coins: 1500
</div>
```

### 3.2 Colores de Rangos Maya

```css
/* Ajaw (Detective Novato) */
--rank-detective-from: #60a5fa;
--rank-detective-to: #2563eb;

/* Nacom (Sargento) */
--rank-sargento-from: #4ade80;
--rank-sargento-to: #16a34a;

/* Ah K'in (Teniente) */
--rank-teniente-from: #fb923c;
--rank-teniente-to: #ea580c;

/* Halach Uinic (Capitán) */
--rank-capitan-from: #a78bfa;
--rank-capitan-to: #7c3aed;

/* K'uk'ulkan (Comisario) */
--rank-comisario-from: #f59e0b;
--rank-comisario-to: #d97706;
```

**Uso con gradientes:**
```tsx
<div className="bg-gradient-to-r from-rank-teniente-from to-rank-teniente-to">
  <RankBadge rank="Ah K'in" />
</div>
```

### 3.3 Colores de Rareza

```css
/* Achievements / Items */
--rarity-common: #9ca3af;     /* Gris */
--rarity-rare: #3b82f6;       /* Azul */
--rarity-epic: #f97316;       /* Naranja */
--rarity-legendary: #f59e0b;  /* Dorado */
```

**Ejemplo:**
```tsx
<AchievementCard
  achievement={achievement}
  rarityColor={`rarity-${achievement.rarity}`}
/>
```

---

## 4. Tipografía

### 4.1 Escalas de Texto

```tsx
<p className="text-detective-xs">Extra pequeño</p>
<p className="text-detective-sm">Pequeño</p>
<p className="text-detective-base">Base (por defecto)</p>
<p className="text-detective-lg">Grande</p>
<p className="text-detective-xl">Extra grande</p>
<p className="text-detective-2xl">2XL</p>
<p className="text-detective-3xl">3XL</p>
```

### 4.2 Colores de Texto

```tsx
<p className="text-detective-text">Texto principal</p>
<p className="text-detective-text-secondary">Texto secundario</p>
<p className="text-detective-success">Éxito</p>
<p className="text-detective-danger">Error/Peligro</p>
<p className="text-detective-neutral">Neutral</p>
```

---

## 5. Componentes Base

### 5.1 DetectiveButton

```tsx
// Clases base
const baseClasses = 'px-4 py-2 rounded-detective font-medium transition-all duration-200';

// Variantes
const variants = {
  primary: 'bg-detective-orange hover:bg-detective-orange-dark text-white shadow-orange hover:shadow-orange-lg',
  secondary: 'bg-detective-blue hover:bg-blue-800 text-white shadow-detective hover:shadow-detective-lg',
  outline: 'border-2 border-detective-orange text-detective-orange hover:bg-detective-orange hover:text-white',
  ghost: 'text-detective-orange hover:bg-detective-bg',
};

// Tamaños
const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
};

// Ejemplo de uso
<button className={`${baseClasses} ${variants.primary} ${sizes.md}`}>
  Continuar
</button>
```

### 5.2 DetectiveCard

```tsx
// Card base
<div className="bg-white rounded-detective shadow-card hover:shadow-card-hover transition-shadow duration-200 p-6">
  <h3 className="text-detective-2xl font-bold text-detective-text mb-2">
    Título
  </h3>
  <p className="text-detective-text-secondary">
    Contenido de la card
  </p>
</div>

// Card con gradiente
<div className="bg-gradient-to-br from-detective-orange to-detective-orange-dark rounded-detective p-6 text-white shadow-orange-lg">
  <h3 className="text-detective-2xl font-bold">Destacado</h3>
</div>
```

### 5.3 ProgressBar

```tsx
<div className="w-full bg-detective-border-light rounded-full h-4 overflow-hidden">
  <div
    className="bg-gradient-to-r from-detective-orange to-detective-gold h-full transition-all duration-500"
    style={{ width: `${percentage}%` }}
  >
    <div className="h-full animate-detective-glow" />
  </div>
</div>
```

---

## 6. Shadows (Sombras)

### 6.1 Shadows Temáticas

```tsx
// Detective (azul)
<div className="shadow-detective">Detective shadow</div>
<div className="shadow-detective-lg">Detective shadow large</div>

// Gold (dorado)
<div className="shadow-gold">Gold shadow</div>
<div className="shadow-gold-lg">Gold shadow large</div>

// Orange (naranja)
<div className="shadow-orange">Orange shadow</div>
<div className="shadow-orange-lg">Orange shadow large</div>

// Cards
<div className="shadow-card hover:shadow-card-hover">Card con hover</div>
<div className="shadow-card-detective hover:shadow-card-detective-hover">
  Card detective con hover
</div>
```

### 6.2 Glow Effects

```tsx
// Glow naranja
<div className="shadow-glow hover:shadow-glow-strong">
  Efecto glow
</div>

// Glow dorado
<div className="shadow-gold-glow hover:shadow-gold-glow-strong">
  Efecto glow dorado
</div>
```

---

## 7. Animaciones

### 7.1 Animaciones Predefinidas

```tsx
// Fade in
<div className="animate-fade-in">
  Aparece con fade
</div>

// Slide up
<div className="animate-slide-up">
  Sube desde abajo
</div>

// Scale in
<div className="animate-scale-in">
  Escala desde pequeño
</div>

// Detective glow (infinito)
<div className="animate-detective-glow bg-detective-blue">
  Brillo pulsante
</div>

// Gold shine (infinito)
<div className="animate-gold-shine bg-detective-gold">
  Brillo dorado
</div>
```

### 7.2 Transiciones Custom

```tsx
// Transición suave de todos los cambios
<div className="transition-all duration-200 ease-in-out">
  Elemento con transición
</div>

// Transición solo de colores
<button className="transition-colors duration-300 bg-detective-orange hover:bg-detective-orange-dark">
  Botón con transición de color
</button>

// Transición de sombra
<div className="transition-shadow duration-200 shadow-card hover:shadow-card-hover">
  Card con transición de sombra
</div>
```

---

## 8. Responsive Design

### 8.1 Breakpoints

```javascript
// Breakpoints de Tailwind (default)
sm: '640px'   // Tablets
md: '768px'   // Tablets landscape
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large desktops
```

### 8.2 Ejemplos Responsive

```tsx
// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>

// Padding responsive
<div className="px-4 sm:px-6 lg:px-8">
  {/* Container */}
</div>

// Texto responsive
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Título responsive
</h1>

// Ocultar en mobile
<div className="hidden md:block">
  Visible solo en tablets+
</div>

// Mostrar solo en mobile
<div className="block md:hidden">
  Visible solo en mobile
</div>
```

---

## 9. Layouts

### 9.1 Container Centrado

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Contenido centrado con max-width */}
</div>
```

### 9.2 Flexbox

```tsx
// Fila centrada
<div className="flex items-center justify-center gap-4">
  {/* Items */}
</div>

// Columna con espaciado
<div className="flex flex-col gap-6">
  {/* Items */}
</div>

// Espacio entre elementos
<div className="flex justify-between items-center">
  <div>Izquierda</div>
  <div>Derecha</div>
</div>
```

### 9.3 Grid

```tsx
// Grid de 4 columnas
<div className="grid grid-cols-4 gap-4">
  {/* Items */}
</div>

// Grid auto-fit (responsive automático)
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  {/* Items se adaptan automáticamente */}
</div>
```

---

## 10. Estados Interactivos

### 10.1 Hover

```tsx
<button className="bg-detective-orange hover:bg-detective-orange-dark hover:scale-105 transition-all">
  Botón con hover
</button>

<div className="hover:shadow-lg hover:-translate-y-1 transition-all">
  Card con elevación en hover
</div>
```

### 10.2 Focus

```tsx
<input className="focus:ring-2 focus:ring-detective-orange focus:border-detective-orange" />

<button className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-detective-blue">
  Botón con focus ring
</button>
```

### 10.3 Active

```tsx
<button className="active:scale-95 active:bg-detective-orange-700">
  Botón con feedback al click
</button>
```

### 10.4 Disabled

```tsx
<button className="disabled:opacity-50 disabled:cursor-not-allowed" disabled>
  Botón deshabilitado
</button>
```

---

## 11. Utilitarios Custom

### 11.1 Gradientes de Rango

```tsx
// Componente helper
export const getRankGradient = (rank: MayaRank) => {
  const gradients: Record<MayaRank, string> = {
    Ajaw: 'from-rank-detective-from to-rank-detective-to',
    Nacom: 'from-rank-sargento-from to-rank-sargento-to',
    Ah K'in: 'from-rank-teniente-from to-rank-teniente-to',
    Halach Uinic: 'from-rank-capitan-from to-rank-capitan-to',
    K'uk'ulkan: 'from-rank-comisario-from to-rank-comisario-to',
  };
  return `bg-gradient-to-r ${gradients[rank]}`;
};

// Uso
<div className={getRankGradient(userRank)}>
  Contenido con gradiente de rango
</div>
```

### 11.2 Classes Helpers

```typescript
// src/shared/utils/classNames.ts
export const classNames = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Uso
<div className={classNames(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)}>
  Elemento con clases condicionales
</div>
```

---

## 12. Dark Mode (Futuro)

### 12.1 Preparación para Dark Mode

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // o 'media'
  // ...
};
```

```tsx
// Ejemplo de clases dark mode
<div className="bg-white dark:bg-gray-900 text-detective-text dark:text-gray-100">
  Contenido con dark mode
</div>
```

---

## 13. Mejores Prácticas

### 13.1 Consistencia

- Usar clases predefinidas del tema
- Evitar valores hardcodeados
- Mantener spacing consistente (4, 8, 16, 24, 32, 48, 64px)

### 13.2 Performance

- Minimizar uso de `@apply`
- Purgar clases no utilizadas
- Optimizar tamaño del CSS final

### 13.3 Accesibilidad

- Contraste de colores adecuado
- Focus visible en elementos interactivos
- Tamaños de texto legibles (mínimo 16px)

---

## 14. Recursos Visuales

### 14.1 Iconos

**Biblioteca:** Lucide React

```tsx
import { Search, User, Settings, LogOut } from 'lucide-react';

<Search className="w-5 h-5 text-detective-orange" />
<User className="w-6 h-6 text-detective-blue" />
```

### 14.2 Fuentes

**Fuente Principal:** System fonts stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif;
```

---

**Documento generado:** 2025-10-27
**Versión:** 1.0
**Framework:** Tailwind CSS v3.4.0
