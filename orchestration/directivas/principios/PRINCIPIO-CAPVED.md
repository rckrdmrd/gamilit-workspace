---
tipo: ssot-normativo
nivel: 3-completo
es_ssot: true
versiones_derivadas:
  - docs/30-directivas/CICLO-CAPVED.md (nivel 1 - resumen usuario)
  - orchestration/_definitions/protocols/CAPVED-CYCLE.md (nivel 2 - tecnico)
actualizado: 2026-01-16
---

# PRINCIPIO: CAPVED - Ciclo de Vida de Tareas

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Tipo:** Principio Fundamental - HERENCIA OBLIGATORIA - **SSOT**
**Aplica a:** TODOS los agentes sin excepción
**Alias:** @CAPVED

---

## DECLARACIÓN DEL PRINCIPIO

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║    CAPVED: Contexto → Análisis → Planeación → Validación → Ejecución → Doc   ║
║                                                                               ║
║    "Toda tarea que modifica código o documentación DEBE pasar por            ║
║     el ciclo completo CAPVED antes de considerarse Done."                    ║
║                                                                               ║
║    "Si aparece trabajo fuera del alcance original, se genera HU nueva."      ║
║                                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## QUÉ ES CAPVED

CAPVED es un **ciclo de vida obligatorio** para toda Historia de Usuario (HU) o tarea técnica que involucre modificación de código o documentación. Garantiza:

1. **Trazabilidad completa**: Desde el origen hasta la implementación
2. **Análisis de impacto**: Antes de tocar código
3. **Validación de coherencia**: Plan vs Análisis
4. **Generación controlada**: HUs derivadas para descubrimientos
5. **Documentación actualizada**: Como criterio de Done

---

## LAS 6 FASES DE CAPVED

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  C - CONTEXTO                                                                │
│  • Vincular HU a proyecto/módulo/epic                                       │
│  • Clasificar tipo: feature | fix | refactor | spike | doc-only             │
│  • Registrar origen: plan-original | descubrimiento | incidencia            │
│  • Cargar documentos SIMCO relevantes                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                    ↓                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  A - ANÁLISIS                                                                │
│  • Comportamiento deseado (perspectiva de negocio)                          │
│  • Restricciones: seguridad, performance, UX                                │
│  • Objetos impactados: BD, Backend, Frontend, otros proyectos               │
│  • Dependencias con otras HUs (bloquea/bloqueada por)                       │
│  • Riesgos identificados                                                    │
│  → SALIDA: Lista de objetos + dependencias + riesgos                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                    ↓                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  P - PLANEACIÓN                                                              │
│  • Desglose en subtareas por dominio (BD, BE, FE, Docs)                     │
│  • Orden de ejecución y dependencias                                        │
│  • Criterios de aceptación por subtarea                                     │
│  • Plan de pruebas: unitarias, integración, regresión                       │
│  • Asignación de agentes/subagentes                                         │
│  → SALIDA: Plan de ejecución con subtareas asignadas                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                    ↓                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  V - VALIDACIÓN (⚠️ NO DELEGAR - EJECUTAR DIRECTAMENTE)                     │
│  • ¿Todo lo detectado en A tiene acción concreta en P?                      │
│  • ¿Hay dependencias ocultas sin atender?                                   │
│  • ¿Criterios de aceptación cubren los riesgos?                             │
│  • ¿Hay scope creep? → Registrar y crear HU derivada                        │
│  → GATE: Solo pasa a Ejecución si todo cuadra                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                    ↓                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  E - EJECUCIÓN                                                               │
│  • Actualizar docs/ del proyecto PRIMERO                                    │
│  • Ejecutar subtareas en orden establecido                                  │
│  • Cada subtarea: código + notas + validación (build/lint)                  │
│  • Registrar progreso y desviaciones                                        │
│  → USAR: SIMCO correspondientes (CREAR, MODIFICAR, DDL, etc.)               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                    ↓                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  D - DOCUMENTACIÓN CONTINUA                                                  │
│  • Actualizar diagramas y modelos de dominio                                │
│  • Actualizar especificaciones técnicas (BD, APIs, contratos)               │
│  • Crear/actualizar ADRs si hubo decisiones arquitectónicas                 │
│  • Actualizar inventarios (DATABASE, BACKEND, FRONTEND)                     │
│  • Actualizar trazas de tareas                                              │
│  • Registrar HUs derivadas (si se generaron)                                │
│  • Registrar lecciones aprendidas                                           │
│  → GATE: HU NO está Done si documentación no está actualizada               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## CUÁNDO APLICA CAPVED

### APLICA A (Obligatorio):

```yaml
Tareas_que_DEBEN_seguir_CAPVED:
  - Nuevas features (cualquier tamaño)
  - Bug fixes que modifican código
  - Refactorizaciones
  - Cambios en estructura de BD
  - Nuevos endpoints de API
  - Nuevos componentes de UI
  - Cambios en lógica de negocio
  - Integraciones con sistemas externos
  - Cualquier tarea que genere commit
```

### NO APLICA A (Excepciones):

```yaml
Tareas_exentas_de_CAPVED_completo:
  - Corrección de typos en código (solo E+D)
  - Actualización de dependencias menores (solo E+D)
  - Tareas puramente exploratorias (solo lectura)
  - Consultas de información
  - Spikes de investigación sin implementación

NOTA: Incluso las excepciones DEBEN documentar en trazas
```

---

## INTEGRACIÓN CON SIMCO

CAPVED es el **ciclo de vida**, SIMCO son las **operaciones**:

```
CAPVED                          SIMCO
───────                         ─────
C - Contexto          →         SIMCO-INICIALIZACION.md (CCA)
A - Análisis          →         SIMCO-BUSCAR.md + docs/
P - Planeación        →         TEMPLATE-PLAN.md
V - Validación        →         Checklist CAPVED (este documento)
E - Ejecución         →         SIMCO-CREAR/MODIFICAR/DDL/BACKEND/FRONTEND
D - Documentación     →         SIMCO-DOCUMENTAR.md + inventarios + trazas
```

### Orden de Lectura para Agentes:

```yaml
1. SIMCO-INICIALIZACION.md      # Bootstrap con CCA
2. PRINCIPIO-CAPVED.md          # Este documento (ciclo obligatorio)
3. PRINCIPIO-DOC-PRIMERO.md     # Documentación antes de código
4. PRINCIPIO-ANTI-DUPLICACION.md # Verificar antes de crear
5. PRINCIPIO-VALIDACION-OBLIGATORIA.md # Build/lint obligatorios
6. SIMCO-TAREA.md               # Proceso detallado CAPVED
7. SIMCO específicos según operación
```

---

## GENERACIÓN DE HUs DERIVADAS

### Cuándo Generar HU Nueva:

```yaml
Generar_HU_derivada_cuando:
  # Durante Análisis (A)
  - Se detecta bug estructural no relacionado al objetivo
  - Se identifica deuda técnica que bloquea
  - Se descubre dependencia no documentada

  # Durante Validación (V)
  - Hay trabajo detectado fuera del alcance original
  - Se requiere refactor previo no planificado
  - Se identifica mejora de UX no solicitada

  # Durante Ejecución (E)
  - Se encuentra código legacy que debe corregirse
  - Se descubre inconsistencia en otra parte del sistema
  - Se identifica oportunidad de optimización
```

### Proceso de Generación:

```markdown
1. DETECTAR: Identificar que algo está fuera del alcance
2. REGISTRAR: Documentar en la sección "HUs Derivadas" de la HU actual
3. CREAR: Generar archivo de HU con prefijo DERIVED-{HU-ORIGEN}-{N}
4. VINCULAR: Referenciar la HU origen en la nueva HU
5. PRIORIZAR: Marcar como pendiente para siguiente planificación
6. CONTINUAR: Seguir con la HU original sin desviarse
```

### Template de Registro:

```yaml
HUs_Derivadas:
  - id: "DERIVED-HU-001-001"
    origen: "HU-001"
    tipo: "bug | feature | refactor | deuda-tecnica"
    descripcion: "Descripción breve de lo detectado"
    detectado_en_fase: "A | V | E"
    prioridad_sugerida: "P0 | P1 | P2 | P3"
    notas: "Contexto adicional relevante"
```

---

## CHECKLIST RÁPIDO CAPVED

### Antes de Iniciar (C):
```
[ ] HU vinculada a proyecto/módulo/epic
[ ] Tipo clasificado (feature/fix/refactor/spike/doc-only)
[ ] Origen registrado (plan/descubrimiento/incidencia)
[ ] Documentos SIMCO relevantes identificados
```

### Antes de Planificar (A completado):
```
[ ] Comportamiento de negocio entendido
[ ] Objetos impactados listados (todas las capas)
[ ] Dependencias identificadas
[ ] Riesgos documentados
```

### Antes de Ejecutar (P+V completados):
```
[ ] Subtareas definidas por dominio
[ ] Orden de ejecución establecido
[ ] Criterios de aceptación definidos
[ ] Plan vs Análisis validado (todo cubierto)
[ ] Scope creep registrado (si existe)
[ ] HUs derivadas creadas (si aplica)
```

### Durante Ejecución (E):
```
[ ] docs/ actualizado PRIMERO
[ ] Subtareas ejecutadas en orden
[ ] Build/lint pasa por subtarea
[ ] Progreso registrado
```

### Antes de Cerrar (D):
```
[ ] Diagramas/modelos actualizados
[ ] Specs técnicas actualizadas
[ ] ADRs creados (si decisión arquitectónica)
[ ] Inventarios actualizados
[ ] Trazas actualizadas
[ ] HUs derivadas vinculadas
[ ] Lecciones aprendidas registradas
```

### GATE DE CIERRE (OBLIGATORIO - @DEF_CHK_POST)

> **ANTES de declarar una HU/tarea como DONE, ejecutar @DEF_CHK_POST**

```markdown
## Checklist de Cierre Obligatorio

### Gobernanza (BLOQUEANTE)
[ ] Carpeta de tarea existe: orchestration/tareas/TASK-{ID}/
[ ] METADATA.yml completo con fases C, E, D
[ ] _INDEX.yml de tareas actualizado

### Validaciones Técnicas
[ ] Build pasa (backend y/o frontend)
[ ] Lint pasa
[ ] Tests pasan (si existen)

### Coherencia Entre Capas
[ ] DDL ↔ Backend verificado
[ ] Backend ↔ Frontend verificado (si aplica)

### Inventarios
[ ] DATABASE_INVENTORY.yml (si cambió BD)
[ ] BACKEND_INVENTORY.yml (si cambió BE)
[ ] FRONTEND_INVENTORY.yml (si cambió FE)
[ ] MASTER_INVENTORY.yml actualizado

### Trazas
[ ] Traza de tarea correspondiente actualizada
[ ] PROXIMA-ACCION.md actualizado

### Propagación
[ ] Evaluado si aplica a otros proyectos
```

**SI FALLA CUALQUIER ITEM BLOQUEANTE:** HU permanece EN PROGRESO.

**REFERENCIA:** `@TRIGGER_CIERRE` - orchestration/directivas/triggers/TRIGGER-CIERRE-TAREA-OBLIGATORIO.md

---

## CONSECUENCIAS DE IGNORAR CAPVED

```
❌ Saltar Contexto (C)
   → HU sin trazabilidad, trabajo desconectado del plan

❌ Saltar Análisis (A)
   → Impacto no previsto, bugs en otras partes del sistema

❌ Saltar Planeación (P)
   → Ejecución caótica, trabajo rehecho, tiempo perdido

❌ Saltar Validación (V)
   → Scope creep no controlado, trabajo infinito

❌ Saltar Documentación (D)
   → Sistema diverge de docs/, confusión futura, onboarding difícil
```

---

## LECCIONES APRENDIDAS

### Registro Obligatorio:

Al cerrar cada HU, registrar:

```yaml
Lecciones_Aprendidas:
  que_funciono_bien:
    - "Descripción de práctica exitosa"

  que_se_puede_mejorar:
    - "Descripción de área de mejora"

  para_futuras_HUs_similares:
    - "Recomendación específica para HUs del mismo tipo"
```

### Ubicación:

- En el archivo de la HU (sección final)
- Consolidar mensualmente en `orchestration/retrospectivas/`

---

## REFERENCIAS SIMCO

| Fase CAPVED | SIMCO Relacionados |
|-------------|-------------------|
| C - Contexto | `SIMCO-INICIALIZACION.md`, `PROJECT-CONTEXT.md` |
| A - Análisis | `SIMCO-BUSCAR.md`, `TEMPLATE-ANALISIS.md` |
| P - Planeación | `TEMPLATE-PLAN.md`, `SIMCO-DELEGACION.md` |
| V - Validación | `TEMPLATE-VALIDACION.md` |
| E - Ejecución | `SIMCO-CREAR.md`, `SIMCO-MODIFICAR.md`, `SIMCO-DDL.md`, etc. |
| D - Documentación | `SIMCO-DOCUMENTAR.md`, inventarios, trazas |

---

## ALIAS

```yaml
@CAPVED:     core/orchestration/directivas/principios/PRINCIPIO-CAPVED.md
@TAREA:      core/orchestration/directivas/simco/SIMCO-TAREA.md
@TPL_CAPVED: core/orchestration/templates/TEMPLATE-TAREA-CAPVED.md
```

---

**Este principio es OBLIGATORIO y NO puede ser ignorado por ningún agente.**

---

**Versión:** 1.0.0 | **Sistema:** SIMCO + CAPVED | **Tipo:** Principio Fundamental
