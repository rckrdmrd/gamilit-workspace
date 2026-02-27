---
titulo: Especificaciones de Páginas Teacher Portal
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# Especificaciones de Paginas - Teacher Portal

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Modulo:** Teacher Portal

---

## INDICE DE PAGINAS

| Pagina | Estado | Componentes Principales |
|--------|--------|------------------------|
| TeacherDashboard | Activo | Tabs, StudentMonitoringPanel |
| TeacherMonitoringPage | Activo | StudentMonitoringPanel |
| TeacherExerciseResponsesPage | Activo | ResponseFilters, ResponsesTable |
| TeacherProgressPage | Activo | ClassProgressDashboard |
| TeacherAlertsPage | Activo | InterventionAlertsPanel |
| TeacherAssignmentsPage | Activo | TeacherAssignments |
| TeacherContentPage | Under Construction | - |
| TeacherResourcesPage | Placeholder | UnderConstruction |
| TeacherReportsPage | Activo | ReportCharts, StatsGrid |
| TeacherClassesPage | Activo | ClassSelector, ClassDetails |
| TeacherStudentsPage | Activo | StudentsList, StudentFilters |
| TeacherAnalyticsPage | Activo | AnalyticsCharts, EconomyStats |

---

## 1. TeacherDashboard

**Ubicacion:** `pages/TeacherDashboard.tsx`
**Rol:** Hub central del portal de maestros

### Estructura

```
┌─────────────────────────────────────────────────────────┐
│                     HEADER                               │
│  [Book Icon] Dashboard del Maestro                      │
│  [Selector de Clase v]                                  │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                    TABS                          │   │
│  │ [Resumen] [Monitoreo] [Progreso] [Alertas]      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │               TAB CONTENT                        │   │
│  │  (StudentMonitoringPanel, ClassProgress, etc.)  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Tabs

| Tab | Contenido |
|-----|-----------|
| Resumen | Stats generales, alertas recientes |
| Monitoreo | StudentMonitoringPanel |
| Progreso | ClassProgressDashboard |
| Alertas | InterventionAlertsPanel |

### Estado

```typescript
const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
const [activeTab, setActiveTab] = useState('resumen');
```

---

## 2. TeacherMonitoringPage

**Ubicacion:** `pages/TeacherMonitoringPage.tsx`
**Rol:** Monitoreo en tiempo real de estudiantes

### Estructura

```
┌─────────────────────────────────────────────────────────┐
│                     HEADER                               │
│  [Eye Icon] Monitoreo de Estudiantes                    │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │            SELECTOR DE CLASE                     │   │
│  │  [Clase A] [Clase B] [Clase C] ...              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         StudentMonitoringPanel                   │   │
│  │  (Stats + Filtros + Grid/Tabla + Paginacion)    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Caracteristicas

- Selector de clase con grid de botones
- Auto-seleccion de primera clase al cargar
- Toast para notificaciones de eventos
- RefreshControl con intervalos configurables

---

## 3. TeacherExerciseResponsesPage

**Ubicacion:** `pages/TeacherExerciseResponsesPage.tsx`
**Rol:** Revision de respuestas de ejercicios

### Estructura

```
┌─────────────────────────────────────────────────────────┐
│                     HEADER                               │
│  [FileText Icon] Respuestas de Ejercicios               │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              STATS GRID                          │   │
│  │ [Total Intentos] [Correctos] [Incorrectos]      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              ResponseFilters                     │   │
│  │  [Aula] [Estudiante] [Fechas] [Estado]          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              ResponsesTable                      │   │
│  │  + Paginacion + Sorting                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────┐          │
│  │      ResponseDetailModal (overlay)        │          │
│  └──────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

### Stats Grid

| Stat | Valor |
|------|-------|
| Total Intentos | Conteo total |
| Correctos | Intentos correctos |
| Incorrectos | Intentos incorrectos |
| Pendientes de Revision | Requieren revision manual |

---

## 4. TeacherProgressPage

**Ubicacion:** `pages/TeacherProgressPage.tsx`
**Rol:** Seguimiento de progreso academico

### Estructura

```
┌─────────────────────────────────────────────────────────┐
│                     HEADER                               │
│  [TrendingUp Icon] Progreso Academico                   │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │            SELECTOR DE CLASE                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         ClassProgressDashboard                   │   │
│  │  - Stats por modulo                             │   │
│  │  - Distribucion de scores                       │   │
│  │  - Tendencias semanales                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 5. TeacherAlertsPage

**Ubicacion:** `pages/TeacherAlertsPage.tsx`
**Rol:** Alertas de intervencion para estudiantes

### Estructura

```
┌─────────────────────────────────────────────────────────┐
│                     HEADER                               │
│  [Bell Icon] Alertas de Intervencion                    │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              FILTROS                             │   │
│  │  [Tipo v] [Prioridad v] [Clase v]               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         InterventionAlertsPanel                  │   │
│  │  Lista de alertas con acciones                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Constantes Centralizadas (P2-02)

La pagina usa constantes importadas desde `../constants/alertTypes`:

```typescript
import { ALERT_TYPES, ALERT_PRIORITIES } from '../constants/alertTypes';

// Uso en componente
const alertTypes = ALERT_TYPES;
const priorities = ALERT_PRIORITIES;
```

### Tipos de Alerta

| Tipo | Descripcion | Icono |
|------|-------------|-------|
| no_activity | Estudiantes inactivos >7 dias | `emoji_events` |
| low_score | Promedio <60% | `emoji_events` |
| declining_trend | Rendimiento en declive | `emoji_events` |
| repeated_failures | Multiples intentos fallidos | `emoji_events` |

### Prioridades

| Prioridad | Label | Color |
|-----------|-------|-------|
| critical | Critica | bg-red-500 |
| high | Alta | bg-orange-500 |
| medium | Media | bg-yellow-500 |
| low | Baja | bg-blue-500 |

---

## 6. TeacherAssignmentsPage

**Ubicacion:** `pages/TeacherAssignmentsPage.tsx`
**Rol:** Gestion de tareas asignadas

### Estructura

- Wrapper simple alrededor de `TeacherAssignments`
- Layout con TeacherLayout

---

## 7. TeacherContentPage

**Ubicacion:** `pages/TeacherContentPage.tsx`
**Estado:** Under Construction

```typescript
const SHOW_UNDER_CONSTRUCTION = true;
```

---

## 8. TeacherResourcesPage

**Ubicacion:** `pages/TeacherResourcesPage.tsx`
**Estado:** Placeholder

- Muestra componente `UnderConstruction`
- Feature para futuras versiones

---

## 9. TeacherReportsPage

**Ubicacion:** `pages/TeacherReportsPage.tsx`
**Rol:** Generacion y visualizacion de reportes

### Estructura

```
┌─────────────────────────────────────────────────────────┐
│                     HEADER                               │
│  [FileText Icon] Reportes y Analiticas                  │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │          [MOCK DATA BANNER - conditional]       │   │
│  │  (Shown when API fails and using demo data)     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         TABS: Overview | Details | Export       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              STATS GRID                         │   │
│  │  [Total] [Activos] [Promedio] [Pendientes]      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              CHARTS SECTION                     │   │
│  │  - Progress by Module                           │   │
│  │  - Weekly Trends                                │   │
│  │  - Score Distribution                           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Estado de Mock Data (P0-02)

Cuando la API falla, la pagina activa un modo de datos de demostracion:

```typescript
const [isUsingMockData, setIsUsingMockData] = useState(false);

// En cada catch block:
try {
  const data = await api.fetchStats();
  setStats(data);
} catch (error) {
  console.error('API failed, using mock data');
  setIsUsingMockData(true);
  setStats(MOCK_STATS);
}
```

### Banner Visual de Mock Data

Cuando `isUsingMockData === true`:

```tsx
{isUsingMockData && (
  <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
    <div className="flex items-center">
      <InfoIcon className="h-5 w-5 text-yellow-500 mr-2" />
      <p className="text-yellow-700">
        Datos de Demostracion - No se pudo conectar al servidor
      </p>
    </div>
  </div>
)}
```

---

## LAYOUT COMPARTIDO

### TeacherLayout

**Props:**
```typescript
interface TeacherLayoutProps {
  children: React.ReactNode;
  user?: User;
  gamificationData: GamificationData;
  organizationName: string;  // P1-01: Dynamic organization name
  onLogout: () => void;
}
```

**Estructura:**
- Header con titulo y nombre de organizacion
- Navegacion lateral (si aplica)
- Contenido principal
- Footer (opcional)

### Nombre de Organizacion Dinamico (P1-01)

Todas las paginas del Teacher Portal ahora pasan el nombre de organizacion de forma dinamica:

```typescript
<TeacherLayout
  user={user ?? undefined}
  gamificationData={displayGamificationData}
  organizationName={user?.organization?.name || 'Mi Institucion'}
  onLogout={handleLogout}
>
```

**Paginas actualizadas con organizationName dinamico:**
- TeacherClassesPage
- TeacherMonitoringPage
- TeacherAssignmentsPage
- TeacherExerciseResponsesPage
- TeacherAlertsPage
- TeacherProgressPage
- TeacherStudentsPage
- TeacherAnalyticsPage
- TeacherResourcesPage
- TeacherReportsPage

---

## RUTAS

| Ruta | Pagina |
|------|--------|
| /teacher | TeacherDashboard |
| /teacher/monitoring | TeacherMonitoringPage |
| /teacher/responses | TeacherExerciseResponsesPage |
| /teacher/progress | TeacherProgressPage |
| /teacher/alerts | TeacherAlertsPage |
| /teacher/assignments | TeacherAssignmentsPage |
| /teacher/content | TeacherContentPage |
| /teacher/resources | TeacherResourcesPage |
| /teacher/reports | TeacherReportsPage |
| /teacher/classes | TeacherClassesPage |
| /teacher/students | TeacherStudentsPage |
| /teacher/analytics | TeacherAnalyticsPage |

---

## REFERENCIAS

- [TEACHER-MONITORING-COMPONENTS.md](../components/TEACHER-MONITORING-COMPONENTS.md)
- [TEACHER-RESPONSE-MANAGEMENT.md](../components/TEACHER-RESPONSE-MANAGEMENT.md)
- [TEACHER-TYPES-REFERENCE.md](../types/TEACHER-TYPES-REFERENCE.md)
- [TEACHER-CONSTANTS-REFERENCE.md](../constants/TEACHER-CONSTANTS-REFERENCE.md)

---

**Ultima actualizacion:** 2025-12-26
