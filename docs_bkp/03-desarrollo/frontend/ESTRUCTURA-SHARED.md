# Estructura de Componentes Compartidos

**Código que mapea:** `apps/frontend/src/shared/components/`
**Última actualización:** 2025-11-07

---

## 📋 Propósito

Documenta los **180+ componentes UI reutilizables** compartidos en toda la aplicación.

---

## 🗂️ Categorías de Componentes

| Categoría | Cantidad | Propósito |
|-----------|----------|-----------|
| **UI Base** | ~40 | Botones, inputs, cards, modals |
| **Gamification** | ~25 | Badges, achievements, leaderboards |
| **Educational** | ~30 | Quiz cards, exercise viewers, feedback |
| **Progress** | ~20 | Progress bars, charts, stats |
| **Social** | ~15 | Chat, user cards, classroom components |
| **Layout** | ~15 | Headers, footers, sidebars, grids |
| **Forms** | ~20 | Form controls, validation |
| **Feedback** | ~15 | Alerts, toasts, loading spinners |

**Total:** ~180 componentes

---

## 🎨 Componentes UI Base

**Path:** `apps/frontend/src/shared/components/`

### Principales

| Componente | Propósito | Props clave |
|------------|-----------|-------------|
| **Button** | Botón reutilizable | variant, size, disabled |
| **Input** | Input con validación | type, error, placeholder |
| **Card** | Container con sombra | title, children |
| **Modal** | Modal centrado | isOpen, onClose, title |
| **Avatar** | Avatar de usuario | src, alt, size |
| **LoadingSpinner** | Indicador de carga | size, color |

---

## 🏆 Componentes de Gamificación

| Componente | Propósito |
|------------|-----------|
| **AchievementCard** | Tarjeta de logro |
| **BadgeDisplay** | Mostrar badge |
| **LeaderboardTable** | Tabla de ranking |
| **MLCoinsDisplay** | Mostrar ML Coins |
| **RankBadge** | Badge de rango maya |
| **ProgressBar** | Barra de progreso |

---

## 📚 Componentes Educativos

| Componente | Propósito |
|------------|-----------|
| **ExerciseCard** | Tarjeta de ejercicio |
| **QuizViewer** | Visor de quiz |
| **FeedbackPanel** | Panel de retroalimentación |
| **HintButton** | Botón de pista |
| **SubmitButton** | Botón de enviar |

---

## 🎯 Convenciones de Componentes

### Nomenclatura

- **Componentes:** PascalCase (Button.tsx, ExerciseCard.tsx)
- **Props:** camelCase
- **Eventos:** on + Nombre (onClick, onSubmit)

### Estructura de archivo

```typescript
// Button.tsx
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

---

## 📚 Referencias

- [COMPONENTES-UI.md](./COMPONENTES-UI.md) - Catálogo completo
- [Tailwind CSS](https://tailwindcss.com/)

---

**Última actualización:** 2025-11-07
