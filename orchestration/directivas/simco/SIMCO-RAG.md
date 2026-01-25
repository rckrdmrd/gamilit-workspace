# SIMCO-RAG: Interaccion con Sistema RAG

**Version:** 1.0.0
**Fecha:** 2026-01-04
**Aplica a:** Todo agente que consulte informacion del workspace
**Prioridad:** OBLIGATORIA para consultas sobre el workspace

---

## RESUMEN EJECUTIVO

> **El RAG es la FUENTE DE VERDAD del workspace. SIEMPRE consultar antes de afirmar.**

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════════╗
║  VERIFICAR → CITAR → SINCRONIZAR → VALIDAR                               ║
║                                                                           ║
║  1. VERIFICAR antes de afirmar (consultar RAG)                           ║
║  2. CITAR siempre las fuentes (file:line)                                ║
║  3. SINCRONIZAR despues de modificar (indexar documentos)                ║
║  4. VALIDAR antes de propagar (analizar impacto)                         ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## PRINCIPIOS DETALLADOS

### 1. VERIFICAR ANTES DE AFIRMAR

**ANTES** de responder cualquier pregunta sobre el workspace:

```yaml
proceso:
  1_consultar:
    herramienta: rag_query_context
    parametros:
      query: "{pregunta del usuario}"
      threshold: 0.7
  2_evaluar:
    si_confidence >= 0.7: "Responder con citas"
    si_confidence >= 0.5: "Responder con advertencia"
    si_confidence < 0.5: "Indicar que no se encontro"
  3_nunca:
    - Inventar informacion
    - Asumir sin verificar
    - Mezclar fuentes sin indicar
```

### 2. CITAR SIEMPRE

**TODA** informacion del RAG debe incluir referencias exactas:

```yaml
formato_cita:
  estructura: "Segun {path}:{lineas} (confidence: X%): ..."
  ejemplo: "Segun orchestration/directivas/simco/SIMCO-TAREA.md:45-67 (confidence: 92%): El proceso CAPVED requiere..."

incluir_siempre:
  - Ruta del documento fuente
  - Lineas especificas (cuando aplique)
  - Nivel de confianza del match
```

### 3. SINCRONIZACION OBLIGATORIA

**DESPUES** de crear o modificar documentacion:

```yaml
proceso:
  1_modificar: "Realizar cambio en documento"
  2_indexar:
    herramienta: rag_index_document
    parametros:
      path: "{ruta_del_documento}"
  3_verificar: "Confirmar indexacion exitosa"
  4_relaciones: "Verificar que relaciones se actualizaron"
```

### 4. VALIDAR ANTES DE PROPAGAR

**ANTES** de propagar cambios:

```yaml
proceso:
  1_analizar:
    herramienta: rag_explain_impact
    parametros:
      path: "{documento_modificado}"
      change_type: "modify"
  2_revisar:
    - direct_dependents
    - indirect_dependents
    - agents_affected
    - risk_level
  3_planificar: "Ordenar actualizaciones por dependencia"
  4_ejecutar: "Propagar en orden"
```

---

## HERRAMIENTAS MCP DISPONIBLES

### Consultas Semanticas

| Herramienta | Uso | Obligatoriedad |
|-------------|-----|----------------|
| `rag_query_context` | Buscar informacion | SIEMPRE antes de responder |
| `rag_get_directive` | Obtener directiva SIMCO | Al seguir directivas |
| `rag_get_agent_profile` | Cargar perfil de agente | Al iniciar como agente |

### Trazabilidad y Referencias

| Herramienta | Uso | Obligatoriedad |
|-------------|-----|----------------|
| `rag_trace_reference` | Verificar afirmacion | Cuando hay duda |
| `rag_get_relations` | Ver dependencias | Antes de modificar |
| `rag_find_code` | Buscar codigo | Para referencias exactas |
| `rag_explain_impact` | Analizar impacto | Antes de propagar |

### Indexacion y Sincronizacion

| Herramienta | Uso | Obligatoriedad |
|-------------|-----|----------------|
| `rag_index_document` | Indexar documento | Despues de crear/modificar |
| `rag_sync_category` | Sincronizar categoria | Periodicamente |
| `rag_get_sync_status` | Ver estado sync | Para verificar |

### Validacion y Calidad

| Herramienta | Uso | Obligatoriedad |
|-------------|-----|----------------|
| `rag_validate_coverage` | Verificar cobertura | Periodicamente |
| `rag_report_feedback` | Reportar calidad | Cuando falta/sobra info |

---

## FLUJOS DE TRABAJO

### Al Recibir una Pregunta sobre el Workspace

```
Pregunta del usuario
        │
        v
¿Es sobre el workspace?
        │
   ┌────┴────┐
   │ SI      │ NO
   v         v
rag_query   Responder
_context    normalmente
   │
   v
¿Resultados > 0.7?
   │
   ├─ SI → Responder con citas
   │
   ├─ 0.5-0.7 → Responder con advertencia
   │
   └─ < 0.5 → Indicar que no se encontro
```

### Al Crear Documentacion

```
Crear documento
       │
       v
Escribir contenido
       │
       v
Agregar frontmatter correcto
       │
       v
Guardar archivo
       │
       v
rag_index_document
       │
       v
¿Indexado OK?
   │
   ├─ SI → Verificar relaciones
   │
   └─ NO → Revisar errores, reintentar
```

### Al Modificar Documentacion

```
Identificar documento
        │
        v
rag_explain_impact
        │
        v
Revisar dependientes
        │
        v
Realizar modificacion
        │
        v
rag_index_document
        │
        v
Propagar a dependientes (si aplica)
```

---

## ERRORES COMUNES

| Error | Causa | Solucion |
|-------|-------|----------|
| "No se encontro informacion" | Query muy especifico | Generalizar busqueda |
| "Confidence baja" | Documento no indexado | Ejecutar sync |
| "Referencia rota" | Documento eliminado/movido | Actualizar referencias |
| "Embedding fallido" | Problema con API | Reintentar con backoff |

---

## METRICAS DE CALIDAD

El sistema RAG debe mantener:

| Metrica | Objetivo |
|---------|----------|
| Cobertura | 100% de orchestration/ indexado |
| Freshness | Sync delay < 5 minutos |
| Precision | Confidence promedio > 0.80 |
| Disponibilidad | Uptime > 99.9% |

---

## CHECKLIST

```
ANTES DE RESPONDER SOBRE WORKSPACE
├── [ ] Consultar rag_query_context
├── [ ] Verificar confidence >= 0.7
├── [ ] Incluir citas con file:line
└── [ ] Indicar incertidumbre si aplica

DESPUES DE CREAR/MODIFICAR DOCS
├── [ ] Ejecutar rag_index_document
├── [ ] Verificar indexacion exitosa
├── [ ] Revisar relaciones actualizadas
└── [ ] Propagar si es necesario

ANTES DE PROPAGAR CAMBIOS
├── [ ] Ejecutar rag_explain_impact
├── [ ] Revisar risk_level
├── [ ] Planificar orden de actualizacion
└── [ ] Documentar propagacion
```

---

## REFERENCIAS

- **MCP Server RAG:** @MCP_RAG
- **Perfil:** @PERFIL_RAG_ENGINEER
- **Validar:** @SIMCO/SIMCO-VALIDAR.md
- **Propagar:** @SIMCO/SIMCO-PROPAGACION-MEJORAS.md

---

**Version:** 1.0.0 | **Sistema:** SIMCO | **EPIC:** EPIC-013
