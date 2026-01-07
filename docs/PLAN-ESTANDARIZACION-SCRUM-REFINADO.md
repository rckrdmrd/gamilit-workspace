# PLAN DE ESTANDARIZACIÓN SCRUM - REFINADO

**Fecha:** 2026-01-04
**Versión:** 2.0 (Refinado)
**Estado:** ✅ LISTO PARA EJECUCIÓN
**Plan Original:** `PLAN-ESTANDARIZACION-SCRUM.md`
**Validación:** `VALIDACION-PLAN-ESTANDARIZACION.md`

---

## 1. RESUMEN DE CAMBIOS vs PLAN ORIGINAL

| Aspecto | Plan Original | Plan Refinado |
|---------|--------------|---------------|
| Ejecución | Secuencial | Paralela donde posible |
| Backup | Implícito | Explícito como FASE 0 |
| Scripts | Mencionados | Detallados con comandos |
| _MAP.md | No mencionado | Regeneración explícita |
| CI/CD | No incluido | Validación YAML incluida |
| Estimación | 69 horas | 62 horas (optimizado) |

---

## 2. PLAN DE EJECUCIÓN REFINADO

### FASE 0: PREPARACIÓN Y BACKUP (Obligatoria)

**Duración:** 1 hora
**Prioridad:** CRÍTICA

#### 0.1 Crear Backup Completo
```bash
# Desde /home/isem/workspace-v1/projects/gamilit
cd /home/isem/workspace-v1/projects/gamilit
git checkout develop
git pull
git checkout -b feature/estandarizacion-scrum-$(date +%Y%m%d)
cp -r docs docs_backup_$(date +%Y%m%d)
```

#### 0.2 Crear Tag de Referencia
```bash
git tag -a pre-estandarizacion-v1.0 -m "Backup antes de estandarización SCRUM"
git push origin pre-estandarizacion-v1.0
```

#### 0.3 Verificar Estado Inicial
```bash
# Contar archivos por tipo
find docs -name "US-*.md" | wc -l  # Debe ser 113
find docs -name "RF-*.md" | wc -l  # Debe ser 18
find docs -name "ET-*.md" | wc -l  # Debe ser 22
find docs -name "_MAP.md" | wc -l  # Debe ser 83
```

**Criterio de Éxito:** Backup creado, tag publicado, conteos verificados

---

### FASE A: INFRAESTRUCTURA DOCUMENTAL (Paralela)

**Duración Total:** 4 horas
**Prioridad:** Alta

Las siguientes tareas pueden ejecutarse EN PARALELO:

#### A.1 Crear AGENTS.md (2h)

**Archivo:** `/home/isem/workspace-v1/projects/gamilit/AGENTS.md`

```markdown
# Guía para Agentes de IA - GAMILIT

## 1. Estructura del Proyecto

### Ubicaciones Clave
- **Documentación:** `/docs/`
- **Planificación:** `/docs/planning/`
- **Épicas:** `/docs/[FASE]/[EPIC-ID]/`
- **Historias de Usuario:** `/docs/[FASE]/[EPIC-ID]/historias-usuario/`
- **Tareas:** `/docs/planning/tasks/`
- **Bugs:** `/docs/planning/bugs/`
- **Tablero Kanban:** `/docs/planning/Board.md`
- **Orquestación:** `/orchestration/`

### Prefijos de Nomenclatura
| Prefijo | Tipo | Ejemplo |
|---------|------|---------|
| EAI- | Épica Alcance Inicial | EAI-001-fundamentos |
| EXT- | Épica Extensión | EXT-002-admin-extendido |
| EMR- | Épica Migración | EMR-001-migracion-bd |
| US- | Historia de Usuario | US-FUND-001 |
| TASK- | Tarea | TASK-001 |
| BUG- | Bug | BUG-001 |
| RF- | Requerimiento Funcional | RF-AUTH-001 |
| ET- | Especificación Técnica | ET-AUTH-001 |
| ADR- | Decision Record | ADR-0001 |

---

## 2. Cómo Trabajar con Tareas

### Tomar una Tarea
1. Identificar tarea en `/docs/planning/Board.md` (columna "Por Hacer")
2. Leer archivo `TASK-XXX.md` correspondiente
3. Editar YAML front-matter:
   ```yaml
   status: "In Progress"
   assignee: "@NombreAgente"
   started_date: "YYYY-MM-DD"
   ```
4. Mover tarea a columna "En Progreso" en Board.md
5. Commit: `git commit -m "Start TASK-XXX: [descripción breve]"`

### Completar una Tarea
1. Verificar TODOS los criterios de aceptación cumplidos
2. Editar YAML front-matter:
   ```yaml
   status: "Done"
   completed_date: "YYYY-MM-DD"
   actual_hours: X
   ```
3. Agregar sección "## Notas de Implementación" con detalles
4. Mover tarea a columna "Hecho" en Board.md
5. Commit: `git commit -m "Fixes TASK-XXX: [descripción breve]"`

### Reportar Bloqueo
1. Cambiar status a "Blocked"
2. Agregar sección "## Bloqueo" con:
   - Descripción del bloqueo
   - Dependencias faltantes
   - Acción requerida
3. Notificar en Board.md (columna especial si existe)

---

## 3. Cómo Trabajar con Bugs

### Reportar un Bug
1. Crear archivo `/docs/planning/bugs/BUG-XXX-descripcion.md`
2. Usar plantilla YAML:
   ```yaml
   ---
   id: "BUG-XXX"
   title: "Descripción del bug"
   type: "Bug"
   status: "Open"
   severity: "P0|P1|P2|P3"
   priority: "Crítica|Alta|Media|Baja"
   assignee: ""
   affected_module: "Backend|Frontend|Database"
   created_date: "YYYY-MM-DD"
   ---
   ```
3. Incluir secciones: Descripción, Pasos para Reproducir, Esperado vs Actual
4. Agregar a TRAZA-BUGS.md
5. Commit: `git commit -m "Report BUG-XXX: [descripción]"`

### Resolver un Bug
1. Editar YAML: `status: "Done"`, agregar `resolved_date`
2. Documentar solución en sección "## Solución Implementada"
3. Referencia commit de fix: `fix_commit: "abc123"`
4. Commit: `git commit -m "Fix BUG-XXX: [descripción]"`

---

## 4. Formato YAML Front-Matter

### Historia de Usuario (US)
```yaml
---
id: "US-FUND-001"
title: "Autenticación básica con JWT"
type: "User Story"
status: "Done|In Progress|To Do|Backlog"
priority: "Alta|Media|Baja"
assignee: "@agente"
epic: "EAI-001"
story_points: 8
sprint: "Sprint-1"
labels: ["auth", "jwt"]
created_date: "YYYY-MM-DD"
updated_date: "YYYY-MM-DD"
---
```

### Tarea (TASK)
```yaml
---
id: "TASK-001"
title: "Implementar endpoint"
type: "Task"
status: "Done|In Progress|To Do|Blocked"
priority: "P0|P1|P2|P3"
assignee: "@agente"
parent_us: "US-FUND-001"
epic: "EAI-001"
estimated_hours: 4
actual_hours: 4.5
created_date: "YYYY-MM-DD"
completed_date: "YYYY-MM-DD"
---
```

---

## 5. Convenciones de Commit

```
<tipo>(<scope>): <descripción>

Tipos:
- feat: Nueva funcionalidad
- fix: Corrección de bug
- docs: Documentación
- refactor: Refactoring
- test: Tests
- chore: Mantenimiento

Ejemplos:
- feat(auth): Implement JWT authentication
- fix(BUG-001): Resolve login redirect issue
- docs(US-FUND-001): Add acceptance criteria
- Start TASK-XXX: Begin implementation
- Fixes TASK-XXX: Complete implementation
```

---

## 6. Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `/docs/planning/Board.md` | Tablero Kanban actual |
| `/docs/planning/config.yml` | Configuración del proyecto |
| `/docs/planning/BACKLOG.md` | Backlog priorizado |
| `/orchestration/trazas/TRAZA-BUGS.md` | Registro de bugs |
| `/orchestration/trazas/TRAZA-TAREAS-*.md` | Trazas de tareas |
| `/docs/90-transversal/sprints/SPRINTS-DETALLADOS.md` | Planificación de sprints |

---

## 7. Validaciones Antes de Commit

- [ ] YAML front-matter válido (sin errores de sintaxis)
- [ ] Status actualizado correctamente
- [ ] Board.md actualizado si cambió estado
- [ ] Referencias cruzadas verificadas
- [ ] Criterios de aceptación actualizados

---

**Última actualización:** YYYY-MM-DD
**Versión:** 1.0
```

---

#### A.2 Crear Board.md (1h)

**Archivo:** `/home/isem/workspace-v1/projects/gamilit/docs/planning/Board.md`

```bash
mkdir -p /home/isem/workspace-v1/projects/gamilit/docs/planning
```

(Contenido detallado en plan original - incluir tablero vacío inicial)

---

#### A.3 Crear config.yml (1h)

**Archivo:** `/home/isem/workspace-v1/projects/gamilit/docs/planning/config.yml`

(Contenido detallado en plan original)

---

### FASE B: ESTANDARIZACIÓN DE FORMATO (Secuencial Parcial)

**Duración Total:** 28 horas
**Prioridad:** Alta

#### B.0 Script de Migración YAML (4h) - NUEVO

**Archivo:** `/home/isem/workspace-v1/projects/gamilit/scripts/migrate-to-yaml-frontmatter.sh`

```bash
#!/bin/bash
# Script para migrar archivos MD a formato YAML front-matter
# USO: ./migrate-to-yaml-frontmatter.sh [tipo] [carpeta]
# Ejemplo: ./migrate-to-yaml-frontmatter.sh US docs/01-fase-alcance-inicial

TYPE=$1
DIR=$2

if [ -z "$TYPE" ] || [ -z "$DIR" ]; then
  echo "Uso: $0 [US|RF|ET|TASK|BUG] [carpeta]"
  exit 1
fi

# Función para extraer metadatos existentes
extract_metadata() {
  local file=$1
  # Extraer campos como **Campo:** Valor
  local epic=$(grep -oP '\*\*Épica:\*\* \K[^\n]+' "$file" | head -1)
  local status=$(grep -oP '\*\*Estado:\*\* \K[^\n]+' "$file" | head -1)
  local sp=$(grep -oP '\*\*Story Points:\*\* \K[0-9]+' "$file" | head -1)
  local priority=$(grep -oP '\*\*Prioridad:\*\* \K[^\n]+' "$file" | head -1)
  local sprint=$(grep -oP '\*\*Sprint:\*\* \K[^\n]+' "$file" | head -1)

  echo "epic=$epic"
  echo "status=$status"
  echo "story_points=$sp"
  echo "priority=$priority"
  echo "sprint=$sprint"
}

# Procesar archivos
find "$DIR" -name "${TYPE}-*.md" -type f | while read file; do
  echo "Procesando: $file"
  # Lógica de migración aquí
  # 1. Extraer metadatos
  # 2. Generar YAML front-matter
  # 3. Insertar al inicio del archivo
  # 4. Eliminar metadatos duplicados del cuerpo
done

echo "Migración completada para tipo $TYPE en $DIR"
```

---

#### B.1 Migrar User Stories (8h)

**Archivos:** 113 US-*.md

**Secuencia:**
1. Ejecutar script de migración para US
2. Validar YAML sintácticamente
3. Verificar que contenido no se perdió
4. Commit por épica (no masivo)

```bash
# Por cada épica
./scripts/migrate-to-yaml-frontmatter.sh US docs/01-fase-alcance-inicial/EAI-001-fundamentos
git add docs/01-fase-alcance-inicial/EAI-001-fundamentos/historias-usuario/
git commit -m "docs(US): Migrate EAI-001 user stories to YAML front-matter"

# Repetir para cada épica...
```

---

#### B.2 Migrar Tareas (12h)

**Proceso:**
1. Extraer tareas embebidas de US a archivos separados
2. Crear carpeta `/docs/planning/tasks/`
3. Generar archivos TASK-*.md con YAML
4. Actualizar referencias en US originales

---

#### B.3 Migrar Bugs (4h)

**Proceso:**
1. Leer TRAZA-BUGS.md
2. Crear archivos individuales BUG-*.md
3. Mantener TRAZA-BUGS.md como índice

---

### FASE C: RESOLUCIÓN DE CONFLICTOS (Paralela con B)

**Duración Total:** 15 horas
**Prioridad:** Media

Puede ejecutarse EN PARALELO con FASE B después de B.0

#### C.1 Resolver Duplicado US-GAM-002 (2h)

**Acción:**
```bash
# Renombrar archivo duplicado
cd /home/isem/workspace-v1/projects/gamilit/docs
git mv 03-fase-extensiones/EAI-003-EXT-gamificacion-social/historias-usuario/US-GAM-002-sistema-amigos.md \
       03-fase-extensiones/EAI-003-EXT-gamificacion-social/historias-usuario/US-GAM-010-sistema-amigos.md

# Actualizar referencias (11 archivos)
sed -i 's/US-GAM-002-sistema-amigos/US-GAM-010-sistema-amigos/g' \
  PLAN-ESTANDARIZACION-SCRUM.md \
  03-fase-extensiones/EAI-003-EXT-gamificacion-social/EPICA-EAI-003-EXT.md \
  # ... demás archivos

git commit -m "fix(docs): Rename duplicate US-GAM-002 to US-GAM-010"
```

---

#### C.2 Documentar Saltos ADR (1h)

**Acción:**
Crear archivo explicativo o ADRs placeholder

---

#### C.3 Categorizar Archivos Huérfanos (12h)

**Estrategia por lotes:**
1. Guías de desarrollo → prefijo GUIDE-
2. Reportes → prefijo REPORT-
3. Análisis → prefijo ANALYSIS-
4. Documentación general → sin prefijo (OK)

---

### FASE D: REGENERACIÓN Y MEJORAS (Final)

**Duración Total:** 14 horas
**Prioridad:** Baja (después de B y C)

#### D.1 Regenerar _MAP.md (6h) - NUEVO

**Script:** `/home/isem/workspace-v1/projects/gamilit/scripts/regenerate-maps.sh`

```bash
#!/bin/bash
# Regenerar archivos _MAP.md basado en contenido actual

find docs -type d -name "EAI-*" -o -name "EXT-*" -o -name "EMR-*" | while read epic_dir; do
  echo "Regenerando _MAP.md para: $epic_dir"

  # Contar elementos
  us_count=$(find "$epic_dir/historias-usuario" -name "US-*.md" 2>/dev/null | wc -l)
  rf_count=$(find "$epic_dir/requerimientos" -name "RF-*.md" 2>/dev/null | wc -l)
  et_count=$(find "$epic_dir/especificaciones" -name "ET-*.md" 2>/dev/null | wc -l)

  # Generar _MAP.md actualizado
  # ... lógica de generación
done
```

---

#### D.2 Agregar Labels (4h)

Actualizar YAML de archivos migrados con campo `labels`

---

#### D.3 Agregar Assignee (4h)

Actualizar YAML de tareas activas con campo `assignee`

---

### FASE E: VALIDACIÓN CI (Nueva)

**Duración:** 2 horas
**Prioridad:** Media

#### E.1 Crear Validador YAML

**Archivo:** `/home/isem/workspace-v1/projects/gamilit/scripts/validate-yaml-frontmatter.sh`

```bash
#!/bin/bash
# Validar que archivos tengan YAML front-matter válido

errors=0

find docs -name "US-*.md" -o -name "RF-*.md" -o -name "ET-*.md" -o -name "TASK-*.md" -o -name "BUG-*.md" | while read file; do
  # Verificar que empiece con ---
  if ! head -1 "$file" | grep -q "^---$"; then
    echo "ERROR: $file - Missing YAML front-matter"
    ((errors++))
  fi

  # Verificar campos requeridos
  if ! grep -q "^id:" "$file"; then
    echo "WARNING: $file - Missing 'id' field"
  fi

  if ! grep -q "^status:" "$file"; then
    echo "WARNING: $file - Missing 'status' field"
  fi
done

if [ $errors -gt 0 ]; then
  echo "Validación fallida con $errors errores"
  exit 1
fi

echo "Validación exitosa"
```

---

## 3. CRONOGRAMA OPTIMIZADO

```
Día 1 (8h):
├── FASE 0: Backup (1h)
├── FASE A: Infraestructura - PARALELO (4h)
│   ├── A.1: AGENTS.md (2h)
│   ├── A.2: Board.md (1h)
│   └── A.3: config.yml (1h)
└── FASE B.0: Script migración (3h)

Día 2-4 (24h):
├── FASE B.1: Migrar US (8h)
├── FASE C.1: Duplicado US-GAM-002 (2h) - PARALELO
├── FASE C.2: ADRs (1h) - PARALELO
└── FASE B.2: Migrar TASK (12h - puede extenderse)

Día 5-6 (16h):
├── FASE B.3: Migrar BUG (4h)
├── FASE C.3: Categorizar huérfanos (12h)
└── FASE D.1: Regenerar _MAP.md (inicio)

Día 7-8 (14h):
├── FASE D.1: Regenerar _MAP.md (fin) (6h)
├── FASE D.2: Labels (4h)
├── FASE D.3: Assignee (4h)
└── FASE E: Validación CI (2h)
```

**Total Optimizado:** 62 horas (vs 69h original)

---

## 4. CHECKLIST DE EJECUCIÓN

### Pre-ejecución
- [ ] Backup creado (FASE 0.1)
- [ ] Tag publicado (FASE 0.2)
- [ ] Conteos verificados (FASE 0.3)
- [ ] Branch feature creado

### Ejecución FASE A
- [ ] AGENTS.md creado y revisado
- [ ] Board.md creado con estructura
- [ ] config.yml creado con valores
- [ ] Carpeta planning/ creada

### Ejecución FASE B
- [ ] Script de migración probado
- [ ] US migradas por épica
- [ ] TASK extraídas a archivos
- [ ] BUG migrados a archivos

### Ejecución FASE C
- [ ] US-GAM-002 renombrado
- [ ] 11 referencias actualizadas
- [ ] ADRs documentados
- [ ] Archivos huérfanos categorizados

### Ejecución FASE D
- [ ] _MAP.md regenerados
- [ ] Labels agregados
- [ ] Assignee agregados
- [ ] Validador CI funcionando

### Post-ejecución
- [ ] Todos los conteos coinciden
- [ ] Sin errores de YAML
- [ ] Board.md actualizado
- [ ] PR creado para revisión

---

## 5. SCRIPTS REQUERIDOS

| Script | Propósito | Ubicación |
|--------|-----------|-----------|
| migrate-to-yaml-frontmatter.sh | Migrar MD a YAML | /scripts/ |
| regenerate-maps.sh | Regenerar _MAP.md | /scripts/ |
| validate-yaml-frontmatter.sh | Validar YAML | /scripts/ |
| update-references.sh | Actualizar referencias | /scripts/ |

---

## 6. ROLLBACK PLAN

Si algo sale mal:

```bash
# Volver al estado anterior
git checkout pre-estandarizacion-v1.0

# O restaurar backup
rm -rf docs
mv docs_backup_YYYYMMDD docs

# O revertir commits específicos
git revert HEAD~N..HEAD
```

---

**Plan Refinado por:** Claude Code
**Fecha:** 2026-01-04
**Versión:** 2.0
**Estado:** ✅ LISTO PARA EJECUCIÓN
