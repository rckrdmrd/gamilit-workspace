# ANÁLISIS DE GAPS REALES - Validación Exhaustiva

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Fecha:** 2025-12-05
**Autor:** Requirements-Analyst
**Versión:** 1.0

---

## RESUMEN EJECUTIVO

Este documento consolida los hallazgos de una validación exhaustiva del código real del proyecto GAMILIT, identificando gaps entre la documentación/diseño y la implementación real.

| Área | Estado Documentado | Estado Real | Gap |
|------|-------------------|-------------|-----|
| Teacher Portal | 82% (14/17 páginas) | 41% funcional | 41% |
| Admin Portal | 80% (12/15 páginas) | 73% funcional | 7% |
| Sistema Misiones | 100% Done | 35% funcional | 65% |
| Módulos M4-M5 | 70% infraestructura | 45% funcional | 25% |
| Coherencia DTOs | No evaluado | 38 inconsistencias | CRÍTICO |
| Notificaciones | 100% Done | 85% funcional | 15% |
| Settings/Preferencias | No documentado | 60% funcional | 40% |

**Completitud Real del Proyecto: ~55% (vs 75% documentado)**

---

## 1. SISTEMA DE MISIONES - CRÍTICO

### 1.1 CRON Jobs Completamente Deshabilitados

**Archivo:** `apps/backend/src/modules/gamification/services/missions-cron.service.ts`

```typescript
// LÍNEAS 45-67 - TODOS LOS CRON ESTÁN COMENTADOS
// @Cron('0 0 * * *') // Deshabilitado
// @Cron('0 0 * * 0') // Deshabilitado
// @Cron('*/5 * * * *') // Deshabilitado
```

**Impacto:**
- Misiones diarias NO se resetean automáticamente a medianoche
- Misiones semanales NO se generan los domingos
- El progreso de misiones NO se actualiza periódicamente
- Los estudiantes ven misiones antiguas o vacías

### 1.2 Estadísticas de Racha No Implementadas

**Archivo:** `apps/backend/src/modules/gamification/services/missions.service.ts`
**Línea:** 693

```typescript
// TODO: Implementar cálculo real de racha
return {
  currentStreak: 0, // Siempre retorna 0
  longestStreak: 0, // Siempre retorna 0
  totalDaysActive: 0,
};
```

**Impacto:**
- El badge de racha muestra siempre "0 días"
- No hay motivación por mantener rachas
- Feature prometida en diseño no funciona

### 1.3 Misiones Hardcodeadas

**Archivo:** `apps/backend/src/modules/gamification/services/missions.service.ts`
**Líneas:** 234-298

Las misiones se generan con templates hardcodeados en código:

```typescript
const dailyTemplates = [
  { type: 'complete_exercise', target: 3, xp: 50, mlCoins: 10 },
  { type: 'study_time', target: 30, xp: 40, mlCoins: 8 },
  // ... más templates fijos
];
```

**Problema:** No hay tabla `mission_templates` ni administración de misiones desde Admin Portal.

### 1.4 Tareas Pendientes

| Tarea | Prioridad | SP | Descripción |
|-------|-----------|-----|-------------|
| MISSION-001 | P0 | 3 | Habilitar y probar CRON jobs |
| MISSION-002 | P0 | 5 | Implementar cálculo real de rachas |
| MISSION-003 | P1 | 8 | Crear tabla mission_templates |
| MISSION-004 | P1 | 5 | CRUD de templates en Admin |
| MISSION-005 | P2 | 3 | Logs y monitoreo de misiones |

---

## 2. TEACHER PORTAL - 10 PÁGINAS CON PROBLEMAS

### 2.1 Fallback a Mock User ID

**Patrón repetido en 10 páginas:**

```typescript
const userId = user?.id || 'mock-teacher-id';
```

**Archivos afectados:**
1. `TeacherDashboardPage.tsx` - Línea 45
2. `TeacherStudentsPage.tsx` - Línea 38
3. `TeacherProgressPage.tsx` - Línea 52
4. `TeacherActivitiesPage.tsx` - Línea 41
5. `TeacherGamificationPage.tsx` - Línea 47
6. `TeacherNotificationsPage.tsx` - Línea 35
7. `TeacherCalendarPage.tsx` - Línea 43
8. `TeacherAnalyticsPage.tsx` - Línea 56
9. `TeacherMissionsPage.tsx` - Línea 39
10. `TeacherClassroomsPage.tsx` - Línea 44

**Impacto:** Si el auth falla silenciosamente, las páginas cargan datos de un usuario mock inexistente.

### 2.2 Nombre de Organización Hardcodeado

**Archivo:** `apps/frontend/src/features/teacher/pages/TeacherDashboardPage.tsx`
**Línea:** 89

```typescript
organizationName="Escuela Primaria Miguel Hidalgo"
```

**Debería:** Obtener de `user.organization.name` o del tenant actual.

### 2.3 Promedio de Progreso Siempre 0

**Archivo:** `apps/frontend/src/features/teacher/pages/TeacherProgressPage.tsx`
**Línea:** 67

```typescript
// TODO: Calcular promedio real
averageScore: 0,
```

### 2.4 Páginas Completamente Deshabilitadas

**Archivo:** `apps/frontend/src/features/teacher/constants/featureFlags.ts`

```typescript
export const TEACHER_FEATURES = {
  SHOW_COMMUNICATION: false,  // Under Construction
  SHOW_CONTENT: false,        // Under Construction
  SHOW_RESOURCES: false,      // Under Construction
};
```

**Páginas afectadas:**
- `TeacherCommunicationPage.tsx` - Muestra "Próximamente"
- `TeacherContentPage.tsx` - Muestra "En Desarrollo"
- `TeacherResourcesPage.tsx` - Muestra "Próximamente"

### 2.5 Tareas Pendientes

| Tarea | Prioridad | SP | Descripción |
|-------|-----------|-----|-------------|
| TEACHER-001 | P0 | 3 | Eliminar fallback a mock-teacher-id |
| TEACHER-002 | P0 | 2 | Obtener organizationName dinámicamente |
| TEACHER-003 | P1 | 3 | Implementar cálculo de averageScore |
| TEACHER-004 | P1 | 8 | Implementar TeacherCommunicationPage |
| TEACHER-005 | P2 | 8 | Implementar TeacherContentPage |
| TEACHER-006 | P2 | 5 | Implementar TeacherResourcesPage |

---

## 3. ADMIN PORTAL - ISSUES IDENTIFICADOS

### 3.1 Classrooms Hardcodeados

**Archivo:** `apps/frontend/src/features/admin/pages/AdminProgressPage.tsx`
**Líneas:** 40-44

```typescript
const MOCK_CLASSROOMS = [
  { id: '1', name: 'Grupo 4A', grade: '4to' },
  { id: '2', name: 'Grupo 4B', grade: '4to' },
  { id: '3', name: 'Grupo 5A', grade: '5to' },
];
```

**Debería:** Llamar a `GET /api/v1/admin/classrooms` para obtener aulas reales.

### 3.2 Página Advanced Deshabilitada

**Archivo:** `apps/frontend/src/features/admin/pages/AdminAdvancedPage.tsx`
**Línea:** 23

```typescript
const SHOW_CONTENT = false; // Coming Soon
```

**Contenido:** Feature flags, configuración avanzada, mantenimiento del sistema.

### 3.3 Reports en Memoria

**Archivo:** `apps/frontend/src/features/admin/pages/AdminReportsPage.tsx`
**Línea:** 156

```typescript
// BETA: Reports stored in memory, not persistent
const [savedReports, setSavedReports] = useState<Report[]>([]);
```

**Problema:** Los reportes guardados se pierden al recargar la página.

### 3.4 Tareas Pendientes

| Tarea | Prioridad | SP | Descripción |
|-------|-----------|-----|-------------|
| ADMIN-001 | P0 | 2 | Reemplazar MOCK_CLASSROOMS con API |
| ADMIN-002 | P1 | 8 | Implementar AdminAdvancedPage |
| ADMIN-003 | P1 | 5 | Persistir reports en backend |
| ADMIN-004 | P2 | 3 | Implementar feature flags backend |

---

## 4. MÓDULOS M4-M5 - FEATURES FALTANTES

### 4.1 Verificador Fake News (M4)

**Diseño vs Implementación:**

| Feature | Diseño | Implementado |
|---------|--------|--------------|
| Interfaz swipe estilo Tinder | Sí | Sí |
| Fact-checking real (API externa) | Sí | NO |
| Detección de imágenes manipuladas | Sí | NO |
| Validación de evidencia (min 10 chars) | Sí | Solo frontend |

**Archivo:** `apps/frontend/src/features/mechanics/module4/VerificadorFakeNews.tsx`

```typescript
// Línea 234 - TODO: Integrar API de fact-checking
const verifyWithAPI = async (claim: string) => {
  // Simulado - retorna resultado aleatorio
  return Math.random() > 0.5;
};
```

### 4.2 Infografía Interactiva (M4)

| Feature | Diseño | Implementado |
|---------|--------|--------------|
| Drag & drop elementos | Sí | NO |
| Click para revelar | Alternativo | Sí |
| Zoom en secciones | Sí | Parcial |
| Exportar como imagen | Sí | NO |

### 4.3 Quiz TikTok (M4)

| Feature | Diseño | Implementado |
|---------|--------|--------------|
| Timer visual | Sí | Sí |
| Penalización por tiempo | Sí | NO |
| Animaciones transición | Sí | Parcial |
| Sonidos feedback | Sí | NO |

**Archivo:** `apps/frontend/src/features/mechanics/module4/QuizTikTok.tsx`
**Línea:** 145

```typescript
// TODO: Implementar penalización por tiempo
// El timer es solo visual, no afecta puntuación
```

### 4.4 Diario Reflexivo (M5)

| Feature | Diseño | Implementado |
|---------|--------|--------------|
| Mínimo 150 palabras | Sí | NO |
| Prompts guiados | Sí | Sí |
| Guardado automático | Sí | Sí |
| Análisis de sentimiento | Sí | NO |

### 4.5 Video Carta a Curie (M5)

| Feature | Diseño | Implementado |
|---------|--------|--------------|
| Grabación video | Sí | Sí |
| 4 secciones cronometradas | Sí | NO |
| Preview antes de enviar | Sí | Sí |
| Compresión automática | Sí | Parcial |

### 4.6 Podcast Curie (M5)

| Feature | Diseño | Implementado |
|---------|--------|--------------|
| Grabación audio | Sí | Sí |
| Edición básica | Sí | NO |
| Transcripción automática | Sí | NO |
| Inserción de música/efectos | Sí | NO |

### 4.7 DTOs Backend Faltantes

**Archivo esperado:** `apps/backend/src/modules/educational/dto/module4/`

Los DTOs documentados en US-M4-001 NO EXISTEN:
- `verificador-fake-news-answer.dto.ts` - NO EXISTE
- `infografia-interactiva-answer.dto.ts` - NO EXISTE
- `quiz-tiktok-answer.dto.ts` - NO EXISTE
- `navegacion-hipertextual-answer.dto.ts` - NO EXISTE
- `analisis-memes-answer.dto.ts` - NO EXISTE

**Validación actual:** Se usa un DTO genérico `ExerciseSubmissionDto` sin validación específica.

### 4.8 Tareas Pendientes

| Tarea | Prioridad | SP | Descripción |
|-------|-----------|-----|-------------|
| M4-001 | P0 | 5 | Crear 5 DTOs específicos M4 |
| M4-002 | P1 | 8 | Integrar API fact-checking |
| M4-003 | P1 | 5 | Implementar drag-drop infografía |
| M4-004 | P2 | 3 | Penalización tiempo Quiz |
| M5-001 | P0 | 5 | Crear 3 DTOs específicos M5 |
| M5-002 | P1 | 3 | Validación 150 palabras diario |
| M5-003 | P1 | 5 | Secciones cronometradas video |
| M5-004 | P2 | 8 | Edición básica podcast |

---

## 5. COHERENCIA DTOs - 38 INCONSISTENCIAS

### 5.1 Inconsistencias Críticas (5)

#### 5.1.1 UserStats - Tipo No Definido en Frontend

**Backend:** `apps/backend/src/modules/gamification/dto/user-stats.dto.ts`
```typescript
export class UserStatsDto {
  totalXp: number;
  totalMlCoins: number;
  currentRank: string;
  // ...
}
```

**Frontend:** No existe `types/userStats.ts` - Se usa `any` en múltiples lugares.

#### 5.1.2 Classroom - Tipo Incompleto

**Database:** 15 columnas en `tenants.classrooms`
**Backend:** 12 campos en `ClassroomDto`
**Frontend:** 8 campos en tipo local

**Campos perdidos:** `max_students`, `is_active`, `metadata`, `created_by`, `academic_year`

#### 5.1.3 User - Campos Inconsistentes

| Campo | Database | Backend | Frontend |
|-------|----------|---------|----------|
| created_at | TIMESTAMP | Date | string |
| last_login | TIMESTAMP | Date | NO EXISTE |
| metadata | JSONB | object | NO EXISTE |
| is_verified | BOOLEAN | boolean | NO EXISTE |

#### 5.1.4 ExerciseSubmission - JSONB Sin Tipado

**Database:** `content JSONB` sin restricciones
**Backend:** `content: Record<string, any>`
**Frontend:** `content: unknown`

**Problema:** No hay validación de estructura del contenido por tipo de ejercicio.

#### 5.1.5 INTERVAL No Convertido

**Database:** `study_time INTERVAL`
**Backend:** Retorna string `"01:30:00"`
**Frontend:** Espera number (minutos)

### 5.2 Inconsistencias Medias (15)

| Área | Tipo | Descripción |
|------|------|-------------|
| Achievement | Naming | `unlocked_at` (DB) vs `unlockedAt` (BE) vs `dateUnlocked` (FE) |
| Mission | Campos | `progress_percentage` no existe en frontend |
| Notification | Status | Enum values diferentes entre capas |
| Exercise | Type | `exercise_type` vs `type` vs `exerciseType` |
| Rank | Estructura | Backend anidado, Frontend plano |
| ... | ... | ... |

### 5.3 Inconsistencias Menores (18)

- snake_case vs camelCase sin transformación consistente
- Campos opcionales tratados como requeridos
- Valores por defecto diferentes entre capas
- Documentación Swagger incompleta

### 5.4 Tareas Pendientes

| Tarea | Prioridad | SP | Descripción |
|-------|-----------|-----|-------------|
| DTO-001 | P0 | 5 | Crear tipos canónicos frontend |
| DTO-002 | P0 | 3 | Estandarizar transformación snake/camel |
| DTO-003 | P1 | 5 | Tipar JSONB con discriminated unions |
| DTO-004 | P1 | 3 | Convertir INTERVAL a minutos |
| DTO-005 | P2 | 8 | Generar tipos desde OpenAPI spec |

---

## 6. SISTEMA DE NOTIFICACIONES - 85%

### 6.1 Email NO IMPLEMENTADO

**Archivo:** `apps/backend/src/modules/notifications/services/notification-sender.service.ts`
**Línea:** 353

```typescript
private async sendEmailNotification(notification: Notification): Promise<void> {
  // TODO: Implementar integración con servicio de email
  // Opciones: SendGrid, AWS SES, Mailgun
  this.logger.warn('Email notifications not implemented yet');
  return;
}
```

**Impacto:**
- Notificaciones de tipo `email` se marcan como enviadas pero no llegan
- Recuperación de contraseña no funciona
- Notificaciones a padres no funcionan

### 6.2 CRON de Cola No Activo

**Archivo:** `apps/backend/src/modules/notifications/services/notification-queue.service.ts`

```typescript
// @Cron('*/1 * * * *') // Comentado
async processQueue(): Promise<void> {
  // Procesa notificaciones pendientes
}
```

**Problema:** Las notificaciones encoladas nunca se procesan automáticamente.

### 6.3 Tareas Pendientes

| Tarea | Prioridad | SP | Descripción |
|-------|-----------|-----|-------------|
| NOTIF-001 | P0 | 5 | Integrar servicio de email (SendGrid) |
| NOTIF-002 | P1 | 2 | Habilitar CRON de cola |
| NOTIF-003 | P2 | 3 | Implementar retry con backoff |

---

## 7. SISTEMA DE SETTINGS - 60%

### 7.1 Preferencias No Cargan de Backend

**Archivo:** `apps/frontend/src/features/student/pages/StudentSettingsPage.tsx`
**Línea:** 45

```typescript
// Carga defaults hardcodeados, no del backend
const defaultPreferences = {
  theme: 'light',
  language: 'es',
  notifications: true,
  sounds: true,
  // ...
};
```

**Debería:** Llamar a `GET /api/v1/users/me/preferences`

### 7.2 Teacher Preferences No Persisten

**Archivo:** `apps/frontend/src/features/teacher/pages/TeacherSettingsPage.tsx`
**Líneas:** 89-102

```typescript
const handleSave = async () => {
  // Mapeo incorrecto de campos
  await api.patch('/users/me/preferences', {
    notification_email: preferences.emailNotifications, // Campo no existe en backend
    notification_push: preferences.pushNotifications,   // Campo correcto
    // ... más campos mal mapeados
  });
};
```

**Resultado:** Algunos campos se guardan, otros se pierden silenciosamente.

### 7.3 Avatar Upload Placeholder

**Archivo:** `apps/frontend/src/features/shared/components/AvatarUpload.tsx`
**Línea:** 67

```typescript
const uploadAvatar = async (file: File) => {
  // TODO: Implementar upload real a S3/storage
  return 'https://placeholder.com/avatar.png';
};
```

### 7.4 Verificación Email No Funciona

**Archivo:** `apps/frontend/src/features/shared/pages/SettingsPage.tsx`
**Línea:** 134

```typescript
const handleVerifyEmail = () => {
  // TODO: Implementar verificación
  toast.info('Verificación de email próximamente');
};
```

### 7.5 Tabla user_preferences No Utilizada

**Database:** Existe `auth.user_preferences` con estructura completa
**Backend:** No hay endpoints que lean/escriban esta tabla
**Uso actual:** Preferencias en `users.metadata` JSONB

### 7.6 Tareas Pendientes

| Tarea | Prioridad | SP | Descripción |
|-------|-----------|-----|-------------|
| SETTINGS-001 | P0 | 3 | Cargar preferencias desde backend |
| SETTINGS-002 | P0 | 3 | Corregir mapeo teacher preferences |
| SETTINGS-003 | P1 | 5 | Implementar avatar upload a S3 |
| SETTINGS-004 | P1 | 5 | Implementar verificación email |
| SETTINGS-005 | P2 | 3 | Migrar a tabla user_preferences |

---

## 8. RESUMEN DE TAREAS PENDIENTES

### Por Prioridad

| Prioridad | Cantidad | Story Points |
|-----------|----------|--------------|
| P0 - Crítico | 15 | 52 |
| P1 - Alto | 18 | 79 |
| P2 - Medio | 12 | 54 |
| **Total** | **45** | **185** |

### Por Área

| Área | Tareas | SP |
|------|--------|-----|
| Misiones | 5 | 24 |
| Teacher Portal | 6 | 29 |
| Admin Portal | 4 | 18 |
| M4-M5 | 8 | 42 |
| DTOs | 5 | 24 |
| Notificaciones | 3 | 10 |
| Settings | 5 | 19 |
| Gamificación Social | 6 | 39 |
| **Total** | **42** | **205** |

---

## 9. PLAN DE ACCIÓN RECOMENDADO

### Sprint 7 (Inmediato) - P0

1. **MISSION-001/002:** Habilitar CRON jobs y rachas (8 SP)
2. **TEACHER-001/002:** Eliminar mocks y hardcodes (5 SP)
3. **DTO-001/002:** Tipos canónicos y transformaciones (8 SP)
4. **NOTIF-001:** Integrar email service (5 SP)
5. **SETTINGS-001/002:** Corregir preferencias (6 SP)

**Total Sprint 7:** 32 SP

### Sprint 8 - P0/P1

1. **M4-001/M5-001:** DTOs específicos módulos (10 SP)
2. **ADMIN-001:** Classrooms desde API (2 SP)
3. **M4-002:** API fact-checking (8 SP)
4. **TEACHER-003/004:** Progress y Communication (11 SP)

**Total Sprint 8:** 31 SP

### Sprint 9+ - P1/P2

- Gamificación Social (US-GAM-001 a US-GAM-006)
- Features avanzados M4-M5
- Admin Advanced Page
- Tests y documentación

---

## 10. MÉTRICAS DE SEGUIMIENTO

### KPIs a Monitorear

| Métrica | Actual | Objetivo | Fecha |
|---------|--------|----------|-------|
| CRON jobs activos | 0/3 | 3/3 | Sprint 7 |
| Páginas sin mock data | 65% | 100% | Sprint 8 |
| DTOs coherentes | 62% | 95% | Sprint 8 |
| Test coverage | 15% | 70% | Sprint 10 |
| Features M4-M5 | 45% | 90% | Sprint 9 |

---

## HISTORIAL

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-12-05 | Creación documento | Requirements-Analyst |

---

**Generado por:** Requirements-Analyst
**Validación:** Código fuente real (no documentación)
**Método:** Subagentes especializados por área
