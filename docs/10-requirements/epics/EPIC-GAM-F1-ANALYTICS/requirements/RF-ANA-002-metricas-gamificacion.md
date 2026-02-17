---
id: "RF-ANA-002"
title: "Metricas de Elementos de Gamificacion"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Analytics"
epic: "EAI-004"
version: "1.0"
labels: ["analytics", "gamification", "metrics", "tracking", "activity-feed"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# RF-ANA-002: Metricas de Elementos de Gamificacion

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-ANA-002 |
| **Modulo** | Analytics |
| **Prioridad** | Alta |
| **Estado** | Done |
| **Version** | 1.0 |
| **Fecha creacion** | 2026-01-20 |
| **Ultima actualizacion** | 2026-01-20 |

## Referencias

### Especificacion Tecnica
- [ET-ANA-002: API de Metricas](../specifications/ET-ANA-002-api-metricas.md)

### Historias de Usuario Relacionadas
- [US-ANA-005](../user-stories/US-ANA-005/US-ANA-005-tracking-actividad.md) - Tracking de Actividad
- [US-ANA-006](../user-stories/US-ANA-006/US-ANA-006-identificacion-rezagados.md) - Identificacion de Estudiantes Rezagados

### Dependencias
- EAI-003 (Gamificacion) - Genera los eventos de XP, logros, niveles

---

## Descripcion del Requerimiento

### Contexto

El sistema de gamificacion de Gamilit genera multiples tipos de eventos que deben ser rastreados y presentados a los profesores. Las metricas de gamificacion permiten:
- Entender como los estudiantes interactuan con el sistema
- Identificar estudiantes activos e inactivos
- Monitorear el engagement de la clase
- Detectar patrones de uso

### Necesidad del Negocio

**Problema:**
Sin tracking de metricas de gamificacion:
- No hay visibilidad de la actividad en tiempo real
- Imposible medir el engagement de los estudiantes
- Dificil identificar estudiantes inactivos a tiempo
- No se pueden detectar tendencias de uso

**Solucion:**
Implementar un sistema de tracking de actividades y metricas de gamificacion que proporcione a los profesores un feed de actividad en tiempo casi real, indicadores de estudiantes en riesgo, y estadisticas de engagement.

---

## Requerimiento Funcional

### RF-ANA-002.1: Timeline de Actividades

El sistema **DEBE** proporcionar un timeline de actividades de la clase:

#### Informacion por Actividad
- Avatar del estudiante
- Nombre del estudiante
- Tipo de actividad (completada, iniciada, logro desbloqueado, nivel alcanzado)
- Nombre del modulo (si aplica)
- Nombre de la actividad (si aplica)
- Timestamp (fecha/hora relativa)
- XP ganado (si aplica)

#### Tipos de Actividad Soportados
| Tipo | Icono | Color | Descripcion |
|------|-------|-------|-------------|
| `activity_completed` | Check | Verde | Estudiante completo una actividad |
| `module_started` | Play | Azul | Estudiante inicio un nuevo modulo |
| `level_up` | Trophy | Amarillo | Estudiante subio de nivel |
| `achievement_unlocked` | Star | Morado | Estudiante desbloqueo una insignia |

#### Filtros y Controles
- Selector de rango de fechas: Hoy, Ultimos 7 dias (default), Ultimos 30 dias, Todo el tiempo
- Auto-refresh cada 2 minutos
- Boton manual de refresh
- Paginacion con "Cargar mas" (50 actividades por carga)

### RF-ANA-002.2: Indicadores de Actividad Diaria

El sistema **DEBE** mostrar indicadores de actividad del dia:

#### Metricas en Tiempo Real
- Numero de estudiantes activos HOY
- Numero de actividades completadas HOY
- Grafica simple de actividad por dia (ultimos 7 dias)

#### Definicion de "Activo"
- Estudiante se considera activo si completo al menos 1 actividad en el dia

### RF-ANA-002.3: Identificacion de Estudiantes en Riesgo

El sistema **DEBE** identificar y mostrar estudiantes que requieren atencion:

#### Niveles de Riesgo

| Nivel | Color | Criterio |
|-------|-------|----------|
| **Critico** | Rojo | Sin actividad >7 dias O progreso <30% |
| **Advertencia** | Amarillo | Sin actividad 3-7 dias O progreso 30-50% |
| **Activo** | Verde | Actividad en ultimos 3 dias Y progreso >50% |

#### Informacion por Estudiante en Riesgo
- Avatar y nombre
- Estado de riesgo (badge rojo/amarillo/verde)
- Dias sin actividad
- Porcentaje de progreso
- Ultimo modulo accedido
- Modulos sin iniciar y modulos incompletos
- Comparacion con promedio de la clase (diferencia %)

#### Vista de Estudiantes en Riesgo
- Contadores: estudiantes criticos, advertencias, activos
- Porcentaje de la clase en cada categoria
- Filtros rapidos: Solo criticos, Solo advertencias, Todos
- Ordenamiento por: estado de riesgo, dias sin actividad, progreso

### RF-ANA-002.4: Panel de Detalle de Riesgo

Al hacer clic en un estudiante en riesgo, el sistema **DEBE** mostrar:

- Factores de riesgo (dias sin actividad, progreso %)
- Ultima actividad (nombre, modulo, fecha)
- Modulos sin iniciar y modulos incompletos
- Comparacion visual con promedio de clase
- Boton para ir al perfil completo del estudiante

---

## Criterios de Aceptacion

### AC-001: Timeline Funcional
- [x] Timeline muestra ultimas 50 actividades
- [x] Cada tipo de actividad tiene icono y color distintivo
- [x] Filtro por rango de fechas funciona correctamente
- [x] Auto-refresh se ejecuta cada 2 minutos
- [x] "Cargar mas" carga siguiente pagina de actividades

### AC-002: Indicadores de Actividad
- [x] Badge muestra estudiantes activos hoy
- [x] Badge muestra actividades completadas hoy
- [x] Grafica de 7 dias muestra datos correctos

### AC-003: Estudiantes en Riesgo
- [x] Estudiantes se categorizan correctamente segun reglas
- [x] Contadores muestran totales por categoria
- [x] Filtros cambian la lista mostrada
- [x] Estudiantes criticos aparecen primero por defecto

### AC-004: Panel de Detalle
- [x] Modal muestra informacion completa del estudiante
- [x] Factores de riesgo son precisos
- [x] Comparacion con clase es correcta
- [x] Navegacion a perfil completo funciona

### AC-005: Performance
- [x] Timeline carga en menos de 1 segundo
- [x] Vista de riesgo carga en menos de 2 segundos
- [x] Skeleton loaders se muestran durante la carga

---

## Casos de Uso

### UC-ANA-004: Profesor monitorea actividad en tiempo casi real

**Actor:** Profesor
**Precondiciones:** Profesor autenticado con clase asignada

**Flujo:**
1. Profesor navega a vista de actividad
2. Sistema muestra timeline de actividades recientes
3. Sistema muestra indicadores del dia (activos, completadas)
4. Profesor ve que 12 estudiantes estan activos hoy
5. Cada 2 minutos, el timeline se actualiza automaticamente

**Resultado:** Profesor tiene visibilidad de la actividad en curso

### UC-ANA-005: Profesor identifica estudiantes en riesgo

**Actor:** Profesor
**Precondiciones:** Profesor en vista de estudiantes en riesgo

**Flujo:**
1. Profesor navega a vista de estudiantes en riesgo
2. Sistema muestra contadores: 5 criticos, 8 advertencias, 12 activos
3. Sistema muestra alerta: "5 estudiantes en estado critico"
4. Profesor filtra por "Solo criticos"
5. Profesor ve lista de estudiantes con >7 dias inactivos o <30% progreso
6. Profesor hace clic en estudiante para ver detalles
7. Sistema muestra panel con factores de riesgo

**Resultado:** Profesor identifica estudiantes que requieren intervencion

### UC-ANA-006: Profesor revisa detalle de estudiante en riesgo

**Actor:** Profesor
**Precondiciones:** Profesor selecciono estudiante en riesgo

**Flujo:**
1. Profesor hace clic en estudiante en riesgo
2. Sistema muestra panel de detalle
3. Panel muestra: 10 dias sin actividad, 25% progreso
4. Panel muestra: 5 modulos sin iniciar, 2 incompletos
5. Panel muestra: 40.5% por debajo del promedio
6. Profesor decide contactar al estudiante
7. (Futuro) Profesor usa "Enviar Mensaje" cuando este disponible

**Resultado:** Profesor tiene contexto completo para intervenir

---

## Consideraciones de Seguridad

### Autorizacion
- Solo profesores pueden ver actividades de sus clases
- Estudiantes no ven actividades de otros estudiantes
- Validacion de acceso en cada endpoint

### Rate Limiting
- Timeline: maximo 30 requests por minuto por usuario
- Auto-refresh no debe sobrecargar el servidor

---

## Notas de Implementacion

1. **Logging de Actividades:**
   - Crear ActivityLog al completar ejercicio
   - Crear ActivityLog al iniciar modulo
   - Crear ActivityLog al subir de nivel
   - Crear ActivityLog al desbloquear achievement

2. **Performance:**
   - Indice compuesto en (classroomId, timestamp)
   - Cachear estadisticas del dia por 1 minuto
   - Limitar a 50 actividades por request

3. **Calculo de Riesgo:**
   - Ejecutar calculo on-demand (no pre-computar)
   - Cachear resultado por 5 minutos
   - Reglas hardcodeadas en alcance inicial (configurables en extension futura)

4. **UX:**
   - Highlight de actividad mas reciente
   - Alertas visuales prominentes para criticos
   - Tooltips explicativos en botones deshabilitados (funcionalidad futura)

---

## Alcance Basico vs Extensiones

### EAI-004 (Este alcance - Analytics Basico):
- Timeline de ultimas 50 actividades
- Filtro simple por rango de fechas
- Auto-refresh cada 2 minutos
- Reglas de riesgo hardcodeadas (7 dias, 30%, 50%)
- Acciones rapidas como placeholder (UI disabled)

### EXT-005 (Extension futura - Reportes Avanzados):
- Filtros avanzados (por estudiante, modulo, tipo)
- Analisis predictivo con ML (probabilidad de abandono)
- Alertas automaticas configurables por email
- Reglas de riesgo personalizables por profesor
- Real-time con WebSockets
- Integracion con sistema de mensajeria

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Team | Creacion inicial del requerimiento |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-004-analytics/requerimientos/RF-ANA-002-metricas-gamificacion.md`
