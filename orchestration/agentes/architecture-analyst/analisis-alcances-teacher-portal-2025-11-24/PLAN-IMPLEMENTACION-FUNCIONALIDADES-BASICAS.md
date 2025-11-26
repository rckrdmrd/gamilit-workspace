# PLAN DE IMPLEMENTACIÓN - Funcionalidades Básicas Portal Teacher

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Versión:** 3.0.0 (CORRECTA según Propuesta 2.2)
**Severidad:** 🔴 ALTA (Funcionalidades básicas faltantes)

---

## 🎯 ALCANCE CORRECTO

### Propuesta 2.2 - Módulo 2.2.1.5: Administración y Escalabilidad

**FUNCIONALIDADES BÁSICAS QUE DEBEN ESTAR:**
- ✅ Panel administrativo para carga de contenidos
- ✅ **Sistema de grupos y asignaciones**
- ✅ Configuración avanzada de mecánicas
- ✅ Optimización y testing final

**INTERPRETACIÓN:**
Las funcionalidades del portal teacher DEBEN existir en su **forma BÁSICA**, no con todas las features avanzadas de Fase 2/3.

---

## 📊 ANÁLISIS: Funcionalidad Básica vs Avanzada

### Portal Teacher - Desglose por Página

| # | Página | Funcionalidad Básica (DEBE ESTAR) | Funcionalidad Avanzada (Fase 2/3) | Estado Actual |
|---|--------|------------------------------------|------------------------------------|---------------|
| **1** | **Dashboard** | ✅ Vista resumen de grupos<br>✅ Métricas básicas<br>✅ Acceso rápido | ❌ Gráficas avanzadas<br>❌ Dashboard personalizable<br>❌ Widgets | ⚠️ Parcial |
| **2** | **Gestión de Grupos** | ✅ CRUD de grupos/aulas<br>✅ Asignar estudiantes<br>✅ Ver lista | ❌ Templates de aula<br>❌ Clonación<br>❌ Soft delete | ❌ 404 (falta endpoint) |
| **3** | **Asignaciones** | ✅ Asignar módulos<br>✅ Ver estado<br>✅ Fechas límite básicas | ❌ Crear ejercicios custom<br>❌ Rúbricas complejas<br>❌ Auto-grading avanzado | ⚠️ Solo lectura |
| **4** | **Progreso** | ✅ Ver progreso por grupo<br>✅ Métricas simples (%) | ❌ Gráficas múltiples<br>❌ Comparativas avanzadas<br>❌ Exportación Excel | ⚠️ Parcial (404) |
| **5** | **Monitoreo** | ✅ Ver estudiantes activos<br>✅ Última actividad | ❌ Tiempo real avanzado<br>❌ Alertas automáticas complejas | ⚠️ Parcial (404) |
| **6** | **Alertas** | ✅ Alertas básicas de inactividad | ❌ ML predictions<br>❌ Intervención inteligente | ✅ Funcional |
| **7** | **Reportes** | ✅ Reporte simple de progreso | ❌ Múltiples formatos (PDF/Excel)<br>❌ Templates personalizables | ⚠️ Con mocks |
| **8** | **Analíticas** | ✅ Métricas básicas por grupo | ❌ Analytics multidimensional<br>❌ Visualizaciones avanzadas | ⚠️ Wrapper |
| **9** | **Contenido** | ✅ Ver catálogo<br>✅ Asignar contenido | ❌ Crear contenido custom<br>❌ Editor avanzado | ⚠️ Wrapper |
| **10** | **Gamificación** | ✅ Ver configuración | ❌ Editar configuración<br>❌ Bonificaciones manuales | ⚠️ Wrapper |
| **11** | **Comunicación** | ❌ Fase 2/3 completa | - | ✅ UnderConstruction |
| **12** | **Recursos** | ❌ Fase 2/3 completa | - | ✅ UnderConstruction |

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### P0 - CRÍTICO: Endpoints Faltantes

**1. GET /teacher/classrooms (404)**
- **Impacta:** Dashboard, Monitoreo, Progreso, Reportes, Contenido
- **Funcionalidad básica bloqueada:** Sistema de grupos
- **Prioridad:** P0 - URGENTE

**2. GET /teacher/classrooms/:id/students (404)**
- **Impacta:** Monitoreo, Asignaciones, Reportes
- **Funcionalidad básica bloqueada:** Asignar contenido
- **Prioridad:** P0 - URGENTE

### P1 - ALTA: Funcionalidades Básicas Incompletas

**3. Asignaciones - Solo lectura**
- **Falta:** Asignar módulos/contenido a grupos
- **Tiene:** Ver asignaciones existentes
- **Prioridad:** P1 - ALTA

**4. Progreso - Datos incompletos**
- **Falta:** Métricas básicas por grupo
- **Tiene:** UI, pero sin datos reales
- **Prioridad:** P1 - ALTA

---

## 📋 PLAN DE IMPLEMENTACIÓN

### FASE 1: Endpoints Críticos (P0) - 1-2 días

**Objetivo:** Desbloquear funcionalidad básica de "Sistema de grupos"

#### 1.1. Implementar GET /teacher/classrooms

**Backend:**
```typescript
// apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts

@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
export class TeacherClassroomsController {

  @Get('classrooms')
  async getTeacherClassrooms(@CurrentUser() user: User) {
    return this.teacherService.getMyClassrooms(user.id);
  }
}

// Service
async getMyClassrooms(teacherId: string) {
  return this.prisma.classroom.findMany({
    where: {
      teacher_id: teacherId  // RLS aplica automáticamente
    },
    include: {
      _count: {
        select: {
          students: true,
          assignments: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });
}
```

**Response Ejemplo:**
```json
[
  {
    "id": "classroom-uuid",
    "name": "5to A - Comprensión Lectora",
    "grade_level": "primaria",
    "subject": "Lectura",
    "teacher_id": "teacher-uuid",
    "student_count": 25,
    "assignment_count": 5,
    "created_at": "2025-11-01T10:00:00Z"
  }
]
```

**Páginas Desbloqueadas:**
- ✅ Dashboard (puede listar grupos)
- ✅ Monitoreo (puede seleccionar grupo)
- ✅ Progreso (puede filtrar por grupo)
- ✅ Reportes (puede seleccionar grupo)

---

#### 1.2. Implementar GET /teacher/classrooms/:id/students

**Backend:**
```typescript
@Get('classrooms/:id/students')
async getClassroomStudents(
  @Param('id') classroomId: string,
  @CurrentUser() user: User
) {
  // Validar que classroom pertenece al teacher (RLS lo maneja)
  return this.teacherService.getClassroomStudents(classroomId);
}

// Service
async getClassroomStudents(classroomId: string) {
  const students = await this.prisma.student.findMany({
    where: {
      classroom_enrollments: {
        some: {
          classroom_id: classroomId
        }
      }
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      user_stats: {
        select: {
          level: true,
          total_xp: true,
          current_rank: true,
          ml_coins: true
        }
      }
    }
  });

  return students;
}
```

**Páginas Desbloqueadas:**
- ✅ Monitoreo (puede ver estudiantes)
- ✅ Reportes (puede seleccionar estudiantes)

---

### FASE 2: Funcionalidades Básicas (P1) - 2-3 días

**Objetivo:** Completar "Sistema de asignaciones" básico

#### 2.1. Asignación de Módulos/Contenido

**Funcionalidad básica requerida:**
- Seleccionar módulo existente del catálogo
- Asignar a un grupo
- Establecer fecha límite simple
- Ver estado de asignaciones

**Backend:**
```typescript
// POST /teacher/assignments
@Post('assignments')
async createAssignment(
  @Body() dto: CreateAssignmentDto,
  @CurrentUser() user: User
) {
  return this.teacherService.createBasicAssignment(dto, user.id);
}

// DTO
class CreateAssignmentDto {
  @IsString()
  title: string;

  @IsUUID()
  module_id: string;  // Seleccionar módulo existente

  @IsArray()
  @IsUUID('4', { each: true })
  classroom_ids: string[];  // Asignar a grupos

  @IsDateString()
  @IsOptional()
  due_date?: string;  // Fecha límite simple

  @IsNumber()
  @IsOptional()
  max_attempts?: number;  // Intentos permitidos (básico)
}

// Service
async createBasicAssignment(dto: CreateAssignmentDto, teacherId: string) {
  // Validar que classrooms pertenecen al teacher
  const classrooms = await this.prisma.classroom.findMany({
    where: {
      id: { in: dto.classroom_ids },
      teacher_id: teacherId
    }
  });

  if (classrooms.length !== dto.classroom_ids.length) {
    throw new ForbiddenException('No tienes acceso a todas las aulas');
  }

  // Crear assignment
  return this.prisma.assignment.create({
    data: {
      title: dto.title,
      module_id: dto.module_id,
      teacher_id: teacherId,
      due_date: dto.due_date,
      max_attempts: dto.max_attempts || 3,
      classroom_assignments: {
        createMany: {
          data: dto.classroom_ids.map(id => ({
            classroom_id: id
          }))
        }
      }
    }
  });
}
```

**Frontend - UI Básica:**
```typescript
// CreateAssignmentModal.tsx (BÁSICO)
export const CreateAssignmentModal = () => {
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');

  return (
    <Modal>
      <h2>Asignar Módulo</h2>

      {/* Selector de módulo del catálogo */}
      <Select
        label="Seleccionar Módulo"
        options={modules}  // Catálogo existente
        value={selectedModule}
        onChange={setSelectedModule}
      />

      {/* Selector de grupos */}
      <MultiSelect
        label="Asignar a grupos"
        options={classrooms}
        value={selectedClassrooms}
        onChange={setSelectedClassrooms}
      />

      {/* Fecha límite simple */}
      <DatePicker
        label="Fecha límite (opcional)"
        value={dueDate}
        onChange={setDueDate}
      />

      <Button onClick={handleSubmit}>Asignar</Button>
    </Modal>
  );
};
```

**Funcionalidad BÁSICA:**
- ✅ Seleccionar módulo existente
- ✅ Asignar a uno o varios grupos
- ✅ Fecha límite opcional
- ✅ Ver lista de asignaciones

**NO incluye (Fase 2/3):**
- ❌ Crear ejercicios personalizados
- ❌ Rúbricas complejas
- ❌ Configuración avanzada de puntos
- ❌ Feedback automático personalizable

---

#### 2.2. Ver Progreso Básico por Grupo

**Funcionalidad básica requerida:**
- Ver % de completitud por grupo
- Lista de estudiantes con progreso
- Métricas simples (promedio, completados, pendientes)

**Backend:**
```typescript
// GET /teacher/classrooms/:id/progress
@Get('classrooms/:id/progress')
async getClassroomProgress(@Param('id') classroomId: string) {
  return this.teacherService.getBasicProgress(classroomId);
}

// Service
async getBasicProgress(classroomId: string) {
  const students = await this.prisma.student.findMany({
    where: {
      classroom_enrollments: {
        some: { classroom_id: classroomId }
      }
    },
    include: {
      user_stats: {
        select: {
          modules_completed: true,
          total_modules: true,
          average_score: true
        }
      }
    }
  });

  const totalStudents = students.length;
  const averageProgress = students.reduce((sum, s) => {
    const progress = (s.user_stats.modules_completed / s.user_stats.total_modules) * 100;
    return sum + progress;
  }, 0) / totalStudents;

  return {
    classroom_id: classroomId,
    total_students: totalStudents,
    average_progress: averageProgress,
    students: students.map(s => ({
      id: s.id,
      name: s.full_name,
      modules_completed: s.user_stats.modules_completed,
      total_modules: s.user_stats.total_modules,
      progress_percentage: (s.user_stats.modules_completed / s.user_stats.total_modules) * 100,
      average_score: s.user_stats.average_score
    }))
  };
}
```

**Frontend - UI Básica:**
```typescript
// ClassroomProgressView.tsx (BÁSICO)
export const ClassroomProgressView = ({ classroomId }) => {
  const { data: progress, isLoading } = useClassroomProgress(classroomId);

  return (
    <div>
      {/* Métricas básicas */}
      <div className="metrics-grid">
        <MetricCard
          label="Estudiantes"
          value={progress.total_students}
        />
        <MetricCard
          label="Progreso Promedio"
          value={`${progress.average_progress.toFixed(1)}%`}
        />
      </div>

      {/* Lista simple de estudiantes */}
      <table>
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Módulos Completados</th>
            <th>Progreso</th>
            <th>Promedio</th>
          </tr>
        </thead>
        <tbody>
          {progress.students.map(student => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.modules_completed} / {student.total_modules}</td>
              <td>
                <ProgressBar value={student.progress_percentage} />
                {student.progress_percentage.toFixed(1)}%
              </td>
              <td>{student.average_score}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

**Funcionalidad BÁSICA:**
- ✅ Métricas simples (promedio, totales)
- ✅ Lista de estudiantes con %
- ✅ Progreso por módulo

**NO incluye (Fase 2/3):**
- ❌ Gráficas avanzadas (líneas, barras, dona)
- ❌ Comparativas entre grupos
- ❌ Filtros temporales
- ❌ Exportación a Excel/PDF

---

### FASE 3: Marcar Funciones Avanzadas (P2) - 1 día

**Objetivo:** Indicar claramente qué funciones son avanzadas (Fase 2/3)

#### 3.1. Botones/Secciones "Próximamente"

**Ejemplo en Reportes:**
```typescript
// TeacherReportsPage.tsx
<div className="reports-page">
  {/* Funcionalidad BÁSICA - Disponible */}
  <section>
    <h2>Reporte Simple de Progreso</h2>
    <Button onClick={generateBasicReport}>
      Generar Reporte Básico
    </Button>
  </section>

  {/* Funcionalidad AVANZADA - Fase 2/3 */}
  <section className="coming-soon">
    <h3>Reportes Avanzados 🚧</h3>
    <p>Disponible en próxima versión:</p>
    <ul>
      <li>Exportación a PDF/Excel</li>
      <li>Templates personalizables</li>
      <li>Múltiples formatos</li>
    </ul>
    <Badge>Fase 2</Badge>
  </section>
</div>
```

**Aplicar en:**
- Asignaciones: Marcar "Crear ejercicios custom" como Fase 2
- Analytics: Marcar gráficas avanzadas como Fase 2
- Contenido: Marcar "Editor de contenido" como Fase 2

---

## 📊 RESUMEN DE IMPLEMENTACIÓN

### Funcionalidades BÁSICAS a Implementar

| Funcionalidad | Componentes | Endpoints | Estimación |
|---------------|-------------|-----------|------------|
| **Sistema de Grupos** | Dashboard, Selector | GET /teacher/classrooms | 4-6 horas |
| **Ver Estudiantes** | Monitoreo, Reportes | GET /teacher/classrooms/:id/students | 2-3 horas |
| **Asignar Módulos** | Modal, Lista | POST /teacher/assignments | 8-12 horas |
| **Ver Progreso** | Tabla, Métricas | GET /teacher/classrooms/:id/progress | 4-6 horas |
| **Marcar Avanzadas** | Badges, Secciones | - | 2-4 horas |
| **TOTAL** | - | - | **20-31 horas (2.5-4 días)** |

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Funcionalidad Básica Completa:

- [ ] ✅ Teacher puede ver sus grupos/aulas
- [ ] ✅ Teacher puede ver estudiantes de cada grupo
- [ ] ✅ Teacher puede asignar módulos existentes a grupos
- [ ] ✅ Teacher puede ver progreso básico por grupo
- [ ] ✅ Teacher puede ver métricas simples (%, completitud)
- [ ] ✅ Teacher puede monitorear actividad básica
- [ ] ✅ Funciones avanzadas están claramente marcadas como "Fase 2/3"

### Sin Errores:

- [ ] ✅ No hay errores 404 en endpoints básicos
- [ ] ✅ No hay console errors
- [ ] ✅ RLS funciona correctamente (teacher solo ve sus datos)
- [ ] ✅ Navegación entre páginas funciona

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

### HOY (2025-11-24)
1. [ ] Aprobar este plan basado en Propuesta 2.2
2. [ ] Asignar Backend-Developer para Fase 1 (endpoints)
3. [ ] Asignar Frontend-Developer para Fase 2 (UI básica)

### MAÑANA (2025-11-25)
4. [ ] Implementar GET /teacher/classrooms
5. [ ] Implementar GET /teacher/classrooms/:id/students
6. [ ] Testing de endpoints

### PRÓXIMOS 3-4 DÍAS
7. [ ] Implementar asignación básica de módulos
8. [ ] Implementar vista de progreso básica
9. [ ] Marcar funciones avanzadas
10. [ ] Testing E2E completo

---

## 📋 DECISIÓN REQUERIDA

**¿Apruebas proceder con este plan de implementación de funcionalidades BÁSICAS?**

**Estimación Total:** 2.5-4 días de desarrollo
**Costo Estimado:** ~$8,000-12,000 MXN (según presupuesto)

---

**Generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 3.0.0
**Basado en:** Propuesta 2.2 - Módulo 2.2.1.5 (Administración y Escalabilidad)
