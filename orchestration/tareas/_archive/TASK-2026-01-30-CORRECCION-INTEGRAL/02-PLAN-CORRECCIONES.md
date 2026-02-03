# PLAN DE CORRECCIONES INTEGRAL
## Gamilit - WSL (Backup) vs Windows (Actual)

**Fecha:** 2026-01-30
**Estado:** PROPUESTO - Pendiente Aprobacion
**Metodologia:** CAPVED para cada subtarea
**Principio:** Orden logico, sin dependencias rotas, avance progresivo

---

## RESUMEN EJECUTIVO

**Total Subtareas:** 18 (organizadas en 4 fases)
**Prioridades:** 6 P0 + 8 P1 + 4 P2
**Orden:** Secuencial con paralelismo donde no hay dependencias

---

## ESTRUCTURA DE FASES

```
TASK-2026-01-30-CORRECCION-INTEGRAL
|
+-- FASE 1: ESTABLECER SSOT Y SINCRONIZAR (P0) [6 subtareas]
|   +-- 1.1: Definir Windows como SSOT codigo
|   +-- 1.2: Sincronizar inventarios workspace <- gamilit
|   +-- 1.3: Agregar RC5 a CLAUDE.md workspace
|   +-- 1.4: Actualizar CLAUDE.md local gamilit
|   +-- 1.5: Deprecar V1 CONTEXT-MANAGEMENT
|   +-- 1.6: Verificar coherencia DDL-Backend-Frontend
|
+-- FASE 2: INTEGRAR DOCUMENTACION WSL (P1) [5 subtareas]
|   +-- 2.1: Analizar 87 US adicionales de WSL
|   +-- 2.2: Validar 38 RF adicionales de WSL
|   +-- 2.3: Integrar guias de pruebas M4-M5
|   +-- 2.4: Consolidar _SSOT/ con datos de WSL
|   +-- 2.5: Actualizar TRACEABILITY-MASTER.yml
|
+-- FASE 3: DOCUMENTAR CAMBIOS ARQUITECTONICOS (P1) [4 subtareas]
|   +-- 3.1: Crear ADR eliminacion TeacherResourcesPage
|   +-- 3.2: Crear ADR convencion nombres sin "Page"
|   +-- 3.3: Crear ADR Portal Parent (nuevo)
|   +-- 3.4: Actualizar CHANGELOG.md con refactoring
|
+-- FASE 4: PURGA Y PREVENCION (P2) [3 subtareas]
    +-- 4.1: Purgar documentacion obsoleta
    +-- 4.2: Crear TRIGGER-SYNC-INVENTARIOS automatico
    +-- 4.3: Validacion final y cierre de tarea
```

---

## FASE 1: ESTABLECER SSOT Y SINCRONIZAR (P0)

### SUBTASK-1.1: Definir Windows como SSOT de Codigo

**Prioridad:** P0 - CRITICO
**Dominio:** Gobernanza
**Dependencias:** Ninguna (primera tarea)

**Contexto:**
- No hay SSOT explicito definido
- Agentes no saben donde leer datos actuales
- Causa confusion y regresiones aparentes

**Accion:**
1. Crear documento POLITICA-SSOT-GAMILIT.md
2. Definir jerarquia de fuentes de verdad
3. Establecer reglas de sincronizacion

**Validacion:**
- [ ] POLITICA-SSOT-GAMILIT.md creado
- [ ] Referenciado en BOOTLOADER.md
- [ ] Documentado en PROXIMA-ACCION.md

**Archivos a crear:**
- `orchestration/directivas/politicas/POLITICA-SSOT-GAMILIT.md`

---

### SUBTASK-1.2: Sincronizar Inventarios Workspace <- Gamilit

**Prioridad:** P0 - CRITICO
**Dominio:** Inventarios
**Dependencias:** 1.1

**Contexto:**
- Inventarios workspace 9-11 dias desactualizados
- Gamilit local tiene v5.x.x, workspace tiene v1.x.x

**Accion:**
1. Leer inventarios de gamilit local
2. Actualizar workspace-v2/orchestration/inventarios/:
   - DATABASE_INVENTORY.yml
   - BACKEND_INVENTORY.yml
   - FRONTEND_INVENTORY.yml
   - MASTER_INVENTORY.yml

**Validacion:**
- [ ] Versiones iguales en workspace y gamilit
- [ ] Timestamps actualizados
- [ ] Metricas coinciden

**Archivos a modificar:**
- `workspace-v2/orchestration/inventarios/DATABASE_INVENTORY.yml`
- `workspace-v2/orchestration/inventarios/BACKEND_INVENTORY.yml`
- `workspace-v2/orchestration/inventarios/FRONTEND_INVENTORY.yml`
- `workspace-v2/orchestration/inventarios/MASTER_INVENTORY.yml`

---

### SUBTASK-1.3: Agregar RC5 a CLAUDE.md Workspace

**Prioridad:** P0 - CRITICO
**Dominio:** Configuracion
**Dependencias:** 1.1

**Contexto:**
- Falta regla critica para SSOT de inventarios
- Agentes no saben donde leer datos actuales

**Accion:**
Agregar en CLAUDE.md despues de RC4:

```markdown
### RC5: SSOT DE INVENTARIOS
| Tipo Metrica | SSOT | Referencia |
|--------------|------|------------|
| Proyecto especifico | projects/{p}/orchestration/inventarios/ | SSOT |
| Metricas workspace | workspace-v2/orchestration/inventarios/ | Agregado |

**REGLA:** Para metricas de proyecto especifico, SIEMPRE leer del proyecto local.
```

**Validacion:**
- [ ] RC5 agregada a CLAUDE.md
- [ ] Formato consistente con RC1-RC4

**Archivos a modificar:**
- `workspace-v2/CLAUDE.md`

---

### SUBTASK-1.4: Actualizar CLAUDE.md Local Gamilit

**Prioridad:** P0 - CRITICO
**Dominio:** Configuracion
**Dependencias:** 1.1

**Contexto:**
- CLAUDE.md local tiene metricas desactualizadas
- Muestra 327 componentes cuando hay 458

**Accion:**
Actualizar seccion metricas con valores actuales de inventarios v5.x.x

**Validacion:**
- [ ] Metricas coinciden con inventarios
- [ ] Fecha de actualizacion correcta

**Archivos a modificar:**
- `projects/gamilit/.claude/CLAUDE.md`

---

### SUBTASK-1.5: Deprecar V1 CONTEXT-MANAGEMENT

**Prioridad:** P0
**Dominio:** Directivas
**Dependencias:** Ninguna

**Contexto:**
- Existen 5 archivos sobre context management
- Causa confusion sobre cual usar
- V2 es el recomendado

**Accion:**
1. Agregar bloque DEPRECATED al inicio de SIMCO-CONTEXT-MANAGEMENT.md
2. Verificar que V2 este referenciado como @NEXUS

**Validacion:**
- [ ] V1 marcado como deprecated
- [ ] V2 referenciado en CLAUDE.md

**Archivos a modificar:**
- `workspace-v2/orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT.md`
- `gamilit/orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT.md`

---

### SUBTASK-1.6: Verificar Coherencia DDL-Backend-Frontend

**Prioridad:** P0
**Dominio:** Validacion
**Dependencias:** 1.2

**Contexto:**
- Windows reporta 100% coherencia DDL-Backend
- Necesita validacion post-sincronizacion

**Accion:**
1. Ejecutar validacion de coherencia
2. Verificar que 137/137 entities mapped
3. Documentar resultado

**Validacion:**
- [ ] DDL-Backend: 100%
- [ ] Backend-Frontend: >85%
- [ ] Reporte de coherencia actualizado

---

## FASE 2: INTEGRAR DOCUMENTACION WSL (P1)

### SUBTASK-2.1: Analizar 87 US Adicionales de WSL

**Prioridad:** P1
**Dominio:** Documentacion
**Dependencias:** Fase 1 completada

**Contexto:**
- WSL tiene 225+ US vs Windows 138
- 87 US adicionales pueden ser valiosas

**Accion:**
1. Exportar lista de US de WSL docs/_SSOT/
2. Comparar con Windows docs/_SSOT/
3. Identificar US que faltan o difieren
4. Clasificar: Integrar / Descartar / Modificar

**Validacion:**
- [ ] Lista de US comparada
- [ ] Decision documentada para cada diferencia
- [ ] US valiosas integradas

---

### SUBTASK-2.2: Validar 38 RF Adicionales de WSL

**Prioridad:** P1
**Dominio:** Documentacion
**Dependencias:** Fase 1 completada

**Contexto:**
- WSL tiene 150 RF vs Windows 112
- 38 RF pueden estar documentados pero no integrados

**Accion:**
1. Exportar lista de RF de WSL
2. Comparar con Windows REQUIREMENTS-INDEX.yml
3. Validar cuales estan implementados
4. Integrar los faltantes

**Validacion:**
- [ ] Lista de RF comparada
- [ ] RF implementados validados
- [ ] REQUIREMENTS-INDEX.yml actualizado

---

### SUBTASK-2.3: Integrar Guias de Pruebas M4-M5

**Prioridad:** P1
**Dominio:** Documentacion
**Dependencias:** Ninguna (paralelo)

**Contexto:**
- WSL tiene guias de pruebas completas para M1-M5
- Windows puede tener versiones parciales

**Accion:**
1. Comparar guias de pruebas
2. Integrar ejemplos faltantes
3. Verificar coherencia con mecanicas actuales

**Validacion:**
- [ ] Guias M1-M5 completas en Windows
- [ ] Ejemplos de respuestas actualizados

---

### SUBTASK-2.4: Consolidar _SSOT/ con Datos de WSL

**Prioridad:** P1
**Dominio:** Documentacion
**Dependencias:** 2.1, 2.2

**Contexto:**
- _SSOT/ es la fuente de verdad consolidada
- Debe reflejar estado real integrado

**Accion:**
1. Actualizar TRACEABILITY-MASTER.yml
2. Actualizar EPIC-INDEX.yml
3. Actualizar REQUIREMENTS-INDEX.yml
4. Actualizar CODE-MAPPINGS.yml

**Validacion:**
- [ ] Todos los archivos SSOT actualizados
- [ ] Versiones incrementadas
- [ ] Timestamps correctos

---

### SUBTASK-2.5: Actualizar TRACEABILITY-MASTER.yml

**Prioridad:** P1
**Dominio:** Trazabilidad
**Dependencias:** 2.4

**Contexto:**
- Trazabilidad RF->ET->US->Codigo debe estar completa
- Nuevos RF/US deben mapearse

**Accion:**
1. Agregar nuevos mapeos RF->ET->US
2. Verificar links de codigo
3. Calcular cobertura actualizada

**Validacion:**
- [ ] Cobertura RF >= 95%
- [ ] Todos los RF mapeados a codigo

---

## FASE 3: DOCUMENTAR CAMBIOS ARQUITECTONICOS (P1)

### SUBTASK-3.1: Crear ADR Eliminacion TeacherResourcesPage

**Prioridad:** P1
**Dominio:** ADR
**Dependencias:** Ninguna (paralelo)

**Contexto:**
- TeacherResourcesPage.tsx fue eliminado en commit f55d872b
- Funcionalidad integrada en TeacherContentPage
- No hay ADR documentando la decision

**Accion:**
Crear ADR-030-CONSOLIDACION-TEACHER-RESOURCES.md con:
- Decision: Eliminar pagina separada
- Razon: Funcionalidad integrada en TeacherContentPage
- Consecuencias: Simplificacion de rutas
- Fecha: 2026-01-25
- Commit: f55d872b

**Validacion:**
- [ ] ADR-030 creado
- [ ] Agregado a indice de ADRs
- [ ] Referenciado en CHANGELOG

---

### SUBTASK-3.2: Crear ADR Convencion Nombres sin "Page"

**Prioridad:** P1
**Dominio:** ADR
**Dependencias:** Ninguna (paralelo)

**Contexto:**
- Paginas Teacher renombradas de TeacherXXXPage a TeacherXXX
- Convencion no documentada

**Accion:**
Crear ADR-031-CONVENCION-NOMBRES-PAGINAS.md con:
- Decision: Remover sufijo "Page" de componentes de pagina
- Razon: Simplificacion, el directorio ya indica que es pagina
- Alcance: Todas las paginas de todos los portales

**Validacion:**
- [ ] ADR-031 creado
- [ ] Agregado a indice de ADRs

---

### SUBTASK-3.3: Crear ADR Portal Parent (Nuevo)

**Prioridad:** P1
**Dominio:** ADR
**Dependencias:** Ninguna (paralelo)

**Contexto:**
- Portal Parent es nuevo en Windows (4 archivos)
- No existia en WSL
- Necesita documentacion arquitectonica

**Accion:**
Crear ADR-032-PORTAL-PARENT.md con:
- Decision: Crear portal para padres de familia
- Razon: Extension EXT-011 (parcial 35%)
- Componentes: 4 archivos base
- Roadmap: Q2 2026

**Validacion:**
- [ ] ADR-032 creado
- [ ] Agregado a indice de ADRs

---

### SUBTASK-3.4: Actualizar CHANGELOG.md con Refactoring

**Prioridad:** P1
**Dominio:** Documentacion
**Dependencias:** 3.1, 3.2, 3.3

**Contexto:**
- CHANGELOG debe reflejar cambios arquitectonicos
- Refactoring de Teacher Portal no documentado

**Accion:**
Agregar entrada en CHANGELOG.md version 1.3.0:
- Refactoring Teacher Portal (renombre paginas)
- Eliminacion TeacherResourcesPage
- Nuevo Portal Parent
- Referencias a ADRs

**Validacion:**
- [ ] CHANGELOG actualizado
- [ ] Version incrementada a 1.3.0
- [ ] Referencias a ADRs correctas

---

## FASE 4: PURGA Y PREVENCION (P2)

### SUBTASK-4.1: Purgar Documentacion Obsoleta

**Prioridad:** P2
**Dominio:** Limpieza
**Dependencias:** Fases 1-3 completadas

**Contexto:**
- Existen referencias a fechas antiguas
- Documentacion legacy puede causar confusion

**Accion:**
1. Identificar archivos con referencias a < 2026-01-20
2. Mover a _archive/ si obsoletos
3. Actualizar referencias en documentos activos
4. Limpiar PROXIMA-ACCION.md

**Validacion:**
- [ ] Sin referencias obsoletas en docs activos
- [ ] _archive/ organizado
- [ ] PROXIMA-ACCION.md limpio

---

### SUBTASK-4.2: Crear TRIGGER-SYNC-INVENTARIOS Automatico

**Prioridad:** P2
**Dominio:** Automatizacion
**Dependencias:** Fase 1 completada

**Contexto:**
- Sincronizacion manual es propensa a olvidos
- Necesario mecanismo automatico

**Accion:**
1. Crear TRIGGER-SYNC-INVENTARIOS.md en directivas/triggers/
2. Definir condiciones de activacion
3. Definir acciones automaticas
4. Agregar a CHECKLIST-POST-TASK.md

**Validacion:**
- [ ] TRIGGER creado
- [ ] Documentado en CLAUDE.md
- [ ] Agregado a checklist post-task

---

### SUBTASK-4.3: Validacion Final y Cierre de Tarea

**Prioridad:** P2
**Dominio:** Cierre
**Dependencias:** Todas las fases completadas

**Contexto:**
- Tarea compleja requiere validacion exhaustiva
- Cierre formal con CAPVED Fase D

**Accion:**
1. Ejecutar CHECKLIST-POST-TASK.md
2. Verificar todos los criterios de exito
3. Documentar lecciones aprendidas
4. Actualizar _INDEX.yml de tareas
5. Commit y push final

**Validacion:**
- [ ] Todos los criterios de exito cumplidos
- [ ] Documentacion completa
- [ ] Git status limpio
- [ ] Push exitoso

---

## DIAGRAMA DE DEPENDENCIAS

```
FASE 1 (P0) - SECUENCIAL CON PARALELO
=====================================
1.1 ──> 1.2 ──> 1.6
    └──> 1.3
    └──> 1.4
1.5 (paralelo, sin dependencias)

FASE 2 (P1) - PARALELO DESPUES DE FASE 1
========================================
Fase 1 ──> 2.1 ──┐
           2.2 ──┼──> 2.4 ──> 2.5
           2.3 ──┘

FASE 3 (P1) - PARALELO
======================
3.1 ──┐
3.2 ──┼──> 3.4
3.3 ──┘

FASE 4 (P2) - SECUENCIAL DESPUES DE TODO
========================================
Fases 1-3 ──> 4.1 ──> 4.2 ──> 4.3
```

---

## ORDEN DE EJECUCION SUGERIDO

### Batch 1 (Paralelo - P0)
- 1.1: Definir SSOT
- 1.5: Deprecar V1

### Batch 2 (Secuencial - P0)
- 1.2: Sincronizar inventarios
- 1.3: RC5 en CLAUDE.md workspace
- 1.4: Actualizar CLAUDE.md gamilit
- 1.6: Verificar coherencia

### Batch 3 (Paralelo - P1)
- 2.1: Analizar US adicionales
- 2.2: Validar RF adicionales
- 2.3: Guias de pruebas
- 3.1: ADR TeacherResourcesPage
- 3.2: ADR convencion nombres
- 3.3: ADR Portal Parent

### Batch 4 (Secuencial - P1)
- 2.4: Consolidar _SSOT/
- 2.5: TRACEABILITY-MASTER
- 3.4: CHANGELOG

### Batch 5 (Secuencial - P2)
- 4.1: Purgar obsoletos
- 4.2: TRIGGER automatico
- 4.3: Validacion final

---

## CRITERIOS DE EXITO

1. **SSOT establecido:** Windows es fuente de verdad para codigo
2. **Inventarios sincronizados:** Workspace = Gamilit local
3. **RC5 agregada:** Regla critica documentada
4. **Directivas consolidadas:** V1 deprecated, V2 oficial
5. **Documentacion integrada:** US/RF de WSL evaluados
6. **ADRs creados:** 3 nuevos (030, 031, 032)
7. **CHANGELOG actualizado:** Refactoring documentado
8. **Trigger creado:** Prevencion automatica
9. **Sin obsoletos:** Documentacion limpia
10. **Git limpio:** Commits y push exitosos

---

*Generado por Claude Code Opus 4.5*
*Sistema SIMCO v4.3.0 + CAPVED*
*Fecha: 2026-01-30*
