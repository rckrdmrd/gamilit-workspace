# SIMCO-DOCUMENTACION-PROYECTO
**Version:** 1.0.0
**Tipo:** Directiva Operacional
**Prioridad:** P0
**Alias:** @DOC_PROYECTO
**Creado:** 2026-01-10
**Hereda:** PRINCIPIO-DOC-PRIMERO.md

---

## 1. Proposito y Alcance

Esta directiva establece el estandar base para la documentacion de proyectos en el workspace. Define la estructura obligatoria de directorios, archivos minimos requeridos y convenciones de actualizacion.

**Aplica a:** Todos los proyectos en workspace-v2

---

## 2. Principios Fundamentales

### 2.1 Documentar Antes de Implementar
Siguiendo @DOC-PRIMERO, toda funcionalidad debe documentarse antes de su implementacion.

### 2.2 Una Sola Fuente de Verdad (SSOT)
Los inventarios YAML son la fuente canonica de estado del proyecto.

### 2.3 Estructura Predecible
Todos los proyectos siguen la misma estructura base para facilitar navegacion.

### 2.4 Trazabilidad Completa
Cada documento debe tener ID unico y referencias cruzadas funcionales.

---

## 3. Estructura Obligatoria de /docs

```
docs/
├── _MAP.md                    [OBLIGATORIO] Indice navegable
├── README.md                  [OBLIGATORIO] Introduccion al proyecto
├── 00-vision-general/         [OBLIGATORIO] Vision y estrategia
│   ├── VISION-*.md
│   └── ARQUITECTURA-*.md
├── 01-fase-{nombre}/          [POR FASE] Una carpeta por fase
│   ├── _MAP.md                [OBLIGATORIO en cada fase]
│   ├── requerimientos/
│   ├── especificaciones/
│   └── historias-usuario/
├── 02-fase-{nombre}/
├── ...
├── 90-transversal/            [OPCIONAL] Contenido compartido entre fases
├── 95-guias-desarrollo/       [OPCIONAL] Guias tecnicas
├── 96-quick-reference/        [OPCIONAL] Referencias rapidas
├── 97-adr/                    [SI APLICA] Decisiones arquitectonicas
│   └── ADR-{NNN}-{desc}.md
└── 99-finiquito/              [OPCIONAL] Documentacion de cierre
```

---

## 4. Estructura Obligatoria de /orchestration

```
orchestration/
├── 00-guidelines/             [OBLIGATORIO]
│   ├── PROJECT-CONTEXT.md   [OBLIGATORIO] Variables del proyecto
│   └── HERENCIA-SIMCO.md      [OBLIGATORIO] Directivas heredadas
├── analisis/                  [RECOMENDADO] Documentos de analisis
│   ├── ANALISIS-*.md
│   ├── PLAN-*.md
│   └── VALIDACION-*.md
├── inventarios/               [OBLIGATORIO]
│   ├── MASTER_INVENTORY.yml   [OBLIGATORIO]
│   ├── DATABASE_INVENTORY.yml [SI APLICA]
│   ├── BACKEND_INVENTORY.yml  [SI APLICA]
│   └── FRONTEND_INVENTORY.yml [SI APLICA]
├── reportes/                  [RECOMENDADO]
│   └── REPORTE-*.md
├── trazas/                    [OPCIONAL]
│   └── TRAZA-*.md
├── CONTEXT-MAP.yml            [OBLIGATORIO] Mapeo de contexto
├── PROJECT-STATUS.md          [OBLIGATORIO] Estado actual
├── PROXIMA-ACCION.md          [RECOMENDADO] Siguiente paso
└── README.md                  [OBLIGATORIO] Descripcion de orchestration
```

---

## 5. Archivos Minimos Requeridos

### Por Tipo de Proyecto

| Archivo | Standalone | Suite | Suite-Core | Vertical |
|---------|------------|-------|------------|----------|
| docs/_MAP.md | SI | SI | SI | SI |
| docs/README.md | SI | SI | SI | SI |
| docs/00-vision-general/ | SI | SI | SI | OPCIONAL |
| orchestration/PROJECT-CONTEXT.md | SI | SI | SI | SI |
| orchestration/HERENCIA-SIMCO.md | SI | SI | SI | SI |
| orchestration/inventarios/MASTER_INVENTORY.yml | SI | SI | SI | SI |
| orchestration/CONTEXT-MAP.yml | SI | SI | SI | SI |
| orchestration/PROJECT-STATUS.md | SI | SI | SI | SI |

---

## 6. API Versioning

### 6.1 Estandar de Versionado

Las APIs REST deben seguir el patron de versionado:

```
/api/v{N}/{recurso}

Ejemplos:
/api/v1/users
/api/v2/products
```

### 6.2 Reglas de Versionado

1. **Major Version (v1 → v2):** Cambios breaking
2. **Endpoint Deprecation:** Documentar en ADR
3. **Header Version:** Soportar `Accept-Version` header como alternativa
4. **Documentacion:** Cada version debe tener su especificacion OpenAPI

---

## 7. Ciclo de Vida de Documentos

```
┌─────────────┐     ┌──────────┐     ┌────────────┐
│  Creacion   │ --> │ Revision │ --> │ Aprobacion │
└─────────────┘     └──────────┘     └────────────┘
                                            │
                                            v
┌─────────────┐     ┌──────────────┐  ┌──────────────┐
│ Deprecacion │ <-- │ Actualizacion │<-│ Publicacion  │
└─────────────┘     └──────────────┘  └──────────────┘
```

### Estados Validos

| Estado | Descripcion |
|--------|-------------|
| Draft | En creacion, no revisado |
| InReview | Bajo revision |
| Approved | Aprobado para uso |
| Published | Publicado y vigente |
| Updated | Actualizado (version++) |
| Deprecated | Marcado para eliminacion |
| Archived | Archivado, no vigente |

---

## 8. Validaciones Requeridas

### 8.1 Frontmatter

Todos los documentos MD deben tener frontmatter valido:

```yaml
---
id: "{PREFIJO}-{MODULO}-{NUM}"
title: "{Titulo descriptivo}"
type: "{Requirement|Specification|UserStory|ADR|Epic}"
status: "{Draft|InReview|Approved|Published|Deprecated}"
priority: "{P0|P1|P2|P3}"
version: "{SEMVER}"
created_date: "{YYYY-MM-DD}"
updated_date: "{YYYY-MM-DD}"
---
```

### 8.2 Referencias

- Todas las referencias cruzadas deben funcionar (links validos)
- No deben existir referencias huerfanas
- IDs deben ser unicos en el proyecto

### 8.3 Estados

- Estados deben ser consistentes con el contenido
- Documentos publicados deben estar completos
- Documentos deprecados deben indicar reemplazo

---

## 9. Validacion de Conformidad

Usar el checklist de documentacion para validar:

```
Ver: CHECKLIST-DOCUMENTACION-PROYECTO.md
```

---

## 10. Referencias

| Directiva | Proposito |
|-----------|-----------|
| SIMCO-NOMENCLATURA.md | Patrones de nombres de archivos |
| SIMCO-ESTRUCTURA-DOCS.md | Estructura interna de documentos |
| SIMCO-INVENTARIOS.md | Formato de inventarios YAML |
| CHECKLIST-DOCUMENTACION-PROYECTO.md | Verificacion de conformidad |

---

**Ultima actualizacion:** 2026-01-10
**Mantenido por:** Orchestration Team
