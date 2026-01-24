# HISTORIAS DE USUARIO P2 - CRITICAS (P0)

**Proyecto:** GAMILIT
**Fecha:** 2025-12-05
**Sprint:** P2-A
**Prioridad:** P0 - Bloquean Release

---

## US-P2-001: Eliminar Fallback Mock-Teacher-ID

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-P2-001 |
| **Epica** | P2-TEACHER-EXT |
| **Modulo** | teacher |
| **Prioridad** | P0 |
| **Story Points** | 3 |
| **Sprint** | P2-A |
| **Estado** | Ready |
| **Asignado a** | Frontend-Agent |

---

### Historia de Usuario

**Como** desarrollador,
**quiero** eliminar el fallback a 'mock-teacher-id' en las paginas del Teacher Portal,
**para** garantizar que solo se usen datos reales de usuarios autenticados.

### Descripcion Detallada

Actualmente, 10 paginas del Teacher Portal tienen el patron:
```typescript
const userId = user?.id || 'mock-teacher-id';
```

Este fallback oculta errores de autenticacion y puede causar que se carguen datos inexistentes o erroneos en produccion.

### Criterios de Aceptacion

**Escenario 1: Usuario autenticado correctamente**
```gherkin
DADO que un docente esta autenticado
CUANDO accede a cualquier pagina del Teacher Portal
ENTONCES se usa su userId real del contexto de auth
Y se cargan sus datos correctamente
```

**Escenario 2: Usuario no autenticado**
```gherkin
DADO que un usuario no esta autenticado
CUANDO intenta acceder a una pagina del Teacher Portal
ENTONCES es redirigido al login
Y NO se usa ningun mock-id
```

**Escenario 3: Error de autenticacion**
```gherkin
DADO que hay un error obteniendo el usuario
CUANDO se detecta user?.id undefined
ENTONCES se muestra un mensaje de error apropiado
Y se redirige al login
```

### Tareas Tecnicas

**Frontend:**
- [ ] FE-P2-001: Modificar TeacherDashboardPage.tsx (linea 45)
- [ ] FE-P2-002: Modificar TeacherStudentsPage.tsx (linea 38)
- [ ] FE-P2-003: Modificar TeacherProgressPage.tsx (linea 52)
- [ ] FE-P2-004: Modificar TeacherActivitiesPage.tsx (linea 41)
- [ ] FE-P2-005: Modificar TeacherGamificationPage.tsx (linea 47)
- [ ] FE-P2-006: Modificar TeacherNotificationsPage.tsx (linea 35)
- [ ] FE-P2-007: Modificar TeacherCalendarPage.tsx (linea 43)
- [ ] FE-P2-008: Modificar TeacherAnalyticsPage.tsx (linea 56)
- [ ] FE-P2-009: Modificar TeacherMissionsPage.tsx (linea 39)
- [ ] FE-P2-010: Modificar TeacherClassroomsPage.tsx (linea 44)

**Patron de correccion:**
```typescript
// ANTES (incorrecto)
const userId = user?.id || 'mock-teacher-id';

// DESPUES (correcto)
const userId = user?.id;
if (!userId) {
  navigate('/login');
  return null;
}
```

### Notas de Implementacion

- Considerar crear un hook `useAuthenticatedUser()` que maneje la validacion
- El hook debe lanzar redirect si no hay usuario
- Agregar loading state mientras se verifica auth

---

## US-P2-002: Estandarizar Transformacion Snake/Camel Case

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-P2-002 |
| **Epica** | P2-QUALITY |
| **Modulo** | shared |
| **Prioridad** | P0 |
| **Story Points** | 3 |
| **Sprint** | P2-A |
| **Estado** | Ready |
| **Asignado a** | Full-stack |

---

### Historia de Usuario

**Como** desarrollador,
**quiero** una transformacion consistente entre snake_case (DB/API) y camelCase (Frontend),
**para** evitar errores silenciosos por campos mal mapeados.

### Descripcion Detallada

Se identificaron 38 inconsistencias en DTOs entre capas:
- Backend retorna `created_at`, frontend espera `createdAt`
- Backend retorna `unlocked_at`, frontend usa `dateUnlocked`
- INTERVAL de BD retorna string "01:30:00", frontend espera number

### Criterios de Aceptacion

**Escenario 1: Response del backend**
```gherkin
DADO que el backend retorna datos en snake_case
CUANDO el frontend recibe la respuesta
ENTONCES los campos se transforman automaticamente a camelCase
```

**Escenario 2: Request al backend**
```gherkin
DADO que el frontend envia datos en camelCase
CUANDO se hace una request al backend
ENTONCES los campos se transforman automaticamente a snake_case
```

**Escenario 3: Campos INTERVAL**
```gherkin
DADO que el backend retorna un campo INTERVAL como string
CUANDO el frontend recibe "01:30:00"
ENTONCES se transforma a numero de minutos (90)
```

### Tareas Tecnicas

**Frontend:**
- [ ] FE-P2-011: Crear utilidad `transformKeys.ts` con funciones snake<->camel
- [ ] FE-P2-012: Crear transformer para INTERVAL -> minutos
- [ ] FE-P2-013: Integrar transformers en axios interceptors
- [ ] FE-P2-014: Actualizar tipos TypeScript afectados

**Backend:**
- [ ] BE-P2-001: Configurar class-transformer para responses
- [ ] BE-P2-002: Documentar convencion en Swagger

### Archivos a Crear/Modificar

```
apps/frontend/src/utils/
├── transformKeys.ts (nuevo)
├── intervalToMinutes.ts (nuevo)
└── index.ts (actualizar exports)

apps/frontend/src/config/
└── axios.config.ts (agregar interceptors)
```

---

## US-P2-003: Crear Tipos Canonicos Frontend

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-P2-003 |
| **Epica** | P2-QUALITY |
| **Modulo** | types |
| **Prioridad** | P0 |
| **Story Points** | 5 |
| **Sprint** | P2-A |
| **Estado** | Ready |
| **Asignado a** | Frontend-Agent |

---

### Historia de Usuario

**Como** desarrollador frontend,
**quiero** tipos TypeScript canonicos que coincidan con el backend,
**para** tener type-safety completo y evitar errores en runtime.

### Descripcion Detallada

Se identificaron 5 tipos criticos sin definicion o con inconsistencias:
1. `UserStats` - usado como `any` en multiples lugares
2. `Classroom` - 8 campos en frontend vs 15 en BD
3. `User` - campos faltantes (last_login, metadata, is_verified)
4. `ExerciseSubmission` - content tipado como `unknown`
5. `Achievement` - naming inconsistente de campos

### Criterios de Aceptacion

**Escenario 1: UserStats tipado**
```gherkin
DADO que importo UserStats de @/types
CUANDO uso el tipo en un componente
ENTONCES tengo autocompletado para todos los campos (totalXp, totalMlCoins, currentRank, etc.)
```

**Escenario 2: Classroom completo**
```gherkin
DADO que recibo un Classroom del backend
CUANDO lo asigno a una variable tipada
ENTONCES TypeScript valida los 15 campos esperados
```

### Tareas Tecnicas

**Frontend:**
- [ ] FE-P2-015: Crear `types/userStats.ts` con UserStats interface
- [ ] FE-P2-016: Actualizar `types/classroom.ts` con campos faltantes
- [ ] FE-P2-017: Actualizar `types/user.ts` con campos faltantes
- [ ] FE-P2-018: Crear `types/exerciseSubmission.ts` con discriminated unions
- [ ] FE-P2-019: Estandarizar `types/achievement.ts`
- [ ] FE-P2-020: Actualizar imports en componentes afectados

### Tipos a Definir

```typescript
// types/userStats.ts
export interface UserStats {
  id: string;
  userId: string;
  totalXp: number;
  totalMlCoins: number;
  currentRank: MayaRank;
  currentLevel: number;
  exercisesCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  studyTimeMinutes: number; // Convertido de INTERVAL
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// types/classroom.ts
export interface Classroom {
  id: string;
  name: string;
  grade: string;
  section?: string;
  organizationId: string;
  teacherId: string;
  maxStudents: number;      // FALTANTE
  isActive: boolean;        // FALTANTE
  metadata: Record<string, unknown>; // FALTANTE
  createdBy: string;        // FALTANTE
  academicYear: string;     // FALTANTE
  createdAt: Date;
  updatedAt: Date;
}
```

---

## US-P2-004: Habilitar CRON Misiones en Produccion

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-P2-004 |
| **Epica** | P2-QUALITY |
| **Modulo** | gamification |
| **Prioridad** | P0 |
| **Story Points** | 2 |
| **Sprint** | P2-A |
| **Estado** | Ready |
| **Asignado a** | Backend-Agent |

---

### Historia de Usuario

**Como** administrador del sistema,
**quiero** que los CRON jobs de misiones esten habilitados en produccion,
**para** que las misiones diarias/semanales se reseteen automaticamente.

### Descripcion Detallada

Los CRON jobs en `missions-cron.service.ts` fueron habilitados en Sprint P1 pero necesitan validacion en produccion y monitoreo.

### Criterios de Aceptacion

**Escenario 1: Reset diario**
```gherkin
DADO que es medianoche (00:00 UTC)
CUANDO se ejecuta el CRON diario
ENTONCES se generan 3 nuevas misiones diarias para cada usuario activo
Y las misiones del dia anterior se marcan como expiradas
```

**Escenario 2: Reset semanal**
```gherkin
DADO que es domingo a medianoche
CUANDO se ejecuta el CRON semanal
ENTONCES se generan 2 nuevas misiones semanales para cada usuario activo
```

**Escenario 3: Logging**
```gherkin
DADO que se ejecuta cualquier CRON job
CUANDO completa la ejecucion
ENTONCES se registra en logs: usuarios procesados, misiones creadas, tiempo de ejecucion
```

### Tareas Tecnicas

**Backend:**
- [ ] BE-P2-003: Verificar decoradores @Cron estan descomentados
- [ ] BE-P2-004: Agregar logging detallado
- [ ] BE-P2-005: Configurar alertas si CRON falla
- [ ] BE-P2-006: Crear endpoint GET /admin/cron/status

**DevOps:**
- [ ] OPS-P2-001: Verificar timezone del servidor (UTC)
- [ ] OPS-P2-002: Configurar monitoreo de CRON jobs

---

## US-P2-005: Implementar Calculo Real de Rachas

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-P2-005 |
| **Epica** | P2-QUALITY |
| **Modulo** | gamification |
| **Prioridad** | P0 |
| **Story Points** | 5 |
| **Sprint** | P2-A |
| **Estado** | Ready |
| **Asignado a** | Backend-Agent |

---

### Historia de Usuario

**Como** estudiante,
**quiero** ver mi racha real de dias consecutivos de actividad,
**para** motivarme a mantener el habito de estudio.

### Descripcion Detallada

Actualmente `getStreakStats()` retorna siempre 0 para todos los campos:
```typescript
// TODO: Implementar cálculo real de racha
return {
  currentStreak: 0,
  longestStreak: 0,
  totalDaysActive: 0,
};
```

### Criterios de Aceptacion

**Escenario 1: Racha activa**
```gherkin
DADO que complete ejercicios ayer y hoy
CUANDO consulto mis estadisticas de racha
ENTONCES currentStreak = 2
```

**Escenario 2: Racha rota**
```gherkin
DADO que no complete ejercicios ayer pero si hoy
CUANDO consulto mis estadisticas de racha
ENTONCES currentStreak = 1
```

**Escenario 3: Record de racha**
```gherkin
DADO que mi racha actual supera mi record anterior
CUANDO actualizo mi racha
ENTONCES longestStreak se actualiza al nuevo valor
```

### Tareas Tecnicas

**Backend:**
- [ ] BE-P2-007: Implementar logica de calculo en MissionsService
- [ ] BE-P2-008: Crear query para obtener dias con actividad
- [ ] BE-P2-009: Agregar campo longest_streak a user_stats si no existe
- [ ] BE-P2-010: Crear CRON nocturno para actualizar rachas

**Database:**
- [ ] DB-P2-001: Verificar indices en exercise_submissions por fecha

### Algoritmo Propuesto

```typescript
async getStreakStats(userId: string): Promise<StreakStats> {
  // Obtener fechas unicas con actividad (ultimos 365 dias)
  const activityDates = await this.getActivityDates(userId);

  // Calcular racha actual (dias consecutivos hasta hoy)
  const today = new Date();
  let currentStreak = 0;
  let checkDate = today;

  while (activityDates.has(formatDate(checkDate))) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  }

  // Calcular racha mas larga
  const longestStreak = this.calculateLongestStreak(activityDates);

  return {
    currentStreak,
    longestStreak,
    totalDaysActive: activityDates.size,
  };
}
```

---

## RESUMEN TAREAS P0

| US | Tarea | SP | Asignado | Dependencias |
|----|-------|-----|----------|--------------|
| US-P2-001 | Eliminar mock-teacher-id | 3 | Frontend | Ninguna |
| US-P2-002 | Transformacion snake/camel | 3 | Full-stack | Ninguna |
| US-P2-003 | Tipos canonicos frontend | 5 | Frontend | US-P2-002 |
| US-P2-004 | CRON produccion | 2 | Backend | Ninguna |
| US-P2-005 | Calculo rachas | 5 | Backend | Ninguna |

**Total P0:** 18 SP

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-05
