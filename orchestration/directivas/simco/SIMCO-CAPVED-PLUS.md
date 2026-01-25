# SIMCO: CAPVED++ (Ciclo Extendido con Validaciones)

**Versión:** 1.0.0
**Sistema:** SIMCO - NEXUS v4.0
**Propósito:** Extensión del ciclo CAPVED con gates de validación obligatorios
**Fecha:** 2026-01-04

---

## PRINCIPIO FUNDAMENTAL

> **CAPVED++ extiende el ciclo CAPVED con:**
> 1. **FASE 0**: Resolución automática de contexto (pre-ciclo)
> 2. **Gates de validación**: Checkpoints obligatorios entre fases
> 3. **Templates de salida**: Formato estándar por fase
> 4. **Validación post-ejecución**: Comparación plan vs real
> **Resultado:** Ejecución rigurosa con trazabilidad completa.

---

## DIAGRAMA DEL CICLO CAPVED++

```
TAREA RECIBIDA
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  FASE 0: RESOLUCIÓN DE CONTEXTO (Pre-ciclo automático)      │
│  - Analizar keywords de tarea                               │
│  - Cargar CONTEXT-MAP.yml del proyecto                      │
│  - Resolver archivos por nivel (L0→L3)                      │
│  - Verificar límite de tokens (<18000)                      │
└─────────────────────────────────────────────────────────────┘
     │
     ▼ GATE-0: Contexto verificado, tokens dentro de límite
     │
┌─────────────────────────────────────────────────────────────┐
│  FASE C: CONTEXTO (~5 min)                                  │
│  - Identificar HU/épica vinculada                           │
│  - Clasificar tipo de tarea                                 │
│  - Verificar catálogo anti-duplicación                      │
│  - Buscar tareas similares previas                          │
│  - Buscar errores previos en REGISTRO-ERRORES.yml           │
└─────────────────────────────────────────────────────────────┘
     │
     ▼ GATE-C: HU vinculada, tipo clasificado, catálogo verificado
     │
┌─────────────────────────────────────────────────────────────┐
│  FASE A: ANÁLISIS (~15 min)                                 │
│  - Mapear todos los objetos afectados                       │
│  - Identificar dependencias                                 │
│  - Documentar riesgos                                       │
│  - Verificar si es error repetido → Análisis profundo       │
└─────────────────────────────────────────────────────────────┘
     │
     ▼ GATE-A: Objetos mapeados, dependencias identificadas, riesgos documentados
     │
┌─────────────────────────────────────────────────────────────┐
│  FASE P: PLANEACIÓN (~10 min)                               │
│  - Definir subtareas (máx 2 archivos c/u)                   │
│  - Asignar agentes por subtarea                             │
│  - Establecer orden de ejecución                            │
│  - Calcular tokens por subtarea                             │
└─────────────────────────────────────────────────────────────┘
     │
     ▼ GATE-P: Subtareas definidas, agentes asignados, tokens verificados
     │
┌─────────────────────────────────────────────────────────────┐
│  FASE V: VALIDACIÓN DE PLAN (~5 min) ⚠️ NO DELEGAR          │
│  - Verificar cobertura A→P 100%                             │
│  - Validar dependencias resueltas                           │
│  - Capturar scope creep potencial                           │
│  - Confirmar viabilidad técnica                             │
└─────────────────────────────────────────────────────────────┘
     │
     ▼ GATE-V: Plan aprobado, cobertura completa
     │
┌─────────────────────────────────────────────────────────────┐
│  FASE E: EJECUCIÓN (variable)                               │
│  - Ejecutar subtareas según orden                           │
│  - Validar cada subtarea: build ✓, lint ✓, criterios ✓     │
│  - Tracking en SESSION-TRACKING.yml                         │
│  - Documentar cambios en tiempo real                        │
└─────────────────────────────────────────────────────────────┘
     │
     ▼ GATE-E: Todas las subtareas completadas, validaciones pasadas
     │
┌─────────────────────────────────────────────────────────────┐
│  FASE D: DOCUMENTACIÓN (~10 min)                            │
│  - Actualizar inventarios afectados                         │
│  - Registrar en trazas por dominio                          │
│  - Ejecutar propagación si aplica                           │
│  - Generar HUs derivadas si scope creep                     │
└─────────────────────────────────────────────────────────────┘
     │
     ▼ GATE-D: Inventarios actualizados, trazas registradas
     │
┌─────────────────────────────────────────────────────────────┐
│  POST: VALIDACIÓN POST-EJECUCIÓN                            │
│  - Comparar plan vs real                                    │
│  - Verificar consistencia entre capas                       │
│  - Registrar lecciones aprendidas                           │
│  - Actualizar PROXIMA-ACCION.md                             │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
TAREA COMPLETADA
```

---

## DETALLE DE GATES (Checkpoints Obligatorios)

### GATE-0: Pre-Contexto

```yaml
GATE_0:
  nombre: "Verificación de Contexto Resuelto"
  obligatorio: true
  checklist:
    - [ ] CONTEXT-MAP.yml del proyecto cargado
    - [ ] Variables resueltas (sin placeholders)
    - [ ] Archivos L0-L2 verificados que existen
    - [ ] Tokens estimados < 18000
    - [ ] Estado: READY_TO_EXECUTE

  si_falla:
    - Reducir contexto L3
    - Desglosar tarea si excede límite
    - Notificar si CONTEXT-MAP no existe
```

### GATE-C: Post-Contexto

```yaml
GATE_C:
  nombre: "Verificación de Entendimiento"
  obligatorio: true
  checklist:
    - [ ] HU/Épica identificada (ID asignado)
    - [ ] Tipo clasificado: {CREAR | MODIFICAR | VALIDAR | REFACTORIZAR}
    - [ ] Dominio identificado: {DDL | BACKEND | FRONTEND | MIXTO}
    - [ ] Catálogo verificado (no duplicación)
    - [ ] Historial buscado (tareas similares, errores previos)

  si_falla:
    - Solicitar HU si falta
    - Crear HU derivada si es tarea nueva
    - Preguntar al PO si hay ambigüedad
```

### GATE-A: Post-Análisis

```yaml
GATE_A:
  nombre: "Verificación de Análisis Completo"
  obligatorio: true
  checklist:
    - [ ] Todos los objetos afectados listados
    - [ ] Dependencias mapeadas (hacia arriba y hacia abajo)
    - [ ] Riesgos documentados con mitigación
    - [ ] Si error repetido: causa raíz identificada
    - [ ] Archivos de referencia identificados

  si_falla:
    - Completar mapeo antes de continuar
    - Escalar al PO si riesgos son altos
    - Análisis profundo si es error recurrente
```

### GATE-P: Post-Planeación

```yaml
GATE_P:
  nombre: "Verificación de Plan Ejecutable"
  obligatorio: true
  checklist:
    - [ ] Subtareas definidas (máx 2 archivos c/u)
    - [ ] Cada subtarea tiene agente asignado
    - [ ] Orden de ejecución establecido (dependencias)
    - [ ] Tokens por subtarea < 3000
    - [ ] Criterios de aceptación por subtarea

  si_falla:
    - Desglosar subtareas que excedan límites
    - Reordenar si hay dependencias circulares
    - Simplificar plan si es muy complejo
```

### GATE-V: Post-Validación de Plan

```yaml
GATE_V:
  nombre: "Aprobación de Plan"
  obligatorio: true
  ejecutor: "SOLO agente principal (NO delegar)"
  checklist:
    - [ ] Cobertura A→P: 100% de objetos cubiertos
    - [ ] Sin dependencias huérfanas
    - [ ] Scope creep capturado como HU derivada
    - [ ] Viabilidad técnica confirmada
    - [ ] Plan aprobado (explícitamente)

  si_falla:
    - Ajustar plan hasta que cubra 100%
    - Generar HUs derivadas para scope creep
    - Escalar si viabilidad es cuestionable
```

### GATE-E: Post-Ejecución (por subtarea)

```yaml
GATE_E:
  nombre: "Validación de Subtarea"
  obligatorio: true
  por_cada_subtarea: true
  checklist:
    - [ ] Código/DDL creado/modificado
    - [ ] Build pasa sin errores
    - [ ] Lint pasa sin warnings críticos
    - [ ] Criterios de aceptación cumplidos
    - [ ] Archivos registrados en SESSION-TRACKING

  si_falla:
    - Corregir antes de continuar
    - NO proceder a siguiente subtarea
    - Documentar problema si bloquea
```

### GATE-D: Post-Documentación

```yaml
GATE_D:
  nombre: "Verificación de Documentación"
  obligatorio: true
  checklist:
    - [ ] Inventarios actualizados (DATABASE, BACKEND, FRONTEND)
    - [ ] Trazas registradas con ID de tarea
    - [ ] Propagación evaluada y ejecutada si aplica
    - [ ] HUs derivadas creadas si scope creep
    - [ ] PROXIMA-ACCION.md actualizado

  si_falla:
    - Completar documentación antes de cerrar
    - NO marcar tarea como completada
```

---

## TEMPLATES DE SALIDA POR FASE

Cada fase produce un output estandarizado:

| Fase | Template | Propósito |
|------|----------|-----------|
| C | `TEMPLATE-FASE-C-OUTPUT.yml` | Registro de entendimiento |
| A | `TEMPLATE-FASE-A-OUTPUT.yml` | Registro de análisis |
| P | `TEMPLATE-FASE-P-OUTPUT.yml` | Plan de ejecución |
| V | `TEMPLATE-FASE-V-OUTPUT.yml` | Aprobación de plan |
| E | `TEMPLATE-FASE-E-OUTPUT.yml` | Registro de ejecución |
| D | `TEMPLATE-FASE-D-OUTPUT.yml` | Documentación final |
| POST | `TEMPLATE-POST-VALIDACION.yml` | Validación post-ejecución |

**Ubicación:** `orchestration/templates/capved/`

---

## BÚSQUEDA DE HISTORIAL (Nuevo en CAPVED++)

### En Fase C: Buscar Tareas Similares

```yaml
BUSQUEDA_HISTORICO:
  antes_de_analizar:
    ubicaciones:
      - "{proyecto}/orchestration/trazas/"
      - "shared/knowledge-base/lessons-learned/"
      - "orchestration/errores/REGISTRO-ERRORES.yml"

    keywords: "{extraer de descripción de tarea}"

    si_encuentra_similar:
      - Analizar solución previa
      - Verificar si aplica o requiere adaptación
      - Agregar referencia a contexto L3

    si_encuentra_error_previo:
      - Marcar tarea como "REQUIERE_ANALISIS_PROFUNDO"
      - Cargar historial completo del error
      - Ejecutar protocolo SIMCO-ERROR-RECURRENTE.md
```

### En Fase A: Análisis Profundo de Errores

```yaml
SI_ERROR_REPETIDO:
  1_analisis_causa_raiz:
    - Identificar TODOS los objetos afectados
    - Mapear dependencias completas
    - Identificar por qué falló la solución anterior

  2_solucion_definitiva:
    - NO solo parchar el síntoma
    - Actualizar TODAS las dependencias
    - Actualizar documentación/definiciones
    - Propagar cambios a proyectos afectados

  3_prevencion:
    - Agregar validación automática si posible
    - Documentar en KB como antipatrón
    - Actualizar ANTIPATRONES.md si aplica

  4_registro:
    - Actualizar REGISTRO-ERRORES.yml con solución definitiva
    - Marcar ocurrencias previas como resueltas
```

---

## INTEGRACIÓN CON SIMCO EXISTENTES

CAPVED++ se integra con:

| SIMCO | Integración |
|-------|-------------|
| `SIMCO-CONTEXT-RESOLUTION.md` | Ejecuta FASE 0 automáticamente |
| `SIMCO-CONTROL-TOKENS.md` | Valida límites en GATE-0 y GATE-P |
| `SIMCO-DELEGACION.md` | Define formato de delegación en FASE E |
| `SIMCO-TAREA.md` | Referencia base del ciclo CAPVED |
| `SIMCO-ERROR-RECURRENTE.md` | Protocolo para errores repetidos |

---

## RESPONSABILIDADES

```yaml
AGENTE_PRINCIPAL:
  ejecuta:
    - FASE 0 (automático)
    - FASE C
    - FASE A
    - FASE P
    - FASE V (NO DELEGAR)
    - FASE D
    - POST
  delega:
    - Subtareas de FASE E (a subagentes)

SUBAGENTES:
  ejecutan:
    - Subtareas específicas de FASE E
    - Validaciones de GATE-E por subtarea
  reportan:
    - A SESSION-TRACKING.yml
    - Al agente principal
```

---

## CASOS ESPECIALES

### Tarea Simple (<3 archivos)

```yaml
SI_TAREA_SIMPLE:
  - Ejecutar CAPVED++ completo pero condensado
  - Fases C+A pueden combinarse
  - No requiere delegación
  - Documentación mínima pero completa
```

### Tarea Compleja (>5 archivos o multi-dominio)

```yaml
SI_TAREA_COMPLEJA:
  - Desglosar en subtareas obligatorio
  - Máximo 5 subtareas en paralelo
  - Validación de dependencias estricta
  - SESSION-TRACKING obligatorio
```

### Error Repetido (encontrado en historial)

```yaml
SI_ERROR_REPETIDO:
  - GATE-C requiere: análisis profundo marcado
  - FASE A extendida: causa raíz obligatoria
  - Solución debe ser definitiva
  - Propagación obligatoria si afecta otros proyectos
```

---

## MÉTRICAS DE ÉXITO

```yaml
METRICAS:
  completitud:
    - Gates pasados: 100%
    - Cobertura A→P: 100%
    - Documentación: Completa

  calidad:
    - Build: Pasa
    - Lint: Sin warnings críticos
    - Tests: Cubren cambios

  proceso:
    - Plan vs Real: <10% desviación
    - Scope creep: Capturado en HUs
    - Errores repetidos: 0 (objetivo)
```

---

## REFERENCIAS

| Documento | Propósito |
|-----------|-----------|
| `PRINCIPIO-CAPVED.md` | Ciclo base |
| `SIMCO-CONTEXT-RESOLUTION.md` | FASE 0 detalle |
| `SIMCO-CONTROL-TOKENS.md` | Límites de tokens |
| `SIMCO-ERROR-RECURRENTE.md` | Protocolo errores |
| `templates/capved/*.yml` | Templates de fases |

---

**Versión:** 1.0.0 | **Sistema:** SIMCO-NEXUS v4.0 | **Tipo:** Directiva de Ciclo Extendido
