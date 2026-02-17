# Portal Teacher - Flujos de Datos e Integracion

**Fecha de creacion:** 2025-11-29
**Version:** 1.0.0
**Estado:** VIGENTE
**Complementa:** PORTAL-TEACHER-GUIDE.md, PORTAL-TEACHER-API-REFERENCE.md

**Normalizacion de flujos UX/UI:**  
- [Flujo revision manual M3-M5](../../30-ux-ui/flujos/teacher/FLUJO-REVISION-MANUAL-M3-M5.md)  
- [Matriz de trazabilidad global](../../30-ux-ui/flujos/TRACEABILITY-MATRIX.md)

---

## 1. Flujos de Datos Principales

### 1.1 Flujo: Dashboard Load

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TEACHER DASHBOARD LOAD                           │
└─────────────────────────────────────────────────────────────────────────┘

Usuario navega a /teacher
        │
        ▼
┌───────────────────┐
│ TeacherDashboard  │
│     Page          │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐     ┌─────────────────────────────────────────────┐
│useTeacherDashboard│────►│ Lanza 5 queries en paralelo:                │
└────────┬──────────┘     │  1. GET /teacher/dashboard/stats            │
         │                │  2. GET /teacher/dashboard/activities       │
         │                │  3. GET /teacher/dashboard/alerts           │
         │                │  4. GET /teacher/dashboard/top-performers   │
         │                │  5. GET /teacher/classrooms?limit=5         │
         │                └─────────────────────────────────────────────┘
         ▼
┌───────────────────┐
│   API Client      │
│   (teacherApi)    │
└────────┬──────────┘
         │ HTTP GET x5 (paralelo)
         ▼
┌───────────────────────────────────────────────────────────────────────┐
│                          BACKEND                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────┐                                                   │
│  │TeacherController│                                                   │
│  └────────┬────────┘                                                   │
│           │                                                            │
│           ▼                                                            │
│  ┌─────────────────────┐                                               │
│  │TeacherDashboard     │                                               │
│  │    Service          │                                               │
│  └────────┬────────────┘                                               │
│           │                                                            │
│           ├──────► ClassroomMember Repository (social schema)         │
│           ├──────► ModuleProgress Repository (progress schema)        │
│           ├──────► ExerciseSubmission Repository (progress schema)    │
│           ├──────► StudentInterventionAlert Repository                │
│           └──────► UserStats Repository (gamification schema)         │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌───────────────────┐
│  React Query      │
│    Cache          │
│  (5 min stale)    │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Render Dashboard │
│   Components      │
└───────────────────┘
```

### 1.2 Flujo: Grading Submission

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GRADING SUBMISSION FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

Teacher clickea "Calificar" en submission
        │
        ▼
┌───────────────────┐
│GradeSubmissionModal│
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   useGrading()    │
│   .gradeSubmission│
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  POST /teacher/   │
│  submissions/:id/ │
│  feedback         │
└────────┬──────────┘
         │
         ▼
┌───────────────────────────────────────────────────────────────────────┐
│                          BACKEND                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────┐                                                   │
│  │TeacherController│                                                   │
│  └────────┬────────┘                                                   │
│           │                                                            │
│           ▼                                                            │
│  ┌─────────────────┐                                                   │
│  │ GradingService  │                                                   │
│  └────────┬────────┘                                                   │
│           │                                                            │
│           ├──────► 1. Validar ownership del classroom                 │
│           │                                                            │
│           ├──────► 2. Actualizar ExerciseSubmission                   │
│           │           - status = 'graded'                              │
│           │           - final_score = score                            │
│           │           - feedback = feedback                            │
│           │           - graded_at = NOW()                              │
│           │                                                            │
│           ├──────► 3. Calcular XP a otorgar                           │
│           │           - Base XP por completar                          │
│           │           - Bonus por score                                │
│           │           - Bonus del teacher                              │
│           │                                                            │
│           └──────► 4. Llamar GamificationModule                       │
│                       │                                                │
│                       ▼                                                │
│              ┌──────────────────┐                                      │
│              │UserStatsService  │                                      │
│              └────────┬─────────┘                                      │
│                       │                                                │
│                       ├──► Actualizar total_xp                        │
│                       ├──► Verificar level up                         │
│                       ├──► Verificar achievements                     │
│                       └──► Emitir eventos                             │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    EVENT EMISSION                                │   │
│  │                                                                  │   │
│  │  EventEmitter.emit('submission.graded', {                       │   │
│  │    submissionId, studentId, score, xpAwarded                    │   │
│  │  })                                                              │   │
│  │                                                                  │   │
│  │  EventEmitter.emit('xp.awarded', {                              │   │
│  │    userId, amount, source: 'grading'                            │   │
│  │  })                                                              │   │
│  │                                                                  │   │
│  │  EventEmitter.emit('achievement.check', {                       │   │
│  │    userId, trigger: 'grading'                                   │   │
│  │  })                                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌───────────────────┐
│ Invalidar queries │
│ - submissions     │
│ - dashboard stats │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Toast success +   │
│ Modal close       │
└───────────────────┘
```

### 1.3 Flujo: Intervention Alert Creation (CRON)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INTERVENTION ALERT DETECTION                          │
└─────────────────────────────────────────────────────────────────────────┘

CRON Job (cada 6 horas)
        │
        ▼
┌─────────────────────────┐
│StudentRiskAlertService  │
│    @Cron('0 */6 * * *') │
└────────┬────────────────┘
         │
         ▼
┌───────────────────────────────────────────────────────────────────────┐
│                          ANALYSIS                                      │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  1. Query todos los estudiantes activos                               │
│     └──► ClassroomMember.findAll({ status: 'active' })                │
│                                                                        │
│  2. Por cada estudiante, analizar:                                    │
│     │                                                                  │
│     ├──► Inactividad (no login en X dias)                             │
│     │    SELECT MAX(last_activity_at) FROM user_sessions              │
│     │                                                                  │
│     ├──► Tendencia de desempeno                                       │
│     │    SELECT AVG(score) FROM exercise_submissions                  │
│     │    WHERE submitted_at > NOW() - INTERVAL '14 days'              │
│     │    vs                                                            │
│     │    SELECT AVG(score) FROM exercise_submissions                  │
│     │    WHERE submitted_at BETWEEN NOW() - INTERVAL '28 days'        │
│     │                       AND NOW() - INTERVAL '14 days'            │
│     │                                                                  │
│     ├──► Patron de errores                                            │
│     │    Multiples intentos fallidos en mismo ejercicio               │
│     │                                                                  │
│     └──► ML Predictor (opcional)                                      │
│          MlPredictorService.predictRisk(studentId)                    │
│                                                                        │
│  3. Si riesgo detectado:                                              │
│     │                                                                  │
│     ▼                                                                  │
│  ┌─────────────────────────┐                                           │
│  │InterventionAlertsService│                                           │
│  │    .createAlert()       │                                           │
│  └────────┬────────────────┘                                           │
│           │                                                            │
│           ├──► INSERT INTO student_intervention_alerts                │
│           │                                                            │
│           └──► NotificationService.notify({                           │
│                  channel: 'push',                                      │
│                  recipient: teacher_id,                                │
│                  template: 'student_at_risk',                          │
│                  data: { student_name, risk_type }                    │
│                })                                                      │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌───────────────────┐
│ WebSocket emit    │
│'teacher:new_alert'│
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Frontend recibe   │
│ evento y muestra  │
│ notificacion      │
└───────────────────┘
```

### 1.4 Flujo: Grant Bonus Coins

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GRANT BONUS COINS                                │
└─────────────────────────────────────────────────────────────────────────┘

Teacher otorga bonus
        │
        ▼
┌───────────────────┐
│ GrantBonusModal   │
│ amount: 100       │
│ reason: "..."     │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ useGrantBonus()   │
│ .mutate()         │
└────────┬──────────┘
         │
         ▼
POST /teacher/students/:id/bonus
         │
         ▼
┌───────────────────────────────────────────────────────────────────────┐
│                          BACKEND                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────┐                                                   │
│  │TeacherController│                                                   │
│  └────────┬────────┘                                                   │
│           │                                                            │
│           ▼                                                            │
│  ┌─────────────────┐                                                   │
│  │BonusCoinsService│                                                   │
│  └────────┬────────┘                                                   │
│           │                                                            │
│           ├──► 1. Verificar que teacher tiene acceso al estudiante    │
│           │       - Query TeacherClassroom JOIN ClassroomMember       │
│           │                                                            │
│           ├──► 2. Validar limites                                     │
│           │       - Max 1000 coins por transaccion                    │
│           │       - Max 5000 coins por dia por teacher                │
│           │                                                            │
│           └──► 3. Ejecutar transaccion                                │
│                   │                                                    │
│                   ▼                                                    │
│           ┌─────────────────┐                                          │
│           │ MlCoinsService  │                                          │
│           └────────┬────────┘                                          │
│                    │                                                   │
│                    ├──► INSERT INTO ml_coins_transactions {           │
│                    │        user_id, amount, type: 'teacher_bonus',   │
│                    │        description, granted_by                   │
│                    │    }                                              │
│                    │                                                   │
│                    └──► UPDATE user_stats SET                         │
│                            ml_coins_balance = ml_coins_balance + 100  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    NOTIFICATION                                  │   │
│  │                                                                  │   │
│  │  NotificationService.send({                                     │   │
│  │    userId: studentId,                                           │   │
│  │    type: 'bonus_received',                                      │   │
│  │    title: 'Recibiste ML Coins!',                               │   │
│  │    message: 'Tu profesor te otorgo 100 ML Coins',              │   │
│  │    data: { amount, reason, teacher_name }                       │   │
│  │  })                                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌───────────────────┐
│ Response:         │
│ { success: true,  │
│   new_balance }   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Invalidar:        │
│ - student economy │
│ - analytics       │
└───────────────────┘
```

---

## 2. Integracion con Otros Modulos

### 2.1 Diagrama de Integracion

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TEACHER MODULE INTEGRATIONS                           │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │  AUTH MODULE    │
                              │                 │
                              │ - JwtAuthGuard  │
                              │ - RolesGuard    │
                              │ - User entity   │
                              └────────┬────────┘
                                       │ Autenticacion
                                       ▼
┌─────────────┐              ┌─────────────────┐              ┌─────────────┐
│   SOCIAL    │◄────────────►│  TEACHER MODULE │◄────────────►│ GAMIFICATION│
│   MODULE    │  Classrooms  │                 │  XP, Coins   │    MODULE   │
│             │  Students    │                 │  Achievements│             │
│- Classroom  │  Members     │ - Dashboard     │  Ranks       │- UserStats  │
│- Members    │              │ - Progress      │              │- MlCoins    │
│- Teams      │              │ - Grading       │              │- Achievements│
└─────────────┘              │ - Analytics     │              └─────────────┘
                             │ - Alerts        │
                             │ - Reports       │
┌─────────────┐              │ - Bonus         │              ┌─────────────┐
│  PROGRESS   │◄────────────►│                 │◄────────────►│NOTIFICATIONS│
│   MODULE    │  Submissions │                 │  Alerts      │    MODULE   │
│             │  Attempts    │                 │  Messages    │             │
│- ModuleProg │  Sessions    │                 │              │- Send       │
│- Submissions│              │                 │              │- Templates  │
│- Attempts   │              │                 │              │- Queue      │
└─────────────┘              └─────────────────┘              └─────────────┘
                                       │
                                       │ Exercises
                                       ▼
                             ┌─────────────────┐
                             │  EDUCATIONAL    │
                             │    MODULE       │
                             │                 │
                             │ - Modules       │
                             │ - Exercises     │
                             │ - Mechanics     │
                             └─────────────────┘
```

### 2.2 Dependencias por Servicio

#### TeacherDashboardService

```typescript
@Injectable()
export class TeacherDashboardService {
  constructor(
    // Social Module - Classrooms y miembros
    @InjectRepository(Classroom, 'social')
    private classroomRepo: Repository<Classroom>,
    @InjectRepository(ClassroomMember, 'social')
    private memberRepo: Repository<ClassroomMember>,
    @InjectRepository(TeacherClassroom, 'social')
    private teacherClassroomRepo: Repository<TeacherClassroom>,

    // Progress Module - Progreso y submissions
    @InjectRepository(ModuleProgress, 'progress')
    private progressRepo: Repository<ModuleProgress>,
    @InjectRepository(ExerciseSubmission, 'progress')
    private submissionRepo: Repository<ExerciseSubmission>,

    // Gamification Module - Stats
    @InjectRepository(UserStats, 'gamification')
    private statsRepo: Repository<UserStats>,

    // Internal - Alertas
    @InjectRepository(StudentInterventionAlert)
    private alertRepo: Repository<StudentInterventionAlert>,
  ) {}
}
```

#### AnalyticsService

```typescript
@Injectable()
export class AnalyticsService {
  constructor(
    // Cache para analytics pesados
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    // Progress Module
    @InjectRepository(ModuleProgress, 'progress')
    private progressRepo: Repository<ModuleProgress>,
    @InjectRepository(ExerciseSubmission, 'progress')
    private submissionRepo: Repository<ExerciseSubmission>,
    @InjectRepository(LearningSession, 'progress')
    private sessionRepo: Repository<LearningSession>,

    // Gamification Module
    @InjectRepository(UserStats, 'gamification')
    private statsRepo: Repository<UserStats>,
    @InjectRepository(UserAchievement, 'gamification')
    private achievementRepo: Repository<UserAchievement>,
    @InjectRepository(MlCoinsTransaction, 'gamification')
    private transactionRepo: Repository<MlCoinsTransaction>,

    // ML Predictions
    private mlPredictorService: MlPredictorService,
  ) {}
}
```

#### BonusCoinsService

```typescript
@Injectable()
export class BonusCoinsService {
  constructor(
    // Social - Verificar acceso
    @InjectRepository(TeacherClassroom, 'social')
    private teacherClassroomRepo: Repository<TeacherClassroom>,
    @InjectRepository(ClassroomMember, 'social')
    private memberRepo: Repository<ClassroomMember>,

    // Gamification - Otorgar coins
    private mlCoinsService: MlCoinsService,

    // Notifications
    private notificationService: NotificationService,
  ) {}
}
```

### 2.3 Eventos Entre Modulos

```typescript
// Eventos que Teacher Module EMITE
@Injectable()
export class GradingService {
  constructor(private eventEmitter: EventEmitter2) {}

  async submitFeedback(submissionId: string, dto: SubmitFeedbackDto) {
    // ... logica de grading

    // Emitir evento para otros modulos
    this.eventEmitter.emit('submission.graded', {
      submissionId,
      studentId,
      classroomId,
      score: dto.score,
      xpAwarded,
    });
  }
}

// Eventos que Teacher Module ESCUCHA
@Injectable()
export class StudentRiskAlertService {
  @OnEvent('student.inactive')
  async handleStudentInactive(payload: StudentInactiveEvent) {
    // Crear alerta de inactividad
    await this.createAlert({
      student_id: payload.studentId,
      type: 'inactivity',
      message: `Sin actividad por ${payload.days} dias`,
    });
  }

  @OnEvent('submission.failed_multiple')
  async handleMultipleFailures(payload: MultipleFailuresEvent) {
    // Crear alerta de dificultad
    await this.createAlert({
      student_id: payload.studentId,
      type: 'struggling',
      message: `Dificultad en ${payload.exerciseName}`,
    });
  }
}
```

### 2.4 Queries Cross-Module

```typescript
// Query que cruza multiples schemas
async getStudentProgressWithGamification(studentId: string) {
  // 1. Progress schema
  const moduleProgress = await this.progressRepo
    .createQueryBuilder('mp')
    .where('mp.user_id = :studentId', { studentId })
    .getMany();

  // 2. Gamification schema
  const userStats = await this.statsRepo.findOne({
    where: { user_id: studentId },
  });

  const achievements = await this.achievementRepo.find({
    where: { user_id: studentId },
    relations: ['achievement'],
  });

  // 3. Combinar resultados
  return {
    progress: moduleProgress,
    gamification: {
      totalXp: userStats.total_xp,
      level: userStats.level,
      mayaRank: userStats.maya_rank,
      mlCoinsBalance: userStats.ml_coins_balance,
      achievements: achievements.map(ua => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        unlockedAt: ua.unlocked_at,
      })),
    },
  };
}
```

---

## 3. Cache Strategy

### 3.1 Datos Cacheados

| Dato | TTL | Invalidacion |
|------|-----|--------------|
| Dashboard stats | 60s | submission.graded, alert.created |
| Classroom list | 5min | classroom.updated |
| Student progress | 2min | submission.graded |
| Analytics | 5min | Manual o cada hora |
| Economy stats | 5min | coins.transaction |

### 3.2 Implementacion

```typescript
// Cache en backend
@Injectable()
export class AnalyticsService {
  async getClassroomAnalytics(classroomId: string) {
    const cacheKey = `analytics:classroom:${classroomId}`;

    // Intentar cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // Calcular
    const analytics = await this.calculateAnalytics(classroomId);

    // Guardar en cache
    await this.cacheManager.set(cacheKey, analytics, 300_000); // 5 min

    return analytics;
  }
}

// Cache en frontend (React Query)
const { data } = useQuery({
  queryKey: ['teacher', 'analytics', 'classroom', classroomId],
  queryFn: () => analyticsApi.getClassroomAnalytics(classroomId),
  staleTime: 5 * 60 * 1000,      // 5 min stale
  gcTime: 30 * 60 * 1000,        // 30 min en cache
});
```

---

## 4. Seguridad y Validacion

### 4.1 Flujo de Autorizacion

```
Request llega
       │
       ▼
┌─────────────────┐
│  JwtAuthGuard   │────► Verifica token JWT valido
└────────┬────────┘      - Extrae user del token
         │               - Agrega user a request
         ▼
┌─────────────────┐
│   RolesGuard    │────► Verifica rol del usuario
└────────┬────────┘      - Chequea @Roles() decorator
         │               - admin_teacher o super_admin
         ▼
┌─────────────────┐
│  TeacherGuard   │────► Verifica acceso teacher
└────────┬────────┘      - Usuario tiene rol teacher
         │               - O es super_admin
         ▼
┌─────────────────┐
│ClassroomOwner   │────► Verifica propiedad (si aplica)
│     Guard       │      - Query teacher_classrooms
└────────┬────────┘      - teacher_id + classroom_id
         │
         ▼
     Controller
```

### 4.2 Validacion en Capas

```typescript
// 1. DTO Validation (Entrada)
export class GrantBonusDto {
  @IsNumber()
  @Min(1, { message: 'Minimo 1 ML Coin' })
  @Max(1000, { message: 'Maximo 1000 ML Coins por transaccion' })
  amount!: number;

  @IsString()
  @MinLength(10, { message: 'Razon debe tener al menos 10 caracteres' })
  @MaxLength(500)
  reason!: string;
}

// 2. Service Validation (Negocio)
async grantBonus(teacherId: string, studentId: string, dto: GrantBonusDto) {
  // Verificar acceso
  const hasAccess = await this.verifyTeacherHasAccessToStudent(teacherId, studentId);
  if (!hasAccess) {
    throw new ForbiddenException('No tienes acceso a este estudiante');
  }

  // Verificar limite diario
  const todayTotal = await this.getTodayBonusTotal(teacherId);
  if (todayTotal + dto.amount > 5000) {
    throw new BadRequestException('Limite diario de 5000 ML Coins alcanzado');
  }

  // Proceder
  return this.mlCoinsService.addTransaction(/*...*/);
}

// 3. Entity Validation (Datos)
@Entity('student_intervention_alerts')
export class StudentInterventionAlert {
  @Column({
    type: 'enum',
    enum: ['inactivity', 'declining_trend', 'struggling', 'at_risk'],
  })
  type!: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  severity!: string;
}
```

---

## 5. Manejo de Errores

### 5.1 Error Handling Pattern

```typescript
// Service con error handling
@Injectable()
export class StudentProgressService {
  async getStudentProgress(studentId: string) {
    try {
      const student = await this.userRepo.findOne({ where: { id: studentId } });

      if (!student) {
        throw new NotFoundException(`Estudiante ${studentId} no encontrado`);
      }

      const progress = await this.progressRepo.find({
        where: { user_id: studentId },
      });

      return this.mapToDto(student, progress);

    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw HTTP exceptions
      }

      this.logger.error(`Error getting progress for ${studentId}`, error.stack);
      throw new InternalServerErrorException('Error al obtener progreso');
    }
  }
}

// Frontend error handling
export function useStudentProgress(studentId: string) {
  return useQuery({
    queryKey: ['teacher', 'students', studentId, 'progress'],
    queryFn: () => studentProgressApi.getProgress(studentId),
    retry: (failureCount, error) => {
      // No retry en 4xx
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      if (error.response?.status === 404) {
        toast.error('Estudiante no encontrado');
      } else {
        toast.error('Error al cargar progreso');
      }
    },
  });
}
```

---

## Changelog

| Version | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2025-11-29 | Creacion inicial |
