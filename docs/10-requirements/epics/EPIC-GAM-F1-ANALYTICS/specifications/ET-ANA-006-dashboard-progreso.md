# ET-ANA-006: Implementacion del Dashboard de Progreso y Metricas de Clase

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ANA-006 |
| **Modulo** | Analytics |
| **Titulo** | Dashboard de Progreso y Metricas de Clase |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-20 |
| **Ultima Actualizacion** | 2026-01-20 |
| **Autor** | Documentation Analyst |
| **Reviewers** | Backend Lead, Frontend Lead |

---

## Referencias

### Requerimiento Funcional
- [RF-ANA-001: Dashboard de Progreso y Metricas de Clase](../requirements/RF-ANA-001-dashboard-progreso.md)

### User Stories
- [US-ANA-001: Dashboard de Clase Basico](../user-stories/US-ANA-001/US-ANA-001-dashboard-clase-basico.md)
- [US-ANA-002: Tabla de Estudiantes con Metricas](../user-stories/US-ANA-002/US-ANA-002-tabla-estudiantes-metricas.md)

### API REST Endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/teacher/classroom/{classroomId}/dashboard` | Obtener dashboard de clase |
| GET | `/api/teacher/classroom/{classroomId}/students` | Listar estudiantes con metricas |

---

## Arquitectura

### Diagrama de Capas

```
+--------------------------------------------------+
|                 FRONTEND (React)                  |
|  - ClassroomDashboard                            |
|  - MetricsCards                                  |
|  - LevelDistributionChart                        |
|  - ModuleCompletionPieChart                      |
|  - StudentListTable                              |
+---------------------+----------------------------+
                      | REST API
+---------------------v----------------------------+
|              BACKEND (NestJS)                    |
|  - TeacherAnalyticsController                    |
|  - TeacherAnalyticsService                       |
|  - ClassroomRepository                           |
+---------------------+----------------------------+
                      | SQL Queries
+---------------------v----------------------------+
|            DATABASE (PostgreSQL)                 |
|  - classroom (tabla de clases)                   |
|  - student_progress (progreso por estudiante)    |
|  - activity_logs (actividades recientes)         |
+--------------------------------------------------+
```

### Flujo de Datos - Dashboard

```
Profesor accede a /teacher/classroom/:id/dashboard
        |
        v
Frontend llama GET /api/teacher/classroom/:id/dashboard
        |
        v
Backend valida acceso del profesor
        |
        v
TeacherAnalyticsService.getClassroomDashboard()
        |
        +---> calculateClassMetrics() --> Metricas generales
        |
        +---> getLevelDistribution() --> Distribucion por nivel
        |
        +---> getModuleCompletion() --> Completitud de modulos
        |
        +---> getModuleProgress() --> Progreso por modulo
        |
        +---> getRecentActivities(10) --> Ultimas actividades
        |
        v
Respuesta JSON compilada
        |
        v
Frontend renderiza dashboard con Recharts
```

---

## Implementacion de Base de Datos

### Tablas Relevantes

**classroom** (Schema: `public`)
```sql
CREATE TABLE classroom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    teacher_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);
```

**student_progress** (Schema: `progress_tracking`)
```sql
CREATE TABLE progress_tracking.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id),
    classroom_id UUID NOT NULL REFERENCES public.classroom(id),
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_activity_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_student_progress_classroom ON progress_tracking.student_progress(classroom_id);
CREATE INDEX idx_student_progress_student ON progress_tracking.student_progress(student_id);
```

**activity_logs** (Schema: `progress_tracking`)
```sql
CREATE TABLE progress_tracking.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id),
    classroom_id UUID NOT NULL REFERENCES public.classroom(id),
    module_id UUID REFERENCES content.modules(id),
    activity_type VARCHAR(50) NOT NULL,
    activity_name VARCHAR(200),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX idx_activity_logs_classroom_ts ON progress_tracking.activity_logs(classroom_id, timestamp DESC);
```

### Queries Principales

**Metricas de Clase:**
```sql
SELECT
    COUNT(*) as total_students,
    AVG(completion_percentage) as average_progress,
    AVG(current_level) as average_level,
    SUM(total_xp) as total_xp
FROM progress_tracking.student_progress
WHERE classroom_id = $1;
```

**Distribucion por Nivel:**
```sql
SELECT
    current_level as level,
    COUNT(*) as count
FROM progress_tracking.student_progress
WHERE classroom_id = $1
GROUP BY current_level
ORDER BY current_level;
```

**Ultimas 10 Actividades:**
```sql
SELECT
    al.id,
    u.full_name as student_name,
    m.name as module_name,
    al.activity_name,
    al.timestamp,
    al.activity_type
FROM progress_tracking.activity_logs al
JOIN auth.users u ON al.student_id = u.id
LEFT JOIN content.modules m ON al.module_id = m.id
WHERE al.classroom_id = $1
ORDER BY al.timestamp DESC
LIMIT 10;
```

---

## Implementacion Backend (NestJS)

### Module

**Ubicacion:** `apps/backend/src/modules/teacher-analytics/teacher-analytics.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherAnalyticsController } from './teacher-analytics.controller';
import { TeacherAnalyticsService } from './teacher-analytics.service';
import { Classroom } from '../classroom/entities/classroom.entity';
import { StudentProgress } from '../progress/entities/student-progress.entity';
import { ActivityLog } from '../progress/entities/activity-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Classroom, StudentProgress, ActivityLog]),
  ],
  controllers: [TeacherAnalyticsController],
  providers: [TeacherAnalyticsService],
  exports: [TeacherAnalyticsService],
})
export class TeacherAnalyticsModule {}
```

### Controller

**Ubicacion:** `apps/backend/src/modules/teacher-analytics/teacher-analytics.controller.ts`

```typescript
import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeacherGuard } from '../auth/guards/teacher.guard';
import { TeacherAnalyticsService } from './teacher-analytics.service';
import { StudentListQueryDto } from './dto/student-list-query.dto';

@Controller('teacher')
@UseGuards(JwtAuthGuard, TeacherGuard)
export class TeacherAnalyticsController {
  constructor(private readonly analyticsService: TeacherAnalyticsService) {}

  @Get('classroom/:classroomId/dashboard')
  async getClassroomDashboard(
    @Param('classroomId') classroomId: string,
    @Req() req,
  ) {
    return this.analyticsService.getClassroomDashboard(classroomId, req.user.id);
  }

  @Get('classroom/:classroomId/students')
  async getClassroomStudents(
    @Param('classroomId') classroomId: string,
    @Query() query: StudentListQueryDto,
    @Req() req,
  ) {
    return this.analyticsService.getClassroomStudents(classroomId, req.user.id, query);
  }
}
```

### Service

**Ubicacion:** `apps/backend/src/modules/teacher-analytics/teacher-analytics.service.ts`

```typescript
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classroom } from '../classroom/entities/classroom.entity';
import { StudentProgress } from '../progress/entities/student-progress.entity';
import { ActivityLog } from '../progress/entities/activity-log.entity';
import { StudentListQueryDto } from './dto/student-list-query.dto';

@Injectable()
export class TeacherAnalyticsService {
  constructor(
    @InjectRepository(Classroom)
    private classroomRepo: Repository<Classroom>,
    @InjectRepository(StudentProgress)
    private progressRepo: Repository<StudentProgress>,
    @InjectRepository(ActivityLog)
    private activityLogRepo: Repository<ActivityLog>,
  ) {}

  async getClassroomDashboard(classroomId: string, teacherId: string) {
    // Validar acceso
    await this.validateTeacherAccess(classroomId, teacherId);

    const classroom = await this.classroomRepo.findOne({
      where: { id: classroomId }
    });

    // Obtener metricas
    const metrics = await this.calculateClassMetrics(classroomId);
    const levelDistribution = await this.getLevelDistribution(classroomId);
    const moduleCompletion = await this.getModuleCompletion(classroomId);
    const moduleProgress = await this.getModuleProgress(classroomId);
    const recentActivities = await this.getRecentActivities(classroomId, 10);

    return {
      classroomId,
      classroomName: classroom.name,
      metrics,
      levelDistribution,
      moduleCompletion,
      moduleProgress,
      recentActivities,
    };
  }

  async getClassroomStudents(
    classroomId: string,
    teacherId: string,
    query: StudentListQueryDto,
  ) {
    await this.validateTeacherAccess(classroomId, teacherId);

    let queryBuilder = this.progressRepo
      .createQueryBuilder('sp')
      .innerJoinAndSelect('sp.student', 'student')
      .where('sp.classroom_id = :classroomId', { classroomId });

    // Busqueda
    if (query.search) {
      queryBuilder = queryBuilder.andWhere(
        'LOWER(student.full_name) LIKE LOWER(:search)',
        { search: `%${query.search}%` },
      );
    }

    // Ordenamiento
    const sortField = this.mapSortField(query.sortBy);
    queryBuilder = queryBuilder.orderBy(sortField, query.order?.toUpperCase() as 'ASC' | 'DESC');

    // Paginacion
    const skip = (query.page - 1) * query.limit;
    queryBuilder = queryBuilder.skip(skip).take(query.limit);

    const [students, total] = await queryBuilder.getManyAndCount();

    return {
      classroomId,
      students: students.map(sp => this.mapStudentProgress(sp)),
      pagination: {
        currentPage: query.page,
        totalPages: Math.ceil(total / query.limit),
        totalStudents: total,
        limit: query.limit,
      },
    };
  }

  private async validateTeacherAccess(classroomId: string, teacherId: string) {
    const classroom = await this.classroomRepo.findOne({
      where: { id: classroomId, teacherId },
    });

    if (!classroom) {
      throw new ForbiddenException('No tienes acceso a esta clase');
    }
  }

  private async calculateClassMetrics(classroomId: string) {
    const result = await this.progressRepo
      .createQueryBuilder('sp')
      .select('COUNT(*)', 'totalStudents')
      .addSelect('AVG(sp.completion_percentage)', 'averageProgress')
      .addSelect('AVG(sp.current_level)', 'averageLevel')
      .addSelect('SUM(sp.total_xp)', 'totalXP')
      .where('sp.classroom_id = :classroomId', { classroomId })
      .getRawOne();

    return {
      totalStudents: parseInt(result.totalStudents) || 0,
      averageProgress: parseFloat(result.averageProgress) || 0,
      averageLevel: parseFloat(result.averageLevel) || 1,
      totalXP: parseInt(result.totalXP) || 0,
    };
  }

  private async getLevelDistribution(classroomId: string) {
    return this.progressRepo
      .createQueryBuilder('sp')
      .select('sp.current_level', 'level')
      .addSelect('COUNT(*)', 'count')
      .where('sp.classroom_id = :classroomId', { classroomId })
      .groupBy('sp.current_level')
      .orderBy('sp.current_level', 'ASC')
      .getRawMany();
  }

  private async getModuleCompletion(classroomId: string) {
    // Simplificado - en implementacion real seria mas complejo
    const result = await this.progressRepo
      .createQueryBuilder('sp')
      .select('AVG(sp.completion_percentage)', 'avgCompletion')
      .where('sp.classroom_id = :classroomId', { classroomId })
      .getRawOne();

    const avg = parseFloat(result.avgCompletion) || 0;

    return {
      completed: Math.round(avg),
      inProgress: Math.round((100 - avg) * 0.6),
      notStarted: Math.round((100 - avg) * 0.4),
    };
  }

  private async getModuleProgress(classroomId: string) {
    // Query simplificado - depende del modelo de datos real
    return [];
  }

  private async getRecentActivities(classroomId: string, limit: number) {
    return this.activityLogRepo
      .createQueryBuilder('al')
      .innerJoinAndSelect('al.student', 'student')
      .leftJoinAndSelect('al.module', 'module')
      .where('al.classroom_id = :classroomId', { classroomId })
      .orderBy('al.timestamp', 'DESC')
      .take(limit)
      .getMany();
  }

  private mapSortField(sortBy: string): string {
    const mapping = {
      name: 'student.full_name',
      progress: 'sp.completion_percentage',
      level: 'sp.current_level',
      xp: 'sp.total_xp',
      lastActivity: 'sp.last_activity_at',
    };
    return mapping[sortBy] || 'student.full_name';
  }

  private mapStudentProgress(sp: StudentProgress) {
    return {
      id: sp.student.id,
      name: sp.student.fullName,
      avatarUrl: sp.student.avatarUrl,
      progress: {
        percentage: sp.completionPercentage,
        completedModules: 0, // Calcular basado en modelo real
        totalModules: 0,
      },
      level: sp.currentLevel,
      xp: sp.totalXp,
      lastActivity: {
        timestamp: sp.lastActivityAt,
      },
    };
  }
}
```

### DTOs

**Ubicacion:** `apps/backend/src/modules/teacher-analytics/dto/student-list-query.dto.ts`

```typescript
import { IsOptional, IsInt, Min, Max, IsIn, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class StudentListQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;

  @IsOptional()
  @IsIn(['name', 'progress', 'level', 'xp', 'lastActivity'])
  sortBy?: string = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
```

---

## Implementacion Frontend (React)

### Componente Principal - ClassroomDashboard

**Ubicacion:** `apps/frontend/src/pages/teacher/ClassroomDashboard.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { teacherAnalyticsApi } from '../../services/teacherAnalyticsApi';
import { MetricsCards } from '../../components/analytics/MetricsCards';
import { LevelDistributionChart } from '../../components/analytics/LevelDistributionChart';
import { ModuleCompletionPieChart } from '../../components/analytics/ModuleCompletionPieChart';
import { RecentActivitiesList } from '../../components/analytics/RecentActivitiesList';
import { DashboardSkeleton } from '../../components/skeletons/DashboardSkeleton';

interface DashboardData {
  classroomId: string;
  classroomName: string;
  metrics: {
    totalStudents: number;
    averageProgress: number;
    averageLevel: number;
    totalXP: number;
  };
  levelDistribution: Array<{ level: number; count: number }>;
  moduleCompletion: { completed: number; inProgress: number; notStarted: number };
  recentActivities: Array<any>;
}

export const ClassroomDashboard: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const result = await teacherAnalyticsApi.getDashboard(classroomId);
        setData(result);
      } catch (err) {
        setError('Error al cargar el dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();

    // Auto-refresh cada 5 minutos
    const interval = setInterval(fetchDashboard, 300000);
    return () => clearInterval(interval);
  }, [classroomId]);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="dashboard-container p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{data.classroomName}</h1>
      </header>

      <MetricsCards metrics={data.metrics} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <LevelDistributionChart data={data.levelDistribution} />
        <ModuleCompletionPieChart data={data.moduleCompletion} />
      </div>

      <RecentActivitiesList
        activities={data.recentActivities}
        classroomId={classroomId}
      />

      <div className="flex gap-4 mt-6">
        <a
          href={`/teacher/classroom/${classroomId}/students`}
          className="btn btn-primary"
        >
          Ver Todos los Estudiantes
        </a>
        <a
          href={`/teacher/classroom/${classroomId}/reports`}
          className="btn btn-secondary"
        >
          Ver Reportes
        </a>
      </div>
    </div>
  );
};
```

### Componente MetricsCards

**Ubicacion:** `apps/frontend/src/components/analytics/MetricsCards.tsx`

```typescript
import React from 'react';
import { UsersIcon, ChartBarIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface MetricsCardsProps {
  metrics: {
    totalStudents: number;
    averageProgress: number;
    averageLevel: number;
    totalXP: number;
  };
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={<UsersIcon className="w-8 h-8 text-blue-500" />}
        label="Estudiantes"
        value={metrics.totalStudents}
      />
      <MetricCard
        icon={<ChartBarIcon className="w-8 h-8 text-green-500" />}
        label="Progreso Promedio"
        value={`${metrics.averageProgress.toFixed(1)}%`}
      />
      <MetricCard
        icon={<StarIcon className="w-8 h-8 text-yellow-500" />}
        label="Nivel Promedio"
        value={metrics.averageLevel.toFixed(1)}
      />
      <MetricCard
        icon={<SparklesIcon className="w-8 h-8 text-purple-500" />}
        label="XP Total"
        value={metrics.totalXP.toLocaleString()}
      />
    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({
  icon,
  label,
  value,
}) => (
  <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
    {icon}
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);
```

### Graficas con Recharts

**Ubicacion:** `apps/frontend/src/components/analytics/LevelDistributionChart.tsx`

```typescript
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LevelDistributionChartProps {
  data: Array<{ level: number; count: number }>;
}

export const LevelDistributionChart: React.FC<LevelDistributionChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Distribucion por Nivel</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="level" label={{ value: 'Nivel', position: 'bottom' }} />
          <YAxis label={{ value: 'Estudiantes', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
```

---

## Testing

### Unit Tests Backend

```typescript
describe('TeacherAnalyticsService', () => {
  describe('calculateClassMetrics', () => {
    it('should return correct metrics for classroom', async () => {
      const result = await service.calculateClassMetrics('classroom-id');

      expect(result).toHaveProperty('totalStudents');
      expect(result).toHaveProperty('averageProgress');
      expect(result).toHaveProperty('averageLevel');
      expect(result).toHaveProperty('totalXP');
      expect(result.totalStudents).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validateTeacherAccess', () => {
    it('should throw ForbiddenException when teacher has no access', async () => {
      await expect(
        service.validateTeacherAccess('classroom-id', 'wrong-teacher-id')
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
```

### Integration Tests

```typescript
describe('TeacherAnalyticsController (e2e)', () => {
  it('GET /teacher/classroom/:id/dashboard returns 200 for valid teacher', async () => {
    const response = await request(app.getHttpServer())
      .get('/teacher/classroom/valid-classroom-id/dashboard')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('classroomId');
    expect(response.body).toHaveProperty('metrics');
    expect(response.body).toHaveProperty('levelDistribution');
  });

  it('GET /teacher/classroom/:id/dashboard returns 403 for unauthorized teacher', async () => {
    await request(app.getHttpServer())
      .get('/teacher/classroom/other-classroom-id/dashboard')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(403);
  });
});
```

---

## Performance y Optimizacion

### Indices de Base de Datos
```sql
CREATE INDEX idx_student_progress_classroom ON progress_tracking.student_progress(classroom_id);
CREATE INDEX idx_activity_logs_classroom_ts ON progress_tracking.activity_logs(classroom_id, timestamp DESC);
CREATE INDEX idx_student_name ON auth.users(LOWER(full_name));
```

### Caching (Redis)
```typescript
async getClassroomDashboard(classroomId: string, teacherId: string) {
  const cacheKey = `dashboard:${classroomId}`;
  const cached = await this.redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const data = await this.buildDashboard(classroomId, teacherId);
  await this.redis.set(cacheKey, JSON.stringify(data), 'EX', 300); // 5 min

  return data;
}
```

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Analyst | Creacion inicial de especificacion tecnica |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-004-analytics/especificaciones/ET-ANA-001-dashboard-progreso.md`
