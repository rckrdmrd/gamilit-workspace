# Inventario Completo de Módulos - GAMILIT Backend

Documento generado automáticamente que cataloga la estructura de todos los módulos en `apps/backend/src/modules/`.

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estadísticas Generales](#estadísticas-generales)
3. [Módulos por Categoría SIMCO](#módulos-por-categoría-simco)
4. [Detalle de Cada Módulo](#detalle-de-cada-módulo)

---

## Resumen Ejecutivo

Este proyecto cuenta con **17 módulos** organizados bajo el sistema SIMCO (Sistema de Gestión de Módulos Complementarios) con 11 categorías:

- **AUTH**: Autenticación y Autorización
- **GAM**: Gamificación (Logros, Monedas, Ranking)
- **EDU**: Educación (Módulos Educativos, Ejercicios)
- **PRG**: Progreso del Estudiante
- **SOC**: Social (Aulas, Equipos, Amistades)
- **NOT**: Notificaciones
- **CNT**: Contenido (Plantillas, Archivos Media)
- **AUD**: Auditoría
- **TCH**: Herramientas de Profesor
- **ADM**: Administración
- **ASG**: Asignaciones/Tareas

---

## Estadísticas Generales

| Métrica | Cantidad |
|---------|----------|
| **Total de Módulos** | 17 |
| **Total de Controllers** | 34 |
| **Total de Services** | 45 |
| **Total de Entities** | 47 |
| **Total de DTOs** | 146 |
| **Total de Archivos TypeScript** | 272 |

---

## Módulos por Categoría SIMCO

### ADM (Administración)
- `admin` - Gestión administrativa del sistema
- `core` - Módulo core del sistema

### ASG (Asignaciones)
- `assignments` - Asignaciones y tareas de estudiantes

### AUD (Auditoría)
- `audit` - Registro y auditoría de actividades

### AUTH (Autenticación)
- `auth` - Autenticación, autorización y gestión de sesiones

### CNT (Contenido)
- `content` - Plantillas de contenido y archivos multimedia

### EDU (Educación)
- `educational` - Módulos educativos, ejercicios y rúbricas
- `tasks` - Tareas programadas (cron jobs)

### GAM (Gamificación)
- `gamification` - Logros, ranking, monedas ML
- `missions` - Misiones y recompensas
- `powerups` - Power-ups y artículos especiales

### NOT (Notificaciones)
- `mail` - Servicio de correo
- `notifications` - Sistema de notificaciones
- `websocket` - Conexiones WebSocket en tiempo real

### PRG (Progreso)
- `progress` - Seguimiento del progreso estudiantil

### SOC (Social)
- `social` - Aulas, equipos, amistades y desafíos colaborativos

### TCH (Profesor)
- `teacher` - Herramientas y dashboards para profesores

---

## Detalle de Cada Módulo

### [ADM] ADMIN - Administración del Sistema

**Propósito**: Gestionar contenido, organizaciones, usuarios y configuración del sistema.

**Controllers** (4):
- `admin/controllers/admin-content.controller.ts` - Gestión de contenido
- `admin/controllers/admin-organizations.controller.ts` - Gestión de organizaciones
- `admin/controllers/admin-system.controller.ts` - Configuración del sistema
- `admin/controllers/admin-users.controller.ts` - Gestión de usuarios

**Services** (4):
- `admin/services/admin-content.service.ts`
- `admin/services/admin-organizations.service.ts`
- `admin/services/admin-system.service.ts`
- `admin/services/admin-users.service.ts`

**DTOs** (30): Incluye DTOs para aprobación/rechazo de contenido, gestión de organizaciones, usuarios y métricas del sistema.

**Entities**: Ninguna (utiliza entidades de otros módulos)

---

### [ASG] ASSIGNMENTS - Asignaciones

**Propósito**: Crear y gestionar asignaciones que pueden asignarse a aulas.

**Controllers** (1):
- `assignments/controllers/assignments.controller.ts`

**Services** (1):
- `assignments/services/assignments.service.ts`

**Entities** (3):
- `assignments/entities/assignment.entity.ts`
- `assignments/entities/assignment-classroom.entity.ts`
- `assignments/entities/assignment-submission.entity.ts`

**DTOs** (4):
- Crear asignaciones
- Asignar a aulas
- Calificar entregas
- Actualizar asignaciones

---

### [AUD] AUDIT - Auditoría

**Propósito**: Registrar y auditar todas las actividades del sistema.

**Services** (1):
- `audit/services/audit.service.ts`

**Entities** (1):
- `audit/entities/audit-log.entity.ts`

**DTOs** (1):
- `audit/dto/create-audit-log.dto.ts`

---

### [AUTH] AUTH - Autenticación y Autorización

**Propósito**: Autenticación de usuarios, gestión de sesiones, recuperación de contraseña y verificación de email.

**Controllers** (2):
- `auth/controllers/auth.controller.ts` - Autenticación
- `auth/controllers/password.controller.ts` - Recuperación de contraseña

**Services** (5):
- `auth/services/auth.service.ts`
- `auth/services/email-verification.service.ts`
- `auth/services/password-recovery.service.ts`
- `auth/services/security.service.ts`
- `auth/services/session-management.service.ts`

**Entities** (10):
- User, Profile, Tenant, UserRole
- AuthAttempt, AuthProvider
- UserSession, Membership
- EmailVerificationToken, PasswordResetToken

**DTOs** (31): Login, registro, verificación de email, reset de contraseña, gestión de perfiles.

---

### [CNT] CONTENT - Contenido

**Propósito**: Gestionar plantillas de contenido, contenido Marie Curie y archivos multimedia.

**Controllers** (3):
- `content/controllers/content-templates.controller.ts`
- `content/controllers/marie-curie-content.controller.ts`
- `content/controllers/media-files.controller.ts`

**Services** (3):
- `content/services/content-templates.service.ts`
- `content/services/marie-curie-content.service.ts`
- `content/services/media-files.service.ts`

**Entities** (3):
- `content/entities/content-template.entity.ts`
- `content/entities/marie-curie-content.entity.ts`
- `content/entities/media-file.entity.ts`

**DTOs** (6): Crear plantillas, crear contenido, crear archivos media.

---

### [EDU] EDUCATIONAL - Educación

**Propósito**: Gestionar módulos educativos, ejercicios, rúbricas de evaluación y recursos multimedia.

**Controllers** (3):
- `educational/controllers/exercises.controller.ts`
- `educational/controllers/media.controller.ts`
- `educational/controllers/modules.controller.ts`

**Services** (3):
- `educational/services/exercises.service.ts`
- `educational/services/media.service.ts`
- `educational/services/modules.service.ts`

**Entities** (4):
- `educational/entities/module.entity.ts`
- `educational/entities/exercise.entity.ts`
- `educational/entities/media-resource.entity.ts`
- `educational/entities/assessment-rubric.entity.ts`

**DTOs** (8): Crear módulos, ejercicios, rúbricas de evaluación.

---

### [GAM] GAMIFICATION - Gamificación

**Propósito**: Gestionar logros, ranking de usuarios, monedas ML (Machine Learning) y estadísticas de juego.

**Controllers** (5):
- `gamification/controllers/achievements.controller.ts`
- `gamification/controllers/leaderboard.controller.ts`
- `gamification/controllers/ml-coins.controller.ts`
- `gamification/controllers/ranks.controller.ts`
- `gamification/controllers/user-stats.controller.ts`

**Services** (5):
- `gamification/services/achievements.service.ts`
- `gamification/services/leaderboard.service.ts`
- `gamification/services/ml-coins.service.ts`
- `gamification/services/ranks.service.ts`
- `gamification/services/user-stats.service.ts`

**Entities** (11):
- Achievement, AchievementCategory, UserAchievement
- UserRank, UserStats
- MLCoinsTransaction, InventoryTransaction
- ComodinesInventory, ActiveBoost
- Mission, LeaderboardMetadata

**DTOs** (23): Crear/actualizar logros, transacciones de monedas, estadísticas de usuario.

---

### [NOT] NOTIFICATIONS - Notificaciones

**Propósito**: Sistema de notificaciones en tiempo real para usuarios.

**Controllers** (1):
- `notifications/controllers/notifications.controller.ts`

**Services** (1):
- `notifications/services/notifications.service.ts`

**Entities** (1):
- `notifications/entities/notification.entity.ts`

**DTOs** (4): Crear notificaciones, marcar como leído, consultar.

---

### [PRG] PROGRESS - Progreso Estudiantil

**Propósito**: Registrar y seguir el progreso del estudiante en ejercicios, módulos y misiones.

**Controllers** (5):
- `progress/controllers/exercise-attempt.controller.ts`
- `progress/controllers/exercise-submission.controller.ts`
- `progress/controllers/learning-session.controller.ts`
- `progress/controllers/module-progress.controller.ts`
- `progress/controllers/scheduled-mission.controller.ts`

**Services** (7):
- `progress/services/exercise-attempt.service.ts`
- `progress/services/exercise-submission.service.ts`
- `progress/services/learning-session.service.ts`
- `progress/services/module-progress.service.ts`
- `progress/services/pending-activities.service.ts`
- `progress/services/recent-activity.service.ts`
- `progress/services/scheduled-mission.service.ts`

**Entities** (5):
- `progress/entities/learning-session.entity.ts`
- `progress/entities/exercise-attempt.entity.ts`
- `progress/entities/exercise-submission.entity.ts`
- `progress/entities/module-progress.entity.ts`
- `progress/entities/scheduled-mission.entity.ts`

**DTOs** (12): Crear intentos, entregas, sesiones de aprendizaje.

---

### [SOC] SOCIAL - Social

**Propósito**: Gestionar aulas, equipos, amistades y desafíos colaborativos.

**Controllers** (7):
- `social/controllers/classrooms.controller.ts`
- `social/controllers/classroom-members.controller.ts`
- `social/controllers/teams.controller.ts`
- `social/controllers/team-members.controller.ts`
- `social/controllers/team-challenges.controller.ts`
- `social/controllers/friendships.controller.ts`
- `social/controllers/schools.controller.ts`

**Services** (7):
- `social/services/classrooms.service.ts`
- `social/services/classroom-members.service.ts`
- `social/services/teams.service.ts`
- `social/services/team-members.service.ts`
- `social/services/team-challenges.service.ts`
- `social/services/friendships.service.ts`
- `social/services/schools.service.ts`

**Entities** (7):
- Classroom, ClassroomMember
- Team, TeamMember, TeamChallenge
- Friendship
- School

**DTOs** (16): Crear aulas, equipos, amistades, desafíos.

---

### [TCH] TEACHER - Herramientas del Profesor

**Propósito**: Proporcionar dashboards y análisis para profesores.

**Controllers** (1):
- `teacher/controllers/teacher.controller.ts`

**Services** (4):
- `teacher/services/teacher-dashboard.service.ts`
- `teacher/services/analytics.service.ts`
- `teacher/services/grading.service.ts`
- `teacher/services/student-progress.service.ts`

**DTOs** (4):
- `teacher/dto/analytics.dto.ts`
- `teacher/dto/grading.dto.ts`
- `teacher/dto/create-exercise.dto.ts`
- `teacher/dto/teacher-notes.dto.ts`

---

## Notas sobre la Arquitectura

### Patrones Identificados

1. **Separación por Responsabilidades**: Cada módulo tiene controllers, services, entities y DTOs claramente separados.

2. **DTOs como Validadores**: Los DTOs se utilizan para validación de entrada/salida en todas las rutas.

3. **Services como Lógica de Negocio**: La lógica de negocio se concentra en services.

4. **Entities para Persistencia**: Las entities representan modelos de base de datos.

5. **Módulos Especializados**: Hay módulos específicos para tareas transversales como auditoría, autenticación y notificaciones.

### Módulos por Complejidad

**Complejos** (múltiples controllers/services):
- AUTH (5 services)
- SOCIAL (7 controllers + 7 services)
- GAMIFICATION (5 controllers + 5 services)
- PROGRESS (5 controllers + 7 services)
- ADMIN (4 controllers + 4 services)

**Simples** (funcionalidad específica):
- AUDIT (solo service + entity)
- TASKS (solo services de cron)
- CORE (vacío, posiblemente en desarrollo)

---

## Referencias

- **Ubicación**: `/apps/backend/src/modules/`
- **Lenguaje**: TypeScript + NestJS
- **Base de Datos**: Entidades TypeORM
- **Validación**: DTOs con Validación de Clases

---

**Última Actualización**: 2025-11-07
**Generado Automáticamente**

