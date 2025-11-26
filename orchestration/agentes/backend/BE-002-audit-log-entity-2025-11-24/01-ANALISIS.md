# BE-002: Análisis - Entity para tabla audit_logging.audit_logs

**Fecha:** 2025-11-24
**Agente:** Backend-Agent
**Tarea:** Crear Entity TypeORM para tabla audit_logging.audit_logs

---

## 🎯 OBJETIVO

Crear una Entity TypeORM para la tabla `audit_logging.audit_logs` en el módulo admin del backend, permitiendo queries de auditoría vía TypeORM.

---

## 🔍 INVESTIGACIÓN PREVIA

### 1. Verificación de tabla en Base de Datos

**Archivo DDL:** `/apps/database/ddl/schemas/audit_logging/tables/01-audit_logs.sql`

**Estructura de la tabla:**

```sql
CREATE TABLE audit_logging.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    event_type text NOT NULL,
    action text NOT NULL,
    resource_type text,
    resource_id uuid,
    actor_id uuid,
    actor_type text DEFAULT 'user'::text,
    actor_ip inet,
    actor_user_agent text,
    target_id uuid,
    target_type text,
    session_id text,
    description text,
    old_values jsonb DEFAULT '{}'::jsonb,
    new_values jsonb DEFAULT '{}'::jsonb,
    changes jsonb DEFAULT '{}'::jsonb,
    severity text DEFAULT 'info'::text,
    status text DEFAULT 'success'::text,
    error_code text,
    error_message text,
    stack_trace text,
    request_id text,
    correlation_id text,
    additional_data jsonb DEFAULT '{}'::jsonb,
    tags text[],
    created_at timestamp with time zone DEFAULT gamilit.now_mexico()
);
```

**Total de columnas:** 27 campos

**Constraints:**
- PK: `id` (uuid)
- FK: `tenant_id` → `auth_management.tenants(id)`
- FK: `actor_id` → `auth_management.profiles(id)`
- CHECK: `actor_type` ∈ ['user', 'system', 'api', 'cron']
- CHECK: `severity` ∈ ['debug', 'info', 'warning', 'error', 'critical']
- CHECK: `status` ∈ ['success', 'failure', 'partial']

### 2. Verificación de Entity existente

**Resultado:** ✅ **ENTITY YA EXISTE**

**Ubicación:** `/apps/backend/src/modules/audit/entities/audit-log.entity.ts`

**Hallazgos:**
- Existe un módulo completo `AuditModule` dedicado a auditoría
- La Entity `AuditLog` está 100% alineada con la tabla DB
- Incluye enums para `ActorType`, `Severity` y `Status`
- El módulo exporta `AuditService` con métodos helper para logging
- Total de decoradores TypeORM: 27 (coincide con columnas DB)

### 3. Estructura del módulo Audit existente

```
apps/backend/src/modules/audit/
├── audit.module.ts          # Módulo completo
├── entities/
│   └── audit-log.entity.ts  # Entity ya implementada
├── services/
│   └── audit.service.ts     # Service con 20+ métodos
├── interceptors/
│   └── audit.interceptor.ts # Interceptor para logging automático
└── dto/
    └── create-audit-log.dto.ts
```

**Estado:** ✅ Módulo completamente funcional

---

## 🚨 ANÁLISIS DE DUPLICACIÓN

### Problema Identificado

La tarea solicita crear una Entity en el módulo `admin`, pero esto generaría **DUPLICACIÓN** innecesaria:

1. **Ya existe** `AuditLog` entity en módulo `audit`
2. **Ya existe** `AuditService` con lógica de negocio completa
3. **Ya existe** `AuditInterceptor` para logging automático
4. El `AuditModule` exporta todo lo necesario para ser usado por otros módulos

### Riesgos de Duplicación

❌ **Si creamos entity duplicada:**
- Mantenimiento doble (2 entities para 1 tabla)
- Inconsistencias potenciales entre versiones
- Violación de DRY (Don't Repeat Yourself)
- Confusión sobre cuál entity usar

### Solución Propuesta

✅ **Re-export desde admin/entities/index.ts:**

En lugar de crear una entity duplicada, re-exportar la entity existente:

```typescript
// apps/backend/src/modules/admin/entities/index.ts
export { AuditLog, ActorType, Severity, Status } from '../../audit/entities/audit-log.entity';
```

**Ventajas:**
- No duplica código
- Permite usar `AuditLog` desde módulo admin
- Single Source of Truth (SSOT)
- Facilita queries de auditoría en servicios admin

---

## 📊 COMPARACIÓN DE ENFOQUES

| Aspecto | Entity Duplicada | Re-Export |
|---------|------------------|-----------|
| Mantenimiento | ❌ Doble | ✅ Simple |
| Consistencia | ❌ Riesgo alto | ✅ Garantizada |
| Reutilización | ❌ No | ✅ Sí |
| DRY Principle | ❌ Violado | ✅ Respetado |
| TypeORM | ❌ Conflictos | ✅ Sin conflictos |
| Complejidad | ❌ Alta | ✅ Baja |

---

## ✅ DECISIÓN ARQUITECTÓNICA

**Enfoque elegido:** **RE-EXPORT**

**Justificación:**
1. La entity ya existe y está bien implementada
2. El módulo audit es el dueño natural de AuditLog
3. Admin necesita **USAR** la entity, no **POSEERLA**
4. Re-export mantiene limpia la arquitectura modular
5. Cumple con principios SOLID (SRP: Single Responsibility)

**Implementación:**
- Agregar re-export en `admin/entities/index.ts`
- No crear nueva entity
- Documentar que AuditLog viene del módulo audit

---

## 🔄 PRÓXIMOS PASOS

1. ✅ Agregar re-export en admin/entities/index.ts
2. ✅ Compilar TypeScript para verificar
3. ✅ Documentar cambio en índice de entities
4. ⏭️ (Opcional) Importar AuditModule en AdminModule si se necesitan servicios

---

## 📝 NOTAS TÉCNICAS

### Campo `actor_ip` tipo INET

La columna `actor_ip` es de tipo PostgreSQL `inet`. TypeORM lo mapea como `string` pero mantiene validación de IP en BD.

### Campos JSONB

Los campos `old_values`, `new_values`, `changes` y `additional_data` son `jsonb` y se mapean como `any` o `Record<string, any>` en TypeScript.

### Arrays PostgreSQL

El campo `tags` es `text[]` (array PostgreSQL) y se mapea como `string[]` en TypeScript.

### Timezone-aware timestamps

`created_at` es `timestamp with time zone` y usa función `gamilit.now_mexico()` como default.

---

**Conclusión:** La entity ya existe en módulo audit. Se procederá con re-export en lugar de duplicación.
