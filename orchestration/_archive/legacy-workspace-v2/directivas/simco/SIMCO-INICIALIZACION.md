# SIMCO: INICIALIZACION DE AGENTES

**Version:** 1.5.0
**Sistema:** SIMCO + CAPVED + Economia de Tokens + Context Engineering + GCA + Subagentes
**Proposito:** Definir el proceso de bootstrap y recovery para cualquier agente
**Actualizado:** 2026-01-20

---

## PRINCIPIO FUNDAMENTAL

> **Un agente inicializado correctamente NO alucina porque tiene TODO el contexto necesario antes de actuar.**
> **Un agente que detecta compactacion ejecuta RECOVERY antes de continuar.**

---

## PROMPT DE INICIALIZACION (Template Universal)

```markdown
Seras {PERFIL_AGENTE} trabajando en el proyecto {PROYECTO}
para realizar: {DESCRIPCION_TAREA}

Antes de actuar, ejecuta el protocolo CCA (Carga de Contexto Automatica).
```

**Ejemplo real:**
```markdown
Seras Backend-Agent trabajando en el proyecto trading-platform
para realizar: Crear el modulo de notificaciones con endpoints CRUD

Antes de actuar, ejecuta el protocolo CCA (Carga de Contexto Automatica).
```

---

## PROTOCOLO CCA: CARGA DE CONTEXTO AUTOMATICA

### Fase 0: IDENTIFICACION (Automatica)

```yaml
Al recibir prompt de inicializacion, extraer:
  PERFIL: {tipo de agente mencionado}
  PROYECTO: {nombre del proyecto}
  TAREA: {descripcion de la tarea}
  OPERACION: {inferir: CREAR | MODIFICAR | VALIDAR | INVESTIGAR}
  DOMINIO: {inferir: DDL | BACKEND | FRONTEND | MIXTO}
```

### Fase 1: CARGA NIVEL CORE (Obligatorio - ~5 min)

```
LEER EN ORDEN ESTRICTO:

1. PRINCIPIOS FUNDAMENTALES (6 archivos)
   └── core/orchestration/directivas/principios/
       ├── PRINCIPIO-CAPVED.md              # Ciclo de vida de tareas
       ├── PRINCIPIO-DOC-PRIMERO.md
       ├── PRINCIPIO-ANTI-DUPLICACION.md
       ├── PRINCIPIO-VALIDACION-OBLIGATORIA.md
       ├── PRINCIPIO-ECONOMIA-TOKENS.md     # Desglose de tareas
       └── PRINCIPIO-NO-ASUMIR.md           # No asumir, preguntar

2. MI PERFIL
   └── core/orchestration/agents/perfiles/PERFIL-{MI-TIPO}.md
       Extraer:
       - Que SI hago
       - Que NO hago (delegar)
       - Directivas SIMCO que debo seguir
       - Context Requirements (si existe)

3. INDICE SIMCO
   └── core/orchestration/directivas/simco/_INDEX.md
       Entender estructura del sistema

4. SISTEMA DE ALIASES
   └── core/orchestration/referencias/ALIASES.yml
       Cargar resolucion de @ALIAS
```

### Fase 2: CARGA NIVEL PROYECTO (Obligatorio - ~5 min)

```
LEER EN ORDEN:

5. CONTEXTO DEL PROYECTO
   └── projects/{PROYECTO}/orchestration/CONTEXTO-PROYECTO.md  # Usar template base
       Extraer:
       - Variables resueltas (DB_NAME, BACKEND_ROOT, etc.)
       - Alias resueltos (@DDL, @BACKEND, etc.)
       - Stack tecnologico
       - Estructura del proyecto

6. PROXIMA ACCION
   └── projects/{PROYECTO}/orchestration/PROXIMA-ACCION.md
       Verificar:
       - ¿Mi tarea es la proxima prioridad?
       - ¿Hay dependencias previas?
       - ¿Hay contexto de sesiones anteriores?

7. INVENTARIO RELEVANTE
   └── Segun mi dominio:
       - DDL: @INV_DB (DATABASE_INVENTORY.yml)
       - Backend: @INV_BE (BACKEND_INVENTORY.yml)
       - Frontend: @INV_FE (FRONTEND_INVENTORY.yml)
       - Mixto: MASTER_INVENTORY.yml
```

### Fase 3: CARGA NIVEL OPERACION (Segun tarea - ~3 min)

```
LEER SIMCO DE OPERACION:

8. SIMCO-TAREA.md (Si es HU que genera commit)
   └── Proceso CAPVED completo: C→A→P→V→E→D

9. SIMCO BASE (segun operacion inferida)
   └── Crear algo nuevo → SIMCO-CREAR.md
       Modificar existente → SIMCO-MODIFICAR.md
       Validar/revisar → SIMCO-VALIDAR.md
       Buscar/investigar → SIMCO-BUSCAR.md
       Documentar → SIMCO-DOCUMENTAR.md

10. SIMCO DE DOMINIO (si aplica)
   └── Base de datos → SIMCO-DDL.md
       Backend NestJS → SIMCO-BACKEND.md
       Frontend React → SIMCO-FRONTEND.md
```

### Fase 4: CARGA NIVEL TAREA (Especifico - ~5 min)

```
LEER DOCUMENTACION RELEVANTE:

11. DOCUMENTACION DEL PROYECTO
    └── projects/{PROYECTO}/docs/
        Buscar especificaciones relacionadas con mi tarea:
        - Diseno de entidades
        - Especificaciones de API
        - Wireframes/mockups
        - ADRs relevantes

12. CODIGO EXISTENTE RELACIONADO
    └── Buscar patrones similares ya implementados:
        - ¿Existe modulo similar? → Usar como referencia
        - ¿Existe tabla similar? → Seguir convenciones
        - ¿Existe componente similar? → Reutilizar patrones

13. DEPENDENCIAS DE LA TAREA
    └── Identificar que debe existir ANTES:
        - ¿Necesito tabla que no existe? → Crear primero o delegar
        - ¿Necesito endpoint que no existe? → Crear primero o delegar
        - ¿Necesito tipo que no existe? → Crear primero
```

---

## DETECCION DE COMPACTACION

### Senales de Contexto Compactado

El agente DEBE sospechar compactacion si:

```yaml
SENALES_CRITICAS:
  - "No recuerdo haber ejecutado las fases anteriores del CCA"
  - "Recibo un resumen de 'conversacion anterior' del sistema"
  - "No puedo resolver un @ALIAS que deberia conocer"
  - "Desconozco variables que deberia tener resueltas"
  - "No puedo identificar mi fase CAPVED actual"

SENALES_MODERADAS:
  - "Desconozco el estado de la tarea en curso"
  - "Confundo archivos o rutas del proyecto"
  - "Olvido detalles de implementacion reciente"

CONFIRMACION:
  pregunta: "Recuerdo mi PERFIL, PROYECTO, TAREA y FASE CAPVED?"
  si_falta_algo: "Ejecutar RECOVERY inmediatamente"
```

### Accion Inmediata

```yaml
Si_detecta_compactacion:
  accion: "Ejecutar RECOVERY antes de continuar"
  referencia: "@CONTEXT_RECOVERY"
  prioridad: "CRITICA - No ejecutar tarea sin recovery"
  notificar: "Informar al usuario que se esta ejecutando recovery"
```

---

## PROTOCOLO DE RECOVERY

### Cuando Ejecutar

- Despues de detectar compactacion
- Al inicio de sesion nueva con tarea pendiente
- Cuando el usuario indica "continua donde quedaste"
- Cuando se pierde tracking de la sesion

### Proceso de Recovery en 3 Fases

```yaml
RECOVERY_FASE_1_CRITICO:
  tiempo: "~2 min"
  tokens: "~3000"
  objetivo: "Restaurar identidad y ubicacion"
  cargar:
    - Mi perfil: "agents/perfiles/PERFIL-{TIPO}.md"
    - Ultimo mensaje del usuario o PROXIMA-ACCION.md
    - PRINCIPIO-CAPVED.md (resumen operativo)
  validar:
    - "Se quien soy"
    - "Se en que proyecto estoy"
    - "Se que tarea tengo"

RECOVERY_FASE_2_OPERATIVO:
  tiempo: "~2 min"
  tokens: "~2000"
  objetivo: "Restaurar capacidad de ejecucion"
  cargar:
    - SIMCO-TAREA.md (si tarea genera commit)
    - SIMCO-{DOMINIO}.md (segun tarea)
    - Inventario relevante
  validar:
    - "Se como proceder"
    - "Conozco estado del proyecto"

RECOVERY_FASE_3_PROYECTO:
  tiempo: "~2 min"
  tokens: "~2000"
  objetivo: "Restaurar contexto especifico"
  cargar:
    - CONTEXTO-PROYECTO.md
    - docs/ especificos de la tarea
    - Estado de archivos modificados
  validar:
    - "Tengo variables del proyecto"
    - "Conozco specs de mi tarea"
```

### Notificacion al Usuario

```markdown
[RECARGA DE CONTEXTO]

Detecte perdida de contexto. Ejecutando recovery:

1. [x] Perfil recuperado: {PERFIL}
2. [x] Proyecto identificado: {PROYECTO}
3. [x] Tarea actual: {TAREA_ID}
4. [x] Fase CAPVED: {FASE}
5. [x] Directivas SIMCO cargadas

Recovery completado (~{X} tokens).

Continuando desde: {descripcion del punto de continuacion}

Siguiente accion: {accion inmediata}
```

---

## VALIDACION POST-RECOVERY

### Checklist de Validacion

```markdown
## Recovery Validation - {FECHA}

### Identidad
- [ ] Conozco mi perfil: {PERFIL}
- [ ] Conozco mi proyecto: {PROYECTO}
- [ ] Conozco mi tarea: {TAREA_ID}
- [ ] Conozco mi fase CAPVED: {FASE}

### Operacion
- [ ] Tengo SIMCO de operacion cargado
- [ ] Tengo SIMCO de dominio cargado (si aplica)
- [ ] Tengo inventario relevante

### Contexto Especifico
- [ ] Puedo resolver @ALIASES esenciales
- [ ] Conozco archivos modificados en sesion
- [ ] Tengo documentacion de tarea

Estado: [ ] RECOVERED | [ ] NECESITA_MAS_CONTEXTO
```

### Si Validacion Falla

```yaml
Si_recovery_incompleto:
  accion: "Solicitar contexto adicional al usuario"
  mensaje: |
    Mi recovery fue parcial. No pude recuperar:
    - {item faltante 1}
    - {item faltante 2}

    ¿Puedes indicarme:
    - {pregunta especifica 1}?
    - {pregunta especifica 2}?
```

---

## MAPA DE CARGA POR PERFIL

### Database-Agent

```yaml
CORE (siempre):
  - principios/*.md (6, incluyendo CAPVED y Tokens)
  - PERFIL-DATABASE.md
  - ALIASES.yml

PROYECTO (siempre):
  - CONTEXTO-PROYECTO.md
  - PROXIMA-ACCION.md
  - DATABASE_INVENTORY.yml

OPERACION (segun tarea):
  crear_tabla: [SIMCO-CREAR.md, SIMCO-DDL.md]
  modificar_tabla: [SIMCO-MODIFICAR.md, SIMCO-DDL.md]
  crear_funcion: [SIMCO-CREAR.md, SIMCO-DDL.md]
  crear_indice: [SIMCO-CREAR.md, SIMCO-DDL.md]

TAREA:
  - docs/{especificacion-entidad}.md
  - DDL existente del schema
  - Convenciones SQL del proyecto
```

### Backend-Agent

```yaml
CORE (siempre):
  - principios/*.md (6, incluyendo CAPVED y Tokens)
  - PERFIL-BACKEND.md
  - ALIASES.yml

PROYECTO (siempre):
  - CONTEXTO-PROYECTO.md
  - PROXIMA-ACCION.md
  - BACKEND_INVENTORY.yml
  - DATABASE_INVENTORY.yml (para alinear con DDL)

OPERACION (segun tarea):
  crear_modulo: [SIMCO-CREAR.md, SIMCO-BACKEND.md]
  crear_entity: [SIMCO-CREAR.md, SIMCO-BACKEND.md]
  crear_endpoint: [SIMCO-CREAR.md, SIMCO-BACKEND.md]
  modificar_service: [SIMCO-MODIFICAR.md, SIMCO-BACKEND.md]

TAREA:
  - docs/{especificacion-api}.md
  - DDL de tabla relacionada
  - Entities similares existentes
  - Services similares existentes
```

### Frontend-Agent

```yaml
CORE (siempre):
  - principios/*.md (6, incluyendo CAPVED y Tokens)
  - PERFIL-FRONTEND.md
  - ALIASES.yml

PROYECTO (siempre):
  - CONTEXTO-PROYECTO.md
  - PROXIMA-ACCION.md
  - FRONTEND_INVENTORY.yml
  - BACKEND_INVENTORY.yml (para conocer endpoints)

OPERACION (segun tarea):
  crear_componente: [SIMCO-CREAR.md, SIMCO-FRONTEND.md]
  crear_pagina: [SIMCO-CREAR.md, SIMCO-FRONTEND.md]
  crear_hook: [SIMCO-CREAR.md, SIMCO-FRONTEND.md]
  modificar_componente: [SIMCO-MODIFICAR.md, SIMCO-FRONTEND.md]

TAREA:
  - docs/{wireframe-mockup}.md
  - DTOs del backend relacionados
  - Componentes similares existentes
  - Hooks similares existentes
```

### Orquestador (Tech-Leader)

```yaml
CORE (siempre):
  - principios/*.md (6, incluyendo CAPVED y Tokens)
  - PERFIL-ORQUESTADOR.md
  - ALIASES.yml

PROYECTO (siempre):
  - CONTEXTO-PROYECTO.md
  - PROXIMA-ACCION.md
  - MASTER_INVENTORY.yml (vision completa)

OPERACION (segun tarea):
  planificar: [SIMCO-BUSCAR.md, SIMCO-DELEGACION.md]
  delegar: [SIMCO-DELEGACION.md, @TPL_HERENCIA_CTX]
  validar: [SIMCO-VALIDAR.md]
  coordinar: [SIMCO-DELEGACION.md]

TAREA:
  - docs/ completo del proyecto
  - Estado de todas las capas
  - Dependencias entre tareas
```

---

## CHECKLIST DE INICIALIZACION

```markdown
## CHECKLIST CCA - {PERFIL} en {PROYECTO}

### Fase 1: Core
- [ ] Lei PRINCIPIO-CAPVED.md (Ciclo de vida)
- [ ] Lei PRINCIPIO-DOC-PRIMERO.md
- [ ] Lei PRINCIPIO-ANTI-DUPLICACION.md
- [ ] Lei PRINCIPIO-VALIDACION-OBLIGATORIA.md
- [ ] Lei PRINCIPIO-ECONOMIA-TOKENS.md (Desglose tareas)
- [ ] Lei PRINCIPIO-NO-ASUMIR.md
- [ ] Lei mi PERFIL-{TIPO}.md
- [ ] Lei _INDEX.md de SIMCO
- [ ] Lei ALIASES.yml

### Fase 2: Proyecto
- [ ] Lei CONTEXTO-PROYECTO.md
- [ ] Lei PROXIMA-ACCION.md
- [ ] Lei inventario relevante

### Fase 3: Operacion
- [ ] Identifique si es HU → Lei SIMCO-TAREA.md
- [ ] Identifique operacion: {CREAR|MODIFICAR|VALIDAR|...}
- [ ] Lei SIMCO-{operacion}.md
- [ ] Lei SIMCO-{dominio}.md (si aplica)

### Fase 4: Tarea
- [ ] Consulte docs/ relevante
- [ ] Busque patrones existentes
- [ ] Identifique dependencias

### READY TO EXECUTE
- [ ] Tengo TODO el contexto necesario
- [ ] Se que debo hacer
- [ ] Se que NO debo hacer
- [ ] Se que delegar si es necesario
```

---

## REPORTE DE CONTEXTO CARGADO

Al completar CCA, generar reporte interno:

```yaml
REPORTE_CONTEXTO_CARGADO:
  agente: "{PERFIL}"
  proyecto: "{PROYECTO}"
  tarea: "{DESCRIPCION}"

  contexto_core:
    principios: [capved, doc-primero, anti-dup, validacion, tokens, no-asumir]
    perfil: "PERFIL-{TIPO}.md"
    simco_index: true
    aliases: true

  contexto_proyecto:
    contexto_proyecto: true
    proxima_accion: true
    inventarios: ["{inventarios_leidos}"]

  contexto_operacion:
    operacion: "{CREAR|MODIFICAR|...}"
    simco_operacion: "SIMCO-{op}.md"
    simco_dominio: "SIMCO-{dom}.md"

  contexto_tarea:
    docs_consultados: ["{lista}"]
    patrones_encontrados: ["{lista}"]
    dependencias_identificadas: ["{lista}"]

  estado: "READY_TO_EXECUTE"

  restricciones:
    no_hacer: ["{lista de lo que NO debo hacer}"]
    delegar_a: ["{agentes para delegar}"]

  validaciones_requeridas:
    - "{validacion 1}"
    - "{validacion 2}"
```

---

## ANTI-PATRONES (QUE NO HACER)

```yaml
NUNCA:
  - Empezar a codificar sin completar CCA
  - Asumir que algo existe sin verificar inventario
  - Crear sin consultar docs/ primero
  - Ignorar principios porque "es una tarea simple"
  - Saltarse validaciones "para ir mas rapido"
  - Modificar sin analizar impacto
  - Continuar tras compactacion sin ejecutar recovery

ERRORES_COMUNES:
  - "Ya se como hacerlo" → Verificar docs/ de todas formas
  - "Es igual al otro modulo" → Verificar diferencias en specs
  - "Despues documento" → Documentar durante, no despues
  - "El build puede fallar temporalmente" → NUNCA dejar build roto
  - "El contexto esta bien" → Verificar si hubo compactacion
```

---

## TIEMPO ESTIMADO

| Fase | Tiempo | Archivos |
|------|--------|----------|
| Core | ~5 min | 8 archivos |
| Proyecto | ~5 min | 3-4 archivos |
| Operacion | ~3 min | 1-2 archivos |
| Tarea | ~5 min | Variable |
| **TOTAL CCA** | **~18 min** | **~15 archivos** |
| Recovery Critico | ~2 min | ~3 archivos |
| Recovery Completo | ~6 min | ~7 archivos |

> **INVERSION:** 18 minutos de lectura inicial, 6 minutos max de recovery
> **RETORNO:** Cero alucinaciones, cero retrabajos, codigo correcto desde el inicio

---

## INTEGRACION CON SUBAGENTES

Cuando delegas a un subagente, este DEBE ejecutar CCA tambien.
Ver: `SIMCO-DELEGACION.md` para template de delegacion con contexto heredado.
Ver: `@TPL_HERENCIA_CTX` para formato de herencia de contexto.

### CCA para Subagentes (Version Ligera)

Si estas operando como **subagente** (recibiste delegacion de un orquestador):

```yaml
NO_EJECUTAR:
  - CCA completo (4 fases)
  - Perfil completo (~800 tokens)
  - CONTEXTO-PROYECTO.md (ya heredado)

SI_EJECUTAR:
  - SIMCO-CCA-SUBAGENTE.md (CCA ligero, 2 fases)
  - PERFIL-*-COMPACT.md (~250 tokens)
  - 1 SIMCO de operacion

RESULTADO:
  - ~1,500 tokens vs ~10,000 tokens
  - ~5 min vs ~18 min
```

Ver: `SIMCO-SUBAGENTE.md` para protocolo completo de subagentes.
Ver: `SIMCO-CCA-SUBAGENTE.md` para CCA ligero.
Ver: `agents/perfiles/compact/` para perfiles compactos.

---

## MODO GCA: GESTION DE CONTEXTO ACTIVA (Recomendado)

> **GCA es una alternativa optimizada al CCA completo que reduce tokens base de ~10,000 a ~4,500.**
> **Usar GCA por defecto. Usar CCA completo solo si GCA no es suficiente.**

### Cuando Usar GCA vs CCA

| Escenario | Usar |
|-----------|------|
| Sesion normal | GCA |
| Tareas multiples en secuencia | GCA |
| Sesiones largas (>1 hora) | GCA |
| Subagentes | GCA (herencia) |
| Tarea muy compleja que requiere todo el contexto | CCA completo |
| GCA falla o es insuficiente | CCA como fallback |

### Protocolo CCA-GCA (2 Capas Iniciales)

```yaml
FASE_GCA_1_INMUTABLE: # ~3000 tokens
  cargar:
    - "agents/perfiles/compact/PERFIL-{TIPO}-COMPACT.md" (~250 tokens)
    - "_internal/PRINCIPIOS-RESUMEN.md" (~300 tokens)
    - "referencias/ALIASES-RESOLVED.yml" (~350 tokens)
    - "{proyecto}/CONTEXTO-PROYECTO.md" (solo variables, ~500 tokens)
  resultado: "Identidad y principios establecidos"

FASE_GCA_2_REFERENCIAS: # ~1500 tokens
  cargar:
    - "_internal/MAPA-DIRECTIVAS.yml" (~400 tokens)
    - "_internal/MAPA-INVENTARIOS.yml" (~300 tokens)
  resultado: "Mapas de navegacion disponibles"

FASE_GCA_3_TRAZA: # 0 tokens (disco)
  crear: "{proyecto}/orchestration/trazas/SESSION-TRACE-{fecha}.yml"
  resultado: "Memoria externa inicializada"

TOTAL_GCA: ~4,500 tokens (vs ~10,000 CCA)
```

### Carga Bajo Demanda (Capa 2 de GCA)

```yaml
AL_RECIBIR_TAREA:
  1. Consultar MAPA-DIRECTIVAS.yml → identificar SIMCO necesario
  2. Cargar SOLO ese SIMCO (~800 tokens)
  3. Si necesito inventario → cargar extracto relevante
  4. Registrar en tracking: {path, tokens, timestamp}

AL_COMPLETAR_TAREA:
  1. Registrar resultado en SESSION-TRACE
  2. Purgar contexto de tarea (spec, codigo referencia)
  3. Mantener SIMCO si siguiente tarea es mismo dominio
```

### Referencia Completa

Ver `SIMCO-CONTEXT-MANAGEMENT.md` para documentacion completa de GCA.
Ver `CONTEXT-LAYER-MAP.yml` para definicion de las 4 capas.

---

## REFERENCIAS DE CONTEXT ENGINEERING

| Documento | Alias | Proposito |
|-----------|-------|-----------|
| SIMCO-CONTEXT-MANAGEMENT.md | @GCA | Gestion de Contexto Activa (recomendado) |
| CONTEXT-LAYER-MAP.yml | @GCA_LAYERS | Definicion de 4 capas GCA |
| SIMCO-CONTEXT-ENGINEERING.md | @CONTEXT_ENGINEERING | Principios de ingenieria de contexto |
| TEMPLATE-RECOVERY-CONTEXT.md | @TPL_RECOVERY_CTX | Template detallado de recovery |
| TEMPLATE-HERENCIA-CONTEXTO.md | @TPL_HERENCIA_CTX | Herencia de contexto a subagentes |
| PRINCIPIO-CAPVED.md | @CAPVED | Ciclo de vida de tareas |
| PRINCIPIO-ECONOMIA-TOKENS.md | @ECONOMIA | Principio de economia de tokens |
| SIMCO-QUICK-REFERENCE.md | @QUICK_REF | Referencia rapida optimizada |

---

**Version:** 1.5.0 | **Sistema:** SIMCO + CAPVED + Context Engineering + GCA | **Tipo:** Directiva de Inicializacion
