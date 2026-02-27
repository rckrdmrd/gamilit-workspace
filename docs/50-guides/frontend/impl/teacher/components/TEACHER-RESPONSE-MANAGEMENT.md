---
titulo: Componentes de Gestión de Respuestas Teacher Portal
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# Componentes de Gestion de Respuestas - Teacher Portal

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Modulo:** Teacher Portal - Sistema de Respuestas de Ejercicios

---

## ESTRUCTURA

```
apps/frontend/src/apps/teacher/components/responses/
├── ResponseDetailModal.tsx   # Modal detalle de intento
├── ResponsesTable.tsx        # Tabla de intentos
└── ResponseFilters.tsx       # Filtros avanzados
```

---

## 1. ResponseDetailModal

**Ubicacion:** `components/responses/ResponseDetailModal.tsx`

### Proposito

Modal completo para visualizar y analizar intentos de ejercicios con comparacion de respuestas.

### Props

```typescript
interface ResponseDetailModalProps {
  attemptId: string | null;
  open: boolean;
  onClose: () => void;
}
```

### Secciones

#### 1. Header
- Titulo "Detalle de Respuesta"
- Boton cerrar

#### 2. Info Cards (2 columnas)

| Card | Contenido |
|------|-----------|
| Estudiante | Avatar, nombre, numero de intento |
| Ejercicio | Titulo, modulo, tipo |

#### 3. Result Badge
- Icono check/X con animacion
- Texto "Correcto" / "Incorrecto"
- Color verde/rojo

#### 4. Metrics Grid (4 badges)

| Metrica | Formato |
|---------|---------|
| Score | puntaje/maximo |
| Tiempo | MM:SS |
| Pistas usadas | # |
| Comodines usados | # |

#### 5. Rewards Section
- XP Ganado (con icono estrella)
- ML Coins ganadas (con icono moneda)

#### 6. Answer Comparison
- Columna izquierda: Respuesta del estudiante
- Columna derecha: Respuesta correcta
- Usa ExerciseContentRenderer segun tipo

#### 7. Metadata
- Fecha/hora de envio
- Lista de comodines utilizados

#### 8. Footer Actions
- Boton "Calificar" (si requiere revision manual)
- Boton "Cerrar"

### Ejercicios con Revision Manual

```typescript
const MANUAL_REVIEW_EXERCISES = {
  module3: ['podcast_argumentativo'],
  module4: [
    'verificador_fake_news',
    'quiz_tiktok',
    'analisis_memes',
    'infografia_interactiva',
    'navegacion_hipertextual'
  ],
  module5: [
    'diario_multimedia',
    'comic_digital',
    'video_carta'
  ]
};
```

---

## 2. ResponsesTable

**Ubicacion:** `components/responses/ResponsesTable.tsx`

### Proposito

Tabla interactiva de intentos de ejercicios con sorting y paginacion server-side.

### Props

```typescript
interface ResponsesTableProps {
  data: AttemptResponse[];
  total: number;
  page: number;
  limit: number;
  loading?: boolean;
  onViewDetail: (attemptId: string) => void;
  onPageChange: (newPage: number) => void;
  onSortChange?: (
    sortBy: 'submitted_at' | 'score' | 'time',
    sortOrder: 'asc' | 'desc'
  ) => void;
}
```

### Columnas

| Columna | Sorteable | Contenido |
|---------|-----------|-----------|
| Estudiante | No | Avatar + nombre |
| Ejercicio | No | Titulo |
| Modulo | No | Nombre modulo |
| Intento | No | Badge #N |
| Score | Si | % con color semantico |
| Correcto | No | Icono check/X |
| Tiempo | Si | MM:SS con icono |
| Fecha | Si | Fecha formateada |
| Acciones | No | Boton "Ver" |

### Colores de Score

| Rango | Color |
|-------|-------|
| >= 80% | Verde |
| >= 60% | Azul |
| >= 40% | Naranja |
| < 40% | Rojo |

### Estados

| Estado | Render |
|--------|--------|
| loading + sin datos | Skeleton rows animados |
| sin datos | Mensaje con icono "Sin respuestas" |
| con datos | Filas con hover y animacion |

### Paginacion

- Info: "Mostrando 1-20 de 150"
- Botones: anterior/siguiente
- Numeros: 1-5 pages visibles
- Salto a primera/ultima pagina

---

## 3. ResponseFilters

**Ubicacion:** `components/responses/ResponseFilters.tsx`

### Proposito

Panel de filtros expandible para busqueda avanzada de respuestas de ejercicios.

### Props

```typescript
interface ResponseFiltersProps {
  filters: GetAttemptsQuery;
  onChange: (filters: GetAttemptsQuery) => void;
  onClear: () => void;
}
```

### Filtros Disponibles

| Filtro | Tipo | Descripcion |
|--------|------|-------------|
| Aula | dropdown | "Todas las aulas" o aula especifica |
| Estudiante | text | Busqueda por nombre (debounce 300ms) |
| Fecha Desde | date | ISO date format |
| Fecha Hasta | date | ISO date format |
| Estado | radio | Todos, Correctas, Incorrectas |

### Funcionalidades

- Header expandible/colapsable con animacion
- Badge contador de filtros activos
- Boton "Limpiar Filtros" (deshabilitado si no hay activos)
- Debounce en busqueda de estudiante
- Iconos semanticos para estado (check verde, X rojo)

### Ejemplo de Uso

```typescript
<ResponseFilters
  filters={filters}
  onChange={handleFiltersChange}
  onClear={handleClearFilters}
/>
```

---

## TIPOS PRINCIPALES

### AttemptResponse

```typescript
interface AttemptResponse {
  id: string;
  attemptNumber: number;

  // Estudiante
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentAvatarUrl?: string;

  // Ejercicio
  exerciseId: string;
  exerciseTitle: string;
  exerciseType: string;
  moduleId: string;
  moduleName: string;

  // Resultado
  isCorrect: boolean;
  score: number;
  maxScore: number;
  timeSpentSeconds: number;

  // Respuestas
  studentAnswer: any;
  correctAnswer: any;

  // Gamificacion
  xpEarned: number;
  coinsEarned: number;
  hintsUsed: number;
  powerUpsUsed: string[];

  // Metadata
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  needsManualReview: boolean;
}
```

### GetAttemptsQuery

```typescript
interface GetAttemptsQuery {
  classroomId?: string;
  studentName?: string;
  dateFrom?: string;
  dateTo?: string;
  isCorrect?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'submitted_at' | 'score' | 'time';
  sortOrder?: 'asc' | 'desc';
}
```

---

## DIAGRAMA DE FLUJO

```
┌─────────────────────────────────────────────────────────┐
│           TeacherExerciseResponsesPage                   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │              ResponseFilters                     │   │
│  │  [Aula v] [Buscar...] [Desde] [Hasta] [Estado] │   │
│  │  Filtros activos: 2  [Limpiar]                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              ResponsesTable                      │   │
│  │  ┌────────────────────────────────────────────┐ │   │
│  │  │ Estudiante | Ejercicio | Score | Fecha    │ │   │
│  │  ├────────────────────────────────────────────┤ │   │
│  │  │ Juan Perez | Ejercicio 1| 85%  | 15 dic   │ │   │
│  │  │ Maria ...  | Ejercicio 2| 92%  | 15 dic   │ │   │
│  │  └────────────────────────────────────────────┘ │   │
│  │  [< Prev]  1 2 3 4 5  [Next >]                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────┐          │
│  │      ResponseDetailModal (overlay)        │          │
│  │  ┌──────────────────────────────────┐    │          │
│  │  │ Info Cards | Result | Metrics    │    │          │
│  │  │ Answer Comparison                │    │          │
│  │  │ [Estudiante] vs [Correcta]       │    │          │
│  │  │                                  │    │          │
│  │  │ [Calificar]        [Cerrar]      │    │          │
│  │  └──────────────────────────────────┘    │          │
│  └──────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

## HOOKS RELACIONADOS

| Hook | Proposito |
|------|-----------|
| useExerciseResponses | Fetch de intentos con filtros |
| useAttemptDetail | Detalle de un intento |
| useClassrooms | Lista de aulas para filtro |

---

## PAGINAS QUE USAN ESTOS COMPONENTES

| Pagina | Componentes Usados |
|--------|-------------------|
| TeacherExerciseResponsesPage | Todos los componentes |

---

## REFERENCIAS

- `useExerciseResponses.ts` - Hook de datos
- `exerciseResponsesApi.ts` - Cliente API
- `TeacherExerciseResponsesPage.tsx` - Pagina principal

---

**Ultima actualizacion:** 2025-12-18
