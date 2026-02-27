# Portal Estudiante — Indice

> Documentacion del portal de estudiante de GAMILIT. Cubre arquitectura de componentes, especificaciones por dominio funcional, contratos API y trazas de correccion.

## Archivos

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `PORTAL-STUDENT-GUIDE.md` | Guia principal — arquitectura, componentes, flujos de 30 mecanicas de ejercicio | Actualizado 2026-02-27 |

## Subdirectorios

### `specs/` — Especificaciones del Portal Estudiante

Contiene las especificaciones tecnicas detalladas por dominio funcional, mas subdirectorios de soporte.

#### Documentos en `specs/`

| Archivo | Descripcion |
|---------|-------------|
| `README.md` | Resumen del portal y objetivos pedagogicos |
| `SPEC-DASHBOARD.md` | Dashboard estudiante — DashboardComplete, StatsGrid, ModulesSection, 4 APIs |
| `SPEC-EXERCISES.md` | Ejercicios — auto-save, power-ups, submit; 8+ mecanicas interactivas |
| `SPEC-GAMIFICATION.md` | Gamificacion — Rangos Maya, ML Coins, Misiones, Tienda, Leaderboard |
| `SPEC-ACHIEVEMENTS.md` | Logros — 9 categorias, 4 raridades, AchievementToast |
| `SPEC-PROFILE.md` | Perfil — ProfilePage, Settings, 2FA, dispositivos |
| `SPEC-SOCIAL.md` | Social — amigos, guilds, notificaciones WebSocket |
| `SPEC-PROGRESS.md` | Progreso — streaks, estadisticas de modulos, actividad reciente |
| `SPEC-MODULES.md` | Modulos educativos — prerequisitos, estados, recompensas |
| `SPEC-MULTIMEDIA.md` | Multimedia — avatars, iconos, animaciones, accesibilidad |
| `SPEC-PDF-EXCEL.md` | Exportaciones — capacidades actuales y planificacion futura |
| `SPEC-API-CONTRACTS.md` | Contratos API — 80+ endpoints, tipos, codigos de error |
| `ASSIGNMENTS-SPEC.md` | Asignaciones — flujo de tareas asignadas por maestro |
| `AUTH-PAGES-SPEC.md` | Autenticacion — login, registro, recuperacion, verificacion (4 paginas) |
| `STUDENT-HOOKS-SPEC.md` | Hooks y stores Zustand del portal estudiante |

#### Subdirectorios de `specs/`

| Directorio | Contenido | Archivos destacados |
|------------|-----------|---------------------|
| `analysis/` | Analisis de cobertura e implementacion | `_MAP.md` |
| `dependencies/` | Matrices de dependencias entre componentes y APIs | `DEPENDENCY-MATRIX.md`, `_MAP.md` |
| `inventory/` | Inventario de implementaciones por fecha | `IMPLEMENTATIONS-2025-11-24.md`, `_MAP.md` |
| `traces/` | Trazas de ejecucion y correcciones aplicadas | `TRACE-DASHBOARD-ERRORS-FIX-2026-01-04.md`, `TRACE-EXERCISE-BUTTONS-FIX-2025-11-29.md`, `TRACE-P0-CORRECTIONS.md`, `_MAP.md` |
| `_archived/gaps/` | Gaps historicos resueltos (GAP-001, 002, 006, 007, 008) | 5 archivos STUDENT-GAP-*.md |

## Referencias Cruzadas

- Backend module: `apps/backend/src/modules/educational/` + `apps/backend/src/modules/gamification/`
- Frontend pages: `apps/frontend/src/apps/student/`
- API docs global: `docs/40-api/API-REFERENCE.md`
- Mecanicas de ejercicio: `docs/80-references/transversal/mecanicas/`
- Inventarios SSOT: `orchestration/inventarios/FRONTEND_INVENTORY.yml` + `orchestration/inventarios/BACKEND_INVENTORY.yml`
- ADR relevantes: `docs/90-adr/ADR-004-MODULAR-EXERCISE-ENGINE.md`, `docs/90-adr/ADR-013-react-query.md`

## Estado del Portal

- Completitud: ~100%
- Paginas implementadas: 72 total del sistema (portal estudiante es el mas extenso)
- Mecanicas de ejercicio: 30 mecanicas frontend implementadas
- Gaps historicos: 5 resueltos (GAP-001 a 008, excl. secuencia)
