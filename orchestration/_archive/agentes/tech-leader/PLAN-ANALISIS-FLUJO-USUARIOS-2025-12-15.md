# PLAN DE ANÁLISIS - FLUJO DE CREACIÓN DE USUARIOS

**Tech-Leader:** Claude Opus 4.5
**Proyecto:** GAMILIT
**Fecha:** 2025-12-15
**Tarea:** Análisis detallado y adaptación del flujo de creación de usuarios

---

## 1. RESUMEN EJECUTIVO

### Objetivo Principal
Analizar y adaptar el flujo de creación de usuarios para implementar:
1. Clase genérica "por asignar" para nuevos estudiantes
2. Institución default para organización inicial
3. Corrección del registro de último ingreso en admin/users

### Hallazgos Iniciales

| Componente | Estado | Observación |
|------------|--------|-------------|
| Classroom Default | ✅ EXISTE | UUID: `00000000-0000-0000-0000-000000000001`, code: `DEFAULT` |
| School Default | ❌ NO EXISTE | Solo hay escuelas demo, ninguna marcada como default |
| Función `assign_default_classroom` | ✅ EXISTE | Funciona correctamente |
| Trigger asignación | ✅ EXISTE | `trg_assign_default_classroom` AFTER INSERT en profiles |
| AuthService.register | ❌ NO IMPLEMENTADO | Método lanza excepción |
| `last_login` actualización | ⚠️ PARCIAL | Campos existen pero no se actualizan |
| Institución Default | ❌ NO EXISTE | No hay concepto de institución default |

---

## 2. ARQUITECTURA ACTUAL

### 2.1 Flujo de Registro de Usuario (Actual)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO ACTUAL (INCOMPLETO)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Frontend envía datos de registro                            │
│     ↓                                                           │
│  2. AuthService.register() → ❌ throws Error                    │
│     (NO IMPLEMENTADO)                                           │
│     ↓                                                           │
│  3. Si se creara el profile:                                    │
│     • trg_set_default_tenant (BEFORE INSERT)                    │
│     • INSERT profile                                            │
│     • trg_initialize_user_stats (AFTER INSERT)                  │
│     • trg_assign_default_classroom (AFTER INSERT) ← ✅ EXISTE   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Tablas Involucradas

| Tabla | Schema | Propósito |
|-------|--------|-----------|
| `auth.users` | auth | Credenciales, `last_sign_in_at` |
| `auth_management.profiles` | auth_management | Perfil de usuario, `role`, `school_id` |
| `auth_management.tenants` | auth_management | Multi-tenancy |
| `social_features.schools` | social_features | Instituciones/Escuelas |
| `social_features.classrooms` | social_features | Aulas |
| `social_features.classroom_members` | social_features | Membresía estudiante-aula |

### 2.3 Usuarios Default Existentes (Seeds)

| Email | UUID | Rol | Propósito |
|-------|------|-----|-----------|
| `admin@gamilit.com` | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` | super_admin | Admin principal |
| `teacher@gamilit.com` | `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` | admin_teacher | Maestro default |
| `teacher2@gamilit.com` | - | admin_teacher | Maestro secundario |
| `student@gamilit.com` | `cccccccc-cccc-cccc-cccc-cccccccccccc` | student | Estudiante demo 1 |

### 2.4 Classroom Default (Existente)

```yaml
id: '00000000-0000-0000-0000-000000000001'
name: 'Sin Asignar - Aula Default'
code: 'DEFAULT'
school_id: '50000000-0000-0000-0000-000000000001'  # Marie Curie
teacher_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'  # teacher@gamilit.com
metadata:
  is_default: true
  system_classroom: true
  auto_assignment: true
```

---

## 3. PLAN DE ANÁLISIS (FASE 2)

### 3.1 Componentes a Analizar

#### A. Database Layer
- [ ] DDL de `social_features.schools` - verificar campo `is_default`
- [ ] DDL de `social_features.classrooms` - validar metadata schema
- [ ] Seeds de escuelas - verificar si hay escuela default
- [ ] Función `gamilit.assign_default_classroom()` - revisar lógica
- [ ] Triggers de inicialización - orden de ejecución

#### B. Backend Layer
- [ ] `AuthService.register()` - estado de implementación
- [ ] `ProfilesService` - métodos de creación
- [ ] `UsersService` - si existe
- [ ] Endpoints de `/auth/register`
- [ ] Actualización de `last_sign_in_at`

#### C. Frontend Layer
- [ ] `AdminUsersPage.tsx` - mostrar último ingreso
- [ ] `useUserManagement.ts` - hook de gestión
- [ ] API types para SystemUser
- [ ] Formato de fechas para `lastLogin`

#### D. API Contracts
- [ ] Response de GET /admin/users
- [ ] Mapeo de campos `last_sign_in_at` → `lastLogin`

---

## 4. ISSUES IDENTIFICADOS

### 4.1 P0 - Críticos

| ID | Issue | Ubicación | Impacto |
|----|-------|-----------|---------|
| P0-001 | `AuthService.register()` no implementado | `auth.service.ts:48` | Bloquea registro de nuevos usuarios |
| P0-002 | `last_sign_in_at` no se actualiza | Backend auth | Admin ve "Nunca" en último acceso |
| P0-003 | No existe School Default | Seeds | Nuevos usuarios no tienen school_id |

### 4.2 P1 - Importantes

| ID | Issue | Ubicación | Impacto |
|----|-------|-----------|---------|
| P1-001 | Campo `school_id` en profiles es opcional | `profiles.sql:34` | Usuarios sin escuela asignada |
| P1-002 | No hay institución default para admin | Arquitectura | Admin sin escuela asociada |
| P1-003 | Mapping `lastLogin` incorrecto | Frontend types | UI muestra "Nunca" siempre |

### 4.3 P2 - Mejoras

| ID | Issue | Ubicación | Impacto |
|----|-------|-----------|---------|
| P2-001 | Reasignación de estudiantes entre aulas | Admin UI | UX mejorable |
| P2-002 | Reasignación de escuelas | Admin UI | UX mejorable |

---

## 5. DELEGACIONES PLANIFICADAS

### 5.1 ARCHITECTURE-ANALYST
**Objetivo:** Análisis profundo de dependencias y diseño de solución

**Tareas:**
1. Validar arquitectura actual de flujo de usuarios
2. Diseñar solución para School Default
3. Mapear dependencias entre tablas
4. Proponer estructura de seed para institución default

### 5.2 DATABASE (después de análisis)
**Objetivo:** Implementación de cambios DDL/Seeds

**Tareas:**
1. Crear seed de School Default si no existe
2. Verificar/corregir función `assign_default_classroom`
3. Validar triggers de inicialización

### 5.3 BACKEND (después de DB)
**Objetivo:** Implementación de servicios

**Tareas:**
1. Implementar/corregir `AuthService.register()`
2. Actualizar `last_sign_in_at` en login
3. Mapear respuesta de API users

### 5.4 FRONTEND (después de Backend)
**Objetivo:** Correcciones de UI

**Tareas:**
1. Corregir mapping de `lastLogin` en AdminUsersPage
2. Verificar tipos de SystemUser

---

## 6. PREGUNTAS DE CLARIFICACIÓN

Antes de proceder a FASE 2, necesito clarificar:

1. **School Default:** ¿Crear una nueva escuela "Sistema - Por Asignar" o usar Marie Curie como default?

2. **Admin School:** ¿El admin debe tener una escuela asignada o es correcta que sea NULL?

3. **Flujo OAuth:** ¿Los usuarios que se registran vía OAuth también deben asignarse al classroom default?

4. **Reasignación masiva:** ¿Se requiere funcionalidad para mover todos los estudiantes de una aula a otra?

---

## 7. SIGUIENTE PASO

**FASE 2: Ejecución de Análisis**
- Delegar a ARCHITECTURE-ANALYST para análisis profundo
- Ejecutar análisis con subagentes especializados
- Consolidar hallazgos en reporte

---

**Fin del Plan de Análisis - FASE 1**
*Documento generado por Tech-Leader - 2025-12-15*
