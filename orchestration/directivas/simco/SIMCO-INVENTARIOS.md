# SIMCO-INVENTARIOS
**Version:** 1.0.0
**Tipo:** Directiva Operacional
**Prioridad:** P1
**Alias:** @INVENTARIOS
**Creado:** 2026-01-10
**Depende de:** SIMCO-DOCUMENTACION-PROYECTO.md

---

## 1. Proposito

Estandarizar los inventarios YAML como Single Source of Truth (SSOT) para el estado de proyectos, bases de datos, backend y frontend.

---

## 2. Principios de Inventarios

### 2.1 Single Source of Truth (SSOT)

Los inventarios son LA fuente canonica de:
- Estado del proyecto
- Progreso de desarrollo
- Estructura de base de datos
- Modulos implementados
- Paginas/Componentes del frontend

### 2.2 Actualizacion Continua

- Actualizar despues de cada cambio significativo
- Incluir timestamp de actualizacion
- Mantener version semantica

---

## 3. Tipos de Inventarios

### 3.1 MASTER_INVENTORY.yml

**Proposito:** Estado consolidado del proyecto completo

**Ubicacion:** `/orchestration/inventarios/MASTER_INVENTORY.yml`

```yaml
# MASTER_INVENTORY.yml
metadata:
  proyecto: "{nombre_proyecto}"
  tipo: "{Standalone|Suite|Suite-Core|Vertical}"
  version: "{SEMVER}"
  updated: "{YYYY-MM-DD}"

resumen:
  progreso_mvp: "{N}%"
  story_points_completados: {N}
  story_points_totales: {N}
  tareas_completadas: {N}
  tareas_totales: {N}
  cobertura_tests: "{N}%"

fases:
  - nombre: "Fase {N} - {Nombre}"
    codigo: "{CODIGO}"
    estado: "{completado|en_progreso|pendiente}"
    progreso: "{N}%"
    fecha_inicio: "{YYYY-MM-DD}"
    fecha_fin: "{YYYY-MM-DD}"
    epicas: {N}

epicas:
  - codigo: "{EAI-NNN|MGN-NNN}"
    nombre: "{nombre}"
    fase: "{N}"
    estado: "{completado|en_progreso|pendiente}"
    progreso: "{N}%"
    story_points: {N}
    stories: {N}

aplicaciones:
  backend:
    - servicio: "{nombre}"
      ruta: "{ruta/relativa}"
      puerto: {N}
      estado: "{activo|inactivo|desarrollo}"
      framework: "{NestJS|Express|FastAPI}"
  frontend:
    - servicio: "{nombre}"
      ruta: "{ruta/relativa}"
      puerto: {N}
      estado: "{activo|inactivo|desarrollo}"
      framework: "{React|Next.js|Vue}"
  database:
    - nombre: "{nombre_bd}"
      tipo: "{PostgreSQL|MySQL|MongoDB}"
      schemas: {N}
      estado: "{activo|inactivo}"

integraciones:
  - nombre: "{nombre_integracion}"
    proveedor: "{proveedor}"
    estado: "{activo|configurado|pendiente}"
```

### 3.2 DATABASE_INVENTORY.yml

**Proposito:** Estado detallado de la base de datos

**Ubicacion:** `/orchestration/inventarios/DATABASE_INVENTORY.yml`

```yaml
# DATABASE_INVENTORY.yml
metadata:
  proyecto: "{nombre_proyecto}"
  tipo: "DATABASE"
  version: "{SEMVER}"
  updated: "{YYYY-MM-DD}"
  motor: "{PostgreSQL|MySQL}"
  version_motor: "{version}"

resumen:
  total_schemas: {N}
  total_tablas: {N}
  total_funciones: {N}
  total_triggers: {N}
  total_indices: {N}

schemas:
  - nombre: "{schema_name}"
    descripcion: "{descripcion}"
    estado: "{implementado|parcial|pendiente}"
    tablas:
      - nombre: "{tabla}"
        columnas: {N}
        indices: {N}
        foreign_keys: {N}
        estado: "{implementada|pendiente}"
        rls: {true|false}

    # Funciones (agregado por validacion)
    funciones:
      - nombre: "{nombre_funcion}"
        tipo: "{scalar|table|trigger}"
        parametros: {N}
        descripcion: "{descripcion}"

    # Triggers (agregado por validacion)
    triggers:
      - nombre: "{nombre_trigger}"
        tabla: "{tabla_asociada}"
        evento: "{INSERT|UPDATE|DELETE|TRUNCATE}"
        timing: "{BEFORE|AFTER|INSTEAD OF}"
        funcion: "{nombre_funcion}"

vistas:
  - nombre: "{nombre_vista}"
    schema: "{schema}"
    dependencias: ["{tabla1}", "{tabla2}"]

migraciones:
  ultima: "{YYYYMMDDHHMMSS}"
  pendientes: {N}
  historial:
    - id: "{YYYYMMDDHHMMSS}"
      descripcion: "{descripcion}"
      fecha: "{YYYY-MM-DD}"
```

### 3.3 BACKEND_INVENTORY.yml

**Proposito:** Estado de modulos del backend

**Ubicacion:** `/orchestration/inventarios/BACKEND_INVENTORY.yml`

```yaml
# BACKEND_INVENTORY.yml
metadata:
  proyecto: "{nombre_proyecto}"
  tipo: "BACKEND"
  version: "{SEMVER}"
  updated: "{YYYY-MM-DD}"
  framework: "{NestJS|Express|FastAPI}"
  lenguaje: "{TypeScript|Python}"

resumen:
  total_modulos: {N}
  total_controllers: {N}
  total_services: {N}
  total_endpoints: {N}
  cobertura_tests: "{N}%"

modulos:
  - nombre: "{nombre_modulo}"
    ruta: "{src/modules/nombre}"
    estado: "{implementado|parcial|pendiente}"
    controllers: {N}
    services: {N}
    dtos: {N}
    entities: {N}
    endpoints:
      - metodo: "{GET|POST|PUT|DELETE|PATCH}"
        ruta: "/api/{recurso}"
        descripcion: "{descripcion}"
        auth: {true|false}
        roles: ["{rol1}", "{rol2}"]

shared:
  - tipo: "{constants|dto|guards|pipes|decorators}"
    archivos: {N}
    ruta: "{src/shared/tipo}"

tests:
  unit:
    archivos: {N}
    cobertura: "{N}%"
  integration:
    archivos: {N}
    cobertura: "{N}%"
  e2e:
    archivos: {N}
```

### 3.4 FRONTEND_INVENTORY.yml

**Proposito:** Estado de paginas y componentes frontend

**Ubicacion:** `/orchestration/inventarios/FRONTEND_INVENTORY.yml`

```yaml
# FRONTEND_INVENTORY.yml
metadata:
  proyecto: "{nombre_proyecto}"
  tipo: "FRONTEND"
  version: "{SEMVER}"
  updated: "{YYYY-MM-DD}"
  framework: "{React|Next.js|Vue}"
  lenguaje: "{TypeScript|JavaScript}"

resumen:
  total_paginas: {N}
  total_componentes: {N}
  total_hooks: {N}
  total_stores: {N}
  cobertura_tests: "{N}%"

aplicaciones:
  - nombre: "{nombre_app}"  # admin, student, teacher, etc.
    ruta: "{apps/frontend-nombre}"
    puerto: {N}
    paginas:
      - nombre: "{NombrePagina}"
        ruta: "/{ruta}"
        componentes: {N}
        estado: "{implementada|parcial|pendiente}"
        auth: {true|false}
        roles: ["{rol1}", "{rol2}"]

componentes:
  shared:
    - nombre: "{NombreComponente}"
      ruta: "{components/shared/Nombre}"
      tipo: "{UI|Layout|Form|Data}"
      reutilizable: {true|false}

  features:
    - nombre: "{NombreComponente}"
      feature: "{feature_name}"
      ruta: "{components/features/feature/Nombre}"

hooks:
  - nombre: "{useNombreHook}"
    ruta: "{hooks/useNombreHook}"
    proposito: "{descripcion}"

stores:
  - nombre: "{nombreStore}"
    ruta: "{stores/nombreStore}"
    tipo: "{Zustand|Redux|Context}"

tests:
  unit:
    archivos: {N}
    cobertura: "{N}%"
  component:
    archivos: {N}
    cobertura: "{N}%"
```

---

## 4. Campos Obligatorios

### Por Tipo de Inventario

| Campo | MASTER | DATABASE | BACKEND | FRONTEND |
|-------|--------|----------|---------|----------|
| metadata.proyecto | SI | SI | SI | SI |
| metadata.tipo | SI | SI | SI | SI |
| metadata.version | SI | SI | SI | SI |
| metadata.updated | SI | SI | SI | SI |
| resumen | SI | SI | SI | SI |
| fases | SI | NO | NO | NO |
| schemas | NO | SI | NO | NO |
| modulos | NO | NO | SI | NO |
| paginas | NO | NO | NO | SI |

---

## 5. Actualizacion y Mantenimiento

### 5.1 Cuando Actualizar

| Evento | Inventario | Accion |
|--------|------------|--------|
| Nueva tabla creada | DATABASE | Agregar entrada |
| Endpoint implementado | BACKEND | Actualizar modulo |
| Pagina completada | FRONTEND | Cambiar estado |
| Fase completada | MASTER | Actualizar progreso |
| Sprint finalizado | MASTER | Recalcular metricas |

### 5.2 Formato de Version

```
{MAJOR}.{MINOR}.{PATCH}

- MAJOR: Cambio estructural del inventario
- MINOR: Nuevas secciones agregadas
- PATCH: Actualizacion de datos
```

### 5.3 Historial de Cambios

Incluir en el inventario:

```yaml
changelog:
  - version: "1.2.3"
    fecha: "2026-01-10"
    cambios:
      - "Agregado modulo auth"
      - "Actualizado progreso fase 2"
```

---

## 6. Validacion de Inventarios

### 6.1 Checklist de Validacion

Ver: `CHECKLIST-INVENTARIOS.md`

### 6.2 Comandos de Verificacion

```bash
# Validar YAML syntax
yamllint orchestration/inventarios/*.yml

# Verificar que existen todos los inventarios
ls -la orchestration/inventarios/

# Contar elementos
grep -c "nombre:" orchestration/inventarios/MASTER_INVENTORY.yml
```

---

## 7. Template

Para crear nuevos inventarios, usar:

```
Ver: TEMPLATE-INVENTARIO-PROYECTO.md
```

---

## Referencia ADR

Este documento está formalizado por [ADR-039 — SSOT - Documentacion del Producto en el Proyecto](../../docs/90-adr/ADR-039-ssot-docs-en-proyecto.md).

---

## 8. Referencias

| Directiva | Proposito |
|-----------|-----------|
| SIMCO-DOCUMENTACION-PROYECTO.md | Estructura general |
| CHECKLIST-INVENTARIOS.md | Validacion |
| TEMPLATE-INVENTARIO-PROYECTO.md | Template |

---

**Ultima actualizacion:** 2026-01-10
**Mantenido por:** Orchestration Team
