---
titulo: API Services
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# API Services - GAMILIT Frontend

**Proyecto:** GAMILIT Platform
**Version:** 3.4
**Fecha:** 2025-12-26
**Total Services:** 37

---

## 1. RESUMEN

Los API services del frontend proporcionan una capa de abstraccion sobre las llamadas HTTP al backend. Utilizan Axios como cliente HTTP base.

| Categoria | Cantidad | Ubicacion |
|-----------|----------|-----------|
| Core | 6 | `services/api/` |
| Admin | 3 | `services/api/admin/` |
| Teacher | 12 | `services/api/teacher/` |
| Feature-specific | 16 | `services/api/` |

---

## 2. ESTRUCTURA DE ARCHIVOS

```
apps/frontend/src/services/api/
├── index.ts                    # Barrel exports
├── apiClient.ts               # Cliente Axios base
├── apiTypes.ts                # Tipos compartidos
├── apiErrorHandler.ts         # Manejo de errores
├── apiInterceptors.ts         # Interceptores Axios
├── axios.instance.ts          # Instancia Axios
│
├── admin/                     # APIs de administrador
│   ├── achievementsApi.ts
│   ├── classroomTeacherApi.ts
│   └── gamificationConfigApi.ts
│
├── teacher/                   # APIs de profesor
│   ├── index.ts
│   ├── teacherApi.ts
│   ├── analyticsApi.ts
│   ├── assignmentsApi.ts
│   ├── bonusCoinsApi.ts
│   ├── classroomsApi.ts
│   ├── exerciseResponsesApi.ts
│   # gradingApi.ts — REMOVED (eliminado en Teacher Portal Audit 2026-02-20, merged into assignmentsApi + manualReviewApi)
│   ├── interventionAlertsApi.ts
│   ├── reportsApi.ts
│   ├── studentProgressApi.ts
│   ├── teacherContentApi.ts
│   └── teacherMessagesApi.ts
│
├── adminAPI.ts               # API admin principal
├── adminTypes.ts             # Tipos admin
├── educationalAPI.ts         # Contenido educativo
├── friendsAPI.ts             # Sistema de amigos
├── gamificationAPI.ts        # Gamificacion
├── missionsAPI.ts            # Misiones
├── notificationsAPI.ts       # Notificaciones
├── passwordAPI.ts            # Recovery password
├── profileAPI.ts             # Perfil usuario
├── schoolsAPI.ts             # Escuelas
├── studentAssignmentsAPI.ts  # Tareas estudiante
└── teamsAPI.ts               # Equipos
```

---

## 3. CORE SERVICES

### 3.1 apiClient

**Ubicacion:** `apiClient.ts`

**Proposito:** Cliente Axios configurado con interceptores, tokens y manejo de errores.

**Exports:**
```typescript
export default apiClient;          // Instancia Axios configurada
export { setAuthToken };           // Establecer token JWT
export { setRefreshToken };        // Establecer refresh token
export { clearAuthTokens };        // Limpiar tokens
export { getAuthToken };           // Obtener token actual
export { isAuthenticated };        // Verificar autenticacion
```

**Uso:**
```typescript
import { apiClient } from '@/services/api';

// GET request
const { data } = await apiClient.get('/endpoint');

// POST request
const { data } = await apiClient.post('/endpoint', payload);
```

### 3.2 apiErrorHandler

**Ubicacion:** `apiErrorHandler.ts`

**Proposito:** Manejo centralizado de errores HTTP.

**Clases de Error:**
| Clase | Codigo HTTP | Uso |
|-------|-------------|-----|
| `NetworkError` | - | Error de red |
| `AuthenticationError` | 401 | No autenticado |
| `AuthorizationError` | 403 | No autorizado |
| `NotFoundError` | 404 | Recurso no encontrado |
| `ValidationError` | 400/422 | Datos invalidos |
| `RateLimitError` | 429 | Rate limit excedido |
| `ServerError` | 500+ | Error del servidor |
| `TimeoutError` | - | Timeout de request |

**Utilidades:**
```typescript
import { handleAPIError, isRetryableError, getRetryDelay } from '@/services/api';

try {
  await apiClient.get('/endpoint');
} catch (error) {
  const apiError = handleAPIError(error);
  if (isRetryableError(apiError)) {
    const delay = getRetryDelay(apiError);
    // Retry after delay
  }
}
```

### 3.3 apiTypes

**Ubicacion:** `apiTypes.ts`

**Tipos principales:**
```typescript
// Respuesta estandar
interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

// Respuesta paginada
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Parametros de paginacion
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

---

## 4. ADMIN APIs

### 4.1 adminAPI

**Ubicacion:** `adminAPI.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getUsers(params)` | Lista usuarios con filtros |
| GET | `getUserById(id)` | Detalle de usuario |
| POST | `createUser(data)` | Crear usuario |
| PUT | `updateUser(id, data)` | Actualizar usuario |
| DELETE | `deleteUser(id)` | Eliminar usuario |
| PATCH | `suspendUser(id)` | Suspender usuario |
| PATCH | `activateUser(id)` | Activar usuario |
| GET | `getDashboardStats()` | Estadisticas dashboard |
| GET | `getSystemHealth()` | Health check |

### 4.2 admin/achievementsApi

**Ubicacion:** `admin/achievementsApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getAchievements()` | Lista logros |
| POST | `createAchievement(data)` | Crear logro |
| PUT | `updateAchievement(id, data)` | Actualizar logro |
| DELETE | `deleteAchievement(id)` | Eliminar logro |

### 4.3 admin/gamificationConfigApi

**Ubicacion:** `admin/gamificationConfigApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getGamificationSettings()` | Obtener configuracion |
| PUT | `updateGamificationSettings(data)` | Actualizar configuracion |
| GET | `getXPConfig()` | Configuracion de XP |
| PUT | `updateXPConfig(data)` | Actualizar XP config |

---

## 5. TEACHER APIs

### 5.1 teacherApi (principal)

**Ubicacion:** `teacher/teacherApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getDashboard()` | Dashboard del profesor |
| GET | `getStudents(classroomId)` | Lista estudiantes |
| GET | `getStudentDetail(id)` | Detalle estudiante |

### 5.2 analyticsApi

**Ubicacion:** `teacher/analyticsApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getClassroomAnalytics(id)` | Analiticas de aula |
| GET | `getStudentAnalytics(id)` | Analiticas de estudiante |
| GET | `getProgressReport(params)` | Reporte de progreso |
| GET | `getEngagementMetrics(params)` | Metricas de engagement |

### 5.3 assignmentsApi

**Ubicacion:** `teacher/assignmentsApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getAssignments(params)` | Lista tareas |
| GET | `getAssignmentById(id)` | Detalle tarea |
| POST | `createAssignment(data)` | Crear tarea |
| PUT | `updateAssignment(id, data)` | Actualizar tarea |
| DELETE | `deleteAssignment(id)` | Eliminar tarea |
| POST | `publishAssignment(id)` | Publicar tarea |

### 5.4 bonusCoinsApi

**Ubicacion:** `teacher/bonusCoinsApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| POST | `awardBonus(studentId, data)` | Otorgar ML Coins bonus |
| GET | `getBonusHistory(studentId)` | Historial de bonus |

### 5.5 classroomsApi

**Ubicacion:** `teacher/classroomsApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getClassrooms()` | Lista aulas |
| GET | `getClassroomById(id)` | Detalle aula |
| GET | `getClassroomStudents(id)` | Estudiantes del aula |
| GET | `getClassroomStats(id)` | Estadisticas del aula |

### 5.6 exerciseResponsesApi

**Ubicacion:** `teacher/exerciseResponsesApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getAttempts(params)` | Lista intentos |
| GET | `getAttemptById(id)` | Detalle intento |
| GET | `getStudentAttempts(studentId)` | Intentos por estudiante |

### 5.7 ~~gradingApi~~ (REMOVED)

> **Deprecation (2026-02-20):** `gradingApi` (`teacher/gradingApi.ts`) has been removed. Its grading endpoints were merged into `assignmentsApi` and `manualReviewApi` (`shared/api/manualReviewApi.ts`). Use those services instead.

**Former endpoints (now served by `assignmentsApi` / `manualReviewApi`):**
| Metodo | Funcion | Migrated To |
|--------|---------|-------------|
| GET | `getSubmissions(params)` | `assignmentsApi` |
| GET | `getSubmissionById(id)` | `assignmentsApi` |
| POST | `gradeSubmission(id, data)` | `manualReviewApi` |
| POST | `bulkGrade(data)` | `manualReviewApi` |

### 5.8 interventionAlertsApi

**Ubicacion:** `teacher/interventionAlertsApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getAlerts(params)` | Lista alertas |
| GET | `getAlertById(id)` | Detalle alerta |
| PATCH | `acknowledgeAlert(id)` | Reconocer alerta |
| PATCH | `resolveAlert(id)` | Resolver alerta |
| PATCH | `dismissAlert(id)` | Descartar alerta |

### 5.9 reportsApi

**Ubicacion:** `teacher/reportsApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| POST | `generateReport(params)` | Generar reporte (PDF/Excel) |
| GET | `getRecentReports()` | Reportes recientes |
| GET | `downloadReport(id)` | Descargar reporte |

### 5.10 studentProgressApi

**Ubicacion:** `teacher/studentProgressApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getStudentProgress(id)` | Progreso completo |
| GET | `getStudentOverview(id)` | Vista general |
| GET | `getStudentStats(id)` | Estadisticas |
| GET | `getStudentInsights(id)` | Insights con IA |

### 5.11 teacherContentApi

**Ubicacion:** `teacher/teacherContentApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| POST | `generateContent(params)` | Generar contenido |
| GET | `getContent(id)` | Obtener contenido |
| POST | `cloneContent(id)` | Clonar contenido |
| PATCH | `publishContent(id)` | Publicar contenido |

### 5.12 teacherMessagesApi

**Ubicacion:** `teacher/teacherMessagesApi.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getMessages(params)` | Lista mensajes |
| GET | `getMessageById(id)` | Detalle mensaje |
| POST | `sendMessage(data)` | Enviar mensaje |
| POST | `markAsRead(id)` | Marcar como leido |
| GET | `getUnreadCount()` | Contar no leidos |
| POST | `sendAnnouncement(classroomId, data)` | Enviar anuncio |

---

## 6. FEATURE APIs

### 6.1 educationalAPI

**Ubicacion:** `educationalAPI.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getModules()` | Lista modulos |
| GET | `getModuleById(id)` | Detalle modulo |
| GET | `getExercises(moduleId)` | Ejercicios del modulo |
| GET | `getExerciseById(id)` | Detalle ejercicio |
| POST | `submitAnswer(id, data)` | Enviar respuesta |

### 6.2 gamificationAPI

**Ubicacion:** `gamificationAPI.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getUserStats(userId)` | Estadisticas usuario |
| PATCH | `updateUserStats(userId, data)` | Actualizar stats |
| GET | `getLeaderboard(params)` | Tabla posiciones |
| GET | `getAchievements(userId)` | Logros usuario |
| POST | `unlockAchievement(id)` | Desbloquear logro |

### 6.3 missionsAPI

**Ubicacion:** `missionsAPI.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getDailyMissions()` | Misiones diarias |
| GET | `getWeeklyMissions()` | Misiones semanales |
| GET | `getSpecialMissions()` | Misiones especiales |
| POST | `claimRewards(missionId)` | Reclamar recompensa |

### 6.4 notificationsAPI

**Ubicacion:** `notificationsAPI.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getNotifications(params)` | Lista notificaciones |
| POST | `markAsRead(id)` | Marcar como leida |
| POST | `markAllAsRead()` | Marcar todas |
| DELETE | `deleteNotification(id)` | Eliminar |

### 6.5 profileAPI

**Ubicacion:** `profileAPI.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getProfile()` | Obtener perfil |
| PUT | `updateProfile(data)` | Actualizar perfil |
| PUT | `updatePreferences(data)` | Actualizar preferencias |
| POST | `uploadAvatar(file)` | Subir avatar |
| PUT | `updatePassword(data)` | Cambiar password |

### 6.6 friendsAPI

**Ubicacion:** `friendsAPI.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getFriends()` | Lista amigos |
| POST | `sendFriendRequest(userId)` | Enviar solicitud |
| POST | `acceptRequest(requestId)` | Aceptar solicitud |
| POST | `rejectRequest(requestId)` | Rechazar solicitud |
| DELETE | `removeFriend(friendId)` | Eliminar amigo |

### 6.7 teamsAPI

**Ubicacion:** `teamsAPI.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getTeams()` | Lista equipos |
| GET | `getTeamById(id)` | Detalle equipo |
| POST | `createTeam(data)` | Crear equipo |
| POST | `joinTeam(id)` | Unirse a equipo |
| POST | `leaveTeam(id)` | Abandonar equipo |

### 6.8 studentAssignmentsAPI

**Ubicacion:** `studentAssignmentsAPI.ts`

**Endpoints:**
| Metodo | Funcion | Descripcion |
|--------|---------|-------------|
| GET | `getAssignments(params)` | Lista tareas asignadas |
| GET | `getAssignmentById(id)` | Detalle tarea |
| POST | `submitAssignment(id, data)` | Enviar tarea |
| GET | `getGradesSummary()` | Resumen de notas |

---

## 7. PATRONES DE USO

### 7.1 Importacion

```typescript
// Importar servicios especificos
import { adminAPI } from '@/services/api';
import { teacherApi } from '@/services/api/teacher';

// Importar cliente base
import { apiClient } from '@/services/api';
```

### 7.2 Manejo de Errores

```typescript
import { handleAPIError, isAuthError } from '@/services/api';

try {
  const data = await adminAPI.getUsers();
} catch (error) {
  const apiError = handleAPIError(error);

  if (isAuthError(apiError)) {
    // Redirigir a login
  } else {
    // Mostrar mensaje de error
    toast.error(apiError.message);
  }
}
```

### 7.3 Con React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { teacherApi } from '@/services/api/teacher';

// Query
const { data, isLoading } = useQuery({
  queryKey: ['classroom', classroomId],
  queryFn: () => teacherApi.classrooms.getClassroomById(classroomId),
});

// Mutation
const mutation = useMutation({
  mutationFn: (data) => teacherApi.grading.gradeSubmission(id, data),
  onSuccess: () => queryClient.invalidateQueries(['submissions']),
});
```

---

## 8. CONFIGURACION

### 8.1 Variables de Entorno

```bash
# Frontend .env
VITE_API_URL=http://localhost:3006/api
VITE_WS_URL=ws://localhost:3006
```

### 8.2 API Config

**Ubicacion:** `@/config/api.config.ts`

```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  retries: 3,
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  ADMIN: '/admin',
  TEACHER: '/teacher',
  GAMIFICATION: '/gamification',
  // ...
};
```

---

**Generado por:** Requirements-Analyst - GAMILIT
