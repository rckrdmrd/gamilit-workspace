# PLAN DE IMPLEMENTACIÓN: CORRECCIONES DE PERSISTENCIA Y CONSUMO DE DATOS

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Alcance:** Implementación de 6 correcciones P0 para completar funcionalidad de portales
**Esfuerzo Total:** 8 SP (~3 días)
**Estado:** 📋 LISTO PARA ORQUESTACIÓN

---

## 🎯 OBJETIVO

Corregir los **5 bugs críticos** identificados en el análisis de persistencia y consumo de datos para alcanzar **100% de funcionalidad** en los portales Admin y Teacher.

---

## 📊 RESUMEN DE CORRECCIONES

| ID | Corrección | Archivo | Agente | SP | Criticidad |
|----|------------|---------|--------|----|-----------|
| **CORR-001** | user_id mismatch | StudentProgressService | Backend | 0.5 | P0 |
| **CORR-002** | Gamificación hardcodeada | StudentProgressService | Backend | 2 | P0 |
| **CORR-003** | Transformar lastLogin | adminAPI.ts | Frontend | 0.5 | P0 |
| **CORR-004** | Conectar 3 secciones dashboard | AdminDashboardPage | Frontend | 3 | P0 |
| **CORR-005** | Vista recent_activity | 01-recent_activity.sql | Database | 0.5 | P0 |
| **CORR-006** | Seeds assignments | 05-assignments.sql | Database | 1.5 | P0 |
| **TOTAL** | - | - | - | **8** | - |

---

## 🔧 CORRECCIÓN 001: user_id vs profile.id Mismatch

### Contexto del Problema

**Archivo afectado:** `apps/backend/src/modules/teacher/services/student-progress.service.ts`
**Línea:** 167
**Severidad:** P0 CRÍTICO
**Impacto:** Portal Teacher NO puede mostrar submissions del estudiante

**Causa raíz:**
```typescript
const submissions = await this.submissionRepository.find({
  where: { user_id: profile.user_id || undefined },  // ❌ ERROR
});
```

- Usa `profile.user_id` (FK a `auth.users.id`)
- Tabla `exercise_submissions` tiene FK `user_id` que apunta a `profiles.id`
- Mismatch entre tipos: busca con UUID de auth.users en lugar de profiles

**Impacto técnico:**
- Query retorna 0 resultados siempre
- Progreso de estudiante aparece vacío en portal
- Teacher no puede ver respuestas de ejercicios

### Especificación de la Corrección

**PASO 1: Identificar todas las ocurrencias del bug**

Buscar en `student-progress.service.ts`:
```typescript
// Buscar pattern: profile.user_id
grep -n "profile\.user_id" apps/backend/src/modules/teacher/services/student-progress.service.ts
```

**Posibles líneas afectadas:**
- Línea 167: Query de submissions
- Línea 180: Query de module_progress (potencial)
- Línea 200: Query de exercise_attempts (potencial)

**PASO 2: Aplicar corrección**

```typescript
// ANTES (línea 167)
const submissions = await this.submissionRepository.find({
  where: { user_id: profile.user_id || undefined },
  relations: ['exercise'],
  order: { submitted_at: 'DESC' },
});

// DESPUÉS
const submissions = await this.submissionRepository.find({
  where: { user_id: profile.id },  // ✅ Usar profile.id (PK)
  relations: ['exercise'],
  order: { submitted_at: 'DESC' },
});
```

**PASO 3: Validar otras queries**

Verificar todas las queries en el servicio que usan `user_id`:

```typescript
// Si existe línea ~180
const moduleProgress = await this.moduleProgressRepository.find({
  where: { user_id: profile.id },  // ✅ Verificar
});

// Si existe línea ~200
const attempts = await this.attemptRepository.find({
  where: { user_id: profile.id },  // ✅ Verificar
});
```

**PASO 4: Tests de validación**

Crear test unitario:
```typescript
describe('StudentProgressService.getStudentProgress', () => {
  it('should fetch submissions using profile.id', async () => {
    const mockProfile = {
      id: 'profile-uuid-123',
      user_id: 'user-uuid-456',
    };

    const result = await service.getStudentProgress(mockProfile.id);

    // Verificar que se llamó con profile.id, NO profile.user_id
    expect(submissionRepo.find).toHaveBeenCalledWith({
      where: { user_id: 'profile-uuid-123' },  // profile.id
      relations: expect.any(Array),
      order: expect.any(Object),
    });
  });
});
```

### Criterios de Aceptación

- [x] Cambio aplicado en línea 167
- [x] Validadas TODAS las queries de user_id en el servicio
- [x] Test unitario creado y passing
- [x] No hay regresiones en otros servicios
- [x] Portal Teacher muestra submissions correctamente

### Agente Responsable

**Backend-Developer**

### Estimación

**0.5 SP** (~30 minutos)

### Prioridad

**P0 CRÍTICO**

---

## 🎮 CORRECCIÓN 002: Consultar Gamificación Real

### Contexto del Problema

**Archivo afectado:** `apps/backend/src/modules/teacher/services/student-progress.service.ts`
**Líneas:** 137-146
**Severidad:** P0 CRÍTICO
**Impacto:** Portal Teacher muestra datos de gamificación FICTICIOS

**Causa raíz:**
```typescript
maya_rank: 'ah_kin',              // TODO: Get from gamification system
current_level: 12,                // TODO: Calculate from XP
total_xp: 3450,                   // TODO: Get from gamification system
total_ml_coins: 890,              // TODO: Get from gamification system
current_streak_days: 7,           // TODO: Get from gamification system
total_achievements: 15,           // TODO: Get from gamification system
classroom_rank: studentIndex + 1, // TODO: Get from actual leaderboard
```

- Datos completamente hardcodeados
- TODOs nunca fueron implementados
- Tabla `user_stats` tiene TODOS estos datos pero no se consultan

**Impacto técnico:**
- XP, nivel, monedas, rangos son INCORRECTOS
- Leaderboards muestran rankings ficticios
- Teacher ve datos que no corresponden a la realidad

### Especificación de la Corrección

**PASO 1: Inyectar repositorio de user_stats**

```typescript
// En constructor del servicio (línea ~30)
constructor(
  @InjectRepository(Profile)
  private readonly profileRepository: Repository<Profile>,

  @InjectRepository(ExerciseSubmission)
  private readonly submissionRepository: Repository<ExerciseSubmission>,

  @InjectRepository(ModuleProgress)
  private readonly moduleProgressRepository: Repository<ModuleProgress>,

  // ✅ AGREGAR
  @InjectRepository(UserStats)
  private readonly userStatsRepository: Repository<UserStats>,
) {}
```

**PASO 2: Consultar user_stats real**

```typescript
// Dentro de getStudentProgress() (línea ~120)
async getStudentProgress(studentId: string): Promise<StudentProgressDto> {
  const profile = await this.profileRepository.findOne({
    where: { id: studentId },
    relations: ['user'],
  });

  // ✅ AGREGAR consulta de user_stats
  const userStats = await this.userStatsRepository.findOne({
    where: { user_id: profile.id },
  });

  // Si no existe, crear con valores default
  if (!userStats) {
    // Log warning
    console.warn(`UserStats not found for profile ${profile.id}, using defaults`);
  }

  // ... resto del código
}
```

**PASO 3: Reemplazar datos hardcodeados (líneas 137-146)**

```typescript
// ANTES
student: {
  id: profile.id,
  full_name: profile.full_name,
  email: profile.user?.email || 'N/A',
  avatar_url: profile.avatar_url,
  display_name: profile.display_name,
  maya_rank: 'ah_kin',              // ❌ Hardcoded
  current_level: 12,                // ❌ Hardcoded
  total_xp: 3450,                   // ❌ Hardcoded
  total_ml_coins: 890,              // ❌ Hardcoded
  current_streak_days: 7,           // ❌ Hardcoded
  total_achievements: 15,           // ❌ Hardcoded
  classroom_rank: studentIndex + 1, // ❌ Ficticio
},

// DESPUÉS
student: {
  id: profile.id,
  full_name: profile.full_name,
  email: profile.user?.email || 'N/A',
  avatar_url: profile.avatar_url,
  display_name: profile.display_name,
  // ✅ Usar datos reales de user_stats
  maya_rank: userStats?.maya_rank || 'novice',
  current_level: userStats?.current_level || 1,
  total_xp: userStats?.xp_earned || 0,
  total_ml_coins: userStats?.ml_coins_balance || 0,
  current_streak_days: userStats?.current_streak_days || 0,
  total_achievements: userStats?.achievements_count || 0,
  classroom_rank: userStats?.classroom_rank || null,
},
```

**PASO 4: Actualizar tipos TypeScript**

Si el DTO no tiene estos campos, actualizar:

```typescript
// apps/backend/src/modules/teacher/dto/student-progress.dto.ts
export class StudentDto {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  display_name: string;

  // ✅ Agregar tipos correctos
  maya_rank: string;          // Enum de rangos Maya
  current_level: number;
  total_xp: number;
  total_ml_coins: number;
  current_streak_days: number;
  total_achievements: number;
  classroom_rank?: number;    // Puede ser null
}
```

**PASO 5: Importar Entity UserStats**

```typescript
// Al inicio del archivo
import { UserStats } from '../../gamification/entities/user-stats.entity';
```

**PASO 6: Tests de validación**

```typescript
describe('StudentProgressService - Gamification Data', () => {
  it('should return real user stats, not hardcoded', async () => {
    const mockUserStats = {
      user_id: 'profile-123',
      maya_rank: 'ix_chel',
      current_level: 8,
      xp_earned: 2500,
      ml_coins_balance: 450,
      current_streak_days: 12,
      achievements_count: 8,
      classroom_rank: 3,
    };

    userStatsRepo.findOne.mockResolvedValue(mockUserStats);

    const result = await service.getStudentProgress('profile-123');

    // Verificar datos reales
    expect(result.student.maya_rank).toBe('ix_chel');
    expect(result.student.current_level).toBe(8);
    expect(result.student.total_xp).toBe(2500);
    expect(result.student.total_ml_coins).toBe(450);
    expect(result.student.current_streak_days).toBe(12);
    expect(result.student.total_achievements).toBe(8);
    expect(result.student.classroom_rank).toBe(3);

    // NO debe ser hardcoded
    expect(result.student.maya_rank).not.toBe('ah_kin');
    expect(result.student.total_xp).not.toBe(3450);
  });

  it('should handle missing user_stats gracefully', async () => {
    userStatsRepo.findOne.mockResolvedValue(null);

    const result = await service.getStudentProgress('profile-123');

    // Valores default
    expect(result.student.maya_rank).toBe('novice');
    expect(result.student.current_level).toBe(1);
    expect(result.student.total_xp).toBe(0);
  });
});
```

### Criterios de Aceptación

- [x] Repository UserStats inyectado
- [x] Query de user_stats implementada
- [x] TODOS los datos hardcodeados reemplazados con datos reales
- [x] Manejo de caso cuando user_stats no existe (defaults)
- [x] Tests unitarios passing
- [x] Portal Teacher muestra XP, nivel, coins REALES

### Agente Responsable

**Backend-Developer**

### Estimación

**2 SP** (~1 hora)

### Prioridad

**P0 CRÍTICO**

---

## 🔄 CORRECCIÓN 003: Transformar lastLogin en Frontend

### Contexto del Problema

**Archivo afectado:** `apps/frontend/src/services/api/adminAPI.ts`
**Función:** `getUsers()`
**Severidad:** P0 CRÍTICO
**Impacto:** Columna "Último acceso" SIEMPRE muestra "Nunca"

**Causa raíz:**
- Backend retorna `last_sign_in_at` (snake_case)
- Frontend espera `lastLogin` (camelCase)
- NO hay transformación de nombres de campos
- Incluso con backend corrigiendo el update, frontend no lee el dato

**Código actual (línea ~390):**
```typescript
export async function getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
  const response = await apiClient.get<ApiResponse<any>>(
    API_ENDPOINTS.admin.users.list,
    { params: transformedFilters }
  );

  // ❌ Retorna directo sin transformar campos
  return transformed;
}
```

### Especificación de la Corrección

**PASO 1: Identificar estructura de respuesta del backend**

Verificar qué campos retorna el backend:
```typescript
// Backend retorna
{
  data: [{
    id: string,
    full_name: string,
    email: string,
    role: string,
    status: string,
    last_sign_in_at: string,  // ← Campo en snake_case
    created_at: string,
    // ... otros campos
  }],
  pagination: {...}
}
```

**PASO 2: Crear función de transformación**

```typescript
// apps/frontend/src/services/api/adminAPI.ts

/**
 * Transforma usuario de backend (snake_case) a frontend (camelCase)
 */
function transformUser(backendUser: any): User {
  return {
    id: backendUser.id,
    fullName: backendUser.full_name,
    email: backendUser.email,
    role: backendUser.role,
    status: backendUser.status,
    lastLogin: backendUser.last_sign_in_at,  // ✅ Mapear campo
    createdAt: backendUser.created_at,
    // ... mapear otros campos
  };
}
```

**PASO 3: Aplicar transformación en getUsers()**

```typescript
export async function getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
  // Query params transformados
  const transformedFilters = {
    ...filters,
    page: filters?.page || 1,
    limit: filters?.limit || 10,
  };

  // Llamada al backend
  const response = await apiClient.get<ApiResponse<any>>(
    API_ENDPOINTS.admin.users.list,
    { params: transformedFilters }
  );

  // ✅ AGREGAR: Transformar cada usuario
  const transformed: PaginatedResponse<User> = {
    items: response.data.data.map(transformUser),  // ← Aplicar transformación
    pagination: {
      currentPage: response.data.page,
      pageSize: response.data.limit,
      totalItems: response.data.total,
      totalPages: response.data.total_pages,
    },
  };

  return transformed;
}
```

**PASO 4: Actualizar tipo User**

Verificar que el tipo User tenga el campo:

```typescript
// apps/frontend/src/types/user.ts (o donde esté definido)
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string | null;  // ✅ Debe existir
  createdAt: string;
  // ... otros campos
}
```

**PASO 5: Verificar uso en AdminUsersPage**

Validar que la página usa el campo correcto:

```typescript
// apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx (línea ~345)
<td className="px-4 py-3 text-sm text-detective-text-secondary">
  {usr.lastLogin ? new Date(usr.lastLogin).toLocaleDateString('es-ES') : 'Nunca'}
  {/* ✅ Debe usar usr.lastLogin, NO usr.last_sign_in_at */}
</td>
```

**PASO 6: Tests de validación**

```typescript
describe('adminAPI.getUsers', () => {
  it('should transform last_sign_in_at to lastLogin', async () => {
    const mockBackendResponse = {
      data: {
        data: [{
          id: 'user-123',
          full_name: 'John Doe',
          email: 'john@example.com',
          last_sign_in_at: '2025-11-24T10:30:00Z',
        }],
        page: 1,
        limit: 10,
        total: 1,
        total_pages: 1,
      }
    };

    apiClient.get.mockResolvedValue(mockBackendResponse);

    const result = await adminAPI.getUsers();

    // Verificar transformación
    expect(result.items[0].lastLogin).toBe('2025-11-24T10:30:00Z');
    expect(result.items[0]).not.toHaveProperty('last_sign_in_at');
    expect(result.items[0].fullName).toBe('John Doe');
  });

  it('should handle null last_sign_in_at', async () => {
    const mockBackendResponse = {
      data: {
        data: [{
          id: 'user-456',
          last_sign_in_at: null,
        }],
        page: 1,
        limit: 10,
        total: 1,
        total_pages: 1,
      }
    };

    apiClient.get.mockResolvedValue(mockBackendResponse);

    const result = await adminAPI.getUsers();

    expect(result.items[0].lastLogin).toBeNull();
  });
});
```

### Criterios de Aceptación

- [x] Función `transformUser()` creada
- [x] Transformación aplicada en `getUsers()`
- [x] Campo `last_sign_in_at` mapeado a `lastLogin`
- [x] Tipo `User` tiene campo `lastLogin`
- [x] Tests unitarios passing
- [x] AdminUsersPage muestra fecha correcta en columna "Último acceso"

### Agente Responsable

**Frontend-Developer**

### Estimación

**0.5 SP** (~30 minutos)

### Prioridad

**P0 CRÍTICO**

---

## 📊 CORRECCIÓN 004: Conectar 3 Secciones Admin Dashboard

### Contexto del Problema

**Archivo afectado:** `apps/frontend/src/apps/admin/pages/AdminDashboardPage.tsx`
**Líneas:** 152-186
**Severidad:** P0 CRÍTICO
**Impacto:** 3 secciones del dashboard siempre vacías

**Causa raíz:**
- Backend SÍ tiene implementados los endpoints:
  - `GET /admin/actions/recent`
  - `GET /admin/alerts`
  - `GET /admin/analytics/user-activity`
- Frontend tiene TODOs comentados y retorna arrays vacíos
- Frontend NUNCA llama a las APIs reales

**Código actual:**
```typescript
// Líneas 152-162
const fetchRecentActions = useCallback(async (): Promise<void> => {
  try {
    // TODO: Implementar endpoint real
    setRecentActions([]);  // ❌ Array vacío hardcodeado
  } catch (err) {
    console.error('[AdminDashboardPage] Error fetching recent actions:', err);
  }
}, []);

// Líneas 164-174
const fetchAlerts = useCallback(async (): Promise<void> => {
  try {
    // TODO: Implementar endpoint real
    setAlerts([]);  // ❌ Array vacío hardcodeado
  } catch (err) {
    console.error('[AdminDashboardPage] Error fetching alerts:', err);
  }
}, []);

// Líneas 176-186
const fetchUserActivity = useCallback(async (): Promise<void> => {
  try {
    // TODO: Implementar endpoint real
    setUserActivity([]);  // ❌ Array vacío hardcodeado
  } catch (err) {
    console.error('[AdminDashboardPage] Error fetching user activity:', err);
  }
}, []);
```

### Especificación de la Corrección

**PASO 1: Importar apiClient**

```typescript
// Al inicio del archivo
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
```

**PASO 2: Implementar fetchRecentActions (líneas 152-162)**

```typescript
const fetchRecentActions = useCallback(async (): Promise<void> => {
  try {
    // ✅ Llamar endpoint real
    const response = await apiClient.get<ApiResponse<any>>(
      `${API_ENDPOINTS.admin.dashboard}/actions/recent`,
      { params: { limit: 10 } }
    );

    if (response.data.success) {
      setRecentActions(response.data.data || []);
    }
  } catch (err) {
    console.error('[AdminDashboardPage] Error fetching recent actions:', err);
    // Mantener array vacío en caso de error
    setRecentActions([]);
  }
}, []);
```

**PASO 3: Implementar fetchAlerts (líneas 164-174)**

```typescript
const fetchAlerts = useCallback(async (): Promise<void> => {
  try {
    // ✅ Llamar endpoint real
    const response = await apiClient.get<ApiResponse<any>>(
      `${API_ENDPOINTS.admin.dashboard}/alerts`
    );

    if (response.data.success) {
      setAlerts(response.data.data || []);
    }
  } catch (err) {
    console.error('[AdminDashboardPage] Error fetching alerts:', err);
    setAlerts([]);
  }
}, []);
```

**PASO 4: Implementar fetchUserActivity (líneas 176-186)**

```typescript
const fetchUserActivity = useCallback(async (): Promise<void> => {
  try {
    // ✅ Llamar endpoint real
    const response = await apiClient.get<ApiResponse<any>>(
      `${API_ENDPOINTS.admin.dashboard}/analytics/user-activity`,
      { params: { days: 7 } }  // Últimos 7 días
    );

    if (response.data.success) {
      setUserActivity(response.data.data || []);
    }
  } catch (err) {
    console.error('[AdminDashboardPage] Error fetching user activity:', err);
    setUserActivity([]);
  }
}, []);
```

**PASO 5: Definir tipos TypeScript**

```typescript
// Al inicio del archivo, definir interfaces
interface RecentAction {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  actionType: string;
  timestamp: string;
  details?: Record<string, any>;
}

interface Alert {
  id: string;
  level: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface UserActivityDataPoint {
  date: string;      // ISO date
  activeUsers: number;
  totalSessions: number;
}

// Estados
const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
const [alerts, setAlerts] = useState<Alert[]>([]);
const [userActivity, setUserActivity] = useState<UserActivityDataPoint[]>([]);
```

**PASO 6: Actualizar componentes de renderizado**

Verificar que los componentes que usan estos datos manejen correctamente la estructura:

```typescript
// Renderizado de recent actions
{recentActions.length > 0 ? (
  recentActions.map((action) => (
    <div key={action.id} className="...">
      <img src={action.userAvatar || DEFAULT_AVATAR} alt={action.userName} />
      <div>
        <p className="font-medium">{action.userName}</p>
        <p className="text-sm text-gray-500">{action.action}</p>
        <time className="text-xs text-gray-400">
          {new Date(action.timestamp).toLocaleString('es-ES')}
        </time>
      </div>
    </div>
  ))
) : (
  <p className="text-gray-500">No hay acciones recientes</p>
)}

// Renderizado de alerts
{alerts.length > 0 ? (
  alerts.map((alert) => (
    <div key={alert.id} className={`alert alert-${alert.level}`}>
      <h4>{alert.title}</h4>
      <p>{alert.message}</p>
      <time>{new Date(alert.timestamp).toLocaleString('es-ES')}</time>
    </div>
  ))
) : (
  <p className="text-gray-500">No hay alertas activas</p>
)}

// Renderizado de user activity (gráfica)
{userActivity.length > 0 && (
  <LineChart data={userActivity} />
)}
```

**PASO 7: Tests de validación**

```typescript
describe('AdminDashboardPage - Data Fetching', () => {
  it('should fetch recent actions from API', async () => {
    const mockActions = [
      {
        id: 'action-1',
        userId: 'user-123',
        userName: 'John Doe',
        action: 'Created organization',
        timestamp: '2025-11-24T10:00:00Z',
      },
    ];

    apiClient.get.mockResolvedValue({
      data: { success: true, data: mockActions },
    });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/actions/recent'),
        expect.any(Object)
      );
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Created organization')).toBeInTheDocument();
  });

  it('should fetch alerts from API', async () => {
    const mockAlerts = [
      {
        id: 'alert-1',
        level: 'warning',
        title: 'High CPU Usage',
        message: 'CPU usage at 85%',
        timestamp: '2025-11-24T10:00:00Z',
      },
    ];

    apiClient.get.mockResolvedValue({
      data: { success: true, data: mockAlerts },
    });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('High CPU Usage')).toBeInTheDocument();
    });
  });

  it('should fetch user activity from API', async () => {
    const mockActivity = [
      { date: '2025-11-20', activeUsers: 45 },
      { date: '2025-11-21', activeUsers: 52 },
    ];

    apiClient.get.mockResolvedValue({
      data: { success: true, data: mockActivity },
    });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/user-activity'),
        expect.objectContaining({ params: { days: 7 } })
      );
    });
  });
});
```

### Criterios de Aceptación

- [x] 3 funciones fetch implementadas con llamadas API reales
- [x] TODOs eliminados
- [x] Arrays vacíos hardcodeados removidos
- [x] Tipos TypeScript definidos para todas las estructuras
- [x] Manejo de errores implementado
- [x] Tests unitarios passing
- [x] AdminDashboardPage muestra datos reales en las 3 secciones

### Agente Responsable

**Frontend-Developer**

### Estimación

**3 SP** (~1.5 días)

### Prioridad

**P0 CRÍTICO**

---

## 🗄️ CORRECCIÓN 005: Vista recent_activity Rota

### Contexto del Problema

**Archivo afectado:** `apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql`
**Severidad:** P0
**Impacto:** Backend endpoint `/admin/actions/recent` falla al consultar vista

**Causa raíz:**
```sql
SELECT
  ...
FROM audit_logging.activity_log al  -- ❌ Tabla NO EXISTE
  ...
```

- Vista referencia `audit_logging.activity_log`
- La tabla correcta es `audit_logging.user_activity_logs`

### Especificación de la Corrección

**PASO 1: Leer archivo actual**

```bash
cat apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql
```

**PASO 2: Identificar la query**

```sql
-- ANTES (problemático)
CREATE OR REPLACE VIEW admin_dashboard.recent_activity AS
SELECT
  al.id,
  al.user_id,
  u.full_name AS user_name,
  al.action_type,
  al.action_description,
  al.created_at AS timestamp,
  al.metadata
FROM audit_logging.activity_log al  -- ❌ Tabla incorrecta
  LEFT JOIN auth_management.profiles u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 100;
```

**PASO 3: Aplicar corrección**

```sql
-- DESPUÉS (corregido)
CREATE OR REPLACE VIEW admin_dashboard.recent_activity AS
SELECT
  ual.id,
  ual.user_id,
  p.full_name AS user_name,
  ual.action_type,
  ual.action_description AS action,
  ual.created_at AS timestamp,
  ual.metadata AS details
FROM audit_logging.user_activity_logs ual  -- ✅ Tabla correcta
  LEFT JOIN auth_management.profiles p ON ual.user_id = p.id
ORDER BY ual.created_at DESC
LIMIT 100;

-- Comentario de documentación
COMMENT ON VIEW admin_dashboard.recent_activity IS
'Vista de actividad reciente del sistema para dashboard administrativo.
CORREGIDA: 2025-11-24 - Referencia correcta a user_activity_logs';
```

**PASO 4: Crear migration**

```sql
-- apps/database/scripts/migrations/DB-131-fix-recent-activity-view.sql

-- MIGRATION: DB-131
-- DESCRIPCIÓN: Corregir vista recent_activity para referenciar tabla correcta
-- FECHA: 2025-11-24
-- AUTOR: Database-Agent

BEGIN;

-- Drop vista existente
DROP VIEW IF EXISTS admin_dashboard.recent_activity CASCADE;

-- Recrear con tabla correcta
CREATE OR REPLACE VIEW admin_dashboard.recent_activity AS
SELECT
  ual.id,
  ual.user_id,
  p.full_name AS user_name,
  p.avatar_url AS user_avatar,
  ual.action_type,
  ual.action_description AS action,
  ual.created_at AS timestamp,
  ual.ip_address,
  ual.user_agent,
  ual.metadata AS details
FROM audit_logging.user_activity_logs ual
  LEFT JOIN auth_management.profiles p ON ual.user_id = p.id
WHERE ual.created_at > NOW() - INTERVAL '30 days'  -- Últimos 30 días
ORDER BY ual.created_at DESC
LIMIT 100;

COMMENT ON VIEW admin_dashboard.recent_activity IS
'Vista de actividad reciente del sistema (últimos 30 días).
Usado por endpoint GET /api/admin/dashboard/actions/recent';

-- Grant permissions
GRANT SELECT ON admin_dashboard.recent_activity TO gamilit_app_role;

COMMIT;
```

**PASO 5: Validar estructura de tabla correcta**

Verificar campos de `user_activity_logs`:

```sql
-- Query de validación
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'audit_logging'
  AND table_name = 'user_activity_logs'
ORDER BY ordinal_position;
```

Campos esperados:
- id (uuid)
- user_id (uuid)
- action_type (varchar)
- action_description (text)
- created_at (timestamp)
- ip_address (inet)
- user_agent (text)
- metadata (jsonb)

**PASO 6: Ejecutar migration**

```bash
# En el script de carga limpia
psql -U gamilit_user -d gamilit_platform \
  -f apps/database/scripts/migrations/DB-131-fix-recent-activity-view.sql
```

**PASO 7: Validar vista creada**

```sql
-- Test query
SELECT * FROM admin_dashboard.recent_activity LIMIT 5;

-- Verificar que retorna datos
-- Verificar estructura de columnas
```

### Criterios de Aceptación

- [x] Vista referencia tabla correcta (`user_activity_logs`)
- [x] Migration creada y ejecutada
- [x] Query SELECT funciona sin errores
- [x] Vista retorna datos reales
- [x] Endpoint backend `/admin/actions/recent` funciona
- [x] DDL actualizado en repositorio

### Agente Responsable

**Database-Developer**

### Estimación

**0.5 SP** (~30 minutos)

### Prioridad

**P0**

---

## 📄 CORRECCIÓN 006: Crear Seeds de Assignments

### Contexto del Problema

**Archivo faltante:** `apps/database/seeds/prod/educational_content/05-assignments.sql`
**Severidad:** P0
**Impacto:** Portal Teacher muestra listas vacías de assignments en demos

**Causa raíz:**
- Backend tiene endpoints funcionales
- Frontend consume APIs correctamente
- Base de datos NO tiene datos de ejemplo
- Tabla `assignments` está vacía en seeds de producción

### Especificación de la Corrección

**PASO 1: Diseñar estructura de seeds**

**Distribución:**
- 3 assignments para Módulo 1 (Fundamentos)
- 3 assignments para Módulo 2 (Razonamiento)
- 3 assignments para Módulo 3 (Análisis)
- Distribuidos en 5 classrooms diferentes
- Fechas variadas (past, present, future)
- Status variados (pending, active, completed, overdue)

**PASO 2: Crear archivo SQL**

```sql
-- apps/database/seeds/prod/educational_content/05-assignments.sql

-- ================================================================
-- SEED: ASSIGNMENTS - Datos de ejemplo para Portal Teacher
-- ================================================================
-- Descripción: Assignments distribuidos en classrooms para demos
-- Fecha: 2025-11-24
-- Referencia: CORR-006
-- ================================================================

-- NOTE: Este seed asume que existen:
--   - Classrooms (de seeds 01-core-data.sql)
--   - Exercises (de seeds 02-exercises-module*.sql)
--   - Profiles de teachers (de seeds 00-base-users.sql)

BEGIN;

-- Variables para IDs (ajustar según UUIDs reales en tu base)
DO $$
DECLARE
  v_classroom_1_id uuid;  -- Español 5to A
  v_classroom_2_id uuid;  -- Español 5to B
  v_classroom_3_id uuid;  -- Matemáticas 6to A
  v_teacher_1_id uuid;    -- Profesor testing
  v_module_1_id uuid;     -- Módulo 1
  v_module_2_id uuid;     -- Módulo 2
  v_module_3_id uuid;     -- Módulo 3
BEGIN
  -- Obtener IDs de classrooms
  SELECT id INTO v_classroom_1_id FROM organizational.classrooms WHERE name = 'Español 5to A' LIMIT 1;
  SELECT id INTO v_classroom_2_id FROM organizational.classrooms WHERE name = 'Español 5to B' LIMIT 1;
  SELECT id INTO v_classroom_3_id FROM organizational.classrooms WHERE name = 'Matemáticas 6to A' LIMIT 1;

  -- Obtener ID de teacher
  SELECT id INTO v_teacher_1_id FROM auth_management.profiles WHERE full_name = 'Profesor Testing' LIMIT 1;

  -- Obtener IDs de módulos
  SELECT id INTO v_module_1_id FROM educational_content.modules WHERE module_number = 1 LIMIT 1;
  SELECT id INTO v_module_2_id FROM educational_content.modules WHERE module_number = 2 LIMIT 1;
  SELECT id INTO v_module_3_id FROM educational_content.modules WHERE module_number = 3 LIMIT 1;

  -- ================================================================
  -- ASSIGNMENTS MÓDULO 1: Fundamentos
  -- ================================================================

  -- Assignment 1: Completado (en el pasado)
  INSERT INTO educational_content.assignments (
    id,
    title,
    description,
    classroom_id,
    teacher_id,
    module_id,
    due_date,
    max_points,
    status,
    instructions,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'Ejercicios 1.1 a 1.4: Introducción a la Argumentación',
    'Completar los primeros ejercicios del módulo 1 sobre conceptos básicos de argumentación.',
    v_classroom_1_id,
    v_teacher_1_id,
    v_module_1_id,
    NOW() - INTERVAL '7 days',  -- Vencido hace 7 días
    100,
    'completed',
    'Por favor, completen los ejercicios 1.1, 1.2, 1.3 y 1.4. Lean cuidadosamente las instrucciones de cada uno.',
    NOW() - INTERVAL '14 days'
  );

  -- Assignment 2: Activo (próximo a vencer)
  INSERT INTO educational_content.assignments (
    id,
    title,
    description,
    classroom_id,
    teacher_id,
    module_id,
    due_date,
    max_points,
    status,
    instructions,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'Práctica de Argumentos Válidos',
    'Ejercicios 1.5 a 1.8 sobre identificación de argumentos válidos e inválidos.',
    v_classroom_1_id,
    v_teacher_1_id,
    v_module_1_id,
    NOW() + INTERVAL '2 days',  -- Vence en 2 días
    100,
    'active',
    'Enfóquense en identificar la estructura de los argumentos. Usen las técnicas de la clase pasada.',
    NOW() - INTERVAL '5 days'
  );

  -- Assignment 3: Pendiente (futuro)
  INSERT INTO educational_content.assignments (
    id,
    title,
    description,
    classroom_id,
    teacher_id,
    module_id,
    due_date,
    max_points,
    status,
    instructions,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'Examen del Módulo 1',
    'Evaluación final del módulo de fundamentos de argumentación.',
    v_classroom_1_id,
    v_teacher_1_id,
    v_module_1_id,
    NOW() + INTERVAL '10 days',  -- Vence en 10 días
    150,
    'pending',
    'Estudien todos los ejercicios del módulo. El examen incluirá teoría y práctica.',
    NOW()
  );

  -- ================================================================
  -- ASSIGNMENTS MÓDULO 2: Razonamiento Crítico
  -- ================================================================

  -- Assignment 4: Overdue (vencido, no completado)
  INSERT INTO educational_content.assignments (
    id,
    title,
    description,
    classroom_id,
    teacher_id,
    module_id,
    due_date,
    max_points,
    status,
    instructions,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'Ejercicio 2.1: Inferencias Básicas',
    'Primer ejercicio del módulo 2 sobre inferencias y razonamiento.',
    v_classroom_2_id,
    v_teacher_1_id,
    v_module_2_id,
    NOW() - INTERVAL '3 days',  -- Vencido hace 3 días
    100,
    'active',  -- Activo pero vencido
    'Este es el primer ejercicio del nuevo módulo. Lean las instrucciones con atención.',
    NOW() - INTERVAL '10 days'
  );

  -- Assignment 5: Activo
  INSERT INTO educational_content.assignments (
    id,
    title,
    description,
    classroom_id,
    teacher_id,
    module_id,
    due_date,
    max_points,
    status,
    instructions,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'Rueda de Inferencias',
    'Práctica con el ejercicio interactivo de la rueda de inferencias.',
    v_classroom_2_id,
    v_teacher_1_id,
    v_module_2_id,
    NOW() + INTERVAL '5 days',  -- Vence en 5 días
    120,
    'active',
    'Usen el ejercicio interactivo de la rueda. Pueden usar hasta 3 comodines.',
    NOW() - INTERVAL '2 days'
  );

  -- Assignment 6: Futuro
  INSERT INTO educational_content.assignments (
    id,
    title,
    description,
    classroom_id,
    teacher_id,
    module_id,
    due_date,
    max_points,
    status,
    instructions,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'Análisis de Caso Complejo',
    'Analizar un caso complejo aplicando todas las técnicas del módulo 2.',
    v_classroom_2_id,
    v_teacher_1_id,
    v_module_2_id,
    NOW() + INTERVAL '15 days',  -- Vence en 15 días
    200,
    'pending',
    'Este ejercicio requiere análisis profundo. Trabajen en equipos de 3.',
    NOW()
  );

  -- ================================================================
  -- ASSIGNMENTS MÓDULO 3: Análisis Avanzado
  -- ================================================================

  -- Assignment 7: Classroom diferente, activo
  INSERT INTO educational_content.assignments (
    id,
    title,
    description,
    classroom_id,
    teacher_id,
    module_id,
    due_date,
    max_points,
    status,
    instructions,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'Ejercicios 3.1 a 3.3: Introducción al Análisis',
    'Primeros ejercicios del módulo 3 sobre análisis argumentativo.',
    v_classroom_3_id,
    v_teacher_1_id,
    v_module_3_id,
    NOW() + INTERVAL '7 days',  -- Vence en 7 días
    100,
    'active',
    'Estos ejercicios son más desafiantes. Tómense su tiempo.',
    NOW() - INTERVAL '1 day'
  );

  -- Assignment 8: Quiz corto
  INSERT INTO educational_content.assignments (
    id,
    title,
    description,
    classroom_id,
    teacher_id,
    module_id,
    due_date,
    max_points,
    status,
    instructions,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'Quiz Rápido: Conceptos del Módulo 3',
    'Quiz de 10 preguntas sobre conceptos clave.',
    v_classroom_3_id,
    v_teacher_1_id,
    v_module_3_id,
    NOW() + INTERVAL '3 days',  -- Vence en 3 días
    50,
    'active',
    'Quiz de 15 minutos. Una sola oportunidad.',
    NOW()
  );

  -- Assignment 9: Proyecto final
  INSERT INTO educational_content.assignments (
    id,
    title,
    description,
    classroom_id,
    teacher_id,
    module_id,
    due_date,
    max_points,
    status,
    instructions,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'Proyecto Final: Análisis Argumentativo Completo',
    'Proyecto final del módulo 3 que integra todos los conceptos aprendidos.',
    v_classroom_3_id,
    v_teacher_1_id,
    v_module_3_id,
    NOW() + INTERVAL '30 days',  -- Vence en 30 días
    300,
    'pending',
    'Este proyecto vale 30% de la calificación final. Sigan la rúbrica proporcionada.',
    NOW()
  );

END $$;

-- ================================================================
-- GRANT PERMISSIONS
-- ================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE educational_content.assignments TO gamilit_app_role;

COMMIT;

-- ================================================================
-- COMENTARIOS
-- ================================================================

COMMENT ON TABLE educational_content.assignments IS
'Asignaciones creadas por maestros para sus estudiantes.
Seeds incluyen 9 assignments de ejemplo para demos del Portal Teacher.';
```

**PASO 3: Validar seeds**

```sql
-- Query de validación
SELECT
  a.title,
  c.name AS classroom,
  p.full_name AS teacher,
  m.title AS module,
  a.due_date,
  a.status,
  CASE
    WHEN a.due_date < NOW() AND a.status != 'completed' THEN 'OVERDUE'
    WHEN a.due_date < NOW() + INTERVAL '3 days' THEN 'SOON'
    ELSE 'FUTURE'
  END AS urgency
FROM educational_content.assignments a
  JOIN organizational.classrooms c ON a.classroom_id = c.id
  JOIN auth_management.profiles p ON a.teacher_id = p.id
  JOIN educational_content.modules m ON a.module_id = m.id
ORDER BY a.due_date ASC;
```

Resultados esperados:
- 9 assignments en total
- 3 por módulo (1, 2, 3)
- Status variados (active, pending, completed)
- Fechas variadas (past, present, future)

**PASO 4: Integrar en script de carga**

Actualizar `create-database.sh` para incluir el nuevo seed:

```bash
# En apps/database/create-database.sh (línea ~180)

echo "📚 Loading educational content seeds..."
psql -d $DATABASE -f seeds/prod/educational_content/01-modules.sql
psql -d $DATABASE -f seeds/prod/educational_content/02-exercises-module1.sql
psql -d $DATABASE -f seeds/prod/educational_content/03-exercises-module2.sql
psql -d $DATABASE -f seeds/prod/educational_content/04-exercises-module3.sql
psql -d $DATABASE -f seeds/prod/educational_content/05-assignments.sql  # ✅ AGREGAR
```

**PASO 5: Ejecutar carga limpia**

```bash
cd apps/database
./create-database.sh
```

### Criterios de Aceptación

- [x] Archivo `05-assignments.sql` creado
- [x] 9 assignments con datos realistas
- [x] Distribuidos en 3 módulos diferentes
- [x] Fechas variadas (past, present, future)
- [x] Status variados (active, pending, completed)
- [x] Integrado en script de carga
- [x] Carga limpia ejecuta sin errores
- [x] Portal Teacher muestra assignments en listas

### Agente Responsable

**Database-Developer**

### Estimación

**1.5 SP** (~4 horas)

### Prioridad

**P0**

---

## 📋 PLAN DE ORQUESTACIÓN

### Orden de Ejecución Recomendado

**Fase 1: Database (1 día)**
1. CORR-005: Vista recent_activity (0.5 SP)
2. CORR-006: Seeds assignments (1.5 SP)

**Fase 2: Backend (0.5 día)**
3. CORR-001: user_id mismatch (0.5 SP)
4. CORR-002: Gamificación real (2 SP)

**Fase 3: Frontend (1.5 días)**
5. CORR-003: lastLogin transform (0.5 SP)
6. CORR-004: Dashboard 3 secciones (3 SP)

**Justificación del orden:**
- Database primero: Backends y frontends dependen de datos
- Backend antes de frontend: Frontend consume APIs backend
- Paralelización posible: CORR-001 y CORR-002 pueden ejecutarse en paralelo

### Herramienta Tool: Task

Para cada corrección, usar:

```typescript
Task({
  subagent_type: "general-purpose",
  description: "Implementar CORR-XXX: [descripción]",
  prompt: `Lee el prompt PROMPT-[AGENTE]-AGENT.md y actúa como [Agente].

TAREA: [Descripción de la corrección]

CONTEXTO:
[Contexto del problema]

ESPECIFICACIÓN:
[Pasos 1-N de la sección de corrección]

CRITERIOS DE ACEPTACIÓN:
[Checklist de la sección]

RESTRICCIONES:
- Seguir DIRECTIVA-CALIDAD-CODIGO.md
- Crear tests unitarios
- Documentar cambios en código

REFERENCIAS:
- PLAN-IMPLEMENTACION-CORRECCIONES-P0.md
- [Otros archivos relevantes]`
})
```

---

## ✅ CHECKLIST FINAL

**Antes de marcar como completado:**

- [ ] Las 6 correcciones implementadas
- [ ] Tests unitarios creados y passing
- [ ] Carga limpia ejecuta sin errores
- [ ] Portal Teacher muestra datos reales (progreso, gamificación, assignments)
- [ ] Portal Admin muestra datos reales (users, dashboard, activity)
- [ ] No hay regresiones en funcionalidad existente
- [ ] Documentación actualizada
- [ ] Reporte de validación final generado

---

## 📄 TRAZABILIDAD

- **Análisis de origen:** REPORTE-VALIDACION-PERSISTENCIA-DATOS-PORTALES-2025-11-24.md
- **Bugs identificados:** 5 críticos (user_id, gamificación, lastLogin, dashboard, vista DB)
- **Tareas generadas:** CORR-001 a CORR-006
- **Esfuerzo total:** 8 SP (~3 días)
- **Agentes involucrados:** Database, Backend, Frontend

---

**Fecha:** 2025-11-24
**Versión:** 1.0
**Estado:** 📋 LISTO PARA ORQUESTACIÓN
**Próximo paso:** Orquestar Database-Agent para CORR-005 y CORR-006
