# SIMCO: CONTROL DE TOKENS

**Version:** 2.0.0
**Sistema:** SIMCO - NEXUS v4.1
**Proposito:** Gestionar limites de tokens por modelo para evitar errores de overflow
**Fecha:** 2026-02-11

---

## LIMITES POR MODELO

```yaml
LIMITES_POR_MODELO:
  claude_opus_4_6:
    ventana_contexto: 200000
    alerta: 160000        # 80%
    seguro: 150000        # 75%
    minimo_efectivo: 10000

  claude_sonnet_4_5:
    ventana_contexto: 200000
    alerta: 160000
    seguro: 150000
    minimo_efectivo: 10000

  claude_haiku_4_5:
    ventana_contexto: 200000
    alerta: 160000
    seguro: 150000
    minimo_efectivo: 10000

  gemini_pro_flash:
    ventana_contexto: 1000000
    alerta: 800000
    seguro: 750000
    minimo_efectivo: 10000

  windsurf_cascade:
    ventana_contexto: 128000
    alerta: 102000        # 80%
    seguro: 96000         # 75%
    minimo_efectivo: 8000
```

---

## PRESUPUESTO POR NIVEL DE CONTEXTO

```yaml
PRESUPUESTO_CONTEXTO:
  L0_sistema:
    tokens: 8000
    incluye:
      - CLAUDE.md (~4000 tokens)
      - SIMCO-TAREA.md (~1500 tokens)
      - Principios fundamentales resumen (~1500 tokens)
      - Perfil de agente (~500 tokens)
      - CONTEXT-MAP.yml (~500 tokens)
    obligatorio: true
    nunca_purgar: true

  L1_proyecto:
    tokens: 5000
    incluye:
      - PROJECT-CONTEXT.md (~2000 tokens)
      - PROXIMA-ACCION.md (~500 tokens)
      - MASTER_INVENTORY.yml (~1500 tokens)
      - Variables pre-resueltas (~1000 tokens)
    obligatorio: true

  L2_operacion:
    tokens: 4000
    incluye:
      - SIMCO de dominio (~1200 tokens)
      - Inventario de dominio (~1500 tokens)
      - Referencias especificas (~1300 tokens)
    obligatorio: false
    purgar_al_cambiar_dominio: true

  L3_tarea:
    tokens: 3000 (dinamico, max segun modelo)
    incluye:
      - Especificacion de tarea
      - Codigo de referencia (solo lineas relevantes)
      - DDL/Entity/Component relacionado
    dinamico: true
    purgar_al_completar_subtarea: true

  TOTAL_BASE: 20000      # L0 + L1 + L2 + L3
  DISPONIBLE_TAREA: 130000  # 150000 seguro - 20000 base (Claude)
  MARGEN_SEGURIDAD: 50000   # Para respuesta del agente
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

### Triggers de Limpieza

```yaml
TRIGGERS_LIMPIEZA:
  post_5_files:
    condicion: "5+ archivos leidos en sesion"
    accion: "Evaluar ACTIVE vs REFERENCE vs STALE"

  post_subtarea:
    condicion: "Subtarea completada"
    accion: "Purgar L3 completado"

  contexto_50_pct:
    condicion: "Uso > 50% ventana de contexto"
    accion: "Inventariar + clasificar + purgar STALE"

  pre_delegacion:
    condicion: "Antes de delegar a subagente"
    accion: "Limpiar para maximizar espacio"

  compactacion_inminente:
    condicion: "Sistema indica compactacion proxima"
    accion: "Guardar PROXIMA-ACCION + purga agresiva"
```

### Senales de Riesgo (Claude 200K)

```yaml
ALERTA_AMARILLA:
  condicion: "tokens_estimados > 120000"
  accion: "Considerar limpieza de contexto"

ALERTA_NARANJA:
  condicion: "tokens_estimados > 160000"
  accion: "Limpieza RECOMENDADA, desglose si necesario"

ALERTA_ROJA:
  condicion: "tokens_estimados > 180000"
  accion: "Limpieza OBLIGATORIA, guardar PROXIMA-ACCION"
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

**Version:** 2.0.0 | **Sistema:** SIMCO-NEXUS v4.1 | **Tipo:** Directiva de Control
