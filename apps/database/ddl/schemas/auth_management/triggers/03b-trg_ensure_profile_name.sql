-- =====================================================
-- Trigger: trg_ensure_profile_name
-- Table: auth_management.profiles
-- Function: ensure_profile_name
-- Event: BEFORE INSERT OR UPDATE
-- Level: FOR EACH ROW
-- Description: Asegura que first_name, last_name y full_name tengan valores,
--              extrayendo del email si es necesario
-- Created: 2025-12-18
-- =====================================================

-- Función que extrae nombre del email si no se proporciona
CREATE OR REPLACE FUNCTION auth_management.ensure_profile_name()
RETURNS TRIGGER AS $$
DECLARE
  email_prefix TEXT;
  extracted_name TEXT;
BEGIN
  -- Si first_name está vacío o es NULL, extraer del email
  IF NEW.first_name IS NULL OR TRIM(NEW.first_name) = '' THEN
    -- Obtener parte antes del @
    email_prefix := SPLIT_PART(NEW.email, '@', 1);

    -- Limpiar: quitar números, reemplazar puntos/guiones por espacios, capitalizar
    extracted_name := INITCAP(
      TRIM(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            email_prefix,
            '[0-9]+', '', 'g'  -- Quitar números
          ),
          '[._-]+', ' ', 'g'   -- Puntos/guiones a espacios
        )
      )
    );

    -- Si después de limpiar queda vacío, usar 'Usuario'
    IF extracted_name = '' THEN
      extracted_name := 'Usuario';
    END IF;

    NEW.first_name := extracted_name;
  END IF;

  -- Si last_name está vacío o es NULL, poner valor por defecto
  IF NEW.last_name IS NULL OR TRIM(NEW.last_name) = '' THEN
    NEW.last_name := 'Usuario';
  END IF;

  -- Siempre computar full_name como concatenación de first_name + last_name
  NEW.full_name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION auth_management.ensure_profile_name() IS
'Asegura first_name/last_name/full_name tengan valores. Extrae del email si es necesario. Previene "Unknown Student" en la UI.';

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trg_ensure_profile_name ON auth_management.profiles CASCADE;

-- Crear trigger BEFORE INSERT para asegurar nombres
CREATE TRIGGER trg_ensure_profile_name
  BEFORE INSERT ON auth_management.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auth_management.ensure_profile_name();

-- También aplicar en UPDATE para correcciones
DROP TRIGGER IF EXISTS trg_ensure_profile_name_update ON auth_management.profiles CASCADE;

CREATE TRIGGER trg_ensure_profile_name_update
  BEFORE UPDATE ON auth_management.profiles
  FOR EACH ROW
  WHEN (NEW.first_name IS DISTINCT FROM OLD.first_name
        OR NEW.last_name IS DISTINCT FROM OLD.last_name
        OR NEW.full_name IS DISTINCT FROM OLD.full_name)
  EXECUTE FUNCTION auth_management.ensure_profile_name();

-- Mensaje de confirmación
DO $$ BEGIN RAISE NOTICE 'Trigger trg_ensure_profile_name created successfully'; END $$;
