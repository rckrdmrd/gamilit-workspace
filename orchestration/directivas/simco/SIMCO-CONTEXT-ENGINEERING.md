# SIMCO: CONTEXT ENGINEERING

**Version:** 1.0.0
**Sistema:** SIMCO + CAPVED + Context Engineering
**Proposito:** Guia para disenar, cargar, mantener y recuperar contexto efectivo para agentes IA
**Actualizado:** 2026-01-03

---

## PRINCIPIO FUNDAMENTAL

> **Un agente con contexto insuficiente alucinara.**
> **Un agente con contexto excesivo desperdiciara tokens y perdera foco.**
> **El objetivo es el CONTEXTO JUSTO: minimo necesario, maximo efectivo.**

---

## CONCEPTOS CLAVE

### Contexto Minimo Viable (CMV)

```yaml
Definicion: "El conjunto minimo de informacion que un agente necesita para ejecutar una tarea sin alucinar"

Componentes_CMV:
  identidad:
    - Mi perfil (quien soy, que hago, que NO hago)
    - Principios fundamentales que debo seguir

  ubicacion:
    - Proyecto actual
    - Nivel jerarquico (STANDALONE, VERTICAL, etc.)
    - Tarea asignada

  operacion:
    - SIMCO de operacion aplicable
    - Fase CAPVED actual

Tokens_Estimados: ~5000-6000 tokens
Resultado: "Agente puede operar sin errores criticos"
```

### Contexto Optimo

```yaml
Definicion: "Balance ideal entre completitud y eficiencia de tokens"

Componentes_Adicionales:
  dominio:
    - SIMCO de dominio especifico (DDL, BACKEND, FRONTEND, etc.)
    - Inventarios relevantes

  tarea:
    - Documentacion especifica (docs/)
    - Codigo relacionado existente
    - Patrones a seguir

Tokens_Estimados: ~9000-12000 tokens
Resultado: "Agente puede ejecutar con alta calidad y consistencia"
```

### Contexto Extendido

```yaml
Definicion: "Contexto adicional para tareas complejas o cross-cutting"

Componentes_Adicionales:
  arquitectura:
    - ADRs relevantes
    - Patrones de la carpeta patrones/

  historico:
    - Trazas de tareas anteriores
    - Lecciones aprendidas

  cross_layer:
    - Inventarios de otras capas
    - Dependencias entre modulos

Tokens_Estimados: ~15000-18000 tokens
Resultado: "Agente puede tomar decisiones arquitectonicas"
```

---

## NIVELES DE CONTEXTO

| Nivel | Contenido | Tokens Aprox | Cuando Usar |
|-------|-----------|--------------|-------------|
| **L0: Sistema** | Principios (6) + Perfil | ~4000 | SIEMPRE - Base obligatoria |
| **L1: Proyecto** | CONTEXTO-PROYECTO + Inventarios | ~3000 | SIEMPRE - Ubicacion y estado |
| **L2: Operacion** | SIMCO operacion + dominio | ~2000 | Segun tipo de tarea |
| **L3: Tarea** | docs/ + codigo relacionado | Variable (~3000-8000) | Segun complejidad |

### Matriz de Carga por Tipo de Tarea

```yaml
Tarea_Simple:
  descripcion: "Modificacion puntual, bug fix simple"
  niveles: [L0, L1, L2_parcial]
  tokens_objetivo: ~8000
  ejemplo: "Agregar campo a DTO existente"

Tarea_Estandar:
  descripcion: "Crear componente, implementar endpoint"
  niveles: [L0, L1, L2, L3_parcial]
  tokens_objetivo: ~12000
  ejemplo: "Crear modulo de notificaciones"

Tarea_Compleja:
  descripcion: "Disenar subsistema, refactoring mayor"
  niveles: [L0, L1, L2, L3_completo]
  tokens_objetivo: ~18000
  ejemplo: "Implementar sistema de permisos"

Tarea_Arquitectonica:
  descripcion: "Decisiones cross-cutting, nuevos patrones"
  niveles: [L0, L1, L2, L3, Extendido]
  tokens_objetivo: ~22000
  ejemplo: "Definir estrategia de cache distribuido"
```

---

## PATRON DE CARGA EFICIENTE

### Orden Optimo de Carga (CCA Extendido)

```yaml
FASE_1_IDENTIDAD: # ~4000 tokens, ~3 min
  orden_estricto:
    1. "Principios fundamentales (6 archivos)"
    2. "Mi perfil (PERFIL-{TIPO}.md)"
    3. "Sistema de aliases (ALIASES.yml)"
    4. "Indice SIMCO (_INDEX.md)"

  validacion: "Puedo responder: Quien soy? Que principios sigo?"

FASE_2_UBICACION: # ~3000 tokens, ~3 min
  orden_estricto:
    5. "CONTEXTO-PROYECTO.md (variables resueltas)"
    6. "PROXIMA-ACCION.md (estado actual)"
    7. "Inventario principal de mi dominio"

  validacion: "Puedo responder: Donde estoy? Cual es mi tarea?"

FASE_3_OPERACION: # ~2000 tokens, ~2 min
  orden_segun_tarea:
    8. "SIMCO-TAREA.md (si genera commit)"
    9. "SIMCO-{OPERACION}.md (CREAR/MODIFICAR/etc.)"
    10. "SIMCO-{DOMINIO}.md (DDL/BACKEND/FRONTEND/etc.)"

  validacion: "Puedo responder: Como debo proceder?"

FASE_4_TAREA: # Variable, ~5 min
  orden_contextual:
    11. "docs/ especificos de la tarea"
    12. "Codigo existente relacionado"
    13. "Patrones similares implementados"

  validacion: "Puedo responder: Que debo implementar exactamente?"
```

### Estrategia de Carga Lazy

```yaml
Principio: "Cargar solo cuando se necesita, no antes"

Implementacion:
  inicio_sesion:
    - Cargar FASE_1 y FASE_2 completas
    - Cargar FASE_3 segun primera tarea

  durante_ejecucion:
    - Cargar FASE_4 antes de implementar
    - Descartar contexto de tareas anteriores

  al_cambiar_tarea:
    - Mantener FASE_1 y FASE_2
    - Recargar FASE_3 y FASE_4

Beneficio: "Maximiza tokens disponibles para output"
```

---

## PROTOCOLO DE RECOVERY

### Deteccion de Compactacion

```yaml
Senales_de_Alerta:
  criticas:
    - "No recuerdo mi perfil o proyecto"
    - "No puedo resolver @ALIAS que deberia conocer"
    - "Recibo mensaje de 'resumen de conversacion anterior'"

  moderadas:
    - "Desconozco estado de tarea en curso"
    - "Confundo archivos o rutas del proyecto"
    - "Pierdo tracking de fase CAPVED actual"

  leves:
    - "Olvido detalles de implementacion reciente"
    - "Necesito releer documentacion ya consultada"

Confirmacion:
  pregunta: "Recuerdo mi PERFIL, PROYECTO, TAREA y FASE CAPVED?"
  si_falta_algo: "Ejecutar RECOVERY inmediatamente"
```

### Proceso de Recovery en 3 Fases

```yaml
RECOVERY_CRITICO: # Prioridad 1 - ~3000 tokens, ~2 min
  objetivo: "Restaurar identidad y ubicacion"
  cargar:
    - "Mi perfil: agents/perfiles/PERFIL-{TIPO}.md"
    - "Ultimo mensaje del usuario o PROXIMA-ACCION.md"
    - "PRINCIPIO-CAPVED.md (resumen operativo)"
  validar:
    - "Se quien soy"
    - "Se en que proyecto estoy"
    - "Se que tarea tengo"

RECOVERY_OPERATIVO: # Prioridad 2 - ~2000 tokens, ~2 min
  objetivo: "Restaurar capacidad de ejecucion"
  cargar:
    - "SIMCO-TAREA.md (si aplica)"
    - "SIMCO-{DOMINIO}.md de mi perfil"
    - "Inventario relevante"
  validar:
    - "Se como proceder"
    - "Conozco estado del proyecto"

RECOVERY_TAREA: # Prioridad 3 - ~2000 tokens, ~2 min
  objetivo: "Restaurar contexto especifico"
  cargar:
    - "CONTEXTO-PROYECTO.md"
    - "docs/ especificos de tarea actual"
    - "Estado de archivos modificados"
  validar:
    - "Puedo continuar donde quede"
    - "No perdere trabajo previo"
```

### Notificacion al Usuario

```markdown
## Template: Notificacion de Recovery

[RECARGA DE CONTEXTO]

Detecte que mi contexto fue compactado. Ejecutando recovery:

1. [x] Perfil recuperado: {PERFIL}
2. [x] Proyecto identificado: {PROYECTO}
3. [x] Tarea actual: {TAREA_ID}
4. [x] Fase CAPVED: {FASE}
5. [x] Directivas SIMCO cargadas

Recovery completado en {X} archivos (~{Y} tokens).

Continuando desde: {descripcion del punto de continuacion}

Siguiente accion: {accion inmediata}
```

---

## METRICAS Y LIMITES

### Limites de Tokens por Modelo

| Modelo | Input Max | Output Max | Contexto Seguro | Margen Output |
|--------|-----------|------------|-----------------|---------------|
| Claude 3.5 Sonnet | ~200K | ~8K | ~15000 | ~5000 |
| Claude 3 Opus | ~200K | ~4K | ~15000 | ~3000 |
| Claude 3 Haiku | ~200K | ~4K | ~12000 | ~3000 |

### Presupuesto de Tokens por Sesion

```yaml
Presupuesto_Recomendado:
  contexto_base: ~8000      # L0 + L1 + L2
  contexto_tarea: ~5000     # L3 variable
  margen_output: ~5000      # Para respuestas
  buffer_seguridad: ~2000   # Imprevistos

  total_seguro: ~20000 tokens

Alertas:
  amarilla: ">15000 tokens de contexto"
  roja: ">18000 tokens de contexto"
  critica: ">22000 tokens - riesgo de truncamiento"
```

### Metricas de Eficiencia

```yaml
Indicadores_Positivos:
  - "Ratio contexto/output < 3:1"
  - "Recovery ejecutado < 1 vez por sesion"
  - "Cero alucinaciones por falta de contexto"
  - "Tiempo de carga inicial < 5 minutos"

Indicadores_Negativos:
  - "Ratio contexto/output > 5:1"
  - "Multiples recoverys por sesion"
  - "Necesidad de releer archivos ya cargados"
  - "Contexto duplicado entre cargas"
```

---

## ANTI-PATRONES

### 1. Carga Masiva (Overload)

```yaml
Descripcion: "Cargar todo el contexto disponible sin discriminar"
Sintoma: "Tokens de contexto > 25000"
Problema: "Pierde foco, desperdicia tokens, puede truncar"
Solucion: "Aplicar carga por niveles, usar lazy loading"
```

### 2. Carga Lazy Extrema (Underload)

```yaml
Descripcion: "No cargar contexto hasta que falle algo"
Sintoma: "Alucinaciones frecuentes, preguntas basicas"
Problema: "Errores evitables, retrabajo, perdida de confianza"
Solucion: "Siempre cargar CMV antes de actuar"
```

### 3. Contexto Stale (Desactualizado)

```yaml
Descripcion: "Mantener contexto viejo tras cambios en el proyecto"
Sintoma: "Referencias a archivos movidos o renombrados"
Problema: "Decisiones basadas en estado obsoleto"
Solucion: "Recargar inventarios antes de operaciones criticas"
```

### 4. Duplicacion de Contexto

```yaml
Descripcion: "Cargar mismo archivo multiples veces en sesion"
Sintoma: "Tokens desperdiciados en contenido repetido"
Problema: "Reduce capacidad para contexto util"
Solucion: "Mantener registro de archivos ya cargados"
```

### 5. Recovery Ignorado

```yaml
Descripcion: "Continuar trabajando tras compactacion sin recovery"
Sintoma: "Respuestas inconsistentes con trabajo previo"
Problema: "Perdida de continuidad, errores graves"
Solucion: "Detectar compactacion, ejecutar recovery ANTES de continuar"
```

### 6. Contexto Sin Validacion

```yaml
Descripcion: "Asumir que el contexto cargado es suficiente"
Sintoma: "No verificar completitud antes de actuar"
Problema: "Gaps de informacion causan alucinaciones"
Solucion: "Ejecutar checklist de validacion post-carga"
```

---

## CHECKLIST DE CONTEXTO

### Pre-Ejecucion

```markdown
## Checklist de Contexto - {TAREA}

### Nivel L0: Sistema
- [ ] Lei los 6 principios fundamentales
- [ ] Lei mi perfil PERFIL-{TIPO}.md
- [ ] Cargue ALIASES.yml
- [ ] Cargue _INDEX.md de SIMCO

### Nivel L1: Proyecto
- [ ] Lei CONTEXTO-PROYECTO.md
- [ ] Lei PROXIMA-ACCION.md
- [ ] Cargue inventario de mi dominio

### Nivel L2: Operacion
- [ ] Identifique operacion: {CREAR|MODIFICAR|VALIDAR|...}
- [ ] Cargue SIMCO-{operacion}.md
- [ ] Cargue SIMCO-{dominio}.md (si aplica)

### Nivel L3: Tarea
- [ ] Consulte docs/ relevante
- [ ] Revise codigo existente similar
- [ ] Identifique patrones a seguir

### Validacion Final
- [ ] Puedo responder QUIEN soy
- [ ] Puedo responder DONDE estoy
- [ ] Puedo responder QUE debo hacer
- [ ] Puedo responder COMO debo hacerlo
- [ ] Tokens de contexto < 15000

Estado: [ ] READY_TO_EXECUTE | [ ] NECESITO_MAS_CONTEXTO
```

### Post-Recovery

```markdown
## Validacion Post-Recovery - {FECHA}

- [ ] Conozco mi perfil: {PERFIL}
- [ ] Conozco mi proyecto: {PROYECTO}
- [ ] Conozco mi tarea: {TAREA_ID}
- [ ] Conozco mi fase CAPVED: {FASE}
- [ ] Puedo resolver @ALIASES esenciales
- [ ] Tengo inventarios relevantes cargados
- [ ] Se que archivos he modificado (si aplica)

Estado: [ ] RECOVERED | [ ] INCOMPLETE - cargar mas contexto
```

---

## INTEGRACION CON SISTEMA NEXUS

### Con SIMCO-INICIALIZACION

```yaml
Relacion: "Context Engineering EXTIENDE el protocolo CCA"
Uso_Conjunto:
  - "CCA define QUE cargar"
  - "Context Engineering define CUANTO y CUANDO"
  - "Recovery complementa CCA para sesiones largas"
```

### Con SIMCO-DELEGACION

```yaml
Relacion: "Context Engineering informa herencia a subagentes"
Uso_Conjunto:
  - "Usar @TPL_HERENCIA_CTX para pasar contexto"
  - "Subagente ejecuta su propio CCA"
  - "Contexto heredado reduce carga del subagente"
```

### Con Principio ECONOMIA-TOKENS

```yaml
Relacion: "Context Engineering IMPLEMENTA economia de tokens"
Uso_Conjunto:
  - "Presupuesto de tokens guia carga de contexto"
  - "Lazy loading maximiza tokens para output"
  - "Recovery minimiza desperdicio por compactacion"
```

---

## REFERENCIAS

| Documento | Alias | Proposito |
|-----------|-------|-----------|
| SIMCO-INICIALIZACION.md | @INIT | Protocolo CCA base |
| TEMPLATE-RECOVERY-CONTEXT.md | @TPL_RECOVERY_CTX | Template de recovery |
| TEMPLATE-HERENCIA-CONTEXTO.md | @TPL_HERENCIA_CTX | Herencia a subagentes |
| PRINCIPIO-ECONOMIA-TOKENS.md | @ECONOMIA | Principio de economia |
| PRINCIPIO-CAPVED.md | @CAPVED | Ciclo de vida de tareas |

---

## FLUJO DE DOCUMENTACIÓN - CONTEXT ENGINEERING

Este documento forma parte del sistema de **Context Engineering** del workspace. Los tres documentos se relacionan así:

```
┌──────────────────────────────────────────────────────────────────┐
│                    CONTEXT ENGINEERING                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SIMCO-CONTEXT-ENGINEERING.md (ESTE ARCHIVO)                  │
│     └─ TEORÍA: Niveles L0-L3, presupuesto tokens, recovery       │
│                                                                  │
│  2. SIMCO-CONTEXT-RESOLUTION.md                                  │
│     └─ AUTOMÁTICO: Resolución por keywords y mapeo tarea→archivo │
│                                                                  │
│  3. SIMCO-CCA-SUBAGENTE.md                                       │
│     └─ LIGERO: CCA reducido para subagentes (2 fases, ~1050 tok) │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Cuándo usar cada uno:**
- **Este archivo** → Para entender teoría de contexto, métricas, anti-patrones
- **CONTEXT-RESOLUTION** → Para automatizar qué archivos cargar según la tarea
- **CCA-SUBAGENTE** → Para subagentes delegados (contexto heredado)

---

**Version:** 1.0.1 | **Sistema:** SIMCO + Context Engineering | **Tipo:** Directiva Operativa
**Actualizado:** 2026-01-10
