# _MAP: docs/01-requerimientos/04-progreso-seguimiento/

**Última actualización:** 2025-11-07
**Propósito:** Requerimientos funcionales del sistema de tracking y seguimiento de progreso estudiantil
**Audiencia:** Product Owners, Desarrolladores Backend/Frontend, Data Analysts
**Estado:** ✅ COMPLETO (100%)

---

## 📁 Contenido de esta Carpeta

### Requerimientos Funcionales

| ID | Título | Archivo | Estado | Prioridad |
|----|--------|---------|--------|-----------|
| RF-PRG-001 | Estados de Progreso de Ejercicios | [RF-PRG-001-estados-progreso.md](./RF-PRG-001-estados-progreso.md) | ✅ Implementado | Alta |
| RF-PRG-002 | Análisis de Desempeño y Analytics | [RF-PRG-002-analisis-desempeno.md](./RF-PRG-002-analisis-desempeno.md) | ✅ Implementado | Alta |

**Total requerimientos:** 2/2 (100%)

---

## 🔗 Interdependencias

### Módulos Relacionados

**Depende de:**
- [01-autenticacion-autorizacion](../01-autenticacion-autorizacion/) - Identificación de usuarios
- [03-contenido-educativo](../03-contenido-educativo/) - Ejercicios que se completan
- [02-gamificacion](../02-gamificacion/) - Otorgamiento de XP por progreso

**Usado por:**
- [Teacher Portal](../teacher-portal/) - Visualización de progreso de estudiantes
- [Admin Portal](../admin-portal/) - Analytics y reportes
- Portal de Estudiantes - Visualización de progreso propio

### Documentación Relacionada

**Especificaciones Técnicas:**
- [ET-PRG-*](../../02-especificaciones-tecnicas/04-progreso-seguimiento/) - Specs técnicas de progreso

**Desarrollo:**
- Backend: `apps/backend/src/modules/progress/`
- Frontend: `apps/frontend/src/features/progress/`

**Database:**
- Schema: `progress_tracking` → `apps/database/ddl/schemas/progress_tracking/`
- Tablas clave:
  - `progress_tracking.exercise_progress` - Progreso de ejercicios
  - `progress_tracking.module_progress` - Progreso de módulos
  - `progress_tracking.reading_sessions` - Sesiones de lectura
  - `progress_tracking.streak_tracking` - Tracking de rachas

---

## 📊 Métricas

- **Total documentos:** 2/2 (100%)
- **RFs completos:** 2
- **Cobertura implementación:** 100%
- **Estado:** ✅ COMPLETO

---

## 🎯 Funcionalidades Clave

### 1. Estados de Progreso (RF-PRG-001)

**Estados de ejercicios:**
- `not_started` - No iniciado
- `in_progress` - En progreso (guardado parcial)
- `completed` - Completado correctamente
- `failed` - Fallido (intentos agotados)
- `pending_review` - Pendiente de revisión manual

**Tracking:**
- Intentos realizados
- Tiempo invertido
- Respuestas guardadas (draft)
- Porcentaje de completitud
- Puntaje obtenido

### 2. Progreso de Módulos (Planeado)
- Estado agregado de ejercicios del módulo
- Porcentaje de completitud
- Desbloqueo progresivo de contenido

### 3. Rachas (Streaks) (Implementado)
- Días consecutivos de actividad
- Recompensas por rachas
- Notificaciones de riesgo de romper racha

---

## 🚀 Próximos Pasos

### Módulo Completo ✅
Todos los RFs planificados han sido documentados e implementados.

### Planeado (Futuras Extensiones - Fase 2)
- [ ] RF-PRG-003: Sistema de Adaptabilidad (ajustar dificultad según progreso)
- [ ] RF-PRG-004: Predicción de Rendimiento con IA
- [ ] RF-PRG-005: Recomendaciones Personalizadas
- [ ] RF-PRG-006: Comparación con Peers (anónima)

---

## ⚠️ Issues Conocidos

- [ ] **RF-PRG-001** - Falta sección de referencias a implementación

---

## 📚 Guía de Navegación

**Si buscas...**
- **Estados de progreso:** Ver [RF-PRG-001-estados-progreso.md](./RF-PRG-001-estados-progreso.md)
- **Implementación backend:** Ver `apps/backend/src/modules/progress/` (agregar referencias)
- **Implementación frontend:** Ver `apps/frontend/src/features/progress/` (agregar referencias)
- **Database schema:** Ver `apps/database/ddl/schemas/progress_tracking/`
