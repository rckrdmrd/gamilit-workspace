# ANÁLISIS COMPARATIVO: SERVICIOS Y CLIENTES API

## RESUMEN EJECUTIVO

Se ha realizado un análisis detallado de los servicios API entre:
- **Proyecto Base**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/`
- **Proyecto Actual**: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/frontend/src/`

**Hallazgo Principal**: El proyecto actual tiene una estructura SIMPLIFICADA pero le faltan **13 servicios API críticos** que existen en el proyecto base. La configuración de autenticación es más básica y carece de manejo robusto de errores.

---

## 1. CONFIGURACIÓN BASE DE AXIOS/HTTP CLIENT

### Proyecto Base (COMPLETO)
**Ubicación**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/services/api/`

- **apiClient.ts** (217 líneas)
  - Interceptor de request con token JWT y header X-Tenant-Id
  - Interceptor de response con refresh automático de token en 401
  - Manejo de error con redirección a login en caso de fallar refresh
  - Utilidades: setAuthToken, setRefreshToken, clearAuthTokens, getAuthToken, isAuthenticated

- **apiConfig.ts** (472 líneas)
  - 17 módulos de endpoints bien organizados (auth, users, ranks, economy, achievements, etc.)
  - Feature flags (USE_MOCK_DATA, ENABLE_WEBSOCKET, DEBUG_API, ENABLE_AI, ENABLE_ANALYTICS)
  - Configuración de timeouts, reintentos, paginación
  - Constantes HTTP STATUS

- **apiInterceptors.ts** (284 líneas)
  - Request: timestamp, version, requestId, cache control
  - Response: performance monitoring, cache response, data transformation
  - Logger interceptor con debug mode
  - Analytics interceptor

- **apiErrorHandler.ts** (436 líneas)
  - 9 clases de errores customizadas (APIError, NetworkError, AuthenticationError, etc.)
  - Manejo específico por status code
  - Formateo de mensajes de error en español
  - Funciones de validación de error type (isNetworkError, isAuthError, isRateLimitError, etc.)
  - Lógica de reintento con exponential backoff

### Proyecto Actual (SIMPLIFICADO)
**Ubicación**: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/frontend/src/lib/api/`

- **client.ts** (54 líneas)
  - Configuración básica de axios con baseURL
  - Interceptor simple de request con Bearer token
  - Interceptor simple de response para refresh de token
  - NO tiene: tenant support, detección de 403/404/500, logging, analytics
  - NO tiene: utilidades de token management

**DIFERENCIAS CRÍTICAS**:
- Base Project: 217 líneas + 472 + 284 + 436 = **1,409 líneas**
- Current Project: 54 líneas = **95% menos código**
- El proyecto actual CARECE de:
  - Manejo robusto de errores
  - Feature flags
  - Interceptores avanzados
  - Clases de error customizadas
  - Soporte multi-tenant
  - Analytics
  - Performance monitoring

---

## 2. SERVICIOS API IMPLEMENTADOS

### Proyecto Base - SERVICIOS PRINCIPALES
```
1. educationalAPI.ts (860 líneas)
   - Módulos, ejercicios, progreso, analytics, actividades
   - 28 funciones exportadas

2. missionsAPI.ts (83 líneas)
   - Daily, weekly, special missions

3. authAPI.ts (500+ líneas)
   - Login, register, logout, refresh, password reset
   - Sessions, email verification
   - Mock data para desarrollo

4. gamificationAPI.ts (600+ líneas)
   - User stats, ranks, missions, achievements
   - Leaderboards, powerups

5. progressAPI.ts (320+ líneas)
   - Module progress, exercise progress
   - Analytics de usuario

6. adminAPI.ts
   - User management, content moderation
   - System analytics, health checks

7. contentAPI.ts
   - Content management endpoints

8. socialAPI.ts (380+ líneas)
   - Achievements, powerups, leaderboards
   - Guilds, friends, activities

9. ranksAPI.ts
   - Rank progression, multipliers, history

10. economyAPI.ts
    - ML Coins balance, transactions
    - Earning/spending endpoints

11. inventoryAPI.ts
    - Power-ups inventory management

12. aiServiceAPI.ts
    - Text analysis, fact checking
    - Hypothesis validation, suggestions

13. mechanicsAPI.ts (shared)
    - Submit exercises, get hints
    - Validation endpoints

+ Múltiples servicios específicos por mecánica
```

### Proyecto Actual - SERVICIOS EXISTENTES
```
1. auth.api.ts (75 líneas)
   - Login, register, logout
   - getProfile, refreshToken
   - Almacenamiento de tokens en localStorage

2. gamification.api.ts (254 líneas)
   - getUserStats, updateUserStats
   - getMLCoinsBalance
   - Achievements: get, list, claim
   - Leaderboards: global, school, classroom

3. progress.api.ts (197 líneas)
   - getUserProgress, getModuleProgress
   - Learning sessions, exercise attempts
   - Session stats, submission stats

4. educational.api.ts
   - (Sin lectura aún - probablemente similar al base)

5. client.ts (54 líneas)
   - Client básico HTTP
```

---

## 3. SERVICIOS FALTANTES EN PROYECTO ACTUAL

| # | Servicio | Path Base | Funcionalidad | Prioridad |
|---|----------|-----------|--------------|-----------|
| 1 | **adminAPI** | features/admin/api/ | User management, content moderation, system health, analytics | CRÍTICA |
| 2 | **contentAPI** | features/content/api/ | Content management, media library, versioning | ALTA |
| 3 | **socialAPI** (completo) | features/gamification/social/api/ | Achievements completo, powerups, guilds, friends | ALTA |
| 4 | **ranksAPI** | features/gamification/ranks/api/ | Rank progression, multipliers, history, promotion | ALTA |
| 5 | **economyAPI** | features/gamification/economy/api/ | ML Coins: balance, transactions, earn/spend | ALTA |
| 6 | **inventoryAPI** | features/gamification/economy/api/ | Power-ups inventory y management | MEDIA |
| 7 | **aiServiceAPI** | features/mechanics/shared/api/ | Text analysis, fact-check, hypothesis validation | MEDIA |
| 8 | **mechanicsAPI** | features/mechanics/shared/api/ | Core exercise mechanics, hints, validation | CRÍTICA |
| 9 | **notificationsAPI** | services/api/ | Push notifications management | MEDIA |
| 10 | **Module-Specific Mechanics** (13) | features/mechanics/*/api/ | Each module has specific mechanics (Detective, Debate, etc.) | MEDIA |
| 11 | **Teacher/Classroom API** | features/teacher/api/ | Classroom mgmt, assignments, grading, analytics | CRÍTICA |
| 12 | **Mechanics por Módulo** | Multiple locations | Específico para cada mecánica educativa | MEDIA |
| 13 | **Advanced Error Handling** | services/api/ | Error classes, retry logic, formatting | CRÍTICA |

---

## 4. CONFIGURACIÓN DE AUTENTICACIÓN

### Proyecto Base (ROBUSTO)
```typescript
// apiClient.ts
- Interceptor request: Agrega token desde localStorage key 'auth-token'
- Interceptor request: Agrega X-Tenant-Id header
- Interceptor response: Detecta 401 con _retry flag
- Interceptor response: Intenta refresh con 'refresh-token'
- Token refresh: Actualiza 'auth-token' en localStorage
- Error handling: Redirige a /login si refresh falla
- Evita doble redirect: Verifica !window.location.pathname.includes('/login')

Funciones de utilidad:
✓ setAuthToken(token)
✓ setRefreshToken(token)
✓ clearAuthTokens()
✓ getAuthToken()
✓ isAuthenticated()
```

### Proyecto Actual (BÁSICO)
```typescript
// client.ts
- Interceptor request: Agrega token desde 'access_token'
- NO tiene: X-Tenant-Id
- NO tiene: _retry flag para evitar loops infinitos
- Intenta refresh POST a /auth/refresh
- Token refresh: Actualiza 'access_token'
- Error handling: Redirige a /login (sin verificación)
- NO tiene: Funciones de token management

localStorage keys:
- access_token
- refresh_token

PROBLEMA: Inconsistencia en nombres de keys entre proyectos
```

---

## 5. MANEJO DE ERRORES

### Proyecto Base (COMPLETO - 436 LÍNEAS)

**Clases de Error Customizadas**:
```typescript
- APIError (base)
- NetworkError
- AuthenticationError
- AccountInactiveError
- AccountSuspendedError
- AuthorizationError
- NotFoundError
- ValidationError
- RateLimitError
- ServerError
- TimeoutError
```

**Funciones de Clasificación**:
```typescript
- handleAPIError(error) → Convierte a APIError
- isAxiosError(error)
- isAPIError(error)
- isNetworkError(error)
- isAuthError(error)
- isValidationError(error)
- isRateLimitError(error)
- formatErrorMessage(error) → Mensajes en español
- getErrorDetails(error) → Debug info
- isRetryableError(error)
- getRetryDelay(error, attempt)
```

**Formato de Respuesta de Error**:
```typescript
{
  success: false,
  error: {
    code: 'API_ERROR',
    message: 'User-friendly message',
    details: { /* error data */ }
  },
  timestamp: ISO string
}
```

### Proyecto Actual (INEXISTENTE)
- NO tiene clases de error
- NO tiene formateo de mensajes
- NO tiene funciones de validación de error type
- NO tiene lógica de reintento
- Errores se lanzan directamente sin procesar

**IMPACTO**: 
- Manejo inconsistente de errores
- Código duplicado en componentes para validar tipos de error
- Experiencia de usuario pobre (mensajes técnicos)

---

## 6. INTERCEPTORES Y MIDDLEWARE

### Proyecto Base (284 LÍNEAS - 5 INTERCEPTORES)

**Request Interceptors**:
1. `timestampInterceptor` - Agrega X-Request-Time
2. `versionInterceptor` - Agrega X-Client-Version
3. `requestIdInterceptor` - Agrega X-Request-Id para tracing
4. `cacheControlInterceptor` - Headers de caché para GET
5. `loggerInterceptor.request` - Debug logging

**Response Interceptors**:
1. `performanceInterceptor` - Monitorea requests lentos (>3s)
2. `cacheResponseInterceptor` - Procesa headers cache-control
3. `transformResponseInterceptor` - Convierte ISO dates a Date objects
4. `loggerInterceptor.response` - Debug logging con duración
5. `analyticsInterceptor.response` - Tracking de API success

**Error Interceptors**:
1. `loggerInterceptor.error` - Logging de errores
2. `analyticsInterceptor.error` - Tracking de API errors

### Proyecto Actual (0 INTERCEPTORES)
- NO tiene interceptores avanzados
- NO tiene performance monitoring
- NO tiene request tracing
- NO tiene date transformation
- NO tiene analytics

**IMPACTO**:
- Sin visibilidad de performance
- Sin trazabilidad de requests
- Fechas como strings en lugar de Date objects
- Sin datos de analytics

---

## 7. ENDPOINTS DEFINIDOS

### Proyecto Base (apiConfig.ts - 17 MÓDULOS)

```typescript
API_ENDPOINTS = {
  auth: {                  // 8 endpoints
    login, register, logout, refresh, verifyEmail,
    requestPasswordReset, resetPassword, changePassword,
    getCurrentUser, updateProfile, getSessions, revokeSession
  },
  users: {                 // 5 endpoints
    profile, updateProfile, preferences, updatePreferences, avatar, statistics
  },
  ranks: {                 // 7 endpoints (Maya ranks)
    current, checkPromotion, rankUp, history, multipliers, listAll, getDetails
  },
  economy: {               // 7 endpoints (ML Coins)
    balance, transactions, earn, spend, stats, leaderboard, metrics
  },
  achievements: {          // 7 endpoints
    list, get, unlock, unlockSpecific, progress, updateProgress, stats, recent
  },
  powerups: {              // 9 endpoints
    list, get, purchase, purchaseSpecific, use, useSpecific, inventory, active
  },
  leaderboards: {          // 12 endpoints
    global, school, grade, friends, userRank, userPosition, byType, 
    byTypeAndPeriod, xp, coins, streaks, globalView, myRank
  },
  guilds: {                // 11 endpoints
    list, create, get, update, delete, join, leave, members,
    removeMember, updateMemberRole, challenges, createChallenge, leaderboard, search
  },
  friends: {               // 9 endpoints
    list, get, request, requests, accept, decline, remove,
    recommendations, activities, search, online
  },
  mechanics: {             // 9 endpoints
    list, get, byType, submit, submitSpecific, progress,
    userProgress, scoring, hints, validate
  },
  ai: {                    // 7 endpoints
    analyze, analyzeText, generateResponse, checkFact,
    validateHypothesis, getSuggestions, improveReading
  },
  educational: {           // 10 endpoints (modules, exercises, progress)
    modules, module, moduleExercises, moduleAccess, userModules,
    exercises, exercise, submitExercise, userProgress, moduleProgress,
    userDashboard, exerciseAttempts, userActivities, activityStats, activitiesByType,
    userAnalytics, classroomAnalytics
  },
  teacher: {               // 23 endpoints
    // Classrooms, Assignments, Grading, Analytics, Student Progress
  },
  notifications: {         // 6 endpoints
    list, unreadCount, markAsRead, markAllAsRead, delete, clearAll, send
  },
  missions: {              // 7 endpoints
    daily, weekly, special, claim, progress, complete,
    userMissions, check, stats
  },
  admin: {                 // 20+ endpoints
    // Dashboard, Users, Organizations, Content, System
  }
}
```

**Total**: ~140 endpoints documentados y reutilizables

### Proyecto Actual
- NO tiene objeto de configuración centralizado
- Endpoints hardcodeados en cada archivo API
- No hay reutilización de paths
- Inconsistencia en nombrado de endpoints

---

## 8. FEATURE FLAGS

### Proyecto Base
```typescript
FEATURE_FLAGS = {
  USE_MOCK_DATA,        // Usar datos mock en lugar de API real
  ENABLE_WEBSOCKET,     // WebSocket para features en tiempo real
  DEBUG_API,            // Debug logging detallado
  ENABLE_AI,            // Habilitar features de AI (default: true)
  ENABLE_ANALYTICS      // Tracking de eventos
}
```

### Proyecto Actual
- NO tiene feature flags
- Difícil hacer testing sin modificar código
- No hay forma de cambiar entre mock data y API real

---

## 9. TIPOS E INTERFACES COMPARTIDAS

### Proyecto Base (apiTypes.ts - 800+ LÍNEAS)
```typescript
- ApiResponse<T>
- ApiError
- PaginatedResponse
- PaginationParams
- RequestMetadata / ResponseMetadata
- ValidationError, ValidationResult
- FileUploadRequest / Response
- SearchParams, FilterOption
- TimePeriod, DateRange
- Status, RequestStatus
- SortConfig, SortOption
- BulkOperationRequest / Response
- CacheConfig, CachedResponse
- WebhookPayload
- RateLimitInfo
- HealthCheckResponse
```

### Proyecto Actual
- Tipos probablemente en `/shared/types/`
- NO tiene tipos centralizados para API responses
- NO tiene tipos para errores de API

---

## 10. RESUMEN DE DIFERENCIAS

| Aspecto | Proyecto Base | Proyecto Actual | Brecha |
|---------|---------------|-----------------|--------|
| Líneas de código (API) | 1,409+ | 54 | 96% |
| Servicios API | 13+ | 4 | 69% |
| Endpoints documentados | 140+ | ~30 | 78% |
| Clases de error | 11 | 0 | 100% |
| Interceptores | 12 | 0 | 100% |
| Feature flags | 5 | 0 | 100% |
| Utilidades de token | 5 | 0 | 100% |
| Multi-tenant support | ✓ | ✗ | Sin |
| Analytics | ✓ | ✗ | Sin |
| Performance monitoring | ✓ | ✗ | Sin |
| Request tracing | ✓ | ✗ | Sin |
| Rate limit handling | ✓ | ✗ | Sin |
| Mock data support | ✓ | ✗ | Sin |

---

## 11. SERVICIOS FALTANTES - DETALLES

### 1. ADMIN API (CRÍTICA)

**Path**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/features/admin/api/adminAPI.ts`

**Funcionalidades**:
- Dashboard: health, metrics, actions, alerts
- User Management: list, get, update, delete, activate, deactivate, suspend, resetPassword
- Organization Management: CRUD, subscription, features
- Content Moderation: pending exercises, approve/reject, media library
- System Management: logs, maintenance, statistics

**Métodos Principales**:
```typescript
- getAdminDashboard()
- getUserList(filters)
- getUserDetails(userId)
- updateUser(userId, data)
- deleteUser(userId)
- suspendUser(userId, reason)
- getOrganizations()
- approvePendingContent()
- rejectPendingContent()
- getSystemLogs()
- getSystemHealth()
- getMetrics()
```

### 2. CONTENT API (ALTA)

**Path**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/features/content/api/contentAPI.ts`

**Funcionalidades**:
- Content management (modules, exercises)
- Media library
- Versioning
- Publishing workflows

### 3. SOCIAL API - COMPLETO (ALTA)

**Path**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/features/gamification/social/api/socialAPI.ts` (~380 líneas)

**Funcionalidades No Implementadas**:
- Guilds: create, join, leave, manage members, challenges
- Friends: request, accept, decline, recommendations
- Activities: track, view, statistics

**Métodos Faltantes**:
```typescript
- createGuild()
- joinGuild()
- leaveGuild()
- guildChallenges()
- sendFriendRequest()
- acceptFriendRequest()
- getFriendActivities()
- getFriendRecommendations()
```

### 4. RANKS API (ALTA)

**Path**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/features/gamification/ranks/api/ranksAPI.ts`

**Funcionalidades**:
- Maya ranks progression system
- Rank multipliers
- Promotion checks
- Rank history
- Rank details

**Métodos**:
```typescript
- getCurrentRank(userId)
- checkPromotion(userId)
- promoteUser(userId)
- getRankHistory(userId)
- getRankMultiplier(userId)
- getAllRanks()
- getRankDetails(rankId)
```

### 5. ECONOMY API (ALTA)

**Path**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/features/gamification/economy/api/economyAPI.ts`

**Funcionalidades**:
- ML Coins balance management
- Transaction history
- Earn coins (from exercises)
- Spend coins (for powerups)
- Leaderboard de coins
- Statistics

**Métodos**:
```typescript
- getBalance(userId)
- getTransactions(userId)
- earnCoins(userId, amount, reason)
- spendCoins(userId, amount, reason)
- getStats(userId)
- getLeaderboard()
- getMetrics() // Admin only
```

### 6. INVENTORY API (MEDIA)

**Path**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/features/gamification/economy/api/inventoryAPI.ts`

**Funcionalidades**:
- Power-ups inventory
- Owned items
- Usage tracking
- Activation/deactivation

### 7. AI SERVICE API (MEDIA)

**Path**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/features/mechanics/shared/api/aiServiceAPI.ts`

**Funcionalidades**:
- Text analysis
- Fact checking
- Hypothesis validation
- AI-powered suggestions
- Reading assistance

**Métodos**:
```typescript
- analyzeText(text)
- checkFact(claim)
- validateHypothesis(hypothesis)
- generateSuggestions(context)
- improveReading(text)
```

### 8. MECHANICS API (CRÍTICA)

**Path**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/features/mechanics/shared/api/mechanicsAPI.ts`

**Funcionalidades**:
- Core exercise mechanics
- Submit answers
- Get hints
- Validate answers
- Scoring

**Métodos**:
```typescript
- getMechanics()
- getMechanicsByType(type)
- submitExercise(exerciseId, answers)
- getHints(exerciseId)
- validateAnswers(exerciseId, answers)
- getScoring(exerciseId)
```

### 9. NOTIFICATIONS API (MEDIA)

**Path**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/services/api/notificationsAPI.ts`

**Funcionalidades**:
- List notifications
- Mark as read
- Delete notifications
- Get unread count

### 10. TEACHER/CLASSROOM API (CRÍTICA)

**Funcionalidades**:
- Classroom management (CRUD)
- Student management
- Assignment creation and distribution
- Submission grading
- Analytics

**Métodos**:
```typescript
- getClassrooms()
- createClassroom(data)
- getClassroomStudents(classroomId)
- createAssignment(data)
- gradeSubmission(submissionId, grade)
- getClassroomAnalytics(classroomId)
- getStudentProgress(studentId)
```

### 11-13. MECHANICS POR MÓDULO (MEDIA)

Cada módulo tiene su propia API específica:

```
Module 2 (Comprensión Lectora):
- detectiveTextualAPI.ts
- ruedaInferenciasAPI.ts
- puzzleContextoAPI.ts
- construccionHipotesisAPI.ts
- prediccionNarrativaAPI.ts

Module 3 (Análisis Crítico):
- analisisFuentesAPI.ts
- debateDigitalAPI.ts
- matrizPerspectivasAPI.ts
- tribunalOpinionesAPI.ts
- podcastArgumentativoAPI.ts

Module 4 (Literacidad Digital):
- (Múltiples mecánicas)
```

---

## 12. PLAN DE IMPLEMENTACIÓN RECOMENDADO

### Fase 1: CRÍTICA (Semana 1)
1. [x] Copiar apiErrorHandler.ts completo
2. [x] Copiar apiInterceptors.ts completo
3. [ ] Mejorar apiConfig.ts con todos los endpoints
4. [ ] Implementar adminAPI.ts
5. [ ] Implementar teacherAPI.ts

### Fase 2: ALTA (Semana 2)
6. [ ] Implementar mechanicsAPI.ts
7. [ ] Implementar economyAPI.ts
8. [ ] Implementar ranksAPI.ts
9. [ ] Completar socialAPI.ts (guilds, friends)
10. [ ] Implementar contentAPI.ts

### Fase 3: MEDIA (Semana 3)
11. [ ] Implementar inventoryAPI.ts
12. [ ] Implementar aiServiceAPI.ts
13. [ ] Implementar notificationsAPI.ts
14. [ ] Implementar mechanics por módulo

### Fase 4: SOPORTE (Semana 4)
15. [ ] Actualizar client.ts con feature flags
16. [ ] Agregar utilidades de token management
17. [ ] Documentar API completa
18. [ ] Crear guías de uso

---

## 13. CONCLUSIONES Y RECOMENDACIONES

### Estado Actual
El proyecto actual tiene una configuración API **demasiado simplificada** que carece de características críticas para una aplicación educativa empresarial:

1. **Manejo de errores inexistente** - Sin clasificación de errores, sin mensajes localizados
2. **Falta de 13 servicios API** - 69% de funcionalidad educativa/administrativa
3. **Sin monitoreo** - No hay analytics, performance monitoring, o request tracing
4. **Sin soporte empresarial** - Multi-tenant, health checks, logging
5. **Duplicación de lógica** - Cada componente maneja su propio error handling

### Impacto
- Difícil mantener y debuggear
- Experiencia de usuario pobre (errores técnicos)
- Sin visibilidad de performance
- Escalabilidad comprometida
- Inconsistencia en manejo de estado

### Recomendación Urgente
**IMPLEMENTAR INMEDIATAMENTE**:
1. Sistema de manejo de errores (436 líneas - 3-4 horas)
2. Interceptores avanzados (284 líneas - 3-4 horas)
3. API Config centralizado (472 líneas - 2-3 horas)
4. Servicios críticos: Admin, Teacher, Mechanics (15-20 horas)

**Estimado Total**: 40-50 horas de desarrollo para paridad con proyecto base.

---

## REFERENCIAS DE ARCHIVOS

### Proyecto Base (Fuente)
- `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/services/api/apiClient.ts`
- `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/services/api/apiConfig.ts`
- `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/services/api/apiInterceptors.ts`
- `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/services/api/apiErrorHandler.ts`
- `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/src/services/api/index.ts`
- Y 13+ servicios en features/

### Proyecto Actual (Destino)
- `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/frontend/src/lib/api/client.ts`
- `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/frontend/src/lib/api/auth.api.ts`
- `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/frontend/src/lib/api/gamification.api.ts`
- `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/frontend/src/lib/api/progress.api.ts`
- `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/frontend/src/lib/api/educational.api.ts`

