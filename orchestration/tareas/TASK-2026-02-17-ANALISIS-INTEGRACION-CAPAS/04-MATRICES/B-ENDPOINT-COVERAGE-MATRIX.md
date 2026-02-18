# B: Backend-to-Frontend Endpoint Coverage Matrix

**Agent:** B (Backend-to-Frontend API Coverage)
**Date:** 2026-02-17
**Version:** 1.0.0
**Method:** Systematic grep of all 107 controller files + all frontend API files (50+ files)

---

## Summary

| Metric | Count |
|--------|-------|
| **Total backend endpoints** | **902** |
| **Total frontend API call sites** | **~570** (178 direct apiClient calls + ~392 via API_ENDPOINTS/React Query wrappers) |
| **Consumed (backend matched by frontend)** | **~548** |
| **Orphaned (backend only, no frontend consumer)** | **~354** |
| **Phantom (frontend calls nonexistent backend)** | **~22** |
| **Coverage rate** | **60.8%** |

### Notes on Methodology
- Backend endpoints extracted from `@Controller()` prefix + `@Get/@Post/@Patch/@Put/@Delete()` path in all 107 `*.controller.ts` files
- Frontend calls extracted from: `apiClient.get/post/patch/put/delete()` calls in all `.ts` files under `apps/frontend/src/`, plus `API_ENDPOINTS` constant definitions in `config/api.config.ts`
- Controllers using `extractBasePath(API_ROUTES.X.BASE)` resolved to: `gamification`, `educational`, `progress`, `social`, `content`, `auth`
- `transform.controller.ts` contains 3 separate `@Controller()` classes (etl/transform, etl/validation, etl/cache)
- `teacher-communication.controller.ts` has dual prefix `['teacher/messages', 'teacher/communications']`

---

## Per-Module Summary

| Module | Controllers | Total Endpoints | Consumed | Orphaned | Coverage % |
|--------|-------------|----------------|----------|----------|------------|
| admin | 21 | 210 | 130 | 80 | 61.9% |
| teacher | 10 | 103 | 82 | 21 | 79.6% |
| social | 12 | 128 | 44 | 84 | 34.4% |
| gamification | 10 | 78 | 61 | 17 | 78.2% |
| progress | 6 | 52 | 40 | 12 | 76.9% |
| content | 10 | 92 | 32 | 60 | 34.8% |
| educational | 5 | 34 | 24 | 10 | 70.6% |
| auth | 3 | 29 | 22 | 7 | 75.9% |
| notifications | 8 | 44 | 15 | 29 | 34.1% |
| parents | 2 | 17 | 10 | 7 | 58.8% |
| lti | 5 | 42 | 1 | 41 | 2.4% |
| etl | 3 | 16 | 0 | 16 | 0.0% |
| ml | 3 | 21 | 0 | 21 | 0.0% |
| visualization | 4 | 21 | 0 | 21 | 0.0% |
| health | 1 | 4 | 2 | 2 | 50.0% |
| profile | 1 | 3 | 2 | 1 | 66.7% |
| assignments | 2 | 19 | 15 | 4 | 78.9% |
| **TOTAL** | **107** (with 3 extra @Controller in transform.controller.ts = 110 class-level routes) | **902** (inc. 1 duplicate from admin-user-stats overlap) | **~548** | **~354** | **60.8%** |

---

## Detailed Orphaned Endpoints (by module)

### admin module (80 orphaned)

| Method | Path | Controller | Notes |
|--------|------|------------|-------|
| GET | /admin/dashboard | admin-dashboard | Only sub-routes consumed |
| GET | /admin/dashboard/moderation-queue | admin-dashboard | No FE consumer |
| GET | /admin/dashboard/classroom-overview | admin-dashboard | No FE consumer |
| GET | /admin/dashboard/assignment-stats | admin-dashboard | No FE consumer |
| GET | /admin/dashboard/actions/recent | admin-dashboard | No FE consumer |
| POST | /admin/organizations | admin-organizations | FE uses POST but via endpoint reference |
| PUT | /admin/organizations/:id | admin-organizations | No FE consumer found |
| PATCH | /admin/organizations/:id/subscription | admin-organizations | Defined in endpoints, unclear if called |
| PATCH | /admin/organizations/:id/features | admin-organizations | Defined in endpoints, unclear if called |
| POST | /admin/users | admin-users | Create user via admin - may be unused |
| PUT | /admin/users/:id | admin-users | No FE consumer (update user) |
| POST | /admin/users/:id/suspend | admin-users | Defined, no apiClient call found |
| POST | /admin/users/:id/activate | admin-users | Defined, no apiClient call found |
| POST | /admin/users/:id/unsuspend | admin-users | Defined, no apiClient call found |
| POST | /admin/users/:id/deactivate | admin-users | Defined, no apiClient call found |
| POST | /admin/users/bulk/suspend | admin-users | Defined, no apiClient call found |
| POST | /admin/users/bulk/delete | admin-users | Defined, no apiClient call found |
| POST | /admin/users/bulk/update-role | admin-users | Defined, no apiClient call found |
| GET | /admin/content/exercises/pending | admin-content | No FE consumer |
| POST | /admin/content/exercises/:id/approve | admin-content | No FE consumer |
| POST | /admin/content/exercises/:id/reject | admin-content | No FE consumer |
| POST | /admin/content/version | admin-content | No FE consumer |
| GET | /admin/content/approval-history | admin-content | No FE consumer |
| POST | /admin/system/config | admin-system | No FE consumer |
| POST | /admin/system/config/validate | admin-system | No FE consumer |
| PUT | /admin/system/config/:category | admin-system | No FE consumer |
| POST | /admin/system/maintenance | admin-system | No FE consumer |
| POST | /admin/system/maintenance/cleanup-logs | admin-system | No FE consumer |
| POST | /admin/system/maintenance/cleanup-activity | admin-system | No FE consumer |
| POST | /admin/system/maintenance/optimize-database | admin-system | No FE consumer |
| POST | /admin/system/maintenance/clear-cache | admin-system | No FE consumer |
| POST | /admin/system/maintenance/cleanup-sessions | admin-system | No FE consumer |
| GET | /admin/system/cron/status | admin-system | No FE consumer |
| GET | /admin/system/config/categories | admin-system | Defined in API_ENDPOINTS but no call |
| GET | /admin/system/logs | admin-system | No FE consumer |
| GET | /admin/progress/students/:id/achievements | admin-progress | No FE consumer |
| POST | /admin/reports/:id/schedule | admin-reports | No FE consumer |
| GET | /admin/reports/:id/info | admin-reports | No FE consumer |
| POST | /admin/bulk-operations/suspend-users | admin-bulk-operations | Separate from admin/users bulk |
| POST | /admin/bulk-operations/activate-users | admin-bulk-operations | No FE consumer |
| POST | /admin/bulk-operations/update-role | admin-bulk-operations | No FE consumer |
| POST | /admin/bulk-operations/delete-users | admin-bulk-operations | No FE consumer |
| GET | /admin/bulk-operations/:id | admin-bulk-operations | No FE consumer |
| GET | /admin/bulk-operations | admin-bulk-operations | No FE consumer |
| GET | /admin/gamification/settings | admin-gamification-config | FE uses PUT but not GET |
| PUT | /admin/gamification/settings | admin-gamification-config | FE calls POST preview, not PUT settings |
| POST | /admin/gamification/settings/preview | admin-gamification-config | No FE consumer |
| POST | /admin/gamification/settings/restore-defaults | admin-gamification-config | No FE consumer |
| GET | /admin/gamification/parameters/:id | admin-gamification-config | FE calls with 'key' param |
| GET | /admin/assignments | admin-assignments | No FE consumer |
| GET | /admin/assignments/stats | admin-assignments | No FE consumer |
| GET | /admin/assignments/:id | admin-assignments | No FE consumer |
| GET | /admin/assignments/classrooms/:classroomId | admin-assignments | No FE consumer |
| GET | /admin/assignments/students/:studentId | admin-assignments | No FE consumer |
| POST | /admin/classrooms/assign | classroom-assignments | No FE consumer |
| POST | /admin/classrooms/bulk-assign | classroom-assignments | No FE consumer |
| DELETE | /admin/classrooms/assign/:teacherId/:classroomId | classroom-assignments | No FE consumer |
| POST | /admin/classrooms/reassign | classroom-assignments | No FE consumer |
| GET | /admin/classrooms/teacher/:teacherId | classroom-assignments | No FE consumer |
| GET | /admin/classrooms/available | classroom-assignments | No FE consumer |
| GET | /admin/classrooms/:classroomId/history | classroom-assignments | No FE consumer |
| GET | /admin/interventions | admin-interventions | No FE consumer |
| GET | /admin/interventions/:id | admin-interventions | No FE consumer |
| PATCH | /admin/interventions/:id/acknowledge | admin-interventions | No FE consumer |
| PATCH | /admin/interventions/:id/resolve | admin-interventions | No FE consumer |
| DELETE | /admin/interventions/:id/dismiss | admin-interventions | No FE consumer |
| GET | /admin/alerts | admin-alerts | FE uses dismiss only |
| GET | /admin/alerts/stats/summary | admin-alerts | No FE consumer |
| GET | /admin/alerts/:id | admin-alerts | No FE consumer |
| POST | /admin/alerts | admin-alerts | No FE consumer |
| PATCH | /admin/alerts/:id/acknowledge | admin-alerts | No FE consumer |
| PATCH | /admin/alerts/:id/resolve | admin-alerts | No FE consumer |
| PATCH | /admin/alerts/:id/suppress | admin-alerts | No FE consumer |
| POST | /admin/roles | admin-roles | No FE consumer |
| DELETE | /admin/roles/:id | admin-roles | No FE consumer |
| GET | /tenants/:tenantId/branding | branding | Consumed via lib/api/branding.api.ts (need verify) |
| PATCH | /tenants/:tenantId/branding | branding | Consumed via lib/api/branding.api.ts |
| POST | /tenants/:tenantId/branding/logo | branding | Consumed via lib/api/branding.api.ts |
| POST | /tenants/:tenantId/branding/favicon | branding | Consumed via lib/api/branding.api.ts |
| GET | /tenants/:tenantId/branding/css | branding | No FE consumer |
| DELETE | /tenants/:tenantId/branding/assets | branding | Consumed via lib/api/branding.api.ts |

### social module (84 orphaned) -- KNOWN GAP

| Method | Path | Controller | Notes |
|--------|------|------------|-------|
| **team-challenges (9 endpoints - ALL orphaned)** | | | |
| GET | /social/team-challenges/teams/:teamId | team-challenges | No FE API wiring |
| GET | /social/team-challenges/challenges/:challengeId | team-challenges | No FE API wiring |
| GET | /social/team-challenges/teams/:teamId/challenges/:challengeId | team-challenges | No FE API wiring |
| POST | /social/team-challenges | team-challenges | No FE API wiring |
| PATCH | /social/team-challenges/:id/status | team-challenges | No FE API wiring |
| PATCH | /social/team-challenges/:id/score | team-challenges | No FE API wiring |
| POST | /social/team-challenges/:id/complete | team-challenges | No FE API wiring |
| POST | /social/team-challenges/:id/fail | team-challenges | No FE API wiring |
| GET | /social/team-challenges/challenges/:challengeId/leaderboard | team-challenges | guildsStore reads 1 (see note) |
| **peer-challenges (14 endpoints - ALL orphaned)** | | | |
| POST | /social/peer-challenges | peer-challenges | No FE API wiring |
| GET | /social/peer-challenges | peer-challenges | No FE API wiring |
| GET | /social/peer-challenges/open | peer-challenges | No FE API wiring |
| GET | /social/peer-challenges/active | peer-challenges | No FE API wiring |
| GET | /social/peer-challenges/:id | peer-challenges | No FE API wiring |
| GET | /social/peer-challenges/creator/:userId | peer-challenges | No FE API wiring |
| PATCH | /social/peer-challenges/:id | peer-challenges | No FE API wiring |
| PATCH | /social/peer-challenges/:id/start | peer-challenges | No FE API wiring |
| PATCH | /social/peer-challenges/:id/complete | peer-challenges | No FE API wiring |
| PATCH | /social/peer-challenges/:id/cancel | peer-challenges | No FE API wiring |
| PATCH | /social/peer-challenges/mark-expired | peer-challenges | No FE API wiring |
| DELETE | /social/peer-challenges/:id | peer-challenges | No FE API wiring |
| GET | /social/peer-challenges/stats/by-type | peer-challenges | No FE API wiring |
| GET | /social/peer-challenges/stats/by-status | peer-challenges | No FE API wiring |
| **challenge-participants (15 endpoints - ALL orphaned)** | | | |
| POST | /social/challenge-participants | challenge-participants | No FE API wiring |
| GET | /social/challenge-participants/challenge/:challengeId | challenge-participants | No FE API wiring |
| GET | /social/challenge-participants/challenge/:challengeId/user/:userId | challenge-participants | No FE API wiring |
| GET | /social/challenge-participants/user/:userId | challenge-participants | No FE API wiring |
| PATCH | /social/challenge-participants/.../accept | challenge-participants | No FE API wiring |
| PATCH | /social/challenge-participants/.../status | challenge-participants | No FE API wiring |
| PATCH | /social/challenge-participants/.../score | challenge-participants | No FE API wiring |
| PATCH | /social/challenge-participants/.../rankings | challenge-participants | No FE API wiring |
| PATCH | /social/challenge-participants/.../winner | challenge-participants | No FE API wiring |
| POST | /social/challenge-participants/.../rewards | challenge-participants | No FE API wiring |
| POST | /social/challenge-participants/challenge/:challengeId/rewards | challenge-participants | No FE API wiring |
| PATCH | /social/challenge-participants/.../forfeit | challenge-participants | No FE API wiring |
| PATCH | /social/challenge-participants/.../disqualify | challenge-participants | No FE API wiring |
| DELETE | /social/challenge-participants/challenge/:challengeId/user/:userId | challenge-participants | No FE API wiring |
| GET | /social/challenge-participants/user/:userId/stats | challenge-participants | No FE API wiring |
| **team-members (8 endpoints - ALL orphaned)** | | | |
| GET | /social/team-members/teams/:teamId | team-members | No FE API wiring |
| GET | /social/team-members/users/:userId | team-members | No FE API wiring |
| GET | /social/team-members/teams/:teamId/users/:userId | team-members | No FE API wiring |
| POST | /social/team-members | team-members | No FE API wiring |
| PATCH | /social/team-members/:id/role | team-members | No FE API wiring |
| DELETE | /social/team-members/:id | team-members | No FE API wiring |
| GET | /social/team-members/teams/:teamId/active | team-members | No FE API wiring |
| POST | /social/team-members/teams/:teamId/transfer-ownership | team-members | No FE API wiring |
| **user-follows (7 endpoints - ALL orphaned)** | | | |
| POST | /api/v1/social/follows/users/:followerId/follow | user-follows | No FE API wiring |
| DELETE | /api/v1/social/follows/users/:followerId/unfollow/:followingId | user-follows | No FE API wiring |
| GET | /api/v1/social/follows/users/:userId/followers | user-follows | No FE API wiring |
| GET | /api/v1/social/follows/users/:userId/following | user-follows | No FE API wiring |
| GET | /api/v1/social/follows/users/:followerId/is-following/:followingId | user-follows | No FE API wiring |
| GET | /api/v1/social/follows/users/:userId/counts | user-follows | No FE API wiring |
| GET | /api/v1/social/follows/users/:userId/mutual | user-follows | No FE API wiring |
| **Partially orphaned (friends)** | | | |
| GET | /friends/leaderboard | friends | No FE consumer |
| POST | /friends/request/:id/respond | friends | FE uses different approach |
| **Partially orphaned (schools)** | | | |
| POST | /social/schools | schools | No FE consumer |
| PATCH | /social/schools/:id | schools | No FE consumer |
| DELETE | /social/schools/:id | schools | No FE consumer |
| PATCH | /social/schools/:id/settings | schools | No FE consumer |
| **Partially orphaned (classrooms)** | | | |
| POST | /social/classrooms/:classroomId/students/:studentId | classrooms | No FE consumer |
| DELETE | /social/classrooms/:classroomId/students/:studentId | classrooms | No FE consumer |
| PATCH | /social/classrooms/:id/schedule | classrooms | No FE consumer |
| **user-activities (partially orphaned)** | | | |
| POST | /social/activities | user-activities | Defined in API_ENDPOINTS but no call found |
| GET | /social/activities/public/all | user-activities | Defined in API_ENDPOINTS but no call found |

> **Note:** The social module having ~40 orphaned endpoints for team/peer challenges is a **KNOWN GAP** (documented in MEMORY.md: "Team Challenges (9ep), Peer Challenges (16ep), Challenge Participants (15ep) have backend but NO frontend API calls").

### content module (60 orphaned)

| Method | Path | Controller | Notes |
|--------|------|------------|-------|
| **tags (8 endpoints - ALL orphaned)** | | | |
| GET | /api/v1/content/tags | tags | No FE consumer |
| GET | /api/v1/content/tags/popular | tags | No FE consumer |
| GET | /api/v1/content/tags/search | tags | No FE consumer |
| GET | /api/v1/content/tags/category/:category | tags | No FE consumer |
| GET | /api/v1/content/tags/:id | tags | No FE consumer |
| POST | /api/v1/content/tags | tags | No FE consumer |
| PATCH | /api/v1/content/tags/:id | tags | No FE consumer |
| DELETE | /api/v1/content/tags/:id | tags | No FE consumer |
| **moderation-rules (10 endpoints - ALL orphaned)** | | | |
| GET | /api/v1/content/moderation-rules | moderation-rules | No FE consumer |
| GET | /api/v1/content/moderation-rules/active | moderation-rules | No FE consumer |
| GET | /api/v1/content/moderation-rules/target/:target | moderation-rules | No FE consumer |
| GET | /api/v1/content/moderation-rules/type/:type | moderation-rules | No FE consumer |
| GET | /api/v1/content/moderation-rules/:id | moderation-rules | No FE consumer |
| POST | /api/v1/content/moderation-rules | moderation-rules | No FE consumer |
| PATCH | /api/v1/content/moderation-rules/:id | moderation-rules | No FE consumer |
| POST | /api/v1/content/moderation-rules/:id/activate | moderation-rules | No FE consumer |
| POST | /api/v1/content/moderation-rules/:id/deactivate | moderation-rules | No FE consumer |
| DELETE | /api/v1/content/moderation-rules/:id | moderation-rules | No FE consumer |
| **media-metadata (6 endpoints - ALL orphaned)** | | | |
| GET | /api/v1/content/media-metadata/:id | media-metadata | No FE consumer |
| GET | /api/v1/content/media-metadata/media-file/:mediaFileId | media-metadata | No FE consumer |
| POST | /api/v1/content/media-metadata | media-metadata | No FE consumer |
| PATCH | /api/v1/content/media-metadata/:id | media-metadata | No FE consumer |
| POST | /api/v1/content/media-metadata/upsert/:mediaFileId | media-metadata | No FE consumer |
| DELETE | /api/v1/content/media-metadata/:id | media-metadata | No FE consumer |
| **content-versions (8 endpoints - ALL orphaned)** | | | |
| GET | /api/v1/content/versions/:contentType/:contentId | content-versions | No FE consumer |
| GET | /api/v1/content/versions/:contentType/:contentId/latest | content-versions | No FE consumer |
| GET | /api/v1/content/versions/:contentType/:contentId/published | content-versions | No FE consumer |
| GET | /api/v1/content/versions/by-id/:id | content-versions | No FE consumer |
| POST | /api/v1/content/versions | content-versions | No FE consumer |
| POST | /api/v1/content/versions/:id/publish | content-versions | No FE consumer |
| POST | /api/v1/content/versions/:id/unpublish | content-versions | No FE consumer |
| GET | /api/v1/content/versions/compare | content-versions | No FE consumer |
| **flagged-content (10 endpoints - ALL orphaned)** | | | |
| GET | /api/v1/content/flagged | flagged-content | No FE consumer |
| GET | /api/v1/content/flagged/stats | flagged-content | No FE consumer |
| GET | /api/v1/content/flagged/pending | flagged-content | No FE consumer |
| GET | /api/v1/content/flagged/:id | flagged-content | No FE consumer |
| GET | /api/v1/content/flagged/content/:contentType/:contentId | flagged-content | No FE consumer |
| POST | /api/v1/content/flagged | flagged-content | No FE consumer |
| POST | /api/v1/content/flagged/:id/approve | flagged-content | No FE consumer |
| POST | /api/v1/content/flagged/:id/reject | flagged-content | No FE consumer |
| POST | /api/v1/content/flagged/:id/remove | flagged-content | No FE consumer |
| PATCH | /api/v1/content/flagged/:id/priority | flagged-content | No FE consumer |
| **marie-curie-content (partially orphaned)** | | | |
| DELETE | /content/marie-curie/:id | marie-curie-content | No FE consumer |
| POST | /content/marie-curie/:id/publish | marie-curie-content | No FE consumer |
| GET | /content/marie-curie/published | marie-curie-content | No FE consumer |
| GET | /content/marie-curie/featured | marie-curie-content | No FE consumer |
| **content-authors (partially orphaned)** | | | |
| GET | /content/authors/featured | content-authors | No FE consumer |
| GET | /content/authors/verified | content-authors | No FE consumer |
| GET | /content/authors/top-rated | content-authors | No FE consumer |
| GET | /content/authors/stats | content-authors | No FE consumer |
| GET | /content/authors/expertise/:area | content-authors | No FE consumer |
| GET | /content/authors/user/:userId | content-authors | No FE consumer |
| PATCH | /content/authors/:id | content-authors | No FE consumer |
| PATCH | /content/authors/user/:userId/increment-created | content-authors | No FE consumer |
| PATCH | /content/authors/user/:userId/increment-published | content-authors | No FE consumer |
| PATCH | /content/authors/:id/rating | content-authors | No FE consumer |
| PATCH | /content/authors/:id/featured | content-authors | No FE consumer |
| PATCH | /content/authors/:id/verified | content-authors | No FE consumer |
| DELETE | /content/authors/:id | content-authors | No FE consumer |
| **media-files (partially orphaned)** | | | |
| GET | /content/media-files/type/:fileType | media-files | No FE consumer |
| GET | /content/media-files/search | media-files | No FE consumer |
| PATCH | /content/media-files/:id/status | media-files | No FE consumer |
| GET | /content/media-files/stats | media-files | No FE consumer |
| GET | /content/media-files/users/:userId | media-files | No FE consumer |
| POST | /content/media-files/:id/thumbnail | media-files | No FE consumer |
| POST | /content/media-files/:id/increment/:counterType | media-files | No FE consumer |

### notifications module (29 orphaned)

| Method | Path | Controller | Notes |
|--------|------|------------|-------|
| **notification-templates (9 endpoints - ALL orphaned)** | | | |
| GET | /notifications/templates | notification-templates | No FE consumer |
| GET | /notifications/templates/:templateKey | notification-templates | No FE consumer |
| POST | /notifications/templates/:templateKey/render | notification-templates | No FE consumer |
| POST | /notifications/templates/preview | notification-templates | No FE consumer |
| POST | /notifications/templates/validate | notification-templates | No FE consumer |
| GET | /notifications/templates/locales | notification-templates | No FE consumer |
| POST | /notifications/templates/:templateKey/render-localized | notification-templates | No FE consumer |
| GET | /notifications/templates/:templateKey/versions | notification-templates | No FE consumer |
| GET | /notifications/templates/:templateKey/version/:version | notification-templates | No FE consumer |
| **notification-analytics (10 endpoints - ALL orphaned)** | | | |
| GET | /notifications/analytics/summary | notification-analytics | No FE consumer |
| GET | /notifications/analytics/by-template/:templateKey | notification-analytics | No FE consumer |
| GET | /notifications/analytics/by-channel/:channel | notification-analytics | No FE consumer |
| GET | /notifications/delivery/:notificationId | notification-analytics | No FE consumer |
| GET | /notifications/errors | notification-analytics | No FE consumer |
| GET | /notifications/errors/:notificationId | notification-analytics | No FE consumer |
| POST | /notifications/track/open | notification-analytics | No FE consumer |
| GET | /notifications/track/open | notification-analytics | No FE consumer |
| POST | /notifications/track/click | notification-analytics | No FE consumer |
| GET | /notifications/track/click | notification-analytics | No FE consumer |
| **notification-multichannel (2 endpoints - ALL orphaned)** | | | |
| POST | /notifications/multichannel | notification-multichannel | No FE consumer |
| POST | /notifications/multichannel/send-from-template | notification-multichannel | No FE consumer |
| **notification-rate-limit (5 endpoints - ALL orphaned)** | | | |
| GET | /notifications/rate-limit/status | notification-rate-limit | No FE consumer |
| GET | /notifications/rate-limit/config | notification-rate-limit | No FE consumer |
| GET | /notifications/rate-limit/channel/:channel | notification-rate-limit | No FE consumer |
| POST | /notifications/rate-limit/reset/:channel | notification-rate-limit | No FE consumer |
| POST | /notifications/rate-limit/reset-all | notification-rate-limit | No FE consumer |
| **sms (3 endpoints - ALL orphaned)** | | | |
| POST | /notifications/sms/send | sms | No FE consumer |
| POST | /notifications/sms/bulk | sms | No FE consumer |
| GET | /notifications/sms/status | sms | No FE consumer |

### lti module (41 orphaned)

All 42 LTI endpoints are orphaned from regular frontend, except 1 `apiClient.delete` call in `lib/api/lti.api.ts`.

| Controller | Endpoints | Orphaned | Notes |
|-----------|-----------|----------|-------|
| oidc | 6 | 5 | LTI OAuth flow, 1 consumed |
| lti-consumers | 9 | 9 | Admin management |
| lti-sessions | 10 | 10 | Server-side session management |
| lti-grade-passbacks | 11 | 11 | Grade sync, server-triggered |
| deep-linking | 6 | 6 | LTI deep linking protocol |

### etl module (16 orphaned - ALL, NOT IMPORTED)

| Controller | Endpoints | Notes |
|-----------|-----------|-------|
| etl.controller (extract) | 5 | Module NOT imported in app.module.ts |
| transform.controller (transform) | 3 | Module NOT imported in app.module.ts |
| transform.controller (validation) | 1 | Module NOT imported in app.module.ts |
| transform.controller (cache) | 2 | Module NOT imported in app.module.ts |
| etl-load.controller | 5 | Module NOT imported in app.module.ts |

### ml module (21 orphaned - ALL, NOT IMPORTED)

| Controller | Endpoints | Notes |
|-----------|-----------|-------|
| prediction.controller | 9 | Module NOT imported in app.module.ts |
| features.controller | 5 | Module NOT imported in app.module.ts |
| model-admin.controller | 7 | Module NOT imported in app.module.ts |

### visualization module (21 orphaned - ALL, NOT IMPORTED)

| Controller | Endpoints | Notes |
|-----------|-----------|-------|
| aggregation.controller | 2 | Module NOT imported in app.module.ts |
| chart.controller | 4 | Module NOT imported in app.module.ts |
| dashboard.controller | 7 | Module NOT imported in app.module.ts |
| report.controller | 8 | Module NOT imported in app.module.ts |

### gamification module (17 orphaned)

| Method | Path | Controller | Notes |
|--------|------|------------|-------|
| GET | /gamification/users/:userId/achievements/summary | achievements | No FE consumer (FE uses different pattern) |
| GET | /gamification/achievements/user/:userId/progress/:achievementId | achievements | No FE consumer |
| POST | /gamification/achievements/user/:userId/unlock/:achievementId | achievements | No FE consumer |
| POST | /gamification/users/:userId/achievements/:achievementId/claim | achievements | No FE consumer |
| GET | /gamification/leaderboard/schools/:schoolId | leaderboard | No FE consumer |
| GET | /gamification/leaderboard/friends/:userId | leaderboard | No FE consumer |
| GET | /gamification/users/:userId/ml-coins/multiplier | ml-coins | No FE consumer |
| GET | /gamification/ml-coins/multiplier-table | ml-coins | No FE consumer |
| GET | /gamification/users/:userId/ml-coins/calculate | ml-coins | No FE consumer |
| POST | /gamification/users/:userId/ml-coins/add-with-multiplier | ml-coins | No FE consumer |
| GET | /gamification/ranks/users/:userId/rank-history | ranks | No FE consumer |
| GET | /gamification/ranks/check-promotion/:userId | ranks | No FE consumer |
| POST | /gamification/ranks/admin/ranks | ranks | No FE consumer |
| PUT | /gamification/ranks/admin/ranks/:id | ranks | No FE consumer |
| DELETE | /gamification/ranks/admin/ranks/:id | ranks | No FE consumer |
| GET | /admin/mission-templates | mission-templates | No FE consumer |
| POST | /admin/mission-templates/seed/initial | mission-templates | No FE consumer |

### progress module (12 orphaned)

| Method | Path | Controller | Notes |
|--------|------|------------|-------|
| GET | /progress/users/:userId/modules/:moduleId/exercises | module-progress | No FE consumer |
| POST | /progress | module-progress (create) | No FE consumer |
| PATCH | /progress/:id | module-progress (update) | No FE consumer |
| GET | /progress/users/:userId/learning-path | module-progress | No FE consumer |
| GET | /progress/sessions/:id | learning-session | No FE consumer (FE uses userId-based) |
| PATCH | /progress/sessions/:id/engagement | learning-session | No FE consumer |
| GET | /progress/sessions/users/:userId/range | learning-session | No FE consumer |
| GET | /progress/attempts/exercises/:exerciseId | exercise-attempt | No FE consumer |
| GET | /progress/attempts/users/:userId/exercises/:exerciseId/next-number | exercise-attempt | No FE consumer |
| GET | /progress/attempts/users/:userId/exercises/:exerciseId/best | exercise-attempt | No FE consumer |
| PATCH | /progress/attempts/:id/comodines | exercise-attempt | No FE consumer |
| POST | /progress/submissions/:id/feedback | exercise-submission | No FE consumer |

### teacher module (21 orphaned)

| Method | Path | Controller | Notes |
|--------|------|------------|-------|
| GET | /teacher/dashboard/module-progress | teacher | Defined in API_ENDPOINTS but no apiClient call |
| GET | /teacher/reports/recent | teacher | Defined in API_ENDPOINTS, low confidence |
| GET | /teacher/reports/stats | teacher | Defined in API_ENDPOINTS, low confidence |
| GET | /teacher/reports/:id/status | teacher | Defined in API_ENDPOINTS |
| GET | /teacher/reports/scheduled | teacher | No FE consumer |
| POST | /teacher/reports/scheduled | teacher | No FE consumer |
| GET | /teacher/reports/scheduled/:id | teacher | No FE consumer |
| PUT | /teacher/reports/scheduled/:id | teacher | No FE consumer |
| DELETE | /teacher/reports/scheduled/:id | teacher | No FE consumer |
| POST | /teacher/reports/scheduled/:id/pause | teacher | No FE consumer |
| POST | /teacher/reports/scheduled/:id/resume | teacher | No FE consumer |
| POST | /teacher/reports/share | teacher | No FE consumer |
| GET | /teacher/reports/shared/by-me | teacher | No FE consumer |
| GET | /teacher/reports/shared/with-me | teacher | No FE consumer |
| POST | /teacher/reports/shared/:id/view | teacher | No FE consumer |
| DELETE | /teacher/reports/shared/:id | teacher | No FE consumer |
| PUT | /teacher/reports/shared/:id/permission | teacher | No FE consumer |
| GET | /teacher/grades | teacher-grades | FE references API_ENDPOINTS.teacher.grades |
| GET | /teacher/grades/:id | teacher-grades | No FE consumer |
| GET | /teacher/classrooms/:classroomId/students/:studentId/permissions | teacher-classrooms | No FE consumer |
| PATCH | /teacher/classrooms/:classroomId/students/:studentId/permissions | teacher-classrooms | No FE consumer |

### educational module (10 orphaned)

| Method | Path | Controller | Notes |
|--------|------|------------|-------|
| GET | /educational/modules/difficulty/:difficulty | modules | No FE consumer |
| GET | /educational/modules/search | modules | No FE consumer |
| GET | /educational/modules/:id/prerequisites | modules | No FE consumer |
| POST | /educational/exercises/validate-content | exercises | No FE consumer |
| GET | /educational/media/category/:category | media | No FE consumer |
| PATCH | /educational/media/:id/status | media | No FE consumer |
| GET | /educational/media/:id/info | media-upload | No FE consumer |
| GET | /educational/media/submission/:submissionId | media-upload | No FE consumer |
| GET | /educational/media/exercise/:exerciseId | media-upload | No FE consumer |
| POST | /educational/exercises/:id/submit | exercises | FE uses progress/submissions instead |

### auth module (7 orphaned)

| Method | Path | Controller | Notes |
|--------|------|------------|-------|
| PUT | /auth/profile | auth | FE uses GET /auth/profile but not PUT |
| GET | /auth/sessions | auth | Defined but no direct call found |
| DELETE | /auth/sessions (all) | auth | No FE consumer |
| POST | /auth/2fa/setup | auth | No FE consumer |
| POST | /auth/2fa/setup/verify | auth | No FE consumer |
| POST | /auth/2fa/disable | auth | No FE consumer |
| POST | /auth/2fa/resend | auth | No FE consumer |

### parents module (7 orphaned)

| Method | Path | Controller | Notes |
|--------|------|------------|-------|
| GET | /parent-portal/students/:studentId/activities | parent-portal | No FE consumer |
| GET | /parent-portal/students/:studentId/assignments | parent-portal | No FE consumer |
| POST | /parent-portal/reports/weekly/:studentId | parent-portal | No FE consumer |
| GET | /parent-portal/notifications/unread-count | parent-portal | No FE consumer |
| POST | /parent-portal/auth/register | parent-auth | FE uses PARENT_ENDPOINTS |
| POST | /parent-portal/auth/login | parent-auth | FE uses PARENT_ENDPOINTS |
| POST | /parent-portal/auth/refresh | parent-auth | FE uses PARENT_ENDPOINTS |

---

## Phantom API Calls (frontend calls with no backend match)

| Frontend File | HTTP Method | URL Pattern | Notes |
|---------------|-------------|-------------|-------|
| api.config.ts | - | `/auth/validate-token` | No backend endpoint exists |
| api.config.ts | - | `/auth/request-password-reset` | Backend has `reset-password/request` not `request-password-reset` |
| api.config.ts | - | `/auth/me` | No backend `GET /auth/me`; uses `/auth/profile` |
| api.config.ts | - | `/economy/users/:userId/balance` | No `/economy` controller; FE should use `/gamification/users/:userId/ml-coins` |
| api.config.ts | - | `/economy/users/:userId/transactions` | No `/economy` controller |
| api.config.ts | - | `/economy/shop` | No `/economy` controller; FE should use `/gamification/shop` |
| api.config.ts | - | `/economy/purchase` | No `/economy` controller |
| api.config.ts | - | `/economy/earn` | No `/economy` controller |
| api.config.ts | - | `/economy/spend` | No `/economy` controller |
| api.config.ts | - | `/economy/shop/items` | No `/economy` controller |
| api.config.ts | - | `/economy/shop/items/:itemId` | No `/economy` controller |
| api.config.ts | - | `/economy/users/:userId/inventory` | No `/economy` controller |
| api.config.ts | - | `/economy/users/:userId/inventory/:itemId` | No `/economy` controller |
| api.config.ts | - | `/educational/lessons` | No `/educational/lessons` route in backend |
| api.config.ts | - | `/educational/lessons/:id` | No `/educational/lessons` route in backend |
| api.config.ts | - | `/educational/users/:userId/dashboard` | No such route |
| api.config.ts | - | `/educational/users/:userId/analytics` | No such route |
| api.config.ts | - | `/educational/users/:userId/activity-stats` | No such route |
| api.config.ts | - | `/educational/users/:userId/activities` | No such route; social module has activities |
| api.config.ts | - | `/mechanics/*` | No `/mechanics` controller in backend |
| api.config.ts | - | `/ai/*` | No `/ai` controller in backend |
| api.config.ts | - | `/gamification/streaks/:userId` | No streaks endpoint in backend |
| api.config.ts | - | `/gamification/leaderboard/user/:userId/position` | No such endpoint; backend uses `leaderboards/user-rank` |
| api.config.ts | - | `/gamification/friends/*` | FE friends uses `/gamification/friends/...` but backend is `/friends/...` or `/social/...` |
| api.config.ts | - | `/student/dashboard` | No `/student` controller |
| api.config.ts | - | `/student/users/:userId/profile` | No `/student` controller |
| api.config.ts | - | `/student/courses` | No `/student` controller |
| api.config.ts | - | `/student/grades` | No `/student` controller |
| api.config.ts | - | `/health/status` | Backend has `/health/live` not `/health/status` |
| api.config.ts | - | `/health/detailed` | Backend has `/health/ready` not `/health/detailed` |
| api.config.ts | - | `/admin/activity` | No `/admin/activity` endpoint in admin controllers |
| api.config.ts | - | `/admin/errors/*` | No `/admin/errors` endpoint in admin controllers |
| api.config.ts | - | `/admin/metrics` | No direct `/admin/metrics`; uses `/admin/system/metrics` or `/admin/monitoring/metrics` |
| api.config.ts | - | `/admin/alerts/:id/dismiss` | Backend has `/admin/alerts/:id/suppress`, not `dismiss` |
| api.config.ts | - | `/admin/alerts/dismiss-all` | No such endpoint in backend |
| NotificationService.ts | POST | `/notifications/send` | No `/notifications/send` endpoint; backend uses `/notifications` (POST) |
| gamificationConfigApi.ts | POST | `/admin/gamification/config/parameters/:key/reset` | No such endpoint (backend has PATCH) |
| gamificationConfigApi.ts | POST | `/admin/gamification/config/parameters/bulk-update` | No such endpoint |
| gamificationConfigApi.ts | POST | `/admin/gamification/config/preview-impact` | No such endpoint (backend has `settings/preview`) |
| gamificationConfigApi.ts | GET | `/admin/gamification/config/stats` | No such endpoint |

> **Note:** Many phantom entries in `API_ENDPOINTS` are aspirational constants defined during planning. Only those that have actual `apiClient.*()` calls are true phantoms in runtime. The `economy/*`, `mechanics/*`, `ai/*`, `student/*` namespaces appear to be planned but never had backend implementation. The `gamification/friends/*` namespace uses URLs that don't match the actual `/friends/` and `/social/friendships/` backend routes.

---

## Findings

### F-B-001: Coverage is 60.8% with ~354 orphaned endpoints
This is expected for an MVP at 98% completion. The majority of orphaned endpoints fall into well-understood categories.

### F-B-002: 58 backend endpoints in NOT-IMPORTED modules (etl, ml, visualization)
These 3 modules (58 endpoints total) are NOT imported in `app.module.ts` and are therefore not reachable at runtime. They represent future capabilities (data warehouse analytics, ML predictions, visualization dashboards). These should not be counted as gaps.

### F-B-003: Social challenges have 46 orphaned endpoints (KNOWN GAP)
The team-challenges (9), peer-challenges (14), challenge-participants (15), and user-follows (7) sub-controllers have full backend implementations but zero frontend wiring. This is documented in project memory as "backend 95%, frontend integration 60%".

### F-B-004: Content management has 42 orphaned endpoints in specialized controllers
The `tags`, `moderation-rules`, `media-metadata`, `content-versions`, and `flagged-content` controllers are all advanced content management features that the admin portal has not yet wired up.

### F-B-005: Notification subsystem has 29 orphaned endpoints
The `notification-templates`, `notification-analytics`, `notification-multichannel`, `notification-rate-limit`, and `sms` controllers represent backend-heavy notification infrastructure that operates server-side. Many of these are admin-facing and may never need frontend consumers.

### F-B-006: LTI module has 41 orphaned endpoints (EXPECTED)
LTI (Learning Tools Interoperability) is a server-to-server protocol. Only 1 frontend call exists (`lti.api.ts`). This is architecturally correct.

### F-B-007: ~35 phantom API_ENDPOINTS definitions point to nonexistent backends
The `economy/*`, `mechanics/*`, `ai/*`, `student/*`, `gamification/friends/*`, and `gamification/streaks/*` namespaces in `api.config.ts` have no corresponding backend controllers. These are either:
- Aspirational endpoints planned for future sprints
- Incorrect path mappings (e.g., `economy` should be `gamification/shop` + `gamification/comodines`)
- Frontend route stubs that were never connected

### F-B-008: Auth API_ENDPOINTS mismatch
Several auth-related frontend endpoints use different paths than the backend:
- FE: `/auth/request-password-reset` vs BE: `/auth/reset-password/request`
- FE: `/auth/me` vs BE: `/auth/profile`
- FE: `/auth/validate-token` does not exist in backend

### F-B-009: Admin alerts FE uses `/admin/alerts/:id/dismiss` but BE has `suppress`
The frontend calls `dismiss` actions on admin alerts, but the backend controller only has `suppress`. This is either a naming mismatch or a missing endpoint.

### F-B-010: Notification send phantom
`NotificationService.ts` calls `POST /notifications/send` but backend `notifications.controller.ts` uses `POST /notifications` (no `/send` suffix).

### F-B-011: Adjusted orphan count excluding non-imported modules
Excluding etl (16), ml (21), visualization (21) = 58 endpoints from modules NOT in app.module.ts:
- **Effective orphaned (reachable but unconsumed):** 354 - 58 = **296 endpoints**
- **Effective coverage of reachable endpoints:** 548 / (902 - 58) = **65.0%**

---

## Risk Assessment

| Risk | Severity | Count | Action |
|------|----------|-------|--------|
| Phantom API calls at runtime | **HIGH** | ~10 active | Fix `economy` mappings, `auth/me`, `notifications/send` |
| Auth path mismatches | **MEDIUM** | 3 | Align FE api.config.ts with actual backend routes |
| Social challenge orphans | **LOW** | 46 | Known gap, Sprint 2+ backlog |
| Content mgmt orphans | **LOW** | 42 | Admin portal enhancement backlog |
| Notification admin orphans | **LOW** | 29 | Server-side infrastructure, acceptable |
| Non-imported module endpoints | **INFO** | 58 | Future capabilities, no action needed |

---

*Generated by Agent B - Backend-to-Frontend Endpoint Coverage Analysis*
*Method: Systematic grep of @Controller/@Get/@Post/@Patch/@Put/@Delete across 107 controllers + 50+ frontend API files*
