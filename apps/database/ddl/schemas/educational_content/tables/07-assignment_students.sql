-- Tabla: assignment_students
-- Schema: educational_content
-- Descripción: Relación M2M - Asignaciones asignadas a estudiantes individuales
-- Incluye: submission tracking, grading, rubric scores, attempt tracking, late penalties
-- MOVIDO desde public.assignment_students (2025-11-08)
-- CORREGIDO (2025-11-29): FK student_id → auth_management.profiles (ARCH-015-FIX)
-- MERGED (2026-02-10): Absorbe 24-alter_assignment_students.sql (grading + submission fields)

DROP TABLE IF EXISTS educational_content.assignment_students CASCADE;

CREATE TABLE educational_content.assignment_students (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core relationships
    assignment_id UUID NOT NULL REFERENCES educational_content.assignments(id) ON DELETE CASCADE,
    -- IMPORTANT: student_id referencia profiles, NO auth.users
    -- profiles es la tabla de perfil de usuario gestionada por la aplicación
    student_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,

    -- Assignment timing
    assigned_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),

    -- Submission tracking
    submitted_at TIMESTAMPTZ,
    submission_data JSONB DEFAULT '{}'::jsonb,
    submission_url TEXT,
    submission_files JSONB DEFAULT '[]'::jsonb,

    -- Grading fields
    score DECIMAL(5,2),
    max_score DECIMAL(5,2),
    percentage DECIMAL(5,2),
    feedback TEXT,
    graded_by UUID REFERENCES auth_management.profiles(id) ON DELETE SET NULL,
    graded_at TIMESTAMPTZ,

    -- Status tracking
    -- Possible values: 'assigned', 'in_progress', 'submitted', 'graded', 'returned', 'late', 'excused'
    status VARCHAR(50) DEFAULT 'assigned',

    -- Attempt tracking
    attempt_number INTEGER DEFAULT 1,
    max_attempts INTEGER DEFAULT 1,

    -- Late submission
    is_late BOOLEAN DEFAULT FALSE,
    late_penalty_applied DECIMAL(5,2) DEFAULT 0,

    -- Grading rubric results
    -- Example: {"criteria_1": 8.5, "criteria_2": 9.0, "criteria_3": 7.5}
    rubric_scores JSONB DEFAULT '{}'::jsonb,

    -- Teacher notes and flags
    teacher_notes TEXT,
    flagged_for_review BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,

    -- Audit fields
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),

    -- Table-level constraints
    UNIQUE(assignment_id, student_id),

    CONSTRAINT assignment_students_score_valid
        CHECK (score IS NULL OR (score >= 0 AND score <= max_score)),

    CONSTRAINT assignment_students_percentage_valid
        CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100)),

    CONSTRAINT assignment_students_attempt_positive
        CHECK (attempt_number > 0 AND attempt_number <= max_attempts),

    CONSTRAINT assignment_students_status_valid
        CHECK (status IN ('assigned', 'in_progress', 'submitted', 'graded', 'returned', 'late', 'excused'))
);

-- =============================================================================
-- Indexes
-- =============================================================================

-- Core relationship indexes
CREATE INDEX IF NOT EXISTS idx_assignment_students_assignment_id
    ON educational_content.assignment_students(assignment_id);

CREATE INDEX IF NOT EXISTS idx_assignment_students_student_id
    ON educational_content.assignment_students(student_id);

-- Index for finding assignments by status
CREATE INDEX IF NOT EXISTS idx_assignment_students_status
    ON educational_content.assignment_students(status);

-- Index for finding ungraded submissions
CREATE INDEX IF NOT EXISTS idx_assignment_students_submitted_ungraded
    ON educational_content.assignment_students(assignment_id, submitted_at)
    WHERE status = 'submitted';

-- Index for finding flagged assignments
CREATE INDEX IF NOT EXISTS idx_assignment_students_flagged
    ON educational_content.assignment_students(assignment_id)
    WHERE flagged_for_review = TRUE;

-- Index for grading queue (submitted, not graded, ordered by submission time)
CREATE INDEX IF NOT EXISTS idx_assignment_students_grading_queue
    ON educational_content.assignment_students(assignment_id, submitted_at)
    WHERE status IN ('submitted', 'in_progress');

-- Index for student's assignment history
CREATE INDEX IF NOT EXISTS idx_assignment_students_student_history
    ON educational_content.assignment_students(student_id, submitted_at DESC);

-- Index for grader analytics
CREATE INDEX IF NOT EXISTS idx_assignment_students_graded_by
    ON educational_content.assignment_students(graded_by, graded_at)
    WHERE status = 'graded';

-- =============================================================================
-- Trigger function: auto-update updated_at, percentage, graded_at, is_late
-- =============================================================================

CREATE OR REPLACE FUNCTION educational_content.update_assignment_students_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = gamilit.now_mexico();

    -- Auto-calculate percentage when score is updated
    IF NEW.score IS NOT NULL AND NEW.max_score IS NOT NULL AND NEW.max_score > 0 THEN
        NEW.percentage = (NEW.score / NEW.max_score) * 100;
    END IF;

    -- Auto-set graded_at when status changes to 'graded'
    IF NEW.status = 'graded' AND OLD.status != 'graded' THEN
        NEW.graded_at = gamilit.now_mexico();
    END IF;

    -- Auto-detect late submission
    IF NEW.submitted_at IS NOT NULL THEN
        DECLARE
            assignment_due_date TIMESTAMPTZ;
        BEGIN
            SELECT due_date INTO assignment_due_date
            FROM educational_content.assignments
            WHERE id = NEW.assignment_id;

            IF assignment_due_date IS NOT NULL AND NEW.submitted_at > assignment_due_date THEN
                NEW.is_late = TRUE;
            END IF;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assignment_students_updated_at
    ON educational_content.assignment_students;

CREATE TRIGGER trg_assignment_students_updated_at
    BEFORE UPDATE ON educational_content.assignment_students
    FOR EACH ROW
    EXECUTE FUNCTION educational_content.update_assignment_students_timestamp();

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE educational_content.assignment_students IS
'Tracks individual student submissions and grades for assignments.

Example grading queue query:
SELECT
    ass.id,
    ass.student_id,
    p.display_name as student_name,
    a.title as assignment_title,
    ass.submitted_at,
    ass.attempt_number,
    ass.is_late
FROM educational_content.assignment_students ass
JOIN educational_content.assignments a ON a.id = ass.assignment_id
JOIN auth_management.profiles p ON p.id = ass.student_id
WHERE ass.status = ''submitted''
  AND a.teacher_id = ''<teacher_id>''
ORDER BY ass.submitted_at ASC;
';

COMMENT ON COLUMN educational_content.assignment_students.student_id IS
'References profiles.id (application-managed user profile)';

COMMENT ON COLUMN educational_content.assignment_students.status IS
'Current status of the assignment: assigned, in_progress, submitted, graded, returned, late, excused';

COMMENT ON COLUMN educational_content.assignment_students.submission_data IS
'JSON data containing the student submission (answers, files metadata, completion data)';

COMMENT ON COLUMN educational_content.assignment_students.rubric_scores IS
'JSON object with scores per rubric criteria for detailed grading';

COMMENT ON COLUMN educational_content.assignment_students.score IS
'Points earned by the student (0 to max_score)';

COMMENT ON COLUMN educational_content.assignment_students.percentage IS
'Auto-calculated percentage grade (0-100) based on score/max_score';

COMMENT ON COLUMN educational_content.assignment_students.flagged_for_review IS
'True if this submission requires special attention or review';

-- =============================================================================
-- Permissions
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON educational_content.assignment_students TO gamilit_user;
