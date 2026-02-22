# Jest OOM Issue Investigation - Shard 3/5

## Context
The backend test suite has 833+ tests across 65 spec files. When running with coverage, shard 3 of 5 (files 27-39 alphabetically) experiences an Out of Memory (OOM) error, hitting the V8 heap limit. `maxWorkers` is set to 1, and tests pass individually. The `package.json` sets `NODE_OPTIONS=--max-old-space-size=4096`.

## Configuration Review

### `apps/backend/jest.config.js`
- `maxWorkers: 1`: Tests run serially, which is good for memory.
- `workerIdleMemoryLimit: '512MB'`: Set, but likely overridden by `NODE_OPTIONS` for a single worker.
- `detectOpenHandles: true`, `forceExit: true`, `cache: false`: Enabled, generally positive for stability and memory leak detection.
- `testMatch`: Includes `**/__tests__/**/*.test.ts`, `**/__tests__/**/*.spec.ts`, and `**/*.spec.ts`.
- `setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']`: A global setup file is used.

### `apps/backend/package.json`
- `test`, `test:watch`, `test:cov` scripts all use `cross-env NODE_OPTIONS=--max-old-space-size=4096 jest`. This sets the Node.js V8 heap limit to 4GB. The OOM occurs specifically with the `--coverage` flag.

## Spec Files in Shard 3 (27-39 out of 65 total files)

The total number of unique test files identified is 65. Dividing this into 5 shards means approximately 13 files per shard. Shard 3 corresponds to files 27 through 39 (alphabetically sorted).

Here is the list of files in Shard 3:

1.  `apps/backend/src/modules/auth/guards/__tests__/roles.guard.spec.ts` (234 lines)
2.  `apps/backend/src/modules/auth/services/__tests__/auth.service.spec.ts` (615 lines)
3.  `apps/backend/src/modules/auth/services/__tests__/password-recovery.service.spec.ts` (237 lines)
4.  `apps/backend/src/modules/content/services/__tests__/cattest.spec.ts` (570 lines)
5.  `apps/backend/src/modules/content/services/__tests__/content-authors.service.spec.ts` (533 lines)
6.  `apps/backend/src/modules/content/services/__tests__/content-categories.service.spec.ts` (570 lines)
7.  `apps/backend/src/modules/content/services/__tests__/minimal-oom-test.spec.ts` (17 lines)
8.  `apps/backend/src/modules/educational/__tests__/exercises-submit.controller.spec.ts` (282 lines)
9.  `apps/backend/src/modules/gamification/__tests__/leaderboard-friends.controller.spec.ts` (221 lines)
10. `apps/backend/src/modules/gamification/controllers/ranks.controller.spec.ts` (425 lines)
11. `apps/backend/src/modules/gamification/services/__tests__/achievements.service.spec.ts` (1058 lines)
12. `apps/backend/src/modules/gamification/services/__tests__/leaderboard.service.spec.ts` (634 lines)
13. `apps/backend/src/modules/gamification/services/__tests__/missions.service.spec.ts` (562 lines)

## Likely Memory Hogs & Patterns

1.  **Duplicate Test File:** The files `apps/backend/src/modules/content/services/__tests__/cattest.spec.ts` and `apps/backend/src/modules/content/services/__tests__/content-categories.service.spec.ts` appear to be identical (570 lines each, with similar initial content). Running these same tests twice in the same shard would double their memory footprint. This is a high-priority item for investigation.
2.  **Large Test Files:** `apps/backend/src/modules/gamification/services/__tests__/achievements.service.spec.ts` (1058 lines), `apps/backend/src/modules/gamification/services/__tests__/leaderboard.service.spec.ts` (634 lines), `apps/backend/src/modules/auth/services/__tests__/auth.service.spec.ts` (615 lines), and `apps/backend/src/modules/content/services/__tests__/content-authors.service.spec.ts` (533 lines) are significantly large. Even with mocked dependencies, a high number of tests within a single file can cause memory accumulation, especially with coverage enabled.
3.  **Extensive Mocks and Fixtures:** The presence of `createMockRepository` and `TestDataFactory` in many files suggests a pattern of generating mock data and repositories. If these mocks are complex or are not consistently cleared/reset between tests (e.g., in `afterEach` hooks), memory can build up.
4.  **Coverage Overhead:** The problem explicitly occurs "when running with coverage." Code instrumentation for coverage tracking significantly increases memory consumption and CPU usage.

## Recommended Fixes

1.  **Remove Duplicate Test File:** Investigate and remove `apps/backend/src/modules/content/services/__tests__/cattest.spec.ts` if it is indeed a duplicate of `content-categories.service.spec.ts`. This is the most straightforward potential fix for reducing memory load in this shard.
2.  **Optimize Test Cleanup:**
    *   Thoroughly review `afterEach` and `afterAll` hooks in the identified large test files (especially `achievements.service.spec.ts`, `leaderboard.service.spec.ts`, `auth.service.spec.ts`, `content-authors.service.spec.ts`, and `content-categories.service.spec.ts`). Ensure all mocks, test data, and any other resources (e.g., database connections if not fully mocked, though `typeorm` is mocked) are properly reset or garbage collected.
    *   Examine `src/__tests__/setup.ts` for any global setups that might be creating persistent objects without adequate teardown.
3.  **Split Large Test Files:** For the particularly large files (e.g., `achievements.service.spec.ts`), consider refactoring them into multiple smaller, more focused test files. This would reduce the peak memory usage for any single file's execution, potentially alleviating the OOM.
4.  **Increase Node.js Heap Size (if necessary after other optimizations):** While already set to 4GB, if other optimizations don't resolve the issue, increasing `NODE_OPTIONS=--max-old-space-size` further (e.g., to 6GB or 8GB) could be a temporary workaround or a necessary step if the application's test dependencies are inherently memory-intensive with coverage. However, it's preferable to optimize code first.
5.  **Targeted Coverage:** If possible, investigate if certain parts of the code under test in this shard are causing excessive memory usage during coverage instrumentation. This might involve profiling memory usage with coverage enabled.
