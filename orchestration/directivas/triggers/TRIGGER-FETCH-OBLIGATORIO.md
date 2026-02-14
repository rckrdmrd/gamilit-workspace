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
5. Se cambia de contexto entre proyectos/submodulos

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
║      git pull --no-recurse-submodules                                    ║
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
    git pull --no-recurse-submodules
fi

# PASO 4: Ahora verificar estado local
git status
```

---

## PARA WORKSPACE CON SUBMODULOS

En workspace-v2 con multiples niveles de submodulos:

```bash
# NIVEL 0: Workspace principal
cd /home/isem/workspace-v2
git fetch origin
git log HEAD..origin/master --oneline
# Si hay output: git pull --no-recurse-submodules
git status

# NIVEL 1: Proyectos (si vas a trabajar en uno)
cd projects/{proyecto}
git fetch origin
git log HEAD..origin/master --oneline
# Si hay output: git pull --no-recurse-submodules
git status

# NIVEL 2: Subrepositorios (si vas a trabajar en uno)
cd {componente}  # backend, database, frontend
git fetch origin
git log HEAD..origin/master --oneline
# Si hay output: git pull --no-recurse-submodules
git status
```

---

## ERRORES A EVITAR

| Error | Consecuencia | Prevencion |
|-------|--------------|------------|
| Solo hacer git status | No detectar commits remotos | SIEMPRE fetch primero |
| Reportar "clean" sin fetch | Usuario confundido | Seguir secuencia completa |
| Asumir que no hay cambios | Desincronizacion | Verificar con log HEAD..origin |
| Olvidar en submodulos | Referencias inconsistentes | Fetch en cada nivel |

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
- Actualizado SIMCO-SUBMODULOS.md v1.1.0 con secuencia obligatoria
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
  sincronizar_si_necesario: "git pull --no-recurse-submodules"
  luego: "Continuar con la tarea"
```

---

## REFERENCIAS

- `orchestration/directivas/simco/SIMCO-GIT.md` - Directiva principal git (v1.2.0)
- `orchestration/directivas/simco/SIMCO-SUBMODULOS.md` - Protocolo submodulos (v1.1.0)
- `orchestration/SUBMODULES-POLICY.yml` - Politicas de sincronizacion (v1.1.0)
- `orchestration/trazas/TRAZA-GIT-OPERATIONS.md` - Registro de operaciones
- `orchestration/directivas/triggers/TRIGGER-COMMIT-PUSH-OBLIGATORIO.md` - Trigger complementario

---

**Sistema:** SIMCO v4.0.0
**Mantenido por:** Workspace Admin
