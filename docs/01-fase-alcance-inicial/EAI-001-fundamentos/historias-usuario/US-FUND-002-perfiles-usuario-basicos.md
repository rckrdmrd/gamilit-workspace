# US-FUND-002: Perfiles de usuario básicos

**Épica:** EAI-001 - Fundamentos
**Sprint:** Mes 1, Semana 1-2
**Story Points:** 5 SP
**Presupuesto:** $1,800 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **usuario registrado**, quiero **ver y editar mi perfil básico** para **mantener mi información actualizada en la plataforma**.

**Contexto del Alcance Inicial:**
El MVP incluye perfiles de usuario muy básicos con información esencial (nombre, email, foto). No incluye personalización avanzada como preferencias de gamificación, estadísticas detalladas o configuraciones de privacidad, que se agregarán en extensiones futuras.

---

## Criterios de Aceptación

- [ ] **CA-01:** El usuario puede ver su perfil con: nombre completo, email, rol, foto de perfil
- [ ] **CA-02:** El usuario puede editar: firstName, lastName, foto de perfil
- [ ] **CA-03:** El email NO es editable (requeriría re-verificación)
- [ ] **CA-04:** La foto de perfil puede subirse (max 5MB, formatos: jpg, png, webp)
- [ ] **CA-05:** Si no hay foto, se muestra avatar por defecto (iniciales del nombre)
- [ ] **CA-06:** Los cambios se guardan en la base de datos
- [ ] **CA-07:** Se muestra mensaje de confirmación al guardar cambios
- [ ] **CA-08:** Se valida que firstName y lastName no estén vacíos
- [ ] **CA-09:** La foto se redimensiona automáticamente a 200x200px

---

## Especificaciones Técnicas

### Backend (NestJS)

**Endpoints:**
```
GET /api/users/profile
- Headers: Authorization: Bearer {token}
- Response: { user: { id, email, firstName, lastName, role, photoUrl, createdAt } }

PATCH /api/users/profile
- Headers: Authorization: Bearer {token}
- Body: { firstName?, lastName? }
- Response: { user: { ... } }

POST /api/users/profile/photo
- Headers: Authorization: Bearer {token}, Content-Type: multipart/form-data
- Body: FormData with 'photo' file
- Response: { photoUrl: string }

DELETE /api/users/profile/photo
- Headers: Authorization: Bearer {token}
- Response: { message: "Photo deleted" }
```

**Servicios:**
- **UsersService:** CRUD de usuarios
- **FileUploadService:** Manejo de uploads de imágenes
- **ImageProcessingService:** Redimensionamiento de imágenes

**Entidades:**
```typescript
@Entity('users')
class User {
  // ... campos de US-FUND-001
  photoUrl?: string
  photoKey?: string // Para S3 o storage local
}
```

**Validaciones:**
- DTOs con class-validator
- File upload: max size 5MB, tipos permitidos
- Sanitización de nombres (trim, evitar caracteres especiales)

### Frontend (React + Vite)

**Componentes:**
```typescript
- ProfileView.tsx: Vista de perfil (solo lectura)
- ProfileEditForm.tsx: Formulario de edición
- PhotoUpload.tsx: Componente de upload de foto
- AvatarPlaceholder.tsx: Avatar con iniciales
```

**Rutas:**
- `/profile` - Vista de perfil
- `/profile/edit` - Editar perfil

**Estado (Zustand):**
```typescript
interface ProfileStore {
  profile: User | null
  loading: boolean
  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  uploadPhoto: (file: File) => Promise<void>
  deletePhoto: () => Promise<void>
}
```

**UI/UX:**
- Card con información del usuario
- Botón "Editar perfil"
- Upload drag-and-drop para foto
- Preview de foto antes de guardar
- Loading states durante operaciones

### Almacenamiento de Archivos

**Opción Inicial (Alcance MVP):**
- Archivos guardados localmente en `/uploads/profile-photos/`
- Nombres generados con UUID para evitar colisiones
- Public URL: `/static/profile-photos/{photoKey}`

**Opción Futura:**
- Migración a AWS S3 o similar (EXT-Infrastructure)

---

## Dependencias

**Antes:**
- US-FUND-001 (Autenticación - requiere usuario autenticado)

**Después:**
- US-FUND-003 (Dashboard - muestra foto de perfil)
- Múltiples historias usan la foto de perfil del usuario

---

## Definición de Hecho (DoD)

- [x] Endpoints implementados y documentados
- [x] Validaciones en backend
- [x] Upload de archivos funcional
- [x] Redimensionamiento de imágenes
- [x] Componentes de frontend implementados
- [x] Tests unitarios (>80% coverage)
- [x] Tests E2E para edición de perfil
- [x] Responsive design
- [x] Manejo de errores (file too large, invalid format)

---

## Notas del Alcance Inicial

- ✅ Solo campos básicos: nombre, foto
- ✅ Sin estadísticas de usuario en perfil
- ✅ Sin configuraciones avanzadas (tema, notificaciones)
- ✅ Sin campo "bio" o "descripción"
- ✅ Sin badges o insignias en perfil (se muestran en dashboard)
- ✅ Storage local (no S3)
- ⚠️ **Extensión futura:** EXT-003-Profiles (bio, social links, preferencias)
- ⚠️ **Extensión futura:** EXT-004-Infrastructure (migrar a S3)

---

## Tareas de Implementación

### Backend (Estimado: 10h, Real: 10.5h)

**Total Backend:** 10.5h (~2.6 SP)

- [x] **Tarea B.1:** Endpoints de perfil - Estimado: 4h, Real: 4h
  - [x] Subtarea B.1.1: GET /users/profile con JWT guard - 1h
  - [x] Subtarea B.1.2: PATCH /users/profile con validación de DTO - 1.5h
  - [x] Subtarea B.1.3: Prevenir edición de email con validación - 0.5h
  - [x] Subtarea B.1.4: Documentación Swagger de endpoints - 1h

- [x] **Tarea B.2:** Sistema de upload de archivos - Estimado: 4h, Real: 4.5h
  - [x] Subtarea B.2.1: Configurar Multer para file upload - 1h
  - [x] Subtarea B.2.2: POST /users/profile/photo con validación (5MB, jpg/png/webp) - 1.5h
  - [x] Subtarea B.2.3: DELETE /users/profile/photo - 0.5h
  - [x] Subtarea B.2.4: FileUploadService con generación de nombres únicos - 1h
  - [x] Subtarea B.2.5: Configuración de carpeta /uploads/profile-photos/ - 0.5h

- [x] **Tarea B.3:** Procesamiento de imágenes - Estimado: 2h, Real: 2h
  - [x] Subtarea B.3.1: Instalar y configurar Sharp - 0.5h
  - [x] Subtarea B.3.2: ImageProcessingService con redimensionamiento a 200x200 - 1h
  - [x] Subtarea B.3.3: Mantener aspect ratio y optimización de calidad - 0.5h

### Frontend (Estimado: 6h, Real: 6.5h)

**Total Frontend:** 6.5h (~1.6 SP)

- [x] **Tarea F.1:** Componentes de perfil - Estimado: 4h, Real: 4.5h
  - [x] Subtarea F.1.1: Componente ProfileView (vista de solo lectura) - 1h
  - [x] Subtarea F.1.2: Componente ProfileEditForm con validación - 1.5h
  - [x] Subtarea F.1.3: Componente AvatarPlaceholder con iniciales - 0.5h
  - [x] Subtarea F.1.4: Páginas /profile y /profile/edit - 1h
  - [x] Subtarea F.1.5: Navegación entre vista y edición - 0.5h

- [x] **Tarea F.2:** Upload de foto de perfil - Estimado: 2h, Real: 2h
  - [x] Subtarea F.2.1: Componente PhotoUpload con drag & drop (react-dropzone) - 1h
  - [x] Subtarea F.2.2: Preview de imagen antes de guardar - 0.5h
  - [x] Subtarea F.2.3: ProfileStore en Zustand con métodos upload/delete - 0.5h

### Testing (Estimado: 3h, Real: 2.5h)

**Total Testing:** 2.5h (~0.6 SP)

- [x] **Tarea T.1:** Tests unitarios backend - Estimado: 1.5h, Real: 1h
  - [x] Subtarea T.1.1: Tests de UsersService (fetch, update) - 0.5h
  - [x] Subtarea T.1.2: Tests de FileUploadService (validación tamaño/tipo) - 0.25h
  - [x] Subtarea T.1.3: Tests de ImageProcessingService (resize) - 0.25h

- [x] **Tarea T.2:** Tests E2E - Estimado: 1h, Real: 1h
  - [x] Subtarea T.2.1: Tests de endpoints GET/PATCH profile - 0.5h
  - [x] Subtarea T.2.2: Tests de upload de foto (success y errores) - 0.5h

- [x] **Tarea T.3:** Tests frontend - Estimado: 0.5h, Real: 0.5h
  - [x] Subtarea T.3.1: Tests de ProfileEditForm - 0.25h
  - [x] Subtarea T.3.2: Tests de PhotoUpload - 0.25h

### Deployment (Estimado: 1h, Real: 0.5h)

**Total Deployment:** 0.5h (~0.1 SP)

- [x] **Tarea D.1:** Configuración de storage - Estimado: 0.5h, Real: 0.25h
  - [x] Subtarea D.1.1: Crear directorio /uploads en servidor - 0.1h
  - [x] Subtarea D.1.2: Configurar permisos de escritura - 0.15h

- [x] **Tarea D.2:** Deploy y validación - Estimado: 0.5h, Real: 0.25h
  - [x] Subtarea D.2.1: Deploy a staging - 0.15h
  - [x] Subtarea D.2.2: Smoke tests de upload de foto - 0.1h

---

## Resumen de Horas

| Categoría | Estimado | Real | Variación |
|-----------|----------|------|-----------|
| Backend | 10h | 10.5h | +5% |
| Frontend | 6h | 6.5h | +8.3% |
| Testing | 3h | 2.5h | -16.7% |
| Deployment | 1h | 0.5h | -50% |
| **TOTAL** | **20h** | **20h** | **0%** |

**Validación:** 5 SP × 4h/SP = 20 horas estimadas ✅

---

## Cronograma Real

**Sprint:** Sprint 1-2 (05-16 Agosto 2024)
**Fecha Inicio Real:** 07 Agosto 2024
**Fecha Fin Real:** 09 Agosto 2024
**Estado:** ✅ Completada
**Notas:** La implementación se completó en tiempo gracias a la reutilización de componentes de UI base. El sistema de upload con Sharp funcionó perfectamente. Los tiempos de testing fueron menores debido a la simplicidad del CRUD.

---

## Testing

### Tests Unitarios
```typescript
describe('UsersService', () => {
  it('should fetch user profile')
  it('should update firstName and lastName')
  it('should not update email')
  it('should handle photo upload')
  it('should delete photo and revert to default')
})

describe('FileUploadService', () => {
  it('should validate file size')
  it('should validate file type')
  it('should generate unique filename')
})

describe('ImageProcessingService', () => {
  it('should resize image to 200x200')
  it('should maintain aspect ratio')
})
```

### Tests E2E
```typescript
describe('Profile API', () => {
  it('GET /users/profile - returns user data')
  it('PATCH /users/profile - updates fields')
  it('PATCH /users/profile - rejects email change')
  it('POST /users/profile/photo - uploads photo')
  it('POST /users/profile/photo - rejects large files')
  it('DELETE /users/profile/photo - removes photo')
})
```

### Tests Frontend
```typescript
describe('ProfileEditForm', () => {
  it('renders current user data')
  it('submits updated data on save')
  it('shows validation errors')
  it('handles photo upload')
  it('previews photo before upload')
})
```

---

## Estimación

**Desglose de Esfuerzo (5 SP = ~2 días):**
- Backend endpoints + validations: 0.5 días
- File upload + processing: 0.75 días
- Frontend components: 0.5 días
- Photo upload UI: 0.5 días
- Testing: 0.5 días
- Ajustes: 0.25 días

**Riesgos:**
- File upload puede tener edge cases (conexión lenta, archivos corruptos)
- Redimensionamiento de imágenes puede requerir librería adicional

---

## Recursos Externos

**Librerías:**
- Backend: `multer` (file upload), `sharp` (image processing)
- Frontend: `react-dropzone` (drag & drop upload)

---

**Creado:** 2025-11-02
**Actualizado:** 2025-11-02
**Responsable:** Equipo Fullstack
