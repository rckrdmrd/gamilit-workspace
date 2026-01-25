# TRIGGER: CIERRE DE TAREA OBLIGATORIO

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Sistema:** SIMCO v4.0.0
**Alias:** @TRIGGER_CIERRE

---

## RESUMEN EJECUTIVO

Este trigger OBLIGA la ejecución del checklist post-tarea (@DEF_CHK_POST) antes de que cualquier tarea pueda ser marcada como completada.

**PRINCIPIO:** "Una tarea no está completada hasta que su checklist de cierre esté 100% verificado."

---

## CONDICIONES DE ACTIVACIÓN

```yaml
activar_cuando:
  - Agente intenta marcar tarea como "completada"
  - Agente dice "tarea finalizada" o variantes
  - Agente termina la última subtarea del plan
  - Agente declara "Done" o "DONE"
  - Agente reporta que terminó el trabajo

palabras_clave_trigger:
  - "completada"
  - "finalizada"
  - "terminada"
  - "Done"
  - "DONE"
  - "tarea cerrada"
  - "trabajo terminado"
  - "implementación completa"
```

---

## ACCIÓN REQUERIDA

### Secuencia Obligatoria

```
AGENTE DECLARA TAREA TERMINADA
         │
         ▼
┌─────────────────────────────────────┐
│ 1. DETENER                          │
│    No marcar como completada aún    │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 2. CARGAR @DEF_CHK_POST             │
│    CHECKLIST-POST-TASK.md           │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 3. EJECUTAR CHECKLIST               │
│    - Gobernanza (BLOQUEANTE)        │
│    - Validaciones técnicas          │
│    - Coherencia entre capas         │
│    - Inventarios                    │
│    - Trazas                         │
│    - Propagación                    │
└─────────────────┬───────────────────┘
                  │
                  ▼
         ┌───────────────┐
         │ ¿TODOS PASAN? │
         └───────┬───────┘
              /     \
           Sí       No
            │        │
            ▼        ▼
┌──────────────┐  ┌──────────────────────┐
│ 4. MARCAR    │  │ 4. MANTENER EN       │
│ COMPLETADA   │  │    PROGRESO          │
└──────────────┘  │                      │
                  │ - Documentar items   │
                  │   faltantes          │
                  │ - Completar antes    │
                  │   de cerrar          │
                  └──────────────────────┘
```

---

## CHECKLIST RÁPIDO DE CIERRE

```markdown
## Verificación Pre-Cierre (@DEF_CHK_POST)

### 0. Gobernanza (BLOQUEANTE - SI FALLA, NO CONTINUAR)
[ ] Carpeta de tarea existe: orchestration/tareas/TASK-{ID}/
[ ] METADATA.yml completo con fases C, E, D
[ ] _INDEX.yml de tareas actualizado

### 1. Validaciones Técnicas
[ ] Build pasa (backend y/o frontend según aplique)
[ ] Lint pasa
[ ] Tests pasan (si existen)

### 2. Coherencia Entre Capas
[ ] DDL ↔ Backend coherente (o excepciones documentadas)
[ ] Backend ↔ Frontend coherente (si aplica)

### 3. Inventarios Actualizados
[ ] DATABASE_INVENTORY.yml (si cambió BD)
[ ] BACKEND_INVENTORY.yml (si cambió BE)
[ ] FRONTEND_INVENTORY.yml (si cambió FE)
[ ] MASTER_INVENTORY.yml (siempre)

### 4. Trazas Actualizadas
[ ] Traza de tarea correspondiente actualizada
[ ] PROXIMA-ACCION.md actualizado

### 5. Propagación Evaluada
[ ] ¿Cambio debe propagarse a otros proyectos? (evaluar)
[ ] Si aplica: propagación ejecutada o documentada como pendiente
```

---

## BLOQUEO

### SI el checklist NO pasa:

```yaml
accion: "BLOQUEAR cierre de tarea"
estado: "EN PROGRESO"
mensaje: |
  Tarea NO puede ser marcada como completada.
  Items faltantes del checklist:
  - [listar items que fallaron]

  Acción requerida:
  - Completar items faltantes
  - Re-ejecutar checklist
  - Solo entonces marcar como completada

reintentar: "Después de completar items faltantes"
```

### Items BLOQUEANTES (no negociables):

```yaml
bloqueantes_absolutos:
  - Gobernanza (carpeta + METADATA + _INDEX)
  - Build que falla
  - Tests que fallan

advertencias_serias:
  - Inventarios desactualizados
  - Trazas desactualizadas
  - Coherencia no verificada

advertencias_menores:
  - Propagación no evaluada (si proyecto aislado)
```

---

## INTEGRACIÓN CON OTROS TRIGGERS

```yaml
secuencia_de_triggers:
  1: "Agente ejecuta trabajo"
  2: "Agente intenta cerrar tarea"
  3: "→ TRIGGER-CIERRE-TAREA-OBLIGATORIO se activa"
  4: "→ Carga @DEF_CHK_POST"
  5: "→ TRIGGER-INVENTARIOS-SINCRONIZADOS verifica inventarios"
  6: "→ TRIGGER-COHERENCIA-CAPAS verifica coherencia"
  7: "→ TRIGGER-DOCUMENTACION-OBLIGATORIA verifica gobernanza"
  8: "Si todo pasa: tarea = COMPLETADA"
  9: "Si algo falla: tarea = EN PROGRESO"

dependencias:
  - "@TRIGGER_INVENTARIOS"
  - "@TRIGGER_COHERENCIA"
  - "@TRIGGER_DOC"
```

---

## MENSAJES ESTÁNDAR

### Al detectar intento de cierre:

```
⚠️ TRIGGER-CIERRE-TAREA-OBLIGATORIO activado

Antes de marcar la tarea como completada, debo ejecutar el checklist post-tarea.

Ejecutando @DEF_CHK_POST...
```

### Si todo pasa:

```
✅ Checklist post-tarea completado exitosamente

Verificaciones:
- [✓] Gobernanza
- [✓] Validaciones técnicas
- [✓] Coherencia entre capas
- [✓] Inventarios sincronizados
- [✓] Trazas actualizadas
- [✓] Propagación evaluada

TAREA MARCADA COMO COMPLETADA
```

### Si algo falla:

```
❌ Checklist post-tarea NO completado

Items faltantes:
- [ ] {item que falló}
- [ ] {otro item que falló}

Acción: Completar items faltantes antes de cerrar.
Estado: EN PROGRESO (no completada)
```

---

## EXCEPCIONES

```yaml
excepciones_permitidas:
  tareas_triviales:
    - Corrección de typos
    - Actualización de comentarios
    - Cambios cosméticos
    checklist_reducido:
      - Solo Gobernanza
      - Solo Validación build

  investigación_pura:
    - Análisis sin cambios de código
    - Spikes exploratorios
    checklist_reducido:
      - Solo documentación de hallazgos

nota: "Incluso excepciones DEBEN documentar en trazas"
```

---

## REFERENCIAS

| Alias | Archivo |
|-------|---------|
| @DEF_CHK_POST | orchestration/_definitions/checklists/CHECKLIST-POST-TASK.md |
| @TRIGGER_INVENTARIOS | orchestration/directivas/triggers/TRIGGER-INVENTARIOS-SINCRONIZADOS.md |
| @TRIGGER_COHERENCIA | orchestration/directivas/triggers/TRIGGER-COHERENCIA-CAPAS.md |
| @TRIGGER_DOC | orchestration/directivas/triggers/TRIGGER-DOCUMENTACION-OBLIGATORIA.md |
| @CAPVED | orchestration/directivas/principios/PRINCIPIO-CAPVED.md |

---

**Versión:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Trigger de Cierre Obligatorio
