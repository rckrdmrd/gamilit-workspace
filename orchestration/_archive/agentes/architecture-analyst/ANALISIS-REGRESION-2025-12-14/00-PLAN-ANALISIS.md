# PLAN DE ANÁLISIS - Regresión Student Portal
**Fecha:** 2025-12-14
**Agente:** Architecture-Analyst
**Tarea:** Análisis comparativo origen vs actual para identificar regresiones

---

## RESUMEN EJECUTIVO

### Problema Identificado
El portal de estudiantes funcionaba correctamente hasta el módulo 3, pero actualmente presenta múltiples errores en todos los módulos. Se detectaron cambios no controlados que afectan la funcionalidad existente.

### Alcance del Análisis

| Capa | Archivos Diferentes | Criticidad |
|------|---------------------|------------|
| Frontend | 68 archivos | 🔴 ALTA |
| Backend | 366 archivos | 🔴 ALTA |
| Database | 84 archivos | 🟡 MEDIA |

### Proyectos Comparados
- **ORIGEN (funcionaba):** `/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit`
- **ACTUAL (con errores):** `/home/isem/workspace/projects/gamilit`

---

## FASE 1: CONTEXTO (C) ✅ COMPLETADA

### 1.1 Identificación del Nivel
- **Nivel:** 2A (Standalone)
- **Proyecto:** GAMILIT
- **orchestration_path:** `projects/gamilit/orchestration/`

### 1.2 Directivas Aplicables
- `@CAPVED` - Ciclo de vida
- `@ALINEACION` - Validación DDL ↔ Entity ↔ DTO ↔ Types
- `@VALIDAR` - Validación obligatoria

---

## FASE 2: ANÁLISIS (A) - EN PROGRESO

### 2.1 Estructura del Análisis

El análisis se dividirá en **3 subagentes** para economía de tokens:

```yaml
SA-001-FRONTEND:
  scope: "Análisis de regresiones en Frontend"
  archivos_criticos:
    - ExercisePage.tsx
    - useModules.ts
    - Mecánicas de módulos 1-5
  output: "01-ANALISIS-FRONTEND.md"

SA-002-BACKEND:
  scope: "Análisis de regresiones en Backend"
  archivos_criticos:
    - exercises.controller.ts
    - modules.controller.ts
    - submit-exercise.dto.ts
    - exercises.service.ts
  output: "02-ANALISIS-BACKEND.md"

SA-003-DATABASE:
  scope: "Análisis de cambios en DDL"
  archivos_criticos:
    - gamification_system/tables/
    - social_features/
  output: "03-ANALISIS-DATABASE.md"
```

### 2.2 Archivos Críticos Identificados

#### Frontend - Impacto ALTO
| Archivo | Cambio Detectado | Impacto |
|---------|------------------|---------|
| `ExercisePage.tsx` | Navegación y manejo de `module_id` | 🔴 CRÍTICO |
| `useModules.ts` | Hook de módulos modificado | 🔴 CRÍTICO |
| `CrucigramaExercise.tsx` | Mecánica módulo 1 | 🔴 CRÍTICO |
| `DetectiveTextualExercise.tsx` | Mecánica módulo 2 | 🔴 CRÍTICO |
| `QuizTikTokExercise.tsx` | Mecánica módulo 4 | 🟡 MEDIO |
| `VerificadorFakeNewsExercise.tsx` | Mecánica módulo 4 | 🟡 MEDIO |

#### Backend - Impacto ALTO
| Archivo | Cambio Detectado | Impacto |
|---------|------------------|---------|
| `exercises.controller.ts` | Controller de ejercicios | 🔴 CRÍTICO |
| `modules.controller.ts` | Controller de módulos | 🔴 CRÍTICO |
| `submit-exercise.dto.ts` | DTO de submit | 🔴 CRÍTICO |
| `admin.module.ts` | Configuración del módulo | 🟡 MEDIO |

#### Database - Impacto MEDIO
| Archivo | Cambio Detectado | Impacto |
|---------|------------------|---------|
| `mission_templates.sql` | NUEVO (reemplaza team_missions) | 🟡 MEDIO |
| `friend_requests.sql` | NUEVO | 🟢 BAJO |
| `friendships.sql` | Modificado | 🟢 BAJO |

### 2.3 Cambios Específicos Detectados en ExercisePage.tsx

```diff
270c270,271
<           module_id: exerciseData.module_id,
---
>           // API returns camelCase after apiClient transformation
>           module_id: exerciseData.moduleId || exerciseData.module_id,

560c561,566
<       navigate(`/modules/${exercise?.module_id || moduleId}`);
---
>       const targetModuleId = exercise?.module_id;
>       if (targetModuleId && targetModuleId !== 'undefined') {
>         navigate(`/modules/${targetModuleId}`);
>       } else {
>         navigate('/dashboard');
>       }

717c723
<               onClick={() => navigate(`/modules/${moduleId || 'dashboard'}`)}
---
>               onClick={() => navigate('/dashboard')}
```

**Diagnóstico:** Se cambió la lógica de navegación, rompiendo el flujo de "volver al módulo".

---

## FASE 3: PLANEACIÓN (P) - PENDIENTE

### 3.1 Estrategia de Corrección

```yaml
ESTRATEGIA: "RESTORE_AND_MERGE"
descripcion: |
  1. Restaurar archivos críticos desde ORIGEN
  2. Identificar cambios VÁLIDOS del ACTUAL
  3. Merge selectivo de mejoras sin romper funcionalidad
  4. Validar cada módulo progresivamente
```

### 3.2 Orden de Ejecución Propuesto

```
1. DATABASE (si hay cambios estructurales)
   └── Validar DDL → Carga limpia

2. BACKEND
   ├── Entities (alinear con DDL)
   ├── DTOs (alinear con Entities)
   ├── Controllers (restaurar endpoints)
   └── Build + Lint

3. FRONTEND
   ├── Types (alinear con DTOs)
   ├── Hooks críticos (useModules)
   ├── ExercisePage.tsx
   ├── Mecánicas módulo 1-3 (PRIORITARIO)
   ├── Mecánicas módulo 4-5
   └── Build + Lint
```

---

## FASE 4: VALIDACIÓN (V) - PENDIENTE

### 4.1 Criterios de Validación

```yaml
GATE_V_CRITERIA:
  - [ ] Todos los archivos críticos analizados
  - [ ] Impacto de cada cambio documentado
  - [ ] Dependencias identificadas
  - [ ] Plan cubre todos los hallazgos
  - [ ] No hay scope creep
```

### 4.2 Checklist de Validación

```markdown
## Pre-Ejecución
- [ ] Análisis Frontend completo
- [ ] Análisis Backend completo
- [ ] Análisis Database completo
- [ ] Plan de corrección validado
- [ ] Subagentes definidos con prompts

## Post-Ejecución
- [ ] Build Backend pasa
- [ ] Build Frontend pasa
- [ ] Módulos 1-3 funcionan correctamente
- [ ] Módulos 4-5 funcionan correctamente
- [ ] Inventarios actualizados
```

---

## FASE 5: EJECUCIÓN (E) - PENDIENTE

### 5.1 Subagentes Propuestos

```yaml
SUBAGENTE_FE_RESTORATION:
  perfil: "PERFIL-FRONTEND"
  directivas: ["SIMCO-MODIFICAR", "SIMCO-VALIDAR"]
  tarea: "Restaurar archivos críticos de frontend"
  archivos:
    - ExercisePage.tsx
    - useModules.ts
    - Mecánicas módulos 1-3

SUBAGENTE_BE_RESTORATION:
  perfil: "PERFIL-BACKEND"
  directivas: ["SIMCO-MODIFICAR", "SIMCO-VALIDAR", "SIMCO-ALINEACION"]
  tarea: "Restaurar controllers y DTOs críticos"
  archivos:
    - exercises.controller.ts
    - modules.controller.ts
    - submit-exercise.dto.ts

SUBAGENTE_DB_VALIDATION:
  perfil: "PERFIL-DATABASE"
  directivas: ["SIMCO-DDL", "SIMCO-VALIDAR"]
  tarea: "Validar DDL y ejecutar carga limpia"
```

---

## FASE 6: DOCUMENTACIÓN (D) - PENDIENTE

### 6.1 Entregables

| Documento | Descripción |
|-----------|-------------|
| `01-ANALISIS-FRONTEND.md` | Análisis detallado FE |
| `02-ANALISIS-BACKEND.md` | Análisis detallado BE |
| `03-ANALISIS-DATABASE.md` | Análisis detallado DB |
| `04-PLAN-CORRECCIONES.md` | Plan de corrección |
| `05-VALIDACION-PLAN.md` | Validación del plan |
| `06-REPORTE-EJECUCION.md` | Reporte de ejecución |
| `07-RESUMEN-EJECUTIVO.md` | Resumen final |

### 6.2 Actualizaciones Requeridas

- `MASTER_INVENTORY.yml`
- `FRONTEND_INVENTORY.yml`
- `BACKEND_INVENTORY.yml`
- `TRAZA-TAREAS-FRONTEND.md`
- `TRAZA-TAREAS-BACKEND.md`

---

## PRÓXIMO PASO

Ejecutar análisis detallado de los 3 componentes (FE, BE, DB) con subagentes especializados.

---

**Estado:** FASE A EN PROGRESO
**Última actualización:** 2025-12-14
