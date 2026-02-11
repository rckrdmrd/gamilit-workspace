# US-GAM-ADM-01: Portal Admin con Gestion de Contenido

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

**Epica:** EPIC-GAM-FRONTEND
**Modulo(s):** content, settings, analytics, users
**Story Points:** 8
**Prioridad:** P1
**Sprint:** Completado

## Descripcion
**Como** administrador de la plataforma
**Quiero** un portal para gestionar contenido educativo, usuarios, configuracion global y ver analytics
**Para** mantener la plataforma actualizada y monitorear su uso a nivel global

## Criterios de Aceptacion

### CA-1: Dashboard Admin Global
**Given** un administrador autenticado
**When** accede al dashboard
**Then** ve metricas globales: total de escuelas (tenants), usuarios activos por rol, engagement metrics (DAU, WAU, MAU), ejercicios completados por periodo, contenido publicado, y alertas del sistema

### CA-2: Gestion de Contenido Educativo
**Given** un administrador en el modulo de contenido
**When** gestiona lecturas y ejercicios
**Then** puede crear/editar/publicar lecturas con metadatos (grado, dificultad, tema, modulo), crear ejercicios por tipo con configuracion de respuestas correctas, versionar contenido (draft, published, archived), categorizar por modulo y grado, y gestionar multimedia (imagenes, audio, video)

### CA-3: Gestion de Usuarios y Roles
**Given** un administrador en el modulo de usuarios
**When** gestiona la base de usuarios
**Then** puede listar, buscar y filtrar usuarios por rol y tenant, activar/desactivar cuentas, asignar roles, importar usuarios masivamente (CSV), y ver historial de actividad por usuario

### CA-4: Configuracion del Sistema
**Given** un administrador en configuracion
**When** ajusta parametros del sistema
**Then** puede configurar: parametros de gamificacion (XP por ejercicio, umbrales de rango), feature flags por tenant, modulos habilitados por plan, templates de notificaciones, y configuracion de tienda (precios, items)

### CA-5: Analytics Globales
**Given** un administrador en la seccion de analytics
**When** consulta metricas
**Then** ve graficos de: tendencia de registro de usuarios, engagement por periodo, distribucion de progreso por modulo, uso por dispositivo, y puede filtrar por escuela/periodo/modulo

### CA-6: Gestion de Escuelas (Tenants)
**Given** un administrador que gestiona escuelas
**When** accede a la seccion de tenants
**Then** puede crear nuevas escuelas, configurar plan y features por escuela, ver metricas de uso por escuela, y gestionar administradores locales

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | React 19, Zustand 5.x, TailwindCSS 4.x, Recharts |
| Componentes FE | AdminDashboard, ContentEditor, ContentVersioning, UserManagement, BulkImport, SystemConfig, GamificationConfig, TenantManager, GlobalAnalytics, FeatureFlagPanel |
| Paginas | 18 (dashboard, contenido, usuarios, configuracion, analytics, tenants, notificaciones, auditoria) |
| Dependencias | US-GAM-EDU-01 (Modulos), US-GAM-ANL-01 (Analytics) |

## Definition of Done
- [ ] Dashboard admin con metricas globales
- [ ] CRUD completo de contenido educativo con versionado
- [ ] Gestion de usuarios y roles
- [ ] Configuracion del sistema y gamificacion
- [ ] Analytics globales con graficos
- [ ] Gestion de tenants
- [ ] Tests frontend (cobertura >= 70%)
- [ ] Inventarios actualizados

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RF-GAM-009, RF-GAM-010 |
| Epica padre | EPIC-GAM-FRONTEND |
