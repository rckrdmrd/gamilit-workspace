# TRIGGER: Fetch Obligatorio Antes de Operar

**Version:** 1.0.0
**Fecha:** 2026-01-16
**Tipo:** AUTOMATICO
**Prioridad:** CRITICA
**Incidente de Origen:** INC-2026-01-16-001

---

## ACTIVACION

Este trigger se activa AUTOMATICAMENTE cuando:

1. Se inicia una sesion de trabajo en el workspace
2. Se va a verificar el estado de git (git status)
3. Se va a realizar cualquier operacion git (commit, push, pull)
4. Se retoma trabajo despues de una pausa
5. Se cambia de contexto entre carpetas del monorepo

---

## ACCION OBLIGATORIA

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ANTES DE VERIFICAR ESTADO O REALIZAR OPERACIONES GIT:                  ║
║                                                                           ║
║   1. Ejecutar: git fetch origin                                          ║
║      → Obtiene el estado actual del repositorio remoto                  ║
║                                                                           ║
║   2. Verificar: git log HEAD..origin/master --oneline                      ║
║      → Si hay output = HAY COMMITS REMOTOS QUE NO TIENES                ║
║      → Si esta vacio = Estas sincronizado                               ║
║                                                                           ║
║   3. Si hay commits remotos:                                             ║
║      git pull origin master                                              ║
║      → Sincroniza tu local con el remoto                                ║
║                                                                           ║
║   4. AHORA SI verificar estado:                                          ║
║      git status                                                           ║
║                                                                           ║
║   MOTIVO: Otro agente pudo haber hecho cambios en otra sesion.          ║
║   Sin FETCH, reportaras estado incompleto.                              ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## SECUENCIA COMPLETA

```bash
# PASO 1: Fetch del remoto
git fetch origin

# PASO 2: Verificar si hay commits remotos no sincronizados
REMOTE_COMMITS=$(git log HEAD..origin/master --oneline)

# PASO 3: Si hay commits remotos, sincronizar
if [ -n "$REMOTE_COMMITS" ]; then
    echo "Commits remotos detectados:"
    echo "$REMOTE_COMMITS"
    git pull origin master
fi

# PASO 4: Ahora verificar estado local
git status
```

---

## PARA MONOREPO STANDALONE

Gamilit se maneja como un solo repositorio git (sin submodules):

```bash
git fetch origin
git log HEAD..origin/master --oneline
# Si hay output: git pull origin master
git status
```

---

## ERRORES A EVITAR

| Error | Consecuencia | Prevencion |
|-------|--------------|------------|
| Solo hacer git status | No detectar commits remotos | SIEMPRE fetch primero |
| Reportar "clean" sin fetch | Usuario confundido | Seguir secuencia completa |
| Asumir que no hay cambios | Desincronizacion | Verificar con log HEAD..origin |
| Asumir estructura multi-repo | Flujo incorrecto | Usar solo flujo monorepo standalone |

---

## INCIDENTE DE ORIGEN

### INC-2026-01-16-001

**Descripcion:** Un agente reporto "working tree clean" cuando habia un commit
remoto (c027da53) que no habia sido detectado.

**Causa Raiz:** No se ejecuto `git fetch` antes de verificar estado con `git status`.

**Impacto:** Usuario confundido sobre el estado real del repositorio.

**Resolucion:**
- Creado este trigger obligatorio
- Actualizado SIMCO-GIT.md v1.2.0 con regla critica
- Actualizado SIMCO-MONOREPO.md con secuencia obligatoria (antes: SIMCO-SUBMODULOS.md, eliminado)
- Documentado en TRAZA-GIT-OPERATIONS.md

---

## VERIFICACION RAPIDA

```bash
# Comando unico para verificar sincronizacion completa
git fetch origin && git log HEAD..origin/master --oneline && git status

# Salida esperada si todo sincronizado:
# (sin output del log)
# On branch main
# Your branch is up to date with 'origin/master'.
# nothing to commit, working tree clean
```

---

## INTEGRACION CON CAPVED

Este trigger se ejecuta en:

- **Pre-Tarea:** SIEMPRE antes de iniciar cualquier tarea
- **Pre-Commit:** Antes de hacer commit (verificar no hay conflictos)
- **Pre-Push:** Antes de push (verificar no hay rechazos pendientes)
- **Post-Pausa:** Al retomar trabajo despues de interrupcion

```yaml
pre_tarea:
  primer_paso: "git fetch origin"
  verificar: "git log HEAD..origin/master"
  sincronizar_si_necesario: "git pull origin master"
  luego: "Continuar con la tarea"
```

---

## REFERENCIAS

- `orchestration/directivas/simco/SIMCO-GIT.md` - Directiva principal git (v1.2.0)
- `orchestration/directivas/simco/SIMCO-MONOREPO.md` - Protocolo monorepo (gamilit standalone, no usa submodulos)
- `orchestration/directivas/simco/SIMCO-GIT-REMOTES.md` - Configuracion de remotes
- `orchestration/trazas/TRAZA-GIT-OPERATIONS.md` - Registro de operaciones
- `orchestration/directivas/triggers/TRIGGER-COMMIT-PUSH-OBLIGATORIO.md` - Trigger complementario

---

**Sistema:** SIMCO v4.0.0
**Mantenido por:** Workspace Admin
