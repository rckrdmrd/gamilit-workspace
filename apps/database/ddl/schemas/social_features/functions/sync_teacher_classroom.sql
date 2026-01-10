-- =====================================================
-- Function: social_features.sync_teacher_classroom_on_insert
-- Description: Sincroniza teacher_classrooms al crear un classroom
-- Parameters: None
-- Returns: trigger
-- Created: 2026-01-08
-- Ticket: FIX-DB2 - Correccion de classrooms huerfanos
-- =====================================================

CREATE OR REPLACE FUNCTION social_features.sync_teacher_classroom_on_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Al crear un classroom, automaticamente crear registro en teacher_classrooms
    -- con el profesor principal como 'owner'
    INSERT INTO social_features.teacher_classrooms (
        teacher_id,
        classroom_id,
        tenant_id,
        role,
        assigned_at
    ) VALUES (
        NEW.teacher_id,
        NEW.id,
        NEW.tenant_id,
        'owner',
        NEW.created_at
    )
    ON CONFLICT (teacher_id, classroom_id) DO NOTHING;

    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION social_features.sync_teacher_classroom_on_insert() IS
    'Crea automaticamente registro en teacher_classrooms cuando se crea un classroom (FIX-DB2)';
