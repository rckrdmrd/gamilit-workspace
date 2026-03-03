---
name: SIMCO-SESSION-LEARNING-PIPELINE
version: "1.0.0"
date: "2026-03-03"
alias: "@SESSION_LEARNING"
sistema: "SIMCO v4.0.0"
tipo: "Directiva de Gobernanza"
criticidad: RECOMENDADA
aplica_a: "Agente principal al cerrar sesion. Revision periodica cada 5 sesiones."
depende_de:
  - SIMCO-ESTANDARES.md
  - SIMCO-DOCUMENTAR.md
  - SIMCO-TAREA.md
---

# SIMCO-SESSION-LEARNING-PIPELINE

**Sistema:** SIMCO v4.0.0 | **Version:** 1.0.0 | **Fecha:** 2026-03-03

---

## 0. Proposito

Esta directiva define como el conocimiento generado en sesiones individuales fluye hacia la gobernanza permanente del proyecto. El pipeline es: **Session → MEMORY.md → Review → Governance Update**.

Aborda el problema del "tribal knowledge": el proyecto gamilit tiene mas de 15 sesiones de patrones probados que existen unicamente en MEMORY.md y no han sido promovidos a directivas, estandares o ADRs donde puedan ser consultados de forma sistematica.

Principio fundamental: **MEMORY.md es memoria de trabajo efimera**. Los archivos de gobernanza (`orchestration/directivas/`, `docs/40-standards/`, `docs/90-adr/`, `CLAUDE.md`) son la **memoria institucional permanente**. Un patron que solo vive en MEMORY.md puede perderse o ignorarse. Un patron en una directiva SIMCO es obligatorio y auditable.

El objetivo de este pipeline es asegurar que cada sesion contribuya a la mejora estructural del sistema de gobernanza, no solo a resolver la tarea inmediata.

---

## 1. Etapas del Pipeline

El flujo completo desde el cierre de sesion hasta la promocion de conocimiento:

```
SESSION ENDS
     |
     v
STAGE 1: CAPTURE
  Agente escribe entrada en MEMORY.md usando template de seccion 2.
  Incluye: scope, problemas+soluciones, patrones descubiertos, metricas, deferred items.
     |
     v
STAGE 2: ACCUMULATE
  Entradas se acumulan a traves de sesiones.
  Cada patron observado incrementa su contador implicito de apariciones.
  MEMORY.md actua como buffer de observaciones raw.
     |
     v
STAGE 3: REVIEW TRIGGER
  Se evalua si algun trigger de la seccion 4 se activa.
  Si NINGUN trigger: pipeline termina (MEMORY.md es suficiente por ahora).
  Si ALGUN trigger: continuar a Stage 4.
     |
     v
STAGE 4: EXTRACT & PROMOTE
  Aplicar criterios de seccion 3.
  Extraer patron → crear/actualizar directiva / estandar / ADR / CLAUDE.md.
  Actualizar MEMORY.md con referencia de una linea (ver seccion 5, Step 4).
  Cerrar el ciclo: el conocimiento ahora vive en gobernanza permanente.
```

Tiempo estimado Stage 4: 15-30 minutos en modo ANALYSIS (C+A de CAPVED). No requiere subagentes.

---

## 2. Que Capturar en MEMORY.md

Cada entrada de sesion debe seguir este template. El objetivo es capturar suficiente contexto para que Stage 4 pueda ejecutarse sin releer todos los archivos modificados.

```markdown
## Session: {Task-ID} ({YYYY-MM-DD})

### Scope
- Files modified: N code + M doc
- Subagents: N (X Opus + Y Sonnet + Z Haiku)
- Build: 0 errors

### Problems Encountered & Solutions
- [Nombre del problema]: [Solucion aplicada, una linea]
- [Nombre del problema]: [Solucion aplicada, una linea]

### Patterns Discovered
- [Nombre del patron]: [Descripcion de por que funciona]
- [Nombre del patron]: [Descripcion de por que funciona]

### Metrics Changed
- MASTER_INVENTORY: vX.Y.Z → vX.Y.W
- [Inventario]: vA.B.C → vA.B.D

### Out of Scope (deferred)
- [Item diferido]: razon por la que no se abordó
```

**Reglas de captura:**
- Seccion "Problems Encountered" es obligatoria si el agente encontro algun bloqueo, error de build, o decision no obvia.
- Seccion "Patterns Discovered" puede estar vacia si la sesion fue puramente mecanica (e.g., seed correction con instrucciones exactas).
- Seccion "Out of Scope" es obligatoria — documenta deuda tecnica explicitamente para que no se pierda.
- Entradas deben ser concisas. El limite del sistema es 200 lineas. Cuando MEMORY.md se acerque al limite, las entradas mas antiguas se resumen en una linea o se extraen a gobernanza (Stage 4).

**Nota sobre el limite de 200 lineas:** MEMORY.md tiene un limite de sistema de 200 lineas de carga. Cuando el archivo supere este limite, las entradas mas antiguas deben ser condensadas. Si el patron en esas entradas es valioso, debe ser promovido antes de condensar (Stage 4 primero, luego condensar).

---

## 3. Criterios de Escalamiento — Cuando Promover

La siguiente tabla define cuando una observacion en MEMORY.md debe ser promovida a gobernanza permanente:

| Trigger de Promocion | Accion Requerida | Destino | Ejemplo Real del Proyecto |
|---|---|---|---|
| Patron repetido en 3+ sesiones | Crear nueva directiva SIMCO | `orchestration/directivas/simco/` | Patron orquestador carga _INDEX no archivos completos (15+ sesiones) |
| Clase de bug con misma causa raiz en 2+ sesiones | Crear o actualizar estandar | `docs/40-standards/` | Dual-store sync (React Query + Zustand) — 2 sesiones |
| Paso de workflow faltante en directiva existente | Actualizar directiva existente | Buscar en SIMCO y enmendar seccion | GAP en POST-TASK-SYNC detectado en 10+ sesiones |
| Decision de arquitectura implicita en 2+ sesiones | Crear ADR | `docs/90-adr/` | ADR-051 Vision Lectora — decision frontend-only no documentada |
| Metrica cambiada permanentemente | Actualizar CLAUDE.md + inventarios | MASTER_INVENTORY + CLAUDE.md | mecanicas 30→29 propagado en 11+ archivos (1 sesion, pero cambio permanente) |
| MEMORY.md supera 200 lineas | Ejecutar revision completa del pipeline | Todo lo anterior segun aplique | Cada ~5 sesiones |

**Excepcion critica:** Para bugs de categoria CRITICO (fallo de build, perdida de datos, brecha de seguridad), la promocion ocurre en la misma sesion donde se detecta y resuelve, independientemente del conteo de apariciones. Un bug critico resuelto una vez tiene valor de directiva inmediata.

**Regla del 70%:** Antes de crear un archivo nuevo, verificar si existe uno con >=70% solapamiento de contenido. Si existe, actualizar el existente. Esto aplica tanto a directivas como a estandares.

---

## 4. Cadencia de Revision

La revision del pipeline se dispara cuando cualquiera de los siguientes triggers se activa:

```yaml
triggers_de_revision:
  session_count:
    descripcion: "Cada 5 sesiones completadas"
    evaluacion: "Contar entradas ## Session en MEMORY.md"
    accion: "Ejecutar Stage 4 del pipeline"

  memory_size:
    descripcion: "MEMORY.md supera 200 lineas"
    evaluacion: "Contar lineas del archivo"
    accion: "Ejecutar Stage 4 + condensar entradas antiguas"

  pattern_threshold:
    descripcion: "El mismo patron aparece por tercera vez en MEMORY.md"
    evaluacion: "Buscar repeticiones de patron en entradas existentes"
    accion: "Promocion inmediata del patron a directiva"

  critical_bug:
    descripcion: "Bug CRITICO detectado y resuelto en sesion actual"
    evaluacion: "Categoria del bug segun SIMCO-TAREA"
    accion: "Crear directiva o estandar en sesion actual antes de cerrar"

  explicit_request:
    descripcion: "Usuario solicita revision del pipeline explicitamente"
    evaluacion: "No requiere evaluacion automatica"
    accion: "Ejecutar Stage 4 completo"
```

**Quien ejecuta la revision:** El agente orquestador principal en modo ANALYSIS (fases C+A de CAPVED unicamente). No requiere subagentes — es una tarea de lectura y escritura de baja complejidad.

**Cuanto tiempo toma:** 15-30 minutos. Si la revision requiere mas de 30 minutos, significa que hay demasiado conocimiento acumulado sin promover. Esto indica que la cadencia de 5 sesiones no se ha respetado.

**Resultado de la revision:** Al menos un archivo de gobernanza creado o actualizado, y MEMORY.md reducido con referencias de una linea para los patrones promovidos.

---

## 5. Template de Extraccion de Patrones

El proceso de promover un patron de MEMORY.md a gobernanza permanente sigue 4 pasos:

### Step 1: Identificar el tipo de patron

Clasificar el patron segun su naturaleza para determinar el destino correcto:

| Tipo de Patron | Destino | Indicador |
|---|---|---|
| **Workflow** — secuencia de pasos que el agente debe seguir | Nueva directiva SIMCO en `orchestration/directivas/simco/` | "El agente siempre hace X antes de Y" |
| **Standard** — regla de calidad para codigo o documentacion | Nuevo estandar en `docs/40-standards/ESTANDAR-{DOMINIO}.md` | "El codigo/doc debe cumplir propiedad Z" |
| **Decision** — eleccion de arquitectura con alternativas evaluadas | Nuevo ADR en `docs/90-adr/ADR-{N}-{nombre}.md` | "Elegimos A sobre B porque..." |
| **Metric** — numero que cambio permanentemente en el sistema | Actualizar `CLAUDE.md` + `MASTER_INVENTORY.yml` | "El sistema ahora tiene N de X" |

### Step 2: Encontrar el archivo destino

Para directivas SIMCO: leer `orchestration/directivas/simco/` y buscar archivo con titulo relacionado.
Para estandares: leer `docs/40-standards/_INDEX.md` y buscar estandar con dominio relacionado.
Para ADRs: leer `docs/90-adr/_INDEX.md` para obtener el siguiente numero correlativo.

Aplicar regla del 70%: si existe un archivo con >=70% solapamiento tematico, ACTUALIZAR ese archivo (agregar seccion nueva). Solo si no existe match, CREAR archivo nuevo.

### Step 3: Escribir la entrada de promocion

Usar este template para agregar el patron al archivo destino:

```markdown
### [Seccion N]: [Nombre del Patron]

**Origen:** Observado en [N] sesiones: {task-id-1}, {task-id-2}, {task-id-3}
**Problema resuelto:** {Una oracion que describe el problema que este patron evita}

{Contenido del patron en el formato de la directiva o estandar destino}

**Anti-patron:** {Que ocurre si este patron NO se sigue — consecuencia concreta}
```

El campo "Origen" es obligatorio. Proporciona trazabilidad: cualquier agente puede ir a MEMORY.md o a los reports de las tareas mencionadas para ver el contexto original.

### Step 4: Actualizar MEMORY.md despues de la promocion

Una vez promovido el patron, reemplazar la entrada completa en MEMORY.md con una referencia de una linea:

```markdown
[Nombre del patron]: Promovido a @{ALIAS} seccion {N} el {YYYY-MM-DD}
```

Ejemplo real: `Dual-store sync pattern: Promovido a ESTANDAR-FRONTEND-DUAL-STORE.md seccion 3 el 2026-03-10`

Esto mantiene MEMORY.md dentro del limite de 200 lineas y crea un rastro de auditoria de que fue promovido y cuando.

---

## 6. Ejemplos Reales del Proyecto

Los siguientes patrones existen actualmente en MEMORY.md del proyecto gamilit y son candidatos para promocion en la proxima revision del pipeline:

| Patron en MEMORY.md | Sesiones Observadas | Estado Actual | Destino Recomendado |
|---|---|---|---|
| Orquestador carga `_INDEX.md` en lugar de archivos completos para preservar contexto | 15+ sesiones | Solo en MEMORY.md | Crear `SIMCO-ORCHESTRATOR-PATTERN.md` — directiva de uso de contexto para agente principal |
| POST-TASK-SYNC disperso en 3 checklists diferentes sin fuente unica de verdad | 10+ sesiones | Solo en MEMORY.md | Crear `SIMCO-POST-TASK-SYNC.md` con checklist unificado y orden de operaciones |
| Dual-store sync: React Query (header) + Zustand (shop) requieren sincronizacion explicita via WebSocket + mount fetch | 2 sesiones (ML Coins fix, Shop fix) | Solo en MEMORY.md | Crear `ESTANDAR-FRONTEND-DUAL-STORE.md` cuando aparezca por tercera vez |
| Patron de modal responsive: `max-h-[calc(100vh-120px)] overflow-y-auto` en content div, NO en Modal.tsx base | 1 sesion, 22 modales afectados | Ya promovido a `ESTANDAR-FRONTEND-MODAL-RESPONSIVE.md` | Completado — ejemplo de patron promovido correctamente |
| Metrica mecanicas 30→29 requirio correccion en 11+ archivos de documentacion | 1 sesion | Corregido en codigo y docs | Promover regla "tolerancia 0% en metricas" a seccion 5 de `SIMCO-POST-TASK-SYNC.md` |
| Subagentes en worktree isolation pierden edits — sus cambios no persisten al directorio principal | 1 sesion (Modal Responsive) | Solo en MEMORY.md | Agregar advertencia a `SIMCO-TAREA.md` seccion de subagentes |

La columna "Sesiones Observadas" es el indicador principal para priorizar. Patrones con 10+ sesiones tienen el mayor ROI de promocion: cada sesion futura se beneficia de la directiva.

---

## 7. Anti-Patrones

Los siguientes anti-patrones degradan la calidad del pipeline y deben evitarse:

```yaml
anti_patrones:

  1_single_session_directive:
    nombre: "Directiva de Una Sola Sesion"
    descripcion: "Crear una directiva SIMCO nueva basada en la experiencia de una unica sesion"
    consecuencia: "Directiva prematura. El patron puede ser un caso especifico, no una regla general."
    excepcion: "Bugs CRITICOS (build failure, data loss, security breach) justifican promocion inmediata"
    regla: "Esperar minimo 2-3 observaciones antes de crear directiva nueva (excepto CRITICO)"

  2_copy_memory_to_directive:
    nombre: "Copiar MEMORY.md a Directiva"
    descripcion: "Tomar el texto narrativo de MEMORY.md y pegarlo directamente en una directiva SIMCO"
    consecuencia: "Directiva con formato de log de sesion, no de instruccion normativa. Dificil de seguir."
    regla: "Extraer el PATRON (regla abstracta), no la NARRATIVA (historia de que paso)"

  3_never_reviewing:
    nombre: "No Revisar MEMORY.md"
    descripcion: "Dejar que MEMORY.md crezca indefinidamente sin ejecutar el pipeline de promocion"
    consecuencia: "Conocimiento institutcional atrapado en memoria efimera. Patrones valiosos se pierden al rotar contexto."
    regla: "Revision obligatoria cada 5 sesiones o cuando MEMORY.md supere 200 lineas"

  4_directive_without_example:
    nombre: "Directiva Sin Ejemplo Real"
    descripcion: "Crear una directiva abstracta sin incluir al menos un ejemplo concreto del proyecto gamilit"
    consecuencia: "Directiva teorica que los agentes no saben aplicar. Alta probabilidad de ser ignorada."
    regla: "Toda directiva nueva debe incluir >= 1 ejemplo de aplicacion real en gamilit (seccion 'Ejemplos Reales' o equivalente)"

  5_forgetting_memory_update:
    nombre: "Olvidar Actualizar MEMORY.md Post-Promocion"
    descripcion: "Promover un patron a gobernanza permanente pero dejar la entrada completa en MEMORY.md"
    consecuencia: "MEMORY.md crece innecesariamente. El mismo patron puede ser 'descubierto' de nuevo en sesiones futuras."
    regla: "Inmediatamente despues de cada promocion, reemplazar entrada en MEMORY.md con referencia de una linea (Step 4 de seccion 5)"
```

---

## 8. Integracion con Fase D de CAPVED

Esta directiva se integra con el ciclo CAPVED de SIMCO-TAREA en la fase de Documentacion (D):

**D.7 "Registrar lecciones aprendidas"** es el punto de entrada al Stage 1 (CAPTURE) del pipeline. Al ejecutar D.7, el agente debe escribir la entrada de MEMORY.md usando el template de seccion 2 de esta directiva.

Al cerrar una sesion, el agente sigue esta secuencia:

```
1. Completar tarea (fases C+A+P+V de CAPVED)
2. Ejecutar Fase D completa:
   D.1: Actualizar inventarios
   D.2: Actualizar docs de arquitectura
   D.3: Actualizar _INDEX files
   D.4: Sincronizar CLAUDE.md si metricas cambiaron
   D.5: Commit con formato [GAM-XXX] desc
   D.6: Verificar git status = working tree clean
   D.7: Escribir entrada en MEMORY.md (Stage 1 del pipeline)
3. Evaluar triggers de revision (seccion 4 de esta directiva)
4. Si algun trigger se activa:
   - Ejecutar Stage 4 del pipeline (Extract & Promote)
   - Modo ANALYSIS (C+A de CAPVED, sin subagentes)
   - Resultado: >= 1 archivo de gobernanza creado/actualizado
   - Actualizar MEMORY.md con referencias de una linea
5. Si ningun trigger se activa:
   - Pipeline termina. MEMORY.md es suficiente hasta la proxima revision.
```

**Importante:** Stage 4 es una tarea separada del commit principal. No mezclar commits de feature/fix con commits de actualizacion de gobernanza. El commit de gobernanza debe tener prefijo `[SIMCO]` o `[DOCS]` para distinguirlo en el historial de git.

---

## 9. Referencias

| Archivo | Alias | Relacion con esta Directiva |
|---|---|---|
| `orchestration/directivas/simco/SIMCO-ESTANDARES.md` | `@SIMCO` | Catalogo de estandares activos — destino principal para patrones tipo Standard |
| `orchestration/directivas/simco/SIMCO-DOCUMENTAR.md` | `@SIMCO` | Reglas de documentacion — complementa Stage 1 (como escribir en MEMORY.md) |
| `orchestration/directivas/simco/SIMCO-TAREA.md` | `@SIMCO` | Ciclo CAPVED — Fase D.7 es el trigger de Stage 1 del pipeline |
| `docs/90-adr/_INDEX.md` | `@ADRS` | Indice de ADRs — consultar para numero correlativo antes de crear ADR nuevo |
| `orchestration/PROXIMA-ACCION.md` | `@PROXIMA-ACCION` | Estado de sesion — registrar si Stage 4 quedo pendiente para proxima sesion |
| `C:/Users/cx_ad/.claude/projects/C--Empresas-ISEM-gamilit-workspace/memory/MEMORY.md` | `MEMORY.md` | Buffer de captura (Stage 1 y 2) — limite 200 lineas del sistema |

**Nota sobre MEMORY.md:** La ruta completa es necesaria porque es un archivo del sistema Claude, no del repositorio gamilit. No esta bajo control de version git. Su contenido es visible para el agente pero no se puede modificar directamente desde el repositorio — se actualiza a traves del mecanismo de memoria del agente.
