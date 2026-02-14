# TEMPLATE: HERENCIA DE CONTEXTO PARA SUBAGENTES

**Version:** 1.1.0
**Sistema:** SIMCO + Context Engineering + GCA
**Uso:** Definir contexto heredado al delegar a subagentes
**Complementa:** TEMPLATE-DELEGACION-SUBAGENTE.md, SIMCO-DELEGACION.md
**Actualizado:** 2026-01-20

---

## PRINCIPIO FUNDAMENTAL

> **El contexto correcto se HEREDA, no se repite.**
> **Lo critico se pasa, lo generico se re-carga.**
> **Minimizar tokens, maximizar precision.**

---

## TIPOS DE CONTEXTO EN HERENCIA

### Contexto Obligatorio a Heredar (SIEMPRE PASAR)

El agente principal DEBE proporcionar al subagente:

```yaml
CONTEXTO_OBLIGATORIO:
  identidad:
    proyecto: "{nombre exacto}"
    proyecto_nivel: "{STANDALONE | SUITE | VERTICAL}"
    ruta_base: "{path completo al proyecto}"

  estado_actual:
    tarea_principal: "{ID} - {descripcion}"
    fase_capved: "{C | A | P | V | E | D}"
    agente_principal: "{perfil del agente que delega}"

  variables_resueltas:
    DB_NAME: "{valor}"
    BACKEND_ROOT: "{path}"
    FRONTEND_ROOT: "{path}"
    # Incluir TODAS las variables del PROJECT-CONTEXT.md

  aliases_resueltos:
    "@DDL": "{ruta completa}"
    "@BACKEND": "{ruta completa}"
    "@INVENTORY": "{ruta completa}"
    # Incluir alias relevantes para la tarea

  trabajo_previo:
    archivos_ya_creados: ["{lista de archivos creados en esta sesion}"]
    archivos_ya_modificados: ["{lista de modificaciones}"]
    dependencias_completadas: ["{lista de tareas previas}"]
```

### Contexto a Resolver en Destino (SUBAGENTE CARGA)

El subagente DEBE cargar por si mismo via CCA:

```yaml
CONTEXTO_AUTO_CARGA:
  core:
    - "core/orchestration/directivas/principios/*.md"
    - "core/orchestration/agents/perfiles/PERFIL-{SU-TIPO}.md"
    - "core/orchestration/directivas/simco/_INDEX.md"

  simco_especificos:
    - "SIMCO-{OPERACION}.md"    # CREAR, MODIFICAR, etc.
    - "SIMCO-{DOMINIO}.md"      # DDL, BACKEND, FRONTEND

  inventarios:
    - "{TIPO}_INVENTORY.yml"     # Segun su dominio

  documentacion:
    - "docs/{especificacion-tarea}.md"
    - "Codigo existente relacionado"
```

### Contexto Implicito (NO PASAR)

NO incluir en herencia (redundante o disponible):

```yaml
CONTEXTO_NO_HEREDAR:
  - "Principios fundamentales (cargan via CCA)"
  - "Contenido completo de archivos grandes"
  - "Codigo no relacionado con la tarea"
  - "Historico de conversacion del agente principal"
  - "Detalles de otras tareas no relacionadas"
```

---

## FORMATOS DE HERENCIA

### Formato Completo (Conversaciones Nuevas)

Usar cuando el subagente inicia sesion nueva:

```markdown
## HERENCIA DE CONTEXTO

### Identidad
- **Proyecto:** {nombre}
- **Nivel:** {STANDALONE | SUITE | VERTICAL}
- **Ruta Base:** {path}

### Estado Actual
- **Tarea Principal:** {ID} - {descripcion}
- **Fase CAPVED:** {fase}
- **Agente Principal:** {perfil}

### Variables Resueltas
```yaml
DB_NAME: "{valor}"
DB_DDL_PATH: "{valor}"
BACKEND_ROOT: "{valor}"
BACKEND_SRC: "{valor}"
FRONTEND_ROOT: "{valor}"
FRONTEND_SRC: "{valor}"
```

### Aliases Relevantes
```yaml
@DDL: "{ruta_completa}"
@BACKEND: "{ruta_completa}"
@INV_DB: "{ruta_completa}"
@INV_BE: "{ruta_completa}"
```

### Trabajo Previo en Esta Sesion
- Creados: {lista de archivos}
- Modificados: {lista de archivos}
- Dependencias completadas: {lista}

### Tu Tarea Especifica
{descripcion detallada con criterios de aceptacion}
```

### Formato Compactado (Conversaciones Largas)

Usar para minimizar tokens en contextos limitados:

```
[HERENCIA-CTX]
PRJ: {nombre} | LVL: {nivel} | BASE: {path}
TASK: {id} | PHASE: {fase} | PARENT: {perfil}
VARS: DB={db} | BE={be_path} | FE={fe_path}
DONE: [{archivos_completados}]
DEPS: [{dependencias_ok}]
[/HERENCIA-CTX]
```

### Formato Ultra-Compactado (Contexto Critico)

Usar solo cuando el contexto esta muy limitado:

```
[CTX]{prj}|{lvl}|{task}|{phase}[/CTX]
VARS:{db}|{be}|{fe}
PREV:[{done}]
```

---

## EJEMPLOS PRACTICOS

### Ejemplo 1: Delegacion Formato Completo

```markdown
## HERENCIA DE CONTEXTO

### Identidad
- **Proyecto:** gamilit
- **Nivel:** STANDALONE
- **Ruta Base:** /home/isem/workspace/projects/gamilit

### Estado Actual
- **Tarea Principal:** HU-042 - Sistema de notificaciones
- **Fase CAPVED:** E (Ejecucion)
- **Agente Principal:** ORQUESTADOR

### Variables Resueltas
```yaml
DB_NAME: "gamilit_platform"
DB_DDL_PATH: "apps/database/ddl"
BACKEND_ROOT: "apps/backend"
BACKEND_SRC: "apps/backend/src"
```

### Aliases Relevantes
```yaml
@DDL: "/home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/"
@BACKEND: "/home/isem/workspace/projects/gamilit/apps/backend/src/modules/"
@INV_DB: "/home/isem/workspace/projects/gamilit/orchestration/inventarios/DATABASE_INVENTORY.yml"
```

### Trabajo Previo
- Creados: docs/042-notificaciones-spec.md
- Modificados: ninguno
- Dependencias: DDL auth_management.users completado

### Tu Tarea Especifica
Crear tabla `notifications` en schema `notification_system` segun spec en docs/042-notificaciones-spec.md

### Criterios de Aceptacion
- [ ] DDL creado en schemas/notification_system/
- [ ] Carga limpia exitosa
- [ ] DATABASE_INVENTORY.yml actualizado
```

### Ejemplo 2: Delegacion Formato Compactado

```
[HERENCIA-CTX]
PRJ: gamilit | LVL: STANDALONE | BASE: /home/isem/workspace/projects/gamilit
TASK: HU-042 | PHASE: E | PARENT: ORQUESTADOR
VARS: DB=gamilit_platform | BE=apps/backend/src | DDL=apps/database/ddl
DONE: [docs/042-spec.md]
DEPS: [auth_management.users]
[/HERENCIA-CTX]

## Tarea
Crear tabla notifications en notification_system segun docs/042-spec.md

## Criterios
- DDL en schemas/notification_system/
- Carga limpia pasa
- Inventario actualizado
```

### Ejemplo 3: Formato Ultra-Compactado

```
[CTX]gamilit|STANDALONE|HU-042|E[/CTX]
VARS:gamilit_platform|apps/backend/src|apps/database/ddl
PREV:[docs/042-spec.md]

TASK: Crear tabla notifications (notification_system)
OK_IF: DDL+carga_limpia+inventario
```

---

## DECISION DE FORMATO

```yaml
USAR_FORMATO_COMPLETO:
  cuando:
    - "Es primera delegacion de la sesion"
    - "Subagente inicia conversacion nueva"
    - "Tarea es compleja (multiples archivos)"
    - "Hay muchas dependencias o trabajo previo"
  tokens: ~500-1000

USAR_FORMATO_COMPACTADO:
  cuando:
    - "Conversacion ya tiene contexto previo"
    - "Tarea es especifica y acotada"
    - "Se quiere ahorrar tokens"
  tokens: ~150-300

USAR_FORMATO_ULTRA_COMPACTADO:
  cuando:
    - "Contexto esta al limite"
    - "Tarea es muy especifica (1 archivo)"
    - "Subagente ya tiene contexto del proyecto"
  tokens: ~50-100
```

---

## CHECKLIST DE HERENCIA

### Antes de Delegar

```markdown
## Checklist de Herencia de Contexto

### Contexto Obligatorio
- [ ] Proyecto identificado (nombre, nivel, ruta)
- [ ] Estado actual documentado (tarea, fase, agente)
- [ ] Variables resueltas incluidas
- [ ] Aliases relevantes resueltos
- [ ] Trabajo previo listado

### Formato Apropiado
- [ ] Formato seleccionado segun contexto disponible
- [ ] Tokens estimados dentro de limite (max 1000 para completo)
- [ ] Informacion critica no omitida

### Tarea Clara
- [ ] Descripcion especifica incluida
- [ ] Criterios de aceptacion definidos
- [ ] Archivos esperados listados

### Validacion
- [ ] Subagente puede ejecutar CCA con esta informacion
- [ ] No hay referencias a archivos que no existen
- [ ] Variables no tienen placeholders sin resolver
```

### Al Recibir Herencia (Subagente)

```markdown
## Checklist de Recepcion de Contexto

### Verificacion Inicial
- [ ] Proyecto identificado correctamente
- [ ] Ruta base accesible
- [ ] Variables tienen valores reales (no placeholders)

### Carga Complementaria (CCA)
- [ ] Principios fundamentales cargados
- [ ] Mi perfil cargado
- [ ] SIMCO de operacion cargado
- [ ] SIMCO de dominio cargado
- [ ] Inventario relevante consultado

### Contexto Completo
- [ ] Tengo toda la informacion para ejecutar
- [ ] No necesito asumir valores
- [ ] Puedo iniciar trabajo
```

---

## ANTI-PATRONES DE HERENCIA

### 1. Herencia Excesiva
```yaml
problema: "Pasar todo el contexto del agente principal"
consecuencia: "Desperdicio de tokens, confusion"
solucion: "Solo heredar contexto obligatorio"
```

### 2. Herencia Insuficiente
```yaml
problema: "Omitir variables o aliases criticos"
consecuencia: "Subagente alucina o falla"
solucion: "Usar checklist de herencia"
```

### 3. Variables Sin Resolver
```yaml
problema: "Pasar {DB_NAME} en lugar de 'gamilit_platform'"
consecuencia: "Subagente no puede ejecutar"
solucion: "Resolver TODAS las variables antes de delegar"
```

### 4. Formato Incorrecto
```yaml
problema: "Usar formato completo cuando hay poco contexto"
consecuencia: "Desperdicio de tokens criticos"
solucion: "Elegir formato segun disponibilidad de tokens"
```

### 5. Estado Desactualizado
```yaml
problema: "Heredar trabajo previo desactualizado"
consecuencia: "Subagente trabaja con informacion erronea"
solucion: "Actualizar estado antes de delegar"
```

---

## FORMATO GCA (Recomendado)

El sistema GCA introduce un formato de herencia ultra-compacto optimizado para tokens:

### Formato GCA-CTX

```
[GCA-CTX]
PRJ:{proyecto}|LVL:{nivel}|AGENT:{tipo}
REFS:@DDL→{path}|@BACKEND→{path}|@INV→{path}
TRACE:SESSION-TRACE-{fecha}.yml
PREV:{resumen_tareas_previas}
[/GCA-CTX]

## Tarea
{descripcion_tarea}

## Criterios
- {criterio_1}
- {criterio_2}
```

### Ejemplo GCA

```
[GCA-CTX]
PRJ:gamilit|LVL:STANDALONE|AGENT:DATABASE
REFS:@DDL→apps/database/ddl|@INV→orchestration/inventarios/DATABASE_INVENTORY.yml
TRACE:SESSION-TRACE-2026-01-20.yml
PREV:HU-042(spec_ok)
[/GCA-CTX]

## Tarea
Crear tabla notifications en schema notification_system

## Criterios
- DDL en schemas/notification_system/tables/
- Carga limpia exitosa
- Inventario actualizado
```

### Comparativa de Tokens

| Formato | Tokens | Uso |
|---------|--------|-----|
| Completo | ~500-1000 | Primera delegacion, tarea compleja |
| Compactado | ~150-300 | Conversacion con contexto previo |
| Ultra-compactado | ~50-100 | Contexto muy limitado |
| **GCA** | **~100-150** | **Recomendado con sistema GCA** |

### Cuando Usar GCA

```yaml
USAR_GCA_CUANDO:
  - "Orquestador usa sistema GCA"
  - "SESSION-TRACE disponible"
  - "Subagente puede consultar trace si necesita mas contexto"

NO_USAR_GCA_SI:
  - "Sistema GCA no implementado en proyecto"
  - "Subagente no tiene acceso a SESSION-TRACE"
```

---

## INTEGRACION CON SISTEMA NEXUS

### Referencias

| Documento | Relacion |
|-----------|----------|
| @GCA (SIMCO-CONTEXT-MANAGEMENT.md) | Sistema GCA completo |
| CONTEXT-LAYER-MAP.yml | Definicion de capas GCA |
| @DELEGAR (SIMCO-DELEGACION.md) | Proceso completo de delegacion |
| TEMPLATE-DELEGACION-SUBAGENTE.md | Template detallado para delegacion |
| TEMPLATE-CONTEXTO-SUBAGENTE.md | Template de contexto para subagente |
| @CTX_ENG (SIMCO-CONTEXT-ENGINEERING.md) | Principios de context engineering |
| @CCA (SIMCO-INICIALIZACION.md) | Proceso de carga de contexto |

### Alias

```yaml
"@TPL_HERENCIA_CTX": "TEMPLATE-HERENCIA-CONTEXTO.md"
"@HERENCIA": "Formato de herencia de contexto"
"@HERENCIA_GCA": "Formato GCA de herencia"
```

---

## REFERENCIAS

- **Sistema GCA:** @GCA (SIMCO-CONTEXT-MANAGEMENT.md)
- **Capas GCA:** CONTEXT-LAYER-MAP.yml
- **Delegacion completa:** @DELEGAR (SIMCO-DELEGACION.md)
- **Context Engineering:** @CTX_ENG (SIMCO-CONTEXT-ENGINEERING.md)
- **Inicializacion:** @CCA (SIMCO-INICIALIZACION.md)
- **Template delegacion:** TEMPLATE-DELEGACION-SUBAGENTE.md

---

**Version:** 1.1.0 | **Sistema:** SIMCO + Context Engineering + GCA | **Tipo:** Template de Herencia
