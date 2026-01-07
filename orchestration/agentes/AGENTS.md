# Guia para Agentes de IA - GAMILIT

**Version:** 1.0
**Ultima actualizacion:** 2026-01-04
**Basado en:** Estandar-SCRUM.md (Principio SIMCO)

---

## 1. Estructura del Proyecto

### Ubicaciones Clave

| Tipo | Ubicacion |
|------|-----------|
| Documentacion general | `/docs/` |
| Planificacion | `/docs/planning/` |
| Epicas Fase 1 | `/docs/01-fase-alcance-inicial/` |
| Epicas Fase 2 | `/docs/02-fase-robustecimiento/` |
| Epicas Fase 3 | `/docs/03-fase-extensiones/` |
| Backlog | `/docs/04-fase-backlog/` |
| Transversal | `/docs/90-transversal/` |
| Tareas | `/docs/planning/tasks/` |
| Bugs | `/docs/planning/bugs/` |
| Tablero Kanban | `/docs/planning/Board.md` |
| Orquestacion | `/orchestration/` |
| Trazas | `/orchestration/trazas/` |

### Estructura de una Epica

```
docs/[FASE]/[EPIC-ID]/
├── _MAP.md              # Indice de la epica
├── README.md            # Descripcion de la epica
├── historias-usuario/   # User Stories (US-*.md)
├── requerimientos/      # Requerimientos Funcionales (RF-*.md)
├── especificaciones/    # Especificaciones Tecnicas (ET-*.md)
├── tareas/              # Tareas especificas de la epica
└── implementacion/      # Trazabilidad de implementacion
```

---

## 2. Prefijos de Nomenclatura

| Prefijo | Tipo | Ejemplo | Descripcion |
|---------|------|---------|-------------|
| EAI- | Epica Alcance Inicial | EAI-001-fundamentos | Epicas de fase 1 |
| EXT- | Epica Extension | EXT-002-admin-extendido | Epicas de fase 3 |
| EMR- | Epica Migracion | EMR-001-migracion-bd | Epicas de migracion |
| US- | Historia de Usuario | US-FUND-001 | User Stories |
| TASK- | Tarea | TASK-001 | Tareas ejecutables |
| BUG- | Bug | BUG-001 | Defectos/errores |
| RF- | Requerimiento Funcional | RF-AUTH-001 | Requerimientos |
| ET- | Especificacion Tecnica | ET-AUTH-001 | Especificaciones |
| ADR- | Decision Record | ADR-0001 | Decisiones arquitectonicas |

---

## 3. Como Trabajar con Tareas

### Tomar una Tarea

1. **Identificar tarea** en `/docs/planning/Board.md` (columna "Por Hacer")
2. **Leer archivo** `TASK-XXX.md` correspondiente
3. **Editar YAML front-matter**:
   ```yaml
   status: "In Progress"
   assignee: "@NombreAgente"
   started_date: "YYYY-MM-DD"
   ```
4. **Mover tarea** a columna "En Progreso" en Board.md
5. **Commit**: `git commit -m "Start TASK-XXX: [descripcion breve]"`

### Completar una Tarea

1. **Verificar** TODOS los criterios de aceptacion cumplidos
2. **Editar YAML front-matter**:
   ```yaml
   status: "Done"
   completed_date: "YYYY-MM-DD"
   actual_hours: X
   ```
3. **Agregar seccion** "## Notas de Implementacion" con detalles
4. **Mover tarea** a columna "Hecho" en Board.md
5. **Commit**: `git commit -m "Fixes TASK-XXX: [descripcion breve]"`

### Reportar Bloqueo

1. Cambiar `status: "Blocked"`
2. Agregar seccion "## Bloqueo" con:
   - Descripcion del bloqueo
   - Dependencias faltantes
   - Accion requerida
3. Notificar en Board.md

---

## 4. Como Trabajar con Bugs

### Reportar un Bug

1. **Crear archivo** `/docs/planning/bugs/BUG-XXX-descripcion.md`
2. **Usar plantilla YAML**:
   ```yaml
   ---
   id: "BUG-XXX"
   title: "Descripcion del bug"
   type: "Bug"
   status: "Open"
   severity: "P0|P1|P2|P3"
   priority: "Critica|Alta|Media|Baja"
   assignee: ""
   affected_module: "Backend|Frontend|Database"
   steps_to_reproduce:
     - "Paso 1"
     - "Paso 2"
   expected_behavior: "Lo que deberia pasar"
   actual_behavior: "Lo que pasa realmente"
   created_date: "YYYY-MM-DD"
   ---
   ```
3. **Incluir secciones**: Descripcion, Contexto, Impacto
4. **Agregar** a TRAZA-BUGS.md si es critico
5. **Commit**: `git commit -m "Report BUG-XXX: [descripcion]"`

### Resolver un Bug

1. Editar YAML: `status: "Done"`, agregar `resolved_date`
2. Documentar solucion en seccion "## Solucion Implementada"
3. Agregar referencia al commit: `fix_commit: "abc123"`
4. **Commit**: `git commit -m "Fix BUG-XXX: [descripcion]"`

---

## 5. Formato YAML Front-Matter

### Historia de Usuario (US)

```yaml
---
id: "US-FUND-001"
title: "Autenticacion basica con JWT"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent"
epic: "EAI-001"
story_points: 8
budget: "$2,900 MXN"
sprint: "Sprint-1"
labels: ["auth", "jwt", "seguridad"]
created_date: "2025-11-02"
updated_date: "2025-11-02"
---
```

### Tarea (TASK)

```yaml
---
id: "TASK-001"
title: "Implementar endpoint POST /auth/register"
type: "Task"
status: "Done"
priority: "P1"
assignee: "@Backend-Agent"
parent_us: "US-FUND-001"
epic: "EAI-001"
estimated_hours: 4
actual_hours: 4.5
created_date: "2025-11-02"
completed_date: "2025-11-02"
---
```

### Requerimiento Funcional (RF)

```yaml
---
id: "RF-AUTH-001"
title: "Sistema de Roles de Usuario"
type: "Requirement"
status: "Implementado"
priority: "Alta"
module: "Autenticacion"
epic: "EAI-001"
version: "1.0"
created_date: "2025-11-07"
updated_date: "2025-11-07"
---
```

### Especificacion Tecnica (ET)

```yaml
---
id: "ET-AUTH-001"
title: "RBAC Implementation"
type: "Specification"
status: "Implementado"
rf_parent: "RF-AUTH-001"
epic: "EAI-001"
version: "1.0"
created_date: "2025-11-07"
updated_date: "2025-11-07"
---
```

---

## 6. Convenciones de Commit

```
<tipo>(<scope>): <descripcion>

Tipos:
- feat: Nueva funcionalidad
- fix: Correccion de bug
- docs: Documentacion
- refactor: Refactoring
- test: Tests
- chore: Mantenimiento

Scopes comunes:
- auth, admin, teacher, student (modulos)
- database, backend, frontend (capas)
- US-XXX, TASK-XXX, BUG-XXX (referencias)

Ejemplos:
- feat(auth): Implement JWT authentication
- fix(BUG-001): Resolve login redirect issue
- docs(US-FUND-001): Add acceptance criteria
- Start TASK-XXX: Begin implementation
- Fixes TASK-XXX: Complete implementation
```

---

## 7. Estados Validos

### Para Tareas y User Stories

| Estado | Descripcion |
|--------|-------------|
| Backlog | En cola, no planificado |
| To Do | Planificado para sprint actual |
| In Progress | En desarrollo activo |
| Blocked | Bloqueado por dependencia |
| In Review | En revision/testing |
| Done | Completado y validado |

### Para Bugs

| Estado | Descripcion |
|--------|-------------|
| Open | Reportado, pendiente |
| In Progress | En investigacion/correccion |
| Fixed | Corregido, pendiente validacion |
| Done | Corregido y validado |
| Won't Fix | No se corregira (documentar razon) |

---

## 8. Archivos Importantes

| Archivo | Proposito |
|---------|-----------|
| `/docs/planning/Board.md` | Tablero Kanban actual |
| `/docs/planning/config.yml` | Configuracion del proyecto |
| `/docs/04-fase-backlog/README.md` | Backlog priorizado |
| `/orchestration/trazas/TRAZA-BUGS.md` | Registro centralizado de bugs |
| `/orchestration/trazas/TRAZA-TAREAS-*.md` | Trazas de tareas por area |
| `/docs/90-transversal/sprints/SPRINTS-DETALLADOS.md` | Planificacion de sprints |
| `/docs/PLAN-ESTANDARIZACION-SCRUM-REFINADO.md` | Plan de estandarizacion |

---

## 9. Validaciones Antes de Commit

- [ ] YAML front-matter valido (sin errores de sintaxis)
- [ ] Campo `id` presente y unico
- [ ] Campo `status` actualizado correctamente
- [ ] Board.md actualizado si cambio estado
- [ ] Referencias cruzadas verificadas
- [ ] Criterios de aceptacion actualizados (si aplica)
- [ ] _MAP.md actualizado si se agrego/elimino archivo

---

## 10. Flujo de Trabajo Recomendado

```
1. Consultar Board.md para ver tareas disponibles
2. Seleccionar tarea de "Por Hacer"
3. Leer archivo TASK-XXX.md completo
4. Verificar dependencias resueltas
5. Cambiar status a "In Progress"
6. Ejecutar trabajo
7. Documentar notas de implementacion
8. Verificar criterios de aceptacion
9. Cambiar status a "Done"
10. Actualizar Board.md
11. Commit con mensaje apropiado
```

---

## 11. Contacto y Soporte

Para dudas sobre el proceso:
- Revisar `/docs/PLAN-ESTANDARIZACION-SCRUM-REFINADO.md`
- Consultar `/orchestration/directivas/`
- Ver ejemplos en epicas completadas (EAI-001 a EAI-006)

---

**Creado:** 2026-01-04
**Mantenido por:** Architecture Team
**Version:** 1.0
