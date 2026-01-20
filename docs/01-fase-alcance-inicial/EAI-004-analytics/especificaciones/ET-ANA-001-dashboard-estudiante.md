# ET-ANA-001: Especificacion Tecnica del Dashboard de Estudiante

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ANA-001 |
| **Modulo** | Analytics |
| **Titulo** | Dashboard del Estudiante y Vistas de Progreso |
| **Prioridad** | Alta |
| **Estado** | Done |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-20 |
| **Ultima Actualizacion** | 2026-01-20 |
| **Autor** | Documentation Team |

---

## Requerimiento Padre

- [RF-ANA-001: Visualizacion de Progreso del Estudiante](../requerimientos/RF-ANA-001-visualizacion-progreso.md)

---

## Descripcion Tecnica

Este documento especifica la implementacion tecnica del sistema de dashboards y vistas de progreso para profesores, incluyendo el dashboard de clase, la tabla de estudiantes con metricas, y la vista individual de estudiante.

---

## Componentes Afectados

### Backend
| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| TeacherAnalyticsModule | `modules/teacher-analytics/teacher-analytics.module.ts` | Modulo NestJS principal |
| TeacherAnalyticsController | `modules/teacher-analytics/teacher-analytics.controller.ts` | Controlador con endpoints |
| TeacherAnalyticsService | `modules/teacher-analytics/services/teacher-analytics.service.ts` | Logica de negocio |
| DTOs | `modules/teacher-analytics/dto/*.dto.ts` | Objetos de transferencia de datos |

### Frontend
| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| ClassroomDashboard | `features/teacher/analytics/components/ClassroomDashboard.tsx` | Dashboard principal de clase |
| StudentListTable | `features/teacher/analytics/components/StudentListTable.tsx` | Tabla de estudiantes |
| StudentProfileView | `features/teacher/analytics/components/StudentProfileView.tsx` | Vista individual de estudiante |
| MetricsCards | `features/teacher/analytics/components/MetricsCards.tsx` | Cards de metricas generales |
| LevelDistributionChart | `features/teacher/analytics/components/LevelDistributionChart.tsx` | Grafica de distribucion por nivel |
| ModuleProgressChart | `features/teacher/analytics/components/ModuleProgressChart.tsx` | Grafica de progreso por modulo |
| RecentActivitiesList | `features/teacher/analytics/components/RecentActivitiesList.tsx` | Lista de actividades recientes |
| teacherAnalyticsStore | `features/teacher/analytics/stores/teacherAnalyticsStore.ts` | Estado global (Zustand) |

### Database
| Tabla/Vista | Schema | Descripcion |
|-------------|--------|-------------|
| classrooms | public | Datos de las clases |
| students | public | Datos de los estudiantes |
| module_progress | progress_tracking | Progreso por modulo |
| user_stats | gamification_system | Estadisticas de gamificacion |
| activity_logs | analytics | Logs de actividades |
| sessions | analytics | Sesiones de usuario |

---

## Endpoints API

### GET /api/teacher/classroom/{classroomId}/dashboard

**Descripcion:** Obtiene datos del dashboard de una clase

**Request:**
```
GET /api/teacher/classroom/uuid-classroom/dashboard
Authorization: Bearer {token}
```

**Response:**
```json
{
  "classroomId": "uuid",
  "classroomName": "Matematicas 6A",
  "metrics": {
    "totalStudents": 25,
    "averageProgress": 65.5,
    "averageLevel": 3,
    "totalXP": 12500
  },
  "levelDistribution": [
    {"level": 1, "count": 5},
    {"level": 2, "count": 8},
    {"level": 3, "count": 10},
    {"level": 4, "count": 2}
  ],
  "moduleCompletion": {
    "completed": 60,
    "inProgress": 30,
    "notStarted": 10
  },
  "moduleProgress": [
    {"moduleName": "Fracciones", "averageProgress": 75},
    {"moduleName": "Geometria", "averageProgress": 55}
  ],
  "recentActivities": [
    {
      "studentName": "Juan Perez",
      "moduleName": "Fracciones",
      "activityName": "Suma de fracciones",
      "timestamp": "2026-01-20T10:30:00Z",
      "type": "completed"
    }
  ]
}
```

**Codigos de Respuesta:**
| Codigo | Descripcion |
|--------|-------------|
| 200 | Exito |
| 401 | No autenticado |
| 403 | Sin acceso a la clase |
| 404 | Clase no encontrada |

---

### GET /api/teacher/classroom/{classroomId}/students

**Descripcion:** Obtiene lista paginada de estudiantes con metricas

**Request:**
```
GET /api/teacher/classroom/uuid/students?page=1&limit=50&sortBy=name&order=asc&search=juan
Authorization: Bearer {token}
```

**Query Parameters:**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| page | number | 1 | Pagina actual |
| limit | number | 50 | Estudiantes por pagina (max 100) |
| sortBy | string | name | Columna para ordenar |
| order | string | asc | Direccion (asc/desc) |
| search | string | - | Busqueda por nombre |

**Response:**
```json
{
  "classroomId": "uuid",
  "students": [
    {
      "id": "student-uuid",
      "name": "Juan Perez Garcia",
      "avatarUrl": "/avatars/student-uuid.png",
      "progress": {
        "percentage": 65.5,
        "completedModules": 5,
        "totalModules": 8
      },
      "level": 3,
      "xp": 1250,
      "lastActivity": {
        "timestamp": "2026-01-19T15:30:00Z",
        "moduleName": "Fracciones",
        "activityName": "Suma de fracciones"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalStudents": 75,
    "limit": 50
  }
}
```

---

### GET /api/teacher/student/{studentId}/profile

**Descripcion:** Obtiene perfil detallado de un estudiante

**Request:**
```
GET /api/teacher/student/uuid-student/profile?classroomId=uuid-classroom
Authorization: Bearer {token}
```

**Response:**
```json
{
  "studentId": "uuid",
  "classroomId": "uuid",
  "profile": {
    "name": "Juan Perez Garcia",
    "avatarUrl": "/avatars/student-uuid.png",
    "level": 3,
    "xp": 1250,
    "overallProgress": 65.5,
    "lastActivity": "2026-01-19T15:30:00Z"
  },
  "moduleProgress": [
    {
      "moduleId": "module-uuid",
      "moduleName": "Fracciones",
      "progress": 85,
      "completedActivities": 17,
      "totalActivities": 20,
      "status": "in_progress"
    }
  ],
  "recentActivities": [
    {
      "activityId": "activity-uuid",
      "activityName": "Suma de fracciones",
      "moduleName": "Fracciones",
      "completedAt": "2026-01-19T15:30:00Z",
      "score": 95,
      "xpEarned": 50
    }
  ],
  "timeMetrics": {
    "totalTime": 12600,
    "averageSessionTime": 1800,
    "totalSessions": 15,
    "lastSession": {
      "startedAt": "2026-01-19T15:00:00Z",
      "endedAt": "2026-01-19T15:45:00Z",
      "duration": 2700
    }
  }
}
```

---

## Implementacion Backend

### Controller

```typescript
// teacher-analytics.controller.ts
@Controller('teacher')
@UseGuards(JwtAuthGuard, TeacherGuard)
export class TeacherAnalyticsController {
  constructor(private analyticsService: TeacherAnalyticsService) {}

  @Get('classroom/:classroomId/dashboard')
  @ApiOperation({ summary: 'Get classroom dashboard data' })
  async getClassroomDashboard(
    @Param('classroomId') classroomId: string,
    @CurrentUser() teacher: User
  ) {
    return this.analyticsService.getClassroomDashboard(classroomId, teacher.id);
  }

  @Get('classroom/:classroomId/students')
  @ApiOperation({ summary: 'Get paginated student list with metrics' })
  async getClassroomStudents(
    @Param('classroomId') classroomId: string,
    @Query() query: StudentListQueryDto,
    @CurrentUser() teacher: User
  ) {
    return this.analyticsService.getClassroomStudents(classroomId, teacher.id, query);
  }

  @Get('student/:studentId/profile')
  @ApiOperation({ summary: 'Get detailed student profile' })
  async getStudentProfile(
    @Param('studentId') studentId: string,
    @Query('classroomId') classroomId: string,
    @CurrentUser() teacher: User
  ) {
    return this.analyticsService.getStudentProfile(studentId, classroomId, teacher.id);
  }
}
```

### Service

```typescript
// teacher-analytics.service.ts
@Injectable()
export class TeacherAnalyticsService {
  constructor(
    @InjectRepository(Classroom) private classroomRepo: Repository<Classroom>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    private cacheManager: Cache
  ) {}

  async getClassroomDashboard(classroomId: string, teacherId: string) {
    // 1. Validar acceso
    await this.validateTeacherAccess(classroomId, teacherId);

    // 2. Intentar obtener de cache
    const cacheKey = `dashboard:${classroomId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // 3. Calcular metricas
    const metrics = await this.calculateClassMetrics(classroomId);
    const levelDistribution = await this.getLevelDistribution(classroomId);
    const moduleCompletion = await this.getModuleCompletion(classroomId);
    const moduleProgress = await this.getModuleProgress(classroomId);
    const recentActivities = await this.getRecentActivities(classroomId, 10);

    const result = {
      classroomId,
      metrics,
      levelDistribution,
      moduleCompletion,
      moduleProgress,
      recentActivities
    };

    // 4. Cachear por 5 minutos
    await this.cacheManager.set(cacheKey, result, 300);

    return result;
  }

  private async validateTeacherAccess(classroomId: string, teacherId: string) {
    const classroom = await this.classroomRepo.findOne({
      where: { id: classroomId, teacherId }
    });
    if (!classroom) {
      throw new ForbiddenException('No tienes acceso a esta clase');
    }
  }

  private async calculateClassMetrics(classroomId: string) {
    return this.studentRepo
      .createQueryBuilder('s')
      .innerJoin('s.classrooms', 'c', 'c.id = :classroomId', { classroomId })
      .leftJoin('gamification_system.user_stats', 'us', 'us.user_id = s.user_id')
      .select([
        'COUNT(s.id) as totalStudents',
        'AVG(s.overall_progress) as averageProgress',
        'AVG(us.level) as averageLevel',
        'SUM(us.total_xp) as totalXP'
      ])
      .getRawOne();
  }
}
```

### DTOs

```typescript
// student-list-query.dto.ts
export class StudentListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(100)
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

## Implementacion Frontend

### Componente Principal

```typescript
// ClassroomDashboard.tsx
export const ClassroomDashboard: React.FC = () => {
  const { classroomId } = useParams();
  const { data, isLoading, error } = useClassroomDashboard(classroomId);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="dashboard-container p-6">
      <DashboardHeader
        classroomName={data.classroomName}
        classroomId={classroomId}
      />

      <MetricsCards metrics={data.metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <LevelDistributionChart data={data.levelDistribution} />
        <ModuleCompletionPieChart data={data.moduleCompletion} />
      </div>

      <ModuleProgressBarChart data={data.moduleProgress} className="mt-6" />

      <RecentActivitiesList
        activities={data.recentActivities}
        className="mt-6"
      />

      <QuickActions classroomId={classroomId} className="mt-6" />
    </div>
  );
};
```

### Hook Personalizado

```typescript
// useClassroomDashboard.ts
export const useClassroomDashboard = (classroomId: string) => {
  return useQuery({
    queryKey: ['classroomDashboard', classroomId],
    queryFn: () => teacherAnalyticsApi.getDashboard(classroomId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh cada 5 min
    enabled: !!classroomId
  });
};
```

### Store (Zustand)

```typescript
// teacherAnalyticsStore.ts
interface TeacherAnalyticsStore {
  selectedClassroomId: string | null;
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  setSelectedClassroom: (id: string) => void;
  fetchDashboard: (classroomId: string) => Promise<void>;
  clearData: () => void;
}

export const useTeacherAnalyticsStore = create<TeacherAnalyticsStore>((set) => ({
  selectedClassroomId: null,
  dashboardData: null,
  isLoading: false,
  error: null,

  setSelectedClassroom: (id) => set({ selectedClassroomId: id }),

  fetchDashboard: async (classroomId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await teacherAnalyticsApi.getDashboard(classroomId);
      set({ dashboardData: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  clearData: () => set({ dashboardData: null, error: null })
}));
```

---

## Graficas (Recharts)

### Distribucion por Nivel

```typescript
// LevelDistributionChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const LevelDistributionChart: React.FC<{ data: LevelDistribution[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Distribucion por Nivel</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="level" label={{ value: 'Nivel', position: 'bottom' }} />
          <YAxis label={{ value: 'Estudiantes', angle: -90, position: 'left' }} />
          <Tooltip />
          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
```

---

## Consideraciones Tecnicas

### Performance
- Cache de dashboard: 5 minutos (Redis)
- Cache de lista de estudiantes: sin cache (datos dinamicos)
- Cache de perfil individual: 2 minutos
- Indices en columnas: student.name, module_progress.user_id, activity_logs.timestamp

### Seguridad
- Validacion de acceso en cada endpoint
- Guard TeacherGuard valida rol de profesor
- Solo retorna datos de clases asignadas al profesor

### Responsive
- Dashboard: grid adapta de 2 columnas (desktop) a 1 columna (mobile)
- Tabla: colapsa a cards en mobile
- Graficas: ajustan tamano automaticamente

### Accesibilidad
- Graficas con texto alternativo
- Tablas con headers accesibles
- Contraste adecuado en colores

---

## Testing

### Backend

```typescript
describe('TeacherAnalyticsService', () => {
  it('should return dashboard data for authorized teacher', async () => {
    const result = await service.getClassroomDashboard(classroomId, teacherId);
    expect(result.metrics.totalStudents).toBeGreaterThan(0);
    expect(result.levelDistribution).toBeDefined();
  });

  it('should throw ForbiddenException for unauthorized teacher', async () => {
    await expect(
      service.getClassroomDashboard(classroomId, otherTeacherId)
    ).rejects.toThrow(ForbiddenException);
  });
});
```

### Frontend

```typescript
describe('ClassroomDashboard', () => {
  it('renders metrics cards correctly', async () => {
    render(<ClassroomDashboard />);
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // Total estudiantes
    });
  });

  it('shows skeleton while loading', () => {
    render(<ClassroomDashboard />);
    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
  });
});
```

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Team | Creacion inicial de la especificacion |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-004-analytics/especificaciones/ET-ANA-001-dashboard-estudiante.md`
