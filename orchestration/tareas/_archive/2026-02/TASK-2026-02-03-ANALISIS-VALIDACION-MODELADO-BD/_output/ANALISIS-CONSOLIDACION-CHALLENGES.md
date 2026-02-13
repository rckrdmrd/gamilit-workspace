# ANALISIS-CONSOLIDACION-CHALLENGES.md

**Sprint:** 6 | **Tarea:** 6.2
**Fecha:** 2026-02-03
**Autor:** Claude Opus 4.5
**Objetivo:** Evaluar consolidacion de tablas challenge en schema social_features

---

## 1. RESUMEN EJECUTIVO

### Hallazgo Principal

Tras analizar las tres tablas de challenges (`peer_challenges`, `team_challenges`, `team_vs_team_challenges`), la recomendacion es **KEEP SEPARATE** (mantener separadas) en lugar de consolidar. Sin embargo, se identifican oportunidades de refactorizacion menor.

### Razon Principal

Las tablas sirven propositos fundamentalmente diferentes y NO son duplicados semanticos:

| Tabla | Proposito | Tipo de Competencia |
|-------|-----------|---------------------|
| `peer_challenges` | Desafios entre individuos | Usuario vs Usuario(s) |
| `team_challenges` | Asignacion de desafios a equipos | Equipo vs Contenido |
| `team_vs_team_challenges` | Competencias entre equipos | Equipo vs Equipo |

---

## 2. INVENTARIO DE TABLAS ANALIZADAS

### 2.1 social_features.peer_challenges

**Ubicacion DDL:** `ddl/schemas/social_features/tables/11-peer_challenges.sql`

**Columnas (23):**
```
Core:
- id: UUID (PK)
- challenge_type: TEXT (head_to_head, multiplayer, tournament, leaderboard)
- created_by: UUID (FK -> profiles)
- title: TEXT
- description: TEXT

Contenido:
- module_id: UUID (FK -> modules, nullable)
- exercise_id: UUID (FK -> exercises, nullable)
- difficulty_level: ENUM

Participantes:
- max_participants: INTEGER (default 2)
- min_participants: INTEGER (default 2)
- current_participants: INTEGER (default 1)

Timing:
- start_time: TIMESTAMPTZ
- end_time: TIMESTAMPTZ
- time_limit_minutes: INTEGER
- started_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ

Estado:
- status: TEXT (open, full, in_progress, completed, cancelled, expired)

Recompensas:
- rewards: JSONB
- winner_bonus_multiplier: NUMERIC(3,2)

Configuracion:
- allow_spectators: BOOLEAN
- is_public: BOOLEAN
- requires_approval: BOOLEAN
- custom_rules: JSONB

Auditoria:
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- metadata: JSONB
```

### 2.2 social_features.team_challenges

**Ubicacion DDL:** `ddl/schemas/social_features/tables/07-team_challenges.sql`

**Columnas (7):**
```
Core:
- id: UUID (PK)
- team_id: UUID (FK -> teams)
- challenge_id: UUID (referencia a desafio externo)

Estado:
- status: VARCHAR(20) (active, in_progress, completed, failed, cancelled)

Timing:
- started_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ

Rendimiento:
- score: INTEGER
```

**Nota Importante:** Esta tabla es una TABLA DE ASIGNACION (junction table), no una tabla de definicion de desafios. Vincula equipos con desafios existentes.

### 2.3 social_features.team_vs_team_challenges

**Ubicacion DDL:** `ddl/schemas/social_features/tables/27-team_vs_team_challenges.sql`

**Columnas (42):**
```
Core:
- id: UUID (PK)
- title: VARCHAR(200)
- description: TEXT
- challenge_type: VARCHAR(50) (team_vs_team, guild_war, classroom_battle, tournament_match)

Equipo A (Retador):
- team_a_type: VARCHAR(50) (guild, classroom, team, custom)
- team_a_id: UUID (nullable)
- team_a_name: VARCHAR(100)
- team_a_members: UUID[] (array de profiles)
- team_a_captain_id: UUID (FK -> profiles)

Equipo B (Retado):
- team_b_type: VARCHAR(50)
- team_b_id: UUID (nullable)
- team_b_name: VARCHAR(100)
- team_b_members: UUID[] (array de profiles)
- team_b_captain_id: UUID (FK -> profiles)

Configuracion:
- min_team_size: INTEGER
- max_team_size: INTEGER
- exercise_ids: UUID[] (array de ejercicios)
- module_id: UUID (FK -> modules)
- time_limit_minutes: INTEGER

Scoring:
- scoring_method: VARCHAR(50)
- best_n_count: INTEGER
- rewards: JSONB

Estado:
- status: VARCHAR(50) (pending, accepted, in_progress, completed, cancelled, expired, declined)

Resultados:
- winner_team: VARCHAR(10) (a, b, draw)
- team_a_score: INTEGER
- team_b_score: INTEGER
- team_a_accuracy: NUMERIC(5,2)
- team_b_accuracy: NUMERIC(5,2)
- team_a_avg_time_seconds: INTEGER
- team_b_avg_time_seconds: INTEGER
- results_detail: JSONB

Auditoria:
- created_by: UUID (FK -> profiles)
- invitation_expires_at: TIMESTAMPTZ
- accepted_at: TIMESTAMPTZ
- starts_at: TIMESTAMPTZ
- ends_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

---

## 3. ANALISIS COMPARATIVO

### 3.1 Matriz de Columnas Comunes

| Columna | peer_challenges | team_challenges | team_vs_team_challenges |
|---------|-----------------|-----------------|-------------------------|
| id (UUID PK) | SI | SI | SI |
| title/description | SI | NO | SI |
| status | SI | SI | SI |
| started_at | SI | SI (started_at) | SI (starts_at) |
| completed_at | SI | SI | SI |
| time_limit_minutes | SI | NO | SI |
| rewards | SI (JSONB) | NO | SI (JSONB) |
| score | NO | SI | SI (por equipo) |
| created_by | SI | NO | SI |
| module_id | SI | NO | SI |
| exercise_id(s) | SI (singular) | NO | SI (array) |
| created_at | SI | NO* | SI |
| updated_at | SI | NO | SI |
| metadata | SI | NO | NO |

### 3.2 Columnas Unicas por Tabla

**peer_challenges (11 unicas):**
- challenge_type (individual-focused)
- difficulty_level
- max_participants / min_participants / current_participants
- start_time / end_time
- winner_bonus_multiplier
- allow_spectators / is_public / requires_approval
- custom_rules

**team_challenges (2 unicas):**
- team_id (FK a teams)
- challenge_id (referencia externa)

**team_vs_team_challenges (23 unicas):**
- team_a_* / team_b_* (6 campos x 2 equipos = 12)
- min_team_size / max_team_size
- scoring_method / best_n_count
- winner_team
- team_a_accuracy / team_b_accuracy
- team_a_avg_time_seconds / team_b_avg_time_seconds
- results_detail
- invitation_expires_at / accepted_at

### 3.3 Calculo de Similitud Real

**peer_challenges vs team_challenges:**
- Columnas comunes semanticas: 4 (id, status, started_at, completed_at)
- Total columnas unicas combinadas: 23 + 7 - 4 = 26
- Similitud: 4/26 = **15.4%**

**peer_challenges vs team_vs_team_challenges:**
- Columnas comunes semanticas: 9 (id, title, description, status, time_limit, rewards, created_by, module_id, completed_at)
- Total columnas unicas combinadas: 23 + 42 - 9 = 56
- Similitud: 9/56 = **16.1%**

**NOTA:** La similitud reportada de 72% en DUP-003 parece referirse a similitud CONCEPTUAL (ambas son "challenges"), no a similitud estructural real.

---

## 4. ANALISIS DE PROPOSITOS

### 4.1 peer_challenges - Desafios entre Individuos

**Proposito:** Permitir que un usuario rete a otros usuarios a competir en ejercicios educativos.

**Flujo tipico:**
1. Usuario crea challenge (creador se suma automaticamente)
2. Otros usuarios se unen (con o sin aprobacion)
3. Cuando se alcanza minimo de participantes, inicia
4. Participantes compiten (sincronicamente o async)
5. Se determinan ganadores y se distribuyen recompensas

**Tablas relacionadas:**
- `challenge_participants` - Tracking individual de cada participante
- `challenge_results` - Resultados finales y leaderboard

### 4.2 team_challenges - Asignacion de Desafios a Equipos

**Proposito:** Junction table para asignar desafios (genericos) a equipos y trackear su progreso.

**Flujo tipico:**
1. Se asigna un desafio a un equipo
2. El equipo trabaja en el desafio como unidad
3. Se trackea score y estado de completacion

**Observacion Critica:** El campo `challenge_id` referencia desafios EXTERNOS (no definidos aun en DDL). Probablemente:
- Misiones del sistema
- Modulos/ejercicios especificos
- Eventos especiales

### 4.3 team_vs_team_challenges - Competencias entre Equipos

**Proposito:** Competencias directas Equipo A vs Equipo B (tipo guild wars).

**Flujo tipico:**
1. Equipo A crea challenge y reta a Equipo B
2. Equipo B acepta o rechaza
3. Ambos equipos compiten
4. Se determinan scores por equipo y ganador

**Caracteristicas unicas:**
- Soporta multiples tipos de equipos (guilds, classrooms, ad-hoc)
- Sistema de invitacion con expiracion
- Tracking detallado por miembro (results_detail)
- Multiples metodos de scoring

---

## 5. EVALUACION DE CONSOLIDACION

### 5.1 Pros de Consolidar (MERGE)

| Pro | Impacto | Peso |
|-----|---------|------|
| Menos tablas que mantener | BAJO | 1 |
| Query unificada para "todos los challenges" | MEDIO | 2 |
| Consistencia en nomenclatura de estados | BAJO | 1 |
| Posible reduccion de codigo duplicado en backend | MEDIO | 2 |

**Score Total Pros: 6**

### 5.2 Contras de Consolidar (MERGE)

| Contra | Impacto | Peso |
|--------|---------|------|
| Tabla gigante con 50+ columnas | ALTO | 5 |
| Muchos campos NULL (segun tipo) | ALTO | 4 |
| Logica compleja de validacion condicional | ALTO | 4 |
| Queries mas complejas con discriminadores | MEDIO | 3 |
| Indices menos eficientes | MEDIO | 3 |
| team_vs_team_challenges recien creado (refactor costoso) | ALTO | 5 |
| Violacion de SRP (Single Responsibility Principle) | ALTO | 4 |
| RLS policies mas complejas | ALTO | 4 |
| Migracion de datos riesgosa | ALTO | 4 |
| Entities/DTOs combinados complejizarian backend | MEDIO | 3 |

**Score Total Contras: 39**

### 5.3 Relacion Beneficio/Costo

**Ratio: 6/39 = 0.15**

Un ratio < 1.0 indica que los costos superan significativamente los beneficios.

---

## 6. RECOMENDACION FINAL

### DECISION: KEEP SEPARATE

**Justificacion:**

1. **Propositos Diferentes:** Las tablas resuelven problemas fundamentalmente distintos:
   - `peer_challenges`: Competencia individual
   - `team_challenges`: Asignacion de tareas a equipos
   - `team_vs_team_challenges`: Competencia entre equipos

2. **Similitud Real Baja:** La similitud estructural real es ~15-16%, no 72%.

3. **Inversion Reciente:** `team_vs_team_challenges` fue creado en Sprint 5 (2026-02-03). Refactorizarlo ahora seria desperdicio.

4. **Complejidad vs Simplificacion:** Consolidar crearia una "god table" de 50+ columnas, violando principios de diseno de BD.

5. **Costo de Migracion:** Requeriria:
   - Migracion de datos
   - Cambios en 6+ entities del backend
   - Cambios en servicios y controladores
   - Actualizacion de tests
   - Riesgo de regresiones

---

## 7. ACCIONES RECOMENDADAS

### 7.1 Mantener Separadas (Sin Cambios Mayores)

Las tres tablas quedan como estan.

### 7.2 Mejoras Menores Sugeridas (Opcional)

| # | Mejora | Tabla | Impacto |
|---|--------|-------|---------|
| 1 | Agregar `created_at` y `updated_at` | team_challenges | BAJO |
| 2 | Agregar trigger `trg_team_challenges_updated_at` | team_challenges | BAJO |
| 3 | Documentar la referencia de `challenge_id` | team_challenges | BAJO |
| 4 | Crear ENUM unificado para status compartidos | Todas | MEDIO |

### 7.3 Tabla Auxiliar Propuesta (Opcional - Futuro)

Para soportar queries transversales de "todos mis challenges", considerar VIEW materializada:

```sql
CREATE MATERIALIZED VIEW social_features.all_challenges_summary AS
SELECT
    id,
    'peer' as challenge_scope,
    title,
    status,
    created_at,
    created_by as owner_id
FROM social_features.peer_challenges

UNION ALL

SELECT
    id,
    'team_vs_team' as challenge_scope,
    title,
    status,
    created_at,
    created_by as owner_id
FROM social_features.team_vs_team_challenges;

-- Note: team_challenges excluido porque es tabla de asignacion, no definicion
```

---

## 8. CONCLUSION

La recomendacion original de DUP-003 de hacer MERGE asumia una similitud de 72% que no se confirma en analisis estructural detallado. Las tablas `peer_challenges` y `team_challenges` tienen solo 15% de similitud real, y `team_vs_team_challenges` es una tabla completamente diferente diseñada para competencias entre equipos.

**Mantener separadas** es la decision correcta porque:
- Preserva la claridad semantica
- Evita "god tables"
- Respeta la inversion reciente en team_vs_team_challenges
- Minimiza riesgo de regresiones

---

## METADATA

```yaml
tarea: SPRINT-6-TASK-6.2
fecha_analisis: 2026-02-03
tablas_analizadas:
  - social_features.peer_challenges
  - social_features.team_challenges
  - social_features.team_vs_team_challenges
decision: KEEP_SEPARATE
similitud_reportada: 72%
similitud_real: 15-16%
razon_diferencia: "72% era similitud conceptual, no estructural"
proximos_pasos: "Ninguno requerido - decision de mantener status quo"
```
