# REPORTE-ANOMALIAS.md
# TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS - Fase 3

**Fecha:** 2026-02-02
**Autor:** Arquitecto de Datos / Lead DBA
**Estado:** COMPLETADO

---

## Resumen Ejecutivo

La Fase 3 (Detección de Anomalías) ha completado el análisis exhaustivo de:
- **119 funciones** (14 deprecated identificadas)
- **58 triggers** (8 cascadas, 2 candidatos a consolidación)
- **140 tablas** (4 redundancias críticas detectadas)

### Hallazgos por Severidad

| Severidad | Cantidad | Acción Requerida |
|-----------|----------|------------------|
| CRÍTICA | 4 | Consolidación inmediata |
| ALTA | 3 | Plan de migración |
| MEDIA | 5 | Refactorización planificada |
| BAJA | 6 | Mejora continua |

---

## 1. ANÁLISIS DE FUNCIONES

### 1.1 Funciones Deprecadas (14 archivos)

**Ubicación:** `apps/database/ddl/schemas/*/functions/_deprecated/`

| Schema | Función | Razón Deprecación | Acción |
|--------|---------|-------------------|--------|
| activities | calculate_activity_score_v1 | Reemplazada por v2 | ELIMINAR |
| activities | validate_submission_v1 | Reemplazada por unified | ELIMINAR |
| content | process_content_v1 | Refactorizada | ELIMINAR |
| gamification | award_points_legacy | Nueva arquitectura | ELIMINAR |
| gamification | calculate_rank_v1 | Maya system v2 | ELIMINAR |
| gamification | check_achievements_v1 | Optimizada v2 | ELIMINAR |
| gamification | grant_coins_v1 | ML Coins system | ELIMINAR |
| missions | check_daily_v1 | Unificada en check_mission_completion | ELIMINAR |
| missions | check_weekly_v1 | Unificada | ELIMINAR |
| missions | check_monthly_v1 | Unificada | ELIMINAR |
| missions | check_special_v1 | Unificada | ELIMINAR |
| missions | check_guild_v1 | Unificada | ELIMINAR |
| missions | check_challenge_v1 | Unificada | ELIMINAR |
| missions | check_event_v1 | Unificada | ELIMINAR |

**Recomendación:** Crear script de limpieza `cleanup-deprecated-functions.sql`

### 1.2 Refactorizaciones Exitosas

**Sistema de Misiones:**
- **Antes:** 8 funciones separadas (check_daily_v1, check_weekly_v1, etc.)
- **Después:** 1 función unificada `check_mission_completion(mission_type, user_id)`
- **Beneficio:** Reducción 87.5% en código, mantenimiento simplificado

**Sistema de Validación:**
- `is_super_admin()` es alias intencional de `has_admin_role()` para legacy compatibility
- Documentado en código, no es duplicación

### 1.3 Funciones por Schema (Distribución)

| Schema | Count | % del Total |
|--------|-------|-------------|
| gamification | 28 | 23.5% |
| activities | 22 | 18.5% |
| content | 18 | 15.1% |
| missions | 14 | 11.8% |
| social | 12 | 10.1% |
| users | 10 | 8.4% |
| auth | 8 | 6.7% |
| Otros | 7 | 5.9% |

---

## 2. ANÁLISIS DE TRIGGERS

### 2.1 Cascada de Triggers en exercise_submissions (ALERTA)

**Severidad:** MEDIA-ALTA (Performance)

**8 triggers activos en secuencia:**

| Orden | Trigger | Función | Tiempo Est. |
|-------|---------|---------|-------------|
| 1 | trg_validate_submission | validate_submission() | 5ms |
| 2 | trg_calculate_score | calculate_exercise_score() | 10ms |
| 3 | trg_award_points | award_gamification_points() | 8ms |
| 4 | trg_check_achievements | check_achievements() | 15ms |
| 5 | trg_update_progress | update_user_progress() | 5ms |
| 6 | trg_check_missions | check_mission_progress() | 12ms |
| 7 | trg_notify_completion | send_completion_notification() | 3ms |
| 8 | trg_update_leaderboard | update_leaderboard_cache() | 8ms |

**Tiempo total estimado:** ~66ms por submission

**Recomendación:**
1. Consolidar triggers 3-6 en función batch `process_submission_gamification()`
2. Mover triggers 7-8 a queue asíncrona (Redis/background job)
3. **Meta:** Reducir a <20ms por submission

### 2.2 Candidatos a Consolidación

#### 2.2.1 Triggers de Manual Review (Consolidar)

**Archivos:**
- `16-validate_manual_review.sql`
- `17-validate_manual_review_update.sql`

**Problema:** Lógica duplicada entre INSERT y UPDATE

**Solución:** Consolidar en un solo trigger con `TG_OP` check:
```sql
CREATE TRIGGER trg_validate_manual_review
AFTER INSERT OR UPDATE ON manual_reviews
FOR EACH ROW
EXECUTE FUNCTION validate_manual_review();
```

#### 2.2.2 Triggers ensure_profile_name (Consolidar)

**Ubicaciones:**
- `users.user_profiles` - ensure_profile_name
- `users.student_profiles` - ensure_student_name

**Problema:** Lógica casi idéntica en dos tablas

**Solución:** Función genérica parametrizada

### 2.3 Arquitectura Saludable

- Naming convention consistente: `trg_<action>_<entity>`
- Funciones separadas de triggers (buena práctica)
- Transaccionalidad correcta
- No hay triggers recursivos detectados

---

## 3. ANÁLISIS DE TABLAS

### 3.1 Redundancias Críticas (P0)

#### 3.1.1 Tablas de Actividad/Auditoría (75-85% overlap)

| Tabla | Schema | Propósito | Campos |
|-------|--------|-----------|--------|
| activity_logs | activities | Log de actividades usuario | 12 |
| user_activity_history | users | Historial de actividad | 11 |
| audit_logs | admin | Auditoría sistema | 14 |
| system_events | config | Eventos del sistema | 10 |

**Overlap detectado:**
- user_id, action_type, timestamp: 100%
- entity_type, entity_id: 85%
- metadata/details JSONB: 75%

**Recomendación:**
```
CONSOLIDAR EN:
├── audit.activity_logs (actividad usuario - retención 90 días)
├── audit.system_logs (eventos sistema - retención 1 año)
└── audit.admin_logs (acciones admin - retención perpetua)
```

#### 3.1.2 Comodin Tracking Duplicado

| Tabla | Schema | Uso |
|-------|--------|-----|
| comodin_usage | gamification | Uso de comodines por usuario |
| user_comodins | users | Inventario de comodines |
| comodin_transactions | economy | Historial de transacciones |

**Problema:** `comodin_usage` y `comodin_transactions` tienen 80% overlap

**Solución:** Consolidar en `economy.comodin_ledger` con tipo de operación

#### 3.1.3 Notification Settings Triplicada

| Tabla | Schema | Propósito |
|-------|--------|-----------|
| notification_preferences | notifications | Preferencias globales |
| user_notification_settings | users | Settings por usuario |
| email_preferences | notifications | Preferencias email |

**Solución:** Consolidar en `users.notification_preferences` con estructura:
```yaml
preferences:
  email: {enabled, frequency, types[]}
  push: {enabled, types[]}
  in_app: {enabled, types[]}
```

### 3.2 Redundancias Altas (P1)

#### 3.2.1 user_current_level vs user_difficulty_progress

| Tabla | Campos Únicos | Overlap |
|-------|--------------|---------|
| user_current_level | current_level, last_level_change | 60% |
| user_difficulty_progress | difficulty_history[], progress_by_difficulty | 40% |

**Análisis:** `current_level` puede derivarse de `difficulty_progress`

**Recomendación:**
- Mantener `user_difficulty_progress` como SSOT
- Crear vista materializada `mv_user_current_levels`
- Deprecar `user_current_level` tabla

### 3.3 Tablas Sin User Story Asignada (20)

Identificadas en MATRIZ-TRAZABILIDAD:
- 12 tablas de configuración/lookup → Justificadas (infraestructura)
- 5 tablas de auditoría → Justificadas (logging)
- 3 tablas de cache/materialized → Justificadas (performance)

**Conclusión:** 100% justificadas, no son huérfanas reales

---

## 4. PLAN DE REMEDIACIÓN

### 4.1 Acciones Inmediatas (P0 - Esta semana)

| ID | Acción | Impacto | Esfuerzo |
|----|--------|---------|----------|
| REM-001 | Eliminar 14 funciones deprecated | Bajo | 1h |
| REM-002 | Consolidar triggers manual_review | Bajo | 2h |
| REM-003 | Documentar cascada exercise_submissions | Ninguno | 1h |

### 4.2 Acciones Corto Plazo (P1 - 2 semanas)

| ID | Acción | Impacto | Esfuerzo |
|----|--------|---------|----------|
| REM-004 | Consolidar activity/audit tables | Medio | 8h |
| REM-005 | Unificar comodin tracking | Medio | 4h |
| REM-006 | Consolidar notification settings | Bajo | 3h |

### 4.3 Acciones Mediano Plazo (P2 - 1 mes)

| ID | Acción | Impacto | Esfuerzo |
|----|--------|---------|----------|
| REM-007 | Optimizar cascada triggers submissions | Alto | 16h |
| REM-008 | Migrar user_current_level a vista | Medio | 6h |
| REM-009 | Crear queue asíncrona para notificaciones | Alto | 20h |

---

## 5. MÉTRICAS DE CALIDAD

### 5.1 Score por Categoría

| Categoría | Score | Notas |
|-----------|-------|-------|
| Normalización | 8.5/10 | Algunas redundancias detectadas |
| Naming Conventions | 9.5/10 | Muy consistente |
| Integridad Referencial | 9.0/10 | FKs bien definidas |
| Performance (Triggers) | 7.0/10 | Cascada a optimizar |
| Mantenibilidad | 8.0/10 | Deprecated pendiente de limpiar |

### 5.2 Score Global

**Score de Calidad DDL: 8.4/10**

- Sin problemas bloqueantes
- Redundancias manejables
- Arquitectura sólida

---

## 6. CONCLUSIONES

### Lo Positivo
1. Arquitectura de schemas bien definida (13 activos, separación clara)
2. Naming conventions muy consistentes
3. Refactorización de misiones ejemplar (8→1)
4. Trazabilidad DDL↔RF al 100% en schemas críticos

### A Mejorar
1. Limpiar funciones deprecated (14 archivos)
2. Consolidar tablas de auditoría (4→3)
3. Optimizar cascada de triggers en submissions
4. Unificar gestión de preferencias de notificación

### Riesgo Técnico
**BAJO** - No hay problemas de integridad o seguridad. Las redundancias son de eficiencia, no de corrección.

---

*Generado por: TASK-2026-02-02-AUDITORIA-BD-REQUERIMIENTOS*
*Fase: 3 - Detección de Anomalías*
*Fecha: 2026-02-02*
