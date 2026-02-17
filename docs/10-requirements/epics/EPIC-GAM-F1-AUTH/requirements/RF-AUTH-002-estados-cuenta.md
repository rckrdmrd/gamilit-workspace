---
id: "RF-AUTH-002"
title: "Estados de Cuenta de Usuario"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Autenticacion y Autorizacion"
epic: "EAI-001"
version: "1.0"
labels: ["auth", "user-status", "account-lifecycle"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# RF-AUTH-002: Estados de Cuenta de Usuario

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-AUTH-002 |
| **Módulo** | Autenticación y Autorización |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha creación** | 2025-11-07 |
| **Última actualización** | 2025-11-07 |

## 🔗 Referencias

### Especificación Técnica
📐 [ET-AUTH-002: Gestión de Estados de Cuenta](../specifications/ET-AUTH-002-estados-cuenta.md)

### Implementación DDL
🗄️ **ENUM Canónico:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:34-36`
- **Tipo:** `auth_management.user_status`
- **Valores:** `active`, `inactive`, `suspended`, `banned`, `pending`

🗄️ **Tablas que usan el ENUM:**
1. `auth_management.profiles` → `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql:17`
   - Columna: `status auth_management.user_status NOT NULL DEFAULT 'pending'`

🗄️ **Funciones:**
- `auth_management.verify_user_status()` → Valida que usuario puede acceder
- `auth_management.suspend_user()` → Admin suspende usuario
- `auth_management.ban_user()` → Admin banea usuario permanentemente
- `auth_management.reactivate_user()` → Reactiva usuario inactive/suspended

🗄️ **Triggers:**
- `trg_profiles_status_change` → Audita cambios de estado en `audit_logs`

### Backend
💻 **Implementación:**
- **Enum:** `apps/backend/src/modules/auth/enums/user-status.enum.ts`
- **Middleware:** `apps/backend/src/modules/auth/middleware/user-status.middleware.ts`
- **Service:** `apps/backend/src/modules/auth/services/user-management.service.ts`
- **DTOs:** `apps/backend/src/modules/auth/dto/update-user-status.dto.ts`

### Frontend
🎨 **Componentes:**
- **Types:** `apps/frontend/src/types/auth.types.ts` (interface `UserProfile`)
- **Componentes:**
  - `apps/frontend/src/components/ui/UserStatusBadge.tsx`
  - `apps/frontend/src/components/admin/UserManagementPanel.tsx`
  - `apps/frontend/src/components/admin/SuspendUserModal.tsx`

### Mapeo Completo
📊 [Ver mapeo completo: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-requirements-IMPLEMENTACION.md#12-estados-de-cuenta-de-usuario)

---

## 📝 Descripción del Requerimiento

### Contexto

Las cuentas de usuario requieren gestión de su ciclo de vida completo, desde el registro inicial hasta posibles situaciones de suspensión o baneo. Esta gestión es crítica para:
- Seguridad del sistema (suspender cuentas comprometidas)
- Cumplimiento de políticas (banear usuarios que violan términos)
- Experiencia de usuario (permitir desactivación temporal voluntaria)
- Verificación de email (estado pendiente hasta confirmación)

### Necesidad del Negocio

**Problema:**
Sin un sistema de estados bien definido:
- No se puede verificar email antes de dar acceso completo
- No hay manera de suspender temporalmente cuentas problemáticas
- Usuarios no pueden desactivar su cuenta voluntariamente
- No hay diferenciación entre suspensión reversible y baneo permanente

**Solución:**
Implementar un sistema de 5 estados que modela el ciclo de vida completo de una cuenta, con transiciones controladas y auditadas.

---

## 🎯 Requerimiento Funcional

### RF-AUTH-002.1: Estados Disponibles

El sistema **DEBE** soportar exactamente 5 estados de cuenta:

#### 1. Pendiente (`pending`)
**Descripción:** Cuenta recién creada, email no verificado

**Características:**
- Estado inicial al registrarse
- Usuario no puede acceder al sistema
- Se envía email de verificación automáticamente
- Expira después de 7 días si no se verifica

**Acceso Permitido:**
- ❌ Dashboard principal
- ❌ Ejercicios
- ✅ Página de verificación de email
- ✅ Reenviar email de verificación

**Transiciones:**
- → `active`: Al verificar email
- → (eliminación automática): Después de 7 días sin verificar

---

#### 2. Activo (`active`)
**Descripción:** Cuenta verificada, acceso completo al sistema

**Características:**
- Email verificado exitosamente
- Acceso completo según rol asignado
- Puede participar en todas las funcionalidades

**Acceso Permitido:**
- ✅ Todo el sistema según rol

**Transiciones:**
- → `inactive`: Usuario desactiva su propia cuenta
- → `suspended`: Admin suspende la cuenta
- → `banned`: Admin banea la cuenta

---

#### 3. Inactivo (`inactive`)
**Descripción:** Usuario desactivó temporalmente su cuenta

**Características:**
- Desactivación voluntaria por el usuario
- Datos conservados intactos
- Reversible por el propio usuario en cualquier momento
- No recibe notificaciones

**Acceso Permitido:**
- ❌ Dashboard y funcionalidades principales
- ✅ Página de reactivación de cuenta
- ✅ Descargar datos personales (GDPR compliance)

**Transiciones:**
- → `active`: Usuario reactiva su cuenta
- → (eliminación voluntaria): Usuario solicita eliminación de cuenta

---

#### 4. Suspendido (`suspended`)
**Descripción:** Admin suspendió la cuenta (reversible)

**Características:**
- Suspensión por admin debido a comportamiento inapropiado
- **REVERSIBLE** (diferencia clave con `banned`)
- Requiere revisión de admin para levantar suspensión
- Usuario recibe notificación con razón de suspensión

**Acceso Permitido:**
- ❌ Todo el sistema
- ✅ Ver notificación de suspensión con razón
- ✅ Contactar soporte

**Restricciones:**
- No puede iniciar sesión
- No recibe notificaciones del sistema
- No aparece en búsquedas de usuarios

**Transiciones:**
- → `active`: Admin levanta suspensión
- → `banned`: Admin decide hacer baneo permanente

**Duración:**
- Típicamente: 7-30 días
- Requiere revisión periódica por admins

---

#### 5. Baneado (`banned`)
**Descripción:** Admin baneó la cuenta **permanentemente**

**Características:**
- Baneo por violación grave de términos de servicio
- **IRREVERSIBLE** (no hay transición de vuelta)
- Email y username quedan bloqueados
- Datos se conservan por auditoría pero cuenta inaccesible

**Acceso Permitido:**
- ❌ Todo el sistema
- ✅ Ver notificación de baneo con razón

**Restricciones:**
- No puede iniciar sesión
- No puede crear nueva cuenta con mismo email
- Username queda reservado permanentemente

**Razones Comunes:**
- Suplantación de identidad
- Acoso a otros usuarios
- Actividad fraudulenta
- Violación reiterada de políticas

---

### RF-AUTH-002.2: Flujo de Estados

```
┌──────────────┐
│   REGISTRO   │
└──────┬───────┘
       │
       ▼
   pending ──(verificar email)──> active
       │                            │
       │                            ├──(usuario desactiva)──> inactive
       │                            │                            │
       │                            │                            └──(reactiva)──> active
       │                            │
       │                            ├──(admin suspende)──> suspended
       │                            │                         │
       │                            │                         ├──(admin levanta)──> active
       │                            │                         └──(admin decide)──> banned
       │                            │
       └────(7 días)───> ∅          └──(admin banea)──> banned
        (eliminación)                                       │
                                                            └──(permanente)──> ∅
```

---

### RF-AUTH-002.3: Reglas de Transición

#### Transiciones Permitidas

| Estado Actual | Puede Transicionar A | Quién Puede Hacerlo | Requiere |
|---------------|---------------------|---------------------|----------|
| `pending` | `active` | Usuario | Verificar email |
| `pending` | ∅ (eliminación) | Sistema | 7 días sin verificar |
| `active` | `inactive` | Usuario | Confirmación |
| `active` | `suspended` | super_admin | Razón documentada |
| `active` | `banned` | super_admin | Razón grave documentada |
| `inactive` | `active` | Usuario | Click en reactivar |
| `suspended` | `active` | super_admin | Revisión completada |
| `suspended` | `banned` | super_admin | Decisión justificada |
| `banned` | ∅ | N/A | Irreversible |

#### Transiciones Prohibidas

- ❌ `pending` → `suspended` (no tiene sentido suspender cuenta no verificada)
- ❌ `pending` → `banned` (no tiene sentido banear cuenta no verificada)
- ❌ `inactive` → `suspended` (usuario ya desactivó voluntariamente)
- ❌ `suspended` → `inactive` (confusión de estados)
- ❌ `banned` → cualquier otro (irreversible)

---

### RF-AUTH-002.4: Validación de Estado

El sistema **DEBE** validar estado en:

1. **Login:**
```typescript
// Bloquear login si status != 'active'
if (user.status !== 'active') {
  throw new UnauthorizedException(
    `Cuenta ${user.status}. ${getStatusMessage(user.status)}`
  );
}
```

2. **Middleware en cada request:**
```typescript
// UserStatusMiddleware valida en cada request autenticado
if (user.status !== 'active') {
  throw new ForbiddenException('Cuenta inactiva');
}
```

3. **Frontend (validación temprana):**
```typescript
// Redirigir según estado
if (user.status === 'pending') {
  navigate('/verify-email');
} else if (user.status === 'suspended') {
  navigate('/account-suspended');
} else if (user.status === 'banned') {
  navigate('/account-banned');
}
```

---

## 📊 Casos de Uso

### UC-AUTH-003: Usuario verifica email tras registro
**Actor:** Estudiante (nuevo usuario)
**Precondiciones:** Usuario registrado, status = `pending`

**Flujo:**
1. Usuario recibe email de verificación
2. Usuario hace click en link de verificación
3. Sistema valida token de verificación
4. Sistema actualiza `profiles.status` de `pending` → `active`
5. Sistema audita cambio en `audit_logs`
6. Sistema envía email de bienvenida
7. Usuario redirigido a dashboard

**Resultado:** Usuario con status `active` puede acceder al sistema

**Variantes:**
- Token expirado (>24h): Sistema reenvía nuevo email
- Token inválido: Mostrar error, ofrecer reenvío

---

### UC-ADMIN-002: Admin suspende cuenta de usuario
**Actor:** Super Admin
**Precondiciones:** Usuario con status `active`, comportamiento inapropiado detectado

**Flujo:**
1. Admin navega a panel de gestión de usuarios
2. Admin selecciona usuario a suspender
3. Sistema muestra modal de suspensión
4. Admin ingresa:
   - Razón de suspensión (texto obligatorio)
   - Duración sugerida (7, 14, 30 días, indefinido)
   - Evidencia (opcional: screenshots, reportes)
5. Admin confirma suspensión
6. Sistema actualiza `profiles.status` de `active` → `suspended`
7. Sistema registra en `audit_logs`:
   ```json
   {
     "action": "update",
     "resource_type": "user_status",
     "resource_id": "user_id",
     "details": {
       "old_status": "active",
       "new_status": "suspended",
       "reason": "Acoso a otros usuarios",
       "evidence": ["screenshot_url"],
       "suspended_by": "admin_id",
       "review_date": "2025-11-14"
     }
   }
   ```
8. Sistema envía notificación al usuario con razón
9. Sistema cierra todas las sesiones activas del usuario

**Resultado:** Usuario suspendido no puede acceder, admin puede revisar suspensión

---

### UC-AUTH-004: Usuario desactiva su propia cuenta
**Actor:** Estudiante
**Precondiciones:** Usuario con status `active`

**Flujo:**
1. Usuario navega a Configuración → Cuenta
2. Usuario hace click en "Desactivar mi cuenta"
3. Sistema muestra modal de confirmación:
   - Explica que es temporal
   - Datos no se eliminan
   - Puede reactivar en cualquier momento
4. Usuario confirma ingresando password
5. Sistema valida password
6. Sistema actualiza `profiles.status` de `active` → `inactive`
7. Sistema audita cambio
8. Sistema envía email de confirmación
9. Sistema cierra sesión del usuario

**Resultado:** Cuenta desactivada temporalmente

**Reactivación:**
1. Usuario intenta hacer login
2. Sistema detecta status = `inactive`
3. Sistema muestra botón "Reactivar cuenta"
4. Usuario hace click
5. Sistema actualiza status a `active`
6. Usuario accede normalmente

---

## 🔐 Consideraciones de Seguridad

### 1. Prevención de Bypass

**Problema:** Usuario suspendido podría intentar acceder vía API directamente

**Solución:**
```typescript
// Middleware en CADA request autenticado
@Injectable()
export class UserStatusMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const user = req.user;

    // Excepciones: endpoints de reactivación
    const allowedPaths = ['/auth/reactivate', '/auth/status'];
    if (allowedPaths.includes(req.path)) {
      return next();
    }

    // Bloquear si no es active
    if (user.status !== 'active') {
      throw new ForbiddenException(
        `Account is ${user.status}. Access denied.`
      );
    }

    next();
  }
}
```

### 2. Auditoría Obligatoria

Todo cambio de estado **DEBE** ser auditado:
```sql
-- Trigger automático
CREATE TRIGGER trg_audit_status_change
    AFTER UPDATE OF status ON auth_management.profiles
    FOR EACH ROW
    EXECUTE FUNCTION audit_logging.log_status_change();
```

### 3. Rate Limiting en Reactivación

Prevenir abuso de reactivación/desactivación:
```typescript
// Máximo 3 reactivaciones por día
const reactivations = await getReactivationCount(userId, 'today');
if (reactivations >= 3) {
  throw new TooManyRequestsException(
    'Maximum reactivations reached for today'
  );
}
```

### 4. Notificación Obligatoria

Usuario **DEBE** ser notificado de cualquier cambio de estado no iniciado por él:
```typescript
if (oldStatus !== newStatus && changedBy !== userId) {
  await notificationService.send({
    userId,
    type: 'system_announcement',
    priority: 'high',
    title: `Account status changed to ${newStatus}`,
    body: reason,
  });
}
```

---

## ✅ Criterios de Aceptación

### AC-001: ENUM Implementado
- [x] ENUM `user_status` existe con 5 valores
- [x] Columna `profiles.status` usa el ENUM
- [x] Default es `'pending'`

### AC-002: Transiciones Validadas
- [x] Solo transiciones permitidas pueden ejecutarse
- [x] Transiciones prohibidas lanzan exception
- [x] Trigger audita todos los cambios

### AC-003: Middleware Activo
- [x] `UserStatusMiddleware` valida en cada request
- [x] Excepciones configuradas para paths específicos
- [x] Frontend redirige según status

### AC-004: Notificaciones Enviadas
- [x] Usuario recibe notificación al cambiar status
- [x] Email enviado con razón y próximos pasos
- [x] Notificación visible en UI

### AC-005: Admin Panel Funcional
- [x] Admin puede suspender/banear usuarios
- [x] Razón obligatoria al suspender/banear
- [x] Historial de cambios visible
- [x] Admin puede levantar suspensión

### AC-006: Usuario Puede Desactivar
- [x] Botón "Desactivar cuenta" en configuración
- [x] Modal de confirmación con password
- [x] Reactivación simple desde login

---

## 🧪 Testing

### Test Case 1: Usuario pending no puede acceder
```typescript
test('Pending user cannot access protected endpoints', async () => {
  const user = await createUser({ status: 'pending' });
  const token = await getAuthToken(user);

  const response = await request(app.getHttpServer())
    .get('/dashboard')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(403);
  expect(response.body.message).toContain('pending');
});
```

### Test Case 2: Admin puede suspender usuario
```typescript
test('Admin can suspend user with reason', async () => {
  const admin = await createUser({ role: 'super_admin' });
  const user = await createUser({ status: 'active' });

  await loginAs(admin);
  const response = await api.post(`/admin/users/${user.id}/suspend`, {
    reason: 'Inappropriate behavior',
    duration: 14,
  });

  expect(response.status).toBe(200);

  const updatedUser = await getUser(user.id);
  expect(updatedUser.status).toBe('suspended');

  // Verificar auditoría
  const auditLog = await getLatestAuditLog(user.id, 'user_status');
  expect(auditLog.details.reason).toBe('Inappropriate behavior');
});
```

### Test Case 3: Usuario puede desactivar y reactivar
```typescript
test('User can deactivate and reactivate account', async () => {
  const user = await createUser({ status: 'active' });
  await loginAs(user);

  // Desactivar
  const deactivateResponse = await api.post('/auth/deactivate', {
    password: user.password,
  });
  expect(deactivateResponse.status).toBe(200);

  let updatedUser = await getUser(user.id);
  expect(updatedUser.status).toBe('inactive');

  // Reactivar
  const reactivateResponse = await api.post('/auth/reactivate');
  expect(reactivateResponse.status).toBe(200);

  updatedUser = await getUser(user.id);
  expect(updatedUser.status).toBe('active');
});
```

### Test Case 4: Banned user cannot login
```typescript
test('Banned user cannot login', async () => {
  const user = await createUser({ status: 'banned' });

  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: user.email, password: user.password });

  expect(response.status).toBe(401);
  expect(response.body.message).toContain('banned');
});
```

---

## 📚 Referencias Adicionales

### Documentos Relacionados
- 📄 [RF-AUTH-001: Sistema de Roles](./RF-AUTH-001-roles.md) - Estados interactúan con roles
- 📄 [RF-NOT-001: Tipos de Notificaciones](../../EPIC-GAM-F3-NOTIFICATIONS/requirements/RF-NOT-001a-websocket-infrastructure.md) - Notificaciones de cambio de estado
- 📄 [RF-AUD-001: Registro de Acciones](../../EPIC-GAM-F3-ADMIN-EXTENDED/specifications/ET-ADM-005-audit-logs.md) - Auditoría de cambios

### Regulaciones
- [GDPR Article 17: Right to Erasure](https://gdpr-info.eu/art-17-gdpr/) - Derecho al olvido
- [GDPR Article 20: Right to Data Portability](https://gdpr-info.eu/art-20-gdpr/) - Exportar datos

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación inicial del requerimiento |

---

**Documento:** `docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md`
**Ruta relativa desde docs/:** `01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md`
