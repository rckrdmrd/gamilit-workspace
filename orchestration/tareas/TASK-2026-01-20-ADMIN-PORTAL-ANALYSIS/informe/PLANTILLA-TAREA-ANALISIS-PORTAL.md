# Plantilla: Tarea de Análisis de Portal
## Basada en TASK-2026-01-20-ADMIN-PORTAL-ANALYSIS

Esta plantilla sirve como base para ejecutar tareas similares de análisis exhaustivo de portales web (Admin, Student, Teacher, etc.).

---

## 1. DEFINICIÓN DE LA TAREA

### 1.1 Prompt Inicial Sugerido

```markdown
Análisis y documentación de todas las páginas del portal [NOMBRE] en el frontend:
- Verificar que estén bien definidas en sus funciones
- Validar consumo de APIs
- Verificar que el backend esté correctamente definido
- Soportar generación de archivos (PDF, Excel, etc.)
- Manejo de multimedia (imágenes, videos, audios)

Primera fase: análisis y planeación siguiendo CAPVED.
Documentación debe existir en orchestration/ y docs/.
Identificar definiciones faltantes, existentes a integrar, y obsoletas a purgar.
Orden de ejecución lógico sin saltar dependencias.
Orquestar subagentes en paralelo cuando no tengan dependencias.
```

### 1.2 Variables a Definir

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `[PORTAL_NAME]` | Nombre del portal | Admin, Student, Teacher |
| `[EPIC_ID]` | ID de la épica relacionada | EXT-002, EXT-003 |
| `[FRONTEND_PATH]` | Path a páginas frontend | `apps/frontend/src/apps/admin/pages/` |
| `[BACKEND_PATH]` | Path a controllers | `apps/backend/src/modules/admin/controllers/` |
| `[DOCS_PATH]` | Path a documentación | `docs/03-fase-extensiones/EXT-002-admin-extendido/` |

---

## 2. ESTRUCTURA DE CARPETA DE TAREA

```
orchestration/tareas/TASK-{YYYY-MM-DD}-{PORTAL}-PORTAL-ANALYSIS/
├── METADATA.yml           # Metadatos de la tarea
├── PLAN-MAESTRO-ANALISIS.md  # Plan detallado
├── _INDEX.md              # Índice navegable
├── subtareas/
│   ├── SUBTAREAS-INDEX.yml   # Índice de subtareas
│   └── _TEMPLATE-USER-STORY.md  # Template para US
├── entregables/
│   ├── REPORTE-VALIDACION-COHERENCIA.md
│   └── RESUMEN-EJECUTIVO.md
└── informe/
    ├── INFORME-TAREA-COMPLETO.md
    ├── CONTEXTO-SUBAGENTES.md
    ├── MEJORA-CONTINUA.md
    └── PLANTILLA-TAREA-ANALISIS-PORTAL.md
```

---

## 3. METADATA.yml TEMPLATE

```yaml
task:
  id: "TASK-{YYYY-MM-DD}-{PORTAL}-PORTAL-ANALYSIS"
  name: "Análisis Integral del {Portal} Portal"
  type: "ANALYSIS"
  status: "IN_PROGRESS"  # IN_PROGRESS, COMPLETED, BLOCKED
  priority: "P0"
  created: "{YYYY-MM-DD}"
  updated: "{YYYY-MM-DD}"

  context:
    proyecto: "gamilit"
    epic: "{EPIC_ID}"
    portal: "{PORTAL_NAME}"

  scope:
    frontend:
      pages_to_analyze: []  # Lista de páginas
      hooks_path: "{FRONTEND_PATH}/../hooks/"
      api_services: "{FRONTEND_PATH}/../../services/api/"
    backend:
      controllers_path: "{BACKEND_PATH}"
      entities_path: "{BACKEND_PATH}/../entities/"
    documentation:
      docs_path: "{DOCS_PATH}"
      orchestration_path: "orchestration/tareas/TASK-{ID}/"

phases:
  contexto:
    status: "PENDING"  # PENDING, IN_PROGRESS, COMPLETED
    findings: []
  analisis:
    status: "PENDING"
    findings: []
  planeacion:
    status: "PENDING"
    subtasks_count: 0
  validacion:
    status: "PENDING"
    coherence_fe_be: null
    coherence_be_db: null
  ejecucion:
    status: "PENDING"
    completed_subtasks: 0
  documentacion:
    status: "PENDING"
    deliverables: []
```

---

## 4. PLAN DE SUBTAREAS TEMPLATE

### 4.1 NIVEL 0: Documentación Base

| ID | Subtarea | Descripción | Perfil |
|----|----------|-------------|--------|
| T0.1 | Corrección de índices | Actualizar _MAP.md con estados correctos | Manual |
| T0.2 | Actualización trazabilidad | Sincronizar TRACEABILITY.yml | general-purpose |

### 4.2 NIVEL 1: User Stories

Para cada página sin US documentada:

| ID | Subtarea | Página | SP Est. | Perfil |
|----|----------|--------|---------|--------|
| T1.X | US-{EPIC}-0XX | {PageName}Page | X | general-purpose |

### 4.3 NIVEL 2: Especificaciones Técnicas

| ID | Subtarea | Sistema | Tamaño Est. | Perfil |
|----|----------|---------|-------------|--------|
| T2.1 | ET-{SISTEMA}-SYSTEM | Sistema transversal 1 | ~25 KB | general-purpose |
| T2.2 | ET-{SISTEMA}-SYSTEM | Sistema transversal 2 | ~25 KB | general-purpose |

### 4.4 NIVEL 3: Validación

| ID | Subtarea | Validación | Perfil |
|----|----------|------------|--------|
| T3.1 | Coherencia FE↔BE | Endpoints consumidos vs implementados | Explore |
| T3.2 | Coherencia BE↔DB | Entities vs tablas DDL | Explore |

### 4.5 NIVEL 4: Limpieza

| ID | Subtarea | Acción | Perfil |
|----|----------|--------|--------|
| T4.1 | Purga | Identificar y eliminar obsoletos | Manual |
| T4.2 | Inventarios | Actualizar métricas e índices | Manual |

---

## 5. PROMPTS ESTANDARIZADOS

### 5.1 Exploración Frontend

```markdown
**PERFIL:** Explorador de Código Frontend

**TAREA:** Analizar llamadas API del {PORTAL} de {PROYECTO}

**OBJETIVO:** Documentar TODAS las llamadas API del frontend {PORTAL}:
1. Endpoints consumidos
2. Métodos HTTP usados
3. Hooks que los invocan
4. Páginas que los usan

**ARCHIVOS A EXPLORAR:**
- `{FRONTEND_PATH}/../hooks/` - Todos los hooks
- `{FRONTEND_PATH}/` - Todas las páginas
- `{API_SERVICES_PATH}` - Servicios API

**FORMATO DE SALIDA:**
```
ENDPOINT: [método] [ruta]
ARCHIVO_FRONTEND: [path absoluto]
HOOK/FUNCIÓN: [nombre]
PÁGINA: [página que lo usa]
STATUS: [IMPLEMENTED/NOT_IMPLEMENTED si se puede determinar]
```

Sé exhaustivo - necesito una lista COMPLETA.
```

### 5.2 Exploración Backend

```markdown
**PERFIL:** Explorador de Código Backend

**TAREA:** Documentar TODOS los endpoints del módulo {PORTAL} de {PROYECTO}

**OBJETIVO:** Inventario completo de endpoints backend

**ARCHIVOS A EXPLORAR:**
- `{BACKEND_PATH}/` - Todos los controllers
- Buscar: `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`

**FORMATO DE SALIDA:**
```
ENDPOINT: [método] [ruta completa /api/{portal}/...]
CONTROLLER: [archivo]
MÉTODO: [nombre del método]
GUARDS: [JwtAuthGuard, etc.]
DTO_REQUEST: [nombre si aplica]
DTO_RESPONSE: [nombre si aplica]
```

Sé exhaustivo - necesito lista COMPLETA.
```

### 5.3 Creación de User Story

```markdown
**PERFIL:** Documentador de User Stories

**TAREA:** Crear User Story US-{EPIC}-0XX para {PageName}Page

**CONTEXTO:**
- Épica: {EPIC_ID}
- Proyecto: {PROYECTO}
- La página ya está IMPLEMENTADA

**ARCHIVOS DE REFERENCIA:**
- Página: `{FRONTEND_PATH}/{PageName}Page.tsx`
- Hooks: `{HOOKS_PATH}/use{Name}.ts`
- Controller: `{BACKEND_PATH}/{name}.controller.ts`
- US ejemplo: `{DOCS_PATH}/historias-usuario/US-{EPIC}-001-*.md`

**FORMATO REQUERIDO:**
[Ver template de frontmatter YAML]

**SECCIONES REQUERIDAS:**
- Información General
- Historia de Usuario (Como/Quiero/Para)
- Endpoints API
- Criterios de Aceptación
- Definición de Hecho
- Referencias de Implementación
- Trazabilidad

**OUTPUT:** Archivo markdown completo
**GUARDAR EN:** `{DOCS_PATH}/historias-usuario/US-{EPIC}-0XX-{name}.md`
```

### 5.4 Validación de Coherencia

```markdown
**PERFIL:** Validador de Documentación

**TAREA:** Validar coherencia de TASK-{ID}

**VERIFICAR:**

1. **docs/{DOCS_PATH}/_MAP.md**
   - ¿Incluye las nuevas US?
   - ¿Métricas actualizadas?

2. **docs/{DOCS_PATH}/historias-usuario/**
   - ¿Existen todos los archivos?
   - ¿Formato correcto?

3. **docs/{DOCS_PATH}/especificaciones/**
   - ¿Existen las nuevas ET?

4. **orchestration/tareas/TASK-{ID}/**
   - ¿METADATA.yml completo?
   - ¿Entregables presentes?

5. **orchestration/tareas/_INDEX.yml**
   - ¿Tarea registrada?

6. **[WORKSPACE]/orchestration/tareas/_INDEX.yml**
   - ¿Tarea registrada?

**FORMATO DE SALIDA:**
```
ARCHIVO: [path]
EXISTE: Si/No
CONTENIDO_VALIDO: Si/No/Parcial
PROBLEMAS: [lista]
```
```

---

## 6. CHECKLIST DE EJECUCIÓN

### 6.1 Pre-Ejecución

```markdown
- [ ] git fetch origin && git status (verificar sincronización)
- [ ] Identificar páginas del portal a analizar
- [ ] Identificar páginas sin documentación formal
- [ ] Crear carpeta de tarea: orchestration/tareas/TASK-{ID}/
- [ ] Crear METADATA.yml inicial
- [ ] Registrar tarea en _INDEX.yml del proyecto
- [ ] Definir plan de subtareas con dependencias
```

### 6.2 Durante Ejecución

```markdown
**Por cada NIVEL:**
- [ ] Lanzar subagentes (paralelos si no hay dependencias)
- [ ] Verificar que archivos fueron creados/modificados
- [ ] Si falla, relanzar con contexto más específico
- [ ] Hacer commit al completar nivel
- [ ] Actualizar METADATA.yml con progreso

**Verificaciones de subagente:**
- [ ] ls -la [path] para confirmar archivos creados
- [ ] cat [archivo] | head -20 para verificar contenido
- [ ] Si el archivo fue revertido, re-aplicar cambios
```

### 6.3 Post-Ejecución

```markdown
- [ ] Ejecutar validación de coherencia (T3.1, T3.2)
- [ ] Actualizar _MAP.md con métricas finales
- [ ] Actualizar _INDEX.yml del proyecto (tarea completada)
- [ ] Actualizar _INDEX.yml del workspace
- [ ] Generar informe de tarea
- [ ] Verificar git status limpio
- [ ] Push final
```

---

## 7. MÉTRICAS ESPERADAS

### 7.1 Por Tipo de Portal

| Portal | Páginas Est. | Endpoints Est. | Entities Est. |
|--------|--------------|----------------|---------------|
| Admin | 15-20 | 150-200 | 15-20 |
| Student | 20-30 | 80-120 | 10-15 |
| Teacher | 10-15 | 60-80 | 8-12 |

### 7.2 Coherencia Esperada

| Validación | Objetivo |
|------------|----------|
| FE↔BE | ≥ 95% |
| BE↔DB | 100% |
| Cobertura documentación | 100% |

---

## 8. TROUBLESHOOTING

### 8.1 Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| Archivo no creado por subagente | Contexto insuficiente | Incluir path absoluto completo |
| Cambios revertidos | Hook de pre-commit | Re-aplicar después del commit |
| Subagente timeout | Tarea muy grande | Dividir en subtareas más pequeñas |
| Métricas incorrectas | Archivos no contados | Verificar paths y patrones glob |

### 8.2 Comandos de Verificación

```bash
# Verificar archivos creados
ls -la {path}/*.md | wc -l

# Verificar contenido de archivo
head -50 {archivo}

# Verificar métricas en _MAP.md
grep -E "(documentadas|SP|implementadas)" {_MAP.md}

# Verificar tarea en índice
grep "TASK-{ID}" {_INDEX.yml}

# Estado de git
git status --short
git diff --stat
```

---

## 9. REFERENCIAS

| Documento | Propósito |
|-----------|-----------|
| `orchestration/directivas/principios/PRINCIPIO-CAPVED.md` | Metodología |
| `orchestration/directivas/simco/SIMCO-TAREA.md` | Ejecución de tareas |
| `orchestration/directivas/triggers/TRIGGER-COHERENCIA-CAPAS.md` | Validación |
| `orchestration/directivas/triggers/TRIGGER-CIERRE-TAREA-OBLIGATORIO.md` | Cierre |
| `CLAUDE.md` | Reglas del workspace |

---

**Plantilla creada:** 2026-01-20
**Basada en:** TASK-2026-01-20-ADMIN-PORTAL-ANALYSIS
**Uso:** Copiar y adaptar para análisis de otros portales
