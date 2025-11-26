# PLAN DE TRABAJO - ANÁLISIS Y CORRECCIÓN POR PÁGINA

**Fecha:** 2025-11-26
**Metodología:** Análisis iterativo con validación colaborativa
**Estado:** FASE 2 - PLANEACIÓN

---

## METODOLOGÍA DE TRABAJO

### Ciclo por Página
```
┌─────────────────────────────────────────────────────────────────┐
│  1. ANÁLISIS DETALLADO (Architecture-Analyst + Agentes)         │
│     → DB: Tablas/vistas involucradas                            │
│     → Backend: Controlador/Servicio/DTOs                        │
│     → API Frontend: Funciones en adminAPI.ts                    │
│     → Types: Interfaces TypeScript                              │
│     → Hook: Estado y funciones                                  │
│     → Componente: Uso del hook y renderizado                    │
├─────────────────────────────────────────────────────────────────┤
│  2. IDENTIFICACIÓN DE PROBLEMAS                                 │
│     → Gaps entre capas                                          │
│     → Mapeo incorrecto de campos                                │
│     → Endpoints faltantes o incorrectos                         │
│     → Transformaciones de datos                                 │
├─────────────────────────────────────────────────────────────────┤
│  3. CORRECCIÓN (Orquestación de agentes)                        │
│     → Database-Agent: Si hay cambios en DB                      │
│     → Backend-Agent: Si hay cambios en controladores/servicios  │
│     → Frontend-Agent: Si hay cambios en hooks/componentes       │
├─────────────────────────────────────────────────────────────────┤
│  4. VALIDACIÓN (Usuario)                                        │
│     → Probar página en navegador                                │
│     → Verificar carga de datos                                  │
│     → Verificar funcionalidad (búsqueda, filtros, acciones)     │
│     → Reportar problemas encontrados                            │
├─────────────────────────────────────────────────────────────────┤
│  5. FEEDBACK → AJUSTES                                          │
│     → Incorporar retroalimentación                              │
│     → Hacer correcciones adicionales                            │
│     → Re-validar si es necesario                                │
├─────────────────────────────────────────────────────────────────┤
│  6. DOCUMENTAR Y SIGUIENTE PÁGINA                               │
│     → Documentar cambios realizados                             │
│     → Actualizar inventarios                                    │
│     → Pasar a siguiente página                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## PÁGINAS EN ALCANCE (12 páginas)

### Orden de Prioridad

| # | Página | Ruta | Criticidad | Complejidad |
|---|--------|------|------------|-------------|
| 1 | AdminDashboardPage | /admin/dashboard | Alta | Media |
| 2 | AdminUsersPage | /admin/users | Alta | Alta |
| 3 | AdminInstitutionsPage | /admin/institutions | Alta | Media |
| 4 | AdminRolesPage | /admin/roles | Alta | Media |
| 5 | AdminContentPage | /admin/content | Media | Alta |
| 6 | AdminGamificationPage | /admin/gamification | Media | Alta |
| 7 | AdminMonitoringPage | /admin/monitoring | Media | Media |
| 8 | AdminAlertsPage | /admin/alerts | Media | Media |
| 9 | AdminAnalyticsPage | /admin/analytics | Media | Alta |
| 10 | AdminProgressPage | /admin/progress | Media | Alta |
| 11 | AdminReportsPage | /admin/reports | Baja | Media |
| 12 | AdminClassroomTeacherPage | /admin/classroom-teachers | Baja | Media |

### Páginas Excluidas (Under Construction)
- AdminSettingsPage - SHOW_CONTENT=false
- AdminAdvancedPage - SHOW_CONTENT=false

---

## DETALLE POR PÁGINA

### PÁGINA 1: AdminDashboardPage

**Ruta:** `/admin/dashboard`
**Archivo:** `apps/frontend/src/apps/admin/pages/AdminDashboardPage.tsx`
**Hook:** `useAdminDashboard`

**Funcionalidad esperada:**
- [ ] Mostrar métricas del sistema (usuarios totales, organizaciones, storage)
- [ ] Mostrar estado de salud del sistema (API, DB, CPU, memoria)
- [ ] Mostrar alertas activas
- [ ] Mostrar acciones recientes
- [ ] Botón de actualizar datos

**Flujo de datos:**
```
DB: admin_dashboard.system_overview_mv, user_stats_summary
    ↓
Backend: AdminDashboardController → AdminDashboardService
    ↓
API Frontend: adminAPI.getSystemHealth(), getSystemMetrics(), getAlerts()
    ↓
Types: SystemHealth, SystemMetrics, SystemAlert
    ↓
Hook: useAdminDashboard → refreshAll()
    ↓
Componente: AdminDashboardPage
```

---

### PÁGINA 2: AdminUsersPage

**Ruta:** `/admin/users`
**Archivo:** `apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx`
**Hook:** `useUserManagement`

**Funcionalidad esperada:**
- [ ] Listar usuarios con paginación
- [ ] Buscar usuarios por nombre/email
- [ ] Filtrar por rol y estado
- [ ] Editar usuario
- [ ] Suspender/reactivar usuario
- [ ] Eliminar usuario

**Flujo de datos:**
```
DB: auth_management.profiles, user_roles
    ↓
Backend: AdminUsersController → AdminUsersService
    ↓
API Frontend: adminAPI.getUsers(), updateUser(), suspendUser(), etc.
    ↓
Types: User, SystemUser
    ↓
Hook: useUserManagement → fetchUsers()
    ↓
Componente: AdminUsersPage + UserDetailModal
```

---

### PÁGINA 3: AdminInstitutionsPage

**Ruta:** `/admin/institutions`
**Archivo:** `apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx`
**Hook:** `useOrganizations`

**Funcionalidad esperada:**
- [ ] Listar organizaciones con DataTable
- [ ] Crear nueva organización
- [ ] Editar organización
- [ ] Gestionar feature flags por organización
- [ ] Eliminar organización

**Flujo de datos:**
```
DB: auth_management.tenants
    ↓
Backend: AdminOrganizationsController → AdminOrganizationsService
    ↓
API Frontend: adminAPI.getOrganizations(), createOrganization(), etc.
    ↓
Types: Organization (plan, userCount, features)
    ↓
Hook: useOrganizations → fetchOrganizations()
    ↓
Componente: AdminInstitutionsPage + Modales
```

---

### PÁGINA 4: AdminRolesPage

**Ruta:** `/admin/roles`
**Archivo:** `apps/frontend/src/apps/admin/pages/AdminRolesPage.tsx`
**Hooks:** `useRoles`, `useRolePermissions`

**Funcionalidad esperada:**
- [ ] Listar roles del sistema
- [ ] Ver permisos de cada rol
- [ ] Editar permisos de rol
- [ ] Visualización de permisos por módulo

**Flujo de datos:**
```
DB: auth_management.roles (o similar)
    ↓
Backend: AdminRolesController → AdminRolesService
    ↓
API Frontend: adminAPI.getRoles(), getRolePermissions(), updateRolePermissions()
    ↓
Types: Role, Permission
    ↓
Hooks: useRoles, useRolePermissions
    ↓
Componente: AdminRolesPage
```

---

### PÁGINAS 5-12: A documentar conforme avancemos

Cada página seguirá el mismo patrón de análisis detallado.

---

## PROCESO DE ANÁLISIS DETALLADO

Para cada página, ejecutaré:

### Fase A: Exploración (hasta 5 agentes en paralelo)
1. **Agente DB**: Identificar tablas/vistas/funciones usadas
2. **Agente Backend**: Analizar controlador, servicio, DTOs
3. **Agente API**: Analizar funciones en adminAPI.ts
4. **Agente Types**: Analizar interfaces TypeScript
5. **Agente Component**: Analizar hook y componente

### Fase B: Validación del Análisis (Architecture-Analyst)
- Consolidar hallazgos
- Identificar gaps y problemas
- Documentar en reporte

### Fase C: Corrección (hasta 5 agentes en paralelo si necesario)
- Orquestar agentes especializados según problemas encontrados
- Database-Agent, Backend-Agent, Frontend-Agent

### Fase D: Validación del Usuario
- Usuario prueba en navegador
- Reporta resultados

### Fase E: Ajustes según Feedback
- Corregir problemas reportados
- Re-validar

---

## CRITERIOS DE ACEPTACIÓN POR PÁGINA

Una página se considera **COMPLETADA** cuando:

- [ ] Carga datos al entrar (sin necesidad de acción del usuario)
- [ ] Muestra estado de carga (spinner/loading)
- [ ] Muestra errores de forma clara (si los hay)
- [ ] Funcionalidad de búsqueda opera correctamente
- [ ] Filtros funcionan
- [ ] Acciones CRUD funcionan (si aplica)
- [ ] Paginación funciona (si aplica)
- [ ] Usuario valida que todo está correcto

---

## TRACKING DE PROGRESO

| Página | Análisis | Corrección | Validación | Completada |
|--------|----------|------------|------------|------------|
| 1. Dashboard | ⏳ | ⬜ | ⬜ | ⬜ |
| 2. Users | ⬜ | ⬜ | ⬜ | ⬜ |
| 3. Institutions | ⬜ | ⬜ | ⬜ | ⬜ |
| 4. Roles | ⬜ | ⬜ | ⬜ | ⬜ |
| 5. Content | ⬜ | ⬜ | ⬜ | ⬜ |
| 6. Gamification | ⬜ | ⬜ | ⬜ | ⬜ |
| 7. Monitoring | ⬜ | ⬜ | ⬜ | ⬜ |
| 8. Alerts | ⬜ | ⬜ | ⬜ | ⬜ |
| 9. Analytics | ⬜ | ⬜ | ⬜ | ⬜ |
| 10. Progress | ⬜ | ⬜ | ⬜ | ⬜ |
| 11. Reports | ⬜ | ⬜ | ⬜ | ⬜ |
| 12. ClassroomTeacher | ⬜ | ⬜ | ⬜ | ⬜ |

**Leyenda:** ⬜ Pendiente | ⏳ En progreso | ✅ Completado | ❌ Bloqueado

---

## INICIO

**Primera página a analizar:** AdminDashboardPage

¿Listo para comenzar?
