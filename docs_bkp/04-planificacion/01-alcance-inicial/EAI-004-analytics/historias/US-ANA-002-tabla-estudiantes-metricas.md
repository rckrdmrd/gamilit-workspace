# US-ANA-002: Tabla de Estudiantes con Métricas

**Épica:** EAI-004 (Analytics Básico)
**Sprint:** Mes 1, Semana 3
**Story Points:** 7 SP
**Presupuesto:** $3,400 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como profesor, quiero ver una tabla completa de todos mis estudiantes con sus métricas principales para identificar rápidamente quién va bien y quién necesita ayuda.

**Contexto del Alcance Inicial:**

Esta tabla proporciona una vista de lista de todos los estudiantes de la clase con las métricas más relevantes en columnas. Permite ordenamiento básico y búsqueda simple por nombre. NO incluye filtros avanzados, exportación masiva, ni comparativas entre estudiantes (eso va a EXT-005 Reportes Avanzados).

---

## Criterios de Aceptación

### CA-01: Columnas de la Tabla
- [ ] Columna: Avatar/Foto del estudiante
- [ ] Columna: Nombre completo del estudiante
- [ ] Columna: Progreso general (% completitud con barra visual)
- [ ] Columna: Nivel actual (con icono de insignia)
- [ ] Columna: XP acumulado
- [ ] Columna: Última actividad (fecha/hora relativa)
- [ ] Columna: Acciones (botón "Ver Detalle")

### CA-02: Ordenamiento por Columna
- [ ] Hacer clic en header de columna ordena ascendente
- [ ] Segundo clic ordena descendente
- [ ] Indicador visual de columna ordenada (flecha ↑↓)
- [ ] Default: ordenado por nombre (A-Z)

### CA-03: Búsqueda Básica
- [ ] Campo de búsqueda por nombre del estudiante
- [ ] Búsqueda insensible a mayúsculas/minúsculas
- [ ] Búsqueda parcial (coincidencia en cualquier parte del nombre)
- [ ] Resultados se filtran en tiempo real (debounce 300ms)

### CA-04: Indicadores Visuales
- [ ] Progreso <30%: barra roja
- [ ] Progreso 30-70%: barra amarilla
- [ ] Progreso >70%: barra verde
- [ ] Última actividad >7 días: fecha en rojo (alerta)
- [ ] Última actividad 3-7 días: fecha en amarillo (advertencia)
- [ ] Última actividad <3 días: fecha en verde (activo)

### CA-05: Navegación
- [ ] Clic en fila lleva a vista de estudiante individual (US-ANA-003)
- [ ] Botón "Ver Detalle" en cada fila lleva a US-ANA-003
- [ ] Breadcrumb: Dashboard > Estudiantes

### CA-06: Performance y Paginación
- [ ] Tabla muestra hasta 50 estudiantes por página
- [ ] Paginación simple (Anterior/Siguiente)
- [ ] Carga en menos de 1 segundo para clases de hasta 100 estudiantes
- [ ] Skeleton loaders mientras carga datos

---

## Especificaciones Técnicas

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
      "name": "Juan Pérez García",
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

  // Búsqueda
  if (query.search) {
    queryBuilder = queryBuilder.where(
      'LOWER(student.name) LIKE LOWER(:search)',
      { search: `%${query.search}%` }
    );
  }

  // Ordenamiento
  const sortField = this.mapSortField(query.sortBy);
  queryBuilder = queryBuilder.orderBy(sortField, query.order.toUpperCase());

  // Paginación
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
            label="Última Actividad"
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

    // Debounce para búsqueda
    const timer = setTimeout(fetchData, params.search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [params.classroomId, params.sortBy, params.order, params.search, params.page]);

  return { ...data, isLoading };
};
```

---

## Diseño UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  📊 Estudiantes de Matemáticas 6A                    [← Volver]  |
+-------------------------------------------------------------------+
|  [🔍 Buscar estudiante...]                      75 estudiantes   |
+-------------------------------------------------------------------+
| Avatar | Nombre ↑ | Progreso ↓ | Nivel | XP | Última Act. | ... |
+-------------------------------------------------------------------+
| [👤]   | Ana López | [████░░] 65%| 🥉 3  |1250| Hace 2 horas| Ver |
| [👤]   | Juan Pérez| [███░░░] 45%| 🥉 2  | 850| Hace 5 días | Ver |
| [👤]   | María Gó..| [█████░] 85%| 🥇 4  |2100| Hace 1 hora | Ver |
+-------------------------------------------------------------------+
|                       [← Anterior] 1 / 2 [Siguiente →]           |
+-------------------------------------------------------------------+
```

### Consideraciones Mobile
- Tabla colapsa a cards con métricas principales
- Búsqueda en header sticky
- Scroll infinito en lugar de paginación

---

## Alcance Básico vs Extensiones

### EAI-004 (Este alcance - Analytics Básico):
- ✅ Tabla simple con columnas fijas
- ✅ Ordenamiento por columna (una a la vez)
- ✅ Búsqueda simple por nombre
- ✅ Paginación básica (50 por página)
- ✅ Indicadores visuales de estado (colores)
- ✅ Sin exportación

### EXT-005 (Extensión futura - Reportes Avanzados):
- ⏳ Columnas configurables (elegir cuáles mostrar)
- ⏳ Filtros avanzados (por nivel, progreso, actividad)
- ⏳ Búsqueda por múltiples campos
- ⏳ Ordenamiento multi-columna
- ⏳ Exportación a CSV/Excel con filtros aplicados
- ⏳ Comparación de estudiantes (selección múltiple)
- ⏳ Vista de tabla vs vista de cards (toggle)
- ⏳ Grupos/tags personalizados
- ⏳ Acciones masivas (asignar módulo a seleccionados)

---

## Dependencias

### Dependencias Técnicas:
- **Backend:** Modelo de Student con relaciones a Progress y Activity
- **Backend:** Sistema de autenticación de profesores
- **Frontend:** Componentes de tabla reutilizables
- **Frontend:** Hook de debounce para búsqueda

### Dependencias de User Stories:
- US-ANA-003 (para navegación a detalle de estudiante)

---

## Pruebas

### Pruebas Unitarias:
- [ ] Búsqueda filtra estudiantes correctamente
- [ ] Ordenamiento por cada columna funciona
- [ ] Paginación calcula páginas correctamente
- [ ] Indicadores de color se aplican según reglas

### Pruebas de Integración:
- [ ] Endpoint retorna estudiantes del profesor autenticado
- [ ] Query params de ordenamiento funcionan
- [ ] Búsqueda retorna resultados correctos
- [ ] Paginación retorna el rango correcto

### Pruebas E2E:
- [ ] Profesor ve lista completa de sus estudiantes
- [ ] Búsqueda por nombre funciona en tiempo real
- [ ] Clic en columna ordena la tabla
- [ ] Clic en estudiante navega a detalle
- [ ] Paginación muestra páginas correctas

---

## Notas de Implementación

1. **Performance:**
   - Índice en columna `name` para búsqueda rápida
   - Query con joins limitados (solo datos necesarios)
   - Cachear conteo total si no hay búsqueda

2. **UX:**
   - Debounce de 300ms en búsqueda para evitar requests excesivos
   - Skeleton loader con misma estructura de tabla
   - Highlight de término buscado en resultados

3. **Accesibilidad:**
   - Headers de tabla con aria-sort
   - Filas con rol="button" y accesibles por teclado
   - Anuncio de resultados de búsqueda para screen readers

---

## Estimación de Esfuerzo

**Backend:** 2 SP
- Endpoint con paginación, ordenamiento, búsqueda
- Query optimizado

**Frontend:** 4 SP
- Tabla con ordenamiento
- Búsqueda con debounce
- Paginación
- Indicadores visuales

**Testing:** 1 SP

**Total:** 7 SP = $3,400 MXN

---

## Tareas de Implementación

### Backend (12.6h - 45%)

#### 1. DTOs y Validación de Query Params (1.5h)
- [ ] Crear `StudentListQueryDto` con validación class-validator
- [ ] Validar parámetros: page (min 1), limit (10-100), sortBy, order, search
- [ ] Implementar valores por defecto (page=1, limit=50, sortBy=name, order=asc)

#### 2. Repository Query Builder (4h)
- [ ] Implementar query base con joins a `progress` y `lastActivity`
- [ ] Implementar búsqueda insensible a mayúsculas (LOWER LIKE)
- [ ] Implementar ordenamiento dinámico por columna (`mapSortField()`)
- [ ] Implementar paginación con skip/take
- [ ] Optimizar query para evitar N+1 (usar eager loading)

#### 3. Service de Lista de Estudiantes (3.5h)
- [ ] Implementar `getClassroomStudents()` con todos los filtros
- [ ] Calcular `studentCount` y `totalPages` con agregación
- [ ] Mapear estudiantes a DTO con campos: progress, level, xp, lastActivity
- [ ] Implementar indicadores visuales (color según progreso y última actividad)
- [ ] Manejar edge case: clase sin estudiantes

#### 4. Controller y Endpoint (1.6h)
- [ ] Implementar `GET /api/teacher/classroom/{classroomId}/students`
- [ ] Validar query params con DTO
- [ ] Validar acceso del profesor al aula
- [ ] Manejar errores 403, 404
- [ ] Documentar endpoint con ejemplos

#### 5. Índices y Performance (1.2h)
- [ ] Crear índice en `student.name` para búsqueda rápida
- [ ] Configurar índice compuesto en `(classroomId, name)`
- [ ] Cachear conteo total si no hay búsqueda (TTL 5min)
- [ ] Optimizar con `select` específicos

#### 6. Testing Backend (0.8h)
- [ ] Unit tests para búsqueda y ordenamiento
- [ ] Integration tests para paginación
- [ ] Test de queries con >100 estudiantes

### Frontend (9.8h - 35%)

#### 1. Setup de Estado y Hook Custom (2h)
- [ ] Crear hook `useStudentList()` con debounce para búsqueda
- [ ] Implementar estado local: sortBy, order, search, page
- [ ] Configurar auto-fetch al cambiar parámetros
- [ ] Implementar debounce de 300ms en search

#### 2. Componente Principal de Tabla (2.5h)
- [ ] Crear `StudentListTable.tsx` con routing y estado
- [ ] Implementar `SearchBar` con input controlado
- [ ] Implementar skeleton loader `TableSkeleton`
- [ ] Manejar empty states (sin estudiantes, sin resultados de búsqueda)

#### 3. Componente de Tabla y Headers (2h)
- [ ] Crear `Table` y `TableHeader` con columnas fijas
- [ ] Crear `SortableColumn` con indicadores de orden (↑↓)
- [ ] Implementar lógica de ordenamiento al hacer clic
- [ ] Aplicar estilos Tailwind para tabla responsive

#### 4. Componente de Fila de Estudiante (2h)
- [ ] Crear `StudentRow` con todos los campos
- [ ] Implementar `ProgressBar` con colores según porcentaje
- [ ] Implementar `LevelBadge` con iconos de nivel
- [ ] Implementar `LastActivity` con color según días de inactividad
- [ ] Agregar cursor pointer y hover state

#### 5. Componente de Paginación (0.8h)
- [ ] Crear `Pagination` con botones Anterior/Siguiente
- [ ] Mostrar página actual y total de páginas
- [ ] Deshabilitar botones en límites (primera/última página)

#### 6. Navegación y Mobile (0.5h)
- [ ] Implementar navegación a perfil de estudiante (onClick en fila)
- [ ] Adaptar tabla a mobile (colapsar a cards)

### Testing (4.2h - 15%)

#### 1. Testing Unitario (1.8h)
- [ ] Tests de componentes aislados (SearchBar, Pagination)
- [ ] Tests de custom hook con debounce
- [ ] Tests de funciones de color y formateo

#### 2. Testing de Integración (1.5h)
- [ ] Test E2E: Profesor ve lista completa de estudiantes
- [ ] Test E2E: Búsqueda funciona en tiempo real
- [ ] Test E2E: Ordenamiento cambia orden de filas
- [ ] Test E2E: Clic en fila navega a perfil

#### 3. Testing de Performance (0.9h)
- [ ] Test de renderizado de tabla con 50+ estudiantes
- [ ] Test de debounce en búsqueda

### Deployment (1.4h - 5%)

#### 1. Build y Deploy (1.4h)
- [ ] Build de producción
- [ ] Verificar lazy loading de tabla
- [ ] Deploy a staging
- [ ] Smoke tests de búsqueda y ordenamiento

---

**Total Horas:** 28h
**Distribución Real:** Backend 45% | Frontend 35% | Testing 15% | Deploy 5%
