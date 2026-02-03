# US-PM-007: Configuración de Alertas de Intervención

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-PM-007 |
| **Título** | Alert Configuration (Configuración de Alertas) |
| **Épica** | EXT-001-portal-maestros |
| **Tipo** | Feature |
| **Estado** | Backlog |
| **Prioridad** | P1 - Alta |
| **Story Points** | 5 SP |
| **Presupuesto** | $2,200 MXN |
| **Asignados** | Backend-Agent, Frontend-Agent |
| **Creado** | 2026-01-20 |
| **Actualizado** | 2026-01-20 |

---

## Descripción

**Como** maestro,
**quiero** configurar los umbrales y tipos de alertas de intervención para mis classrooms,
**para** personalizar qué situaciones generan alertas según las necesidades específicas de mis estudiantes y adaptar el sistema a mi estilo de enseñanza.

---

## Contexto

Actualmente, el sistema genera alertas automáticas basadas en umbrales predefinidos:
- `at_risk` cuando `average_grade < 70%`
- `low_engagement` cuando actividad < 3 ejercicios por semana
- `no_activity` cuando no hay login en 7+ días

Sin embargo, los maestros no pueden:
1. Modificar estos umbrales
2. Deshabilitar tipos de alertas específicas
3. Ver qué estudiantes serían afectados por cambios de umbral
4. Configurar alertas por classroom individual

Esta historia de usuario aborda el **GAP-1** identificado en la auditoría de documentación del Teacher Portal (2026-01-20).

---

## Criterios de Aceptación

### AC-01: Ver Configuración Actual
**DADO** un maestro autenticado con acceso a un classroom,
**CUANDO** accede a la página de configuración de alertas,
**ENTONCES** puede ver:
- Lista de tipos de alertas disponibles
- Umbral actual de cada tipo
- Estado habilitado/deshabilitado de cada tipo
- Cantidad de estudiantes que actualmente cumplen cada criterio

**Endpoint:** `GET /api/v1/teacher/classrooms/:classroomId/alert-config`

**Response:**
```json
{
  "classroom_id": "uuid",
  "alert_types": [
    {
      "type": "low_score",
      "enabled": true,
      "threshold": 70,
      "threshold_unit": "percent",
      "description": "Calificación promedio bajo el umbral",
      "affected_students_count": 3
    },
    {
      "type": "no_activity",
      "enabled": true,
      "threshold": 7,
      "threshold_unit": "days",
      "description": "Sin actividad por más del umbral de días",
      "affected_students_count": 2
    }
  ],
  "last_updated": "ISO-date",
  "updated_by": "teacher-uuid"
}
```

---

### AC-02: Modificar Umbral de At-Risk
**DADO** un maestro viendo la configuración de alertas,
**CUANDO** modifica el umbral de `low_score` (at-risk),
**ENTONCES**:
- Puede ingresar un valor entre 0 y 100
- El sistema muestra preview de estudiantes que serían afectados
- Puede confirmar o cancelar el cambio
- El cambio se aplica solo al classroom seleccionado

**Endpoint:** `PATCH /api/v1/teacher/classrooms/:classroomId/alert-config`

**Request Body:**
```json
{
  "alert_type": "low_score",
  "threshold": 60,
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "alert_type": "low_score",
  "previous_threshold": 70,
  "new_threshold": 60,
  "newly_affected_students": 2,
  "no_longer_affected_students": 0
}
```

---

### AC-03: Habilitar/Deshabilitar Tipos de Alertas
**DADO** un maestro viendo la configuración de alertas,
**CUANDO** deshabilita un tipo de alerta (toggle off),
**ENTONCES**:
- Las alertas de ese tipo no se generan para el classroom
- Las alertas existentes de ese tipo se mantienen (no se eliminan)
- El toggle muestra estado actualizado
- Se puede volver a habilitar en cualquier momento

**Validaciones:**
- Al menos 1 tipo de alerta debe estar habilitado
- Si intenta deshabilitar el último tipo, mostrar error

---

### AC-04: Preview de Estudiantes Afectados
**DADO** un maestro modificando un umbral,
**CUANDO** cambia el valor del umbral,
**ENTONCES** el sistema muestra en tiempo real:
- Lista de estudiantes que SERÍAN afectados con el nuevo umbral
- Lista de estudiantes que DEJARÍAN de estar en riesgo
- Diferencia entre configuración actual y nueva

**Endpoint:** `POST /api/v1/teacher/classrooms/:classroomId/alert-config/preview`

**Request:**
```json
{
  "alert_type": "low_score",
  "new_threshold": 60
}
```

**Response:**
```json
{
  "current_affected": ["student-1", "student-2", "student-3"],
  "would_be_affected": ["student-1", "student-2", "student-3", "student-4", "student-5"],
  "would_be_removed": [],
  "newly_affected": ["student-4", "student-5"],
  "total_change": "+2"
}
```

---

### AC-05: Persistencia por Classroom
**DADO** un maestro con múltiples classrooms,
**CUANDO** configura alertas para un classroom específico,
**ENTONCES**:
- La configuración solo afecta a ese classroom
- Otros classrooms mantienen sus configuraciones independientes
- Un classroom nuevo usa los valores por defecto del sistema

**Valores por Defecto:**
| Tipo | Umbral | Unidad | Habilitado |
|------|--------|--------|------------|
| low_score | 70 | percent | true |
| no_activity | 7 | days | true |
| repeated_failures | 5 | attempts | true |
| declining_trend | 20 | percent_drop | true |
| excessive_time | 2 | multiplier | false |
| low_engagement | 3 | exercises/week | true |

---

### AC-06: Validación de Umbrales
**DADO** un maestro ingresando un nuevo umbral,
**CUANDO** el valor está fuera de rango,
**ENTONCES**:
- Se muestra mensaje de error específico
- No se permite guardar
- Se indica el rango válido

**Rangos Válidos:**
| Tipo | Mínimo | Máximo | Unidad |
|------|--------|--------|--------|
| low_score | 0 | 100 | % |
| no_activity | 1 | 30 | días |
| repeated_failures | 1 | 20 | intentos |
| declining_trend | 5 | 50 | % de caída |
| excessive_time | 1.5 | 5 | multiplicador |
| low_engagement | 1 | 20 | ejercicios/semana |

---

### AC-07: Auditoría de Cambios
**DADO** un maestro que modifica la configuración,
**CUANDO** guarda los cambios,
**ENTONCES**:
- Se registra en log de auditoría: quién, cuándo, qué cambió
- Se puede ver historial de cambios en la configuración

**Endpoint:** `GET /api/v1/teacher/classrooms/:classroomId/alert-config/history`

**Response:**
```json
{
  "changes": [
    {
      "timestamp": "ISO-date",
      "teacher_id": "uuid",
      "teacher_name": "Prof. García",
      "alert_type": "low_score",
      "action": "threshold_changed",
      "previous_value": 70,
      "new_value": 60
    }
  ]
}
```

---

### AC-08: Performance
- Response time para GET config: p95 < 200ms
- Response time para preview: p95 < 500ms (incluye cálculo de estudiantes)
- Response time para PATCH: p95 < 300ms

---

### AC-09: Seguridad
- Solo maestros con acceso al classroom pueden ver/modificar configuración
- Rate limiting: 30 requests/minuto por teacher
- Validación de JWT y permisos

---

### AC-10: UI/UX
- Interfaz de cards para cada tipo de alerta
- Toggle switch para habilitar/deshabilitar
- Slider o input numérico para umbrales
- Badge mostrando cantidad de estudiantes afectados
- Modal de confirmación antes de guardar cambios

---

## Especificaciones Técnicas

### Backend

**Nueva Tabla:** `teacher_alert_configurations`
```sql
CREATE TABLE progress_tracking.teacher_alert_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID NOT NULL REFERENCES social_features.classrooms(id),
  alert_type intervention_alert_type NOT NULL,
  threshold NUMERIC(10,2) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(classroom_id, alert_type)
);
```

**Nuevo Controller:** `alert-config.controller.ts`
**Nuevo Service:** `alert-config.service.ts`
**Nuevos DTOs:**
- `GetAlertConfigResponseDto`
- `UpdateAlertConfigDto`
- `PreviewAlertConfigDto`
- `AlertConfigHistoryDto`

### Frontend

**Nueva Página:** `TeacherAlertConfigPage.tsx`
**Nuevos Componentes:**
- `AlertConfigCard.tsx`
- `ThresholdSlider.tsx`
- `AffectedStudentsPreview.tsx`
- `ConfigHistoryModal.tsx`

**Nueva Ruta:** `/teacher/classrooms/:id/alert-config`

---

## Dependencias

### Requiere
- US-PM-001a (Classroom Management) - Para selector de classroom
- Intervention Alerts System - Ya implementado

### Relacionada
- US-PM-005c (Engagement Metrics) - Comparten tipos de alertas

### Habilita
- Personalización de umbrales por maestro
- Reducción de "alert fatigue" por alertas irrelevantes

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Maestros configuren umbrales muy bajos | Media | Medio | Establecer mínimos razonables |
| Performance con muchos estudiantes | Baja | Alto | Cache de preview, calcular async |
| Confusión con configuración global | Media | Bajo | UI clara indicando scope de classroom |

---

## Definición de Done

- [ ] Endpoints implementados y documentados en Swagger
- [ ] Tests unitarios con cobertura > 80%
- [ ] Tests e2e para flujo completo
- [ ] UI implementada con componentes reutilizables
- [ ] Validaciones de frontend y backend
- [ ] Auditoría de cambios funcional
- [ ] Performance validada (p95 < targets)
- [ ] Documentación actualizada

---

## Notas Adicionales

Esta historia fue creada como resultado del análisis de GAPs realizado el 2026-01-20.
El GAP-1 identificó que no existía forma de configurar alertas, lo cual limitaba
la utilidad del sistema de intervención automática.

---

**Documento creado:** 2026-01-20
**Versión:** 1.0.0
