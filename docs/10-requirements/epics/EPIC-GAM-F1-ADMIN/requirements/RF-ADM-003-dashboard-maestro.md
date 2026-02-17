---
id: "RF-ADM-003"
title: "Dashboard de Maestro"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Admin Base"
epic: "EAI-005"
version: "1.0"
labels: ["admin", "dashboard", "teacher-portal", "activity", "monitoring"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# RF-ADM-003: Dashboard de Maestro

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-ADM-003 |
| **Modulo** | Admin Base |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha creacion** | 2026-01-20 |
| **Ultima actualizacion** | 2026-01-20 |

## Referencias

### Especificacion Tecnica
- [ET-ADM-003: Dashboard de Maestro](../specifications/ET-ADM-003-dashboard-maestro.md)

### User Stories Relacionadas
- [US-ADM-003: Dashboard de Maestro](../user-stories/US-ADM-003/US-ADM-003-dashboard-maestro.md) - 8 SP
- [US-ADM-007: Vista de Actividad de Aula](../user-stories/US-ADM-007/US-ADM-007-vista-actividad-aula.md) - 6 SP

### Implementacion
- **Backend:** `teacher` module - TeacherDashboardController, TeacherService
- **Frontend:** `/teacher/dashboard`, `/teacher/classroom/:id/activity`
- **Database:** `social_features.classrooms`, `progress_tracking.activity_logs`

---

## Descripcion del Requerimiento

### Contexto

El profesor necesita una vista panoramica de todas sus aulas para monitorear el progreso de sus estudiantes y tomar decisiones informadas. El dashboard general muestra un resumen de todas las aulas, mientras que la vista de actividad muestra el pulso en tiempo casi real de cada aula individual.

### Necesidad del Negocio

**Problema:**
Sin un dashboard centralizado:
- Profesor no tiene visibilidad global de sus aulas
- Imposible identificar aulas que necesitan atencion
- Falta de metricas para toma de decisiones
- No hay forma de ver actividad reciente

**Solucion:**
Implementar dashboard de maestro con:
- Resumen global de todas las aulas
- Metricas agregadas (estudiantes, progreso)
- Vista de actividad por aula en tiempo casi real
- Insights automaticos (mejor/peor aula)

---

## Requerimiento Funcional

### RF-ADM-003.1: Dashboard General del Maestro

El sistema **DEBE** mostrar un dashboard con:

#### Resumen Global (Cards de Metricas)
| Metrica | Descripcion |
|---------|-------------|
| Total de aulas | Cantidad de aulas del profesor |
| Total de estudiantes | Suma de estudiantes en todas las aulas |
| Progreso promedio | Promedio de progreso de todas las aulas |

#### Grid de Aulas
Para cada aula mostrar:
| Campo | Descripcion |
|-------|-------------|
| Nombre | Nombre del aula |
| Nivel/Grado | Ej: "Primaria - 6to" |
| Estudiantes | Numero total |
| Progreso promedio | Porcentaje |
| Modulos asignados | Cantidad |
| Barra de progreso | Visual |
| Accion | "Ver Dashboard" |

#### Insights Automaticos
| Insight | Descripcion |
|---------|-------------|
| Mejor desempeno | Aula con mayor progreso promedio |
| Requiere atencion | Aula con menor progreso promedio |

#### Actividad Reciente Global
- Feed de las ultimas 10 actividades de TODAS las aulas
- Cada actividad: estudiante, aula, actividad completada, timestamp

#### Acciones Rapidas
- Boton "Crear Nueva Aula"
- Selector de aula en header (dropdown)

### RF-ADM-003.2: Vista de Actividad del Aula

El sistema **DEBE** mostrar para cada aula:

#### Estudiantes Activos Hoy
| Campo | Descripcion |
|-------|-------------|
| Contador | # estudiantes activos HOY |
| Total | # total de estudiantes |
| Porcentaje | % de estudiantes activos |
| Avatares | Lista visual de estudiantes activos |
| Barra de progreso | % visual |

**Definicion "activo":** Ha completado al menos una actividad hoy

#### Modulos en Progreso
Lista de modulos con actividad en los ultimos 7 dias:
| Campo | Descripcion |
|-------|-------------|
| Nombre | Nombre del modulo |
| Estudiantes trabajando | # de estudiantes |
| Progreso promedio | % del modulo |
| Barra de progreso | Visual |

#### Ultimas Actividades
Feed de las ultimas 10 actividades completadas:
| Campo | Descripcion |
|-------|-------------|
| Estudiante | Avatar + nombre |
| Actividad | Nombre de la actividad |
| Modulo | Nombre del modulo |
| Timestamp | Relativo (ej: "hace 5 min") |
| Link | A perfil del estudiante |

### RF-ADM-003.3: Auto-Refresh

El sistema **DEBE** implementar:
- Auto-refresh cada 2 minutos en vista de actividad
- Indicador de ultima actualizacion
- Boton manual de refresh
- Transiciones suaves (sin flash visual)

### RF-ADM-003.4: Navegacion

El sistema **DEBE** proporcionar:
- Breadcrumb indicando contexto actual
- Sidebar con: Dashboard, Mis Aulas, Configuracion
- Navegacion rapida entre aulas desde header

---

## Criterios de Aceptacion

### AC-001: Dashboard General
- [x] Cards de metricas globales visibles
- [x] Grid de aulas con stats basicas
- [x] Insights de mejor/peor aula
- [x] Actividad reciente global
- [x] Empty state si no hay aulas

### AC-002: Vista de Actividad
- [x] Estudiantes activos hoy con contador
- [x] Modulos en progreso (7 dias)
- [x] Feed de ultimas 10 actividades
- [x] Timestamps relativos

### AC-003: Auto-Refresh
- [x] Refresh automatico cada 2 minutos
- [x] Indicador de ultima actualizacion
- [x] Boton manual de refresh
- [x] Transiciones suaves

### AC-004: Navegacion
- [x] Breadcrumb funcional
- [x] Sidebar con navegacion
- [x] Selector de aula en header

---

## Casos de Uso

### UC-001: Profesor revisa estado de sus aulas

**Actor:** Profesor
**Precondiciones:** Profesor autenticado con 3 aulas

**Flujo:**
1. Profesor ingresa a la plataforma
2. Sistema muestra dashboard general
3. Profesor ve cards: 3 Aulas, 75 Estudiantes, 62.5% Progreso
4. Profesor identifica insight: "Ciencias 5B Requiere Atencion (45.2%)"
5. Profesor hace clic en card de Ciencias 5B
6. Sistema navega a dashboard del aula

**Resultado:** Profesor identifica aula que necesita atencion

### UC-002: Profesor monitorea actividad del aula en tiempo real

**Actor:** Profesor
**Precondiciones:** Aula con 25 estudiantes, horario de clase

**Flujo:**
1. Profesor navega a "Actividad" del aula
2. Sistema muestra: 12/25 estudiantes activos hoy (48%)
3. Profesor ve feed: "Juan Perez completo 'Suma de fracciones' hace 5 min"
4. Cada 2 minutos, vista se actualiza automaticamente
5. Profesor ve nuevo estudiante completar actividad
6. Contador de activos aumenta a 13/25 (52%)

**Resultado:** Profesor monitorea progreso en tiempo casi real

---

## Endpoints Backend

### Dashboard General
```
GET /api/teacher/dashboard

Response:
{
  "summary": {
    "totalClassrooms": 3,
    "totalStudents": 75,
    "averageProgress": 62.5
  },
  "classrooms": [...],
  "recentActivities": [...],
  "insights": {
    "bestPerformingClassroom": {...},
    "needsAttentionClassroom": {...}
  }
}
```

### Actividad del Aula
```
GET /api/teacher/classrooms/{classroomId}/activity-summary

Response:
{
  "classroomId": "uuid",
  "timestamp": "2025-11-02T14:30:00Z",
  "activeStudentsToday": {
    "count": 12,
    "total": 25,
    "percentage": 48,
    "students": [...]
  },
  "modulesInProgress": [...],
  "recentActivities": [...]
}
```

---

## Alcance Basico vs Extensiones

### EAI-005 (Este alcance - Admin Base)
- Dashboard simple con resumen de aulas
- Metricas basicas (# estudiantes, progreso promedio)
- Grid de aulas con stats basicas
- Actividad reciente (ultimas 10)
- Insights simples (mejor/peor aula)
- Auto-refresh cada 2 minutos

### EXT-001/EXT-005 (Extensiones futuras)
- Graficas de tendencia de progreso
- Comparativas entre aulas
- Metricas de engagement
- Dashboard personalizable (widgets)
- Filtros por fecha
- Exportacion de reportes
- Heatmap de actividad por hora/dia
- Analisis de patrones (horarios pico)
- Real-time con WebSockets

---

## Testing

### Pruebas Unitarias
- [ ] `getActiveStudentsToday` cuenta correctamente
- [ ] `getModulesInProgress` filtra por fecha correcta
- [ ] `getRecentActivities` retorna ultimas 10
- [ ] Porcentajes se calculan correctamente

### Pruebas de Integracion
- [ ] Dashboard retorna datos del profesor autenticado
- [ ] Actividad solo incluye aulas del profesor
- [ ] Insights identifican aulas correctas

### Pruebas E2E
- [ ] Profesor ve dashboard con sus aulas
- [ ] Auto-refresh funciona
- [ ] Navegacion entre vistas funciona
- [ ] Datos se actualizan en tiempo real

---

## Notas de Implementacion

### Performance
- Cachear dashboard por 1-2 minutos
- Queries optimizados con joins
- Indices en `activity_logs(classroom_id, timestamp)`

### UX
- Skeleton loaders durante carga
- Auto-refresh subtle (sin flash)
- Empty states motivadores
- Smooth transitions entre vistas

---

## Estimacion de Esfuerzo

| Componente | Story Points |
|------------|-------------|
| Dashboard General (US-ADM-003) | 8 SP |
| Vista de Actividad (US-ADM-007) | 6 SP |
| **Total** | **14 SP** |

**Presupuesto:** $5,600 MXN

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Analyst | Creacion inicial del requerimiento |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-005-admin-base/requerimientos/RF-ADM-003-dashboard-maestro.md`
**Ruta relativa desde docs/:** `01-fase-alcance-inicial/EAI-005-admin-base/requerimientos/RF-ADM-003-dashboard-maestro.md`
