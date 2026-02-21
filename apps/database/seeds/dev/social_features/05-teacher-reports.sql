-- ============================================================================
-- Seed: Teacher Reports para Teacher Portal
-- Schema: social_features
-- Descripcion: Crea reportes de ejemplo para testing del panel de reportes
-- Dependencias: profiles (teachers), classrooms, tenants
-- Fecha: 2025-12-27
-- ============================================================================

-- Verificar dependencias antes de insertar
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth_management.profiles WHERE role = 'admin_teacher' LIMIT 1) THEN
    RAISE NOTICE 'ADVERTENCIA: No hay teachers en profiles. Ejecute seeds de usuarios primero.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM social_features.classrooms LIMIT 1) THEN
    RAISE NOTICE 'ADVERTENCIA: No hay classrooms. Ejecute seeds de classrooms primero.';
  END IF;
END $$;

-- Limpiar seed data anterior para idempotencia (todas las filas son de este seed)
DELETE FROM social_features.teacher_reports
WHERE report_name LIKE 'Reporte de Progreso -%'
   OR report_name LIKE 'Analiticas de Aula -%'
   OR report_name LIKE 'Evaluacion Individual -%'
   OR report_name LIKE 'Resumen Trimestral -%';

-- Insertar reportes de ejemplo variados
INSERT INTO social_features.teacher_reports (
  id,
  teacher_id,
  classroom_id,
  tenant_id,
  report_name,
  report_type,
  report_format,
  student_count,
  period_start,
  period_end,
  file_path,
  file_size_bytes,
  generated_at,
  created_at
)
SELECT
  gen_random_uuid(),
  t.id AS teacher_id,
  c.id AS classroom_id,
  t.tenant_id AS tenant_id,
  'Reporte de Progreso - ' || c.name AS report_name,
  'progress' AS report_type,
  'pdf' AS report_format,
  FLOOR(random() * 25 + 10)::INTEGER AS student_count,
  CURRENT_DATE - interval '30 days' AS period_start,
  CURRENT_DATE AS period_end,
  '/reports/progress/' || gen_random_uuid() || '.pdf' AS file_path,
  FLOOR(random() * 500000 + 100000)::BIGINT AS file_size_bytes,
  NOW() - (random() * interval '7 days') AS generated_at,
  NOW() - (random() * interval '7 days') AS created_at
FROM (SELECT id, tenant_id FROM auth_management.profiles WHERE role = 'admin_teacher' ORDER BY created_at LIMIT 3) t
CROSS JOIN (SELECT id, name FROM social_features.classrooms ORDER BY created_at LIMIT 2) c
LIMIT 5
ON CONFLICT DO NOTHING;

-- Reportes de analiticas
INSERT INTO social_features.teacher_reports (
  id,
  teacher_id,
  classroom_id,
  tenant_id,
  report_name,
  report_type,
  report_format,
  student_count,
  period_start,
  period_end,
  file_path,
  file_size_bytes,
  generated_at,
  created_at
)
SELECT
  gen_random_uuid(),
  t.id AS teacher_id,
  c.id AS classroom_id,
  t.tenant_id AS tenant_id,
  'Analiticas de Aula - ' || c.name AS report_name,
  'analytics' AS report_type,
  'excel' AS report_format,
  FLOOR(random() * 30 + 15)::INTEGER AS student_count,
  CURRENT_DATE - interval '60 days' AS period_start,
  CURRENT_DATE AS period_end,
  '/reports/analytics/' || gen_random_uuid() || '.xlsx' AS file_path,
  FLOOR(random() * 300000 + 50000)::BIGINT AS file_size_bytes,
  NOW() - (random() * interval '14 days') AS generated_at,
  NOW() - (random() * interval '14 days') AS created_at
FROM (SELECT id, tenant_id FROM auth_management.profiles WHERE role = 'admin_teacher' ORDER BY created_at LIMIT 2) t
CROSS JOIN (SELECT id, name FROM social_features.classrooms ORDER BY created_at LIMIT 2) c
LIMIT 3
ON CONFLICT DO NOTHING;

-- Reportes individuales de estudiantes
INSERT INTO social_features.teacher_reports (
  id,
  teacher_id,
  classroom_id,
  tenant_id,
  report_name,
  report_type,
  report_format,
  student_count,
  period_start,
  period_end,
  file_path,
  file_size_bytes,
  generated_at,
  created_at
)
SELECT
  gen_random_uuid(),
  t.id AS teacher_id,
  NULL AS classroom_id, -- Reporte individual, sin classroom especifico
  t.tenant_id AS tenant_id,
  'Evaluacion Individual - Estudiante ' || FLOOR(random() * 100 + 1)::INTEGER AS report_name,
  'individual' AS report_type,
  'pdf' AS report_format,
  1 AS student_count,
  CURRENT_DATE - interval '7 days' AS period_start,
  CURRENT_DATE AS period_end,
  '/reports/individual/' || gen_random_uuid() || '.pdf' AS file_path,
  FLOOR(random() * 100000 + 20000)::BIGINT AS file_size_bytes,
  NOW() - (random() * interval '3 days') AS generated_at,
  NOW() - (random() * interval '3 days') AS created_at
FROM auth_management.profiles t
WHERE t.role = 'admin_teacher'
LIMIT 4
ON CONFLICT DO NOTHING;

-- Reportes de classroom completos
INSERT INTO social_features.teacher_reports (
  id,
  teacher_id,
  classroom_id,
  tenant_id,
  report_name,
  report_type,
  report_format,
  student_count,
  period_start,
  period_end,
  file_path,
  file_size_bytes,
  generated_at,
  created_at
)
SELECT
  gen_random_uuid(),
  t.id AS teacher_id,
  c.id AS classroom_id,
  t.tenant_id AS tenant_id,
  'Resumen Trimestral - ' || c.name AS report_name,
  'classroom' AS report_type,
  'csv' AS report_format,
  FLOOR(random() * 35 + 20)::INTEGER AS student_count,
  CURRENT_DATE - interval '90 days' AS period_start,
  CURRENT_DATE AS period_end,
  '/reports/classroom/' || gen_random_uuid() || '.csv' AS file_path,
  FLOOR(random() * 50000 + 10000)::BIGINT AS file_size_bytes,
  NOW() - (random() * interval '21 days') AS generated_at,
  NOW() - (random() * interval '21 days') AS created_at
FROM (SELECT id, tenant_id FROM auth_management.profiles WHERE role = 'admin_teacher' ORDER BY created_at LIMIT 2) t
CROSS JOIN (SELECT id, name FROM social_features.classrooms ORDER BY created_at LIMIT 2) c
LIMIT 3
ON CONFLICT DO NOTHING;

-- Reporte de registros creados
DO $$
DECLARE
  total_count INTEGER;
  progress_count INTEGER;
  analytics_count INTEGER;
  individual_count INTEGER;
  classroom_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM social_features.teacher_reports;
  SELECT COUNT(*) INTO progress_count FROM social_features.teacher_reports WHERE report_type = 'progress';
  SELECT COUNT(*) INTO analytics_count FROM social_features.teacher_reports WHERE report_type = 'analytics';
  SELECT COUNT(*) INTO individual_count FROM social_features.teacher_reports WHERE report_type = 'individual';
  SELECT COUNT(*) INTO classroom_count FROM social_features.teacher_reports WHERE report_type = 'classroom';

  RAISE NOTICE 'Teacher Reports creados: % total (% progress, % analytics, % individual, % classroom)',
    total_count, progress_count, analytics_count, individual_count, classroom_count;
END $$;
