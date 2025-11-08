# Componentes UI Base - Frontend GAMILIT

**Proyecto:** GAMILIT Platform v2
**Módulo:** Componentes Compartidos - UI Base
**Ubicación:** `src/shared/components/base/`
**Fecha:** 2025-11-01
**Versión:** 1.0

---

## RFC-0001 Header

```yaml
id: FRONTEND-COMPONENTES-UI-001
título: Componentes UI Base (UI Primitives)
estado: Implementado
fecha_creación: 2025-10-27
última_actualización: 2025-11-01
autor: Equipo Frontend GAMILIT
```

**Historial de Cambios:**
- **2025-11-01:** Modularización desde COMPONENTES-COMPARTIDOS.md
- **2025-10-27:** Creación inicial

---

## 1. Resumen Ejecutivo

Este documento describe los **componentes UI base (primitivos)** del frontend de GAMILIT. Son los componentes atómicos más básicos que se utilizan como building blocks para componentes más complejos.

### Componentes Base (12+):

1. **DetectiveButton** - Botones temáticos
2. **DetectiveCard** - Tarjetas base
3. **InputDetective** - Inputs de formulario
4. **ProgressBar** - Barras de progreso
5. **RankBadge** - Badges de rango Maya
6. **StatusBadge** - Badges de estado
7. **Toast** - Notificaciones toast
8. **LoadingOverlay** - Overlay de carga
9. **ColorfulCard** - Cards con colores
10. **EnhancedCard** - Cards mejoradas
11. **Modal** - Modal base
12. **Tooltip** - Tooltips

---

## 2. Componentes UI Base

### 2.1 DetectiveButton

**Responsabilidad:** Botón base con tema detective y variantes.

**Ubicación:** `src/shared/components/base/DetectiveButton.tsx`

**Props:**
```typescript
interface DetectiveButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}
```

**Implementación:**
```tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export const DetectiveButton: React.FC<DetectiveButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  icon,
  fullWidth = false,
}) => {
  const baseClasses = 'px-4 py-2 rounded-detective font-medium transition-all duration-200';

  const variants = {
    primary: 'bg-detective-orange hover:bg-detective-orange-dark text-white shadow-orange hover:shadow-orange-lg',
    secondary: 'bg-detective-blue hover:bg-blue-800 text-white shadow-detective hover:shadow-detective-lg',
    outline: 'border-2 border-detective-orange text-detective-orange hover:bg-detective-orange hover:text-white',
    ghost: 'text-detective-orange hover:bg-detective-bg',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading && <Loader2 className="animate-spin mr-2" />}
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
```

**Ejemplo de Uso:**
```tsx
import { Search } from 'lucide-react';

<DetectiveButton
  variant="primary"
  size="lg"
  icon={<Search />}
  onClick={handleSearch}
>
  Buscar Pistas
</DetectiveButton>
```

---

### 2.2 DetectiveCard

**Responsabilidad:** Tarjeta base con tema detective.

**Ubicación:** `src/shared/components/base/DetectiveCard.tsx`

**Props:**
```typescript
interface DetectiveCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'gold' | 'orange';
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}
```

**Implementación:**
```tsx
export const DetectiveCard: React.FC<DetectiveCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  variant = 'default',
  hoverable = false,
  onClick,
  className = '',
}) => {
  const variants = {
    default: 'bg-white shadow-card',
    gold: 'bg-gradient-to-br from-yellow-50 to-amber-100 shadow-gold',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 shadow-orange',
  };

  const hoverClass = hoverable ? 'hover:shadow-card-hover hover:-translate-y-1 cursor-pointer' : '';

  return (
    <div
      className={`${variants[variant]} rounded-detective p-6 transition-all duration-200 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && <div className="text-detective-orange">{icon}</div>}
          <div>
            {title && <h3 className="text-detective-xl font-bold text-detective-text">{title}</h3>}
            {subtitle && <p className="text-detective-sm text-detective-text-secondary">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
```

**Ejemplo de Uso:**
```tsx
import { BookOpen } from 'lucide-react';

<DetectiveCard
  title="Módulo 1"
  subtitle="Comprensión Literal"
  icon={<BookOpen />}
  variant="orange"
  hoverable
  onClick={() => navigate('/module/1')}
>
  <ProgressBar value={75} max={100} />
</DetectiveCard>
```

---

### 2.3 InputDetective

**Responsabilidad:** Input de formulario con estilo detective.

**Ubicación:** `src/shared/components/base/InputDetective.tsx`

**Props:**
```typescript
interface InputDetectiveProps {
  type?: 'text' | 'email' | 'password' | 'number';
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
}
```

**Implementación:**
```tsx
export const InputDetective: React.FC<InputDetectiveProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled = false,
  required = false,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-detective-sm font-medium text-detective-text mb-1">
          {label} {required && <span className="text-detective-danger">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-detective-text-secondary">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-2 ${icon ? 'pl-10' : ''}
            border-2 rounded-detective
            ${error ? 'border-detective-danger' : 'border-detective-border-medium'}
            focus:outline-none focus:ring-2 focus:ring-detective-orange focus:border-detective-orange
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          `}
        />
      </div>
      {error && (
        <p className="mt-1 text-detective-xs text-detective-danger">{error}</p>
      )}
    </div>
  );
};
```

---

### 2.4 ProgressBar

**Responsabilidad:** Barra de progreso con variantes (XP, coins, general).

**Ubicación:** `src/shared/components/base/ProgressBar.tsx`

**Props:**
```typescript
interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'xp' | 'coins';
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

**Implementación:**
```tsx
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  label,
  variant = 'default',
  animated = false,
  size = 'md',
}) => {
  const percentage = (value / max) * 100;

  const sizes = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const variants = {
    default: 'from-detective-orange to-detective-gold',
    xp: 'from-blue-500 to-purple-500',
    coins: 'from-yellow-400 to-amber-500',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-detective-sm text-detective-text-secondary">{label}</span>
          <span className="text-detective-sm font-medium text-detective-text">
            {value} / {max}
          </span>
        </div>
      )}
      <div className={`w-full bg-detective-border-light rounded-full ${sizes[size]} overflow-hidden`}>
        <div
          className={`bg-gradient-to-r ${variants[variant]} h-full transition-all duration-500 ${
            animated ? 'animate-detective-glow' : ''
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
```

**Ejemplo de Uso:**
```tsx
<ProgressBar
  value={currentXP}
  max={xpToNextLevel}
  showLabel
  label="XP"
  variant="xp"
  animated
/>
```

---

### 2.5 RankBadge

**Responsabilidad:** Badge visual para rangos Maya.

**Ubicación:** `src/shared/components/base/RankBadge.tsx`

**Props:**
```typescript
interface RankBadgeProps {
  rank: MayaRank;
  showName?: boolean;
  showPrestige?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  onClick?: () => void;
}

type MayaRank = 'Ajaw' | 'Nacom' | 'Ah K'in' | 'Halach Uinic' | 'K'uk'ulkan';
```

**Implementación:**
```tsx
export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  showName = false,
  showPrestige = false,
  size = 'md',
  animated = false,
  onClick,
}) => {
  const rankNames: Record<MayaRank, string> = {
    Ajaw: 'Detective Novato',
    Nacom: 'Sargento',
    Ah K'in: 'Teniente',
    Halach Uinic: 'Capitán',
    K'uk'ulkan: 'Comisario',
  };

  const rankGradients: Record<MayaRank, string> = {
    Ajaw: 'from-rank-detective-from to-rank-detective-to',
    Nacom: 'from-rank-sargento-from to-rank-sargento-to',
    Ah K'in: 'from-rank-teniente-from to-rank-teniente-to',
    Halach Uinic: 'from-rank-capitan-from to-rank-capitan-to',
    K'uk'ulkan: 'from-rank-comisario-from to-rank-comisario-to',
  };

  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg',
    xl: 'w-24 h-24 text-xl',
  };

  return (
    <div
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div
        className={`
          ${sizes[size]}
          bg-gradient-to-br ${rankGradients[rank]}
          rounded-full flex items-center justify-center
          text-white font-bold shadow-lg
          ${animated ? 'animate-gold-shine' : ''}
        `}
      >
        {rank.charAt(0)}
      </div>
      {showName && (
        <div className="flex flex-col">
          <span className="text-detective-base font-bold text-detective-text">
            {rankNames[rank]}
          </span>
          {showPrestige && (
            <span className="text-detective-xs text-detective-text-secondary">
              Prestigio: 0
            </span>
          )}
        </div>
      )}
    </div>
  );
};
```

---

### 2.6 Toast

**Responsabilidad:** Notificaciones toast temporales.

**Ubicación:** `src/shared/components/base/Toast.tsx`

**Props:**
```typescript
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}
```

**Implementación:**
```tsx
import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        flex items-center gap-3 p-4
        border-l-4 rounded-detective shadow-lg
        ${colors[type]}
        animate-slide-up
      `}
    >
      {icons[type]}
      <p className="font-medium">{message}</p>
    </div>
  );
};
```

---

### 2.7 Modal

**Responsabilidad:** Modal base para contenido superpuesto.

**Ubicación:** `src/shared/components/common/Modal.tsx`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

**Implementación:**
```tsx
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative bg-white rounded-detective shadow-2xl
          ${sizes[size]} w-full mx-4
          animate-scale-in
        `}
      >
        {title && (
          <div className="px-6 py-4 border-b border-detective-border-light">
            <h2 className="text-detective-2xl font-bold text-detective-text">{title}</h2>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
};
```

---

## 3. Mejores Prácticas

### 3.1 Props

- **Tipar todas las props explícitamente** con TypeScript
- **Usar valores por defecto** cuando sea apropiado
- **Documentar props complejas** con JSDoc

### 3.2 Composición

- Preferir **composición** sobre herencia
- Usar `children` para máxima flexibilidad
- Separar **lógica de presentación**

### 3.3 Performance

- Memorizar componentes costosos con `React.memo`
- Usar `useMemo` y `useCallback` apropiadamente
- Lazy loading de componentes pesados

---

## 4. Referencias

- **Archivo Original:** `COMPONENTES-COMPARTIDOS.md` (líneas 1-365)
- **Componentes de Layout:** Ver `Componentes-Layout.md`
- **Componentes de Formularios:** Ver `Componentes-Forms.md`
- **README Principal:** Ver `componentes/README.md`

---

**Documento generado:** 2025-11-01
**Versión:** 1.0
**Total de Componentes UI Base:** 12+
