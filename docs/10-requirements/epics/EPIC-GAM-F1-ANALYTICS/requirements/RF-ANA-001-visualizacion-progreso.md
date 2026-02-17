---
id: "RF-ANA-001"
title: "Visualizacion de Progreso del Estudiante"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Analytics"
epic: "EAI-004"
version: "1.0"
labels: ["analytics", "dashboard", "progress", "student", "teacher-view"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# RF-ANA-001: Visualizacion de Progreso del Estudiante

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-ANA-001 |
| **Modulo** | Analytics |
| **Prioridad** | Alta |
| **Estado** | Done |
| **Version** | 1.0 |
| **Fecha creacion** | 2026-01-20 |
| **Ultima actualizacion** | 2026-01-20 |

## Referencias

### Especificacion Tecnica
- [ET-ANA-001: Dashboard del Estudiante](../specifications/ET-ANA-001-dashboard-estudiante.md)

### Historias de Usuario Relacionadas
- [US-ANA-001](../user-stories/US-ANA-001/US-ANA-001-dashboard-clase-basico.md) - Dashboard de Clase Basico
- [US-ANA-002](../user-stories/US-ANA-002/US-ANA-002-tabla-estudiantes-metricas.md) - Tabla de Estudiantes con Metricas
- [US-ANA-003](../user-stories/US-ANA-003/US-ANA-003-vista-estudiante-individual.md) - Vista de Estudiante Individual

---

## Descripcion del Requerimiento

### Contexto

El sistema Gamilit necesita proporcionar a los profesores herramientas visuales para monitorear el progreso de sus estudiantes. La visualizacion del progreso permite:
- Identificar rapidamente el estado general de la clase
- Detectar estudiantes que necesitan atencion
- Celebrar los logros de la clase
- Tomar decisiones informadas sobre la ensenanza

### Necesidad del Negocio

**Problema:**
Sin un sistema de visualizacion de progreso:
- Profesores no pueden ver el estado general de su clase de un vistazo
- Es dificil identificar estudiantes rezagados
- No hay forma de comparar el avance entre estudiantes
- La toma de decisiones pedagogicas carece de datos

**Solucion:**
Implementar un sistema de dashboards y vistas que presenten el progreso de los estudiantes de forma clara, visual e intuitiva, permitiendo al profesor monitorear a nivel de clase e individual.

---

## Requerimiento Funcional

### RF-ANA-001.1: Dashboard de Clase

El sistema **DEBE** proporcionar un dashboard de clase que muestre:

#### Metricas Generales
- Numero total de estudiantes en la clase
- Porcentaje de completitud promedio de la clase
- Nivel promedio de los estudiantes
- XP total acumulado de la clase

#### Visualizaciones Graficas
- Grafica de barras: distribucion de estudiantes por nivel
- Grafica de pie chart: porcentaje de modulos completados vs pendientes
- Grafica de barras: progreso por modulo educativo

#### Actividades Recientes
- Lista de las ultimas 10 actividades de la clase
- Cada actividad muestra: estudiante, modulo, actividad, fecha/hora
- Ordenadas de mas reciente a mas antigua
- Actualizacion automatica cada 5 minutos

### RF-ANA-001.2: Lista de Estudiantes

El sistema **DEBE** proporcionar una tabla de estudiantes con:

#### Columnas Requeridas
- Avatar/foto del estudiante
- Nombre completo
- Progreso general (% completitud con barra visual)
- Nivel actual (con icono de insignia)
- XP acumulado
- Ultima actividad (fecha/hora relativa)
- Boton de accion "Ver Detalle"

#### Funcionalidades
- Ordenamiento por cualquier columna (ascendente/descendente)
- Busqueda basica por nombre del estudiante
- Paginacion (50 estudiantes por pagina)

#### Indicadores Visuales
- Progreso <30%: barra roja
- Progreso 30-70%: barra amarilla
- Progreso >70%: barra verde
- Ultima actividad >7 dias: fecha en rojo (alerta)
- Ultima actividad 3-7 dias: fecha en amarillo (advertencia)
- Ultima actividad <3 dias: fecha en verde (activo)

### RF-ANA-001.3: Vista Individual de Estudiante

El sistema **DEBE** proporcionar una vista detallada por estudiante que incluya:

#### Informacion del Perfil
- Avatar y nombre completo
- Nivel actual con icono de insignia
- XP total acumulado
- Progreso general (% completitud)
- Fecha de ultima actividad

#### Progreso por Modulo
- Lista de todos los modulos asignados a la clase
- Para cada modulo: nombre, porcentaje, actividades completadas/total, estado
- Barra de progreso visual para cada modulo
- Estados: completado (verde), en progreso (amarillo), no iniciado (gris)

#### Actividades Completadas
- Lista de las ultimas 20 actividades completadas
- Informacion: nombre, modulo, fecha/hora, puntaje, XP ganado
- Ordenadas de mas reciente a mas antigua

#### Metricas de Tiempo
- Tiempo total invertido en la plataforma
- Promedio de tiempo por sesion
- Numero total de sesiones
- Ultima sesion (fecha y duracion)

---

## Criterios de Aceptacion

### AC-001: Dashboard Funcional
- [x] Dashboard muestra metricas generales de la clase
- [x] Graficas se renderizan correctamente en desktop y mobile
- [x] Actividades recientes se actualizan cada 5 minutos
- [x] Selector de clase funciona si el profesor tiene multiples clases

### AC-002: Lista de Estudiantes Operativa
- [x] Tabla muestra todos los estudiantes con metricas
- [x] Ordenamiento por columna funciona correctamente
- [x] Busqueda filtra en tiempo real (debounce 300ms)
- [x] Paginacion funciona correctamente
- [x] Indicadores de color se aplican segun reglas

### AC-003: Vista Individual Completa
- [x] Perfil muestra informacion completa del estudiante
- [x] Progreso por modulo es preciso y actualizado
- [x] Actividades completadas se muestran con detalles
- [x] Metricas de tiempo se calculan correctamente

### AC-004: Performance
- [x] Dashboard carga en menos de 2 segundos
- [x] Lista de estudiantes carga en menos de 1 segundo
- [x] Vista individual carga en menos de 1 segundo
- [x] Skeleton loaders se muestran durante la carga

### AC-005: Navegacion
- [x] Navegacion entre vistas es fluida
- [x] Breadcrumbs permiten volver a vistas anteriores
- [x] Clic en estudiante navega a su vista individual

---

## Casos de Uso

### UC-ANA-001: Profesor revisa estado general de la clase

**Actor:** Profesor
**Precondiciones:** Profesor autenticado con clase asignada

**Flujo:**
1. Profesor accede al dashboard de su clase
2. Sistema muestra metricas generales (estudiantes, progreso, nivel, XP)
3. Sistema renderiza graficas de distribucion
4. Sistema lista actividades recientes
5. Profesor puede cambiar de clase si tiene multiples

**Resultado:** Profesor tiene vision general del estado de su clase

### UC-ANA-002: Profesor identifica estudiantes con bajo progreso

**Actor:** Profesor
**Precondiciones:** Profesor en vista de lista de estudiantes

**Flujo:**
1. Profesor navega a lista de estudiantes
2. Profesor ordena por columna "Progreso" ascendente
3. Sistema muestra estudiantes con menor progreso primero
4. Profesor identifica estudiantes con barra roja (<30%)
5. Profesor hace clic en estudiante para ver detalles

**Resultado:** Profesor identifica estudiantes que necesitan atencion

### UC-ANA-003: Profesor analiza progreso individual de estudiante

**Actor:** Profesor
**Precondiciones:** Profesor selecciono un estudiante

**Flujo:**
1. Profesor hace clic en estudiante de la lista
2. Sistema muestra vista individual del estudiante
3. Profesor revisa progreso por modulo
4. Profesor identifica modulos no iniciados o incompletos
5. Profesor revisa actividades recientes y tiempo invertido

**Resultado:** Profesor comprende el estado detallado del estudiante

---

## Consideraciones de Seguridad

### Autorizacion
- Solo profesores pueden ver datos de sus propias clases
- Validacion de acceso en cada endpoint
- Un profesor no puede ver clases de otro profesor

### Privacidad de Datos
- Los datos de progreso son sensibles
- Solo se muestran a profesores autorizados
- Los estudiantes no ven datos de otros estudiantes

---

## Notas de Implementacion

1. **Performance:**
   - Cachear metricas del dashboard por 5 minutos (Redis)
   - Indices en columnas frecuentemente consultadas
   - Paginacion obligatoria en listas

2. **UX:**
   - Skeleton loaders para mejor percepcion de velocidad
   - Mensajes amigables cuando no hay datos
   - Responsive para mobile y desktop

3. **Escalabilidad:**
   - Queries optimizados para clases grandes (>100 estudiantes)
   - Considerar pre-calculo nocturno para metricas pesadas

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Team | Creacion inicial del requerimiento |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-004-analytics/requerimientos/RF-ANA-001-visualizacion-progreso.md`
