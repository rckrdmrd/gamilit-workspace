# MODE-ANALYSIS: Solo Analisis

**ID:** MODE-ANALYSIS
**Version:** 1.0.0
**Alias:** `@ANALYSIS`
**Estado:** Activo

---

## Descripcion

Modo de ejecucion para investigacion y analisis sin modificar codigo.
Ejecuta solo las fases C (Contexto), A (Analisis) y P (Planeacion) del
ciclo CAPVED, generando un plan o reporte sin implementar cambios.

---

## Fases de Ejecucion

### Fase C: CONTEXTO
```yaml
objetivo: Entender el alcance de la investigacion
actividades:
  - Identificar proyecto(s) a analizar
  - Clasificar tipo de analisis (problema/auditoria/exploracion/propuesta)
  - Cargar contexto del proyecto
  - Identificar areas de interes

output:
  - Alcance definido
  - Areas de investigacion identificadas
```

### Fase A: ANALISIS
```yaml
objetivo: Investigar y mapear estado actual
actividades:
  - Leer documentacion relevante
  - Explorar codigo fuente
  - Mapear arquitectura actual
  - Identificar patrones y anti-patrones
  - Documentar hallazgos
  - Analizar dependencias si aplica
  - Identificar problemas o mejoras potenciales

output:
  - Mapa del estado actual
  - Hallazgos documentados
  - Problemas identificados (si aplica)
```

### Fase P: PLANEACION
```yaml
objetivo: Proponer plan de accion (sin ejecutar)
actividades:
  - Proponer soluciones o mejoras
  - Desglosar en tareas potenciales
  - Estimar impacto de cada propuesta
  - Identificar dependencias entre tareas
  - Priorizar recomendaciones

output:
  - Plan propuesto (no ejecutado)
  - Recomendaciones priorizadas
  - Estimacion de impacto
```

---

## Triggers Automaticos

### Ninguno
```yaml
nota: |
  MODE-ANALYSIS no activa triggers automaticos ya que
  no modifica codigo. Solo genera reportes y propuestas.
```

---

## Tipos de Analisis Soportados

### 1. Investigacion de Problemas
```yaml
uso: "Cuando algo no funciona y se necesita encontrar la causa"
entregable: "Reporte con causa raiz y propuesta de solucion"
ejemplo: "@ANALYSIS Investigar por que falla login en Student Portal"
```

### 2. Auditoria de Codigo
```yaml
uso: "Revisar calidad, seguridad o cumplimiento de estandares"
entregable: "Reporte de auditoria con hallazgos y recomendaciones"
ejemplo: "@ANALYSIS Auditar seguridad del modulo de pagos"
```

### 3. Exploracion de Codebase
```yaml
uso: "Entender como funciona una parte del sistema"
entregable: "Documentacion del funcionamiento actual"
ejemplo: "@ANALYSIS Documentar flujo de autenticacion en erp-core"
```

### 4. Propuesta de Arquitectura
```yaml
uso: "Disenar solucion para nueva funcionalidad"
entregable: "Propuesta tecnica con opciones y trade-offs"
ejemplo: "@ANALYSIS Proponer arquitectura para sistema de reportes"
```

### 5. Analisis de Dependencias
```yaml
uso: "Mapear impacto de un cambio potencial"
entregable: "Mapa de dependencias y analisis de impacto"
ejemplo: "@ANALYSIS Analizar impacto de cambiar UserEntity"
```

### 6. Deteccion de Duplicados
```yaml
uso: "Identificar codigo o funcionalidades duplicadas"
entregable: "Lista de duplicados con recomendacion de consolidacion"
ejemplo: "@ANALYSIS Buscar funcionalidades duplicadas en modulo de facturacion"
```

---

## Formato de Entregable

### Reporte Estandar
```markdown
# Reporte de Analisis: {titulo}

## Contexto
- Proyecto: {proyecto}
- Tipo: {tipo_analisis}
- Fecha: {fecha}
- Alcance: {alcance}

## Hallazgos

### Hallazgo 1: {titulo}
- Descripcion: {descripcion}
- Ubicacion: {archivos/modulos}
- Impacto: {ALTO/MEDIO/BAJO}
- Evidencia: {codigo/logs/screenshots}

### Hallazgo 2: {titulo}
...

## Analisis de Dependencias (si aplica)
{mapa_dependencias}

## Recomendaciones

### Recomendacion 1: {titulo}
- Descripcion: {que_hacer}
- Prioridad: {ALTA/MEDIA/BAJA}
- Esfuerzo estimado: {descripcion}
- Dependencias: {otras_tareas}

### Recomendacion 2: {titulo}
...

## Plan Propuesto (no ejecutado)
1. {tarea_1}
2. {tarea_2}
...

## Proximos Pasos
- {accion_recomendada}
```

---

## Cuando Usar Este Modo

### SI Usar MODE-ANALYSIS
- Investigacion de bugs o problemas
- Auditoria de codigo o seguridad
- Exploracion de codebase desconocido
- Propuestas de arquitectura
- Analisis de impacto antes de refactorizacion
- Documentacion de sistemas existentes
- Busqueda de duplicados
- Evaluacion de deuda tecnica

### NO Usar MODE-ANALYSIS
- Si ya sabes que vas a hacer cambios -> MODE-FULL
- Si es un fix rapido conocido -> MODE-QUICK
- Si necesitas propagar cambio existente -> MODE-PROPAGATION

---

## Ejemplo de Ejecucion

```
Usuario: @ANALYSIS Investigar por que el modulo de inventario es lento

Sistema:
== FASE C: CONTEXTO ==
- Proyecto: erp-construccion
- Tipo: Investigacion de problema de performance
- Alcance: Modulo de inventario (backend + frontend)

== FASE A: ANALISIS ==
Hallazgos:
1. Query N+1 en InventoryService.findAll() - ALTO impacto
2. Sin indice en tabla inventory.product_id - ALTO impacto
3. Componente InventoryTable sin virtualizacion - MEDIO impacto
4. Sin cache en endpoint /api/inventory - MEDIO impacto

Dependencias analizadas:
- InventoryService usado por: 3 controllers, 2 services
- InventoryTable usado por: 2 paginas

== FASE P: PLANEACION (propuesta, no ejecutada) ==
Plan recomendado:
1. [ALTA] Agregar indice a inventory.product_id
2. [ALTA] Refactorizar query para eliminar N+1
3. [MEDIA] Agregar cache a endpoint
4. [MEDIA] Implementar virtualizacion en tabla

Estimacion: 4 subtareas, impacto en 5 archivos

== ENTREGABLE ==
Reporte guardado en: orchestration/analisis/ANALISIS-INVENTARIO-PERFORMANCE-2026-01-10.md

NO SE MODIFICO CODIGO. Para implementar, ejecutar:
@FULL Implementar optimizaciones de inventario segun analisis
```

---

## Integracion con Otros Modos

MODE-ANALYSIS frecuentemente precede a MODE-FULL:

```
1. @ANALYSIS Investigar problema X
   -> Genera reporte con plan propuesto

2. Usuario revisa y aprueba plan

3. @FULL Implementar soluciones segun analisis
   -> Usa el plan generado en paso 1
```

---

*MODE-ANALYSIS v1.0.0 - Sistema SAAD*
