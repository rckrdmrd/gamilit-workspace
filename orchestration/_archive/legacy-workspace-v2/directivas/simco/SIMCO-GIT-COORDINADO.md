# SIMCO-GIT-COORDINADO.md
# Protocolo para Operaciones Git Coordinadas Multi-Repositorio
# Version: 1.0.0
# Sistema: SIMCO v4.0.0

---

## 1. PROPOSITO

Esta directiva establece el protocolo para operaciones git que afectan multiples repositorios simultaneamente, asegurando:
- Atomicidad logica de cambios relacionados
- Consistencia entre niveles de repositorios
- Trazabilidad completa de propagaciones
- Recuperacion ante fallos parciales

---

## 2. CUANDO APLICA

Esta directiva se activa cuando:

| Escenario | Ejemplo |
|-----------|---------|
| Cambio en proyecto con subrepositorios | Modificar erp-core/backend + erp-core/database |
| Propagacion de cambios | Fix en erp-core que debe ir a verticales |
| Actualizacion de mirrors | Sincronizar shared/mirrors/ con origenes |
| Migracion o refactor mayor | Renombrar entidad en multiples proyectos |

---

## 3. FLUJO DE OPERACION COORDINADA

### 3.1 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                    OPERACION COORDINADA                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FASE 1: PREPARACION                                           │
│  ├── Identificar todos los repositorios afectados              │
│  ├── Verificar estado limpio en cada uno                       │
│  └── Crear registro de operacion                               │
│                                                                 │
│  FASE 2: EJECUCION                                             │
│  ├── Aplicar cambios en cada repositorio                       │
│  ├── Validar build/lint en cada uno                            │
│  └── Preparar commits (sin ejecutar)                           │
│                                                                 │
│  FASE 3: COMMIT COORDINADO                                     │
│  ├── Commit nivel 2 (subrepositorios)                          │
│  ├── Commit nivel 1 (proyectos)                                │
│  └── Commit nivel 0 (workspace)                                │
│                                                                 │
│  FASE 4: PUSH COORDINADO                                       │
│  ├── Push nivel 2 (subrepositorios)                            │
│  ├── Push nivel 1 (proyectos)                                  │
│  └── Push nivel 0 (workspace)                                  │
│                                                                 │
│  FASE 5: VERIFICACION                                          │
│  ├── Verificar sincronizacion de todos los repos               │
│  ├── Actualizar trazabilidad                                   │
│  └── Notificar dependientes                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. TIPOS DE OPERACIONES COORDINADAS

### 4.1 TIPO A: Cambio Local Multi-Componente

**Descripcion:** Cambio que afecta multiples componentes de un mismo proyecto

**Ejemplo:** Nueva entidad que requiere cambios en DDL, backend y frontend

```yaml
operacion:
  tipo: "LOCAL_MULTI_COMPONENTE"
  proyecto: "erp-construccion"
  componentes_afectados:
    - database  # DDL de la entidad
    - backend   # Entity + Service + Controller
    - frontend  # Componentes UI

  orden_ejecucion:
    1: database   # Primero DDL
    2: backend    # Segundo backend (depende de DDL)
    3: frontend   # Tercero frontend (depende de backend)

  orden_commit:
    1: database
    2: backend
    3: frontend
    4: proyecto_padre
    5: workspace
```

### 4.2 TIPO B: Propagacion Vertical

**Descripcion:** Cambio en proyecto padre que debe propagarse a hijos

**Ejemplo:** Fix en erp-core que debe ir a todas las verticales

```yaml
operacion:
  tipo: "PROPAGACION_VERTICAL"
  origen: "erp-core"
  destinos:
    - erp-construccion
    - erp-clinicas
    - erp-mecanicas-diesel
    - erp-retail
    - erp-vidrio-templado

  orden_ejecucion:
    1: erp-core           # Aplicar en origen
    2: validar_origen     # Build + lint + tests
    3: erp-construccion   # Propagar a vertical
    4: erp-clinicas
    5: erp-mecanicas-diesel
    6: erp-retail
    7: erp-vidrio-templado
    8: validar_destinos   # Build + lint en cada uno

  orden_commit:
    # Por cada proyecto (origen + destinos):
    # 1. Commit subrepositorios
    # 2. Commit proyecto
    # Finalmente: Commit workspace con todos los proyectos
```

### 4.3 TIPO C: Sincronizacion de Mirrors

**Descripcion:** Actualizar mirrors con contenido de proyectos origen

```yaml
operacion:
  tipo: "SYNC_MIRRORS"
  mirrors:
    - origen: "projects/template-saas"
      destino: "shared/mirrors/template-saas"
    - origen: "projects/erp-core"
      destino: "shared/mirrors/erp-core"

  orden_ejecucion:
    1: copiar_documentacion
    2: copiar_definiciones
    3: actualizar_propagation_status
    4: commit_mirrors
    5: commit_workspace
```

---

## 5. REGISTRO DE OPERACION COORDINADA

### 5.1 Archivo de Registro

Antes de iniciar una operacion coordinada, crear registro temporal:

```yaml
# /tmp/git-operation-{timestamp}.yml
operation_id: "OP-2026-01-16-001"
started_at: "2026-01-16T10:30:00Z"
type: "PROPAGACION_VERTICAL"
status: "in_progress"

affected_repos:
  - path: "projects/erp-core/backend"
    status: "pending"
    commit_sha: null
    pushed: false

  - path: "projects/erp-construccion/backend"
    status: "pending"
    commit_sha: null
    pushed: false

  # ... mas repos

checkpoints:
  - timestamp: "2026-01-16T10:30:00Z"
    action: "started"

  - timestamp: "2026-01-16T10:35:00Z"
    action: "committed_erp_core_backend"
    commit_sha: "abc123"
```

### 5.2 Actualizacion Durante Operacion

```bash
# Despues de cada commit exitoso, actualizar registro
# Esto permite recuperacion si algo falla
```

---

## 6. PROTOCOLO DE PROPAGACION

### 6.1 Propagacion de Codigo (Validada)

```bash
#!/bin/bash
# Script: propagate-code.sh

ORIGEN=$1
DESTINOS=$2  # Lista separada por comas

# FASE 1: Validar origen
echo "=== Validando origen: $ORIGEN ==="
cd /home/isem/workspace-v2/projects/$ORIGEN/backend
npm run build || exit 1
npm run lint || exit 1

# FASE 2: Aplicar en destinos
for DESTINO in $(echo $DESTINOS | tr ',' ' '); do
  echo "=== Propagando a: $DESTINO ==="
  cd /home/isem/workspace-v2/projects/$DESTINO/backend

  # Aplicar cambios (metodo depende del tipo de cambio)
  # ...

  # Validar destino
  npm run build || exit 1
  npm run lint || exit 1
done

# FASE 3: Commits coordinados
# (Seguir protocolo de SIMCO-SUBMODULOS.md)
```

### 6.2 Propagacion de Documentacion (Inmediata)

```bash
#!/bin/bash
# Script: propagate-docs.sh

ORIGEN=$1
DESTINO=$2

# Sin validacion, copiar directamente
cp -r /home/isem/workspace-v2/projects/$ORIGEN/docs/* \
      /home/isem/workspace-v2/shared/mirrors/$ORIGEN/docs/

# Actualizar status
echo "last_sync: $(date -Iseconds)" >> \
  /home/isem/workspace-v2/shared/mirrors/$ORIGEN/PROPAGATION-STATUS.yml
```

---

## 7. MANEJO DE FALLOS

### 7.1 Fallo Durante Commit

```yaml
escenario: "Commit fallo en uno de los repositorios"
accion:
  1: "NO continuar con commits en otros repos"
  2: "Resolver el problema en el repo que fallo"
  3: "Reintentar commit"
  4: "Continuar con el resto"
```

### 7.2 Fallo Durante Push

```yaml
escenario: "Push fallo despues de algunos repos exitosos"
accion:
  1: "Registrar cuales repos ya tienen push"
  2: "Resolver problema (network, permisos, etc)"
  3: "Reintentar push SOLO en repos pendientes"
  4: "Verificar consistencia final"
```

### 7.3 Rollback de Operacion

```bash
#!/bin/bash
# Script: rollback-operation.sh

# SOLO usar si es absolutamente necesario
# Preferir fix-forward cuando sea posible

# 1. Identificar commits de la operacion
COMMITS=$(cat /tmp/git-operation-{id}.yml | grep commit_sha)

# 2. Revertir en orden INVERSO (afuera hacia adentro)
# Primero workspace, luego proyectos, luego subrepositorios

# 3. Push de los reverts
```

---

## 8. INTEGRACION CON SISTEMA SIMCO

### 8.1 Aliases Disponibles

| Alias | Descripcion | Directiva |
|-------|-------------|-----------|
| `@GIT-COORDINATED` | Iniciar operacion coordinada | Esta directiva |
| `@PROPAGATE-CODE` | Propagar codigo validado | SIMCO-PROPAGACION.md |
| `@PROPAGATE-DOC` | Propagar documentacion | SIMCO-PROPAGACION.md |
| `@SYNC-MIRRORS` | Sincronizar mirrors | SIMCO-MIRRORS.md |

### 8.2 Integracion con Trazabilidad

Despues de cada operacion coordinada exitosa:

1. Actualizar `docs/_SSOT/TRACEABILITY-MASTER.yml`
2. Actualizar `orchestration/inventarios/SUBMODULES-INVENTORY.yml`
3. Actualizar `shared/mirrors/*/PROPAGATION-STATUS.yml` si aplica
4. Registrar en `orchestration/trazas/TRAZA-GIT-OPERATIONS.md`

---

## 9. CHECKLIST DE OPERACION COORDINADA

### Pre-Operacion
- [ ] Identificar todos los repositorios afectados
- [ ] Verificar estado limpio (`git status` en cada uno)
- [ ] Crear registro de operacion
- [ ] Notificar si otros estan trabajando en los mismos repos

### Durante Operacion
- [ ] Aplicar cambios en orden correcto
- [ ] Validar build/lint despues de cada cambio
- [ ] Registrar cada paso completado

### Post-Commits
- [ ] Verificar commits en todos los niveles
- [ ] Verificar mensajes de commit consistentes
- [ ] Preparar lista de push en orden correcto

### Post-Push
- [ ] Verificar push exitoso en todos los repos
- [ ] Actualizar trazabilidad
- [ ] Limpiar registro temporal
- [ ] Notificar completado

---

## 10. REFERENCIAS

- `SIMCO-SUBMODULOS.md` - Protocolo base de submodulos
- `SIMCO-GIT.md` - Operaciones git basicas
- `SIMCO-GIT-REMOTES.md` - Operaciones remotas
- `SIMCO-PROPAGACION.md` - Sistema de propagacion
- `orchestration/SUBMODULES-POLICY.yml` - Politicas

---

*Sistema SIMCO v4.0.0 - Operaciones Git Coordinadas*
*Version: 1.0.0*
*Creado: 2026-01-16*
