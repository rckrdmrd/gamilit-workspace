---
name: SIMCO-ORCHESTRATOR-PATTERN
version: "1.0.0"
date: "2026-03-03"
alias: "@ORCHESTRATOR_PATTERN"
sistema: "SIMCO v4.0.0"
tipo: "Directiva de Orquestacion"
criticidad: RECOMENDADA
aplica_a: "Agente Claude Code actuando como orquestador de multiples subagentes"
depende_de:
  - SIMCO-DELEGACION.md
  - SIMCO-DELEGACION-PARALELA.md
  - SIMCO-SUBAGENTE.md
  - SIMCO-MODEL-SELECTION.md
---

# SIMCO-ORCHESTRATOR-PATTERN

---

## 0. Proposito y Contexto

Esta directiva codifica el rol de orquestador tal como ha sido ejercido en 15+ sesiones
del proyecto gamilit. Su objetivo es estandarizar el comportamiento session-level del
agente principal cuando actua como coordinador de multiples subagentes en tareas
multi-archivo, multi-dominio o multi-wave.

Distincion de roles:
- **ORCHESTRATOR:** Ejecuta las fases CAPVED C+A+P+V+D. Delega exclusivamente la fase E
  (Ejecutar) a subagentes especializados. Mantiene el contexto global de la sesion.
- **SUBAGENTE:** Recibe una tarea delimitada y ejecuta unicamente la fase E (Ejecutar).
  No tiene vision global de la sesion ni del plan de waves.

Relacion con directivas existentes:
- `SIMCO-DELEGACION.md` define la mecanica de una delegacion individual (como escribir el
  prompt, que heredar, que verificar al recibir el reporte).
- `SIMCO-DELEGACION-PARALELA.md` define los limites de paralelismo (max 5, por dominio).
- **Esta directiva** define la toma de decisiones del orquestador a nivel de sesion completa:
  estructura de waves, presupuesto de contexto, gates entre waves, seleccion de modelos
  por tipo de subtarea, y anti-patrones a evitar.

---

## 1. Diagrama de Flujo Completo

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  TASK INPUT                                                                  ║
║  (requerimiento, bug report, tarea SIMCO)                                    ║
╚═══════════════════════════╦══════════════════════════════════════════════════╝
                            ↓
╔══════════════════════════════════════════════════════════════════════════════╗
║  ORCHESTRATOR — CAPVED Fases C + A + P                                       ║
║  · Lee PROXIMA-ACCION.md y MASTER_INVENTORY.yml                              ║
║  · Lee _INDEX / _MAP de dominios afectados (NO contenido completo)           ║
║  · Identifica N subtareas y dependencias entre ellas                         ║
║  · Diseña estructura de M waves (DDL → BE → FE → DOCS)                      ║
║  · Escribe SESSION-TRACKING con plan completo                                ║
╚═══════════════════════════╦══════════════════════════════════════════════════╝
                            ↓
╔══════════════════════════════════════════════════════════════════════════════╗
║  WAVE 1  (max 5 subagentes en paralelo)                                      ║
║  · ST-001 [Haiku]   — Busqueda / analisis 1-2 archivos                       ║
║  · ST-002 [Sonnet]  — Implementacion backend (1-2 archivos)                  ║
║  · ST-003 [Haiku]   — Analisis DDL / lectura schema                          ║
╚═══════════════════════════╦══════════════════════════════════════════════════╝
                            ↓
╔══════════════════════════════════════════════════════════════════════════════╗
║  GATE-1  (orquestador verifica antes de continuar)                           ║
║  · SESSION-TRACKING: todos los ST de Wave 1 = COMPLETADO                     ║
║  · npm run build PASS                                                         ║
║  · npm run lint PASS                                                          ║
║  · Sin violaciones de placeholder                                             ║
║  · Criterios de aceptacion verificados en filesystem                          ║
╚═══════════════════════════╦══════════════════════════════════════════════════╝
                            ↓
╔══════════════════════════════════════════════════════════════════════════════╗
║  WAVE 2  (max 5 subagentes en paralelo)                                      ║
║  · ST-004 [Sonnet]  — Implementacion frontend (1-2 archivos)                 ║
║  · ST-005 [Sonnet]  — Actualizacion docs / inventory fragmento               ║
╚═══════════════════════════╦══════════════════════════════════════════════════╝
                            ↓
╔══════════════════════════════════════════════════════════════════════════════╗
║  GATE-2  (mismo checklist que GATE-1)                                        ║
╚═══════════════════════════╦══════════════════════════════════════════════════╝
                            ↓
╔══════════════════════════════════════════════════════════════════════════════╗
║  ORCHESTRATOR — CAPVED Fases V + D                                           ║
║  · Verifica coherencia cross-dominio (entidades, endpoints, tipos)           ║
║  · Ejecuta SIMCO-POST-TASK-SYNC (inventarios, PROXIMA-ACCION)                ║
║  · Escribe TASK-REPORT.md en orchestration/tareas/TASK-{id}/                 ║
╚═══════════════════════════╦══════════════════════════════════════════════════╝
                            ↓
                          DONE
```

---

## 2. Responsabilidades del Orquestador

### 2.1 Lo que el Orquestador HACE

**Carga de contexto selectiva:**
- Lee unicamente archivos `_INDEX.md` y `_MAP.md` de los dominios afectados por la tarea.
  No lee el contenido completo de archivos que delegara a subagentes.
- Lee `orchestration/PROXIMA-ACCION.md` al inicio de sesion para conocer el estado actual
  del proyecto y las tareas pendientes de la sesion anterior.
- Lee `orchestration/inventarios/MASTER_INVENTORY.yml` al inicio de sesion para obtener
  metricas actualizadas (entities, endpoints, versiones).

**Planificacion:**
- Determina el orden de dependencia: DDL → Backend → Frontend → Docs.
- Diseña la estructura de waves agrupando subtareas independientes en el mismo wave.
- Escribe el archivo SESSION-TRACKING antes de lanzar el primer subagente.
- Redacta prompts de delegacion usando rutas absolutas y extractos minimos (no codigo inline).

**Validacion:**
- Verifica el output de cada subagente directamente en el filesystem usando Glob/Grep/Read.
  No acepta el reporte del subagente sin verificacion independiente.
- Ejecuta o solicita los comandos de build/lint despues de cada gate.

**Fase D (Documentar/Sincronizar):**
- Ejecuta SIMCO-POST-TASK-SYNC directamente. NUNCA delega la sincronizacion de inventarios
  a un subagente: el subagente carece del contexto completo de la sesion para actualizar
  correctamente MASTER_INVENTORY.yml, PROXIMA-ACCION.md y TASK-REPORT.md.

### 2.2 Lo que el Orquestador NO HACE

- No lee el contenido completo de archivos fuente que delegara (solo paths + lineas especificas).
- No supera el presupuesto de contexto del orquestador definido abajo.
- No delega la Fase D de CAPVED.
- No lanza mas de 5 subagentes en paralelo en el mismo wave.
- No asume que el reporte de un subagente es correcto sin verificar en el filesystem.

**Presupuesto de contexto del orquestador:**

```yaml
ORCHESTRATOR_BUDGET:
  contexto_maximo: 50000 tokens
  alerta_amarilla: 35000  # iniciar cleanup de archivos STALE
  alerta_roja: 45000      # forzar SIMCO-CONTEXT-CLEANUP antes de continuar
```

Cuando se alcanza `alerta_amarilla`, clasificar contexto activo en ACTIVE / REFERENCE / STALE
siguiendo el protocolo de `SIMCO-CONTEXT-CLEANUP.md`. Cuando se alcanza `alerta_roja`, ejecutar
limpieza agresiva antes de lanzar el siguiente wave.

---

## 3. Responsabilidades del Subagente

### 3.1 Lo que el Subagente Recibe

El prompt de delegacion debe ser autocontenido y no superar 20K tokens. Incluye:

- **Variables heredadas resueltas:** `proyecto`, `working_dir`, `BACKEND_SRC`, `FRONTEND_SRC`,
  `DDL_PATH` con rutas absolutas sin placeholders.
- **Archivos de alcance:** Maximo 1-2 archivos especificos (rutas absolutas). Para tareas de
  analisis, puede ampliarse a 3-4 archivos de lectura con 0 archivos de escritura.
- **Patron de referencia:** Ruta absoluta + rango de lineas del archivo a copiar o adaptar.
  El subagente lee ese fragmento directamente; el orquestador NO lo incluye inline en el prompt.
- **Criterios de aceptacion:** Maximo 5 items verificables (checkboxes). Criterios ambiguos
  deben resolverse en la fase de planificacion del orquestador, no en el subagente.
- **Comandos de validacion:** Los comandos exactos de build/lint que el subagente debe ejecutar
  al terminar (e.g., `cd apps/backend && npm run build && npm run lint`).

### 3.2 Formato de Reporte

El subagente reporta al finalizar usando el formato definido en `SIMCO-SUBAGENTE.md` seccion 5:

```yaml
REPORTE_SUBAGENTE:
  subtarea_id: "ST-XXX"
  estado: "COMPLETADO | FALLIDO | BLOQUEADO"
  archivos:
    creados: []
    modificados: []
  validaciones:
    build: "PASS | FAIL | SKIP"
    lint: "PASS | FAIL | SKIP"
  siguiente_paso: "descripcion breve"
  problemas: []  # solo si hay problemas
```

El orquestador verifica este reporte contra el filesystem antes de actualizar SESSION-TRACKING.

### 3.3 Limitaciones del Subagente

- No puede delegar tareas a otros subagentes.
- No debe leer `PROJECT-CONTEXT.md` (el orquestador ya extrajo lo relevante en el prompt).
- Solo ejecuta la fase E de CAPVED. No ejecuta C, A, P, V ni D a nivel de sesion.
- Si detecta ambiguedad o falta contexto critico, escala al orquestador con formato
  `RECOVERY_SUBAGENTE` en lugar de asumir y proceder.

---

## 4. Seleccion de Modelo por Fase

Esta tabla extiende `SIMCO-MODEL-SELECTION.md` con foco en subtareas delegadas. No duplica
el arbol de decision de esa directiva — lo complementa para el contexto de subagentes.

| Tipo de fase | Archivos involucrados | Modelo recomendado | Razon |
|---|---|---|---|
| Busqueda (Glob/Grep solamente) | Cualquiera | Haiku 4.5 | Operacion barata, sin razonamiento complejo |
| Analisis de lectura (1-3 archivos) | 1-3 | Haiku 4.5 | Baja complejidad, extrae informacion puntual |
| Analisis cross-dominio (lectura) | 4-8 | Sonnet 4.6 | Razonamiento cross-archivo necesario |
| Implementacion estandar (1-2 archivos) | 1-2 | Sonnet 4.6 | Implementacion tipica de feature o fix |
| Actualizacion de inventarios/gobernanza | 1-3 | Sonnet 4.6 | Precision requerida, formato YAML estricto |
| Planificacion de sesion (multi-wave) | N/A | Opus 4.6 | Decisiones arquitectonicas, plan complejo |

**Anti-patron critico:** Nunca usar Opus 4.6 para subtareas que modifiquen un solo archivo.
El costo de tokens de Opus se justifica solo para decisiones de sesion completa o tareas
que requieran razonamiento sobre 10+ archivos con dependencias cruzadas. Para todo lo demas,
Sonnet 4.6 es el modelo por defecto con la mejor relacion calidad/costo.

---

## 5. Especificacion de Phase Gates

Cada gate entre waves tiene tres estados posibles:

```yaml
GATE_ESTADOS:
  PROCEED:
    condicion: "Todos los subagentes del wave actual reportaron COMPLETADO Y todos
                los builds y lints pasan Y no hay violaciones de placeholder"
    accion: "Lanzar siguiente wave"

  PROCEED_WITH_DEFERRED:
    condicion: "Al menos 1 subagente reporto fallo no bloqueante (e.g., lint warning
                menor, doc desactualizada) pero los builds pasan y no hay fallo
                de seguridad ni de logica de negocio"
    accion: "Continuar al siguiente wave. Registrar el item diferido en SESSION-TRACKING
             con estado PENDIENTE para resolver en wave final o siguiente sesion"

  BLOCKED:
    condicion: "Al menos 1 subagente reporto FALLIDO con fallo bloqueante: build fail,
                violacion de seguridad, placeholder sin implementar, o criterio de
                aceptacion P1 no cumplido"
    accion: "DETENER ejecucion del siguiente wave. Resolver el bloqueo antes de continuar.
             Si no se puede resolver en la sesion actual, documentar en PROXIMA-ACCION.md"
```

**Checklist obligatorio por gate (5 items):**

- [ ] SESSION-TRACKING muestra todos los ST del wave actual con estado `COMPLETADO`
- [ ] `npm run build` pasa sin errores (backend Y frontend si ambos fueron modificados)
- [ ] `npm run lint` pasa sin errores nuevos introducidos en esta sesion
- [ ] No hay ocurrencias de `// ...`, `/* ... */` ni texto `TODO` en archivos modificados
- [ ] Los criterios de aceptacion de cada ST han sido verificados directamente en el filesystem
      por el orquestador (no solo confiando en el reporte del subagente)

---

## 6. Descomposicion en Waves

Usar **wave unico** cuando todas las subtareas son independientes entre si Y el total no supera 5.
Usar **estructura multi-wave** cuando:
- El total de subtareas supera 5, o
- Existen dependencias de orden entre subtareas (e.g., backend necesita DDL completo antes de
  que el frontend pueda consumir el endpoint), o
- Las subtareas tocan dominios distintos con dependencias cruzadas (DDL → BE → FE).

**Reglas de sizing por wave:**

```yaml
WAVE_SIZING:
  max_subagentes_por_wave: 5
  max_por_dominio_por_wave:
    DDL: 1        # siempre secuencial: riesgo de conflictos en schema
    BACKEND: 2    # hasta 2 modulos distintos en paralelo
    FRONTEND: 3   # componentes/paginas independientes
    DOCS: 2       # documentos distintos sin dependencia entre ellos

  wave_0_reservado: >
    Infraestructura: DDL, migraciones de schema, creacion de entities. Todo lo que
    el resto de los waves necesita como prerequisito.

  wave_final_reservado: >
    Validacion integral, sincronizacion de inventarios, actualizacion de PROXIMA-ACCION.md,
    escritura del TASK-REPORT.md. Solo ejecutado por el orquestador, nunca delegado.
```

**Ejemplo de estructura para tarea con 7 subtareas:**

```
Wave 0 (1 subagente): DDL + entity nueva
Wave 1 (3 subagentes): service, controller, DTOs (backend)
Wave 2 (2 subagentes): componente React, hook de API (frontend)
Wave final (orquestador): inventory sync + report
```

---

## 7. Templates de Prompt para Subagentes

### 7.1 Background Agent Template (Task tool — sin acceso a conversacion del orquestador)

Usar este template cuando el subagente se lanza via Task tool como agente de fondo. El prompt
debe ser completamente autocontenido porque el agente no puede preguntar al orquestador.

```markdown
# SUBAGENTE: {tipo} — ST-{id}

## CONTEXTO HEREDADO
proyecto: gamilit
working_dir: C:\Empresas\ISEM\gamilit-workspace
BACKEND_SRC: C:\Empresas\ISEM\gamilit-workspace\apps\backend\src
FRONTEND_SRC: C:\Empresas\ISEM\gamilit-workspace\apps\frontend\src
DDL_PATH: C:\Empresas\ISEM\gamilit-workspace\apps\database\ddl
stack: NestJS 11 + React 19 + PostgreSQL 15 + TypeORM 0.3.x

## TAREA UNICA
{1-2 oraciones especificas describiendo exactamente que crear o modificar.
Sin ambiguedad. Sin "revisar" ni "analizar" — solo accion concreta.}

## REFERENCIA
Copiar patron de: {ruta_absoluta} lineas {X}-{Y}
{Solo la ruta + rango. El subagente lee el archivo directamente.}

## CRITERIOS DE ACEPTACION (max 5)
- [ ] {criterio especifico y verificable 1}
- [ ] {criterio especifico y verificable 2}
- [ ] {criterio especifico y verificable 3}
- [ ] npm run build pasa sin errores nuevos
- [ ] npm run lint pasa sin errores nuevos

## VALIDACION
Ejecutar al finalizar:
  cd C:\Empresas\ISEM\gamilit-workspace\apps\{dominio} && npm run build && npm run lint

## REPORTAR AL FINALIZAR
Estado: COMPLETADO | FALLIDO | BLOQUEADO
Archivos creados: {lista}
Archivos modificados: {lista}
Validacion: build=PASS|FAIL lint=PASS|FAIL
```

### 7.2 Foreground Agent Template (conversacion con contexto disponible)

Usar este template cuando el subagente opera en la misma conversacion o tiene acceso al
hilo del orquestador. El contexto del proyecto ya esta disponible, por lo que el prompt
puede ser mas conciso.

```markdown
# ST-{id}: {nombre corto}

Tarea: {1 oracion exacta}
Archivo: {ruta_absoluta}
Referencia: {ruta_absoluta} lineas {X}-{Y}

Criterios:
- [ ] {criterio 1}
- [ ] build + lint PASS

Validar con: cd apps/{dominio} && npm run build && npm run lint
Reportar: estado + archivos + build=PASS|FAIL + lint=PASS|FAIL
```

---

## 8. Anti-Patrones

Los siguientes anti-patrones han sido identificados en sesiones reales del proyecto gamilit.
Cada uno tiene un nombre canonico para facilitar su referencia en revisiones.

```yaml
ANTI_PATRONES:

  AP-01_CONTEXT_LOADING_EN_ORQUESTADOR:
    descripcion: >
      El orquestador lee el contenido completo de archivos que luego delegara a subagentes.
      Ejemplo: leer shopService.ts completo antes de delegar la modificacion.
    consecuencia: >
      Consume 10-30K tokens del presupuesto del orquestador innecesariamente. El subagente
      igualmente necesita leerlo por su cuenta.
    correccion: >
      Leer solo _INDEX/_MAP para ubicar el archivo. Pasar la ruta absoluta al subagente
      y dejar que este haga la lectura en su propio contexto.

  AP-02_OPUS_PARA_TAREA_UN_ARCHIVO:
    descripcion: >
      Usar Opus 4.6 para una subtarea que solo modifica 1-2 archivos con patron claro.
      Ejemplo: agregar un campo a un DTO existente con Opus.
    consecuencia: >
      Costo de tokens 5x mayor sin ganancia en calidad. Opus no produce mejor codigo que
      Sonnet para implementaciones estandar con patron de referencia disponible.
    correccion: >
      Usar Sonnet 4.6 para toda implementacion estandar. Reservar Opus para planificacion
      multi-wave o decisiones arquitectonicas que afecten 10+ archivos.

  AP-03_SALTAR_GATES:
    descripcion: >
      Lanzar Wave 2 sin verificar que todos los subagentes de Wave 1 completaron correctamente.
      Ejemplo: lanzar subagentes de frontend antes de verificar que el endpoint backend compila.
    consecuencia: >
      Errores en cascade. El frontend puede compilar con tipos incorrectos que luego fallan
      en runtime porque el contrato del endpoint cambio.
    correccion: >
      Siempre ejecutar el checklist de gate completo antes de lanzar el siguiente wave.
      Si un gate falla, resolver el bloqueo antes de continuar.

  AP-04_DELEGAR_FASE_D:
    descripcion: >
      Delegar la sincronizacion de inventarios (MASTER_INVENTORY.yml, PROXIMA-ACCION.md,
      TASK-REPORT.md) a un subagente.
    consecuencia: >
      El subagente no tiene vision del estado completo de la sesion. Produce actualizaciones
      parciales, versiones incorrectas o metricas que no reflejan todos los cambios de la sesion.
    correccion: >
      El orquestador siempre ejecuta Fase D directamente. Los subagentes pueden actualizar
      fragmentos de inventario especificos de su dominio (e.g., una entrada en BACKEND_INVENTORY),
      pero nunca MASTER_INVENTORY ni PROXIMA-ACCION.

  AP-05_MAS_DE_5_PARALELOS:
    descripcion: >
      Lanzar 6 o mas subagentes en el mismo wave para acelerar la sesion.
    consecuencia: >
      Conflictos de escritura en archivos compartidos (e.g., index.ts de barrel exports,
      gamification.module.ts). El orquestador no puede rastrear el estado de mas de 5
      subagentes simultaneos sin perder coherencia.
    correccion: >
      Dividir en waves adicionales. El limite es 5 por wave segun SIMCO-DELEGACION-PARALELA.

  AP-06_CONFIAR_EN_REPORTE_SIN_VERIFICAR:
    descripcion: >
      Aceptar el reporte COMPLETADO de un subagente sin verificar el filesystem.
      Ejemplo: marcar ST-002 como completado porque el reporte dice "build=PASS" sin
      ejecutar build independiente.
    consecuencia: >
      Subagentes pueden reportar exito incorrecto por perdida de contexto o alucinacion.
      El error se descubre tarde, cuando ya hay 2-3 waves encima del problema.
    correccion: >
      Verificar siempre: usar Glob/Grep/Read para confirmar que los archivos existen y
      contienen lo esperado. Ejecutar build/lint desde el orquestador antes de aprobar el gate.
```

---

## 9. Integracion con Directivas Existentes

Esta directiva no reemplaza ninguna directiva existente. Define el comportamiento de sesion
del orquestador y delega los detalles mecanicos a las directivas especializadas:

| Directiva | Relacion con SIMCO-ORCHESTRATOR-PATTERN |
|---|---|
| `SIMCO-DELEGACION.md` | Mecanica de cada delegacion individual: estructura del prompt, contexto heredado, principios de delegation. Leer antes de escribir cualquier prompt de subagente. |
| `SIMCO-DELEGACION-PARALELA.md` | Limites exactos de paralelismo (max 5, por dominio). SESSION-TRACKING template. Protocolo de sincronizacion al recibir reportes. |
| `SIMCO-SUBAGENTE.md` | Protocolo de inicializacion del subagente. Formato de reporte canonico (seccion 5). Restricciones de lo que el subagente no debe hacer. |
| `SIMCO-MODEL-SELECTION.md` | Arbol de decision primario para seleccion de modelo/herramienta. Seccion 4 de esta directiva extiende ese arbol con foco en subagentes. |
| `SIMCO-CONTEXT-CLEANUP.md` | Protocolo de limpieza de contexto cuando el orquestador alcanza 35K tokens. Triggers y clasificacion ACTIVE/REFERENCE/STALE. |
| `SIMCO-POST-TASK-SYNC.md` | Protocolo completo para Fase D: actualizacion de inventarios, escritura de TASK-REPORT, actualizacion de PROXIMA-ACCION. El orquestador lo ejecuta directamente al finalizar la sesion. |

**Orden de lectura recomendado para un orquestador nuevo:**

1. `SIMCO-ORCHESTRATOR-PATTERN.md` (esta directiva) — vision general del patron
2. `SIMCO-DELEGACION-PARALELA.md` — limites y SESSION-TRACKING template
3. `SIMCO-DELEGACION.md` — como escribir cada prompt individual
4. `SIMCO-SUBAGENTE.md` — que esperar de cada subagente al reportar
5. `SIMCO-MODEL-SELECTION.md` — confirmar seleccion de modelo para cada wave
