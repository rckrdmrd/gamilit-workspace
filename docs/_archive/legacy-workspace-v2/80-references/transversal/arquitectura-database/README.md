# docs/database/ - Directorio de Trazabilidad de Base de Datos

**IMPORTANTE:** Este directorio fue deprecado. La trazabilidad de base de datos NO va aquí.

## ❌ Enfoque Incorrecto (Deprecado)

```
docs/database/
├── SCHEMA_NAME_TRACEABILITY.yml  ❌ NO crear archivos sueltos por schema
├── AUTH_TRACEABILITY.yml         ❌ Documentación sin referencias
└── CONTENT_MANAGEMENT_TRACEABILITY.yml ❌ No referenciado desde épicas
```

**Problema:** Archivos de trazabilidad sueltos que no están referenciados desde requerimientos/épicas.

---

## ✅ Enfoque Correcto

La trazabilidad de base de datos debe ir en **los archivos TRACEABILITY.yml de cada épica**, bajo:

```
docs/
├── 01-fase-alcance-inicial/
│   └── EAI-XXX-nombre/
│       └── implementacion/
│           └── TRACEABILITY.yml  ✅ Mapea objetos de BD aquí
│
├── 02-fase-robustecimiento/
│   └── EMR-XXX-nombre/
│       └── implementacion/
│           └── TRACEABILITY.yml  ✅ Mapea objetos de BD aquí
│
└── 03-fase-extensiones/
    └── EXT-XXX-nombre/
        └── implementacion/
            └── TRACEABILITY.yml  ✅ Mapea objetos de BD aquí
```

### Ejemplo: EXT-006 (Gestión de Contenido)

**Ubicación:** `docs/03-fase-extensiones/EXT-006-contenido/implementacion/TRACEABILITY.yml`

```yaml
epic_code: EXT-006
epic_name: CMS para Contenido Educativo

implementation:
  database:
    tables:
      - name: content_versions
        type: new
        description: Historial de versiones de contenido
        schema: content_management

      - name: content_approvals
        type: new
        description: Workflow de aprobación
        schema: content_management

  backend:
    module: content-management
    services:
      - content-version.service.ts
      - content-approval.service.ts

  frontend:
    components:
      - VersionHistory.tsx
      - ApprovalWorkflow.tsx
```

---

## 📋 Flujo de Trazabilidad Correcto

```
Requerimiento/Épica
    ↓
TRACEABILITY.yml de la épica
    ↓
Objetos de Base de Datos
    ↓
Backend (services, entities)
    ↓
Frontend (components)
```

### Beneficios de este enfoque:

1. **Trazabilidad clara:** Desde requerimiento hasta implementación
2. **Evita duplicación:** Antes de crear un objeto, verificar épicas existentes
3. **Documentación útil:** Referenciada y mantenida
4. **No documentación suelta:** Todo tiene propósito y referencias

---

## 📊 Inventarios (Ubicación Correcta)

Los inventarios globales de base de datos SÍ van en:

```
docs/90-transversal/inventarios-database/
├── inventarios/
│   ├── 01-SCHEMAS-INVENTORY.md       ✅ Inventario de schemas
│   ├── 02-TABLES-INVENTORY.md        ✅ Inventario de tablas
│   ├── 03-ENUMS-INVENTORY.md         ✅ Inventario de ENUMs
│   ├── 04-FUNCTIONS-INVENTORY.md     ✅ Inventario de funciones
│   ├── 05-TRIGGERS-INVENTARIO.md     ✅ Inventario de triggers
│   └── INVENTORY-MASTER-REPORT.md    ✅ Reporte consolidado
│
├── DATABASE-PROJECT-README.md         ✅ Estado del proyecto de BD
└── TRACKING-CORRECCIONES.md           ✅ Tracking de correcciones
```

Y también en:

```
docs/90-transversal/inventarios/
├── DATABASE_INVENTORY.yml             ✅ Inventario consolidado
├── BACKEND_INVENTORY.yml              ✅ Inventario de backend
├── FRONTEND_INVENTORY.yml             ✅ Inventario de frontend
└── TRACEABILITY_MATRIX.yml            ✅ Matriz de trazabilidad
```

---

## 🎯 Uso de Este Directorio

Este directorio `docs/database/` puede usarse OPCIONALMENTE para:

1. **Documentación técnica complementaria** (si tiene sentido)
2. **ADRs específicos de base de datos** (decisiones arquitectónicas)
3. **Guías de diseño de schema** (estándares, patrones)

Pero **NO** para:
- ❌ Archivos de trazabilidad por schema
- ❌ Documentación que duplica TRACEABILITY.yml de épicas
- ❌ Inventarios (van en docs/90-transversal/)

---

## 🔧 Archivos Deprecados

Los siguientes archivos fueron movidos a `.deprecated` porque no están referenciados desde épicas:

- `CONTENT_MANAGEMENT_TRACEABILITY.yml.deprecated` - No referenciado
- `AUTH_TRACEABILITY.yml` - Eliminado (no tenía propósito)

Si necesitas información de estos archivos, migra el contenido útil a los TRACEABILITY.yml correspondientes de las épicas.

---

## 📚 Recursos

- **Guía de trazabilidad:** `docs/95-guias-desarrollo/GUIA-TRAZABILIDAD.md` (por crear)
- **Ejemplo completo:** `docs/03-fase-extensiones/EXT-006-contenido/implementacion/TRACEABILITY.yml`
- **Inventarios:** `docs/90-transversal/inventarios-database/`
- **Sistema SIMCO:** `docs/90-adr/ADR-0002-simco-system.md`

---

**Última actualización:** 2025-11-11
**Motivo:** Corrección de estructura de documentación - Trazabilidad debe ir en épicas, no en archivos sueltos
