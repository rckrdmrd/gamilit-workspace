# _MAP: docs/02-especificaciones-tecnicas/03-contenido-educativo/

**Última actualización:** 2025-11-07
**Propósito:** Especificaciones técnicas de contenido educativo (ejercicios, mecánicas, validaciones)
**Audiencia:** Desarrolladores Backend/Frontend, Diseñadores Instruccionales
**Estado:** ✅ COMPLETO (100%)

---

## 📁 Contenido de esta Carpeta

### Especificaciones Técnicas

| ID | Título | Archivo | Estado | Prioridad |
|----|--------|---------|--------|-----------|
| ET-EDU-001 | Sistema de Mecánicas de Ejercicios | [ET-EDU-001-mecanicas-ejercicios.md](./ET-EDU-001-mecanicas-ejercicios.md) | ✅ Implementado | Alta |
| ET-EDU-002 | Niveles de Dificultad Progresiva | [ET-EDU-002-niveles-dificultad.md](./ET-EDU-002-niveles-dificultad.md) | ✅ Implementado | Alta |
| ET-EDU-003 | Taxonomía de Bloom - Clasificación Cognitiva | [ET-EDU-003-taxonomia-bloom.md](./ET-EDU-003-taxonomia-bloom.md) | ✅ Implementado | Alta |

**Total especificaciones:** 3/3 (100%)

---

## 🔗 Interdependencias

### Requerimientos Relacionados

**Implementa:**
- [RF-EDU-001: Mecánicas de Ejercicios](../../01-requerimientos/03-contenido-educativo/RF-EDU-001-mecanicas-ejercicios.md)
- [RF-EDU-002: Niveles de Dificultad](../../01-requerimientos/03-contenido-educativo/RF-EDU-002-niveles-dificultad.md)
- [RF-EDU-003: Taxonomía de Bloom](../../01-requerimientos/03-contenido-educativo/RF-EDU-003-taxonomia-bloom.md)

### Módulos Relacionados

**Relacionado con:**
- [Mecánicas](../../01-requerimientos/modulos/) - 27 mecánicas documentadas
- [Gamificación](../02-gamificacion/) - Recompensas por completar ejercicios
- [Progreso](../04-progreso-seguimiento/) - Tracking de ejercicios completados

### Documentación Relacionada

**Desarrollo:**
- Backend: `apps/backend/src/modules/educational/`
- Frontend: `apps/frontend/src/components/mechanics/`

**Database:**
- Schema: `educational_content` → `apps/database/ddl/schemas/educational_content/`

---

## 📊 Métricas

- **Total documentos:** 3/3 (100%)
- **ETs completas:** 3
- **Cobertura implementación:** 100%
- **Estado:** ✅ COMPLETO

---

## 🎯 Especificaciones Técnicas

### ET-EDU-001: Sistema de Mecánicas de Ejercicios ⭐⭐⭐⭐⭐

**Estado:** ✅ Implementado (Ejemplo completo)

**Calidad:** Excelente - Referencias completas en RF-EDU-001

**Cubre:**
- 31 mecánicas de ejercicios organizadas en 7 categorías
- Factory Pattern para validators por mecánica
- Sistema de validación extensible con interfaces comunes
- ExerciseRenderer component con renderizado dinámico
- Schema JSONB de configuración por mecánica
- Scoring engine (correcto/incorrecto/parcial)
- SQL function: `validate_exercise_structure()`

**Implementación:**
- ENUM: `apps/database/ddl/schemas/educational_content/enums/exercise_mechanic.sql:1-37` (`exercise_mechanic`)
- Tabla: `educational_content.exercises` con columna `mechanic_config` (JSONB)
- Factory: `ExerciseValidatorFactory` con 31 validators
- Service: `apps/backend/src/modules/educational/services/exercise.service.ts`
- Componentes: `apps/frontend/src/components/exercises/ExerciseRenderer.tsx`

### ET-EDU-002: Niveles de Dificultad Progresiva ⭐⭐⭐⭐⭐

**Estado:** ✅ Implementado

**Calidad:** Excelente - Referencias completas en RF-EDU-002

**Cubre:**
- ENUM `difficulty_level` con 8 niveles (Beginner → Native)
- Tabla `difficulty_criteria` con configuración por nivel
- Tabla `user_difficulty_progress` con tracking de progreso
- Función `check_difficulty_promotion_eligibility()` para validación
- Función `promote_user_difficulty_level()` para promoción automática
- Placement tests para ubicación inicial
- Backend service con analytics por nivel
- Frontend dashboard con progreso visual

**Implementación:**
- ENUM: `educational_content.difficulty_level` (8 valores)
- Tablas: `difficulty_criteria`, `user_difficulty_progress`, `user_current_level`
- Service: `DifficultyProgressService`
- Component: `DifficultyProgressDashboard.tsx`

### ET-EDU-003: Taxonomía de Bloom ⭐⭐⭐⭐⭐

**Estado:** ✅ Implementado

**Calidad:** Excelente - Referencias completas en RF-EDU-003

**Cubre:**
- ENUM `bloom_level` con 6 niveles cognitivos (Remember → Create)
- Tabla `cognitive_performance` con desempeño por nivel cognitivo
- Función `get_cognitive_profile()` con análisis LOTS/MOTS/HOTS
- Función `get_weak_cognitive_levels()` para identificar áreas débiles
- Sistema de recomendaciones basado en perfil cognitivo
- Achievements específicos por nivel cognitivo
- Filtrado de ejercicios por nivel cognitivo
- Backend service con analytics cognitivos

**Implementación:**
- ENUM: `educational_content.bloom_level` (6 valores)
- Tabla: `cognitive_performance`
- Service: `CognitiveAnalyticsService`
- Component: `CognitiveProfileDashboard.tsx`
- Component: `BloomLevelFilter.tsx`

---

## 🚀 Próximos Pasos

### Módulo Completo ✅
Todas las ETs planificadas han sido documentadas e implementadas.

### Prioridad Alta
1. [x] ~~ET-EDU-001: Arquitectura de Mecánicas~~ ✅ Completado
2. [x] ~~ET-EDU-002: Niveles de Dificultad~~ ✅ Completado
3. [x] ~~ET-EDU-003: Taxonomía de Bloom~~ ✅ Completado

### Futuras Extensiones (Fase 2)
4. [ ] ET-EDU-004: Validators Detallados por Mecánica (deep-dive en 31 validators)
5. [ ] ET-EDU-005: Esquemas JSON de Mecánicas
6. [ ] ET-EDU-006: Sistema de Hints Inteligentes
7. [ ] ET-EDU-007: Retroalimentación Adaptativa con IA

---

## 📚 Referencia a Implementación Existente

Aunque no hay documentos ET, el código está implementado:

**Backend Validators:**
- `apps/backend/src/modules/educational/validators/seleccion-unica.validator.ts`
- `apps/backend/src/modules/educational/validators/emparejamiento.validator.ts`
- (... 27 validators en total)

**Frontend Components:**
- `apps/frontend/src/components/mechanics/SelectionMechanic.tsx`
- `apps/frontend/src/components/mechanics/DragDropMechanic.tsx`
- (... 27 componentes en total)

**Database Schema:**
- Tabla: `educational_content.exercises`
- Columna: `mechanic_type` (ENUM con 27 valores)
- Columna: `mechanic_config` (JSONB con configuración específica)

---

## 🎮 Las 27 Mecánicas Implementadas

Ver documentación detallada en:
- [Mecánicas](../../01-requerimientos/modulos/MODULOS-EDUCATIVOS.md)

**Resumen por módulo:**
1. Comprensión Literal: 6 mecánicas
2. Comprensión Inferencial: 5 mecánicas
3. Comprensión Crítica: 4 mecánicas
4. Lectura Digital: 6 mecánicas
5. Producción de Textos: 6 mecánicas

---

## 📖 Guía de Navegación

**Si buscas...**
- **Sistema de Mecánicas:** Ver [ET-EDU-001-mecanicas-ejercicios.md](./ET-EDU-001-mecanicas-ejercicios.md)
- **Mecánicas detalladas (RF):** Ver [RF-EDU-001](../../01-requerimientos/03-contenido-educativo/RF-EDU-001-mecanicas-ejercicios.md)
- **Implementación validators:** Ver `apps/backend/src/modules/educational/validators/`
- **Implementación componentes:** Ver `apps/frontend/src/components/exercises/ExerciseRenderer.tsx`
- **Database schema:** Ver `apps/database/ddl/schemas/educational_content/`
