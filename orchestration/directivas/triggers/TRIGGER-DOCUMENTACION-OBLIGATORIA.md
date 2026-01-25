# TRIGGER: DOCUMENTACIÓN OBLIGATORIA

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Tipo:** Trigger Automático
**Prioridad:** P0 - OBLIGATORIO
**Alias:** @TRIGGER-DOC

---

## RESUMEN EJECUTIVO

> **NINGUNA tarea se marca como completada sin documentación.**
> **El sistema de gobernanza REQUIERE documentación en cada tarea.**

---

## 1. CONDICIONES DE ACTIVACIÓN

Este trigger se activa automáticamente cuando:

```yaml
activacion:
  - evento: "Al completar cualquier tarea"
    condicion: "estado cambia a 'completada'"

  - evento: "Al intentar cerrar ciclo CAPVED"
    condicion: "fase D (Documentación) no completada"

  - evento: "Al crear commit de cierre"
    condicion: "verificar documentación antes de commit"
```

---

## 2. REQUISITOS MÍNIMOS DE DOCUMENTACIÓN

### 2.1 Para TODA Tarea

**IMPORTANTE:** La ubicación de la carpeta depende del alcance (ver @UBICACION-DOC):
- **Workspace:** `orchestration/tareas/{YYYY-MM-DD}/TASK-{ID}/`
- **Proyecto:** `projects/{proyecto}/orchestration/tareas/TASK-{ID}/`

| Requisito | Obligatorio | Descripción |
|-----------|-------------|-------------|
| Carpeta de tarea | ✅ SÍ | En ubicación según alcance.nivel (workspace o proyecto) |
| METADATA.yml | ✅ SÍ | Metadata completa (incluir alcance.nivel) |
| Fase C (Contexto) | ✅ SÍ | 01-CONTEXTO.md completado |
| Fase E (Ejecución) | ✅ SÍ | 05-EJECUCION.md completado |
| Fase D (Documentación) | ✅ SÍ | 06-DOCUMENTACION.md completado |
| Fase A (Análisis) | ⚠️ Recomendado | 02-ANALISIS.md |
| Fase P (Plan) | ⚠️ Recomendado | 03-PLAN.md |
| Fase V (Validación) | ⚠️ Recomendado | 04-VALIDACION.md |

### 2.2 Campos Obligatorios en METADATA.yml

```yaml
campos_obligatorios:
  - task_id          # ID único de la tarea
  - identificacion.titulo
  - identificacion.tipo
  - responsabilidad.agente_responsable
  - alcance.nivel
  - temporalidad.fecha_inicio
  - estado.actual    # Debe ser "completada"
  - artefactos.archivos_creados   # Lista de archivos
  - artefactos.archivos_modificados
  - artefactos.commits
```

### 2.3 Actualizaciones de Sistema Requeridas

```yaml
actualizaciones_sistema:
  - archivo: "_INDEX.yml correspondiente"
    ubicacion_workspace: "orchestration/tareas/_INDEX.yml"
    ubicacion_proyecto: "projects/{proyecto}/orchestration/tareas/_INDEX.yml"
    accion: "Agregar tarea al índice SEGÚN UBICACIÓN"

  - archivo: "orchestration/agents/trazas/TRAZA-AGENTE-{PERFIL}.md"
    accion: "Registrar tarea en historial del agente"

  - archivo: "orchestration/MAPA-DOCUMENTACION.yml"
    accion: "Actualizar historial_reciente"
```

---

## 3. FLUJO DE VALIDACIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE VALIDACIÓN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Agente intenta marcar tarea como completada                   │
│                          │                                      │
│                          ▼                                      │
│              ┌─────────────────────┐                           │
│              │ ¿Existe carpeta     │                           │
│              │ TASK-{ID}/?         │                           │
│              └─────────┬───────────┘                           │
│                   Sí   │   No                                  │
│                        │    └──▶ ❌ BLOQUEAR                   │
│                        ▼                                        │
│              ┌─────────────────────┐                           │
│              │ ¿METADATA.yml       │                           │
│              │ completo?           │                           │
│              └─────────┬───────────┘                           │
│                   Sí   │   No                                  │
│                        │    └──▶ ❌ BLOQUEAR                   │
│                        ▼                                        │
│              ┌─────────────────────┐                           │
│              │ ¿Fases C, E, D      │                           │
│              │ documentadas?       │                           │
│              └─────────┬───────────┘                           │
│                   Sí   │   No                                  │
│                        │    └──▶ ❌ BLOQUEAR                   │
│                        ▼                                        │
│              ┌─────────────────────┐                           │
│              │ ¿_INDEX.yml         │                           │
│              │ actualizado?        │                           │
│              └─────────┬───────────┘                           │
│                   Sí   │   No                                  │
│                        │    └──▶ ⚠️ ADVERTIR (no bloquea)     │
│                        ▼                                        │
│              ✅ PERMITIR COMPLETAR                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. ACCIONES DEL TRIGGER

### 4.1 Si Cumple Requisitos

```yaml
si_cumple:
  acciones:
    - log: "Documentación validada para TASK-{ID}"
    - permitir: "Marcar tarea como completada"
    - recordar: "Actualizar índices y trazas"
```

### 4.2 Si NO Cumple Requisitos

```yaml
si_no_cumple:
  acciones:
    - bloquear: "No permitir marcar como completada"

    - listar_faltantes: |
        ❌ Items faltantes para TASK-{ID}:
        - [ ] {item 1 faltante}
        - [ ] {item 2 faltante}
        - [ ] {item N faltante}

    - instruir: |
        Para completar la documentación:
        1. Crear carpeta: orchestration/tareas/TASK-{ID}/
        2. Copiar templates desde _templates/TASK-TEMPLATE/
        3. Completar METADATA.yml
        4. Documentar fases C, E, D (mínimo)
        5. Intentar completar nuevamente
```

---

## 5. CHECKLIST DE VALIDACIÓN

### 5.1 Para el Agente (antes de completar)

```markdown
## Checklist Pre-Completar Tarea

### Estructura
- [ ] Carpeta `orchestration/tareas/TASK-{ID}/` existe
- [ ] METADATA.yml copiado y completado

### Documentación Mínima (Obligatoria)
- [ ] 01-CONTEXTO.md - Documentado
- [ ] 05-EJECUCION.md - Documentado
- [ ] 06-DOCUMENTACION.md - Documentado

### Documentación Completa (Recomendada)
- [ ] 02-ANALISIS.md - Documentado
- [ ] 03-PLAN.md - Documentado
- [ ] 04-VALIDACION.md - Documentado

### METADATA.yml Campos
- [ ] task_id correcto
- [ ] titulo descriptivo
- [ ] tipo de tarea
- [ ] agente_responsable
- [ ] nivel de alcance
- [ ] fecha_inicio
- [ ] artefactos listados
- [ ] commits referenciados

### Actualizaciones de Sistema
- [ ] orchestration/tareas/_INDEX.yml actualizado
- [ ] Traza de agente actualizada (opcional pero recomendado)
```

### 5.2 Para Verificación Automática

```bash
# Script de validación (conceptual)
verify_task_documentation() {
    TASK_ID=$1
    TASK_DIR="orchestration/tareas/$TASK_ID"

    # Verificar estructura
    [ -d "$TASK_DIR" ] || echo "❌ Falta directorio"
    [ -f "$TASK_DIR/METADATA.yml" ] || echo "❌ Falta METADATA.yml"
    [ -f "$TASK_DIR/01-CONTEXTO.md" ] || echo "❌ Falta 01-CONTEXTO.md"
    [ -f "$TASK_DIR/05-EJECUCION.md" ] || echo "❌ Falta 05-EJECUCION.md"
    [ -f "$TASK_DIR/06-DOCUMENTACION.md" ] || echo "❌ Falta 06-DOCUMENTACION.md"

    # Verificar campos en METADATA.yml
    # (requiere parser YAML)
}
```

---

## 6. EXCEPCIONES

### 6.1 Tareas Exentas de Documentación Completa

| Tipo de Tarea | Documentación Requerida |
|---------------|------------------------|
| MODE:QUICK (fixes menores) | Solo METADATA.yml + 06-DOCUMENTACION.md |
| Hotfix crítico | METADATA.yml mínimo, documentar después |
| Sub-tarea delegada | Documentar en tarea padre |

### 6.2 Cómo Solicitar Excepción

```yaml
excepcion:
  justificacion: "{razón válida}"
  aprobado_por: "Tech Leader / Orquestador"
  documentacion_diferida: true
  fecha_limite: "{fecha para completar documentación}"
```

---

## 7. INTEGRACIÓN CON SIMCO

### 7.1 Punto de Activación en CAPVED

```
C ── A ── P ── V ── E ── D
                         │
                         ▼
              [TRIGGER-DOC se activa]
                         │
                    ¿Cumple?
                    /      \
                  Sí        No
                  │         │
            Completar   Bloquear
```

### 7.2 Referencias

- **SIMCO-DOCUMENTAR.md:** Directiva de documentación general
- **SIMCO-TAREA.md:** Punto de entrada para tareas
- **PRINCIPIO-CAPVED.md:** Ciclo de vida de tareas

---

## 8. BENEFICIOS DEL SISTEMA

```yaml
beneficios:
  trazabilidad:
    - "Saber quién hizo qué y cuándo"
    - "Encontrar documentación de cualquier tarea"
    - "Rastrear decisiones y cambios"

  conocimiento:
    - "Base de conocimiento crece con cada tarea"
    - "Lecciones aprendidas documentadas"
    - "Onboarding más fácil"

  calidad:
    - "Fuerza reflexión antes de cerrar"
    - "Documenta problemas y soluciones"
    - "Reduce repetición de errores"

  auditoria:
    - "Historial completo de cambios"
    - "Responsabilidad clara"
    - "Métricas de productividad"
```

---

## 9. ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| "No puedo completar tarea" | Documentación faltante | Completar checklist |
| METADATA.yml incompleto | Campos obligatorios vacíos | Usar template y completar |
| Fases no documentadas | Prisas por terminar | Documentar durante ejecución |
| Índices no actualizados | Olvidó actualizar | Agregar al checklist final |

---

## 10. REFERENCIAS

- **@UBICACION-DOC:** Directiva de ubicación (workspace vs proyecto) - NUEVO
- **@SIMCO-DOCUMENTAR:** Directiva de documentación
- **@TAREAS:** Estructura de tareas `orchestration/tareas/`
- **@MAPA-DOC:** Mapa de documentación del workspace
- **@TRAZA-AGENTE:** Trazas de agentes

---

**Versión:** 1.0.0 | **Sistema:** SIMCO + Gobernanza | **Mantenido por:** @WS_ORCHESTRATOR
