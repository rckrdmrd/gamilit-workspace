# SIMCO-ESTRUCTURA-TAREAS - Organización de Tareas por Fecha y Features

**Sistema:** SIMCO v4.3.0
**Version:** 1.0.0
**Fecha:** 2026-01-24
**Tipo:** Directiva Obligatoria

---

## 1. Propósito

Esta directiva define la estructura estándar para organizar tareas en `orchestration/tareas/`, facilitando:
- Localización rápida por fecha
- Trazabilidad de progresión
- Mapeo de features/épicas a tareas
- Documentación CAPVED completa

---

## 2. Estructura de Carpetas

```
orchestration/tareas/
├── _INDEX.yml                    # Índice maestro de todas las tareas
├── _FEATURES-MAP.yml             # Mapa de features/épicas → tareas
├── _templates/                   # Templates para nuevas tareas
│   ├── TASK-TEMPLATE/            # Template de carpeta de tarea
│   └── DAY-INDEX-TEMPLATE.yml    # Template de índice de día
│
├── 2026-01-24/                   # Carpeta por día (YYYY-MM-DD)
│   ├── _INDEX.yml                # Índice del día
│   ├── TASK-001-estandarizacion-orchestration/
│   │   ├── METADATA.yml          # Metadatos de la tarea
│   │   ├── 01-CONTEXTO.md        # C - Contexto
│   │   ├── 02-ANALISIS.md        # A - Análisis
│   │   ├── 03-PLANEACION.md      # P - Planeación
│   │   ├── 04-VALIDACION.md      # V - Validación
│   │   ├── 05-EJECUCION.md       # E - Ejecución
│   │   └── 06-DOCUMENTACION.md   # D - Documentación
│   └── TASK-002-otra-tarea/
│       └── ...
│
├── 2026-01-25/
│   └── ...
```

---

## 3. Archivos de Índice

### 3.1 _INDEX.yml (Índice Maestro)

```yaml
# orchestration/tareas/_INDEX.yml
version: "1.0.0"
actualizado: "2026-01-24"

resumen:
  total_tareas: 15
  completadas: 12
  en_progreso: 2
  pendientes: 1

por_fecha:
  2026-01-24:
    total: 5
    tareas:
      - id: TASK-001
        titulo: "Estandarización orchestration"
        estado: completada
        feature: FT-001
      - id: TASK-002
        titulo: "Migración template-saas"
        estado: completada
        feature: FT-001

  2026-01-23:
    total: 3
    tareas:
      - id: TASK-001
        titulo: "Análisis coherencia"
        estado: completada
        feature: FT-002

por_estado:
  completadas:
    - 2026-01-24/TASK-001
    - 2026-01-24/TASK-002
  en_progreso:
    - 2026-01-24/TASK-003
  pendientes:
    - 2026-01-24/TASK-004
```

### 3.2 _FEATURES-MAP.yml (Mapa de Features)

```yaml
# orchestration/tareas/_FEATURES-MAP.yml
version: "1.0.0"
actualizado: "2026-01-24"

features:
  FT-001:
    nombre: "Estandarización SIMCO-ESTANDAR-ORCHESTRATION"
    descripcion: "Consolidar estructura de orchestration en todos los proyectos"
    estado: completada
    progreso: 100%
    fecha_inicio: "2026-01-24"
    fecha_fin: "2026-01-24"
    tareas:
      - path: 2026-01-24/TASK-001-estandarizacion-gamilit
        estado: completada
      - path: 2026-01-24/TASK-002-estandarizacion-erp-core
        estado: completada
      - path: 2026-01-24/TASK-003-estandarizacion-verticales
        estado: completada

  FT-002:
    nombre: "Análisis de Coherencia entre Capas"
    descripcion: "Validar coherencia DDL-Backend-Frontend"
    estado: en_progreso
    progreso: 60%
    fecha_inicio: "2026-01-23"
    tareas:
      - path: 2026-01-23/TASK-001-analisis-template-saas
        estado: completada
      - path: 2026-01-24/TASK-004-analisis-erp-core
        estado: en_progreso

epicas:
  EPIC-001:
    nombre: "Gobernanza de Workspace"
    features: [FT-001, FT-002, FT-003]
    progreso: 75%
```

### 3.3 Índice de Día (_INDEX.yml)

```yaml
# orchestration/tareas/2026-01-24/_INDEX.yml
fecha: "2026-01-24"
resumen:
  total: 5
  completadas: 4
  en_progreso: 1
  horas_estimadas: 8
  horas_reales: 7.5

tareas:
  TASK-001:
    titulo: "Estandarización orchestration gamilit"
    tipo: refactor
    feature: FT-001
    estado: completada
    agente: claude-code
    duracion: "1.5h"
    commits:
      - "278af805"

  TASK-002:
    titulo: "Estandarización orchestration erp-core"
    tipo: refactor
    feature: FT-001
    estado: completada
    agente: claude-code
    duracion: "1h"
    commits:
      - "de2acde"

  TASK-003:
    titulo: "Estandarización verticales ERP"
    tipo: refactor
    feature: FT-001
    estado: completada
    agente: claude-code
    duracion: "2h"
    commits:
      - "b3afb59"
      - "cdecf4e"
      - "a619b33"
      - "b7afda5"
      - "595b4c2"

notas_dia: |
  - Completada estandarización de 18 proyectos
  - Reducción promedio: 70% en carpetas
  - Todos los proyectos cumplen SIMCO-ESTANDAR-ORCHESTRATION v1.0.0
```

---

## 4. Estructura de Tarea CAPVED

### 4.1 METADATA.yml

```yaml
# METADATA.yml
id: TASK-001
fecha: "2026-01-24"
titulo: "Estandarización orchestration gamilit"
descripcion: "Consolidar estructura de orchestration siguiendo SIMCO-ESTANDAR-ORCHESTRATION v1.0.0"

clasificacion:
  tipo: refactor
  origen: plan-original
  prioridad: P1
  feature: FT-001
  epic: EPIC-001

proyecto:
  nombre: gamilit
  path: projects/gamilit
  nivel: CONSUMER

estado:
  actual: completada
  progreso: 100%
  fecha_inicio: "2026-01-24T10:00:00"
  fecha_fin: "2026-01-24T11:30:00"

fases_capved:
  contexto: completada
  analisis: completada
  planeacion: completada
  validacion: completada
  ejecucion: completada
  documentacion: completada

agente:
  principal: claude-code
  subagentes: []

commits:
  - hash: "278af805"
    mensaje: "[ESTANDAR-ORCHESTRATION] refactor: Consolidate to standard structure"

metricas:
  archivos_modificados: 980
  carpetas_archivadas: 35
  reduccion: "85%"
```

### 4.2 Archivos de Fase CAPVED

#### 01-CONTEXTO.md
```markdown
# Fase C - Contexto

**Tarea:** TASK-001 - Estandarización orchestration gamilit
**Fecha:** 2026-01-24
**Agente:** claude-code

---

## Vinculación

| Campo | Valor |
|-------|-------|
| Proyecto | gamilit |
| Módulo | orchestration |
| Epic | EPIC-001 - Gobernanza de Workspace |
| Feature | FT-001 - Estandarización SIMCO |

## Clasificación

- **Tipo:** refactor
- **Origen:** plan-original
- **Prioridad:** P1

## Documentos SIMCO Cargados

1. SIMCO-ESTANDAR-ORCHESTRATION.md
2. PRINCIPIO-CAPVED.md
3. PROJECT-PROFILE.yml del proyecto

## Estado Inicial

- Carpetas en orchestration: 41
- Archivos root: 18
- Estructura no estandarizada
```

#### 02-ANALISIS.md
```markdown
# Fase A - Análisis

**Tarea:** TASK-001
**Fecha:** 2026-01-24

---

## Comportamiento Deseado

Consolidar la estructura de orchestration/ siguiendo el estándar:
- 10 archivos root obligatorios
- 3 carpetas obligatorias (00-guidelines, inventarios, trazas)
- 1 carpeta _archive para contenido histórico

## Objetos Impactados

| Capa | Impacto |
|------|---------|
| Orchestration | 41 carpetas → 6 carpetas |
| Archivos root | 18 → 10 |
| Documentación | _MAP.md actualizado |

## Dependencias

- No bloquea otras tareas
- No depende de otras tareas

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Pérdida de contenido | Mover a _archive, no eliminar |
| Referencias rotas | Actualizar _MAP.md |
```

#### 03-PLANEACION.md
```markdown
# Fase P - Planeación

**Tarea:** TASK-001
**Fecha:** 2026-01-24

---

## Subtareas

| # | Subtarea | Dominio | Criterio de Aceptación |
|---|----------|---------|------------------------|
| 1 | Crear _archive/ | FS | Carpeta existe |
| 2 | Mover carpetas no estándar | FS | 35 carpetas en _archive |
| 3 | Archivar archivos extra | FS | 8 archivos en _archive/root-files |
| 4 | Verificar archivos obligatorios | FS | 10/10 presentes |
| 5 | Actualizar _MAP.md | DOC | Estructura documentada |
| 6 | Commit y push | GIT | Cambios persistidos |

## Orden de Ejecución

1 → 2 → 3 → 4 → 5 → 6 (secuencial)

## Asignación

- Agente principal: claude-code
- Subagentes: ninguno
```

#### 04-VALIDACION.md
```markdown
# Fase V - Validación

**Tarea:** TASK-001
**Fecha:** 2026-01-24

---

## Checklist de Validación

### Cobertura Análisis → Plan
- [x] Todas las carpetas no estándar identificadas tienen acción (mover a _archive)
- [x] Todos los archivos extra identificados tienen acción (mover a _archive/root-files)
- [x] Archivos obligatorios faltantes tienen acción (crear si no existe)

### Dependencias
- [x] No hay dependencias ocultas
- [x] No bloquea otras tareas

### Scope Creep
- [ ] No detectado

### Gate de Validación
- **Resultado:** APROBADO
- **Notas:** Plan cubre todo el análisis, no hay scope creep
```

#### 05-EJECUCION.md
```markdown
# Fase E - Ejecución

**Tarea:** TASK-001
**Fecha:** 2026-01-24

---

## Progreso de Subtareas

| # | Subtarea | Estado | Notas |
|---|----------|--------|-------|
| 1 | Crear _archive/ | ✅ | `mkdir _archive` |
| 2 | Mover carpetas | ✅ | 35 carpetas movidas |
| 3 | Archivar archivos | ✅ | 8 archivos movidos |
| 4 | Verificar obligatorios | ✅ | 10/10 OK |
| 5 | Actualizar _MAP.md | ✅ | 153 líneas |
| 6 | Commit y push | ✅ | 278af805 |

## Validaciones Build/Lint

- N/A (solo reestructuración de archivos)

## Desviaciones

- Ninguna
```

#### 06-DOCUMENTACION.md
```markdown
# Fase D - Documentación

**Tarea:** TASK-001
**Fecha:** 2026-01-24

---

## Actualizaciones Realizadas

### Documentación
- [x] _MAP.md actualizado con nueva estructura

### Inventarios
- [ ] No aplica (no cambió código)

### Trazas
- [x] Registrado en índice de tareas del día

### ADRs
- [ ] No aplica (no decisión arquitectónica)

## Lecciones Aprendidas

### Qué funcionó bien
- Usar _archive para preservar contenido histórico
- Procesar en lotes con agentes paralelos

### Qué se puede mejorar
- Crear script de validación de estructura

### Para futuras tareas similares
- Siempre mover a _archive, nunca eliminar
- Actualizar _MAP.md inmediatamente después de reestructurar
```

---

## 5. Flujo de Trabajo

### 5.1 Crear Nueva Tarea

```bash
# 1. Verificar si existe carpeta del día
mkdir -p orchestration/tareas/$(date +%Y-%m-%d)

# 2. Copiar template de tarea
cp -r orchestration/tareas/_templates/TASK-TEMPLATE \
      orchestration/tareas/$(date +%Y-%m-%d)/TASK-NNN-descripcion

# 3. Completar METADATA.yml

# 4. Documentar cada fase CAPVED
```

### 5.2 Actualizar Índices

Al completar una tarea:
1. Actualizar `_INDEX.yml` del día
2. Actualizar `_INDEX.yml` maestro
3. Actualizar `_FEATURES-MAP.yml` si aplica

---

## 6. Aliases

```yaml
@TAREAS-HOY: orchestration/tareas/$(date +%Y-%m-%d)/_INDEX.yml
@FEATURES-MAP: orchestration/tareas/_FEATURES-MAP.yml
@NUEVA-TAREA: orchestration/tareas/_templates/TASK-TEMPLATE/
```

---

## 7. Navegación

| Destino | Enlace |
|---------|--------|
| Índice Maestro | tareas/_INDEX.yml |
| Mapa de Features | tareas/_FEATURES-MAP.yml |
| Día Actual | tareas/YYYY-MM-DD/_INDEX.yml |
| Templates | tareas/_templates/ |

---

*SIMCO-ESTRUCTURA-TAREAS v1.0.0 - Sistema SIMCO v4.3.0*
