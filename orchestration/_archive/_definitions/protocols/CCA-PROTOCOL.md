# Protocolo CCA - Carga de Contexto Automatica
## Definicion Canonica (Fuente Unica de Verdad)

**Version:** 1.0.0
**Fecha:** 2026-01-18
**Alias:** @DEF_CCA
**Tipo:** Definicion Canonica
**Propagado desde:** workspace-v2/orchestration/_definitions/protocols/CCA-PROTOCOL.md

---

## PROPOSITO

Este documento es la **UNICA** fuente de verdad para el Protocolo CCA en gamilit.
Todos los perfiles de agentes deben **REFERENCIAR** este archivo, no copiar su contenido.

> **NOTA DE PROPAGACION:** Este archivo fue propagado desde el workspace principal
> y adaptado al contexto local de gamilit (proyecto STANDALONE).

---

## USO EN PERFILES

```markdown
## PROTOCOLO CCA
> Definicion: @DEF_CCA
> Variante: {dominio}

### Extensiones Especificas
[Solo contenido especifico del dominio]
```

---

## PROTOCOLO BASE

> **ANTES de cualquier accion, ejecutar Carga de Contexto Automatica**

```yaml
# Al recibir: "Seras {PERFIL}-Agent en gamilit para {TAREA}"

# ===================================================================
# PASO 0: IDENTIFICAR NIVEL (OBLIGATORIO PRIMERO)
# ===================================================================
PASO_0_IDENTIFICAR_NIVEL:
  proyecto: "gamilit"
  tipo: "STANDALONE"
  nivel: "NIVEL_2B.2"
  orchestration_path: "orchestration/"
  nota: "gamilit es proyecto independiente (no submodulo)"

# ===================================================================
# PASO 1: IDENTIFICAR CONTEXTO
# ===================================================================
PASO_1_IDENTIFICAR:
  perfil: "{PERFIL}"           # Nombre del perfil activo
  proyecto: "gamilit"          # Proyecto fijo
  tarea: "{TAREA}"             # Extraer del prompt
  operacion: "CREAR | MODIFICAR | VALIDAR | DOCUMENTAR | BUSCAR"
  dominio: "{DOMINIO}"         # BACKEND | FRONTEND | DDL | DEVOPS | etc.

# ===================================================================
# PASO 2: CARGAR CONTEXTO CORE (SIEMPRE)
# ===================================================================
PASO_2_CARGAR_CORE:
  leer_obligatorio:
    # Definiciones locales primero
    - orchestration/_definitions/_INDEX.yml

    # Principios fundamentales (locales)
    - orchestration/principios/PRINCIPIO-CAPVED.md

    # Indices y referencias
    - orchestration/_MAP.md
    - orchestration/referencias/ALIASES.yml

# ===================================================================
# PASO 3: CARGAR CONTEXTO DEL PROYECTO
# ===================================================================
PASO_3_CARGAR_PROYECTO:
  leer_obligatorio:
    - orchestration/00-guidelines/CONTEXTO-PROYECTO.md
    - orchestration/PROXIMA-ACCION.md
    - orchestration/CONTEXT-MAP.yml

  leer_segun_dominio:
    # Ver seccion VARIANTES POR DOMINIO

# ===================================================================
# PASO 4: CARGAR DIRECTIVAS DE OPERACION
# ===================================================================
PASO_4_CARGAR_OPERACION:
  segun_operacion:
    crear: ["orchestration/directivas/operaciones/CREAR.md"]
    modificar: ["orchestration/directivas/operaciones/MODIFICAR.md"]
    validar: ["orchestration/directivas/operaciones/VALIDAR.md"]
    documentar: ["orchestration/directivas/operaciones/DOCUMENTAR.md"]

# ===================================================================
# PASO 5: CARGAR CONTEXTO ESPECIFICO DE TAREA
# ===================================================================
PASO_5_CARGAR_TAREA:
  - "Documentacion relevante en docs/"
  - "Codigo existente similar (patrones)"
  - "Archivos relacionados con la tarea"
  - "Identificar dependencias"

# ===================================================================
# PASO 6: VERIFICAR DEPENDENCIAS
# ===================================================================
PASO_6_VERIFICAR_DEPENDENCIAS:
  si_dependencia_no_existe:
    accion: "DETENER y reportar"
    no_continuar_hasta: "Dependencia resuelta"

  dependencias_por_dominio:
    backend:
      requiere: "Tablas DDL existen"
      verificar: "ddl/ y migrations/"
    frontend:
      requiere: "Endpoints API existen"
      verificar: "backend/src/ y docs/api/"

# ===================================================================
# RESULTADO
# ===================================================================
RESULTADO: "READY_TO_EXECUTE - Contexto completo cargado"
```

---

## VARIANTES POR DOMINIO

### #backend
```yaml
PASO_3_CARGAR_PROYECTO:
  leer_segun_dominio:
    - orchestration/inventarios/BACKEND_INVENTORY.yml
    - orchestration/inventarios/DATABASE_INVENTORY.yml

PASO_4_CARGAR_OPERACION:
  segun_tarea:
    crear_entity: [_definitions/validations/VALIDATION-BACKEND.md]
    crear_service: [_definitions/validations/VALIDATION-BACKEND.md]
    crear_controller: [_definitions/validations/VALIDATION-BACKEND.md]
```

### #frontend
```yaml
PASO_3_CARGAR_PROYECTO:
  leer_segun_dominio:
    - orchestration/inventarios/FRONTEND_INVENTORY.yml

PASO_4_CARGAR_OPERACION:
  segun_tarea:
    crear_componente: [_definitions/validations/VALIDATION-FRONTEND.md]
    crear_hook: [_definitions/validations/VALIDATION-FRONTEND.md]
    crear_page: [_definitions/validations/VALIDATION-FRONTEND.md]
```

### #ddl
```yaml
PASO_3_CARGAR_PROYECTO:
  leer_segun_dominio:
    - orchestration/inventarios/DATABASE_INVENTORY.yml
    - ddl/  # Esquemas existentes

PASO_4_CARGAR_OPERACION:
  segun_tarea:
    crear_tabla: [_definitions/validations/VALIDATION-DDL.md]
    crear_funcion: [_definitions/validations/VALIDATION-DDL.md]
    crear_trigger: [_definitions/validations/VALIDATION-DDL.md]
```

---

## VERSION LIGERA (SUBAGENTES)

Para subagentes con tareas especificas, usar version reducida:

```yaml
# CCA Ligero - Solo para subagentes
CCA_LIGHT:
  PASO_1: "Identificar perfil, proyecto, tarea"
  PASO_2: "Cargar ALIASES.yml"
  PASO_3: "Cargar inventario del dominio"
  PASO_4: "Cargar checklist de validacion"
  RESULTADO: "READY_TO_EXECUTE"
```

---

## REFERENCIAS

- **Perfiles que usan este protocolo:** Todos en orchestration/agentes/
- **Version workspace:** workspace-v2/orchestration/_definitions/protocols/CCA-PROTOCOL.md
- **Adaptaciones locales:** Rutas ajustadas a estructura gamilit

---

**Ultima actualizacion:** 2026-01-18
**Mantenido por:** Equipo gamilit
