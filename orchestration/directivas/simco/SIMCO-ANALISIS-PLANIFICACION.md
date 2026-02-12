# SIMCO-ANALISIS-PLANIFICACION.md

**Version:** 1.0.0
**Creado:** 2026-01-30
**Sistema:** SIMCO v4.0
**Tipo:** Directiva Obligatoria

---

## Propósito

Esta directiva establece el proceso estandarizado para la fase de análisis y
planificación de tareas complejas que requieren descomposición en subtareas
multinivel siguiendo el principio CAPVED.

**Alias:** `@SIMCO-ANALISIS`, `@ANALISIS-PLANIFICACION`

---

## Regla Principal (OBLIGATORIA)

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   TODA TAREA COMPLEJA (> 3 ARCHIVOS O > 100 LÍNEAS) DEBE:                ║
║                                                                           ║
║   1. DESCOMPONERSE en subtareas atómicas                                 ║
║   2. Cada subtarea: máx 1 archivo, máx 50 líneas                         ║
║   3. Cada subtarea: cumple CAPVED (6 fases)                              ║
║   4. Orden lógico: sin dependencias circulares                           ║
║   5. DOCUMENTAR en PLAN.yml o PLAN.md                                    ║
║                                                                           ║
║   SIN DESCOMPOSICIÓN = EJECUCIÓN NO CONTROLADA                           ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Proceso de Análisis y Planificación

### Fase 1: CONTEXTO (C)

1. **Leer archivos relevantes:**
   - Inventarios del proyecto (`MASTER_INVENTORY.yml`)
   - Definiciones existentes (`_definitions/`)
   - Código relacionado

2. **Identificar alcance:**
   - Proyectos afectados
   - Capas afectadas (DDL, Backend, Frontend)
   - Módulos involucrados

3. **Verificar reutilización:**
   - Consultar `@REUSABLE-CODE-INVENTORY`
   - Buscar código similar > 70%
   - Decidir: Copiar vs Generar

### Fase 2: ANÁLISIS (A)

1. **Mapear dependencias:**
   - Entre subtareas
   - Entre módulos
   - Con otros proyectos (si workspace level)

2. **Detectar gaps:**
   - Coherencia DDL-Backend-Frontend
   - Documentación faltante
   - Tests faltantes

3. **Identificar riesgos:**
   - Cambios breaking
   - Impacto en otros proyectos
   - Complejidad técnica

### Fase 3: PLANIFICACIÓN (P)

1. **Descomponer en subtareas atómicas:**
   ```yaml
   reglas_atomizacion:
     max_archivos_por_subtarea: 1
     max_lineas_por_subtarea: 50
     incluir_codigo_literal: true
     incluir_validacion: true
     sin_ambiguedades: true
   ```

2. **Establecer orden de ejecución:**
   - Dependencias claras (blockedBy)
   - Tareas paralelizables identificadas
   - Sin dependencias circulares

3. **Asignar perfiles:**
   - Cada subtarea con perfil recomendado
   - Usar perfiles compactos para subagentes

### Fase 4: VALIDACIÓN (V)

1. **Verificar plan:**
   - Orden lógico de dependencias
   - Cobertura CAPVED en cada subtarea
   - Sin gaps de documentación
   - Criterios de aceptación claros

2. **Revisar estimaciones:**
   - Tiempo por subtarea
   - Recursos necesarios

### Fase 5: EJECUCIÓN (E)

- Ejecutar subtareas según orden definido
- Seguir flujo 4 fases para delegación a subagentes

### Fase 6: DOCUMENTACIÓN (D)

- Documentar en carpeta de tarea
- Actualizar índices correspondientes
- Generar informe final

---

## Template de Plan de Subtareas

Usar archivo: `orchestration/tareas/_templates/PLAN-SUBTAREAS-TEMPLATE.yml`

```yaml
# Template mínimo
plan:
  id: "PLAN-{YYYY-MM-DD}-{NNN}"
  titulo: "{descripción}"
  fecha: "{YYYY-MM-DD}"
  agente: "{PERFIL}"
  proyecto: "{nombre o null si workspace}"

  subtareas:
    - id: T001
      titulo: "{descripción corta}"
      prioridad: P0|P1|P2
      perfil: PERFIL-{X}
      dependencias: []
      archivos:
        - ruta: "{path/archivo}"
          accion: crear|modificar|eliminar
      lineas_estimadas: 50
      criterios_aceptacion:
        - "{criterio 1}"
      validacion:
        comando: "{npm run build|lint|test}"
        esperado: "PASS"

  orden_ejecucion: |
    T001 → T002 → T003
              ↘ T004

  paralelizables:
    - [T002, T003]

  documentacion:
    ubicacion: "orchestration/tareas/TASK-{ID}/"
    archivos_requeridos:
      - METADATA.yml
      - PLAN.yml
      - TASK-REPORT.md
```

---

## Niveles de Descomposición

### Nivel 0: Tarea Principal
- Descripción general del objetivo
- Alcance completo

### Nivel 1: Subtareas Principales
- Agrupación por dominio (DDL, Backend, Frontend)
- O por módulo funcional

### Nivel 2: Subtareas Atómicas
- Máximo 1 archivo
- Máximo 50 líneas
- Código literal incluido
- Validación específica

### Nivel 3+: Solo si necesario
- Descomposición adicional solo si subtarea nivel 2 excede límites
- Cada nivel mantiene reglas de atomización

---

## Criterios de Atomización

### Una subtarea es ATÓMICA si:

- [ ] Afecta máximo 1 archivo
- [ ] Cambia máximo 50 líneas
- [ ] Tiene código literal o instrucciones exactas
- [ ] Incluye comando de validación
- [ ] No requiere interpretación
- [ ] Es auto-contenida (no depende de contexto externo)
- [ ] Tiene criterios de aceptación claros

### Una subtarea NO ES ATÓMICA si:

- ✗ Afecta múltiples archivos
- ✗ Dice "implementar módulo completo"
- ✗ Requiere decisiones de diseño
- ✗ Tiene instrucciones ambiguas
- ✗ No especifica qué código escribir

---

## Integración con Flujo de Agentes

```
Usuario solicita tarea compleja
         │
         ▼
┌─────────────────────────────────────┐
│ FASE 1: Claude Code                 │
│ - Clasificar tarea                  │
│ - Identificar alcance               │
│ - Plan de alto nivel                │
│ - INVOCAR @SIMCO-ANALISIS           │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ FASE 2: Trae/Gemini                 │
│ - Leer código                       │
│ - Analizar patrones                 │
│ - DESCOMPONER en subtareas          │
│ - Generar PLAN.yml                  │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ FASE 3: Windsurf                    │
│ - Ejecutar subtareas atómicas       │
│ - UNA POR UNA                       │
│ - LITERALMENTE                      │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ FASE 4: Claude/Trae                 │
│ - Validar ejecución                 │
│ - Comparar con plan                 │
│ - Emitir veredicto                  │
└─────────────────────────────────────┘
```

---

## Documentación Obligatoria

### Ubicación

- **Nivel workspace:** `orchestration/tareas/TASK-{FECHA}-{ID}/`
- **Nivel proyecto:** `projects/{p}/orchestration/tareas/TASK-{FECHA}-{ID}/`

### Archivos Mínimos

1. `METADATA.yml` - Metadata de la tarea
2. `01-CONTEXTO.md` - Fase C completada
3. `03-PLAN.md` o `PLAN.yml` - Plan de subtareas
4. `TASK-REPORT.md` - Informe final (al completar)

### Actualizar Índices

- `_INDEX.yml` de la carpeta de tareas
- `PROMPTS-ACTIVOS.yml` (si hay delegación)
- Inventarios afectados

---

## Purga de Documentación

Durante el análisis, identificar documentación obsoleta:

### Criterios de Purga

1. **Tareas completadas > 30 días:**
   - Mover a `_archive/`
   - Mantener solo METADATA.yml y TASK-REPORT.md

2. **Documentación duplicada > 70%:**
   - Consolidar en un solo archivo
   - Eliminar copias

3. **Referencias rotas:**
   - Actualizar o eliminar

### Proceso

```yaml
purga:
  archivos_identificados:
    - ruta: "{path}"
      razon: "duplicado|obsoleto|roto"
      accion: "archivar|eliminar|actualizar"
```

---

## Validaciones

### Antes de Ejecutar Plan

- [ ] Todas las subtareas son atómicas
- [ ] Dependencias sin ciclos
- [ ] Perfiles asignados correctamente
- [ ] Validaciones definidas por subtarea
- [ ] Criterios de aceptación claros

### Después de Ejecutar

- [ ] Todas las subtareas completadas
- [ ] Validaciones pasaron
- [ ] Documentación actualizada
- [ ] Git: commits realizados
- [ ] Informe generado

---

## Aliases de Invocación

```
@SIMCO-ANALISIS       - Esta directiva
@ANALISIS-PLANIFICACION - Esta directiva
@PLAN-SUBTAREAS       - Template de plan
@PROMPT-ANALISIS      - Prompt para análisis
```

---

## Referencias

- Principio CAPVED: `orchestration/directivas/principios/PRINCIPIO-CAPVED.md`
- Flujo de agentes: `orchestration/directivas/simco/SIMCO-FLUJO-AGENTES.md`
- Prompts estándar: `orchestration/referencias/prompts/PROMPTS-ESTANDAR-INICIO.md`
- Template de plan: `orchestration/tareas/_templates/PLAN-SUBTAREAS-TEMPLATE.yml`
- Edición segura: `orchestration/directivas/simco/SIMCO-EDICION-SEGURA.md`
