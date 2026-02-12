# SIMCO: GIT-WORKFLOW (Estrategia de Ramas y PRs)

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Aplica a:** TODO agente que trabaja con código
**Complementa:** SIMCO-GIT.md, SIMCO-GIT-REMOTES.md
**Prioridad:** OBLIGATORIA

---

## RESUMEN EJECUTIVO

> **Principio Fundamental: "Mínimas ramas, máximos commits"**
>
> - Commits frecuentes (cada 30-45 min) SIEMPRE
> - Ramas SOLO cuando realmente necesario
> - PRs SOLO para cambios que requieren review
> - Trabajo directo en main para la mayoría de tareas

---

## PRINCIPIOS FUNDAMENTALES

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   La meta es: HISTORIAL LIMPIO + MÍNIMA COMPLEJIDAD                  ║
║                                                                       ║
║   - Commits frecuentes = menos pérdida de trabajo                    ║
║   - Pocas ramas = menos conflictos                                   ║
║   - PRs selectivos = reviews donde importan                          ║
║   - Sincronización constante = detección temprana de problemas       ║
║                                                                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## ESTRATEGIA DE RAMAS

### Caso Default: Trabajo Directo en Main

```yaml
TRABAJO_DIRECTO_MAIN:
  descripción: "Caso por defecto para la mayoría del trabajo"

  cuándo_aplica:
    - Tareas de un solo agente
    - Fixes menores y medianos
    - Documentación
    - Cambios de configuración
    - Refactors pequeños
    - Features que toman < 1 día
    - Propagación de documentación

  flujo:
    1: "git pull origin main"
    2: "Hacer cambios"
    3: "npm run build && npm run lint"
    4: "git add . && git commit -m '[TAREA-ID] tipo: descripción'"
    5: "git push origin main"

  frecuencia_commits: "Cada cambio lógico completo, máximo 45 min"

  ventajas:
    - Sin overhead de gestión de ramas
    - Sin merges complicados
    - Historial lineal y limpio
    - Detección temprana de conflictos
```

### Caso Especial: Crear Rama

```yaml
CREAR_RAMA:
  descripción: "Solo cuando hay razón específica"

  cuándo_aplica:
    - Feature que toma más de 1 día
    - Trabajo de múltiples agentes simultáneos en mismo código
    - Cambios que requieren code review formal
    - Cambios de arquitectura o breaking changes
    - Trabajo experimental o de investigación
    - Cambios en shared/catalog (siempre review)

  nomenclatura:
    formato: "{tipo}/{TAREA-ID}-{descripcion-corta}"
    tipos:
      feature: "Nueva funcionalidad"
      bugfix: "Corrección de bug"
      hotfix: "Fix urgente de producción"
      refactor: "Refactorización"
      experiment: "Trabajo experimental"
    ejemplos:
      - "feature/DB-042-crear-tabla-projects"
      - "bugfix/BE-015-fix-validacion"
      - "hotfix/SEC-001-fix-xss"
      - "refactor/FE-020-optimizar-componentes"

  flujo:
    1: "git checkout main && git pull origin main"
    2: "git checkout -b {tipo}/{TAREA-ID}-{descripcion}"
    3: "Hacer cambios con commits frecuentes"
    4: "git push -u origin {rama}"
    5: "Crear PR cuando esté listo"

  vida_máxima: "1 semana (excepto releases)"
```

### Matriz de Decisión

```
¿Necesito crear una rama?
│
├─ ¿Es un security fix o hotfix urgente?
│   └─ SÍ ──> Crear rama: hotfix/{TAREA-ID}-descripcion
│
├─ ¿Trabajo de múltiples agentes en mismo código?
│   └─ SÍ ──> Crear rama: feature/{TAREA-ID}-descripcion
│
├─ ¿Cambio de arquitectura o breaking change?
│   └─ SÍ ──> Crear rama + PR obligatorio
│
├─ ¿Feature que toma más de 1 día?
│   └─ SÍ ──> Crear rama: feature/{TAREA-ID}-descripcion
│
├─ ¿Cambio en shared/catalog?
│   └─ SÍ ──> Crear rama + PR obligatorio
│
└─ Cualquier otro caso
    └─ NO ──> Trabajo directo en main
```

---

## POLÍTICA DE PULL REQUESTS

### Cuándo Crear PR

```yaml
PR_OBLIGATORIO:
  - Cambios de seguridad (SIEMPRE review)
  - Cambios de arquitectura
  - Nuevas dependencias externas
  - Cambios en shared/catalog
  - Propagaciones de código a múltiples proyectos
  - Breaking changes

PR_RECOMENDADO:
  - Features grandes (>5 archivos)
  - Trabajo de múltiples agentes
  - Cambios en directivas SIMCO
  - Refactors mayores

PR_OPCIONAL:
  - Refactors medianos
  - Nuevas features en proyecto individual

SIN_PR:
  - Fixes menores
  - Documentación interna
  - Configuración de desarrollo
  - Trabajo individual en proyecto propio
  - Cambios que no requieren review
```

### Merge Strategy

```yaml
ESTRATEGIAS:
  default:
    nombre: "Squash and merge"
    cuándo: "La mayoría de PRs"
    razón: "Historial limpio con un commit por feature"

  feature_grande:
    nombre: "Merge commit"
    cuándo: "Features con historia relevante"
    razón: "Preservar historia de desarrollo"

  hotfix:
    nombre: "Rebase"
    cuándo: "Fixes urgentes"
    razón: "Aplicar directamente sin merge commit"
```

### Template de PR

```markdown
## [{TAREA-ID}] Título descriptivo

### Resumen
{Descripción breve del cambio - 2-3 oraciones}

### Cambios Principales
- {Cambio 1}
- {Cambio 2}
- {Cambio 3}

### Testing
- [ ] Build pasa (`npm run build`)
- [ ] Lint pasa (`npm run lint`)
- [ ] Tests pasan (`npm run test`)

### Checklist
- [ ] No hay secretos expuestos
- [ ] Documentación actualizada si necesario
- [ ] No hay cambios breaking sin documentar
- [ ] Inventarios actualizados si aplica

### Proyectos Afectados
{Lista de proyectos si es propagación}
```

---

## SINCRONIZACIÓN CON REMOTOS

### Frecuencia Obligatoria

```yaml
SINCRONIZACIÓN:
  inicio_sesión:
    obligatorio: true
    comando: "scripts/workspace/sync-all-remotes.sh"
    timeout: "5 minutos"

  durante_trabajo:
    frecuencia: "Cada 2 horas"
    comando: "git fetch origin && git pull origin main --rebase"

  antes_de_push:
    obligatorio: true
    comando: "git pull origin main --rebase"
```

### Proceso de Sincronización

```yaml
PROCESO:
  1_fetch:
    comando: "git fetch --all"
    propósito: "Obtener cambios remotos sin aplicar"

  2_pull:
    comando: "git pull origin main --rebase"
    propósito: "Aplicar cambios remotos"

  3_conflictos:
    si_hay:
      acción: "DETENER y resolver antes de continuar"
      proceso: "Ver sección Gestión de Conflictos"
    si_no:
      acción: "Continuar trabajo normal"

  4_push:
    comando: "git push origin {rama}"
    propósito: "Subir cambios locales"
```

### Script de Sincronización

```bash
# Ejecutar al inicio de sesión
./scripts/workspace/sync-all-remotes.sh

# Output esperado:
# [INFO] Sincronizando 17 proyectos...
# [OK] workspace-v2: sincronizado
# [OK] erp-core: sincronizado
# [WARN] gamilit: 2 commits por delante del remoto
# ...
# [INFO] Completado: 17/17 proyectos sincronizados
```

---

## LIMPIEZA DE RAMAS

### Política de Limpieza

```yaml
RAMAS_LOCALES:
  cuándo_eliminar: "Inmediatamente después de merge"
  comando: "git branch -d {rama}"
  verificar: "Que el merge esté completo"

RAMAS_REMOTAS:
  cuándo_eliminar: "Si merged y > 7 días de antigüedad"
  comando: "git push origin --delete {rama}"
  excluir:
    - main
    - develop (si existe)
    - release/* (mantener última)

AUTOMATIZACIÓN:
  frecuencia: "Semanal"
  script: "scripts/workspace/cleanup-branches.sh"
  reporta: "Lista de ramas eliminadas"
```

### Script de Limpieza

```bash
# Ejecutar semanalmente
./scripts/workspace/cleanup-branches.sh

# Output esperado:
# [INFO] Analizando ramas...
# [INFO] Ramas locales merged: 3
# [INFO] Ramas remotas obsoletas: 2
# [OK] Eliminada local: feature/DB-042-crear-tabla
# [OK] Eliminada remota: bugfix/BE-015-fix-validacion
# [INFO] Limpieza completada: 5 ramas eliminadas
```

---

## GESTIÓN DE CONFLICTOS

### Prevención

```yaml
PREVENCIÓN:
  - Pull frecuente (inicio sesión + cada 2h)
  - Commits pequeños y atómicos
  - Comunicación cuando múltiples agentes trabajan en mismo código
  - Evitar ediciones simultáneas del mismo archivo
```

### Proceso de Resolución

```yaml
RESOLUCIÓN:
  1_detectar:
    comando: "git status"
    buscar: "Archivos en conflicto (both modified)"

  2_analizar:
    comando: "git diff"
    propósito: "Entender ambas versiones del cambio"

  3_resolver:
    método: "Editar archivos manualmente"
    buscar: "<<<<<<< HEAD, =======, >>>>>>>"
    decidir: "Qué código mantener"

  4_marcar_resuelto:
    comando: "git add {archivos}"

  5_continuar:
    si_rebase: "git rebase --continue"
    si_merge: "git merge --continue"

  6_validar:
    comandos:
      - "npm run build"
      - "npm run lint"
    propósito: "Asegurar que el código funciona"

  7_commit:
    si_merge: "git commit"
    si_rebase: "Automático"
```

### Escalación

```yaml
ESCALAR_A_TECH_LEADER:
  - Conflictos en archivos críticos (auth, security)
  - Conflictos que afectan arquitectura
  - No está claro cuál versión mantener
  - Conflictos recurrentes en misma área
```

---

## FLUJO COMPLETO DE TRABAJO

```
┌─────────────────────────────────────────────────────────────────────┐
│                     INICIO DE SESIÓN                                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  sync-all-remotes.sh          │
              │  (sincronizar todos los repos)│
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  ¿Hay conflictos?             │
              └───────────────────────────────┘
                    │               │
                   SÍ              NO
                    │               │
                    ▼               ▼
         ┌──────────────┐  ┌───────────────────┐
         │ Resolver     │  │ Continuar trabajo │
         │ conflictos   │  │                   │
         └──────────────┘  └───────────────────┘
                    │               │
                    └───────┬───────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DURANTE EL TRABAJO                               │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  ¿Necesito crear rama?        │
              │  (ver Matriz de Decisión)     │
              └───────────────────────────────┘
                    │               │
                   SÍ              NO
                    │               │
                    ▼               ▼
         ┌──────────────┐  ┌───────────────────┐
         │ git checkout │  │ Trabajo directo   │
         │ -b {rama}    │  │ en main           │
         └──────────────┘  └───────────────────┘
                    │               │
                    └───────┬───────┘
                            ▼
              ┌───────────────────────────────┐
              │  Hacer cambios                │
              │  (máximo 45 min sin commit)   │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  npm run build && npm run lint│
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  git add . && git commit      │
              │  -m "[TAREA-ID] tipo: desc"   │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  git push origin {rama}       │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  ¿Más cambios?                │
              └───────────────────────────────┘
                    │               │
                   SÍ              NO
                    │               │
                    ▼               ▼
              (volver a           ┌───────────────────┐
               "Hacer cambios")   │ ¿Era rama?        │
                                  └───────────────────┘
                                        │       │
                                       SÍ      NO
                                        │       │
                                        ▼       ▼
                               ┌──────────────┐ (fin)
                               │ Crear PR si  │
                               │ necesario    │
                               └──────────────┘
                                        │
                                        ▼
                               ┌──────────────┐
                               │ Merge + Delete│
                               │ rama         │
                               └──────────────┘
```

---

## ERRORES COMUNES

| Error | Consecuencia | Solución |
|-------|--------------|----------|
| No sincronizar al inicio | Conflictos tarde | Ejecutar sync-all-remotes.sh |
| Crear rama innecesaria | Complejidad extra | Usar Matriz de Decisión |
| No commitear frecuentemente | Pérdida de trabajo | Commit cada 30-45 min |
| Ramas sin limpiar | Acumulación | cleanup-branches.sh semanal |
| Push sin pull | Conflictos en remoto | Siempre pull antes de push |
| PR sin necesidad | Overhead de review | Solo cuando aplica |

---

## CHECKLIST DIARIO

```yaml
INICIO_SESIÓN:
  - [ ] Ejecutar sync-all-remotes.sh
  - [ ] Verificar que no hay conflictos
  - [ ] Revisar estado de PRs pendientes

DURANTE_TRABAJO:
  - [ ] Commit cada 30-45 minutos
  - [ ] Pull cada 2 horas
  - [ ] Evaluar necesidad de rama antes de crear

FIN_SESIÓN:
  - [ ] Push de todos los cambios
  - [ ] Verificar que builds pasan
  - [ ] Actualizar PRs si hay
```

---

## REFERENCIAS

- **Commits y formato:** @SIMCO/SIMCO-GIT.md
- **Operaciones remotas:** @SIMCO/SIMCO-GIT-REMOTES.md
- **Perfil responsable:** @PERFIL/PERFIL-WORKSPACE-ORCHESTRATOR.md
- **Script de sync:** scripts/workspace/sync-all-remotes.sh
- **Script de limpieza:** scripts/workspace/cleanup-branches.sh

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Workspace-Orchestrator
