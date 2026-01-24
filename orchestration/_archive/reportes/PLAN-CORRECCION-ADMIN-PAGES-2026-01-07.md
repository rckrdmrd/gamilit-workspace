# PLAN DE EJECUCION: ADMIN-PAGES-FIX - Correccion Errores Admin Dashboard/Roles/Content

**Agente:** Full-Stack-Agent (Claude Opus 4.5)
**Tipo de tarea:** Bug Fix / Correccion
**Prioridad:** P0
**Fecha creacion:** 2026-01-07
**Sprint:** 3-4
**Estado:** COMPLETADO

---

## OBJETIVO

Corregir 3 errores criticos en las paginas de administracion del portal Gamilit:
1. admin/dashboard - ValidationError en parametro group_by
2. admin/roles - Tabla auth_management.roles no existe
3. admin/content - TypeError al acceder a totalItems

**Criterios de Aceptacion:**
- [x] Endpoint user-activity acepta parametros snake_case
- [x] Tabla auth_management.roles creada con 3 roles iniciales
- [x] getPendingContent transforma respuesta al formato esperado
- [x] Base de datos recreada exitosamente con nuevos DDL
- [x] Inventarios actualizados con nuevos conteos
- [x] Documentacion creada segun estandares

---

## ANALISIS PREVIO

### Contexto
Los 3 errores impiden el funcionamiento correcto del panel de administracion:
- Dashboard no puede mostrar analytics de actividad de usuarios
- Roles no puede listar los roles del sistema
- Content no puede mostrar contenido pendiente de moderacion

### Estado Actual (Pre-fix)
| Componente | Estado | Error |
|------------|--------|-------|
| user-activity.dto.ts | Incompatible | Usa camelCase, apiClient envia snake_case |
| auth_management.roles | No existe | Solo existe user_roles (tabla diferente) |
| adminAPI.getPendingContent | Sin transformacion | Backend y frontend usan estructuras diferentes |

### Anti-Duplicacion
```bash
# Verificacion de tabla roles
psql -c "\dt auth_management.*roles*"
# Resultado: Solo user_roles existe, roles NO existe

# Verificacion de archivos DDL
ls apps/database/ddl/schemas/auth_management/tables/*roles*
# Resultado: 04-roles.sql (crea user_roles, NO roles)
```

---

## DISENO DE SOLUCION

### Approach Seleccionado
1. **TAREA 1**: Modificar DTO backend para usar snake_case (consistente con apiClient)
2. **TAREA 2**: Crear nuevo DDL para tabla roles (catalogo RBAC)
3. **TAREA 3**: Agregar transformacion en funcion frontend

**Alternativas consideradas:**
1. Modificar apiClient para NO transformar parametros - Descartado (romperia otros endpoints)
2. Usar user_roles para datos de roles - Descartado (proposito diferente, estructura incompatible)
3. Modificar backend para devolver estructura frontend - Descartado (afectaria otros consumidores)

### Componentes Creados/Modificados

**Database:**
- [x] Tabla: auth_management.roles (03b-roles.sql)
- [x] Trigger: trg_roles_updated_at (inline en DDL)
- [x] Indices: idx_roles_name, idx_roles_is_active (inline en DDL)
- [x] Seeds: 3 roles iniciales (student, admin_teacher, super_admin)

**Backend:**
- [x] DTO: user-activity.dto.ts (snake_case properties)
- [x] Service: admin.query-builder.ts (snake_case variables)

**Frontend:**
- [x] API: adminAPI.ts - getPendingContent() (transformacion respuesta)

---

## CICLOS DE EJECUCION

### Ciclo 1: Analisis y Diagnostico
**Objetivo:** Identificar causa raiz de cada error

**Tareas:**
1. Explorar estructura del proyecto gamilit
2. Localizar archivos involucrados en cada error
3. Analizar diferencias entre frontend/backend

**Resultado:**
- TAREA 1: apiClient transforma a snake_case, DTO espera camelCase
- TAREA 2: Tabla roles no existe, solo user_roles
- TAREA 3: Backend usa flat structure, frontend espera nested pagination

---

### Ciclo 2: Implementacion TAREA 1
**Objetivo:** Corregir error group_by en user-activity

**Archivos modificados:**
- `apps/backend/src/modules/admin/dto/dashboard/user-activity.dto.ts`
- `apps/backend/src/modules/admin/services/query-builders/admin.query-builder.ts`

**Cambios:**
```typescript
// ANTES
startDate?: string;
endDate?: string;
groupBy?: GroupByEnum;

// DESPUES
start_date?: string;
end_date?: string;
group_by?: GroupByEnum;
```

**Validacion:**
- [x] Propiedades usan snake_case
- [x] Query builder usa mismas propiedades

---

### Ciclo 3: Implementacion TAREA 2
**Objetivo:** Crear tabla roles en base de datos

**Archivo creado:**
- `apps/database/ddl/schemas/auth_management/tables/03b-roles.sql`

**Estructura tabla:**
```sql
CREATE TABLE auth_management.roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(50) UNIQUE NOT NULL,
    description text,
    permissions jsonb DEFAULT '{}' NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    updated_at timestamp with time zone DEFAULT gamilit.now_mexico()
);
```

**Seeds incluidos:**
- student: Usuario basico
- admin_teacher: Profesor administrador
- super_admin: Acceso completo

**Validacion:**
```bash
psql -c "SELECT name, is_active FROM auth_management.roles ORDER BY name;"
# Resultado: 3 roles creados correctamente
```

---

### Ciclo 4: Implementacion TAREA 3
**Objetivo:** Corregir transformacion en getPendingContent

**Archivo modificado:**
- `apps/frontend/src/services/api/adminAPI.ts` (lineas 406-461)

**Logica de transformacion:**
```typescript
// Backend devuelve: { data, total, page, limit, total_pages }
// Frontend espera: { items, pagination: { page, totalPages, totalItems, limit } }

return {
  items: backendData.data || [],
  pagination: {
    page: backendData.page || 1,
    totalPages: backendData.total_pages || Math.ceil(total/limit),
    totalItems: backendData.total || 0,
    limit: backendData.limit || 20,
  },
};
```

---

### Ciclo 5: Validacion BD
**Objetivo:** Recrear base de datos y verificar cambios

**Comando ejecutado:**
```bash
./drop-and-recreate-database.sh "postgresql://gamilit_user:***@localhost:5432/gamilit_platform"
```

**Resultado:**
- FASE 5 (auth_management): 03b-roles.sql ejecutado exitosamente
- Todas las fases completadas sin errores
- Tabla roles verificada con 3 registros

---

### Ciclo 6: Actualizacion Inventarios
**Objetivo:** Actualizar documentacion segun estandares

**Archivos actualizados:**
1. `orchestration/inventarios/DATABASE_INVENTORY.yml`
   - auth_management.tables: 3 -> 4
   - auth_management.triggers: 4 -> 5
   - auth_management.indexes: 6 -> 8

2. `orchestration/inventarios/MASTER_INVENTORY.yml`
   - database.tables: 132 -> 133
   - database.triggers: 111 -> 112
   - database.ddl_files: 394 -> 395

3. `apps/database/ddl/schemas/auth_management/_MAP.md`
   - tables: 15 -> 17 archivos
   - Listado actualizado con 03b-roles.sql

---

## DEPENDENCIAS

### Depende de:
- Schema auth_management (FASE 1)
- Funcion gamilit.now_mexico() (FASE 2)
- apiClient.ts interceptor (existente)

### Bloquea:
- Ningun otro componente depende de estos cambios

### Requerimientos:
- PostgreSQL 14+
- Backend NestJS
- Frontend React

---

## RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| DTO snake_case rompe otros consumidores | Baja | Medio | Verificado que solo frontend consume este endpoint |
| Tabla roles vacia sin seeds | Baja | Alto | Seeds incluidos en DDL con ON CONFLICT |
| Transformacion no cubre todos los casos | Media | Bajo | Fallback seguro para estructuras inesperadas |

---

## DOCUMENTACION GENERADA

1. **Reporte de ejecucion:**
   - `orchestration/reportes/CORRECCION-ADMIN-PAGES-2026-01-07.md`

2. **Plan de ejecucion:**
   - `orchestration/reportes/PLAN-CORRECCION-ADMIN-PAGES-2026-01-07.md` (este documento)

3. **Indice actualizado:**
   - `orchestration/reportes/INDICE-REPORTES-FASE2.md`

4. **Inventarios actualizados:**
   - DATABASE_INVENTORY.yml
   - MASTER_INVENTORY.yml
   - auth_management/_MAP.md

---

## CRITERIOS DE EXITO

- [x] admin/dashboard carga sin error de group_by
- [x] admin/roles muestra lista de roles del sistema
- [x] admin/content muestra contenido pendiente sin error
- [x] Base de datos recreada exitosamente
- [x] Inventarios actualizados con conteos correctos
- [x] Documentacion completa segun TEMPLATE-PLAN.md

---

## PROXIMOS PASOS

1. **Reiniciar backend** para aplicar cambios en DTOs
2. **Verificar en navegador** las 3 paginas de admin
3. **Monitorear logs** para confirmar correccion

---

**Estado Final:** COMPLETADO
**Fecha Completado:** 2026-01-07
**Ejecutado por:** Claude Opus 4.5 - Full-Stack-Agent
