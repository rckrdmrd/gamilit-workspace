# Catálogo de Componentes Compartidos - Frontend GAMILIT

**Proyecto:** GAMILIT Platform v2
**Módulo:** Componentes Compartidos - Índice General
**Fecha:** 2025-11-01
**Versión:** 1.0

---

## RFC-0001 Header

```yaml
id: FRONTEND-COMPONENTES-INDEX-000
título: Catálogo de Componentes Compartidos - Índice
estado: Activo
fecha_creación: 2025-11-01
última_actualización: 2025-11-01
autor: Equipo Frontend GAMILIT
```

---

## 1. Resumen Ejecutivo

Este directorio contiene la documentación modular de todos los **componentes compartidos** del frontend de GAMILIT Platform v2. Los componentes están organizados siguiendo principios de **Atomic Design** y temática Detective.

### Estructura de Documentación:

```
componentes/
├── README.md                    # Este archivo (índice)
├── Componentes-UI.md           # Componentes UI Base (12+)
├── Componentes-Forms.md        # Formularios y Validación (7+)
└── Componentes-Layout.md       # Layout y Navegación (7+)
```

---

## 2. Índice de Componentes

### 2.1 Componentes UI Base (12+)

**Archivo:** `Componentes-UI.md`

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| `DetectiveButton` | `src/shared/components/base/` | Botones temáticos con variantes |
| `DetectiveCard` | `src/shared/components/base/` | Tarjetas base con tema detective |
| `InputDetective` | `src/shared/components/base/` | Inputs de formulario estilizados |
| `ProgressBar` | `src/shared/components/base/` | Barras de progreso (XP, coins, general) |
| `RankBadge` | `src/shared/components/base/` | Badges de rango Maya |
| `StatusBadge` | `src/shared/components/base/` | Badges de estado |
| `Toast` | `src/shared/components/base/` | Notificaciones temporales |
| `LoadingOverlay` | `src/shared/components/base/` | Overlay de carga |
| `ColorfulCard` | `src/shared/components/base/` | Cards con colores personalizados |
| `EnhancedCard` | `src/shared/components/base/` | Cards mejoradas con efectos |
| `Modal` | `src/shared/components/common/` | Modal base para contenido superpuesto |
| `Tooltip` | `src/shared/components/common/` | Tooltips informativos |

**Ver detalles:** [`Componentes-UI.md`](./Componentes-UI.md)

---

### 2.2 Componentes de Formularios (7+)

**Archivo:** `Componentes-Forms.md`

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| `BaseExercise` | `src/shared/components/mechanics/` | Wrapper base para mecánicas |
| `ExerciseHeader` | `src/shared/components/mechanics/` | Encabezado de ejercicios |
| `ExerciseFooter` | `src/shared/components/mechanics/` | Footer de ejercicios |
| `FeedbackModal` | `src/shared/components/mechanics/` | Modal de retroalimentación con score |
| `ScoreDisplay` | `src/shared/components/mechanics/` | Visualización de puntajes |
| `HintPanel` | `src/shared/components/mechanics/` | Panel de pistas con contador |
| `TimerDisplay` | `src/shared/components/mechanics/` | Temporizador de ejercicios |

**Utilidades Incluidas:**
- `formatters.ts` - Formateo de ML Coins, XP, fechas, números
- `validators.ts` - Validación de email, password, username, campos
- `useExerciseSubmission` - Hook para envío de ejercicios

**Ver detalles:** [`Componentes-Forms.md`](./Componentes-Forms.md)

---

### 2.3 Componentes de Layout (7+)

**Archivo:** `Componentes-Layout.md`

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| `GamifiedHeader` | `src/shared/components/layout/` | Header con stats del usuario |
| `GamilitSidebar` | `src/shared/components/layout/` | Navegación lateral por rol |
| `DetectiveContainer` | `src/shared/components/layout/` | Container responsive con padding |
| `DetectiveFooter` | `src/shared/components/layout/` | Footer base de la aplicación |
| `DetectiveGrid` | `src/shared/components/layout/` | Grid layout responsive |
| `AchievementCard` | `src/shared/components/specialized/social/` | Cards de logros |
| `ModuleCard` | `src/shared/components/specialized/educational/` | Cards de módulos educativos |

**Componentes Especializados:**
- **Gamification:** `EconomyDisplay`, `RankProgressCard`, `MissionCard`
- **Social:** `AchievementCard`, `GuildCard`, `LeaderboardEntry`
- **Educational:** `ModuleCard`, `ExerciseCard`

**Ver detalles:** [`Componentes-Layout.md`](./Componentes-Layout.md)

---

## 3. Estructura en Código

```
src/shared/components/
├── base/                    # UI Primitives (Atoms)
│   ├── DetectiveButton.tsx
│   ├── DetectiveCard.tsx
│   ├── InputDetective.tsx
│   ├── ProgressBar.tsx
│   ├── RankBadge.tsx
│   ├── StatusBadge.tsx
│   ├── Toast.tsx
│   ├── LoadingOverlay.tsx
│   ├── ColorfulCard.tsx
│   └── EnhancedCard.tsx
│
├── layout/                  # Layout Components
│   ├── GamifiedHeader.tsx
│   ├── GamilitSidebar.tsx
│   ├── DetectiveContainer.tsx
│   ├── DetectiveFooter.tsx
│   └── DetectiveGrid.tsx
│
├── mechanics/               # Exercise Components
│   ├── BaseExercise.tsx
│   ├── ExerciseHeader.tsx
│   ├── ExerciseFooter.tsx
│   ├── FeedbackModal.tsx
│   ├── ScoreDisplay.tsx
│   ├── HintPanel.tsx
│   └── TimerDisplay.tsx
│
├── specialized/             # Domain-Specific
│   ├── gamification/
│   │   ├── EconomyDisplay.tsx
│   │   ├── RankProgressCard.tsx
│   │   └── MissionCard.tsx
│   ├── social/
│   │   ├── AchievementCard.tsx
│   │   ├── GuildCard.tsx
│   │   └── LeaderboardEntry.tsx
│   └── educational/
│       ├── ModuleCard.tsx
│       └── ExerciseCard.tsx
│
├── celebrations/            # Feedback & Rewards
│   ├── Confetti.tsx
│   ├── LevelUpAnimation.tsx
│   └── RewardDisplay.tsx
│
└── common/                  # Utilities
    ├── Modal.tsx
    ├── Dropdown.tsx
    └── Tooltip.tsx
```

---

## 4. Guía Rápida de Uso

### 4.1 Importar Componentes

```tsx
// Componentes UI Base
import { DetectiveButton, DetectiveCard, ProgressBar } from '@shared/components/base';

// Componentes de Layout
import { GamifiedHeader, GamilitSidebar } from '@shared/components/layout';

// Componentes de Mecánicas
import { BaseExercise, FeedbackModal, HintPanel } from '@shared/components/mechanics';

// Componentes Especializados
import { ModuleCard, AchievementCard } from '@shared/components/specialized';
```

### 4.2 Ejemplo: Crear una Página de Dashboard

```tsx
import React from 'react';
import { DetectiveContainer, DetectiveGrid } from '@shared/components/layout';
import { ModuleCard } from '@shared/components/specialized/educational';
import { useModules } from '@shared/hooks';

export const DashboardPage = () => {
  const { modules, isLoading } = useModules();

  return (
    <DetectiveContainer>
      <h1 className="text-detective-3xl font-bold mb-6">Mis Módulos</h1>

      <DetectiveGrid cols={3} gap={6}>
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            progress={module.progress}
            isLocked={module.is_locked}
            onClick={() => navigate(`/learning/${module.id}`)}
          />
        ))}
      </DetectiveGrid>
    </DetectiveContainer>
  );
};
```

### 4.3 Ejemplo: Crear un Ejercicio

```tsx
import React, { useState } from 'react';
import { BaseExercise } from '@shared/components/mechanics';
import { DetectiveButton } from '@shared/components/base';

export const MyExercise = () => {
  const [answer, setAnswer] = useState('');

  const handleComplete = (result) => {
    console.log('Score:', result);
    // Navegar a siguiente ejercicio o mostrar feedback
  };

  return (
    <BaseExercise
      exerciseId="ex-001"
      title="Comprensión Literal"
      instructions="Lee el texto y responde la pregunta"
      difficulty="medio"
      timeLimit={300}
      allowHints
      onComplete={handleComplete}
    >
      <div className="exercise-content">
        <p className="mb-4">Texto del ejercicio...</p>

        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full px-4 py-2 border rounded-detective"
        />
      </div>
    </BaseExercise>
  );
};
```

---

## 5. Navegación entre Documentos

### Documentos Relacionados:

- **Componentes UI Base:** [`Componentes-UI.md`](./Componentes-UI.md)
- **Componentes de Formularios:** [`Componentes-Forms.md`](./Componentes-Forms.md)
- **Componentes de Layout:** [`Componentes-Layout.md`](./Componentes-Layout.md)

### Otros Módulos Frontend:

- **Estados:** [`../estados/README.md`](../estados/README.md)
- **Estilos:** [`../estilos/README.md`](../estilos/README.md)
- **Routing:** [`../routing/README.md`](../routing/README.md)
- **Features:** [`../features/README.md`](../features/README.md)
- **Mecánicas:** [`../mecanicas/README.md`](../mecanicas/README.md)

### Documentos Originales:

- **Backup Original:** [`../.backup/COMPONENTES-COMPARTIDOS.md.backup`](../.backup/COMPONENTES-COMPARTIDOS.md.backup)

---

## 6. Estadísticas

### Por Categoría:

| Categoría | Componentes | Archivo |
|-----------|-------------|---------|
| UI Base | 12+ | `Componentes-UI.md` |
| Formularios | 7+ | `Componentes-Forms.md` |
| Layout | 7+ | `Componentes-Layout.md` |
| **TOTAL** | **26+** | - |

### Por Ubicación en Código:

| Directorio | Componentes |
|------------|-------------|
| `base/` | 10 |
| `layout/` | 5 |
| `mechanics/` | 7 |
| `specialized/` | 9 |
| `celebrations/` | 3 |
| `common/` | 3 |

---

## 7. Mejores Prácticas Generales

### 7.1 Desarrollo

1. **Tipado TypeScript:** Todos los componentes deben tener props tipadas
2. **Props por defecto:** Usar valores sensatos por defecto
3. **Documentación:** Incluir JSDoc para componentes complejos
4. **Testing:** Tests unitarios para componentes críticos

### 7.2 Performance

1. **Memoización:** Usar `React.memo` para componentes costosos
2. **Lazy Loading:** Cargar componentes pesados on-demand
3. **Code Splitting:** Separar por rutas cuando sea apropiado

### 7.3 Accesibilidad

1. **ARIA Labels:** Incluir labels descriptivos
2. **Teclado:** Navegación completa por teclado
3. **Contraste:** Verificar ratios de contraste (WCAG AA)
4. **Screen Readers:** Testear con lectores de pantalla

---

## 8. Changelog

### 2025-11-01
- **Creado:** Modularización de `COMPONENTES-COMPARTIDOS.md`
- **Dividido en:**
  - `Componentes-UI.md` (300 líneas aprox.)
  - `Componentes-Forms.md` (250 líneas aprox.)
  - `Componentes-Layout.md` (161 líneas aprox.)
- **Creado:** Este archivo `README.md` como índice

### 2025-10-27
- **Original:** Creación de `COMPONENTES-COMPARTIDOS.md` (711 líneas)

---

## 9. Contacto y Soporte

Para preguntas o mejoras a la documentación de componentes:

- **Equipo:** Frontend GAMILIT
- **Documentación:** `/docs/03-desarrollo/frontend/componentes/`
- **Repositorio:** Ver estructura en `/src/shared/components/`

---

**Documento generado:** 2025-11-01
**Versión:** 1.0
**Total de Componentes Documentados:** 26+
