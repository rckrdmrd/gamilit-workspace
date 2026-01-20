# Plan Maestro: Analisis y Documentacion del Portal Admin

**Task ID:** TASK-2026-01-20-ADMIN-PORTAL-ANALYSIS
**Fecha:** 2026-01-20
**Estado:** IN_PROGRESS
**Metodologia:** CAPVED por cada subtarea

---

## 1. Resumen Ejecutivo

### Estado Actual del Portal Admin

| Metrica | Valor |
|---------|-------|
| **Paginas Frontend** | 17 |
| **Controladores Backend** | 20 |
| **Endpoints REST** | 151+ |
| **DTOs** | 147 |
| **Servicios** | 17 |
| **User Stories documentadas** | 12 |
| **Paginas con US** | 10 |
| **Paginas SIN US formal** | 7 |

### Hallazgos Criticos

1. **Inconsistencia documental:** `_MAP.md` indica US-AE-005 y US-AE-007 como "Especificadas/Pendientes", pero `README.md` las marca como "IMPLEMENTADAS".

2. **Paginas sin documentacion formal:** 7 paginas implementadas no tienen User Story:
   - AdminRolesPage
   - AdminAlertsPage
   - AdminAnalyticsPage
   - AdminProgressPage
   - AdminAdvancedPage
   - AdminNotificationsPage
   - AdminNotificationPreferencesPage

3. **US especificadas no implementadas:**
   - US-AE-010: Crear Usuarios desde Admin (13 SP)
   - US-AE-011: Visor de Audit Logs (8 SP)

---

## 2. Plan de Subtareas por Nivel

### NIVEL 0: DOCUMENTACION BASE (Prerequisitos)

#### T0.1 - Sincronizar estados en _MAP.md
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P0 |
| **Dependencias** | Ninguna |
| **Estimacion** | 1h |
| **Ciclo** | QUICK (E+D) |

**Acciones:**
1. Actualizar estado de US-AE-005: Especificado → IMPLEMENTADO
2. Actualizar estado de US-AE-007: Especificado → IMPLEMENTADO
3. Recalcular metricas (SP implementados vs pendientes)
4. Sincronizar con README.md

---

#### T0.2 - Actualizar TRACEABILITY.yml
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P0 |
| **Dependencias** | T0.1 |
| **Estimacion** | 2h |
| **Ciclo** | QUICK (E+D) |

**Acciones:**
1. Mapear todas las 17 paginas con sus controladores
2. Mapear endpoints por pagina
3. Documentar DTOs utilizados
4. Registrar archivos de codigo por US

---

### NIVEL 1: CREAR USER STORIES FALTANTES

#### T1.1 - US-AE-012: AdminRolesPage
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P1 |
| **Dependencias** | T0.1 |
| **Estimacion** | 2h |
| **Ciclo** | FULL |
| **SP Estimado** | 6 |

**Funcionalidades a documentar:**
- Listado de roles del sistema
- Matriz de permisos por modulo
- Edicion de permisos por rol
- Guards: JwtAuthGuard, AdminGuard

**Endpoints Backend:**
- `GET /admin/roles`
- `GET /admin/roles/permissions`
- `GET /admin/roles/:id/permissions`
- `PUT /admin/roles/:id/permissions`

**Archivo destino:** `historias-usuario/US-AE-012-roles-management.md`

---

#### T1.2 - US-AE-013: AdminAlertsPage
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P1 |
| **Dependencias** | T0.1 |
| **Estimacion** | 3h |
| **Ciclo** | FULL |
| **SP Estimado** | 8 |

**Funcionalidades a documentar:**
- Listado de alertas con filtros (severity, status)
- Detalles de alerta individual
- Acciones: acknowledge, resolve, suppress
- Crear alerta manual
- Estadisticas de alertas

**Endpoints Backend:**
- `GET /admin/alerts`
- `GET /admin/alerts/stats/summary`
- `GET /admin/alerts/:id`
- `POST /admin/alerts`
- `PATCH /admin/alerts/:id/acknowledge`
- `PATCH /admin/alerts/:id/resolve`
- `PATCH /admin/alerts/:id/suppress`

**Archivo destino:** `historias-usuario/US-AE-013-alerts-management.md`

---

#### T1.3 - US-AE-014: AdminAnalyticsPage
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P1 |
| **Dependencias** | T0.1 |
| **Estimacion** | 3h |
| **Ciclo** | FULL |
| **SP Estimado** | 10 |

**Funcionalidades a documentar:**
- Tab Overview: metricas de alto nivel
- Tab Engagement: engagement por segmento de usuario
- Tab Gamification: distribucion XP, ranks, niveles
- Tab Retention: retencion por cohorte mensual
- Exportacion CSV

**Endpoints Backend:**
- `GET /admin/analytics/overview`
- `GET /admin/analytics/engagement`
- `GET /admin/analytics/gamification`
- `GET /admin/analytics/activity-timeline`
- `GET /admin/analytics/top-users`
- `GET /admin/analytics/retention`
- `GET /admin/analytics/export`

**Archivo destino:** `historias-usuario/US-AE-014-analytics-dashboard.md`

---

#### T1.4 - US-AE-015: AdminProgressPage
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P1 |
| **Dependencias** | T0.1 |
| **Estimacion** | 3h |
| **Ciclo** | FULL |
| **SP Estimado** | 10 |

**Funcionalidades a documentar:**
- Vista Overview: progreso global del sistema
- Vista por Classroom: progreso por aula
- Vista por Estudiante: detalle individual
- Logros de estudiante
- Estadisticas por modulo/ejercicio
- Exportacion CSV

**Endpoints Backend:**
- `GET /admin/progress/overview`
- `GET /admin/progress/classrooms/:id`
- `GET /admin/progress/students/:id`
- `GET /admin/progress/students/:id/achievements`
- `GET /admin/progress/modules/:id`
- `GET /admin/progress/exercises/:id`
- `GET /admin/progress/export`

**Archivo destino:** `historias-usuario/US-AE-015-progress-tracking.md`

---

#### T1.5 - US-AE-016: AdminAdvancedPage
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P2 |
| **Dependencias** | T0.1 |
| **Estimacion** | 4h |
| **Ciclo** | FULL |
| **SP Estimado** | 12 |

**Funcionalidades a documentar:**
- Panel de Feature Flags (CRUD)
- Dashboard de A/B Testing
- Gestion de Intervenciones estudiantiles
- Economia del juego (economia panel)

**Endpoints Backend (Feature Flags):**
- `GET /admin/feature-flags`
- `GET /admin/feature-flags/:key`
- `POST /admin/feature-flags`
- `PUT /admin/feature-flags/:key`
- `POST /admin/feature-flags/:key/enable`
- `POST /admin/feature-flags/:key/disable`
- `PUT /admin/feature-flags/:key/rollout`
- `DELETE /admin/feature-flags/:key`

**Endpoints Backend (Interventions):**
- `GET /admin/interventions`
- `GET /admin/interventions/:id`
- `PATCH /admin/interventions/:id/acknowledge`
- `PATCH /admin/interventions/:id/resolve`
- `DELETE /admin/interventions/:id/dismiss`

**Archivo destino:** `historias-usuario/US-AE-016-advanced-admin.md`

---

#### T1.6 - US-AE-017: AdminNotificationsPage
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P2 |
| **Dependencias** | T0.1 |
| **Estimacion** | 2h |
| **Ciclo** | FULL |
| **SP Estimado** | 6 |

**Funcionalidades a documentar:**
- Listado de notificaciones con filtros
- Integracion WebSocket para tiempo real
- Marcar como leidas/no leidas
- Filtrado por tipo y prioridad

**Archivo destino:** `historias-usuario/US-AE-017-notifications-management.md`

---

#### T1.7 - US-AE-018: AdminNotificationPreferencesPage
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P2 |
| **Dependencias** | T1.6 |
| **Estimacion** | 2h |
| **Ciclo** | FULL |
| **SP Estimado** | 4 |

**Funcionalidades a documentar:**
- Configuracion de preferencias multicanal (email, push, in-app)
- Tipos de notificacion configurables
- Frecuencia de notificaciones

**Archivo destino:** `historias-usuario/US-AE-018-notification-preferences.md`

---

### NIVEL 2: ESPECIFICACIONES TECNICAS

#### T2.1 - Especificacion: Operaciones Bulk Asincronas
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P1 |
| **Dependencias** | T1.1 |
| **Estimacion** | 3h |
| **Ciclo** | FULL |

**Contenido:**
- Patron de operaciones asincronas (202 ACCEPTED)
- DTOs de entrada: BulkSuspendUsersDto, BulkActivateUsersDto, BulkUpdateRoleDto, BulkDeleteUsersDto
- DTO de salida: BulkOperationStatusDto
- Flujo de polling para estado de operacion
- Manejo de errores parciales

**Endpoints:**
- `POST /admin/bulk-operations/suspend-users` → 202
- `POST /admin/bulk-operations/activate-users` → 202
- `POST /admin/bulk-operations/update-role` → 202
- `POST /admin/bulk-operations/delete-users` → 202
- `GET /admin/bulk-operations/:id` → Status

**Archivo destino:** `especificaciones/ET-BULK-OPERATIONS.md`

---

#### T2.2 - Especificacion: Sistema de Exportacion
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P1 |
| **Dependencias** | T1.3, T1.4 |
| **Estimacion** | 2h |
| **Ciclo** | FULL |

**Contenido:**
- Formatos soportados: CSV (analytics, progress)
- Headers HTTP para descarga
- Estructura de archivos CSV
- Tipos de exportacion: users, progress, analytics, reports

**Endpoints con exportacion:**
- `GET /admin/analytics/export?type=...&format=csv`
- `GET /admin/progress/export?type=students|classrooms|modules`
- `GET /admin/reports/:id/download`

**Archivo destino:** `especificaciones/ET-EXPORT-SYSTEM.md`

---

#### T2.3 - Especificacion: Sistema de Reportes
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P1 |
| **Dependencias** | T0.1 |
| **Estimacion** | 2h |
| **Ciclo** | FULL |

**Contenido:**
- Tipos de reportes (usuarios, progreso, gamificacion, sistema)
- Formatos: PDF, CSV, Excel
- Generacion asincrona
- Programacion de reportes (schedule)

**Endpoints:**
- `POST /admin/reports/generate`
- `GET /admin/reports`
- `GET /admin/reports/:id/download`
- `DELETE /admin/reports/:id`
- `POST /admin/reports/:id/schedule`

**Archivo destino:** `especificaciones/ET-REPORTS-SYSTEM.md`

---

### NIVEL 3: VALIDACION Y COHERENCIA

#### T3.1 - Validar Coherencia Frontend ↔ Backend
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P0 |
| **Dependencias** | T0.2, T1.* |
| **Estimacion** | 4h |
| **Ciclo** | ANALYSIS |

**Verificar:**
- Cada pagina tiene sus endpoints conectados
- DTOs de frontend coinciden con backend
- Tipos TypeScript alineados
- Manejo de errores consistente

**Entregable:** Reporte de coherencia con gaps identificados

---

#### T3.2 - Validar Coherencia Backend ↔ Base de Datos
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P1 |
| **Dependencias** | T3.1 |
| **Estimacion** | 3h |
| **Ciclo** | ANALYSIS |

**Verificar:**
- Entities tienen tablas correspondientes
- Campos de entity coinciden con columnas
- Relaciones correctas (FK)
- Vistas materializadas utilizadas

**Entregable:** Reporte de coherencia BD

---

### NIVEL 4: PURGA Y LIMPIEZA

#### T4.1 - Purga de Documentacion Obsoleta
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P2 |
| **Dependencias** | T3.1, T3.2 |
| **Estimacion** | 2h |
| **Ciclo** | QUICK |

**Candidatos a purga:**
- Documentos con estados incorrectos
- Especificaciones de features descartados
- Duplicados en diferentes ubicaciones

---

#### T4.2 - Actualizar Inventarios
| Atributo | Valor |
|----------|-------|
| **Prioridad** | P1 |
| **Dependencias** | T4.1 |
| **Estimacion** | 2h |
| **Ciclo** | QUICK |

**Actualizar:**
- FRONTEND_INVENTORY.yml (totales de admin)
- BACKEND_INVENTORY.yml (endpoints admin)
- MASTER_INVENTORY.yml (consolidado)

---

## 3. Orden de Ejecucion (Grafo de Dependencias)

```
NIVEL 0 (Base)
├── T0.1 Sincronizar _MAP.md
│   └── T0.2 Actualizar TRACEABILITY.yml

NIVEL 1 (User Stories) - Pueden ejecutarse en paralelo
├── T1.1 US-AE-012 Roles
├── T1.2 US-AE-013 Alerts
├── T1.3 US-AE-014 Analytics
├── T1.4 US-AE-015 Progress
├── T1.5 US-AE-016 Advanced
├── T1.6 US-AE-017 Notifications
│   └── T1.7 US-AE-018 NotificationPreferences

NIVEL 2 (Especificaciones) - Requieren US completadas
├── T2.1 Bulk Operations (req: T1.1)
├── T2.2 Export System (req: T1.3, T1.4)
└── T2.3 Reports System (req: T0.1)

NIVEL 3 (Validacion)
├── T3.1 Coherencia FE↔BE (req: T0.2, T1.*)
└── T3.2 Coherencia BE↔BD (req: T3.1)

NIVEL 4 (Limpieza)
├── T4.1 Purga Docs (req: T3.1, T3.2)
└── T4.2 Update Inventarios (req: T4.1)
```

---

## 4. Resumen de Story Points Nuevos

| US Nueva | SP | Prioridad |
|----------|----|----|
| US-AE-012 Roles | 6 | P1 |
| US-AE-013 Alerts | 8 | P1 |
| US-AE-014 Analytics | 10 | P1 |
| US-AE-015 Progress | 10 | P1 |
| US-AE-016 Advanced | 12 | P2 |
| US-AE-017 Notifications | 6 | P2 |
| US-AE-018 NotificationPreferences | 4 | P2 |
| **TOTAL NUEVAS** | **56 SP** | - |

**Total epica actualizado:**
- Original: 148 SP
- + Nuevas: 56 SP
- **Total: 204 SP**

---

## 5. Estrategia de Ejecucion con Subagentes

### Fase 1: Documentacion Base (Secuencial)
- 1 agente para T0.1 y T0.2

### Fase 2: User Stories (Paralelo - hasta 4 agentes)
- Agente 1: T1.1 + T1.2
- Agente 2: T1.3 + T1.4
- Agente 3: T1.5
- Agente 4: T1.6 + T1.7

### Fase 3: Especificaciones (Paralelo - 3 agentes)
- Agente 1: T2.1
- Agente 2: T2.2
- Agente 3: T2.3

### Fase 4: Validacion (Secuencial)
- 1 agente para T3.1, T3.2

### Fase 5: Limpieza (Secuencial)
- 1 agente para T4.1, T4.2

---

## 6. Criterios de Aceptacion Global

1. **Todas las 17 paginas tienen US documentada**
2. **Coherencia 100% entre capas (FE ↔ BE ↔ BD)**
3. **Inventarios actualizados con totales correctos**
4. **Documentacion obsoleta eliminada o archivada**
5. **TRACEABILITY.yml completo y actualizado**
6. **Estados en _MAP.md y README.md sincronizados**

---

**Creado:** 2026-01-20
**Autor:** Claude (Arquitecto de Documentacion)
**Ciclo:** CAPVED MODE:ANALYSIS + MODE:FULL
