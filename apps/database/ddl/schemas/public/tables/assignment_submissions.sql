-- Tabla: assignment_submissions
-- Schema: public
-- Descripción: Entregas de estudiantes para asignaciones

CREATE TABLE public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'graded')),
    score NUMERIC(5,2),
    feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);

-- Índices
CREATE INDEX idx_assignment_submissions_assignment_id ON public.assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON public.assignment_submissions(student_id);
CREATE INDEX idx_assignment_submissions_status ON public.assignment_submissions(status);
CREATE INDEX idx_assignment_submissions_graded_by ON public.assignment_submissions(graded_by) WHERE graded_by IS NOT NULL;
CREATE INDEX idx_assignment_submissions_submitted_at ON public.assignment_submissions(submitted_at) WHERE submitted_at IS NOT NULL;

-- Comentarios
COMMENT ON TABLE public.assignment_submissions IS 'Student submissions for assignments';
COMMENT ON COLUMN public.assignment_submissions.status IS 'Submission status: not_started, in_progress, submitted, or graded';
COMMENT ON COLUMN public.assignment_submissions.score IS 'Numeric score given by teacher (0-100 scale)';
COMMENT ON COLUMN public.assignment_submissions.graded_by IS 'Teacher who graded this submission';

-- Trigger para updated_at
CREATE TRIGGER update_assignment_submissions_updated_at
    BEFORE UPDATE ON public.assignment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
