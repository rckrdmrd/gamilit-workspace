---
id: "US-ANA-006"
title: "Identificación de Estudiantes Rezagados"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-004"
story_points: 8
budget: "$4,200 MXN"
sprint: "Sprint-1"
labels: ["analytics", "at-risk", "intervention"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-ANA-006: Identificación de Estudiantes Rezagados

**Épica:** EAI-004 (Analytics Básico)
**Sprint:** Mes 1, Semana 3
**Story Points:** 8 SP
**Presupuesto:** $4,200 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como profesor, quiero identificar fácilmente qué estudiantes están rezagados o en riesgo para poder intervenir a tiempo y brindarles apoyo adicional.

**Contexto del Alcance Inicial:**

Esta funcionalidad proporciona una vista dedicada de estudiantes que requieren atención, basada en reglas simples (inactividad, bajo progreso). Usa indicadores visuales de semáforo (rojo/amarillo/verde). NO incluye análisis predictivo con ML, alertas automáticas configurables, ni recomendaciones de intervención (eso va a EXT-005 Reportes Avanzados).

---

## Criterios de Aceptación

### CA-01: Definición de Estados de Riesgo
- [ ] **Rojo (Crítico):** estudiante sin actividad en >7 días O progreso <30%
- [ ] **Amarillo (Advertencia):** estudiante sin actividad en 3-7 días O progreso 30-50%
- [ ] **Verde (Activo):** estudiante activo en últimos 3 días Y progreso >50%

### CA-02: Vista de Estudiantes en Riesgo
- [ ] Lista filtrable de estudiantes con estado de riesgo
- [ ] Filtro rápido: "Solo críticos", "Solo advertencias", "Todos"
- [ ] Para cada estudiante muestra:
  - Avatar y nombre
  - Estado de riesgo (badge rojo/amarillo/verde)
  - Días sin actividad
  - % de progreso
  - Último módulo accedido
  - Botón de acción rápida

### CA-03: Indicadores de Riesgo
- [ ] Contador de estudiantes en estado crítico (rojo)
- [ ] Contador de estudiantes en advertencia (amarillo)
- [ ] Contador de estudiantes activos (verde)
- [ ] % de la clase en cada categoría

### CA-04: Detalles de Riesgo
- [ ] Al hacer clic en estudiante, muestra panel con:
  - Última actividad (nombre y fecha)
  - Módulos sin iniciar
  - Módulos iniciados pero no completados
  - Comparativa con promedio de la clase
- [ ] Botón para ir a perfil completo del estudiante (US-ANA-003)

### CA-05: Ordenamiento
- [ ] Ordenar por: estado de riesgo (default), días sin actividad, progreso
- [ ] Los estudiantes en riesgo crítico siempre aparecen primero

### CA-06: Acciones Rápidas (UI Placeholder)
- [ ] Botón "Enviar Mensaje" (placeholder - funcionalidad en EXT-001)
- [ ] Botón "Asignar Actividad" (placeholder - funcionalidad en EXT-001)
- [ ] Tooltip indicando que estarán disponibles en extensión futura

---

## Especificaciones Técnicas

### Backend

**Endpoint Principal:**
```
GET /api/teacher/classroom/{classroomId}/at-risk-students
Query params: ?filter=critical|warning|all
```

**Response:**
```json
{
  "classroomId": "uuid",
  "summary": {
    "critical": 5,
    "warning": 8,
    "active": 12,
    "total": 25,
    "percentages": {
      "critical": 20,
      "warning": 32,
      "active": 48
    }
  },
  "students": [
    {
      "id": "student-uuid",
      "name": "Juan Pérez",
      "avatarUrl": "/avatars/student.png",
      "riskLevel": "critical",
      "riskFactors": {
        "daysInactive": 10,
        "progressPercentage": 25,
        "modulesNotStarted": 5,
        "modulesIncomplete": 2
      },
      "lastActivity": {
        "name": "Suma de fracciones",
        "moduleName": "Fracciones",
        "timestamp": "2025-10-23T14:30:00Z"
      },
      "comparison": {
        "progressDiffFromAverage": -40.5
      }
    },
    {
      "id": "student-uuid-2",
      "name": "María García",
      "avatarUrl": "/avatars/student2.png",
      "riskLevel": "warning",
      "riskFactors": {
        "daysInactive": 4,
        "progressPercentage": 45,
        "modulesNotStarted": 2,
        "modulesIncomplete": 3
      },
      "lastActivity": {
        "name": "Ángulos rectos",
        "moduleName": "Geometría",
        "timestamp": "2025-10-29T16:45:00Z"
      },
      "comparison": {
        "progressDiffFromAverage": -20.5
      }
    }
  ]
}
```

**Controller:**
```typescript
// TeacherAnalyticsController.ts
@Get('classroom/:classroomId/at-risk-students')
async getAtRiskStudents(
  @Param('classroomId') classroomId: string,
  @Query('filter') filter: string = 'all',
  @CurrentUser() teacher: User
) {
  return this.analyticsService.getAtRiskStudents(
    classroomId,
    teacher.id,
    filter
  );
}
```

**Service:**
```typescript
// TeacherAnalyticsService.ts
async getAtRiskStudents(
  classroomId: string,
  teacherId: string,
  filter: string
) {
  // Validar acceso
  await this.validateTeacherAccess(classroomId, teacherId);

  // Obtener todos los estudiantes de la clase
  const students = await this.classroomService.getStudents(classroomId);

  // Calcular progreso promedio de la clase
  const classAverage = await this.calculateClassAverageProgress(classroomId);

  // Analizar cada estudiante
  const analyzedStudents = await Promise.all(
    students.map(async (student) => {
      return await this.analyzeStudentRisk(student, classroomId, classAverage);
    })
  );

  // Aplicar filtro
  let filteredStudents = analyzedStudents;
  if (filter === 'critical') {
    filteredStudents = analyzedStudents.filter(s => s.riskLevel === 'critical');
  } else if (filter === 'warning') {
    filteredStudents = analyzedStudents.filter(s => s.riskLevel === 'warning');
  }

  // Ordenar: críticos primero, luego por días inactivos
  filteredStudents.sort((a, b) => {
    const riskOrder = { critical: 0, warning: 1, active: 2 };
    if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    return b.riskFactors.daysInactive - a.riskFactors.daysInactive;
  });

  // Calcular resumen
  const summary = this.calculateRiskSummary(analyzedStudents);

  return {
    classroomId,
    summary,
    students: filteredStudents
  };
}

private async analyzeStudentRisk(
  student: Student,
  classroomId: string,
  classAverage: number
) {
  // Calcular días sin actividad
  const lastActivityDate = await this.getStudentLastActivityDate(student.id);
  const daysInactive = lastActivityDate
    ? differenceInDays(new Date(), new Date(lastActivityDate))
    : 999;

  // Calcular progreso
  const progress = await this.getStudentProgress(student.id, classroomId);

  // Determinar nivel de riesgo según reglas
  const riskLevel = this.calculateRiskLevel(daysInactive, progress.percentage);

  // Obtener última actividad
  const lastActivity = await this.getStudentLastActivity(student.id);

  // Contar módulos
  const modulesNotStarted = await this.countModulesNotStarted(
    student.id,
    classroomId
  );
  const modulesIncomplete = await this.countModulesIncomplete(
    student.id,
    classroomId
  );

  return {
    id: student.id,
    name: student.name,
    avatarUrl: student.avatarUrl,
    riskLevel,
    riskFactors: {
      daysInactive,
      progressPercentage: progress.percentage,
      modulesNotStarted,
      modulesIncomplete
    },
    lastActivity,
    comparison: {
      progressDiffFromAverage: progress.percentage - classAverage
    }
  };
}

private calculateRiskLevel(daysInactive: number, progress: number): string {
  // Crítico: >7 días sin actividad O progreso <30%
  if (daysInactive > 7 || progress < 30) {
    return 'critical';
  }

  // Advertencia: 3-7 días sin actividad O progreso 30-50%
  if ((daysInactive >= 3 && daysInactive <= 7) || (progress >= 30 && progress <= 50)) {
    return 'warning';
  }

  // Activo
  return 'active';
}

private calculateRiskSummary(students) {
  const critical = students.filter(s => s.riskLevel === 'critical').length;
  const warning = students.filter(s => s.riskLevel === 'warning').length;
  const active = students.filter(s => s.riskLevel === 'active').length;
  const total = students.length;

  return {
    critical,
    warning,
    active,
    total,
    percentages: {
      critical: total > 0 ? Math.round((critical / total) * 100) : 0,
      warning: total > 0 ? Math.round((warning / total) * 100) : 0,
      active: total > 0 ? Math.round((active / total) * 100) : 0
    }
  };
}
```

### Frontend

**Ruta:**
```
/teacher/classroom/:classroomId/at-risk
```

**Componente Principal:**
```typescript
// AtRiskStudentsView.tsx
export const AtRiskStudentsView = () => {
  const { classroomId } = useParams();
  const [filter, setFilter] = useState('all');
  const { data, isLoading, refetch } = useAtRiskStudents(classroomId, filter);
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (isLoading) return <AtRiskSkeleton />;

  return (
    <div className="at-risk-container">
      <RiskSummary summary={data.summary} />

      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
        summary={data.summary}
      />

      <StudentsAtRiskList
        students={data.students}
        onStudentClick={setSelectedStudent}
      />

      {selectedStudent && (
        <StudentRiskDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};
```

**Componente de Resumen:**
```typescript
// RiskSummary.tsx
export const RiskSummary = ({ summary }) => {
  return (
    <div className="risk-summary">
      <h1>Estudiantes en Riesgo</h1>

      <div className="summary-cards">
        <RiskCard
          label="Críticos"
          count={summary.critical}
          percentage={summary.percentages.critical}
          color="red"
          icon={<AlertIcon />}
        />
        <RiskCard
          label="Advertencias"
          count={summary.warning}
          percentage={summary.percentages.warning}
          color="yellow"
          icon={<WarningIcon />}
        />
        <RiskCard
          label="Activos"
          count={summary.active}
          percentage={summary.percentages.active}
          color="green"
          icon={<CheckIcon />}
        />
      </div>

      {summary.critical > 0 && (
        <Alert severity="error">
          {summary.critical} estudiante{summary.critical > 1 ? 's' : ''} en
          estado crítico. Requieren atención inmediata.
        </Alert>
      )}
    </div>
  );
};
```

**Componente de Filtros:**
```typescript
// FilterBar.tsx
export const FilterBar = ({ filter, onFilterChange, summary }) => {
  return (
    <div className="filter-bar">
      <ButtonGroup>
        <FilterButton
          active={filter === 'all'}
          onClick={() => onFilterChange('all')}
          count={summary.total}
        >
          Todos
        </FilterButton>
        <FilterButton
          active={filter === 'critical'}
          onClick={() => onFilterChange('critical')}
          count={summary.critical}
          color="red"
        >
          Solo Críticos
        </FilterButton>
        <FilterButton
          active={filter === 'warning'}
          onClick={() => onFilterChange('warning')}
          count={summary.warning}
          color="yellow"
        >
          Solo Advertencias
        </FilterButton>
      </ButtonGroup>

      <Select
        label="Ordenar por"
        options={[
          { value: 'risk', label: 'Estado de riesgo' },
          { value: 'inactive', label: 'Días sin actividad' },
          { value: 'progress', label: 'Progreso' }
        ]}
      />
    </div>
  );
};
```

**Componente de Lista:**
```typescript
// StudentsAtRiskList.tsx
export const StudentsAtRiskList = ({ students, onStudentClick }) => {
  if (students.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircleIcon />}
        message="¡Excelente! No hay estudiantes en riesgo en este momento."
      />
    );
  }

  return (
    <div className="students-at-risk-list">
      {students.map(student => (
        <StudentRiskCard
          key={student.id}
          student={student}
          onClick={() => onStudentClick(student)}
        />
      ))}
    </div>
  );
};
```

**Componente de Card:**
```typescript
// StudentRiskCard.tsx
export const StudentRiskCard = ({ student, onClick }) => {
  const riskConfig = {
    critical: {
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      label: 'Crítico'
    },
    warning: {
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      label: 'Advertencia'
    },
    active: {
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      label: 'Activo'
    }
  }[student.riskLevel];

  return (
    <div
      className={`student-risk-card ${riskConfig.bgColor} ${riskConfig.borderColor}`}
      onClick={onClick}
    >
      <div className="card-header">
        <Avatar src={student.avatarUrl} size="md" />
        <div>
          <h3>{student.name}</h3>
          <Badge color={riskConfig.color}>{riskConfig.label}</Badge>
        </div>
      </div>

      <div className="risk-factors">
        <RiskFactor
          icon={<ClockIcon />}
          label="Última actividad"
          value={`Hace ${student.riskFactors.daysInactive} día${student.riskFactors.daysInactive > 1 ? 's' : ''}`}
          critical={student.riskFactors.daysInactive > 7}
        />
        <RiskFactor
          icon={<ProgressIcon />}
          label="Progreso"
          value={`${student.riskFactors.progressPercentage}%`}
          critical={student.riskFactors.progressPercentage < 30}
        />
        <RiskFactor
          icon={<ModuleIcon />}
          label="Módulos pendientes"
          value={`${student.riskFactors.modulesNotStarted} sin iniciar, ${student.riskFactors.modulesIncomplete} incompletos`}
        />
      </div>

      {student.comparison.progressDiffFromAverage < 0 && (
        <div className="comparison">
          <TrendDownIcon />
          {Math.abs(student.comparison.progressDiffFromAverage).toFixed(1)}%
          por debajo del promedio
        </div>
      )}

      <div className="quick-actions">
        <Button
          size="sm"
          variant="outline"
          disabled
          title="Disponible en extensión futura"
        >
          Enviar Mensaje
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled
          title="Disponible en extensión futura"
        >
          Asignar Actividad
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/teacher/student/${student.id}?classroomId=${classroomId}`;
          }}
        >
          Ver Perfil
        </Button>
      </div>
    </div>
  );
};
```

**Modal de Detalle:**
```typescript
// StudentRiskDetailModal.tsx
export const StudentRiskDetailModal = ({ student, onClose }) => {
  return (
    <Modal isOpen onClose={onClose} size="lg">
      <ModalHeader>
        <Avatar src={student.avatarUrl} size="lg" />
        <h2>{student.name}</h2>
        <Badge color={getRiskColor(student.riskLevel)}>
          {getRiskLabel(student.riskLevel)}
        </Badge>
      </ModalHeader>

      <ModalBody>
        <Section title="Factores de Riesgo">
          <MetricItem
            label="Días sin actividad"
            value={student.riskFactors.daysInactive}
            threshold={7}
          />
          <MetricItem
            label="Progreso general"
            value={`${student.riskFactors.progressPercentage}%`}
            threshold={30}
          />
        </Section>

        <Section title="Última Actividad">
          {student.lastActivity ? (
            <>
              <p><strong>{student.lastActivity.name}</strong></p>
              <p className="text-sm text-gray-600">
                {student.lastActivity.moduleName} •{' '}
                {formatRelativeTime(student.lastActivity.timestamp)}
              </p>
            </>
          ) : (
            <p className="text-gray-500">Sin actividad registrada</p>
          )}
        </Section>

        <Section title="Módulos Pendientes">
          <p>{student.riskFactors.modulesNotStarted} módulo(s) sin iniciar</p>
          <p>{student.riskFactors.modulesIncomplete} módulo(s) incompleto(s)</p>
        </Section>

        <Section title="Comparación con la Clase">
          <ComparisonBar
            studentProgress={student.riskFactors.progressPercentage}
            classAverage={student.riskFactors.progressPercentage - student.comparison.progressDiffFromAverage}
          />
        </Section>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            window.location.href = `/teacher/student/${student.id}`;
          }}
        >
          Ver Perfil Completo
        </Button>
      </ModalFooter>
    </Modal>
  );
};
```

---

## Diseño UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  Estudiantes en Riesgo                                            |
+-------------------------------------------------------------------+
|  [🚨 5 Críticos]    [⚠️ 8 Advertencias]    [✅ 12 Activos]      |
|  (20% de la clase)   (32% de la clase)      (48% de la clase)    |
+-------------------------------------------------------------------+
|  [Todos] [Solo Críticos 5] [Solo Advertencias 8]  [Ordenar ▼]   |
+-------------------------------------------------------------------+
|  +---------------------------------------------------------------+ |
|  | 🚨 [👤] Juan Pérez                        [Crítico]          | |
|  | ⏰ Hace 10 días | 📊 25% | 📚 5 sin iniciar, 2 incompletos  | |
|  | 📉 40.5% por debajo del promedio                            | |
|  | [Enviar Mensaje] [Asignar Actividad] [Ver Perfil]          | |
|  +---------------------------------------------------------------+ |
|  | ⚠️ [👤] María García                   [Advertencia]        | |
|  | ⏰ Hace 4 días | 📊 45% | 📚 2 sin iniciar, 3 incompletos   | |
|  | 📉 20.5% por debajo del promedio                            | |
|  | [Enviar Mensaje] [Asignar Actividad] [Ver Perfil]          | |
|  +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```

---

## Alcance Básico vs Extensiones

### EAI-004 (Este alcance - Analytics Básico):
- Identificación automática con reglas simples (días inactivos, % progreso)
- 3 niveles de riesgo: crítico, advertencia, activo
- Vista dedicada con filtros básicos
- Indicadores visuales de semáforo
- Comparación con promedio de clase
- Acciones rápidas como placeholder (UI disabled)

### EXT-005 (Extensión futura - Reportes Avanzados):
- Análisis predictivo con ML (probabilidad de abandono)
- Alertas automáticas configurables por email
- Reglas de riesgo personalizables por profesor
- Recomendaciones de intervención basadas en datos
- Historial de riesgo (cómo ha cambiado el nivel)
- Exportación de lista de riesgo
- Integración con sistema de mensajería (EXT-001)
- Asignación rápida de actividades de refuerzo
- Dashboard de intervenciones realizadas

---

## Dependencias

### Dependencias Técnicas:
- **Backend:** Sistema de tracking de última actividad
- **Backend:** Cálculo de progreso por estudiante
- **Frontend:** Modal component
- **Frontend:** Alert/Badge components

### Dependencias de User Stories:
- US-ANA-002 (para datos de estudiantes)
- US-ANA-003 (para navegación a perfil)

---

## Pruebas

### Pruebas Unitarias:
- [ ] `calculateRiskLevel` retorna nivel correcto según reglas
- [ ] `calculateRiskSummary` cuenta correctamente
- [ ] Ordenamiento coloca críticos primero
- [ ] Filtros funcionan correctamente

### Pruebas de Integración:
- [ ] Endpoint retorna estudiantes con nivel de riesgo correcto
- [ ] Filtro crítico/advertencia funciona
- [ ] Comparación con promedio se calcula correctamente

### Pruebas E2E:
- [ ] Profesor ve estudiantes en riesgo correctamente categorizados
- [ ] Filtros cambian la lista mostrada
- [ ] Clic en estudiante muestra modal de detalle
- [ ] Botón "Ver Perfil" navega correctamente
- [ ] Botones disabled muestran tooltip

---

## Notas de Implementación

1. **Reglas de Riesgo:**
   - Hardcodeadas en alcance inicial (7 días, 30%, 50%)
   - Configurables en EXT-005

2. **Performance:**
   - Cachear análisis de riesgo por 5 minutos
   - Query optimizado con joins
   - Calcular en background para clases grandes

3. **UX:**
   - Críticos siempre visibles primero
   - Alertas visuales prominentes
   - Tooltips explicando por qué están disabled los botones

4. **Futuro:**
   - Sistema de alertas en EXT-005
   - Integración con mensajería en EXT-001

---

## Estimación de Esfuerzo

**Backend:** 3 SP
- Lógica de cálculo de riesgo
- Endpoint con análisis

**Frontend:** 4 SP
- Vista de estudiantes en riesgo
- Cards con indicadores
- Modal de detalle
- Filtros

**Testing:** 1 SP

**Total:** 8 SP = $4,200 MXN
