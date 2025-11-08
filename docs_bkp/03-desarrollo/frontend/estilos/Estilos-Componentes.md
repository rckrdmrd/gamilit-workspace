# Estilos de Componentes - Frontend GAMILIT

**Proyecto:** GAMILIT Platform v2
**Módulo:** Tema y Estilos - Componentes Específicos
**Framework:** Tailwind CSS v3.4.0
**Fecha:** 2025-11-01
**Versión:** 1.0

---

## RFC-0001 Header

```yaml
id: FRONTEND-ESTILOS-COMPONENTES-002
título: Estilos de Componentes Específicos
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

Este documento describe los **estilos específicos de componentes** del frontend de GAMILIT, incluyendo buttons, cards, progress bars, y otros componentes UI con sus variantes y estados interactivos.

---

## 2. Componentes Base

### 2.1 DetectiveButton

**Clases Base:**
```tsx
const baseClasses = 'px-4 py-2 rounded-detective font-medium transition-all duration-200';
```

**Variantes:**
```tsx
const variants = {
  primary: 'bg-detective-orange hover:bg-detective-orange-dark text-white shadow-orange hover:shadow-orange-lg',
  secondary: 'bg-detective-blue hover:bg-blue-800 text-white shadow-detective hover:shadow-detective-lg',
  outline: 'border-2 border-detective-orange text-detective-orange hover:bg-detective-orange hover:text-white',
  ghost: 'text-detective-orange hover:bg-detective-bg',
};
```

**Tamaños:**
```tsx
const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
};
```

**Ejemplo Completo:**
```tsx
<button
  className={`
    ${baseClasses}
    ${variants.primary}
    ${sizes.md}
  `}
>
  Continuar
</button>
```

**Resultado CSS:**
```css
.detective-button-primary {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-radius: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
  background-color: #f97316;
  color: white;
  box-shadow: 0 4px 14px 0 rgba(249, 115, 22, 0.25);
}

.detective-button-primary:hover {
  background-color: #ea580c;
  box-shadow: 0 8px 20px 0 rgba(249, 115, 22, 0.3);
}
```

---

### 2.2 DetectiveCard

**Card Base:**
```tsx
<div className="bg-white rounded-detective shadow-card hover:shadow-card-hover transition-shadow duration-200 p-6">
  <h3 className="text-detective-2xl font-bold text-detective-text mb-2">
    Título
  </h3>
  <p className="text-detective-text-secondary">
    Contenido de la card
  </p>
</div>
```

**Card con Gradiente (Gold):**
```tsx
<div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-detective p-6 shadow-gold">
  <h3 className="text-detective-2xl font-bold text-detective-text">
    Destacado
  </h3>
</div>
```

**Card con Gradiente (Orange):**
```tsx
<div className="bg-gradient-to-br from-detective-orange to-detective-orange-dark rounded-detective p-6 text-white shadow-orange-lg">
  <h3 className="text-detective-2xl font-bold">
    Card Naranja
  </h3>
</div>
```

**Card Hoverable:**
```tsx
<div className="bg-white rounded-detective shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-pointer p-6">
  <h3>Card con elevación en hover</h3>
</div>
```

---

### 2.3 ProgressBar

**Progress Bar Básica:**
```tsx
<div className="w-full bg-detective-border-light rounded-full h-4 overflow-hidden">
  <div
    className="bg-gradient-to-r from-detective-orange to-detective-gold h-full transition-all duration-500"
    style={{ width: `${percentage}%` }}
  />
</div>
```

**Progress Bar con Animación:**
```tsx
<div className="w-full bg-detective-border-light rounded-full h-4 overflow-hidden">
  <div
    className="bg-gradient-to-r from-detective-orange to-detective-gold h-full transition-all duration-500 animate-detective-glow"
    style={{ width: `${percentage}%` }}
  />
</div>
```

**Progress Bar de XP:**
```tsx
<div className="w-full">
  <div className="flex justify-between mb-1">
    <span className="text-detective-sm text-detective-text-secondary">XP</span>
    <span className="text-detective-sm font-medium text-detective-text">
      {currentXP} / {xpToNextLevel}
    </span>
  </div>
  <div className="w-full bg-detective-border-light rounded-full h-4 overflow-hidden">
    <div
      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
      style={{ width: `${(currentXP / xpToNextLevel) * 100}%` }}
    />
  </div>
</div>
```

---

### 2.4 RankBadge

**Badge Básico:**
```tsx
<div className="w-16 h-16 bg-gradient-to-br from-rank-teniente-from to-rank-teniente-to rounded-full flex items-center justify-center text-white font-bold shadow-lg">
  T
</div>
```

**Badge con Nombre:**
```tsx
<div className="flex items-center gap-2">
  <div className="w-16 h-16 bg-gradient-to-br from-rank-teniente-from to-rank-teniente-to rounded-full flex items-center justify-center text-white font-bold shadow-lg">
    T
  </div>
  <div className="flex flex-col">
    <span className="text-detective-base font-bold text-detective-text">
      Teniente
    </span>
    <span className="text-detective-xs text-detective-text-secondary">
      Nivel 5
    </span>
  </div>
</div>
```

**Badge Animado:**
```tsx
<div className="w-16 h-16 bg-gradient-to-br from-rank-comisario-from to-rank-comisario-to rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-gold-shine">
  M
</div>
```

---

### 2.5 Input Detective

**Input Básico:**
```tsx
<input
  type="text"
  className="
    w-full px-4 py-2
    border-2 border-detective-border-medium rounded-detective
    focus:outline-none focus:ring-2 focus:ring-detective-orange focus:border-detective-orange
    transition-all duration-200
  "
  placeholder="Escribe aquí..."
/>
```

**Input con Icono:**
```tsx
<div className="relative">
  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-detective-text-secondary">
    <Search className="w-5 h-5" />
  </div>
  <input
    type="text"
    className="
      w-full pl-10 pr-4 py-2
      border-2 border-detective-border-medium rounded-detective
      focus:outline-none focus:ring-2 focus:ring-detective-orange focus:border-detective-orange
    "
    placeholder="Buscar..."
  />
</div>
```

**Input con Error:**
```tsx
<div className="w-full">
  <input
    type="email"
    className="
      w-full px-4 py-2
      border-2 border-detective-danger rounded-detective
      focus:outline-none focus:ring-2 focus:ring-detective-danger
    "
  />
  <p className="mt-1 text-detective-xs text-detective-danger">
    Email inválido
  </p>
</div>
```

---

## 3. Layouts

### 3.1 Container Centrado

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Contenido centrado con max-width */}
</div>
```

**Variantes de Max-Width:**
```tsx
// Pequeño
<div className="max-w-sm mx-auto px-4">Content</div>

// Mediano
<div className="max-w-md mx-auto px-4">Content</div>

// Grande
<div className="max-w-lg mx-auto px-4">Content</div>

// Extra grande
<div className="max-w-xl mx-auto px-4">Content</div>

// 2XL
<div className="max-w-2xl mx-auto px-4">Content</div>

// 7XL (default para páginas)
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">Content</div>
```

---

### 3.2 Flexbox

**Fila Centrada:**
```tsx
<div className="flex items-center justify-center gap-4">
  {/* Items */}
</div>
```

**Columna con Espaciado:**
```tsx
<div className="flex flex-col gap-6">
  {/* Items */}
</div>
```

**Espacio Entre Elementos:**
```tsx
<div className="flex justify-between items-center">
  <div>Izquierda</div>
  <div>Derecha</div>
</div>
```

**Flex Responsive:**
```tsx
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">Columna 1</div>
  <div className="flex-1">Columna 2</div>
</div>
```

---

### 3.3 Grid

**Grid de 4 Columnas:**
```tsx
<div className="grid grid-cols-4 gap-4">
  {/* Items */}
</div>
```

**Grid Responsive:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

**Grid Auto-Fit:**
```tsx
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  {/* Items se adaptan automáticamente */}
</div>
```

---

## 4. Estados Interactivos

### 4.1 Hover

**Botón con Hover:**
```tsx
<button className="bg-detective-orange hover:bg-detective-orange-dark hover:scale-105 transition-all px-6 py-3 rounded-detective text-white">
  Botón con hover
</button>
```

**Card con Elevación:**
```tsx
<div className="bg-white rounded-detective shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
  Card con elevación en hover
</div>
```

**Link con Efecto:**
```tsx
<a className="text-detective-orange hover:text-detective-orange-dark hover:underline transition-colors">
  Link con hover
</a>
```

---

### 4.2 Focus

**Input con Focus Ring:**
```tsx
<input className="border-2 border-detective-border-medium focus:ring-2 focus:ring-detective-orange focus:border-detective-orange focus:outline-none" />
```

**Botón con Focus:**
```tsx
<button className="bg-detective-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-detective-blue px-6 py-3 rounded-detective">
  Botón con focus ring
</button>
```

---

### 4.3 Active

**Botón con Feedback al Click:**
```tsx
<button className="bg-detective-orange active:scale-95 active:bg-detective-orange-700 transition-all px-6 py-3 rounded-detective">
  Botón con feedback
</button>
```

---

### 4.4 Disabled

**Botón Deshabilitado:**
```tsx
<button
  className="bg-detective-orange disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-detective"
  disabled
>
  Botón deshabilitado
</button>
```

**Input Deshabilitado:**
```tsx
<input
  className="border-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
  disabled
/>
```

---

## 5. Transiciones

### 5.1 Transición Suave de Todo

```tsx
<div className="transition-all duration-200 ease-in-out">
  Elemento con transición
</div>
```

### 5.2 Transición Solo de Colores

```tsx
<button className="bg-detective-orange hover:bg-detective-orange-dark transition-colors duration-300">
  Botón con transición de color
</button>
```

### 5.3 Transición de Sombra

```tsx
<div className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
  Card con transición de sombra
</div>
```

### 5.4 Transición de Transform

```tsx
<div className="hover:-translate-y-1 hover:scale-105 transition-transform duration-200">
  Elemento con movimiento en hover
</div>
```

---

## 6. Responsive Design

### 6.1 Grid Responsive

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

### 6.2 Padding Responsive

```tsx
<div className="px-4 sm:px-6 lg:px-8">
  {/* Container */}
</div>
```

### 6.3 Texto Responsive

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Título responsive
</h1>
```

### 6.4 Mostrar/Ocultar en Mobile

**Ocultar en mobile:**
```tsx
<div className="hidden md:block">
  Visible solo en tablets+
</div>
```

**Mostrar solo en mobile:**
```tsx
<div className="block md:hidden">
  Visible solo en mobile
</div>
```

---

## 7. Utilidades Comunes

### 7.1 Spacing

**Consistencia en spacing (múltiplos de 4px):**
```tsx
<div className="p-4">Padding 16px</div>
<div className="p-6">Padding 24px</div>
<div className="p-8">Padding 32px</div>

<div className="gap-4">Gap 16px</div>
<div className="gap-6">Gap 24px</div>
<div className="gap-8">Gap 32px</div>
```

### 7.2 Truncate Text

```tsx
<p className="truncate">
  Texto largo que se truncará con ellipsis...
</p>
```

### 7.3 Line Clamp

```tsx
<p className="line-clamp-2">
  Texto que se mostrará en máximo 2 líneas con ellipsis al final
</p>
```

---

## 8. Mejores Prácticas

### 8.1 Consistencia

- Usar **clases predefinidas** del sistema de diseño
- Evitar **valores hardcodeados** (usar tokens del tema)
- Mantener **spacing consistente** (múltiplos de 4: 4, 8, 16, 24, 32, 48, 64px)

### 8.2 Performance

- Minimizar **transiciones complejas** en elementos que se redibujan frecuentemente
- Usar **will-change** solo cuando sea necesario
- Optimizar **animaciones** para 60fps

### 8.3 Accesibilidad

- **Contraste mínimo** WCAG AA (4.5:1 para texto normal)
- **Focus visible** en todos los elementos interactivos
- **Tamaños mínimos** de toque: 44x44px en mobile

---

## 9. Referencias

- **Archivo Original:** `TEMA-Y-ESTILOS.md` (líneas 265-550)
- **Configuración del Tema:** Ver `Tema-Configuracion.md`
- **Utilidades de Estilos:** Ver `Estilos-Utilidades.md`
- **README Principal:** Ver `estilos/README.md`

---

**Documento generado:** 2025-11-01
**Versión:** 1.0
**Framework:** Tailwind CSS v3.4.0
