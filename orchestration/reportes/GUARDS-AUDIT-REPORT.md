# Guards Audit Report - GAMILIT Backend
## Fecha: 2026-01-16
## Task: TASK-2026-01-16-004

---

## Resumen Ejecutivo

| Metrica | Valor |
|---------|-------|
| **Controllers Totales** | 75 |
| **Controllers CON Guards** | 53 (70.7%) |
| **Controllers SIN Guards** | 21 (28%) |
| **Severidad** | P1 - ALTO |

---

## Guards Disponibles

| Guard | Descripcion | Uso Recomendado |
|-------|-------------|-----------------|
| `JwtAuthGuard` | Autenticacion JWT basica | Todos los endpoints protegidos |
| `RolesGuard` | Verificacion de roles con @Roles() | Endpoints con roles especificos |
| `AdminGuard` | Solo rol admin | Endpoints de administracion |
| `TeacherGuard` | Solo rol teacher | Endpoints de docentes |
| `ClassroomOwnershipGuard` | Propietario de aula | Operaciones sobre aulas propias |
| `ResourceOwnershipGuard` | Propietario de recurso | Operaciones sobre recursos propios |
| `AccountStatusGuard` | Estado de cuenta activa | Verificar cuenta no suspendida |
| `EmailVerifiedGuard` | Email verificado | Operaciones sensibles |
| `PermissionsGuard` | Permisos granulares | Control de acceso fino |
| `WsJwtGuard` | WebSocket JWT | Conexiones WebSocket |

---

## Controllers SIN Guards (21) - REQUIEREN ACCION

### content/ (5 controllers) - PRIORIDAD MEDIA

| Controller | Endpoints | Accion Requerida |
|------------|-----------|------------------|
| content-authors.controller.ts | CRUD autores | `JwtAuthGuard` + `RolesGuard(admin)` |
| content-categories.controller.ts | CRUD categorias | `JwtAuthGuard` + `RolesGuard(admin)` |
| content-templates.controller.ts | CRUD templates | `JwtAuthGuard` + `RolesGuard(admin)` |
| marie-curie-content.controller.ts | Contenido Marie Curie | Lectura publica OK, escritura protegida |
| media-files.controller.ts | Archivos multimedia | `JwtAuthGuard` |

### educational/ (1 controller) - PRIORIDAD BAJA

| Controller | Endpoints | Accion Requerida |
|------------|-----------|------------------|
| media.controller.ts | Media educativo | Lectura publica OK, escritura protegida |

### profile/ (1 controller) - PRIORIDAD ALTA

| Controller | Endpoints | Accion Requerida |
|------------|-----------|------------------|
| profile.controller.ts | Perfil de usuario | `JwtAuthGuard` + `ResourceOwnershipGuard` |

### progress/ (4 controllers) - PRIORIDAD ALTA

| Controller | Endpoints | Accion Requerida |
|------------|-----------|------------------|
| exercise-attempt.controller.ts | Intentos de ejercicio | `JwtAuthGuard` |
| learning-session.controller.ts | Sesiones de aprendizaje | `JwtAuthGuard` |
| module-progress.controller.ts | Progreso de modulos | `JwtAuthGuard` |
| scheduled-mission.controller.ts | Misiones programadas | `JwtAuthGuard` |

### social/ (10 controllers) - PRIORIDAD ALTA

| Controller | Endpoints | Accion Requerida |
|------------|-----------|------------------|
| challenge-participants.controller.ts | Participantes de retos | `JwtAuthGuard` |
| classroom-members.controller.ts | Miembros de aula | `JwtAuthGuard` + roles |
| classrooms.controller.ts | Aulas | `JwtAuthGuard` + roles |
| friendships.controller.ts | Amistades | `JwtAuthGuard` |
| peer-challenges.controller.ts | Retos entre pares | `JwtAuthGuard` |
| schools.controller.ts | Escuelas | `JwtAuthGuard` + roles |
| team-challenges.controller.ts | Retos de equipo | `JwtAuthGuard` |
| team-members.controller.ts | Miembros de equipo | `JwtAuthGuard` |
| teams.controller.ts | Equipos | `JwtAuthGuard` |
| user-activities.controller.ts | Actividades de usuario | `JwtAuthGuard` |

---

## Controllers CON Guards (53) - OK

### admin/ (20 controllers)
Todos protegidos con `JwtAuthGuard` + `AdminGuard` ✅

### auth/ (3 controllers)
- auth.controller.ts - Mixto (login publico, otros protegidos) ✅
- password.controller.ts - Endpoints publicos para reset ✅
- users.controller.ts - Protegido ✅

### assignments/ (2 controllers)
Protegidos con `JwtAuthGuard` ✅

### gamification/ (8 controllers)
Protegidos con `JwtAuthGuard` + roles apropiados ✅

### notifications/ (5 controllers)
Protegidos con `JwtAuthGuard` ✅

### teacher/ (8 controllers)
Protegidos con `JwtAuthGuard` + `TeacherGuard` ✅

### health/ (1 controller)
health.controller.ts - Publico (correcto para health checks) ✅

---

## Plan de Accion

### Fase 1 - Critica (social/ + progress/) - 14 controllers
```typescript
// Agregar a todos los controllers de social/ y progress/:
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
```

### Fase 2 - Alta (profile/) - 1 controller
```typescript
// profile.controller.ts
@UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
@ApiBearerAuth()
```

### Fase 3 - Media (content/) - 5 controllers
```typescript
// Controllers de content/ que modifican datos:
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.ADMIN)
@ApiBearerAuth()
```

### Fase 4 - Baja (educational/) - 1 controller
```typescript
// Solo endpoints de escritura:
@UseGuards(JwtAuthGuard)
```

---

## Patron Recomendado por Modulo

| Modulo | Guard Pattern | Roles |
|--------|---------------|-------|
| admin/ | `JwtAuthGuard, AdminGuard` | admin |
| teacher/ | `JwtAuthGuard, TeacherGuard` | teacher |
| student/ | `JwtAuthGuard` | student, teacher, admin |
| content/ | `JwtAuthGuard, RolesGuard` | admin (write), public (read) |
| social/ | `JwtAuthGuard` | authenticated users |
| progress/ | `JwtAuthGuard` | student, teacher |
| profile/ | `JwtAuthGuard, ResourceOwnershipGuard` | owner |

---

## Notas Tecnicas

1. **health.controller.ts** no necesita guards - es para health checks de infraestructura.

2. **auth.controller.ts** tiene endpoints mixtos - login/register son publicos.

3. **marie-curie-content** puede ser de lectura publica pero escritura protegida.

4. Los endpoints de lectura en **social/** pueden ser menos restrictivos, pero los de escritura DEBEN tener guards.

---

## Archivos a Modificar

```
src/modules/social/controllers/*.controller.ts (10 files)
src/modules/progress/controllers/*.controller.ts (4 files)
src/modules/profile/controllers/profile.controller.ts (1 file)
src/modules/content/controllers/*.controller.ts (5 files)
src/modules/educational/controllers/media.controller.ts (1 file)
```

Total: 21 controllers a actualizar

---

## Referencias

- Plan: TASK-2026-01-16-004
- Guards: `src/modules/auth/guards/`
- Decorators: `src/common/decorators/roles.decorator.ts`
