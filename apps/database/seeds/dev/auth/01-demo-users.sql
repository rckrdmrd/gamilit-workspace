-- =====================================================
-- Seed Data: Demo Users (DEV)
-- =====================================================
-- Description: Usuarios demo para desarrollo y testing
-- Environment: DEVELOPMENT
-- Records: 5 usuarios
-- Date: 2025-11-02
-- Created by: SA-SEEDS-AUTH
-- =====================================================

SET search_path TO auth, public;

-- =====================================================
-- Passwords Reference (Plain Text - DO NOT COMMIT TO PROD)
-- =====================================================
-- USUARIOS DE TESTING PRINCIPALES:
-- - admin@gamilit.com / Test1234
-- - teacher@gamilit.com / Test1234
-- - student@gamilit.com / Test1234
--
-- OTROS USUARIOS DEMO:
-- - Super Admin:  "Admin123!"
-- - Instructor:   "Instructor123!"
-- - Students:     "Student123!"
-- =====================================================

-- =====================================================
-- Insert Demo Users
-- =====================================================
-- All users have confirmed emails for immediate login
-- Passwords are encrypted using bcrypt (cost=10)
-- =====================================================

INSERT INTO auth.users (
    email,
    encrypted_password,
    role,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES
-- =====================================================
-- USUARIOS DE TESTING PRINCIPALES (Password: Test1234)
-- =====================================================
-- Admin Testing
(
    'admin@gamilit.com',
    crypt('Test1234', gen_salt('bf', 10)),
    'super_admin',
    NOW(),
    '{"name": "Admin GAMILIT", "description": "Usuario administrador de testing"}'::jsonb,
    NOW(),
    NOW()
),

-- Teacher Testing
(
    'teacher@gamilit.com',
    crypt('Test1234', gen_salt('bf', 10)),
    'admin_teacher',
    NOW(),
    '{"name": "Profesor Testing", "description": "Usuario profesor de testing"}'::jsonb,
    NOW(),
    NOW()
),

-- Student Testing
(
    'student@gamilit.com',
    crypt('Test1234', gen_salt('bf', 10)),
    'student',
    NOW(),
    '{"name": "Estudiante Testing", "description": "Usuario estudiante de testing"}'::jsonb,
    NOW(),
    NOW()
),

-- =====================================================
-- USUARIOS DEMO (Passwords variados)
-- =====================================================
-- Super Admin
(
    'admin@glit.edu.mx',
    '$2b$10$8j7PFySPnNPkgi.vfj6DwuCJGYU6vMEmKOwuZm6PcHXNH3Jn9B89u',
    'super_admin',
    NOW(),
    '{"name": "Super Admin", "description": "Usuario administrador principal del sistema"}'::jsonb,
    NOW(),
    NOW()
),

-- Instructor Demo
(
    'instructor@demo.glit.edu.mx',
    '$2b$10$N8.ZUGzXY2GbnpROht7M8.bB0w1xGMew5VmCMyrZ6.3K2c8hr8IhK',
    'admin_teacher',
    NOW(),
    '{"name": "Instructor Demo", "description": "Usuario instructor de demostración"}'::jsonb,
    NOW(),
    NOW()
),

-- Estudiante Demo 1
(
    'estudiante1@demo.glit.edu.mx',
    '$2b$10$ylnge7jXE7CbT33qCSIQb.Oc1T0wFdrBIsvqcEENZ3JLm/5D457E.',
    'student',
    NOW(),
    '{"name": "Estudiante Demo 1", "description": "Usuario estudiante de demostración 1"}'::jsonb,
    NOW(),
    NOW()
),

-- Estudiante Demo 2
(
    'estudiante2@demo.glit.edu.mx',
    '$2b$10$ylnge7jXE7CbT33qCSIQb.Oc1T0wFdrBIsvqcEENZ3JLm/5D457E.',
    'student',
    NOW(),
    '{"name": "Estudiante Demo 2", "description": "Usuario estudiante de demostración 2"}'::jsonb,
    NOW(),
    NOW()
),

-- Estudiante Demo 3
(
    'estudiante3@demo.glit.edu.mx',
    '$2b$10$ylnge7jXE7CbT33qCSIQb.Oc1T0wFdrBIsvqcEENZ3JLm/5D457E.',
    'student',
    NOW(),
    '{"name": "Estudiante Demo 3", "description": "Usuario estudiante de demostración 3"}'::jsonb,
    NOW(),
    NOW()
)

ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    role = EXCLUDED.role,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = NOW();

-- =====================================================
-- Verification Query
-- =====================================================
-- Execute this query to verify the inserted users:
-- SELECT id, email, role, email_confirmed_at, created_at
-- FROM auth.users
-- WHERE email LIKE '%@glit.edu.mx' OR email LIKE '%@demo.glit.edu.mx'
-- ORDER BY role, email;
-- =====================================================
