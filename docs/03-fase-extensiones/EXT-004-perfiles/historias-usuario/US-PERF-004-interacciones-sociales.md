# US-PERF-004: Interacciones Sociales

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-PERF-004 |
| **Épica** | EXT-004 - Perfiles Avanzados |
| **Título** | Sistema de Interacciones Sociales y Gestión de Amigos |
| **Prioridad** | Alta (P1) |
| **Story Points** | 8 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $4,000 MXN |

---

## Historia de Usuario

**Como** estudiante de la plataforma Gamilit
**Quiero** gestionar amigos, enviar mensajes directos y configurar mi visibilidad social
**Para** conectar con otros estudiantes, compartir logros y crear una comunidad de aprendizaje

---

## Valor de Negocio

### Impacto
- **Engagement**: Conexiones sociales aumentan permanencia 45%
- **Retention**: Usuarios con >3 amigos tienen 60% menos churn
- **Colaboración**: Facilita aprendizaje entre pares
- **Community Building**: Crea sentido de pertenencia

### Métricas de Éxito
- >70% usuarios agregan al menos 3 amigos en primer mes
- >50% envían mensajes regularmente (1+ por semana)
- <2% incidentes de comportamiento inapropiado reportados
- Satisfacción social >4.2/5 en encuestas

---

## Criterios de Aceptación

### CA-01: Búsqueda y Descubrimiento de Usuarios
**Dado** que un estudiante quiere encontrar amigos
**Cuando** utiliza la función de búsqueda
**Entonces** debe poder:
- Buscar usuarios por nombre de usuario o nombre completo
- Filtrar por grado académico, intereses comunes
- Ver sugerencias de "Personas que quizás conozcas" basado en:
  - Compañeros de clase/aula
  - Amigos en común
  - Intereses similares
- Ver perfil público del usuario antes de enviar solicitud
- Respetar configuraciones de privacidad (usuarios privados no aparecen)

### CA-02: Gestión de Solicitudes de Amistad
**Dado** que un usuario gestiona relaciones sociales
**Cuando** envía o recibe solicitudes
**Entonces** debe poder:
- Enviar solicitud de amistad con mensaje opcional (hasta 200 caracteres)
- Ver solicitudes pendientes enviadas (con opción de cancelar)
- Ver solicitudes recibidas con:
  - Información del remitente (avatar, nombre, grado)
  - Mensaje personalizado si lo hay
  - Amigos en común
  - Botones: Aceptar / Rechazar / Bloquear
- Recibir notificación in-app cuando recibe solicitud
- Límite de 50 solicitudes pendientes enviadas simultáneamente
- Cooldown de 24h si rechaza 10+ solicitudes del mismo usuario

### CA-03: Lista de Amigos
**Dado** que el usuario visualiza sus amigos
**Cuando** accede a lista de amigos
**Entonces** debe ver:
- Grid/Lista de amigos con:
  - Avatar, nombre de usuario, nombre real
  - Estado: Online (verde) / Idle (amarillo) / Offline (gris)
  - Última actividad ("Hace 5 min", "Hace 2 días")
  - Nivel actual y badge principal
- Ordenar por: Estado / Nombre / Nivel / Fecha de amistad
- Búsqueda de amigos en la lista
- Contador total: "145 amigos"
- Acciones por amigo:
  - Ver perfil completo
  - Enviar mensaje
  - Eliminar amigo (con confirmación)
  - Bloquear usuario
- Categorías opcionales: "Mejores amigos", "Compañeros de clase", "Personalizado"

### CA-04: Mensajes Directos (DM)
**Dado** que dos usuarios son amigos
**Cuando** utilizan mensajería directa
**Entonces** pueden:
- Enviar mensajes de texto (hasta 2000 caracteres)
- Ver conversaciones en formato chat (burbujas)
- Ver indicadores:
  - "Escribiendo..." cuando el otro escribe
  - "Visto" cuando mensaje se lee
  - Timestamp de cada mensaje
- Enviar emojis básicos y stickers de Gamilit
- Compartir logros directamente (vista enriquecida)
- Compartir enlaces a mecánicas o módulos
- Eliminar mensaje propio (antes de 5 min)
- Reportar mensaje inapropiado
- Límite de 100 mensajes/día por usuario (anti-spam)
- Historial de mensajes: últimos 30 días (después archivado)

### CA-05: Notificaciones de Mensajería
**Dado** que un usuario recibe comunicaciones
**Cuando** ocurren eventos sociales
**Entonces** debe recibir:
- **Solicitud de amistad recibida**: Notificación in-app + email (opcional)
- **Solicitud aceptada**: "Juan Pérez aceptó tu solicitud"
- **Mensaje nuevo**: Badge de contador en ícono de mensajes
- **Amigo online**: Notificación sutil si está en favoritos
- Configuración granular en preferencias (ver US-PERF-001)
- Modo "No Molestar" desactiva notificaciones temporalmente
- Resumen diario: "Tienes 3 mensajes nuevos y 2 solicitudes"

### CA-06: Configuración de Visibilidad Social
**Dado** que el usuario configura privacidad social
**Cuando** ajusta opciones de visibilidad
**Entonces** puede definir:
- **Perfil visible para**: Todos / Solo Amigos / Nadie
- **Permitir solicitudes de**: Todos / Compañeros de clase / Nadie
- **Mostrar estado online**: Sí / Solo Amigos / No
- **Permitir mensajes de**: Todos los amigos / Solo favoritos / Nadie
- **Aparecer en búsquedas**: Sí / No
- **Mostrar lista de amigos**: Sí / Solo Amigos / No
- Preview en tiempo real de cómo se ve perfil según config
- Modo "Invisible": aparece offline para todos

### CA-07: Bloqueo de Usuarios
**Dado** que un usuario necesita bloquear a alguien
**Cuando** bloquea a otro usuario
**Entonces** el sistema debe:
- Eliminar amistad existente automáticamente
- Prevenir que el bloqueado:
  - Vea su perfil
  - Envíe solicitudes de amistad
  - Envíe mensajes
  - Vea actividad en leaderboards
- No notificar al bloqueado (bloqueo invisible)
- Permitir al bloqueador:
  - Ver lista de usuarios bloqueados
  - Desbloquear en cualquier momento
- Límite de 100 usuarios bloqueados por cuenta
- Audit log de bloqueos en backend

### CA-08: Reporte de Comportamiento Inapropiado
**Dado** que un usuario observa conducta inapropiada
**Cuando** reporta a otro usuario o mensaje
**Entonces** debe poder:
- Seleccionar tipo de reporte:
  - Spam
  - Acoso o bullying
  - Contenido inapropiado
  - Suplantación de identidad
  - Otro (especificar)
- Agregar descripción (opcional, hasta 500 caracteres)
- Adjuntar screenshot (opcional)
- Enviar reporte anónimo (el reportado no ve quién reportó)
- Recibir confirmación: "Reporte enviado. Lo revisaremos en 48h"
- Sistema debe:
  - Notificar a moderadores
  - Marcar usuario con múltiples reportes (>3)
  - Suspender automáticamente si >10 reportes en 24h
  - Guardar evidencia para revisión

### CA-09: Actividad Social en Timeline
**Dado** que el usuario ve actividad de amigos
**Cuando** accede a feed social
**Entonces** puede ver:
- Timeline de actividades de amigos (si su privacidad lo permite):
  - "Ana completó Módulo 2 con 95% de acierto"
  - "Carlos desbloqueó el logro 'Maestro del Cacao'"
  - "Luis alcanzó nivel 15"
- Reacciones simples: Like, Celebrar, Wow (tipo LinkedIn)
- Comentarios básicos (hasta 300 caracteres)
- Filtros: Todos / Solo mejores amigos / Por actividad
- Opción "Ocultar esta publicación"
- Configurar qué actividades propias se comparten (en privacidad)

### CA-10: Estadísticas Sociales
**Dado** que el usuario accede a métricas sociales
**Cuando** visualiza su actividad social
**Entonces** debe ver:
- Total de amigos / solicitudes pendientes
- Mensajes enviados/recibidos esta semana
- Logros compartidos este mes
- Reacciones recibidas en publicaciones
- Gráfico de crecimiento de amigos (últimos 6 meses)
- "Amigo más activo" (con quien más interactúa)
- Comparativa de red social (vs promedio de plataforma)

### CA-11: Responsive y Accesibilidad
**Dado** que el usuario accede desde cualquier dispositivo
**Cuando** utiliza features sociales
**Entonces** debe:
- Funcionar en 320px - 2560px
- Chat optimizado para mobile (teclado no oculta mensajes)
- Notificaciones nativas en mobile (Push)
- Navegación por teclado en desktop
- ARIA labels en listas de amigos y mensajes
- Screen reader anuncia mensajes nuevos
- Alto contraste en burbujas de chat
- Touch targets 44x44px mínimo

### CA-12: Seguridad y Validación
**Dado** que la mensajería puede ser vector de abuso
**Cuando** usuarios interactúan
**Entonces** el sistema debe:
- Sanitizar todos los mensajes (prevenir XSS)
- Filtro de palabras inapropiadas (configurable)
- Detección automática de:
  - Spam (mensajes repetidos)
  - Enlaces sospechosos (phishing)
  - Patrones de acoso
- Rate limiting: 100 mensajes/día, 10 solicitudes/hora
- Encriptación end-to-end en mensajes (opcional en roadmap)
- Retención de datos: mensajes >30 días archivados
- GDPR compliance: derecho al olvido (eliminar historial)
- Audit trail de todas las interacciones sociales

### CA-13: Integración con Sistema de Gamificación
**Dado** que las interacciones sociales otorgan recompensas
**Cuando** el usuario completa acciones sociales
**Entonces** debe ganar:
- **Primera amistad**: 50 Cacao, Badge "Social Butterfly"
- **10 amigos**: 100 Cacao, Badge "Popular"
- **50 mensajes enviados**: Badge "Comunicativo"
- **100 amigos**: Badge "Networker Experto"
- Quests sociales: "Agrega 5 amigos esta semana" (200 Cacao)
- Bonus XP por ayudar amigos (compartir recursos)

### CA-14: Moderación de Contenido
**Dado** que se necesita mantener ambiente sano
**Cuando** moderadores revisan reportes
**Entonces** deben poder:
- Ver dashboard de reportes pendientes
- Revisar evidencia (mensajes, perfiles)
- Acciones disponibles:
  - Advertir al usuario (warning)
  - Suspender mensajería (1 día, 7 días, 30 días)
  - Suspender cuenta temporal
  - Ban permanente
- Comunicar decisión al reportante y reportado
- Apelar decisiones (proceso de revisión)
- Estadísticas de moderación (tiempo de respuesta, % casos resueltos)

### CA-15: Performance y Escalabilidad
**Dado** que el sistema debe soportar miles de usuarios
**Cuando** operan features sociales
**Entonces** debe:
- Mensajes entregados en <200ms (p95)
- Estado online actualizado cada 30 segundos
- Notificaciones push en <1 segundo
- Lista de amigos carga en <500ms (hasta 500 amigos)
- Búsqueda de usuarios responde en <300ms
- WebSockets para chat en tiempo real
- Caché de estados online (Redis)
- Índices en tablas de relaciones (user_friends, messages)

---

## Especificaciones Técnicas

### Frontend Components
```
src/features/social/
├── pages/
│   ├── FriendsPage.tsx
│   ├── MessagesPage.tsx
│   └── DiscoverPage.tsx
├── components/
│   ├── FriendsList.tsx
│   ├── FriendCard.tsx
│   ├── FriendRequestCard.tsx
│   ├── ChatWindow.tsx
│   ├── MessageBubble.tsx
│   ├── UserSearchBar.tsx
│   ├── OnlineStatus.tsx
│   ├── BlockUserModal.tsx
│   ├── ReportModal.tsx
│   └── SocialTimeline.tsx
├── hooks/
│   ├── useFriends.ts
│   ├── useMessages.ts
│   ├── useWebSocket.ts
│   └── useOnlineStatus.ts
└── contexts/
    └── ChatContext.tsx
```

### TypeScript Interfaces
```typescript
interface Friendship {
  id: string;
  userId1: string;
  userId2: string;
  status: 'pending' | 'accepted' | 'rejected';
  initiatorId: string;
  requestMessage?: string;
  createdAt: Date;
  acceptedAt?: Date;
}

interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: 'text' | 'achievement' | 'link' | 'sticker';
  metadata?: any;
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
  readAt?: Date;
  deletedAt?: Date;
}

interface UserBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  reason?: string;
  createdAt: Date;
}

interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  targetType: 'user' | 'message';
  targetId: string;
  category: 'spam' | 'harassment' | 'inappropriate' | 'impersonation' | 'other';
  description?: string;
  screenshot?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

interface OnlineStatus {
  userId: string;
  status: 'online' | 'idle' | 'offline';
  lastSeen: Date;
  currentActivity?: string;
}
```

### API Endpoints
```typescript
// Friends
GET    /api/social/friends
POST   /api/social/friends/request
PUT    /api/social/friends/:id/accept
DELETE /api/social/friends/:id
GET    /api/social/friends/suggestions

// Messages
GET    /api/social/messages/conversations
GET    /api/social/messages/:conversationId
POST   /api/social/messages
PUT    /api/social/messages/:id/read
DELETE /api/social/messages/:id

// Blocking
POST   /api/social/block
DELETE /api/social/block/:userId
GET    /api/social/blocked

// Reporting
POST   /api/social/report
GET    /api/social/reports (admin only)
PUT    /api/social/reports/:id/resolve (admin only)

// Online Status
GET    /api/social/status/:userId
WS     /ws/social/status
```

### Database Schema
```sql
-- Friendships table
CREATE TABLE friendships (
  id UUID PRIMARY KEY,
  user_id_1 UUID REFERENCES users(id),
  user_id_2 UUID REFERENCES users(id),
  status VARCHAR(20),
  initiator_id UUID,
  request_message TEXT,
  created_at TIMESTAMP,
  accepted_at TIMESTAMP,
  CONSTRAINT unique_friendship UNIQUE (user_id_1, user_id_2)
);
CREATE INDEX idx_friendships_user1 ON friendships(user_id_1);
CREATE INDEX idx_friendships_user2 ON friendships(user_id_2);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Messages table
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID,
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  content TEXT,
  type VARCHAR(20),
  metadata JSONB,
  status VARCHAR(20),
  created_at TIMESTAMP,
  read_at TIMESTAMP,
  deleted_at TIMESTAMP
);
CREATE INDEX idx_messages_conversation ON direct_messages(conversation_id);
CREATE INDEX idx_messages_recipient ON direct_messages(recipient_id, status);

-- Blocks table
CREATE TABLE user_blocks (
  id UUID PRIMARY KEY,
  blocker_id UUID REFERENCES users(id),
  blocked_id UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP,
  CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id)
);
CREATE INDEX idx_blocks_blocker ON user_blocks(blocker_id);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  reporter_id UUID REFERENCES users(id),
  reported_id UUID REFERENCES users(id),
  target_type VARCHAR(20),
  target_id UUID,
  category VARCHAR(50),
  description TEXT,
  screenshot TEXT,
  status VARCHAR(20),
  resolution TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP
);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported ON reports(reported_id);
```

---

## Diferenciación con Alcance Inicial (EAI)

### Alcance Inicial (EAI)
- **EP008**: Features sociales básicas planeadas pero NO implementadas

### Esta Historia (EXT-004)
- **Sistema completo de amigos**: búsqueda, solicitudes, gestión
- **Mensajería directa**: chat en tiempo real con WebSockets
- **Configuración de privacidad**: granular y flexible
- **Moderación**: bloqueo, reportes, sistema anti-abuso
- **Gamificación social**: logros por interacciones
- **Timeline social**: actividad de amigos
- Esto es **extensión completa del aspecto social**

---

## Dependencias

### Depende de
- **EAI-001**: Sistema de usuarios y autenticación
- **US-PERF-001**: Sistema de perfiles (necesita info de usuarios)
- **EAI-003**: Sistema de logros (para compartir achievements)

### Bloquea a
- **EXT-007**: Portal de Comunidad (usa este sistema como base)

---

## Definición de Terminado (DoD)

- [ ] UI de búsqueda y descubrimiento de usuarios
- [ ] Sistema de solicitudes de amistad (enviar, aceptar, rechazar)
- [ ] Lista de amigos con estado online/offline
- [ ] Chat en tiempo real con WebSockets
- [ ] Notificaciones de mensajes y solicitudes
- [ ] Configuración de privacidad social
- [ ] Sistema de bloqueo de usuarios
- [ ] Sistema de reportes y moderación
- [ ] Timeline de actividad social
- [ ] Estadísticas sociales
- [ ] API endpoints implementados
- [ ] WebSocket server configurado
- [ ] Base de datos con índices optimizados
- [ ] Rate limiting y anti-spam
- [ ] Filtro de contenido inapropiado
- [ ] Tests unitarios >80% coverage
- [ ] Tests de integración para flujos sociales
- [ ] Tests de carga (1000+ usuarios concurrentes)
- [ ] Responsive design completo
- [ ] Accesibilidad WCAG 2.1 AA
- [ ] Documentación de API
- [ ] Guía de moderación

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Spam y abuso | Alta | Alto | Rate limiting, filtros, moderación activa |
| Escalabilidad de WebSockets | Media | Alto | Load balancer, Redis pub/sub, scaling horizontal |
| Contenido inapropiado | Media | Alto | Filtros automáticos, reportes, moderación 24/7 |
| Privacy concerns | Media | Medio | Config granular, GDPR compliance, audit logs |

---

## Estimación Detallada (8 SP)

| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Diseño UI/UX social | 8h | UX Designer |
| Sistema de amigos | 10h | Frontend Dev |
| Chat UI y WebSockets | 12h | Frontend Dev |
| Búsqueda y descubrimiento | 6h | Frontend Dev |
| Notificaciones | 6h | Frontend Dev |
| API de amigos | 8h | Backend Dev |
| API de mensajería | 10h | Backend Dev |
| WebSocket server | 8h | Backend Dev |
| Sistema de bloqueo/reportes | 8h | Backend Dev |
| Moderación dashboard | 6h | Backend Dev |
| Testing | 12h | QA + Devs |
| Documentación | 4h | Tech Lead |
| **TOTAL** | **98h** | |

**Presupuesto**: $4,000 MXN (~$230 USD)
**Duración Estimada**: 2-3 días (equipo de 5-6 personas)

---

## Tareas de Implementación

### Backend (14.4h - 45%)
- [ ] Diseñar schema de tablas friendships, direct_messages, user_blocks, reports (2h)
- [ ] Implementar API de gestión de amigos (solicitudes, aceptar, rechazar) (3h)
- [ ] Desarrollar API de mensajería con WebSockets (3h)
- [ ] Crear sistema de bloqueo y reportes de usuarios (2h)
- [ ] Implementar moderación dashboard para admins (1.5h)
- [ ] Desarrollar rate limiting y anti-spam (1.5h)
- [ ] Configurar índices en BD para performance (1.4h)

### Frontend (11.2h - 35%)
- [ ] Crear FriendsPage con lista de amigos y búsqueda (2h)
- [ ] Implementar MessagesPage con chat en tiempo real (3h)
- [ ] Desarrollar sistema de solicitudes de amistad (1.5h)
- [ ] Crear componentes de bloqueo y reporte de usuarios (1.5h)
- [ ] Implementar notificaciones de mensajes y solicitudes (1.5h)
- [ ] Desarrollar timeline de actividad social (1.5h)
- [ ] Configurar WebSocket client para chat (0.2h)

### Testing y QA (4.8h - 15%)
- [ ] Escribir tests unitarios para sistema social (2h)
- [ ] Crear tests de integración para flujos sociales (1.5h)
- [ ] Realizar tests de carga con 1000+ usuarios concurrentes (1h)
- [ ] Validar filtro de contenido inapropiado (0.3h)

### Deploy y Documentación (1.6h - 5%)
- [ ] Configurar WebSocket server en producción (0.5h)
- [ ] Documentar API de sistema social (0.6h)
- [ ] Crear guía de moderación para administradores (0.5h)

**Total Estimado**: 32h

---

## Cronograma

| Fase | Fecha Inicio Planificada | Fecha Fin Estimada | Horas | Estado |
|------|--------------------------|-------------------|-------|--------|
| Backend | 28 Oct 2024 | 29 Oct 2024 | 14.4h | Planificado |
| Frontend | 29 Oct 2024 | 31 Oct 2024 | 11.2h | Planificado |
| Testing | 31 Oct 2024 | 01 Nov 2024 | 4.8h | Planificado |
| Deploy | 01 Nov 2024 | 01 Nov 2024 | 1.6h | Planificado |

---

## Tags

#ext-004 #social #amigos #mensajeria #chat #moderacion #privacidad #websockets #mes-3

---

**Creado**: 2025-11-02
**Última Actualización**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Estado**: Pendiente de Aprobación
**Versión**: 1.0
**Origen**: EP008-social-features (features avanzadas extraídas)
**Compliance**: PF-001 (XXX líneas)
