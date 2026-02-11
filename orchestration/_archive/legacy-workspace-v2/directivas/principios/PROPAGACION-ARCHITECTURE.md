# PROPAGACION-ARCHITECTURE: Arquitectura de Propagacion del Workspace

**ID:** PROPAGACION-ARCHITECTURE
**Version:** 1.0.0
**Fecha:** 2026-01-13
**Autor:** CLAUDE-CAPVED

---

## Proposito

Este documento clarifica la arquitectura de propagacion del workspace, cuando usar cada mecanismo, y como se relacionan los diferentes componentes del sistema de propagacion.

---

## Jerarquia de Propagacion

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NIVELES DE PROPAGACION                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   NIVEL 0: PROVIDER                                                         │
│   ┌──────────────────┐                                                      │
│   │   template-saas  │  → Provee funcionalidades base a todos              │
│   │   (v1.2.1)       │                                                      │
│   └────────┬─────────┘                                                      │
│            │                                                                │
│            ▼                                                                │
│   NIVEL 1: INTERMEDIATE                                                     │
│   ┌──────────────────┐                                                      │
│   │    erp-core      │  → Extiende y adapta para verticales ERP            │
│   │    (v1.3.0)      │                                                      │
│   └────────┬─────────┘                                                      │
│            │                                                                │
│            ├─────────────────────────────────────────────────┐              │
│            ▼                                                 ▼              │
│   NIVEL 2: CONSUMERS                                NIVEL 2: INTERMEDIATE   │
│   ┌──────────────────┐                              ┌──────────────────┐   │
│   │ erp-construccion │                              │   erp-clinicas   │   │
│   │ erp-mecanicas    │                              │   (v1.0.0)       │   │
│   │ erp-retail       │                              └────────┬─────────┘   │
│   │ erp-vidrio       │                                       │              │
│   └──────────────────┘                                       ▼              │
│                                                    NIVEL 3: SUB-CONSUMERS  │
│                                                    ┌──────────────────┐    │
│                                                    │  clinica-dental  │    │
│                                                    │ clinica-veterina │    │
│                                                    └──────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Componentes del Sistema de Propagacion

### 1. Directivas

| Componente | Ubicacion | Proposito |
|------------|-----------|-----------|
| **MODE-PROPAGATION** | `directivas/modos/` | Modo de ejecucion para propagar cambios entre proyectos |
| **TRIGGER-PROPAGACION-AUTOMATICA** | `directivas/triggers/` | Activa automaticamente en Fase D para evaluar propagacion |
| **SIMCO-PROPAGACION** | `directivas/simco/` | Propagacion de documentacion en verticales (interno) |

### 2. Referencias

| Componente | Ubicacion | Proposito |
|------------|-----------|-----------|
| **PROPAGATION-CRITERIA-MATRIX** | `referencias/` | Matriz de criterios para decidir propagacion |
| **DEPENDENCY-GRAPH** | `orchestration/` | Grafo de dependencias entre proyectos |
| **TRACEABILITY-MASTER** | `orchestration/` | Trazabilidad centralizada del workspace |

### 3. Mirrors

| Componente | Ubicacion | Proposito |
|------------|-----------|-----------|
| **MIRRORS-INDEX** | `shared/mirrors/` | Indice de todos los repositorios espejo |
| **PROPAGATION-STATUS** | `shared/mirrors/{proyecto}/` | Estado de propagacion por proyecto |

---

## Cuando Usar Cada Mecanismo

### MODE-PROPAGATION (@PROPAGATE)

**Usar cuando:**
- Necesitas propagar un cambio especifico a multiples proyectos
- Cambio en erp-core que debe ir a verticales
- Fix de seguridad que afecta multiples proyectos
- Bug fix en modulo compartido
- Actualizacion de dependencias compartidas

**Ejemplos:**
```bash
@PROPAGATE-ERP Distribuir fix de JWT a verticales
@PROPAGATE-SECURITY Fix de vulnerabilidad XSS
@PROPAGATE-CATALOG Actualizar modulo de notificaciones
```

**Flujo:**
```
Cambio en origen → CAPVED completo → Aplicar en cada destino → Validar → Documentar
```

---

### TRIGGER-PROPAGACION-AUTOMATICA

**Usar cuando:**
- Se activa automaticamente al completar Fase D
- No lo invocas directamente, el sistema lo evalua

**Cuando se activa:**
1. Completas una tarea en proyecto con propagacion (erp-core, shared/catalog)
2. El trigger evalua tipo de cambio
3. Sugiere o inicia propagacion segun reglas

**Flujo:**
```
Tarea completada → Trigger evalua → Decide accion → Notifica o propaga
```

---

### SIMCO-PROPAGACION

**Usar cuando:**
- Propagas documentacion DENTRO de un proyecto vertical
- No es para propagacion ENTRE proyectos
- Es para estructurar documentacion de modulos heredados

**Cuando se usa:**
- Al documentar un modulo heredado en una vertical
- Para asegurar que la documentacion refleja la herencia

**NO usar para:**
- Propagar codigo entre proyectos (usar MODE-PROPAGATION)
- Propagar cambios de core a verticales (usar MODE-PROPAGATION)

---

## Flujo de Decision

```
┌─────────────────────────────────────────────────────────────────┐
│              PREGUNTA: Que necesitas propagar?                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     ┌────────────────┐            ┌─────────────────┐
     │ CODIGO/CAMBIO  │            │  DOCUMENTACION  │
     │ entre proyectos│            │ dentro de       │
     └───────┬────────┘            │ proyecto        │
             │                     └────────┬────────┘
             ▼                              │
    ┌────────────────────┐                  ▼
    │ Es security fix?   │         ┌─────────────────┐
    └─────────┬──────────┘         │ SIMCO-PROPAGACION│
              │                    │ (interno)        │
     ┌────────┴────────┐           └─────────────────┘
     ▼                 ▼
┌─────────┐      ┌─────────┐
│   SI    │      │   NO    │
└────┬────┘      └────┬────┘
     │                │
     ▼                ▼
┌──────────────┐ ┌───────────────────────┐
│ @PROPAGATE-  │ │ Es bug fix?           │
│ SECURITY     │ └───────────┬───────────┘
│ (inmediato)  │      ┌──────┴──────┐
└──────────────┘      ▼             ▼
               ┌─────────┐    ┌─────────┐
               │   SI    │    │   NO    │
               └────┬────┘    └────┬────┘
                    │              │
                    ▼              ▼
              ┌──────────────┐ ┌───────────────┐
              │ @PROPAGATE-  │ │ @PROPAGATE    │
              │ ERP          │ │ (evaluar)     │
              │ (72h SLA)    │ │               │
              └──────────────┘ └───────────────┘
```

---

## SLAs Unificados

| Tipo de Cambio | SLA | Prioridad | Accion |
|----------------|-----|-----------|--------|
| **Security Fix** | 24 horas | CRITICA | Propagar inmediatamente |
| **Bug Fix** | 72 horas | ALTA | Propagar con prioridad |
| **Feature** | 1 semana | MEDIA | Evaluar si aplica |
| **Refactor** | 2 semanas | BAJA | Opcional |
| **Documentacion** | Inmediato | N/A | Auto-sync via mirrors |
| **Definiciones** | Inmediato | N/A | Auto-sync via mirrors |

---

## Sistema de Mirrors

### Proposito
Los mirrors son repositorios espejo que facilitan la propagacion automatica de:
- Documentacion (README, CHANGELOG)
- Definiciones (YAML de modulos)
- Interfaces (TypeScript .d.ts)

### Mirrors Activos

| Mirror | Version | Consumidores |
|--------|---------|--------------|
| template-saas | 1.2.1 | erp-core |
| erp-core | 1.3.0 | 5 verticales + 2 sub-verticales |
| erp-clinicas | 1.0.0 | clinica-dental, clinica-veterinaria |

### Auto-Propagacion via Mirrors

```yaml
Tipo: Documentacion/Definiciones
Flujo:
  1. Cambio en proyecto origen
  2. Sync automatico a shared/mirrors/{proyecto}/
  3. Consumidores leen del mirror
  4. Actualizacion inmediata disponible

Tipo: Codigo
Flujo:
  1. Cambio en proyecto origen
  2. Validacion local (build+lint+tests)
  3. Propagar manualmente via MODE-PROPAGATION
  4. Actualizar PROPAGATION-STATUS.yml
```

---

## Trazabilidad

### Donde se registra cada propagacion

| Registro | Ubicacion | Contenido |
|----------|-----------|-----------|
| **TRACEABILITY-MASTER** | `orchestration/` | Registro centralizado de todas las propagaciones |
| **PROPAGATION-STATUS** | `shared/mirrors/{proyecto}/` | Estado por proyecto mirror |
| **MASTER_INVENTORY** | `{proyecto}/orchestration/inventarios/` | Referencia a ultima propagacion recibida |

### Formato de Registro

```yaml
propagacion:
  id: "PROP-CORE-002"
  fecha: "2026-01-13"
  tipo: "bulk_propagation"
  origen: "erp-core"
  destinos:
    - erp-construccion
    - erp-clinicas
    - erp-mecanicas-diesel
    - erp-retail
    - erp-vidrio-templado
  sub_destinos:
    - clinica-dental (via erp-clinicas)
    - clinica-veterinaria (via erp-clinicas)
  modulos: MGN-016 a MGN-022
  estado: "completed"
```

---

## Comandos Rapidos

| Alias | Descripcion | Ejemplo |
|-------|-------------|---------|
| `@PROPAGATE-ERP` | Propagar de erp-core a verticales | `@PROPAGATE-ERP Fix de autenticacion` |
| `@PROPAGATE-CATALOG` | Propagar cambio de catalogo | `@PROPAGATE-CATALOG Actualizar notifications` |
| `@PROPAGATE-SECURITY` | Propagacion urgente de seguridad | `@PROPAGATE-SECURITY Vulnerabilidad XSS` |
| `@SYNC-MIRRORS` | Sincronizar todos los mirrors | `@SYNC-MIRRORS` |
| `@PROPAGATE-DOC` | Propagar documentacion | `@PROPAGATE-DOC {proyecto}` |
| `@PROPAGATE-DEF` | Propagar definiciones | `@PROPAGATE-DEF {proyecto}` |
| `@PROPAGATE-CODE` | Propagar codigo validado | `@PROPAGATE-CODE {proyecto}` |

---

## Errores Comunes

### 1. Confundir MODE-PROPAGATION con SIMCO-PROPAGACION
- **MODE-PROPAGATION:** Entre proyectos (erp-core → verticales)
- **SIMCO-PROPAGACION:** Dentro de un proyecto (documentacion interna)

### 2. Propagar sin validar
- **Correcto:** Siempre ejecutar build+lint+tests antes de propagar
- **Incorrecto:** Propagar directamente sin validacion

### 3. Olvidar actualizar trazabilidad
- **Correcto:** Registrar en TRACEABILITY-MASTER y PROPAGATION-STATUS
- **Incorrecto:** Propagar sin documentar

### 4. Propagar codigo no validado
- **Documentacion/Definiciones:** OK propagar inmediatamente
- **Codigo:** SIEMPRE validar antes de propagar

---

## Referencias

- `orchestration/directivas/modos/MODE-PROPAGATION.md`
- `orchestration/directivas/triggers/TRIGGER-PROPAGACION-AUTOMATICA.md`
- `orchestration/directivas/simco/SIMCO-PROPAGACION.md`
- `orchestration/referencias/PROPAGATION-CRITERIA-MATRIX.yml`
- `docs/_SSOT/TRACEABILITY-MASTER.yml`
- `orchestration/DEPENDENCY-GRAPH.yml`
- `shared/mirrors/MIRRORS-INDEX.yml`

---

*PROPAGACION-ARCHITECTURE v1.0.0 - Sistema SAAD*
