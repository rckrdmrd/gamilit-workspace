-- Tabla: assignment_classrooms
-- Schema: public
-- Descripción: Relación M2M - Asignaciones asignadas a aulas completas

CREATE TABLE public.assignment_classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL REFERENCES social_features.classrooms(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, classroom_id)
);

-- Índices
CREATE INDEX idx_assignment_classrooms_assignment_id ON public.assignment_classrooms(assignment_id);
CREATE INDEX idx_assignment_classrooms_classroom_id ON public.assignment_classrooms(classroom_id);

-- Comentarios
COMMENT ON TABLE public.assignment_classrooms IS 'Assignments assigned to entire classrooms';
