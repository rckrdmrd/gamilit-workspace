# TRIGGER: INVENTARIOS SINCRONIZADOS

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Sistema:** SIMCO v4.0.0
**Alias:** @TRIGGER_INVENTARIOS

---

## RESUMEN EJECUTIVO

Este trigger OBLIGA a mantener los inventarios sincronizados con el código real. Se activa al completar cualquier tarea que modifique código o estructura.

**PRINCIPIO:** "Los inventarios son la fuente de verdad. Si no está en el inventario, no existe oficialmente."

---

## CONDICIONES DE ACTIVACIÓN

```yaml
activar_cuando:
  - Se completa cualquier tarea con cambios de código
  - Se crea/modifica/elimina: tabla, entity, service, módulo, componente
  - Se ejecuta auditoría de proyecto
  - Han pasado más de 7 días desde última sincronización
```

---

## INVENTARIOS REQUERIDOS POR PROYECTO

```yaml
inventarios_obligatorios:
  DATABASE_INVENTORY.yml:
    contenido:
      - Lista completa de schemas
      - Lista completa de tablas por schema
      - Conteo de funciones, triggers, policies
      - Estado de cada objeto (active/deprecated/planned)
    actualizar_cuando:
      - Crear/modificar/eliminar tabla
      - Crear/modificar/eliminar schema
      - Agregar/modificar funciones o triggers

  BACKEND_INVENTORY.yml:
    contenido:
      - Lista completa de módulos
      - Lista completa de entities por módulo
      - Lista completa de services por módulo
      - Conteo de endpoints por módulo
      - Estado de cada objeto
    actualizar_cuando:
      - Crear/modificar/eliminar entity
      - Crear/modificar/eliminar service
      - Crear/modificar/eliminar módulo
      - Agregar/modificar endpoints

  FRONTEND_INVENTORY.yml:
    contenido:
      - Lista completa de componentes
      - Lista completa de páginas
      - Lista completa de hooks/stores
      - Estado de cada objeto
    actualizar_cuando:
      - Crear/modificar/eliminar componente
      - Crear/modificar/eliminar página
      - Crear/modificar/eliminar hook/store

  MASTER_INVENTORY.yml:
    contenido:
      - Resumen de todos los inventarios
      - Totales consolidados
      - Última fecha de sincronización
      - Score de coherencia
    actualizar_cuando:
      - Se actualiza cualquier otro inventario
```

---

## VERIFICACIONES DE SINCRONIZACIÓN

### 1. Verificar Cobertura de Inventarios

```yaml
cobertura_minima:
  DATABASE_INVENTORY:
    schemas: "100% de schemas en DDL"
    tablas: "100% de tablas en DDL"
    funciones: "100% de funciones en DDL"

  BACKEND_INVENTORY:
    modulos: "100% de carpetas en modules/"
    entities: "100% de archivos .entity.ts"
    services: "100% de archivos .service.ts"

  FRONTEND_INVENTORY:
    componentes: "100% de archivos .tsx en components/"
    paginas: "100% de archivos en pages/"
    stores: "100% de stores/hooks"
```

### 2. Verificar Consistencia de Conteos

```yaml
validacion_conteos:
  comparar:
    - "Conteo en inventario vs archivos reales"
    - "Conteo reportado en _INDEX.yml vs inventario"
    - "Conteo entre inventarios relacionados"

  tolerancia: "0% - Debe ser exacto"

  si_discrepancia:
    accion: "BLOQUEAR hasta sincronizar"
```

### 3. Verificar Actualización Reciente

```yaml
frescura:
  maxima_antiguedad: "7 días"

  verificar:
    - "Fecha de última actualización en inventario"
    - "Comparar con fecha de último commit en código"

  si_desactualizado:
    accion: "ADVERTIR y solicitar sincronización"
```

---

## PROCESO DE SINCRONIZACIÓN

### Sincronización Manual

```bash
# El agente debe ejecutar para cada inventario:

# 1. Contar objetos reales
find apps/database/ddl -name "*.sql" -exec grep -l "CREATE TABLE" {} \; | wc -l
find apps/backend/src/modules -name "*.entity.ts" | wc -l
find apps/backend/src/modules -name "*.service.ts" | wc -l

# 2. Comparar con inventario
# 3. Actualizar inventario si hay discrepancia
# 4. Actualizar timestamp de sincronización
```

### Campos Obligatorios en Inventarios

```yaml
metadata_obligatoria:
  version: "Semver del inventario"
  updated: "Fecha ISO de última actualización"
  updated_by: "Agente que actualizó"
  sync_status: "SYNCED | OUT_OF_SYNC | PARTIAL"
  coverage:
    total_expected: "N objetos esperados"
    total_documented: "N objetos documentados"
    percentage: "100%"
```

---

## CHECKLIST DE SINCRONIZACIÓN

### Al Completar Tarea

```markdown
## Verificación de Inventarios

### DATABASE_INVENTORY.yml
[ ] Conteo de schemas correcto
[ ] Conteo de tablas correcto
[ ] Nuevos objetos agregados
[ ] Objetos eliminados removidos
[ ] Timestamp actualizado

### BACKEND_INVENTORY.yml
[ ] Conteo de módulos correcto
[ ] Conteo de entities correcto
[ ] Conteo de services correcto
[ ] Conteo de endpoints correcto
[ ] Nuevos objetos agregados
[ ] Timestamp actualizado

### FRONTEND_INVENTORY.yml
[ ] Conteo de componentes correcto
[ ] Conteo de páginas correcto
[ ] Nuevos objetos agregados
[ ] Timestamp actualizado

### MASTER_INVENTORY.yml
[ ] Totales consolidados correctos
[ ] Score de coherencia actualizado
[ ] Timestamp actualizado
```

---

## INTEGRACIÓN CON TRIGGER-COHERENCIA-CAPAS

```yaml
secuencia:
  1: "TRIGGER-COHERENCIA-CAPAS verifica estructura"
  2: "TRIGGER-INVENTARIOS-SINCRONIZADOS verifica documentación"
  3: "TRIGGER-DOCUMENTACION-OBLIGATORIA verifica gobernanza"

dependencia:
  - "Coherencia debe pasar ANTES de sincronizar inventarios"
  - "Inventarios deben estar sincronizados ANTES de documentar"
```

---

## MENSAJES DE ERROR

```yaml
errores:
  E-INV-001:
    mensaje: "Inventario desactualizado (más de 7 días)"
    accion: "Ejecutar sincronización de inventario"
    bloqueante: false (advertencia)

  E-INV-002:
    mensaje: "Discrepancia de conteo en inventario"
    accion: "Sincronizar inventario con código real"
    bloqueante: true

  E-INV-003:
    mensaje: "Objeto en código no documentado en inventario"
    accion: "Agregar objeto al inventario"
    bloqueante: true

  E-INV-004:
    mensaje: "Objeto en inventario no existe en código"
    accion: "Remover objeto del inventario o restaurar código"
    bloqueante: true

  E-INV-005:
    mensaje: "Inventario faltante"
    accion: "Crear inventario siguiendo template"
    bloqueante: true
```

---

## AUTOMATIZACIÓN FUTURA

```yaml
scripts_recomendados:
  sync-database-inventory:
    descripcion: "Sincronizar DATABASE_INVENTORY.yml automáticamente"
    implementar_en: "scripts/sync-inventories.sh"

  sync-backend-inventory:
    descripcion: "Sincronizar BACKEND_INVENTORY.yml automáticamente"
    implementar_en: "scripts/sync-inventories.sh"

  validate-inventories:
    descripcion: "Validar que todos los inventarios estén sincronizados"
    implementar_en: "scripts/validate-inventories.sh"

  estado: "DOCUMENTADO - Por implementar"
```

---

## REFERENCIAS

| Alias | Descripción |
|-------|-------------|
| @TRIGGER_INVENTARIOS | Este trigger |
| @TRIGGER_COHERENCIA | Coherencia entre capas |
| @DEF_CHK_POST | Checklist post-tarea |

---

**Versión:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Trigger de Sincronización
