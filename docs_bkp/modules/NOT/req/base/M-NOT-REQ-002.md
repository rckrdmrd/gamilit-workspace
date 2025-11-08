
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: RF-NOT-002 -->
<!-- ID Nuevo: M-NOT-REQ-002 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-NOT-REQ-002: Preferencias de Notificaciones

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-NOT-002 |
| **Módulo** | 06 - Notificaciones |
| **Título** | Preferencias de Notificaciones y Control del Usuario |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Database Team, Product Team |
| **Stakeholders** | Product Owner, UX Team, Backend Team, Compliance Team |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **Tablas:**
- **`public.notification_preferences`**
  - **Ubicación:** `apps/database/ddl/schemas/public/tables/notification_preferences.sql:1-40`
  - **Propósito:** Preferencias de notificación por usuario y tipo
  - **Columnas clave:**
    - `user_id` (UUID, FK a auth.users)
    - `notification_type` (ENUM notification_type)
    - `enabled` (BOOLEAN, default TRUE)
    - `channels` (JSONB, e.g. `{"in_app": true, "email": false, "push": true}`)
    - `quiet_hours_start`, `quiet_hours_end` (TIME)

🗄️ **Funciones:**
- **`public.should_send_notification()`**
  - **Ubicación:** `apps/database/ddl/schemas/public/functions/should_send_notification.sql:1-35`
  - **Propósito:** Verifica si se debe enviar una notificación según preferencias del usuario

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-NOT-002: Implementación de Preferencias de Notificaciones](../../02-especificaciones-tecnicas/06-notificaciones/ET-NOT-002-preferencias-notificaciones.md)

### Documentos Relacionados

- [RF-NOT-001: Tipos de Notificaciones](./RF-NOT-001-tipos-notificaciones.md) - Tipos de notificaciones configurables
- [RF-AUTH-001: Sistema de Roles](../01-autenticacion-autorizacion/RF-AUTH-001-roles.md) - Control de acceso
- [MAPEO: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#módulo-6-notificaciones)

---

## 📖 Descripción General

### Propósito

El **Sistema de Preferencias de Notificaciones** permite a los usuarios controlar:
- **Qué notificaciones** reciben (por tipo)
- **Por qué canales** las reciben (in-app, email, push, SMS)
- **Cuándo** las reciben (horarios de "no molestar")
- **Con qué frecuencia** (inmediato, resumen diario, resumen semanal)

### Principios de Diseño

**1. Opt-out, not opt-in:**
- Por defecto, todas las notificaciones están **habilitadas**
- Usuario puede desactivar las que no desea
- **Excepción:** Push notifications y SMS requieren opt-in explícito

**2. Granularidad:**
- Control por tipo de notificación (achievement_unlocked, rank_up, etc.)
- Control por canal (in-app, email, push, SMS)
- NO todo-o-nada

**3. Respeto:**
- Horarios de "no molestar" (quiet hours)
- Prioridad "urgent" ignora quiet hours (solo para notificaciones críticas)
- Frecuencia de resumen (batching)

**4. Compliance:**
- COPPA: Menores de 13 años requieren consentimiento parental para email/push
- GDPR: Derecho a controlar comunicaciones
- CAN-SPAM: Fácil de desuscribirse de emails

---

## ⚙️ Requerimientos Funcionales

### 1. Preferencias Globales

#### 1.1 Habilitar/Deshabilitar Todos los Canales

**Controles:**
- ☑️ **In-App Notifications** (ON/OFF)
- ☑️ **Email Notifications** (ON/OFF)
- ☑️ **Push Notifications** (ON/OFF, requiere permission del browser/OS)
- ☐ **SMS Notifications** (OFF por defecto, futuro)

**Comportamiento:**
```typescript
interface GlobalPreferences {
  in_app_enabled: boolean;      // Default: true
  email_enabled: boolean;        // Default: true
  push_enabled: boolean;         // Default: false (requires opt-in)
  sms_enabled: boolean;          // Default: false (future, requires opt-in)
}
```

**Si un canal está deshabilitado globalmente:**
- No se envían notificaciones por ese canal, independientemente de preferencias individuales

---

### 2. Preferencias por Tipo de Notificación

#### 2.1 Configuración Granular

**Cada tipo de notificación puede configurarse independientemente:**

| Tipo de Notificación | In-App | Email | Push | SMS | Default |
|----------------------|--------|-------|------|-----|---------|
| `achievement_unlocked` | ✅ | ✅ | ☑️ | ☐ | In-App + Email |
| `rank_up` | ✅ | ✅ | ☑️ | ☐ | In-App + Email + Push |
| `module_completed` | ✅ | ✅ | ☐ | ☐ | In-App + Email |
| `exercise_evaluated` | ✅ | ☐ | ☐ | ☐ | In-App only |
| `classroom_invitation` | ✅ | ✅ | ☑️ | ☐ | In-App + Email |
| `assignment_due_soon` | ✅ | ✅ | ✅ | ☐ | All channels |
| `streak_reminder` | ✅ | ☑️ | ☑️ | ☐ | In-App + Push |
| `friend_request` | ✅ | ☐ | ☑️ | ☐ | In-App |
| `comment_on_exercise` | ✅ | ☐ | ☐ | ☐ | In-App only |
| `teacher_feedback` | ✅ | ✅ | ☑️ | ☐ | In-App + Email |
| `system_announcement` | ✅ | ✅ | ☐ | ☐ | In-App + Email |

✅ = Habilitado por defecto
☑️ = Deshabilitado por defecto, usuario puede habilitar
☐ = No disponible

**Estructura de datos:**
```json
{
  "notification_type": "achievement_unlocked",
  "enabled": true,
  "channels": {
    "in_app": true,
    "email": true,
    "push": false,
    "sms": false
  }
}
```

---

### 3. Horarios de "No Molestar" (Quiet Hours)

#### 3.1 Configuración de Horarios

**Permite configurar ventana horaria donde NO se envían notificaciones (excepto urgentes):**

```typescript
interface QuietHours {
  enabled: boolean;
  start_time: string;  // e.g., "22:00" (10 PM)
  end_time: string;    // e.g., "08:00" (8 AM)
  timezone: string;    // e.g., "America/Guatemala"
  applies_to: string[]; // e.g., ["email", "push", "sms"]
}
```

**Ejemplo:**
```json
{
  "enabled": true,
  "start_time": "22:00",
  "end_time": "08:00",
  "timezone": "America/Guatemala",
  "applies_to": ["email", "push", "sms"]
}
```

**Comportamiento:**
- In-app notifications **NO** se afectan (usuario las ve cuando abre la app)
- Email, Push, SMS **se posponen** hasta que terminen quiet hours
- Notificaciones **urgent** ignoran quiet hours (ej: emergencia del sistema)

#### 3.2 Días Específicos

**Opcional: Configurar quiet hours solo ciertos días:**
```json
{
  "enabled": true,
  "start_time": "22:00",
  "end_time": "08:00",
  "days_of_week": [0, 6],  // 0 = Domingo, 6 = Sábado (solo fines de semana)
  "timezone": "America/Guatemala"
}
```

---

### 4. Frecuencia y Batching

#### 4.1 Modos de Entrega

**Permite agrupar notificaciones para evitar spam:**

| Modo | Descripción | Canales Aplicables |
|------|-------------|-------------------|
| **Inmediato** | Enviar notificación de inmediato | In-App, Push |
| **Resumen Diario** | Agrupar y enviar 1 vez al día (ej: 9 AM) | Email |
| **Resumen Semanal** | Agrupar y enviar 1 vez por semana (ej: Lunes 9 AM) | Email |
| **Deshabilitado** | No enviar notificaciones | Todos |

**Configuración por canal:**
```typescript
interface DeliveryFrequency {
  in_app: 'immediate' | 'disabled';
  email: 'immediate' | 'daily_digest' | 'weekly_digest' | 'disabled';
  push: 'immediate' | 'disabled';
  sms: 'immediate' | 'disabled';
}
```

**Ejemplo:**
```json
{
  "in_app": "immediate",
  "email": "daily_digest",
  "push": "immediate"
}
```

#### 4.2 Horario de Resúmenes

**Configurar a qué hora se envían los resúmenes:**
```json
{
  "daily_digest_time": "09:00",
  "weekly_digest_day": "monday",
  "weekly_digest_time": "09:00",
  "timezone": "America/Guatemala"
}
```

---

### 5. Preferencias Especiales

#### 5.1 Notificaciones de Actividad Propia

**Algunos usuarios no quieren notificaciones de sus propias acciones:**

```json
{
  "notify_own_actions": false
}
```

**Ejemplo:**
- Usuario completa módulo → NO recibe notificación "Module completed" (él ya lo sabe)
- Usuario desbloquea achievement → SÍ recibe notificación (es recompensa)

#### 5.2 Notificaciones de Comparación Social

**COPPA/Privacy: Permitir a estudiantes desactivar comparaciones:**

```json
{
  "allow_social_comparisons": false
}
```

**Afecta notificaciones como:**
- "You're now #1 in your class!"
- "Your friend Juan just passed you in XP"

---

### 6. Defaults Inteligentes por Rol

#### 6.1 Estudiantes (role: student)

**Defaults:**
```json
{
  "achievement_unlocked": {"in_app": true, "email": true, "push": false},
  "rank_up": {"in_app": true, "email": true, "push": false},
  "module_completed": {"in_app": true, "email": true, "push": false},
  "streak_reminder": {"in_app": true, "email": false, "push": false},
  "teacher_feedback": {"in_app": true, "email": true, "push": false}
}
```

**Quiet hours:** 22:00 - 08:00 (default)

#### 6.2 Maestros (role: admin_teacher)

**Defaults:**
```json
{
  "student_at_risk": {"in_app": true, "email": true, "push": true},
  "assignment_submitted": {"in_app": true, "email": false, "push": false},
  "classroom_invitation": {"in_app": true, "email": true, "push": false}
}
```

**Quiet hours:** 20:00 - 07:00 (default)

#### 6.3 Administradores (role: super_admin)

**Defaults:**
```json
{
  "system_error": {"in_app": true, "email": true, "push": true, "sms": true},
  "security_alert": {"in_app": true, "email": true, "push": true, "sms": true},
  "problematic_content_detected": {"in_app": true, "email": true, "push": false}
}
```

**Quiet hours:** Deshabilitadas (admins deben estar disponibles 24/7)

---

## 💼 Casos de Uso

### CU-NOT-002-01: Estudiante Configura Preferencias

**Actor:** Estudiante

**Precondiciones:**
- Estudiante autenticado

**Flujo Principal:**
1. Estudiante navega a "Configuración" → "Notificaciones"
2. Sistema carga preferencias actuales (o defaults si es primera vez)
3. Estudiante ve pantalla con 3 secciones:
   - **Preferencias Globales:**
     - ☑️ In-App Notifications (ON)
     - ☑️ Email Notifications (ON)
     - ☐ Push Notifications (OFF)
   - **Preferencias Detalladas:** (Tabla expandible)
     - Achievement Unlocked: In-App ✅, Email ✅, Push ☐
     - Rank Up: In-App ✅, Email ✅, Push ☐
     - ... (11 tipos)
   - **Horarios de No Molestar:**
     - ☑️ Habilitado
     - Desde: 22:00, Hasta: 08:00
     - Aplicar a: Email, Push
4. Estudiante realiza cambios:
   - Desactiva "Email Notifications" globalmente
   - Activa "Streak Reminder" para push
   - Cambia quiet hours a 23:00 - 07:00
5. Hace clic en "Guardar Preferencias"
6. Sistema valida y guarda en `public.notification_preferences`
7. Sistema muestra mensaje: "✅ Preferencias guardadas exitosamente"

**Resultado:**
- Preferencias almacenadas en DB
- Futuros envíos de notificaciones respetan las nuevas preferencias

---

### CU-NOT-002-02: Sistema Verifica Preferencias Antes de Enviar

**Actor:** Sistema (automatizado)

**Trigger:** Usuario desbloquea achievement

**Flujo Principal:**
1. Trigger `trg_after_achievement_unlocked` se ejecuta
2. Función `public.create_notification()` es llamada con:
   ```json
   {
     "user_id": "uuid-estudiante",
     "type": "achievement_unlocked",
     "title": "🏆 Achievement Desbloqueado",
     "body": "Has desbloqueado 'Maestro del Vocabulario'",
     "data": {"achievement_id": "uuid"}
   }
   ```
3. Función `public.should_send_notification()` verifica:
   ```sql
   SELECT should_send_notification(
     p_user_id := 'uuid-estudiante',
     p_notification_type := 'achievement_unlocked',
     p_channel := 'email'
   );
   ```
4. Función verifica:
   - ✅ Email habilitado globalmente
   - ✅ `achievement_unlocked` habilitado para email
   - ✅ No estamos en quiet hours (10 AM)
   - ✅ Frecuencia es "immediate" (no digest)
5. Retorna `TRUE` → **Enviar notificación por email**
6. Repite pasos 3-5 para "push" → Retorna `FALSE` (push deshabilitado)
7. Notificación se envía solo por **in-app** y **email**

**Resultado:**
- Notificación respeta preferencias del usuario
- No se envía spam por canales deshabilitados

---

### CU-NOT-002-03: Padre/Tutor Configura Preferencias de Menor

**Actor:** Padre/Tutor

**Precondiciones:**
- Estudiante es menor de 13 años
- Padre tiene cuenta vinculada (parental control)

**Flujo Principal:**
1. Padre navega a "Mi Hijo" → "Configuración" → "Notificaciones"
2. Sistema muestra advertencia:
   ```
   ⚠️ COPPA Compliance:
   Como tutor de un menor, tienes control sobre qué notificaciones recibe.
   Los emails y push notifications requieren tu autorización explícita.
   ```
3. Padre ve preferencias con restricciones:
   - In-App: ✅ Siempre habilitado (no se puede desactivar)
   - Email: ☐ Deshabilitado (requiere autorización)
   - Push: ☐ Deshabilitado (requiere autorización)
4. Padre autoriza emails:
   - Hace clic en "Autorizar Email Notifications"
   - Sistema pide confirmación: "He leído y acepto la Política de Privacidad"
   - Padre confirma
5. Sistema actualiza preferencias:
   ```json
   {
     "email_enabled": true,
     "email_authorized_by_parent": true,
     "parent_authorization_date": "2025-11-07T10:30:00Z"
   }
   ```
6. Padre configura tipos de notificaciones permitidas
7. Guardar cambios

**Resultado:**
- Menor puede recibir emails (con autorización parental)
- Sistema cumple con COPPA
- Log de auditoría registra autorización

---

## 🎨 Interfaz de Usuario

### Pantalla: Preferencias de Notificaciones

```
┌────────────────────────────────────────────────┐
│ ⚙️ Configuración de Notificaciones             │
└────────────────────────────────────────────────┘

┌─ Preferencias Globales ────────────────────────┐
│                                                │
│ Canales Habilitados:                           │
│   ☑️ Notificaciones In-App                     │
│   ☑️ Notificaciones por Email                  │
│   ☐ Notificaciones Push (Requiere permiso)    │
│       [Solicitar Permiso]                      │
│                                                │
└────────────────────────────────────────────────┘

┌─ Horarios de No Molestar ──────────────────────┐
│                                                │
│   ☑️ Habilitado                                │
│                                                │
│   Desde: [22:00 ▼]  Hasta: [08:00 ▼]          │
│                                                │
│   Aplicar a:                                   │
│     ☑️ Email   ☑️ Push   ☐ SMS                │
│                                                │
└────────────────────────────────────────────────┘

┌─ Preferencias Detalladas ──────────────────────┐
│                                                │
│ Mostrar opciones avanzadas ▼                   │
│                                                │
│ ┌─ Gamificación ───────────────────────────┐  │
│ │                                          │  │
│ │ 🏆 Achievement Desbloqueado              │  │
│ │    In-App: ☑️  Email: ☑️  Push: ☐        │  │
│ │                                          │  │
│ │ 📊 Promoción de Rango                    │  │
│ │    In-App: ☑️  Email: ☑️  Push: ☐        │  │
│ │                                          │  │
│ └──────────────────────────────────────────┘  │
│                                                │
│ ┌─ Progreso Académico ──────────────────────┐  │
│ │                                          │  │
│ │ ✅ Módulo Completado                     │  │
│ │    In-App: ☑️  Email: ☑️  Push: ☐        │  │
│ │                                          │  │
│ │ 📝 Ejercicio Evaluado                    │  │
│ │    In-App: ☑️  Email: ☐  Push: ☐         │  │
│ │                                          │  │
│ └──────────────────────────────────────────┘  │
│                                                │
│ ... (más categorías)                           │
│                                                │
└────────────────────────────────────────────────┘

┌─ Frecuencia de Entrega ────────────────────────┐
│                                                │
│ Email:  ◉ Inmediato                            │
│         ○ Resumen Diario (9:00 AM)             │
│         ○ Resumen Semanal (Lunes 9:00 AM)      │
│         ○ Deshabilitado                        │
│                                                │
└────────────────────────────────────────────────┘

            [Cancelar]  [Guardar Preferencias]
```

---

## ✅ Criterios de Aceptación

### Para Usuarios
- [ ] Puede habilitar/deshabilitar canales de notificación globalmente
- [ ] Puede configurar preferencias por tipo de notificación
- [ ] Puede configurar horarios de "no molestar"
- [ ] Puede elegir frecuencia de entrega (inmediato, resumen diario, semanal)
- [ ] Cambios se aplican inmediatamente a nuevas notificaciones
- [ ] Interfaz clara y fácil de entender

### Para Sistema
- [ ] Verifica preferencias antes de enviar cualquier notificación
- [ ] Respeta quiet hours (excepto notificaciones urgent)
- [ ] Agrupa notificaciones en resúmenes según configuración
- [ ] Defaults inteligentes por rol
- [ ] Audita cambios de preferencias

### Para Compliance
- [ ] COPPA: Menores de 13 requieren autorización parental para email/push
- [ ] GDPR: Usuario puede desactivar todas las notificaciones
- [ ] CAN-SPAM: Emails incluyen link de "Unsubscribe"
- [ ] Cambios de preferencias se registran en audit log

---

## 🔒 Seguridad y Privacidad

### Row Level Security (RLS)

```sql
-- Usuarios solo pueden ver/editar sus propias preferencias
CREATE POLICY notification_preferences_own
ON public.notification_preferences
FOR ALL
USING (user_id = auth.uid());

-- Padres pueden ver/editar preferencias de hijos (COPPA)
CREATE POLICY notification_preferences_parental
ON public.notification_preferences
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth_management.parental_controls pc
    WHERE pc.parent_user_id = auth.uid()
      AND pc.child_user_id = notification_preferences.user_id
      AND pc.status = 'active'
  )
);
```

### Validaciones

- Email/push para menores de 13 años requiere `parent_authorization = TRUE`
- Push notifications requieren token de dispositivo válido
- Quiet hours: `start_time` y `end_time` deben ser TIME válidos
- Timezone debe ser de lista IANA (ej: "America/Guatemala")

---

## 📈 Métricas y Analytics

**Trackear para entender comportamiento:**
- % de usuarios que cambian preferencias (default vs custom)
- Tipos de notificaciones más desactivadas
- % de usuarios con quiet hours habilitados
- Frecuencia de entrega más popular (immediate vs digest)
- Tasa de opt-out por tipo de notificación

**Dashboard para Product:**
```
Adoption de Preferencias:
- 65% usan defaults
- 25% personalizaron preferencias
- 10% desactivaron todos los emails

Tipos Más Desactivados:
1. comment_on_exercise (45% deshabilitado)
2. friend_request (30% deshabilitado)
3. exercise_evaluated (25% deshabilitado)

Quiet Hours:
- 42% habilitado
- Promedio: 22:30 - 07:45
```

---

## 📅 Historial

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-07 | Creación inicial del documento |

---

**Documento:** `docs/01-requerimientos/06-notificaciones/RF-NOT-002-preferencias-notificaciones.md`
**Propósito:** Definir requerimientos funcionales para preferencias de notificaciones y control del usuario
