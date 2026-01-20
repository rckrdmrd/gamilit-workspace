# Arquitectura Teacher Portal

**Version:** 1.0.0
**Proyecto:** GAMILIT - EXT-001 Portal de Maestros
**Fecha:** 2026-01-20
**Autor:** @PERFIL_FRONTEND + @PERFIL_ARCHITECT

---

## 1. Patron Component + Wrapper

### 1.1 Descripcion del Patron

El Teacher Portal utiliza un patron arquitectonico de **Component + Wrapper** (tambien conocido como Container/Presentational o Smart/Dumb pattern) que separa las responsabilidades de cada pagina en dos archivos:

```
TeacherDashboard.tsx    → Componente de LOGICA (presentacion + funcionalidad)
TeacherDashboardPage.tsx → Wrapper con LAYOUT (contexto de aplicacion)
```

**Flujo de datos:**

```
[Router] → [*Page.tsx (Wrapper)] → [TeacherLayout] → [*.tsx (Component)]
              ↓                         ↓                    ↓
         Auth context           Sidebar + Header      Business logic
         Gamification data      Navigation           API calls
         Logout handler         Responsive shell     State management
```

### 1.2 Beneficios

| Beneficio | Descripcion |
|-----------|-------------|
| **Separacion de responsabilidades** | El componente de logica no necesita saber sobre layout o autenticacion |
| **Reutilizabilidad** | Los componentes base pueden usarse fuera del layout si es necesario |
| **Testing simplificado** | Se puede testear la logica independiente del layout |
| **Mantenibilidad** | Cambios en layout no afectan la logica de negocio |
| **Consistencia** | Todos los wrappers siguen el mismo patron |

### 1.3 Cuando Usar

**SIEMPRE usar este patron cuando:**
- La pagina requiere autenticacion
- La pagina debe mostrar datos de gamificacion del usuario
- La pagina necesita el sidebar de navegacion

**Excepciones (NO usar wrapper):**
- Paginas publicas (login, registro)
- Componentes modales
- Componentes embebidos en otras paginas

---

## 2. Estructura de Archivos

### 2.1 Paginas (12 Pares Component + Wrapper)

```
apps/frontend/src/apps/teacher/pages/
├── TeacherDashboard.tsx          + TeacherDashboardPage.tsx
├── TeacherClasses.tsx            + TeacherClassesPage.tsx
├── TeacherStudents.tsx           + TeacherStudentsPage.tsx
├── TeacherAssignments.tsx        + TeacherAssignmentsPage.tsx
├── TeacherAnalytics.tsx          + TeacherAnalyticsPage.tsx
├── TeacherGamification.tsx       + TeacherGamificationPage.tsx
├── TeacherContentManagement.tsx  + TeacherContentPage.tsx
├── (Alertas)                     + TeacherAlertsPage.tsx
├── (Progress)                    + TeacherProgressPage.tsx
├── (Reports)                     + TeacherReportsPage.tsx
├── (Monitoring)                  + TeacherMonitoringPage.tsx
├── (Communication)               + TeacherCommunicationPage.tsx
├── (Exercise Responses)          + TeacherExerciseResponsesPage.tsx
├── (Resources)                   + TeacherResourcesPage.tsx
├── (Settings)                    + TeacherSettingsPage.tsx
├── (Notifications)               + TeacherNotificationsPage.tsx
├── (Notification Prefs)          + TeacherNotificationPreferencesPage.tsx
└── (Review Panel)                + TeacherReviewPanelPage.tsx
```

**Total: 25 paginas** (12 con patron explicitamente identificado)

### 2.2 Hooks (23 hooks especializados)

```
apps/frontend/src/apps/teacher/hooks/
├── index.ts                      → Barrel export
├── useTeacherDashboard.ts        → Dashboard stats y actividades
├── useClassrooms.ts              → CRUD de clases
├── useClassroomData.ts           → Datos detallados de clase
├── useClassroomRealtime.ts       → WebSocket para monitoreo real-time
├── useClassroomsStats.ts         → Estadisticas agregadas
├── useStudentMonitoring.ts       → Monitoreo de estudiantes
├── useStudentProgress.ts         → Progreso individual
├── useStudentsEconomy.ts         → Economia ML Coins por estudiante
├── useAssignments.ts             → CRUD de asignaciones
├── useExerciseResponses.ts       → Respuestas de ejercicios
├── useGrading.ts                 → Calificacion de submissions
├── useManualReviews.ts           → Revisiones manuales (M4/M5)
├── useManualReviewConfig.ts      → Config de revision manual
├── useAnalytics.ts               → Analiticas de clase
├── useInterventionAlerts.ts      → Alertas de intervencion
├── useMasteryTracking.ts         → Tracking de dominio
├── useMissionStats.ts            → Estadisticas de misiones
├── useTeacherMessages.ts         → Mensajeria con padres
├── useTeacherContent.ts          → Gestion de contenido
├── useAchievementsStats.ts       → Estadisticas de logros
├── useEconomyAnalytics.ts        → Analiticas de economia
└── useGrantBonus.ts              → Otorgar ML Coins
```

### 2.3 Componentes Compartidos

```
apps/frontend/src/apps/teacher/
├── layouts/
│   └── TeacherLayout.tsx         → Layout principal con sidebar
├── components/
│   ├── analytics/                → Componentes de analiticas
│   ├── alerts/                   → Paneles de alertas
│   ├── assignments/              → Wizard de asignaciones, cards
│   ├── collaboration/            → Comunicacion con padres
│   ├── dashboard/                → Widgets del dashboard
│   ├── monitoring/               → Monitoreo de estudiantes
│   ├── progress/                 → Graficas de progreso
│   └── reports/                  → Generador de reportes
└── types/
    └── index.ts                  → Tipos TypeScript del modulo
```

---

## 3. Mapa de Navegacion

### 3.1 Rutas

| Ruta | Componente | Roles Permitidos |
|------|------------|------------------|
| `/teacher/dashboard` | TeacherDashboardPage | teacher, admin_teacher |
| `/teacher/classes` | TeacherClassesPage | teacher, admin_teacher |
| `/teacher/students` | TeacherStudentsPage | teacher, admin_teacher |
| `/teacher/assignments` | TeacherAssignmentsPage | teacher, admin_teacher |
| `/teacher/responses` | TeacherExerciseResponsesPage | teacher, admin_teacher |
| `/teacher/reviews` | ReviewPanelPage | teacher, admin_teacher |
| `/teacher/progress` | TeacherProgressPage | teacher, admin_teacher |
| `/teacher/alerts` | TeacherAlertsPage | teacher, admin_teacher |
| `/teacher/reports` | TeacherReportsPage | teacher, admin_teacher |
| `/teacher/analytics` | TeacherAnalyticsPage | teacher, admin_teacher |
| `/teacher/monitoring` | TeacherMonitoringPage | teacher, admin_teacher |
| `/teacher/gamification` | TeacherGamificationPage | teacher, admin_teacher |
| `/teacher/content` | TeacherContentPage | teacher, admin_teacher |
| `/teacher/communication` | TeacherCommunicationPage | teacher, admin_teacher |
| `/teacher/settings` | TeacherSettingsPage | teacher, admin_teacher |
| `/teacher/notifications` | TeacherNotificationsPage | teacher, admin_teacher |
| `/teacher/settings/notifications` | TeacherNotificationPreferencesPage | teacher, admin_teacher |
| `/teacher/resources` | Redirect → dashboard | N/A (placeholder) |

### 3.2 Layouts

**TeacherLayout** proporciona:

```tsx
<TeacherLayout
  user={user}                     // Datos del usuario autenticado
  gamificationData={data}         // XP, nivel, ML Coins, rango
  organizationName={org}          // Nombre de la institucion
  onLogout={handleLogout}         // Handler de logout
>
  {children}                      // Contenido de la pagina
</TeacherLayout>
```

**Estructura visual:**

```
┌─────────────────────────────────────────────────────────────┐
│  [GamifiedHeader]                                           │
│  ┌─────────────┬─────────────────────────────────────────┐  │
│  │             │                                         │  │
│  │  Sidebar    │         Content Area                    │  │
│  │  (280px)    │         (flex-1)                        │  │
│  │             │                                         │  │
│  │  - Clases   │    [TeacherDashboard/...]               │  │
│  │  - Monitor  │                                         │  │
│  │  - Asign    │                                         │  │
│  │  - ...      │                                         │  │
│  │             │                                         │  │
│  └─────────────┴─────────────────────────────────────────┘  │
│  [Mobile: FAB para toggle sidebar]                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Flujo de Datos

### 4.1 Estado Global (Zustand)

El Teacher Portal utiliza principalmente **hooks personalizados** con estado local para la mayoria de sus funcionalidades. El estado global se limita a:

| Store | Proposito | Ubicacion |
|-------|-----------|-----------|
| `useAuth` | Autenticacion, usuario, logout | `@features/auth/hooks/useAuth` |
| `useUserGamification` | Datos de gamificacion del usuario | `@shared/hooks/useUserGamification` |

### 4.2 API Calls

**Patron de llamadas API:**

```tsx
// En el componente de logica (TeacherDashboard.tsx)
const { stats, activities, alerts, loading, error, refresh } = useTeacherDashboard();

// El hook encapsula:
// 1. Estado de carga
// 2. Estado de error
// 3. Datos
// 4. Funcion de refresh
// 5. Llamadas API con manejo de errores
```

**Servicios API utilizados:**

```typescript
// apps/frontend/src/services/api/teacher/
├── classroomsApi.ts      → Clases y estudiantes
├── assignmentsApi.ts     → Asignaciones y submissions
├── analyticsApi.ts       → Analiticas y reportes
├── teacherContentApi.ts  → Gestion de contenido
├── alertsApi.ts          → Alertas e intervenciones
└── reportsApi.ts         → Generacion de reportes
```

### 4.3 Diagrama de Flujo de Datos

```
┌──────────────────────────────────────────────────────────────┐
│                      TeacherDashboardPage                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  useAuth()          → user, logout                     │  │
│  │  useUserGamification() → gamificationData              │  │
│  └────────────────────────────────────────────────────────┘  │
│                              ↓                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    TeacherLayout                       │  │
│  │  Props: user, gamificationData, onLogout               │  │
│  └────────────────────────────────────────────────────────┘  │
│                              ↓                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  TeacherDashboard                      │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  useTeacherDashboard() → stats, activities       │  │  │
│  │  │  useClassrooms()       → classrooms, selected    │  │  │
│  │  │  classroomsApi         → estudiantes por clase   │  │  │
│  │  │  assignmentsApi        → tareas proximas         │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                          ↓                             │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Renderizado de UI:                              │  │  │
│  │  │  - Stats cards (estudiantes, score, completitud) │  │  │
│  │  │  - Tabs de navegacion interna                    │  │  │
│  │  │  - Componentes por tab (Monitoring, Progress...) │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Convenciones de Codigo

### 5.1 Nomenclatura

| Elemento | Convencion | Ejemplo |
|----------|------------|---------|
| **Page Wrapper** | `Teacher{Feature}Page.tsx` | `TeacherDashboardPage.tsx` |
| **Logic Component** | `Teacher{Feature}.tsx` | `TeacherDashboard.tsx` |
| **Hook** | `use{Feature}.ts` | `useTeacherDashboard.ts` |
| **Component** | `PascalCase.tsx` | `StudentMonitoringPanel.tsx` |
| **API Service** | `{feature}Api.ts` | `classroomsApi.ts` |
| **Types** | `types/index.ts` | Interfaces y tipos locales |

### 5.2 Estructura de un Page Wrapper

```tsx
// TeacherExamplePage.tsx
import { useAuth } from '@features/auth/hooks/useAuth';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { TeacherLayout } from '../layouts/TeacherLayout';
import TeacherExample from './TeacherExample';

/**
 * TeacherExamplePage - Wrapper para la funcionalidad de ejemplo
 *
 * Este componente envuelve el TeacherExample existente con el TeacherLayout
 * que incluye el sidebar de navegacion y header gamificado.
 */
export default function TeacherExamplePage() {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={gamificationData}
      organizationName={user?.organization?.name || 'Mi Institucion'}
      onLogout={handleLogout}
    >
      <TeacherExample />
    </TeacherLayout>
  );
}
```

### 5.3 Estructura de un Logic Component

```tsx
// TeacherExample.tsx
import { useState, useEffect } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { useExampleHook } from '../hooks/useExampleHook';
import type { ExampleType } from '../types';

export default function TeacherExample() {
  // 1. Hooks de datos
  const { data, loading, error, refresh } = useExampleHook();

  // 2. Estado local
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // 3. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 4. Handlers
  const handleItemClick = (id: string) => {
    setSelectedItem(id);
  };

  // 5. Render helpers
  const renderLoadingState = () => (
    <div>Cargando...</div>
  );

  const renderErrorState = () => (
    <div>Error: {error?.message}</div>
  );

  // 6. Main render
  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-detective-text">Titulo</h1>
        <p className="text-detective-text-secondary">Descripcion</p>
      </div>

      {/* Content */}
      <DetectiveCard>
        {/* ... */}
      </DetectiveCard>
    </div>
  );
}
```

### 5.4 Design System

El Teacher Portal usa el **Detective Theme**:

| Token | Uso |
|-------|-----|
| `detective-bg` | Fondo principal |
| `detective-bg-secondary` | Fondo de tarjetas/inputs |
| `detective-text` | Texto principal |
| `detective-text-secondary` | Texto secundario |
| `detective-orange` | Color de acento primario |
| `detective-gold` | Color para logros/XP |
| `detective-border` | Bordes |

**Componentes base:**
- `DetectiveCard` - Tarjetas con bordes y hover
- `DetectiveButton` - Botones estilizados
- `Modal` - Modales con backdrop
- `FormField` - Campos de formulario

---

## 6. Referencias

### 6.1 Documentacion Relacionada

- **User Stories:** `/docs/03-fase-extensiones/EXT-001-portal-maestros/historias-usuario/`
- **Especificaciones:** `/docs/03-fase-extensiones/EXT-001-portal-maestros/especificaciones/`
- **Requerimientos:** `/docs/03-fase-extensiones/EXT-001-portal-maestros/requerimientos/`

### 6.2 Archivos Clave

| Archivo | Descripcion |
|---------|-------------|
| `apps/frontend/src/App.tsx` | Configuracion de rutas |
| `apps/frontend/src/apps/teacher/layouts/TeacherLayout.tsx` | Layout principal |
| `apps/frontend/src/apps/teacher/hooks/index.ts` | Barrel export de hooks |
| `shared/components/layout/GamilitSidebar.tsx` | Sidebar de navegacion |
| `shared/components/layout/GamifiedHeader.tsx` | Header con gamificacion |

### 6.3 APIs Backend

| Endpoint Base | Controlador | Proposito |
|---------------|-------------|-----------|
| `/api/v1/classrooms` | ClassroomsController | CRUD de clases |
| `/api/v1/assignments` | AssignmentsController | Gestiones de tareas |
| `/api/v1/analytics` | AnalyticsController | Metricas y reportes |
| `/api/v1/teacher-content` | TeacherContentController | Contenido educativo |
| `/api/v1/notifications` | NotificationsController | Sistema de alertas |

---

## 7. Diagrama Visual de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TEACHER PORTAL                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         ROUTING LAYER                           │   │
│  │  App.tsx → ProtectedRoute → TeacherXxxPage                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  ↓                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     PAGE WRAPPER LAYER                          │   │
│  │  TeacherXxxPage.tsx                                             │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │ useAuth()           → user, logout                       │   │   │
│  │  │ useUserGamification → XP, level, mlCoins                 │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  ↓                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      LAYOUT LAYER                               │   │
│  │  TeacherLayout                                                  │   │
│  │  ┌───────────────┬─────────────────────────────────────────┐   │   │
│  │  │ GamifiedHeader │          GamilitSidebar                │   │   │
│  │  │               │          - Navigation items              │   │   │
│  │  │               │          - Collapse/expand               │   │   │
│  │  └───────────────┴─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  ↓                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   COMPONENT LAYER (Logic)                       │   │
│  │  TeacherXxx.tsx                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │ Custom Hooks    → useTeacherDashboard, useClassrooms... │   │   │
│  │  │ Local State     → useState, useEffect                    │   │   │
│  │  │ Event Handlers  → handleXxx functions                    │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  ↓                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        UI LAYER                                 │   │
│  │  DetectiveCard, DetectiveButton, Modal, DataTable, Charts...   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  ↓                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       DATA LAYER                                │   │
│  │  Custom Hooks → API Services → REST API Backend                 │   │
│  │  useClassrooms → classroomsApi → /api/v1/classrooms            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

**Documento generado:** 2026-01-20
**Metodologia:** CAPVED + SIMCO v4.0.0
**Tarea:** P2-2 - Estandarizar documentacion de arquitectura Teacher Portal
