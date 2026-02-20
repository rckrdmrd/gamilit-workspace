# Guia de Desarrollo - Portal Teacher

**Fecha de creacion:** 2025-11-29
**Version:** 2.0.0
**Estado:** VIGENTE
**Aplica a:** apps/frontend/src/apps/teacher/ + apps/backend/src/modules/teacher/

---

## 1. Vision General

### 1.1 Proposito

El Portal Teacher es la interfaz principal para docentes en GAMILIT. Proporciona herramientas para:

- **Gestion de Aulas:** Crear, administrar y monitorear classrooms
- **Seguimiento de Estudiantes:** Progreso, desempeno, alertas, bloqueo
- **Asignaciones:** Crear y gestionar tareas/ejercicios
- **Revision Manual:** Panel de revision para ejercicios M3-M5
- **Comunicacion:** Mensajes, anuncios y feedback a estudiantes
- **Analitica:** Dashboards, insights de aprendizaje, economia de aula
- **Gamificacion:** Bonificaciones, logros, misiones, economia de aula
- **Monitoreo:** Seguimiento en tiempo real de actividad estudiantil
- **Contenido:** Gestion de recursos y contenidos educativos
- **Reportes:** Generacion de informes PDF/Excel
- **Configuracion:** Perfil, preferencias de ensenanza, notificaciones, privacidad

### 1.2 Usuarios Objetivo

| Rol | Acceso | Funcionalidades |
|-----|--------|-----------------|
| Teacher | Completo | Todas las funcionalidades del portal |
| Admin | Supervision | Vista de todas las aulas + configuracion |

---

## 2. Arquitectura

### 2.1 Paginas del Portal (19 paginas)

Todas las paginas usan el patron **PageShell** (ver seccion 3.1.1).

| # | Archivo | Ruta | Descripcion | En nav |
|---|---------|------|-------------|--------|
| 1 | `TeacherDashboard.tsx` | `/teacher/dashboard` | Dashboard principal con estadisticas, aulas activas, alertas recientes y acciones rapidas | Si |
| 2 | `TeacherClasses.tsx` | `/teacher/classes` | Gestion de aulas (crear, editar, archivar) con lista de classrooms del docente | Si |
| 3 | `TeacherStudents.tsx` | `/teacher/students` | Lista y gestion de estudiantes por aula con indicadores de progreso y riesgo | Si |
| 4 | `TeacherAssignments.tsx` | `/teacher/assignments` | Crear y gestionar asignaciones de ejercicios a aulas | Si |
| 5 | `TeacherAlerts.tsx` | `/teacher/alerts` | Alertas de intervencion para estudiantes en riesgo, con prioridades y acciones | Si |
| 6 | `TeacherAlertConfig.tsx` | `/teacher/alerts/config` | Configuracion de umbrales y preferencias para alertas de intervencion | Si |
| 7 | `TeacherAnalytics.tsx` | `/teacher/analytics` | Graficas y metricas de rendimiento por aula y estudiante | Si |
| 8 | `TeacherGamification.tsx` | `/teacher/gamification` | Panel de gamificacion: bonificaciones ML Coins, logros de aula, economia | Si |
| 9 | `TeacherReports.tsx` | `/teacher/reports` | Generacion y descarga de reportes de progreso en PDF/Excel | Si |
| 10 | `TeacherProgress.tsx` | `/teacher/progress` | Vista detallada de progreso por estudiante y por modulo | Si |
| 11 | `TeacherMonitoring.tsx` | `/teacher/monitoring` | Monitoreo en tiempo real de actividad estudiantil en sesiones activas | Si |
| 12 | `TeacherExerciseResponses.tsx` | `/teacher/exercise-responses` | Vista de respuestas de ejercicios con filtros por tipo, aula y estudiante | Si |
| 13 | `TeacherReviewPanel.tsx` | `/teacher/review-panel` | Panel de revision manual para ejercicios M3-M5 con sistema de calificacion | Si |
| 14 | `TeacherContentManagement.tsx` | `/teacher/content-management` | Gestion completa de contenidos educativos (crear, editar, publicar) | Si |
| 15 | `TeacherSettings.tsx` | `/teacher/settings` | Configuracion del perfil, preferencias de ensenanza, notificaciones y privacidad | Si |
| 16 | `TeacherCommunication.tsx` | `/teacher/communication` | Centro de mensajes para comunicacion con estudiantes y padres | No |
| 17 | `TeacherContent.tsx` | `/teacher/content` | Gestion de recursos educativos compartidos (version anterior a ContentManagement) | No |
| 18 | `TeacherNotifications.tsx` | `/teacher/notifications` | Centro de notificaciones con filtros, lectura masiva y conexion WebSocket | No |
| 19 | `TeacherNotificationPreferences.tsx` | `/teacher/settings/notifications` | Preferencias de notificaciones por canal (in-app, email, push) | No |

**Nota:** Las 4 paginas marcadas "No" en la columna "En nav" existen como archivos y tienen rutas definidas, pero no aparecen en la navegacion lateral del portal. Son accesibles via URL directa o enlaces internos.

### 2.2 Estructura de Carpetas

#### Frontend (apps/frontend/src/apps/teacher/)

```
teacher/
├── index.ts                    # Barrel export principal
├── layouts/
│   └── TeacherLayout.tsx       # Layout principal con navegacion
├── pages/                      # Paginas del portal (19 paginas)
│   ├── TeacherDashboard.tsx
│   ├── TeacherClasses.tsx
│   ├── TeacherStudents.tsx
│   ├── TeacherAssignments.tsx
│   ├── TeacherAlerts.tsx
│   ├── TeacherAlertConfig.tsx
│   ├── TeacherAnalytics.tsx
│   ├── TeacherGamification.tsx
│   ├── TeacherReports.tsx
│   ├── TeacherCommunication.tsx       # Not in nav
│   ├── TeacherContent.tsx             # Not in nav
│   ├── TeacherContentManagement.tsx
│   ├── TeacherProgress.tsx
│   ├── TeacherMonitoring.tsx
│   ├── TeacherExerciseResponses.tsx
│   ├── TeacherReviewPanel.tsx
│   ├── TeacherNotifications.tsx       # Not in nav
│   ├── TeacherNotificationPreferences.tsx  # Not in nav
│   └── TeacherSettings.tsx
├── components/                 # Componentes organizados por dominio
│   ├── shared/                 # Componentes compartidos del portal
│   │   └── TeacherPageShell.tsx  # PageShell wrapper (ADR-046)
│   ├── dashboard/              # Componentes del dashboard
│   ├── assignments/            # Gestion de tareas
│   ├── alerts/                 # Alertas de intervencion
│   ├── analytics/              # Graficas y metricas
│   ├── progress/               # Progreso de estudiantes
│   ├── monitoring/             # Monitoreo en tiempo real
│   ├── reports/                # Generacion de reportes
│   │   └── RecentReportsTable.tsx
│   ├── responses/              # Respuestas de ejercicios
│   ├── review-panel/           # Panel de revision manual
│   ├── communication/          # Mensajes y anuncios
│   ├── collaboration/          # Compartir recursos
│   ├── settings/               # Componentes de configuracion
│   │   ├── SaveButton.tsx
│   │   ├── ProfileSettingsSection.tsx
│   │   ├── TeachingPreferencesSection.tsx
│   │   ├── NotificationsSettingsSection.tsx
│   │   ├── PrivacySettingsSection.tsx
│   │   └── index.ts
│   ├── withTeacherLayout.tsx   # @deprecated — Use TeacherPageShell instead
│   └── index.ts
├── hooks/                      # Custom hooks (26 hooks)
│   ├── useTeacherDashboard.ts
│   ├── useTeacherPageSetup.ts  # Auth/gamification setup for PageShell
│   ├── useClassrooms.ts
│   ├── useClassroomData.ts
│   ├── useClassroomRealtime.ts
│   ├── useClassroomsStats.ts
│   ├── useAssignments.ts
│   ├── useStudentProgress.ts
│   ├── useStudentBlocking.ts
│   ├── useStudentMonitoring.ts
│   ├── useAnalytics.ts
│   ├── useInterventionAlerts.ts
│   ├── useAlertConfig.ts
│   ├── useGrading.ts
│   ├── useGrantBonus.ts
│   ├── useEconomyAnalytics.ts
│   ├── useStudentsEconomy.ts
│   ├── useAchievementsStats.ts
│   ├── useMasteryTracking.ts
│   ├── useMissionStats.ts
│   ├── useTeacherMessages.ts
│   ├── useTeacherContent.ts
│   ├── useExerciseResponses.ts
│   ├── useManualReviews.ts
│   ├── useManualReviewConfig.ts
│   └── index.ts
├── constants/                  # Constantes centralizadas
│   ├── alertTypes.ts           # Tipos y prioridades de alertas
│   ├── manualReviewExercises.ts # Ejercicios de revision manual
│   └── index.ts
└── types/
    └── index.ts                # 40+ interfaces/types
```

#### Backend (apps/backend/src/modules/teacher/)

```
teacher/
├── teacher.module.ts           # Modulo NestJS principal
├── index.ts                    # Barrel exports
├── controllers/                # 7 controllers
│   ├── teacher.controller.ts           # Analytics, progress, insights
│   ├── teacher-classrooms.controller.ts
│   ├── teacher-grades.controller.ts
│   ├── teacher-communication.controller.ts
│   ├── teacher-content.controller.ts
│   ├── intervention-alerts.controller.ts
│   └── exercise-responses.controller.ts
├── services/                   # 14 services
│   ├── teacher-dashboard.service.ts
│   ├── teacher-classrooms-crud.service.ts
│   ├── student-progress.service.ts
│   ├── analytics.service.ts
│   ├── grading.service.ts
│   ├── intervention-alerts.service.ts
│   ├── student-risk-alert.service.ts    # CRON job
│   ├── ml-predictor.service.ts          # Predicciones ML
│   ├── reports.service.ts
│   ├── bonus-coins.service.ts
│   ├── teacher-messages.service.ts
│   ├── teacher-content.service.ts
│   ├── exercise-responses.service.ts
│   └── student-blocking.service.ts
├── dto/                        # Data Transfer Objects
│   ├── analytics.dto.ts
│   ├── classroom.dto.ts
│   ├── classroom-response.dto.ts
│   ├── classroom-progress.dto.ts
│   ├── grades.dto.ts
│   ├── grading.dto.ts
│   ├── grant-bonus.dto.ts
│   ├── teacher-messages.dto.ts
│   ├── teacher-content.dto.ts
│   ├── teacher-notes.dto.ts
│   ├── reports.dto.ts
│   ├── exercise-responses.dto.ts
│   ├── intervention-alerts.dto.ts
│   └── student-blocking/
├── entities/                   # Entidades TypeORM
│   ├── student-intervention-alert.entity.ts
│   ├── message.entity.ts
│   ├── teacher-content.entity.ts
│   └── teacher-report.entity.ts
├── guards/                     # Guards de autorizacion
│   ├── teacher.guard.ts
│   └── classroom-ownership.guard.ts
├── interfaces/
│   └── ml-predictor.interface.ts
└── __tests__/                  # Tests unitarios
```

### 2.3 Diagrama de Dependencias

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
├─────────────────────────────────────────────────────────────────┤
│  Pages ──► TeacherPageShell ──► TeacherLayout                   │
│    │                                                             │
│    └──────► Components ──────► Hooks ──────► API Services        │
│                 │                   │                             │
│                 └───────────────────┼─────► Types                │
└────────────────────────────────────┼─────────────────────────────┘
                                     │
                                HTTP/REST
                                     │
┌────────────────────────────────────▼─────────────────────────────┐
│                        BACKEND                                    │
├──────────────────────────────────────────────────────────────────┤
│  Controllers ──────► Services ──────► Repositories ──────► DB    │
│       │                  │                                       │
│       └──────────────────┼─────► Guards                          │
│                          │                                       │
│                          └─────► External Modules                │
│                                  (Auth, Social, Progress, etc.)  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Patrones de Diseno

### 3.1 Frontend Patterns

#### 3.1.1 PageShell Pattern (ADR-046)

All teacher pages use `TeacherPageShell` to wrap their content. This replaces the deprecated `withTeacherLayout` HOC. The PageShell internally calls `useTeacherPageSetup()` which centralizes auth, gamification data, and logout logic, then renders `TeacherLayout` around the page content.

```typescript
// Pattern: Page with TeacherPageShell
// TeacherDashboard.tsx
import { TeacherPageShell } from '../components/shared/TeacherPageShell';

export default function TeacherDashboard() {
  const { stats, classrooms, isLoading, error } = useTeacherDashboard();

  if (isLoading) return <TeacherPageShell><DashboardSkeleton /></TeacherPageShell>;
  if (error) return <TeacherPageShell><ErrorDisplay error={error} /></TeacherPageShell>;

  return (
    <TeacherPageShell>
      <TeacherDashboardHero stats={stats} />
      <ClassroomsGrid classrooms={classrooms} />
    </TeacherPageShell>
  );
}
```

```typescript
// App.tsx — Simple lazy imports (no HOC wrapping)
const TeacherDashboard = lazy(() => import('./apps/teacher/pages/TeacherDashboard'));

<Route path="/teacher/dashboard" element={<TeacherDashboard />} />
```

**Deprecated pattern (do NOT use for new pages):**

```typescript
// DEPRECATED: withTeacherLayout HOC in App.tsx
const TeacherDashboard = lazy(() =>
  import('./pages/TeacherDashboard').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
```

See [ADR-046: PageShell Pattern](../../90-adr/ADR-046-pageshell-pattern.md) for the full rationale.

#### 3.1.2 Page + Hook Pattern with React Query

Each page has a corresponding hook that encapsulates data fetching via React Query:

```typescript
// useTeacherDashboard.ts
export function useTeacherDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher', 'dashboard', 'stats'],
    queryFn: () => teacherApi.getDashboardStats(),
  });

  const { data: classrooms, isLoading: classroomsLoading } = useQuery({
    queryKey: ['teacher', 'classrooms'],
    queryFn: () => classroomsApi.getTeacherClassrooms(),
  });

  return {
    stats,
    classrooms,
    isLoading: statsLoading || classroomsLoading,
  };
}
```

Hooks use `@tanstack/react-query` for server state management:
- `useQuery` for read operations (GET)
- `useMutation` with `queryClient.invalidateQueries` for write operations (POST/PUT/DELETE)
- `useApiError` from `@shared/hooks/useApiError` for consistent error handling with toast

See [ADR-013: React Query Adoption](../../90-adr/ADR-013-react-query-adoption.md) and [React Query Migration Guide](../../50-guides/REACT-QUERY-MIGRATION-GUIDE.md) for details.

#### 3.1.3 Component Composition

Componentes organizados por dominio, compuestos desde componentes mas pequenos:

```typescript
// dashboard/index.ts - Barrel export
export { TeacherDashboardHero } from './TeacherDashboardHero';
export { ClassroomsGrid } from './ClassroomsGrid';
export { ClassroomCard } from './ClassroomCard';
export { PendingSubmissionsList } from './PendingSubmissionsList';
export { StudentAlerts } from './StudentAlerts';
export { QuickActionsPanel } from './QuickActionsPanel';
export { RecentAssignmentsList } from './RecentAssignmentsList';
export { CreateClassroomModal } from './CreateClassroomModal';
export { CreateAssignmentModal } from './CreateAssignmentModal';
export { GradeSubmissionModal } from './GradeSubmissionModal';
```

#### 3.1.4 Modal Pattern

Modales para acciones complejas:

```typescript
// Pattern: Modal con form interno

interface CreateClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (classroom: Classroom) => void;
}

export const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { mutate: createClassroom, isPending } = useMutation({
    mutationFn: classroomsApi.create,
    onSuccess: (data) => {
      onSuccess(data);
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ClassroomForm
        onSubmit={createClassroom}
        isLoading={isPending}
        onCancel={onClose}
      />
    </Modal>
  );
};
```

### 3.2 Backend Patterns

#### 3.2.1 Guard-Based Authorization

```typescript
// Pattern: Guards para autorizacion

@Controller('teacher')
@UseGuards(JwtAuthGuard, TeacherGuard)  // Requiere autenticacion + rol teacher
@ApiTags('Teacher')
export class TeacherController {

  @Get('classrooms/:classroomId/students')
  @UseGuards(ClassroomOwnershipGuard)  // Verifica propiedad del aula
  async getClassroomStudents(
    @Param('classroomId') classroomId: string,
    @CurrentUser() teacher: User,
  ): Promise<StudentListDto[]> {
    return this.studentProgressService.getClassroomStudents(classroomId);
  }
}
```

#### 3.2.2 TeacherGuard

```typescript
// guards/teacher.guard.ts
@Injectable()
export class TeacherGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    // Verificar rol teacher o admin
    const hasTeacherRole = user.roles?.some(
      (role: UserRole) =>
        role.role?.name === 'teacher' || role.role?.name === 'admin'
    );

    return hasTeacherRole;
  }
}
```

#### 3.2.3 ClassroomOwnershipGuard

```typescript
// guards/classroom-ownership.guard.ts
@Injectable()
export class ClassroomOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(TeacherClassroom, 'social')
    private teacherClassroomRepo: Repository<TeacherClassroom>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const classroomId = request.params.classroomId;

    if (!classroomId || !user?.id) return false;

    // Verificar que el teacher tiene acceso al classroom
    const teacherClassroom = await this.teacherClassroomRepo.findOne({
      where: {
        teacher_id: user.id,
        classroom_id: classroomId,
      },
    });

    return !!teacherClassroom;
  }
}
```

#### 3.2.4 Service Layer Pattern

```typescript
// Pattern: Service con cache y multi-datasource

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(ModuleProgress, 'progress')
    private moduleProgressRepo: Repository<ModuleProgress>,
    @InjectRepository(ExerciseSubmission, 'progress')
    private submissionRepo: Repository<ExerciseSubmission>,
  ) {}

  async getClassroomAnalytics(classroomId: string): Promise<ClassroomAnalyticsDto> {
    // Intentar cache primero
    const cacheKey = `classroom:${classroomId}:analytics`;
    const cached = await this.cacheManager.get<ClassroomAnalyticsDto>(cacheKey);
    if (cached) return cached;

    // Calcular analytics
    const analytics = await this.calculateAnalytics(classroomId);

    // Guardar en cache (5 min TTL)
    await this.cacheManager.set(cacheKey, analytics, 300_000);

    return analytics;
  }
}
```

#### 3.2.5 CRON Jobs para Alertas

```typescript
// Pattern: Scheduled jobs para deteccion de riesgo

@Injectable()
export class StudentRiskAlertService {
  constructor(
    private readonly interventionAlertsService: InterventionAlertsService,
    private readonly mlPredictorService: MlPredictorService,
  ) {}

  @Cron('0 */6 * * *') // Cada 6 horas
  async checkStudentRisks(): Promise<void> {
    const students = await this.getActiveStudents();

    for (const student of students) {
      const riskLevel = await this.mlPredictorService.predictRisk(student.id);

      if (riskLevel === 'high') {
        await this.interventionAlertsService.createAlert({
          student_id: student.id,
          type: 'declining_trend',
          priority: 'high',
          message: `Estudiante ${student.name} muestra patron de riesgo`,
        });
      }
    }
  }
}
```

---

## 4. Buenas Practicas

### 4.1 Frontend

#### 4.1.1 PageShell Usage

```typescript
// DO: Use TeacherPageShell inside every page
import { TeacherPageShell } from '../components/shared/TeacherPageShell';

export default function TeacherSomePage() {
  return (
    <TeacherPageShell>
      {/* page content */}
    </TeacherPageShell>
  );
}

// DON'T: Use withTeacherLayout HOC (deprecated)
export default withTeacherLayout(TeacherSomePage);
```

#### 4.1.2 Hooks

```typescript
// DO: Hooks especificos por funcionalidad
export function useClassrooms() { ... }
export function useClassroomStudents(classroomId: string) { ... }
export function useCreateClassroom() { ... }

// DON'T: Un hook gigante que hace todo
export function useTeacher() { ... } // Evitar
```

#### 4.1.3 Types

```typescript
// DO: Types especificos y documentados
/**
 * Estado de un estudiante en el monitoreo
 * @see Backend: StudentMonitoringDto
 */
export type StudentStatus = 'active' | 'inactive' | 'offline';

// DO: Alineacion con backend
export interface Classroom {
  id: string;
  name: string;
  student_count: number; // Backend: current_students_count
  created_at: string;    // ISO string (JSON serialization)
}
```

#### 4.1.4 Queries

```typescript
// DO: Query keys descriptivas y anidadas
const { data } = useQuery({
  queryKey: ['teacher', 'classrooms', classroomId, 'students'],
  queryFn: () => api.getClassroomStudents(classroomId),
  enabled: !!classroomId,
});

// DO: Invalidar queries relacionadas en mutations
const { mutate } = useMutation({
  mutationFn: api.createAssignment,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
    queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
  },
});

// DO: Use useApiError for mutation error handling
const handleError = useApiError();
const { mutate } = useMutation({
  mutationFn: api.updateClassroom,
  onError: (error) => handleError(error, 'Error al actualizar aula'),
});
```

### 4.2 Backend

#### 4.2.1 Controllers

```typescript
// DO: Decoradores completos para Swagger
@Get('classrooms/:id')
@UseGuards(ClassroomOwnershipGuard)
@ApiOperation({ summary: 'Obtener detalle de aula' })
@ApiParam({ name: 'id', description: 'ID del classroom' })
@ApiOkResponse({ type: ClassroomDetailDto })
@ApiNotFoundResponse({ description: 'Aula no encontrada' })
async getClassroom(@Param('id') id: string): Promise<ClassroomDetailDto> {
  return this.classroomService.findById(id);
}
```

#### 4.2.2 Services

```typescript
// DO: Logging y error handling
@Injectable()
export class BonusCoinsService {
  private readonly logger = new Logger(BonusCoinsService.name);

  async grantBonus(teacherId: string, dto: GrantBonusDto): Promise<void> {
    this.logger.log(`Teacher ${teacherId} granting ${dto.amount} coins to ${dto.studentId}`);

    try {
      await this.mlCoinsService.addTransaction({
        user_id: dto.studentId,
        amount: dto.amount,
        type: 'teacher_bonus',
        description: dto.reason,
        granted_by: teacherId,
      });
    } catch (error) {
      this.logger.error(`Failed to grant bonus: ${error.message}`);
      throw new InternalServerErrorException('Error al otorgar bonificacion');
    }
  }
}
```

#### 4.2.3 DTOs

```typescript
// DO: Validacion completa con mensajes
export class GrantBonusDto {
  @ApiProperty({ description: 'ID del estudiante' })
  @IsUUID('4', { message: 'student_id debe ser UUID valido' })
  student_id!: string;

  @ApiProperty({ description: 'Cantidad de ML Coins', minimum: 1, maximum: 1000 })
  @IsNumber()
  @Min(1, { message: 'Minimo 1 ML Coin' })
  @Max(1000, { message: 'Maximo 1000 ML Coins' })
  amount!: number;

  @ApiPropertyOptional({ description: 'Razon de la bonificacion' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
```

---

## 5. APIs del Portal Teacher

### 5.1 Endpoints Principales

| Metodo | Endpoint | Descripcion | Guard |
|--------|----------|-------------|-------|
| GET | `/teacher/dashboard/stats` | Estadisticas del dashboard | TeacherGuard |
| GET | `/teacher/classrooms` | Lista de aulas del teacher | TeacherGuard |
| POST | `/teacher/classrooms` | Crear nueva aula | TeacherGuard |
| GET | `/teacher/classrooms/:id/students` | Estudiantes del aula | ClassroomOwnership |
| GET | `/teacher/classrooms/:id/progress` | Progreso del aula | ClassroomOwnership |
| GET | `/teacher/assignments` | Lista de tareas | TeacherGuard |
| POST | `/teacher/assignments` | Crear tarea | TeacherGuard |
| GET | `/teacher/alerts` | Alertas de intervencion | TeacherGuard |
| PATCH | `/teacher/alerts/:id/resolve` | Resolver alerta | TeacherGuard |
| GET | `/teacher/analytics/:classroomId` | Analytics del aula | ClassroomOwnership |
| POST | `/teacher/bonus-coins` | Otorgar bonificacion | TeacherGuard |
| GET | `/teacher/exercise-responses` | Respuestas de ejercicios | TeacherGuard |
| POST | `/teacher/grades/:submissionId` | Calificar submission | TeacherGuard |
| GET | `/teacher/messages` | Mensajes enviados | TeacherGuard |
| POST | `/teacher/messages` | Enviar mensaje | TeacherGuard |

### 5.2 Frontend API Services

```
services/api/teacher/
├── teacherApi.ts              # Dashboard y general
├── classroomsApi.ts           # CRUD de aulas
├── assignmentsApi.ts          # Gestion de tareas
├── studentProgressApi.ts      # Progreso estudiantes
├── analyticsApi.ts            # Analiticas
├── interventionAlertsApi.ts   # Alertas
├── alertConfigApi.ts          # Configuracion de alertas
├── gradingApi.ts              # Calificaciones
├── bonusCoinsApi.ts           # Bonificaciones
├── exerciseResponsesApi.ts    # Respuestas
├── teacherMessagesApi.ts      # Comunicacion
├── teacherContentApi.ts       # Contenido
└── index.ts                   # Barrel export
```

---

## 6. Seguridad

### 6.1 Autorizacion

1. **JwtAuthGuard:** Verifica token JWT valido
2. **TeacherGuard:** Verifica rol teacher/admin
3. **ClassroomOwnershipGuard:** Verifica acceso al aula especifica

### 6.2 Reglas de Acceso

```yaml
Teacher puede:
  - Ver/editar SOLO sus propias aulas
  - Ver estudiantes SOLO de sus aulas
  - Calificar submissions SOLO de sus aulas
  - Otorgar bonificaciones SOLO a estudiantes de sus aulas

Teacher NO puede:
  - Ver aulas de otros teachers
  - Acceder a datos de estudiantes fuera de sus aulas
  - Modificar configuracion del sistema
  - Crear/eliminar usuarios
```

### 6.3 Validacion de Datos

```typescript
// Siempre validar pertenencia antes de operaciones
async gradeSubmission(teacherId: string, submissionId: string, grade: number) {
  const submission = await this.getSubmission(submissionId);

  // Verificar que el submission pertenece a un aula del teacher
  const hasAccess = await this.verifyTeacherOwnership(
    teacherId,
    submission.classroom_id
  );

  if (!hasAccess) {
    throw new ForbiddenException('No tiene acceso a esta submission');
  }

  // Proceder con calificacion
}
```

---

## 7. Testing

### 7.1 Tests Unitarios Backend

```typescript
// teacher-classrooms.controller.spec.ts
describe('TeacherClassroomsController', () => {
  let controller: TeacherClassroomsController;
  let service: TeacherClassroomsCrudService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TeacherClassroomsController],
      providers: [
        { provide: TeacherClassroomsCrudService, useValue: mockService },
      ],
    }).compile();

    controller = module.get(TeacherClassroomsController);
  });

  it('should return classrooms for teacher', async () => {
    mockService.findByTeacher.mockResolvedValue([mockClassroom]);

    const result = await controller.getClassrooms(mockUser);

    expect(result).toHaveLength(1);
    expect(mockService.findByTeacher).toHaveBeenCalledWith(mockUser.id);
  });
});
```

### 7.2 Tests Frontend

```typescript
// useTeacherDashboard.test.ts
describe('useTeacherDashboard', () => {
  it('should fetch dashboard data', async () => {
    const { result } = renderHook(() => useTeacherDashboard(), {
      wrapper: QueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toBeDefined();
    expect(result.current.classrooms).toBeDefined();
  });
});
```

---

## 8. Checklist de Desarrollo

### 8.1 Nueva Pagina

- [ ] Crear archivo en `teacher/pages/TeacherXxx.tsx`
- [ ] Wrap content with `<TeacherPageShell>` (NOT withTeacherLayout)
- [ ] Create hook in `teacher/hooks/useXxx.ts` with React Query
- [ ] Add route in `App.tsx` with plain lazy import
- [ ] Add navigation item in `TeacherLayout.tsx` (if applicable)

### 8.2 Nueva Funcionalidad

- [ ] Definir tipos en `teacher/types/index.ts`
- [ ] Crear DTO en backend `teacher/dto/`
- [ ] Implementar service en `teacher/services/`
- [ ] Crear/modificar controller
- [ ] Agregar guards si necesario
- [ ] Crear API service en frontend `services/api/teacher/`
- [ ] Implementar hook con React Query en `teacher/hooks/`
- [ ] Crear componentes necesarios
- [ ] Integrar en pagina correspondiente con TeacherPageShell
- [ ] Agregar tests unitarios
- [ ] Documentar en Swagger (decoradores)

### 8.3 Code Review

- [ ] Guards aplicados correctamente
- [ ] Validacion de DTOs completa
- [ ] Error handling implementado (useApiError for mutations)
- [ ] Logs apropiados en services
- [ ] Types alineados frontend/backend
- [ ] Query keys descriptivas y en namespace `['teacher', ...]`
- [ ] Invalidacion de cache correcta
- [ ] TeacherPageShell used (NOT withTeacherLayout)

---

## 9. Troubleshooting

### 9.1 Problemas Comunes

| Problema | Causa | Solucion |
|----------|-------|----------|
| 403 Forbidden | Guard rechaza | Verificar rol y ownership |
| Data desactualizada | Cache | Invalidar queries manualmente o via React Query DevTools |
| Types mismatch | Desync FE/BE | Regenerar types con OpenAPI |
| Performance lenta | Queries N+1 | Usar relations en TypeORM |
| Page without layout | Missing PageShell | Wrap content with `<TeacherPageShell>` |
| Stale data after mutation | Missing invalidation | Add `invalidateQueries` in mutation `onSuccess` |

### 9.2 Debugging

```typescript
// React Query DevTools (development only)
// Visible in bottom-right corner of the app
// Shows all active queries, their status, and cached data

// Habilitar logs en development
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.request.use((config) => {
    console.log(`[Teacher API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });
}
```

---

## 10. Referencias

### Documentos Complementarios del Portal Teacher

| Documento | Descripcion |
|-----------|-------------|
| [PORTAL-TEACHER-API-REFERENCE.md](./PORTAL-TEACHER-API-REFERENCE.md) | Referencia completa de 45+ APIs con ejemplos |
| [PORTAL-TEACHER-FLOWS.md](./PORTAL-TEACHER-FLOWS.md) | Flujos de datos, diagramas e integracion |
| [../../30-ux-ui/flujos/teacher/FLUJO-REVISION-MANUAL-M3-M5.md](../../30-ux-ui/flujos/teacher/FLUJO-REVISION-MANUAL-M3-M5.md) | Flujo formal de revision manual y recompensas M3-M5 |
| [../../30-ux-ui/flujos/shared/FLUJO-PERFIL-CONFIGURACION.md](../../30-ux-ui/flujos/shared/FLUJO-PERFIL-CONFIGURACION.md) | Flujo de configuracion de perfil multi-portal |
| [40-api/README.md](../../40-api/README.md) | Documentacion de endpoints del modulo teacher |
| [TEACHER-PAGES-SPECIFICATIONS.md](../../50-guides/frontend/impl/teacher/pages/TEACHER-PAGES-SPECIFICATIONS.md) | Especificaciones de paginas del portal |
| [TEACHER-CONSTANTS-REFERENCE.md](../../50-guides/frontend/impl/teacher/constants/TEACHER-CONSTANTS-REFERENCE.md) | Referencia de constantes centralizadas |

### Architecture Decision Records

| ADR | Relevancia |
|-----|------------|
| [ADR-013: React Query Adoption](../../90-adr/ADR-013-react-query-adoption.md) | Data fetching pattern used by all hooks |
| [ADR-030: Convencion de Nombres](../../90-adr/ADR-030-convencion-nombres-paginas.md) | Page naming — "Page" suffix canonical (amended 2026-02-19; Teacher pages pending alignment) |
| [ADR-046: PageShell Pattern](../../90-adr/ADR-046-pageshell-pattern.md) | Layout wrapping pattern replacing HOC |

### Guias Generales

- [REACT-QUERY-MIGRATION-GUIDE.md](../../50-guides/REACT-QUERY-MIGRATION-GUIDE.md) - Guia de migracion a React Query
- [COMPONENT-PATTERNS.md](../../50-guides/frontend/impl/COMPONENT-PATTERNS.md) - Patrones de componentes
- [HOOK-PATTERNS.md](../../50-guides/frontend/impl/HOOK-PATTERNS.md) - Patrones de hooks
- [DTO-CONVENTIONS.md](../../50-guides/backend/impl/DTO-CONVENTIONS.md) - Convenciones de DTOs
- [ESTRUCTURA-MODULOS.md](../../50-guides/backend/impl/ESTRUCTURA-MODULOS.md) - Estructura de modulos
- [40-api/README.md](../../40-api/README.md) - Rutas API

---

## Changelog

| Version | Fecha | Cambios |
|---------|-------|---------|
| 2.0.0 | 2026-02-19 | Major update: Listed all 19 pages with descriptions and routes. Documented PageShell pattern (ADR-046) replacing withTeacherLayout HOC. Noted 4 removed-from-nav pages (Communication, Content, Notifications, NotificationPreferences). Updated hooks count to 26. Updated architecture section with TeacherPageShell in dependency diagram. Added React Query patterns and useApiError references. Added ADR references section. Updated checklists for new patterns |
| 1.3.0 | 2026-02-18 | ADR-030 implementation: Removed "Page" suffix from all page files (TeacherAlertsPage -> TeacherAlerts, etc.). Phase 7 SRP component extractions: settings/ directory with 5 components (SaveButton, ProfileSettingsSection, TeachingPreferencesSection, NotificationsSettingsSection, PrivacySettingsSection); RecentReportsTable extracted to reports/ |
| 1.2.0 | 2025-12-26 | Agregada carpeta constants/ (alertTypes.ts, manualReviewExercises.ts), referencias actualizadas |
| 1.1.0 | 2025-11-29 | Agregada TeacherSettingsPage (/teacher/settings) |
| 1.0.0 | 2025-11-29 | Creacion inicial |
