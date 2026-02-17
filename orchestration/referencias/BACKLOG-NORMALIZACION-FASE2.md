# Backlog - Normalizacion Documental Fase 2

> Expansion de normalizacion fuera del alcance base `docs/` + `orchestration/`.

## Objetivo

Aplicar el mismo modelo (1FN/2FN/3FN, SSOT, mapa->indice->detalle) en documentos relacionados detectados por auditoria global.

## Lotes propuestos

1. `docs/10-requirements/epics/**` (rutas legacy e intercarpetas inconsistentes).
2. `docs/00-overview/migracion/**` (referencias a estructuras no existentes).
3. Referencias historicas largas en `orchestration/referencias/**` que deban redirigir a fuentes segmentadas.

## Criterio de ejecucion

- Ejecutar por lote.
- Auditar enlaces por lote.
- Cerrar lote solo con reporte de integridad en verde.

## Estado de avance

### Lote 1 - `docs/10-requirements/epics/**`

- Estado: **completado**
- Resultado final de remediacion:
  - enlaces rotos iniciales del lote: `~180`
  - enlaces rotos finales del lote: `0`
  - reduccion aproximada: `100%`

#### Acciones ejecutadas

- Reescritura de rutas legacy en espanol a estructura actual (`requirements`, `specifications`, `user-stories`).
- Correccion de rutas de profundidad relativa (`../../` vs `../`) en specs/requirements.
- Creacion de rutas puente para namespaces legacy:
  - `epics/03-desarrollo/**`
  - `epics/04-fase-backlog/**`
  - `epics/features/**`
  - `docs/10-requirements/sistema-recompensas/**`
- Puentes dirigidos para archivos puntuales faltantes (ET/RF legacy y guias).

#### Cierre del lote 1

- Auditoria final en verde (`scripts/audit-epic-links.js`): `0` enlaces rotos.
- Se conservaron rutas legacy mediante archivos puente para evitar regresiones de navegacion.

### Lote 2 - `docs/00-overview/migracion/**`

- Estado: **completado**
- Resultado final de remediacion:
  - enlaces rotos iniciales del lote: `26`
  - enlaces rotos finales del lote: `0`
  - reduccion aproximada: `100%`

#### Acciones ejecutadas

- Normalizacion de `README.md` como indice puente (legacy -> canonico).
- Normalizacion de `README-FASE-5.md` para eliminar referencias a estructuras inexistentes.
- Reemplazo completo de `_MAP-FASE-5.md` por mapa corto orientado a rutas vigentes.
- Alineacion de enlaces a SSOT de inventarios en `orchestration/inventarios/**`.

#### Cierre del lote 2

- Auditoria final en verde (escaneo markdown local del lote): `0` enlaces rotos.
- Se mantuvo trazabilidad historica sin duplicar contenido operativo.

### Lote 3 - `orchestration/referencias/**`

- Estado: **completado**
- Resultado final de remediacion:
  - enlaces rotos iniciales del lote: `9`
  - enlaces rotos finales del lote: `0`
  - reduccion aproximada: `100%`

#### Acciones ejecutadas

- Normalizacion de enlaces en `ESTANDAR-ESTRUCTURA-DOCS.md` hacia rutas canonicas vigentes.
- Correccion de referencia de template hacia `orchestration/templates/04-globales/TEMPLATE-MAP.md`.
- Eliminacion de enlaces de ejemplo no resolubles (se dejaron como texto/codigo).
- Sustitucion de referencia a script inexistente por instruccion generica de validacion documental.

#### Cierre del lote 3

- Auditoria final en verde (escaneo markdown local de `orchestration/referencias`): `0` enlaces rotos.
- Se preservo la funcion normativa del documento sin introducir dependencias inexistentes.

## Fase 3 - Remediacion Global (post auditoria)

### Ola 1 - `docs/80-references/transversal/**`

- Estado: **completado**
- Resultado final de remediacion:
  - enlaces rotos iniciales de la ola: `32`
  - enlaces rotos finales de la ola: `0`
  - reduccion aproximada: `100%`

#### Acciones ejecutadas

- Reescritura de `README.md` como indice canonico corto y sin rutas legacy inexistentes.
- Reescritura de `_MAP.md` para navegacion real sobre contenido existente.
- Correccion de referencias historicas `reportes/` hacia ruta vigente `reports/`.
- Conservacion de enlaces a SSOT (`orchestration/inventarios/**`) y trazas vigentes.

#### Cierre de la ola 1

- Auditoria local del dominio en verde: `BROKEN_TOTAL=0`.

### Ola 2 - `docs/10-requirements/user-stories/_MOVED.md`

- Estado: **completado**
- Resultado final de remediacion:
  - enlaces rotos iniciales de la ola: `28`
  - enlaces rotos finales de la ola: `0`
  - reduccion aproximada: `100%`

#### Acciones ejecutadas

- Reescritura de `_MOVED.md` como puente historico corto.
- Eliminacion de tabla legacy con rutas directas obsoletas por US.
- Enlace a rutas canonicas de navegacion:
  - `epics/_INDEX.md`
  - `epics/_wave-3-technical/EPIC-GAM-BACKEND/_INDEX.md`
  - `epics/_wave-3-technical/EPIC-GAM-FRONTEND/EPIC.md`
- Alineacion del ADR de referencia a `ADR-034-jerarquia-anidada-profunda.md`.

#### Cierre de la ola 2

- Auditoria puntual del archivo en verde: `BROKEN_TOTAL=0`.

### Ola 3 - `docs/60-portals/**`

- Estado: **completado**
- Resultado final de remediacion:
  - enlaces rotos iniciales de la ola: `30`
  - enlaces rotos finales de la ola: `0`
  - reduccion aproximada: `100%`

#### Acciones ejecutadas

- Correccion de referencias legacy en:
  - `PORTAL-STUDENT-GUIDE.md`
  - `PORTAL-TEACHER-GUIDE.md`
  - `PORTAL-ADMIN-GUIDE.md`
  - `student/specs/README.md`
- Reenlace de guias generales a rutas vigentes en `docs/50-guides/**`.
- Reenlace de ADRs desde `97-adr` legacy a `90-adr` actual.
- Sustitucion de referencias inexistentes de API routes por `docs/40-api/README.md`.
- Actualizacion de trazas legacy de student specs a archivos realmente presentes en `specs/traces/`.

#### Cierre de la ola 3

- Auditoria local de `docs/60-portals` en verde: `BROKEN_TOTAL=0`.

### Ola 4 - `docs/50-guides/**`

- Estado: **completado**
- Resultado final de remediacion:
  - enlaces rotos iniciales de la ola: `42`
  - enlaces rotos finales de la ola: `0`
  - reduccion aproximada: `100%`

#### Acciones ejecutadas

- Correccion de rutas relativas en dominios:
  - `backend/` y `backend/impl/**`
  - `frontend/impl/**`
  - `integration/**`
  - `deployment/_archived/**`
  - `testing/**`
- Normalizacion de referencias legacy (`97-adr`, `90-transversal`, `reportes/`) a rutas vigentes.
- Reenlace de referencias cruzadas a fuentes canonicas:
  - `docs/40-standards/**`
  - `docs/40-api/README.md`
  - `docs/60-portals/**`
  - `orchestration/reports/README.md`
  - `orchestration/inventarios/**`
- Ajuste de rutas a code references reales (`apps/frontend/src/apps/teacher/pages/TeacherReviewPanelPage.tsx`).

#### Cierre de la ola 4

- Auditoria local de `docs/50-guides` en verde: `BROKEN_TOTAL=0`.

### Ola 5 - `orchestration/templates/04-globales/**`

- Estado: **completado**
- Resultado final de remediacion:
  - enlaces rotos iniciales de la ola: `66`
  - enlaces rotos finales de la ola: `0`
  - reduccion aproximada: `100%`

#### Acciones ejecutadas

- Alineacion de referencias ADR legacy `ADR-0020` hacia `ADR-034-jerarquia-anidada-profunda.md`.
- Normalizacion de templates para evitar enlaces a placeholders (`{...}`) como links Markdown.
- Conversion de rutas de ejemplo no resolubles a formato de codigo literal.
- Actualizacion de referencias de prompts/directivas a rutas canonicas vigentes en `orchestration/referencias/prompts/**` y `orchestration/agents/perfiles/**`.
- Simplificacion del `TEMPLATE-MAP.md` para usar estructura base navegable sin dependencias legacy inexistentes.

#### Cierre de la ola 5

- Auditoria local de `orchestration/templates/04-globales` en verde: `BROKEN_TOTAL=0`.

## Auditoria Global Final (post Ola 5)

- Fecha: `2026-02-17`
- Scope auditado: `docs/**` + `orchestration/**` (Markdown)
- Resultado:
  - `BROKEN_RAW_TOTAL=44`
  - `BROKEN_FILTERED_TOTAL=44`

### Distribucion de remanentes

- `docs/90-adr/**`: `36` enlaces
- `docs/**` (fuera de ADR): `1` enlace
- `orchestration/**`: `7` enlaces

### Patrones detectados

- Rutas legacy absolutas de entorno anterior (`/home/isem/...`) dentro de ADRs.
- Rutas relativas con profundidad incorrecta desde `docs/90-adr/**` hacia `apps/**` y `orchestration/**`.
- Referencias a archivos legacy renombrados/no existentes (`ADR-000x`, `reportes/`).
- Un bloque de template en `orchestration/templates/03-por-proceso/delegacion/**` con enlaces no canónicos.

### Propuesta de cierre (siguientes olas)

1. **Ola 6:** `docs/90-adr/**` (mayor impacto, 36 enlaces).
2. **Ola 7:** `orchestration/templates/03-por-proceso/delegacion/**` y `orchestration/_definitions/**`.
3. **Ola 8:** remanentes puntuales en `orchestration/reports/tasks/**` y `docs/40-standards/**`.

### Ola 6 - `docs/90-adr/**`

- Estado: **completado**
- Resultado final de remediacion:
  - enlaces rotos iniciales de la ola: `36`
  - enlaces rotos finales de la ola: `0`
  - reduccion aproximada: `100%`

#### Acciones ejecutadas

- Correccion de rutas relativas de ADRs hacia `apps/**` y `orchestration/**`.
- Sustitucion de enlaces absolutos legacy (`/home/isem/...`) por referencias historicas no enlazadas y/o rutas canonicas vigentes.
- Reenlace de referencias de diseno/requisitos a rutas activas en `docs/20-architecture/**` y `docs/10-requirements/**`.
- Actualizacion de referencias legacy `ADR-000x` en `docs/90-adr/README.md` hacia numeracion vigente (`ADR-040`, `ADR-041`, `ADR-042`, `ADR-043`).
- Alineacion de referencias normativas a templates/estandares actuales en `orchestration/templates/**` y `orchestration/referencias/**`.

#### Cierre de la ola 6

- Auditoria local de `docs/90-adr` en verde: `BROKEN_TOTAL=0`.

### Ola 7 - `orchestration/templates/03-por-proceso/delegacion/**` + `orchestration/_definitions/**`

- Estado: **completado**
- Resultado final de remediacion:
  - enlaces rotos iniciales de la ola: `5`
  - enlaces rotos finales de la ola: `0`
  - reduccion aproximada: `100%`

#### Acciones ejecutadas

- Correccion de referencias en `TEMPLATE-CONTEXTO-SUBAGENTE.md` hacia rutas canonicas vigentes:
  - `orchestration/referencias/prompts/PROMPTS-INDEX.md`
  - `orchestration/directivas/simco/SIMCO-SUBAGENTE.md`
  - `orchestration/directivas/simco/SIMCO-NOMENCLATURA.md`
- Correccion de profundidad relativa en `CHECKLIST-SSOT-SYNC.md` para `SIMCO-VALIDACION-SSOT.md`.
- Normalizacion de referencia SSOT en `CAPVED-CYCLE.md` (frontmatter + enlace visible) a ruta relativa valida.

#### Cierre de la ola 7

- Auditoria local del scope en verde: `BROKEN_TOTAL=0`.

### Ola 8 - `orchestration/reports/tasks/**` + `docs/40-standards/**`

- Estado: **completado**
- Resultado final de remediacion:
  - enlaces rotos iniciales de la ola: `3`
  - enlaces rotos finales de la ola: `0`
  - reduccion aproximada: `100%`

#### Acciones ejecutadas

- Normalizacion de referencias historicas no existentes en:
  - `orchestration/reports/tasks/TASK-GAM-INTEGRATION-V2/REPORT-TASK-GAM-INTEGRATION-V2.md`
- Sustitucion de enlace roto por referencia canonica vigente:
  - `docs/40-standards/ESTANDAR-DATABASE-PROFESIONAL.md` -> `orchestration/directivas/simco/SIMCO-DDL.md`

#### Cierre de la ola 8

- Auditoria local del scope en verde: `BROKEN_TOTAL=0`.

## Cierre Global del Plan (Lotes + Olas)

- Fecha de cierre global: `2026-02-17`
- Scope consolidado: `docs/**` + `orchestration/**`
- Resultado final:
  - `BROKEN_GLOBAL_TOTAL=0`
  - Estado del plan: **CERRADO**

### Estado de pendientes del plan

- Lotes 1-3: **completados**
- Olas 1-8: **completadas**
- Pendientes de este plan de normalizacion documental: **ninguno**
