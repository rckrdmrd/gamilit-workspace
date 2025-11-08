# RF-SOC-003: Sistema de Amigos y Red Social

**ID:** RF-SOC-003
**Título:** Red Social de Amigos para Estudiantes
**Módulo:** 05-caracteristicas-sociales
**Tipo:** Requerimiento Funcional
**Estado:** ✅ Implementado
**Prioridad:** Media ⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Descripción General

Este requerimiento funcional define el **sistema de amigos** que permite a los estudiantes conectarse entre sí, ver el progreso de sus amigos, y fomentar la motivación a través de la competencia amistosa y el apoyo mutuo.

El sistema de amigos permite:
- Enviar y aceptar solicitudes de amistad
- Ver actividad reciente de amigos
- Comparar progreso y logros
- Enviar mensajes y reacciones
- Configurar privacidad de perfil
- Bloquear usuarios inapropiados

---

## 🎯 Objetivos

1. **Fomentar motivación** a través de comparación social positiva
2. **Crear comunidad** de aprendices del maya yucateco
3. **Permitir apoyo mutuo** entre estudiantes
4. **Promover competencia sana** mediante rankings y logros
5. **Garantizar seguridad** con controles de privacidad y moderación

---

## 👥 Actores

- **Estudiante:** Envía solicitudes, interactúa con amigos
- **Padre/Tutor:** Configura privacidad para menores de 13 años (COPPA)
- **Maestro:** Supervisa interacciones dentro de su aula
- **Admin:** Modera reportes de comportamiento inadecuado

---

## ✅ Requerimientos Funcionales

### RF-SOC-003-01: Solicitudes de Amistad

**Descripción:** Los estudiantes pueden enviar y aceptar solicitudes de amistad.

**Criterios de Aceptación:**
- Un estudiante puede enviar solicitud de amistad a otro estudiante:
  - Búsqueda por nombre de usuario o email
  - Desde el perfil del usuario
  - Desde compañeros de aula
  - Desde leaderboards
- El destinatario recibe notificación de solicitud
- El destinatario puede:
  - **Aceptar:** Ambos se convierten en amigos
  - **Rechazar:** La solicitud se elimina (sin notificar al remitente)
  - **Bloquear:** Rechaza y bloquea futuras solicitudes
- Límite de solicitudes pendientes: **20** por usuario

**Estados de Amistad:**
```
pending      → Solicitud enviada, esperando respuesta
accepted     → Amigos activos
blocked      → Usuario bloqueado
unfriended   → Amistad terminada (historial)
```

**Flujo de Solicitud:**
```
┌────────────────┐
│ Juan busca a   │
│ María y envía  │
│ solicitud      │
└───────┬────────┘
        ▼
   Estado: pending
   (María recibe notificación)
        │
        ├─ María acepta → Estado: accepted
        ├─ María rechaza → Solicitud eliminada
        └─ María bloquea → Estado: blocked
```

**Ejemplo:**
```json
{
  "friendship_request_id": "req-uuid",
  "from_user_id": "juan-uuid",
  "to_user_id": "maria-uuid",
  "status": "pending",
  "message": "Hola! Vi que también estás aprendiendo maya",
  "created_at": "2025-11-07T10:00:00Z"
}
```

**Restricciones:**
- Menores de 13 años **requieren aprobación parental** para enviar solicitudes
- No se pueden enviar solicitudes a usuarios bloqueados
- Máximo **50 amigos** por usuario (estándar)
- Máximo **25 amigos** para menores de 13 años

---

### RF-SOC-003-02: Lista de Amigos

**Descripción:** Cada estudiante tiene una lista de amigos con información básica y estado de actividad.

**Criterios de Aceptación:**
- La lista de amigos muestra:
  - Avatar y nombre de usuario
  - Rango actual (ej: Nacom ⭐⭐)
  - Nivel/XP actual
  - Estado de actividad:
    - `online`: Activo en los últimos 5 minutos
    - `recently_active`: Activo en las últimas 24 horas
    - `offline`: Inactivo >24 horas
  - Última actividad (si amigo permite compartir)
- Ordenamiento:
  - Por defecto: Amigos online primero, luego alfabético
  - Opciones: Por nivel, por racha, por último activo
- Búsqueda/filtrado dentro de la lista de amigos

**Ejemplo de Vista:**
```
┌────────────────────────────────────────────┐
│  MIS AMIGOS (15/50)                        │
├────────────────────────────────────────────┤
│  🟢 María González                         │
│     Nacom ⭐⭐ │ Nivel 12 │ 3,450 XP       │
│     Completó: "Ejercicio de Verbos"       │
│                                            │
│  🟡 Juan Pérez                             │
│     Ah K'in ⭐⭐⭐ │ Nivel 15 │ 5,200 XP   │
│     Último activo: Hace 2 horas            │
│                                            │
│  ⚪ Ana López                              │
│     Ajaw ⭐ │ Nivel 8 │ 2,100 XP           │
│     Último activo: Hace 3 días             │
└────────────────────────────────────────────┘
```

---

### RF-SOC-003-03: Feed de Actividad de Amigos

**Descripción:** Los estudiantes ven un feed con la actividad reciente de sus amigos.

**Criterios de Aceptación:**
- El feed muestra actividades de los últimos 7 días:
  - Achievements desbloqueados
  - Niveles completados
  - Promoción de rango
  - Rachas alcanzadas (7, 14, 30 días)
  - Proyectos colaborativos completados
- Cada actividad muestra:
  - Avatar del amigo
  - Descripción de la actividad
  - Timestamp relativo (ej: "Hace 2 horas")
  - Opción de "Me gusta" o reacción
  - Opción de comentar (opcional)
- El feed se actualiza en tiempo real (WebSocket)
- Los estudiantes pueden ocultar ciertas actividades de su perfil

**Tipos de Actividades:**
```typescript
enum ActivityType {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  LEVEL_COMPLETED = 'level_completed',
  RANK_PROMOTED = 'rank_promoted',
  STREAK_MILESTONE = 'streak_milestone',
  PROJECT_COMPLETED = 'project_completed',
  FIRST_PLACE_LEADERBOARD = 'first_place_leaderboard'
}
```

**Ejemplo de Actividad:**
```json
{
  "activity_id": "act-uuid",
  "user_id": "maria-uuid",
  "type": "achievement_unlocked",
  "data": {
    "achievement_id": "speed_reader",
    "achievement_name": "Lector Veloz",
    "achievement_icon": "⚡"
  },
  "created_at": "2025-11-07T14:30:00Z",
  "likes_count": 5,
  "comments_count": 2
}
```

**Vista de Feed:**
```
┌────────────────────────────────────────────┐
│  ACTIVIDAD DE AMIGOS                       │
├────────────────────────────────────────────┤
│  ⚡ María desbloqueó "Lector Veloz"        │
│     Hace 2 horas │ ❤️ 5 │ 💬 2            │
│                                            │
│  🎉 Juan alcanzó el rango Ah K'in!         │
│     Hace 5 horas │ ❤️ 12 │ 💬 5           │
│                                            │
│  🔥 Ana tiene una racha de 14 días!        │
│     Ayer │ ❤️ 8 │ 💬 3                    │
└────────────────────────────────────────────┘
```

---

### RF-SOC-003-04: Comparación de Progreso

**Descripción:** Los estudiantes pueden comparar su progreso con el de sus amigos.

**Criterios de Aceptación:**
- Vista de comparación muestra:
  - **XP Total:** Gráfico de barras comparativo
  - **Rango:** Visual de rangos alcanzados
  - **Achievements:** Comparación de achievements desbloqueados
  - **Módulos Completados:** Porcentaje por módulo
  - **Rachas:** Racha actual y máxima
- Opciones de filtrado:
  - Comparar con un amigo específico
  - Comparar con top 5 amigos
  - Comparar con promedio de amigos
- Motivadores positivos:
  - "¡Estás adelante de María en achievements!"
  - "Juan tiene una racha más larga. ¿Puedes alcanzarlo?"
  - "Estás en el top 3 de tus amigos!"

**Ejemplo de Comparación:**
```
┌────────────────────────────────────────────┐
│  TÚ vs MARÍA                               │
├────────────────────────────────────────────┤
│  XP Total                                  │
│  Tú:    ████████████░░ 3,450 XP            │
│  María: ██████████░░░░ 2,800 XP            │
│         ¡Vas adelante! (+650 XP)           │
│                                            │
│  Achievements                              │
│  Tú:    12/50 desbloqueados                │
│  María: 15/50 desbloqueados                │
│         ¡María tiene 3 más!                │
│                                            │
│  Racha Actual                              │
│  Tú:    7 días 🔥                          │
│  María: 14 días 🔥🔥                       │
│         ¡Sigue practicando!                │
└────────────────────────────────────────────┘
```

---

### RF-SOC-003-05: Mensajería Privada (Opcional)

**Descripción:** Los amigos pueden enviarse mensajes privados.

**Criterios de Aceptación:**
- Solo amigos aceptados pueden enviarse mensajes
- Cada conversación muestra:
  - Historial de mensajes (últimos 30 días)
  - Estado de lectura (visto/no visto)
  - Indicador de escritura en tiempo real
- Restricciones:
  - Menores de 13 años **no pueden enviar mensajes** (COPPA)
  - Filtro automático de palabras inapropiadas
  - Límite de 50 mensajes por día por usuario (anti-spam)
- Moderación:
  - Reportar mensajes inapropiados
  - Bloquear usuario (elimina conversación)

**Ejemplo:**
```json
{
  "message_id": "msg-uuid",
  "from_user_id": "juan-uuid",
  "to_user_id": "maria-uuid",
  "content": "¿Cómo se dice 'libro' en maya?",
  "is_read": false,
  "created_at": "2025-11-07T15:00:00Z"
}
```

---

### RF-SOC-003-06: Configuración de Privacidad

**Descripción:** Los estudiantes controlan qué información comparten con sus amigos.

**Criterios de Aceptación:**

**Configuraciones Disponibles:**
- **Actividad reciente:**
  - `public`: Todos los amigos pueden ver (por defecto)
  - `private`: Nadie ve mi actividad
  - `custom`: Seleccionar amigos específicos
- **Progreso (XP, nivel, rango):**
  - `public`: Visible para todos los amigos
  - `friends_only`: Solo amigos aceptados
  - `hidden`: No visible
- **Lista de amigos:**
  - `public`: Otros pueden ver mi lista de amigos
  - `private`: Solo yo veo mi lista
- **Estado de actividad (online/offline):**
  - `visible`: Amigos ven si estoy online
  - `hidden`: Siempre aparezco como offline
- **Mensajes directos:**
  - `all_friends`: Todos los amigos pueden enviarme mensajes
  - `nobody`: Nadie puede enviarme mensajes

**Para Menores de 13 Años:**
- Por defecto, todas las configuraciones son `private` o más restrictivas
- Los padres deben aprobar cambios a configuraciones más abiertas
- No pueden recibir mensajes directos (COPPA)

**Ejemplo de Configuración:**
```json
{
  "user_id": "maria-uuid",
  "privacy_settings": {
    "recent_activity": "public",
    "progress_visibility": "friends_only",
    "friends_list_visibility": "private",
    "online_status": "visible",
    "direct_messages": "all_friends"
  },
  "is_minor": false,
  "updated_at": "2025-11-07T10:00:00Z"
}
```

---

### RF-SOC-003-07: Bloqueo de Usuarios

**Descripción:** Los estudiantes pueden bloquear usuarios problemáticos.

**Criterios de Aceptación:**
- Un estudiante puede bloquear a otro usuario:
  - Desde el perfil del usuario
  - Desde solicitud de amistad rechazada
  - Desde conversación de mensajes
- Al bloquear un usuario:
  - Se elimina la amistad (si existía)
  - El usuario bloqueado NO puede:
    - Enviar solicitudes de amistad
    - Ver el perfil del bloqueador
    - Enviar mensajes
    - Ver actividades del bloqueador
  - El bloqueador NO ve:
    - Actividades del bloqueado en feeds
    - Mensajes del bloqueado
    - Solicitudes del bloqueado
- Lista de usuarios bloqueados en configuración
- Opción de desbloquear (reversible)

**Notificación:**
- El usuario bloqueado **NO recibe notificación** del bloqueo
- Simplemente deja de ver al bloqueador en búsquedas y feeds

---

### RF-SOC-003-08: Sugerencias de Amigos

**Descripción:** El sistema sugiere amigos potenciales basados en:
- Compañeros de aula
- Amigos de amigos
- Nivel de progreso similar
- Intereses comunes (módulos completados)

**Criterios de Aceptación:**
- La sección "Sugerencias" muestra hasta 10 usuarios:
  - Razón de sugerencia (ej: "En tu aula", "Amigo de María")
  - Información básica del perfil
  - Botón "Agregar Amigo"
- Las sugerencias se actualizan semanalmente
- El usuario puede descartar sugerencias permanentemente
- No se sugieren usuarios bloqueados

**Algoritmo de Sugerencias:**
```
Puntuación = (
  Compañeros de aula * 5 +
  Amigos en común * 3 +
  Nivel similar * 2 +
  Módulos similares * 1
)
```

**Ejemplo:**
```
┌────────────────────────────────────────────┐
│  PERSONAS QUE PODRÍAS CONOCER              │
├────────────────────────────────────────────┤
│  Pedro Martínez                            │
│  Nacom ⭐⭐ │ Nivel 11                     │
│  Compañero en "Aula de Principiantes"     │
│  [Agregar Amigo] [Descartar]              │
│                                            │
│  Laura Gómez                               │
│  Ajaw ⭐ │ Nivel 9                         │
│  Amiga de María y Juan                     │
│  [Agregar Amigo] [Descartar]              │
└────────────────────────────────────────────┘
```

---

## 🔒 Consideraciones de Seguridad y Privacidad

### COPPA Compliance (Menores de 13 Años)

- **Aprobación Parental:** Requerida para:
  - Enviar solicitudes de amistad
  - Cambiar configuraciones de privacidad a más abiertas
- **Restricciones:**
  - No pueden usar mensajería directa
  - Máximo 25 amigos (vs 50 estándar)
  - Por defecto, todas las configuraciones en `private`
- **Supervisión:**
  - Los padres pueden revisar lista de amigos
  - Notificaciones a padres de nuevas amistades

### Moderación

- Filtro automático de palabras inapropiadas en mensajes
- Sistema de reportes para comportamiento inadecuado
- Revisión manual de reportes por equipo de moderación
- Sanciones progresivas:
  1. Advertencia
  2. Suspensión temporal de funciones sociales (7 días)
  3. Suspensión de cuenta (30 días)
  4. Ban permanente (casos graves)

### Protección de Datos

- No se comparte información personal (email, teléfono) entre amigos
- Los padres pueden solicitar exportación de datos (GDPR)
- Los padres pueden solicitar eliminación de cuenta del menor

---

## 🎨 Wireframes y Flujos

### Perfil de Amigo

```
┌────────────────────────────────────────────┐
│  MARÍA GONZÁLEZ                  [Opciones]│
│  @maria_maya                               │
│  Nacom ⭐⭐                                 │
├────────────────────────────────────────────┤
│  Nivel 12 │ 3,450 XP │ Racha: 7 días 🔥   │
│                                            │
│  📊 Progreso                               │
│  Módulos completados: 3/5                  │
│  Achievements: 12/50                       │
│                                            │
│  🏆 Últimos Logros                         │
│  ⚡ Lector Veloz (Hace 2 horas)            │
│  🎯 Primera Racha (Hace 3 días)            │
│                                            │
│  [Enviar Mensaje] [Comparar Progreso]     │
│  [Eliminar Amigo]                          │
└────────────────────────────────────────────┘
```

---

## 🧪 Casos de Prueba

### Test 1: Enviar Solicitud de Amistad

```typescript
test('Student can send friend request successfully', async () => {
  const juan = await createTestStudent('Juan');
  const maria = await createTestStudent('María');

  const request = await friendService.sendFriendRequest(juan.id, maria.id, {
    message: 'Hola! Vi que también estás aprendiendo maya'
  });

  expect(request.from_user_id).toBe(juan.id);
  expect(request.to_user_id).toBe(maria.id);
  expect(request.status).toBe('pending');

  // Verify notification sent to María
  const notifications = await notificationService.getUserNotifications(maria.id);
  expect(notifications.some(n => n.type === 'friend_request')).toBe(true);
});
```

### Test 2: Límite de Amigos para Menores

```typescript
test('Minor cannot exceed 25 friends limit', async () => {
  const minor = await createTestStudent('Minor', { age: 10 });

  // Add 25 friends
  for (let i = 0; i < 25; i++) {
    const friend = await createTestStudent(`Friend${i}`);
    await friendService.acceptFriendRequest(minor.id, friend.id);
  }

  // Try to add 26th friend
  const newFriend = await createTestStudent('Friend26');
  const request = await friendService.sendFriendRequest(minor.id, newFriend.id);

  await expect(
    friendService.acceptFriendRequest(newFriend.id, minor.id)
  ).rejects.toThrow('Minor friend limit reached (25)');
});
```

### Test 3: Usuario Bloqueado No Puede Enviar Solicitud

```typescript
test('Blocked user cannot send friend request', async () => {
  const maria = await createTestStudent('María');
  const pedro = await createTestStudent('Pedro');

  // María bloquea a Pedro
  await friendService.blockUser(maria.id, pedro.id);

  // Pedro intenta enviar solicitud a María
  await expect(
    friendService.sendFriendRequest(pedro.id, maria.id)
  ).rejects.toThrow('Cannot send request to blocked user');
});
```

---

## 📊 Métricas y Analytics

### Métricas de Adopción
- % de usuarios con al menos 1 amigo
- Promedio de amigos por usuario
- Distribución de tamaño de red (1-5, 6-10, 11-25, 26-50)
- Tasa de aceptación de solicitudes

### Métricas de Engagement
- Frecuencia de visitas a feed de amigos
- Cantidad de "me gusta" y comentarios
- Mensajes enviados por día
- Comparaciones de progreso realizadas

### Métricas de Moderación
- Reportes recibidos por día
- Usuarios bloqueados por semana
- Tasa de falsos positivos en filtro de palabras

---

## 🎯 Casos de Uso

### CU-001: Juan Envía Solicitud de Amistad a María

**Actor:** Juan (Estudiante)

**Flujo Principal:**
1. Juan busca "María" en la barra de búsqueda
2. Ve el perfil de María González
3. Hace clic en "Agregar Amigo"
4. Escribe mensaje opcional: "Hola! Vi que también estás aprendiendo maya"
5. Hace clic en "Enviar Solicitud"
6. Sistema crea solicitud con estado `pending`
7. Sistema envía notificación a María
8. Juan ve "Solicitud Enviada" en el perfil de María

---

### CU-002: María Acepta Solicitud de Amistad

**Actor:** María (Estudiante)

**Flujo Principal:**
1. María recibe notificación de solicitud de Juan
2. Hace clic en la notificación
3. Ve el perfil de Juan y su mensaje
4. Hace clic en "Aceptar"
5. Sistema actualiza solicitud a `accepted`
6. Sistema añade a Juan y María como amigos mutuos
7. Sistema notifica a Juan: "María aceptó tu solicitud"
8. Ambos ven al otro en su lista de amigos

**Flujo Alternativo (Rechazar):**
4a. María hace clic en "Rechazar"
4b. Sistema elimina la solicitud
4c. Juan NO recibe notificación

---

### CU-003: Juan Ve Feed de Actividad de Amigos

**Actor:** Juan (Estudiante)

**Flujo Principal:**
1. Juan accede a la sección "Amigos"
2. Ve el feed de actividad:
   - María desbloqueó "Lector Veloz" (Hace 2 horas)
   - Ana alcanzó racha de 14 días (Ayer)
   - Pedro completó Módulo 2 (Hace 3 días)
3. Juan hace clic en "Me gusta" en el achievement de María
4. Sistema registra la reacción
5. María recibe notificación: "A Juan le gustó tu achievement"

---

### CU-004: Menor de Edad Intenta Enviar Mensaje

**Actor:** Carlos (Estudiante, 11 años)

**Flujo Principal:**
1. Carlos accede al perfil de su amigo Pedro
2. Hace clic en "Enviar Mensaje"
3. Sistema verifica edad de Carlos (11 años < 13)
4. Sistema muestra mensaje: "Los menores de 13 años no pueden enviar mensajes directos por seguridad. Puedes interactuar mediante 'Me gusta' y comentarios."
5. Carlos no puede acceder a la funcionalidad de mensajes

---

## 🔗 Referencias

### Implementación DDL

🗄️ **Tablas:**
- `social_features.friendships` - Relaciones de amistad
- `social_features.friend_requests` - Solicitudes pendientes
- `social_features.blocked_users` - Usuarios bloqueados
- `social_features.user_activities` - Feed de actividades
- `social_features.direct_messages` - Mensajes privados (opcional)
- `social_features.privacy_settings` - Configuraciones de privacidad

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-SOC-003: Sistema de Amigos](../../02-especificaciones-tecnicas/05-caracteristicas-sociales/ET-SOC-003-sistema-amigos.md)

### Documentos Relacionados

- [RF-SOC-001: Aulas Virtuales](./RF-SOC-001-aulas-virtuales.md)
- [RF-SOC-002: Equipos Colaborativos](./RF-SOC-002-equipos-colaborativos.md)
- [RF-AUTH-002: Estados de Cuenta](../01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md) - Moderación

---

## 📝 Notas de Implementación

### COPPA Compliance

Este sistema debe cumplir con COPPA (Children's Online Privacy Protection Act):
- Verificación de edad al registro
- Aprobación parental para menores de 13 años
- Restricciones automáticas para menores
- Dashboard parental para supervisión

### Escalabilidad

- Los feeds de actividad usan caché de Redis (TTL: 5 minutos)
- Las sugerencias de amigos se calculan de forma batch (diariamente)
- Los mensajes usan WebSocket para entrega en tiempo real

### Accesibilidad

- Lectores de pantalla deben anunciar estado de actividad (online/offline)
- Notificaciones visuales Y sonoras para nuevos mensajes
- Alto contraste para indicadores de actividad

---

**Última revisión:** 2025-11-07
**Revisores:** Equipo Legal (COPPA), Equipo de Seguridad, Product Owner
**Próxima revisión:** 2026-01-07
