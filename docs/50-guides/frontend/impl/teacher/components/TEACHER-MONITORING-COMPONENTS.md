---
titulo: Componentes de Monitoreo Teacher Portal
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# Componentes de Monitoreo - Teacher Portal

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Modulo:** Teacher Portal - Sistema de Monitoreo de Estudiantes

---

## ESTRUCTURA

```
apps/frontend/src/apps/teacher/components/monitoring/
├── StudentStatusCard.tsx        # Card estado individual
├── StudentDetailModal.tsx       # Modal detalles completos
├── StudentPagination.tsx        # Paginacion server-side
└── StudentMonitoringPanel.tsx   # Dashboard principal
```

---

## 1. StudentStatusCard

**Ubicacion:** `components/monitoring/StudentStatusCard.tsx`

### Proposito

Card visual que muestra el estado en tiempo real de un estudiante individual con indicadores visuales mejorados.

### Props

```typescript
interface StudentStatusCardProps {
  student: StudentMonitoring;
  onClick?: () => void;
}
```

### Datos Mostrados

| Dato | Descripcion |
|------|-------------|
| Nombre y email | Identificacion del estudiante |
| Estado | Activo, En ejercicio, Inactivo, Desconectado |
| Modulo actual | Nombre del modulo en progreso |
| Ejercicio actual | Nombre del ejercicio (si aplica) |
| Ejercicios completados | Total de ejercicios terminados |
| Score promedio | Porcentaje de rendimiento |
| Tiempo invertido | Horas dedicadas al estudio |
| Barra de progreso | Progreso general visual |
| Ultima actividad | Timestamp formateado |

### Logica de Estado

```typescript
function getStudentStatus(student: StudentMonitoring): Status {
  const lastActivity = new Date(student.lastActivityAt);
  const now = new Date();
  const minutesSinceActivity = (now - lastActivity) / 60000;

  if (minutesSinceActivity < 5) {
    if (student.currentExercise) return 'En ejercicio';
    return 'Activo';
  }
  if (minutesSinceActivity < 30) return 'Inactivo';
  return 'Desconectado';
}
```

### Indicadores Visuales

| Estado | Color | Icono |
|--------|-------|-------|
| Activo | Verde | Circle filled |
| En ejercicio | Azul | Play |
| Inactivo | Amarillo | Circle outline |
| Desconectado | Gris | Circle dashed |

---

## 2. StudentDetailModal

**Ubicacion:** `components/monitoring/StudentDetailModal.tsx`

### Proposito

Modal exhaustivo que muestra informacion detallada del estudiante con datos academicos, gamificacion y notas privadas.

### Props

```typescript
interface StudentDetailModalProps {
  student: StudentMonitoring;
  onClose: () => void;
  classroomId?: string;
}
```

### Secciones

#### 1. Stats Overview (4 cards)

| Card | Dato | Icono |
|------|------|-------|
| Progreso general | % | TrendingUp |
| Score promedio | % | Target |
| Ejercicios completados | # | CheckCircle |
| Tiempo total | horas | Clock |

#### 2. Estadisticas de Gamificacion (collapsible)

- Racha actual y maxima
- Tasa de primer intento
- Power-ups utilizados
- Pistas usadas
- Total de sesiones

#### 3. Progreso por Modulo (collapsible)

- Lista de modulos con porcentaje
- Ejercicios por modulo
- Barra de progreso visual

#### 4. Actividad Actual

- Modulo en progreso
- Ejercicio especifico
- Ultima actividad con timestamp

#### 5. Notas del Profesor (collapsible)

- Textarea para crear nuevas notas
- Lista de notas anteriores con fechas
- Acciones: Guardar, Eliminar

### Acciones Disponibles

- Ver Alertas del estudiante
- Ver Respuestas del estudiante
- Crear/Editar notas privadas

---

## 3. StudentPagination

**Ubicacion:** `components/monitoring/StudentPagination.tsx`

### Proposito

Componente reutilizable de paginacion server-side para listas largas de estudiantes.

### Props

```typescript
interface StudentPaginationProps {
  page: number;           // Pagina actual (1-indexed)
  limit: number;          // Items por pagina
  total: number;          // Total de registros
  totalPages: number;     // Total de paginas
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}
```

### Funcionalidades

- Selector de limites: [10, 25, 50, 100]
- Botones anterior/siguiente
- Numeros de pagina con ellipsis (max 7 botones)
- Informacion de rango: "Mostrando 1-25 de 150"
- Estados deshabilitados para primera/ultima pagina

### Ejemplo de Uso

```typescript
<StudentPagination
  page={pagination.page}
  limit={pagination.limit}
  total={pagination.total}
  totalPages={pagination.totalPages}
  hasNextPage={pagination.hasNextPage}
  hasPreviousPage={pagination.hasPreviousPage}
  loading={isLoading}
  onPageChange={handlePageChange}
  onLimitChange={handleLimitChange}
/>
```

---

## 4. StudentMonitoringPanel

**Ubicacion:** `components/monitoring/StudentMonitoringPanel.tsx`

### Proposito

Dashboard completo de monitoreo en tiempo real de estudiantes con filtros avanzados y multiples vistas.

### Props

```typescript
interface StudentMonitoringPanelProps {
  classroomId: string;
}
```

### Caracteristicas

#### Stats Overview (8 cards)

**Distribucion por Estado:**
- Total estudiantes
- Activos
- En ejercicio
- Inactivos
- Desconectados

**Distribucion por Rendimiento:**
- Alto rendimiento (>80%)
- Rendimiento medio (50-80%)
- Bajo rendimiento (<50%)

#### Sistema de Filtros

| Filtro | Tipo | Opciones |
|--------|------|----------|
| Busqueda | text | Por nombre (debounced 300ms) |
| Estado | chips | Activos, Inactivos, Offline |
| Rendimiento | chips | Alto, Medio, Bajo |

#### Vistas Duales

**Vista Grid:**
- StudentStatusCard en 3 columnas responsive
- Click abre StudentDetailModal

**Vista Tabla:**
- Columnas: Nombre, Estado, Score, Completitud, Rendimiento, Ultima actividad
- Sorteable por columnas
- Click en fila abre modal

#### Controles

- Selector vista (cards/tabla)
- RefreshControl con intervalos (15s, 30s, 60s, manual)
- Boton refrescar con timestamp

### Integracion con Hook

```typescript
const {
  students,
  pagination,
  isLoading,
  fetchStudents,
  nextPage,
  prevPage
} = useStudentMonitoring(classroomId);
```

---

## TIPOS PRINCIPALES

### StudentMonitoring

```typescript
interface StudentMonitoring {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;

  // Estado actual
  currentModule?: string;
  currentModuleName?: string;
  currentExercise?: string;
  currentExerciseName?: string;
  lastActivityAt: string;

  // Estadisticas
  exercisesCompleted: number;
  totalExercises: number;
  averageScore: number;
  progressPercentage: number;
  timeSpentMinutes: number;

  // Gamificacion
  currentStreak: number;
  maxStreak: number;
  firstAttemptRate: number;
  powerUpsUsed: number;
  hintsUsed: number;
  totalSessions: number;

  // Progreso por modulo
  moduleProgress: ModuleProgress[];
}

interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  completedExercises: number;
  totalExercises: number;
  progressPercentage: number;
}
```

---

## DIAGRAMA DE COMPONENTES

```
┌─────────────────────────────────────────────────────────┐
│              StudentMonitoringPanel                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │                 Stats Overview                   │   │
│  │  [Total] [Activos] [Ejercicio] [Inactivos] ...  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                   Filtros                        │   │
│  │  [Buscar...] [Estado] [Rendimiento] [Vista]     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Grid / Table View                      │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐     │   │
│  │  │StatusCard │ │StatusCard │ │StatusCard │     │   │
│  │  └───────────┘ └───────────┘ └───────────┘     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              StudentPagination                   │   │
│  │  [< Prev]  1 2 3 ... 10  [Next >]  [Limit: 25] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────┐          │
│  │         StudentDetailModal (overlay)      │          │
│  │  [Stats] [Gamificacion] [Modulos] [Notas]│          │
│  └──────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

## PAGINAS QUE USAN ESTOS COMPONENTES

| Pagina | Componentes Usados |
|--------|-------------------|
| TeacherMonitoringPage | StudentMonitoringPanel |
| TeacherDashboard | StudentMonitoringPanel (tab) |

---

## REFERENCIAS

- `useStudentMonitoring.ts` - Hook de datos
- `studentProgressApi.ts` - Cliente API
- `TeacherMonitoringPage.tsx` - Pagina principal

---

**Ultima actualizacion:** 2025-12-18
