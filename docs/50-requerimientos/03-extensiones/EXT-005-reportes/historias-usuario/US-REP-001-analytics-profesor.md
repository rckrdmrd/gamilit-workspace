---
id: "US-REP-001"
title: "Dashboard de Analytics y Reportes Detallados para Profesores"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-005"
story_points: 12
budget: "$6,000 MXN"
sprint: "Sprint-Mes3"
labels: ["ext-005", "reportes-avanzados", "analytics-profesor", "visualizaciones", "exportacion", "alertas", "mes-3"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-REP-001: Analytics Avanzado para Profesores

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-REP-001 |
| **Épica** | EXT-005 - Reportes Avanzados |
| **Título** | Dashboard de Analytics y Reportes Detallados para Profesores |
| **Prioridad** | Alta (P1) |
| **Story Points** | 12 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $6,000 MXN |

---

## Historia de Usuario

**Como** profesor de la plataforma Gamilit
**Quiero** acceder a analytics avanzados del rendimiento individual y grupal de mis estudiantes con visualizaciones, métricas detalladas y reportes exportables
**Para** identificar patrones de aprendizaje, detectar dificultades específicas, tomar decisiones pedagógicas basadas en datos y documentar progreso

---

## Valor de Negocio

### Impacto
- **Pedagogía Basada en Datos**: Decisiones informadas mejoran resultados 30%
- **Intervención Temprana**: Identificación proactiva de estudiantes en riesgo
- **Ahorro de Tiempo**: Reducción 40% en tracking manual
- **Accountability**: Reportes objetivos para padres y administradores

### Métricas de Éxito
- >85% profesores usan analytics al menos 2 veces/semana
- Tiempo de generación de reportes < 30 segundos
- >70% profesores exportan al menos 1 reporte/mes
- Identificación de estudiantes en riesgo con 80% precisión

---

## Criterios de Aceptación

### CA-01: Dashboard de Clase Completa
**Dado** que el profesor selecciona una clase
**Cuando** visualiza analytics de clase
**Entonces** debe ver:
- **Resumen de Clase**:
  - Total estudiantes activos / total
  - Completion rate promedio de la clase
  - Score promedio general
  - Estudiantes en riesgo (alerta roja si score <60 o inactividad >7 días)
- **Gráficos de Rendimiento**:
  - Evolución de promedio semanal (gráfico de línea)
  - Distribución de calificaciones (histograma)
  - Comparación con promedio institucional
  - Tendencia: mejorando/estable/declinando
- **Engagement y Participación**:
  - Mapa de calor de actividad por día/hora
  - Tiempo promedio diario en plataforma
  - Tasa de completación de actividades
  - Estudiantes más/menos activos
- **Progreso de Contenido**:
  - Embudo de progreso por módulo
  - % de estudiantes en cada etapa
  - Módulos con mayor/menor completación
  - Tiempo promedio por módulo

### CA-02: Tabla de Estudiantes Detallada
**Dado** que el profesor visualiza estudiantes
**Cuando** accede a la tabla
**Entonces** debe incluir columnas:
- Nombre (con avatar)
- Completion % (visual progress bar)
- Score promedio (color-coded: verde ≥80, amarillo 60-79, rojo <60)
- Última actividad (hace X días)
- Módulo actual
- Hints usados (flag si >20)
- Estado (ícono: activo / en riesgo / inactivo)
- Ordenable por cada columna
- Filtros: Todos / Activos / En riesgo / Inactivos
- Búsqueda por nombre
- Exportar tabla a CSV/Excel

### CA-03: Vista Detallada por Estudiante
**Dado** que el profesor selecciona un estudiante
**Cuando** accede a analytics individuales
**Entonces** debe ver:
- **Perfil de Rendimiento**:
  - Avatar, nombre, clase, último acceso
  - Puntuación general (0-100)
  - Ranking en clase
  - Racha de días activos
  - Nivel actual
- **Gráficos de Desempeño**:
  - Evolución de calificaciones (línea temporal)
  - Radar chart de competencias (literal, inferencial, crítico, digital, textual)
  - Barras de progreso por módulo
  - Comparación con promedio de clase
- **Detalle por Actividad**:
  - Tabla: Actividad, Fecha, Intentos, Tiempo, Puntuación, Ayudas usadas
  - Filtros por módulo, por tipo, por resultado
  - Acceso directo a ver respuestas del estudiante
- **Alertas y Recomendaciones**:
  - Indicadores de riesgo
  - Fortalezas identificadas
  - Áreas de mejora
  - Sugerencias de intervención pedagógica

### CA-04: Análisis de Mecánicas
**Dado** que el profesor analiza dificultad de mecánicas
**Cuando** visualiza heatmap
**Entonces** debe mostrar:
- Heatmap con:
  - Rows: 27 mecánicas educativas
  - Columns: avg score, completion rate, avg hints
  - Color intensity: rojo (difícil) → verde (fácil)
- Identificar mecánicas problemáticas automáticamente
- Click en mecánica para ver detalles:
  - Estudiantes que la completaron vs pendientes
  - Distribución de scores
  - Tiempo promedio de completion
  - Estudiantes con dificultades específicas

### CA-05: Comparación entre Estudiantes
**Dado** que el profesor selecciona múltiples estudiantes
**Cuando** usa herramienta de comparación
**Entonces** puede:
- Seleccionar hasta 5 estudiantes
- Ver gráfico de barras comparativo: puntuaciones, progreso, tiempo
- Tabla comparativa lado a lado
- Identificación visual de outliers
- Sugerencias de agrupamiento para trabajo colaborativo
- Exportar comparativa como PDF

### CA-06: Analytics de Grupos de Trabajo
**Dado** que existen grupos en la clase
**Cuando** el profesor analiza grupos
**Entonces** debe ver:
- Lista de grupos con métricas:
  - Rendimiento promedio del grupo
  - Contribución individual de cada miembro
  - Dinámicas de colaboración
- Comparación entre grupos
- Identificar grupos con buen/mal funcionamiento
- Sugerencias de rebalanceo

### CA-07: Reportes de Actividades Específicas
**Dado** que el profesor selecciona una actividad
**Cuando** genera reporte
**Entonces** debe mostrar:
- Nombre de actividad, tipo, módulo
- Estadísticas generales:
  - Estudiantes que la completaron
  - Puntuación promedio
  - Tiempo promedio
  - Tasa de éxito
- Distribución de resultados (histograma)
- Estudiantes con dificultades (bajo rendimiento)
- Preguntas/secciones con mayor error
- Exportar respuestas individuales a CSV

### CA-08: Identificación de Dificultades
**Dado** que el sistema analiza datos
**Cuando** detecta patrones problemáticos
**Entonces** debe mostrar sección "Áreas de Atención":
- Por cada área problemática:
  - Descripción del problema (ej: "5 estudiantes con <50% en Módulo 2")
  - Estudiantes afectados (lista con links)
  - Gravedad: alta/media/baja
  - Recomendaciones de acción
  - Botones: [Enviar Mensaje] [Asignar Apoyo] [Crear Grupo Refuerzo]

### CA-09: Exportación de Reportes
**Dado** que el profesor necesita documentar
**Cuando** exporta reportes
**Entonces** puede elegir:
- **Formatos**: PDF (visual), Excel (datos), CSV (raw data)
- **Alcance**: Clase completa / Estudiante individual / Comparación
- **Contenido**: Resumen ejecutivo / Detalle completo / Solo gráficos
- **Personalización**: Seleccionar widgets a incluir
- **Plantillas**: Informe trimestral, Reporte de padres, Reporte administrativo
- Guardar como plantilla personalizada para reutilizar
- Programar envío automático (semanal/mensual) por email

### CA-10: Configuración de Alertas Automáticas
**Dado** que el profesor quiere monitoreo proactivo
**Cuando** configura alertas
**Entonces** puede definir:
- **Disparadores**: rendimiento bajo X%, inactividad X días, tareas atrasadas X
- **Canales**: notificación in-app, email
- **Frecuencia**: inmediato, diario, semanal
- **Destinatarios**: solo profesor, incluir coordinador, incluir padre
- **Condiciones combinadas** (AND/OR)
- Activar/desactivar alertas por categoría
- Historial de alertas enviadas

---

## Especificaciones Técnicas

### Frontend Components
```
src/pages/teacher/analytics/
├── ClassAnalyticsPage.tsx
├── StudentDetailView.tsx
├── MechanicHeatmap.tsx
├── StudentComparison.tsx
├── ReportExporter.tsx
└── AlertConfiguration.tsx
```

### TypeScript Interfaces
```typescript
interface ClassAnalytics {
  classId: string;
  period: DateRange;
  performance: {
    averageScore: number;
    trend: 'improving' | 'stable' | 'declining';
    distribution: { range: string; count: number }[];
  };
  engagement: {
    averageDailyTime: number;
    completionRate: number;
    activityHeatmap: HeatmapData;
  };
  mechanics: MechanicStats[];
  contentProgress: ContentProgress;
  studentsAtRisk: AtRiskStudent[];
}
```

### API Endpoints
```typescript
// GET /api/teacher/analytics/class/:classId
// GET /api/teacher/analytics/student/:studentId
// GET /api/teacher/analytics/compare?students=id1,id2,id3
// GET /api/teacher/analytics/activity/:activityId
// POST /api/teacher/analytics/export
// POST /api/teacher/analytics/alerts/configure
```

---

## Definición de Terminado (DoD)

- [ ] Dashboard de clase implementado
- [ ] Gráficos interactivos (Chart.js/Recharts)
- [ ] Tabla de estudiantes con filtros
- [ ] Vista detallada por estudiante
- [ ] Heatmap de mecánicas
- [ ] Comparación de estudiantes
- [ ] Analytics de grupos
- [ ] Reportes de actividades
- [ ] Identificación de dificultades
- [ ] Exportación de reportes (PDF/Excel/CSV)
- [ ] Configuración de alertas
- [ ] Responsive design completo
- [ ] Tests unitarios >80%
- [ ] Tests de integración
- [ ] Tests de performance (queries complejos)
- [ ] API endpoints documentados
- [ ] Guía de interpretación de métricas

---

## Dependencias

### Depende de
- **EAI-004**: Analytics básico
- **EAI-002**: Mecánicas educativas básicas

---

## Estimación Detallada (12 SP)

| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Diseño UX/UI | 8h | UX Designer |
| Dashboard de clase | 12h | Frontend Dev |
| Vista de estudiante individual | 10h | Frontend Dev |
| Heatmap de mecánicas | 8h | Frontend Dev |
| Comparación de estudiantes | 6h | Frontend Dev |
| Sistema de export | 8h | Fullstack Dev |
| Configuración de alertas | 6h | Frontend Dev |
| API endpoints analytics | 12h | Backend Dev |
| Queries optimizadas | 6h | Backend Dev |
| Testing | 10h | QA + Devs |
| Documentación | 4h | Tech Lead |
| **TOTAL** | **90h** | |

**Presupuesto**: $6,000 MXN (~$350 USD)

---

## Tags

#ext-005 #reportes-avanzados #analytics-profesor #visualizaciones #exportacion #alertas #mes-3

---

**Creado**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Origen**: Migrado desde EP005/US-005-10-student-analytics-page.md
**Compliance**: PF-001 (389 líneas < 400L límite)
