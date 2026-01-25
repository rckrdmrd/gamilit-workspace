# PROTOCOLO: DELEGATION-PROTOCOL

**Versión:** 1.0.0
**Alias:** @DEF_DELEGATION
**Fecha:** 2026-01-16
**Sistema:** SIMCO v4.0.0

---

## RESUMEN

Protocolo estándar para delegación de tareas entre agentes. Define qué contexto heredar, cómo estructurar la delegación, y cómo validar entregables.

---

## PRINCIPIOS DE DELEGACIÓN

```yaml
principios:
  1_contexto_completo:
    descripcion: "Subagente recibe todo el contexto necesario"
    accion: "Incluir variables, aliases, estado actual, criterios"

  2_tarea_acotada:
    descripcion: "Subtarea debe ser específica y medible"
    accion: "Definir criterios de aceptación claros"

  3_validacion_obligatoria:
    descripcion: "Validar entregable antes de aceptar"
    accion: "Ejecutar validaciones del dominio"

  4_documentacion_heredada:
    descripcion: "Subagente documenta, orquestador consolida"
    accion: "Subagente actualiza trazas de su dominio"
```

---

## ESTRUCTURA DE DELEGACIÓN

### Mensaje de Delegación

```yaml
delegacion:
  # === IDENTIFICACIÓN ===
  id: "DEL-{FECHA}-{SEQ}"
  de: "{perfil_origen}"
  a: "{perfil_destino}"
  fecha: "{YYYY-MM-DD HH:MM}"

  # === CONTEXTO HEREDADO ===
  proyecto:
    nombre: "{nombre_proyecto}"
    ruta: "{ruta_completa}"
    tipo: "{standalone|vertical|core}"

  variables_resueltas:
    DB_NAME: "{valor}"
    BACKEND_ROOT: "{valor}"
    FRONTEND_ROOT: "{valor}"
    # ... todas las variables necesarias

  aliases_resueltos:
    "@DDL": "{ruta_completa}"
    "@BACKEND": "{ruta_completa}"
    "@INVENTORY": "{ruta_completa}"
    # ... todos los aliases necesarios

  estado_actual:
    archivos_relevantes:
      - ruta: "{ruta}"
        estado: "{existente|nuevo}"
    dependencias_resueltas: true|false

  # === TAREA ESPECÍFICA ===
  tarea:
    descripcion: "{descripcion_clara_y_concisa}"
    tipo: "{crear|modificar|validar|documentar}"
    archivos_involucrados:
      - "{archivo_1}"
      - "{archivo_2}"
    criterios_aceptacion:
      - "{criterio_1}"
      - "{criterio_2}"

  # === DIRECTIVAS ===
  simco_a_seguir:
    - "{SIMCO_principal}"
    - "{SIMCO_secundario}"

  validaciones_requeridas:
    - comando: "{comando}"
      debe_pasar: true

  # === ENTREGABLES ESPERADOS ===
  entregables:
    - tipo: "{codigo|documentacion|reporte}"
      descripcion: "{que_entregar}"
```

---

## PERFILES Y SUS DOMINIOS

### Matriz de Delegación

| Desde | Hacia | Cuándo |
|-------|-------|--------|
| Orquestador | Database-Agent | Operaciones DDL/PostgreSQL |
| Orquestador | Backend-Agent | NestJS, APIs, Services |
| Orquestador | Frontend-Agent | React, Componentes UI |
| Orquestador | DevOps-Agent | CI/CD, Docker, Deployment |
| Backend-Agent | Database-Agent | Crear tabla antes de entity |
| Frontend-Agent | Backend-Agent | Necesita endpoint |
| Cualquiera | Documentation-Maintainer | Auditoría de docs |

### Lo que NO se delega

```yaml
no_delegar:
  - Decisiones arquitecturales (escalar a Tech-Leader)
  - Cambios de seguridad críticos (escalar a Security-Auditor)
  - Propagación cross-proyecto (Orquestador mantiene control)
  - Consolidación final de entregables
```

---

## FLUJO DE DELEGACIÓN

```
ORQUESTADOR                          SUBAGENTE
     │                                    │
     │──── 1. Preparar contexto ────────→ │
     │                                    │
     │──── 2. Enviar delegación ────────→ │
     │                                    │
     │                                    ├── 3. Validar contexto
     │                                    │
     │                                    ├── 4. Ejecutar tarea
     │                                    │
     │                                    ├── 5. Validar (build/lint)
     │                                    │
     │←─── 6. Entregar resultado ─────── │
     │                                    │
     ├── 7. Validar entregable            │
     │                                    │
     ├── 8. Integrar o rechazar           │
     │                                    │
     └── 9. Documentar consolidación      │
```

---

## RESPUESTA DE SUBAGENTE

### Estructura de Entregable

```yaml
entregable:
  # === IDENTIFICACIÓN ===
  delegacion_id: "DEL-{ID}"
  agente: "{perfil}"
  fecha_completado: "{YYYY-MM-DD HH:MM}"

  # === RESULTADO ===
  estado: "completado|parcial|bloqueado|fallido"

  archivos_creados:
    - ruta: "{ruta}"
      lineas: {N}

  archivos_modificados:
    - ruta: "{ruta}"
      cambios: "{resumen}"

  # === VALIDACIONES ===
  validaciones:
    - comando: "npm run build"
      resultado: "OK|FAIL"
    - comando: "npm run lint"
      resultado: "OK|FAIL"

  # === DOCUMENTACIÓN ===
  trazas_actualizadas:
    - "{ruta_traza}"

  inventarios_actualizados:
    - "{ruta_inventario}"

  # === NOTAS ===
  problemas_encontrados:
    - "{descripcion}"

  dependencias_pendientes:
    - "{descripcion}"

  # === CONTINUACIÓN ===
  siguiente_paso: "{sugerencia}"
```

---

## VALIDACIÓN DE ENTREGABLES

### Checklist de Aceptación

```yaml
validar_entregable:
  1_completitud:
    - "¿Se completaron todos los criterios de aceptación?"
    - "¿Se incluyeron todos los archivos esperados?"

  2_calidad:
    - "¿Build pasa?"
    - "¿Lint pasa?"
    - "¿Tests pasan (si aplica)?"

  3_documentacion:
    - "¿Se actualizaron trazas?"
    - "¿Se actualizaron inventarios?"

  4_alineacion:
    - "¿El código sigue estándares del proyecto?"
    - "¿No hay scope creep?"
```

### Decisiones Post-Validación

```yaml
si_OK:
  - Integrar entregable
  - Registrar en traza del orquestador
  - Continuar con siguiente subtarea

si_PARCIAL:
  - Evaluar qué falta
  - Re-delegar parte faltante o completar directo

si_BLOQUEADO:
  - Resolver bloqueo
  - Re-delegar con contexto actualizado

si_FALLIDO:
  - Analizar causa raíz
  - Decidir: re-intentar, ejecutar directo, o escalar
```

---

## HERENCIA DE CONTEXTO

### Qué Siempre Heredar

```yaml
contexto_obligatorio:
  - Nombre y ruta del proyecto
  - Variables de entorno resueltas
  - Aliases con rutas absolutas
  - SIMCO específico a seguir
  - Criterios de aceptación
```

### Qué Heredar Según Dominio

```yaml
por_dominio:
  database:
    - DATABASE_INVENTORY.yml
    - DDL existente relacionado
    - Convenciones de naming

  backend:
    - BACKEND_INVENTORY.yml
    - DATABASE_INVENTORY.yml (para alineación)
    - Entities existentes relacionados
    - DTOs existentes relacionados

  frontend:
    - FRONTEND_INVENTORY.yml
    - Componentes existentes relacionados
    - Hooks/stores existentes
```

---

## EJEMPLO COMPLETO

### Delegación: Crear Entity

```yaml
delegacion:
  id: "DEL-2026-01-16-001"
  de: "ORQUESTADOR"
  a: "BACKEND-AGENT"
  fecha: "2026-01-16 10:30"

  proyecto:
    nombre: "erp-construccion"
    ruta: "/home/isem/workspace-v2/projects/erp-construccion"
    tipo: "vertical"

  variables_resueltas:
    DB_NAME: "erp_construccion"
    BACKEND_ROOT: "/home/isem/workspace-v2/projects/erp-construccion/apps/backend"
    BACKEND_SRC: "/home/isem/workspace-v2/projects/erp-construccion/apps/backend/src"

  estado_actual:
    archivos_relevantes:
      - ruta: "apps/database/ddl/07_obras/01_tables/001_proyecto.sql"
        estado: "existente"
    dependencias_resueltas: true

  tarea:
    descripcion: "Crear ProyectoEntity alineada con tabla obras.proyecto"
    tipo: "crear"
    archivos_involucrados:
      - "apps/backend/src/modules/proyectos/entities/proyecto.entity.ts"
    criterios_aceptacion:
      - "Entity tiene mismos campos que DDL"
      - "Tipos TypeScript corresponden a tipos PostgreSQL"
      - "Decoradores TypeORM correctos"
      - "Build pasa"
      - "Lint pasa"

  simco_a_seguir:
    - "SIMCO-BACKEND.md"
    - "SIMCO-CREAR.md"

  validaciones_requeridas:
    - comando: "npm run build"
      debe_pasar: true
    - comando: "npm run lint"
      debe_pasar: true

  entregables:
    - tipo: "codigo"
      descripcion: "proyecto.entity.ts completo y funcional"
    - tipo: "documentacion"
      descripcion: "BACKEND_INVENTORY.yml actualizado"
```

---

## REFERENCIAS

| Alias | Descripción |
|-------|-------------|
| @DEF_DELEGATION | Este protocolo |
| @SIMCO/SIMCO-DELEGACION.md | Directiva de delegación |
| @DEF_CCA | Protocolo de carga de contexto |
| @DEF_CAPVED | Ciclo de vida de tareas |

---

**Versión:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Protocolo de Delegación
