# HISTORIAS DE USUARIO P2 - ADMIN PORTAL

**Proyecto:** GAMILIT
**Fecha:** 2025-12-05
**Sprint:** P2-A, P2-B
**Epica:** P2-ADMIN-EXT

---

## US-ADMIN-P2-001: Completar AdminRolesPage

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-ADMIN-P2-001 |
| **Epica** | P2-ADMIN-EXT |
| **Modulo** | admin/roles |
| **Prioridad** | P1 |
| **Story Points** | 8 |
| **Sprint** | P2-A |
| **Estado** | Ready |
| **Asignado a** | Frontend-Agent |

---

### Historia de Usuario

**Como** super administrador,
**quiero** gestionar roles y permisos desde una UI completa,
**para** controlar el acceso granular a funcionalidades del sistema.

### Descripcion Detallada

El backend tiene `AdminRolesController` y `AdminRolesService` completamente implementados. La UI actual esta en desarrollo y necesita completarse con:
- Lista de roles existentes
- CRUD de roles
- Matriz de permisos por rol
- Asignacion de roles a usuarios

### Criterios de Aceptacion

**Escenario 1: Ver lista de roles**
```gherkin
DADO que soy super_admin
CUANDO accedo a /admin/roles
ENTONCES veo la lista de roles (student, teacher, admin_teacher, super_admin)
Y cada rol muestra cantidad de usuarios asignados
```

**Escenario 2: Editar permisos de rol**
```gherkin
DADO que selecciono un rol
CUANDO abro el editor de permisos
ENTONCES veo una matriz de modulos vs acciones (read, write, delete)
Y puedo toggle cada permiso
```

**Escenario 3: Crear nuevo rol**
```gherkin
DADO que hago clic en "Nuevo Rol"
CUANDO completo el formulario con nombre y descripcion
ENTONCES puedo seleccionar permisos base
Y el rol se crea correctamente
```

### Tareas Tecnicas

**Frontend:**
- [ ] FE-ADMIN-001: Implementar RolesTable component
- [ ] FE-ADMIN-002: Implementar RoleEditor modal
- [ ] FE-ADMIN-003: Implementar PermissionMatrix component
- [ ] FE-ADMIN-004: Integrar con useRoles y useRolePermissions hooks
- [ ] FE-ADMIN-005: Agregar validaciones de formulario

**Endpoints a Consumir:**
- `GET /admin/roles` - Listar roles
- `GET /admin/roles/:id` - Detalle rol
- `POST /admin/roles` - Crear rol
- `PUT /admin/roles/:id` - Actualizar rol
- `DELETE /admin/roles/:id` - Eliminar rol
- `GET /admin/roles/:id/permissions` - Permisos del rol
- `PUT /admin/roles/:id/permissions` - Actualizar permisos

---

## US-ADMIN-P2-002: Completar AdminInstitutionsPage

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-ADMIN-P2-002 |
| **Epica** | P2-ADMIN-EXT |
| **Modulo** | admin/institutions |
| **Prioridad** | P1 |
| **Story Points** | 8 |
| **Sprint** | P2-A |
| **Estado** | Ready |
| **Asignado a** | Frontend-Agent |

---

### Historia de Usuario

**Como** super administrador,
**quiero** gestionar instituciones educativas,
**para** administrar el sistema multi-tenant correctamente.

### Descripcion Detallada

El backend tiene `AdminOrganizationsController` implementado. La UI necesita:
- Lista de instituciones con filtros
- Detalles de cada institucion
- Estadisticas por institucion
- Gestion de configuracion por tenant

### Criterios de Aceptacion

**Escenario 1: Ver instituciones**
```gherkin
DADO que soy super_admin
CUANDO accedo a /admin/institutions
ENTONCES veo lista de instituciones registradas
Y cada una muestra: nombre, usuarios activos, plan, fecha creacion
```

**Escenario 2: Filtrar instituciones**
```gherkin
DADO que hay 50+ instituciones
CUANDO aplico filtros (estado, plan, busqueda)
ENTONCES la lista se filtra en tiempo real
```

**Escenario 3: Ver detalle institucion**
```gherkin
DADO que selecciono una institucion
CUANDO abro el modal de detalle
ENTONCES veo: estadisticas de uso, docentes, estudiantes, config
```

### Tareas Tecnicas

**Frontend:**
- [ ] FE-ADMIN-006: Implementar InstitutionsTable component
- [ ] FE-ADMIN-007: Implementar InstitutionFilters component
- [ ] FE-ADMIN-008: Implementar InstitutionDetailModal
- [ ] FE-ADMIN-009: Implementar InstitutionStats component
- [ ] FE-ADMIN-010: Integrar con useOrganizations hook

**Endpoints a Consumir:**
- `GET /admin/organizations` - Listar instituciones
- `GET /admin/organizations/:id` - Detalle
- `GET /admin/organizations/:id/stats` - Estadisticas
- `PUT /admin/organizations/:id` - Actualizar
- `PUT /admin/organizations/:id/config` - Configuracion tenant

---

## US-ADMIN-P2-003: Implementar AdminAdvancedPage

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-ADMIN-P2-003 |
| **Epica** | P2-ADMIN-EXT |
| **Modulo** | admin/advanced |
| **Prioridad** | P1 |
| **Story Points** | 13 |
| **Sprint** | P2-B |
| **Estado** | Ready |
| **Asignado a** | Frontend-Agent |

---

### Historia de Usuario

**Como** super administrador,
**quiero** una pagina de configuracion avanzada con feature flags,
**para** controlar el rollout de funcionalidades de forma segura.

### Descripcion Detallada

La pagina AdminAdvancedPage actualmente muestra "Coming Soon". Necesita implementar:
- Panel de Feature Flags con CRUD
- Rollout gradual (0-100%)
- Targeting por rol/usuario
- A/B Testing dashboard (basico)

### Criterios de Aceptacion

**Escenario 1: Ver feature flags**
```gherkin
DADO que accedo a /admin/advanced
CUANDO veo el panel de Feature Flags
ENTONCES veo lista de flags con: nombre, estado, rollout %, targets
```

**Escenario 2: Toggle feature flag**
```gherkin
DADO que hay un feature flag deshabilitado
CUANDO hago toggle en el switch
ENTONCES el flag se habilita inmediatamente
Y los usuarios afectados ven la feature
```

**Escenario 3: Configurar rollout gradual**
```gherkin
DADO que edito un feature flag
CUANDO configuro rollout_percentage = 25
ENTONCES solo 25% de usuarios elegibles ven la feature
```

**Escenario 4: Targeting por rol**
```gherkin
DADO que configuro target_roles = ['admin_teacher']
CUANDO guardo el flag
ENTONCES solo admin_teachers pueden ver la feature
```

### Tareas Tecnicas

**Frontend:**
- [ ] FE-ADMIN-011: Implementar FeatureFlagsPanel component
- [ ] FE-ADMIN-012: Implementar FeatureFlagEditor modal
- [ ] FE-ADMIN-013: Implementar RolloutSlider component
- [ ] FE-ADMIN-014: Implementar TargetingConfig component
- [ ] FE-ADMIN-015: Implementar ABTestingDashboard (basico)
- [ ] FE-ADMIN-016: Crear useFeatureFlags hook

**Backend (si no existe):**
- [ ] BE-ADMIN-001: Crear FeatureFlagsController
- [ ] BE-ADMIN-002: Crear FeatureFlagsService
- [ ] BE-ADMIN-003: Endpoints CRUD para feature_flags

**Endpoints Necesarios:**
- `GET /admin/feature-flags` - Listar flags
- `GET /admin/feature-flags/:key` - Detalle
- `POST /admin/feature-flags` - Crear
- `PUT /admin/feature-flags/:key` - Actualizar
- `DELETE /admin/feature-flags/:key` - Eliminar

---

## US-ADMIN-P2-004: Persistir Reports en BD

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-ADMIN-P2-004 |
| **Epica** | P2-ADMIN-EXT |
| **Modulo** | admin/reports |
| **Prioridad** | P2 |
| **Story Points** | 5 |
| **Sprint** | P2-B |
| **Estado** | Ready |
| **Asignado a** | Backend-Agent |

---

### Historia de Usuario

**Como** administrador,
**quiero** que los reportes generados se persistan en la base de datos,
**para** acceder al historial y no perderlos al recargar la pagina.

### Descripcion Detallada

Actualmente los reportes se almacenan en memoria:
```typescript
// BETA: Reports stored in memory, not persistent
const [savedReports, setSavedReports] = useState<Report[]>([]);
```

Esto causa que los reportes se pierdan al recargar.

### Criterios de Aceptacion

**Escenario 1: Generar reporte persistente**
```gherkin
DADO que genero un reporte
CUANDO el reporte completa
ENTONCES se guarda en BD con metadata (tipo, fecha, usuario, parametros)
```

**Escenario 2: Ver historial de reportes**
```gherkin
DADO que accedo a /admin/reports
CUANDO veo la lista de reportes
ENTONCES incluye reportes generados en sesiones anteriores
Y puedo descargarlos nuevamente
```

**Escenario 3: Limpiar reportes antiguos**
```gherkin
DADO que hay reportes de mas de 30 dias
CUANDO se ejecuta el CRON de limpieza
ENTONCES los reportes antiguos se eliminan
Y los archivos asociados se borran del storage
```

### Tareas Tecnicas

**Backend:**
- [ ] BE-ADMIN-004: Crear tabla admin_reports (si no existe)
- [ ] BE-ADMIN-005: Modificar ReportsService para persistir
- [ ] BE-ADMIN-006: Agregar storage de archivos (S3 o local)
- [ ] BE-ADMIN-007: Crear CRON de limpieza de reportes antiguos

**Frontend:**
- [ ] FE-ADMIN-017: Modificar useReports para cargar de BD
- [ ] FE-ADMIN-018: Agregar indicador de reporte en progreso

**Database:**
```sql
CREATE TABLE admin_dashboard.admin_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  parameters JSONB,
  file_path VARCHAR(500),
  file_size INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  created_by UUID REFERENCES auth_management.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);
```

---

## RESUMEN TAREAS ADMIN P2

| US | Tarea | SP | Sprint | Asignado |
|----|-------|-----|--------|----------|
| US-ADMIN-P2-001 | AdminRolesPage | 8 | P2-A | Frontend |
| US-ADMIN-P2-002 | AdminInstitutionsPage | 8 | P2-A | Frontend |
| US-ADMIN-P2-003 | AdminAdvancedPage | 13 | P2-B | Frontend |
| US-ADMIN-P2-004 | Persistir Reports | 5 | P2-B | Backend |

**Total Admin P2:** 34 SP

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-05
