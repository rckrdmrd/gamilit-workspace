---
titulo: "ET-ANA-004: Progress Charts"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-ANA-004: Progress Charts

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ANA-004 |
| **Modulo** | Analytics |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Implementado |
| **Completitud** | 80% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-ANA-005: Progress Visualization Charts

### User Stories
- US-ANA-005: Visual Progress Tracking

---

## Descripcion Funcional

Sistema de visualizacion de progreso:
- Graficos de linea (progreso en el tiempo)
- Graficos de barras (comparacion por modulo)
- Graficos circulares (distribucion de actividad)
- Heatmaps (actividad por dia/hora)
- Graficos de radar (habilidades)

---

## Arquitectura

### Tecnologias

| Libreria | Uso | Version |
|----------|-----|---------|
| Recharts | Graficos principales | 2.10+ |
| D3.js | Visualizaciones complejas | 7.8+ |
| React Calendar Heatmap | Heatmaps de actividad | 1.9+ |

---

## Implementacion Existente

### Frontend - Progress Charts Components

**Ubicacion:** `apps/frontend/src/features/analytics/components/`

**Estado:** COMPLETO (100%)

#### XP Progress Line Chart

```typescript
interface XPProgressChartProps {
  data: {
    date: string;
    xp: number;
  }[];
  period: 'week' | 'month' | 'year';
}

export const XPProgressChart: React.FC<XPProgressChartProps> = ({
  data,
  period,
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="xp"
          stroke="#F97316"
          strokeWidth={2}
          dot={{ fill: '#F97316' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

#### Module Progress Bar Chart

```typescript
interface ModuleProgressChartProps {
  modules: {
    id: string;
    title: string;
    progress: number;
    color: string;
  }[];
}

export const ModuleProgressChart: React.FC<ModuleProgressChartProps> = ({
  modules,
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={modules} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} />
        <YAxis dataKey="title" type="category" width={150} />
        <Tooltip />
        <Bar dataKey="progress" fill="#3B82F6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
```

#### Activity Pie Chart

```typescript
interface ActivityPieChartProps {
  activities: {
    name: string;
    value: number;
    color: string;
  }[];
}

export const ActivityPieChart: React.FC<ActivityPieChartProps> = ({
  activities,
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={activities}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {activities.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
```

#### Activity Heatmap

**Ubicacion:** `apps/frontend/src/apps/student/components/dashboard/ActivityCalendar.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface ActivityHeatmapProps {
  data: {
    date: string;
    count: number;
  }[];
  startDate: Date;
  endDate: Date;
  colorScale?: string[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  startDate,
  endDate,
  colorScale = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
}) => {
  return (
    <CalendarHeatmap
      startDate={startDate}
      endDate={endDate}
      values={data}
      classForValue={(value) => {
        if (!value || value.count === 0) return 'color-empty';
        return `color-scale-${Math.min(value.count, 4)}`;
      }}
      tooltipDataAttrs={(value) => ({
        'data-tip': value?.date
          ? `${value.date}: ${value.count} actividades`
          : 'Sin actividad',
      })}
    />
  );
};
```

#### Skills Radar Chart

```typescript
interface SkillsRadarChartProps {
  skills: {
    skill: string;
    value: number;
    maxValue: number;
  }[];
}

export const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({
  skills,
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={skills}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis domain={[0, 100]} />
        <Radar
          name="Nivel"
          dataKey="value"
          stroke="#8B5CF6"
          fill="#8B5CF6"
          fillOpacity={0.5}
        />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
};
```

### Backend - Analytics Endpoints

**Ubicacion:** `apps/backend/src/modules/admin/controllers/admin-analytics.controller.ts`

**Estado:** COMPLETO (100%)

| Endpoint | Descripcion |
|----------|-------------|
| GET `/analytics/xp-progress` | Progreso XP por periodo |
| GET `/analytics/module-progress` | Progreso por modulo |
| GET `/analytics/activity-distribution` | Distribucion de actividad |
| GET `/analytics/activity-heatmap` | Heatmap de actividad |
| GET `/analytics/skills` | Radar de habilidades |

---

## Tipos de Graficos

### 1. Progreso en el Tiempo (Line Chart)
- XP ganado por dia/semana/mes
- Ejercicios completados por dia
- Tiempo de estudio por dia

### 2. Comparacion (Bar Chart)
- Progreso por modulo
- Score promedio por tipo de ejercicio
- Rendimiento vs promedio de la clase

### 3. Distribucion (Pie/Donut Chart)
- Tiempo por modulo
- Tipos de ejercicios completados
- Uso de comodines

### 4. Actividad (Heatmap)
- Calendario estilo GitHub
- Intensidad por dia
- Hora mas activa

### 5. Habilidades (Radar Chart)
- Taxonomia Bloom
- Habilidades por modulo
- Comparacion con promedio

---

## Lo que Falta para Completar (20%)

### 1. Comparison Charts (10%)

```typescript
// components/ComparisonChart.tsx (NUEVO)
interface ComparisonChartProps {
  userData: DataPoint[];
  averageData: DataPoint[];
  topPerformerData?: DataPoint[];
}

export const ComparisonChart: React.FC<ComparisonChartProps>;
```

### 2. Interactive Tooltips (5%)

- Tooltips con mas detalle
- Click para drill-down

### 3. Export Charts (5%)

```typescript
// utils/chartExport.ts (NUEVO)
export function exportChartAsPNG(chartRef: RefObject<HTMLDivElement>): void;
export function exportChartAsSVG(chartRef: RefObject<HTMLDivElement>): void;
```

---

## API REST Endpoints

| Metodo | Ruta | Descripcion | Params |
|--------|------|-------------|--------|
| GET | `/analytics/xp-progress` | XP en el tiempo | period, userId |
| GET | `/analytics/module-progress` | Progreso modulos | userId |
| GET | `/analytics/activity-distribution` | Distribucion | userId, period |
| GET | `/analytics/activity-heatmap` | Heatmap | userId, year |
| GET | `/analytics/skills` | Skills radar | userId |
| GET | `/analytics/comparison` | Comparacion | userId, classroomId |

---

## Criterios de Aceptacion

### Funcionales
- [x] Grafico de linea para XP progress
- [x] Grafico de barras para modulos
- [x] Grafico circular para distribucion
- [x] Heatmap de actividad
- [x] Radar de habilidades
- [ ] Grafico de comparacion
- [ ] Export de graficos

### No Funcionales
- [x] Responsive en todos los breakpoints
- [x] Animaciones suaves
- [x] Tooltips informativos
- [x] Performance con datasets grandes
- [ ] Dark mode support

---

## Dependencias

### Bloqueado Por
- Progress Tracking (COMPLETO)
- UserStats Entity (COMPLETO)
- Analytics API (COMPLETO)

### Bloquea
- Automated Reports (PDF generation)
- Teacher Analytics Dashboard
- Admin Analytics Dashboard

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| Comparison Charts | 4h |
| Interactive Tooltips | 3h |
| Export Charts | 3h |
| Dark Mode | 2h |
| Tests | 2h |
| **Total** | **14h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-ANA-004-progress-charts.md*
*Generado: 2026-01-27*
