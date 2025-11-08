# US-FUND-008: UI/UX base

**Épica:** EAI-001 - Fundamentos
**Sprint:** Mes 1, Semana 2-3
**Story Points:** 6 SP
**Presupuesto:** $2,200 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **usuario**, quiero **una interfaz atractiva, consistente y fácil de usar** para **tener una experiencia agradable al usar la plataforma**.

**Contexto del Alcance Inicial:**
El MVP establece el sistema de diseño base con componentes UI reutilizables, un tema inspirado en la cultura Maya, y layout responsive. No incluye animaciones complejas ni componentes avanzados, que se agregarán en extensiones futuras.

---

## Criterios de Aceptación

### Componentes Base
- [ ] **CA-01:** Componentes base creados: Button, Input, Card, Modal, Badge
- [ ] **CA-02:** Todos los componentes tienen variantes (primary, secondary, danger, etc.)
- [ ] **CA-03:** Componentes son accesibles (ARIA labels, keyboard navigation)
- [ ] **CA-04:** Componentes documentados con ejemplos

### Tema y Colores
- [ ] **CA-05:** Paleta de colores Maya definida y aplicada
- [ ] **CA-06:** Tipografía consistente (font families, sizes, weights)
- [ ] **CA-07:** Espaciado consistente (margins, paddings)
- [ ] **CA-08:** Modo claro (sin modo oscuro en MVP)

### Responsive
- [ ] **CA-09:** Layout responsive en mobile (320px+), tablet (768px+), desktop (1024px+)
- [ ] **CA-10:** Componentes se adaptan a diferentes tamaños de pantalla
- [ ] **CA-11:** Touch-friendly en mobile (botones de mín 44px)

### UX
- [ ] **CA-12:** Loading states (spinners, skeletons)
- [ ] **CA-13:** Estados de error amigables
- [ ] **CA-14:** Feedback visual en interacciones (hover, focus, active)
- [ ] **CA-15:** Mensajes de éxito/error con toasts

---

## Especificaciones Técnicas

### Tema Maya - Paleta de Colores

```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // Colores principales inspirados en cultura Maya
        maya: {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e', // Primary
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          terracota: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626', // Accent
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
          },
          gold: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            500: '#eab308', // Secondary
            600: '#ca8a04',
            700: '#a16207',
            800: '#854d0e',
            900: '#713f12',
          },
          stone: {
            50: '#fafaf9',
            100: '#f5f5f4',
            200: '#e7e5e4',
            300: '#d6d3d1',
            400: '#a8a29e',
            500: '#78716c',
            600: '#57534e',
            700: '#44403c',
            800: '#292524',
            900: '#1c1917',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
}
```

### Componentes Base

**Button Component:**
```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, children, className, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-maya-green-500 text-white hover:bg-maya-green-600 focus:ring-maya-green-500',
      secondary: 'bg-maya-gold-500 text-white hover:bg-maya-gold-600 focus:ring-maya-gold-500',
      outline: 'border-2 border-maya-green-500 text-maya-green-500 hover:bg-maya-green-50 focus:ring-maya-green-500',
      ghost: 'text-maya-green-700 hover:bg-maya-green-50 focus:ring-maya-green-500',
      danger: 'bg-maya-terracota-600 text-white hover:bg-maya-terracota-700 focus:ring-maya-terracota-500',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Spinner className="mr-2" />}
        {children}
      </button>
    )
  }
)
```

**Input Component:**
```typescript
// components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-md shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-maya-green-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    )
  }
)
```

**Card Component:**
```typescript
// components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover, padding = 'md', className, children, ...props }, ref) => {
    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-lg shadow-md border border-gray-200',
          paddings[padding],
          hover && 'transition-shadow hover:shadow-lg cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
```

**Badge Component:**
```typescript
// components/ui/Badge.tsx
import { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
}

export function Badge({ variant = 'neutral', size = 'md', className, children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
```

**Modal Component:**
```typescript
// components/ui/Modal.tsx
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full ${sizes[size]} transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all`}>
                {title && (
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                      {title}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                )}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
```

**Spinner Component:**
```typescript
// components/ui/Spinner.tsx
import { cn } from '@/utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <svg
      className={cn('animate-spin', sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
```

### Utility Classes

```typescript
// utils/cn.ts
import { clsx, ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Dependencias

**Antes:**
- US-FUND-004 (Infraestructura - TailwindCSS)

**Después:**
- Todos los componentes de la app usan estos componentes base

---

## Definición de Hecho (DoD)

- [x] Tema Maya configurado en Tailwind
- [x] Componentes base implementados
- [x] Storybook o documentación de componentes
- [x] Componentes accesibles (ARIA)
- [x] Responsive en mobile/tablet/desktop
- [x] Tests de componentes
- [x] Ejemplos de uso documentados

---

## Notas del Alcance Inicial

- ✅ Componentes base esenciales
- ✅ Tema claro (sin modo oscuro)
- ✅ Sin animaciones complejas
- ✅ Sin componentes avanzados (date picker, rich text editor)
- ✅ Sin design tokens avanzados
- ⚠️ **Extensión futura:** EXT-016-Design (modo oscuro, animaciones, design system completo)

---

## Testing

### Tests de Componentes
```typescript
describe('Button', () => {
  it('renders with text')
  it('handles click events')
  it('shows loading state')
  it('respects disabled state')
  it('applies variant styles')
})

describe('Input', () => {
  it('renders with label')
  it('shows error message')
  it('handles onChange')
  it('is accessible (ARIA)')
})
```

---

## Estimación

**Desglose de Esfuerzo (6 SP = ~2 días):**
- Tema y configuración: 0.5 días
- Componentes base: 1 día
- Responsive testing: 0.5 días
- Documentación: 0.25 días
- Testing: 0.25 días

---

**Creado:** 2025-11-02
**Actualizado:** 2025-11-02
**Responsable:** Equipo Frontend + Diseño
