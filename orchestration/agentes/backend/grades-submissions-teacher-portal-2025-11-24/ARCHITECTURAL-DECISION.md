# ARCHITECTURAL DECISION RECORD - Grades Implementation

**ADR-XXX:** Grades as View of Submissions
**Status:** ✅ ACCEPTED
**Date:** 2025-11-24
**Context:** GAP-TEACHER-003 - Grades endpoints implementation
**Deciders:** Backend-Agent, Architecture-Analyst

---

## 🎯 DECISION

**Implementar Grades como VISTA/AGREGACIÓN de Submissions, NO como entidad separada**

**Estrategia seleccionada:** Opción B - Grades = Submissions con score

---

## 📋 CONTEXT

### Problem Statement

Frontend teacher portal necesita endpoints para "grades" (calificaciones):
- `GET /api/v1/teacher/grades` - Listar calificaciones
- `GET /api/v1/teacher/grades/:id` - Obtener calificación específica

### Initial Analysis

**Pregunta clave:** ¿Grades debe ser entidad separada o vista de submissions?

### Evidence Gathered

1. **Database Schema Analysis**
   - ❌ NO existe tabla `grades` en database
   - ✅ Existe tabla `progress_tracking.exercise_submissions`
   - ✅ ExerciseSubmission contiene: score, max_score, feedback, graded_at, graded_by

2. **Backend Code Analysis**
   - ❌ NO existe entity `Grade` en codebase
   - ✅ Existe entity `ExerciseSubmission` completa
   - ✅ Existe `GradingService` con lógica de calificación

3. **Frontend Analysis**
   - ✅ `gradingApi.ts` usa `/teacher/submissions` como base
   - ✅ Frontend espera estructura compatible con submissions
   - ✅ No referencias a entidad "Grade" separada

4. **Domain Model Analysis**
   - Una "grade" (calificación) ES una "submission" (entrega) que ha sido puntuada
   - No existe concepto de "grade" independiente de "submission"
   - Grade = Submission + Score + Feedback

---

## 🔀 OPTIONS CONSIDERED

### Option A: Grades as Separate Entity

**Implementation:**
- Create new `Grade` entity
- Create new `grades` table in database
- Create separate `GradeService`
- Duplicate logic from `GradingService`

**Pros:**
- ✅ Clear semantic separation
- ✅ Could add grade-specific fields in future
- ✅ Explicit domain concept

**Cons:**
- ❌ Requires database migration (new table)
- ❌ Duplicates data (grade = submission copy)
- ❌ Duplicates business logic
- ❌ Increases maintenance burden
- ❌ NOT aligned with current database design
- ❌ More complex synchronization between submissions and grades

**Complexity:** HIGH
**Risk:** MEDIUM-HIGH

---

### Option B: Grades as View of Submissions ✅ SELECTED

**Implementation:**
- Create `GradeResponseDto` that maps `ExerciseSubmission` fields
- Create `TeacherGradesController` as semantic wrapper
- Reuse existing `GradingService`
- No database changes required

**Pros:**
- ✅ No database changes required
- ✅ No data duplication
- ✅ Reuses existing tested logic
- ✅ Aligned with current architecture
- ✅ Maintains Single Source of Truth
- ✅ Lower complexity
- ✅ Semantic clarity via DTOs
- ✅ Easy to maintain

**Cons:**
- ⚠️ Grades and submissions share same underlying entity
- ⚠️ Changes to ExerciseSubmission affect grades

**Complexity:** LOW
**Risk:** LOW

---

## 🏆 DECISION RATIONALE

### Why Option B was chosen:

1. **Alignment with Existing Architecture**
   - Database schema already models "grades" as submissions with scores
   - No separate grades table exists or was planned
   - ExerciseSubmission entity contains all necessary fields

2. **SOLID Principles**
   - **Single Responsibility:** Submissions already responsible for tracking exercise completions
   - **DRY (Don't Repeat Yourself):** Avoids duplicating data and logic
   - **KISS (Keep It Simple):** Simpler solution that meets requirements

3. **Business Domain Logic**
   - In educational systems: Grade = Scored Submission
   - No business requirement for grades to exist independently
   - Grade lifecycle = Submission lifecycle (created → submitted → graded)

4. **Technical Benefits**
   - Zero database migrations
   - Zero data migration scripts
   - Leverages existing well-tested GradingService
   - Faster implementation (no entity creation)
   - Lower risk (no schema changes)

5. **Maintenance & Evolution**
   - Easier to maintain (one source of truth)
   - Less code to test (reuses existing tests)
   - Future changes to grading logic only need one place
   - If requirements change, can still add Grade entity later

---

## 🛠️ IMPLEMENTATION DETAILS

### Architectural Pattern

**Pattern:** Facade + DTO Mapping

```
Frontend Request → TeacherGradesController (Facade)
                        ↓
                   GradingService (Existing)
                        ↓
                   ExerciseSubmission (Entity)
                        ↓
                   GradeResponseDto (DTO Mapping)
                        ↓
                   Frontend Response
```

### Key Components

1. **DTOs (New):**
   - `GradeResponseDto` - Maps submission to grade format
   - `GradeDetailResponseDto` - Detailed grade with full submission data
   - `GetGradesQueryDto` - Query parameters for filtering grades

2. **Controller (New):**
   - `TeacherGradesController` - Semantic endpoint for grades
   - Internally delegates to `GradingService.getSubmissions()`
   - Maps results to grade DTOs

3. **Service (Reused):**
   - `GradingService` - Existing service, no changes
   - Already handles submissions with scores

4. **Entity (Reused):**
   - `ExerciseSubmission` - Existing entity, no changes

### Data Mapping

```typescript
ExerciseSubmission → GradeResponseDto
{                      {
  id                    id (same)
  user_id     →        student_id
  exercise_id →        exercise_id
  score       →        score
  max_score   →        max_score
  feedback    →        feedback
  status      →        status
  submitted_at →       submitted_at
  graded_at   →        graded_at
  graded_by   →        graded_by
}                      }
```

---

## 🔍 CONSEQUENCES

### Positive

✅ **Immediate:**
- Fast implementation (2 hours vs 2+ days for Option A)
- No database downtime for migrations
- No data migration risks
- Immediate availability in production

✅ **Long-term:**
- Single source of truth for grading data
- Easier maintenance (one codebase path)
- Consistent behavior between grades and submissions
- Lower technical debt

### Negative

⚠️ **Considerations:**
- Grades and submissions are semantically coupled
- Future: If grades need to diverge significantly from submissions, refactoring required
- Documentation must clarify that "grade" = "submission with score"

### Mitigation Strategies

1. **Clear Documentation:**
   - JSDoc explains grades are views of submissions
   - API documentation clarifies relationship
   - Frontend team informed of underlying model

2. **DTO Abstraction:**
   - DTOs provide clean interface
   - Frontend doesn't need to know internal implementation
   - Can add computed fields to DTOs without changing entity

3. **Future Extensibility:**
   - If separate Grade entity needed later:
     - DTOs remain same (backward compatible)
     - Controller remains same
     - Only service implementation changes
     - Migration path: ExerciseSubmission → Grade entity

---

## 🎓 LESSONS LEARNED

### Key Insights

1. **Database schema is source of truth**
   - Always check database design before adding entities
   - Align backend models with database structure

2. **Reuse before recreate**
   - Existing logic (GradingService) was well-tested
   - No need to duplicate what already works

3. **DTOs provide flexibility**
   - DTOs allow semantic naming (grades) over implementation (submissions)
   - Frontend can think in terms of "grades" while backend uses submissions

4. **KISS principle wins**
   - Simpler solution met all requirements
   - Complex solution would have added unnecessary risk

---

## 📚 RELATED DECISIONS

- **ADR-015:** Centralized API Routes Configuration (related to endpoint structure)
- **GAP-TEACHER-003:** Grades endpoints requirement
- **GAP-TEACHER-004:** Submissions filters (implemented simultaneously)

---

## 📊 METRICS

| Metric | Option A | Option B (Selected) |
|--------|----------|---------------------|
| Implementation Time | 2-3 days | 2 hours |
| Database Changes | 1 new table | 0 |
| Code Duplication | High | None |
| Maintenance Burden | Medium-High | Low |
| Risk Level | Medium-High | Low |
| Test Coverage | Need new tests | Reuse existing |

---

## ✅ APPROVAL

**Decision:** APPROVED
**Implementation Status:** ✅ COMPLETED
**Reviewed by:** Backend-Agent
**Architecture Validation:** Aligned with existing patterns

---

## 📖 REFERENCES

**Documents:**
- GAP-TEACHER-003 Analysis
- GAP-TEACHER-004 Analysis
- DATABASE_INVENTORY.yml (verified no grades table)
- ExerciseSubmission entity definition
- Frontend gradingApi.ts analysis

**Implementation:**
- `apps/backend/src/modules/teacher/dto/grades.dto.ts`
- `apps/backend/src/modules/teacher/controllers/teacher-grades.controller.ts`
- IMPLEMENTATION-REPORT.md

---

**Effective Date:** 2025-11-24
**Status:** ACTIVE
**Review Date:** 2026-02-24 (3 months)
