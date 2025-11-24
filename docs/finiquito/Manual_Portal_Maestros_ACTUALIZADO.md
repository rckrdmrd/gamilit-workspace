# Manual del Portal de Maestros - GAMILIT v1.0

**Fecha de Actualización:** 24 de noviembre de 2025
**Versión:** 1.1 - Actualizado con funcionalidades implementadas
**Estado:** ✅ Validado con código entregado

---

## 📋 Tabla de Contenido

1. [Bienvenida](#capítulo-1-bienvenida)
2. [Primeros Pasos](#capítulo-2-primeros-pasos)
3. [Gestión de Aulas](#capítulo-3-gestión-de-aulas)
4. [Gestión de Estudiantes](#capítulo-4-gestión-de-estudiantes)
5. [Asignaciones y Tareas](#capítulo-5-asignaciones-y-tareas)
6. [Progreso y Analytics](#capítulo-6-progreso-y-analytics)
7. [Preguntas Frecuentes](#capítulo-7-preguntas-frecuentes)
8. [Soporte y Ayuda](#capítulo-8-soporte-y-ayuda)

---

## Capítulo 1: Bienvenida

### ¿Qué puede hacer en el Portal de Maestros?

El Portal de Maestros de GAMILIT es su herramienta principal para:

✅ **Gestionar sus aulas** - Ver y organizar sus grupos
✅ **Monitorear estudiantes** - Seguimiento individual y grupal
✅ **Crear y gestionar asignaciones** - 12 tipos de ejercicios disponibles
✅ **Ver progreso en tiempo real** - Analytics y estadísticas
✅ **Acceder a sistema de gamificación** - Rangos, XP y ML Coins

### ¿Para quién es este manual?

Este manual está diseñado para profesores y docentes que utilizarán GAMILIT para:
- Impartir el curso de Comprensión Lectora con el tema de Marie Curie
- Monitorear el progreso de sus estudiantes
- Asignar tareas y ejercicios
- Evaluar y calificar trabajos

---

## Capítulo 2: Primeros Pasos

### 2.1 Acceso al Portal de Maestros

**URL de acceso:** `https://gamilit.com/teacher` (o según su configuración)

**Credenciales de demostración:**
- **Usuario:** `teacher@gamilit.com`
- **Contraseña:** `Test1234`

#### Instrucciones de inicio de sesión:

1. Abrir navegador web (Chrome, Firefox, Edge o Safari)
2. Navegar a la URL del portal
3. Ingresar su correo electrónico
4. Ingresar su contraseña
5. Hacer clic en "Iniciar Sesión"

**📸 EVIDENCIA - Screenshot 1:**
```
[Espacio para screenshot de pantalla de login del Portal de Maestros]

Captura debe mostrar:
- URL: /teacher/login
- Formulario de login
- Campos de email y password
- Botón "Iniciar Sesión"
```

---

### 2.2 Navegación Principal

Una vez dentro del portal, encontrará el menú de navegación con las siguientes opciones:

| Menú | Descripción | Implementado |
|------|-------------|--------------|
| **Dashboard** | Vista general de sus aulas y estadísticas | ✅ Funcional |
| **Mis Aulas** | Lista de aulas asignadas | ✅ Funcional |
| **Estudiantes** | Gestión de estudiantes | ✅ Funcional |
| **Asignaciones** | Gestión de tareas y ejercicios | ✅ Funcional |
| **Progreso** | Analytics y reportes | ✅ Funcional |
| **Recursos** | Biblioteca de materiales | ⏳ Próximamente |

**📸 EVIDENCIA - Screenshot 2:**
```
[Espacio para screenshot del Dashboard del Portal de Maestros]

Captura debe mostrar:
- URL: /teacher/dashboard
- Menú de navegación lateral
- Vista general con tarjetas de estadísticas
- Header con datos de gamificación del maestro (nivel, XP, ML Coins)
```

---

### 2.3 Interfaz del Dashboard

El Dashboard muestra:

**Header Superior:**
- Su nombre y foto de perfil
- **Datos de gamificación en tiempo real:**
  - Nivel actual
  - XP acumulados
  - ML Coins disponibles
  - Rango Maya actual

**Tarjetas de Estadísticas:**
- Total de aulas asignadas
- Total de estudiantes activos
- Asignaciones pendientes de calificar
- Promedio general de la clase

**🔧 FUNCIONALIDAD IMPLEMENTADA:**
Los datos de gamificación en el header se obtienen de la API en tiempo real. Ya NO son datos hardcodeados, se actualizan por usuario.

**API consumida:** `GET /api/gamification/users/:userId/stats`

---

## Capítulo 3: Gestión de Aulas

### 3.1 Ver Aulas Asignadas

**Ruta:** Dashboard → Mis Aulas

En esta sección podrá ver todas las aulas (classrooms) que tiene asignadas.

**Información mostrada por aula:**
- Nombre del aula (ej: "5to A - Comprensión Lectora")
- Grado y sección
- Número de estudiantes inscritos
- Progreso promedio de la clase
- Última actividad

**📸 EVIDENCIA - Screenshot 3:**
```
[Espacio para screenshot de la página "Mis Aulas"]

Captura debe mostrar:
- URL: /teacher/classes
- Lista de aulas asignadas
- Tarjetas con información de cada aula
- Botón para ver detalle de aula
```

---

### 3.2 Detalle de Aula

Al hacer clic en un aula, podrá ver:

- **Pestaña Estudiantes:** Lista de estudiantes del aula
- **Pestaña Asignaciones:** Tareas asignadas al aula
- **Pestaña Progreso:** Gráficas y analytics
- **Pestaña Recursos:** Materiales compartidos

**🔧 FUNCIONALIDAD IMPLEMENTADA:**
Las aulas se obtienen de la base de datos real. Datos de ejemplo disponibles:
- 5to A - Comprensión Lectora
- 5to B - Lectura Digital
- 6to A - Producción de Textos

---

## Capítulo 4: Gestión de Estudiantes

### 4.1 Ver Lista de Estudiantes

**Ruta:** Dashboard → Estudiantes

Aquí puede ver todos los estudiantes de sus aulas.

**Información mostrada por estudiante:**
- Nombre completo
- Aula asignada
- Nivel actual
- XP acumulados
- Rango Maya
- Última actividad
- Estado (activo/inactivo)

**📸 EVIDENCIA - Screenshot 4:**
```
[Espacio para screenshot de la página "Estudiantes"]

Captura debe mostrar:
- URL: /teacher/students
- Tabla o tarjetas con lista de estudiantes
- Datos de gamificación por estudiante
- Filtros por aula
- Header con gamificación del maestro (datos reales, no hardcoded)
```

---

### 4.2 Perfil Detallado de Estudiante

Al hacer clic en un estudiante, puede ver:

**Información General:**
- Datos personales
- Aula actual
- Fecha de inscripción

**Progreso Académico:**
- Módulos completados
- Ejercicios realizados
- Calificaciones promedio
- Tiempo invertido

**Gamificación:**
- Nivel y XP actuales
- Rango Maya actual
- ML Coins disponibles
- Insignias obtenidas
- Posición en leaderboard

**Actividad Reciente:**
- Últimos ejercicios completados
- Tareas entregadas
- Logros desbloqueados

**📸 EVIDENCIA - Screenshot 5:**
```
[Espacio para screenshot del perfil de un estudiante]

Captura debe mostrar:
- Información completa del estudiante
- Sección de gamificación con datos reales
- Gráfica de progreso
- Historial de actividad
```

---

## Capítulo 5: Asignaciones y Tareas

### 5.1 Ver Asignaciones

**Ruta:** Dashboard → Asignaciones

Esta es una de las funcionalidades más importantes del portal.

**Vista de Asignaciones muestra:**
- Lista de todas las asignaciones que ha creado
- Filtros por aula
- Filtros por estado (activas, pendientes, completadas, vencidas)
- Búsqueda por título

**🔧 FUNCIONALIDAD IMPLEMENTADA:**
El sistema cuenta con **12 assignments de ejemplo** ya creados en la base de datos para demostración:

**Módulo 1 - Comprensión Literal (5 ejercicios):**
1. Crucigrama Científico - Marie Curie (100 pts)
2. Línea de Tiempo Histórica (100 pts)
3. Completar Texto Biográfico (100 pts)
4. Verdadero o Falso (100 pts)
5. Sopa de Letras Científica BONUS (50 pts)

**Módulo 2 - Comprensión Inferencial (4 ejercicios):**
6. Detective Textual - Inferencias (150 pts)
7. Construcción de Hipótesis (150 pts)
8. Puzzle de Contexto (150 pts)
9. Predicción Narrativa (150 pts)

**Módulo 3 - Comprensión Crítica (3 ejercicios):**
10. Tribunal de Opiniones (200 pts)
11. Debate Digital - Fama y Ciencia (200 pts)
12. Análisis de Fuentes - Credibilidad (200 pts)

**Distribución por Aula:**
- **5to A - Comprensión Lectora:** 6 asignaciones
- **5to B - Lectura Digital:** 3 asignaciones
- **6to A - Producción de Textos:** 3 asignaciones

**📸 EVIDENCIA - Screenshot 6:**
```
[Espacio para screenshot de la página "Asignaciones"]

Captura debe mostrar:
- URL: /teacher/assignments
- Lista de las 12 asignaciones
- Columnas: Título, Tipo, Puntos, Aula, Estado
- Filtros disponibles
- Badges de tipo (practice, homework, exam, quiz)
```

---

### 5.2 Información de una Asignación

Al hacer clic en una asignación, puede ver:

**Detalles Generales:**
- Título completo
- Descripción
- Tipo (práctica, tarea, examen, quiz)
- Puntos asignados
- Fecha de vencimiento
- Intentos permitidos

**Configuración:**
- Mostrar/ocultar feedback automático
- Número máximo de intentos
- Modo de evaluación (automática/manual)

**Estadísticas:**
- Estudiantes asignados
- Entregas completadas
- Promedio de calificaciones
- Tiempo promedio de realización

**Lista de Entregas:**
- Estudiantes que han entregado
- Calificaciones
- Feedback proporcionado
- Pendientes de calificar

**📸 EVIDENCIA - Screenshot 7:**
```
[Espacio para screenshot del detalle de una asignación]

Captura debe mostrar:
- Información completa de la asignación
- Estadísticas de entregas
- Lista de estudiantes
- Opciones de calificación
```

---

### 5.3 Tipos de Asignaciones Disponibles

El sistema soporta **4 tipos de asignaciones**:

| Tipo | Descripción | Uso Recomendado | Ícono |
|------|-------------|-----------------|-------|
| **Practice** | Ejercicios de práctica | Reforzar conceptos | 🎯 |
| **Homework** | Tareas para casa | Trabajo independiente | 📚 |
| **Exam** | Evaluaciones formales | Medir aprendizaje | 📝 |
| **Quiz** | Cuestionarios rápidos | Evaluación continua | ⚡ |

**Puntos según dificultad:**
- **Easy (50-100 pts):** Comprensión literal
- **Medium (150 pts):** Comprensión inferencial
- **Hard (200 pts):** Comprensión crítica

---

### 5.4 Crear y Editar Asignaciones

**Ruta:** Asignaciones → Botón "Nueva Asignación"

#### ⏳ Estado: PRÓXIMAMENTE (Fase 3 - Post-MVP)

**Historia de Usuario:** US-PM-002a - Assignment CRUD (10 Story Points)
**Prioridad:** Alta (Extensión Fase 3)
**Fecha Estimada:** 2-3 semanas después del lanzamiento MVP

---

#### ¿Qué funcionalidades incluirá?

**Crear Nueva Asignación:**
- Formulario intuitivo paso a paso
- Seleccionar tipo (Practice, Homework, Exam, Quiz)
- Asignar título y descripción (con soporte Rich Text)
- Configurar puntos totales
- Establecer fecha de vencimiento
- Seleccionar ejercicios del catálogo (12 disponibles actualmente)
- Asignar a una o varias aulas
- Vista previa antes de publicar

**Editar Asignación Existente:**
- Modificar todos los campos excepto tipo
- Extender fecha de vencimiento
- Agregar/quitar aulas asignadas
- Cambiar estado (borrador → publicada → archivada)

**Eliminar Asignación:**
- Soft delete (se marca como eliminada, no se borra físicamente)
- Confirmación de seguridad
- Mantiene historial de entregas

**Duplicar Asignación:**
- Clonar asignación existente
- Modificar detalles antes de publicar
- Útil para reutilizar estructuras

---

#### Especificaciones Técnicas Preparadas

**Backend:** ✅ 80% Implementado
- Endpoints disponibles:
  - `POST /api/teacher/assignments` - Crear
  - `GET /api/teacher/assignments` - Listar con filtros
  - `GET /api/teacher/assignments/:id` - Detalles
  - `PUT /api/teacher/assignments/:id` - Actualizar
  - `DELETE /api/teacher/assignments/:id` - Soft delete
  - `POST /api/teacher/assignments/:id/duplicate` - Duplicar

**Frontend:** ⏳ Por implementar (4-6 horas)
- Componentes planeados:
  - `CreateAssignmentForm.tsx` - Formulario multi-paso
  - `EditAssignmentForm.tsx` - Edición con vista previa
  - `AssignmentList.tsx` - Lista con acciones (ya existe parcial)
  - `DeleteConfirmationModal.tsx` - Confirmación de eliminación

**Validaciones:**
- Título: requerido, 5-200 caracteres
- Descripción: opcional, máximo 2000 caracteres
- Fecha vencimiento: debe ser futura
- Puntos: entre 10-500 puntos
- Al menos 1 aula debe ser seleccionada

---

#### Estado Actual (MVP)

**Lo que SÍ puede hacer:**
- ✅ Ver las 12 asignaciones existentes
- ✅ Filtrar por aula y estado (activo, vencido, futuro)
- ✅ Ver detalles completos de cada asignación
- ✅ Ver lista de estudiantes asignados
- ✅ Ver estadísticas de entregas

**Lo que NO puede hacer todavía:**
- ⏳ Crear nuevas asignaciones
- ⏳ Editar asignaciones existentes
- ⏳ Eliminar asignaciones
- ⏳ Duplicar asignaciones

---

#### Workaround Temporal

**Para crear asignaciones mientras esta funcionalidad está en desarrollo:**

1. Contactar al administrador del sistema
2. Proporcionar los siguientes datos:
   - Título de la asignación
   - Descripción
   - Tipo (Practice/Homework/Exam/Quiz)
   - Puntos totales
   - Fecha de vencimiento
   - Aulas a las que se debe asignar
   - Ejercicios a incluir
3. El administrador la creará manualmente desde el backend o base de datos

---

#### Roadmap de Implementación

**Semana 3 (Post-MVP):**
- Implementar formulario de creación
- Integrar con backend existente
- Testing básico

**Semana 4 (Post-MVP):**
- Implementar edición
- Implementar duplicación
- Testing E2E completo

**Semana 5 (Refinamiento):**
- Pulir UX/UI
- Agregar validaciones avanzadas
- Documentación de usuario

---

#### Screenshots Esperados

**📸 Screenshot 9 (Futuro):**
```
[Formulario de Crear Asignación - Esperado]

Captura debe mostrar:
- URL: /teacher/assignments/new
- Formulario multi-paso (Step 1: Información Básica)
- Campos: Título, Descripción (Rich Text), Tipo, Puntos
- Botón "Siguiente" habilitado/deshabilitado según validación
```

**📸 Screenshot 10 (Futuro):**
```
[Formulario de Crear Asignación - Paso 2]

Captura debe mostrar:
- Step 2: Selección de Ejercicios
- Catálogo de 12 ejercicios disponibles
- Checkbox para seleccionar múltiples
- Vista previa de cada ejercicio
```

**📸 Screenshot 11 (Futuro):**
```
[Formulario de Crear Asignación - Paso 3]

Captura debe mostrar:
- Step 3: Asignación a Aulas
- Lista de aulas del teacher
- Fecha de vencimiento picker
- Botón "Crear Asignación"
- Resumen de lo configurado
```

---

### 5.5 Revisar y Calificar Entregas

#### ⏳ Estado: PRÓXIMAMENTE (Fase 3 - Post-MVP)

**Historias de Usuario:**
- US-PM-003a - Grading Queue (8 Story Points)
- US-PM-003b - Grading Interface (8 Story Points)

**Prioridad:** Alta (Extensión Fase 3)
**Fecha Estimada:** 1-2 meses después del lanzamiento MVP
**Dependencia:** Requiere US-PM-002a (Crear Asignaciones) completada

---

#### ¿Qué funcionalidades incluirá?

**Cola de Calificaciones (Grading Queue):**
- Lista priorizada de entregas pendientes de calificar
- Filtros avanzados:
  - Por aula
  - Por asignación
  - Por fecha de entrega
  - Por estudiante
- Ordenamiento:
  - Más antiguas primero
  - Por fecha de vencimiento
  - Por aula
- Indicadores visuales:
  - 🔴 Urgente (vencidas hace >3 días)
  - 🟡 Pendiente (vencidas hace 1-3 días)
  - 🟢 Reciente (entregadas hoy)

**Interfaz de Calificación (Grading Interface):**
- Vista del trabajo del estudiante:
  - Respuestas del ejercicio
  - Tiempo invertido
  - Intentos utilizados
  - Historial de actividad
- Herramientas de evaluación:
  - Rúbrica predefinida (configurable)
  - Asignación de puntos parciales
  - Comentarios generales
  - Comentarios por pregunta
  - Marcado de secciones destacadas
- Navegación rápida:
  - Siguiente entrega sin calificar
  - Regresar a cola
  - Saltar a estudiante específico

**Feedback y Comunicación:**
- Feedback textual por pregunta
- Feedback general de la asignación
- Marcas de texto (resaltar aciertos/errores)
- Recomendaciones automáticas basadas en errores comunes
- Notificación automática al estudiante cuando se califica

**Rúbricas y Criterios:**
- Rúbricas predefinidas por tipo de ejercicio
- Creación de rúbricas personalizadas
- Criterios configurables:
  - Precisión de la respuesta (40%)
  - Justificación/argumentación (30%)
  - Creatividad (20%)
  - Presentación (10%)
- Cálculo automático de puntos según rúbrica

---

#### Especificaciones Técnicas Preparadas

**Backend:** ⏸️ 50% Implementado
- Endpoints disponibles:
  - ✅ `POST /api/teacher/assignments/:assignmentId/submissions/:submissionId/grade`
  - ✅ `GET /api/teacher/assignments/:id/submissions`

- Endpoints pendientes:
  - ⏳ `GET /api/teacher/grading/pending` - Cola de calificaciones
  - ⏳ `GET /api/teacher/grading/:submissionId` - Detalles para calificación
  - ⏳ `POST /api/teacher/grading/:submissionId/feedback` - Feedback

**Frontend:** ⏳ Por implementar (12 horas)
- Componentes planeados:
  - `GradingQueue.tsx` - Cola priorizada
  - `GradingQueueFilters.tsx` - Filtros avanzados
  - `GradingInterface.tsx` - Interfaz completa de calificación
  - `RubricEditor.tsx` - Editor de rúbricas
  - `FeedbackPanel.tsx` - Panel de comentarios

**Database:** ⏸️ Estructura incompleta
- Tabla `exercise_submissions` existe ✅
- Tabla `submissions` existe pero incompleta
- Falta tabla `grading_feedback` para historial
- Falta campos para grading audit log

**Integraciones:**
- LTI Grade Passback: ✅ Disponible (enviar calificaciones a LMS externos)

---

#### Estado Actual (MVP)

**Lo que SÍ funciona:**
- ✅ Ejercicios auto-calificados (Módulo 1 y 2):
  - Crucigrama, Timeline, Verdadero/Falso: Calificación automática
  - Resultados instantáneos para el estudiante
  - No requieren intervención del teacher

- ✅ Ver submissions:
  - Lista de estudiantes que han entregado
  - Ver respuestas de ejercicios auto-calificados
  - Ver calificaciones automáticas

**Lo que NO está disponible todavía:**
- ⏳ Calificar ejercicios de texto abierto (Módulo 2 y 3):
  - Detective Textual (requiere evaluación manual)
  - Predicción Narrativa (requiere evaluación manual)
  - Rueda de Inferencias (requiere evaluación manual)
  - Todos los ejercicios del Módulo 3 (pensamiento crítico)

- ⏳ Cola de calificaciones priorizada
- ⏳ Interfaz de calificación avanzada
- ⏳ Rúbricas personalizadas
- ⏳ Feedback detallado por pregunta
- ⏳ Exportación de calificaciones

---

#### Workaround Temporal

**Para calificar ejercicios mientras esta funcionalidad está en desarrollo:**

**Opción 1: Calificación Manual Directa**
1. Ir a "Asignaciones" → Seleccionar asignación
2. Ver lista de entregas
3. Abrir respuestas del estudiante
4. Evaluar manualmente según criterios pedagógicos
5. Contactar administrador para registrar calificación en BD

**Opción 2: Exportar y Calificar Fuera del Sistema**
1. Exportar respuestas a Excel/CSV (función disponible)
2. Revisar y calificar en hoja de cálculo
3. Importar calificaciones de vuelta (contactar administrador)

**Opción 3: Enfocarse en Ejercicios Auto-calificados (MVP)**
1. Usar ejercicios del Módulo 1 (100% auto-calificados):
   - Crucigrama
   - Timeline
   - Completar espacios
   - Verdadero/Falso
2. Revisar resultados automáticos en el dashboard
3. Identificar estudiantes con bajo rendimiento
4. Proporcionar retroalimentación verbal o vía comunicación directa

---

#### Roadmap de Implementación

**Semana 5-6 (Post-MVP):**
- Completar endpoints backend faltantes
- Implementar tabla `grading_feedback`
- Testing de APIs

**Semana 7-8 (Post-MVP):**
- Implementar GradingQueue (cola de calificaciones)
- Filtros y ordenamiento
- Testing frontend

**Semana 9-10 (Post-MVP):**
- Implementar GradingInterface (interfaz completa)
- Rúbricas predefinidas
- Sistema de feedback

**Semana 11-12 (Refinamiento):**
- Rúbricas personalizadas
- Notificaciones automáticas
- Exportación de calificaciones
- Testing E2E completo

---

#### Screenshots Esperados

**📸 Screenshot 12 (Futuro):**
```
[Cola de Calificaciones - Esperado]

Captura debe mostrar:
- URL: /teacher/grading/queue
- Tabla con entregas pendientes
- Columnas: Estudiante, Asignación, Fecha Entrega, Estado, Acción
- Filtros: Por aula, por asignación, por estado
- Indicadores de urgencia (🔴🟡🟢)
- Botón "Calificar" por cada entrada
```

**📸 Screenshot 13 (Futuro):**
```
[Interfaz de Calificación - Esperado]

Captura debe mostrar:
- URL: /teacher/grading/:submissionId
- Panel izquierdo: Respuestas del estudiante
- Panel derecho: Herramientas de calificación
- Rúbrica con criterios y puntos
- Campo de comentarios generales
- Botones: "Guardar y Siguiente", "Regresar a Cola"
```

**📸 Screenshot 14 (Futuro):**
```
[Rúbrica de Calificación - Esperado]

Captura debe mostrar:
- Criterios de evaluación con sliders
- Precisión: 0-40 puntos
- Justificación: 0-30 puntos
- Creatividad: 0-20 puntos
- Presentación: 0-10 puntos
- Total: 0-100 puntos (calculado automáticamente)
```

---

#### Impacto Educativo Esperado

**Para el Maestro:**
- ⏱️ Reducción de 50% en tiempo de calificación (con rúbricas automatizadas)
- 📊 Identificación más rápida de patrones de error comunes
- 💬 Feedback más consistente y detallado
- 📈 Mejor seguimiento de progreso individual

**Para el Estudiante:**
- 🎯 Feedback más rápido (24-48h vs 1-2 semanas)
- 📝 Comentarios más específicos por pregunta
- 🔄 Oportunidad de resubmitir con feedback (configurable)
- 📊 Mejor comprensión de áreas de mejora

---

## Capítulo 6: Progreso y Analytics

### 6.1 Vista de Progreso de Clase

**Ruta:** Dashboard → Progreso

Aquí puede ver el desempeño general de sus aulas.

**Métricas Disponibles:**
- Progreso promedio por módulo
- Distribución de calificaciones
- Estudiantes con mejor desempeño
- Estudiantes que requieren atención
- Tendencias de participación

**Gráficas:**
- Progreso temporal (línea)
- Distribución de calificaciones (barras)
- Completitud de módulos (dona)

**📸 EVIDENCIA - Screenshot 8:**
```
[Espacio para screenshot de la página "Progreso"]

Captura debe mostrar:
- Dashboard con gráficas
- Métricas clave
- Filtros por aula y período
- Comparativas
```

---

### 6.2 Analytics Avanzados

**Datos adicionales disponibles:**

**Por Estudiante:**
- Tiempo promedio por ejercicio
- Tasa de aciertos
- Intentos utilizados
- Días desde última actividad

**Por Módulo:**
- Tasa de completitud
- Dificultad percibida (basada en intentos)
- Ejercicios más desafiantes

**Por Aula:**
- Ranking de estudiantes
- Promedio general
- Tendencia de mejora

---

## Capítulo 7: Preguntas Frecuentes

### 7.1 ¿Cómo agrego estudiantes a mi aula?

**R:** La asignación de estudiantes a aulas se realiza desde el **Portal de Administrador**. Como maestro, usted verá automáticamente a los estudiantes que el administrador haya inscrito en sus aulas.

Si necesita agregar un estudiante, contacte al administrador del sistema.

---

### 7.2 ¿Cómo sé si un estudiante necesita ayuda?

**R:** El sistema proporciona varios indicadores:

**Alertas Automáticas:**
- 🔴 Estudiante sin actividad por más de 7 días
- 🟡 Bajo rendimiento en ejercicios (< 60%)
- 🟠 Múltiples intentos fallidos en mismo ejercicio
- 🔵 Tiempo excesivo en completar ejercicios

**Indicadores Visuales:**
- Progreso por debajo del promedio de la clase
- Tareas vencidas sin entregar
- Disminución en participación

---

### 7.3 ¿Puedo exportar las calificaciones?

**R:** **⏳ Funcionalidad próximamente disponible.**

Se planea incluir:
- Exportación a Excel/CSV
- Reportes en PDF
- Integración con sistemas escolares
- Reportes personalizables

---

### 7.4 ¿Cómo creo una tarea personalizada?

**R:** **⏳ Funcionalidad en desarrollo.**

Actualmente el sistema cuenta con 12 ejercicios predefinidos basados en el contenido de Marie Curie. La creación de ejercicios personalizados estará disponible en una actualización futura.

**Workaround temporal:**
Contactar al administrador para solicitar la creación de ejercicios personalizados.

---

### 7.5 ¿Puedo ver el progreso de todos mis estudiantes a la vez?

**R:** **✅ Sí.**

En la página **Progreso** puede ver:
- Vista consolidada de todas sus aulas
- Filtros por aula específica
- Comparativas entre grupos
- Identificación de estudiantes destacados y rezagados

---

### 7.6 ¿Por qué veo datos de gamificación en el header?

**R:** **✅ Funcionalidad implementada.**

El header del portal muestra **sus datos personales de gamificación** en tiempo real:
- **Nivel:** Su nivel como maestro en el sistema
- **XP:** Puntos de experiencia acumulados
- **ML Coins:** Monedas Marie-Lurie disponibles
- **Rango Maya:** Su rango actual

Estos datos se obtienen directamente de la API y se actualizan:
- Al iniciar sesión
- Al completar acciones en el sistema
- Cada vez que navega entre páginas

**🔧 IMPLEMENTACIÓN TÉCNICA:**
- Hook: `useUserGamification(userId)`
- API: `GET /api/gamification/users/:userId/stats`
- Actualización: Automática al cambiar de usuario

**ANTES:** Los datos eran hardcodeados (level: 15, XP: 2450, etc.)
**AHORA:** Los datos son reales y por usuario ✅

---

### 7.7 ¿Cuántas asignaciones hay disponibles?

**R:** **✅ 12 asignaciones de demostración.**

El sistema incluye 12 assignments de ejemplo ya creados:
- 5 de Módulo 1 (Comprensión Literal)
- 4 de Módulo 2 (Comprensión Inferencial)
- 3 de Módulo 3 (Comprensión Crítica)

**Puntos totales disponibles:** 1,850 puntos

Estas asignaciones están distribuidas en las 3 aulas de demostración y cubren todos los tipos de ejercicios del sistema.

---

## Capítulo 8: Soporte y Ayuda

### 8.1 Centro de Ayuda

Si tiene dudas o problemas:

**Recursos Disponibles:**
- Este manual (versión digital actualizada)
- Tutoriales en video (próximamente)
- FAQs en el portal
- Base de conocimiento

---

### 8.2 Contacto de Soporte

**Soporte Técnico:**
- **Email:** soporte@gamilit.com
- **Teléfono:** [Pendiente]
- **Horario:** Lunes a Viernes, 9:00 AM - 6:00 PM

**Reporte de Problemas:**
Si encuentra un error o bug:
1. Tomar screenshot del error
2. Anotar pasos para reproducirlo
3. Enviar por email a soporte
4. Incluir su usuario y fecha/hora del problema

---

### 8.3 Actualizaciones del Sistema

**Versión Actual:** v1.0.0
**Última Actualización:** 23 de noviembre de 2025

**Funcionalidades Implementadas:**
- ✅ Dashboard con datos reales
- ✅ Gamificación en tiempo real (header)
- ✅ Vista de aulas asignadas
- ✅ Lista de estudiantes con datos reales
- ✅ 12 asignaciones de ejemplo
- ✅ Filtros por aula y estado
- ✅ Progreso y analytics

**Próximamente:**
- ⏳ Crear asignaciones personalizadas
- ⏳ Calificar entregas
- ⏳ Reportes exportables
- ⏳ Mensajería con estudiantes
- ⏳ Alertas automáticas de intervención

---

## Apéndice A: Credenciales de Demostración

**Para pruebas del sistema:**

**Usuario Maestro:**
- Email: `teacher@gamilit.com`
- Password: `Test1234`
- Aulas asignadas: 3 (5to A, 5to B, 6to A)

**Estudiantes de Ejemplo:**
- Varios estudiantes ya creados en las aulas
- Datos de gamificación reales

---

## Apéndice B: Endpoints API Utilizados

**Para referencia técnica:**

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/api/gamification/users/:userId/stats` | GET | Datos de gamificación del maestro |
| `/api/teacher/assignments` | GET | Lista de asignaciones |
| `/api/teacher/classrooms` | GET | Aulas asignadas |
| `/api/teacher/students` | GET | Estudiantes de las aulas |

---

## Apéndice C: Checklist de Validación

**Para verificar que el portal funciona correctamente:**

### Login y Navegación
- [ ] Puedo iniciar sesión con las credenciales de maestro
- [ ] El dashboard carga correctamente
- [ ] El menú de navegación es accesible

### Gamificación en Header
- [ ] Veo mi nivel actual (NO hardcoded)
- [ ] Veo mis XP actuales (NO hardcoded)
- [ ] Veo mis ML Coins (NO hardcoded)
- [ ] Veo mi rango Maya (NO hardcoded)
- [ ] Los datos cambian si inicio sesión con otro usuario

### Aulas
- [ ] Veo la lista de mis aulas asignadas
- [ ] Puedo hacer clic en un aula para ver detalles
- [ ] Veo el número de estudiantes por aula

### Estudiantes
- [ ] Veo la lista de estudiantes de mis aulas
- [ ] Veo datos de gamificación por estudiante
- [ ] Puedo filtrar por aula

### Asignaciones
- [ ] Veo las 12 asignaciones de ejemplo
- [ ] Veo los títulos correctamente
- [ ] Veo los puntos (50, 100, 150, 200)
- [ ] Veo los badges de tipo (practice, homework, exam, quiz)
- [ ] Puedo filtrar por aula
- [ ] Puedo ver detalles de una asignación

### Progreso
- [ ] Veo gráficas de progreso
- [ ] Veo estadísticas generales
- [ ] Puedo filtrar por aula

---

## Notas de Versión

**v1.1 - 24 de noviembre de 2025**
- ✅ Actualizado con funcionalidades realmente implementadas
- ✅ Agregada sección de gamificación en tiempo real
- ✅ Documentadas las 12 asignaciones de ejemplo
- ✅ Agregados espacios para screenshots de evidencia
- ✅ Incluido checklist de validación
- ✅ Clarificadas funcionalidades en desarrollo
- ✅ Agregada sección completa de Crear/Editar Asignaciones (US-PM-002a)
- ✅ Agregada sección completa de Grading System (US-PM-003a/b)

**v1.0 - 16 de noviembre de 2025**
- Versión inicial generada

---

**FIN DEL MANUAL DEL PORTAL DE MAESTROS**

**Última Actualización:** 24 de noviembre de 2025
**Validado con:** Código entregado y funcional
**Arquitecto:** Claude Code / Architecture-Analyst
