---
version: "1.1.0"
fecha: "2026-01-20"
tipo: directiva
sistema: "SIMCO - NEXUS v4.0 + GCA"
proposito: "Carga de Contexto Automatica optimizada para subagentes con soporte GCA"
aplica_a: "Agentes operando como subagentes (reciben delegacion)"
---

# SIMCO: CCA PARA SUBAGENTES (Version Ligera)

## PRINCIPIO

> **CCA-SUBAGENTE = Contexto minimo + Tarea especifica**
>
> El subagente NO necesita cargar todo el contexto del proyecto.
> El contexto del proyecto YA viene heredado del orquestador.

---

## 1. COMPARATIVA CCA

| Aspecto | CCA Completo | CCA-SUBAGENTE |
|---------|--------------|---------------|
| Fases | 4 | 2 |
| Archivos | ~15 | ~3 |
| Tokens | ~10,000 | ~1,500 |
| Proposito | Agente principal | Subagente con contexto heredado |

---

## 2. PROTOCOLO CCA-SUBAGENTE (2 Fases)

### FASE 1: Cargar Perfil Compacto

```yaml
FASE_1_PERFIL_COMPACTO:
  leer: "orchestration/agents/perfiles/compact/PERFIL-{TIPO}-COMPACT.md"
  tokens: ~250

  contiene:
    - Identidad minima
    - Responsabilidades clave (5-7 items)
    - Stack tecnologico
    - Validaciones obligatorias
    - Alias relevantes
    - Referencia a perfil completo

  segun_tipo:
    database: "PERFIL-DATABASE-COMPACT.md"
    backend: "PERFIL-BACKEND-COMPACT.md"
    frontend: "PERFIL-FRONTEND-COMPACT.md"
    devops: "PERFIL-DEVOPS-COMPACT.md"
    ml: "PERFIL-ML-COMPACT.md"
    otro: "PERFIL-GENERIC-SUBAGENT.md"
```

### FASE 2: Cargar SIMCO Unico

```yaml
FASE_2_SIMCO_UNICO:
  determinar_segun_operacion:
    si_crear: "SIMCO-CREAR.md"
    si_modificar: "SIMCO-MODIFICAR.md"
    si_validar: "SIMCO-VALIDAR.md"
  tokens: ~800

  NO_cargar:
    - SIMCO-TAREA.md (solo para orquestadores)
    - SIMCO-DELEGACION.md (solo para orquestadores)
    - SIMCO-CAPVED-PLUS.md (solo para orquestadores)
    - SIMCO-DELEGACION-PARALELA.md (solo para orquestadores)
```

### RESULTADO

```yaml
RESULTADO:
  mensaje: "CCA-SUBAGENTE completado"
  tokens_totales: ~1,050
  ready: true
```

---

## 3. LO QUE NO SE CARGA

### Contexto que VIENE HEREDADO (no cargar)

```yaml
HEREDADO_DEL_ORQUESTADOR:
  - Variables de proyecto (DB_NAME, BACKEND_ROOT, etc.)
  - Aliases resueltos (@DDL, @BACKEND, etc.)
  - Estado actual (tablas, entities existentes)
  - Documentacion de referencia especifica
  - Criterios de aceptacion
  - Codigo de referencia (file:line)
```

### Contexto que NO APLICA a subagentes

```yaml
NO_APLICA:
  - 6 Principios completos (resumen incluido en perfil compact)
  - CONTEXTO-PROYECTO.md (ya heredado)
  - PROXIMA-ACCION.md (responsabilidad del orquestador)
  - SIMCO-TAREA.md (para ciclo CAPVED completo)
  - Multiples inventarios (solo extracto relevante)
  - SESSION-TRACKING.yml (responsabilidad del orquestador)
```

---

## 4. CHECKLIST POST-CCA

```yaml
CHECKLIST_SUBAGENTE:
  - [ ] Lei PERFIL-{TIPO}-COMPACT.md
  - [ ] Lei SIMCO de operacion (CREAR/MODIFICAR/VALIDAR)
  - [ ] Tengo contexto heredado del orquestador:
        - Variables resueltas (sin placeholders)
        - Aliases resueltos (rutas completas)
  - [ ] Entiendo la tarea especifica:
        - Que archivo(s) crear/modificar
        - Criterios de aceptacion
  - [ ] Tengo referencia de codigo (file:line)

READY_TO_EXECUTE: "Si todos los checks pasan"
```

---

## 5. SI FALTA ALGO

```yaml
SI_FALTA_CONTEXTO:
  accion: "ESCALAR a orquestador"

  formato:
    tipo: "CONTEXTO_INCOMPLETO"
    falta:
      - "{especificar que falta}"
    necesito:
      - "{especificar que necesito}"

  NO_hacer:
    - NO asumir valores
    - NO inventar rutas
    - NO crear sin especificacion
```

---

## 6. DIAGRAMA DE FLUJO

```
SUBAGENTE RECIBE DELEGACION
         |
         v
+------------------+
| VERIFICAR        |
| CONTEXTO         |
| HEREDADO         |
+------------------+
         |
    +---------+
    | Completo?|
    +---------+
      |     |
     SI    NO --> ESCALAR A ORQUESTADOR
      |
      v
+------------------+
| FASE 1:          |
| PERFIL-COMPACT   |
| (~250 tokens)    |
+------------------+
         |
         v
+------------------+
| FASE 2:          |
| SIMCO UNICO      |
| (~800 tokens)    |
+------------------+
         |
         v
+------------------+
| CHECKLIST        |
| POST-CCA         |
+------------------+
         |
    +---------+
    | Pasa?   |
    +---------+
      |     |
     SI    NO --> ESCALAR A ORQUESTADOR
      |
      v
+------------------+
| READY_TO_EXECUTE |
| (~1,050 tokens)  |
+------------------+
         |
         v
    EJECUTAR TAREA
```

---

## 7. HERENCIA GCA (Formato Optimizado)

Cuando el orquestador usa GCA, el subagente recibe herencia en formato ultra-compacto:

### Formato de Herencia GCA

```
[GCA-CTX]
PRJ:{proyecto}|LVL:{nivel}|AGENT:{tipo_subagente}
REFS:@DDL→{path}|@BACKEND→{path}|@INV→{path}
TRACE:SESSION-TRACE-{fecha}.yml
PREV:{tareas_completadas_resumidas}
[/GCA-CTX]

## Tarea
{descripcion}

## Criterios
- {criterio 1}
- {criterio 2}
```

### Ejemplo Real

```
[GCA-CTX]
PRJ:gamilit|LVL:STANDALONE|AGENT:BACKEND
REFS:@DDL→apps/database/ddl|@BACKEND→apps/backend/src|@INV→orchestration/inventarios
TRACE:SESSION-TRACE-2026-01-20.yml
PREV:ST-001(tabla_ok)
[/GCA-CTX]

## Tarea
Crear NotificationEntity alineada con tabla notifications

## Criterios
- Entity en src/modules/notification/
- Campos coinciden con DDL
- Build pasa
```

### Tokens de Herencia GCA

| Formato | Tokens |
|---------|--------|
| Herencia completa (anterior) | ~500-1000 |
| Herencia GCA | ~100-150 |
| **Ahorro** | **~80%** |

### Consulta de Contexto Previo

Si el subagente necesita mas contexto sobre tareas anteriores:

```yaml
CONSULTAR_TRACE:
  archivo: "SESSION-TRACE-{fecha}.yml"
  seccion: "tareas_ejecutadas"
  buscar: "{id_tarea_previa}"
```

---

## 8. REFERENCIAS

| Documento | Proposito |
|-----------|-----------|
| `SIMCO-SUBAGENTE.md` | Protocolo completo de subagente |
| `SIMCO-CONTEXT-MANAGEMENT.md` | Gestion de Contexto Activa (GCA) |
| `CONTEXT-LAYER-MAP.yml` | Definicion de capas GCA |
| `agents/perfiles/compact/` | Perfiles compactos |
| `SIMCO-INICIALIZACION.md` | CCA completo (para agentes principales) |

---

## FLUJO DE DOCUMENTACIÓN - CONTEXT ENGINEERING

Este documento forma parte del sistema de **Context Engineering** del workspace:

```
┌──────────────────────────────────────────────────────────────────┐
│                    CONTEXT ENGINEERING                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SIMCO-CONTEXT-ENGINEERING.md                                 │
│     └─ TEORÍA: Niveles L0-L3, presupuesto tokens, recovery       │
│                                                                  │
│  2. SIMCO-CONTEXT-RESOLUTION.md                                  │
│     └─ AUTOMÁTICO: Resolución por keywords y mapeo tarea→archivo │
│                                                                  │
│  3. SIMCO-CCA-SUBAGENTE.md (ESTE ARCHIVO)                        │
│     └─ LIGERO: CCA reducido para subagentes (2 fases, ~1050 tok) │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Cuándo usar cada uno:**
- **CONTEXT-ENGINEERING** → Para entender teoría de contexto, métricas, anti-patrones
- **CONTEXT-RESOLUTION** → Para automatizar qué archivos cargar según la tarea
- **Este archivo** → Para subagentes delegados (contexto heredado)

---

**Version:** 1.1.0 | **Sistema:** SIMCO-NEXUS v4.0 + GCA | **Tipo:** Directiva CCA Ligero
**Actualizado:** 2026-01-20
