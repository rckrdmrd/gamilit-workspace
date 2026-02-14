# SIMCO: GESTION DE WORK ITEMS

**Version:** 1.0.0
**Fecha:** 2026-02-13
**Sistema:** SIMCO v4.0.0
**Alias:** @WORK_ITEMS

---

## RESUMEN EJECUTIVO

Esta directiva define como gestionar work items (EPICs, User Stories, Tasks) en el proyecto gamilit. Establece la estructura de archivos, convenciones de nomenclatura, estados validos, y flujos de actualizacion.

**PRINCIPIO:** "Todo trabajo planificado DEBE estar trazado en work-items/. Los work items son la interfaz entre requerimientos (docs/10-requirements/) y codigo implementado."

---

## ESTRUCTURA DE WORK ITEMS

### Ubicacion

```
orchestration/work-items/
├── _MAP.md                    # Navegacion rapida
├── epics/                     # EPICs del proyecto
│   ├── EPIC-GAM-{DOMAIN}.yml          # Formato plano (resumen)
│   └── EPIC-GAM-{DOMAIN}/             # Formato enriquecido (detalle)
│       ├── EPIC.yml                    # Definicion de la EPIC
│       ├── _views/
│       │   └── SPRINT-MAPPING.yml      # Mapeo a sprints
│       └── stories/
│           └── US-GAM-{CODE}-{NN}/
│               └── STORY.yml           # Definicion de la User Story
└── sprints/                   # (via orchestration/scrum/)
```

### Formato Dual

El proyecto usa formato dual para EPICs:

| Formato | Archivo | Uso | Cuando Crear |
|---------|---------|-----|--------------|
| **Plano** | `EPIC-GAM-{DOMAIN}.yml` | Resumen rapido, metricas | Siempre |
| **Enriquecido** | `EPIC-GAM-{DOMAIN}/EPIC.yml` + stories/ | Detalle completo, stories anidadas | EPICs activas con stories |

**Regla:** El formato plano es OBLIGATORIO. El enriquecido es OPCIONAL pero RECOMENDADO para EPICs con 3+ stories.

---

## NOMENCLATURA

### EPICs

```yaml
formato_id: "EPIC-GAM-{DOMAIN}"
ejemplos:
  - "EPIC-GAM-BACKEND"          # Dominio tecnico
  - "EPIC-GAM-FRONTEND"         # Dominio tecnico
  - "EPIC-GAM-DATABASE"         # Dominio tecnico
  - "EPIC-GAM-F1-AUTH"          # Fase 1, feature auth
  - "EPIC-GAM-F2-MODULES-M4M5"  # Fase 2, modulos M4-M5
  - "EPIC-GAM-F3-TEACHER-PORTAL" # Fase 3, portal maestro

convenciones:
  prefijo: "EPIC-GAM-"
  dominio: "UPPERCASE, guiones como separador"
  fase: "F{N}- para EPICs de fases de desarrollo"
```

### User Stories

```yaml
formato_id: "US-GAM-{CODE}-{NN}"
ejemplos:
  - "US-GAM-AUTH-01"        # Autenticacion, story 01
  - "US-GAM-EDU-01"         # Educacional, story 01
  - "US-GAM-EXERCISES-03"   # Ejercicios, story 03
  - "US-GAM-K8S-02"         # Kubernetes, story 02

convenciones:
  prefijo: "US-GAM-"
  codigo: "3-4 letras UPPERCASE del modulo/feature"
  numero: "NN secuencial dentro de la EPIC"
```

---

## SCHEMA YAML

### EPIC (Formato Plano)

```yaml
# EPIC-GAM-{DOMAIN}.yml
id: "EPIC-GAM-{DOMAIN}"
titulo: "{Titulo descriptivo}"
proyecto: "gamilit"
version: "{semver}"
fecha_creacion: "{YYYY-MM-DD}"
fecha_actualizacion: "{YYYY-MM-DD}"
estado: "{ESTADO}"              # Ver estados validos
prioridad: "{P0|P1|P2|P3}"
story_points: {total_SP}
wave: "{wave_N}"
descripcion: |
  {Descripcion multi-linea}
entregables:
  - "{entregable 1}"
  - "{entregable 2}"
stories:
  - id: "{US-GAM-CODE-NN}"
    titulo: "{titulo}"
    status: "{ESTADO}"
    story_points: {SP}
traceability:
  requirements:
    - "{RF-GAM-NNN}"
  components:
    backend: ["{descripcion}"]
    frontend: ["{descripcion}"]
    database: ["{descripcion}"]
  dependencies:
    depends_on: ["{EPIC-ID}"]
    blocks: ["{EPIC-ID}"]
metricas:
  total_stories: {N}
  stories_completadas: {N}
  porcentaje_avance: {0-100}
```

### User Story (STORY.yml)

```yaml
# stories/US-GAM-{CODE}-{NN}/STORY.yml
id: "{US-GAM-CODE-NN}"
titulo: "{titulo}"
epic: "{EPIC-GAM-DOMAIN}"
estado: "{ESTADO}"
prioridad: "{P0|P1|P2|P3}"
story_points: {SP}
sprint: "{SPRINT-ID o null}"
descripcion: |
  Como {rol}
  Quiero {accion}
  Para {beneficio}
criterios_aceptacion:
  - "{criterio 1}"
  - "{criterio 2}"
tareas:
  - id: "{TASK-ID}"
    descripcion: "{desc}"
    estado: "{ESTADO}"
    asignado: "{agente o null}"
```

---

## ESTADOS VALIDOS

```yaml
estados_epic:
  - "PLANIFICADO"      # Definido pero no iniciado
  - "EN_PROGRESO"      # Al menos 1 story en progreso
  - "COMPLETADO"       # 100% stories completadas
  - "BLOQUEADO"        # Dependencia no resuelta
  - "CANCELADO"        # Descartado

estados_story:
  - "PENDIENTE"        # En backlog, no iniciada
  - "EN_PROGRESO"      # Asignada y en desarrollo
  - "EN_REVISION"      # Codigo listo, pendiente review
  - "COMPLETADO"       # Aceptada y desplegada
  - "BLOQUEADO"        # Dependencia no resuelta

estados_task:
  - "TODO"             # Por hacer
  - "IN_PROGRESS"      # En ejecucion
  - "DONE"             # Completada
  - "BLOCKED"          # Bloqueada
```

---

## FLUJO DE TRABAJO

### Crear EPIC Nueva

```yaml
pasos:
  1_verificar:
    - "¿Existe EPIC similar? (TRIGGER-ANTI-DUPLICACION)"
    - "¿Tiene al menos 1 story definida?"
    - "¿Requirements trazados en docs/10-requirements/?"

  2_crear_formato_plano:
    - "Crear EPIC-GAM-{DOMAIN}.yml con schema completo"
    - "Estado inicial: PLANIFICADO"
    - "Story points: estimar cada story"

  3_crear_formato_enriquecido:
    - "Si 3+ stories: crear directorio EPIC-GAM-{DOMAIN}/"
    - "Crear EPIC.yml, _views/SPRINT-MAPPING.yml"
    - "Crear stories/{US-ID}/STORY.yml por cada story"

  4_registrar:
    - "Actualizar _MAP.md con nueva EPIC"
    - "Vincular a sprint si aplica (orchestration/scrum/)"
```

### Actualizar Progreso

```yaml
al_completar_story:
  1: "Actualizar STORY.yml: estado → COMPLETADO"
  2: "Actualizar EPIC.yml plano: story status → COMPLETADO"
  3: "Recalcular metricas: stories_completadas, porcentaje_avance"
  4: "Si 100%: EPIC estado → COMPLETADO"
  5: "Actualizar SPRINT-MAPPING.yml si aplica"

al_completar_epic:
  1: "Verificar TODAS las stories = COMPLETADO"
  2: "Actualizar EPIC estado → COMPLETADO"
  3: "Actualizar _MAP.md"
  4: "Actualizar MASTER_INVENTORY.yml metricas de avance"
```

### Crear Story en EPIC Existente

```yaml
pasos:
  1: "Verificar ID no duplicado en la EPIC"
  2: "Asignar siguiente numero secuencial"
  3: "Crear STORY.yml en stories/{US-ID}/"
  4: "Agregar referencia en EPIC.yml plano (seccion stories)"
  5: "Recalcular total_stories y porcentaje_avance"
```

---

## TRAZABILIDAD

### Cadena de Trazabilidad

```
docs/10-requirements/          → Requerimientos funcionales (RF-GAM-NNN)
    │
    ▼
orchestration/work-items/      → EPICs y Stories (planificacion)
    │
    ▼
orchestration/scrum/           → Sprints (ejecucion temporal)
    │
    ▼
apps/                          → Codigo implementado
    │
    ▼
orchestration/inventarios/     → Inventarios SSOT (verificacion)
```

### Vinculos Obligatorios

```yaml
epic_debe_tener:
  - "Al menos 1 requirement trazado (RF-GAM-NNN)"
  - "Al menos 1 story definida"
  - "Dependencies mapeadas (depends_on, blocks)"

story_debe_tener:
  - "EPIC padre referenciado"
  - "Criterios de aceptacion definidos"
  - "Story points estimados"
```

---

## METRICAS ACTUALES

```yaml
# Estado al 2026-02-13
total_epics: 26
  por_dominio:
    tecnicas: 7   # BACKEND, FRONTEND, DATABASE, DEVOPS, DOCS, INTEGRATION, K8S
    fase_1: 6     # F1-AUTH, F1-ADMIN, F1-ANALYTICS, F1-CONFIG, F1-EXERCISES, F1-GAMIFICATION
    fase_2: 3     # F2-DB-MIGRATION, F2-MODULES-M4M5, F2-TECH-CONSOLIDATION
    fase_3: 10    # F3-ADMIN-EXTENDED, F3-CONTENT, F3-LTI, F3-NOTIFICATIONS, etc.

  por_estado:
    COMPLETADO: 20
    EN_PROGRESO: 4
    PLANIFICADO: 2

total_stories: 27
  por_estado:
    COMPLETADO: 23
    EN_PROGRESO: 3
    PENDIENTE: 1

formatos:
  solo_plano: 14       # Solo .yml flat
  plano_y_enriquecido: 12  # .yml + directorio con stories/
```

---

## RELACION CON DOCS/10-REQUIREMENTS/

```yaml
docs_requirements:
  estructura: "docs/10-requirements/epics/EPIC-GAM-F{N}-{ID}/"
  contenido: "EPIC.md + PLAN.md + user-stories/ (formato Markdown)"
  proposito: "Documentacion formal de requerimientos"

orchestration_work_items:
  estructura: "orchestration/work-items/epics/EPIC-GAM-{DOMAIN}/"
  contenido: "EPIC.yml + STORY.yml (formato YAML)"
  proposito: "Tracking operativo de implementacion"

relacion: |
  docs/10-requirements/ contiene la DEFINICION formal (que construir)
  orchestration/work-items/ contiene el TRACKING operativo (estado de implementacion)
  Ambos deben estar sincronizados pero sirven propositos diferentes.

sincronizacion:
  - "Toda EPIC en work-items/ DEBE tener su contraparte en requirements/ (o referencia)"
  - "Los estados en work-items/ reflejan avance REAL del codigo"
  - "Los requirements/ se actualizan solo cuando cambian los requerimientos, no el progreso"
```

---

## REFERENCIAS

| Alias | Descripcion |
|-------|-------------|
| @WORK_ITEMS | Esta directiva |
| @WORK-ITEMS | orchestration/work-items/ (directorio) |
| @SCRUM | orchestration/scrum/ |
| @SIMCO-SCRUM | orchestration/directivas/simco/_archive/SIMCO-SCRUM-INTEGRATION.md |
| @INVENTORY | orchestration/inventarios/MASTER_INVENTORY.yml |

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Directiva Operacional
