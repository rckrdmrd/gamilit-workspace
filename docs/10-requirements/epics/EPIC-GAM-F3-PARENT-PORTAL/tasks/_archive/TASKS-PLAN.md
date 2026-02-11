# Plan de Tareas -- EPIC-GAM-F3-PARENT-PORTAL
Estado: PLANIFICADO | US: 4 | SP Total: 20 | Impl: 35%

## Tareas Planificadas

| # | Tarea | Area | US Relacionadas | SP Est. | Prioridad |
|---|-------|------|-----------------|---------|-----------|
| 1 | Controllers CRUD parent_accounts + parent_student_links | Backend | US-PP-001 | 2 | P1 |
| 2 | Login padres con codigo de acceso + JWT sesion | Backend | US-PP-002 | 2 | P1 |
| 3 | ParentDashboard: lista hijos, progreso por hijo, actividad semanal | Frontend | US-PP-002 | 3 | P1 |
| 4 | ChildProgressCard + WeeklyActivityChart componentes | Frontend | US-PP-002 | 2 | P1 |
| 5 | Integracion notificaciones in-app para padres (bell icon, historial) | Fullstack | US-PP-003 | 2 | P2 |
| 6 | Preferencias notificacion: email/push toggles, frecuencia | Frontend | US-PP-003 | 1 | P2 |
| 7 | Reportes para padres: exportar progreso PDF, comparativo grupo | Fullstack | US-PP-004 | 2 | P3 |
| 8 | Responsive design completo (mobile-first portal padres) | Frontend | Todas | 1 | P1 |
| 9 | Tests: login flow, dashboard data, notificaciones, edge cases | Testing | Todas | 2 | P1 |

## Dependencias
- Requiere: EXT-003 (notificaciones), EAI-003 (gamificacion/logros), EAI-004 (analytics), entities existentes (35%)
- Bloquea: Modelo B2C (ventas directas a familias)
