-- Tabla: teacher_notes
-- Schema: public
-- Descripción: Notas de profesores sobre estudiantes para seguimiento de progreso

CREATE TABLE public.teacher_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    is_private BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_teacher_notes_teacher_id ON public.teacher_notes(teacher_id);
CREATE INDEX idx_teacher_notes_student_id ON public.teacher_notes(student_id);
CREATE INDEX idx_teacher_notes_created_at ON public.teacher_notes(created_at);
CREATE INDEX idx_teacher_notes_teacher_student ON public.teacher_notes(teacher_id, student_id);

-- Comentarios
COMMENT ON TABLE public.teacher_notes IS 'Teacher notes about students for tracking progress and observations';
COMMENT ON COLUMN public.teacher_notes.is_private IS 'Whether note is private to teacher (not visible to student or parents)';
