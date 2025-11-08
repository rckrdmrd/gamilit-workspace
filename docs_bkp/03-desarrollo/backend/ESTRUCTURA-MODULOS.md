# Estructura de Módulos Backend

**Código que mapea:** `apps/backend/src/modules/`
**Última actualización:** 2025-11-07
**Versión:** 2.0

---

## 📋 Propósito

Esta guía documenta la estructura de los **17 módulos funcionales** del backend NestJS, sin invadir el código fuente.

**Principio:** Esta guía DESCRIBE el código desde `docs/`, NO vive dentro de `apps/backend/`.

---

## 🗂️ Módulos Implementados

### Resumen General

| # | Módulo | Path | Propósito | Endpoints | Estado |
|---|--------|------|-----------|-----------|--------|
| 1 | **admin** | `apps/backend/src/modules/admin/` | Panel de administración | ~25 | ✅ |
| 2 | **assignments** | `apps/backend/src/modules/assignments/` | Gestión de asignaciones | ~15 | ✅ |
| 3 | **audit** | `apps/backend/src/modules/audit/` | Auditoría y logging | ~8 | ✅ |
| 4 | **auth** | `apps/backend/src/modules/auth/` | Autenticación y autorización | ~15 | ✅ |
| 5 | **content** | `apps/backend/src/modules/content/` | Gestión de contenido multimedia | ~20 | ✅ |
| 6 | **core** | `apps/backend/src/modules/core/` | Funcionalidades core del sistema | ~10 | ✅ |
| 7 | **educational** | `apps/backend/src/modules/educational/` | Contenido educativo y ejercicios | ~42 | ✅ |
| 8 | **gamification** | `apps/backend/src/modules/gamification/` | Sistema de gamificación | ~28 | ✅ |
| 9 | **mail** | `apps/backend/src/modules/mail/` | Envío de emails | ~5 | ✅ |
| 10 | **missions** | `apps/backend/src/modules/missions/` | Sistema de misiones | ~12 | ✅ |
| 11 | **notifications** | `apps/backend/src/modules/notifications/` | Notificaciones en tiempo real | ~18 | ✅ |
| 12 | **powerups** | `apps/backend/src/modules/powerups/` | Power-ups y comodines | ~10 | ✅ |
| 13 | **progress** | `apps/backend/src/modules/progress/` | Tracking de progreso del estudiante | ~35 | ✅ |
| 14 | **social** | `apps/backend/src/modules/social/` | Features sociales (aulas, amigos) | ~45 | ✅ |
| 15 | **tasks** | `apps/backend/src/modules/tasks/` | Sistema de tareas | ~12 | ✅ |
| 16 | **teacher** | `apps/backend/src/modules/teacher/` | Portal de profesores | ~30 | ✅ |
| 17 | **websocket** | `apps/backend/src/modules/websocket/` | WebSocket para real-time | ~8 | ✅ |

**Total módulos:** 17
**Total endpoints estimados:** ~340+

---

## 📐 Estructura Estándar de un Módulo

Todos los módulos siguen el patrón estándar de NestJS:

```
modules/{nombre}/
├── controllers/              # Controladores HTTP
│   └── {nombre}.controller.ts
├── services/                 # Lógica de negocio
│   └── {nombre}.service.ts
├── dto/                      # Data Transfer Objects
│   ├── create-{nombre}.dto.ts
│   ├── update-{nombre}.dto.ts
│   └── query-{nombre}.dto.ts
├── entities/                 # Entidades TypeORM (opcional)
│   └── {nombre}.entity.ts
├── interfaces/               # Interfaces TypeScript
│   └── {nombre}.interface.ts
├── guards/                   # Guards específicos del módulo
│   └── {nombre}.guard.ts
├── decorators/               # Decoradores custom
│   └── {nombre}.decorator.ts
└── {nombre}.module.ts        # Módulo NestJS
```

---

## 🗺️ Desglose Detallado por Módulo

### 1. admin/ - Panel de Administración

**Path:** `apps/backend/src/modules/admin/`

**Propósito:** Gestión del panel de administrador (super_admin)

**Funcionalidades:**
- CRUD de usuarios
- Gestión de aulas
- Gestión de contenido educativo
- Reportes y analytics
- Configuración del sistema

**Endpoints:** ~25

**Permisos:** Solo `super_admin`

**Implementa RFs:**
- RF-ADMIN-001 a RF-ADMIN-015

**Database schemas:**
- `auth_management.*`
- `social_features.classrooms`
- `system_configuration.*`

---

### 2. assignments/ - Asignaciones

**Path:** `apps/backend/src/modules/assignments/`

**Propósito:** Gestión de asignaciones de profesores a estudiantes

**Funcionalidades:**
- Crear asignaciones
- Asignar ejercicios/módulos
- Tracking de asignaciones
- Deadline management

**Endpoints:** ~15

**Permisos:** `admin_teacher`, `super_admin`

**Implementa RFs:**
- RF-SOC-004 (Asignaciones)

---

### 3. audit/ - Auditoría

**Path:** `apps/backend/src/modules/audit/`

**Propósito:** Sistema de auditoría y logging de acciones

**Funcionalidades:**
- Registro de acciones de usuarios
- Audit log
- Consulta de histórico

**Endpoints:** ~8

**Permisos:** `super_admin`

**Implementa RFs:**
- RF-AUD-001 (Audit logging)

**Database schemas:**
- `audit_logging.*`

---

### 4. auth/ - Autenticación

**Path:** `apps/backend/src/modules/auth/`

**Propósito:** Autenticación, autorización y gestión de sesiones

**Funcionalidades:**
- Login/logout
- JWT tokens
- OAuth providers (Google, Facebook, Apple, Microsoft, GitHub)
- Gestión de roles (student, admin_teacher, super_admin)
- Estados de cuenta (active, inactive, suspended, pending, banned)

**Endpoints:** ~15

**Implementa RFs:**
- RF-AUTH-001 (Roles)
- RF-AUTH-002 (Estados de cuenta)
- RF-AUTH-003 (OAuth)

**Database schemas:**
- `auth_management.*`
- `auth.users` (Supabase)

**Guards:**
- `JwtAuthGuard`
- `RolesGuard`
- `UserStatusGuard`

---

### 5. content/ - Gestión de Contenido

**Path:** `apps/backend/src/modules/content/`

**Propósito:** Gestión de contenido multimedia (imágenes, audio, video)

**Funcionalidades:**
- Upload de media files
- Procesamiento de multimedia
- Storage (S3/Cloudflare R2)
- CDN integration

**Endpoints:** ~20

**Implementa RFs:**
- RF-CNT-001 (Ciclo de vida de contenido)
- RF-CNT-002 (Multimedia)
- RF-CNT-003 (Procesamiento)

**Database schemas:**
- `content_management.*`

---

### 6. core/ - Core del Sistema

**Path:** `apps/backend/src/modules/core/`

**Propósito:** Funcionalidades core compartidas

**Funcionalidades:**
- Health checks
- Configuración global
- Utilidades compartidas

**Endpoints:** ~10

---

### 7. educational/ - Contenido Educativo

**Path:** `apps/backend/src/modules/educational/`

**Propósito:** Gestión del contenido educativo y ejercicios

**Funcionalidades:**
- CRUD de ejercicios
- 33 mecánicas educativas
- Niveles de dificultad
- Taxonomía de Bloom
- Retroalimentación automática

**Endpoints:** ~42

**Implementa RFs:**
- RF-EDU-001 (Mecánicas de ejercicios)
- RF-EDU-002 (Niveles de dificultad)
- RF-EDU-003 (Taxonomía de Bloom)

**Database schemas:**
- `educational_content.*`

**33 Mecánicas educativas implementadas:**
1. multiple_choice
2. true_false
3. fill_in_blank
4. matching
5. ordering
6. categorization
7. drag_and_drop
8. hotspot
9. text_input
10. essay
11-33. (ver RF-EDU-001 para lista completa)

---

### 8. gamification/ - Gamificación

**Path:** `apps/backend/src/modules/gamification/`

**Propósito:** Sistema de gamificación basado en cultura maya

**Funcionalidades:**
- Achievements (logros)
- Badges (insignias)
- ML Coins (moneda virtual)
- 5 rangos de progresión
- Leaderboards

**Endpoints:** ~28

**Implementa RFs:**
- RF-GAM-001 (Achievements)
- RF-GAM-002 (Comodines)
- RF-GAM-003 (Rangos maya)
- RF-GAM-004 (ML Coins)

**Database schemas:**
- `gamification_system.*`

---

### 9. mail/ - Emails

**Path:** `apps/backend/src/modules/mail/`

**Propósito:** Envío de emails transaccionales

**Funcionalidades:**
- Envío de emails
- Templates de email
- Queue de emails

**Endpoints:** ~5

**Integración:** SendGrid / Mailgun

---

### 10. missions/ - Misiones

**Path:** `apps/backend/src/modules/missions/`

**Propósito:** Sistema de misiones y desafíos

**Funcionalidades:**
- CRUD de misiones
- Tracking de progreso de misiones
- Recompensas por misión

**Endpoints:** ~12

**Implementa RFs:**
- RF-GAM-005 (Misiones)

**Database schemas:**
- `gamification_system.missions`

---

### 11. notifications/ - Notificaciones

**Path:** `apps/backend/src/modules/notifications/`

**Propósito:** Sistema de notificaciones en tiempo real

**Funcionalidades:**
- Notificaciones in-app
- Push notifications
- Email notifications
- Priorización de notificaciones

**Endpoints:** ~18

**Implementa RFs:**
- RF-NOT-001 (Tipos de notificaciones)
- RF-NOT-002 (Priorización)

**Integración:** WebSocket para real-time

---

### 12. powerups/ - Power-ups

**Path:** `apps/backend/src/modules/powerups/`

**Propósito:** Sistema de comodines/power-ups

**Funcionalidades:**
- CRUD de power-ups
- Uso de comodines
- Inventario de power-ups

**Endpoints:** ~10

**Implementa RFs:**
- RF-GAM-002 (Comodines)

**Database schemas:**
- `gamification_system.powerups`

---

### 13. progress/ - Progreso

**Path:** `apps/backend/src/modules/progress/`

**Propósito:** Tracking de progreso del estudiante

**Funcionalidades:**
- Tracking de progreso por módulo
- Intentos en ejercicios
- Historial de actividad
- Reportes de progreso
- Analytics de desempeño

**Endpoints:** ~35

**Implementa RFs:**
- RF-PRG-001 (Tracking de progreso)
- RF-PRG-002 (Intentos de ejercicios)

**Database schemas:**
- `progress_tracking.*`

---

### 14. social/ - Features Sociales

**Path:** `apps/backend/src/modules/social/`

**Propósito:** Features sociales y colaborativas

**Funcionalidades:**
- Aulas virtuales (classrooms)
- Equipos colaborativos
- Sistema de amigos
- Chat en tiempo real

**Endpoints:** ~45

**Implementa RFs:**
- RF-SOC-001 (Aulas virtuales)
- RF-SOC-002 (Equipos)
- RF-SOC-003 (Sistema de amigos)

**Database schemas:**
- `social_features.*`

---

### 15. tasks/ - Tareas

**Path:** `apps/backend/src/modules/tasks/`

**Propósito:** Sistema de tareas y asignaciones

**Funcionalidades:**
- CRUD de tareas
- Asignación de tareas
- Tracking de tareas

**Endpoints:** ~12

---

### 16. teacher/ - Portal de Profesores

**Path:** `apps/backend/src/modules/teacher/`

**Propósito:** Funcionalidades del portal de profesores

**Funcionalidades:**
- Dashboard de profesor
- Gestión de estudiantes
- Asignación de ejercicios
- Reportes de progreso de aula
- Calificaciones

**Endpoints:** ~30

**Permisos:** `admin_teacher`

**Implementa RFs:**
- RF-TEACHER-001 a RF-TEACHER-010

---

### 17. websocket/ - WebSocket

**Path:** `apps/backend/src/modules/websocket/`

**Propósito:** Comunicación en tiempo real via WebSocket

**Funcionalidades:**
- Notificaciones en tiempo real
- Chat en vivo
- Updates de progreso en vivo

**Endpoints:** ~8

**Tecnología:** Socket.IO

---

## 🔗 Dependencias entre Módulos

### Módulos Core (Sin dependencias)

```
core/
auth/
audit/
```

### Dependencias de Nivel 1

```
educational/ → auth/ (autenticación)
progress/ → educational/ (requiere ejercicios)
gamification/ → progress/ (requiere tracking)
```

### Dependencias de Nivel 2

```
missions/ → gamification/ + educational/
social/ → auth/ + progress/
teacher/ → auth/ + social/ + progress/
```

---

## 🎯 Convenciones de Módulos

### Naming

- **Módulos:** snake_case (carpetas)
- **Clases:** PascalCase (archivos TypeScript)
- **Archivos:** kebab-case.ts

**Ejemplo:**
```
modules/gamification/           # snake_case
├── gamification.module.ts      # kebab-case
├── services/
│   └── gamification.service.ts # kebab-case
└── controllers/
    └── gamification.controller.ts
```

### Importaciones

Usar path aliases configurados en `tsconfig.json`:

```typescript
// ❌ Evitar
import { AuthService } from '../../../auth/services/auth.service';

// ✅ Usar
import { AuthService } from '@modules/auth/services/auth.service';
```

### Guards y Decoradores

Cada módulo puede tener guards y decorators propios:

```typescript
// modules/gamification/guards/achievement.guard.ts
@Injectable()
export class AchievementGuard implements CanActivate {
  // ...
}

// Usage
@UseGuards(JwtAuthGuard, RolesGuard, AchievementGuard)
@Roles('student')
export class AchievementsController {
  // ...
}
```

---

## 📚 Referencias

**Especificaciones técnicas:**
- [docs/02-especificaciones-tecnicas/arquitectura/ARQUITECTURA-BACKEND.md](../../02-especificaciones-tecnicas/arquitectura/ARQUITECTURA-BACKEND.md)
- [docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md](../../02-especificaciones-tecnicas/apis/API-REFERENCE.md)

**Requerimientos:**
- [docs/01-requerimientos/](../../01-requerimientos/)

**Guías relacionadas:**
- [ESTRUCTURA-SHARED.md](./ESTRUCTURA-SHARED.md) - Código compartido
- [DATABASE-INTEGRATION.md](./DATABASE-INTEGRATION.md) - Integración con DB
- [API-CONVENTIONS.md](./API-CONVENTIONS.md) - Convenciones de APIs

---

## 🎯 Próximos Pasos

Para trabajar con un módulo específico:

1. Leer la especificación técnica en `docs/02-especificaciones-tecnicas/`
2. Ver el requerimiento funcional en `docs/01-requerimientos/`
3. Navegar al código en `apps/backend/src/modules/{modulo}/`
4. Seguir las convenciones de este documento

---

**Última actualización:** 2025-11-07
**Versión:** 2.0
