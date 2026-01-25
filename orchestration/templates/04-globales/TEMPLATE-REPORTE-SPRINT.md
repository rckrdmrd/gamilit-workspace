# REPORTE DE SPRINT: {PROYECTO} - Sprint {N}

**Periodo:** {YYYY-MM-DD} al {YYYY-MM-DD}
**Proyecto:** {PROJECT_NAME}
**Generado:** {YYYY-MM-DD}
**Generado por:** {Agente/Humano}

---

## RESUMEN EJECUTIVO

```yaml
sprint_goal: "{Objetivo del sprint}"

estado_general: "{COMPLETADO | PARCIAL | FALLIDO}"

metricas_clave:
  hus_planificadas: {N}
  hus_completadas: {N}
  hus_parciales: {N}
  hus_no_iniciadas: {N}
  porcentaje_completado: {X}%

  tareas_tecnicas: {N}
  tareas_completadas: {N}

  bugs_encontrados: {N}
  bugs_resueltos: {N}

  hus_derivadas_generadas: {N}
```

---

## 1. HISTORIAS DE USUARIO

### 1.1 Completadas

| ID | Titulo | Puntos | Agentes | Notas |
|----|--------|--------|---------|-------|
| {HU-XXX} | {titulo} | {pts} | {agentes} | {notas} |

### 1.2 Parcialmente Completadas

| ID | Titulo | Progreso | Bloqueador | Siguiente Paso |
|----|--------|----------|------------|----------------|
| {HU-XXX} | {titulo} | {X}% | {bloqueador} | {siguiente} |

### 1.3 No Iniciadas / Movidas a Backlog

| ID | Titulo | Razon |
|----|--------|-------|
| {HU-XXX} | {titulo} | {razon por la que no se hizo} |

---

## 2. PROGRESO POR CAPA

### 2.1 Database

```yaml
estado: "{OK | EN_PROGRESO | BLOQUEADO}"
cambios:
  schemas_nuevos: {N}
  tablas_nuevas: {N}
  tablas_modificadas: {N}
  funciones_nuevas: {N}
  seeds_actualizados: {N}

validaciones:
  carga_limpia: "{PASA | FALLA}"
  integridad_referencial: "{OK | ISSUES}"

inventario_actualizado: "{SI | NO}"
```

### 2.2 Backend

```yaml
estado: "{OK | EN_PROGRESO | BLOQUEADO}"
cambios:
  modulos_nuevos: {N}
  entities_nuevas: {N}
  endpoints_nuevos: {N}
  endpoints_modificados: {N}

validaciones:
  build: "{PASA | FALLA}"
  lint: "{PASA | FALLA}"
  tests: "{PASA | FALLA}"
  cobertura: "{X}%"

inventario_actualizado: "{SI | NO}"
```

### 2.3 Frontend

```yaml
estado: "{OK | EN_PROGRESO | BLOQUEADO}"
cambios:
  componentes_nuevos: {N}
  paginas_nuevas: {N}
  hooks_nuevos: {N}

validaciones:
  build: "{PASA | FALLA}"
  lint: "{PASA | FALLA}"
  tests: "{PASA | FALLA}"
  cobertura: "{X}%"

inventario_actualizado: "{SI | NO}"
```

---

## 3. CALIDAD

### 3.1 Metricas de Testing

| Capa | Tests | Pasando | Fallando | Cobertura | Objetivo |
|------|-------|---------|----------|-----------|----------|
| Backend | {N} | {N} | {N} | {X}% | 60% |
| Frontend | {N} | {N} | {N} | {X}% | 40% |
| E2E | {N} | {N} | {N} | - | - |

### 3.2 Bugs

| ID | Severidad | Descripcion | Estado | Resolucion |
|----|-----------|-------------|--------|------------|
| {BUG-XXX} | {CRITICAL/HIGH/MEDIUM/LOW} | {desc} | {estado} | {resolucion} |

### 3.3 Deuda Tecnica

| Item | Tipo | Impacto | Accion Sugerida |
|------|------|---------|-----------------|
| {item} | {tipo} | {impacto} | {accion} |

---

## 4. HUS DERIVADAS GENERADAS

| ID | Origen | Tipo | Prioridad | Descripcion |
|----|--------|------|-----------|-------------|
| DERIVED-{HU}-001 | {HU-XXX} | {tipo} | {P0-P3} | {descripcion} |

**Resumen:**
- Total generadas: {N}
- Ya planificadas: {N}
- En backlog: {N}

---

## 5. DOCUMENTACION

### 5.1 Actualizaciones de Docs

| Documento | Estado | Responsable |
|-----------|--------|-------------|
| MASTER_INVENTORY.yml | {ACTUALIZADO | PENDIENTE} | {agente} |
| DATABASE_INVENTORY.yml | {ACTUALIZADO | PENDIENTE} | {agente} |
| BACKEND_INVENTORY.yml | {ACTUALIZADO | PENDIENTE} | {agente} |
| FRONTEND_INVENTORY.yml | {ACTUALIZADO | PENDIENTE} | {agente} |
| Trazas | {ACTUALIZADO | PENDIENTE} | {agente} |

### 5.2 ADRs Creados

| ADR | Titulo | Decision |
|-----|--------|----------|
| ADR-{NNN} | {titulo} | {decision tomada} |

---

## 6. BLOQUEADORES Y RIESGOS

### 6.1 Bloqueadores Activos

| ID | Descripcion | Impacto | Responsable | ETA Resolucion |
|----|-------------|---------|-------------|----------------|
| {B-XXX} | {descripcion} | {que bloquea} | {quien} | {fecha} |

### 6.2 Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| {riesgo} | {ALTA/MEDIA/BAJA} | {ALTO/MEDIO/BAJO} | {accion} |

---

## 7. METRICAS DE AGENTES

### 7.1 Participacion por Agente

| Agente | Tareas Asignadas | Completadas | Delegaciones |
|--------|------------------|-------------|--------------|
| Database-Agent | {N} | {N} | {N} |
| Backend-Agent | {N} | {N} | {N} |
| Frontend-Agent | {N} | {N} | {N} |
| {Otros} | {N} | {N} | {N} |

### 7.2 Coordinacion

- Delegaciones exitosas: {N}
- Delegaciones con issues: {N}
- Propagaciones completadas: {N}
- Propagaciones pendientes: {N}

---

## 8. LECCIONES APRENDIDAS

### 8.1 Lo que funciono bien

1. {leccion 1}
2. {leccion 2}
3. {leccion 3}

### 8.2 Lo que se puede mejorar

1. {mejora 1}
2. {mejora 2}
3. {mejora 3}

### 8.3 Acciones para siguiente sprint

| Accion | Responsable | Prioridad |
|--------|-------------|-----------|
| {accion} | {quien} | {ALTA/MEDIA/BAJA} |

---

## 9. PLAN PARA SIGUIENTE SPRINT

### 9.1 HUs Candidatas

| ID | Titulo | Prioridad | Dependencias |
|----|--------|-----------|--------------|
| {HU-XXX} | {titulo} | {P0-P3} | {dependencias} |

### 9.2 Deuda Tecnica a Abordar

| Item | Razon |
|------|-------|
| {item} | {por que ahora} |

### 9.3 Objetivos Propuestos

1. {objetivo 1}
2. {objetivo 2}
3. {objetivo 3}

---

## 10. ANEXOS

### 10.1 Commits Relevantes

```
{lista de commits importantes del sprint}
```

### 10.2 Referencias

- Trazas: `orchestration/trazas/`
- Inventarios: `orchestration/inventarios/`
- PROXIMA-ACCION: `orchestration/PROXIMA-ACCION.md`

---

**Template Version:** 1.0.0 | **Sistema:** SIMCO + CAPVED
