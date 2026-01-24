# PLAN DE MIGRACIÓN - ORCHESTRATION OLD → NEW

**Tarea:** WM-001-MIGRACION-ORCHESTRATION
**Agente:** Workspace-Manager
**Fecha inicio:** 2025-11-23
**Estado:** 🔄 En progreso

---

## 🎯 OBJETIVO

Migrar el contenido de `orchestration_old/` y `orchestration_bckp/` a la nueva estructura de `orchestration/`, adaptando el contenido a la nueva organización y llenando huecos con información de `docs/`.

---

## 📊 ANÁLISIS DE SITUACIÓN ACTUAL

### Estructura Nueva (Destino)

```
orchestration/
├── README.md ✅ Ya existe
├── CHANGELOG-SISTEMA-SUBAGENTES.md ✅ Ya existe
├── prompts/ ✅ 10 prompts ya creados
├── directivas/ ⚠️ Contenido parcial
├── trazas/ ⚠️ Solo 6 archivos, falta contenido
├── inventarios/ ⚠️ Solo MASTER_INVENTORY.yml, faltan otros
├── estados/ ❌ Vacío
├── reportes/ ⚠️ Subcarpetas pero sin contenido
├── agentes/ ⚠️ Carpetas creadas pero sin contenido de tareas
├── templates/ ❌ Vacío
└── scripts/ ❌ Vacío
```

**Total archivos actuales:** 36 archivos MD

### Contenido a Migrar

#### orchestration_old/ (Fuente Principal)
- **Total:** 988 archivos MD
- **Estructura:**
  ```
  01-analisis/ (backend, coherencia, database, documentacion, frontend, sistema-recompensas)
  02-planes/
  03-reportes/
  03-subagentes/
  04-inventarios/
  05-sprints/
  05-validaciones/
  06-indices/
  06-respaldos/
  07-quick-wins/
  08-resumen-sesiones/
  09-guias/
  10-matrices/
  11-deployment/
  12-usuarios/
  backend/ (tareas BE-XXX)
  database/ (tareas DB-XXX)
  frontend/ (tareas FE-XXX)
  handoffs/
  + archivos MD en raíz (reportes, análisis, trazas)
  ```

#### orchestration_bckp/ (Fuente Secundaria)
- **Total:** 200 archivos MD
- **Estructura similar pero menos completa**
- Parece ser un backup intermedio

#### docs/ (Complemento)
- **Documentación del proyecto organizada por fases**
- **Inventarios de database en:** `90-transversal/inventarios-database/`
- **Features:** `90-transversal/features/`
- **Correcciones:** `90-transversal/correcciones/`

---

## 🗺️ MAPEO DE MIGRACIÓN

### 1. TRAZAS

#### Origen → Destino

| Archivo Origen | Destino | Acción |
|----------------|---------|--------|
| `orchestration_old/TRAZA-CORRECCIONES.md` | `trazas/TRAZA-CORRECCIONES.md` | ✅ Migrar y consolidar |
| `orchestration_bckp/TRAZA-TAREAS-DATABASE.md` | `trazas/TRAZA-TAREAS-DATABASE.md` | ✅ Consolidar con existente |
| `orchestration_bckp/TRAZA-TAREAS-BACKEND.md` | `trazas/TRAZA-TAREAS-BACKEND.md` | ✅ Consolidar con existente |
| `orchestration_bckp/TRAZA-TAREAS-FRONTEND.md` | `trazas/TRAZA-TAREAS-FRONTEND.md` | ✅ Consolidar con existente |
| Archivos en `03-reportes/`, `05-validaciones/` | `trazas/` | ⚙️ Analizar y clasificar |

**Estrategia:**
1. Leer archivos de traza existentes en `orchestration/trazas/`
2. Leer archivos de traza en `orchestration_old/` y `orchestration_bckp/`
3. Consolidar información sin duplicar
4. Mantener formato de la nueva estructura
5. Agregar cross-references cuando sea necesario

### 2. INVENTARIOS

#### Origen → Destino

| Archivo Origen | Destino | Acción |
|----------------|---------|--------|
| `orchestration_old/DATABASE_INVENTORY.yml` | `inventarios/DATABASE_INVENTORY.yml` | ✅ Crear/Actualizar |
| `orchestration_old/04-inventarios/*` | `inventarios/` | ✅ Revisar y migrar |
| `orchestration_bckp/inventarios/*` | `inventarios/` | ✅ Consolidar |
| `docs/90-transversal/inventarios-database/*` | `inventarios/DATABASE_INVENTORY.yml` | ⚙️ Complementar con info de docs |

**Inventarios a crear:**
- ✅ MASTER_INVENTORY.yml (ya existe)
- ❌ DATABASE_INVENTORY.yml (migrar desde old)
- ❌ BACKEND_INVENTORY.yml (crear desde análisis)
- ❌ FRONTEND_INVENTORY.yml (crear desde análisis)
- ❌ DEPENDENCY_GRAPH.yml (crear)
- ❌ TEST_COVERAGE.yml (crear)

**Estrategia:**
1. Priorizar inventarios de `orchestration_old/04-inventarios/`
2. Complementar con información de `docs/90-transversal/inventarios-database/`
3. Validar contra código actual
4. Generar inventarios faltantes

### 3. DIRECTIVAS

#### Origen → Destino

| Archivo Origen | Destino | Acción |
|----------------|---------|--------|
| `orchestration_old/DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md` | `directivas/DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md` | ✅ Migrar |
| `orchestration_old/09-guias/*` | `directivas/` o `prompts/` | ⚙️ Clasificar según contenido |
| Políticas y estándares en `old` | `directivas/` | ⚙️ Consolidar |

**Directivas a crear/migrar:**
- ✅ POLITICAS-USO-AGENTES.md (verificar si existe)
- ❌ DIRECTIVA-ANTI-DUPLICACION.md (crear)
- ❌ DIRECTIVA-TESTING.md (crear)
- ❌ DIRECTIVA-CONTROL-VERSIONES.md (crear desde docs si existe)
- ❌ ESTANDARES-NOMENCLATURA.md (crear desde docs/98-standards)

### 4. ESTADOS

#### Origen → Destino

| Archivo Origen | Destino | Acción |
|----------------|---------|--------|
| `orchestration_bckp/ESTADO-DATABASE.json` | `estados/ESTADO-DATABASE.json` | ✅ Migrar |
| `orchestration_bckp/ESTADO-BACKEND.json` | `estados/ESTADO-BACKEND.json` | ✅ Migrar |
| `orchestration_bckp/ESTADO-FRONTEND.json` | `estados/ESTADO-FRONTEND.json` | ✅ Migrar |
| `orchestration_bckp/ESTADO-DEVOPS.json` | `estados/ESTADO-DEVOPS.json` | ✅ Migrar |
| `orchestration_bckp/ESTADO-INTEGRATION.json` | `estados/ESTADO-INTEGRATION.json` | ✅ Migrar |

**Estrategia:**
1. Copiar archivos JSON de estado
2. Validar estructura
3. Crear ESTADO-GENERAL.json consolidado

### 5. AGENTES (Documentación de Tareas)

#### Origen → Destino

| Carpeta Origen | Destino | Acción |
|----------------|---------|--------|
| `orchestration_old/backend/BE-XXX/` | `agentes/backend/BE-XXX/` | ✅ Migrar tareas backend |
| `orchestration_old/database/DB-XXX/` | `agentes/database/DB-XXX/` | ✅ Migrar tareas database |
| `orchestration_old/frontend/FE-XXX/` | `agentes/frontend/FE-XXX/` | ✅ Migrar tareas frontend |
| `orchestration_old/handoffs/` | `agentes/{agente}/` | ⚙️ Clasificar por agente receptor |

**Estrategia:**
1. Migrar carpetas de tareas completas con su estructura
2. Renombrar archivos al formato nuevo (01-ANALISIS.md, 02-PLAN.md, etc.)
3. Agregar metadata en cada carpeta de tarea
4. Actualizar referencias en trazas

**Tareas identificadas en orchestration_old/backend/:**
- BE-088-CLASSROOM-ASSIGNMENTS
- BE-089-STUDENT-BLOCKING
- BE-090-GAMIFICATION-CONFIG
- BE-091-ASSIGNMENT-DISTRIBUTION
- BE-092-CONTENT-MANAGEMENT
- BE-FE-059, BE-FE-060, BE-FE-061, BE-FE-062
- BE-049-WORKAROUND
- BE-ANALISIS-PORTALES-2025-11-11

**Total estimado:** ~20-30 carpetas de tareas backend, probablemente similar para database y frontend.

### 6. REPORTES

#### Origen → Destino

| Tipo de Reporte | Origen | Destino | Acción |
|-----------------|--------|---------|--------|
| Reportes de validación | `orchestration_old/REPORTE-VALIDACION-*.md` | `reportes/REPORTE-VALIDACION-{FECHA}.md` | ✅ Migrar con fecha |
| Reportes de coherencia | `orchestration_old/REPORTE-AUDITORIA-*.md` | `reportes/REPORTE-AUDITORIA-{FECHA}.md` | ✅ Migrar con fecha |
| Reportes de sesiones | `orchestration_old/08-resumen-sesiones/` | `reportes/sesiones/` | ✅ Crear subcarpeta y migrar |
| Reportes de análisis | `orchestration_old/01-analisis/` | `reportes/analisis/` | ✅ Crear subcarpeta y migrar |
| Handoffs | `orchestration_old/handoffs/` | `reportes/handoffs/` | ✅ Crear subcarpeta y migrar |

**Estrategia:**
1. Crear subcarpetas en reportes/ según tipo
2. Renombrar archivos con formato estándar: `TIPO-NOMBRE-{FECHA}.md`
3. Crear índice de reportes

### 7. TEMPLATES

#### Origen → Destino

| Archivo Origen | Destino | Acción |
|----------------|---------|--------|
| `orchestration_old/TEMPLATE-INICIO-AGENTE.md` | `templates/TEMPLATE-INICIO-AGENTE.md` | ✅ Migrar |
| `orchestration_old/EJEMPLO-INICIO-AGENTE-*.md` | `templates/` | ✅ Migrar como ejemplos |
| Crear nuevos templates | `templates/` | ✅ Basados en estructura nueva |

**Templates a crear:**
- ✅ TEMPLATE-INICIO-AGENTE.md (migrar)
- ❌ TEMPLATE-ANALISIS.md (crear)
- ❌ TEMPLATE-PLAN.md (crear)
- ❌ TEMPLATE-VALIDACION.md (crear)
- ❌ TEMPLATE-REPORTE-CALIDAD.md (crear)

### 8. SCRIPTS

#### Origen → Destino

| Archivo Origen | Destino | Acción |
|----------------|---------|--------|
| `orchestration_old/TEST-CARGA-LIMPIA.sh` | `scripts/test-carga-limpia.sh` | ✅ Migrar |
| `orchestration_old/scripts-correccion/*` | `scripts/` | ⚙️ Revisar y migrar útiles |
| `orchestration_bckp/scripts/*` | `scripts/` | ⚙️ Revisar y migrar útiles |
| `orchestration_bckp/*.py` | `scripts/` | ✅ Migrar scripts Python |

**Scripts identificados:**
- enhance-inventory.py
- extract-types.py
- TEST-CARGA-LIMPIA.sh

---

## 📋 PLAN DE EJECUCIÓN

### FASE 1: Preparación (COMPLETADA ✅)
- [x] Explorar estructura actual de orchestration/
- [x] Explorar contenido de orchestration_old/
- [x] Explorar contenido de orchestration_bckp/
- [x] Explorar contenido de docs/
- [x] Crear plan de migración detallado

### FASE 2: Migración de Archivos Críticos

#### 2.1 Estados (P0 - Alta prioridad)
- [ ] Migrar archivos JSON de estado desde orchestration_bckp/
- [ ] Crear ESTADO-GENERAL.json consolidado
- [ ] Validar estructura JSON

#### 2.2 Inventarios (P0 - Alta prioridad)
- [ ] Migrar DATABASE_INVENTORY.yml
- [ ] Crear/actualizar BACKEND_INVENTORY.yml
- [ ] Crear/actualizar FRONTEND_INVENTORY.yml
- [ ] Crear DEPENDENCY_GRAPH.yml básico
- [ ] Crear TEST_COVERAGE.yml básico
- [ ] Complementar con info de docs/90-transversal/inventarios-database/

#### 2.3 Trazas (P0 - Alta prioridad)
- [ ] Consolidar TRAZA-CORRECCIONES.md
- [ ] Consolidar TRAZA-TAREAS-DATABASE.md
- [ ] Consolidar TRAZA-TAREAS-BACKEND.md
- [ ] Consolidar TRAZA-TAREAS-FRONTEND.md
- [ ] Crear TRAZA-BUGS.md (nuevo)
- [ ] Crear TRAZA-FEATURES.md (usando docs/90-transversal/features/)

### FASE 3: Migración de Directivas y Templates

#### 3.1 Directivas (P1 - Media prioridad)
- [ ] Migrar DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md
- [ ] Revisar y migrar contenido de 09-guias/
- [ ] Crear DIRECTIVA-ANTI-DUPLICACION.md
- [ ] Crear DIRECTIVA-TESTING.md
- [ ] Crear ESTANDARES-NOMENCLATURA.md (desde docs/98-standards)
- [ ] Verificar POLITICAS-USO-AGENTES.md

#### 3.2 Templates (P1 - Media prioridad)
- [ ] Migrar TEMPLATE-INICIO-AGENTE.md
- [ ] Migrar ejemplos de inicio de agente
- [ ] Crear TEMPLATE-ANALISIS.md
- [ ] Crear TEMPLATE-PLAN.md
- [ ] Crear TEMPLATE-VALIDACION.md
- [ ] Crear TEMPLATE-REPORTE-CALIDAD.md

### FASE 4: Migración de Tareas de Agentes

#### 4.1 Database (P1 - Media prioridad)
- [ ] Listar todas las tareas DB-XXX en orchestration_old/
- [ ] Migrar tareas a agentes/database/
- [ ] Renombrar archivos al formato nuevo
- [ ] Actualizar referencias en TRAZA-TAREAS-DATABASE.md

#### 4.2 Backend (P1 - Media prioridad)
- [ ] Listar todas las tareas BE-XXX en orchestration_old/
- [ ] Migrar tareas a agentes/backend/
- [ ] Renombrar archivos al formato nuevo
- [ ] Actualizar referencias en TRAZA-TAREAS-BACKEND.md

#### 4.3 Frontend (P1 - Media prioridad)
- [ ] Listar todas las tareas FE-XXX en orchestration_old/
- [ ] Migrar tareas a agentes/frontend/
- [ ] Renombrar archivos al formato nuevo
- [ ] Actualizar referencias en TRAZA-TAREAS-FRONTEND.md

#### 4.4 Handoffs (P2 - Baja prioridad)
- [ ] Analizar handoffs/
- [ ] Clasificar por agente receptor
- [ ] Migrar a carpetas correspondientes

### FASE 5: Migración de Reportes

#### 5.1 Reportes Principales (P2 - Baja prioridad)
- [ ] Crear subcarpetas en reportes/
- [ ] Migrar reportes de validación
- [ ] Migrar reportes de auditoría
- [ ] Migrar reportes de alineación
- [ ] Crear índice de reportes

#### 5.2 Reportes de Análisis y Sesiones (P2 - Baja prioridad)
- [ ] Migrar contenido de 01-analisis/
- [ ] Migrar contenido de 08-resumen-sesiones/
- [ ] Organizar por fecha y tipo

### FASE 6: Migración de Scripts

#### 6.1 Scripts (P2 - Baja prioridad)
- [ ] Migrar scripts Python
- [ ] Migrar scripts Bash
- [ ] Revisar scripts-correccion/
- [ ] Documentar uso de cada script
- [ ] Crear README.md en scripts/

### FASE 7: Validación y Limpieza

#### 7.1 Validación (P0 - Alta prioridad)
- [ ] Verificar que todos los archivos críticos se migraron
- [ ] Validar estructura de archivos YAML/JSON
- [ ] Revisar integridad de trazas
- [ ] Validar cross-references
- [ ] Comprobar que no hay duplicación

#### 7.2 Documentación (P0 - Alta prioridad)
- [ ] Generar REPORTE-MIGRACION.md
- [ ] Actualizar README.md de orchestration/
- [ ] Crear índices necesarios
- [ ] Documentar archivos no migrados y razón

#### 7.3 Limpieza (P1 - Media prioridad)
- [ ] Archivar orchestration_old/ como .tar.gz
- [ ] Archivar orchestration_bckp/ como .tar.gz
- [ ] Mover archivos .tar.gz a ubicación segura
- [ ] Actualizar .gitignore si es necesario

---

## 🎯 CRITERIOS DE ÉXITO

### Estructura Completa
- ✅ Todas las carpetas de orchestration/ tienen contenido relevante
- ✅ No hay carpetas vacías sin justificación

### Inventarios Actualizados
- ✅ DATABASE_INVENTORY.yml existe y está completo
- ✅ BACKEND_INVENTORY.yml existe y está completo
- ✅ FRONTEND_INVENTORY.yml existe y está completo
- ✅ MASTER_INVENTORY.yml está actualizado
- ✅ Inventarios validados contra código actual

### Trazas Consolidadas
- ✅ Todas las trazas tienen historial completo
- ✅ No hay información duplicada
- ✅ Cross-references funcionan correctamente
- ✅ Formato consistente en todas las trazas

### Documentación de Tareas
- ✅ Todas las tareas importantes tienen documentación
- ✅ Tareas organizadas por agente
- ✅ Formato estándar en documentación de tareas
- ✅ Referencias actualizadas en trazas

### Reportes Organizados
- ✅ Reportes clasificados por tipo
- ✅ Nomenclatura consistente con fechas
- ✅ Índice de reportes creado

### Templates y Directivas
- ✅ Templates completos para todos los flujos
- ✅ Directivas migradas y actualizadas
- ✅ Ejemplos documentados

### Validación
- ✅ No hay archivos críticos sin migrar
- ✅ Estructura YAML/JSON válida
- ✅ Sin duplicación de información
- ✅ Reporte de migración completo

### Limpieza
- ✅ orchestration_old/ archivado
- ✅ orchestration_bckp/ archivado
- ✅ Workspace limpio

---

## ⚠️ RIESGOS Y MITIGACIONES

### Riesgo 1: Pérdida de información durante migración
**Mitigación:**
- No eliminar orchestration_old/ hasta validar migración completa
- Crear backups antes de comenzar
- Validar contenido crítico manualmente

### Riesgo 2: Duplicación de información
**Mitigación:**
- Usar cross-references en vez de copiar contenido
- Consolidar información similar
- Validar antes de migrar

### Riesgo 3: Romper referencias existentes
**Mitigación:**
- Documentar cambios de ubicación
- Actualizar referencias en trazas
- Crear redirects si es necesario

### Riesgo 4: Migración incompleta
**Mitigación:**
- Checklist detallado de archivos a migrar
- Validación post-migración
- Reporte de archivos no migrados con justificación

---

## 📊 MÉTRICAS DE PROGRESO

**Archivos a migrar:**
- orchestration_old/: 988 archivos MD
- orchestration_bckp/: 200 archivos MD
- **Total:** ~1,188 archivos a procesar

**Estimación de trabajo:**
- Archivos críticos (P0): ~50 archivos (10% de esfuerzo)
- Tareas de agentes (P1): ~100 carpetas (40% de esfuerzo)
- Reportes y análisis (P2): ~800 archivos (30% de esfuerzo)
- Validación y limpieza (P0): 20% de esfuerzo

**Estado actual:**
- ✅ FASE 1 completada (Preparación)
- ⏳ FASE 2 pendiente (Estados, Inventarios, Trazas)
- ⏳ FASE 3 pendiente (Directivas, Templates)
- ⏳ FASE 4 pendiente (Tareas de agentes)
- ⏳ FASE 5 pendiente (Reportes)
- ⏳ FASE 6 pendiente (Scripts)
- ⏳ FASE 7 pendiente (Validación y limpieza)

---

## 📝 NOTAS

### Decisiones Tomadas

1. **Priorización:** Estados, Inventarios y Trazas primero (información crítica)
2. **Consolidación:** No copiar información duplicada, usar cross-references
3. **Formato:** Adaptar al formato de la nueva estructura
4. **Validación:** Validar contra código actual, no solo migrar archivos antiguos
5. **Archivado:** No eliminar orchestration_old/ hasta validación completa

### Preguntas Pendientes

1. ¿Qué hacer con archivos en raíz de orchestration_old/ que no encajan en nueva estructura?
   - **Respuesta:** Clasificar y mover a reportes/ o crear subcategoría apropiada

2. ¿Migrar TODO el contenido de 08-resumen-sesiones/ o solo lo más reciente?
   - **Respuesta:** Migrar todo pero organizar por fecha, archivar lo muy antiguo

3. ¿Validar inventarios contra código actual o migrar tal cual?
   - **Respuesta:** Validar y actualizar contra código actual

---

**Próximo paso:** Iniciar FASE 2 - Migración de Estados, Inventarios y Trazas
