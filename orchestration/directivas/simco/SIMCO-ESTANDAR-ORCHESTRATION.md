# SIMCO: ESTÁNDAR DE ESTRUCTURA orchestration/ POR NIVEL

**Versión:** 1.0.0
**Sistema:** SIMCO v4.3.0 + NEXUS v4.0
**Fecha:** 2026-01-24
**Prioridad:** OBLIGATORIA
**Aplica a:** Todos los agentes y proyectos

---

## RESUMEN EJECUTIVO

> Este documento define la estructura **OBLIGATORIA** de la carpeta `orchestration/`
> para cada nivel del workspace. Todo proyecto DEBE cumplir con este estándar.
>
> **Sin estructura válida = proyecto no operable por agentes.**

---

## NIVELES DE ESTRUCTURA

```
NIVEL 0: WORKSPACE ROOT (workspace-v2/)
         ↓ hereda a
NIVEL 1A: PROVIDER (template-saas)
         ↓ hereda a
NIVEL 1B: INTERMEDIATE (erp-core)
         ↓ hereda a
NIVEL 2: CONSUMER (verticales ERP, standalone)
```

---

## NIVEL 0: WORKSPACE ROOT

### Ubicación
```
workspace-v2/orchestration/
```

### Estructura OBLIGATORIA

```
orchestration/
├── _MAP.md                              # [OBLIGATORIO] Mapa de navegación
├── INDICE-DIRECTIVAS-WORKSPACE.yml      # [OBLIGATORIO] Índice de todas las directivas
├── CARPETAS-INDEX.yml                   # [OBLIGATORIO] Índice de carpetas
├── CONTEXT-MAP.yml                      # [OBLIGATORIO] Mapa de contexto NEXUS
├── DEPENDENCY-GRAPH.yml                 # [OBLIGATORIO] Grafo de dependencias
├── INHERITANCE-MODEL.yml                # [OBLIGATORIO] Modelo de herencia
├── docs/_SSOT/TRACEABILITY-MASTER.yml   # [OBLIGATORIO] Trazabilidad maestra
├── ROADMAP.yml                          # [OBLIGATORIO] Prioridades y milestones
│
├── directivas/                          # [OBLIGATORIO] Directivas SIMCO
│   ├── principios/                      # [OBLIGATORIO] 7 principios
│   ├── simco/                           # [OBLIGATORIO] 70+ directivas
│   ├── triggers/                        # [OBLIGATORIO] Triggers automáticos
│   ├── modos/                           # [OBLIGATORIO] Modos de ejecución
│   └── politicas/                       # [OPCIONAL] Políticas excepcionales
│
├── agents/                              # [OBLIGATORIO] Agentes
│   ├── perfiles/                        # [OBLIGATORIO] Perfiles de agentes
│   └── trazas/                          # [OBLIGATORIO] Trazas de agentes
│
├── templates/                           # [OBLIGATORIO] Templates
│   ├── 01-por-contexto/                 # [OBLIGATORIO] Por tipo de proyecto
│   ├── 02-por-ciclo/                    # [OBLIGATORIO] CAPVED
│   ├── 03-por-proceso/                  # [OBLIGATORIO] Delegación, scrum
│   ├── 04-globales/                     # [OBLIGATORIO] Globales
│   └── _legacy/                         # [OPCIONAL] Deprecados
│
├── inventarios/                         # [OBLIGATORIO] Inventarios
├── referencias/                         # [OBLIGATORIO] Aliases, prompts
├── tareas/                              # [OBLIGATORIO] Tareas documentadas
│   ├── _templates/                      # [OBLIGATORIO] Templates de tarea
│   └── _INDEX.yml                       # [OBLIGATORIO] Índice de tareas
│
└── trazas/                              # [OBLIGATORIO] Trazas de operaciones
```

### Archivos Root OBLIGATORIOS (9)

| Archivo | Propósito | Alias |
|---------|-----------|-------|
| `_MAP.md` | Mapa de navegación visual | @MAP |
| `INDICE-DIRECTIVAS-WORKSPACE.yml` | Índice de todas las directivas | @INDICE |
| `CARPETAS-INDEX.yml` | Índice de carpetas | @CARPETAS |
| `CONTEXT-MAP.yml` | Mapa de contexto NEXUS | @CONTEXT-MAP |
| `DEPENDENCY-GRAPH.yml` | Grafo de dependencias | @DEPENDENCY |
| `INHERITANCE-MODEL.yml` | Modelo de herencia | @INHERITANCE |
| `docs/_SSOT/TRACEABILITY-MASTER.yml` | Trazabilidad maestra | @TRACEABILITY |
| `ROADMAP.yml` | Prioridades y milestones | @ROADMAP |
| `SUBMODULES-POLICY.yml` | Política de submodules | @SUBMODULES |

---

## NIVEL 1A: PROVIDER (template-saas)

### Ubicación
```
projects/template-saas/orchestration/
```

### Rol
Proyecto **PROVEEDOR** de herencia. Define patrones base que heredan otros proyectos.

### Estructura OBLIGATORIA

```
orchestration/
├── _MAP.md                              # [OBLIGATORIO] Mapa de navegación
├── _inheritance.yml                     # [OBLIGATORIO] Define qué exporta
├── BOOTLOADER.md                        # [OBLIGATORIO] Protocolo de arranque
├── CONTEXT-MAP.yml                      # [OBLIGATORIO] Mapa de contexto
├── PROJECT-PROFILE.yml                  # [OBLIGATORIO] Perfil del proyecto
├── PROJECT-STATUS.md                    # [OBLIGATORIO] Estado actual
├── PROXIMA-ACCION.md                    # [OBLIGATORIO] Siguiente acción
├── DEPENDENCY-GRAPH.yml                 # [OBLIGATORIO] Dependencias
├── TRACEABILITY.yml                     # [OBLIGATORIO] Trazabilidad
├── MAPA-DOCUMENTACION.yml               # [OBLIGATORIO] Mapa de docs
│
├── 00-guidelines/                       # [OBLIGATORIO]
│   └── CONTEXTO-PROYECTO.md             # [OBLIGATORIO]
│
├── inventarios/                         # [OBLIGATORIO]
│   ├── MASTER_INVENTORY.yml             # [OBLIGATORIO]
│   └── {capas}_INVENTORY.yml            # [CONDICIONAL] Si tiene código
│
├── trazas/                              # [OBLIGATORIO]
│   └── TRAZA-TAREAS-{CAPA}.md           # [CONDICIONAL] Si tiene código
│
└── directivas/                          # [OPCIONAL] Directivas específicas
```

### Archivos Root OBLIGATORIOS (10)

| Archivo | Propósito |
|---------|-----------|
| `_MAP.md` | Mapa de navegación |
| `_inheritance.yml` | Define herencia (CRÍTICO para PROVIDER) |
| `BOOTLOADER.md` | Protocolo de arranque NEXUS |
| `CONTEXT-MAP.yml` | Mapa de contexto |
| `PROJECT-PROFILE.yml` | Perfil y metadata |
| `PROJECT-STATUS.md` | Estado actual |
| `PROXIMA-ACCION.md` | Checkpoint de sesión |
| `DEPENDENCY-GRAPH.yml` | Dependencias |
| `TRACEABILITY.yml` | Trazabilidad |
| `MAPA-DOCUMENTACION.yml` | Mapa de documentación |

### _inheritance.yml (CRÍTICO)

```yaml
# Obligatorio para PROVIDER
tipo: PROVIDER
version: "1.0.0"

exporta_a:
  - erp-core
  - gamilit
  - michangarrito

patrones_exportados:
  - auth
  - multi-tenancy
  - api-structure
  - frontend-structure

reglas_propagacion:
  security_fixes: inmediato
  bug_fixes: 72h
  features: siguiente_sprint
```

---

## NIVEL 1B: INTERMEDIATE (erp-core)

### Ubicación
```
projects/erp-core/orchestration/
```

### Rol
Proyecto **INTERMEDIARIO**. Hereda de PROVIDER y exporta a CONSUMERS.

### Estructura OBLIGATORIA

```
orchestration/
├── _MAP.md                              # [OBLIGATORIO]
├── _inheritance.yml                     # [OBLIGATORIO] Hereda de + exporta a
├── BOOTLOADER.md                        # [OBLIGATORIO]
├── CONTEXT-MAP.yml                      # [OBLIGATORIO]
├── PROJECT-PROFILE.yml                  # [OBLIGATORIO]
├── PROJECT-STATUS.md                    # [OBLIGATORIO]
├── PROXIMA-ACCION.md                    # [OBLIGATORIO]
├── DEPENDENCY-GRAPH.yml                 # [OBLIGATORIO]
├── TRACEABILITY.yml                     # [OBLIGATORIO]
├── MAPA-DOCUMENTACION.yml               # [OBLIGATORIO]
├── README.md                            # [OBLIGATORIO] Para INTERMEDIATE+
│
├── 00-guidelines/                       # [OBLIGATORIO]
│   ├── CONTEXTO-PROYECTO.md             # [OBLIGATORIO]
│   └── HERENCIA-DIRECTIVAS.md           # [OBLIGATORIO] Para INTERMEDIATE
│
├── inventarios/                         # [OBLIGATORIO]
│   ├── MASTER_INVENTORY.yml             # [OBLIGATORIO]
│   ├── DATABASE_INVENTORY.yml           # [OBLIGATORIO] Si tiene BD
│   ├── BACKEND_INVENTORY.yml            # [OBLIGATORIO] Si tiene backend
│   └── FRONTEND_INVENTORY.yml           # [OBLIGATORIO] Si tiene frontend
│
├── trazas/                              # [OBLIGATORIO]
│   ├── TRAZA-TAREAS-DATABASE.md         # [OBLIGATORIO] Si tiene BD
│   ├── TRAZA-TAREAS-BACKEND.md          # [OBLIGATORIO] Si tiene backend
│   └── TRAZA-TAREAS-FRONTEND.md         # [OBLIGATORIO] Si tiene frontend
│
├── directivas/                          # [OBLIGATORIO] Para INTERMEDIATE
│   └── {directivas específicas}
│
└── propagacion/                         # [OBLIGATORIO] Para INTERMEDIATE
    └── PLAN-PROPAGACION-VERTICALES.md   # [OBLIGATORIO]
```

### Archivos Root OBLIGATORIOS (11)

| Archivo | Propósito |
|---------|-----------|
| `_MAP.md` | Mapa de navegación |
| `_inheritance.yml` | Hereda de template-saas, exporta a verticales |
| `BOOTLOADER.md` | Protocolo de arranque |
| `CONTEXT-MAP.yml` | Mapa de contexto |
| `PROJECT-PROFILE.yml` | Perfil y metadata |
| `PROJECT-STATUS.md` | Estado actual |
| `PROXIMA-ACCION.md` | Checkpoint de sesión |
| `DEPENDENCY-GRAPH.yml` | Dependencias |
| `TRACEABILITY.yml` | Trazabilidad |
| `MAPA-DOCUMENTACION.yml` | Mapa de documentación |
| `README.md` | Documentación del proyecto |

### _inheritance.yml (CRÍTICO)

```yaml
# Obligatorio para INTERMEDIATE
tipo: INTERMEDIATE
version: "1.0.0"

hereda_de:
  - workspace-v2/orchestration/
  - projects/template-saas/

exporta_a:
  - erp-clinicas
  - erp-construccion
  - erp-mecanicas-diesel
  - erp-retail
  - erp-vidrio-templado

modulos_core:
  - auth
  - users
  - companies
  - catalog
  - inventory
  - sales
  - purchases
  - accounting

reglas_propagacion:
  security_fixes: inmediato
  bug_fixes: 72h
  features: siguiente_sprint
```

---

## NIVEL 2: CONSUMER (Verticales ERP, Standalone)

### Ubicación
```
projects/{vertical}/orchestration/
projects/{standalone}/orchestration/
```

### Rol
Proyecto **CONSUMIDOR**. Hereda de PROVIDER o INTERMEDIATE. NO exporta.

### Estructura OBLIGATORIA

```
orchestration/
├── _MAP.md                              # [OBLIGATORIO]
├── _inheritance.yml                     # [OBLIGATORIO] Hereda de
├── BOOTLOADER.md                        # [OBLIGATORIO]
├── CONTEXT-MAP.yml                      # [OBLIGATORIO]
├── PROJECT-PROFILE.yml                  # [OBLIGATORIO]
├── PROJECT-STATUS.md                    # [OBLIGATORIO]
├── PROXIMA-ACCION.md                    # [OBLIGATORIO]
├── DEPENDENCY-GRAPH.yml                 # [OBLIGATORIO]
├── TRACEABILITY.yml                     # [OBLIGATORIO]
├── MAPA-DOCUMENTACION.yml               # [OBLIGATORIO]
│
├── 00-guidelines/                       # [OBLIGATORIO]
│   └── CONTEXTO-PROYECTO.md             # [OBLIGATORIO]
│
├── inventarios/                         # [OBLIGATORIO]
│   └── MASTER_INVENTORY.yml             # [OBLIGATORIO]
│
└── trazas/                              # [OBLIGATORIO]
    └── {trazas por capa}                # [CONDICIONAL]
```

### Archivos Root OBLIGATORIOS (10)

| Archivo | Propósito |
|---------|-----------|
| `_MAP.md` | Mapa de navegación |
| `_inheritance.yml` | De dónde hereda |
| `BOOTLOADER.md` | Protocolo de arranque |
| `CONTEXT-MAP.yml` | Mapa de contexto |
| `PROJECT-PROFILE.yml` | Perfil y metadata |
| `PROJECT-STATUS.md` | Estado actual |
| `PROXIMA-ACCION.md` | Checkpoint de sesión |
| `DEPENDENCY-GRAPH.yml` | Dependencias |
| `TRACEABILITY.yml` | Trazabilidad |
| `MAPA-DOCUMENTACION.yml` | Mapa de documentación |

### _inheritance.yml (CRÍTICO)

```yaml
# Para CONSUMER vertical ERP
tipo: CONSUMER
version: "1.0.0"

hereda_de:
  - workspace-v2/orchestration/
  - projects/erp-core/

exporta_a: []  # CONSUMERS no exportan

modulos_verticales:
  - {módulos específicos de la vertical}

regla_sincronizacion: |
  Recibir cambios de erp-core según SLA definido.
  Security fixes: Aplicar en 24h.
  Bug fixes: Aplicar en 72h.
  Features: Aplicar en siguiente sprint.
```

---

## MATRIZ DE ARCHIVOS POR NIVEL

| Archivo | L0 Workspace | L1A Provider | L1B Intermediate | L2 Consumer |
|---------|:------------:|:------------:|:----------------:|:-----------:|
| `_MAP.md` | ✓ | ✓ | ✓ | ✓ |
| `_inheritance.yml` | - | **✓** | **✓** | **✓** |
| `BOOTLOADER.md` | - | ✓ | ✓ | ✓ |
| `CONTEXT-MAP.yml` | ✓ | ✓ | ✓ | ✓ |
| `PROJECT-PROFILE.yml` | - | ✓ | ✓ | ✓ |
| `PROJECT-STATUS.md` | - | ✓ | ✓ | ✓ |
| `PROXIMA-ACCION.md` | - | ✓ | ✓ | ✓ |
| `DEPENDENCY-GRAPH.yml` | ✓ | ✓ | ✓ | ✓ |
| `TRACEABILITY.yml` | ✓ (Master) | ✓ | ✓ | ✓ |
| `MAPA-DOCUMENTACION.yml` | - | ✓ | ✓ | ✓ |
| `README.md` | - | Opcional | ✓ | Opcional |
| `INDICE-DIRECTIVAS-*.yml` | ✓ | - | - | - |
| `CARPETAS-INDEX.yml` | ✓ | - | - | - |
| `INHERITANCE-MODEL.yml` | ✓ | - | - | - |
| `ROADMAP.yml` | ✓ | - | - | - |

---

## SUBCARPETAS POR NIVEL

| Subcarpeta | L0 Workspace | L1A Provider | L1B Intermediate | L2 Consumer |
|------------|:------------:|:------------:|:----------------:|:-----------:|
| `directivas/` | **✓** (70+) | Opcional | ✓ | Opcional |
| `agents/` | **✓** | - | - | Opcional |
| `templates/` | **✓** | - | - | Opcional |
| `inventarios/` | **✓** | ✓ | ✓ | ✓ |
| `referencias/` | **✓** | Opcional | Opcional | Opcional |
| `tareas/` | **✓** | Opcional | Opcional | Opcional |
| `trazas/` | **✓** | ✓ | ✓ | ✓ |
| `00-guidelines/` | - | ✓ | ✓ | ✓ |
| `propagacion/` | Opcional | - | ✓ | - |

---

## VALIDACIÓN DE CUMPLIMIENTO

### Checklist Rápido por Nivel

#### Para CONSUMER (mínimo 10 archivos + 3 carpetas)

```markdown
## Proyecto: {nombre}
## Nivel: CONSUMER

### Archivos Root (10)
- [ ] _MAP.md
- [ ] _inheritance.yml
- [ ] BOOTLOADER.md
- [ ] CONTEXT-MAP.yml
- [ ] PROJECT-PROFILE.yml
- [ ] PROJECT-STATUS.md
- [ ] PROXIMA-ACCION.md
- [ ] DEPENDENCY-GRAPH.yml
- [ ] TRACEABILITY.yml
- [ ] MAPA-DOCUMENTACION.yml

### Carpetas (3)
- [ ] 00-guidelines/
  - [ ] CONTEXTO-PROYECTO.md
- [ ] inventarios/
  - [ ] MASTER_INVENTORY.yml
- [ ] trazas/

### Validación _inheritance.yml
- [ ] tipo: CONSUMER
- [ ] hereda_de: definido
- [ ] exporta_a: [] (vacío)
```

#### Para INTERMEDIATE (mínimo 11 archivos + 5 carpetas)

```markdown
## Proyecto: {nombre}
## Nivel: INTERMEDIATE

### Archivos Root (11)
- [ ] Todos los de CONSUMER
- [ ] README.md

### Carpetas Adicionales (2)
- [ ] directivas/
- [ ] propagacion/
  - [ ] PLAN-PROPAGACION-*.md

### Validación _inheritance.yml
- [ ] tipo: INTERMEDIATE
- [ ] hereda_de: definido
- [ ] exporta_a: lista de consumers
```

#### Para PROVIDER (mínimo 10 archivos + 3 carpetas)

```markdown
## Proyecto: {nombre}
## Nivel: PROVIDER

### Archivos Root (10)
- [ ] Todos los de CONSUMER

### Validación _inheritance.yml
- [ ] tipo: PROVIDER
- [ ] hereda_de: definido
- [ ] exporta_a: lista de proyectos
- [ ] patrones_exportados: definidos
```

---

## ERRORES COMUNES Y SOLUCIÓN

| Error | Causa | Solución |
|-------|-------|----------|
| Proyecto sin `_inheritance.yml` | No se definió herencia | Crear archivo con herencia correcta |
| Usa `_INDEX.md` en vez de `_MAP.md` | Convención antigua | Renombrar a `_MAP.md` |
| Sin `BOOTLOADER.md` | No se propagó estándar | Crear usando template |
| Sin `PROJECT-PROFILE.yml` | Falta metadata | Crear con datos del proyecto |
| Exceso de carpetas (>20) | Desorganización | Consolidar siguiendo estándar |
| Sin `TRACEABILITY.yml` | Falta trazabilidad | Crear con historial conocido |

---

## SCRIPT DE VALIDACIÓN

```bash
# Uso:
# ./scripts/validation/validate-orchestration-structure.sh projects/{proyecto}

# Valida cumplimiento del estándar SIMCO-ESTANDAR-ORCHESTRATION.md
# Retorna 0 si cumple, 1 si no cumple
# Lista archivos faltantes
```

---

## HERENCIA DE ESTÁNDARES

```
SIMCO-ESTRUCTURA-REPOS.md          (Define niveles de arquitectura)
         ↓
SIMCO-ESTANDAR-ORCHESTRATION.md    (Define estructura orchestration/ por nivel) ← ESTE
         ↓
CHECKLIST-ESTRUCTURA-PROYECTO.md   (Checklist de verificación)
         ↓
validate-orchestration-structure.sh (Validación automática)
```

---

## ALIASES

| Alias | Archivo |
|-------|---------|
| `@ESTANDAR-ORCHESTRATION` | Este documento |
| `@ESTRUCTURA-ORCHESTRATION` | Este documento |
| `@ORCHESTRATION-NIVELES` | Este documento |

---

## REFERENCIAS

- `SIMCO-ESTRUCTURA-REPOS.md` - Arquitectura de niveles
- `SIMCO-BOOTLOADER.md` - Protocolo de arranque
- `INHERITANCE-MODEL.yml` - Modelo de herencia
- `CHECKLIST-ESTRUCTURA-PROYECTO.md` - Checklist de verificación

---

*Sistema SIMCO v4.3.0 + NEXUS v4.0*
*Estándar de Estructura orchestration/ por Nivel v1.0.0*
