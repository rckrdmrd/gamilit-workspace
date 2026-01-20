# ET-ADM-002: Implementacion de Gestion de Estudiantes

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ADM-002 |
| **Modulo** | Admin Base |
| **Titulo** | Implementacion de Gestion de Estudiantes |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-20 |
| **Ultima Actualizacion** | 2026-01-20 |
| **Autor** | Documentation Analyst |

---

## Referencias

### Requerimiento Funcional
- [RF-ADM-002: Gestion de Estudiantes](../requerimientos/RF-ADM-002-gestion-estudiantes.md)

### User Stories
- [US-ADM-002: Gestion de Estudiantes en Aula](../historias-usuario/US-ADM-002-gestion-estudiantes-aula.md)
- [US-ADM-005: Gestion de Grupos Basica](../historias-usuario/US-ADM-005-gestion-grupos.md)

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - ClassroomStudentsView                                  |
|  - AddStudentModal                                        |
|  - ClassroomGroupsView                                    |
|  - GroupCard, GroupFormModal                              |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - TeacherClassroomController                            |
|  - TeacherStudentController                              |
|  - ClassroomGroupController                              |
|  - ClassroomService, StudentService, GroupService        |
+-----------------------------+----------------------------+
                              | SQL Queries
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - social_features.classroom_students (M:N)              |
|  - social_features.groups                                |
|  - social_features.group_students (M:N)                  |
+----------------------------------------------------------+
```

---

## Implementacion de Base de Datos

### Tabla: classroom_students (Relacion M:N)

**Ubicacion:** `apps/database/ddl/schemas/social_features/tables/classroom_students.sql`

```sql
CREATE TABLE IF NOT EXISTS social_features.classroom_students (
    classroom_id UUID NOT NULL REFERENCES social_features.classrooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (classroom_id, student_id)
);

-- Indices
CREATE INDEX idx_classroom_students_classroom ON social_features.classroom_students(classroom_id);
CREATE INDEX idx_classroom_students_student ON social_features.classroom_students(student_id);

-- Comentarios
COMMENT ON TABLE social_features.classroom_students IS 'Relacion M:N entre aulas y estudiantes';
```

### Tabla: groups

**Ubicacion:** `apps/database/ddl/schemas/social_features/tables/groups.sql`

```sql
CREATE TABLE IF NOT EXISTS social_features.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Informacion basica
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#3b82f6', -- Hex color

    -- Relacion con aula
    classroom_id UUID NOT NULL REFERENCES social_features.classrooms(id) ON DELETE CASCADE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint: nombre unico por aula
    UNIQUE(classroom_id, name)
);

-- Indices
CREATE INDEX idx_groups_classroom ON social_features.groups(classroom_id);

-- Comentarios
COMMENT ON TABLE social_features.groups IS 'Grupos de estudiantes dentro de un aula';
COMMENT ON COLUMN social_features.groups.color IS 'Color identificador en formato hex (#RRGGBB)';
```

### Tabla: group_students (Relacion M:N)

**Ubicacion:** `apps/database/ddl/schemas/social_features/tables/group_students.sql`

```sql
CREATE TABLE IF NOT EXISTS social_features.group_students (
    group_id UUID NOT NULL REFERENCES social_features.groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, student_id)
);

-- Indices
CREATE INDEX idx_group_students_group ON social_features.group_students(group_id);
CREATE INDEX idx_group_students_student ON social_features.group_students(student_id);

-- Comentarios
COMMENT ON TABLE social_features.group_students IS 'Relacion M:N entre grupos y estudiantes (un estudiante puede estar en multiples grupos)';
```

---

## Implementacion Backend (NestJS)

### Entity: Group

**Ubicacion:** `apps/backend/src/teacher/entities/group.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Classroom } from './classroom.entity';
import { Student } from '../../students/entities/student.entity';

@Entity({ schema: 'social_features', name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
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

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### DTOs

**Ubicacion:** `apps/backend/src/teacher/dto/student.dto.ts`

```typescript
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail, IsUUID, IsArray } from 'class-validator';

export class AddStudentDto {
  @IsUUID()
  studentId: string;
}

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
```

**Ubicacion:** `apps/backend/src/teacher/dto/group.dto.ts`

```typescript
import { IsString, IsNotEmpty, MaxLength, IsOptional, Matches, IsArray, IsUUID } from 'class-validator';

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

### Controller: Estudiantes

**Ubicacion:** `apps/backend/src/teacher/controllers/teacher-classroom.controller.ts` (extendido)

```typescript
// Dentro de TeacherClassroomController

@Get(':classroomId/students')
async getStudents(
  @Param('classroomId') classroomId: string,
  @Query('search') search: string,
  @CurrentUser() teacher: User
) {
  return this.classroomService.getClassroomStudents(classroomId, teacher.id, search);
}

@Post(':classroomId/students')
async addStudent(
  @Param('classroomId') classroomId: string,
  @Body() dto: AddStudentDto,
  @CurrentUser() teacher: User
) {
  await this.classroomService.addStudentToClassroom(classroomId, dto.studentId, teacher.id);
  return { message: 'Estudiante agregado exitosamente' };
}

@Post(':classroomId/students/create')
async createAndAddStudent(
  @Param('classroomId') classroomId: string,
  @Body() dto: CreateStudentDto,
  @CurrentUser() teacher: User
) {
  return this.classroomService.createAndAddStudent(classroomId, dto, teacher.id);
}

@Delete(':classroomId/students/:studentId')
async removeStudent(
  @Param('classroomId') classroomId: string,
  @Param('studentId') studentId: string,
  @CurrentUser() teacher: User
) {
  await this.classroomService.removeStudentFromClassroom(classroomId, studentId, teacher.id);
  return { message: 'Estudiante removido del aula exitosamente' };
}
```

### Controller: Grupos

**Ubicacion:** `apps/backend/src/teacher/controllers/classroom-group.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { TeacherGuard } from '../../auth/guards/teacher.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { GroupService } from '../services/group.service';
import { CreateGroupDto, UpdateGroupDto, AssignStudentsDto } from '../dto/group.dto';

@Controller('teacher/classrooms/:classroomId/groups')
@UseGuards(AuthGuard, TeacherGuard)
export class ClassroomGroupController {
  constructor(private groupService: GroupService) {}

  @Get()
  async getGroups(@Param('classroomId') classroomId: string, @CurrentUser() teacher: User) {
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
    await this.groupService.assignStudents(classroomId, groupId, dto.studentIds, teacher.id);
    return { message: 'Estudiantes asignados al grupo' };
  }

  @Delete(':groupId/students/:studentId')
  async removeStudent(
    @Param('classroomId') classroomId: string,
    @Param('groupId') groupId: string,
    @Param('studentId') studentId: string,
    @CurrentUser() teacher: User
  ) {
    await this.groupService.removeStudentFromGroup(classroomId, groupId, studentId, teacher.id);
    return { message: 'Estudiante removido del grupo' };
  }
}
```

### Service: Estudiantes (parcial)

**Ubicacion:** `apps/backend/src/teacher/services/classroom.service.ts` (extendido)

```typescript
const MAX_STUDENTS_PER_CLASSROOM = 100;

async createAndAddStudent(classroomId: string, dto: CreateStudentDto, teacherId: string) {
  await this.validateTeacherAccess(classroomId, teacherId);

  // Generar username y password
  const username = this.generateUsername(dto.name);
  const temporaryPassword = this.generateTemporaryPassword(dto.name);

  // Validar que el email no existe (si se proporciona)
  if (dto.email) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email }
    });
    if (existingUser) {
      throw new BadRequestException('Ya existe un usuario con este email');
    }
  }

  // Crear usuario estudiante
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
  const user = this.userRepository.create({
    name: dto.name,
    email: dto.email,
    username,
    password: hashedPassword,
    role: 'student'
  });

  const savedUser = await this.userRepository.save(user);

  // Agregar al aula
  await this.addStudentToClassroom(classroomId, savedUser.id, teacherId);

  return {
    student: {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      username
    },
    credentials: {
      username,
      temporaryPassword
    },
    message: 'Estudiante creado y agregado al aula exitosamente'
  };
}

private generateUsername(name: string): string {
  // Convertir "Juan Perez Garcia" -> "juan.perez"
  const parts = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(' ');
  return `${parts[0]}.${parts[1] || parts[0]}`;
}

private generateTemporaryPassword(name: string): string {
  // Generar password: Temp123!PrimerNombre
  const firstName = name.split(' ')[0];
  return `Temp123!${firstName}`;
}
```

### Service: Grupos

**Ubicacion:** `apps/backend/src/teacher/services/group.service.ts`

```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { CreateGroupDto, UpdateGroupDto } from '../dto/group.dto';

const PREDEFINED_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    private classroomService: ClassroomService
  ) {}

  async getGroups(classroomId: string, teacherId: string) {
    await this.classroomService.validateTeacherAccess(classroomId, teacherId);

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
    await this.classroomService.validateTeacherAccess(classroomId, teacherId);

    // Validar nombre unico en el aula
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
    await this.classroomService.validateTeacherAccess(classroomId, teacherId);

    const group = await this.groupRepository.findOne({
      where: { id: groupId, classroomId },
      relations: ['students']
    });

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    // Validar que los estudiantes estan en el aula
    const classroomStudents = await this.classroomService.getStudents(classroomId);
    const validStudentIds = classroomStudents.map(s => s.id);

    const invalidIds = studentIds.filter(id => !validStudentIds.includes(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException('Algunos estudiantes no pertenecen al aula');
    }

    // Agregar estudiantes (evitar duplicados)
    const existingIds = group.students.map(s => s.id);
    const newStudentIds = studentIds.filter(id => !existingIds.includes(id));

    const studentsToAdd = await this.studentRepository.findByIds(newStudentIds);
    group.students.push(...studentsToAdd);
    await this.groupRepository.save(group);
  }

  private getRandomColor(): string {
    return PREDEFINED_COLORS[Math.floor(Math.random() * PREDEFINED_COLORS.length)];
  }
}
```

---

## Implementacion Frontend (React)

### Rutas

```
/teacher/classroom/:classroomId/students -> Lista de estudiantes
/teacher/classroom/:classroomId/groups   -> Lista de grupos
```

### Componentes Principales

| Componente | Ubicacion | Descripcion |
|------------|-----------|-------------|
| ClassroomStudentsView | `apps/frontend/src/pages/teacher/classroom/ClassroomStudentsView.tsx` | Lista y gestion de estudiantes |
| AddStudentModal | `apps/frontend/src/components/teacher/AddStudentModal.tsx` | Modal buscar/crear estudiante |
| SearchStudentForm | `apps/frontend/src/components/teacher/SearchStudentForm.tsx` | Busqueda de estudiantes |
| CreateStudentForm | `apps/frontend/src/components/teacher/CreateStudentForm.tsx` | Creacion de estudiante |
| CredentialsDisplay | `apps/frontend/src/components/teacher/CredentialsDisplay.tsx` | Muestra credenciales generadas |
| ClassroomGroupsView | `apps/frontend/src/pages/teacher/classroom/ClassroomGroupsView.tsx` | Lista y gestion de grupos |
| GroupCard | `apps/frontend/src/components/teacher/GroupCard.tsx` | Card de grupo |
| GroupFormModal | `apps/frontend/src/components/teacher/GroupFormModal.tsx` | Crear/editar grupo |
| AssignStudentsModal | `apps/frontend/src/components/teacher/AssignStudentsModal.tsx` | Asignar estudiantes a grupo |

---

## API REST Endpoints

### Estudiantes

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/teacher/classrooms/:id/students` | Listar estudiantes del aula |
| POST | `/api/teacher/classrooms/:id/students` | Agregar estudiante existente |
| POST | `/api/teacher/classrooms/:id/students/create` | Crear y agregar estudiante |
| DELETE | `/api/teacher/classrooms/:id/students/:studentId` | Remover estudiante |
| GET | `/api/teacher/students/search` | Buscar estudiantes disponibles |

### Grupos

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/teacher/classrooms/:id/groups` | Listar grupos del aula |
| POST | `/api/teacher/classrooms/:id/groups` | Crear grupo |
| PATCH | `/api/teacher/classrooms/:id/groups/:groupId` | Actualizar grupo |
| DELETE | `/api/teacher/classrooms/:id/groups/:groupId` | Eliminar grupo |
| POST | `/api/teacher/classrooms/:id/groups/:groupId/students` | Asignar estudiantes |
| DELETE | `/api/teacher/classrooms/:id/groups/:groupId/students/:studentId` | Remover estudiante de grupo |

---

## Testing

### Test Case 1: Limite de estudiantes por aula

```typescript
test('should reject adding student when limit reached', async () => {
  const classroom = await createClassroom();

  // Agregar 100 estudiantes
  for (let i = 0; i < 100; i++) {
    await classroomService.addStudentToClassroom(
      classroom.id,
      (await createStudent()).id,
      classroom.teacherId
    );
  }

  // Intentar agregar el #101
  const newStudent = await createStudent();
  await expect(
    classroomService.addStudentToClassroom(
      classroom.id,
      newStudent.id,
      classroom.teacherId
    )
  ).rejects.toThrow(BadRequestException);
});
```

### Test Case 2: Nombre de grupo unico por aula

```typescript
test('should reject duplicate group name in same classroom', async () => {
  const classroom = await createClassroom();

  // Crear primer grupo
  await groupService.createGroup(
    classroom.id,
    { name: 'Equipo A' },
    classroom.teacherId
  );

  // Intentar crear duplicado
  await expect(
    groupService.createGroup(
      classroom.id,
      { name: 'Equipo A' },
      classroom.teacherId
    )
  ).rejects.toThrow(BadRequestException);
});
```

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Analyst | Creacion inicial |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-005-admin-base/especificaciones/ET-ADM-002-gestion-estudiantes.md`
