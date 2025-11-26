# Plan de Testing E2E - Portal Admin MVP

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Alcance:** MVP (4 páginas en scope)
**Tipo:** End-to-End Testing Strategy

---

## 🎯 Objetivos del Testing E2E

1. **Validar flujos completos** desde UI hasta base de datos
2. **Garantizar integración** frontend-backend-database
3. **Detectar regresiones** antes de deployment
4. **Asegurar calidad** de experiencia de usuario
5. **Verificar casos de error** y manejo de excepciones

---

## 📋 Alcance del Testing

### Páginas en Alcance MVP (4)

1. ✅ **AdminDashboardPage** - Dashboard con métricas
2. ✅ **AdminInstitutionsPage** - Organizaciones (view-only MVP)
3. ✅ **AdminGamificationPage** - Gamificación Config (view-only MVP)
4. ✅ **AdminClassroomTeacherPage** - Asignaciones Classroom-Teacher (full CRUD)

### Fuera de Alcance (9 páginas con badges)

- AdminUsersPage, AdminRolesPage, AdminContentPage, AdminApprovalsPage, etc.
- Estas páginas solo requieren validación de que muestran "Under Construction"

---

## 🧪 Suite 1: AdminDashboardPage (EAI-005)

### Objetivo
Validar que el dashboard carga correctamente y muestra métricas en tiempo real.

### Pre-requisitos
- Usuario admin autenticado
- Base de datos con datos de prueba (students, teachers, classrooms, exercises)

### Casos de Test

#### TC-DASH-001: Carga Inicial del Dashboard
**Prioridad:** 🔴 ALTA

**Steps:**
1. Login como admin (email: `admin@gamilit.com`)
2. Navegar a `/admin` o `/admin/dashboard`
3. Esperar a que la página cargue completamente

**Expected Results:**
- ✅ Página carga en < 3 segundos
- ✅ Header muestra nombre de usuario y gamification data
- ✅ Dashboard muestra 4 cards de métricas principales:
  - Total de Usuarios
  - Total de Estudiantes
  - Total de Profesores
  - Total de Ejercicios/Actividad
- ✅ Gráficos de tendencias visibles (si existen)
- ✅ No hay errores en console

**SQL de Validación:**
```sql
SELECT COUNT(*) as total_users FROM auth.profiles;
SELECT COUNT(*) as total_students FROM auth.profiles WHERE role = 'student';
SELECT COUNT(*) as total_teachers FROM auth.profiles WHERE role IN ('admin_teacher', 'super_admin');
```

#### TC-DASH-002: Refresh de Métricas
**Prioridad:** 🟡 MEDIA

**Steps:**
1. Estando en dashboard, esperar 2 minutos (cache de React Query)
2. Verificar que métricas se actualizan automáticamente

**Expected Results:**
- ✅ React Query invalida cache después de `staleTime`
- ✅ Nuevas métricas se cargan sin refresh manual
- ✅ Loading state visible durante fetch

#### TC-DASH-003: Navegación desde Dashboard
**Prioridad:** 🟡 MEDIA

**Steps:**
1. Desde dashboard, hacer click en sidebar items:
   - Instituciones
   - Gamificación
   - Classroom-Teacher

**Expected Results:**
- ✅ Navegación funciona sin errores
- ✅ URL cambia correctamente
- ✅ Páginas cargan

---

## 🧪 Suite 2: AdminInstitutionsPage (EAI-005)

### Objetivo
Validar que la página de instituciones muestra datos correctamente (view-only en MVP).

### Pre-requisitos
- Al menos 3 organizaciones en `auth.tenants`
- Usuario admin con permisos

### Casos de Test

#### TC-INST-001: Listar Organizaciones
**Prioridad:** 🔴 ALTA

**Steps:**
1. Navegar a `/admin/institutions`
2. Esperar carga de datos

**Expected Results:**
- ✅ Tabla/cards muestran organizaciones
- ✅ Cada organización muestra:
  - Nombre
  - Total de usuarios
  - Estado (active/inactive)
  - Fecha de creación
- ✅ Paginación funciona (si hay >10 orgs)

**SQL de Validación:**
```sql
SELECT
  t.id,
  t.name,
  COUNT(m.user_id) as user_count,
  t.is_active,
  t.created_at
FROM auth.tenants t
LEFT JOIN auth.memberships m ON t.id = m.tenant_id
GROUP BY t.id
ORDER BY t.created_at DESC;
```

#### TC-INST-002: Búsqueda de Organización
**Prioridad:** 🟡 MEDIA

**Steps:**
1. En página de instituciones, usar campo de búsqueda
2. Escribir nombre parcial de una organización
3. Verificar resultados filtrados

**Expected Results:**
- ✅ Lista se filtra en tiempo real (debounce ~300ms)
- ✅ Búsqueda case-insensitive
- ✅ "No results" si no hay coincidencias

#### TC-INST-003: Badge "CRUD En Construcción"
**Prioridad:** 🟢 BAJA

**Steps:**
1. Verificar que botones "Crear", "Editar", "Eliminar" tienen badges
2. Intentar hacer click en botones

**Expected Results:**
- ✅ Badges "En Construcción" visibles
- ✅ Tooltips informativos
- ✅ Botones deshabilitados o muestran alert

---

## 🧪 Suite 3: AdminGamificationPage (US-AE-005)

### Objetivo
Validar que la configuración de gamificación muestra datos correctamente (view-only MVP).

### Pre-requisitos
- Parámetros de gamificación en `auth.system_settings`
- Maya ranks configurados
- Usuario admin autenticado

### Casos de Test

#### TC-GAMIF-001: Vista de Parámetros
**Prioridad:** 🔴 ALTA

**Steps:**
1. Navegar a `/admin/gamification`
2. Tab "Economía ML Coins" activo
3. Verificar lista de parámetros

**Expected Results:**
- ✅ Parámetros cargados desde backend
- ✅ Cada parámetro muestra:
  - Key (ej: "xp.base_per_exercise")
  - Valor actual
  - Descripción
  - Tipo de dato
- ✅ Parámetros agrupados por categoría

**API Call:**
```http
GET /api/admin/gamification/parameters?category=coins
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "key": "coins.welcome_bonus",
      "value": "500",
      "dataType": "integer",
      "category": "coins",
      "description": "Bonus de bienvenida"
    }
  ],
  "total": 5
}
```

#### TC-GAMIF-002: Vista de Rangos Maya
**Prioridad:** 🔴 ALTA

**Steps:**
1. En `/admin/gamification`, seleccionar tab "Rangos Maya"
2. Verificar lista de rangos

**Expected Results:**
- ✅ 5 rangos Maya mostrados (Novice → Expert)
- ✅ Cada rango muestra:
  - Nombre
  - Color distintivo
  - Min XP - Max XP
  - Nivel
  - Multiplicadores (XP y Coins)
  - Estado (activo/inactivo)
- ✅ Rangos ordenados por nivel ascendente

**SQL de Validación:**
```sql
SELECT * FROM gamification.maya_ranks
ORDER BY level ASC;
```

#### TC-GAMIF-003: Estadísticas Globales
**Prioridad:** 🟡 MEDIA

**Steps:**
1. Seleccionar tab "Estadísticas"
2. Verificar cards de métricas

**Expected Results:**
- ✅ Total de parámetros
- ✅ Parámetros activos
- ✅ Total de rangos Maya
- ✅ Rangos activos
- ✅ Desglose por categoría (points, coins, levels, ranks, penalties, bonuses)

#### TC-GAMIF-004: Botones "Editar" muestran alert
**Prioridad:** 🟢 BAJA

**Steps:**
1. Click en botón "Configurar" o "Editar" en cualquier sección
2. Verificar comportamiento

**Expected Results:**
- ✅ Alert/Toast muestra "Funcionalidad próximamente"
- ✅ No navega a otra página
- ✅ No hace llamada API (modal de edición NO implementado en MVP)

---

## 🧪 Suite 4: AdminClassroomTeacherPage (US-AE-007) ⭐ CRÍTICA

### Objetivo
Validar flujo completo de asignaciones classroom-teacher (única página con CRUD completo en MVP).

### Pre-requisitos
- ⚠️ **IMPORTANTE:** Resolver discrepancia de rutas API primero (ver REPORTE-CRITICO-DISCREPANCIA-API-US-AE-007.md)
- Al menos 5 classrooms en `social.classrooms`
- Al menos 3 teachers en `auth.profiles` (role: admin_teacher)
- Base de datos limpia de asignaciones previas (para tests)

---

### Tab 1: Classroom → Teachers

#### TC-CT-001: Buscar Classroom por UUID
**Prioridad:** 🔴 ALTA

**Steps:**
1. Navegar a `/admin/classroom-teacher`
2. Tab "Por Classroom" activo por defecto
3. Copiar UUID de un classroom existente
4. Pegar en campo de búsqueda
5. Click en "Buscar"

**Expected Results:**
- ✅ Loading spinner visible durante fetch
- ✅ Datos de classroom cargados:
  - Nombre (ej: "3-A Primaria")
  - Grado/Nivel
  - Sección
- ✅ Lista de teachers asignados (vacía inicialmente)
- ✅ Botón "Asignar Teacher" habilitado

**API Call:**
```http
GET /api/admin/classrooms/{classroomId}/teachers
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "classroom": {
    "id": "classroom-uuid",
    "name": "3-A Primaria",
    "grade": "3ro",
    "section": "A"
  },
  "teachers": []
}
```

#### TC-CT-002: Asignar Teacher Individual a Classroom
**Prioridad:** 🔴 ALTA

**Steps:**
1. Con classroom buscado (TC-CT-001), click en "Asignar Teacher"
2. Modal abre con campo de UUID de teacher
3. Copiar UUID de un teacher existente (role: admin_teacher)
4. Pegar en campo
5. (Opcional) Agregar notas
6. Click en "Asignar"

**Expected Results:**
- ✅ Modal cierra
- ✅ Toast success: "Teacher asignado correctamente"
- ✅ Lista de teachers se actualiza automáticamente (React Query invalidation)
- ✅ Nuevo teacher card visible con:
  - Nombre del teacher
  - Email
  - Fecha de asignación
  - Botón "Remover"

**API Call:**
```http
POST /api/admin/classrooms/{classroomId}/teachers
Authorization: Bearer {token}
Content-Type: application/json

{
  "teacherId": "teacher-uuid",
  "notes": "Profesor titular"
}
```

**Expected Response:**
```json
{
  "classroom_id": "classroom-uuid",
  "teacher_id": "teacher-uuid",
  "role": "TEACHER",
  "assigned_at": "2025-11-24T10:30:00Z"
}
```

**SQL de Validación:**
```sql
SELECT * FROM social.teacher_classroom
WHERE classroom_id = 'classroom-uuid'
  AND teacher_id = 'teacher-uuid';
-- Debe retornar 1 fila
```

#### TC-CT-003: Validación de Duplicados
**Prioridad:** 🔴 ALTA

**Steps:**
1. Intentar asignar el MISMO teacher al MISMO classroom nuevamente
2. Verificar error handling

**Expected Results:**
- ✅ Backend retorna 409 Conflict
- ✅ Toast error: "El teacher ya está asignado a este classroom"
- ✅ Modal permanece abierto
- ✅ NO se crea registro duplicado en DB

**API Response:**
```json
{
  "statusCode": 409,
  "message": "Teacher already assigned to classroom"
}
```

#### TC-CT-004: Remover Teacher de Classroom
**Prioridad:** 🔴 ALTA

**Steps:**
1. Con classroom que tiene teacher asignado (TC-CT-002)
2. Click en botón "Remover" en card del teacher
3. Modal de confirmación abre
4. Click en "Confirmar Remoción"

**Expected Results:**
- ✅ Modal cierra
- ✅ Toast success: "Teacher removido correctamente"
- ✅ Teacher card desaparece de la lista
- ✅ Registro eliminado de DB

**API Call:**
```http
DELETE /api/admin/classrooms/{classroomId}/teachers/{teacherId}
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "message": "Assignment removed successfully"
}
```

**SQL de Validación:**
```sql
SELECT * FROM social.teacher_classroom
WHERE classroom_id = 'classroom-uuid'
  AND teacher_id = 'teacher-uuid';
-- Debe retornar 0 filas
```

#### TC-CT-005: Validación de Remoción con Estudiantes Activos
**Prioridad:** 🟡 MEDIA

**Steps:**
1. Classroom con teacher asignado Y estudiantes activos
2. Intentar remover teacher sin flag `force=true`

**Expected Results:**
- ✅ Backend retorna 400 Bad Request
- ✅ Toast error: "Cannot remove: classroom has X active students. Use force=true to override"
- ✅ Modal muestra opción de "Forzar remoción"
- ✅ Si user confirma force, remoción exitosa

---

### Tab 2: Teacher → Classrooms

#### TC-TC-001: Buscar Teacher por UUID
**Prioridad:** 🔴 ALTA

**Steps:**
1. En `/admin/classroom-teacher`, cambiar a tab "Por Teacher"
2. Copiar UUID de un teacher existente
3. Pegar en campo de búsqueda
4. Click en "Buscar"

**Expected Results:**
- ✅ Loading spinner
- ✅ Datos de teacher cargados:
  - Nombre completo
  - Email
  - Rol
- ✅ Lista de classrooms asignados (grid de cards)
- ✅ Contador: "X classrooms asignados"
- ✅ Botón "Asignar Classrooms" habilitado

**API Call:**
```http
GET /api/admin/teachers/{teacherId}/classrooms
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "teacher": {
    "id": "teacher-uuid",
    "full_name": "Juan Pérez",
    "email": "juan.perez@school.com",
    "role": "admin_teacher"
  },
  "classrooms": [
    {
      "id": "classroom-uuid",
      "name": "3-A Primaria",
      "student_count": 25,
      "assigned_at": "2025-11-24T10:00:00Z"
    }
  ]
}
```

#### TC-TC-002: Asignar Múltiples Classrooms a Teacher
**Prioridad:** 🔴 ALTA

**Steps:**
1. Con teacher buscado (TC-TC-001), click en "Asignar Classrooms"
2. Modal abre con textarea
3. Ingresar UUIDs de classrooms separados por comas:
   ```
   uuid-1, uuid-2, uuid-3
   ```
4. Click en "Asignar"

**Expected Results:**
- ✅ Modal cierra
- ✅ Loading durante procesamiento
- ✅ Toast success: "3 classrooms asignados correctamente"
- ✅ Grid de classrooms se actualiza con nuevas cards
- ✅ Contador actualizado: "X classrooms asignados"

**API Call:**
```http
POST /api/admin/teachers/{teacherId}/classrooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "classroomIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Expected Response:**
```json
{
  "assigned": 3,
  "classrooms": [
    { "id": "uuid-1", "name": "3-A" },
    { "id": "uuid-2", "name": "3-B" },
    { "id": "uuid-3", "name": "4-A" }
  ]
}
```

**SQL de Validación:**
```sql
SELECT * FROM social.teacher_classroom
WHERE teacher_id = 'teacher-uuid'
  AND classroom_id IN ('uuid-1', 'uuid-2', 'uuid-3');
-- Debe retornar 3 filas
```

#### TC-TC-003: Validación de UUIDs Inválidos
**Prioridad:** 🟡 MEDIA

**Steps:**
1. En modal de asignación múltiple, ingresar UUIDs inválidos:
   - UUID malformado: `not-a-uuid`
   - Classroom que no existe: `99999999-9999-9999-9999-999999999999`
   - Mix de válidos e inválidos

**Expected Results:**
- ✅ Validación en frontend (formato UUID)
- ✅ Si pasa frontend, backend retorna error específico
- ✅ Toast error: "Invalid classroom IDs: not-a-uuid"
- ✅ UUIDs válidos SÍ se asignan (partial success)

#### TC-TC-004: Responsive Grid
**Prioridad:** 🟢 BAJA

**Steps:**
1. Resize browser window: mobile (375px), tablet (768px), desktop (1920px)
2. Verificar grid de classroom cards

**Expected Results:**
- ✅ Mobile: 1 columna
- ✅ Tablet: 2 columnas
- ✅ Desktop: 3 columnas
- ✅ Cards mantienen formato

---

## 🧪 Suite 5: Navegación y Sidebar

### Objetivo
Validar que navegación entre páginas funciona y sidebar muestra badges correctamente.

#### TC-NAV-001: Navegación por Sidebar (MVP Pages)
**Prioridad:** 🟡 MEDIA

**Steps:**
1. Login como admin
2. Click en cada item del sidebar (4 páginas MVP):
   - Dashboard
   - Instituciones
   - Gamificación
   - Classroom-Teacher

**Expected Results:**
- ✅ URL cambia correctamente
- ✅ Página carga sin errores
- ✅ Item activo en sidebar highlighted
- ✅ No hay errores 404

#### TC-NAV-002: Enlaces "Under Construction" (9 páginas)
**Prioridad:** 🟡 MEDIA

**Steps:**
1. Click en sidebar items fuera de MVP:
   - Usuarios, Roles, Contenido, Aprobaciones, Monitoreo, Herramientas, Reportes, Configuración

**Expected Results:**
- ✅ Página carga (no 404)
- ✅ Componente UnderConstruction visible con:
  - Título de la funcionalidad
  - Descripción
  - Lista de features planeadas
  - Fecha estimada (ej: "Fase 2")
  - Botón "Volver al Dashboard"
- ✅ Sidebar sigue funcional

#### TC-NAV-003: Logout
**Prioridad:** 🔴 ALTA

**Steps:**
1. En cualquier página admin, click en botón logout (header)
2. Confirmar logout si hay modal

**Expected Results:**
- ✅ Usuario deslogueado
- ✅ Redirect a `/login`
- ✅ Token JWT invalidado
- ✅ No puede acceder a `/admin` sin re-login

---

## 🧪 Suite 6: Autenticación y Autorización

### Objetivo
Validar que solo admins pueden acceder al portal y que guards funcionan.

#### TC-AUTH-001: Acceso Sin Login
**Prioridad:** 🔴 ALTA

**Steps:**
1. Sin estar logueado, navegar directamente a `/admin`

**Expected Results:**
- ✅ Redirect a `/login`
- ✅ Mensaje: "Debe iniciar sesión para acceder"
- ✅ Después de login exitoso, redirect a `/admin`

#### TC-AUTH-002: Acceso con Rol No-Admin
**Prioridad:** 🔴 ALTA

**Steps:**
1. Login como student (role: `student`)
2. Intentar navegar a `/admin`

**Expected Results:**
- ✅ Access denied (403 Forbidden)
- ✅ Mensaje: "No tiene permisos para acceder al panel de administración"
- ✅ Redirect a página apropiada (`/student`)

#### TC-AUTH-003: Token Expirado
**Prioridad:** 🟡 MEDIA

**Steps:**
1. Login como admin
2. Esperar a que token JWT expire (configurable, ej: 15 min)
3. Intentar hacer acción que requiera API call

**Expected Results:**
- ✅ Backend retorna 401 Unauthorized
- ✅ Frontend detecta token expirado
- ✅ Redirect a `/login` con mensaje
- ✅ Opción de "Recordar sesión" si aplica

---

## 🧪 Suite 7: Performance y Carga

### Objetivo
Validar que la aplicación tiene performance aceptable.

#### TC-PERF-001: Tiempo de Carga Inicial
**Prioridad:** 🟡 MEDIA

**Steps:**
1. Login y navegar a `/admin`
2. Medir tiempo hasta "página completamente interactiva"

**Expected Results:**
- ✅ First Contentful Paint (FCP): < 1.5 segundos
- ✅ Largest Contentful Paint (LCP): < 2.5 segundos
- ✅ Time to Interactive (TTI): < 3.5 segundos

**Tools:**
- Chrome DevTools → Performance tab
- Lighthouse report

#### TC-PERF-002: Tamaño de Bundle
**Prioridad:** 🟢 BAJA

**Steps:**
1. Build de producción: `npm run build`
2. Analizar tamaño de bundles

**Expected Results:**
- ✅ Main bundle: < 500 KB (gzipped)
- ✅ Vendor bundle: < 1 MB (gzipped)
- ✅ Code splitting efectivo (chunks por ruta)

#### TC-PERF-003: API Response Times
**Prioridad:** 🟡 MEDIA

**Steps:**
1. Medir tiempo de respuesta de endpoints críticos:
   - `GET /admin/gamification/parameters`
   - `GET /admin/classrooms/:id/teachers`
   - `POST /admin/classrooms/:id/teachers`

**Expected Results:**
- ✅ Promedio: < 200 ms
- ✅ P95: < 500 ms
- ✅ P99: < 1000 ms
- ✅ No N+1 queries (verificar con logs SQL)

---

## 🧪 Suite 8: Error Handling

### Objetivo
Validar que la aplicación maneja errores gracefully.

#### TC-ERR-001: API Down / Network Error
**Prioridad:** 🔴 ALTA

**Steps:**
1. Login como admin
2. Simular backend down (detener servidor o usar DevTools → Network → Offline)
3. Intentar cargar datos en cualquier página

**Expected Results:**
- ✅ Error boundary NO crashea toda la app
- ✅ Mensaje de error amigable: "No se pudo conectar con el servidor"
- ✅ Opción de "Reintentar"
- ✅ UI permanece funcional (no white screen)

#### TC-ERR-002: 500 Internal Server Error
**Prioridad:** 🟡 MEDIA

**Steps:**
1. Forzar error 500 en backend (ej: SQL syntax error, exception no capturada)
2. Verificar comportamiento en frontend

**Expected Results:**
- ✅ Toast error: "Error del servidor. Por favor contacte al administrador"
- ✅ Error logged a Sentry/monitoring (si configurado)
- ✅ UI no crashea

#### TC-ERR-003: Validación de Formularios
**Prioridad:** 🟡 MEDIA

**Steps:**
1. En modal de asignación, dejar campos vacíos
2. Click en "Asignar"

**Expected Results:**
- ✅ Validación frontend antes de API call
- ✅ Mensajes de error bajo cada campo
- ✅ Botón "Asignar" deshabilitado si hay errores
- ✅ No hace request innecesario al backend

---

## 📊 Resumen de Test Cases

| Suite | Test Cases | Prioridad Alta | Prioridad Media | Prioridad Baja |
|-------|------------|----------------|-----------------|----------------|
| **1. Dashboard** | 3 | 1 | 2 | 0 |
| **2. Instituciones** | 3 | 1 | 1 | 1 |
| **3. Gamificación** | 4 | 2 | 1 | 1 |
| **4. Classroom-Teacher** | 9 | 7 | 2 | 0 |
| **5. Navegación** | 3 | 1 | 2 | 0 |
| **6. Auth & Authz** | 3 | 2 | 1 | 0 |
| **7. Performance** | 3 | 0 | 2 | 1 |
| **8. Error Handling** | 3 | 1 | 2 | 0 |
| **TOTAL** | **31 TCs** | **15 (48%)** | **13 (42%)** | **3 (10%)** |

---

## 🛠️ Herramientas de Testing

### Opción 1: Playwright (Recomendado)
```bash
npm install -D @playwright/test
npx playwright install
```

**Ventajas:**
- ✅ Multi-browser (Chrome, Firefox, Safari)
- ✅ Auto-wait para elementos
- ✅ Screenshots y videos automáticos
- ✅ Debugging excelente
- ✅ Parallel execution

**Estructura de Proyecto:**
```
apps/frontend/
├── e2e/
│   ├── admin/
│   │   ├── dashboard.spec.ts
│   │   ├── institutions.spec.ts
│   │   ├── gamification.spec.ts
│   │   └── classroom-teacher.spec.ts
│   ├── auth/
│   │   └── login.spec.ts
│   ├── fixtures/
│   │   └── admin-user.ts
│   └── utils/
│       └── test-helpers.ts
└── playwright.config.ts
```

### Opción 2: Cypress
```bash
npm install -D cypress
npx cypress open
```

**Ventajas:**
- ✅ Time-travel debugging
- ✅ Real-time reloading
- ✅ Great DX

### Opción 3: Jest + Testing Library (Unit/Integration)
Para componentes individuales, no flujos E2E completos.

---

## 📝 Ejemplo de Test Case (Playwright)

```typescript
// e2e/admin/classroom-teacher.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/admin-user';

test.describe('Classroom-Teacher Assignments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/classroom-teacher');
  });

  test('TC-CT-001: Buscar Classroom por UUID', async ({ page }) => {
    // 1. Tab "Por Classroom" activo
    await expect(page.locator('button:has-text("Por Classroom")')).toHaveClass(/active/);

    // 2. Ingresar UUID de classroom
    const classroomId = 'test-classroom-uuid';
    await page.fill('input[placeholder*="UUID del Classroom"]', classroomId);

    // 3. Click en "Buscar"
    await page.click('button:has-text("Buscar")');

    // 4. Esperar loading
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible({ timeout: 5000 });

    // 5. Verificar datos de classroom cargados
    await expect(page.locator('[data-testid="classroom-name"]')).toContainText('3-A Primaria');
    await expect(page.locator('[data-testid="classroom-grade"]')).toContainText('3ro');

    // 6. Verificar lista de teachers (vacía inicialmente)
    const teacherCards = page.locator('[data-testid="teacher-card"]');
    await expect(teacherCards).toHaveCount(0);

    // 7. Verificar botón "Asignar Teacher" habilitado
    await expect(page.locator('button:has-text("Asignar Teacher")')).toBeEnabled();
  });

  test('TC-CT-002: Asignar Teacher Individual', async ({ page }) => {
    // Pre-requisito: Classroom buscado (TC-CT-001)
    await page.fill('input[placeholder*="UUID del Classroom"]', 'test-classroom-uuid');
    await page.click('button:has-text("Buscar")');
    await page.waitForSelector('[data-testid="classroom-name"]');

    // 1. Click en "Asignar Teacher"
    await page.click('button:has-text("Asignar Teacher")');

    // 2. Modal abre
    await expect(page.locator('[data-testid="assign-teacher-modal"]')).toBeVisible();

    // 3. Ingresar UUID de teacher
    await page.fill('input[placeholder*="UUID del Teacher"]', 'test-teacher-uuid');

    // 4. (Opcional) Agregar notas
    await page.fill('textarea[placeholder*="Notas"]', 'Profesor titular');

    // 5. Click en "Asignar"
    await page.click('[data-testid="assign-teacher-modal"] button:has-text("Asignar")');

    // 6. Esperar toast success
    await expect(page.locator('.toast-success')).toContainText('Teacher asignado correctamente');

    // 7. Verificar modal cierra
    await expect(page.locator('[data-testid="assign-teacher-modal"]')).not.toBeVisible();

    // 8. Verificar nuevo teacher card visible
    await expect(page.locator('[data-testid="teacher-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="teacher-card"]')).toContainText('test-teacher-uuid');

    // 9. Verificar fecha de asignación
    await expect(page.locator('[data-testid="teacher-assigned-at"]')).toBeVisible();
  });

  test('TC-CT-003: Validación de Duplicados', async ({ page }) => {
    // Pre-requisito: Teacher ya asignado (TC-CT-002)
    // ... setup ...

    // 1. Intentar asignar MISMO teacher nuevamente
    await page.click('button:has-text("Asignar Teacher")');
    await page.fill('input[placeholder*="UUID del Teacher"]', 'test-teacher-uuid');
    await page.click('[data-testid="assign-teacher-modal"] button:has-text("Asignar")');

    // 2. Verificar toast error
    await expect(page.locator('.toast-error')).toContainText('ya está asignado');

    // 3. Modal permanece abierto
    await expect(page.locator('[data-testid="assign-teacher-modal"]')).toBeVisible();
  });
});
```

---

## 📋 Checklist de Ejecución

### Pre-Testing

- [ ] **Environment Setup:**
  - [ ] Base de datos de testing con datos seed
  - [ ] Backend corriendo en `localhost:3006` (o env variable)
  - [ ] Frontend corriendo en `localhost:5173`
  - [ ] Usuario admin de prueba creado (`admin@gamilit.com`)
  - [ ] Al menos 5 classrooms y 3 teachers en DB

- [ ] **Data Cleanup:**
  - [ ] Script de reset DB: `npm run db:reset-test`
  - [ ] Ejecutar seeds: `npm run db:seed-test`

### During Testing

- [ ] **Ejecutar Tests por Suite:**
  ```bash
  npx playwright test e2e/admin/dashboard.spec.ts
  npx playwright test e2e/admin/institutions.spec.ts
  npx playwright test e2e/admin/gamification.spec.ts
  npx playwright test e2e/admin/classroom-teacher.spec.ts
  ```

- [ ] **Capturar Screenshots en Fallos:**
  - Playwright lo hace automáticamente
  - Revisar carpeta `test-results/`

- [ ] **Revisar Videos:**
  - Videos de tests fallidos en `test-results/`

### Post-Testing

- [ ] **Generar Reporte HTML:**
  ```bash
  npx playwright show-report
  ```

- [ ] **Analizar Cobertura:**
  - % de tests passing
  - Tests fallidos y razón
  - Performance metrics

- [ ] **Documentar Issues:**
  - Crear tickets en GitHub/Jira para bugs encontrados
  - Priorizar fixes según severidad

---

## 🎯 Criterios de Aceptación para MVP

**El MVP está listo para producción cuando:**

1. ✅ **100% de tests de prioridad ALTA passing** (15 tests)
2. ✅ **90%+ de tests de prioridad MEDIA passing** (13 tests)
3. ✅ **No hay errores 500 en casos normales**
4. ✅ **Performance cumple con métricas esperadas**
5. ✅ **Discrepancia API US-AE-007 RESUELTA** ⚠️ BLOQUEANTE
6. ✅ **Todas las páginas MVP cargan sin errores**
7. ✅ **Navegación funcional (0 enlaces rotos)**
8. ✅ **Auth guards funcionando correctamente**

---

## 📊 Timeline de Testing

| Fase | Duración | Actividad |
|------|----------|-----------|
| **Setup** | 4 horas | Instalar Playwright, configurar project, crear fixtures |
| **Suite 1-3** | 1 día | Escribir tests de Dashboard, Instituciones, Gamificación |
| **Suite 4** | 2 días | Escribir tests de Classroom-Teacher (más crítico) |
| **Suite 5-8** | 1 día | Navegación, Auth, Performance, Error Handling |
| **Ejecución** | 4 horas | Ejecutar todos los tests, generar reportes |
| **Bug Fixes** | 2-3 días | Corregir bugs encontrados, re-testing |
| **TOTAL** | **5-6 días** | Con 1 QA Engineer full-time |

---

## 🔗 Referencias

**Documentación:**
- Playwright: https://playwright.dev/
- Cypress: https://www.cypress.io/
- Testing Library: https://testing-library.com/

**Archivos del Proyecto:**
- Frontend pages: `apps/frontend/src/apps/admin/pages/`
- API clients: `apps/frontend/src/services/api/admin/`
- Backend controllers: `apps/backend/src/modules/admin/controllers/`

**Reportes Relacionados:**
- `REPORTE-CRITICO-DISCREPANCIA-API-US-AE-007.md` - Resolver ANTES de testing E2E
- `REPORTE-COMPLETO-PORTAL-ADMIN-MVP.md` - Estado de implementación
- `US-AE-005-GAP-ANALYSIS-COMPLETACION.md` - Gaps de gamificación

---

**Generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
**Estado:** 📋 Ready for Implementation
