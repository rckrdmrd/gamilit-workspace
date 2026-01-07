---
id: "US-PM-006"
title: "Bloquear/Desbloquear Alumnos del Maestro"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 8
budget: "$3,200 MXN"
sprint: "Sprint-TBD"
labels: ["portal-maestros", "student-management", "suspension", "access-control", "v2-core"]
created_date: "2025-11-08"
updated_date: "2026-01-04"
---

# US-PM-006: Bloquear/Desbloquear Alumnos del Maestro

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-PM-006 |
| **Epica** | EXT-001 (Portal de Maestros CORE) |
| **Modulo** | Portal de Maestros |
| **Prioridad** | Alta (v2 CORE) |
| **Story Points** | 8 |
| **Presupuesto** | $3,200 MXN |
| **Sprint** | TBD |
| **Estado** | Backlog |
| **Version** | 1.0 |
| **Fecha creacion** | 2025-11-08 |

## 🎯 Historia de Usuario

**Como** maestro de la plataforma GAMILIT
**Quiero** poder bloquear y desbloquear el acceso de mis alumnos
**Para** controlar temporalmente su participación en mis clases (por ejemplo: por comportamiento inadecuado, problemas técnicos, o suspensión académica temporal)

## 📝 Descripción

Los maestros necesitan la capacidad de suspender temporalmente el acceso de estudiantes que están inscritos en sus aulas (classrooms). Esta funcionalidad permite al maestro tomar decisiones de gestión disciplinaria o académica sin necesidad de escalar al administrador del sistema.

### Contexto de Alcance v2

Esta funcionalidad es parte del **Alcance v2 (Ampliación) - Portal de Maestros CORE**:
- En v1, solo el admin puede suspender usuarios
- En v2, el maestro puede suspender/activar **solo SUS alumnos**
- El super admin mantiene la capacidad de suspender cualquier usuario

## 🔗 Referencias

### Épica y Documentación
- **Épica:** EXT-001 (Portal de Maestros)
- **Alcance:** 2.2.1.5 Administración y Escalabilidad (v2 - Portal Maestros)
- **RF relacionado:** RF-AUTH-002 (Estados de cuenta de usuario)
- **ET relacionado:** ET-AUTH-002 (Estados de cuenta - implementación)

### Objetos de BD
- **Tabla principal:** `auth_management.profiles`
  - Columna: `status` (ENUM: active, suspended, pending_verification, deactivated)
  - Columna: `status_changed_at` (timestamp)
  - Columna: `status_changed_by` (UUID referencia a users)
  - Columna: `status_reason` (TEXT, opcional)

- **Tabla de auditoría:** `audit_logging.audit_events`
  - Registra todas las suspensiones/reactivaciones

- **RLS Policies necesarias:**
  ```sql
  -- Maestro puede actualizar status de sus alumnos
  CREATE POLICY "teachers_update_their_students_status"
  ON auth_management.profiles
  FOR UPDATE
  TO authenticated
  USING (
    gamilit.get_current_user_role() = 'teacher'
    AND user_id IN (
      SELECT student_id
      FROM social_features.classroom_members cm
      JOIN social_features.classrooms c ON cm.classroom_id = c.id
      WHERE c.teacher_id = gamilit.get_current_user_id()
    )
  )
  WITH CHECK (
    status IN ('active', 'suspended')
    AND status_changed_by = gamilit.get_current_user_id()
  );
  ```

### Backend
- **Endpoint:** `PATCH /api/v1/teacher/students/:studentId/status`
- **Service:** `TeacherService.updateStudentStatus()`
- **DTO:** `UpdateStudentStatusDto`

### Frontend
- **Ruta:** `/teacher/classrooms/:classroomId/students`
- **Componente:** `StudentActionsMenu.tsx`
- **Hook:** `useStudentStatus()`

## ✅ Criterios de Aceptación

### CA-1: Suspender Alumno

**Dado** que soy un maestro autenticado
**Cuando** veo la lista de alumnos de mi classroom
**Y** selecciono "Suspender acceso" en el menú de acciones de un alumno activo
**Y** proporciono una razón para la suspensión (opcional)
**Y** confirmo la acción
**Entonces:**
- ✅ El status del alumno cambia de `active` a `suspended`
- ✅ Se registra `status_changed_at` con timestamp actual
- ✅ Se registra `status_changed_by` con mi user_id
- ✅ Se guarda `status_reason` si fue proporcionada
- ✅ Se crea un evento en `audit_events` con tipo "student_suspended_by_teacher"
- ✅ El alumno ve un mensaje "Tu cuenta ha sido suspendida temporalmente" al intentar acceder
- ✅ Yo veo una confirmación "Alumno suspendido exitosamente"
- ✅ El alumno aparece con badge "Suspendido" en mi lista

**Y:**
- ❌ El alumno NO puede acceder a actividades de la plataforma
- ❌ El alumno NO puede ver contenido educativo
- ❌ El alumno NO puede participar en gamificación
- ✅ El alumno PUEDE iniciar sesión y ver el mensaje de suspensión
- ✅ El alumno PUEDE contactar soporte o al maestro (opcional)

### CA-2: Reactivar Alumno

**Dado** que soy un maestro autenticado
**Cuando** veo la lista de alumnos de mi classroom
**Y** veo un alumno con status `suspended`
**Y** selecciono "Reactivar acceso" en el menú de acciones
**Y** confirmo la acción
**Entonces:**
- ✅ El status del alumno cambia de `suspended` a `active`
- ✅ Se actualiza `status_changed_at` con timestamp actual
- ✅ Se registra `status_changed_by` con mi user_id
- ✅ Se limpia `status_reason` (opcional: mantener histórico)
- ✅ Se crea un evento en `audit_events` con tipo "student_reactivated_by_teacher"
- ✅ El alumno recibe notificación "Tu acceso ha sido restaurado"
- ✅ Yo veo una confirmación "Alumno reactivado exitosamente"
- ✅ El alumno desaparece del filtro "Suspendidos"

**Y:**
- ✅ El alumno puede acceder inmediatamente a todas las funcionalidades

### CA-3: Restricciones y Validaciones

**Dado** que soy un maestro
**Cuando** intento suspender un alumno
**Entonces:**
- ✅ Solo puedo suspender alumnos de MIS classrooms (RLS policy)
- ❌ NO puedo suspender alumnos de otros maestros
- ❌ NO puedo suspender maestros (solo admin puede)
- ❌ NO puedo suspender administradores
- ❌ NO puedo cambiar status a `banned` o `deactivated` (solo admin puede)
- ✅ Solo puedo alternar entre `active` y `suspended`

### CA-4: Interfaz de Usuario

**Dado** que estoy en la vista de alumnos de mi classroom
**Entonces:**
- ✅ Veo un menú de 3 puntos (⋮) junto a cada alumno
- ✅ El menú muestra "Suspender acceso" si el alumno está activo
- ✅ El menú muestra "Reactivar acceso" si el alumno está suspendido
- ✅ Al hacer clic aparece un modal de confirmación
- ✅ El modal tiene:
  - Nombre del alumno
  - Acción a realizar (suspender/reactivar)
  - Campo de razón (textarea, opcional, solo al suspender)
  - Botones "Cancelar" y "Confirmar"
- ✅ Los alumnos suspendidos tienen badge rojo "Suspendido"
- ✅ Los alumnos activos tienen badge verde "Activo"
- ✅ Puedo filtrar la lista por status: Todos | Activos | Suspendidos

### CA-5: Historial y Auditoría

**Dado** que soy un maestro
**Cuando** veo el perfil de un alumno de mi classroom
**Entonces:**
- ✅ Veo el status actual del alumno
- ✅ Veo la fecha del último cambio de status
- ✅ Veo quién realizó el último cambio (maestro o admin)
- ✅ Veo la razón de suspensión (si existe)
- ✅ (Opcional) Veo un historial de cambios de status

**Y** como super admin:
- ✅ Puedo ver en el panel de auditoría todas las suspensiones por maestro
- ✅ Puedo revertir suspensiones de maestros si es necesario

### CA-6: Notificaciones

**Cuando** un maestro suspende a un alumno
**Entonces:**
- ✅ El alumno recibe notificación in-app (si está conectado)
- ✅ El alumno recibe email notificando la suspensión
- ✅ El email incluye: razón (si fue proporcionada), contacto del maestro
- ❌ NO se envía notificación a padres (eso es EXT-010)

**Cuando** un maestro reactiva a un alumno
**Entonces:**
- ✅ El alumno recibe notificación in-app y email de reactivación

## 🏗️ Diseño Técnico

### Backend (NestJS)

#### DTO: UpdateStudentStatusDto
```typescript
// apps/backend/src/modules/teacher/dto/update-student-status.dto.ts

import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum StudentStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export class UpdateStudentStatusDto {
  @IsEnum(StudentStatus)
  status: StudentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
```

#### Service: TeacherService.updateStudentStatus()
```typescript
// apps/backend/src/modules/teacher/teacher.service.ts

async updateStudentStatus(
  teacherId: string,
  studentId: string,
  dto: UpdateStudentStatusDto,
): Promise<{ success: boolean; message: string }> {
  // 1. Verificar que el alumno pertenece a classroom del maestro
  const membership = await this.dbClient
    .from('classroom_members')
    .select('*, classroom:classrooms(teacher_id)')
    .eq('student_id', studentId)
    .eq('classroom.teacher_id', teacherId)
    .single();

  if (!membership) {
    throw new ForbiddenException(
      'No tienes permiso para modificar el status de este alumno'
    );
  }

  // 2. Actualizar status del perfil
  const { error } = await this.dbClient
    .from('profiles')
    .update({
      status: dto.status,
      status_changed_at: new Date().toISOString(),
      status_changed_by: teacherId,
      status_reason: dto.reason || null,
    })
    .eq('user_id', studentId);

  if (error) throw new InternalServerErrorException(error.message);

  // 3. Registrar en auditoría
  await this.auditService.log({
    event_type: dto.status === 'suspended'
      ? 'student_suspended_by_teacher'
      : 'student_reactivated_by_teacher',
    user_id: teacherId,
    target_user_id: studentId,
    metadata: { reason: dto.reason, classroom_id: enrollment.classroom_id },
  });

  // 4. Enviar notificación al alumno
  await this.notificationService.send({
    user_id: studentId,
    type: dto.status === 'suspended' ? 'account_suspended' : 'account_reactivated',
    title: dto.status === 'suspended'
      ? 'Acceso suspendido'
      : 'Acceso restaurado',
    message: dto.status === 'suspended'
      ? `Tu acceso ha sido suspendido temporalmente. Razón: ${dto.reason || 'No especificada'}`
      : 'Tu acceso a la plataforma ha sido restaurado.',
    channels: ['in_app', 'email'],
  });

  return {
    success: true,
    message: `Alumno ${dto.status === 'suspended' ? 'suspendido' : 'reactivado'} exitosamente`,
  };
}
```

#### Controller: TeacherController
```typescript
// apps/backend/src/modules/teacher/teacher.controller.ts

@Patch('students/:studentId/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
async updateStudentStatus(
  @Req() req,
  @Param('studentId') studentId: string,
  @Body() dto: UpdateStudentStatusDto,
) {
  return this.teacherService.updateStudentStatus(
    req.user.id,
    studentId,
    dto,
  );
}
```

### Frontend (React + TypeScript)

#### Hook: useStudentStatus
```typescript
// apps/frontend/src/features/teacher/hooks/useStudentStatus.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '@/api/teacher';
import { toast } from 'sonner';

export function useStudentStatus() {
  const queryClient = useQueryClient();

  const suspendStudent = useMutation({
    mutationFn: ({ studentId, reason }: { studentId: string; reason?: string }) =>
      teacherApi.updateStudentStatus(studentId, {
        status: 'suspended',
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['classroom-students']);
      toast.success('Alumno suspendido exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al suspender alumno');
    },
  });

  const reactivateStudent = useMutation({
    mutationFn: (studentId: string) =>
      teacherApi.updateStudentStatus(studentId, {
        status: 'active',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['classroom-students']);
      toast.success('Alumno reactivado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al reactivar alumno');
    },
  });

  return { suspendStudent, reactivateStudent };
}
```

#### Componente: StudentActionsMenu
```typescript
// apps/frontend/src/features/teacher/components/StudentActionsMenu.tsx

import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { MoreVertical, UserX, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { SuspendStudentModal } from './SuspendStudentModal';
import { ReactivateStudentModal } from './ReactivateStudentModal';

interface StudentActionsMenuProps {
  student: {
    id: string;
    name: string;
    status: 'active' | 'suspended';
  };
}

export function StudentActionsMenu({ student }: StudentActionsMenuProps) {
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <button className="p-2 hover:bg-gray-100 rounded">
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          {student.status === 'active' ? (
            <DropdownMenu.Item
              onClick={() => setShowSuspendModal(true)}
              className="text-red-600"
            >
              <UserX className="w-4 h-4 mr-2" />
              Suspender acceso
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item
              onClick={() => setShowReactivateModal(true)}
              className="text-green-600"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Reactivar acceso
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>

      <SuspendStudentModal
        student={student}
        open={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
      />

      <ReactivateStudentModal
        student={student}
        open={showReactivateModal}
        onClose={() => setShowReactivateModal(false)}
      />
    </>
  );
}
```

#### Modal: SuspendStudentModal
```typescript
// apps/frontend/src/features/teacher/components/SuspendStudentModal.tsx

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useStudentStatus } from '../hooks/useStudentStatus';

export function SuspendStudentModal({ student, open, onClose }) {
  const [reason, setReason] = useState('');
  const { suspendStudent } = useStudentStatus();

  const handleSuspend = () => {
    suspendStudent.mutate(
      { studentId: student.id, reason },
      {
        onSuccess: () => {
          onClose();
          setReason('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Title>Suspender acceso de {student.name}</Dialog.Title>
      <Dialog.Description>
        El estudiante no podrá acceder a actividades ni contenido hasta que reactives su cuenta.
      </Dialog.Description>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">
          Razón de suspensión (opcional)
        </label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej: Comportamiento inadecuado en clase virtual"
          maxLength={500}
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Esta razón será visible para el estudiante y administradores
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="destructive"
          onClick={handleSuspend}
          isLoading={suspendStudent.isPending}
        >
          Suspender acceso
        </Button>
      </div>
    </Dialog>
  );
}
```

## 🧪 Testing

### Test Cases

**TC-1: Maestro suspende alumno de su classroom**
```typescript
describe('updateStudentStatus - suspend', () => {
  it('should suspend student successfully', async () => {
    const teacherId = 'teacher-1';
    const studentId = 'student-1';

    const result = await teacherService.updateStudentStatus(teacherId, studentId, {
      status: 'suspended',
      reason: 'Comportamiento inadecuado',
    });

    expect(result.success).toBe(true);

    const profile = await dbClient
      .from('profiles')
      .select('status, status_reason')
      .eq('user_id', studentId)
      .single();

    expect(profile.data.status).toBe('suspended');
    expect(profile.data.status_reason).toBe('Comportamiento inadecuado');
  });
});
```

**TC-2: Maestro NO puede suspender alumno de otro classroom**
```typescript
it('should throw ForbiddenException when suspending student from another classroom', async () => {
  const teacherId = 'teacher-1';
  const studentIdOtherClassroom = 'student-99';

  await expect(
    teacherService.updateStudentStatus(teacherId, studentIdOtherClassroom, {
      status: 'suspended',
    })
  ).rejects.toThrow(ForbiddenException);
});
```

**TC-3: RLS policy impide actualización directa**
```typescript
it('should respect RLS policy', async () => {
  const teacherId = 'teacher-1';
  const studentIdOtherClassroom = 'student-99';

  // Intento directo de update (bypass service)
  const { error } = await dbClient
    .from('profiles')
    .update({ status: 'suspended' })
    .eq('user_id', studentIdOtherClassroom);

  expect(error).toBeDefined();
  expect(error.message).toContain('policy violation');
});
```

### Coverage Objetivo
- Backend: 90%+ (services, controllers)
- Frontend: 85%+ (hooks, componentes)
- E2E: Casos críticos (suspender, reactivar)

## 📊 Métricas

| Métrica | Valor Objetivo |
|---------|----------------|
| **Response time** | < 500ms (suspender/reactivar) |
| **Notificación enviada** | < 2s después de acción |
| **UI feedback** | < 200ms (confirmación visual) |
| **Disponibilidad** | 99.9% |
| **Error rate** | < 0.1% |

## 🔐 Seguridad

### Validaciones
- ✅ JWT token válido y no expirado
- ✅ Role `teacher` verificado via RolesGuard
- ✅ RLS policy valida ownership del classroom
- ✅ Solo puede alternar entre `active` y `suspended`
- ✅ Audit trail completo de todas las acciones

### Casos de Abuso Prevenidos
- ❌ Maestro suspende alumnos de otros maestros (RLS)
- ❌ Maestro cambia status a `banned` (validación enum)
- ❌ Maestro suspende administradores (RLS)
- ❌ Suspensión masiva sin razón (rate limiting recomendado)

## 🚀 Deployment

### Migraciones de BD
- No requiere nuevas migraciones (usa infraestructura de RF-AUTH-002)
- Solo requiere nueva RLS policy

### Feature Flag
```typescript
// Controlar rollout gradual
{
  "feature": "teacher_student_suspension",
  "enabled": true,
  "rollout_percentage": 100,
  "enabled_for_roles": ["teacher"]
}
```

## 📚 Documentación para Usuario

### Para Maestros
**Título:** Cómo suspender temporalmente a un alumno

1. Ve a "Mis Aulas" → Selecciona el aula
2. En la lista de alumnos, haz clic en el menú (⋮) del alumno
3. Selecciona "Suspender acceso"
4. (Opcional) Escribe una razón para la suspensión
5. Haz clic en "Confirmar"

**Para reactivar:**
1. Busca al alumno suspendido (usa filtro "Suspendidos")
2. Haz clic en el menú (⋮) → "Reactivar acceso"
3. Confirma la acción

**Nota:** El alumno recibirá una notificación inmediatamente.

### Para Alumnos
**Título:** ¿Por qué no puedo acceder a la plataforma?

Si ves el mensaje "Tu cuenta ha sido suspendida temporalmente", tu maestro ha restringido tu acceso. Revisa tu email para más detalles o contacta a tu maestro.

## 🔗 Dependencias

### Épicas/US Relacionadas
- **EAI-001 (US-FUND-001):** Autenticación base
- **RF-AUTH-002:** Estados de cuenta (infraestructura)
- **ET-AUTH-002:** Implementación de estados
- **EXT-003 (opcional):** Notificaciones (si está implementado)

### Bloqueantes
- ✅ RF-AUTH-002 debe estar implementado
- ✅ RLS policies base deben existir
- ✅ Sistema de auditoría operativo

## 📅 Estimación

| Actividad | Esfuerzo |
|-----------|----------|
| Backend (service, controller, DTO) | 2 SP |
| RLS Policy | 1 SP |
| Frontend (hook, componentes, modales) | 3 SP |
| Testing (unit + integration + E2E) | 1.5 SP |
| Documentación | 0.5 SP |
| **TOTAL** | **8 SP** |

**Presupuesto:** $3,200 MXN (8 SP × $400/SP)

---

**Generado:** 2025-11-08
**Autor:** Product Owner + Tech Lead
**Revisión:** Pendiente
**Aprobación:** Pendiente
