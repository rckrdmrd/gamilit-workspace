# Plan de Tareas -- EPIC-GAM-F3-PARENT-NOTIFICATIONS
Estado: PLANIFICADO | US: 3 | SP Total: 15 | Impl: 35%

## Tareas Planificadas

| # | Tarea | Area | US Relacionadas | SP Est. | Prioridad |
|---|-------|------|-----------------|---------|-----------|
| 1 | Cron job reporte semanal: agregar datos progreso por estudiante | Backend | US-PARENT-001 | 2 | P1 |
| 2 | Email template HTML responsive: progreso, achievements, grafica semanal | Frontend | US-PARENT-001 | 2 | P1 |
| 3 | Integracion SendGrid/Nodemailer + tracking open/click | Backend | US-PARENT-001 | 1 | P1 |
| 4 | Trigger alerta bajo rendimiento: score <60% o inactividad >7 dias | Backend | US-PARENT-002 | 2 | P1 |
| 5 | Email template alerta: indicadores riesgo + sugerencias para padres | Frontend | US-PARENT-002 | 1 | P1 |
| 6 | Notificacion achievement desbloqueado: email celebratorio al padre | Backend | US-PARENT-003 | 1 | P2 |
| 7 | Template achievement: imagen logro, descripcion, felicitaciones | Frontend | US-PARENT-003 | 1 | P2 |
| 8 | Preferencias notificacion padre: opt-in/out por tipo, unsubscribe link | Fullstack | Todas | 1 | P1 |
| 9 | Tests: envio emails, templates rendering, tracking, edge cases | Testing | Todas | 1 | P1 |

## Dependencias
- Requiere: Email service (SendGrid) configurado, progress tracking funcional, achievement system
- Bloquea: EXT-011 (parent portal consume estas notificaciones)
