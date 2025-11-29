# REPORTE DE ANÁLISIS: Portal Students → Impacto en Portal Admin

**Versión:** 1.0.0
**Fecha:** 2025-11-29
**Analista:** Architecture-Analyst
**Tipo de tarea:** Análisis de requerimientos y dependencias

---

## 📋 RESUMEN EJECUTIVO

Este reporte presenta el análisis completo del **Portal de Students** de GAMILIT y su relación con el **Portal de Admin**, identificando gaps, dependencias y requerimientos de actualización necesarios para garantizar el correcto funcionamiento de ambos portales.

### Alcance del Análisis
- ✅ Portal Students (frontend): 27 páginas, 41 componentes, 14 hooks
- ✅ Portal Admin (frontend): 8 páginas principales relacionadas con students
- ✅ Backend: 15+ APIs de students, 10+ APIs de admin
- ✅ Dependencias cruzadas entre portales

### Hallazgos Principales
- **Cobertura funcional Admin-Students:** ~70%
- **Gaps críticos identificados:** 8
- **Gaps funcionales identificados:** 12
- **Requerimientos de actualización:** 15

---

## 🎯 FASE 1: ANÁLISIS COMPLETO

### 1.1 Estructura del Portal Students

```
apps/frontend/src/apps/student/
├── pages/                    # 27 páginas
│   ├── DashboardComplete.tsx     # Dashboard principal
│   ├── ExercisePage.tsx          # Reproductor (1,070 líneas)
│   ├── ModuleDetailPage.tsx      # Detalle de módulo
│   ├── AssignmentsPage.tsx       # Tareas asignadas (NUEVO P1-002)
│   ├── MyProgressPage.tsx        # Mi progreso
│   ├── GamificationPage.tsx      # Centro de gamificación
│   ├── AchievementsPage.tsx      # Logros
│   ├── LeaderboardPage.tsx       # Rankings
│   ├── MissionsPage.tsx          # Misiones
│   ├── FriendsPage.tsx           # Amigos
│   ├── GuildsPage.tsx            # Gremios
│   ├── ShopPage.tsx              # Tienda
│   ├── InventoryPage.tsx         # Inventario
│   ├── EnhancedProfilePage.tsx   # Perfil
│   ├── SettingsPage.tsx          # Configuración (995 líneas)
│   └── [Auth pages]              # Login, Register, 2FA, etc.
├── components/               # 41 componentes reutilizables
├── hooks/                    # 14 hooks especializados
└── router/                   # Configuración de rutas
```

### 1.2 Funcionalidades del Portal Students

| Área | Funcionalidades | Estado |
|------|-----------------|--------|
| **Educación** | Dashboard, Módulos, Ejercicios, Auto-guardado, Pistas | ✅ Implementado |
| **Tareas** | Ver tareas asignadas, Detalle, Calificaciones | ✅ Nuevo (P1-002) |
| **Gamificación** | XP, Rangos Maya, Logros, Misiones, Leaderboard | ✅ Implementado |
| **Economía** | ML Coins, Tienda, Inventario, Comodines | ✅ Implementado |
| **Social** | Amigos, Gremios, Equipos, Desafíos | ✅ Implementado |
| **Perfil** | Configuración, Notificaciones, 2FA | ✅ Implementado |

### 1.3 APIs Consumidas por Students

```yaml
Educación:
  - GET /api/v1/progress/users/:userId               # Progreso general
  - GET /api/v1/progress/users/:userId/summary       # Resumen
  - GET /api/v1/educational/exercises/:id            # Ejercicio
  - POST /api/v1/educational/exercises/:id/submit    # Envío
  - POST /api/v1/progress/exercises/:id/autosave     # Auto-guardado

Tareas (NUEVO):
  - GET /api/student/assignments                     # Mis tareas
  - GET /api/student/assignments/:id                 # Detalle tarea
  - GET /api/student/assignments/grades/summary      # Calificaciones

Gamificación:
  - GET /api/v1/gamification/users/:userId/stats     # Estadísticas
  - GET /api/v1/gamification/achievements            # Logros
  - GET /api/v1/gamification/leaderboard/*           # Rankings
  - GET /api/v1/gamification/missions/*              # Misiones

Social:
  - GET /api/v1/social/classrooms/*                  # Aulas
  - GET /api/v1/social/friends/*                     # Amigos
  - GET /api/v1/social/guilds/*                      # Gremios
```

---

## 🔗 DEPENDENCIAS STUDENTS → ADMIN

### 2.1 Matriz de Dependencias

```
PORTAL STUDENT                    DEPENDE DE →                 ADMIN/BACKEND
─────────────────────────────────────────────────────────────────────────────
Dashboard (progreso)          →   Admin configura módulos visibles
Ejercicios disponibles        →   Admin aprueba contenido educativo
Gamificación (XP, rangos)     →   Admin configura parámetros gamificación
Leaderboard (rankings)        →   Admin gestiona aulas/classrooms
Tareas asignadas              →   Teacher/Admin crea y asigna tareas
Perfil (estado cuenta)        →   Admin puede suspender/activar cuenta
Notificaciones                →   Admin configura templates y triggers
Acceso a aulas                →   Admin gestiona inscripciones
```

### 2.2 Flujo de Datos Admin → Student

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ADMIN configura:                                                         │
│ ├─ Usuarios (suspend/activate) → Afecta acceso del student              │
│ ├─ Gamificación (XP params)    → Afecta progreso mostrado               │
│ ├─ Contenido (approvals)       → Afecta ejercicios visibles             │
│ ├─ Classroom-Teacher           → Afecta contenido asignado              │
│ └─ Configuración general       → Afecta toda la plataforma              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STUDENT ve/consume:                                                      │
│ ├─ Dashboard con progreso según config admin                            │
│ ├─ Ejercicios aprobados por admin                                       │
│ ├─ XP/Coins según parámetros de admin                                   │
│ ├─ Posición en leaderboard                                              │
│ └─ Tareas asignadas por teacher (gestionado por admin)                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ GAPS IDENTIFICADOS

### 3.1 GAPS CRÍTICOS (Requieren atención inmediata)

| ID | Gap | Impacto | Portal Afectado |
|----|-----|---------|-----------------|
| **GAP-C01** | Admin NO puede crear nuevos usuarios/students | Admins no pueden registrar estudiantes | Admin |
| **GAP-C02** | Admin NO ve datos de assignments/tareas | No hay visibilidad de tareas asignadas | Admin |
| **GAP-C03** | Admin NO ve uso de comodines/power-ups | Sin tracking de power-ups por student | Admin |
| **GAP-C04** | Admin NO ve misiones activas de students | Sin visibilidad de engagement en misiones | Admin |
| **GAP-C05** | Admin NO puede notificar a students al suspender | Comunicación unidireccional | Admin |
| **GAP-C06** | RLS incompleto en ejercicios | Students pueden ver TODOS los ejercicios | Backend |
| **GAP-C07** | Sin filtros avanzados de usuarios | Solo búsqueda básica por nombre/email | Admin |
| **GAP-C08** | Sin página de Audit Logs | Hook existe pero no hay UI | Admin |

### 3.2 GAPS FUNCIONALES (Mejoras importantes)

| ID | Gap | Descripción | Prioridad |
|----|-----|-------------|-----------|
| **GAP-F01** | Admin NO ve skills/competencias | Sin analytics de skills por student | P2 |
| **GAP-F02** | Admin NO ve social graph | Sin visibilidad de redes de amigos | P3 |
| **GAP-F03** | Admin NO ve teams/equipos | Sin performance analytics de equipos | P2 |
| **GAP-F04** | Sin endpoint student→feedback | Student no puede pedir revisión | P2 |
| **GAP-F05** | Analytics con datos limitados | Engagement/Retention requieren 30 días | P3 |
| **GAP-F06** | Reportes en memoria | Backend no persiste reportes | P2 |
| **GAP-F07** | Sin real-time updates admin→teacher | WebSocket faltante | P2 |
| **GAP-F08** | Sin bulk import de students | No hay carga masiva de usuarios | P1 |
| **GAP-F09** | Sin permission management UI | Admin no gestiona permisos bloqueados | P2 |
| **GAP-F10** | Settings page vacía | AdminSettingsPage sin implementar | P3 |
| **GAP-F11** | Classroom-Teacher incompleto | Falta add/remove teachers completo | P1 |
| **GAP-F12** | Sin student dashboard endpoint | No hay resumen consolidado | P2 |

### 3.3 Inconsistencias Backend-Frontend

| ID | Inconsistencia | Detalle |
|----|----------------|---------|
| **INC-01** | ID conversion | JWT usa `auth.users.id`, ejercicios usan `profiles.id` |
| **INC-02** | Timing de rewards | XP en submission, rewards por separado |
| **INC-03** | Classroom visibility | GET /classrooms devuelve TODAS, no filtradas |

---

## 📋 REQUERIMIENTOS DE ACTUALIZACIÓN

### 4.1 Requerimientos para Portal ADMIN

#### REQ-ADM-001: Tab de Assignments
**Prioridad:** P0 - Crítico
**Descripción:** Agregar sección para visualizar tareas asignadas a students
**Detalle:**
- Ver todas las tareas por classroom
- Ver estado de cada tarea (pendiente, enviada, calificada)
- Ver calificaciones y feedback
- Filtrar por student, fecha, estado

**Endpoints requeridos:**
```
GET /admin/assignments                    # Listar todas las tareas
GET /admin/assignments/:id                # Detalle de tarea
GET /admin/assignments/classrooms/:id     # Tareas por aula
GET /admin/assignments/students/:id       # Tareas por estudiante
```

#### REQ-ADM-002: Crear Usuarios (Students)
**Prioridad:** P1 - Alto
**Descripción:** Completar UI para crear nuevos usuarios
**Detalle:**
- Formulario de creación de usuario
- Bulk import desde CSV
- Asignación automática a classroom

**Componentes requeridos:**
- `CreateUserModal`
- `BulkImportDialog`
- `UserCreationForm`

#### REQ-ADM-003: Filtros Avanzados de Usuarios
**Prioridad:** P1 - Alto
**Descripción:** Agregar filtros avanzados en AdminUsersPage
**Filtros faltantes:**
- Por institución/organización
- Por fecha de registro
- Por último acceso
- Por nivel de gamificación
- Por classroom

#### REQ-ADM-004: Tab de Comodines/Power-ups
**Prioridad:** P2 - Medio
**Descripción:** Ver uso de power-ups por estudiante
**Detalle:**
- Historial de compras
- Historial de uso
- Estadísticas agregadas

#### REQ-ADM-005: Tab de Misiones
**Prioridad:** P2 - Medio
**Descripción:** Ver misiones activas de students
**Detalle:**
- Misiones diarias/semanales en progreso
- Completion rates
- Engagement metrics

#### REQ-ADM-006: Página de Audit Logs
**Prioridad:** P1 - Alto
**Descripción:** Implementar AdminAuditLogsPage
**Detalle:**
- Hook `useAuditLogs()` ya existe
- Crear página con tabla de logs
- Filtros por tipo, usuario, fecha
- Exportar logs

#### REQ-ADM-007: Notificaciones al Suspender
**Prioridad:** P2 - Medio
**Descripción:** Notificar a student cuando se suspende/activa cuenta
**Integración:** Usar notification service existente

### 4.2 Requerimientos para BACKEND

#### REQ-BE-001: Endpoint Student Dashboard
**Prioridad:** P1 - Alto
**Descripción:** Crear endpoint consolidado para dashboard student
```
GET /api/v1/student/dashboard
Response: {
  progress: {...},
  achievements: {...},
  assignments: {...},
  leaderboard_position: {...},
  missions: {...}
}
```

#### REQ-BE-002: RLS en Ejercicios
**Prioridad:** P0 - Crítico
**Descripción:** Filtrar ejercicios por classroom del estudiante
**Cambio:** GET /exercises debe aplicar RLS por tenant/classroom

#### REQ-BE-003: Centralizar ID Conversion
**Prioridad:** P1 - Alto
**Descripción:** Crear servicio compartido para conversión auth.users.id ↔ profiles.id

#### REQ-BE-004: Endpoint Request Review
**Prioridad:** P2 - Medio
**Descripción:** Permitir que student solicite revisión
```
POST /api/v1/progress/submissions/:id/request-review
```

#### REQ-BE-005: Admin Assignments API
**Prioridad:** P0 - Crítico
**Descripción:** Exponer endpoints de assignments para admin
```
GET /admin/assignments
GET /admin/assignments/stats
GET /admin/assignments/classrooms/:id
```

### 4.3 Requerimientos para Frontend STUDENT

#### REQ-ST-001: Indicador de Sincronización
**Prioridad:** P2 - Medio
**Descripción:** Mostrar estado de sincronización en tiempo real
**Detalle:** Indicador visual cuando admin hace cambios que afectan al student

#### REQ-ST-002: Notificación de Cuenta Suspendida
**Prioridad:** P1 - Alto
**Descripción:** Mensaje claro cuando cuenta es suspendida
**Detalle:** Redirect a página de información con razón y contacto

---

## 📊 MATRIZ DE PRIORIZACIÓN

### Por Impacto y Esfuerzo

```
                    BAJO ESFUERZO          ALTO ESFUERZO
                    ─────────────          ─────────────
ALTO IMPACTO   │  REQ-ADM-003           REQ-ADM-001
               │  REQ-ADM-006           REQ-ADM-002
               │  REQ-BE-002            REQ-BE-001
               │                        REQ-BE-005
               │
BAJO IMPACTO   │  REQ-ADM-007           REQ-ADM-004
               │  REQ-ST-001            REQ-ADM-005
               │  REQ-BE-004            REQ-ST-002
```

### Orden de Implementación Sugerido

```yaml
Sprint 1 (P0 - Críticos):
  - REQ-BE-002: RLS en ejercicios
  - REQ-BE-005: Admin Assignments API
  - REQ-ADM-001: Tab de Assignments

Sprint 2 (P1 - Altos):
  - REQ-ADM-002: Crear usuarios
  - REQ-ADM-003: Filtros avanzados
  - REQ-ADM-006: Audit Logs
  - REQ-BE-001: Student Dashboard endpoint
  - REQ-BE-003: Centralizar ID conversion

Sprint 3 (P2 - Medios):
  - REQ-ADM-004: Tab Comodines
  - REQ-ADM-005: Tab Misiones
  - REQ-ADM-007: Notificaciones suspensión
  - REQ-BE-004: Request Review endpoint
  - REQ-ST-001: Indicador sincronización
  - REQ-ST-002: Notificación cuenta suspendida
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### Antes de Implementar

- [ ] Revisar inventarios actuales (DATABASE_INVENTORY.yml, BACKEND_INVENTORY.yml, FRONTEND_INVENTORY.yml)
- [ ] Validar que no existen duplicidades de componentes/endpoints
- [ ] Revisar ADRs existentes para decisiones arquitectónicas
- [ ] Validar contra estándares en docs/98-standards/

### Durante Implementación

- [ ] Seguir convenciones de nomenclatura establecidas
- [ ] Actualizar inventarios correspondientes
- [ ] Documentar en trazas cualquier cambio
- [ ] Implementar tests para nuevos endpoints

### Después de Implementar

- [ ] npm run build backend: debe pasar
- [ ] npm run build frontend: debe pasar
- [ ] npm run lint: debe pasar
- [ ] Actualizar documentación en docs/
- [ ] Actualizar trazas con implementación completada

---

## 📚 REFERENCIAS

### Documentación Consultada
- `docs/01-fase-alcance-inicial/EAI-001-fundamentos/`
- `docs/01-fase-alcance-inicial/EAI-004-analytics/`
- `docs/03-fase-extensiones/EXT-001-portal-maestros/`

### Inventarios
- `orchestration/inventarios/BACKEND_INVENTORY.yml`
- `orchestration/inventarios/FRONTEND_INVENTORY.yml`
- `orchestration/inventarios/DATABASE_INVENTORY.yml`

### Archivos Clave Analizados
- `apps/frontend/src/apps/student/pages/` (27 archivos)
- `apps/frontend/src/apps/admin/pages/` (8 archivos)
- `apps/backend/src/modules/admin/` (controladores y servicios)
- `apps/backend/src/modules/progress/` (controladores y servicios)

---

## 🔄 PRÓXIMAS ACCIONES

1. **Validar este reporte** con stakeholders
2. **Priorizar requerimientos** según capacidad del equipo
3. **Crear issues/tareas** en sistema de tracking
4. **Orquestar agentes** para implementación según prioridad

---

## 📝 DOCUMENTACIÓN GENERADA

### Fase 1: Análisis
- ✅ `orchestration/agentes/architecture-analyst/REPORTE-ANALISIS-PORTAL-STUDENTS-2025-11-29.md` (este documento)

### Fase 2: Documentación (COMPLETADA)

**Historias de Usuario Creadas:**
- ✅ `docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/US-AE-009-admin-assignments-view.md`
- ✅ `docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/US-AE-010-create-users.md`
- ✅ `docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/US-AE-011-audit-logs-viewer.md`

**Especificaciones Técnicas:**
- ✅ `docs/03-fase-extensiones/EXT-002-admin-extendido/especificaciones/ET-GAPS-CRITICOS-STUDENTS-ADMIN-2025-11-29.md`

**Índices Actualizados:**
- ✅ `docs/03-fase-extensiones/EXT-002-admin-extendido/_MAP.md`

---

**Estado del Análisis:** ✅ COMPLETADO
**Estado de Documentación:** ✅ COMPLETADO
**Fase:** 1 - Análisis + Documentación
**Siguiente Fase:** 3 - Implementación (requiere aprobación y asignación de sprint)

---

*Generado por Architecture-Analyst - GAMILIT Project*
