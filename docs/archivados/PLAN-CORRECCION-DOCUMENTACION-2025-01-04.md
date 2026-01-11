# Plan de Correccion de Documentacion - 2025-01-04

**Estado:** En Planeacion
**Fecha:** 2025-01-04
**Tipo:** Plan de Ejecucion Scrum
**Sprint:** Sprint Correctivo

---

## 1. CONTEXTO

Se identificaron problemas criticos en la documentacion migrada:

### 1.1 Problema Principal
El archivo `BACKEND-CRITICAL-ISSUES-PENDING.md` documenta 5 issues P0 como "NO RESUELTOS" cuando en realidad **YA ESTAN IMPLEMENTADOS** segun:
- Verificacion directa del codigo fuente
- Reportes historicos `EXECUTION-REPORT-2025-11-28.md`
- Reportes de validacion `VALIDATION-PLAN-2025-11-28.md`

### 1.2 Issues Afectados

| Issue | Estado Documentado | Estado REAL |
|-------|-------------------|-------------|
| P0-001: Auto-save userId | NO RESUELTO | IMPLEMENTADO (JWT context) |
| P0-005: Password Recovery | NO IMPLEMENTADO | IMPLEMENTADO (completo) |
| P0-006: Change Password | NO IMPLEMENTADO | IMPLEMENTADO (completo) |
| P0-007: Session Management | INCOMPLETO | IMPLEMENTADO (completo) |

### 1.3 Problemas Secundarios

1. **ADR-027 no listado en _MAP.md**: El ADR-027 existe pero no aparece en la lista de ADRs implementados
2. **Duplicaciones**: TRACE-GAP-002 y TRACE-GAP-008 existen en 2 ubicaciones
3. **Conflicto SSOT**: ISSUES-CRITICOS.md (antiguo) vs BACKEND-CRITICAL-ISSUES-PENDING.md (nuevo)

---

## 2. PLAN DE ACCION

### TAREA 1: Corregir BACKEND-CRITICAL-ISSUES-PENDING.md

**Archivo:** `/home/isem/workspace-v2/projects/gamilit/docs/90-transversal/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md`

**Cambios Requeridos:**
1. Cambiar titulo: "Issues Criticos Pendientes" → "Issues Criticos - Estado Actualizado"
2. Actualizar estado de cada issue P0:
   - P0-001: NO RESUELTO → **IMPLEMENTADO** (useExerciseAutoSave.ts usa JWT)
   - P0-005: NO IMPLEMENTADO → **IMPLEMENTADO** (PasswordRecoveryService completo)
   - P0-006: NO IMPLEMENTADO → **IMPLEMENTADO** (changePassword en AuthService)
   - P0-007: INCOMPLETO → **IMPLEMENTADO** (SessionManagementService completo)
3. Agregar seccion "Evidencia de Implementacion" con referencias al codigo
4. Agregar referencia a reportes historicos que confirman implementacion

**Dependencias:**
- Ninguna

**Impacto:**
- Corrige informacion erronea que podria causar trabajo duplicado

---

### TAREA 2: Actualizar _MAP.md de ADRs

**Archivo:** `/home/isem/workspace-v2/projects/gamilit/docs/97-adr/_MAP.md`

**Cambios Requeridos:**
1. Agregar ADR-027 a tabla de "ADRs Implementados"
2. Actualizar contador: 20 → 21 implementados
3. Corregir linea de numeros disponibles: "ADR-027+" → "ADR-028+"
4. Agregar descripcion: "ADR-027: Mapeo de Triggers de Misiones"

**Dependencias:**
- ADR-027 debe existir (verificado)

**Impacto:**
- Navegacion correcta de ADRs
- Desarrolladores encontraran ADR-027

---

### TAREA 3: Eliminar Duplicaciones de Trazas

**Archivos a Eliminar:**
1. `/home/isem/workspace-v2/projects/gamilit/docs/95-guias-desarrollo/student-portal/traces/TRACE-GAP-002.md`
2. `/home/isem/workspace-v2/projects/gamilit/docs/95-guias-desarrollo/student-portal/traces/TRACE-GAP-008.md`

**Archivos a Mantener (SSOT):**
1. `/home/isem/workspace-v2/projects/gamilit/docs/archivados/historicos-2025/trazas/TRACE-GAP-002.md`
2. `/home/isem/workspace-v2/projects/gamilit/docs/archivados/historicos-2025/trazas/TRACE-GAP-008.md`

**Cambios Adicionales:**
1. Actualizar `95-guias-desarrollo/student-portal/_MAP.md` para remover referencias a traces eliminadas
2. Crear referencias cruzadas a ubicacion en archivados

**Dependencias:**
- Verificar que no hay referencias rotas

**Impacto:**
- Elimina confucion sobre cual version es correcta
- Establece SSOT unico para trazas historicas

---

### TAREA 4: Consolidar SSOT de Issues

**Decision SSOT:** `BACKEND-CRITICAL-ISSUES-PENDING.md` sera el documento activo

**Cambios en ISSUES-CRITICOS.md:**
1. Agregar banner al inicio: "DEPRECADO - Ver BACKEND-CRITICAL-ISSUES-PENDING.md para estado actualizado"
2. Agregar fecha de deprecacion
3. Mover a carpeta `archivados/` con sufijo `-deprecated`

**Cambios en _MAP.md de correcciones:**
1. Actualizar referencia a ISSUES-CRITICOS.md → marcar como archivado
2. BACKEND-CRITICAL-ISSUES-PENDING.md como documento principal

**Dependencias:**
- TAREA 1 debe completarse primero

**Impacto:**
- SSOT unico para issues
- Evita confusion sobre cual documento consultar

---

### TAREA 5: Actualizar Referencias Cruzadas

**Archivos a Actualizar:**

1. `/home/isem/workspace-v2/projects/gamilit/docs/90-transversal/_MAP.md`
   - Actualizar referencia a ISSUES-CRITICOS.md
   - Agregar referencia a BACKEND-CRITICAL-ISSUES-PENDING.md

2. `/home/isem/workspace-v2/projects/gamilit/docs/90-transversal/correcciones/_MAP.md`
   - Actualizar lista de archivos
   - Marcar ISSUES-CRITICOS.md como deprecado

3. `/home/isem/workspace-v2/projects/gamilit/docs/archivados/RESUMEN-MIGRACION-CARPETAS-EXCLUIDAS-2025-01-04.md`
   - Agregar nota sobre correccion de issues P0

**Dependencias:**
- TAREAS 1-4 deben completarse primero

---

### TAREA 6: Crear Traza de Correccion

**Archivo a Crear:** `/home/isem/workspace-v2/projects/gamilit/docs/archivados/historicos-2025/trazas/TRACE-CORRECCION-DOCUMENTACION-2025-01-04.md`

**Contenido:**
1. Descripcion del problema identificado
2. Acciones tomadas
3. Archivos modificados
4. Validacion realizada

**Dependencias:**
- TAREAS 1-5 completadas

---

## 3. ORDEN DE EJECUCION

```
FASE 6: Ejecucion

1. TAREA 1: Corregir BACKEND-CRITICAL-ISSUES-PENDING.md
   └── Sin dependencias

2. TAREA 2: Actualizar _MAP.md de ADRs
   └── Sin dependencias

3. TAREA 3: Eliminar Duplicaciones de Trazas
   └── Sin dependencias

4. TAREA 4: Consolidar SSOT de Issues
   └── Depende de: TAREA 1

5. TAREA 5: Actualizar Referencias Cruzadas
   └── Depende de: TAREAS 1, 2, 3, 4

6. TAREA 6: Crear Traza de Correccion
   └── Depende de: TAREAS 1-5
```

---

## 4. CRITERIOS DE VALIDACION (FASE 7)

### 4.1 Verificacion de Contenido

| Archivo | Validacion |
|---------|------------|
| BACKEND-CRITICAL-ISSUES-PENDING.md | Issues P0 marcados como IMPLEMENTADO |
| _MAP.md (ADRs) | ADR-027 aparece en lista |
| ISSUES-CRITICOS.md | Banner de deprecacion presente |
| TRACE-GAP-002/008 en student-portal | Eliminados |
| Referencias cruzadas | Sin enlaces rotos |

### 4.2 Verificacion de Consistencia

1. grep "NO RESUELTO\|NO IMPLEMENTADO" en BACKEND-CRITICAL-ISSUES-PENDING.md = 0 resultados
2. grep "ADR-027" en 97-adr/_MAP.md = 1+ resultados
3. Archivos duplicados eliminados confirmado

### 4.3 Verificacion de Trazabilidad

1. Traza de correccion creada
2. Referencias a evidencia de implementacion presentes
3. SSOT claramente definido

---

## 5. RIESGOS Y MITIGACION

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Referencias rotas | Media | Alto | Buscar referencias antes de eliminar |
| Perdida de informacion | Baja | Alto | Solo eliminar duplicados, mantener SSOT |
| Confucion de desarrolladores | Media | Medio | Agregar banners claros de deprecacion |

---

## 6. ESTIMACION

| Tarea | Tiempo Estimado |
|-------|-----------------|
| TAREA 1 | 15 min |
| TAREA 2 | 10 min |
| TAREA 3 | 15 min |
| TAREA 4 | 10 min |
| TAREA 5 | 15 min |
| TAREA 6 | 10 min |
| **TOTAL** | **75 min** |

---

## 7. APROBACION

**Plan creado:** 2025-01-04
**Autor:** Claude Code (Architecture-Analyst)
**Estado:** Pendiente validacion

---

*Este plan sera ejecutado tras validacion de FASE 4 y refinamiento de FASE 5*
