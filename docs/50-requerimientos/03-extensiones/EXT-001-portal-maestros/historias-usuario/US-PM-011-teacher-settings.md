---
id: "US-PM-011"
title: "Configuracion y Preferencias del Maestro"
type: "User Story"
status: "Done"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 8
budget: "$3,200 MXN"
sprint: "Sprint-7"
labels: ["portal-maestros", "settings", "profile", "preferences", "privacy", "teacher"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# US-PM-011: Configuracion y Preferencias del Maestro

**Epica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Fase 3 - Extensiones
**Story Points:** 8 SP
**Presupuesto:** $3,200 MXN
**Prioridad:** Media
**Estado:** Done

---

## Descripcion

Como profesor, quiero tener una pagina de configuracion completa donde pueda gestionar mi perfil, preferencias de ensenanza, notificaciones y privacidad para personalizar mi experiencia en la plataforma.

**Contexto del Alcance:**

Esta pagina proporciona un centro de configuracion integral con 4 secciones:
1. **Perfil** - Avatar, nombre, biografia, seguridad de cuenta
2. **Preferencias de Ensenanza** - Notificaciones de aula, calificacion, comunicacion
3. **Notificaciones** - Alertas de riesgo, tareas, comunicacion, metodos de entrega
4. **Privacidad** - Visibilidad del perfil, contacto, actividad

---

## Criterios de Aceptacion

### CA-01: Navegacion por Secciones
- [x] Sidebar con 4 secciones navegables
- [x] Iconos representativos por seccion
- [x] Seccion activa resaltada
- [x] Transiciones animadas entre secciones

### CA-02: Configuracion de Perfil
- [x] Avatar con opcion de subir nueva foto
- [x] Validacion de tamano (max 2MB)
- [x] Validacion de tipo (solo imagenes)
- [x] Progress bar durante subida
- [x] Campos editables:
  - Nombre a mostrar
  - Nombre y apellido
  - Biografia (max 200 caracteres)
- [x] Email solo lectura (contactar admin para cambiar)

### CA-03: Seguridad de Cuenta
- [x] Mostrar/ocultar contrasena actual
- [x] Campos para cambiar contrasena:
  - Contrasena actual
  - Nueva contrasena
  - Confirmar contrasena
- [x] Validaciones:
  - Minimo 8 caracteres
  - Contrasenas deben coincidir
- [x] Boton de cambiar contrasena solo aparece cuando hay datos

### CA-04: Preferencias de Ensenanza
- [x] Notificaciones de Aula (toggles):
  - Nuevas entregas
  - Entregas tardias
  - Preguntas de estudiantes
  - Actividad del aula
- [x] Configuracion de Calificacion:
  - Escala predeterminada (0-100, A-F, Aprobado/Desaprobado)
  - Devolver automaticamente al calificar
  - Permitir entregas tardias (con penalizacion configurable)
- [x] Preferencias de Comunicacion:
  - Permitir mensajes de estudiantes
  - Permitir mensajes de padres
  - Metodo de contacto preferido

### CA-05: Preferencias de Notificaciones
- [x] Alertas de Estudiantes en Riesgo:
  - Alertas de riesgo academico
  - Alertas de inactividad
  - Caida en rendimiento
- [x] Tareas y Entregas:
  - Nuevas entregas
  - Recordatorios de calificacion
  - Recordatorios de fechas limite
- [x] Comunicacion:
  - Mensajes de estudiantes
  - Mensajes de padres
  - Anuncios administrativos
- [x] Metodos de Entrega:
  - Email
  - Push
  - In-app
- [x] Link a configuracion avanzada de notificaciones

### CA-06: Configuracion de Privacidad
- [x] Visibilidad del perfil (Publico/Escuela/Privado)
- [x] Toggles de privacidad:
  - Mostrar informacion de contacto
  - Permitir contacto de estudiantes
  - Permitir contacto de padres
  - Mostrar actividad
- [x] Aviso de proteccion de datos

### CA-07: Guardado de Configuracion
- [x] Boton de guardar por seccion
- [x] Estados de guardado:
  - idle: normal
  - saving: spinner + "Guardando..."
  - saved: checkmark + "Guardado!"
  - error: X + "Error"
- [x] Toast de confirmacion al guardar
- [x] Auto-reset del estado despues de 2 segundos

---

## Especificaciones Tecnicas

### Frontend

**Ruta:**
```
/teacher/settings
```

**Pagina:**
- `TeacherSettingsPage.tsx` - Componente completo con todas las secciones

**Hooks Utilizados:**
```typescript
import { useAuth } from '@features/auth/hooks/useAuth';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { useUserPreferences } from '@shared/hooks/useUserPreferences';
```

**API Service:**
```typescript
import { profileAPI } from '@/services/api/teacher';

// Metodos utilizados:
profileAPI.updateProfile(userId, data)
profileAPI.updatePreferences(userId, preferences)
profileAPI.uploadAvatar(userId, file)
profileAPI.updatePassword(userId, { current_password, new_password })
```

**State Management:**
```typescript
type SettingsSection = 'profile' | 'teaching' | 'notifications' | 'privacy';

// Estados locales por seccion
const [profile, setProfile] = useState({...});
const [account, setAccount] = useState({...});
const [teachingPreferences, setTeachingPreferences] = useState({...});
const [notifications, setNotifications] = useState({...});
const [privacy, setPrivacy] = useState({...});

const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
```

### Backend

**Endpoints Utilizados:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| PUT | `/teacher/profile/:id` | Actualizar perfil basico |
| PUT | `/teacher/profile/:id/preferences` | Actualizar preferencias |
| POST | `/teacher/profile/:id/avatar` | Subir avatar |
| PUT | `/teacher/profile/:id/password` | Cambiar contrasena |

**Request de Actualizar Perfil:**
```typescript
PUT /teacher/profile/:id
{
  display_name: string;
  first_name: string;
  last_name: string;
  bio: string;
}
```

**Request de Actualizar Preferencias:**
```typescript
PUT /teacher/profile/:id/preferences
{
  email_notifications: boolean;
  notifications_enabled: boolean;
  preferences: {
    teaching: { ... };
    notifications: { ... };
    privacy: { ... };
  }
}
```

---

## Diseno UI/UX

### Layout Desktop
```
+-------------------------------------------------------------------+
|  [Avatar] Nombre Usuario                                          |
|  ML Coins | Nivel | Logros                               [Logout] |
+-------------------------------------------------------------------+
|  +----------------+  +-------------------------------------------+|
|  | [*] Perfil     |  |  CONFIGURACION DE PERFIL                 ||
|  | [ ] Ensenanza  |  |  ========================================||
|  | [ ] Notific.   |  |                                          ||
|  | [ ] Privacidad |  |  Foto de Perfil                          ||
|  |                |  |  [Avatar] [Camara]                       ||
|  |                |  |  Sube una nueva foto (max 2MB)           ||
|  |                |  |                                          ||
|  |                |  |  Nombre a Mostrar                        ||
|  |                |  |  [Prof. Garcia____________]              ||
|  |                |  |                                          ||
|  |                |  |  Nombre          Apellido                ||
|  |                |  |  [Juan]          [Garcia]                ||
|  |                |  |                                          ||
|  |                |  |  Biografia (0/200)                       ||
|  |                |  |  [Profesor de matematicas con 10 anos...||
|  |                |  |                                          ||
|  |                |  |  ================================        ||
|  |                |  |  SEGURIDAD DE CUENTA                     ||
|  |                |  |  Email: juan@escuela.edu (no editable)   ||
|  |                |  |  Contrasena actual: [******] [ojo]       ||
|  |                |  |  Nueva:     [______]  Confirmar: [______]||
|  |                |  |                                          ||
|  |                |  |  [Guardar Cambios]                       ||
|  +----------------+  +-------------------------------------------+|
+-------------------------------------------------------------------+
```

### Seccion de Preferencias de Ensenanza
```
+-------------------------------------------------------------------+
|  PREFERENCIAS DE ENSENANZA                                        |
+-------------------------------------------------------------------+
|  [Bell] NOTIFICACIONES DE AULA                                    |
|  +---------------------------------------------------------------+|
|  | [x] Nuevas Entregas                                           ||
|  |     Notificarme cuando un estudiante entregue una tarea       ||
|  | [x] Entregas Tardias                                          ||
|  |     Alertas de tareas entregadas despues de la fecha limite   ||
|  +---------------------------------------------------------------+|
|                                                                    |
|  [Clipboard] CONFIGURACION DE CALIFICACION                        |
|  Escala predeterminada: [0-100 (Puntos) v]                       |
|  [x] Devolver tareas automaticamente al calificar                |
|  [x] Permitir entregas tardias                                    |
|      Penalizacion: [10]%                                          |
+-------------------------------------------------------------------+
```

---

## Dependencias

### Dependencias de User Stories:
- US-PM-000 (Dashboard Maestro) - Navegacion
- EP001 (Auth System) - JWT auth y role='teacher'

### Dependencias de Backend:
- Sistema de perfiles de usuario
- Almacenamiento de preferencias (JSONB)
- Upload de avatares

---

## Estimacion de Esfuerzo

**Backend:** 3 SP
- Endpoints de perfil y preferencias
- Upload de avatar
- Cambio de contrasena seguro

**Frontend:** 4 SP
- Navegacion por secciones
- 4 formularios con validaciones
- Estados de guardado
- Upload de avatar con preview

**Testing:** 1 SP

**Total:** 8 SP = $3,200 MXN

---

## Notas de Implementacion

- Pagina implementada: `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/apps/teacher/pages/TeacherSettingsPage.tsx`
- Utiliza componentes Framer Motion para animaciones
- Link a configuracion avanzada de notificaciones: `/teacher/settings/notifications`
- API service en `@/services/api/teacher/profileAPI`

---

**Ultima actualizacion:** 2026-01-20
**Version:** 1.0
**Estado:** Done - Implementado
