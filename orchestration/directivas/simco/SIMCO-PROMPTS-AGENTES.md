# SIMCO-PROMPTS-AGENTES.md

**Version:** 1.0.0
**Creado:** 2026-01-20
**Sistema:** SIMCO v4.0
**Tipo:** Directiva Obligatoria

---

## Propósito

Esta directiva establece el sistema de gobernanza para prompts de agentes externos.
Garantiza trazabilidad, estandarización y capacidad de auditoría para toda ejecución delegada.

---

## Regla Principal (OBLIGATORIA)

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ANTES DE DELEGAR CUALQUIER PLAN A UN AGENTE EXTERNO:                   ║
║                                                                           ║
║   1. CREAR prompt específico con TODOS los estándares                    ║
║   2. REGISTRAR en PROMPTS-ACTIVOS.yml                                    ║
║   3. EJECUTAR con agente externo                                         ║
║   4. AL COMPLETAR: Mover a PROMPTS-HISTORICO.yml                         ║
║                                                                           ║
║   SIN PROMPT REGISTRADO = EJECUCIÓN NO GOBERNADA                         ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Arquitectura del Sistema

```
orchestration/referencias/
├── AGENT-STARTUP-PROMPTS.md      # Prompts genéricos de arranque
├── PROMPTS-ACTIVOS.yml           # Prompts de tareas EN EJECUCIÓN
├── PROMPTS-HISTORICO.yml         # Log de prompts COMPLETADOS
└── templates/
    └── PROMPT-TEMPLATE.md        # Template estándar para crear prompts
```

---

## Flujo de Trabajo

### 1. Planificación (Claude Code)

```
Claude Code planifica tarea
         │
         ▼
┌─────────────────────────────────────┐
│  Crear prompt usando PROMPT-TEMPLATE │
│  - Incluir contexto completo         │
│  - Incluir pasos específicos         │
│  - Incluir validaciones              │
│  - Incluir criterios de aceptación   │
└─────────────────────────────────────┘
         │
         ▼
Registrar en PROMPTS-ACTIVOS.yml
```

### 2. Ejecución (Agente Externo)

```
Agente recibe prompt de PROMPTS-ACTIVOS.yml
         │
         ▼
┌─────────────────────────────────────┐
│  Ejecutar siguiendo el prompt       │
│  - Seguir pasos en orden            │
│  - Crear checkpoints si necesario   │
│  - Ejecutar validaciones            │
└─────────────────────────────────────┘
         │
         ▼
Reportar resultado (éxito/fallo/bloqueado)
```

### 3. Cierre (Claude Code o Agente)

```
Tarea completada o abandonada
         │
         ▼
┌─────────────────────────────────────┐
│  Mover prompt a PROMPTS-HISTORICO   │
│  - Agregar fecha_fin                │
│  - Agregar resultado                │
│  - Agregar notas si hay errores     │
└─────────────────────────────────────┘
         │
         ▼
Eliminar de PROMPTS-ACTIVOS.yml
```

---

## Estructura de PROMPTS-ACTIVOS.yml

```yaml
# PROMPTS-ACTIVOS.yml
# Prompts de tareas actualmente en ejecución por agentes externos

version: "1.0.0"
actualizado: "2026-01-20"

prompts_activos:
  - id: "PROMPT-2026-01-20-001"
    tarea_ref: "GAM-TASK-001"
    titulo: "Implementar endpoint de logros"
    agente_asignado: "trae"
    proyecto: "gamilit"
    fecha_creacion: "2026-01-20T10:00:00"
    creado_por: "claude-code"
    estado: "en_ejecucion"  # pendiente | en_ejecucion | pausado
    prioridad: "P1"

    prompt: |
      Hola, ejecutor de tareas para Gamilit.

      TAREA: Implementar endpoint GET /api/achievements
      ...
      [prompt completo aquí]

    checkpoint_actual: null  # o referencia a checkpoint si pausado
    notas: []
```

---

## Estructura de PROMPTS-HISTORICO.yml

```yaml
# PROMPTS-HISTORICO.yml
# Log histórico de prompts completados para trazabilidad

version: "1.0.0"
actualizado: "2026-01-20"

# Estadísticas
estadisticas:
  total_ejecutados: 0
  exitosos: 0
  fallidos: 0
  abandonados: 0

# Histórico (más reciente primero)
historico:
  - id: "PROMPT-2026-01-20-001"
    tarea_ref: "GAM-TASK-001"
    titulo: "Implementar endpoint de logros"
    agente_ejecutor: "trae"
    proyecto: "gamilit"

    # Fechas
    fecha_creacion: "2026-01-20T10:00:00"
    fecha_inicio: "2026-01-20T10:05:00"
    fecha_fin: "2026-01-20T12:30:00"
    duracion_minutos: 145

    # Resultado
    resultado: "exitoso"  # exitoso | fallido | abandonado | parcial

    # Prompt original (para auditoría)
    prompt: |
      [prompt completo aquí]

    # Trazabilidad
    commits:
      - "abc123 - feat: Add achievements endpoint"
      - "def456 - chore: Update submodule"
    archivos_modificados:
      - "apps/backend/src/achievements/achievements.controller.ts"
      - "apps/backend/src/achievements/achievements.service.ts"

    # Si hubo errores
    errores: []
    notas_postmortem: null
```

---

## Template de Prompt Estándar

Todo prompt para agente externo DEBE incluir:

### Secciones Obligatorias

1. **CONTEXTO**
   - Proyecto y ubicación
   - Stack tecnológico
   - Dependencias de la tarea

2. **ARCHIVOS A LEER**
   - Lista ordenada de archivos a cargar
   - Propósito de cada archivo

3. **TAREA**
   - Descripción clara y específica
   - Pasos numerados
   - Criterios de aceptación

4. **VALIDACIONES**
   - Comandos de validación
   - Qué debe pasar para marcar como completado

5. **GIT**
   - Instrucciones de commit
   - Formato de mensaje

6. **CHECKPOINTS** (si tarea larga)
   - Puntos de guardado
   - Qué hacer si contexto > 50%

### Secciones Opcionales

7. **CREDENCIALES** (si aplica)
8. **URLs** (si aplica)
9. **REFERENCIAS** (documentación adicional)

---

## Generación de ID

```
PROMPT-{YYYY-MM-DD}-{NNN}

Ejemplo: PROMPT-2026-01-20-001
```

- YYYY-MM-DD: Fecha de creación
- NNN: Número secuencial del día (001, 002, 003...)

---

## Alias de Invocación

```
@PROMPTS-ACTIVOS    - Ver prompts en ejecución
@PROMPTS-HISTORICO  - Ver histórico de prompts
@NUEVO-PROMPT       - Crear prompt usando template
@CERRAR-PROMPT      - Mover prompt a histórico
```

---

## Integración con Otros Sistemas

### Trigger de Inicio de Tarea

Cuando se inicia una tarea para agente externo:
1. Verificar que existe prompt en PROMPTS-ACTIVOS.yml
2. Si no existe: BLOQUEAR hasta crear prompt

### Trigger de Cierre de Tarea

Cuando se completa una tarea:
1. Mover prompt a PROMPTS-HISTORICO.yml
2. Actualizar estadísticas
3. Eliminar de PROMPTS-ACTIVOS.yml

### Trazabilidad

El histórico permite:
- Auditar qué instrucciones se dieron a cada agente
- Identificar origen de errores
- Mejorar prompts futuros basado en resultados
- Medir efectividad de agentes

---

## Ejemplos de Uso

### Crear Prompt para Nueva Tarea

```markdown
Claude Code genera plan para "Implementar módulo de pagos"
         │
         ▼
Usa @NUEVO-PROMPT para crear prompt con template
         │
         ▼
Registra en PROMPTS-ACTIVOS.yml con ID PROMPT-2026-01-20-005
         │
         ▼
Pega prompt a Trae/Windsurf para ejecutar
```

### Cerrar Tarea Completada

```markdown
Agente reporta tarea completada
         │
         ▼
Usa @CERRAR-PROMPT con ID PROMPT-2026-01-20-005
         │
         ▼
Sistema mueve a PROMPTS-HISTORICO.yml
- Agrega fecha_fin
- Agrega resultado: "exitoso"
- Agrega commits realizados
         │
         ▼
Elimina de PROMPTS-ACTIVOS.yml
```

### Investigar Error

```markdown
Se detecta bug en producción
         │
         ▼
Identificar commit que introdujo el bug
         │
         ▼
Buscar en PROMPTS-HISTORICO.yml por commit
         │
         ▼
Encontrar prompt original
- Ver instrucciones dadas
- Ver agente que ejecutó
- Ver si hubo notas de error
         │
         ▼
Identificar causa raíz
- ¿Prompt ambiguo?
- ¿Faltó validación?
- ¿Error de agente?
```

---

## Validaciones

### Antes de Ejecutar Prompt

- [ ] Prompt registrado en PROMPTS-ACTIVOS.yml
- [ ] ID único generado
- [ ] Todas las secciones obligatorias presentes
- [ ] Validaciones claramente definidas
- [ ] Criterios de aceptación específicos

### Al Cerrar Prompt

- [ ] Resultado documentado
- [ ] Commits listados (si hubo)
- [ ] Errores documentados (si hubo)
- [ ] Movido a PROMPTS-HISTORICO.yml
- [ ] Eliminado de PROMPTS-ACTIVOS.yml

---

## Referencias

- Prompts genéricos: `orchestration/referencias/AGENT-STARTUP-PROMPTS.md`
- Template: `orchestration/referencias/templates/PROMPT-TEMPLATE.md`
- Activos: `orchestration/referencias/PROMPTS-ACTIVOS.yml`
- Histórico: `orchestration/referencias/PROMPTS-HISTORICO.yml`
- Roles de agentes: `orchestration/agents/AGENT-ROLES.md`
- Estándares de ejecución: `orchestration/agents/AGENT-EXECUTION-STANDARDS.md`
