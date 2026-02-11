# ET-ADM-010: Dashboard de Analytics

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ADM-010 |
| **Modulo** | Admin Extendido |
| **Titulo** | Implementacion del Dashboard de Analytics |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-25 |
| **Ultima Actualizacion** | 2026-01-25 |
| **Autor** | Architecture Analyst |

---

## Referencias

### User Stories
- US-AE-016: Dashboard de Analytics
- US-AE-017: Metricas de Engagement

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - AdminAnalyticsPage                                     |
|  - OverviewTab                                            |
|  - EngagementTab                                          |
|  - GamificationTab                                        |
|  - RetentionTab                                           |
|  - useAnalytics (hook)                                    |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - AdminAnalyticsController                              |
|  - AdminAnalyticsService                                 |
+-----------------------------+----------------------------+
                              | SQL Queries + Aggregations
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - progress_tracking.*                                   |
|  - gamification_system.*                                 |
|  - auth_management.*                                     |
+----------------------------------------------------------+
```

---

## Implementacion Backend

### Controller

**Ubicacion:** `apps/backend/src/admin/controllers/admin-analytics.controller.ts`

```typescript
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AdminAnalyticsController {
  @Get('overview')
  async getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('engagement')
  async getEngagement() {
    return this.analyticsService.getEngagement();
  }

  @Get('gamification')
  async getGamification() {
    return this.analyticsService.getGamification();
  }

  @Get('activity-timeline')
  async getActivityTimeline(@Query('days') days: number = 30) {
    return this.analyticsService.getActivityTimeline(days);
  }

  @Get('top-users')
  async getTopUsers(@Query('limit') limit: number = 10) {
    return this.analyticsService.getTopUsers(limit);
  }

  @Get('retention')
  async getRetention() {
    return this.analyticsService.getRetention();
  }

  @Post('export')
  async exportToCSV() {
    return this.analyticsService.exportToCSV();
  }
}
```

---

## Implementacion Frontend

### Pagina Principal

**Ubicacion:** `apps/frontend/src/apps/admin/pages/AdminAnalyticsPage.tsx`

### Estructura de Tabs

```
AdminLayout
  └── Container
      ├── Header
      │   ├── Title: "Analytics"
      │   └── Actions (Refresh, Export)
      │
      ├── Tab Navigation
      │   ├── General (BarChart3)
      │   ├── Engagement (Users) - Badge: "Datos limitados"
      │   ├── Gamificacion (Award)
      │   └── Retencion (Target) - Badge: "Beta"
      │
      └── Tab Content
          ├── OverviewTab
          ├── EngagementTab
          ├── GamificationTab
          └── RetentionTab
```

### Custom Hook: useAnalytics

**Ubicacion:** `apps/frontend/src/apps/admin/hooks/useAnalytics.ts`

```typescript
interface UseAnalyticsReturn {
  overview: AnalyticsOverview;
  engagement: EngagementAnalytics;
  gamification: GamificationAnalytics;
  activityTimeline: DailyActivity[];
  topUsers: TopUser[];
  retention: RetentionAnalytics;
  isLoading: boolean;
  error: string;
  refresh: () => Promise<void>;
  exportToCSV: () => Promise<void>;
}
```

### Local State

```typescript
activeTab: 'overview' | 'engagement' | 'gamification' | 'retention'
isExporting: boolean
toast: { type: 'success' | 'error', message: string } | null
```

---

## Tabs de Analytics

### OverviewTab (General)

**Contenido:**
- Metricas clave (KPIs)
- Timeline de actividad (30 dias)
- Top 10 usuarios por XP
- Graficos de tendencias

**Metricas:**
| Metrica | Descripcion |
|---------|-------------|
| Total Usuarios | Usuarios registrados |
| Usuarios Activos | Usuarios activos (30d) |
| Ejercicios Completados | Total ejercicios resueltos |
| XP Promedio | XP promedio por usuario |

### EngagementTab

**Contenido:**
- Analisis por segmento de usuario
- Patrones de uso
- Tiempo promedio de sesion
- Frecuencia de visitas

**Nota:** Badge "Datos limitados" - Requiere acumulacion de datos historicos.

### GamificationTab

**Contenido:**
- Distribucion de XP
- Distribucion de niveles
- Distribucion de rangos
- Logros desbloqueados

**Metricas:**
| Metrica | Descripcion |
|---------|-------------|
| XP Distribution | Histograma de XP |
| Level Distribution | Usuarios por nivel |
| Rank Distribution | Usuarios por rango |
| Achievement Rate | % de logros desbloqueados |

### RetentionTab

**Contenido:**
- Analisis de cohortes
- Retencion dia 1, 7, 30
- Churn rate
- Reactivacion

**Nota:** Badge "Beta" - Requiere minimo 30 dias de datos.

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/admin/analytics/overview` | Metricas generales |
| GET | `/api/admin/analytics/engagement` | Engagement por segmento |
| GET | `/api/admin/analytics/gamification` | Stats de gamificacion |
| GET | `/api/admin/analytics/activity-timeline` | Actividad diaria |
| GET | `/api/admin/analytics/top-users` | Top usuarios |
| GET | `/api/admin/analytics/retention` | Analisis de retencion |
| POST | `/api/admin/analytics/export` | Exportar a CSV |

---

## Tipos TypeScript

### AnalyticsOverview

```typescript
interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalExercises: number;
  exercisesCompletedToday: number;
  averageXP: number;
  averageLevel: number;
  totalCoinsEarned: number;
}
```

### EngagementAnalytics

```typescript
interface EngagementAnalytics {
  segments: UserSegment[];
  sessionMetrics: {
    averageDuration: number;
    averageFrequency: number;
    bounceRate: number;
  };
  peakHours: number[];
}
```

### GamificationAnalytics

```typescript
interface GamificationAnalytics {
  xpDistribution: Distribution[];
  levelDistribution: Distribution[];
  rankDistribution: RankDistribution[];
  achievementStats: {
    totalUnlocked: number;
    averagePerUser: number;
    mostCommon: Achievement[];
  };
}
```

### RetentionAnalytics

```typescript
interface RetentionAnalytics {
  cohorts: CohortData[];
  retentionRates: {
    day1: number;
    day7: number;
    day30: number;
  };
  churnRate: number;
  reactivationRate: number;
}
```

### DailyActivity

```typescript
interface DailyActivity {
  date: string;
  activeUsers: number;
  exercises: number;
  xpEarned: number;
}
```

### TopUser

```typescript
interface TopUser {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  totalXP: number;
  level: number;
  rankTitle: string;
}
```

---

## Exportacion CSV

### Formato

**Nombre:** `analytics-overview-{timestamp}.csv`

**Columnas:**
- Fecha
- Usuarios Activos
- Nuevos Usuarios
- Ejercicios Completados
- XP Total Ganado
- Promedio Session Duration

---

## Funcionalidades

1. **Dashboard Multi-Tab:**
   - Navegacion entre 4 tabs
   - Badges indicando estado de datos
   - Tooltips explicativos

2. **Visualizaciones:**
   - Graficos de linea (timeline)
   - Graficos de barra (distribucion)
   - Tablas de ranking

3. **Refresh y Export:**
   - Actualizacion manual
   - Exportacion CSV
   - Toast notifications

4. **Estados de Carga:**
   - Loading global
   - Error handling
   - Empty states

---

## Notas de Implementacion

### Limitaciones Actuales

1. **Engagement Tab:**
   - Requiere acumulacion de datos
   - Algunos segmentos pueden estar vacios

2. **Retention Tab:**
   - Requiere minimo 30 dias de datos
   - Analisis de cohortes preliminar

### Mejoras Futuras

- Filtros por rango de fechas
- Comparacion de periodos
- Alertas automaticas
- Exportacion programada

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-25 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-ADM-010-analytics.md*
*Generado: 2026-01-25*
