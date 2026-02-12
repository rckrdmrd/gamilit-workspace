# Referencia de Constantes - Teacher Portal

**Version:** 1.0.0
**Fecha:** 2025-12-26
**Modulo:** Teacher Portal

---

## RESUMEN

Este documento describe las constantes centralizadas del Teacher Portal ubicadas en `apps/frontend/src/apps/teacher/constants/`.

| Archivo | Proposito | Creado |
|---------|-----------|--------|
| `alertTypes.ts` | Tipos y prioridades de alertas | P2-02 |
| `manualReviewExercises.ts` | Ejercicios de revision manual | P2-01 |

---

## 1. alertTypes.ts

**Ubicacion:** `apps/frontend/src/apps/teacher/constants/alertTypes.ts`
**Creado en:** Sprint P2-02 (Centralizar tipos de alerta)

### Interfaces

```typescript
interface AlertTypeConfig {
  value: string;
  label: string;
  icon: string;
  description: string;
}

interface AlertPriorityConfig {
  value: string;
  label: string;
  color: string;      // Tailwind background class
  textColor: string;  // Tailwind text class
  icon: string;       // Emoji icon
}
```

### ALERT_TYPES

Tipos de alerta disponibles en el sistema:

| Value | Label | Icon | Descripcion |
|-------|-------|------|-------------|
| `no_activity` | Sin Actividad | `emoji_events` | Estudiantes inactivos >7 dias |
| `low_score` | Bajo Rendimiento | `emoji_events` | Promedio <60% |
| `declining_trend` | Tendencia Decreciente | `emoji_events` | Rendimiento en declive |
| `repeated_failures` | Fallos Repetidos | `emoji_events` | Multiples intentos fallidos |

**Codigo:**

```typescript
export const ALERT_TYPES: AlertTypeConfig[] = [
  {
    value: 'no_activity',
    label: 'Sin Actividad',
    icon: 'emoji_events',
    description: 'Estudiantes inactivos >7 dias',
  },
  {
    value: 'low_score',
    label: 'Bajo Rendimiento',
    icon: 'emoji_events',
    description: 'Promedio <60%',
  },
  {
    value: 'declining_trend',
    label: 'Tendencia Decreciente',
    icon: 'emoji_events',
    description: 'Rendimiento en declive',
  },
  {
    value: 'repeated_failures',
    label: 'Fallos Repetidos',
    icon: 'emoji_events',
    description: 'Multiples intentos fallidos',
  },
];
```

### ALERT_PRIORITIES

Niveles de prioridad para alertas:

| Value | Label | Color | Text Color | Icon |
|-------|-------|-------|------------|------|
| `critical` | Critica | bg-red-500 | text-red-500 | `emoji_events` |
| `high` | Alta | bg-orange-500 | text-orange-500 | `emoji_events` |
| `medium` | Media | bg-yellow-500 | text-yellow-500 | `emoji_events` |
| `low` | Baja | bg-blue-500 | text-blue-500 | `emoji_events` |

**Codigo:**

```typescript
export const ALERT_PRIORITIES: AlertPriorityConfig[] = [
  {
    value: 'critical',
    label: 'Critica',
    color: 'bg-red-500',
    textColor: 'text-red-500',
    icon: 'emoji_events',
  },
  {
    value: 'high',
    label: 'Alta',
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    icon: 'emoji_events',
  },
  {
    value: 'medium',
    label: 'Media',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    icon: 'emoji_events',
  },
  {
    value: 'low',
    label: 'Baja',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    icon: 'emoji_events',
  },
];
```

### Helper Functions

```typescript
// Obtener configuracion de un tipo de alerta
export const getAlertTypeConfig = (value: string): AlertTypeConfig | undefined => {
  return ALERT_TYPES.find((type) => type.value === value);
};

// Obtener configuracion de una prioridad
export const getPriorityConfig = (value: string): AlertPriorityConfig | undefined => {
  return ALERT_PRIORITIES.find((priority) => priority.value === value);
};
```

### Uso

```typescript
import { ALERT_TYPES, ALERT_PRIORITIES, getAlertTypeConfig } from '../constants/alertTypes';

// En componente
const alertTypes = ALERT_TYPES;
const priorities = ALERT_PRIORITIES;

// Obtener config especifica
const noActivityConfig = getAlertTypeConfig('no_activity');
```

---

## 2. manualReviewExercises.ts

**Ubicacion:** `apps/frontend/src/apps/teacher/constants/manualReviewExercises.ts`
**Creado en:** Sprint P2-01 (Dinamizar ejercicios de revision manual)

### Interfaces

```typescript
interface ManualReviewModule {
  id: string;
  name: string;
  number: number;
}

interface ManualReviewExercise {
  id: string;
  title: string;
  moduleId: string;
  moduleName: string;
  moduleNumber: number;
}
```

### MANUAL_REVIEW_MODULES

Modulos que contienen ejercicios de revision manual:

| ID | Nombre | Numero |
|----|--------|--------|
| `module-3` | Comprension Critica | 3 |
| `module-4` | Lectura Digital | 4 |
| `module-5` | Produccion Lectora | 5 |

**Codigo:**

```typescript
export const MANUAL_REVIEW_MODULES = [
  { id: 'module-3', name: 'Comprension Critica', number: 3 },
  { id: 'module-4', name: 'Lectura Digital', number: 4 },
  { id: 'module-5', name: 'Produccion Lectora', number: 5 },
] as const;
```

### MANUAL_REVIEW_EXERCISES

Lista de ejercicios que requieren revision manual:

| ID | Titulo | Modulo |
|----|--------|--------|
| `podcast-argumentativo` | Podcast Argumentativo | M3 |
| `debate-literario` | Debate Literario | M3 |
| `carta-al-autor` | Carta al Autor | M3 |
| `presentacion-multimedia` | Presentacion Multimedia | M4 |
| `infografia-digital` | Infografia Digital | M4 |
| `blog-literario` | Blog Literario | M5 |
| `resena-critica` | Resena Critica | M5 |

**Codigo:**

```typescript
export const MANUAL_REVIEW_EXERCISES: ManualReviewExercise[] = [
  {
    id: 'podcast-argumentativo',
    title: 'Podcast Argumentativo',
    moduleId: 'module-3',
    moduleName: 'Comprension Critica',
    moduleNumber: 3,
  },
  {
    id: 'debate-literario',
    title: 'Debate Literario',
    moduleId: 'module-3',
    moduleName: 'Comprension Critica',
    moduleNumber: 3,
  },
  // ... mas ejercicios
];
```

### Helper Functions

```typescript
// Obtener ejercicios filtrados por modulo
export const getExercisesByModule = (moduleId: string): ManualReviewExercise[] => {
  if (!moduleId) return MANUAL_REVIEW_EXERCISES;
  return MANUAL_REVIEW_EXERCISES.filter((ex) => ex.moduleId === moduleId);
};

// Obtener ejercicio por ID
export const getExerciseById = (exerciseId: string): ManualReviewExercise | undefined => {
  return MANUAL_REVIEW_EXERCISES.find((ex) => ex.id === exerciseId);
};
```

### Uso

```typescript
import {
  MANUAL_REVIEW_MODULES,
  MANUAL_REVIEW_EXERCISES,
  getExercisesByModule,
} from '../constants/manualReviewExercises';

// Poblar dropdown de modulos
<select>
  {MANUAL_REVIEW_MODULES.map((mod) => (
    <option key={mod.id} value={mod.id}>{mod.name}</option>
  ))}
</select>

// Obtener ejercicios de un modulo
const module3Exercises = getExercisesByModule('module-3');
```

---

## PATRONES DE USO

### Importacion

```typescript
// Importar constantes especificas
import { ALERT_TYPES, ALERT_PRIORITIES } from '../constants/alertTypes';
import { MANUAL_REVIEW_EXERCISES } from '../constants/manualReviewExercises';

// Importar con helpers
import {
  ALERT_TYPES,
  getAlertTypeConfig,
  getPriorityConfig,
} from '../constants/alertTypes';
```

### En Componentes React

```tsx
function AlertFilters() {
  const [selectedType, setSelectedType] = useState('all');

  return (
    <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
      <option value="all">Todos los tipos</option>
      {ALERT_TYPES.map((type) => (
        <option key={type.value} value={type.value}>
          {type.icon} {type.label}
        </option>
      ))}
    </select>
  );
}
```

---

## REFERENCIAS

- [TeacherAlertsPage](../pages/TEACHER-PAGES-SPECIFICATIONS.md#5-teacheralertspage)
- [ReviewPanelPage Implementation](../../../../apps/frontend/src/apps/teacher/pages/grading/ReviewPanelPage.tsx)

---

**Ultima actualizacion:** 2025-12-26
