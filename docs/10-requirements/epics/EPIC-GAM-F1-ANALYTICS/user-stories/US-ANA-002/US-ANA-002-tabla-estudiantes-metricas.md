---
id: "US-ANA-002"
title: "Tabla de Estudiantes con Metricas"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-004"
story_points: 7
budget: "$3,400 MXN"
sprint: "Sprint-1"
labels: ["analytics", "tabla-estudiantes", "metricas", "alcance-inicial"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-ANA-002: Tabla de Estudiantes con Metricas

**Epica:** EAI-004 (Analytics Basico)
**Sprint:** Mes 1, Semana 3
**Story Points:** 7 SP
**Presupuesto:** $3,400 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done (Mes 1)

---

## Descripcion

Como profesor, quiero ver una tabla completa de todos mis estudiantes con sus metricas principales para identificar rapidamente quien va bien y quien necesita ayuda.

**Contexto del Alcance Inicial:**

Esta tabla proporciona una vista de lista de todos los estudiantes de la clase con las metricas mas relevantes en columnas. Permite ordenamiento basico y busqueda simple por nombre. NO incluye filtros avanzados, exportacion masiva, ni comparativas entre estudiantes (eso va a EXT-005 Reportes Avanzados).

---

## Criterios de Aceptacion

### CA-01: Columnas de la Tabla
- [ ] Columna: Avatar/Foto del estudiante
- [ ] Columna: Nombre completo del estudiante
- [ ] Columna: Progreso general (% completitud con barra visual)
- [ ] Columna: Nivel actual (con icono de insignia)
- [ ] Columna: XP acumulado
- [ ] Columna: Ultima actividad (fecha/hora relativa)
- [ ] Columna: Acciones (boton "Ver Detalle")

### CA-02: Ordenamiento por Columna
- [ ] Hacer clic en header de columna ordena ascendente
- [ ] Segundo clic ordena descendente
- [ ] Indicador visual de columna ordenada (flecha)
- [ ] Default: ordenado por nombre (A-Z)

### CA-03: Busqueda Basica
- [ ] Campo de busqueda por nombre del estudiante
- [ ] Busqueda insensible a mayusculas/minusculas
- [ ] Busqueda parcial (coincidencia en cualquier parte del nombre)
- [ ] Resultados se filtran en tiempo real (debounce 300ms)

### CA-04: Indicadores Visuales
- [ ] Progreso <30%: barra roja
- [ ] Progreso 30-70%: barra amarilla
- [ ] Progreso >70%: barra verde
- [ ] Ultima actividad >7 dias: fecha en rojo (alerta)
- [ ] Ultima actividad 3-7 dias: fecha en amarillo (advertencia)
- [ ] Ultima actividad <3 dias: fecha en verde (activo)

### CA-05: Navegacion
- [ ] Clic en fila lleva a vista de estudiante individual (US-ANA-003)
- [ ] Boton "Ver Detalle" en cada fila lleva a US-ANA-003
- [ ] Breadcrumb: Dashboard > Estudiantes

### CA-06: Performance y Paginacion
- [ ] Tabla muestra hasta 50 estudiantes por pagina
- [ ] Paginacion simple (Anterior/Siguiente)
- [ ] Carga en menos de 1 segundo para clases de hasta 100 estudiantes
- [ ] Skeleton loaders mientras carga datos

---

## Especificaciones Tecnicas

### Backend

**Endpoint Principal:**
```
GET /api/teacher/classroom/{classroomId}/students
Query params: ?page=1&limit=50&sortBy=name&order=asc&search=juan
```

**Response:**
```json
{
  "classroomId": "uuid",
  "students": [
    {
      "id": "student-uuid",
      "name": "Juan Perez Garcia",
      "avatarUrl": "/avatars/student-uuid.png",
      "progress": {
        "percentage": 65.5,
        "completedModules": 5,
        "totalModules": 8
      },
      "level": 3,
      "xp": 1250,
      "lastActivity": {
        "timestamp": "2025-11-01T15:30:00Z",
        "moduleName": "Fracciones",
        "activityName": "Suma de fracciones"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalStudents": 75,
    "limit": 50
  }
}
```

**Controller:**
```typescript
// TeacherAnalyticsController.ts
@Get('classroom/:classroomId/students')
async getClassroomStudents(
  @Param('classroomId') classroomId: string,
  @Query() query: StudentListQueryDto,
  @CurrentUser() teacher: User
) {
  return this.analyticsService.getClassroomStudents(
    classroomId,
    teacher.id,
    query
  );
}
```

**DTO:**
```typescript
// StudentListQueryDto.ts
export class StudentListQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @IsIn(['name', 'progress', 'level', 'xp', 'lastActivity'])
  sortBy?: string = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
```

**Service:**
```typescript
// TeacherAnalyticsService.ts
async getClassroomStudents(
  classroomId: string,
  teacherId: string,
  query: StudentListQueryDto
) {
  // Validar acceso del profesor
  await this.validateTeacherAccess(classroomId, teacherId);

  // Query base
  let queryBuilder = this.studentRepository
    .createQueryBuilder('student')
    .innerJoin('student.classrooms', 'classroom', 'classroom.id = :classroomId', { classroomId })
    .leftJoinAndSelect('student.progress', 'progress')
    .leftJoinAndSelect('student.lastActivity', 'lastActivity');

  // Busqueda
  if (query.search) {
    queryBuilder = queryBuilder.where(
      'LOWER(student.name) LIKE LOWER(:search)',
      { search: `%${query.search}%` }
    );
  }

  // Ordenamiento
  const sortField = this.mapSortField(query.sortBy);
  queryBuilder = queryBuilder.orderBy(sortField, query.order.toUpperCase());

  // Paginacion
  const skip = (query.page - 1) * query.limit;
  queryBuilder = queryBuilder.skip(skip).take(query.limit);

  const [students, total] = await queryBuilder.getManyAndCount();

  return {
    classroomId,
    students: students.map(s => this.mapStudentToDto(s)),
    pagination: {
      currentPage: query.page,
      totalPages: Math.ceil(total / query.limit),
      totalStudents: total,
      limit: query.limit
    }
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
// StudentListTable.tsx
export const StudentListTable = () => {
  const { classroomId } = useParams();
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { students, pagination, isLoading } = useStudentList({
    classroomId,
    sortBy,
    order,
    search,
    page
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setOrder('asc');
    }
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="student-list-container">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar estudiante..."
      />
      <Table>
        <TableHeader>
          <SortableColumn
            label="Nombre"
            field="name"
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
          />
          <SortableColumn
            label="Progreso"
            field="progress"
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
          />
          <SortableColumn
            label="Nivel"
            field="level"
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
          />
          <SortableColumn
            label="XP"
            field="xp"
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
          />
          <SortableColumn
            label="Ultima Actividad"
            field="lastActivity"
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
          />
          <TableColumn label="Acciones" />
        </TableHeader>
        <TableBody>
          {students.map(student => (
            <StudentRow
              key={student.id}
              student={student}
              onClick={() => navigate(`/teacher/student/${student.id}`)}
            />
          ))}
        </TableBody>
      </Table>
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};
```

**Componente de Fila:**
```typescript
// StudentRow.tsx
export const StudentRow = ({ student, onClick }) => {
  const progressColor = getProgressColor(student.progress.percentage);
  const activityStatus = getActivityStatus(student.lastActivity.timestamp);

  return (
    <TableRow onClick={onClick} className="cursor-pointer hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar src={student.avatarUrl} alt={student.name} />
          <span className="font-medium">{student.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <ProgressBar
          percentage={student.progress.percentage}
          color={progressColor}
          label={`${student.progress.percentage}%`}
        />
      </TableCell>
      <TableCell>
        <LevelBadge level={student.level} />
      </TableCell>
      <TableCell>
        <XPDisplay xp={student.xp} />
      </TableCell>
      <TableCell>
        <LastActivity
          timestamp={student.lastActivity.timestamp}
          status={activityStatus}
        />
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Ver Detalle
        </Button>
      </TableCell>
    </TableRow>
  );
};
```

**Estado (Zustand):**
```typescript
// teacherAnalyticsStore.ts
interface TeacherAnalyticsStore {
  studentList: StudentListData | null;
  isLoadingStudents: boolean;
  fetchStudents: (params: StudentListParams) => Promise<void>;
  // ... otros estados
}
```

**Hook Custom:**
```typescript
// useStudentList.ts
export const useStudentList = (params: StudentListParams) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const result = await teacherAnalyticsApi.getStudents(params);
      setData(result);
      setIsLoading(false);
    };

    // Debounce para busqueda
    const timer = setTimeout(fetchData, params.search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [params.classroomId, params.sortBy, params.order, params.search, params.page]);

  return { ...data, isLoading };
};
```

---

## Diseno UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  Estudiantes de Matematicas 6A                    [<- Volver]  |
+-------------------------------------------------------------------+
|  [Buscar estudiante...]                      75 estudiantes   |
+-------------------------------------------------------------------+
| Avatar | Nombre | Progreso | Nivel | XP | Ultima Act. | ... |
+-------------------------------------------------------------------+
| [Avatar]   | Ana Lopez | [65%]| 3  |1250| Hace 2 horas| Ver |
| [Avatar]   | Juan Perez| [45%]| 2  | 850| Hace 5 dias | Ver |
| [Avatar]   | Maria Go..| [85%]| 4  |2100| Hace 1 hora | Ver |
+-------------------------------------------------------------------+
|                       [<- Anterior] 1 / 2 [Siguiente ->]           |
+-------------------------------------------------------------------+
```

### Consideraciones Mobile
- Tabla colapsa a cards con metricas principales
- Busqueda en header sticky
- Scroll infinito en lugar de paginacion

---

## Alcance Basico vs Extensiones

### EAI-004 (Este alcance - Analytics Basico):
- Done Tabla simple con columnas fijas
- Done Ordenamiento por columna (una a la vez)
- Done Busqueda simple por nombre
- Done Paginacion basica (50 por pagina)
- Done Indicadores visuales de estado (colores)
- Done Sin exportacion

### EXT-005 (Extension futura - Reportes Avanzados):
- Pendiente Columnas configurables (elegir cuales mostrar)
- Pendiente Filtros avanzados (por nivel, progreso, actividad)
- Pendiente Busqueda por multiples campos
- Pendiente Ordenamiento multi-columna
- Pendiente Exportacion a CSV/Excel con filtros aplicados
- Pendiente Comparacion de estudiantes (seleccion multiple)
- Pendiente Vista de tabla vs vista de cards (toggle)
- Pendiente Grupos/tags personalizados
- Pendiente Acciones masivas (asignar modulo a seleccionados)

---

## Dependencias

### Dependencias Tecnicas:
- **Backend:** Modelo de Student con relaciones a Progress y Activity
- **Backend:** Sistema de autenticacion de profesores
- **Frontend:** Componentes de tabla reutilizables
- **Frontend:** Hook de debounce para busqueda

### Dependencias de User Stories:
- US-ANA-003 (para navegacion a detalle de estudiante)

---

## Pruebas

### Pruebas Unitarias:
- [ ] Busqueda filtra estudiantes correctamente
- [ ] Ordenamiento por cada columna funciona
- [ ] Paginacion calcula paginas correctamente
- [ ] Indicadores de color se aplican segun reglas

### Pruebas de Integracion:
- [ ] Endpoint retorna estudiantes del profesor autenticado
- [ ] Query params de ordenamiento funcionan
- [ ] Busqueda retorna resultados correctos
- [ ] Paginacion retorna el rango correcto

### Pruebas E2E:
- [ ] Profesor ve lista completa de sus estudiantes
- [ ] Busqueda por nombre funciona en tiempo real
- [ ] Clic en columna ordena la tabla
- [ ] Clic en estudiante navega a detalle
- [ ] Paginacion muestra paginas correctas

---

## Notas de Implementacion

1. **Performance:**
   - Indice en columna `name` para busqueda rapida
   - Query con joins limitados (solo datos necesarios)
   - Cachear conteo total si no hay busqueda

2. **UX:**
   - Debounce de 300ms en busqueda para evitar requests excesivos
   - Skeleton loader con misma estructura de tabla
   - Highlight de termino buscado en resultados

3. **Accesibilidad:**
   - Headers de tabla con aria-sort
   - Filas con rol="button" y accesibles por teclado
   - Anuncio de resultados de busqueda para screen readers

---

## Estimacion de Esfuerzo

**Backend:** 2 SP
- Endpoint con paginacion, ordenamiento, busqueda
- Query optimizado

**Frontend:** 4 SP
- Tabla con ordenamiento
- Busqueda con debounce
- Paginacion
- Indicadores visuales

**Testing:** 1 SP

**Total:** 7 SP = $3,400 MXN

---

## Tareas de Implementacion

### Backend (12.6h - 45%)

#### 1. DTOs y Validacion de Query Params (1.5h)
- [ ] Crear `StudentListQueryDto` con validacion class-validator
- [ ] Validar parametros: page (min 1), limit (10-100), sortBy, order, search
- [ ] Implementar valores por defecto (page=1, limit=50, sortBy=name, order=asc)

#### 2. Repository Query Builder (4h)
- [ ] Implementar query base con joins a `progress` y `lastActivity`
- [ ] Implementar busqueda insensible a mayusculas (LOWER LIKE)
- [ ] Implementar ordenamiento dinamico por columna (`mapSortField()`)
- [ ] Implementar paginacion con skip/take
- [ ] Optimizar query para evitar N+1 (usar eager loading)

#### 3. Service de Lista de Estudiantes (3.5h)
- [ ] Implementar `getClassroomStudents()` con todos los filtros
- [ ] Calcular `studentCount` y `totalPages` con agregacion
- [ ] Mapear estudiantes a DTO con campos: progress, level, xp, lastActivity
- [ ] Implementar indicadores visuales (color segun progreso y ultima actividad)
- [ ] Manejar edge case: clase sin estudiantes

#### 4. Controller y Endpoint (1.6h)
- [ ] Implementar `GET /api/teacher/classroom/{classroomId}/students`
- [ ] Validar query params con DTO
- [ ] Validar acceso del profesor al aula
- [ ] Manejar errores 403, 404
- [ ] Documentar endpoint con ejemplos

#### 5. Indices y Performance (1.2h)
- [ ] Crear indice en `student.name` para busqueda rapida
- [ ] Configurar indice compuesto en `(classroomId, name)`
- [ ] Cachear conteo total si no hay busqueda (TTL 5min)
- [ ] Optimizar con `select` especificos

#### 6. Testing Backend (0.8h)
- [ ] Unit tests para busqueda y ordenamiento
- [ ] Integration tests para paginacion
- [ ] Test de queries con >100 estudiantes

### Frontend (9.8h - 35%)

#### 1. Setup de Estado y Hook Custom (2h)
- [ ] Crear hook `useStudentList()` con debounce para busqueda
- [ ] Implementar estado local: sortBy, order, search, page
- [ ] Configurar auto-fetch al cambiar parametros
- [ ] Implementar debounce de 300ms en search

#### 2. Componente Principal de Tabla (2.5h)
- [ ] Crear `StudentListTable.tsx` con routing y estado
- [ ] Implementar `SearchBar` con input controlado
- [ ] Implementar skeleton loader `TableSkeleton`
- [ ] Manejar empty states (sin estudiantes, sin resultados de busqueda)

#### 3. Componente de Tabla y Headers (2h)
- [ ] Crear `Table` y `TableHeader` con columnas fijas
- [ ] Crear `SortableColumn` con indicadores de orden
- [ ] Implementar logica de ordenamiento al hacer clic
- [ ] Aplicar estilos Tailwind para tabla responsive

#### 4. Componente de Fila de Estudiante (2h)
- [ ] Crear `StudentRow` con todos los campos
- [ ] Implementar `ProgressBar` con colores segun porcentaje
- [ ] Implementar `LevelBadge` con iconos de nivel
- [ ] Implementar `LastActivity` con color segun dias de inactividad
- [ ] Agregar cursor pointer y hover state

#### 5. Componente de Paginacion (0.8h)
- [ ] Crear `Pagination` con botones Anterior/Siguiente
- [ ] Mostrar pagina actual y total de paginas
- [ ] Deshabilitar botones en limites (primera/ultima pagina)

#### 6. Navegacion y Mobile (0.5h)
- [ ] Implementar navegacion a perfil de estudiante (onClick en fila)
- [ ] Adaptar tabla a mobile (colapsar a cards)

### Testing (4.2h - 15%)

#### 1. Testing Unitario (1.8h)
- [ ] Tests de componentes aislados (SearchBar, Pagination)
- [ ] Tests de custom hook con debounce
- [ ] Tests de funciones de color y formateo

#### 2. Testing de Integracion (1.5h)
- [ ] Test E2E: Profesor ve lista completa de estudiantes
- [ ] Test E2E: Busqueda funciona en tiempo real
- [ ] Test E2E: Ordenamiento cambia orden de filas
- [ ] Test E2E: Clic en fila navega a perfil

#### 3. Testing de Performance (0.9h)
- [ ] Test de renderizado de tabla con 50+ estudiantes
- [ ] Test de debounce en busqueda

### Deployment (1.4h - 5%)

#### 1. Build y Deploy (1.4h)
- [ ] Build de produccion
- [ ] Verificar lazy loading de tabla
- [ ] Deploy a staging
- [ ] Smoke tests de busqueda y ordenamiento

---

**Total Horas:** 28h
**Distribucion Real:** Backend 45% | Frontend 35% | Testing 15% | Deploy 5%
