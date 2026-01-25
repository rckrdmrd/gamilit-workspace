# SIMCO: GESTION DE CONTEXTO ACTIVA (GCA)

**Version:** 1.0.0
**Sistema:** SIMCO + GCA
**Estado:** DEPRECATED - Usar @NEXUS (SIMCO-CONTEXT-MANAGEMENT-V2.md)
**Proposito:** Gestionar contexto activamente para evitar compactacion y perdida de informacion
**Fecha:** 2026-01-20
**ADR:** ADR-0003

---

> **NOTA DE DEPRECACION (2026-01-24)**
>
> Esta directiva (GCA v1) ha sido **reemplazada** por **NEXUS v4.0** (SIMCO-CONTEXT-MANAGEMENT-V2.md).
>
> **Diferencias:**
> - GCA v1: Arquitectura de 4 CAPAS (Inmutable, Referencias, Trabajo, Traza)
> - NEXUS v4.0: Arquitectura de 4 NIVELES (Sistema, Proyecto, Operacion, Tarea)
>
> **Usar:** `@NEXUS` para gestion de contexto
>
> Este archivo se mantiene como referencia historica.

---

## PRINCIPIO FUNDAMENTAL

> **Contexto minimo, maxima efectividad.**
> **Referencias sobre contenido.**
> **Purga proactiva, no reactiva.**
> **La memoria vive en SESSION-TRACE, no en el contexto.**

---

## 1. ARQUITECTURA DE 4 CAPAS

```
┌─────────────────────────────────────────────────────────────┐
│ CAPA 0: INMUTABLE (~3,000 tokens)                          │
│ → Perfil compact + Principios resumen + Aliases            │
│ → NUNCA se purga                                           │
├─────────────────────────────────────────────────────────────┤
│ CAPA 1: REFERENCIAS (~1,500 tokens)                        │
│ → Mapas de directivas e inventarios (solo paths)           │
│ → Se purga al cambiar proyecto                             │
├─────────────────────────────────────────────────────────────┤
│ CAPA 2: TRABAJO (variable, max ~10,000 tokens)             │
│ → SIMCOs, specs, codigo cargados bajo demanda              │
│ → Purga activa: LRU + post-tarea                           │
├─────────────────────────────────────────────────────────────┤
│ CAPA 3: TRAZA (0 tokens - archivo en disco)                │
│ → SESSION-TRACE.yml como memoria externa                   │
│ → Persistente, consultable bajo demanda                    │
└─────────────────────────────────────────────────────────────┘
```

Ver definicion completa: `CONTEXT-LAYER-MAP.yml`

---

## 2. REGLAS DE GESTION

### R1: Carga Inicial Minima

```yaml
AL_INICIO_SESION:
  cargar:
    capa_0:
      - "PERFIL-{TIPO}-COMPACT.md" (~250 tokens)
      - "PRINCIPIOS-RESUMEN.md" (~300 tokens)
      - "ALIASES-RESOLVED.yml" (~350 tokens)
      - "{proyecto}/CONTEXTO-PROYECTO.md" (seccion variables, ~500 tokens)
    capa_1:
      - "MAPA-DIRECTIVAS.yml" (~400 tokens)
      - "MAPA-INVENTARIOS.yml" (~300 tokens)
    capa_3:
      - Crear SESSION-TRACE-{fecha}.yml

  tokens_resultado: ~4,500
  estado: "LISTO_PARA_TAREAS"
```

### R2: Carga Bajo Demanda

```yaml
AL_RECIBIR_TAREA:
  paso_1: "Analizar descripcion de tarea"
  paso_2: "Consultar MAPA-DIRECTIVAS.yml para identificar SIMCO necesario"
  paso_3: "Consultar MAPA-INVENTARIOS.yml si necesito estado"
  paso_4: "Cargar SOLO archivos identificados a Capa 2"
  paso_5: "Registrar en tracking interno (path, tokens, timestamp)"

  NO_HACER:
    - "Cargar archivos completos cuando solo necesito seccion"
    - "Cargar multiples SIMCOs si solo necesito uno"
    - "Cargar inventario completo cuando solo necesito conteo"
```

### R3: Purga al Completar Tarea

```yaml
AL_COMPLETAR_TAREA:
  paso_1: "Registrar resultado en SESSION-TRACE"
  paso_2: "Identificar items de Capa 2 de esta tarea"
  paso_3: "Purgar: spec_documento, codigo_referencia"
  paso_4: "Evaluar otros items por tiempo inactivo"
  paso_5: "Registrar purga en SESSION-TRACE"

  MANTENER:
    - "SIMCO si siguiente tarea es mismo dominio"
    - "Items usados en ultimos 5 minutos"
```

### R4: Purga por Tiempo Inactivo

```yaml
CADA_CARGA_NUEVA:
  verificar: "Items de Capa 2 con timestamp_ultimo_uso > 10 min"
  si_encontrados:
    - "Registrar en SESSION-TRACE como purgados"
    - "Liberar del contexto"

  EXCEPCION:
    - "No purgar si tarea en progreso usa el item"
```

### R5: Purga Preventiva (Umbral)

```yaml
SI_TOKENS_CAPA_2 > 8000:
  alerta: "[CONTEXTO ALTO] Evaluando purga preventiva"
  accion: "Purgar items LRU hasta tokens < 6000"

SI_TOKENS_CAPA_2 > 10000:
  alerta: "[PURGA FORZADA] Tokens excedidos"
  accion: "Purgar items LRU inmediatamente"
  mantener: "Item de tarea actual"
```

### R6: Consulta de Memoria (SESSION-TRACE)

```yaml
SI_NECESITO_RECORDAR:
  contexto: "Tarea anterior, decision tomada, contexto purgado"
  accion:
    - "Leer SESSION-TRACE.yml"
    - "Extraer solo informacion relevante"
    - "NO cargar todo el archivo al contexto"

  EJEMPLO:
    pregunta: "Que tabla cree antes?"
    consulta: "Leer SESSION-TRACE → tareas_ejecutadas → archivos_creados"
```

---

## 3. FORMATO DE TRACKING INTERNO

El agente debe mantener tracking de Capa 2:

```yaml
TRACKING_CAPA_2:
  items:
    - id: "simco_backend"
      path: "orchestration/directivas/simco/SIMCO-BACKEND.md"
      tokens: 800
      cargado: "10:15:00"
      ultimo_uso: "10:25:00"

    - id: "spec_notificaciones"
      path: "docs/specs/notifications.md"
      tokens: 400
      cargado: "10:20:00"
      ultimo_uso: "10:22:00"

  metricas:
    total_tokens: 1200
    items_count: 2
```

---

## 4. SESSION-TRACE.yml

Archivo de memoria externa (Capa 3):

```yaml
# {proyecto}/orchestration/trazas/SESSION-TRACE-2026-01-20.yml
version: "1.0.0"

sesion:
  inicio: "2026-01-20T10:00:00"
  agente: "BACKEND"
  proyecto: "gamilit"

contexto_inicial:
  capa_0: 3000
  capa_1: 1500
  total: 4500

tareas_ejecutadas:
  - id: "ST-001"
    descripcion: "Crear NotificationEntity"
    inicio: "10:05:00"
    fin: "10:15:00"
    resultado: "completada"
    archivos_creados:
      - "src/modules/notification/notification.entity.ts"
    contexto_usado:
      - path: "SIMCO-BACKEND.md"
        tokens: 800
        purgado: "10:20:00"

purgas_ejecutadas:
  - timestamp: "10:20:00"
    razon: "tarea_completada"
    items: ["spec_notificaciones"]
    tokens_liberados: 400

metricas:
  pico_tokens: 5800
  purgas_ejecutadas: 1
  tareas_completadas: 1
```

---

## 5. COMPARATIVA CON SISTEMA ANTERIOR

| Aspecto | CCA Original | GCA |
|---------|--------------|-----|
| Tokens base | ~10,000 | ~4,500 |
| Principios | 6 completos | 1 resumen |
| Inventarios | Completos | Solo mapas |
| Purga | No existe | Activa |
| Memoria | Solo contexto | SESSION-TRACE |
| Recovery | Reactivo | Proactivo |

---

## 6. INTEGRACION CON SISTEMA EXISTENTE

### Con CCA Original

```yaml
COMPATIBILIDAD:
  - GCA es EXTENSION, no reemplazo
  - CCA original sigue disponible como fallback
  - Usar GCA por defecto, CCA si GCA falla
```

### Con SIMCO-CONTEXT-ENGINEERING

```yaml
RELACION:
  - CONTEXT-ENGINEERING define teoria (niveles L0-L3)
  - GCA implementa gestion activa sobre esa teoria
  - CONTEXT-LAYER-MAP mapea L0-L3 a Capas 0-3
```

### Con Subagentes

```yaml
HERENCIA_GCA:
  formato: |
    [GCA-CTX]
    PRJ:{proyecto}|LVL:{nivel}|AGENT:{tipo}
    REFS:@DDL→{path}|@BACKEND→{path}
    TRACE:SESSION-TRACE-{fecha}.yml
    PREV:{tareas_completadas}
    [/GCA-CTX]

  tokens: ~100-150 (vs ~500-1000 anterior)
```

---

## 7. CHECKLIST DE SESION GCA

```markdown
## Inicio de Sesion GCA

### Carga Inicial
- [ ] Perfil compact cargado
- [ ] Principios resumen cargado
- [ ] Aliases resueltos cargado
- [ ] Contexto proyecto (variables) cargado
- [ ] Mapas de Capa 1 cargados
- [ ] SESSION-TRACE creado
- [ ] Total < 5000 tokens

### Durante Sesion
- [ ] Consultar mapas ANTES de cargar archivos
- [ ] Cargar solo lo necesario a Capa 2
- [ ] Registrar timestamps de carga
- [ ] Purgar al completar tareas
- [ ] Registrar en SESSION-TRACE

### Fin de Sesion
- [ ] Todas las tareas registradas en SESSION-TRACE
- [ ] Purgas documentadas
- [ ] Metricas actualizadas
```

---

## 8. ANTI-PATRONES

```yaml
EVITAR:
  AP1_CARGA_MASIVA:
    descripcion: "Cargar todo el contexto al inicio"
    problema: "Desperdicio de tokens, riesgo compactacion"
    solucion: "Usar carga bajo demanda"

  AP2_IGNORAR_MAPAS:
    descripcion: "Cargar archivos sin consultar mapas"
    problema: "Puede cargar mas de lo necesario"
    solucion: "Siempre consultar Capa 1 primero"

  AP3_NO_PURGAR:
    descripcion: "Mantener contexto de tareas anteriores"
    problema: "Acumulacion hasta compactacion"
    solucion: "Purgar activamente post-tarea"

  AP4_IGNORAR_TRACE:
    descripcion: "No usar SESSION-TRACE como memoria"
    problema: "Perder historial, re-trabajo"
    solucion: "Consultar trace cuando necesite recordar"

  AP5_DUPLICAR_CARGA:
    descripcion: "Cargar mismo archivo multiples veces"
    problema: "Tokens desperdiciados"
    solucion: "Verificar tracking antes de cargar"
```

---

## 9. METRICAS DE EXITO

```yaml
INDICADORES_POSITIVOS:
  - "Tokens base < 5000"
  - "Cero compactaciones por sesion"
  - "Purgas ejecutadas sin perder info critica"
  - "SESSION-TRACE completo al final"

INDICADORES_NEGATIVOS:
  - "Tokens > 15000 frecuentemente"
  - "Recovery necesario"
  - "Info perdida no recuperable de trace"
  - "Purga elimina contexto activo"
```

---

## 10. REFERENCIAS

| Documento | Proposito |
|-----------|-----------|
| `CONTEXT-LAYER-MAP.yml` | Definicion de capas |
| `SIMCO-CONTEXT-ENGINEERING.md` | Teoria base |
| `SIMCO-INICIALIZACION.md` | CCA original (fallback) |
| `PRINCIPIO-ECONOMIA-TOKENS.md` | Principio fundamental |
| `ADR-0003` | Decision arquitectonica |

---

**Version:** 1.0.0 | **Sistema:** GCA + SIMCO | **Tipo:** Directiva de Gestion
