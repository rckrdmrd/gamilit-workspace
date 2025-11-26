# PLAN DETALLADO - FASE 2: 9 PÁGINAS FUERA DE ALCANCE MVP
## Portal de Administrador GAMILIT

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Tipo:** Detailed Implementation Roadmap
**Fase:** Fase 2 (Post-MVP)

---

## TABLA DE CONTENIDO

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Análisis Detallado por Página](#análisis-detallado-por-página)
3. [Orden de Implementación Recomendado](#orden-de-implementación-recomendado)
4. [Estimación Total de Esfuerzo](#estimación-total-de-esfuerzo)
5. [Roadmap y Timeline](#roadmap-y-timeline)
6. [Matriz de Dependencias](#matriz-de-dependencias)

---

## RESUMEN EJECUTIVO

### Páginas Fuera del MVP Scope (9 Páginas)

De las 13 páginas del Portal Admin, **4 están en alcance MVP** y **9 están fuera**:

| # | Página | Estado Actual | Prioridad | SP Estimado |
|---|--------|---------------|-----------|-------------|
| 1 | AdminUsersPage | 15% completo | ALTA | 8-10 SP |
| 2 | AdminRolesPage | 0% (UnderConstruction) | MEDIA | 12-15 SP |
| 3 | AdminContentPage | 25% completo | MEDIA | 20-25 SP |
| 4 | AdminApprovalsPage | 50% completo | BAJA | 15-18 SP |
| 5 | AdminMonitoringPage | 5% (UnderConstruction) | MEDIA | 10-12 SP |
| 6 | AdminAdvancedPage | 10% (UnderConstruction) | BAJA | 18-22 SP |
| 7 | AdminReportsPage | 0% (UnderConstruction) | ALTA | 12-15 SP |
| 8 | AdminSettingsPage | 0% (placeholder) | MEDIA | 8-10 SP |
| 9 | AdminInstitutionsDetailPage | 60% completo | ALTA | 5-8 SP |

**Total Estimado:** 108-135 Story Points (864-1,080 horas)

---

## ANÁLISIS DETALLADO POR PÁGINA

---

### 1. AdminUsersPage - Gestión de Usuarios

**Ruta:** `/admin/users`
**Estado Actual:** 15% completo
**Prioridad:** 🔴 ALTA

#### Estado Actual (Implementado):

**Frontend:**
- ✅ Estructura de página con AdminLayout
- ✅ Hook `useUserManagement` implementado (FE-059)
- ✅ Listado de usuarios con tabla
- ✅ Filtros básicos por rol (STUDENT, TEACHER, ADMIN)
- ✅ Búsqueda por nombre/email
- ✅ Paginación funcional
- ✅ Acciones básicas: Suspender, Reactivar, Eliminar
- ✅ Estadísticas básicas (total usuarios)
- ✅ Badge "En Desarrollo" visible

**Backend:**
- ✅ `GET /api/admin/users` - Listar usuarios
- ✅ `PATCH /api/admin/users/:id/suspend` - Suspender usuario
- ✅ `PATCH /api/admin/users/:id/unsuspend` - Reactivar usuario
- ✅ `DELETE /api/admin/users/:id` - Eliminar usuario (soft delete)

#### Funcionalidades Faltantes (85%):

**CRUD Incompleto:**
- ❌ Botón "Nuevo Usuario" muestra alert (línea 272)
- ❌ Botón "Editar" muestra alert (línea 351)
- ❌ No hay modal de creación de usuario
- ❌ No hay modal de edición de usuario
- ❌ No hay validación de formularios

**Gestión Avanzada:**
- ❌ Importación masiva CSV
- ❌ Exportación a Excel
- ❌ Asignación de roles múltiples
- ❌ Gestión de permisos por usuario
- ❌ Vista detallada de usuario (perfil completo)
- ❌ Historial de actividad del usuario
- ❌ Resetear contraseña
- ❌ Enviar notificación por email

**Backend Endpoints Faltantes:**
- ❌ `POST /api/admin/users` - Crear usuario
- ❌ `PUT /api/admin/users/:id` - Editar usuario
- ❌ `POST /api/admin/users/import` - Importación CSV
- ❌ `GET /api/admin/users/:id/activity` - Historial de actividad
- ❌ `POST /api/admin/users/:id/reset-password` - Resetear contraseña

#### Estimación de Implementación:

| Tarea | SP | Horas |
|-------|----|----|
| Modal de creación de usuario con validación | 2 | 16 |
| Modal de edición de usuario | 2 | 16 |
| Vista detallada de usuario (perfil completo) | 1.5 | 12 |
| Importación masiva CSV | 2 | 16 |
| Exportación a Excel | 1 | 8 |
| Historial de actividad | 1 | 8 |
| Resetear contraseña | 0.5 | 4 |
| Tests E2E | 1 | 8 |
| **TOTAL** | **10-12 SP** | **88 horas** |

#### Prioridad: 🔴 ALTA

**Razón:** Gestión de usuarios es funcionalidad core para administradores. Actualmente dependen de SQL directo o scripts.

**Dependencias:** Ninguna (puede implementarse inmediatamente)

**Business Value:** MUY ALTO - Autonomía del administrador

---

### 2. AdminRolesPage - Roles y Permisos

**Ruta:** `/admin/roles`
**Estado Actual:** 0% (UnderConstruction)
**Prioridad:** 🟡 MEDIA

#### Estado Actual (Implementado):

**Frontend:**
- ✅ Página reemplazada con componente UnderConstruction
- ✅ Mensaje claro de "Disponible en Fase 2"

**Backend:**
- ✅ Roles fijos implementados (STUDENT, TEACHER, ADMIN, SUPER_ADMIN)
- ✅ Guards de autorización por rol

**Versión Anterior (Removida):**
- ❌ Tenía mock data hardcoded
- ❌ No estaba conectada a backend
- ❌ Mostraba 3 roles falsos

#### Funcionalidades Planificadas (100%):

**RBAC Dinámico:**
- ❌ Crear roles personalizados
- ❌ Definir permisos granulares por rol
- ❌ Asignar permisos a funcionalidades específicas
- ❌ Matriz de permisos por módulo
- ❌ Herencia de permisos
- ❌ Roles por institución (multi-tenant)

**UI de Gestión:**
- ❌ Lista de roles del sistema
- ❌ Modal de creación de rol
- ❌ Modal de edición de rol
- ❌ Matriz de permisos interactiva
- ❌ Asignación masiva de permisos
- ❌ Vista de usuarios por rol

**Backend Requerido:**
- ❌ Tabla `rbac.roles` (roles dinámicos)
- ❌ Tabla `rbac.permissions` (permisos del sistema)
- ❌ Tabla `rbac.role_permissions` (relación M:N)
- ❌ `POST /api/admin/roles` - Crear rol
- ❌ `PUT /api/admin/roles/:id` - Editar rol
- ❌ `DELETE /api/admin/roles/:id` - Eliminar rol
- ❌ `GET /api/admin/permissions` - Listar permisos
- ❌ `POST /api/admin/roles/:id/permissions` - Asignar permisos

#### Estimación de Implementación:

| Tarea | SP | Horas |
|-------|----|----|
| Diseño de arquitectura RBAC | 2 | 16 |
| Tablas de base de datos | 1.5 | 12 |
| Backend: CRUD de roles | 3 | 24 |
| Backend: Gestión de permisos | 2 | 16 |
| Frontend: Lista de roles | 1.5 | 12 |
| Frontend: Modal crear/editar rol | 2 | 16 |
| Frontend: Matriz de permisos | 3 | 24 |
| Migración de roles existentes | 1 | 8 |
| Tests unitarios + E2E | 2 | 16 |
| **TOTAL** | **18-20 SP** | **144 horas** |

#### Prioridad: 🟡 MEDIA

**Razón:** Roles fijos son suficientes para MVP. RBAC dinámico es para escalabilidad futura.

**Dependencias:**
- Arquitectura multi-tenant (si se implementa por institución)
- Documentación de permisos del sistema

**Business Value:** MEDIO - Mejora escalabilidad

---

### 3. AdminContentPage - Gestión de Contenido

**Ruta:** `/admin/content`
**Estado Actual:** 25% completo
**Prioridad:** 🟡 MEDIA (Fase 3)

#### Estado Actual (Implementado):

**Frontend:**
- ✅ Estructura de página con 3 tabs:
  - Tab "Pendientes" (ejercicios pendientes de aprobación)
  - Tab "Multimedia" (biblioteca de recursos)
  - Tab "Versiones" (historial de versiones)
- ✅ Hooks implementados:
  - `usePendingExercises()` - Gestión de ejercicios pendientes
  - `useMediaLibrary()` - Gestión de multimedia
  - `useContentVersions()` - Historial de versiones
- ✅ Tabla con DataTable para ejercicios pendientes
- ✅ Botones de Aprobar/Rechazar
- ✅ Modal de rechazo con razón

**Backend:**
- ✅ `GET /api/admin/content/modules` - Listar módulos
- ✅ `GET /api/admin/content/exercises` - Listar ejercicios
- ✅ `GET /api/admin/content/pending` - Ejercicios pendientes
- ⚠️ Endpoints de creación/edición NO implementados

#### Funcionalidades Faltantes (75%):

**Gestión de Módulos:**
- ❌ Lista de módulos educativos con detalles
- ❌ Modal de creación de módulo
- ❌ Modal de edición de módulo
- ❌ Reordenar módulos (drag & drop)
- ❌ Activar/desactivar módulos
- ❌ Estadísticas de completitud por módulo

**Gestión de Ejercicios:**
- ❌ Lista completa de ejercicios con filtros
- ❌ Modal de creación de ejercicio
- ❌ Editor de configuración JSONB por tipo
- ❌ Vista previa del ejercicio (línea 432)
- ❌ Edición de ejercicio existente
- ❌ Duplicar ejercicio
- ❌ Asignar puntos y dificultad

**Biblioteca Multimedia:**
- ❌ Vista de grid de recursos
- ❌ Upload de archivos (drag & drop)
- ❌ Organización por categorías/tags
- ❌ Búsqueda de recursos
- ❌ Eliminación de recursos
- ❌ Gestión de almacenamiento

**Sistema de Versionado:**
- ❌ Historial de cambios de ejercicios
- ❌ Comparación de versiones
- ❌ Rollback a versión anterior
- ❌ Auditoría de cambios

**Backend Endpoints Faltantes:**
- ❌ `POST /api/admin/content/modules` - Crear módulo
- ❌ `PUT /api/admin/content/modules/:id` - Editar módulo
- ❌ `POST /api/admin/content/exercises` - Crear ejercicio
- ❌ `PUT /api/admin/content/exercises/:id` - Editar ejercicio
- ❌ `POST /api/admin/content/media/upload` - Subir archivo
- ❌ `DELETE /api/admin/content/media/:id` - Eliminar archivo
- ❌ `GET /api/admin/content/versions/:id` - Historial

#### Estimación de Implementación:

| Tarea | SP | Horas |
|-------|----|----|
| Backend: CRUD de módulos | 3 | 24 |
| Backend: CRUD de ejercicios | 5 | 40 |
| Backend: Upload multimedia | 2 | 16 |
| Backend: Sistema de versionado | 3 | 24 |
| Frontend: Gestión de módulos | 3 | 24 |
| Frontend: Editor de ejercicios básico | 5 | 40 |
| Frontend: Editores JSONB por tipo (23 tipos) | 10 | 80 |
| Frontend: Biblioteca multimedia | 3 | 24 |
| Frontend: Sistema de preview | 2 | 16 |
| Tests unitarios + E2E | 3 | 24 |
| **TOTAL** | **39-42 SP** | **312 horas** |

#### Prioridad: 🟡 MEDIA (Fase 3)

**Razón:** Contenido actual se gestiona vía seeds SQL. Editor visual es nice-to-have pero no crítico.

**Dependencias:**
- Sistema de asignaciones de maestros (US-PM-002a) debe estar completo
- Storage service para multimedia (S3, Cloud Storage, etc.)

**Business Value:** ALTO - Autonomía para crear contenido educativo

**Nota:** Esta es la funcionalidad MÁS COMPLEJA del Portal Admin. Se recomienda dividir en múltiples sprints.

---

### 4. AdminApprovalsPage - Sistema de Aprobaciones

**Ruta:** `/admin/approvals`
**Estado Actual:** 50% completo
**Prioridad:** 🔵 BAJA (Fase 3)

#### Estado Actual (Implementado):

**Frontend:**
- ✅ Estructura de página completa
- ✅ Hook `usePendingApprovals()` implementado
- ✅ Lista de aprobaciones pendientes
- ✅ Filtros por tipo y estado
- ✅ Botones de Aprobar y Rechazar
- ✅ Estadísticas de aprobaciones
- ✅ Integración real con backend

**Backend:**
- ⚠️ Endpoints parcialmente implementados
- ✅ Tabla `content_approvals` existe
- ⚠️ Flujo de estados incompleto

#### Funcionalidades Faltantes (50%):

**Flujo de Aprobación:**
- ❌ Estados completos (draft → pending → under_review → approved/rejected)
- ❌ Transiciones de estado validadas
- ❌ Bloqueo de edición cuando está en revisión
- ❌ Notificaciones automáticas al cambiar estado

**Interfaz de Revisión:**
- ❌ Vista previa completa del contenido a aprobar
- ❌ Checklist de verificación
- ❌ Modo de prueba interactivo
- ❌ Panel de comentarios por sección
- ❌ Marcar comentarios como críticos/sugerencias

**Historial:**
- ❌ Línea de tiempo de revisiones
- ❌ Auditoría completa de decisiones
- ❌ Estadísticas por revisor
- ❌ Calidad de feedback (rated por teachers)

**Backend Endpoints Faltantes:**
- ❌ `POST /api/admin/approvals/:id/start-review` - Comenzar revisión
- ❌ `POST /api/admin/approvals/:id/request-changes` - Solicitar cambios
- ❌ `GET /api/admin/approvals/history` - Historial completo
- ❌ `GET /api/admin/approvals/stats/:adminId` - Stats por revisor

#### Estimación de Implementación:

| Tarea | SP | Horas |
|-------|----|----|
| Backend: Flujo de estados completo | 2 | 16 |
| Backend: Sistema de comentarios | 2 | 16 |
| Backend: Notificaciones automáticas | 1.5 | 12 |
| Frontend: Interfaz de revisión completa | 4 | 32 |
| Frontend: Checklist de verificación | 1 | 8 |
| Frontend: Modo de prueba interactivo | 3 | 24 |
| Frontend: Historial y auditoría | 2 | 16 |
| Tests E2E del flujo completo | 2 | 16 |
| **TOTAL** | **17-20 SP** | **140 horas** |

#### Prioridad: 🔵 BAJA (Fase 3)

**Razón:** Depende de que AdminContentPage esté completo. Flujo de aprobación no es necesario si admin crea todo el contenido.

**Dependencias:**
- AdminContentPage debe estar completo (39-42 SP)
- Sistema de notificaciones debe existir

**Business Value:** MEDIO - Calidad del contenido, solo si teachers crean contenido

---

### 5. AdminMonitoringPage - Monitoreo del Sistema

**Ruta:** `/admin/monitoring`
**Estado Actual:** 5% (UnderConstruction)
**Prioridad:** 🟡 MEDIA

#### Estado Actual (Implementado):

**Frontend:**
- ✅ Página reemplazada con componente UnderConstruction
- ✅ Lista de características planeadas visible

**Backend:**
- ✅ Health check endpoint básico (`/health`)
- ❌ Métricas de sistema NO expuestas

#### Funcionalidades Planificadas (95%):

**Estado del Sistema:**
- ❌ Health check de servicios (backend, database, Redis)
- ❌ Uso de recursos (CPU, memoria, disco)
- ❌ Latencia de APIs (percentiles p50, p95, p99)
- ❌ Tasa de errores por endpoint
- ❌ Requests por segundo (throughput)

**Alertas del Sistema:**
- ❌ Configuración de alertas personalizadas
- ❌ Alertas de caída de servicios
- ❌ Alertas de alto uso de recursos
- ❌ Alertas de errores críticos
- ❌ Notificaciones por email/Slack

**Logs:**
- ❌ Visualizador de logs del sistema
- ❌ Filtrar por nivel (info, warn, error, critical)
- ❌ Buscar en logs (grep-like)
- ❌ Exportar logs para análisis
- ❌ Streaming de logs en tiempo real

**Métricas de Negocio:**
- ❌ Usuarios activos (DAU, MAU)
- ❌ Engagement (tiempo promedio, sesiones)
- ❌ Conversión (registros, activación)
- ❌ Retención (cohorts, churn)

**Backend Requerido:**
- ❌ Integración con Prometheus/Grafana
- ❌ `GET /api/admin/monitoring/health` - Health check detallado
- ❌ `GET /api/admin/monitoring/metrics` - Métricas del sistema
- ❌ `GET /api/admin/monitoring/logs` - Logs con filtros
- ❌ `POST /api/admin/monitoring/alerts` - Configurar alertas
- ❌ WebSocket para streaming de logs

#### Estimación de Implementación:

| Tarea | SP | Horas |
|-------|----|----|
| Backend: Integración con Prometheus | 2 | 16 |
| Backend: Endpoints de métricas | 2 | 16 |
| Backend: Sistema de alertas | 2 | 16 |
| Backend: API de logs | 1.5 | 12 |
| Frontend: Dashboard de métricas | 3 | 24 |
| Frontend: Configurador de alertas | 2 | 16 |
| Frontend: Visualizador de logs | 2 | 16 |
| Frontend: Gráficas en tiempo real | 2 | 16 |
| Tests de integración | 1 | 8 |
| **TOTAL** | **17-20 SP** | **140 horas** |

#### Prioridad: 🟡 MEDIA

**Razón:** Útil para operations, pero no crítico para usuarios finales.

**Dependencias:**
- Prometheus/Grafana instalado en producción
- Sistema de alertas (SendGrid, Slack webhooks)

**Business Value:** MEDIO - Estabilidad del sistema

---

### 6. AdminAdvancedPage - Herramientas Avanzadas

**Ruta:** `/admin/advanced`
**Estado Actual:** 10% (UnderConstruction)
**Prioridad:** 🔵 BAJA

#### Estado Actual (Implementado):

**Frontend:**
- ✅ Página reemplazada con componente UnderConstruction
- ✅ Lista de características planeadas (Multi-tenant, Feature Flags, A/B Testing, etc.)

**Backend:**
- ❌ Nada implementado

#### Funcionalidades Planificadas (90%):

**Multi-Tenant:**
- ❌ Gestión de tenants (organizaciones)
- ❌ Aislamiento de datos por tenant
- ❌ Configuración por tenant
- ❌ Migración de datos entre tenants

**Feature Flags:**
- ❌ Sistema de feature flags
- ❌ Activar/desactivar features por:
  - Tenant (organización)
  - Usuario individual
  - Porcentaje (gradual rollout)
- ❌ Preview de features en desarrollo
- ❌ Rollback instantáneo

**A/B Testing:**
- ❌ Configurador de experimentos
- ❌ Segmentación de usuarios
- ❌ Métricas de conversión
- ❌ Análisis estadístico (significancia)
- ❌ Winner declaration automática

**Data Migration:**
- ❌ Herramientas de migración de datos
- ❌ Importación masiva
- ❌ Exportación completa
- ❌ Backup/restore por tenant

**Backend Requerido:**
- ❌ Tabla `system.feature_flags`
- ❌ Tabla `system.ab_experiments`
- ❌ `GET /api/admin/advanced/feature-flags` - Listar flags
- ❌ `POST /api/admin/advanced/feature-flags` - Crear flag
- ❌ `PATCH /api/admin/advanced/feature-flags/:id` - Toggle flag
- ❌ `POST /api/admin/advanced/experiments` - Crear experimento
- ❌ `GET /api/admin/advanced/experiments/:id/stats` - Stats del experimento

#### Estimación de Implementación:

| Tarea | SP | Horas |
|-------|----|----|
| Backend: Multi-tenant architecture | 5 | 40 |
| Backend: Feature flags system | 3 | 24 |
| Backend: A/B testing engine | 4 | 32 |
| Backend: Data migration tools | 3 | 24 |
| Frontend: Gestión de tenants | 2 | 16 |
| Frontend: Configurador de feature flags | 3 | 24 |
| Frontend: Dashboard de experimentos | 4 | 32 |
| Frontend: Herramientas de migración | 2 | 16 |
| Tests de integración complejos | 3 | 24 |
| **TOTAL** | **29-32 SP** | **232 horas** |

#### Prioridad: 🔵 BAJA

**Razón:** Herramientas avanzadas para escalabilidad futura. No necesarias para MVP ni Fase 2.

**Dependencias:**
- Multi-tenant architecture debe diseñarse desde el principio
- Analytics backend robusto

**Business Value:** BAJO (corto plazo) / ALTO (largo plazo)

---

### 7. AdminReportsPage - Reportes del Sistema

**Ruta:** `/admin/reports`
**Estado Actual:** 0% (UnderConstruction)
**Prioridad:** 🔴 ALTA

#### Estado Actual (Implementado):

**Frontend:**
- ✅ Página reemplazada con componente UnderConstruction
- ✅ Estimación visible: "Fase 2 - Q2 2026"

**Backend:**
- ❌ Nada implementado

#### Funcionalidades Planificadas (100%):

**Reportes Globales:**
- ❌ Reporte de adopción (usuarios registrados vs activos)
- ❌ Reporte de progreso global (% completado de módulos)
- ❌ Reporte de gamificación (distribución de rangos)
- ❌ Reporte de instituciones (comparativa de desempeño)
- ❌ Reporte de contenido (ejercicios más/menos completados)
- ❌ Reporte de engagement (DAU, MAU, retention)

**Generación de Reportes:**
- ❌ Configurador de reporte (seleccionar métricas)
- ❌ Rango de fechas personalizado
- ❌ Filtros por institución
- ❌ Exportar a PDF (con gráficas)
- ❌ Exportar a Excel (datos tabulares)
- ❌ Exportar a CSV (datos raw)
- ❌ Programar envío automático por email

**Dashboards:**
- ❌ Dashboard ejecutivo (overview)
- ❌ Dashboard de engagement
- ❌ Dashboard de contenido
- ❌ Dashboard de gamificación
- ❌ Dashboards personalizables

**Backend Requerido:**
- ❌ `POST /api/admin/reports/generate` - Generar reporte
- ❌ `GET /api/admin/reports/templates` - Plantillas disponibles
- ❌ `POST /api/admin/reports/schedule` - Programar reporte
- ❌ `GET /api/admin/reports/history` - Historial de reportes
- ❌ `GET /api/admin/reports/:id/download` - Descargar reporte
- ❌ Analytics engine (agregaciones complejas)

#### Estimación de Implementación:

| Tarea | SP | Horas |
|-------|----|----|
| Backend: Analytics engine | 4 | 32 |
| Backend: Generador de reportes | 3 | 24 |
| Backend: Exportación PDF/Excel | 2 | 16 |
| Backend: Sistema de scheduling | 2 | 16 |
| Frontend: Configurador de reportes | 3 | 24 |
| Frontend: Dashboard ejecutivo | 3 | 24 |
| Frontend: Visualizaciones (gráficas) | 3 | 24 |
| Frontend: Historial y gestión | 1.5 | 12 |
| Plantillas de reportes (5 tipos) | 2 | 16 |
| Tests E2E | 1.5 | 12 |
| **TOTAL** | **25-28 SP** | **200 horas** |

#### Prioridad: 🔴 ALTA

**Razón:** Reportes son esenciales para stakeholders y toma de decisiones. Alta demanda de usuarios.

**Dependencias:**
- Analytics backend robusto con agregaciones
- Biblioteca de generación de PDF (puppeteer, wkhtmltopdf)

**Business Value:** MUY ALTO - Visibilidad y toma de decisiones

---

### 8. AdminSettingsPage - Configuración Global

**Ruta:** `/admin/settings`
**Estado Actual:** 0% (placeholder)
**Prioridad:** 🟡 MEDIA

#### Estado Actual (Implementado):

**Frontend:**
- ⚠️ Página existe pero sin implementación real
- ⚠️ Algunos formularios básicos (mock data)

**Backend:**
- ❌ Tabla `system.settings` NO existe
- ❌ Endpoints NO implementados

**Nota:** En el análisis previo, AdminSettingsPage estaba marcado como 95% completo, pero al revisar el código actual, no se encontró la página funcional. Parece haber sido reemplazada o está en diferente ubicación.

#### Funcionalidades Planificadas (100%):

**Parámetros del Sistema:**
- ❌ Nombre de la plataforma
- ❌ Logo personalizado (upload)
- ❌ Colores del tema (brand colors)
- ❌ Idioma por defecto
- ❌ Zona horaria
- ❌ Moneda del sistema

**Email y Notificaciones:**
- ❌ Configuración SMTP
- ❌ Templates de emails
- ❌ Configuración de notificaciones push
- ❌ Integración con SendGrid/Mailgun

**Seguridad:**
- ❌ Duración de sesiones
- ❌ Máximo de intentos de login
- ❌ Requerir 2FA para admins
- ❌ Política de contraseñas
- ❌ IP whitelist

**Mantenimiento:**
- ❌ Modo mantenimiento (enable/disable)
- ❌ Mensaje personalizado de mantenimiento
- ❌ Programar respaldos automáticos
- ❌ Limpieza de caché
- ❌ Limpieza de logs antiguos

**Backend Requerido:**
- ❌ Tabla `system.settings` (key-value store)
- ❌ `GET /api/admin/settings` - Obtener settings
- ❌ `PUT /api/admin/settings` - Actualizar settings
- ❌ `POST /api/admin/settings/logo` - Upload logo
- ❌ `POST /api/admin/settings/test-email` - Test SMTP
- ❌ `POST /api/admin/settings/maintenance-mode` - Toggle

#### Estimación de Implementación:

| Tarea | SP | Horas |
|-------|----|----|
| Backend: Tabla de settings | 1 | 8 |
| Backend: CRUD de settings | 2 | 16 |
| Backend: Upload de logo | 1 | 8 |
| Backend: Test de SMTP | 1 | 8 |
| Frontend: Formulario de General | 2 | 16 |
| Frontend: Formulario de Email | 1.5 | 12 |
| Frontend: Formulario de Seguridad | 1.5 | 12 |
| Frontend: Formulario de Mantenimiento | 1 | 8 |
| Validaciones y tests | 1 | 8 |
| **TOTAL** | **12-14 SP** | **96 horas** |

#### Prioridad: 🟡 MEDIA

**Razón:** Útil para personalización, pero no crítico para operación básica.

**Dependencias:**
- Storage service para logo
- SMTP configurado en producción

**Business Value:** MEDIO - Personalización y branding

---

### 9. AdminInstitutionsDetailPage - Detalle de Institución

**Ruta:** `/admin/institutions/:id`
**Estado Actual:** 60% completo
**Prioridad:** 🔴 ALTA

#### Estado Actual (Implementado):

**Frontend:**
- ✅ Vista básica de detalle de institución
- ✅ Información general de la institución
- ✅ Estadísticas básicas
- ⚠️ Algunos campos hardcoded

**Backend:**
- ✅ `GET /api/admin/organizations/:id` - Obtener institución
- ⚠️ Endpoints de edición NO completos

#### Funcionalidades Faltantes (40%):

**Información Completa:**
- ❌ Todos los datos de la institución (completos)
- ❌ Logo de la institución
- ❌ Información de contacto
- ❌ Dirección completa
- ❌ Datos de facturación

**Estadísticas:**
- ❌ Total de usuarios por rol
- ❌ Total de aulas
- ❌ Total de maestros
- ❌ Progreso promedio de estudiantes
- ❌ Engagement metrics
- ❌ Uso de recursos

**Gestión:**
- ❌ Editar información de la institución
- ❌ Cambiar logo
- ❌ Asignar/desasignar administrador
- ❌ Configurar plan (Free, Pro, Enterprise)
- ❌ Gestionar feature flags por institución
- ❌ Desactivar/activar institución

**Usuarios de la Institución:**
- ❌ Lista de usuarios de la institución
- ❌ Filtros por rol
- ❌ Acciones rápidas (suspender, editar)

**Backend Endpoints Faltantes:**
- ❌ `PUT /api/admin/organizations/:id` - Editar institución
- ❌ `POST /api/admin/organizations/:id/logo` - Upload logo
- ❌ `GET /api/admin/organizations/:id/users` - Usuarios
- ❌ `GET /api/admin/organizations/:id/stats` - Estadísticas

#### Estimación de Implementación:

| Tarea | SP | Horas |
|-------|----|----|
| Backend: Edición de institución | 1.5 | 12 |
| Backend: Upload de logo | 1 | 8 |
| Backend: Stats por institución | 2 | 16 |
| Frontend: Vista completa de detalle | 2 | 16 |
| Frontend: Modal de edición | 1.5 | 12 |
| Frontend: Gestión de usuarios | 1.5 | 12 |
| Frontend: Dashboard de stats | 1.5 | 12 |
| Tests E2E | 1 | 8 |
| **TOTAL** | **12-14 SP** | **96 horas** |

#### Prioridad: 🔴 ALTA

**Razón:** Complementa AdminInstitutionsPage (listado). Vista de detalle es esencial.

**Dependencias:**
- Storage service para logo

**Business Value:** ALTO - Gestión completa de instituciones

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### Criterios de Priorización:

1. **Business Value** (impacto en usuarios)
2. **Complejidad** (esfuerzo de implementación)
3. **Dependencias** (bloqueadores de otras features)
4. **Urgencia** (demanda de stakeholders)

---

### FASE 2A: Quick Wins (Sprint 1-2) - 4 semanas

**Objetivo:** Completar páginas de ALTA prioridad y BAJA complejidad

#### Sprint 1 (2 semanas):
1. **AdminInstitutionsDetailPage** (12-14 SP, 96h)
   - Complementa funcionalidad existente
   - Alta demanda de usuarios
   - Baja complejidad

2. **AdminUsersPage** (10-12 SP, 88h)
   - CRUD de usuarios (sin import/export)
   - Vista detallada de usuario
   - Alta demanda de administradores

**Total Sprint 1:** 22-26 SP (184h)

#### Sprint 2 (2 semanas):
3. **AdminSettingsPage** (12-14 SP, 96h)
   - Configuración global del sistema
   - Personalización y branding
   - Complejidad moderada

**Total Sprint 2:** 12-14 SP (96h)

**Total Fase 2A:** 34-40 SP (280h) = 4 semanas con equipo de 2 devs

---

### FASE 2B: High Value Features (Sprint 3-5) - 6 semanas

**Objetivo:** Implementar reportes y monitoreo (alto valor de negocio)

#### Sprint 3-4 (4 semanas):
4. **AdminReportsPage** (25-28 SP, 200h)
   - Reportes ejecutivos
   - Dashboards
   - Exportación PDF/Excel
   - Alta complejidad

**Total Sprint 3-4:** 25-28 SP (200h)

#### Sprint 5 (2 semanas):
5. **AdminMonitoringPage** (17-20 SP, 140h)
   - Monitoreo del sistema
   - Alertas
   - Logs
   - Complejidad moderada-alta

**Total Sprint 5:** 17-20 SP (140h)

**Total Fase 2B:** 42-48 SP (340h) = 6 semanas con equipo de 2 devs

---

### FASE 2C: Advanced Features (Sprint 6-10) - 10 semanas

**Objetivo:** Implementar funcionalidades avanzadas (media prioridad)

#### Sprint 6-7 (4 semanas):
6. **AdminRolesPage (RBAC)** (18-20 SP, 144h)
   - RBAC dinámico
   - Gestión de roles
   - Matriz de permisos
   - Alta complejidad

**Total Sprint 6-7:** 18-20 SP (144h)

#### Sprint 8-10 (6 semanas):
7. **AdminContentPage** (39-42 SP, 312h)
   - Gestión de módulos
   - Editor de ejercicios
   - Biblioteca multimedia
   - Sistema de versionado
   - MUY alta complejidad

**Total Sprint 8-10:** 39-42 SP (312h)

**Total Fase 2C:** 57-62 SP (456h) = 10 semanas con equipo de 2 devs

---

### FASE 3: Low Priority Features (Sprint 11-15) - 10 semanas

**Objetivo:** Completar funcionalidades de baja prioridad

#### Sprint 11-13 (6 semanas):
8. **AdminApprovalsPage** (17-20 SP, 140h)
   - Sistema de aprobaciones completo
   - Flujo de estados
   - Interfaz de revisión
   - Depende de AdminContentPage

**Total Sprint 11-13:** 17-20 SP (140h)

#### Sprint 14-15 (4 semanas):
9. **AdminAdvancedPage** (29-32 SP, 232h)
   - Multi-tenant
   - Feature flags
   - A/B testing
   - Data migration
   - MUY alta complejidad

**Total Sprint 14-15:** 29-32 SP (232h) - Solo inicio, requiere más sprints

**Total Fase 3:** 46-52 SP (372h) = 10 semanas con equipo de 2 devs

---

## ESTIMACIÓN TOTAL DE ESFUERZO

### Resumen por Página:

| # | Página | Prioridad | SP | Horas | Fase |
|---|--------|-----------|----|----|------|
| 9 | AdminInstitutionsDetailPage | 🔴 ALTA | 12-14 | 96 | 2A |
| 1 | AdminUsersPage | 🔴 ALTA | 10-12 | 88 | 2A |
| 8 | AdminSettingsPage | 🟡 MEDIA | 12-14 | 96 | 2A |
| 7 | AdminReportsPage | 🔴 ALTA | 25-28 | 200 | 2B |
| 5 | AdminMonitoringPage | 🟡 MEDIA | 17-20 | 140 | 2B |
| 2 | AdminRolesPage | 🟡 MEDIA | 18-20 | 144 | 2C |
| 3 | AdminContentPage | 🟡 MEDIA | 39-42 | 312 | 2C |
| 4 | AdminApprovalsPage | 🔵 BAJA | 17-20 | 140 | 3 |
| 6 | AdminAdvancedPage | 🔵 BAJA | 29-32 | 232 | 3 |

**TOTAL:** 179-202 SP (1,448 horas)

---

### Estimación por Fase:

| Fase | Sprints | Semanas | SP | Horas | Páginas |
|------|---------|---------|----|----|---------|
| Fase 2A | 2 | 4 | 34-40 | 280 | 3 |
| Fase 2B | 3 | 6 | 42-48 | 340 | 2 |
| Fase 2C | 5 | 10 | 57-62 | 456 | 2 |
| Fase 3 | 5+ | 10+ | 46-52 | 372 | 2 |
| **TOTAL** | **15+** | **30+ semanas** | **179-202 SP** | **1,448h** | **9 páginas** |

**Nota:** Con equipo de 2 desarrolladores full-time = ~30 semanas (7.5 meses)

---

## ROADMAP Y TIMELINE

### Timeline Estimado (2026):

```
2026 Timeline
─────────────────────────────────────────────────────────────

Q1 (Ene-Mar): FASE 2A
├─ Sprint 1-2: AdminInstitutionsDetailPage + AdminUsersPage
└─ Sprint 3:   AdminSettingsPage

Q2 (Abr-Jun): FASE 2B
├─ Sprint 4-5: AdminReportsPage
└─ Sprint 6:   AdminMonitoringPage

Q3 (Jul-Sep): FASE 2C
├─ Sprint 7-8:  AdminRolesPage (RBAC)
└─ Sprint 9-11: AdminContentPage (Parte 1)

Q4 (Oct-Dic): FASE 3
├─ Sprint 12-13: AdminContentPage (Parte 2)
├─ Sprint 14-15: AdminApprovalsPage
└─ Sprint 16+:   AdminAdvancedPage (inicio)
```

---

### Hitos Principales:

**Milestone 1 (Marzo 2026):** Portal Admin - CRUD Completo
- ✅ Gestión completa de usuarios
- ✅ Gestión completa de instituciones
- ✅ Configuración global del sistema

**Milestone 2 (Junio 2026):** Portal Admin - Analytics & Monitoring
- ✅ Sistema de reportes funcional
- ✅ Dashboards ejecutivos
- ✅ Monitoreo del sistema en tiempo real

**Milestone 3 (Septiembre 2026):** Portal Admin - Advanced Management
- ✅ RBAC dinámico implementado
- ✅ Editor de contenido educativo (básico)
- ✅ Biblioteca multimedia

**Milestone 4 (Diciembre 2026):** Portal Admin - Enterprise Features
- ✅ Sistema de aprobaciones completo
- ✅ Editor de contenido (avanzado)
- 🚧 Herramientas avanzadas (en progreso)

---

## MATRIZ DE DEPENDENCIAS

### Diagrama de Dependencias:

```
┌────────────────────────────────────────────────────────┐
│ FASE 2A (Sin dependencias)                             │
├────────────────────────────────────────────────────────┤
│ AdminInstitutionsDetailPage                            │
│ AdminUsersPage                                         │
│ AdminSettingsPage                                      │
└────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ FASE 2B (Requiere Fase 2A completa)                    │
├────────────────────────────────────────────────────────┤
│ AdminReportsPage (analytics de usuarios)              │
│ AdminMonitoringPage (logs de sistema)                 │
└────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ FASE 2C (Requiere Fase 2A + 2B)                        │
├────────────────────────────────────────────────────────┤
│ AdminRolesPage (gestiona permisos de usuarios)        │
│ AdminContentPage (gestiona contenido educativo)       │
└────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ FASE 3 (Requiere Fase 2C completa)                     │
├────────────────────────────────────────────────────────┤
│ AdminApprovalsPage (requiere AdminContentPage)        │
│ AdminAdvancedPage (feature flags, multi-tenant)       │
└────────────────────────────────────────────────────────┘
```

---

### Dependencias Técnicas:

**Infraestructura:**
- Storage Service (S3/Cloud Storage) - Requerido por: AdminInstitutionsDetailPage, AdminContentPage, AdminSettingsPage
- Email Service (SMTP) - Requerido por: AdminUsersPage, AdminSettingsPage, AdminApprovalsPage
- Analytics Engine - Requerido por: AdminReportsPage
- Prometheus/Grafana - Requerido por: AdminMonitoringPage
- WebSockets - Requerido por: AdminMonitoringPage (logs en tiempo real)

**Datos:**
- Tabla `rbac.roles` - Requerida por: AdminRolesPage
- Tabla `content_approvals` - Requerida por: AdminApprovalsPage
- Tabla `system.settings` - Requerida por: AdminSettingsPage
- Tabla `system.feature_flags` - Requerida por: AdminAdvancedPage

---

## RECOMENDACIONES FINALES

### Estrategia Recomendada:

1. **Priorizar Fase 2A** (Quick Wins)
   - ROI inmediato
   - Autonomía de administradores
   - Baja complejidad

2. **Implementar Fase 2B** en paralelo con US-AE-005 (edición de gamificación)
   - Alto valor de negocio (reportes)
   - No bloquea otras features

3. **Posponer Fase 3** hasta validar demanda
   - AdminAdvancedPage es muy complejo (29-32 SP)
   - Puede no ser necesario a corto plazo
   - Mejor invertir esfuerzo en mejorar features existentes

4. **Considerar equipo dedicado** para AdminContentPage
   - Es la funcionalidad más compleja (39-42 SP)
   - Requiere diseño UX/UI especializado
   - Impacta directamente en experiencia de creación de contenido

---

### Optimizaciones Posibles:

**Reducir Scope:**
- AdminContentPage: Implementar solo CRUD básico sin editor visual de JSONB (ahorrar 10 SP)
- AdminAdvancedPage: Implementar solo Feature Flags (ahorrar 20 SP)
- AdminApprovalsPage: Implementar solo flujo básico sin historial completo (ahorrar 5 SP)

**Total ahorrado:** 35 SP (~280 horas = 4.5 semanas)

**Scope Reducido Total:** 144-167 SP (1,168 horas = ~25 semanas con 2 devs)

---

### Métricas de Éxito:

**Fase 2A:**
- [ ] 100% de admins pueden gestionar usuarios sin SQL directo
- [ ] 100% de instituciones tienen perfil completo
- [ ] Sistema personalizado con logo y colores

**Fase 2B:**
- [ ] Stakeholders reciben reportes semanales automáticos
- [ ] 0 caídas del sistema no detectadas
- [ ] Tiempo de resolución de incidentes < 30 min

**Fase 2C:**
- [ ] Administradores pueden crear roles personalizados
- [ ] Maestros pueden crear ejercicios desde UI (sin seeds)
- [ ] 80% del contenido gestionado vía portal (no SQL)

---

**Documento generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
**Total páginas:** 22
