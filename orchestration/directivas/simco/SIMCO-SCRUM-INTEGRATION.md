# SIMCO: INTEGRACIÓN SCRUM

**Versión:** 1.0.0
**Sistema:** SIMCO - NEXUS v4.0
**Propósito:** Documentación pre/post ejecución con estándares SCRUM
**Fecha:** 2026-01-04

---

## PRINCIPIO FUNDAMENTAL

> **Toda tarea debe tener documentación SCRUM:**
> 1. **PRE-EJECUCIÓN:** HU formal, estado inicial documentado
> 2. **POST-EJECUCIÓN:** Reporte de completitud, HUs derivadas, lecciones
> **Resultado:** Trazabilidad completa y mejora continua.

---

## DOCUMENTACIÓN PRE-EJECUCIÓN

### 1. Historia de Usuario Formal

```yaml
REQUISITO:
  toda_tarea_debe_tener:
    - HU formal con ID único
    - Criterios de aceptación claros
    - Vinculación a épica si aplica

UBICACION:
  - "{proyecto}/docs/01-requerimientos/historias/"
  - O referencia a sistema de tickets

TEMPLATE: "orchestration/templates/scrum/TEMPLATE-HISTORIA-USUARIO.md"
```

### 2. Estado Inicial

```yaml
DOCUMENTAR_ANTES:
  inventarios:
    - Estado actual de DATABASE_INVENTORY
    - Estado actual de BACKEND_INVENTORY
    - Estado actual de FRONTEND_INVENTORY

  archivos:
    - Lista de archivos que se modificarán
    - Versión/hash actual si aplica

  dependencias:
    - Estado de dependencias
    - Versiones de paquetes relevantes

FORMATO:
  snapshot_inicial:
    timestamp: "{YYYY-MM-DD HH:MM}"
    inventarios:
      database:
        tablas: 0
        ultima_modificacion: ""
      backend:
        modules: 0
        endpoints: 0
      frontend:
        componentes: 0
        paginas: 0
```

### 3. Sprint Backlog

```yaml
REGISTRAR_EN:
  archivo: "{proyecto}/orchestration/scrum/SPRINT-ACTUAL.yml"

INFORMACION:
  - ID de tarea/HU
  - Prioridad
  - Estado: pendiente | en_progreso | completada
  - Asignación (si aplica)

TEMPLATE: "orchestration/templates/scrum/TEMPLATE-SPRINT-BACKLOG.yml"
```

---

## DOCUMENTACIÓN POST-EJECUCIÓN

### 1. Reporte de Completitud

```yaml
COMPARACION_PLAN_VS_REAL:
  subtareas:
    planificadas: 0
    completadas: 0
    omitidas: 0
    adicionales: 0

  archivos:
    planificados: []
    creados: []
    modificados: []
    no_tocados: []

  desviacion:
    porcentaje: 0
    justificacion: ""

TEMPLATE: "orchestration/templates/capved/TEMPLATE-POST-VALIDACION.yml"
```

### 2. HUs Derivadas

```yaml
SI_SCOPE_CREEP:
  accion: "Crear HU derivada"

  estructura:
    id: "{HU-ORIGINAL}-D{N}"
    origen: "Scope creep de {HU-ORIGINAL}"
    descripcion: "{qué se descubrió}"
    prioridad: "{alta | media | baja}"
    estimacion: "{si se puede estimar}"

  ubicacion: "{proyecto}/docs/01-requerimientos/historias/"

SI_MEJORA_IDENTIFICADA:
  accion: "Crear HU de mejora"
  tipo: "enhancement"
```

### 3. Actualización de Estado

```yaml
ACTUALIZAR:
  sprint_backlog:
    - Marcar tarea como completada
    - Registrar fecha de completitud

  proxima_accion:
    - Actualizar PROXIMA-ACCION.md
    - Indicar siguiente tarea prioritaria

  inventarios:
    - Reflejar nuevos objetos
    - Actualizar conteos
```

### 4. Lecciones Aprendidas

```yaml
REGISTRAR_SI:
  - Se encontró problema no anticipado
  - Se descubrió mejor forma de hacer algo
  - Se identificó antipatrón
  - Estimación fue muy diferente a realidad

DONDE:
  proyecto: "{proyecto}/orchestration/trazas/"
  global: "shared/knowledge-base/lessons-learned/"

FORMATO:
  - fecha: "{YYYY-MM-DD}"
    tarea: "{HU-XXX}"
    categoria: "{proceso | tecnico | estimacion}"
    descripcion: "{qué se aprendió}"
    accion_futura: "{qué hacer diferente}"
```

---

## CEREMONIAS SCRUM INTEGRADAS

### Daily (Por sesión de trabajo)

```yaml
AL_INICIAR_SESION:
  1. Leer PROXIMA-ACCION.md
  2. Verificar estado de tareas en progreso
  3. Identificar bloqueos

AL_TERMINAR_SESION:
  1. Actualizar estado de tareas
  2. Actualizar PROXIMA-ACCION.md
  3. Documentar bloqueos si hay
```

### Sprint Review (Por tarea completada)

```yaml
AL_COMPLETAR_TAREA:
  1. Ejecutar POST-VALIDACION
  2. Comparar plan vs real
  3. Documentar desvios
  4. Crear HUs derivadas si scope creep
  5. Actualizar Sprint Backlog
```

### Retrospectiva (Periódica)

```yaml
PERIODICAMENTE:
  frecuencia: "Semanal o por épica completada"

  revisar:
    - Errores recurrentes (REGISTRO-ERRORES.yml)
    - Lecciones aprendidas nuevas
    - Desvios de estimación
    - Efectividad del proceso

  documentar:
    archivo: "orchestration/templates/scrum/TEMPLATE-RETROSPECTIVA.yml"

  acciones:
    - Actualizar directivas si proceso ineficiente
    - Agregar checks si errores comunes
    - Mejorar templates si incompletos
```

---

## TEMPLATES SCRUM

### Historia de Usuario

```markdown
# HU-{ID}: {Título}

## Metadata
- **Épica:** {EPIC-XXX}
- **Sprint:** {N}
- **Prioridad:** {Alta | Media | Baja}
- **Estado:** {Pendiente | En Progreso | Completada}

## Historia
**Como** {rol de usuario}
**Quiero** {funcionalidad}
**Para** {beneficio}

## Criterios de Aceptación
- [ ] {criterio 1}
- [ ] {criterio 2}
- [ ] {criterio 3}

## Notas Técnicas
- {consideración técnica}

## Dependencias
- {HU-XXX} (si aplica)

## Estimación
- Story Points: {N}
```

### Sprint Backlog

```yaml
# SPRINT-{N}.yml

sprint:
  numero: N
  inicio: "{YYYY-MM-DD}"
  fin: "{YYYY-MM-DD}"
  objetivo: "{objetivo del sprint}"

historias:
  - id: "HU-XXX"
    titulo: ""
    prioridad: alta | media | baja
    estado: pendiente | en_progreso | completada | bloqueada
    asignado: ""
    notas: ""

metricas:
  total_puntos: 0
  completados: 0
  velocity: 0
```

---

## INTEGRACIÓN CON CAPVED++

```yaml
CAPVED_SCRUM:
  fase_0:
    - Verificar HU existe y es formal
    - Si no existe: crear HU antes de continuar

  fase_c:
    - Vincular a HU existente
    - Documentar estado inicial

  fase_p:
    - Plan debe mapear a criterios de HU
    - Identificar scope creep temprano

  fase_d:
    - Actualizar Sprint Backlog
    - Crear HUs derivadas
    - Registrar lecciones

  post:
    - Reporte de completitud
    - Comparación plan vs real
    - Actualizar PROXIMA-ACCION.md
```

---

## ARCHIVOS DE SCRUM POR PROYECTO

```
{proyecto}/
└── orchestration/
    └── scrum/
        ├── SPRINT-ACTUAL.yml        # Backlog del sprint actual
        ├── SPRINT-{N}.yml           # Histórico de sprints
        └── retrospectivas/
            └── RETRO-{YYYY-MM}.yml  # Retrospectivas mensuales
```

---

## CHECKLIST SCRUM

### Pre-Ejecución

```yaml
CHECKLIST_PRE:
  - [ ] HU formal existe con ID
  - [ ] Criterios de aceptación definidos
  - [ ] Tarea registrada en Sprint Backlog
  - [ ] Estado inicial documentado
  - [ ] PROXIMA-ACCION.md actualizado
```

### Post-Ejecución

```yaml
CHECKLIST_POST:
  - [ ] Criterios de aceptación verificados
  - [ ] Comparación plan vs real documentada
  - [ ] HUs derivadas creadas si aplica
  - [ ] Sprint Backlog actualizado
  - [ ] Lecciones aprendidas registradas
  - [ ] PROXIMA-ACCION.md actualizado
  - [ ] Inventarios actualizados
```

---

## REFERENCIAS

| Documento | Propósito |
|-----------|-----------|
| `TEMPLATE-HISTORIA-USUARIO.md` | Template de HU |
| `TEMPLATE-SPRINT-BACKLOG.yml` | Template de sprint |
| `TEMPLATE-RETROSPECTIVA.yml` | Template de retro |
| `SIMCO-CAPVED-PLUS.md` | Ciclo con validaciones |

---

**Versión:** 1.0.0 | **Sistema:** SIMCO-NEXUS v4.0 | **Tipo:** Directiva de Proceso
