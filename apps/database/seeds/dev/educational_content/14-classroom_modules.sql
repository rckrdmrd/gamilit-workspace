-- =============================================================================
-- Seed: educational_content.classroom_modules
-- Description: Assigns published modules to the default classroom
-- Dependencies:
--   - social_features.classrooms (02-classrooms.sql)
--   - educational_content.modules (01-modules.sql)
-- Created: 2026-01-25
-- Priority: P0 - Required for student portal functionality
-- =============================================================================

-- Clear existing data (safe for re-runs)
DELETE FROM educational_content.classroom_modules
WHERE classroom_id = (SELECT id FROM social_features.classrooms WHERE code = 'DEFAULT');

-- Assign all published modules to the default classroom
INSERT INTO educational_content.classroom_modules (
    classroom_id,
    module_id,
    assigned_date,
    is_active,
    display_order,
    settings
)
SELECT
    c.id AS classroom_id,
    m.id AS module_id,
    NOW() AS assigned_date,
    true AS is_active,
    m.order_index AS display_order,
    jsonb_build_object(
        'allow_retries', true,
        'max_attempts', 3,
        'points_multiplier', 1.0,
        'is_optional', false
    ) AS settings
FROM social_features.classrooms c
CROSS JOIN educational_content.modules m
WHERE c.code = 'DEFAULT'
  AND m.status = 'published'
  AND m.is_published = true
ORDER BY m.order_index;

-- Verification
DO $$
DECLARE
    v_count INTEGER;
    v_classroom_name TEXT;
BEGIN
    SELECT COUNT(*), MAX(c.name) INTO v_count, v_classroom_name
    FROM educational_content.classroom_modules cm
    JOIN social_features.classrooms c ON cm.classroom_id = c.id
    WHERE c.code = 'DEFAULT';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'CLASSROOM_MODULES SEED COMPLETADO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Classroom: %', v_classroom_name;
    RAISE NOTICE 'Modules assigned: %', v_count;
    RAISE NOTICE '========================================';
END $$;

-- Show assigned modules
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Modules assigned to DEFAULT classroom:';
    RAISE NOTICE '----------------------------------------';

    FOR rec IN
        SELECT m.title, m.status, cm.display_order
        FROM educational_content.classroom_modules cm
        JOIN educational_content.modules m ON cm.module_id = m.id
        JOIN social_features.classrooms c ON cm.classroom_id = c.id
        WHERE c.code = 'DEFAULT'
        ORDER BY cm.display_order
    LOOP
        RAISE NOTICE '  % - % (order: %)', rec.display_order, rec.title, rec.status;
    END LOOP;

    RAISE NOTICE '----------------------------------------';
END $$;
