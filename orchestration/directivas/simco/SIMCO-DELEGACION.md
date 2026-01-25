# SIMCO: DELEGACIÓN A SUBAGENTES

**Version:** 1.3.0
**Fecha:** 2026-01-07
**Aplica a:** Agentes orquestadores que necesiten delegar tareas
**Prioridad:** OBLIGATORIA para delegacion
**Templates:**
- Completo (>2 archivos): `templates/TEMPLATE-DELEGACION-COMPLETA.md`
- Estandar (1-2 archivos): `templates/TEMPLATE-DELEGACION-ESTANDAR.md`
- Minimo (1 archivo): `templates/TEMPLATE-DELEGACION-MINIMA.md`

---

## RESUMEN EJECUTIVO

> **Delegar bien = contexto HEREDADO completo + criterios claros + validación al recibir.**
> Un subagente sin contexto heredado = alucinaciones garantizadas.
> Un subagente con contexto heredado = ejecución precisa.
> **⚠️ Prompt muy grande = error de tokens. Desglosar primero.**

---

## PRINCIPIOS DE DELEGACIÓN

```
╔══════════════════════════════════════════════════════════════════════╗
║  1. CONTEXTO COMPLETO                                                 ║
║     El subagente NO tiene acceso a tu conversación anterior          ║
║     DEBES proporcionar TODO lo necesario en el prompt                ║
║                                                                       ║
║  2. ESPECIFICIDAD                                                     ║
║     Tareas vagas = resultados vagos                                  ║
║     Tareas específicas = resultados específicos                      ║
║                                                                       ║
║  3. CRITERIOS VERIFICABLES                                           ║
║     Si no puedes verificar, no puedes validar                        ║
║     Criterios de aceptación DEBEN ser checklist                      ║
║                                                                       ║
║  4. VALIDACIÓN OBLIGATORIA                                           ║
║     SIEMPRE valida el trabajo del subagente                          ║
║     NO asumas que está bien                                           ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## CUÁNDO DELEGAR

### SÍ Delegar

| Situación | Delegar a |
|-----------|-----------|
| Crear tabla/schema DDL | Database-Agent |
| Crear entity/service/controller | Backend-Agent |
| Crear componente/página | Frontend-Agent |
| Tarea especializada fuera de tu dominio | Agente especializado |
| Tareas paralelizables independientes | Múltiples subagentes |

### NO Delegar

| Situación | Razón |
|-----------|-------|
| Validación final de tu trabajo | Tú eres responsable |
| Decisiones arquitectónicas | Requiere contexto completo |
| Tareas que requieren tu contexto de conversación | Subagente no lo tiene |
| Correcciones menores en tu código | Más rápido hacerlo tú |
| Tareas que dependen de resultado de otra | Hacerlas secuencialmente |

---

## ESTRUCTURA DE DELEGACIÓN

### Template de Prompt para Subagente

```markdown
# SUBAGENTE: {Tipo-Agente}

## PROYECTO
**Nombre:** {PROJECT_NAME}
**Working directory:** ~/workspace/projects/{proyecto}

## VERIFICAR CATÁLOGO PRIMERO (🆕 OBLIGATORIO)
**ANTES de implementar, verificar si existe en @CATALOG:**
- Consultar: `grep -i "{funcionalidad}" @CATALOG_INDEX`
- Si existe: Seguir `@REUTILIZAR` (SIMCO-REUTILIZAR.md)
- Funcionalidades catalogadas: auth, session, rate-limiting, notifications,
  multi-tenancy, feature-flags, websocket, payments

## PROMPTS A LEER (EN ORDEN)
1. `@CATALOG_INDEX` (verificar funcionalidades existentes)
2. `@SIMCO/SIMCO-CREAR.md` (o SIMCO relevante)
3. `@PERFILES/PERFIL-{TIPO}.md`
3. `@PROMPTS/PROMPT-{TIPO}-AGENT.md` (si necesita más detalle)

## VARIABLES DEL PROYECTO (RESUELTAS)
```yaml
PROJECT_NAME:    {valor concreto}
DB_NAME:         {valor concreto}
DB_DDL_PATH:     {valor concreto}
BACKEND_ROOT:    {valor concreto}
BACKEND_SRC:     {valor concreto}
FRONTEND_ROOT:   {valor concreto}
FRONTEND_SRC:    {valor concreto}
# ... todas las variables necesarias
```

## TAREA
{Descripción clara y específica de qué debe hacer}

### Objetivo
{Qué se debe lograr}

### Especificaciones
{Detalles técnicos: columnas, tipos, estructura, etc.}

### Ubicación de Archivos
- Crear en: `{ruta exacta}`
- Referencia: `{archivo de referencia a consultar}`

### Restricciones
- ❌ NO hacer: {lista de prohibiciones}
- ✅ SÍ hacer: {lista de obligaciones}

## ARCHIVOS DE REFERENCIA
- `{ruta_1}` - {propósito}
- `{ruta_2}` - {propósito}

## CRITERIOS DE ACEPTACIÓN
- [ ] {criterio verificable 1}
- [ ] {criterio verificable 2}
- [ ] {criterio verificable 3}
- [ ] Build pasa sin errores
- [ ] Inventario actualizado
- [ ] Sin duplicados creados

## VALIDACIONES REQUERIDAS
```bash
# Comandos que DEBE ejecutar antes de reportar
{comando 1}
{comando 2}
```

## REPORTE ESPERADO
Al completar, el subagente debe reportar:
1. Archivos creados/modificados
2. Resultado de validaciones
3. Problemas encontrados (si hay)
4. Confirmación de criterios de aceptación

## CONTEXTO ADICIONAL
{Información relevante que el subagente necesita saber}
```

---

## DELEGACIÓN POR TIPO

### A Database-Agent

```markdown
# SUBAGENTE: Database-Agent

## PROYECTO
**Nombre:** {PROJECT_NAME}
**Working directory:** ~/workspace/projects/{proyecto}

## PROMPTS A LEER
1. `@SIMCO/SIMCO-CREAR.md`
2. `@SIMCO/SIMCO-DDL.md`
3. `@PERFILES/PERFIL-DATABASE.md`

## VARIABLES RESUELTAS
```yaml
PROJECT_NAME:    {valor}
DB_NAME:         {valor}
DB_DDL_PATH:     {valor}
DB_SCRIPTS_PATH: {valor}
DB_SEEDS_PATH:   {valor}
RECREATE_CMD:    {valor}
```

## TAREA
Crear tabla `{schema}.{nombre_tabla}` con las siguientes especificaciones:

### Columnas
| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | PK |
| {col1} | {tipo} | {nullable} | {default} | {desc} |

### Índices
- `idx_{tabla}_{col1}` en ({col1})
- `idx_{tabla}_{col2}` en ({col2})

### Constraints
- FK: {columna} → {tabla_ref}({columna_ref})
- CHECK: {condición}

### Ubicación
`{DB_DDL_PATH}/schemas/{schema}/tables/{NN}-{tabla}.sql`

## CRITERIOS DE ACEPTACIÓN
- [ ] Archivo DDL creado en ubicación correcta
- [ ] Todas las columnas según especificación
- [ ] Todos los índices creados
- [ ] Constraints correctos
- [ ] COMMENT ON incluidos
- [ ] Carga limpia exitosa: `./{RECREATE_CMD}`
- [ ] @INVENTORY actualizado
- [ ] @TRAZA_DB actualizada
```

### A Backend-Agent

```markdown
# SUBAGENTE: Backend-Agent

## PROYECTO
**Nombre:** {PROJECT_NAME}
**Working directory:** ~/workspace/projects/{proyecto}

## VERIFICAR CATÁLOGO PRIMERO (🆕)
Si la tarea involucra: auth, session, rate-limiting, notifications,
multi-tenancy, feature-flags, websocket, payments
→ Consultar @CATALOG_INDEX y usar @REUTILIZAR si existe

## PROMPTS A LEER
1. `@CATALOG_INDEX` (verificar si existe funcionalidad)
2. `@SIMCO/SIMCO-CREAR.md`
3. `@SIMCO/SIMCO-BACKEND.md`
4. `@PERFILES/PERFIL-BACKEND.md`

## VARIABLES RESUELTAS
```yaml
PROJECT_NAME:    {valor}
BACKEND_ROOT:    {valor}
BACKEND_SRC:     {valor}
DB_NAME:         {valor}
AUTH_SCHEMA:     {valor}
```

## TAREA
Crear Entity, Service y Controller para `{nombre}`:

### Entity
- Mapear a: `{schema}.{tabla}`
- Archivo: `{BACKEND_SRC}/modules/{modulo}/entities/{nombre}.entity.ts`

### DTOs
- CreateDto: `{BACKEND_SRC}/modules/{modulo}/dto/create-{nombre}.dto.ts`
- UpdateDto: `{BACKEND_SRC}/modules/{modulo}/dto/update-{nombre}.dto.ts`

### Service
- CRUD básico
- Archivo: `{BACKEND_SRC}/modules/{modulo}/services/{nombre}.service.ts`

### Controller
- Endpoints REST con Swagger
- Archivo: `{BACKEND_SRC}/modules/{modulo}/controllers/{nombre}.controller.ts`

## CRITERIOS DE ACEPTACIÓN
- [ ] Entity alineada 100% con DDL
- [ ] DTOs con validaciones class-validator
- [ ] Service con lógica CRUD
- [ ] Controller con Swagger decorators
- [ ] JSDoc en todo código público
- [ ] `npm run build` pasa
- [ ] `npm run lint` pasa
- [ ] @INVENTORY actualizado
- [ ] @TRAZA_BE actualizada
```

### A Frontend-Agent

```markdown
# SUBAGENTE: Frontend-Agent

## PROYECTO
**Nombre:** {PROJECT_NAME}
**Working directory:** ~/workspace/projects/{proyecto}

## PROMPTS A LEER
1. `@SIMCO/SIMCO-CREAR.md`
2. `@SIMCO/SIMCO-FRONTEND.md`
3. `@PERFILES/PERFIL-FRONTEND.md`

## VARIABLES RESUELTAS
```yaml
PROJECT_NAME:    {valor}
FRONTEND_ROOT:   {valor}
FRONTEND_SRC:    {valor}
API_BASE_URL:    {valor}
```

## TAREA
Crear componente/página para `{nombre}`:

### Componente
- Nombre: `{NombreComponente}`
- Archivo: `{FRONTEND_SRC}/apps/{app}/components/{Nombre}.tsx`

### Hook (si necesario)
- Nombre: `use{Nombre}`
- Archivo: `{FRONTEND_SRC}/apps/{app}/hooks/use{Nombre}.ts`

### Tipos
- Archivo: `{FRONTEND_SRC}/shared/types/{nombre}.types.ts`

### API Integration
- Endpoint: `{endpoint}`
- Método: `{GET|POST|PUT|DELETE}`

## CRITERIOS DE ACEPTACIÓN
- [ ] Componente con props documentadas
- [ ] Hook con manejo de estados (loading, error)
- [ ] Types alineados con DTOs del backend
- [ ] TSDoc en funciones públicas
- [ ] `npm run build` pasa
- [ ] `npm run lint` pasa
- [ ] @INVENTORY actualizado
- [ ] @TRAZA_FE actualizada
```

---

## PARALELIZACIÓN

### Cuándo Paralelizar

```markdown
✅ PARALELIZABLE:
- Tareas en diferentes capas sin dependencia (tabla A + tabla B)
- Componentes independientes
- Tests independientes

❌ NO PARALELIZABLE:
- Entity depende de tabla → primero tabla
- Componente depende de hook → primero hook
- Service depende de entity → primero entity
```

### Límites

```yaml
Máximo subagentes paralelos: 5
Razón: Más allá es difícil coordinar y validar
```

---

## ⚠️ LÍMITES DE TOKENS (CRÍTICO)

### Límites de Prompt de Delegación

```yaml
PROMPT_DELEGACION:
  maximo_absoluto: 3,000 tokens (~12,000 caracteres)
  recomendado: 1,500 tokens (~6,000 caracteres)
  minimo_efectivo: 500 tokens (~2,000 caracteres)

TAREA_INDIVIDUAL:
  output_maximo: 2,000 tokens
  archivos_por_tarea: 1-2 máximo
  si_mas_archivos: "DESGLOSAR en subtareas"
```

### Señales de Tarea Demasiado Grande

```yaml
ALERTA_ROJA:
  - Tarea pide crear "módulo completo"
  - Tarea menciona >3 archivos a crear
  - Prompt de delegación >200 líneas
  - Se incluye código de referencia >50 líneas inline

ACCION:
  - DETENER delegación
  - Desglosar en subtareas
  - 1 subtarea = 1-2 archivos máximo
```

### Template Optimizado (~800 tokens)

```yaml
# PROMPT OPTIMIZADO PARA TOKENS

## SUBAGENTE: {Tipo}
Nivel: {nivel} | Proyecto: {proyecto}

## TAREA ÚNICA
{1-2 oraciones máximo}

## ESPECIFICACIÓN
{Máximo 10 líneas de detalles técnicos}

## REFERENCIA
- Copiar patrón de: `{ruta}` (líneas X-Y)

## CRITERIOS (máximo 5)
- [ ] {criterio 1}
- [ ] {criterio 2}
- [ ] {criterio 3}

## VALIDACIÓN
{1-2 comandos bash}

## ENTREGABLE
1. {archivo único a crear}
```

### Desglose Obligatorio

```yaml
# MAL - Tarea muy grande
"Crear módulo de usuarios con entity, service, controller, DTOs y tests"

# BIEN - Desglosado
ST-001: Crear UserEntity (1 archivo)
ST-002: Crear CreateUserDto y UpdateUserDto (2 archivos pequeños)
ST-003: Crear UserService con CRUD (1 archivo)
ST-004: Crear UserController (1 archivo)
ST-005: Ejecutar build + lint (validación)
```

### Si Ocurre Error de Tokens

```yaml
SINTOMAS:
  - Respuesta truncada
  - Error de context overflow
  - Subagente "olvida" parte de la tarea

SOLUCION:
  1. Dividir tarea en 2-3 subtareas más pequeñas
  2. Reducir contexto heredado (solo lo esencial)
  3. Usar referencias a archivos en lugar de incluir código
  4. Ejecutar subtareas secuencialmente
```

### Referencia Completa

Ver: `@PRINCIPIOS/PRINCIPIO-ECONOMIA-TOKENS.md`

### Template de Paralelización

```markdown
# DELEGACIÓN PARALELA

## Subagente 1: Database-Agent
{contexto completo para crear tabla A}

## Subagente 2: Database-Agent
{contexto completo para crear tabla B}

## Subagente 3: Backend-Agent
{contexto completo para crear módulo X (independiente)}

## Sincronización
Esperar que todos completen antes de continuar con tareas dependientes.
```

---

## RECEPCIÓN Y VALIDACIÓN

### Al Recibir Resultado del Subagente

```markdown
## Validación de Entrega - {SUBAGENTE-ID}

### Criterios de Aceptación
- [ ] {criterio 1}: ✅ Cumple | ❌ No cumple
- [ ] {criterio 2}: ✅ Cumple | ❌ No cumple
- [ ] {criterio 3}: ✅ Cumple | ❌ No cumple

### Verificación Técnica
- [ ] Archivos existen en ubicación correcta
- [ ] Build pasa
- [ ] Lint pasa
- [ ] Sin duplicados

### Coherencia
- [ ] Alineado con docs/
- [ ] Consistente con otras capas
- [ ] Convenciones seguidas

### Resultado
✅ ACEPTADO - Continuar
❌ RECHAZADO - Requiere corrección:
   - {problema 1}
   - {problema 2}
```

### Si Hay Problemas

```markdown
## Corrección Requerida - {SUBAGENTE-ID}

### Problemas Detectados
1. {problema 1}
2. {problema 2}

### Correcciones Necesarias
1. {corrección 1}
2. {corrección 2}

### Nueva Delegación o Corrección Propia
{Decidir si re-delegar o corregir directamente}
```

---

## ERRORES COMUNES EN DELEGACIÓN

| Error | Causa | Solución |
|-------|-------|----------|
| Resultado incorrecto | Contexto incompleto | Proporcionar TODO el contexto |
| Ubicación incorrecta | No especificó ruta | Dar ruta EXACTA |
| Convenciones ignoradas | No incluyó referencias | Incluir prompts SIMCO |
| Variables sin resolver | Usó placeholders | Resolver TODAS las variables |
| Sin validación | Confió en el subagente | SIEMPRE validar resultado |
| Duplicados | No mencionó anti-duplicación | Incluir verificación @INVENTORY |

---

## CONTEXTO HEREDADO (CCA)

### El Subagente DEBE Ejecutar CCA

Cada subagente debe ejecutar el protocolo de Carga de Contexto Automática antes de actuar:

```yaml
instruccion_en_delegacion: |
  ANTES de actuar, ejecuta el protocolo CCA:
  1. Lee core/orchestration/directivas/simco/SIMCO-INICIALIZACION.md
  2. Sigue los pasos de carga de contexto
  3. Confirma "READY_TO_EXECUTE" antes de implementar
```

### Contexto que DEBES Heredar al Subagente

```yaml
contexto_heredado_obligatorio:
  # Variables resueltas del proyecto
  variables:
    DB_NAME: "{valor concreto}"
    DB_DDL_PATH: "{valor concreto}"
    BACKEND_ROOT: "{valor concreto}"
    # ... todas las necesarias

  # Alias resueltos
  aliases:
    "@DDL": "{ruta completa}"
    "@BACKEND": "{ruta completa}"
    "@INVENTORY": "{ruta completa}"

  # Estado actual relevante
  estado:
    tablas_existentes: ["{lista}"]
    entities_existentes: ["{lista}"]
    endpoints_existentes: ["{lista}"]

  # Documentación de referencia
  docs:
    - path: "{ruta}"
      proposito: "{qué contiene}"

  # Código de referencia
  patrones:
    - path: "{ruta código similar}"
      usar_para: "{qué copiar}"
```

### Template Completo de Delegación

Ver: `templates/TEMPLATE-DELEGACION-SUBAGENTE.md`

Este template incluye 8 bloques:
1. Identidad y Contexto
2. Contexto Heredado (variables, aliases, estado)
3. Directivas a Seguir
4. Tarea Específica
5. Dependencias
6. Criterios de Aceptación
7. Entregables
8. Restricciones

---

## MATRIZ DE DECISION: SELECCION DE TEMPLATE

```yaml
SELECCIONAR_TEMPLATE:
  paso_1_contar_archivos:
    1_archivo:
      usar: "TEMPLATE-DELEGACION-MINIMA.md"
      tokens: ~250
    2_archivos:
      usar: "TEMPLATE-DELEGACION-ESTANDAR.md"
      tokens: ~600
    mas_de_2:
      accion: "DESGLOSAR en subtareas"
      si_no_es_posible: "TEMPLATE-DELEGACION-COMPLETA.md"
      tokens: ~1800

  paso_2_verificar_tokens:
    disponibles: "calcular 18000 - contexto_actual"
    si_disponibles_bajos: "usar template mas pequeno"
```

---

## MATRIZ DE DECISION: FORMATO DE HERENCIA

```yaml
CALCULAR_TOKENS_DISPONIBLES:
  limite_seguro: 18000
  contexto_actual: "{estimar}"
  disponibles: "18000 - contexto_actual"

ELEGIR_FORMATO_HERENCIA:
  si_disponibles_mayor_15000:
    usar: "Formato Completo"
    tokens_herencia: ~1000
    incluir: "Variables + Aliases + Estado + Docs + Patrones"

  si_disponibles_8000_a_15000:
    usar: "Formato Compactado"
    tokens_herencia: ~300
    incluir: "Variables + Aliases (solo esenciales)"

  si_disponibles_menor_8000:
    usar: "Formato Ultra-compactado"
    tokens_herencia: ~100
    incluir: "Solo tarea + 1 referencia"
```

---

## PERFILES COMPACTOS PARA SUBAGENTES

Para subagentes, usar perfiles compactos en lugar de completos:

```yaml
PERFILES_COMPACT:
  ubicacion: "orchestration/agents/perfiles/compact/"

  disponibles:
    - PERFIL-BACKEND-COMPACT.md (~250 tokens)
    - PERFIL-FRONTEND-COMPACT.md (~250 tokens)
    - PERFIL-DATABASE-COMPACT.md (~250 tokens)
    - PERFIL-DEVOPS-COMPACT.md (~250 tokens)
    - PERFIL-ML-COMPACT.md (~250 tokens)
    - PERFIL-GENERIC-SUBAGENT.md (~200 tokens)

  ahorro: "~550 tokens por perfil vs perfil completo"

  ver: "compact/_MAP-COMPACT.md"
```

---

## FLUJO RECOMENDADO DE DELEGACION

```yaml
FLUJO:
  1_checklist: "Ejecutar CHECKLIST-PRE-DELEGACION.md"
  2_tokens: "Calcular tokens disponibles"
  3_template: "Seleccionar template segun archivos"
  4_herencia: "Seleccionar formato herencia segun tokens"
  5_perfil: "Especificar PERFIL-*-COMPACT.md"
  6_delegar: "Enviar delegacion"
```

---

## PROTOCOLO PARA SUBAGENTES

Si el agente recibe delegacion (opera como subagente):

```yaml
SUBAGENTE_PROTOCOLO:
  leer: "SIMCO-SUBAGENTE.md"
  cca: "SIMCO-CCA-SUBAGENTE.md (version ligera)"
  no_cargar:
    - CCA completo
    - Perfiles completos
    - CONTEXTO-PROYECTO.md (heredado)
```

---

## REFERENCIAS

- **Templates de delegacion:**
  - `templates/TEMPLATE-DELEGACION-COMPLETA.md` (>2 archivos)
  - `templates/TEMPLATE-DELEGACION-ESTANDAR.md` (1-2 archivos)
  - `templates/TEMPLATE-DELEGACION-MINIMA.md` (1 archivo)
- **Checklist obligatorio:** `checklists/CHECKLIST-PRE-DELEGACION.md`
- **Protocolo subagente:** `directivas/simco/SIMCO-SUBAGENTE.md`
- **CCA subagente:** `directivas/simco/SIMCO-CCA-SUBAGENTE.md`
- **Perfiles compactos:** `agents/perfiles/compact/`
- **Perfiles de agentes:** `agents/perfiles/`
- **Directivas SIMCO:** `directivas/simco/`
- **Aliases:** `referencias/ALIASES.yml`

---

**Version:** 1.3.0 | **Sistema:** SIMCO + CCA + Tokens | **Mantenido por:** Tech Lead
