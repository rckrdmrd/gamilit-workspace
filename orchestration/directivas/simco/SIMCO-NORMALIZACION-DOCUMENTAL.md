# SIMCO-NORMALIZACION-DOCUMENTAL

**Version:** 1.0.0
**Fecha:** 2026-02-13
**Aplica a:** Todos los agentes que creen o modifiquen documentacion
**Criticidad:** OBLIGATORIA
**Tipo:** Directiva Obligatoria
**Alias:** @NORMALIZACION-DOCUMENTAL
**Depende de:** SIMCO-DOCUMENTAR.md, PRINCIPIO-ANTI-DUPLICACION.md

---

## 1. Proposito

Aplicar principios de normalizacion (inspirados en formas normales de BD) a la documentacion del proyecto gamilit (~2,400 archivos entre docs/ y orchestration/). Garantiza que cada concepto tiene UNA sola ubicacion canonica (SSOT) y que la documentacion es mantenible y consistente.

---

## 2. Formas Normales Documentales

### 2.1 Primera Forma Normal (1FN) — Atomicidad

```
REGLA: 1 archivo = 1 concepto atomico

CORRECTO:
  ESTANDAR-API.md         (solo estandar de API)
  ESTANDAR-SEGURIDAD.md   (solo estandar de seguridad)

INCORRECTO:
  ESTANDAR-API-Y-SEGURIDAD.md  (2 conceptos en 1 archivo)

EXCEPCION:
  Archivos _INDEX.md y _MAP.md son agregadores por naturaleza
```

### 2.2 Segunda Forma Normal (2FN) — Sin Dependencias Parciales

```
REGLA: Todo contenido de un archivo DEBE pertenecer a su tema principal

CORRECTO:
  SIMCO-BACKEND.md contiene:
    - Operaciones backend NestJS
    - Alineacion Entity-DDL
    - Validaciones backend

INCORRECTO:
  SIMCO-BACKEND.md contiene:
    - Operaciones backend NestJS
    - Como configurar PostgreSQL       <- Pertenece a SIMCO-DDL
    - Guia de deploy a produccion      <- Pertenece a SIMCO-DEPLOY
```

### 2.3 Tercera Forma Normal (3FN) — Sin Dependencias Transitivas

```
REGLA: NO repetir informacion, REFERENCIAR la fuente canonica (SSOT)

CORRECTO:
  SIMCO-BACKEND.md:
    "Para alineacion DDL, ver @SIMCO-DDL seccion 3"

INCORRECTO:
  SIMCO-BACKEND.md:
    "Las tablas se crean con CREATE TABLE... [copia de SIMCO-DDL]"

PATRON DE REFERENCIA:
  Markdown: "Ver [SIMCO-DDL](../SIMCO-DDL.md#seccion-3)"
  YAML: "ref: @SIMCO-DDL#seccion-3"
```

---

## 3. Convenciones de Nombres

### 3.1 Archivos de Documentacion

| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Estandar | `ESTANDAR-{TEMA}.md` | ESTANDAR-API.md |
| Directiva SIMCO | `SIMCO-{OPERACION}.md` | SIMCO-BACKEND.md |
| Principio | `PRINCIPIO-{NOMBRE}.md` | PRINCIPIO-DRY.md |
| Trigger | `TRIGGER-{EVENTO}.md` | TRIGGER-FETCH-OBLIGATORIO.md |
| Perfil agente | `PERFIL-{ROL}.md` | PERFIL-BACKEND-NESTJS.md |
| ADR | `ADR-{NNN}-{tema}.md` | ADR-001-stack-tecnologico.md |
| Guia | `GUIA-{TEMA}.md` | GUIA-DEPLOY-PRODUCCION.md |
| Inventario | `{DOMINIO}_INVENTORY.yml` | BACKEND_INVENTORY.yml |
| Epic | `EPIC-GAM-F{N}-{NOMBRE}/` | EPIC-GAM-F1-AUTH/ |
| User Story | `US-{CODIGO}/US-{CODIGO}-{nombre}.md` | US-ADM-001/ |
| Task | `TASK-{CODIGO}-F{N}-{TIPO}/` | TASK-ADM-001-F1-BACKEND/ |
| Error documentado | `ERR-{DOMINIO}-{NNN}.md` | ERR-BE-001.md |

### 3.2 Directorios

| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Seccion docs | `{NN}-{nombre}/` | 40-standards/ |
| Schema reference | `{NN}-{schema}.md` | 01-auth.md |
| Archivo archivado | `_archive/{archivo}` | _archive/SIMCO-OLD.md |
| Indice | `_INDEX.md` o `_INDEX.yml` | _INDEX.md |
| Mapa | `_MAP.md` | _MAP.md |

### 3.3 Reglas de Nombrado

```yaml
reglas:
  - "MAYUSCULAS para archivos de gobernanza (SIMCO, ESTANDAR, PRINCIPIO, ADR)"
  - "snake_case para inventarios YAML (BACKEND_INVENTORY.yml)"
  - "kebab-case para archivos de codigo y guias menores"
  - "Prefijo numerico para orden en directorios (01-, 02-, etc.)"
  - "NO usar espacios en nombres de archivo"
  - "NO usar caracteres especiales (tildes, ñ) en nombres de archivo"
  - "Usar .md para documentacion, .yml para datos estructurados"
```

---

## 4. Estructura de Carpetas Normalizada

### 4.1 Regla de _INDEX.md

```
SI un directorio tiene 3+ archivos:
  DEBE tener _INDEX.md (tabla de contenidos)

SI un directorio tiene 5+ archivos:
  DEBERIA tener _MAP.md (mapa de navegacion con relaciones)
```

### 4.2 Estructura Estandar por Tipo

```
# Seccion de documentacion
{NN}-{nombre}/
  ├── _INDEX.md        <- Obligatorio si 3+ archivos
  ├── _MAP.md          <- Recomendado si 5+ archivos
  ├── README.md        <- Descripcion de la seccion
  └── {archivos}.md    <- Contenido atomico

# Directiva SIMCO
directivas/simco/
  ├── _INDEX.md
  ├── SIMCO-{OPERACION}.md
  └── _archive/        <- Directivas archivadas

# Epic de requerimientos
EPIC-GAM-F{N}-{NOMBRE}/
  ├── EPIC.md
  ├── PLAN.md
  ├── _INDEX.md
  ├── requirements/
  ├── specifications/
  ├── traceability/
  └── user-stories/
```

---

## 5. Patrones de Referencia

### 5.1 Referencias Internas (Markdown)

```markdown
# Referencia a archivo
Ver [SIMCO-BACKEND](./SIMCO-BACKEND.md)

# Referencia a seccion especifica
Ver [SIMCO-BACKEND seccion 3](./SIMCO-BACKEND.md#3-operaciones)

# Referencia a alias
Ver @SIMCO-BACKEND
```

### 5.2 Referencias en YAML

```yaml
# Referencia directa
ref: "orchestration/directivas/simco/SIMCO-BACKEND.md"

# Referencia con alias
ref: "@SIMCO-BACKEND"

# Referencia a inventario
ssot: "orchestration/inventarios/BACKEND_INVENTORY.yml"
```

### 5.3 Anti-Patrones de Referencia

```yaml
prohibido:
  - "Copiar contenido de otro archivo (viola 3FN)"
  - "Referenciar archivo que no existe (link roto)"
  - "Referenciar con ruta absoluta del filesystem"
  - "Referenciar sin especificar seccion cuando el archivo es largo"

permitido:
  - "Incluir resumen de 1 linea + referencia al SSOT"
  - "Duplicar info critica en CLAUDE.md (es el L0 de contexto)"
```

---

## 6. Validacion de Normalizacion

### 6.1 Checklist Pre-Creacion de Documento

```
[ ] El concepto NO existe en otro archivo (verificar con grep)
[ ] El nombre sigue la convencion (seccion 3)
[ ] El directorio tiene _INDEX.md si corresponde
[ ] Las referencias usan SSOT (no copian contenido)
[ ] El frontmatter tiene version y fecha
```

### 6.2 Checklist Post-Modificacion

```
[ ] No se duplico informacion de otro archivo
[ ] Las referencias siguen funcionando
[ ] Los inventarios fueron actualizados si aplica
[ ] El _INDEX.md del directorio fue actualizado si se agrego archivo
```

### 6.3 Deteccion de Violaciones

```bash
# Buscar archivos con "y" en el nombre (posible violacion 1FN)
find docs/ orchestration/ -name "*-Y-*" -o -name "*-y-*"

# Buscar contenido duplicado (posible violacion 3FN)
# Verificar si un bloque de texto aparece en multiples archivos
grep -r "CREATE TABLE" docs/ --include="*.md" -l | wc -l
# Si > 1: posible duplicacion de DDL en documentacion

# Buscar referencias rotas
grep -r "\[.*\](.*\.md)" docs/ --include="*.md" -o | \
  sed 's/.*(\(.*\))/\1/' | sort -u
```

---

## 7. Excepciones Documentadas

### 7.1 CLAUDE.md como Excepcion

CLAUDE.md duplica informacion de inventarios y directivas por diseño:
- Es el nivel L0 de contexto (siempre cargado)
- Contiene metricas consolidadas para referencia rapida
- **Responsabilidad:** Mantener sincronizado con MASTER_INVENTORY.yml

### 7.2 User Stories Largas

Las User Stories (800+ lineas) contienen especificacion completa inline:
- Esto es por diseño (ADR-034: jerarquia anidada profunda)
- Los TASKs son stubs que referencian la US padre
- **No viola 2FN** porque todo el contenido pertenece a la US

---

## 8. Integracion con Otras Directivas

| Directiva | Relacion |
|-----------|---------|
| SIMCO-DOCUMENTAR.md | Protocolo general de documentacion |
| SIMCO-CREAR.md | Checklist al crear nuevos archivos |
| SIMCO-ESTRUCTURA-DOCS.md | Estructura de 13 secciones de docs/ |
| PRINCIPIO-ANTI-DUPLICACION.md | Principio base contra duplicacion |
| PRINCIPIO-DRY.md | Don't Repeat Yourself |
| TRIGGER-ANTI-DUPLICACION | Trigger que verifica antes de crear |

---

## 9. Estado operativo y acceso para agentes

### Estado actual del plan

- Lotes 1-3 + Olas 1-8: **completados**
- Auditoria global `docs/**` + `orchestration/**`: **`BROKEN_GLOBAL_TOTAL=0`**
- Registro canonico de cierre: `orchestration/referencias/BACKLOG-NORMALIZACION-FASE2.md`

### Enrutamiento de agentes (quien ejecuta)

- Perfil principal: `@PERFIL_DOCS_MAINTAINER`
- Coordinacion multi-capa: `@PERFIL_ORQUESTADOR`
- Validacion transversal (si toca codigo): perfil tecnico por capa + `@DEF_CHK_SSOT_SYNC`

### Procedimiento minimo de ejecucion

1. Ejecutar checklist `@DEF_CHK_DOC_NORMALIZATION`.
2. Aplicar esta directiva (`SIMCO-NORMALIZACION-DOCUMENTAL.md`).
3. Registrar avance/cierre en:
   - `orchestration/referencias/BACKLOG-NORMALIZACION-FASE2.md`
   - `orchestration/PROXIMA-ACCION.md` (estado ejecutivo)
   - `orchestration/NEXT-ACTIONS.md` (solo pendientes operativos)

---

**Creado por:** TASK-2026-02-13-ANALISIS-MEJORAS-INTEGRABLES
**Basado en:** workspace-arch/SIMCO-NORMALIZACION-DOCUMENTAL.md (adaptado para gamilit standalone)
