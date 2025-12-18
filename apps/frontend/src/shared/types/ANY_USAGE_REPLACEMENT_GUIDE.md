# Guía de Reemplazo de `any` - DTO-001

Esta guía documenta los usos de `any` encontrados en el frontend de GAMILIT y propone reemplazos con los nuevos tipos canónicos.

## Archivos Creados (DTO-001)

Los siguientes archivos de tipos canónicos han sido creados:

1. **`user-stats.types.ts`** - Estadísticas de usuario y gamificación
2. **`classroom.types.ts`** - Tipos de aulas y estudiantes
3. **`user.types.ts`** - Tipos completos de usuario
4. **`exercise-submission.types.ts`** - Envíos de ejercicios
5. **`index.ts`** - Actualizado para exportar todos los tipos nuevos

## Usos de `any` a Reemplazar

### 1. Hooks y Servicios

#### `hooks/useAchievements.ts`
```typescript
// ANTES (línea 243, 250)
achievements.filter((a: any) => a.isUnlocked)

// DESPUÉS
import { Achievement } from '@shared/types';
achievements.filter((a: Achievement) => a.isUnlocked)
```

#### `services/NotificationService.ts`
```typescript
// ANTES (línea 24)
[key: string]: any;

// DESPUÉS
[key: string]: unknown;
```

---

### 2. API Types y Admin

#### `services/api/adminTypes.ts`

**Metadata fields:**
```typescript
// ANTES (líneas 150, 186)
metadata?: any;

// DESPUÉS
metadata?: Record<string, unknown>;
```

**Context field:**
```typescript
// ANTES (línea 395)
context?: any;

// DESPUÉS
context?: Record<string, unknown>;
```

**Generic objects:**
```typescript
// ANTES (líneas 501, 536)
[key: string]: any;

// DESPUÉS
[key: string]: unknown;
```

**Learning path:**
```typescript
// ANTES (línea 968)
learning_path?: any[];

// DESPUÉS - usar tipo específico del módulo educativo
learning_path?: Array<{
  moduleId: string;
  order: number;
  isCompleted: boolean;
}>;
```

#### `services/api/adminAPI.ts`

**Subscription parameter:**
```typescript
// ANTES (línea 340)
subscription: any

// DESPUÉS
subscription: {
  planId: string;
  status: 'active' | 'inactive' | 'suspended';
  expiresAt?: string;
}
```

**Media library filters:**
```typescript
// ANTES (línea 427)
async function getMediaLibrary(filters?: any)

// DESPUÉS
interface MediaLibraryFilters {
  type?: 'image' | 'video' | 'audio' | 'document';
  search?: string;
  page?: number;
  limit?: number;
}
async function getMediaLibrary(filters?: MediaLibraryFilters)
```

**Transform functions:**
```typescript
// ANTES (líneas 477, 498)
function safeToISOString(value: any): string | undefined
function transformUser(backendUser: any): User

// DESPUÉS
function safeToISOString(value: unknown): string | undefined
function transformUser(backendUser: Record<string, unknown>): User
```

**Preview gamification:**
```typescript
// ANTES (línea 823)
export async function previewGamificationChanges(_changes: any): Promise<any>

// DESPUÉS
interface GamificationChanges {
  xpMultiplier?: number;
  coinRewards?: Record<string, number>;
  rankThresholds?: Record<string, number>;
}
export async function previewGamificationChanges(
  changes: GamificationChanges
): Promise<GamificationChanges>
```

**Settings validation:**
```typescript
// ANTES (línea 1075-1076)
_settings: any
Promise<{ valid: boolean; errors?: any[] }>

// DESPUÉS
_settings: Record<string, unknown>
Promise<{ valid: boolean; errors?: ValidationError[] }>
```

**Schedule report:**
```typescript
// ANTES (línea 1167)
async function scheduleReport(reportId: string, schedule: any)

// DESPUÉS
interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
}
async function scheduleReport(reportId: string, schedule: ReportSchedule)
```

---

### 3. Teams API

#### `services/api/teamsAPI.ts`
```typescript
// ANTES (línea 32)
badges: any[];

// DESPUÉS
import { Badge } from '@shared/types';
badges: Badge[];
```

---

### 4. Educational API

#### `services/api/educationalAPI.ts`

**Answer data:**
```typescript
// ANTES (líneas 77-78)
userAnswer: any;
correctAnswer?: any;

// DESPUÉS
import { ExerciseSubmissionContent } from '@shared/types';
userAnswer: ExerciseSubmissionContent;
correctAnswer?: ExerciseSubmissionContent;
```

**Transform functions:**
```typescript
// ANTES (líneas 248, 264)
function transformExercise(backendExercise: any): Exercise
function transformExercises(backendExercises: any[]): Exercise[]

// DESPUÉS
function transformExercise(backendExercise: Record<string, unknown>): Exercise
function transformExercises(backendExercises: Array<Record<string, unknown>>): Exercise[]
```

**Activity mapping:**
```typescript
// ANTES (línea 862)
return data.map((activity: any) => ({...}))

// DESPUÉS
interface ActivityData {
  id: string;
  type: string;
  timestamp: string;
  [key: string]: unknown;
}
return data.map((activity: ActivityData) => ({...}))
```

---

### 5. Exercise Factories

#### `shared/factories/ExerciseFactory.ts`
```typescript
// ANTES (líneas 37, 46)
submittedAnswers: any;

// DESPUÉS
import { ExerciseSubmissionContent } from '@shared/types';
submittedAnswers: ExerciseSubmissionContent;
```

---

### 6. Hooks

#### `shared/hooks/useModules.ts`
```typescript
// ANTES (líneas 21, 36)
[key: string]: any;

// DESPUÉS
[key: string]: unknown;
```

#### `shared/hooks/usePersistedFilters.ts`
```typescript
// ANTES (línea 99)
(message: string, data?: any) => {}

// DESPUÉS
(message: string, data?: unknown) => {}
```

---

### 7. API Configuration

#### `config/api.config.ts`
```typescript
// ANTES (línea 582)
export function buildApiUrl(
  path: string | ((...args: any[]) => string),
  ...args: any[]
): string

// DESPUÉS
export function buildApiUrl(
  path: string | ((...args: unknown[]) => string),
  ...args: unknown[]
): string
```

---

### 8. API Interceptors

#### `services/api/apiInterceptors.ts`
```typescript
// ANTES (líneas 147, 164, 210, 254)
const transformDates = (obj: any): any => {}
const transformed: any = {};
error: (error: any): Promise<any> => {}

// DESPUÉS
const transformDates = (obj: unknown): unknown => {}
const transformed: Record<string, unknown> = {};
error: (error: Error): Promise<never> => {}
```

---

### 9. Error Handler

#### `services/api/apiErrorHandler.ts`
```typescript
// ANTES (línea 21, 24, etc.)
public readonly data?: any;
constructor(..., data?: any)

// DESPUÉS
public readonly data?: unknown;
constructor(..., data?: unknown)
```

---

### 10. Teacher Grading API

#### `services/api/teacher/gradingApi.ts`
```typescript
// ANTES (línea 89)
answer: any;

// DESPUÉS
import { ExerciseSubmissionContent } from '@shared/types';
answer: ExerciseSubmissionContent;
```

---

### 11. Types Definitions

#### `shared/types/progress.types.ts`
```typescript
// ANTES (línea 227)
learning_path: any[];

// DESPUÉS
learning_path: Array<{
  moduleId: string;
  order: number;
  isCompleted: boolean;
}>;
```

#### `shared/types/educational.types.ts`
```typescript
// ANTES (líneas 649, 657-658)
[key: string]: any;
input: any;
expected_output: any;

// DESPUÉS
[key: string]: unknown;
input: unknown;
expectedOutput: unknown;
```

---

### 12. Exercise Components

#### `features/exercises/components/UnderConstructionExercise.tsx`
```typescript
// ANTES (línea 38)
onProgressUpdate?: (update: any) => void;

// DESPUÉS
interface ProgressUpdate {
  completed: number;
  total: number;
  percentage: number;
}
onProgressUpdate?: (update: ProgressUpdate) => void;
```

---

### 13. Exercise Adapters

#### `shared/utils/exerciseAdapter.ts`

**Mechanic data:**
```typescript
// ANTES (línea 27)
mechanicData?: any;

// DESPUÉS
mechanicData?: Record<string, unknown>;
```

**Map difficulty:**
```typescript
// ANTES (línea 33)
const mapDifficulty = (difficulty: any): DifficultyLevel

// DESPUÉS
const mapDifficulty = (difficulty: string | DifficultyLevel): DifficultyLevel
```

**Grid generation:**
```typescript
// ANTES (línea 75, 77)
const generateGridFromClues = (clues: any[], rows: number, cols: number): any[][]
const grid: any[][] = [];

// DESPUÉS
interface GridCell {
  letter: string;
  clueNumber?: number;
  isStart?: boolean;
}
const generateGridFromClues = (
  clues: ClueData[],
  rows: number,
  cols: number
): GridCell[][]
const grid: GridCell[][] = [];
```

**Adapt functions:**
```typescript
// ANTES (líneas 157, 182, 185, etc.)
export const adaptToCrucigramaData = (exercise: ExerciseData): any
let wordsForGrid: any[] = [];
wordsForGrid = content.words.map((w: any) => ({...}))

// DESPUÉS
interface CrucigramaData {
  grid: GridCell[][];
  clues: ClueData[];
  rows: number;
  cols: number;
}
export const adaptToCrucigramaData = (exercise: ExerciseData): CrucigramaData
```

---

## Prioridades de Reemplazo

### Alta Prioridad (Afectan tipos centrales)
1. ✅ **exercise-submission.types.ts** - YA CREADO
2. ✅ **user-stats.types.ts** - YA CREADO
3. ✅ **classroom.types.ts** - YA CREADO
4. ✅ **user.types.ts** - YA CREADO
5. `shared/utils/exerciseAdapter.ts` - Adaptadores de ejercicios
6. `services/api/educationalAPI.ts` - API educativa
7. `services/api/adminAPI.ts` - API administrativa

### Media Prioridad (Afectan funcionalidad)
8. `services/api/teacher/gradingApi.ts` - Calificaciones
9. `hooks/useAchievements.ts` - Logros
10. `shared/types/progress.types.ts` - Progreso
11. `shared/types/educational.types.ts` - Tipos educativos

### Baja Prioridad (Utilities y tests)
12. `services/api/apiInterceptors.ts` - Interceptores
13. `services/api/apiErrorHandler.ts` - Manejo de errores
14. `config/api.config.ts` - Configuración API
15. Archivos de test (`__tests__`)

---

## Siguiente Paso

Ejecutar búsqueda y reemplazo progresivo empezando por los archivos de alta prioridad.

```bash
# Ejemplo de búsqueda de archivos afectados
grep -r ": any" apps/frontend/src/shared/utils/exerciseAdapter.ts
grep -r ": any" apps/frontend/src/services/api/educationalAPI.ts
```

---

## Notas Importantes

1. **No reemplazar `any` en:**
   - Archivos de test que usan mocks genéricos
   - Código de terceros o librerías
   - Casos donde `any` es realmente necesario (muy raros)

2. **Preferir `unknown` sobre `any`:**
   - Para datos no tipados de APIs externas
   - Para parámetros genéricos donde el tipo no importa
   - Para objetos dinámicos sin estructura conocida

3. **Crear tipos específicos cuando:**
   - El objeto tiene estructura conocida
   - Se usa en múltiples lugares
   - Es parte de la lógica de negocio

4. **Validar cambios:**
   - Ejecutar `npm run type-check` después de cada cambio
   - Verificar que no haya errores de compilación
   - Probar funcionalidad afectada

---

**Fecha:** 2025-12-05
**Tarea:** DTO-001 - Crear Tipos Canónicos
**Estado:** ✅ Tipos creados, pendiente reemplazo de `any`
