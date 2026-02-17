# ADR-009: Duración del Ejercicio 3.4 - Podcast Argumentativo

**Estado:** Aceptado
**Fecha:** 2025-11-23
**Autor:** Architecture-Analyst
**Relacionado con:** DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md, Módulo 3 - Comprensión Crítica y Valorativa

> **Nota:** Este ADR fue renumerado desde ADR-001 a ADR-009 el 2025-11-23 como parte de la consolidación de ADRs en docs/90-adr/. Originalmente ubicado en docs/adr/, se movió para mantener una única ubicación de ADRs en el proyecto.

---

## Contexto

Durante la validación arquitectónica del documento de diseño de mecánicas (v6.4), se identificó una contradicción en la especificación de referencia proporcionada para el Ejercicio 3.4 "Creación de Podcast Argumentativo":

- **Título de la sección:** "Estructura del Podcast (2 minutos)"
- **Descripción del objetivo:** "Crear un podcast de 3 minutos defendiendo o criticando una decisión de Marie Curie"
- **Guión ejemplo 1:** Introducción (0:00-0:20) + Argumentos (0:20-1:30) + Conclusión (1:30-2:00) = **2 minutos**
- **Guión ejemplo 2:** Introducción (30 seg) + Desarrollo (2 min) + Conclusión (30 seg) = **3 minutos**

Esta ambigüedad planteó la necesidad de tomar una decisión arquitectónica definitiva sobre la duración correcta del ejercicio.

### Estado del Documento v6.4

El documento implementado en la versión 6.4 ya había resuelto esta contradicción de la siguiente manera:

```yaml
Duración implementada: 2 minutos
Estructura:
  - Introducción: 30 segundos
  - Desarrollo: 1 minuto (reducido desde 2 min en versiones anteriores)
  - Conclusión: 30 segundos
Total: 120 segundos = 2 minutos
```

**Evidencia en changelog (línea 9):**
> ✅ Ejercicio 3.4: Duración de podcast ajustada a 2 minutos (desarrollo reducido a 1 min)

### Implicaciones Pedagógicas

**Duración 2 minutos:**
- ✅ Más manejable para estudiantes
- ✅ Facilita evaluación y retroalimentación
- ✅ Permite múltiples iteraciones en una sesión de clase
- ✅ Coherente con ejercicios digitales modernos (TikTok, reels, etc.)
- ⚠️ Puede limitar profundidad argumentativa

**Duración 3 minutos:**
- ✅ Mayor espacio para argumentación profunda
- ✅ Permite desarrollar 3 argumentos extensamente
- ⚠️ Más difícil de mantener atención del estudiante
- ⚠️ Requiere mayor tiempo de producción y evaluación

---

## Decisión

**Se mantiene la duración de 2 minutos** implementada en el documento v6.4 para el Ejercicio 3.4 "Creación de Podcast Argumentativo".

**Estructura definitiva:**
- **Introducción:** 30 segundos (hook + tesis)
- **Desarrollo:** 1 minuto (3 argumentos principales - ~20 seg cada uno)
- **Conclusión:** 30 segundos (síntesis + llamada a la reflexión)
- **Total:** 120 segundos = 2 minutos

Esta decisión fue **confirmada por el Product Owner** el 2025-11-23 durante la validación arquitectónica.

---

## Consecuencias

### Positivas

1. **Coherencia interna del documento**
   - El documento v6.4 ya es completamente coherente con esta duración
   - No requiere cambios en la implementación actual
   - Changelog documenta la evolución de la decisión

2. **Viabilidad pedagógica**
   - Duración adecuada para nivel educativo objetivo
   - Facilita la creación por parte de los estudiantes
   - Reduce fricción en el proceso de aprendizaje

3. **Eficiencia operativa**
   - Evaluación más rápida por parte de profesores
   - Permite escuchar múltiples podcasts en una sesión
   - Facilita retroalimentación ágil

4. **Consistencia con módulo digital**
   - Coherente con Ejercicio 4.3 (Quiz TikTok de 60 segundos)
   - Alineado con tendencias de contenido digital breve
   - Prepara para comunicación efectiva en formatos modernos

5. **Optimización de recursos técnicos**
   - Menor almacenamiento requerido
   - Menor ancho de banda para streaming
   - Tiempos de carga más rápidos

### Negativas

1. **Limitación argumentativa**
   - Menos tiempo para desarrollar argumentos complejos
   - Requiere mayor síntesis por parte del estudiante (puede ser positivo)

2. **Desviación de especificación original**
   - La especificación de referencia mencionaba 3 minutos en algunas secciones
   - Requiere actualizar documentación de referencia externa

### Mitigaciones

1. **Para limitación argumentativa:**
   - Los 3 argumentos pueden desarrollarse efectivamente en ~20 segundos cada uno
   - La síntesis forzada es una habilidad pedagógica valiosa
   - Se proporciona guión estructurado para maximizar uso del tiempo

2. **Para desviación de especificación:**
   - Documentar claramente esta decisión en ADR (este documento)
   - Actualizar especificación de referencia para evitar futuras confusiones
   - Mantener changelog actualizado en versiones futuras del documento

---

## Alternativas Consideradas

### Alternativa 1: Duración de 3 minutos
**Estructura:** Introducción (30s) + Desarrollo (2min) + Conclusión (30s)

**Razones para descarte:**
- Requeriría cambios en documento ya implementado y coherente
- Mayor complejidad de producción para estudiantes
- Menos alineado con formatos digitales modernos
- Evaluación más lenta
- Mayor consumo de recursos técnicos

**Evaluación:** ❌ Descartada

### Alternativa 2: Duración variable (2-3 minutos)
**Estructura:** Rango flexible según complejidad del tema

**Razones para descarte:**
- Introduce ambigüedad en evaluación
- Dificulta estandarización de rúbricas
- Puede generar inequidad en evaluación
- Complica implementación técnica (validaciones)

**Evaluación:** ❌ Descartada

### Alternativa 3: Duración de 2.5 minutos (150 segundos)
**Estructura:** Introducción (30s) + Desarrollo (90s) + Conclusión (30s)

**Razones para descarte:**
- No mejora significativamente sobre 2 minutos
- Introduce complejidad innecesaria (cifra no redonda)
- Requiere cambios al documento actual
- Beneficio marginal vs esfuerzo de cambio

**Evaluación:** ❌ Descartada

---

## Referencias

### Documentación del Proyecto
- [MECANICAS-GAMIFICACION-V6.md](../20-architecture/MECANICAS-GAMIFICACION-V6.md) - Referencia canónica vigente
- [orchestration/reports/README.md](../../orchestration/reports/README.md) - Reportes de validación vigentes

### Changelog Relevante
```markdown
v6.4 (2025-11-23):
- ✅ Ejercicio 3.4: Duración de podcast ajustada a 2 minutos (desarrollo reducido a 1 min)
```

### Análisis Pedagógico
- Formatos de contenido digital educativo modernos tienden a duraciones breves (1-3 minutos)
- TED-Ed videos: promedio 3-5 minutos, pero ejercicios estudiantiles suelen ser más breves
- Ejercicio 4.3 (Quiz TikTok): 60 segundos - coherencia dentro del módulo digital

### Validación
- Usuario/Product Owner confirmó decisión: 2025-11-23
- Architecture-Analyst aprobó coherencia: 2025-11-23

---

## Impacto en Implementación

### Backend
- ✅ Sin cambios requeridos (ya implementado correctamente)
- Validación de duración máxima: 120 segundos
- Almacenamiento de archivos de audio: ~2 MB promedio

### Frontend
- ✅ Sin cambios requeridos
- Timer de grabación: 2 minutos (120 segundos)
- Indicador de progreso dividido en 3 secciones (30s - 60s - 30s)

### Base de Datos
- ✅ Sin cambios requeridos
- Campo `exercise_type`: `podcast_argumentativo`
- Metadatos: `{ "duracion_maxima": 120, "estructura": ["intro_30s", "desarrollo_60s", "conclusion_30s"] }`

### Evaluación
- Rúbrica ajustada a 2 minutos
- Criterios de evaluación:
  - Claridad y estructura: 30%
  - Calidad de argumentos (3 mínimo): 40%
  - Uso de evidencia y citas: 20%
  - Presentación y dicción: 10%

---

## Seguimiento

### Acciones Completadas
- [x] Validación de coherencia interna del documento
- [x] Confirmación con Product Owner
- [x] Creación de ADR-009 (originalmente ADR-001)
- [x] Actualización de reporte de validación
- [x] Consolidación en docs/90-adr/

### Acciones Pendientes
- [ ] Actualizar especificación de referencia externa (si aplica)
- [ ] Comunicar decisión a equipo de desarrollo
- [ ] Validar con equipo pedagógico (opcional)

### Criterios de Revisión
Esta decisión debe revisarse si:
- Feedback de estudiantes indica que 2 minutos es insuficiente (>30% de quejas)
- Evaluaciones muestran argumentos consistentemente superficiales
- Cambios en contexto pedagógico requieren mayor profundidad
- Nuevas tecnologías permiten formatos más largos sin pérdida de atención

---

## Notas Adicionales

### Lecciones Aprendidas
1. **Importancia de coherencia interna:** El documento v6.4 ya había resuelto la contradicción de manera coherente
2. **Valor del changelog:** Documenta la evolución de decisiones de diseño
3. **Consulta con stakeholders:** Confirmación del Product Owner evita implementaciones incorrectas

### Recomendaciones para Futuros Ejercicios
1. Definir duraciones exactas desde el diseño inicial
2. Validar coherencia entre título, descripción y guión
3. Documentar razones pedagógicas de las duraciones elegidas
4. Considerar implementaciones técnicas al definir tiempos

---

**Estado:** ✅ ACEPTADO
**Implementado en:** v6.4
**Fecha Original:** 2025-11-23
**Movido a docs/90-adr/:** 2025-11-23
**Próxima revisión:** 2026-01-23 (o antes si se recibe feedback significativo)

---

**Firma:**
Architecture-Analyst Agent
GAMILIT Platform - Sistema de Gamificación Educativa
2025-11-23
