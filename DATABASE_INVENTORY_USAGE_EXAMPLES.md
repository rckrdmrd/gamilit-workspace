# Ejemplos de Uso - Inventario de Base de Datos

Ejemplos prácticos de cómo usar los datos del inventario de base de datos para análisis y consultas.

## Ejemplo 1: Encontrar Todos los Triggers de un Schema

**Objetivo:** Identificar todos los triggers en el schema de gamificación

**CSV Query (Excel/Sheets):**
```
Filtrar columna "object_type" = "trigger"
Filtrar columna "schema" = "gamification_system"
```

**Resultado esperado:** 15 triggers encontrados
- trg_achievements_updated_at
- trg_comodines_inventory_updated_at
- missions_updated_at
- notifications_updated_at
- trg_recalculate_level_on_xp_change
- trg_user_ranks_updated_at
- trg_user_stats_updated_at
- ... (8 más)

## Ejemplo 2: Identificar Objetos Complejos para Documentación

**Objetivo:** Encontrar objetos que necesitan comentarios de documentación

**Criterio:** Objetos con más de 100 líneas

**SQL Query sobre CSV:**
```
SELECT object_name, schema, object_type, lines 
FROM DATABASE_INVENTORY 
WHERE lines > 100 
ORDER BY lines DESC
```

**Resultado:** ~25 objetos necesitan documentación

**Top 5 prioridades:**
1. user_stats (gamification_system) - 324 líneas - trigger
2. 01-policies (auth_management) - 305 líneas - RLS
3. 02-progress-policies (progress_tracking) - 242 líneas - RLS
4. comodines_inventory (gamification_system) - 238 líneas - trigger
5. module_progress (progress_tracking) - 232 líneas - trigger

## Ejemplo 3: Análisis de Módulo GAM (Gamificación)

**Objetivo:** Entender completamente el sistema de gamificación

**Pasos:**
1. Filtrar por module = "GAM"
2. Agrupar por object_type
3. Revisar archivos en orden

**Resultados:**

| Type | Count | Total Lines |
|------|-------|------------|
| Trigger | 15 | ~200 líneas |
| Function | 25 | ~1,000 líneas |
| Index | 4 | ~200 líneas |
| Enum | 2 | ~168 líneas |
| Materialized View | 4 | ~300 líneas |
| RLS Policies | 7 | ~800 líneas |
| Table | 13 | ~3,000 líneas |

**Archivos a revisar en orden:**
1. Tables: 13 tablas (definiciones de datos)
2. Functions: 25 funciones (lógica de negocio)
3. Triggers: 15 triggers (automatización)
4. Materialized Views: 4 vistas (reportes)
5. RLS Policies: Seguridad
6. Indexes: Optimización
7. Enums: Tipos de datos

## Ejemplo 4: Encontrar Funciones Críticas

**Objetivo:** Identificar funciones que necesitan tests unitarios

**Búsqueda:**
```
Filtrar object_type = "function"
Filtrar schema = "gamification_system" O schema = "progress_tracking" O schema = "auth_management"
Ordenar por lines DESC
```

**Funciones críticas identificadas:**

1. **award_ml_coins** - Asignar monedas a usuarios
2. **check_and_award_achievements** - Validar y otorgar logros
3. **calculate_user_rank** - Calcular rango del usuario
4. **consume_comodin** - Usar comodín
5. **process_exercise_completion** - Procesar finalización de ejercicio
6. **calculate_module_progress** - Calcular progreso del módulo
7. **get_user_progress_summary** - Resumen de progreso
8. **get_classroom_analytics** - Análisis de clase

## Ejemplo 5: Auditar Políticas RLS

**Objetivo:** Revisar todas las políticas de seguridad a nivel de fila

**Pasos:**
1. Filtrar object_type = "unknown" (RLS policies)
2. Listar por schema
3. Revisar cada archivo

**Resultados:**

| Schema | Policies | Total Lines |
|--------|----------|------------|
| gamification_system | 7 | 791 |
| auth_management | 1 | 305 |
| progress_tracking | 2 | 365 |
| educational_content | 2 | 165 |
| content_management | 1 | 119 |
| social_features | 5 | 340 |
| audit_logging | 1 | 166 |
| system_configuration | 1 | 70 |

**Total de líneas de seguridad:** 2,321 líneas

## Ejemplo 6: Optimización de Índices

**Objetivo:** Revisar estrategia de indexación

**Análisis:**

**Índices por schema:**
- public: 54 índices (mayor densidad)
- social_features: 5 índices
- gamification_system: 4 índices
- auth_management: 2 índices
- content_management: 2 índices
- progress_tracking: 2 índices

**Recomendación:** 54 índices en public pueden ser excesivos. Revisar si todos se usan.

**Verificación de índices por tipo:**
```
SELECT object_name, schema, lines
FROM DATABASE_INVENTORY
WHERE object_type = "index"
AND lines > 100
```

**Índices complejos (>100 líneas):**
- idx_user_roles_permissions_gin - 107 líneas
- idx_achievement_categories_active - 109 líneas
- idx_inventory_transactions_user - 149 líneas
- learning_sessions - 214 líneas

## Ejemplo 7: Crecimiento de la Base de Datos

**Objetivo:** Entender la escala de código SQL

**Análisis por módulo:**

| Módulo | Objetos | Líneas | Promedio |
|--------|---------|--------|----------|
| PUB | 93 | 3,200 | 34 |
| GAM | 65 | 2,400 | 37 |
| AUTH | 30 | 1,500 | 50 |
| PRG | 20 | 1,200 | 60 |
| SOC | 21 | 1,100 | 52 |
| CFG | 19 | 800 | 42 |
| EDU | 12 | 800 | 67 |
| CNT | 11 | 800 | 73 |
| AUD | 9 | 800 | 89 |
| ADM | 4 | 100 | 25 |
| STO | 1 | 50 | 50 |

**Conclusión:** Módulos EDU, CNT y AUD tienen objetos más complejos en promedio.

## Ejemplo 8: Encontrar Vistas Materializadas

**Objetivo:** Identificar qué reportes están pre-calculados

**Búsqueda:**
```
Filtrar object_type = "materialized_view"
```

**Resultados:**

1. **leaderboard_coins** - Ranking por monedas (48 líneas)
2. **leaderboard_global** - Ranking global (70 líneas)
3. **leaderboard_streaks** - Ranking por racha (49 líneas)
4. **leaderboard_xp** - Ranking por experiencia (48 líneas)
5. **mv_global_leaderboard** - Leaderboard global materializada (88 líneas)
6. **mv_classroom_leaderboard** - Leaderboard por aula (104 líneas)
7. **mv_weekly_leaderboard** - Leaderboard semanal (98 líneas)
8. **mv_mechanic_leaderboard** - Leaderboard por mecánica (111 líneas)

**Recomendación:** Implementar política de refresh para vistas materializadas (ej: cada hora).

## Ejemplo 9: Análisis de Dependencias

**Objetivo:** Encontrar objetos que pueden depender uno del otro

**Pasos:**
1. Listar todas las funciones en gamification_system
2. Buscar qué triggers las llaman
3. Buscar qué tablas modifican

**Ejemplo: award_ml_coins function**
- Ubicación: gamification_system/functions/award_ml_coins.sql
- Líneas: 92
- Uso probable: Triggers que entregan monedas
- Actualiza tabla: ml_coins_transactions

## Ejemplo 10: Comparativa con Estándares

**Objetivo:** Verificar si el código sigue convenciones de PostgreSQL

**Estándares a verificar:**

1. **Triggers con updated_at automático**
   - Esperado: Todos los triggers
   - Encontrado: 74 triggers (25.9%)
   - Status: OK

2. **Funciones con lógica reutilizable**
   - Esperado: 50-100 funciones
   - Encontrado: 60 funciones (21.1%)
   - Status: OK

3. **Índices en PKs y FKs**
   - Esperado: Todos tienen índices
   - Encontrado: 100 índices (35.1%)
   - Status: OK

4. **RLS policies en tablas sensibles**
   - Esperado: Todas las tablas de usuarios
   - Encontrado: 24 archivos RLS (8.4%)
   - Status: OK

5. **Vistas para acceso facilitado**
   - Esperado: Reportes principales
   - Encontrado: 8 vistas materializadas (2.8%)
   - Status: OK

## Comandos Útiles

### Contar objetos por tipo
```sql
SELECT object_type, COUNT(*) as count 
FROM inventory 
GROUP BY object_type 
ORDER BY count DESC
```

### Encontrar objetos por rango de líneas
```sql
SELECT object_name, lines 
FROM inventory 
WHERE lines BETWEEN 100 AND 200 
ORDER BY lines DESC
```

### Módulo con más código SQL
```sql
SELECT module, SUM(CAST(lines as INTEGER)) as total_lines, COUNT(*) as count
FROM inventory
GROUP BY module
ORDER BY total_lines DESC
```

### Objetos deprecados
```sql
SELECT object_name, schema, path
FROM inventory
WHERE path LIKE '%_deprecated%'
```

## Integración con Herramientas

### Excel/Google Sheets
1. Descargar DATABASE_INVENTORY.csv
2. Importar en Excel/Sheets
3. Usar filtros y tablas dinámicas
4. Crear gráficos de distribución

### PostgreSQL
```sql
COPY inventory FROM '/path/to/DATABASE_INVENTORY.csv' WITH CSV HEADER;
```

### Python/Pandas
```python
import pandas as pd

df = pd.read_csv('DATABASE_INVENTORY.csv')

# Filtrar por módulo
gamification = df[df['module'] == 'GAM']

# Agrupar por tipo
by_type = df.groupby('object_type').size()

# Ordenar por líneas
largest = df.nlargest(10, 'lines')
```

### SQL Server/Power BI
```sql
SELECT * FROM [DATABASE_INVENTORY.csv]
WHERE module IN ('GAM', 'AUTH', 'PRG')
```

---

**Documento generado:** 2024-11-07  
**Ejemplos proporcionados:** 10 casos de uso principales
**Integración recomendada:** CSV import
