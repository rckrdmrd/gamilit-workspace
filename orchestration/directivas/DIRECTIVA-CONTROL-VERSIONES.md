# DIRECTIVA: CONTROL DE VERSIONES Y ESTRATEGIA DE COMMITS

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Versión:** 1.0.0
**Fecha:** 2025-11-20
**Ámbito:** Todos los agentes (Database-Agent, Backend-Agent, Frontend-Agent) y subagentes
**Tipo:** Directiva Obligatoria

---

## 🎯 PROPÓSITO

Establecer una estrategia clara de control de versiones que permita:
- **Rollback rápido** ante errores o implementaciones incorrectas
- **Trazabilidad completa** de cada cambio con su tarea asociada
- **Historial limpio** y comprensible
- **Integración continua** sin conflictos

---

## 📋 PRINCIPIOS FUNDAMENTALES

### 1. Commits Frecuentes

```yaml
Regla: "Commitear temprano, commitear frecuentemente"

Frecuencia mínima:
  - ✅ Al finalizar cada fase (Análisis, Planeación, Ejecución)
  - ✅ Al completar cada archivo significativo
  - ✅ Cada 30-45 minutos de trabajo continuo
  - ✅ Antes de lanzar subagentes
  - ✅ Después de validar trabajo de subagentes
  - ✅ Antes de cambiar de tarea

Razón: Minimizar pérdida de trabajo en caso de error
```

### 2. Commits Atómicos

```yaml
Cada commit debe:
  - Representar un cambio lógico completo
  - Ser funcional (no romper compilación)
  - Ser reversible sin afectar otros cambios

❌ NO hacer:
  - Commits masivos con múltiples cambios no relacionados
  - Commits de trabajo incompleto (excepto WIP explícito)
  - Commits sin mensaje descriptivo
```

### 3. Mensajes de Commit Descriptivos

```yaml
Formato obligatorio:
  "[{TAREA-ID}] {tipo}: {descripción concisa}"

Ejemplos:
  ✅ "[DB-042] feat: Crear tabla projects con PostGIS"
  ✅ "[BE-015] fix: Corregir validación de código único"
  ✅ "[FE-008] refactor: Extraer componente ProjectCard"
  ✅ "[DB-042-SUB-001] docs: Actualizar inventario con tabla projects"
```

---

## 🏷️ TIPOS DE COMMITS

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `feat` | Nueva funcionalidad | `[DB-042] feat: Agregar soporte PostGIS` |
| `fix` | Corrección de bug | `[BE-015] fix: Resolver error en constraint` |
| `refactor` | Refactorización sin cambio funcional | `[FE-008] refactor: Mejorar estructura componentes` |
| `docs` | Solo documentación | `[DB-042] docs: Actualizar README con schema` |
| `test` | Agregar/modificar tests | `[BE-015] test: Agregar tests para ProjectService` |
| `chore` | Tareas de mantenimiento | `[DB-042] chore: Actualizar dependencias` |
| `style` | Formato/estilo (sin cambio lógico) | `[FE-008] style: Aplicar prettier` |
| `perf` | Mejora de performance | `[DB-042] perf: Agregar índice compuesto` |
| `build` | Cambios en build/deps | `[BE-015] build: Actualizar TypeORM` |
| `ci` | Cambios en CI/CD | `[ALL] ci: Agregar workflow validación` |
| `revert` | Revertir commit previo | `[DB-042] revert: Revertir migración projects` |
| `wip` | Work In Progress (temporal) | `[FE-008] wip: Progreso en formulario` |

---

## 📝 ESTRUCTURA DE MENSAJE DE COMMIT

### Formato Completo

```
[{TAREA-ID}] {tipo}: {descripción corta}

{descripción detallada opcional}

- Detalle 1
- Detalle 2

Relacionado: {otras tareas si aplica}
Validado: {Si | No}
Subagente: {ID si aplica}
```

### Ejemplos Completos

**Ejemplo 1: Commit de Database-Agent**
```
[DB-042] feat: Crear tabla projects con jerarquía y PostGIS

- Implementa columnas base según especificación
- Agrega soporte GEOGRAPHY para coordinates
- Implementa jerarquía con parent_project_id
- Crea índices: code (unique), name, status, coordinates (GIST)
- Agrega constraints: FK a users, CHECK para status
- Incluye comentarios SQL descriptivos

Relacionado: REQ-001-Gestión-Proyectos
Validado: Sí (compilación + insert test exitoso)
```

**Ejemplo 2: Commit de Subagente**
```
[DB-042-SUB-001] feat: Crear tabla developments

Implementación completa según contexto proporcionado.

- Tabla: project_management.developments
- FK a projects (ON DELETE CASCADE)
- Índices: code, project_id, name
- Validación: psql exitoso

Relacionado: [DB-042]
Validado: Sí
Subagente: general-purpose-001
```

**Ejemplo 3: Commit de Documentación**
```
[DB-042] docs: Actualizar inventarios y trazas

- MASTER_INVENTORY.yml: Agregar schema project_management
- DATABASE_INVENTORY.yml: Agregar tabla projects
- TRAZA-TAREAS-DATABASE.md: Registrar DB-042 completado

Validado: N/A (solo docs)
```

---

## 🔄 WORKFLOW DE COMMITS POR FASE

### Fase 1: Análisis

```bash
# Al iniciar análisis
git commit -m "[DB-042] docs: Crear 01-ANALISIS.md con contexto inicial"

# Después de análisis completo
git commit -m "[DB-042] docs: Completar análisis de módulo Proyectos

- Identificados: 4 tablas, 2 schemas
- Dependencias: auth_management.users
- Referencias: MVP-APP.md sección 4.1
- Riesgos identificados: Performance PostGIS

Validado: Sí (revisión completa)"
```

### Fase 2: Planeación

```bash
# Al crear plan inicial
git commit -m "[DB-042] docs: Crear 02-PLAN.md con ciclos y tareas"

# Al ajustar plan después de análisis más profundo
git commit -m "[DB-042] docs: Refinar plan con 3 ciclos y 8 subtareas

- Ciclo 1: Schema + tabla projects (2h)
- Ciclo 2: Tablas developments, phases, units (3h)
- Ciclo 3: Validación + documentación (1h)

Relacionado: Feedback de análisis PostGIS"
```

### Fase 3: Ejecución

```bash
# Cada archivo DDL creado
git commit -m "[DB-042] feat: Crear schema project_management

Validado: Sí (psql exitoso)"

git commit -m "[DB-042] feat: Crear tabla projects con PostGIS

- 20 columnas implementadas
- 5 índices (incluyendo GIST para coordinates)
- 3 constraints (2 FK, 1 CHECK)

Validado: Sí (insert test exitoso)"

# Al finalizar trabajo de subagente
git commit -m "[DB-042-SUB-001] feat: Crear tabla developments (por subagente)

Completado por subagente general-purpose-001
Ver: orchestration/agentes/database/DB-042/03-SUBAGENTES/REPORTE-SUB-001.md

Validado: Sí (validación técnica aprobada)"
```

### Fase 4: Validación

```bash
# Después de validación técnica
git commit -m "[DB-042] test: Ejecutar suite de validación completa

- Compilación: ✅ Exitosa
- Estructura: ✅ 4 tablas, 18 índices
- Performance: ✅ Inserts < 50ms
- Constraints: ✅ Todos funcionan

Validado: Sí"
```

### Fase 5: Documentación

```bash
# Al actualizar inventarios
git commit -m "[DB-042] docs: Actualizar inventarios y trazas post-ejecución

- MASTER_INVENTORY.yml: +1 schema, +4 tablas
- DATABASE_INVENTORY.yml: Detalle de 20 columnas
- TRAZA-TAREAS-DATABASE.md: Registro completo DB-042

Validado: N/A"
```

---

## 🚫 COMMITS PROHIBIDOS

```yaml
❌ Prohibido:
  - Commits sin mensaje: git commit -m ""
  - Mensajes genéricos: "fix", "update", "changes"
  - Commits sin ID de tarea: "Agregar tabla projects"
  - Commits masivos no relacionados (>10 archivos de módulos distintos)
  - Commits de archivos temporales (.tmp, .log, node_modules)
  - Commits de credenciales o secrets
  - Commits que rompan compilación (excepto WIP explícito)
  - Commits de archivos fuera de orchestration/ sin justificación
```

---

## 🔀 ESTRATEGIA DE BRANCHING

### Branch Principal

```yaml
main (o master):
  - Código estable y validado
  - Solo merge después de validación completa
  - Protected branch (requiere PR)
```

### Branches de Trabajo

```yaml
Nomenclatura:
  feature/{TAREA-ID}-{nombre-corto}
  fix/{TAREA-ID}-{nombre-corto}
  refactor/{TAREA-ID}-{nombre-corto}

Ejemplos:
  ✅ feature/DB-042-modulo-proyectos
  ✅ fix/BE-015-validacion-codigo
  ✅ refactor/FE-008-componentes-proyecto

Reglas:
  - Crear branch desde main actualizado
  - Un branch por tarea principal
  - Eliminar después de merge
  - Rebase antes de merge (historial limpio)
```

### Ejemplo de Workflow Completo

```bash
# 1. Crear branch para tarea
git checkout main
git pull origin main
git checkout -b feature/DB-042-modulo-proyectos

# 2. Commits frecuentes durante desarrollo
git add orchestration/agentes/database/DB-042/01-ANALISIS.md
git commit -m "[DB-042] docs: Completar análisis módulo Proyectos"

git add apps/database/ddl/schemas/project_management/
git commit -m "[DB-042] feat: Crear schema project_management"

git add apps/database/ddl/schemas/project_management/tables/01-projects.sql
git commit -m "[DB-042] feat: Crear tabla projects con PostGIS"

# 3. Push frecuente a remote
git push origin feature/DB-042-modulo-proyectos

# 4. Actualizar desde main si es necesario
git fetch origin main
git rebase origin/main

# 5. Después de validación completa, crear PR
# (via GitHub/GitLab interface o gh CLI)
gh pr create --title "[DB-042] Implementar módulo de Proyectos" \
  --body "Ver: orchestration/agentes/database/DB-042/05-DOCUMENTACION.md"

# 6. Después de merge, eliminar branch local
git checkout main
git pull origin main
git branch -d feature/DB-042-modulo-proyectos
```

---

## ⚡ SITUACIONES ESPECIALES

### WIP (Work In Progress)

```bash
# Cuando necesitas commitear trabajo incompleto
git add .
git commit -m "[DB-042] wip: Progreso en tabla projects (50%)

⚠️ NO FUNCIONAL - Falta:
- Índices pendientes
- Constraints sin implementar
- Sin validación"

# Cuando completes, squash los commits WIP antes de merge
git rebase -i HEAD~3  # Squash últimos 3 commits WIP
```

### Rollback Urgente

```bash
# Ver historial reciente
git log --oneline -10

# Revertir último commit (crea nuevo commit de reversión)
git revert HEAD
git commit -m "[DB-042] revert: Revertir tabla projects - error en constraint

Razón: CHECK constraint impide inserts válidos
Acción: Rediseñar constraint y resubmitir"

# Rollback hard (⚠️ destructivo, solo si no pusheaste)
git reset --hard HEAD~1
```

### Hotfix Urgente

```bash
# Branch desde main
git checkout main
git checkout -b hotfix/FIX-001-error-critico

# Commits normales
git commit -m "[FIX-001] fix: Corregir error en query projects"

# Merge directo a main (después de validación)
git checkout main
git merge hotfix/FIX-001-error-critico
git push origin main
```

---

## 📊 VALIDACIÓN DE COMMITS

### Pre-Commit Checklist

Antes de cada commit, verifica:

```markdown
- [ ] ¿El código compila sin errores?
- [ ] ¿El mensaje incluye [TAREA-ID]?
- [ ] ¿El tipo de commit es correcto?
- [ ] ¿La descripción es clara y concisa?
- [ ] ¿No incluye archivos temporales o sensibles?
- [ ] ¿No incluye cambios no relacionados?
- [ ] ¿Se puede revertir sin afectar otros cambios?
```

### Post-Commit Checklist

```markdown
- [ ] ¿El commit aparece en git log correctamente?
- [ ] ¿Se pusheó a remote? (push frecuente recomendado)
- [ ] ¿Se documentó en traza si es significativo?
```

---

## 🎓 EJEMPLOS POR AGENTE

### Database-Agent

```bash
# Análisis
git commit -m "[DB-042] docs: Analizar módulo Proyectos - 4 tablas identificadas"

# DDL Schema
git commit -m "[DB-042] feat: Crear schema project_management"

# DDL Tabla
git commit -m "[DB-042] feat: Crear tabla projects con PostGIS y jerarquía"

# Validación
git commit -m "[DB-042] test: Validar estructura y constraints tabla projects"

# Documentación
git commit -m "[DB-042] docs: Actualizar inventario database con módulo Proyectos"
```

### Backend-Agent

```bash
# Entity
git commit -m "[BE-015] feat: Crear ProjectEntity con decoradores TypeORM"

# Service
git commit -m "[BE-015] feat: Implementar ProjectService con CRUD completo"

# Controller
git commit -m "[BE-015] feat: Crear ProjectController con endpoints REST"

# DTOs
git commit -m "[BE-015] feat: Agregar DTOs de validación para Project"

# Tests
git commit -m "[BE-015] test: Agregar suite de tests unitarios ProjectService"
```

### Frontend-Agent

```bash
# Página
git commit -m "[FE-008] feat: Crear ProjectsPage con listado y filtros"

# Componente
git commit -m "[FE-008] feat: Crear ProjectCard component reutilizable"

# Store
git commit -m "[FE-008] feat: Implementar ProjectStore con Zustand"

# Service
git commit -m "[FE-008] feat: Agregar ProjectService para llamadas API"

# Estilos
git commit -m "[FE-008] style: Aplicar estilos responsive a ProjectsPage"
```

---

## 🔍 AUDITORIA Y TRAZABILIDAD

### Consultar Historial de una Tarea

```bash
# Ver todos los commits de una tarea
git log --all --grep="DB-042" --oneline

# Ver detalles completos
git log --all --grep="DB-042"

# Ver archivos modificados
git log --all --grep="DB-042" --name-only

# Ver diferencias
git log --all --grep="DB-042" -p
```

### Generar Reporte de Commits

```bash
# Commits del último día
git log --since="1 day ago" --pretty=format:"%h - %s (%an, %ar)"

# Commits por agente (usando grep en mensaje)
git log --all --grep="DB-" --oneline > reporte-database-agent.txt
git log --all --grep="BE-" --oneline > reporte-backend-agent.txt
git log --all --grep="FE-" --oneline > reporte-frontend-agent.txt

# Estadísticas
git shortlog -sn --all --since="1 week ago"
```

---

## 📚 REFERENCIAS

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)
- DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md
- ESTANDARES-NOMENCLATURA.md

---

## ✅ CHECKLIST PARA AGENTES

**Antes de cada commit:**
- [ ] Código funcional (compila/ejecuta)
- [ ] Mensaje con formato correcto: `[TAREA-ID] tipo: descripción`
- [ ] Sin archivos temporales o sensibles
- [ ] Cambios relacionados y atómicos

**Cada 30-45 minutos:**
- [ ] Commit de progreso
- [ ] Push a remote

**Al finalizar cada fase:**
- [ ] Commit de finalización de fase
- [ ] Push a remote
- [ ] Actualizar traza si es significativo

**Al finalizar tarea:**
- [ ] Todos los archivos commiteados
- [ ] Inventarios actualizados y commiteados
- [ ] Documentación commiteada
- [ ] PR creado (si aplica)

---

**Versión:** 1.0.0
**Fecha:** 2025-11-20
**Próxima revisión:** Al identificar necesidad de mejoras
**Responsable:** Todos los agentes
