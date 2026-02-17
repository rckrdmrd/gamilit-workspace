# ET-PP-003: Portal Dashboard

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-PP-003 |
| **Modulo** | Parent Portal |
| **Titulo** | Dashboard del Portal de Padres |
| **Prioridad** | Media |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 35% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Estado de Implementacion

### Progreso General: 35%

| Componente | Estado | Completitud |
|------------|--------|-------------|
| ParentAccount Entity | COMPLETO | 100% |
| ParentStudentLink Entity | COMPLETO | 100% |
| ParentNotification Entity | COMPLETO | 100% |
| Parent Auth Flow | NO INICIADO | 0% |
| Dashboard API Endpoints | NO INICIADO | 0% |
| Dashboard Frontend | NO INICIADO | 0% |
| Progress Widgets | NO INICIADO | 0% |
| Achievement Display | NO INICIADO | 0% |
| Activity Timeline | NO INICIADO | 0% |
| Notification Center | NO INICIADO | 0% |

---

## Referencias

### Requerimiento Funcional
- RF-PP-002: Portal UI Dashboard

### User Stories
- [US-PP-002: Portal Dashboard](../user-stories/US-PP-002/US-PP-002-portal-dashboard.md)

### Dependencias
- EXT-010: Parent Notifications (ET-PAR-001)

---

## Descripcion Funcional

El Portal de Padres es una interfaz dedicada donde los padres/tutores pueden:
- Ver el progreso academico de sus hijos en tiempo real
- Revisar historial de actividades y logros
- Configurar alertas y preferencias de notificacion
- Descargar reportes de progreso
- Comunicarse con profesores (futuro)

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - (FALTANTE) ParentPortalApp                            |
|  - (FALTANTE) ParentDashboard                            |
|  - (FALTANTE) StudentProgressView                        |
|  - (FALTANTE) AchievementsGallery                        |
|  - (FALTANTE) ActivityTimeline                           |
|  - (FALTANTE) NotificationCenter                         |
|  - (FALTANTE) SettingsPage                               |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - (FALTANTE) ParentPortalController                     |
|  - (FALTANTE) ParentDashboardService                     |
|  - (FALTANTE) ParentAuthService                          |
|  - ParentNotificationsService (PARCIAL)                  |
+-----------------------------+----------------------------+
                              | TypeORM
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - auth_management.parent_accounts                       |
|  - auth_management.parent_student_links                  |
|  - auth_management.parent_notifications                  |
|  - progress_tracking.*                                    |
|  - gamification_system.*                                 |
+----------------------------------------------------------+
```

### Flujo de Acceso al Portal

```
Padre accede a /parent-portal
        |
        v
¿Tiene sesion activa?
  ├── NO → Mostrar ParentLoginPage
  │           - Login con email + password
  │           - O login con access code
  │
  └── SI → ParentDashboard
              |
              v
        Cargar datos de hijos vinculados
              |
              v
        Mostrar dashboard con widgets:
          - Student Selector (si multiples)
          - Progress Overview
          - Recent Activity
          - Achievements
          - Alerts
          - Quick Actions
```

---

## Implementacion Existente

### Data Model Completo

Las entidades base estan completamente implementadas:

**ParentAccount:**
- Configuracion de cuenta del padre
- Preferencias de notificacion
- Widgets del dashboard
- Estado de verificacion

**ParentStudentLink:**
- Vinculacion padre-estudiante
- Permisos granulares (ver progreso, ver calificaciones, etc.)
- Estado del vinculo
- Verificacion del vinculo

**ParentNotification:**
- Tipos de notificacion
- Estado de envio/lectura
- Multiples canales (email, in-app, push)
- Prioridad

---

## Lo que Falta para Completar (65%)

### 1. ParentAuthService (10% de lo faltante)

```typescript
// services/parent-auth.service.ts (NUEVO)
@Injectable()
export class ParentAuthService {
  constructor(
    private readonly parentAccountsRepo: Repository<ParentAccount>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Login con email y password
   */
  async login(email: string, password: string): Promise<ParentLoginResult>;

  /**
   * Login con codigo de acceso (para primer acceso)
   */
  async loginWithAccessCode(accessCode: string): Promise<ParentLoginResult>;

  /**
   * Genera codigo de acceso para nuevo padre
   */
  async generateAccessCode(
    parentAccountId: string,
    expiresInHours: number = 48
  ): Promise<string>;

  /**
   * Envia codigo de acceso por email
   */
  async sendAccessCode(parentEmail: string): Promise<void>;

  /**
   * Verifica vinculo padre-estudiante
   */
  async verifyStudentLink(
    parentAccountId: string,
    studentId: string,
    verificationCode: string
  ): Promise<boolean>;

  /**
   * Valida JWT del padre
   */
  async validateParentToken(token: string): Promise<ParentAccount>;

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair>;
}

interface ParentLoginResult {
  parentAccount: ParentAccount;
  linkedStudents: StudentInfo[];
  tokens: TokenPair;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

### 2. ParentDashboardService (15% de lo faltante)

```typescript
// services/parent-dashboard.service.ts (NUEVO)
@Injectable()
export class ParentDashboardService {
  constructor(
    private readonly parentStudentLinksRepo: Repository<ParentStudentLink>,
    private readonly progressService: ProgressService,
    private readonly gamificationService: GamificationService,
    private readonly exerciseService: ExerciseService,
  ) {}

  /**
   * Obtiene datos completos del dashboard
   */
  async getDashboardData(
    parentAccountId: string,
    studentId?: string // Si tiene multiples hijos
  ): Promise<DashboardData>;

  /**
   * Obtiene lista de estudiantes vinculados
   */
  async getLinkedStudents(parentAccountId: string): Promise<StudentInfo[]>;

  /**
   * Obtiene resumen de progreso de un estudiante
   */
  async getProgressSummary(
    parentAccountId: string,
    studentId: string
  ): Promise<ProgressSummary>;

  /**
   * Obtiene actividad reciente
   */
  async getRecentActivity(
    parentAccountId: string,
    studentId: string,
    limit: number = 20
  ): Promise<ActivityEntry[]>;

  /**
   * Obtiene logros del estudiante
   */
  async getStudentAchievements(
    parentAccountId: string,
    studentId: string
  ): Promise<AchievementInfo[]>;

  /**
   * Obtiene alertas activas
   */
  async getActiveAlerts(
    parentAccountId: string,
    studentId: string
  ): Promise<Alert[]>;

  /**
   * Obtiene estadisticas de uso
   */
  async getUsageStats(
    parentAccountId: string,
    studentId: string,
    period: 'week' | 'month' | 'all'
  ): Promise<UsageStats>;

  /**
   * Valida que el padre tiene permiso para ver datos del estudiante
   */
  private async validateAccess(
    parentAccountId: string,
    studentId: string,
    permission: string
  ): Promise<void>;
}

interface DashboardData {
  student: StudentInfo;
  progressSummary: ProgressSummary;
  recentActivity: ActivityEntry[];
  achievements: AchievementInfo[];
  alerts: Alert[];
  usageStats: UsageStats;
  notifications: NotificationSummary;
}

interface StudentInfo {
  id: string;
  displayName: string;
  avatarUrl: string;
  grade: string;
  classroom: string;
  lastActiveAt: Date;
}

interface ProgressSummary {
  overallProgress: number; // 0-100%
  currentModule: {
    id: string;
    title: string;
    progress: number;
  };
  completedModules: number;
  totalModules: number;
  averageScore: number;
  currentRank: RankInfo;
  xpTotal: number;
  coinsTotal: number;
}

interface ActivityEntry {
  id: string;
  type: 'exercise_completed' | 'achievement_unlocked' | 'level_up' | 'session_start' | 'session_end';
  title: string;
  description: string;
  timestamp: Date;
  data: Record<string, any>;
}

interface UsageStats {
  totalTimeMinutes: number;
  sessionsCount: number;
  averageSessionMinutes: number;
  activeDays: number;
  exercisesCompleted: number;
  byDay: {
    date: string;
    minutes: number;
    exercises: number;
  }[];
}
```

### 3. ParentPortalController (10% de lo faltante)

```typescript
// controllers/parent-portal.controller.ts (NUEVO)
@Controller('parent-portal')
export class ParentPortalController {

  /**
   * POST /parent-portal/auth/login
   * Login de padre
   */
  @Post('auth/login')
  @Public()
  async login(@Body() dto: ParentLoginDto): Promise<ParentLoginResult>;

  /**
   * POST /parent-portal/auth/access-code
   * Login con codigo de acceso
   */
  @Post('auth/access-code')
  @Public()
  async loginWithAccessCode(@Body() dto: AccessCodeLoginDto): Promise<ParentLoginResult>;

  /**
   * GET /parent-portal/dashboard
   * Obtiene datos del dashboard
   */
  @Get('dashboard')
  @UseGuards(ParentAuthGuard)
  async getDashboard(
    @ParentAccount() parent: ParentAccount,
    @Query('studentId') studentId?: string
  ): Promise<DashboardData>;

  /**
   * GET /parent-portal/students
   * Lista estudiantes vinculados
   */
  @Get('students')
  @UseGuards(ParentAuthGuard)
  async getStudents(@ParentAccount() parent: ParentAccount): Promise<StudentInfo[]>;

  /**
   * GET /parent-portal/students/:id/progress
   * Progreso detallado de un estudiante
   */
  @Get('students/:id/progress')
  @UseGuards(ParentAuthGuard)
  async getStudentProgress(
    @ParentAccount() parent: ParentAccount,
    @Param('id') studentId: string
  ): Promise<ProgressDetail>;

  /**
   * GET /parent-portal/students/:id/activity
   * Actividad reciente
   */
  @Get('students/:id/activity')
  @UseGuards(ParentAuthGuard)
  async getStudentActivity(
    @ParentAccount() parent: ParentAccount,
    @Param('id') studentId: string,
    @Query('limit') limit: number = 20
  ): Promise<ActivityEntry[]>;

  /**
   * GET /parent-portal/students/:id/achievements
   * Logros del estudiante
   */
  @Get('students/:id/achievements')
  @UseGuards(ParentAuthGuard)
  async getStudentAchievements(
    @ParentAccount() parent: ParentAccount,
    @Param('id') studentId: string
  ): Promise<AchievementInfo[]>;

  /**
   * GET /parent-portal/notifications
   * Notificaciones del padre
   */
  @Get('notifications')
  @UseGuards(ParentAuthGuard)
  async getNotifications(
    @ParentAccount() parent: ParentAccount,
    @Query('unreadOnly') unreadOnly: boolean = false
  ): Promise<ParentNotification[]>;

  /**
   * PATCH /parent-portal/notifications/:id/read
   * Marcar notificacion como leida
   */
  @Patch('notifications/:id/read')
  @UseGuards(ParentAuthGuard)
  async markNotificationRead(
    @ParentAccount() parent: ParentAccount,
    @Param('id') notificationId: string
  ): Promise<void>;

  /**
   * GET /parent-portal/settings
   * Obtener preferencias
   */
  @Get('settings')
  @UseGuards(ParentAuthGuard)
  async getSettings(@ParentAccount() parent: ParentAccount): Promise<ParentSettings>;

  /**
   * PATCH /parent-portal/settings
   * Actualizar preferencias
   */
  @Patch('settings')
  @UseGuards(ParentAuthGuard)
  async updateSettings(
    @ParentAccount() parent: ParentAccount,
    @Body() dto: UpdateParentSettingsDto
  ): Promise<ParentSettings>;
}
```

### 4. Frontend - Parent Portal App (25% de lo faltante)

**Estructura de Paginas:**

```
apps/frontend/src/apps/parent/
├── ParentPortalApp.tsx          # Entry point
├── routes.tsx                   # Rutas del portal
├── layouts/
│   └── ParentLayout.tsx         # Layout con sidebar
├── pages/
│   ├── ParentLoginPage.tsx      # Login
│   ├── ParentDashboardPage.tsx  # Dashboard principal
│   ├── StudentProgressPage.tsx  # Progreso detallado
│   ├── AchievementsPage.tsx     # Galeria de logros
│   ├── ActivityPage.tsx         # Historial de actividad
│   ├── NotificationsPage.tsx    # Centro de notificaciones
│   └── SettingsPage.tsx         # Preferencias
├── components/
│   ├── StudentSelector.tsx      # Selector de hijo
│   ├── ProgressCard.tsx         # Card de progreso
│   ├── ActivityTimeline.tsx     # Timeline de actividad
│   ├── AchievementBadge.tsx     # Badge de logro
│   ├── AlertBanner.tsx          # Banner de alertas
│   ├── UsageChart.tsx           # Grafico de uso
│   └── ModuleProgressBar.tsx    # Barra de progreso
└── hooks/
    ├── useParentAuth.ts         # Auth del padre
    ├── useDashboard.ts          # Datos del dashboard
    └── useStudentData.ts        # Datos del estudiante
```

**Dashboard Layout:**
```tsx
// pages/ParentDashboardPage.tsx (NUEVO)
const ParentDashboardPage: React.FC = () => {
  const { dashboard, isLoading } = useDashboard();
  const { selectedStudent, setSelectedStudent } = useStudentSelector();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <DashboardLayout>
      {/* Header con selector de estudiante */}
      <DashboardHeader>
        <StudentSelector
          students={dashboard.linkedStudents}
          selected={selectedStudent}
          onSelect={setSelectedStudent}
        />
        <NotificationBell count={dashboard.unreadNotifications} />
      </DashboardHeader>

      {/* Alertas si las hay */}
      {dashboard.alerts.length > 0 && (
        <AlertsSection alerts={dashboard.alerts} />
      )}

      {/* Grid de widgets */}
      <WidgetGrid>
        {/* Progress Overview */}
        <ProgressOverviewWidget
          progress={dashboard.progressSummary}
        />

        {/* Current Module */}
        <CurrentModuleWidget
          module={dashboard.progressSummary.currentModule}
        />

        {/* Usage Stats */}
        <UsageStatsWidget
          stats={dashboard.usageStats}
        />

        {/* Recent Achievements */}
        <RecentAchievementsWidget
          achievements={dashboard.achievements.slice(0, 4)}
        />

        {/* Activity Timeline */}
        <ActivityTimelineWidget
          activities={dashboard.recentActivity.slice(0, 5)}
        />

        {/* Rank & XP */}
        <RankWidget
          rank={dashboard.progressSummary.currentRank}
          xp={dashboard.progressSummary.xpTotal}
        />
      </WidgetGrid>
    </DashboardLayout>
  );
};
```

### 5. Hooks y State Management (5% de lo faltante)

```typescript
// hooks/useParentAuth.ts (NUEVO)
interface UseParentAuthReturn {
  parent: ParentAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithCode: (code: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

export function useParentAuth(): UseParentAuthReturn;

// hooks/useDashboard.ts (NUEVO)
interface UseDashboardReturn {
  dashboard: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string) => void;
}

export function useDashboard(): UseDashboardReturn;

// hooks/useStudentData.ts (NUEVO)
interface UseStudentDataReturn {
  progress: ProgressDetail | null;
  activity: ActivityEntry[];
  achievements: AchievementInfo[];
  isLoading: boolean;
  error: string | null;
}

export function useStudentData(studentId: string): UseStudentDataReturn;
```

---

## API REST Endpoints

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| POST | `/parent-portal/auth/login` | Login email/password | No |
| POST | `/parent-portal/auth/access-code` | Login con codigo | No |
| POST | `/parent-portal/auth/refresh` | Refresh token | No |
| GET | `/parent-portal/dashboard` | Dashboard completo | Parent |
| GET | `/parent-portal/students` | Estudiantes vinculados | Parent |
| GET | `/parent-portal/students/:id/progress` | Progreso detallado | Parent |
| GET | `/parent-portal/students/:id/activity` | Actividad reciente | Parent |
| GET | `/parent-portal/students/:id/achievements` | Logros | Parent |
| GET | `/parent-portal/notifications` | Notificaciones | Parent |
| PATCH | `/parent-portal/notifications/:id/read` | Marcar leida | Parent |
| GET | `/parent-portal/settings` | Preferencias | Parent |
| PATCH | `/parent-portal/settings` | Actualizar prefs | Parent |
| GET | `/parent-portal/reports` | Historial reportes | Parent |
| GET | `/parent-portal/reports/:id/download` | Descargar PDF | Parent |

---

## Criterios de Aceptacion

### Funcionales
- [ ] Padre puede loguearse con email/password
- [ ] Padre puede loguearse con codigo de acceso unico
- [ ] Dashboard muestra resumen de progreso
- [ ] Padre puede ver actividad reciente
- [ ] Padre puede ver logros desbloqueados
- [ ] Padre recibe alertas de bajo rendimiento
- [ ] Padre puede configurar preferencias de notificacion
- [ ] Soporta multiples hijos vinculados
- [ ] Padre solo ve datos de sus hijos vinculados

### No Funcionales
- [ ] Dashboard carga en < 2 segundos
- [ ] UI responsive (mobile-first)
- [ ] Soporta modo oscuro
- [ ] Accesibilidad WCAG 2.1 AA

### Seguridad
- [ ] JWT con expiracion corta (15 min)
- [ ] Refresh token con rotacion
- [ ] Validacion de vinculo padre-estudiante
- [ ] Rate limiting en login
- [ ] Audit log de accesos

---

## Dependencias

### Bloqueado Por
- ParentAccount Entity (COMPLETO)
- ParentStudentLink Entity (COMPLETO)
- ParentNotification Entity (COMPLETO)
- Progress Tracking Module (EXISTENTE)
- Gamification Module (EXISTENTE)

### Bloquea
- Parent-Teacher Communication
- Parent Mobile App
- Family Analytics

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| ParentAuthService | 6h |
| ParentDashboardService | 8h |
| ParentPortalController | 6h |
| Frontend Pages | 16h |
| Frontend Components | 12h |
| Hooks & State | 4h |
| Tests | 6h |
| **Total** | **58h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-PAR-002-portal-dashboard.md*
*Generado: 2026-01-27*
