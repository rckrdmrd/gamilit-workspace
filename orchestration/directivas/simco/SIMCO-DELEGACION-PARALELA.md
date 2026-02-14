# SIMCO-DELEGACION-PARALELA

**Version:** 2.0.0
**Fecha:** 2026-02-13
**Aplica a:** Agentes orquestadores que deleguen a multiples subagentes
**Criticidad:** RECOMENDADA
**Tipo:** Directiva de Orquestacion
**Alias:** @DELEGACION_PARALELA
**Depende de:** SIMCO-DELEGACION.md, SIMCO-SUBAGENTE.md

---

## 1. Proposito

Orquestacion de hasta 5 subagentes simultaneos con tracking de sesion.
Define limites de paralelismo, herencia de contexto, protocolo de sincronizacion
y manejo de errores para delegacion paralela en el proyecto gamilit.

---

## 2. Reglas de Paralelismo

### 2.1 Limites

```yaml
LIMITES_PARALELOS:
  max_subagentes: 5
  max_por_dominio: 2                     # Evitar conflictos

  por_dominio:
    DDL: 1                                # Siempre secuencial
    BACKEND: 2
    FRONTEND: 3
    DOCS: 2
```

### 2.2 Reglas de Orden

```yaml
REGLAS_ORDEN:
  obligatorias:
    - "DDL ANTES de Backend"              # Entity necesita DDL
    - "Backend ANTES de Frontend"         # Hook necesita endpoint
    - "Entity ANTES de Service"           # Service usa Entity
    - "Service ANTES de Controller"       # Controller usa Service

  mismo_dominio:
    - "Mismo modulo → secuencial"         # Evitar conflictos
    - "Modulos diferentes → paralelo"

  paralelo_permitido:
    - "DDL de schemas diferentes"
    - "Modulos backend independientes"
    - "Componentes frontend sin dependencia"
    - "Documentacion siempre paralela"
```

---

## 3. Diagrama de Orquestacion

```
AGENTE PRINCIPAL
     |
     +--- Fase C, A, P, V (ejecuta directamente)
     |
     v
FASE E: EJECUCION CON DELEGACION
     |
     +-------------------------------------------+
     |                                           |
     v                                           v
+-----------------+                   +-----------------+
|  GRUPO 1        |                   |  SESSION        |
|  (Secuencial)   |                   |  TRACKING       |
|                 |    Reporta        |                 |
|  DDL-001 -------+-------------------+  tracking/      |
|     |           |                   |  SESSION-{id}.  |
|     v           |                   |  yml            |
|  DDL-002        |                   |                 |
+-----------------+                   +-----------------+
     |                                        ^
     | Cuando DDL completa                    |
     v                                        |
+---------------------------------------------+
|  GRUPO 2 (Paralelo: Backend)                |
|                                             |
|  +---------+ +---------+ +---------+        |
|  | BE-001  | | BE-002  | | BE-003  | Reportan
|  | Entity  | | Service | | DTO     |        |
|  +---------+ +---------+ +---------+        |
+---------------------------------------------+
     |                                        |
     | Cuando Backend completa                |
     v                                        |
+---------------------------------------------+
|  GRUPO 3 (Paralelo: Frontend)               |
|                                             |
|  +---------+ +---------+ +---------+        |
|  | FE-001  | | FE-002  | | FE-003  | Reportan
|  | Hook    | | Comp.   | | Page    |        |
|  +---------+ +---------+ +---------+        |
+---------------------------------------------+
     |
     v
AGENTE PRINCIPAL
     |
     +--- Consolida resultados de SESSION-TRACKING
     |
     v
Fase D (ejecuta directamente)
```

---

## 4. Herencia Automatica de Contexto

### 4.1 Que Hereda el Subagente

```yaml
HERENCIA_AUTOMATICA:
  desde_context_map:
    - variables resueltas (PROJECT, DB_NAME, etc.)
    - aliases resueltos (@DDL, @BACKEND, etc.)
    - rutas absolutas (no placeholders)

  desde_agente_principal:
    - tarea_id (HU-XXX)
    - subtarea_id (ST-XXX)
    - criterios de aceptacion
    - archivos de referencia especificos

  desde_session_tracking:
    - estado de subtareas previas
    - archivos creados por otros subagentes
    - errores encontrados

NO_HEREDAR:
  - Contexto completo L0 (ya cargado en prompt base)
  - Historial de otras tareas
  - Codigo no relacionado
```

### 4.2 Formato de Delegacion

```yaml
PROMPT_DELEGACION:
  estructura:
    1_contexto_heredado:
      proyecto: "gamilit"
      variables:
        PROJECT: "gamilit"
        DB_DDL_PATH: "apps/database/ddl/"
        BACKEND_SRC: "apps/backend/src/"
        FRONTEND_SRC: "apps/frontend/src/"

    2_tarea_especifica:
      subtarea_id: "ST-XXX"
      descripcion: "{descripcion clara}"
      dominio: "{DDL | BACKEND | FRONTEND}"

    3_archivos:
      crear:
        - "{ruta/archivo}"
      modificar:
        - "{ruta/archivo}"
      referencia:
        - "{ruta/patron.ts}"

    4_criterios:
      - "[ ] {criterio 1}"
      - "[ ] {criterio 2}"

    5_validaciones:
      build: true | false
      lint: true | false
      reportar_a: "SESSION-TRACKING-{id}.yml"
```

---

## 5. Session Tracking

### 5.1 Estructura del Archivo

```yaml
# SESSION-TRACKING-{uuid}.yml
session_tracking:
  session_id: "{uuid}"
  tarea_principal: "HU-XXX"
  proyecto: "gamilit"
  inicio: "{YYYY-MM-DD HH:MM}"
  estado: "{activa | completada | fallida}"

  subagentes:
    - id: "{subagente_id}"
      subtarea: "ST-001"
      perfil: "PERFIL-DATABASE-POSTGRESQL"
      estado: "{pendiente | activo | completado | fallido}"

      tiempos:
        inicio: "{HH:MM}"
        fin: "{HH:MM}"

      archivos_creados:
        - ruta: "{ruta/archivo}"
          lineas: 0

      archivos_modificados:
        - ruta: "{ruta/archivo}"
          cambios: "{descripcion breve}"

      validaciones:
        build: "{pass | fail | skip}"
        lint: "{pass | fail | skip}"

      errores: []
      notas: ""

  sincronizacion:
    grupos_completados: [1, 2]
    grupo_actual: 3
    pendientes: []

  metricas:
    subtareas_total: 0
    subtareas_completadas: 0
    subtareas_fallidas: 0
    porcentaje: 0
```

### 5.2 Ubicacion

```
orchestration/tracking/SESSION-TRACKING-{uuid}.yml
```

---

## 6. Protocolo de Sincronizacion

### 6.1 Inicio de Grupo

```yaml
PROTOCOLO_INICIO:
  1_verificar_dependencias:
    - Confirmar que grupo anterior completo
    - Verificar archivos creados existen
    - Cargar estado de SESSION-TRACKING

  2_iniciar_subagentes:
    - Crear entrada en SESSION-TRACKING
    - Delegar con contexto heredado
    - Marcar estado: "activo"

  3_monitorear:
    - Esperar reportes de subagentes
    - Actualizar SESSION-TRACKING
    - Detectar errores temprano
```

### 6.2 Fin de Grupo

```yaml
PROTOCOLO_FIN:
  1_consolidar_resultados:
    - Recolectar reportes de todos los subagentes
    - Actualizar SESSION-TRACKING
    - Verificar validaciones pasaron

  2_verificar_gate_e:
    - Todos los subagentes: estado = "completado"
    - Todos los builds: "pass"
    - Todos los criterios: cumplidos

  3_decidir:
    si_exito:
      - Marcar grupo como completado
      - Proceder al siguiente grupo

    si_fallo:
      - Identificar subagente fallido
      - Reintentar o escalar
      - NO proceder hasta resolver
```

---

## 7. Manejo de Errores en Paralelo

```yaml
SI_SUBAGENTE_FALLA:
  1_aislar:
    - Detener subagente fallido
    - Continuar con otros del mismo grupo
    - Documentar error en SESSION-TRACKING

  2_evaluar:
    - Es bloqueante para el grupo?
    - Afecta a subagentes paralelos?
    - Se puede reintentar?

  3_decidir:
    si_bloqueante:
      - Detener grupo completo
      - Notificar al agente principal
      - Esperar decision

    si_no_bloqueante:
      - Continuar con otros subagentes
      - Marcar para reintento al final
      - Documentar para Fase D

  4_recuperar:
    - Reintentar con contexto actualizado
    - Si falla 2 veces: escalar al PO
```

---

## 8. Limites de Tokens por Delegacion

```yaml
LIMITES_DELEGACION:
  prompt_base: 2000                       # Instrucciones + perfil
  contexto_heredado: 1500                 # Variables + aliases
  tarea_especifica: 500                   # Descripcion + criterios
  archivos_referencia: 1500               # Codigo de patron

  total_max: 5500                         # Prompt de delegacion

  respuesta_esperada: 12000               # Para ejecucion del subagente

  margen_seguridad: 7500                  # Siempre disponible
```

---

## 9. Integracion con CAPVED

```yaml
INTEGRACION:
  fase_e:
    - SESSION-TRACKING se crea al iniciar
    - Grupos se ejecutan segun plan de Fase P
    - Cada subagente reporta a SESSION-TRACKING

  gate_e:
    - Verifica SESSION-TRACKING para cada subtarea
    - Todos los subagentes deben tener estado: "completado"
    - Todas las validaciones deben pasar

  fase_d:
    - SESSION-TRACKING se usa para documentar
    - Archivos creados se registran en inventarios
    - Errores se registran en REGISTRO-ERRORES.yml
```

---

## 10. Checklist Pre-Delegacion

```yaml
CHECKLIST:
  antes_de_delegar:
    - "[ ] Subtarea definida (max 2 archivos)"
    - "[ ] Perfil de agente seleccionado"
    - "[ ] Contexto heredado minimo (< 1500 tokens)"
    - "[ ] Criterios de aceptacion claros"
    - "[ ] Archivos de referencia identificados"
    - "[ ] SESSION-TRACKING inicializado"
    - "[ ] Dependencias del grupo previo completadas"
```

---

## 11. Referencias

| Directiva | Relacion |
|-----------|----------|
| SIMCO-DELEGACION.md | Base de delegacion |
| SIMCO-SUBAGENTE.md | Protocolo para subagentes |
| SIMCO-TAREA.md | Ciclo CAPVED |
| PRINCIPIO-ECONOMIA-TOKENS.md | Limites de tokens |
| @DEF_DELEGATION | Protocolo canonico de delegacion |

---

**Reactivado de:** _archive/SIMCO-DELEGACION-PARALELA.md (v1.1.0)
**Adaptado para:** gamilit standalone (removidas referencias a NEXUS-PARALELIZACION global)
