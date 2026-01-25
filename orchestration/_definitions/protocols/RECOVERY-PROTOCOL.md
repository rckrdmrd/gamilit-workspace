# RECOVERY-PROTOCOL.md

> **Sistema:** NEXUS v4.1
> **Versión:** 1.0.0
> **Fecha:** 2026-01-24
> **Alias:** @DEF_RECOVERY

---

## 1. PROPÓSITO

Este protocolo define cómo recuperar una sesión de trabajo después de:
- Compactación automática de Claude
- Cambio de sesión/ventana
- Timeout por inactividad
- Handoff entre agentes

**Objetivo:** Tiempo de recuperación < 3 minutos con < 10% de información perdida.

---

## 2. ESCENARIOS DE RECOVERY

| Escenario | Síntomas | Acción |
|-----------|----------|--------|
| **Compactación** | Claude "olvidó" contexto previo | Recovery completo |
| **Nueva sesión** | Continuar trabajo anterior | Recovery desde PROXIMA-ACCION |
| **Handoff** | Otro agente continuará | Recovery + HANDOFF-CONTRACT |
| **Error crítico** | Sesión corrompida | Recovery desde último checkpoint |

---

## 3. PROTOCOLO DE 4 PASOS

### PASO 1: IDENTIFICAR FUENTE DE RECOVERY

```
╔═══════════════════════════════════════════════════════════╗
║  ORDEN DE PREFERENCIA:                                    ║
║                                                           ║
║  1. PROXIMA-ACCION.md (más reciente, más compacto)       ║
║  2. Último CHECKPOINT-*.yml (más completo)               ║
║  3. SESSION-STATE.yml (si existe)                        ║
║  4. HANDOFF-CONTRACT.md (si es handoff)                  ║
╚═══════════════════════════════════════════════════════════╝
```

**Comandos para identificar:**
```bash
# Ver PROXIMA-ACCION
cat {proyecto}/orchestration/PROXIMA-ACCION.md

# Encontrar último checkpoint
ls -t {proyecto}/orchestration/trazas/CHECKPOINT-*.yml | head -1

# Ver estado de sesión
cat {proyecto}/orchestration/trazas/SESSION-STATE.yml
```

### PASO 2: CARGAR CONTEXTO MÍNIMO

**Secuencia de carga (L0 → L1):**

```yaml
# Siempre cargar (L0)
1. CLAUDE.md                    # Reglas del workspace (~4000 tokens)
2. SIMCO-TAREA.md               # Protocolo de tareas (~1500 tokens)

# Cargar según proyecto (L1)
3. {proyecto}/CONTEXTO-PROYECTO.md  # Si existe (~1500 tokens)
4. {proyecto}/orchestration/PROXIMA-ACCION.md  # Estado (~500 tokens)

# Total L0+L1: ~7500 tokens (37.5% del presupuesto)
```

**NO cargar en recovery inicial:**
- Inventarios completos
- SIMCO de dominio específico
- Archivos de código
- Documentación extensa

### PASO 3: RESTAURAR ESTADO DE TAREA

Desde PROXIMA-ACCION.md o checkpoint, extraer:

```yaml
estado_restaurado:
  proyecto: "[nombre]"
  tarea_id: "TASK-YYYY-MM-DD-NNN"
  fase_capved: "[C|A|P|V|E|D]"
  subtarea_actual: "[descripción]"

decisiones_previas:
  - "[decisión 1]"
  - "[decisión 2]"

archivos_relevantes:
  - "[path modificado recientemente]"

proxima_accion: "[siguiente paso]"
```

**Validar estado:**
- [ ] Proyecto existe en workspace
- [ ] Tarea tiene carpeta en orchestration/tareas/
- [ ] Archivos modificados existen
- [ ] No hay conflictos de git

### PASO 4: CONTINUAR DESDE PRÓXIMA ACCIÓN

1. Leer `proxima_accion` del checkpoint/PROXIMA-ACCION
2. Identificar dominio necesario (DDL/Backend/Frontend)
3. Cargar L2 solo si es necesario para próxima acción
4. Ejecutar próxima acción

**NO hacer:**
- Re-analizar toda la tarea desde cero
- Cargar todos los archivos mencionados
- Re-tomar decisiones ya tomadas

---

## 4. TIEMPOS ESTIMADOS

| Paso | Tiempo | Tokens |
|------|--------|--------|
| Identificar fuente | 30 seg | 0 |
| Cargar L0+L1 | 1 min | ~7500 |
| Restaurar estado | 30 seg | +500 |
| Posicionarse | 1 min | +500 |
| **Total** | **< 3 min** | **~8500** |

---

## 5. CHECKLIST DE RECOVERY

```markdown
## Checklist de Recovery

### Pre-Recovery
- [ ] Identificar escenario (compactación/nueva sesión/handoff)
- [ ] Localizar PROXIMA-ACCION.md o checkpoint

### Carga de Contexto
- [ ] CLAUDE.md cargado
- [ ] SIMCO-TAREA.md cargado
- [ ] CONTEXTO-PROYECTO.md cargado (si existe)
- [ ] PROXIMA-ACCION.md leído

### Restauración de Estado
- [ ] Proyecto identificado
- [ ] Tarea activa identificada
- [ ] Fase CAPVED conocida
- [ ] Decisiones previas leídas

### Validación
- [ ] Archivos modificados existen
- [ ] No hay conflictos de git
- [ ] Próxima acción es clara

### Continuación
- [ ] Dominio L2 cargado si necesario
- [ ] Listo para ejecutar próxima acción
```

---

## 6. RECOVERY POR TIPO DE AGENTE

### Claude Code
```
Fuente preferida: PROXIMA-ACCION.md
Contexto adicional: Checkpoint si disponible
Tiempo: < 3 min
```

### Trae (Fase 2)
```
Fuente preferida: HANDOFF-CONTRACT.md de Claude
Contexto adicional: Plan de alto nivel
Tiempo: < 2 min (contexto más limitado)
```

### Windsurf (Fase 3)
```
Fuente preferida: Lista de tareas atómicas de Trae
Contexto adicional: Código literal a escribir
Tiempo: < 1 min (contexto mínimo, tareas específicas)
```

### Gemini CLI
```
Fuente preferida: PROXIMA-ACCION.md
Contexto adicional: Screenshots/estado visual
Tiempo: < 2 min
```

---

## 7. MANEJO DE ERRORES

### Error: Checkpoint no encontrado
```
1. Buscar PROXIMA-ACCION.md
2. Si no existe: Buscar trazas de sesión
3. Si no existe: Preguntar al usuario por contexto
4. Crear nuevo checkpoint inicial
```

### Error: Checkpoint corrupto
```
1. Buscar checkpoint anterior
2. Si hay múltiples: Usar el más reciente válido
3. Si ninguno válido: Recovery manual
```

### Error: Estado inconsistente
```
1. Verificar git status
2. Si hay cambios no commiteados: Evaluar si preservar
3. Si hay conflictos: Resolver antes de continuar
4. Crear checkpoint limpio después de resolver
```

---

## 8. PRESERVACIÓN DE DECISIONES

**Las decisiones son el contexto MÁS VALIOSO.**

En recovery, SIEMPRE:
1. Cargar DECISIONES-SESION.yml si existe
2. Listar decisiones tomadas
3. NO re-evaluar decisiones previas
4. Si hay duda sobre decisión: preguntar, no asumir

```yaml
# Ejemplo de uso de decisiones en recovery
decisiones_previas:
  - id: "DEC-001"
    descripcion: "Usar YAML para schemas"
    # NO re-decidir esto, ya está tomado

  - id: "DEC-002"
    descripcion: "Checkpoints cada 30 min"
    # Aplicar esta regla, ya está decidido
```

---

## 9. DIAGRAMA DE FLUJO

```
┌─────────────────────┐
│   Inicio Recovery   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ¿Existe           │
│  PROXIMA-ACCION?   │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │         │
     Sí        No
      │         │
      ▼         ▼
┌─────────┐  ┌─────────────┐
│ Cargar  │  │ ¿Existe     │
│ PROXIMA │  │ checkpoint? │
└────┬────┘  └──────┬──────┘
     │              │
     │         ┌────┴────┐
     │         │         │
     │        Sí        No
     │         │         │
     │         ▼         ▼
     │    ┌─────────┐ ┌──────────┐
     │    │ Cargar  │ │ Recovery │
     │    │ checkpoint│ │ manual  │
     │    └────┬────┘ └────┬─────┘
     │         │           │
     ▼◄────────┴───────────┘
┌─────────────────────┐
│  Cargar L0+L1       │
│  (CLAUDE.md, etc.)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Restaurar estado   │
│  de tarea           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Validar estado     │
│  (archivos, git)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Cargar L2 si       │
│  necesario          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Ejecutar próxima   │
│  acción             │
└─────────────────────┘
```

---

## 10. MÉTRICAS DE ÉXITO

| Métrica | Objetivo | Crítico |
|---------|----------|---------|
| Tiempo total recovery | < 3 min | > 5 min |
| Tokens usados en recovery | < 8500 | > 12000 |
| Información preservada | > 90% | < 80% |
| Decisiones re-tomadas | 0 | > 2 |
| Recovery exitoso | > 95% | < 90% |

---

## 11. REFERENCIAS

- **Checkpoint:** @DEF_CHECKPOINT
- **Session State:** @DEF_SCHEMA_STATE
- **Próxima Acción:** @DEF_SCHEMA_PROXIMA
- **Decisiones:** @DEF_SCHEMA_DECISIONES
- **Checklist Recovery:** @DEF_CHK_RECOVERY

---

*Protocolo NEXUS v4.1 - Gestión de Contexto y Tokens*
