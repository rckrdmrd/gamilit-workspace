# SIMCO: GIT (Control de Versiones)

**Version:** 1.2.0
**Fecha:** 2026-01-16
**Aplica a:** TODO agente que modifica codigo o documentacion
**Prioridad:** OBLIGATORIA

---

## RESUMEN EJECUTIVO

> **Todo cambio en codigo o documentacion DEBE versionarse correctamente.**
> **Commits frecuentes, atomicos y descriptivos.**
> **PUSH OBLIGATORIO al finalizar cada tarea.**
> **FETCH OBLIGATORIO antes de verificar estado.**
> **Nunca perder trabajo por falta de commits o push.**

---

## REGLA CRITICA 1: FETCH ANTES DE OPERAR

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ANTES DE CUALQUIER VERIFICACION DE ESTADO GIT:                         ║
║                                                                           ║
║   1. git fetch origin                                                     ║
║      → Obtener estado actual del remoto                                  ║
║                                                                           ║
║   2. git log HEAD..origin/master --oneline                                 ║
║      → Si hay output = hay commits remotos que no tienes                 ║
║                                                                           ║
║   3. Si hay commits remotos:                                             ║
║      git pull origin master                                              ║
║      → Sincronizar antes de continuar                                    ║
║                                                                           ║
║   4. AHORA SI: git status                                                 ║
║      → Verificar estado local                                            ║
║                                                                           ║
║   SIN FETCH = ESTADO INCOMPLETO                                          ║
║   (Otro agente pudo hacer cambios en otra sesion)                        ║
║                                                                           ║
║   Referencia: INC-2026-01-16-001                                         ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Secuencia Obligatoria de Verificacion

```bash
# SIEMPRE ejecutar en este orden:
git fetch origin
git log HEAD..origin/master --oneline  # Si hay output, hacer pull
git pull origin master               # Solo si paso anterior tiene output
git status                            # Ahora si verificar estado local
```

---

## REGLA CRITICA 2: COMMIT + PUSH OBLIGATORIO

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   TODA TAREA QUE CREA O MODIFICA ARCHIVOS DEBE TERMINAR CON:             ║
║                                                                           ║
║   1. git add .                                                            ║
║   2. git commit -m "[ID] tipo: descripcion"                              ║
║   3. git push origin {rama}                                               ║
║                                                                           ║
║   SIN PUSH = TAREA INCOMPLETA                                            ║
║                                                                           ║
║   En este monorepo STANDALONE:                                           ║
║   - Commitear y push en la rama activa del repo actual                   ║
║   - NO usar flujo de submodules                                          ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Checklist Fin de Tarea (OBLIGATORIO)

```yaml
ANTES_de_reportar_tarea_completada:
  - [ ] Todos los archivos creados/modificados estan guardados
  - [ ] git status muestra archivos a commitear
  - [ ] git add {archivos}
  - [ ] git commit -m "[TAREA-ID] tipo: descripcion"
  - [ ] git push origin {rama}
  - [ ] Verificar: git status muestra "nothing to commit, working tree clean"
  - [ ] Verificar: git log origin/master..HEAD muestra vacio (todo pusheado)

SI_hay_dudas_de_estructura:
  - [ ] Confirmar que este repo es monorepo standalone (sin submodules)
```

### Secuencia para Monorepo Standalone

```bash
# 1. Commitear cambios de la tarea
git add .
git commit -m "[TAREA-ID] tipo: descripcion"

# 2. Push a remoto de la rama actual
git push origin {rama}

# 3. Verificar todo sincronizado
git status  # Debe mostrar "clean"
```

---

## PRINCIPIOS FUNDAMENTALES

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   "Commitear temprano, commitear frecuentemente"                     ║
║                                                                       ║
║   Cada commit debe:                                                   ║
║   - Representar un cambio logico completo                            ║
║   - Ser funcional (no romper compilacion)                            ║
║   - Ser reversible sin afectar otros cambios                         ║
║   - Tener mensaje descriptivo con ID de tarea                        ║
║                                                                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## FRECUENCIA DE COMMITS

```yaml
OBLIGATORIO_commitear:
  - Al finalizar cada fase (Analisis, Planeacion, Ejecucion)
  - Al completar cada archivo significativo
  - Cada 30-45 minutos de trabajo continuo
  - Antes de lanzar subagentes
  - Despues de validar trabajo de subagentes
  - Antes de cambiar de tarea
  - Cuando build + lint pasan

RAZON: "Minimizar perdida de trabajo en caso de error"
```

---

## FORMATO DE MENSAJE DE COMMIT

### Estructura Obligatoria

```
[{TAREA-ID}] {tipo}: {descripcion concisa}

{cuerpo opcional - descripcion detallada}

{footer opcional - referencias, breaking changes}
```

### Ejemplos Correctos

```bash
# Feature nueva
[DB-042] feat: Crear tabla projects con soporte PostGIS

# Bug fix
[BE-015] fix: Corregir validacion de codigo unico en ProjectService

# Refactor
[FE-008] refactor: Extraer componente ProjectCard de ProjectList

# Documentacion
[DB-042] docs: Actualizar DATABASE_INVENTORY con tabla projects

# Tests
[BE-015] test: Agregar tests unitarios para ProjectService

# Subtarea
[DB-042-SUB-001] feat: Implementar indices para tabla projects
```

### Ejemplos Incorrectos

```bash
# Sin ID de tarea
fix: Corregir bug

# Muy vago
[BE-015] update: Cambios varios

# Demasiado largo en primera linea
[DB-042] feat: Crear tabla projects con todas las columnas necesarias incluyendo soporte para PostGIS y configuracion de indices compuestos para optimizar queries

# Sin tipo
[FE-008] Mejorar componente
```

---

## TIPOS DE COMMITS

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `feat` | Nueva funcionalidad | `[DB-042] feat: Agregar soporte PostGIS` |
| `fix` | Correccion de bug | `[BE-015] fix: Resolver error en constraint` |
| `refactor` | Refactorizacion sin cambio funcional | `[FE-008] refactor: Mejorar estructura componentes` |
| `docs` | Solo documentacion | `[DB-042] docs: Actualizar README con schema` |
| `test` | Agregar/modificar tests | `[BE-015] test: Agregar tests para ProjectService` |
| `chore` | Tareas de mantenimiento | `[DB-042] chore: Actualizar dependencias` |
| `style` | Formato/estilo (sin cambio logico) | `[FE-008] style: Aplicar prettier` |
| `perf` | Mejora de performance | `[DB-042] perf: Agregar indice compuesto` |
| `build` | Cambios en build/deps | `[BE-015] build: Actualizar TypeORM a v0.3` |
| `ci` | Cambios en CI/CD | `[INFRA-001] ci: Agregar workflow de tests` |

---

## COMMITS ATOMICOS

### Que es un Commit Atomico

```yaml
atomico:
  - Representa UN cambio logico completo
  - Es funcional (build pasa)
  - Es reversible individualmente
  - No mezcla cambios no relacionados

NO_atomico:
  - Multiples cambios no relacionados
  - Trabajo incompleto (excepto WIP explicito)
  - Mezcla de fix y feat
  - Cambios en multiples features
```

### Ejemplo de Atomicidad

```bash
# CORRECTO - Commits atomicos separados
[DB-042] feat: Crear tabla projects
[DB-042] feat: Agregar indices a tabla projects
[DB-042] feat: Crear seeds para projects
[DB-042] docs: Actualizar inventario con tabla projects

# INCORRECTO - Un commit masivo
[DB-042] feat: Crear tabla projects con indices, seeds y actualizacion de inventario
```

---

## FLUJO DE TRABAJO GIT

### Antes de Empezar Tarea

```bash
# 1. Asegurar rama actualizada
git fetch origin
git pull origin master

# 2. Crear rama de trabajo (si aplica)
git checkout -b feature/{TAREA-ID}-descripcion-corta

# 3. Verificar estado limpio
git status
```

### Durante la Tarea

```bash
# 1. Hacer cambios
# ... editar archivos ...

# 2. Verificar que build pasa
npm run build
npm run lint

# 3. Agregar cambios
git add {archivos especificos}
# o para todos los cambios relacionados:
git add .

# 4. Commit con mensaje descriptivo
git commit -m "[TAREA-ID] tipo: descripcion"

# 5. Repetir para cada cambio logico
```

### Al Completar Tarea

```bash
# 1. Verificar historial
git log --oneline -5

# 2. Push a remoto
git push origin {rama}

# 3. Crear PR si aplica
gh pr create --title "[TAREA-ID] Descripcion" --body "..."
```

---

## CHECKLIST PRE-COMMIT

```yaml
ANTES_de_cada_commit:
  - [ ] Build pasa sin errores
  - [ ] Lint pasa sin errores criticos
  - [ ] Tests pasan (si existen)
  - [ ] Cambios son logicamente completos
  - [ ] No hay archivos no deseados (node_modules, .env, etc.)
  - [ ] Mensaje sigue formato correcto

VERIFICAR:
  git status                 # Ver archivos modificados
  git diff                   # Ver cambios en detalle
  git diff --cached          # Ver cambios staged
```

---

## ERRORES COMUNES

| Error | Consecuencia | Solucion |
|-------|--------------|----------|
| No commitear frecuentemente | Perdida de trabajo | Commit cada 30-45 min |
| Commits masivos | Dificil revertir | Commits atomicos |
| Mensajes vagos | Historial incomprensible | Seguir formato |
| Commit con build roto | Bloquea CI/CD | Verificar antes de commit |
| Olvidar ID de tarea | Perdida de trazabilidad | Siempre incluir [TAREA-ID] |
| Commitear secretos | Brecha de seguridad | Verificar .gitignore |

---

## ARCHIVOS A IGNORAR (.gitignore)

```yaml
SIEMPRE_ignorar:
  - node_modules/
  - .env
  - .env.*
  - dist/
  - build/
  - coverage/
  - *.log
  - .DS_Store
  - *.tmp
  - *.cache

NUNCA_commitear:
  - Credenciales
  - API keys
  - Passwords
  - Certificados privados
  - Archivos de configuracion local
```

---

## RAMAS (BRANCHING)

### Convencion de Nombres

```yaml
ramas:
  feature: feature/{TAREA-ID}-descripcion-corta
  bugfix: bugfix/{TAREA-ID}-descripcion-corta
  hotfix: hotfix/{TAREA-ID}-descripcion-corta
  release: release/v{X.Y.Z}

ejemplos:
  - feature/DB-042-crear-tabla-projects
  - bugfix/BE-015-fix-validacion
  - hotfix/SEC-001-fix-xss
  - release/v2.1.0
```

### Flujo de Ramas

```
main (produccion)
 │
 ├─── develop (desarrollo)
 │     │
 │     ├─── feature/DB-042-*
 │     │     └── merge a develop
 │     │
 │     ├─── feature/BE-015-*
 │     │     └── merge a develop
 │     │
 │     └── release/v2.1.0
 │           └── merge a main + tag
 │
 └─── hotfix/SEC-001-*
       └── merge a main + develop
```

---

## REVERTIR CAMBIOS

### Revertir Ultimo Commit (no pusheado)

```bash
# Mantener cambios en working directory
git reset --soft HEAD~1

# Descartar cambios completamente
git reset --hard HEAD~1
```

### Revertir Commit ya Pusheado

```bash
# Crear commit de reversion (seguro)
git revert {commit-hash}
git push
```

### Deshacer Cambios en Archivo

```bash
# Descartar cambios no staged
git checkout -- {archivo}

# Descartar cambios staged
git reset HEAD {archivo}
git checkout -- {archivo}
```

---

## SITUACIONES ESPECIALES

### Work in Progress (WIP)

```bash
# Cuando necesitas commitear trabajo incompleto
git commit -m "[TAREA-ID] WIP: descripcion de estado actual"

# Luego, completar y hacer commit final
# (opcional: squash commits WIP antes de PR)
```

### Antes de Lanzar Subagente

```bash
# SIEMPRE commitear antes de delegar
git add .
git commit -m "[TAREA-ID] chore: Estado antes de delegacion a {SubAgente}"
```

### Despues de Validar Subagente

```bash
# Commitear resultado de subagente
git add .
git commit -m "[TAREA-ID-SUB-XXX] tipo: Resultado de {SubAgente}"
```

---

## VALIDACION DE COMMITS

### Verificar Historial

```bash
# Ver ultimos commits
git log --oneline -10

# Ver commits de tarea especifica
git log --oneline --grep="DB-042"

# Ver cambios de un commit
git show {commit-hash}
```

### Verificar Formato de Mensaje

```yaml
formato_valido:
  - Tiene [TAREA-ID] al inicio
  - Tiene tipo valido (feat, fix, etc.)
  - Descripcion concisa (<72 caracteres primera linea)
  - No tiene errores de ortografia graves

verificar_manualmente:
  git log --oneline -1
  # Debe mostrar: {hash} [TAREA-ID] tipo: descripcion
```

---

## REFERENCIAS

- **Principio de Validacion:** @PRINCIPIOS/PRINCIPIO-VALIDACION-OBLIGATORIA.md
- **Documentar:** @SIMCO/SIMCO-DOCUMENTAR.md
- **Crear:** @SIMCO/SIMCO-CREAR.md

---

**Version:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
