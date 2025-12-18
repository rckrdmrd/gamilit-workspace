# PLAN DE CORRECCIONES - Integración Portales
**Fecha:** 2025-12-14
**Agente:** Architecture-Analyst
**Proyecto:** GAMILIT

---

## RESUMEN DE CORRECCIONES

| GAP | Prioridad | Complejidad | Archivos |
|-----|-----------|-------------|----------|
| GAP-001: Mock Classrooms | P0 | MEDIA | 3 |
| GAP-002: Mock Institution Stats | P1 | BAJA | 1 |
| GAP-004: Fallback Mock IDs | P2 | BAJA | 5 |
| GAP-003: Comentarios obsoletos | P3 | BAJA | 9 |

---

## TAREA-001: Reemplazar MOCK_CLASSROOMS con API Real

**Prioridad:** P0 (CRÍTICA)
**Complejidad:** MEDIA
**Tiempo estimado:** 2-3 horas

### Objetivo
Conectar `AdminProgressPage.tsx` con el endpoint real de classrooms.

### Archivos a modificar

#### 1. `apps/frontend/src/services/api/adminAPI.ts`

**Agregar:**
```typescript
// En la sección de dashboard o crear nueva sección "classrooms"
classrooms: {
  /**
   * Get all classrooms for admin view
   */
  getAll: async (params?: { schoolId?: string }): Promise<ClassroomBasic[]> => {
    const response = await apiClient.get('/social/classrooms', { params });
    return response.data;
  },

  /**
   * Get classroom overview with statistics
   */
  getOverview: async (): Promise<ClassroomOverview[]> => {
    const response = await apiClient.get('/admin/dashboard/classroom-overview');
    return response.data.data;
  },
},
```

**Agregar tipos en `adminTypes.ts`:**
```typescript
export interface ClassroomBasic {
  id: string;
  name: string;
  school_id?: string;
  teacher_id?: string;
  grade_level?: string;
  section?: string;
  current_students_count?: number;
  is_active: boolean;
}

export interface ClassroomOverview extends ClassroomBasic {
  assignments_count?: number;
  average_progress?: number;
}
```

#### 2. `apps/frontend/src/apps/admin/hooks/useClassroomsList.ts` (NUEVO)

```typescript
/**
 * useClassroomsList Hook
 *
 * Fetches list of classrooms for admin pages
 */
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/services/api/adminAPI';
import type { ClassroomBasic } from '@/services/api/adminTypes';

export function useClassroomsList(schoolId?: string) {
  return useQuery<ClassroomBasic[], Error>({
    queryKey: ['admin', 'classrooms', schoolId],
    queryFn: () => adminAPI.classrooms.getAll({ schoolId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

#### 3. `apps/frontend/src/apps/admin/pages/AdminProgressPage.tsx`

**Cambios:**

```diff
- // Mock data for classrooms - in production, this would come from an API
- const MOCK_CLASSROOMS = [
-   { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Matemáticas 1A' },
-   { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Matemáticas 1B' },
-   { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Matemáticas 2A' },
- ];

+ import { useClassroomsList } from '../hooks/useClassroomsList';
+
+ // Inside component:
+ const { data: classrooms = [], isLoading: classroomsLoading } = useClassroomsList();
```

**En el JSX, reemplazar:**
```diff
- classrooms={MOCK_CLASSROOMS}
+ classrooms={classrooms}
+ isLoading={classroomsLoading}
```

### Validación
- [ ] Build pasa
- [ ] AdminProgressPage carga classrooms del API
- [ ] Selector de aulas muestra datos reales
- [ ] Progreso se actualiza al seleccionar aula

---

## TAREA-002: Conectar Institution Stats

**Prioridad:** P1 (ALTA)
**Complejidad:** BAJA
**Tiempo estimado:** 1 hora

### Objetivo
Conectar las estadísticas de instituciones con el API existente.

### Archivos a modificar

#### `apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx`

**Cambios:**
```diff
+ import { useAdminDashboard } from '../hooks/useAdminDashboard';

// Inside component:
- // Mock stats data (replace with API call when available)
- const [institutionStats] = useState<InstitutionStatsData | null>(null);
+ const { organizationStats, isLoading: statsLoading } = useAdminDashboard();
+ const institutionStats = organizationStats; // Map to expected format
```

### Validación
- [ ] Build pasa
- [ ] Estadísticas de instituciones se muestran
- [ ] Datos coinciden con el dashboard

---

## TAREA-003: Mejorar Manejo de User ID

**Prioridad:** P2 (MEDIA)
**Complejidad:** BAJA
**Tiempo estimado:** 30 minutos

### Objetivo
Manejar correctamente el caso cuando `user?.id` es undefined.

### Archivos a modificar

1. `AdminAlertsPage.tsx`
2. `AdminAssignmentsPage.tsx`
3. `AdminClassroomTeacherPage.tsx`
4. `AdminProgressPage.tsx`
5. `AdminUsersPage.tsx`

### Patrón a aplicar

```typescript
// ANTES:
const displayGamificationData = gamificationData || {
  userId: user?.id || 'mock-admin-id',
  // ...
};

// DESPUÉS:
const displayGamificationData = gamificationData || {
  userId: user?.id || '', // Empty string instead of mock
  level: 1,
  totalXP: 0,
  mlCoins: 0,
  rank: 'Admin',
  achievements: [],
};

// Y agregar validación:
if (!user?.id) {
  return <Navigate to="/login" replace />;
}
```

### Validación
- [ ] Build pasa
- [ ] No hay referencias a 'mock-admin-id'
- [ ] Redirige a login si no hay usuario

---

## TAREA-004: Limpiar Comentarios Obsoletos

**Prioridad:** P3 (BAJA)
**Complejidad:** BAJA
**Tiempo estimado:** 15 minutos

### Objetivo
Actualizar o eliminar comentarios que mencionan "mock data" cuando ya no aplica.

### Archivos a modificar

1. `TeacherAlertsPage.tsx`
2. `TeacherAnalyticsPage.tsx`
3. `TeacherAssignmentsPage.tsx`
4. `TeacherContentPage.tsx`
5. `TeacherGamificationPage.tsx`
6. `TeacherMonitoringPage.tsx`
7. `TeacherProgressPage.tsx`
8. `TeacherReportsPage.tsx`
9. `TeacherResourcesPage.tsx`

### Patrón a aplicar

```diff
- // Use useUserGamification hook (currently with mock data until backend endpoint is ready)
+ // Use useUserGamification hook for real-time gamification data
```

### Validación
- [ ] No hay comentarios sobre "mock data" que sean incorrectos

---

## ORDEN DE EJECUCIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: Preparación (sin cambios de código)                     │
│         - Verificar endpoints existentes                        │
│         - Preparar tipos TypeScript                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 2: TAREA-001 (P0)                                          │
│         - Agregar API de classrooms en adminAPI.ts              │
│         - Crear hook useClassroomsList                          │
│         - Actualizar AdminProgressPage.tsx                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 3: TAREA-002 (P1)                                          │
│         - Conectar institution stats                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 4: TAREA-003 y TAREA-004 (P2-P3)                           │
│         - Mejorar manejo de user ID                             │
│         - Limpiar comentarios                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 5: Validación Final                                        │
│         - npm run build                                         │
│         - npm run lint                                          │
│         - Test funcional en cada portal                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## PROMPTS PARA SUBAGENTES

### Subagente Frontend - TAREA-001

```markdown
## TAREA: Integrar API de Classrooms en AdminProgressPage

### CONTEXTO
AdminProgressPage.tsx usa MOCK_CLASSROOMS hardcodeado en lugar de datos reales.
El endpoint GET /api/v1/social/classrooms existe y devuelve las aulas.

### PASOS

1. **Agregar método a adminAPI.ts:**
   - Crear sección `classrooms` con método `getAll()`
   - Endpoint: `/social/classrooms`

2. **Agregar tipos a adminTypes.ts:**
   - Interface `ClassroomBasic` con id, name, is_active

3. **Crear hook useClassroomsList.ts:**
   - Usar React Query
   - Query key: ['admin', 'classrooms']

4. **Actualizar AdminProgressPage.tsx:**
   - Importar useClassroomsList
   - Eliminar MOCK_CLASSROOMS
   - Usar datos del hook

### VALIDACIÓN
- npm run build DEBE PASAR
- La página debe cargar classrooms desde el API
```

### Subagente Frontend - TAREA-002, 003, 004

```markdown
## TAREA: Correcciones menores en Admin Pages

### TAREAS

1. **AdminInstitutionsPage.tsx:**
   - Reemplazar mock institutionStats con datos de useAdminDashboard

2. **5 archivos Admin:**
   - Reemplazar 'mock-admin-id' con '' o manejar redirect a login

3. **9 archivos Teacher:**
   - Actualizar comentarios obsoletos sobre "mock data"

### VALIDACIÓN
- npm run build DEBE PASAR
- No debe haber referencias a 'mock-admin-id'
```

---

## ESTIMACIÓN TOTAL

| Fase | Tiempo |
|------|--------|
| Fase 1: Preparación | 15 min |
| Fase 2: TAREA-001 | 2-3 hrs |
| Fase 3: TAREA-002 | 1 hr |
| Fase 4: TAREA-003 + 004 | 45 min |
| Fase 5: Validación | 30 min |
| **TOTAL** | **~5 horas** |

---

## CHECKLIST PRE-EJECUCIÓN

- [x] Gaps identificados y documentados
- [x] Endpoints verificados en backend
- [x] Plan de corrección detallado
- [x] Cambios específicos documentados
- [x] Prompts para subagentes preparados
- [ ] Aprobación del usuario para proceder

---

**Estado:** PLAN COMPLETADO
**Próximo paso:** Solicitar aprobación para ejecutar
**Última actualización:** 2025-12-14
