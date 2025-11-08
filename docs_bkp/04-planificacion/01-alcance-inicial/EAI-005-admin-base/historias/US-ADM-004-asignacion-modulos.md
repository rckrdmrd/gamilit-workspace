# US-ADM-004: Asignación Básica de Módulos

**Épica:** EAI-005 (Plataforma de Maestro Básica)
**Sprint:** Mes 1, Semana 2-3
**Story Points:** 10 SP
**Presupuesto:** $4,000 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como profesor, quiero asignar módulos educativos a mi aula desde un catálogo pre-cargado para que mis estudiantes puedan acceder al contenido educativo.

**Contexto del Alcance Inicial:**

Esta funcionalidad permite asignar módulos educativos existentes (contenido hardcodeado) a un aula. NO incluye creación de módulos custom, edición de contenido, clonación de módulos, ni organización en secuencias personalizadas (eso va a EXT-001 Portal de Maestros Completo).

---

## Criterios de Aceptación

### CA-01: Catálogo de Módulos Disponibles
- [ ] Vista de catálogo con todos los módulos disponibles en la plataforma
- [ ] Para cada módulo muestra:
  - Nombre del módulo
  - Descripción breve
  - Materia (Matemáticas, Español, Ciencias, etc.)
  - Nivel recomendado
  - # de actividades incluidas
  - Indicador si ya está asignado al aula
- [ ] Filtros básicos por materia y nivel

### CA-02: Asignar Módulo al Aula
- [ ] Botón "Asignar" en cada módulo no asignado
- [ ] Confirmación al asignar
- [ ] El módulo queda disponible para todos los estudiantes del aula
- [ ] Actualización inmediata de la vista

### CA-03: Ver Módulos Asignados
- [ ] Vista de módulos ya asignados al aula
- [ ] Para cada módulo asignado muestra:
  - Información del módulo
  - Fecha de asignación
  - # de estudiantes que lo han iniciado
  - # de estudiantes que lo han completado
  - Botón "Remover"

### CA-04: Remover Módulo del Aula
- [ ] Botón "Remover" en cada módulo asignado
- [ ] Modal de confirmación con advertencia
- [ ] Advertencia: "El progreso de los estudiantes en este módulo se conservará pero el módulo dejará de estar visible"
- [ ] Al confirmar, se remueve la asignación
- [ ] Progreso de estudiantes se mantiene (no se elimina)

### CA-05: Validaciones
- [ ] No asignar módulo duplicado
- [ ] Sin límite de módulos por aula en alcance inicial
- [ ] Módulos son contenido read-only (no se pueden editar)

---

## Especificaciones Técnicas

### Backend

**Endpoints:**

```typescript
// Listar catálogo de módulos disponibles
GET /api/teacher/modules/catalog
Query params: ?subject=matematicas&level=primaria

// Listar módulos asignados al aula
GET /api/teacher/classrooms/{classroomId}/modules

// Asignar módulo al aula
POST /api/teacher/classrooms/{classroomId}/modules
Body: { moduleId: string }

// Remover módulo del aula
DELETE /api/teacher/classrooms/{classroomId}/modules/{moduleId}

// Estadísticas de módulo en aula
GET /api/teacher/classrooms/{classroomId}/modules/{moduleId}/stats
```

**Response de Catálogo:**
```json
{
  "modules": [
    {
      "id": "module-uuid",
      "name": "Fracciones Básicas",
      "description": "Introducción a fracciones, suma y resta",
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

**Response de Módulos Asignados:**
```json
{
  "classroomId": "uuid",
  "modules": [
    {
      "id": "module-uuid",
      "name": "Fracciones Básicas",
      "description": "Introducción a fracciones",
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

**Controller:**
```typescript
@Controller('teacher')
export class TeacherModuleController {
  @Get('modules/catalog')
  async getCatalog(
    @Query('subject') subject?: string,
    @Query('level') level?: string
  ) {
    return this.moduleService.getCatalog({ subject, level });
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
    await this.classroomService.assignModule(
      classroomId,
      dto.moduleId,
      teacher.id
    );
    return { message: 'Módulo asignado exitosamente' };
  }

  @Delete('classrooms/:classroomId/modules/:moduleId')
  async removeModule(
    @Param('classroomId') classroomId: string,
    @Param('moduleId') moduleId: string,
    @CurrentUser() teacher: User
  ) {
    await this.classroomService.removeModule(
      classroomId,
      moduleId,
      teacher.id
    );
    return { message: 'Módulo removido del aula' };
  }
}
```

**Service:**
```typescript
// module.service.ts
async getCatalog(filters: { subject?: string; level?: string }) {
  let query = this.moduleRepository.createQueryBuilder('module');

  if (filters.subject) {
    query = query.where('module.subject = :subject', { subject: filters.subject });
  }

  if (filters.level) {
    query = query.andWhere('module.level = :level', { level: filters.level });
  }

  const modules = await query.getMany();

  return {
    modules: modules.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      subject: m.subject,
      level: m.level,
      recommendedGrades: m.recommendedGrades,
      activityCount: m.activities?.length || 0,
      estimatedDuration: m.estimatedDuration
    })),
    total: modules.length
  };
}

// classroom.service.ts
async getAssignedModules(classroomId: string, teacherId: string) {
  await this.validateTeacherAccess(classroomId, teacherId);

  const classroom = await this.classroomRepository.findOne({
    where: { id: classroomId },
    relations: ['modules', 'students']
  });

  const modulesWithStats = await Promise.all(
    classroom.modules.map(async (module) => {
      const stats = await this.getModuleStats(classroomId, module.id);
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

  // Validar que el módulo existe
  const module = await this.moduleRepository.findOne({
    where: { id: moduleId }
  });

  if (!module) {
    throw new NotFoundException('Módulo no encontrado');
  }

  // Validar que no está ya asignado
  const alreadyAssigned = classroom.modules.some(m => m.id === moduleId);
  if (alreadyAssigned) {
    throw new BadRequestException('El módulo ya está asignado a esta aula');
  }

  // Asignar módulo
  classroom.modules.push(module);
  await this.classroomRepository.save(classroom);
}

async removeModule(classroomId: string, moduleId: string, teacherId: string) {
  await this.validateTeacherAccess(classroomId, teacherId);

  const classroom = await this.classroomRepository.findOne({
    where: { id: classroomId },
    relations: ['modules']
  });

  // Remover relación (el progreso de estudiantes se mantiene)
  classroom.modules = classroom.modules.filter(m => m.id !== moduleId);
  await this.classroomRepository.save(classroom);
}

async getModuleStats(classroomId: string, moduleId: string) {
  const students = await this.getStudentsInClassroom(classroomId);

  const stats = {
    studentsStarted: 0,
    studentsCompleted: 0,
    totalStudents: students.length,
    averageProgress: 0
  };

  let totalProgress = 0;

  for (const student of students) {
    const progress = await this.getStudentModuleProgress(student.id, moduleId);

    if (progress > 0) {
      stats.studentsStarted++;
    }

    if (progress === 100) {
      stats.studentsCompleted++;
    }

    totalProgress += progress;
  }

  stats.averageProgress = students.length > 0 ? totalProgress / students.length : 0;

  return stats;
}
```

**Modelo de Module (hardcodeado):**
```typescript
@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  subject: string; // matematicas, español, ciencias, etc.

  @Column()
  level: string; // primaria, secundaria, preparatoria

  @Column('simple-array')
  recommendedGrades: number[];

  @Column({ name: 'estimated_duration' })
  estimatedDuration: string; // "4 horas"

  @OneToMany(() => Activity, activity => activity.module)
  activities: Activity[];

  @ManyToMany(() => Classroom, classroom => classroom.modules)
  classrooms: Classroom[];
}
```

### Frontend

**Rutas:**
```
/teacher/classroom/:classroomId/modules          -> Módulos asignados
/teacher/classroom/:classroomId/modules/catalog  -> Catálogo
```

**Vista de Módulos Asignados:**
```typescript
// AssignedModulesView.tsx
export const AssignedModulesView = () => {
  const { classroomId } = useParams();
  const { modules, isLoading, refetch } = useAssignedModules(classroomId);
  const navigate = useNavigate();

  const handleRemove = async (moduleId: string, moduleName: string) => {
    const confirmed = await confirm({
      title: 'Remover Módulo',
      message: `¿Remover "${moduleName}" del aula? El progreso de los estudiantes se conservará.`,
      confirmText: 'Remover',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      await removeModuleFromClassroom(classroomId, moduleId);
      toast.success('Módulo removido del aula');
      refetch();
    }
  };

  return (
    <div className="assigned-modules-container">
      <PageHeader
        title="Módulos del Aula"
        subtitle={`${modules.length} módulo${modules.length !== 1 ? 's' : ''} asignado${modules.length !== 1 ? 's' : ''}`}
        action={
          <Button
            onClick={() => navigate(`/teacher/classroom/${classroomId}/modules/catalog`)}
            leftIcon={<PlusIcon />}
          >
            Asignar Módulo
          </Button>
        }
      />

      {modules.length === 0 ? (
        <EmptyState
          icon={<ModuleIcon />}
          title="No hay módulos asignados"
          description="Asigna módulos del catálogo para que tus estudiantes puedan acceder al contenido"
          action={
            <Button onClick={() => navigate(`/teacher/classroom/${classroomId}/modules/catalog`)}>
              Ver Catálogo
            </Button>
          }
        />
      ) : (
        <ModulesGrid
          modules={modules}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
};
```

**Vista de Catálogo:**
```typescript
// ModuleCatalogView.tsx
export const ModuleCatalogView = () => {
  const { classroomId } = useParams();
  const [filters, setFilters] = useState({ subject: '', level: '' });
  const { modules, isLoading } = useModuleCatalog(filters);

  const handleAssign = async (moduleId: string, moduleName: string) => {
    try {
      await assignModuleToClassroom(classroomId, moduleId);
      toast.success(`"${moduleName}" asignado al aula`);
      // Refetch para actualizar estado
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="module-catalog-container">
      <PageHeader
        title="Catálogo de Módulos"
        breadcrumb={[
          { label: 'Módulos del Aula', to: `/teacher/classroom/${classroomId}/modules` },
          { label: 'Catálogo' }
        ]}
      />

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
      />

      <ModuleCatalogGrid
        modules={modules}
        onAssign={handleAssign}
      />
    </div>
  );
};
```

**Card de Módulo:**
```typescript
// ModuleCard.tsx
export const ModuleCard = ({ module, assigned, onAssign, onRemove }) => {
  return (
    <Card className="module-card">
      <CardHeader>
        <h3>{module.name}</h3>
        <Badge color={getSubjectColor(module.subject)}>
          {getSubjectLabel(module.subject)}
        </Badge>
      </CardHeader>
      <CardBody>
        <p className="description">{module.description}</p>
        <div className="module-meta">
          <MetaItem icon={<LevelIcon />} label={getLevelLabel(module.level)} />
          <MetaItem icon={<ActivityIcon />} label={`${module.activityCount} actividades`} />
          <MetaItem icon={<ClockIcon />} label={module.estimatedDuration} />
        </div>

        {assigned && module.stats && (
          <div className="module-stats">
            <Stat
              label="Iniciaron"
              value={`${module.stats.studentsStarted}/${module.stats.totalStudents}`}
            />
            <Stat
              label="Completaron"
              value={`${module.stats.studentsCompleted}/${module.stats.totalStudents}`}
            />
            <ProgressBar percentage={module.stats.averageProgress} />
          </div>
        )}
      </CardBody>
      <CardFooter>
        {assigned ? (
          <Button
            variant="outline"
            color="red"
            onClick={() => onRemove(module.id, module.name)}
            fullWidth
          >
            Remover
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => onAssign(module.id, module.name)}
            fullWidth
          >
            Asignar al Aula
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
```

---

## Alcance Básico vs Extensiones

### EAI-005 (Este alcance - Admin Base):
- ✅ Asignar módulos pre-cargados desde catálogo
- ✅ Remover módulos del aula
- ✅ Ver módulos asignados con stats básicas
- ✅ Filtros simples (materia, nivel)
- ✅ Contenido hardcodeado (no editable)

### EXT-001 (Extensión futura - Portal Maestros Completo):
- ⏳ Crear módulos custom
- ⏳ Editar contenido de módulos
- ⏳ Clonar/duplicar módulos
- ⏳ Organizar módulos en secuencias/unidades
- ⏳ Configurar orden de módulos
- ⏳ Programar fechas de disponibilidad
- ⏳ Módulos adaptativos (dificultad dinámica)

---

## Dependencias

### Dependencias de User Stories:
- US-ADM-001 (aulas)
- EAI-002 (módulos y actividades deben existir como contenido)

---

## Estimación de Esfuerzo

**Backend:** 4 SP
**Frontend:** 5 SP
**Testing:** 1 SP

**Total:** 10 SP = $4,000 MXN
