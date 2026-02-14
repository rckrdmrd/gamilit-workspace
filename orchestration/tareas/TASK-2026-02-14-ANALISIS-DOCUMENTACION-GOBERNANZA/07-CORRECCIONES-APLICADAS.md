# 07 - LOG DE CORRECCIONES APLICADAS

**Tarea:** TASK-2026-02-14-ANALISIS-DOCUMENTACION-GOBERNANZA
**Fecha:** 2026-02-14

---

## Archivos Modificados (9)

### 1. `orchestration/directivas/simco/_INDEX.md`
- **Cambio:** Rewrite completo v4.5.0 → v5.0.0
- **Detalle:**
  - ESTRUCTURA reescrita: 70 archivos activos categorizados (antes ~43 con 8 phantoms)
  - Eliminados phantoms: REUTILIZAR, CONTRIBUIR-CATALOGO, MOBILE, ML, PROPAGACION, DOCUMENTAR-SUITE, CHECKLIST-FASE-D, LECCIONES-APRENDIDAS
  - Paths `core/` corregidos a `orchestration/`
  - Eliminadas refs a `shared/catalog/` (no existe en standalone)
  - GUIA RAPIDA: eliminadas 2 filas phantom, Mobile/ML reemplazados por DevOps/Deploy, PROPAGACION por STANDALONE
  - ALIAS section: OP_MOBILE/OP_ML → OP_DEVOPS/OP_DEPLOY, PROPAGACION → STANDALONE
  - Archivo `@ALIASES` corregido de `orchestration/referencias/` a `orchestration/agents/`

### 2. `orchestration/CONTEXT-MAP.yml`
- **Cambio:** Metricas actualizadas
- **Detalle:**
  - tablas: 170 → 169
  - endpoints: 850 → 899
  - rls_policies: 263 → 207
  - funciones: 255 → 249
  - triggers: 132 → 67
  - enums: 41 → 42
  - version: 4.0.0 → 4.1.0
  - ultima_actualizacion: 2026-02-11 → 2026-02-14

### 3. `orchestration/agents/ALIASES.yml`
- **Cambio:** Seccion `paths:` completamente reescrita
- **Detalle:**
  - Eliminados 30+ paths `control-plane/` (no existen en standalone)
  - Eliminados paths `shared/catalog/`, `shared/knowledge-base/`, `projects/`
  - Agregados paths standalone: @SIMCO, @PRINCIPIOS, @PERFILES, @INVENTORY, @INV_*, @BACKEND, @FRONTEND, @DDL, @SEEDS, @DOCS, @KNOWLEDGE

### 4. `orchestration/directivas/triggers/_INDEX.md`
- **Cambio:** Phantoms marcados, count corregido
- **Detalle:**
  - TRIGGER-PROPAGACION-AUTOMATICA y TRIGGER-DUPLICADOS marcados como "PHANTOM — archivo no existe en disco"
  - Count en changelog actualizado: "Total triggers: 13 en disco (2 phantoms)"

### 5. `orchestration/_MAP.md`
- **Cambio:** Counts corregidos
- **Detalle:**
  - agents/: 62 → 57 archivos, profiles 31 → 28 full, configs 5 → 4
  - directivas/: 115 → 124 archivos, simco 63 → 70, principios 16 → 15, triggers 15 → 13, politicas 4 → 3, modos 4 → 3
  - inventarios/: 8 → 9 (agregado LOCAL-WSL-ENVIRONMENT.yml)
  - Tablas metrica: 171 → 169
  - Triggers: 126 → 67
  - Funciones: clarificado DDL/runtime

### 6. `orchestration/BOOTLOADER.md`
- **Cambio:** Path fix
- **Detalle:** 3 ocurrencias de `.claude/CLAUDE.md` → `CLAUDE.md`

### 7. `docs/20-architecture/_INDEX.md`
- **Cambio:** Rewrite completo
- **Detalle:**
  - Titulo: "20 - Perfiles" → "20 - Arquitectura"
  - Contenido: "(Pendiente de migracion)" → indice completo con 10 root files + 22 schema-reference files

### 8. `orchestration/inventarios/MASTER_INVENTORY.yml`
- **Cambio:** Metricas corregidas
- **Detalle:**
  - tablas: 171 → 169 (con comentario explicativo)
  - triggers: 126 → 67 (con comentario: CREATE TRIGGER, not functions)
  - rls_policies: 263 → 207 (con comentario: CREATE POLICY across 4 files)
  - funciones: 183 (con comentario: DDL source / 249 runtime)
  - coherencia_ddl_backend: "89.5%" → "90.5%" (con formula: 153/169)

### 9. `CLAUDE.md`
- **Cambio:** Metricas corregidas
- **Detalle:**
  - Funciones: 183 → "183 (DDL) / 249 (runtime)"
  - Triggers: 126 → 67
  - Politicas RLS: 418 → 207
  - RC2 text: "171 tablas = 152 entities" → "169 tablas = 153 entities, 16 DDL-only en data_warehouse"

## Archivos Eliminados (1)

### `apps/backend/src/config/XXfvCRNj`
- **Motivo:** Archivo anomalo de 0 bytes, artefacto de creacion accidental
- **Fecha creacion:** 2026-02-11

---

*Log de correcciones completado 2026-02-14*
