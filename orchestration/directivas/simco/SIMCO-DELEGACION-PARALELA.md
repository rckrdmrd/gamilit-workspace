# SIMCO: DELEGACIÓN PARALELA CON TRACKING

**Version:** 1.1.0
**Sistema:** SIMCO - NEXUS v4.1
**Proposito:** Orquestacion de hasta 5 subagentes con tracking de sesion
**Fecha:** 2026-02-11
**Actualizado:** Limites platform-aware, Gemini CLI parallelism

---

## PRINCIPIO FUNDAMENTAL

> **La delegación paralela permite:**
> 1. Ejecutar hasta 5 subagentes simultáneamente
> 2. Herencia automática de contexto resuelto
> 3. Tracking en tiempo real via SESSION-TRACKING
> 4. Sincronización por dependencias entre subtareas
> **Resultado:** Ejecución eficiente con visibilidad completa.

---

## REGLAS DE PARALELISMO

### Límites

```yaml
LIMITES_PARALELOS:
  max_subagentes: 5
  max_por_dominio: 2                     # Evitar conflictos

  por_dominio:
    DDL: 1                                # Siempre secuencial
    BACKEND: 2
    FRONTEND: 3
    DOCS: 2
```

### Reglas de Orden

```yaml
REGLAS_ORDEN:
  obligatorias:
    - "DDL ANTES de Backend"              # Entity necesita DDL
    - "Backend ANTES de Frontend"         # Hook necesita endpoint
    - "Entity ANTES de Service"           # Service usa Entity
    - "Service ANTES de Controller"       # Controller usa Service

  mismo_dominio:
    - "Mismo módulo → secuencial"         # Evitar conflictos
    - "Módulos diferentes → paralelo"

  paralelo_permitido:
    - "DDL de schemas diferentes"
    - "Módulos backend independientes"
    - "Componentes frontend sin dependencia"
    - "Documentación siempre paralela"
```

---

## DIAGRAMA DE ORQUESTACIÓN

```
AGENTE PRINCIPAL
     │
     ├─── Fase C, A, P, V (ejecuta directamente)
     │
     ▼
FASE E: EJECUCIÓN CON DELEGACIÓN
     │
     ├────────────────────────────────────────────────────────┐
     │                                                        │
     ▼                                                        ▼
┌─────────────────┐                              ┌─────────────────┐
│  GRUPO 1        │                              │  SESSION        │
│  (Secuencial)   │                              │  TRACKING       │
│                 │         Reporta              │                 │
│  DDL-001 ───────┼──────────────────────────────┤  tracking/      │
│     │           │                              │  SESSION-{id}.  │
│     ▼           │                              │  yml            │
│  DDL-002        │                              │                 │
└─────────────────┘                              └─────────────────┘
     │                                                    ▲
     │ Cuando DDL completa                                │
     ▼                                                    │
┌─────────────────────────────────────────────────────────┤
│  GRUPO 2 (Paralelo: Backend)                            │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │ BE-001  │ │ BE-002  │ │ BE-003  │ ─── Reportan ────┤
│  │ Entity  │ │ Service │ │ DTO     │                   │
│  └─────────┘ └─────────┘ └─────────┘                   │
└─────────────────────────────────────────────────────────┤
     │                                                    │
     │ Cuando Backend completa                            │
     ▼                                                    │
┌─────────────────────────────────────────────────────────┤
│  GRUPO 3 (Paralelo: Frontend)                           │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │ FE-001  │ │ FE-002  │ │ FE-003  │ ─── Reportan ────┘
│  │ Hook    │ │ Comp.   │ │ Page    │
│  └─────────┘ └─────────┘ └─────────┘
└─────────────────────────────────────────────────────────┘
     │
     ▼
AGENTE PRINCIPAL
     │
     ├─── Consolida resultados de SESSION-TRACKING
     │
     ▼
Fase D (ejecuta directamente)
```

---

## HERENCIA AUTOMÁTICA DE CONTEXTO

### Qué Hereda el Subagente

```yaml
HERENCIA_AUTOMATICA:
  desde_context_map:
    - variables resueltas (PROJECT, DB_NAME, etc.)
    - aliases resueltos (@DDL, @BACKEND, etc.)
    - rutas absolutas (no placeholders)

  desde_agente_principal:
    - tarea_id (HU-XXX)
    - subtarea_id (ST-XXX)
    - criterios de aceptación
    - archivos de referencia específicos

  desde_session_tracking:
    - estado de subtareas previas
    - archivos creados por otros subagentes
    - errores encontrados

NO_HEREDAR:
  - Contexto completo L0 (ya cargado en prompt base)
  - Historial de otras tareas
  - Código no relacionado
```

### Formato de Delegación

```yaml
PROMPT_DELEGACION:
  estructura:
    1_contexto_heredado:
      proyecto: "{nombre}"
      variables:
        PROJECT: "{valor resuelto}"
        DB_DDL_PATH: "{ruta absoluta}"
        # Solo las relevantes

    2_tarea_especifica:
      subtarea_id: "ST-XXX"
      descripcion: "{descripción clara}"
      dominio: "{DDL | BACKEND | FRONTEND}"

    3_archivos:
      crear:
        - "{ruta/archivo}"
      modificar:
        - "{ruta/archivo}"
      referencia:
        - "{ruta/patron.ts}"

    4_criterios:
      - "[ ] {criterio 1}"
      - "[ ] {criterio 2}"

    5_validaciones:
      build: true | false
      lint: true | false
      reportar_a: "SESSION-TRACKING-{id}.yml"
```

---

## SESSION TRACKING

### Estructura del Archivo

```yaml
# SESSION-TRACKING-{uuid}.yml
session_tracking:
  session_id: "{uuid}"
  tarea_principal: "HU-XXX"
  proyecto: "{nombre}"
  inicio: "{YYYY-MM-DD HH:MM}"
  estado: "{activa | completada | fallida}"

  subagentes:
    - id: "{subagente_id}"
      subtarea: "ST-001"
      perfil: "PERFIL-DATABASE-AGENT"
      estado: "{pendiente | activo | completado | fallido}"

      tiempos:
        inicio: "{HH:MM}"
        fin: "{HH:MM}"

      archivos_creados:
        - ruta: "{ruta/archivo}"
          lineas: 0

      archivos_modificados:
        - ruta: "{ruta/archivo}"
          cambios: "{descripción breve}"

      validaciones:
        build: "{pass | fail | skip}"
        lint: "{pass | fail | skip}"

      errores: []
      notas: ""

  sincronizacion:
    grupos_completados: [1, 2]
    grupo_actual: 3
    pendientes: []

  metricas:
    subtareas_total: 0
    subtareas_completadas: 0
    subtareas_fallidas: 0
    porcentaje: 0
```

### Ubicación

```
orchestration/tracking/SESSION-TRACKING-{uuid}.yml
```

---

## PROTOCOLO DE SINCRONIZACIÓN

### Inicio de Grupo

```yaml
PROTOCOLO_INICIO:
  1_verificar_dependencias:
    - Confirmar que grupo anterior completó
    - Verificar archivos creados existen
    - Cargar estado de SESSION-TRACKING

  2_iniciar_subagentes:
    - Crear entrada en SESSION-TRACKING
    - Delegar con contexto heredado
    - Marcar estado: "activo"

  3_monitorear:
    - Esperar reportes de subagentes
    - Actualizar SESSION-TRACKING
    - Detectar errores temprano
```

### Fin de Grupo

```yaml
PROTOCOLO_FIN:
  1_consolidar_resultados:
    - Recolectar reportes de todos los subagentes
    - Actualizar SESSION-TRACKING
    - Verificar validaciones pasaron

  2_verificar_gate_e:
    - Todos los subagentes: estado = "completado"
    - Todos los builds: "pass"
    - Todos los criterios: cumplidos

  3_decidir:
    si_exito:
      - Marcar grupo como completado
      - Proceder al siguiente grupo

    si_fallo:
      - Identificar subagente fallido
      - Reintentar o escalar
      - NO proceder hasta resolver
```

---

## MANEJO DE ERRORES EN PARALELO

### Estrategia de Recuperación

```yaml
SI_SUBAGENTE_FALLA:
  1_aislar:
    - Detener subagente fallido
    - Continuar con otros del mismo grupo
    - Documentar error en SESSION-TRACKING

  2_evaluar:
    - ¿Es bloqueante para el grupo?
    - ¿Afecta a subagentes paralelos?
    - ¿Se puede reintentar?

  3_decidir:
    si_bloqueante:
      - Detener grupo completo
      - Notificar al agente principal
      - Esperar decisión

    si_no_bloqueante:
      - Continuar con otros subagentes
      - Marcar para reintento al final
      - Documentar para Fase D

  4_recuperar:
    - Reintentar con contexto actualizado
    - Si falla 2 veces: escalar al PO
```

---

## LÍMITES DE TOKENS POR DELEGACIÓN

```yaml
LIMITES_DELEGACION:
  prompt_base: 2000                       # Instrucciones + perfil
  contexto_heredado: 1500                 # Variables + aliases
  tarea_especifica: 500                   # Descripción + criterios
  archivos_referencia: 1500               # Código de patrón

  total_max: 5500                         # Prompt de delegación

  respuesta_esperada: 12000               # Para ejecución del subagente

  margen_seguridad: 7500                  # Siempre disponible
```

---

## INTEGRACIÓN CON CAPVED++

```yaml
INTEGRACION:
  fase_e:
    - SESSION-TRACKING se crea al iniciar
    - Grupos se ejecutan según plan de Fase P
    - Cada subagente reporta a SESSION-TRACKING

  gate_e:
    - Verifica SESSION-TRACKING para cada subtarea
    - Todos los subagentes deben tener estado: "completado"
    - Todas las validaciones deben pasar

  fase_d:
    - SESSION-TRACKING se usa para documentar
    - Archivos creados se registran en inventarios
    - Errores se registran en REGISTRO-ERRORES.yml
```

---

## CHECKLIST PRE-DELEGACIÓN

```yaml
CHECKLIST:
  antes_de_delegar:
    - [ ] Subtarea definida (máx 2 archivos)
    - [ ] Perfil de agente seleccionado
    - [ ] Contexto heredado mínimo (< 1500 tokens)
    - [ ] Criterios de aceptación claros
    - [ ] Archivos de referencia identificados
    - [ ] SESSION-TRACKING inicializado
    - [ ] Dependencias del grupo previo completadas
```

---

## REFERENCIAS

| Documento | Propósito |
|-----------|-----------|
| `SIMCO-DELEGACION.md` | Base de delegación |
| `SIMCO-CAPVED-PLUS.md` | Ciclo CAPVED++ |
| `SIMCO-CONTROL-TOKENS.md` | Límites de tokens |
| `SESSION-TRACKING-TEMPLATE.yml` | Template de tracking |

---

## RELACIÓN CON SISTEMA NEXUS (Gamilit)

**Esta directiva define orquestación OPERATIVA por sesión individual.**

Para el límite global de subagentes compartidos entre agentes NEXUS, consultar:

- **DIRECTIVAS-PARALELIZACION.md** (`/projects/gamilit/.claude/directivas/`)
  - Límite global: 15 subagentes compartidos entre TODOS los agentes NEXUS
  - Registro centralizado: `orchestration/REGISTRO-SUBAGENTES.json`
  - Sistema de prioridades para asignación de slots

**Jerarquía:**
```
NEXUS-PARALELIZACION       →  Límite global: 15 subagentes compartidos
        ↓
SIMCO (este archivo)       →  Orquestación por sesión: máx 5 por tarea
```

---

**Versión:** 1.0.1 | **Sistema:** SIMCO-NEXUS v4.0 | **Tipo:** Directiva de Orquestación
**Actualizado:** 2026-01-10
