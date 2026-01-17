# TRIGGER: Sincronización de Referencias

**Version:** 1.0
**Fecha:** 2026-01-16
**Estado:** ACTIVO
**Tipo:** POST-CAMBIO ESTRUCTURAL

---

## DESCRIPCIÓN

Este trigger se activa automáticamente cuando cualquier agente crea, modifica o elimina objetos estructurales (tablas, entities, componentes, services). Garantiza que los archivos de referencia e inventarios se mantengan sincronizados.

---

## CONDICIONES DE ACTIVACIÓN

### Evento 1: Creación de Objeto

```yaml
cuando:
  - Se crea archivo *.sql en apps/database/ddl/schemas/*/tables/
  - Se crea archivo *.entity.ts en apps/backend/src/modules/*/entities/
  - Se crea archivo *.tsx en apps/frontend/src/components/
  - Se crea archivo *.service.ts en apps/backend/src/modules/*/services/
  - Se crea archivo *.controller.ts en apps/backend/src/modules/*/controllers/

entonces:
  activar: "TRIGGER-SINCRONIZACION-REFERENCIAS"
  prioridad: "ALTA"
  bloquea_commit: false
```

### Evento 2: Eliminación de Objeto

```yaml
cuando:
  - Se elimina cualquier archivo de los tipos anteriores
  - Se mueve archivo a carpeta _deprecated/

entonces:
  activar: "TRIGGER-SINCRONIZACION-REFERENCIAS"
  prioridad: "ALTA"
  bloquea_commit: false
```

### Evento 3: Modificación Estructural

```yaml
cuando:
  - Se renombra tabla o entity
  - Se cambia schema de una tabla
  - Se mueve componente entre features

entonces:
  activar: "TRIGGER-SINCRONIZACION-REFERENCIAS"
  prioridad: "CRITICA"
  bloquea_commit: true  # Debe actualizarse antes de commit
```

---

## ACCIONES A EJECUTAR

### Para Creación de Tabla DDL

```yaml
acciones:
  1_actualizar_mapa:
    archivo: "orchestration/referencias/TABLE-ENTITY-MAP.yml"
    accion: "Agregar entrada en schema correspondiente"
    campos:
      - nombre de tabla
      - entity: null (si no existe aún)
      - path: ruta al archivo SQL

  2_actualizar_inventario:
    archivo: "orchestration/inventarios/DATABASE_INVENTORY.yml"
    accion: "Incrementar contador de tablas"

  3_actualizar_master:
    archivo: "orchestration/inventarios/MASTER_INVENTORY.yml"
    accion: "Actualizar resumen.database.tables"

  4_verificar_documentacion:
    buscar: "RF-*.md que corresponda al schema"
    accion: "Agregar tabla a refs.database.tables si no existe"

  5_log:
    registrar: "Tabla {nombre} creada en {schema}"
```

### Para Creación de Entity

```yaml
acciones:
  1_actualizar_mapa:
    archivo: "orchestration/referencias/TABLE-ENTITY-MAP.yml"
    accion: "Actualizar entrada de tabla con entity"
    campos:
      - entity: nombre del archivo
      - path: ruta al archivo

  2_actualizar_indice_inverso:
    archivo: "orchestration/referencias/TABLE-ENTITY-MAP.yml"
    seccion: "entity_to_table"
    accion: "Agregar mapeo inverso"

  3_actualizar_inventario:
    archivo: "orchestration/inventarios/BACKEND_INVENTORY.yml"
    accion: "Incrementar contador de entities"

  4_actualizar_coherencia:
    archivo: "orchestration/referencias/TABLE-ENTITY-MAP.yml"
    seccion: "coherencia"
    accion: "Recalcular porcentaje"

  5_log:
    registrar: "Entity {nombre} creada para tabla {tabla}"
```

### Para Creación de Componente Frontend

```yaml
acciones:
  1_actualizar_funcionalidad:
    archivo: "orchestration/referencias/FUNCTIONALITY-INDEX.yml"
    accion: "Agregar componente a funcionalidad correspondiente"

  2_actualizar_inventario:
    archivo: "orchestration/inventarios/FRONTEND_INVENTORY.yml"
    accion: "Incrementar contador de componentes"

  3_verificar_documentacion:
    buscar: "US-*.md que corresponda a la feature"
    accion: "Agregar componente a refs.frontend.components"

  4_log:
    registrar: "Componente {nombre} creado en feature {feature}"
```

### Para Eliminación

```yaml
acciones:
  1_remover_referencias:
    archivos:
      - TABLE-ENTITY-MAP.yml
      - FUNCTIONALITY-INDEX.yml
      - "*_INVENTORY.yml"
    accion: "Remover todas las entradas del objeto eliminado"

  2_verificar_dependencias:
    accion: "Buscar referencias huérfanas en documentación"
    alertar_si: "Hay referencias en RF/US que apuntan a objeto eliminado"

  3_actualizar_contadores:
    archivos: "*_INVENTORY.yml, MASTER_INVENTORY.yml"
    accion: "Decrementar contadores correspondientes"

  4_log:
    registrar: "Objeto {nombre} eliminado, referencias actualizadas"
```

---

## CHECKLIST POST-TRIGGER

```markdown
## Verificación de Sincronización

### Archivos de Referencia
- [ ] TABLE-ENTITY-MAP.yml actualizado
- [ ] FUNCTIONALITY-INDEX.yml actualizado (si aplica)
- [ ] SCHEMA-REFERENCES.yml actualizado (si nuevo schema)

### Inventarios
- [ ] DATABASE_INVENTORY.yml actualizado (si cambio DDL)
- [ ] BACKEND_INVENTORY.yml actualizado (si cambio Backend)
- [ ] FRONTEND_INVENTORY.yml actualizado (si cambio Frontend)
- [ ] MASTER_INVENTORY.yml actualizado

### Coherencia
- [ ] Porcentaje de coherencia recalculado
- [ ] No hay referencias huérfanas

### Documentación
- [ ] RF/ET/US correspondiente tiene refs actualizados
- [ ] TRACEABILITY.yml de épica actualizado
```

---

## INTEGRACIÓN CON FLUJO DE TRABAJO

### Pre-Commit Hook (Recomendado)

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Detectar cambios en archivos estructurales
ESTRUCTURALES=$(git diff --cached --name-only | grep -E '\.(entity|sql|service|controller)\.ts$|\.tsx$')

if [ -n "$ESTRUCTURALES" ]; then
  echo "⚠️  Cambios estructurales detectados:"
  echo "$ESTRUCTURALES"
  echo ""
  echo "Verificar que se actualizaron:"
  echo "  - orchestration/referencias/*.yml"
  echo "  - orchestration/inventarios/*_INVENTORY.yml"
  echo ""
  read -p "¿Se actualizaron las referencias? (y/n): " respuesta
  if [ "$respuesta" != "y" ]; then
    echo "Commit cancelado. Actualizar referencias primero."
    exit 1
  fi
fi
```

### En Tarea de Agente

```yaml
# Incluir en CAPVED fase D (Documentación)
fase_d_documentacion:
  - Actualizar inventarios
  - Actualizar archivos de referencia
  - Verificar coherencia
  - Ejecutar checklist post-trigger
```

---

## MENSAJES DE LOG

```yaml
# Formato de logs
formato: "[TRIGGER-SYNC] {timestamp} | {tipo_objeto} | {accion} | {detalles}"

ejemplos:
  - "[TRIGGER-SYNC] 2026-01-16 12:00 | TABLE | CREATE | gamification_system.new_table"
  - "[TRIGGER-SYNC] 2026-01-16 12:01 | ENTITY | CREATE | new-table.entity.ts → new_table"
  - "[TRIGGER-SYNC] 2026-01-16 12:02 | INVENTORY | UPDATE | DATABASE +1 tabla (total: 138)"
  - "[TRIGGER-SYNC] 2026-01-16 12:03 | COHERENCE | UPDATE | 91% (125/138)"
```

---

## EXCEPCIONES

### Objetos que NO activan trigger

```yaml
excluir:
  - "*.spec.ts"         # Tests
  - "*.test.tsx"        # Tests
  - "*.config.ts"       # Configuración
  - "*.dto.ts"          # Solo contar, no detallar
  - "*.mock.ts"         # Mocks
  - "_deprecated/*"     # Ya están marcados como obsoletos
```

### Situaciones especiales

```yaml
migracion_masiva:
  descripcion: "Cuando se migran muchos objetos a la vez"
  accion: "Ejecutar trigger una vez al final, no por cada objeto"
  comando: "npm run sync:references --batch"

refactoring:
  descripcion: "Renombrado o movimiento de archivos"
  accion: "Actualizar referencias en lugar de crear/eliminar"
  verificar: "Que no queden referencias huérfanas"
```

---

## RESPONSABLE

```yaml
agente_responsable: "TRACEABILITY-MANAGER"
perfil: "orchestration/agentes/perfiles/PERFIL-TRACEABILITY-MANAGER.md"
alternativo: "Cualquier agente que haga el cambio estructural"
```

---

## REFERENCIAS

- `DIRECTIVA-TRAZABILIDAD-REFERENCIAS.md` - Directiva principal
- `ESTANDAR-ESTRUCTURA-REFERENCIAS.md` - Formato de archivos
- `PERFIL-TRACEABILITY-MANAGER.md` - Agente responsable
- `MODELO-TRAZABILIDAD-COMPLEMENTARIO-2026-01-16.md` - Arquitectura

---

*Trigger creado por Claude Opus 4.5*
*Sistema SIMCO v4.0.0*
*Proyecto GAMILIT*
