---
id: "US-ADM-001"
title: "Gestion de Aulas (CRUD Basico)"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-005"
story_points: 8
budget: "$3,200 MXN"
sprint: "Sprint-1"
labels: ["admin", "classrooms", "crud", "teacher-platform"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
completed_date: "2025-08-10"
---

# US-ADM-001: Gestión de Aulas (CRUD Básico)

**Épica:** EAI-005 (Plataforma de Maestro Básica)
**Sprint:** Mes 1, Semana 2
**Story Points:** 8 SP
**Presupuesto:** $3,200 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como profesor, quiero crear y gestionar mis aulas virtuales para organizar a mis estudiantes en diferentes grupos o clases.

**Contexto del Alcance Inicial:**

Esta funcionalidad proporciona el CRUD básico para que un profesor pueda crear, editar, listar y eliminar aulas. Es la funcionalidad base de la Plataforma de Maestro. NO incluye soft delete, archivado de aulas, templates de aula, ni clonación (eso va a EXT-001 Portal de Maestros Completo).

---

## Criterios de Aceptación

### CA-01: Crear Aula
- [ ] Formulario de creación con campos:
  - Nombre del aula (requerido, máx 100 caracteres)
  - Descripción (opcional, máx 500 caracteres)
  - Nivel educativo (selector: Primaria, Secundaria, Preparatoria)
  - Grado (selector según nivel: 1-6, 1-3, 1-3)
  - Ciclo escolar (texto, ej: "2024-2025")
- [ ] Validación de campos requeridos
- [ ] El aula se crea asociada al profesor autenticado
- [ ] Mensaje de confirmación al crear exitosamente
- [ ] Redirección a la lista de aulas o al dashboard del aula creada

### CA-02: Listar Mis Aulas
- [ ] Vista de grid/cards con todas las aulas del profesor
- [ ] Para cada aula muestra:
  - Nombre del aula
  - Nivel y grado
  - # de estudiantes
  - Fecha de creación
  - Acciones (editar, eliminar, ver)
- [ ] Ordenadas por fecha de creación (más recientes primero)
- [ ] Mensaje amigable si no hay aulas creadas

### CA-03: Editar Aula
- [ ] Formulario pre-poblado con datos actuales del aula
- [ ] Campos editables: todos excepto profesor propietario
- [ ] Validación de campos
- [ ] Confirmación de cambios guardados
- [ ] Actualización en tiempo real en la lista

### CA-04: Eliminar Aula
- [ ] Modal de confirmación antes de eliminar
- [ ] Advertencia si el aula tiene estudiantes
- [ ] Eliminación permanente (hard delete en alcance inicial)
- [ ] Eliminación en cascada: se remueven relaciones con estudiantes
- [ ] No se eliminan los estudiantes (solo la relación)
- [ ] Mensaje de confirmación al eliminar
- [ ] Actualización de la lista

### CA-05: Ver Dashboard del Aula
- [ ] Botón "Ver" en cada aula que lleva al dashboard (US-ANA-001)
- [ ] Breadcrumb indicando el aula actual
- [ ] Navegación entre aulas desde el header

### CA-06: Validaciones de Negocio
- [ ] Un profesor puede crear hasta 20 aulas (límite hardcodeado)
- [ ] Nombres de aula pueden repetirse (entre aulas del mismo profesor)
- [ ] Al eliminar aula con estudiantes, mostrar advertencia pero permitir

---

## Especificaciones Técnicas

### Backend

**Endpoints:**

```typescript
// Crear aula
POST /api/teacher/classrooms
Body: {
  name: string;
  description?: string;
  level: 'primaria' | 'secundaria' | 'preparatoria';
  grade: number;
  schoolYear: string;
}

// Listar mis aulas
GET /api/teacher/classrooms

// Obtener aula específica
GET /api/teacher/classrooms/{classroomId}

// Actualizar aula
PATCH /api/teacher/classrooms/{classroomId}
Body: {
  name?: string;
  description?: string;
  level?: string;
  grade?: number;
  schoolYear?: string;
}

// Eliminar aula
DELETE /api/teacher/classrooms/{classroomId}
```

**Response de Crear/Actualizar:**
```json
{
  "id": "classroom-uuid",
  "name": "Matemáticas 6A",
  "description": "Clase de matemáticas para sexto grado grupo A",
  "level": "primaria",
  "grade": 6,
  "schoolYear": "2024-2025",
  "teacherId": "teacher-uuid",
  "studentCount": 0,
  "createdAt": "2025-11-02T10:00:00Z",
  "updatedAt": "2025-11-02T10:00:00Z"
}
```

**Response de Listar:**
```json
{
  "classrooms": [
    {
      "id": "classroom-uuid",
      "name": "Matemáticas 6A",
      "description": "Clase de matemáticas para sexto grado grupo A",
      "level": "primaria",
      "grade": 6,
      "schoolYear": "2024-2025",
      "studentCount": 25,
      "moduleCount": 5,
      "createdAt": "2025-11-02T10:00:00Z"
    }
  ],
  "total": 1
}
```

**Controller:**
```typescript
// TeacherClassroomController.ts
@Controller('teacher/classrooms')
@UseGuards(AuthGuard, TeacherGuard)
export class TeacherClassroomController {
  constructor(private classroomService: ClassroomService) {}

  @Post()
  async create(
    @Body() createDto: CreateClassroomDto,
    @CurrentUser() teacher: User
  ) {
    return this.classroomService.createClassroom(createDto, teacher.id);
  }

  @Get()
  async findAll(@CurrentUser() teacher: User) {
    return this.classroomService.findAllByTeacher(teacher.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() teacher: User
  ) {
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
  async remove(
    @Param('id') id: string,
    @CurrentUser() teacher: User
  ) {
    await this.classroomService.removeClassroom(id, teacher.id);
    return { message: 'Aula eliminada exitosamente' };
  }
}
```

**DTOs:**
```typescript
// create-classroom.dto.ts
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

// update-classroom.dto.ts
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
```

**Service:**
```typescript
// classroom.service.ts
@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom)
    private classroomRepository: Repository<Classroom>
  ) {}

  async createClassroom(dto: CreateClassroomDto, teacherId: string) {
    // Validar límite de aulas
    const count = await this.classroomRepository.count({
      where: { teacherId }
    });

    if (count >= 20) {
      throw new BadRequestException(
        'Has alcanzado el límite de 20 aulas. Elimina algunas para crear nuevas.'
      );
    }

    const classroom = this.classroomRepository.create({
      ...dto,
      teacherId
    });

    return this.classroomRepository.save(classroom);
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
      where: { id: classroomId, teacherId }
    });

    if (!classroom) {
      throw new NotFoundException('Aula no encontrada');
    }

    return classroom;
  }

  async updateClassroom(
    classroomId: string,
    dto: UpdateClassroomDto,
    teacherId: string
  ) {
    const classroom = await this.findOneByTeacher(classroomId, teacherId);

    Object.assign(classroom, dto);

    return this.classroomRepository.save(classroom);
  }

  async removeClassroom(classroomId: string, teacherId: string) {
    const classroom = await this.findOneByTeacher(classroomId, teacherId);

    // Hard delete (soft delete va a EXT-001)
    await this.classroomRepository.remove(classroom);
  }
}
```

**Modelo:**
```typescript
// classroom.entity.ts
@Entity('classrooms')
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### Frontend

**Rutas:**
```
/teacher/classrooms          -> Lista de aulas
/teacher/classrooms/new      -> Crear aula
/teacher/classrooms/:id/edit -> Editar aula
```

**Componente de Lista:**
```typescript
// ClassroomListView.tsx
export const ClassroomListView = () => {
  const { classrooms, isLoading, refetch } = useClassrooms();
  const navigate = useNavigate();

  const handleDelete = async (classroomId: string) => {
    const confirmed = await confirm({
      title: 'Eliminar Aula',
      message: '¿Estás seguro de que deseas eliminar esta aula? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      await deleteClassroom(classroomId);
      toast.success('Aula eliminada exitosamente');
      refetch();
    }
  };

  if (isLoading) return <ClassroomListSkeleton />;

  return (
    <div className="classroom-list-container">
      <PageHeader
        title="Mis Aulas"
        action={
          <Button
            onClick={() => navigate('/teacher/classrooms/new')}
            leftIcon={<PlusIcon />}
          >
            Crear Aula
          </Button>
        }
      />

      {classrooms.length === 0 ? (
        <EmptyState
          icon={<ClassroomIcon />}
          title="No tienes aulas creadas"
          description="Crea tu primera aula para comenzar a organizar a tus estudiantes"
          action={
            <Button onClick={() => navigate('/teacher/classrooms/new')}>
              Crear Aula
            </Button>
          }
        />
      ) : (
        <div className="classroom-grid">
          {classrooms.map(classroom => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              onEdit={() => navigate(`/teacher/classrooms/${classroom.id}/edit`)}
              onDelete={() => handleDelete(classroom.id)}
              onView={() => navigate(`/teacher/classroom/${classroom.id}/dashboard`)}
            />
          ))}
        </div>
      )}

      {classrooms.length >= 20 && (
        <Alert severity="warning">
          Has alcanzado el límite de 20 aulas. Elimina algunas para crear nuevas.
        </Alert>
      )}
    </div>
  );
};
```

**Componente de Card:**
```typescript
// ClassroomCard.tsx
export const ClassroomCard = ({ classroom, onEdit, onDelete, onView }) => {
  return (
    <Card className="classroom-card">
      <CardHeader>
        <h3>{classroom.name}</h3>
        <Badge>{getLevelLabel(classroom.level)} - {classroom.grade}°</Badge>
      </CardHeader>

      <CardBody>
        {classroom.description && (
          <p className="description">{classroom.description}</p>
        )}

        <div className="stats">
          <Stat
            icon={<UsersIcon />}
            label="Estudiantes"
            value={classroom.studentCount}
          />
          <Stat
            icon={<ModulesIcon />}
            label="Módulos"
            value={classroom.moduleCount}
          />
        </div>

        <div className="meta">
          <span className="school-year">{classroom.schoolYear}</span>
          <span className="created-at">
            Creada: {formatDate(classroom.createdAt)}
          </span>
        </div>
      </CardBody>

      <CardFooter>
        <ButtonGroup>
          <Button variant="primary" onClick={onView}>
            Ver
          </Button>
          <Button variant="outline" onClick={onEdit}>
            Editar
          </Button>
          <Button variant="ghost" color="red" onClick={onDelete}>
            Eliminar
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
};
```

**Formulario de Crear/Editar:**
```typescript
// ClassroomForm.tsx
export const ClassroomForm = ({ classroomId }: { classroomId?: string }) => {
  const navigate = useNavigate();
  const isEdit = !!classroomId;

  const { classroom, isLoading: loadingClassroom } = useClassroom(classroomId);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ClassroomFormData>({
    defaultValues: classroom || {}
  });

  const selectedLevel = watch('level');

  const onSubmit = async (data: ClassroomFormData) => {
    try {
      if (isEdit) {
        await updateClassroom(classroomId, data);
        toast.success('Aula actualizada exitosamente');
      } else {
        const newClassroom = await createClassroom(data);
        toast.success('Aula creada exitosamente');
        navigate(`/teacher/classroom/${newClassroom.id}/dashboard`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loadingClassroom) return <FormSkeleton />;

  return (
    <div className="classroom-form-container">
      <PageHeader
        title={isEdit ? 'Editar Aula' : 'Crear Aula'}
        breadcrumb={[
          { label: 'Mis Aulas', to: '/teacher/classrooms' },
          { label: isEdit ? 'Editar' : 'Crear' }
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Información General">
          <FormField
            label="Nombre del Aula"
            required
            error={errors.name?.message}
          >
            <Input
              {...register('name', {
                required: 'El nombre es requerido',
                maxLength: {
                  value: 100,
                  message: 'Máximo 100 caracteres'
                }
              })}
              placeholder="Ej: Matemáticas 6A"
            />
          </FormField>

          <FormField
            label="Descripción"
            error={errors.description?.message}
          >
            <Textarea
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: 'Máximo 500 caracteres'
                }
              })}
              placeholder="Descripción opcional del aula"
              rows={3}
            />
          </FormField>
        </FormSection>

        <FormSection title="Nivel Educativo">
          <div className="form-row">
            <FormField
              label="Nivel"
              required
              error={errors.level?.message}
            >
              <Select
                {...register('level', {
                  required: 'El nivel es requerido'
                })}
                options={[
                  { value: 'primaria', label: 'Primaria' },
                  { value: 'secundaria', label: 'Secundaria' },
                  { value: 'preparatoria', label: 'Preparatoria' }
                ]}
              />
            </FormField>

            <FormField
              label="Grado"
              required
              error={errors.grade?.message}
            >
              <Select
                {...register('grade', {
                  required: 'El grado es requerido',
                  valueAsNumber: true
                })}
                options={getGradeOptions(selectedLevel)}
              />
            </FormField>
          </div>

          <FormField
            label="Ciclo Escolar"
            required
            error={errors.schoolYear?.message}
          >
            <Input
              {...register('schoolYear', {
                required: 'El ciclo escolar es requerido'
              })}
              placeholder="Ej: 2024-2025"
            />
          </FormField>
        </FormSection>

        <FormActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/teacher/classrooms')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Aula')}
          </Button>
        </FormActions>
      </form>
    </div>
  );
};

function getGradeOptions(level: string) {
  const maxGrades = {
    primaria: 6,
    secundaria: 3,
    preparatoria: 3
  };

  const max = maxGrades[level] || 6;

  return Array.from({ length: max }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}°`
  }));
}
```

---

## Diseño UI/UX

### Lista de Aulas
```
+-------------------------------------------------------------------+
|  Mis Aulas                                    [+ Crear Aula]     |
+-------------------------------------------------------------------+
|  +------------------+  +------------------+  +------------------+ |
|  | Matemáticas 6A   |  | Español 5B       |  | Ciencias 6A      | |
|  | Primaria - 6°    |  | Primaria - 5°    |  | Primaria - 6°    | |
|  |                  |  |                  |  |                  | |
|  | 👥 25 estudiantes|  | 👥 30 estudiantes|  | 👥 28 estudiantes| |
|  | 📚 5 módulos     |  | 📚 4 módulos     |  | 📚 6 módulos     | |
|  |                  |  |                  |  |                  | |
|  | 2024-2025        |  | 2024-2025        |  | 2024-2025        | |
|  | Creada: 1 Oct    |  | Creada: 1 Oct    |  | Creada: 1 Oct    | |
|  |                  |  |                  |  |                  | |
|  | [Ver][Editar][×] |  | [Ver][Editar][×] |  | [Ver][Editar][×] | |
|  +------------------+  +------------------+  +------------------+ |
+-------------------------------------------------------------------+
```

---

## Alcance Básico vs Extensiones

### EAI-005 (Este alcance - Admin Base):
- ✅ CRUD básico completo (crear, listar, editar, eliminar)
- ✅ Campos básicos de aula
- ✅ Hard delete (eliminación permanente)
- ✅ Límite de 20 aulas por profesor
- ✅ Validaciones básicas

### EXT-001 (Extensión futura - Portal Maestros Completo):
- ⏳ Soft delete y archivado de aulas
- ⏳ Templates de aula (crear desde plantilla)
- ⏳ Clonación de aulas (duplicar configuración)
- ⏳ Campos adicionales (horario, aula física, color)
- ⏳ Co-profesores (múltiples profesores por aula)
- ⏳ Importación masiva desde CSV
- ⏳ Estadísticas avanzadas por aula

---

## Dependencias

### Dependencias Técnicas:
- **Backend:** Sistema de autenticación de profesores
- **Backend:** Guard de TeacherGuard
- **Frontend:** React Hook Form
- **Frontend:** Modal/Dialog component

### Dependencias de User Stories:
- Ninguna (base de la plataforma de maestro)

---

## Pruebas

### Pruebas Unitarias:
- [ ] Validación de límite de 20 aulas
- [ ] Validación de campos requeridos
- [ ] Cálculo de studentCount y moduleCount

### Pruebas de Integración:
- [ ] Crear aula asocia correctamente al profesor
- [ ] Listar solo retorna aulas del profesor autenticado
- [ ] Editar solo permite al profesor propietario
- [ ] Eliminar solo permite al profesor propietario
- [ ] Eliminar aula remueve relaciones en cascada

### Pruebas E2E:
- [ ] Profesor puede crear aula completa
- [ ] Profesor ve solo sus aulas
- [ ] Profesor puede editar su aula
- [ ] Profesor puede eliminar su aula
- [ ] Validación de límite funciona

---

## Notas de Implementación

1. **Seguridad:**
   - Validar en backend que el profesor solo accede a sus aulas
   - Guard de TeacherGuard en todos los endpoints

2. **Escalabilidad:**
   - Límite de 20 aulas puede incrementarse en EXT-001
   - Considerar índice en `(teacherId, createdAt)` para queries rápidos

3. **UX:**
   - Mensajes claros de confirmación
   - Skeleton loaders durante carga
   - Empty state motivador para crear primera aula

---

## Estimación de Esfuerzo

**Backend:** 3 SP
- CRUD endpoints
- Validaciones
- Service con lógica de negocio

**Frontend:** 4 SP
- Lista de aulas
- Formulario crear/editar
- Modal de confirmación

**Testing:** 1 SP

**Total:** 8 SP = $3,200 MXN
