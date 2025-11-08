# Code Map - M-AUTH

**Última actualización:** 2025-11-07
**Total de objetos:** 47

---

## Base de Datos

| OBJ ID | Tipo | Nombre | Schema | Ruta | Líneas |
|--------|------|--------|--------|------|--------|
| `OBJ-DB-AUTH-ENUM-AAL-LEVEL` | enum | `aal_level` | auth | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth/enums/aal_level.sql` | 6 |
| `OBJ-DB-AUTH-ENUM-CODE-CHALLENGE-METHOD` | enum | `code_challenge_method` | auth | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth/enums/code_challenge_method.sql` | 6 |
| `OBJ-DB-AUTH-IDX-USERS` | index | `users` | auth | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth/tables/01-users.sql` | 72 |
| `OBJ-DB-AUTH-FN-ASSIGN-ROLE-TO-USER` | function | `assign_role_to_user` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/functions/01-assign_role_to_user.sql` | 100 |
| `OBJ-DB-AUTH-FN-GET-USER-ROLE` | function | `get_user_role` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/functions/02-get_user_role.sql` | 47 |
| `OBJ-DB-AUTH-FN-USER-HAS-PERMISSION` | function | `user_has_permission` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/functions/03-verify_user_permission.sql` | 45 |
| `OBJ-DB-AUTH-FN-REVOKE-ROLE-FROM-USER` | function | `revoke_role_from_user` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/functions/04-remove_role_from_user.sql` | 81 |
| `OBJ-DB-AUTH-FN-HASH-TOKEN` | function | `hash_token` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/functions/05-hash_token.sql` | 28 |
| `OBJ-DB-AUTH-FN-UPDATE-USER-PREFERENCES` | function | `update_user_preferences` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/functions/06-update_user_preferences.sql` | 81 |
| `OBJ-DB-AUTH-IDX-IDX-USER-PREFERENCES-THEME` | index | `idx_user_preferences_theme` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/indexes/01-idx_user_preferences_theme.sql` | 48 |
| `OBJ-DB-AUTH-IDX-IDX-USER-ROLES-PERMISSIONS-GIN` | index | `idx_user_roles_permissions_gin` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/indexes/02-idx_user_roles_permissions_gin.sql` | 107 |
| `OBJ-DB-AUTH-UNKN-01-POLICIES` | unknown | `01-policies` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/rls-policies/01-policies.sql` | 305 |
| `OBJ-DB-AUTH-TRG-TENANTS` | trigger | `tenants` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/01-tenants.sql` | 58 |
| `OBJ-DB-AUTH-IDX-AUTH-ATTEMPTS` | index | `auth_attempts` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/02-auth_attempts.sql` | 41 |
| `OBJ-DB-AUTH-TRG-PROFILES` | trigger | `profiles` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/03-profiles.sql` | 114 |
| `OBJ-DB-AUTH-TRG-USER-ROLES` | trigger | `user_roles` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/04-roles.sql` | 61 |
| `OBJ-DB-AUTH-TRG-AUTH-PROVIDERS` | trigger | `auth_providers` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/05-auth_providers.sql` | 172 |
| `OBJ-DB-AUTH-IDX-EMAIL-VERIFICATION-TOKENS` | index | `email_verification_tokens` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/06-email_verification_tokens.sql` | 43 |
| `OBJ-DB-AUTH-IDX-PASSWORD-RESET-TOKENS` | index | `password_reset_tokens` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/07-password_reset_tokens.sql` | 44 |
| `OBJ-DB-AUTH-IDX-SECURITY-EVENTS` | index | `security_events` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/08-security_events.sql` | 50 |
| `OBJ-DB-AUTH-TRG-USER-PREFERENCES` | trigger | `user_preferences` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/09-user_preferences.sql` | 79 |
| `OBJ-DB-AUTH-TRG-MEMBERSHIPS` | trigger | `memberships` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/10-memberships.sql` | 60 |
| `OBJ-DB-AUTH-IDX-USER-SESSIONS` | index | `user_sessions` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/11-user_sessions.sql` | 60 |
| `OBJ-DB-AUTH-IDX-FOR` | index | `for` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/tables/12-user_suspensions.sql` | 33 |
| `OBJ-DB-AUTH-TRG-TRG-MEMBERSHIPS-UPDATED-AT` | trigger | `trg_memberships_updated_at` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/triggers/02-trg_memberships_updated_at.sql` | 15 |
| `OBJ-DB-AUTH-TRG-TRG-AUDIT-PROFILE-CHANGES` | trigger | `trg_audit_profile_changes` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/triggers/03-trg_audit_profile_changes.sql` | 15 |
| `OBJ-DB-AUTH-TRG-TRG-INITIALIZE-USER-STATS` | trigger | `trg_initialize_user_stats` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/triggers/04-trg_initialize_user_stats.sql` | 15 |
| `OBJ-DB-AUTH-TRG-TRG-PROFILES-UPDATED-AT` | trigger | `trg_profiles_updated_at` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/triggers/05-trg_profiles_updated_at.sql` | 15 |
| `OBJ-DB-AUTH-TRG-TRG-TENANTS-UPDATED-AT` | trigger | `trg_tenants_updated_at` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/triggers/06-trg_tenants_updated_at.sql` | 15 |
| `OBJ-DB-AUTH-TRG-TRG-USER-ROLES-UPDATED-AT` | trigger | `trg_user_roles_updated_at` | auth_management | `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/triggers/07-trg_user_roles_updated_at.sql` | 15 |

---

## Backend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|
| `OBJ-BE-AUTH-CTRL-AUTH-CONTROLLER` | controller | `auth.controller` | `auth/controllers/auth.controller.ts` |
| `OBJ-BE-AUTH-CTRL-PASSWORD-CONTROLLER` | controller | `password.controller` | `auth/controllers/password.controller.ts` |
| `OBJ-BE-AUTH-SVC-AUTH-SERVICE` | service | `auth.service` | `auth/services/auth.service.ts` |
| `OBJ-BE-AUTH-SVC-EMAIL-VERIFICATION-SERVICE` | service | `email-verification.service` | `auth/services/email-verification.service.ts` |
| `OBJ-BE-AUTH-SVC-PASSWORD-RECOVERY-SERVICE` | service | `password-recovery.service` | `auth/services/password-recovery.service.ts` |
| `OBJ-BE-AUTH-SVC-SECURITY-SERVICE` | service | `security.service` | `auth/services/security.service.ts` |
| `OBJ-BE-AUTH-SVC-SESSION-MANAGEMENT-SERVICE` | service | `session-management.service` | `auth/services/session-management.service.ts` |
| `OBJ-BE-AUTH-ENT-AUTH-ATTEMPT-ENTITY` | entity | `auth-attempt.entity` | `auth/entities/auth-attempt.entity.ts` |
| `OBJ-BE-AUTH-ENT-AUTH-PROVIDER-ENTITY` | entity | `auth-provider.entity` | `auth/entities/auth-provider.entity.ts` |
| `OBJ-BE-AUTH-ENT-EMAIL-VERIFICATION-TOKEN-ENTITY` | entity | `email-verification-token.entity` | `auth/entities/email-verification-token.entity.ts` |
| `OBJ-BE-AUTH-ENT-MEMBERSHIP-ENTITY` | entity | `membership.entity` | `auth/entities/membership.entity.ts` |
| `OBJ-BE-AUTH-ENT-PASSWORD-RESET-TOKEN-ENTITY` | entity | `password-reset-token.entity` | `auth/entities/password-reset-token.entity.ts` |
| `OBJ-BE-AUTH-ENT-PROFILE-ENTITY` | entity | `profile.entity` | `auth/entities/profile.entity.ts` |
| `OBJ-BE-AUTH-ENT-TENANT-ENTITY` | entity | `tenant.entity` | `auth/entities/tenant.entity.ts` |
| `OBJ-BE-AUTH-ENT-USER-ROLE-ENTITY` | entity | `user-role.entity` | `auth/entities/user-role.entity.ts` |
| `OBJ-BE-AUTH-ENT-USER-SESSION-ENTITY` | entity | `user-session.entity` | `auth/entities/user-session.entity.ts` |
| `OBJ-BE-AUTH-ENT-USER-ENTITY` | entity | `user.entity` | `auth/entities/user.entity.ts` |

---

## Frontend

| OBJ ID | Tipo | Nombre | Ruta |
|--------|------|--------|------|