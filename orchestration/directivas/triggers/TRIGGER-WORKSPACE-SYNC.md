# TRIGGER-WORKSPACE-SYNC.md
# Trigger Automático de Sincronización del Workspace

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Tipo:** Trigger Automático
**Ejecutor:** @WS_ORCHESTRATOR

---

## PROPÓSITO

Este trigger define las condiciones y acciones para sincronización automática de:
1. Repositorios locales con remotos (Gitea)
2. Submodules del workspace
3. Estados de proyectos
4. Mirrors de propagación

---

## EVENTOS DISPARADORES

### 1. Inicio de Sesión de Trabajo

```yaml
trigger: SESSION_START
condiciones:
  - Inicio de nueva sesión de Claude Code
  - Primera interacción después de >4 horas de inactividad

acciones:
  - name: "quick_status_check"
    comando: "./scripts/workspace/sync-all-remotes.sh --dry-run --quiet"
    timeout: 30s

  - name: "report_pending_changes"
    descripción: "Informar si hay cambios pendientes de push/pull"

prioridad: BACKGROUND
bloquea_trabajo: false
```

### 2. Antes de Commit Mayor

```yaml
trigger: PRE_MAJOR_COMMIT
condiciones:
  - Commit afecta >5 archivos
  - Commit en proyecto core (template-saas, erp-core)
  - Commit incluye cambios de schema DDL

acciones:
  - name: "verify_remote_state"
    comando: "git fetch --all --quiet"

  - name: "check_ahead_behind"
    descripción: "Verificar si estamos adelante/atrás del remoto"

  - name: "warn_if_behind"
    condición: "branch está detrás del remoto"
    acción: "ADVERTIR y sugerir pull antes de commit"

prioridad: SYNC
bloquea_trabajo: true
```

### 3. Después de Completar Tarea

```yaml
trigger: POST_TASK_COMPLETE
condiciones:
  - Tarea marcada como completada
  - Hay commits locales no pusheados

acciones:
  - name: "suggest_push"
    descripción: "Sugerir push de cambios completados"

  - name: "auto_push_if_configured"
    condición: "AUTO_PUSH=true en configuración"
    comando: "git push origin $(git branch --show-current)"

prioridad: LOW
bloquea_trabajo: false
```

### 4. Cambio en Proyecto Provider

```yaml
trigger: PROVIDER_CHANGE
condiciones:
  - Cambio detectado en template-saas
  - Cambio afecta módulos compartidos

acciones:
  - name: "notify_propagation_needed"
    descripción: "Notificar que hay cambios para propagar"

  - name: "update_mirror"
    comando: "./scripts/propagation/propagate-doc.sh --source template-saas --dry-run"

  - name: "queue_propagation"
    descripción: "Encolar tarea de propagación si es código"

prioridad: NORMAL
bloquea_trabajo: false
```

### 5. Sincronización Periódica

```yaml
trigger: PERIODIC_SYNC
condiciones:
  - Han pasado >2 horas desde última sincronización
  - Sesión activa de trabajo

acciones:
  - name: "background_fetch"
    comando: "git fetch --all --quiet"

  - name: "check_submodule_updates"
    comando: "./scripts/git/sync-submodules.sh --dry-run --quiet"

  - name: "report_if_updates_available"
    condición: "Hay actualizaciones disponibles"
    acción: "Informar al agente/usuario"

prioridad: BACKGROUND
bloquea_trabajo: false
```

---

## MATRIZ DE CONDICIONES Y ACCIONES

```
┌─────────────────────┬──────────────────┬─────────────────────┬──────────────┐
│ Evento              │ Condición        │ Acción              │ Prioridad    │
├─────────────────────┼──────────────────┼─────────────────────┼──────────────┤
│ SESSION_START       │ Siempre          │ Quick status check  │ BACKGROUND   │
│ PRE_MAJOR_COMMIT    │ >5 archivos      │ Fetch + verificar   │ SYNC         │
│ POST_TASK_COMPLETE  │ Commits locales  │ Sugerir push        │ LOW          │
│ PROVIDER_CHANGE     │ En template-saas │ Notificar propag.   │ NORMAL       │
│ PERIODIC_SYNC       │ >2h sin sync     │ Background fetch    │ BACKGROUND   │
│ CONFLICT_DETECTED   │ Merge conflict   │ DETENER y notificar │ CRITICAL     │
│ SUBMODULE_OUTDATED  │ Submodule atrás  │ Sugerir update      │ LOW          │
└─────────────────────┴──────────────────┴─────────────────────┴──────────────┘
```

---

## SCRIPTS ASOCIADOS

### Script Principal de Sincronización

```bash
# Ubicación: scripts/workspace/sync-all-remotes.sh

OPCIONES:
  --dry-run     Simular sin ejecutar
  --quiet       Solo errores y advertencias
  --project X   Solo un proyecto específico
  --force       Forzar incluso con cambios locales
```

### Script de Verificación de Estado

```bash
# Ubicación: scripts/workspace/check-sync-status.sh (a crear)

FUNCIONES:
  - Verificar si repos están sincronizados
  - Listar commits pendientes de push
  - Listar commits disponibles para pull
  - Detectar conflictos potenciales
```

---

## CONFIGURACIÓN

### Variables de Entorno

```bash
# En .env o exportadas en sesión

# Habilitar auto-push después de tareas
WORKSPACE_AUTO_PUSH=false

# Intervalo de sincronización periódica (segundos)
WORKSPACE_SYNC_INTERVAL=7200

# Proyectos a excluir de sincronización automática
WORKSPACE_SYNC_EXCLUDE="proyecto-experimental,sandbox"

# Nivel de verbosidad para logs
WORKSPACE_SYNC_LOG_LEVEL="info"
```

### Archivo de Configuración

```yaml
# orchestration/config/workspace-sync.yml

sync:
  enabled: true
  interval_hours: 2

  auto_push:
    enabled: false
    only_on_task_complete: true
    exclude_branches:
      - "feature/*"
      - "experiment/*"

  auto_pull:
    enabled: true
    only_if_clean: true

  notifications:
    on_behind: true
    on_conflict: true
    on_submodule_update: true

  exclude_projects:
    - "sandbox"
    - "archived/*"
```

---

## FLUJO DE EJECUCIÓN

### Flujo: Inicio de Sesión

```
[Inicio Sesión]
      │
      ▼
[Ejecutar quick_status_check]
      │
      ├── Si hay cambios remotos ──> [Informar: "X proyectos tienen updates"]
      │
      ├── Si hay commits locales ──> [Informar: "X commits pendientes de push"]
      │
      └── Si todo sincronizado ──> [Continuar silenciosamente]
```

### Flujo: Pre-Commit Mayor

```
[Detectar commit >5 archivos]
      │
      ▼
[git fetch --all]
      │
      ▼
[Comparar con remoto]
      │
      ├── Si estamos adelante ──> [OK, proceder con commit]
      │
      ├── Si estamos atrás ──> [ADVERTIR: "Pull recomendado antes de commit"]
      │                              │
      │                              ├── Usuario confirma ──> [Proceder]
      │                              └── Usuario cancela ──> [Hacer pull primero]
      │
      └── Si hay divergencia ──> [DETENER: "Resolver divergencia primero"]
```

### Flujo: Cambio en Provider

```
[Cambio en template-saas]
      │
      ▼
[Clasificar tipo de cambio]
      │
      ├── Documentación ──> [Propagar inmediatamente via mirror]
      │
      ├── Definiciones ──> [Validar YAML + Propagar]
      │
      └── Código ──> [Encolar para propagación validada]
                          │
                          ▼
                    [Notificar: "Cambio en provider, propagación pendiente"]
```

---

## INTEGRACIÓN CON OTROS TRIGGERS

### Secuencia con TRIGGER-PROPAGACION-AUTOMATICA

```
TRIGGER-WORKSPACE-SYNC detecta cambio en provider
      │
      ▼
Activa TRIGGER-PROPAGACION-AUTOMATICA
      │
      ▼
Propagación ejecuta según tipo de cambio
      │
      ▼
TRIGGER-WORKSPACE-SYNC sincroniza mirrors actualizados
```

### Secuencia con TRIGGER-FUNCTIONALITY-CHECK

```
TRIGGER-WORKSPACE-SYNC detecta nuevo archivo
      │
      ├── Si es funcionalidad nueva
      │         │
      │         ▼
      │   Activa TRIGGER-FUNCTIONALITY-CHECK
      │         │
      │         ▼
      │   Verificar duplicados, registrar en inventario
      │
      └── Si no es funcionalidad ──> [Continuar normal]
```

---

## MANEJO DE ERRORES

### Error: Conflicto de Merge

```yaml
error: MERGE_CONFLICT
severidad: CRITICAL
acción_automática:
  - DETENER cualquier operación de sync
  - Notificar inmediatamente
  - Mostrar archivos en conflicto
  - Sugerir comandos para resolver

mensaje: |
  ⚠️ CONFLICTO DETECTADO

  Archivos en conflicto:
  {lista_archivos}

  Opciones:
  1. Resolver manualmente y hacer commit
  2. git merge --abort para cancelar
  3. Solicitar ayuda de @GIT-SPECIALIST
```

### Error: Remote No Disponible

```yaml
error: REMOTE_UNAVAILABLE
severidad: WARNING
acción_automática:
  - Registrar en log
  - Continuar trabajando localmente
  - Reintentar en próximo ciclo

mensaje: |
  ⚠️ Remote no disponible: {remote_name}

  Trabajo local no afectado.
  Se reintentará sincronización en {interval}.
```

### Error: Submodule Desincronizado

```yaml
error: SUBMODULE_DIRTY
severidad: WARNING
acción_automática:
  - Listar submodules afectados
  - Sugerir comandos para resolver

mensaje: |
  ⚠️ Submodules con cambios locales:
  {lista_submodules}

  Opciones:
  1. Commit cambios en submodule primero
  2. git submodule update --force (descarta cambios)
```

---

## LOGS Y AUDITORÍA

### Ubicación de Logs

```
logs/
└── workspace-sync/
    ├── sync-2026-01-16.log      # Log diario
    ├── errors-2026-01.log       # Errores del mes
    └── summary-weekly.log       # Resumen semanal
```

### Formato de Log

```
[2026-01-16 10:30:15] [INFO] SESSION_START - Quick status check iniciado
[2026-01-16 10:30:17] [INFO] workspace-v2: sincronizado
[2026-01-16 10:30:18] [WARN] erp-core: 3 commits pendientes de push
[2026-01-16 10:30:19] [INFO] gamilit: 2 updates disponibles
[2026-01-16 10:30:20] [INFO] SESSION_START - Completado en 5s
```

---

## MÉTRICAS

```yaml
métricas_tracked:
  - sync_operations_total
  - sync_operations_failed
  - commits_auto_pushed
  - conflicts_detected
  - average_sync_time_seconds
  - projects_out_of_sync
  - submodules_updated

reportes:
  - frecuencia: diario
    incluye: [operations, errors, time]
  - frecuencia: semanal
    incluye: [trends, recommendations]
```

---

## COMANDOS RÁPIDOS

```bash
# Verificar estado de sincronización
./scripts/workspace/sync-all-remotes.sh --dry-run

# Sincronizar todo (con confirmación)
./scripts/workspace/sync-all-remotes.sh

# Sincronizar solo un proyecto
./scripts/workspace/sync-all-remotes.sh --project erp-core

# Ver log de sincronización
tail -f logs/workspace-sync/sync-$(date +%Y-%m-%d).log
```

---

## NOTAS DE IMPLEMENTACIÓN

1. **No bloquear trabajo**: Las sincronizaciones de background nunca deben bloquear el trabajo del agente.

2. **Fail gracefully**: Si el remote no está disponible, continuar trabajando localmente.

3. **Respetar cambios locales**: Nunca hacer pull automático si hay cambios no committeados.

4. **Priorizar notificación**: Es mejor notificar y dejar que el usuario/agente decida que actuar automáticamente.

5. **Logs detallados**: Mantener logs detallados para debugging pero mostrar solo resúmenes al usuario.

---

**Última actualización:** 2026-01-16
**Mantenido por:** @WS_ORCHESTRATOR
