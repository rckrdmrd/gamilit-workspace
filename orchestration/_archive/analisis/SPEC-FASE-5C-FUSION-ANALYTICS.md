# ESPECIFICACION TECNICA - FASE 5C
## Fusion de TeacherAnalytics en TeacherProgressPage (Alto Riesgo)

**Fecha:** 2025-12-15
**Prioridad:** MEDIA (ejecutar despues de FASE 5A y 5B)
**Riesgo:** ALTO
**Tiempo estimado de implementacion:** 3-4 horas
**Prerequisitos:** FASE 5A completada

---

## 1. OBJETIVO

Fusionar la funcionalidad de `TeacherAnalyticsPage` dentro de `TeacherProgressPage` como una nueva pestaña "Engagement", eliminando la redundancia entre ambas paginas y consolidando todas las metricas de rendimiento en un solo lugar.

### 1.1 Justificacion

```yaml
Solapamiento_detectado:
  TeacherProgress:
    - Progreso academico por estudiante
    - Stats por modulo
    - Identificacion de estudiantes rezagados
    - Vista por clase

  TeacherAnalytics:
    - Puntuacion promedio (DUPLICADO)
    - Tasa de completitud (DUPLICADO)
    - Tasa de engagement (UNICO)
    - DAU/WAU metrics (UNICO)
    - Session duration (UNICO)
    - Feature usage stats (UNICO)
    - Comparacion con periodo anterior (UNICO)

Funcionalidad_unica_Analytics:
  - Metricas de engagement (DAU, WAU)
  - Duracion promedio de sesion
  - Sesiones por usuario
  - Uso de funcionalidades
  - Comparacion con periodo anterior
```

---

## 2. ARCHIVOS INVOLUCRADOS

### 2.1 Archivos a MODIFICAR

| Archivo | Tipo de cambio | Complejidad |
|---------|---------------|-------------|
| `TeacherProgressPage.tsx` | Agregar sistema de tabs y tab Engagement | ALTA |
| `GamilitSidebar.tsx` | Remover item analytics | BAJA |

### 2.2 Archivos a REUTILIZAR (sin modificar)

| Archivo | Uso |
|---------|-----|
| `useAnalytics.ts` | Hook para obtener datos de engagement |
| `analyticsApi.ts` | API calls existentes |

### 2.3 Archivos a DEPRECAR (no eliminar)

| Archivo | Razon |
|---------|-------|
| `TeacherAnalyticsPage.tsx` | Wrapper - mantener para rutas legacy |
| `TeacherAnalytics.tsx` | Componente principal - referencia para migracion |

---

## 3. CAMBIOS DETALLADOS

### 3.1 TeacherProgressPage.tsx - REESTRUCTURACION COMPLETA

**Ruta:** `/home/isem/workspace/projects/gamilit/apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx`

#### NUEVAS IMPORTACIONES A AGREGAR:

```typescript
// Agregar al inicio del archivo despues de las importaciones existentes
import { useState, useMemo, useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Activity,
  Clock,
  ArrowUp,
  ArrowDown,
  Users as UsersIcon,
  Download,
} from 'lucide-react';
import { FormField } from '@shared/components/common/FormField';

// Registrar Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
```

#### NUEVO ESTADO A AGREGAR:

```typescript
// Dentro del componente, despues de los estados existentes
const [activeTab, setActiveTab] = useState<'progress' | 'engagement'>('progress');
const [dateRange, setDateRange] = useState({
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0],
});

// Query para analytics (solo cuando tab engagement esta activo)
const analyticsQuery = useMemo(
  () =>
    activeTab === 'engagement' && selectedClassroomId !== 'all'
      ? {
          classroom_id: selectedClassroomId,
          start_date: dateRange.start,
          end_date: dateRange.end,
        }
      : undefined,
  [activeTab, selectedClassroomId, dateRange.start, dateRange.end],
);

const engagementQuery = useMemo(
  () =>
    activeTab === 'engagement' && selectedClassroomId !== 'all'
      ? {
          classroom_id: selectedClassroomId,
          start_date: dateRange.start,
          end_date: dateRange.end,
          period: 'daily' as const,
        }
      : undefined,
  [activeTab, selectedClassroomId, dateRange.start, dateRange.end],
);

// Hook de analytics
const {
  analytics: analyticsData,
  engagement: engagementData,
  loading: analyticsLoading,
  error: analyticsError,
  generateReport,
  refresh: refreshAnalytics,
} = useAnalytics(analyticsQuery, engagementQuery);
```

#### FUNCIONES AUXILIARES A AGREGAR:

```typescript
/**
 * Safely format a number to fixed decimals
 */
const safeFormat = (
  value: number | undefined | null,
  decimals: number = 1,
  suffix: string = '',
  fallback: string = 'N/A',
): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return fallback;
  }
  return `${value.toFixed(decimals)}${suffix}`;
};

/**
 * Export analytics to CSV
 */
const exportToCSV = async () => {
  if (selectedClassroomId === 'all') {
    alert('Por favor selecciona una clase especifica para exportar');
    return;
  }

  try {
    const report = await generateReport({
      type: 'custom',
      title: `Engagement Report - ${selectedClassroomName}`,
      classroom_id: selectedClassroomId,
      start_date: dateRange.start,
      end_date: dateRange.end,
      format: 'csv',
      include_charts: true,
      include_recommendations: true,
    });

    if (report.status === 'completed' && report.file_url) {
      window.open(report.file_url, '_blank');
    } else {
      alert('El reporte esta siendo generado. Por favor intenta nuevamente en unos momentos.');
    }
  } catch (err) {
    console.error('[TeacherProgressPage] Error exporting CSV:', err);
    alert('Error al generar el reporte. Por favor intenta nuevamente.');
  }
};

// Chart options para engagement
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#e5e7eb' },
    },
  },
  scales: {
    x: {
      ticks: { color: '#9ca3af' },
      grid: { color: 'rgba(156, 163, 175, 0.1)' },
    },
    y: {
      ticks: { color: '#9ca3af' },
      grid: { color: 'rgba(156, 163, 175, 0.1)' },
    },
  },
};
```

#### ESTRUCTURA JSX - TAB SWITCHER (agregar despues del selector de clase):

```tsx
{/* Tab Switcher - Agregar despues del selector de clase */}
{!loading && !error && (
  <div className="flex gap-2">
    <button
      onClick={() => setActiveTab('progress')}
      className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
        activeTab === 'progress'
          ? 'bg-detective-orange text-white'
          : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
      }`}
    >
      <BarChart3 className="mr-2 inline h-5 w-5" />
      Progreso
    </button>
    <button
      onClick={() => setActiveTab('engagement')}
      className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
        activeTab === 'engagement'
          ? 'bg-detective-orange text-white'
          : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
      }`}
    >
      <Activity className="mr-2 inline h-5 w-5" />
      Engagement
    </button>
  </div>
)}
```

#### CONTENIDO TAB ENGAGEMENT (agregar como seccion condicional):

```tsx
{/* Tab Engagement Content */}
{!loading && !error && activeTab === 'engagement' && (
  <div className="space-y-6">
    {/* Date Range Filter */}
    <DetectiveCard hoverable={false}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField
          label="Fecha Inicio"
          name="startDate"
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
        />
        <FormField
          label="Fecha Fin"
          name="endDate"
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
        />
        <div className="flex items-end gap-2">
          <DetectiveButton
            variant="primary"
            onClick={exportToCSV}
            disabled={selectedClassroomId === 'all'}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </DetectiveButton>
          <DetectiveButton variant="secondary" onClick={refreshAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </DetectiveButton>
        </div>
      </div>
    </DetectiveCard>

    {/* Loading state for analytics */}
    {analyticsLoading && (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-detective-orange" />
        <p className="text-detective-text-secondary">Cargando metricas de engagement...</p>
      </div>
    )}

    {/* Error state for analytics */}
    {analyticsError && !analyticsLoading && (
      <DetectiveCard variant="danger">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-8 w-8 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-bold text-detective-text">
              Error al cargar engagement
            </h3>
            <p className="mb-4 text-detective-text-secondary">
              {analyticsError.message}
            </p>
            <DetectiveButton onClick={refreshAnalytics} variant="primary">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </DetectiveButton>
          </div>
        </div>
      </DetectiveCard>
    )}

    {/* Select class prompt for engagement */}
    {selectedClassroomId === 'all' && !analyticsLoading && (
      <DetectiveCard hoverable={false}>
        <div className="py-12 text-center">
          <Activity className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary" />
          <h3 className="mb-2 text-lg font-semibold text-detective-text">
            Selecciona una clase
          </h3>
          <p className="text-detective-text-secondary">
            Las metricas de engagement requieren seleccionar una clase especifica
          </p>
        </div>
      </DetectiveCard>
    )}

    {/* Engagement Metrics - Main Cards */}
    {engagementData && selectedClassroomId !== 'all' && !analyticsLoading && (
      <>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-3">
                <UsersIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-detective-text-secondary">Usuarios Activos Diarios</p>
                <p className="text-3xl font-bold text-detective-text">{engagementData.dau}</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/20 p-3">
                <Activity className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-detective-text-secondary">Usuarios Activos Semanales</p>
                <p className="text-3xl font-bold text-detective-text">{engagementData.wau}</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/20 p-3">
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-detective-text-secondary">Duracion Promedio (min)</p>
                <p className="text-3xl font-bold text-detective-text">
                  {safeFormat(engagementData?.session_duration_avg, 0, '', '0')}
                </p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/20 p-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-detective-text-secondary">Sesiones por Usuario</p>
                <p className="text-3xl font-bold text-detective-text">
                  {safeFormat(engagementData?.sessions_per_user, 1, '', '0.0')}
                </p>
              </div>
            </div>
          </DetectiveCard>
        </div>

        {/* Comparison with Previous Period */}
        <DetectiveCard hoverable={false}>
          <h3 className="mb-4 text-lg font-bold text-detective-text">
            Comparacion con Periodo Anterior
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex items-center gap-3">
              {(engagementData?.comparison_previous_period?.dau_change ?? 0) >= 0 ? (
                <ArrowUp className="h-6 w-6 text-green-500" />
              ) : (
                <ArrowDown className="h-6 w-6 text-red-500" />
              )}
              <div>
                <p className="text-sm text-detective-text-secondary">Cambio en DAU</p>
                <p
                  className={`text-2xl font-bold ${
                    (engagementData?.comparison_previous_period?.dau_change ?? 0) >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {(engagementData?.comparison_previous_period?.dau_change ?? 0) >= 0 ? '+' : ''}
                  {safeFormat(
                    engagementData?.comparison_previous_period?.dau_change,
                    1,
                    '%',
                    '0.0%',
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(engagementData?.comparison_previous_period?.wau_change ?? 0) >= 0 ? (
                <ArrowUp className="h-6 w-6 text-green-500" />
              ) : (
                <ArrowDown className="h-6 w-6 text-red-500" />
              )}
              <div>
                <p className="text-sm text-detective-text-secondary">Cambio en WAU</p>
                <p
                  className={`text-2xl font-bold ${
                    (engagementData?.comparison_previous_period?.wau_change ?? 0) >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {(engagementData?.comparison_previous_period?.wau_change ?? 0) >= 0 ? '+' : ''}
                  {safeFormat(
                    engagementData?.comparison_previous_period?.wau_change,
                    1,
                    '%',
                    '0.0%',
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(engagementData?.comparison_previous_period?.engagement_change ?? 0) >= 0 ? (
                <ArrowUp className="h-6 w-6 text-green-500" />
              ) : (
                <ArrowDown className="h-6 w-6 text-red-500" />
              )}
              <div>
                <p className="text-sm text-detective-text-secondary">Cambio en Engagement</p>
                <p
                  className={`text-2xl font-bold ${
                    (engagementData?.comparison_previous_period?.engagement_change ?? 0) >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {(engagementData?.comparison_previous_period?.engagement_change ?? 0) >= 0
                    ? '+'
                    : ''}
                  {safeFormat(
                    engagementData?.comparison_previous_period?.engagement_change,
                    1,
                    '%',
                    '0.0%',
                  )}
                </p>
              </div>
            </div>
          </div>
        </DetectiveCard>

        {/* Feature Usage Table */}
        {engagementData?.feature_usage && engagementData.feature_usage.length > 0 && (
          <DetectiveCard hoverable={false}>
            <h3 className="mb-4 text-lg font-bold text-detective-text">
              Uso de Funcionalidades
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-detective-border">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-detective-text-secondary">
                      Funcionalidad
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-detective-text-secondary">
                      Usos Totales
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-detective-text-secondary">
                      Usuarios Unicos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {engagementData.feature_usage
                    .filter(
                      (feature) =>
                        feature &&
                        typeof feature.feature_name === 'string' &&
                        typeof feature.usage_count === 'number',
                    )
                    .map((feature, index) => (
                      <tr
                        key={feature.feature_name || index}
                        className="border-b border-detective-border transition-colors hover:bg-detective-bg-secondary"
                      >
                        <td className="px-4 py-3 font-medium text-detective-text">
                          {feature.feature_name}
                        </td>
                        <td className="px-4 py-3 text-detective-text">
                          {feature.usage_count.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-detective-text">
                          {feature.unique_users ?? 0}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </DetectiveCard>
        )}
      </>
    )}
  </div>
)}

{/* Tab Progress Content - Envolver el contenido existente */}
{!loading && !error && activeTab === 'progress' && (
  <>
    {/* Todo el contenido existente de progreso va aqui */}
    {/* ClassProgressDashboard, Tips card, etc. */}
  </>
)}
```

---

### 3.2 GamilitSidebar.tsx - REMOVER ITEM ANALYTICS

**Ruta:** `/home/isem/workspace/projects/gamilit/apps/frontend/src/shared/components/layout/GamilitSidebar.tsx`

**Accion:** Este cambio YA esta incluido en FASE 5A. El item `analytics` se remueve junto con los otros items en esa fase.

**Verificacion:** Confirmar que en SPEC-FASE-5A-SIDEBAR.md el item con id `analytics` esta en la lista de items removidos.

---

## 4. ORDEN DE IMPLEMENTACION

```yaml
Paso_1:
  descripcion: "Agregar imports necesarios a TeacherProgressPage"
  archivo: TeacherProgressPage.tsx
  lineas: "1-30 (imports)"
  riesgo: BAJO

Paso_2:
  descripcion: "Agregar nuevos estados y queries"
  archivo: TeacherProgressPage.tsx
  ubicacion: "Dentro del componente, despues de estados existentes"
  riesgo: MEDIO

Paso_3:
  descripcion: "Agregar funciones auxiliares"
  archivo: TeacherProgressPage.tsx
  ubicacion: "Despues de los estados, antes del return"
  riesgo: BAJO

Paso_4:
  descripcion: "Agregar Tab Switcher en JSX"
  archivo: TeacherProgressPage.tsx
  ubicacion: "Despues del selector de clase"
  riesgo: MEDIO

Paso_5:
  descripcion: "Envolver contenido existente en condicional activeTab === 'progress'"
  archivo: TeacherProgressPage.tsx
  ubicacion: "Todo el contenido actual de progreso"
  riesgo: ALTO

Paso_6:
  descripcion: "Agregar seccion de contenido engagement"
  archivo: TeacherProgressPage.tsx
  ubicacion: "Despues del contenido de progress"
  riesgo: MEDIO

Paso_7:
  descripcion: "Verificar que GamilitSidebar no tiene item analytics (FASE 5A)"
  archivo: GamilitSidebar.tsx
  riesgo: BAJO
```

---

## 5. DEPENDENCIAS Y HOOKS

### 5.1 Hooks Reutilizados

| Hook | Origen | Uso en TeacherProgressPage |
|------|--------|---------------------------|
| `useAnalytics` | `../hooks/useAnalytics` | Obtener datos de engagement |
| `useClassrooms` | YA EXISTE | Selector de clase (existente) |
| `useClassroomsStats` | YA EXISTE | Stats agregadas (existente) |

### 5.2 APIs Utilizadas

| API | Endpoint | Metodo |
|-----|----------|--------|
| `analyticsApi.getClassroomAnalytics` | `/teacher/analytics` | GET |
| `analyticsApi.getEngagementMetrics` | `/teacher/analytics/engagement` | GET |
| `analyticsApi.generateReport` | `/teacher/reports` | POST |

### 5.3 Tipos Requeridos

```typescript
// Importar desde @apps/teacher/types
import type { ClassroomAnalytics, EngagementMetrics } from '@apps/teacher/types';

// Importar desde @services/api/teacher/analyticsApi
import type {
  GetAnalyticsQueryDto,
  GetEngagementMetricsDto,
  GenerateReportsDto,
  Report,
} from '@services/api/teacher/analyticsApi';
```

---

## 6. PLAN DE PRUEBAS

### 6.1 Pruebas Manuales

```yaml
Prueba_1_Tab_Switching:
  precondicion: "Login como teacher, navegar a /teacher/progress"
  pasos:
    - Verificar que aparecen dos tabs: Progreso y Engagement
    - Click en tab Engagement
    - Verificar que se muestra mensaje de seleccionar clase
    - Click en tab Progreso
    - Verificar que se muestra el contenido original
  resultado_esperado: "Tabs funcionan correctamente"

Prueba_2_Engagement_Data:
  precondicion: "Login como teacher, navegar a /teacher/progress"
  pasos:
    - Seleccionar una clase especifica
    - Click en tab Engagement
    - Verificar que se cargan datos (DAU, WAU, etc.)
    - Verificar filtro de fechas
    - Click en Exportar CSV
  resultado_esperado: "Datos de engagement se muestran correctamente"

Prueba_3_Progress_Unchanged:
  precondicion: "Login como teacher, navegar a /teacher/progress"
  pasos:
    - Seleccionar clase
    - Verificar ClassProgressDashboard funciona
    - Verificar tips card visible
    - Verificar estadisticas generales
  resultado_esperado: "Funcionalidad de progreso no afectada"

Prueba_4_Analytics_Route:
  precondicion: "Login como teacher"
  pasos:
    - Navegar directamente a /teacher/analytics
    - Verificar que la pagina carga (ruta mantenida)
  resultado_esperado: "Ruta legacy funcional"

Prueba_5_Sidebar_Analytics_Removed:
  precondicion: "Login como teacher"
  pasos:
    - Verificar que el sidebar NO muestra item "Analiticas"
    - Verificar que SI muestra item "Progreso"
  resultado_esperado: "Sidebar correcto despues de FASE 5A"
```

### 6.2 Criterios de Aceptacion

- [ ] Tab switcher visible y funcional
- [ ] Tab Progreso muestra contenido original sin cambios
- [ ] Tab Engagement muestra metricas cuando hay clase seleccionada
- [ ] Tab Engagement muestra mensaje apropiado cuando no hay clase
- [ ] Filtro de fechas funciona
- [ ] Exportar CSV funciona
- [ ] Comparacion con periodo anterior visible
- [ ] Tabla de uso de funcionalidades visible (si hay datos)
- [ ] No hay errores en consola
- [ ] Loading states correctos
- [ ] Error handling correcto

---

## 7. ROLLBACK

En caso de necesitar revertir:

1. **Restaurar TeacherProgressPage.tsx:**
   - Revertir a version anterior sin tabs
   - Remover imports de analytics
   - Remover estados de engagement

2. **Restaurar GamilitSidebar.tsx:**
   - Agregar item analytics de vuelta al array teacherItems
   - Este paso depende de si FASE 5A se revierte tambien

3. **No hay archivos eliminados:**
   - TeacherAnalyticsPage.tsx sigue existiendo
   - Ruta /teacher/analytics sigue funcional

---

## 8. CONSIDERACIONES TECNICAS

### 8.1 Performance

```yaml
Optimizaciones_implementadas:
  - useMemo para queries (evita re-fetches innecesarios)
  - Carga condicional de engagement (solo cuando tab activo)
  - Queries undefined cuando no hay classroom seleccionado

Carga_lazy:
  - Datos de engagement NO se cargan hasta que:
    1. Tab engagement esta activo
    2. Una clase especifica esta seleccionada
```

### 8.2 UX Considerations

```yaml
Flujo_usuario:
  1. Usuario entra a /teacher/progress
  2. Ve contenido de progreso por defecto
  3. Si quiere engagement, click en tab
  4. Debe seleccionar clase primero
  5. Se muestran metricas de engagement

Mensajes_claros:
  - "Selecciona una clase" cuando no hay clase seleccionada
  - Loading spinner mientras carga
  - Error con boton de reintentar
```

### 8.3 Compatibilidad

```yaml
Rutas_legacy:
  - /teacher/analytics: FUNCIONAL (no se elimina)
  - Bookmarks existentes: FUNCIONAN
  - Links externos: FUNCIONAN

Recomendacion_futura:
  - Agregar redirect de /teacher/analytics a /teacher/progress#engagement
  - Esto puede hacerse en una fase posterior
```

---

## 9. ESTRUCTURA FINAL DEL ARCHIVO

```
TeacherProgressPage.tsx (despues de cambios)
├── Imports (originales + nuevos de engagement)
├── ChartJS.register()
├── safeFormat() helper
├── TeacherProgressPage component
│   ├── Estados originales (selectedClassroomId, showClassroomDropdown)
│   ├── Estados nuevos (activeTab, dateRange)
│   ├── Hooks originales (useClassrooms, useClassroomsStats, useUserGamification)
│   ├── Hooks nuevos (useAnalytics - condicional)
│   ├── useMemo (selectedClassroomName, overallStats, analyticsQuery, engagementQuery)
│   ├── Funciones (handleLogout, exportToCSV)
│   └── JSX
│       ├── Header
│       ├── Loading/Error states
│       ├── Stats cards (cuando all selected)
│       ├── Classroom selector
│       ├── Tab switcher (NUEVO)
│       ├── Tab Progress content (contenido original envuelto)
│       └── Tab Engagement content (NUEVO)
```

---

## 10. NOTAS ADICIONALES

### Sobre la ruta /teacher/analytics

La pagina TeacherAnalyticsPage.tsx NO se elimina. Permanece funcional para:
- Usuarios con bookmarks
- Links externos
- Compatibilidad hacia atras

En una fase futura se puede agregar un redirect automatico.

### Sobre el orden de ejecucion

Esta fase (5C) DEBE ejecutarse DESPUES de FASE 5A porque:
1. FASE 5A remueve el item "Analiticas" del sidebar
2. Sin este cambio, habria dos formas de acceder a la misma funcionalidad

### Sobre testing

Se recomienda hacer testing manual exhaustivo porque:
1. La funcionalidad de progreso NO debe cambiar
2. La funcionalidad de engagement debe ser identica a TeacherAnalytics
3. Los tabs deben funcionar correctamente

---

**Estado:** LISTO PARA IMPLEMENTAR
**Prerequisitos:** FASE 5A completada
**Siguiente fase:** Validacion final y ejecucion

