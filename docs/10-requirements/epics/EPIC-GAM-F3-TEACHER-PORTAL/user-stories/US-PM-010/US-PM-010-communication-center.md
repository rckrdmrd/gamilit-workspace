---
id: "US-PM-010"
title: "Centro de Comunicacion para Maestros"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 10
budget: "$4,000 MXN"
sprint: "Sprint-7"
labels: ["portal-maestros", "communication", "messaging", "announcements", "feedback", "teacher"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# US-PM-010: Centro de Comunicacion para Maestros

**Epica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Fase 3 - Extensiones
**Story Points:** 10 SP
**Presupuesto:** $4,000 MXN
**Prioridad:** Alta
**Estado:** Done

---

## Descripcion

Como profesor, quiero tener un centro completo de comunicacion donde pueda gestionar mensajes, conversaciones, anuncios a clases y feedback privado a estudiantes para mantener una comunicacion efectiva con mi comunidad educativa.

**Contexto del Alcance:**

Esta pagina proporciona a los profesores un portal completo de comunicacion con:
- Bandeja de entrada de mensajes
- Conversaciones agrupadas por usuario
- Sistema de anuncios a clases completas
- Feedback privado a estudiantes individuales
- Filtros y busqueda avanzada
- Paginacion para manejar grandes volumenes

---

## Criterios de Aceptacion

### CA-01: Bandeja de Entrada
- [x] Lista de mensajes recibidos con paginacion
- [x] Para cada mensaje mostrar:
  - Remitente
  - Asunto
  - Preview del contenido
  - Timestamp
  - Estado leido/no leido
- [x] Contador de mensajes no leidos en header
- [x] Marcar como leido al abrir mensaje

### CA-02: Filtros de Mensajes
- [x] Filtro por estado (todos/leidos/no leidos)
- [x] Filtro por tipo de mensaje
- [x] Busqueda por texto (asunto, contenido, remitente)
- [x] Ordenamiento por fecha
- [x] Boton de refresh para actualizar

### CA-03: Vista de Conversaciones
- [x] Agrupar mensajes por usuario (conversaciones)
- [x] Mostrar nombre del otro participante
- [x] Contador de mensajes en cada conversacion
- [x] Ultimo mensaje como preview
- [x] Click para filtrar bandeja por ese usuario

### CA-04: Sistema de Anuncios a Clases
- [x] Selector de classroom destino
- [x] Campo de asunto obligatorio
- [x] Campo de contenido (mensaje del anuncio)
- [x] Envio a todos los estudiantes de la clase seleccionada
- [x] Confirmacion de envio exitoso

### CA-05: Sistema de Feedback Privado
- [x] Selector de classroom para filtrar estudiantes
- [x] Selector de estudiante individual
- [x] Campo de contenido del feedback
- [x] Envio privado solo al estudiante seleccionado
- [x] Confirmacion de envio exitoso

### CA-06: Composicion de Mensajes
- [x] Boton "Nuevo Mensaje" en header
- [x] Formulario de composicion con campos:
  - Destinatario(s)
  - Asunto
  - Contenido
- [x] Cancelar vuelve a lista sin enviar

### CA-07: Detalle de Mensaje
- [x] Modal con contenido completo del mensaje
- [x] Mostrar remitente y fecha/hora
- [x] Lista de destinatarios si aplica
- [x] Nombre de clase relacionada si aplica
- [x] Cerrar modal para volver a lista

### CA-08: Paginacion
- [x] Mostrar rango actual (ej: "1-20 de 150")
- [x] Botones Anterior/Siguiente
- [x] Deshabilitados en limites

---

## Especificaciones Tecnicas

### Frontend

**Ruta:**
```
/teacher/communication
```

**Pagina:**
- `TeacherCommunicationPage.tsx` - Componente principal con tabs

**Componentes Utilizados:**
```typescript
import { MessagesList } from '../components/communication/MessagesList';
import { MessageComposer } from '../components/communication/MessageComposer';
import { ConversationsList } from '../components/communication/ConversationsList';
import { AnnouncementForm } from '../components/communication/AnnouncementForm';
import { FeedbackForm } from '../components/communication/FeedbackForm';
import { MessageFilters } from '../components/communication/MessageFilters';
```

**Hooks Utilizados:**
```typescript
import { useTeacherMessages } from '../hooks/useTeacherMessages';
import { useClassrooms } from '../hooks/useClassrooms';
```

**Interface del Hook de Mensajes:**
```typescript
const {
  messages,
  conversations,
  total,
  unreadCount,
  loading,
  error,
  filters,
  pagination,
  sendMessage,
  sendAnnouncement,
  sendFeedback,
  markAsRead,
  updateFilters,
  nextPage,
  prevPage,
  refresh,
} = useTeacherMessages();
```

**Tabs Disponibles:**
```typescript
type ActiveTab = 'inbox' | 'conversations' | 'announcements' | 'feedback';

const TABS: Tab[] = [
  { id: 'inbox', label: 'Bandeja de Entrada' },
  { id: 'conversations', label: 'Conversaciones' },
  { id: 'announcements', label: 'Anuncios a Clases' },
  { id: 'feedback', label: 'Feedback a Estudiantes' },
];
```

### Backend

**Endpoints Utilizados:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/teacher/messages` | Lista de mensajes con filtros y paginacion |
| GET | `/teacher/messages/conversations` | Lista de conversaciones agrupadas |
| GET | `/teacher/messages/unread/count` | Contador de no leidos |
| POST | `/teacher/messages` | Enviar mensaje nuevo |
| POST | `/teacher/messages/announcement` | Enviar anuncio a clase |
| POST | `/teacher/messages/feedback` | Enviar feedback a estudiante |
| PUT | `/teacher/messages/:id/read` | Marcar como leido |
| GET | `/teacher/classrooms/:id/students` | Obtener estudiantes de una clase |

**Interface de Mensaje:**
```typescript
interface Message {
  id: string;
  subject: string;
  content: string;
  sender_name: string;
  sender_id: string;
  is_read: boolean;
  created_at: string;
  classroom_name?: string;
  recipients: Array<{
    user_id: string;
    user_name: string;
    is_read: boolean;
  }>;
}
```

---

## Diseno UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  Comunicacion                      [3 no leidos]  [Nuevo Mensaje] |
+-------------------------------------------------------------------+
|  [Bandeja de Entrada] [Conversaciones] [Anuncios] [Feedback]     |
+-------------------------------------------------------------------+
|  BANDEJA DE ENTRADA                                               |
|  [Filtros: Estado v] [Tipo v] [Buscar...]              [Refresh] |
+-------------------------------------------------------------------+
|  * Juan Perez - Pregunta sobre tarea                   Hace 2h   |
|    Hola profesor, tengo una duda sobre...                        |
|  ----------------------------------------------------------------|
|    Maria Lopez - Entrega completada                    Hace 5h   |
|    Le informo que ya entregue la tarea de...                     |
|  ----------------------------------------------------------------|
|  Mostrando 1 - 20 de 150            [Anterior] [Siguiente]       |
+-------------------------------------------------------------------+
```

### Tab de Anuncios
```
+-------------------------------------------------------------------+
|  ANUNCIOS A CLASES                                                |
+-------------------------------------------------------------------+
|  Clase destino:  [Matematicas 6A v]                              |
|                                                                    |
|  Asunto:         [____________________________]                   |
|                                                                    |
|  Contenido:                                                       |
|  +---------------------------------------------------------------+|
|  |                                                               ||
|  |                                                               ||
|  +---------------------------------------------------------------+|
|                                                                    |
|                                              [Enviar Anuncio]     |
+-------------------------------------------------------------------+
```

---

## Dependencias

### Dependencias de User Stories:
- US-PM-000 (Dashboard Maestro) - Navegacion
- US-PM-001a (CRUD Classrooms) - Selector de clases
- EP001 (Auth System) - JWT auth y role='teacher'

### Dependencias de Backend:
- Sistema de mensajeria implementado
- Relacion profesor-aulas
- Relacion aulas-estudiantes

---

## Estimacion de Esfuerzo

**Backend:** 4 SP
- Endpoints de mensajeria
- Sistema de anuncios masivos
- Sistema de feedback individual
- Filtros y paginacion

**Frontend:** 5 SP
- Sistema de tabs con 4 vistas
- Componentes de comunicacion
- Integracion con hooks
- Modal de detalle de mensaje

**Testing:** 1 SP

**Total:** 10 SP = $4,000 MXN

---

## Notas de Implementacion

- Pagina implementada: `apps/frontend/src/apps/teacher/pages/TeacherCommunicationPage.tsx`
- Feature flag `FEATURE_FLAGS.SHOW_UNDER_CONSTRUCTION` para modo construccion
- Componentes de comunicacion en `../components/communication/`
- API service en `@/services/api/teacher/teacherMessagesApi`

---

**Ultima actualizacion:** 2026-01-20
**Version:** 1.0
**Estado:** Done - Implementado
