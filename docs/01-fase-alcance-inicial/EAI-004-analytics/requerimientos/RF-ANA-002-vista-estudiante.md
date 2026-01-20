---
id: "RF-ANA-002"
title: "Vista de Estudiante Individual y Reportes de Progreso"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Analytics"
epic: "EAI-004"
version: "1.0"
labels: ["analytics", "student-profile", "teacher-view", "reports", "progress"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# RF-ANA-002: Vista de Estudiante Individual y Reportes de Progreso

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-ANA-002 |
| **Modulo** | Analytics |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha creacion** | 2026-01-20 |
| **Ultima actualizacion** | 2026-01-20 |

## Referencias

### Especificacion Tecnica
- [ET-ANA-002: Vista de Estudiante](../especificaciones/ET-ANA-002-vista-estudiante.md)

### User Stories Relacionadas
- [US-ANA-003: Vista de Estudiante Individual](../historias-usuario/US-ANA-003-vista-estudiante-individual.md)
- [US-ANA-004: Reporte Basico de Progreso](../historias-usuario/US-ANA-004-reporte-basico-progreso.md)

### Implementacion
- **Backend:** `apps/backend/src/modules/teacher-analytics/`
- **Frontend:** `apps/frontend/src/pages/teacher/student/`
- **Database:** Schema `progress_tracking`

---

## Descripcion del Requerimiento

### Contexto

Los profesores necesitan:
1. Ver el detalle completo del progreso de un estudiante individual
2. Generar reportes de progreso de la clase para seguimiento y comunicacion

Este requerimiento aborda estas dos necesidades complementarias que permiten al profesor entender el estado detallado de cada estudiante y de la clase en general.

### Necesidad del Negocio

**Problema:**
Sin estas funcionalidades:
- Profesores no pueden ver el detalle de progreso por modulo de cada estudiante
- No hay forma de exportar datos para reportes externos
- Dificil hacer seguimiento individual del estudiante
- No se puede medir tiempo invertido en la plataforma

**Solucion:**
Implementar una vista detallada del perfil del estudiante con todas sus metricas, y un sistema de reportes basico con exportacion CSV.

---

## Requerimiento Funcional

### RF-ANA-002.1: Vista de Estudiante Individual

El sistema **DEBE** proporcionar una vista de perfil que muestre:

#### Informacion del Estudiante
| Campo | Descripcion |
|-------|-------------|
| Avatar/Foto | Imagen del estudiante |
| Nombre completo | Nombre del estudiante |
| Nivel actual | Con icono de insignia |
| XP total | XP acumulado |
| Progreso general | % completitud |
| Ultima actividad | Fecha de ultima actividad |

#### Progreso por Modulo
Para cada modulo asignado a la clase:
- Nombre del modulo
- Porcentaje de completitud
- Numero de actividades completadas / total
- Estado visual (completado, en progreso, no iniciado)
- Barra de progreso visual

#### Actividades Completadas
- Lista de ultimas 20 actividades completadas
- Para cada actividad:
  - Nombre de la actividad
  - Modulo al que pertenece
  - Fecha y hora de completado
  - Puntaje/resultado (si aplica)
- Ordenadas de mas reciente a mas antigua

#### Metricas de Tiempo
| Metrica | Descripcion |
|---------|-------------|
| Tiempo total | Tiempo invertido en la plataforma |
| Promedio por sesion | Duracion promedio de sesiones |
| Total sesiones | Numero de sesiones |
| Ultima sesion | Fecha y duracion de ultima sesion |

#### Navegacion
- Breadcrumb: Dashboard > Estudiantes > [Nombre]
- Boton "Volver a Estudiantes"
- Flechas para navegar al siguiente/anterior estudiante

---

### RF-ANA-002.2: Reporte Basico de Progreso de Clase

El sistema **DEBE** proporcionar un reporte que muestre:

#### Vista de Reporte
Tabla con todos los modulos asignados a la clase:
| Columna | Descripcion |
|---------|-------------|
| Modulo | Nombre del modulo |
| Completados | # estudiantes que completaron |
| En Progreso | # estudiantes en progreso |
| No Iniciados | # estudiantes que no iniciaron |
| % Promedio | Promedio de completitud |
| Progreso | Barra visual |

#### Resumen General
- Total de estudiantes en la clase
- Total de modulos asignados
- Progreso general de la clase (%)
- # estudiantes con todo completado
- # estudiantes con modulos pendientes

#### Exportacion a CSV
- Boton "Exportar a CSV"
- Archivo CSV contiene:
  - Header con informacion de la clase
  - Columnas: Modulo, Completados, En Progreso, No Iniciados, % Promedio
  - Nombre de archivo: `reporte-{clase}-{fecha}.csv`
- Descarga automatica del archivo

---

### RF-ANA-002.3: Estados y Colores

#### Estados de Modulo por Estudiante
| Estado | Condicion | Color |
|--------|-----------|-------|
| Completado | 100% completitud | Verde |
| En Progreso | 1-99% completitud | Amarillo |
| No Iniciado | 0% completitud | Gris |

---

## Casos de Uso

### UC-ANA-003: Profesor ve perfil de estudiante

**Actor:** Profesor
**Precondiciones:** Profesor autenticado, navegando desde tabla de estudiantes

**Flujo:**
1. Profesor hace click en estudiante desde tabla
2. Sistema navega a `/teacher/student/{studentId}?classroomId={classroomId}`
3. Sistema valida que profesor tiene acceso al estudiante
4. Sistema carga perfil del estudiante
5. Sistema muestra progreso por modulo
6. Sistema muestra actividades recientes
7. Sistema muestra metricas de tiempo

**Resultado:** Profesor ve detalle completo del progreso del estudiante

---

### UC-ANA-004: Profesor genera reporte de clase

**Actor:** Profesor
**Precondiciones:** Profesor autenticado con clase asignada

**Flujo:**
1. Profesor accede a `/teacher/classroom/{classroomId}/reports`
2. Sistema carga reporte de progreso
3. Sistema muestra resumen general
4. Sistema muestra tabla de progreso por modulo
5. Profesor hace click en "Exportar a CSV"
6. Sistema genera archivo CSV
7. Sistema inicia descarga automatica

**Resultado:** Profesor obtiene reporte exportable del progreso de su clase

---

## Criterios de Aceptacion

### AC-001: Informacion del Estudiante
- [x] Vista muestra avatar/foto del estudiante
- [x] Vista muestra nombre completo
- [x] Vista muestra nivel con icono
- [x] Vista muestra XP total
- [x] Vista muestra progreso general
- [x] Vista muestra fecha de ultima actividad

### AC-002: Progreso por Modulo
- [x] Lista de todos los modulos asignados visible
- [x] Cada modulo muestra porcentaje de completitud
- [x] Cada modulo muestra actividades completadas/total
- [x] Estados visuales correctos (completado/progreso/no iniciado)
- [x] Barras de progreso visibles

### AC-003: Actividades Completadas
- [x] Lista de ultimas 20 actividades visible
- [x] Cada actividad muestra nombre, modulo, fecha, puntaje
- [x] Ordenadas de mas reciente a mas antigua
- [x] Mensaje si no hay actividades

### AC-004: Metricas de Tiempo
- [x] Tiempo total invertido visible
- [x] Promedio por sesion visible
- [x] Total de sesiones visible
- [x] Ultima sesion visible

### AC-005: Reporte de Clase
- [x] Resumen general muestra totales correctos
- [x] Tabla muestra todos los modulos
- [x] Columnas de completados/progreso/no iniciados correctas
- [x] Promedio calculado correctamente

### AC-006: Exportacion CSV
- [x] Boton de exportar visible
- [x] CSV se genera correctamente
- [x] CSV contiene header con info de clase
- [x] CSV contiene datos de todos los modulos
- [x] Descarga automatica funciona

### AC-007: Navegacion
- [x] Breadcrumb funciona correctamente
- [x] Boton volver regresa a lista
- [x] Flechas anterior/siguiente funcionan

---

## Especificaciones Tecnicas

### Backend

**Endpoints:**
```
GET /api/teacher/student/{studentId}/profile?classroomId={classroomId}
GET /api/teacher/classroom/{classroomId}/progress-report
GET /api/teacher/classroom/{classroomId}/progress-report/export
```

**Response Vista Estudiante:**
```json
{
  "studentId": "uuid",
  "classroomId": "uuid",
  "profile": {
    "name": "string",
    "avatarUrl": "string",
    "level": "number",
    "xp": "number",
    "overallProgress": "number",
    "lastActivity": "timestamp"
  },
  "moduleProgress": [
    {
      "moduleId": "uuid",
      "moduleName": "string",
      "progress": "number",
      "completedActivities": "number",
      "totalActivities": "number",
      "status": "completed|in_progress|not_started"
    }
  ],
  "recentActivities": [],
  "timeMetrics": {}
}
```

### Frontend

**Rutas:**
```
/teacher/student/:studentId?classroomId=:classroomId
/teacher/classroom/:classroomId/reports
```

**Componentes:**
- `StudentProfileView.tsx`
- `ProfileHeader.tsx`
- `ModuleProgressSection.tsx`
- `ModuleProgressCard.tsx`
- `TimeMetricsSection.tsx`
- `RecentActivitiesSection.tsx`
- `ActivityTimeline.tsx`
- `ProgressReportView.tsx`
- `SummarySection.tsx`
- `ModuleProgressTable.tsx`

### Database

**Schema:** `progress_tracking`
**Tablas relevantes:**
- `student_progress` - Progreso por estudiante
- `module_progress` - Progreso por modulo
- `activity_completions` - Actividades completadas
- `session_logs` - Sesiones de usuario

---

## Alcance Basico vs Extensiones

### EAI-004 (Este alcance - Analytics Basico):
- Vista de perfil basico con metricas actuales
- Progreso por modulo (% y actividades)
- Lista de actividades completadas (ultimas 20)
- Metricas de tiempo basicas
- Vista de solo lectura
- Exportacion solo a CSV

### EXT-005 (Extension futura - Reportes Avanzados):
- Graficas de tendencia (progreso a lo largo del tiempo)
- Comparacion con promedio de la clase
- Analisis de desempeno por tipo de actividad
- Prediccion de completitud (ML)
- Alertas personalizadas
- Exportacion a PDF y Excel
- Historial completo de actividades
- Analisis de patrones de aprendizaje
- Recomendaciones personalizadas

---

## Testing

### Pruebas Unitarias
- [ ] `getStudentModuleProgress` calcula progreso correcto por modulo
- [ ] `getModuleStatus` retorna estado correcto segun %
- [ ] `formatDuration` formatea segundos correctamente
- [ ] `calculateModuleProgressStats` cuenta estudiantes correctamente
- [ ] Generacion de CSV produce formato valido

### Pruebas de Integracion
- [ ] Endpoint perfil retorna datos completos del estudiante
- [ ] Endpoint valida acceso del profesor
- [ ] Endpoint reporte retorna datos correctos
- [ ] Endpoint exportacion retorna CSV valido
- [ ] Headers de respuesta son correctos

### Pruebas E2E
- [ ] Profesor ve perfil completo del estudiante
- [ ] Progreso por modulo muestra datos correctos
- [ ] Actividades recientes se muestran en orden
- [ ] Navegacion anterior/siguiente funciona
- [ ] Boton de exportar descarga archivo CSV
- [ ] CSV contiene datos correctos

---

## Estimacion de Esfuerzo

| Area | Story Points | Horas Estimadas |
|------|--------------|-----------------|
| Backend Perfil | 3 SP | 14h |
| Backend Reporte | 2 SP | 10h |
| Frontend Perfil | 4 SP | 18h |
| Frontend Reporte | 3 SP | 12h |
| Testing | 2 SP | 6h |
| **Total** | **14 SP** | **60h** |

**Presupuesto:** $7,000 MXN (US-ANA-003: $4,000 + US-ANA-004: $3,000)

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Analyst | Creacion inicial del requerimiento formal |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-004-analytics/requerimientos/RF-ANA-002-vista-estudiante.md`
