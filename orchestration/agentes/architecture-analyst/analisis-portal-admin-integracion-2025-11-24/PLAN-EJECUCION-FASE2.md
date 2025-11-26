# PLAN DE EJECUCIÓN - CORRECCIONES PORTAL ADMIN

**Fecha:** 2025-11-24
**Fase:** 2 - PLANEACIÓN
**Basado en:** REPORTE-ANALISIS-FASE1.md

---

## RESUMEN DE ORQUESTACIÓN

### Agentes a Utilizar
| Agente | Tareas | Ejecución |
|--------|--------|-----------|
| Backend-Agent | 5 tareas | Paralelo (Grupo 1) |
| Frontend-Agent | 6 tareas | Paralelo (Grupo 2) |
| Database-Agent | 1 tarea | Secuencial (pre-requisito) |

### Orden de Ejecución
```
Grupo 0 (Pre-requisito):
  └─ Database-Agent: Validar/ajustar tabla feature_flags

Grupo 1 (Paralelo - 3 agentes):
  ├─ Backend-Agent #1: Corregir puertos 3000 → 3006
  ├─ Backend-Agent #2: Crear Audit Logs Entity
  └─ Backend-Agent #3: Limpiar código muerto

Grupo 2 (Paralelo - 3 agentes):
  ├─ Frontend-Agent #1: Centralizar endpoints en api.config.ts
  ├─ Frontend-Agent #2: Corregir .env.production
  └─ Frontend-Agent #3: Sincronizar tipos

Grupo 3 (Secuencial - Validación):
  └─ Validación: npm run type-check && npm run build
```

---

## TAREAS DETALLADAS

### GRUPO 0: PRE-REQUISITO DATABASE

#### TAREA DB-001: Validar Feature Flags Schema
**Agente:** Database-Agent
**Prioridad:** P0 (Crítico)
**Dependencias:** Ninguna

**Problema:**
El Entity `FeatureFlag` en backend tiene campos diferentes a la tabla `feature_flags`:
- Entity usa: `feature_key`, `feature_name`, `target_users`, `starts_at`, `ends_at`
- Tabla usa: `flag_key`, `flag_name`, `is_system_wide`, `rollout_strategy`

**Acción:**
1. Leer DDL actual: `apps/database/ddl/schemas/system_configuration/tables/01-feature_flags.sql`
2. Decidir si:
   - Opción A: Actualizar DDL para incluir campos de Entity
   - Opción B: Reportar diferencias para que Backend-Agent ajuste Entity

**Entregable:** Reporte de decisión + DDL actualizado si Opción A

---

### GRUPO 1: CORRECCIONES BACKEND (PARALELO)

#### TAREA BE-001: Corregir Puerto 3000 → 3006
**Agente:** Backend-Agent
**Prioridad:** P0 (Crítico)
**Dependencias:** Ninguna

**Archivos a Modificar:**
```
apps/backend/src/config/swagger.config.ts (línea 13)
  ANTES: .addServer('http://localhost:3000', 'Local Development')
  DESPUÉS: .addServer(`http://localhost:${process.env.PORT || 3006}`, 'Local Development')

apps/backend/src/shared/middleware/cors.config.ts (línea 12)
  ANTES: 'http://localhost:3000'
  DESPUÉS: 'http://localhost:3006'
  NOTA: Este archivo podría eliminarse si no se usa

apps/backend/src/modules/mail/mail.service.ts (línea 26)
  ANTES: 'http://localhost:3000'
  DESPUÉS: 'http://localhost:3005' (frontend, no backend)
```

**Criterios de Aceptación:**
- [ ] Ningún archivo contiene `localhost:3000`
- [ ] Swagger apunta a puerto correcto
- [ ] Mail service apunta a frontend correcto

---

#### TAREA BE-002: Crear Audit Logs Entity
**Agente:** Backend-Agent
**Prioridad:** P0 (Crítico)
**Dependencias:** Ninguna

**Especificación:**
Crear Entity para la tabla `audit_logging.audit_logs`:

```typescript
// apps/backend/src/modules/admin/entities/audit-log.entity.ts
@Entity({ schema: 'audit_logging', name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenant_id?: string;

  @Column({ name: 'event_type' })
  event_type: string;

  @Column()
  action: string;

  @Column({ name: 'resource_type', nullable: true })
  resource_type?: string;

  @Column({ name: 'resource_id', type: 'uuid', nullable: true })
  resource_id?: string;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actor_id?: string;

  @Column({ name: 'actor_type' })
  actor_type: 'user' | 'system' | 'api' | 'cron';

  @Column({ name: 'actor_ip', nullable: true })
  actor_ip?: string;

  @Column({ name: 'actor_user_agent', nullable: true })
  actor_user_agent?: string;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  old_values?: Record<string, any>;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  new_values?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  changes?: Record<string, any>;

  @Column()
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';

  @Column()
  status: 'success' | 'failure' | 'partial';

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
```

**Criterios de Aceptación:**
- [ ] Entity creada en `admin/entities/`
- [ ] Exportada en `admin/entities/index.ts`
- [ ] Compila sin errores TypeScript

---

#### TAREA BE-003: Limpiar Código Muerto
**Agente:** Backend-Agent
**Prioridad:** P1 (Alto)
**Dependencias:** BE-001

**Acciones:**
1. Verificar si `apps/backend/src/shared/middleware/cors.config.ts` se usa
2. Si NO se usa: Eliminar archivo
3. Si se usa: Corregir configuración (puerto 3006)

4. Mover credenciales de `smoke-test.js`:
   - Crear `apps/backend/.env.test` con credenciales
   - Modificar `smoke-test.js` para usar variables de entorno

**Criterios de Aceptación:**
- [ ] No hay código muerto en middleware
- [ ] Credenciales no hardcodeadas en código

---

### GRUPO 2: CORRECCIONES FRONTEND (PARALELO)

#### TAREA FE-001: Centralizar Endpoints en api.config.ts
**Agente:** Frontend-Agent
**Prioridad:** P0 (Crítico)
**Dependencias:** Ninguna

**Problema:**
18+ endpoints hardcodeados en código. Deben moverse a `apps/frontend/src/config/api.config.ts`

**Endpoints a Agregar:**
```typescript
// En API_ENDPOINTS.admin
monitoring: {
  metrics: '/admin/monitoring/metrics',
  metricsHistory: '/admin/monitoring/metrics/history',
  errorStats: '/admin/monitoring/errors/stats',
  recentErrors: '/admin/monitoring/errors/recent',
  errorTrends: '/admin/monitoring/errors/trends',
},
progress: {
  overview: '/admin/progress/overview',
  classroom: (id: string) => `/admin/progress/classrooms/${id}`,
  student: (id: string) => `/admin/progress/students/${id}`,
  module: (id: string) => `/admin/progress/modules/${id}`,
  exercise: (id: string) => `/admin/progress/exercises/${id}`,
  export: '/admin/progress/export',
},
classroomTeachers: {
  list: '/admin/classroom-teachers',
  bulk: '/admin/classroom-teachers/bulk',
  classroomTeachers: (id: string) => `/admin/classrooms/${id}/teachers`,
  teacherClassrooms: (id: string) => `/admin/teachers/${id}/classrooms`,
},
bulk: {
  suspendUsers: '/admin/users/bulk/suspend',
  deleteUsers: '/admin/users/bulk/delete',
  updateRole: '/admin/users/bulk/update-role',
},
```

**Archivos a Modificar:**
1. `apps/frontend/src/config/api.config.ts` - Agregar endpoints
2. `apps/frontend/src/services/api/adminAPI.ts` - Usar API_ENDPOINTS
3. `apps/frontend/src/services/api/admin/classroomTeacherApi.ts` - Usar API_ENDPOINTS
4. `apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts` - Usar API_ENDPOINTS
5. `apps/frontend/src/apps/admin/hooks/useMonitoring.ts` - Usar API_ENDPOINTS

**Criterios de Aceptación:**
- [ ] Todos los endpoints admin en API_ENDPOINTS
- [ ] Ningún string literal de ruta en código de servicios
- [ ] npm run type-check pasa

---

#### TAREA FE-002: Corregir .env.production
**Agente:** Frontend-Agent
**Prioridad:** P0 (Crítico)
**Dependencias:** Ninguna

**Archivo:** `apps/frontend/.env.production`

**Cambios:**
```bash
# ANTES (con problemas)
VITE_API_HOST=74.208.126.102:3006
VITE_API_PROTOCOL=https
VITE_WS_PROTOCOL=wss
VITE_API_URL=http://74.208.126.102:3006/api

# DESPUÉS (corregido)
# Usar variable de entorno en CI/CD o dominio
VITE_API_HOST=${API_HOST:-api.gamilit.com}
VITE_API_PROTOCOL=http
VITE_WS_PROTOCOL=ws
VITE_API_URL=http://${API_HOST:-api.gamilit.com}/api
```

**Alternativa (IP temporal pero documentada):**
```bash
# TEMPORAL: Cambiar a dominio cuando esté disponible
# TODO: Configurar DNS para api.gamilit.com
VITE_API_HOST=74.208.126.102:3006
VITE_API_PROTOCOL=http  # SIN SSL por ahora
VITE_WS_PROTOCOL=ws     # SIN SSL por ahora
VITE_API_URL=http://74.208.126.102:3006/api
```

**Criterios de Aceptación:**
- [ ] Protocolo HTTP (no HTTPS) hasta que haya SSL
- [ ] WS (no WSS) hasta que haya SSL
- [ ] Documentado el TODO para dominio

---

#### TAREA FE-003: Eliminar Archivos Deprecated
**Agente:** Frontend-Agent
**Prioridad:** P1 (Alto)
**Dependencias:** FE-001 (para asegurar que no se usan)

**Archivos a Eliminar:**
```
apps/frontend/src/services/api/apiConfig.deprecated.ts
apps/frontend/src/shared/constants/api-endpoints.deprecated.ts
```

**Pre-verificación:**
1. Grep para confirmar que no se importan en ningún lado
2. Si se importan, migrar a api.config.ts primero

**Criterios de Aceptación:**
- [ ] Archivos deprecated eliminados
- [ ] Ningún import roto
- [ ] npm run build pasa

---

#### TAREA FE-004: Sincronizar Tipos User
**Agente:** Frontend-Agent
**Prioridad:** P1 (Alto)
**Dependencias:** Ninguna

**Archivo:** `apps/frontend/src/services/api/adminTypes.ts`

**Cambios:**
```typescript
// ANTES
export interface User {
  // ...
  status: 'active' | 'inactive' | 'suspended';
}

// DESPUÉS
export interface User {
  // ...
  status: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
}
```

```typescript
// ANTES (en Organization)
tier: 'free' | 'basic' | 'premium' | 'enterprise';

// DESPUÉS
tier: 'free' | 'basic' | 'professional' | 'enterprise';
```

**Criterios de Aceptación:**
- [ ] User.status incluye todos los valores de DB
- [ ] Organization.tier usa `professional` (no `premium`)
- [ ] npm run type-check pasa

---

#### TAREA FE-005: Corregir Scripts de Testing
**Agente:** Frontend-Agent (o Backend-Agent)
**Prioridad:** P2 (Medio)
**Dependencias:** Ninguna

**Archivos:**
```bash
apps/backend/scripts/test-monitoring-endpoints.sh
apps/backend/scripts/test-progress-endpoints.sh
apps/backend/scripts/test-grant-bonus.sh
apps/backend/scripts/test-alerts-endpoints.sh
apps/backend/scripts/test-analytics-endpoints.sh
```

**Cambio en cada script:**
```bash
# ANTES
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"

# DESPUÉS
API_BASE_URL="${API_BASE_URL:-http://localhost:3006}"
```

**Criterios de Aceptación:**
- [ ] Todos los scripts usan puerto 3006
- [ ] Scripts ejecutan correctamente

---

### GRUPO 3: VALIDACIÓN FINAL

#### TAREA VAL-001: Compilación y Build
**Ejecutar manualmente después de todos los agentes:**

```bash
# Backend
cd apps/backend
npm run type-check
npm run build

# Frontend
cd apps/frontend
npm run type-check
npm run build
```

**Criterios de Aceptación:**
- [ ] Backend compila sin errores
- [ ] Frontend compila sin errores
- [ ] No hay warnings de TypeScript nuevos

---

## MATRIZ DE EJECUCIÓN

| Grupo | Agente | Tarea | Prioridad | Estado |
|-------|--------|-------|-----------|--------|
| 0 | Database-Agent | DB-001: Validar Feature Flags | P0 | ⏳ Pendiente |
| 1 | Backend-Agent #1 | BE-001: Corregir puertos | P0 | ⏳ Pendiente |
| 1 | Backend-Agent #2 | BE-002: Crear Audit Entity | P0 | ⏳ Pendiente |
| 1 | Backend-Agent #3 | BE-003: Limpiar código | P1 | ⏳ Pendiente |
| 2 | Frontend-Agent #1 | FE-001: Centralizar endpoints | P0 | ⏳ Pendiente |
| 2 | Frontend-Agent #2 | FE-002: .env.production | P0 | ⏳ Pendiente |
| 2 | Frontend-Agent #3 | FE-003: Eliminar deprecated | P1 | ⏳ Pendiente |
| 2 | Frontend-Agent #4 | FE-004: Sincronizar tipos | P1 | ⏳ Pendiente |
| 2 | Frontend-Agent #5 | FE-005: Scripts testing | P2 | ⏳ Pendiente |
| 3 | Manual | VAL-001: Compilación | P0 | ⏳ Pendiente |

---

## RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Feature Flags requiere cambio DDL | Media | Alto | Validar primero con DB-Agent |
| Archivos deprecated aún en uso | Baja | Medio | Grep antes de eliminar |
| Breaking changes en tipos | Media | Medio | Ejecutar type-check después |
| CORS no permite nuevos orígenes | Baja | Alto | Probar con curl después |

---

## PRÓXIMOS PASOS

1. **Ejecutar Grupo 0:** Database-Agent valida feature_flags
2. **Ejecutar Grupos 1 y 2 en paralelo:** Backend y Frontend corrections
3. **Ejecutar Grupo 3:** Validación con builds
4. **Actualizar trazas:** Documentar cambios realizados
5. **Actualizar inventarios:** DATABASE, BACKEND, FRONTEND

---

**Estado:** FASE 2 COMPLETADA ✅
**Siguiente:** FASE 3 - EJECUCIÓN
**Autor:** Architecture-Analyst
