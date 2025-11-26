# Quick Reference: Teacher Analytics

**Última actualización:** 2025-11-24
**Mantenido por:** Frontend-Agent

---

## 🎯 TL;DR

- ✅ `TeacherAnalyticsPage` NO usa predicciones ML
- ✅ Solo usa métricas calculadas que funcionan
- ⚠️ `PerformanceInsightsPanel` (TeacherDashboard) SÍ usa heurísticas
- ✅ Backend implementa todos los endpoints necesarios
- ✅ NO se requieren cambios

---

## 📍 Archivos Clave

### Frontend

```bash
# Página principal de Analytics (LIMPIA)
apps/frontend/src/apps/teacher/pages/TeacherAnalyticsPage.tsx
apps/frontend/src/apps/teacher/pages/TeacherAnalytics.tsx

# Hook de Analytics
apps/frontend/src/apps/teacher/hooks/useAnalytics.ts

# API Service
apps/frontend/src/services/api/teacher/analyticsApi.ts

# Componente con heurísticas (solo en Dashboard)
apps/frontend/src/apps/teacher/components/analytics/PerformanceInsightsPanel.tsx
```

### Backend

```bash
# Service principal
apps/backend/src/modules/teacher/services/analytics.service.ts

# DTOs
apps/backend/src/modules/teacher/dto/analytics.dto.ts
```

---

## 🔌 Endpoints Disponibles

| Endpoint | Método | Usado en | Estado |
|----------|--------|----------|--------|
| `/teacher/analytics` | GET | TeacherAnalytics | ✅ |
| `/teacher/analytics/engagement` | GET | TeacherAnalytics | ✅ |
| `/teacher/analytics/report` | POST | TeacherAnalytics | ✅ |
| `/teacher/analytics/students/:id/insights` | GET | TeacherDashboard | ⚠️ |

---

## 📊 Métricas Disponibles

### En TeacherAnalyticsPage ✅

```typescript
// Tab: Overview
analytics.average_score           // Puntuación promedio
analytics.completion_rate         // Tasa de completitud
analytics.engagement_rate         // Tasa de engagement
analytics.module_stats[]          // Stats por módulo
analytics.scoreDistribution[]     // Distribución por rangos

// Tab: Performance
analytics.student_performance[]   // Rendimiento individual

// Tab: Engagement
engagement.dau                    // Daily Active Users
engagement.wau                    // Weekly Active Users
engagement.session_duration_avg   // Duración promedio
engagement.sessions_per_user      // Sesiones por usuario
engagement.feature_usage[]        // Uso de features
```

### En TeacherDashboard (Insights) ⚠️

```typescript
// Heurísticas (NO ML real)
insights.overall_score            // Score general
insights.risk_level               // low/medium/high
insights.predictions.completion_probability
insights.predictions.dropout_risk
insights.strengths[]
insights.weaknesses[]
insights.recommendations[]
```

---

## 🛠️ Uso del Hook

### useAnalytics (Analytics Page)

```typescript
import { useAnalytics } from '@apps/teacher/hooks/useAnalytics';

const {
  analytics,      // ClassroomAnalytics | null
  engagement,     // EngagementMetrics | null
  loading,        // boolean
  error,          // Error | null
  generateReport, // (config) => Promise<Report>
  refresh,        // () => Promise<void>
} = useAnalytics(
  // Analytics query
  {
    classroom_id: 'classroom-123',
    start_date: '2025-01-01',
    end_date: '2025-01-31',
  },
  // Engagement query
  {
    period: 'daily',
    classroom_id: 'classroom-123',
  }
);

// Uso
if (loading) return <Spinner />;
if (error) return <Error message={error.message} />;

console.log(`Avg Score: ${analytics.average_score}%`);
console.log(`DAU: ${engagement.dau}`);
```

### useStudentInsights (Dashboard)

```typescript
import { useStudentInsights } from '@apps/teacher/hooks/useAnalytics';

const {
  insights,  // StudentInsights | null
  loading,   // boolean
  error,     // Error | null
  refresh,   // () => Promise<void>
} = useStudentInsights('student-123');

// Uso
console.log(`Score: ${insights.overall_score}%`);
console.log(`Risk: ${insights.risk_level}`);
console.log(`Completion: ${insights.predictions.completion_probability}`);
```

---

## 🎨 Componentes UI

### TeacherAnalytics Tabs

```typescript
// Tab switching
const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'engagement'>('overview');

// Tab: Overview
{activeTab === 'overview' && (
  <div>
    <SummaryStats />
    <ModuleScoresChart />
    <CompletionRateChart />
  </div>
)}

// Tab: Performance
{activeTab === 'performance' && (
  <StudentPerformanceTable students={analytics.student_performance} />
)}

// Tab: Engagement
{activeTab === 'engagement' && (
  <div>
    <EngagementMetrics />
    <ComparisonPreviousPeriod />
    <FeatureUsageTable />
  </div>
)}
```

---

## 🔍 Debugging

### Ver datos de Analytics

```typescript
// En consola del navegador
const analytics = useAnalytics();
console.log('Analytics:', analytics);

// Ver llamadas API
// Network tab -> Filter: "analytics"
```

### Ver estado del backend

```bash
# Logs del backend
docker logs gamilit-backend -f | grep "AnalyticsService"

# Test endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/teacher/analytics?classroom_id=xyz
```

---

## 🧪 Testing

### Datos mock para desarrollo

```typescript
// En development, usar datos mock si el endpoint falla
const mockAnalytics: ClassroomAnalytics = {
  average_score: 75.5,
  completion_rate: 68.2,
  engagement_rate: 82.1,
  module_stats: [
    { module_name: 'Módulo 1', average_score: 78, completion_rate: 70 },
    { module_name: 'Módulo 2', average_score: 72, completion_rate: 65 },
  ],
  student_performance: [
    {
      student_id: '1',
      student_name: 'Ana García',
      average_score: 85,
      completion_rate: 90,
      last_active: new Date(),
    },
  ],
};
```

---

## ⚠️ Limitaciones Conocidas

### TeacherAnalyticsPage

- ✅ Sin limitaciones - Totalmente funcional

### PerformanceInsightsPanel

- ⚠️ Predicciones basadas en heurísticas simples (NO ML real)
- ⚠️ `completion_probability` calculado con reglas if/else
- ⚠️ `dropout_risk` estimado, no predictivo real
- ⚠️ Recomendaciones basadas en templates

---

## 🚀 Agregar Nueva Métrica

### 1. Backend (analytics.service.ts)

```typescript
// Agregar a getClassroomAnalytics()
const newMetric = await this.calculateNewMetric(classroomId);

return {
  ...analytics,
  new_metric: newMetric,
};
```

### 2. Frontend Type (teacher/types/index.ts)

```typescript
export interface ClassroomAnalytics {
  // ... existing fields
  new_metric: number;
}
```

### 3. Frontend UI (TeacherAnalytics.tsx)

```typescript
<DetectiveCard>
  <div className="flex items-center gap-3">
    <Icon className="w-8 h-8 text-blue-500" />
    <div>
      <p className="text-sm text-gray-400">Nueva Métrica</p>
      <p className="text-3xl font-bold text-detective-text">
        {analytics.new_metric}
      </p>
    </div>
  </div>
</DetectiveCard>
```

---

## 🎯 Métricas por Tipo

### Calculadas (SQL) ✅

```
Fuente: Queries directas a la base de datos
Precisión: 100%
Tiempo: <100ms
Cache: No necesario
```

### Heurísticas ⚠️

```
Fuente: Reglas if/else sobre datos calculados
Precisión: ~70-80%
Tiempo: <50ms
Cache: 5 minutos
```

### ML (Futuro) 🔮

```
Fuente: Modelos entrenados
Precisión: ~85-95%
Tiempo: 200-500ms
Cache: 30 minutos
```

---

## 📦 Dependencias

### Frontend

```json
{
  "react": "^18.0.0",
  "react-chartjs-2": "^5.2.0",
  "chart.js": "^4.4.0",
  "lucide-react": "latest",
  "zustand": "^4.4.0"
}
```

### Backend

```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "typeorm": "^0.3.0",
  "cache-manager": "^5.2.0"
}
```

---

## 🐛 Troubleshooting

### Error: "No hay datos de analytics"

```typescript
// 1. Verificar que hay estudiantes en el classroom
// 2. Verificar que hay submissions en el rango de fechas
// 3. Ver logs del backend para SQL queries

// 4. Fallback UI
{!analytics && (
  <div className="text-center py-12">
    <p className="text-detective-text-secondary">
      No hay datos disponibles para el período seleccionado
    </p>
  </div>
)}
```

### Error: "Unauthorized"

```typescript
// 1. Verificar token en localStorage
const token = localStorage.getItem('access_token');

// 2. Verificar rol del usuario
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role); // Debe ser 'admin_teacher'

// 3. Renovar token si expiró
await authApi.refreshToken();
```

### Charts no renderizan

```typescript
// 1. Verificar que chart.js está registrado
import { Chart as ChartJS, ... } from 'chart.js';
ChartJS.register(...);

// 2. Verificar que data no está vacío
console.log('Chart data:', moduleScoresChart);

// 3. Verificar que labels y data tienen misma longitud
labels.length === data.length
```

---

## 🔗 Enlaces Útiles

- [Chart.js Docs](https://www.chartjs.org/docs/latest/)
- [React ChartJS 2](https://react-chartjs-2.js.org/)
- [NestJS TypeORM](https://docs.nestjs.com/techniques/database)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)

---

## 📞 Contacto

**Dudas sobre Analytics?**
- Ver: `IMPLEMENTATION-REPORT-TEACHER-ANALYTICS-ML-SCOPE-2025-11-24.md`
- Ver: `TEACHER-ANALYTICS-ARCHITECTURE-MAP-2025-11-24.md`
- Preguntar a: Frontend-Agent o Backend-Agent

---

**Quick Reference v1.0.0**
Última actualización: 2025-11-24
