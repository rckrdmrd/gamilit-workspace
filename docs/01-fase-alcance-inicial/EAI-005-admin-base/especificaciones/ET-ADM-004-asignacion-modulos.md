# ET-ADM-004: Implementacion de Asignacion de Modulos

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ADM-004 |
| **Modulo** | Admin Base |
| **Titulo** | Implementacion de Asignacion de Modulos |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-20 |
| **Ultima Actualizacion** | 2026-01-20 |
| **Autor** | Documentation Analyst |

---

## Referencias

### Requerimiento Funcional
- [RF-ADM-004: Asignacion de Modulos](../requerimientos/RF-ADM-004-asignacion-modulos.md)

### User Stories
- [US-ADM-004: Asignacion Basica de Modulos](../historias-usuario/US-ADM-004-asignacion-modulos.md)

### Dependencias
- EAI-002: Modulos y actividades deben existir como contenido

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - AssignedModulesView                                    |
|  - ModuleCatalogView                                      |
|  - ModuleCard                                             |
|  - FilterBar                                              |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - TeacherModuleController                               |
|  - ModuleService                                         |
|  - ClassroomService (asignacion)                         |
+-----------------------------+----------------------------+
                              | SQL Queries
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - educational_content.modules                           |
|  - educational_content.activities                        |
|  - social_features.classroom_modules (M:N)               |
|  - progress_tracking.student_progress                    |
+----------------------------------------------------------+
```

### Flujo de Asignacion de Modulo

```
Profesor navega a catalogo
        |
        v
GET /api/teacher/modules/catalog?subject=matematicas&level=primaria
        |
        v
+--------------------------------+
| ModuleService.getCatalog()     |
| - Filtrar por subject, level   |
| - Marcar si ya asignado        |
+--------------------------------+
        |
        v
Frontend muestra catalogo con filtros
        |
        v
Profesor hace clic en "Asignar"
        |
        v
POST /api/teacher/classrooms/:id/modules
Body: { moduleId: "uuid" }
        |
        v
+----------------------------------------+
| ClassroomService.assignModule()        |
| - Validar acceso del profesor          |
| - Validar que modulo existe            |
| - Validar que no esta ya asignado      |
| - Crear relacion en classroom_modules  |
+----------------------------------------+
        |
        v
Response: { message: "Modulo asignado exitosamente" }
        |
        v
Frontend actualiza vista
```

---

## Implementacion de Base de Datos

### Tabla: modules (contenido pre-cargado)

**Ubicacion:** `apps/database/ddl/schemas/educational_content/tables/modules.sql`

```sql
CREATE TABLE IF NOT EXISTS educational_content.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Informacion basica
    name VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL, -- primaria, secundaria, preparatoria
    recommended_grades INTEGER[] DEFAULT '{}',
    estimated_duration VARCHAR(50),

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_modules_subject ON educational_content.modules(subject);
CREATE INDEX idx_modules_level ON educational_content.modules(level);
CREATE INDEX idx_modules_active ON educational_content.modules(is_active) WHERE is_active = true;

-- Constraints
ALTER TABLE educational_content.modules
    ADD CONSTRAINT chk_module_level_valid CHECK (level IN ('primaria', 'secundaria', 'preparatoria'));

-- Comentarios
COMMENT ON TABLE educational_content.modules IS 'Modulos educativos pre-cargados (contenido hardcodeado)';
COMMENT ON COLUMN educational_content.modules.recommended_grades IS 'Array de grados recomendados, ej: {4, 5, 6}';
```

### Tabla: classroom_modules (Relacion M:N)

**Ubicacion:** `apps/database/ddl/schemas/social_features/tables/classroom_modules.sql`

```sql
CREATE TABLE IF NOT EXISTS social_features.classroom_modules (
    classroom_id UUID NOT NULL REFERENCES social_features.classrooms(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES educational_content.modules(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (classroom_id, module_id)
);

-- Indices
CREATE INDEX idx_classroom_modules_classroom ON social_features.classroom_modules(classroom_id);
CREATE INDEX idx_classroom_modules_module ON social_features.classroom_modules(module_id);
CREATE INDEX idx_classroom_modules_assigned ON social_features.classroom_modules(assigned_at DESC);

-- Comentarios
COMMENT ON TABLE social_features.classroom_modules IS 'Relacion M:N entre aulas y modulos asignados';
COMMENT ON COLUMN social_features.classroom_modules.assigned_by IS 'Profesor que asigno el modulo';
```

---

## Implementacion Backend (NestJS)

### Entity: Module

**Ubicacion:** `apps/backend/src/educational-content/entities/module.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Activity } from './activity.entity';
import { Classroom } from '../../teacher/entities/classroom.entity';

@Entity({ schema: 'educational_content', name: 'modules' })
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ length: 50 })
  subject: string;

  @Column({ length: 20 })
  level: string;

  @Column('int', { array: true, default: '{}', name: 'recommended_grades' })
  recommendedGrades: number[];

  @Column({ name: 'estimated_duration', nullable: true })
  estimatedDuration: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => Activity, activity => activity.module)
  activities: Activity[];

  @ManyToMany(() => Classroom, classroom => classroom.modules)
  classrooms: Classroom[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### DTO: AssignModuleDto

**Ubicacion:** `apps/backend/src/teacher/dto/module.dto.ts`

```typescript
import { IsUUID } from 'class-validator';

export class AssignModuleDto {
  @IsUUID()
  moduleId: string;
}

export class ModuleCatalogQueryDto {
  subject?: string;
  level?: string;
}
```

### Controller

**Ubicacion:** `apps/backend/src/teacher/controllers/teacher-module.controller.ts`

```typescript
import { Controller, Get, Post, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { TeacherGuard } from '../../auth/guards/teacher.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { ModuleService } from '../services/module.service';
import { ClassroomService } from '../services/classroom.service';
import { AssignModuleDto, ModuleCatalogQueryDto } from '../dto/module.dto';

@Controller('teacher')
@UseGuards(AuthGuard, TeacherGuard)
export class TeacherModuleController {
  constructor(
    private moduleService: ModuleService,
    private classroomService: ClassroomService
  ) {}

  @Get('modules/catalog')
  async getCatalog(@Query() query: ModuleCatalogQueryDto) {
    return this.moduleService.getCatalog(query);
  }

  @Get('classrooms/:classroomId/modules')
  async getAssignedModules(
    @Param('classroomId') classroomId: string,
    @CurrentUser() teacher: User
  ) {
    return this.classroomService.getAssignedModules(classroomId, teacher.id);
  }

  @Post('classrooms/:classroomId/modules')
  async assignModule(
    @Param('classroomId') classroomId: string,
    @Body() dto: AssignModuleDto,
    @CurrentUser() teacher: User
  ) {
    await this.classroomService.assignModule(classroomId, dto.moduleId, teacher.id);
    return { message: 'Modulo asignado exitosamente' };
  }

  @Delete('classrooms/:classroomId/modules/:moduleId')
  async removeModule(
    @Param('classroomId') classroomId: string,
    @Param('moduleId') moduleId: string,
    @CurrentUser() teacher: User
  ) {
    await this.classroomService.removeModule(classroomId, moduleId, teacher.id);
    return { message: 'Modulo removido del aula' };
  }

  @Get('classrooms/:classroomId/modules/:moduleId/stats')
  async getModuleStats(
    @Param('classroomId') classroomId: string,
    @Param('moduleId') moduleId: string,
    @CurrentUser() teacher: User
  ) {
    return this.classroomService.getModuleStats(classroomId, moduleId, teacher.id);
  }
}
```

### Service: ModuleService

**Ubicacion:** `apps/backend/src/teacher/services/module.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from '../../educational-content/entities/module.entity';
import { ModuleCatalogQueryDto } from '../dto/module.dto';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>
  ) {}

  async getCatalog(filters: ModuleCatalogQueryDto) {
    let query = this.moduleRepository
      .createQueryBuilder('module')
      .leftJoin('module.activities', 'activities')
      .select([
        'module.id',
        'module.name',
        'module.description',
        'module.subject',
        'module.level',
        'module.recommendedGrades',
        'module.estimatedDuration'
      ])
      .addSelect('COUNT(activities.id)', 'activityCount')
      .where('module.isActive = :isActive', { isActive: true })
      .groupBy('module.id');

    if (filters.subject) {
      query = query.andWhere('module.subject = :subject', { subject: filters.subject });
    }

    if (filters.level) {
      query = query.andWhere('module.level = :level', { level: filters.level });
    }

    const rawModules = await query.getRawAndEntities();

    return {
      modules: rawModules.entities.map((module, index) => ({
        id: module.id,
        name: module.name,
        description: module.description,
        subject: module.subject,
        level: module.level,
        recommendedGrades: module.recommendedGrades,
        estimatedDuration: module.estimatedDuration,
        activityCount: parseInt(rawModules.raw[index].activityCount) || 0
      })),
      total: rawModules.entities.length
    };
  }

  async getCatalogForClassroom(filters: ModuleCatalogQueryDto, classroomId: string) {
    const catalog = await this.getCatalog(filters);

    // Obtener IDs de modulos ya asignados
    const assignedModuleIds = await this.getAssignedModuleIds(classroomId);

    return {
      modules: catalog.modules.map(module => ({
        ...module,
        isAssignedToClassroom: assignedModuleIds.includes(module.id)
      })),
      total: catalog.total
    };
  }

  private async getAssignedModuleIds(classroomId: string): Promise<string[]> {
    const result = await this.moduleRepository
      .createQueryBuilder('module')
      .innerJoin('module.classrooms', 'classroom')
      .where('classroom.id = :classroomId', { classroomId })
      .select('module.id')
      .getMany();

    return result.map(m => m.id);
  }
}
```

### Service: ClassroomService (metodos de modulos)

**Ubicacion:** `apps/backend/src/teacher/services/classroom.service.ts` (extendido)

```typescript
// Agregar a ClassroomService existente

async getAssignedModules(classroomId: string, teacherId: string) {
  await this.validateTeacherAccess(classroomId, teacherId);

  const classroom = await this.classroomRepository.findOne({
    where: { id: classroomId },
    relations: ['modules', 'modules.activities', 'students']
  });

  const modulesWithStats = await Promise.all(
    classroom.modules.map(async (module) => {
      const stats = await this.getModuleStats(classroomId, module.id, teacherId);
      return {
        id: module.id,
        name: module.name,
        description: module.description,
        activityCount: module.activities?.length || 0,
        assignedAt: module.createdAt, // Idealmente desde tabla pivot
        stats
      };
    })
  );

  return {
    classroomId,
    modules: modulesWithStats,
    total: modulesWithStats.length
  };
}

async assignModule(classroomId: string, moduleId: string, teacherId: string) {
  await this.validateTeacherAccess(classroomId, teacherId);

  const classroom = await this.classroomRepository.findOne({
    where: { id: classroomId },
    relations: ['modules']
  });

  // Validar que el modulo existe
  const module = await this.moduleRepository.findOne({
    where: { id: moduleId, isActive: true }
  });

  if (!module) {
    throw new NotFoundException('Modulo no encontrado o no esta disponible');
  }

  // Validar que no esta ya asignado
  const alreadyAssigned = classroom.modules.some(m => m.id === moduleId);
  if (alreadyAssigned) {
    throw new BadRequestException('El modulo ya esta asignado a esta aula');
  }

  // Asignar modulo
  classroom.modules.push(module);
  await this.classroomRepository.save(classroom);
}

async removeModule(classroomId: string, moduleId: string, teacherId: string) {
  await this.validateTeacherAccess(classroomId, teacherId);

  const classroom = await this.classroomRepository.findOne({
    where: { id: classroomId },
    relations: ['modules']
  });

  // Remover relacion (el progreso de estudiantes se mantiene)
  classroom.modules = classroom.modules.filter(m => m.id !== moduleId);
  await this.classroomRepository.save(classroom);
}

async getModuleStats(classroomId: string, moduleId: string, teacherId: string) {
  await this.validateTeacherAccess(classroomId, teacherId);

  const totalStudents = await this.getStudentCount(classroomId);

  // Estudiantes que han iniciado el modulo
  const studentsStarted = await this.progressRepository
    .createQueryBuilder('progress')
    .innerJoin('social_features.classroom_students', 'cs', 'cs.student_id = progress.studentId')
    .where('cs.classroom_id = :classroomId', { classroomId })
    .andWhere('progress.moduleId = :moduleId', { moduleId })
    .andWhere('progress.percentage > 0')
    .select('COUNT(DISTINCT progress.studentId)', 'count')
    .getRawOne();

  // Estudiantes que han completado el modulo
  const studentsCompleted = await this.progressRepository
    .createQueryBuilder('progress')
    .innerJoin('social_features.classroom_students', 'cs', 'cs.student_id = progress.studentId')
    .where('cs.classroom_id = :classroomId', { classroomId })
    .andWhere('progress.moduleId = :moduleId', { moduleId })
    .andWhere('progress.percentage = 100')
    .select('COUNT(DISTINCT progress.studentId)', 'count')
    .getRawOne();

  // Progreso promedio
  const avgProgress = await this.progressRepository
    .createQueryBuilder('progress')
    .innerJoin('social_features.classroom_students', 'cs', 'cs.student_id = progress.studentId')
    .where('cs.classroom_id = :classroomId', { classroomId })
    .andWhere('progress.moduleId = :moduleId', { moduleId })
    .select('AVG(progress.percentage)', 'avg')
    .getRawOne();

  return {
    studentsStarted: parseInt(studentsStarted?.count) || 0,
    studentsCompleted: parseInt(studentsCompleted?.count) || 0,
    totalStudents,
    averageProgress: parseFloat(avgProgress?.avg) || 0
  };
}
```

---

## Implementacion Frontend (React)

### Rutas

```
/teacher/classroom/:classroomId/modules          -> Modulos asignados
/teacher/classroom/:classroomId/modules/catalog  -> Catalogo
```

### Componentes Principales

| Componente | Ubicacion | Descripcion |
|------------|-----------|-------------|
| AssignedModulesView | `apps/frontend/src/pages/teacher/classroom/AssignedModulesView.tsx` | Lista de modulos asignados |
| ModuleCatalogView | `apps/frontend/src/pages/teacher/classroom/ModuleCatalogView.tsx` | Catalogo con filtros |
| ModuleCard | `apps/frontend/src/components/teacher/ModuleCard.tsx` | Card de modulo |
| ModulesGrid | `apps/frontend/src/components/teacher/ModulesGrid.tsx` | Grid de modulos |
| FilterBar | `apps/frontend/src/components/teacher/FilterBar.tsx` | Filtros de catalogo |

### Hook: useModuleCatalog

**Ubicacion:** `apps/frontend/src/hooks/teacher/useModuleCatalog.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '../../services/teacher.service';

interface CatalogFilters {
  subject?: string;
  level?: string;
}

export const useModuleCatalog = (filters: CatalogFilters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher', 'modules', 'catalog', filters],
    queryFn: () => teacherApi.getModuleCatalog(filters),
    staleTime: 300000 // 5 minutos
  });

  return {
    modules: data?.modules || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch
  };
};
```

### Hook: useAssignedModules

**Ubicacion:** `apps/frontend/src/hooks/teacher/useAssignedModules.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '../../services/teacher.service';

export const useAssignedModules = (classroomId: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher', 'classroom', classroomId, 'modules'],
    queryFn: () => teacherApi.getAssignedModules(classroomId),
    staleTime: 60000
  });

  const assignMutation = useMutation({
    mutationFn: (moduleId: string) =>
      teacherApi.assignModule(classroomId, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teacher', 'classroom', classroomId, 'modules']
      });
    }
  });

  const removeMutation = useMutation({
    mutationFn: (moduleId: string) =>
      teacherApi.removeModule(classroomId, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teacher', 'classroom', classroomId, 'modules']
      });
    }
  });

  return {
    modules: data?.modules || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
    assignModule: assignMutation.mutate,
    isAssigning: assignMutation.isPending,
    removeModule: removeMutation.mutate,
    isRemoving: removeMutation.isPending
  };
};
```

### API Service

**Ubicacion:** `apps/frontend/src/services/teacher.service.ts` (extendido)

```typescript
export const teacherApi = {
  // ... otros metodos

  async getModuleCatalog(filters?: { subject?: string; level?: string }) {
    const params = new URLSearchParams();
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.level) params.append('level', filters.level);

    const response = await api.get(`/teacher/modules/catalog?${params}`);
    return response.data;
  },

  async getAssignedModules(classroomId: string) {
    const response = await api.get(`/teacher/classrooms/${classroomId}/modules`);
    return response.data;
  },

  async assignModule(classroomId: string, moduleId: string) {
    const response = await api.post(`/teacher/classrooms/${classroomId}/modules`, {
      moduleId
    });
    return response.data;
  },

  async removeModule(classroomId: string, moduleId: string) {
    const response = await api.delete(
      `/teacher/classrooms/${classroomId}/modules/${moduleId}`
    );
    return response.data;
  },

  async getModuleStats(classroomId: string, moduleId: string) {
    const response = await api.get(
      `/teacher/classrooms/${classroomId}/modules/${moduleId}/stats`
    );
    return response.data;
  }
};
```

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/teacher/modules/catalog` | Catalogo de modulos disponibles |
| GET | `/api/teacher/classrooms/:id/modules` | Modulos asignados al aula |
| POST | `/api/teacher/classrooms/:id/modules` | Asignar modulo al aula |
| DELETE | `/api/teacher/classrooms/:id/modules/:moduleId` | Remover modulo del aula |
| GET | `/api/teacher/classrooms/:id/modules/:moduleId/stats` | Stats del modulo en aula |

### Response: Catalogo

```json
{
  "modules": [
    {
      "id": "module-uuid",
      "name": "Fracciones Basicas",
      "description": "Introduccion a fracciones, suma y resta",
      "subject": "matematicas",
      "level": "primaria",
      "recommendedGrades": [4, 5, 6],
      "activityCount": 20,
      "estimatedDuration": "4 horas",
      "isAssignedToClassroom": false
    }
  ],
  "total": 15
}
```

### Response: Modulos Asignados

```json
{
  "classroomId": "uuid",
  "modules": [
    {
      "id": "module-uuid",
      "name": "Fracciones Basicas",
      "description": "Introduccion a fracciones",
      "activityCount": 20,
      "assignedAt": "2025-10-01T10:00:00Z",
      "stats": {
        "studentsStarted": 18,
        "studentsCompleted": 12,
        "totalStudents": 25,
        "averageProgress": 72.5
      }
    }
  ],
  "total": 5
}
```

---

## Consideraciones

### Contenido Read-Only

En el alcance inicial (EAI-005), los modulos son contenido hardcodeado:
- Profesor NO puede crear modulos custom
- Profesor NO puede editar contenido de modulos
- Profesor solo puede asignar/remover modulos existentes

### Progreso al Remover Modulo

Cuando se remueve un modulo del aula:
- El progreso de estudiantes se **CONSERVA** en la base de datos
- El modulo deja de estar **VISIBLE** para estudiantes
- Si se re-asigna, el progreso previo estara disponible

### Sin Limite de Modulos

En el alcance inicial, no hay limite de modulos por aula.

---

## Testing

### Test Case 1: No permitir asignar modulo duplicado

```typescript
test('should reject assigning duplicate module', async () => {
  const classroom = await createClassroom();
  const module = await createModule();

  // Primera asignacion - exito
  await classroomService.assignModule(
    classroom.id,
    module.id,
    classroom.teacherId
  );

  // Segunda asignacion - error
  await expect(
    classroomService.assignModule(
      classroom.id,
      module.id,
      classroom.teacherId
    )
  ).rejects.toThrow(BadRequestException);
});
```

### Test Case 2: Stats se calculan correctamente

```typescript
test('should calculate module stats correctly', async () => {
  const classroom = await createClassroomWithStudents(25);
  const module = await createModule();

  await classroomService.assignModule(classroom.id, module.id, classroom.teacherId);

  // Simular progreso: 18 iniciaron, 12 completaron
  await createProgress(classroom.id, module.id, { started: 18, completed: 12 });

  const stats = await classroomService.getModuleStats(
    classroom.id,
    module.id,
    classroom.teacherId
  );

  expect(stats.studentsStarted).toBe(18);
  expect(stats.studentsCompleted).toBe(12);
  expect(stats.totalStudents).toBe(25);
});
```

### Test Case 3: Progreso se conserva al remover modulo

```typescript
test('should preserve progress when removing module', async () => {
  const classroom = await createClassroom();
  const module = await createModule();
  const student = await createStudent();

  await classroomService.assignModule(classroom.id, module.id, classroom.teacherId);
  await classroomService.addStudentToClassroom(classroom.id, student.id, classroom.teacherId);

  // Crear progreso
  await createStudentProgress(student.id, module.id, 75);

  // Remover modulo
  await classroomService.removeModule(classroom.id, module.id, classroom.teacherId);

  // Verificar que progreso existe
  const progress = await progressRepository.findOne({
    where: { studentId: student.id, moduleId: module.id }
  });

  expect(progress).not.toBeNull();
  expect(progress.percentage).toBe(75);
});
```

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Analyst | Creacion inicial |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-005-admin-base/especificaciones/ET-ADM-004-asignacion-modulos.md`
