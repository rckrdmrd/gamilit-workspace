# TEMPLATE: RECOVERY DE CONTEXTO

**Version:** 1.0.0
**Sistema:** SIMCO + Context Engineering
**Uso:** Cuando se detecta perdida de contexto por compactacion o reinicio
**Complementa:** SIMCO-CONTEXT-ENGINEERING.md, SIMCO-INICIALIZACION.md

---

## PRINCIPIO FUNDAMENTAL

> **Un agente que detecta perdida de contexto NO debe continuar.**
> **Primero RECOVERY, luego TRABAJO.**
> **Contexto incompleto = errores garantizados.**

---

## DETECCION DE CONTEXTO PERDIDO

### Senales Directas

El sistema ha compactado contexto si:

```yaml
SENALES_SISTEMA:
  - "Mensaje indica 'context window limit'"
  - "Se menciona 'resumen de conversacion anterior'"
  - "Mensaje indica 'This session is being continued from a previous conversation'"
  - "Se recibe summary de la conversacion previa"
```

### Senales Indirectas

Sospechar perdida de contexto si:

```yaml
SENALES_AGENTE:
  verificar_inmediatamente:
    - "No recuerdo nombre exacto del proyecto"
    - "No recuerdo mi perfil de agente"
    - "No recuerdo la tarea que estaba ejecutando"
    - "No recuerdo la fase CAPVED actual"

  sospechar_fuertemente:
    - "No puedo resolver un @ALIAS que deberia conocer"
    - "Confundo nombres de tablas, entities o componentes"
    - "Propongo crear algo que recuerdo vagamente ya existe"
    - "Rutas de archivos me parecen incorrectas"

  confirmar_perdida:
    - "No recuerdo que archivos he modificado en esta sesion"
    - "No se el estado de la tarea (completada/en progreso)"
    - "Confundo convenciones entre proyectos diferentes"
```

### Confirmacion Rapida

```yaml
TEST_DE_CONTEXTO:
  preguntas:
    1: "¿Cual es mi perfil de agente?"
    2: "¿En que proyecto estoy trabajando?"
    3: "¿Cual es mi tarea actual (ID y descripcion)?"
    4: "¿En que fase CAPVED estoy?"
    5: "¿Que archivos he creado/modificado?"

  evaluacion:
    todas_respondidas: "Contexto OK - Continuar"
    alguna_falta: "Ejecutar RECOVERY inmediato"
```

---

## PROTOCOLO DE RECOVERY

### Paso 1: Identificar Estado Previo (~1 min)

```yaml
IDENTIFICAR_ESTADO:
  fuentes_primarias:
    - "Ultimo mensaje del usuario (puede contener contexto)"
    - "orchestration/PROXIMA-ACCION.md del proyecto"
    - "orchestration/trazas/TRAZA-SESION.md (si existe)"

  extraer:
    - proyecto: "Nombre del proyecto"
    - tarea: "ID y descripcion de la tarea"
    - fase: "Fase CAPVED actual"
    - trabajo_previo: "Archivos ya modificados"

  si_no_encuentro:
    - "Preguntar al usuario antes de continuar"
```

### Paso 2: Cargar Contexto Critico (~3000 tokens, ~2 min)

```yaml
CARGA_CRITICA:
  obligatorio:
    1_perfil:
      archivo: "core/orchestration/agents/perfiles/PERFIL-{MI-TIPO}.md"
      extraer: "Responsabilidades, que hago/no hago"

    2_capved:
      archivo: "core/orchestration/directivas/principios/PRINCIPIO-CAPVED.md"
      extraer: "Ciclo de vida, fase actual"

    3_proyecto:
      archivo: "projects/{PROYECTO}/orchestration/00-guidelines/PROJECT-CONTEXT.md"
      extraer: "Variables resueltas, aliases, stack"

  tokens_estimados: ~3000
  tiempo_estimado: ~2 min
```

### Paso 3: Cargar Contexto Operativo (~2000 tokens, ~2 min)

```yaml
CARGA_OPERATIVA:
  segun_tarea:
    4_simco_operacion:
      si_creando: "SIMCO-CREAR.md"
      si_modificando: "SIMCO-MODIFICAR.md"
      si_validando: "SIMCO-VALIDAR.md"

    5_simco_dominio:
      si_database: "SIMCO-DDL.md"
      si_backend: "SIMCO-BACKEND.md"
      si_frontend: "SIMCO-FRONTEND.md"

    6_inventario:
      si_database: "DATABASE_INVENTORY.yml"
      si_backend: "BACKEND_INVENTORY.yml"
      si_frontend: "FRONTEND_INVENTORY.yml"

  tokens_estimados: ~2000
  tiempo_estimado: ~2 min
```

### Paso 4: Cargar Contexto de Tarea (~2000 tokens, ~2 min)

```yaml
CARGA_TAREA:
  segun_necesidad:
    7_proxima_accion:
      archivo: "PROXIMA-ACCION.md"
      extraer: "Estado de la tarea, siguiente paso"

    8_especificacion:
      archivo: "docs/{especificacion-tarea}.md"
      extraer: "Requisitos, criterios de aceptacion"

    9_codigo_relacionado:
      archivos: "Codigo que estaba modificando"
      extraer: "Estado actual, cambios pendientes"

  tokens_estimados: ~2000
  tiempo_estimado: ~2 min
```

### Resumen de Recovery

```yaml
RECOVERY_TOTAL:
  tokens_minimo: ~3000 (solo critico)
  tokens_operativo: ~5000 (critico + operativo)
  tokens_completo: ~7000 (todo)

  tiempo_minimo: ~2 min
  tiempo_operativo: ~4 min
  tiempo_completo: ~6 min

  elegir_nivel:
    minimo: "Tarea simple, proyecto conocido"
    operativo: "Tarea en progreso, necesita inventarios"
    completo: "Tarea compleja, multiples archivos"
```

---

## VALIDACION DE RECOVERY

### Checklist Post-Recovery

```markdown
## Recovery Validation

**Fecha/Hora:** {YYYY-MM-DD HH:MM}
**Nivel de Recovery:** {MINIMO | OPERATIVO | COMPLETO}

### Contexto Critico
- [ ] Mi perfil: {PERFIL}
- [ ] Mi proyecto: {PROYECTO}
- [ ] Ruta base: {PATH}
- [ ] Stack tecnologico: {STACK}

### Contexto Operativo
- [ ] Tarea actual: {TAREA_ID} - {descripcion}
- [ ] Fase CAPVED: {C | A | P | V | E | D}
- [ ] SIMCO cargado: {SIMCO_OPERACION}, {SIMCO_DOMINIO}
- [ ] Inventario consultado: {INVENTARIO}

### Contexto de Tarea
- [ ] Especificacion accesible: {archivo}
- [ ] Archivos previos identificados: {lista}
- [ ] Criterios de aceptacion conocidos: {si/no}

### Variables Resueltas
- [ ] DB_NAME: {valor}
- [ ] BACKEND_ROOT: {valor}
- [ ] Otras criticas: {valores}

### Estado Final
**CONTEXT_RECOVERED:** {SI | NO}
**Listo para continuar:** {SI | NO - razon}
```

### Matriz de Validacion

```yaml
VALIDACION_MINIMA:
  requerido:
    - "Perfil conocido"
    - "Proyecto identificado"
    - "Tarea clara"
  si_cumple: "RECOVERED - Continuar"
  si_no_cumple: "Cargar mas contexto"

VALIDACION_OPERATIVA:
  requerido:
    - "Todo de minima"
    - "SIMCO de operacion cargado"
    - "Inventario consultado"
  si_cumple: "RECOVERED - Continuar"
  si_no_cumple: "Cargar archivos faltantes"

VALIDACION_COMPLETA:
  requerido:
    - "Todo de operativa"
    - "Especificacion de tarea accesible"
    - "Codigo relacionado revisado"
  si_cumple: "RECOVERED - Continuar"
  si_no_cumple: "Solicitar informacion al usuario"
```

---

## NOTIFICACION AL USUARIO

### Formato: Deteccion de Compactacion

```markdown
## [DETECTADA COMPACTACION DE CONTEXTO]

He detectado que mi contexto fue compactado. Esto es normal en conversaciones largas.

**Ejecutando recovery...**

Cargando:
1. [x] Mi perfil de agente
2. [x] Contexto del proyecto
3. [ ] Directivas SIMCO...
4. [ ] Inventarios...

Te informare cuando el recovery este completo.
```

### Formato: Recovery en Progreso

```markdown
## [RECOVERY EN PROGRESO]

Recargando contexto:

- Perfil: PERFIL-{TIPO} [x]
- Proyecto: {NOMBRE} [x]
- Tarea: {TAREA_ID} [x]
- SIMCO: {operacion} + {dominio} [ ]
- Inventario: {tipo} [ ]

Tokens usados en recovery: ~{N}
```

### Formato: Recovery Completado

```markdown
## [CONTEXTO RESTAURADO]

Recovery completado exitosamente.

### Resumen de Estado
| Aspecto | Valor |
|---------|-------|
| Perfil | {PERFIL} |
| Proyecto | {PROYECTO} |
| Tarea | {TAREA_ID} |
| Fase CAPVED | {FASE} |
| Ultimo trabajo | {descripcion breve} |

### Siguiente Paso
{descripcion de lo que voy a hacer ahora}

### Tokens Usados
Recovery: ~{N} tokens

¿Procedo con {siguiente accion} o necesitas que verifique algo primero?
```

### Formato: Recovery Incompleto

```markdown
## [RECOVERY INCOMPLETO]

No pude recuperar todo el contexto necesario.

### Lo que SI recupere
- Perfil: {PERFIL}
- Proyecto: {PROYECTO}

### Lo que me falta
- {item 1}
- {item 2}

### Necesito que me confirmes
1. ¿Cual era la tarea en la que estabamos trabajando?
2. ¿En que punto quedamos?
3. ¿Hay algo especifico que deba revisar?

Por favor proporciona esta informacion para continuar.
```

---

## FORMATOS COMPACTADOS

### Recovery Report Compactado

```
[RECOVERY]
STATUS: {COMPLETE | INCOMPLETE}
PROFILE: {perfil}
PROJECT: {proyecto} | PATH: {ruta}
TASK: {id} | PHASE: {fase}
LAST: {ultimo_trabajo}
TOKENS: ~{N}
[/RECOVERY]
```

### Recovery Report Ultra-Compactado

```
[RCV]{perfil}|{proyecto}|{tarea}|{fase}|OK[/RCV]
```

---

## INTEGRACION CON FLUJO DE TRABAJO

### Cuando Ejecutar Recovery

```yaml
TRIGGERS_RECOVERY:
  automatico:
    - "Mensaje del sistema indica compactacion"
    - "Test de contexto falla (no recuerdo algo critico)"

  manual:
    - "Usuario indica 'retoma desde donde quedamos'"
    - "Usuario menciona 'nueva sesion'"
    - "Han pasado varias horas desde ultima interaccion"

  preventivo:
    - "Antes de operacion critica (commit, deploy)"
    - "Al cambiar de fase CAPVED"
```

### Despues de Recovery

```yaml
POST_RECOVERY:
  1_confirmar:
    - "Validar que tengo contexto suficiente"
    - "Notificar al usuario resultado"

  2_retomar:
    - "Identificar punto exacto de continuacion"
    - "Revisar ultimo trabajo realizado"

  3_continuar:
    - "Ejecutar siguiente paso de la tarea"
    - "Mantener tracking en PROXIMA-ACCION.md"
```

---

## ANTI-PATRONES DE RECOVERY

### 1. Ignorar Compactacion
```yaml
problema: "Continuar trabajando sin recovery"
consecuencia: "Errores, alucinaciones, trabajo incorrecto"
solucion: "Siempre ejecutar recovery al detectar compactacion"
```

### 2. Recovery Excesivo
```yaml
problema: "Cargar todo el contexto posible"
consecuencia: "Desperdicio de tokens, lentitud"
solucion: "Usar nivel apropiado (minimo/operativo/completo)"
```

### 3. No Validar Recovery
```yaml
problema: "Asumir que el recovery fue exitoso"
consecuencia: "Trabajar con contexto incompleto"
solucion: "Siempre ejecutar checklist de validacion"
```

### 4. No Notificar Usuario
```yaml
problema: "Hacer recovery silencioso"
consecuencia: "Usuario no sabe estado del agente"
solucion: "Informar deteccion, progreso y resultado"
```

### 5. Recovery Sin Identificar Estado
```yaml
problema: "Cargar contexto sin saber en que punto estaba"
consecuencia: "Repetir trabajo, perder progreso"
solucion: "Primero identificar estado previo, luego cargar"
```

---

## ESTIMACIONES DE TOKENS

| Tipo | Archivos | Tokens | Tiempo |
|------|----------|--------|--------|
| Minimo | 3 archivos | ~3,000 | ~2 min |
| Operativo | 6 archivos | ~5,000 | ~4 min |
| Completo | 9+ archivos | ~7,000 | ~6 min |

### Desglose por Archivo

| Archivo | Tokens Aprox |
|---------|--------------|
| PERFIL-{TIPO}.md | ~800 |
| PRINCIPIO-CAPVED.md | ~600 |
| PROJECT-CONTEXT.md | ~1,200 |
| SIMCO-{op}.md | ~1,000 |
| {INVENTORY}.yml | ~800 |
| PROXIMA-ACCION.md | ~400 |
| docs/{spec}.md | Variable |

---

## REFERENCIAS

- **Context Engineering:** @CTX_ENG (SIMCO-CONTEXT-ENGINEERING.md)
- **Inicializacion:** @CCA (SIMCO-INICIALIZACION.md)
- **Herencia de Contexto:** @TPL_HERENCIA_CTX (TEMPLATE-HERENCIA-CONTEXTO.md)

---

**Version:** 1.0.0 | **Sistema:** SIMCO + Context Engineering | **Tipo:** Template de Recovery
