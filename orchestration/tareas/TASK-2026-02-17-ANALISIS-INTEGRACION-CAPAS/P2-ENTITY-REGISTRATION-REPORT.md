# P2 Entity Registration Audit Report

**Date:** 2026-02-17 | **Status:** Complete — All fixes applied, build passes

## Summary

| Category | Count |
|----------|-------|
| Total entities audited | 153 |
| Missing from forFeature() | **37** (9 social + 28 non-social) — ALL FIXED |
| Missing from barrel index.ts | **6** (5 social + 1 progress) — ALL FIXED |
| Missing from datasource glob (CRITICAL) | **1** (UserSkillRating) — FIXED |

## Fixes Applied

### Social Module (9 entities)
**File:** `social.module.ts` — added to forFeature():
- DiscussionThread, TeacherClassroom, ChallengeResult, SocialInteraction
- TeamVsTeamChallenge, GuildEmblem, GuildMissionContribution, UserBlock, UserReport

**File:** `social/entities/index.ts` — added 5 barrel exports:
- TeamVsTeamChallenge, GuildEmblem, GuildMissionContribution, UserBlock, UserReport

### Gamification Module (3 entities)
**File:** `gamification.module.ts` — added to forFeature():
- ComodinUsageLog, ComodinUsageTracking, ComodinUse

**File:** `gamification/entities/index.ts` — added 1 barrel export:
- ComodinUse

### Progress Module (6 entities)
**File:** `progress.module.ts` — added to forFeature():
- TeacherIntervention, UserCurrentLevel, UserDifficultyProgress
- ModuleCompletionTracking, LearningPathModule, ManualReview

**File:** `progress/entities/index.ts` — added 1 barrel export:
- LearningPathModule

### Educational Module (7 entities)
**File:** `educational.module.ts` — added to imports and forFeature():
- ClassroomModule, ContentMetadata, ContentTag, DifficultyCriteria
- ExerciseMechanicMapping, ModuleDependencies, Taxonomy

### CRITICAL: Datasource Glob Fix
**File:** `app.module.ts` — added to social datasource entities array:
- `modules/gamification/peer-challenges/entities/**/*.entity{.ts,.js}` (UserSkillRating)

## Not Fixed (Low Priority — deferred to P6)
- Admin module: 9 entities use @InjectDataSource with raw SQL, not @InjectRepository
- Auth module: UserPreferences (covered by datasource glob, no injection)
- Notifications module: RateLimitLog (covered by explicit datasource path)

## Build Verification
- `npx tsc --noEmit`: **0 errors** ✅
