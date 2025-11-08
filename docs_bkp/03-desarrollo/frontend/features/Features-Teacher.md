# Features de Profesor - GAMILIT Platform v2

**Rol:** Admin Teacher
**Objetivo:** Monitoreo y gestión de estudiantes
**App:** `/src/apps/teacher/`

---

## Páginas Principales

### 1. Dashboard (`/teacher/dashboard`)

**Objetivo:** Vista general con métricas de clase

**Componentes destacados:**

```typescript
// apps/teacher/pages/dashboard/TeacherDashboardPage.tsx
export const TeacherDashboardPage: React.FC = () => {
  const classroomData = useClassroomData();

  return (
    <TeacherLayout>
      <ClassroomOverview
        totalStudents={classroomData.totalStudents}
        activeStudents={classroomData.activeToday}
        averageProgress={classroomData.averageProgress}
        completionRate={classroomData.completionRate}
      />

      <PerformanceChart data={classroomData.weeklyPerformance} />
      <AlertsPanel alerts={classroomData.alerts} />
      <RecentSubmissions submissions={classroomData.recentSubmissions} />
    </TeacherLayout>
  );
};

// apps/teacher/components/dashboard/ClassroomOverview.tsx
interface ClassroomOverviewProps {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  completionRate: number;
}

export const ClassroomOverview: React.FC<ClassroomOverviewProps> = ({
  totalStudents,
  activeStudents,
  averageProgress,
  completionRate,
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <MetricCard label="Total Estudiantes" value={totalStudents} />
    <MetricCard label="Activos Hoy" value={activeStudents} status="success" />
    <MetricCard label="Progreso Promedio" value={`${averageProgress}%`} />
    <MetricCard label="Tasa de Completación" value={`${completionRate}%`} />
  </div>
);
```

**Hooks especializados:**
- `useClassroomData()` - Datos de clase
- `useTeacherDashboard()` - Datos del dashboard
- `useStudentAlerts()` - Alertas de estudiantes

---

### 2. Monitoreo en Tiempo Real (`/teacher/monitoring`)

**Objetivo:** Supervisar actividad de estudiantes en tiempo real

**Componentes:**

```typescript
// apps/teacher/pages/monitoring/MonitoringPage.tsx
export const MonitoringPage: React.FC = () => {
  const { students, fetchStudentMonitoring } = useStudentMonitoring();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    // Actualizar cada 10 segundos
    const interval = setInterval(() => {
      fetchStudentMonitoring();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TeacherLayout>
      <MonitoringFilters />

      <div className="monitoring-grid">
        <StudentList
          students={students}
          selectedId={selectedStudent}
          onSelect={setSelectedStudent}
        />

        {selectedStudent && (
          <StudentDetailPanel studentId={selectedStudent} />
        )}
      </div>
    </TeacherLayout>
  );
};

// apps/teacher/components/monitoring/StudentMonitor.tsx
interface StudentMonitorProps {
  students: StudentMonitoring[];
  onIntervene: (studentId: string) => void;
}

export const StudentMonitor: React.FC<StudentMonitorProps> = ({
  students,
  onIntervene,
}) => (
  <div className="space-y-4">
    {students.map((student) => (
      <StudentCard
        key={student.id}
        student={student}
        status={student.status}
        progress={student.progress_percentage}
        onIntervene={() => onIntervene(student.id)}
      />
    ))}
  </div>
);
```

---

### 3. Detalle de Estudiante (`/teacher/students/:id`)

**Objetivo:** Ver progreso detallado de un estudiante

**Componentes:**

```typescript
// apps/teacher/pages/students/StudentDetailPage.tsx
export const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams();
  const studentData = useStudentDetail(studentId);

  return (
    <TeacherLayout>
      <StudentHeader student={studentData.student} />

      <Tabs>
        <TabPanel title="Progreso">
          <ProgressOverview progress={studentData.progress} />
          <ModulesProgress modules={studentData.moduleProgress} />
        </TabPanel>

        <TabPanel title="Actividad">
          <ActivityTimeline activities={studentData.activities} />
        </TabPanel>

        <TabPanel title="Evaluaciones">
          <AssessmentsList assessments={studentData.assessments} />
        </TabPanel>

        <TabPanel title="Intervenciones">
          <InterventionsHistory interventions={studentData.interventions} />
        </TabPanel>
      </Tabs>
    </TeacherLayout>
  );
};
```

---

### 4. Gestión de Tareas (`/teacher/assignments`)

**Objetivo:** Crear y gestionar tareas/ejercicios

**Componentes:**

```typescript
// apps/teacher/pages/assignments/AssignmentsPage.tsx
export const AssignmentsPage: React.FC = () => {
  const { assignments, createAssignment, deleteAssignment } =
    useAssignmentsManagement();

  return (
    <TeacherLayout>
      <AssignmentsHeader>
        <button onClick={() => openCreateModal()}>
          Nueva Tarea
        </button>
      </AssignmentsHeader>

      <AssignmentsTable
        assignments={assignments}
        onEdit={editAssignment}
        onDelete={deleteAssignment}
        onViewSubmissions={viewSubmissions}
      />

      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={createAssignment}
      />
    </TeacherLayout>
  );
};
```

---

### 5. Analytics (`/teacher/analytics`)

**Objetivo:** Análisis avanzado de aprendizaje

**Componentes:**

```typescript
// apps/teacher/pages/analytics/AnalyticsPage.tsx
export const AnalyticsPage: React.FC = () => {
  const analytics = useAnalytics();

  return (
    <TeacherLayout>
      <AnalyticsFilters
        dateRange={dateRange}
        onDateChange={setDateRange}
      />

      <div className="analytics-grid">
        <PerformanceTrends data={analytics.trends} />
        <DifficultyAnalysis data={analytics.difficulty} />
        <TimeSpentChart data={analytics.timeSpent} />
        <CompletionRates data={analytics.completion} />
      </div>

      <DetailedReports reports={analytics.reports} />
    </TeacherLayout>
  );
};
```

---

### 6. Intervenciones (`/teacher/interventions`)

**Objetivo:** Gestionar alertas y tomar acciones

**Componentes:**

```typescript
// apps/teacher/pages/interventions/InterventionsPage.tsx
export const InterventionsPage: React.FC = () => {
  const { alerts, interventions, createIntervention } = useInterventions();

  return (
    <TeacherLayout>
      <AlertsList
        alerts={alerts}
        onIntervene={(alertId) => openInterventionModal(alertId)}
      />

      <InterventionsHistory interventions={interventions} />

      <InterventionModal
        isOpen={isModalOpen}
        alert={selectedAlert}
        onSubmit={createIntervention}
      />
    </TeacherLayout>
  );
};
```

---

## Hooks Especializados

```typescript
// apps/teacher/hooks/useStudentMonitoring.ts
export const useStudentMonitoring = () => {
  const [students, setStudents] = useState<StudentMonitoring[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudentMonitoring = async () => {
    const data = await teacherAPI.getStudentMonitoring();
    setStudents(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudentMonitoring();
  }, []);

  return { students, isLoading, fetchStudentMonitoring };
};

// apps/teacher/hooks/useClassroomData.ts
export const useClassroomData = () => {
  const [data, setData] = useState<ClassroomData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const classroomData = await teacherAPI.getClassroomData();
      setData(classroomData);
    };
    fetchData();
  }, []);

  return data;
};

// apps/teacher/hooks/useAnalytics.ts
export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = async (filters: AnalyticsFilters) => {
    const data = await teacherAPI.getAnalytics(filters);
    setAnalytics(data);
  };

  return { analytics, fetchAnalytics };
};
```

---

## Layouts

```typescript
// apps/teacher/layouts/TeacherLayout.tsx
export const TeacherLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="teacher-layout">
      <TeacherHeader />
      <TeacherSidebar />
      <main className="teacher-main">{children}</main>
    </div>
  );
};
```

---

## Types Específicos

```typescript
// apps/teacher/types/monitoring.types.ts
export interface StudentMonitoring {
  id: string;
  fullName: string;
  avatar?: string;
  status: 'active' | 'idle' | 'struggling' | 'offline';
  currentExercise?: string;
  progress_percentage: number;
  lastActive: Date;
  needsIntervention: boolean;
}

export interface Alert {
  id: string;
  studentId: string;
  type: 'low_progress' | 'long_inactivity' | 'difficulty_spike' | 'help_request';
  severity: 'low' | 'medium' | 'high';
  message: string;
  createdAt: Date;
}
```

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
