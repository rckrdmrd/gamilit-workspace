---
id: "US-PM-012"
title: "Centro de Notificaciones del Maestro"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 5
budget: "$2,000 MXN"
sprint: "Sprint-7"
labels: ["portal-maestros", "notifications", "real-time", "websocket", "teacher"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
related: ["EXT-003", "US-NOT-001a", "US-NOT-001b"]
---

# US-PM-012: Centro de Notificaciones del Maestro

**Epica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Fase 3 - Extensiones
**Story Points:** 5 SP
**Presupuesto:** $2,000 MXN
**Prioridad:** Alta
**Estado:** Done
**Relacionada:** EXT-003 (Sistema de Notificaciones)

---

## Descripcion

Como profesor, quiero tener un centro de notificaciones completo donde pueda ver, filtrar y gestionar todas mis notificaciones de la plataforma para estar al tanto de actividades importantes de mis estudiantes y del sistema.

**Contexto del Alcance:**

Esta pagina proporciona:
- Lista completa de notificaciones con paginacion
- Filtros por estado (todas/leidas/no leidas)
- Filtros por tipo de notificacion
- Marcar como leida (individual y masiva)
- Eliminar notificaciones
- Conexion en tiempo real via WebSocket
- Responsive design

---

## Criterios de Aceptacion

### CA-01: Lista de Notificaciones
- [x] Lista paginada de todas las notificaciones
- [x] Para cada notificacion mostrar:
  - Icono segun tipo
  - Titulo
  - Mensaje/descripcion
  - Timestamp relativo (Hace X min/horas/dias)
  - Badge de tipo
  - Indicador de no leida (punto naranja)
- [x] Animaciones al entrar y salir (Framer Motion)

### CA-02: Tipos de Notificaciones (Iconos y Labels)
- [x] `achievement_unlocked` - Trophy - "Logro Desbloqueado"
- [x] `rank_promoted` - TrendingUp - "Subida de Rango"
- [x] `assignment_submitted` - ClipboardCheck - "Tarea Entregada"
- [x] `assignment_graded` - CheckCheck - "Tarea Calificada"
- [x] `student_message` - MessageSquare - "Mensaje de Estudiante"
- [x] `class_update` - BookOpen - "Actualizacion de Clase"
- [x] `system_announcement` - Megaphone - "Anuncio del Sistema"
- [x] `alert` - AlertCircle - "Alerta"
- [x] `calendar_event` - Calendar - "Evento de Calendario"
- [x] `student_progress` - TrendingUp - "Progreso de Estudiante"
- [x] `new_student` - Users - "Nuevo Estudiante"

### CA-03: Filtros
- [x] Filtro por estado:
  - Todas
  - No leidas
  - Leidas
- [x] Filtro por tipo (dropdown dinamico con tipos disponibles)
- [x] Panel de filtros colapsable
- [x] Aplicacion de filtros en tiempo real

### CA-04: Acciones de Header
- [x] Boton de refresh con animacion de spin
- [x] Boton de toggle de filtros
- [x] Boton "Marcar todas como leidas" (visible si hay no leidas)
- [x] Link a configuracion de notificaciones (Settings)
- [x] Contador de no leidas en header

### CA-05: Acciones por Notificacion
- [x] Marcar como leida (solo si no leida)
- [x] Eliminar notificacion
- [x] Feedback visual al hover
- [x] Animaciones de salida al eliminar

### CA-06: Estados Especiales
- [x] Estado de carga con spinner
- [x] Estado de error con mensaje
- [x] Estado vacio cuando no hay notificaciones
- [x] Mensaje diferente si es por filtros aplicados

---

## Especificaciones Tecnicas

### Frontend

**Ruta:**
```
/teacher/notifications
```

**Pagina:**
- `TeacherNotificationsPage.tsx` - Componente completo

**Store Utilizado:**
```typescript
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore';

const {
  notifications,
  unreadCount,
  isLoading,
  error,
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = useNotificationsStore();
```

**Hooks Utilizados:**
```typescript
import { useAuth } from '@/app/providers/AuthContext';
import { useUserGamification } from '@shared/hooks/useUserGamification';
```

**State Local:**
```typescript
type StatusFilter = 'all' | 'unread' | 'read';

const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
const [typeFilter, setTypeFilter] = useState<string>('all');
const [isRefreshing, setIsRefreshing] = useState(false);
const [showFilters, setShowFilters] = useState(false);
```

**Filtrado de Notificaciones:**
```typescript
const filteredNotifications = useMemo(() => {
  return notifications.filter((notification) => {
    // Status filter
    if (statusFilter === 'unread' && notification.status !== 'unread') return false;
    if (statusFilter === 'read' && notification.status !== 'read') return false;
    // Type filter
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });
}, [notifications, statusFilter, typeFilter]);
```

### Backend

**Endpoints Utilizados:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/notifications` | Lista de notificaciones del usuario |
| GET | `/notifications/unread/count` | Contador de no leidas |
| PUT | `/notifications/:id/read` | Marcar como leida |
| PUT | `/notifications/read-all` | Marcar todas como leidas |
| DELETE | `/notifications/:id` | Eliminar notificacion |

**Interface de Notificacion:**
```typescript
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
  data?: Record<string, unknown>;
}
```

---

## Diseno UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  [Bell] Notificaciones                                            |
|  3 sin leer                    [Refresh] [Filtros] [Marcar todas] |
+-------------------------------------------------------------------+
|  FILTROS (colapsable)                                             |
|  Estado: [Todas] [No leidas] [Leidas]                            |
|  Tipo: [Todos los tipos v]                                        |
+-------------------------------------------------------------------+
|  +---------------------------------------------------------------+|
|  | [Trophy]  Logro Desbloqueado                        Hace 2h   ||
|  |           Juan Perez desbloqueo "Lector Experto"              ||
|  |           [Logro Desbloqueado] *                    [v] [X]   ||
|  +---------------------------------------------------------------+|
|  | [Clipboard]  Tarea Entregada                        Hace 5h   ||
|  |              Maria Lopez entrego "Comprension Lectora M2"     ||
|  |              [Tarea Entregada]                      [v] [X]   ||
|  +---------------------------------------------------------------+|
|  | [Megaphone]  Anuncio del Sistema                    Ayer      ||
|  |              Actualizacion de plataforma programada           ||
|  |              [Anuncio del Sistema]                       [X]   ||
|  +---------------------------------------------------------------+|
+-------------------------------------------------------------------+
```

### Estado Vacio
```
+-------------------------------------------------------------------+
|                                                                    |
|                         [Bell Icon]                               |
|                    Sin notificaciones                             |
|           No tienes notificaciones por el momento                 |
|                                                                    |
+-------------------------------------------------------------------+
```

---

## Dependencias

### Dependencias de User Stories:
- US-PM-000 (Dashboard Maestro) - Navegacion
- US-NOT-001a (Infraestructura WebSocket) - Tiempo real
- US-NOT-001b (Centro de Notificaciones) - Store compartido
- EP001 (Auth System) - JWT auth y role='teacher'

### Dependencias de Backend:
- Sistema de notificaciones (EXT-003)
- WebSocket para actualizaciones en tiempo real
- Persistencia de notificaciones en PostgreSQL

---

## Estimacion de Esfuerzo

**Backend:** 1 SP
- Endpoints ya implementados en EXT-003
- Filtros especificos para teacher

**Frontend:** 3 SP
- Lista con filtros y animaciones
- Integracion con store
- Responsive design

**Testing:** 1 SP

**Total:** 5 SP = $2,000 MXN

---

## Notas de Implementacion

- Pagina implementada: `/home/isem/v2-source/projects/gamilit/apps/frontend/src/apps/teacher/pages/TeacherNotificationsPage.tsx`
- Utiliza Zustand store compartido de notificaciones
- Animaciones con Framer Motion (AnimatePresence)
- Link a preferencias: `/teacher/settings/notifications`
- Timestamps con formateo relativo en espanol

---

**Ultima actualizacion:** 2026-01-20
**Version:** 1.0
**Estado:** Done - Implementado
