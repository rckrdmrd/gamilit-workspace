# SIMCO-AGILE-METRICS.md

**Version:** 1.0.0
**Sistema:** SIMCO v4.0.0
**Alias:** @AGILE_METRICS
**Tipo:** Directiva de Metricas

---

## 1. PROPOSITO

Esta directiva define las metricas Agile/Scrum estandarizadas para medir el desempeno de equipos y proyectos en el workspace.

---

## 2. METRICAS DE SPRINT

### 2.1 Velocity

**Definicion:** Story points completados por sprint.

```yaml
velocity:
  formula: "SUM(story_points de HUs COMPLETADAS)"
  unidad: "story points"
  frecuencia: "por sprint"

  calculo:
    - Solo contar HUs que pasaron DoD
    - No contar HUs parcialmente completadas
    - No contar HUs bloqueadas

  tendencia:
    - Calcular promedio de ultimos 3 sprints
    - Usar para planificar siguiente sprint
```

### 2.2 Sprint Burndown

**Definicion:** Trabajo restante vs tiempo.

```yaml
burndown:
  eje_x: "dias del sprint"
  eje_y: "story points restantes"

  actualizacion:
    - Actualizar al completar cada HU
    - Registrar en SPRINT-{N}.yml

  ideal_line:
    - Inicio: total SP planificados
    - Fin: 0 SP al final del sprint
```

### 2.3 Porcentaje de Completitud

```yaml
completitud:
  formula: "(HUs completadas / HUs planificadas) * 100"
  objetivo: ">= 85%"

  desglose:
    completadas: "HUs que pasaron DoD"
    parciales: "HUs con subtareas pendientes"
    bloqueadas: "HUs con bloqueadores activos"
    no_iniciadas: "HUs sin progreso"
```

---

## 3. METRICAS DE CALIDAD

### 3.1 Definition of Ready (DoR) Rate

```yaml
dor_rate:
  formula: "(HUs que pasaron DoR / HUs candidatas) * 100"
  objetivo: ">= 90%"

  cuando_medir: "Sprint Planning"

  acciones_si_bajo:
    - Mejorar refinamiento de backlog
    - Capacitar en escritura de HUs
    - Revisar criterios de DoR
```

### 3.2 Definition of Done (DoD) Rate

```yaml
dod_rate:
  formula: "(HUs que pasaron DoD / HUs intentadas) * 100"
  objetivo: "100%"

  cuando_medir: "Sprint Review"

  acciones_si_bajo:
    - Revisar estimaciones
    - Identificar bloqueos recurrentes
    - Ajustar Definition of Done
```

### 3.3 Bug Escape Rate

```yaml
bug_escape_rate:
  formula: "(Bugs encontrados post-deploy / HUs desplegadas) * 100"
  objetivo: "< 5%"

  clasificacion:
    critico: "Afecta funcionalidad core"
    alto: "Afecta UX significativamente"
    medio: "Problema menor"
    bajo: "Cosmetic/nice-to-have"
```

---

## 4. METRICAS DE TRAZABILIDAD

### 4.1 Cobertura de Documentacion

```yaml
doc_coverage:
  formula: "(Objetos documentados / Objetos totales) * 100"

  por_tipo:
    requirements: "RF documentados"
    specifications: "ET documentados"
    user_stories: "US documentados"
    code: "Funciones/clases documentadas"
```

### 4.2 Cobertura de Tests

```yaml
test_coverage:
  formula: "(Lineas cubiertas / Lineas totales) * 100"

  objetivos:
    backend: ">= 60%"
    frontend: ">= 50%"
    database: ">= 30%"

  gap:
    formula: "Objetivo - Actual"
    accion: "Si gap > 20%, crear HU de mejora"
```

### 4.3 Trazabilidad Bidireccional

```yaml
traceability_score:
  formula: "Promedio de cobertura bidireccional"

  componentes:
    rf_to_code: "% RF con link a codigo"
    code_to_rf: "% Codigo con link a RF"
    rf_to_test: "% RF con tests asociados"

  objetivo: ">= 80%"
```

---

## 5. METRICAS DE PROCESO

### 5.1 Lead Time

```yaml
lead_time:
  definicion: "Tiempo desde solicitud hasta produccion"
  unidad: "dias"

  fases:
    backlog_to_sprint: "Backlog -> Sprint Planning"
    sprint_to_done: "Sprint -> Completada"
    done_to_deploy: "Completada -> Produccion"
```

### 5.2 Cycle Time

```yaml
cycle_time:
  definicion: "Tiempo desde inicio hasta completado"
  unidad: "horas"

  calculo:
    inicio: "Estado: en-progreso"
    fin: "Estado: completada (DoD pass)"
```

### 5.3 Throughput

```yaml
throughput:
  definicion: "HUs completadas por unidad de tiempo"
  unidad: "HUs/sprint"

  formula: "COUNT(HUs completadas) por sprint"
```

---

## 6. DASHBOARD DE METRICAS

### 6.1 Estructura Recomendada

```yaml
dashboard:
  seccion_sprint:
    - Velocity actual vs historico
    - Burndown chart
    - Completitud %
    - HUs por estado

  seccion_calidad:
    - DoR Rate
    - DoD Rate
    - Bug Escape Rate
    - Test Coverage

  seccion_trazabilidad:
    - Doc Coverage
    - Traceability Score
    - Health Score

  seccion_tendencias:
    - Velocity (ultimos 6 sprints)
    - Completitud (ultimos 6 sprints)
    - Bug Rate (ultimos 6 sprints)
```

### 6.2 Frecuencia de Actualizacion

| Metrica | Frecuencia | Responsable |
|---------|------------|-------------|
| Velocity | Por sprint | Scrum Master |
| Burndown | Diario | Dev Team |
| DoR/DoD Rate | Por sprint | Scrum Master |
| Test Coverage | Por commit | CI/CD |
| Health Score | Semanal | Tech Lead |

---

## 7. ALERTAS Y UMBRALES

### 7.1 Alertas Criticas

```yaml
alertas_criticas:
  velocity_drop:
    condicion: "Velocity < 60% del promedio"
    accion: "Revisar en retrospectiva"

  dod_fail:
    condicion: "DoD Rate < 80%"
    accion: "Reunion de impedimentos"

  bug_spike:
    condicion: "Bug Escape Rate > 10%"
    accion: "Code review obligatorio"
```

### 7.2 Alertas de Atencion

```yaml
alertas_atencion:
  doc_gap:
    condicion: "Doc Coverage < 70%"
    accion: "Planificar HU de documentacion"

  test_gap:
    condicion: "Test Coverage < objetivo - 20%"
    accion: "Planificar HU de tests"
```

---

## 8. REPORTES

### 8.1 Reporte de Sprint

Usar TEMPLATE-REPORTE-SPRINT.md con secciones:
- Resumen de metricas
- Comparativa vs sprint anterior
- Tendencias
- Action items

### 8.2 Reporte Trimestral

Consolidar:
- Promedio de velocity
- Tendencia de calidad
- Evolucion de cobertura
- Lecciones aprendidas

---

## 9. REFERENCIAS

- @SPRINT_EXECUTION: Ciclo de Sprint
- @TPL_SPRINT_BACKLOG: Template de Sprint
- @TPL_RETROSPECTIVA: Template de Retro
- TEMPLATE-REPORTE-SPRINT.md: Reporte de Sprint

---

**Directiva:** SIMCO-AGILE-METRICS.md
**Version:** 1.0.0
**Categoria:** Metricas

