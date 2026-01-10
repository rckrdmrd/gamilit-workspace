# F5: REFINAMIENTO DE PLAN - TAREA-001 AUTH_MANAGEMENT

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-001 |
| **Fase** | F5 - Refinamiento |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Basado en** | F4-VALIDACION-PLAN |

---

## 1. OBJETIVO

Ajustar el plan F3 basado en las observaciones de F4 para optimizar la ejecucion.

---

## 2. AJUSTES REALIZADOS

### 2.1 Agrupacion de Commits

**Observacion F4:** Agrupar P0-001 a P0-003 en un solo commit

**Ajuste:**
```
COMMIT 1: [AUTH-001] fix(entities): Add validations to Profile entity
- P0-001: unique: true en user_id
- P0-002: @IsEmail() en DTO (referencia)
- P0-003: @MaxLength(500) en bio DTO (referencia)

COMMIT 2: [AUTH-002] feat(entities): Activate Tenant relation in Profile
- P0-004: @ManyToOne Tenant

COMMIT 3: [AUTH-003] feat(dto): Add Date serialization and Profile fields
- P0-005: @Transform para Dates
- P0-006: Profile fields en UserResponseDto

COMMIT 4: [AUTH-004] fix(entities): Fix timezone functions in UserSession
- P1-001: created_at timezone
- P1-002: last_activity_at timezone

COMMIT 5: [AUTH-005] feat(auth): Include organization in AuthResponse
- P1-003: Organization en response

COMMIT 6: [AUTH-006] feat(frontend): Update User type with new fields
- P1-004: Frontend types
```

### 2.2 Tests a Agregar

**Observacion F4:** Agregar tests especificos

**Tests requeridos:**
```typescript
// profile.entity.spec.ts
describe('Profile Entity', () => {
  it('should enforce unique user_id constraint', async () => {
    // Test duplicate user_id rejection
  });
});

// create-profile.dto.spec.ts
describe('CreateProfileDto', () => {
  it('should reject invalid email format', async () => {
    // Test @IsEmail validation
  });

  it('should reject bio longer than 500 chars', async () => {
    // Test @MaxLength(500)
  });
});
```

### 2.3 Pre-Verificaciones Agregadas

**Agregado al plan:**
```bash
# ANTES de P0-001 (verificar no hay duplicados)
psql -d gamilit -c "
  SELECT user_id, COUNT(*) as cnt
  FROM auth_management.profiles
  WHERE user_id IS NOT NULL
  GROUP BY user_id
  HAVING COUNT(*) > 1
"
# Si retorna filas, resolver duplicados ANTES de aplicar unique
```

---

## 3. PLAN REFINADO FINAL

### 3.1 Secuencia Optimizada

```
┌─────────────────────────────────────────────────────────────┐
│              SECUENCIA DE EJECUCION REFINADA                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRE-CHECK: Verificar duplicados user_id                    │
│      ↓                                                      │
│  COMMIT 1 (P0-001, P0-002, P0-003)                         │
│      ↓ npm run build + npm test                            │
│  COMMIT 2 (P0-004)                                         │
│      ↓ npm run build + npm test                            │
│  COMMIT 3 (P0-005, P0-006)                                 │
│      ↓ npm run build + npm test                            │
│  COMMIT 4 (P1-001, P1-002)                                 │
│      ↓ npm run build + npm test                            │
│  COMMIT 5 (P1-003)                                         │
│      ↓ npm run build + npm test                            │
│  COMMIT 6 (P1-004) - Frontend                              │
│      ↓ npm run build (frontend)                            │
│  POST-CHECK: Ejecutar e2e tests                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Rollback Plan

En caso de fallo en cualquier commit:

```bash
# Si falla build/test despues de commit N:
git revert HEAD~N..HEAD  # Revertir ultimos N commits
# O alternativamente:
git reset --hard <commit-antes-de-cambios>
```

---

## 4. CHANGELOG DE MODIFICACIONES

| # | Item Original | Ajuste | Justificacion |
|---|---------------|--------|---------------|
| 1 | 6 commits individuales P0 | 3 commits agrupados | Reducir ruido en git history |
| 2 | Sin pre-check duplicados | Agregado query verificacion | Prevenir fallo constraint |
| 3 | Sin tests especificos | Agregados 3 tests | Cobertura de validaciones |
| 4 | Sin rollback plan | Agregado rollback | Recovery path definido |

---

## 5. APROBACION FINAL

### 5.1 Estado del Plan

| Aspecto | Original | Refinado |
|---------|----------|----------|
| Commits totales | 10+ | 6 |
| Pre-verificaciones | 0 | 1 |
| Tests nuevos | 0 | 3 |
| Rollback definido | No | Si |

### 5.2 Decision

**PLAN REFINADO APROBADO** ✅

El plan refinado:
- Reduce complejidad de commits
- Agrega verificaciones de seguridad
- Define tests especificos
- Incluye rollback plan

---

## 6. RESUMEN PARA F6 (EJECUCION)

### Acciones a Ejecutar (Ordenadas)

| Orden | Acciones | Commit | Verificacion |
|-------|----------|--------|--------------|
| 0 | Pre-check duplicados | - | Query SQL |
| 1 | P0-001, P0-002, P0-003 | COMMIT 1 | build + test |
| 2 | P0-004 | COMMIT 2 | build + test |
| 3 | P0-005, P0-006 | COMMIT 3 | build + test |
| 4 | P1-001, P1-002 | COMMIT 4 | build + test |
| 5 | P1-003 | COMMIT 5 | build + test |
| 6 | P1-004 | COMMIT 6 | build frontend |

### Archivos a Modificar (Lista Final)

```
apps/backend/src/modules/auth/entities/profile.entity.ts
apps/backend/src/modules/auth/entities/user-session.entity.ts
apps/backend/src/modules/auth/dto/create-profile.dto.ts
apps/backend/src/modules/auth/dto/update-profile.dto.ts
apps/backend/src/modules/auth/dto/user-response.dto.ts
apps/backend/src/modules/auth/services/auth.service.ts
apps/frontend/src/features/auth/types/auth.types.ts
```

---

## 7. PROXIMOS PASOS

**Proceder a F6 (Ejecucion):**
1. Ejecutar pre-check de duplicados
2. Aplicar commits 1-6 secuencialmente
3. Verificar build y tests despues de cada commit
4. Documentar resultados en F7

---

**Documento generado por:** ORQUESTADOR
**Fecha:** 2026-01-10
**Version:** 1.0.0
**Siguiente fase:** F6 - Ejecucion
