# Propuesta de Mejora: Fase Post-Tarea Obligatoria

**Fecha:** 2026-01-16
**Task:** TASK-2026-01-16-005
**Tipo:** Mejora de Gobernanza
**Prioridad:** P1

---

## 1. Análisis del Gap

### 1.1 Situación Detectada

Al validar el cumplimiento de la fase D (Documentación) post-tarea, se identificaron los siguientes gaps:

| Requisito | Estado | Gap Identificado |
|-----------|--------|------------------|
| Inventarios actualizados | ❌ NO CUMPLIDO | Inventarios no se actualizaron automáticamente |
| Coherencia entre capas | ❌ NO VERIFICADO | No se ejecutó verificación DDL↔Backend |
| Trazas de agente | ❌ NO ACTUALIZADAS | Traza de tarea no se actualizó al cierre |
| Validaciones técnicas | ⚠️ PARCIAL | Build verificado, pero no re-verificado al cierre |
| Propagación | ❌ NO EVALUADA | No se evaluó si cambios debían propagarse |

### 1.2 Causa Raíz

1. **El checklist `@DEF_CHK_POST` existe pero NO es invocado automáticamente**
2. **Los perfiles de agentes NO incluyen referencia explícita al checklist post-tarea**
3. **No hay trigger que obligue la ejecución del checklist antes de marcar tarea como completada**
4. **CAPVED documenta fase D pero no especifica checklist de cierre**

---

## 2. Propuesta de Mejoras

### 2.1 Mejora 1: Agregar Sección Post-Tarea a Todos los Perfiles

**Archivo afectado:** `orchestration/agents/perfiles/PERFIL-*.md`

**Agregar sección:**

```yaml
## CIERRE DE TAREA (OBLIGATORIO)

> **ANTES de marcar cualquier tarea como completada:**

### Ejecutar @DEF_CHK_POST (CHECKLIST-POST-TASK.md)

```markdown
[ ] 0. GOBERNANZA - Carpeta de tarea + METADATA.yml + _INDEX.yml
[ ] 1. VALIDACIONES TÉCNICAS - build/lint/test pasan
[ ] 2. COHERENCIA ENTRE CAPAS - DDL↔Backend↔Frontend verificado
[ ] 3. INVENTARIOS - DATABASE/BACKEND/FRONTEND/MASTER actualizados
[ ] 4. TRAZAS - Traza de tarea y agente actualizadas
[ ] 5. PROPAGACIÓN - Evaluado si aplica a otros proyectos
```

**SI FALLA CUALQUIER ITEM: NO marcar como completada.**
```

### 2.2 Mejora 2: Crear Trigger de Cierre Obligatorio

**Archivo nuevo:** `orchestration/directivas/triggers/TRIGGER-CIERRE-TAREA-OBLIGATORIO.md`

```yaml
# TRIGGER: CIERRE DE TAREA OBLIGATORIO

version: "1.0.0"
fecha: "2026-01-16"
alias: "@TRIGGER_CIERRE"

## CONDICIÓN DE ACTIVACIÓN

Se activa cuando:
- Agente intenta marcar tarea como "completada"
- Agente dice "tarea finalizada" o similar
- Agente termina la última subtarea del plan

## ACCIÓN REQUERIDA

1. DETENER antes de marcar completada
2. CARGAR: @DEF_CHK_POST
3. EJECUTAR: Checklist completo (7 secciones)
4. VERIFICAR: Todos los items marcados ✅
5. SOLO ENTONCES: Marcar tarea como completada

## BLOQUEO

SI el checklist NO pasa:
- NO marcar tarea como completada
- Documentar items faltantes
- Completar items antes de cerrar
```

### 2.3 Mejora 3: Actualizar CLAUDE.md del Workspace

**Archivo:** `/home/isem/workspace-v2/CLAUDE.md`

**Agregar regla:**

```yaml
### Regla 9: Cierre de Tarea Obligatorio

ANTES de marcar cualquier tarea como completada:
1. Cargar y ejecutar @DEF_CHK_POST (CHECKLIST-POST-TASK.md)
2. Verificar TODOS los items del checklist
3. SI falla cualquier item: NO marcar como completada
4. Completar items faltantes antes de cerrar

SECUENCIA DE CIERRE:
1. Gobernanza (carpeta + METADATA + _INDEX)
2. Validaciones técnicas (build/lint/test)
3. Coherencia entre capas
4. Inventarios actualizados
5. Trazas actualizadas
6. Propagación evaluada

REFERENCIAS:
- `@DEF_CHK_POST` - Checklist post-tarea completo
- `@TRIGGER_CIERRE` - Trigger de cierre obligatorio
```

### 2.4 Mejora 4: Actualizar PRINCIPIO-CAPVED.md

**Archivo:** `orchestration/directivas/principios/PRINCIPIO-CAPVED.md`

**Agregar en fase D:**

```yaml
## D - DOCUMENTACIÓN CONTINUA (con checklist de cierre)

### Actividades de Fase D:
- Actualizar diagramas y modelos de dominio
- Actualizar especificaciones técnicas
- Crear/actualizar ADRs si hubo decisiones arquitectónicas
- Actualizar inventarios
- Actualizar trazas de tareas
- Registrar HUs derivadas
- Registrar lecciones aprendidas

### GATE DE CIERRE (OBLIGATORIO)
> Antes de marcar tarea como Done, ejecutar @DEF_CHK_POST

[ ] Gobernanza creada
[ ] Validaciones técnicas pasan
[ ] Coherencia entre capas verificada
[ ] Inventarios sincronizados
[ ] Trazas actualizadas
[ ] Propagación evaluada

→ SOLO si TODOS pasan: Tarea = DONE
```

---

## 3. Plan de Implementación

### Fase 1: Inmediata (esta sesión)
- [x] Documentar análisis de gaps
- [x] Crear propuesta de mejoras
- [ ] Implementar mejoras en CLAUDE.md (opcional - requiere autorización)

### Fase 2: Corto Plazo
- [ ] Actualizar 5 perfiles principales (DATABASE, BACKEND, FRONTEND, QA, META-ORQUESTADOR)
- [ ] Crear TRIGGER-CIERRE-TAREA-OBLIGATORIO.md
- [ ] Actualizar PRINCIPIO-CAPVED.md

### Fase 3: Medio Plazo
- [ ] Actualizar todos los perfiles de agentes
- [ ] Agregar al onboarding de nuevos agentes
- [ ] Crear script de validación automática de checklist

---

## 4. Métricas de Éxito

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Tareas con checklist post-tarea ejecutado | ~30% | 100% |
| Inventarios actualizados al cierre | ~50% | 100% |
| Trazas actualizadas al cierre | ~40% | 100% |
| Coherencia verificada al cierre | ~20% | 100% |

---

## 5. Referencias

| Alias | Archivo |
|-------|---------|
| @DEF_CHK_POST | orchestration/_definitions/checklists/CHECKLIST-POST-TASK.md |
| @TRIGGER_INVENTARIOS | orchestration/directivas/triggers/TRIGGER-INVENTARIOS-SINCRONIZADOS.md |
| @TRIGGER_COHERENCIA | orchestration/directivas/triggers/TRIGGER-COHERENCIA-CAPAS.md |
| @CAPVED | orchestration/directivas/principios/PRINCIPIO-CAPVED.md |

---

## 6. Lecciones Aprendidas

### Lo que funcionó bien:
- El checklist @DEF_CHK_POST existe y es completo
- Los triggers de coherencia e inventarios están bien documentados
- La estructura de gobernanza de tareas está clara

### Lo que se puede mejorar:
- Falta integración explícita del checklist en perfiles de agentes
- Falta trigger que obligue ejecución al cierre
- Falta recordatorio en CLAUDE.md del workspace

### Para futuras tareas:
- SIEMPRE cargar @DEF_CHK_POST antes de marcar tarea como completada
- Considerar este checklist como parte integral de fase D
- No delegar esta validación - ejecutar directamente

---

**Estado:** PROPUESTA DOCUMENTADA
**Requiere:** Aprobación para implementación
