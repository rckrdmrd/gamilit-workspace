# REFERENCIA RÁPIDA: Modal de Edición de Usuario

**Fecha:** 2025-11-24
**Componente:** AdminUsersPage - UserEditModal
**Estado:** Funcional

---

## USO BÁSICO

```typescript
// 1. Importar componentes necesarios
import { UserDetailModal } from '@/apps/admin/components/users/UserDetailModal';
import { useToast } from '@shared/components/base/Toast';
import { useUserManagement } from '@/apps/admin/hooks/useUserManagement';

// 2. Setup en componente
const { updateUser } = useUserManagement();
const { showToast } = useToast();
const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

// 3. Handlers
const handleEdit = (user: SystemUser) => {
  setEditingUser(user);
  setIsModalOpen(true);
};

const handleUpdate = async (userId: string, data: any) => {
  try {
    const updateData: Partial<SystemUser> = {
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      status: data.status,
    };

    await updateUser(userId, updateData);
    showToast({ type: 'success', title: 'Usuario actualizado' });
    setIsModalOpen(false);
  } catch (err) {
    showToast({ type: 'error', title: 'Error' });
    throw err;
  }
};

// 4. Render
<UserDetailModal
  user={editingUser}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onUpdate={handleUpdate}
/>
```

---

## ENDPOINT BACKEND

```
PUT /api/v1/admin/users/:id

Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "name": "Nombre Usuario",      // full_name in frontend
  "email": "email@example.com",
  "role": "student",              // student | admin_teacher | super_admin
  "status": "active",             // active | inactive
  "organizationId": "uuid"        // opcional
}

Response 200:
{
  "id": "uuid",
  "name": "...",
  "email": "...",
  "role": "...",
  "status": "...",
  ...
}
```

---

## TIPOS

```typescript
// SystemUser (Frontend)
interface SystemUser {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'admin_teacher' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
  organizationId?: string;
  organizationName?: string;
  createdAt: string;
  lastLogin: string;
}

// User (API/Backend)
interface User {
  id: string;
  name: string;                   // ← full_name
  email: string;
  role: 'student' | 'admin_teacher' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
  organization?: string;
  organizationId?: string;
  joinDate: string;
  lastLogin?: string;
}
```

---

## HOOKS

### useUserManagement()

```typescript
const {
  users,              // SystemUser[]
  totalUsers,         // number
  loading,            // boolean
  error,              // string | null
  updateUser,         // (userId, data) => Promise<void>
  fetchUsers,         // () => Promise<void>
} = useUserManagement();

// Update user
await updateUser(userId, {
  full_name: 'Nuevo Nombre',
  email: 'nuevo@email.com',
  role: 'student',
  status: 'active',
});
```

### useToast()

```typescript
const { toasts, showToast } = useToast();

// Show success
showToast({
  type: 'success',
  title: 'Operación exitosa',
  message: 'Descripción del éxito',
  duration: 5000,  // opcional, default 5000ms
});

// Show error
showToast({
  type: 'error',
  title: 'Error',
  message: 'Descripción del error',
});

// Render
<ToastContainer toasts={toasts} position="top-right" />
```

---

## COMPONENTES

### UserDetailModal

```typescript
interface UserDetailModalProps {
  user: SystemUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (userId: string, userData: Partial<UserFormData>) => Promise<void>;
}

// UserFormData
interface UserFormData {
  full_name: string;
  email: string;
  role: SystemUser['role'];
  status: SystemUser['status'];
  organizationName?: string;
  phone?: string;
  department?: string;
  position?: string;
}
```

**Tabs del Modal:**
1. **Perfil**: Edición de datos (nombre, email, rol, estado)
2. **Actividad**: Timeline de acciones del usuario (read-only)
3. **Permisos**: Permisos por rol (read-only)

---

## TRANSFORMACIÓN DE DATOS

### Frontend → Backend

```typescript
// En updateUser() del hook
const updatePayload: any = {};
if (data.full_name) updatePayload.name = data.full_name;
if (data.email) updatePayload.email = data.email;
if (data.role) updatePayload.role = data.role;
if (data.status) updatePayload.status = data.status;
if (data.organizationId) updatePayload.organizationId = data.organizationId;

await adminAPI.updateUser(userId, updatePayload);
```

### Backend → Frontend

```typescript
// En fetchUsers() del hook
const transformedUser: SystemUser = {
  id: apiUser.id,
  full_name: apiUser.name,        // name → full_name
  email: apiUser.email,
  role: apiUser.role,
  status: apiUser.status,
  organizationId: apiUser.organizationId,
  organizationName: apiUser.organization,
  createdAt: apiUser.joinDate,
  lastLogin: apiUser.lastLogin || '',
};
```

---

## FLUJO DE ACTUALIZACIÓN

```
1. Usuario click "Editar"
   ↓
2. handleEditUser(user)
   ↓
3. setEditingUser(user) + setIsEditModalOpen(true)
   ↓
4. UserDetailModal renderiza con datos
   ↓
5. Usuario edita y click "Guardar"
   ↓
6. handleUpdateUser(userId, data)
   ↓
7. Actualización optimista en UI
   ↓
8. API Call: PUT /admin/users/:id
   ↓
   ┌─────────┬─────────┐
   │ SUCCESS │  ERROR  │
   └─────────┴─────────┘
       ↓          ↓
   Toast OK   Toast ERR
       ↓          ↓
   Modal     Rollback
   Close        UI
       ↓          ↓
   fetchUsers()  fetchUsers()
```

---

## VALIDACIÓN

### Frontend (HTML5)
- Email format validation
- Required fields
- Min length

### Backend
- Unique email
- Valid role enum
- Valid status enum
- User permissions
- Organization exists

---

## MANEJO DE ERRORES

```typescript
try {
  await updateUser(userId, data);
  // Success handling
  showToast({ type: 'success', ... });
  closeModal();
  refreshList();
} catch (err) {
  // Error handling
  showToast({
    type: 'error',
    title: 'Error al actualizar',
    message: err instanceof Error ? err.message : 'Error desconocido',
  });
  throw err; // Important: re-throw to prevent modal close
}
```

---

## TESTING

### Manual Testing
```bash
# 1. Build
cd apps/frontend
npm run build

# 2. Dev server
npm run dev

# 3. Navigate to http://localhost:5173/admin/users

# 4. Test Cases
- Click "Editar" on any user
- Verify modal opens with pre-filled data
- Edit name, email, role, status
- Click "Guardar Cambios"
- Verify success toast appears
- Verify modal closes
- Verify table updates with new data
- Try invalid email
- Verify error handling
```

### API Testing
```bash
# Test endpoint directly
curl -X PUT http://localhost:3006/api/v1/admin/users/{userId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Updated",
    "email": "updated@test.com",
    "role": "student",
    "status": "active"
  }'
```

---

## TROUBLESHOOTING

### Modal no abre
```typescript
// Verificar estados
console.log('editingUser:', editingUser);
console.log('isEditModalOpen:', isEditModalOpen);

// Verificar que user no es null
if (!editingUser) {
  console.error('User is null');
}
```

### Update no funciona
```typescript
// Verificar transformación de datos
console.log('Original data:', data);
const updateData = transformData(data);
console.log('Transformed data:', updateData);

// Verificar llamada al hook
console.log('Calling updateUser with:', userId, updateData);
```

### Toast no aparece
```typescript
// Verificar hook
const { toasts, showToast } = useToast();
console.log('Current toasts:', toasts);

// Verificar render
<ToastContainer toasts={toasts} position="top-right" />
```

### Tabla no se actualiza
```typescript
// Verificar fetchUsers después de update
try {
  await updateUser(userId, data);
  console.log('Update successful, refreshing list...');
  await fetchUsers();
  console.log('List refreshed');
} catch (err) {
  console.error('Update failed:', err);
}
```

---

## MEJORAS FUTURAS

1. **Select de Organizaciones**
   - Usar `useOrganizations()` hook
   - Reemplazar input por select
   - Enviar `organizationId` en lugar de `organizationName`

2. **Validación Avanzada**
   - Email único en tiempo real
   - Validación de formato de teléfono
   - Restricciones por rol

3. **Campos Adicionales**
   - Avatar upload
   - Bio/descripción
   - Redes sociales
   - Departamento (persistido en backend)

4. **Historial de Cambios**
   - Log de modificaciones
   - Quién cambió qué y cuándo
   - Revertir cambios

---

## ARCHIVOS CLAVE

```
apps/frontend/src/
├── apps/admin/
│   ├── pages/
│   │   └── AdminUsersPage.tsx           ← Página principal
│   ├── hooks/
│   │   └── useUserManagement.ts         ← Hook de gestión
│   ├── components/users/
│   │   └── UserDetailModal.tsx          ← Modal de edición
│   └── types/
│       └── index.ts                     ← SystemUser type
├── services/api/
│   ├── adminAPI.ts                      ← API calls
│   └── adminTypes.ts                    ← User type
├── shared/components/base/
│   └── Toast.tsx                        ← Toast component
└── config/
    └── api.config.ts                    ← API endpoints
```

---

## COMANDOS ÚTILES

```bash
# TypeScript check
npx tsc --noEmit

# Linting
npm run lint

# Build
npm run build

# Dev server
npm run dev

# Test (si existen)
npm test -- AdminUsersPage
```

---

## CONTACTO Y SOPORTE

**Implementado por:** Frontend-Agent
**Fecha:** 2025-11-24
**Versión:** 1.0.0
**Estado:** Producción

Para preguntas o issues:
1. Revisar este documento
2. Revisar IMPLEMENTATION-REPORT completo
3. Consultar código fuente en archivos listados arriba
