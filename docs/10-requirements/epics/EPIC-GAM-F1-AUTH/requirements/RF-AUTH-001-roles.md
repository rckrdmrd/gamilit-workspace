---
id: "RF-AUTH-001"
title: "Sistema de Roles de Usuario"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "auth_management"
epic: "EAI-001"
version: "1.0"
labels: ["auth", "roles", "rbac", "security"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# RF-AUTH-001: Sistema de Roles de Usuario

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-AUTH-001 |
| **Módulo** | Autenticación y Autorización |
| **Prioridad** | Alta |
| **Estado** | Done |
| **Versión** | 1.0 |
| **Fecha creación** | 2025-11-07 |
| **Última actualización** | 2026-01-04 |

## 🔗 Referencias

### Especificación Técnica
📐 [ET-AUTH-001: RBAC (Role-Based Access Control)](../specifications/ET-AUTH-001-rbac.md)

### Implementación DDL
🗄️ **ENUM Canónico:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:30-32`
- **Tipo:** `auth_management.gamilit_role`
- **Valores:** `student`, `admin_teacher`, `super_admin`

🗄️ **Tablas que usan el ENUM:**
1. `auth_management.profiles` → `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql:15`
2. `auth.users` → `apps/database/ddl/schemas/auth/tables/01-users.sql:15`
3. `system_configuration.feature_flags` → `apps/database/ddl/schemas/system_configuration/tables/02-feature_flags.sql:20`

### Backend
💻 **Implementación:**
- **Enum:** `apps/backend/src/shared/enums/gamilit-role.enum.ts`
- **Guard:** `apps/backend/src/shared/guards/roles.guard.ts`
- **Decorator:** `@Roles('admin_teacher', 'super_admin')`

### Frontend
🎨 **Componentes:**
- **Types:** `apps/frontend/src/types/auth.types.ts`
- **Componentes:**
  - `apps/frontend/src/components/auth/RoleBasedRoute.tsx`
  - `apps/frontend/src/components/ui/UserRoleBadge.tsx`
  - `apps/frontend/src/components/admin/AdminPanel.tsx`

### Mapeo Completo
📊 [Ver mapeo completo: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#11-sistema-de-roles-de-usuario)

---

## 📝 Descripción del Requerimiento

### Contexto

El sistema educativo Gamilit necesita diferenciar entre tres tipos de usuarios con permisos y funcionalidades distintas. Esta diferenciación es crítica para:
- Proteger datos sensibles de estudiantes
- Permitir gestión efectiva de aulas por profesores
- Facilitar administración del sistema completo

### Necesidad del Negocio

**Problema:**
Sin un sistema de roles bien definido, todos los usuarios tendrían el mismo nivel de acceso, lo cual:
- Comprometería la privacidad de datos de estudiantes
- Dificultaría la gestión de contenido educativo
- Impediría la administración centralizada del sistema

**Solución:**
Implementar un sistema de roles con 3 niveles de autorización que permita acceso granular basado en responsabilidades.

---

## 🎯 Requerimiento Funcional

### RF-AUTH-001.1: Roles Disponibles

El sistema **DEBE** soportar exactamente 3 roles de usuario:

#### 1. Estudiante (`student`)
**Descripción:** Usuario regular que accede al sistema para aprender

**Permisos:**
- ✅ Acceder a ejercicios asignados
- ✅ Ver su propio progreso y estadísticas
- ✅ Interactuar con sistema de gamificación personal
- ✅ Participar en funcionalidades sociales (amigos, equipos)
- ✅ Ver contenido publicado
- ❌ NO puede ver datos de otros estudiantes (excepto amigos)
- ❌ NO puede crear o editar contenido educativo
- ❌ NO puede acceder a panel de administración

**Restricciones RLS (Row Level Security):**
```sql
-- Política típica para estudiantes
CREATE POLICY "students_view_own_data" ON progress_tracking.module_progress
    FOR SELECT
    TO authenticated
    USING (
        user_id = gamilit.get_current_user_id()
        AND gamilit.get_current_user_role() = 'student'
    );
```

---

#### 2. Profesor/Admin (`admin_teacher`)
**Descripción:** Profesor o administrador de aula con capacidades de gestión

**Permisos:**
- ✅ Todos los permisos de estudiante
- ✅ Crear y editar contenido educativo
- ✅ Ver progreso de estudiantes en sus aulas
- ✅ Revisar ejercicios de respuesta abierta
- ✅ Asignar ejercicios a estudiantes/aulas
- ✅ Generar reportes de aula
- ✅ Gestionar aulas (crear, editar, archivar)
- ❌ NO puede acceder a datos de todas las aulas (solo las asignadas)
- ❌ NO puede modificar configuración del sistema
- ❌ NO puede gestionar usuarios a nivel sistema

**Restricciones RLS:**
```sql
-- Política para profesores (ver estudiantes de sus aulas)
CREATE POLICY "teachers_view_classroom_students" ON progress_tracking.module_progress
    FOR SELECT
    TO authenticated
    USING (
        gamilit.get_current_user_role() = 'admin_teacher'
        AND user_id IN (
            SELECT cm.user_id
            FROM social_features.classroom_members cm
            WHERE cm.classroom_id IN (
                SELECT classroom_id
                FROM social_features.classroom_members
                WHERE user_id = gamilit.get_current_user_id()
                AND role = 'teacher'
            )
        )
    );
```

---

#### 3. Super Admin (`super_admin`)
**Descripción:** Administrador del sistema con acceso completo

**Permisos:**
- ✅ Acceso completo a todos los datos
- ✅ Gestionar usuarios (crear, suspender, banear)
- ✅ Modificar configuración del sistema
- ✅ Aprobar/rechazar contenido en revisión
- ✅ Ver estadísticas globales del sistema
- ✅ Gestionar integraciones externas
- ✅ Acceder a logs de auditoría
- ✅ Exportar datos del sistema
- ⚠️ Sin restricciones RLS (bypass con `USING (true)`)

**Nota de Seguridad:**
> ⚠️ El rol `super_admin` debe asignarse con extremo cuidado. Idealmente limitado a 2-3 usuarios del equipo técnico.

---

### RF-AUTH-001.2: Asignación de Roles

**Reglas de Asignación:**

1. **Al registrarse:**
   - Usuarios nuevos reciben rol `student` por defecto
   - No es posible auto-asignarse `admin_teacher` o `super_admin`

2. **Promoción a admin_teacher:**
   - Solo `super_admin` puede promover usuarios a `admin_teacher`
   - Requiere justificación documentada en audit_logs

3. **Promoción a super_admin:**
   - Solo `super_admin` existente puede promover a otro `super_admin`
   - Requiere aprobación de 2 super_admins (proceso manual)
   - Requiere justificación documentada

4. **Degradación de rol:**
   - `super_admin` puede degradar cualquier rol
   - `admin_teacher` NO puede cambiar roles
   - Usuario puede solicitar degradación voluntaria

---

### RF-AUTH-001.3: Validación de Roles

El sistema **DEBE** validar roles en:

1. **Backend (Guards):**
```typescript
// apps/backend/src/shared/guards/roles.guard.ts
@Roles('admin_teacher', 'super_admin')
@Get('admin/dashboard')
getAdminDashboard() {
  // Solo accesible por admin_teacher y super_admin
}
```

2. **Database (RLS Policies):**
- Cada tabla sensible debe tener políticas RLS por rol
- Triggers verifican permisos antes de INSERT/UPDATE

3. **Frontend (Routing):**
```typescript
// apps/frontend/src/routes/ProtectedRoute.tsx
<RoleBasedRoute allowedRoles={['admin_teacher', 'super_admin']}>
  <AdminDashboard />
</RoleBasedRoute>
```

---

## 📊 Casos de Uso

### UC-STU-001: Estudiante accede a sus ejercicios
**Actor:** Estudiante
**Precondiciones:** Usuario autenticado con rol `student`
**Flujo:**
1. Estudiante navega a "Mis Ejercicios"
2. Sistema consulta `progress_tracking.module_progress` con RLS
3. RLS filtra solo ejercicios donde `user_id = current_user_id`
4. Sistema muestra ejercicios propios del estudiante

**Resultado:** Estudiante ve solo sus datos, no puede acceder a datos de otros.

---

### UC-TEACHER-001: Profesor ve progreso de sus estudiantes
**Actor:** Profesor (admin_teacher)
**Precondiciones:** Usuario autenticado con rol `admin_teacher`, asignado a al menos 1 aula
**Flujo:**
1. Profesor navega a "Mis Aulas"
2. Sistema obtiene aulas donde profesor tiene rol `teacher`
3. Profesor selecciona un aula
4. Sistema consulta progreso de todos los estudiantes del aula
5. RLS valida que profesor tiene acceso a esa aula

**Resultado:** Profesor ve progreso de estudiantes en sus aulas, no de otras aulas.

---

### UC-ADMIN-001: Super admin gestiona sistema completo
**Actor:** Super Admin
**Precondiciones:** Usuario autenticado con rol `super_admin`
**Flujo:**
1. Admin navega a "Panel de Administración"
2. Sistema valida rol = `super_admin`
3. Admin accede a:
   - Gestión de usuarios (todos)
   - Configuración del sistema
   - Logs de auditoría
   - Estadísticas globales

**Resultado:** Admin tiene visibilidad completa del sistema.

---

## 🔐 Consideraciones de Seguridad

### 1. Principio de Menor Privilegio
- Cada rol tiene **únicamente** los permisos necesarios para su función
- No hay roles "comodín" con permisos arbitrarios

### 2. Defense in Depth (Defensa en Profundidad)
Validación en **3 capas**:
1. **Frontend:** Oculta UI no autorizada (seguridad visual)
2. **Backend:** Guards verifican roles antes de ejecutar lógica
3. **Database:** RLS policies bloquean acceso a nivel de datos

### 3. Auditoría de Cambios de Rol
Toda asignación/cambio de rol se audita en `audit_logging.audit_logs`:
```sql
-- Trigger automático
INSERT INTO audit_logging.audit_logs (
    user_id, action, resource_type, resource_id, details
) VALUES (
    current_admin_id,
    'update',
    'user_role',
    target_user_id,
    jsonb_build_object(
        'old_role', 'student',
        'new_role', 'admin_teacher',
        'reason', 'Promoted to manage classroom XYZ'
    )
);
```

---

## ✅ Criterios de Aceptación

### AC-001: Roles Implementados
- [x] ENUM `gamilit_role` existe en DDL con 3 valores
- [x] Backend tiene enum TypeScript espejo
- [x] Frontend tiene types TypeScript

### AC-002: RLS Policies Activas
- [x] Tabla `progress_tracking.module_progress` tiene policies por rol
- [x] Tabla `educational_content.modules` tiene policies por rol
- [x] Tabla `social_features.classroom_members` tiene policies por rol
- [x] 7+ tablas críticas con RLS implementado

### AC-003: Guards Funcionales
- [x] `@Roles()` decorator implementado en backend
- [x] Endpoints sensibles protegidos con guards
- [x] Tests E2E validan autorización por rol

### AC-004: UI Adapta por Rol
- [x] Dashboard muestra diferentes opciones según rol
- [x] Menú de navegación adapta según rol
- [x] Componentes restringidos no se muestran a roles no autorizados

### AC-005: Auditoría
- [x] Cambios de rol se auditan en `audit_logs`
- [x] Timestamp, admin que realizó cambio, y justificación registrados

---

## 🧪 Testing

### Test Case 1: Estudiante NO puede ver datos de otros
```typescript
test('Student cannot view other students progress', async () => {
  const student1 = await createUser({ role: 'student' });
  const student2 = await createUser({ role: 'student' });

  await loginAs(student1);
  const response = await api.get(`/progress/${student2.id}`);

  expect(response.status).toBe(403); // Forbidden
});
```

### Test Case 2: Profesor puede ver progreso de su aula
```typescript
test('Teacher can view classroom students progress', async () => {
  const teacher = await createUser({ role: 'admin_teacher' });
  const classroom = await createClassroom({ teacherId: teacher.id });
  const student = await addStudentToClassroom(classroom.id);

  await loginAs(teacher);
  const response = await api.get(`/classrooms/${classroom.id}/progress`);

  expect(response.status).toBe(200);
  expect(response.data.students).toContainEqual(
    expect.objectContaining({ id: student.id })
  );
});
```

### Test Case 3: Super admin tiene acceso completo
```typescript
test('Super admin can access all data', async () => {
  const admin = await createUser({ role: 'super_admin' });

  await loginAs(admin);
  const response = await api.get('/admin/users');

  expect(response.status).toBe(200);
  expect(response.data.users.length).toBeGreaterThan(0);
});
```

---

## 📚 Referencias Adicionales

### Documentos Relacionados
- 📄 [RF-AUTH-002: Estados de Cuenta de Usuario](./RF-AUTH-002-estados-cuenta.md)
- 📄 [RF-SOC-001: Sistema de Aulas](../05-caracteristicas-sociales/RF-SOC-001-aulas-virtuales.md)
- 📐 [ADR-003: Decisión de usar RLS en lugar de app-level auth](../../../../90-adr/ADR-003-rls-multitenancy.md)

### Estándares de Industria
- [NIST RBAC Model](https://csrc.nist.gov/projects/role-based-access-control)
- [OWASP: Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación inicial del requerimiento |

---

**Documento:** `docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md`
**Ruta relativa desde docs/:** `01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md`
