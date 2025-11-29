# HU-EP010-10: Crear Usuarios desde Admin

## Información General

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-010 |
| **Épica** | EXT-002 - Admin Extendido |
| **Título** | Crear Nuevos Usuarios (Students/Teachers) desde Admin |
| **Prioridad** | Alta (P1) |
| **Story Points** | 13 SP |
| **Estado** | ⏳ ESPECIFICADO |
| **Sprint** | Sprint TBD |
| **Duración Estimada** | 3 días |
| **Origen** | GAP-C01 (Análisis Portal Students 2025-11-29) |

---

## Historia de Usuario

**Como** super admin del sistema GAMILIT
**Quiero** crear nuevos usuarios (estudiantes y profesores) directamente desde el panel de administración
**Para** facilitar el onboarding de usuarios sin depender del proceso de auto-registro, permitir importación masiva, y tener control completo sobre la creación de cuentas

---

## Contexto del Problema

### Situación Actual
- AdminUsersPage tiene botón "Crear Usuario" marcado como `COMING SOON`
- No existe formulario de creación de usuarios
- No existe importación masiva de usuarios
- Admin solo puede GESTIONAR usuarios existentes, no CREAR nuevos

### Impacto del Gap
- Instituciones no pueden hacer onboarding masivo de estudiantes
- Dependencia del auto-registro que puede ser lento o generar errores
- No hay control centralizado de creación de cuentas
- Imposible pre-registrar usuarios antes del inicio de ciclo escolar

---

## Endpoints API Requeridos (4 endpoints)

```yaml
1. POST /api/admin/users
   Descripción: Crear un nuevo usuario
   Body:
     - email: string (required, valid email)
     - full_name: string (required, 2-100 chars)
     - role: 'student' | 'admin_teacher' (required)
     - organization_id: UUID (required)
     - classroom_id: UUID (opcional, solo para students)
     - send_welcome_email: boolean (default: true)
     - temporary_password: string (opcional, auto-generado si no se provee)
   Response: CreatedUser
   Validaciones:
     - Email único en el sistema
     - Organización debe existir y estar activa
     - Classroom (si se provee) debe pertenecer a la organización

2. POST /api/admin/users/bulk
   Descripción: Crear múltiples usuarios desde CSV/JSON
   Body:
     - users: Array<CreateUserDTO> (max 500)
     - organization_id: UUID (default para todos)
     - send_welcome_emails: boolean
   Response: BulkCreateResult
     - created: number
     - failed: number
     - errors: Array<{row: number, email: string, error: string}>

3. POST /api/admin/users/import/validate
   Descripción: Validar archivo CSV antes de importar
   Body: FormData con archivo CSV
   Response: ValidationResult
     - valid_rows: number
     - invalid_rows: number
     - errors: Array<{row: number, errors: string[]}>
     - preview: Array<UserPreview> (primeros 10)

4. GET /api/admin/users/import/template
   Descripción: Descargar template CSV para importación
   Response: File (CSV template)
```

**Middleware:** `authenticateJWT` → `requireSuperAdmin` → `adminRateLimit` → `auditAdminAction`
**Rate Limit:** 10 req/min para crear, 5 req/min para bulk

---

## Tipos TypeScript

```typescript
// DTOs de creación
interface CreateUserDTO {
  email: string;
  full_name: string;
  role: 'student' | 'admin_teacher';
  organization_id: string;
  classroom_id?: string;
  send_welcome_email?: boolean;
  temporary_password?: string;
}

interface CreatedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
  organization_name: string;
  classroom_id?: string;
  classroom_name?: string;
  status: 'pending' | 'active';
  created_at: string;
  welcome_email_sent: boolean;
  temporary_password?: string; // Solo se retorna si no se envió email
}

interface BulkCreateResult {
  total: number;
  created: number;
  failed: number;
  results: Array<{
    row: number;
    email: string;
    status: 'created' | 'failed';
    user_id?: string;
    error?: string;
  }>;
}

interface ImportValidationResult {
  is_valid: boolean;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_emails: string[];
  errors: Array<{
    row: number;
    column: string;
    value: string;
    error: string;
  }>;
  preview: UserPreview[];
}
```

---

## Criterios de Aceptación

### Funcionales

| # | Criterio | Prioridad |
|---|----------|-----------|
| 1 | Modal de creación con formulario completo | P0 |
| 2 | Validación de email único en tiempo real | P0 |
| 3 | Selector de organización con búsqueda | P0 |
| 4 | Selector de classroom filtrado por organización | P1 |
| 5 | Opción de enviar email de bienvenida | P0 |
| 6 | Opción de mostrar contraseña temporal | P0 |
| 7 | Generación automática de contraseña segura | P0 |
| 8 | Botón de importación masiva desde CSV | P1 |
| 9 | Validación de CSV antes de importar | P1 |
| 10 | Preview de datos a importar | P1 |
| 11 | Reporte de errores detallado en importación | P1 |
| 12 | Descarga de template CSV | P1 |

### No Funcionales

| # | Criterio |
|---|----------|
| 1 | Bulk import máximo 500 usuarios por operación |
| 2 | Rate limit: 10 req/min individual, 5 req/min bulk |
| 3 | Contraseña temporal: 12+ chars, mixed case, numbers, symbols |
| 4 | Email de bienvenida incluye link de activación válido 48h |
| 5 | Audit log registra cada creación con datos básicos |

---

## Componentes Frontend Requeridos

```
apps/frontend/src/apps/admin/
├── components/
│   └── users/
│       ├── CreateUserModal.tsx              # Modal principal
│       ├── CreateUserForm.tsx               # Formulario de creación
│       ├── BulkImportDialog.tsx             # Dialog importación
│       ├── ImportPreview.tsx                # Preview antes de importar
│       ├── ImportResults.tsx                # Resultados post-import
│       └── OrganizationSelector.tsx         # Selector con búsqueda
└── hooks/
    └── useUserManagement.ts                  # MODIFICAR - agregar createUser, bulkCreate
```

---

## Backend - Archivos a Crear/Modificar

```
apps/backend/src/modules/admin/
├── controllers/
│   └── admin-users.controller.ts             # MODIFICAR - agregar endpoints
├── services/
│   └── admin-users.service.ts                # MODIFICAR - agregar lógica
├── dto/
│   └── users/
│       ├── create-user.dto.ts                # CREAR
│       ├── bulk-create-users.dto.ts          # CREAR
│       └── import-validation.dto.ts          # CREAR
└── templates/
    └── user-import-template.csv              # CREAR - template
```

---

## Validaciones de Negocio

### Creación Individual
1. Email debe ser único en todo el sistema
2. Organización debe existir y tener status='active'
3. Si role='student' y se provee classroom:
   - Classroom debe existir
   - Classroom debe pertenecer a la organización
   - Classroom debe estar activo
4. Contraseña (si se provee) debe cumplir política:
   - Mínimo 8 caracteres
   - Al menos 1 mayúscula, 1 minúscula, 1 número

### Importación Masiva
1. CSV debe tener headers: email, full_name, role, classroom_code (opcional)
2. Emails duplicados en el archivo se rechazan
3. Emails existentes en BD se rechazan
4. Roles inválidos se rechazan
5. Se procesan todos los válidos, se reportan los fallidos
6. Transacción: si >50% fallan, se hace rollback completo

---

## Template CSV

```csv
email,full_name,role,classroom_code
juan.perez@escuela.edu,Juan Pérez García,student,6A-2024
maria.lopez@escuela.edu,María López Sánchez,student,6A-2024
carlos.teacher@escuela.edu,Carlos Rodríguez,admin_teacher,
```

---

## Wireframe Conceptual

```
┌─────────────────────────────────────────────────────────────────┐
│ Crear Nuevo Usuario                                        [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Email *                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ usuario@ejemplo.com                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ✓ Email disponible                                            │
│                                                                 │
│  Nombre Completo *                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Juan Pérez García                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Rol *                           Organización *                 │
│  ┌──────────────────┐            ┌──────────────────────────┐  │
│  │ Estudiante     ▼ │            │ Escuela Primaria ABC   ▼ │  │
│  └──────────────────┘            └──────────────────────────┘  │
│                                                                 │
│  Asignar a Classroom (opcional)                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 6° A - Turno Matutino                                  ▼ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [x] Enviar email de bienvenida                                │
│  [ ] Mostrar contraseña temporal                                │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐  │
│  │    Cancelar     │  │         Crear Usuario               │  │
│  └─────────────────┘  └─────────────────────────────────────┘  │
│                                                                 │
│  ──────────────────────────────────────────────────────────────│
│  [📥 Importar desde CSV]  [📄 Descargar Template]              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Definición de Hecho (DoD)

- [ ] 4 endpoints implementados en backend
- [ ] DTOs con validación class-validator
- [ ] CreateUserModal funcional
- [ ] BulkImportDialog funcional
- [ ] Validación de email en tiempo real
- [ ] Generación de contraseña segura
- [ ] Template CSV disponible para descarga
- [ ] Tests unitarios >80% coverage
- [ ] Audit logging funcionando
- [ ] Email de bienvenida integrado con mail service
- [ ] Documentación API actualizada

---

## Referencias

- **Gap detectado:** GAP-C01
- **US Relacionada:** US-AE-001 (User Management)
- **Admin Users Page:** `apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx:430`
- **Mail Service:** `apps/backend/src/modules/mail/`

---

**Creado:** 2025-11-29
**Autor:** Architecture-Analyst
**Relacionado con:** GAP-C01, REQ-ADM-002
