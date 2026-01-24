# FASE 1: PLANEACIÓN DEL ANÁLISIS
## Análisis de Coherencia BD-Backend-Frontend

**Fecha:** 2025-12-15
**Estado:** EN PROGRESO
**Responsable:** Tech-Leader

---

## 1. OBJETIVOS DEL ANÁLISIS

### 1.1 Objetivo Principal
Identificar y documentar TODAS las discrepancias entre:
- Base de datos (DDL, funciones, seeds)
- Backend (entities, services, constants)
- Frontend (types, stores, components)

### 1.2 Objetivos Específicos
1. Validar que cada columna en DDL tenga su correspondiente campo en Entity
2. Validar que cada ENUM en DDL tenga valores idénticos en Backend y Frontend
3. Validar que las funciones SQL referencien columnas existentes
4. Validar que los seeds usen valores válidos de ENUMs y FKs existentes
5. Validar que los tipos Frontend sean compatibles con DTOs Backend

---

## 2. ALCANCE DETALLADO

### 2.1 Objetos de Base de Datos

#### Tablas Prioritarias (P0)
| Tabla | Schema | Razón |
|-------|--------|-------|
| user_stats | gamification_system | Central para achievements |
| achievements | gamification_system | Catálogo de logros |
| user_achievements | gamification_system | Logros por usuario |
| module_progress | progress_tracking | Progreso de módulos |
| exercise_attempts | progress_tracking | Intentos de ejercicios |

#### Tablas Secundarias (P1)
| Tabla | Schema | Razón |
|-------|--------|-------|
| users | auth | Usuario base |
| profiles | auth_management | Perfil extendido |
| modules | educational_content | Módulos educativos |
| exercises | educational_content | Ejercicios |
| classroom_members | social_features | Condiciones sociales |

#### ENUMs a Validar
| ENUM | Schema | Usado En |
|------|--------|----------|
| maya_rank | gamification_system | user_stats.current_rank |
| achievement_category | gamification_system | achievements.category |
| achievement_type | gamification_system | achievements DDL |
| comodin_type | gamification_system | comodines |
| progress_status | progress_tracking | module_progress, exercise_attempts |
| difficulty_level | educational_content | exercises, modules |

#### Funciones SQL Críticas
| Función | Schema | Impacto |
|---------|--------|---------|
| update_leaderboard_streaks | gamification_system | Actualiza rachas |
| check_and_award_achievements | gamification_system | Otorga logros |
| award_ml_coins | gamification_system | Otorga monedas |
| calculate_user_rank | gamification_system | Calcula rango Maya |
| process_exercise_completion | gamification_system | Procesa completado |

### 2.2 Objetos de Backend

#### Entities
| Entity | Módulo | Tabla DDL |
|--------|--------|-----------|
| UserStats | gamification | gamification_system.user_stats |
| Achievement | gamification | gamification_system.achievements |
| UserAchievement | gamification | gamification_system.user_achievements |
| ModuleProgress | progress | progress_tracking.module_progress |
| ExerciseAttempt | progress | progress_tracking.exercise_attempts |

#### Services con Queries SQL
| Service | Módulo | Queries Embebidos |
|---------|--------|-------------------|
| AchievementsService | gamification | meetsConditions(), detectAndGrantEarned() |
| ShopService | gamification | purchase(), getBalance() |
| ExerciseAttemptService | progress | updateModuleProgress(), incrementStats() |
| ExerciseSubmissionService | progress | grade(), submit() |

#### Constants
| Archivo | Contenido |
|---------|-----------|
| enums.constants.ts | Todos los ENUMs del sistema |
| database.constants.ts | Nombres de schemas y tablas |

### 2.3 Objetos de Frontend

#### Types Principales
| Archivo | Tipos |
|---------|-------|
| achievement.types.ts | Achievement, AchievementCategory, AchievementReward |
| achievementsTypes.ts | AchievementWithProgress, AchievementStats |
| userStats.types.ts | UserStats (si existe) |

#### Stores
| Store | Feature |
|-------|---------|
| achievementsStore.ts | Estado de achievements |
| ranksStore.ts | Estado de rangos |

#### API Services
| API | Endpoints |
|-----|-----------|
| achievementsAPI.ts | /achievements/* |
| ranksAPI.ts | /ranks/* |
| shopAPI.ts | /shop/* |

---

## 3. SUBAGENTES Y PROMPTS

### 3.1 Database-Auditor

**Rol:** Analizar coherencia interna de la base de datos

**Prompt:**
```
Eres un Database-Auditor especializado en PostgreSQL. Tu tarea es analizar la coherencia de los objetos DDL del proyecto GAMILIT.

CONTEXTO:
- Proyecto: GAMILIT (plataforma educativa gamificada)
- Base de datos: PostgreSQL 16
- Ubicación DDL: /home/isem/workspace/projects/gamilit/apps/database/ddl/
- Ubicación Seeds: /home/isem/workspace/projects/gamilit/apps/database/seeds/

TAREAS:
1. Para cada función SQL en gamification_system/functions/:
   - Listar todas las columnas referenciadas
   - Verificar que cada columna existe en la tabla correspondiente
   - Identificar discrepancias

2. Para cada seed en seeds/dev/gamification_system/:
   - Verificar que los valores de ENUMs son válidos
   - Verificar que las FKs referencian registros existentes
   - Identificar UUIDs hardcodeados que podrían no existir

3. Para cada trigger:
   - Verificar que la tabla existe
   - Verificar que las columnas referenciadas existen

ENTREGABLES:
- MATRIZ-FUNCTIONS-COLUMNS.md: Tabla función → columnas referenciadas → existe (sí/no)
- MATRIZ-SEEDS-VALIDATION.md: Validación de seeds
- LISTA-DISCREPANCIAS-DDL.md: Lista priorizada de problemas

CRITERIOS DE SEVERIDAD:
- P0: Columna/tabla referenciada no existe (error en runtime)
- P1: Valor ENUM inválido (error en insert)
- P2: FK a registro que podría no existir
- P3: Nomenclatura inconsistente
```

### 3.2 Backend-Auditor

**Rol:** Analizar coherencia entre Entities y DDL, y queries embebidos

**Prompt:**
```
Eres un Backend-Auditor especializado en NestJS y TypeORM. Tu tarea es analizar la coherencia entre las Entities del backend y el DDL de base de datos.

CONTEXTO:
- Proyecto: GAMILIT (plataforma educativa gamificada)
- Framework: NestJS con TypeORM
- Ubicación Entities: /home/isem/workspace/projects/gamilit/apps/backend/src/modules/*/entities/
- Ubicación Services: /home/isem/workspace/projects/gamilit/apps/backend/src/modules/*/services/
- Ubicación Constants: /home/isem/workspace/projects/gamilit/apps/backend/src/shared/constants/

TAREAS:
1. Para cada Entity en módulos gamification y progress:
   - Comparar cada @Column con la columna DDL correspondiente
   - Verificar: nombre, tipo, nullable, default
   - Identificar campos faltantes en Entity o DDL

2. Para cada Service que tenga queries SQL embebidos:
   - Extraer todas las queries raw SQL
   - Listar columnas/tablas referenciadas
   - Verificar existencia en DDL

3. Para ENUMs en enums.constants.ts:
   - Comparar valores con ENUM DDL correspondiente
   - Identificar valores faltantes o extras

ENTREGABLES:
- MATRIZ-ENTITY-DDL.md: Comparación campo por campo
- MATRIZ-QUERIES-VALIDATION.md: Validación de queries embebidos
- MATRIZ-ENUMS-BACKEND.md: Comparación ENUMs
- LISTA-DISCREPANCIAS-BACKEND.md: Lista priorizada de problemas

CRITERIOS DE SEVERIDAD:
- P0: Campo en Entity no existe en DDL (error en runtime)
- P1: Tipo incorrecto (posible pérdida de datos)
- P2: Nullable incorrecto (posible error en insert)
- P3: Default diferente (comportamiento inesperado)
```

### 3.3 Frontend-Auditor

**Rol:** Analizar coherencia entre Types Frontend y DTOs/Entities Backend

**Prompt:**
```
Eres un Frontend-Auditor especializado en React y TypeScript. Tu tarea es analizar la coherencia entre los tipos del frontend y el backend.

CONTEXTO:
- Proyecto: GAMILIT (plataforma educativa gamificada)
- Framework: React con TypeScript
- Ubicación Types: /home/isem/workspace/projects/gamilit/apps/frontend/src/shared/types/
- Ubicación Feature Types: /home/isem/workspace/projects/gamilit/apps/frontend/src/features/*/types/
- Ubicación API Services: /home/isem/workspace/projects/gamilit/apps/frontend/src/features/*/api/

TAREAS:
1. Para tipos en achievement.types.ts y achievementsTypes.ts:
   - Comparar interfaces con Entity Achievement del backend
   - Verificar que AchievementCategory tiene mismos valores que ENUM backend
   - Identificar campos faltantes o extras

2. Para API services:
   - Verificar que los endpoints llamados existen en backend
   - Verificar que los tipos de request/response coinciden

3. Identificar tipos duplicados o conflictivos entre archivos

ENTREGABLES:
- MATRIZ-TYPES-ENTITY.md: Comparación tipos frontend vs entities backend
- MATRIZ-API-CONTRACTS.md: Validación de contratos API
- LISTA-DISCREPANCIAS-FRONTEND.md: Lista priorizada de problemas

CRITERIOS DE SEVERIDAD:
- P0: Tipo referencia campo que no existe en backend
- P1: Tipo union tiene valores que no existen en ENUM backend
- P2: Campo opcional en frontend pero required en backend
- P3: Nomenclatura diferente (camelCase vs snake_case)
```

### 3.4 Architecture-Analyst

**Rol:** Análisis cross-capa y validación de dependencias

**Prompt:**
```
Eres un Architecture-Analyst especializado en sistemas full-stack. Tu tarea es analizar las dependencias entre capas y validar la integridad del sistema.

CONTEXTO:
- Proyecto: GAMILIT (plataforma educativa gamificada)
- Capas: PostgreSQL → NestJS → React
- Reportes de otros auditores ya disponibles

TAREAS:
1. Consolidar hallazgos de Database-Auditor, Backend-Auditor y Frontend-Auditor

2. Identificar dependencias transitivas:
   - Si se corrige X en DDL, ¿qué entities/types deben actualizarse?
   - Si se agrega valor a ENUM, ¿dónde más debe agregarse?

3. Crear grafo de dependencias de correcciones:
   - ¿Qué correcciones deben ir primero?
   - ¿Hay ciclos de dependencias?

4. Identificar gaps no cubiertos por otros auditores

ENTREGABLES:
- CONSOLIDADO-HALLAZGOS.md: Todos los hallazgos unificados
- GRAFO-DEPENDENCIAS.md: Dependencias entre correcciones
- ORDEN-CORRECCION.md: Secuencia ordenada de correcciones
- GAPS-IDENTIFICADOS.md: Áreas no cubiertas

CRITERIOS:
- Priorizar por impacto en runtime
- Agrupar correcciones relacionadas
- Minimizar cantidad de deploys necesarios
```

---

## 4. FORMATO DE MATRICES

### 4.1 MATRIZ-ENTITY-DDL (Ejemplo)
```markdown
| Entity Field | DDL Column | Entity Type | DDL Type | Nullable (E/D) | Default (E/D) | Status |
|--------------|------------|-------------|----------|----------------|---------------|--------|
| user_id | user_id | uuid | uuid | false/NOT NULL | - | ✅ |
| current_rank | current_rank | text | maya_rank ENUM | true/NULL | 'Ajaw' | ⚠️ Tipo |
```

### 4.2 MATRIZ-ENUM-ALIGNMENT (Ejemplo)
```markdown
| Valor | DDL ENUM | Backend Enum | Frontend Type | Status |
|-------|----------|--------------|---------------|--------|
| progress | ✅ | ✅ | ✅ | ✅ |
| collection | ❌ | ❌ | ✅ | ⚠️ Frontend extra |
```

### 4.3 LISTA-DISCREPANCIAS (Ejemplo)
```yaml
discrepancias:
  - id: DISC-001
    severidad: P0
    capa: database
    objeto: update_leaderboard_streaks
    problema: "Referencia columna last_activity_date que no existe"
    columna_esperada: last_activity_at
    accion: "Cambiar referencia en función SQL"
```

---

## 5. CRITERIOS DE ACEPTACIÓN FASE 1

- [x] Alcance documentado (tablas, entities, types)
- [x] Subagentes definidos con prompts específicos
- [x] Formato de entregables establecido
- [x] Criterios de severidad definidos
- [ ] Revisión y aprobación del plan

---

## 6. PRÓXIMOS PASOS

1. **Aprobar Plan:** Confirmar que el alcance y criterios son correctos
2. **Ejecutar Fase 2:** Lanzar subagentes en paralelo para análisis
3. **Consolidar:** Architecture-Analyst consolida hallazgos

---

**Estado:** LISTO PARA APROBACIÓN
**Siguiente Fase:** FASE 2 - Ejecución del Análisis
