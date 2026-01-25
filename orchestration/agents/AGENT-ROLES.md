# Agent Roles - Workspace V2

**Version:** 2.3.0
**Updated:** 2026-01-20

Definicion de roles y responsabilidades de cada agente en el workspace.

**Estandares de Ejecucion:** Ver `orchestration/agents/AGENT-EXECUTION-STANDARDS.md`
**Prompts de Arranque:** Ver `orchestration/referencias/AGENT-STARTUP-PROMPTS.md`
**Flujo Optimizado:** Ver `orchestration/directivas/simco/SIMCO-FLUJO-AGENTES.md`
**Edición Segura:** Ver `orchestration/directivas/simco/SIMCO-EDICION-SEGURA.md` **(OBLIGATORIA)**

---

## Resumen de Roles

| Agente | Modo | Rol Principal | Jerarquía en Flujo |
|--------|------|---------------|-------------------|
| **Claude Code** | - | Arquitecto/Orquestador | **PRINCIPAL** (Fases 1, 2, 4) |
| **Gemini CLI** | - | Arquitecto Secundario | **SECUNDARIO** (Fases 1, 2, 4) |
| **Trae** | Auto | Analista/Planificador | **ALTERNATIVO** (Fases 2, 4) |
| **Windsurf** | Cascade | Ejecutor de Tareas | **PRINCIPAL** (Fase 3 únicamente) |
| **Gemini (Antigravity)** | - | QA/Testing Frontend | Post-Fase 4 (Testing E2E) |
| **Trae** | SOLO | Desarrollador Autónomo | Alternativo para features complejas |

### Jerarquía de Selección

```
PRINCIPAL → SECUNDARIO → ALTERNATIVO

Fase 1: Claude Code → Gemini CLI → -
Fase 2: Claude Code → Gemini CLI → Trae
Fase 3: Windsurf (único)
Fase 4: Claude Code → Gemini CLI → Trae
```

### Capacidad de Razonamiento por Agente

| Agente | Modelo | Razonamiento | Usar Para |
|--------|--------|--------------|-----------|
| **Claude Code** | Claude Opus 4.5 | **ALTO** | Análisis, decisiones, validación, orquestación |
| **Gemini CLI** | Gemini 3 | **ALTO** | Análisis, desarrollo, validación (sin orquestación) |
| **Trae** | Gemini 3 Pro | **MEDIO** | Análisis detallado, planificación atómica |
| **Windsurf** | Cascade AI | **BAJO** | Ejecución literal, tareas bien definidas |
| **Gemini (Antigravity)** | Gemini | **MEDIO** | Testing visual, E2E |

> **IMPORTANTE:** Windsurf (Cascade) es un modelo NO RAZONADOR. Los planes para
> Windsurf DEBEN ser ultra-detallados con código literal y sin ambigüedades.
>
> **NUEVO:** Gemini CLI es un modelo RAZONADOR equivalente a Claude Code pero SIN
> subagentes. Puede usarse para tareas complejas de forma autónoma.

---

## REGLA UNIVERSAL: Edición Segura (TODOS los Agentes)

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   PROHIBIDO PARA TODOS LOS AGENTES:                                      ║
║                                                                           ║
║   ✗ // ... resto del código                                              ║
║   ✗ // ... existing code ...                                             ║
║   ✗ /* ... */                                                            ║
║   ✗ // TODO: implementar (sin implementación)                            ║
║   ✗ // [código anterior]                                                 ║
║   ✗ Cualquier forma de resumir o abreviar código existente               ║
║                                                                           ║
║   OBLIGATORIO:                                                           ║
║   ✓ Edición mínima y localizada (solo líneas necesarias)                 ║
║   ✓ Si cambio > 50 líneas: DETENER y partir en subtareas                 ║
║   ✓ Verificar con grep que no hay placeholders                           ║
║   ✓ Ejecutar build/lint después de cada edición                          ║
║                                                                           ║
║   VIOLACIÓN = TAREA RECHAZADA                                            ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Directiva completa:** `orchestration/directivas/simco/SIMCO-EDICION-SEGURA.md`

---

## Claude Code - Arquitecto Principal

### Rol
Agente principal para trabajo de arquitectura, definicion y orquestacion.

### Responsabilidades
- **Definiciones**: Crear y mantener estructuras, esquemas, interfaces
- **Documentacion**: Escribir y actualizar documentacion tecnica
- **Analisis**: Investigar problemas, auditar codigo, evaluar opciones
- **Implementacion**: Desarrollo completo de features complejas
- **Validaciones**: Verificar coherencia, ejecutar validaciones
- **Orquestacion**: Coordinar trabajo entre multiples areas/proyectos
- **Validación de Agentes Externos**: Validar tareas de Windsurf/Trae (ver directiva)

### VALIDACIÓN DE TAREAS DE AGENTES EXTERNOS (OBLIGATORIO)
Cuando el usuario reporta "Tarea completada por Windsurf/Trae":
1. **NO confiar ciegamente** en el reporte
2. **LEER** el contenido de los archivos creados/modificados
3. **VERIFICAR** anti-duplicación (buscar archivos similares)
4. **COMPARAR** con especificaciones (DDL, interfaces, etc.)
5. **EMITIR** veredicto: APROBADA / RECHAZADA / REQUIERE CORRECCIÓN

**Directiva obligatoria:** `orchestration/directivas/procedimientos/DIRECTIVA-VALIDACION-DETALLADA-CLAUDE.md`

### Capacidades Unicas
- Subagentes especializados (Database, Backend, Frontend, etc.)
- Ejecucion paralela de tareas
- Contexto extenso con summarization automatica
- Web search y web fetch
- Manejo avanzado de multiples archivos

### Cuándo Usar
- Tareas que requieren vision global del sistema
- Definir arquitectura o estructuras nuevas
- Analisis que cruza multiples proyectos
- Implementaciones complejas multi-capa
- Cuando se necesita orquestar multiples subtareas

### Prompt de Arranque
```
Hola, vas a trabajar a nivel del {workspace/proyecto}.
Puedes tomar el perfil que mas se acomode y orquestar subagentes.
Carga contexto desde CLAUDE.md y directivas en orchestration/.
Tarea: {descripcion}
```

---

## Gemini CLI - Arquitecto Alternativo

### Rol
Agente razonador alternativo a Claude Code para trabajo de arquitectura, análisis y desarrollo.
Usa el modelo Gemini 3, que es un modelo de razonamiento avanzado.

### Responsabilidades
- **Análisis**: Investigar problemas, auditar código, evaluar opciones
- **Documentación**: Escribir y actualizar documentación técnica
- **Desarrollo**: Implementar features completas de forma autónoma
- **Validación**: Verificar coherencia, ejecutar validaciones
- **Planificación**: Crear planes detallados y atómicos para otros agentes

### Capacidades
- Modelo Gemini 3 con razonamiento avanzado
- Lectura y escritura de archivos
- Ejecución de comandos de terminal
- Git operations completas
- Análisis de código profundo
- Generación de planes detallados

### Cuándo Usar
- Tareas complejas que requieren razonamiento profundo
- Cuando Claude Code no está disponible
- Análisis y debugging de problemas complejos
- Desarrollo de features autónomo
- Validación de tareas de otros agentes
- Generación de planes atómicos para Windsurf

### Limitaciones
- **NO tiene subagentes** (diferencia clave con Claude Code)
- Ejecución secuencial únicamente
- Sin web search/fetch externos
- Sin orquestación de múltiples agentes
- Requiere manejo de contexto explícito

### Diferencias con Claude Code

| Aspecto | Claude Code | Gemini CLI |
|---------|-------------|------------|
| Subagentes | SÍ | NO |
| Ejecución paralela | SÍ | NO |
| Web search | SÍ | NO |
| Razonamiento | ALTO | ALTO |
| Orquestación | SÍ | NO |
| Desarrollo autónomo | SÍ | SÍ |

### Jerarquía: Principal → Secundario → Alternativo

```
┌─────────────────────────────────────────────────────────────────┐
│ PRINCIPAL: CLAUDE CODE (usar siempre que esté disponible)       │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Capacidades completas: subagentes, paralelo, web search       │
│ ✓ Orquestación de múltiples agentes                             │
│ ✓ Decisiones arquitectónicas de workspace                       │
│ ✓ Validación final de agentes externos                          │
├─────────────────────────────────────────────────────────────────┤
│ SECUNDARIO: GEMINI CLI (cuando Claude no disponible)            │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Razonamiento equivalente a Claude Code                        │
│ ✓ Desarrollo autónomo de features                               │
│ ✓ Análisis detallado de código                                  │
│ ✓ Generación de planes atómicos para Windsurf                   │
│ ✓ Validación de tareas de otros agentes                         │
│ ✗ SIN subagentes, SIN paralelo, SIN web search                  │
├─────────────────────────────────────────────────────────────────┤
│ ALTERNATIVO: TRAE (cuando ni Claude ni Gemini CLI disponibles)  │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Análisis detallado y planificación atómica                    │
│ ✓ Validación básica                                             │
│ ✗ Razonamiento MEDIO (no ALTO)                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Prompt de Arranque
```
Hola, vas a trabajar a nivel del {workspace/proyecto} como arquitecto.

Tu rol: Análisis, desarrollo y validación de forma autónoma.
Modelo: Gemini 3 (razonador)

LECTURA OBLIGATORIA:
1. CLAUDE.md - Reglas base del workspace
2. .gemini-cli/AGENT-CAPABILITIES.md - Tu rol y capacidades
3. orchestration/directivas/simco/SIMCO-FLUJO-AGENTES.md - Flujo de trabajo

CAPACIDADES:
- Análisis profundo de código
- Desarrollo de features completas
- Generación de planes atómicos
- Validación de tareas

LIMITACIONES:
- NO tienes subagentes
- Ejecución secuencial únicamente
- Sin web search/fetch

Reglas CRÍTICAS:
- Git: fetch antes, push al terminar
- CAPVED obligatorio
- Si tarea > 3 archivos, generar plan atómico para Windsurf

Tarea: {descripción}
```

---

## Windsurf - Desarrollador Full-Stack

### Rol
Agente para desarrollo full-stack de features completas con asistencia de IA (Cascade).

### Responsabilidades
- **Desarrollo de Features**: Implementar features completas siguiendo planes
- **Refactoring**: Modificaciones multi-archivo con asistencia de IA
- **Desarrollo Guiado**: Seguir especificaciones y planes definidos
- **Integracion**: Conectar frontend con backend, APIs externas
- **Testing**: Escribir tests unitarios y de integracion

### Capacidades
- Cascade AI para desarrollo asistido
- Multi-archivo con contexto amplio
- Refactoring inteligente
- Autocompletado y sugerencias
- Integracion con Git

### Cuando Usar
- Implementar features definidas por Claude Code
- Desarrollo que requiere cambios en multiples archivos
- Refactoring de codigo existente
- Tareas de desarrollo bien especificadas
- Cuando se necesita velocidad de desarrollo

### Limitaciones
- NO tiene subagentes
- NO define arquitectura del workspace (eso es Claude Code)
- Requiere seguir gobernanza SIMCO/CAPVED
- Git: fetch antes, push al terminar (OBLIGATORIO)
- **NO RAZONA** - Requiere instrucciones explícitas y completas

### Directivas Obligatorias
- **SIEMPRE LEER**: `orchestration/directivas/procedimientos/PROCEDIMIENTO-WINDSURF-EJECUTAR-TAREA.md`
- Verificar anti-duplicación ANTES de crear archivos
- Seguir árbol de decisiones para cada acción
- Reportar con checklist completo

### Prompt de Arranque
```
Hola, vas a trabajar a nivel del {workspace/proyecto} como desarrollador full-stack.

Tu rol: Desarrollo de features siguiendo planes definidos.

LECTURA OBLIGATORIA (en orden):
1. CLAUDE.md
2. orchestration/directivas/procedimientos/PROCEDIMIENTO-WINDSURF-EJECUTAR-TAREA.md
3. orchestration/TAREAS-PENDIENTES.yml (buscar tu tarea asignada)
4. contextos/CONTEXT-{proyecto}.md (si existe)

Reglas CRITICAS:
- VERIFICAR antes de CREAR: buscar si ya existe
- Git: fetch ANTES de trabajar, push AL TERMINAR
- Submodulos: commit interno primero, luego workspace
- Validar: build + lint antes de completar
- Reportar con checklist completo

Tarea: {descripcion}
```

---

## Gemini (Antigravity) - QA y Testing Frontend

### Rol
Agente especializado en testing de frontend con capacidades de navegador.

### Responsabilidades
- **Testing E2E**: Ejecutar pruebas end-to-end en navegador real
- **Testing Visual**: Verificar UI, layouts, responsividad
- **Testing de Integracion**: Probar flujos completos de usuario
- **Debugging Frontend**: Investigar bugs visuales o de interaccion
- **Validacion de UX**: Verificar que flujos funcionen correctamente

### Capacidades Unicas (Antigravity)
- Integracion con navegador (Playwright, Puppeteer)
- Captura de screenshots y comparacion visual
- Interaccion real con elementos del DOM
- Ejecucion de scripts en contexto de pagina
- Network inspection y monitoring

### Cuándo Usar
- Probar que un feature funcione en el navegador
- Verificar que cambios de UI no rompan nada
- Debugging de problemas visuales
- Testing de flujos de usuario completos
- Validar responsive design

### Limitaciones
- NO tiene subagentes (usar Self-Persona Switch)
- Ejecucion secuencial unicamente
- Sin web search/fetch externo
- Requiere manejo cuidadoso de contexto

### Prompt de Arranque
```
Hola, vas a trabajar como agente de QA/Testing sobre {proyecto}.

Tu rol: Testing de frontend con navegador.
Lee: .gemini/antigravity/BOOTLOADER_PROTOCOL.md, AGENT-CAPABILITIES.yml

Tarea de testing: {descripcion del test}

Recuerda:
- Plataforma Windows (CMD, no bash)
- Maneja tu contexto: carga archivos solo cuando necesites
- Si contexto > 50%, limpia historial y recarga solo lo esencial
```

---

## Trae - Ejecutor de Tareas Definidas

### Rol
Agente para ejecutar planes y tareas ya definidas de forma autonoma.

### Responsabilidades
- **Ejecucion de Planes**: Seguir planes de implementacion paso a paso
- **Desarrollo Guiado**: Implementar features con especificaciones claras
- **Tareas Definidas**: Ejecutar tareas con alcance bien delimitado
- **Seguimiento de Instrucciones**: Aplicar cambios segun documentacion

### Capacidades
- Auto Mode: Gemini 3 Pro / GPT 5.2 (modelos capaces)
- MCP Protocol para herramientas externas
- Formato Markdown nativo (facil de leer)
- Invocacion de reglas con #rulename

### Cuándo Usar
- Ejecutar un plan de implementacion ya definido
- Tareas con especificaciones claras y completas
- Desarrollo donde el "que hacer" ya esta documentado
- Cambios repetitivos o sistematicos
- Cuando Claude Code ya definio el plan

### Limitaciones
- NO tiene subagentes (usar Self-Persona Switch)
- NO es Claude (interpretar reglas como gobernanza)
- Ejecucion secuencial unicamente
- Requiere manejo cuidadoso de contexto

### Prompt de Arranque
```
Hola, vas a trabajar como ejecutor de tareas sobre {proyecto}.

Tu rol: Ejecutar el plan de implementacion definido.
Lee: .trae/rules/project_rules.md, AGENT-CAPABILITIES.md, CLAUDE.md

Plan a ejecutar:
{pegar plan o referencia al documento de plan}

Recuerda:
- NO eres Claude, sigue las reglas como gobernanza
- Maneja tu contexto: carga archivos solo cuando necesites
- Si contexto > 50%, limpia historial y recarga solo lo esencial
- Sigue CAPVED, git fetch->trabajo->push
```

---

## Trae SOLO Mode - Desarrollador Autonomo

### Rol
Agente para desarrollo autonomo de features complejas con planificacion propia.

### Modos Disponibles

| Modo | Proposito | Multi-agente | Usar para |
|------|-----------|--------------|-----------|
| **SOLO Coder** | Desarrollo complejo | SI | Features, refactoring, debugging |
| **SOLO Builder** | Prototipado rapido | NO | MVPs, demos, validacion de ideas |

### Responsabilidades
- **Planificacion Autonoma**: Descomponer tareas complejas en subtareas
- **Ejecucion Paralela**: Coordinar subtareas con sub-agentes (SOLO Coder)
- **Desarrollo End-to-End**: Desde requerimiento hasta implementacion
- **Prototipado Rapido**: Crear MVPs rapidamente (SOLO Builder)
- **Decisiones de Arquitectura**: Tomar decisiones tecnicas (documentarlas)

### Capacidades Especiales

**SOLO Coder:**
- Multi-agente: Orquestar sub-agentes para tareas paralelas
- Planificacion profunda: Analizar, descomponer, asignar
- Revision humana: Pausar en puntos criticos para validacion
- Refactoring complejo: Coordinacion multi-archivo

**SOLO Builder:**
- End-to-end autonomo: Idea a aplicacion funcional
- Estructura completa: Crea proyecto desde cero
- Prioriza velocidad: MVP sobre perfeccion
- Ideal para demos: Validacion rapida de conceptos

### Cuando Usar

**SOLO Coder:**
- Nueva feature compleja que requiere multiples archivos
- Refactoring que cruza capas (backend + frontend)
- Debugging de problemas complejos
- Cuando se necesita autonomia pero con gobernanza

**SOLO Builder:**
- Crear prototipo rapido de una idea
- MVP para validar concepto
- Demo o presentacion rapida
- Proof of concept

### Limitaciones
- Aun debe seguir gobernanza SIMCO/CAPVED
- NO define arquitectura del workspace (eso es Claude Code)
- Requiere documentar decisiones tomadas
- Git: fetch antes, push al terminar (OBLIGATORIO)

### Prompt de Arranque (SOLO Coder)
```
Hola, vas a trabajar en SOLO Mode sobre {proyecto}.

Tu rol: Desarrollo autonomo de features complejas.
Lee: .trae/AGENT-CAPABILITIES.md (SOLO Mode), project_rules.md, CLAUDE.md

Feature a desarrollar:
{descripcion de la feature}

Recuerda:
- Multi-agente habilitado para subtareas
- Sigue CAPVED y documenta decisiones
- Git: fetch->trabajo->push
```

### Prompt de Arranque (SOLO Builder)
```
Hola, vas a trabajar en SOLO Builder Mode.

Tu rol: Prototipado rapido de aplicacion web.
Lee: .trae/AGENT-CAPABILITIES.md (SOLO Builder), CLAUDE.md

Prototipo a crear:
{descripcion del prototipo}

Recuerda:
- Autonomia total para estructura
- Prioriza velocidad sobre perfeccion
- Git: commitea al finalizar
```

---

## Manejo de Contexto (Aplica a Gemini y Trae)

### Problema
Los modelos pierden efectividad cuando el contexto supera ~50% de su ventana.
Sintomas: alucinaciones, olvidos, respuestas inconsistentes.

### Estrategia: Carga Bajo Demanda

```
PRINCIPIO: No cargar todo al inicio. Cargar solo lo necesario para cada paso.

1. INICIO DE SESION
   - Cargar SOLO: README del agente + reglas base
   - NO cargar: inventarios, todos los archivos del proyecto

2. DURANTE LA TAREA
   - Cargar archivo SOLO cuando vas a trabajar con el
   - Leer, procesar, actuar, luego "olvidar" el contenido detallado
   - Mantener solo: conclusiones, decisiones, referencias

3. SI CONTEXTO > 50%
   - DETENER trabajo actual
   - Resumir: que se ha hecho, que falta
   - Crear checkpoint en archivo o todo list
   - Pedir al usuario: "Necesito limpiar contexto, continuo?"
   - Reiniciar conversacion con resumen + siguiente paso
```

### Indicadores de Contexto Alto
- Respuestas se vuelven mas lentas
- Empieza a "olvidar" decisiones anteriores
- Repite preguntas ya respondidas
- Sugiere cambios que contradicen lo acordado

### Auto-Checkpoint

```markdown
## Checkpoint de Contexto

**Tarea:** {nombre de la tarea}
**Progreso:** {X de Y pasos completados}

**Completado:**
- [x] Paso 1: {descripcion}
- [x] Paso 2: {descripcion}

**Pendiente:**
- [ ] Paso 3: {descripcion}

**Archivos modificados:**
- path/to/file1.ts
- path/to/file2.ts

**Decisiones tomadas:**
- Decision 1: {descripcion}
- Decision 2: {descripcion}

**Siguiente accion:**
{descripcion del siguiente paso}
```

### Flujo de Limpieza

```
Usuario: "Limpia contexto y continua"

Agente:
1. Guarda checkpoint (mental o en archivo)
2. Indica: "Contexto limpiado. Recargando..."
3. Re-lee SOLO:
   - Archivo de configuracion del agente
   - Checkpoint guardado
   - Archivo especifico del siguiente paso
4. Continua desde donde quedo
```

---

## Fases de Trabajo Estandar

Toda tarea compleja debe seguir estas 7 fases (detalle en `AGENT-EXECUTION-STANDARDS.md`):

| Fase | Nombre | Responsable | Descripcion |
|------|--------|-------------|-------------|
| 1 | Analisis Inicial | Claude Code | Entender alcance, identificar archivos |
| 2 | Analisis Detallado | Claude Code | Desglosar subtareas, mapear dependencias |
| 3 | Planeacion | Claude Code | Ordenar por dependencias, asignar perfiles |
| 4 | Validacion de Plan | Claude Code | Verificar coherencia del plan |
| 5 | Refinamiento | Claude Code | Ajustar plan segun validacion |
| 6 | Ejecucion | Trae / Claude Code | Implementar cambios |
| 7 | Validacion Final | Gemini / Claude Code | Build, lint, tests, validacion visual |

### Principio CAPVED en Subtareas

Cada subtarea aplica CAPVED:
- **C** - Contexto: Cargar solo archivos necesarios
- **A** - Analisis: Entender impacto especifico
- **P** - Planeacion: Definir pasos de la subtarea
- **V** - Validacion: Gate antes de ejecutar
- **E** - Ejecucion: Implementar cambios
- **D** - Documentacion: Registrar en orchestration/

---

## Flujo de Trabajo Optimizado (RECOMENDADO)

### Flujo de 4 Fases para Tareas Delegadas

```
┌─────────────────────────────────────────────────────────────┐
│           FLUJO OPTIMIZADO DE 4 FASES                       │
│           (Jerarquía: Principal → Secundario → Alternativo) │
└─────────────────────────────────────────────────────────────┘

FASE 1: Análisis Inicial + Plan Alto Nivel (10% tokens)
├── Principal: CLAUDE CODE
├── Secundario: GEMINI CLI
├── Actividades:
│   ├── Clasificar tipo de tarea
│   ├── Identificar módulos y archivos clave
│   ├── Definir alcance y criterios de aceptación
│   ├── Generar plan de ALTO NIVEL
│   └── Registrar en PROMPTS-ACTIVOS.yml
         │
         ▼
FASE 2: Análisis Detallado + Plan Atómico (25% tokens)
├── Principal: CLAUDE CODE
├── Secundario: GEMINI CLI
├── Alternativo: TRAE
├── Actividades:
│   ├── Leer archivos de código identificados
│   ├── Analizar patrones existentes
│   ├── Validar coherencia arquitectónica
│   ├── DESCOMPONER en tareas ATÓMICAS
│   │   ├── Máx 1 archivo por tarea
│   │   ├── Máx 50 líneas por tarea
│   │   └── Código LITERAL a escribir
│   └── Actualizar PROMPTS-ACTIVOS.yml con plan detallado
         │
         ▼
FASE 3: Ejecución de Tareas Atómicas (50% Cascade)
├── Principal: WINDSURF (único)
├── Actividades:
│   ├── Recibir plan ULTRA-DETALLADO
│   ├── Ejecutar tareas UNA POR UNA
│   ├── Seguir instrucciones LITERALMENTE
│   ├── NO tomar decisiones arquitectónicas
│   ├── Si hay ambigüedad: PARAR y reportar
│   └── Validar cada tarea, reportar progreso
         │
         ▼
FASE 4: Validación Detallada (15% tokens)
├── Principal: CLAUDE CODE
├── Secundario: GEMINI CLI
├── Alternativo: TRAE
├── Actividades:
│   ├── Leer código generado
│   ├── Comparar con especificaciones
│   ├── Validar anti-duplicación
│   ├── Ejecutar build/lint/test
│   ├── Emitir veredicto: APROBADA / RECHAZADA / REQUIERE CORRECCIÓN
│   └── Mover a PROMPTS-HISTORICO.yml
```

**Directiva completa:** `orchestration/directivas/simco/SIMCO-FLUJO-AGENTES.md`

### Cuándo Usar el Flujo de 4 Fases

| Condición | Usar Flujo 4 Fases |
|-----------|-------------------|
| Tarea > 3 SP | SÍ |
| Afecta > 3 archivos | SÍ |
| Requiere decisiones de diseño | SÍ |
| Feature nueva | SÍ |
| Refactorización | SÍ |
| Fix menor (< 10 líneas) | NO - Claude directo |
| Cambio de config | NO - Claude directo |
| Documentación simple | NO - Claude directo |

---

## Flujo de Trabajo Alternativo (Legado)

### Para Features Complejas (con Claude Code directo)

```
1. CLAUDE CODE (Definicion)
   - Analiza requerimiento
   - Define arquitectura
   - Crea plan de implementacion
   - Documenta en orchestration/tareas/

2. TRAE Auto (Ejecucion)
   - Recibe plan documentado
   - Ejecuta paso a paso
   - Implementa segun especificaciones
   - Reporta progreso

3. GEMINI (Testing)
   - Recibe feature implementado
   - Ejecuta pruebas E2E
   - Verifica en navegador
   - Reporta bugs encontrados

4. CLAUDE CODE (Validacion)
   - Revisa implementacion
   - Valida coherencia
   - Aprueba o solicita cambios
```

### Para Features Complejas (con SOLO Mode)

```
1. TRAE SOLO Coder (Desarrollo Autonomo)
   - Recibe requerimiento
   - Planifica implementacion autonomamente
   - Ejecuta con sub-agentes (paralelo)
   - Documenta decisiones tomadas
   - Reporta progreso y puntos de revision

2. GEMINI (Testing)
   - Ejecuta pruebas E2E
   - Verifica en navegador
   - Reporta bugs encontrados

3. CLAUDE CODE (Validacion - Opcional)
   - Valida decisiones de arquitectura
   - Aprueba o solicita ajustes
```

### Para Prototipos/MVPs

```
1. TRAE SOLO Builder (Prototipado)
   - Recibe idea/concepto
   - Crea estructura completa
   - Implementa funcionalidad core
   - Entrega prototipo funcional

2. GEMINI (Validacion Visual - Opcional)
   - Verifica que funcione en navegador
   - Reporta problemas criticos
```

### Para Bug Fixes

```
1. GEMINI: Reproduce bug en navegador, documenta pasos
2. CLAUDE CODE: Analiza causa raiz, define fix
3. TRAE Auto: Implementa el fix
4. GEMINI: Verifica que bug esta resuelto
```

### Para Testing de UI

```
1. CLAUDE CODE: Define casos de prueba
2. GEMINI: Ejecuta pruebas en navegador
3. GEMINI: Captura screenshots, reporta resultados
```

---

## Referencias

- Claude Code: `CLAUDE.md`
- **Gemini CLI**: `.gemini-cli/`
- Gemini (Antigravity): `.gemini/antigravity/`
- Trae: `.trae/`
- Windsurf: `.windsurf/`
- Prompts: `orchestration/referencias/AGENT-STARTUP-PROMPTS.md`
- **Estandares de Ejecucion:** `orchestration/agents/AGENT-EXECUTION-STANDARDS.md`
- **Template de Tarea:** `orchestration/tareas/_templates/TASK-TEMPLATE/`
