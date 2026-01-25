# CHECKPOINT-PROTOCOL.md

> **Sistema:** NEXUS v4.1
> **Versión:** 1.0.0
> **Fecha:** 2026-01-24
> **Alias:** @DEF_CHECKPOINT

---

## 1. PROPÓSITO

Este protocolo define cómo crear checkpoints de sesión para preservar estado crítico antes de que la compactación automática de Claude pueda eliminar contexto importante.

**Objetivo:** Reducir el impacto de compactación de ~30% de pérdida a <10%.

---

## 2. CUÁNDO EJECUTAR

### 2.1 Triggers Automáticos

| Trigger | Umbral | Acción |
|---------|--------|--------|
| **TOKEN_THRESHOLD_70** | 14,000 tokens | Alerta + sugerencia |
| **TOKEN_THRESHOLD_85** | 17,000 tokens | Checkpoint automático |
| **DECISION_ARQUITECTURAL** | Decisión tomada | Registrar decisión |
| **SUBTAREA_COMPLETADA** | Validación pasó | Checkpoint progreso |
| **TIEMPO_30_MIN** | 30 min sin checkpoint | Checkpoint periódico |

### 2.2 Triggers Manuales

Ejecutar checkpoint manual cuando:
- Antes de cambiar de dominio (DDL → Backend)
- Antes de cambiar de proyecto
- Antes de delegar a otro agente
- Cuando la tarea es particularmente compleja
- Antes de operaciones destructivas

---

## 3. PROTOCOLO DE 5 PASOS

### PASO 1: PAUSAR EN PUNTO SEGURO

```
╔═══════════════════════════════════════════════════════════╗
║  ANTES de checkpoint:                                     ║
║  - Completar operación atómica actual                    ║
║  - NO interrumpir en medio de escritura de archivo       ║
║  - Esperar confirmación de I/O si hay                    ║
╚═══════════════════════════════════════════════════════════╝
```

**Puntos seguros:**
- Después de un commit
- Después de validación exitosa (build/lint pass)
- Al completar una subtarea
- Entre fases CAPVED

### PASO 2: EXTRAER INFORMACIÓN CRÍTICA

Recopilar los siguientes campos:

```yaml
# Campos OBLIGATORIOS
timestamp: "ISO8601"
checkpoint_id: "CHK-YYYY-MM-DD-HHmm"
trigger: "[ver lista de triggers]"

agente:
  id: "[identificador]"
  tipo: "[claude-code|trae|windsurf|gemini-cli]"
  perfil: "[perfil activo]"

proyecto:
  nombre: "[nombre]"
  path: "[path]"

tarea:
  id: "TASK-YYYY-MM-DD-NNN"
  fase_capved: "[C|A|P|V|E|D]"
  subtarea: "[descripción]"

proxima_accion: "[OBLIGATORIO: siguiente paso claro]"

# Campos RECOMENDADOS
tokens:
  usados: [número]
  porcentaje: [número]

decisiones:
  - id: "DEC-NNN"
    descripcion: "[qué se decidió]"
    razon: "[por qué]"

archivos_modificados:
  - "[path1]"
  - "[path2]"
```

### PASO 3: PERSISTIR EN DISCO

**Ubicación:**
```
{proyecto}/orchestration/trazas/CHECKPOINT-{YYYY-MM-DD-HHmm}.yml
```

**Ejemplo:**
```
projects/gamilit/orchestration/trazas/CHECKPOINT-2026-01-24-1530.yml
```

**Naming convention:**
- Prefijo: `CHECKPOINT-`
- Fecha: `YYYY-MM-DD`
- Hora: `HHmm` (24h)
- Extensión: `.yml`

### PASO 4: CONFIRMAR CHECKPOINT VÁLIDO

Verificar:
- [ ] Archivo existe en ubicación correcta
- [ ] YAML es válido (sintaxis)
- [ ] Campos obligatorios presentes:
  - `timestamp`
  - `checkpoint_id`
  - `proyecto.nombre`
  - `tarea.id`
  - `proxima_accion`
- [ ] `proxima_accion` tiene al menos 20 caracteres

### PASO 5: LIMPIAR CONTEXTO (OPCIONAL)

Si tokens > 85%:
1. Purgar L3 items no usados en últimos 10 minutos
2. Mantener referencias (paths) pero no contenido
3. Preservar decisiones y estado de tarea

---

## 4. TEMPLATE DE CHECKPOINT

```yaml
# CHECKPOINT-{fecha}-{hora}.yml
version: "1.0.0"
timestamp: "2026-01-24T15:30:00Z"
checkpoint_id: "CHK-2026-01-24-1530"
trigger: "TOKEN_THRESHOLD_85"

agente:
  id: "claude-opus-4.5"
  tipo: "claude-code"
  perfil: "PERFIL-ORQUESTADOR.md"

proyecto:
  nombre: "gamilit"
  path: "projects/gamilit"

tarea:
  id: "TASK-2026-01-24-001"
  descripcion: "Implementar sistema de checkpoints"
  fase_capved: "E"
  subtarea: "Crear protocolo de checkpoint"
  progreso: "3/5"

tokens:
  usados: 17000
  disponibles: 3000
  porcentaje: 85

decisiones:
  - id: "DEC-001"
    descripcion: "Usar YAML para checkpoints"
    razon: "Consistencia con workspace"

archivos_modificados:
  - "orchestration/_definitions/protocols/CHECKPOINT-PROTOCOL.md"
  - "orchestration/_definitions/schemas/CHECKPOINT.schema.yml"

errores: []

bloqueos: []

proxima_accion: |
  Crear RECOVERY-PROTOCOL.md que define cómo restaurar
  sesión desde un checkpoint. Incluir proceso de 4 pasos
  y tiempo estimado de recuperación.

notas: |
  Checkpoint por umbral de tokens alcanzado.
  Sesión productiva, buen progreso en documentación NEXUS.
```

---

## 5. ACTUALIZAR PROXIMA-ACCION.md

Después de cada checkpoint, actualizar también `PROXIMA-ACCION.md`:

```markdown
# PROXIMA-ACCION.md

## Estado Actual
- **Proyecto:** {del checkpoint}
- **Tarea Activa:** {del checkpoint}
- **Fase CAPVED:** {del checkpoint}
- **Subtarea:** {del checkpoint}

## Contexto Crítico
- **Último archivo modificado:** {último de archivos_modificados}
- **Dependencias pendientes:** {extraer de contexto}
- **Bloqueos conocidos:** {del checkpoint o "Ninguno"}

## Siguiente Paso
{Copiar de proxima_accion del checkpoint}

## Para Recuperar Sesión
1. **Cargar:** CHECKPOINT-{id}.yml
2. **Verificar:** Archivos modificados existen
3. **Continuar:** Desde proxima_accion

---
*Última actualización: {timestamp}*
*Agente: {agente.id}*
```

---

## 6. RETENCIÓN DE CHECKPOINTS

| Política | Valor |
|----------|-------|
| Mantener últimos | 10 checkpoints |
| Días de retención | 7 días |
| Eliminar antiguos | Sí, automático |

**Comando de limpieza:**
```bash
# Mantener solo últimos 10 checkpoints
ls -t CHECKPOINT-*.yml | tail -n +11 | xargs rm -f
```

---

## 7. MÉTRICAS DE ÉXITO

| Métrica | Objetivo |
|---------|----------|
| Tiempo de checkpoint | < 30 segundos |
| Tamaño de archivo | < 5 KB |
| Recovery exitoso | > 95% |
| Información perdida | < 10% |

---

## 8. DIAGRAMA DE FLUJO

```
┌─────────────────┐
│  Trigger        │
│  Activado       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ¿Punto seguro? │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   Sí        No
    │         │
    ▼         ▼
┌───────┐  ┌──────────┐
│Extraer│  │Completar │
│Info   │  │operación │
└───┬───┘  └────┬─────┘
    │           │
    │◄──────────┘
    │
    ▼
┌─────────────────┐
│  Persistir      │
│  Checkpoint     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validar        │
│  Checkpoint     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ¿Tokens > 85%? │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   Sí        No
    │         │
    ▼         │
┌───────┐     │
│Purgar │     │
│L3     │     │
└───┬───┘     │
    │         │
    ▼◄────────┘
┌─────────────────┐
│  Continuar      │
│  Operación      │
└─────────────────┘
```

---

## 9. REFERENCIAS

- **Schema:** @DEF_SCHEMA_CHECKPOINT
- **Triggers:** @DEF_TRG_CHECKPOINT
- **Recovery:** @DEF_RECOVERY
- **Purga:** @DEF_TRG_PURGE

---

*Protocolo NEXUS v4.1 - Gestión de Contexto y Tokens*
