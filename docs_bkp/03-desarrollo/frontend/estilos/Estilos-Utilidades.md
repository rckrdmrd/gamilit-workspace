# Utilidades de Estilos - Frontend GAMILIT

**Proyecto:** GAMILIT Platform v2
**Módulo:** Tema y Estilos - Utilidades y Helpers
**Framework:** Tailwind CSS v3.4.0
**Fecha:** 2025-11-01
**Versión:** 1.0

---

## RFC-0001 Header

```yaml
id: FRONTEND-ESTILOS-UTILIDADES-003
título: Utilidades y Helpers de Estilos
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

Este documento describe las **utilidades y helpers** de estilos del frontend de GAMILIT, incluyendo funciones para generar clases dinámicas, helpers de gradientes de rango, y utilidades Tailwind personalizadas.

---

## 2. Helpers de Clases

### 2.1 classNames Helper

**Ubicación:** `src/shared/utils/classNames.ts`

**Función:**
```typescript
/**
 * Combina clases CSS condicionales eliminando valores falsy
 * @param classes - Array de clases o condiciones
 * @returns String de clases combinadas
 */
export const classNames = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};
```

**Uso:**
```tsx
import { classNames } from '@shared/utils/classNames';

const MyComponent = ({ isActive, isDisabled }) => {
  return (
    <div
      className={classNames(
        'base-class',
        'px-4 py-2',
        isActive && 'bg-detective-orange text-white',
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isActive && !isDisabled && 'bg-white text-detective-text'
      )}
    >
      Contenido
    </div>
  );
};
```

**Ejemplo Avanzado:**
```tsx
const buttonClasses = classNames(
  // Base
  'px-4 py-2 rounded-detective font-medium transition-all',

  // Variantes
  variant === 'primary' && 'bg-detective-orange text-white',
  variant === 'secondary' && 'bg-detective-blue text-white',
  variant === 'outline' && 'border-2 border-detective-orange text-detective-orange',

  // Estados
  isLoading && 'opacity-75 cursor-wait',
  disabled && 'opacity-50 cursor-not-allowed',

  // Tamaños
  size === 'sm' && 'text-sm px-3 py-1.5',
  size === 'md' && 'text-base px-4 py-2',
  size === 'lg' && 'text-lg px-6 py-3',

  // Custom
  className
);
```

---

### 2.2 getRankGradient Helper

**Ubicación:** `src/shared/utils/styleHelpers.ts`

**Función:**
```typescript
import { MayaRank } from '@shared/types';

/**
 * Obtiene las clases de gradiente para un rango Maya
 * @param rank - Rango Maya
 * @returns String de clases de gradiente
 */
export const getRankGradient = (rank: MayaRank): string => {
  const gradients: Record<MayaRank, string> = {
    Ajaw: 'from-rank-detective-from to-rank-detective-to',
    Nacom: 'from-rank-sargento-from to-rank-sargento-to',
    Ah K'in: 'from-rank-teniente-from to-rank-teniente-to',
    Halach Uinic: 'from-rank-capitan-from to-rank-capitan-to',
    K'uk'ulkan: 'from-rank-comisario-from to-rank-comisario-to',
  };

  return `bg-gradient-to-r ${gradients[rank]}`;
};
```

**Uso:**
```tsx
import { getRankGradient } from '@shared/utils/styleHelpers';

<div className={`${getRankGradient(userRank)} p-6 rounded-detective`}>
  Contenido con gradiente de rango
</div>
```

---

### 2.3 getRarityColor Helper

**Ubicación:** `src/shared/utils/styleHelpers.ts`

**Función:**
```typescript
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Obtiene el color para una rareza
 * @param rarity - Nivel de rareza
 * @returns String de clase de color
 */
export const getRarityColor = (rarity: Rarity): string => {
  const colors: Record<Rarity, string> = {
    common: 'text-rarity-common',
    rare: 'text-rarity-rare',
    epic: 'text-rarity-epic',
    legendary: 'text-rarity-legendary',
  };

  return colors[rarity];
};

/**
 * Obtiene el color de borde para una rareza
 * @param rarity - Nivel de rareza
 * @returns String de clase de border
 */
export const getRarityBorder = (rarity: Rarity): string => {
  const borders: Record<Rarity, string> = {
    common: 'border-rarity-common',
    rare: 'border-rarity-rare',
    epic: 'border-rarity-epic',
    legendary: 'border-rarity-legendary',
  };

  return borders[rarity];
};
```

**Uso:**
```tsx
import { getRarityColor, getRarityBorder } from '@shared/utils/styleHelpers';

<div className={`border-4 ${getRarityBorder(achievement.rarity)} rounded-detective p-4`}>
  <h3 className={`font-bold ${getRarityColor(achievement.rarity)}`}>
    {achievement.title}
  </h3>
</div>
```

---

### 2.4 getDifficultyColor Helper

**Ubicación:** `src/shared/utils/styleHelpers.ts`

**Función:**
```typescript
export type Difficulty = 'facil' | 'medio' | 'dificil' | 'experto';

/**
 * Obtiene el color de fondo para una dificultad
 * @param difficulty - Nivel de dificultad
 * @returns String de clases de color
 */
export const getDifficultyColor = (difficulty: Difficulty): string => {
  const colors: Record<Difficulty, string> = {
    facil: 'bg-green-100 text-green-800',
    medio: 'bg-yellow-100 text-yellow-800',
    dificil: 'bg-orange-100 text-orange-800',
    experto: 'bg-red-100 text-red-800',
  };

  return colors[difficulty];
};
```

**Uso:**
```tsx
import { getDifficultyColor } from '@shared/utils/styleHelpers';

<span className={`px-3 py-1 rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
  {exercise.difficulty}
</span>
```

---

## 3. Utilidades Tailwind Custom

### 3.1 Gradientes de Rango

**Clases disponibles:**
```tsx
// Aplicar directamente en JSX
<div className="bg-gradient-to-r from-rank-detective-from to-rank-detective-to">
  Detective Novato
</div>

<div className="bg-gradient-to-r from-rank-sargento-from to-rank-sargento-to">
  Sargento
</div>

<div className="bg-gradient-to-r from-rank-teniente-from to-rank-teniente-to">
  Teniente
</div>

<div className="bg-gradient-to-r from-rank-capitan-from to-rank-capitan-to">
  Capitán
</div>

<div className="bg-gradient-to-r from-rank-comisario-from to-rank-comisario-to">
  Comisario
</div>
```

**Variantes de dirección:**
```tsx
// De izquierda a derecha
<div className="bg-gradient-to-r from-rank-teniente-from to-rank-teniente-to" />

// De arriba a abajo
<div className="bg-gradient-to-b from-rank-teniente-from to-rank-teniente-to" />

// Diagonal
<div className="bg-gradient-to-br from-rank-teniente-from to-rank-teniente-to" />
```

---

### 3.2 Sombras con Glow

**Combinación de sombras:**
```tsx
// Sombra naranja con glow
<div className="shadow-orange hover:shadow-glow-strong transition-shadow">
  Card con glow en hover
</div>

// Sombra dorada con glow
<div className="shadow-gold hover:shadow-gold-glow-strong transition-shadow">
  Card dorada con glow en hover
</div>
```

---

### 3.3 Animaciones Compuestas

**Fade + Slide Up:**
```tsx
<div className="animate-fade-in">
  <div className="animate-slide-up">
    Elemento con doble animación
  </div>
</div>
```

**Glow Infinito:**
```tsx
<div className="bg-detective-gold rounded-full w-16 h-16 animate-gold-shine">
  Badge con brillo
</div>
```

---

## 4. Responsive Utilities

### 4.1 Grid Responsive Helper

**Función:**
```typescript
/**
 * Genera clases de grid responsive
 * @param cols - Número de columnas en desktop
 * @returns String de clases de grid
 */
export const getResponsiveGrid = (cols: 1 | 2 | 3 | 4): string => {
  const grids: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return `grid ${grids[cols]}`;
};
```

**Uso:**
```tsx
import { getResponsiveGrid } from '@shared/utils/styleHelpers';

<div className={`${getResponsiveGrid(3)} gap-6`}>
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

---

### 4.2 Spacing Responsive Helper

**Función:**
```typescript
/**
 * Genera padding responsive
 * @param base - Padding base en mobile
 * @returns String de clases de padding
 */
export const getResponsivePadding = (base: 4 | 6 | 8): string => {
  const paddings: Record<number, string> = {
    4: 'px-4 sm:px-6 lg:px-8',
    6: 'px-6 sm:px-8 lg:px-12',
    8: 'px-8 sm:px-12 lg:px-16',
  };

  return paddings[base];
};
```

---

## 5. Custom Hooks de Estilos

### 5.1 useTheme Hook

**Ubicación:** `src/shared/hooks/useTheme.ts`

```typescript
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return { theme, toggleTheme };
};
```

**Uso:**
```tsx
import { useTheme } from '@shared/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
```

---

### 5.2 useMediaQuery Hook

**Ubicación:** `src/shared/hooks/useMediaQuery.ts`

```typescript
import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};
```

**Uso:**
```tsx
import { useMediaQuery } from '@shared/hooks/useMediaQuery';

const ResponsiveComponent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
};
```

---

## 6. Iconos

### 6.1 Lucide React

**Instalación:**
```bash
npm install lucide-react
```

**Uso:**
```tsx
import {
  Search,
  User,
  Settings,
  LogOut,
  Home,
  BookOpen,
  Trophy,
  ShoppingBag,
  Users,
  Zap,
  Coins,
  Bell,
  Check,
  X,
  ChevronRight,
  Loader2
} from 'lucide-react';

// Iconos básicos
<Search className="w-5 h-5 text-detective-orange" />
<User className="w-6 h-6 text-detective-blue" />

// Con animación
<Loader2 className="w-5 h-5 animate-spin text-detective-orange" />

// Con estados
<Check className={`w-5 h-5 ${isSuccess ? 'text-detective-success' : 'text-gray-400'}`} />
```

**Tamaños comunes:**
```tsx
// Extra pequeño (16px)
<Icon className="w-4 h-4" />

// Pequeño (20px)
<Icon className="w-5 h-5" />

// Mediano (24px)
<Icon className="w-6 h-6" />

// Grande (32px)
<Icon className="w-8 h-8" />

// Extra grande (48px)
<Icon className="w-12 h-12" />
```

---

## 7. Constantes de Estilos

### 7.1 Archivo de Constantes

**Ubicación:** `src/shared/constants/styles.ts`

```typescript
// Colores
export const COLORS = {
  DETECTIVE_ORANGE: '#f97316',
  DETECTIVE_BLUE: '#1e3a8a',
  DETECTIVE_GOLD: '#f59e0b',
  SUCCESS: '#10b981',
  DANGER: '#ef4444',
  NEUTRAL: '#6b7280',
} as const;

// Spacing
export const SPACING = {
  XS: '0.25rem',  // 4px
  SM: '0.5rem',   // 8px
  MD: '1rem',     // 16px
  LG: '1.5rem',   // 24px
  XL: '2rem',     // 32px
  '2XL': '3rem',  // 48px
} as const;

// Breakpoints
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// Border Radius
export const BORDER_RADIUS = {
  DETECTIVE: '0.75rem', // 12px
  FULL: '9999px',
} as const;

// Transitions
export const TRANSITIONS = {
  DEFAULT: 'all 0.2s ease-in-out',
  FAST: 'all 0.1s ease-in-out',
  SLOW: 'all 0.3s ease-in-out',
} as const;
```

---

## 8. Mejores Prácticas

### 8.1 Uso de Helpers

✅ **Correcto:**
```tsx
<div className={classNames(
  'base-class',
  isActive && 'active-class',
  getRankGradient(rank)
)}>
  Contenido
</div>
```

❌ **Incorrecto:**
```tsx
<div className={`base-class ${isActive ? 'active-class' : ''} bg-gradient-to-r from-${rankFrom} to-${rankTo}`}>
  Contenido
</div>
```

### 8.2 Consistencia

- **Usar helpers** para lógica repetitiva
- **Centralizar constantes** de estilos
- **Evitar valores mágicos** hardcodeados

### 8.3 Performance

- **Memoizar** helpers costosos
- **Evitar** cálculos en render
- **Usar** clases estáticas cuando sea posible

---

## 9. Referencias

- **Archivo Original:** `TEMA-Y-ESTILOS.md` (líneas 551-666)
- **Configuración del Tema:** Ver `Tema-Configuracion.md`
- **Estilos de Componentes:** Ver `Estilos-Componentes.md`
- **README Principal:** Ver `estilos/README.md`

---

**Documento generado:** 2025-11-01
**Versión:** 1.0
**Framework:** Tailwind CSS v3.4.0
