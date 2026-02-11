# Plan de Tareas -- EPIC-GAM-F3-PROFILES
Estado: PLANIFICADO | US: 6 | SP Total: 35

## Tareas Planificadas

| # | Tarea | Area | US Relacionadas | SP Est. | Prioridad |
|---|-------|------|-----------------|---------|-----------|
| 1 | DDL schema perfiles extendidos (avatar, bio, intereses, privacidad) | Database | US-PERF-001 | 2 | P1 |
| 2 | API endpoints perfil (GET/PUT profile, POST avatar, validate-username) | Backend | US-PERF-001 | 3 | P1 |
| 3 | Servicio upload/crop avatares con Sharp + galeria predefinida | Backend | US-PERF-001 | 2 | P1 |
| 4 | ProfilePage con tabs (avatar, bio, apariencia, privacidad, stats) | Frontend | US-PERF-001, US-PERF-005 | 3 | P1 |
| 5 | Endpoints seguridad cuenta (2FA, sesiones activas, audit log) | Backend | US-PERF-002 | 3 | P1 |
| 6 | UI seguridad: cambio password, 2FA setup, sesiones | Frontend | US-PERF-002 | 2 | P1 |
| 7 | Configuracion accesibilidad gamificacion (reducir animaciones, alto contraste) | Frontend | US-PERF-003 | 2 | P2 |
| 8 | API interacciones sociales (amigos, mensajes, bloqueo) | Backend | US-PERF-004 | 3 | P2 |
| 9 | UI social: lista amigos, solicitudes, chat basico | Frontend | US-PERF-004 | 3 | P2 |
| 10 | Dashboard personalizable con widgets drag-and-drop | Frontend | US-PERF-005 | 3 | P2 |
| 11 | API showcasing logros (pinned badges, colecciones, sharing OG images) | Backend | US-PERF-006 | 3 | P2 |
| 12 | UI galeria logros, timeline, comparacion amigos, export | Frontend | US-PERF-006 | 3 | P2 |
| 13 | Tests unitarios + integracion + accesibilidad WCAG 2.1 AA | Testing | Todas | 3 | P1 |

## Dependencias
- Requiere: EAI-001 (auth), EAI-003 (gamificacion), EAI-004 (analytics basico)
- Bloquea: EXT-007 (portal comunidad, usa perfiles sociales)
