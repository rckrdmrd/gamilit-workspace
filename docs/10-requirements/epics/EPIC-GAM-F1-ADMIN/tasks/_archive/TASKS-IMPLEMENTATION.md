# Tareas -- EPIC-GAM-F1-ADMIN

Estado: COMPLETADO | US: 7 | Tareas: 21 | Subtareas: 49

## Por US

### US-ADM-001: Gestion de Aulas (CRUD Basico) — 8 SP

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: CRUD endpoints + Classroom entity + DTOs + validaciones (limite 20 aulas) | Entity, Controller, Service, DTOs (Create/Update), TeacherGuard | 6h | 6h | Done |
| Frontend: Lista aulas (grid/cards) + formulario crear/editar + modal eliminar | ClassroomListView, ClassroomCard, ClassroomForm, rutas | 8h | 8h | Done |
| Testing: Unit (limite aulas, validaciones) + Integracion (ownership) + E2E | 3 unit, 5 integration, 5 E2E | 2h | 2h | Done |

### US-ADM-002: Gestion de Estudiantes en Aula — 10 SP

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: Endpoints estudiantes (listar, agregar, crear, remover, buscar) | 5 endpoints, DTOs, validaciones (limite 100), generacion credenciales | 8h | 8h | Done |
| Frontend: Lista estudiantes + modal agregar (buscar/crear) + credenciales display | StudentsView, AddStudentModal, SearchForm, CreateForm, CredentialsDisplay | 10h | 10h | Done |
| Testing: E2E (agregar existente, crear nuevo, remover, busqueda, limites) | 5 E2E tests | 2h | 2h | Done |

### US-ADM-003: Dashboard de Maestro — 8 SP

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: Endpoint /teacher/dashboard con summary, classrooms, activities, insights | Service getDashboard, aggregation queries, recent activities | 6h | 6h | Done |
| Frontend: Dashboard layout + SummaryCards + InsightsSection + ClassroomGrid + ActivityFeed | 5 componentes, ruta /teacher/dashboard | 8h | 8h | Done |
| Testing: Unit (aggregation) + E2E (dashboard carga correctamente) | 3 tests | 2h | 2h | Done |

### US-ADM-004: Asignacion Basica de Modulos — 10 SP

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: Catalogo modulos + asignar/remover modulo + stats por modulo | 5 endpoints, Module entity, validacion duplicados, getModuleStats | 8h | 8h | Done |
| Frontend: Vista modulos asignados + catalogo + filtros (materia/nivel) + ModuleCard | AssignedModulesView, ModuleCatalogView, FilterBar, ModuleCard | 10h | 10h | Done |
| Testing: Unit + Integracion (asignar, remover, stats) | 4 tests | 2h | 2h | Done |

### US-ADM-005: Gestion de Grupos Basica — 7 SP

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: CRUD grupos + asignar/remover estudiantes + Group entity | 6 endpoints, DTOs, validacion nombre unico, color random | 6h | 6h | Done |
| Frontend: GroupsView + GroupCard + modal crear/editar + asignar estudiantes | 4 componentes, ColorPicker, seleccion multiple | 6h | 6h | Done |
| Testing: Unit (nombre unico) + E2E (CRUD + asignacion) | 4 tests | 2h | 2h | Done |

### US-ADM-006: Configuracion Basica de Aula — 6 SP

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: ClassroomSettings entity + GET/PATCH settings + validacion fechas | Entity 1:1, DTO, service upsert, date validation | 4h | 4h | Done |
| Frontend: SettingsView con secciones (fechas, visibilidad, gamificacion) + toggles | ClassroomSettingsView, SettingsSection, Toggle, FormActions sticky | 6h | 6h | Done |
| Testing: Unit (fechas, upsert) + Integracion (toggles afectan UX) + E2E | 6 tests | 2h | 2h | Done |

### US-ADM-007: Vista de Actividad de Aula — 6 SP

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: Endpoint activity-summary (activos hoy, modulos progreso, recientes) | 3 queries (activeToday, modulesInProgress, recentActivities) | 4h | 4h | Done |
| Frontend: ActivityView + ActiveStudentsCard + ModulesInProgressCard + RecentActivitiesCard | 4 componentes, auto-refresh 2min, formatRelativeTime | 6h | 6h | Done |
| Testing: Unit (conteo, filtro fecha) + E2E (auto-refresh, datos) | 5 tests | 2h | 2h | Done |

## Resumen

| Area | Horas Est. | Horas Real |
|------|------------|------------|
| Backend | 42h | 42h |
| Frontend | 54h | 54h |
| Testing | 14h | 14h |
| **Total** | **110h** | **110h** |

**SP Total:** 55 SP | **Presupuesto:** $22,000 MXN
