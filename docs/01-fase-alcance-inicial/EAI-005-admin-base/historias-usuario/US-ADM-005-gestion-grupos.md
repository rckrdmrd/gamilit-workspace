---
id: "US-ADM-005"
title: "Gestión de Grupos Básica"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-005"
story_points: 7
budget: "$2,800 MXN"
sprint: "Sprint-1"
labels: ["admin", "groups", "classroom-management"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-ADM-005: Gestión de Grupos Básica

**Épica:** EAI-005 (Plataforma de Maestro Básica)
**Sprint:** Mes 1, Semana 3
**Story Points:** 7 SP
**Presupuesto:** $2,800 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como profesor, quiero crear grupos dentro de mi aula y asignar estudiantes a esos grupos para organizar mejor mi clase y facilitar actividades colaborativas.

**Contexto del Alcance Inicial:**

Esta funcionalidad permite crear grupos simples dentro de un aula y asignar estudiantes manualmente. NO incluye asignación automática de grupos, grupos dinámicos, rotación de grupos, ni analytics específicos de grupo (eso va a EXT-001 Portal de Maestros Completo).

---

## Criterios de Aceptación

### CA-01: Crear Grupo
- [ ] Formulario con campos:
  - Nombre del grupo (requerido, ej: "Equipo A", "Grupo 1")
  - Color identificador (opcional, selector de colores predefinidos)
- [ ] Validación: nombre único dentro del aula
- [ ] Confirmación al crear

### CA-02: Listar Grupos del Aula
- [ ] Vista de lista/grid con todos los grupos del aula
- [ ] Para cada grupo muestra:
  - Nombre y color
  - # de estudiantes asignados
  - Lista de estudiantes (avatares)
  - Acciones (editar, eliminar)

### CA-03: Asignar Estudiantes a Grupo
- [ ] Modal de asignación con:
  - Lista de estudiantes disponibles (no asignados o de otros grupos)
  - Checkbox para selección múltiple
  - Botón "Asignar"
- [ ] Un estudiante puede estar en múltiples grupos
- [ ] Actualización inmediata

### CA-04: Remover Estudiante de Grupo
- [ ] Botón de remover en cada estudiante del grupo
- [ ] Confirmación simple
- [ ] Solo remueve del grupo, no del aula

### CA-05: Editar/Eliminar Grupo
- [ ] Editar nombre y color del grupo
- [ ] Eliminar grupo con confirmación
- [ ] Al eliminar grupo, estudiantes se mantienen en el aula (solo se elimina el grupo)

### CA-06: Sin Límites
- [ ] Sin límite de grupos por aula en alcance inicial
- [ ] Sin límite de estudiantes por grupo

---

## Especificaciones Técnicas

### Backend

**Endpoints:**

```typescript
// Listar grupos del aula
GET /api/teacher/classrooms/{classroomId}/groups

// Crear grupo
POST /api/teacher/classrooms/{classroomId}/groups
Body: { name: string; color?: string }

// Actualizar grupo
PATCH /api/teacher/classrooms/{classroomId}/groups/{groupId}
Body: { name?: string; color?: string }

// Eliminar grupo
DELETE /api/teacher/classrooms/{classroomId}/groups/{groupId}

// Asignar estudiantes a grupo
POST /api/teacher/classrooms/{classroomId}/groups/{groupId}/students
Body: { studentIds: string[] }

// Remover estudiante de grupo
DELETE /api/teacher/classrooms/{classroomId}/groups/{groupId}/students/{studentId}
```

**Response de Listar:**
```json
{
  "classroomId": "uuid",
  "groups": [
    {
      "id": "group-uuid",
      "name": "Equipo A",
      "color": "#3b82f6",
      "studentCount": 5,
      "students": [
        {
          "id": "student-uuid",
          "name": "Juan Pérez",
          "avatarUrl": "/avatars/student.png"
        }
      ],
      "createdAt": "2025-11-01T10:00:00Z"
    }
  ],
  "total": 4
}
```

**Controller:**
```typescript
@Controller('teacher/classrooms/:classroomId/groups')
@UseGuards(AuthGuard, TeacherGuard)
export class ClassroomGroupController {
  @Get()
  async getGroups(
    @Param('classroomId') classroomId: string,
    @CurrentUser() teacher: User
  ) {
    return this.groupService.getGroups(classroomId, teacher.id);
  }

  @Post()
  async createGroup(
    @Param('classroomId') classroomId: string,
    @Body() dto: CreateGroupDto,
    @CurrentUser() teacher: User
  ) {
    return this.groupService.createGroup(classroomId, dto, teacher.id);
  }

  @Patch(':groupId')
  async updateGroup(
    @Param('classroomId') classroomId: string,
    @Param('groupId') groupId: string,
    @Body() dto: UpdateGroupDto,
    @CurrentUser() teacher: User
  ) {
    return this.groupService.updateGroup(classroomId, groupId, dto, teacher.id);
  }

  @Delete(':groupId')
  async deleteGroup(
    @Param('classroomId') classroomId: string,
    @Param('groupId') groupId: string,
    @CurrentUser() teacher: User
  ) {
    await this.groupService.deleteGroup(classroomId, groupId, teacher.id);
    return { message: 'Grupo eliminado exitosamente' };
  }

  @Post(':groupId/students')
  async assignStudents(
    @Param('classroomId') classroomId: string,
    @Param('groupId') groupId: string,
    @Body() dto: AssignStudentsDto,
    @CurrentUser() teacher: User
  ) {
    await this.groupService.assignStudents(
      classroomId,
      groupId,
      dto.studentIds,
      teacher.id
    );
    return { message: 'Estudiantes asignados al grupo' };
  }

  @Delete(':groupId/students/:studentId')
  async removeStudent(
    @Param('classroomId') classroomId: string,
    @Param('groupId') groupId: string,
    @Param('studentId') studentId: string,
    @CurrentUser() teacher: User
  ) {
    await this.groupService.removeStudentFromGroup(
      classroomId,
      groupId,
      studentId,
      teacher.id
    );
    return { message: 'Estudiante removido del grupo' };
  }
}
```

**DTOs:**
```typescript
export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color?: string;
}

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color?: string;
}

export class AssignStudentsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds: string[];
}
```

**Service:**
```typescript
async getGroups(classroomId: string, teacherId: string) {
  await this.validateTeacherAccess(classroomId, teacherId);

  const groups = await this.groupRepository.find({
    where: { classroomId },
    relations: ['students'],
    order: { createdAt: 'DESC' }
  });

  return {
    classroomId,
    groups: groups.map(g => ({
      id: g.id,
      name: g.name,
      color: g.color,
      studentCount: g.students.length,
      students: g.students.map(s => ({
        id: s.id,
        name: s.name,
        avatarUrl: s.avatarUrl
      })),
      createdAt: g.createdAt
    })),
    total: groups.length
  };
}

async createGroup(classroomId: string, dto: CreateGroupDto, teacherId: string) {
  await this.validateTeacherAccess(classroomId, teacherId);

  // Validar nombre único en el aula
  const existing = await this.groupRepository.findOne({
    where: { classroomId, name: dto.name }
  });

  if (existing) {
    throw new BadRequestException('Ya existe un grupo con este nombre en el aula');
  }

  const group = this.groupRepository.create({
    ...dto,
    classroomId,
    color: dto.color || this.getRandomColor()
  });

  return this.groupRepository.save(group);
}

async assignStudents(
  classroomId: string,
  groupId: string,
  studentIds: string[],
  teacherId: string
) {
  await this.validateTeacherAccess(classroomId, teacherId);

  const group = await this.groupRepository.findOne({
    where: { id: groupId, classroomId },
    relations: ['students']
  });

  if (!group) {
    throw new NotFoundException('Grupo no encontrado');
  }

  // Validar que los estudiantes están en el aula
  const classroomStudents = await this.classroomService.getStudents(classroomId);
  const validStudentIds = classroomStudents.map(s => s.id);

  const invalidIds = studentIds.filter(id => !validStudentIds.includes(id));
  if (invalidIds.length > 0) {
    throw new BadRequestException('Algunos estudiantes no pertenecen al aula');
  }

  // Agregar estudiantes al grupo (permite duplicados si ya están)
  const studentsToAdd = await this.studentRepository.findByIds(studentIds);

  // Evitar duplicados
  const existingIds = group.students.map(s => s.id);
  const newStudents = studentsToAdd.filter(s => !existingIds.includes(s.id));

  group.students.push(...newStudents);
  await this.groupRepository.save(group);
}

private getRandomColor(): string {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
```

**Modelo:**
```typescript
@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: '#3b82f6' })
  color: string;

  @Column({ name: 'classroom_id' })
  classroomId: string;

  @ManyToOne(() => Classroom)
  @JoinColumn({ name: 'classroom_id' })
  classroom: Classroom;

  @ManyToMany(() => Student)
  @JoinTable({ name: 'group_students' })
  students: Student[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### Frontend

**Ruta:**
```
/teacher/classroom/:classroomId/groups
```

**Vista Principal:**
```typescript
// ClassroomGroupsView.tsx
export const ClassroomGroupsView = () => {
  const { classroomId } = useParams();
  const { groups, isLoading, refetch } = useClassroomGroups(classroomId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const handleDelete = async (groupId: string, groupName: string) => {
    const confirmed = await confirm({
      title: 'Eliminar Grupo',
      message: `¿Eliminar "${groupName}"? Los estudiantes permanecerán en el aula.`,
      confirmText: 'Eliminar'
    });

    if (confirmed) {
      await deleteGroup(classroomId, groupId);
      toast.success('Grupo eliminado');
      refetch();
    }
  };

  return (
    <div className="classroom-groups-container">
      <PageHeader
        title="Grupos del Aula"
        subtitle={`${groups.length} grupo${groups.length !== 1 ? 's' : ''}`}
        action={
          <Button
            onClick={() => setShowCreateModal(true)}
            leftIcon={<PlusIcon />}
          >
            Crear Grupo
          </Button>
        }
      />

      {groups.length === 0 ? (
        <EmptyState
          icon={<GroupIcon />}
          title="No hay grupos creados"
          description="Crea grupos para organizar a tus estudiantes"
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              Crear Primer Grupo
            </Button>
          }
        />
      ) : (
        <GroupsGrid
          groups={groups}
          onEdit={setEditingGroup}
          onDelete={handleDelete}
          onAssignStudents={(groupId) => {
            // Abrir modal de asignación
          }}
        />
      )}

      {showCreateModal && (
        <CreateGroupModal
          classroomId={classroomId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={refetch}
        />
      )}

      {editingGroup && (
        <EditGroupModal
          classroomId={classroomId}
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};
```

**Card de Grupo:**
```typescript
// GroupCard.tsx
export const GroupCard = ({ group, onEdit, onDelete, onAssignStudents }) => {
  return (
    <Card className="group-card" style={{ borderLeft: `4px solid ${group.color}` }}>
      <CardHeader>
        <div className="group-header">
          <ColorBadge color={group.color} />
          <h3>{group.name}</h3>
        </div>
        <div className="group-actions">
          <IconButton icon={<EditIcon />} onClick={() => onEdit(group)} />
          <IconButton icon={<DeleteIcon />} onClick={() => onDelete(group.id, group.name)} />
        </div>
      </CardHeader>

      <CardBody>
        <div className="student-count">
          {group.studentCount} estudiante{group.studentCount !== 1 ? 's' : ''}
        </div>

        {group.students.length > 0 ? (
          <div className="student-avatars">
            {group.students.slice(0, 5).map(student => (
              <Avatar
                key={student.id}
                src={student.avatarUrl}
                alt={student.name}
                size="sm"
                tooltip={student.name}
              />
            ))}
            {group.students.length > 5 && (
              <span className="more-count">+{group.students.length - 5}</span>
            )}
          </div>
        ) : (
          <EmptyState message="Sin estudiantes" size="sm" />
        )}
      </CardBody>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAssignStudents(group.id)}
          fullWidth
        >
          Asignar Estudiantes
        </Button>
      </CardFooter>
    </Card>
  );
};
```

**Modal de Crear/Editar:**
```typescript
// GroupFormModal.tsx
export const GroupFormModal = ({ classroomId, group, onClose, onSuccess }) => {
  const isEdit = !!group;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: group || { name: '', color: '#3b82f6' }
  });

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateGroup(classroomId, group.id, data);
        toast.success('Grupo actualizado');
      } else {
        await createGroup(classroomId, data);
        toast.success('Grupo creado');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <ModalHeader>
        <h2>{isEdit ? 'Editar Grupo' : 'Crear Grupo'}</h2>
      </ModalHeader>

      <ModalBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Nombre del Grupo" required error={errors.name?.message}>
            <Input
              {...register('name', {
                required: 'El nombre es requerido',
                maxLength: { value: 50, message: 'Máximo 50 caracteres' }
              })}
              placeholder="Ej: Equipo A"
            />
          </FormField>

          <FormField label="Color">
            <ColorPicker {...register('color')} />
          </FormField>

          <FormActions>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
            </Button>
          </FormActions>
        </form>
      </ModalBody>
    </Modal>
  );
};
```

---

## Alcance Básico vs Extensiones

### EAI-005 (Este alcance - Admin Base):
- CRUD de grupos básico
- Asignación manual de estudiantes
- Estudiante puede estar en múltiples grupos
- Color identificador simple
- Sin límites

### EXT-001 (Extensión futura):
- Asignación automática de grupos (aleatoria, por nivel)
- Grupos dinámicos (basados en progreso)
- Rotación automática de grupos
- Analytics por grupo
- Asignar actividades específicas a grupos
- Grupos exclusivos (estudiante en solo un grupo)

---

## Estimación de Esfuerzo

**Backend:** 3 SP
**Frontend:** 3 SP
**Testing:** 1 SP

**Total:** 7 SP = $2,800 MXN
