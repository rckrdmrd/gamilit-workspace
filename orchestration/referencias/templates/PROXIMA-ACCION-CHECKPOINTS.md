# PROXIMA-ACCION con Checkpoints Granulares

**Template:** PROXIMA-ACCION-CHECKPOINTS.md
**Sistema:** SIMCO v4.0.0 + NEXUS v4.0
**Versión:** 2.0.0

---

## Propósito

Este template extiende PROXIMA-ACCION.md con checkpoints granulares para:
- Permitir rollback seguro a estados anteriores
- Facilitar handoff entre sesiones
- Registrar decisiones y archivos modificados
- Optimizar uso de tokens entre sesiones

---

## Formato YAML

```yaml
# ═══════════════════════════════════════════════════════════════════════════════
# SESIÓN CON CHECKPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

session:
  id: "SESSION-{YYYY-MM-DD}-{NNN}"
  proyecto: "{nombre-proyecto}"
  tarea: "TASK-{YYYY-MM-DD}-{NNN}"
  agente_principal: "claude-code"  # o gemini-cli
  inicio: "{ISO-timestamp}"
  tokens_presupuesto: {número}

# ─────────────────────────────────────────────────────────────────────────────────
# CHECKPOINTS
# ─────────────────────────────────────────────────────────────────────────────────

checkpoints:
  - numero: 0
    fase: "inicio"
    timestamp: "{ISO-timestamp}"
    tokens_usados: {número}
    tokens_restantes: {número}
    archivos_cargados:
      - "CLAUDE.md"
      - "BOOTLOADER.md"
    archivos_modificados: []
    tareas_completadas: []
    decisiones: []
    rollback_seguro: true
    estado_git:
      branch: "main"
      commit: "{short-hash}"
      clean: true

  - numero: 1
    fase: "analisis"
    timestamp: "{ISO-timestamp}"
    tokens_usados: {número}
    tokens_restantes: {número}
    archivos_cargados:
      - "CLAUDE.md"
      - "BOOTLOADER.md"
      - "PROJECT-STATUS.md"
      - "CONTEXT-MAP.yml"
    archivos_modificados: []
    tareas_completadas:
      - "Análisis inicial completado"
      - "Archivos afectados identificados"
    decisiones:
      - id: "DECISION-{NNN}"
        descripcion: "{descripción de la decisión}"
        razon: "{por qué se tomó}"
        reversible: true
    rollback_a: 0
    estado_git:
      branch: "main"
      commit: "{short-hash}"
      clean: true

  - numero: 2
    fase: "planificacion"
    timestamp: "{ISO-timestamp}"
    tokens_usados: {número}
    tokens_restantes: {número}
    archivos_cargados:
      # Lista de archivos en contexto
    archivos_modificados: []
    tareas_completadas:
      - "Plan atómico generado"
      - "Tareas para Windsurf preparadas"
    decisiones:
      - id: "DECISION-{NNN}"
        descripcion: "{descripción}"
    archivos_en_edicion: []
    plan_generado: "{ruta al plan}"
    rollback_a: 1

  - numero: 3
    fase: "ejecucion"
    timestamp: "{ISO-timestamp}"
    tokens_usados: {número}
    tokens_restantes: {número}
    archivos_modificados:
      - path: "{ruta/al/archivo.ts}"
        operacion: "editar"  # crear|editar|eliminar
        lineas_cambiadas: {número}
        backup: "{ruta/backup}"
    tareas_completadas:
      - "Tarea T01 completada"
      - "Tarea T02 completada"
    tests_ejecutados:
      - "npm run build: PASS"
      - "npm run lint: PASS"
    rollback_a: 2
    estado_git:
      branch: "main"
      commit: "{short-hash}"
      dirty_files: ["{lista de archivos modificados}"]

  - numero: 4
    fase: "validacion"
    timestamp: "{ISO-timestamp}"
    tokens_usados: {número}
    tokens_restantes: {número}
    validaciones:
      build: "PASS"
      lint: "PASS"
      tests: "PASS"
      coherencia: "PASS"
      inventarios: "ACTUALIZADOS"
    tareas_completadas:
      - "Validación final completada"
      - "Inventarios actualizados"
    rollback_a: 3
    estado_git:
      branch: "main"
      commit: "{short-hash}"
      pushed: true

# ─────────────────────────────────────────────────────────────────────────────────
# PRÓXIMA ACCIÓN
# ─────────────────────────────────────────────────────────────────────────────────

proxima_accion:
  descripcion: "{Descripción clara de qué hacer a continuación}"
  checkpoint_inicio: {número}
  archivos_a_cargar:
    - "{ruta/archivo1}"
    - "{ruta/archivo2}"
  contexto_requerido:
    - "CLAUDE.md del proyecto"
    - "Plan atómico generado"
    - "Decisiones tomadas"
  agente_sugerido: "windsurf"  # o claude-code, trae, gemini-cli
  fase_siguiente: "ejecucion"  # analisis, planificacion, ejecucion, validacion

# ─────────────────────────────────────────────────────────────────────────────────
# HANDOFF DATA (para nueva sesión)
# ─────────────────────────────────────────────────────────────────────────────────

handoff:
  decision_log: "{ruta a DECISIONS-ACTIVE.yml}"
  requirements: "{ruta a requerimientos}"
  plan_atomico: "{ruta a plan atómico}"
  archivos_bloqueados: []
  archivos_pendientes:
    - "{ruta/archivo1.ts}"
    - "{ruta/archivo2.ts}"
  commits_realizados:
    - hash: "{short-hash}"
      mensaje: "{mensaje del commit}"
  estado_tarea: "en_progreso"  # pendiente, en_progreso, bloqueada, completada
```

---

## Reglas de Checkpoints

### Cuándo Crear Checkpoint

1. **Al inicio de sesión** (checkpoint 0)
2. **Al completar cada fase** (análisis, planificación, ejecución, validación)
3. **Cada 30,000 tokens** (configurable en PRESUPUESTO-DINAMICO.yml)
4. **Antes de operación arriesgada** (refactor, migración)
5. **Después de decisión importante**

### Qué Incluir

- Tokens usados hasta el momento
- Archivos cargados en contexto
- Archivos modificados con backup
- Decisiones tomadas con justificación
- Estado de git (branch, commit, clean/dirty)

### Rollback

- Cada checkpoint indica a cuál checkpoint anterior puede hacer rollback
- Rollback implica:
  1. Restaurar archivos desde backup
  2. Descartar decisiones posteriores
  3. Revertir commits si es necesario
  4. Reiniciar desde el checkpoint indicado

---

## Ejemplo de Uso

```yaml
# Ejemplo: Sesión de implementación de nuevo módulo

session:
  id: "SESSION-2026-01-24-001"
  proyecto: "template-saas"
  tarea: "TASK-2026-01-24-003"
  agente_principal: "claude-code"
  inicio: "2026-01-24T10:00:00Z"
  tokens_presupuesto: 60000

checkpoints:
  - numero: 0
    fase: "inicio"
    timestamp: "2026-01-24T10:00:00Z"
    tokens_usados: 8000
    tokens_restantes: 52000
    archivos_cargados:
      - "CLAUDE.md"
      - "projects/template-saas/CLAUDE.md"
    archivos_modificados: []
    tareas_completadas: []
    decisiones: []
    rollback_seguro: true

  - numero: 1
    fase: "analisis"
    timestamp: "2026-01-24T10:15:00Z"
    tokens_usados: 18000
    tokens_restantes: 42000
    archivos_cargados:
      - "CLAUDE.md"
      - "projects/template-saas/CLAUDE.md"
      - "docs/02-modulos/nuevo-modulo.md"
      - "backend/src/modules/auth/auth.module.ts"
    tareas_completadas:
      - "Análisis de requerimientos"
      - "Identificación de archivos afectados"
    decisiones:
      - id: "DECISION-001"
        descripcion: "Usar patrón Repository"
        razon: "Consistencia con módulos existentes"
        reversible: true
    rollback_a: 0

proxima_accion:
  descripcion: "Generar plan atómico para Windsurf"
  checkpoint_inicio: 1
  archivos_a_cargar:
    - "projects/template-saas/CLAUDE.md"
    - "docs/02-modulos/nuevo-modulo.md"
  agente_sugerido: "trae"
  fase_siguiente: "planificacion"
```

---

## Referencias

- `@PRESUPUESTO-DINAMICO` - orchestration/directivas/simco/PRESUPUESTO-DINAMICO.yml
- `@NEXUS` - orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md
- `@DECISIONS-ACTIVE` - orchestration/trazas/DECISIONS-ACTIVE.yml
