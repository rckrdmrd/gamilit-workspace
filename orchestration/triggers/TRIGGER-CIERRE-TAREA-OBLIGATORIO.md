# TRIGGER: CIERRE DE TAREA OBLIGATORIO

**Version:** 1.0.0
**Fecha:** 2026-01-18
**Sistema:** SIMCO v4.0.0
**Alias:** @TRIGGER_CIERRE
**Propagado desde:** workspace-v2/orchestration/directivas/triggers/

---

> **NOTA:** Este trigger es propagado desde workspace-v2 y adaptado al contexto de gamilit.
> Las referencias han sido actualizadas para apuntar a rutas locales del proyecto.

---

## RESUMEN EJECUTIVO

Este trigger OBLIGA la ejecucion del checklist post-tarea (@DEF_CHK_POST) antes de que cualquier tarea pueda ser marcada como completada.

**PRINCIPIO:** "Una tarea no esta completada hasta que su checklist de cierre este 100% verificado."

---

## CONDICIONES DE ACTIVACION

```yaml
activar_cuando:
  - Agente intenta marcar tarea como "completada"
  - Agente dice "tarea finalizada" o variantes
  - Agente termina la ultima subtarea del plan
  - Agente declara "Done" o "DONE"
  - Agente reporta que termino el trabajo

palabras_clave_trigger:
  - "completada"
  - "finalizada"
  - "terminada"
  - "Done"
  - "DONE"
  - "tarea cerrada"
  - "trabajo terminado"
  - "implementacion completa"
```

---

## ACCION REQUERIDA

### Secuencia Obligatoria

```
AGENTE DECLARA TAREA TERMINADA
         |
         v
+-------------------------------------+
| 1. DETENER                          |
|    No marcar como completada aun    |
+-----------------+-------------------+
                  |
                  v
+-------------------------------------+
| 2. CARGAR @DEF_CHK_POST             |
|    CHECKLIST-POST-TASK.md           |
|    (orchestration/_definitions/     |
|     checklists/)                    |
+-----------------+-------------------+
                  |
                  v
+-------------------------------------+
| 3. EJECUTAR CHECKLIST               |
|    - Gobernanza (BLOQUEANTE)        |
|    - Validaciones tecnicas          |
|    - Coherencia entre capas         |
|    - Inventarios                    |
|    - Trazas                         |
|    - Propagacion                    |
+-----------------+-------------------+
                  |
                  v
         +---------------+
         | TODOS PASAN?  |
         +-------+-------+
              /     \
           Si       No
            |        |
            v        v
+--------------+  +----------------------+
| 4. MARCAR    |  | 4. MANTENER EN       |
| COMPLETADA   |  |    PROGRESO          |
+--------------+  |                      |
                  | - Documentar items   |
                  |   faltantes          |
                  | - Completar antes    |
                  |   de cerrar          |
                  +----------------------+
```

---

## CHECKLIST RAPIDO DE CIERRE

```markdown
## Verificacion Pre-Cierre (@DEF_CHK_POST)

### 0. Gobernanza (BLOQUEANTE - SI FALLA, NO CONTINUAR)
[ ] Carpeta de tarea existe: orchestration/tareas/TASK-{ID}/
[ ] METADATA.yml completo con fases C, E, D
[ ] _INDEX.yml de tareas actualizado

### 1. Validaciones Tecnicas
[ ] Build pasa (backend y/o frontend segun aplique)
[ ] Lint pasa
[ ] Tests pasan (si existen)

### 2. Coherencia Entre Capas
[ ] DDL <-> Backend coherente (o excepciones documentadas)
[ ] Backend <-> Frontend coherente (si aplica)

### 3. Inventarios Actualizados
[ ] DATABASE_INVENTORY.yml (si cambio BD)
[ ] BACKEND_INVENTORY.yml (si cambio BE)
[ ] FRONTEND_INVENTORY.yml (si cambio FE)
[ ] MASTER_INVENTORY.yml (siempre)

### 4. Trazas Actualizadas
[ ] Traza de tarea correspondiente actualizada
[ ] PROXIMA-ACCION.md actualizado

### 5. Propagacion Evaluada
[ ] Cambio debe propagarse a otros proyectos? (evaluar)
[ ] Si aplica: propagacion ejecutada o documentada como pendiente
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

  Accion requerida:
  - Completar items faltantes
  - Re-ejecutar checklist
  - Solo entonces marcar como completada

reintentar: "Despues de completar items faltantes"
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
  - Propagacion no evaluada (si proyecto aislado)
```

---

## INTEGRACION CON OTROS TRIGGERS

```yaml
secuencia_de_triggers:
  1: "Agente ejecuta trabajo"
  2: "Agente intenta cerrar tarea"
  3: "-> TRIGGER-CIERRE-TAREA-OBLIGATORIO se activa"
  4: "-> Carga @DEF_CHK_POST"
  5: "-> TRIGGER-INVENTARIOS-SINCRONIZADOS verifica inventarios"
  6: "-> TRIGGER-COHERENCIA-CAPAS verifica coherencia"
  7: "-> TRIGGER-DOCUMENTACION-OBLIGATORIA verifica gobernanza"
  8: "Si todo pasa: tarea = COMPLETADA"
  9: "Si algo falla: tarea = EN PROGRESO"

dependencias:
  - "@TRIGGER_INVENTARIOS"
  - "@TRIGGER_COHERENCIA"
  - "@TRIGGER_DOC"
```

---

## MENSAJES ESTANDAR

### Al detectar intento de cierre:

```
TRIGGER-CIERRE-TAREA-OBLIGATORIO activado

Antes de marcar la tarea como completada, debo ejecutar el checklist post-tarea.

Ejecutando @DEF_CHK_POST...
```

### Si todo pasa:

```
Checklist post-tarea completado exitosamente

Verificaciones:
- [OK] Gobernanza
- [OK] Validaciones tecnicas
- [OK] Coherencia entre capas
- [OK] Inventarios sincronizados
- [OK] Trazas actualizadas
- [OK] Propagacion evaluada

TAREA MARCADA COMO COMPLETADA
```

### Si algo falla:

```
Checklist post-tarea NO completado

Items faltantes:
- [ ] {item que fallo}
- [ ] {otro item que fallo}

Accion: Completar items faltantes antes de cerrar.
Estado: EN PROGRESO (no completada)
```

---

## EXCEPCIONES

```yaml
excepciones_permitidas:
  tareas_triviales:
    - Correccion de typos
    - Actualizacion de comentarios
    - Cambios cosmeticos
    checklist_reducido:
      - Solo Gobernanza
      - Solo Validacion build

  investigacion_pura:
    - Analisis sin cambios de codigo
    - Spikes exploratorios
    checklist_reducido:
      - Solo documentacion de hallazgos

nota: "Incluso excepciones DEBEN documentar en trazas"
```

---

## REFERENCIAS (LOCALES A GAMILIT)

| Alias | Archivo |
|-------|---------|
| @DEF_CHK_POST | orchestration/_definitions/checklists/CHECKLIST-POST-TASK.md |
| @TRIGGER_INVENTARIOS | orchestration/directivas/proyecto-triggers/TRIGGER-INVENTARIOS-SINCRONIZADOS.md |
| @TRIGGER_COHERENCIA | orchestration/directivas/proyecto-triggers/TRIGGER-COHERENCIA-CAPAS.md |
| @TRIGGER_DOC | orchestration/directivas/proyecto-triggers/TRIGGER-DOCUMENTACION-OBLIGATORIA.md |
| @CAPVED | orchestration/directivas/principios/PRINCIPIO-CAPVED.md |

---

## ORIGEN

| Campo | Valor |
|-------|-------|
| Archivo origen | workspace-v2/orchestration/directivas/triggers/TRIGGER-CIERRE-TAREA-OBLIGATORIO.md |
| Version origen | 1.0.0 |
| Fecha propagacion | 2026-01-18 |
| Adaptaciones | Referencias localizadas a contexto gamilit |

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Trigger de Cierre Obligatorio
