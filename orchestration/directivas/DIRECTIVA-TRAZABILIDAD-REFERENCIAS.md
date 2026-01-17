# DIRECTIVA: Sistema de Trazabilidad y Referencias

**Version:** 1.0
**Fecha:** 2026-01-16
**Estado:** ACTIVA
**Aplica a:** Todos los agentes que modifiquen objetos en BD, Backend o Frontend

---

## RESUMEN EJECUTIVO

Esta directiva establece las reglas obligatorias para mantener la trazabilidad entre definiciones (documentación Scrum) y objetos implementados (tablas, entities, componentes), usando un sistema de dos capas: documentación como fuente de verdad y archivos YML como mapas de navegación.

---

## ARQUITECTURA DE TRAZABILIDAD

### Dos Capas Complementarias

```
CAPA 1: DOCUMENTACIÓN SCRUM (Fuente de Verdad)
├── docs/.../EAI-XXX/
│   ├── _MAP.md                 refs: {schemas: [...]}
│   ├── requerimientos/RF-*.md  refs: {tables: [...], entities: [...]}
│   ├── historias-usuario/US-*.md  refs: {components: [...]}
│   └── implementacion/TRACEABILITY.yml

CAPA 2: REFERENCIAS YML (Mapas de Navegación)
├── orchestration/referencias/
│   ├── SCHEMA-REFERENCES.yml
│   ├── TABLE-ENTITY-MAP.yml
│   ├── FUNCTIONALITY-INDEX.yml
│   └── EPIC-OBJECTS-INDEX.yml
└── orchestration/inventarios/
    ├── DATABASE_INVENTORY.yml
    ├── BACKEND_INVENTORY.yml
    └── MASTER_INVENTORY.yml
```

---

## REGLAS OBLIGATORIAS

### REGLA 1: Actualización de Referencias al Crear Objetos

**CUANDO** se crea un nuevo objeto (tabla, entity, componente, service):

| Tipo de Objeto | Archivos a Actualizar |
|----------------|----------------------|
| Tabla DDL | `TABLE-ENTITY-MAP.yml`, `DATABASE_INVENTORY.yml`, `RF-*.md` correspondiente |
| Entity Backend | `TABLE-ENTITY-MAP.yml`, `BACKEND_INVENTORY.yml`, `RF-*.md` correspondiente |
| Componente Frontend | `FUNCTIONALITY-INDEX.yml`, `FRONTEND_INVENTORY.yml`, `US-*.md` correspondiente |
| Service/Controller | `BACKEND_INVENTORY.yml`, `ET-*.md` correspondiente |
| Store/Hook | `FUNCTIONALITY-INDEX.yml`, `FRONTEND_INVENTORY.yml`, `US-*.md` correspondiente |

**Ejemplo:**
```
Creo tabla: gamification_system.badges
  → Actualizar TABLE-ENTITY-MAP.yml (agregar entrada)
  → Actualizar DATABASE_INVENTORY.yml (incrementar contador)
  → Actualizar RF-GAM-001.md (agregar en refs.database.tables)
  → Actualizar TRACEABILITY.yml de EAI-003 (agregar en tables)
```

### REGLA 2: Actualización de Referencias al Eliminar Objetos

**CUANDO** se elimina un objeto:

1. Verificar que no tenga dependencias activas
2. Remover de TODOS los archivos de referencia
3. Documentar la eliminación en el changelog correspondiente
4. Actualizar contadores en inventarios

### REGLA 3: Sincronización de Inventarios

**DESPUÉS** de cualquier cambio estructural:

```bash
# Verificar coherencia
DATABASE_INVENTORY.yml#tables == suma de tablas en schemas
BACKEND_INVENTORY.yml#entities == archivos .entity.ts existentes
TABLE-ENTITY-MAP.yml#totales == valores en inventarios
```

### REGLA 4: Frontmatter en Documentación Scrum

**TODO** archivo RF-*.md, ET-*.md, US-*.md DEBE tener frontmatter con referencias:

```yaml
---
id: "RF-GAM-001"
title: "Sistema de Logros"
epic: "EAI-003"
refs:
  database:
    tables: ["achievements", "user_achievements"]
    functions: ["check_and_unlock_achievement"]
  backend:
    entities: ["achievement.entity.ts"]
---
```

**Schema completo:** Ver `orchestration/referencias/FRONTMATTER-SCHEMA.yml`

### REGLA 5: Referencias Cruzadas Entre Épicas

**CUANDO** un objeto de una épica usa objetos de otra:

```yaml
# En el archivo de la épica que USA el objeto
refs:
  cross_refs:
    - source: "EAI-001/authStore"
      type: depends_on
      reason: "Requiere usuario autenticado"
```

---

## ARCHIVOS DE REFERENCIA OBLIGATORIOS

### orchestration/referencias/

| Archivo | Propósito | Actualizar Cuando |
|---------|-----------|-------------------|
| `_INDEX.yml` | Índice de referencias | Se agrega nuevo archivo de referencia |
| `SCHEMA-REFERENCES.yml` | Schema → Épica | Nueva épica o schema |
| `TABLE-ENTITY-MAP.yml` | Tabla ↔ Entity | Nueva tabla o entity |
| `FUNCTIONALITY-INDEX.yml` | Funcionalidad → Objetos | Nueva funcionalidad |
| `FRONTMATTER-SCHEMA.yml` | Schema de metadatos | Cambio en estructura |

### orchestration/inventarios/

| Archivo | Propósito | Actualizar Cuando |
|---------|-----------|-------------------|
| `DATABASE_INVENTORY.yml` | Catálogo BD | Cambio en DDL |
| `BACKEND_INVENTORY.yml` | Catálogo Backend | Cambio en entities/services |
| `FRONTEND_INVENTORY.yml` | Catálogo Frontend | Cambio en componentes |
| `MASTER_INVENTORY.yml` | Resumen ejecutivo | Cualquier cambio estructural |
| `TRACEABILITY_MATRIX.yml` | Matriz global | Cambio en coherencia |

---

## FLUJO DE TRABAJO

### Al Iniciar Tarea de Desarrollo

```
1. Identificar épica afectada
2. Leer TRACEABILITY.yml de la épica
3. Identificar objetos existentes relacionados
4. Planificar cambios incluyendo actualizaciones de referencias
```

### Al Completar Tarea

```
1. Verificar que todos los objetos nuevos estén en referencias
2. Actualizar contadores en inventarios
3. Verificar coherencia con: TABLE-ENTITY-MAP.yml#coherencia
4. Commit de código + referencias en mismo commit
```

### Checklist Pre-Commit

```markdown
- [ ] Objetos nuevos agregados a TABLE-ENTITY-MAP.yml
- [ ] Objetos nuevos agregados a *_INVENTORY.yml correspondiente
- [ ] Frontmatter actualizado en RF/ET/US correspondiente
- [ ] TRACEABILITY.yml de épica actualizado
- [ ] Contadores en MASTER_INVENTORY.yml actualizados
```

---

## VALIDACIÓN

### Comando de Validación (Futuro)

```bash
npm run validate:traceability
# Verifica:
# - Coherencia entre inventarios
# - Objetos en código existen en referencias
# - Frontmatters tienen estructura correcta
```

### Validación Manual

```bash
# Contar tablas DDL
find apps/database/ddl/schemas -name "*.sql" -path "*/tables/*" | wc -l

# Contar entities
find apps/backend/src -name "*.entity.ts" | wc -l

# Comparar con TABLE-ENTITY-MAP.yml
grep "tablas_totales" orchestration/referencias/TABLE-ENTITY-MAP.yml
grep "entities_totales" orchestration/referencias/TABLE-ENTITY-MAP.yml
```

---

## RESPONSABILIDADES POR AGENTE

| Agente | Responsabilidad |
|--------|-----------------|
| **Database Agent** | Actualizar TABLE-ENTITY-MAP.yml, DATABASE_INVENTORY.yml |
| **Backend Agent** | Actualizar BACKEND_INVENTORY.yml, ET-*.md |
| **Frontend Agent** | Actualizar FRONTEND_INVENTORY.yml, US-*.md, FUNCTIONALITY-INDEX.yml |
| **Architecture Analyst** | Validar coherencia, actualizar TRACEABILITY_MATRIX.yml |
| **Tech Leader** | Revisar que referencias estén actualizadas antes de merge |

---

## EXCEPCIONES

### Objetos que NO requieren referencia

1. Archivos de test (`*.spec.ts`, `*.test.tsx`)
2. Archivos de configuración (`*.config.ts`)
3. Archivos temporales o de debug
4. Mocks y fixtures

### Objetos con referencia simplificada

1. DTOs → Solo contar en inventario, no detallar cada uno
2. Migrations → Deprecadas, no referenciar
3. Enums de BD → Incluir en schema, no archivo separado

---

## REFERENCIAS

- `orchestration/referencias/FRONTMATTER-SCHEMA.yml` - Schema de metadatos
- `orchestration/analisis/MODELO-TRAZABILIDAD-COMPLEMENTARIO-2026-01-16.md` - Modelo arquitectónico
- `orchestration/directivas/ESTANDAR-ESTRUCTURA-REFERENCIAS.md` - Estándar de estructura

---

## CHANGELOG

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2026-01-16 | 1.0 | Versión inicial |

---

*Directiva creada por Claude Opus 4.5*
*Sistema SIMCO v4.0.0*
*Proyecto GAMILIT*
