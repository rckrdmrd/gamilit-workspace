# F2: ANALISIS DETALLADO - TAREA-001 AUTH_MANAGEMENT

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-001 |
| **Fase** | F2 - Analisis Detallado |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Agentes** | @PERFIL_DATABASE, @PERFIL_BACKEND, @PERFIL_FRONTEND |

---

## 1. RESUMEN EJECUTIVO

### 1.1 Metricas de Alineacion

| Comparacion | Alineacion | Estado | Accion |
|-------------|------------|--------|--------|
| DDL profiles → Entity Profile | 88% | ⚠️ CRITICO | 4 fixes P0 |
| DDL user_sessions → Entity UserSession | 89% | ⚠️ ALTO | 2 fixes P1 |
| DDL tenants → Entity Tenant | 92% | ✅ ACEPTABLE | 2 fixes P2 |
| Backend DTOs → Frontend Types | 62% | ⚠️ CRITICO | 8 fixes P0/P1 |

### 1.2 Inconsistencias Totales

| Severidad | Cantidad | Componente |
|-----------|----------|------------|
| **CRITICA (P0)** | 6 | profiles(4), DTOs(2) |
| **ALTA (P1)** | 4 | user_sessions(2), DTOs(2) |
| **MEDIA (P2)** | 8 | tenants(2), profiles(2), DTOs(4) |
| **BAJA (P3)** | 6 | Documentacion, indices |

---

## 2. ANALISIS DDL → ENTITY

### 2.1 Tabla PROFILES (88% alineado)

#### Inconsistencias CRITICAS (P0)

| ID | Problema | Ubicacion | Impacto | Fix |
|----|----------|-----------|---------|-----|
| **A-001** | UNIQUE faltante en user_id | Entity L137 | Permite duplicados | `unique: true` |
| **A-002** | CHECK email no validado | Entity L65 | Emails invalidos | `@IsEmail()` en DTO |
| **A-003** | CHECK bio (500 chars) no validado | Entity L72 | Bios largas | `@MaxLength(500)` |
| **A-004** | Relacion Tenant comentada | Entity L145-147 | Sin lazy loading | Implementar `@ManyToOne` |

#### Inconsistencias MEDIA (P2)

| ID | Problema | Descripcion |
|----|----------|-------------|
| M-001 | Relacion User comentada | Cross-schema, requiere manejo manual |
| M-002 | Indice GIN faltante | idx_profiles_preferences_gin |

#### Campos DDL vs Entity

```
CAMPOS: 25/25 mapeados (100%)
TIPOS: 22/25 correctos (88%)
FKs DDL: 3 definidas
FKs Entity: 0 activas (todas comentadas)
```

---

### 2.2 Tabla USER_SESSIONS (89% alineado)

#### Inconsistencias ALTAS (P1)

| ID | Problema | DDL | Entity | Fix |
|----|----------|-----|--------|-----|
| **S-001** | Timezone mismatch created_at | `gamilit.now_mexico()` | `CURRENT_TIMESTAMP` | Usar funcion custom |
| **S-002** | Timezone mismatch last_activity_at | `gamilit.now_mexico()` | `CURRENT_TIMESTAMP` | Usar funcion custom |

#### Inconsistencias MEDIA (P2)

| ID | Problema | Descripcion |
|----|----------|-------------|
| S-003 | CHECK device_type no validado | Entity sin enum validation |
| S-004 | Indice compuesto faltante | idx_sessions_active_recent |

#### Campos DDL vs Entity

```
CAMPOS: 18/18 mapeados (100%)
TIPOS: 16/18 correctos (89%)
FKs: 2/2 implementadas correctamente
```

---

### 2.3 Tabla TENANTS (92% alineado)

#### Inconsistencias MEDIA (P2)

| ID | Problema | DDL | Entity | Fix |
|----|----------|-----|--------|-----|
| T-001 | CHECK max_users > 0 no validado | CHECK constraint | Sin decorador | `@Min(1)` |
| T-002 | CHECK max_storage_gb > 0 no validado | CHECK constraint | Sin decorador | `@Min(1)` |

#### Campos DDL vs Entity

```
CAMPOS: 14/14 mapeados (100%)
TIPOS: 13/14 correctos (93%)
DEFAULTS: 9/9 sincronizados (100%)
```

---

## 3. ANALISIS BACKEND DTOs → FRONTEND TYPES

### 3.1 Conformidad General: 62%

| Mapeo | Estado | Issues |
|-------|--------|--------|
| UserResponseDto → User | 55% ⚠️ | 8 campos faltantes/inconsistentes |
| LoginDto → LoginCredentials | 100% ✅ | Perfecto |
| RegisterUserDto → RegisterData | 65% ⚠️ | Naming inconsistente |

### 3.2 Inconsistencias CRITICAS (P0)

| ID | Campo | Backend | Frontend | Fix |
|----|-------|---------|----------|-----|
| **D-001** | Date serialization | `Date` | `string` | Serializar a ISO |
| **D-002** | organization | No existe | Esperado | Incluir TenantResponseDto |

### 3.3 Inconsistencias ALTAS (P1)

| ID | Campo | Backend | Frontend | Fix |
|----|-------|---------|----------|-----|
| **D-003** | firstName/lastName | No en UserResponseDto | Esperados | Agregar de Profile |
| **D-004** | avatar_url | No en UserResponseDto | Esperado | Agregar de Profile |

### 3.4 Inconsistencias MEDIA (P2)

| ID | Problema | Descripcion |
|----|----------|-------------|
| D-005 | Naming: created_at vs createdAt | snake_case vs camelCase |
| D-006 | Naming: school_id vs schoolId | snake_case vs camelCase |
| D-007 | fullName parsing | Frontend unitario, Backend separado |
| D-008 | role type | Enum vs string |

### 3.5 Campos Faltantes en Frontend

| Campo Backend | Tipo | Recomendacion |
|---------------|------|---------------|
| phone_confirmed_at | Date? | Agregar |
| raw_user_meta_data | Record | Agregar como metadata |
| updated_at | Date | Agregar |

### 3.6 Campos Faltantes en Backend

| Campo Frontend | Origen Esperado | Recomendacion |
|----------------|-----------------|---------------|
| firstName | Profile | Incluir en UserResponseDto |
| lastName | Profile | Incluir en UserResponseDto |
| displayName | Profile | Incluir en UserResponseDto |
| avatar_url | Profile | Incluir en UserResponseDto |
| status | Profile | Incluir en UserResponseDto |
| tenantId | Profile | Incluir en UserResponseDto |
| organization | Tenant | Incluir TenantResponseDto |

---

## 4. MATRIZ DE DEPENDENCIAS VALIDADA

### 4.1 Dependencias Internas (auth_management)

```
tenants (tabla padre)
    ├─→ profiles.tenant_id [FK CASCADE] ✅ DDL | ❌ Entity comentada
    ├─→ user_roles.tenant_id [FK CASCADE] ✅ OK
    ├─→ memberships.tenant_id [FK CASCADE] ✅ OK
    └─→ user_sessions.tenant_id [FK CASCADE] ✅ OK

profiles (tabla hub)
    ├─→ user_preferences.user_id [FK CASCADE] ✅ OK
    ├─→ user_sessions.user_id [FK CASCADE] ✅ OK
    └─→ user_roles.user_id [FK CASCADE] ✅ OK
```

### 4.2 Dependencias Externas

```
auth.users ←── profiles.user_id [FK CASCADE]
    └─ Estado: DDL ✅ | Entity ❌ (cross-schema, comentada)

social_features.schools ←── profiles.school_id [FK SET NULL]
    └─ Estado: DDL ✅ | Entity ❌ (FK diferido, sin relacion)

gamification_system.user_stats ←── trg_initialize_user_stats
    └─ Estado: Trigger ✅ | Documentado
```

---

## 5. BRECHAS DOCUMENTACION vs CODIGO

### 5.1 Documentacion Faltante

| Archivo | Brecha | Severidad |
|---------|--------|-----------|
| Profile Entity | JSDoc incompleto | BAJA |
| UserSession Entity | Sin documentar timezone | MEDIA |
| authAPI.ts | verifyEmail deprecated sin fecha | BAJA |

### 5.2 Documentacion Desactualizada

| Documento | Ultima Actualizacion | Estado |
|-----------|---------------------|--------|
| API-AUTH-MODULE.md | - | No existe |
| auth.types.ts sync date | 2025-11-26 | Requiere actualizacion |

---

## 6. RESUMEN DE ACCIONES CORRECTIVAS

### 6.1 Prioridad P0 (Implementar Inmediatamente)

| # | Accion | Archivo | Linea |
|---|--------|---------|-------|
| 1 | Agregar `unique: true` a user_id | profile.entity.ts | 137 |
| 2 | Agregar `@IsEmail()` en CreateProfileDto | create-profile.dto.ts | - |
| 3 | Agregar `@MaxLength(500)` en bio | create-profile.dto.ts | - |
| 4 | Implementar `@ManyToOne` Tenant | profile.entity.ts | 145 |
| 5 | Serializar Dates a ISO en DTOs | user-response.dto.ts | - |
| 6 | Incluir firstName/lastName en UserResponseDto | user-response.dto.ts | - |

### 6.2 Prioridad P1 (Completar esta semana)

| # | Accion | Archivo |
|---|--------|---------|
| 7 | Fix timezone created_at | user-session.entity.ts |
| 8 | Fix timezone last_activity_at | user-session.entity.ts |
| 9 | Agregar avatar_url en UserResponseDto | user-response.dto.ts |
| 10 | Incluir organization (Tenant) en AuthResponse | auth.service.ts |

### 6.3 Prioridad P2 (Proxima iteracion)

| # | Accion | Archivo |
|---|--------|---------|
| 11 | Agregar `@Min(1)` en max_users/max_storage_gb | tenant DTOs |
| 12 | Documentar relacion User cross-schema | profile.entity.ts |
| 13 | Standardizar naming convention | DTOs y Types |
| 14 | Agregar indice GIN para preferences | migration |

---

## 7. CRITERIOS DE EXITO PARA F3

- [ ] 100% campos DDL mapeados en Entities
- [ ] 100% validaciones CHECK implementadas en DTOs
- [ ] Relaciones ORM activas para FKs criticas
- [ ] Serializacion ISO de Dates documentada
- [ ] Campos Profile incluidos en UserResponseDto
- [ ] Timezone functions sincronizadas

---

## 8. ARCHIVOS ANALIZADOS

### Base de Datos
- `auth_management/tables/01-tenants.sql`
- `auth_management/tables/03-profiles.sql`
- `auth_management/tables/11-user_sessions.sql`

### Backend
- `modules/auth/entities/tenant.entity.ts`
- `modules/auth/entities/profile.entity.ts`
- `modules/auth/entities/user-session.entity.ts`
- `modules/auth/dto/user-response.dto.ts`
- `modules/auth/dto/login.dto.ts`
- `modules/auth/dto/register-user.dto.ts`

### Frontend
- `features/auth/types/auth.types.ts`
- `features/auth/api/authAPI.ts`

---

**Documento generado por:** ORQUESTADOR + Subagentes especializados
**Fecha:** 2026-01-10
**Version:** 1.0.0
**Siguiente fase:** F3 - Planeacion
