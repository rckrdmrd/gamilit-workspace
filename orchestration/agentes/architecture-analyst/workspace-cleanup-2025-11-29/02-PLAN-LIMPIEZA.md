# PLAN DE LIMPIEZA - Workspace GAMILIT

**Fecha:** 2025-11-29
**Agente:** Architecture-Analyst
**Basado en:** 01-ANALISIS-CONSOLIDADO.md

---

## RESUMEN DEL PLAN

| Fase | Subtareas | Agentes | Tiempo Est. |
|------|-----------|---------|-------------|
| FASE A | Eliminar obsoletos | Architecture-Analyst | 10 min |
| FASE B | Archivar carpetas antiguas | Workspace-Manager | 20 min |
| FASE C | Mover docs dispersa | Architecture-Analyst | 15 min |
| FASE D | Reorganizar docs/ | Architecture-Analyst | 10 min |
| FASE E | Consolidar trazas | Architecture-Analyst | 15 min |
| FASE F | Unificar inventarios | Architecture-Analyst | 10 min |
| FASE G | Actualizar referencias | Backend-Agent + Frontend-Agent | 10 min |

---

## FASE A: ELIMINAR ARCHIVOS OBSOLETOS

### Prioridad: ALTA
### Ejecutar: DIRECTO (Architecture-Analyst)

### Subtarea A.1: Eliminar prompt obsoleto

**Objetivo:** Eliminar archivo de prompt antiguo

**Archivo:**
```
orchestration/.archive/prompts-obsoletos/PROMPT-AGENTES-PRINCIPALES-OLD.md
```

**Comando:**
```bash
rm orchestration/.archive/prompts-obsoletos/PROMPT-AGENTES-PRINCIPALES-OLD.md
rmdir orchestration/.archive/prompts-obsoletos/
```

**Verificacion:** Confirmar que carpeta no existe

---

### Subtarea A.2: Eliminar carpeta vacia antigravity

**Objetivo:** Eliminar placeholder sin uso

**Carpeta:**
```
orchestration/agentes/antigravity/
```

**Comando:**
```bash
rm -rf orchestration/agentes/antigravity/
```

**Verificacion:** Confirmar que carpeta no existe

---

## FASE B: ARCHIVAR CARPETAS DE TRABAJO ANTIGUAS

### Prioridad: MEDIA
### Ejecutar: ORQUESTAR (Workspace-Manager)

### Subtarea B.1: Identificar carpetas a archivar

**Criterio:** Carpetas de trabajo de agentes anteriores a 2025-11-26 (>3 dias)

**Carpetas candidatas en orchestration/agentes/:**

**architecture-analyst/ (archivar ~50 de 66):**
- Todas las de Nov 23-24 excepto las referenciadas activamente

**database/ (archivar ~20 de 28):**
- Carpetas de Nov 23-24 ya validadas

**backend/ (archivar ~15 de 20):**
- Carpetas de Nov 23-24 ya validadas

**frontend/ (archivar ~6 de 8):**
- Carpetas de Nov 23 ya validadas

### Subtarea B.2: Crear archivo comprimido

**Destino:**
```
orchestration/.archive/agentes-work-2025-11-23-25.tar.gz
```

**Contenido:** Carpetas de trabajo anteriores a Nov 26

### Subtarea B.3: Eliminar carpetas archivadas

**Accion:** Despues de crear tar.gz, eliminar carpetas originales

---

## FASE C: MOVER DOCUMENTACION DISPERSA A docs/

### Prioridad: ALTA
### Ejecutar: DIRECTO (Architecture-Analyst)

### Subtarea C.1: Crear estructura de destino

**Crear carpetas:**
```bash
mkdir -p docs/90-transversal/reportes-implementacion/backend/
mkdir -p docs/90-transversal/reportes-implementacion/frontend/
mkdir -p docs/90-transversal/features/
mkdir -p docs/00-vision-general/migracion/
```

### Subtarea C.2: Mover reportes de backend

**Origen:** apps/backend/
**Destino:** docs/90-transversal/reportes-implementacion/backend/

**Archivos (17):**
```bash
# Implementation Reports
git mv apps/backend/IMPLEMENTATION-REPORT-ADMIN-INTERVENTIONS-BE-001.md docs/90-transversal/reportes-implementacion/backend/
git mv apps/backend/IMPLEMENTATION-REPORT-ADMIN-MONITORING-MODULE-2025-11-24.md docs/90-transversal/reportes-implementacion/backend/
git mv apps/backend/IMPLEMENTATION-REPORT-CLASSROOM-PROGRESS-ENDPOINT.md docs/90-transversal/reportes-implementacion/backend/
git mv apps/backend/IMPLEMENTATION-REPORT-INTERVENTION-ALERTS.md docs/90-transversal/reportes-implementacion/backend/
git mv apps/backend/IMPLEMENTATION-REPORT-LIST-ENDPOINTS-2025-11-25.md docs/90-transversal/reportes-implementacion/backend/
git mv apps/backend/IMPLEMENTATION-REPORT-MISSIONS-INTEGRATION.md docs/90-transversal/reportes-implementacion/backend/

# Bug Fixes
git mv apps/backend/BUG-FIX-CROSS-DATASOURCE-MESSAGE-2025-11-24.md docs/90-transversal/reportes-implementacion/backend/
git mv apps/backend/BUG-FIX-DATASOURCE-DEPENDENCY-2025-11-24.md docs/90-transversal/reportes-implementacion/backend/

# Integration Guides
git mv apps/backend/FRONTEND-INTEGRATION-EXAMPLE-ACHIEVEMENT-TOGGLE.md docs/90-transversal/reportes-implementacion/backend/
git mv apps/backend/FRONTEND-INTEGRATION-GRANT-BONUS.md docs/90-transversal/reportes-implementacion/backend/
git mv apps/backend/FRONTEND-INTEGRATION-GUIDE.md docs/90-transversal/reportes-implementacion/backend/

# Summaries
git mv apps/backend/GRANT-BONUS-IMPLEMENTATION-SUMMARY.md docs/90-transversal/reportes-implementacion/backend/
git mv apps/backend/MISSIONS-INTEGRATION-SUMMARY.md docs/90-transversal/reportes-implementacion/backend/

# Exercise Responses
git mv apps/backend/EXERCISE-RESPONSES-FRONTEND-INTEGRATION.md docs/90-transversal/reportes-implementacion/backend/
git mv apps/backend/EXERCISE-RESPONSES-IMPLEMENTATION-REPORT.md docs/90-transversal/reportes-implementacion/backend/
git mv apps/backend/SUBMISSIONS-DTO-FRONTEND-INTEGRATION.md docs/90-transversal/reportes-implementacion/backend/

# Manifest
git mv apps/backend/LIST-ENDPOINTS-FILES-MANIFEST.md docs/90-transversal/reportes-implementacion/backend/
```

### Subtarea C.3: Mover reportes de frontend

**Origen:** apps/frontend/
**Destino:** docs/90-transversal/reportes-implementacion/frontend/

**Archivos (6):**
```bash
git mv apps/frontend/ERRORES-TYPESCRIPT-RESTANTES.md docs/90-transversal/reportes-implementacion/frontend/
git mv apps/frontend/IMPLEMENTATION-REPORT-LOGS-TAB-2025-11-24.md docs/90-transversal/reportes-implementacion/frontend/
git mv apps/frontend/MIGRATION-GUIDE-API-CONFIG.md docs/90-transversal/reportes-implementacion/frontend/
git mv apps/frontend/TYPESCRIPT-FIXES-ADMIN-PORTAL-2025-11-24.md docs/90-transversal/reportes-implementacion/frontend/
git mv apps/frontend/TYPESCRIPT-FIXES-AUTH-ADMIN-2025-11-24.md docs/90-transversal/reportes-implementacion/frontend/
git mv apps/frontend/test-achievements-tab.md docs/90-transversal/reportes-implementacion/frontend/
```

### Subtarea C.4: Mover archivos de raiz de docs/

```bash
# Archivo de feature
git mv docs/implementacion-autosave-ejercicios.md docs/90-transversal/features/

# Archivos de migracion Fase 5
git mv docs/README-FASE-5.md docs/00-vision-general/migracion/
git mv docs/_MAP-FASE-5.md docs/00-vision-general/migracion/

# Template de ejemplo
git mv docs/EJEMPLO-TRACEABILITY.yml docs/90-transversal/templates/
```

### Subtarea C.5: Crear README en nuevas carpetas

**Crear:**
- docs/90-transversal/reportes-implementacion/README.md
- docs/90-transversal/reportes-implementacion/backend/README.md
- docs/90-transversal/reportes-implementacion/frontend/README.md
- docs/90-transversal/features/README.md
- docs/00-vision-general/migracion/README.md

---

## FASE D: REORGANIZAR ESTRUCTURA DE docs/

### Prioridad: BAJA
### Ejecutar: DIRECTO (Architecture-Analyst)

### Subtarea D.1: Renombrar finiquito

```bash
git mv docs/finiquito/ docs/99-finiquito/
```

### Subtarea D.2: Eliminar o mover docs/database/

**Opcion A (Eliminar si vacio):**
```bash
rm -rf docs/database/
```

**Opcion B (Mover si tiene contenido util):**
```bash
git mv docs/database/ docs/90-transversal/database-legacy/
```

### Subtarea D.3: Resolver duplicado EXT-010

**Verificar contenido de ambas carpetas:**
```
docs/03-fase-extensiones/EXT-010-parent-notifications/
docs/03-fase-extensiones/EXT-010-parent-portal/
```

**Accion:** Consolidar en EXT-010-parent-portal/ o renumerar una como EXT-011

---

## FASE E: CONSOLIDAR TRAZAS

### Prioridad: MEDIA
### Ejecutar: DIRECTO (Architecture-Analyst)

### Subtarea E.1: Archivar tareas completadas de TRAZA-TAREAS-DATABASE

**Archivo actual:** 286 KB
**Objetivo:** Reducir a ~50 KB manteniendo solo tareas activas

**Proceso:**
1. Leer traza actual
2. Identificar tareas con status COMPLETADO
3. Mover a orchestration/.archive/trazas/TRAZA-DATABASE-HISTORICO-2025-11.md
4. Mantener solo tareas PENDIENTES y EN_PROGRESO

### Subtarea E.2: Archivar tareas completadas de TRAZA-TAREAS-FRONTEND

**Archivo actual:** 158 KB
**Objetivo:** Reducir a ~30 KB

### Subtarea E.3: Archivar tareas completadas de TRAZA-ANALISIS-ARQUITECTURA

**Archivo actual:** 117 KB
**Objetivo:** Reducir a ~30 KB

### Subtarea E.4: Crear indice de trazas archivadas

**Archivo:** orchestration/.archive/trazas/README.md
**Contenido:** Lista de trazas archivadas con fechas

---

## FASE F: UNIFICAR INVENTARIOS

### Prioridad: MEDIA
### Ejecutar: DIRECTO (Architecture-Analyst)

### Subtarea F.1: Definir ubicacion canonica

**Decision:** orchestration/inventarios/ es la ubicacion OFICIAL

### Subtarea F.2: Verificar sincronizacion

**Comparar:**
- orchestration/inventarios/DATABASE_INVENTORY.yml vs docs/90-transversal/inventarios/DATABASE_INVENTORY.yml
- orchestration/inventarios/BACKEND_INVENTORY.yml vs docs/90-transversal/inventarios/BACKEND_INVENTORY.yml
- orchestration/inventarios/FRONTEND_INVENTORY.yml vs docs/90-transversal/inventarios/FRONTEND_INVENTORY.yml

### Subtarea F.3: Eliminar duplicados en docs/

**Si orchestration/ es mas reciente:**
```bash
rm docs/90-transversal/inventarios/DATABASE_INVENTORY.yml
rm docs/90-transversal/inventarios/BACKEND_INVENTORY.yml
rm docs/90-transversal/inventarios/BACKEND_INVENTORY_CORRECTED.yml
rm docs/90-transversal/inventarios/FRONTEND_INVENTORY.yml
```

**Mantener en docs/:**
- TRACEABILITY_MATRIX.yml (unico)

### Subtarea F.4: Crear enlaces simbolicos o referencias

**En docs/90-transversal/inventarios/README.md:**
```markdown
# Inventarios

Los inventarios oficiales se encuentran en:
- orchestration/inventarios/DATABASE_INVENTORY.yml
- orchestration/inventarios/BACKEND_INVENTORY.yml
- orchestration/inventarios/FRONTEND_INVENTORY.yml

Solo TRACEABILITY_MATRIX.yml se mantiene en esta ubicacion.
```

---

## FASE G: ACTUALIZAR REFERENCIAS

### Prioridad: BAJA
### Ejecutar: VERIFICAR manualmente

### Subtarea G.1: Buscar referencias a archivos movidos

```bash
grep -r "IMPLEMENTATION-REPORT" apps/ --include="*.ts" --include="*.tsx" --include="*.md"
grep -r "BUG-FIX-" apps/ --include="*.ts" --include="*.tsx" --include="*.md"
grep -r "TYPESCRIPT-FIXES" apps/ --include="*.ts" --include="*.tsx" --include="*.md"
```

### Subtarea G.2: Actualizar README.md principal de docs/

**Agregar referencias a:**
- docs/90-transversal/reportes-implementacion/
- docs/99-finiquito/

---

## ORDEN DE EJECUCION

```
FASE A (10 min) ─┬─> FASE C (15 min) ─┬─> FASE D (10 min)
                 │                     │
FASE B (20 min) ─┘                     └─> FASE G (10 min)
                                           │
FASE E (15 min) ──────────────────────────┤
                                           │
FASE F (10 min) ──────────────────────────┘
```

**Secuencia:**
1. FASE A - Eliminar obsoletos (independiente)
2. FASE B - Archivar carpetas (paralelo con A)
3. FASE C - Mover docs (despues de A,B)
4. FASE D - Reorganizar docs (despues de C)
5. FASE E - Consolidar trazas (paralelo con D)
6. FASE F - Unificar inventarios (paralelo con D,E)
7. FASE G - Actualizar referencias (al final)

---

## AGENTES A ORQUESTAR

| Fase | Agente | Prompt a Usar |
|------|--------|---------------|
| A | Architecture-Analyst | Ejecucion directa |
| B | Workspace-Manager | PROMPT-WORKSPACE-MANAGER.md |
| C | Architecture-Analyst | Ejecucion directa |
| D | Architecture-Analyst | Ejecucion directa |
| E | Architecture-Analyst | Ejecucion directa |
| F | Architecture-Analyst | Ejecucion directa |
| G | Verificacion manual | - |

---

## CRITERIOS DE ACEPTACION

### FASE A
- [ ] No existe orchestration/.archive/prompts-obsoletos/
- [ ] No existe orchestration/agentes/antigravity/

### FASE B
- [ ] Existe orchestration/.archive/agentes-work-2025-11-23-25.tar.gz
- [ ] orchestration/agentes/ tiene <50 carpetas
- [ ] Tamano reducido de 10.8 MB a ~4 MB

### FASE C
- [ ] docs/90-transversal/reportes-implementacion/backend/ tiene 17 archivos
- [ ] docs/90-transversal/reportes-implementacion/frontend/ tiene 6 archivos
- [ ] apps/backend/ no tiene archivos IMPLEMENTATION-REPORT*.md
- [ ] apps/frontend/ no tiene archivos TYPESCRIPT-FIXES*.md

### FASE D
- [ ] Existe docs/99-finiquito/
- [ ] No existe docs/finiquito/
- [ ] No existe docs/database/ o esta consolidado

### FASE E
- [ ] TRAZA-TAREAS-DATABASE.md < 60 KB
- [ ] TRAZA-TAREAS-FRONTEND.md < 40 KB
- [ ] Existe orchestration/.archive/trazas/

### FASE F
- [ ] docs/90-transversal/inventarios/ no tiene duplicados de orchestration/
- [ ] README.md actualizado con referencias

### FASE G
- [ ] No hay referencias rotas a archivos movidos
- [ ] docs/README.md actualizado

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Links rotos | MEDIA | BAJO | Buscar y actualizar antes de commit |
| Perdida de datos | BAJA | ALTO | Crear backups antes de eliminar |
| Confusion de inventarios | MEDIA | MEDIO | Documentar ubicacion canonica |
| Errores en archivado | BAJA | MEDIO | Verificar tar.gz antes de eliminar |

---

## ESTIMACION TOTAL

- **Tiempo total estimado:** 90 minutos
- **Archivos a procesar:** ~130
- **Reduccion de espacio:** ~7 MB
- **Carpetas a archivar:** ~90

---

**FASE 2: PLANEACION - COMPLETADO**
**Siguiente:** FASE 3 - VALIDACION DE PLANEACION

---

**Generado:** 2025-11-29
**Agente:** Architecture-Analyst
**Version:** 1.0
