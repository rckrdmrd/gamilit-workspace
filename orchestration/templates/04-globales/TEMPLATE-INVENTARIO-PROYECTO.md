# TEMPLATE: Inventario de Proyecto

**Version:** 1.0.0
**Proposito:** Template para crear inventarios YAML estandarizados
**Referencia:** SIMCO-INVENTARIOS.md
**Creado:** 2026-01-10

---

## Instrucciones de Uso

1. Copiar la seccion del tipo de inventario que necesita
2. Guardar con el nombre apropiado (MASTER_INVENTORY.yml, etc.)
3. Reemplazar todos los placeholders `{...}`
4. Eliminar secciones opcionales que no apliquen
5. Validar con `yamllint` antes de commitear

---

## MASTER_INVENTORY.yml

```yaml
# MASTER_INVENTORY.yml
# Proyecto: {nombre_proyecto}
# Version: {SEMVER}
# Actualizado: {YYYY-MM-DD}

metadata:
  proyecto: "{nombre_proyecto}"
  tipo: "{Standalone|Suite|Suite-Core|Vertical}"
  version: "{X.Y.Z}"
  updated: "{YYYY-MM-DD}"
  descripcion: "{Descripcion breve del proyecto}"

resumen:
  progreso_mvp: "{N}%"
  story_points_completados: {N}
  story_points_totales: {N}
  tareas_completadas: {N}
  tareas_totales: {N}
  cobertura_tests: "{N}%"

fases:
  - nombre: "Fase 1 - {Nombre}"
    codigo: "{F1}"
    estado: "{completado|en_progreso|pendiente}"
    progreso: "{N}%"
    fecha_inicio: "{YYYY-MM-DD}"
    fecha_fin: "{YYYY-MM-DD}"
    epicas: {N}
    story_points: {N}

  - nombre: "Fase 2 - {Nombre}"
    codigo: "{F2}"
    estado: "{completado|en_progreso|pendiente}"
    progreso: "{N}%"
    fecha_inicio: "{YYYY-MM-DD}"
    fecha_fin: "{YYYY-MM-DD}"
    epicas: {N}
    story_points: {N}

epicas:
  - codigo: "{EAI-001|MGN-001}"
    nombre: "{Nombre de la epica}"
    fase: "{F1}"
    estado: "{completado|en_progreso|pendiente|documentado}"
    progreso: "{N}%"
    story_points: {N}
    stories: {N}
    prioridad: "{P0|P1|P2|P3}"

aplicaciones:
  backend:
    - servicio: "{nombre_servicio}"
      ruta: "{apps/backend}"
      puerto: {NNNN}
      estado: "{activo|inactivo|desarrollo}"
      framework: "{NestJS|Express|FastAPI}"
      version: "{X.Y.Z}"

  frontend:
    - servicio: "{nombre_portal}"
      ruta: "{apps/frontend-portal}"
      puerto: {NNNN}
      estado: "{activo|inactivo|desarrollo}"
      framework: "{React|Next.js|Vue}"
      version: "{X.Y.Z}"

  database:
    - nombre: "{nombre_bd}"
      tipo: "{PostgreSQL|MySQL|MongoDB}"
      host: "{localhost|docker}"
      puerto: {NNNN}
      schemas: {N}
      estado: "{activo|inactivo}"

integraciones:
  - nombre: "{Nombre Integracion}"
    proveedor: "{Proveedor}"
    tipo: "{pagos|auth|notificaciones|storage}"
    estado: "{activo|configurado|pendiente}"
    documentacion: "{ruta/al/documento.md}"

# Opcional: changelog
changelog:
  - version: "{X.Y.Z}"
    fecha: "{YYYY-MM-DD}"
    cambios:
      - "{Cambio 1}"
      - "{Cambio 2}"
```

---

## DATABASE_INVENTORY.yml

```yaml
# DATABASE_INVENTORY.yml
# Proyecto: {nombre_proyecto}
# Version: {SEMVER}
# Actualizado: {YYYY-MM-DD}

metadata:
  proyecto: "{nombre_proyecto}"
  tipo: "DATABASE"
  version: "{X.Y.Z}"
  updated: "{YYYY-MM-DD}"
  motor: "{PostgreSQL|MySQL}"
  version_motor: "{15.x|8.x}"
  host: "{localhost}"
  puerto: {5432|3306}

resumen:
  total_schemas: {N}
  total_tablas: {N}
  total_funciones: {N}
  total_triggers: {N}
  total_indices: {N}
  rls_habilitado: {true|false}

schemas:
  - nombre: "{schema_name}"
    descripcion: "{Descripcion del schema}"
    estado: "{implementado|parcial|pendiente}"

    tablas:
      - nombre: "{nombre_tabla}"
        columnas: {N}
        indices: {N}
        foreign_keys: {N}
        estado: "{implementada|pendiente}"
        rls: {true|false}
        descripcion: "{Descripcion breve}"

      - nombre: "{nombre_tabla_2}"
        columnas: {N}
        indices: {N}
        foreign_keys: {N}
        estado: "{implementada|pendiente}"
        rls: {true|false}

    funciones:
      - nombre: "{nombre_funcion}"
        tipo: "{scalar|table|trigger}"
        parametros: {N}
        descripcion: "{Que hace la funcion}"

    triggers:
      - nombre: "{nombre_trigger}"
        tabla: "{tabla_asociada}"
        evento: "{INSERT|UPDATE|DELETE|TRUNCATE}"
        timing: "{BEFORE|AFTER|INSTEAD OF}"
        funcion: "{nombre_funcion_trigger}"

vistas:
  - nombre: "{nombre_vista}"
    schema: "{schema}"
    dependencias:
      - "{tabla1}"
      - "{tabla2}"
    descripcion: "{Proposito de la vista}"

migraciones:
  ultima: "{YYYYMMDDHHMMSS}"
  pendientes: {N}
  historial:
    - id: "{YYYYMMDDHHMMSS}"
      descripcion: "{Descripcion de la migracion}"
      fecha: "{YYYY-MM-DD}"
      autor: "{nombre/equipo}"
      rollback_probado: {true|false}
```

---

## BACKEND_INVENTORY.yml

```yaml
# BACKEND_INVENTORY.yml
# Proyecto: {nombre_proyecto}
# Version: {SEMVER}
# Actualizado: {YYYY-MM-DD}

metadata:
  proyecto: "{nombre_proyecto}"
  tipo: "BACKEND"
  version: "{X.Y.Z}"
  updated: "{YYYY-MM-DD}"
  framework: "{NestJS|Express|FastAPI}"
  lenguaje: "{TypeScript|Python}"
  node_version: "{20.x}"

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
    descripcion: "{Descripcion breve del modulo}"

    endpoints:
      - metodo: "{GET|POST|PUT|DELETE|PATCH}"
        ruta: "/api/v1/{recurso}"
        descripcion: "{Que hace el endpoint}"
        auth: {true|false}
        roles: ["{admin}", "{user}"]
        version: "{v1}"

      - metodo: "{POST}"
        ruta: "/api/v1/{recurso}"
        descripcion: "{Descripcion}"
        auth: {true|false}
        roles: ["{admin}"]

shared:
  - tipo: "{constants|dto|guards|pipes|decorators|interfaces}"
    archivos: {N}
    ruta: "{src/shared/tipo}"

guards:
  - nombre: "{NombreGuard}"
    ruta: "{src/shared/guards/nombre.guard.ts}"
    proposito: "{Que protege}"

tests:
  unit:
    archivos: {N}
    cobertura: "{N}%"
    comando: "npm run test"
  integration:
    archivos: {N}
    cobertura: "{N}%"
    comando: "npm run test:integration"
  e2e:
    archivos: {N}
    comando: "npm run test:e2e"
```

---

## FRONTEND_INVENTORY.yml

```yaml
# FRONTEND_INVENTORY.yml
# Proyecto: {nombre_proyecto}
# Version: {SEMVER}
# Actualizado: {YYYY-MM-DD}

metadata:
  proyecto: "{nombre_proyecto}"
  tipo: "FRONTEND"
  version: "{X.Y.Z}"
  updated: "{YYYY-MM-DD}"
  framework: "{React|Next.js|Vue}"
  lenguaje: "{TypeScript|JavaScript}"
  ui_library: "{MUI|TailwindCSS|ChakraUI}"

resumen:
  total_aplicaciones: {N}
  total_paginas: {N}
  total_componentes: {N}
  total_hooks: {N}
  total_stores: {N}
  cobertura_tests: "{N}%"

aplicaciones:
  - nombre: "{nombre_app}"
    ruta: "{apps/frontend-nombre}"
    puerto: {NNNN}
    estado: "{activo|desarrollo|pendiente}"
    descripcion: "{Portal para que tipo de usuario}"

    paginas:
      - nombre: "{NombrePagina}"
        ruta: "/{ruta}"
        componentes: {N}
        estado: "{implementada|parcial|pendiente}"
        auth: {true|false}
        roles: ["{admin}", "{user}"]
        descripcion: "{Proposito de la pagina}"

      - nombre: "{OtraPagina}"
        ruta: "/{otra-ruta}"
        componentes: {N}
        estado: "{implementada|pendiente}"
        auth: {true|false}

componentes:
  shared:
    - nombre: "{NombreComponente}"
      ruta: "{src/components/shared/Nombre}"
      tipo: "{UI|Layout|Form|Data|Feedback}"
      reutilizable: {true|false}
      props: {N}

  features:
    - nombre: "{NombreComponente}"
      feature: "{feature_name}"
      ruta: "{src/components/features/feature/Nombre}"

hooks:
  - nombre: "{useNombreHook}"
    ruta: "{src/hooks/useNombreHook}"
    proposito: "{Que hace el hook}"
    dependencias: ["{otro_hook}"]

stores:
  - nombre: "{nombreStore}"
    ruta: "{src/stores/nombreStore}"
    tipo: "{Zustand|Redux|Context}"
    descripcion: "{Que estado maneja}"

tests:
  unit:
    archivos: {N}
    cobertura: "{N}%"
  component:
    archivos: {N}
    cobertura: "{N}%"
  e2e:
    archivos: {N}
    herramienta: "{Playwright|Cypress}"
```

---

## Validacion

Antes de commitear, validar con:

```bash
# Validar sintaxis YAML
yamllint orchestration/inventarios/*.yml

# Verificar estructura basica
cat orchestration/inventarios/MASTER_INVENTORY.yml | yq '.metadata'
```

---

**Referencia:** SIMCO-INVENTARIOS.md
