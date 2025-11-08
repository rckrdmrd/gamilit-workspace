
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: RF-PRG-002 -->
<!-- ID Nuevo: M-PRG-REQ-002 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-PRG-REQ-002: Análisis de Desempeño y Analytics

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-PRG-002 |
| **Módulo** | 04 - Progreso y Seguimiento |
| **Título** | Análisis de Desempeño y Analytics |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Database Team, Product Team |
| **Stakeholders** | Product Owner, Teachers, Data Analysts |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **Vistas Materializadas:**
- **`progress_tracking.user_performance_summary`**
  - **Ubicación:** `apps/database/ddl/schemas/progress_tracking/materialized-views/user_performance_summary.sql:1-45`
  - **Propósito:** Vista agregada de métricas de desempeño por usuario
  - **Refresh:** Cada 1 hora (cron job)

🗄️ **Funciones de Analytics:**
- **`progress_tracking.calculate_success_rate()`**
  - **Ubicación:** `apps/database/ddl/schemas/progress_tracking/functions/calculate_success_rate.sql:1-25`
  - **Propósito:** Calcula tasa de éxito de un usuario en ejercicios

- **`progress_tracking.get_performance_trends()`**
  - **Ubicación:** `apps/database/ddl/schemas/progress_tracking/functions/get_performance_trends.sql:1-50`
  - **Propósito:** Obtiene tendencias de desempeño en el tiempo

- **`progress_tracking.identify_struggling_students()`**
  - **Ubicación:** `apps/database/ddl/schemas/progress_tracking/functions/identify_struggling_students.sql:1-40`
  - **Propósito:** Identifica estudiantes que necesitan apoyo

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-PRG-002: Implementación de Analytics de Desempeño](../../02-especificaciones-tecnicas/04-progreso-seguimiento/ET-PRG-002-analisis-desempeno.md)

### Documentos Relacionados

- [RF-PRG-001: Estados de Progreso](./RF-PRG-001-estados-progreso.md) - Tracking de progreso base
- [RF-GAM-001: Sistema de Achievements](../02-gamificacion/RF-GAM-001-achievements.md) - Achievements basados en desempeño
- [RF-NOT-001: Sistema de Notificaciones](../06-notificaciones/RF-NOT-001-tipos-notificaciones.md) - Alertas de desempeño
- [Teacher Portal](../teacher-portal/) - Dashboard de maestros

---

## 📖 Descripción General

### Propósito

El **Sistema de Análisis de Desempeño** proporciona métricas y analytics detallados sobre el rendimiento de los estudiantes para:

- **Estudiantes:** Visualizar su progreso, áreas fuertes/débiles, comparación con objetivos
- **Maestros:** Monitorear desempeño de su clase, identificar estudiantes en riesgo, ajustar enseñanza
- **Administradores:** Analytics agregados, reportes de efectividad del contenido, KPIs

### Alcance

**Métricas Individuales:**
- Tasa de éxito (% de ejercicios correctos al primer intento)
- Tiempo promedio por ejercicio
- Mejora a lo largo del tiempo
- Áreas de fortaleza y debilidad
- Racha actual y máxima
- XP ganado por semana

**Métricas de Aula (Maestros):**
- Progreso promedio de la clase
- Distribución de calificaciones
- Ejercicios con mayor dificultad
- Estudiantes que necesitan apoyo
- Comparación con otras aulas (anónima)

**Métricas de Sistema (Admins):**
- Engagement global (DAU, WAU, MAU)
- Tasa de retención
- Efectividad de contenido (qué ejercicios funcionan mejor)
- Tiempo promedio de sesión
- Conversión de módulos (% que completan)

---

## ⚙️ Requerimientos Funcionales

### 1. Métricas de Desempeño Individual

#### 1.1 Tasa de Éxito

**Definición:**
```
Tasa de Éxito = (Ejercicios correctos al 1er intento) / (Total ejercicios intentados) * 100
```

**Tipos de tasa de éxito:**
- **Global:** Todos los ejercicios
- **Por módulo:** Específico de un módulo
- **Por categoría:** Vocabulario, Gramática, Lectura, etc.
- **Por nivel de dificultad:** Fácil, Medio, Difícil

**Ejemplo:**
```json
{
  "user_id": "uuid",
  "success_rate_global": 78.5,
  "success_rate_by_module": {
    "modulo-1": 85.0,
    "modulo-2": 72.0
  },
  "success_rate_by_category": {
    "vocabulary": 90.0,
    "grammar": 65.0,
    "reading": 80.0
  }
}
```

#### 1.2 Tiempo Promedio por Ejercicio

**Métricas:**
- Tiempo promedio global
- Tiempo por mecánica de ejercicio
- Comparación con promedio de la clase
- Tendencia (¿está mejorando su velocidad?)

**Indicadores:**
- 🟢 **Verde:** Tiempo < promedio de clase
- 🟡 **Amarillo:** Tiempo ≈ promedio de clase
- 🔴 **Rojo:** Tiempo > 150% del promedio (posible dificultad)

#### 1.3 Mejora a lo Largo del Tiempo

**Cálculo:**
```sql
-- Comparar desempeño actual vs. hace 30 días
SELECT
  success_rate_last_30_days - success_rate_previous_30_days AS improvement
FROM user_performance_summary
WHERE user_id = 'uuid';
```

**Visualización:**
- Gráfica de línea: Tasa de éxito en el tiempo
- Indicador de tendencia: ↗️ Mejorando, ➡️ Estable, ↘️ Declinando

#### 1.4 Áreas de Fortaleza y Debilidad

**Identificación automática:**
- **Fortaleza:** Categorías con >85% de éxito
- **Neutral:** 60-85% de éxito
- **Debilidad:** <60% de éxito

**Ejemplo:**
```json
{
  "strengths": ["vocabulary", "pronunciation"],
  "neutral": ["reading"],
  "weaknesses": ["grammar", "writing"],
  "recommendations": [
    {
      "area": "grammar",
      "success_rate": 55.0,
      "action": "practice_more",
      "suggested_lessons": ["modulo-2-leccion-1", "modulo-2-leccion-3"]
    }
  ]
}
```

---

### 2. Métricas de Aula (Para Maestros)

#### 2.1 Dashboard de Progreso de Clase

**Vista general:**
- Total de estudiantes
- Progreso promedio (%)
- Estudiantes completados
- Estudiantes en riesgo

**Tabla de estudiantes:**
```
| Estudiante       | Progreso | Última Actividad | Tasa Éxito | Estado    |
|------------------|----------|------------------|------------|-----------|
| Ana García       | 95%      | Hace 2 horas     | 88%        | ✅ Al día |
| Carlos López     | 45%      | Hace 5 días      | 60%        | ⚠️ Riesgo |
| María Rodríguez  | 78%      | Hace 1 día       | 92%        | ✅ Al día |
```

#### 2.2 Identificación de Estudiantes en Riesgo

**Criterios de "en riesgo":**
1. **Inactividad:** Sin actividad en últimos 7 días
2. **Bajo desempeño:** Tasa de éxito <60% en últimos 10 ejercicios
3. **Abandono:** Racha rota + inactividad 3+ días
4. **Lentitud extrema:** Tiempo promedio >200% del promedio de clase
5. **Intentos excesivos:** Promedio de 3+ intentos por ejercicio

**Acción sugerida:**
```json
{
  "student": "Carlos López",
  "risk_level": "high",
  "reasons": [
    "No activity for 5 days",
    "Success rate 60% (below threshold)",
    "Struggling with grammar exercises"
  ],
  "suggested_actions": [
    "Send personalized message",
    "Schedule 1-on-1 session",
    "Assign remedial lessons"
  ]
}
```

#### 2.3 Análisis de Ejercicios Difíciles

**Identificar ejercicios problemáticos:**
- Tasa de éxito <50% en la clase
- Tiempo promedio >5 minutos
- >70% de estudiantes necesitan 3+ intentos

**Reportar a admins/creadores de contenido:**
```json
{
  "exercise_id": "uuid",
  "exercise_title": "Conjugación de verbos irregulares",
  "class_success_rate": 35.0,
  "avg_attempts": 3.2,
  "avg_time_seconds": 420,
  "recommendation": "Review exercise difficulty or add hints"
}
```

---

### 3. Métricas de Sistema (Para Administradores)

#### 3.1 KPIs de Engagement

**Daily Active Users (DAU):**
```sql
SELECT COUNT(DISTINCT user_id)
FROM progress_tracking.exercise_attempts
WHERE DATE(created_at) = CURRENT_DATE;
```

**Weekly Active Users (WAU):**
```sql
SELECT COUNT(DISTINCT user_id)
FROM progress_tracking.exercise_attempts
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
```

**Tasa de Retención:**
```
Retención Día 7 = (Usuarios activos en día 7) / (Usuarios registrados hace 7 días) * 100
Retención Día 30 = (Usuarios activos en día 30) / (Usuarios registrados hace 30 días) * 100
```

#### 3.2 Efectividad de Contenido

**Métricas por módulo:**
- Tasa de completitud (% que terminan el módulo)
- Tasa de éxito promedio
- Tiempo promedio de completitud
- Tasa de abandono (% que dejan el módulo sin terminar)

**Identificar contenido estrella:**
```json
{
  "module_id": "modulo-1",
  "completion_rate": 92.0,
  "avg_success_rate": 85.0,
  "avg_completion_time_hours": 3.5,
  "student_satisfaction": 4.7,
  "status": "⭐ High performing content"
}
```

**Identificar contenido problemático:**
```json
{
  "module_id": "modulo-3",
  "completion_rate": 45.0,
  "avg_success_rate": 58.0,
  "drop_off_point": "leccion-2-ejercicio-5",
  "status": "⚠️ Needs improvement"
}
```

---

## 💼 Casos de Uso

### CU-PRG-002-01: Estudiante Visualiza Su Dashboard

**Actor:** Estudiante

**Precondiciones:**
- Estudiante autenticado
- Ha completado al menos 5 ejercicios

**Flujo Principal:**
1. Estudiante navega a "Mi Progreso"
2. Sistema carga métricas:
   ```json
   {
     "total_xp": 1250,
     "current_rank": "Nacom",
     "success_rate": 78.5,
     "exercises_completed": 45,
     "current_streak": 7,
     "time_learning_hours": 12.3,
     "strengths": ["vocabulary", "reading"],
     "weaknesses": ["grammar"],
     "weekly_progress": {
       "Mon": 3, "Tue": 5, "Wed": 2, "Thu": 4, "Fri": 6, "Sat": 0, "Sun": 1
     }
   }
   ```
3. Visualiza gráficas:
   - Progreso semanal (barras)
   - Tasa de éxito por categoría (radar chart)
   - Comparación con promedio de clase (line chart)
4. Recibe recomendaciones personalizadas

**Resultado:**
- Estudiante comprende su desempeño
- Identifica áreas de mejora
- Recibe motivación (gráficas ascendentes, achievements)

---

### CU-PRG-002-02: Maestro Revisa Progreso de Clase

**Actor:** Maestro (admin_teacher)

**Precondiciones:**
- Maestro autenticado
- Tiene al menos 1 aula asignada

**Flujo Principal:**
1. Maestro accede a "Dashboard de Clase"
2. Selecciona aula (si tiene múltiples)
3. Sistema muestra:
   ```
   Clase: 3ro Primaria A
   Total estudiantes: 25
   Progreso promedio: 68%
   Última actividad: Hace 30 minutos

   📊 Distribución de Progreso:
   - 0-25%:   2 estudiantes (8%)
   - 26-50%:  5 estudiantes (20%)
   - 51-75%:  10 estudiantes (40%)
   - 76-100%: 8 estudiantes (32%)

   ⚠️ Estudiantes en Riesgo: 3
   - Carlos López (5 días sin actividad)
   - Ana Martínez (Tasa éxito 55%)
   - Pedro Gómez (Abandonó módulo 2)
   ```
4. Maestro hace clic en "Carlos López"
5. Sistema muestra perfil detallado:
   ```json
   {
     "student": "Carlos López",
     "progress": 45.0,
     "last_activity": "5 days ago",
     "success_rate": 60.0,
     "weak_areas": ["grammar", "writing"],
     "last_completed_exercise": "modulo-2-leccion-3-ejercicio-2",
     "recommended_action": "Send encouragement message + assign practice lessons"
   }
   ```
6. Maestro envía mensaje personalizado o asigna lecciones de repaso

**Resultado:**
- Maestro identifica estudiantes que necesitan apoyo
- Toma acción proactiva

---

### CU-PRG-002-03: Sistema Identifica Contenido Problemático

**Actor:** Sistema (cron job)

**Frecuencia:** Cada 24 horas a las 2 AM

**Flujo Principal:**
1. Sistema ejecuta `progress_tracking.identify_problematic_content()`
2. Analiza todos los ejercicios creados en últimos 30 días:
   ```sql
   SELECT
     e.id,
     e.title,
     COUNT(DISTINCT ea.user_id) AS students_attempted,
     AVG(CASE WHEN ea.is_correct THEN 100.0 ELSE 0.0 END) AS success_rate,
     AVG(ea.attempt_number) AS avg_attempts
   FROM educational_content.exercises e
   JOIN progress_tracking.exercise_attempts ea ON e.id = ea.exercise_id
   WHERE e.created_at >= NOW() - INTERVAL '30 days'
   GROUP BY e.id, e.title
   HAVING
     AVG(CASE WHEN ea.is_correct THEN 100.0 ELSE 0.0 END) < 50.0
     AND COUNT(DISTINCT ea.user_id) >= 10;
   ```
3. Genera reporte:
   ```json
   {
     "report_date": "2025-11-07",
     "problematic_exercises": [
       {
         "exercise_id": "uuid-1",
         "title": "Conjugación: Pretérito Perfecto",
         "success_rate": 35.0,
         "avg_attempts": 3.8,
         "students_attempted": 45,
         "issue": "Too difficult - Consider adding hints or simplifying"
       },
       {
         "exercise_id": "uuid-2",
         "title": "Lectura: Texto sobre Tikal",
         "success_rate": 42.0,
         "avg_attempts": 2.9,
         "students_attempted": 38,
         "issue": "High abandonment rate (15 students didn't finish)"
       }
     ]
   }
   ```
4. Envía notificación a super_admin
5. Crea ticket automático en admin dashboard

**Resultado:**
- Contenido problemático identificado rápidamente
- Admins pueden tomar acción correctiva

---

## 📊 Métricas y Visualizaciones

### Dashboard de Estudiante

**Componentes:**

1. **Hero Stats:**
   ```
   🏆 1,250 XP          📈 78.5% Éxito      🔥 7 días racha
   ⏱️ 12.3h aprendiendo  ✅ 45 ejercicios    🎯 Nivel: Nacom
   ```

2. **Gráfica de Progreso Semanal (Barras):**
   ```
   Ejercicios completados por día
   │
   6 │     ▓▓
   5 │  ▓▓ ▓▓
   4 │  ▓▓ ▓▓ ▓▓
   3 │▓▓▓▓ ▓▓ ▓▓
   2 │▓▓▓▓ ▓▓ ▓▓ ▓▓
   1 │▓▓▓▓ ▓▓ ▓▓ ▓▓    ▓▓
   0 │▓▓▓▓ ▓▓ ▓▓ ▓▓ __ ▓▓
     └─────────────────────
      L  M  X  J  V  S  D
   ```

3. **Radar Chart: Desempeño por Categoría**
   ```
          Vocabulario (90%)
                 │
      Lectura ───┼─── Gramática
       (80%)     │      (60%)
                 │
           Escritura (70%)
   ```

4. **Comparación con Promedio de Clase:**
   ```
   Tu Tasa de Éxito:   ████████░░ 78.5%
   Promedio de Clase:  ██████░░░░ 72.0%

   ✅ Estás por encima del promedio (+6.5%)
   ```

---

### Dashboard de Maestro

**Componentes:**

1. **Resumen de Clase:**
   ```
   ┌──────────────────────────────────┐
   │ Clase: 3ro Primaria A            │
   │ 25 estudiantes                   │
   │                                  │
   │ Progreso Promedio:    68% ▓▓▓▓▓▓░│
   │ Tasa de Éxito:        72% ▓▓▓▓▓▓░│
   │ Última Actividad:     30 min ago │
   │                                  │
   │ ✅ Al día:     18 estudiantes    │
   │ ⚠️ Riesgo:     3 estudiantes     │
   │ 🔴 Inactivos:  4 estudiantes     │
   └──────────────────────────────────┘
   ```

2. **Top 5 y Bottom 5 Estudiantes:**
   ```
   Top 5 Performers:
   1. María R.    - 95% ⭐⭐⭐
   2. Juan P.     - 92% ⭐⭐⭐
   3. Ana G.      - 88% ⭐⭐
   4. Luis M.     - 85% ⭐⭐
   5. Sofia T.    - 82% ⭐⭐

   Need Attention:
   1. Carlos L.   - 45% ⚠️ (5 días sin actividad)
   2. Pedro G.    - 52% ⚠️ (Bajo éxito en gramática)
   3. Ana M.      - 55% ⚠️ (3 días inactivo)
   ```

3. **Heatmap de Dificultad por Ejercicio:**
   ```
   Módulo 1:
   Lección 1: ✅✅✅ (95% éxito)
   Lección 2: ✅✅⚠️ (78% éxito)
   Lección 3: ⚠️⚠️⚠️ (55% éxito) ← Revisar

   Módulo 2:
   Lección 1: ✅✅✅ (92% éxito)
   ```

---

## ✅ Criterios de Aceptación

### Para Estudiantes
- [ ] Puede ver su tasa de éxito global y por categoría
- [ ] Puede ver gráfica de progreso semanal
- [ ] Puede ver comparación con promedio de clase (anónima)
- [ ] Recibe recomendaciones de áreas a mejorar
- [ ] Puede exportar su reporte de progreso (PDF)

### Para Maestros
- [ ] Puede ver progreso agregado de su clase
- [ ] Puede identificar estudiantes en riesgo con criterios claros
- [ ] Puede ver ejercicios donde la clase tiene más dificultad
- [ ] Puede filtrar por período de tiempo (última semana, mes, trimestre)
- [ ] Recibe alertas automáticas cuando un estudiante entra en "riesgo"

### Para Administradores
- [ ] Puede ver KPIs de engagement (DAU, WAU, MAU)
- [ ] Puede identificar contenido problemático automáticamente
- [ ] Puede comparar desempeño entre aulas/escuelas
- [ ] Puede exportar reportes en CSV/Excel
- [ ] Dashboard actualizado en tiempo real (<5 segundos delay)

---

## 🔒 Consideraciones de Seguridad y Privacidad

### Privacidad de Datos

**FERPA Compliance:**
- Comparaciones con clase son **anónimas** (no se muestran nombres de otros estudiantes)
- Maestros solo ven datos de sus aulas asignadas
- Estudiantes solo ven sus propios datos

**GDPR/Data Retention:**
- Datos de desempeño se conservan 2 años
- Después de 2 años, se anonimizan (eliminan user_id)
- Usuario puede solicitar exportación de sus datos
- Usuario puede solicitar eliminación (right to be forgotten)

### Row Level Security (RLS)

**Políticas:**
```sql
-- Estudiantes solo ven sus propios datos
CREATE POLICY student_own_performance
ON progress_tracking.user_performance_summary
FOR SELECT
USING (user_id = auth.uid());

-- Maestros ven datos de estudiantes en sus aulas
CREATE POLICY teacher_classroom_performance
ON progress_tracking.user_performance_summary
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM social_features.classroom_members cm
    JOIN social_features.classrooms c ON cm.classroom_id = c.id
    WHERE c.owner_id = auth.uid()
      AND cm.user_id = user_performance_summary.user_id
  )
);
```

---

## 📈 Roadmap Futuro

### Fase 2: Predicción con IA
- **Predicción de abandono:** Identificar estudiantes en riesgo de abandonar antes de que lo hagan
- **Recomendaciones personalizadas:** IA sugiere lecciones según debilidades del estudiante
- **Ajuste automático de dificultad:** Ejercicios se adaptan según desempeño

### Fase 3: Gamificación de Analytics
- **Logros por mejora:** "Improved grammar by 20% this month" → Achievement
- **Competencias amistosas:** Desafíos entre estudiantes basados en métricas
- **Leaderboards opcionales:** Por escuela, región (con opt-in)

---

## 📅 Historial

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-07 | Creación inicial del documento |

---

**Documento:** `docs/01-requerimientos/04-progreso-seguimiento/RF-PRG-002-analisis-desempeno.md`
**Propósito:** Definir requerimientos funcionales para análisis de desempeño y analytics de progreso estudiantil
