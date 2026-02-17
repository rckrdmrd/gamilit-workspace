# TEMPLATE: USER STORY ANIDADA (Enriquecida)

**Version:** 1.0.0
**Fecha:** 2026-02-09
**Uso:** Definicion de User Story con contenido enriquecido y seccion de tareas
**Ubicacion destino:** `projects/{p}/docs/10-requirements/epics/EPIC-{ID}/US-{ID}/US-{ID}.md`
**ADR:** [ADR-034](../../../docs/90-adr/ADR-034-jerarquia-anidada-profunda.md)

---

# US-{ID}: {Titulo}

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-{ID} |
| **Modulo** | {nombre-modulo} |
| **Epic** | EPIC-{ID} |
| **Prioridad** | P0 / P1 / P2 / P3 |
| **Story Points** | {SP} |
| **Estado** | pendiente / en-progreso / completada |
| **Tipo** | feature / enhancement / fix / refactor |

---

## Historia de Usuario

Como {rol de usuario}
quiero {accion deseada}
para {beneficio/valor de negocio}

---

## Descripcion Detallada

{Descripcion rica del modulo/funcionalidad. Que problema resuelve, por que es importante,
como se integra con el resto del sistema. 3-5 parrafos.}

---

## Alcance

### Incluido
- {funcionalidad 1}
- {funcionalidad 2}
- {funcionalidad 3}

### Excluido
- {funcionalidad excluida 1} — {razon / fase posterior}
- {funcionalidad excluida 2}

---

## Criterios de Aceptacion

### CA-1: {Titulo del escenario}
- **Given** {precondicion}
- **When** {accion}
- **Then** {resultado esperado}

### CA-2: {Titulo del escenario}
- **Given** {precondicion}
- **When** {accion}
- **Then** {resultado esperado}

{Repetir para cada criterio. Minimo 3 CA por US.}

---

## Modelo de Datos

### Tablas Afectadas

| Schema | Tabla | Accion | Descripcion |
|--------|-------|--------|-------------|
| {schema} | {tabla} | crear/modificar | {descripcion} |

### Campos Principales

| Tabla | Campo | Tipo | Nullable | Descripcion |
|-------|-------|------|----------|-------------|
| {tabla} | {campo} | {tipo} | SI/NO | {descripcion} |

---

## Endpoints API

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/{recurso} | {descripcion} | JWT |
| POST | /api/v1/{recurso} | {descripcion} | JWT + Role |

---

## Flujos de Usuario

### Flujo Principal
```
1. {paso 1}
2. {paso 2}
3. {paso 3}
```

### Flujo Alternativo (si aplica)
```
1. {paso 1}
2. {paso alternativo}
```

---

## Notas Tecnicas

- {nota tecnica 1}
- {nota tecnica 2}
- {consideraciones de seguridad}
- {consideraciones de performance}

---

## Dependencias

### Depende de
| US/Modulo | Razon |
|-----------|-------|
| {US-ID / SAAS-NNN} | {por que depende} |

### Bloquea a
| US/Modulo | Razon |
|-----------|-------|
| {US-ID / SAAS-NNN} | {por que bloquea} |

---

## Tareas

| # | Task ID | Titulo | Capa | SP | Carpeta |
|---|---------|--------|------|----|---------|
| 1 | TASK-{MODULE}-{NNN}-F0-DATABASE | {titulo} | DATABASE | {SP} | `./TASK-{MODULE}-{NNN}-F0-DATABASE/` |
| 2 | TASK-{MODULE}-{NNN}-F1-BACKEND | {titulo} | BACKEND | {SP} | `./TASK-{MODULE}-{NNN}-F1-BACKEND/` |
| 3 | TASK-{MODULE}-{NNN}-F2-FRONTEND | {titulo} | FRONTEND | {SP} | `./TASK-{MODULE}-{NNN}-F2-FRONTEND/` |
| 4 | TASK-{MODULE}-{NNN}-F4-TEST | {titulo} | TEST | {SP} | `./TASK-{MODULE}-{NNN}-F4-TEST/` |

### Orden de Ejecucion
```
TASK-{MODULE}-{NNN}-F0-DATABASE → F1-BACKEND → F2-FRONTEND → F4-TEST
```

---

*Template: TEMPLATE-US-ANIDADA.md v2.0.0*
*Sistema: SIMCO v4.0.0 + CAPVED*
*ADR: ADR-0020 (DEC-ANID-009/012)*
