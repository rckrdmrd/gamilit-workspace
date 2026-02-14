# TRIGGER: Commit y Push Obligatorio

**Version:** 1.1.0
**Fecha:** 2026-01-24
**Tipo:** AUTOMATICO
**Prioridad:** CRITICA

---

## ACTIVACION

Este trigger se activa AUTOMATICAMENTE cuando:

1. Se completa una tarea que creo o modifico archivos
2. Se marca un todo como "completed"
3. Se reporta al usuario que una tarea esta finalizada
4. Se cambia de contexto a otra tarea
5. Antes de finalizar una sesion de trabajo

---

## ACCION OBLIGATORIA

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ANTES DE REPORTAR TAREA COMPLETADA:                                    ║
║                                                                           ║
║   1. Ejecutar: git status                                                 ║
║      - Si hay cambios pendientes -> continuar                            ║
║      - Si esta limpio -> verificar que push se hizo                      ║
║                                                                           ║
║   2. Si hay cambios:                                                      ║
║      git add .                                                            ║
║      git commit -m "[TAREA-ID] tipo: descripcion"                        ║
║      git push origin master                                                 ║
║                                                                           ║
║   3. Si hay SUBMODULES modificados:                                      ║
║      - Commitear y push en CADA submodule primero                        ║
║      - Luego actualizar workspace principal                              ║
║                                                                           ║
║   4. Verificar sincronizacion:                                           ║
║      git log origin/master..HEAD --oneline                                 ║
║      - Debe estar VACIO (sin commits pendientes de push)                 ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## SECUENCIA WORKSPACE-V2

El workspace-v2 usa submodules. Secuencia obligatoria:

```bash
# PASO 1: Identificar submodules modificados
cd /home/isem/workspace-v2
git status

# PASO 2: Para CADA submodule con cambios
cd projects/{submodule}
git add .
git commit -m "[{submodule}] tipo: descripcion"
git push origin master
cd ../..

# PASO 3: Actualizar workspace principal
git add .
git commit -m "[WORKSPACE] chore: descripcion de cambios"
git push origin master

# PASO 4: Verificar TODO sincronizado
git status  # Debe mostrar "clean"
git submodule foreach 'git status'  # Todos deben estar "clean"
```

---

## VALIDACIONES OBLIGATORIAS PARA SUBMODULOS

```yaml
# Checklist OBLIGATORIO antes de commit en submodulos
validaciones_submodulos:
  verificar_branch_es_main: true        # NO commitear en ramas temporales
  verificar_no_detached_head: true      # Resolver detached HEAD antes de commit
  verificar_sync_con_remote: true       # Fetch + verificar divergencias
  orden_commit: "interno_a_externo"     # Siempre de submodulo hacia workspace
```

### Protocolo Anti-Detached HEAD

```bash
# ANTES de cualquier commit en submodulo:
cd projects/{proyecto}/{componente}

# 1. Verificar branch actual
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" == "HEAD" ]; then
    echo "ADVERTENCIA: Detached HEAD detectado"

    # 2. Guardar commit actual
    CURRENT_COMMIT=$(git rev-parse HEAD)

    # 3. Cambiar a main
    git checkout main

    # 4. Merge del commit (si había cambios)
    git merge $CURRENT_COMMIT --no-edit
fi

# 5. Ahora sí, proceder con commit normal
git add .
git commit -m "[mensaje]"
git push origin master
```

### Protocolo de Resolución de Divergencias

```bash
# Si git fetch muestra divergencia (commits locales Y remotos):
LOCAL_AHEAD=$(git log origin/master..HEAD --oneline | wc -l)
REMOTE_AHEAD=$(git log HEAD..origin/master --oneline | wc -l)

if [ "$LOCAL_AHEAD" -gt 0 ] && [ "$REMOTE_AHEAD" -gt 0 ]; then
    echo "DIVERGENCIA DETECTADA: $LOCAL_AHEAD locales, $REMOTE_AHEAD remotos"

    # OPCION A: Merge (recomendado)
    git merge origin/master --no-edit

    # OPCION B: Si merge falla, usar rebase
    # git rebase origin/master

    # OPCION C: Reset + cherry-pick (último recurso)
    # LOCAL_COMMIT=$(git log --oneline -1 | cut -d' ' -f1)
    # git reset --hard origin/master
    # git cherry-pick $LOCAL_COMMIT
fi
```

### Orden de Commit Multi-Nivel

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ORDEN OBLIGATORIO: INTERNO → EXTERNO                                   ║
║                                                                           ║
║   1. PRIMERO: Subrepositorios (Nivel 2)                                  ║
║      projects/{proyecto}/backend                                          ║
║      projects/{proyecto}/frontend                                         ║
║      projects/{proyecto}/database                                         ║
║                                                                           ║
║   2. SEGUNDO: Proyecto padre (Nivel 1)                                   ║
║      projects/{proyecto}                                                  ║
║                                                                           ║
║   3. TERCERO: Workspace (Nivel 0)                                        ║
║      workspace-v2/                                                        ║
║                                                                           ║
║   VIOLACION DE ORDEN = REFERENCIAS INCONSISTENTES                        ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Script de Validación Pre-Commit

```bash
# Ejecutar ANTES de reportar tarea completada:
./scripts/validation/validate-sync.sh

# Debe retornar:
# - 0 = Todo sincronizado
# - 1 = Hay errores que resolver
```

---

## ERRORES A EVITAR

| Error | Consecuencia | Prevencion |
|-------|--------------|------------|
| No hacer push | Archivos solo en local | Siempre push despues de commit |
| Olvidar submodules | Referencias desincronizadas | Commitear submodules primero |
| Reportar sin verificar | Usuario cree que esta hecho | Verificar git status antes |
| Commitear sin push | Cambios no en remoto | Push inmediato tras commit |

---

## VERIFICACION RAPIDA

```bash
# Comando unico para verificar todo sincronizado
git status && git log origin/master..HEAD --oneline

# Salida esperada:
# On branch main
# Your branch is up to date with 'origin/master'.
# nothing to commit, working tree clean
# (sin output del log = todo pusheado)
```

---

## INTEGRACION CON CAPVED

Este trigger se ejecuta en:

- **Fase E (Ejecucion):** Commit atomico por cada cambio logico
- **Fase D (Documentacion):** Commit final con documentacion
- **Post-Tarea:** Push OBLIGATORIO antes de reportar completado

```yaml
fase_D_documentacion:
  ultimo_paso: "Commit + Push de todos los cambios"
  verificacion: "git status clean + git log empty"
  reportar_solo_si: "Todo sincronizado con remoto"
```

---

## MENSAJE AL AGENTE

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   RECUERDA: Una tarea NO esta completa hasta que:                        ║
║                                                                           ║
║   1. Todos los archivos estan GUARDADOS en disco                         ║
║   2. Todos los cambios estan COMMITEADOS                                 ║
║   3. Todos los commits estan PUSHEADOS al remoto                         ║
║   4. git status muestra "working tree clean"                             ║
║   5. git log origin/master..HEAD esta VACIO                                ║
║                                                                           ║
║   SIN PUSH = TRABAJO PERDIDO POTENCIAL                                   ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## REFERENCIAS

- SIMCO-GIT.md - Directiva principal de control de versiones
- SIMCO-SUBMODULOS.md - Manejo de submodulos y nested repos
- PRINCIPIO-CAPVED.md - Ciclo de vida de tareas
- SIMCO-TAREA.md - Punto de entrada de tareas
- scripts/validation/validate-sync.sh - Script de validación de sincronización

---

**Sistema:** SIMCO v4.0.0
**Mantenido por:** Workspace Admin
**Actualizado:** 2026-01-24 - Agregadas validaciones de submodulos (v1.1.0)
