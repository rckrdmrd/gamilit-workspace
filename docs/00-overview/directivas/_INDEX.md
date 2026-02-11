# INDICE DE DIRECTIVAS - GAMILIT

**Proyecto:** GAMILIT
**Nivel:** STANDALONE
**Ultima Actualizacion:** 2025-12-18

---

## PROPOSITO

Esta carpeta contiene directivas **especificas** del proyecto GAMILIT que **extienden** (no reemplazan) las directivas de CORE.

---

## CADENA DE HERENCIA

```
WORKSPACE → CORE → GAMILIT (este nivel)
```

### Directivas Heredadas (Obligatorias)

| Origen | Directiva | Alias |
|--------|-----------|-------|
| WORKSPACE | DIRECTIVA-CARGA-CONTEXTO.md | @CARGA-CONTEXTO |
| CORE | PRINCIPIO-CAPVED.md | @CAPVED |
| CORE | PRINCIPIO-DOC-PRIMERO.md | @DOC-PRIMERO |
| CORE | SIMCO-TAREA.md | @TAREA |
| CORE | DIRECTIVA-DOCUMENTACION-DEFINITIVA.md | @DOC-DEFINITIVA |

### Directivas Locales (Este Proyecto)

| Archivo | Proposito | Estado |
|---------|-----------|--------|
| _INDEX.md | Este indice | Activo |
| DIRECTIVA-GAMILIT-EJERCICIOS.md | Estructura de ejercicios educativos | Pendiente |
| DIRECTIVA-GAMILIT-GAMIFICACION.md | Sistema de gamificacion | Pendiente |

---

## CONTEXTO DEL PROYECTO

### Variables de Contexto

```yaml
PROJECT: gamilit
PROJECT_LEVEL: STANDALONE
DB_NAME: gamilit_platform
STACK:
  database: PostgreSQL 15+
  backend: NestJS + TypeORM
  frontend: React + TypeScript + Zustand
```

### Metricas Actuales (SSOT: orchestration/inventarios/MASTER_INVENTORY.yml)

```yaml
Database:
  schemas: 16
  tablas: 123
  rls_policies: 185

Backend:
  modulos: 13
  endpoints: 417
  entities: 92

Frontend:
  componentes: 483
  hooks: 89
  pages: 31
```

---

## ARCHIVOS DE HERENCIA

Para ver la configuracion de herencia completa:

- `orchestration/00-guidelines/CONTEXTO-PROYECTO.md` - Variables de contexto
- `orchestration/00-guidelines/HERENCIA-SIMCO.md` - Herencia de SIMCO
- `orchestration/00-guidelines/HERENCIA-DIRECTIVAS.md` - Mapeo de directivas

---

## COMO AGREGAR DIRECTIVAS ESPECIFICAS

### Paso 1: Crear archivo

```markdown
# DIRECTIVA: {NOMBRE}

**Proyecto:** GAMILIT
**Fecha:** {YYYY-MM-DD}
**Tipo:** Directiva Especifica
**Extiende:** {directiva de CORE si aplica}

---

## PROPOSITO

{descripcion}

---

## CONTENIDO

{contenido de la directiva}

---

**Esta directiva EXTIENDE las directivas de CORE, no las reemplaza.**
```

### Paso 2: Actualizar este indice

Agregar entrada en la tabla "Directivas Locales".

### Paso 3: Actualizar HERENCIA-DIRECTIVAS.md

```yaml
directivas_locales:
  - archivo: "docs/00-vision-general/directivas/{NOMBRE}.md"
    proposito: "{descripcion}"
```

---

## NAVEGACION

- **Indice Maestro:** `/home/isem/workspace/orchestration/INDICE-DIRECTIVAS-WORKSPACE.yml`
- **Directivas CORE:** `/home/isem/workspace/core/orchestration/directivas/`
- **Contexto Proyecto:** `orchestration/00-guidelines/CONTEXTO-PROYECTO.md`

---

**Actualizado:** 2025-12-18
**Por:** Requirements-Analyst
