---
id: "US-ANA-001"
title: "Dashboard de Clase Basico"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-004"
story_points: 8
budget: "$4,000 MXN"
sprint: "Sprint-1"
labels: ["analytics", "dashboard", "teacher", "classroom"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
completed_date: "2025-08-18"
---

# US-ANA-001: Dashboard de Clase Básico

**Épica:** EAI-004 (Analytics Básico)
**Sprint:** Mes 1, Semana 3
**Story Points:** 8 SP
**Presupuesto:** $4,000 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como profesor, quiero visualizar un dashboard básico de mi clase para obtener un resumen rápido del estado general de mis estudiantes sin tener que revisar cada uno individualmente.

**Contexto del Alcance Inicial:**

Este dashboard proporciona las métricas fundamentales que un profesor necesita en su día a día: número de estudiantes, progreso promedio de la clase, y las últimas actividades registradas. Se enfoca en visualizaciones simples y directas, sin análisis avanzados, predicciones ML, o configurabilidad de métricas (eso va a EXT-005 Reportes Avanzados).

---

## Criterios de Aceptación

### CA-01: Métricas Generales de la Clase
- [ ] El dashboard muestra el número total de estudiantes en la clase
- [ ] Muestra el porcentaje de completitud promedio de la clase
- [ ] Muestra el nivel promedio de los estudiantes
- [ ] Muestra el XP total acumulado de la clase

### CA-02: Visualizaciones Básicas
- [ ] Gráfica de barras: distribución de estudiantes por nivel
- [ ] Gráfica de pie chart: porcentaje de módulos completados vs pendientes
- [ ] Gráfica de barras: progreso por módulo educativo
- [ ] Todas las gráficas se renderizan correctamente en desktop y mobile

### CA-03: Actividades Recientes
- [ ] Muestra las últimas 10 actividades de la clase
- [ ] Cada actividad muestra: estudiante, módulo, actividad, fecha/hora
- [ ] Las actividades están ordenadas de más reciente a más antigua
- [ ] Se actualiza automáticamente cada 5 minutos

### CA-04: Navegación Rápida
- [ ] Botón "Ver Todos los Estudiantes" que lleva a US-ANA-002
- [ ] Botón "Ver Reportes" que lleva a US-ANA-004
- [ ] Selector de clase (si el profesor tiene múltiples clases)

### CA-05: Performance y UX
- [ ] El dashboard carga en menos de 2 segundos
- [ ] Muestra skeleton loaders mientras carga los datos
- [ ] Maneja correctamente el caso de clase sin estudiantes
- [ ] Muestra mensajes amigables si no hay datos

---

## Especificaciones Técnicas

### Backend

**Endpoint Principal:**
```
GET /api/teacher/classroom/{classroomId}/dashboard
```

**Response:**
```json
{
  "classroomId": "uuid",
  "classroomName": "Matemáticas 6A",
  "metrics": {
    "totalStudents": 25,
    "averageProgress": 65.5,
    "averageLevel": 3,
    "totalXP": 12500
  },
  "levelDistribution": [
    {"level": 1, "count": 5},
    {"level": 2, "count": 8},
    {"level": 3, "count": 10},
    {"level": 4, "count": 2}
  ],
  "moduleCompletion": {
    "completed": 60,
    "inProgress": 30,
    "notStarted": 10
  },
  "moduleProgress": [
    {"moduleName": "Fracciones", "averageProgress": 75},
    {"moduleName": "Geometría", "averageProgress": 55},
    {"moduleName": "Álgebra", "averageProgress": 45}
  ],
  "recentActivities": [
    {
      "studentName": "Juan Pérez",
      "moduleName": "Fracciones",
      "activityName": "Suma de fracciones",
      "timestamp": "2025-11-02T10:30:00Z",
      "type": "completed"
    }
  ]
}
```

**Controller:**
```typescript
// TeacherAnalyticsController.ts
@Get('classroom/:classroomId/dashboard')
async getClassroomDashboard(
  @Param('classroomId') classroomId: string,
  @CurrentUser() teacher: User
) {
  return this.analyticsService.getClassroomDashboard(classroomId, teacher.id);
}
```

**Service:**
```typescript
// TeacherAnalyticsService.ts
async getClassroomDashboard(classroomId: string, teacherId: string) {
  // Validar que el profesor tiene acceso a la clase
  await this.validateTeacherAccess(classroomId, teacherId);

  // Obtener métricas generales
  const metrics = await this.calculateClassMetrics(classroomId);

  // Obtener distribución por nivel
  const levelDistribution = await this.getLevelDistribution(classroomId);

  // Obtener completitud de módulos
  const moduleCompletion = await this.getModuleCompletion(classroomId);

  // Obtener progreso por módulo
  const moduleProgress = await this.getModuleProgress(classroomId);

  // Obtener actividades recientes (últimas 10)
  const recentActivities = await this.getRecentActivities(classroomId, 10);

  return {
    classroomId,
    metrics,
    levelDistribution,
    moduleCompletion,
    moduleProgress,
    recentActivities
  };
}
```

### Frontend

**Ruta:**
```
/teacher/classroom/:classroomId/dashboard
```

**Componente Principal:**
```typescript
// ClassroomDashboard.tsx
export const ClassroomDashboard = () => {
  const { classroomId } = useParams();
  const { dashboardData, isLoading } = useClassroomDashboard(classroomId);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="dashboard-container">
      <MetricsCards metrics={dashboardData.metrics} />
      <ChartSection>
        <LevelDistributionChart data={dashboardData.levelDistribution} />
        <ModuleCompletionPieChart data={dashboardData.moduleCompletion} />
        <ModuleProgressBarChart data={dashboardData.moduleProgress} />
      </ChartSection>
      <RecentActivitiesList activities={dashboardData.recentActivities} />
      <QuickActions classroomId={classroomId} />
    </div>
  );
};
```

**Estado (Zustand):**
```typescript
// teacherAnalyticsStore.ts
interface TeacherAnalyticsStore {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboard: (classroomId: string) => Promise<void>;
  refreshDashboard: () => void;
}
```

**Librería de Gráficas:**
- **Recharts** para visualizaciones básicas (barras, pie chart)
- Colores consistentes con el tema de gamificación

---

## Diseño UI/UX

### Layout Desktop
```
+-----------------------------------------------------------+
|  Matemáticas 6A                    [Cambiar Clase ▼]     |
+-----------------------------------------------------------+
|  [Card]         [Card]         [Card]         [Card]     |
|  25 Estudiantes | 65% Progreso | Nivel 3 Prom | 12,500 XP|
+-----------------------------------------------------------+
|  [Gráfica Barras]          |  [Pie Chart]                |
|  Distribución por Nivel    |  Módulos Completados        |
+----------------------------+------------------------------+
|  [Gráfica Barras Horizontal]                             |
|  Progreso por Módulo                                      |
+-----------------------------------------------------------+
|  Actividad Reciente                    [Ver Todas →]     |
|  • Juan Pérez completó "Suma de fracciones" hace 5 min   |
|  • María López inició "Geometría básica" hace 10 min     |
|  ...                                                       |
+-----------------------------------------------------------+
|  [Ver Todos los Estudiantes]  [Ver Reportes Completos]  |
+-----------------------------------------------------------+
```

### Consideraciones Mobile
- Cards de métricas en grid 2x2
- Gráficas apiladas verticalmente
- Actividades recientes colapsables

---

## Alcance Básico vs Extensiones

### EAI-004 (Este alcance - Analytics Básico):
- ✅ Métricas básicas hardcodeadas (# estudiantes, progreso %, nivel, XP)
- ✅ Gráficas simples estáticas (barras, pie chart)
- ✅ Últimas 10 actividades (lista simple)
- ✅ Vista única, sin personalización
- ✅ Actualización automática cada 5 minutos

### EXT-005 (Extensión futura - Reportes Avanzados):
- ⏳ Dashboard configurable (elegir métricas a mostrar)
- ⏳ Gráficas interactivas con drill-down
- ⏳ Filtros avanzados (rango de fechas, comparativas)
- ⏳ Métricas de engagement (tiempo promedio, tasa de retención)
- ⏳ Exportación de dashboard a PDF/imagen
- ⏳ Comparativa entre clases
- ⏳ Tendencias y análisis predictivo con ML
- ⏳ Alertas configurables
- ⏳ Actualización en tiempo real (WebSockets)

---

## Dependencias

### Dependencias Técnicas:
- **Backend:** Sistema de autenticación de profesores (EAI-005)
- **Backend:** Modelo de datos de Classroom, Student, Module
- **Backend:** Sistema de tracking de actividades (EAI-002)
- **Backend:** Sistema de gamificación para XP y niveles (EAI-003)
- **Frontend:** Librería Recharts
- **Frontend:** teacherStore con autenticación

### Dependencias de User Stories:
- Ninguna crítica (puede desarrollarse en paralelo con otras US de analytics)

---

## Pruebas

### Pruebas Unitarias:
- [ ] `calculateClassMetrics` retorna métricas correctas
- [ ] `getLevelDistribution` agrupa estudiantes correctamente
- [ ] `getModuleCompletion` calcula porcentajes correctos
- [ ] `getRecentActivities` retorna solo las últimas 10 actividades

### Pruebas de Integración:
- [ ] Endpoint retorna 200 para profesor con acceso
- [ ] Endpoint retorna 403 para profesor sin acceso
- [ ] Endpoint retorna 404 para clase inexistente
- [ ] Dashboard se actualiza al cambiar de clase

### Pruebas E2E:
- [ ] Profesor ve dashboard con datos correctos
- [ ] Gráficas se renderizan correctamente
- [ ] Navegación a otras vistas funciona
- [ ] Selector de clase cambia el dashboard

---

## Notas de Implementación

1. **Performance:**
   - Cachear métricas por 5 minutos (Redis)
   - Query optimizado con joins limitados
   - Paginación en actividades recientes

2. **Escalabilidad:**
   - Cálculo de métricas puede moverse a background job si la clase es muy grande (>100 estudiantes)
   - Considerar pre-cálculo nocturno para clases grandes

3. **UX:**
   - Skeleton loaders para mejor percepción de velocidad
   - Error boundaries para manejar fallos de gráficas
   - Mensajes amigables para clases sin datos

4. **Accesibilidad:**
   - Gráficas con texto alternativo
   - Tablas de datos alternativas para lectores de pantalla
   - Contraste adecuado en colores de gráficas

---

## Estimación de Esfuerzo

**Backend:** 3 SP
- Endpoints y lógica de cálculo de métricas
- Queries optimizados

**Frontend:** 4 SP
- Componentes de dashboard
- Integración de Recharts
- Layout responsive

**Testing:** 1 SP
- Pruebas unitarias, integración, E2E

**Total:** 8 SP = $4,000 MXN

---

## Tareas de Implementación

### Backend (14.4h - 45%)

#### 1. Configuración de Módulo y Endpoints Base (2h)
- [ ] Crear módulo `TeacherAnalyticsModule` en NestJS
- [ ] Configurar guard `TeacherGuard` para validación de rol profesor
- [ ] Definir estructura de DTOs base para analytics
- [ ] Configurar importaciones de dependencias (TypeORM, JWT)

#### 2. Modelo de Datos y Repositorios (3h)
- [ ] Validar entidad `Classroom` con relaciones (students, modules)
- [ ] Validar entidad `Student` con campos de gamificación (level, xp)
- [ ] Validar entidad `Activity` y `Module` para tracking
- [ ] Crear repositorio custom si es necesario para agregaciones
- [ ] Configurar índices en base de datos para queries frecuentes

#### 3. Service de Cálculo de Métricas (4.5h)
- [ ] Implementar `calculateClassMetrics()`: totalStudents, averageProgress, averageLevel, totalXP
- [ ] Implementar `getLevelDistribution()`: contar estudiantes por nivel
- [ ] Implementar `getModuleCompletion()`: % de módulos completados/en progreso/no iniciados
- [ ] Implementar `getModuleProgress()`: progreso promedio por módulo
- [ ] Implementar `getRecentActivities()`: últimas 10 actividades ordenadas
- [ ] Optimizar queries con joins y agregaciones SQL

#### 4. Controller y Endpoint Principal (2.4h)
- [ ] Implementar `GET /api/teacher/classroom/{classroomId}/dashboard`
- [ ] Implementar validación de parámetros (classroomId UUID)
- [ ] Implementar `validateTeacherAccess()`: verificar que profesor tiene acceso al aula
- [ ] Manejar errores 403 (sin acceso), 404 (aula no existe)
- [ ] Documentar endpoint con Swagger/OpenAPI

#### 5. Caché y Optimización (1.6h)
- [ ] Implementar caché Redis con TTL de 5 minutos para métricas
- [ ] Configurar invalidación de caché al actualizar datos
- [ ] Implementar query pagination para actividades recientes
- [ ] Optimizar consultas con `select` específicos (evitar over-fetching)

#### 6. Testing Backend (0.9h)
- [ ] Unit tests para `calculateClassMetrics()`
- [ ] Unit tests para `getLevelDistribution()`
- [ ] Integration tests para endpoint 200, 403, 404
- [ ] Test de performance para clases con >50 estudiantes

### Frontend (11.2h - 35%)

#### 1. Setup de Estado y API Client (2h)
- [ ] Crear `teacherAnalyticsStore` con Zustand (dashboardData, isLoading, error)
- [ ] Implementar `teacherAnalyticsApi.getDashboard()` con axios
- [ ] Configurar interceptores para autenticación (Bearer token)
- [ ] Implementar manejo de errores global

#### 2. Componente Principal Dashboard (2.5h)
- [ ] Crear componente `ClassroomDashboard.tsx`
- [ ] Implementar hook `useClassroomDashboard()` con auto-fetch
- [ ] Implementar skeleton loader `DashboardSkeleton`
- [ ] Configurar layout responsive (desktop/mobile)
- [ ] Implementar breadcrumb y navegación

#### 3. Componentes de Métricas (2h)
- [ ] Crear componente `MetricsCards` con 4 cards (estudiantes, progreso, nivel, XP)
- [ ] Implementar `StatCard` reutilizable con icono y valor
- [ ] Aplicar estilos Tailwind para grid responsive
- [ ] Implementar iconos (UsersIcon, ProgressIcon, LevelIcon, XPIcon)

#### 4. Componentes de Gráficas (3h)
- [ ] Instalar y configurar librería Recharts
- [ ] Crear `LevelDistributionChart` (BarChart) con datos de niveles
- [ ] Crear `ModuleCompletionPieChart` con 3 segmentos (completado/progreso/no iniciado)
- [ ] Crear `ModuleProgressBarChart` (BarChart horizontal) con progreso por módulo
- [ ] Aplicar tema de colores consistente (verde/amarillo/rojo)
- [ ] Hacer gráficas responsive (ajuste de tamaño)

#### 5. Componente de Actividades Recientes (1h)
- [ ] Crear `RecentActivitiesList` con scroll vertical
- [ ] Implementar `ActivityItem` con avatar, nombre, módulo, timestamp
- [ ] Formatear timestamp a relativo ("hace 5 min")
- [ ] Implementar empty state si no hay actividades

#### 6. Auto-refresh y UX (0.7h)
- [ ] Implementar auto-refresh cada 5 minutos con `setInterval`
- [ ] Agregar indicador de última actualización
- [ ] Implementar botón manual de refresh
- [ ] Agregar transiciones suaves con Tailwind

### Testing (4.8h - 15%)

#### 1. Testing Unitario (2h)
- [ ] Tests de componentes aislados con React Testing Library
- [ ] Tests de custom hooks (useClassroomDashboard)
- [ ] Tests de formateo de datos (formatRelativeTime, etc.)
- [ ] Tests de edge cases (clase sin estudiantes, sin datos)

#### 2. Testing de Integración (1.5h)
- [ ] Test E2E: Profesor ve dashboard con datos correctos
- [ ] Test E2E: Gráficas se renderizan correctamente
- [ ] Test E2E: Navegación a otras vistas funciona
- [ ] Test E2E: Auto-refresh actualiza datos

#### 3. Testing de Performance (0.8h)
- [ ] Test de carga de dashboard <2s
- [ ] Test de renderizado de gráficas con datasets grandes
- [ ] Test de memory leaks en auto-refresh

#### 4. Testing de Accesibilidad (0.5h)
- [ ] Tests de contraste de colores
- [ ] Tests de navegación por teclado
- [ ] Tests de screen reader (aria-labels)

### Deployment (1.6h - 5%)

#### 1. Preparación de Build (0.8h)
- [ ] Configurar variables de entorno (API_URL, CACHE_TTL)
- [ ] Build de producción (npm run build)
- [ ] Verificar bundle size (<500KB para dashboard)
- [ ] Configurar lazy loading de Recharts

#### 2. Deploy y Smoke Tests (0.8h)
- [ ] Deploy a ambiente de staging
- [ ] Smoke test: dashboard carga correctamente
- [ ] Smoke test: métricas son correctas
- [ ] Verificar logs y errores
- [ ] Tag de versión en Git

---

**Total Horas:** 32h
**Distribución Real:** Backend 45% | Frontend 35% | Testing 15% | Deploy 5%
