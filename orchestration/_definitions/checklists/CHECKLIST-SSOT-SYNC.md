# CHECKLIST: SSOT-SYNC

**Version:** 2.0.0
**Alias:** @DEF_CHK_SSOT_SYNC
**Fecha:** 2026-02-13
**Sistema:** SIMCO v4.2.0

---

## PROPOSITO

Verificar sincronizacion SSOT entre las 4 capas del proyecto gamilit:
DDL (169 tablas) -> Backend (152 entities, 899 endpoints) -> Frontend (474 componentes, 655 API calls) -> Inventarios (8 YAMLs).

Ejecutar como parte de @DEF_CHK_POST o cuando se modifique cualquier capa.
Ver @SIMCO-VALIDACION-SSOT para reglas completas.

---

## SECUENCIA OBLIGATORIA

```
MODIFICACION EN CUALQUIER CAPA
         |
         v
+-----------------------------+
| 1. COHERENCIA ENTRE CAPAS   |  <- BLOQUEANTE
| (DDL <-> Entity <-> DTO)    |
+-------------+---------------+
         |
         v
+-----------------------------+
| 2. INVENTARIOS SINCRONIZADOS |  <- BLOQUEANTE
| (conteos = codigo real)      |
+-------------+---------------+
         |
         v
+-----------------------------+
| 3. CLAUDE.md METRICAS       |  <- RECOMENDADO
| (si conteos cambiaron)       |
+-----------------------------+
```

---

## CHECKLIST

### 1. Coherencia DDL <-> Backend (BLOQUEANTE)

```markdown
[ ] Toda tabla DDL activa tiene entity TypeORM correspondiente
    (gap aceptable: 19 tablas de sistema/audit sin entity)
[ ] Campos de entity coinciden con columnas de tabla (nombres, tipos)
[ ] Relaciones TypeORM reflejan FKs del DDL
[ ] Toda entity con controller tiene al menos CreateDto y ResponseDto
[ ] Tipos TypeScript son compatibles con tipos PostgreSQL
    (ver: orchestration/patrones/MAPEO-TIPOS-DDL-TYPESCRIPT.md)
```

### 2. Coherencia Backend <-> Frontend (si aplica)

```markdown
[ ] Endpoints nuevos documentados en Swagger
[ ] Frontend API service consume endpoints con tipos correctos
[ ] Types frontend alineados con DTOs del backend
[ ] Si hay nuevo componente: integrado en ruta correspondiente
```

### 3. Sincronizacion de Inventarios (BLOQUEANTE)

```markdown
[ ] DATABASE_INVENTORY.yml refleja conteo real de:
    - Schemas (18)
    - Tablas (169)
    - Views (22)
    - Funciones (183)
    - Triggers (126)
[ ] BACKEND_INVENTORY.yml refleja conteo real de:
    - Modulos (22)
    - Entities (152)
    - Services (170)
    - Controllers (107)
    - Endpoints (899)
[ ] FRONTEND_INVENTORY.yml refleja conteo real de:
    - Componentes (474)
    - Hooks (101)
    - Paginas (68)
    - Stores Zustand (14)
    - API calls (655)
[ ] MASTER_INVENTORY.yml consolidado con totales correctos
```

### 4. Tolerancia y Gaps

```markdown
[ ] Diferencia entre inventario y codigo real < 5%
    Si > 5%: ACTUALIZAR inventario antes de cerrar tarea
[ ] Gaps conocidos documentados:
    - communication module sin .module.ts (gap conocido)
    - 19 tablas DDL sin entity (sistema/audit)
    - 237 endpoints sin consumidor frontend (admin/internos)
```

### 5. CLAUDE.md Metricas (RECOMENDADO)

```markdown
[ ] Si conteos de inventarios cambiaron: actualizar seccion METRICAS de CLAUDE.md
[ ] Verificar que CLAUDE.md y MASTER_INVENTORY.yml reportan mismos valores
```

---

## DECISION

```yaml
SI_PASA_TODO:
  accion: "Continuar con cierre de tarea"

SI_HAY_DISCREPANCIA_CAPAS:
  accion: "BLOQUEAR avance"
  proceso:
    1: "Identificar capa con discrepancia"
    2: "Propagar cambio a capas dependientes"
    3: "Actualizar inventarios"
    4: "Re-ejecutar este checklist"

SI_HAY_DISCREPANCIA_INVENTARIOS:
  accion: "Actualizar inventarios"
  proceso:
    1: "Contar objetos reales por capa"
    2: "Actualizar YAML correspondiente"
    3: "Actualizar MASTER_INVENTORY"
    4: "Re-ejecutar seccion 3"
```

---

## REFERENCIAS

- **Directiva:** [SIMCO-VALIDACION-SSOT](../directivas/simco/SIMCO-VALIDACION-SSOT.md)
- **Inventarios:** orchestration/inventarios/ (8 YAMLs)
- **CLAUDE.md:** Seccion METRICAS ACTUALES
- **Trigger:** TRIGGER-COHERENCIA-CAPAS
