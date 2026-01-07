---
id: "US-AE-007"
title: "Asignar Grupos a Maestros"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-002"
story_points: 6
budget: "$2,400 MXN"
sprint: "Sprint-FE-059"
labels: ["admin-extendido", "classrooms", "teachers", "v2-core", "implemented"]
created_date: "2025-11-08"
updated_date: "2026-01-06"
completed_date: "2025-11-19"
---

# US-AE-007: Asignar Grupos a Maestros

> **NOTA: COPIA DE REFERENCIA**
>
> Este archivo es una copia de trabajo usada durante la restructuración v2.
>
> **SSOT (Single Source of Truth):**
> `docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/US-AE-007-asignar-grupos-maestros.md`
>
> **Estado actual:** IMPLEMENTADO (Done) - 2025-11-19

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-007 |
| **Epica** | EXT-002 - Gestion Avanzada Admin |
| **Fase** | Fase 3 - Extensiones |
| **Alcance** | v2 CORE - Ampliacion |
| **Prioridad** | Alta (P1) |
| **Story Points** | 6 SP |
| **Presupuesto** | $2,400 MXN |
| **Estado** | Backlog |

---

## 📋 Descripción

Como **super admin**, necesito poder asignar múltiples grupos (classrooms) a maestros de manera eficiente, para que cada maestro pueda gestionar sus estudiantes organizados por aulas virtuales.

---

## 🎯 Criterios de Aceptación

### AC-1: Asignación Individual de Grupo a Maestro

**DADO** que soy un super admin autenticado
**CUANDO** accedo al detalle de un maestro
**ENTONCES** debo poder:
- Ver listado de grupos actuales del maestro
- Asignar un nuevo grupo disponible al maestro
- Confirmar la asignación con mensaje de éxito
- Ver el grupo inmediatamente reflejado en su lista

**Validaciones:**
- ✅ Grupo no puede estar asignado a otro maestro
- ✅ Maestro debe tener rol `teacher`
- ✅ Grupo debe existir y estar activo
- ✅ No duplicar asignaciones

---

### AC-2: Remoción de Asignación

**DADO** que un maestro tiene grupos asignados
**CUANDO** como super admin deseo remover una asignación
**ENTONCES** debo:
- Ver botón de "Remover asignación" en cada grupo
- Confirmar acción con modal de advertencia
- Advertir si hay estudiantes activos en el grupo
- Poder confirmar o cancelar la remoción
- Ver actualización inmediata tras confirmar

**Comportamiento:**
- Si el grupo tiene estudiantes activos, mostrar count y advertencia
- Remoción NO elimina el grupo ni los estudiantes
- Solo desvincula al maestro del grupo
- Grupo queda disponible para reasignación

---

### AC-3: Asignación Masiva de Grupos

**DADO** que deseo asignar múltiples grupos a un maestro
**CUANDO** uso la interfaz de asignación masiva
**ENTONCES** debo poder:
- Ver interfaz con dos columnas: "Grupos disponibles" y "Grupos del maestro"
- Seleccionar múltiples grupos disponibles (checkboxes)
- Usar botón "Asignar seleccionados" para transferir
- Ver actualización en tiempo real de ambas columnas
- Guardar cambios con un solo botón "Guardar asignaciones"

**Interacción:**
```
┌─────────────────────────────────────────────────┐
│  Asignar Grupos a: Juan Pérez (Maestro)        │
├─────────────────────────────────────────────────┤
│                                                 │
│  Grupos Disponibles         Grupos Asignados   │
│  ┌─────────────────┐       ┌─────────────────┐ │
│  │ □ 3-A Primaria  │       │ ☑ 2-B Primaria  │ │
│  │ □ 3-B Primaria  │  -->  │ ☑ 2-C Primaria  │ │
│  │ □ 4-A Primaria  │  <--  │                 │ │
│  └─────────────────┘       └─────────────────┘ │
│                                                 │
│  [Asignar >>]    [<< Remover]                  │
│                                                 │
│              [Cancelar]  [Guardar]             │
└─────────────────────────────────────────────────┘
```

---

### AC-4: Búsqueda y Filtrado de Grupos

**DADO** que hay muchos grupos disponibles
**CUANDO** busco grupos para asignar
**ENTONCES** debo poder:
- Buscar por nombre de grupo (ej: "3-A")
- Filtrar por nivel educativo
- Filtrar por estado (activo/inactivo)
- Ver contador de resultados
- Resetear filtros con un botón

**Filtros disponibles:**
- Búsqueda por texto (nombre del grupo)
- Nivel educativo: Primaria, Secundaria, Preparatoria
- Estado: Activo, Inactivo
- Ya asignado: Sí/No

---

### AC-5: Vista de Maestros con Grupos Asignados

**DADO** que estoy en el listado de maestros
**CUANDO** veo la tabla de maestros
**ENTONCES** debo ver:
- Columna "Grupos asignados" con count (ej: "3 grupos")
- Badge visual si no tiene grupos asignados
- Hover tooltip mostrando nombres de los grupos
- Botón rápido "Gestionar grupos"

**Vista de tabla:**
```
┌────────────────────────────────────────────────────────────┐
│ Nombre        │ Email              │ Grupos   │ Acciones   │
├────────────────────────────────────────────────────────────┤
│ Juan Pérez    │ juan@example.com   │ 3 grupos │ [Gestionar]│
│               │                    │ (2-A, 2-B...          │
│ María López   │ maria@example.com  │ ⚠️ Sin    │ [Gestionar]│
│               │                    │   grupos │            │
└────────────────────────────────────────────────────────────┘
```

---

### AC-6: Validación de Restricciones

**DADO** que intento asignar un grupo
**CUANDO** el grupo ya tiene maestro asignado
**ENTONCES** debo:
- Ver mensaje de error claro
- Identificar qué maestro lo tiene asignado
- Opción de reasignar (remover del maestro anterior y asignar al nuevo)

**Restricciones:**
- Un grupo solo puede tener un maestro asignado
- Un maestro puede tener múltiples grupos
- No se puede asignar grupo a usuario con rol diferente a `teacher`
- Grupos inactivos no se pueden asignar

---

### AC-7: Historial de Asignaciones

**DADO** que deseo auditar cambios de asignaciones
**CUANDO** accedo al historial de un grupo o maestro
**ENTONCES** debo ver:
- Lista cronológica de asignaciones/remociones
- Fecha y hora de cada cambio
- Administrador que realizó el cambio
- Maestro anterior y nuevo (en reasignaciones)

**Formato de log:**
```
2025-11-08 14:30 - Super Admin (admin@gamilit.com)
→ Asignó grupo "3-A Primaria" a Juan Pérez

2025-11-07 10:15 - Super Admin (admin@gamilit.com)
→ Removió grupo "2-B Primaria" de María López
```

---

## 🏗️ Diseño Técnico

### Backend (NestJS)

#### Módulo: `admin` (apps/backend/src/admin/)

**Nuevos Endpoints:**

```typescript
// admin/classroom-assignments.controller.ts

@Controller('admin/classroom-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class ClassroomAssignmentsController {

  /**
   * GET /admin/classroom-assignments/teachers/:teacherId/classrooms
   * Obtener grupos asignados a un maestro
   */
  @Get('teachers/:teacherId/classrooms')
  async getTeacherClassrooms(
    @Param('teacherId') teacherId: string,
  ): Promise<ClassroomAssignmentDto[]> {
    // Retorna lista de classrooms con metadata
  }

  /**
   * GET /admin/classroom-assignments/available
   * Obtener grupos disponibles para asignar
   */
  @Get('available')
  async getAvailableClassrooms(
    @Query() filters: AvailableClassroomsFiltersDto,
  ): Promise<AvailableClassroomDto[]> {
    // Retorna grupos sin maestro asignado
  }

  /**
   * POST /admin/classroom-assignments
   * Asignar un grupo a un maestro
   */
  @Post()
  async assignClassroomToTeacher(
    @Body() dto: AssignClassroomDto,
  ): Promise<{ success: boolean; message: string; assignment: ClassroomAssignmentDto }> {
    // Valida y crea asignación
  }

  /**
   * POST /admin/classroom-assignments/bulk
   * Asignación masiva de grupos a un maestro
   */
  @Post('bulk')
  async bulkAssignClassrooms(
    @Body() dto: BulkAssignClassroomsDto,
  ): Promise<{
    success: boolean;
    assigned: number;
    failed: Array<{ classroomId: string; reason: string }>
  }> {
    // Asigna múltiples grupos en una operación
  }

  /**
   * DELETE /admin/classroom-assignments/:assignmentId
   * Remover asignación de grupo a maestro
   */
  @Delete(':assignmentId')
  async removeClassroomAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: RemoveAssignmentDto, // { force: boolean }
  ): Promise<{ success: boolean; message: string }> {
    // Valida y remueve asignación
  }

  /**
   * POST /admin/classroom-assignments/reassign
   * Reasignar grupo de un maestro a otro
   */
  @Post('reassign')
  async reassignClassroom(
    @Body() dto: ReassignClassroomDto,
  ): Promise<{ success: boolean; message: string }> {
    // Remueve de maestro anterior y asigna a nuevo maestro
  }

  /**
   * GET /admin/classroom-assignments/history/:classroomId
   * Historial de asignaciones de un grupo
   */
  @Get('history/:classroomId')
  async getClassroomAssignmentHistory(
    @Param('classroomId') classroomId: string,
  ): Promise<AssignmentHistoryDto[]> {
    // Retorna historial de cambios
  }
}
```

**DTOs:**

```typescript
// admin/dto/assign-classroom.dto.ts

export class AssignClassroomDto {
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @IsUUID()
  @IsNotEmpty()
  classroomId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string; // Notas del admin sobre la asignación
}

export class BulkAssignClassroomsDto {
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
  classroomIds: string[];
}

export class RemoveAssignmentDto {
  @IsBoolean()
  @IsOptional()
  force?: boolean; // Si true, remueve aunque haya estudiantes activos
}

export class ReassignClassroomDto {
  @IsUUID()
  @IsNotEmpty()
  classroomId: string;

  @IsUUID()
  @IsNotEmpty()
  fromTeacherId: string;

  @IsUUID()
  @IsNotEmpty()
  toTeacherId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class AvailableClassroomsFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['primaria', 'secundaria', 'preparatoria'])
  level?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  activeOnly?: boolean;
}
```

**Servicio:**

```typescript
// admin/classroom-assignments.service.ts

@Injectable()
export class ClassroomAssignmentsService {
  constructor(
    @InjectRepository(Classroom)
    private classroomRepo: Repository<Classroom>,
    private dbService: DatabaseService,
    private auditService: AuditService,
  ) {}

  /**
   * Asignar classroom a maestro
   */
  async assignClassroomToTeacher(
    dto: AssignClassroomDto,
    adminId: string,
  ): Promise<ClassroomAssignmentDto> {
    // 1. Validar que teacherId sea realmente un maestro
    const teacher = await this.validateTeacher(dto.teacherId);

    // 2. Validar que classroom existe y está activo
    const classroom = await this.validateClassroom(dto.classroomId);

    // 3. Verificar que classroom no tenga maestro asignado
    if (classroom.teacher_id) {
      throw new ConflictException(
        `El grupo "${classroom.name}" ya está asignado a otro maestro. ` +
        `Use la función de reasignación si desea cambiar el maestro.`
      );
    }

    // 4. Actualizar classroom con teacher_id
    const { data, error } = await this.dbClientService.client
      .from('social_features.classrooms')
      .update({
        teacher_id: dto.teacherId,
        updated_at: new Date().toISOString(),
      })
      .eq('classroom_id', dto.classroomId)
      .select()
      .single();

    if (error) throw new InternalServerErrorException('Error al asignar grupo');

    // 5. Registrar en audit_log
    await this.auditService.log({
      action: 'CLASSROOM_ASSIGNED',
      entity_type: 'classroom',
      entity_id: dto.classroomId,
      user_id: adminId,
      metadata: {
        teacher_id: dto.teacherId,
        teacher_name: teacher.full_name,
        classroom_name: classroom.name,
        notes: dto.notes,
      },
    });

    return this.mapToDto(data);
  }

  /**
   * Asignación masiva
   */
  async bulkAssignClassrooms(
    dto: BulkAssignClassroomsDto,
    adminId: string,
  ): Promise<BulkAssignmentResultDto> {
    const results = {
      success: true,
      assigned: 0,
      failed: [],
    };

    for (const classroomId of dto.classroomIds) {
      try {
        await this.assignClassroomToTeacher(
          { teacherId: dto.teacherId, classroomId },
          adminId,
        );
        results.assigned++;
      } catch (error) {
        results.failed.push({
          classroomId,
          reason: error.message,
        });
      }
    }

    results.success = results.failed.length === 0;
    return results;
  }

  /**
   * Remover asignación
   */
  async removeClassroomAssignment(
    classroomId: string,
    force: boolean,
    adminId: string,
  ): Promise<void> {
    // 1. Verificar si hay estudiantes activos
    const { count } = await this.dbClientService.client
      .from('social_features.classroom_members')
      .select('*', { count: 'exact', head: true })
      .eq('classroom_id', classroomId)
      .eq('status', 'active');

    if (count > 0 && !force) {
      throw new ConflictException(
        `El grupo tiene ${count} estudiante(s) activo(s). ` +
        `Use force=true si desea remover la asignación de todos modos.`
      );
    }

    // 2. Remover teacher_id del classroom
    const { error } = await this.dbClientService.client
      .from('social_features.classrooms')
      .update({
        teacher_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('classroom_id', classroomId);

    if (error) throw new InternalServerErrorException('Error al remover asignación');

    // 3. Registrar en audit
    await this.auditService.log({
      action: 'CLASSROOM_UNASSIGNED',
      entity_type: 'classroom',
      entity_id: classroomId,
      user_id: adminId,
      metadata: { force, active_students: count },
    });
  }

  /**
   * Reasignar classroom
   */
  async reassignClassroom(
    dto: ReassignClassroomDto,
    adminId: string,
  ): Promise<void> {
    // 1. Validar maestros
    await this.validateTeacher(dto.fromTeacherId);
    await this.validateTeacher(dto.toTeacherId);

    // 2. Validar que fromTeacher realmente tiene el classroom
    const classroom = await this.classroomRepo.findOne({
      where: {
        classroom_id: dto.classroomId,
        teacher_id: dto.fromTeacherId,
      },
    });

    if (!classroom) {
      throw new NotFoundException(
        'El grupo no está asignado al maestro especificado'
      );
    }

    // 3. Actualizar asignación
    const { error } = await this.dbClientService.client
      .from('social_features.classrooms')
      .update({
        teacher_id: dto.toTeacherId,
        updated_at: new Date().toISOString(),
      })
      .eq('classroom_id', dto.classroomId);

    if (error) throw new InternalServerErrorException('Error al reasignar grupo');

    // 4. Registrar en audit
    await this.auditService.log({
      action: 'CLASSROOM_REASSIGNED',
      entity_type: 'classroom',
      entity_id: dto.classroomId,
      user_id: adminId,
      metadata: {
        from_teacher_id: dto.fromTeacherId,
        to_teacher_id: dto.toTeacherId,
        reason: dto.reason,
      },
    });
  }

  /**
   * Validaciones auxiliares
   */
  private async validateTeacher(userId: string): Promise<any> {
    const { data, error } = await this.dbClientService.client
      .from('auth_management.profiles')
      .select('user_id, full_name, gamilit_role')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Usuario ${userId} no encontrado`);
    }

    if (data.gamilit_role !== 'teacher') {
      throw new BadRequestException(
        `El usuario ${data.full_name} no es un maestro (rol actual: ${data.gamilit_role})`
      );
    }

    return data;
  }

  private async validateClassroom(classroomId: string): Promise<any> {
    const { data, error } = await this.dbClientService.client
      .from('social_features.classrooms')
      .select('*')
      .eq('classroom_id', classroomId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Grupo ${classroomId} no encontrado`);
    }

    if (!data.is_active) {
      throw new BadRequestException(
        `El grupo "${data.name}" está inactivo y no se puede asignar`
      );
    }

    return data;
  }
}
```

---

### Base de Datos

**Tabla afectada:**

```sql
-- social_features.classrooms ya tiene la columna teacher_id
-- No se requieren cambios de esquema, solo validar constraint

-- Verificar que existe FK
ALTER TABLE social_features.classrooms
  ADD CONSTRAINT fk_classrooms_teacher
  FOREIGN KEY (teacher_id)
  REFERENCES auth_management.profiles(user_id)
  ON DELETE SET NULL;

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id
  ON social_features.classrooms(teacher_id)
  WHERE teacher_id IS NOT NULL;
```

**Función auxiliar para validación:**

```sql
-- Función: Verificar si un usuario es maestro
CREATE OR REPLACE FUNCTION social_features.is_teacher(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role auth_management.gamilit_role;
BEGIN
  SELECT gamilit_role INTO v_role
  FROM auth_management.profiles
  WHERE user_id = p_user_id;

  RETURN v_role = 'teacher';
END;
$$;

-- Trigger: Validar que teacher_id sea realmente un maestro
CREATE OR REPLACE FUNCTION social_features.validate_teacher_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.teacher_id IS NOT NULL THEN
    IF NOT social_features.is_teacher(NEW.teacher_id) THEN
      RAISE EXCEPTION 'El usuario asignado no tiene rol de maestro';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_teacher_assignment ON social_features.classrooms;
CREATE TRIGGER trg_validate_teacher_assignment
  BEFORE INSERT OR UPDATE ON social_features.classrooms
  FOR EACH ROW
  EXECUTE FUNCTION social_features.validate_teacher_assignment();
```

**RLS Policies (ya existen, verificar):**

```sql
-- Super admin puede actualizar asignaciones
CREATE POLICY "super_admin_can_update_teacher_assignments"
  ON social_features.classrooms
  FOR UPDATE TO authenticated
  USING (auth.get_current_user_role() = 'super_admin')
  WITH CHECK (auth.get_current_user_role() = 'super_admin');

-- Maestros pueden ver sus propios grupos
CREATE POLICY "teachers_can_view_their_classrooms"
  ON social_features.classrooms
  FOR SELECT TO authenticated
  USING (
    auth.get_current_user_role() = 'teacher'
    AND teacher_id = auth.uid()
  );
```

---

### Frontend (React + TypeScript)

#### Nuevos Componentes

**1. TeacherClassroomsManager.tsx**

```typescript
// apps/frontend/src/features/admin/users/components/TeacherClassroomsManager.tsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { Button, Modal, Alert, Spinner } from '@/components/ui';
import { TransferList } from '@/components/ui/TransferList';

interface TeacherClassroomsManagerProps {
  teacherId: string;
  teacherName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherClassroomsManager: React.FC<TeacherClassroomsManagerProps> = ({
  teacherId,
  teacherName,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [selectedToAssign, setSelectedToAssign] = useState<string[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);

  // Obtener grupos asignados al maestro
  const { data: assignedClassrooms, isLoading: loadingAssigned } = useQuery({
    queryKey: ['teacher-classrooms', teacherId],
    queryFn: () => adminApi.getTeacherClassrooms(teacherId),
    enabled: isOpen,
  });

  // Obtener grupos disponibles
  const { data: availableClassrooms, isLoading: loadingAvailable } = useQuery({
    queryKey: ['available-classrooms'],
    queryFn: () => adminApi.getAvailableClassrooms(),
    enabled: isOpen,
  });

  // Mutación: Asignar grupos
  const assignMutation = useMutation({
    mutationFn: (classroomIds: string[]) =>
      adminApi.bulkAssignClassrooms(teacherId, classroomIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher-classrooms', teacherId]);
      queryClient.invalidateQueries(['available-classrooms']);
      setSelectedToAssign([]);
    },
  });

  // Mutación: Remover grupos
  const removeMutation = useMutation({
    mutationFn: (classroomId: string) =>
      adminApi.removeClassroomAssignment(classroomId),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher-classrooms', teacherId]);
      queryClient.invalidateQueries(['available-classrooms']);
    },
  });

  const handleAssign = () => {
    if (selectedToAssign.length > 0) {
      assignMutation.mutate(selectedToAssign);
    }
  };

  const handleRemove = (classroomId: string) => {
    removeMutation.mutate(classroomId);
  };

  if (loadingAssigned || loadingAvailable) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Gestionar Grupos">
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gestionar Grupos - ${teacherName}`}
      size="xl"
    >
      <div className="space-y-6">
        {assignMutation.isError && (
          <Alert variant="error">
            Error al asignar grupos: {assignMutation.error.message}
          </Alert>
        )}

        <TransferList
          availableItems={availableClassrooms || []}
          assignedItems={assignedClassrooms || []}
          selectedAvailable={selectedToAssign}
          onSelectAvailable={setSelectedToAssign}
          onAssign={handleAssign}
          onRemove={handleRemove}
          availableTitle="Grupos Disponibles"
          assignedTitle="Grupos Asignados"
          itemRenderer={(classroom) => (
            <div>
              <div className="font-medium">{classroom.name}</div>
              <div className="text-sm text-gray-500">
                {classroom.enrollmentCount} estudiantes
              </div>
            </div>
          )}
          searchPlaceholder="Buscar grupo..."
          emptyAvailableMessage="No hay grupos disponibles"
          emptyAssignedMessage="Este maestro no tiene grupos asignados"
        />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

**2. TransferList.tsx (Componente Reutilizable)**

```typescript
// apps/frontend/src/components/ui/TransferList.tsx

import React from 'react';
import { Search, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface TransferListProps<T> {
  availableItems: T[];
  assignedItems: T[];
  selectedAvailable: string[];
  onSelectAvailable: (ids: string[]) => void;
  onAssign: () => void;
  onRemove: (id: string) => void;
  availableTitle: string;
  assignedTitle: string;
  itemRenderer: (item: T) => React.ReactNode;
  searchPlaceholder?: string;
  emptyAvailableMessage?: string;
  emptyAssignedMessage?: string;
}

export function TransferList<T extends { id: string }>({
  availableItems,
  assignedItems,
  selectedAvailable,
  onSelectAvailable,
  onAssign,
  onRemove,
  availableTitle,
  assignedTitle,
  itemRenderer,
  searchPlaceholder = 'Buscar...',
  emptyAvailableMessage = 'No hay elementos disponibles',
  emptyAssignedMessage = 'No hay elementos asignados',
}: TransferListProps<T>) {
  const [searchAvailable, setSearchAvailable] = React.useState('');
  const [searchAssigned, setSearchAssigned] = React.useState('');

  const filteredAvailable = availableItems.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const filteredAssigned = assignedItems.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(searchAssigned.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    if (selectedAvailable.includes(id)) {
      onSelectAvailable(selectedAvailable.filter((i) => i !== id));
    } else {
      onSelectAvailable([...selectedAvailable, id]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Columna: Disponibles */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">{availableTitle}</h3>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchAvailable}
            onChange={(e) => setSearchAvailable(e.target.value)}
            className="pl-9 w-full border rounded-md p-2"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredAvailable.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              {emptyAvailableMessage}
            </p>
          ) : (
            filteredAvailable.map((item) => (
              <label
                key={item.id}
                className={`
                  flex items-start gap-3 p-3 rounded-md border cursor-pointer
                  hover:bg-gray-50 transition-colors
                  ${selectedAvailable.includes(item.id) ? 'bg-blue-50 border-blue-300' : ''}
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedAvailable.includes(item.id)}
                  onChange={() => toggleSelection(item.id)}
                  className="mt-1"
                />
                <div className="flex-1">{itemRenderer(item)}</div>
              </label>
            ))
          )}
        </div>

        <Button
          onClick={onAssign}
          disabled={selectedAvailable.length === 0}
          className="w-full mt-3"
          variant="primary"
        >
          Asignar seleccionados ({selectedAvailable.length})
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Columna: Asignados */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">{assignedTitle}</h3>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchAssigned}
            onChange={(e) => setSearchAssigned(e.target.value)}
            className="pl-9 w-full border rounded-md p-2"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredAssigned.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              {emptyAssignedMessage}
            </p>
          ) : (
            filteredAssigned.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-md border bg-green-50 border-green-200"
              >
                <div className="flex-1">{itemRenderer(item)}</div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Remover asignación"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
```

**3. TeacherListWithClassrooms.tsx**

```typescript
// apps/frontend/src/features/admin/users/components/TeacherListWithClassrooms.tsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { Table, Badge, Button } from '@/components/ui';
import { Users } from 'lucide-react';
import { TeacherClassroomsManager } from './TeacherClassroomsManager';

export const TeacherListWithClassrooms: React.FC = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers-with-classrooms'],
    queryFn: () => adminApi.getTeachers({ includeClassroomCount: true }),
  });

  return (
    <>
      <Table
        columns={[
          {
            header: 'Nombre',
            accessor: 'full_name',
          },
          {
            header: 'Email',
            accessor: 'email',
          },
          {
            header: 'Grupos Asignados',
            accessor: 'classroom_count',
            render: (teacher) => (
              <div className="flex items-center gap-2">
                {teacher.classroom_count > 0 ? (
                  <>
                    <Badge variant="success">
                      {teacher.classroom_count} {teacher.classroom_count === 1 ? 'grupo' : 'grupos'}
                    </Badge>
                    <div className="text-xs text-gray-500 max-w-xs truncate">
                      {teacher.classroom_names?.slice(0, 2).join(', ')}
                      {teacher.classroom_names?.length > 2 && '...'}
                    </div>
                  </>
                ) : (
                  <Badge variant="warning">Sin grupos</Badge>
                )}
              </div>
            ),
          },
          {
            header: 'Acciones',
            accessor: 'actions',
            render: (teacher) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTeacher({
                  id: teacher.user_id,
                  name: teacher.full_name,
                })}
              >
                <Users className="h-4 w-4 mr-2" />
                Gestionar Grupos
              </Button>
            ),
          },
        ]}
        data={teachers || []}
        isLoading={isLoading}
        emptyMessage="No hay maestros registrados"
      />

      {selectedTeacher && (
        <TeacherClassroomsManager
          teacherId={selectedTeacher.id}
          teacherName={selectedTeacher.name}
          isOpen={!!selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
        />
      )}
    </>
  );
};
```

---

### API Service

```typescript
// apps/frontend/src/services/api/admin.ts

export const adminApi = {
  // ... otros métodos

  /**
   * Obtener grupos asignados a un maestro
   */
  async getTeacherClassrooms(teacherId: string) {
    const response = await apiClient.get(
      `/admin/classroom-assignments/teachers/${teacherId}/classrooms`
    );
    return response.data;
  },

  /**
   * Obtener grupos disponibles para asignar
   */
  async getAvailableClassrooms(filters?: {
    search?: string;
    level?: string;
    activeOnly?: boolean;
  }) {
    const response = await apiClient.get('/admin/classroom-assignments/available', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Asignar grupo a maestro
   */
  async assignClassroomToTeacher(teacherId: string, classroomId: string, notes?: string) {
    const response = await apiClient.post('/admin/classroom-assignments', {
      teacherId,
      classroomId,
      notes,
    });
    return response.data;
  },

  /**
   * Asignación masiva
   */
  async bulkAssignClassrooms(teacherId: string, classroomIds: string[]) {
    const response = await apiClient.post('/admin/classroom-assignments/bulk', {
      teacherId,
      classroomIds,
    });
    return response.data;
  },

  /**
   * Remover asignación
   */
  async removeClassroomAssignment(classroomId: string, force = false) {
    const response = await apiClient.delete(
      `/admin/classroom-assignments/${classroomId}`,
      { data: { force } }
    );
    return response.data;
  },

  /**
   * Reasignar grupo
   */
  async reassignClassroom(
    classroomId: string,
    fromTeacherId: string,
    toTeacherId: string,
    reason?: string
  ) {
    const response = await apiClient.post('/admin/classroom-assignments/reassign', {
      classroomId,
      fromTeacherId,
      toTeacherId,
      reason,
    });
    return response.data;
  },

  /**
   * Historial de asignaciones
   */
  async getClassroomAssignmentHistory(classroomId: string) {
    const response = await apiClient.get(
      `/admin/classroom-assignments/history/${classroomId}`
    );
    return response.data;
  },

  /**
   * Obtener maestros con conteo de grupos
   */
  async getTeachers(options?: { includeClassroomCount?: boolean }) {
    const response = await apiClient.get('/admin/users/teachers', {
      params: options,
    });
    return response.data;
  },
};
```

---

## 🧪 Plan de Pruebas

### Pruebas Unitarias (Backend)

```typescript
// classroom-assignments.service.spec.ts

describe('ClassroomAssignmentsService', () => {
  describe('assignClassroomToTeacher', () => {
    it('should assign classroom to teacher successfully', async () => {
      // Arrange
      const dto = { teacherId: 'teacher-1', classroomId: 'classroom-1' };

      // Act
      const result = await service.assignClassroomToTeacher(dto, 'admin-1');

      // Assert
      expect(result.teacher_id).toBe('teacher-1');
      expect(auditService.log).toHaveBeenCalledWith({
        action: 'CLASSROOM_ASSIGNED',
        entity_id: 'classroom-1',
        user_id: 'admin-1',
      });
    });

    it('should throw ConflictException if classroom already has teacher', async () => {
      // Arrange
      const dto = { teacherId: 'teacher-1', classroomId: 'classroom-with-teacher' };

      // Act & Assert
      await expect(
        service.assignClassroomToTeacher(dto, 'admin-1')
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if user is not a teacher', async () => {
      // Arrange
      const dto = { teacherId: 'student-id', classroomId: 'classroom-1' };

      // Act & Assert
      await expect(
        service.assignClassroomToTeacher(dto, 'admin-1')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkAssignClassrooms', () => {
    it('should assign multiple classrooms successfully', async () => {
      // Arrange
      const dto = {
        teacherId: 'teacher-1',
        classroomIds: ['classroom-1', 'classroom-2', 'classroom-3']
      };

      // Act
      const result = await service.bulkAssignClassrooms(dto, 'admin-1');

      // Assert
      expect(result.assigned).toBe(3);
      expect(result.failed).toHaveLength(0);
      expect(result.success).toBe(true);
    });

    it('should handle partial failures gracefully', async () => {
      // Arrange: classroom-2 already has teacher
      const dto = {
        teacherId: 'teacher-1',
        classroomIds: ['classroom-1', 'classroom-with-teacher', 'classroom-3']
      };

      // Act
      const result = await service.bulkAssignClassrooms(dto, 'admin-1');

      // Assert
      expect(result.assigned).toBe(2);
      expect(result.failed).toHaveLength(1);
      expect(result.success).toBe(false);
    });
  });

  describe('removeClassroomAssignment', () => {
    it('should throw ConflictException if classroom has active students and force=false', async () => {
      // Arrange
      const classroomId = 'classroom-with-students';

      // Act & Assert
      await expect(
        service.removeClassroomAssignment(classroomId, false, 'admin-1')
      ).rejects.toThrow(ConflictException);
    });

    it('should remove assignment if force=true even with active students', async () => {
      // Arrange
      const classroomId = 'classroom-with-students';

      // Act
      await service.removeClassroomAssignment(classroomId, true, 'admin-1');

      // Assert
      const classroom = await classroomRepo.findOne({ where: { classroom_id: classroomId } });
      expect(classroom.teacher_id).toBeNull();
    });
  });
});
```

### Pruebas de Integración (E2E)

```typescript
// classroom-assignments.e2e.spec.ts

describe('Classroom Assignments (E2E)', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let teacherId: string;
  let classroomId: string;

  beforeAll(async () => {
    // Setup
    app = await createTestingApp();
    superAdminToken = await getAuthToken('super_admin');
    teacherId = await createTestTeacher();
    classroomId = await createTestClassroom();
  });

  describe('POST /admin/classroom-assignments', () => {
    it('should assign classroom to teacher', () => {
      return request(app.getHttpServer())
        .post('/admin/classroom-assignments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          teacherId,
          classroomId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.assignment.teacher_id).toBe(teacherId);
        });
    });

    it('should reject if not super_admin', async () => {
      const teacherToken = await getAuthToken('teacher');

      return request(app.getHttpServer())
        .post('/admin/classroom-assignments')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ teacherId, classroomId })
        .expect(403);
    });
  });

  describe('POST /admin/classroom-assignments/bulk', () => {
    it('should assign multiple classrooms', async () => {
      const classroomIds = await createMultipleClassrooms(3);

      return request(app.getHttpServer())
        .post('/admin/classroom-assignments/bulk')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          teacherId,
          classroomIds,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.assigned).toBe(3);
          expect(res.body.failed).toHaveLength(0);
        });
    });
  });
});
```

### Pruebas Manuales (QA)

**Checklist de pruebas:**

- [ ] Asignar grupo individual a maestro desde detalle de maestro
- [ ] Asignar múltiples grupos usando interfaz de asignación masiva
- [ ] Remover asignación de grupo sin estudiantes
- [ ] Intentar remover asignación de grupo con estudiantes (debe advertir)
- [ ] Remover asignación con force=true
- [ ] Reasignar grupo de un maestro a otro
- [ ] Validar que solo super_admin puede asignar grupos
- [ ] Validar que no se puede asignar grupo ya asignado
- [ ] Validar que no se puede asignar a usuario que no es maestro
- [ ] Buscar y filtrar grupos disponibles
- [ ] Ver historial de asignaciones de un grupo
- [ ] Ver badge de "Sin grupos" en maestros sin asignaciones
- [ ] Ver tooltip con nombres de grupos en listado de maestros

---

## 📊 Impacto

### Módulos Afectados

**Base de Datos:**
- `social_features.classrooms` (columna `teacher_id` ya existe)
- Nuevas funciones de validación
- Nuevos triggers de validación
- Actualización de RLS policies

**Backend:**
- `admin` module (nuevo controller + service)
- `audit_logging` (registros de asignaciones)

**Frontend:**
- `admin/users` feature (nuevos componentes)
- `components/ui` (TransferList reutilizable)

---

## 📏 Estimación

| Tarea | SP | Horas | Costo |
|-------|----|----|-------|
| **Backend**: Controller + Service + DTOs | 2 | 4h | $800 |
| **Backend**: Validaciones + Triggers + Tests | 1.5 | 3h | $600 |
| **Frontend**: TeacherClassroomsManager + TransferList | 2 | 4h | $800 |
| **Frontend**: TeacherListWithClassrooms | 0.5 | 1h | $200 |
| **Pruebas E2E** | 0.5 | 1h | $200 |
| **QA Manual + Ajustes** | 0.5 | 1h | $200 |

**Total:** 6 SP = 12 horas = $2,400 MXN

---

## 🔗 Referencias

- **Tabla relacionada:** `social_features.classrooms`
- **RF relacionado:** RF-SOC-001 (Classrooms)
- **ET relacionado:** ET-SOC-001 (Gestión de Aulas)
- **US relacionada:** US-PM-006 (Bloquear Alumnos), US-AE-005 (Parametrización)

---

## 🎯 Definición de Done

- [ ] Backend: Todos los endpoints implementados y probados
- [ ] Backend: Validaciones en base de datos (triggers)
- [ ] Backend: Cobertura de tests >80%
- [ ] Frontend: Interfaz de asignación masiva funcional
- [ ] Frontend: Vista de maestros con conteo de grupos
- [ ] RLS policies actualizadas
- [ ] Audit logging implementado
- [ ] Documentación API actualizada
- [ ] Pruebas E2E pasando
- [ ] QA manual aprobado
- [ ] Deploy a staging exitoso

---

**Generado:** 2025-11-08
**Autor:** System Architect
**Versión:** 1.0.0
**Estado:** 📝 Especificado - Pendiente Desarrollo
