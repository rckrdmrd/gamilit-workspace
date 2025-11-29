# Database Documentation - GAMILIT

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Última actualización:** 2025-11-29

---

## 📚 Índice de Documentación

### 🔄 CHANGELOG Oficial
**Archivo:** [`DATABASE-CHANGELOG.md`](./DATABASE-CHANGELOG.md)

Historial completo de cambios en la base de datos siguiendo formato [Keep a Changelog](https://keepachangelog.com/).

**Última versión:** [2.8.0] - 2025-11-29

**Cambios recientes:**
- ✅ [2.8.0] Trigger para actualización de user_stats desde exercise_submissions (P0)
- ✅ [2.7.0] Seeds user_achievements corregidos, trigger fn_on_achievement_unlocked
- ✅ [2.6.0] Validadores mapa_conceptual y emparejamiento
- ✅ [2.5.5] Validación de Integración Completa - Correcciones Críticas

---

### 🏗️ Arquitectura Dual de Ejercicios
**Archivo:** [`ARCHITECTURE-DUAL-EXERCISES-2025-11-24.md`](./ARCHITECTURE-DUAL-EXERCISES-2025-11-24.md)

Documentación técnica completa de la arquitectura dual que separa ejercicios autocorregibles (práctica ilimitada) de ejercicios de revisión manual (evaluación formal única).

**Contenido:**
- Flujo completo de ejercicios autocorregibles
- Anti-farming: XP solo en primer acierto
- Scripts de testing y validación
- Diagramas de arquitectura
- Referencias a código backend/database

**Migraciones relacionadas:**
- `2025-11-24-add-requires-manual-grading.sql`
- `2025-11-24-cleanup-incorrect-submissions.sql`

**Archivos backend afectados:**
- `apps/backend/src/modules/educational/entities/exercise.entity.ts:202`
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts:199-236`
- `apps/backend/src/modules/educational/controllers/exercises.controller.ts:840-938`

---

## 🗂️ Migraciones Históricas

**Ubicación:** [`../historical-migrations/`](../historical-migrations/)

Todas las migraciones SQL aplicadas al proyecto, preservadas para auditoría y rollback.

**Migraciones disponibles:**
1. `DB-125-add-pedagogical-columns.sql` (2025-11-19)
   - Agrega columnas pedagógicas a tabla `exercises`
   - Campos: objective, how_to_solve, recommended_strategy, pedagogical_notes

2. `2025-11-24-add-requires-manual-grading.sql` (2025-11-24)
   - Agrega columna `requires_manual_grading` a `exercises`
   - Clasifica 15 ejercicios existentes como autocorregibles
   - Crea índice de performance

3. `2025-11-24-cleanup-incorrect-submissions.sql` (2025-11-24)
   - Elimina 8 registros legacy incorrectos
   - Limpia `exercise_submissions` de ejercicios autocorregibles

---

## 🧪 Scripts de Testing

### Test Suite: Sistema de Reenvío de Ejercicios
**Archivo:** [`../../test-exercise-resubmission.sh`](../../test-exercise-resubmission.sh)

Script automatizado que valida la arquitectura dual de ejercicios.

**Tests incluidos:**
1. ✅ Verificar columna `requires_manual_grading` existe
2. ✅ Verificar distribución de ejercicios por tipo
3. ✅ Verificar usuario de prueba configurado
4. ✅ Listar ejercicios disponibles (Módulos 2 y 3)
5. ✅ Mostrar historial de intentos del estudiante
6. ✅ Validar integridad: 0 autocorregibles en `exercise_submissions`

**Uso:**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
chmod +x test-exercise-resubmission.sh
./test-exercise-resubmission.sh
```

**Output esperado:**
```
🧪 TEST: Sistema de Reenvío de Ejercicios
========================================
Test 1: ✅ PASSED
Test 2: ✅ PASSED (15 autocorregibles, 100%)
Test 3: ✅ PASSED (usuario de prueba OK)
Test 4: ✅ PASSED (10 ejercicios disponibles)
Test 5: ✅ PASSED (historial limpio)
Test 6: ✅ PASSED (0 registros incorrectos)
```

---

## 📊 Estado Actual del Sistema

### Estadísticas de Ejercicios

| Módulo | Total Ejercicios | XP Total | Tipo | Estado |
|--------|------------------|----------|------|--------|
| Módulo 1 | 5 | 500 XP | Autocorregible | ✅ Activo |
| Módulo 2 | 5 | 500 XP | Autocorregible | ✅ Activo |
| Módulo 3 | 5 | 500 XP | Autocorregible | ✅ Activo |
| Módulo 4 | 0 | 0 XP | - | 🚧 Pendiente |
| Módulo 5 | 0 | 0 XP | - | 🚧 Pendiente |
| **TOTAL** | **15** | **1,500 XP** | **100% autocorregibles** | - |

### Distribución de Tipos de Ejercicio

#### Módulo 1: Comprensión Literal (5 ejercicios)
- Crucigrama Científico
- Línea de Tiempo de Marie Curie
- Completar Espacios en Blanco
- Verdadero o Falso
- Sopa de Letras (BONUS)

#### Módulo 2: Comprensión Inferencial (5 ejercicios)
- Detective Textual: El Misterio de la Radiación
- Relaciones Causa-Efecto sobre Marie Curie
- Predicción Narrativa: ¿Qué Sucederá Después?
- Puzzle de Contexto
- Rueda de Inferencias: Conectando Ideas

#### Módulo 3: Comprensión Crítica (5 ejercicios)
- Tribunal de Opiniones: Evaluando Afirmaciones
- Debate Digital Estructurado
- Análisis de Fuentes Históricas sobre Marie Curie
- Creación de Podcast Argumentativo
- Matriz de Perspectivas

---

## 🏆 Sistema de Rangos Maya

### Progresión de Rangos

| Rango | XP Requerido | Módulos Completados |
|-------|--------------|---------------------|
| Ajaw | 0 XP | 0 (inicial) |
| Nacom | 500 XP | Módulo 1 completo |
| Ah K'in | 1,500 XP | Módulos 1-2 completos |
| Halach Uinic | 3,000 XP | Módulos 1-3 completos |
| K'uk'ulkan | 5,000 XP | Todos los módulos |

**Sistema de XP:**
- ✅ XP se otorga **SOLO en primer acierto** de cada ejercicio
- ✅ Reintentos permitidos pero sin XP adicional (anti-farming)
- ✅ Total XP disponible actualmente: 1,500 XP (15 ejercicios)

---

## 🔗 Referencias Técnicas

### Schemas Principales

| Schema | Propósito | Tablas Clave |
|--------|-----------|--------------|
| `auth_management` | Autenticación y perfiles | profiles, users |
| `educational_content` | Contenido educativo | modules, exercises |
| `progress_tracking` | Progreso de estudiantes | exercise_attempts, exercise_submissions, module_progress |
| `gamification_system` | Sistema de gamificación | user_stats, user_ranks, comodines_inventory |

### Funciones Críticas

| Función | Schema | Propósito |
|---------|--------|-----------|
| `initialize_user_stats()` | gamilit | Inicializa stats al crear usuario |
| `validate_and_audit()` | educational_content | Valida respuestas de ejercicios |
| `update_user_stats_on_exercise_complete()` | gamilit | Actualiza XP desde exercise_attempts |
| `update_user_stats_on_submission_graded()` | gamilit | Actualiza XP desde exercise_submissions (v2.8.0) |
| `update_missions_on_earn_xp()` | gamilit | Actualiza misiones earn_xp cuando cambia total_xp |
| `update_missions_on_exercise_complete()` | gamilit | Actualiza misiones complete_exercises |

### Triggers Activos (Sistema de Recompensas)

| Trigger | Tabla | Evento | Función |
|---------|-------|--------|---------|
| `trg_initialize_user_stats` | auth_management.profiles | AFTER INSERT | initialize_user_stats() |
| `trg_update_user_stats_on_exercise` (21) | progress_tracking.exercise_attempts | AFTER INSERT | update_user_stats_on_exercise_complete() |
| `trg_update_missions_on_exercise` (24) | progress_tracking.exercise_attempts | AFTER INSERT | update_missions_on_exercise_complete() |
| `trg_update_user_stats_on_submission` (31) | progress_tracking.exercise_submissions | AFTER UPDATE | update_user_stats_on_submission_graded() |
| `trg_update_missions_on_submission` (25) | progress_tracking.exercise_submissions | AFTER UPDATE | update_missions_on_exercise_complete() |
| `trg_update_missions_on_earn_xp` (27) | gamification_system.user_stats | AFTER UPDATE | update_missions_on_earn_xp() |

### Cadena de Triggers v2.8.0

```
FLUJO A (Autocorregibles):
exercise_attempts INSERT → trigger 21 → user_stats.total_xp → trigger 27 → misiones earn_xp

FLUJO B (Revisión Manual):
exercise_submissions UPDATE → trigger 31 → user_stats.total_xp → trigger 27 → misiones earn_xp
```

---

## 📖 Documentación Extendida

Para documentación más detallada (análisis, especificaciones técnicas, matrices de impacto), consultar:

**Ubicación:** `/orchestration/agentes/architecture-analyst/analisis-sistema-xp-rangos-2025-11-24/`

**Documentos disponibles (27,000+ palabras):**

1. **MATRIZ-IMPACTO-Y-DEPENDENCIAS.md** (9,000+ palabras)
   - Análisis exhaustivo de dependencias backend/frontend
   - Identificación de 5 conflictos críticos
   - Planes de mitigación detallados por conflicto

2. **SOLUCION-DEFINITIVA-EJERCICIOS-REENVIOS.md** (13,000+ palabras)
   - Especificación técnica completa de la arquitectura dual
   - Diagramas de flujo detallados (ASCII art)
   - Casos de uso exhaustivos con ejemplos

3. **RESUMEN-IMPLEMENTACION-2025-11-24.md**
   - Comparación antes/después de código modificado
   - Scripts de testing documentados
   - Métricas de validación post-implementación

4. **STATUS-FINAL-2025-11-24.md**
   - Estado actual completo del sistema
   - Checklist de validación (15 items)
   - Plan de testing manual paso a paso

---

## 🚨 Soporte y Troubleshooting

### Logs del Sistema

**Backend:**
```bash
tail -f /tmp/backend-test-fix.log
```

**Base de Datos:**
```bash
tail -f /var/log/postgresql/postgresql-15-main.log
```

### Validación Rápida

```sql
-- Verificar ejercicios autocorregibles
SELECT COUNT(*) FROM educational_content.exercises
WHERE requires_manual_grading = false;
-- Esperado: 15

-- Verificar integridad de datos
SELECT COUNT(*) FROM progress_tracking.exercise_submissions es
JOIN educational_content.exercises e ON e.id = es.exercise_id
WHERE e.requires_manual_grading = false;
-- Esperado: 0 (ninguno incorrecto)

-- Verificar usuario de prueba
SELECT us.total_xp, us.level, us.current_rank, us.ml_coins
FROM gamification_system.user_stats us
WHERE us.user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
```

### Contacto

**Mantenido por:** Architecture-Analyst Agent + Database-Agent
**Última revisión:** 2025-11-29
**Versión:** v2.8.0

Para reportar issues o bugs, crear un ticket en el sistema de tracking del proyecto con etiqueta `database`.

---

**Convenciones:**
- ✅ = Completado/Funcional
- 🚧 = En desarrollo
- ⚠️ = Requiere atención
- ❌ = Deprecado/Removido
