# ET-ADM-003: Implementacion de Dashboard de Maestro

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ADM-003 |
| **Modulo** | Admin Base |
| **Titulo** | Implementacion de Dashboard de Maestro |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-20 |
| **Ultima Actualizacion** | 2026-01-20 |
| **Autor** | Documentation Analyst |

---

## Referencias

### Requerimiento Funcional
- [RF-ADM-003: Dashboard de Maestro](../requirements/RF-ADM-003-dashboard-maestro.md)

### User Stories
- [US-ADM-003: Dashboard de Maestro](../user-stories/US-ADM-003/US-ADM-003-dashboard-maestro.md)
- [US-ADM-007: Vista de Actividad de Aula](../user-stories/US-ADM-007/US-ADM-007-vista-actividad-aula.md)

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - TeacherDashboard                                       |
|  - SummaryCards                                           |
|  - InsightsSection                                        |
|  - ClassroomGrid                                          |
|  - ClassroomActivityView                                  |
|  - ActiveStudentsCard                                     |
|  - ModulesInProgressCard                                  |
|  - RecentActivitiesCard                                   |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - TeacherDashboardController                            |
|  - TeacherService                                        |
|  - ClassroomActivityService                              |
+-----------------------------+----------------------------+
                              | SQL Queries
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - social_features.classrooms                            |
|  - progress_tracking.activity_logs                       |
|  - progress_tracking.student_progress                    |
+----------------------------------------------------------+
```

### Flujo de Dashboard General

```
Profesor accede a /teacher/dashboard
        |
        v
GET /api/teacher/dashboard
        |
        v
+----------------------------------------+
| TeacherService.getDashboard(teacherId) |
| - getClassroomsSummary()               |
| - getRecentActivitiesAcrossClassrooms()|
| - calculateInsights()                  |
+----------------------------------------+
        |
        v
Response con summary, classrooms, activities, insights
        |
        v
Frontend renderiza:
- SummaryCards (totales)
- InsightsSection (mejor/peor aula)
- ClassroomGrid (cards de aulas)
- RecentActivityFeed (ultimas actividades)
```

### Flujo de Actividad del Aula

```
Profesor accede a /teacher/classroom/:id/activity
        |
        v
GET /api/teacher/classrooms/:id/activity-summary
        |
        v
+--------------------------------------------------+
| ClassroomActivityService.getActivitySummary()    |
| - getActiveStudentsToday(classroomId, today)     |
| - getModulesInProgress(classroomId, since7days)  |
| - getRecentActivities(classroomId, limit=10)     |
+--------------------------------------------------+
        |
        v
Response con activeStudentsToday, modulesInProgress, recentActivities
        |
        v
Frontend renderiza con auto-refresh cada 2 minutos
```

---

## Implementacion Backend (NestJS)

### Controller: Dashboard General

**Ubicacion:** `apps/backend/src/teacher/controllers/teacher-dashboard.controller.ts`

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { TeacherGuard } from '../../auth/guards/teacher.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { TeacherService } from '../services/teacher.service';

@Controller('teacher')
@UseGuards(AuthGuard, TeacherGuard)
export class TeacherDashboardController {
  constructor(private teacherService: TeacherService) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser() teacher: User) {
    return this.teacherService.getDashboard(teacher.id);
  }
}
```

### Controller: Actividad del Aula

**Ubicacion:** `apps/backend/src/teacher/controllers/teacher-classroom.controller.ts` (extendido)

```typescript
@Get(':classroomId/activity-summary')
async getActivitySummary(
  @Param('classroomId') classroomId: string,
  @CurrentUser() teacher: User
) {
  return this.classroomActivityService.getActivitySummary(classroomId, teacher.id);
}
```

### Service: Dashboard General

**Ubicacion:** `apps/backend/src/teacher/services/teacher.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classroom } from '../entities/classroom.entity';
import { ActivityLog } from '../../progress-tracking/entities/activity-log.entity';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Classroom)
    private classroomRepository: Repository<Classroom>,
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>
  ) {}

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
        needsAttentionClassroom: sortedByProgress.length > 1
          ? sortedByProgress[sortedByProgress.length - 1]
          : null
      }
    };
  }

  private async getClassroomsSummary(teacherId: string) {
    const classrooms = await this.classroomRepository
      .createQueryBuilder('classroom')
      .leftJoin('classroom.students', 'students')
      .leftJoin('classroom.modules', 'modules')
      .select([
        'classroom.id',
        'classroom.name',
        'classroom.level',
        'classroom.grade',
        'classroom.createdAt'
      ])
      .addSelect('COUNT(DISTINCT students.id)', 'studentCount')
      .addSelect('COUNT(DISTINCT modules.id)', 'moduleCount')
      .where('classroom.teacherId = :teacherId', { teacherId })
      .groupBy('classroom.id')
      .orderBy('classroom.createdAt', 'DESC')
      .getRawAndEntities();

    // Obtener progreso promedio por aula
    const classroomsWithProgress = await Promise.all(
      classrooms.entities.map(async (classroom, index) => {
        const avgProgress = await this.getClassroomAverageProgress(classroom.id);
        const lastActivity = await this.getLastActivityInClassroom(classroom.id);

        return {
          id: classroom.id,
          name: classroom.name,
          level: classroom.level,
          grade: classroom.grade,
          studentCount: parseInt(classrooms.raw[index].studentCount),
          moduleCount: parseInt(classrooms.raw[index].moduleCount),
          averageProgress: avgProgress,
          lastActivity: lastActivity?.timestamp || null
        };
      })
    );

    return classroomsWithProgress;
  }

  private async getRecentActivitiesAcrossClassrooms(teacherId: string, limit: number) {
    const activities = await this.activityLogRepository
      .createQueryBuilder('log')
      .innerJoin('log.classroom', 'classroom')
      .innerJoinAndSelect('log.student', 'student')
      .innerJoinAndSelect('log.activity', 'activity')
      .where('classroom.teacherId = :teacherId', { teacherId })
      .andWhere('log.type = :type', { type: 'activity_completed' })
      .orderBy('log.timestamp', 'DESC')
      .limit(limit)
      .getMany();

    return activities.map(log => ({
      id: log.id,
      studentName: log.student.name,
      classroomName: log.classroom?.name,
      activityName: log.activity?.name,
      timestamp: log.timestamp
    }));
  }

  private async getClassroomAverageProgress(classroomId: string): Promise<number> {
    const result = await this.classroomRepository
      .createQueryBuilder('classroom')
      .innerJoin('classroom.students', 'student')
      .innerJoin('progress_tracking.student_progress', 'progress', 'progress.studentId = student.id')
      .where('classroom.id = :classroomId', { classroomId })
      .select('AVG(progress.percentage)', 'avgProgress')
      .getRawOne();

    return result?.avgProgress ? parseFloat(result.avgProgress) : 0;
  }

  private async getLastActivityInClassroom(classroomId: string) {
    return this.activityLogRepository.findOne({
      where: { classroomId },
      order: { timestamp: 'DESC' }
    });
  }
}
```

### Service: Actividad del Aula

**Ubicacion:** `apps/backend/src/teacher/services/classroom-activity.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { startOfDay, subDays } from 'date-fns';
import { ActivityLog } from '../../progress-tracking/entities/activity-log.entity';
import { ClassroomService } from './classroom.service';

@Injectable()
export class ClassroomActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
    private classroomService: ClassroomService
  ) {}

  async getActivitySummary(classroomId: string, teacherId: string) {
    await this.classroomService.validateTeacherAccess(classroomId, teacherId);

    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(new Date(), 7);

    const [activeStudentsToday, modulesInProgress, recentActivities] = await Promise.all([
      this.getActiveStudentsToday(classroomId, today),
      this.getModulesInProgress(classroomId, sevenDaysAgo),
      this.getRecentActivities(classroomId, 10)
    ]);

    return {
      classroomId,
      timestamp: new Date().toISOString(),
      activeStudentsToday,
      modulesInProgress,
      recentActivities
    };
  }

  private async getActiveStudentsToday(classroomId: string, today: Date) {
    const activeStudents = await this.activityLogRepository
      .createQueryBuilder('log')
      .innerJoinAndSelect('log.student', 'student')
      .where('log.classroomId = :classroomId', { classroomId })
      .andWhere('log.timestamp >= :today', { today })
      .andWhere('log.type = :type', { type: 'activity_completed' })
      .groupBy('student.id')
      .select(['student.id', 'student.name', 'student.avatarUrl'])
      .getMany();

    const totalStudents = await this.classroomService.getStudentCount(classroomId);

    return {
      count: activeStudents.length,
      total: totalStudents,
      percentage: totalStudents > 0
        ? Math.round((activeStudents.length / totalStudents) * 100)
        : 0,
      students: activeStudents.map(log => ({
        id: log.student.id,
        name: log.student.name,
        avatarUrl: log.student.avatarUrl
      }))
    };
  }

  private async getModulesInProgress(classroomId: string, since: Date) {
    const modulesData = await this.activityLogRepository
      .createQueryBuilder('log')
      .innerJoin('log.module', 'module')
      .where('log.classroomId = :classroomId', { classroomId })
      .andWhere('log.timestamp >= :since', { since })
      .groupBy('module.id')
      .select([
        'module.id as moduleId',
        'module.name as moduleName',
        'COUNT(DISTINCT log.studentId) as studentsWorking'
      ])
      .getRawMany();

    const modulesWithProgress = await Promise.all(
      modulesData.map(async (m) => {
        const avgProgress = await this.getModuleAverageProgress(classroomId, m.moduleId);
        return {
          moduleId: m.moduleId,
          moduleName: m.moduleName,
          studentsWorking: parseInt(m.studentsWorking),
          averageProgress: avgProgress
        };
      })
    );

    return modulesWithProgress;
  }

  private async getRecentActivities(classroomId: string, limit: number) {
    const activities = await this.activityLogRepository
      .createQueryBuilder('log')
      .innerJoinAndSelect('log.student', 'student')
      .innerJoinAndSelect('log.activity', 'activity')
      .innerJoinAndSelect('log.module', 'module')
      .where('log.classroomId = :classroomId', { classroomId })
      .andWhere('log.type = :type', { type: 'activity_completed' })
      .orderBy('log.timestamp', 'DESC')
      .limit(limit)
      .getMany();

    return activities.map(log => ({
      id: log.id,
      student: {
        id: log.student.id,
        name: log.student.name,
        avatarUrl: log.student.avatarUrl
      },
      activity: {
        name: log.activity.name,
        moduleName: log.module.name
      },
      completedAt: log.timestamp
    }));
  }

  private async getModuleAverageProgress(classroomId: string, moduleId: string): Promise<number> {
    // Query to get average progress for a module in a classroom
    const result = await this.activityLogRepository
      .query(`
        SELECT AVG(sp.percentage) as avg_progress
        FROM progress_tracking.student_progress sp
        JOIN social_features.classroom_students cs ON cs.student_id = sp.student_id
        WHERE cs.classroom_id = $1 AND sp.module_id = $2
      `, [classroomId, moduleId]);

    return result[0]?.avg_progress ? parseFloat(result[0].avg_progress) : 0;
  }
}
```

---

## Implementacion Frontend (React)

### Rutas

```
/teacher/dashboard                      -> Dashboard general
/teacher/classroom/:classroomId/activity -> Vista de actividad
```

### Componentes Principales

| Componente | Ubicacion | Descripcion |
|------------|-----------|-------------|
| TeacherDashboard | `apps/frontend/src/pages/teacher/TeacherDashboard.tsx` | Dashboard general |
| SummaryCards | `apps/frontend/src/components/teacher/SummaryCards.tsx` | Cards de metricas |
| InsightsSection | `apps/frontend/src/components/teacher/InsightsSection.tsx` | Insights automaticos |
| ClassroomGrid | `apps/frontend/src/components/teacher/ClassroomGrid.tsx` | Grid de aulas |
| ClassroomActivityView | `apps/frontend/src/pages/teacher/classroom/ClassroomActivityView.tsx` | Vista de actividad |
| ActiveStudentsCard | `apps/frontend/src/components/teacher/ActiveStudentsCard.tsx` | Estudiantes activos |
| ModulesInProgressCard | `apps/frontend/src/components/teacher/ModulesInProgressCard.tsx` | Modulos en progreso |
| RecentActivitiesCard | `apps/frontend/src/components/teacher/RecentActivitiesCard.tsx` | Feed de actividades |

### Hook: useTeacherDashboard

**Ubicacion:** `apps/frontend/src/hooks/teacher/useTeacherDashboard.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '../../services/teacher.service';

export const useTeacherDashboard = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher', 'dashboard'],
    queryFn: () => teacherApi.getDashboard(),
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: true
  });

  return {
    dashboardData: data,
    isLoading,
    error,
    refetch
  };
};
```

### Hook: useClassroomActivity

**Ubicacion:** `apps/frontend/src/hooks/teacher/useClassroomActivity.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { teacherApi } from '../../services/teacher.service';

const REFRESH_INTERVAL = 120000; // 2 minutos

export const useClassroomActivity = (classroomId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher', 'classroom', classroomId, 'activity'],
    queryFn: () => teacherApi.getClassroomActivity(classroomId),
    staleTime: REFRESH_INTERVAL,
    refetchOnWindowFocus: true
  });

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [refetch]);

  return {
    activityData: data,
    isLoading,
    error,
    refetch
  };
};
```

### API Service

**Ubicacion:** `apps/frontend/src/services/teacher.service.ts` (extendido)

```typescript
export const teacherApi = {
  async getDashboard() {
    const response = await api.get('/teacher/dashboard');
    return response.data;
  },

  async getClassroomActivity(classroomId: string) {
    const response = await api.get(`/teacher/classrooms/${classroomId}/activity-summary`);
    return response.data;
  }
};
```

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/teacher/dashboard` | Dashboard general del maestro |
| GET | `/api/teacher/classrooms/:id/activity-summary` | Actividad del aula |

### Response: Dashboard General

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
      "name": "Matematicas 6A",
      "level": "primaria",
      "grade": 6,
      "studentCount": 25,
      "moduleCount": 5,
      "averageProgress": 65.5,
      "lastActivity": "2025-11-02T10:00:00Z"
    }
  ],
  "recentActivities": [
    {
      "id": "uuid",
      "studentName": "Juan Perez",
      "classroomName": "Matematicas 6A",
      "activityName": "Suma de fracciones",
      "timestamp": "2025-11-02T10:30:00Z"
    }
  ],
  "insights": {
    "bestPerformingClassroom": {
      "id": "uuid",
      "name": "Matematicas 6A",
      "averageProgress": 75.5
    },
    "needsAttentionClassroom": {
      "id": "uuid",
      "name": "Ciencias 5B",
      "averageProgress": 45.2
    }
  }
}
```

### Response: Actividad del Aula

```json
{
  "classroomId": "uuid",
  "timestamp": "2025-11-02T14:30:00Z",
  "activeStudentsToday": {
    "count": 12,
    "total": 25,
    "percentage": 48,
    "students": [
      {
        "id": "student-uuid",
        "name": "Juan Perez",
        "avatarUrl": "/avatars/student.png"
      }
    ]
  },
  "modulesInProgress": [
    {
      "moduleId": "module-uuid",
      "moduleName": "Fracciones",
      "studentsWorking": 8,
      "averageProgress": 65.5
    }
  ],
  "recentActivities": [
    {
      "id": "activity-uuid",
      "student": {
        "id": "student-uuid",
        "name": "Juan Perez",
        "avatarUrl": "/avatars/student.png"
      },
      "activity": {
        "name": "Suma de fracciones",
        "moduleName": "Fracciones"
      },
      "completedAt": "2025-11-02T14:25:00Z"
    }
  ]
}
```

---

## Consideraciones de Performance

### Caching

1. **Dashboard General:**
   - Cachear por 1 minuto en cliente (staleTime)
   - Considerar cache en backend para metricas agregadas

2. **Actividad del Aula:**
   - Auto-refresh cada 2 minutos
   - No cachear actividades en tiempo real

### Indices de Base de Datos

```sql
-- Indice para queries de actividad por aula y fecha
CREATE INDEX idx_activity_logs_classroom_timestamp
ON progress_tracking.activity_logs(classroom_id, timestamp DESC);

-- Indice para queries de actividad por estudiante
CREATE INDEX idx_activity_logs_student_timestamp
ON progress_tracking.activity_logs(student_id, timestamp DESC);

-- Indice compuesto para modulos en progreso
CREATE INDEX idx_activity_logs_classroom_module_timestamp
ON progress_tracking.activity_logs(classroom_id, module_id, timestamp DESC);
```

### Query Optimization

1. Usar `getRawAndEntities()` para counts agregados
2. Limitar resultados con `LIMIT` en queries de actividad
3. Usar `Promise.all()` para queries paralelas independientes

---

## Testing

### Test Case 1: Dashboard devuelve datos correctos

```typescript
test('should return dashboard with correct structure', async () => {
  const teacher = await createTeacher();
  await createClassroomWithStudents(teacher.id, 25);

  const dashboard = await teacherService.getDashboard(teacher.id);

  expect(dashboard).toHaveProperty('summary');
  expect(dashboard).toHaveProperty('classrooms');
  expect(dashboard).toHaveProperty('recentActivities');
  expect(dashboard).toHaveProperty('insights');
  expect(dashboard.summary.totalClassrooms).toBe(1);
  expect(dashboard.summary.totalStudents).toBe(25);
});
```

### Test Case 2: Actividad filtra por aula correcta

```typescript
test('should return only activities from specified classroom', async () => {
  const teacher = await createTeacher();
  const classroom1 = await createClassroom(teacher.id);
  const classroom2 = await createClassroom(teacher.id);

  await createActivityLog(classroom1.id);
  await createActivityLog(classroom2.id);

  const activity = await classroomActivityService.getActivitySummary(
    classroom1.id,
    teacher.id
  );

  expect(activity.recentActivities.every(
    a => a.classroomId === classroom1.id
  )).toBe(true);
});
```

### Test Case 3: Auto-refresh no causa memory leaks

```typescript
test('should cleanup interval on unmount', () => {
  const { unmount } = renderHook(() =>
    useClassroomActivity('classroom-id')
  );

  const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

  unmount();

  expect(clearIntervalSpy).toHaveBeenCalled();
});
```

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Analyst | Creacion inicial |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-005-admin-base/especificaciones/ET-ADM-003-dashboard-maestro.md`
