# US-ADM-002: Gestión de Estudiantes en Aula

**Épica:** EAI-005 (Plataforma de Maestro Básica)
**Sprint:** Mes 1, Semana 2
**Story Points:** 10 SP
**Presupuesto:** $4,000 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como profesor, quiero agregar y remover estudiantes de mi aula para controlar quién tiene acceso a los contenidos y actividades de la clase.

**Contexto del Alcance Inicial:**

Esta funcionalidad permite la gestión manual de estudiantes en un aula: ver lista, agregar uno por uno, y remover. NO incluye importación masiva desde CSV, invitaciones por email, auto-registro con código de clase, ni transferencia entre aulas (eso va a EXT-001 Portal de Maestros Completo).

---

## Criterios de Aceptación

### CA-01: Ver Lista de Estudiantes del Aula
- [ ] Vista de tabla/lista con todos los estudiantes del aula
- [ ] Para cada estudiante muestra:
  - Avatar/foto
  - Nombre completo
  - Email (si disponible)
  - Fecha de ingreso al aula
  - Estado (activo)
  - Acción de remover
- [ ] Contador total de estudiantes
- [ ] Búsqueda simple por nombre

### CA-02: Agregar Estudiante al Aula
- [ ] Botón "Agregar Estudiante"
- [ ] Modal/formulario con dos opciones:
  - **Opción A:** Buscar estudiante existente en la plataforma (por email o nombre)
  - **Opción B:** Crear nuevo estudiante y agregarlo al aula
- [ ] Formulario de nuevo estudiante:
  - Nombre completo (requerido)
  - Email (opcional)
  - Crear cuenta automáticamente con credenciales temporales
- [ ] Validación: no agregar estudiante duplicado
- [ ] Confirmación al agregar exitosamente

### CA-03: Remover Estudiante del Aula
- [ ] Botón/ícono de remover en cada fila
- [ ] Modal de confirmación
- [ ] Advertencia: "Esto removerá al estudiante del aula pero no eliminará su cuenta"
- [ ] Al confirmar, se remueve la relación aula-estudiante
- [ ] El estudiante y su progreso se conservan
- [ ] Actualización inmediata de la lista

### CA-04: Búsqueda de Estudiantes Existentes
- [ ] Campo de búsqueda en modal de agregar
- [ ] Búsqueda por nombre o email
- [ ] Resultados en tiempo real (debounce 300ms)
- [ ] Muestra si el estudiante ya está en el aula
- [ ] Botón "Agregar" para cada resultado válido

### CA-05: Creación Rápida de Estudiante
- [ ] Formulario simple en modal
- [ ] Crear cuenta de estudiante con:
  - username: generado automáticamente (primernombre.apellido)
  - password temporal: generada automáticamente
  - role: student
- [ ] Mostrar credenciales generadas al profesor
- [ ] Opción de copiar credenciales
- [ ] Agregar automáticamente al aula tras crear

### CA-06: Validaciones
- [ ] No agregar estudiante que ya está en el aula
- [ ] Validar email único en la plataforma (si se proporciona)
- [ ] Límite de 100 estudiantes por aula (hardcodeado)
- [ ] Mensajes de error claros

---

## Especificaciones Técnicas

### Backend

**Endpoints:**

```typescript
// Listar estudiantes del aula
GET /api/teacher/classrooms/{classroomId}/students
Query params: ?search=juan

// Agregar estudiante existente al aula
POST /api/teacher/classrooms/{classroomId}/students
Body: { studentId: string }

// Crear estudiante y agregarlo al aula
POST /api/teacher/classrooms/{classroomId}/students/create
Body: {
  name: string;
  email?: string;
}

// Remover estudiante del aula
DELETE /api/teacher/classrooms/{classroomId}/students/{studentId}

// Buscar estudiantes disponibles
GET /api/teacher/students/search
Query params: ?q=juan&classroomId=uuid
```

**Response de Listar:**
```json
{
  "classroomId": "uuid",
  "students": [
    {
      "id": "student-uuid",
      "name": "Juan Pérez García",
      "email": "juan.perez@example.com",
      "avatarUrl": "/avatars/student.png",
      "addedAt": "2025-10-01T10:00:00Z"
    }
  ],
  "total": 25
}
```

**Response de Crear Estudiante:**
```json
{
  "student": {
    "id": "student-uuid",
    "name": "María López",
    "email": "maria.lopez@example.com",
    "username": "maria.lopez"
  },
  "credentials": {
    "username": "maria.lopez",
    "temporaryPassword": "Temp123!Maria"
  },
  "message": "Estudiante creado y agregado al aula exitosamente"
}
```

**Response de Búsqueda:**
```json
{
  "students": [
    {
      "id": "student-uuid",
      "name": "Carlos Gómez",
      "email": "carlos@example.com",
      "isInClassroom": false
    },
    {
      "id": "student-uuid-2",
      "name": "Ana García",
      "email": "ana@example.com",
      "isInClassroom": true
    }
  ]
}
```

**Controller:**
```typescript
// TeacherClassroomController.ts
@Controller('teacher/classrooms/:classroomId')
@UseGuards(AuthGuard, TeacherGuard)
export class TeacherClassroomController {
  @Get('students')
  async getStudents(
    @Param('classroomId') classroomId: string,
    @Query('search') search: string,
    @CurrentUser() teacher: User
  ) {
    return this.classroomService.getClassroomStudents(
      classroomId,
      teacher.id,
      search
    );
  }

  @Post('students')
  async addStudent(
    @Param('classroomId') classroomId: string,
    @Body() dto: AddStudentDto,
    @CurrentUser() teacher: User
  ) {
    await this.classroomService.addStudentToClassroom(
      classroomId,
      dto.studentId,
      teacher.id
    );
    return { message: 'Estudiante agregado exitosamente' };
  }

  @Post('students/create')
  async createAndAddStudent(
    @Param('classroomId') classroomId: string,
    @Body() dto: CreateStudentDto,
    @CurrentUser() teacher: User
  ) {
    return this.classroomService.createAndAddStudent(
      classroomId,
      dto,
      teacher.id
    );
  }

  @Delete('students/:studentId')
  async removeStudent(
    @Param('classroomId') classroomId: string,
    @Param('studentId') studentId: string,
    @CurrentUser() teacher: User
  ) {
    await this.classroomService.removeStudentFromClassroom(
      classroomId,
      studentId,
      teacher.id
    );
    return { message: 'Estudiante removido del aula exitosamente' };
  }
}

@Controller('teacher/students')
@UseGuards(AuthGuard, TeacherGuard)
export class TeacherStudentController {
  @Get('search')
  async searchStudents(
    @Query('q') query: string,
    @Query('classroomId') classroomId: string
  ) {
    return this.studentService.searchStudents(query, classroomId);
  }
}
```

**DTOs:**
```typescript
// add-student.dto.ts
export class AddStudentDto {
  @IsUUID()
  studentId: string;
}

// create-student.dto.ts
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

**Service:**
```typescript
// classroom.service.ts
async getClassroomStudents(
  classroomId: string,
  teacherId: string,
  search?: string
) {
  // Validar acceso del profesor
  await this.validateTeacherAccess(classroomId, teacherId);

  let query = this.classroomRepository
    .createQueryBuilder('classroom')
    .innerJoinAndSelect('classroom.students', 'student')
    .innerJoin('classroom_students', 'cs', 'cs.student_id = student.id AND cs.classroom_id = :classroomId', { classroomId })
    .where('classroom.id = :classroomId', { classroomId });

  if (search) {
    query = query.andWhere('LOWER(student.name) LIKE LOWER(:search)', {
      search: `%${search}%`
    });
  }

  const classroom = await query.getOne();

  return {
    classroomId,
    students: classroom?.students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      avatarUrl: student.avatarUrl,
      addedAt: student.createdAt // Idealmente desde tabla pivot
    })) || [],
    total: classroom?.students.length || 0
  };
}

async addStudentToClassroom(
  classroomId: string,
  studentId: string,
  teacherId: string
) {
  // Validar acceso del profesor
  await this.validateTeacherAccess(classroomId, teacherId);

  const classroom = await this.classroomRepository.findOne({
    where: { id: classroomId },
    relations: ['students']
  });

  // Validar límite de 100 estudiantes
  if (classroom.students.length >= 100) {
    throw new BadRequestException(
      'Has alcanzado el límite de 100 estudiantes por aula'
    );
  }

  // Validar que el estudiante existe
  const student = await this.studentRepository.findOne({
    where: { id: studentId }
  });

  if (!student) {
    throw new NotFoundException('Estudiante no encontrado');
  }

  // Validar que no está ya en el aula
  const alreadyInClassroom = classroom.students.some(s => s.id === studentId);
  if (alreadyInClassroom) {
    throw new BadRequestException('El estudiante ya está en esta aula');
  }

  // Agregar estudiante
  classroom.students.push(student);
  await this.classroomRepository.save(classroom);
}

async createAndAddStudent(
  classroomId: string,
  dto: CreateStudentDto,
  teacherId: string
) {
  // Validar acceso del profesor
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

  // Crear estudiante
  const student = this.studentRepository.create({
    userId: savedUser.id,
    name: dto.name,
    email: dto.email,
    avatarUrl: this.getDefaultAvatar()
  });

  await this.studentRepository.save(student);

  // Agregar al aula
  await this.addStudentToClassroom(classroomId, student.id, teacherId);

  return {
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      username
    },
    credentials: {
      username,
      temporaryPassword
    },
    message: 'Estudiante creado y agregado al aula exitosamente'
  };
}

async removeStudentFromClassroom(
  classroomId: string,
  studentId: string,
  teacherId: string
) {
  // Validar acceso del profesor
  await this.validateTeacherAccess(classroomId, teacherId);

  const classroom = await this.classroomRepository.findOne({
    where: { id: classroomId },
    relations: ['students']
  });

  // Remover relación (no eliminar estudiante)
  classroom.students = classroom.students.filter(s => s.id !== studentId);
  await this.classroomRepository.save(classroom);
}

private generateUsername(name: string): string {
  // Convertir "Juan Pérez García" -> "juan.perez"
  const parts = name.toLowerCase().split(' ');
  return `${parts[0]}.${parts[1] || parts[0]}`;
}

private generateTemporaryPassword(name: string): string {
  // Generar password: Temp123!PrimerNombre
  const firstName = name.split(' ')[0];
  return `Temp123!${firstName}`;
}

private getDefaultAvatar(): string {
  // Avatar placeholder
  return '/avatars/default-student.png';
}

// student.service.ts
async searchStudents(query: string, classroomId: string) {
  const students = await this.studentRepository
    .createQueryBuilder('student')
    .leftJoin('student.classrooms', 'classroom', 'classroom.id = :classroomId', { classroomId })
    .where('LOWER(student.name) LIKE LOWER(:query)', { query: `%${query}%` })
    .orWhere('LOWER(student.email) LIKE LOWER(:query)', { query: `%${query}%` })
    .select([
      'student.id',
      'student.name',
      'student.email',
      'classroom.id'
    ])
    .limit(10)
    .getMany();

  return {
    students: students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      isInClassroom: !!student.classrooms?.length
    }))
  };
}
```

### Frontend

**Ruta:**
```
/teacher/classroom/:classroomId/students
```

**Componente Principal:**
```typescript
// ClassroomStudentsView.tsx
export const ClassroomStudentsView = () => {
  const { classroomId } = useParams();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { students, total, isLoading, refetch } = useClassroomStudents(
    classroomId,
    search
  );

  const handleRemove = async (studentId: string, studentName: string) => {
    const confirmed = await confirm({
      title: 'Remover Estudiante',
      message: `¿Remover a ${studentName} del aula? Esto no eliminará su cuenta ni su progreso.`,
      confirmText: 'Remover',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      await removeStudentFromClassroom(classroomId, studentId);
      toast.success('Estudiante removido exitosamente');
      refetch();
    }
  };

  if (isLoading) return <StudentListSkeleton />;

  return (
    <div className="classroom-students-container">
      <PageHeader
        title="Estudiantes del Aula"
        subtitle={`${total} estudiante${total !== 1 ? 's' : ''}`}
        action={
          <Button
            onClick={() => setShowAddModal(true)}
            leftIcon={<PlusIcon />}
          >
            Agregar Estudiante
          </Button>
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre..."
      />

      {students.length === 0 && !search ? (
        <EmptyState
          icon={<UsersIcon />}
          title="No hay estudiantes en esta aula"
          description="Agrega estudiantes para comenzar"
          action={
            <Button onClick={() => setShowAddModal(true)}>
              Agregar Primer Estudiante
            </Button>
          }
        />
      ) : students.length === 0 ? (
        <EmptyState message="No se encontraron estudiantes" />
      ) : (
        <StudentsTable
          students={students}
          onRemove={handleRemove}
        />
      )}

      {total >= 100 && (
        <Alert severity="warning">
          Has alcanzado el límite de 100 estudiantes por aula.
        </Alert>
      )}

      {showAddModal && (
        <AddStudentModal
          classroomId={classroomId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            refetch();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};
```

**Modal de Agregar:**
```typescript
// AddStudentModal.tsx
export const AddStudentModal = ({ classroomId, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'search' | 'create'>('search');

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <ModalHeader>
        <h2>Agregar Estudiante</h2>
      </ModalHeader>

      <ModalBody>
        <TabGroup>
          <Tab
            active={mode === 'search'}
            onClick={() => setMode('search')}
          >
            Buscar Existente
          </Tab>
          <Tab
            active={mode === 'create'}
            onClick={() => setMode('create')}
          >
            Crear Nuevo
          </Tab>
        </TabGroup>

        {mode === 'search' ? (
          <SearchStudentForm
            classroomId={classroomId}
            onSuccess={onSuccess}
          />
        ) : (
          <CreateStudentForm
            classroomId={classroomId}
            onSuccess={onSuccess}
          />
        )}
      </ModalBody>
    </Modal>
  );
};
```

**Formulario de Búsqueda:**
```typescript
// SearchStudentForm.tsx
export const SearchStudentForm = ({ classroomId, onSuccess }) => {
  const [query, setQuery] = useState('');
  const { students, isLoading } = useStudentSearch(query, classroomId);

  const handleAdd = async (studentId: string) => {
    try {
      await addStudentToClassroom(classroomId, studentId);
      toast.success('Estudiante agregado exitosamente');
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="search-student-form">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Buscar por nombre o email..."
        autoFocus
      />

      {isLoading && <Spinner />}

      {students.length > 0 && (
        <div className="search-results">
          {students.map(student => (
            <StudentSearchResult
              key={student.id}
              student={student}
              onAdd={() => handleAdd(student.id)}
              disabled={student.isInClassroom}
            />
          ))}
        </div>
      )}

      {query && students.length === 0 && !isLoading && (
        <EmptyState message="No se encontraron estudiantes" />
      )}
    </div>
  );
};

const StudentSearchResult = ({ student, onAdd, disabled }) => {
  return (
    <div className="student-result">
      <Avatar src={student.avatarUrl} size="sm" />
      <div className="student-info">
        <h4>{student.name}</h4>
        <p>{student.email}</p>
      </div>
      <Button
        onClick={onAdd}
        disabled={disabled}
        size="sm"
      >
        {disabled ? 'Ya en aula' : 'Agregar'}
      </Button>
    </div>
  );
};
```

**Formulario de Crear:**
```typescript
// CreateStudentForm.tsx
export const CreateStudentForm = ({ classroomId, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CreateStudentData>();

  const [credentials, setCredentials] = useState(null);

  const onSubmit = async (data: CreateStudentData) => {
    try {
      const result = await createAndAddStudent(classroomId, data);
      setCredentials(result.credentials);
      toast.success('Estudiante creado y agregado exitosamente');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (credentials) {
    return (
      <CredentialsDisplay
        credentials={credentials}
        onClose={onSuccess}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="create-student-form">
      <FormField
        label="Nombre Completo"
        required
        error={errors.name?.message}
      >
        <Input
          {...register('name', {
            required: 'El nombre es requerido',
            maxLength: { value: 100, message: 'Máximo 100 caracteres' }
          })}
          placeholder="Ej: Juan Pérez García"
        />
      </FormField>

      <FormField
        label="Email"
        error={errors.email?.message}
      >
        <Input
          type="email"
          {...register('email', {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          })}
          placeholder="email@example.com (opcional)"
        />
      </FormField>

      <Alert severity="info">
        Se generarán credenciales automáticamente para el estudiante.
      </Alert>

      <FormActions>
        <Button type="submit" disabled={isSubmitting} fullWidth>
          {isSubmitting ? 'Creando...' : 'Crear y Agregar'}
        </Button>
      </FormActions>
    </form>
  );
};
```

**Display de Credenciales:**
```typescript
// CredentialsDisplay.tsx
export const CredentialsDisplay = ({ credentials, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `Usuario: ${credentials.username}\nContraseña: ${credentials.temporaryPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="credentials-display">
      <Alert severity="success">
        Estudiante creado exitosamente
      </Alert>

      <div className="credentials-card">
        <h3>Credenciales de Acceso</h3>
        <p className="warning">
          Guarda estas credenciales. Compártelas con el estudiante para que pueda ingresar.
        </p>

        <div className="credential-item">
          <label>Usuario:</label>
          <code>{credentials.username}</code>
        </div>

        <div className="credential-item">
          <label>Contraseña Temporal:</label>
          <code>{credentials.temporaryPassword}</code>
        </div>

        <Button
          onClick={copyToClipboard}
          variant="outline"
          leftIcon={<CopyIcon />}
          fullWidth
        >
          {copied ? 'Copiado!' : 'Copiar Credenciales'}
        </Button>
      </div>

      <Button onClick={onClose} fullWidth>
        Cerrar
      </Button>
    </div>
  );
};
```

---

## Alcance Básico vs Extensiones

### EAI-005 (Este alcance - Admin Base):
- ✅ Ver lista de estudiantes del aula
- ✅ Agregar estudiante existente (búsqueda manual)
- ✅ Crear estudiante nuevo con credenciales auto-generadas
- ✅ Remover estudiante del aula
- ✅ Búsqueda simple por nombre/email
- ✅ Límite de 100 estudiantes por aula

### EXT-001 (Extensión futura - Portal Maestros Completo):
- ⏳ Importación masiva desde CSV
- ⏳ Invitaciones por email con link de auto-registro
- ⏳ Código de clase para auto-registro de estudiantes
- ⏳ Transferencia de estudiantes entre aulas
- ⏳ Edición de datos de estudiante desde el profesor
- ⏳ Historial de pertenencia a aulas
- ⏳ Exportación de lista de estudiantes

---

## Dependencias

### Dependencias de User Stories:
- US-ADM-001 (aulas deben existir)

---

## Pruebas

### Pruebas E2E:
- [ ] Profesor agrega estudiante existente
- [ ] Profesor crea estudiante nuevo
- [ ] Profesor remueve estudiante
- [ ] Búsqueda encuentra estudiantes
- [ ] Validación de límite funciona

---

## Estimación de Esfuerzo

**Backend:** 4 SP
**Frontend:** 5 SP
**Testing:** 1 SP

**Total:** 10 SP = $4,000 MXN
