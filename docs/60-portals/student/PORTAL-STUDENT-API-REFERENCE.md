---
titulo: "Student Portal — API Reference"
tipo: api
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Student Portal — API Reference

> **Version:** 1.0.0 | **Fecha:** 2026-02-27
> **Base URL:** `/api/v1/`
> **Auth:** JWT Bearer Token (Authorization: Bearer \<token\>)

---

## Summary

| Domain | Endpoint Count | Notes |
|--------|---------------|-------|
| Authentication | 13 | Login, register, session management |
| Educational Content | 16 | Modules, exercises, media |
| Progress Tracking | 32 | Attempts, submissions, sessions, certificates, missions |
| Gamification | 34 | XP, ranks, achievements, missions, shop, ML coins, comodines, inventory |
| Social | 0 | Not yet implemented for student portal |
| Profile | 3 | Get, update, avatar upload |
| **Total** | **98** | Student-facing endpoints across all domains |

---

## 1. Authentication

Base path: `/api/v1/auth/`

All auth endpoints accept and return `application/json` unless noted.

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| POST | `/auth/login` | Authenticate user and receive JWT tokens | `{ email, password }` | No | All |
| POST | `/auth/register` | Register new student account | `{ email, password, first_name, last_name, school_id? }` | No | All |
| POST | `/auth/logout` | Invalidate current session token | — | Yes (JWT) | All |
| POST | `/auth/refresh` | Exchange refresh token for new access token | `{ refreshToken }` | No | All |
| GET | `/auth/profile` | Get current authenticated user profile | — | Yes (JWT) | All |
| PUT | `/auth/profile` | Update authenticated user profile fields | `{ firstName?, lastName?, displayName? }` | Yes (JWT) | All |
| PUT | `/auth/change-password` | Change password for authenticated user | `{ currentPassword, newPassword }` | Yes (JWT) | All |
| POST | `/auth/reset-password/request` | Request password reset email | `{ email }` | No | All |
| POST | `/auth/reset-password` | Reset password using token from email | `{ token, newPassword }` | No | All |
| POST | `/auth/verify-email` | Verify email address with token (deprecated — auto-verified on register) | `{ token }` | No | All |
| GET | `/auth/sessions` | List all active sessions for current user | — | Yes (JWT) | All |
| DELETE | `/auth/sessions/:sessionId` | Revoke a specific session by ID | — | Yes (JWT) | All |

---

## 2. Educational Content

### 2.1 Modules

Base path: `/api/v1/educational/modules`

The 5 educational modules correspond to reading comprehension levels: Literal (M1), Inferencial (M2), Reorganizacional (M3), Critica (M4), Apreciativa (M5).

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/educational/modules` | List all modules; student receives progress-enriched list from classroom assignment | — | Yes (JWT) | All |
| GET | `/educational/modules/difficulty/:difficulty` | Filter modules by difficulty level | — | Yes (JWT) | All |
| GET | `/educational/modules/search?q=` | Search modules by title or description | — | Yes (JWT) | All |
| GET | `/educational/modules/user/:userId` | Get modules available to a specific user (respects RLS and classroom assignment) | — | Yes (JWT) | All |
| GET | `/educational/modules/:id` | Get a single module by UUID | — | Yes (JWT) | All |
| GET | `/educational/modules/:id/prerequisites` | Get prerequisite modules required before accessing this module | — | Yes (JWT) | All |
| POST | `/educational/modules` | Create a new module (admin/teacher only) | `{ title, description, difficulty, order_index, ... }` | Yes (JWT) | admin_teacher, super_admin |
| PATCH | `/educational/modules/:id` | Update an existing module (admin/teacher only) | Partial module fields | Yes (JWT) | admin_teacher, super_admin |
| DELETE | `/educational/modules/:id` | Delete a module (admin only) | — | Yes (JWT) | super_admin |

### 2.2 Exercises

Base path: `/api/v1/educational/`

Student access is filtered by RLS — only exercises from assigned classrooms are returned.

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/educational/exercises` | List all accessible exercises (RLS-filtered by classroom) | — | Yes (JWT) | All |
| GET | `/educational/exercises/:id` | Get a single exercise by UUID with full content | — | Yes (JWT) | All |
| GET | `/educational/modules/:moduleId/exercises` | List all exercises within a specific module | — | Yes (JWT) | All |
| GET | `/educational/exercises/:exerciseId/hints` | Get available hints for an exercise | — | Yes (JWT) | All |
| POST | `/educational/exercises/:id/submit` | Submit answers for an auto-gradable exercise; returns score, rewards, feedback | `{ answers, startedAt?, hintsUsed?, powerupsUsed?, userId? }` | Yes (JWT) | student |
| POST | `/educational/exercises` | Create a new exercise (admin/teacher only) | `{ title, type, module_id, content, ... }` | Yes (JWT) | admin_teacher, super_admin |
| PATCH | `/educational/exercises/:id` | Update an existing exercise (admin/teacher only) | Partial exercise fields | Yes (JWT) | admin_teacher, super_admin |
| DELETE | `/educational/exercises/:id` | Delete an exercise (admin only) | — | Yes (JWT) | super_admin |
| POST | `/educational/exercises/validate-content` | Validate exercise content structure before saving (admin/teacher only) | Exercise content object | Yes (JWT) | admin_teacher, super_admin |

> **Submit response (auto-graded):** `{ attemptId, score, isPerfect, correctAnswersCount, totalQuestions, rewards: { xp, mlCoins, bonuses }, feedback: { overall, answerReview[] }, isFirstCorrectAttempt, rankUp?, achievements? }`
>
> **Submit response (manual review):** `{ score, isPerfect, rewards, rankUp, feedback, status: 'submitted', requiresManualReview: true, message }`

### 2.3 Media

Base path: `/api/v1/educational/media`

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/educational/media` | List all media resources | — | Yes (JWT) | All |
| GET | `/educational/media/category/:category` | List media filtered by category | — | Yes (JWT) | All |
| GET | `/educational/media/:id` | Get a single media resource by UUID | — | Yes (JWT) | All |
| POST | `/educational/media/upload` | Upload a new media file (multipart/form-data) | `file` (multipart field) | Yes (JWT) | admin_teacher, super_admin |
| GET | `/educational/media/:id/info` | Get detailed metadata about an uploaded file | — | Yes (JWT) | All |
| DELETE | `/educational/media/:id` | Delete a media resource (admin only) | — | Yes (JWT) | super_admin |
| PATCH | `/educational/media/:id/status` | Update media status (approve/reject — admin only) | `{ status }` | Yes (JWT) | admin_teacher, super_admin |
| GET | `/educational/media/submission/:submissionId` | Get all media attached to a specific submission | — | Yes (JWT) | All |
| GET | `/educational/media/exercise/:exerciseId` | Get all media associated with a specific exercise | — | Yes (JWT) | All |

---

## 3. Progress Tracking

### 3.1 Exercise Attempts

Base path: `/api/v1/progress/attempts`

Used for auto-gradable exercises. Tracks each attempt with score, comodines used, and timing.

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| POST | `/progress/attempts` | Create a new exercise attempt record | `{ user_id, exercise_id, module_id, ... }` | Yes (JWT) | student |
| GET | `/progress/attempts/users/:userId` | Get all attempts for a user | — | Yes (JWT) | All |
| GET | `/progress/attempts/exercises/:exerciseId` | Get all attempts for a specific exercise | — | Yes (JWT) | All |
| GET | `/progress/attempts/users/:userId/exercises/:exerciseId` | Get all attempts by a user on a specific exercise | — | Yes (JWT) | All |
| GET | `/progress/attempts/users/:userId/exercises/:exerciseId/next-number` | Get the next attempt number for sequencing | — | Yes (JWT) | All |
| POST | `/progress/attempts/:id/submit` | Submit answers for an existing attempt | `{ answers, hintsUsed?, comodinesUsed? }` | Yes (JWT) | student |
| GET | `/progress/attempts/users/:userId/stats` | Get aggregate attempt statistics for a user | — | Yes (JWT) | All |
| GET | `/progress/attempts/users/:userId/exercises/:exerciseId/best` | Get the best attempt by a user on a specific exercise | — | Yes (JWT) | All |
| PATCH | `/progress/attempts/:id/comodines` | Update comodines usage on an existing attempt | `{ comodin_type, quantity }` | Yes (JWT) | student |

### 3.2 Exercise Submissions

Base path: `/api/v1/progress/submissions`

Used for exercises requiring manual teacher review (`requires_manual_grading = true`).

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| POST | `/progress/submissions` | Create a new submission record | `{ user_id, exercise_id, content, ... }` | Yes (JWT) | student |
| GET | `/progress/submissions/users/:userId` | Get all submissions for a user | — | Yes (JWT) | All |
| GET | `/progress/submissions/exercises/:exerciseId` | Get all submissions for a specific exercise | — | Yes (JWT) | All |
| GET | `/progress/submissions/users/:userId/exercises/:exerciseId` | Get submissions by a user on a specific exercise | — | Yes (JWT) | All |
| POST | `/progress/submissions/submit` | Submit a completed submission for review | `{ submission_id, answers, ... }` | Yes (JWT) | student |
| PATCH | `/progress/submissions/:id/status` | Update submission status | `{ status }` | Yes (JWT) | All |
| GET | `/progress/submissions/users/:userId/stats` | Get submission statistics for a user | — | Yes (JWT) | All |
| POST | `/progress/submissions/:id/claim-rewards` | Claim XP/ML Coins rewards after manual grading | — | Yes (JWT) | student |
| POST | `/progress/submissions/:id/grade` | Grade a submission (teacher only) | `{ score, feedback, passed }` | Yes (JWT) | admin_teacher, super_admin |
| POST | `/progress/submissions/:id/feedback` | Add feedback to a submission (teacher only) | `{ feedback }` | Yes (JWT) | admin_teacher, super_admin |
| GET | `/progress/submissions/pending-review` | List all submissions awaiting teacher review (teacher only) | — | Yes (JWT) | admin_teacher, super_admin |

### 3.3 Auto-Save

Base path: `/api/v1/progress/exercises`

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| POST | `/progress/exercises/:exerciseId/autosave` | Save in-progress exercise state (called periodically during exercise) | `{ answers, currentStep?, timeElapsed?, ... }` | Yes (JWT) | student |
| GET | `/progress/exercises/:exerciseId/autosave` | Retrieve last auto-saved state for an exercise | — | Yes (JWT) | student |

### 3.4 Module Progress

Base path: `/api/v1/progress/`

Tracks overall module completion, exercise-level progress, and learning path status.

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/progress/users/:userId` | Get all module progress records for a user | — | Yes (JWT) | All |
| GET | `/progress/users/:userId/modules/:moduleId` | Get progress for a specific user/module combination | — | Yes (JWT) | All |
| GET | `/progress/users/:userId/modules/:moduleId/exercises` | Get exercise-level progress breakdown within a module | — | Yes (JWT) | All |
| POST | `/progress` | Create a new module progress record | `{ user_id, module_id, classroom_id? }` | Yes (JWT) | student |
| PATCH | `/progress/:id` | Update an existing progress record | Partial progress fields | Yes (JWT) | All |
| PATCH | `/progress/:id/percentage` | Update the completion percentage for a progress record | `{ completion_percentage }` | Yes (JWT) | All |
| POST | `/progress/:id/complete` | Mark a module as completed and trigger certificate generation | — | Yes (JWT) | student |
| GET | `/progress/modules/:moduleId/stats` | Get aggregate progress statistics across all students for a module | — | Yes (JWT) | All |
| GET | `/progress/users/:userId/summary` | Get a summary of all progress across modules for dashboard display | — | Yes (JWT) | All |
| GET | `/progress/users/:userId/in-progress` | List modules currently in progress for a user | — | Yes (JWT) | All |
| GET | `/progress/users/:userId/learning-path` | Get the recommended learning path based on current progress | — | Yes (JWT) | All |
| GET | `/progress/users/:userId/pending-activities?type=&priority=&limit=` | List pending activities (exercises not yet attempted) | — | Yes (JWT) | All |
| GET | `/progress/users/:userId/recent-activities?limit=&offset=` | Get recent activity feed for dashboard | — | Yes (JWT) | All |

### 3.5 Learning Sessions

Base path: `/api/v1/progress/sessions`

Tracks time-on-task and engagement per study session.

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| POST | `/progress/sessions` | Start a new learning session | `{ user_id, module_id?, exercise_id? }` | Yes (JWT) | student |
| GET | `/progress/sessions/users/:userId` | Get all learning sessions for a user | — | Yes (JWT) | All |
| GET | `/progress/sessions/:id` | Get a specific learning session by UUID | — | Yes (JWT) | All |
| POST | `/progress/sessions/:id/end` | End an active learning session | `{ endedAt?, totalTimeSeconds? }` | Yes (JWT) | student |
| PATCH | `/progress/sessions/:id/engagement` | Update engagement metrics during a session | `{ engagementScore, interactionCount, ... }` | Yes (JWT) | student |
| GET | `/progress/sessions/users/:userId/active` | Get the currently active session for a user | — | Yes (JWT) | All |
| GET | `/progress/sessions/users/:userId/stats?period=` | Get session statistics for a user over a time period | — | Yes (JWT) | All |
| GET | `/progress/sessions/users/:userId/range?startDate=&endDate=` | Get sessions within a date range | — | Yes (JWT) | All |

### 3.6 Certificates

Base path: `/api/v1/certificates/`

Digital certificates issued upon module completion. QR verification codes use format `CERT-XXXX-XXXX-XXXX`.

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| POST | `/certificates/generate` | Generate a module completion certificate | `{ user_id, module_id, tenant_id?, classroom_id? }` | Yes (JWT) | admin_teacher, super_admin |
| GET | `/certificates/verify/:code` | Verify certificate authenticity by verification code (PUBLIC — for QR scanning) | — | **No** | Public |
| GET | `/certificates/users/:userId?status=&limit=&offset=` | Get all certificates for a specific user, with optional status filter | — | Yes (JWT) | All |
| GET | `/certificates/:id` | Get a certificate by UUID with full details | — | Yes (JWT) | All |
| GET | `/certificates/:id/download` | Download the certificate as a PDF file | — | Yes (JWT) | All |
| POST | `/certificates/:id/revoke` | Revoke a certificate (teacher/admin only) | `{ reason }` | Yes (JWT) | admin_teacher, super_admin |
| GET | `/certificates/tenant/:tenantId/stats` | Get certificate statistics for an organization (teacher/admin only) | — | Yes (JWT) | admin_teacher, super_admin |

> **Note:** `GET /certificates/verify/:code` is the only fully public endpoint in the student portal. It is decorated with `@Public()` and does not require a JWT token. This allows QR code scanning from any device.

### 3.7 Scheduled Missions

Base path: `/api/v1/progress/scheduled-missions`

Classroom missions created by teachers and assigned to specific students.

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/progress/scheduled-missions/users/:userId` | Get all scheduled missions assigned to a user | — | Yes (JWT) | All |
| GET | `/progress/scheduled-missions/users/:userId/upcoming` | Get upcoming scheduled missions for a user | — | Yes (JWT) | All |
| GET | `/progress/scheduled-missions/active` | Get all currently active scheduled missions | — | Yes (JWT) | All |
| POST | `/progress/scheduled-missions` | Create a new scheduled mission (teacher only) | `{ classroom_id, mission_id, due_date, ... }` | Yes (JWT) | admin_teacher, super_admin |
| GET | `/progress/scheduled-missions/classrooms/:classroomId` | Get all scheduled missions for a classroom (teacher only) | — | Yes (JWT) | admin_teacher, super_admin |
| POST | `/progress/scheduled-missions/:id/start` | Mark a scheduled mission as started | — | Yes (JWT) | student |
| POST | `/progress/scheduled-missions/:id/complete` | Mark a scheduled mission as completed | — | Yes (JWT) | student |
| PATCH | `/progress/scheduled-missions/:id/progress` | Update progress on a scheduled mission | `{ progress_percentage, ... }` | Yes (JWT) | student |
| POST | `/progress/scheduled-missions/:id/claim-rewards` | Claim rewards upon scheduled mission completion | — | Yes (JWT) | student |

---

## 4. Gamification

### 4.1 User Stats and Ranks

Base path: `/api/v1/gamification/`

Maya rank progression: Ajaw (1) → Nacom (2) → Ah K'in (3) → Halach Uinic (4) → K'uk'ulkan (5).

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/gamification/users/:userId/stats` | Get complete gamification stats for a user (XP, rank, ML Coins, streak, etc.) | — | Yes (JWT) | All |
| GET | `/gamification/users/:userId/summary` | Get condensed stats summary for dashboard widgets | — | Yes (JWT) | All |
| GET | `/gamification/users/:userId/rank` | Get current Maya rank and XP progress to next rank | — | Yes (JWT) | All |
| PATCH | `/gamification/users/:userId/stats` | Update gamification stats (admin use only) | Partial stats fields | Yes (JWT) | super_admin |

### 4.2 Achievements

Base path: `/api/v1/gamification/`

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/gamification/achievements?includeSecret=` | List all available achievements; optionally include secret ones | — | Yes (JWT) | All |
| GET | `/gamification/achievements/:id` | Get details for a specific achievement by UUID | — | Yes (JWT) | All |
| GET | `/gamification/users/:userId/achievements` | Get all achievements earned by a user | — | Yes (JWT) | All |
| GET | `/gamification/users/:userId/achievements/summary` | Get achievement summary (counts by category, completion %) | — | Yes (JWT) | All |
| POST | `/gamification/users/:userId/achievements/:achievementId` | Award an achievement to a user | — | Yes (JWT) | admin_teacher, super_admin |
| GET | `/gamification/achievements/user/:userId/progress/:achievementId` | Get progress toward a specific achievement | — | Yes (JWT) | All |
| POST | `/gamification/achievements/user/:userId/unlock/:achievementId` | Unlock an achievement for a user (admin override) | — | Yes (JWT) | super_admin |
| POST | `/gamification/users/:userId/achievements/:achievementId/claim` | Claim rewards for an earned achievement | — | Yes (JWT) | student |
| PATCH | `/gamification/achievements/:id` | Update achievement details (admin only) | Partial achievement fields | Yes (JWT) | super_admin |

### 4.3 Missions

Base path: `/api/v1/gamification/missions/`

Three mission types are available: daily (3 auto-generated per day), weekly (2 auto-generated), and special (manually configured).

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/gamification/missions/daily` | Get today's daily missions for the authenticated user | — | Yes (JWT) | All |
| GET | `/gamification/missions/weekly` | Get this week's weekly missions | — | Yes (JWT) | All |
| GET | `/gamification/missions/special` | Get all available special missions | — | Yes (JWT) | All |
| GET | `/gamification/missions/stats/me` | Get mission completion statistics for the current user | — | Yes (JWT) | All |
| GET | `/gamification/missions/stats/:userId` | Get mission statistics for a specific user | — | Yes (JWT) | All |
| POST | `/gamification/missions/:id/start` | Start a mission (required before tracking progress) | — | Yes (JWT) | student |
| PATCH | `/gamification/missions/:id/progress` | Update progress on an active mission | `{ progress_value, metadata? }` | Yes (JWT) | student |
| POST | `/gamification/missions/:id/claim` | Claim mission completion rewards | — | Yes (JWT) | student |

### 4.4 Leaderboard

Base path: `/api/v1/gamification/`

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/gamification/leaderboard/global?limit=&offset=&timePeriod=` | Get global XP leaderboard; filter by all-time, weekly, or monthly | — | Yes (JWT) | All |
| GET | `/gamification/leaderboards/user-rank?type=&period=` | Get the authenticated user's rank position in a specific leaderboard | — | Yes (JWT) | All |
| GET | `/gamification/leaderboard/schools/:schoolId?limit=&offset=` | Get leaderboard scoped to a specific school | — | Yes (JWT) | All |
| GET | `/gamification/leaderboard/classrooms/:classroomId?limit=&offset=` | Get leaderboard scoped to a specific classroom | — | Yes (JWT) | All |
| GET | `/gamification/leaderboard/friends/:userId?limit=&offset=` | Get leaderboard showing only friends of a user | — | Yes (JWT) | All |

### 4.5 Shop (ML Coins Store)

Base path: `/api/v1/gamification/shop/`

Virtual store where students spend ML Coins on cosmetic items and power-ups.

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/gamification/shop/categories` | List all shop item categories | — | Yes (JWT) | All |
| GET | `/gamification/shop/items?category=&rarity=&available=` | List shop items with optional filters | — | Yes (JWT) | All |
| GET | `/gamification/shop/items/:id` | Get details for a specific shop item | — | Yes (JWT) | All |
| POST | `/gamification/shop/purchase` | Purchase an item from the shop using ML Coins | `{ user_id, item_id, quantity }` | Yes (JWT) | student |
| GET | `/gamification/shop/purchases/:userId` | Get purchase history for a user | — | Yes (JWT) | All |
| GET | `/gamification/shop/owned/:userId/:itemId` | Check if a user owns a specific item | — | Yes (JWT) | All |

### 4.6 ML Coins Economy

Base path: `/api/v1/gamification/`

ML Coins are the virtual currency. Rank multipliers range from 1.0x (Ajaw) to 2.0x (K'uk'ulkan). Anti-farming: rewards only granted on first correct attempt per exercise.

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/gamification/users/:userId/ml-coins` | Get current ML Coins balance for a user | — | Yes (JWT) | All |
| GET | `/gamification/users/:userId/ml-coins/transactions?limit=&offset=` | Get ML Coins transaction history | — | Yes (JWT) | All |
| POST | `/gamification/users/:userId/ml-coins/add` | Add ML Coins to a user's balance (admin only) | `{ amount, reason, metadata? }` | Yes (JWT) | super_admin |
| POST | `/gamification/users/:userId/ml-coins/spend` | Deduct ML Coins from a user's balance | `{ amount, reason, item_id? }` | Yes (JWT) | student |
| GET | `/gamification/users/:userId/ml-coins/multiplier` | Get the current rank-based ML Coins multiplier for a user | — | Yes (JWT) | All |
| GET | `/gamification/ml-coins/multiplier-table` | Get the full rank multiplier table (all ranks and their multipliers) | — | Yes (JWT) | All |
| GET | `/gamification/users/:userId/ml-coins/calculate?baseAmount=` | Calculate final ML Coins amount after applying rank multiplier | — | Yes (JWT) | All |
| POST | `/gamification/users/:userId/ml-coins/add-with-multiplier` | Add ML Coins applying the user's current rank multiplier | `{ baseAmount, reason, metadata? }` | Yes (JWT) | student |

### 4.7 Comodines (Power-Ups)

Base path: `/api/v1/gamification/comodines/`

Three comodin types available:
- `pistas` — Extra hints (15 ML Coins)
- `vision_lectora` — Enhanced reading view (25 ML Coins)
- `segunda_oportunidad` — Second attempt on failed exercise (40 ML Coins)

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/gamification/comodines` | Get the full comodines catalog with prices and descriptions | — | Yes (JWT) | All |
| POST | `/gamification/comodines/purchase` | Purchase comodines using ML Coins | `{ user_id, comodin_type, quantity }` | Yes (JWT) | student |
| POST | `/gamification/comodines/use` | Activate a comodin during an exercise | `{ user_id, comodin_type, quantity: 1, exercise_id?, context? }` | Yes (JWT) | student |
| GET | `/gamification/comodines/users/:userId/inventory` | Get comodines inventory (quantities available) for a user | — | Yes (JWT) | All |
| GET | `/gamification/comodines/users/:userId/history?limit=` | Get comodin usage history for a user | — | Yes (JWT) | All |
| GET | `/gamification/comodines/users/:userId/stats` | Get comodin statistics (total purchased, used, remaining) | — | Yes (JWT) | All |

### 4.8 Inventory (Cosmetic Items)

Base path: `/api/v1/gamification/inventory/`

Manages equipped cosmetic items (avatars, frames, badges, themes).

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/gamification/inventory/equipped/batch?userIds=` | Get equipped items for multiple users in a single request (for leaderboard rendering) | — | Yes (JWT) | All |
| GET | `/gamification/inventory/equipped` | Get currently equipped items for the authenticated user | — | Yes (JWT) | student |
| POST | `/gamification/inventory/equip` | Equip a purchased cosmetic item | `{ item_id }` | Yes (JWT) | student |
| POST | `/gamification/inventory/unequip` | Unequip an equipped cosmetic item | `{ item_id }` | Yes (JWT) | student |

---

## 5. Social

> **Status:** Social endpoints are not yet implemented for the student portal.
>
> The `social_features` schema exists in the database (guilds, guild_missions, teacher_reports) but the corresponding frontend student-facing social UI has not been built. When implemented, this section will cover: friend requests, guild membership, team challenges, and social leaderboards.

---

## 6. Profile

Base path: `/api/v1/profile/`

Student profile management (display name, bio, grade level, avatar upload).

| Method | Endpoint | Description | Request Body (summary) | Auth Required | Roles |
|--------|----------|-------------|------------------------|---------------|-------|
| GET | `/profile/:userId` | Get a user's public profile by UUID | — | Yes (JWT) | All |
| PATCH | `/profile/:userId` | Update a user's profile fields | `{ display_name?, bio?, phone?, email?, grade_level?, student_id?, ... }` | Yes (JWT) | All |
| POST | `/profile/:userId/avatar` | Upload a new profile avatar image (max 5MB, JPEG/PNG/GIF) | `file` (multipart field: 'avatar') | Yes (JWT) | All |

---

## Appendix: HTTP Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | OK | Successful GET, PATCH, or POST (non-creation) |
| 201 | Created | Successful POST (new resource created) |
| 400 | Bad Request | Validation error, invalid body format, or business rule violation |
| 401 | Unauthorized | Missing, expired, or invalid JWT token |
| 403 | Forbidden | Authenticated but insufficient role/permissions |
| 404 | Not Found | Resource with given ID does not exist |
| 409 | Conflict | Duplicate resource (e.g., certificate already exists for module) |
| 422 | Unprocessable Entity | Semantic validation failure (e.g., module not yet completed) |
| 500 | Internal Server Error | Unexpected server-side error |

## Appendix: Common Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Max results per page (typically 1–100, default 10) |
| `offset` | number | Number of results to skip for pagination (default 0) |
| `status` | string | Filter by status enum value |
| `period` | string | Time period filter: `all-time`, `weekly`, `monthly` |
| `timePeriod` | string | Alias for `period` in leaderboard endpoints |

## Appendix: Authentication Header

All protected endpoints require:

```
Authorization: Bearer <jwt_access_token>
```

Tokens expire per `expiresIn` value returned at login (typically `7d`). Use `POST /auth/refresh` with the refresh token to obtain a new access token without re-login.

## Appendix: Role Reference

| Role | Description |
|------|-------------|
| `student` | Default student role — read + submit own data |
| `admin_teacher` | Teacher with admin rights — can grade, manage classrooms, view all student data |
| `super_admin` | Full system access — can create/delete any resource |

> Rows marked "All" in the Roles column are accessible to any authenticated user regardless of role, subject to RLS filtering at the database level (students only see their own classroom data).
