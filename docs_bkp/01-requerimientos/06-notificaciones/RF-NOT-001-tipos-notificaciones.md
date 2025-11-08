# RF-NOT-001: Tipos de Notificaciones

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-NOT-001 |
| **Módulo** | 06 - Notificaciones |
| **Título** | Tipos de Notificaciones |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Database Team, Product Team |
| **Stakeholders** | Product Owner, Backend Team, Frontend Team, UX Team |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **ENUMs Canónicos:**
- **`public.notification_type`** - `apps/database/ddl/00-prerequisites.sql:76-80`
  - 11 tipos de notificaciones

- **`public.notification_priority`** - `apps/database/ddl/00-prerequisites.sql:81-85`
  - 4 niveles de prioridad

🗄️ **Tablas Relacionadas:**
1. **`public.notifications`**
   - **Ubicación:** `apps/database/ddl/schemas/public/tables/notifications.sql`
   - **Propósito:** Notificaciones en-app para usuarios
   - **Columnas clave:**
     - `type` (ENUM notification_type)
     - `priority` (ENUM notification_priority)
     - `title`, `body` (TEXT)
     - `data` (JSONB, información adicional)
     - `is_read` (BOOLEAN)

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-NOT-001: Implementación del Sistema de Notificaciones](../../02-especificaciones-tecnicas/06-notificaciones/ET-NOT-001-tipos-notificaciones.md)

### Documentos Relacionados

- [RF-GAM-001: Sistema de Achievements](../02-gamificacion/RF-GAM-001-achievements.md) - `achievement_unlocked`
- [RF-GAM-003: Sistema de Rangos Maya](../02-gamificacion/RF-GAM-003-rangos-maya.md) - `rank_up`
- [RF-SOC-001: Sistema de Aulas](../05-caracteristicas-sociales/RF-SOC-001-aulas-virtuales.md) - `classroom_invitation`
- [MAPEO: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#módulo-6-notificaciones)

---

## 📖 Descripción General

### Propósito

El **Sistema de Notificaciones** mantiene a los usuarios informados sobre:
- Eventos de gamificación (achievements, promociones de rango)
- Interacciones sociales (invitaciones, menciones)
- Progreso académico (módulos completados)
- Recordatorios (streaks, actividades pendientes)

Las notificaciones:
- Se muestran **in-app** (dentro de la aplicación)
- Tienen **prioridades** (low, medium, high, urgent)
- Pueden incluir **datos adicionales** en formato JSONB
- Son **marcables como leídas**
- Se pueden **filtrar por tipo**

### Contexto

Las notificaciones se generan automáticamente por:
- **Triggers de base de datos** (ej: al desbloquear achievement)
- **Event listeners** en backend (ej: al completar módulo)
- **Acciones de otros usuarios** (ej: invitación a aula)

### Alcance

**Incluye:**
- ✅ 11 tipos de notificaciones diferentes
- ✅ 4 niveles de prioridad
- ✅ Notificaciones in-app en tiempo real
- ✅ Marcado de lectura/no lectura
- ✅ Filtrado por tipo y fecha
- ✅ Datos adicionales en JSONB

**Excluye:**
- ❌ Push notifications (implementación futura)
- ❌ Email notifications (implementación futura)
- ❌ SMS notifications

---

## ⚙️ Requerimientos Funcionales

### 1. Tipos de Notificaciones (11 tipos)

#### 1.1. Achievement Unlocked (Achievement Desbloqueado) 🏆

**ID:** `achievement_unlocked`
**Descripción:** Usuario desbloqueó un nuevo achievement
**Prioridad:** `high`

**Estructura de datos:**
```json
{
  "achievement_id": "uuid",
  "achievement_code": "FIRST_EXERCISE",
  "achievement_type": "milestone",
  "icon_url": "https://...",
  "xp_reward": 50,
  "ml_coins_reward": 10
}
```

**Título:** "¡Achievement Desbloqueado!"
**Cuerpo:** "Desbloqueaste: [Nombre del Achievement]"

**Acción:** Click abre modal con detalles del achievement

---

#### 1.2. Rank Up (Promoción de Rango) 👑

**ID:** `rank_up`
**Descripción:** Usuario fue promovido a un rango superior
**Prioridad:** `high`

**Estructura de datos:**
```json
{
  "old_rank": "Ajaw",
  "new_rank": "Nacom",
  "xp_at_promotion": 1050,
  "bonus_coins": 50,
  "benefits_unlocked": [
    "+5% bonus XP",
    "Ejercicios hard desbloqueados"
  ]
}
```

**Título:** "¡Promoción de Rango!"
**Cuerpo:** "Ascendiste a [Nuevo Rango]"

**Acción:** Click abre página de rangos con detalles

---

#### 1.3. Module Completed (Módulo Completado) ✅

**ID:** `module_completed`
**Descripción:** Usuario completó todos los ejercicios de un módulo
**Prioridad:** `high`

**Estructura de datos:**
```json
{
  "module_id": "uuid",
  "module_title": "Introducción al Maya",
  "completion_percentage": 100,
  "xp_earned": 100,
  "ml_coins_earned": 50,
  "is_mastered": false
}
```

**Título:** "¡Módulo Completado!"
**Cuerpo:** "Completaste: [Nombre del Módulo]"

**Acción:** Click abre dashboard de progreso

---

#### 1.4. Module Mastered (Módulo Dominado) 🎯

**ID:** `module_mastered`
**Descripción:** Usuario dominó módulo (100% con avg_score >= 90)
**Prioridad:** `high`

**Estructura de datos:**
```json
{
  "module_id": "uuid",
  "module_title": "Introducción al Maya",
  "avg_score": 95.5,
  "xp_bonus": 150,
  "ml_coins_bonus": 75,
  "badge_url": "https://..."
}
```

**Título:** "¡Maestría Alcanzada!"
**Cuerpo:** "Dominaste: [Nombre del Módulo] con 95% de promedio"

**Acción:** Click abre certificado de maestría

---

#### 1.5. Streak Milestone (Hito de Racha) 🔥

**ID:** `streak_milestone`
**Descripción:** Usuario alcanzó hito de racha (7, 30, 100 días)
**Prioridad:** `medium`

**Estructura de datos:**
```json
{
  "streak_days": 7,
  "milestone_type": "weekly",
  "xp_bonus": 50,
  "ml_coins_bonus": 25
}
```

**Título:** "¡Racha de 7 Días!"
**Cuerpo:** "Has mantenido tu racha durante 7 días consecutivos"

**Acción:** Click abre página de streaks

---

#### 1.6. Streak Broken (Racha Rota) 💔

**ID:** `streak_broken`
**Descripción:** Usuario perdió su racha por inactividad
**Prioridad:** `low`

**Estructura de datos:**
```json
{
  "streak_lost": 15,
  "last_activity": "2025-11-05T10:30:00Z"
}
```

**Título:** "Racha Perdida"
**Cuerpo:** "Perdiste tu racha de 15 días. ¡Vuelve mañana para comenzar una nueva!"

**Acción:** Click abre página de ejercicios

---

#### 1.7. Classroom Invitation (Invitación a Aula) 📚

**ID:** `classroom_invitation`
**Descripción:** Usuario fue invitado a un aula virtual
**Prioridad:** `medium`

**Estructura de datos:**
```json
{
  "classroom_id": "uuid",
  "classroom_name": "Maya 101 - Grupo A",
  "invited_by_user_id": "uuid",
  "invited_by_name": "Profesor Juan",
  "role": "student",
  "expires_at": "2025-11-10T23:59:59Z"
}
```

**Título:** "Invitación a Aula"
**Cuerpo:** "[Profesor Juan] te invitó a [Maya 101 - Grupo A]"

**Acción:** Click abre modal con botones "Aceptar" / "Rechazar"

---

#### 1.8. Friend Request (Solicitud de Amistad) 👥

**ID:** `friend_request`
**Descripción:** Otro usuario envió solicitud de amistad
**Prioridad:** `low`

**Estructura de datos:**
```json
{
  "from_user_id": "uuid",
  "from_user_name": "María García",
  "from_user_avatar": "https://...",
  "mutual_friends": 3
}
```

**Título:** "Solicitud de Amistad"
**Cuerpo:** "[María García] quiere ser tu amigo"

**Acción:** Click abre modal con botones "Aceptar" / "Rechazar"

---

#### 1.9. Team Invitation (Invitación a Equipo) 🤝

**ID:** `team_invitation`
**Descripción:** Usuario fue invitado a un equipo colaborativo
**Prioridad:** `medium`

**Estructura de datos:**
```json
{
  "team_id": "uuid",
  "team_name": "Guerreros Maya",
  "invited_by_user_id": "uuid",
  "invited_by_name": "Pedro López",
  "team_members_count": 5,
  "expires_at": "2025-11-12T23:59:59Z"
}
```

**Título:** "Invitación a Equipo"
**Cuerpo:** "[Pedro López] te invitó a unirte a [Guerreros Maya]"

**Acción:** Click abre detalles del equipo con botones "Unirse" / "Rechazar"

---

#### 1.10. ML Coins Earned (ML Coins Ganados) 💰

**ID:** `ml_coins_earned`
**Descripción:** Usuario ganó ML Coins (bonus, achievements, etc.)
**Prioridad:** `low`

**Estructura de datos:**
```json
{
  "amount": 50,
  "reason": "achievement_reward",
  "new_balance": 350
}
```

**Título:** "¡ML Coins Ganados!"
**Cuerpo:** "Ganaste 50 ML Coins. Balance actual: 350"

**Acción:** Click abre Comodin Shop

---

#### 1.11. System Announcement (Anuncio del Sistema) 📢

**ID:** `system_announcement`
**Descripción:** Anuncio importante del sistema (mantenimiento, nuevas features)
**Prioridad:** `urgent` o `high`

**Estructura de datos:**
```json
{
  "announcement_type": "maintenance",
  "scheduled_time": "2025-11-15T02:00:00Z",
  "duration_hours": 2,
  "affected_services": ["exercises", "classrooms"]
}
```

**Título:** "Mantenimiento Programado"
**Cuerpo:** "El sistema estará en mantenimiento el 15/11 de 2:00 AM a 4:00 AM"

**Acción:** Click abre página con detalles completos

---

### 2. Niveles de Prioridad (4 niveles)

#### 2.1. Urgent (Urgente) 🚨

**Uso:**
- Anuncios críticos del sistema
- Problemas de seguridad
- Mantenimiento inminente

**Visualización:**
- Badge rojo parpadeante
- Sonido de alerta
- Modal que interrumpe flujo

**Ejemplo:** "Sistema en mantenimiento en 5 minutos"

---

#### 2.2. High (Alta) ⚡

**Uso:**
- Achievements desbloqueados
- Promociones de rango
- Módulos completados
- Invitaciones a aulas (urgentes)

**Visualización:**
- Badge rojo/dorado
- Número en icono de notificaciones
- Mostrar en top de lista

**Ejemplo:** "¡Ascendiste a Nacom!"

---

#### 2.3. Medium (Media) 🔔

**Uso:**
- Streaks milestone
- Invitaciones a equipos
- Recordatorios de actividades

**Visualización:**
- Badge azul
- Número en icono
- Orden normal en lista

**Ejemplo:** "Racha de 7 días alcanzada"

---

#### 2.4. Low (Baja) 💬

**Uso:**
- ML Coins ganados (pequeñas cantidades)
- Solicitudes de amistad
- Streaks rotas
- Mensajes de ánimo

**Visualización:**
- Badge gris
- Sin sonido
- Bottom de lista

**Ejemplo:** "Ganaste 5 ML Coins"

---

### 3. Gestión de Notificaciones

#### 3.1. Marcar como Leída

**Comportamiento:**
- Click en notificación la marca como leída
- Badge de notificación desaparece
- Color de notificación cambia (gris)

**Persistencia:**
- `is_read = true` en base de datos
- Sincroniza entre dispositivos

---

#### 3.2. Marcar Todas como Leídas

**Acción:** Botón "Marcar todas como leídas"

**Efecto:**
```sql
UPDATE public.notifications
SET is_read = true
WHERE user_id = 'user-123'
    AND is_read = false;
```

---

#### 3.3. Filtrado

**Filtros disponibles:**
- Por tipo (achievements, social, system)
- Por prioridad (urgent, high, medium, low)
- Por fecha (hoy, esta semana, este mes)
- Por estado (leídas, no leídas, todas)

---

#### 3.4. Tiempo Real

**Implementación:**
- WebSocket connection para notificaciones en tiempo real
- Servidor envía evento cuando se crea notificación
- Frontend muestra notificación instantáneamente

**Eventos WebSocket:**
```typescript
socket.on('notification:new', (notification) => {
  // Mostrar toast
  // Actualizar badge count
  // Reproducir sonido (según prioridad)
});
```

---

### 4. Expiración de Notificaciones

**Reglas de retención:**
| Tipo | Retención | Razón |
|------|-----------|-------|
| **Invitaciones** | 7 días | Pierden relevancia |
| **Achievements** | Permanente | Historial importante |
| **Streaks** | 30 días | Motivación temporal |
| **ML Coins** | 30 días | Historial financiero |
| **System** | 90 días | Archivo de anuncios |

**Proceso de limpieza:**
```sql
-- Job nocturno
DELETE FROM public.notifications
WHERE created_at < NOW() - INTERVAL '30 days'
    AND type NOT IN ('achievement_unlocked', 'rank_up', 'module_completed');
```

---

## 💼 Casos de Uso

### CU-NOT-001-001: Desbloquear Achievement Genera Notificación

**Actor:** Sistema (automático)
**Trigger:** Usuario desbloquea achievement

**Flujo Principal:**

1. Usuario completa ejercicio que cumple criterio de achievement
2. Trigger `trg_achievement_unlocked` se dispara
3. Sistema crea notificación:
   ```sql
   INSERT INTO public.notifications (
       user_id, type, title, body, data, priority, is_read
   ) VALUES (
       'user-123',
       'achievement_unlocked',
       '¡Achievement Desbloqueado!',
       'Desbloqueaste: Primera Lección',
       '{"achievement_id": "uuid", "xp_reward": 50}',
       'high',
       false
   );
   ```
4. Backend emite evento WebSocket: `notification:new`
5. Frontend recibe evento y muestra toast notification
6. Badge de notificaciones incrementa contador

**Postcondiciones:**
- Notificación visible en centro de notificaciones
- Badge muestra "1" nuevo
- Toast desaparece después de 5 segundos

---

### CU-NOT-001-002: Usuario Lee Notificación

**Actor:** Estudiante
**Precondiciones:**
- Usuario tiene notificaciones no leídas

**Flujo Principal:**

1. Usuario hace click en icono de notificaciones (badge muestra "3")
2. Sistema abre panel de notificaciones
3. Sistema muestra lista de notificaciones ordenadas por:
   - Prioridad (urgent > high > medium > low)
   - Fecha (más recientes primero)
4. Usuario hace click en notificación "¡Achievement Desbloqueado!"
5. Sistema:
   - Marca notificación como leída
   - Actualiza badge: 3 → 2
   - Abre modal con detalles del achievement

**Postcondiciones:**
- Notificación marcada como leída
- Badge actualizado
- Modal abierto

---

### CU-NOT-001-003: Invitación a Aula con Aceptar/Rechazar

**Actor:** Estudiante
**Precondiciones:**
- Profesor envió invitación a aula

**Flujo Principal:**

1. Profesor invita a estudiante desde panel de aula
2. Sistema crea notificación tipo `classroom_invitation`
3. Estudiante recibe notificación en tiempo real (WebSocket)
4. Estudiante hace click en notificación
5. Sistema abre modal con:
   - Nombre del aula
   - Nombre del profesor
   - Número de estudiantes
   - Botones: "Aceptar" / "Rechazar"
6. Estudiante presiona "Aceptar"
7. Sistema:
   - Añade estudiante a `classroom_members`
   - Marca notificación como leída
   - Crea notificación para profesor: "Juan aceptó la invitación"
8. Sistema redirige a página del aula

**Postcondiciones:**
- Estudiante es miembro del aula
- Notificación marcada como leída
- Profesor notificado

---

## 🔒 Consideraciones de Seguridad

### 1. Validación de Permisos

**Problema:** Usuario podría intentar leer notificaciones de otro usuario

**Mitigación:**
```typescript
// Siempre validar ownership
async getNotifications(userId: string) {
  return await this.notificationRepo.find({
    where: { userId }, // NUNCA confiar en userId del frontend
    order: { createdAt: 'DESC' }
  });
}
```

### 2. Rate Limiting

**Prevenir spam:**
- Máximo 100 notificaciones no leídas por usuario
- Si se excede, borrar las más antiguas de prioridad `low`

---

## ✅ Criterios de Aceptación

### CA-NOT-001-001: Tipos de Notificaciones

- [ ] Sistema soporta 11 tipos de notificaciones
- [ ] Cada tipo tiene estructura de datos específica
- [ ] Cada tipo tiene título y cuerpo descriptivos

### CA-NOT-001-002: Prioridades

- [ ] Notificaciones tienen 4 niveles de prioridad
- [ ] Notificaciones se ordenan por prioridad + fecha
- [ ] Prioridad `urgent` muestra modal interrumpiendo flujo

### CA-NOT-001-003: Marcar como Leída

- [ ] Click en notificación la marca como leída
- [ ] Badge actualiza contador en tiempo real
- [ ] "Marcar todas como leídas" funciona correctamente

### CA-NOT-001-004: Tiempo Real

- [ ] Notificaciones aparecen instantáneamente vía WebSocket
- [ ] Toast notification se muestra según prioridad
- [ ] Sonido se reproduce según prioridad

---

## 🧪 Testing

### Test Case 1: Crear Notificación por Achievement

```typescript
test('Unlocking achievement creates notification', async () => {
  // Arrange
  const user = await createUser();
  const achievement = await createAchievement({ code: 'FIRST_EXERCISE' });

  // Act
  await unlockAchievement(user.id, achievement.id);

  // Assert
  const notifications = await getNotifications(user.id);
  expect(notifications).toHaveLength(1);
  expect(notifications[0].type).toBe('achievement_unlocked');
  expect(notifications[0].priority).toBe('high');
  expect(notifications[0].is_read).toBe(false);
});
```

### Test Case 2: Marcar Notificación como Leída

```typescript
test('Marking notification as read updates is_read flag', async () => {
  // Arrange
  const user = await createUser();
  const notification = await createNotification({ user_id: user.id, is_read: false });

  // Act
  await notificationService.markAsRead(notification.id, user.id);

  // Assert
  const updated = await getNotification(notification.id);
  expect(updated.is_read).toBe(true);
});
```

---

## 📊 Métricas y Análisis

### KPIs a Monitorear

| Métrica | Cálculo | Objetivo |
|---------|---------|----------|
| **Tasa de lectura** | `(leídas / total) * 100` | >70% |
| **Tiempo promedio de lectura** | Desde creación hasta lectura | <5 minutos |
| **Notificaciones por tipo** | `COUNT(*) GROUP BY type` | Identificar más comunes |
| **Tasa de interacción** | Click en acción / total | >40% |

---

## 🔗 Referencias Adicionales

- [ET-NOT-001: Implementación del Sistema](../../02-especificaciones-tecnicas/06-notificaciones/ET-NOT-001-tipos-notificaciones.md)
- [RF-GAM-001: Achievements](../02-gamificacion/RF-GAM-001-achievements.md)
- [RF-SOC-001: Aulas Virtuales](../05-caracteristicas-sociales/RF-SOC-001-aulas-virtuales.md)

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación del documento |

---

**Documento:** `docs/01-requerimientos/06-notificaciones/RF-NOT-001-tipos-notificaciones.md`
**Propósito:** Requerimientos funcionales del sistema de notificaciones
**Audiencia:** Product Owner, Developers, UX Team
