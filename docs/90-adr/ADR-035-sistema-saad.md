# ADR-035: Adopcion del Sistema SAAD (Activacion Automatica de Directivas)

**Estado:** Accepted
**Fecha:** 2026-02-11
**Contexto:** Gobernanza SIMCO en gamilit standalone

## Contexto

Gamilit adopta el sistema de gobernanza SIMCO de workspace-arch para estandarizar el trabajo de agentes y desarrolladores. Sin un sistema de activacion automatica de directivas:

1. **Sobrecarga cognitiva:** Los agentes deben recordar manualmente que directiva cargar para cada tipo de tarea
2. **Inconsistencia:** Diferentes sesiones aplicaban diferentes subconjuntos de directivas
3. **Fases CAPVED incompletas:** Sin guia, se saltaban fases del ciclo de vida
4. **Verificaciones olvidadas:** Chequeos criticos (anti-duplicacion, dependencias, coherencia BD<->Backend) se omitian
5. **Curva de aprendizaje alta:** Nuevos colaboradores requerian conocer todo el sistema antes de ser productivos

Gamilit necesitaba un meta-sistema que automatizara la seleccion y activacion de directivas segun el contexto de la tarea.

## Decision

Adoptar el **Sistema SAAD (Sistema de Activacion Automatica de Directivas) v1.0.0** con implementacion local en el repositorio gamilit.

### Componentes Principales

| Componente | Ubicacion | Funcion |
|------------|-----------|---------|
| CLAUDE.md | `/CLAUDE.md` | Instrucciones base, auto-carga al inicio |
| Modos | `orchestration/directivas/modos/` | 3 modos de ejecucion predefinidos |
| Triggers | `orchestration/directivas/triggers/` | Verificaciones automaticas |
| Perfiles | `orchestration/agents/perfiles/` | Perfiles de agente especializados (42 perfiles) |

### 3 Modos de Ejecucion (Standalone)

```yaml
MODE_FULL:
  alias: "@FULL"
  fases_capved: [C, A, P, V, E, D]
  uso: "Features, bugs, refactoring, cambios BD"
  triggers_activos: todos

MODE_QUICK:
  alias: "@QUICK"
  fases_capved: [E, D]
  uso: "Typos, config minor, fixes triviales"
  triggers_activos: minimos
  escalable_a: MODE_FULL  # Si falla build

MODE_ANALYSIS:
  alias: "@ANALYSIS"
  fases_capved: [C, A, P]
  uso: "Investigacion, auditoria, sin modificar"
  triggers_activos: lectura
  salida: "Documento de analisis, NO codigo"
```

**Nota:** MODE_PROPAGATION no aplica a gamilit (es standalone sin propagacion a otros proyectos).

### Triggers Automaticos Adaptados

Organizados por fase CAPVED:

```yaml
Fase_A_Analisis:
  - TRIGGER-ANTI-DUPLICACION (verificar catalogos antes de crear)
  - TRIGGER-ANALISIS-DEPENDENCIAS (apps/backend, apps/frontend, apps/database)
  - TRIGGER-DUPLICADOS (152 entities, 899 endpoints)

Fase_E_Ejecucion:
  - TRIGGER-FETCH-OBLIGATORIO (git fetch antes de operar)
  - TRIGGER-DDL-RECREAR-BD-WSL (recreate-database.sh si cambio DDL)
  - TRIGGER-COHERENCIA-CAPAS (DDL <-> Backend <-> Frontend)
  - TRIGGER-FUNCTIONALITY-CHECK (npm run build && npm run test)

Fase_D_Documentacion:
  - TRIGGER-DOCUMENTACION-OBLIGATORIA (actualizar inventarios)
  - TRIGGER-INVENTARIOS-SINCRONIZADOS (MASTER_INVENTORY.yml SSOT)
  - TRIGGER-CIERRE-TAREA-OBLIGATORIO (checklist completo)
```

### Flujo de Activacion

```
Usuario: "@FULL Implementar nuevo tipo de ejercicio"
         |
         v
SAAD: 1. Detectar alias (@FULL)
      2. Cargar MODE-FULL.md
      3. Activar triggers correspondientes (DDL, Backend, Frontend, Docs)
      4. Inyectar directivas SIMCO por fase
         |
         v
SIMCO: Ejecutar secuencia CAPVED con directivas pre-cargadas
```

## Consecuencias

### Positivas

- **Automatizacion completa:** Agentes no deciden que cargar, SAAD lo determina
- **Consistencia garantizada:** Mismas directivas para mismos tipos de tareas
- **Escalado automatico:** MODE-QUICK escala a MODE-FULL si detecta problemas (build failures)
- **Triggers proactivos:** Verificaciones criticas (coherencia DDL<->Backend, recrear BD) se ejecutan sin intervencion manual
- **Onboarding simplificado:** Nuevos colaboradores solo aprenden aliases (@FULL, @QUICK, @ANALYSIS)
- **Auditoria facilitada:** Modo ANALYSIS permite investigar sin riesgo

### Negativas

- **Complejidad oculta:** Sistema tiene multiples partes interconectadas
  - Mitigacion: Documentacion exhaustiva en orchestration/directivas/
- **Rigidez inicial:** Modos predefinidos pueden no cubrir todos los casos
  - Mitigacion: 3 modos cubren 95% de casos; casos especiales usan combinaciones
- **Dependencia de CLAUDE.md:** Si no se carga, SAAD no funciona
  - Mitigacion: CLAUDE.md es auto-cargado por Claude Code al inicio

## Alternativas Consideradas

1. **Activacion manual por agente**
   - Rechazada: Inconsistencia, omision de directivas criticas (coherencia BD<->Backend)

2. **Un solo modo universal**
   - Rechazada: MODE-FULL seria excesivo para typos; MODE-QUICK insuficiente para features

3. **Sin triggers automaticos**
   - Rechazada: Verificaciones criticas (recrear BD, coherencia capas) se omitirian

## Implementacion en Gamilit

### Archivos Clave

```
gamilit/
  CLAUDE.md                           # Instrucciones base (RC1-RC6, modos)
  orchestration/
    directivas/
      modos/
        MODE-FULL.md                  # Modo completo
        MODE-QUICK.md                 # Modo rapido
        MODE-ANALYSIS.md              # Modo analisis
      triggers/
        TRIGGER-*.md                  # Triggers especificos
      simco/
        SIMCO-TAREA.md                # Directiva principal de tareas
        SIMCO-DDL.md                  # Directiva para cambios BD
        SIMCO-BACKEND.md              # Directiva para modulos NestJS
        SIMCO-FRONTEND.md             # Directiva para componentes React
```

### Integracion con SIMCO

```
SAAD = CUANDO activar directivas (automatizacion)
SIMCO = QUE hacer en cada directiva (instrucciones)
```

SAAD activa las directivas SIMCO correctas en el momento correcto, segun el modo y la fase CAPVED actual.

## Referencias

- ADR-0004 (workspace-arch) - ADR original (referencia historica, no accesible desde standalone)
- [orchestration/directivas/modos/](../../orchestration/directivas/modos/) - Definicion de modos
- [orchestration/directivas/triggers/](../../orchestration/directivas/triggers/) - Definicion de triggers
- [CLAUDE.md](../../CLAUDE.md) - Instrucciones base del proyecto

---

**Documentado por:** Sistema SIMCO
**Ubicacion:** docs/90-adr/ADR-035-sistema-saad.md
