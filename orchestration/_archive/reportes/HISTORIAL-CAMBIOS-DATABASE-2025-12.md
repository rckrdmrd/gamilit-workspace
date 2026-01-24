# Historial de Cambios - Database
## Diciembre 2025

**Proyecto:** Gamilit
**Tipo:** Documentación de Planeación - Historial de Cambios

---

## 2025-12-18

### Trigger: Aseguramiento de Nombres en Profiles

**Problema identificado:**
- 31 usuarios registrados sin `first_name`/`last_name`
- UI mostraba "Unknown Student" y valores "NaNh"
- El DTO de registro tiene estos campos como opcionales
- Backend usa `full_name` separadamente (no se computaba automáticamente)

**Solución implementada:**
1. Creado trigger `trg_ensure_profile_name` (BEFORE INSERT)
2. Creado trigger `trg_ensure_profile_name_update` (BEFORE UPDATE)
3. Creada función `auth_management.ensure_profile_name()`
4. Trigger computa `full_name` automáticamente como `first_name + ' ' + last_name`

**Archivos creados:**
- `apps/database/ddl/schemas/auth_management/triggers/03b-trg_ensure_profile_name.sql`

**Lógica del trigger:**
```sql
-- Si first_name está vacío, extraer del email
IF NEW.first_name IS NULL OR TRIM(NEW.first_name) = '' THEN
  NEW.first_name := INITCAP(SPLIT_PART(NEW.email, '@', 1));
END IF;

-- Si last_name está vacío, poner valor por defecto
IF NEW.last_name IS NULL OR TRIM(NEW.last_name) = '' THEN
  NEW.last_name := 'Usuario';
END IF;

-- Siempre computar full_name como concatenación
NEW.full_name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
```

**Validación de coherencia BD-Backend-Frontend:**
- Backend: DTOs opcionales, AuthService asigna NULL si no se proporciona
- Trigger DB: Garantiza valores automáticamente
- Frontend: Puede usar `full_name` directamente sin fallbacks complejos

### Ejercicios Módulo 4

**Cambios realizados:**
- Agregados 4 nuevos valores a ENUM `exercise_type`:
  - `chat_literario`
  - `email_formal`
  - `ensayo_argumentativo`
  - `resena_critica`
- Agregados 4 ejercicios nuevos en seeds (ejercicios 6-9)
- Total ejercicios M4: 9 (5 originales + 4 nuevos)

---

## 2025-12-15

### Correcciones de Coherencia BD-Backend-Frontend

**Correcciones realizadas:**
1. `update_leaderboard_streaks.sql` - Referencias a columnas corregidas:
   - `last_activity_date` → `last_activity_at`
   - `longest_streak` → `max_streak`

2. `00-prerequisites.sql` - ENUM `achievement_category`:
   - Agregados valores `collection` y `hidden`

3. `calculate_user_rank.sql` - Referencias corregidas:
   - `missions_completed` → `modules_completed`
   - `name` → `rank_name`

**Documentación generada:**
- `COHERENCE-ANALYSIS-BD-BACKEND-FRONTEND-2025-12-15.md`
- `FASE-2-CONSOLIDADO-HALLAZGOS.md` (26 discrepancias)
- `FASE-3-PLAN-CORRECCIONES.md`

---

## 2025-11-29

### Correcciones de Seeds

**user_achievements:**
- UUIDs de `achievement_id` corregidos (patrón incorrecto)
- UUIDs de `user_id` mapeados a profiles existentes
- `ARRAY[]` → `ARRAY[]::text[]`

**Trigger fn_on_achievement_unlocked:**
- Corregido cálculo de `balance_before`/`balance_after`

**Resultado:** 43 user_achievements insertados correctamente

---

## Notas de Validación

### Conteos BD Real (2025-12-14)
| Objeto | Cantidad |
|--------|----------|
| Schemas | 16 |
| Tables | 123 |
| Views | 11 |
| Functions | 213 |
| Triggers | 92 |
| Policies | 185 |
| Foreign Keys | 208 |

---

**Documento de planeación para trazabilidad de cambios.**
