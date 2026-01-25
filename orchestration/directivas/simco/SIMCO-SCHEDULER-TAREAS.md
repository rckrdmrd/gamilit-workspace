# SIMCO-SCHEDULER-TAREAS.md
# Sistema de Programación y Orquestación de Tareas Automáticas

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Tipo:** Directiva de Sistema
**Ejecutor:** @WS_ORCHESTRATOR

---

## PROPÓSITO

Esta directiva define el sistema centralizado para:
1. Programar tareas recurrentes del workspace
2. Orquestar ejecución de triggers automáticos
3. Gestionar cola de tareas pendientes
4. Coordinar trabajo entre agentes
5. Mantener el workspace en estado óptimo

---

## ARQUITECTURA DEL SCHEDULER

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SCHEDULER CENTRAL                             │
│                      @WS_ORCHESTRATOR                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   TRIGGERS   │  │    TAREAS    │  │    COLA      │              │
│  │  AUTOMÁTICOS │  │  PROGRAMADAS │  │  PENDIENTES  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                       │
│         └─────────────────┼──────────────────┘                       │
│                           ▼                                          │
│                  ┌─────────────────┐                                │
│                  │   DISPATCHER    │                                │
│                  │  (Priorizador)  │                                │
│                  └────────┬────────┘                                │
│                           │                                          │
│         ┌─────────────────┼─────────────────┐                       │
│         ▼                 ▼                 ▼                        │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐                  │
│  │  EXECUTOR  │   │  EXECUTOR  │   │  EXECUTOR  │                  │
│  │ (Scripts)  │   │ (Agentes)  │   │ (Notif.)   │                  │
│  └────────────┘   └────────────┘   └────────────┘                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## TIPOS DE TAREAS

### 1. Tareas Programadas (Scheduled)

```yaml
scheduled_tasks:
  - id: "daily-sync-check"
    nombre: "Verificación diaria de sincronización"
    frecuencia: "daily"
    hora: "08:00"
    script: "./scripts/workspace/sync-all-remotes.sh --dry-run"
    notificar_resultado: true

  - id: "weekly-audit"
    nombre: "Auditoría semanal de funcionalidades"
    frecuencia: "weekly"
    día: "monday"
    hora: "09:00"
    script: "./scripts/workspace/audit-functionalities.sh --report"
    notificar_resultado: true

  - id: "weekly-cleanup"
    nombre: "Limpieza semanal de ramas"
    frecuencia: "weekly"
    día: "friday"
    hora: "17:00"
    script: "./scripts/workspace/cleanup-branches.sh --dry-run"
    notificar_resultado: true

  - id: "monthly-inventory-review"
    nombre: "Revisión mensual de inventarios"
    frecuencia: "monthly"
    día: 1
    hora: "10:00"
    script: "./scripts/workspace/validate-workspace.sh --full"
    notificar_resultado: true
```

### 2. Tareas por Trigger (Event-Driven)

```yaml
trigger_tasks:
  - trigger: "SESSION_START"
    tarea: "quick-status-check"
    prioridad: "BACKGROUND"
    timeout: "30s"

  - trigger: "FILE_CREATED"
    condición: "*.entity.ts OR *.sql"
    tarea: "check-functionality-duplicate"
    prioridad: "SYNC"
    timeout: "60s"

  - trigger: "COMMIT_CREATED"
    condición: "proyecto in [template-saas, erp-core]"
    tarea: "evaluate-propagation"
    prioridad: "NORMAL"
    timeout: "120s"

  - trigger: "TASK_COMPLETED"
    tarea: "suggest-push-if-pending"
    prioridad: "LOW"
    timeout: "10s"
```

### 3. Tareas Manuales (On-Demand)

```yaml
manual_tasks:
  - id: "full-workspace-validation"
    nombre: "Validación completa del workspace"
    comando: "@VALIDATE_WS"
    duración_estimada: "5-10 min"

  - id: "force-sync-all"
    nombre: "Sincronización forzada de todos los repos"
    comando: "@SYNC_REMOTES --force"
    requiere_confirmación: true

  - id: "consolidate-functionality"
    nombre: "Consolidar funcionalidad duplicada"
    comando: "@CONSOLIDATE {functionality_id}"
    requiere_confirmación: true
    asignar_a: "@ARCHITECTURE-ANALYST"

  - id: "propagate-to-all"
    nombre: "Propagar cambio a todos los consumidores"
    comando: "@PROPAGATE-ERP"
    requiere_confirmación: true
```

---

## COLA DE TAREAS

### Estructura de la Cola

```yaml
# orchestration/state/task-queue.yml

queue:
  pending:
    - id: "task-001"
      tipo: "trigger"
      origen: "FILE_CREATED"
      descripción: "Verificar duplicado: UserPreference.entity.ts"
      prioridad: 2  # 1=CRITICAL, 2=HIGH, 3=NORMAL, 4=LOW
      creado: "2026-01-16T10:30:00"
      timeout: "60s"
      estado: "pending"

    - id: "task-002"
      tipo: "scheduled"
      origen: "daily-sync-check"
      descripción: "Verificación diaria de sincronización"
      prioridad: 3
      programado_para: "2026-01-16T08:00:00"
      estado: "pending"

  in_progress:
    - id: "task-003"
      tipo: "manual"
      descripción: "Propagación a erp-construccion"
      asignado_a: "@PROPAGATION-TRACKER"
      iniciado: "2026-01-16T10:25:00"
      progreso: 60%

  completed:
    - id: "task-000"
      tipo: "trigger"
      descripción: "Check de sincronización"
      completado: "2026-01-16T10:20:00"
      resultado: "success"
      duración: "5s"

  failed:
    - id: "task-098"
      tipo: "scheduled"
      descripción: "Sync con remote"
      fallido: "2026-01-16T09:00:00"
      error: "Remote no disponible"
      reintentos: 3
      próximo_reintento: "2026-01-16T11:00:00"
```

### Prioridades

```
┌──────────┬─────────────────────────────────────────────────────────┐
│ Nivel    │ Descripción                                             │
├──────────┼─────────────────────────────────────────────────────────┤
│ 1-CRITICAL │ Bloquea trabajo, resolver inmediatamente              │
│          │ Ej: Conflicto de merge, security fix                    │
├──────────┼─────────────────────────────────────────────────────────┤
│ 2-HIGH   │ Importante, resolver antes de continuar tarea actual    │
│          │ Ej: Duplicado detectado, propagación urgente            │
├──────────┼─────────────────────────────────────────────────────────┤
│ 3-NORMAL │ Resolver en orden, no urgente                           │
│          │ Ej: Registro en inventario, actualización de docs       │
├──────────┼─────────────────────────────────────────────────────────┤
│ 4-LOW    │ Background, resolver cuando haya tiempo                 │
│          │ Ej: Cleanup, optimizaciones, sugerencias                │
└──────────┴─────────────────────────────────────────────────────────┘
```

---

## DISPATCHER (Priorizador)

### Algoritmo de Priorización

```python
def calcular_prioridad_efectiva(tarea):
    prioridad_base = tarea.prioridad

    # Factores de ajuste
    if tarea.edad > 1_hora:
        prioridad_base -= 0.5  # Aumenta prioridad (número menor)

    if tarea.reintentos > 2:
        prioridad_base -= 0.3

    if tarea.bloquea_trabajo:
        prioridad_base = min(prioridad_base, 1.5)

    if tarea.tipo == "security":
        prioridad_base = 1

    return max(1, prioridad_base)
```

### Reglas de Despacho

```yaml
dispatch_rules:
  - regla: "Una tarea CRITICAL a la vez"
    descripción: "Si hay tarea CRITICAL, pausar todo lo demás"

  - regla: "Máximo 3 tareas paralelas"
    descripción: "No ejecutar más de 3 tareas simultáneamente"

  - regla: "Respetar dependencias"
    descripción: "Si tarea A depende de B, B debe completar primero"

  - regla: "Background no bloquea"
    descripción: "Tareas LOW pueden ejecutarse en background sin afectar"

  - regla: "Timeout estricto"
    descripción: "Cancelar tarea si excede timeout"
```

---

## EXECUTORS

### 1. Script Executor

```yaml
script_executor:
  descripción: "Ejecuta scripts bash del workspace"

  capacidades:
    - Ejecutar scripts de /scripts/
    - Capturar stdout/stderr
    - Respetar timeouts
    - Reintentar en fallo

  configuración:
    working_directory: "/home/isem/workspace-v2"
    shell: "/bin/bash"
    max_retries: 3
    retry_delay: "5m"
```

### 2. Agent Executor

```yaml
agent_executor:
  descripción: "Delega tareas a agentes especializados"

  agentes_disponibles:
    - "@DDL-SPECIALIST"
    - "@BACKEND-DEVELOPER"
    - "@FRONTEND-DEVELOPER"
    - "@PROPAGATION-TRACKER"
    - "@ARCHITECTURE-ANALYST"
    - "@GIT-SPECIALIST"

  proceso:
    1. Identificar agente apropiado
    2. Preparar contexto (CCA)
    3. Asignar tarea
    4. Monitorear progreso
    5. Recoger resultado
```

### 3. Notification Executor

```yaml
notification_executor:
  descripción: "Envía notificaciones y alertas"

  canales:
    - tipo: "console"
      para: "Mensajes informativos"

    - tipo: "log"
      archivo: "logs/scheduler.log"
      para: "Auditoría"

    - tipo: "alert"
      para: "Errores y warnings"

  templates:
    task_completed: "[✓] Tarea completada: {descripción}"
    task_failed: "[✗] Tarea fallida: {descripción} - {error}"
    task_queued: "[+] Nueva tarea en cola: {descripción}"
```

---

## FLUJO DE TRABAJO

### Flujo: Tarea Programada

```
[Hora programada alcanzada]
         │
         ▼
[Scheduler detecta tarea pendiente]
         │
         ▼
[Agregar a cola con prioridad]
         │
         ▼
[Dispatcher prioriza]
         │
         ▼
[Asignar a Executor apropiado]
         │
         ▼
[Ejecutar tarea]
         │
         ├── ÉXITO ──> [Registrar resultado]
         │                    │
         │                    ▼
         │             [Notificar si configurado]
         │                    │
         │                    ▼
         │             [Mover a completed]
         │
         └── FALLO ──> [Registrar error]
                             │
                             ▼
                       [¿Reintentos disponibles?]
                             │
                             ├── SÍ ──> [Reprogramar]
                             │
                             └── NO ──> [Mover a failed]
                                              │
                                              ▼
                                        [Notificar error]
```

### Flujo: Tarea por Trigger

```
[Evento detectado (file create, commit, etc)]
         │
         ▼
[Trigger evalúa condiciones]
         │
         ├── NO APLICA ──> [Ignorar]
         │
         └── APLICA ──> [Crear tarea]
                              │
                              ▼
                        [Agregar a cola]
                              │
                              ▼
                        [Dispatcher prioriza]
                              │
                              ├── SYNC ──> [Ejecutar inmediatamente]
                              │                   │
                              │                   └── [Bloquear hasta completar]
                              │
                              └── ASYNC ──> [Ejecutar en background]
```

### Flujo: Tarea Manual

```
[Usuario/Agente solicita tarea]
         │
         ▼
[Validar permisos y parámetros]
         │
         ▼
[¿Requiere confirmación?]
         │
         ├── SÍ ──> [Solicitar confirmación]
         │                │
         │                ├── CONFIRMADO ──> [Continuar]
         │                │
         │                └── CANCELADO ──> [Abortar]
         │
         └── NO ──> [Continuar]
                         │
                         ▼
                   [Crear tarea con prioridad NORMAL]
                         │
                         ▼
                   [Agregar a cola]
```

---

## ESTADO DEL SCHEDULER

### Archivo de Estado

```yaml
# orchestration/state/scheduler-state.yml

scheduler:
  status: "running"
  started: "2026-01-16T08:00:00"
  uptime: "4h 30m"

  stats:
    tasks_processed_today: 15
    tasks_failed_today: 1
    average_task_duration: "12s"
    queue_length: 3

  last_execution:
    daily_sync: "2026-01-16T08:00:00"
    weekly_audit: "2026-01-13T09:00:00"
    weekly_cleanup: "2026-01-10T17:00:00"

  next_scheduled:
    - tarea: "daily-sync-check"
      cuando: "2026-01-17T08:00:00"
    - tarea: "weekly-cleanup"
      cuando: "2026-01-17T17:00:00"

  active_tasks:
    - id: "task-003"
      descripción: "Propagación en curso"
      progreso: 60%
```

### Comandos de Control

```bash
# Ver estado del scheduler
@SCHEDULER status

# Ver cola de tareas
@SCHEDULER queue

# Pausar scheduler
@SCHEDULER pause

# Reanudar scheduler
@SCHEDULER resume

# Ejecutar tarea manualmente
@SCHEDULER run <task-id>

# Cancelar tarea
@SCHEDULER cancel <task-id>

# Limpiar tareas fallidas
@SCHEDULER clear-failed
```

---

## CONFIGURACIÓN

```yaml
# orchestration/config/scheduler.yml

scheduler:
  enabled: true
  check_interval: "1m"  # Frecuencia de verificación de tareas

  limits:
    max_concurrent_tasks: 3
    max_queue_size: 50
    max_retries: 3
    default_timeout: "5m"

  priorities:
    allow_preemption: true  # Permitir que CRITICAL interrumpa otras
    background_limit: 2     # Máximo tareas background simultáneas

  notifications:
    on_task_failed: true
    on_queue_full: true
    on_scheduler_error: true

  persistence:
    state_file: "orchestration/state/scheduler-state.yml"
    queue_file: "orchestration/state/task-queue.yml"
    save_interval: "5m"

  logging:
    level: "info"
    file: "logs/scheduler.log"
    max_size: "10MB"
    rotate: true
```

---

## SCRIPTS DE SOPORTE

### Script Principal del Scheduler

```bash
#!/bin/bash
# scripts/scheduler/scheduler-daemon.sh

# Ejecuta el loop principal del scheduler
# Verifica tareas programadas y ejecuta según prioridad

FUNCIONES:
  - check_scheduled_tasks()
  - process_queue()
  - dispatch_task()
  - handle_completion()
  - handle_failure()
```

### Script de Gestión de Cola

```bash
#!/bin/bash
# scripts/scheduler/queue-manager.sh

OPCIONES:
  list          # Listar cola
  add <task>    # Agregar tarea
  remove <id>   # Remover tarea
  prioritize    # Recalcular prioridades
  clear         # Limpiar cola
```

---

## INTEGRACIÓN CON TRIGGERS

### Mapa de Triggers -> Tareas

```yaml
trigger_task_mapping:
  TRIGGER-WORKSPACE-SYNC:
    SESSION_START: "quick-status-check"
    PRE_MAJOR_COMMIT: "verify-remote-state"
    POST_TASK_COMPLETE: "suggest-push"
    PERIODIC_SYNC: "background-fetch"

  TRIGGER-FUNCTIONALITY-CHECK:
    NEW_ENTITY_CREATED: "check-duplicate-entity"
    NEW_MODULE_CREATED: "analyze-module"
    NEW_FEATURE_CREATED: "verify-backend-exists"
    PERIODIC_AUDIT: "full-functionality-audit"

  TRIGGER-PROPAGACION-AUTOMATICA:
    DOC_CHANGED: "propagate-doc-immediate"
    CODE_CHANGED: "queue-code-propagation"
    SECURITY_FIX: "propagate-security-urgent"
```

---

## DASHBOARD DE ESTADO

```
╔══════════════════════════════════════════════════════════════════╗
║                    SCHEDULER DASHBOARD                            ║
╠══════════════════════════════════════════════════════════════════╣
║ Estado: RUNNING                    Uptime: 4h 30m                ║
╠══════════════════════════════════════════════════════════════════╣
║ COLA DE TAREAS                                                   ║
║ ┌────────┬──────────────────────────────┬──────────┬───────────┐ ║
║ │ ID     │ Descripción                  │ Prioridad│ Estado    │ ║
║ ├────────┼──────────────────────────────┼──────────┼───────────┤ ║
║ │ T-003  │ Propagación a erp-const.     │ NORMAL   │ ▶ 60%     │ ║
║ │ T-004  │ Verificar duplicado entity   │ HIGH     │ Pending   │ ║
║ │ T-005  │ Cleanup branches (scheduled) │ LOW      │ Pending   │ ║
║ └────────┴──────────────────────────────┴──────────┴───────────┘ ║
╠══════════════════════════════════════════════════════════════════╣
║ ESTADÍSTICAS HOY                                                 ║
║ Completadas: 15  │  Fallidas: 1  │  En cola: 3  │  Promedio: 12s║
╠══════════════════════════════════════════════════════════════════╣
║ PRÓXIMAS PROGRAMADAS                                             ║
║ • daily-sync-check      → Mañana 08:00                          ║
║ • weekly-cleanup        → Viernes 17:00                          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## NOTAS DE IMPLEMENTACIÓN

1. **Scheduler como concepto, no daemon**: En el contexto de Claude Code, el scheduler es un modelo conceptual. Las tareas programadas se ejecutan cuando el agente está activo y verifica el estado.

2. **Persistencia de estado**: El estado se guarda en YAML para sobrevivir entre sesiones.

3. **Triggers son síncronos cuando SYNC**: Las tareas marcadas como SYNC deben completar antes de continuar el trabajo.

4. **No sobrecargar**: El límite de 3 tareas concurrentes evita sobrecargar el sistema.

5. **Fail gracefully**: Si una tarea falla, no debe afectar otras tareas ni el trabajo principal.

6. **Logs son críticos**: Mantener logs detallados para debugging y auditoría.

---

## COMANDOS RÁPIDOS

```bash
# Ver estado del scheduler
cat orchestration/state/scheduler-state.yml

# Ver cola de tareas
cat orchestration/state/task-queue.yml

# Ejecutar verificación manual
./scripts/workspace/validate-workspace.sh

# Ver log del scheduler
tail -f logs/scheduler.log
```

---

**Última actualización:** 2026-01-16
**Mantenido por:** @WS_ORCHESTRATOR
