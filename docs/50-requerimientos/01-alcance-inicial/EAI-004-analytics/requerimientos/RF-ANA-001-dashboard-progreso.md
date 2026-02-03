---
id: "RF-ANA-001"
title: "Dashboard de Progreso y Metricas de Clase"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Analytics"
epic: "EAI-004"
version: "1.0"
labels: ["analytics", "dashboard", "teacher", "classroom", "metrics", "progress"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# RF-ANA-001: Dashboard de Progreso y Metricas de Clase

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-ANA-001 |
| **Modulo** | Analytics |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha creacion** | 2026-01-20 |
| **Ultima actualizacion** | 2026-01-20 |

## Referencias

### Especificacion Tecnica
- [ET-ANA-001: Dashboard de Progreso](../especificaciones/ET-ANA-001-dashboard-progreso.md)

### User Stories Relacionadas
- [US-ANA-001: Dashboard de Clase Basico](../historias-usuario/US-ANA-001-dashboard-clase-basico.md)
- [US-ANA-002: Tabla de Estudiantes con Metricas](../historias-usuario/US-ANA-002-tabla-estudiantes-metricas.md)

### Implementacion
- **Backend:** `apps/backend/src/modules/teacher-analytics/`
- **Frontend:** `apps/frontend/src/pages/teacher/classroom/`
- **Database:** Schema `progress_tracking`

---

## Descripcion del Requerimiento

### Contexto

Los profesores necesitan una herramienta que les permita monitorear el progreso de su clase de manera rapida y efectiva. Este requerimiento aborda la necesidad de tener:

1. Un dashboard con metricas generales de la clase
2. Una tabla detallada de estudiantes con sus metricas individuales

### Necesidad del Negocio

**Problema:**
Sin un dashboard de analytics:
- Profesores deben revisar estudiante por estudiante manualmente
- No hay vision consolidada del estado de la clase
- Dificil identificar rapidamente el progreso promedio
- No hay forma de ver las ultimas actividades de la clase

**Solucion:**
Implementar un dashboard que muestre metricas clave de la clase y una tabla de estudiantes con indicadores visuales de progreso, permitiendo al profesor tener una vision completa del estado de su grupo.

---

## Requerimiento Funcional

### RF-ANA-001.1: Dashboard de Clase con Metricas Generales

El sistema **DEBE** proporcionar un dashboard que muestre:

#### Metricas Principales
- Total de estudiantes en la clase
- Porcentaje de completitud promedio de la clase
- Nivel promedio de los estudiantes
- XP total acumulado de la clase

#### Visualizaciones Basicas
- Grafica de barras: distribucion de estudiantes por nivel
- Grafica de pie chart: porcentaje de modulos completados vs pendientes
- Grafica de barras: progreso por modulo educativo

#### Actividades Recientes
- Lista de ultimas 10 actividades de la clase
- Cada actividad muestra: estudiante, modulo, actividad, fecha/hora
- Ordenadas de mas reciente a mas antigua
- Actualizacion automatica cada 5 minutos

#### Navegacion
- Boton "Ver Todos los Estudiantes" que lleva a tabla de estudiantes
- Boton "Ver Reportes" que lleva a reportes de progreso
- Selector de clase (si el profesor tiene multiples clases)

---

### RF-ANA-001.2: Tabla de Estudiantes con Metricas

El sistema **DEBE** proporcionar una tabla que muestre:

#### Columnas de la Tabla
| Columna | Descripcion |
|---------|-------------|
| Avatar/Foto | Imagen del estudiante |
| Nombre | Nombre completo del estudiante |
| Progreso | % completitud con barra visual |
| Nivel | Nivel actual con icono de insignia |
| XP | XP acumulado |
| Ultima Actividad | Fecha/hora relativa |
| Acciones | Boton "Ver Detalle" |

#### Funcionalidades
- **Ordenamiento:** Click en header ordena ascendente/descendente
- **Busqueda:** Campo de busqueda por nombre (debounce 300ms)
- **Paginacion:** Hasta 50 estudiantes por pagina

#### Indicadores Visuales
| Condicion | Color |
|-----------|-------|
| Progreso <30% | Rojo |
| Progreso 30-70% | Amarillo |
| Progreso >70% | Verde |
| Sin actividad >7 dias | Fecha en rojo |
| Sin actividad 3-7 dias | Fecha en amarillo |
| Actividad <3 dias | Fecha en verde |

---

### RF-ANA-001.3: Performance y UX

El sistema **DEBE** cumplir con:

- Dashboard carga en menos de 2 segundos
- Tabla carga en menos de 1 segundo para clases hasta 100 estudiantes
- Skeleton loaders mientras carga datos
- Mensajes amigables si no hay datos
- Responsive: funciona en desktop y mobile

---

## Casos de Uso

### UC-ANA-001: Profesor visualiza dashboard de clase

**Actor:** Profesor
**Precondiciones:** Profesor autenticado con clase asignada

**Flujo:**
1. Profesor accede a "/teacher/classroom/{classroomId}/dashboard"
2. Sistema valida que profesor tiene acceso a la clase
3. Sistema carga metricas generales
4. Sistema renderiza graficas de distribucion
5. Sistema muestra ultimas 10 actividades
6. Profesor puede navegar a tabla de estudiantes

**Resultado:** Profesor ve resumen completo del estado de su clase

---

### UC-ANA-002: Profesor busca estudiante en tabla

**Actor:** Profesor
**Precondiciones:** Profesor en vista de tabla de estudiantes

**Flujo:**
1. Profesor escribe nombre en campo de busqueda
2. Sistema aplica debounce de 300ms
3. Sistema filtra estudiantes por nombre (case-insensitive)
4. Tabla muestra resultados filtrados
5. Profesor puede hacer click en estudiante para ver detalle

**Resultado:** Profesor encuentra rapidamente al estudiante buscado

---

## Criterios de Aceptacion

### AC-001: Metricas de Dashboard
- [x] Dashboard muestra numero total de estudiantes
- [x] Dashboard muestra progreso promedio de la clase
- [x] Dashboard muestra nivel promedio
- [x] Dashboard muestra XP total acumulado

### AC-002: Graficas
- [x] Grafica de distribucion por nivel se renderiza correctamente
- [x] Pie chart de modulos completados funciona
- [x] Grafica de progreso por modulo es visible
- [x] Todas las graficas son responsivas

### AC-003: Actividades Recientes
- [x] Lista muestra ultimas 10 actividades
- [x] Cada item muestra estudiante, modulo, actividad, timestamp
- [x] Ordenadas de mas reciente a mas antigua
- [x] Auto-refresh cada 5 minutos

### AC-004: Tabla de Estudiantes
- [x] Tabla muestra todas las columnas definidas
- [x] Ordenamiento por columna funciona
- [x] Busqueda por nombre funciona
- [x] Paginacion funciona correctamente

### AC-005: Indicadores Visuales
- [x] Colores de progreso se aplican correctamente
- [x] Colores de ultima actividad se aplican correctamente
- [x] Iconos de nivel visibles

### AC-006: Performance
- [x] Dashboard carga en <2 segundos
- [x] Tabla carga en <1 segundo
- [x] Skeleton loaders visibles durante carga

---

## Especificaciones Tecnicas

### Backend

**Endpoints:**
```
GET /api/teacher/classroom/{classroomId}/dashboard
GET /api/teacher/classroom/{classroomId}/students?page=1&limit=50&sortBy=name&order=asc&search=
```

**Modulo:** `TeacherAnalyticsModule`
**Services:** `TeacherAnalyticsService`
**Guards:** `TeacherGuard`

### Frontend

**Rutas:**
```
/teacher/classroom/:classroomId/dashboard
/teacher/classroom/:classroomId/students
```

**Componentes:**
- `ClassroomDashboard.tsx`
- `MetricsCards.tsx`
- `LevelDistributionChart.tsx`
- `ModuleCompletionPieChart.tsx`
- `ModuleProgressBarChart.tsx`
- `RecentActivitiesList.tsx`
- `StudentListTable.tsx`
- `StudentRow.tsx`

**Libreria de Graficas:** Recharts

### Database

**Schema:** `progress_tracking`
**Tablas relevantes:**
- `classroom` - Informacion de clases
- `student_progress` - Progreso de estudiantes
- `activity_logs` - Registro de actividades

---

## Alcance Basico vs Extensiones

### EAI-004 (Este alcance - Analytics Basico):
- Metricas basicas hardcodeadas
- Graficas simples estaticas
- Ultimas 10 actividades
- Vista unica, sin personalizacion
- Actualizacion cada 5 minutos

### EXT-005 (Extension futura - Reportes Avanzados):
- Dashboard configurable
- Graficas interactivas con drill-down
- Filtros avanzados (rango de fechas, comparativas)
- Metricas de engagement
- Exportacion de dashboard
- Comparativa entre clases
- Tendencias y analisis predictivo con ML
- Actualizacion en tiempo real (WebSockets)

---

## Testing

### Pruebas Unitarias
- [ ] `calculateClassMetrics` retorna metricas correctas
- [ ] `getLevelDistribution` agrupa estudiantes correctamente
- [ ] `getModuleCompletion` calcula porcentajes correctos
- [ ] `getRecentActivities` retorna solo las ultimas 10

### Pruebas de Integracion
- [ ] Endpoint dashboard retorna 200 para profesor con acceso
- [ ] Endpoint retorna 403 para profesor sin acceso
- [ ] Endpoint retorna 404 para clase inexistente
- [ ] Tabla se actualiza al cambiar parametros de busqueda

### Pruebas E2E
- [ ] Profesor ve dashboard con datos correctos
- [ ] Graficas se renderizan correctamente
- [ ] Navegacion a tabla de estudiantes funciona
- [ ] Busqueda en tabla funciona en tiempo real

---

## Estimacion de Esfuerzo

| Area | Story Points | Horas Estimadas |
|------|--------------|-----------------|
| Backend Dashboard | 3 SP | 14.4h |
| Backend Tabla | 2 SP | 12.6h |
| Frontend Dashboard | 4 SP | 11.2h |
| Frontend Tabla | 4 SP | 9.8h |
| Testing | 2 SP | 9h |
| **Total** | **15 SP** | **57h** |

**Presupuesto:** $7,400 MXN (US-ANA-001: $4,000 + US-ANA-002: $3,400)

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Analyst | Creacion inicial del requerimiento formal |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-004-analytics/requerimientos/RF-ANA-001-dashboard-progreso.md`
