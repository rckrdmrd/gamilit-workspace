# SIMCO: CONTROL DE TOKENS

**Versión:** 1.0.0
**Sistema:** SIMCO - NEXUS v4.0
**Propósito:** Gestionar límites de tokens para evitar errores de overflow
**Fecha:** 2026-01-04

---

## LÍMITES ESTABLECIDOS

```yaml
LIMITES_TOKENS:
  absoluto: 25000      # Máximo por solicitud (error si se supera)
  alerta: 20000        # Warning - considerar desglose
  seguro: 18000        # Recomendado para operación normal
  minimo_efectivo: 5000 # Mínimo para tareas simples
```

---

## PRESUPUESTO POR NIVEL DE CONTEXTO

```yaml
PRESUPUESTO_CONTEXTO:
  L0_sistema:
    tokens: 4500
    incluye:
      - 6 Principios fundamentales (~600 tokens c/u = 3600)
      - Perfil de agente (~500 tokens)
      - ALIASES.yml resueltos (~400 tokens)
    obligatorio: true

  L1_proyecto:
    tokens: 3000
    incluye:
      - CONTEXTO-PROYECTO.md (~1500 tokens)
      - PROXIMA-ACCION.md (~500 tokens)
      - Inventario relevante (~1000 tokens)
    obligatorio: true

  L2_operacion:
    tokens: 2500
    incluye:
      - SIMCO de operación (~800 tokens)
      - SIMCO de dominio (~800 tokens)
      - Referencias específicas (~900 tokens)
    obligatorio: true

  L3_tarea:
    tokens: variable (max 8000)
    incluye:
      - Especificación de tarea
      - Código de referencia (solo líneas relevantes)
      - DDL relacionado (si aplica)
    dinamico: true

  TOTAL_BASE: 10000   # L0 + L1 + L2
  DISPONIBLE_TAREA: 8000  # 18000 - 10000
  MARGEN_SEGURIDAD: 7000  # Para respuesta del agente
```

---

## ESTRATEGIAS DE MITIGACIÓN

### 1. Desglose de Tareas

```yaml
CRITERIO_DESGLOSE:
  si_tarea_requiere: ">3000 tokens de contexto específico"
  accion: "DESGLOSAR en subtareas"

  reglas:
    - max_archivos_por_subtarea: 2
    - max_lineas_codigo_inline: 50
    - preferir_referencias: "file:line-range"

EJEMPLO_DESGLOSE:
  # MAL - Tarea muy grande
  tarea: "Crear módulo completo de notificaciones"
  tokens_estimados: 15000

  # BIEN - Desglosado
  subtareas:
    - ST-001: "Crear tabla notifications" # ~3000 tokens
    - ST-002: "Crear NotificationEntity"  # ~2500 tokens
    - ST-003: "Crear NotificationService"  # ~2500 tokens
    - ST-004: "Crear NotificationController" # ~2500 tokens
```

### 2. Carga de Contexto Escalonada

```yaml
CARGA_ESCALONADA:
  paso_1_obligatorio:
    - L0_sistema (siempre)
    - L1_proyecto (siempre)

  paso_2_segun_operacion:
    - L2_operacion (solo SIMCO relevante)

  paso_3_bajo_demanda:
    - L3_tarea (solo lo directamente relacionado)
    - NO cargar código completo de archivos
    - Usar referencias: "Ver {archivo}:{lineas}"
```

### 3. Compactación de Contexto

```yaml
TECNICAS_COMPACTACION:
  aliases:
    usar: "@ALIAS en lugar de rutas completas"
    ejemplo: "@DDL/schemas/auth/" vs "apps/database/ddl/schemas/auth/"
    ahorro: "~30% de caracteres"

  referencias_linea:
    usar: "file:line-range"
    ejemplo: "user.entity.ts:45-60"
    ahorro: "Evita incluir archivo completo"

  resumenes:
    usar: "Descripción de 1-2 líneas en lugar de contenido"
    ejemplo: "Ver DDL de tabla users (20 columnas, 3 índices)"
    ahorro: "~90% vs incluir DDL completo"

  herencia_contexto:
    usar: "Variables pre-resueltas del CONTEXT-MAP"
    evitar: "Repetir definiciones en cada delegación"
```

---

## DETECCIÓN Y ALERTAS

### Señales de Riesgo

```yaml
ALERTA_AMARILLA:
  condicion: "tokens_estimados > 15000"
  accion: "Considerar desglose"
  mensaje: "Tarea grande - evaluar si se puede dividir"

ALERTA_NARANJA:
  condicion: "tokens_estimados > 20000"
  accion: "Desglose RECOMENDADO"
  mensaje: "Riesgo de truncamiento - dividir tarea"

ALERTA_ROJA:
  condicion: "tokens_estimados > 23000"
  accion: "Desglose OBLIGATORIO"
  mensaje: "Error inminente - NO proceder sin dividir"
```

### Estimación de Tokens

```yaml
ESTIMACION_RAPIDA:
  # Aproximaciones para cálculo mental
  1_token: "~4 caracteres en inglés"
  1_linea_codigo: "~15-25 tokens"
  1_archivo_pequeño: "~200-500 tokens"
  1_archivo_mediano: "~500-1500 tokens"
  1_archivo_grande: "~1500-3000 tokens"

  SIMCO_tipico: "~800-1200 tokens"
  PERFIL_tipico: "~400-600 tokens"
  TEMPLATE_tipico: "~600-1000 tokens"
```

---

## PROTOCOLO SI SE EXCEDE LÍMITE

```yaml
SI_ERROR_TOKENS:
  paso_1_identificar:
    - Revisar qué archivos están cargados
    - Identificar contenido más pesado

  paso_2_reducir:
    - Eliminar código inline no esencial
    - Usar referencias en lugar de contenido
    - Resumir en lugar de copiar

  paso_3_desglosar:
    - Dividir tarea en subtareas más pequeñas
    - Cada subtarea: 1-2 archivos máximo
    - Ejecutar secuencialmente

  paso_4_documentar:
    - Registrar en SESSION-TRACKING si fue por delegación
    - Agregar nota en PROXIMA-ACCION.md si fue tarea principal
```

---

## INTEGRACIÓN CON CONTEXT-MAP

El CONTEXT-MAP.yml de cada proyecto debe respetar estos límites:

```yaml
# En CONTEXT-MAP.yml
contexto_por_nivel:
  L0_sistema:
    tokens_estimados: 4500  # Verificar no excede
  L1_proyecto:
    tokens_estimados: 3000  # Verificar no excede
  L2_operacion:
    tokens_estimados: 2500  # Verificar no excede
  L3_tarea:
    tokens_max: 8000        # Límite dinámico

validacion_tokens:
  total_estimado: 18000     # Debe ser <= limite_seguro
  margen_disponible: 7000   # Para respuesta
```

---

## CHECKLIST PRE-DELEGACION

Antes de delegar a subagente, ejecutar **OBLIGATORIAMENTE**:

```yaml
CHECKLIST_OBLIGATORIO:
  archivo: "orchestration/checklists/CHECKLIST-PRE-DELEGACION.md"

CHECKLIST_RAPIDO:
  - [ ] 1. Tarea delimitada (max 2 archivos)
  - [ ] 2. Template correcto seleccionado
  - [ ] 3. Contexto heredado incluido
  - [ ] 4. Tokens estimados < 2,500
  - [ ] 5. Perfil COMPACT especificado
```

---

## INTEGRACION CON DELEGACION

### Referencia Obligatoria

Antes de delegar, ejecutar:
- `orchestration/checklists/CHECKLIST-PRE-DELEGACION.md`

### Templates por Tokens

| Tokens Disponibles | Template | Formato Herencia |
|--------------------|----------|------------------|
| >15,000 | ESTANDAR o COMPLETA | Completo |
| 8,000-15,000 | ESTANDAR o MINIMA | Compactado |
| <8,000 | MINIMA | Ultra-compactado |

### Perfiles Compactos

Para subagentes, usar:
- `orchestration/agents/perfiles/compact/PERFIL-*-COMPACT.md`
- Ahorro: ~550 tokens por perfil

---

## REFERENCIAS

| Documento | Proposito |
|-----------|-----------|
| `PRINCIPIO-ECONOMIA-TOKENS.md` | Principio fundamental |
| `SIMCO-DELEGACION.md` | Limites en delegacion |
| `SIMCO-SUBAGENTE.md` | Protocolo para subagentes |
| `SIMCO-CCA-SUBAGENTE.md` | CCA ligero para subagentes |
| `CHECKLIST-PRE-DELEGACION.md` | Checklist obligatorio |
| `CONTEXT-MAP.yml` | Presupuesto por proyecto |
| `agents/perfiles/compact/` | Perfiles compactos |

---

**Version:** 1.1.0 | **Sistema:** SIMCO-NEXUS v4.0 | **Tipo:** Directiva de Control
