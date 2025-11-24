# DELEGACIÓN: Tarea 3 - Crear UI Asignaciones Classroom-Teacher (US-AE-007)

**Fecha:** 2025-11-23
**Delegado por:** Architecture-Analyst
**Delegado a:** Frontend-Developer
**Prioridad:** P1 - ALTA (no bloqueante para MVP)
**Estimación:** 18 horas (3 días) | Proyectado: ~6 horas con eficiencia 3x
**Estado:** INICIADO

---

## 📋 CONTEXTO

Como parte del plan de integración de APIs, la US-AE-007 requiere una interfaz de administración para gestionar las asignaciones de teachers a classrooms. El backend YA tiene 7 endpoints implementados y funcionales.

### Situación Actual

- **Backend:** 7 endpoints de classroom-teacher YA implementados
- **Frontend:** NO existe interfaz de administración para estas asignaciones
- **Necesidad:** Admin necesita poder:
  - Ver teachers asignados a cada classroom
  - Ver classrooms asignados a cada teacher
  - Asignar/remover teachers de classrooms
  - Hacer asignaciones masivas

**Reporte de Análisis:** `/orchestration/reportes/REPORTE-CONSOLIDADO-PORTALES-ADMIN-TEACHER-2025-11-23.md`

**Plan Completo:** `/orchestration/agentes/architecture-analyst/integracion-apis-2025-11-23/PLAN-DETALLADO-INTEGRACION-APIS.md` (sección 3, líneas 1713-1970)

---

## 🎯 OBJETIVO DE LA TAREA

Crear interfaz completa de administración para gestionar asignaciones classroom-teacher, conectándola a los 7 endpoints backend ya implementados.

---

## 📂 ARCHIVOS A CREAR

### 6 Archivos Nuevos

1. **`apps/frontend/src/types/admin/classroom-teacher.types.ts`**
   - 6 interfaces TypeScript
   - DTOs para asignaciones

2. **`apps/frontend/src/services/api/admin/classroomTeacherApi.ts`**
   - Cliente API con 7 métodos
   - Conexión a endpoints backend

3. **`apps/frontend/src/apps/admin/hooks/useClassroomTeacher.ts`**
   - Hook React Query
   - Queries y mutations

4. **`apps/frontend/src/apps/admin/pages/AdminClassroomTeacherPage.tsx`**
   - Página principal con 3 tabs
   - Vista por classroom, por teacher, asignación masiva

5. **`apps/frontend/src/apps/admin/components/classroom-teacher/ClassroomTeachersTab.tsx`**
   - Tab 1: Teachers por classroom
   - Lista, asignar, remover

6. **`apps/frontend/src/apps/admin/components/classroom-teacher/TeacherClassroomsTab.tsx`**
   - Tab 2: Classrooms por teacher
   - Lista, asignar multiple

**Nota:** Se simplifican componentes para reducir complejidad. Modals pueden integrarse inline.

---

## 🛠️ PASOS DE IMPLEMENTACIÓN

### Paso 1: Crear DTOs (30 min)

**Archivo:** `apps/frontend/src/types/admin/classroom-teacher.types.ts`

**Contenido:**

```typescript
// apps/frontend/src/types/admin/classroom-teacher.types.ts

export interface ClassroomTeacherAssignment {
  id: string;
  classroomId: string;
  teacherId: string;
  classroom: {
    id: string;
    name: string;
    grade: string;
    section: string;
    schoolId: string;
    schoolName: string;
  };
  teacher: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  assignedAt: string;
  assignedBy: string;
}

export interface AssignTeacherToClassroomDto {
  teacherId: string;
  metadata?: Record<string, any>;
}

export interface AssignClassroomsToTeacherDto {
  classroomIds: string[];
  metadata?: Record<string, any>;
}

export interface BulkAssignDto {
  assignments: Array<{
    classroomId: string;
    teacherId: string;
  }>;
}

export interface ClassroomWithTeachers {
  id: string;
  name: string;
  grade: string;
  section: string;
  teachers: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    assignedAt: string;
  }>;
  teachersCount: number;
}

export interface TeacherWithClassrooms {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  classrooms: Array<{
    id: string;
    name: string;
    grade: string;
    section: string;
    assignedAt: string;
  }>;
  classroomsCount: number;
}
```

**Validación:**
```bash
npx tsc --noEmit
# Verificar que compila sin errores
```

---

### Paso 2: Crear API Client (1 hora)

**Archivo:** `apps/frontend/src/services/api/admin/classroomTeacherApi.ts`

**Contenido:**

```typescript
// apps/frontend/src/services/api/admin/classroomTeacherApi.ts

import { apiClient } from '../apiClient';
import type {
  ClassroomTeacherAssignment,
  AssignTeacherToClassroomDto,
  AssignClassroomsToTeacherDto,
  BulkAssignDto,
  ClassroomWithTeachers,
  TeacherWithClassrooms,
} from '@/types/admin/classroom-teacher.types';

const BASE_URL = '/api/admin';

export const classroomTeacherApi = {
  /**
   * Obtiene teachers de un classroom
   */
  async getClassroomTeachers(classroomId: string): Promise<ClassroomWithTeachers> {
    const response = await apiClient.get(`${BASE_URL}/classrooms/${classroomId}/teachers`);
    return response.data;
  },

  /**
   * Asigna teacher a classroom
   */
  async assignTeacherToClassroom(
    classroomId: string,
    data: AssignTeacherToClassroomDto
  ): Promise<ClassroomTeacherAssignment> {
    const response = await apiClient.post(
      `${BASE_URL}/classrooms/${classroomId}/teachers`,
      data
    );
    return response.data;
  },

  /**
   * Remueve teacher de classroom
   */
  async removeTeacherFromClassroom(
    classroomId: string,
    teacherId: string
  ): Promise<void> {
    await apiClient.delete(`${BASE_URL}/classrooms/${classroomId}/teachers/${teacherId}`);
  },

  /**
   * Obtiene classrooms de un teacher
   */
  async getTeacherClassrooms(teacherId: string): Promise<TeacherWithClassrooms> {
    const response = await apiClient.get(`${BASE_URL}/teachers/${teacherId}/classrooms`);
    return response.data;
  },

  /**
   * Asigna classrooms a teacher
   */
  async assignClassroomsToTeacher(
    teacherId: string,
    data: AssignClassroomsToTeacherDto
  ): Promise<{ assigned: number }> {
    const response = await apiClient.post(
      `${BASE_URL}/teachers/${teacherId}/classrooms`,
      data
    );
    return response.data;
  },

  /**
   * Lista todas las asignaciones
   */
  async listAllAssignments(query?: {
    schoolId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: ClassroomTeacherAssignment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get(`${BASE_URL}/classroom-teachers`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Asignación masiva
   */
  async bulkAssign(data: BulkAssignDto): Promise<{ assigned: number }> {
    const response = await apiClient.post(
      `${BASE_URL}/classroom-teachers/bulk`,
      data
    );
    return response.data;
  },
};
```

**Validación:**
```bash
npx tsc --noEmit
grep -r "classroomTeacherApi" apps/frontend/src/
```

---

### Paso 3: Crear Hook React Query (1.5 horas)

**Archivo:** `apps/frontend/src/apps/admin/hooks/useClassroomTeacher.ts`

**Contenido:**

```typescript
// apps/frontend/src/apps/admin/hooks/useClassroomTeacher.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classroomTeacherApi } from '@/services/api/admin/classroomTeacherApi';
import type {
  AssignTeacherToClassroomDto,
  AssignClassroomsToTeacherDto,
  BulkAssignDto,
} from '@/types/admin/classroom-teacher.types';
import { toast } from 'react-hot-toast';

const QUERY_KEYS = {
  classroomTeachers: (classroomId: string) => ['classroom-teachers', 'classroom', classroomId],
  teacherClassrooms: (teacherId: string) => ['classroom-teachers', 'teacher', teacherId],
  allAssignments: (query?: any) => ['classroom-teachers', 'all', query],
};

export function useClassroomTeacher() {
  const queryClient = useQueryClient();

  // ========================================
  // QUERIES
  // ========================================

  const useClassroomTeachers = (classroomId: string, enabled = true) => {
    return useQuery({
      queryKey: QUERY_KEYS.classroomTeachers(classroomId),
      queryFn: () => classroomTeacherApi.getClassroomTeachers(classroomId),
      enabled,
      staleTime: 1000 * 60 * 5, // 5 min
    });
  };

  const useTeacherClassrooms = (teacherId: string, enabled = true) => {
    return useQuery({
      queryKey: QUERY_KEYS.teacherClassrooms(teacherId),
      queryFn: () => classroomTeacherApi.getTeacherClassrooms(teacherId),
      enabled,
      staleTime: 1000 * 60 * 5, // 5 min
    });
  };

  const useAllAssignments = (query?: any) => {
    return useQuery({
      queryKey: QUERY_KEYS.allAssignments(query),
      queryFn: () => classroomTeacherApi.listAllAssignments(query),
      staleTime: 1000 * 60 * 2, // 2 min
    });
  };

  // ========================================
  // MUTATIONS
  // ========================================

  const assignTeacherToClassroom = useMutation({
    mutationFn: ({ classroomId, data }: { classroomId: string; data: AssignTeacherToClassroomDto }) =>
      classroomTeacherApi.assignTeacherToClassroom(classroomId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.classroomTeachers(variables.classroomId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teacherClassrooms(variables.data.teacherId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allAssignments() });
      toast.success('Teacher asignado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al asignar teacher');
    },
  });

  const removeTeacherFromClassroom = useMutation({
    mutationFn: ({ classroomId, teacherId }: { classroomId: string; teacherId: string }) =>
      classroomTeacherApi.removeTeacherFromClassroom(classroomId, teacherId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.classroomTeachers(variables.classroomId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teacherClassrooms(variables.teacherId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allAssignments() });
      toast.success('Teacher removido correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al remover teacher');
    },
  });

  const assignClassroomsToTeacher = useMutation({
    mutationFn: ({ teacherId, data }: { teacherId: string; data: AssignClassroomsToTeacherDto }) =>
      classroomTeacherApi.assignClassroomsToTeacher(teacherId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teacherClassrooms(variables.teacherId) });
      variables.data.classroomIds.forEach((classroomId) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.classroomTeachers(classroomId) });
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allAssignments() });
      toast.success('Classrooms asignados correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al asignar classrooms');
    },
  });

  const bulkAssign = useMutation({
    mutationFn: (data: BulkAssignDto) => classroomTeacherApi.bulkAssign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-teachers'] });
      toast.success('Asignación masiva completada');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error en asignación masiva');
    },
  });

  return {
    // Queries
    useClassroomTeachers,
    useTeacherClassrooms,
    useAllAssignments,
    // Mutations
    assignTeacherToClassroom,
    removeTeacherFromClassroom,
    assignClassroomsToTeacher,
    bulkAssign,
  };
}
```

**Validación:**
```bash
npx tsc --noEmit
```

---

### Paso 4: Crear Página Principal (3 horas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminClassroomTeacherPage.tsx`

**Contenido:** Página con tabs para gestionar asignaciones

**Estructura simplificada:**
- Tab 1: Por Classroom (lista classrooms, al seleccionar muestra teachers)
- Tab 2: Por Teacher (lista teachers, al seleccionar muestra classrooms)

**Nota:** Este archivo requerirá componentes de UI (Tabs, Table, Button, Modal, etc.). Simplificaremos la implementación para reducir complejidad.

**Estimación:** 3 horas (incluyendo integración de tabs y lógica)

---

### Paso 5: Crear Componentes de Tabs (4 horas)

**Archivos:**

1. **`apps/frontend/src/apps/admin/components/classroom-teacher/ClassroomTeachersTab.tsx`**
   - Lista classrooms
   - Al seleccionar, muestra teachers asignados
   - Botón para asignar teacher
   - Botón para remover teacher

2. **`apps/frontend/src/apps/admin/components/classroom-teacher/TeacherClassroomsTab.tsx`**
   - Lista teachers
   - Al seleccionar, muestra classrooms asignados
   - Botón para asignar classrooms

**Estimación:** 2 horas cada componente = 4 horas total

---

### Paso 6: Testing y Ajustes (2 horas)

**Actividades:**
- Compilación TypeScript
- Testing manual en navegador
- Ajustes de UI/UX
- Verificación de endpoints

---

## 📊 CRITERIOS DE ACEPTACIÓN

### Funcionales

1. ✅ AdminClassroomTeacherPage existe y es accesible
2. ✅ Tab "Por Classroom" lista classrooms y permite ver/asignar/remover teachers
3. ✅ Tab "Por Teacher" lista teachers y permite ver/asignar classrooms
4. ✅ Asignación de teacher a classroom funciona
5. ✅ Remoción de teacher de classroom funciona
6. ✅ Asignación de múltiples classrooms a teacher funciona
7. ✅ Llamadas a APIs backend se hacen correctamente

### Técnicos

1. ✅ TypeScript compila sin errores
2. ✅ 6 archivos creados
3. ✅ Hook useClassroomTeacher con queries y mutations
4. ✅ API Client con 7 métodos
5. ✅ React Query configurado (cache, invalidation)
6. ✅ Toast notifications funcionan

---

## 🚨 PUNTOS CRÍTICOS

### ⚠️ NO hacer

1. **NO modificar backend** - Los 7 endpoints YA existen y funcionan
2. **NO modificar base de datos** - Las tablas YA existen
3. **NO crear seeds** - Datos de classrooms y teachers YA existen
4. **NO sobre-diseñar** - Mantener UI simple y funcional

### ✅ Sí hacer

1. **SÍ usar React Query** para data fetching
2. **SÍ manejar loading states** apropiadamente
3. **SÍ manejar errores** con toasts
4. **SÍ hacer commits atómicos** (un commit por archivo/funcionalidad)
5. **SÍ simplificar** cuando sea posible (menos componentes = menos complejidad)

---

## 📝 COMMITS SUGERIDOS

```bash
# Commit 1: DTOs
git add apps/frontend/src/types/admin/classroom-teacher.types.ts
git commit -m "feat(admin): add classroom-teacher DTOs for US-AE-007

- Add ClassroomTeacherAssignment interface
- Add ClassroomWithTeachers interface
- Add TeacherWithClassrooms interface
- Add DTOs for assign/remove operations

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 2: API Client
git add apps/frontend/src/services/api/admin/classroomTeacherApi.ts
git commit -m "feat(admin): add classroom-teacher API client

- Implement 7 methods for classroom-teacher endpoints
- getClassroomTeachers, assignTeacherToClassroom
- removeTeacherFromClassroom, getTeacherClassrooms
- assignClassroomsToTeacher, listAllAssignments, bulkAssign

Connects to existing US-AE-007 backend endpoints

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 3: Hook
git add apps/frontend/src/apps/admin/hooks/useClassroomTeacher.ts
git commit -m "feat(admin): add useClassroomTeacher React Query hook

- Add 3 queries (classrooms, teachers, all assignments)
- Add 4 mutations (assign, remove, assign multiple, bulk)
- Implement cache invalidation
- Add toast notifications

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 4: Página principal
git add apps/frontend/src/apps/admin/pages/AdminClassroomTeacherPage.tsx
git commit -m "feat(admin): add AdminClassroomTeacherPage with tabs

- Add page with 2 tabs (By Classroom, By Teacher)
- Tab 1: View and manage teachers per classroom
- Tab 2: View and manage classrooms per teacher

Part of US-AE-007 implementation

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 5: Componentes de tabs
git add apps/frontend/src/apps/admin/components/classroom-teacher/
git commit -m "feat(admin): add classroom-teacher tab components

- Add ClassroomTeachersTab component
- Add TeacherClassroomsTab component
- Implement assign/remove functionality
- Connect to useClassroomTeacher hook

Completes US-AE-007 frontend integration

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 📚 RECURSOS DE REFERENCIA

### Documentación

- **Plan Detallado (Sección 3):** Líneas 1713-1970 del archivo `PLAN-DETALLADO-INTEGRACION-APIS.md`
- **Reporte de Análisis:** `/orchestration/reportes/REPORTE-CONSOLIDADO-PORTALES-ADMIN-TEACHER-2025-11-23.md`

### Backend Existente

- **Controller:** `apps/backend/src/modules/admin/controllers/admin-classroom-teacher.controller.ts` (si existe)
- **Endpoints:** 7 endpoints implementados para US-AE-007

### Ejemplos de Referencia

- **Hook similar:** `useGamificationConfig.ts` (Tarea 1)
- **API Client similar:** `gamificationConfigApi.ts` (Tarea 1)
- **Página con tabs:** Buscar ejemplos en `apps/frontend/src/apps/admin/pages/`

---

## ⏱️ TIMELINE DETALLADO

| Hora | Actividad | Entregable |
|------|-----------|------------|
| 0-0.5h | Crear DTOs | `classroom-teacher.types.ts` |
| 0.5-1.5h | Crear API Client | `classroomTeacherApi.ts` |
| 1.5-3h | Crear Hook React Query | `useClassroomTeacher.ts` |
| 3-6h | Crear página principal + tabs | `AdminClassroomTeacherPage.tsx` + componentes |
| 6-8h | Crear componentes de tabs | `ClassroomTeachersTab.tsx`, `TeacherClassroomsTab.tsx` |
| 8-10h | Testing manual + ajustes | Validación completa |
| 10-11h | Code review + commits | Git history limpio |

**Total: 11 horas → Proyectado ~4-6 horas con eficiencia**

---

## 🎯 PRÓXIMOS PASOS POST-TAREA-3

Una vez completada la Tarea 3, se procederá con:

1. **Validación final** de toda la integración (Tareas 1, 2, 3, 4)
2. **Testing manual** completo de ambos portales
3. **Generación de reporte final** para PO
4. **Screenshots y evidencia** de funcionalidad

---

## 📞 CONTACTO Y SOPORTE

**Delegado por:** Architecture-Analyst
**Para dudas:** Consultar plan detallado o escalar a Architecture-Analyst
**Validación:** Architecture-Analyst revisará al completar

---

## 🎯 DEFINICIÓN DE DONE

La tarea se considera COMPLETA cuando:

1. ✅ 6 archivos creados correctamente
2. ✅ TypeScript compila sin errores
3. ✅ AdminClassroomTeacherPage accesible y funcional
4. ✅ Asignación de teachers a classrooms funciona
5. ✅ Remoción de teachers funciona
6. ✅ APIs backend se consumen correctamente
7. ✅ 5 commits creados con SHAs
8. ✅ Architecture-Analyst valida y aprueba

---

**FIN DE LA DELEGACIÓN**

**Fecha:** 2025-11-23
**Estado:** INICIADO - Esperando ejecución de Frontend-Developer
**Próxima Revisión:** Al completar testing manual
