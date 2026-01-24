# MODELO: Trazabilidad Complementaria (Documentación + Referencias YML)
# ============================================================================

**Fecha:** 2026-01-16
**Autor:** Claude Opus 4.5
**Sistema:** SIMCO v4.0.0
**Proyecto:** GAMILIT

---

## RESUMEN

Modelo de trazabilidad donde:
- **Documentación Scrum** = Definiciones con referencias a objetos (fuente de verdad)
- **Archivos YML** = Mapas/índices de acceso rápido para agentes (derivados)

Los YML NO se deprecan. Son complementarios y esenciales para navegación eficiente.

---

## ARQUITECTURA DE DOS CAPAS

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CAPA 1: DOCUMENTACIÓN SCRUM                     │
│                     (Fuente de Verdad - SSOT)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  docs/01-fase-alcance-inicial/EAI-003-gamificacion/                │
│  ├── _MAP.md              refs: {schemas: [gamification_system]}   │
│  ├── requerimientos/                                                │
│  │   └── RF-GAM-001.md    refs: {tables: [...], entities: [...]}   │
│  ├── historias-usuario/                                             │
│  │   └── US-GAM-005.md    refs: {components: [...]}                │
│  └── implementacion/                                                │
│      └── TRACEABILITY.yml  (consolidado de esta épica)             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Generación/Sincronización
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  CAPA 2: REFERENCIAS YML (Mapas)                    │
│                  (Acceso Rápido para Agentes)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  orchestration/referencias/                                         │
│  ├── _INDEX.yml                    Índice de mapas disponibles     │
│  ├── SCHEMA-REFERENCES.yml         Schema → Épica → Objetos        │
│  ├── TABLE-ENTITY-MAP.yml          Tabla ↔ Entity bidireccional    │
│  ├── FUNCTIONALITY-INDEX.yml       Funcionalidad → Multi-capa      │
│  └── EPIC-OBJECTS-INDEX.yml        Épica → Todos sus objetos       │
│                                                                     │
│  orchestration/inventarios/                                         │
│  ├── DATABASE_INVENTORY.yml        Inventario completo BD          │
│  ├── BACKEND_INVENTORY.yml         Inventario completo Backend     │
│  ├── FRONTEND_INVENTORY.yml        Inventario completo Frontend    │
│  ├── MASTER_INVENTORY.yml          Consolidado general             │
│  └── TRACEABILITY_MATRIX.yml       Matriz épica → implementación   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ROLES DE CADA TIPO DE ARCHIVO

### Documentación Scrum (Fuente de Verdad)

| Archivo | Rol | Qué Contiene |
|---------|-----|--------------|
| `_MAP.md` de épica | Definición de alcance | Schemas, dependencias entre épicas |
| `RF-*.md` | Definición funcional | Tablas, funciones, entities |
| `ET-*.md` | Definición técnica | Services, controllers, DTOs |
| `US-*.md` | Definición de usuario | Componentes, hooks, stores |
| `TRACEABILITY.yml` | Consolidado de épica | Todo lo anterior + versiones |

**Cuándo usar:** Para entender QUÉ y POR QUÉ se implementó algo.

### Referencias YML (Mapas de Navegación)

| Archivo | Rol | Cuándo Usar |
|---------|-----|-------------|
| `SCHEMA-REFERENCES.yml` | Mapa schema→épica | "¿Qué épica tiene gamification_system?" |
| `TABLE-ENTITY-MAP.yml` | Mapa tabla↔entity | "¿Qué entity corresponde a achievements?" |
| `FUNCTIONALITY-INDEX.yml` | Mapa funcionalidad→capas | "¿Qué objetos implementan logros?" |
| `EPIC-OBJECTS-INDEX.yml` | Mapa épica→objetos | "¿Qué tablas tiene EAI-003?" |
| `TRACEABILITY_MATRIX.yml` | Mapa global | "¿Estado de coherencia por épica?" |

**Cuándo usar:** Para ENCONTRAR rápidamente dónde está algo.

### Inventarios (Estado Actual)

| Archivo | Rol | Cuándo Usar |
|---------|-----|-------------|
| `DATABASE_INVENTORY.yml` | Catálogo BD | "¿Cuántas tablas hay en total?" |
| `BACKEND_INVENTORY.yml` | Catálogo Backend | "¿Cuántos services existen?" |
| `FRONTEND_INVENTORY.yml` | Catálogo Frontend | "¿Cuántos componentes hay?" |
| `MASTER_INVENTORY.yml` | Resumen ejecutivo | "¿Estado general del proyecto?" |

**Cuándo usar:** Para saber QUÉ EXISTE actualmente.

---

## FLUJO DE USO PARA AGENTES

### Escenario 1: "¿Dónde está implementado el sistema de logros?"

```
1. Cargar FUNCTIONALITY-INDEX.yml (~8KB)
   → Buscar "logros_achievements"
   → Encontrar: epic: EAI-003, tables: [achievements], etc.

2. Si necesita más detalle:
   → Ir a docs/.../EAI-003-gamificacion/requerimientos/RF-GAM-001.md
```

### Escenario 2: "¿Qué entity corresponde a la tabla missions?"

```
1. Cargar TABLE-ENTITY-MAP.yml (~6KB)
   → Buscar "missions"
   → Encontrar: entity: "mission.entity.ts", path: "modules/gamification/entities/"
```

### Escenario 3: "Necesito modificar achievements, ¿qué más afecto?"

```
1. Cargar FUNCTIONALITY-INDEX.yml
   → Buscar "logros_achievements"
   → Ver todos los objetos relacionados (DB, Backend, Frontend)

2. Cargar TRACEABILITY_MATRIX.yml
   → Ver dependencias: required_by: [EAI-002, EXT-004]
   → Evaluar impacto en épicas dependientes
```

### Escenario 4: "¿Cuál es el estado de coherencia del proyecto?"

```
1. Cargar MASTER_INVENTORY.yml (~5KB)
   → Ver resumen: coherencia_bd: 90%, tests: 543 passing

2. Si necesita detalle:
   → Cargar inventario específico (DATABASE, BACKEND, FRONTEND)
```

---

## JERARQUÍA DE ARCHIVOS POR GRANULARIDAD

```
                    NIVEL DE DETALLE
    ◄─────────────────────────────────────────────────►
    BAJO (Resumen)                          ALTO (Detalle)

    MASTER_INVENTORY.yml          DATABASE_INVENTORY.yml
           │                              │
           ▼                              ▼
    TRACEABILITY_MATRIX.yml       Inventario por schema
           │                              │
           ▼                              ▼
    FUNCTIONALITY-INDEX.yml       TRACEABILITY.yml (por épica)
           │                              │
           ▼                              ▼
    SCHEMA-REFERENCES.yml         RF-*.md, US-*.md (documentación)
           │                              │
           ▼                              ▼
    TABLE-ENTITY-MAP.yml          Código fuente
```

---

## SINCRONIZACIÓN ENTRE CAPAS

### Regla Principal

> **La documentación Scrum es la fuente de verdad.**
> **Los YML son derivados/índices que deben sincronizarse.**

### Cuándo Actualizar YML

| Evento | Archivos a Actualizar |
|--------|----------------------|
| Nueva tabla creada | TABLE-ENTITY-MAP.yml, DATABASE_INVENTORY.yml |
| Nueva funcionalidad | FUNCTIONALITY-INDEX.yml, MASTER_INVENTORY.yml |
| Nueva épica | SCHEMA-REFERENCES.yml, TRACEABILITY_MATRIX.yml |
| Cambio en RF/US | TRACEABILITY.yml de la épica |

### Validación de Sincronización

```yaml
# Verificar que los totales coincidan
DATABASE_INVENTORY.yml#tables: 137
  ↕ debe coincidir con
TABLE-ENTITY-MAP.yml#tablas_totales: 137
  ↕ debe coincidir con
suma de tablas en FUNCTIONALITY-INDEX.yml
```

---

## BENEFICIOS DEL MODELO COMPLEMENTARIO

| Aspecto | Beneficio |
|---------|-----------|
| Navegación rápida | YML como índices (<10KB cada uno) |
| Detalle cuando se necesita | Documentación Scrum completa |
| Sin duplicación de contenido | YML solo tienen referencias, no contenido |
| Trazabilidad bidireccional | De objeto→definición y definición→objeto |
| Mantenible | Cada archivo tiene su responsabilidad clara |
| Escalable | Agregar más índices según necesidad |

---

## ARCHIVOS QUE SE MANTIENEN (NO DEPRECAR)

### orchestration/referencias/
- ✅ `_INDEX.yml` - Índice de referencias
- ✅ `SCHEMA-REFERENCES.yml` - Mapa schema→épica
- ✅ `TABLE-ENTITY-MAP.yml` - Mapa tabla↔entity
- ✅ `FUNCTIONALITY-INDEX.yml` - Mapa funcionalidad→capas
- ✅ `FRONTMATTER-SCHEMA.yml` - Schema para frontmatters
- ✅ `EPIC-OBJECTS-INDEX.yml` - Mapa épica→objetos

### orchestration/inventarios/
- ✅ `MASTER_INVENTORY.yml` - Resumen ejecutivo
- ✅ `DATABASE_INVENTORY.yml` - Catálogo BD
- ✅ `BACKEND_INVENTORY.yml` - Catálogo Backend
- ✅ `FRONTEND_INVENTORY.yml` - Catálogo Frontend
- ✅ `TRACEABILITY_MATRIX.yml` - Matriz global

### Por épica (docs/.../implementacion/)
- ✅ `TRACEABILITY.yml` - Consolidado detallado de la épica

---

## PRÓXIMOS PASOS

| Paso | Descripción | Prioridad |
|------|-------------|-----------|
| 1 | Estandarizar frontmatter en documentación existente | P1 |
| 2 | Validar sincronización entre YML y documentación | P1 |
| 3 | Crear script de validación de coherencia | P2 |
| 4 | Documentar flujos de uso para cada agente | P2 |

---

*Modelo actualizado por Claude Opus 4.5*
*Sistema SIMCO v4.0.0*
*Fecha: 2026-01-16*
