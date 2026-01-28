---
id: "ET-PERF-002"
title: "Perfil de Maestro - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P1"
epic: "EXT-004"
module: "teacher-profile"
labels: ["profile", "teacher", "settings", "preferences"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-PERF-002"]
related_us: ["US-PERF-001"]
---

# ET-PERF-002: Perfil de Maestro - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-PERF-002 |
| **Epic** | EXT-004 - Perfiles Extendidos |
| **RF Relacionado** | RF-PERF-002 (Teacher Profile) |
| **US Relacionadas** | US-PERF-001, US-PM-011 |
| **Prioridad** | P1 - Alta |
| **Estado** | Implementado |

---

## Descripcion Tecnica

El sistema de perfil de maestro permite la gestion de informacion personal, configuracion de preferencias de la plataforma, y personalizacion de la experiencia docente. Incluye:

1. **Informacion Personal**: Nombre, email, avatar, bio
2. **Preferencias de Notificaciones**: Email, push, in-app
3. **Configuracion de Interfaz**: Tema, idioma, densidad
4. **Seguridad**: Cambio de contrasena, sesiones activas

---

## Componentes Frontend

### Pagina Principal

| Componente | Path | Descripcion |
|------------|------|-------------|
| `TeacherSettingsPage` | `apps/frontend/src/apps/teacher/pages/TeacherSettingsPage.tsx` | Pagina de configuracion del maestro |
| `TeacherLayout` | `apps/frontend/src/apps/teacher/layouts/TeacherLayout.tsx` | Layout base del portal maestro |

### Secciones de Configuracion

| Componente | Path | Descripcion |
|------------|------|-------------|
| `ProfileSection` | `apps/frontend/src/apps/teacher/components/settings/ProfileSection.tsx` | Seccion de perfil personal |
| `NotificationsSection` | `apps/frontend/src/apps/teacher/components/settings/NotificationsSection.tsx` | Preferencias de notificaciones |
| `AppearanceSection` | `apps/frontend/src/apps/teacher/components/settings/AppearanceSection.tsx` | Tema y apariencia |
| `SecuritySection` | `apps/frontend/src/apps/teacher/components/settings/SecuritySection.tsx` | Seguridad de cuenta |

### Componentes Compartidos

| Componente | Path | Descripcion |
|------------|------|-------------|
| `AvatarUpload` | `apps/frontend/src/shared/components/AvatarUpload.tsx` | Upload de avatar |
| `DetectiveCard` | `apps/frontend/src/shared/components/base/DetectiveCard.tsx` | Card para secciones |
| `DetectiveButton` | `apps/frontend/src/shared/components/base/DetectiveButton.tsx` | Botones estilizados |
| `Toast` | `apps/frontend/src/shared/components/base/Toast.tsx` | Notificaciones de feedback |

### Hooks

| Hook | Path | Descripcion |
|------|------|-------------|
| `useAuth` | `apps/frontend/src/features/auth/hooks/useAuth.ts` | Datos del usuario autenticado |
| `useUserGamification` | `apps/frontend/src/shared/hooks/useUserGamification.ts` | Datos de gamificacion |
| `useToast` | `apps/frontend/src/shared/components/base/Toast.tsx` | Sistema de notificaciones |

---

## Servicios Backend

### Servicios Principales

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `ProfileService` | `apps/backend/src/modules/profile/services/profile.service.ts` | Gestion de perfiles |

### Metodos Relevantes

```typescript
class ProfileService {
  // Obtener perfil del maestro
  async getProfile(userId: string): Promise<Profile>;

  // Actualizar informacion de perfil
  async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<Profile>;

  // Actualizar avatar
  async uploadAvatar(userId: string, avatarUrl: string): Promise<Profile>;
}
```

### Controladores

| Controlador | Path | Descripcion |
|-------------|------|-------------|
| `ProfileController` | `apps/backend/src/modules/profile/controllers/profile.controller.ts` | Endpoints de perfil |
| `TeacherController` | `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` | Endpoints de maestro |

---

## Tablas/Schemas de Base de Datos

### Schema: `auth_management`

| Tabla | Descripcion | Campos Clave |
|-------|-------------|--------------|
| `profiles` | Perfiles de usuarios | id, user_id, display_name, avatar_url, bio |
| `users` | Usuarios del sistema | id, email, role, organization_id |

### Schema: `notification_system`

| Tabla | Descripcion | Campos Clave |
|-------|-------------|--------------|
| `notification_preferences` | Preferencias de notificacion | user_id, channel, enabled |

### Campos de Preferencias

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `user_id` | UUID | FK a users |
| `email_enabled` | BOOLEAN | Notificaciones por email |
| `push_enabled` | BOOLEAN | Notificaciones push |
| `in_app_enabled` | BOOLEAN | Notificaciones in-app |
| `quiet_hours_start` | TIME | Inicio de horas silenciosas |
| `quiet_hours_end` | TIME | Fin de horas silenciosas |
| `weekly_digest` | BOOLEAN | Resumen semanal |

---

## APIs Endpoints

### Perfil del Maestro

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/profile/:userId` | GET | Obtener perfil |
| `/api/v1/profile/:userId` | PUT | Actualizar perfil |
| `/api/v1/profile/:userId/avatar` | POST | Subir avatar |

### Preferencias

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/settings/notifications` | GET | Obtener preferencias de notificacion |
| `/api/v1/settings/notifications` | PUT | Actualizar preferencias |
| `/api/v1/settings/appearance` | GET | Obtener configuracion de apariencia |
| `/api/v1/settings/appearance` | PUT | Actualizar apariencia |

### Seguridad

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/auth/change-password` | POST | Cambiar contrasena |
| `/api/v1/auth/sessions` | GET | Listar sesiones activas |
| `/api/v1/auth/sessions/:id` | DELETE | Cerrar sesion especifica |

### Response: GET /api/v1/profile/:userId

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "display_name": "Prof. Maria",
  "full_name": "Maria Garcia Lopez",
  "email": "maria.garcia@school.edu",
  "avatar_url": "https://storage.example.com/avatars/teacher.jpg",
  "bio": "Profesora de primaria con 10 anos de experiencia",
  "organization": {
    "id": "uuid",
    "name": "Escuela Primaria Central"
  },
  "role": "teacher",
  "last_activity_at": "2026-01-27T10:00:00Z"
}
```

---

## Flujos de Usuario

### Flujo 1: Acceder a Configuracion

```
1. Maestro navega a /teacher/settings
2. TeacherLayout verifica rol (teacher/admin_teacher)
3. TeacherSettingsPage carga datos del perfil
4. Se muestran secciones colapsables para cada categoria
5. Usuario expande seccion deseada
```

### Flujo 2: Actualizar Perfil

```
1. Maestro edita campo (nombre, bio, etc.)
2. Validacion en tiempo real de inputs
3. Click en "Guardar cambios"
4. API PUT /api/v1/profile/:userId
5. Toast de confirmacion "Perfil actualizado"
6. Datos actualizados en UI
```

### Flujo 3: Cambiar Avatar

```
1. Click en avatar actual o boton "Cambiar"
2. AvatarUpload abre selector de archivos
3. Validacion: JPG/PNG, max 2MB
4. Preview del nuevo avatar
5. Confirmacion de upload
6. ProfileService.uploadAvatar() actualiza URL
7. Avatar nuevo visible en header y perfil
```

### Flujo 4: Configurar Notificaciones

```
1. Expandir seccion "Notificaciones"
2. Toggles para cada tipo de notificacion
3. Cambios guardados automaticamente (auto-save)
4. Toast de confirmacion
5. Configurar horas silenciosas con time pickers
```

---

## Dependencias

### Dependencias de Modulos

- `AuthModule` - Autenticacion y cambio de contrasena
- `ProfileModule` - Gestion de perfiles
- `NotificationsModule` - Preferencias de notificaciones

### Dependencias de User Stories

- Depende de: `EAI-001` (Sistema de autenticacion)
- Habilita: `US-PM-012`, `US-PM-013` (Centro de notificaciones)

---

## Criterios de Aceptacion

### CA-01: Edicion de Perfil
- [x] Campos editables: nombre, display name, bio
- [x] Validacion de longitud de bio (max 500)
- [x] Guardado con feedback visual
- [x] Mensajes de error descriptivos

### CA-02: Avatar de Maestro
- [x] Upload de imagen personalizada
- [x] Validacion de formato y tamano
- [x] Preview antes de guardar
- [x] Fallback a avatar por defecto

### CA-03: Preferencias de Notificaciones
- [x] Toggles para email, push, in-app
- [x] Configuracion de horas silenciosas
- [x] Auto-guardado de cambios
- [x] Persistencia entre sesiones

### CA-04: Tema y Apariencia
- [x] Selector de tema (claro/oscuro/auto)
- [x] Selector de idioma
- [x] Aplicacion inmediata de cambios
- [x] Persistencia en localStorage/DB

### CA-05: Seguridad
- [x] Cambio de contrasena con validacion
- [x] Requiere contrasena actual
- [x] Visualizacion de sesiones activas
- [x] Cierre de sesiones remotas

### CA-06: Responsive
- [x] Layout adaptable a todos los tamanos
- [x] Secciones colapsables en mobile
- [x] Touch-friendly controls

---

## Notas de Implementacion

### Auto-Save para Preferencias

```typescript
// Implementacion de auto-save con debounce
const debouncedSave = useMemo(
  () => debounce((preferences) => {
    savePreferences(preferences);
    showToast({ type: 'success', message: 'Preferencias guardadas' });
  }, 1000),
  []
);
```

### Validaciones

```typescript
// Validacion de bio
if (updateData.bio && updateData.bio.length > 500) {
  throw new BadRequestException('Bio cannot exceed 500 characters');
}
```

### Temas

```typescript
interface AppearancePreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  language: 'es' | 'en';
  density: 'compact' | 'comfortable' | 'spacious';
}
```

---

## Referencias

- US-PM-011: Teacher Settings
- Profile Entity: `apps/backend/src/modules/auth/entities/profile.entity.ts`
- ET-TCH-001: Dashboard Maestro

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
