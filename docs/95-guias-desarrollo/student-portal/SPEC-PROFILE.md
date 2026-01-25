# SPEC-PROFILE - Student Portal Profile & Settings

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** Claude Code (Auditoría Automatizada)
**Estado:** COMPLETO

---

## 1. Vision General

El sistema de perfil permite a los estudiantes:
- Ver y editar información personal
- Configurar preferencias de notificación
- Gestionar dispositivos y seguridad
- Visualizar estadísticas avanzadas

---

## 2. Páginas Relacionadas

| Página | Archivo | Descripción | Estado |
|--------|---------|-------------|--------|
| Profile | `pages/ProfilePage.tsx` | Vista básica de perfil | Solo lectura |
| Enhanced Profile | `pages/EnhancedProfilePage.tsx` | Vista avanzada con gráficos | Parcial mock |
| Settings | `pages/SettingsPage.tsx` | Configuraciones completas | 85% funcional |
| Notification Prefs | `pages/NotificationPreferencesPage.tsx` | Preferencias de notificación | Funcional |
| Device Management | `pages/DeviceManagementSection.tsx` | Gestión de dispositivos | Funcional |
| Two Factor Auth | `pages/TwoFactorAuthPage.tsx` | Autenticación 2FA | **MOCK** |

---

## 3. Campos Editables

### 3.1 Profile Section (SettingsPage)

| Campo | Tipo | Validación | Editable |
|-------|------|-----------|----------|
| Display Name | texto | Requerido | Sí |
| Bio | textarea | Máx 200 chars | Sí |
| Avatar | imagen | <2MB, JPG/PNG/GIF | Sí |
| Email | email | RFC5322 | Sí (requiere verificación) |

### 3.2 Account Section

| Campo | Tipo | Validación |
|-------|------|-----------|
| Current Password | password | Requerido para cambiar |
| New Password | password | Mín 8 chars, mayúscula, minúscula, número, símbolo |
| Confirm Password | password | Debe coincidir |

### 3.3 Preferences Section

| Configuración | Tipo | Default |
|---------------|------|---------|
| Theme | select | light |
| Language | select | es |
| Email Notifications | checkbox | true |
| Push Notifications | checkbox | true |
| Achievement Alerts | checkbox | true |
| Friend Requests | checkbox | true |
| Guild Invites | checkbox | true |

### 3.4 Privacy Section

| Configuración | Tipo | Default |
|---------------|------|---------|
| Profile Visibility | select | public |
| Show Online Status | checkbox | true |
| Allow Friend Requests | checkbox | true |
| Show Activity | checkbox | true |

---

## 4. APIs Consumidas

### 4.1 Profile APIs

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `profileAPI.updateProfile(userId, data)` | PUT | Actualizar perfil |
| `profileAPI.uploadAvatar(userId, file)` | POST | Subir avatar |
| `profileAPI.updatePassword(userId, data)` | PUT | Cambiar contraseña |
| `profileAPI.updatePreferences(userId, data)` | PUT | Actualizar preferencias |

### 4.2 Notification Preferences APIs

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `notificationsAPI.getPreferences()` | GET | Obtener preferencias |
| `notificationsAPI.updatePreference(type, channels)` | PUT | Actualizar preferencia |

### 4.3 Device Management APIs

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `notificationsStore.fetchDevices()` | GET | Lista de dispositivos |
| `notificationsStore.updateDeviceName(id, name)` | PUT | Renombrar dispositivo |
| `notificationsStore.deleteDevice(id)` | DELETE | Eliminar dispositivo |
| `usePushNotifications.enablePushNotifications()` | POST | Registrar nuevo dispositivo |

---

## 5. Manejo de Multimedia

### 5.1 Avatar Upload

```typescript
// Validaciones
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Flujo
1. Seleccionar archivo
2. Validar tipo y tamaño
3. Preview local (FileReader)
4. Upload a servidor
5. Actualizar UI con nueva URL
```

### 5.2 Progress Tracking

- Simulated progress (0-100%) con setInterval
- Response incluye `{ avatarUrl: string }`

---

## 6. Tipos de Notificación

| Tipo | In-App | Email | Push |
|------|--------|-------|------|
| achievement_unlocked | ✓ | ✓ | ✓ |
| rank_promoted | ✓ | ✓ | ✓ |
| friend_request | ✓ | ✗ | ✓ |
| new_assignment | ✓ | ✓ | ✗ |
| exercise_feedback | ✓ | ✓ | ✗ |
| module_completed | ✓ | ✗ | ✓ |
| streak_milestone | ✓ | ✗ | ✗ |
| system_announcement | ✓ | ✓ | ✗ |

---

## 7. Device Management

### 7.1 Dispositivos Soportados

| Tipo | Icono | Descripción |
|------|-------|-------------|
| iOS | 📱 | Dispositivos Apple |
| Android | 🤖 | Dispositivos Android |
| Web | 🌐 | Navegadores web |

### 7.2 Funcionalidades

- Registrar nuevo dispositivo (Web Push API)
- Editar nombre de dispositivo
- Ver estado (Activo/Inactivo)
- Ver último uso
- Eliminar dispositivo
- Token truncado por seguridad

---

## 8. Two Factor Auth

### 8.1 Estado Actual: **MOCK**

```typescript
// Código de prueba: 123456
// mockTwoFactorVerification() - No integración real
// mockResendVerificationCode() - Sin backend
```

### 8.2 Funcionalidades Planificadas

- Verificación por código de 6 dígitos
- Soporte para SMS, Email, Authenticator App
- Backup codes
- Rate limiting

---

## 9. Gaps Conocidos

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| GAP-P0-001 | 2FA completamente MOCK | CRÍTICO | Pendiente |
| GAP-P0-005 | Email verification no implementado | CRÍTICO | Pendiente |
| GAP-P1-009 | Activity history es mock | Alta | Pendiente |
| GAP-P1-010 | OAuth (Google/GitHub) sin handlers | Alta | Pendiente |
| GAP-P2-010 | Tabla de preferencias no responsive | Baja | Pendiente |
| GAP-P2-011 | Sin fecha de desactivación de dispositivo | Baja | Pendiente |

---

## 10. Validaciones

### 10.1 Password

```typescript
const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Al menos una mayúscula')
  .regex(/[a-z]/, 'Al menos una minúscula')
  .regex(/[0-9]/, 'Al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Al menos un símbolo');
```

### 10.2 Avatar

```typescript
// Validaciones
file.type.startsWith('image/') → true
file.size < 2 * 1024 * 1024 → true
```

### 10.3 2FA Code

```typescript
const twoFactorSchema = z.object({
  code: z.string()
    .length(6, 'Debe tener 6 dígitos')
    .regex(/^\d+$/, 'Solo números')
});
```

---

## 11. Referencias

- **Auth Pages:** `AUTH-PAGES-SPEC.md`
- **Gaps:** `orchestration/analisis/GAPS-STUDENT-PORTAL.yml`
- **Hooks:** `STUDENT-HOOKS-SPEC.md`

---

*Generado: 2026-01-24*
*Sistema SIMCO v4.3.0*
