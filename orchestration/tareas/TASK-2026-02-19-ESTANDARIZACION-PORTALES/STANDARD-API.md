# STANDARD-API — Estándar de APIs e Integración Frontend

**Version:** 1.0.0 | **Fecha:** 2026-02-19 | **Estado:** Activo
**Basado en:** 02-AUDIT-API-PATTERNS.md (53 archivos API, ~565 llamadas)

---

## 1. Ubicación Canónica de APIs

### 1.1 Regla: Jerarquía de 3 niveles

```
services/api/                    ← Nivel 1: APIs compartidas cross-portal
  apiClient.ts                   ← Singleton Axios (NO MODIFICAR)
  apiErrorHandler.ts             ← handleAPIError() centralizado
  apiTypes.ts                    ← PaginatedResponse, ApiResponse
  profileAPI.ts                  ← Profile (compartido)
  notificationsAPI.ts            ← Notifications (compartido)
  friendsAPI.ts                  ← Social/friends (compartido)
  teacher/                       ← Nivel 2: Sub-APIs por portal
    teacherApi.ts
    classroomsApi.ts
    ...
  admin/                         ← Nivel 2: Sub-APIs por portal
    achievementsApi.ts
    ...
  gamification/                  ← Nivel 2: APIs por dominio (migrar de lib/api/)
    gamificationAPI.ts
    ...
  progress/                      ← Nivel 2: APIs por dominio (migrar de lib/api/)
    progressAPI.ts
    ...
features/*/api/                  ← Nivel 3: APIs feature-specific
  authAPI.ts                     ← Auth (self-contained feature)
  parentAPI.ts                   ← Parent portal
```

### 1.2 Regla: NO más `lib/api/`

```
❌ lib/api/gamification.api.ts  → ✅ services/api/gamification/gamificationAPI.ts
❌ lib/api/progress.api.ts      → ✅ services/api/progress/progressAPI.ts
❌ lib/api/branding.api.ts      → ✅ services/api/branding/brandingAPI.ts
❌ lib/api/lti.api.ts           → ✅ services/api/admin/ltiAPI.ts
```

### 1.3 Regla: NO API calls inline en componentes

```tsx
// ❌ INCORRECTO — API call en componente
export function StudentList() {
  useEffect(() => {
    apiClient.get('/students').then(setStudents);
  }, []);
}

// ✅ CORRECTO — API en servicio, consumida via hook
// services/api/educationalAPI.ts
export const getStudents = () => apiClient.get<Student[]>('/students');

// hooks/useStudents.ts
export function useStudents() {
  return useQuery({ queryKey: studentKeys.list(), queryFn: getStudents });
}

// Component
export function StudentList() {
  const { data: students } = useStudents();
}
```

---

## 2. React Query como Estándar

### 2.1 Regla: Todo data fetching usa React Query

```tsx
// ✅ CORRECTO
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useStudentProgress(studentId: string) {
  return useQuery({
    queryKey: progressKeys.student(studentId),
    queryFn: () => getStudentProgress(studentId),
    staleTime: STALE_TIMES.PROGRESS,
  });
}

// ❌ INCORRECTO — raw useState + useEffect
export function useStudentProgress(studentId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiClient.get(`/progress/${studentId}`).then(r => setData(r.data));
  }, [studentId]);
}
```

**Impacto:** ~49 hooks necesitan migración de raw → React Query.

### 2.2 Regla: Query Key Factory

```tsx
// ✅ CORRECTO — Factory pattern para query keys
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters: StudentFilters) => [...studentKeys.lists(), filters] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
  progress: (id: string) => [...studentKeys.detail(id), 'progress'] as const,
};

// ❌ INCORRECTO — String keys
useQuery({ queryKey: 'students', ... });

// ❌ INCORRECTO — Inline arrays sin factory
useQuery({ queryKey: ['students', id, 'progress'], ... });
```

### 2.3 Regla: Stale Times por Categoría

| Categoría | Stale Time | Ejemplos |
|-----------|-----------|----------|
| STATIC | 10 min | Configuración, branding, metadata |
| SEMI_STATIC | 5 min | Módulos, templates, achievements |
| DYNAMIC | 1 min | Progress, stats, leaderboard |
| REALTIME | 30s | Notifications, messages, live data |
| NONE | 0 (default) | Forms, mutations |

```tsx
export const STALE_TIMES = {
  STATIC: 10 * 60 * 1000,
  SEMI_STATIC: 5 * 60 * 1000,
  DYNAMIC: 60 * 1000,
  REALTIME: 30 * 1000,
} as const;
```

---

## 3. Error Handling en APIs

### 3.1 Regla: SIEMPRE usar `handleAPIError`

```tsx
// ✅ CORRECTO — en archivos API
import { handleAPIError } from '@/services/api/apiErrorHandler';

export async function getStudents(): Promise<Student[]> {
  try {
    const response = await apiClient.get('/students');
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
}
```

**Nota:** Los 11 archivos teacher/ NO usan handleAPIError. Migrar todos.

### 3.2 Regla: Error handling en hooks via React Query

```tsx
// ✅ CORRECTO — onError en hook, muestra toast
export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      toast.success('Estudiante eliminado');
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar estudiante');
    },
  });
}
```

---

## 4. Naming

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| API function (GET) | `get` + Entity | `getStudents()`, `getStudentById()` |
| API function (POST) | `create` + Entity | `createClassroom()` |
| API function (PUT/PATCH) | `update` + Entity | `updateProfile()` |
| API function (DELETE) | `delete` + Entity | `deleteAssignment()` |
| Query hook | `use` + Entity | `useStudents()`, `useStudentProgress()` |
| Mutation hook | `use` + Action + Entity | `useCreateClassroom()`, `useDeleteStudent()` |
| Query key factory | entityKeys | `studentKeys`, `classroomKeys` |

---

## Migración

**Prioridad 1:** Migrar `lib/api/` → `services/api/` (4 archivos)
**Prioridad 2:** Agregar `handleAPIError` a 11 teacher API files + 3 files sin error handling
**Prioridad 3:** Migrar 49 raw hooks → React Query (gradual, por portal)
**Prioridad 4:** Implementar query key factories en hooks existentes
