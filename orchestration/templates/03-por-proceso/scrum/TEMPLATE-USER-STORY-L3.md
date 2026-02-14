# US-{PREFIX}-{EPIC}-{NN}: {Titulo}

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

---

## Instrucciones de Uso

Este template sigue el formato **User Story Level 3 (L3)** estandarizado para ISEM workspace-arch.

### Nomenclatura
- **US-{PREFIX}-{EPIC_NUM}-{SEQ}** donde:
  - `PREFIX` = identificador del proyecto (ej: ERP, CLI, RET)
  - `EPIC_NUM` = numero de epica asociada (ej: 001, 012)
  - `SEQ` = secuencial dentro de la epica (ej: 01, 02, 15)
- Ejemplo: `US-ERP-003-07` = User Story 07 de la Epica 003 del proyecto ERP

### Campos Obligatorios
Todos los campos del encabezado, Descripcion, Criterios de Aceptacion (minimo 1), Notas Tecnicas y Definition of Done son **obligatorios**.

### Campos Opcionales
Flujos Alternativos, Reglas de Negocio, Mockups / Wireframes son opcionales segun el contexto de la historia.

---

**Epica:** EPIC-{PREFIX}-{NNN}
**Modulo(s):** {modulos afectados}
**Story Points:** {N}
**Prioridad:** P{N}
**Sprint:** {sprint asignado o "Backlog"}
**Estado:** {Todo|En Progreso|Review|QA|Done|Blocked}

---

## Descripcion

**Como** {rol/persona}
**Quiero** {capacidad/funcionalidad}
**Para** {beneficio/valor de negocio}

## Criterios de Aceptacion

### CA-1: {Nombre del criterio}
**Given** {precondicion}
**When** {accion del usuario}
**Then** {resultado esperado}
**And** {aserciones adicionales}

### CA-2: {Nombre del criterio}
**Given** {precondicion}
**When** {accion del usuario}
**Then** {resultado esperado}

## Flujo Principal

1. {Paso 1}
2. {Paso 2}
3. {Paso 3}
...

## Flujos Alternativos

- **FA-1: {Nombre}** -- {Descripcion del flujo alternativo}
- **FA-2: {Nombre}** -- {Descripcion del flujo alternativo}

## Reglas de Negocio

- RN-1: {Regla de negocio aplicable}
- RN-2: {Regla de negocio aplicable}

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | {tecnologias involucradas} |
| Entidades BD | {tablas/modelos afectados} |
| Endpoints API | {rutas REST afectadas} |
| Componentes FE | {componentes/paginas afectados} |
| Dependencias | {modulos o US de los que depende} |

## Mockups / Wireframes

{Referencia a disenos si aplica, o "N/A"}

## Definition of Done

- [ ] Codigo implementado segun estandares del proyecto
- [ ] Tests unitarios escritos y pasando (cobertura >= 80%)
- [ ] Tests de integracion pasando
- [ ] Tests e2e pasando (si aplica)
- [ ] Documentacion de API actualizada
- [ ] Code review aprobado
- [ ] Sin deuda tecnica nueva introducida
- [ ] Inventarios actualizados (si se crearon modulos/endpoints nuevos)
- [ ] Trazabilidad registrada en TRACEABILITY.yml del proyecto

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RF-{PREFIX}-{NNN} |
| Diseno | docs/{proyecto}/10-arquitectura/ |
| Epica padre | EPIC-{PREFIX}-{NNN} |
| Tareas hijas | TASK-{PREFIX}-{NNN}-01, TASK-{PREFIX}-{NNN}-02, ... |
| Tests | {paths a archivos de test} |

---

*Formato: US Level 3 (L3) -- Estandar ISEM workspace-arch*
*Nomenclatura: US-{PREFIX}-{EPIC_NUM}-{SEQ} donde PREFIX = proyecto, EPIC_NUM = epica, SEQ = secuencial*
