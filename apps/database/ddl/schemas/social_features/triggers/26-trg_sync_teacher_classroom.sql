-- =====================================================
-- Trigger: trg_sync_teacher_classroom_on_insert
-- Table: social_features.classrooms
-- Function: social_features.sync_teacher_classroom_on_insert
-- Event: AFTER INSERT
-- Level: FOR EACH ROW
-- Description: Sincroniza teacher_classrooms al crear un classroom
-- Created: 2026-01-08
-- Ticket: FIX-DB2 - Correccion de classrooms huerfanos
-- =====================================================

DROP TRIGGER IF EXISTS trg_sync_teacher_classroom_on_insert ON social_features.classrooms CASCADE;

CREATE TRIGGER trg_sync_teacher_classroom_on_insert
    AFTER INSERT
    ON social_features.classrooms
    FOR EACH ROW
    EXECUTE FUNCTION social_features.sync_teacher_classroom_on_insert();
