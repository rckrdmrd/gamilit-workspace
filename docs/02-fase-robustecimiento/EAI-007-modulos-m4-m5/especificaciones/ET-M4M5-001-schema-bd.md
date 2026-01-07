---
id: ET-M4M5-001
title: Schema Base de Datos - Modulos M4-M5
rf: [RF-M4-001, RF-M5-001]
epic: EAI-007
status: Done
created: 2025-12-05
updated: 2026-01-04
---

# ET-M4M5-001: Schema Base de Datos

## Schema

**Nombre:** educational_content

## Tablas Afectadas

### exercises (existente)

Tipos de ejercicio agregados:
```sql
-- Modulo 4
'linea_tiempo', 'mapa_mental', 'infografia', 'podcast', 'video_resumen'

-- Modulo 5
'ensayo', 'carta', 'proyecto_multimedia'
```

### student_responses (existente)

Campos utilizados:
- `response_data`: JSONB con estructura por tipo
- `status`: 'pending_review' para M4-M5
- `media_urls`: Array de URLs de archivos

### media_attachments (existente)

Almacena archivos multimedia:
- `file_path`: Ruta en Supabase Storage
- `file_type`: Tipo MIME
- `file_size`: Tamano en bytes
- `student_response_id`: FK a respuesta

## Funciones

### validate_module4_module5_answer

**Ubicacion:** `ddl/schemas/educational_content/functions/23-validate_module4_module5.sql`

```sql
CREATE OR REPLACE FUNCTION educational_content.validate_module4_module5_answer(
  p_exercise_type TEXT,
  p_answer JSONB
) RETURNS BOOLEAN
```

**Logica:**
1. Valida estructura de respuesta segun tipo
2. Verifica campos requeridos
3. Retorna TRUE si es valido para revision manual

## RLS Policies

Politicas existentes aplican:
- Estudiantes pueden crear/ver sus respuestas
- Docentes pueden ver respuestas de sus grupos
- Docentes pueden actualizar calificaciones

## Trazabilidad

- Funcion: `apps/database/ddl/schemas/educational_content/functions/23-validate_module4_module5.sql`
- Seeds: `apps/database/seeds/exercises_m4_m5.sql`

---

**Estado:** Done
