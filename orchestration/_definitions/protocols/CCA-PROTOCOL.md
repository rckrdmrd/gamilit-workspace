# Protocolo CCA - Carga de Contexto Automática
## Definición Canónica (Fuente Única de Verdad)

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Alias:** @DEF_CCA
**Tipo:** Definición Canónica

---

## PROPÓSITO

Este documento es la **ÚNICA** fuente de verdad para el Protocolo CCA.
Todos los perfiles de agentes deben **REFERENCIAR** este archivo, no copiar su contenido.

---

## USO EN PERFILES

```markdown
## PROTOCOLO CCA
> Definición: @DEF_CCA
> Variante: {dominio}

### Extensiones Específicas
[Solo contenido específico del dominio]
```

---

## PROTOCOLO BASE

> **ANTES de cualquier acción, ejecutar Carga de Contexto Automática**

```yaml
# Al recibir: "Serás {PERFIL}-Agent en {PROYECTO} para {TAREA}"

# ═══════════════════════════════════════════════════════════════
# PASO 0: IDENTIFICAR NIVEL (OBLIGATORIO PRIMERO)
# ═══════════════════════════════════════════════════════════════
PASO_0_IDENTIFICAR_NIVEL:
  leer: "orchestration/directivas/simco/SIMCO-NIVELES.md"
  determinar:
    working_directory: "{extraer del prompt}"
    nivel: "{NIVEL_0|1|2A|2B|2B.1|2B.2|3}"
    orchestration_path: "{calcular según nivel}"
    propagate_to: ["{niveles superiores si aplica}"]
  registrar:
    nivel_actual: "{nivel identificado}"
    ruta_inventario: "{orchestration_path}/inventarios/"
    ruta_traza: "{orchestration_path}/trazas/"

# ═══════════════════════════════════════════════════════════════
# PASO 1: IDENTIFICAR CONTEXTO
# ═══════════════════════════════════════════════════════════════
PASO_1_IDENTIFICAR:
  perfil: "{PERFIL}"           # Nombre del perfil activo
  proyecto: "{PROYECTO}"       # Extraer del prompt
  tarea: "{TAREA}"             # Extraer del prompt
  operacion: "CREAR | MODIFICAR | VALIDAR | DOCUMENTAR | BUSCAR"
  dominio: "{DOMINIO}"         # BACKEND | FRONTEND | DDL | DEVOPS | ML | etc.

# ═══════════════════════════════════════════════════════════════
# PASO 2: CARGAR CONTEXTO CORE (SIEMPRE)
# ═══════════════════════════════════════════════════════════════
PASO_2_CARGAR_CORE:
  leer_obligatorio:
    # Catálogo primero (evitar duplicados)
    - shared/catalog/CATALOG-INDEX.yml

    # Principios fundamentales
    - orchestration/directivas/principios/PRINCIPIO-CAPVED.md
    - orchestration/directivas/principios/PRINCIPIO-DOC-PRIMERO.md
    - orchestration/directivas/principios/PRINCIPIO-ANTI-DUPLICACION.md
    - orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md
    - orchestration/directivas/principios/PRINCIPIO-ECONOMIA-TOKENS.md

    # Índices y referencias
    - orchestration/directivas/simco/_INDEX.md
    - orchestration/directivas/simco/SIMCO-TAREA.md
    - orchestration/referencias/ALIASES.yml

# ═══════════════════════════════════════════════════════════════
# PASO 3: CARGAR CONTEXTO DEL PROYECTO
# ═══════════════════════════════════════════════════════════════
PASO_3_CARGAR_PROYECTO:
  leer_obligatorio:
    - projects/{PROYECTO}/orchestration/00-guidelines/CONTEXTO-PROYECTO.md
    - projects/{PROYECTO}/orchestration/PROXIMA-ACCION.md

  leer_segun_dominio:
    # Ver sección VARIANTES POR DOMINIO

# ═══════════════════════════════════════════════════════════════
# PASO 4: CARGAR DIRECTIVAS DE OPERACIÓN
# ═══════════════════════════════════════════════════════════════
PASO_4_CARGAR_OPERACION:
  verificar_catalogo_primero:
    - "grep -i '{funcionalidad}' @CATALOG_INDEX"
    - si_existe: "Seguir @REUTILIZAR en lugar de crear"

  segun_operacion:
    crear: ["SIMCO-CREAR.md", "SIMCO-{DOMINIO}.md"]
    modificar: ["SIMCO-MODIFICAR.md", "SIMCO-{DOMINIO}.md"]
    validar: ["SIMCO-VALIDAR.md"]
    documentar: ["SIMCO-DOCUMENTAR.md"]
    buscar: ["SIMCO-BUSCAR.md"]

# ═══════════════════════════════════════════════════════════════
# PASO 5: CARGAR CONTEXTO ESPECÍFICO DE TAREA
# ═══════════════════════════════════════════════════════════════
PASO_5_CARGAR_TAREA:
  - "Documentación relevante en docs/"
  - "Código existente similar (patrones)"
  - "Archivos relacionados con la tarea"
  - "Identificar dependencias"

# ═══════════════════════════════════════════════════════════════
# PASO 6: VERIFICAR DEPENDENCIAS
# ═══════════════════════════════════════════════════════════════
PASO_6_VERIFICAR_DEPENDENCIAS:
  si_dependencia_no_existe:
    accion: "DELEGAR al agente correspondiente"
    no_continuar_hasta: "Dependencia resuelta"

  dependencias_por_dominio:
    backend:
      requiere: "Tablas DDL existen"
      delegar_a: "@PERFIL_DATABASE"
    frontend:
      requiere: "Endpoints API existen"
      delegar_a: "@PERFIL_BACKEND"
    devops:
      requiere: "Código funcional existe"
      delegar_a: "@PERFIL_BACKEND o @PERFIL_FRONTEND"

# ═══════════════════════════════════════════════════════════════
# RESULTADO
# ═══════════════════════════════════════════════════════════════
RESULTADO: "READY_TO_EXECUTE - Contexto completo cargado"
```

---

## VARIANTES POR DOMINIO

### #backend
```yaml
PASO_3_CARGAR_PROYECTO:
  leer_segun_dominio:
    - projects/{PROYECTO}/orchestration/inventarios/BACKEND_INVENTORY.yml
    - projects/{PROYECTO}/orchestration/inventarios/DATABASE_INVENTORY.yml

PASO_4_CARGAR_OPERACION:
  segun_tarea:
    crear_entity: [SIMCO-CREAR.md, SIMCO-BACKEND.md]
    crear_service: [SIMCO-CREAR.md, SIMCO-BACKEND.md]
    crear_controller: [SIMCO-CREAR.md, SIMCO-BACKEND.md]
    crear_dto: [SIMCO-CREAR.md, SIMCO-BACKEND.md]
```

### #frontend
```yaml
PASO_3_CARGAR_PROYECTO:
  leer_segun_dominio:
    - projects/{PROYECTO}/orchestration/inventarios/FRONTEND_INVENTORY.yml

PASO_4_CARGAR_OPERACION:
  segun_tarea:
    crear_componente: [SIMCO-CREAR.md, SIMCO-FRONTEND.md]
    crear_hook: [SIMCO-CREAR.md, SIMCO-FRONTEND.md]
    crear_page: [SIMCO-CREAR.md, SIMCO-FRONTEND.md]
```

### #ddl
```yaml
PASO_3_CARGAR_PROYECTO:
  leer_segun_dominio:
    - projects/{PROYECTO}/orchestration/inventarios/DATABASE_INVENTORY.yml
    - projects/{PROYECTO}/ddl/  # Esquemas existentes

PASO_4_CARGAR_OPERACION:
  segun_tarea:
    crear_tabla: [SIMCO-CREAR.md, SIMCO-DDL.md]
    crear_funcion: [SIMCO-CREAR.md, SIMCO-DDL.md]
    crear_trigger: [SIMCO-CREAR.md, SIMCO-DDL.md]
    crear_rls: [SIMCO-CREAR.md, SIMCO-DDL.md]
```

### #devops
```yaml
PASO_3_CARGAR_PROYECTO:
  leer_segun_dominio:
    - projects/{PROYECTO}/docker-compose.yml
    - projects/{PROYECTO}/.env.example

PASO_4_CARGAR_OPERACION:
  segun_tarea:
    crear_dockerfile: [SIMCO-CREAR.md, SIMCO-DEVOPS.md]
    crear_pipeline: [SIMCO-CREAR.md, SIMCO-DEVOPS.md]
```

### #ml
```yaml
PASO_3_CARGAR_PROYECTO:
  leer_segun_dominio:
    - projects/{PROYECTO}/orchestration/inventarios/ML_INVENTORY.yml
    - projects/{PROYECTO}/models/

PASO_4_CARGAR_OPERACION:
  segun_tarea:
    crear_modelo: [SIMCO-CREAR.md, SIMCO-ML.md]
    crear_pipeline_ml: [SIMCO-CREAR.md, SIMCO-ML.md]
```

---

## VERSIÓN LIGERA (SUBAGENTES)

Para subagentes con tareas específicas, usar versión reducida:

```yaml
# CCA Ligero - Solo para subagentes
CCA_LIGHT:
  PASO_1: "Identificar perfil, proyecto, tarea"
  PASO_2: "Cargar ALIASES.yml"
  PASO_3: "Cargar inventario del dominio"
  PASO_4: "Cargar SIMCO de operación"
  RESULTADO: "READY_TO_EXECUTE"
```

Ver también: @DEF_CCA_LIGHT

---

## REFERENCIAS

- **Perfiles que usan este protocolo:** Todos los perfiles en agents/perfiles/
- **Directiva relacionada:** SIMCO-INICIALIZACION.md
- **Versión ligera:** @DEF_CCA_LIGHT

---

**Última actualización:** 2026-01-16
**Mantenido por:** @WS_ORCHESTRATOR
