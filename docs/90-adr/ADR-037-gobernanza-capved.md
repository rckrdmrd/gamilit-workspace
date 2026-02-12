# ADR-037: Gobernanza de Tareas con Ciclo CAPVED

**Estado:** Accepted
**Fecha:** 2026-02-11
**Contexto:** Ciclo de vida de tareas en gamilit standalone

## Contexto

En el desarrollo de gamilit (MVP 98% completado, 22 modulos, 152 entities, 850 endpoints), la gestion de tareas presentaba problemas criticos:

1. **Falta de estructura:** Tareas documentadas de forma inconsistente o no documentadas
2. **Trazabilidad perdida:** Imposible rastrear que cambio se hizo, cuando y por que
3. **Fases saltadas:** Se ejecutaba codigo sin analisis ni planificacion previa
4. **Documentacion desactualizada:** Tareas completadas sin actualizar inventarios (DATABASE_INVENTORY.yml, BACKEND_INVENTORY.yml, FRONTEND_INVENTORY.yml)
5. **Scope creep no controlado:** Descubrimientos durante ejecucion no se registraban
6. **Coherencia perdida:** Cambios en DDL sin reflejar en Backend, o Backend sin Frontend

Gamilit necesitaba un sistema de gobernanza que garantizara consistencia, trazabilidad y calidad en todas las tareas.

## Decision

Implementar el **Sistema de Gobernanza de Tareas** basado en el ciclo **CAPVED** obligatorio, con estructura de carpetas estandarizada y checklists de cierre.

### Ciclo CAPVED Obligatorio

```
+-----------------------------------------------------------------------------+
| C - CONTEXTO                                                                 |
| - Vincular tarea a modulo/epic (22 modulos core + educativos)               |
| - Clasificar tipo: feature | fix | refactor | spike | doc-only              |
| - Registrar origen: plan-original | descubrimiento | incidencia             |
| - Cargar documentos SIMCO relevantes (DDL, Backend, Frontend)               |
+-----------------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------+
| A - ANALISIS                                                                 |
| - Comportamiento deseado (perspectiva de producto)                          |
| - Restricciones: seguridad, performance, UX, gamificacion                   |
| - Objetos impactados: BD (170 tablas), Backend (152 entities), Frontend     |
| - Dependencias con otras tareas (bloquea/bloqueada por)                     |
| - Salida: Lista de objetos + dependencias + riesgos                         |
+-----------------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------+
| P - PLANEACION                                                               |
| - Desglose en subtareas por capa: DDL → Backend → Frontend → Tests → Docs  |
| - Orden de ejecucion y dependencias (DDL primero siempre)                   |
| - Criterios de aceptacion por subtarea                                       |
| - Asignacion de perfiles de agente (DDL, Backend, Frontend, Deploy)        |
| - Salida: Plan de ejecucion con subtareas asignadas                         |
+-----------------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------+
| V - VALIDACION (NO DELEGAR - EJECUTAR DIRECTAMENTE)                          |
| - Todo lo detectado en A tiene accion concreta en P?                        |
| - Hay dependencias ocultas sin atender? (coherencia DDL<->Backend)          |
| - Criterios de aceptacion cubren los riesgos?                               |
| - Hay scope creep? → Registrar y crear US derivada                          |
| - GATE: Solo pasa a Ejecucion si todo cuadra                                |
+-----------------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------+
| E - EJECUCION                                                                |
| - Actualizar docs/ del proyecto PRIMERO (si aplica)                         |
| - Ejecutar subtareas en orden: DDL → Backend → Frontend → Tests            |
| - Cada subtarea: codigo + notas + validacion (npm run build && npm run lint)|
| - Registrar progreso y desviaciones                                          |
| - USAR: SIMCO correspondientes (DDL, BACKEND, FRONTEND)                     |
+-----------------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------+
| D - DOCUMENTACION CONTINUA                                                   |
| - Actualizar diagramas y modelos de dominio (si aplica)                     |
| - Actualizar especificaciones tecnicas (BD, APIs, contratos)                |
| - Crear/actualizar ADRs si hubo decisiones arquitectonicas                   |
| - Actualizar inventarios (DATABASE, BACKEND, FRONTEND, MASTER)              |
| - Registrar US derivadas (si se generaron)                                   |
| - GATE: Tarea NO esta Done si documentacion no esta actualizada             |
+-----------------------------------------------------------------------------+
```

### Checklist de Cierre Obligatorio

```markdown
## Gobernanza (BLOQUEANTE)
[ ] Carpeta de tarea existe: orchestration/tareas/TASK-{ID}/
[ ] METADATA.yml completo con fases C, A, P, V, E, D
[ ] orchestration/tareas/_INDEX.yml actualizado

## Validaciones Tecnicas
[ ] Build pasa: cd apps/backend && npm run build
[ ] Lint pasa: cd apps/backend && npm run lint
[ ] Tests pasan: cd apps/backend && npm run test (833 tests)
[ ] Build frontend pasa: cd apps/frontend && npm run build
[ ] Typecheck frontend pasa: cd apps/frontend && npm run typecheck

## Coherencia Entre Capas (CRITICO)
[ ] DDL <-> Backend verificado (170 tablas = 152 entities coherentes)
[ ] Backend <-> Frontend verificado (850 endpoints documentados)
[ ] Si cambio DDL: BD recreada con recreate-database.sh

## Inventarios (SSOT)
[ ] DATABASE_INVENTORY.yml (si cambio BD - schemas, tablas, views)
[ ] BACKEND_INVENTORY.yml (si cambio BE - modules, entities, controllers)
[ ] FRONTEND_INVENTORY.yml (si cambio FE - components, pages, stores)
[ ] MASTER_INVENTORY.yml actualizado

## Trazas
[ ] Traza de tarea actualizada
[ ] PROXIMA-ACCION.md actualizado
```

**SI FALLA CUALQUIER ITEM BLOQUEANTE:** Tarea permanece EN PROGRESO.

### Estructura de Carpetas Estandarizada

```
orchestration/tareas/
  TASK-{YYYY-MM-DD}-{DESCRIPCION}/
    METADATA.yml          # Obligatorio: estado, fases, agentes
    ANALISIS.md           # Fase A documentada
    PLAN.md               # Fase P documentada
    EJECUCION.md          # Fase E: progreso, notas
    archivos/             # Artifacts generados
```

### METADATA.yml Obligatorio

```yaml
task_id: "TASK-2026-02-11-EJEMPLO"
titulo: "Descripcion breve de la tarea"
estado: "en_progreso | completada | bloqueada | cancelada"
fecha_inicio: "2026-02-11"
fecha_fin: null
proyecto: "gamilit"
tipo: "feature | fix | refactor | spike | doc-only"

fases:
  C_contexto:
    completada: true
    fecha: "2026-02-11"
    agente: "CLAUDE-CODE"
  A_analisis:
    completada: true
    fecha: "2026-02-11"
  P_planeacion:
    completada: false
  V_validacion:
    completada: false
  E_ejecucion:
    completada: false
  D_documentacion:
    completada: false

us_derivadas: []
bloqueos: []
```

## Consecuencias

### Positivas

- **Trazabilidad completa:** Cada tarea tiene registro de fecha, fase, cambios
- **Consistencia garantizada:** Todas las tareas siguen mismo formato
- **Scope creep controlado:** Descubrimientos generan US derivadas, no desviaciones
- **Documentacion actualizada:** Gate de cierre exige inventarios al dia (SSOT)
- **Coherencia garantizada:** Checklist fuerza verificacion DDL<->Backend<->Frontend
- **Auditoria facilitada:** orchestration/tareas/_INDEX.yml permite ver estado de todas las tareas

### Negativas

- **Overhead administrativo:** Crear carpeta + METADATA.yml por tarea
  - Mitigacion: Templates automaticos en orchestration/templates/
- **Rigidez para tareas triviales:** Typos requieren estructura completa?
  - Mitigacion: MODE-QUICK solo requiere fases E+D, estructura minima
- **Curva de aprendizaje:** Colaboradores deben conocer estructura y checklists
  - Mitigacion: SIMCO-TAREA.md documenta proceso completo

## Alternativas Consideradas

1. **Sin estructura de carpetas**
   - Rechazada: Imposible rastrear tareas, documentacion dispersa

2. **Solo registro en _INDEX.yml sin carpetas**
   - Rechazada: Insuficiente para tareas complejas, sin espacio para artifacts

3. **CAPVED opcional**
   - Rechazada: Se saltarian fases, coherencia inconsistente

## Implementacion en Gamilit

### Archivos Clave

```
gamilit/
  orchestration/
    directivas/
      principios/
        PRINCIPIO-CAPVED.md           # Definicion del ciclo
      simco/
        SIMCO-TAREA.md                # Proceso detallado
        SIMCO-ESTRUCTURA-TAREAS.md    # Estructura de carpetas
        SIMCO-DDL.md                  # Directiva cambios BD
        SIMCO-BACKEND.md              # Directiva modulos Backend
        SIMCO-FRONTEND.md             # Directiva componentes Frontend
      triggers/
        TRIGGER-CIERRE-TAREA-OBLIGATORIO.md  # Checklist de cierre
        TRIGGER-COHERENCIA-CAPAS.md          # Verificacion DDL<->Backend
    tareas/
      _INDEX.yml                       # Indice maestro
    templates/
      TASK-TEMPLATE/                   # Template de carpeta
```

### Integracion con SAAD

- **MODE-FULL:** Ciclo CAPVED completo, estructura completa
- **MODE-QUICK:** Solo fases E+D, estructura minima
- **MODE-ANALYSIS:** Solo fases C+A+P, sin carpeta de ejecucion

## Referencias

- [ADR-0006 (workspace-arch)](C:\Empresas\ISEM\workspace-arch\docs\90-adr\ADR-0006-gobernanza-tareas.md) - ADR original
- [orchestration/directivas/principios/PRINCIPIO-CAPVED.md](../../orchestration/directivas/principios/PRINCIPIO-CAPVED.md) - Ciclo de vida
- [orchestration/directivas/simco/SIMCO-TAREA.md](../../orchestration/directivas/simco/SIMCO-TAREA.md) - Proceso detallado
- [CLAUDE.md](../../CLAUDE.md) - Seccion CAPVED

---

**Documentado por:** Sistema SIMCO
**Ubicacion:** docs/90-adr/ADR-037-gobernanza-capved.md
