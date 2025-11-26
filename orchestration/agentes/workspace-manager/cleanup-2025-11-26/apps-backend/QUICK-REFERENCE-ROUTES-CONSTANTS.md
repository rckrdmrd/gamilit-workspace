# QUICK REFERENCE: routes.constants.ts

Guía rápida de uso de las constantes de rutas actualizadas.

---

## Importación

```typescript
import { API_ROUTES } from '@/shared/constants/routes.constants';
```

---

## TEACHER - Ejemplos de Uso

### Dashboard
```typescript
// GET /teacher/dashboard/stats
const statsUrl = API_ROUTES.TEACHER.DASHBOARD_STATS;

// GET /teacher/dashboard/activities
const activitiesUrl = API_ROUTES.TEACHER.DASHBOARD_ACTIVITIES;
```

### Classrooms
```typescript
// GET /teacher/classrooms/:id/progress
const progressUrl = API_ROUTES.TEACHER.CLASSROOM_PROGRESS('classroom-uuid-123');
// => '/teacher/classrooms/classroom-uuid-123/progress'

// POST /teacher/classrooms/:classroomId/students/:studentId/block
const blockUrl = API_ROUTES.TEACHER.CLASSROOM_STUDENT_BLOCK('class-123', 'student-456');
// => '/teacher/classrooms/class-123/students/student-456/block'
```

### Students
```typescript
// GET /teacher/students/:studentId/progress
const studentProgressUrl = API_ROUTES.TEACHER.STUDENT_PROGRESS('student-uuid-789');
// => '/teacher/students/student-uuid-789/progress'

// POST /teacher/students/:studentId/bonus
const bonusUrl = API_ROUTES.TEACHER.STUDENT_BONUS('student-uuid-789');
// => '/teacher/students/student-uuid-789/bonus'
```

### Alerts (Intervention)
```typescript
// GET /teacher/alerts
const alertsListUrl = API_ROUTES.TEACHER.ALERTS.BASE;

// GET /teacher/alerts/:id
const alertDetailUrl = API_ROUTES.TEACHER.ALERTS.BY_ID('alert-123');
// => '/teacher/alerts/alert-123'

// PATCH /teacher/alerts/:id/resolve
const resolveUrl = API_ROUTES.TEACHER.ALERTS.RESOLVE('alert-123');
// => '/teacher/alerts/alert-123/resolve'

// GET /teacher/alerts/student/:studentId/history
const historyUrl = API_ROUTES.TEACHER.ALERTS.STUDENT_HISTORY('student-456');
// => '/teacher/alerts/student/student-456/history'
```

### Messages (Communication)
```typescript
// GET /teacher/messages/conversations
const conversationsUrl = API_ROUTES.TEACHER.MESSAGES.CONVERSATIONS;

// GET /teacher/messages/unread-count
const unreadCountUrl = API_ROUTES.TEACHER.MESSAGES.UNREAD_COUNT;

// POST /teacher/messages/classroom/:classroomId/announcement
const announcementUrl = API_ROUTES.TEACHER.MESSAGES.CLASSROOM_ANNOUNCEMENT('class-123');
// => '/teacher/messages/classroom/class-123/announcement'
```

### Content Management
```typescript
// GET /teacher/content
const contentListUrl = API_ROUTES.TEACHER.CONTENT.BASE;

// GET /teacher/content/:id
const contentDetailUrl = API_ROUTES.TEACHER.CONTENT.BY_ID('content-123');
// => '/teacher/content/content-123'

// POST /teacher/content/:id/clone
const cloneUrl = API_ROUTES.TEACHER.CONTENT.CLONE('content-123');
// => '/teacher/content/content-123/clone'

// PATCH /teacher/content/:id/publish
const publishUrl = API_ROUTES.TEACHER.CONTENT.PUBLISH('content-123');
// => '/teacher/content/content-123/publish'
```

---

## ADMIN - Ejemplos de Uso

### Dashboard
```typescript
// GET /admin/dashboard/stats
const statsUrl = API_ROUTES.ADMIN.DASHBOARD_STATS;

// GET /admin/dashboard/recent-activity
const activityUrl = API_ROUTES.ADMIN.DASHBOARD_RECENT_ACTIVITY;
```

### System Alerts
```typescript
// GET /admin/alerts
const alertsUrl = API_ROUTES.ADMIN.ALERTS.BASE;

// GET /admin/alerts/stats/summary
const summaryUrl = API_ROUTES.ADMIN.ALERTS.STATS_SUMMARY;

// PATCH /admin/alerts/:id/resolve
const resolveUrl = API_ROUTES.ADMIN.ALERTS.RESOLVE('alert-123');
// => '/admin/alerts/alert-123/resolve'
```

### Analytics
```typescript
// GET /admin/analytics/overview
const overviewUrl = API_ROUTES.ADMIN.ANALYTICS.OVERVIEW;

// GET /admin/analytics/engagement
const engagementUrl = API_ROUTES.ADMIN.ANALYTICS.ENGAGEMENT;

// GET /admin/analytics/export
const exportUrl = API_ROUTES.ADMIN.ANALYTICS.EXPORT;
```

### Monitoring
```typescript
// GET /admin/monitoring/metrics
const metricsUrl = API_ROUTES.ADMIN.MONITORING.METRICS;

// GET /admin/monitoring/errors/recent
const recentErrorsUrl = API_ROUTES.ADMIN.MONITORING.ERRORS_RECENT;
```

### Progress Tracking
```typescript
// GET /admin/progress/overview
const overviewUrl = API_ROUTES.ADMIN.PROGRESS.OVERVIEW;

// GET /admin/progress/classrooms/:id
const classroomProgressUrl = API_ROUTES.ADMIN.PROGRESS.CLASSROOM('class-123');
// => '/admin/progress/classrooms/class-123'

// GET /admin/progress/students/:id
const studentProgressUrl = API_ROUTES.ADMIN.PROGRESS.STUDENT('student-456');
// => '/admin/progress/students/student-456'
```

### Users Management
```typescript
// GET /admin/users/stats
const statsUrl = API_ROUTES.ADMIN.USER_STATS;

// POST /admin/users/:id/suspend
const suspendUrl = API_ROUTES.ADMIN.USER_SUSPEND('user-123');
// => '/admin/users/user-123/suspend'

// POST /admin/users/bulk/suspend
const bulkSuspendUrl = API_ROUTES.ADMIN.USER_BULK_SUSPEND;
```

### Bulk Operations
```typescript
// POST /admin/bulk-operations/suspend-users
const suspendUsersUrl = API_ROUTES.ADMIN.BULK_OPERATIONS.SUSPEND_USERS;

// POST /admin/bulk-operations/update-role
const updateRoleUrl = API_ROUTES.ADMIN.BULK_OPERATIONS.UPDATE_ROLE;

// GET /admin/bulk-operations/:id
const operationStatusUrl = API_ROUTES.ADMIN.BULK_OPERATIONS.BY_ID('operation-123');
// => '/admin/bulk-operations/operation-123'
```

### System Management
```typescript
// GET /admin/system/health
const healthUrl = API_ROUTES.ADMIN.SYSTEM.HEALTH;

// GET /admin/system/audit-log
const auditLogUrl = API_ROUTES.ADMIN.SYSTEM.AUDIT_LOG;

// POST /admin/system/maintenance/cleanup-logs
const cleanupUrl = API_ROUTES.ADMIN.SYSTEM.MAINTENANCE_CLEANUP_LOGS;
```

### Gamification Config
```typescript
// GET /admin/gamification/config/settings
const settingsUrl = API_ROUTES.ADMIN.GAMIFICATION_CONFIG.SETTINGS;

// PUT /admin/gamification/config/parameters/:id
const updateParamUrl = API_ROUTES.ADMIN.GAMIFICATION_CONFIG.PARAMETER_BY_ID('param-123');
// => '/admin/gamification/config/parameters/param-123'

// PUT /admin/gamification/config/maya-ranks/:rankName
const updateRankUrl = API_ROUTES.ADMIN.GAMIFICATION_CONFIG.MAYA_RANK('ajaw');
// => '/admin/gamification/config/maya-ranks/ajaw'
```

---

## Patrones Comunes

### 1. Rutas Base (Listado)
```typescript
API_ROUTES.TEACHER.CONTENT.BASE          // '/teacher/content'
API_ROUTES.ADMIN.ALERTS.BASE             // '/admin/alerts'
```

### 2. Rutas por ID
```typescript
API_ROUTES.TEACHER.CONTENT.BY_ID(id)     // '/teacher/content/:id'
API_ROUTES.ADMIN.ALERTS.BY_ID(id)        // '/admin/alerts/:id'
```

### 3. Acciones sobre Recursos
```typescript
API_ROUTES.TEACHER.CONTENT.PUBLISH(id)   // '/teacher/content/:id/publish'
API_ROUTES.ADMIN.ALERTS.RESOLVE(id)      // '/admin/alerts/:id/resolve'
```

### 4. Recursos Anidados
```typescript
API_ROUTES.TEACHER.CLASSROOM_PROGRESS(classroomId)
// => '/teacher/classrooms/:classroomId/progress'

API_ROUTES.ADMIN.PROGRESS.CLASSROOM(classroomId)
// => '/admin/progress/classrooms/:classroomId'
```

---

## Uso en Axios/Fetch

### Ejemplo con Axios (Teacher)
```typescript
import axios from 'axios';
import { API_ROUTES } from '@/shared/constants/routes.constants';

// GET request
const getStudentProgress = async (studentId: string) => {
  const url = API_ROUTES.TEACHER.STUDENT_PROGRESS(studentId);
  const response = await axios.get(url);
  return response.data;
};

// POST request
const grantBonus = async (studentId: string, data: BonusDto) => {
  const url = API_ROUTES.TEACHER.STUDENT_BONUS(studentId);
  const response = await axios.post(url, data);
  return response.data;
};

// PATCH request
const resolveAlert = async (alertId: string, data: ResolveDto) => {
  const url = API_ROUTES.TEACHER.ALERTS.RESOLVE(alertId);
  const response = await axios.patch(url, data);
  return response.data;
};
```

### Ejemplo con Axios (Admin)
```typescript
import axios from 'axios';
import { API_ROUTES } from '@/shared/constants/routes.constants';

// GET request
const getAnalyticsOverview = async () => {
  const url = API_ROUTES.ADMIN.ANALYTICS.OVERVIEW;
  const response = await axios.get(url);
  return response.data;
};

// POST request
const bulkSuspendUsers = async (userIds: string[]) => {
  const url = API_ROUTES.ADMIN.BULK_OPERATIONS.SUSPEND_USERS;
  const response = await axios.post(url, { userIds });
  return response.data;
};
```

---

## Validación de Tipos

TypeScript infiere automáticamente los tipos:

```typescript
// ✅ Correcto - TypeScript sabe que necesita un string
const url1 = API_ROUTES.TEACHER.STUDENT_PROGRESS('student-123');

// ❌ Error - TypeScript detecta parámetro faltante
const url2 = API_ROUTES.TEACHER.STUDENT_PROGRESS(); // Error: Expected 1 argument

// ✅ Correcto - Múltiples parámetros
const url3 = API_ROUTES.TEACHER.CLASSROOM_STUDENT_BLOCK('class-1', 'student-2');

// ❌ Error - Orden de parámetros incorrecto
const url4 = API_ROUTES.TEACHER.CLASSROOM_STUDENT_BLOCK('student-2', 'class-1'); // Type error
```

---

## Helpers Disponibles

```typescript
import { buildApiUrl, extractBasePath, buildRoute } from '@/shared/constants/routes.constants';

// Construir URL completa con base /api/v1
const fullUrl = buildApiUrl('/teacher/content');
// => '/api/v1/teacher/content'

// Extraer base path (para @Controller)
const basePath = extractBasePath('/teacher/content');
// => 'teacher/content'

// Construir ruta con parámetros (legacy)
const route = buildRoute('/users/:id/posts/:postId', { id: '123', postId: '456' });
// => '/users/123/posts/456'
```

---

## Diferencias con Frontend

Si estás migrando desde `api-endpoints.ts` del frontend:

```typescript
// ANTES (Frontend)
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
const url = API_ENDPOINTS.TEACHER.STUDENTS.BONUS(studentId);

// AHORA (Backend - SSOT)
import { API_ROUTES } from '@/shared/constants/routes.constants';
const url = API_ROUTES.TEACHER.STUDENT_BONUS(studentId);
```

**Nota:** Sincroniza `api-endpoints.ts` del frontend con estas constantes.

---

## Debugging

```typescript
// Ver todas las rutas Teacher
console.log(API_ROUTES.TEACHER);

// Ver rutas de Alerts
console.log(API_ROUTES.TEACHER.ALERTS);

// Ver estructura Admin
console.log(API_ROUTES.ADMIN);
```

---

**Última actualización:** 2025-11-24  
**Versión routes.constants.ts:** 2.0 (165 endpoints)
