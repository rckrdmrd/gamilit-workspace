# PLAN DE IMPLEMENTACIÓN - CORRECCIONES PORTAL TEACHER

**Fecha:** 2025-11-26
**Autor:** Architecture-Analyst
**Estado:** PENDIENTE APROBACIÓN

---

## RESUMEN EJECUTIVO

Se identificaron **7 problemas críticos/medios** que afectan la carga de datos en el portal Teacher.
Este plan define las correcciones necesarias organizadas por prioridad y agente responsable.

---

## FASE 1: CORRECCIONES CRÍTICAS (Frontend-Agent)

### TAREA F1: Corregir extracción de datos paginados en TeacherDashboard
**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherDashboard.tsx`
**Línea:** 96
**Cambio:**
```typescript
// DE:
const students = studentsArrays.flat();

// A:
const students = studentsArrays.flatMap(response => response.data);
```
**Impacto:** CRÍTICO - Los datos de estudiantes no se muestran correctamente

---

### TAREA F2: Corregir dependencia circular en useEffect
**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherDashboard.tsx`
**Línea:** 75-79
**Cambio:**
```typescript
// DE:
useEffect(() => {
  if (classrooms && classrooms.length > 0 && !selectedClassroomId) {
    setSelectedClassroomId(classrooms[0].id);
  }
}, [classrooms, selectedClassroomId]);

// A:
useEffect(() => {
  if (classrooms && classrooms.length > 0 && !selectedClassroomId) {
    setSelectedClassroomId(classrooms[0].id);
  }
}, [classrooms]); // Remover selectedClassroomId
```
**Impacto:** CRÍTICO - Causa re-renders innecesarios

---

### TAREA F3: Corregir tipo de allStudents
**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherDashboard.tsx`
**Línea:** 68
**Cambio:**
```typescript
// DE:
const [allStudents, setAllStudents] = useState<any[]>([]);

// A:
import type { StudentMonitoring } from '@apps/teacher/types';
const [allStudents, setAllStudents] = useState<StudentMonitoring[]>([]);
```
**Impacto:** MEDIO - Oculta errores de tipos

---

### TAREA F4: Memoizar queries en TeacherAnalytics
**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherAnalytics.tsx`
**Líneas:** 74-88
**Cambio:** Usar useMemo para crear objetos query
```typescript
const analyticsQuery = useMemo(() =>
  selectedClassroomId ? {
    classroom_id: selectedClassroomId,
    start_date: dateRange.start,
    end_date: dateRange.end,
  } : undefined,
  [selectedClassroomId, dateRange.start, dateRange.end]
);

const engagementQuery = useMemo(() =>
  selectedClassroomId ? {
    classroom_id: selectedClassroomId,
    start_date: dateRange.start,
    end_date: dateRange.end,
    period: 'daily' as const,
  } : undefined,
  [selectedClassroomId, dateRange.start, dateRange.end]
);
```
**Impacto:** MEDIO - Evita llamadas API redundantes

---

### TAREA F5: Optimizar carga de detalle en TeacherStudents
**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherStudents.tsx`
**Líneas:** 116-132
**Cambio:** Usar datos ya cargados en lugar de refetch
```typescript
const viewStudentDetail = (student: StudentExtended) => {
  setSelectedStudent(student);
  // Buscar en datos ya cargados en lugar de hacer nuevo fetch
  const existingStudents = students.filter(s => s.classroom_id === student.classroom_id);
  // O crear objeto StudentMonitoring desde StudentExtended
  const studentMonitoring: StudentMonitoring = {
    id: student.student_id,
    full_name: student.student_name,
    email: student.email,
    status: 'active',
    current_module: null,
    current_exercise: null,
    last_activity: student.last_active,
    progress_percentage: student.completion_rate,
    score_average: student.average_score,
    time_spent_minutes: 0,
    exercises_completed: 0,
    exercises_total: 0,
  };
  setSelectedStudentMonitoring(studentMonitoring);
  setIsDetailModalOpen(true);
};
```
**Impacto:** MEDIO - Elimina llamada API redundante

---

### TAREA F6: Agregar cleanup en useEffect de estudiantes
**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherDashboard.tsx`
**Líneas:** 84-105
**Cambio:** Agregar flag isMounted para evitar memory leaks
```typescript
useEffect(() => {
  let isMounted = true;

  const fetchAllStudents = async () => {
    if (!classrooms || classrooms.length === 0) {
      setAllStudents([]);
      return;
    }
    try {
      const studentsPromises = classrooms.map((classroom: Classroom) =>
        classroomsApi.getClassroomStudents(classroom.id),
      );
      const studentsArrays = await Promise.all(studentsPromises);
      const students = studentsArrays.flatMap(response => response.data);

      if (isMounted) {
        setAllStudents(students);
      }
    } catch (error) {
      console.error('[TeacherDashboard] Error fetching students:', error);
      if (isMounted) {
        setAllStudents([]);
      }
    }
  };

  fetchAllStudents();

  return () => {
    isMounted = false;
  };
}, [classrooms]);
```

---

## FASE 2: CORRECCIONES BACKEND (Backend-Agent)

### TAREA B1: Crear endpoint GET /teacher/reports/recent
**Ubicación:** `apps/backend/src/modules/teacher/controllers/teacher.controller.ts`
**Especificación:**
- Ruta: `GET /teacher/reports/recent`
- Guards: JwtAuthGuard, TeacherGuard
- Parámetros: limit (opcional, default 10)
- Respuesta: Array de ReportMetadata con campos:
  - id, name, type, format, generatedAt, studentCount, period

**Nota:** Requiere crear tabla para persistir reportes generados

---

### TAREA B2: Crear endpoint GET /teacher/reports/stats
**Ubicación:** `apps/backend/src/modules/teacher/controllers/teacher.controller.ts`
**Especificación:**
- Ruta: `GET /teacher/reports/stats`
- Guards: JwtAuthGuard, TeacherGuard
- Respuesta: ReportStats con campos:
  - totalReportsGenerated, lastGeneratedDate, mostUsedFormat, avgStudentsPerReport

---

### TAREA B3: Crear endpoint GET /teacher/reports/:id/download
**Ubicación:** `apps/backend/src/modules/teacher/controllers/teacher.controller.ts`
**Especificación:**
- Ruta: `GET /teacher/reports/:id/download`
- Guards: JwtAuthGuard, TeacherGuard
- Validación: Verificar ownership del reporte
- Respuesta: Blob del archivo (PDF/Excel)

---

## FASE 3: CORRECCIONES DATABASE (Database-Agent)

### TAREA D1: Crear tabla teacher_reports para persistencia
**Ubicación:** `apps/database/ddl/social_features/tables/teacher_reports.sql`
**Especificación:**
```sql
CREATE TABLE social_features.teacher_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES auth_management.profiles(id),
  classroom_id UUID REFERENCES social_features.classrooms(id),
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL, -- 'individual', 'classroom', 'progress'
  report_format VARCHAR(10) NOT NULL, -- 'pdf', 'excel', 'csv'
  student_count INTEGER,
  period_start DATE,
  period_end DATE,
  file_path TEXT, -- Ruta al archivo generado
  file_size_bytes BIGINT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID NOT NULL REFERENCES auth_management.tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_teacher_reports_teacher ON social_features.teacher_reports(teacher_id);
CREATE INDEX idx_teacher_reports_tenant ON social_features.teacher_reports(tenant_id);
CREATE INDEX idx_teacher_reports_generated ON social_features.teacher_reports(generated_at DESC);

-- RLS
ALTER TABLE social_features.teacher_reports ENABLE ROW LEVEL SECURITY;
```

---

## ORDEN DE EJECUCIÓN

| Orden | Fase | Tareas | Agente | Dependencias |
|-------|------|--------|--------|--------------|
| 1 | Frontend | F1, F2, F3 | Frontend-Agent | Ninguna |
| 2 | Frontend | F4, F5, F6 | Frontend-Agent | Ninguna |
| 3 | Database | D1 | Database-Agent | Ninguna |
| 4 | Backend | B1, B2, B3 | Backend-Agent | D1 completada |

---

## CRITERIOS DE ACEPTACIÓN

### Frontend
- [ ] TeacherDashboard carga estudiantes correctamente (no PaginatedResponse)
- [ ] No hay re-renders innecesarios en Dashboard
- [ ] TypeScript compila sin errores de tipo
- [ ] TeacherAnalytics no hace llamadas API redundantes
- [ ] TeacherStudents no refetchea al ver detalle

### Backend
- [ ] GET /teacher/reports/recent retorna lista de reportes
- [ ] GET /teacher/reports/stats retorna estadísticas
- [ ] GET /teacher/reports/:id/download permite descargar reportes previos

### Database
- [ ] Tabla teacher_reports creada con RLS
- [ ] Índices optimizados para consultas frecuentes

---

## ESTIMACIÓN DE IMPACTO

| Área | Antes | Después |
|------|-------|---------|
| Dashboard estudiantes | ❌ Datos malformados | ✅ Datos correctos |
| Analytics queries | ⚠️ Llamadas redundantes | ✅ Optimizado |
| Students detalle | ⚠️ N+1 queries | ✅ Sin queries extra |
| Reportes historial | ❌ Siempre mock | ✅ Datos reales |
| Reportes descarga | ❌ Error 404 | ✅ Funcional |

---

**Estado:** PENDIENTE APROBACIÓN DEL USUARIO

¿Deseas que proceda con la ejecución de este plan?
