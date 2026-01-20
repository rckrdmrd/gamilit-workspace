# Especificaciones Técnicas - EXT-001

**EPIC:** EXT-001 - Portal de Maestros
**Última actualización:** 2026-01-20

---

## Resumen

Especificaciones técnicas formales para el Portal de Maestros.

---

## Índice de Especificaciones

| ID | Título | Tipo | Estado | Resuelve |
|----|--------|------|--------|----------|
| **[SPEC-AT-RISK-001](./AT-RISK-LOGIC-STANDARD.md)** | Lógica de Detección At-Risk | Estándar | ✅ Aprobado | INC-4 |
| **[SPEC-DASH-REP-001](./DASHBOARD-REPORTS-INTEGRATION.md)** | Integración Dashboard-Reports | Integración | ✅ Aprobado | GAP-3 |
| **[SPEC-PERF-TREND-001](./PERFORMANCE-TREND-SPEC.md)** | Performance Trend (Tendencias de Rendimiento) | Especificacion Tecnica | ⏳ Propuesto | GAP-6 |
| **[SPEC-UAT-001 (GAP-2)](./USER-ACTIVITY-TRACKING-DEPENDENCY.md)** | Dependencia Activity Tracking para Engagement | Dependency Analysis | ⏳ Documentado | GAP-2 |

---

## Descripción de Especificaciones

### SPEC-AT-RISK-001: Lógica de Detección At-Risk

**Propósito:** Estandarizar la lógica de detección de estudiantes "en riesgo" para garantizar consistencia entre todas las historias de usuario, endpoints y componentes.

**Fórmula Oficial:**
```
at_risk = (average_grade < 70%) OR (completion_rate < 50%)
```

**Afecta a:**
- US-PM-004a (Progress Analytics)
- US-PM-005a (Classroom Analytics)
- Intervention Alerts System

---

### SPEC-DASH-REP-001: Integración Dashboard-Reports

**Propósito:** Documentar los puntos de integración entre el Dashboard (US-PM-000) y el módulo de Reports (US-PM-005b).

**Incluye:**
- Quick Actions para generar reportes
- Navegación desde ClassroomCards
- Query parameters soportados
- Componentes de integración

---

### SPEC-PERF-TREND-001: Performance Trend (GAP-6)

**Propósito:** Especificar la implementacion de `performance_trend[]` y `trend[]` que faltan en el backend para cumplir con US-PM-004a y US-PM-005a.

**Estado:** ⏳ Propuesto (pendiente de aprobacion)

**Resuelve GAP-6:**
- US-PM-004a especifica `performance_trend[]` pero backend NO lo implementa
- US-PM-005a especifica `trend[]` pero backend NO lo implementa

**Incluye:**
- DTOs unificados (`PerformanceTrendItemDto`)
- Metodos de calculo por semana ISO
- Query SQL de referencia
- Criterios de aceptacion
- Estimacion: 5.5 SP

---

### SPEC-UAT-001: Seguimiento de Actividad de Usuario

**Propósito:** Definir el sistema de seguimiento de actividad del usuario para propósitos de auditoría, análisis de uso y cumplimiento de normativas.

**Estado:** ⏳ En Progreso

**Será incluido:**
- Eventos de actividad a capturar
- Estructuras de datos para logs
- Retención y limpieza de datos
- Reportes de actividad
- Integración con el sistema de seguridad

---

## Especificaciones Pendientes

| ID | Título | RF Relacionado | Prioridad |
|----|--------|----------------|-----------|
| ET-PM-001 | Arquitectura Portal Maestros | RF-PM-* | Baja |
| ET-PM-002 | API Endpoints Maestros | RF-PM-* | Baja |
| ET-PM-003 | Componentes Frontend | RF-PM-* | Baja |

**Nota:** Las especificaciones técnicas detalladas (ET-*) se crearán según necesidad.

---

**Generado:** 2026-01-20
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
