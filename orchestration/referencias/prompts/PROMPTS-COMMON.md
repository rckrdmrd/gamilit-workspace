# Prompts Comunes - Introduccion y Flujo

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Segmentado desde:** AGENT-STARTUP-PROMPTS.md v3.4.0

---

## Resumen de Roles y Fases

| Agente | Rol | Jerarquia | Razonamiento |
|--------|-----|-----------|--------------|
| **Claude Code** | Arquitecto/Orquestador | **PRINCIPAL** (F1, F2, F4) | ALTO |
| **Gemini CLI** | Arquitecto Secundario | **SECUNDARIO** (F1, F2, F4) | ALTO |
| **Trae (Auto)** | Analista/Planificador | **ALTERNATIVO** (F2, F4) | MEDIO |
| **Windsurf** | Ejecutor de Tareas | **PRINCIPAL** (F3 unico) | BAJO (no-razonador) |
| **Gemini (Antigravity)** | QA/Testing Frontend | Post-validacion | MEDIO |
| **Trae (SOLO)** | Desarrollador Autonomo | Alternativo completo | MEDIO |

---

## Jerarquia de Seleccion por Fase

```
PRINCIPAL → SECUNDARIO → ALTERNATIVO

Fase 1 (Analisis):     Claude Code → Gemini CLI → -
Fase 2 (Plan Atomico): Claude Code → Gemini CLI → Trae
Fase 3 (Ejecucion):    Windsurf (unico)
Fase 4 (Validacion):   Claude Code → Gemini CLI → Trae
```

> **NOTA:** Gemini CLI es el agente SECUNDARIO que sustituye a Claude Code cuando
> no esta disponible. Es RAZONADOR pero SIN subagentes ni web search.

---

## Flujo Optimizado de 4 Fases (RECOMENDADO)

```
FASE 1: Analisis Inicial + Plan Alto Nivel (10% tokens)
├── Principal: CLAUDE CODE
├── Secundario: GEMINI CLI
└── Registra en PROMPTS-ACTIVOS.yml
         │
         ▼
FASE 2: Analisis Detallado + Plan Atomico (25% tokens)
├── Principal: CLAUDE CODE
├── Secundario: GEMINI CLI
├── Alternativo: TRAE
└── Plan ULTRA-DETALLADO para Windsurf
         │
         ▼
FASE 3: Ejecucion de Tareas Atomicas (50% Cascade)
├── Principal: WINDSURF (unico)
├── Ejecuta tareas UNA POR UNA
├── Sigue instrucciones LITERALMENTE
└── NO toma decisiones
         │
         ▼
FASE 4: Validacion Detallada (15% tokens)
├── Principal: CLAUDE CODE
├── Secundario: GEMINI CLI
├── Alternativo: TRAE
├── Veredicto: APROBADA/RECHAZADA
└── Mueve a PROMPTS-HISTORICO.yml
```

---

## Templates de Flujo por Fase

### FASE 1: Prompt Claude Code -> Trae (Analisis Detallado)

Despues de que Claude Code hace el analisis inicial, genera este prompt para Trae:

```
Hola, vas a trabajar como ANALISTA/PLANIFICADOR para {PROYECTO}.

TU ROL: Fase 2 del flujo optimizado - Analisis detallado y planeacion atomica.

CONTEXTO RECIBIDO DE CLAUDE CODE:
{Pegar plan de alto nivel generado por Claude Code}

LEE EN ORDEN:
1. .trae/AGENT-CAPABILITIES.md
2. .trae/rules/project_rules.md
3. CLAUDE.md (reglas base)
4. Archivos de codigo listados en el plan

TU TAREA:
1. Leer los archivos de codigo identificados
2. Analizar patrones existentes (naming, imports, estructura)
3. Validar que el plan es coherente con la arquitectura actual
4. DESCOMPONER en tareas ATOMICAS:
   - MAXIMO 1 archivo por tarea
   - MAXIMO 50 lineas de cambio por tarea
   - Incluir CODIGO LITERAL a escribir
   - Incluir LINEAS EXACTAS a modificar
   - Incluir IMPORTS especificos
   - Incluir VALIDACION por tarea

5. Generar plan ULTRA-DETALLADO para Windsurf (modelo NO-RAZONADOR):
   - SIN ambiguedades
   - SIN decisiones que interpretar
   - Todo EXPLICITO y LITERAL

OUTPUT ESPERADO:
Actualiza PROMPTS-ACTIVOS.yml con el plan detallado siguiendo este formato:

```yaml
tareas_atomicas:
  - id: "T001"
    titulo: "{descripcion corta}"
    archivo: "{path/completo/al/archivo.ts}"
    accion: "crear|modificar|eliminar"
    contenido_exacto: |
      // Codigo LITERAL a escribir
    lineas_afectadas: "XX-YY"  # Si es modificacion
    imports_agregar:
      - "import { X } from 'y';"
    validacion:
      comando: "{comando de validacion}"
      esperado: "{resultado esperado}"
```

NO eres Claude. Sigue CAPVED. Listo para analizar.
```

### FASE 2: Prompt Trae -> Windsurf (Ejecucion)

Despues de que Trae genera el plan atomico, genera este prompt para Windsurf:

```
Hola, vas a trabajar como EJECUTOR DE TAREAS ATOMICAS para {PROYECTO}.

TU ROL: Fase 3 del flujo optimizado - Ejecucion de tareas atomicas.
MODELO: Cascade AI (no-razonador)

LECTURA OBLIGATORIA:
1. CLAUDE.md - Reglas base
2. orchestration/directivas/procedimientos/PROCEDIMIENTO-WINDSURF-EJECUTAR-TAREA.md

PLAN ULTRA-DETALLADO A EJECUTAR:
{Pegar tareas_atomicas generadas por Trae}

REGLAS CRITICAS (NO NEGOCIABLES):
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  ✗ NO tomes decisiones arquitectonicas                        ║
║  ✗ NO interpretes instrucciones ambiguas                      ║
║  ✗ NO modifiques mas de lo indicado                          ║
║  ✗ NO "mejores" el codigo por tu cuenta                      ║
║  ✗ NO crees archivos no especificados                        ║
║  ✗ NO agregues funcionalidad extra                           ║
║                                                               ║
║  SI HAY AMBIGUEDAD:                                          ║
║  1. DETENER ejecucion                                         ║
║  2. Documentar que no esta claro                             ║
║  3. Reportar para clarificacion                              ║
║  4. NO continuar hasta recibir instruccion clara             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

EJECUCION:
1. Ejecutar tareas EN ORDEN (T001, T002, T003...)
2. Para cada tarea:
   - Crear/Modificar archivo EXACTAMENTE como dice
   - Ejecutar comando de validacion
   - Reportar resultado
3. Despues de todas las tareas:
   - npm run build
   - npm run lint
4. Commit y push (siguiendo reglas de submodules)

REPORTE AL FINALIZAR:
```yaml
tareas_ejecutadas:
  - id: "T001"
    estado: "completada|fallida|bloqueada"
    validacion_local: "PASS|FAIL"
    notas: []

commits:
  - hash: "..."
    mensaje: "..."

validacion_global:
  build: "PASS|FAIL"
  lint: "PASS|FAIL"
```

Git: fetch antes, push al terminar. Listo para ejecutar.
```

### FASE 4: Checklist de Validacion (Claude Code o Trae)

Despues de que Windsurf reporta, usar este checklist para validar:

```markdown
## Validacion de Ejecucion - PROMPT-{ID}

### 1. Cumplimiento de Especificaciones
- [ ] Todos los archivos especificados fueron creados/modificados
- [ ] El codigo coincide con lo especificado en el plan
- [ ] No se crearon archivos adicionales no especificados
- [ ] Los criterios de aceptacion originales se cumplen

### 2. Coherencia Arquitectonica
- [ ] Naming conventions correctas (camelCase, PascalCase segun corresponda)
- [ ] Imports correctos y ordenados
- [ ] Estructura de carpetas correcta
- [ ] Patrones del proyecto respetados
- [ ] Decoradores/anotaciones correctos

### 3. Anti-Duplicacion
- [ ] Busqueda de archivos similares ejecutada
- [ ] No hay archivos duplicados
- [ ] No hay funcionalidad duplicada
- [ ] No hay codigo redundante

### 4. Validaciones Tecnicas
- [ ] Build: PASS
- [ ] Lint: PASS
- [ ] TypeCheck: PASS
- [ ] Tests: PASS (si existen)

### 5. Git
- [ ] Commits con formato correcto [TASK-ID] tipo: descripcion
- [ ] Push realizado
- [ ] Submodule actualizado (si corresponde)

### Veredicto Final
- [ ] **APROBADA** - Todo correcto, mover a PROMPTS-HISTORICO.yml
- [ ] **RECHAZADA** - Errores criticos (motivo: _______)
- [ ] **REQUIERE CORRECCION** - Ajustes menores (lista: _______)
```

---

## Comparativa de Capacidades

| Capacidad | Claude Code | Gemini CLI | Windsurf | Trae (Auto) | Trae (SOLO) | Gemini (Antigravity) |
|-----------|-------------|------------|----------|-------------|-------------|---------------------|
| **Rol** | Arquitecto | Arq. Alternativo | Full-Stack | Ejecutor | Dev Autonomo | QA/Testing |
| Subagentes | **SI** | NO | NO | NO | SI (Coder) | NO |
| Modelo | Claude Opus 4.5 | Gemini 3 | Cascade AI | Gemini 3 Pro | Auto | Gemini |
| Razonamiento | **ALTO** | **ALTO** | BAJO | MEDIO | MEDIO | MEDIO |
| Ejecucion | Paralela | Secuencial | Secuencial | Secuencial | Paralela | Secuencial |
| Web Search | **SI** | NO | NO | NO | NO | NO |
| Browser Testing | NO | NO | NO | NO | NO | **SI** |
| Definir Arquitectura | **SI** | **SI** | SI (limitado) | NO | SI (limitado) | NO |
| Planificacion Autonoma | **SI** | **SI** | SI | NO | **SI** | NO |
| Validar Agentes | **SI** | **SI** | NO | NO | NO | NO |
| Manejo Contexto | Automatico | Manual | Semi-auto | Manual | Semi-auto | Manual |
| Multi-archivo | SI | SI | **SI** | SI | SI | SI |
| Refactoring | SI | SI | **SI** | SI | SI | NO |

---

## Manejo de Contexto (Trae y Gemini)

### Principio

```
NO cargar todo al inicio. Cargar SOLO lo necesario para cada paso.
```

### Indicadores de Contexto Alto

- Respuestas mas lentas
- Olvida decisiones anteriores
- Repite preguntas ya respondidas
- Sugiere cambios contradictorios

### Comando de Limpieza

Cuando veas problemas, di:

```
Limpia contexto y continua.
```

El agente debera:
1. Crear checkpoint de progreso
2. Reiniciar con contexto limpio
3. Cargar solo: config + checkpoint + siguiente archivo
4. Continuar desde donde quedo

### Template de Checkpoint

```markdown
## Checkpoint
**Tarea:** {nombre}
**Progreso:** {X de Y}
**Completado:** [lista]
**Pendiente:** [lista]
**Archivos modificados:** [lista]
**Siguiente:** {accion}
```

---

## Flujo de Trabajo Recomendado

### Feature Nueva

```
1. CLAUDE CODE: Define arquitectura y plan
2. TRAE: Ejecuta plan paso a paso
3. GEMINI: Prueba en navegador
4. CLAUDE CODE: Valida y aprueba
```

### Bug Fix

```
1. GEMINI: Reproduce bug, documenta
2. CLAUDE CODE: Analiza causa, define fix
3. TRAE: Implementa fix
4. GEMINI: Verifica resolucion
```

### Testing de UI

```
1. CLAUDE CODE: Define casos de prueba
2. GEMINI: Ejecuta en navegador, reporta
```

---

## Referencias

- `@PROMPTS-CLAUDE-CODE` - Prompts para Claude Code
- `@PROMPTS-GEMINI-CLI` - Prompts para Gemini CLI
- `@PROMPTS-WINDSURF` - Prompts para Windsurf
- `@PROMPTS-TRAE` - Prompts para Trae
- `@PROMPTS-GEMINI-QA` - Prompts para Gemini (Antigravity)
- `@FLUJO-AGENTES` - orchestration/directivas/simco/SIMCO-FLUJO-AGENTES.md
- `@AGENT-ROLES` - orchestration/agents/AGENT-ROLES.md
- `@EXEC-STANDARDS` - orchestration/agents/AGENT-EXECUTION-STANDARDS.md

---

*PROMPTS-COMMON.md - Introduccion, roles y flujo de trabajo*
