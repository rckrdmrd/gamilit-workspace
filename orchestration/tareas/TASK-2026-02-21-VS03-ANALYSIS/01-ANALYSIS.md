# Refactoring Analysis: `exercise-submission.service.ts`

## 1. Overview of Current Structure

The `ExerciseSubmissionService` in `apps/backend/src/modules/progress/services/exercise-submission.service.ts` is a monolithic service responsible for a wide array of functionalities related to exercise submissions, grading, gamification, and notifications. At approximately 1963 Lines Of Code (LOC), it exhibits high coupling and a violation of the Single Responsibility Principle, making it difficult to maintain, test, and extend.

### Identified Public Methods and Responsibilities:

| Method                                      | Responsibility                                                                                                                                                                                                                                                                                                  | Approximate LOC |
| :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------- |
| `getProfileIdFromAuthUser`                  | Validates `profile.id` existence.                                                                                                                                                                                                                                                                               | 10              |
| `create`                                    | Creates a new `ExerciseSubmission` record.                                                                                                                                                                                                                                                                      | 15              |
| `findByUserId`                              | Retrieves all submissions for a given user.                                                                                                                                                                                                                                                                     | 5               |
| `findByExerciseId`                          | Retrieves all submissions for a given exercise.                                                                                                                                                                                                                                                                 | 5               |
| `findByUserAndExercise`                     | Retrieves a specific submission by user and exercise.                                                                                                                                                                                                                                                           | 7               |
| `submitExercise`                            | **Main workflow orchestrator**: Handles submission creation/update, exercise validation (type-specific), anti-redundancy checks, teacher notification, progress updates on submission, and triggers auto-grading/reward claiming for auto-gradable exercises. **Highly Complex**.                             | 120             |
| `gradeSubmission`                           | Grades a submission (manual or auto-grading via `autoGrade`). Includes manual score validation, status updates, achievement detection, and reward claiming post-grading. **Complex**.                                                                                                                             | 110             |
| `provideFeedback`                           | Adds manual feedback to a submission and updates its status to `reviewed`.                                                                                                                                                                                                                                      | 10              |
| `updateStatus`                              | Updates the status of a submission, including state transition validation.                                                                                                                                                                                                                                      | 30              |
| `getSubmissionStats`                        | Calculates various statistics for a user's submissions (completion rate, average score, perfect scores, time spent).                                                                                                                                                                                            | 40              |
| `findPendingReview`                         | Retrieves submissions awaiting manual review.                                                                                                                                                                                                                                                                   | 5               |
| `autoSaveProgress`                          | Saves partial exercise answers as a `draft` submission, creating or updating an existing draft.                                                                                                                                                                                                                   | 50              |
| `getAutoSavedProgress`                      | Retrieves the most recent `draft` submission for a user and exercise.                                                                                                                                                                                                                                           | 10              |
| `convertDraftToFinalSubmission`             | Transitions a `draft` submission to a final `submitted` status and triggers the main submission processing (`submitExercise` logic).                                                                                                                                                                        | 15              |

### Identified Private Methods and Responsibilities:

| Method                                      | Responsibility                                                                                                                    | Approximate LOC |
| :------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------- | :-------------- |
| `getProfileId`                              | Helper to validate `profile.id`.                                                                                            | 10              |
| `autoGrade`                                 | **Core Auto-Grading Logic**: Dispatches to SQL `validate_and_audit` or custom TypeScript validation (`validateRuedaInferencias`) based on exercise type. Handles specific anti-redundancy for `completar_espacios`. **Highly Complex**. | 150             |
| `validateRuedaInferencias`                  | Custom validation for "Rueda de Inferencias" exercise, including category-specific criteria and feedback generation. **Complex**.     | 130             |
| `claimRewards`                              | **Reward Distribution**: Calculates and assigns XP and ML Coins, handles rank promotions, integrates with various gamification services, and emits WebSocket updates. **Highly Complex**. | 170             |
| `getRankXpMultiplier`                       | Retrieves XP multiplier from the database based on user's current rank.                                                     | 20              |
| `getRankConfigFromDB`                       | Fetches full rank configuration (multiplier, bonus coins) from the database.                                                | 20              |
| `updateModuleProgressAfterCompletion`       | Updates module progress (`completed_exercises`, `total_xp_earned`, `total_ml_coins_earned`) after an exercise is *correctly graded*. **Complex**. | 100             |
| `updateMissionsProgressAfterCompletion`     | Updates user mission progress for `complete_exercises` and `earn_xp` objectives. **Complex**.                               | 70              |
| `notifyTeacherOfSubmission`                 | Notifies teachers about new submissions requiring manual review via in-app notifications and email. Includes finding the assigned teacher and checking preferences. **Complex**. | 110             |
| `getExerciseTypeDisplayName`                | Helper to return a human-readable name for exercise types.                                                                  | 15              |
| `updateModuleProgressOnSubmission`          | Updates module progress (`submitted_exercises`, `submitted_progress_percentage`) immediately when an exercise is *submitted* (for manual grading workflows). **Complex**. | 100             |
| `countWords`                                | Helper to count words in a string, used for content validation.                                                             | 5               |

### Constructor Dependencies:

The service injects a total of **12** other services/repositories, plus a logger:

*   `submissionRepo: Repository<ExerciseSubmission>`
*   `exerciseRepo: Repository<Exercise>`
*   `profileRepo: Repository<Profile>`
*   `entityManager: EntityManager`
*   `userStatsService: UserStatsService`
*   `mlCoinsService: MLCoinsService`
*   `missionsService: MissionsService`
*   `achievementsService: AchievementsService`
*   `notificationService: NotificationService`
*   `mailService: MailService`
*   `webSocketService: WebSocketService`
*   `Logger` (NestJS built-in)

This high number of dependencies is a clear indicator of a God object anti-pattern and excessive responsibilities.

### Raw SQL vs. TypeORM Usage:

The service exhibits a mixed approach to database interaction:

*   **Raw SQL Queries (`this.entityManager.query`) are used in:**
    *   `autoGrade` (calling `educational_content.validate_and_audit` PostgreSQL function).
    *   `claimRewards` (direct query to `gamification_system.user_stats` to bypass TypeORM cache for rank detection).
    *   `getRankXpMultiplier` (querying `gamification_system.maya_ranks`).
    *   `getRankConfigFromDB` (querying `gamification_system.maya_ranks`).
    *   `updateModuleProgressAfterCompletion` (complex UPSERT into `progress_tracking.module_progress` and `COUNT(DISTINCT...)` for completed exercises).
    *   `updateModuleProgressOnSubmission` (complex `COUNT(DISTINCT...)` for submitted exercises and UPSERT into `progress_tracking.module_progress`).
    *   `notifyTeacherOfSubmission` (complex `SELECT DISTINCT ON` query to find the assigned teacher).
*   **TypeORM Repository methods (`this.submissionRepo`, `this.exerciseRepo`, `this.profileRepo`) are used for:**
    *   Basic CRUD operations (`create`, `find`, `findOne`, `count`, `save`).
    *   The primary entity `ExerciseSubmission` and related `Exercise`, `Profile` entities.

The use of raw SQL for complex logic, especially for gamification and progress tracking, suggests that TypeORM's ORM capabilities might be insufficient for these specific, performance-sensitive or trigger-dependent operations, or it reflects a design choice to delegate complex logic to the database.

### Methods Requiring Transaction Wrappers:

Several methods perform multiple dependent database operations or orchestrate calls to other services that interact with the database. These critical workflows are not explicitly wrapped in a single database transaction, which can lead to data inconsistencies if an error occurs mid-operation.

*   `submitExercise`: This is the most critical. It involves:
    1.  Fetching `Profile` and `Exercise`.
    2.  Creating/updating `ExerciseSubmission`.
    3.  Calling `updateModuleProgressOnSubmission` (which does an UPSERT).
    4.  Calling `notifyTeacherOfSubmission` (which creates a Notification).
    5.  Potentially calling `gradeSubmission` and `claimRewards`.
    *   **Risk**: If any of these sub-operations fail after some have succeeded, the system state can become inconsistent (e.g., submission recorded, but module progress not updated, or rewards partially claimed).
*   `gradeSubmission`:
    1.  Fetching `ExerciseSubmission`.
    2.  Updating `ExerciseSubmission`.
    3.  Potentially calling `claimRewards`.
    4.  Calling `achievementsService.detectAndGrantEarned`.
    *   **Risk**: Similar to `submitExercise`, partial updates or reward claiming can occur without atomicity.
*   `claimRewards`: This is another highly critical method:
    1.  Fetching `ExerciseSubmission` and `Exercise`.
    2.  Updating `UserStats` (`addXp`).
    3.  Updating `MLCoins` (`addCoins`).
    4.  Querying `gamification_system.user_stats` (raw SQL).
    5.  Calling `mlCoinsService.addCoins` (for rank bonus).
    6.  Calling `notificationService.create` (for rank up).
    7.  Calling `updateModuleProgressAfterCompletion` (UPSERT).
    8.  Calling `updateMissionsProgressAfterCompletion` (multiple `missionsService.updateProgress` calls).
    9.  Updating `ExerciseSubmission` with earned rewards.
    *   **Risk**: This method orchestrates many state changes across different domains (user stats, coins, module progress, missions, notifications). A failure at any point will leave the system in an inconsistent state.

These methods should explicitly use TypeORM's `EntityManager.transaction` or `@TransactionManager()` decorators to ensure all related operations are atomic.

## 2. Proposed Refactoring into Smaller Services

The `ExerciseSubmissionService` can be decomposed into several specialized services, each adhering to the Single Responsibility Principle. This will reduce coupling, improve testability, and make the codebase easier to understand and manage.

Proposed split into 5 services:

1.  **`ExerciseSubmissionCrudService`**:
    *   **Responsibility**: Core CRUD operations for `ExerciseSubmission` entities, managing submission lifecycle states (draft, submitted, graded, reviewed).
    *   **Methods**:
        *   `create`, `findByUserId`, `findByExerciseId`, `findByUserAndExercise`, `findPendingReview`.
        *   `updateStatus`, `autoSaveProgress`, `getAutoSavedProgress`, `convertDraftToFinalSubmission`.
    *   **Dependencies**: `Repository<ExerciseSubmission>`, `Repository<Profile>`.
    *   **Rationale**: Isolates basic data persistence and retrieval, and the draft/finalization workflow.

2.  **`ExerciseValidationService`**:
    *   **Responsibility**: Centralizes all exercise answer validation logic, including type-specific rules and anti-redundancy checks.
    *   **Methods**:
        *   `validateSubmission(exercise: Exercise, answerData: Record<string, unknown>, fragmentStates?: FragmentState[], ...)` (incorporates logic from `autoGrade` and `validateRuedaInferencias`).
        *   `countWords`.
        *   Potentially, `getExerciseTypeDisplayName`.
    *   **Dependencies**: `Repository<Exercise>`, `EntityManager` (for SQL `validate_and_audit`).
    *   **Rationale**: Separates validation rules from the submission processing flow. This service can be pure and easily extended with new validation types.

3.  **`ExerciseGradingWorkflowService`**:
    *   **Responsibility**: Orchestrates the grading process (manual or auto), applying validation results and updating the submission record. It delegates to `ExerciseValidationService` for actual validation.
    *   **Methods**:
        *   `gradeSubmission(submissionId: string, manualGrade?: ..., userId: string, exerciseId: string, answerData: Record<string, unknown>, attemptNumber: number)`. (This method will coordinate calls to `ExerciseValidationService` for auto-grading, and update the submission record.)
    *   **Dependencies**: `ExerciseSubmissionCrudService`, `ExerciseValidationService`, `AchievementService` (if achievements are tied directly to grading, otherwise move to rewards).
    *   **Rationale**: Focuses solely on the grading *process* and result application, clearly distinguishing it from validation and reward distribution.

4.  **`SubmissionRewardService`**:
    *   **Responsibility**: Manages the distribution of XP and ML Coins, handling rank promotions, mission progress updates, and related notifications/WebSocket events after a submission is successfully graded.
    *   **Methods**:
        *   `claimRewards(submissionId: string, userId: string, exerciseId: string)`.
        *   `getRankXpMultiplier`, `getRankConfigFromDB`.
    *   **Dependencies**: `ExerciseSubmissionCrudService`, `UserStatsService`, `MLCoinsService`, `MissionsService`, `AchievementsService`, `NotificationService`, `WebSocketService`, `EntityManager`.
    *   **Rationale**: Centralizes all gamification and reward-related logic, which is currently heavily intertwined with grading.

5.  **`SubmissionNotificationService`**:
    *   **Responsibility**: Handles all external notifications related to submissions, specifically teacher notifications for manual review.
    *   **Methods**:
        *   `notifyTeacherOfSubmission(submission: ExerciseSubmission, exercise: Exercise, studentProfileId: string)`.
    *   **Dependencies**: `Repository<Profile>`, `EntityManager`, `NotificationService`, `MailService`.
    *   **Rationale**: Extracts communication concerns, making notification logic reusable and testable independently.

### Proposed New `ExerciseSubmissionService` (Orchestrator):

The original `ExerciseSubmissionService` would be reduced to an orchestrator, coordinating calls between these new, specialized services.

*   **Responsibility**: Top-level workflow for `submitExercise`. It would call `ExerciseValidationService` for initial checks, `ExerciseSubmissionCrudService` for persistence, `SubmissionNotificationService` for teacher alerts, and then `ExerciseGradingWorkflowService` and `SubmissionRewardService` as appropriate.
*   **Methods**:
    *   `submitExercise(userId: string, exerciseId: string, answers: Record<string, unknown>)`.
*   **Dependencies**: `ExerciseSubmissionCrudService`, `ExerciseValidationService`, `ExerciseGradingWorkflowService`, `SubmissionRewardService`, `SubmissionNotificationService`, `Repository<Exercise>`.
*   **Rationale**: This service now primarily manages the overall flow, delegating specific tasks to smaller, focused services. It becomes much thinner and easier to understand.

## 3. Risk Assessment for Each Proposed Split

### 1. `ExerciseSubmissionCrudService`

*   **Benefit**: High cohesion, easy to test CRUD operations. Reduces direct repository access from other services.
*   **Risk**: Low. This is a straightforward extraction of existing repository interactions.
*   **Mitigation**: Ensure all current CRUD operations and draft logic are correctly migrated.

### 2. `ExerciseValidationService`

*   **Benefit**: Isolates complex validation logic, making it more manageable, testable, and extensible for new exercise types.
*   **Risk**: Medium. Extracting the `autoGrade` logic, especially the conditional dispatching and specific anti-redundancy rules, requires careful migration to ensure all edge cases are covered. The interaction with PostgreSQL functions needs to be handled.
*   **Mitigation**: Thorough unit and integration tests specifically for each validation type. Clear interfaces for validation results.

### 3. `ExerciseGradingWorkflowService`

*   **Benefit**: Clearly separates the act of grading from the business rules of validation and the side effects of rewards.
*   **Risk**: Medium. This service will orchestrate calls to `ExerciseValidationService` and potentially `SubmissionRewardService`. Correctly handling the flow and status updates is crucial.
*   **Mitigation**: Focus on defining clear boundaries and inputs/outputs between `ExerciseValidationService` and `ExerciseGradingWorkflowService`. Strong test coverage for the workflow logic.

### 4. `SubmissionRewardService`

*   **Benefit**: Extracts all gamification-related logic, which is currently highly entangled. Improves maintainability of reward calculations, rank promotions, and associated notifications.
*   **Risk**: High. This service is currently one of the most complex, involving multiple external service calls, raw SQL queries, and critical state updates (XP, ML Coins, missions, notifications, WebSockets). Atomicity (transactions) is paramount.
*   **Mitigation**: Implement robust transaction management (e.g., TypeORM transactions) within this service for `claimRewards`. Extensive integration tests to ensure all side effects (XP, coins, rank, missions, notifications) are correct and atomic. Careful management of `EntityManager` for raw SQL calls within transactions.

### 5. `SubmissionNotificationService`

*   **Benefit**: Decouples notification concerns, allowing for independent changes to notification methods (email, in-app, push).
*   **Risk**: Low. This is a relatively self-contained extraction of existing notification logic.
*   **Mitigation**: Ensure all parameters for notifications (teacher, student, exercise details) are correctly passed to the new service.

### Overall Orchestrator (`ExerciseSubmissionService` - *New*):

*   **Benefit**: The original service becomes much smaller and its primary responsibility becomes coordinating calls to its specialized dependencies. Improves readability and reduces cognitive load.
*   **Risk**: Medium. While simpler, orchestrators can still become problematic if their internal logic for sequencing and error handling is not well-defined.
*   **Mitigation**: Keep the orchestrator logic minimal, primarily focusing on `try...catch` blocks and sequential calls. Ensure that transactions are correctly initiated and committed/rolled back at the appropriate level within the specialized services.

## 4. Migration Strategy (Extract → Delegate → Deprecate)

The refactoring should follow an iterative approach to minimize disruption and risk.

**Phase 1: Preparation & `ExerciseSubmissionCrudService` Extraction**

1.  **Create `ExerciseSubmissionCrudService`**:
    *   Create a new file `exercise-submission-crud.service.ts`.
    *   Move `create`, `findByUserId`, `findByExerciseId`, `findByUserAndExercise`, `findPendingReview`, `autoSaveProgress`, `getAutoSavedProgress`, `convertDraftToFinalSubmission`, `updateStatus`, `provideFeedback` (since it's a simple update) and their dependencies (`submissionRepo`, `profileRepo`) to this new service.
    *   Adjust imports and constructor in the new service.
    *   Modify `ExerciseSubmissionService` to inject and delegate to `ExerciseSubmissionCrudService` for these methods.
    *   **Tests**: Ensure existing tests for these methods pass, or create new ones for the `CrudService`.

**Phase 2: `ExerciseValidationService` Extraction**

1.  **Create `ExerciseValidationService`**:
    *   Create a new file `exercise-validation.service.ts`.
    *   Move `validateRuedaInferencias`, `countWords`.
    *   Extract the core validation logic from `autoGrade` into a new public method like `validateExerciseAnswers` in `ExerciseValidationService`. This method should take `exercise`, `answerData`, `userId`, `attemptNumber`, `clientMetadata` as input and return the detailed validation result (score, isCorrect, feedback, details, auditId).
    *   Adjust dependencies (`exerciseRepo`, `entityManager`) in the new service.
    *   Modify `ExerciseSubmissionService` (and `autoGrade` within it) to inject and delegate to `ExerciseValidationService`.
    *   **Tests**: Create comprehensive unit tests for `ExerciseValidationService`, covering all exercise types and edge cases (e.g., "Rueda de Inferencias" specific logic, "completar_espacios" anti-redundancy).

**Phase 3: `ExerciseGradingWorkflowService` Extraction**

1.  **Create `ExerciseGradingWorkflowService`**:
    *   Create a new file `exercise-grading-workflow.service.ts`.
    *   Move the `gradeSubmission` method.
    *   This service will now depend on `ExerciseSubmissionCrudService` (to fetch/update submissions) and `ExerciseValidationService` (to perform validation/auto-grading). It will also depend on `AchievementService`.
    *   The `gradeSubmission` method will coordinate these calls.
    *   Modify `ExerciseSubmissionService` to inject and delegate to `ExerciseGradingWorkflowService` for grading.
    *   **Tests**: Create integration tests for the `gradeSubmission` workflow to ensure correct interaction between services.

**Phase 4: `SubmissionRewardService` Extraction (Critical Phase)**

1.  **Create `SubmissionRewardService`**:
    *   Create a new file `submission-reward.service.ts`.
    *   Move `claimRewards`, `getRankXpMultiplier`, `getRankConfigFromDB`.
    *   This service will depend on `ExerciseSubmissionCrudService` (to update submission with rewards), `UserStatsService`, `MLCoinsService`, `MissionsService`, `AchievementsService`, `NotificationService`, `WebSocketService`, and `EntityManager` (for raw SQL).
    *   **Implement Transactions**: Crucially, wrap the `claimRewards` logic within a TypeORM transaction (`this.entityManager.transaction`).
    *   Modify `ExerciseSubmissionService` and `ExerciseGradingWorkflowService` to inject and delegate to `SubmissionRewardService`.
    *   **Tests**: Develop extensive integration tests for `claimRewards`, focusing on atomicity, correct XP/coin calculation, rank promotions, mission updates, and notifications within the transaction boundary.

**Phase 5: `SubmissionNotificationService` and `ProgressTrackingService` Extraction**

1.  **Create `SubmissionNotificationService`**:
    *   Create a new file `submission-notification.service.ts`.
    *   Move `notifyTeacherOfSubmission`, `getExerciseTypeDisplayName`.
    *   This service will depend on `profileRepo`, `entityManager`, `notificationService`, `mailService`.
    *   Modify `ExerciseSubmissionService` to inject and delegate to `SubmissionNotificationService`.
    *   **Tests**: Unit tests for notification logic.

2.  **Create `ProgressTrackingService`**:
    *   Create a new file `progress-tracking.service.ts`.
    *   Move `updateModuleProgressAfterCompletion`, `updateModuleProgressOnSubmission`, `getSubmissionStats`.
    *   This service will depend on `exerciseRepo`, `submissionRepo`, `entityManager`.
    *   Modify `ExerciseSubmissionService` to inject and delegate to `ProgressTrackingService`.
    *   **Tests**: Unit/integration tests for module progress updates and stats.

**Phase 6: Final Refinement and Deprecation**

1.  **Refine `ExerciseSubmissionService`**: Once all responsibilities are delegated, `ExerciseSubmissionService` should be significantly smaller, primarily acting as an orchestrator for the `submitExercise` method. Its constructor should only inject the new specialized services and `exerciseRepo` (to fetch exercise details for initial checks).
2.  **Code Review & Cleanup**: Perform a thorough code review to ensure all logic has been correctly moved, dependencies are appropriately managed, and no circular dependencies are introduced. Remove any dead code from the original service.
3.  **Documentation**: Update service documentation (`_MAP.md` files) to reflect the new architecture.

This phased approach allows for incremental changes, with each phase focusing on a distinct area of responsibility, making the refactoring process more manageable and less error-prone. Each new service should have its own module in the `modules/progress/` directory (e.g., `exercise-submission-crud/exercise-submission-crud.module.ts`).
