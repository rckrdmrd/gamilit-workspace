# F3: PLAN DE CORRECCION - TAREA-001 AUTH_MANAGEMENT

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-001 |
| **Fase** | F3 - Planeacion |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Basado en** | F2-ANALISIS-DETALLADO-AUTH-2026-01-10.md |

---

## 1. OBJETIVO

Disenar plan de accion para resolver las 24 inconsistencias identificadas en F2, priorizadas por impacto y riesgo.

---

## 2. RESUMEN DE ACCIONES

| Prioridad | Cantidad | Tiempo Est. | Riesgo |
|-----------|----------|-------------|--------|
| **P0 (Critico)** | 6 | Sprint actual | ALTO |
| **P1 (Alto)** | 4 | Sprint actual | MEDIO |
| **P2 (Medio)** | 8 | Siguiente sprint | BAJO |
| **P3 (Bajo)** | 6 | Backlog | MINIMO |

---

## 3. PLAN DETALLADO POR PRIORIDAD

### 3.1 PRIORIDAD P0 - CRITICO (Ejecutar Inmediatamente)

#### ACCION P0-001: UNIQUE constraint en user_id

| Campo | Valor |
|-------|-------|
| **ID** | P0-001 |
| **Issue** | A-001 |
| **Archivo** | `apps/backend/src/modules/auth/entities/profile.entity.ts` |
| **Linea** | ~137 |
| **Cambio** | Agregar `unique: true` al decorador @Column de user_id |
| **Impacto** | Previene perfiles duplicados por usuario |
| **Dependencias** | Ninguna |
| **Agente** | @PERFIL_BACKEND |

**Codigo actual:**
```typescript
@Column({ type: 'uuid', nullable: true })
user_id!: string | null;
```

**Codigo corregido:**
```typescript
@Column({ type: 'uuid', nullable: true, unique: true })
user_id!: string | null;
```

---

#### ACCION P0-002: Validacion Email en DTO

| Campo | Valor |
|-------|-------|
| **ID** | P0-002 |
| **Issue** | A-002 |
| **Archivo** | `apps/backend/src/modules/auth/dto/create-profile.dto.ts` |
| **Cambio** | Agregar decorador `@IsEmail()` |
| **Impacto** | Previene emails invalidos |
| **Dependencias** | Ninguna |
| **Agente** | @PERFIL_BACKEND |

**Codigo a agregar:**
```typescript
import { IsEmail } from 'class-validator';

@IsEmail()
@IsNotEmpty()
email!: string;
```

---

#### ACCION P0-003: Validacion Bio MaxLength

| Campo | Valor |
|-------|-------|
| **ID** | P0-003 |
| **Issue** | A-003 |
| **Archivo** | `apps/backend/src/modules/auth/dto/update-profile.dto.ts` |
| **Cambio** | Agregar `@MaxLength(500)` |
| **Impacto** | Enforza limite de 500 caracteres |
| **Dependencias** | Ninguna |
| **Agente** | @PERFIL_BACKEND |

**Codigo a agregar:**
```typescript
import { MaxLength, IsOptional } from 'class-validator';

@IsOptional()
@MaxLength(500, { message: 'Bio debe tener maximo 500 caracteres' })
bio?: string;
```

---

#### ACCION P0-004: Implementar Relacion Tenant

| Campo | Valor |
|-------|-------|
| **ID** | P0-004 |
| **Issue** | A-004 |
| **Archivo** | `apps/backend/src/modules/auth/entities/profile.entity.ts` |
| **Linea** | ~145-147 |
| **Cambio** | Descomentar y activar relacion @ManyToOne a Tenant |
| **Impacto** | Habilita lazy loading de tenant |
| **Dependencias** | Tenant entity debe existir |
| **Agente** | @PERFIL_BACKEND |

**Codigo a activar:**
```typescript
@ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'tenant_id' })
tenant?: Tenant;
```

---

#### ACCION P0-005: Serializar Dates a ISO

| Campo | Valor |
|-------|-------|
| **ID** | P0-005 |
| **Issue** | D-001 |
| **Archivo** | `apps/backend/src/modules/auth/dto/user-response.dto.ts` |
| **Cambio** | Usar @Transform para serializar Dates a ISO strings |
| **Impacto** | Frontend recibe strings ISO consistentes |
| **Dependencias** | class-transformer |
| **Agente** | @PERFIL_BACKEND |

**Codigo a agregar:**
```typescript
import { Transform, Type } from 'class-transformer';

@Transform(({ value }) => value?.toISOString())
@Type(() => Date)
email_confirmed_at?: string;

@Transform(({ value }) => value?.toISOString())
@Type(() => Date)
created_at?: string;
```

---

#### ACCION P0-006: Incluir Profile fields en UserResponseDto

| Campo | Valor |
|-------|-------|
| **ID** | P0-006 |
| **Issue** | D-003, D-004 |
| **Archivo** | `apps/backend/src/modules/auth/dto/user-response.dto.ts` |
| **Cambio** | Agregar firstName, lastName, displayName, avatar_url |
| **Impacto** | Frontend recibe datos completos |
| **Dependencias** | Profile entity |
| **Agente** | @PERFIL_BACKEND |

**Campos a agregar:**
```typescript
first_name?: string;
last_name?: string;
display_name?: string;
avatar_url?: string;
status?: UserStatusEnum;
tenant_id?: string;
```

---

### 3.2 PRIORIDAD P1 - ALTO (Completar esta semana)

#### ACCION P1-001: Fix Timezone created_at

| Campo | Valor |
|-------|-------|
| **ID** | P1-001 |
| **Issue** | S-001 |
| **Archivo** | `apps/backend/src/modules/auth/entities/user-session.entity.ts` |
| **Cambio** | Usar funcion custom `gamilit.now_mexico()` |
| **Agente** | @PERFIL_BACKEND |

**Codigo corregido:**
```typescript
@Column({
  type: 'timestamptz',
  default: () => "gamilit.now_mexico()"
})
created_at!: Date;
```

---

#### ACCION P1-002: Fix Timezone last_activity_at

| Campo | Valor |
|-------|-------|
| **ID** | P1-002 |
| **Issue** | S-002 |
| **Archivo** | `apps/backend/src/modules/auth/entities/user-session.entity.ts` |
| **Cambio** | Usar funcion custom `gamilit.now_mexico()` |
| **Agente** | @PERFIL_BACKEND |

---

#### ACCION P1-003: Incluir Organization en AuthResponse

| Campo | Valor |
|-------|-------|
| **ID** | P1-003 |
| **Issue** | D-002 |
| **Archivo** | `apps/backend/src/modules/auth/services/auth.service.ts` |
| **Cambio** | Incluir tenant info en AuthResponse |
| **Agente** | @PERFIL_BACKEND |

---

#### ACCION P1-004: Actualizar Frontend User Type

| Campo | Valor |
|-------|-------|
| **ID** | P1-004 |
| **Issue** | D-003, D-004 |
| **Archivo** | `apps/frontend/src/features/auth/types/auth.types.ts` |
| **Cambio** | Agregar campos faltantes y actualizar comentario de sync |
| **Agente** | @PERFIL_FRONTEND |

**Campos a agregar:**
```typescript
phone_confirmed_at?: string;
metadata?: Record<string, unknown>;
updated_at?: string;
```

---

### 3.3 PRIORIDAD P2 - MEDIO (Siguiente Sprint)

| ID | Accion | Archivo | Issue |
|----|--------|---------|-------|
| P2-001 | Agregar `@Min(1)` max_users | tenant DTOs | T-001 |
| P2-002 | Agregar `@Min(1)` max_storage_gb | tenant DTOs | T-002 |
| P2-003 | Documentar relacion User cross-schema | profile.entity.ts | M-001 |
| P2-004 | Agregar enum validation device_type | user-session.entity.ts | S-003 |
| P2-005 | Standardizar naming snake_case/camelCase | DTOs/Types | D-005 |
| P2-006 | Agregar indice compuesto sessions | migration | S-004 |
| P2-007 | Implementar fullName parsing en backend | register-user.dto.ts | D-007 |
| P2-008 | Agregar enum mapping role | Types | D-008 |

---

### 3.4 PRIORIDAD P3 - BAJO (Backlog)

| ID | Accion | Archivo | Issue |
|----|--------|---------|-------|
| P3-001 | Agregar indice GIN preferences | migration | M-002 |
| P3-002 | Completar JSDoc en Profile entity | profile.entity.ts | B-002 |
| P3-003 | Documentar indices condicionales | migration/docs | M-003 |
| P3-004 | Crear API-AUTH-MODULE.md | docs/ | - |
| P3-005 | Agregar @todo tags con tickets | entities | B-003 |
| P3-006 | Actualizar fecha sync auth.types.ts | auth.types.ts | - |

---

## 4. SECUENCIA DE EJECUCION

```
FASE 1: P0 (Criticos) - Orden de ejecucion
┌────────────────────────────────────────────────────────────┐
│  P0-001 (unique user_id)                                   │
│      ↓                                                     │
│  P0-002 (IsEmail)  ──┬──  P0-003 (MaxLength bio)          │
│                      │                                     │
│                      ↓                                     │
│  P0-004 (ManyToOne Tenant)                                │
│      ↓                                                     │
│  P0-005 (Date serialization) → P0-006 (Profile fields)    │
└────────────────────────────────────────────────────────────┘

FASE 2: P1 (Altos) - Orden de ejecucion
┌────────────────────────────────────────────────────────────┐
│  P1-001 (timezone created_at) ── P1-002 (timezone activity)│
│      ↓                                                     │
│  P1-003 (Organization AuthResponse)                        │
│      ↓                                                     │
│  P1-004 (Frontend User type)                              │
└────────────────────────────────────────────────────────────┘

FASE 3: P2/P3 - Paralelo
┌────────────────────────────────────────────────────────────┐
│  P2-001..P2-008 (paralelo)                                │
│  P3-001..P3-006 (backlog, sin dependencias)               │
└────────────────────────────────────────────────────────────┘
```

---

## 5. RECURSOS REQUERIDOS

### 5.1 Agentes Asignados

| Agente | Acciones | Responsabilidad |
|--------|----------|-----------------|
| @PERFIL_BACKEND | P0-001 a P0-006, P1-001 a P1-003 | Entities, DTOs, Services |
| @PERFIL_FRONTEND | P1-004 | Types |
| @PERFIL_DATABASE | P2-006, P3-001 | Migrations |
| @PERFIL_DOCUMENTATION | P3-004 | API docs |

### 5.2 Archivos a Modificar

| Archivo | Acciones |
|---------|----------|
| profile.entity.ts | P0-001, P0-004, P2-003, P3-002, P3-005 |
| user-session.entity.ts | P1-001, P1-002, P2-004 |
| user-response.dto.ts | P0-005, P0-006 |
| create-profile.dto.ts | P0-002 |
| update-profile.dto.ts | P0-003 |
| auth.service.ts | P1-003 |
| auth.types.ts | P1-004, P3-006 |

---

## 6. CRITERIOS DE ACEPTACION

### 6.1 Por Accion P0

| Accion | Criterio | Verificacion |
|--------|----------|--------------|
| P0-001 | Constraint UNIQUE activo | `npm run build` sin errores |
| P0-002 | Emails invalidos rechazados | Test: enviar email malformado |
| P0-003 | Bio > 500 chars rechazada | Test: enviar bio larga |
| P0-004 | Relacion Tenant funcional | Query: profile.tenant |
| P0-005 | Dates en formato ISO | Response: "2026-01-10T..." |
| P0-006 | Profile fields en response | Response contiene firstName |

### 6.2 Globales

- [ ] `npm run build` sin errores en backend
- [ ] `npm run build` sin errores en frontend
- [ ] Tests existentes pasan
- [ ] Swagger actualizado con nuevos campos

---

## 7. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Breaking change en API | MEDIA | ALTO | Versionado de DTOs |
| Falla en migrations | BAJA | ALTO | Backup antes de ejecutar |
| Incompatibilidad TypeORM | BAJA | MEDIO | Test en entorno dev |
| Frontend no actualizado | MEDIA | MEDIO | Sync Types despues de Backend |

---

## 8. ESTIMACION DE IMPACTO

### 8.1 Archivos Afectados

| Capa | Archivos | Impacto |
|------|----------|---------|
| Backend Entities | 2 | MEDIO |
| Backend DTOs | 3 | BAJO |
| Backend Services | 1 | BAJO |
| Frontend Types | 1 | BAJO |
| Migrations | 2 | BAJO |
| Docs | 2 | MINIMO |

### 8.2 Tests Afectados

| Suite | Tests Impactados | Accion |
|-------|------------------|--------|
| auth.service.spec.ts | 5-10 | Actualizar mocks |
| profile.entity.spec.ts | 3-5 | Agregar tests relacion |
| auth.e2e.spec.ts | 2-3 | Verificar response format |

---

## 9. PROXIMOS PASOS

1. **F4**: Validar este plan contra F2 (cobertura completa)
2. **F5**: Refinar basado en feedback
3. **F6**: Ejecutar acciones P0 y P1
4. **F7**: Validar ejecucion con tests

---

**Documento generado por:** ORQUESTADOR
**Fecha:** 2026-01-10
**Version:** 1.0.0
**Siguiente fase:** F4 - Validacion de Plan
