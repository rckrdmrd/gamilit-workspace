# Tipos Compartidos - Biblioteca de Tipos TypeScript

**Proyecto:** Gamilit Platform
**Módulo:** Shared Types Library (@glit/shared-types)
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01
**Archivo Original:** SHARED-TYPES-LIBRARY.md (4,014 líneas)

---

## 🔗 Trazabilidad

**Casos de uso relacionados:**
- [UC-STU-001: Registro](../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md) - TYPES-AUTH.md, TYPES-CORE.md
- [UC-STU-003: Resolver ejercicio](../../01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md) - TYPES-EDUCATIONAL-MODULES.md

**User Stories:**
- [US-FUND-004: Infraestructura técnica base](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-004-infraestructura-tecnica-base.md) - Setup de shared types library
- [US-FUND-006: API RESTful básica](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-006-api-restful-basica.md) - TYPES-API.md para respuestas

**Épicas:**
- [EAI-001: Fundamentos](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/_MAP.md) - TYPES-CORE, TYPES-AUTH, TYPES-API
- [EAI-002: Actividades](../../04-planificacion/01-alcance-inicial/EAI-002-actividades/_MAP.md) - TYPES-EDUCATIONAL-MODULES, TYPES-EDUCATIONAL-PROGRESS
- [EAI-003: Gamificación](../../04-planificacion/01-alcance-inicial/EAI-003-gamificacion/_MAP.md) - TYPES-GAMIFICATION (MayaRank, MLCoins, Achievements)
- [EAI-004: Analytics](../../04-planificacion/01-alcance-inicial/EAI-004-analytics/_MAP.md) - TYPES-EDUCATIONAL-PROGRESS (Analytics)
- [EAI-005: Admin Base](../../04-planificacion/01-alcance-inicial/EAI-005-admin-base/_MAP.md) - TYPES-ADMIN

**Requerimientos funcionales:**
- [Módulos educativos](../../01-requerimientos/modulos/) - TYPES-EDUCATIONAL-MODULES
- [Gamificación](../../01-requerimientos/gamificacion/) - TYPES-GAMIFICATION
- [Admin Portal](../../01-requerimientos/admin-portal/) - TYPES-ADMIN
- [Teacher Portal](../../01-requerimientos/teacher-portal/) - TYPES-TEACHER

---

## Descripción General

Esta biblioteca contiene todos los tipos TypeScript compartidos entre el backend (Node.js/Express) y frontend (React/TypeScript) de la plataforma Gamilit. La documentación ha sido modularizada desde un único archivo de 4,014 líneas en 14 archivos especializados para facilitar su mantenimiento y navegación.

### Objetivos

- **Type Safety**: Garantizar type checking en tiempo de compilación
- **Single Source of Truth**: Eliminar duplicación de definiciones
- **Runtime Validation**: Proveer esquemas Zod para validación en APIs
- **Developer Experience**: Tipos claros, documentados y mantenibles
- **Backward Compatibility**: Migración gradual desde tipos legacy

---

## Estructura de Archivos

### Tipos de Datos (Data Types)

| Archivo | Líneas | Descripción | Tipos Principales |
|---------|--------|-------------|-------------------|
| **TYPES-CORE.md** | 348 | Tipos fundamentales del sistema | User, UserProfile, AuthUser, UserRole, Session |
| **TYPES-AUTH.md** | 369 | Autenticación y autorización | LoginDto, RegisterDto, AuthResponse, Password Recovery |
| **TYPES-EDUCATIONAL-MODULES.md** | 510 | Módulos y ejercicios educativos | Module, Exercise (27 mecánicas), ExerciseConfig |
| **TYPES-EDUCATIONAL-PROGRESS.md** | 426 | Progreso y analíticas educativas | SubmitExerciseDto, SubmissionResponse, ModuleProgress, Analytics |
| **TYPES-GAMIFICATION.md** | 615 | Sistema de gamificación | MayaRank, UserStats, Achievement, MLCoins, Missions |
| **TYPES-SOCIAL.md** | 229 | Características sociales | Friendship, FriendProfile, Guild, GuildMember |
| **TYPES-TEACHER.md** | 203 | Portal de profesores | Classroom, Assignment, AssignmentSubmission, Analytics |
| **TYPES-ADMIN.md** | 236 | Portal de administración | UserAdmin, Organization, SystemMetrics |
| **TYPES-NOTIFICATIONS.md** | 123 | Sistema de notificaciones | Notification, NotificationType, NotificationStatus |
| **TYPES-API.md** | 202 | Respuestas de API | APIResponse, PaginatedResponse, ErrorCode |
| **TYPES-UTILITY.md** | 157 | Tipos utilitarios | Timestamps, SoftDelete, AuditFields, Pagination |

### Guías de Implementación (Implementation)

| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| **IMPLEMENTATION-GUARDS.md** | 173 | Type guards, validadores Zod, middleware de validación |
| **IMPLEMENTATION-GUIDE.md** | 410 | Setup del paquete, estrategia de publicación, guía de migración |

---

## Navegación Rápida por Categoría

### Core & Authentication
```
TYPES-CORE.md          → User, Profile, Session, Roles
TYPES-AUTH.md          → Login, Register, Tokens, Password Recovery
```

### Educational Content
```
TYPES-EDUCATIONAL-MODULES.md   → Modules, Exercises (27 tipos)
TYPES-EDUCATIONAL-PROGRESS.md  → Submissions, Progress, Analytics
```

### Gamification
```
TYPES-GAMIFICATION.md  → Ranks, Stats, Achievements, Coins, Missions
```

### Portals & Administration
```
TYPES-SOCIAL.md       → Friends, Guilds
TYPES-TEACHER.md      → Classrooms, Assignments
TYPES-ADMIN.md        → User Management, Organizations, System Metrics
```

### Infrastructure
```
TYPES-NOTIFICATIONS.md → Notifications System
TYPES-API.md          → API Responses, Error Handling
TYPES-UTILITY.md      → Common Patterns, Timestamps, Pagination
```

### Implementation
```
IMPLEMENTATION-GUARDS.md → Type Guards & Validation
IMPLEMENTATION-GUIDE.md  → Setup, Migration, Best Practices
```

---

## Uso Rápido

### Backend (Node.js/Express)

```typescript
import {
  User,
  LoginDto,
  loginSchema,
  Module,
  Exercise
} from '@glit/shared-types';

// Validación con middleware
router.post('/login', validate(loginSchema), async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

// Tipado de servicios
async function getUserById(id: string): Promise<User> {
  const result = await db.query('SELECT * FROM auth.users WHERE id = $1', [id]);
  return result.rows[0];
}
```

### Frontend (React/TypeScript)

```typescript
import {
  Module,
  Exercise,
  SubmitExerciseDto,
  submitExerciseSchema
} from '@glit/shared-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// React Hook Form con validación Zod
const ExerciseForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<SubmitExerciseDto>({
    resolver: zodResolver(submitExerciseSchema)
  });

  const onSubmit = async (data: SubmitExerciseDto) => {
    const result = await api.submitExercise(data);
    // ...
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
};
```

---

## Estadísticas de Modularización

### Resumen
- **Archivo Original**: SHARED-TYPES-LIBRARY.md (4,014 líneas)
- **Archivos Generados**: 14 archivos modulares
- **Total de Líneas**: 4,001 líneas
- **Reducción de Complejidad**: Archivos individuales de 123-615 líneas
- **Cumple Límite <400 líneas**: 10 de 14 archivos (71%)

---

## Referencias Adicionales

- Ver: [TYPES-CHEATSHEET.md](../../QUICK-REFERENCE/TYPES-CHEATSHEET.md) - Referencia rápida de tipos
- Ver: [TIPOS-Y-ENUMS.md](../../03-desarrollo/base-de-datos/TIPOS-Y-ENUMS.md) - Tipos y enums de base de datos

---

## Navegación

- [⬅️ Volver a Especificaciones Técnicas](../README.md)
- [⬆️ Índice principal](../../README.md)

---

**Última Actualización**: 2025-11-01
**Mantenedor**: GAMILITDevelopment Team
