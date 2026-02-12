# SIMCO-UBICACION-DOCUMENTACION

**Versión:** 1.0.0
**Fecha:** 2026-01-24
**Tipo:** Directiva SIMCO
**Alias:** @UBICACION-DOC
**Origen:** TASK-2026-01-24-006 (Incidencia de ubicación de documentación)

---

## RESUMEN EJECUTIVO

```
╔══════════════════════════════════════════════════════════════════════════╗
║                         REGLA DE ORO                                     ║
║                                                                          ║
║   Si la tarea afecta SOLO UN proyecto → documenta en el PROYECTO         ║
║   Si la tarea afecta múltiples proyectos o workspace → documenta en WS   ║
║                                                                          ║
║   EN CASO DE DUDA → documenta en WORKSPACE (es más seguro)               ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 1. PROPOSITO

Esta directiva define **DÓNDE** debe ubicarse la documentación de tareas según su alcance.

**Problema resuelto:** Anteriormente, todas las tareas se documentaban a nivel workspace, incluso las específicas de un proyecto.

**Beneficios:**
- Documentación organizada por contexto
- Fácil localización de tareas de un proyecto
- Índices de tareas manejables por nivel
- Aprovechamiento de estructura `projects/{p}/orchestration/tareas/`

---

## 2. MATRIZ DE DECISION

### 2.1 Criterios para WORKSPACE

| Criterio | Ejemplo | Ubicación |
|----------|---------|-----------|
| Afecta > 1 proyecto | Propagación de fix a verticales | `orchestration/tareas/` |
| Modifica orchestration/ del workspace | Actualizar SIMCO, triggers | `orchestration/tareas/` |
| Modifica directivas o políticas | Nueva directiva, nuevo trigger | `orchestration/tareas/` |
| Tarea transversal | Gobernanza, estándares | `orchestration/tareas/` |
| Afecta shared/ | Catálogo, módulos compartidos | `orchestration/tareas/` |
| Cambios en CLAUDE.md | Reglas, aliases | `orchestration/tareas/` |

### 2.2 Criterios para PROYECTO

| Criterio | Ejemplo | Ubicación |
|----------|---------|-----------|
| Afecta SOLO 1 proyecto | Feature en erp-clinicas | `projects/{p}/orchestration/tareas/` |
| Código específico | Backend, frontend del proyecto | `projects/{p}/orchestration/tareas/` |
| Bug fix localizado | Error en componente del proyecto | `projects/{p}/orchestration/tareas/` |
| Documentación del proyecto | README, specs del proyecto | `projects/{p}/orchestration/tareas/` |
| DDL específico | Tabla solo usada en el proyecto | `projects/{p}/orchestration/tareas/` |

---

## 3. FLUJO DE DETERMINACION

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE DETERMINACIÓN DE UBICACIÓN                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Nueva tarea recibida                                                     │
│           │                                                                │
│           ▼                                                                │
│   ┌─────────────────────────────────────┐                                  │
│   │ ¿Modifica orchestration/ del        │                                  │
│   │ workspace, CLAUDE.md, o shared/?    │                                  │
│   └───────────────┬─────────────────────┘                                  │
│              SÍ   │   NO                                                   │
│              │    │    │                                                   │
│              ▼    │    ▼                                                   │
│         WORKSPACE │    ┌─────────────────────────────────────┐             │
│                   │    │ ¿Afecta más de 1 proyecto?          │             │
│                   │    └───────────────┬─────────────────────┘             │
│                   │               SÍ   │   NO                              │
│                   │               │    │    │                              │
│                   │               ▼    │    ▼                              │
│                   │          WORKSPACE │    ┌───────────────────────┐      │
│                   │                    │    │ ¿Se puede identificar │      │
│                   │                    │    │ un proyecto único?    │      │
│                   │                    │    └───────────┬───────────┘      │
│                   │                    │           SÍ   │   NO             │
│                   │                    │           │    │    │             │
│                   │                    │           ▼    │    ▼             │
│                   │                    │       PROYECTO │  WORKSPACE       │
│                   │                    │                │  (default)       │
│                   └────────────────────┴────────────────┘                  │
│                                                                             │
│   RESULTADO:                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │ WORKSPACE:  orchestration/tareas/{YYYY-MM-DD}/TASK-{NNN}/          │  │
│   │ PROYECTO:   projects/{proyecto}/orchestration/tareas/TASK-{NNN}/   │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. RUTAS DE DOCUMENTACION

### 4.1 Ruta WORKSPACE

```
orchestration/tareas/{YYYY-MM-DD}/TASK-{NNN}-{descripcion}/
├── METADATA.yml
├── 01-CONTEXTO.md
├── 02-ANALISIS.md (recomendado)
├── 03-PLANEACION.md (recomendado)
├── 04-VALIDACION.md (recomendado)
├── 05-EJECUCION.md
└── 06-DOCUMENTACION.md
```

**Índice:** `orchestration/tareas/_INDEX.yml`

### 4.2 Ruta PROYECTO

```
projects/{proyecto}/orchestration/tareas/TASK-{NNN}-{descripcion}/
├── METADATA.yml
├── 01-CONTEXTO.md
├── 02-ANALISIS.md (recomendado)
├── 03-PLANEACION.md (recomendado)
├── 04-VALIDACION.md (recomendado)
├── 05-EJECUCION.md
└── 06-DOCUMENTACION.md
```

**Índice:** `projects/{proyecto}/orchestration/tareas/_INDEX.yml`

**Nota:** El formato de ID en proyectos es `TASK-{NNN}` (sin fecha) para simplicidad.
Para proyectos con muchas tareas, puede usarse `TASK-{YYYY-MM-DD}-{NNN}`.

---

## 5. CASOS DE EJEMPLO

### Ejemplo 1: Feature en backend de erp-clinicas

```yaml
tarea: "Agregar endpoint de citas médicas"
analisis:
  - ¿Modifica orchestration/ del workspace? NO
  - ¿Modifica CLAUDE.md o shared/? NO
  - ¿Afecta más de 1 proyecto? NO
  - ¿Se puede identificar proyecto único? SÍ (erp-clinicas)

resultado: PROYECTO
ubicacion: "projects/erp-clinicas/orchestration/tareas/TASK-001-endpoint-citas/"
```

### Ejemplo 2: Propagación de fix de seguridad

```yaml
tarea: "Propagar fix de JWT a todas las verticales ERP"
analisis:
  - ¿Modifica orchestration/ del workspace? NO
  - ¿Modifica CLAUDE.md o shared/? NO
  - ¿Afecta más de 1 proyecto? SÍ (5 verticales)

resultado: WORKSPACE
ubicacion: "orchestration/tareas/2026-01-24/TASK-007-fix-jwt-verticales/"
```

### Ejemplo 3: Nueva directiva SIMCO

```yaml
tarea: "Crear directiva SIMCO-UBICACION-DOCUMENTACION"
analisis:
  - ¿Modifica orchestration/ del workspace? SÍ

resultado: WORKSPACE
ubicacion: "orchestration/tareas/2026-01-24/TASK-006-incidencia-ubicacion-documentacion/"
```

### Ejemplo 4: Documentación de API de proyecto

```yaml
tarea: "Documentar API endpoints de trading-platform"
analisis:
  - ¿Modifica orchestration/ del workspace? NO
  - ¿Modifica CLAUDE.md o shared/? NO
  - ¿Afecta más de 1 proyecto? NO
  - ¿Se puede identificar proyecto único? SÍ (trading-platform)

resultado: PROYECTO
ubicacion: "projects/trading-platform/orchestration/tareas/TASK-001-documentar-api/"
```

### Ejemplo 5: Actualización de estándares de código

```yaml
tarea: "Actualizar estándares de linting para todos los proyectos"
analisis:
  - ¿Modifica orchestration/ del workspace? Posiblemente
  - ¿Afecta más de 1 proyecto? SÍ (todos)

resultado: WORKSPACE
ubicacion: "orchestration/tareas/2026-01-24/TASK-008-estandares-linting/"
```

---

## 6. METADATA.yml - Campo ubicacion_determinada

Al crear una tarea, documentar la decisión en METADATA.yml:

```yaml
# En la sección alcance
alcance:
  nivel: "workspace|proyecto"
  proyecto: "{nombre-proyecto o null}"
  ubicacion_determinada:
    resultado: "workspace|proyecto"
    razon: "{Por qué se eligió esta ubicación}"
    criterio_aplicado: "{Criterio de la matriz que aplica}"
```

---

## 7. REGLA DE DEFAULT

```yaml
regla_default:
  condicion: "Hay ambigüedad o no se puede determinar con certeza"
  accion: "Documentar en WORKSPACE"
  justificacion: |
    - Es más seguro (no se pierde documentación)
    - Facilita auditoría centralizada
    - Peor caso: tarea de proyecto en workspace (no crítico)
    - Mejor que: tarea transversal perdida en un proyecto
```

---

## 8. EXCEPCIONES

### 8.1 Proyectos sin estructura tareas/

Si un proyecto no tiene `orchestration/tareas/`:
1. Crear la estructura antes de documentar
2. O documentar temporalmente en workspace con nota

### 8.2 Tareas híbridas

Si una tarea comienza en un proyecto pero escala a múltiples:
1. Continuar documentación donde se inició
2. Agregar nota en METADATA.yml sobre el cambio de alcance
3. Considerar split en subtareas si es necesario

---

## 9. INTEGRACION CON TRIGGERS

### 9.1 TRIGGER-INICIO-TAREA

El trigger debe:
1. Determinar ubicación usando esta directiva
2. Crear carpeta en ubicación determinada
3. Registrar en _INDEX.yml correspondiente

### 9.2 TRIGGER-DOC

El trigger debe:
1. Validar en la ubicación determinada según METADATA.yml
2. Si `alcance.nivel: "proyecto"` → buscar en `projects/{p}/orchestration/tareas/`
3. Si `alcance.nivel: "workspace"` → buscar en `orchestration/tareas/`

---

## 10. APLICACION A AGENTES EXTERNOS

### 10.1 Trae (Planificador)

Al crear plan atómico, incluir paso:
```
- Determinar ubicación de documentación según @UBICACION-DOC
- Si proyecto único: projects/{proyecto}/orchestration/tareas/
- Si múltiples o workspace: orchestration/tareas/
```

### 10.2 Windsurf (Ejecutor)

Al recibir tarea:
```
- Verificar campo "ubicacion_carpeta" en prompt
- Crear carpeta en ubicación especificada
- NO tomar decisión propia de ubicación
```

### 10.3 Gemini (Autónomo)

En secuencia de carga:
```
- Paso N: Determinar ubicación de documentación
  - Leer @UBICACION-DOC
  - Aplicar matriz de decisión
  - Crear carpeta en ubicación determinada
```

---

## 11. FECHA DE CORTE

```yaml
fecha_corte:
  fecha: "2026-01-24"
  nota: |
    Las tareas documentadas ANTES de esta fecha siguen en workspace
    (no se migran).

    Las tareas documentadas DESDE esta fecha deben seguir esta directiva.
```

---

## 12. REFERENCIAS

- **@TRIGGER-INICIO:** TRIGGER-INICIO-TAREA.md
- **@TRIGGER-DOC:** TRIGGER-DOCUMENTACION-OBLIGATORIA.md
- **CLAUDE.md:** Regla 7 (Gobernanza de Documentación)
- **@SIMCO-TAREA:** Directiva de ciclo CAPVED
- **@ESTANDAR-ORCHESTRATION:** Estándar de estructura por nivel

---

## 13. HISTORIAL DE CAMBIOS

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0.0 | 2026-01-24 | Versión inicial (TASK-2026-01-24-006) |

---

**Sistema:** SIMCO v4.0.0 | **Mantenido por:** @WS_ORCHESTRATOR
