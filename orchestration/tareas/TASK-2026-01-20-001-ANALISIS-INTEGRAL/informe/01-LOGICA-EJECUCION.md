# LOGICA DE EJECUCION: TASK-2026-01-20-001

## 1. FLUJO DE DECISION

### 1.1 Diagrama de Flujo Principal

```
                    ┌─────────────────────┐
                    │   SOLICITUD USUARIO │
                    │   "Analizar docs"   │
                    └──────────┬──────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │     FASE C: CONTEXTO           │
              │  ┌──────────────────────────┐  │
              │  │ 1. git fetch origin      │  │
              │  │ 2. Leer docs/_MAP.md     │  │
              │  │ 3. Leer SSOT (5 archivos)│  │
              │  │ 4. Leer inventarios      │  │
              │  └──────────────────────────┘  │
              └────────────────┬───────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │     DECISION: COMPLEJIDAD      │
              │  ┌──────────────────────────┐  │
              │  │ 22 EPICs = COMPLEJO      │  │
              │  │ Requiere paralelizacion  │  │
              │  └──────────────────────────┘  │
              └────────────────┬───────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │   FASE A: ANALISIS PARALELO    │
              │  ┌──────────────────────────┐  │
              │  │ Lanzar 6 subagentes:     │  │
              │  │ - SA-001: Fase 1 (7 EPICs)│ │
              │  │ - SA-002: Fase 2 (3 EPICs)│ │
              │  │ - SA-003: Fase 3 (12 EPICs)││
              │  │ - SA-004: BD (137 tablas) │ │
              │  │ - SA-005: Duplicidades    │ │
              │  │ - SA-006: Referencias     │ │
              │  └──────────────────────────┘  │
              └────────────────┬───────────────┘
                               │
                   ┌───────────┴───────────┐
                   │   CONSOLIDAR RESULTADOS│
                   └───────────┬───────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │   FASE V: VALIDACION           │
              │  ┌──────────────────────────┐  │
              │  │ Generar MATRIZ-VALIDACION│  │
              │  │ Identificar GAPS P0      │  │
              │  │ 5 gaps criticos          │  │
              │  └──────────────────────────┘  │
              └────────────────┬───────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │  DECISION: CORRECCION P0       │
              │  ┌──────────────────────────┐  │
              │  │ Usuario aprueba continuar│  │
              │  │ Lanzar 5 subagentes P0   │  │
              │  └──────────────────────────┘  │
              └────────────────┬───────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │   FASE E: EJECUCION PARALELA   │
              │  ┌──────────────────────────┐  │
              │  │ P0-001: RF/ET EAI-004    │  │
              │  │ P0-002: RF/ET EAI-005    │  │
              │  │ P0-003: TRACE ETC-001    │  │
              │  │ P0-004: SCRUM EAI-003-EXT│  │
              │  │ P0-005: DATABASE_INV     │  │
              │  └──────────────────────────┘  │
              └────────────────┬───────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │   FASE D: DOCUMENTACION        │
              │  ┌──────────────────────────┐  │
              │  │ 1. Actualizar METADATA   │  │
              │  │ 2. Crear reportes        │  │
              │  │ 3. Actualizar _INDEX.yml │  │
              │  │ 4. Crear trazas agente   │  │
              │  │ 5. Commits + Push        │  │
              │  └──────────────────────────┘  │
              └────────────────────────────────┘
```

---

## 2. LOGICA DE PARALELIZACION

### 2.1 Criterios para Paralelizar

```yaml
criterios_paralelizacion:
  independencia:
    descripcion: "Tareas sin dependencia de datos entre si"
    aplicado_en:
      - "SA-001, SA-002, SA-003: Diferentes fases de EPICs"
      - "SA-004: BD independiente de docs"
      - "SA-005: Duplicidades independiente"

  contexto_suficiente:
    descripcion: "Cada subagente tiene contexto completo"
    aplicado_en:
      - "Prompts con rutas absolutas a archivos"
      - "Referencias a archivos modelo"
      - "Perfil de agente definido"

  consolidacion_posterior:
    descripcion: "Resultados se consolidan al final"
    aplicado_en:
      - "REPORTE-CONSOLIDADO-FINAL.md"
      - "MATRIZ-VALIDACION-EPICAS.yml"
```

### 2.2 Secuencia de Ejecucion

```
TIEMPO ──────────────────────────────────────────────────────────►

T0: INICIO
│
├── [SECUENCIAL] Fase C: Contexto
│   └── Lectura de archivos SSOT
│
T1: FORK PARALELO (6 subagentes)
│
│   ┌── SA-001 ──────────────────────┐
│   │   Analisis EPICs Fase 1        │
│   │   (7 EPICs, ~15 archivos)      │
│   └────────────────────────────────┘
│
│   ┌── SA-002 ──────────────────────┐
│   │   Analisis EPICs Fase 2        │
│   │   (3 EPICs, ~10 archivos)      │
│   └────────────────────────────────┘
│
│   ┌── SA-003 ──────────────────────┐
│   │   Analisis EPICs Fase 3        │
│   │   (12 EPICs, ~20 archivos)     │
│   └────────────────────────────────┘
│
│   ┌── SA-004 ──────────────────────┐
│   │   Validacion BD                │
│   │   (16 schemas, 137 tablas)     │
│   └────────────────────────────────┘
│
│   ┌── SA-005 ──────────────────────┐
│   │   Deteccion Duplicidades       │
│   │   (Todas las capas)            │
│   └────────────────────────────────┘
│
│   ┌── SA-006 ──────────────────────┐
│   │   Validacion Referencias       │
│   │   (Links cruzados)             │
│   └────────────────────────────────┘
│
T2: JOIN (consolidacion)
│
├── [SECUENCIAL] Validacion y decision P0
│
T3: FORK PARALELO (5 subagentes P0)
│
│   ┌── P0-001, P0-002, P0-003, P0-004, P0-005 ──┐
│   │   Acciones correctivas en paralelo         │
│   └────────────────────────────────────────────┘
│
T4: JOIN FINAL
│
└── [SECUENCIAL] Documentacion y commits
```

---

## 3. DECISION DE SUBAGENTES

### 3.1 Analisis de Carga de Trabajo

| Subagente | Archivos a Procesar | Complejidad | Tiempo Estimado |
|-----------|---------------------|-------------|-----------------|
| SA-001 | 15 (7 EPICs) | Alta | Medio |
| SA-002 | 10 (3 EPICs) | Media | Bajo |
| SA-003 | 20 (12 EPICs) | Alta | Alto |
| SA-004 | 50+ (schemas/tablas) | Muy Alta | Alto |
| SA-005 | 30+ (multi-capa) | Alta | Medio |
| SA-006 | 10+ (links) | Media | Bajo |

### 3.2 Perfil de Subagente Seleccionado

```yaml
perfiles_asignados:
  SA-001:
    perfil: "documentation-analyst"
    justificacion: "Analisis de estructura SCRUM de EPICs"

  SA-002:
    perfil: "documentation-analyst"
    justificacion: "Continuidad con SA-001"

  SA-003:
    perfil: "documentation-analyst"
    justificacion: "Mismo tipo de analisis"

  SA-004:
    perfil: "database-auditor"
    justificacion: "Conocimiento especializado DDL/schemas"

  SA-005:
    perfil: "code-auditor"
    justificacion: "Deteccion de patrones duplicados"

  SA-006:
    perfil: "documentation-analyst"
    justificacion: "Validacion de links y paths"
```

---

## 4. MANEJO DE RESULTADOS

### 4.1 Formato de Consolidacion

```yaml
consolidacion:
  por_subagente:
    estructura:
      - hallazgos_principales
      - gaps_identificados
      - metricas_calculadas
      - recomendaciones

  agregacion:
    metodo: "Merge por categoria"
    prioridad: "P0 > P1 > P2"
    conflictos: "Manual review"
```

### 4.2 Matriz de Resultados

| Subagente | Hallazgos | Gaps P0 | Gaps P1 | Acciones |
|-----------|-----------|---------|---------|----------|
| SA-001 | 12 | 2 | 3 | P0-001, P0-002 |
| SA-002 | 5 | 1 | 1 | P0-003 |
| SA-003 | 8 | 1 | 2 | P0-004 |
| SA-004 | 6 | 1 | 2 | P0-005 |
| SA-005 | 3 | 0 | 1 | Ninguna |
| **TOTAL** | **34** | **5** | **9** | **5** |

---

## 5. CRITERIOS DE EXITO

### 5.1 Validacion de Completitud

```yaml
criterios_exito:
  cobertura:
    target: "100% EPICs analizadas"
    resultado: "22/22 = 100%"
    estado: "CUMPLIDO"

  gaps_p0:
    target: "100% gaps P0 corregidos"
    resultado: "5/5 = 100%"
    estado: "CUMPLIDO"

  documentacion:
    target: "CAPVED completo"
    resultado: "6 fases documentadas"
    estado: "CUMPLIDO"

  gobernanza:
    target: "_INDEX.yml + trazas"
    resultado: "Ambos actualizados"
    estado: "CUMPLIDO"
```

### 5.2 Metricas de Calidad

| Metrica | Antes | Despues | Mejora |
|---------|-------|---------|--------|
| Cobertura Documentacion | 75% | ~90% | +15% |
| EPICs con RF formales | 17/22 | 21/22 | +4 |
| EPICs con TRACEABILITY | 19/22 | 21/22 | +2 |
| EPICs patron SCRUM | 20/22 | 21/22 | +1 |

---

## 6. LECCIONES APRENDIDAS

### 6.1 Que Funciono Bien

1. **Paralelizacion de subagentes**: Redujo tiempo de analisis
2. **Contexto detallado en prompts**: Subagentes autonomos
3. **Consolidacion post-analisis**: Vision integrada de gaps
4. **Acciones P0 inmediatas**: Correccion sin deuda tecnica

### 6.2 Que Podria Mejorarse

1. **Rate limits de subagentes**: Algunos se interrumpieron
2. **Formato de prompts**: Podrian ser mas estandarizados
3. **Validacion automatica**: Script para verificar estructura

### 6.3 Patrones Replicables

```yaml
patrones_replicables:
  analisis_documentacion:
    - "Dividir por fases/dominios"
    - "Asignar subagentes especializados"
    - "Consolidar con matriz de validacion"
    - "Priorizar gaps (P0, P1, P2)"
    - "Ejecutar correcciones en paralelo"

  estructura_prompt:
    - "Contexto claro (proyecto, ubicacion)"
    - "Alcance especifico (archivos a leer)"
    - "Formato de salida esperado"
    - "Referencias a modelos/templates"
```

---

**Generado:** 2026-01-20
**Tarea:** TASK-2026-01-20-001
