---
id: "GAP-2"
type: "Dependency Analysis"
status: "BLOCKING"
priority: "Alta"
affects: ["US-PM-005c"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
author: "@Arquitecto-Documentacion"
---

# GAP-2: Dependencia de User Activity Tracking

## Resumen Ejecutivo

Este documento describe la dependencia critica de **US-PM-005c (Engagement Metrics)** sobre un sistema de tracking de actividad de usuarios que **no esta completamente implementado** para las necesidades especificas del Portal de Maestros.

**Estado:** BLOQUEANTE para US-PM-005c
**Impacto:** Sin el sistema de activity tracking adecuado, no se pueden calcular las metricas de engagement requeridas.

---

## 1. Descripcion del GAP

### 1.1 Contexto

US-PM-005c requiere mostrar metricas de engagement de estudiantes que incluyen:

- **Logins por dia** - Frecuencia de acceso a la plataforma
- **Tiempo en plataforma** - Minutos/horas por sesion y por semana
- **Ejercicios intentados por sesion** - Actividad de aprendizaje
- **Ultima actividad** - Timestamp del ultimo evento significativo

### 1.2 Estado Actual

El sistema cuenta con **multiples tablas de actividad parciales**, pero ninguna cubre completamente los requerimientos de engagement:

| Tabla | Schema | Proposito | Cubre Engagement? |
|-------|--------|-----------|-------------------|
| `user_activity_logs` | audit_logging | Analytics detallado de eventos | Parcial - No agrega metricas |
| `activity_log` | audit_logging | Dashboard admin, auditoria | Parcial - No tiene tiempo en sesion |
| `user_activities` | social_features | Activity feed social | No - Solo eventos publicos |
| `user_stats` | gamification_system | Stats de gamificacion | Parcial - Tiene algunos campos utiles |
| `exercise_attempts` | progress_tracking | Intentos de ejercicios | Parcial - Solo ejercicios |

### 1.3 Brecha Identificada

**Datos faltantes para calcular engagement:**

1. **Login frequency agregada** - No existe contador de logins por periodo
2. **Tiempo real en plataforma** - `session_duration` existe en `user_activity_logs` pero no se esta poblando consistentemente
3. **Agregacion por classroom** - Los logs no siempre incluyen `classroom_id`
4. **Timeline de actividad (30 dias)** - Requiere queries complejas sobre multiples tablas

---

## 2. Analisis de Datos Requeridos

### 2.1 Metricas de Engagement (segun US-PM-005c)

```typescript
// Datos requeridos por el endpoint GET /api/teacher/analytics/engagement
interface EngagementData {
  // Overall Engagement
  total_students: number;
  active_students: number;      // Logged in last 7 days
  active_rate: number;          // percentage
  avg_login_frequency: number;  // Logins per week
  avg_time_on_platform: number; // Minutes per week

  // Activity Timeline (30 days)
  activity_timeline: {
    date: string;
    logins: number;
    submissions: number;
    time_on_platform: number;
  }[];

  // Engagement Alerts
  alerts: {
    student_id: string;
    alert_type: 'no_login_7days' | 'no_submission_14days' | 'low_time';
    last_activity: string;
  }[];
}
```

### 2.2 Fuentes de Datos Existentes

#### A. user_stats (gamification_system)

**Campos utiles existentes:**
- `last_activity_at` - Ultima actividad
- `last_login_at` - Ultimo login
- `sessions_count` - Numero de sesiones totales
- `total_time_spent` - Tiempo total (interval)
- `weekly_time_spent` - Tiempo semanal (interval)
- `days_active_total` - Dias activos historicos

**Limitaciones:**
- No tiene contador de logins por periodo especifico
- No diferencia por classroom
- No tiene login_count historico

#### B. user_activity_logs (audit_logging)

**Campos utiles existentes:**
- `activity_type` - Incluye tipos relevantes (page_view, exercise_start, etc.)
- `session_id` - Para agrupar por sesion
- `session_duration` - Duracion de sesion (pero no siempre poblado)
- `classroom_id` - Para filtrar por aula
- `created_at` - Para timeline

**Limitaciones:**
- `session_duration` no se actualiza al cerrar sesion
- Requiere queries de agregacion costosos
- No tiene evento explicito de "login"

#### C. exercise_attempts (progress_tracking)

**Campos utiles existentes:**
- `submitted_at` - Timestamp de envio
- `time_spent_seconds` - Tiempo por intento

**Limitaciones:**
- Solo captura actividad de ejercicios
- No incluye navegacion general

---

## 3. Opciones de Implementacion

### 3.1 Opcion A: Nueva Tabla `user_engagement_daily`

**Descripcion:** Crear tabla de agregacion diaria pre-calculada.

```sql
-- Schema: progress_tracking
CREATE TABLE user_engagement_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_management.profiles(id),
  classroom_id UUID REFERENCES social_features.classrooms(id),
  date DATE NOT NULL,

  -- Metricas diarias
  login_count INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  exercises_attempted INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  submissions_count INTEGER DEFAULT 0,

  -- Timestamps
  first_activity_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, classroom_id, date)
);

-- Indexes
CREATE INDEX idx_engagement_daily_user ON user_engagement_daily(user_id);
CREATE INDEX idx_engagement_daily_classroom ON user_engagement_daily(classroom_id);
CREATE INDEX idx_engagement_daily_date ON user_engagement_daily(date);
CREATE INDEX idx_engagement_daily_user_date ON user_engagement_daily(user_id, date);
```

**Pros:**
- Consultas de engagement extremadamente rapidas
- Pre-calculado, no impacta performance en tiempo real
- Facil de agregar por semana/mes/classroom

**Contras:**
- Requiere job de actualizacion (cron o trigger)
- Datos no son 100% real-time
- Nueva tabla a mantener

**Esfuerzo estimado:** 2-3 SP

---

### 3.2 Opcion B: Extender `user_stats` con Campos de Engagement

**Descripcion:** Agregar campos especificos de engagement a la tabla existente.

```sql
-- Agregar a gamification_system.user_stats
ALTER TABLE gamification_system.user_stats ADD COLUMN IF NOT EXISTS
  login_count_weekly INTEGER DEFAULT 0,
  login_count_monthly INTEGER DEFAULT 0,
  last_7_days_active_count INTEGER DEFAULT 0,
  avg_session_duration_minutes NUMERIC(10,2) DEFAULT 0,
  last_weekly_reset TIMESTAMPTZ;
```

**Pros:**
- Minimo cambio estructural
- Reutiliza tabla existente
- Campos ya tienen mecanismos de update

**Contras:**
- user_stats ya tiene ~35+ columnas (riesgo de tabla "god object")
- No diferencia por classroom (solo global por usuario)
- Requiere modificar logica de actualizacion existente

**Esfuerzo estimado:** 1-2 SP

---

### 3.3 Opcion C: Queries Agregados sobre Datos Existentes

**Descripcion:** Calcular engagement en tiempo real usando datos de tablas existentes.

```typescript
// Ejemplo de query para logins (ultimos 7 dias)
const activeStudents = await this.activityLogRepo
  .createQueryBuilder('al')
  .select('COUNT(DISTINCT al.user_id)', 'count')
  .where('al.action_type = :type', { type: 'login' })
  .andWhere('al.created_at > :date', { date: sevenDaysAgo })
  .andWhere('al.user_id IN (:...studentIds)', { studentIds })
  .getRawOne();

// Ejemplo de query para timeline (30 dias)
const timeline = await this.activityLogRepo
  .createQueryBuilder('al')
  .select("DATE(al.created_at)", 'date')
  .addSelect('COUNT(*) FILTER (WHERE al.action_type = \'login\')', 'logins')
  .addSelect('COUNT(*) FILTER (WHERE al.action_type = \'exercise_complete\')', 'submissions')
  .where('al.created_at > :date', { date: thirtyDaysAgo })
  .groupBy('DATE(al.created_at)')
  .orderBy('date', 'ASC')
  .getRawMany();
```

**Pros:**
- No requiere cambios de schema
- Datos siempre actualizados
- Implementacion mas rapida

**Contras:**
- Performance potencialmente lento con muchos estudiantes
- Queries complejos y costosos
- Requiere buenos indexes (algunos ya existen)
- Cache obligatorio para evitar sobrecarga

**Esfuerzo estimado:** 1 SP (pero con limitaciones de performance)

---

## 4. Datos Existentes Aprovechables

### 4.1 De `user_stats`

| Campo | Uso para Engagement |
|-------|---------------------|
| `last_activity_at` | Detectar estudiantes inactivos |
| `last_login_at` | Alert `no_login_7days` |
| `sessions_count` | Calcular frecuencia de uso |
| `weekly_time_spent` | Tiempo en plataforma por semana |
| `exercises_completed` | Actividad de aprendizaje |
| `weekly_exercises` | Ejercicios por semana |

### 4.2 De `activity_log`

| Campo | Uso para Engagement |
|-------|---------------------|
| `action_type = 'login'` | Contar logins |
| `created_at` | Timeline de actividad |
| `user_id + created_at` | Ultimas actividades |

### 4.3 De `exercise_attempts`

| Campo | Uso para Engagement |
|-------|---------------------|
| `submitted_at` | Timeline de submissions |
| `COUNT(*)` por dia | Ejercicios intentados diarios |
| `user_id + classroom` | Actividad por aula (via joins) |

---

## 5. Dependencias de US-PM-005c

### 5.1 Dependencias Resueltas

| Dependencia | Estado | Ubicacion |
|-------------|--------|-----------|
| US-PM-001a (Classroom Management) | Implementado | teacher/classroom/ |
| US-PM-002a (Assignment Management) | Implementado | teacher/assignment/ |
| Tablas de exercise_attempts | Existe | progress_tracking schema |
| Tablas de user_stats | Existe | gamification_system schema |

### 5.2 Dependencias Bloqueantes

| Dependencia | Estado | Impacto |
|-------------|--------|---------|
| User Activity Tracking | **PARCIAL** | Bloquea calculos de engagement |
| Login event tracking | **PARCIAL** | Bloquea login frequency |
| Session duration tracking | **PARCIAL** | Bloquea time on platform |

---

## 6. Recomendacion

### Enfoque Recomendado: Opcion C (Corto Plazo) + Opcion A (Mediano Plazo)

#### Fase 1: Implementacion Inmediata (Sprint 9)

1. **Usar queries agregados (Opcion C)** con cache agresivo (TTL: 10 min)
2. **Aprovechar datos existentes** de `user_stats` y `activity_log`
3. **Agregar evento de login** a `activity_log` si no existe consistentemente
4. **Implementar cache** de engagement por classroom

**Limitaciones aceptables:**
- Datos con hasta 10 minutos de retraso (cache)
- Performance aceptable con <100 estudiantes por classroom
- Timeline simplificado (solo datos de exercise_attempts)

#### Fase 2: Optimizacion (Sprint 10+)

1. **Implementar tabla `user_engagement_daily`** (Opcion A)
2. **Crear job de agregacion nocturno**
3. **Migrar endpoint a usar tabla pre-agregada**
4. **Mantener cache como fallback**

### Justificacion

- **Opcion C primero:** Permite desbloquear US-PM-005c rapidamente sin cambios de schema
- **Opcion A despues:** Garantiza escalabilidad cuando el sistema crezca
- **No se recomienda Opcion B:** user_stats ya esta sobrecargada y no soporta diferenciacion por classroom

---

## 7. Proximos Pasos

1. [ ] **Validar disponibilidad de evento 'login'** en activity_log
2. [ ] **Crear PoC de queries agregados** con datos de prueba
3. [ ] **Medir performance** con dataset representativo
4. [ ] **Definir estrategia de cache** para engagement endpoint
5. [ ] **Crear US para tabla user_engagement_daily** (Fase 2)

---

## 8. Referencias

- **US-PM-005c:** `/docs/03-fase-extensiones/EXT-001-portal-maestros/historias-usuario/US-PM-005c-engagement-metrics.md`
- **Entity user_stats:** `/apps/backend/src/modules/gamification/entities/user-stats.entity.ts`
- **Entity user_activity_logs:** `/apps/backend/src/modules/audit/entities/user-activity-log.entity.ts`
- **Entity activity_log:** `/apps/backend/src/modules/admin/entities/activity-log.entity.ts`
- **Entity exercise_attempts:** `/apps/backend/src/modules/progress/entities/exercise-attempt.entity.ts`

---

**Autor:** @Arquitecto-Documentacion
**Ultima actualizacion:** 2026-01-20
**Version:** 1.0
