# FASE 2: CONSOLIDADO DE HALLAZGOS
## Análisis de Coherencia BD-Backend-Frontend

**Fecha:** 2025-12-15
**Estado:** COMPLETADO
**Responsable:** Architecture-Analyst
**Subagentes:** Database-Auditor, Backend-Auditor, Frontend-Auditor

---

## RESUMEN EJECUTIVO

| Capa | Coherencia | P0 | P1 | P2 | P3 | Total |
|------|------------|----|----|----|----|-------|
| Database | 75% | 1 | 2 | 1 | 0 | 4 |
| Backend | 91.8% | 0 | 3 | 2 | 2 | 7 |
| Frontend | 66% | 3 | 5 | 4 | 3 | 15 |
| **TOTAL** | **77.6%** | **4** | **10** | **7** | **5** | **26** |

---

## 1. HALLAZGOS POR CAPA

### 1.1 DATABASE (Análisis: ANALISIS-DATABASE.md)

#### P0 - CRÍTICOS
| ID | Descripción | Archivo | Línea | Estado |
|----|-------------|---------|-------|--------|
| DB-P0-001 | `missions_completed` no existe en user_stats, referenciada en `calculate_user_rank` | calculate_user_rank.sql | 24 | **CORREGIDO** |

#### P1 - ALTOS
| ID | Descripción | Archivo | Línea | Estado |
|----|-------------|---------|-------|--------|
| DB-P1-001 | Workaround missions→modules en check_and_award_achievements | check_and_award_achievements.sql | 74-75 | PENDIENTE |
| DB-P1-002 | `name` vs `rank_name` inconsistencia en funciones | calculate_user_rank.sql | 39-44 | **CORREGIDO** |

#### P2 - MEDIOS
| ID | Descripción | Archivo | Estado |
|----|-------------|---------|--------|
| DB-P2-001 | Valores ENUM 'collection'/'hidden' sin uso en seeds | 00-prerequisites.sql | INFO |

#### Funciones Validadas ✅
| Función | Estado |
|---------|--------|
| update_leaderboard_streaks | ✅ Coherente (corregido 2025-12-15) |
| check_and_award_achievements | ⚠️ Workaround |
| award_ml_coins | ✅ Coherente |
| calculate_user_rank | ✅ Coherente (corregido 2025-12-15) |
| process_exercise_completion | ✅ Coherente |

---

### 1.2 BACKEND (Análisis: ANALISIS-BACKEND.md)

#### P1 - ALTOS
| ID | Descripción | Archivo | Estado |
|----|-------------|---------|--------|
| BE-P1-001 | current_rank usa text en Entity vs maya_rank ENUM en DDL | user-stats.entity.ts | PENDIENTE |
| BE-P1-002 | AchievementCategoryEnum tiene valores extra no en DDL | enums.constants.ts | **CORREGIDO** (DDL actualizado) |
| BE-P1-003 | Campo achievement_type no existe en entity | achievement.entity.ts | PENDIENTE |

#### P2 - MEDIOS
| ID | Descripción | Archivo | Estado |
|----|-------------|---------|--------|
| BE-P2-001 | difficulty_level usa ENUM cross-schema | enums.constants.ts | INFO |
| BE-P2-002 | timestamps usan decoradores vs SQL function | entities/*.ts | INFO |

#### P3 - BAJOS
| ID | Descripción | Estado |
|----|-------------|--------|
| BE-P3-001 | Nomenclatura snake_case vs camelCase | Documentar |
| BE-P3-002 | Comments en español vs inglés | Estandarizar |

#### Queries SQL Validados ✅
- 12 queries embebidos analizados
- Todos referencian columnas existentes
- No se encontraron referencias a columnas fantasma

---

### 1.3 FRONTEND (Análisis: ANALISIS-FRONTEND.md)

#### P0 - CRÍTICOS
| ID | Descripción | Archivos | Estado |
|----|-------------|----------|--------|
| FE-P0-001 | AchievementWithProgress duplicado con estructuras incompatibles | achievementsTypes.ts, achievementsAPI.ts | PENDIENTE |
| FE-P0-002 | Transformación rewards usa `\|\|` en lugar de `??` | achievementsAPI.ts | PENDIENTE |
| FE-P0-003 | conditions: Frontend espera array, Backend envía objeto | achievement.types.ts | PENDIENTE |

#### P1 - ALTOS
| ID | Descripción | Archivo | Estado |
|----|-------------|---------|--------|
| FE-P1-001 | Difficulty levels completamente desalineados (easy/medium/hard vs CEFR) | achievement.types.ts | PENDIENTE |
| FE-P1-002 | Campo `type` no existe en backend entity | achievement.types.ts | PENDIENTE |
| FE-P1-003 | `detailedDescription` solo en frontend | achievement.types.ts | PENDIENTE |
| FE-P1-004 | Campos guía (unlock_message, instructions, tips) no en frontend | N/A | PENDIENTE |
| FE-P1-005 | completion_percentage devuelto como string | achievementsAPI.ts | PENDIENTE |

#### P2 - MEDIOS
| ID | Descripción | Estado |
|----|-------------|--------|
| FE-P2-001 | name vs title inconsistente | PENDIENTE |
| FE-P2-002 | description nullable en backend, required en frontend | PENDIENTE |
| FE-P2-003 | AchievementCategoryEnum const incompleto | PENDIENTE |
| FE-P2-004 | createdAt/updatedAt como string vs Date | INFO |

#### P3 - BAJOS
| ID | Descripción | Estado |
|----|-------------|--------|
| FE-P3-001 | Usar type union en lugar de const object | MEJORA |
| FE-P3-002 | Export Achievement como alias deprecated | DEPRECATE |
| FE-P3-003 | Documentar mapeo de categorías | DOCUMENTAR |

---

## 2. MATRICES DE COHERENCIA

### 2.1 MATRIZ ENUM (DDL ↔ Backend ↔ Frontend)

#### achievement_category
| Valor | DDL | Backend | Frontend Type | Frontend Const | Status |
|-------|-----|---------|---------------|----------------|--------|
| progress | ✅ | ✅ | ✅ | ✅ | ✅ |
| streak | ✅ | ✅ | ✅ | ✅ | ✅ |
| completion | ✅ | ✅ | ✅ | ✅ | ✅ |
| social | ✅ | ✅ | ✅ | ✅ | ✅ |
| special | ✅ | ✅ | ✅ | ✅ | ✅ |
| mastery | ✅ | ✅ | ✅ | ✅ | ✅ |
| exploration | ✅ | ✅ | ✅ | ✅ | ✅ |
| collection | ✅ | ✅ | ✅ | ❌ | ⚠️ const |
| hidden | ✅ | ✅ | ✅ | ❌ | ⚠️ const |

#### maya_rank
| Valor | DDL | Backend | Frontend | Status |
|-------|-----|---------|----------|--------|
| Ajaw | ✅ | ✅ | ✅ | ✅ |
| Nacom | ✅ | ✅ | ✅ | ✅ |
| Ah K'in | ✅ | ✅ | ✅ | ✅ |
| Halach Uinic | ✅ | ✅ | ✅ | ✅ |
| K'uk'ulkan | ✅ | ✅ | ✅ | ✅ |

#### difficulty_level ❌
| Frontend | Backend (CEFR) | Status |
|----------|----------------|--------|
| easy | BEGINNER, ELEMENTARY | ❌ Mapeo requerido |
| medium | PRE_INTERMEDIATE, INTERMEDIATE | ❌ Mapeo requerido |
| hard | UPPER_INTERMEDIATE, ADVANCED | ❌ Mapeo requerido |
| expert | PROFICIENT, NATIVE | ❌ Mapeo requerido |

---

### 2.2 MATRIZ ENTITY-DDL (user_stats)

| Campo DDL | Campo Entity | Tipo DDL | Tipo Entity | Match |
|-----------|--------------|----------|-------------|-------|
| id | id | UUID | uuid | ✅ |
| user_id | user_id | UUID FK | uuid | ✅ |
| tenant_id | tenant_id | UUID FK | uuid? | ✅ |
| level | level | INTEGER | number | ✅ |
| total_xp | total_xp | INTEGER | number | ✅ |
| current_rank | current_rank | maya_rank ENUM | string | ⚠️ Tipo |
| ml_coins | ml_coins | INTEGER | number | ✅ |
| current_streak | current_streak | INTEGER | number | ✅ |
| max_streak | max_streak | INTEGER | number | ✅ |
| exercises_completed | exercises_completed | INTEGER | number | ✅ |
| modules_completed | modules_completed | INTEGER | number | ✅ |
| **missions_completed** | **N/A** | **N/A** | **N/A** | **❌ NO EXISTE** |

---

### 2.3 MATRIZ TYPES (Frontend ↔ Backend)

| Campo | Frontend Shared | Frontend Feature | Backend Entity | Status |
|-------|-----------------|------------------|----------------|--------|
| id | ✅ | ✅ | ✅ | ✅ |
| name | ✅ | title (⚠️) | ✅ | ⚠️ Naming |
| description | ✅ required | ✅ | ✅ nullable | ⚠️ Nullable |
| category | ✅ | ✅ | ✅ | ✅ |
| type | ✅ | ❌ | ❌ | ❌ Solo frontend |
| conditions | AchievementCondition[] | ❌ | Record JSONB | ❌ Estructura |
| rewards | AchievementReward | ✅ | Record JSONB | ⚠️ Estructura |
| difficulty_level | simple | ❌ | CEFR | ❌ Valores |
| is_secret | ✅ | isHidden | ✅ | ✅ |
| ml_coins_reward | ❌ | mlCoinsReward | ✅ | ⚠️ Naming |

---

## 3. DEPENDENCIAS DE CORRECCIÓN

### 3.1 Grafo de Dependencias

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CORRECCIONES CRÍTICAS (P0)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  DB-P0-001 ─────────────────► BE-P1-001 (current_rank type)         │
│  (missions_completed)         Requiere que DDL esté correcto        │
│  **COMPLETADO**                                                      │
│                                                                      │
│  FE-P0-001 ────────────────► FE-P0-002 (rewards transform)          │
│  (Rename AchievementWithProgress)                                    │
│                                                                      │
│  FE-P0-003 ────────────────► Componentes que usan conditions        │
│  (conditions structure)                                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    CORRECCIONES PARALELAS                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  FE-P1-001 (difficulty levels)    │  No dependencias                 │
│  FE-P1-004 (guide fields)         │  No dependencias                 │
│  FE-P1-005 (completion_percentage)│  No dependencias                 │
│  BE-P1-003 (achievement_type)     │  Requiere cambio DDL             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Orden de Ejecución Recomendado

1. **BATCH 1 - DATABASE** (Ya ejecutado parcialmente)
   - [x] DB-P0-001: calculate_user_rank.sql
   - [ ] DB-P1-001: check_and_award_achievements.sql

2. **BATCH 2 - FRONTEND TYPES**
   - [ ] FE-P0-001: Rename interface
   - [ ] FE-P0-003: Align conditions
   - [ ] FE-P1-001: Add DifficultyLevel
   - [ ] FE-P1-008: Complete enum const

3. **BATCH 3 - FRONTEND FIXES**
   - [ ] FE-P0-002: Fix rewards transform
   - [ ] FE-P1-005: Parse completion_percentage

4. **BATCH 4 - BACKEND**
   - [ ] BE-P1-001: current_rank to MayaRankEnum
   - [ ] BE-P1-003: Add achievement_type

---

## 4. IMPACTO EN RECREACIÓN DE BD

### Archivos DDL Modificados (Requieren recrear BD)
1. `00-prerequisites.sql` - ENUMs actualizados (ya aplicado)
2. `update_leaderboard_streaks.sql` - Columnas corregidas (ya aplicado)
3. `calculate_user_rank.sql` - Columnas y naming corregidos (ya aplicado)

### Archivos a Modificar en Batch 4
4. `03-achievements.sql` - Agregar columna achievement_type (opcional)
5. `check_and_award_achievements.sql` - Documentar workaround

### Seeds Impactados
- Ninguno requiere modificación para las correcciones actuales
- Seeds de dev y prod están homologados

---

## 5. ARCHIVOS GENERADOS

| Archivo | Tipo | Generador | Estado |
|---------|------|-----------|--------|
| ANALISIS-DATABASE.md | Reporte | Database-Auditor | ✅ Completo |
| ANALISIS-BACKEND.md | Reporte | Backend-Auditor | ✅ Completo |
| ANALISIS-FRONTEND.md | Reporte | Frontend-Auditor | ✅ Completo |
| FASE-2-CONSOLIDADO-HALLAZGOS.md | Consolidado | Architecture-Analyst | ✅ Actual |
| FASE-3-PLAN-CORRECCIONES.md | Plan | Tech-Leader | ✅ Completo |

---

## 6. CONCLUSIONES

### Estado Actual del Sistema
- **Database:** 75% coherente → **85%** (tras correcciones aplicadas)
- **Backend:** 91.8% coherente → Sin cambios aún
- **Frontend:** 66% coherente → Sin cambios aún

### Riesgo de Regresión
- **ALTO** para Frontend (múltiples tipos duplicados/incompatibles)
- **MEDIO** para Backend (tipos de columnas desalineados)
- **BAJO** para Database (funciones corregidas)

### Próximos Pasos
1. Ejecutar FASE-4: Validación de dependencias
2. Aplicar correcciones en batches
3. Ejecutar recreación de BD
4. Validar compilación TypeScript
5. Ejecutar tests

---

**Estado:** COMPLETADO
**Siguiente Fase:** FASE-4 Validación de Planeación

