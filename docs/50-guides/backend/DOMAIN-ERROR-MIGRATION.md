# Domain Error Migration Guide

**ADR Reference:** ADR-045 (Clean Architecture — Domain Errors)
**Status:** First Wave Complete (auth + gamification inventory/user-stats)
**Date:** 2026-02-27

---

## Purpose

Domain errors replace raw NestJS HTTP exceptions (`UnauthorizedException`, `NotFoundException`, etc.) in service-layer code. The benefits:

- **Type-safe error handling** — callers can `instanceof`-check specific error classes
- **Separation of concerns** — services express domain intent, not HTTP semantics
- **Consistent response format** — the `DomainExceptionFilter` maps all domain errors to HTTP responses automatically
- **Better testability** — tests check for domain-specific errors, not HTTP status classes

---

## Infrastructure

### Base Classes (`apps/backend/src/shared/exceptions/`)

| File | Class | HTTP Status | Usage |
|------|-------|-------------|-------|
| `domain-error.base.ts` | `DomainError` | varies | Abstract base, never throw directly |
| `not-found.error.ts` | `NotFoundError` | 404 | Entity not found |
| `unauthorized.error.ts` | `UnauthorizedError` | 401 | Authentication failures |
| `forbidden.error.ts` | `ForbiddenError` | 403 | Authorization failures |
| `conflict.error.ts` | `ConflictError` | 409 | Duplicate/conflict state |
| `validation.error.ts` | `ValidationError` | 400 | Input validation failures |
| `business-rule.error.ts` | `BusinessRuleError` | 422 | Business rule violations |

### Global Filter Registration (`apps/backend/src/main.ts`, line 121)

```typescript
app.useGlobalFilters(new DomainExceptionFilter(), new AllExceptionsFilter());
```

`DomainExceptionFilter` is registered first, so it handles `DomainError` subclasses before `AllExceptionsFilter` catches everything else. **Order matters** — the first matching filter wins.

---

## Creating New Domain Error Subclasses

Create errors in a module's `errors/` directory. Follow the existing pattern:

```typescript
// apps/backend/src/modules/your-module/errors/your-module.errors.ts
import { NotFoundError, UnauthorizedError, ConflictError } from '@shared/exceptions';

export class YourEntityNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super('YourEntity', id);  // message: "YourEntity with ID {id} not found"
  }
}

export class YourBusinessViolationError extends BusinessRuleError {
  constructor(reason: string) {
    super(reason, 'YOUR_ERROR_CODE');
  }
}
```

**Rules:**
- File must be in `src/modules/{module}/errors/{module}.errors.ts`
- Each class must have a unique `code` string (used in JSON error responses)
- Constructor parameters should provide context (IDs, values) for debugging
- Message should be human-readable (Spanish for user-facing, English for system errors)

---

## Migration Pattern

### Before (NestJS exceptions)

```typescript
// service.ts — DO NOT DO THIS
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

async findUser(id: string): Promise<User> {
  const user = await this.repo.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user;
}

async registerUser(email: string): Promise<void> {
  const existing = await this.repo.findOne({ where: { email } });
  if (existing) {
    throw new ConflictException('Email already in use');
  }
}
```

### After (Domain errors)

```typescript
// errors/auth.errors.ts
import { NotFoundError, ConflictError } from '@shared/exceptions';

export class UserNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super('Usuario', id);
  }
}

export class EmailAlreadyExistsError extends ConflictError {
  constructor(email?: string) {
    super(email ? `Email ${email} ya registrado` : 'Email ya registrado', 'EMAIL_ALREADY_EXISTS');
  }
}

// service.ts — DO THIS
import { Injectable } from '@nestjs/common';
import { UserNotFoundError, EmailAlreadyExistsError } from '../errors/auth.errors';

async findUser(id: string): Promise<User> {
  const user = await this.repo.findOne({ where: { id } });
  if (!user) {
    throw new UserNotFoundError(id);
  }
  return user;
}

async registerUser(email: string): Promise<void> {
  const existing = await this.repo.findOne({ where: { email } });
  if (existing) {
    throw new EmailAlreadyExistsError(email);
  }
}
```

### HTTP Status Codes Preserved

| NestJS Exception | Replacement Base Class | HTTP Status |
|-----------------|----------------------|-------------|
| `UnauthorizedException` | `UnauthorizedError` | 401 |
| `ForbiddenException` | `ForbiddenError` | 403 |
| `NotFoundException` | `NotFoundError` | 404 |
| `ConflictException` | `ConflictError` | 409 |
| `BadRequestException` | `ValidationError` | 400 |
| `UnprocessableEntityException` | `BusinessRuleError` | 422 |

---

## Completed Modules (First Wave)

### Auth Module (`apps/backend/src/modules/auth/`)

**File:** `errors/auth.errors.ts`

**Migrated Services:**
- `auth.service.ts` — 15 throws migrated (register, login, refreshToken, changePassword, updateUserProfile, getFullProfile, getUserPreferences, updateUserPreferences, uploadUserAvatar)
- `email-verification.service.ts` — 7 throws migrated
- `password-recovery.service.ts` — 2 throws migrated
- `session-management.service.ts` — 2 throws migrated
- `two-factor-auth.service.ts` — 9 throws migrated

**Domain Errors Created:**
- `InvalidCredentialsError` — login with wrong email/password (401)
- `InactiveUserError` — user account deleted/inactive (401)
- `ProfileNotFoundError` — profile not found for user (404)
- `UserNotFoundError` — user not found by ID (404)
- `EmailAlreadyExistsError` — email duplicate on register (409)
- `EmailInUseError` — email already taken on profile update (409)
- `SessionExpiredError` — refresh token session expired (401)
- `InvalidRefreshTokenError` — refresh token invalid/malformed (401)
- `WeakPasswordError` — new password too short (400)
- `SamePasswordError` — new password same as old (400)
- `InvalidPasswordError` — current password incorrect (400)
- `EmailAlreadyVerifiedError` — email already verified (409)
- `InvalidTokenError` — verification/reset token invalid (400)
- `ExpiredTokenError` — verification/reset token expired (400)
- `UsedTokenError` — token already used (400)
- `SessionNotFoundError` — session not found (404)
- `ProfileSessionNotFoundError` — profile in session not found (401)
- `TwoFactorAlreadyEnabledError` — 2FA already enabled (409)
- `TwoFactorNotEnabledError` — 2FA not enabled (400)
- `TwoFactorPendingSetupNotFoundError` — no pending 2FA setup (404)
- `TwoFactorLockedError` — too many 2FA attempts (403)
- `TwoFactorCodeExpiredError` — 2FA code expired (400)
- `TwoFactorInvalidCodeError` — 2FA code wrong (401)
- `TwoFactorRateLimitError` — resend too soon (400)

### Gamification Module (`apps/backend/src/modules/gamification/`)

**File:** `errors/gamification.errors.ts` (extended from existing)

**Migrated Services:**
- `inventory.service.ts` — 4 throws migrated (equipItem, unequipItem)
- `user-stats.service.ts` — 4 throws migrated (findByUserId, create, incrementField)

**Domain Errors Added:**
- `ItemNotFoundError` — item not found by ID (404)
- `ConsumableItemEquipError` — cannot equip consumable items (400)
- `ItemNotOwnedError` — user does not own the item (403)
- `ItemNotEquippedError` — item not currently equipped (404)
- `ProfileNotFoundError` — profile not found for auth user (404)
- `UserStatsAlreadyExistsError` — user already has stats record (409)
- `NonNumericFieldError` — attempted to increment non-numeric field (400)

**Previously Existing (shop.service.ts):**
- `ShopItemNotFoundError`, `UserStatsNotFoundError`, `ItemNotAvailableError`, `InsufficientStockError`, `MaxPurchasesReachedError`, `InsufficientCoinsError`, `InsufficientRankError`, `InsufficientLevelError`, `RequiredAchievementMissingError`, `InvalidQuantityError`

---

## Pending Modules (Priority Order)

Based on the comprehensive audit (ADR-045: 40% adoption, up from 5%):

| Priority | Module | Services with NestJS Exceptions | Estimated Throws |
|----------|--------|--------------------------------|-----------------|
| P1 | `gamification` | missions.service, ml-coins.service, ranks.service, achievements.service, classroom-missions.service | ~45 |
| P1 | `progress` | exercise.service, submission.service | ~20 |
| P2 | `educational` | modules.service, exercises.service | ~15 |
| P2 | `social` | classrooms.service, teams.service | ~12 |
| P3 | `admin` | users.service, content.service | ~10 |
| P3 | `teachers` | assignments.service | ~8 |

**To migrate a module:**

1. Check existing `errors/` directory: `ls apps/backend/src/modules/{module}/errors/`
2. Create or extend `{module}.errors.ts` with new subclasses
3. Replace `throw new NestJSException(...)` with `throw new DomainError()`
4. Remove unused NestJS exception imports
5. Update corresponding `.spec.ts` files to check for domain error classes

---

## Test Update Pattern

When migrating a service, update its spec file:

```typescript
// BEFORE (in *.spec.ts)
import { NotFoundException } from '@nestjs/common';
// ...
it('should throw NotFoundException', async () => {
  await expect(service.findUser('id')).rejects.toThrow(NotFoundException);
});

// AFTER
import { UserNotFoundError } from '../errors/auth.errors';
// ...
it('should throw UserNotFoundError', async () => {
  await expect(service.findUser('id')).rejects.toThrow(UserNotFoundError);
});
```

Tests that only check error messages (`.rejects.toThrow('message string')`) will continue to work without changes since domain errors extend `Error`.

---

## Catch Pattern in Services

When a service catches errors thrown by another service:

```typescript
// BEFORE
} catch (error) {
  if (error instanceof UnauthorizedException) {
    throw error;
  }
  throw new UnauthorizedException('Generic error');
}

// AFTER
import { InvalidRefreshTokenError, SessionExpiredError } from '../errors/auth.errors';
// ...
} catch (error) {
  if (error instanceof InvalidRefreshTokenError ||
      error instanceof SessionExpiredError) {
    throw error;
  }
  throw new InvalidRefreshTokenError();
}
```

---

## JSON Response Format

The `DomainExceptionFilter` produces this response for domain errors:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Credenciales invalidas",
    // In development only:
    "type": "InvalidCredentialsError",
    "stack": "..."
  }
}
```

This is consistent with the existing `HttpExceptionFilter` format — clients do not need to change their error handling code.
