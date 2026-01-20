---
id: "RF-ANA-003"
title: "Tracking de Actividad e Identificacion de Estudiantes en Riesgo"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Analytics"
epic: "EAI-004"
version: "1.0"
labels: ["analytics", "activity-tracking", "at-risk", "intervention", "alerts"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# RF-ANA-003: Tracking de Actividad e Identificacion de Estudiantes en Riesgo

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-ANA-003 |
| **Modulo** | Analytics |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha creacion** | 2026-01-20 |
| **Ultima actualizacion** | 2026-01-20 |

## Referencias

### Especificacion Tecnica
- [ET-ANA-003: Tracking y Alertas](../especificaciones/ET-ANA-003-tracking-alertas.md)

### User Stories Relacionadas
- [US-ANA-005: Tracking de Actividad](../historias-usuario/US-ANA-005-tracking-actividad.md)
- [US-ANA-006: Identificacion de Estudiantes Rezagados](../historias-usuario/US-ANA-006-identificacion-rezagados.md)

### Implementacion
- **Backend:** `apps/backend/src/modules/teacher-analytics/`
- **Frontend:** `apps/frontend/src/pages/teacher/activity/`
- **Database:** Schema `progress_tracking`, `gamification_system`

---

## Descripcion del Requerimiento

### Contexto

Los profesores necesitan:
1. Ver en tiempo casi real que estan haciendo sus estudiantes
2. Identificar rapidamente que estudiantes necesitan atencion

Este requerimiento aborda la necesidad de monitoreo continuo y deteccion temprana de estudiantes en riesgo para permitir intervenciones oportunas.

### Necesidad del Negocio

**Problema:**
Sin estas funcionalidades:
- Profesores no saben si los estudiantes estan usando la plataforma
- No hay forma de detectar estudiantes que se estan quedando atras
- Las intervenciones llegan demasiado tarde
- No hay visibilidad del engagement de la clase

**Solucion:**
Implementar un timeline de actividades en tiempo casi real y un sistema de identificacion de estudiantes en riesgo basado en reglas simples (dias de inactividad y porcentaje de progreso).

---

## Requerimiento Funcional

### RF-ANA-003.1: Timeline de Actividad de la Clase

El sistema **DEBE** proporcionar un feed de actividades que muestre:

#### Contenido del Timeline
Para cada actividad:
| Campo | Descripcion |
|-------|-------------|
| Avatar | Foto del estudiante |
| Nombre | Nombre del estudiante |
| Tipo | Tipo de actividad |
| Modulo | Nombre del modulo (si aplica) |
| Actividad | Nombre de la actividad |
| Timestamp | Fecha/hora relativa |
| XP | XP ganado (si aplica) |

#### Tipos de Actividad
| Tipo | Descripcion | Icono | Color |
|------|-------------|-------|-------|
| `activity_completed` | Estudiante completo una actividad | Check | Verde |
| `module_started` | Estudiante inicio un nuevo modulo | Play | Azul |
| `level_up` | Estudiante subio de nivel | Trofeo | Amarillo |
| `achievement_unlocked` | Estudiante desbloqueo insignia | Estrella | Morado |

#### Filtro por Fecha
| Opcion | Descripcion |
|--------|-------------|
| Hoy | Solo actividades de hoy |
| Ultimos 7 dias | Default |
| Ultimos 30 dias | Ultimo mes |
| Todo el tiempo | Sin filtro de fecha |

#### Estadisticas del Dia
- # de estudiantes activos HOY
- # de actividades completadas HOY
- Grafica simple de actividad por dia (ultimos 7 dias)

#### Auto-Refresh
- Timeline se actualiza automaticamente cada 2 minutos
- Indicador visual de ultima actualizacion
- Boton manual de refresh

#### Paginacion
- Muestra ultimas 50 actividades inicialmente
- Boton "Cargar mas" para paginacion infinita
- Carga en menos de 1 segundo

---

### RF-ANA-003.2: Identificacion de Estudiantes en Riesgo

El sistema **DEBE** proporcionar una vista que identifique estudiantes que necesitan atencion:

#### Definicion de Estados de Riesgo

| Estado | Condiciones | Color |
|--------|-------------|-------|
| **Critico** | Sin actividad >7 dias **O** progreso <30% | Rojo |
| **Advertencia** | Sin actividad 3-7 dias **O** progreso 30-50% | Amarillo |
| **Activo** | Actividad <3 dias **Y** progreso >50% | Verde |

#### Contadores de Riesgo
- # estudiantes en estado critico (rojo)
- # estudiantes en advertencia (amarillo)
- # estudiantes activos (verde)
- % de la clase en cada categoria

#### Vista de Estudiantes en Riesgo
Para cada estudiante:
| Campo | Descripcion |
|-------|-------------|
| Avatar | Foto del estudiante |
| Nombre | Nombre del estudiante |
| Estado | Badge rojo/amarillo/verde |
| Dias sin actividad | Numero de dias inactivo |
| Progreso | % de completitud |
| Ultimo modulo | Ultimo modulo accedido |
| Acciones | Botones de accion |

#### Filtros
- "Todos" - Muestra todos los estudiantes
- "Solo Criticos" - Solo estudiantes en rojo
- "Solo Advertencias" - Solo estudiantes en amarillo

#### Ordenamiento
- Por estado de riesgo (default - criticos primero)
- Por dias sin actividad
- Por progreso

#### Detalle de Riesgo (Modal)
Al hacer click en estudiante:
- Ultima actividad (nombre y fecha)
- Modulos sin iniciar
- Modulos iniciados pero no completados
- Comparativa con promedio de la clase
- Boton para ir a perfil completo

#### Acciones Rapidas (UI Placeholder)
- Boton "Enviar Mensaje" - Disabled con tooltip "Disponible en extension futura"
- Boton "Asignar Actividad" - Disabled con tooltip "Disponible en extension futura"

---

## Casos de Uso

### UC-ANA-005: Profesor ve timeline de actividad

**Actor:** Profesor
**Precondiciones:** Profesor autenticado con clase asignada

**Flujo:**
1. Profesor accede a `/teacher/classroom/{classroomId}/activity`
2. Sistema carga estadisticas del dia
3. Sistema carga ultimas 50 actividades
4. Sistema inicia auto-refresh cada 2 minutos
5. Profesor puede filtrar por rango de fecha
6. Profesor puede cargar mas actividades

**Resultado:** Profesor ve actividad reciente de su clase en tiempo casi real

---

### UC-ANA-006: Profesor identifica estudiantes en riesgo

**Actor:** Profesor
**Precondiciones:** Profesor autenticado con clase asignada

**Flujo:**
1. Profesor accede a `/teacher/classroom/{classroomId}/at-risk`
2. Sistema analiza cada estudiante segun reglas de riesgo
3. Sistema muestra contadores de cada estado
4. Sistema muestra lista de estudiantes con estado de riesgo
5. Profesor filtra por "Solo Criticos"
6. Profesor hace click en estudiante critico
7. Sistema muestra modal con detalle de factores de riesgo
8. Profesor navega a perfil completo para mas detalles

**Resultado:** Profesor identifica estudiantes que necesitan intervencion inmediata

---

## Criterios de Aceptacion

### AC-001: Timeline de Actividades
- [x] Timeline muestra ultimas 50 actividades
- [x] Cada actividad muestra avatar, nombre, tipo, modulo, timestamp
- [x] Actividades ordenadas de mas reciente a mas antigua
- [x] Cada tipo tiene icono y color distintivo

### AC-002: Filtro por Fecha
- [x] Selector con opciones: Hoy, 7 dias, 30 dias, Todo
- [x] Default es "Ultimos 7 dias"
- [x] Timeline se actualiza al cambiar filtro

### AC-003: Estadisticas del Dia
- [x] Badge muestra # estudiantes activos hoy
- [x] Badge muestra # actividades completadas hoy
- [x] Grafica de actividad por dia visible

### AC-004: Auto-Refresh
- [x] Timeline se actualiza cada 2 minutos automaticamente
- [x] Indicador de ultima actualizacion visible
- [x] Boton de refresh manual funciona

### AC-005: Estados de Riesgo
- [x] Estado Critico: >7 dias O <30% progreso
- [x] Estado Advertencia: 3-7 dias O 30-50% progreso
- [x] Estado Activo: <3 dias Y >50% progreso
- [x] Colores correctos (rojo/amarillo/verde)

### AC-006: Contadores de Riesgo
- [x] Contador de criticos visible
- [x] Contador de advertencias visible
- [x] Contador de activos visible
- [x] Porcentajes calculados correctamente

### AC-007: Lista de Estudiantes en Riesgo
- [x] Lista muestra todos los campos definidos
- [x] Filtros funcionan correctamente
- [x] Ordenamiento por estado funciona
- [x] Criticos siempre aparecen primero

### AC-008: Modal de Detalle
- [x] Modal muestra ultima actividad
- [x] Modal muestra modulos sin iniciar
- [x] Modal muestra modulos incompletos
- [x] Modal muestra comparativa con clase
- [x] Boton "Ver Perfil" navega correctamente

### AC-009: Acciones Rapidas
- [x] Botones visibles pero disabled
- [x] Tooltips indican disponibilidad futura

---

## Especificaciones Tecnicas

### Backend

**Endpoints:**
```
GET /api/teacher/classroom/{classroomId}/activity-feed?range=7d&limit=50&offset=0
GET /api/teacher/classroom/{classroomId}/at-risk-students?filter=all
```

**Response Activity Feed:**
```json
{
  "classroomId": "uuid",
  "dateRange": "7d",
  "stats": {
    "activeStudentsToday": 12,
    "activitiesCompletedToday": 45,
    "activityByDay": [
      {"date": "2025-11-02", "count": 45}
    ]
  },
  "activities": [
    {
      "id": "uuid",
      "type": "activity_completed",
      "student": {"id": "uuid", "name": "string", "avatarUrl": "string"},
      "module": {"id": "uuid", "name": "string"},
      "activity": {"id": "uuid", "name": "string"},
      "timestamp": "timestamp",
      "metadata": {"xpEarned": 50}
    }
  ],
  "pagination": {"limit": 50, "offset": 0, "hasMore": true}
}
```

**Response At-Risk Students:**
```json
{
  "classroomId": "uuid",
  "summary": {
    "critical": 5,
    "warning": 8,
    "active": 12,
    "total": 25,
    "percentages": {"critical": 20, "warning": 32, "active": 48}
  },
  "students": [
    {
      "id": "uuid",
      "name": "string",
      "avatarUrl": "string",
      "riskLevel": "critical",
      "riskFactors": {
        "daysInactive": 10,
        "progressPercentage": 25,
        "modulesNotStarted": 5,
        "modulesIncomplete": 2
      },
      "lastActivity": {},
      "comparison": {"progressDiffFromAverage": -40.5}
    }
  ]
}
```

### Frontend

**Rutas:**
```
/teacher/classroom/:classroomId/activity
/teacher/classroom/:classroomId/at-risk
```

**Componentes:**
- `ActivityFeedView.tsx`
- `ActivityHeader.tsx`
- `ActivityChart.tsx`
- `ActivityTimeline.tsx`
- `ActivityItem.tsx`
- `AtRiskStudentsView.tsx`
- `RiskSummary.tsx`
- `FilterBar.tsx`
- `StudentsAtRiskList.tsx`
- `StudentRiskCard.tsx`
- `StudentRiskDetailModal.tsx`

### Database

**Schema:** `progress_tracking`
**Tablas relevantes:**
- `activity_logs` - Log de actividades
- `student_progress` - Progreso de estudiantes
- `session_logs` - Sesiones para calcular inactividad

**Entity:** `ActivityLog`
```typescript
@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // activity_completed, module_started, level_up, achievement_unlocked

  @ManyToOne(() => Student)
  student: Student;

  @Column({ name: 'classroom_id' })
  classroomId: string;

  @ManyToOne(() => Module, { nullable: true })
  module?: Module;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
```

---

## Alcance Basico vs Extensiones

### EAI-004 (Este alcance - Analytics Basico):
- Timeline de ultimas 50 actividades
- Filtro simple por rango de fechas
- Auto-refresh cada 2 minutos
- Estadisticas basicas del dia
- 4 tipos de actividad basicos
- Identificacion con reglas simples (dias, %)
- 3 niveles de riesgo
- Filtros basicos
- Acciones como placeholder

### EXT-005 (Extension futura - Reportes Avanzados):
- Filtros avanzados (por estudiante, modulo, tipo)
- Busqueda en timeline
- Agrupacion por estudiante/modulo
- Analisis de patrones de actividad
- Alertas configurables
- Exportacion de timeline a CSV
- Heatmap de actividad
- Real-time con WebSockets
- Analisis predictivo con ML
- Recomendaciones de intervencion
- Integracion con sistema de mensajeria

---

## Testing

### Pruebas Unitarias
- [ ] `calculateDateRange` retorna rangos correctos
- [ ] `getActivityStats` cuenta correctamente
- [ ] `mapActivityLog` formatea correctamente segun tipo
- [ ] `calculateRiskLevel` retorna nivel correcto segun reglas
- [ ] `calculateRiskSummary` cuenta correctamente
- [ ] Ordenamiento coloca criticos primero

### Pruebas de Integracion
- [ ] Endpoint activity-feed retorna actividades del rango correcto
- [ ] Paginacion retorna correctamente con hasMore
- [ ] Stats se calculan correctamente
- [ ] Endpoint at-risk retorna estudiantes con nivel correcto
- [ ] Filtro critico/advertencia funciona

### Pruebas E2E
- [ ] Profesor ve timeline de actividades
- [ ] Filtro por fecha actualiza timeline
- [ ] Cargar mas funciona correctamente
- [ ] Auto-refresh actualiza timeline
- [ ] Profesor ve estudiantes en riesgo categorizados
- [ ] Filtros cambian lista mostrada
- [ ] Click en estudiante muestra modal
- [ ] Boton "Ver Perfil" navega correctamente

---

## Estimacion de Esfuerzo

| Area | Story Points | Horas Estimadas |
|------|--------------|-----------------|
| Backend Activity | 3 SP | 14h |
| Backend At-Risk | 3 SP | 14h |
| Frontend Activity | 3 SP | 12h |
| Frontend At-Risk | 4 SP | 18h |
| Testing | 2 SP | 8h |
| **Total** | **15 SP** | **66h** |

**Presupuesto:** $7,600 MXN (US-ANA-005: $3,400 + US-ANA-006: $4,200)

---

## Notas de Implementacion

### Performance
- Indice en `(classroomId, timestamp)` para queries rapidos
- Limitar a 50 actividades por request
- Cachear stats por 1 minuto
- Cachear analisis de riesgo por 5 minutos

### Reglas de Riesgo
- Hardcodeadas en alcance inicial (7 dias, 30%, 50%)
- Configurables por profesor en EXT-005

### Logging
- Crear ActivityLog en cada evento relevante
- Background job para limpiar logs antiguos (>90 dias)

### Escalabilidad
- Para clases muy activas, considerar WebSockets en EXT-005
- Calcular riesgo en background para clases grandes

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Analyst | Creacion inicial del requerimiento formal |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-004-analytics/requerimientos/RF-ANA-003-tracking-alertas.md`
