# Configuración del Tema - Frontend GAMILIT

**Proyecto:** GAMILIT Platform v2
**Módulo:** Tema y Estilos - Configuración Base
**Framework:** Tailwind CSS v3.4.0
**Fecha:** 2025-11-01
**Versión:** 1.0

---

## RFC-0001 Header

```yaml
id: FRONTEND-ESTILOS-TEMA-001
título: Configuración del Tema Detective
estado: Implementado
fecha_creación: 2025-10-27
última_actualización: 2025-11-01
autor: Equipo Frontend GAMILIT
```

**Historial de Cambios:**
- **2025-11-01:** Modularización desde TEMA-Y-ESTILOS.md
- **2025-10-27:** Creación inicial

---

## 1. Resumen Ejecutivo

Este documento describe la **configuración del tema Detective** para GAMILIT Platform, incluyendo la configuración de Tailwind CSS, paleta de colores, tipografía y animaciones base.

### Características del Tema:

- **Colores Principales:** Naranja (#f97316), Azul (#1e3a8a), Dorado (#f59e0b)
- **Tailwind CSS:** Framework utility-first
- **Dark Mode:** Preparado (futuro)
- **Responsive:** Mobile-first design
- **Animations:** Transiciones suaves personalizadas

---

## 2. Configuración de Tailwind CSS

### 2.1 tailwind.config.js

**Ubicación:** `/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Colores personalizados
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

      // Tipografía personalizada
      fontSize: {
        'detective-xs': ['0.75rem', { lineHeight: '1rem' }],
        'detective-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'detective-base': ['1rem', { lineHeight: '1.5rem' }],
        'detective-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'detective-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'detective-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'detective-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },

      // Sombras personalizadas
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

      // Border radius personalizado
      borderRadius: {
        'detective': '0.75rem',
      },

      // Animaciones personalizadas
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'detective-glow': 'detectiveGlow 2s ease-in-out infinite alternate',
        'gold-shine': 'goldShine 3s ease-in-out infinite',
      },

      // Keyframes de animaciones
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

**Detective Orange (Primario):**
```css
--detective-orange-300: #fdba74;  /* Lightest */
--detective-orange-400: #fb923c;
--detective-orange: #f97316;      /* Principal */
--detective-orange-dark: #ea580c;
--detective-orange-700: #c2410c;  /* Darkest */
```

**Uso:**
```tsx
<div className="bg-detective-orange text-white">
  Botón principal
</div>

<div className="border-2 border-detective-orange-dark">
  Card con borde
</div>
```

**Detective Blue (Secundario):**
```css
--detective-blue: #1e3a8a;
```

**Uso:**
```tsx
<div className="bg-detective-blue text-white">
  Header
</div>
```

**Detective Gold (Acento):**
```css
--detective-gold: #f59e0b;
```

**Uso:**
```tsx
<div className="text-detective-gold">
  ML Coins: 1500
</div>
```

---

### 3.2 Colores de Fondos

```css
--detective-bg: #fffbeb;           /* Fondo principal claro */
--detective-bg-secondary: #fef3c7; /* Fondo secundario */
```

**Uso:**
```tsx
<div className="bg-detective-bg min-h-screen">
  {/* Contenido */}
</div>
```

---

### 3.3 Colores de Texto

```css
--detective-text: #1f2937;          /* Texto principal */
--detective-text-secondary: #6b7280; /* Texto secundario */
```

**Uso:**
```tsx
<h1 className="text-detective-text">Título</h1>
<p className="text-detective-text-secondary">Subtítulo</p>
```

---

### 3.4 Colores de Estados

```css
--detective-success: #10b981; /* Verde - Éxito */
--detective-danger: #ef4444;  /* Rojo - Error/Peligro */
--detective-neutral: #6b7280; /* Gris - Neutral */
```

**Uso:**
```tsx
<div className="bg-detective-success text-white">
  ¡Éxito!
</div>

<div className="bg-detective-danger text-white">
  Error
</div>
```

---

### 3.5 Colores de Rangos Maya

Cada rango tiene un gradiente `from` → `to`:

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

---

### 3.6 Colores de Rareza

Para achievements e items:

```css
--rarity-common: #9ca3af;     /* Gris */
--rarity-rare: #3b82f6;       /* Azul */
--rarity-epic: #f97316;       /* Naranja */
--rarity-legendary: #f59e0b;  /* Dorado */
```

**Uso:**
```tsx
<AchievementCard
  achievement={achievement}
  className={`border-4 border-rarity-${achievement.rarity}`}
/>
```

---

## 4. Tipografía

### 4.1 Escalas de Texto

```typescript
const fontSizes = {
  'detective-xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
  'detective-sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  'detective-base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
  'detective-lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  'detective-xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  'detective-2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
  'detective-3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
};
```

**Uso:**
```tsx
<p className="text-detective-xs">Extra pequeño</p>
<p className="text-detective-sm">Pequeño</p>
<p className="text-detective-base">Base (por defecto)</p>
<p className="text-detective-lg">Grande</p>
<p className="text-detective-xl">Extra grande</p>
<p className="text-detective-2xl">2XL - Títulos</p>
<p className="text-detective-3xl">3XL - Títulos grandes</p>
```

---

### 4.2 Fuente del Sistema

**Stack de fuentes:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif;
```

**Ventajas:**
- Rendimiento óptimo (fuentes del sistema)
- Sin latencia de carga
- Consistencia en diferentes plataformas

---

## 5. Sombras (Box Shadows)

### 5.1 Sombras Temáticas

**Detective (Azul):**
```tsx
<div className="shadow-detective">Detective shadow</div>
<div className="shadow-detective-lg">Detective shadow large</div>
```

**Gold (Dorado):**
```tsx
<div className="shadow-gold">Gold shadow</div>
<div className="shadow-gold-lg">Gold shadow large</div>
```

**Orange (Naranja):**
```tsx
<div className="shadow-orange">Orange shadow</div>
<div className="shadow-orange-lg">Orange shadow large</div>
```

---

### 5.2 Sombras de Cards

```tsx
<div className="shadow-card hover:shadow-card-hover">
  Card básica con hover
</div>

<div className="shadow-card-detective hover:shadow-card-detective-hover">
  Card detective con hover elevado
</div>
```

---

### 5.3 Efectos Glow

**Glow Naranja:**
```tsx
<div className="shadow-glow hover:shadow-glow-strong">
  Efecto glow sutil
</div>
```

**Glow Dorado:**
```tsx
<div className="shadow-gold-glow hover:shadow-gold-glow-strong">
  Efecto glow dorado
</div>
```

**Uso con animación:**
```tsx
<div className="shadow-glow animate-detective-glow">
  Glow animado
</div>
```

---

## 6. Border Radius

### 6.1 Detective Border Radius

**Valor:** `0.75rem` (12px)

```tsx
<div className="rounded-detective">
  Elemento con border radius detective
</div>
```

**Combinado con sombras:**
```tsx
<div className="rounded-detective shadow-card">
  Card con estilo detective
</div>
```

---

## 7. Animaciones

### 7.1 Animaciones Predefinidas

**Fade In:**
```tsx
<div className="animate-fade-in">
  Aparece con fade (0.5s)
</div>
```

**Slide Up:**
```tsx
<div className="animate-slide-up">
  Sube desde abajo (0.3s)
</div>
```

**Scale In:**
```tsx
<div className="animate-scale-in">
  Escala desde pequeño (0.2s)
</div>
```

**Detective Glow (infinito):**
```tsx
<div className="animate-detective-glow bg-detective-blue">
  Brillo pulsante azul (2s loop)
</div>
```

**Gold Shine (infinito):**
```tsx
<div className="animate-gold-shine bg-detective-gold">
  Brillo dorado (3s loop)
</div>
```

---

### 7.2 Keyframes Personalizados

```javascript
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
}
```

---

## 8. Responsive Design

### 8.1 Breakpoints de Tailwind (Default)

```javascript
sm: '640px'   // Tablets
md: '768px'   // Tablets landscape
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large desktops
```

**Uso:**
```tsx
<div className="text-base md:text-lg lg:text-xl">
  Texto responsive
</div>
```

---

## 9. Dark Mode (Preparación Futura)

### 9.1 Configuración

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // o 'media' para preferencias del sistema
  // ...
};
```

### 9.2 Ejemplo de Uso

```tsx
<div className="bg-white dark:bg-gray-900 text-detective-text dark:text-gray-100">
  Contenido con dark mode
</div>
```

---

## 10. Mejores Prácticas

### 10.1 Consistencia

- Usar **clases predefinidas** del tema
- Evitar **valores hardcodeados** en CSS inline
- Mantener **spacing consistente** (múltiplos de 4px: 4, 8, 16, 24, 32, 48, 64)

### 10.2 Performance

- Minimizar uso de `@apply` en CSS
- Configurar **PurgeCSS** correctamente
- Optimizar el tamaño del CSS final

### 10.3 Accesibilidad

- Verificar **contraste de colores** (WCAG AA mínimo)
- Focus visible en elementos interactivos
- Tamaños de texto legibles (mínimo 16px)

---

## 11. Referencias

- **Archivo Original:** `TEMA-Y-ESTILOS.md` (líneas 1-240)
- **Estilos de Componentes:** Ver `Estilos-Componentes.md`
- **Utilidades de Estilos:** Ver `Estilos-Utilidades.md`
- **README Principal:** Ver `estilos/README.md`

---

**Documento generado:** 2025-11-01
**Versión:** 1.0
**Framework:** Tailwind CSS v3.4.0
