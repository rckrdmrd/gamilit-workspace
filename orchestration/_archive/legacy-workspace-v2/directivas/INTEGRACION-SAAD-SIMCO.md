# INTEGRACION SAAD-SIMCO

**Version:** 1.0.0
**Fecha:** 2026-01-10
**Proposito:** Documentar como SAAD y SIMCO trabajan juntos

---

## RESUMEN

Este documento explica la relacion entre:
- **SAAD** (Sistema de Activacion Automatica de Directivas)
- **SIMCO** (Sistema de Informacion y Gestion Coherente)

```
SAAD = CUANDO activar directivas (automatizacion)
SIMCO = QUE hacer en cada directiva (instrucciones)
```

---

## ARQUITECTURA DE INTEGRACION

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE TRABAJO                               │
└─────────────────────────────────────────────────────────────────────────┘

Usuario: "@FULL Implementar feature X en proyecto Y"
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          CAPA SAAD                                       │
│  ┌─────────────────┐                                                     │
│  │  CLAUDE.md      │──► Instrucciones base (auto-cargado)               │
│  └────────┬────────┘                                                     │
│           │                                                              │
│  ┌────────▼────────┐    ┌─────────────────┐                             │
│  │ META-ORQUESTADOR│───►│ Detectar Nivel  │──► NIVEL 2A                 │
│  └────────┬────────┘    └─────────────────┘                             │
│           │                                                              │
│  ┌────────▼────────┐    ┌─────────────────┐                             │
│  │ Seleccionar Modo│───►│ MODE-FULL       │──► Ciclo CAPVED             │
│  └────────┬────────┘    └─────────────────┘                             │
│           │                                                              │
│  ┌────────▼────────┐    ┌─────────────────┐                             │
│  │ Activar Triggers│───►│ ANTI-DUPLICACION│                             │
│  └────────┬────────┘    │ ANALISIS-DEPS   │                             │
│           │             └─────────────────┘                             │
└───────────┼─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          CAPA SIMCO                                      │
│                                                                          │
│  FASE C (Contexto):                                                      │
│    └─► SIMCO-INICIALIZACION.md                                          │
│    └─► CONTEXTO-PROYECTO.md del proyecto                                │
│                                                                          │
│  FASE A (Analisis):                                                      │
│    └─► SIMCO-BUSCAR.md (si investigar)                                  │
│    └─► SIMCO-CREAR.md (si crear)                                        │
│    └─► SIMCO-MODIFICAR.md (si modificar)                                │
│    └─► TRIGGER-ANTI-DUPLICACION.md (automatico)                         │
│                                                                          │
│  FASE P (Planeacion):                                                    │
│    └─► SIMCO-TAREA.md (desglose)                                        │
│    └─► SIMCO-DELEGACION.md (si subagentes)                              │
│                                                                          │
│  FASE V (Validacion):                                                    │
│    └─► SIMCO-VALIDAR.md                                                 │
│                                                                          │
│  FASE E (Ejecucion):                                                     │
│    └─► SIMCO-{DOMINIO}.md (DDL, BACKEND, FRONTEND, etc.)                │
│    └─► SIMCO-ALINEACION.md (si sincronizar capas)                       │
│                                                                          │
│  FASE D (Documentacion):                                                 │
│    └─► SIMCO-DOCUMENTAR.md                                              │
│    └─► SIMCO-INVENTARIOS.md                                             │
│    └─► TRIGGER-PROPAGACION-AUTOMATICA.md (automatico)                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## COMPONENTES SAAD

| Componente | Ubicacion | Funcion |
|------------|-----------|---------|
| CLAUDE.md | `/CLAUDE.md` | Instrucciones base, auto-carga al inicio |
| Modos | `directivas/modos/` | 4 modos de ejecucion predefinidos |
| Triggers | `directivas/triggers/` | 4 verificaciones automaticas |
| Meta-Orquestador | `agents/perfiles/` | Agente coordinador del sistema |
| Invocaciones | `referencias/INVOCACIONES.yml` | Aliases de invocacion rapida |

### Modos de Ejecucion

| Modo | Alias | Fases CAPVED | Cuando Usar |
|------|-------|--------------|-------------|
| MODE-FULL | @FULL | C-A-P-V-E-D | Features, bugs, refactoring |
| MODE-QUICK | @QUICK | E-D | Typos, config minor |
| MODE-ANALYSIS | @ANALYSIS | C-A-P | Investigacion sin modificar |
| MODE-PROPAGATION | @PROPAGATE | C-A-P-V-E-D | Propagar entre proyectos |

### Triggers Automaticos

| Trigger | Se Activa | Directiva SIMCO Relacionada |
|---------|-----------|----------------------------|
| ANTI-DUPLICACION | Al crear nuevo objeto | SIMCO-CREAR, SIMCO-REUTILIZAR |
| ANALISIS-DEPENDENCIAS | Al modificar archivo | SIMCO-MODIFICAR, SIMCO-ALINEACION |
| PROPAGACION-AUTOMATICA | Al completar tarea | SIMCO-PROPAGACION |
| DUPLICADOS | Al consolidar duplicados | SIMCO-MODIFICAR |

---

## COMPONENTES SIMCO

| Tipo | Cantidad | Ubicacion |
|------|----------|-----------|
| Principios | 6 | `directivas/principios/` |
| Directivas por Operacion | ~15 | `directivas/simco/SIMCO-{OPERACION}.md` |
| Directivas por Dominio | ~10 | `directivas/simco/SIMCO-{DOMINIO}.md` |
| Directivas de Referencia | ~10 | `directivas/simco/SIMCO-{REFERENCIA}.md` |
| Patrones | ~10 | `patrones/PATRON-{NOMBRE}.md` |

### 6 Principios Fundamentales

1. **PRINCIPIO-CAPVED.md** - Ciclo de vida de tareas
2. **PRINCIPIO-DOC-PRIMERO.md** - Documentacion antes de codigo
3. **PRINCIPIO-ANTI-DUPLICACION.md** - Verificar catalogo
4. **PRINCIPIO-VALIDACION-OBLIGATORIA.md** - Build/lint deben pasar
5. **PRINCIPIO-ECONOMIA-TOKENS.md** - Limites de contexto
6. **PRINCIPIO-NO-ASUMIR.md** - Preguntar si falta info

---

## MAPEO SAAD → SIMCO

### Por Fase CAPVED

```yaml
FASE_C_CONTEXTO:
  saad_activa:
    - CLAUDE.md (auto)
    - Meta-Orquestador (analiza tarea)
  simco_carga:
    - SIMCO-INICIALIZACION.md
    - SIMCO-NIVELES.md
    - CONTEXTO-PROYECTO.md

FASE_A_ANALISIS:
  saad_activa:
    - TRIGGER-ANTI-DUPLICACION (si crear)
    - TRIGGER-ANALISIS-DEPENDENCIAS (si modificar)
    - TRIGGER-DUPLICADOS (si consolidar)
  simco_carga:
    - SIMCO-BUSCAR.md
    - SIMCO-CREAR.md o SIMCO-MODIFICAR.md
    - SIMCO-ALINEACION.md (si multicapa)

FASE_P_PLANEACION:
  saad_activa:
    - Meta-Orquestador (asigna perfiles)
  simco_carga:
    - SIMCO-TAREA.md
    - SIMCO-DELEGACION.md (si subagentes)
    - SIMCO-ASIGNACION-PERFILES.md

FASE_V_VALIDACION:
  saad_activa:
    - Ninguno (fase NO delegable)
  simco_carga:
    - SIMCO-VALIDAR.md
    - SIMCO-DECISION-MATRIZ.md (si ambiguo)

FASE_E_EJECUCION:
  saad_activa:
    - Modos especificos si cambia contexto
  simco_carga:
    - SIMCO-{DOMINIO}.md segun capa
    - SIMCO-ALINEACION.md (si sincronizar)
    - PATRON-{NOMBRE}.md segun necesidad

FASE_D_DOCUMENTACION:
  saad_activa:
    - TRIGGER-PROPAGACION-AUTOMATICA
  simco_carga:
    - SIMCO-DOCUMENTAR.md
    - SIMCO-INVENTARIOS.md
    - SIMCO-PROPAGACION.md (si jerarquico)
```

### Por Operacion Segura

```yaml
CREATE_SAFE:
  alias: "@CREATE-SAFE"
  triggers_activados:
    - TRIGGER-ANTI-DUPLICACION
  simco_obligatorio:
    - SIMCO-CREAR.md
    - SIMCO-REUTILIZAR.md (verificar catalogo)
    - SIMCO-CONTRIBUIR-CATALOGO.md (si reutilizable)

MODIFY_SAFE:
  alias: "@MODIFY-SAFE"
  triggers_activados:
    - TRIGGER-ANALISIS-DEPENDENCIAS
  simco_obligatorio:
    - SIMCO-MODIFICAR.md
    - SIMCO-ALINEACION.md (si afecta otras capas)

DELETE_SAFE:
  alias: "@DELETE-SAFE"
  triggers_activados:
    - TRIGGER-DUPLICADOS
    - TRIGGER-ANALISIS-DEPENDENCIAS
  simco_obligatorio:
    - SIMCO-MODIFICAR.md (consolidar antes de eliminar)
    - SIMCO-VALIDAR.md (verificar no rompe nada)
```

---

## FLUJO POR TIPO DE TAREA

### Nueva Feature

```
Usuario: @FULL Implementar modulo de reportes en proyecto X
         │
         ▼
SAAD: Activa MODE-FULL
      │
      ├─► TRIGGER-ANTI-DUPLICACION (Fase A)
      │   └─► Buscar en catalogo, inventario, archivos similares
      │
      └─► TRIGGER-PROPAGACION-AUTOMATICA (Fase D)
          └─► Evaluar si propagar a otros proyectos
         │
         ▼
SIMCO: Ejecuta secuencia:
      │
      ├─► SIMCO-INICIALIZACION (C)
      ├─► SIMCO-BUSCAR + SIMCO-CREAR (A)
      ├─► SIMCO-TAREA + SIMCO-DELEGACION (P)
      ├─► SIMCO-VALIDAR (V)
      ├─► SIMCO-BACKEND/FRONTEND/DDL (E)
      └─► SIMCO-DOCUMENTAR + SIMCO-INVENTARIOS (D)
```

### Bug Fix

```
Usuario: @FULL Corregir error de validacion en formulario
         │
         ▼
SAAD: Activa MODE-FULL
      │
      └─► TRIGGER-ANALISIS-DEPENDENCIAS (Fase A)
          └─► Identificar archivos afectados, impacto
         │
         ▼
SIMCO: Ejecuta secuencia:
      │
      ├─► SIMCO-INICIALIZACION (C)
      ├─► SIMCO-BUSCAR + SIMCO-MODIFICAR (A)
      ├─► SIMCO-TAREA (P)
      ├─► SIMCO-VALIDAR (V)
      ├─► SIMCO-{DOMINIO} (E)
      └─► SIMCO-DOCUMENTAR (D)
```

### Typo Fix

```
Usuario: @QUICK Corregir typo en README
         │
         ▼
SAAD: Activa MODE-QUICK (solo E+D)
      │
      └─► Sin triggers (escalar a FULL si falla build)
         │
         ▼
SIMCO: Ejecuta secuencia reducida:
      │
      ├─► (E) Modificar archivo directamente
      └─► (D) Commit con mensaje apropiado
```

### Investigacion

```
Usuario: @ANALYSIS Por que es lento el modulo de inventario?
         │
         ▼
SAAD: Activa MODE-ANALYSIS (solo C+A+P)
      │
      └─► TRIGGER-ANALISIS-DEPENDENCIAS
          └─► Generar mapa de dependencias
         │
         ▼
SIMCO: Ejecuta secuencia parcial:
      │
      ├─► SIMCO-INICIALIZACION (C)
      ├─► SIMCO-BUSCAR (A)
      └─► Generar reporte/recomendaciones (P)

Resultado: Documento de analisis, NO codigo
```

### Propagacion ERP

```
Usuario: @PROPAGATE-ERP Distribuir fix de auth a verticales
         │
         ▼
SAAD: Activa MODE-PROPAGATION
      │
      ├─► Identifica: erp-core → verticales
      └─► TRIGGER-PROPAGACION-AUTOMATICA
          └─► Aplica matriz de propagacion
         │
         ▼
SIMCO: Para cada vertical:
      │
      ├─► SIMCO-PROPAGACION.md
      ├─► SIMCO-ALINEACION.md
      └─► SIMCO-VALIDAR.md
```

---

## REGLAS DE PRECEDENCIA

### Cuando SAAD y SIMCO Indican Diferente

```yaml
regla_1:
  descripcion: "SIMCO define el QUE, SAAD define el CUANDO"
  ejemplo: "Si SIMCO-CREAR dice validar catalogo, SAAD puede automatizar esa validacion"

regla_2:
  descripcion: "Principios SIMCO tienen MAXIMA prioridad"
  ejemplo: "Aunque MODE-QUICK salte fases, PRINCIPIO-VALIDACION sigue aplicando"

regla_3:
  descripcion: "Triggers pueden escalar modo"
  ejemplo: "MODE-QUICK puede escalar a MODE-FULL si trigger detecta problema"

regla_4:
  descripcion: "Perfil del agente determina directivas SIMCO"
  ejemplo: "@PERFIL_BACKEND solo carga SIMCO-BACKEND, no SIMCO-FRONTEND"
```

---

## EXTENSION: Agregar Nuevo Trigger

Para agregar un nuevo trigger SAAD que se integre con SIMCO:

```yaml
# 1. Crear archivo en directivas/triggers/

nombre: TRIGGER-NUEVO.md
fase_capved: "{fase donde activa}"
condiciones_activacion:
  - "{condicion 1}"
  - "{condicion 2}"

# 2. Vincular con directivas SIMCO

simco_relacionadas:
  - "SIMCO-{DIRECTIVA}.md"   # Que directiva ejecuta
  - "PATRON-{PATRON}.md"     # Que patron aplica

# 3. Agregar a _INDEX.md de triggers

# 4. Actualizar INVOCACIONES.yml si crea alias

# 5. Actualizar este documento (INTEGRACION-SAAD-SIMCO.md)
```

---

## EXTENSION: Agregar Nueva Directiva SIMCO

Para que una nueva directiva SIMCO funcione con SAAD:

```yaml
# 1. Crear archivo en directivas/simco/

nombre: SIMCO-NUEVA.md
tipo: "operacion | dominio | referencia"

# 2. Definir en que fase CAPVED aplica

fases_capved: [A, E]   # Ejemplo: aplica en Analisis y Ejecucion

# 3. Indicar que triggers la activan

triggers_relacionados:
  - TRIGGER-{NOMBRE}

# 4. Agregar a MATRIZ-PERFIL-DIRECTIVAS.yml

perfiles_que_la_usan:
  - "@PERFIL_X"
  - "@PERFIL_Y"

# 5. Agregar a _INDEX.md de simco

# 6. Actualizar este documento si es critica
```

---

## REFERENCIAS

- **SAAD-README.md** - Documentacion completa de SAAD
- **directivas/simco/_INDEX.md** - Indice de directivas SIMCO
- **directivas/modos/_INDEX.md** - Indice de modos SAAD
- **directivas/triggers/_INDEX.md** - Indice de triggers
- **referencias/MATRIZ-PERFIL-DIRECTIVAS.yml** - Mapeo perfil → directivas
- **referencias/INVOCACIONES.yml** - Aliases de invocacion

---

**Version:** 1.0.0 | **Sistema:** SAAD + SIMCO | **Tipo:** Documento de Integracion
