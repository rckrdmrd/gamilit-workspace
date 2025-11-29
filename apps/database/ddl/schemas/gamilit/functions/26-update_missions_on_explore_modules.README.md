# Función: update_missions_on_explore_modules

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/26-update_missions_on_explore_modules.sql`
**Trigger:** `apps/database/ddl/schemas/progress_tracking/triggers/30-trg_update_missions_on_explore_modules.sql`
**Schema:** `gamilit`
**Tipo:** TRIGGER FUNCTION
**Fecha de creación:** 2025-11-28

## 📋 Descripción

Actualiza automáticamente el progreso de misiones cuando un usuario explora módulos educativos. Esta función implementa el tracking de **módulos únicos visitados**, donde cada módulo solo se cuenta UNA vez, sin importar cuántas veces el usuario regrese a él.

## 🎯 Objetivo de Negocio

Gamificar la exploración de contenido educativo incentivando a los estudiantes a descubrir diferentes módulos a través de misiones como:

- **Diarias:** "Explora 3 módulos diferentes" (75 XP + 30 ML Coins)
- **Semanales:** "Explora 10 módulos esta semana" (250 XP + 100 ML Coins)
- **Especiales:** "Tour por el mundo Maya" (500 XP + 200 ML Coins)

## 🔄 Funcionamiento

### Evento Disparador

El trigger se activa en:
- **AFTER INSERT** en `progress_tracking.module_progress` (primera interacción con módulo)
- **AFTER UPDATE** en `progress_tracking.module_progress` (usuario regresa al módulo)

### Lógica de Tracking

1. **Búsqueda de misiones:**
   - Usuario activo con misiones en estado `active` o `in_progress`
   - Misiones no expiradas (`end_date > now()`)
   - Objetivos con `type = 'explore_modules'`

2. **Verificación de unicidad:**
   - Revisa si `module_id` ya está en array `modules_visited`
   - Si NO está → agrega módulo y actualiza `current`
   - Si SÍ está → no hace cambios (visitas repetidas no cuentan)

3. **Actualización de progreso:**
   - `current = cantidad de módulos únicos en modules_visited`
   - `progress = (current / target) * 100`
   - Si `progress >= 100%` → marca misión como `completed`

## 📊 Estructura de Datos

### Objetivo en JSONB

```json
{
  "type": "explore_modules",
  "target": 3,
  "current": 2,
  "description": "Explora 3 módulos diferentes",
  "modules_visited": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}
```

### Campos Importantes

- **type:** `"explore_modules"` (identifica el tipo de objetivo)
- **target:** Meta de módulos únicos a explorar
- **current:** Cantidad actual de módulos explorados
- **modules_visited:** Array de UUIDs de módulos ya visitados (como strings)

## 🆚 Diferencias con otros objetivos

| Objetivo | Lógica de Conteo | Permite Repetir |
|----------|------------------|-----------------|
| `complete_exercises` | Cuenta cada ejercicio completado | ✅ Sí |
| `explore_modules` | Cuenta módulos únicos (array tracking) | ❌ No |
| `earn_xp` | Suma XP acumulados | ✅ Sí |
| `daily_streak` | Cuenta días consecutivos | ❌ No |

## 🔒 Seguridad

- **SECURITY DEFINER:** Permite actualizar `gamification_system.missions` sin permisos directos del usuario
- **Manejo de excepciones:** Errores en una misión no afectan otras
- **No bloquea transacciones:** Errores globales solo se loggean, no bloquean INSERT/UPDATE

## ⚡ Performance

### Índices Utilizados

- `idx_missions_user_type_status` en `missions(user_id, mission_type, status)` → búsqueda eficiente
- Operador `@>` puede usar índice GIN en `objectives` (si está creado)

### Complejidad

- **Búsqueda:** O(log n) por índice
- **Iteración:** O(m × k) donde m = misiones activas, k = objetivos por misión
- **Actualización:** 1 UPDATE por misión afectada

## 📦 Dependencias

### Tablas

- `gamification_system.missions` (lectura/escritura)
- `progress_tracking.module_progress` (trigger source)
- `educational_content.modules` (referencia FK)

### Funciones

- `gamilit.now_mexico()` → timestamp en zona horaria de México

### Columnas en NEW

- `NEW.user_id` → UUID del usuario
- `NEW.module_id` → UUID del módulo explorado

## 🧪 Testing

### Script de Prueba

Ejecutar: `apps/database/ddl/schemas/gamilit/functions/26-update_missions_on_explore_modules.TEST.sql`

### Casos de Prueba

1. **Primera exploración de módulo** → `current = 1, progress = 33.33%`
2. **Segunda exploración (módulo diferente)** → `current = 2, progress = 66.67%`
3. **Visita repetida (mismo módulo)** → NO cambia `current` ni `progress`
4. **Tercera exploración (completa misión)** → `current = 3, progress = 100%, status = 'completed'`
5. **Misión sin `modules_visited`** → Inicializa array automáticamente

### Verificación Manual

```sql
-- Ver misiones con explore_modules
SELECT
    id,
    title,
    status,
    progress,
    objectives->0->'modules_visited' AS modules_visited,
    objectives->0->>'current' AS current,
    objectives->0->>'target' AS target
FROM gamification_system.missions
WHERE objectives @> '[{"type": "explore_modules"}]'::jsonb;

-- Simular exploración de módulo
INSERT INTO progress_tracking.module_progress (user_id, module_id, status)
VALUES ('your-user-id', 'some-module-id', 'in_progress');

-- Verificar actualización
SELECT * FROM gamification_system.missions WHERE user_id = 'your-user-id';
```

## 🐛 Troubleshooting

### Problema: Misión no se actualiza

**Causas posibles:**
1. Misión ya expiró (`end_date < now()`)
2. Misión no tiene objetivo `explore_modules`
3. Usuario ya visitó ese módulo (está en `modules_visited`)
4. Misión ya está en estado `completed` o `claimed`

**Solución:**
```sql
-- Verificar estado de misión
SELECT status, end_date, objectives
FROM gamification_system.missions
WHERE user_id = 'user-id';

-- Verificar logs
SELECT * FROM pg_stat_statements
WHERE query LIKE '%update_missions_on_explore_modules%';
```

### Problema: `modules_visited` es NULL

**Solución:** La función inicializa automáticamente el campo si no existe (líneas 53-58)

### Problema: Performance lenta

**Solución:** Verificar índices
```sql
-- Verificar índices en missions
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'missions' AND schemaname = 'gamification_system';

-- Crear índice GIN si no existe
CREATE INDEX idx_missions_objectives_gin
ON gamification_system.missions USING GIN (objectives);
```

## 🔗 Integración con Sistema de Misiones

Esta función es parte del **sistema de misiones multi-objetivo**:

| Objetivo | Función |
|----------|---------|
| `complete_exercises` | `update_missions_on_exercise_complete()` |
| **`explore_modules`** | **`update_missions_on_explore_modules()`** ← ESTA |
| `earn_xp` | `update_missions_on_earn_xp()` |
| `use_comodines` | `update_missions_on_use_comodines()` |
| `daily_streak` | `update_missions_on_daily_streak()` |
| `perfect_scores` | `update_missions_on_perfect_scores()` |

Cada objetivo tiene su propio trigger y función dedicada para mantener separación de responsabilidades.

## 📝 Notas de Implementación

### Por qué UUID como string en JSON?

Los UUIDs se almacenan como strings en el array `modules_visited` porque:
1. JSONB no tiene tipo UUID nativo
2. La conversión `to_jsonb(uuid::text)` es necesaria para comparación
3. El operador `@>` funciona correctamente con strings

### Por qué SECURITY DEFINER?

Permite que el trigger actualice `missions` aunque el usuario solo tenga permisos en `module_progress`. Esto mantiene la separación de permisos mientras permite la integración automática.

### Por qué no usar COUNT directo?

Usar array `modules_visited` permite:
- Auditoría de qué módulos fueron explorados
- Debugging más fácil
- Posibilidad de agregar lógica futura (ej. módulos específicos)

## 📚 Referencias

- **Plantilla:** `apps/database/ddl/schemas/gamilit/functions/17-update_missions_on_exercise_complete.sql`
- **Tabla fuente:** `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`
- **Tabla destino:** `apps/database/ddl/schemas/gamification_system/tables/06-missions.sql`

## ✅ Criterios de Aceptación

- [x] Función compila sin errores
- [x] Trigger se crea correctamente
- [x] Solo cuenta cada módulo UNA vez
- [x] Mantiene lista de `modules_visited` en objectives JSONB
- [x] `current` = cantidad de módulos únicos visitados
- [x] Recalcula `progress` correctamente
- [x] Marca como `completed` cuando `progress = 100%`
- [x] Incluye comentarios descriptivos
- [x] Usa SECURITY DEFINER
- [x] Maneja excepciones sin bloquear INSERT/UPDATE
- [x] Inicializa `modules_visited` si no existe

---

**Autor:** Database-Agent
**Versión:** 1.0.0
**Última actualización:** 2025-11-28
