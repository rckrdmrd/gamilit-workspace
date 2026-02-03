# ET-ADM-001: Implementacion de Gestion de Aulas

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ADM-001 |
| **Modulo** | Admin Base |
| **Titulo** | Implementacion de Gestion de Aulas |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-20 |
| **Ultima Actualizacion** | 2026-01-20 |
| **Autor** | Documentation Analyst |

---

## Referencias

### Requerimiento Funcional
- [RF-ADM-001: Gestion de Aulas](../requerimientos/RF-ADM-001-gestion-aulas.md)

### User Stories
- [US-ADM-001: Gestion de Aulas (CRUD Basico)](../historias-usuario/US-ADM-001-gestion-aulas-crud.md)
- [US-ADM-006: Configuracion Basica de Aula](../historias-usuario/US-ADM-006-configuracion-basica-aula.md)

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - ClassroomListView                                      |
|  - ClassroomForm                                          |
|  - ClassroomSettingsView                                  |
|  - ClassroomCard                                          |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - TeacherClassroomController                            |
|  - ClassroomSettingsController                           |
|  - ClassroomService                                      |
|  - DTOs: CreateClassroomDto, UpdateClassroomDto          |
+-----------------------------+----------------------------+
                              | SQL Queries
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - social_features.classrooms                            |
|  - social_features.classroom_settings                    |
+----------------------------------------------------------+
```

### Flujo de Creacion de Aula

```
Profesor hace clic en "Crear Aula"
        |
        v
Frontend muestra formulario
        |
        v
Profesor completa campos y envia
        |
        v
POST /api/teacher/classrooms
        |
        v
+--------------------------------+
| ClassroomService.createClassroom |
| - Validar limite de 20 aulas    |
| - Crear registro en DB          |
| - Crear settings por defecto    |
+--------------------------------+
        |
        v
Response con aula creada
        |
        v
Frontend redirige a dashboard del aula
```

---

## Implementacion de Base de Datos

### Tabla: classrooms

**Ubicacion:** `apps/database/ddl/schemas/social_features/tables/classrooms.sql`

```sql
CREATE TABLE IF NOT EXISTS social_features.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Informacion basica
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    level VARCHAR(20) NOT NULL, -- primaria, secundaria, preparatoria
    grade INTEGER NOT NULL,
    school_year VARCHAR(20) NOT NULL,

    -- Propietario
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_classrooms_teacher ON social_features.classrooms(teacher_id);
CREATE INDEX idx_classrooms_created ON social_features.classrooms(created_at DESC);

-- Constraints
ALTER TABLE social_features.classrooms
    ADD CONSTRAINT chk_level_valid CHECK (level IN ('primaria', 'secundaria', 'preparatoria')),
    ADD CONSTRAINT chk_grade_range CHECK (grade >= 1 AND grade <= 6);

-- Comentarios
COMMENT ON TABLE social_features.classrooms IS 'Aulas virtuales creadas por profesores';
COMMENT ON COLUMN social_features.classrooms.teacher_id IS 'Profesor propietario del aula';
```

### Tabla: classroom_settings

**Ubicacion:** `apps/database/ddl/schemas/social_features/tables/classroom_settings.sql`

```sql
CREATE TABLE IF NOT EXISTS social_features.classroom_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relacion
    classroom_id UUID NOT NULL UNIQUE REFERENCES social_features.classrooms(id) ON DELETE CASCADE,

    -- Configuracion de fechas
    start_date DATE,
    end_date DATE,

    -- Configuracion de visibilidad
    modules_visible BOOLEAN DEFAULT true,

    -- Configuracion de gamificacion
    gamification_enabled BOOLEAN DEFAULT true,

    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_classroom_settings_classroom ON social_features.classroom_settings(classroom_id);

-- Constraints
ALTER TABLE social_features.classroom_settings
    ADD CONSTRAINT chk_dates_valid CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date);

-- Comentarios
COMMENT ON TABLE social_features.classroom_settings IS 'Configuracion por aula (fechas, visibilidad, gamificacion)';
COMMENT ON COLUMN social_features.classroom_settings.modules_visible IS 'Si false, estudiantes no ven modulos';
COMMENT ON COLUMN social_features.classroom_settings.gamification_enabled IS 'Si false, sin XP ni logros';
```

---

## Implementacion Backend (NestJS)

### Entity: Classroom

**Ubicacion:** `apps/backend/src/teacher/entities/classroom.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, ManyToMany, JoinColumn, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Student } from '../../students/entities/student.entity';
import { Module } from '../../educational-content/entities/module.entity';
import { ClassroomSettings } from './classroom-settings.entity';

@Entity({ schema: 'social_features', name: 'classrooms' })
export class Classroom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column()
  level: string; // primaria, secundaria, preparatoria

  @Column('int')
  grade: number;

  @Column({ name: 'school_year' })
  schoolYear: string;

  @Column({ name: 'teacher_id' })
  teacherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @ManyToMany(() => Student, student => student.classrooms)
  @JoinTable({ name: 'classroom_students' })
  students: Student[];

  @ManyToMany(() => Module)
  @JoinTable({ name: 'classroom_modules' })
  modules: Module[];

  @OneToOne(() => ClassroomSettings, settings => settings.classroom, {
    cascade: true,
    eager: true
  })
  settings: ClassroomSettings;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### Entity: ClassroomSettings

**Ubicacion:** `apps/backend/src/teacher/entities/classroom-settings.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Classroom } from './classroom.entity';

@Entity({ schema: 'social_features', name: 'classroom_settings' })
export class ClassroomSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'classroom_id', unique: true })
  classroomId: string;

  @OneToOne(() => Classroom)
  @JoinColumn({ name: 'classroom_id' })
  classroom: Classroom;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: string;

  @Column({ default: true, name: 'modules_visible' })
  modulesVisible: boolean;

  @Column({ default: true, name: 'gamification_enabled' })
  gamificationEnabled: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### DTOs

**Ubicacion:** `apps/backend/src/teacher/dto/classroom.dto.ts`

```typescript
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsIn, IsInt, Min, Max, IsDateString, IsBoolean } from 'class-validator';

export class CreateClassroomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsIn(['primaria', 'secundaria', 'preparatoria'])
  level: string;

  @IsInt()
  @Min(1)
  @Max(6)
  grade: number;

  @IsString()
  @IsNotEmpty()
  schoolYear: string;
}

export class UpdateClassroomDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsIn(['primaria', 'secundaria', 'preparatoria'])
  @IsOptional()
  level?: string;

  @IsInt()
  @Min(1)
  @Max(6)
  @IsOptional()
  grade?: number;

  @IsString()
  @IsOptional()
  schoolYear?: string;
}

export class UpdateSettingsDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  modulesVisible?: boolean;

  @IsBoolean()
  @IsOptional()
  gamificationEnabled?: boolean;
}
```

### Controller

**Ubicacion:** `apps/backend/src/teacher/controllers/teacher-classroom.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { TeacherGuard } from '../../auth/guards/teacher.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { ClassroomService } from '../services/classroom.service';
import { CreateClassroomDto, UpdateClassroomDto, UpdateSettingsDto } from '../dto/classroom.dto';

@Controller('teacher/classrooms')
@UseGuards(AuthGuard, TeacherGuard)
export class TeacherClassroomController {
  constructor(private classroomService: ClassroomService) {}

  @Post()
  async create(@Body() createDto: CreateClassroomDto, @CurrentUser() teacher: User) {
    return this.classroomService.createClassroom(createDto, teacher.id);
  }

  @Get()
  async findAll(@CurrentUser() teacher: User) {
    return this.classroomService.findAllByTeacher(teacher.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() teacher: User) {
    return this.classroomService.findOneByTeacher(id, teacher.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateClassroomDto,
    @CurrentUser() teacher: User
  ) {
    return this.classroomService.updateClassroom(id, updateDto, teacher.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() teacher: User) {
    await this.classroomService.removeClassroom(id, teacher.id);
    return { message: 'Aula eliminada exitosamente' };
  }

  @Get(':id/settings')
  async getSettings(@Param('id') id: string, @CurrentUser() teacher: User) {
    return this.classroomService.getSettings(id, teacher.id);
  }

  @Patch(':id/settings')
  async updateSettings(
    @Param('id') id: string,
    @Body() dto: UpdateSettingsDto,
    @CurrentUser() teacher: User
  ) {
    return this.classroomService.updateSettings(id, dto, teacher.id);
  }
}
```

### Service

**Ubicacion:** `apps/backend/src/teacher/services/classroom.service.ts`

```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classroom } from '../entities/classroom.entity';
import { ClassroomSettings } from '../entities/classroom-settings.entity';
import { CreateClassroomDto, UpdateClassroomDto, UpdateSettingsDto } from '../dto/classroom.dto';

const MAX_CLASSROOMS_PER_TEACHER = 20;

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom)
    private classroomRepository: Repository<Classroom>,
    @InjectRepository(ClassroomSettings)
    private settingsRepository: Repository<ClassroomSettings>
  ) {}

  async createClassroom(dto: CreateClassroomDto, teacherId: string) {
    // Validar limite de aulas
    const count = await this.classroomRepository.count({
      where: { teacherId }
    });

    if (count >= MAX_CLASSROOMS_PER_TEACHER) {
      throw new BadRequestException(
        `Has alcanzado el limite de ${MAX_CLASSROOMS_PER_TEACHER} aulas. Elimina algunas para crear nuevas.`
      );
    }

    // Crear aula
    const classroom = this.classroomRepository.create({
      ...dto,
      teacherId
    });

    const savedClassroom = await this.classroomRepository.save(classroom);

    // Crear settings por defecto
    const settings = this.settingsRepository.create({
      classroomId: savedClassroom.id,
      modulesVisible: true,
      gamificationEnabled: true
    });

    await this.settingsRepository.save(settings);

    return savedClassroom;
  }

  async findAllByTeacher(teacherId: string) {
    const classrooms = await this.classroomRepository
      .createQueryBuilder('classroom')
      .leftJoin('classroom.students', 'students')
      .leftJoin('classroom.modules', 'modules')
      .select([
        'classroom.id',
        'classroom.name',
        'classroom.description',
        'classroom.level',
        'classroom.grade',
        'classroom.schoolYear',
        'classroom.createdAt'
      ])
      .addSelect('COUNT(DISTINCT students.id)', 'studentCount')
      .addSelect('COUNT(DISTINCT modules.id)', 'moduleCount')
      .where('classroom.teacherId = :teacherId', { teacherId })
      .groupBy('classroom.id')
      .orderBy('classroom.createdAt', 'DESC')
      .getRawAndEntities();

    return {
      classrooms: classrooms.entities.map((classroom, index) => ({
        ...classroom,
        studentCount: parseInt(classrooms.raw[index].studentCount),
        moduleCount: parseInt(classrooms.raw[index].moduleCount)
      })),
      total: classrooms.entities.length
    };
  }

  async findOneByTeacher(classroomId: string, teacherId: string) {
    const classroom = await this.classroomRepository.findOne({
      where: { id: classroomId, teacherId },
      relations: ['settings']
    });

    if (!classroom) {
      throw new NotFoundException('Aula no encontrada');
    }

    return classroom;
  }

  async updateClassroom(classroomId: string, dto: UpdateClassroomDto, teacherId: string) {
    const classroom = await this.findOneByTeacher(classroomId, teacherId);
    Object.assign(classroom, dto);
    return this.classroomRepository.save(classroom);
  }

  async removeClassroom(classroomId: string, teacherId: string) {
    const classroom = await this.findOneByTeacher(classroomId, teacherId);
    // Hard delete (cascada elimina relaciones)
    await this.classroomRepository.remove(classroom);
  }

  async getSettings(classroomId: string, teacherId: string) {
    await this.findOneByTeacher(classroomId, teacherId);

    const settings = await this.settingsRepository.findOne({
      where: { classroomId }
    });

    return {
      classroomId,
      settings: {
        startDate: settings?.startDate,
        endDate: settings?.endDate,
        modulesVisible: settings?.modulesVisible ?? true,
        gamificationEnabled: settings?.gamificationEnabled ?? true
      },
      updatedAt: settings?.updatedAt
    };
  }

  async updateSettings(classroomId: string, dto: UpdateSettingsDto, teacherId: string) {
    await this.findOneByTeacher(classroomId, teacherId);

    // Validar fechas
    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);

      if (end <= start) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la fecha de inicio'
        );
      }
    }

    let settings = await this.settingsRepository.findOne({
      where: { classroomId }
    });

    if (!settings) {
      settings = this.settingsRepository.create({
        classroomId,
        ...dto
      });
    } else {
      Object.assign(settings, dto);
    }

    await this.settingsRepository.save(settings);

    return {
      classroomId,
      settings: {
        startDate: settings.startDate,
        endDate: settings.endDate,
        modulesVisible: settings.modulesVisible,
        gamificationEnabled: settings.gamificationEnabled
      },
      updatedAt: settings.updatedAt
    };
  }
}
```

---

## Implementacion Frontend (React)

### Rutas

```
/teacher/classrooms          -> Lista de aulas
/teacher/classrooms/new      -> Crear aula
/teacher/classrooms/:id/edit -> Editar aula
/teacher/classroom/:id/settings -> Configuracion del aula
```

### Componentes Principales

| Componente | Ubicacion | Descripcion |
|------------|-----------|-------------|
| ClassroomListView | `apps/frontend/src/pages/teacher/classrooms/ClassroomListView.tsx` | Lista de aulas con grid de cards |
| ClassroomForm | `apps/frontend/src/pages/teacher/classrooms/ClassroomForm.tsx` | Formulario crear/editar |
| ClassroomCard | `apps/frontend/src/components/teacher/ClassroomCard.tsx` | Card individual de aula |
| ClassroomSettingsView | `apps/frontend/src/pages/teacher/classroom/ClassroomSettingsView.tsx` | Configuracion |

### API Service

**Ubicacion:** `apps/frontend/src/services/classroom.service.ts`

```typescript
import api from './api';

export const classroomService = {
  async getAll() {
    const response = await api.get('/teacher/classrooms');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/teacher/classrooms/${id}`);
    return response.data;
  },

  async create(data: CreateClassroomData) {
    const response = await api.post('/teacher/classrooms', data);
    return response.data;
  },

  async update(id: string, data: UpdateClassroomData) {
    const response = await api.patch(`/teacher/classrooms/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/teacher/classrooms/${id}`);
    return response.data;
  },

  async getSettings(classroomId: string) {
    const response = await api.get(`/teacher/classrooms/${classroomId}/settings`);
    return response.data;
  },

  async updateSettings(classroomId: string, data: UpdateSettingsData) {
    const response = await api.patch(`/teacher/classrooms/${classroomId}/settings`, data);
    return response.data;
  }
};
```

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/teacher/classrooms` | Crear aula |
| GET | `/api/teacher/classrooms` | Listar aulas del profesor |
| GET | `/api/teacher/classrooms/:id` | Obtener aula especifica |
| PATCH | `/api/teacher/classrooms/:id` | Actualizar aula |
| DELETE | `/api/teacher/classrooms/:id` | Eliminar aula |
| GET | `/api/teacher/classrooms/:id/settings` | Obtener configuracion |
| PATCH | `/api/teacher/classrooms/:id/settings` | Actualizar configuracion |

---

## Testing

### Test Case 1: Validar limite de aulas

```typescript
test('should reject creation when limit reached', async () => {
  const teacher = await createTeacher();

  // Crear 20 aulas
  for (let i = 0; i < 20; i++) {
    await classroomService.createClassroom(
      { name: `Aula ${i}`, level: 'primaria', grade: 1, schoolYear: '2024-2025' },
      teacher.id
    );
  }

  // Intentar crear la #21
  await expect(
    classroomService.createClassroom(
      { name: 'Aula 21', level: 'primaria', grade: 1, schoolYear: '2024-2025' },
      teacher.id
    )
  ).rejects.toThrow(BadRequestException);
});
```

### Test Case 2: Validar fechas de settings

```typescript
test('should reject invalid date range', async () => {
  const classroom = await createClassroom();

  await expect(
    classroomService.updateSettings(
      classroom.id,
      { startDate: '2025-12-01', endDate: '2025-01-01' }, // fin < inicio
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

**Documento:** `docs/01-fase-alcance-inicial/EAI-005-admin-base/especificaciones/ET-ADM-001-gestion-aulas.md`
