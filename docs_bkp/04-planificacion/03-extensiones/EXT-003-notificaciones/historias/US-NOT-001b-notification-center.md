# US-NOT-001b: Centro de Notificaciones In-App

**Épica:** EXT-003 - Sistema de Notificaciones
**Sprint:** Mes 3, Semana 2-3
**Story Points:** 5 SP
**Presupuesto:** $6,580 MXN
**Prioridad:** Alta (Extensión Fase 3)
**Estado:** 📋 Planificada
**Relación:** Parte de US-NOT-001 (dividida en a/b/c por PF-001)

---

## Descripción

**Como** estudiante de Gamilit
**Quiero** acceder a un centro de notificaciones donde pueda ver todas mis notificaciones, filtrarlas, marcarlas como leídas y tomar acciones
**Para** estar informado de todas las actividades importantes y gestionar notificaciones de manera eficiente

**Contexto:** Esta user story es parte del sistema completo de notificaciones (EXT-003), dividida para cumplir con PF-001. Esta parte implementa la **interfaz de usuario** del centro de notificaciones, consumiendo la infraestructura WebSocket de US-NOT-001a.

**Alcance:**
- UI del centro de notificaciones (dropdown/modal)
- Lista de notificaciones con scroll infinito
- Badge contador de notificaciones no leídas
- Filtros por tipo (Todas, Amigos, Gremios, Misiones, Logros)
- Marcar como leído (individual y batch)
- Eliminar notificaciones
- Toast notifications in-app
- Navegación a destino al hacer click

---

## Valor de Negocio

- **Click-Through Rate**: >40% usuarios hacen click en notificaciones
- **Interaction Rate**: +45% tasa de respuesta a solicitudes sociales
- **Session Initiation**: 38% de sesiones iniciadas por notificación
- **User Satisfaction**: >4.3/5 rating en centro de notificaciones
- Reduce "notification fatigue" con filtros y priorización

---

## Criterios de Aceptación

### CA-01: Tipos de Notificaciones Soportadas
**Dado** que ocurren eventos en la plataforma
**Cuando** el sistema detecta actividad relevante
**Entonces** debe generar notificaciones para estos tipos:

**1. Achievements (Logros)** - Icono: 🏆
- `achievement:unlocked` - Nuevo logro desbloqueado
- `achievement:milestone` - Hito de logros alcanzado
- Payload: `{ achievementId, name, rarity, rewards, icon }`

**2. Friends (Amigos)** - Icono: 👤
- `friend:request` - Nueva solicitud de amistad
- `friend:accepted` - Solicitud aceptada
- `friend:online` - Amigo se conectó
- `friend:activity` - Amigo completó algo importante
- Payload: `{ friendId, friendName, avatar, action }`

**3. Guilds (Gremios)** - Icono: 🛡️
- `guild:invitation` - Invitación a gremio
- `guild:accepted` - Aceptado en gremio
- `guild:challenge:new` - Nuevo desafío de gremio
- `guild:challenge:complete` - Desafío completado
- `guild:leaderboard` - Gremio subió en ranking
- `guild:member:joined` - Nuevo miembro se unió
- Payload: `{ guildId, guildName, icon, message, data }`

**4. Missions (Misiones)** - Icono: 🎯
- `mission:completed` - Misión completada
- `mission:renewed` - Nuevas misiones disponibles
- `mission:expiring` - Misión expira pronto (24h)
- `mission:streak:milestone` - Hito de streak alcanzado
- Payload: `{ missionId, type, progress, rewards }`

**5. System (Sistema)** - Icono: 📢
- `system:announcement` - Anuncio importante
- `system:maintenance` - Mantenimiento programado
- `system:event:new` - Nuevo evento especial
- Payload: `{ title, message, priority, actionUrl }`

**6. Gamification** - Icono: ⭐
- `xp:level_up` - Subió de nivel K'in
- `cacao:milestone` - Alcanzó hito de Cacao
- Payload: `{ oldLevel, newLevel, rewards }`

### CA-02: Centro de Notificaciones (UI)
**Dado** que un usuario accede al centro de notificaciones
**Cuando** hace click en el icono de campana (🔔) en navbar
**Entonces** debe ver:

**UI del Centro (Dropdown)**:
- Lista de notificaciones (últimas 50 cargadas inicialmente)
- Ordenamiento cronológico (más recientes primero)
- Badge con contador de no leídas (número rojo en icono)
- Indicador visual de leído/no leído:
  - **No leído**: Fondo azul claro, punto azul a la izquierda
  - **Leído**: Fondo blanco, sin punto
- Filtros por tipo: Todas, Amigos, Gremios, Misiones, Logros
- Botón "Marcar todas como leídas" (header)
- Botón "Borrar todas leídas" (footer)
- Acción directa al hacer click (navegar a destino)
- Scroll infinito para cargar más notificaciones
- Timestamps relativos: "hace 2 min", "hace 1h", "ayer", "hace 3 días"

**Interacciones**:
- Click en notificación → Marcar como leída + navegar a destino
- Click en "X" (individual) → Eliminar notificación
- Click fuera del dropdown → Cerrar centro
- Scroll al final → Cargar 50 notificaciones más

**Validación**:
- Centro muestra últimas 50 notificaciones al abrir
- Badge actualiza número al marcar como leído
- Filtro "Amigos" muestra solo notificaciones de amigos
- Scroll infinito carga más notificaciones correctamente

### CA-03: Notificaciones Toast (In-app Real-time)
**Dado** que un usuario está activo en la plataforma
**Cuando** llega una notificación en tiempo real (vía WebSocket)
**Entonces** debe mostrarse toast notification:

**Características del Toast**:
- **Posición**:
  - Desktop: Esquina superior derecha (fixed position)
  - Mobile: Superior centro (full width)
- **Duración**: 5 segundos (auto-dismiss)
- **Tipos visuales** (basados en prioridad):
  - Info (azul): Notificaciones generales (P3)
  - Success (verde): Logros, completaciones (P2)
  - Warning (amarillo): Expiraciones, advertencias (P1)
  - Error (rojo): Errores críticos, sistema (P0)

**Contenido del Toast**:
- Icono del tipo de notificación (🏆, 👤, 🛡️, etc.)
- Avatar del usuario (si aplica)
- Título conciso (max 50 caracteres)
- Mensaje breve (max 80 caracteres)
- Botón de acción (opcional): "Ver", "Aceptar", "Ir a..."
- Botón de cerrar (X)

**Comportamiento**:
- Sonido opcional (activable en preferencias)
- Vibración en móviles (si habilitado)
- Máximo 3 toasts simultáneos (stack vertical)
- Si llega 4to toast → descartar el más antiguo
- Animación de entrada: Slide from right (desktop) o top (mobile)
- Animación de salida: Fade out
- Hover en toast → Pausar auto-dismiss timer

**Validación**:
- Toast aparece <1 segundo después de recibir notificación WebSocket
- Auto-dismiss funciona después de 5 segundos
- Stack de toasts no supera 3 simultáneos
- Click en toast navega correctamente

### CA-04: Badge Contador de No Leídas
**Dado** que un usuario tiene notificaciones no leídas
**Cuando** navega por la plataforma
**Entonces** debe ver badge contador:

**Características**:
- Ubicación: Encima del icono de campana (🔔) en navbar
- Forma: Círculo rojo con número blanco
- Número: Cantidad de notificaciones no leídas
- Max display: "99+" si >99 no leídas
- Animación: "Bounce" al incrementar
- Oculto si 0 no leídas

**Actualización**:
- Incrementa al recibir notificación en tiempo real
- Decrementa al marcar notificación como leída
- Resetea a 0 al "Marcar todas como leídas"
- Sincroniza con servidor al reconectar

**Validación**:
- Badge muestra número correcto de no leídas
- Incrementa inmediatamente al recibir notificación
- Muestra "99+" si >99 no leídas

---

## Especificaciones Técnicas

### Frontend - React Components

**Tecnologías**: React 18, TypeScript, Zustand, Socket.IO Client, date-fns, sonner (toasts), TailwindCSS

**NotificationCenter Component**:

```typescript
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'friend' | 'guild' | 'mission' | 'achievement'>('all');

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type.startsWith(filter));

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2">
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b flex justify-between">
            <h3 className="font-semibold">Notificaciones</h3>
            <button onClick={markAllAsRead} className="text-sm text-blue-600">
              Marcar todas como leídas
            </button>
          </div>

          <NotificationFilters filter={filter} setFilter={setFilter} />

          <div className="max-h-[500px] overflow-y-auto">
            <NotificationList
              notifications={filteredNotifications}
              onNotificationClick={(notif) => {
                markAsRead(notif.id);
                navigateToAction(notif.actionUrl);
                setIsOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

**NotificationItem Component**:

```typescript
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function NotificationItem({ notification, onClick, onDelete }) {
  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);

  return (
    <div
      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}

        <div className={`text-2xl ${color}`}>{icon}</div>

        <div className="flex-1">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
          <span className="text-xs text-gray-400 mt-2 block">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
          </span>
        </div>

        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function getNotificationIcon(type: string): string {
  const iconMap = {
    'achievement': '🏆', 'friend': '👤', 'guild': '🛡️',
    'mission': '🎯', 'system': '📢', 'xp': '⭐'
  };
  return iconMap[type.split(':')[0]] || '📬';
}
```

**useNotifications Hook**:

```typescript
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNotificationStore } from '@/stores/notificationStore';
import { showToast } from '@/utils/toast';

export function useNotifications() {
  const { token } = useAuth();
  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: { token },
      reconnection: true
    });

    socket.on('notifications:sync', (data) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    });

    const notificationTypes = [
      'achievement:unlocked', 'friend:request', 'friend:accepted',
      'guild:challenge:new', 'mission:completed', 'system:announcement'
    ];

    notificationTypes.forEach(type => {
      socket.on(type, (notification) => {
        addNotification(notification);
        showToast(notification);
      });
    });

    return () => socket.disconnect();
  }, [token]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
```

**Toast Utils**:

```typescript
import { toast } from 'sonner';

export function showToast(notification: Notification) {
  const icon = getNotificationIcon(notification.type);
  const variant = getPriorityVariant(notification.priority);

  toast[variant](
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-medium">{notification.title}</p>
        <p className="text-sm text-gray-600">{notification.message}</p>
      </div>
    </div>,
    {
      duration: 5000,
      action: notification.actionUrl ? {
        label: 'Ver',
        onClick: () => navigateToAction(notification.actionUrl)
      } : undefined
    }
  );
}
```

---

## Dependencias

**Requiere:**
- **US-NOT-001a**: Infraestructura WebSocket - consume WebSocket y API REST
- Sistema de autenticación (AUTH-001) - para JWT token

**Relacionada:**
- **US-NOT-001c**: Preferencias - usa preferencias de toast/sonido

---

## Definición de Hecho (DoD)

### Desarrollo
- [x] NotificationCenter component implementado
- [x] NotificationList component con scroll infinito
- [x] NotificationItem component con tipos de notificación
- [x] Badge contador funcional
- [x] Filtros por tipo funcionales
- [x] Toast notifications implementados
- [x] Marcar como leído (individual y batch)
- [x] Eliminar notificaciones

### Testing
- [x] Tests unitarios: NotificationCenter component
- [x] Tests de integración: WebSocket → Toast → Centro
- [x] Tests E2E: Usuario recibe notificación → ve toast → hace click → navega
- [x] Tests de responsive: Mobile y desktop

### UX/UI
- [x] Diseño aprobado por UX
- [x] Animaciones suaves (entrada/salida)
- [x] Accesibilidad (ARIA labels, keyboard navigation)
- [x] Responsive (mobile, tablet, desktop)

---

## Estimación

- **Frontend - Components:** 16 horas
- **Frontend - WebSocket Integration:** 8 horas
- **Frontend - Toast System:** 8 horas
- **Testing (Unit + E2E):** 8 horas

**Total:** 40 horas (**5 SP** @ 8h/SP)

---

## Notas

- ✅ Archivo modularizado desde US-NOT-001-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- ✅ Depende de infraestructura de US-NOT-001a
- 📝 Toast library: Usar `sonner` (moderno, lightweight)
- 🎨 Diseño consistente con Design System de Gamilit
- 📱 Mobile-first approach

---

## Stack Tecnológico

**Frontend:** React 18, TypeScript, Zustand, Socket.IO Client, sonner, date-fns, TailwindCSS
**Testing:** Jest, React Testing Library, Cypress

---

**Tags:** #ui #frontend #notifications #toast #center #react #ext-003 #fase3
