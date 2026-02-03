---
id: "US-PM-000"
title: "Dashboard de Maestro Base"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 8
budget: "$3,200 MXN"
sprint: "Fase-3"
labels: ["portal-maestros", "dashboard", "teacher", "v2-core"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-PM-000: Dashboard de Maestro Base

**Épica:** EXT-001 (Portal de Maestros)
**Origen:** Movida desde EAI-005 (US-ADM-003)
**Sprint:** Fase 3 - Extensiones (v2 CORE)
**Story Points:** 8 SP
**Presupuesto:** $3,200 MXN
**Prioridad:** Alta (Alcance v2 CORE)
**Estado:** Done

**NOTA:** Esta US fue reclasificada desde EAI-005 a EXT-001 porque requiere rol `teacher` que no existía en alcance v1. Es funcionalidad base del Portal de Maestros (v2).

---

## Descripción

Como profesor, quiero tener un dashboard general que me muestre un resumen de todas mis aulas para tener una vista panorámica de mi trabajo y acceder rápidamente a cada aula.

**Contexto del Alcance v2:**

Este es el dashboard principal del profesor al iniciar sesión (funcionalidad base del Portal de Maestros). Muestra un resumen de todas sus aulas con estadísticas básicas y acceso rápido a analytics. NO incluye gráficas avanzadas, comparativas entre aulas, ni métricas de engagement (esas funcionalidades están en US-PM-004a, US-PM-005a, US-PM-005c).

---

## Criterios de Aceptación

### CA-01: Vista General de Aulas
- [ ] Grid/cards con todas las aulas del profesor
- [ ] Para cada aula muestra:
  - Nombre y nivel/grado
  - # total de estudiantes
  - Progreso promedio (%)
  - # de módulos asignados
  - Acceso rápido a dashboard del aula (US-ANA-001)
  - Acceso a lista de estudiantes (US-ADM-002)

### CA-02: Resumen Global
- [ ] Cards con métricas totales:
  - Total de aulas
  - Total de estudiantes (suma de todas las aulas)
  - Promedio general de progreso
- [ ] Destacar aula con mejor/peor progreso

### CA-03: Actividad Reciente Global
- [ ] Feed de las últimas 10 actividades de TODAS las aulas
- [ ] Cada actividad muestra: estudiante, aula, actividad, timestamp
- [ ] Link rápido a perfil del estudiante

### CA-04: Acciones Rápidas
- [ ] Botón "Crear Nueva Aula" (US-ADM-001)
- [ ] Selector de aula en header (dropdown para cambiar de contexto)

### CA-05: Navegación
- [ ] Breadcrumb: Dashboard
- [ ] Sidebar con:
  - Dashboard (esta vista)
  - Mis Aulas (lista completa)
  - Configuración (placeholder)

---

## Especificaciones Técnicas

### Backend

**Endpoint Principal:**
```
GET /api/teacher/dashboard
```

**Response:**
```json
{
  "summary": {
    "totalClassrooms": 3,
    "totalStudents": 75,
    "averageProgress": 62.5
  },
  "classrooms": [
    {
      "id": "uuid",
      "name": "Matemáticas 6A",
      "level": "primaria",
      "grade": 6,
      "studentCount": 25,
      "averageProgress": 65.5,
      "moduleCount": 5,
      "lastActivity": "2025-11-02T10:00:00Z"
    }
  ],
  "recentActivities": [
    {
      "id": "activity-uuid",
      "studentName": "Juan Pérez",
      "classroomName": "Matemáticas 6A",
      "activityName": "Suma de fracciones",
      "timestamp": "2025-11-02T10:30:00Z"
    }
  ],
  "insights": {
    "bestPerformingClassroom": {
      "id": "uuid",
      "name": "Matemáticas 6A",
      "progress": 75.5
    },
    "needsAttentionClassroom": {
      "id": "uuid",
      "name": "Ciencias 5B",
      "progress": 45.2
    }
  }
}
```

**Controller:**
```typescript
@Get('teacher/dashboard')
async getTeacherDashboard(@CurrentUser() teacher: User) {
  return this.teacherService.getDashboard(teacher.id);
}
```

**Service:**
```typescript
async getDashboard(teacherId: string) {
  const classrooms = await this.getClassroomsSummary(teacherId);
  const recentActivities = await this.getRecentActivitiesAcrossClassrooms(teacherId, 10);

  const summary = {
    totalClassrooms: classrooms.length,
    totalStudents: classrooms.reduce((sum, c) => sum + c.studentCount, 0),
    averageProgress: classrooms.length > 0
      ? classrooms.reduce((sum, c) => sum + c.averageProgress, 0) / classrooms.length
      : 0
  };

  const sortedByProgress = [...classrooms].sort((a, b) => b.averageProgress - a.averageProgress);

  return {
    summary,
    classrooms,
    recentActivities,
    insights: {
      bestPerformingClassroom: sortedByProgress[0] || null,
      needsAttentionClassroom: sortedByProgress[sortedByProgress.length - 1] || null
    }
  };
}
```

### Frontend

**Ruta:**
```
/teacher/dashboard
```

**Componente Principal:**
```typescript
// TeacherDashboard.tsx
export const TeacherDashboard = () => {
  const { dashboardData, isLoading } = useTeacherDashboard();
  const navigate = useNavigate();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="teacher-dashboard">
      <PageHeader
        title="Dashboard"
        subtitle={`Bienvenido, ${dashboardData.teacherName}`}
        action={
          <Button
            onClick={() => navigate('/teacher/classrooms/new')}
            leftIcon={<PlusIcon />}
          >
            Crear Aula
          </Button>
        }
      />

      <SummaryCards summary={dashboardData.summary} />

      <InsightsSection insights={dashboardData.insights} />

      <ClassroomGrid
        classrooms={dashboardData.classrooms}
        onViewClassroom={(id) => navigate(`/teacher/classroom/${id}/dashboard`)}
      />

      <RecentActivityFeed activities={dashboardData.recentActivities} />
    </div>
  );
};
```

**Componente de Cards de Resumen:**
```typescript
// SummaryCards.tsx
export const SummaryCards = ({ summary }) => {
  return (
    <div className="summary-cards">
      <SummaryCard
        icon={<ClassroomIcon />}
        label="Aulas"
        value={summary.totalClassrooms}
      />
      <SummaryCard
        icon={<UsersIcon />}
        label="Estudiantes"
        value={summary.totalStudents}
      />
      <SummaryCard
        icon={<ProgressIcon />}
        label="Progreso Promedio"
        value={`${summary.averageProgress.toFixed(1)}%`}
      />
    </div>
  );
};
```

**Componente de Insights:**
```typescript
// InsightsSection.tsx
export const InsightsSection = ({ insights }) => {
  if (!insights.bestPerformingClassroom) return null;

  return (
    <div className="insights-section">
      <InsightCard
        type="success"
        icon={<TrophyIcon />}
        title="Mejor Desempeño"
        classroom={insights.bestPerformingClassroom}
      />
      {insights.needsAttentionClassroom && (
        <InsightCard
          type="warning"
          icon={<AlertIcon />}
          title="Requiere Atención"
          classroom={insights.needsAttentionClassroom}
        />
      )}
    </div>
  );
};
```

**Componente de Grid de Aulas:**
```typescript
// ClassroomGrid.tsx
export const ClassroomGrid = ({ classrooms, onViewClassroom }) => {
  if (classrooms.length === 0) {
    return (
      <EmptyState
        icon={<ClassroomIcon />}
        title="No tienes aulas creadas"
        description="Crea tu primera aula para comenzar"
      />
    );
  }

  return (
    <div className="classroom-grid">
      {classrooms.map(classroom => (
        <ClassroomDashboardCard
          key={classroom.id}
          classroom={classroom}
          onClick={() => onViewClassroom(classroom.id)}
        />
      ))}
    </div>
  );
};

const ClassroomDashboardCard = ({ classroom, onClick }) => {
  return (
    <Card className="classroom-dashboard-card" onClick={onClick}>
      <CardHeader>
        <h3>{classroom.name}</h3>
        <Badge>{getLevelLabel(classroom.level)} {classroom.grade}°</Badge>
      </CardHeader>
      <CardBody>
        <div className="stats">
          <Stat
            icon={<UsersIcon />}
            label="Estudiantes"
            value={classroom.studentCount}
          />
          <Stat
            icon={<ProgressIcon />}
            label="Progreso"
            value={`${classroom.averageProgress.toFixed(1)}%`}
          />
          <Stat
            icon={<ModulesIcon />}
            label="Módulos"
            value={classroom.moduleCount}
          />
        </div>
        <ProgressBar percentage={classroom.averageProgress} />
      </CardBody>
      <CardFooter>
        <Button variant="primary" size="sm" fullWidth>
          Ver Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};
```

---

## Diseño UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  Dashboard                                      [+ Crear Aula]   |
|  Bienvenido, Prof. García                                        |
+-------------------------------------------------------------------+
|  [3 Aulas]       [75 Estudiantes]       [62.5% Progreso]        |
+-------------------------------------------------------------------+
|  🏆 Mejor Desempeño: Matemáticas 6A (75.5%)                      |
|  ⚠️ Requiere Atención: Ciencias 5B (45.2%)                       |
+-------------------------------------------------------------------+
|  MIS AULAS                                                        |
|  +------------------+  +------------------+  +------------------+ |
|  | Matemáticas 6A   |  | Español 5B       |  | Ciencias 6A      | |
|  | Primaria - 6°    |  | Primaria - 5°    |  | Primaria - 6°    | |
|  | 👥 25 | 📊 65.5% |  | 👥 30 | 📊 58%   |  | 👥 20 | 📊 64%   | |
|  | [████████░] 65%  |  | [███████░░] 58%  |  | [████████░] 64%  | |
|  | [Ver Dashboard]  |  | [Ver Dashboard]  |  | [Ver Dashboard]  | |
|  +------------------+  +------------------+  +------------------+ |
+-------------------------------------------------------------------+
|  ACTIVIDAD RECIENTE                                              |
|  • Juan Pérez (Mat 6A) completó "Suma de fracciones" - 5 min    |
|  • Ana López (Esp 5B) completó "Comprensión lectora" - 10 min   |
+-------------------------------------------------------------------+
```

---

## Alcance US-PM-000 vs Extensiones Avanzadas

### US-PM-000 (Este alcance - Dashboard Maestro Base):
- ✅ Dashboard simple con resumen de aulas
- ✅ Métricas básicas (# estudiantes, progreso promedio)
- ✅ Grid de aulas con stats básicas
- ✅ Actividad reciente (últimas 10)
- ✅ Insights simples (mejor/peor aula)

### Otras US de EXT-001 (Analytics y Reportería Avanzada):
- ✅ Gráficas de tendencia de progreso (US-PM-004a)
- ✅ Comparativas entre aulas (US-PM-005a)
- ✅ Métricas de engagement (US-PM-005c)
- ✅ Dashboard personalizable (US-PM-004a)
- ✅ Filtros por fecha (US-PM-005a)
- ✅ Exportación de reportes (US-PM-005b)

---

## Dependencias

### Dependencias de User Stories:
- US-ADM-001 (aulas)
- US-ANA-001 (para navegación a dashboard de aula)

---

## Estimación de Esfuerzo

**Backend:** 3 SP
**Frontend:** 4 SP
**Testing:** 1 SP

**Total:** 8 SP = $3,200 MXN
