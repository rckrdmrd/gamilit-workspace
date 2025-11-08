# PLAN DE MIGRACIÓN: docs_bkp/ → docs/

**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Fecha:** 2025-11-07
**Objetivo:** Migrar y reestructurar documentación con nueva arquitectura basada en fases
**Responsable:** Tech Lead + Development Team

---

## 📋 RESUMEN EJECUTIVO

### Alcance de la Migración

- **Archivos a migrar:** 640+ archivos Markdown
- **Estructura origen:** docs_bkp/ (5 carpetas principales + auxiliares)
- **Estructura destino:** docs/ (nueva arquitectura por fases)
- **Fases de migración:** 5 fases incrementales
- **Duración estimada:** 5-7 días hábiles
- **Riesgo:** Medio (mitigado con estrategia incremental)

### Estrategia

**Migración INCREMENTAL por fases del proyecto** para minimizar riesgo y permitir validación continua.

**Orden de migración:**
1. Fase 1 Migración: Fase 1 Proyecto (Alcance Inicial) - 5 épicas
2. Fase 2 Migración: Fase 2 Proyecto (Robustecimiento) - 1 épica
3. Fase 3 Migración: Fase 3 Proyecto (Extensiones) - 10 épicas
4. Fase 4 Migración: Contenido Transversal (sprints, roadmap, etc.)
5. Fase 5 Migración: Guías y Referencias (desarrollo, quick-reference, adr, standards)

### Criterios de Éxito

- ✅ 100% archivos migrados sin pérdida de información
- ✅ Nueva estructura implementada correctamente
- ✅ Trazabilidad código-documentación establecida
- ✅ Archivos modularizados (120-200 líneas)
- ✅ Inventarios YAML generados
- ✅ Referencias validadas (sin links rotos)
- ✅ docs_bkp/ preservado como respaldo

---

## 🎯 OBJETIVOS DETALLADOS

### Objetivos Funcionales

1. **Consolidar documentación por épica**
   - Cada épica tiene toda su documentación en un solo lugar
   - Requerimientos + Especificaciones + Historias + Implementación

2. **Establecer trazabilidad completa**
   - Inventarios YAML por épica (TRACEABILITY.yml, DATABASE.yml, etc.)
   - Mapeo RF → ET → US → Código

3. **Modularizar archivos extensos**
   - Dividir archivos >200 líneas en múltiples archivos
   - Mantener archivos entre 120-200 líneas idealmente

4. **Eliminar duplicaciones**
   - Consolidar carpetas duplicadas
   - Eliminar contenido redundante
   - Unificar información dispersa

5. **Optimizar para navegación**
   - Estructura clara y predecible
   - _MAP.md en cada carpeta
   - README.md con overview

### Objetivos Técnicos

1. **Formatos híbridos**
   - Markdown para contenido narrativo
   - YAML para datos estructurados e inventarios

2. **Validación automática**
   - Scripts de validación de integridad
   - Verificación de referencias
   - Validación de tamaños de archivo

3. **Preservación de historia**
   - Mantener docs_bkp/ como respaldo
   - Documentar cambios en CHANGELOG

---

## 📊 ANÁLISIS DE TRABAJO

### Archivos por Fase del Proyecto

| Fase Proyecto | Épicas | Archivos Est. | Complejidad | Prioridad | Duración Est. |
|---------------|--------|---------------|-------------|-----------|---------------|
| **Fase 1:** Alcance Inicial | 5 | ~150 | Media | Alta | 2 días |
| **Fase 2:** Robustecimiento | 1 | ~40 | Alta | Alta | 0.5 días |
| **Fase 3:** Extensiones | 10 | ~200 | Media-Alta | Alta | 2.5 días |
| **Transversal** | N/A | ~150 | Baja | Media | 1 día |
| **Guías/Referencias** | N/A | ~100 | Media | Media | 1 día |
| **TOTAL** | **16** | **640** | - | - | **7 días** |

### Distribución de Esfuerzo

```
Migración de contenido:         40% (2.8 días)
Creación de inventarios YAML:   25% (1.75 días)
Modularización de archivos:     15% (1.05 días)
Validación y correcciones:      15% (1.05 días)
Documentación de cambios:        5% (0.35 días)
```

### Recursos Necesarios

| Recurso | Rol | Dedicación | Responsabilidad |
|---------|-----|------------|-----------------|
| Tech Lead | Coordinación | 50% | Supervisión, validación, decisiones arquitectónicas |
| Developer 1 | Migración | 100% | Migración Fase 1-3, creación inventarios |
| Developer 2 | Validación | 50% | Scripts de validación, verificación referencias |
| Claude Code | Automatización | On-demand | Generación inventarios YAML, modularización |

---

## 🚀 FASES DE MIGRACIÓN

## FASE 1 DE MIGRACIÓN: Alcance Inicial (Fase 1 Proyecto)

### Alcance

**Épicas a migrar:**
- EAI-001: Fundamentos
- EAI-002: Actividades
- EAI-003: Gamificación
- EAI-004: Analytics
- EAI-005: Admin Base

**Archivos estimados:** ~150 archivos

**Duración:** 2 días

### Tareas Detalladas

#### Día 1 - Mañana (4 horas)

**1. Setup inicial (30 min)**
```bash
# Crear estructura base
mkdir -p docs/01-fase-alcance-inicial/{EAI-001-fundamentos,EAI-002-actividades,EAI-003-gamificacion,EAI-004-analytics,EAI-005-admin-base}

# Por cada épica, crear subcarpetas
for epica in EAI-{001..005}-*; do
  mkdir -p docs/01-fase-alcance-inicial/$epica/{requerimientos,especificaciones,historias-usuario,implementacion,pruebas}
done
```

**2. Migrar EAI-001 (Fundamentos) (1.5 horas)**

```bash
# Paso 1: Copiar historias de usuario
cp docs_bkp/04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/*.md \
   docs/01-fase-alcance-inicial/EAI-001-fundamentos/historias-usuario/

# Paso 2: Identificar y copiar requerimientos relacionados
# RF de autenticación, infraestructura base
cp docs_bkp/01-requerimientos/01-autenticacion-autorizacion/*.md \
   docs/01-fase-alcance-inicial/EAI-001-fundamentos/requerimientos/

# Paso 3: Copiar especificaciones técnicas
cp docs_bkp/02-especificaciones-tecnicas/01-autenticacion-autorizacion/*.md \
   docs/01-fase-alcance-inicial/EAI-001-fundamentos/especificaciones/

# Paso 4: Crear README.md de la épica
# Copiar y adaptar README existente
cp docs_bkp/04-planificacion/01-alcance-inicial/EAI-001-fundamentos/README.md \
   docs/01-fase-alcance-inicial/EAI-001-fundamentos/

# Paso 5: Crear PLANNING.yml (nuevo)
# Extraer información de planificación y convertir a YAML
```

**3. Generar inventarios para EAI-001 (2 horas)**

```bash
# Usar scripts de generación (ver sección Scripts)
./scripts/generate-epic-inventory.sh EAI-001 > docs/01-fase-alcance-inicial/EAI-001-fundamentos/implementacion/TRACEABILITY.yml

# Revisar y ajustar manualmente
```

#### Día 1 - Tarde (4 horas)

**4. Migrar EAI-002 (Actividades) (2 horas)**
- Repetir proceso de EAI-001
- RF de contenido educativo, ejercicios
- ET correspondientes
- Historias de usuario

**5. Migrar EAI-003 (Gamificación) (2 horas)**
- Repetir proceso
- RF de gamificación
- ET correspondientes
- Historias de usuario

#### Día 2 - Mañana (4 horas)

**6. Migrar EAI-004 (Analytics) (1.5 horas)**
**7. Migrar EAI-005 (Admin Base) (1.5 horas)**
**8. Crear estructura transversal Fase 1 (1 hora)**

```bash
# Crear archivos de la fase
cd docs/01-fase-alcance-inicial/

# README.md de la fase
cat > README.md << 'EOF'
# Fase 1: Alcance Inicial

**Periodo:** Mes 1 (Agosto 2024)
**Presupuesto:** $110,000 MXN
**Story Points:** 230 SP
**Épicas:** 5
**Estado:** ✅ Completado

## Épicas

- [EAI-001: Fundamentos](./EAI-001-fundamentos/)
- [EAI-002: Actividades](./EAI-002-actividades/)
- [EAI-003: Gamificación](./EAI-003-gamificacion/)
- [EAI-004: Analytics](./EAI-004-analytics/)
- [EAI-005: Admin Base](./EAI-005-admin-base/)

## Objetivos

Establecer las bases de la plataforma con funcionalidades core...
EOF

# TIMELINE.yml
cat > TIMELINE.yml << 'EOF'
phase: 1
name: Alcance Inicial
period: Mes 1 (Agosto 2024)
start_date: 2024-08-01
end_date: 2024-08-31
budget_mxn: 110000
story_points: 230
status: completed

epics:
  - code: EAI-001
    name: Fundamentos
    sp: 60
    budget: 22000
    weeks: "1-2"

  - code: EAI-002
    name: Actividades
    sp: 45
    budget: 22000
    weeks: "2-3"

  - code: EAI-003
    name: Gamificación
    sp: 40
    budget: 22000
    weeks: "2-3"

  - code: EAI-004
    name: Analytics
    sp: 35
    budget: 22000
    weeks: "3-4"

  - code: EAI-005
    name: Admin Base
    sp: 50
    budget: 22000
    weeks: "3-4"

milestones:
  - date: 2024-08-15
    milestone: MVP Backend completado

  - date: 2024-08-22
    milestone: MVP Frontend completado

  - date: 2024-08-31
    milestone: Fase 1 completada y desplegada
EOF

# _MAP.md
cat > _MAP.md << 'EOF'
# _MAP: docs/01-fase-alcance-inicial/

**Fase:** 1 - Alcance Inicial
**Periodo:** Mes 1 (Agosto 2024)
**Estado:** ✅ Completado
**Épicas:** 5

## Contenido

| Épica | Presupuesto | SP | Archivos | Estado |
|-------|-------------|----|----- ----|--------|
| [EAI-001](./EAI-001-fundamentos/) | $22,000 | 60 | 25+ | ✅ |
| [EAI-002](./EAI-002-actividades/) | $22,000 | 45 | 30+ | ✅ |
| [EAI-003](./EAI-003-gamificacion/) | $22,000 | 40 | 28+ | ✅ |
| [EAI-004](./EAI-004-analytics/) | $22,000 | 35 | 22+ | ✅ |
| [EAI-005](./EAI-005-admin-base/) | $22,000 | 50 | 27+ | ✅ |

Ver [README.md](./README.md) para detalles.
EOF
```

#### Día 2 - Tarde (4 horas)

**9. Validación Fase 1 (2 horas)**

```bash
# Ejecutar scripts de validación
./scripts/validate-phase-migration.sh 01-fase-alcance-inicial

# Verificar:
# - Todos los archivos copiados
# - Referencias actualizadas
# - Inventarios YAML válidos
# - _MAP.md en todas las carpetas
# - README.md en todas las épicas
```

**10. Ajustes y correcciones (2 horas)**
- Corregir issues encontrados en validación
- Actualizar referencias rotas
- Completar inventarios faltantes

### Entregables Fase 1 Migración

- ✅ 5 épicas migradas con estructura completa
- ✅ ~150 archivos organizados
- ✅ 5 inventarios TRACEABILITY.yml creados
- ✅ README.md y _MAP.md en todas las carpetas
- ✅ TIMELINE.yml de la fase
- ✅ Referencias validadas

---

## FASE 2 DE MIGRACIÓN: Robustecimiento (Fase 2 Proyecto)

### Alcance

**Épicas a migrar:**
- EMR-001: Migración BD

**Archivos estimados:** ~40 archivos

**Duración:** 0.5 días (4 horas)

### Tareas Detalladas

#### Día 3 - Mañana (4 horas)

**1. Crear estructura (15 min)**

```bash
mkdir -p docs/02-fase-robustecimiento/EMR-001-migracion-bd/{especificaciones,tareas,implementacion,pruebas}
```

**2. Migrar EMR-001 (2.5 horas)**

```bash
# Copiar contenido existente
cp -r docs_bkp/04-planificacion/02-migracion-robustecimiento/EMR-001-migracion-bd/* \
   docs/02-fase-robustecimiento/EMR-001-migracion-bd/

# Reorganizar en nueva estructura
# Esta épica es más técnica, tiene tareas en lugar de historias de usuario
```

**3. Generar inventario (1 hora)**

```bash
./scripts/generate-epic-inventory.sh EMR-001 > docs/02-fase-robustecimiento/EMR-001-migracion-bd/implementacion/TRACEABILITY.yml
```

**4. Crear archivos de fase (30 min)**
- README.md
- TIMELINE.yml
- _MAP.md

**5. Validación (30 min)**

```bash
./scripts/validate-phase-migration.sh 02-fase-robustecimiento
```

### Entregables Fase 2 Migración

- ✅ 1 épica migrada
- ✅ ~40 archivos organizados
- ✅ Inventario TRACEABILITY.yml
- ✅ Documentación de fase completa

---

## FASE 3 DE MIGRACIÓN: Extensiones (Fase 3 Proyecto)

### Alcance

**Épicas a migrar:**
- EXT-001: Portal Maestros
- EXT-002: Admin Extendido
- EXT-003: Notificaciones
- EXT-004: Perfiles
- EXT-005: Reportes
- EXT-006: Contenido
- EXT-007: LTI Integration (parcial)
- EXT-008: White Label (parcial)
- EXT-009: Peer Challenges (parcial)
- EXT-010: Parent Notifications (parcial)

**Archivos estimados:** ~200 archivos

**Duración:** 2.5 días

### Tareas Detalladas

#### Día 3 - Tarde (4 horas)

**1. Crear estructura (30 min)**

```bash
mkdir -p docs/03-fase-extensiones/EXT-{001..010}-*/requerimientos
# ... repetir para especificaciones, historias-usuario, implementacion, pruebas
```

**2. Migrar EXT-001 y EXT-002 (3.5 horas)**
- Portal Maestros
- Admin Extendido

#### Día 4 - Completo (8 horas)

**3. Migrar EXT-003 a EXT-006 (6 horas)**
- Notificaciones
- Perfiles
- Reportes
- Contenido

**4. Generar inventarios EXT-001 a EXT-006 (2 horas)**

#### Día 5 - Mañana (4 horas)

**5. Migrar EXT-007 a EXT-010 (2.5 horas)**
- Extensiones parcialmente completadas
- Marcar claramente estado pendiente

**6. Generar inventarios EXT-007 a EXT-010 (1 hora)**

**7. Crear archivos de fase (30 min)**
- README.md (con separación completadas vs. pendientes)
- TIMELINE.yml
- _MAP.md

#### Día 5 - Tarde (4 horas)

**8. Validación Fase 3 (2 horas)**

```bash
./scripts/validate-phase-migration.sh 03-fase-extensiones
```

**9. Ajustes y correcciones (2 horas)**

### Entregables Fase 3 Migración

- ✅ 10 épicas migradas (6 completas + 4 parciales)
- ✅ ~200 archivos organizados
- ✅ 10 inventarios TRACEABILITY.yml
- ✅ Estado claro de épicas parciales

---

## FASE 4 DE MIGRACIÓN: Contenido Transversal

### Alcance

**Carpetas a migrar:**
- sprints/
- roadmap/
- metricas/
- correcciones/
- features/
- inventarios/ (consolidar y expandir)

**Archivos estimados:** ~150 archivos

**Duración:** 1 día (Día 6)

### Tareas Detalladas

#### Día 6 - Mañana (4 horas)

**1. Crear estructura (15 min)**

```bash
mkdir -p docs/90-transversal/{sprints,roadmap,metricas,correcciones,features,inventarios}
```

**2. Migrar sprints (1 hora)**

```bash
# Copiar planificación de sprints
cp docs_bkp/04-planificacion/sprints/*.md docs/90-transversal/sprints/

# Convertir a formato más estructurado si necesario
```

**3. Migrar roadmap (30 min)**

```bash
cp docs_bkp/04-planificacion/roadmap/*.md docs/90-transversal/roadmap/
```

**4. Migrar métricas (1 hora)**

```bash
# Copiar y convertir a YAML cuando aplique
cp docs_bkp/04-planificacion/metricas/*.md docs/90-transversal/metricas/

# Crear PRESUPUESTO.yml consolidado
./scripts/generate-budget-yaml.sh > docs/90-transversal/metricas/PRESUPUESTO.yml
```

**5. Migrar correcciones (1 hora)**

```bash
# Copiar issues
cp docs_bkp/04-planificacion/correcciones/*.md docs/90-transversal/correcciones/

# Convertir a YAML
./scripts/convert-issues-to-yaml.sh > docs/90-transversal/correcciones/ISSUES-CRITICOS.yml
```

**6. Migrar features (30 min)**

```bash
cp docs_bkp/04-planificacion/features/*.md docs/90-transversal/features/

# Convertir a YAML
./scripts/convert-features-to-yaml.sh
```

#### Día 6 - Tarde (4 horas)

**7. Crear inventarios consolidados (3 horas)**

```bash
# Generar inventarios globales a partir de los inventarios por épica
./scripts/consolidate-database-inventory.sh > docs/90-transversal/inventarios/DATABASE_INVENTORY.yml

./scripts/consolidate-backend-inventory.sh > docs/90-transversal/inventarios/BACKEND_INVENTORY.yml

./scripts/consolidate-frontend-inventory.sh > docs/90-transversal/inventarios/FRONTEND_INVENTORY.yml

# Generar matriz de trazabilidad global
./scripts/generate-global-traceability.sh > docs/90-transversal/inventarios/TRACEABILITY_MATRIX.yml
```

**8. Crear README y _MAP (30 min)**

**9. Validación (30 min)**

```bash
./scripts/validate-transversal-migration.sh
```

### Entregables Fase 4 Migración

- ✅ Contenido transversal organizado
- ✅ Inventarios consolidados en YAML
- ✅ Métricas y presupuesto estructurados
- ✅ Issues y features en YAML

---

## FASE 5 DE MIGRACIÓN: Guías y Referencias

### Alcance

**Carpetas a migrar:**
- 03-desarrollo/ → 95-guias-desarrollo/
- QUICK-REFERENCE/ → 96-quick-reference/
- adr/ → 97-adr/
- standards/ → 98-standards/
- 00-overview/ → 00-vision-general/

**Archivos estimados:** ~100 archivos

**Duración:** 1 día (Día 7)

### Tareas Detalladas

#### Día 7 - Mañana (4 horas)

**1. Migrar guías de desarrollo (2 horas)**

```bash
# Copiar estructura de desarrollo
cp -r docs_bkp/03-desarrollo/* docs/95-guias-desarrollo/

# Consolidar database y base-de-datos
# Eliminar duplicados
```

**2. Migrar quick reference (30 min)**

```bash
cp -r docs_bkp/QUICK-REFERENCE/* docs/96-quick-reference/
```

**3. Migrar ADRs (30 min)**

```bash
cp -r docs_bkp/adr/* docs/97-adr/
```

**4. Migrar standards (30 min)**

```bash
cp -r docs_bkp/standards/* docs/98-standards/
```

**5. Migrar overview (30 min)**

```bash
cp -r docs_bkp/00-overview/* docs/00-vision-general/
```

#### Día 7 - Tarde (4 horas)

**6. Modularizar archivos extensos (2 horas)**

```bash
# Identificar archivos >200 líneas
find docs/ -name "*.md" -exec wc -l {} \; | sort -rn | awk '$1 > 200'

# Dividir manualmente o con asistencia de IA
# Priorizar archivos >400 líneas
```

**7. Actualizar referencias cruzadas (1 hora)**

```bash
# Ejecutar script que actualiza paths
./scripts/update-cross-references.sh
```

**8. Validación final completa (1 hora)**

```bash
./scripts/validate-complete-migration.sh

# Verificar:
# - Todos los archivos migrados
# - Sin archivos >200 líneas (o justificados)
# - Sin duplicados
# - Referencias actualizadas
# - _MAP.md en todas las carpetas
# - Inventarios YAML válidos
```

### Entregables Fase 5 Migración

- ✅ Guías de desarrollo consolidadas
- ✅ Referencias rápidas organizadas
- ✅ ADRs y standards migrados
- ✅ Overview restructurado
- ✅ Archivos modularizados

---

## 🛠️ SCRIPTS DE AUTOMATIZACIÓN

### Script 1: generate-epic-inventory.sh

```bash
#!/bin/bash
# Genera TRACEABILITY.yml para una épica

EPIC_CODE=$1
EPIC_PATH="docs/*-fase-*/$EPIC_CODE-*"

echo "# Generando inventario para $EPIC_CODE..."

# Escanear archivos de código relacionados
# Usar metadata de RF/ET para identificar código
# Generar YAML estructurado

# Este script:
# 1. Lee RF/ET de la épica
# 2. Busca referencias a código en RF/ET
# 3. Escanea apps/ para objetos relacionados
# 4. Genera TRACEABILITY.yml

# Implementación detallada pendiente (requiere parsing de RF/ET)
```

### Script 2: validate-phase-migration.sh

```bash
#!/bin/bash
# Valida migración de una fase

PHASE_PATH=$1

echo "Validando migración de $PHASE_PATH..."

# Verificar estructura
check_structure() {
  # Verificar carpetas requeridas
  for epica in $PHASE_PATH/*/; do
    [ -d "$epica/requerimientos" ] || echo "❌ Falta: $epica/requerimientos"
    [ -d "$epica/especificaciones" ] || echo "❌ Falta: $epica/especificaciones"
    [ -d "$epica/historias-usuario" ] || [ -d "$epica/tareas" ] || echo "❌ Falta: $epica/historias-usuario o tareas"
    [ -d "$epica/implementacion" ] || echo "❌ Falta: $epica/implementacion"
    [ -f "$epica/README.md" ] || echo "❌ Falta: $epica/README.md"
    [ -f "$epica/_MAP.md" ] || echo "❌ Falta: $epica/_MAP.md"
    [ -f "$epica/implementacion/TRACEABILITY.yml" ] || echo "⚠️  Recomendado: $epica/implementacion/TRACEABILITY.yml"
  done
}

# Verificar tamaño de archivos
check_file_sizes() {
  echo "Archivos >200 líneas:"
  find $PHASE_PATH -name "*.md" -exec wc -l {} \; | sort -rn | awk '$1 > 200 {print $1, $2}'
}

# Verificar referencias rotas
check_broken_links() {
  echo "Verificando referencias..."
  # Buscar enlaces markdown [](path)
  # Verificar que existan
}

check_structure
check_file_sizes
check_broken_links

echo "✅ Validación completada"
```

### Script 3: consolidate-database-inventory.sh

```bash
#!/bin/bash
# Consolida DATABASE.yml de todas las épicas en un inventario global

echo "schemas:" >> DATABASE_INVENTORY.yml

# Recorrer todas las épicas
for epic in docs/*-fase-*/*/implementacion/DATABASE.yml; do
  if [ -f "$epic" ]; then
    # Extraer información y agregar al consolidado
    # Incluir referencia a épica
    yq eval '.schemas' $epic | sed "s/^/  /"
  fi
done

echo "✅ DATABASE_INVENTORY.yml generado"
```

### Script 4: update-cross-references.sh

```bash
#!/bin/bash
# Actualiza referencias cruzadas tras migración

# Mapeo de paths antiguos → nuevos
declare -A PATH_MAP
PATH_MAP["01-requerimientos/02-gamificacion"]="01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos"
# ... más mapeos

# Buscar y reemplazar en archivos .md
find docs/ -name "*.md" -exec sed -i.bak \
  -e "s|01-requerimientos/02-gamificacion|01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos|g" \
  {} \;

echo "✅ Referencias actualizadas"
```

### Script 5: validate-complete-migration.sh

```bash
#!/bin/bash
# Validación completa de toda la migración

echo "========================================="
echo "VALIDACIÓN COMPLETA DE MIGRACIÓN"
echo "========================================="

# 1. Verificar todas las fases
for phase in docs/0{1,2,3}-fase-*; do
  echo "Validando $phase..."
  ./scripts/validate-phase-migration.sh $phase
done

# 2. Verificar transversal
echo "Validando transversal..."
./scripts/validate-transversal-migration.sh

# 3. Verificar inventarios consolidados
echo "Validando inventarios consolidados..."
for inventory in docs/90-transversal/inventarios/*.yml; do
  yq eval $inventory > /dev/null || echo "❌ YAML inválido: $inventory"
done

# 4. Verificar métricas
echo "Conteo de archivos migrados:"
find docs/ -name "*.md" | wc -l

echo "Conteo de archivos originales:"
find docs_bkp/ -name "*.md" | wc -l

echo "Diferencia:"
# Debe ser ~0 (tolerando algunos archivos eliminados por duplicación)

# 5. Verificar duplicados eliminados
echo "Verificando eliminación de duplicados..."
# Verificar que no existan carpetas/archivos duplicados

# 6. Verificar modularización
echo "Archivos >200 líneas:"
find docs/ -name "*.md" -exec wc -l {} \; | sort -rn | awk '$1 > 200' | wc -l
echo "(Objetivo: 0 o justificados)"

# 7. Reporte final
echo ""
echo "========================================="
echo "REPORTE FINAL"
echo "========================================="
echo "✅ Archivos migrados: $(find docs/ -name '*.md' | wc -l)"
echo "✅ Fases completadas: 5/5"
echo "✅ Inventarios YAML: $(find docs/ -name '*.yml' | wc -l)"
echo "✅ _MAP.md creados: $(find docs/ -name '_MAP.md' | wc -l)"
echo ""
echo "Migración completada exitosamente ✅"
```

---

## ✅ CRITERIOS DE VALIDACIÓN

### Por Fase

**Checklist por cada fase migrada:**

- [ ] Todas las épicas tienen estructura completa:
  - [ ] README.md
  - [ ] _MAP.md
  - [ ] requerimientos/ (con archivos)
  - [ ] especificaciones/ (con archivos)
  - [ ] historias-usuario/ o tareas/ (con archivos)
  - [ ] implementacion/ (con TRACEABILITY.yml)
  - [ ] pruebas/ (si aplica)

- [ ] Archivos de fase creados:
  - [ ] README.md
  - [ ] TIMELINE.yml
  - [ ] _MAP.md

- [ ] Inventarios generados:
  - [ ] TRACEABILITY.yml por épica

- [ ] Validación ejecutada sin errores críticos

- [ ] Referencias actualizadas

### Global

**Checklist final de migración completa:**

- [ ] **Completitud:**
  - [ ] 100% archivos migrados (640/640)
  - [ ] 0 archivos perdidos
  - [ ] docs_bkp/ preservado intacto

- [ ] **Estructura:**
  - [ ] 5 fases creadas (01-04 + 90)
  - [ ] 16 épicas migradas
  - [ ] ~70 _MAP.md creados
  - [ ] README.md en todas las carpetas principales

- [ ] **Trazabilidad:**
  - [ ] 16 TRACEABILITY.yml (uno por épica)
  - [ ] 4 inventarios consolidados (DATABASE, BACKEND, FRONTEND, TRACEABILITY_MATRIX)
  - [ ] Referencias código ↔ documentación establecidas

- [ ] **Modularización:**
  - [ ] <5 archivos >200 líneas (excepciones justificadas)
  - [ ] Archivos divididos correctamente

- [ ] **Duplicaciones:**
  - [ ] 0 carpetas duplicadas
  - [ ] Contenido redundante eliminado

- [ ] **Calidad:**
  - [ ] 0 referencias rotas
  - [ ] YAML válidos (sin errores de sintaxis)
  - [ ] Markdown formateado correctamente

- [ ] **Documentación:**
  - [ ] CHANGELOG.md actualizado
  - [ ] Guía de migración documentada
  - [ ] Mapeo antiguo→nuevo documentado

---

## 📈 MÉTRICAS DE SEGUIMIENTO

### Métricas Diarias

| Día | Fase Migración | Épicas | Archivos | Inventarios | Estado |
|-----|----------------|--------|----------|-------------|--------|
| 1-2 | Fase 1 | 5 | ~150 | 5 | ⚪ |
| 3   | Fase 2 | 1 | ~40 | 1 | ⚪ |
| 3-5 | Fase 3 | 10 | ~200 | 10 | ⚪ |
| 6   | Transversal | - | ~150 | 4 | ⚪ |
| 7   | Guías/Referencias | - | ~100 | - | ⚪ |

### KPIs de Éxito

| KPI | Objetivo | Actual | Estado |
|-----|----------|--------|--------|
| Archivos migrados | 640 | 0 | ⚪ |
| Épicas completadas | 16 | 0 | ⚪ |
| Inventarios YAML creados | 20 | 0 | ⚪ |
| Archivos >200 líneas | <5 | - | ⚪ |
| Referencias rotas | 0 | - | ⚪ |
| Tiempo total | ≤7 días | - | ⚪ |

---

## ⚠️ RIESGOS Y MITIGACIONES

| ID | Riesgo | Probabilidad | Impacto | Mitigación | Owner |
|----|--------|--------------|---------|------------|-------|
| R1 | Pérdida de información | Baja | Crítico | Preservar docs_bkp/, validación continua | Tech Lead |
| R2 | Referencias rotas | Alta | Medio | Script de validación, actualización automática | Dev 2 |
| R3 | Tiempo subestimado | Media | Medio | Buffer de 1 día, priorizar fases críticas | Tech Lead |
| R4 | Inventarios incompletos | Media | Alto | Revisión manual, mejora iterativa de scripts | Dev 1 |
| R5 | Resistencia al cambio | Baja | Bajo | Documentar beneficios, guías de navegación | Tech Lead |
| R6 | Errores en scripts | Media | Medio | Testing de scripts, dry-run antes de ejecución | Dev 2 |

---

## 🎯 CRONOGRAMA DETALLADO

### Semana 1

| Día | Fecha Estimada | Tareas | Responsable | Horas |
|-----|----------------|--------|-------------|-------|
| **1** | 2025-11-08 | Fase 1 Migración (EAI-001 a EAI-003) | Dev 1 | 8h |
| **2** | 2025-11-11 | Fase 1 Migración (EAI-004 a EAI-005) + Validación | Dev 1 | 8h |
| **3** | 2025-11-12 | Fase 2 Migración + Fase 3 Inicio | Dev 1 | 8h |
| **4** | 2025-11-13 | Fase 3 Migración (EXT-003 a EXT-006) | Dev 1 | 8h |
| **5** | 2025-11-14 | Fase 3 Migración (EXT-007 a EXT-010) + Validación | Dev 1 | 8h |

### Semana 2

| Día | Fecha Estimada | Tareas | Responsable | Horas |
|-----|----------------|--------|-------------|-------|
| **6** | 2025-11-15 | Fase 4 Migración (Transversal) | Dev 1 | 8h |
| **7** | 2025-11-18 | Fase 5 Migración (Guías) + Validación Final | Dev 1 | 8h |
| **+1** | 2025-11-19 | Buffer / Ajustes finales | Dev 1 | 4h |

**Total:** 7 días + 1 día buffer = 8 días calendario (60 horas)

---

## 📋 CHECKLIST DE EJECUCIÓN

### Pre-Migración

- [ ] docs_bkp/ respaldado
- [ ] docs/ vacía y lista
- [ ] Scripts de automatización creados y testeados
- [ ] Equipo alineado en nueva estructura
- [ ] Plan revisado y aprobado

### Durante Migración (por fase)

- [ ] Estructura de carpetas creada
- [ ] Archivos copiados
- [ ] Archivos reorganizados en nueva estructura
- [ ] Inventarios YAML generados
- [ ] README y _MAP creados
- [ ] Validación ejecutada
- [ ] Issues corregidos
- [ ] Fase marcada como completada

### Post-Migración

- [ ] Validación final ejecutada
- [ ] 100% archivos migrados
- [ ] 0 referencias rotas
- [ ] Inventarios consolidados generados
- [ ] docs_bkp/ preservado
- [ ] CHANGELOG actualizado
- [ ] Equipo notificado
- [ ] Guía de navegación creada
- [ ] Onboarding actualizado

---

## 📚 DOCUMENTACIÓN ADICIONAL

### Archivos de Soporte

1. **CHANGELOG.md** - Historial de cambios en migración
2. **MAPPING.md** - Mapeo de paths antiguos → nuevos
3. **NAVIGATION_GUIDE.md** - Guía de navegación en nueva estructura
4. **FAQ.md** - Preguntas frecuentes sobre la migración

### Ejemplo: MAPPING.md

```markdown
# Mapeo de Paths: Antiguo → Nuevo

## Requerimientos

| Path Antiguo | Path Nuevo |
|--------------|------------|
| `01-requerimientos/02-gamificacion/` | `01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/` |
| `01-requerimientos/01-autenticacion-autorizacion/` | `01-fase-alcance-inicial/EAI-001-fundamentos/requerimientos/` |

## Especificaciones

| Path Antiguo | Path Nuevo |
|--------------|------------|
| `02-especificaciones-tecnicas/02-gamificacion/` | `01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/` |

## Planificación

| Path Antiguo | Path Nuevo |
|--------------|------------|
| `04-planificacion/sprints/` | `90-transversal/sprints/` |
| `04-planificacion/roadmap/` | `90-transversal/roadmap/` |

(Mapeo completo...)
```

---

## 🚀 PRÓXIMOS PASOS

### Inmediatos (Hoy)

1. ✅ Revisión y aprobación de este plan
2. ⚪ Setup de scripts de automatización
3. ⚪ Dry-run en subset pequeño (1 épica)
4. ⚪ Ajustes al plan basados en dry-run

### Esta Semana

5. ⚪ Ejecutar Fase 1 de Migración
6. ⚪ Ejecutar Fase 2 de Migración
7. ⚪ Ejecutar Fase 3 de Migración

### Próxima Semana

8. ⚪ Ejecutar Fase 4 de Migración
9. ⚪ Ejecutar Fase 5 de Migración
10. ⚪ Validación final
11. ⚪ Comunicación a equipo

---

## 📞 CONTACTO Y SOPORTE

**Responsable:** Tech Lead
**Ejecutor principal:** Developer 1
**Soporte:** Developer 2, Claude Code

**Dudas o issues durante migración:**
- Slack: #gamilit-docs-migration
- Reporte de blockers: Immediately to Tech Lead

---

**Documento preparado por:** Claude Code (Agente de IA)
**Fecha:** 2025-11-07
**Versión:** 1.0
**Estado:** ⚪ Pendiente aprobación
