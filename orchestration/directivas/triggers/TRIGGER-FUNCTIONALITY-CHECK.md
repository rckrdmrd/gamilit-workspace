# TRIGGER-FUNCTIONALITY-CHECK.md
# Trigger de Verificación Automática de Funcionalidades

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Tipo:** Trigger Automático
**Ejecutor:** @WS_ORCHESTRATOR

---

## PROPÓSITO

Este trigger automatiza:
1. Detección de nuevas funcionalidades creadas
2. Verificación de duplicados entre proyectos
3. Validación de coherencia DDL-Backend-Frontend
4. Identificación de candidatos para consolidación
5. Actualización del inventario de funcionalidades

---

## EVENTOS DISPARADORES

### 1. Creación de Nueva Entidad/Tabla

```yaml
trigger: NEW_ENTITY_CREATED
condiciones:
  - Nuevo archivo .entity.ts creado
  - Nueva migración SQL creada
  - Nuevo archivo de schema DDL

acciones:
  - name: "check_catalog_exists"
    descripción: "Verificar si funcionalidad similar existe en shared/catalog"

  - name: "check_other_projects"
    descripción: "Buscar entidades similares en otros proyectos"

  - name: "register_if_new"
    condición: "No existe similar"
    acción: "Registrar en FUNCTIONALITY-INVENTORY.yml"

  - name: "warn_if_duplicate"
    condición: "Existe similar"
    acción: "ADVERTIR: Posible duplicado detectado"

prioridad: SYNC
bloquea_trabajo: true
```

### 2. Creación de Nuevo Módulo Backend

```yaml
trigger: NEW_MODULE_CREATED
condiciones:
  - Nuevo directorio de módulo NestJS creado
  - Archivo .module.ts creado

acciones:
  - name: "analyze_module_purpose"
    descripción: "Determinar funcionalidad que implementa"

  - name: "check_catalog"
    descripción: "Verificar si existe módulo similar en catalog"

  - name: "check_ddl_coherence"
    descripción: "Verificar que existan tablas correspondientes"

  - name: "update_inventory"
    descripción: "Actualizar capa backend en inventario"

prioridad: NORMAL
bloquea_trabajo: false
```

### 3. Creación de Feature Frontend

```yaml
trigger: NEW_FEATURE_CREATED
condiciones:
  - Nuevo directorio en features/ o pages/
  - Nuevos componentes relacionados creados

acciones:
  - name: "verify_backend_exists"
    descripción: "Verificar que exista backend correspondiente"

  - name: "verify_api_integration"
    descripción: "Verificar que existan endpoints para consumir"

  - name: "update_inventory"
    descripción: "Actualizar capa frontend en inventario"

prioridad: NORMAL
bloquea_trabajo: false
```

### 4. Auditoría Periódica

```yaml
trigger: PERIODIC_AUDIT
condiciones:
  - Semanal (configurable)
  - Al inicio de sprint/ciclo

acciones:
  - name: "scan_all_projects"
    descripción: "Escanear todos los proyectos por funcionalidades"

  - name: "compare_with_inventory"
    descripción: "Comparar con inventario registrado"

  - name: "detect_unregistered"
    descripción: "Detectar funcionalidades no registradas"

  - name: "detect_duplicates"
    descripción: "Identificar duplicados nuevos"

  - name: "generate_report"
    descripción: "Generar reporte de auditoría"

prioridad: BACKGROUND
bloquea_trabajo: false
```

### 5. Cambio en Funcionalidad Existente

```yaml
trigger: FUNCTIONALITY_MODIFIED
condiciones:
  - Modificación significativa en entity/service/component existente
  - Cambio de schema en tabla existente

acciones:
  - name: "identify_functionality"
    descripción: "Identificar a qué funcionalidad pertenece"

  - name: "check_propagation_needed"
    condición: "Funcionalidad es SHARED o CORE"
    acción: "Evaluar si cambio debe propagarse"

  - name: "verify_coherence"
    descripción: "Verificar que cambio mantenga coherencia entre capas"

  - name: "update_inventory_version"
    descripción: "Actualizar versión en inventario"

prioridad: NORMAL
bloquea_trabajo: false
```

---

## MATRIZ DE DETECCIÓN

### Patrones de Detección por Capa

```yaml
ddl:
  patrones:
    - "*.sql" en ddl/schemas/
    - "*.sql" en migrations/
    - Archivos con CREATE TABLE/ALTER TABLE

  extracción:
    - nombre_tabla
    - columnas
    - foreign_keys
    - rls_policies

backend:
  patrones:
    - "*.entity.ts"
    - "*.service.ts"
    - "*.module.ts"
    - "*.controller.ts"
    - "*.resolver.ts"

  extracción:
    - nombre_entidad
    - relaciones
    - métodos_service
    - endpoints

frontend:
  patrones:
    - "*/features/*"
    - "*/pages/*"
    - "*.hook.ts" | "use*.ts"
    - "*/components/*"

  extracción:
    - nombre_feature
    - hooks_usados
    - api_calls
    - componentes
```

### Criterios de Similitud

```yaml
similitud_entidades:
  umbral: 70%
  factores:
    - nombre_similar: 30%
    - columnas_comunes: 40%
    - relaciones_similares: 20%
    - propósito_similar: 10%

similitud_services:
  umbral: 60%
  factores:
    - métodos_similares: 50%
    - dependencias_comunes: 30%
    - nombre_similar: 20%

similitud_componentes:
  umbral: 65%
  factores:
    - props_similares: 35%
    - estructura_similar: 35%
    - hooks_usados: 20%
    - nombre_similar: 10%
```

---

## FLUJOS DE VERIFICACIÓN

### Flujo: Nueva Funcionalidad

```
[Detectar creación de archivo]
         │
         ▼
[Clasificar tipo: DDL/Backend/Frontend]
         │
         ▼
[Extraer metadatos]
         │
         ▼
[Buscar similares en:]
    ├── shared/catalog/
    ├── FUNCTIONALITY-INVENTORY.yml
    └── Otros proyectos
         │
         ├── ENCONTRADO SIMILAR
         │         │
         │         ▼
         │   [Calcular % similitud]
         │         │
         │         ├── >80% ──> ⛔ DETENER: "Duplicado detectado"
         │         │                  │
         │         │                  ▼
         │         │            [Mostrar existente]
         │         │            [Sugerir reutilizar]
         │         │
         │         └── 50-80% ──> ⚠️ ADVERTIR: "Similar encontrado"
         │                              │
         │                              ▼
         │                        [Preguntar si es intencional]
         │
         └── NO ENCONTRADO
                   │
                   ▼
             [Registrar en inventario]
                   │
                   ▼
             [Verificar coherencia entre capas]
```

### Flujo: Verificación de Coherencia

```
[Funcionalidad identificada]
         │
         ▼
[Obtener implementaciones por capa]
         │
         ├── DDL: ¿Existe tabla/schema?
         │         │
         │         ├── SÍ ──> ✓
         │         └── NO ──> ⚠️ "Falta DDL para {funcionalidad}"
         │
         ├── Backend: ¿Existe entity/service?
         │         │
         │         ├── SÍ ──> ✓
         │         └── NO ──> ⚠️ "Falta Backend para {funcionalidad}"
         │
         └── Frontend: ¿Existe feature/hook?
                   │
                   ├── SÍ ──> ✓
                   ├── NO + requerido ──> ⚠️ "Falta Frontend"
                   └── NO + no requerido ──> ✓ (backend-only OK)
```

### Flujo: Auditoría Semanal

```
[Trigger semanal activado]
         │
         ▼
[Escanear proyectos por funcionalidades]
         │
         ▼
[Comparar con FUNCTIONALITY-INVENTORY.yml]
         │
         ├── Funcionalidades no registradas ──> [Agregar al inventario]
         │
         ├── Funcionalidades eliminadas ──> [Marcar como deprecated]
         │
         ├── Duplicados nuevos ──> [Agregar a consolidation.duplicates]
         │
         └── Inconsistencias de coherencia ──> [Reportar]
                   │
                   ▼
             [Generar AUDIT-REPORT.md]
                   │
                   ▼
             [Notificar a @WS_ORCHESTRATOR]
```

---

## ACCIONES AUTOMÁTICAS

### Registro Automático en Inventario

```yaml
# Cuando se confirma nueva funcionalidad única

auto_register:
  enabled: true

  template: |
    {functionality_id}:
      name: "{nombre_detectado}"
      type: "PROJECT-SPECIFIC"
      status: "development"

      implementations:
        {proyecto}:
          version: "1.0.0"
          status: "development"
          layers:
            ddl:
              tables: [{tablas_detectadas}]
            backend:
              modules: [{modulos_detectados}]
              services: [{services_detectados}]
            frontend:
              features: [{features_detectadas}]

      consolidation:
        candidate_for_shared: false
        duplicates_detected: []

  post_register:
    - Notificar: "Nueva funcionalidad registrada: {id}"
    - Actualizar: statistics.total_functionalities
```

### Marcado de Duplicados

```yaml
# Cuando se detecta duplicado

auto_mark_duplicate:
  enabled: true

  acciones:
    - Agregar a consolidation.duplicates_detected
    - Calcular prioridad de consolidación
    - Generar recommendation si P1/P2
    - Notificar a @ARCHITECTURE-ANALYST si crítico
```

### Alertas de Incoherencia

```yaml
# Cuando se detecta incoherencia entre capas

auto_alert:
  enabled: true

  tipos:
    - ddl_sin_backend:
        mensaje: "Tabla {tabla} sin Entity correspondiente"
        severidad: WARNING

    - backend_sin_ddl:
        mensaje: "Entity {entity} sin tabla correspondiente"
        severidad: ERROR

    - frontend_sin_backend:
        mensaje: "Feature {feature} sin API correspondiente"
        severidad: WARNING

    - backend_sin_frontend:
        mensaje: "API {endpoint} sin integración frontend"
        severidad: INFO  # Puede ser intencional
```

---

## SCRIPT DE AUDITORÍA

```bash
#!/bin/bash
# scripts/workspace/audit-functionalities.sh

# Escanear todos los proyectos
# Comparar con inventario
# Generar reporte

OPCIONES:
  --full          Auditoría completa
  --quick         Solo verificar cambios recientes
  --project X     Solo un proyecto
  --report        Generar reporte markdown
  --fix           Intentar corregir inconsistencias automáticamente
```

---

## REPORTE DE AUDITORÍA

### Template de Reporte

```markdown
# Reporte de Auditoría de Funcionalidades
**Fecha:** {fecha}
**Ejecutado por:** @WS_ORCHESTRATOR

## Resumen

| Métrica | Valor |
|---------|-------|
| Funcionalidades totales | {total} |
| Nuevas detectadas | {nuevas} |
| Duplicados encontrados | {duplicados} |
| Incoherencias | {incoherencias} |

## Funcionalidades No Registradas

{lista_no_registradas}

## Duplicados Detectados

| Funcionalidad | Proyectos | Similitud | Prioridad |
|---------------|-----------|-----------|-----------|
{tabla_duplicados}

## Incoherencias Entre Capas

{lista_incoherencias}

## Recomendaciones

{recomendaciones}

---
*Próxima auditoría programada: {proxima_fecha}*
```

---

## CONFIGURACIÓN

```yaml
# orchestration/config/functionality-check.yml

functionality_check:
  enabled: true

  triggers:
    on_file_create: true
    on_file_modify: true
    periodic_audit: true

  periodic:
    frequency: "weekly"
    day: "monday"
    time: "09:00"

  detection:
    similarity_threshold: 70
    auto_register_new: true
    auto_mark_duplicates: true

  alerts:
    on_duplicate: true
    on_incoherence: true
    on_unregistered: true

  notifications:
    channel: "workspace-alerts"
    mention_on_critical: true

  exclusions:
    projects:
      - "sandbox"
      - "experiments"
    patterns:
      - "*.test.ts"
      - "*.spec.ts"
      - "*.mock.ts"
```

---

## INTEGRACIÓN

### Con FUNCTIONALITY-INVENTORY.yml

```
Este trigger es el principal actualizador del inventario:
- Agrega nuevas funcionalidades detectadas
- Actualiza versiones cuando hay cambios
- Marca duplicados en consolidation
- Mantiene estadísticas actualizadas
```

### Con TRIGGER-PROPAGACION-AUTOMATICA

```
Cuando se detecta cambio en funcionalidad SHARED/CORE:
1. Este trigger identifica el cambio
2. Activa TRIGGER-PROPAGACION-AUTOMATICA
3. Propagación ejecuta según reglas
4. Este trigger verifica coherencia post-propagación
```

### Con SIMCO-FUNCIONALIDADES

```
Este trigger implementa las verificaciones definidas en SIMCO-FUNCIONALIDADES:
- Verificación anti-duplicación
- Coherencia entre capas
- Candidatos para consolidación
```

---

## MÉTRICAS

```yaml
métricas:
  - functionalities_scanned_total
  - duplicates_detected_total
  - incoherences_found_total
  - auto_registrations_total
  - audit_duration_seconds
  - inventory_accuracy_percent

dashboards:
  - funcionalidades_por_proyecto
  - tendencia_duplicados
  - coherencia_por_capa
  - candidatos_consolidacion
```

---

**Última actualización:** 2026-01-16
**Mantenido por:** @WS_ORCHESTRATOR
