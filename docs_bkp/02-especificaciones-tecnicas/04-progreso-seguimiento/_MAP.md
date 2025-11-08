# _MAP: docs/02-especificaciones-tecnicas/04-progreso-seguimiento/

**Última actualización:** 2025-11-07
**Propósito:** Especificaciones técnicas de tracking y seguimiento de progreso
**Audiencia:** Desarrolladores Backend/Frontend, Data Engineers
**Estado:** ✅ COMPLETO (100%)

---

## 📁 Contenido de esta Carpeta

### Especificaciones Técnicas

| ID | Título | Archivo | Estado | Prioridad |
|----|--------|---------|--------|-----------|
| ET-PRG-001 | Sistema de Estados de Progreso | [ET-PRG-001-estados-progreso.md](./ET-PRG-001-estados-progreso.md) | ✅ Implementado | Alta |
| ET-PRG-002 | Análisis de Desempeño y Analytics | [ET-PRG-002-analisis-desempeno.md](./ET-PRG-002-analisis-desempeno.md) | ✅ Implementado | Alta |

**Total especificaciones:** 2/2 (100%)

---

## 🔗 Interdependencias

### Requerimientos Relacionados

**Implementa:**
- [RF-PRG-001: Estados de Progreso](../../01-requerimientos/04-progreso-seguimiento/RF-PRG-001-estados-progreso.md)

### Módulos Relacionados

**Relacionado con:**
- [Contenido Educativo](../03-contenido-educativo/) - Progreso de ejercicios
- [Gamificación](../02-gamificacion/) - XP por progreso
- [Teacher Portal](../../01-requerimientos/teacher-portal/) - Visualización de progreso

### Documentación Relacionada

**Desarrollo:**
- Backend: `apps/backend/src/modules/progress/`
- Frontend: `apps/frontend/src/features/progress/`

**Database:**
- Schema: `progress_tracking` → `apps/database/ddl/schemas/progress_tracking/`

---

## 📊 Métricas

- **Total documentos:** 2/2 (100%)
- **ETs completas:** 2
- **Cobertura implementación:** 100%
- **Estado:** ✅ COMPLETO

---

## 🎯 Especificaciones Técnicas

### ET-PRG-001: Sistema de Estados de Progreso ⭐⭐⭐⭐⭐

**Estado:** ✅ Implementado (Ejemplo completo)

**Calidad:** Excelente - Referencias completas en RF-PRG-001

**Cubre:**
- 4 estados de progreso para módulos/lecciones: `not_started`, `in_progress`, `completed`, `mastered`
- 5 estados de intentos para ejercicios: `started`, `in_progress`, `submitted`, `evaluated`, `discounted`
- Sistema de tracking jerárquico de 3 niveles: module → lesson → exercise
- Triggers PostgreSQL para propagación automática de progreso
- Cálculo automático de porcentajes de completitud
- ProgressDashboard component con visualización

**Implementación:**
- ENUMs:
  - `progress_tracking.progress_status` (4 valores)
  - `progress_tracking.attempt_status` (5 valores)
- Tablas: `module_progress`, `lesson_progress`, `exercise_attempts`
- Triggers: `fn_update_lesson_progress()`, `fn_update_module_progress()`
- Service: `apps/backend/src/modules/progress/services/progress.service.ts`
- Componentes: `apps/frontend/src/components/progress/ProgressDashboard.tsx`

### ET-PRG-002: Agregación de Progreso (Planeado)

**Deberá cubrir:**
- Progreso de módulos educativos
- Progreso de aulas (para maestros)
- Cálculo de porcentajes de completitud
- Desbloqueo progresivo de contenido

### ET-PRG-003: Sistema de Rachas (Planeado)

**Deberá cubrir:**
- Definición de "día activo"
- Algoritmo de cálculo de rachas
- Detección de riesgo de romper racha
- Notificaciones de rachas
- Recompensas por rachas

### ET-PRG-004: Analytics de Progreso (Planeado)

**Deberá cubrir:**
- Métricas por estudiante (tiempo promedio, tasa de éxito)
- Comparación con peers (anónima)
- Identificación de estudiantes en riesgo
- Predicción de rendimiento (IA)

---

## 🚀 Próximos Pasos

### Módulo Completo ✅
Todas las ETs planificadas han sido documentadas e implementadas.

### Prioridad Alta
1. [x] ~~Crear ET-PRG-001: Estados de Progreso~~ ✅ Completado
2. [x] ~~Crear ET-PRG-002: Análisis de Desempeño~~ ✅ Completado

### Futuras Extensiones (Fase 2)
3. [ ] ET-PRG-003: Sistema de Rachas Avanzado
4. [ ] ET-PRG-004: Predicción de Rendimiento (IA)
5. [ ] ET-PRG-005: Sesiones de Lectura
6. [ ] ET-PRG-006: Exportación de Datos

---

## 📚 Referencia a Implementación Existente

**Database Schema:**
- Tabla: `progress_tracking.exercise_progress`
  - Columnas: `status`, `attempts`, `time_spent`, `score`, `response_data`
- Tabla: `progress_tracking.module_progress`
- Tabla: `progress_tracking.streak_tracking`
- Tabla: `progress_tracking.reading_sessions`

**Backend Services:**
- `apps/backend/src/modules/progress/services/progress.service.ts`
- `apps/backend/src/modules/progress/services/streak.service.ts`

**Frontend Components:**
- `apps/frontend/src/features/progress/components/ProgressDashboard.tsx`
- `apps/frontend/src/features/progress/components/StreakTracker.tsx`

---

## 📖 Guía de Navegación

**Si buscas...**
- **Sistema de Estados de Progreso:** Ver [ET-PRG-001-estados-progreso.md](./ET-PRG-001-estados-progreso.md)
- **Requerimiento funcional:** Ver [RF-PRG-001](../../01-requerimientos/04-progreso-seguimiento/RF-PRG-001-estados-progreso.md)
- **Implementación backend:** Ver `apps/backend/src/modules/progress/`
- **Implementación frontend:** Ver `apps/frontend/src/components/progress/ProgressDashboard.tsx`
- **Database schema:** Ver `apps/database/ddl/schemas/progress_tracking/`
