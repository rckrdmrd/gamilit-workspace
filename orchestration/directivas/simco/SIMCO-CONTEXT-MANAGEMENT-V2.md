# SIMCO-CONTEXT-MANAGEMENT-V2.md

**Sistema:** NEXUS v4.1 - Gestion de Contexto Jerarquico con Checkpoints
**Version:** 2.3.0
**Fecha:** 2026-02-17
**Basado en:** Implementacion probada en Gamilit
**Actualizado:** Sistema de checkpoints automáticos integrado

---

## 1. Proposito

Esta directiva establece el sistema **NEXUS v4.1** para gestion de contexto en el workspace.
NEXUS (Next-generation EXecution Understanding System) resuelve:

- **Sobrecarga de contexto:** Tokens limitados desperdiciados en informacion irrelevante
- **Perdida de estado:** Compactaciones destruyen contexto critico
- **Ambiguedad en delegacion:** Subagentes reciben contexto incompleto
- **Recuperacion lenta:** Reiniciar sesion requiere reconstruir todo manualmente

---

## 1.1 Glosario operativo y fuente de verdad

| Concepto | Definicion operativa | Fuente de verdad |
|----------|----------------------|------------------|
| IoC de contexto | El sistema (mapa + triggers + protocolos) decide que cargar y cuando limpiar | `orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md` |
| CMV | Minimo de contexto para evitar alucinaciones | `orchestration/directivas/simco/SIMCO-CONTEXT-ENGINEERING.md` |
| L0-L3 | Jerarquia de carga por niveles (sistema, proyecto, operacion, tarea) | `orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md` |
| ACTIVE/REFERENCE/STALE/OUTPUT | Clasificacion para limpieza mid-session | `orchestration/directivas/simco/SIMCO-CONTEXT-CLEANUP.md` |
| Delegacion | Transferencia controlada de subtarea a subagente con contrato de entrada/salida | `orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md` + `SIMCO-DELEGACION.md` |
| Recovery | Recuperacion de continuidad tras compactacion o reinicio | `orchestration/directivas/simco/SIMCO-CONTEXT-ENGINEERING.md` + `SIMCO-CONTEXT-MANAGEMENT-V2.md` |
| Subagente | Agente delegado con ventana de contexto aislada del orquestador | `orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md` |

### Regla de normalizacion documental

- Cada concepto debe tener **una definicion principal** y referencias cruzadas.
- Si una directiva necesita reutilizar definicion, debe enlazar la fuente de verdad en lugar de duplicarla.
- Las secciones operativas deben describir comportamiento verificable, no capacidades hipoteticas de la plataforma.

## 1.2 Matriz de coherencia entre directivas

| Tema | Define | Operacionaliza | Valida |
|------|--------|----------------|--------|
| Arquitectura L0-L3 | `SIMCO-CONTEXT-MANAGEMENT-V2.md` | `CONTEXT-MAP.yml` | Checklist de implementacion |
| Carga eficiente y CMV | `SIMCO-CONTEXT-ENGINEERING.md` | BOOTLOADER + carga lazy | Simulaciones de escritorio |
| Limpieza de contexto | `SIMCO-CONTEXT-CLEANUP.md` | Triggers `post_5_files`, `post_subtarea`, `pre_delegacion` | Metricas de liberacion |
| Delegacion de subagentes | `SIMCO-CONTEXT-MANAGEMENT-V2.md` | Secciones por plataforma/agente | Contrato de retorno |
| Recovery de sesion | `SIMCO-CONTEXT-ENGINEERING.md` | `PROXIMA-ACCION.md` + flujo de recuperacion | Tiempo/precision de recuperacion |

### Contradicciones detectadas y resueltas en v2.3.0

| ID | Severidad | Hallazgo | Resolucion aplicada |
|----|-----------|----------|---------------------|
| GAP-1 | Critico | No existia seccion explicita para subagentes de Claude Code | Se agrega `8.5 Claude Code Task tool` con contrato completo |
| GAP-2 | Medio | `Reference-Not-Content` formulado como purga directa de ventana | Se adapta a limpieza indirecta basada en aislamiento de subagentes |
| GAP-3 | Menor | `DIRECTIVA-CARGA-CONTEXTO.md` en posible desalineacion de arquitectura | Se depreca con redireccion explicita a NEXUS v4.1 |
| GAP-4 | Menor | `CONTEXT-MAP.yml` no resolvia tareas documentales | Se agrega mapping de `documentacion` y keywords de validacion |

---

## 2. Arquitectura de 4 Niveles

```
┌─────────────────────────────────────────────────────────────────────┐
│ NIVEL 0 - SISTEMA (Workspace)                                       │
│ ═══════════════════════════════════════════════════════════════════ │
│ • CLAUDE.md, SIMCO-TAREA.md, PRINCIPIO-CAPVED.md                   │
│ • Directivas globales, triggers, politicas                          │
│ • Presupuesto: 8,000 tokens base                                    │
│ • Carga: SIEMPRE (automatica)                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ NIVEL 1 - PROYECTO                                                   │
│ ═══════════════════════════════════════════════════════════════════ │
│ • PROJECT-CONTEXT.md, PROXIMA-ACCION.md, MASTER_INVENTORY.yml    │
│ • Variables del proyecto, stack, convenciones                       │
│ • Presupuesto: 5,000 tokens                                         │
│ • Carga: Al iniciar trabajo en proyecto                             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ NIVEL 2 - OPERACION (Dominio)                                        │
│ ═══════════════════════════════════════════════════════════════════ │
│ • SIMCO-DDL.md, SIMCO-BACKEND.md, SIMCO-FRONTEND.md                │
│ • Inventario del dominio (DATABASE_, BACKEND_, FRONTEND_)          │
│ • Presupuesto: 4,000 tokens                                         │
│ • Carga: Segun dominio de la tarea                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ NIVEL 3 - TAREA (Dinamico)                                           │
│ ═══════════════════════════════════════════════════════════════════ │
│ • Archivos especificos de la tarea actual                           │
│ • Dependencias directas, tests relacionados                         │
│ • Presupuesto: 3,000 tokens                                         │
│ • Carga: Bajo demanda, purga al completar subtarea                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Presupuesto de Tokens

### 3.1 Distribucion Base

| Nivel | Nombre | Tokens | Porcentaje | Persistencia |
|-------|--------|--------|------------|--------------|
| L0 | Sistema | 8,000 | 40% | Siempre |
| L1 | Proyecto | 5,000 | 25% | Por proyecto |
| L2 | Operacion | 4,000 | 20% | Por dominio |
| L3 | Tarea | 3,000 | 15% | Dinamico |
| **Total** | | **20,000** | **100%** | |

> **NOTA (v2.2.0):** Los 20,000 tokens del presupuesto L0-L3 representan el ~10% de overhead
> de contexto sobre la ventana real de 200K tokens de Claude. Los 180K restantes son espacio
> de TRABAJO disponible para el agente. Ver `SIMCO-CONTROL-TOKENS.md` v2.0.0 para limites
> actualizados por modelo.

### 3.2 Reglas de Presupuesto

```yaml
reglas_presupuesto:
  L0_sistema:
    maximo: 8000
    obligatorio: true
    nunca_purgar: true

  L1_proyecto:
    maximo: 5000
    obligatorio: true
    purgar_al_cambiar_proyecto: true

  L2_operacion:
    maximo: 4000
    obligatorio: false
    purgar_al_cambiar_dominio: true

  L3_tarea:
    maximo: 3000
    obligatorio: false
    purgar_al_completar_subtarea: true

  umbral_alerta: 18000  # 90% de 20,000
  umbral_critico: 19500 # 97.5% - iniciar purga
```

---

## 4. Componentes del Sistema

### 4.1 CONTEXT-MAP.yml

Archivo central que mapea keywords a contexto.

```yaml
# orchestration/CONTEXT-MAP.yml
version: "1.0.0"

niveles:
  L0_sistema:
    archivos:
      - path: CLAUDE.md
        tokens_estimados: 4000
        keywords: [workspace, reglas, aliases]
      - path: orchestration/directivas/simco/SIMCO-TAREA.md
        tokens_estimados: 1500
        keywords: [tarea, capved, fases]

  L1_proyecto:
    por_proyecto:
      gamilit:
        archivos:
          - path: orchestration/PROJECT-CONTEXT.md
            keywords: [gamilit, plataforma, gamificacion]

resoluciones:
  # Keyword -> archivos a cargar automaticamente
  ddl: [SIMCO-DDL.md, DATABASE_INVENTORY.yml]
  backend: [SIMCO-BACKEND.md, BACKEND_INVENTORY.yml]
  frontend: [SIMCO-FRONTEND.md, FRONTEND_INVENTORY.yml]
```

### 4.2 PROXIMA-ACCION.md

Checkpoint de sesion que persiste estado critico.

```markdown
# PROXIMA-ACCION.md

## Estado Actual
- **Proyecto:** {nombre}
- **Tarea Activa:** {TASK-ID}
- **Fase CAPVED:** {C|A|P|V|E|D}
- **Subtarea:** {descripcion}

## Contexto Critico
- Ultimo archivo modificado: {path}
- Dependencias pendientes: {lista}
- Bloqueos conocidos: {lista}

## Siguiente Paso
{Descripcion clara de la proxima accion a ejecutar}

## Para Recuperar Sesion
1. Cargar: {archivos necesarios}
2. Verificar: {estado a validar}
3. Continuar: {desde donde}
```

### 4.3 BOOTLOADER Protocol

Secuencia de arranque para todos los agentes.

```
BOOTLOADER - 5 Pasos de Arranque
═══════════════════════════════════

PASO 1: Cargar L0 (Sistema)
├── CLAUDE.md
├── SIMCO-TAREA.md
└── Verificar: Aliases disponibles

PASO 2: Identificar Proyecto
├── Leer tarea asignada
├── Determinar proyecto(s) afectados
└── Cargar L1 del proyecto

PASO 3: Cargar L1 (Proyecto)
├── PROJECT-CONTEXT.md
├── PROXIMA-ACCION.md
├── MASTER_INVENTORY.yml
└── Verificar: Variables del proyecto

PASO 4: Determinar Dominio
├── Clasificar tarea (DDL, Backend, Frontend, Docs)
├── Cargar L2 correspondiente
└── Verificar: SIMCO del dominio cargado

PASO 5: Iniciar Tarea
├── Crear carpeta de tarea si no existe
├── Cargar L3 segun necesidad
└── Ejecutar FASE 0 de CAPVED
```

---

## 5. Principio IoC para Contexto

### 5.1 Inversion de Control

```
ANTES (Contexto dirigido por agente):
┌────────────────────────────────────────────────┐
│ Agente decide que cargar → Sobrecarga         │
│ Agente decide cuando purgar → Compactacion    │
│ Agente reconstruye contexto → Lento           │
└────────────────────────────────────────────────┘

DESPUES (Contexto dirigido por sistema):
┌────────────────────────────────────────────────┐
│ CONTEXT-MAP resuelve que cargar → Optimo      │
│ Triggers deciden cuando purgar → Proactivo    │
│ PROXIMA-ACCION recupera estado → Rapido       │
└────────────────────────────────────────────────┘
```

### 5.2 Triggers de Purga

| Trigger | Accion | Nivel Afectado |
|---------|--------|----------------|
| POST_SUBTAREA | Purgar L3 completado | L3 |
| CAMBIO_DOMINIO | Purgar L2 anterior, cargar nuevo | L2 |
| CAMBIO_PROYECTO | Purgar L1+L2+L3, cargar nuevo L1 | L1, L2, L3 |
| UMBRAL_TOKENS | Purgar L3, evaluar L2 | L3, L2 |
| MID_SESSION_CLEANUP | Ejecutar SIMCO-CONTEXT-CLEANUP.md | L2, L3 |
| FIN_SESION | Guardar PROXIMA-ACCION | Ninguno |

### 5.3 Ciclo de Vida del Contexto

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  CARGAR  │────▶│  USAR    │────▶│ VERIFICAR│────▶│  PURGAR  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     ▲                                                   │
     │                                                   │
     └───────────────────────────────────────────────────┘
                    (Si necesario)
```

---

## 6. Resolucion Automatica de Contexto

### 6.1 Por Keywords

Cuando el agente recibe una tarea, CONTEXT-MAP resuelve automaticamente:

```yaml
# Ejemplo: "Agregar campo status a tabla users"

keywords_detectados:
  - "tabla" → ddl
  - "users" → schema_auth

resolucion:
  cargar:
    - SIMCO-DDL.md
    - DATABASE_INVENTORY.yml
    - projects/{proyecto}/database/ddl/auth/users.sql
```

### 6.2 Por Tipo de Tarea

```yaml
tipos_tarea:
  crear_tabla:
    L2: [SIMCO-DDL.md, SIMCO-CREAR.md]
    L3: [DATABASE_INVENTORY.yml, schema_existente]

  crear_entity:
    L2: [SIMCO-BACKEND.md, SIMCO-CREAR.md]
    L3: [BACKEND_INVENTORY.yml, entities_relacionadas]

  crear_componente:
    L2: [SIMCO-FRONTEND.md, SIMCO-CREAR.md]
    L3: [FRONTEND_INVENTORY.yml, components_relacionados]

  bug_fix:
    L2: [SIMCO_del_dominio_afectado]
    L3: [archivo_con_bug, tests_relacionados]
```

---

## 7. Recuperacion de Sesion

### 7.1 Flujo de Recuperacion

```
1. Detectar compactacion o reinicio
         │
         ▼
2. Leer PROXIMA-ACCION.md
         │
         ▼
3. Cargar contexto critico listado
         │
         ▼
4. Verificar estado (git status, build)
         │
         ▼
5. Continuar desde "Siguiente Paso"
```

### 7.2 Tiempo de Recuperacion

| Metodo | Tiempo | Precision |
|--------|--------|-----------|
| Sin NEXUS | 10-15 min | ~60% |
| Con NEXUS | 2-3 min | ~95% |
| Con MCP-CONTEXT | <30 seg | ~99% |

---

## 8. Integracion con Agentes

### 8.1 Claude Code

```
Al iniciar sesion:
1. Verificar PROXIMA-ACCION.md existe
2. Si existe: Recuperar sesion
3. Si no: Ejecutar BOOTLOADER

Al completar subtarea:
1. Actualizar PROXIMA-ACCION.md
2. Evaluar purga de L3
3. Registrar en traza
```

### 8.2 Gemini CLI

```
Al recibir delegacion:
1. Recibir TEMPLATE-CONTEXTO-SUBAGENTE
2. Cargar solo archivos listados
3. NO explorar mas alla de lo especificado

Al completar:
1. Reportar archivos generados
2. NO actualizar PROXIMA-ACCION (solo orquestador)

Restricciones reales (ver SIMCO-PLATFORM-CONSTRAINTS.md):
- Max 2 sesiones paralelas (429 rate limit si > 2)
- Foreground only en Windows (background produce output vacio)
- Paths: _products NO se convierte en products — usar rutas completas
- Conteos NO confiables — siempre verificar con filesystem
```

### 8.3 Trae

```
Al analizar:
1. Respetar presupuesto de tokens
2. Usar CONTEXT-MAP para resolver referencias
3. Generar plan atomico dentro de limites

Al generar plan:
1. Incluir solo contexto necesario
2. Especificar archivos exactos
3. NO incluir archivos "por si acaso"
```

### 8.4 Windsurf

```
Al ejecutar:
1. Recibir instrucciones literales
2. NO cargar contexto adicional
3. Ejecutar exactamente lo especificado

Al reportar:
1. Lista de archivos modificados
2. Errores encontrados
3. NO interpretaciones
```

### 8.5 Claude Code Task tool

```
Objetivo:
Estandarizar la delegacion a subagentes de Claude Code (Task) con IoC realista.

Principio clave:
- Cada subagente tiene ventana de contexto independiente.
- El prompt de delegacion es su contexto completo inicial.
- El orquestador recibe resumen estructurado, no dump de contenido.
```

#### Entrada minima obligatoria al subagente

```yaml
entrada_subagente:
  identidad:
    - objetivo_de_la_subtarea
    - criterio_de_exito
  contexto_minimo:
    - rutas exactas de archivos a leer
    - restricciones de alcance ("NO explorar fuera de ...")
    - decisiones previas que no se deben romper
  operacion:
    - tipo_tarea: [analisis, implementacion, validacion]
    - artefacto_esperado: [resumen, parche, checklist]
  control:
    - formato_de_salida requerido
    - riesgos a vigilar
```

#### Seleccion de modelo por complejidad

| Complejidad | Tipo de trabajo | Modelo recomendado |
|-------------|------------------|--------------------|
| Baja | Busqueda puntual, verificacion corta, checklist | Haiku |
| Media | Analisis multiarchivo acotado, cambios estandar | Sonnet |
| Alta | Diseno cross-cutting, resolucion de contradicciones | Opus |

#### Contrato de retorno (obligatorio)

```yaml
retorno_subagente:
  resumen_ejecutivo: "1-3 bullets"
  archivos_consultados:
    - path
    - uso (lectura/evidencia)
  hallazgos:
    - severidad: [critico|medio|menor]
    - descripcion
    - evidencia
  decisiones:
    - decision
    - motivo
  siguiente_paso_recomendado:
    - accion concreta
  no_incluir:
    - volcado masivo de contenido
    - texto irrelevante fuera del alcance
```

#### Anti-patrones de delegacion (Claude Code)

- Prompt ambiguo sin objetivo verificable.
- Delegar con rutas incompletas o sin restricciones.
- Pedir "leer todo el repo" sin criterio.
- Retornar contenido crudo sin sintesis accionable.
- Repetir lectura de archivos ya validados por el orquestador.

---

## 9. Metricas y Monitoreo

### 9.1 Metricas Clave

| Metrica | Objetivo | Alerta |
|---------|----------|--------|
| Tokens usados | < 18,000 | > 18,000 |
| Compactaciones/sesion | < 1 | > 2 |
| Tiempo recuperacion | < 3 min | > 5 min |
| Precision recuperacion | > 95% | < 90% |

### 9.2 Registro de Uso

```yaml
# orchestration/trazas/CONTEXT-USAGE-LOG.yml
sesiones:
  - fecha: 2026-01-24
    agente: CLAUDE-CODE
    tokens_pico: 17500
    compactaciones: 0
    recuperaciones: 1
    tiempo_recuperacion: "2:15"
```

---

## 10. Checklist de Implementacion

### Para Agente Principal (Orquestador)

- [ ] Verificar CONTEXT-MAP.yml existe y esta actualizado
- [ ] Verificar PROXIMA-ACCION.md tiene estado valido
- [ ] Ejecutar BOOTLOADER al iniciar
- [ ] Actualizar PROXIMA-ACCION.md al cambiar de tarea
- [ ] Monitorear uso de tokens

### Para Subagentes

- [ ] Recibir TEMPLATE-CONTEXTO-SUBAGENTE completo
- [ ] Cargar SOLO archivos especificados
- [ ] NO expandir contexto sin autorizacion
- [ ] Reportar archivos usados al completar

---

## 11. Simulaciones de escritorio (validacion)

### Escenario A: Tarea documental amplia

```yaml
entrada:
  tipo: "validacion_documental"
  alcance: "docs/ + orchestration/"
proceso_esperado:
  - resolver contexto con CONTEXT-MAP
  - delegar exploracion masiva a subagentes
  - consolidar resumen en orquestador
validacion:
  - no hay lectura masiva redundante en orquestador
  - hallazgos trazables por archivo
  - salida con checklist accionable
```

### Escenario B: Tarea tecnica puntual (backend/frontend)

```yaml
entrada:
  tipo: "bug_fix"
  alcance: "2-4 archivos"
proceso_esperado:
  - cargar L0 + L1 + L2 dominio
  - cargar L3 puntual
  - ejecutar validacion minima
validacion:
  - tiempo de arranque bajo
  - cambios limitados al alcance
  - retorno sin ruido documental
```

### Escenario C: Recovery tras compactacion con delegacion previa

```yaml
entrada:
  tipo: "recovery"
  evento: "compactacion inminente o reinicio"
proceso_esperado:
  - leer PROXIMA-ACCION.md
  - restaurar contexto minimo viable
  - continuar desde siguiente paso
validacion:
  - continuidad sin re-trabajo
  - precision de estado > 95%
  - sin contradiccion con delegacion previa
```

---

## 12. Criterios de cierre de gaps

| Gap | Criterio de cierre | Evidencia minima |
|-----|--------------------|------------------|
| GAP-1 | Existe `8.5 Claude Code Task tool` con entrada, modelo y retorno | Tabla/modelo + YAML de contrato |
| GAP-2 | Cleanup adaptado a restricciones reales de Claude Code | Nota operativa + metrica observable |
| GAP-3 | Directiva legacy sin ambiguedad de uso | Banner deprecado + redireccion |
| GAP-4 | `CONTEXT-MAP.yml` resuelve tareas documentales | Mapping `documentacion` + keywords |

Checklist final:
- [ ] Glosario y fuente de verdad definidos
- [ ] Matriz de coherencia actualizada
- [ ] 4 gaps cerrados con evidencia documental
- [ ] Simulaciones A/B/C definidas y verificables

---

## 13. Referencias

- `@CONTEXT-MAP` - orchestration/CONTEXT-MAP.yml
- `@PROXIMA-ACCION` - Template de checkpoint
- `@BOOTLOADER` - orchestration/directivas/simco/SIMCO-BOOTLOADER.md
- `@CONTEXT-LAYER-MAP` - orchestration/CONTEXT-LAYER-MAP.yml

---

## 14. Limites por Modelo

| Modelo | Ventana | Alerta (80%) | Seguro (75%) |
|--------|---------|--------------|--------------|
| Claude Opus 4.6 | 200K | 160K | 150K |
| Claude Sonnet 4.5 | 200K | 160K | 150K |
| Claude Haiku 4.5 | 200K | 160K | 150K |
| Gemini 3 Pro/Flash | 1M | 800K | 750K |
| Windsurf Cascade | 128K | 102K | 96K |

## 15. Triggers de Limpieza Mid-Session

| Trigger | Condicion | Accion |
|---------|-----------|--------|
| `post_5_files` | 5+ archivos leidos | Clasificar ACTIVE/REFERENCE/STALE |
| `post_subtarea` | Subtarea completada | Purgar L3 |
| `contexto_50_pct` | >50% ventana usada | Inventariar + purgar |
| `pre_delegacion` | Antes de delegar | Limpiar para subagente |
| `compactacion_inminente` | Sistema avisa | PROXIMA-ACCION + purga agresiva |

Ver: `SIMCO-CONTEXT-CLEANUP.md` para protocolo detallado.

---

*SIMCO-CONTEXT-MANAGEMENT-V2.md - Sistema NEXUS v4.1*
*Standalone Gamilit - Gestion de Contexto Jerarquico*
