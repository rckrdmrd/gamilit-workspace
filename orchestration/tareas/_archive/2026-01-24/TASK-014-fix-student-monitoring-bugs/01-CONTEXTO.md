# TASK-014: Contexto

## Fecha: 2026-01-25
## Agente: CLAUDE-CODE (claude-opus-4-5-20251101)

---

## Reporte del Usuario

El usuario reportó dos bugs en el portal de Teacher, específicamente en la página de monitoreo de estudiantes:

1. **Bug 1:** Los cards de usuarios muestran mal el dato de "última actividad"
2. **Bug 2:** Al dar clic en el usuario o card, la pantalla se pone en negro

## Área Afectada

- **Proyecto:** gamilit
- **Portal:** Teacher
- **Página:** Monitoreo de Estudiantes
- **Componentes:** StudentStatusCard, StudentDetailModal, StudentMonitoringPanel

## Archivos Involucrados

| Archivo | Rol |
|---------|-----|
| `apps/frontend/src/apps/teacher/types/index.ts` | Definición de tipos |
| `apps/frontend/src/apps/teacher/hooks/useStudentMonitoring.ts` | Hook de datos |
| `apps/frontend/src/apps/teacher/components/monitoring/StudentStatusCard.tsx` | Card individual |
| `apps/frontend/src/apps/teacher/components/monitoring/StudentDetailModal.tsx` | Modal de detalles |
| `apps/frontend/src/apps/teacher/components/monitoring/StudentMonitoringPanel.tsx` | Panel contenedor |

## Contexto Técnico

- El backend (`teacher-classrooms-crud.service.ts`) puede devolver `last_activity: null`
- El DTO del backend define `last_activity?: Date` (opcional)
- El frontend definía `last_activity: string` (no nullable)
- Esta discrepancia causaba errores cuando el valor era null

---

*Documentado según @SIMCO-TAREA y @UBICACION-DOC*
