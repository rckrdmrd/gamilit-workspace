# GAP-005: Referencias a Proyecto Incorrecto en Orchestration/

**Fecha:** 2025-11-23
**Analista:** Architecture-Analyst
**Severidad:** 🔴 P0 (Crítico - Confusión de Contexto)
**Área:** Orchestration (Directivas, Prompts, Documentación)
**Relacionado con:** REPORTE-COHERENCIA-2025-11-23.md

---

## 📊 RESUMEN EJECUTIVO

### Problema Crítico
**La carpeta `orchestration/` contiene múltiples referencias a un proyecto incorrecto**: "MVP Sistema Administración de Obra e INFONAVIT" en lugar de "GAMILIT - Sistema de Gamificación Educativa".

**Impacto:**
- ❌ Confusión masiva para agentes (Claude Code)
- ❌ Directivas con ejemplos de otro dominio (obra inmobiliaria vs educación)
- ❌ Prompts que referencian schemas inexistentes (project_management, housing, etc.)
- ❌ Documentación desalineada del proyecto real

---

## 🔍 HALLAZGOS DETALLADOS

### Archivos Afectados (20 de 87 = 23%)

#### 🚨 DIRECTIVAS (9 de 11 = 82% INCORRECTAS)

| Archivo | Ref Incorrecta | Estado | Prioridad |
|---------|----------------|--------|-----------|
| **DIRECTIVA-CALIDAD-CODIGO.md** | "MVP Sistema Administración de Obra e INFONAVIT" | ❌ | P0 |
| **DIRECTIVA-CONTROL-VERSIONES.md** | "MVP Sistema Administración de Obra e INFONAVIT" | ❌ | P0 |
| **DIRECTIVA-DISENO-BASE-DATOS.md** | "MVP Sistema Administración de Obra e INFONAVIT" | ❌ | P0 |
| **DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md** | "MVP Sistema Administración de Obra e INFONAVIT" | ❌ | P0 |
| **DIRECTIVA-VALIDACION-SUBAGENTES.md** | "MVP Sistema Administración de Obra e INFONAVIT" | ❌ | P0 |
| **ESTANDARES-NOMENCLATURA.md** | "MVP Sistema Administración de Obra e INFONAVIT" | ❌ | P0 |
| **GUIA-NOMENCLATURA-COMPLETA.md** | "MVP Sistema Administración de Obra e INFONAVIT" | ❌ | P0 |
| **PROTOCOLO-ESCALAMIENTO-PO.md** | "MVP Sistema Administración de Obra e INFONAVIT" | ❌ | P0 |
| **SISTEMA-RETROALIMENTACION-MEJORA-CONTINUA.md** | "MVP Sistema Administración de Obra e INFONAVIT" | ❌ | P0 |
| DIRECTIVA-GESTION-BACKUPS-GITIGNORE.md | "GAMILIT - Sistema de Gamificación Educativa" | ✅ | - |
| POLITICAS-USO-AGENTES.md | "GAMILIT - Sistema de Gamificación Educativa" | ✅ | - |

#### 🚨 PROMPTS (4 de 13 = 31% INCORRECTAS)

| Archivo | Ref Incorrecta | Estado | Prioridad |
|---------|----------------|--------|-----------|
| **PROMPT-AGENTES-PRINCIPALES-OLD.md** | "MVP Sistema Administración de Obra e INFONAVIT" | ❌ | P1 |
| **PROMPT-REQUIREMENTS-ANALYST.md** | "MVP Sistema Administración de Obra e INFONAVIT" | ❌ | P0 |
| **PROMPT-SUBAGENTES.md** | "MVP Sistema Administración de Obra e INFONAVIT" | ❌ | P0 |
| **RESUMEN-CREACION-PROMPTS.md** | Referencias a proyecto obra | ❌ | P2 |
| PROMPT-ARCHITECTURE-ANALYST.md | "GAMILIT" | ✅ | - |
| PROMPT-BACKEND-AGENT.md | "GAMILIT" | ✅ | - |
| PROMPT-BUG-FIXER.md | "GAMILIT" | ✅ | - |
| PROMPT-CODE-REVIEWER.md | "GAMILIT" | ✅ | - |
| PROMPT-DATABASE-AGENT.md | "GAMILIT" | ✅ | - |
| PROMPT-FEATURE-DEVELOPER.md | "GAMILIT" | ✅ | - |
| PROMPT-FRONTEND-AGENT.md | "GAMILIT" | ✅ | - |
| PROMPT-POLICY-AUDITOR.md | "GAMILIT" | ✅ | - |
| PROMPT-WORKSPACE-MANAGER.md | "GAMILIT" | ✅ | - |

#### ⚠️ OTROS ARCHIVOS (7 archivos)

| Archivo | Ocurrencias | Prioridad |
|---------|-------------|-----------|
| orchestration/README.md | 1 | P2 |
| orchestration/trazas/TRAZA-ANALISIS-ARQUITECTURA.md | 1 | P2 |
| orchestration/templates/TEMPLATE-*.md | 0 (genéricos ✅) | - |
| agentes/workspace-manager/gitignore-analysis-20251123/REPORTE-VALIDACION-WORKSPACE-INMOBILIARIA.md | Alto | P2 |
| agentes/workspace-manager/reorganization-analysis/*.md | Múltiples | P2 |
| agentes/architecture-analyst/implementations/*.md | Múltiples | P2 |

---

## 🎯 EJEMPLOS DE CONFUSIÓN GENERADA

### Ejemplo 1: DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md

**❌ INCORRECTO (líneas 1-6):**
```markdown
# 📋 DIRECTIVA DE DOCUMENTACIÓN OBLIGATORIA

**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT
**Versión:** 1.0.0
**Fecha:** 2025-11-17
```

**❌ EJEMPLOS INCORRECTOS (líneas 66-100):**
```sql
-- Comentar tabla
COMMENT ON TABLE project_management.projects IS
    'Proyectos habitacionales - Nivel superior de jerarquía (Proyecto > Desarrollo > Fase > Vivienda)';

COMMENT ON COLUMN project_management.projects.code IS
    'Código único del proyecto (ej: PROJ-2025-001). Usado para reportes y referencias externas';
```

```typescript
/**
 * Entity para Proyectos habitacionales
 *
 * Representa el nivel superior en la jerarquía de obra:
 * Proyecto → Desarrollo (fraccionamiento) → Fase → Vivienda
 *
 * @see apps/database/ddl/schemas/project_management/tables/01-projects.sql
 * @see docs/01-requerimientos/R-002-proyectos-obras.md
 */
@Entity({ schema: 'project_management', name: 'projects' })
export class ProjectEntity {
```

**✅ DEBERÍA SER:**
```markdown
# 📋 DIRECTIVA DE DOCUMENTACIÓN OBLIGATORIA

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Versión:** 1.1.0
**Fecha:** 2025-11-23 (actualizada)
```

```sql
-- Comentar tabla
COMMENT ON TABLE educational_content.modules IS
    'Módulos educativos - Contenido organizado por niveles de comprensión lectora';

COMMENT ON COLUMN educational_content.modules.code IS
    'Código único del módulo (ej: MOD-001). Usado para progreso y referencias';
```

```typescript
/**
 * Entity para Módulos Educativos
 *
 * Representa el contenido educativo organizado por niveles:
 * Módulo → Ejercicios → Respuestas
 *
 * @see apps/database/ddl/schemas/educational_content/tables/01-modules.sql
 * @see docs/01-fase-alcance-inicial/EAI-002-actividades/README.md
 */
@Entity({ schema: 'educational_content', name: 'modules' })
export class ModuleEntity {
```

---

### Ejemplo 2: ESTANDARES-NOMENCLATURA.md

**❌ REFERENCIAS A SCHEMAS INEXISTENTES:**
- `project_management`
- `housing_development`
- `construction_phases`
- `infonavit_integration`

**✅ SCHEMAS REALES DE GAMILIT:**
- `auth_management`
- `educational_content`
- `gamification_system`
- `progress_tracking`
- `social_features`

---

### Ejemplo 3: PROMPT-REQUIREMENTS-ANALYST.md

**❌ CONTEXTO INCORRECTO:**
```markdown
**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT

Tu función es analizar requerimientos de un sistema de gestión de obra y créditos INFONAVIT...
```

**✅ DEBERÍA SER:**
```markdown
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa

Tu función es analizar requerimientos de un sistema de gamificación educativa con cultura maya...
```

---

## 🔧 PLAN DE CORRECCIÓN

### FASE 1: Directivas Críticas (INMEDIATO - P0)

**Acción:** Reemplazar todas las referencias en 9 directivas

**Cambios sistemáticos:**
```bash
# En cada archivo directiva/*.md:

1. Header:
   ❌ **Proyecto:** MVP Sistema Administración de Obra e INFONAVIT
   ✅ **Proyecto:** GAMILIT - Sistema de Gamificación Educativa

2. Ejemplos de schemas:
   ❌ project_management, housing, construction
   ✅ educational_content, gamification_system, progress_tracking

3. Ejemplos de entidades:
   ❌ ProjectEntity, HousingEntity, PhaseEntity
   ✅ ModuleEntity, ExerciseEntity, AchievementEntity

4. Referencias de documentación:
   ❌ docs/01-requerimientos/R-002-proyectos-obras.md
   ✅ docs/01-fase-alcance-inicial/EAI-002-actividades/README.md
```

**Archivos a corregir:**
1. DIRECTIVA-CALIDAD-CODIGO.md
2. DIRECTIVA-CONTROL-VERSIONES.md
3. DIRECTIVA-DISENO-BASE-DATOS.md
4. DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md
5. DIRECTIVA-VALIDACION-SUBAGENTES.md
6. ESTANDARES-NOMENCLATURA.md
7. GUIA-NOMENCLATURA-COMPLETA.md
8. PROTOCOLO-ESCALAMIENTO-PO.md
9. SISTEMA-RETROALIMENTACION-MEJORA-CONTINUA.md

**Estimación:** 3-4 horas (corrección manual + validación)

---

### FASE 2: Prompts Incorrectos (INMEDIATO - P0/P1)

**Archivos a corregir:**
1. PROMPT-REQUIREMENTS-ANALYST.md (P0)
2. PROMPT-SUBAGENTES.md (P0)
3. PROMPT-AGENTES-PRINCIPALES-OLD.md (P1 - deprecated)
4. RESUMEN-CREACION-PROMPTS.md (P2)

**Estimación:** 1 hora

---

### FASE 3: Archivos de Análisis/Reportes (P2)

**Acción:** Actualizar o archivar

**Archivos:**
- orchestration/trazas/TRAZA-ANALISIS-ARQUITECTURA.md
- agentes/workspace-manager/*/REPORTE-*.md
- agentes/architecture-analyst/implementations/*.md

**Opciones:**
1. Archivar en carpeta `orchestration_bckp/` (ya existe)
2. Actualizar referencias donde aplique
3. Agregar disclaimer de contexto histórico

**Estimación:** 30 minutos

---

## 📊 IMPACTO Y RIESGOS

### Impacto de NO Corregir (Actual)

| Área | Impacto | Severidad |
|------|---------|-----------|
| **Agentes Claude Code** | Confusión al leer directivas con ejemplos incorrectos | 🔴 CRÍTICO |
| **Nuevos Desarrolladores** | Onboarding confuso con referencias mezcladas | 🔴 CRÍTICO |
| **Documentación** | Pérdida de coherencia y profesionalismo | 🟡 ALTO |
| **Mantenibilidad** | Dificultad para actualizar estándares | 🟡 ALTO |
| **Credibilidad** | Percepción de falta de atención al detalle | 🟢 MEDIO |

### Beneficios de Corregir

| Beneficio | Valor |
|-----------|-------|
| ✅ **Coherencia 100%** | Todas las referencias alineadas con GAMILIT |
| ✅ **Agentes Efectivos** | Claude Code comprende contexto correcto |
| ✅ **Onboarding Claro** | Nuevos devs no se confunden |
| ✅ **Profesionalismo** | Documentación de calidad |
| ✅ **Mantenibilidad** | Actualizar 1 vez vs múltiples copias |

---

## 🎯 MATRIZ DE CORRECCIONES

### Reemplazos Globales Requeridos

| Buscar | Reemplazar |
|--------|-----------|
| `MVP Sistema Administración de Obra e INFONAVIT` | `GAMILIT - Sistema de Gamificación Educativa` |
| `project_management` | `educational_content` |
| `housing_development` | `gamification_system` |
| `construction_phases` | `progress_tracking` |
| `infonavit_integration` | `social_features` |
| `ProjectEntity` | `ModuleEntity` |
| `HousingEntity` | `ExerciseEntity` |
| `PhaseEntity` | `AchievementEntity` |
| `Proyectos habitacionales` | `Módulos educativos` |
| `Desarrollo (fraccionamiento)` | `Ejercicios interactivos` |
| `Vivienda` | `Respuestas de estudiantes` |
| `créditos INFONAVIT` | `puntos ML Coins` |
| `obra inmobiliaria` | `contenido educativo` |

---

## ✅ CHECKLIST DE VALIDACIÓN POST-CORRECCIÓN

Después de corregir todos los archivos:

```markdown
### Validación de Directivas
- [ ] Todas las directivas tienen header "GAMILIT - Sistema de Gamificación Educativa"
- [ ] Todos los ejemplos SQL usan schemas de GAMILIT (educational_content, gamification_system, etc.)
- [ ] Todos los ejemplos TypeScript usan entities de GAMILIT (ModuleEntity, ExerciseEntity, etc.)
- [ ] No hay referencias a "INFONAVIT", "obra", "housing", "construction"

### Validación de Prompts
- [ ] Todos los prompts principales tienen header "GAMILIT"
- [ ] PROMPT-SUBAGENTES.md está alineado con contexto GAMILIT
- [ ] No hay referencias a dominio inmobiliario

### Validación General
- [ ] grep -r "INFONAVIT" orchestration/ --include="*.md" → Sin resultados
- [ ] grep -r "project_management" orchestration/ --include="*.md" → Solo en archivos archived
- [ ] grep -r "housing" orchestration/ --include="*.md" → Solo en archivos archived
```

---

## 📋 SCRIPT DE BÚSQUEDA Y VALIDACIÓN

```bash
#!/bin/bash
# validate-orchestration-references.sh

echo "🔍 Buscando referencias incorrectas en orchestration/"

# Buscar referencias a INFONAVIT
echo "--- Referencias a INFONAVIT ---"
grep -r "INFONAVIT" /home/user/gamilit-workspace/orchestration \
  --include="*.md" --include="*.yml" -l | \
  grep -v "_bckp/" | grep -v "GAP-005"

# Buscar referencias a schemas incorrectos
echo "--- Referencias a schemas incorrectos ---"
grep -r "project_management\|housing_development\|construction_phases" \
  /home/user/gamilit-workspace/orchestration \
  --include="*.md" --include="*.yml" -l | \
  grep -v "_bckp/" | grep -v "GAP-005"

# Buscar referencias a entidades incorrectas
echo "--- Referencias a entidades incorrectas ---"
grep -r "ProjectEntity\|HousingEntity\|PhaseEntity" \
  /home/user/gamilit-workspace/orchestration \
  --include="*.md" --include="*.yml" -l | \
  grep -v "_bckp/" | grep -v "GAP-005"

# Validar headers de directivas
echo "--- Verificando headers de directivas ---"
for file in /home/user/gamilit-workspace/orchestration/directivas/*.md; do
  header=$(head -5 "$file" | grep "Proyecto:")
  if echo "$header" | grep -q "GAMILIT"; then
    echo "✅ $(basename $file)"
  else
    echo "❌ $(basename $file)"
  fi
done

echo ""
echo "✅ Validación completa"
```

---

## 🔗 RELACIÓN CON OTROS GAPS

### GAP-001: Dependencies No Instaladas
**Relación:** Ninguna (independiente)

### GAP-002: MASTER_INVENTORY.yml Vacío
**Relación:** ✅ RESUELTO - MASTER_INVENTORY.yml SÍ tiene referencias correctas a GAMILIT

### GAP-003: Frontend Build Errors
**Relación:** ✅ RESUELTO - No relacionado

### GAP-004: Backend Build Errors
**Relación:** Ninguna (independiente)

### GAP-005: Referencias Proyecto Incorrecto (ESTE GAP)
**Impacto:** Afecta la coherencia de TODA la documentación de orchestration/

---

## 🎯 RECOMENDACIÓN FINAL

### Prioridad de Corrección

**P0 - INMEDIATO (hoy):**
- 9 Directivas críticas
- 2 Prompts principales (REQUIREMENTS-ANALYST, SUBAGENTES)

**P1 - ALTA (esta semana):**
- 1 Prompt deprecated (AGENTES-PRINCIPALES-OLD)
- Validación con script

**P2 - MEDIA (siguiente semana):**
- Archivos de análisis/reportes
- Cleanup de referencias históricas

### Estimación Total
**Tiempo:** 4-5 horas
**Complejidad:** Media (búsqueda y reemplazo sistemático)
**Riesgo:** Bajo (cambios de documentación, no código)

### Responsable
**Delegar a:** Architecture-Analyst (YO - puedo hacerlo)
**Alternativa:** Documentation-Writer / Technical-Writer

---

## 📊 MÉTRICAS PRE Y POST CORRECCIÓN

| Métrica | Pre-Corrección | Post-Corrección | Delta |
|---------|----------------|-----------------|-------|
| **Directivas con referencias incorrectas** | 9/11 (82%) | 0/11 (0%) | -82% ✅ |
| **Prompts con referencias incorrectas** | 4/13 (31%) | 0/13 (0%) | -31% ✅ |
| **Coherencia orchestration/** | 77% | 100% | +23% ✅ |
| **Archivos con "INFONAVIT"** | 20 | 0 (archivados) | -20 ✅ |
| **Coherencia general documentación** | 95% | 98% | +3% ✅ |

---

**FIN DEL REPORTE GAP-005**

**Generado por:** Architecture-Analyst
**Fecha:** 2025-11-23
**Versión:** 1.0.0
**Próxima acción:** Corrección sistemática de 9 directivas + 2 prompts (4-5 horas)
